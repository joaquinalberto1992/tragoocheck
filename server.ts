import express from 'express';
import fs from 'fs';
import path from 'path';
import Stripe from 'stripe';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

const DATA_FILE = path.resolve(process.cwd(), 'store-data.json');

export interface MerchantConfig {
  bankName: string;
  clabe: string;
  accountHolder: string;
  cardNumberRef: string;
  whatsappNumber: string;
  instagramUrl: string;
  customDomain: string;
  videoUrl?: string;
  shippingFee: number;
  freeShippingThreshold: number;
  speiDiscountPercent: number;
  stripeSecretKeyOverride?: string;
  stripePaymentLinks: Record<string, string>;
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
  shipping: number;
  total: number;
  paymentMethod: 'link_pago' | 'oxxo' | 'spei' | 'stripe';
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
    bankName: 'BBVA México / STP (SPEI) / OXXO',
    clabe: '012180015489203148',
    accountHolder: 'Tragoo Check México',
    cardNumberRef: 'Pago en OXXO o Link de Pago por WhatsApp',
    whatsappNumber: '524792293687',
    instagramUrl: 'https://www.instagram.com/tragoocheck/',
    customDomain: 'tragoocheck.shop',
    videoUrl: '/tragoo-oficial.mp4',
    shippingFee: 99,
    freeShippingThreshold: 899,
    speiDiscountPercent: 5,
    stripeSecretKeyOverride: '',
    stripePaymentLinks: {},
  },
  orders: [
    {
      folio: 'TC-9045',
      createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
      customerName: 'Grupo Hostelero Roma Norte (Bar)',
      customerPhone: '55 6102 9941',
      customerEmail: 'compras@gruporoma.mx',
      shippingAddress: 'Colima 268, Col. Roma Norte',
      city: 'Ciudad de México',
      state: 'CDMX',
      postalCode: '06700',
      items: [
        {
          id: 'mayoreo-exhibidor-30',
          name: 'Caja Exhibidora Bares, Antros & Farmacias (30 Kits)',
          price: 7800,
          quantity: 1,
        },
      ],
      subtotal: 7800,
      discount: 390,
      shipping: 0,
      total: 7410,
      paymentMethod: 'spei',
      paymentStatus: 'pagado',
      transferReference: 'SPEI-994120',
      trackingNumber: 'DHL-884920192',
    },
    {
      folio: 'TC-9041',
      createdAt: new Date(Date.now() - 1000 * 60 * 48).toISOString(),
      customerName: 'Valeria Montes de Oca',
      customerPhone: '55 4192 8831',
      customerEmail: 'valeria.mo@gmail.com',
      shippingAddress: 'Av. Tamaulipas 142, Int 402, Col. Condesa',
      city: 'Ciudad de México',
      state: 'CDMX',
      postalCode: '06140',
      items: [
        {
          id: 'pack-trio-amigas-3x',
          name: 'Pack Trío Amigas (3x Kits Noche Completa)',
          price: 1125,
          quantity: 1,
        },
      ],
      subtotal: 1125,
      discount: 56,
      shipping: 0,
      total: 1069,
      paymentMethod: 'spei',
      paymentStatus: 'pendiente_comprobante',
      transferReference: 'Pendiente captura WhatsApp',
    },
    {
      folio: 'TC-9038',
      createdAt: new Date(Date.now() - 1000 * 60 * 165).toISOString(),
      customerName: 'Sofía Elizondo',
      customerPhone: '81 2093 4410',
      customerEmail: 'sofi.elizondo@outlook.com',
      shippingAddress: 'Río Guadalquivir 208, Col. Del Valle',
      city: 'San Pedro Garza García',
      state: 'Nuevo León',
      postalCode: '66220',
      items: [
        {
          id: 'kit-noche-completa',
          name: 'Kit Noche Completa',
          price: 449,
          quantity: 1,
        },
      ],
      subtotal: 449,
      discount: 0,
      shipping: 99,
      total: 548,
      paymentMethod: 'stripe',
      paymentStatus: 'enviado',
      stripeLast4: '4242',
      trackingNumber: 'ESTAFETA-4029182',
    },
  ],
};

