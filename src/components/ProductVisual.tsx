import { ProductKit, HERO_PRODUCT_IMAGE, PRODUCT_KITS } from '../data/products';

export function ProductVisual({ product }: { product: ProductKit }) {
  const grouped = product.category !== 'individual';
  const count = product.kitEquivalentCount;
  if (product.id === 'kit-recarga-total') return <div className="relative aspect-[4/3] bg-[#E2E2E2] border-b border-[#231E30]">
    <div className="grid grid-cols-2 h-full pb-10">
      {['kit-tiras', 'kit-stickers'].map(id => {
        const item = PRODUCT_KITS.find(kit => kit.id === id)!;
        return <div key={id} className="relative flex items-center"><img src={item.image} alt={item.name} loading="lazy" className="w-full object-contain" /><span className="absolute top-3 left-3 rounded-full bg-[#14111D] text-white px-3 py-1 text-sm">2 paquetes</span></div>;
      })}
    </div>
    <p className="absolute bottom-0 inset-x-0 bg-[#14111D] text-white text-xs p-2 text-center">10 tiras + 20 stickers · Recarga sin llavero</p>
  </div>;
  return <div className="relative aspect-[4/3] bg-[#E2E2E2] border-b border-[#231E30] overflow-hidden">
    {grouped ? <>
      <div className="absolute inset-0 grid gap-1 p-5 pb-12" style={{ gridTemplateColumns: `repeat(${count <= 3 ? count : 3}, minmax(0, 1fr))` }}>
        {Array.from({ length: Math.min(count, 6) }, (_, i) => <img key={i} src={HERO_PRODUCT_IMAGE} alt="Kit Noche Completa de referencia" loading="lazy" className="w-full h-full min-h-0 object-contain" />)}
      </div>
      <span className="absolute top-3 right-3 bg-[#14111D] text-white rounded-full px-3 py-1 font-bold">{count} kits</span>
      <p className="absolute bottom-0 inset-x-0 bg-[#14111D] text-white text-xs p-2 text-center">{count} kits incluidos · Composición ilustrativa</p>
    </> : <img src={product.image} alt={product.name} loading="lazy" className="w-full h-full object-contain" />}
  </div>;
}
