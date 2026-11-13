import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Minus,
  Trash2,
  Copy,
  Check,
  CreditCard,
  Landmark,
  Truck,
  MessageCircle,
  Sparkles,
  Tag,
  Gift,
  CheckCircle2,
} from 'lucide-react';
import { ProductKit, ALL_PRODUCTS, getActiveCoupons, PromoCoupon } from '../data/products';
import {
  getBuenFinFreeShippingThreshold,
  isBuenFinActive,
  REGULAR_FREE_SHIPPING_THRESHOLD,
} from '../data/promotionRules';
import { DELIVERY_ESTIMATE, RETURN_POLICY } from '../data/storePolicies';
import { getCampaignAttribution, trackCommerceEvent } from '../lib/analytics';

export interface CartItem {
  product: ProductKit;
  quantity: number;
}

export interface MerchantConfigClient {
  cardNumberRef: string;
  whatsappNumber: string;
  instagramUrl?: string;
  customDomain?: string;
  videoUrl?: string;
  shippingFee: number;
  freeShippingThreshold: number;
  hasLiveStripeKey?: boolean;
  hasStripeCheckout?: boolean;
  hasStripeWebhook?: boolean;
  stripeMode?: 'test' | 'live' | 'off';
}

export type OrderPaymentMethod = 'link_pago' | 'stripe' | 'transferencia';