function loadStoreData(): StoreData {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      const mergedConfig: MerchantConfig = {
        ...defaultData.config,
        ...(parsed.config || {}),
        // Enforce minimum $899 MXN free shipping threshold unless explicitly changed above 899
        freeShippingThreshold:
          parsed.config?.freeShippingThreshold && parsed.config.freeShippingThreshold >= 899
            ? Number(parsed.config.freeShippingThreshold)
            : 899,
      };
      return {
        config: mergedConfig,
        orders: Array.isArray(parsed.orders) ? parsed.orders : defaultData.orders,
      };
    }
  } catch (e) {
    console.error('Error reading store-data.json:', e);
  }
  return defaultData;
}

function saveStoreData(data: StoreData) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving store-data.json:', e);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  const publicDir = path.resolve(process.cwd(), 'public');
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

  // Dedicated HTTP 206 Byte-Range Video Streaming Route
  app.get('/api/video', (req, res) => {
    const data = loadStoreData();
    const relPath = (data.config.videoUrl || '/tragoo-oficial.mp4').replace(/^\//, '');
    let videoPath = path.join(publicDir, relPath);
    if (!fs.existsSync(videoPath)) {
      videoPath = path.join(publicDir, 'tragoo-oficial.mp4');
    }
    if (!fs.existsSync(videoPath)) {
      res.status(404).end();
      return;
    }

    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = end - start + 1;
      const file = fs.createReadStream(videoPath, { start, end });
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
      });
      file.pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
        'Accept-Ranges': 'bytes',
      });
      fs.createReadStream(videoPath).pipe(res);
    }
  });

  // Upload MP4 Video directly from browser to public/tragoo-oficial.mp4
  app.post('/api/upload-video', (req, res) => {
    try {
      const { base64Video } = req.body || {};
      if (!base64Video || typeof base64Video !== 'string') {
        res.status(400).json({ error: 'No se recibió archivo de video' });
        return;
      }
      const matches = base64Video.match(/^data:video\/[a-zA-Z0-9.+-]+;base64,(.+)$/);
      const rawBase64 = matches ? matches[1] : base64Video;
      const buffer = Buffer.from(rawBase64, 'base64');
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }
      const videoFileName = `tragoo-reel-${Date.now()}.mp4`;
      const filePath = path.join(publicDir, videoFileName);
      const canonicalPath = path.join(publicDir, 'tragoo-oficial.mp4');
      fs.writeFileSync(filePath, buffer);
      fs.writeFileSync(canonicalPath, buffer);

      const data = loadStoreData();
      data.config.videoUrl = `/${videoFileName}`;
      saveStoreData(data);

      res.json({ ok: true, videoUrl: data.config.videoUrl });
    } catch (err: any) {
      console.error('Error guardando video:', err);
      res.status(500).json({ error: 'No se pudo guardar el video' });
    }
  });

  // Get Merchant Config & Stripe Status
  app.get('/api/config', (_req, res) => {
    const data = loadStoreData();
    const activeStripeKey =
      data.config.stripeSecretKeyOverride || process.env.STRIPE_SECRET_KEY || '';
    const hasLiveStripeKey = Boolean(activeStripeKey && activeStripeKey.startsWith('sk_'));
    const safeConfig = {
      ...data.config,
      stripeSecretKeyOverride: data.config.stripeSecretKeyOverride ? '••••••••' : '',
      hasLiveStripeKey,
    };
    res.json(safeConfig);
  });

  // Update Merchant Config
  app.post('/api/config', (req, res) => {
    const data = loadStoreData();
    const incoming = req.body || {};
    const newStripeKey =
      incoming.stripeSecretKeyOverride && incoming.stripeSecretKeyOverride !== '••••••••'
        ? incoming.stripeSecretKeyOverride.trim()
        : data.config.stripeSecretKeyOverride;

    data.config = {
      ...data.config,
      bankName: incoming.bankName ?? data.config.bankName,
      clabe: incoming.clabe ?? data.config.clabe,
      accountHolder: incoming.accountHolder ?? data.config.accountHolder,
      cardNumberRef: incoming.cardNumberRef ?? data.config.cardNumberRef,
      whatsappNumber: incoming.whatsappNumber ?? data.config.whatsappNumber,
      instagramUrl: incoming.instagramUrl ?? data.config.instagramUrl,
      customDomain: incoming.customDomain ?? data.config.customDomain,
      videoUrl: incoming.videoUrl ?? data.config.videoUrl,
      shippingFee: Number(incoming.shippingFee ?? data.config.shippingFee),
      freeShippingThreshold: Number(
        incoming.freeShippingThreshold ?? data.config.freeShippingThreshold
      ),
      speiDiscountPercent: Number(
        incoming.speiDiscountPercent ?? data.config.speiDiscountPercent
      ),
      stripeSecretKeyOverride: newStripeKey,
      stripePaymentLinks: {
        ...data.config.stripePaymentLinks,
        ...(incoming.stripePaymentLinks || {}),
      },
    };
    saveStoreData(data);

    const activeStripeKey =
      data.config.stripeSecretKeyOverride || process.env.STRIPE_SECRET_KEY || '';
    res.json({
      ...data.config,
      stripeSecretKeyOverride: data.config.stripeSecretKeyOverride ? '••••••••' : '',
      hasLiveStripeKey: Boolean(activeStripeKey && activeStripeKey.startsWith('sk_')),
    });
  });

  // List Orders
  app.get('/api/orders', (_req, res) => {
    const data = loadStoreData();
    res.json(data.orders);
  });

  // Create Order (SPEI, Stripe, or Manual Admin Entry)
  app.post('/api/orders', (req, res) => {
    const data = loadStoreData();
    const body = req.body;
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const folio = body.folio || `TC-${randomDigits}`;

    const newOrder: OrderRecord = {
      folio,
      createdAt: new Date().toISOString(),
      customerName: body.customerName || 'Cliente',
      customerPhone: body.customerPhone || '',
      customerEmail: body.customerEmail || '',
      shippingAddress: body.shippingAddress || '',
      city: body.city || '',
      state: body.state || '',
      postalCode: body.postalCode || '',
      notes: body.notes || '',
      items: Array.isArray(body.items) ? body.items : [],
      subtotal: Number(body.subtotal || 0),
      discount: Number(body.discount || 0),
      shipping: Number(body.shipping || 0),
      total: Number(body.total || 0),
      paymentMethod: ['link_pago', 'oxxo', 'spei', 'stripe'].includes(body.paymentMethod)
        ? body.paymentMethod
        : 'link_pago',
      paymentStatus: body.paymentStatus || 'pendiente_comprobante',
      transferReference: body.transferReference || '',
      stripeLast4: body.stripeLast4 || '',
      trackingNumber: body.trackingNumber || '',
    };

    data.orders.unshift(newOrder);
    saveStoreData(data);
    res.status(201).json(newOrder);
  });

  // Update Order Status / Tracking Number
  app.patch('/api/orders/:folio', (req, res) => {
    const { folio } = req.params;
    const { paymentStatus, transferReference, trackingNumber } = req.body;
    const data = loadStoreData();
    const orderIndex = data.orders.findIndex((o) => o.folio === folio);
    if (orderIndex === -1) {
      res.status(404).json({ error: 'Pedido no encontrado' });
      return;
    }
    if (paymentStatus) {
      data.orders[orderIndex].paymentStatus = paymentStatus;
    }
    if (transferReference !== undefined) {
      data.orders[orderIndex].transferReference = transferReference;
    }
    if (trackingNumber !== undefined) {
      data.orders[orderIndex].trackingNumber = trackingNumber;
    }
    saveStoreData(data);
    res.json(data.orders[orderIndex]);
  });

  // Delete Order
  app.delete('/api/orders/:folio', (req, res) => {
    const { folio } = req.params;
    const data = loadStoreData();
    data.orders = data.orders.filter((o) => o.folio !== folio);
    saveStoreData(data);
    res.json({ ok: true });
  });

  // Create Stripe Checkout Session
  app.post('/api/checkout/stripe', async (req, res) => {
    try {
      const data = loadStoreData();
      const body = req.body;
      const randomDigits = Math.floor(1000 + Math.random() * 9000);
      const folio = `TC-${randomDigits}`;

      const items: OrderItem[] = Array.isArray(body.items) ? body.items : [];
      const shipping = Number(body.shipping || 0);
      const activeStripeKey =
        data.config.stripeSecretKeyOverride || process.env.STRIPE_SECRET_KEY || '';

      // 1. Check if single item has a direct Stripe Payment Link configured
      if (items.length === 1 && items[0].quantity === 1) {
        const directLink = data.config.stripePaymentLinks?.[items[0].id];
        if (directLink && directLink.startsWith('https://buy.stripe.com/')) {
          const pendingOrder: OrderRecord = {
            folio,
            createdAt: new Date().toISOString(),
            customerName: body.customerName || 'Cliente Stripe',
            customerPhone: body.customerPhone || '',
            customerEmail: body.customerEmail || '',
            shippingAddress: body.shippingAddress || '',
            city: body.city || '',
            state: body.state || '',
            postalCode: body.postalCode || '',
            notes: body.notes || '',
            items,
            subtotal: Number(body.subtotal || 0),
            discount: Number(body.discount || 0),
            shipping,
            total: Number(body.total || 0),
            paymentMethod: 'stripe',
            paymentStatus: 'pagado',
          };
          data.orders.unshift(pendingOrder);
          saveStoreData(data);
          res.json({
            mode: 'payment_link',
            url: directLink,
            folio,
            order: pendingOrder,
          });
          return;
        }
      }

      // 2. If STRIPE_SECRET_KEY is configured, create a real Stripe Checkout Session
      if (activeStripeKey && activeStripeKey.startsWith('sk_')) {
        const stripe = new Stripe(activeStripeKey);
        const origin =
          req.headers.origin ||
          (data.config.customDomain
            ? `https://${data.config.customDomain}`
            : process.env.APP_URL) ||
          'http://localhost:3000';

        const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items
          .filter((item) => item.price > 0)
          .map((item) => ({
            price_data: {
              currency: 'mxn',
              product_data: {
                name: item.name,
                description:
                  'Tragoo Check México — Pruebas portátiles de detección en bebidas',
              },
              unit_amount: Math.round(item.price * 100),
            },
            quantity: item.quantity,
          }));

        if (shipping > 0) {
          lineItems.push({
            price_data: {
              currency: 'mxn',
              product_data: {
                name: 'Envío Express Discreto a todo México (Pedidos menores a $899 MXN)',
              },
              unit_amount: Math.round(shipping * 100),
            },
            quantity: 1,
          });
        }

        const session = await stripe.checkout.sessions.create({
          allowed_payment_method_types: ['card'],
          line_items: lineItems,
          mode: 'payment',
          customer_email: body.customerEmail || undefined,
          metadata: {
            folio,
            customerName: body.customerName || '',
            customerPhone: body.customerPhone || '',
          },
          success_url: `${origin}/?stripe_success=1&folio=${folio}`,
          cancel_url: `${origin}/?stripe_canceled=1`,
        });

        const newOrder: OrderRecord = {
          folio,
          createdAt: new Date().toISOString(),
          customerName: body.customerName || 'Cliente Stripe',
          customerPhone: body.customerPhone || '',
          customerEmail: body.customerEmail || '',
          shippingAddress: body.shippingAddress || '',
          city: body.city || '',
          state: body.state || '',
          postalCode: body.postalCode || '',
          notes: body.notes || '',
          items,
          subtotal: Number(body.subtotal || 0),
          discount: Number(body.discount || 0),
          shipping,
          total: Number(body.total || 0),
          paymentMethod: 'stripe',
          paymentStatus: 'pagado',
        };
        data.orders.unshift(newOrder);
        saveStoreData(data);

        res.json({
          mode: 'live_stripe_session',
          url: session.url,
          folio,
          order: newOrder,
        });
        return;
      }

      // 3. Otherwise use built-in instant Stripe card gateway modal
      res.json({
        mode: 'instant_card_gateway',
        folio,
      });
    } catch (error: any) {
      console.error('Stripe checkout error:', error);
      res.status(500).json({
        error: error?.message || 'Error al iniciar sesión de Stripe',
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false, watch: null },
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
