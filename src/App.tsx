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
  Copy,
  Tag,
  Instagram,
  Globe,
  ClipboardList,
  Video,
  CreditCard,
  Store,
  Building2,
  Menu,
  X,
} from 'lucide-react';
import {
  PRODUCT_KITS,
  PROMO_BUNDLES,
  ALL_PRODUCTS,
  ACTIVE_COUPONS,
  HERO_PRODUCT_IMAGE,
  BACK_POUCH_INSTRUCTIONS_IMAGE,
  INSTAGRAM_URL,
  INSTAGRAM_HANDLE,
  FAQS,
  ProductKit,
} from './data/products';
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
import squadPackImage from './assets/images/tragoo_pack_squad_5x_1792022755033.jpg';

const DEFAULT_CONFIG: MerchantConfigClient = {
  bankName: 'BBVA México / STP (SPEI) / OXXO',
  clabe: '012180015489203148',
  accountHolder: 'Tragoo Check México',
  cardNumberRef: 'Pago en OXXO o Link de Pago por WhatsApp',
  whatsappNumber: '524792293687',
  instagramUrl: INSTAGRAM_URL,
  customDomain: 'tragoocheck.shop',
  videoUrl: '/tragoo-oficial.mp4',
  shippingFee: 99,
  freeShippingThreshold: 899,
  speiDiscountPercent: 5,
  hasLiveStripeKey: false,
  stripePaymentLinks: {},
};

