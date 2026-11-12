import {
  BUEN_FIN_END,
  BUEN_FIN_START,
  NOVEMBER_PROMOTION_END,
} from './promotionRules';
import { DELIVERY_POLICY, RETURN_POLICY } from './storePolicies';

export type ProductCategory = 'individual' | 'promocion' | 'mayoreo' | 'familia' | 'navidad';

export interface ProductKit {
  id: string;
  category: ProductCategory;
  name: string;
  subtitle: string;
  kicker: string;
  price: number;
  compareAtPrice?: number;
  unitPriceNumeric: number;
  unitPriceLabel: string;
  kitEquivalentCount: number;
  image: string;
  gallery?: { src: string; alt: string }[];
  contentsSummary: string;
  substancesDetected: string;
  reactionTime: string;
  includedItems: string[];
  idealFor: string;
  stockCount: number | null;
  featured?: boolean;
}

export interface PromoCoupon {
  code: string;
  label: string;
  discountPercent: number;
  minPurchase: number;
  description: string;
  startsAt?: string;
  expiresAt?: string;
}

// Import assets through Vite so their URLs point to the built files in `dist`.
import heroProductImage from '../assets/images/tragoo-kit-noche-completa-logo-clean.webp';
import heroLifestyleImage from '../assets/images/hero_drink_test_1792021357545.jpg';
import wholesaleBoxImage from '../assets/images/tragoo_caja_mayoreo_display_1792022756046.jpg';
import wholesaleMasterImage from '../assets/images/tragoo_mayoreo_premium_master_1792024987601.jpg';
import kitStickersImage from '../assets/images/tragoo-sticker-corazon-closeup-clean.webp';
import kitStripsImage from '../assets/images/tragoo-kit-tiras-reactivas-clean.webp';
import duoPackImage from '../assets/images/tragoo-pack-kit-noche-completa-2-clean.webp';
import squadPackImage from '../assets/images/tragoo-pack-kit-noche-completa-5-clean.webp';
import packKits3Image from '../assets/images/tragoo-pack-kits-3-clean.webp';
import packKits4Image from '../assets/images/tragoo-pack-kits-4-clean.webp';
import packKits6Image from '../assets/images/tragoo-pack-kits-6-clean.webp';
import packKits8Image from '../assets/images/tragoo-pack-kits-8-clean.webp';
import packKits10Image from '../assets/images/tragoo-pack-kits-10-clean.webp';
import braceletDetailImage from '../assets/images/tragoo-pulsera-individual-clean.webp';
import braceletTrioImage from '../assets/images/tragoo-pulseras-trio-clean.webp';
import braceletGroupImage from '../assets/images/tragoo-pulseras-grupo-cinco-clean.webp';
import braceletRefillsImage from '../assets/images/tragoo-repuestos-pulseras-clean.webp';
import testingStrawsImage from '../assets/images/tragoo-popotes-prueba-clean.webp';
import cupCoverImage from '../assets/images/tragoo-protector-reusable-clean.webp';
import cupCoverLedImage from '../assets/images/tragoo-protector-led-logo-clean.png';
import heartBraceletImage from '../assets/images/tragoo-pulsera-corazon-clean.webp';
import nailStickers30Image from '../assets/images/tragoo-stickers-corazon-30-clean.webp';
import safeGlowSetImage from '../assets/images/tragoo-safeglow-set-white.webp';
import safeBagImage from '../assets/images/tragoo-safebag-white.webp';
import personalAlarmImage from '../assets/images/tragoo-personal-alarm-white.webp';
import sosFamilyBluetoothImage from '../assets/images/tragoo-sos-family-bluetooth-pack-clean.webp';
import sosFamilyGpsImage from '../assets/images/tragoo-sos-family-gps-pack-clean.webp';
import christmasSmartCupImage from '../assets/images/tragoo-navidad-vaso-led-individual.png';
import christmasCupSizesImage from '../assets/images/tragoo-navidad-vasos-led-colores.png';

export const HERO_PRODUCT_IMAGE = heroProductImage;
export const HERO_LIFESTYLE_IMAGE = heroLifestyleImage;
export const KIT_STICKERS_IMAGE = kitStickersImage;
export const WHOLESALE_BOX_IMAGE = wholesaleBoxImage;
export const WHOLESALE_MASTER_IMAGE = wholesaleMasterImage;

export const CHRISTMAS_PRODUCTS: ProductKit[] = [
  {
    id: 'vaso-inteligente-navidad', category: 'navidad', name: 'Vaso Inteligente Tragoo Check · Detección y LED',
    subtitle: 'Vaso reutilizable con detección de alteración en bebidas e indicador LED multicolor. Incluye tapa con popote y recarga USB-C; ideal para regalo, posadas y reuniones.',
    kicker: 'Detección de alteración · Recargable USB-C', price: 399,
    unitPriceNumeric: 399, unitPriceLabel: '1 vaso · 5% menos desde 2 piezas', kitEquivalentCount: 0,
    image: christmasSmartCupImage,
    gallery: [{ src: christmasSmartCupImage, alt: 'Vaso reutilizable Tragoo Check con tapa, popote e iluminación LED multicolor sobre fondo blanco' }],
    contentsSummary: '1 vaso inteligente · detección de alteración · tapa con popote · cable USB-C', substancesDetected: '', reactionTime: '',
    includedItems: ['1 vaso inteligente Tragoo Check', 'Detección de alteración con indicador LED multicolor', 'Tapa con popote y cable de carga USB-C'],
    idealFor: 'Regalos, posadas, reuniones y celebraciones navideñas.', stockCount: null, featured: true,
  },
  ...[
    { size: 800, price: 329, label: 'XL' },
    { size: 600, price: 279, label: 'Grande' },
    { size: 450, price: 229, label: 'Mediano' },
    { size: 350, price: 189, label: 'Personal' },
    { size: 250, price: 169, label: 'Compacto' },
  ].map(({ size, price, label }) => ({
    id: `vaso-led-navidad-${size}`, category: 'navidad' as const,
    name: `Vaso LED Navideño Tragoo Check · ${size} ml`,
    subtitle: `Vaso reutilizable de ${size} ml con tapa y popote, decorado para la temporada e iluminado con LED multicolor. Disponible en varios colores, sujeto a existencias.`,
    kicker: `Edición navideña · ${label} · ${size} ml`, price,
    unitPriceNumeric: price,
    unitPriceLabel: `Desde 1 pieza · 5% menos desde 2 vasos`, kitEquivalentCount: 0,
    image: christmasCupSizesImage,
    gallery: [{ src: christmasCupSizesImage, alt: 'Vasos LED navideños Tragoo Check en cinco tamaños y colores sobre fondo blanco' }],
    contentsSummary: `1 vaso LED reutilizable de ${size} ml con tapa y popote`,
    substancesDetected: '', reactionTime: '',
    includedItems: [`1 vaso reutilizable de ${size} ml`, 'Tapa con popote', 'Iluminación LED multicolor'],
    idealFor: 'Intercambios de regalos, posadas y reuniones de temporada.', stockCount: null,
  })),
];

