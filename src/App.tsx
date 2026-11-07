import { ProductVisual } from './components/ProductVisual';
import { Analytics, type BeforeSendEvent } from '@vercel/analytics/react';
import { BuenFinCountdown } from './components/BuenFinCountdown';
import { VideoGallery } from './components/VideoGallery';
import { UpcomingProducts } from './components/UpcomingProducts';
import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  ShieldCheck,
  Check,
  Plus,
  Minus,
  ArrowRight,
  SlidersHorizontal,
  MessageCircle,
  AlertTriangle,
  Tag,
  Instagram,
  Globe,
  ClipboardList,
  Video,
  CreditCard,
  Landmark,
  Menu,
  X,
} from 'lucide-react';
import {
  PRODUCT_KITS,
  PROMO_BUNDLES,
  BRACELET_PRODUCTS,
  FAMILY_PRODUCTS,
  CHRISTMAS_PRODUCTS,
  ALL_PRODUCTS,
  getVisibleCoupons,
  HERO_PRODUCT_IMAGE,
  KIT_STICKERS_IMAGE,
  INSTAGRAM_URL,
  INSTAGRAM_HANDLE,
  FAQS,
  ProductKit,
} from './data/products';
import {
  BUEN_FIN_END,
  NOVEMBER_PROMOTION_END,
  NOVEMBER_PROMOTION_START,
  REGULAR_FREE_SHIPPING_THRESHOLD,
  getBuenFinFreeShippingThreshold,
  isBuenFinActive,
} from './data/promotionRules';
import { ReactionSimulator } from './components/ReactionSimulator';
import { WholesaleSection } from './components/WholesaleSection';
import {
  CheckoutModal,
  CartItem,
  MerchantConfigClient,
  ConfirmedOrder,
  normalizeWhatsAppPhone,
} from './components/CheckoutModal';
import { MerchantPanelModal } from './components/MerchantPanelModal';
import { PWAInstallSection, TragooLogoIcon } from './components/PWAInstallPrompt';
import {
  WomenSloganBanner,
  HeroVideoPlayer,
} from './components/VideoStoryShowcase';
import squadPackImage from './assets/images/tragoo-pack-kit-noche-completa-5-clean.webp';

const INTERNAL_TRAFFIC_KEY = 'tc_internal_traffic';

const analyticsBeforeSend = (event: BeforeSendEvent) => {
  try {
    if (window.localStorage.getItem(INTERNAL_TRAFFIC_KEY) === '1') {
      return null;
    }
  } catch {
    // Keep page analytics available if browser storage is unavailable.
  }

  return event;
};

const DEFAULT_CONFIG: MerchantConfigClient = {
  cardNumberRef: 'Tarjeta en Stripe o link de pago por WhatsApp',
  whatsappNumber: '524792293687',
  instagramUrl: INSTAGRAM_URL,
  customDomain: 'tragoocheck.shop',
  videoUrl: '/videos/intro-premium.mp4',
  shippingFee: 99,
  freeShippingThreshold: 899,
  hasLiveStripeKey: false,
  hasStripeCheckout: false,
};

