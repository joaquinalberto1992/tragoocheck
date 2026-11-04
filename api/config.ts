import {
  getStripeKeyMode,
  isStripeConfiguredForEnvironment,
  WHATSAPP_NUMBER,
} from './_shared.js';

export function GET(_request: Request): Response {
  const key = process.env.STRIPE_SECRET_KEY || '';
  const keyMode = getStripeKeyMode(key);
  const hasStripeCheckout = isStripeConfiguredForEnvironment(key);
  return Response.json({
    whatsappNumber: WHATSAPP_NUMBER,
    hasStripeCheckout,
    hasLiveStripeKey: keyMode === 'live',
    stripeMode: hasStripeCheckout ? keyMode : 'off',
    hasStripeWebhook: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
    bankName: 'BBVA México / STP (SPEI) / OXXO',
    clabe: process.env.MERCHANT_CLABE || '012180015489203148',
    accountHolder: 'Tragoo Check México',
    shippingFee: 99,
    freeShippingThreshold: 899,
    speiDiscountPercent: 5,
  }, { headers: { 'Cache-Control': 'no-store, max-age=0' } });
}