export const INSTAGRAM_URL = 'https://www.instagram.com/tragoocheck/';
export const INSTAGRAM_HANDLE = '@tragoocheck';
export const OFFICIAL_DOMAIN = 'tragoocheck.shop';

const NOVEMBER_COUPON_EXPIRY = new Date(NOVEMBER_PROMOTION_END).toISOString();
const BUEN_FIN_COUPON_START = new Date(BUEN_FIN_START).toISOString();
const BUEN_FIN_COUPON_END = new Date(BUEN_FIN_END).toISOString();

export const PROMO_COUPONS: PromoCoupon[] = [
  {
    code: 'BUENFIN12',
    label: '12% OFF desde $799',
    discountPercent: 12,
    minPurchase: 799,
    description:
      'Oferta exclusiva del 13 al 17 de noviembre de 2026: 12% de descuento desde $799 MXN y envío gratis desde $399 MXN en productos antes de descuentos. El Pack Dúo de $799 queda en $703.12 MXN con este código.',
    startsAt: BUEN_FIN_COUPON_START,
    expiresAt: BUEN_FIN_COUPON_END,
  },
  {
    code: 'HOY10',
    label: '10% OFF desde $449',
    discountPercent: 10,
    minPurchase: 449,
    description:
      '10% de descuento en pedidos desde $449 MXN. Válido hasta el 30 de noviembre de 2026.',
    expiresAt: NOVEMBER_COUPON_EXPIRY,
  },
  {
    code: 'AMIGAS15',
    label: '15% OFF en compras $1,100+',
    discountPercent: 15,
    minPurchase: 1100,
    description:
      '15% de descuento especial al armar tu pedido grupal de amigas o pack de festival. Válido hasta el 30 de noviembre de 2026.',
    expiresAt: NOVEMBER_COUPON_EXPIRY,
  },
  {
    code: 'SOCIOB2B',
    label: '8% Extra Mayoristas Premium',
    discountPercent: 8,
    minPurchase: 4350,
    description:
      '8% de bonificación adicional sobre precios de mayoreo para bares, antros y distribuidores.',
  },
];

export function getActiveCoupons(now = Date.now()): PromoCoupon[] {
  return PROMO_COUPONS.filter(
    (coupon) =>
      (!coupon.startsAt || now >= Date.parse(coupon.startsAt)) &&
      (!coupon.expiresAt || now < Date.parse(coupon.expiresAt))
  );
}

export function getVisibleCoupons(now = Date.now()): PromoCoupon[] {
  return PROMO_COUPONS.filter((coupon) => !coupon.expiresAt || now < Date.parse(coupon.expiresAt));
}

// STRICTLY DECREASING UNIT PRICE PROGRESSION FOR KIT NOCHE COMPLETA:
// 1 pieza: $449.00 c/u (+ $99 envío por ser < $899 MXN)
// 2 piezas (Pack Dúo): $399.50 c/u ($799 total + $99 envío por ser < $899 MXN)
// 3 piezas (Pack Trío): $375.00 c/u ($1,125 total · ENVÍO GRATIS por superar $899 MXN)
// 5 piezas (Pack Squad 5x): $349.00 c/u ($1,745 total · ENVÍO GRATIS)
// 10 piezas (Pack VIP 10x): $319.00 c/u ($3,190 total · ENVÍO GRATIS)
// 15 piezas (Mayoreo Nivel 1): $290.00 c/u ($4,350 total · ENVÍO GRATIS)
// 30 piezas (Mayoreo Nivel 2 Display): $260.00 c/u ($7,800 total · ENVÍO GRATIS)
// 60 piezas (Mayoreo Nivel 3 Master): $230.00 c/u ($13,800 total · ENVÍO GRATIS)
// 120 piezas (Mayoreo Premium Nivel 4): $205.00 c/u ($24,600 total · ENVÍO GRATIS)
// 250 piezas (Mayoreo Super Nivel 5): $185.00 c/u ($46,250 total · ENVÍO GRATIS)
// 500 piezas (Mayoreo Mega Socio Nivel 6): $165.00 c/u ($82,500 total · ENVÍO GRATIS)

