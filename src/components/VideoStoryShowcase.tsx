import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Upload,
  Video,
  ArrowRight,
  Volume2,
  VolumeX,
  ShoppingBag,
} from 'lucide-react';

export interface PersuasiveSlide {
  id: string;
  slogan: string;
  phrase: string;
  subtext: string;
  durationMs: number; // 5000ms to 6500ms depending on text length
  ctaLabel: string;
  targetKitId: string;
}

export const WOMEN_PERSUASIVE_SLIDES: PersuasiveSlide[] = [
  {
    id: 'slide-1',
    slogan: 'UNA PRUEBA ORIENTATIVA, CON LÍMITES.',
    phrase:
      'Algunas sustancias pueden ser difíciles de identificar a simple vista. La prueba ofrece una señal orientativa para las sustancias indicadas por el fabricante; no detecta todo.',
    subtext: 'Frase 1 de 5 · Lectura pausada (5.6 seg)',
    durationMs: 5600,
    ctaLabel: 'Quiero mi Kit Noche Completa · $449',
    targetKitId: 'kit-noche-completa',
  },
  {
    id: 'slide-2',
    slogan: 'SALIR DE FIESTA ES PARA DISFRUTAR, NO PARA DUDAR DE TU VASO.',
    phrase:
      '¿Dejaste tu bebida sin vigilar? La prueba puede orientar, pero un resultado sin cambio no confirma que sea segura. Si tienes dudas, no la tomes y pide ayuda.',
    subtext: 'Frase 2 de 5 · Lectura pausada (6.2 seg)',
    durationMs: 6200,
    ctaLabel: 'Probar Stickers para Uñas · $249',
    targetKitId: 'kit-stickers',
  },
  {
    id: 'slide-3',
    slogan: 'CUANDO UNA SE CUIDA, NOS CUIDAMOS TODAS.',
    phrase:
      'Ser la amiga que lleva Tragoo Check en la bolsa o en las llaves puede cambiar toda la noche de tu grupo. Porque juntas salimos y juntas regresamos a casa.',
    subtext: 'Frase 3 de 5 · Lectura pausada (6.0 seg)',
    durationMs: 6000,
    ctaLabel: 'Ver Pack Trío Amigas (Envío Gratis) · $1,125',
    targetKitId: 'pack-trio-amigas-3x',
  },
  {
    id: 'slide-4',
    slogan: 'SI LA MITAD DEL STICKER SE VUELVE VERDE, NO TOMES.',
    phrase:
      'Sigue las instrucciones del fabricante. Un cambio de color puede indicar una reacción, pero ningún resultado descarta todas las sustancias ni sustituye pedir ayuda.',
    subtext: 'Frase 4 de 5 · Lectura pausada (5.8 seg)',
    durationMs: 5800,
    ctaLabel: 'Ver Kit Tiras + Stickers + Llavero · $449',
    targetKitId: 'kit-noche-completa',
  },
  {
    id: 'slide-5',
    slogan: 'TU TRANQUILIDAD VALE MÁS QUE CUALQUIER CÓCTEL.',
    phrase:
      'Lleva las pruebas contigo y revisa sus instrucciones antes de usarlas. Son una herramienta complementaria, no una garantía de seguridad para todas las bebidas o sustancias.',
    subtext: 'Frase 5 de 5 · Lectura pausada (5.8 seg)',
    durationMs: 5800,
    ctaLabel: 'Ver Pack Squad 5 Amigas · $1,745',
    targetKitId: 'pack-squad-5x',
  },
];

interface WomenSloganBannerProps {
  onSelectKit: (kitId: string) => void;
}

