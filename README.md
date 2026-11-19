# Mini Inventario

Proyecto web de inventario.

## Requisitos

- Node.js 22
- Python 3.12
- Un proyecto de Supabase con la migración de `productos` aplicada

## Ejecutar localmente

1. Ejecuta `npm ci`.
2. Copia `.env.example` a `.env` y completa `SUPABASE_URL` con la URL HTTPS de tu proyecto y `SUPABASE_KEY` con su llave **publishable** o **anon**. Express entrega esos valores al navegador en `/config.js`.
3. Ejecuta `npm start` y abre `http://localhost:3000`. Si Supabase solicita confirmar el correo, abre el enlace recibido antes de iniciar sesión.

El inventario usa la tabla `public.productos` con las políticas de propiedad de Supabase. Los productos de la versión con almacenamiento local requieren una importación aparte.

Ejecuta `npm test` para correr las pruebas del servidor y de las solicitudes de inventario con respuestas simuladas.

## Pruebas de extremo a extremo

Configura `TEST_EMAIL` y `TEST_PASSWORD` con una cuenta de prueba ya confirmada en Supabase. Puedes definirlas en el entorno o en el archivo local `.env`.

Si las pruebas necesitan una configuración pública de Supabase distinta de la de `.env`, define `SUPABASE_URL` y `SUPABASE_KEY` en el archivo ignorado `.env.playwright.local`. Playwright respeta primero las variables del entorno, luego ese archivo y finalmente `.env`.

Ejecuta `npx playwright install chromium --no-shell` una vez y después `npm run test:e2e`. Playwright arranca la app en el puerto 3100 y comprueba el acceso y el inventario en Chromium. Las pruebas de inventario crean productos con SKU únicos y los eliminan al finalizar.

## Requisitos funcionales

Las cinco historias de usuario y sus criterios de aceptación están en [docs/requisitos.md](docs/requisitos.md).
