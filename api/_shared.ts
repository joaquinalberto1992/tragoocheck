import Stripe from 'stripe';

export const WHATSAPP_NUMBER = process.env.WHATSAPP_NUMBER || '524792293687';

export const CATALOG: Record<string, { name: string; price: number }> = {
  'kit-noche-completa': { name: 'Kit Noche Completa (1 Pieza)', price: 449 },
  'kit-stickers': { name: 'Kit Stickers Para Uñas (10 pzas)', price: 249 },
  'kit-tiras': { name: 'Kit Tiras Reactivas (5 pzas)', price: 299 },
  'kit-recarga-total': { name: 'Kit Recarga Total (Refill 30 Pruebas)', price: 549 },
  'pack-amigas-2x': { name: 'Pack Dúo Noche Segura (2x Kits Completos)', price: 799 },
  'pack-trio-amigas-3x': { name: 'Pack Trío Amigas & Festival (3x Kits Completos)', price: 1125 },
  'pack-squad-5x': { name: 'Pack Squad Fiesta (5x Kits Noche Completa)', price: 1745 },
  'pack-vip-10x': { name: 'Pack VIP Despedida / Graduación (10x Kits Completos)', price: 3190 },
  'mayoreo-caja-15': { name: 'Mayoreo Nivel 1: Caja Emprendedor (15 Kits Completos)', price: 4350 },
  'mayoreo-exhibidor-30': { name: 'Mayoreo Nivel 2: Caja Exhibidora (30 Kits)', price: 7800 },
  'mayoreo-master-60': { name: 'Mayoreo Nivel 3: Master Box (60 Kits Completos)', price: 13800 },
  'mayoreo-premium-120': { name: 'Mayoreo Premium Nivel 4 (120 Kits)', price: 24600 },
  'mayoreo-super-250': { name: 'Super Mayorista Nivel 5 (250 Kits)', price: 46250 },
  'mayoreo-mega-500': { name: 'Mega Master Nivel 6 (500 Kits)', price: 82500 },
  'popotes-prueba-10': { name: 'Popotes de Prueba · Paquete de 10', price: 599 },
  'popotes-prueba-20': { name: 'Popotes de Prueba · Paquete de 20', price: 1499 },
  'popotes-prueba-30': { name: 'Popotes de Prueba · Paquete de 30', price: 2299 },
  'repuestos-pulseras-30': { name: 'Repuestos exclusivos para pulseras (30 parches)', price: 1589 },
  'pulsera-individual': { name: 'Pulsera Individual', price: 599 },
  'pulseras-trio': { name: 'Pack Trío de Pulseras', price: 1499 },
  'pulseras-grupo': { name: 'Pack Grupo de Pulseras', price: 2299 },
  'regalo-stickers-5': { name: 'Regalo: tarjeta extra de 5 stickers', price: 0 },
};

const COUPONS: Record<string, { percent: number; minimum: number }> = {
  HOY10: { percent: 10, minimum: 449 },
  AMIGAS15: { percent: 15, minimum: 1100 },
  SOCIOB2B: { percent: 8, minimum: 4350 },
};

export function stripeClient(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key?.startsWith('sk_')) throw new Error('STRIPE_NOT_CONFIGURED');
  if (process.env.VERCEL_ENV === 'production' && !key.startsWith('sk_live_')) {
    throw new Error('STRIPE_NOT_CONFIGURED');
  }
  return new Stripe(key);
}

function unitPrice(id: string, quantity: number): number {
  if (id === 'kit-noche-completa') {
    if (quantity >= 500) return 165;
    if (quantity >= 250) return 185;
    if (quantity >= 120) return 205;
    if (quantity >= 60) return 230;
    if (quantity >= 30) return 260;
    if (quantity >= 15) return 290;
    if (quantity >= 10) return 319;
    if (quantity >= 5) return 349;
    if (quantity >= 3) return 375;
    if (quantity === 2) return 399.5;
  }
  if (id === 'kit-stickers') {
    if (quantity >= 60) return 128;
    if (quantity >= 30) return 144;
    if (quantity >= 15) return 161;
    if (quantity >= 5) return 199;
    if (quantity >= 3) return 219;
    if (quantity === 2) return 229;
  }
  if (id === 'kit-tiras') {
    if (quantity >= 60) return 154;
    if (quantity >= 30) return 174;
    if (quantity >= 15) return 194;
    if (quantity >= 5) return 239;
    if (quantity >= 3) return 259;
    if (quantity === 2) return 275;
  }
  return CATALOG[id].price;
}

export interface CheckoutLine {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface CheckoutQuote {
  lines: CheckoutLine[];
  subtotal: number;
  couponCode: string;
  couponPercent: number;
  couponDiscount: number;
  shipping: number;
  total: number;
}

export function quoteCheckout(input: unknown): CheckoutQuote {
  const body = input as { items?: unknown; couponCode?: unknown };
  if (!Array.isArray(body?.items) || body.items.length === 0 || body.items.length > 30) {
    throw new Error('Agrega productos al carrito para continuar.');
  }

  const quantities = new Map<string, number>();
  for (const raw of body.items) {
    const item = raw as { id?: unknown; quantity?: unknown };
    if (typeof item.id !== 'string' || !CATALOG[item.id] || item.id === 'regalo-stickers-5') {
      throw new Error('Hay un producto no válido en el pedido.');
    }
    const quantity = Number(item.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 500) {
      throw new Error('La cantidad de un producto no es válida.');
    }
    quantities.set(item.id, (quantities.get(item.id) || 0) + quantity);
  }

  const lines: CheckoutLine[] = [...quantities.entries()].map(([id, quantity]) => ({
    id,
    name: CATALOG[id].name,
    price: unitPrice(id, quantity),
    quantity,
  }));
  const subtotal = Math.round(lines.reduce((sum, line) => sum + line.price * line.quantity, 0));

  const couponCode = typeof body.couponCode === 'string' ? body.couponCode.trim().toUpperCase() : '';
  const coupon = couponCode ? COUPONS[couponCode] : undefined;
  if (couponCode && !coupon) throw new Error('El código de descuento no es válido.');
  if (coupon && subtotal < coupon.minimum) {
    throw new Error(`El cupón ${couponCode} aplica a partir de $${coupon.minimum.toLocaleString('es-MX')} MXN en productos.`);
  }

  const couponDiscount = coupon ? Math.round((subtotal * coupon.percent) / 100) : 0;
  const shipping = subtotal >= 899 ? 0 : 99;
  return {
    lines,
    subtotal,
    couponCode,
    couponPercent: coupon?.percent || 0,
    couponDiscount,
    shipping,
    total: Math.max(0, subtotal - couponDiscount + shipping),
  };
}

export function formatMx(amount: number): string {
  return amount.toLocaleString('es-MX', { maximumFractionDigits: 2 });
}
