# Activar pagos con Stripe

El checkout alojado por Stripe ya está conectado al carrito. El botón de pago aparece cuando Vercel detecta `STRIPE_SECRET_KEY`.

1. En Stripe, completa la activación de la cuenta y usa una clave de prueba primero.
2. En Vercel abre el proyecto **tragocheck** → **Settings** → **Environment Variables**.
3. Agrega `STRIPE_SECRET_KEY` como variable **Sensitive**, primero en **Preview** con la clave de prueba. Nunca la pongas en `VITE_*`, en GitHub ni en un mensaje.
4. Prueba una compra desde un deployment Preview. Stripe muestra la tarjeta, importe, envío y cupón antes del cobro.
5. Cuando la cuenta de Stripe esté habilitada para cobrar, cambia la variable de **Production** a la clave live y vuelve a desplegar.

El servidor recalcula precios, envío y cupones antes de crear el Checkout Session; verifica la sesión al regreso y luego abre WhatsApp con el folio y el pedido. El navegador de WhatsApp muestra el mensaje listo y la persona debe tocar **Enviar**. No se envían mensajes automáticamente desde una cuenta de WhatsApp.
