export type ProductCategory = 'individual' | 'promocion' | 'mayoreo';

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
}

// Import assets through Vite so their URLs point to the built files in `dist`.
import heroProductImage from '../assets/images/tragoo-kit-noche-completa-branded-tumbler-v2.png';
import heroLifestyleImage from '../assets/images/hero_drink_test_1792021357545.jpg';
import wholesaleBoxImage from '../assets/images/tragoo_caja_mayoreo_display_1792022756046.jpg';
import wholesaleMasterImage from '../assets/images/tragoo_mayoreo_premium_master_1792024987601.jpg';
import kitStickersImage from '../assets/images/tragoo_kit_stickers_unas_1792022749823.jpg';
import kitStripsImage from '../assets/images/tragoo_kit_tiras_reactivas_1792022751432.jpg';
import duoPackImage from '../assets/images/tragoo_pack_duo_amigas_1792022753318.jpg';
import squadPackImage from '../assets/images/tragoo_pack_squad_5x_1792022755033.jpg';
import braceletIndividualImage from '../assets/images/pulsera-individual.jpg';
import braceletDetailImage from '../assets/images/pulsera-individual-detalle.jpg';
import braceletTrioImage from '../assets/images/pulseras-trio-amigas.jpg';
import braceletGroupImage from '../assets/images/pulseras-grupo-cinco.png';
import braceletRefillsImage from '../assets/images/repuestos-pulseras-30.jpg';
import testingStrawsImage from '../assets/images/popotes-prueba.jpg';

export const HERO_PRODUCT_IMAGE = heroProductImage;
export const HERO_LIFESTYLE_IMAGE = heroLifestyleImage;
export const KIT_STICKERS_IMAGE = kitStickersImage;
export const WHOLESALE_BOX_IMAGE = wholesaleBoxImage;
export const WHOLESALE_MASTER_IMAGE = wholesaleMasterImage;

export const INSTAGRAM_URL = 'https://www.instagram.com/tragoocheck/';
export const INSTAGRAM_HANDLE = '@tragoocheck';
export const OFFICIAL_DOMAIN = 'tragoocheck.shop';

export const ACTIVE_COUPONS: PromoCoupon[] = [
  {
    code: 'HOY10',
    label: '10% OFF en tu 1ra compra',
    discountPercent: 10,
    minPurchase: 449,
    description:
      '10% de descuento directo en tu primer pedido (acumulable con el 5% extra por Transferencia SPEI).',
  },
  {
    code: 'AMIGAS15',
    label: '15% OFF en compras $1,100+',
    discountPercent: 15,
    minPurchase: 1100,
    description:
      '15% de descuento especial al armar tu pedido grupal de amigas o pack de festival.',
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
      '10 stickers de detección para uñas en empaque Tragoo Check. Si la mitad del sticker se vuelve verde, NO TOMES.',
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
      '10 stickers reactivos con adhesivo hipoalergénico para uña (un solo uso)',
      'Tarjeta negra impermeable portastickers + bolsa doy-pack Tragoo Check',
      'Indicador colorimétrico en corazón; interpreta el resultado según las instrucciones del fabricante',
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
    image: HERO_PRODUCT_IMAGE,
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
    image: HERO_PRODUCT_IMAGE,
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
    image: HERO_PRODUCT_IMAGE,
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
    image: HERO_PRODUCT_IMAGE,
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
      'Con pago SPEI (-5% extra) baja a $156.75 MXN por kit ($78,375 MXN total)',
    ],
    idealFor: 'Socios comerciales nacionales, festivales masivos, corporativos y licitaciones.',
    stockCount: 3,
  },
];