export const PRODUCT_KITS: ProductKit[] = [
  {
    id: 'kit-noche-completa',
    category: 'individual',
    name: 'Kit Noche Completa (1 Pieza)',
    subtitle:
      'Tiras reactivas, stickers de uñas y estuche llavero mini-tumbler para llevarlo en la bolsa o con las llaves.',
    kicker: 'Individual · +$99 envío (Envío gratis desde $899)',
    price: 449,
    compareAtPrice: 549,
    unitPriceNumeric: 449,
    unitPriceLabel: '$449.00 MXN por kit (1 pza)',
    kitEquivalentCount: 1,
    image: HERO_PRODUCT_IMAGE,
    contentsSummary:
      '5 tiras multipanel · 10 stickers de uñas · 1 llavero mini-tumbler Tragoo Check',
    substancesDetected: 'GHB, ketamina, escopolamina, cocaína y aminas adulterantes',
    reactionTime: '10 a 15 segundos',
    includedItems: [
      '10 stickers reactivos discretos para uñas (detección rápida de GHB)',
      '5 tiras reactivas de doble panel en bolsa doy-pack negra mate resellable',
      '1 estuche llavero mini-tumbler Tragoo Check con mosquetón metálico',
      'Reverso con instrucciones paso a paso para interpretar el cambio de color',
    ],
    idealFor: 'Salidas de fin de semana, bares, antros y viajes con cobertura dual.',
    stockCount: 28,
    featured: true,
  },
  {
    id: 'kit-stickers',
    category: 'individual',
    name: 'Kit Stickers Para Uñas (10 pzas)',
    subtitle:
      '10 stickers pequeños en forma de corazón, diseñados para colocarse discretamente sobre una uña. Sigue las instrucciones incluidas.',
    kicker: 'Individual · +$99 envío (Envío gratis desde $899)',
    price: 249,
    compareAtPrice: 299,
    unitPriceNumeric: 249,
    unitPriceLabel: '$24.90 MXN por sticker (10 pruebas)',
    kitEquivalentCount: 1,
    image: kitStickersImage,
    contentsSummary: '10 stickers adhesivos para uñas · Bolsa resellable Tragoo Check',
    substancesDetected: 'GHB (ácido gamma-hidroxibutírico)',
    reactionTime: '10 a 15 segundos',
    includedItems: [
      '10 stickers pequeños en forma de corazón para uñas (un solo uso)',
      'Tarjeta negra impermeable portastickers + bolsa doy-pack Tragoo Check',
      'Indicador colorimétrico; interpreta el resultado según las instrucciones del fabricante',
    ],
    idealFor:
      'Llevar puesto en la uña antes de salir y checar cualquier trago con 1 gota.',
    stockCount: 34,
  },
  {
    id: 'kit-tiras',
    category: 'individual',
    name: 'Kit Tiras Reactivas (5 pzas)',
    subtitle:
      '5 tiras reactivas multipanel en bolsa doy-pack negra mate resellable que cabe en cualquier cartera.',
    kicker: 'Individual · +$99 envío (Envío gratis desde $899)',
    price: 299,
    compareAtPrice: 349,
    unitPriceNumeric: 299,
    unitPriceLabel: '$59.80 MXN por tira doble (5 pruebas)',
    kitEquivalentCount: 1,
    image: kitStripsImage,
    contentsSummary: '5 tiras reactivas multipanel · Empaque hermético Tragoo Check',
    substancesDetected:
      'GHB, ketamina, escopolamina, cocaína y sustancias a base de aminas',
    reactionTime: '15 segundos',
    includedItems: [
      '5 tiras diagnósticas portátiles con doble almohadilla reactiva',
      'Bolsa doy-pack negra mate resellable con protección UV y antihumedad',
      'Escala comparativa impresa en el empaque',
    ],
    idealFor: 'Cobertura ampliada para verificar bebidas mezcladas, coctelería o refrescos.',
    stockCount: 22,
  },
  {
    id: 'kit-recarga-total',
    category: 'individual',
    name: 'Kit Recarga Total (Refill 30 Pruebas)',
    subtitle:
      'Doble dotación de repuesto (20 Stickers + 10 Tiras) con reverso instructivo oficial para rellenar tu llavero Tragoo Check.',
    kicker: 'Repuesto · +$99 envío (Envío gratis desde $899)',
    price: 549,
    compareAtPrice: 698,
    unitPriceNumeric: 274.5,
    unitPriceLabel: '$18.30 MXN por prueba (30 pruebas)',
    kitEquivalentCount: 2,
    image: kitStripsImage,
    contentsSummary: '10 tiras multipanel · 20 stickers de uñas (Refill sin llavero)',
    substancesDetected: 'GHB, ketamina, escopolamina, cocaína y aminas',
    reactionTime: '10 a 15 segundos',
    includedItems: [
      '2 bolsas resellables Tragoo Check con 5 tiras reactivas cada una (10 tiras)',
      '2 tarjetas con 10 stickers de uñas cada una (20 stickers)',
      'Reverso instructivo completo (Cómo aplicar + Información de Seguridad Importante)',
    ],
    idealFor: 'Quienes ya tienen su llavero mini-tumbler y quieren recargar suministros.',
    stockCount: 19,
  },
];

export const PROMO_BUNDLES: ProductKit[] = [
  {
    id: 'pack-amigas-2x',
    category: 'promocion',
    name: 'Pack Dúo Noche Segura (2x Kits Completos)',
    subtitle:
      'Dos Kits Noche Completa con sus 2 llaveros mini-tumbler Tragoo Check. Agrega $100 MXN más para envío gratis.',
    kicker: '11% OFF por kit · Sale a $399.50 c/u (+ $99 envío)',
    price: 799,
    compareAtPrice: 898,
    unitPriceNumeric: 399.5,
    unitPriceLabel: '$399.50 MXN por kit (Ahorras $99)',
    kitEquivalentCount: 2,
    image: duoPackImage,
    contentsSummary: '10 tiras multipanel · 20 stickers de uñas · 2 llaveros mini-tumbler',
    substancesDetected: 'Panel completo: GHB, ketamina, escopolamina, cocaína y aminas',
    reactionTime: '10 a 15 segundos',
    includedItems: [
      '2x bolsas doy-pack Tragoo Check con 5 tiras reactivas cada una (10 tiras)',
      '2x tarjetas con 10 stickers de uñas cada una (20 stickers)',
      '2x estuches llavero mini-tumbler Tragoo Check con mosquetón',
      'Nota: Por ser menor a $899 MXN, suma 1 Kit Stickers para obtener Envío Gratis',
    ],
    idealFor: 'Salir en pareja de amigas o compartir con tu roomie.',
    stockCount: 18,
  },
  {
    id: 'pack-trio-amigas-3x',
    category: 'promocion',
    name: 'Pack Trío Amigas & Festival (3x Kits Completos)',
    subtitle:
      'Tres Kits Noche Completa con 3 llaveros mini-tumbler. Al superar $899 MXN ya incluye Envío Express Gratis.',
    kicker: '16.5% OFF por kit · Sale a $375 c/u + ENVÍO GRATIS',
    price: 1125,
    compareAtPrice: 1347,
    unitPriceNumeric: 375,
    unitPriceLabel: '$375.00 MXN por kit · Envío Gratis incluido',
    kitEquivalentCount: 3,
    image: packKits3Image,
    contentsSummary: '15 tiras multipanel · 30 stickers de uñas · 3 llaveros mini-tumbler',
    substancesDetected: 'GHB, ketamina, escopolamina, cocaína y aminas adulterantes',
    reactionTime: '10 a 15 segundos',
    includedItems: [
      '3 Kits Noche Completa individuales listos para 3 amigas',
      '30 stickers micro-reactivos para uñas + 15 tiras reactivas multipanel',
      '3 estuches llavero mini-tumbler con mosquetón de seguridad',
      'Envío Express Gratis incluido (por superar $899 MXN) + 5 stickers de regalo',
    ],
    idealFor: 'Trío de amigas, festivales de música, viajes a la playa y puentes.',
    stockCount: 15,
    featured: true,
  },
  {
    id: 'pack-squad-5x',
    category: 'promocion',
    name: 'Pack Squad Fiesta (5x Kits Noche Completa)',
    subtitle:
      'Protección completa para tu grupo de 5 amigas. Cada una recibe su bolsa Kit Noche Completa y su llavero mini-tumbler.',
    kicker: '22% OFF por kit · Sale a $349 c/u + ENVÍO GRATIS',
    price: 1745,
    compareAtPrice: 2245,
    unitPriceNumeric: 349,
    unitPriceLabel: '$349.00 MXN por kit (Ahorras $500 + Envío Gratis)',
    kitEquivalentCount: 5,
    image: squadPackImage,
    contentsSummary: '25 tiras multipanel · 50 stickers de uñas · 5 llaveros mini-tumbler',
    substancesDetected: 'Panel completo: GHB, ketamina, escopolamina, cocaína y aminas',
    reactionTime: '10 a 15 segundos',
    includedItems: [
      '5 Kits Noche Completa individuales listos para repartir en tu grupo',
      '50 stickers de uñas + 25 tiras reactivas + 5 llaveros mini-tumbler Tragoo Check',
      '1 tarjeta extra de 10 stickers de regalo para el grupo',
      'Envío Express Asegurado Gratis a todo México',
    ],
    idealFor: 'Grupos de amigas, graduaciones, viajes de generación y cumpleaños.',
    stockCount: 12,
  },
  {
    id: 'pack-vip-10x',
    category: 'promocion',
    name: 'Pack VIP Despedida / Graduación (10x Kits Completos)',
    subtitle:
      'Paquete grupal de 10 Kits Noche Completa para despedidas de soltera, viajes de generación o fiestas privadas.',
    kicker: '29% OFF por kit · Sale a $319 c/u + ENVÍO GRATIS',
    price: 3190,
    compareAtPrice: 4490,
    unitPriceNumeric: 319,
    unitPriceLabel: '$319.00 MXN por kit (Ahorras $1,300 + Envío Gratis)',
    kitEquivalentCount: 10,
    image: packKits10Image,
    contentsSummary: '50 tiras multipanel · 100 stickers de uñas · 10 llaveros mini-tumbler',
    substancesDetected: 'Panel completo: GHB, ketamina, escopolamina, cocaína y aminas',
    reactionTime: '10 a 15 segundos',
    includedItems: [
      '10 Kits Noche Completa con sus 10 llaveros mini-tumbler individuales',
      '100 stickers de uñas + 50 tiras reactivas en total',
      '2 tarjetas extra de 10 stickers de regalo (20 stickers extra)',
      'Envío Express Asegurado Gratis a cualquier ciudad de México',
    ],
    idealFor: 'Despedidas de soltera en playa, graduaciones y grupos grandes.',
    stockCount: 9,
  },
];

