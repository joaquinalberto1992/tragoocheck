import React, { useState, useEffect } from 'react';
import { Droplets, RotateCcw, ShieldAlert, ShieldCheck, ArrowRight } from 'lucide-react';

interface ReactionSimulatorProps {
  onSelectKit: (kitId: string) => void;
}

export const ReactionSimulator: React.FC<ReactionSimulatorProps> = ({ onSelectKit }) => {
  const [testFormat, setTestFormat] = useState<'sticker' | 'strip'>('sticker');
  const [sampleType, setSampleType] = useState<'adulterated' | 'clean'>('adulterated');
  const [isTesting, setIsTesting] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (!isTesting) return;

    const interval = setInterval(() => {
      setSecondsElapsed((prev) => {
        if (prev >= 16) {
          clearInterval(interval);
          setIsTesting(false);
          setCompleted(true);
          return 16;
        }
        return prev + 1;
      });
    }, 180); // Accelerated 16s visual counter for instant UX feedback

    return () => clearInterval(interval);
  }, [isTesting]);

  const handleStartTest = () => {
    setSecondsElapsed(0);
    setCompleted(false);
    setIsTesting(true);
  };

  const handleReset = () => {
    setIsTesting(false);
    setSecondsElapsed(0);
    setCompleted(false);
  };

  const progressRatio = Math.min(secondsElapsed / 16, 1);
  const showColorShift = sampleType === 'adulterated' && secondsElapsed >= 6;

  return (
    <section id="simulador" className="py-16 md:py-24 border-t border-[#E8E4EB]">
      <div className="max-w-[1160px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Explanation & Controls */}
          <div className="lg:col-span-6 space-y-6">
            <div className="text-xs font-medium text-[#466B00] tracking-wide">
              Simulador visual ilustrativo · No es una prueba real
            </div>

            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#201927] [text-wrap:balance]">
              Explora cómo se muestra un cambio de color.
            </h2>

            <p className="text-[#625969] text-base leading-relaxed">
              Selecciona un formato y una muestra de demostración para ver una animación. El resultado es predeterminado y no mide una bebida ni representa con precisión una reacción real. Usa el producto solo según las instrucciones del fabricante.
            </p>

            {/* Step 1: Choose Format */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs text-[#625969]">
                1. Elige el formato de prueba
              </label>
              <div className="inline-flex p-1 bg-white border border-[#E7E2EA] rounded-lg">
                <button
                  type="button"
                  onClick={() => {
                    setTestFormat('sticker');
                    handleReset();
                  }}
                  className={`px-4 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    testFormat === 'sticker'
                      ? 'bg-[#A3E635] text-[#0B0910] font-semibold'
                      : 'text-[#51495B] hover:text-[#201927]'
                  }`}
                >
                  Sticker de Uña (GHB)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTestFormat('strip');
                    handleReset();
                  }}
                  className={`px-4 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    testFormat === 'strip'
                      ? 'bg-[#A3E635] text-[#0B0910] font-semibold'
                      : 'text-[#51495B] hover:text-[#201927]'
                  }`}
                >
                  Tira Reactiva Multipanel
                </button>
              </div>
            </div>

            {/* Step 2: Choose Drink Sample */}
            <div className="space-y-2">
              <label className="block text-xs text-[#625969]">
                2. Tipo de muestra de bebida a simular
              </label>
              <div className="inline-flex p-1 bg-white border border-[#E7E2EA] rounded-lg">
                <button
                  type="button"
                  onClick={() => {
                    setSampleType('adulterated');
                    handleReset();
                  }}
                  className={`px-4 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    sampleType === 'adulterated'
                      ? 'bg-white text-[#0B0910] font-semibold'
                      : 'text-[#51495B] hover:text-[#201927]'
                  }`}
                >
                  Trago adulterado (GHB / Ketamina)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSampleType('clean');
                    handleReset();
                  }}
                  className={`px-4 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    sampleType === 'clean'
                      ? 'bg-white text-[#0B0910] font-semibold'
                      : 'text-[#51495B] hover:text-[#201927]'
                  }`}
                >
                  Trago limpio (Sin sustancias)
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleStartTest}
                disabled={isTesting}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[#A3E635] hover:bg-[#B4E75B] text-[#0B0910] font-semibold text-sm transition-colors cursor-pointer disabled:opacity-60 whitespace-nowrap shrink-0"
              >
                <Droplets className="w-4 h-4" />
                {isTesting ? 'Analizando gota...' : completed ? 'Repetir prueba de gota' : 'Aplicar 1 gota al sensor'}
              </button>

              {(isTesting || completed) && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-lg border border-[#E1DCE6] text-xs font-medium text-[#51495B] hover:text-[#201927] hover:border-[#D9D2E0] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reiniciar
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Interactive Visual Stage */}
          <div className="lg:col-span-6">
            <div className="bg-white border border-[#E7E2EA] rounded-2xl p-6 sm:p-8 space-y-6">
              {/* Top Digital Timer Header */}
              <div className="flex items-center justify-between border-b border-[#E8E4EB] pb-4">
                <div>
                  <div className="text-xs text-[#625969]">
                    {testFormat === 'sticker' ? 'Sensor adhesivo en uña' : 'Tira reactiva de doble panel'}
                  </div>
                  <div className="text-sm font-semibold text-[#201927] mt-0.5">
                    {sampleType === 'adulterated' ? 'Muestra con presencia de GHB' : 'Muestra de coctel estándar'}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-[#625969]">Tiempo de reacción</div>
                  <div className="font-mono text-xl font-semibold text-[#466B00] tabular-nums">
                    00:{secondsElapsed.toString().padStart(2, '0')}s
                  </div>
                </div>
              </div>

              {/* Visual Representation of Sticker or Strip */}
              <div className="relative h-56 rounded-xl bg-white border border-[#E8E4EB] flex flex-col items-center justify-center p-6 overflow-hidden">
                {testFormat === 'sticker' ? (
                  <div className="flex flex-col items-center">
                    {/* Fingernail silhouette + tiny heart sticker matching the real product */}
                    <div className="relative w-28 h-36 rounded-t-full bg-[#F7F5F8] border-2 border-[#E1DCE6] flex items-center justify-center shadow-inner">
                      <div className="relative h-6 w-6 drop-shadow-md" aria-label="Sticker pequeño en forma de corazón">
                        <svg viewBox="0 0 32 32" className="h-full w-full" aria-hidden="true">
                          <path d="M16 28S3 20.3 3 12a7 7 0 0 1 13-4 7 7 0 0 1 13 4c0 8.3-13 16-13 16Z" fill="#EAB308" />
                          {showColorShift && (
                            <path d="M16 8A7 7 0 0 0 3 12c0 8.3 13 16 13 16Z" fill="#15803D" />
                          )}
                        </svg>
                        {(isTesting || completed) && (
                          <div
                            className={`absolute inset-0 m-auto h-2 w-2 rounded-full border transition-opacity duration-300 ${
                              showColorShift
                                ? 'bg-[#166534]/60 border-white/50'
                                : 'bg-white/30 border-white/60'
                            }`}
                          />
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-[#625969] mt-3">
                      {showColorShift
                        ? 'Ejemplo visual de cambio de color'
                        : 'Sticker real en tamaño aproximado'}
                    </span>
                    <span className="mt-2 max-w-xs text-center text-[10px] leading-relaxed text-[#70677A]">
                      Simulación ilustrativa. Sigue las instrucciones del producto; un resultado no confirma que una bebida sea segura.
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center w-full max-w-xs">
                    {/* Test Strip Representation */}
                    <div className="w-full h-14 bg-[#F1F5F9] rounded-md border border-slate-300 flex items-center justify-between px-4 shadow-md">
                      <span className="font-mono text-[11px] font-semibold text-slate-700 tracking-wider">
                        TRAGOO CHECK · MULTIPANEL
                      </span>
                      <div className="flex items-center gap-2">
                        {/* Pad 1: GHB */}
                        <div
                          className={`w-7 h-9 rounded transition-colors duration-500 border border-black/15 ${
                            showColorShift ? 'bg-[#15803D]' : 'bg-[#FDE047]'
                          }`}
                          title="Panel GHB"
                        />
                        {/* Pad 2: Ketamina / Aminas */}
                        <div
                          className={`w-7 h-9 rounded transition-colors duration-500 border border-black/15 ${
                            showColorShift ? 'bg-[#6D28D9]' : 'bg-[#FDBA74]'
                          }`}
                          title="Panel Ketamina / Aminas"
                        />
                      </div>
                    </div>
                    <span className="text-xs text-[#625969] mt-4">
                      {showColorShift
                        ? 'Almohadillas cambian a verde oscuro / violeta en presencia de adulterantes'
                        : 'Almohadillas conservan su tono neutro original'}
                    </span>
                  </div>
                )}

                {/* Progress Bar at bottom of stage */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#E7E2EA]">
                  <div
                    className="h-full bg-[#A3E635] transition-transform duration-150 origin-left"
                    style={{ transform: `scaleX(${progressRatio})` }}
                  />
                </div>
              </div>

              {/* Outcome Readout & Direct Kit Action */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                <div className="flex items-start gap-3">
                  {completed && sampleType === 'adulterated' ? (
                    <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  ) : (
                    <ShieldCheck className="w-5 h-5 text-[#466B00] shrink-0 mt-0.5" />
                  )}
                  <div className="text-xs text-[#51495B] leading-relaxed">
                    {completed ? (
                      sampleType === 'adulterated' ? (
                        <span>
                <strong className="text-[#201927]">Animación de demostración:</strong> el color mostrado no analiza ni confirma la presencia de sustancias. Si sospechas que una bebida fue manipulada, no la consumas y busca ayuda.
                        </span>
                      ) : (
                        <span>
                <strong className="text-[#201927]">Sin cambio en esta animación:</strong> esto no significa que una bebida real sea segura. Nunca pierdas de vista tu vaso.
                        </span>
                      )
                    ) : (
                      <span>
                Presiona <strong className="text-[#201927]">Aplicar 1 gota al sensor</strong> para ver una animación interactiva, no una medición real.
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectKit(testFormat === 'sticker' ? 'kit-stickers' : 'kit-noche-completa')}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#466B00] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Comprar este kit
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
