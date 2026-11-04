# Pagos con Stripe, tarjetas y Google Pay

El sitio usa Stripe Checkout alojado. La tarjeta se captura en Stripe y no pasa por el servidor Tragoo Check. El Checkout muestra cada producto, cupón y envío; el servidor vuelve a calcular precios y validar el total antes de crear la sesión y al confirmar el pago.

## Configuración en Vercel

1. En Stripe, completa la activación de la cuenta y primero usa una clave de prueba.
2. En Vercel abre el proyecto **tragocheck** → **Settings** → **Environment Variables**.
3. Configura `STRIPE_SECRET_KEY` como **Sensitive**:
   - **Preview:** clave de prueba `rk_test_...` (recomendada) o `sk_test_...`.
   - **Production:** clave activa `rk_live_...` (recomendada) o `sk_live_...`.
   - En una clave restringida, habilita lectura y escritura de **Checkout Sessions**. No uses claves `pk_` como secreto del servidor.
4. La aplicación solo acepta claves de prueba en Preview/desarrollo y claves activas en Production. Así una prueba no puede cobrar por accidente a una tarjeta real.
5. Después de cambiar variables, crea un nuevo deployment de Vercel.

No pegues estas claves en el código, en GitHub, en este panel ni en un mensaje. El panel de la tienda ya no pide secretos.

## Google Pay y dominios

Stripe Checkout puede mostrar Google Pay sin añadir otro formulario de tarjeta. En el Dashboard de Stripe:

1. Abre **Settings → Payment methods** y habilita **Cards** y **Google Pay**.
2. Abre **Settings → Payment method domains** y registra `tragoocheck.shop` y `www.tragoocheck.shop` en modo de prueba y modo activo.
3. Google Pay aparece solo en navegadores/dispositivos elegibles y con una tarjeta configurada en Google Wallet. Checkout deja que Stripe seleccione los métodos disponibles; el sitio no fuerza una lista que pueda ocultar las billeteras.

## Confirmación de pago

1. Crea un endpoint webhook para Preview (con clave de prueba) y otro para Production (con clave activa), ambos con URL `/api/stripe/webhook` del deployment correspondiente.
2. Selecciona estos eventos: `checkout.session.completed`, `checkout.session.async_payment_succeeded` y `checkout.session.async_payment_failed`.
3. Copia el secreto de firma `whsec_...` de cada endpoint a `STRIPE_WEBHOOK_SECRET` en el ambiente de Vercel que corresponda. Es distinto de la clave API y también debe mantenerse como **Sensitive**.
4. El webhook verifica la firma y registra el resultado en los metadatos de la sesión de Checkout. El regreso del cliente también consulta Stripe directamente y solo confirma si Stripe reporta el pago como completado y pagado.

Tras confirmar un pago, el sitio abre WhatsApp con el folio, los productos y la dirección listos para que la persona envíe el mensaje. WhatsApp no lo envía automáticamente desde la cuenta de la empresa; para eso se requiere la API de WhatsApp Business y sus credenciales.

## Prueba segura

Prueba en un deployment Preview con una clave de prueba y una tarjeta de prueba de Stripe. Comprueba el importe, el envío, los cupones, la vuelta a la tienda y el webhook. Las claves de prueba no procesan cargos reales. Antes de Production, confirma en el Dashboard que la cuenta está habilitada para cobrar y que las claves, los métodos de pago y el webhook activo corresponden al modo activo.
