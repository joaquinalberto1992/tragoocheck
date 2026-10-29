import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Minus,
  Trash2,
  Copy,
  Check,
  CreditCard,
  Building2,
  Store,
  Truck,
  MessageCircle,
  Sparkles,
  Tag,
  Gift,
  CheckCircle2,
} from 'lucide-react';
import { ProductKit, ALL_PRODUCTS, ACTIVE_COUPONS, PromoCoupon } from '../data/products';

export interface CartItem {
  product: ProductKit;
  quantity: number;
}

export interface MerchantConfigClient {
  bankName: string;
  clabe: string;
  accountHolder: string;
  cardNumberRef: string;
  whatsappNumber: string;
  instagramUrl?: string;
  customDomain?: string;
  videoUrl?: string;
  shippingFee: number;
  freeShippingThreshold: number;
  speiDiscountPercent: number;
  hasLiveStripeKey?: boolean;
  stripePaymentLinks?: Record<string, string>;
}

export type OrderPaymentMethod = 'link_pago' | 'oxxo' | 'spei' | 'stripe';

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
  speiDiscount?: number;
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
function getEffectiveUnitPrice(product: ProductKit, quantity: number): number {
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
  const [paymentMethod, setPaymentMethod] = useState<'link_pago' | 'oxxo' | 'spei'>(
    'link_pago'
  );
  const [copiedOrderText, setCopiedOrderText] = useState(false);

  // Coupon state
  const [appliedCoupon, setAppliedCoupon] = useState<PromoCoupon | null>(null);
  const [couponFeedback, setCouponFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (initialCouponCode) {
      const found = ACTIVE_COUPONS.find(
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
  const [shippingAddress, setShippingAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('Guanajuato');
  const [postalCode, setPostalCode] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<ConfirmedOrder | null>(null);

  if (!isOpen) return null;

  const subtotal = Math.round(
    cart.reduce(
      (acc, item) =>
        acc + getEffectiveUnitPrice(item.product, item.quantity) * item.quantity,
      0
    )
  );

  // STRICT SHIPPING RULE: Orders under $899 MXN ALWAYS pay shipping ($99 MXN)
  const effectiveThreshold = Math.max(
    899,
    merchantConfig.freeShippingThreshold || 899
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
    ? Math.round((subtotal * appliedCoupon.discountPercent) / 100)
    : 0;

  const subtotalAfterCoupon = Math.max(0, subtotal - couponDiscount);
  const speiDiscount =
    paymentMethod === 'spei'
      ? Math.round(
          (subtotalAfterCoupon * (merchantConfig.speiDiscountPercent || 5)) / 100
        )
      : 0;
  const totalDiscount = couponDiscount + speiDiscount;
  const total = Math.max(0, subtotal - totalDiscount + shipping);

  const amountForFreeShipping = Math.max(0, effectiveThreshold - subtotal);
  const unlocksFreeGift = subtotal >= 1100;

  const handleApplyCouponCode = (codeToApply: string) => {
    const clean = codeToApply.trim().toUpperCase();
    const found = ACTIVE_COUPONS.find((c) => c.code === clean);
    if (!found) {
      setCouponFeedback('Código no válido. Usa HOY10, AMIGAS15 o SOCIOB2B.');
      return;
    }
    setAppliedCoupon(found);
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

  const buildOrderItemsPayload = () => {
    const baseItems = cart.map((i) => ({
      id: i.product.id,
      name: i.product.name,
      price: getEffectiveUnitPrice(i.product, i.quantity),
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
    if (method === 'oxxo') {
      return 'Pago en Efectivo en OXXO (Solicito ficha/referencia OXXO)';
    }
    if (method === 'spei') {
      return `Transferencia Bancaria SPEI (-${merchantConfig.speiDiscountPercent || 5}% aplicado)`;
    }
    return 'Link de Pago con Tarjeta (Solicito link de pago por WhatsApp)';
  };

  const buildWhatsAppMessageText = (order: ConfirmedOrder) => {
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
      ...(order.speiDiscount
        ? [`• Descuento SPEI: -$${order.speiDiscount.toLocaleString('es-MX')} MXN`]
        : []),
      `• Envío Express: ${
        order.shipping === 0
          ? 'GRATIS (Pedido >= $899 MXN)'
          : `$${order.shipping} MXN`
      }`,
      `• *TOTAL A PAGAR: $${order.total.toLocaleString('es-MX')} MXN*`,
      ``,
      `*Método de pago elegido:*`,
      `👉 *${getPaymentMethodTitle(order.paymentMethod)}*`,
      ``,
      `*Datos de envío discreto:*`,
      `• Nombre: ${order.customerName}`,
      `• Mi WhatsApp: ${order.customerPhone}`,
      `• Dirección: ${order.shippingAddress}`,
      `• Ciudad/Estado: ${order.city}, ${order.state} (CP ${order.postalCode})`,
      ``,
      `¿Me compartes mi link de pago / ficha OXXO y confirmación por aquí? ¡Gracias!`,
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
      !postalCode.trim()
    ) {
      setErrorMsg(
        'Completa tu nombre, tu número de WhatsApp, dirección y código postal para enviarte tu pedido.'
      );
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);

    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const generatedFolio = `TC-${randomDigits}`;

    const orderPayload: ConfirmedOrder = {
      folio: generatedFolio,
      createdAt: new Date().toISOString(),
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: '',
      shippingAddress: shippingAddress.trim(),
      city: city.trim() || stateName.trim(),
      state: stateName.trim(),
      postalCode: postalCode.trim(),
      items: buildOrderItemsPayload(),
      subtotal,
      discount: totalDiscount,
      couponCode: couponDiscount > 0 ? appliedCoupon?.code : undefined,
      couponDiscount,
      speiDiscount,
      shipping,
      total,
      paymentMethod,
      paymentStatus: 'pendiente_comprobante',
      transferReference:
        paymentMethod === 'oxxo'
          ? 'Pago en OXXO vía WhatsApp'
          : paymentMethod === 'link_pago'
          ? 'Link de Pago vía WhatsApp'
          : 'Transferencia SPEI vía WhatsApp',
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });
      const created: ConfirmedOrder = res.ok ? await res.json() : orderPayload;
      setConfirmedOrder(created);
      onOrderCreated(created);
      onClearCart();

      // Open WhatsApp directly (works on Android, iOS Safari & Desktop)
      const waUrl = buildWhatsAppUrl(created);
      window.location.href = waUrl;
    } catch (err) {
      setConfirmedOrder(orderPayload);
      onOrderCreated(orderPayload);
      onClearCart();
      window.location.href = buildWhatsAppUrl(orderPayload);
    } finally {
      setIsSubmitting(false);
    }
  };

  const upsellProduct = ALL_PRODUCTS.find(
    (p) =>
      p.id === 'kit-stickers' && !cart.some((c) => c.product.id === 'kit-stickers')
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-xs">
      <div className="relative w-full max-w-xl bg-[#0F0C16] border-l border-[#262136] h-full flex flex-col justify-between overflow-hidden">
        {/* Top Drawer Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-[#231E30] bg-[#14111D]">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white">
              {confirmedOrder
                ? `Pedido Listo · Folio ${confirmedOrder.folio}`
                : 'Finalizar Pedido Directo por WhatsApp'}
            </h2>
            <p className="text-[11px] sm:text-xs text-[#A3E635]">
              Atención inmediata al WhatsApp 479 229 3687 · Link de Pago, OXXO o SPEI
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setConfirmedOrder(null);
              onClose();
            }}
            className="p-2 rounded-lg text-[#A19BB2] hover:text-white hover:bg-[#1E192B] transition-colors cursor-pointer"
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
              <div className="p-5 sm:p-6 rounded-2xl bg-[#14111D] border border-[#A3E635]/50 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#A3E635]">
                    <CheckCircle2 className="w-4 h-4" />
                    Pedido registrado en el sistema
                  </span>
                  <span className="font-mono text-xs sm:text-sm font-bold text-white bg-[#1F1A2C] px-3 py-1 rounded-lg border border-[#2E2840]">
                    Folio: {confirmedOrder.folio}
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-white">
                  ¡Casi listo, {confirmedOrder.customerName.split(' ')[0]}! Envía tu
                  pedido al WhatsApp 479 229 3687
                </h3>

                <p className="text-xs sm:text-sm text-[#C4BED4] leading-relaxed">
                  Toca el botón verde de abajo para abrir WhatsApp con tu pedido
                  completo. Ahí mismo te enviaremos de inmediato tu{' '}
                  <strong className="text-white">
                    {confirmedOrder.paymentMethod === 'oxxo'
                      ? 'ficha de pago en OXXO'
                      : confirmedOrder.paymentMethod === 'spei'
                      ? 'confirmación de transferencia SPEI'
                      : 'Link de Pago seguro con tarjeta'}
                  </strong>{' '}
                  y tu guía de envío express.
                </p>

                <div className="pt-1 space-y-2.5">
                  <a
                    href={buildWhatsAppUrl(confirmedOrder)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-4 px-5 rounded-xl bg-[#A3E635] hover:bg-[#BEF264] text-[#0B0910] font-extrabold text-sm flex items-center justify-center gap-2 transition-colors shadow-lg shadow-[#A3E635]/20"
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
                    className="w-full py-2.5 px-4 rounded-xl bg-[#1E192B] hover:bg-[#282138] text-xs font-semibold text-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    {copiedOrderText ? (
                      <>
                        <Check className="w-4 h-4 text-[#A3E635]" />
                        <span>Texto del pedido copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-[#A3E635]" />
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
                    className="w-full py-2.5 px-4 rounded-xl border border-[#2E2840] text-xs font-medium text-[#C4BED4] hover:text-white transition-colors cursor-pointer"
                  >
                    Volver a la tienda
                  </button>
                </div>
              </div>

              <div className="p-4 sm:p-5 rounded-xl bg-[#14111D] border border-[#231E30] space-y-2.5 text-xs">
                <div className="font-bold text-white text-sm">
                  Resumen de tu pedido ({confirmedOrder.folio})
                </div>
                {confirmedOrder.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-[#C4BED4]">
                    <span>
                      {item.quantity}x {item.name}
                    </span>
                    <span className="font-mono">
                      ${(item.price * item.quantity).toLocaleString('es-MX')} MXN
                    </span>
                  </div>
                ))}
                <div className="flex justify-between text-[#A19BB2]">
                  <span>Envío Express</span>
                  <span className="font-mono">
                    {confirmedOrder.shipping === 0
                      ? 'GRATIS'
                      : `$${confirmedOrder.shipping} MXN`}
                  </span>
                </div>
                <div className="border-t border-[#231E30] pt-2 flex justify-between font-bold text-white text-sm">
                  <span>Total a pagar</span>
                  <span className="font-mono text-[#A3E635]">
                    ${confirmedOrder.total.toLocaleString('es-MX')} MXN
                  </span>
                </div>
              </div>
            </div>
          ) : cart.length === 0 ? (
            /* EMPTY CART STATE */
            <div className="py-10 text-center space-y-5">
              <p className="text-[#A19BB2] text-sm">
                Tu carrito está vacío. Selecciona uno de los kits o paquetes para hacer tu pedido por WhatsApp.
              </p>
              <div className="grid grid-cols-1 gap-3 text-left">
                {ALL_PRODUCTS.slice(0, 4).map((kit) => (
                  <div
                    key={kit.id}
                    className="p-4 rounded-xl bg-[#14111D] border border-[#262136] flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="text-sm font-bold text-white">{kit.name}</div>
                      <div className="text-xs text-[#A19BB2]">{kit.contentsSummary}</div>
                      <div className="font-mono text-sm font-semibold text-[#A3E635] mt-1">
                        ${kit.price.toLocaleString('es-MX')} MXN
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onAddProduct(kit)}
                      className="px-3.5 py-2 rounded-lg bg-[#A3E635] text-[#0B0910] text-xs font-bold hover:bg-[#BEF264] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      Agregar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* CART + PAYMENT PREFERENCE (LINK / OXXO / SPEI) + SHIPPING FORM */
            <>
              {/* Strict $899 MXN Free Shipping Banner */}
              <div className="p-3.5 rounded-xl bg-[#14111D] border border-[#262136] space-y-2">
                <div className="flex items-center gap-2.5 text-xs">
                  <Truck className="w-4 h-4 text-[#A3E635] shrink-0" />
                  {qualifiesFreeShipping ? (
                    <span className="text-white font-medium">
                      ¡Pedido de ${effectiveThreshold} MXN o más! Tienes{' '}
                      <strong className="text-[#A3E635]">Envío Express Gratis</strong>.
                    </span>
                  ) : (
                    <span className="text-[#C4BED4]">
                      Pedidos menores a{' '}
                      <strong className="text-white">${effectiveThreshold} MXN</strong>{' '}
                      pagan <strong className="text-white">$99 MXN</strong> de envío.
                      Agrega{' '}
                      <strong className="font-mono text-[#A3E635]">
                        ${amountForFreeShipping} MXN
                      </strong>{' '}
                      más para <strong className="text-[#A3E635]">Envío Gratis</strong>.
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2.5 text-xs border-t border-[#231E30] pt-2">
                  <Gift className="w-4 h-4 text-[#A855F7] shrink-0" />
                  {unlocksFreeGift ? (
                    <span className="text-white font-medium">
                      ¡Regalo desbloqueado! Incluimos{' '}
                      <strong className="text-[#A3E635]">
                        1 Tarjeta Extra de 5 Stickers GRATIS
                      </strong>
                    </span>
                  ) : (
                    <span className="text-[#A19BB2]">
                      Entre más piezas agregues,{' '}
                      <strong className="text-white">
                        más baja el precio unitario
                      </strong>{' '}
                      automáticamente.
                    </span>
                  )}
                </div>
              </div>

              {/* Cart Items List */}
              <div className="space-y-2.5">
                {cart.map(({ product, quantity }) => {
                  const unitPrice = getEffectiveUnitPrice(product, quantity);
                  const lineTotal = Math.round(unitPrice * quantity);
                  const hasVolumeDiscount = unitPrice < product.price;

                  return (
                    <div
                      key={product.id}
                      className="p-3 rounded-xl bg-[#14111D] border border-[#262136] flex items-center justify-between gap-3"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        referrerPolicy="no-referrer"
                        className="w-13 h-13 rounded-lg object-cover border border-[#262136] shrink-0 bg-[#E2E2E2]"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs sm:text-sm font-bold text-white truncate">
                          {product.name}
                        </div>
                        <div className="text-[11px] text-[#A19BB2] truncate">
                          {hasVolumeDiscount ? (
                            <span className="text-[#A3E635] font-medium">
                              Precio volumen: ${unitPrice} MXN c/u
                            </span>
                          ) : (
                            product.contentsSummary
                          )}
                        </div>
                        <div className="font-mono text-xs font-semibold text-[#A3E635] mt-0.5">
                          ${lineTotal.toLocaleString('es-MX')} MXN
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(product.id, -1)}
                          className="w-7 h-7 rounded bg-[#1E192B] text-white flex items-center justify-center hover:bg-[#2B243D] cursor-pointer"
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
                          className="w-7 h-7 rounded bg-[#1E192B] text-white flex items-center justify-center hover:bg-[#2B243D] cursor-pointer"
                          aria-label="Aumentar cantidad"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onRemoveItem(product.id)}
                          className="w-7 h-7 rounded text-[#A19BB2] hover:text-red-400 flex items-center justify-center ml-0.5 cursor-pointer"
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
              <div className="p-3.5 rounded-xl bg-[#14111D] border border-[#262136] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-[#A3E635]" />
                    Cupones de descuento (toca para activar)
                  </span>
                  {appliedCoupon && (
                    <button
                      type="button"
                      onClick={() => {
                        setAppliedCoupon(null);
                        setCouponFeedback(null);
                      }}
                      className="text-[11px] text-[#A19BB2] hover:text-white underline cursor-pointer"
                    >
                      Quitar
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {ACTIVE_COUPONS.map((c) => {
                    const isSelected = appliedCoupon?.code === c.code;
                    return (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => handleApplyCouponCode(c.code)}
                        className={`px-2.5 py-1.5 rounded-lg text-[11px] font-mono border transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#A3E635] text-[#0B0910] border-[#A3E635] font-bold'
                            : 'bg-[#0B0910] text-[#C4BED4] border-[#2E2840] hover:border-[#A3E635]'
                        }`}
                      >
                        {c.code} ({c.label})
                      </button>
                    );
                  })}
                </div>

                {couponFeedback && (
                  <div className="text-[11px] text-[#A3E635]">{couponFeedback}</div>
                )}
              </div>

              {/* 1-Click Upsell to help reach $899 Free Shipping */}
              {!qualifiesFreeShipping && upsellProduct && (
                <div className="p-3 rounded-xl bg-[#14111D]/80 border border-dashed border-[#362E4C] flex items-center justify-between gap-3">
                  <div className="text-xs">
                    <div className="font-semibold text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#A3E635]" />
                      ¿Sumar {upsellProduct.name} por ${upsellProduct.price} MXN?
                    </div>
                    <div className="text-[#A19BB2] mt-0.5">
                      Llega a $899 MXN para tener{' '}
                      <strong className="text-white">Envío Express Gratis</strong>.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onAddProduct(upsellProduct)}
                    className="px-3 py-1.5 rounded-lg bg-[#1F192E] hover:bg-[#A3E635] text-white hover:text-[#0B0910] text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    + Sumar
                  </button>
                </div>
              )}

              {/* 3 Payment Options Handled via WhatsApp 479 229 3687 */}
              <div className="space-y-2.5">
                <label className="block text-xs font-bold text-white">
                  1. Elige cómo deseas pagar
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('link_pago')}
                    className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                      paymentMethod === 'link_pago'
                        ? 'bg-[#171E12] border-[#A3E635] text-white'
                        : 'bg-[#14111D] border-[#262136] text-[#A19BB2] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <CreditCard className="w-4 h-4 text-[#A3E635]" />
                      <span className="font-mono text-[10px] font-bold text-[#A3E635]">
                        TARJETA
                      </span>
                    </div>
                    <div className="text-xs font-bold text-white mt-1.5">
                      Link de Pago
                    </div>
                    <div className="text-[11px] text-[#A19BB2] mt-0.5 leading-snug">
                      Solicita el enlace de pago por WhatsApp
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('oxxo')}
                    className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                      paymentMethod === 'oxxo'
                        ? 'bg-[#171E12] border-[#A3E635] text-white'
                        : 'bg-[#14111D] border-[#262136] text-[#A19BB2] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Store className="w-4 h-4 text-[#A3E635]" />
                      <span className="font-mono text-[10px] font-bold text-amber-400">
                        EFECTIVO
                      </span>
                    </div>
                    <div className="text-xs font-bold text-white mt-1.5">
                      Pago en OXXO
                    </div>
                    <div className="text-[11px] text-[#A19BB2] mt-0.5 leading-snug">
                      Solicita la ficha de pago por WhatsApp
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('spei')}
                    className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                      paymentMethod === 'spei'
                        ? 'bg-[#171E12] border-[#A3E635] text-white'
                        : 'bg-[#14111D] border-[#262136] text-[#A19BB2] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Building2 className="w-4 h-4 text-[#A3E635]" />
                      <span className="font-mono text-[10px] font-bold text-[#A3E635]">
                        -{merchantConfig.speiDiscountPercent || 5}% EXTRA
                      </span>
                    </div>
                    <div className="text-xs font-bold text-white mt-1.5">
                      Transferencia SPEI
                    </div>
                    <div className="text-[11px] text-[#A19BB2] mt-0.5 leading-snug">
                      Descuento adicional incluido en tu total
                    </div>
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-[#262136] bg-[#14111D] px-3.5 py-3 text-[11px] leading-relaxed text-[#C4BED4]">
                Al continuar se abrirá WhatsApp con tu folio, productos, cupón y total. Ahí confirmas los datos de pago antes de pagar; el enlace de tarjeta o la ficha OXXO se solicitan por ese chat.
              </div>

              {/* Shipping Address Form */}
              <form
                id="checkout-form"
                onSubmit={handleSendOrderToWhatsApp}
                className="space-y-3 pt-1"
              >
                <div className="text-xs font-bold text-white">
                  2. Tus datos de envío discreto (se enviarán a nuestro WhatsApp 479 229 3687)
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] text-[#A19BB2] mb-1">
                      Tu Nombre o Alias *
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Ej. Daniela Morales"
                      className="w-full px-3 py-2.5 rounded-lg bg-[#14111D] border border-[#2E2840] text-xs text-white focus:outline-none focus:border-[#A3E635]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#A19BB2] mb-1">
                      Tu WhatsApp (10 dígitos) *
                    </label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Ej. 479 123 4567"
                      className="w-full px-3 py-2.5 rounded-lg bg-[#14111D] border border-[#2E2840] text-xs text-white focus:outline-none focus:border-[#A3E635]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-[#A19BB2] mb-1">
                    Calle, número exterior/interior y colonia *
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="Calle, Número, Colonia y referencias"
                    className="w-full px-3 py-2.5 rounded-lg bg-[#14111D] border border-[#2E2840] text-xs text-white focus:outline-none focus:border-[#A3E635]"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[11px] text-[#A19BB2] mb-1">
                      Código Postal *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={5}
                      value={postalCode}
                      onChange={(e) =>
                        setPostalCode(e.target.value.replace(/\D/g, ''))
                      }
                      placeholder="37000"
                      className="w-full px-3 py-2.5 rounded-lg bg-[#14111D] border border-[#2E2840] font-mono text-xs text-white focus:outline-none focus:border-[#A3E635]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#A19BB2] mb-1">
                      Ciudad *
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="León / CDMX"
                      className="w-full px-3 py-2.5 rounded-lg bg-[#14111D] border border-[#2E2840] text-xs text-white focus:outline-none focus:border-[#A3E635]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#A19BB2] mb-1">
                      Estado
                    </label>
                    <input
                      type="text"
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                      placeholder="Gto / CDMX"
                      className="w-full px-3 py-2.5 rounded-lg bg-[#14111D] border border-[#2E2840] text-xs text-white focus:outline-none focus:border-[#A3E635]"
                    />
                  </div>
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
          <div className="p-4 sm:p-5 border-t border-[#231E30] bg-[#14111D] space-y-3">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-[#A19BB2]">
                <span>Subtotal</span>
                <span className="font-mono text-white">
                  ${subtotal.toLocaleString('es-MX')} MXN
                </span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-[#A3E635]">
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
              {speiDiscount > 0 && (
                <div className="flex justify-between text-[#A3E635]">
                  <span>Descuento SPEI (-{merchantConfig.speiDiscountPercent}%)</span>
                  <span className="font-mono">
                    -${speiDiscount.toLocaleString('es-MX')} MXN
                  </span>
                </div>
              )}
              <div className="flex justify-between text-[#A19BB2]">
                <span>Envío Express Discreto</span>
                <span className="font-mono text-white">
                  {shipping === 0 ? (
                    <strong className="text-[#A3E635]">GRATIS (≥$899)</strong>
                  ) : (
                    `$${shipping} MXN`
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-white pt-1.5 border-t border-[#231E30]">
                <span>Total a pagar</span>
                <span className="font-mono text-base text-[#A3E635]">
                  ${total.toLocaleString('es-MX')} MXN
                </span>
              </div>
            </div>

            <button
              type="submit"
              form="checkout-form"
              disabled={isSubmitting}
              className="w-full py-3.5 px-5 rounded-xl bg-[#A3E635] hover:bg-[#BEF264] text-[#0B0910] font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-lg shadow-[#A3E635]/15"
            >
              <MessageCircle className="w-4 h-4 shrink-0" />
              <span>
                {isSubmitting
                  ? 'Enviando pedido a WhatsApp...'
                  : paymentMethod === 'oxxo'
                  ? `Enviar Pedido a WhatsApp (Pago OXXO · $${total.toLocaleString('es-MX')})`
                  : paymentMethod === 'spei'
                  ? `Enviar Pedido a WhatsApp (Pago SPEI · $${total.toLocaleString('es-MX')})`
                  : `Enviar Pedido a WhatsApp y Recibir Link ($${total.toLocaleString('es-MX')})`}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