export interface ConfirmedOrder {
  folio: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress: string;
  city: string;
  state: string;
  postalCode: string;
  items: { id: string; name: string; price: number; quantity: number }[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  couponDiscount?: number;
  shipping: number;
  total: number;
  paymentMethod: OrderPaymentMethod;
  paymentStatus: 'pendiente_comprobante' | 'pagado' | 'enviado';
  transferReference?: string;
  stripeLast4?: string;
  trackingNumber?: string;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onAddProduct: (product: ProductKit) => void;
  onClearCart: () => void;
  merchantConfig: MerchantConfigClient;
  onOrderCreated: (order: ConfirmedOrder) => void;
  initialCouponCode?: string | null;
}

// Helper: Strictly decreasing unit price when buying multiple individual items
const CHRISTMAS_CUP_IDS = new Set([
  'vaso-inteligente-navidad',
  'vaso-led-navidad-800',
  'vaso-led-navidad-600',
  'vaso-led-navidad-450',
  'vaso-led-navidad-350',
  'vaso-led-navidad-250',
]);

function getEffectiveUnitPrice(
  product: ProductKit,
  quantity: number,
  christmasCupQuantity = quantity
): number {
  if (product.id === 'kit-noche-completa') {
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
    return 449;
  }
  if (product.id === 'kit-stickers') {
    if (quantity >= 60) return 128;
    if (quantity >= 30) return 144;
    if (quantity >= 15) return 161;
    if (quantity >= 5) return 199;
    if (quantity >= 3) return 219;
    if (quantity === 2) return 229;
    return 249;
  }
  if (product.id === 'kit-tiras') {
    if (quantity >= 60) return 154;
    if (quantity >= 30) return 174;
    if (quantity >= 15) return 194;
    if (quantity >= 5) return 239;
    if (quantity >= 3) return 259;
    if (quantity === 2) return 275;
    return 299;
  }
  if (CHRISTMAS_CUP_IDS.has(product.id)) {
    const discount = christmasCupQuantity >= 6 ? 0.12
      : christmasCupQuantity >= 4 ? 0.08
        : christmasCupQuantity >= 2 ? 0.05 : 0;
    return Math.round(product.price * (1 - discount));
  }
  return product.price;
}

export function normalizeWhatsAppPhone(rawPhone?: string): string {
  const digits = (rawPhone || '524792293687').replace(/\D/g, '');
  if (digits.length === 10) return `52${digits}`;
  if (digits.startsWith('521') && digits.length === 13) {
    return `52${digits.slice(3)}`;
  }
  return digits || '524792293687';
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onAddProduct,
  onClearCart,
  merchantConfig,
  onOrderCreated,
  initialCouponCode,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<OrderPaymentMethod>(
    merchantConfig.hasStripeCheckout ? 'stripe' : 'link_pago'
  );
  const [checkoutNow, setCheckoutNow] = useState(() => Date.now());
  const [copiedOrderText, setCopiedOrderText] = useState(false);

  // Coupon state
  const [appliedCoupon, setAppliedCoupon] = useState<PromoCoupon | null>(null);
  const [couponFeedback, setCouponFeedback] = useState<string | null>(null);
  const activeCoupons = getActiveCoupons(checkoutNow);

  useEffect(() => {
    if (!isOpen) return;
    const interval = window.setInterval(() => setCheckoutNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [isOpen]);

  useEffect(() => {
    if (initialCouponCode) {
      const found = getActiveCoupons().find(
        (c) => c.code.toUpperCase() === initialCouponCode.toUpperCase()
      );
      if (found) {
        setAppliedCoupon(found);
      }
    }
  }, [initialCouponCode]);

  // Customer shipping state
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [sendReceiptByEmail, setSendReceiptByEmail] = useState(true);
  const [shippingAddress, setShippingAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [postalCode, setPostalCode] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<ConfirmedOrder | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPaymentMethod(merchantConfig.hasStripeCheckout ? 'stripe' : 'link_pago');
    }
  }, [isOpen, merchantConfig.hasStripeCheckout]);

  useEffect(() => {
    if (appliedCoupon && !getActiveCoupons(checkoutNow).some((coupon) => coupon.code === appliedCoupon.code)) {
      setAppliedCoupon(null);
      setCouponFeedback('El periodo de esta promoción terminó. Revisa los códigos vigentes.');
    }
  }, [appliedCoupon, checkoutNow]);

  if (!isOpen) return null;

  const christmasCupQuantity = cart.reduce(
    (sum, item) => sum + (CHRISTMAS_CUP_IDS.has(item.product.id) ? item.quantity : 0),
    0
  );

  const subtotal = Math.round(
    cart.reduce(
      (acc, item) =>
        acc + getEffectiveUnitPrice(item.product, item.quantity, christmasCupQuantity) * item.quantity,
      0
    )
  );

  const effectiveThreshold = isBuenFinActive(checkoutNow)
    ? getBuenFinFreeShippingThreshold(checkoutNow)
    : Math.max(
        REGULAR_FREE_SHIPPING_THRESHOLD,
        merchantConfig.freeShippingThreshold || REGULAR_FREE_SHIPPING_THRESHOLD
      );
  const qualifiesFreeShipping = subtotal >= effectiveThreshold;
  const shipping =
    cart.length === 0
      ? 0
      : qualifiesFreeShipping
      ? 0
      : merchantConfig.shippingFee || 99;

  // Coupon discount calculation
  const isCouponValidForSubtotal =
    appliedCoupon && subtotal >= appliedCoupon.minPurchase;
  const couponDiscount = isCouponValidForSubtotal
    ? Math.round(subtotal * appliedCoupon.discountPercent) / 100
    : 0;

  const totalDiscount = couponDiscount;
  const total = Math.max(0, subtotal - totalDiscount + shipping);

  const amountForFreeShipping = Math.max(0, effectiveThreshold - subtotal);
  const unlocksFreeGift = subtotal >= 1100;

  const handleApplyCouponCode = (codeToApply: string) => {
    const clean = codeToApply.trim().toUpperCase();
    const found = getActiveCoupons().find((c) => c.code === clean);
    if (!found) {
      setCouponFeedback(`Código no válido. Usa ${getActiveCoupons().map((coupon) => coupon.code).join(', ')}.`);
      return;
    }
    setAppliedCoupon(found);
    trackCommerceEvent('select_promotion', {
      value: total,
      coupon: found.code,
      items: cart.map(({ product, quantity }) => ({
        id: product.id,
        name: product.name,
        price: getEffectiveUnitPrice(product, quantity, christmasCupQuantity),
        quantity,
        category: product.category,
      })),
    });
    if (subtotal < found.minPurchase) {
      setCouponFeedback(
        `Cupón ${found.code} seleccionado (válido desde $${found.minPurchase.toLocaleString(
          'es-MX'
        )} MXN).`
      );
    } else {
      setCouponFeedback(`¡Cupón ${found.code} (-${found.discountPercent}%) aplicado!`);
    }
  };

  const selectPaymentMethod = (method: OrderPaymentMethod) => {
    setPaymentMethod(method);
    const paymentItems = cart.map(({ product, quantity }) => ({
        id: product.id,
        name: product.name,
        price: getEffectiveUnitPrice(product, quantity, christmasCupQuantity),
        quantity,
        category: product.category,
      }));
    trackCommerceEvent('payment_method_selected', {
      value: total,
      method,
      items: paymentItems,
    });
  };

  const buildOrderItemsPayload = () => {
    const baseItems = cart.map((i) => ({
      id: i.product.id,
      name: i.product.name,
      price: getEffectiveUnitPrice(i.product, i.quantity, christmasCupQuantity),
      quantity: i.quantity,
    }));
    if (unlocksFreeGift) {
      baseItems.push({
        id: 'regalo-stickers-5',
        name: 'REGALO: Tarjeta Extra 5 Stickers Uñas',
        price: 0,
        quantity: 1,
      });
    }
    return baseItems;
  };

  const getPaymentMethodTitle = (method: OrderPaymentMethod) => {
    if (method === 'stripe') return 'Pago con tarjeta procesado por Stripe';
    if (method === 'transferencia') return 'Transferencia bancaria (datos solicitados por WhatsApp)';
    return 'Link de Pago con Tarjeta (Solicito link de pago por WhatsApp)';
  };

  const buildWhatsAppMessageText = (order: ConfirmedOrder) => {
    const instagramSource = ['ig', 'instagram'].includes(
      new URLSearchParams(window.location.search).get('utm_source')?.toLowerCase() || ''
    );
    const itemsLines = order.items
      .map(
        (i) =>
          `• ${i.quantity}x ${i.name} ($${(i.price * i.quantity).toLocaleString(
            'es-MX'
          )} MXN)`
      )
      .join('\n');

    return [
      `Hola *Tragoo Check*! Quiero confirmar mi pedido *${order.folio}*:`,
      ``,
      `*Productos:*`,
      itemsLines,
      ``,
      `*Resumen de cobro:*`,
      `• Subtotal: $${order.subtotal.toLocaleString('es-MX')} MXN`,
      ...(order.couponDiscount
        ? [`• Cupón ${order.couponCode}: -$${order.couponDiscount.toLocaleString('es-MX')} MXN`]
        : []),
      `• Envío: ${
        order.shipping === 0
          ? `GRATIS (Pedido >= $${effectiveThreshold.toLocaleString('es-MX')} MXN)`
          : `$${order.shipping} MXN`
      }`,
      `• Entrega estimada: ${DELIVERY_ESTIMATE} desde la confirmación del pago`,
      `• *TOTAL A PAGAR: $${order.total.toLocaleString('es-MX')} MXN*`,
      ...(instagramSource ? [`• Canal: Instagram`] : []),
      ...(order.customerName ? [`• Nombre: ${order.customerName}`] : []),
      ...(order.customerPhone ? [`• WhatsApp: ${order.customerPhone}`] : []),
      ...(order.customerEmail ? [`• Correo para comprobante: ${order.customerEmail}`] : []),
      ...(order.shippingAddress ? [`• Dirección de entrega: ${order.shippingAddress}`] : []),
      ...(order.city || order.state || order.postalCode
        ? [`• Ciudad/Estado/CP: ${order.city}, ${order.state} · ${order.postalCode}`]
        : []),
      ``,
      `*Método de pago elegido:*`,
      `👉 *${getPaymentMethodTitle(order.paymentMethod)}*`,
      ``,
      order.paymentStatus === 'pagado' && order.paymentMethod === 'stripe'
        ? `El pago ya aparece confirmado por Stripe. ¿Me confirmas la recepción del pedido? ¡Gracias!`
        : order.paymentStatus === 'pagado'
          ? `Ya realicé el pago de este pedido. Te comparto el comprobante por aquí para confirmar la recepción. ¡Gracias!`
          : order.paymentMethod === 'transferencia'
            ? `Aún no he realizado la transferencia. ¿Me compartes por aquí los datos bancarios y confirmas el total? Enviaré el comprobante en este mismo chat. ¡Gracias!`
            : `¿Me confirmas disponibilidad y me compartes el link de pago por aquí? ¡Gracias!`,
    ].join('\n');
  };

  const buildWhatsAppUrl = (order: ConfirmedOrder) => {
    const cleanPhone = normalizeWhatsAppPhone(merchantConfig.whatsappNumber);
    const text = buildWhatsAppMessageText(order);
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
  };

  const handleSendOrderToWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !customerName.trim() ||
      !customerPhone.trim() ||
      !shippingAddress.trim() ||
      !city.trim() ||
      !stateName.trim() ||
      !postalCode.trim() ||
      (sendReceiptByEmail && !customerEmail.trim())
    ) {
      trackCommerceEvent('checkout_validation_error', { method: paymentMethod });
      setErrorMsg(
        'Completa tu nombre, WhatsApp y dirección de entrega. Agrega un correo si quieres recibir el comprobante.'
      );
      return;
    }
    if (sendReceiptByEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim())) {
      setErrorMsg('Escribe un correo válido para enviarte el comprobante.');
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);

    const analyticsItems = cart.map(({ product, quantity }) => ({
      id: product.id,
      name: product.name,
      price: getEffectiveUnitPrice(product, quantity, christmasCupQuantity),
      quantity,
      category: product.category,
    }));
    trackCommerceEvent('add_shipping_info', {
      value: total,
      method: paymentMethod,
      coupon: couponDiscount > 0 ? appliedCoupon?.code : undefined,
      items: analyticsItems,
    });

    const generatedFolio = `TC-${crypto.randomUUID().toUpperCase()}`;

    const orderPayload: ConfirmedOrder = {
      folio: generatedFolio,
      createdAt: new Date().toISOString(),
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: sendReceiptByEmail ? customerEmail.trim() : '',
      shippingAddress: shippingAddress.trim(),
      city: city.trim() || stateName.trim(),
      state: stateName.trim(),
      postalCode: postalCode.trim(),
      items: buildOrderItemsPayload(),
      subtotal,
      discount: totalDiscount,
      couponCode: couponDiscount > 0 ? appliedCoupon?.code : undefined,
      couponDiscount,
      shipping,
      total,
      paymentMethod,
      paymentStatus: 'pendiente_comprobante',
      transferReference:
        paymentMethod === 'link_pago'
          ? 'Link de Pago vía WhatsApp'
          : paymentMethod === 'transferencia'
            ? 'Datos bancarios solicitados por WhatsApp'
            : undefined,
    };

    try {
      if (paymentMethod === 'stripe') {
        const res = await fetch('/api/checkout/stripe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            folio: orderPayload.folio,
            items: cart.map(({ product, quantity }) => ({ id: product.id, quantity })),
            couponCode: couponDiscount > 0 ? appliedCoupon?.code : '',
            customerName: orderPayload.customerName,
            customerPhone: orderPayload.customerPhone,
            customerEmail: orderPayload.customerEmail,
            sendReceiptByEmail,
            shippingAddress: orderPayload.shippingAddress,
            city: orderPayload.city,
            state: orderPayload.state,
            postalCode: orderPayload.postalCode,
          }),
        });
        const checkout = await res.json();
        if (!res.ok || !checkout.url) {
          throw new Error(checkout.error || 'No se pudo iniciar el pago con tarjeta.');
        }

        sessionStorage.setItem(
          'tragoo-pending-stripe',
          JSON.stringify({
            folio: checkout.folio,
            couponCode: couponDiscount > 0 ? appliedCoupon?.code : undefined,
            items: cart.map(({ product, quantity }) => ({ id: product.id, quantity })),
            ...getCampaignAttribution(),
          })
        );
        trackCommerceEvent('add_payment_info', {
          value: total,
          method: 'card',
          coupon: couponDiscount > 0 ? appliedCoupon?.code : undefined,
          items: analyticsItems,
        });
        trackCommerceEvent('checkout_redirect', {
          value: total,
          method: 'stripe',
          coupon: couponDiscount > 0 ? appliedCoupon?.code : undefined,
          items: analyticsItems,
        });
        window.location.assign(checkout.url);
        return;
      }

      setConfirmedOrder(orderPayload);
      onOrderCreated(orderPayload);
      onClearCart();
      trackCommerceEvent('whatsapp_order_request', {
        value: total,
        method: paymentMethod,
        coupon: couponDiscount > 0 ? appliedCoupon?.code : undefined,
        items: analyticsItems,
      });
      trackCommerceEvent('generate_lead', {
        value: total,
        method: paymentMethod,
        items: analyticsItems,
      });

      // Open WhatsApp directly (works on Android, iOS Safari & Desktop)
      const waUrl = buildWhatsAppUrl(orderPayload);
      window.location.href = waUrl;
    } catch (err) {
      if (paymentMethod === 'stripe') {
        trackCommerceEvent('checkout_error', { value: total, method: 'stripe', items: analyticsItems });
        setErrorMsg(
          err instanceof Error ? err.message : 'No se pudo iniciar el pago con Stripe.'
        );
        return;
      }
      setConfirmedOrder(orderPayload);
      onOrderCreated(orderPayload);
      onClearCart();
      trackCommerceEvent('whatsapp_order_request', {
        value: total,
        method: paymentMethod,
        coupon: couponDiscount > 0 ? appliedCoupon?.code : undefined,
        items: analyticsItems,
      });
      trackCommerceEvent('generate_lead', {
        value: total,
        method: paymentMethod,
        items: analyticsItems,
      });
      window.location.href = buildWhatsAppUrl(orderPayload);
    } finally {
      setIsSubmitting(false);
    }
  };

  const upsellProduct = ALL_PRODUCTS.find((p) => p.id === 'kit-stickers');
  const upsellCartItem = upsellProduct
    ? cart.find((item) => item.product.id === upsellProduct.id)
    : undefined;
  const currentUpsellQuantity = upsellCartItem?.quantity || 0;
  const currentUpsellSubtotal = upsellProduct && currentUpsellQuantity
    ? Math.round(getEffectiveUnitPrice(upsellProduct, currentUpsellQuantity) * currentUpsellQuantity)
    : 0;
  let upsellQuantity = 0;
  if (upsellProduct && !qualifiesFreeShipping) {
    for (let quantity = 1; quantity <= 10; quantity += 1) {
      const proposedQuantity = currentUpsellQuantity + quantity;
      const proposedSubtotal =
        subtotal - currentUpsellSubtotal +
        Math.round(getEffectiveUnitPrice(upsellProduct, proposedQuantity) * proposedQuantity);
      if (proposedSubtotal >= effectiveThreshold) {
        upsellQuantity = quantity;
        break;
      }
    }
  }
  const upsellAddedCost = upsellProduct && upsellQuantity
    ? Math.round(
        getEffectiveUnitPrice(upsellProduct, currentUpsellQuantity + upsellQuantity) *
          (currentUpsellQuantity + upsellQuantity) -
          currentUpsellSubtotal
      )
    : 0;

  const cartProductIds = new Set(cart.map((item) => item.product.id));
  const cartHasChristmasCup = cart.some((item) => CHRISTMAS_CUP_IDS.has(item.product.id));
  const cartHasBracelet = cart.some((item) =>
    item.product.id.startsWith('pulsera') || item.product.id === 'repuestos-pulseras-30'
  );
  const crossSellCandidates = cartHasBracelet
    ? ['repuestos-pulseras-30', 'stickers-corazon-30', 'vaso-led-navidad-350']
    : cartHasChristmasCup
      ? ['protector-vasos', 'kit-stickers', 'kit-noche-completa']
      : ['vaso-led-navidad-350', 'protector-vasos', 'stickers-corazon-30'];
  const crossSellProduct = crossSellCandidates
    .map((id) => ALL_PRODUCTS.find((product) => product.id === id))
    .find((product) => product && !cartProductIds.has(product.id));

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-xs">
      <div className="relative w-full max-w-xl bg-white border-l border-[#E7E2EA] h-full flex flex-col justify-between overflow-hidden">
        {/* Top Drawer Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-[#E8E4EB] bg-white">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-[#201927]">
              {confirmedOrder
                ? `Pedido Listo · Folio ${confirmedOrder.folio}`
                : 'Finalizar compra'}
            </h2>
            <p className="text-[11px] sm:text-xs text-[#466B00]">
              {merchantConfig.hasStripeCheckout
                ? 'Compra sin crear cuenta · Tarjeta segura · Link o transferencia por WhatsApp'
                : 'Compra sin crear cuenta · Link o transferencia por WhatsApp'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setConfirmedOrder(null);
              onClose();
            }}
            className="p-2 rounded-lg text-[#625969] hover:text-[#201927] hover:bg-[#F2EEF5] transition-colors cursor-pointer"
            aria-label="Cerrar carrito"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {confirmedOrder ? (
            /* CONFIRMED ORDER STATE -> DIRECT WHATSAPP BUTTON */
            <div className="space-y-5">
              <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#C7DCA9]/50 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#466B00]">
                    <CheckCircle2 className="w-4 h-4" />
                    Pedido listo para enviar
                  </span>
                  <span className="font-mono text-xs sm:text-sm font-bold text-[#201927] bg-[#F2EEF5] px-3 py-1 rounded-lg border border-[#E1DCE6]">
                    Folio: {confirmedOrder.folio}
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-[#201927]">
                  ¡Casi listo, {confirmedOrder.customerName.split(' ')[0]}! Envía tu
                  pedido al WhatsApp 479 229 3687
                </h3>

                <p className="text-xs sm:text-sm text-[#51495B] leading-relaxed">
                  Toca el botón verde de abajo para abrir WhatsApp con tu pedido
                  completo. Ahí mismo te enviaremos de inmediato{' '}
                  <strong className="text-[#201927]">
                    {confirmedOrder.paymentMethod === 'stripe'
                      ? 'confirmación de pago con tarjeta'
                      : confirmedOrder.paymentMethod === 'transferencia'
                        ? 'los datos para realizar la transferencia y recibir el comprobante'
                        : 'el link de pago seguro con tarjeta'}
                  </strong>{' '}
                  y tu guía de envío.
                </p>

                <div className="pt-1 space-y-2.5">
                  <a
                    href={buildWhatsAppUrl(confirmedOrder)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-4 px-5 rounded-xl bg-[#A3E635] hover:bg-[#B4E75B] text-[#0B0910] font-extrabold text-sm flex items-center justify-center gap-2 transition-colors shadow-lg shadow-[#A3E635]/20"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>
                      Enviar Pedido por WhatsApp (479 229 3687)
                    </span>
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        buildWhatsAppMessageText(confirmedOrder)
                      );
                      setCopiedOrderText(true);
                      setTimeout(() => setCopiedOrderText(false), 2500);
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#F2EEF5] hover:bg-[#EEEAF1] text-xs font-semibold text-[#201927] flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    {copiedOrderText ? (
                      <>
                        <Check className="w-4 h-4 text-[#466B00]" />
                        <span>Texto del pedido copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-[#466B00]" />
                        <span>Copiar resumen de mi pedido</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setConfirmedOrder(null);
                      onClose();
                    }}
                    className="w-full py-2.5 px-4 rounded-xl border border-[#E1DCE6] text-xs font-medium text-[#51495B] hover:text-[#201927] transition-colors cursor-pointer"
                  >
                    Volver a la tienda
                  </button>
                </div>
              </div>

              <div className="p-4 sm:p-5 rounded-xl bg-white border border-[#E8E4EB] space-y-2.5 text-xs">
                <div className="font-bold text-[#201927] text-sm">
                  Resumen de tu pedido ({confirmedOrder.folio})
                </div>
                {confirmedOrder.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-[#51495B]">
                    <span>
                      {item.quantity}x {item.name}
                    </span>
                    <span className="font-mono">
                      ${(item.price * item.quantity).toLocaleString('es-MX')} MXN
                    </span>
                  </div>
                ))}
                <div className="flex justify-between text-[#625969]">
                  <span>Envío</span>
                  <span className="font-mono">
                    {confirmedOrder.shipping === 0
                      ? 'GRATIS'
                      : `$${confirmedOrder.shipping} MXN`}
                  </span>
                </div>
                <div className="border-t border-[#E8E4EB] pt-2 flex justify-between font-bold text-[#201927] text-sm">
                  <span>Total a pagar</span>
                  <span className="font-mono text-[#466B00]">
                    ${confirmedOrder.total.toLocaleString('es-MX')} MXN
                  </span>
                </div>
              </div>
              <p className="text-xs leading-relaxed text-[#51495B]">Entrega estimada: {DELIVERY_ESTIMATE} desde la confirmación del pago.</p>
            </div>
          ) : cart.length === 0 ? (
            /* EMPTY CART STATE */
            <div className="py-10 text-center space-y-5">
              <p className="text-[#625969] text-sm">
                Tu carrito está vacío. Agrega productos para revisar el total, el envío y pagar.
              </p>
              <div className="grid grid-cols-1 gap-3 text-left">
                {ALL_PRODUCTS.slice(0, 4).map((kit) => (
                  <div
                    key={kit.id}
                    className="p-4 rounded-xl bg-white border border-[#E7E2EA] flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="text-sm font-bold text-[#201927]">{kit.name}</div>
                      <div className="text-xs text-[#625969]">{kit.contentsSummary}</div>
                      <div className="font-mono text-sm font-semibold text-[#466B00] mt-1">
                        ${kit.price.toLocaleString('es-MX')} MXN
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onAddProduct(kit)}
                      className="px-3.5 py-2 rounded-lg bg-[#A3E635] text-[#0B0910] text-xs font-bold hover:bg-[#B4E75B] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      Agregar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Cart, payment method, and delivery details */
            <>
              {/* Free shipping threshold from the active promotion rules */}
              <div className="p-3.5 rounded-xl bg-white border border-[#E7E2EA] space-y-2">
                <div className="flex items-center gap-2.5 text-xs">
                  <Truck className="w-4 h-4 text-[#466B00] shrink-0" />
                  {qualifiesFreeShipping ? (
                    <span className="text-[#201927] font-medium">
                      ¡Pedido de ${effectiveThreshold} MXN o más! Tienes{' '}
                      <strong className="text-[#466B00]">Envío Gratis</strong>.
                    </span>
                  ) : (
                    <span className="text-[#51495B]">
                      Pedidos menores a{' '}
                      <strong className="text-[#201927]">${effectiveThreshold} MXN</strong>{' '}
                      pagan <strong className="text-[#201927]">$99 MXN</strong> de envío.
                      Agrega{' '}
                      <strong className="font-mono text-[#466B00]">
                        ${amountForFreeShipping} MXN
                      </strong>{' '}
                      más para <strong className="text-[#466B00]">Envío Gratis</strong>.
                    </span>
                  )}
                </div>

                <div
                  className="h-2 overflow-hidden rounded-full bg-[#EEEAF1]"
                  role="progressbar"
                  aria-label="Avance para obtener envío gratis"
                  aria-valuemin={0}
                  aria-valuemax={effectiveThreshold}
                  aria-valuenow={Math.min(subtotal, effectiveThreshold)}
                >
                  <div
                    className="h-full rounded-full bg-[#72A719] transition-[width] duration-300"
                    style={{ width: `${Math.min(100, (subtotal / effectiveThreshold) * 100)}%` }}
                  />
                </div>

                <div className="flex items-center gap-2.5 text-xs border-t border-[#E8E4EB] pt-2">
                  <Gift className="w-4 h-4 text-[#7133A0] shrink-0" />
                  {unlocksFreeGift ? (
                    <span className="text-[#201927] font-medium">
                      ¡Regalo desbloqueado! Incluimos{' '}
                      <strong className="text-[#466B00]">
                        1 Tarjeta Extra de 5 Stickers GRATIS
                      </strong>
                    </span>
                  ) : (
                    <span className="text-[#625969]">
                      {christmasCupQuantity > 0 ? (
                        <>Vasos navideños: 5% menos desde 2, 8% desde 4 y 12% desde 6 piezas,{' '}
                          <strong className="text-[#201927]">combinando tamaños</strong> en el carrito.</>
                      ) : (
                        <>En los vasos LED navideños, el descuento por volumen se aplica automáticamente al agregar más piezas.</>
                      )}
                    </span>
                  )}
                </div>
              </div>
              <div className="rounded-xl border border-[#E7E2EA] bg-[#F8F7FA] px-3.5 py-3 text-xs leading-relaxed text-[#51495B]">
                <strong className="text-[#201927]">Entrega estimada: {DELIVERY_ESTIMATE}</strong> desde la confirmación del pago. {RETURN_POLICY}
              </div>

              {/* Cart Items List */}
              <div className="space-y-2.5">
                {cart.map(({ product, quantity }) => {
                  const unitPrice = getEffectiveUnitPrice(product, quantity, christmasCupQuantity);
                  const lineTotal = Math.round(unitPrice * quantity);
                  const hasVolumeDiscount = unitPrice < product.price;

                  return (
                    <div
                      key={product.id}
                      className="p-3 rounded-xl bg-white border border-[#E7E2EA] flex items-center justify-between gap-3"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        referrerPolicy="no-referrer"
                        className="w-13 h-13 rounded-lg object-cover border border-[#E7E2EA] shrink-0 bg-white"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs sm:text-sm font-bold text-[#201927] truncate">
                          {product.name}
                        </div>
                        <div className="text-[11px] text-[#625969] truncate">
                          {hasVolumeDiscount ? (
                            <span className="text-[#466B00] font-medium">
                              Precio volumen: ${unitPrice} MXN c/u
                            </span>
                          ) : (
                            product.contentsSummary
                          )}
                        </div>
                        <div className="font-mono text-xs font-semibold text-[#466B00] mt-0.5">
                          ${lineTotal.toLocaleString('es-MX')} MXN
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(product.id, -1)}
                          className="w-7 h-7 rounded bg-[#F2EEF5] text-[#201927] flex items-center justify-center hover:bg-[#EEEAF1] cursor-pointer"
                          aria-label="Disminuir cantidad"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-mono text-xs font-bold w-6 text-center">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(product.id, 1)}
                          className="w-7 h-7 rounded bg-[#F2EEF5] text-[#201927] flex items-center justify-center hover:bg-[#EEEAF1] cursor-pointer"
                          aria-label="Aumentar cantidad"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onRemoveItem(product.id)}
                          className="w-7 h-7 rounded text-[#625969] hover:text-red-400 flex items-center justify-center ml-0.5 cursor-pointer"
                          aria-label="Eliminar producto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Coupon & Active Promotions Box */}
              <div className="p-3.5 rounded-xl bg-white border border-[#E7E2EA] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#201927] flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-[#466B00]" />
                    Cupones de descuento (toca para activar)
                  </span>
                  {appliedCoupon && (
                    <button
                      type="button"
                      onClick={() => {
                        setAppliedCoupon(null);
                        setCouponFeedback(null);
                      }}
                      className="text-[11px] text-[#625969] hover:text-[#201927] underline cursor-pointer"
                    >
                      Quitar
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {activeCoupons.map((c) => {
                    const isSelected = appliedCoupon?.code === c.code;
                    return (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => handleApplyCouponCode(c.code)}
                        className={`px-2.5 py-1.5 rounded-lg text-[11px] font-mono border transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#A3E635] text-[#0B0910] border-[#C7DCA9] font-bold'
                            : 'bg-white text-[#51495B] border-[#E1DCE6] hover:border-[#C7DCA9]'
                        }`}
                      >
                        {c.code} ({c.label})
                      </button>
                    );
                  })}
                </div>

                {couponFeedback && (
                  <div className="text-[11px] text-[#466B00]">{couponFeedback}</div>
                )}
              </div>

              {/* Accurate add-on quantity to reach the free-shipping threshold */}
              {!qualifiesFreeShipping && upsellProduct && upsellQuantity > 0 && (
                <div className="p-3 rounded-xl bg-white/95 border border-dashed border-[#E1DCE6] flex items-center justify-between gap-3">
                  <div className="text-xs">
                    <div className="font-semibold text-[#201927] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#466B00]" />
                      Suma {upsellQuantity} × {upsellProduct.name} por ${upsellAddedCost.toLocaleString('es-MX')} MXN
                    </div>
                    <div className="text-[#625969] mt-0.5">
                      Con este agregado llegas al mínimo de ${effectiveThreshold.toLocaleString('es-MX')} para tener{' '}
                      <strong className="text-[#201927]">Envío Gratis</strong>.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      for (let i = 0; i < upsellQuantity; i += 1) {
                        onAddProduct(upsellProduct);
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#F2EEF5] hover:bg-[#A3E635] text-[#201927] hover:text-[#0B0910] text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    + Agregar {upsellQuantity}
                  </button>
                </div>
              )}

              {crossSellProduct && (
                <div className="p-3 rounded-xl bg-[#F8F7FA] border border-[#E7E2EA] flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <img src={crossSellProduct.image} alt="" className="h-12 w-12 rounded-lg border border-[#E7E2EA] bg-white object-contain" loading="lazy" />
                    <div className="min-w-0 text-xs">
                      <div className="font-semibold text-[#201927]">Puede acompañar tu pedido</div>
                      <div className="truncate text-[#625969]">{crossSellProduct.name} · ${crossSellProduct.price.toLocaleString('es-MX')} MXN</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onAddProduct(crossSellProduct)}
                    className="shrink-0 rounded-lg border border-[#D9D2DF] bg-white px-3 py-1.5 text-xs font-semibold text-[#201927] transition-colors hover:bg-[#EEF3E5]"
                  >
                    + Agregar
                  </button>
                </div>
              )}

              {/* Card payment through Stripe, with WhatsApp payment link as the fallback */}
              <div className="space-y-2.5">
                <label className="block text-xs font-bold text-[#201927]">
                  1. Elige cómo deseas pagar
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {merchantConfig.hasStripeCheckout && (
                    <button
                      type="button"
                      onClick={() => selectPaymentMethod('stripe')}
                      className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                        paymentMethod === 'stripe'
                          ? 'bg-[#F2F7E9] border-[#C7DCA9] text-[#201927]'
                          : 'bg-white border-[#E7E2EA] text-[#625969] hover:text-[#201927]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <CreditCard className="w-4 h-4 text-[#466B00]" />
                        <span className="font-mono text-[10px] font-bold text-[#466B00]">STRIPE</span>
                      </div>
                      <div className="text-xs font-bold text-[#201927] mt-1.5">Tarjeta en línea · Recomendado</div>
                      <div className="text-[11px] text-[#625969] mt-0.5 leading-snug">
                        Checkout seguro de Stripe. El pago se confirma al instante.
                      </div>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => selectPaymentMethod('link_pago')}
                    className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                      paymentMethod === 'link_pago'
                        ? 'bg-[#F2F7E9] border-[#C7DCA9] text-[#201927]'
                        : 'bg-white border-[#E7E2EA] text-[#625969] hover:text-[#201927]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <CreditCard className="w-4 h-4 text-[#466B00]" />
                      <span className="font-mono text-[10px] font-bold text-[#466B00]">
                        TARJETA
                      </span>
                    </div>
                    <div className="text-xs font-bold text-[#201927] mt-1.5">
                      Link de Pago
                    </div>
                    <div className="text-[11px] text-[#625969] mt-0.5 leading-snug">
                      Solicita el enlace de pago por WhatsApp
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => selectPaymentMethod('transferencia')}
                    className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                      paymentMethod === 'transferencia'
                        ? 'bg-[#F2F7E9] border-[#C7DCA9] text-[#201927]'
                        : 'bg-white border-[#E7E2EA] text-[#625969] hover:text-[#201927]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Landmark className="w-4 h-4 text-[#466B00]" />
                      <span className="font-mono text-[10px] font-bold text-[#466B00]">SPEI</span>
                    </div>
                    <div className="text-xs font-bold text-[#201927] mt-1.5">Transferencia bancaria</div>
                    <div className="text-[11px] text-[#625969] mt-0.5 leading-snug">
                      Solicita los datos de la cuenta por WhatsApp
                    </div>
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-[#E7E2EA] bg-white px-3.5 py-3 text-[11px] leading-relaxed text-[#51495B]">
                {paymentMethod === 'stripe'
                  ? 'Pagarás en el checkout seguro de Stripe. Al confirmarse el pago, verás el folio y podrás coordinar la entrega por WhatsApp. Los datos de tu tarjeta se capturan en Stripe.'
                  : paymentMethod === 'transferencia'
                    ? 'Se abrirá WhatsApp con tu pedido y dirección para solicitar los datos bancarios. Espera a recibirlos y confirmar el total antes de transferir; después podrás enviar el comprobante por el mismo chat.'
                    : 'Se abrirá WhatsApp con tu pedido y dirección. Te responderemos con el enlace de pago; el pedido se paga al abrir ese enlace.'}
              </div>

              {/* Contact, delivery, and optional receipt email details */}
              <form
                id="checkout-form"
                onSubmit={handleSendOrderToWhatsApp}
                className="space-y-3 pt-1"
              >
                <div className="text-xs font-bold text-[#201927]">
                  2. Datos de contacto y entrega
                </div>
                <label className="sr-only" htmlFor="checkout-customer-name">
                  Nombre completo
                </label>
                <input
                  id="checkout-customer-name"
                  type="text"
                  required
                  autoComplete="name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Nombre completo"
                  className="w-full px-3 py-2.5 rounded-lg bg-white border border-[#E1DCE6] text-xs text-[#201927] focus:outline-none focus:border-[#C7DCA9]"
                />
                <div className="rounded-lg border border-[#E7E2EA] bg-white px-3 py-2.5 text-[11px] leading-relaxed text-[#51495B]">
                  {paymentMethod === 'stripe'
                    ? 'Usaremos estos datos para preparar el envío. El pago con tarjeta se procesa en Stripe.'
                    : paymentMethod === 'transferencia'
                      ? 'Usaremos estos datos para preparar tu pedido y solicitar los datos bancarios por WhatsApp.'
                      : 'Usaremos estos datos para preparar tu pedido y solicitar el enlace de pago por WhatsApp.'}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                      type="tel"
                      required
                      autoComplete="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Tu WhatsApp (10 dígitos)"
                      aria-label="Tu WhatsApp"
                      className="w-full px-3 py-2.5 rounded-lg bg-white border border-[#E1DCE6] text-xs text-[#201927] focus:outline-none focus:border-[#C7DCA9]"
                  />
                    <input
                      type="text"
                      required
                      autoComplete="street-address"
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      placeholder="Calle, número, colonia y referencias"
                      aria-label="Dirección de entrega"
                      className="w-full px-3 py-2.5 rounded-lg bg-white border border-[#E1DCE6] text-xs text-[#201927] focus:outline-none focus:border-[#C7DCA9] sm:col-span-2"
                    />
                    <input
                      type="text"
                      required
                      autoComplete="address-level2"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Ciudad o municipio"
                      aria-label="Ciudad o municipio"
                      className="w-full px-3 py-2.5 rounded-lg bg-white border border-[#E1DCE6] text-xs text-[#201927] focus:outline-none focus:border-[#C7DCA9]"
                    />
                    <input
                      type="text"
                      required
                      autoComplete="address-level1"
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                      placeholder="Estado"
                      aria-label="Estado"
                      className="w-full px-3 py-2.5 rounded-lg bg-white border border-[#E1DCE6] text-xs text-[#201927] focus:outline-none focus:border-[#C7DCA9]"
                    />
                    <input
                      type="text"
                      required
                      maxLength={5}
                      pattern="[0-9]{5}"
                      title="Escribe un código postal de 5 dígitos"
                      autoComplete="postal-code"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="Código Postal"
                      aria-label="Código Postal"
                      className="w-full px-3 py-2.5 rounded-lg bg-white border border-[#E1DCE6] text-xs text-[#201927] focus:outline-none focus:border-[#C7DCA9]"
                    />
                </div>
                <div className="space-y-2 rounded-xl border border-[#E7E2EA] bg-white p-3">
                  <label className="flex items-start gap-2.5 text-xs font-medium text-[#201927]">
                    <input
                      type="checkbox"
                      checked={sendReceiptByEmail}
                      onChange={(e) => setSendReceiptByEmail(e.target.checked)}
                      className="mt-0.5 h-4 w-4 accent-[#A3E635]"
                    />
                    <span>Quiero recibir el comprobante de pago por correo</span>
                  </label>
                  {sendReceiptByEmail && (
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="Correo electrónico"
                      aria-label="Correo para recibir el comprobante"
                      className="w-full px-3 py-2.5 rounded-lg bg-white border border-[#E1DCE6] text-xs text-[#201927] focus:outline-none focus:border-[#C7DCA9]"
                    />
                  )}
                  <p className="text-[10px] leading-relaxed text-[#625969]">
                    {paymentMethod === 'stripe'
                      ? 'Stripe enviará el recibo cuando el pago con tarjeta se confirme.'
                      : paymentMethod === 'transferencia'
                        ? 'Incluiremos este correo en tu solicitud de transferencia por WhatsApp.'
                        : 'Incluiremos este correo en tu solicitud de pago por WhatsApp.'}
                  </p>
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-lg bg-red-950/60 border border-red-800/60 text-xs text-red-200">
                    {errorMsg}
                  </div>
                )}
              </form>
            </>
          )}
        </div>

        {/* Bottom Sticky Totals & WhatsApp Submit Bar */}
        {!confirmedOrder && cart.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-[#E8E4EB] bg-white space-y-3">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-[#625969]">
                <span>Subtotal</span>
                <span className="font-mono text-[#201927]">
                  ${subtotal.toLocaleString('es-MX')} MXN
                </span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-[#466B00]">
                  <span>Cupón ({appliedCoupon?.code})</span>
                  <span className="font-mono">
                    -${couponDiscount.toLocaleString('es-MX')} MXN
                  </span>
                </div>
              )}
              {appliedCoupon && couponDiscount === 0 && (
                <div className="text-[11px] text-amber-300">
                  El cupón {appliedCoupon.code} se aplicará al llegar a ${appliedCoupon.minPurchase.toLocaleString('es-MX')} MXN en productos.
                </div>
              )}
              <div className="flex justify-between text-[#625969]">
                <span>Envío</span>
                <span className="font-mono text-[#201927]">
                  {shipping === 0 ? (
                    <strong className="text-[#466B00]">GRATIS (≥${effectiveThreshold.toLocaleString('es-MX')})</strong>
                  ) : (
                    `$${shipping} MXN`
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-[#201927] pt-1.5 border-t border-[#E8E4EB]">
                <span>Total a pagar</span>
                <span className="font-mono text-base text-[#466B00]">
                  ${total.toLocaleString('es-MX')} MXN
                </span>
              </div>
            </div>
            <p className="text-[11px] leading-relaxed text-[#51495B]">Entrega estimada: {DELIVERY_ESTIMATE} desde la confirmación del pago. Devoluciones por WhatsApp; solicítalas preferentemente al día hábil siguiente de recibir el pedido. Conservas tu plazo legal de 5 días hábiles.</p>

            <button
              type="submit"
              form="checkout-form"
              disabled={isSubmitting}
              className="w-full py-3.5 px-5 rounded-xl bg-[#A3E635] hover:bg-[#B4E75B] text-[#0B0910] font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-lg shadow-[#A3E635]/15"
            >
              {paymentMethod === 'stripe' ? (
                <CreditCard className="w-4 h-4 shrink-0" />
              ) : paymentMethod === 'transferencia' ? (
                <Landmark className="w-4 h-4 shrink-0" />
              ) : (
                <MessageCircle className="w-4 h-4 shrink-0" />
              )}
              <span>
                {isSubmitting
                  ? paymentMethod === 'stripe'
                    ? 'Abriendo Stripe...'
                    : 'Enviando pedido a WhatsApp...'
                  : paymentMethod === 'stripe'
                  ? `Pagar con tarjeta en Stripe · $${total.toLocaleString('es-MX')}`
                  : paymentMethod === 'transferencia'
                    ? `Solicitar datos para transferencia · $${total.toLocaleString('es-MX')}`
                    : `Solicitar link de pago · $${total.toLocaleString('es-MX')}`}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
