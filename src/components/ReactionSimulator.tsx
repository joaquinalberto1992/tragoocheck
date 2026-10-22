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
    <section id="simulador" className="py-16 md:py-24 border-t border-[#231E30]">
      <div className="max-w-[1160px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Explanation & Controls */}
          <div className="lg:col-span-6 space-y-6">
            <div className="text-xs font-medium text-[#A3E635] tracking-wide">
              Simulador visual ilustrativo · No es una prueba real
            </div>

            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white [text-wrap:balance]">
              Explora cómo se muestra un cambio de color.
            </h2>

            <p className="text-[#A19BB2] text-base leading-relaxed">
              Selecciona un formato y una muestra de demostración para ver una animación. El resultado es predeterminado y no mide una bebida ni representa con precisión una reacción real. Usa el producto solo según las instrucciones del fabricante.
            </p>

            {/* Step 1: Choose Format */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs text-[#A19BB2]">
                1. Elige el formato de prueba
              </label>
              <div className="inline-flex p-1 bg-[#14111D] border border-[#262136] rounded-lg">
                <button
                  type="button"
                  onClick={() => {
                    setTestFormat('sticker');
                    handleReset();
                  }}
                  className={`px-4 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    testFormat === 'sticker'
                      ? 'bg-[#A3E635] text-[#0B0910] font-semibold'
                      : 'text-[#C4BED4] hover:text-white'
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
                      : 'text-[#C4BED4] hover:text-white'
                  }`}
                >
                  Tira Reactiva Multipanel
                </button>
              </div>
            </div>

            {/* Step 2: Choose Drink Sample */}
            <div className="space-y-2">
              <label className="block text-xs text-[#A19BB2]">
                2. Tipo de muestra de bebida a simular
              </label>
              <div className="inline-flex p-1 bg-[#14111D] border border-[#262136] rounded-lg">
                <button
                  type="button"
                  onClick={() => {
                    setSampleType('adulterated');
                    handleReset();
                  }}
                  className={`px-4 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    sampleType === 'adulterated'
                      ? 'bg-white text-[#0B0910] font-semibold'
                      : 'text-[#C4BED4] hover:text-white'
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
                      : 'text-[#C4BED4] hover:text-white'
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
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[#A3E635] hover:bg-[#BEF264] text-[#0B0910] font-semibold text-sm transition-colors cursor-pointer disabled:opacity-60 whitespace-nowrap shrink-0"
              >
                <Droplets className="w-4 h-4" />
                {isTesting ? 'Analizando gota...' : completed ? 'Repetir prueba de gota' : 'Aplicar 1 gota al sensor'}
              </button>

              {(isTesting || completed) && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-lg border border-[#2E2840] text-xs font-medium text-[#C4BED4] hover:text-white hover:border-[#453C5E] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reiniciar
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Interactive Visual Stage */}
          <div className="lg:col-span-6">
            <div className="bg-[#14111D] border border-[#262136] rounded-2xl p-6 sm:p-8 space-y-6">
              {/* Top Digital Timer Header */}
              <div className="flex items-center justify-between border-b border-[#231E30] pb-4">
                <div>
                  <div className="text-xs text-[#A19BB2]">
                    {testFormat === 'sticker' ? 'Sensor adhesivo en uña' : 'Tira reactiva de doble panel'}
                  </div>
                  <div className="text-sm font-semibold text-white mt-0.5">
                    {sampleType === 'adulterated' ? 'Muestra con presencia de GHB' : 'Muestra de coctel estándar'}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-[#A19BB2]">Tiempo de reacción</div>
                  <div className="font-mono text-xl font-semibold text-[#A3E635] tabular-nums">
                    00:{secondsElapsed.toString().padStart(2, '0')}s
                  </div>
                </div>
              </div>

              {/* Visual Representation of Sticker or Strip */}
              <div className="relative h-56 rounded-xl bg-[#0B0910] border border-[#231E30] flex flex-col items-center justify-center p-6 overflow-hidden">
                {testFormat === 'sticker' ? (
                  <div className="flex flex-col items-center">
                    {/* Fingernail Silhouette + Circular Reactive Sticker */}
                    <div className="relative w-28 h-36 rounded-t-full bg-[#241E2E] border-2 border-[#3A314A] flex items-center justify-center shadow-inner">
                      {/* Circular Sticker */}
                      <div
                        className="relative w-16 h-16 rounded-full border-2 border-black/30 shadow-md transition-colors duration-300 overflow-hidden flex flex-col"
                        style={{ backgroundColor: '#FACC15' }}
                      >
                        {/* Top half reacts like in the video! */}
                        <div
                          className={`w-full h-1/2 transition-colors duration-500 ${
                            showColorShift ? 'bg-[#15803D]' : 'bg-[#FACC15]'
                          }`}
                        />
                        <div className="w-full h-1/2 bg-[#EAB308] flex items-center justify-center">
                          <span className="text-[9px] font-mono font-bold text-black/70">TRAGOO</span>
                        </div>

                        {/* Water droplet effect */}
                        {(isTesting || completed) && (
                          <div
                            className={`absolute inset-0 m-auto w-5 h-5 rounded-full border transition-opacity duration-300 ${
                              showColorShift
                                ? 'bg-[#166534]/60 border-white/50'
                                : 'bg-white/30 border-white/60'
                            }`}
                          />
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-[#A19BB2] mt-3">
                      {showColorShift
                        ? 'Cambio de amarillo a verde oscuro detectado'
                        : 'Color base amarillo sin alteración'}
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
                    <span className="text-xs text-[#A19BB2] mt-4">
                      {showColorShift
                        ? 'Almohadillas cambian a verde oscuro / violeta en presencia de adulterantes'
                        : 'Almohadillas conservan su tono neutro original'}
                    </span>
                  </div>
                )}

                {/* Progress Bar at bottom of stage */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#1B1626]">
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
                    <ShieldCheck className="w-5 h-5 text-[#A3E635] shrink-0 mt-0.5" />
                  )}
                  <div className="text-xs text-[#C4BED4] leading-relaxed">
                    {completed ? (
                      sampleType === 'adulterated' ? (
                        <span>
                <strong className="text-white">Animación de demostración:</strong> el color mostrado no analiza ni confirma la presencia de sustancias. Si sospechas que una bebida fue manipulada, no la consumas y busca ayuda.
                        </span>
                      ) : (
                        <span>
                <strong className="text-white">Sin cambio en esta animación:</strong> esto no significa que una bebida real sea segura. Nunca pierdas de vista tu vaso.
                        </span>
                      )
                    ) : (
                      <span>
                Presiona <strong className="text-white">Aplicar 1 gota al sensor</strong> para ver una animación interactiva, no una medición real.
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectKit(testFormat === 'sticker' ? 'kit-stickers' : 'kit-noche-completa')}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#A3E635] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
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