// Combinations use existing bundle prices; no additional discount or gifts are assumed.
const combinations = [
  { id: 'pack-cuatro-4x', name: 'Pack Cuatro', sources: ['pack-amigas-2x', 'pack-amigas-2x'] },
  { id: 'pack-seis-6x', name: 'Pack Seis', sources: ['pack-squad-5x', 'kit-noche-completa'] },
  { id: 'pack-ocho-8x', name: 'Pack Ocho', sources: ['pack-squad-5x', 'pack-trio-amigas-3x'] },
];
for (const combination of combinations) {
  const catalog = [...PRODUCT_KITS, ...PROMO_BUNDLES];
  const parts = combination.sources.map(id => catalog.find(product => product.id === id)!);
  const quantity = parts.reduce((sum, part) => sum + part.kitEquivalentCount, 0);
  const price = parts.reduce((sum, part) => sum + part.price, 0);
  const inventoryLimits = [...new Set(combination.sources)].map(id => {
    const product = catalog.find(item => item.id === id)!;
    return Math.floor((product.stockCount ?? 0) / combination.sources.filter(source => source === id).length);
  });
  PROMO_BUNDLES.push({
    ...PRODUCT_KITS[0], id: combination.id, category: 'promocion',
    name: `${combination.name} (${quantity} Kits Completos)`,
    subtitle: `Combina ${parts.map(part => part.name).join(' + ')} en un pedido.`,
    kicker: `${quantity} kits · Combinación de paquetes del catálogo`,
    price, compareAtPrice: quantity * PRODUCT_KITS[0].price,
    unitPriceNumeric: price / quantity,
    unitPriceLabel: `${(price / quantity).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })} MXN por kit`,
    kitEquivalentCount: quantity,
    image: quantity === 4 ? packKits4Image : quantity === 6 ? packKits6Image : packKits8Image,
    contentsSummary: `${quantity * 5} tiras · ${quantity * 10} stickers · ${quantity} llaveros`,
    includedItems: parts.flatMap(part => part.includedItems),
    idealFor: 'Grupos que quieren repartir un kit completo por persona.',
    stockCount: Math.min(...inventoryLimits), featured: false,
  });
}

