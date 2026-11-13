import { track as vercelTrack } from '@vercel/analytics';

export interface CommerceItem {
  id: string;
  name: string;
  price?: number;
  quantity: number;
  category?: string;
}

export interface CommerceEvent {
  value?: number;
  items?: CommerceItem[];
  method?: string;
  coupon?: string;
  transactionId?: string;
  itemListName?: string;
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
}

export interface CampaignAttribution {
  source: string;
  medium: string;
  campaign: string;
  content: string;
}

type Scalar = string | number | boolean | null;
type FbqFunction = ((...args: unknown[]) => void) & {
  queue: unknown[][];
  callMethod?: (...args: unknown[]) => void;
  loaded?: boolean;
  version?: string;
  push?: (...args: unknown[]) => void;
};

type AnalyticsWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
  fbq?: FbqFunction;
  _fbq?: FbqFunction;
};

const CONSENT_KEY = 'tc_optional_analytics_consent';
const INTERNAL_TRAFFIC_KEY = 'tc_internal_traffic';
const GA4_ID = import.meta.env.VITE_GA4_ID?.trim();
const META_PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID?.trim();
const META_PIXEL_MATCHING_DISABLED = import.meta.env.VITE_META_PIXEL_MATCHING_DISABLED === 'true';
const w = () => window as AnalyticsWindow;

export function getAnalyticsConsent(): 'accepted' | 'rejected' | null {
  try {
    const value = window.localStorage.getItem(CONSENT_KEY);
    return value === 'accepted' || value === 'rejected' ? value : null;
  } catch {
    return null;
  }
}

export function setAnalyticsConsent(value: 'accepted' | 'rejected'): void {
  try {
    window.localStorage.setItem(CONSENT_KEY, value);
  } catch {
    // Analytics consent is optional; keep the current page usable without storage.
  }
  if (value === 'accepted') initializeOptionalAnalytics();
  else {
    const analyticsWindow = w();
    analyticsWindow.gtag?.('consent', 'update', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    });
    analyticsWindow.fbq?.('consent', 'revoke');
  }
}

export function getCampaignAttribution(): CampaignAttribution {
  const params = new URLSearchParams(window.location.search);
  let referrerHost = '';
  try {
    referrerHost = document.referrer ? new URL(document.referrer).hostname.replace(/^www\./, '') : '';
  } catch {
    // A malformed referrer does not affect checkout.
  }
  const inferredSource = referrerHost.includes('instagram')
    ? 'instagram'
    : referrerHost.includes('facebook')
      ? 'facebook'
      : referrerHost.includes('google')
        ? 'google'
        : referrerHost.includes('youtube')
          ? 'youtube'
          : referrerHost || 'direct';
  return {
    source: sanitizeUtm(params.get('utm_source')) || inferredSource,
    medium: sanitizeUtm(params.get('utm_medium')) || (referrerHost ? 'organic_referral' : 'direct'),
    campaign: sanitizeUtm(params.get('utm_campaign')),
    content: sanitizeUtm(params.get('utm_content')),
  };
}

function sanitizeUtm(value: string | null): string {
  if (!value) return '';
  const safe = value.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 80);
  return /^[a-z][a-z0-9_-]*$/.test(safe) ? safe : '';
}

function isInternalTraffic(): boolean {
  try {
    return window.localStorage.getItem(INTERNAL_TRAFFIC_KEY) === '1';
  } catch {
    return false;
  }
}

function getSafePageLocation(): string {
  const url = new URL(window.location.href);
  const safeParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'];
  const safeQuery = new URLSearchParams();
  for (const key of safeParams) {
    const value = url.searchParams.get(key);
    const safeValue = sanitizeUtm(value);
    if (safeValue) safeQuery.set(key, safeValue);
  }
  url.search = safeQuery.toString();
  url.hash = '';
  return url.toString();
}