export const BRACELET_PRODUCTS: ProductKit[] = [
  {
    id: 'popotes-prueba-10', category: 'individual', name: 'Popotes de Prueba · Paquete de 10',
    subtitle: 'Paquete con 10 popotes de prueba Tragoo Check para llevar a conciertos, reuniones y otros eventos.',
    kicker: '10 popotes de prueba', price: 599, unitPriceNumeric: 59.9,
    unitPriceLabel: '$59.90 MXN por popote', kitEquivalentCount: 0,
    image: testingStrawsImage,
    gallery: [{ src: testingStrawsImage, alt: 'Empaque y popotes de prueba Tragoo Check; la imagen presenta los formatos de 10, 20 y 30 unidades' }],
    contentsSummary: '10 popotes de prueba Tragoo Check', substancesDetected: 'GHB (según el empaque del proveedor)', reactionTime: '10 a 15 segundos (según el empaque del proveedor)',
    includedItems: ['10 popotes de prueba Tragoo Check'], idealFor: 'Eventos y reuniones.', stockCount: null,
  },
  {
    id: 'popotes-prueba-20', category: 'promocion', name: 'Popotes de Prueba · Paquete de 20',
    subtitle: 'Paquete de 20 popotes de prueba Tragoo Check para compartir en eventos y reuniones.',
    kicker: '20 popotes de prueba', price: 1499, unitPriceNumeric: 74.95,
    unitPriceLabel: '$74.95 MXN por popote', kitEquivalentCount: 0,
    image: testingStrawsImage,
    gallery: [{ src: testingStrawsImage, alt: 'Empaque y popotes de prueba Tragoo Check; la imagen presenta los formatos de 10, 20 y 30 unidades' }],
    contentsSummary: '20 popotes de prueba Tragoo Check', substancesDetected: 'GHB (según el empaque del proveedor)', reactionTime: '10 a 15 segundos (según el empaque del proveedor)',
    includedItems: ['20 popotes de prueba Tragoo Check'], idealFor: 'Compartir en eventos y reuniones.', stockCount: null,
  },
  {
    id: 'popotes-prueba-30', category: 'promocion', name: 'Popotes de Prueba · Paquete de 30',
    subtitle: 'Paquete de 30 popotes de prueba Tragoo Check para grupos y eventos.',
    kicker: '30 popotes de prueba', price: 2299, unitPriceNumeric: 2299 / 30,
    unitPriceLabel: '$76.63 MXN por popote', kitEquivalentCount: 0,
    image: testingStrawsImage,
    gallery: [{ src: testingStrawsImage, alt: 'Empaque y popotes de prueba Tragoo Check; la imagen presenta los formatos de 10, 20 y 30 unidades' }],
    contentsSummary: '30 popotes de prueba Tragoo Check', substancesDetected: 'GHB (según el empaque del proveedor)', reactionTime: '10 a 15 segundos (según el empaque del proveedor)',
    includedItems: ['30 popotes de prueba Tragoo Check'], idealFor: 'Grupos y eventos.', stockCount: null,
  },
  {
    id: 'repuestos-pulseras-30', category: 'individual', name: 'Repuestos exclusivos para pulseras (30 parches)',
    subtitle: 'Paquete con 30 parches reactivos de repuesto, diseñados exclusivamente para las pulseras Tragoo Check. Una presentación práctica para quienes ya tienen su pulsera y desean contar con repuestos para sus próximos eventos, conciertos y reuniones.',
    kicker: '30 parches · Exclusivos para pulseras Tragoo Check',
    price: 1589, unitPriceNumeric: 1589 / 30, unitPriceLabel: '$52.97 MXN por parche',
    kitEquivalentCount: 0, image: braceletRefillsImage,
    gallery: [{ src: braceletRefillsImage, alt: 'Paquete de 30 parches de repuesto exclusivos para pulseras Tragoo Check, frente y reverso del empaque' }],
    contentsSummary: '30 parches reactivos de repuesto para pulseras Tragoo Check',
    substancesDetected: '', reactionTime: '',
    includedItems: ['30 parches reactivos de repuesto exclusivos para pulseras Tragoo Check'],
    idealFor: 'Personas que ya tienen su pulsera Tragoo Check.', stockCount: null,
  },
  {
    id: 'pulsera-individual', category: 'individual', name: 'Pulsera Individual',
    subtitle: 'Un sobre con una pulsera ajustable morada y zona de prueba integrada. Presentación compacta, pensada para llevar a conciertos, festivales y reuniones.',
    kicker: '1 sobre · 1 pulsera', price: 599, unitPriceNumeric: 599,
    unitPriceLabel: '$599.00 MXN por pulsera', kitEquivalentCount: 0,
    image: braceletDetailImage,
    gallery: [
      { src: braceletDetailImage, alt: 'Pulsera individual morada Tragoo Check fuera del sobre, junto al frente y reverso de su empaque' },
      { src: braceletIndividualImage, alt: 'Pulsera individual Tragoo Check: frente y reverso del mismo sobre, presentación de una pulsera' },
    ],
    contentsSummary: '1 sobre con 1 pulsera ajustable morada y zona de prueba integrada',
    substancesDetected: '', reactionTime: '',
    includedItems: ['1 sobre', '1 pulsera ajustable morada con zona de prueba integrada'],
    idealFor: 'Conciertos, festivales y reuniones.', stockCount: null,
  },
  {
    id: 'pulseras-trio', category: 'promocion', name: 'Pack Trío de Pulseras',
    subtitle: 'Un solo sobre con tres pulseras. Ideal para compartir con amistades y llevar cada quien su propia pulsera durante un evento.',
    kicker: '1 sobre · 3 pulseras', price: 1499, unitPriceNumeric: 1499 / 3,
    unitPriceLabel: '$499.67 MXN por pulsera', kitEquivalentCount: 0,
    image: braceletTrioImage,
    gallery: [{ src: braceletTrioImage, alt: 'Pack Trío de pulseras Tragoo Check: tres pulseras moradas fuera del sobre y vistas del frente y reverso del empaque' }],
    contentsSummary: '1 solo sobre con 3 pulseras',
    substancesDetected: '', reactionTime: '', includedItems: ['1 sobre con 3 pulseras'],
    idealFor: 'Compartir con amistades durante un evento.', stockCount: null,
  },
  {
    id: 'pulseras-grupo', category: 'promocion', name: 'Pack Grupo de Pulseras',
    subtitle: 'Un sobre con cinco pulseras. Presentación pensada para grupos, celebraciones y eventos.',
    kicker: '1 sobre · 5 pulseras', price: 2299, unitPriceNumeric: 2299 / 5,
    unitPriceLabel: '$459.80 MXN por pulsera', kitEquivalentCount: 0,
    image: braceletGroupImage,
    gallery: [{ src: braceletGroupImage, alt: 'Presentación ilustrativa del Pack Grupo Tragoo Check: cinco pulseras moradas fuera del sobre, con frente y reverso del empaque' }],
    contentsSummary: '1 sobre con 5 pulseras',
    substancesDetected: '', reactionTime: '', includedItems: ['1 sobre con 5 pulseras'],
    idealFor: 'Grupos, celebraciones y eventos.', stockCount: null,
  },
];

