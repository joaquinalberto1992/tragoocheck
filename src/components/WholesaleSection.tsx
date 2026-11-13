import { ProductVisual } from './ProductVisual';
import React, { useState } from 'react';
import {
  Check,
  Calculator,
  TrendingUp,
  MessageCircle,
  ShoppingBag,
  Award,
} from 'lucide-react';
import {
  WHOLESALE_KITS,
  WHOLESALE_BOX_IMAGE,
  WHOLESALE_MASTER_IMAGE,
  ProductKit,
} from '../data/products';
import { getBuenFinFreeShippingThreshold } from '../data/promotionRules';

interface WholesaleSectionProps {
  onBuyWholesaleKit: (kit: ProductKit) => void;
  onAddToCart: (kit: ProductKit) => void;
  whatsappNumber: string;
}

export const WholesaleSection: React.FC<WholesaleSectionProps> = ({
  onBuyWholesaleKit,
  onAddToCart,
  whatsappNumber,
}) => {
  const [calcProductType, setCalcProductType] = useState<'noche' | 'stickers' | 'tiras'>('noche');
  const [calcUnits, setCalcUnits] = useState<number>(60);
  const [businessType, setBusinessType] = useState<string>('Bar / Antro / Festival');

  const baseRetailPrice =
    calcProductType === 'noche' ? 449 : calcProductType === 'tiras' ? 299 : 249;
  const productTitle =
    calcProductType === 'noche'
      ? 'Kit Noche Completa'
      : calcProductType === 'tiras'
      ? 'Kit Tiras Reactivas (5 pzas)'
      : 'Kit Stickers Uñas (10 pzas)';

  // Strictly decreasing unit price function: the larger the order, the strictly better the unit price!
  const getUnitPrice = (units: number, type: 'noche' | 'stickers' | 'tiras'): number => {
    if (type === 'noche') {
      if (units >= 500) return 165; // -63%
      if (units >= 250) return 185; // -59%
      if (units >= 120) return 205; // -54%
      if (units >= 60) return 230;  // -49%
      if (units >= 30) return 260;  // -42%
      if (units >= 15) return 290;  // -35%
      return 319;                   // 10–14 pzas (-29%)
    }
    if (type === 'tiras') {
      if (units >= 500) return 110;
      if (units >= 250) return 124;
      if (units >= 120) return 138;
      if (units >= 60) return 154;
      if (units >= 30) return 174;
      if (units >= 15) return 194;
      return 212;
    }
    // stickers ($249 retail)
    if (units >= 500) return 92;
    if (units >= 250) return 104;
    if (units >= 120) return 115;
    if (units >= 60) return 128;
    if (units >= 30) return 144;
    if (units >= 15) return 161;
    return 176;
  };

  const wholesaleUnitCost = getUnitPrice(calcUnits, calcProductType);
  const discountPercent = Math.round((1 - wholesaleUnitCost / baseRetailPrice) * 100);
  const totalInvestment = wholesaleUnitCost * calcUnits;
  const totalRetailValue = baseRetailPrice * calcUnits;
  const estimatedProfit = totalRetailValue - totalInvestment;
  const includedDisplays = Math.max(1, Math.floor(calcUnits / 30));
  const freeShippingThreshold = getBuenFinFreeShippingThreshold();

  const handleAddCustomLotToCheckout = () => {
    const customWholesaleProduct: ProductKit = {
      id: `lote-mayoreo-${calcProductType}-${calcUnits}`,
      category: 'mayoreo',
      name: `Lote Mayorista: ${calcUnits}x ${productTitle}`,
      subtitle: `Pedido mayorista (${businessType}) a $${wholesaleUnitCost} MXN c/u con ${includedDisplays} exhibidor(es). El envío se calcula según destino y se muestra antes del pago.`,
      kicker: `Mayoreo Personalizado · ${calcUnits} unidades (-${discountPercent}%)`,
      price: totalInvestment,
      compareAtPrice: totalRetailValue,
      unitPriceNumeric: wholesaleUnitCost,
      unitPriceLabel: `$${wholesaleUnitCost} MXN por unidad`,
      kitEquivalentCount: calcUnits,
      image: calcUnits >= 60 ? WHOLESALE_MASTER_IMAGE : WHOLESALE_BOX_IMAGE,
      contentsSummary: `${calcUnits} unidades de ${productTitle} · ${includedDisplays} Exhibidor(es)`,
      substancesDetected: 'Consulta la guía de cada formato incluido para revisar sus indicaciones.',
      reactionTime: 'Cada formato incluido tiene su propio instructivo.',
      includedItems: [
        `${calcUnits} paquetes individuales sellados de ${productTitle}`,
        `${includedDisplays} Caja(s) Exhibidora(s) negra mate oficial Tragoo Check`,
        'El envío y cualquier promoción vigente se muestran en el carrito antes del pago',
      ],
      idealFor: businessType,
      stockCount: 20,
    };
    onBuyWholesaleKit(customWholesaleProduct);
  };

  const buildWholesaleWhatsAppUrl = () => {
    const digits = (whatsappNumber || '524792293687').replace(/\D/g, '');
    const cleanPhone = digits.length === 10 ? `52${digits}` : digits || '524792293687';
    const msg = [
      `Hola *Tragoo Check*! Me interesa hacer un pedido de *MAYOREO PREMIUM*:`,
      ``,
      `• *Giro / Perfil:* ${businessType}`,
      `• *Producto:* ${productTitle}`,
      `• *Cantidad:* ${calcUnits} unidades (-${discountPercent}% OFF)`,
      `• *Costo unitario mayoreo:* $${wholesaleUnitCost} MXN (Público: $${baseRetailPrice} MXN)`,
      `• *Inversión total:* $${totalInvestment.toLocaleString('es-MX')} MXN`,
      ``,
      `¿Me compartes un enlace de pago seguro y los pasos para confirmar el pedido?`,
    ].join('\n');
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <section id="mayoreo" className="py-16 md:py-24 border-t border-[#E8E4EB] bg-white">
      <div className="max-w-[1160px] mx-auto px-4 sm:px-6 space-y-14">
        <div className="rounded-xl border border-[#C7DCA9]/40 bg-[#F2F7E9] px-4 py-3 text-center text-sm font-extrabold tracking-wide text-[#466B00]">
          Descuentos por volumen · precios unitarios y totales visibles antes de pedir
        </div>
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="text-xs font-medium text-[#466B00]">
              Programa Mayoristas Premium · Entre más grande tu pedido, menor es el costo por pieza
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#201927] [text-wrap:balance]">
              Venta a Mayoreo y Pedidos Súper Grandes (Hasta 63% OFF).
            </h2>
          </div>
          <div className="text-xs text-[#51495B] space-y-1 md:text-right">
            <div>Facturación CFDI · Exhibidores de mostrador incluidos</div>
          </div>
        </div>

        {/* Guaranteed Volume Tier Scale Strip */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E1DCE6] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#201927]">
              <Award className="w-4 h-4 text-[#466B00]" />
              <span>Escala Oficial de Precio Garantizado por Kit Noche Completa (Público: $449 MXN)</span>
            </div>
            <span className="text-[11px] text-[#625969]">
              A mayor volumen, mejor precio garantizado · Envío gratis desde $${freeShippingThreshold.toLocaleString('es-MX')} MXN en productos
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 text-center">
            {[
              { qty: '1 pza', unit: '$449', disc: 'Público', orderTotal: 449, extra: 'Kit individual' },
              { qty: '2 pzas', unit: '$399.50', disc: '-11%', orderTotal: 799, extra: 'Pack Dúo' },
              { qty: '3 pzas', unit: '$375', disc: '-16%', orderTotal: 1125, extra: 'Pack Trío' },
              { qty: '5 pzas', unit: '$349', disc: '-22%', orderTotal: 1745, extra: 'Pack grupo' },
              { qty: '15 pzas', unit: '$290', disc: '-35%', orderTotal: 4350, extra: 'Mayoreo N1' },
              { qty: '30 pzas', unit: '$260', disc: '-42%', orderTotal: 7800, extra: '+1 Exhibidor' },
              { qty: '60–120', unit: '$230–$205', disc: '-54%', orderTotal: 13800, extra: 'Master Box' },
              { qty: '250–500', unit: '$185–$165', disc: '-63%', orderTotal: 46250, extra: 'Socio Mega' },
            ].map((tier, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl border ${
                  idx >= 4
                    ? 'bg-[#F2F7E9] border-[#C7DCA9]/50'
                    : 'bg-white border-[#E8E4EB]'
                }`}
              >
                <div className="text-[11px] font-semibold text-[#51495B]">{tier.qty}</div>
                <div className="font-mono text-sm font-extrabold text-[#201927] mt-0.5 tabular-nums">
                  {tier.unit}
                </div>
                <div className="font-mono text-[10px] font-bold text-[#466B00] mt-0.5">
                  {tier.disc}
                </div>
                <div className="text-[10px] text-[#625969] font-semibold mt-1.5">
                  {tier.orderTotal >= freeShippingThreshold ? 'Envío Gratis' : 'Envío en carrito'} · {tier.extra}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 6 Ready-to-Buy Wholesale & Super Wholesale Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {WHOLESALE_KITS.map((box) => (
            <article
              key={box.id}
              className={`rounded-2xl bg-white border flex flex-col justify-between overflow-hidden transition-transform duration-150 hover:-translate-y-0.5 ${
                box.featured ? 'border-[#C7DCA9]' : 'border-[#E7E2EA]'
              }`}
            >
              <div>
                <ProductVisual product={box} />

                <div className="p-6 space-y-4">
                  <div className="text-xs font-medium text-[#466B00]">{box.kicker}</div>

                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-[#201927] leading-snug">{box.name}</h3>
                    <div className="text-xs text-[#466B00] font-mono font-semibold">
                      {box.unitPriceLabel}
                    </div>
                  </div>

                  <div className="flex items-baseline gap-2 pt-1">
                    {box.compareAtPrice && (
                      <span className="font-mono text-xs text-[#70677A] line-through tabular-nums">
                        ${box.compareAtPrice.toLocaleString('es-MX')}
                      </span>
                    )}
                    <span className="font-mono text-2xl font-extrabold text-[#201927] tabular-nums">
                      ${box.price.toLocaleString('es-MX')}
                    </span>
                    <span className="text-xs text-[#625969]">MXN</span>
                  </div>

                  <p className="text-xs text-[#51495B] leading-relaxed">{box.subtitle}</p>

                  <ul className="space-y-2 pt-2 border-t border-[#E8E4EB] text-xs text-[#51495B]">
                    {box.includedItems.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-[#466B00] shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="p-6 pt-0 space-y-2.5">
                <button
                  type="button"
                  onClick={() => onBuyWholesaleKit(box)}
                  className="w-full py-3 px-4 rounded-xl bg-[#A3E635] hover:bg-[#B4E75B] text-[#0B0910] font-bold text-xs transition-colors cursor-pointer whitespace-nowrap"
                >
                  Comprar Caja Ahora · ${box.price.toLocaleString('es-MX')} MXN
                </button>
                <button
                  type="button"
                  onClick={() => onAddToCart(box)}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#F4F1F6] hover:bg-[#EEEAF1] text-[#201927] font-medium text-xs transition-colors cursor-pointer whitespace-nowrap"
                >
                  Agregar caja al carrito
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* Interactive Custom Wholesale Profit & Volume Calculator (10 to 500 units) */}
        <div className="rounded-2xl bg-white border border-[#E1DCE6] p-6 sm:p-8 lg:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Left 7 Cols: Controls */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#466B00]">
                <Calculator className="w-4 h-4" />
                <span>Cotizador Mayorista Premium y Super Pedidos (10 a 500+ unidades)</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-[#201927]">
                Cotiza tu volumen exacto: entre más piezas pidas, más baja tu costo unitario
              </h3>

              {/* Select Product Format */}
              <div className="space-y-2">
                <label className="block text-xs text-[#625969]">
                  1. Selecciona el producto para tu lote mayorista
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setCalcProductType('noche')}
                    className={`px-3.5 py-2 rounded-lg text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      calcProductType === 'noche'
                        ? 'bg-[#A3E635] text-[#0B0910] border-[#C7DCA9] font-bold'
                        : 'bg-white text-[#51495B] border-[#E7E2EA] hover:text-[#201927]'
                    }`}
                  >
                    Kit Noche Completa (Público $449)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalcProductType('stickers')}
                    className={`px-3.5 py-2 rounded-lg text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      calcProductType === 'stickers'
                        ? 'bg-[#A3E635] text-[#0B0910] border-[#C7DCA9] font-bold'
                        : 'bg-white text-[#51495B] border-[#E7E2EA] hover:text-[#201927]'
                    }`}
                  >
                    Kit Stickers Uñas (Público $249)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalcProductType('tiras')}
                    className={`px-3.5 py-2 rounded-lg text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      calcProductType === 'tiras'
                        ? 'bg-[#A3E635] text-[#0B0910] border-[#C7DCA9] font-bold'
                        : 'bg-white text-[#51495B] border-[#E7E2EA] hover:text-[#201927]'
                    }`}
                  >
                    Kit Tiras Reactivas (Público $299)
                  </button>
                </div>
              </div>

              {/* Quick Volume Preset Buttons + Slider */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#625969]">2. Selecciona o desliza el volumen:</span>
                  <span className="font-mono text-base font-bold text-[#466B00] tabular-nums">
                    {calcUnits} unidades (-{discountPercent}% OFF · ${wholesaleUnitCost} c/u)
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {[15, 30, 60, 120, 250, 500].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setCalcUnits(preset)}
                      className={`px-3 py-1.5 rounded-lg font-mono text-xs border transition-colors cursor-pointer ${
                        calcUnits === preset
                          ? 'bg-[#A3E635] text-[#0B0910] border-[#C7DCA9] font-bold'
                          : 'bg-white text-[#51495B] border-[#E1DCE6] hover:border-[#C7DCA9]'
                      }`}
                    >
                      {preset} pzas (${getUnitPrice(preset, calcProductType)} c/u)
                    </button>
                  ))}
                </div>

                <input
                  type="range"
                  min={10}
                  max={500}
                  step={5}
                  value={calcUnits}
                  onChange={(e) => setCalcUnits(Number(e.target.value))}
                  className="w-full accent-[#A3E635] cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-[#665D70] font-mono">
                  <span>15 ($290)</span>
                  <span>30 ($260)</span>
                  <span>60 ($230)</span>
                  <span>120 ($205)</span>
                  <span>250 ($185)</span>
                  <span>500 ($165)</span>
                </div>
              </div>

              {/* Business Profile Selector */}
              <div className="space-y-2">
                <label className="block text-xs text-[#625969]">
                  3. Tipo de negocio o evento
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    'Bar / Antro / Festival',
                    'Distribuidor Regional',
                    'Cadena / Farmacia',
                    'Boda / Universidad',
                  ].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setBusinessType(type)}
                      className={`px-3 py-2 rounded-lg text-[11px] font-medium border text-center transition-colors cursor-pointer truncate ${
                        businessType === type
                          ? 'bg-white text-[#0B0910] border-white font-semibold'
                          : 'bg-white text-[#51495B] border-[#E7E2EA] hover:text-[#201927]'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right 5 Cols: Financial Readout & Instant Actions */}
            <div className="lg:col-span-5">
              <div className="p-6 rounded-xl bg-white border border-[#E7E2EA] space-y-5">
                <div className="flex items-center justify-between border-b border-[#E8E4EB] pb-4">
                  <div>
                    <div className="text-xs text-[#625969]">Tu costo unitario mayoreo</div>
                    <div className="font-mono text-2xl font-extrabold text-[#466B00] tabular-nums">
                      ${wholesaleUnitCost}{' '}
                      <span className="text-xs font-normal text-[#625969]">MXN c/u</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between text-[#51495B]">
                    <span>Inversión del lote ({calcUnits} pzas):</span>
                    <span className="font-mono font-semibold text-[#201927] tabular-nums">
                      ${totalInvestment.toLocaleString('es-MX')} MXN
                    </span>
                  </div>
                  <div className="flex justify-between text-[#51495B]">
                    <span>Exhibidores oficiales incluidos:</span>
                    <span className="font-mono text-[#201927] font-semibold">
                      {includedDisplays} Display(s) gratis
                    </span>
                  </div>
                  <div className="flex justify-between text-[#51495B]">
                    <span>Valor de venta al público ({calcUnits} × ${baseRetailPrice}):</span>
                    <span className="font-mono tabular-nums">
                      ${totalRetailValue.toLocaleString('es-MX')} MXN
                    </span>
                  </div>

                  <div className="pt-3 border-t border-[#E8E4EB] flex items-center justify-between">
                    <span className="font-semibold text-[#201927] flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-[#466B00]" />
                      Tu Ganancia Neta Estimada:
                    </span>
                    <span className="font-mono text-lg font-extrabold text-[#466B00] tabular-nums">
                      +${estimatedProfit.toLocaleString('es-MX')} MXN
                    </span>
                  </div>
                </div>

                <div className="space-y-2.5 pt-2">
                  <button
                    type="button"
                    onClick={handleAddCustomLotToCheckout}
                    className="w-full py-3.5 px-4 rounded-xl bg-[#A3E635] hover:bg-[#B4E75B] text-[#0B0910] font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>
                      Pedir este lote hoy (solicitar link de pago) · ${totalInvestment.toLocaleString('es-MX')}
                    </span>
                  </button>

                  <a
                    href={buildWholesaleWhatsAppUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-4 rounded-xl bg-[#F2EEF5] hover:bg-[#EEEAF1] border border-[#E1DCE6] text-[#201927] font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 text-[#466B00]" />
                    <span>Enviar Cotización Directo al WhatsApp 479 229 3687</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
