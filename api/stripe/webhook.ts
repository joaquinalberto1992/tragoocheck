import type Stripe from 'stripe';
import { track as vercelTrack } from '@vercel/analytics/server';
import { stripeClient } from '../_shared.js';

function json(data: unknown, status = 200): Response {
  return Response.json(data, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

const PAYMENT_EVENTS = new Set([
  'checkout.session.completed',
  'checkout.session.async_payment_succeeded',
  'checkout.session.async_payment_failed',
]);

async function readBodyLimited(request: Request, maxBytes: number): Promise<string> {
  const reader = request.body?.getReader();
  if (!reader) return '';
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    totalBytes += value.byteLength;
    if (totalBytes > maxBytes) {
      await reader.cancel();
      throw new RangeError('Stripe event exceeds the request limit.');
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(bytes);
}

export async function POST(request: Request): Promise<Response> {
  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > 1_048_576) return json({ error: 'Evento de Stripe demasiado grande.' }, 413);
  const signature = request.headers.get('stripe-signature');
  const signingSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !signingSecret) {
    return json({ error: 'Webhook de Stripe no configurado.' }, 503);
  }

  try {
    const stripe = await stripeClient();
    const rawBody = await readBodyLimited(request, 1_048_576);
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, signingSecret);
    } catch {
      return json({ error: 'Firma de Stripe inválida.' }, 400);
    }

    if (!PAYMENT_EVENTS.has(event.type)) return json({ received: true, ignored: true });

    const session = event.data.object as Stripe.Checkout.Session;
    const metadata = session.metadata || {};
    const expectedTotal = Number(metadata.total);
    const expectedAmount = Math.round(expectedTotal * 100);

    if (
      session.mode !== 'payment' ||
      !metadata.folio?.startsWith('TC-') ||
      session.client_reference_id !== metadata.folio ||
      session.currency !== 'mxn' ||
      !Number.isFinite(expectedTotal) ||
      expectedAmount !== session.amount_total
    ) {
      // Ignore other Checkout Sessions that might share this Stripe account.
      return json({ received: true, ignored: true });
    }

    if (metadata.paymentEventId === event.id) return json({ received: true, duplicate: true });

    const paidEvent =
      event.type === 'checkout.session.async_payment_succeeded' ||
      (event.type === 'checkout.session.completed' && session.payment_status === 'paid');
    const failedEvent = event.type === 'checkout.session.async_payment_failed';

    if (!paidEvent && !failedEvent) return json({ received: true, pending: true });
    if (failedEvent && metadata.paymentStatus === 'paid') {
      return json({ received: true, alreadyPaid: true });
    }

    await stripe.checkout.sessions.update(session.id, {
      metadata: {
        ...metadata,
        paymentStatus: paidEvent ? 'paid' : 'failed',
        paymentEventId: event.id,
        paymentEventAt: new Date(event.created * 1000).toISOString(),
      },
    });

    if (paidEvent) {
      const itemParts = (metadata.items || '').split(',').filter(Boolean).map((item) => item.split(':'));
      const itemIds = itemParts.map(([id]) => id).filter(Boolean).join(',').slice(0, 240);
      const itemCount = itemParts.reduce((sum, [, quantity]) => {
        const parsed = Number(quantity);
        return sum + (Number.isInteger(parsed) && parsed > 0 ? parsed : 0);
      }, 0);
      try {
        await vercelTrack('tc_stripe_paid', {
          value: (session.amount_total || 0) / 100,
          context: [
            'currency=MXN',
            'payment_method=stripe',
            `source=${metadata.source || 'direct'}`,
            `medium=${metadata.medium || 'direct'}`,
            `campaign=${metadata.campaign || ''}`,
            `content=${metadata.content || ''}`,
            `quantity=${itemCount}`,
            `items=${itemIds}`,
            `event=${event.id}`,
          ].join('|').slice(0, 255),
        });
      } catch {
        // Analytics outages must not fail or retry a confirmed payment webhook.
      }
    }

    return json({ received: true, paymentStatus: paidEvent ? 'paid' : 'failed' });
  } catch (error) {
    if (error instanceof RangeError) return json({ error: 'Evento de Stripe demasiado grande.' }, 413);
    console.error('[stripe-webhook] Processing failed', error instanceof Error ? error.name : 'UnknownError');
    return json({ error: 'No se pudo procesar el evento de Stripe.' }, 500);
  }
}
