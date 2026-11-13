import React, { useEffect, useState } from 'react';
import {
  getAnalyticsConsent,
  initializeOptionalAnalytics,
  setAnalyticsConsent,
} from '../lib/analytics';

export const AnalyticsConsent: React.FC = () => {
  const [choice, setChoice] = useState<'accepted' | 'rejected' | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const saved = getAnalyticsConsent();
    setChoice(saved);
    setIsOpen(saved === null);
    if (saved === 'accepted') initializeOptionalAnalytics();
  }, []);

  const choose = (nextChoice: 'accepted' | 'rejected') => {
    setAnalyticsConsent(nextChoice);
    setChoice(nextChoice);
    setIsOpen(false);
  };

  return (
    <>
      {isOpen && (
        <aside
          aria-label="Preferencias de medición"
          className="fixed inset-x-0 bottom-0 z-[70] border-t border-[#DCD3E2] bg-white px-4 py-4 shadow-[0_-12px_40px_rgba(32,25,39,0.14)] sm:bottom-4 sm:left-4 sm:right-auto sm:max-w-lg sm:rounded-2xl sm:border"
        >
          <p className="text-sm font-bold text-[#201927]">Ayúdanos a mejorar la compra</p>
          <p className="mt-1 text-xs leading-relaxed text-[#625969]">
            La tienda usa Vercel para contar visitas y etapas de compra sin datos de contacto. Si aceptas, también activaremos Google Analytics y Meta Pixel para medir campañas y el embudo. El Pixel solo se cargará si su opción de coincidencia automática está desactivada; no enviamos nombres, teléfonos, correos, direcciones ni datos de tarjeta a estas herramientas. Puedes cambiar tu elección cuando quieras.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => choose('accepted')}
              className="rounded-lg bg-[#67249A] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#7C2EAF]"
            >
              Aceptar Google y Meta
            </button>
            <button
              type="button"
              onClick={() => choose('rejected')}
              className="rounded-lg border border-[#DCD3E2] bg-white px-3.5 py-2 text-xs font-semibold text-[#51495B] hover:bg-[#F8F7FA]"
            >
              Continuar sin Google y Meta
            </button>
          </div>
        </aside>
      )}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label={`Preferencias de medición. Opción actual: ${choice === 'accepted' ? 'Google y Meta aceptados' : 'Google y Meta desactivados'}`}
          className="fixed bottom-[4.7rem] left-2 z-30 rounded-full border border-[#E1DCE6] bg-white/95 px-2.5 py-1.5 text-[10px] font-semibold text-[#625969] shadow-sm transition-colors hover:bg-[#F8F7FA] md:bottom-3"
        >
          Privacidad
        </button>
      )}
    </>
  );
};

