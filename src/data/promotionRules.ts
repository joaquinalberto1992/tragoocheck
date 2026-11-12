// El Buen Fin 2026 is observed in Mexico City time (UTC-6).
export const NOVEMBER_PROMOTION_START = Date.parse('2026-11-01T06:00:00.000Z');
export const BUEN_FIN_START = Date.parse('2026-11-13T06:00:00.000Z');
export const BUEN_FIN_END = Date.parse('2026-11-18T06:00:00.000Z');
export const NOVEMBER_PROMOTION_END = Date.parse('2026-12-01T06:00:00.000Z');

export const REGULAR_FREE_SHIPPING_THRESHOLD = 899;
export const BUEN_FIN_FREE_SHIPPING_THRESHOLD = 399;

export function isBuenFinActive(now = Date.now()): boolean {
  return now >= BUEN_FIN_START && now < BUEN_FIN_END;
}

export function getBuenFinFreeShippingThreshold(now = Date.now()): number {
  return isBuenFinActive(now)
    ? BUEN_FIN_FREE_SHIPPING_THRESHOLD
    : REGULAR_FREE_SHIPPING_THRESHOLD;
}
