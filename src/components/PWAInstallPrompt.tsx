import React, { useEffect, useState } from 'react';
import {
  Download,
  Smartphone,
  Share,
  PlusSquare,
  X,
  CheckCircle2,
  MoreVertical,
} from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone ===
        true;
    setIsInstalled(isStandalone);

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
      return true;
    }
    return false;
  };

  return {
    isInstallable: !!deferredPrompt,
    isInstalled,
    isIOS,
    install,
  };
}

export const TragooLogoIcon: React.FC<{ className?: string }> = ({
  className = 'w-9 h-9',
}) => (
  <svg
    viewBox="0 0 512 512"
    className={`rounded-xl shrink-0 ${className}`}
    aria-label="Logo Tragoo Check"
  >
    <rect width="512" height="512" rx="108" fill="#18181B" />
    <rect
      x="14"
      y="14"
      width="484"
      height="484"
      rx="98"
      fill="#18181B"
      stroke="#2E2840"
      strokeWidth="10"
    />
    {/* Purple Glass */}
    <path
      d="M174 96 H338 L316 326 C314 344 300 356 282 356 H230 C212 356 198 344 196 326 Z"
      fill="none"
      stroke="#9333EA"
      strokeWidth="22"
      strokeLinejoin="round"
    />
    {/* Purple Liquid Wave */}
    <path
      d="M184 172 Q220 156 256 174 T328 172 L314 322 C312 336 300 346 282 346 H230 C212 346 200 336 198 322 Z"
      fill="#9333EA"
    />
    {/* Dark Cutout for Checkmark */}
    <path
      d="M192 248 L248 304 L374 162"
      fill="none"
      stroke="#18181B"
      strokeWidth="64"
      strokeLinecap="square"
      strokeLinejoin="miter"
    />
    {/* Vibrant Lime Checkmark */}
    <path
      d="M202 248 L248 294 L364 168"
      fill="none"
      stroke="#39E722"
      strokeWidth="38"
      strokeLinecap="square"
      strokeLinejoin="miter"
    />
    {/* Bottom Text */}
    <text
      x="256"
      y="438"
      textAnchor="middle"
      fontFamily="Plus Jakarta Sans, sans-serif"
      fontWeight="800"
      fontSize="60"
    >
      <tspan fill="#9333EA">Tragoo </tspan>
      <tspan fill="#39E722">Check</tspan>
    </text>
  </svg>
);

export const PWAInstallSection: React.FC<{ compact?: boolean }> = ({
  compact = false,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);
  const [selectedOsTab, setSelectedOsTab] = useState<'android' | 'ios'>(
    isIOS ? 'ios' : 'android'
  );

  useEffect(() => {
    if (isIOS) setSelectedOsTab('ios');
  }, [isIOS]);

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else {
      setShowModal(true);
    }
  };

  if (isInstalled) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[#14111D] border border-[#2D3823] text-xs text-[#A3E635]">
        <CheckCircle2 className="w-4 h-4 shrink-0" />
        <span>App Tragoo Check instalada</span>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={handleInstallClick}
        className={`inline-flex items-center justify-center gap-2 rounded-xl bg-[#14111D] hover:bg-[#1D182B] border border-[#2E2840] font-semibold text-white transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
          compact ? 'px-3 py-2 text-[11px]' : 'px-4 py-2.5 text-xs'
        }`}
      >
        <TragooLogoIcon className={compact ? 'w-5 h-5' : 'w-6 h-6'} />
        <span>
          {compact ? 'Añadir acceso' : 'Añadir a pantalla de inicio'}
        </span>
        <Download className="w-3.5 h-3.5 text-[#A3E635]" />
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#14111D] border border-[#2E2840] p-5 sm:p-6 space-y-4 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <TragooLogoIcon className="w-12 h-12" />
                <div>
                  <h3 className="text-base font-bold text-white">
                    Instalar App Tragoo Check
                  </h3>
                  <p className="text-xs text-[#A19BB2]">
                    Acceso web instalable en Android y iPhone
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-[#A19BB2] hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* OS Selector Tabs (Android / iPhone iOS) */}
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#0B0910] border border-[#231E30]">
              <button
                type="button"
                onClick={() => setSelectedOsTab('android')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  selectedOsTab === 'android'
                    ? 'bg-[#A3E635] text-[#0B0910]'
                    : 'text-[#C4BED4] hover:text-white'
                }`}
              >
                Celular Android
              </button>
              <button
                type="button"
                onClick={() => setSelectedOsTab('ios')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  selectedOsTab === 'ios'
                    ? 'bg-[#A3E635] text-[#0B0910]'
                    : 'text-[#C4BED4] hover:text-white'
                }`}
              >
                iPhone / iPad (iOS)
              </button>
            </div>

            <div className="p-4 rounded-xl bg-[#0B0910] border border-[#231E30] space-y-3 text-xs text-[#C4BED4]">
              {selectedOsTab === 'ios' ? (
                <>
                  <div className="font-bold text-white">
                    Cómo instalar en iPhone o iPad (Safari):
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Share className="w-4 h-4 text-[#A3E635] shrink-0 mt-0.5" />
                    <span>
                      1. Toca el icono de <strong className="text-white">Compartir</strong> (cuadro con flecha hacia arriba) en la barra de Safari.
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <PlusSquare className="w-4 h-4 text-[#A3E635] shrink-0 mt-0.5" />
                    <span>
                      2. Desliza hacia abajo y toca{' '}
                      <strong className="text-[#A3E635]">
                        Agregar a pantalla de inicio
                      </strong>
                      .
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#A3E635] shrink-0 mt-0.5" />
                    <span>
                      3. Toca <strong className="text-white">Agregar</strong> arriba a la derecha y verás el logo oficial de Tragoo Check junto a tus apps.
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="font-bold text-white">
                    Cómo instalar en tu teléfono Android (Chrome):
                  </div>
                  <div className="flex items-start gap-2.5">
                    <MoreVertical className="w-4 h-4 text-[#A3E635] shrink-0 mt-0.5" />
                    <span>
                      1. Toca el menú de tres puntos <strong className="text-white">(⋮)</strong> en la esquina superior derecha de Chrome.
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Download className="w-4 h-4 text-[#A3E635] shrink-0 mt-0.5" />
                    <span>
                      2. Selecciona{' '}
                      <strong className="text-[#A3E635]">
                        Instalar aplicación
                      </strong>{' '}
                      o <strong className="text-white">Agregar a la pantalla principal</strong>.
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Smartphone className="w-4 h-4 text-[#A3E635] shrink-0 mt-0.5" />
                    <span>
                      3. Confirma en <strong className="text-white">Instalar</strong> y la app quedará lista en tu pantalla de inicio.
                    </span>
                  </div>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="w-full py-3 px-4 rounded-xl bg-[#A3E635] hover:bg-[#BEF264] text-[#0B0910] font-bold text-xs transition-colors cursor-pointer"
            >
              Listo, entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
};