export default function App() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [heroView, setHeroView] = useState<
    'video' | 'empaque' | 'reverso' | 'squad'
  >('video');
  const [catalogFilter, setCatalogFilter] = useState<
    'all' | 'individual' | 'promocion'
  >('all');
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
  const [copiedClabeBanner, setCopiedClabeBanner] = useState(false);
  const [stripeReturnFolio, setStripeReturnFolio] = useState<string | null>(
    null
  );

  useEffect(() => {
    fetch('/api/config')
      .then((r) => r.json())
      .then((data) => {
        if (data && data.clabe) setMerchantConfig(data);
      })
      .catch(() => {});

    fetch('/api/orders')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setOrders(data);
      })
      .catch(() => {});

    const params = new URLSearchParams(window.location.search);
    if (params.get('stripe_success') === '1' && params.get('folio')) {
      setStripeReturnFolio(params.get('folio'));
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

  const handleCopyQuickClabe = () => {
    navigator.clipboard.writeText(merchantConfig.clabe.replace(/\s+/g, ''));
    setCopiedClabeBanner(true);
    setTimeout(() => setCopiedClabeBanner(false), 2000);
  };

  const displayedRetailProducts =
    catalogFilter === 'individual'
      ? PRODUCT_KITS
      : catalogFilter === 'promocion'
      ? PROMO_BUNDLES
      : [...PRODUCT_KITS, ...PROMO_BUNDLES];

  const activeHeroImage =
    heroView === 'empaque'
      ? HERO_PRODUCT_IMAGE
      : heroView === 'squad'
      ? squadPackImage
      : BACK_POUCH_INSTRUCTIONS_IMAGE;

  const activeInstagramUrl = merchantConfig.instagramUrl || INSTAGRAM_URL;
  const cleanWhatsAppPhone = normalizeWhatsAppPhone(
    merchantConfig.whatsappNumber
  );

  return (
    <div className="min-h-screen bg-[#0B0910] text-[#F8FAFC] flex flex-col pb-24 md:pb-0">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-40 bg-[#0B0910]/90 backdrop-blur-md border-b border-[#231E30]">
        <div className="max-w-[1160px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 sm:gap-8">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="#"
            className="font-display text-lg font-extrabold tracking-tight text-white whitespace-nowrap shrink-0"
          >
            Tragoo <span className="text-[#A3E635]">Check</span>
          </a>

          {/* Desktop navigation */}
          <nav aria-label="Navegación principal" className="hidden md:flex items-center gap-6 text-sm font-medium text-[#C4BED4]">
            <a
              href="#kits"
              className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Kits
            </a>
            <a
              href="#promociones"
              className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Promociones
            </a>
            <a
              href="#mayoreo"
              className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Mayoreo Premium
            </a>
            <a
              href="#simulador"
              className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Simulador 15s
            </a>
            <a
              href="#preguntas"
              className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Preguntas
            </a>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={handleOpenOrder}
              className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-lg bg-[#A3E635] hover:bg-[#BEF264] text-[#0B0910] font-bold text-xs transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>{cartCount ? `Pedir por WhatsApp · (${cartCount})` : 'Ver kits y precios'}</span>
            </button>
            <button
              type="button"
              aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-navigation"
              onClick={() => setIsMobileMenuOpen((open) => !open)}
              className="md:hidden ml-2 p-2 rounded-lg border border-[#2E2840] text-white hover:bg-[#1C1729]"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        {isMobileMenuOpen && (
          <nav id="mobile-navigation" aria-label="Navegación móvil" className="md:hidden border-t border-[#231E30] bg-[#0B0910] px-4 py-3 grid grid-cols-2 gap-2 text-sm">
            {[
              ['Kits', '#kits'],
              ['Promociones', '#promociones'],
              ['Mayoreo', '#mayoreo'],
              ['Simulador', '#simulador'],
              ['Preguntas', '#preguntas'],
            ].map(([label, href]) => (
              <a key={href} href={href} onClick={() => setIsMobileMenuOpen(false)} className="rounded-lg px-3 py-3 text-[#E4E0EB] hover:bg-[#1C1729]">{label}</a>
            ))}
          </nav>
        )}
      </header>

      {/* Optional Stripe Return Confirmation Banner */}
      {stripeReturnFolio && (
        <div className="bg-[#172312] border-b border-[#A3E635]/40 px-4 py-3">
          <div className="max-w-[1160px] mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-white">
              <ShieldCheck className="w-4 h-4 text-[#A3E635]" />
              <span>
                ¡Tu pedido{' '}
                <strong className="font-mono text-[#A3E635]">
                  {stripeReturnFolio}
                </strong>{' '}
                fue confirmado con éxito!
              </span>
            </div>
            <button
              type="button"
              onClick={() => setStripeReturnFolio(null)}
              className="text-[#A3E635] hover:underline font-medium cursor-pointer"
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
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#A3E635] font-medium">
                    <span>Tienda Oficial México</span>
                    <span aria-hidden="true" className="text-[#524A68]">
                      ·
                    </span>
                    <a
                      href={activeInstagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[#C4BED4] hover:text-white underline underline-offset-4"
                    >
                      <Instagram className="w-3.5 h-3.5 text-[#A855F7]" />
                      <span>{INSTAGRAM_HANDLE}</span>
                    </a>
                    <span aria-hidden="true" className="text-[#524A68]">
                      ·
                    </span>
                    <span className="text-[#C4BED4]">
                      WhatsApp 479 229 3687 · Link de Pago, OXXO o SPEI
                    </span>
                  </div>

                  <h1
                    className="font-display font-extrabold tracking-tight text-white leading-[1.08] [text-wrap:balance]"
                    style={{ fontSize: 'clamp(2.15rem, 4vw, 3.75rem)' }}
                  >
                    Checa antes de{' '}
                    <span className="text-[#A3E635]">brindar.</span>
                  </h1>

                  <p className="text-sm sm:text-base md:text-lg text-[#C4BED4] leading-relaxed max-w-2xl">
                    Pruebas portátiles en{' '}
                    <strong className="text-white">stickers para uñas</strong> y{' '}
                    <strong className="text-white">tiras reactivas</strong> con
                    estuche llavero mini-tumbler, diseñadas para indicar la posible
                    presencia de algunas sustancias según el tipo de prueba y sus
                    instrucciones. Envía tu pedido
                    directo a nuestro WhatsApp y recibe tu{' '}
                    <strong className="text-white">
                      Link de Pago, ficha OXXO o SPEI (-5%)
                    </strong>
                    .
                  </p>
                  <p className="max-w-2xl rounded-lg border border-amber-400/30 bg-amber-400/5 px-3.5 py-3 text-xs sm:text-sm leading-relaxed text-amber-100" role="note">
                    <strong>Importante:</strong> es una prueba orientativa de un solo uso, no confirma que una bebida sea segura. Un resultado sin cambio visible no descarta otras sustancias. Si sospechas que fue manipulada, no la tomes; aléjate con alguien de confianza y busca ayuda.
                  </p>
                </div>

                {/* Primary & Secondary Action Row + PWA Install */}
                <div className="space-y-4 pt-1 sm:pt-2">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleBuyNow(PRODUCT_KITS[0])}
                      className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#A3E635] hover:bg-[#BEF264] text-[#0B0910] font-bold text-sm transition-colors cursor-pointer whitespace-nowrap shrink-0 shadow-lg shadow-[#A3E635]/10"
                    >
                      <MessageCircle className="w-4 h-4 shrink-0" />
                      <span>Pedir Kit Noche Completa · $449 MXN</span>
                      <ArrowRight className="w-4 h-4 shrink-0" />
                    </button>

                    <a
                      href="#mayoreo"
                      className="inline-flex items-center justify-center px-5 py-3.5 rounded-xl bg-[#14111D] hover:bg-[#1C1729] border border-[#2E2840] text-sm font-semibold text-white transition-colors whitespace-nowrap shrink-0"
                    >
                      Mayoreo Premium (Hasta -63%)
                    </a>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 pt-1">
                    <PWAInstallSection />

                    {import.meta.env.DEV && <button
                      type="button"
                      onClick={() => setIsMerchantPanelOpen(true)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#14111D] hover:bg-[#1D182B] border border-[#2E2840] text-xs font-semibold text-[#C4BED4] hover:text-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <ClipboardList className="w-3.5 h-3.5 text-[#A3E635]" />
                      <span>Panel de Pedidos y Dominio ({orders.length})</span>
                    </button>}
                  </div>

                  <p className="text-xs text-[#8E87A0] leading-relaxed max-w-xl">
                    <strong className="text-[#C4BED4]">Regla de envíos:</strong>{' '}
                    Pedidos de 1 sola pieza o menores a{' '}
                    <strong className="text-white">$899 MXN</strong> pagan{' '}
                    <strong className="text-white">$99 MXN</strong> de envío. A
                    partir de <strong className="text-[#A3E635]">$899 MXN</strong>{' '}
                    (Pack Trío 3x, Pack Squad 5x y todas las Cajas de Mayoreo) el{' '}
                    <strong className="text-[#A3E635]">
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
                  <div className="relative flex-1 min-h-[320px] sm:min-h-[360px] rounded-2xl overflow-hidden border border-[#262136] bg-[#E2E2E2] flex flex-col justify-end">
                    <img
                      src={activeHeroImage}
                      alt="Empaque oficial Tragoo Check Kit Noche Completa con llavero mini-tumbler"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 sm:p-5">
                      <div className="flex items-center justify-between text-xs text-[#A3E635] font-mono">
                        <span>
                          {heroView === 'empaque'
                            ? 'KIT NOCHE COMPLETA · BOLSA DOY-PACK + LLAVERO'
                            : heroView === 'reverso'
                            ? 'REVERSO OFICIAL · INSTRUCCIONES Y ESCALA DE COLOR'
                            : 'PACK SQUAD 5X · 5 BOLSAS + 5 LLAVEROS'}
                        </span>
                        <span>@TRAGOOCHECK</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Interactive Gallery Switcher (4 Tabs: Video 00:16s + 3 Product Views) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setHeroView('video')}
                    className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-colors cursor-pointer ${
                      heroView === 'video'
                        ? 'bg-[#171F12] border-[#A3E635] text-white'
                        : 'bg-[#14111D]/60 border-[#262136] text-[#A19BB2] hover:text-white'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-lg bg-[#A3E635]/20 border border-[#A3E635]/50 flex items-center justify-center text-[#A3E635] shrink-0">
                      <Video className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate">Video Oficial</div>
                      <div className="text-[10px] text-[#A3E635] truncate">
                        No huele, no se ve
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setHeroView('empaque')}
                    className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-colors cursor-pointer ${
                      heroView === 'empaque'
                        ? 'bg-[#14111D] border-[#A3E635] text-white'
                        : 'bg-[#14111D]/60 border-[#262136] text-[#A19BB2] hover:text-white'
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
                    onClick={() => setHeroView('reverso')}
                    className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-colors cursor-pointer ${
                      heroView === 'reverso'
                        ? 'bg-[#14111D] border-[#A3E635] text-white'
                        : 'bg-[#14111D]/60 border-[#262136] text-[#A19BB2] hover:text-white'
                    }`}
                  >
                    <img
                      src={BACK_POUCH_INSTRUCTIONS_IMAGE}
                      alt="Reverso Instructivo"
                      referrerPolicy="no-referrer"
                      className="w-9 h-9 rounded-lg object-cover shrink-0"
                    />
                    <span className="text-xs font-semibold truncate">
                      Reverso Guía
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setHeroView('squad')}
                    className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-colors cursor-pointer ${
                      heroView === 'squad'
                        ? 'bg-[#14111D] border-[#A3E635] text-white'
                        : 'bg-[#14111D]/60 border-[#262136] text-[#A19BB2] hover:text-white'
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
              <div className="p-4 rounded-xl bg-[#14111D] border border-[#231E30]">
                <div className="font-mono text-base sm:text-lg font-bold text-[#A3E635] tabular-nums">
                  WhatsApp 479 229 3687
                </div>
                <div className="text-xs text-[#C4BED4] mt-0.5">
                  Envía tu pedido directo por WhatsApp y recibe al instante tu{' '}
                  <strong className="text-white">
                    Link de Pago o ficha OXXO
                  </strong>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#14111D] border border-[#231E30]">
                <div className="font-mono text-base sm:text-lg font-bold text-white tabular-nums">
                  Envío Gratis ≥ $899
                </div>
                <div className="text-xs text-[#C4BED4] mt-0.5">
                  Pedidos de 1 pieza o menores a $899 MXN pagan $99 MXN de envío a
                  todo México
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#14111D] border border-[#231E30]">
                <div className="font-mono text-base sm:text-lg font-bold text-white tabular-nums">
                  $449 → $165 MXN
                </div>
                <div className="text-xs text-[#C4BED4] mt-0.5">
                  Entre más grande sea tu pedido, menor es el precio unitario por
                  kit garantizado
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#14111D] border border-[#231E30]">
                <div className="font-mono text-base sm:text-lg font-bold text-white tabular-nums">
                  Instalable en Android y iPhone
                </div>
                <div className="text-xs text-[#C4BED4] mt-0.5">
                  Añade el sitio a tu pantalla de inicio en Android o iPhone y síguenos en{' '}
                  <a
                    href={activeInstagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#A3E635] underline"
                  >
                    @tragoocheck
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ACTIVE PROMOTIONS & COUPONS BAR */}
        <section id="promociones" className="py-12 border-t border-[#231E30] bg-[#100D18]">
          <div className="max-w-[1160px] mx-auto px-4 sm:px-6 space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-1.5">
                <div className="text-xs font-medium text-[#A3E635]">
                  Promociones de lanzamiento · Acumulables con el 5% extra por Transferencia SPEI
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  Cupones activos hoy y Paquetes Grupales (Envío Gratis desde $899 MXN)
                </h2>
              </div>
              <span className="text-xs text-[#A19BB2]">
                Toca cualquier cupón para aplicarlo automáticamente en tu pedido de WhatsApp
              </span>
            </div>

            {/* 3 Active Coupon Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {ACTIVE_COUPONS.map((coupon) => (
                <div
                  key={coupon.code}
                  className="p-5 rounded-xl bg-[#14111D] border border-[#262136] flex flex-col justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm font-bold text-[#A3E635] flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5" />
                        {coupon.code}
                      </span>
                      <span className="text-xs text-white font-semibold">
                        {coupon.label}
                      </span>
                    </div>
                    <p className="text-xs text-[#C4BED4] leading-relaxed">
                      {coupon.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#231E30]">
                    <span className="text-[11px] text-[#8E87A0] font-mono">
                      Compra mín: ${coupon.minPurchase.toLocaleString('es-MX')} MXN
                    </span>
                    <button
                      type="button"
                      onClick={() => handleActivateCoupon(coupon.code)}
                      className="text-xs font-bold text-[#A3E635] hover:underline cursor-pointer whitespace-nowrap shrink-0"
                    >
                      Activar cupón →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURED CATALOG: INDIVIDUALS + MULTIPACK PROMOTIONS */}
        <section id="kits" className="py-14 md:py-24 border-t border-[#231E30]">
          <div className="max-w-[1160px] mx-auto px-4 sm:px-6 space-y-10">
            {/* Header + Interactive Category Filter Tabs */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
              <div className="space-y-2">
                <div className="text-xs font-medium text-[#A3E635]">
                  Catálogo personal y grupal · A mayor cantidad, menor precio por pieza
                </div>
                <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white [text-wrap:balance]">
                  Elige tu Kit Individual o Pack de Promoción.
                </h2>
              </div>

              {/* Responsive filter controls */}
              <div role="group" aria-label="Filtrar catálogo" className="grid grid-cols-1 sm:grid-cols-3 gap-1 w-full lg:w-auto p-1 bg-[#14111D] border border-[#262136] rounded-xl self-start">
                <button
                  type="button"
                  onClick={() => setCatalogFilter('all')}
                  aria-pressed={catalogFilter === 'all'}
                  className={`px-3.5 sm:px-4 py-2.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                    catalogFilter === 'all'
                      ? 'bg-[#A3E635] text-[#0B0910] font-bold'
                      : 'text-[#C4BED4] hover:text-white'
                  }`}
                >
                  Todos ({PRODUCT_KITS.length + PROMO_BUNDLES.length})
                </button>
                <button
                  type="button"
                  onClick={() => setCatalogFilter('individual')}
                  aria-pressed={catalogFilter === 'individual'}
                  className={`px-3.5 sm:px-4 py-2.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                    catalogFilter === 'individual'
                      ? 'bg-[#A3E635] text-[#0B0910] font-bold'
                      : 'text-[#C4BED4] hover:text-white'
                  }`}
                >
                  1 Pieza / Individuales ({PRODUCT_KITS.length})
                </button>
                <button
                  type="button"
                  onClick={() => setCatalogFilter('promocion')}
                  aria-pressed={catalogFilter === 'promocion'}
                  className={`px-3.5 sm:px-4 py-2.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                    catalogFilter === 'promocion'
                      ? 'bg-[#A3E635] text-[#0B0910] font-bold'
                      : 'text-[#C4BED4] hover:text-white'
                  }`}
                >
                  Packs Ahorro 2x a 10x ({PROMO_BUNDLES.length})
                </button>
              </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
              {displayedRetailProducts.map((kit) => (
                <article
                  key={kit.id}
                  className={`rounded-2xl bg-[#14111D] border flex flex-col justify-between overflow-hidden transition-transform duration-150 hover:-translate-y-0.5 ${
                    kit.featured ? 'border-[#A3E635]' : 'border-[#262136]'
                  }`}
                >
                  <div>
                    <div className="relative aspect-[4/3] w-full bg-[#E2E2E2] border-b border-[#231E30] overflow-hidden">
                      <img
                        src={kit.image}
                        alt={kit.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="p-5 sm:p-6 space-y-4">
                      {/* Unboxed Metadata Kicker */}
                      <div className="text-xs font-medium text-[#A3E635]">
                        {kit.kicker}
                      </div>

                      <div className="space-y-1">
                        <h3 className="text-lg sm:text-xl font-bold text-white leading-snug">
                          {kit.name}
                        </h3>
                        {kit.unitPriceLabel && (
                          <div className="text-xs text-[#A3E635] font-mono font-semibold">
                            {kit.unitPriceLabel}
                          </div>
                        )}
                      </div>

                      <div className="flex items-baseline gap-2">
                        {kit.compareAtPrice && (
                          <span className="font-mono text-xs text-[#7D7691] line-through tabular-nums">
                            ${kit.compareAtPrice.toLocaleString('es-MX')}
                          </span>
                        )}
                        <span className="font-mono text-2xl font-extrabold text-white tabular-nums">
                          ${kit.price.toLocaleString('es-MX')}
                        </span>
                        <span className="text-xs text-[#A19BB2]">MXN</span>
                      </div>

                      <p className="text-xs sm:text-sm text-[#C4BED4] leading-relaxed">
                        {kit.subtitle}
                      </p>

                      <div className="pt-2 border-t border-[#231E30] space-y-1.5 text-xs">
                        <div>
                          <span className="text-[#8E87A0] block">Contenido:</span>
                          <span className="text-white font-medium">
                            {kit.contentsSummary}
                          </span>
                        </div>
                        <div>
                          <span className="text-[#8E87A0] block">
                            Detecta, según fabricante:
                          </span>
                          <span className="text-[#C4BED4]">
                            {kit.substancesDetected}
                          </span>
                        </div>
                      </div>

                      <ul className="space-y-1.5 pt-1 text-xs text-[#A19BB2]">
                        {kit.includedItems.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Check className="w-3.5 h-3.5 text-[#A3E635] shrink-0 mt-0.5" />
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
                      className="w-full py-3 px-4 rounded-xl bg-[#A3E635] hover:bg-[#BEF264] text-[#0B0910] font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        Pedir por WhatsApp · ${kit.price.toLocaleString('es-MX')} MXN
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddToCart(kit, true)}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#1C1728] hover:bg-[#262036] text-white font-medium text-xs transition-colors cursor-pointer whitespace-nowrap"
                    >
                      Agregar al carrito
                    </button>
                  </div>
                </article>
              ))}
            </div>

            {/* Direct WhatsApp 479 229 3687 Payment Methods Banner (Link de Pago, OXXO, SPEI) */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[#110E19] border border-[#262136] space-y-5">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-[#A3E635]">
                    Pagos 100% seguros directo por WhatsApp · Atención inmediata al 479 229 3687
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white">
                    Envía tu pedido a WhatsApp y elige cómo pagar al instante:
                  </h3>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={handleOpenOrder}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#A3E635] hover:bg-[#BEF264] text-[#0B0910] text-xs font-bold transition-colors cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Abrir Carrito y Enviar a WhatsApp ({cartCount})</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyQuickClabe}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#1E192B] hover:bg-[#2A233B] text-xs font-semibold text-white transition-colors cursor-pointer"
                  >
                    {copiedClabeBanner ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#A3E635]" />
                        <span>CLABE Copiada</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-[#A3E635]" />
                        <span>Copiar CLABE SPEI</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                <div className="p-4 rounded-xl bg-[#14111D] border border-[#231E30] space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <CreditCard className="w-4 h-4 text-[#A3E635]" />
                    <span>1. Link de Pago con Tarjeta</span>
                  </div>
                  <p className="text-xs text-[#C4BED4] leading-relaxed">
                    Al enviar tu pedido a nuestro WhatsApp{' '}
                    <strong className="text-white">479 229 3687</strong>, te
                    compartimos tu link oficial de cobro para pagar con tarjeta de
                    débito o crédito y tu confirmación.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#14111D] border border-[#231E30] space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Store className="w-4 h-4 text-[#A3E635]" />
                    <span>2. Pago en Efectivo en OXXO</span>
                  </div>
                  <p className="text-xs text-[#C4BED4] leading-relaxed">
                    ¿Prefieres pagar en efectivo? Selecciona{' '}
                    <strong className="text-white">Pago en OXXO</strong> en tu
                    carrito y te enviaremos los datos por WhatsApp para depositar en
                    cualquier tienda OXXO.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#14111D] border border-[#231E30] space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Building2 className="w-4 h-4 text-[#A3E635]" />
                    <span>3. Transferencia SPEI (-5% Extra)</span>
                  </div>
                  <p className="text-xs text-[#C4BED4] leading-relaxed">
                    Obtén <strong className="text-[#A3E635]">5% de descuento adicional</strong>{' '}
                    pagando por transferencia bancaria SPEI (CLABE:{' '}
                    <span className="font-mono text-white">
                      {merchantConfig.clabe}
                    </span>
                    ).
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
          className="py-14 md:py-24 border-t border-[#231E30]"
        >
          <div className="max-w-[1160px] mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
              {/* Left 6 Cols: Exact 4 Steps & Verbatim Safety Bullet Points from Back of Pouch */}
              <div className="lg:col-span-6 space-y-6">
                <div className="space-y-1.5">
                  <div className="text-xs font-semibold text-[#A3E635]">
                    Reverso Oficial del Empaque · Stickers de Detección para Uñas
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white">
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
                      className="p-3.5 rounded-xl bg-[#14111D] border border-[#262136] flex items-center gap-3.5"
                    >
                      <span className="w-7 h-7 rounded-full bg-[#A3E635] text-[#0B0910] font-mono font-extrabold text-sm flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-sm font-medium text-white">
                        {stepText}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Highlighted Warning from Pouch */}
                <div className="p-4 rounded-xl bg-[#14111D] border border-[#A855F7]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-sm sm:text-base font-bold text-white">
                    Si observas el cambio de color indicado por el fabricante,{' '}
                    <span className="text-[#A3E635]">NO TOMES.</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-semibold shrink-0">
                    <span className="inline-flex items-center gap-1.5 text-yellow-300">
                      <span className="w-3 h-3 rounded-full bg-yellow-400 inline-block" />
                      Sin cambio visible
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-[#A3E635]">
                      <span className="w-3 h-3 rounded-full bg-gradient-to-r from-yellow-400 to-[#22C55E] inline-block" />
                      Posible reacción
                    </span>
                  </div>
                </div>

                {/* Exact Verbatim Información de Seguridad Importante */}
                <div className="p-5 sm:p-6 rounded-2xl bg-[#14111D] border border-[#2E2840] space-y-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-[#A855F7]/40 pb-3">
                    <AlertTriangle className="w-4 h-4 text-[#A3E635] shrink-0" />
                    <span>Información de Seguridad Importante</span>
                  </div>

                  <ul className="space-y-2.5 text-xs text-[#C4BED4] leading-relaxed">
                    <li className="flex items-start gap-2.5">
                      <span className="text-[#A3E635] font-bold">•</span>
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
                      <span className="text-[#A3E635] font-bold">•</span>
                      <span>Diseñado para un solo uso. No reutilizar.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-[#A3E635] font-bold">•</span>
                      <span>
                        El lavado de manos es posible con el sticker puesto, pero la
                        exposición a ciertos jabones o químicos puede reducir la
                        detección o provocar un cambio de color falso.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-[#A3E635] font-bold">•</span>
                      <span>
                        Este producto no está clasificado como dispositivo médico de
                        diagnóstico in vitro (IVD) y no está sujeto a regulaciones de
                        la FDA para kits de autoprueba.
                      </span>
                    </li>
                  </ul>

                  <div className="pt-3 border-t border-[#231E30] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#A19BB2]">
                    <div>
                      <span className="text-[#A3E635] font-bold">
                        tragoocheck.shop · @tragoocheck
                      </span>{' '}
                      · Distribuido por Tragoo Check S.A. de C.V. México. / Caduca
                      01/2033.
                    </div>
                    <span className="font-mono font-bold text-[#A3E635]">
                      HECHO EN MÉXICO
                    </span>
                  </div>
                </div>
              </div>

              {/* Right 6 Cols: Official Back of Pouch Photo */}
              <div className="lg:col-span-6">
                <div className="rounded-2xl overflow-hidden border border-[#2E2840] bg-[#E2E2E2]">
                  <img
                    src={BACK_POUCH_INSTRUCTIONS_IMAGE}
                    alt="Reverso oficial del empaque Tragoo Check — Cómo aplicar e Información de Seguridad Importante"
                    referrerPolicy="no-referrer"
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* INSTAGRAM @TRAGOOCHECK + ANDROID/IOS PWA INSTALL BANNER */}
        <section className="py-12 sm:py-14 border-t border-[#231E30] bg-[#100D18]">
          <div className="max-w-[1160px] mx-auto px-4 sm:px-6">
            <div className="p-6 sm:p-8 rounded-2xl bg-[#14111D] border border-[#2E2840] grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-7 flex items-start sm:items-center gap-4">
                <TragooLogoIcon className="w-14 h-14 sm:w-16 sm:h-16" />
                <div className="space-y-1.5">
                  <div className="text-xs font-semibold text-[#A3E635]">
                    App Instalable Android & iPhone (iOS) · Comunidad @tragoocheck
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white">
                    Instala Tragoo Check en tu celular y síguenos en {INSTAGRAM_HANDLE}
                  </h3>
                  <p className="text-xs text-[#C4BED4] leading-relaxed">
                    Agrega el icono oficial de <strong className="text-white">Tragoo Check</strong>{' '}
                    a tu pantalla de inicio en <strong className="text-white">Android o iPhone</strong>{' '}
                    para pedir kits por WhatsApp o consultar la escala de colores en 15 segundos.
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
          className="py-14 md:py-24 border-t border-[#231E30]"
        >
          <div className="max-w-[900px] mx-auto px-4 sm:px-6 space-y-10">
            <div className="space-y-2">
              <div className="text-xs font-medium text-[#A3E635]">
                Para salir con más calma · Dudas resueltas con claridad
              </div>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white">
                Preguntas frecuentes
              </h2>
            </div>

            <div className="divide-y divide-[#231E30] border-t border-b border-[#231E30]">
              {FAQS.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div key={idx} className="py-5">
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between gap-4 text-left cursor-pointer"
                    >
                      <span className="text-sm sm:text-base font-bold text-white">
                        {faq.question}
                      </span>
                      <span className="text-[#A3E635] shrink-0">
                        {isOpen ? (
                          <Minus className="w-5 h-5" />
                        ) : (
                          <Plus className="w-5 h-5" />
                        )}
                      </span>
                    </button>
                    {isOpen && (
                      <p className="mt-3 text-xs sm:text-sm text-[#C4BED4] leading-relaxed pr-4 sm:pr-8">
                        {faq.answer}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="p-6 sm:p-8 rounded-2xl bg-[#14111D] border border-[#262136] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">
                  ¿Lista para enviar tu pedido directo por WhatsApp?
                </h3>
                <p className="text-xs text-[#C4BED4]">
                  Atención inmediata en el <strong className="text-white">479 229 3687</strong> ·
                  Recibe tu Link de Pago, ficha OXXO o SPEI (-5% extra).
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={handleOpenOrder}
                  className="px-5 py-3 rounded-xl bg-[#A3E635] hover:bg-[#BEF264] text-[#0B0910] font-bold text-xs transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  Enviar Pedido ({cartCount})
                </button>
                <a
                  href={`https://wa.me/${cleanWhatsAppPhone}?text=${encodeURIComponent(
                    'Hola Tragoo Check! Quiero hacer un pedido y recibir mi link de pago o ficha OXXO.'
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl border border-[#2E2840] text-xs font-semibold text-white hover:bg-[#1C1728] transition-colors whitespace-nowrap shrink-0"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-[#A3E635]" />
                  <span>WhatsApp 479 229 3687</span>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer with Instagram, Domain Status & Seller Order Panel Trigger */}
      <footer className="border-t border-[#231E30] bg-[#09070D] py-10">
        <div className="max-w-[1160px] mx-auto px-4 sm:px-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-start gap-3.5 max-w-xl">
            <TragooLogoIcon className="w-10 h-10 mt-0.5" />
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="font-display text-base font-extrabold text-white">
                  Tragoo <span className="text-[#A3E635]">Check</span>
                </span>
                <span className="text-xs text-[#524A68]">·</span>
                <a
                  href={activeInstagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-[#A3E635] hover:underline"
                >
                  <Instagram className="w-3.5 h-3.5" />
                  <span>{INSTAGRAM_HANDLE}</span>
                </a>
                <span className="text-xs text-[#524A68]">·</span>
                <span className="inline-flex items-center gap-1 text-xs text-[#C4BED4] font-mono">
                  <Globe className="w-3 h-3 text-[#A855F7]" />
                  {merchantConfig.customDomain || 'tragoocheck.shop'}
                </span>
              </div>
              <p className="text-xs text-[#8E87A0] leading-relaxed">
                Pedidos directos al WhatsApp 479 229 3687 (Link de pago, OXXO o
                SPEI). Pedidos de 1 sola pieza o menores a $899 MXN pagan $99 MXN de
                envío; envío gratis en compras desde $899 MXN.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {import.meta.env.DEV && <button
              type="button"
              onClick={() => setIsMerchantPanelOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#A3E635] hover:bg-[#BEF264] text-[#0B0910] text-xs font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0"
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
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#0F0C16]/95 backdrop-blur-md border-t border-[#262136] px-3 py-2.5 flex items-center justify-between gap-2 shadow-2xl">
        <PWAInstallSection compact />

        <button
          type="button"
          onClick={handleOpenOrder}
          className="flex-1 py-2.5 px-3.5 rounded-xl bg-[#A3E635] hover:bg-[#BEF264] text-[#0B0910] font-extrabold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-[#A3E635]/15"
        >
          <MessageCircle className="w-4 h-4 shrink-0" />
          <span className="truncate">
            {cartCount ? `Enviar Pedido a WhatsApp (${cartCount}) · $${cartTotalEstimate.toLocaleString('es-MX')}` : 'Ver kits y precios'}
          </span>
        </button>
      </div>

      {/* Slide-Over Checkout Drawer (WhatsApp 479 229 3687: Link de Pago, OXXO, SPEI + $899 Rule) */}
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
    </div>
  );
}
