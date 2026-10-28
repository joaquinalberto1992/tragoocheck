import { BRACELET_PRODUCTS, ProductKit } from '../data/products';

export function UpcomingProducts({ onBuy }: { onBuy: (product: ProductKit) => void }) {
  return <section id="novedades" className="py-14 border-t border-[#231E30] scroll-mt-20">
    <div className="max-w-[1160px] mx-auto px-4 sm:px-6">
      <p className="text-[#A3E635] text-sm font-bold mb-3">NUEVAS PRESENTACIONES</p>
      <h2 className="text-3xl font-bold mb-8">Más opciones para tu próximo plan.</h2>
      <h3 className="text-2xl font-bold mb-5">Pulseras y repuestos Tragoo Check</h3>
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        {BRACELET_PRODUCTS.map(product => <article key={product.id} className="rounded-2xl border border-[#6D438A] p-6 bg-[#14111D] flex flex-col">
          <span className="text-sm text-[#D8B4FE] font-bold">{product.kicker}</span>
          <h4 className="text-xl font-bold mt-3 mb-3">{product.name}</h4>
          {product.gallery && <div className="mb-5 space-y-3">
            <a href={product.gallery[0].src} target="_blank" rel="noopener noreferrer" className="block rounded-xl overflow-hidden bg-black" aria-label={`Ampliar imagen de ${product.name}`}>
              <img src={product.gallery[0].src} alt={product.gallery[0].alt} width={1280} height={853} loading="lazy" className="w-full h-auto object-contain" />
            </a>
            <p className="text-xs text-[#C4BED4]">Frente y reverso del mismo sobre · {product.kicker}.</p>
            {product.gallery.length > 1 && <details className="text-sm text-[#D8B4FE]">
              <summary className="cursor-pointer py-2">Ver imagen adicional</summary>
              {product.gallery.slice(1).map(photo => <a key={photo.src} href={photo.src} target="_blank" rel="noopener noreferrer" aria-label="Ampliar imagen adicional">
                <img src={photo.src} alt={photo.alt} width={1280} height={853} loading="lazy" className="w-full h-auto rounded-xl object-contain" />
              </a>)}
            </details>}
          </div>}
          <p className="text-[#C4BED4] leading-relaxed mb-6">{product.subtitle}</p>
          <div className="mt-auto">
            <p className="text-3xl font-bold">${product.price.toLocaleString('es-MX')} <span className="text-sm">MXN</span></p>
            <p className="text-sm text-[#C4BED4] mt-2">{product.unitPriceLabel}</p>
            <button type="button" onClick={() => onBuy(product)} className="mt-5 w-full rounded-xl bg-[#A3E635] text-[#0B0910] font-bold px-4 py-3 hover:bg-[#BEF264]" aria-label={`Pedir ${product.name}`}>Pedir esta presentación</button>
          </div>
        </article>)}
      </div>
      <div className="grid gap-6">
        {['Popotes'].map(name => <article key={name} className="rounded-2xl border border-[#2E2840] p-7 bg-[#14111D]">
          <span className="text-xs text-[#A3E635]">Próximamente</span>
          <h3 className="text-2xl font-bold mt-3 mb-3">{name} Tragoo Check</h3>
          <p className="text-[#C4BED4]">Pronto podrás consultar su presentación, instrucciones y disponibilidad aquí.</p>
        </article>)}
      </div>
    </div>
  </section>;
}