export const WHOLESALE_KITS: ProductKit[] = [
  {
    id: 'mayoreo-caja-15',
    category: 'mayoreo',
    name: 'Mayoreo Nivel 1: Caja Emprendedor (15 Kits Completos)',
    subtitle:
      'Inicia como distribuidora autorizada, equipa tu evento privado o revende entre tu comunidad universitaria.',
    kicker: '35% OFF · Costo: $290 c/u · Ganancia: +$2,385 MXN',
    price: 4350,
    compareAtPrice: 6735,
    unitPriceNumeric: 290,
    unitPriceLabel: '$290.00 MXN por kit (Precio público: $449)',
    kitEquivalentCount: 15,
    image: WHOLESALE_BOX_IMAGE,
    contentsSummary:
      '15 Kits Noche Completa (75 tiras · 150 stickers · 15 llaveros mini-tumbler)',
    substancesDetected: 'Panel completo: GHB, ketamina, escopolamina, cocaína y aminas',
    reactionTime: '10 a 15 segundos',
    includedItems: [
      '15 Kits Noche Completa Tragoo Check sellados con su llavero mini-tumbler',
      'Venta al público: $6,735 MXN → Tu ganancia neta: $2,385 MXN (+55% ROI)',
      'Envío Express Asegurado Gratis + Kit digital de videos para redes',
    ],
    idealFor: 'Emprendedoras, colectivas universitarias, wedding planners y boutiques.',
    stockCount: 10,
  },
  {
    id: 'mayoreo-exhibidor-30',
    category: 'mayoreo',
    name: 'Mayoreo Nivel 2: Caja Exhibidora Bares & Farmacias (30 Kits)',
    subtitle:
      'Display oficial Tragoo Check listo para colocar en barra, recepción, baños VIP o mostrador con QR informativo.',
    kicker: '42% OFF · Costo: $260 c/u · Ganancia: +$5,670 MXN',
    price: 7800,
    compareAtPrice: 13470,
    unitPriceNumeric: 260,
    unitPriceLabel: '$260.00 MXN por kit (Precio público: $449)',
    kitEquivalentCount: 30,
    image: WHOLESALE_BOX_IMAGE,
    contentsSummary: '30 Kits Noche Completa + 1 Caja Exhibidora Oficial Tragoo Check',
    substancesDetected: 'Panel completo: GHB, ketamina, escopolamina, cocaína y aminas',
    reactionTime: '10 a 15 segundos',
    includedItems: [
      '30 Kits Noche Completa con bolsa doy-pack, llavero mini-tumbler y código QR',
      'Venta al público: $13,470 MXN → Tu ganancia neta: $5,670 MXN (+72% ROI)',
      '1 Caja Exhibidora negra mate oficial + Señalética de Barra Segura',
      'Facturación CFDI inmediata y Envío Express Asegurado Gratis',
    ],
    idealFor: 'Bares, antros, restaurantes, hoteles, farmacias y universidades.',
    stockCount: 8,
    featured: true,
  },
  {
    id: 'mayoreo-master-60',
    category: 'mayoreo',
    name: 'Mayoreo Nivel 3: Master Box Distribuidor (60 Kits Completos)',
    subtitle:
      'Caja maestra con 2 exhibidores de mostrador para puntos de venta de alta rotación, antros o distribuidoras.',
    kicker: '49% OFF · Costo: $230 c/u · Ganancia: +$13,140 MXN',
    price: 13800,
    compareAtPrice: 26940,
    unitPriceNumeric: 230,
    unitPriceLabel: '$230.00 MXN por kit (Precio público: $449)',
    kitEquivalentCount: 60,
    image: WHOLESALE_MASTER_IMAGE,
    contentsSummary: '60 Kits Noche Completa + 2 Exhibidores Oficiales Tragoo Check',
    substancesDetected: 'Panel completo: GHB, ketamina, escopolamina, cocaína y aminas',
    reactionTime: '10 a 15 segundos',
    includedItems: [
      '60 Kits Noche Completa (300 tiras + 600 stickers + 60 llaveros mini-tumbler)',
      'Venta al público: $26,940 MXN → Tu ganancia neta: $13,140 MXN (+95% ROI)',
      '2 Cajas Exhibidoras oficiales Tragoo Check + Material POP',
      'Facturación CFDI y Envío Express Asegurado Gratis',
    ],
    idealFor: 'Distribuidores regionales, cadenas de bares y grupos de entretenimiento.',
    stockCount: 6,
  },
  {
    id: 'mayoreo-premium-120',
    category: 'mayoreo',
    name: 'Mayoreo Premium Nivel 4: Pack Corporativo / Festival (120 Kits)',
    subtitle:
      'Pedido mayorista grande para festivales de música, grupos restauranteros, bodas masivas o red de revendedoras.',
    kicker: '54% OFF · Costo: $205 c/u · Ganancia: +$29,280 MXN',
    price: 24600,
    compareAtPrice: 53880,
    unitPriceNumeric: 205,
    unitPriceLabel: '$205.00 MXN por kit (Más del doble de retorno)',
    kitEquivalentCount: 120,
    image: WHOLESALE_MASTER_IMAGE,
    contentsSummary: '120 Kits Noche Completa + 4 Exhibidores Oficiales Tragoo Check',
    substancesDetected: 'Panel completo: GHB, ketamina, escopolamina, cocaína y aminas',
    reactionTime: '10 a 15 segundos',
    includedItems: [
      '120 Kits Noche Completa (600 tiras + 1,200 stickers + 120 llaveros)',
      'Venta al público: $53,880 MXN → Tu ganancia neta: $29,280 MXN (+119% ROI)',
      '4 Cajas Exhibidoras de mostrador + Mención como Punto Oficial en @tragoocheck',
      'Envío Asegurado VIP Gratis + Factura CFDI',
    ],
    idealFor: 'Festivales, cadenas de antros, universidades y distribuidores mayoristas.',
    stockCount: 5,
    featured: true,
  },
  {
    id: 'mayoreo-super-250',
    category: 'mayoreo',
    name: 'Super Mayorista Nivel 5: Distribuidor Estatal (250 Kits)',
    subtitle:
      'Volumen mayorista para distribución exclusiva en tu ciudad, cadenas de farmacias, campus universitarios o eventos.',
    kicker: '59% OFF · Costo: $185 c/u · Ganancia: +$66,000 MXN',
    price: 46250,
    compareAtPrice: 112250,
    unitPriceNumeric: 185,
    unitPriceLabel: '$185.00 MXN por kit (Precio Distribuidor Estatal)',
    kitEquivalentCount: 250,
    image: WHOLESALE_MASTER_IMAGE,
    contentsSummary: '250 Kits Noche Completa + 8 Exhibidores Oficiales Tragoo Check',
    substancesDetected: 'Panel completo: GHB, ketamina, escopolamina, cocaína y aminas',
    reactionTime: '10 a 15 segundos',
    includedItems: [
      '250 Kits Noche Completa (1,250 tiras + 2,500 stickers + 250 llaveros)',
      'Venta al público: $112,250 MXN → Tu ganancia neta: $66,000 MXN (+142% ROI)',
      '8 Exhibidores de mostrador + Exclusividad de zona por 60 días',
      'Logística prioritaria asegurada sin costo y Factura CFDI',
    ],
    idealFor: 'Distribuidores estatales, cadenas comerciales, gobiernos y campañas masivas.',
    stockCount: 4,
  },
  {
    id: 'mayoreo-mega-500',
    category: 'mayoreo',
    name: 'Mega Master Nivel 6: Socio Nacional / Evento Masivo (500 Kits)',
    subtitle:
      'Nuestro precio más bajo por volumen. Ideal para patrocinadores, festivales nacionales, gobiernos o distribuidores master.',
    kicker: '63% OFF · Costo Mínimo: $165 c/u · Ganancia: +$142,000 MXN',
    price: 82500,
    compareAtPrice: 224500,
    unitPriceNumeric: 165,
    unitPriceLabel: '$165.00 MXN por kit (Tarifa Mínima Nacional)',
    kitEquivalentCount: 500,
    image: WHOLESALE_MASTER_IMAGE,
    contentsSummary: '500 Kits Noche Completa + 15 Exhibidores Oficiales Tragoo Check',
    substancesDetected: 'Panel completo: GHB, ketamina, escopolamina, cocaína y aminas',
    reactionTime: '10 a 15 segundos',
    includedItems: [
      '500 Kits Noche Completa (2,500 tiras + 5,000 stickers + 500 llaveros)',
      'Venta al público: $224,500 MXN → Tu ganancia neta: $142,000 MXN (+172% ROI)',
      '15 Exhibidores de mostrador + Atención ejecutiva directa y reposición garantizada',
    ],
    idealFor: 'Socios comerciales nacionales, festivales masivos, corporativos y licitaciones.',
    stockCount: 3,
  },
];

