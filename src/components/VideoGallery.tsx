import { useState } from 'react';

const officialVideo = {
  src: '/videos/tragoo-oficial-2026.mp4',
  poster: '/videos/tragoo-oficial-2026-poster.jpg',
};

export function VideoGallery() {
  const [failed, setFailed] = useState(false);

  return (
    <section id="videos" className="scroll-mt-20 border-t border-[#ECE8EE] bg-white py-14 sm:py-16">
      <div className="mx-auto max-w-[1040px] px-4 sm:px-6">
        <div className="mb-7">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[#8B2D97]">TRAGOO CHECK · VIDEO OFICIAL</p>
          <h2 className="text-3xl font-bold tracking-tight text-[#201927] sm:text-4xl">Conoce Tragoo Check</h2>
        </div>

        <article className="grid overflow-hidden rounded-2xl border border-[#EAE6EC] bg-white shadow-[0_8px_24px_rgba(32,25,39,0.06)] md:grid-cols-[minmax(0,1.45fr)_minmax(250px,0.75fr)]">
          <div className="min-w-0 bg-[#17131C]">
            <video
              src={officialVideo.src}
              poster={officialVideo.poster}
              controls
              playsInline
              preload="metadata"
              aria-label="Video oficial de Tragoo Check"
              onError={() => setFailed(true)}
              className="aspect-video w-full bg-[#17131C] object-contain"
            />
          </div>
          <div className="flex flex-col justify-center p-5 sm:p-7">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#8B2D97]">TRAGOO CHECK</p>
            <h3 className="mt-2 text-xl font-bold text-[#201927]">Seguridad para tus planes</h3>
            <p className="mt-3 text-sm leading-6 text-[#665D70]">
              Mira el video y descubre los productos disponibles para tus salidas, reuniones y eventos.
            </p>
            {failed && (
              <p role="status" className="mt-3 text-sm text-[#8A2630]">
                No se pudo cargar el video. <a href={officialVideo.src} className="underline">Abrir video oficial</a>
              </p>
            )}
            <a
              href="#kits"
              className="mt-5 inline-flex w-fit items-center rounded-xl bg-[#A3E635] px-4 py-3 text-sm font-bold text-[#201927] transition-colors hover:bg-[#94D62C]"
            >
              Ver productos
            </a>
          </div>
        </article>
      </div>
    </section>
  );
}
