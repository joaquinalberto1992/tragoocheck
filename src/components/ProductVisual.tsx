import { CupSoda } from 'lucide-react';
import {
  KIT_STICKERS_IMAGE,
  KIT_STRIPS_IMAGE,
  ProductKit,
  PRODUCT_KITS,
} from '../data/products';

type ProductVisualProps = {
  product: ProductKit;
  layout?: 'card' | 'hero';
};

export function ProductVisual({ product, layout = 'card' }: ProductVisualProps) {
  const grouped =
    (product.category === 'promocion' || product.category === 'mayoreo') &&
    product.kitEquivalentCount > 0;
  const showKitContents = product.id === 'kit-noche-completa' || grouped;
  const count = product.kitEquivalentCount;
  const frameClass = layout === 'hero'
    ? 'relative h-full min-h-[320px] bg-white p-4 sm:p-6'
    : 'relative aspect-[4/3] bg-white border-b border-[#E8E4EB] p-3 sm:p-4';

  if (product.id === 'kit-recarga-total') {
    return (
      <div className={`${frameClass} overflow-hidden`}>
        <div className="grid h-full grid-cols-2 gap-2 pb-10">
          {[
            { id: 'kit-tiras', badge: '2 bolsas · 10 tiras' },
            { id: 'kit-stickers', badge: '2 tarjetas · 20 stickers' },
          ].map(({ id, badge }) => {
            const item = PRODUCT_KITS.find((kit) => kit.id === id)!;
            return (
              <div key={id} className="relative flex items-center justify-center rounded-xl bg-white">
                <img src={item.image} alt={item.name} loading="lazy" className="h-full w-full object-contain" />
                <span className="absolute left-2 top-2 rounded-full bg-[#5B2A78] px-2 py-1 text-[10px] font-semibold text-white">
                  {badge}
                </span>
              </div>
            );
          })}
        </div>
        <p className="absolute inset-x-0 bottom-0 bg-[#F4F1F6] p-2 text-center text-xs text-[#51495B]">
          10 tiras + 20 stickers · Recarga sin llavero
        </p>
      </div>
    );
  }

  if (showKitContents) {
    const parts = [
      {
        label: grouped ? '5 tiras por kit' : '5 tiras',
        image: KIT_STRIPS_IMAGE,
        alt: 'Empaque de tiras reactivas Tragoo Check con cinco tiras visibles',
      },
      {
        label: grouped ? '10 stickers por kit' : '10 stickers',
        image: KIT_STICKERS_IMAGE,
        alt: 'Sticker de corazón Tragoo Check aplicado en una uña',
      },
    ];

    return (
      <div className={`${frameClass} overflow-hidden`}>
        {grouped && (
          <span className="absolute right-3 top-3 z-10 rounded-full bg-[#5B2A78] px-3 py-1 text-xs font-bold text-white">
            {count} kits
          </span>
        )}
        <div className="grid h-full grid-cols-3 gap-2 pb-8 pt-2 sm:gap-3 sm:pb-9">
          {parts.map((part) => (
            <div key={part.label} className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-[#E8E4EB] bg-[#FAF9FB] p-1.5 sm:p-2">
              <div className="flex min-h-0 flex-1 items-center justify-center">
                <img src={part.image} alt={part.alt} loading="lazy" className="max-h-full w-full object-contain" />
              </div>
              <span className="pt-1 text-center text-[9px] font-semibold leading-tight text-[#51495B] sm:text-[11px]">
                {part.label}
              </span>
            </div>
          ))}
          <div className="flex min-w-0 flex-col items-center justify-center rounded-xl border border-[#E8E4EB] bg-[#FAF9FB] p-1.5 text-center sm:p-2">
            <CupSoda aria-hidden="true" className="h-9 w-9 text-[#5B2A78] sm:h-12 sm:w-12" strokeWidth={1.5} />
            <span className="pt-2 text-[9px] font-semibold leading-tight text-[#51495B] sm:text-[11px]">
              {grouped ? '1 llavero por kit' : '1 llavero'}
            </span>
          </div>
        </div>
        <p className="absolute inset-x-0 bottom-0 bg-[#F4F1F6] p-2 text-center text-[10px] font-medium text-[#51495B] sm:text-xs">
          {grouped ? 'Contenido de cada kit' : 'Contenido incluido en el kit'}
        </p>
      </div>
    );
  }

  return (
    <div className={`${frameClass} overflow-hidden`}>
      <img
        src={product.image}
        alt={product.name}
        loading="lazy"
        referrerPolicy="no-referrer"
        className="h-full w-full object-contain"
      />
      {product.imageBadge && (
        <span className="absolute bottom-3 left-3 max-w-[80%] rounded-full border border-[#E7E2EA] bg-white/95 px-3 py-1.5 text-xs font-semibold text-[#201927] shadow-sm">
          {product.imageBadge}
        </span>
      )}
    </div>
  );
}
