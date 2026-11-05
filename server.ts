import express from 'express';
import { randomUUID, timingSafeEqual } from 'node:crypto';
import fs from 'fs';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { POST as stripeCheckoutPost } from './api/checkout/stripe.js';
import { GET as stripeCheckoutConfirmGet } from './api/checkout/confirm.js';
import { POST as stripeWebhookPost } from './api/stripe/webhook.js';
import {
  getStripeSecretKey,
  getStripeKeyMode,
  isStripeConfiguredForEnvironment,
  quoteCheckout,
} from './api/_shared.js';

dotenv.config({ path: ['.env.local', '.env'] });

const DATA_FILE = path.resolve(process.cwd(), 'store-data.json');

export interface MerchantConfig {
  cardNumberRef: string;
  whatsappNumber: string;
  instagramUrl: string;
  customDomain: string;
  videoUrl?: string;
  shippingFee: number;
  freeShippingThreshold: number;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface OrderRecord {
  folio: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress: string;
  city: string;
  state: string;
  postalCode: string;
  notes?: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  couponDiscount?: number;
  shipping: number;
  total: number;
  paymentMethod: 'link_pago' | 'stripe';
  paymentStatus: 'pendiente_comprobante' | 'pagado' | 'enviado';
  transferReference?: string;
  stripeLast4?: string;
  trackingNumber?: string;
}

interface StoreData {
  config: MerchantConfig;
  orders: OrderRecord[];
}

const defaultData: StoreData = {
  config: {
    cardNumberRef: 'Tarjeta en Stripe o link de pago por WhatsApp',
    whatsappNumber: '524792293687',
    instagramUrl: 'https://www.instagram.com/tragoocheck/',
    customDomain: 'tragoocheck.shop',
    videoUrl: '/videos/intro-premium.mp4',
    shippingFee: 99,
    freeShippingThreshold: 899,
  },
  orders: [],
};

class StoreDataCorruptError extends Error {
  constructor() {
    super('El archivo de pedidos está dañado. Se bloqueó la escritura para evitar sobrescribirlo.');
    this.name = 'StoreDataCorruptError';
  }
}

function loadStoreData(): StoreData {
  if (!fs.existsSync(DATA_FILE)) {
    return { config: { ...defaultData.config }, orders: [] };
  }
  try {
    const parsed = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    if (!parsed || typeof parsed !== 'object' || !parsed.config || !Array.isArray(parsed.orders)) {
      throw new Error('Invalid store data shape');
    }
    const {
      stripeSecretKeyOverride: _discardedLegacyKey,
      bankName: _discardedBankName,
      clabe: _discardedClabe,
      accountHolder: _discardedAccountHolder,
      speiDiscountPercent: _discardedSpeiDiscount,
      stripePaymentLinks: _discardedPaymentLinks,
      ...storedConfig
    } = parsed.config;
    const mergedConfig: MerchantConfig = {
      ...defaultData.config,
      ...storedConfig,
      freeShippingThreshold:
        Number(storedConfig.freeShippingThreshold) >= 899
          ? Number(storedConfig.freeShippingThreshold)
          : 899,
    };
    return { config: mergedConfig, orders: parsed.orders };
  } catch {
    console.error('Could not load store-data.json; refusing to replace it.');
    throw new StoreDataCorruptError();
  }
}

function saveStoreData(data: StoreData) {
  const safeConfig = { ...data.config } as MerchantConfig;
  const temporaryFile = `${DATA_FILE}.${process.pid}.${randomUUID()}.tmp`;
  fs.writeFileSync(temporaryFile, JSON.stringify({ config: safeConfig, orders: data.orders }, null, 2), {
    encoding: 'utf-8',
    flag: 'wx',
  });
  fs.renameSync(temporaryFile, DATA_FILE);
}

let storeMutationQueue: Promise<void> = Promise.resolve();

function withStoreMutation<T>(mutation: () => T | Promise<T>): Promise<T> {
  const result = storeMutationQueue.then(mutation, mutation);
  storeMutationQueue = result.then(() => undefined, () => undefined);
  return result;
}

async function startServer() {
  const app = express();
  const PORT = 3000;
  const publicDir = path.resolve(process.cwd(), 'public');
  const apiRequests = new Map<string, { count: number; resetAt: number }>();

  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    res.setHeader('X-DNS-Prefetch-Control', 'off');
    res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
    res.setHeader('X-Download-Options', 'noopen');
    if (req.path.startsWith('/api/')) res.setHeader('Cache-Control', 'no-store, max-age=0');
    next();
  });

  app.use('/api', (req, res, next) => {
    const now = Date.now();
    const key = req.ip || req.socket.remoteAddress || 'unknown';
    const current = apiRequests.get(key);
    if (!current || now >= current.resetAt) {
      apiRequests.set(key, { count: 1, resetAt: now + 60_000 });
    } else if (++current.count > 120) {
      res.setHeader('Retry-After', '60');
      res.status(429).json({ error: 'Demasiadas solicitudes. Intenta de nuevo en un minuto.' });
      return;
    }
    if (apiRequests.size > 5000) {
      for (const [address, value] of apiRequests) {
        if (now >= value.resetAt) apiRequests.delete(address);
      }
    }
    next();
  });

  const requireAdmin: express.RequestHandler = (req, res, next) => {
    const expected = process.env.ADMIN_TOKEN || '';
    const supplied = req.get('authorization')?.replace(/^Bearer\s+/i, '') || '';
    const expectedBytes = Buffer.from(expected);
    const suppliedBytes = Buffer.from(supplied);
    if (Buffer.byteLength(expected) < 32) {
      res.setHeader('Cache-Control', 'no-store');
      res.status(503).json({ error: 'Configura ADMIN_TOKEN con al menos 32 caracteres aleatorios.' });
      return;
    }
    if (
      !/^Bearer\s+/i.test(req.get('authorization') || '') ||
      expectedBytes.length !== suppliedBytes.length ||
      !timingSafeEqual(expectedBytes, suppliedBytes)
    ) {
      res.setHeader('Cache-Control', 'no-store');
      res.status(401).json({ error: 'Token de administrador incorrecto.' });
      return;
    }
    next();
  };

  const saveUploadedVideo: express.RequestHandler = async (req, res, next) => {
    try {
      await withStoreMutation(() => {
        const { base64Video } = req.body || {};
        if (typeof base64Video !== 'string') {
          res.status(400).json({ error: 'No se recibió archivo de video.' });
          return;
        }
        const matches = base64Video.match(/^data:video\/mp4;base64,([A-Za-z0-9+/=]+)$/i);
        if (!matches) {
          res.status(400).json({ error: 'Solo se permiten videos MP4.' });
          return;
        }
        const buffer = Buffer.from(matches[1], 'base64');
        if (buffer.length < 12 || buffer.length > 25 * 1024 * 1024 || buffer.toString('ascii', 4, 8) !== 'ftyp') {
          res.status(400).json({ error: 'El video MP4 no es válido o supera 25 MB.' });
          return;
        }
        const videoFileName = `tragoo-reel-${randomUUID()}.mp4`;
        const filePath = path.resolve(publicDir, videoFileName);
        if (!filePath.startsWith(`${publicDir}${path.sep}`)) {
          res.status(400).json({ error: 'Ruta de archivo no válida.' });
          return;
        }
        fs.writeFileSync(filePath, buffer, { flag: 'wx' });
        const data = loadStoreData();
        data.config.videoUrl = `/${videoFileName}`;
        saveStoreData(data);
        res.setHeader('Cache-Control', 'no-store');
        res.json({ ok: true, videoUrl: data.config.videoUrl });
      });
    } catch (error) {
      next(error);
    }
  };

  // The admin-only video endpoint gets its own bounded parser before the small general API parser.
  app.post('/api/upload-video', requireAdmin, express.json({ limit: '34mb' }), saveUploadedVideo);

  app.use(express.json({
    limit: '1mb',
    verify: (rawRequest, _res, buffer) => {
      const req = rawRequest as express.Request & { rawBody?: Buffer };
      if (req.originalUrl.startsWith('/api/stripe/webhook')) {
        req.rawBody = Buffer.from(buffer);
      }
    },
  }));
  app.use(
    express.static(publicDir, {
      acceptRanges: true,
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.mp4')) {
          res.setHeader('Content-Type', 'video/mp4');
          res.setHeader('Accept-Ranges', 'bytes');
        }
      },
    })
  );

  function safeVideoFilePath(videoUrl: unknown): string | null {
    if (typeof videoUrl !== 'string') return null;
    const relativeName = videoUrl.replace(/^\//, '');
    if (!/^[A-Za-z0-9][A-Za-z0-9._-]*\.mp4$/i.test(relativeName)) return null;
    const baseName = path.basename(relativeName);
    if (baseName !== relativeName) return null;
    const resolved = path.resolve(publicDir, baseName);
    return resolved.startsWith(`${publicDir}${path.sep}`) ? resolved : null;
  }

  app.get('/api/video', (req, res, next) => {
    try {
      const data = loadStoreData();
      const configuredPath = safeVideoFilePath(data.config.videoUrl);
      const fallbackPath = path.resolve(publicDir, 'videos', 'intro-premium.mp4');
      const videoPath = configuredPath && fs.existsSync(configuredPath) && fs.statSync(configuredPath).isFile()
        ? configuredPath
        : fallbackPath;
      if (!fs.existsSync(videoPath) || !fs.statSync(videoPath).isFile()) {
        res.status(404).end();
        return;
      }

      const fileSize = fs.statSync(videoPath).size;
      const range = req.headers.range;
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Content-Type', 'video/mp4');
      res.setHeader('X-Content-Type-Options', 'nosniff');

      if (!range) {
        res.setHeader('Content-Length', fileSize);
        fs.createReadStream(videoPath).on('error', next).pipe(res);
        return;
      }

      const match = /^bytes=(\d*)-(\d*)$/.exec(range);
      if (!match || (!match[1] && !match[2])) {
        res.setHeader('Content-Range', `bytes */${fileSize}`);
        res.status(416).end();
        return;
      }

      let start: number;
      let end: number;
      if (!match[1]) {
        const suffixLength = Number(match[2]);
        if (!Number.isSafeInteger(suffixLength) || suffixLength <= 0) {
          res.setHeader('Content-Range', `bytes */${fileSize}`);
          res.status(416).end();
          return;
        }
        start = Math.max(0, fileSize - suffixLength);
        end = fileSize - 1;
      } else {
        start = Number(match[1]);
        end = match[2] ? Number(match[2]) : fileSize - 1;
      }
      if (
        !Number.isSafeInteger(start) || !Number.isSafeInteger(end) ||
        start < 0 || start >= fileSize || end < start
      ) {
        res.setHeader('Content-Range', `bytes */${fileSize}`);
        res.status(416).end();
        return;
      }
      end = Math.min(end, fileSize - 1);
      res.status(206);
      res.setHeader('Content-Range', `bytes ${start}-${end}/${fileSize}`);
      res.setHeader('Content-Length', end - start + 1);
      fs.createReadStream(videoPath, { start, end }).on('error', next).pipe(res);
    } catch (error) {
      next(error);
    }
  });

  function stripeStatus() {
    const activeStripeKey = getStripeSecretKey();
    const keyMode = getStripeKeyMode(activeStripeKey);
    return {
      hasLiveStripeKey: keyMode === 'live',
      hasStripeCheckout: isStripeConfiguredForEnvironment(activeStripeKey),
      stripeMode: isStripeConfiguredForEnvironment(activeStripeKey) ? keyMode : 'off',
      hasStripeWebhook: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
    };
  }

  // Public storefront configuration never includes banking or order data.
  app.get('/api/config', (_req, res) => {
    const data = loadStoreData();
    res.setHeader('Cache-Control', 'no-store');
    res.json({
      whatsappNumber: data.config.whatsappNumber,
      instagramUrl: data.config.instagramUrl,
      customDomain: data.config.customDomain,
      videoUrl: safeVideoFilePath(data.config.videoUrl) ? data.config.videoUrl : '/videos/intro-premium.mp4',
      shippingFee: 99,
      freeShippingThreshold: 899,
      cardNumberRef: 'Tarjeta en Stripe o link de pago por WhatsApp',
      ...stripeStatus(),
    });
  });

  app.get('/api/admin/config', requireAdmin, (_req, res) => {
    const data = loadStoreData();
    res.setHeader('Cache-Control', 'no-store');
    res.json({ ...data.config, ...stripeStatus() });
  });

  // Merchant configuration writes require the private admin token.
  app.post('/api/config', requireAdmin, async (req, res, next) => {
    try {
      await withStoreMutation(() => {
        const data = loadStoreData();
        const incoming = req.body || {};
        const nextVideoUrl = incoming.videoUrl ?? data.config.videoUrl;
        const videoPath = safeVideoFilePath(nextVideoUrl);
        if (!videoPath || !fs.existsSync(videoPath) || !fs.statSync(videoPath).isFile()) {
          res.status(400).json({ error: 'El video debe ser un archivo MP4 dentro de public/.' });
          return;
        }
        data.config = {
          ...data.config,
          cardNumberRef: 'Tarjeta en Stripe o link de pago por WhatsApp',
          whatsappNumber: String(incoming.whatsappNumber ?? data.config.whatsappNumber).replace(/\D/g, '').slice(0, 15),
          instagramUrl: String(incoming.instagramUrl ?? data.config.instagramUrl).slice(0, 300),
          customDomain: String(incoming.customDomain ?? data.config.customDomain).slice(0, 160),
          videoUrl: String(nextVideoUrl),
          shippingFee: 99,
          freeShippingThreshold: 899,
        };
        saveStoreData(data);
        res.setHeader('Cache-Control', 'no-store');
        res.json({ ...data.config, ...stripeStatus() });
      });
    } catch (error) {
      next(error);
    }
  });

  // List customer records only inside the authenticated merchant panel.
  app.get('/api/orders', requireAdmin, (_req, res) => {
    const data = loadStoreData();
    res.setHeader('Cache-Control', 'no-store');
    res.json(data.orders);
  });

  // Manual orders use the server catalog and always start as unpaid.
  app.post('/api/orders', requireAdmin, async (req, res, next) => {
    try {
      await withStoreMutation(() => {
        const data = loadStoreData();
        const body = req.body;
        const quote = quoteCheckout({ items: body?.items, couponCode: body?.couponCode });
        const folio = `TC-${randomUUID().replace(/-/g, '').toUpperCase()}`;
        const customerName = String(body?.customerName || '').trim().slice(0, 120);
        const customerPhone = String(body?.customerPhone || '').trim().slice(0, 30);
        if (!customerName) {
          res.status(400).json({ error: 'El nombre del cliente es obligatorio.' });
          return;
        }

        const newOrder: OrderRecord = {
          folio,
          createdAt: new Date().toISOString(),
          customerName,
          customerPhone,
          customerEmail: String(body?.customerEmail || '').trim().slice(0, 254),
          shippingAddress: String(body?.shippingAddress || '').trim().slice(0, 200),
          city: String(body?.city || '').trim().slice(0, 80),
          state: String(body?.state || '').trim().slice(0, 80),
          postalCode: String(body?.postalCode || '').trim().slice(0, 12),
          notes: String(body?.notes || '').trim().slice(0, 500),
          items: quote.lines.map((line) => ({ ...line })),
          subtotal: quote.subtotal,
          discount: quote.couponDiscount,
          couponCode: quote.couponCode || undefined,
          couponDiscount: quote.couponDiscount,
          shipping: quote.shipping,
          total: quote.total,
          paymentMethod: 'link_pago',
          paymentStatus: 'pendiente_comprobante',
          transferReference: '',
          stripeLast4: '',
          trackingNumber: '',
        };

        data.orders.unshift(newOrder);
        saveStoreData(data);
        res.status(201).json(newOrder);
      });
    } catch (error) {
      next(error);
    }
  });

  // Update Order Status / Tracking Number
  app.patch('/api/orders/:folio', requireAdmin, async (req, res, next) => {
    try {
      await withStoreMutation(() => {
        const { folio } = req.params;
        const { paymentStatus, transferReference, trackingNumber } = req.body;
        const data = loadStoreData();
        const orderIndex = data.orders.findIndex((o) => o.folio === folio);
        if (orderIndex === -1) {
          res.status(404).json({ error: 'Pedido no encontrado' });
          return;
        }
        if (paymentStatus !== undefined) {
          if (!['pendiente_comprobante', 'pagado', 'enviado'].includes(paymentStatus)) {
            res.status(400).json({ error: 'Estado de pago no válido.' });
            return;
          }
          data.orders[orderIndex].paymentStatus = paymentStatus;
        }
        if (transferReference !== undefined) {
          data.orders[orderIndex].transferReference = String(transferReference).slice(0, 120);
        }
        if (trackingNumber !== undefined) {
          data.orders[orderIndex].trackingNumber = String(trackingNumber).slice(0, 120);
        }
        saveStoreData(data);
        res.setHeader('Cache-Control', 'no-store');
        res.json(data.orders[orderIndex]);
      });
    } catch (error) {
      next(error);
    }
  });

  // Delete Order
  app.delete('/api/orders/:folio', requireAdmin, async (req, res, next) => {
    try {
      await withStoreMutation(() => {
        const data = loadStoreData();
        const initialCount = data.orders.length;
        data.orders = data.orders.filter((o) => o.folio !== req.params.folio);
        if (data.orders.length === initialCount) {
          res.status(404).json({ error: 'Pedido no encontrado' });
          return;
        }
        saveStoreData(data);
        res.json({ ok: true });
      });
    } catch (error) {
      next(error);
    }
  });

  // Create Stripe Checkout Session
  app.post('/api/checkout/stripe', async (req, res) => {
    try {
      const origin = process.env.NODE_ENV === 'production'
        ? 'https://www.tragoocheck.shop'
        : 'http://localhost:3000';
      const webRequest = new Request(`${origin}/api/checkout/stripe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': req.ip || req.socket.remoteAddress || 'unknown',
        },
        body: JSON.stringify(req.body),
      });
      const response = await stripeCheckoutPost(webRequest);
      res.status(response.status).json(await response.json());
    } catch (error: any) {
      console.error('Stripe checkout error:', error);
      res.status(500).json({ error: error?.message || 'Error al iniciar el pago' });
    }
  });

  app.get('/api/checkout/confirm', async (req, res) => {
    try {
      const origin = process.env.NODE_ENV === 'production'
        ? 'https://www.tragoocheck.shop'
        : 'http://localhost:3000';
      const sessionId = encodeURIComponent(String(req.query.session_id || ''));
      const webRequest = new Request(
        `${origin}/api/checkout/confirm?session_id=${sessionId}`
      );
      const response = await stripeCheckoutConfirmGet(webRequest);
      res.status(response.status).json(await response.json());
    } catch (error: any) {
      res.status(500).json({ error: error?.message || 'Error al comprobar el pago' });
    }
  });

  app.post('/api/stripe/webhook', async (req, res) => {
    try {
      const rawBody = (req as express.Request & { rawBody?: Buffer }).rawBody;
      if (!rawBody) {
        res.status(400).json({ error: 'Falta el cuerpo original del webhook.' });
        return;
      }
      const origin = req.headers.origin || `${req.protocol}://${req.get('host')}`;
      const webRequest = new Request(`${origin}/api/stripe/webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': req.get('content-type') || 'application/json',
          'stripe-signature': req.get('stripe-signature') || '',
        },
        body: rawBody.toString('utf8'),
      });
      const response = await stripeWebhookPost(webRequest);
      res.status(response.status).json(await response.json());
    } catch (error: any) {
      console.error('Stripe webhook error:', error?.name || 'UnknownError');
      res.status(500).json({ error: 'Error al procesar el webhook de Stripe.' });
    }
  });

  app.use((error: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    if (res.headersSent) return;
    if (error instanceof StoreDataCorruptError) {
      res.status(503).json({ error: error.message });
      return;
    }
    if (error?.type === 'entity.too.large') {
      res.status(413).json({ error: 'La solicitud supera el tamaño permitido.' });
      return;
    }
    console.error('Request failed:', error instanceof Error ? error.name : 'UnknownError');
    res.status(500).json({ error: 'No se pudo completar la solicitud.' });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Tragoo Check Storefront running on http://localhost:${PORT}`);
  });
}

startServer();