export default function App() {
  const isInstagramLanding = window.location.pathname === '/instagram';
  const [cart, setCart] = useState<CartItem[]>([]);
  const [heroView, setHeroView] = useState<
    'video' | 'empaque' | 'squad'
  >('video');
  const [catalogFilter, setCatalogFilter] = useState<
    'all' | 'individual' | 'promocion' | 'accesorios' | 'navidad'
  >(isInstagramLanding ? 'individual' : 'all');
  const [selectedCouponCode, setSelectedCouponCode] = useState<string | null>(
    null
  );
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMerchantPanelOpen, setIsMerchantPanelOpen] = useState(false);
  const [merchantConfig, setMerchantConfig] =
    useState<MerchantConfigClient>(DEFAULT_CONFIG);
  const [orders, setOrders] = useState<ConfirmedOrder[]>([]);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [stripeReturnFolio, setStripeReturnFolio] = useState<string | null>(
    null
  );
  const [stripePaymentMessage, setStripePaymentMessage] = useState('');
  const [stripeWhatsAppUrl, setStripeWhatsAppUrl] = useState('');
  const [promotionNow, setPromotionNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => setPromotionNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isInstagramLanding) return;
    window.requestAnimationFrame(() => {
      document.getElementById('kits')?.scrollIntoView({ block: 'start' });
    });
  }, [isInstagramLanding]);

  useEffect(() => {
    fetch('/api/config')
      .then((r) => r.json())
      .then((data) => {
        if (data && typeof data === 'object') {
          setMerchantConfig((previous) => ({
            ...previous,
            ...data,
          }));
        }
      })
      .catch(() => {});

    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('stripe_session');
    if (sessionId) {
      window.history.replaceState({}, '', window.location.pathname);
      fetch(`/api/checkout/confirm?session_id=${encodeURIComponent(sessionId)}`, {
        cache: 'no-store',
      })
        .then(async (response) => {
          const result = await response.json();
          if (!response.ok || !result.paid || !result.whatsappUrl) {
            throw new Error(result.error || 'No pudimos confirmar el pago.');
          }
          setStripeReturnFolio(result.folio);
          setStripePaymentMessage('Pago confirmado. Abriendo WhatsApp para enviar tu pedido.');
          setStripeWhatsAppUrl(result.whatsappUrl);
          sessionStorage.removeItem('tragoo-pending-stripe');
          window.location.assign(result.whatsappUrl);
        })
        .catch(() => {
          setStripeReturnFolio('Pago pendiente de confirmar');
          setStripePaymentMessage(
            'No pudimos verificar el pago automáticamente. Contacta a Tragoo Check por WhatsApp antes de volver a pagar.'
          );
          try {
            const pending = JSON.parse(sessionStorage.getItem('tragoo-pending-stripe') || '{}');
            if (pending.folio) {
              setStripeWhatsAppUrl(
                `https://wa.me/${normalizeWhatsAppPhone(merchantConfig.whatsappNumber)}?text=${encodeURIComponent(`Hola Tragoo Check. Regresé de Stripe y necesito confirmar el pago de mi pedido ${pending.folio}.`)}`
              );
            }
          } catch {
            // Keep the confirmation notice visible if browser storage is unavailable.
          }
        });
    } else if (params.get('stripe_cancelled') === '1') {
      setStripeReturnFolio('Pago cancelado');
      setStripePaymentMessage('El pago no se completó. Tu carrito se conservó para que puedas intentarlo de nuevo.');
      try {
        const pending = JSON.parse(sessionStorage.getItem('tragoo-pending-stripe') || '{}');
        if (typeof pending.couponCode === 'string') {
          setSelectedCouponCode(pending.couponCode);
        }
        const restored = Array.isArray(pending.items)
          ? pending.items
              .map((item: { id: string; quantity: number }) => ({
                product: ALL_PRODUCTS.find((product) => product.id === item.id),
                quantity: item.quantity,
              }))
              .filter((item: { product?: ProductKit; quantity: number }) => item.product)
              .map((item: { product?: ProductKit; quantity: number }) => ({
                product: item.product!,
                quantity: item.quantity,
              }))
          : [];
        if (restored.length) setCart(restored);
        sessionStorage.removeItem('tragoo-pending-stripe');
      } catch {
        // The cart remains empty if browser storage is unavailable.
      }
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotalEstimate = cart.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  const handleAddToCart = (product: ProductKit, openDrawer = false) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    if (openDrawer && isBuenFinPromotionActive && product.id === 'pack-amigas-2x') {
      setSelectedCouponCode('BUENFIN12');
    }
    if (openDrawer) {
      setIsCheckoutOpen(true);
    }
  };

  const handleBuyNow = (product: ProductKit) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) return prev;
      return [{ product, quantity: 1 }];
    });
    if (isBuenFinPromotionActive && product.id === 'pack-amigas-2x') {
      setSelectedCouponCode('BUENFIN12');
    }
    setIsCheckoutOpen(true);
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleOpenOrder = () => {
    if (cart.length) {
      setIsCheckoutOpen(true);
      setIsMobileMenuOpen(false);
      return;
    }
    setIsMobileMenuOpen(false);
    document.getElementById('kits')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSelectKitById = (kitId: string) => {
    const found = ALL_PRODUCTS.find((p) => p.id === kitId) || PRODUCT_KITS[0];
    handleAddToCart(found, true);
  };

  const handleActivateCoupon = (code: string) => {
    setSelectedCouponCode(code);
    handleOpenOrder();
  };

  const displayedRetailProducts =
    catalogFilter === 'accesorios'
      ? BRACELET_PRODUCTS
      : catalogFilter === 'navidad'
      ? CHRISTMAS_PRODUCTS
      : catalogFilter === 'individual'
      ? [...PRODUCT_KITS, ...BRACELET_PRODUCTS.filter((product) => product.category === 'individual')]
      : catalogFilter === 'promocion'
      ? [...PROMO_BUNDLES, ...BRACELET_PRODUCTS.filter((product) => product.category === 'promocion')]
      : [...PRODUCT_KITS, ...PROMO_BUNDLES, ...BRACELET_PRODUCTS, ...CHRISTMAS_PRODUCTS];

  const activeHeroImage =
    heroView === 'empaque'
      ? HERO_PRODUCT_IMAGE
      : heroView === 'squad'
      ? squadPackImage
      : HERO_PRODUCT_IMAGE;

  const activeInstagramUrl = merchantConfig.instagramUrl || INSTAGRAM_URL;
  const cleanWhatsAppPhone = normalizeWhatsAppPhone(
    merchantConfig.whatsappNumber
  );
  const isNovemberPromotionActive =
    promotionNow >= NOVEMBER_PROMOTION_START && promotionNow < NOVEMBER_PROMOTION_END;
  const isBuenFinCampaignVisible =
    promotionNow >= NOVEMBER_PROMOTION_START && promotionNow < BUEN_FIN_END;
  const isBuenFinPromotionActive = isBuenFinActive(promotionNow);
  const freeShippingThreshold = isBuenFinPromotionActive
    ? getBuenFinFreeShippingThreshold(promotionNow)
    : Math.max(
        REGULAR_FREE_SHIPPING_THRESHOLD,
        merchantConfig.freeShippingThreshold || REGULAR_FREE_SHIPPING_THRESHOLD
      );

  return (
    <div className="min-h-screen bg-white text-[#201927] flex flex-col pb-24 md:pb-0">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#E8E4EB]">
        <div className="max-w-[1160px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 sm:gap-8">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="#"
            className="font-display text-lg font-extrabold tracking-tight text-[#201927] whitespace-nowrap shrink-0"
          >
            Tragoo <span className="text-[#466B00]">Check</span>
          </a>

          <div className="flex gap-3 text-xs"><a href="#videos">Videos</a><a href="#novedades">Novedades</a></div>
          <nav aria-label="Navegación principal" className="hidden md:flex items-center gap-6 text-sm font-medium text-[#51495B]">
            <a
              href="#kits"
              className="hover:text-[#201927] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Kits
            </a>
            <a
              href="#promociones"
              className="hover:text-[#201927] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Promociones
            </a>
            <a
              href="#familia"
              className="hover:text-[#201927] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Family
            </a>
            <a
              href="#mayoreo"
              className="hover:text-[#201927] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Mayoreo Premium
            </a>
            <a
              href="#simulador"
              className="hover:text-[#201927] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Simulador 15s
            </a>
            <a
              href="#preguntas"
              className="hover:text-[#201927] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Preguntas
            </a>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={handleOpenOrder}
              className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-lg bg-[#A3E635] hover:bg-[#B4E75B] text-[#0B0910] font-bold text-xs transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>{cartCount ? `Ir al pago · (${cartCount})` : 'Ver kits y precios'}</span>
            </button>
            <button
              type="button"
              aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-navigation"
              onClick={() => setIsMobileMenuOpen((open) => !open)}
              className="md:hidden ml-2 p-2 rounded-lg border border-[#E1DCE6] text-[#201927] hover:bg-[#F4F1F6]"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        {isMobileMenuOpen && (
          <nav id="mobile-navigation" aria-label="Navegación móvil" className="md:hidden border-t border-[#E8E4EB] bg-white px-4 py-3 grid grid-cols-2 gap-2 text-sm">
            {[
              ['Kits', '#kits'],
              ['Promociones', '#promociones'],
              ['Tragoo Check Family', '#familia'],
              ['Mayoreo', '#mayoreo'],
              ['Simulador', '#simulador'],
              ['Preguntas', '#preguntas'],
            ].map(([label, href]) => (
              <a key={href} href={href} onClick={() => setIsMobileMenuOpen(false)} className="rounded-lg px-3 py-3 text-[#51495B] hover:bg-[#F4F1F6]">{label}</a>
            ))}
          </nav>
        )}
      </header>

      {isBuenFinCampaignVisible ? (
        <a href="#buen-fin" aria-label="Ver cuenta regresiva y promociones para El Buen Fin" className="block border-b border-[#E7DDEE] bg-[#F7F2FA] px-4 py-2.5 text-center text-xs sm:text-sm text-[#3A2845] hover:bg-[#F1EAF6]">
          <span className="mr-2 inline-flex items-center gap-1.5 rounded-full bg-[#5B2A78] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-white">El Buen Fin · 13–17 nov</span>
          {isBuenFinPromotionActive ? (
            <span className="font-semibold">12% con BUENFIN12 desde $799 · Pack Dúo $703.12 · Envío gratis desde $799</span>
          ) : (
            <span className="font-semibold">Del 13 al 17: 12% con BUENFIN12 desde $799 · Envío gratis desde $799</span>
          )}
        </a>
      ) : isNovemberPromotionActive ? (
        <a href="#promociones" className="block border-b border-[#E7DDEE] bg-[#F7F2FA] px-4 py-2.5 text-center text-xs font-semibold text-[#3A2845] hover:bg-[#F1EAF6]">
          Promociones de noviembre · 10% con HOY10 desde $449 · 15% con AMIGAS15 desde $1,100 · Envío gratis desde ${freeShippingThreshold.toLocaleString('es-MX')}
        </a>
      ) : null}
      <div className="border-b border-[#E8E4EB] bg-white px-4 py-2.5">
        <div className="mx-auto flex max-w-[1160px] flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] font-medium text-[#51495B] sm:text-xs">
          <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-[#5B2A78]" />Pago con tarjeta procesado por Stripe</span>
          <span className="inline-flex items-center gap-1.5"><Globe className="h-4 w-4 text-[#5B2A78]" />Envío $99 · Gratis desde ${freeShippingThreshold.toLocaleString('es-MX')} MXN</span>
          <span className="inline-flex items-center gap-1.5"><MessageCircle className="h-4 w-4 text-[#5B2A78]" />Atención por WhatsApp</span>
        </div>
      </div>
      <BuenFinCountdown />

      {/* Optional Stripe Return Confirmation Banner */}
      {stripeReturnFolio && (
        <div className="bg-[#F2F7E9] border-b border-[#C7DCA9]/40 px-4 py-3">
          <div className="max-w-[1160px] mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-[#201927]">
              <ShieldCheck className="w-4 h-4 text-[#466B00]" />
              <span>
                ¡Tu pedido{' '}
                <strong className="font-mono text-[#466B00]">
                {stripeReturnFolio}
                </strong>{' '}
                {stripePaymentMessage || 'Pago confirmado.'}
              </span>
            </div>
            {stripeWhatsAppUrl && (
              <a
                href={stripeWhatsAppUrl}
                className="rounded-lg bg-[#A3E635] px-3 py-2 text-xs font-bold text-[#0B0910]"
              >
                Abrir WhatsApp
              </a>
            )}
            <button
              type="button"
              onClick={() => setStripeReturnFolio(null)}
              className="text-[#466B00] hover:underline font-medium cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="py-6 sm:py-8 md:py-14">
          <div className="max-w-[1160px] mx-auto px-4 sm:px-6 space-y-6 sm:space-y-8">
            {/* 5-6 Second Persuasive Women's Slogan Rotator */}
            <WomenSloganBanner onSelectKit={handleSelectKitById} />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
              {/* Left Column */}
              <div className="lg:col-span-6 flex flex-col justify-between space-y-6 py-1 sm:py-2">
                <div className="space-y-4 sm:space-y-5">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#466B00] font-medium">
                    <span>Tienda Oficial México</span>
                    <span aria-hidden="true" className="text-[#766D80]">
                      ·
                    </span>
                    <a
                      href={activeInstagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[#51495B] hover:text-[#201927] underline underline-offset-4"
                    >
                      <Instagram className="w-3.5 h-3.5 text-[#7133A0]" />
                      <span>{INSTAGRAM_HANDLE}</span>
                    </a>
                    <span aria-hidden="true" className="text-[#766D80]">
                      ·
                    </span>
                    <span className="text-[#51495B]">
                      WhatsApp 479 229 3687 · Opciones de pago disponibles al pedir
                    </span>
                  </div>

                  <h1
                    className="font-display font-extrabold tracking-tight text-[#201927] leading-[1.08] [text-wrap:balance]"
                    style={{ fontSize: 'clamp(2.15rem, 4vw, 3.75rem)' }}
                  >
                    Checa antes de{' '}
                    <span className="text-[#466B00]">brindar.</span>
                  </h1>

                  <p className="text-sm sm:text-base md:text-lg text-[#51495B] leading-relaxed max-w-2xl">
                    Pruebas portátiles en{' '}
                    <strong className="text-[#201927]">stickers para uñas</strong> y{' '}
                    <strong className="text-[#201927]">tiras reactivas</strong> con
                    estuche llavero mini-tumbler, diseñadas para indicar la posible
                    presencia de algunas sustancias según el tipo de prueba y sus
                    instrucciones.{' '}
                    {merchantConfig.hasStripeCheckout
                      ? 'Paga con tarjeta en el checkout seguro de Stripe; también te atendemos por WhatsApp.'
                      : 'Envía tu pedido por WhatsApp para solicitar un link de pago con tarjeta.'}
                  </p>
                  <p className="max-w-2xl text-sm leading-relaxed text-[#466B00]">
                    Creemos que contar con más información y herramientas de autocuidado puede ayudar a las personas a cuidarse y acompañarse mejor.
                  </p>
                </div>

                {/* Primary & Secondary Action Row + PWA Install */}
                <div className="space-y-4 pt-1 sm:pt-2">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleBuyNow(PRODUCT_KITS[0])}
                      className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#A3E635] hover:bg-[#B4E75B] text-[#0B0910] font-bold text-sm transition-colors cursor-pointer whitespace-nowrap shrink-0 shadow-lg shadow-[#A3E635]/10"
                    >
                      <CreditCard className="w-4 h-4 shrink-0" />
                      <span>Comprar Kit Noche Completa · $449 MXN</span>
                      <ArrowRight className="w-4 h-4 shrink-0" />
                    </button>

                    <a
                      href="#mayoreo"
                      className="inline-flex items-center justify-center px-5 py-3.5 rounded-xl bg-white hover:bg-[#F4F1F6] border border-[#E1DCE6] text-sm font-semibold text-[#201927] transition-colors whitespace-nowrap shrink-0"
                    >
                      Mayoreo Premium (Hasta -63%)
                    </a>
                  </div>

                  <div className="rounded-xl border border-[#E1DCE6] bg-white px-4 py-3.5">
                    <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[#201927]">
                      Compra en 3 pasos
                    </p>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs leading-relaxed text-[#51495B]">
                      <span><strong className="text-[#466B00]">1.</strong> Elige tus productos</span>
                      <ArrowRight aria-hidden="true" className="hidden h-3.5 w-3.5 text-[#756C80] sm:block" />
                      <span><strong className="text-[#466B00]">2.</strong> Revisa y completa tu pedido</span>
                      <ArrowRight aria-hidden="true" className="hidden h-3.5 w-3.5 text-[#756C80] sm:block" />
                      <span><strong className="text-[#466B00]">3.</strong> Elige cómo pagar</span>
                    </div>
                    <p className="mt-1.5 text-[11px] text-[#665D70]">
                      {merchantConfig.hasStripeCheckout ? 'Paga con tarjeta en Stripe; WhatsApp está disponible para coordinar el envío.' : 'Solicita un link de pago con tarjeta por WhatsApp.'}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 pt-1">
                    <PWAInstallSection />

                    {import.meta.env.DEV && <button
                      type="button"
                      onClick={() => setIsMerchantPanelOpen(true)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-[#F2EEF5] border border-[#E1DCE6] text-xs font-semibold text-[#51495B] hover:text-[#201927] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <ClipboardList className="w-3.5 h-3.5 text-[#466B00]" />
                      <span>Panel de Pedidos y Dominio ({orders.length})</span>
                    </button>}
                  </div>

                  <p className="text-xs text-[#665D70] leading-relaxed max-w-xl">
                    <strong className="text-[#51495B]">Regla de envíos:</strong>{' '}
                    Pedidos de 1 sola pieza o menores a{' '}
                    <strong className="text-[#201927]">${freeShippingThreshold.toLocaleString('es-MX')} MXN</strong> pagan{' '}
                    <strong className="text-[#201927]">$99 MXN</strong> de envío. A
                    partir de <strong className="text-[#466B00]">${freeShippingThreshold.toLocaleString('es-MX')} MXN</strong>{' '}
                    (Pack Trío 3x, Pack Squad 5x y todas las Cajas de Mayoreo) el{' '}
                    <strong className="text-[#466B00]">
                      Envío Express Asegurado es GRATIS
                    </strong>
                    .
                  </p>
                </div>
              </div>

              {/* Right Column: Video Reel (00:16s) & Official Packaging Gallery Showcase */}
              <div className="lg:col-span-6 flex flex-col justify-between gap-3">
                {heroView === 'video' ? (
                  <HeroVideoPlayer
                    videoUrl={merchantConfig.videoUrl}
                    onVideoUploaded={(newUrl) =>
                      setMerchantConfig((prev) => ({ ...prev, videoUrl: newUrl }))
                    }
                    onBuyKit={() => handleBuyNow(PRODUCT_KITS[0])}
                  />
                ) : (
                  <div className="relative flex-1 min-h-[320px] sm:min-h-[360px] rounded-2xl overflow-hidden border border-[#E7E2EA] bg-white flex flex-col justify-end">
                    <img
                      src={activeHeroImage}
                      alt="Empaque oficial Tragoo Check Kit Noche Completa con llavero mini-tumbler"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 sm:p-5">
                      <div className="flex items-center justify-between text-xs text-[#466B00] font-mono">
                        <span>
                          {heroView === 'empaque'
                            ? 'KIT NOCHE COMPLETA · BOLSA DOY-PACK + LLAVERO'
                            : 'PACK SQUAD 5X · 5 BOLSAS + 5 LLAVEROS'}
                        </span>
                        <span>@TRAGOOCHECK</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Product gallery uses verified front-of-pack photos only. */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setHeroView('video')}
                    className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-colors cursor-pointer ${
                      heroView === 'video'
                        ? 'bg-[#F2F7E9] border-[#C7DCA9] text-[#201927]'
                        : 'bg-white/80 border-[#E7E2EA] text-[#625969] hover:text-[#201927]'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-lg bg-[#A3E635]/20 border border-[#C7DCA9]/50 flex items-center justify-center text-[#466B00] shrink-0">
                      <Video className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate">Video Oficial</div>
                      <div className="text-[10px] text-[#466B00] truncate">
                        Mira cómo se usa
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setHeroView('empaque')}
                    className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-colors cursor-pointer ${
                      heroView === 'empaque'
                        ? 'bg-white border-[#C7DCA9] text-[#201927]'
                        : 'bg-white/80 border-[#E7E2EA] text-[#625969] hover:text-[#201927]'
                    }`}
                  >
                    <img
                      src={HERO_PRODUCT_IMAGE}
                      alt="Kit Noche Completa"
                      referrerPolicy="no-referrer"
                      className="w-9 h-9 rounded-lg object-cover shrink-0"
                    />
                    <span className="text-xs font-semibold truncate">
                      Frente + Llavero
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setHeroView('squad')}
                    className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-colors cursor-pointer ${
                      heroView === 'squad'
                        ? 'bg-white border-[#C7DCA9] text-[#201927]'
                        : 'bg-white/80 border-[#E7E2EA] text-[#625969] hover:text-[#201927]'
                    }`}
                  >
                    <img
                      src={squadPackImage}
                      alt="Pack Squad 5x"
                      referrerPolicy="no-referrer"
                      className="w-9 h-9 rounded-lg object-cover shrink-0"
                    />
                    <span className="text-xs font-semibold truncate">
                      Pack Squad 5x
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Full-Width 4-Column Quantitative Proof & Pricing Rule Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-2">
              <div className="p-4 rounded-xl bg-white border border-[#E8E4EB]">
                <div className="font-mono text-base sm:text-lg font-bold text-[#466B00] tabular-nums">
                  {merchantConfig.hasStripeCheckout ? 'Pago con tarjeta en línea' : 'WhatsApp 479 229 3687'}
                </div>
                <div className="text-xs text-[#51495B] mt-0.5">
                  {merchantConfig.hasStripeCheckout
                    ? 'Checkout de Stripe para tarjeta; WhatsApp para resolver dudas y coordinar el envío.'
                    : 'Escríbenos por WhatsApp para solicitar un link de pago con tarjeta.'}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white border border-[#E8E4EB]">
                <div className="font-mono text-base sm:text-lg font-bold text-[#201927] tabular-nums">
                  Envío Gratis ≥ ${freeShippingThreshold.toLocaleString('es-MX')}
                </div>
                <div className="text-xs text-[#51495B] mt-0.5">
                  Pedidos menores a ${freeShippingThreshold.toLocaleString('es-MX')} MXN pagan $99 MXN de envío a
                  todo México
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white border border-[#E8E4EB]">
                <div className="font-mono text-base sm:text-lg font-bold text-[#201927] tabular-nums">
                  $449 → $165 MXN
                </div>
                <div className="text-xs text-[#51495B] mt-0.5">
                  Entre más grande sea tu pedido, menor es el precio unitario por
                  kit garantizado
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white border border-[#E8E4EB]">
                <div className="font-mono text-base sm:text-lg font-bold text-[#201927] tabular-nums">
                  Instalable en Android y iPhone
                </div>
                <div className="text-xs text-[#51495B] mt-0.5">
                  Añade el sitio a tu pantalla de inicio en Android o iPhone y síguenos en{' '}
                  <a
                    href={activeInstagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#466B00] underline"
                  >
                    @tragoocheck
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ACTIVE PROMOTIONS & COUPONS BAR */}
        <section id="promociones" className="py-12 border-t border-[#E8E4EB] bg-[#F8F7FA]">
          <div className="max-w-[1160px] mx-auto px-4 sm:px-6 space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-1.5">
                <div className="text-xs font-bold uppercase tracking-wide text-[#5B2A78]">
                  {isNovemberPromotionActive ? 'Promociones de noviembre 2026' : 'Promociones vigentes'}
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#201927]">
                  Ahorra en tus productos favoritos
                </h2>
              </div>
              <span className="text-xs text-[#625969]">
                Activa las ofertas disponibles al pagar. BUENFIN12 estará disponible del 13 al 17 de noviembre.
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {getVisibleCoupons(promotionNow).map((coupon) => {
                const isUpcoming = Boolean(coupon.startsAt && promotionNow < Date.parse(coupon.startsAt));
                return (
                  <div
                    key={coupon.code}
                    className={`p-5 rounded-xl bg-white border flex flex-col justify-between gap-4 ${coupon.code === 'BUENFIN12' ? 'border-[#5B2A78] shadow-sm ring-1 ring-[#5B2A78]/10' : 'border-[#E7E2EA]'}`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-sm font-bold text-[#466B00] flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5" />
                          {coupon.code}
                        </span>
                        <span className="text-xs text-[#201927] font-semibold text-right">
                          {coupon.label}
                        </span>
                      </div>
                      <p className="text-xs text-[#51495B] leading-relaxed">
                        {coupon.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#E8E4EB]">
                      <span className="text-[11px] text-[#665D70] font-mono">
                        Compra mín: ${coupon.minPurchase.toLocaleString('es-MX')} MXN
                      </span>
                      <button
                        type="button"
                        onClick={() => handleActivateCoupon(coupon.code)}
                        disabled={isUpcoming}
                        className={`text-xs font-bold whitespace-nowrap shrink-0 ${isUpcoming ? 'text-[#766C7E] cursor-not-allowed' : 'text-[#466B00] hover:underline cursor-pointer'}`}
                      >
                        {isUpcoming ? 'Disponible 13 nov' : 'Activar cupón →'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>


        <section id="familia" className="border-t border-[#E8E4EB] bg-gradient-to-br from-[#F7F2FA] via-white to-[#F4F8EC] py-12 sm:py-16 scroll-mt-20">
          <div className="max-w-[1160px] mx-auto px-4 sm:px-6">
            <div className="mb-6 sm:mb-8 max-w-2xl">
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#6B368B]">Tragoo Check Family</div>
              <h2 className="mt-2 text-2xl sm:text-4xl font-extrabold tracking-tight text-[#201927] [text-wrap:balance]">Más cerca de quienes quieres</h2>
              <p className="mt-3 text-sm sm:text-base leading-relaxed text-[#51495B]">Una propuesta de apoyo familiar para personas adultas mayores y para salidas acompañadas con niñas y niños. Diseñada para dar más tranquilidad en el día a día.</p>
            </div>

            <article className="overflow-hidden rounded-3xl border border-[#E1D6E8] bg-[#F9F5FF] text-[#21172B] shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
                <div className="grid md:grid-cols-[1.05fr_0.95fr]">
                  <div className="relative min-h-[260px] sm:min-h-[360px] bg-white">
                    <img src={FAMILY_PRODUCTS[0].image} alt="Pulsera negra SOS Family sobre fondo blanco" className="absolute inset-0 h-full w-full object-contain" loading="lazy" />
                  </div>
                  <div className="flex flex-col justify-center p-5 sm:p-8 lg:p-10">
                    <div className="inline-flex w-fit items-center gap-2 rounded-full bg-[#F1DDFE] px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#67249A]">
                      <span aria-hidden="true">💜</span> Tranquilidad para la familia
                    </div>
                    <h3 className="mt-4 text-2xl sm:text-3xl font-extrabold leading-tight">SOS Family</h3>
                    <p className="mt-3 text-sm leading-relaxed text-[#54485E]">Una pulsera SOS para que las personas adultas mayores y sus familias puedan estar en contacto. Elige la versión que mejor se adapte a tu familia.</p>
                    <div className="mt-5 grid grid-cols-1 gap-3">
                      {FAMILY_PRODUCTS.map((product) => (
                        <div key={product.id} className="rounded-2xl border border-[#E8DDF0] bg-white p-4">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <h4 className="font-extrabold text-[#291B35]">{product.name.replace(' — Pulsera de alerta', '')}</h4>
                              <p className="mt-1 text-xs leading-relaxed text-[#54485E]">{product.subtitle}</p>
                            </div>
                            <div className="shrink-0 text-right">
                              <div className="text-xl font-black tabular-nums text-[#24172F]">${product.price.toLocaleString('es-MX')} <span className="text-xs font-semibold">MXN</span></div>
                            </div>
                          </div>
                          <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-[#413549]">
                            {product.includedItems.slice(0, product.id === 'sos-family-gps' ? 3 : 4).map((item) => (
                              <li key={item} className="flex items-start gap-1.5"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#7C2EAF]" />{item}</li>
                            ))}
                          </ul>
                          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <button type="button" onClick={() => handleBuyNow(product)} className="rounded-xl bg-[#67249A] px-4 py-2.5 text-sm font-extrabold text-white transition-colors hover:bg-[#7C2EAF]">Comprar · ${product.price.toLocaleString('es-MX')} MXN</button>
                            <button type="button" onClick={() => handleAddToCart(product)} className="rounded-xl border border-[#D6C4E2] bg-white px-4 py-2.5 text-sm font-bold text-[#4C2867] transition-colors hover:bg-[#F1E8F8]">Agregar al carrito</button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="mt-3 text-[11px] leading-relaxed text-[#766C7E]">Envío $99 MXN; gratis en pedidos desde ${freeShippingThreshold.toLocaleString('es-MX')} MXN. Para niñas y niños, configuración y uso con supervisión adulta.</p>
                  </div>
                </div>
            </article>

            <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-[#E1D6E8] bg-[#F7F2FA] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div className="flex items-start gap-3">
                <span className="text-3xl" aria-hidden="true">🧸</span>
                <div>
                  <div className="text-xs font-extrabold uppercase tracking-wider text-[#6B368B]">Tragoo Check Kids · Próximamente</div>
                  <p className="mt-1 text-xs leading-relaxed text-[#51495B]">Estamos preparando una alarma infantil tipo osito con cordón de jalón. Publicaremos precio y características cuando confirmemos la ficha del producto.</p>
                </div>
              </div>
              <a href={"https://wa.me/" + cleanWhatsAppPhone + "?text=" + encodeURIComponent('Hola Tragoo Check. Quiero recibir información cuando esté disponible la alarma infantil Tragoo Check Kids tipo osito.')} target="_blank" rel="noopener noreferrer" className="inline-flex shrink-0 items-center justify-center rounded-xl border border-[#D9C7E4] px-4 py-2.5 text-xs font-bold text-[#201927] transition-colors hover:bg-[#EEEAF1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#DDA8FF]">
                Avísenme por WhatsApp
              </a>
            </div>
          </div>
        </section>

        <section id="edicion-navidad" className="border-t border-[#E8E4EB] bg-[#FCFBFD] py-9 sm:py-12">
          <div className="mx-auto grid max-w-[1160px] items-center gap-5 px-4 sm:px-6 md:grid-cols-[0.8fr_1.2fr]">
            <div className="overflow-hidden rounded-2xl border border-[#E7E2EA] bg-white p-3 sm:p-4">
              <img src={CHRISTMAS_PRODUCTS[0].image} alt="Vaso luminoso navideño Tragoo Check con tapa y popote" className="mx-auto max-h-[260px] w-full object-contain" loading="lazy" />
            </div>
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-[0.16em] text-[#6B368B]">Edición navideña · Tragoo Check</div>
              <h2 className="text-2xl font-extrabold tracking-tight text-[#201927] sm:text-3xl">Un detalle luminoso para tus reuniones de temporada.</h2>
              <p className="max-w-2xl text-sm leading-relaxed text-[#51495B]">Vasos reutilizables con tapa, popote e iluminación LED en cinco tamaños, de 250 a 800 ml. Elige el que va con tu plan; hay precio por volumen al combinar piezas.</p>
              <button type="button" onClick={() => { setCatalogFilter('navidad'); document.getElementById('kits')?.scrollIntoView({ behavior: 'smooth' }); }} className="inline-flex items-center gap-2 rounded-xl bg-[#201927] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#4C2867]">
                Ver vasos navideños <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        {/* FEATURED CATALOG: INDIVIDUALS + MULTIPACK PROMOTIONS */}
        <VideoGallery />
        <UpcomingProducts onBuy={handleBuyNow} />
        <section id="kits" className="py-14 md:py-24 border-t border-[#E8E4EB]">
          <div className="max-w-[1160px] mx-auto px-4 sm:px-6 space-y-10">
            {/* Header + Interactive Category Filter Tabs */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
              <div className="space-y-2">
                <div className="text-xs font-medium text-[#466B00]">
                  {isInstagramLanding
                    ? 'Tienda oficial · Compra directa desde Instagram'
                    : 'Kits, paquetes y accesorios Tragoo Check'}
                </div>
                <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#201927] [text-wrap:balance]">
                  {isInstagramLanding
                    ? 'Elige tu kit y revisa tu total antes de pagar.'
                    : 'Encuentra lo que necesitas para tu próxima salida.'}
                </h2>
                {isInstagramLanding && (
                  <p className="max-w-2xl text-sm leading-relaxed text-[#51495B]">
                    Precios en MXN, compra sin crear cuenta y pago con tarjeta en Stripe. El envío y el total se muestran antes de confirmar.
                  </p>
                )}
              </div>

              {/* Responsive filter controls */}
              <div role="group" aria-label="Filtrar catálogo" className="grid grid-cols-2 xl:grid-cols-5 gap-1 w-full lg:w-auto p-1 bg-white border border-[#E7E2EA] rounded-xl self-start">
                <button
                  type="button"
                  onClick={() => setCatalogFilter('all')}
                  aria-pressed={catalogFilter === 'all'}
                  className={`px-3.5 sm:px-4 py-2.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                    catalogFilter === 'all'
                      ? 'bg-[#A3E635] text-[#0B0910] font-bold'
                      : 'text-[#51495B] hover:text-[#201927]'
                  }`}
                >
                  Todos ({PRODUCT_KITS.length + PROMO_BUNDLES.length + BRACELET_PRODUCTS.length + CHRISTMAS_PRODUCTS.length})
                </button>
                <button
                  type="button"
                  onClick={() => setCatalogFilter('individual')}
                  aria-pressed={catalogFilter === 'individual'}
                  className={`px-3.5 sm:px-4 py-2.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                    catalogFilter === 'individual'
                      ? 'bg-[#A3E635] text-[#0B0910] font-bold'
                      : 'text-[#51495B] hover:text-[#201927]'
                  }`}
                >
                  Individuales ({PRODUCT_KITS.length + BRACELET_PRODUCTS.filter((product) => product.category === 'individual').length})
                </button>
                <button
                  type="button"
                  onClick={() => setCatalogFilter('promocion')}
                  aria-pressed={catalogFilter === 'promocion'}
                  className={`px-3.5 sm:px-4 py-2.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                    catalogFilter === 'promocion'
                      ? 'bg-[#A3E635] text-[#0B0910] font-bold'
                      : 'text-[#51495B] hover:text-[#201927]'
                  }`}
                >
                  Paquetes ({PROMO_BUNDLES.length + BRACELET_PRODUCTS.filter((product) => product.category === 'promocion').length})
                </button>
                <button
                  type="button"
                  onClick={() => setCatalogFilter('accesorios')}
                  aria-pressed={catalogFilter === 'accesorios'}
                  className={`px-3.5 sm:px-4 py-2.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${catalogFilter === 'accesorios' ? 'bg-[#A3E635] text-[#0B0910] font-bold' : 'text-[#51495B] hover:text-[#201927]'}`}
                >
                  Accesorios ({BRACELET_PRODUCTS.length})
                </button>
                <button
                  type="button"
                  onClick={() => setCatalogFilter('navidad')}
                  aria-pressed={catalogFilter === 'navidad'}
                  className={`px-3.5 sm:px-4 py-2.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${catalogFilter === 'navidad' ? 'bg-[#A3E635] text-[#0B0910] font-bold' : 'text-[#51495B] hover:text-[#201927]'}`}
                >
                  🎄 Navidad ({CHRISTMAS_PRODUCTS.length})
                </button>
              </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
              {displayedRetailProducts.map((kit) => (
                <article
                  key={kit.id}
                  className={`rounded-2xl bg-white border shadow-sm flex flex-col justify-between overflow-hidden transition-transform duration-150 hover:-translate-y-0.5 ${
                    kit.featured ? 'border-[#C7DCA9]' : 'border-[#E7E2EA]'
                  }`}
                >
                  <div>
                    <ProductVisual product={kit} />

                    <div className="p-5 sm:p-6 space-y-4">
                      {/* Unboxed Metadata Kicker */}
                      <div className="text-xs font-medium text-[#466B00]">
                        {isBuenFinPromotionActive && kit.id === 'pack-amigas-2x'
                          ? '12% adicional con BUENFIN12 · $703.12 + envío gratis'
                          : isBuenFinPromotionActive
                            ? kit.kicker.replaceAll('$899', '$799')
                            : kit.kicker}
                      </div>

                      <div className="space-y-1">
                        <h3 className="text-lg sm:text-xl font-bold text-[#201927] leading-snug">
                          {kit.name}
                        </h3>
                        {kit.unitPriceLabel && (
                          <div className="text-xs text-[#466B00] font-mono font-semibold">
                            {kit.unitPriceLabel}
                          </div>
                        )}
                      </div>

                      <div className="flex items-baseline gap-2">
                        {kit.compareAtPrice && (
                          <span className="font-mono text-xs text-[#70677A] line-through tabular-nums">
                            ${kit.compareAtPrice.toLocaleString('es-MX')}
                          </span>
                        )}
                        <span className="font-mono text-2xl font-extrabold text-[#201927] tabular-nums">
                          ${kit.price.toLocaleString('es-MX')}
                        </span>
                        <span className="text-xs text-[#625969]">MXN</span>
                        {kit.compareAtPrice && kit.compareAtPrice > kit.price && (
                          <span className="rounded-full bg-[#A3E635]/10 px-2 py-1 text-[10px] font-extrabold text-[#466B00]">
                            Ahorra {Math.round(((kit.compareAtPrice - kit.price) / kit.compareAtPrice) * 100)}%
                          </span>
                        )}
                      </div>

                      <p className="text-xs sm:text-sm text-[#51495B] leading-relaxed">
                        {isBuenFinPromotionActive && kit.id === 'pack-amigas-2x'
                          ? 'Dos Kits Noche Completa con sus 2 llaveros mini-tumbler Tragoo Check. Con BUENFIN12 queda en $703.12 MXN y recibe envío gratis del 13 al 17 de noviembre.'
                          : isBuenFinPromotionActive
                            ? kit.subtitle.replaceAll('$899', '$799')
                            : kit.subtitle}
                      </p>
                      {kit.substancesDetected && (
                        <div className="inline-flex items-center gap-1.5 rounded-full border border-[#C7DCA9]/25 bg-[#A3E635]/10 px-2.5 py-1.5 text-[10px] font-semibold text-[#426700]">
                          <ShieldCheck className="h-3.5 w-3.5" /> Estudios propios y pruebas con personas reales
                        </div>
                      )}

                      <div className="pt-2 border-t border-[#E8E4EB] space-y-1.5 text-xs">
                        <div>
                          <span className="text-[#665D70] block">Contenido:</span>
                          <span className="text-[#201927] font-medium">
                            {kit.contentsSummary}
                          </span>
                        </div>
                        {kit.substancesDetected && (
                        <div>
                          <span className="text-[#665D70] block">
                            Lectura de prueba:
                          </span>
                          <span className="text-[#51495B]">
                            {kit.substancesDetected}
                          </span>
                        </div>
                        )}
                      </div>

                      <ul className="space-y-1.5 pt-1 text-xs text-[#625969]">
                        {kit.includedItems
                          .filter((item) => !(isBuenFinPromotionActive && kit.id === 'pack-amigas-2x' && item.startsWith('Nota:')))
                          .map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Check className="w-3.5 h-3.5 text-[#466B00] shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="p-5 sm:p-6 pt-0 space-y-2.5">
                    <button
                      type="button"
                      onClick={() => handleBuyNow(kit)}
                      className="w-full py-3 px-4 rounded-xl bg-[#A3E635] hover:bg-[#B4E75B] text-[#0B0910] font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <CreditCard className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        {isBuenFinPromotionActive && kit.id === 'pack-amigas-2x'
                          ? 'Comprar ahora · $703.12 con envío gratis'
                          : `Comprar ahora · $${kit.price.toLocaleString('es-MX')} MXN`}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddToCart(kit, true)}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#F4F1F6] hover:bg-[#EEEAF1] text-[#201927] font-medium text-xs transition-colors cursor-pointer whitespace-nowrap"
                    >
                      Agregar al carrito
                    </button>
                  </div>
                </article>
              ))}
            </div>

            {/* Main card checkout with a WhatsApp payment-link alternative */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[#F8F7FA] border border-[#E7E2EA] space-y-5">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-[#466B00]">
                    {merchantConfig.hasStripeCheckout
                      ? 'Tarjeta segura con Stripe, link o transferencia por WhatsApp · 479 229 3687'
                      : 'Solicita link o datos para transferencia por WhatsApp · 479 229 3687'}
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-[#201927]">
                    Completa tu compra y revisa el total y el envío antes de pagar.
                  </h3>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={handleOpenOrder}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#A3E635] hover:bg-[#B4E75B] text-[#0B0910] text-xs font-bold transition-colors cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Abrir carrito y elegir pago ({cartCount})</span>
                  </button>

                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {merchantConfig.hasStripeCheckout && (
                  <div className="p-4 rounded-xl bg-white border border-[#E8E4EB] space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#201927]">
                      <CreditCard className="w-4 h-4 text-[#466B00]" />
                      <span>1. Tarjeta en línea · Stripe</span>
                    </div>
                    <p className="text-xs text-[#51495B] leading-relaxed">
                      Paga en el checkout seguro de Stripe. Al confirmarse, se abre WhatsApp con el folio del pedido.
                    </p>
                  </div>
                )}
                <div className="p-4 rounded-xl bg-white border border-[#E8E4EB] space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#201927]">
                    <CreditCard className="w-4 h-4 text-[#466B00]" />
                    <span>{merchantConfig.hasStripeCheckout ? '2. Link de Pago por WhatsApp' : '1. Link de Pago con Tarjeta'}</span>
                  </div>
                  <p className="text-xs text-[#51495B] leading-relaxed">
                    Al enviar tu pedido a nuestro WhatsApp{' '}
                    <strong className="text-[#201927]">479 229 3687</strong>, te
                    compartimos tu link oficial de cobro para pagar con tarjeta de
                    débito o crédito y tu confirmación.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white border border-[#E8E4EB] space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#201927]">
                    <Landmark className="w-4 h-4 text-[#466B00]" />
                    <span>Transferencia bancaria</span>
                  </div>
                  <p className="text-xs text-[#51495B] leading-relaxed">
                    Solicita los datos de la cuenta por WhatsApp. Te confirmaremos el total; realiza la transferencia después de recibirlos y envía tu comprobante por el mismo chat.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* WHOLESALE / MAYOREO PREMIUM SECTION (15 TO 500 UNITS) */}
        <WholesaleSection
          onBuyWholesaleKit={(kit) => handleBuyNow(kit)}
          onAddToCart={(kit) => handleAddToCart(kit, true)}
          whatsappNumber={merchantConfig.whatsappNumber}
        />

        {/* INTERACTIVE 15-SECOND REACTION SIMULATOR */}
        <ReactionSimulator onSelectKit={handleSelectKitById} />

        {/* OFFICIAL PACKAGING INSTRUCTIONS + SAFETY INFORMATION (EXACT BACK OF POUCH) */}
        <section
          id="como-funciona"
          className="py-14 md:py-24 border-t border-[#E8E4EB]"
        >
          <div className="max-w-[1160px] mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
              {/* Left 6 Cols: Exact 4 Steps & Verbatim Safety Bullet Points from Back of Pouch */}
              <div className="lg:col-span-6 space-y-6">
                <div className="space-y-1.5">
                  <div className="text-xs font-semibold text-[#466B00]">
                    Formato real de la sticker para uñas
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#201927]">
                    CÓMO APLICAR:
                  </h2>
                </div>

                <div className="space-y-3">
                  {[
                    'Limpia y seca la superficie de tu uña.',
                    'Despega un sticker y colócalo en cualquier uña.',
                    'Coloca una gota de tu bebida sobre el sticker y espera 10-15 segundos.',
                    'Deja secar el sticker y revisa el cambio de color.',
                  ].map((stepText, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-white border border-[#E7E2EA] flex items-center gap-3.5"
                    >
                      <span className="w-7 h-7 rounded-full bg-[#A3E635] text-[#0B0910] font-mono font-extrabold text-sm flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-sm font-medium text-[#201927]">
                        {stepText}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Highlighted Warning from Pouch */}
                <div className="p-4 rounded-xl bg-white border border-[#A855F7]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-sm sm:text-base font-bold text-[#201927]">
                    Si observas el cambio de color indicado por el fabricante,{' '}
                    <span className="text-[#466B00]">NO TOMES.</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-semibold shrink-0">
                    <span className="inline-flex items-center gap-1.5 text-yellow-300">
                      <span className="w-3 h-3 rounded-full bg-yellow-400 inline-block" />
                      Sin cambio visible
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-[#466B00]">
                      <span className="w-3 h-3 rounded-full bg-gradient-to-r from-yellow-400 to-[#22C55E] inline-block" />
                      Posible reacción
                    </span>
                  </div>
                </div>

                {/* Exact Verbatim Información de Seguridad Importante */}
                <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E1DCE6] space-y-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#201927] border-b border-[#A855F7]/40 pb-3">
                    <AlertTriangle className="w-4 h-4 text-[#466B00] shrink-0" />
                    <span>Información de Seguridad Importante</span>
                  </div>

                  <ul className="space-y-2.5 text-xs text-[#51495B] leading-relaxed">
                    <li className="flex items-start gap-2.5">
                      <span className="text-[#466B00] font-bold">•</span>
                      <span>
                        Este es un producto de un solo uso para fines informativos y
                        de detección personal solamente. No garantiza el 100% de
                        precisión y puede generar falsos positivos. El fabricante y
                        vendedor no se hacen responsables de la interpretación o
                        resultado de las pruebas, al no ser este producto un método
                        definitivo para detectar GHB.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-[#466B00] font-bold">•</span>
                      <span>Diseñado para un solo uso. No reutilizar.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-[#466B00] font-bold">•</span>
                      <span>
                        El lavado de manos es posible con el sticker puesto, pero la
                        exposición a ciertos jabones o químicos puede reducir la
                        detección o provocar un cambio de color falso.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-[#466B00] font-bold">•</span>
                      <span>
                        Este producto no está clasificado como dispositivo médico de
                        diagnóstico in vitro (IVD) y no está sujeto a regulaciones de
                        la FDA para kits de autoprueba.
                      </span>
                    </li>
                  </ul>

                  <div className="pt-3 border-t border-[#E8E4EB] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#625969]">
                    <div>
                      <span className="text-[#466B00] font-bold">
                        tragoocheck.shop · @tragoocheck
                      </span>{' '}
                      · Distribuido por Tragoo Check S.A. de C.V. México. / Caduca
                      01/2033.
                    </div>
                    <span className="font-mono font-bold text-[#466B00]">
                      HECHO EN MÉXICO
                    </span>
                  </div>
                </div>
              </div>

              {/* Right 6 Cols: Official Back of Pouch Photo */}
              <div className="lg:col-span-6">
                <div className="rounded-2xl overflow-hidden border border-[#E1DCE6] bg-white">
                  <img
                    src={KIT_STICKERS_IMAGE}
                    alt="Sticker pequeño en forma de corazón colocado sobre una uña, en escala discreta"
                    referrerPolicy="no-referrer"
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* INSTAGRAM @TRAGOOCHECK + ANDROID/IOS PWA INSTALL BANNER */}
        <section className="py-12 sm:py-14 border-t border-[#E8E4EB] bg-[#F8F7FA]">
          <div className="max-w-[1160px] mx-auto px-4 sm:px-6">
            <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E1DCE6] grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-7 flex items-start sm:items-center gap-4">
                <TragooLogoIcon className="w-14 h-14 sm:w-16 sm:h-16" />
                <div className="space-y-1.5">
                  <div className="text-xs font-semibold text-[#466B00]">
                    App Instalable Android & iPhone (iOS) · Comunidad @tragoocheck
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-[#201927]">
                    Instala Tragoo Check en tu celular y síguenos en {INSTAGRAM_HANDLE}
                  </h3>
                  <p className="text-xs text-[#51495B] leading-relaxed">
                    Agrega el icono oficial de <strong className="text-[#201927]">Tragoo Check</strong>{' '}
                    a tu pantalla de inicio en <strong className="text-[#201927]">Android o iPhone</strong>{' '}
                    para comprar kits o consultar la escala de colores en 15 segundos.
                  </p>
                </div>
              </div>

              <div className="lg:col-span-5 flex flex-wrap items-center lg:justify-end gap-3">
                <PWAInstallSection />
                <a
                  href={activeInstagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#9333EA] to-[#7E22CE] hover:opacity-95 text-white font-bold text-xs transition-opacity whitespace-nowrap shrink-0"
                >
                  <Instagram className="w-4 h-4" />
                  <span>Instagram @tragoocheck</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section
          id="preguntas"
          className="py-14 md:py-24 border-t border-[#E8E4EB]"
        >
          <div className="max-w-[900px] mx-auto px-4 sm:px-6 space-y-10">
            <div className="space-y-2">
              <div className="text-xs font-medium text-[#466B00]">
                Para salir con más calma · Dudas resueltas con claridad
              </div>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#201927]">
                Preguntas frecuentes
              </h2>
            </div>

            <div className="divide-y divide-[#E8E4EB] border-t border-b border-[#E8E4EB]">
              {FAQS.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                const answer = idx === 0
                  ? merchantConfig.hasStripeCheckout
                    ? `Agrega tus productos al carrito, revisa el total y el envío y paga con tarjeta en el checkout seguro de Stripe. Después puedes enviar el folio por WhatsApp para coordinar el envío.`
                    : `Agrega tus productos al carrito y revisa el total y el envío. Escríbenos por WhatsApp para solicitar un link de pago con tarjeta.`
                  : idx === 2
                    ? `El envío cuesta $99 MXN cuando el pedido no alcanza el mínimo de envío gratis. Durante El Buen Fin (13 al 17 de noviembre de 2026), el envío es gratis desde $799 MXN; fuera de esas fechas, desde $899 MXN. El monto y el método de envío se muestran antes de pagar.`
                  : faq.answer;
                return (
                  <div key={idx} className="py-5">
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between gap-4 text-left cursor-pointer"
                    >
                      <span className="text-sm sm:text-base font-bold text-[#201927]">
                        {faq.question}
                      </span>
                      <span className="text-[#466B00] shrink-0">
                        {isOpen ? (
                          <Minus className="w-5 h-5" />
                        ) : (
                          <Plus className="w-5 h-5" />
                        )}
                      </span>
                    </button>
                    {isOpen && (
                      <p className="mt-3 text-xs sm:text-sm text-[#51495B] leading-relaxed pr-4 sm:pr-8">
                        {answer}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E7E2EA] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-[#201927]">
                  ¿Lista para completar tu pedido?
                </h3>
                <p className="text-xs text-[#51495B]">
                  Atención inmediata en el <strong className="text-[#201927]">479 229 3687</strong> ·
                  {merchantConfig.hasStripeCheckout ? 'Paga con tarjeta en el checkout de Stripe; WhatsApp está disponible si necesitas ayuda.' : 'Solicita un link de pago con tarjeta por WhatsApp.'}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={handleOpenOrder}
                  className="px-5 py-3 rounded-xl bg-[#A3E635] hover:bg-[#B4E75B] text-[#0B0910] font-bold text-xs transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  Abrir carrito ({cartCount})
                </button>
                <a
                  href={`https://wa.me/${cleanWhatsAppPhone}?text=${encodeURIComponent(
                    'Hola Tragoo Check. Quiero solicitar un link de pago con tarjeta para mi pedido.'
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl border border-[#E1DCE6] text-xs font-semibold text-[#201927] hover:bg-[#F4F1F6] transition-colors whitespace-nowrap shrink-0"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-[#466B00]" />
                  <span>WhatsApp 479 229 3687</span>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer with Instagram, Domain Status & Seller Order Panel Trigger */}
      <footer className="border-t border-[#E8E4EB] bg-[#F8F7FA] py-10">
        <div className="max-w-[1160px] mx-auto px-4 sm:px-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-start gap-3.5 max-w-xl">
            <TragooLogoIcon className="w-10 h-10 mt-0.5" />
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="font-display text-base font-extrabold text-[#201927]">
                  Tragoo <span className="text-[#466B00]">Check</span>
                </span>
                <span className="text-xs text-[#766D80]">·</span>
                <a
                  href={activeInstagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-[#466B00] hover:underline"
                >
                  <Instagram className="w-3.5 h-3.5" />
                  <span>{INSTAGRAM_HANDLE}</span>
                </a>
                <span className="text-xs text-[#766D80]">·</span>
                <span className="inline-flex items-center gap-1 text-xs text-[#51495B] font-mono">
                  <Globe className="w-3 h-3 text-[#7133A0]" />
                  {merchantConfig.customDomain || 'tragoocheck.shop'}
                </span>
              </div>
              <p className="text-xs text-[#665D70] leading-relaxed">
              Compra en línea o por WhatsApp 479 229 3687. Pedidos menores a ${freeShippingThreshold.toLocaleString('es-MX')} MXN pagan $99 MXN de
                envío; envío gratis en compras desde ${freeShippingThreshold.toLocaleString('es-MX')} MXN.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {import.meta.env.DEV && <button
              type="button"
              onClick={() => setIsMerchantPanelOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#A3E635] hover:bg-[#B4E75B] text-[#0B0910] text-xs font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>
                Panel de Pedidos · Dominio · WhatsApp ({orders.length})
              </span>
            </button>}
          </div>
        </div>
      </footer>

      {/* Mobile Sticky Bottom Bar (Android & iOS App Experience) */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E7E2EA] px-3 py-2.5 flex items-center justify-between gap-2 shadow-2xl">
        <PWAInstallSection compact />

        <button
          type="button"
          onClick={handleOpenOrder}
          className="flex-1 py-2.5 px-3.5 rounded-xl bg-[#A3E635] hover:bg-[#B4E75B] text-[#0B0910] font-extrabold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-[#A3E635]/15"
        >
          <MessageCircle className="w-4 h-4 shrink-0" />
          <span className="truncate">
            {cartCount ? `Ir al pago (${cartCount}) · $${cartTotalEstimate.toLocaleString('es-MX')}` : 'Ver kits y precios'}
          </span>
        </button>
      </div>

      {/* Slide-over checkout: Stripe card payment or WhatsApp payment link */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onAddProduct={(p) => handleAddToCart(p, false)}
        onClearCart={() => setCart([])}
        merchantConfig={merchantConfig}
        onOrderCreated={(newOrder) => setOrders((prev) => [newOrder, ...prev])}
        initialCouponCode={selectedCouponCode}
      />

      {/* Merchant Admin, Live Orders & Domain Integration Modal */}
      <MerchantPanelModal
        isOpen={isMerchantPanelOpen}
        onClose={() => setIsMerchantPanelOpen(false)}
        config={merchantConfig}
        onConfigUpdated={(updated) => setMerchantConfig(updated)}
        orders={orders}
        onOrdersUpdated={(updatedOrders) => setOrders(updatedOrders)}
      />
      <Analytics beforeSend={analyticsBeforeSend} />
    </div>
  );
}
