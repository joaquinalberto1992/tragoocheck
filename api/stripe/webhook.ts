import type Stripe from 'stripe';
import { stripeClient } from '../_shared.js';

function json(data: unknown, status = 200): Response {
  return Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
}

const PAYMENT_EVENTS = new Set([
  'checkout.session.completed',
  'checkout.session.async_payment_succeeded',
  'checkout.session.async_payment_failed',
]);

export async function POST(request: Request): Promise<Response> {
  const signature = request.headers.get('stripe-signature');
  const signingSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !signingSecret) {
    return json({ error: 'Webhook de Stripe no configurado.' }, 503);
  }

  try {
    const stripe = await stripeClient();
    const rawBody = await request.text();
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

    return json({ received: true, paymentStatus: paidEvent ? 'paid' : 'failed' });
  } catch (error) {
    console.error('[stripe-webhook] Processing failed', error instanceof Error ? error.name : 'UnknownError');
    return json({ error: 'No se pudo procesar el evento de Stripe.' }, 500);
  }
}