export const ALL_PRODUCTS: ProductKit[] = [
  ...PRODUCT_KITS,
  ...PROMO_BUNDLES,
  ...WHOLESALE_KITS,
  ...BRACELET_PRODUCTS,
];

export const FAQS = [
  {
    question: '¿Cómo realizo mi pedido y cuáles son las formas de pago?',
    answer:
      '¡Es súper rápido! Elige tus kits en la página, llena tus datos de envío y toca "Enviar Pedido a WhatsApp". Tu pedido se enviará directo a nuestro WhatsApp oficial 479 229 3687, donde te daremos al instante tu Link de Pago con Tarjeta, tu referencia para Pago en Efectivo en OXXO o los datos de Transferencia SPEI (-5% de descuento extra) junto con la confirmación de tu envío.',
  },
  {
    question: '¿Cómo se aplica el sticker y qué significa el resultado?',
    answer:
      '1) Limpia y seca la superficie de tu uña. 2) Despega un sticker y colócalo en una uña. 3) Sigue las instrucciones del empaque para aplicar la muestra y esperar el tiempo indicado. 4) Interpreta cualquier cambio de color según el fabricante. Es una prueba orientativa: un resultado sin cambio no confirma que la bebida sea segura ni descarta otras sustancias. Si sospechas que fue manipulada, no la tomes y busca ayuda.',
  },
  {
    question: '¿Cuáles son las condiciones de envío y cuándo es gratis?',
    answer:
      'Todos los pedidos de una sola pieza o pedidos pequeños menores a $899 MXN pagan un envío express único de $99 MXN a cualquier parte de México. En todos los pedidos a partir de $899 MXN (como el Pack Trío 3x, Pack Squad 5x, Pack VIP 10x y todas las Cajas de Mayoreo), el Envío Express Asegurado es completamente GRATIS.',
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