export const BRACELET_PRODUCTS: ProductKit[] = [
  {
    id: 'safeglow-set', category: 'individual', name: 'Set SafeGlow · Pulsera inteligente + accesorios',
    subtitle: 'Set de presentación con pulsera negra de acentos fucsia, aretes de corazón y tres sobres Tragoo Check, pensado para llevar contigo en tus salidas.',
    kicker: 'SafeGlow · Set de lanzamiento', price: 1299, compareAtPrice: 1699,
    unitPriceNumeric: 1299, unitPriceLabel: '$1,299 MXN por set', kitEquivalentCount: 0,
    image: safeGlowSetImage,
    gallery: [{ src: safeGlowSetImage, alt: 'Set SafeGlow Tragoo Check con pulsera, aretes de corazón y tres sobres sobre fondo blanco' }],
    contentsSummary: '1 pulsera SafeGlow · 2 aretes de corazón · 3 sobres Tragoo Check',
    substancesDetected: '', reactionTime: '',
    includedItems: ['1 pulsera SafeGlow negra con acentos fucsia', '2 aretes de corazón', '3 sobres de prueba Tragoo Check'],
    idealFor: 'Un regalo especial o para llevar tus accesorios juntos.', stockCount: null,
  },
  {
    id: 'safebag-bolsa', category: 'individual', name: 'SafeBag Tragoo Check · Bolsa de mano',
    subtitle: 'Bolsa negra de mano con interior organizado, detalles fucsia y un accesorio colgante con botón y luz. Una pieza práctica para tus salidas.',
    kicker: 'SafeBag · Precio de lanzamiento', price: 1999, compareAtPrice: 2499,
    unitPriceNumeric: 1999, unitPriceLabel: '$1,999 MXN por bolsa', kitEquivalentCount: 0,
    image: safeBagImage,
    gallery: [{ src: safeBagImage, alt: 'Bolsa SafeBag negra Tragoo Check con forro fucsia y accesorio colgante sobre fondo blanco' }],
    contentsSummary: '1 bolsa SafeBag negra · 1 accesorio colgante · tiras de prueba incluidas',
    substancesDetected: '', reactionTime: '',
    includedItems: ['1 bolsa de mano negra con compartimentos interiores', '1 accesorio colgante con botón frontal y luz', 'Tiras de prueba incluidas (cantidad indicada en el empaque)'],
    idealFor: 'Llevar tus pertenencias organizadas en salidas y eventos.', stockCount: null,
  },
  {
    id: 'alarma-personal-jalon', category: 'individual', name: 'Alarma Personal Tragoo Check · Naranja',
    subtitle: 'Alarma compacta de jalón con correa naranja y aro metálico para sujetarla a tus llaves, bolso o mochila.',
    kicker: 'Alarma personal · Diseño portátil', price: 249,
    unitPriceNumeric: 249, unitPriceLabel: '$249 MXN por alarma', kitEquivalentCount: 0,
    image: personalAlarmImage,
    gallery: [{ src: personalAlarmImage, alt: 'Alarma personal naranja Tragoo Check con correa y aro metálico sobre fondo blanco' }],
    contentsSummary: '1 alarma personal naranja · 1 correa con aro metálico',
    substancesDetected: '', reactionTime: '',
    includedItems: ['1 alarma personal compacta', 'Correa naranja con aro metálico', 'Activación por jalón, según el empaque'],
    idealFor: 'Tenerla a la mano en llaves, mochila o bolso.', stockCount: null,
  },
  {
    id: 'stickers-corazon-30', category: 'individual', name: 'Stickers Corazón Reactivos · Pack de 30',
    subtitle: '30 stickers de corazón con lectura visual rápida. Llévalos en la uña y sigue la guía incluida para revisar tu bebida.',
    kicker: '30 stickers · Precio competitivo', price: 169, unitPriceNumeric: 169 / 30,
    unitPriceLabel: '$5.63 MXN por sticker', kitEquivalentCount: 0,
    image: nailStickers30Image,
    gallery: [{ src: nailStickers30Image, alt: 'Paquete Tragoo Check y lámina con 30 stickers corazón amarillos para uñas sobre fondo blanco' }],
    contentsSummary: '30 stickers corazón de un solo uso · Empaque Tragoo Check', substancesDetected: '', reactionTime: 'Lectura visual rápida, según la guía incluida',
    includedItems: ['30 stickers corazón de un solo uso', 'Guía de aplicación e interpretación incluida', 'Probado con personas reales y evaluado en estudios propios de Tragoo Check'],
    idealFor: 'Llevar en la bolsa para conciertos, festivales y reuniones.', stockCount: null,
  },
  {
    id: 'protector-vasos', category: 'individual', name: 'Protector Reutilizable para Vasos',
    subtitle: 'Cubierta elástica tipo scrunchie que se ajusta sobre la boca de la mayoría de los vasos. Ligera, lavable y cómoda de llevar también en la muñeca.',
    kicker: 'Protector reutilizable · Precio de lanzamiento', price: 199, unitPriceNumeric: 199,
    unitPriceLabel: '$199 MXN por protector', kitEquivalentCount: 0,
    image: cupCoverImage,
    gallery: [{ src: cupCoverImage, alt: 'Protector de tela reutilizable Tragoo Check junto a un vaso transparente y su empaque' }],
    contentsSummary: '1 protector elástico reutilizable Tragoo Check', substancesDetected: '', reactionTime: '',
    includedItems: ['Cubierta elástica tipo scrunchie para la boca del vaso', 'Reutilizable y lavable siguiendo sus instrucciones', 'Probado con personas reales y evaluado en estudios propios de Tragoo Check'],
    idealFor: 'Conciertos, bares, festivales y reuniones.', stockCount: null,
  },
  {
    id: 'protector-vasos-led', category: 'individual', name: 'Cubrevasos Tragoo Check con Luz LED 360°',
    subtitle: 'Cubierta elástica Tragoo Check con iluminación LED alrededor del vaso. Incluye tres modos de luz y batería recargable por USB-C.',
    kicker: 'Nuevo · LED 360° · Recargable', price: 249, unitPriceNumeric: 249,
    unitPriceLabel: '$249 MXN por protector LED', kitEquivalentCount: 0,
    image: cupCoverLedImage,
    gallery: [{ src: cupCoverLedImage, alt: 'Cubrevasos negro con logo Tragoo Check, anillo de luz LED y cable USB-C sobre fondo blanco' }],
    contentsSummary: '1 protector con LED 360° · Cable USB-C', substancesDetected: '', reactionTime: '',
    includedItems: ['Iluminación LED de 360° con tres modos', 'Batería recargable mediante USB-C', 'Probado con personas reales y evaluado en estudios propios de Tragoo Check'],
    idealFor: 'Eventos nocturnos, conciertos y reuniones.', stockCount: null, featured: true,
  },
  {
    id: 'pulsera-corazon', category: 'individual', name: 'Pulsera Detectora con Charm Corazón',
    subtitle: 'Pulsera plateada con dije de corazón y sistema reactivo integrado. Presentación de regalo con tres repuestos para seguir usando el producto.',
    kicker: '1 pulsera · 3 repuestos incluidos', price: 499, unitPriceNumeric: 499,
    unitPriceLabel: '$499 MXN · incluye 3 repuestos', kitEquivalentCount: 0,
    image: heartBraceletImage,
    gallery: [{ src: heartBraceletImage, alt: 'Pulsera plateada con dije de corazón amarillo en su estuche, junto a tres repuestos' }],
    contentsSummary: '1 pulsera Tragoo Check · 3 stickers de repuesto', substancesDetected: '', reactionTime: '',
    includedItems: ['Pulsera plateada con charm de corazón', '3 stickers reactivos de repuesto', 'Probada con personas reales y evaluada en estudios propios de Tragoo Check'],
    idealFor: 'Regalo, conciertos, festivales y reuniones.', stockCount: null,
  },
  {
    id: 'popotes-prueba-10', category: 'individual', name: 'Popotes de Prueba · Paquete de 10',
    subtitle: 'Paquete con 10 popotes de prueba Tragoo Check para llevar a conciertos, reuniones y otros eventos.',
    kicker: '10 popotes de prueba', price: 599, unitPriceNumeric: 59.9,
    unitPriceLabel: '$59.90 MXN por popote', kitEquivalentCount: 0,
    image: testingStrawsImage,
    gallery: [{ src: testingStrawsImage, alt: 'Popotes de prueba Tragoo Check con indicadores de color; imagen representativa del producto' }],
    contentsSummary: '10 popotes de prueba Tragoo Check', substancesDetected: 'GHB', reactionTime: '10 a 15 segundos',
    includedItems: ['10 popotes de prueba Tragoo Check', 'Probado con personas reales y evaluado en estudios propios de Tragoo Check'], idealFor: 'Eventos y reuniones.', stockCount: null,
  },
  {
    id: 'popotes-prueba-20', category: 'promocion', name: 'Popotes de Prueba · Paquete de 20',
    subtitle: 'Paquete de 20 popotes de prueba Tragoo Check para compartir en eventos y reuniones.',
    kicker: '20 popotes de prueba', price: 1499, unitPriceNumeric: 74.95,
    unitPriceLabel: '$74.95 MXN por popote', kitEquivalentCount: 0,
    image: testingStrawsImage,
    gallery: [{ src: testingStrawsImage, alt: 'Popotes de prueba Tragoo Check con indicadores de color; imagen representativa del producto' }],
    contentsSummary: '20 popotes de prueba Tragoo Check', substancesDetected: 'GHB', reactionTime: '10 a 15 segundos',
    includedItems: ['20 popotes de prueba Tragoo Check', 'Probado con personas reales y evaluado en estudios propios de Tragoo Check'], idealFor: 'Compartir en eventos y reuniones.', stockCount: null,
  },
  {
    id: 'popotes-prueba-30', category: 'promocion', name: 'Popotes de Prueba · Paquete de 30',
    subtitle: 'Paquete de 30 popotes de prueba Tragoo Check para grupos y eventos.',
    kicker: '30 popotes de prueba', price: 2299, unitPriceNumeric: 2299 / 30,
    unitPriceLabel: '$76.63 MXN por popote', kitEquivalentCount: 0,
    image: testingStrawsImage,
    gallery: [{ src: testingStrawsImage, alt: 'Popotes de prueba Tragoo Check con indicadores de color; imagen representativa del producto' }],
    contentsSummary: '30 popotes de prueba Tragoo Check', substancesDetected: 'GHB', reactionTime: '10 a 15 segundos',
    includedItems: ['30 popotes de prueba Tragoo Check', 'Probado con personas reales y evaluado en estudios propios de Tragoo Check'], idealFor: 'Grupos y eventos.', stockCount: null,
  },
  {
    id: 'repuestos-pulseras-30', category: 'individual', name: 'Repuestos exclusivos para pulseras (30 parches)',
    subtitle: 'Paquete con 30 parches reactivos de repuesto, diseñados exclusivamente para las pulseras Tragoo Check. Una presentación práctica para quienes ya tienen su pulsera y desean contar con repuestos para sus próximos eventos, conciertos y reuniones.',
    kicker: '30 parches · Exclusivos para pulseras Tragoo Check',
    price: 1589, unitPriceNumeric: 1589 / 30, unitPriceLabel: '$52.97 MXN por parche',
    kitEquivalentCount: 0, image: braceletRefillsImage,
    gallery: [{ src: braceletRefillsImage, alt: 'Paquete de 30 parches de repuesto junto a una pulsera Tragoo Check' }],
    contentsSummary: '30 parches reactivos de repuesto para pulseras Tragoo Check',
    substancesDetected: '', reactionTime: '',
    includedItems: ['30 parches reactivos de repuesto exclusivos para pulseras Tragoo Check', 'Probado con personas reales y evaluado en estudios propios de Tragoo Check'],
    idealFor: 'Personas que ya tienen su pulsera Tragoo Check.', stockCount: null,
  },
  {
    id: 'pulsera-individual', category: 'individual', name: 'Pulsera Individual',
    subtitle: 'Un sobre con una pulsera ajustable morada y zona de prueba integrada. Presentación compacta, pensada para llevar a conciertos, festivales y reuniones.',
    kicker: '1 sobre · 1 pulsera', price: 599, unitPriceNumeric: 599,
    unitPriceLabel: '$599.00 MXN por pulsera', kitEquivalentCount: 0,
    image: braceletDetailImage,
    gallery: [{ src: braceletDetailImage, alt: 'Pulsera individual morada Tragoo Check fuera de su sobre, sobre fondo blanco' }],
    contentsSummary: '1 sobre con 1 pulsera ajustable morada y zona de prueba integrada',
    substancesDetected: '', reactionTime: '',
    includedItems: ['1 sobre', '1 pulsera ajustable morada con zona de prueba integrada', 'Probada con personas reales y evaluada en estudios propios de Tragoo Check'],
    idealFor: 'Conciertos, festivales y reuniones.', stockCount: null,
  },
  {
    id: 'pulseras-trio', category: 'promocion', name: 'Pack Trío de Pulseras',
    subtitle: 'Un solo sobre con tres pulseras. Ideal para compartir con amistades y llevar cada quien su propia pulsera durante un evento.',
    kicker: '1 sobre · 3 pulseras', price: 1499, unitPriceNumeric: 1499 / 3,
    unitPriceLabel: '$499.67 MXN por pulsera', kitEquivalentCount: 0,
    image: braceletTrioImage,
    gallery: [{ src: braceletTrioImage, alt: 'Pack Trío de pulseras Tragoo Check con tres pulseras moradas y un sobre' }],
    contentsSummary: '1 solo sobre con 3 pulseras',
    substancesDetected: '', reactionTime: '', includedItems: ['1 sobre con 3 pulseras', 'Probadas con personas reales y evaluadas en estudios propios de Tragoo Check'],
    idealFor: 'Compartir con amistades durante un evento.', stockCount: null,
  },
  {
    id: 'pulseras-grupo', category: 'promocion', name: 'Pack Grupo de Pulseras',
    subtitle: 'Un sobre con cinco pulseras. Presentación pensada para grupos, celebraciones y eventos.',
    kicker: '1 sobre · 5 pulseras', price: 2299, unitPriceNumeric: 2299 / 5,
    unitPriceLabel: '$459.80 MXN por pulsera', kitEquivalentCount: 0,
    image: braceletGroupImage,
    gallery: [{ src: braceletGroupImage, alt: 'Pack Grupo Tragoo Check con cinco pulseras moradas y un sobre' }],
    contentsSummary: '1 sobre con 5 pulseras',
    substancesDetected: '', reactionTime: '', includedItems: ['1 sobre con 5 pulseras', 'Probadas con personas reales y evaluadas en estudios propios de Tragoo Check'],
    idealFor: 'Grupos, celebraciones y eventos.', stockCount: null,
  },
];

