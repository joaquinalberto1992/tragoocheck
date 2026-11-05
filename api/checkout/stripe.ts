import { quoteCheckout, stripeClient } from '../_shared.js';

function json(data: unknown, status = 200): Response {
  return Response.json(data, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

const checkoutAttempts = new Map<string, { count: number; resetAt: number }>();
const CHECKOUT_WINDOW_MS = 60_000;
const CHECKOUT_MAX_ATTEMPTS = 12;

function checkoutRateLimited(request: Request): boolean {
  const forwardedFor = request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for') || '';
  const address = forwardedFor.split(',')[0]?.trim() || 'unknown';
  const now = Date.now();
  const current = checkoutAttempts.get(address);
  if (!current || now >= current.resetAt) {
    checkoutAttempts.set(address, { count: 1, resetAt: now + CHECKOUT_WINDOW_MS });
  } else {
    current.count += 1;
    if (current.count > CHECKOUT_MAX_ATTEMPTS) return true;
  }
  if (checkoutAttempts.size > 5000) {
    for (const [key, value] of checkoutAttempts) {
      if (now >= value.resetAt) checkoutAttempts.delete(key);
    }
  }
  return false;
}

function checkoutOrigin(request: Request): string {
  const requestUrl = new URL(request.url);
  if (process.env.VERCEL_ENV === 'production') return 'https://www.tragoocheck.shop';
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  if (['localhost', '127.0.0.1'].includes(requestUrl.hostname)) return requestUrl.origin;
  return 'https://www.tragoocheck.shop';
}

async function readJsonLimited(request: Request, maxBytes: number): Promise<Record<string, unknown>> {
  const reader = request.body?.getReader();
  if (!reader) throw new Error('La solicitud está vacía.');

  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    totalBytes += value.byteLength;
    if (totalBytes > maxBytes) {
      await reader.cancel();
      throw new RangeError('La solicitud es demasiado grande.');
    }
    chunks.push(value);
  }

  const bytes = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  const parsed = JSON.parse(new TextDecoder().decode(bytes));
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('El formato de la solicitud no es válido.');
  }
  return parsed as Record<string, unknown>;
}

export async function POST(request: Request): Promise<Response> {
  if (request.method !== 'POST') return json({ error: 'Método no permitido.' }, 405);
  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > 16_384) return json({ error: 'La solicitud es demasiado grande.' }, 413);
  if (checkoutRateLimited(request)) return json({ error: 'Demasiados intentos. Espera un minuto y vuelve a intentar.' }, 429);

  try {
    const body = await readJsonLimited(request, 16_384);
    const quote = quoteCheckout(body);
    const stripe = await stripeClient();
    const folio = `TC-${crypto.randomUUID().toUpperCase()}`;
    const customerName = String(body.customerName || '').trim().slice(0, 120);
    const customerPhone = String(body.customerPhone || '').trim().slice(0, 30);
    const customerEmail = String(body.customerEmail || '').trim().slice(0, 254);
    const sendReceiptByEmail = body.sendReceiptByEmail === true;
    const shippingAddress = String(body.shippingAddress || '').trim().slice(0, 200);
    const city = String(body.city || '').trim().slice(0, 80);
    const state = String(body.state || '').trim().slice(0, 80);
    const postalCode = String(body.postalCode || '').trim().slice(0, 12);

    const phoneDigits = customerPhone.replace(/\D/g, '');
    if (
      !customerName ||
      phoneDigits.length < 10 ||
      phoneDigits.length > 15 ||
      !shippingAddress ||
      !city ||
      !state ||
      !/^\d{5}$/.test(postalCode) ||
      (sendReceiptByEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail))
    ) {
      return json({ error: 'Completa tus datos de envío antes de pagar.' }, 400);
    }

    let allocatedDiscount = 0;
    const lineItems = quote.lines.map((line, index) => {
      const grossLineTotal = line.price * line.quantity;
      const discountShare = index === quote.lines.length - 1
        ? quote.couponDiscount - allocatedDiscount
        : quote.subtotal > 0
          ? Math.floor((quote.couponDiscount * grossLineTotal) / quote.subtotal)
          : 0;
      allocatedDiscount += discountShare;

      const productDescription = [
        `${line.quantity} ${line.quantity === 1 ? 'pieza' : 'piezas'}`,
        discountShare > 0
          ? `Cupón ${quote.couponCode}: ahorro $${discountShare.toLocaleString('es-MX')} MXN`
          : '',
        index === quote.lines.length - 1 && quote.subtotal >= 1100
          ? 'Incluye tarjeta extra de 5 stickers de regalo'
          : '',
      ].filter(Boolean).join(' · ');

      return {
        price_data: {
          currency: 'mxn',
          product_data: {
            name: line.quantity > 1 ? `${line.name} × ${line.quantity}` : line.name,
            description: productDescription,
          },
          unit_amount: (grossLineTotal - discountShare) * 100,
        },
        quantity: 1,
      };
    });

    if (quote.shipping > 0) {
      lineItems.push({
        price_data: {
          currency: 'mxn',
          product_data: { name: 'Envío Express', description: 'Envío del pedido' },
          unit_amount: quote.shipping * 100,
        },
        quantity: 1,
      });
    }

    const itemsMetadata = quote.lines.map((line) => `${line.id}:${line.quantity}`).join(',');
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      locale: 'es',
      submit_type: 'pay',
      allowed_payment_method_types: ['card'],
      line_items: lineItems,
      billing_address_collection: 'auto',
      ...(sendReceiptByEmail ? { customer_email: customerEmail } : {}),
      ...(sendReceiptByEmail ? { payment_intent_data: { receipt_email: customerEmail } } : {}),
      client_reference_id: folio,
      metadata: {
        folio,
        customerName,
        customerPhone,
        customerEmail: sendReceiptByEmail ? customerEmail : '',
        sendReceiptByEmail: String(sendReceiptByEmail),
        shippingAddress,
        city,
        state,
        postalCode,
        items: itemsMetadata,
        subtotal: String(quote.subtotal),
        couponCode: quote.couponCode,
        couponDiscount: String(quote.couponDiscount),
        shipping: String(quote.shipping),
        total: String(quote.total),
        paymentStatus: 'pending',
      },
      success_url: `${checkoutOrigin(request)}/?stripe_session={CHECKOUT_SESSION_ID}`,
      cancel_url: `${checkoutOrigin(request)}/?stripe_cancelled=1`,
    });

    if (!session.url) return json({ error: 'Stripe no generó el enlace de pago. Intenta otra vez.' }, 502);
    return json({ url: session.url, folio, total: quote.total });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo iniciar el pago.';
    const status = message === 'STRIPE_NOT_CONFIGURED' ? 503 : error instanceof RangeError ? 413 : 400;
    return json({
      error: status === 503
        ? 'El pago con tarjeta aún no está activado. Elige pedir un link por WhatsApp.'
        : message,
    }, status);
  }
}
