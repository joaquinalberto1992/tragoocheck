import React, { useEffect, useState } from 'react';
import { ArrowRight, CalendarDays, Clock3, Tag, Truck } from 'lucide-react';

// The official 2026 event runs November 13–17. The shop's existing November
// coupons remain valid through November 30, so the banner changes phase rather
// than implying that those offers expire with the event.
const BUEN_FIN_START = new Date('2026-11-13T00:00:00-06:00').getTime();
const BUEN_FIN_END = new Date('2026-11-18T00:00:00-06:00').getTime();
const NOVEMBER_PROMO_END = new Date('2026-12-01T00:00:00-06:00').getTime();

type CountdownMode = 'before' | 'during' | 'last-days' | 'expired';

function getCountdown(now: number) {
  if (now < BUEN_FIN_START) {
    return { mode: 'before' as const, target: BUEN_FIN_START };
  }
  if (now < BUEN_FIN_END) {
    return { mode: 'during' as const, target: BUEN_FIN_END };
  }
  if (now < NOVEMBER_PROMO_END) {
    return { mode: 'last-days' as const, target: NOVEMBER_PROMO_END };
  }
  return { mode: 'expired' as const, target: now };
}

function splitTime(milliseconds: number) {
  const seconds = Math.max(0, Math.floor(milliseconds / 1000));
  return {
    days: Math.floor(seconds / 86_400),
    hours: Math.floor((seconds % 86_400) / 3_600),
    minutes: Math.floor((seconds % 3_600) / 60),
    seconds: seconds % 60,
  };
}

const countdownLabel: Record<Exclude<CountdownMode, 'expired'>, string> = {
  before: 'El Buen Fin comienza en',
  during: 'El Buen Fin termina en',
  'last-days': 'Las promociones de noviembre terminan en',
};

export const BuenFinCountdown: React.FC = () => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const { mode, target } = getCountdown(now);
  if (mode === 'expired') return null;

  const time = splitTime(target - now);
  const timerUnits = [
    { label: 'días', value: time.days },
    { label: 'hrs', value: time.hours },
    { label: 'min', value: time.minutes },
    { label: 'seg', value: time.seconds },
  ];

  return (
    <section
      id="buen-fin"
      aria-label="Cuenta regresiva y promociones de noviembre"
      className="border-b border-[#E8E4EB] bg-[#FCFBFD] px-4 py-4 sm:py-5"
    >
      <div className="mx-auto grid max-w-[1160px] gap-4 rounded-2xl border border-[#E7DDEE] bg-white p-4 shadow-sm sm:grid-cols-[1fr_auto] sm:items-center sm:p-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#7133A0]">
            <CalendarDays aria-hidden="true" className="h-4 w-4" />
            <span>El Buen Fin 2026 · 13 al 17 de noviembre</span>
          </div>
          <h2 className="mt-1.5 text-lg font-extrabold tracking-tight text-[#201927] sm:text-xl">
            {mode === 'before'
              ? 'Prepara tu carrito y aprovecha tus beneficios de noviembre'
              : mode === 'during'
                ? 'El Buen Fin ya comenzó: elige tus productos y aplica tu código'
                : 'Aún puedes aprovechar las promociones de noviembre'}
          </h2>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-xs leading-relaxed text-[#51495B]">
            <span className="inline-flex items-center gap-1.5">
              <Tag aria-hidden="true" className="h-3.5 w-3.5 text-[#466B00]" />
              10% con <strong className="font-mono text-[#201927]">HOY10</strong> desde $449
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Tag aria-hidden="true" className="h-3.5 w-3.5 text-[#466B00]" />
              15% con <strong className="font-mono text-[#201927]">AMIGAS15</strong> desde $1,100
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Truck aria-hidden="true" className="h-3.5 w-3.5 text-[#466B00]" />
              Envío gratis desde $899
            </span>
          </div>
          <p className="mt-2 text-[10px] leading-relaxed text-[#71687A]">
            Cupones vigentes hasta el 30 de noviembre de 2026. Se aplica un código por pedido; envío sujeto a cobertura.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:min-w-[250px] sm:items-end">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#51495B] sm:justify-end">
            <Clock3 aria-hidden="true" className="h-3.5 w-3.5 text-[#7133A0]" />
            <span>{countdownLabel[mode]}</span>
          </div>
          <div
            className="flex items-center gap-1.5"
            aria-label={`${time.days} días, ${time.hours} horas, ${time.minutes} minutos y ${time.seconds} segundos`}
            aria-live="off"
          >
            {timerUnits.map(({ label, value }) => (
              <div key={label} className="min-w-[48px] rounded-lg bg-[#F7F2FA] px-2 py-1.5 text-center">
                <div className="font-mono text-lg font-extrabold leading-none tabular-nums text-[#5B2A78]">
                  {String(value).padStart(2, '0')}
                </div>
                <div className="mt-1 text-[9px] font-bold uppercase tracking-wide text-[#625969]">
                  {label}
                </div>
              </div>
            ))}
          </div>
          <a
            href="#kits"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#A3E635] px-4 py-2 text-xs font-extrabold text-[#0B0910] transition-colors hover:bg-[#B4E75B]"
          >
            Ver productos y comprar <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
};