export function initializeOptionalAnalytics(): void {
  if (typeof window === 'undefined' || isInternalTraffic()) return;

  if (GA4_ID && /^G-[A-Z0-9]+$/i.test(GA4_ID)) {
    const analyticsWindow = w();
    if (!analyticsWindow.gtag) {
      analyticsWindow.dataLayer = analyticsWindow.dataLayer || [];
      analyticsWindow.gtag = (...args: unknown[]) => analyticsWindow.dataLayer!.push(args);
      analyticsWindow.gtag('consent', 'default', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
      });
      analyticsWindow.gtag('js', new Date());
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA4_ID)}`;
      script.dataset.tragooAnalytics = 'ga4';
      document.head.appendChild(script);
    }
    analyticsWindow.gtag('consent', 'update', {
      analytics_storage: 'granted',
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
    });
    if (document.querySelector<HTMLScriptElement>('script[data-tragoo-analytics="ga4"]')?.dataset.configured !== 'true') {
      analyticsWindow.gtag('config', GA4_ID, { send_page_view: false });
      const script = document.querySelector<HTMLScriptElement>('script[data-tragoo-analytics="ga4"]');
      if (script) script.dataset.configured = 'true';
      analyticsWindow.gtag('event', 'page_view', {
        page_location: getSafePageLocation(),
        page_title: document.title,
      });
    }
  }

  if (META_PIXEL_ID && /^\d{5,20}$/.test(META_PIXEL_ID) && META_PIXEL_MATCHING_DISABLED) {
    const analyticsWindow = w();
    if (!analyticsWindow.fbq) {
      const fbq = ((...args: unknown[]) => {
        if (fbq.callMethod) fbq.callMethod(...args);
        else fbq.queue.push(args);
      }) as FbqFunction;
      fbq.queue = [];
      fbq.loaded = true;
      fbq.version = '2.0';
      fbq.push = fbq;
      analyticsWindow.fbq = fbq;
      analyticsWindow._fbq = fbq;
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://connect.facebook.net/en_US/fbevents.js';
      script.dataset.tragooAnalytics = 'meta';
      document.head.appendChild(script);
      analyticsWindow.fbq('set', 'autoConfig', false, META_PIXEL_ID);
      analyticsWindow.fbq('init', META_PIXEL_ID);
      analyticsWindow.fbq('track', 'PageView');
    }
  }
}

const META_EVENTS: Record<string, string> = {
  view_item: 'ViewContent',
  add_to_cart: 'AddToCart',
  begin_checkout: 'InitiateCheckout',
  add_payment_info: 'AddPaymentInfo',
  purchase: 'Purchase',
  generate_lead: 'Lead',
};

export function trackCommerceEvent(eventName: string, event: CommerceEvent = {}): void {
  if (typeof window === 'undefined' || isInternalTraffic()) return;

  const params = new URLSearchParams(window.location.search);
  const attribution = getCampaignAttribution();
  const source = sanitizeUtm(event.source || params.get('utm_source')) || attribution.source;
  const medium = sanitizeUtm(event.medium || params.get('utm_medium')) || attribution.medium;
  const campaign = sanitizeUtm(event.campaign || params.get('utm_campaign')) || attribution.campaign;
  const content = sanitizeUtm(event.content || params.get('utm_content')) || attribution.content;
  const quantity = event.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const itemIds = event.items?.map((item) => item.id).join(',').slice(0, 240) || '';

  const context = [
    'currency=MXN',
    `source=${source.slice(0, 40)}`,
    `medium=${medium.slice(0, 40)}`,
    `campaign=${campaign.slice(0, 60)}`,
    `content=${content.slice(0, 40)}`,
    `quantity=${quantity}`,
    `items=${itemIds}`,
    event.method ? `method=${event.method.slice(0, 24)}` : '',
    event.coupon ? `coupon=${event.coupon.slice(0, 32)}` : '',
  ].filter(Boolean).join('|').slice(0, 255);
  const vercelData: Record<string, Scalar> = {
    value: typeof event.value === 'number' ? event.value : null,
    context,
  };

  try {
    vercelTrack(`tc_${eventName}`, vercelData);
  } catch {
    // A blocked analytics request must never interrupt shopping or payment.
  }

  const analyticsWindow = w();
  if (getAnalyticsConsent() === 'accepted' && analyticsWindow.gtag) {
    const gaParams: Record<string, unknown> = {
      currency: 'MXN',
      ...(typeof event.value === 'number' ? { value: event.value } : {}),
      ...(event.items?.length ? { item_count: quantity } : {}),
      ...(event.method ? { payment_type: event.method } : {}),
      ...(event.coupon ? { coupon: event.coupon } : {}),
      ...(event.transactionId ? { transaction_id: event.transactionId } : {}),
      ...(event.itemListName ? { item_list_name: event.itemListName } : {}),
      page_location: getSafePageLocation(),
      source,
      medium,
      campaign,
      content,
    };
    analyticsWindow.gtag('event', eventName, gaParams);
  }

  if (getAnalyticsConsent() === 'accepted' && analyticsWindow.fbq) {
    const metaEvent = META_EVENTS[eventName];
    const metaParams: Record<string, unknown> = {
      currency: 'MXN',
      ...(typeof event.value === 'number' ? { value: event.value } : {}),
      ...(event.items?.length ? { item_count: quantity } : {}),
    };
    if (metaEvent) analyticsWindow.fbq('track', metaEvent, metaParams);
    else analyticsWindow.fbq('trackCustom', eventName, metaParams);
  }
}

