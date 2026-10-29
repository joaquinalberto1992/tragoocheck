import { WHATSAPP_NUMBER } from './_shared.js';

export function GET(_request: Request): Response {
  const key = process.env.STRIPE_SECRET_KEY || '';
  const production = process.env.VERCEL_ENV === 'production';
  const hasStripeCheckout = key.startsWith('sk_') && (!production || key.startsWith('sk_live_'));
  return Response.json({
    whatsappNumber: WHATSAPP_NUMBER,
    hasStripeCheckout,
    hasLiveStripeKey: key.startsWith('sk_live_'),
    bankName: 'BBVA México / STP (SPEI) / OXXO',
    clabe: process.env.MERCHANT_CLABE || '012180015489203148',
    accountHolder: 'Tragoo Check México',
    shippingFee: 99,
    freeShippingThreshold: 899,
    speiDiscountPercent: 5,
  });
}
