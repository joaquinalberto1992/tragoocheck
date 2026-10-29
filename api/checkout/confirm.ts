import { CATALOG, formatMx, stripeClient, WHATSAPP_NUMBER } from '../_shared';

function json(data: unknown, status = 200): Response {
  return Response.json(data, { status });
}

export async function GET(request: Request): Promise<Response> {
  if (request.method !== 'GET') return json({ error: 'Método no permitido.' }, 405);
  const sessionId = new URL(request.url).searchParams.get('session_id');
  if (!sessionId || !sessionId.startsWith('cs_')) return json({ error: 'Sesión de pago inválida.' }, 400);

  try {
    const stripe = stripeClient();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== 'paid') {
      return json({ paid: false, error: 'Stripe todavía no confirma el pago.' }, 402);
    }

    const meta = session.metadata || {};
    const expectedTotal = Number(meta.total);
    if (
      !meta.folio?.startsWith('TC-') ||
      session.client_reference_id !== meta.folio ||
      session.currency !== 'mxn' ||
      !Number.isFinite(expectedTotal) ||
      Math.round(expectedTotal * 100) !== session.amount_total
    ) {
      return json({ error: 'Los datos de esta sesión no corresponden al pedido.' }, 400);
    }
    const folio = meta.folio || session.client_reference_id || 'Tragoo Check';
    const lines = (meta.items || '').split(',').filter(Boolean).map((encoded) => {
      const [id, count] = encoded.split(':');
      const product = CATALOG[id];
      const quantity = Number(count);
      return product && Number.isInteger(quantity) && quantity > 0
        ? `• ${quantity} × ${product.name}`
        : null;
    }).filter(Boolean);
    if (Number(meta.subtotal) >= 1100 && !lines.some((line) => line?.includes('Regalo:'))) {
      lines.push('• Regalo: tarjeta extra de 5 stickers');
    }

    const total = (session.amount_total || 0) / 100;
    const whatsappText = [
      `Hola Tragoo Check. Ya completé el pago con tarjeta por Stripe.`,
      `Folio: ${folio}`,
      `Productos:`,
      ...lines,
      `Subtotal: $${formatMx(Number(meta.subtotal || 0))} MXN`,
      ...(Number(meta.couponDiscount) > 0
        ? [`Cupón ${meta.couponCode}: -$${formatMx(Number(meta.couponDiscount))} MXN`]
        : []),
      `Envío: ${Number(meta.shipping) === 0 ? 'GRATIS' : `$${formatMx(Number(meta.shipping))} MXN`}`,
      `Total pagado: $${formatMx(total)} MXN`,
      `Nombre: ${meta.customerName || ''}`,
      `WhatsApp: ${meta.customerPhone || ''}`,
      `Dirección: ${meta.shippingAddress || ''}`,
      `Ciudad/Estado: ${meta.city || ''}, ${meta.state || ''} · CP ${meta.postalCode || ''}`,
      `¿Me confirman el pedido y el envío por favor?`,
    ].join('\n');

    return json({
      paid: true,
      folio,
      total,
      whatsappUrl: `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappText)}`,
    });
  } catch {
    return json({ error: 'No pudimos verificar esta sesión con Stripe.' }, 400);
  }
}
