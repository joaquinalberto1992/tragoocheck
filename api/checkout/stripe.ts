import { quoteCheckout, stripeClient } from '../_shared';

function json(data: unknown, status = 200): Response {
  return Response.json(data, { status });
}

export async function POST(request: Request): Promise<Response> {
  if (request.method !== 'POST') return json({ error: 'Método no permitido.' }, 405);

  try {
    const body = await request.json() as Record<string, unknown>;
    const quote = quoteCheckout(body);
    const stripe = await stripeClient();
    const origin = new URL(request.url).origin;
    const folio = `TC-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const customerName = String(body.customerName || '').trim().slice(0, 120);
    const customerPhone = String(body.customerPhone || '').trim().slice(0, 30);
    const shippingAddress = String(body.shippingAddress || '').trim().slice(0, 200);
    const city = String(body.city || '').trim().slice(0, 80);
    const state = String(body.state || '').trim().slice(0, 80);
    const postalCode = String(body.postalCode || '').trim().slice(0, 12);

    const phoneDigits = customerPhone.replace(/\D/g, '');
    if (!customerName || phoneDigits.length < 10 || phoneDigits.length > 15 || !shippingAddress || !postalCode) {
      return json({ error: 'Completa tus datos de envío antes de pagar.' }, 400);
    }

    const productDescription = quote.lines
      .map((line) => `${line.quantity} × ${line.name}`)
      .concat(quote.subtotal >= 1100 ? ['Regalo: tarjeta extra de 5 stickers'] : [])
      .join(' · ');
    const couponDescription = quote.couponDiscount
      ? `Cupón ${quote.couponCode}: -$${quote.couponDiscount.toLocaleString('es-MX')} MXN`
      : '';
    const lineItems = [{
      price_data: {
        currency: 'mxn',
        product_data: {
          name: 'Pedido Tragoo Check',
          description: [productDescription, couponDescription].filter(Boolean).join(' | ').slice(0, 450),
        },
        unit_amount: Math.round((quote.subtotal - quote.couponDiscount) * 100),
      },
      quantity: 1,
    }];
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
      line_items: lineItems,
      billing_address_collection: 'auto',
      client_reference_id: folio,
      metadata: {
        folio,
        customerName,
        customerPhone,
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
      },
      success_url: `${origin}/?stripe_session={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?stripe_cancelled=1`,
    });

    if (!session.url) return json({ error: 'Stripe no generó el enlace de pago. Intenta otra vez.' }, 502);
    return json({ url: session.url, folio, total: quote.total });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo iniciar el pago.';
    const status = message === 'STRIPE_NOT_CONFIGURED' ? 503 : 400;
    return json({
      error: status === 503
        ? 'El pago con tarjeta aún no está activado. Elige pedir un link por WhatsApp.'
        : message,
    }, status);
  }
}
