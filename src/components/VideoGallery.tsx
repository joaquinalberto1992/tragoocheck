import { useRef, useState } from 'react';

const videos = [
  { src: '/tragoo-oficial.mp4', poster: '/videos/oficial.jpg', title: 'Conoce Tragoo Check', description: 'Una mirada a nuestra marca y sus productos.' },
  { src: '/videos/antes-de-salir.mp4', poster: '/videos/antes-de-salir.jpg', title: 'Tu kit antes de salir', description: 'Conoce el Kit Noche Completa y lo que incluye.' },
  { src: '/videos/tiras.mp4', poster: '/videos/tiras.jpg', title: 'Tiras reactivas', description: 'Descubre esta presentación del catálogo.' },
];

export function VideoGallery() {
  const players = useRef<(HTMLVideoElement | null)[]>([]);
  const [failed, setFailed] = useState<Record<number, boolean>>({});
  return <section id="videos" className="py-14 border-t border-[#231E30] bg-[#100D18] scroll-mt-20">
    <div className="max-w-[1160px] mx-auto px-4 sm:px-6">
      <p className="text-[#A3E635] text-sm font-bold mb-3">TRAGOO CHECK EN VIDEO</p>
      <h2 className="text-3xl sm:text-4xl font-bold mb-3">Conoce lo que llevas contigo.</h2>
      <p className="text-[#C4BED4] mb-8">Explora nuestros videos de presentación y elige tu próximo kit.</p>
      <div className="grid gap-6 md:grid-cols-3">
        {videos.map((video, i) => <article key={video.src} className="rounded-2xl overflow-hidden border border-[#2E2840] bg-[#14111D]">
          <video ref={node => { players.current[i] = node; }} src={video.src} poster={video.poster} controls playsInline preload="none" aria-label={video.title}
            onPlay={() => players.current.forEach((player, index) => { if (index !== i) player?.pause(); })}
            onError={() => setFailed(previous => ({ ...previous, [i]: true }))}
            className="w-full aspect-[9/16] object-contain bg-black" />
          <div className="p-5"><h3 className="font-bold text-lg mb-2">{video.title}</h3><p className="text-sm text-[#C4BED4]">{video.description}</p>
            {failed[i] && <p role="status" className="mt-2 text-sm">No se pudo cargar el video. <a href={video.src} className="underline">Abrir video</a></p>}
            <a href="#kits" className="inline-block mt-4 text-[#A3E635] font-bold">Elegir mi kit →</a>
          </div>
        </article>)}
      </div>
    </div>
  </section>;
}
