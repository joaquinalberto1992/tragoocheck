import { useRef, useState } from 'react';

const videos = [
  { src: '/videos/intro-premium.mp4', poster: '/videos/intro-premium.jpg', title: 'Kit Noche Completa', description: 'Todo lo esencial en una sola presentación.' },
  { src: '/videos/antes-de-salir.mp4', poster: '/videos/antes-de-salir.jpg', title: 'SOS Family GPS/SIM', description: 'Un apoyo para mantenerse en contacto.' },
  { src: '/videos/pulsera-premium.mp4', poster: '/videos/pulsera-premium.jpg', title: 'Pulsera Tragoo Check', description: 'Llévala contigo a conciertos y reuniones.' },
  { src: '/videos/popotes-premium.mp4', poster: '/videos/popotes-premium.jpg', title: 'Popotes de prueba', description: 'Consulta sus indicaciones y presentaciones.' },
  { src: '/videos/tiras.mp4', poster: '/videos/tiras.jpg', title: 'Tiras reactivas', description: 'Conoce el empaque y su guía de uso.' },
];

export function VideoGallery() {
  const players = useRef<(HTMLVideoElement | null)[]>([]);
  const [failed, setFailed] = useState<Record<number, boolean>>({});

  return (
    <section id="videos" className="scroll-mt-20 border-t border-[#ECE8EE] bg-white py-14 sm:py-16">
      <div className="mx-auto max-w-[1160px] px-4 sm:px-6">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[#8B2D97]">TRAGOO CHECK · EN VIDEO</p>
            <h2 className="text-3xl font-bold tracking-tight text-[#201927] sm:text-4xl">Ideas claras. Planes tuyos.</h2>
          </div>
          <a href="#kits" className="text-sm font-bold text-[#201927] underline decoration-[#A3E635] decoration-2 underline-offset-4">Ver productos</a>
        </div>

        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4">
          {videos.map((video, i) => (
            <article key={video.src} className="min-w-0 flex-[0_0_78vw] snap-start overflow-hidden rounded-2xl border border-[#EAE6EC] bg-white shadow-[0_8px_24px_rgba(32,25,39,0.05)] sm:flex-[0_0_42vw] md:flex-[0_0_30%] xl:flex-[0_0_18.25%]">
              <video
                ref={(node) => { players.current[i] = node; }}
                src={video.src}
                poster={video.poster}
                controls
                playsInline
                preload="metadata"
                aria-label={video.title}
                onPlay={() => players.current.forEach((player, index) => { if (index !== i) player?.pause(); })}
                onError={() => setFailed((previous) => ({ ...previous, [i]: true }))}
                className="aspect-[9/16] w-full bg-[#FCFBFD] object-cover"
              />
              <div className="p-4">
                <h3 className="font-bold text-[#201927]">{video.title}</h3>
                <p className="mt-1 min-h-10 text-sm leading-5 text-[#665D70]">{video.description}</p>
                {failed[i] && <p role="status" className="mt-2 text-sm text-[#8A2630]">No se pudo cargar. <a href={video.src} className="underline">Abrir video</a></p>}
                <a href="#kits" className="mt-3 inline-block text-sm font-bold text-[#466B00]">Elegir producto <span aria-hidden="true">→</span></a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
