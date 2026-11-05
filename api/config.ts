import {
  getStripeSecretKey,
  getStripeKeyMode,
  isStripeConfiguredForEnvironment,
  WHATSAPP_NUMBER,
} from './_shared.js';

export function GET(_request: Request): Response {
  const key = getStripeSecretKey();
  const keyMode = getStripeKeyMode(key);
  const hasStripeCheckout = isStripeConfiguredForEnvironment(key);
  return Response.json({
    whatsappNumber: WHATSAPP_NUMBER,
    hasStripeCheckout,
    hasLiveStripeKey: keyMode === 'live',
    stripeMode: hasStripeCheckout ? keyMode : 'off',
    hasStripeWebhook: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
    shippingFee: 99,
    freeShippingThreshold: 899,
  }, { headers: { 'Cache-Control': 'no-store, max-age=0' } });
}