export const FAMILY_PRODUCTS: ProductKit[] = [
  {
    id: 'sos-family-bluetooth',
    category: 'familia',
    name: 'SOS Family Bluetooth — Pulsera de alerta',
    subtitle:
      'Pulsera de alerta con botón SOS y conexión Bluetooth a la app Tragoo Check para avisar a tus contactos de confianza. Un apoyo práctico para mantener a la familia conectada.',
    kicker: 'SOS Family · Versión Bluetooth',
    price: 499,
    unitPriceNumeric: 499,
    unitPriceLabel: '1 pulsera SOS Bluetooth · $499 MXN',
    kitEquivalentCount: 0,
    image: sosFamilyBluetoothImage,
    gallery: [{ src: sosFamilyBluetoothImage, alt: 'Empaque Tragoo Check SOS Family Bluetooth y pulsera negra sobre fondo blanco, con foto de madre e hija' }],
    contentsSummary: '1 pulsera SOS Bluetooth · app Tragoo Check',
    substancesDetected: '',
    reactionTime: '',
    includedItems: [
      'Pulsera SOS con botón de emergencia',
      'Cable USB de carga',
      'Manual de uso',
      'Conexión Bluetooth y avisos a contactos desde la app',
      'Probada con personas reales y evaluada en estudios propios de Tragoo Check',
    ],
    idealFor: 'Personas adultas mayores, personas que viven solas y salidas familiares acompañadas.',
    stockCount: null,
    featured: true,
  },
  {
    id: 'sos-family-gps',
    category: 'familia',
    name: 'SOS Family GPS/SIM — Pulsera de alerta',
    subtitle:
      'Versión con GPS y conexión celular SIM/eSIM para compartir ubicación y enviar alertas a contactos de confianza. Plan de servicio disponible desde $99 MXN al mes.',
    kicker: 'SOS Family · GPS/SIM independiente',
    price: 1499,
    unitPriceNumeric: 1499,
    unitPriceLabel: '1 pulsera GPS/SIM · $1,499 MXN',
    kitEquivalentCount: 0,
    image: sosFamilyGpsImage,
    gallery: [{ src: sosFamilyGpsImage, alt: 'Empaque Tragoo Check SOS Family GPS/SIM con pulsera blanca sobre fondo blanco y foto de madre e hija' }],
    contentsSummary: '1 pulsera SOS GPS/SIM · plan de servicio desde $99 MXN/mes',
    substancesDetected: '',
    reactionTime: '',
    includedItems: [
      'Pulsera SOS con conectividad GPS/SIM',
      'Comparte ubicación y alertas con contactos configurados',
      'Plan de servicio desde $99 MXN al mes, contratado por separado',
      'Probada con personas reales y evaluada en estudios propios de Tragoo Check',
    ],
    idealFor: 'Familias que quieren mantenerse comunicadas con personas adultas mayores y niñas o niños bajo supervisión adulta.',
    stockCount: null,
    featured: true,
  },
];