export const WomenSloganBanner: React.FC<WomenSloganBannerProps> = ({
  onSelectKit,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  const [progress, setProgress] = useState(0);

  const activeSlide = WOMEN_PERSUASIVE_SLIDES[currentIndex];

  useEffect(() => {
    if (isPaused) return;
    const stepMs = 50;
    const increment = (stepMs / activeSlide.durationMs) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev + increment >= 100) {
          setCurrentIndex((idx) => (idx + 1) % WOMEN_PERSUASIVE_SLIDES.length);
          return 0;
        }
        return prev + increment;
      });
    }, stepMs);

    return () => clearInterval(timer);
  }, [currentIndex, isPaused, activeSlide.durationMs]);

  const handleGoTo = (index: number) => {
    setCurrentIndex(index);
    setProgress(0);
  };

  const handlePrev = () => {
    setCurrentIndex(
      (prev) =>
        (prev - 1 + WOMEN_PERSUASIVE_SLIDES.length) %
        WOMEN_PERSUASIVE_SLIDES.length
    );
    setProgress(0);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % WOMEN_PERSUASIVE_SLIDES.length);
    setProgress(0);
  };

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative rounded-2xl bg-gradient-to-r from-[#181226] via-[#14111D] to-[#171F12] border border-[#2E2840] overflow-hidden shadow-xl"
    >
      {/* Story-style Top Progress Bars (5-6s per phrase) */}
      <div className="grid grid-cols-5 gap-1.5 px-5 pt-3.5">
        {WOMEN_PERSUASIVE_SLIDES.map((s, idx) => {
          const fillWidth =
            idx < currentIndex ? 100 : idx === currentIndex ? progress : 0;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => handleGoTo(idx)}
              className="h-1.5 rounded-full bg-[#262136] overflow-hidden cursor-pointer"
              aria-label={`Ir a frase ${idx + 1}`}
            >
              <div
                className="h-full bg-[#A3E635] transition-all duration-75"
                style={{ width: `${fillWidth}%` }}
              />
            </button>
          );
        })}
      </div>

      <div className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-2 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 font-mono font-bold text-[#A3E635] uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              {activeSlide.slogan}
            </span>
            <span className="text-[#524A68]">·</span>
            <span className="text-[11px] text-[#8E87A0] font-mono">
              {(activeSlide.durationMs / 1000).toFixed(1)}s de lectura
            </span>
          </div>

          <p className="text-sm sm:text-base md:text-lg font-medium text-white leading-relaxed">
            “{activeSlide.phrase}”
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => onSelectKit(activeSlide.targetKitId)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#A3E635] hover:bg-[#BEF264] text-[#0B0910] font-bold text-xs transition-colors cursor-pointer whitespace-nowrap"
          >
            <span>{activeSlide.ctaLabel}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <div className="inline-flex items-center gap-1 bg-[#0B0910] border border-[#262136] rounded-xl p-1">
            <button
              type="button"
              onClick={handlePrev}
              className="p-1.5 rounded-lg text-[#C4BED4] hover:text-white hover:bg-[#1E192B] cursor-pointer"
              aria-label="Frase anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsPaused(!isPaused)}
              className="p-1.5 rounded-lg text-[#A3E635] hover:bg-[#1E192B] cursor-pointer"
              aria-label={isPaused ? 'Reanudar frases' : 'Pausar lectura'}
              aria-pressed={isPaused}
              title={isPaused ? 'Reanudar' : 'Pausar lectura'}
            >
              {isPaused ? (
                <Play className="w-3.5 h-3.5" />
              ) : (
                <Pause className="w-3.5 h-3.5" />
              )}
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="p-1.5 rounded-lg text-[#C4BED4] hover:text-white hover:bg-[#1E192B] cursor-pointer"
              aria-label="Siguiente frase"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface HeroVideoPlayerProps {
  videoUrl?: string;
  onVideoUploaded: (newUrl: string) => void;
  onBuyKit: () => void;
}

export const HeroVideoPlayer: React.FC<HeroVideoPlayerProps> = ({
  videoUrl,
  onVideoUploaded,
  onBuyKit,
}) => {
  const [isMuted, setIsMuted] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [streamVersion, setStreamVersion] = useState<number>(1);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Prefer the configured public media URL. This also works when the page is
  // deployed as a static AI Studio build without the Express /api/video route.
  const activeVideoSrc = videoUrl || '/tragoo-oficial.mp4';

  const handleToggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
    if (!nextMuted) {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Video = reader.result as string;
        const res = await fetch('/api/upload-video', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ base64Video }),
        });
        const data = await res.json();
        if (data.videoUrl) {
          onVideoUploaded(data.videoUrl);
          setStreamVersion((v) => v + 1);
        }
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setIsUploading(false);
    }
  };

  return (
    <div className="relative flex-1 min-h-[380px] rounded-2xl overflow-hidden border border-[#2E2840] bg-[#09070E] flex flex-col justify-between shadow-2xl">
      {import.meta.env.DEV && <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime"
        onChange={handleFileChange}
        className="hidden"
      />}

      {/* Top Overlay Header */}
      <div className="relative z-10 px-4 py-3 bg-[#14111D]/95 border-b border-[#262136] flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-bold text-[#A3E635]">
          <Video className="w-4 h-4" />
          <span>VIDEO OFICIAL TRAGOO CHECK</span>
        </div>

        <button
          type="button"
          onClick={handleToggleMute}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#A3E635] hover:bg-[#BEF264] text-[#0B0910] font-bold text-[11px] transition-colors cursor-pointer shrink-0"
        >
          {isMuted ? (
            <>
              <VolumeX className="w-3.5 h-3.5" />
              <span>Activar Audio</span>
            </>
          ) : (
            <>
              <Volume2 className="w-3.5 h-3.5" />
              <span>Audio Activo</span>
            </>
          )}
        </button>
      </div>

      {/* Main Native HTML5 MP4 Video Stream */}
      <div className="relative flex-1 bg-black flex items-center justify-center min-h-[300px]">
        <video
          key={`${activeVideoSrc}-${streamVersion}`}
          ref={videoRef}
          src={activeVideoSrc}
          autoPlay
          muted={isMuted}
          loop
          playsInline
          controls
          preload="metadata"
          className="w-full h-full max-h-[430px] object-contain bg-black"
        />
      </div>

      {/* Bottom Action & Replace Bar */}
      <div className="relative z-10 px-4 py-3 bg-[#14111D] border-t border-[#262136] flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={onBuyKit}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#A3E635] hover:bg-[#BEF264] text-[#0B0910] font-bold text-xs transition-colors cursor-pointer"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Pedir Kit del Video · $449 MXN</span>
        </button>

        {import.meta.env.DEV && <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1E192B] hover:bg-[#2A233D] border border-[#2E2840] text-[11px] text-[#C4BED4] hover:text-white cursor-pointer"
        >
          <Upload className="w-3.5 h-3.5 text-[#A3E635]" />
          <span>{isUploading ? 'Actualizando video...' : 'Cambiar video MP4'}</span>
        </button>}
      </div>
    </div>
  );
};
