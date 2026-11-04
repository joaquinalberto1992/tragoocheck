import {
  getStripeKeyMode,
  isStripeConfiguredForEnvironment,
  WHATSAPP_NUMBER,
} from './_shared.js';

function isValidClabe(value: string): boolean {
  if (!/^\d{18}$/.test(value)) return false;
  const weights = [3, 7, 1];
  const sum = [...value.slice(0, 17)].reduce(
    (total, digit, index) => total + (Number(digit) * weights[index % weights.length]) % 10,
    0,
  );
  return (10 - (sum % 10)) % 10 === Number(value[17]);
}

export function GET(_request: Request): Response {
  const key = process.env.STRIPE_SECRET_KEY || '';
  const keyMode = getStripeKeyMode(key);
  const hasStripeCheckout = isStripeConfiguredForEnvironment(key);
  const clabe = (process.env.MERCHANT_CLABE || '').replace(/\D/g, '');
  const hasSpeiAccount = isValidClabe(clabe);
  return Response.json({
    whatsappNumber: WHATSAPP_NUMBER,
    hasStripeCheckout,
    hasLiveStripeKey: keyMode === 'live',
    stripeMode: hasStripeCheckout ? keyMode : 'off',
    hasStripeWebhook: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
    hasSpeiAccount,
    bankName: hasSpeiAccount ? process.env.MERCHANT_BANK_NAME || '' : '',
    clabe: hasSpeiAccount ? clabe : '',
    accountHolder: hasSpeiAccount ? process.env.MERCHANT_ACCOUNT_HOLDER || '' : '',
    shippingFee: 99,
    freeShippingThreshold: 899,
    speiDiscountPercent: 5,
  }, { headers: { 'Cache-Control': 'no-store, max-age=0' } });
}
