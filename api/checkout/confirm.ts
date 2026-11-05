import { CATALOG, formatMx, stripeClient, WHATSAPP_NUMBER } from '../_shared.js';

function json(data: unknown, status = 200): Response {
  return Response.json(data, {
    status,
    headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' },
  });
}

const confirmAttempts = new Map<string, { count: number; resetAt: number }>();

function confirmRateLimited(request: Request): boolean {
  const forwardedFor = request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for') || '';
  const address = forwardedFor.split(',')[0]?.trim() || 'unknown';
  const now = Date.now();
  const current = confirmAttempts.get(address);
  if (!current || now >= current.resetAt) {
    confirmAttempts.set(address, { count: 1, resetAt: now + 60_000 });
  } else {
    current.count += 1;
    if (current.count > 30) return true;
  }
  if (confirmAttempts.size > 5000) {
    for (const [key, value] of confirmAttempts) {
      if (now >= value.resetAt) confirmAttempts.delete(key);
    }
  }
  return false;
}

export async function GET(request: Request): Promise<Response> {
  if (request.method !== 'GET') return json({ error: 'Método no permitido.' }, 405);
  if (confirmRateLimited(request)) return json({ error: 'Demasiadas consultas. Espera un minuto y vuelve a intentar.' }, 429);
  const sessionId = new URL(request.url).searchParams.get('session_id');
  if (!sessionId || sessionId.length > 255 || !sessionId.startsWith('cs_')) {
    return json({ error: 'Sesión de pago inválida.' }, 400);
  }

  try {
    const stripe = await stripeClient();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.mode !== 'payment' || session.status !== 'complete' || session.payment_status !== 'paid') {
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