export const ALL_PRODUCTS: ProductKit[] = [
  ...PRODUCT_KITS,
  ...PROMO_BUNDLES,
  ...WHOLESALE_KITS,
  ...BRACELET_PRODUCTS,
  ...FAMILY_PRODUCTS,
  ...CHRISTMAS_PRODUCTS,
];

export const FAQS = [
  {
    question: '¿Cómo realizo mi pedido y cuáles son las formas de pago?',
    answer:
      'Agrega tus productos al carrito, completa tus datos de entrega y revisa el total. Paga con tarjeta en el checkout seguro de Stripe o solicita un link de pago por WhatsApp.',
  },
  {
    question: '¿Cómo se aplica el sticker y qué significa el resultado?',
    answer:
      '1) Limpia y seca la superficie de tu uña. 2) Coloca un sticker nuevo. 3) Sigue la guía incluida para aplicar la muestra y esperar el tiempo indicado. 4) Compara el color con la guía. Si muestra una alerta, no tomes la bebida. Una lectura sin cambio solo corresponde a las sustancias incluidas en la prueba y no descarta otras; mantén tu vaso a la vista y busca ayuda si te sientes mal.',
  },
  {
    question: '¿Cuáles son las condiciones de envío y cuándo es gratis?',
    answer:
      `Todos los pedidos de una sola pieza o pedidos pequeños menores a $899 MXN pagan $99 MXN de envío a México. En pedidos a partir de $899 MXN, el envío es gratis. ${DELIVERY_POLICY}`,
  },
  {
    question: '¿Cómo solicito una devolución?',
    answer: RETURN_POLICY,
  },
  {
    question: '¿Puedo añadir Tragoo Check a la pantalla de inicio?',
    answer:
      'Sí. En Android o iPhone puedes usar el botón "Añadir a pantalla de inicio" para crear un acceso directo web. Tragoo Check es un sitio web instalable, no una aplicación nativa.',
  },
  {
    question: '¿Qué información de seguridad importante debo conocer?',
    answer:
      'Este es un producto de un solo uso para fines informativos y de detección personal solamente. No garantiza el 100% de precisión, puede generar falsos positivos y no detecta todas las sustancias. Un resultado sin cambio no confirma que una bebida sea segura. No reutilizar. La exposición a ciertos jabones o químicos puede reducir la detección o provocar un cambio de color falso. No está clasificado como dispositivo médico de diagnóstico in vitro (IVD). Si sospechas adulteración, no consumas la bebida y busca ayuda.',
  },
];
