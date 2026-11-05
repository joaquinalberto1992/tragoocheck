import { ProductKit, HERO_PRODUCT_IMAGE, PRODUCT_KITS } from '../data/products';

export function ProductVisual({ product }: { product: ProductKit }) {
  const grouped = product.category === 'promocion' && product.kitEquivalentCount > 0;
  const count = product.kitEquivalentCount;
  if (product.id === 'kit-recarga-total') return <div className="relative aspect-[4/3] bg-white border-b border-[#E8E4EB] p-3 sm:p-4">
    <div className="grid grid-cols-2 h-full pb-10 gap-2">
      {['kit-tiras', 'kit-stickers'].map(id => {
        const item = PRODUCT_KITS.find(kit => kit.id === id)!;
        return <div key={id} className="relative flex items-center justify-center rounded-xl bg-white"><img src={item.image} alt={item.name} loading="lazy" className="w-full h-full object-contain" /><span className="absolute top-2 left-2 rounded-full bg-[#5B2A78] text-white px-3 py-1 text-xs font-semibold">2 paquetes</span></div>;
      })}
    </div>
    <p className="absolute bottom-0 inset-x-0 bg-[#F4F1F6] text-[#51495B] text-xs p-2 text-center">10 tiras + 20 stickers · Recarga sin llavero</p>
  </div>;
  return <div className="relative aspect-[4/3] bg-white border-b border-[#E8E4EB] overflow-hidden p-3 sm:p-4">
    {grouped ? <>
      <div className="absolute inset-3 sm:inset-4 grid gap-1 p-2 pb-12" style={{ gridTemplateColumns: `repeat(${count <= 3 ? count : 3}, minmax(0, 1fr))` }}>
        {Array.from({ length: Math.min(count, 6) }, (_, i) => <img key={i} src={HERO_PRODUCT_IMAGE} alt="Kit Noche Completa de referencia" loading="lazy" className="w-full h-full min-h-0 object-contain" />)}
      </div>
      <span className="absolute top-3 right-3 bg-[#5B2A78] text-white rounded-full px-3 py-1 font-bold">{count} kits</span>
      <p className="absolute bottom-0 inset-x-0 bg-[#F4F1F6] text-[#51495B] text-xs p-2 text-center">{count} kits incluidos · Composición ilustrativa</p>
    </> : <img src={product.image} alt={product.name} loading="lazy" className="w-full h-full object-contain" />}
  </div>;
}
