import { KIT_STICKERS_IMAGE, KIT_STRIPS_IMAGE, ProductKit } from '../data/products';

type ProductVisualProps = {
  product: ProductKit;
  layout?: 'card' | 'hero';
};

export function ProductVisual({ product, layout = 'card' }: ProductVisualProps) {
  const grouped =
    (product.category === 'promocion' || product.category === 'mayoreo') &&
    product.kitEquivalentCount > 0;
  const count = product.kitEquivalentCount;
  const frameClass = layout === 'hero'
    ? 'relative h-full min-h-[320px] bg-white p-4 sm:p-6'
    : 'relative aspect-[4/3] bg-white border-b border-[#E8E4EB] p-3 sm:p-4';

  if (product.id === 'kit-recarga-total') {
    const contents = [
      { image: KIT_STRIPS_IMAGE, alt: 'Empaque Tragoo Check con tiras reactivas', label: '10 tiras reactivas' },
      { image: KIT_STICKERS_IMAGE, alt: 'Sticker corazón pequeño aplicado sobre una uña', label: '20 stickers para uñas' },
    ];

    return (
      <div className={`${frameClass} overflow-hidden`}>
        <div className="grid h-full grid-cols-2 gap-3 pb-9">
          {contents.map((item) => (
            <div key={item.label} className="flex min-w-0 flex-col items-center justify-center gap-2 rounded-xl border border-[#E8E4EB] bg-white p-2">
              <img src={item.image} alt={item.alt} loading="lazy" className="min-h-0 w-full flex-1 object-contain" />
              <span className="text-center text-[10px] font-semibold leading-tight text-[#51495B] sm:text-xs">{item.label}</span>
            </div>
          ))}
        </div>
        <p className="absolute inset-x-0 bottom-0 bg-[#F4F1F6] p-2 text-center text-xs text-[#51495B]">
          Refill · 30 piezas en total
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
      {grouped && (
        <span className="absolute right-3 top-3 rounded-full bg-[#5B2A78] px-3 py-1 text-xs font-bold text-white">
          {count} kits
        </span>
      )}
      {!grouped && product.imageBadge && (
        <span className="absolute bottom-3 left-3 max-w-[80%] rounded-full border border-[#E7E2EA] bg-white/95 px-3 py-1.5 text-xs font-semibold text-[#201927] shadow-sm">
          {product.imageBadge}
        </span>
      )}
    </div>
  );
}
