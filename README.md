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

## Integración continua

GitHub Actions ejecuta las pruebas de Playwright en Ubuntu con Node.js 22 en cada pull request hacia `main`. Configura `SUPABASE_URL`, `SUPABASE_KEY`, `TEST_EMAIL` y `TEST_PASSWORD` como secretos de Actions en el repositorio. Usa una llave **publishable** o **anon** y una cuenta de prueba confirmada.

El reporte HTML queda disponible como artefacto `playwright-report` cuando Playwright lo genera, incluso si fallan las pruebas. Los pull requests desde forks normalmente carecen de acceso a los secretos y las pruebas que dependen de ellos fallarán.

## Requisitos funcionales

Las cinco historias de usuario y sus criterios de aceptación están en [docs/requisitos.md](docs/requisitos.md).

## Servidor MCP de inventario

Instala las dependencias en un entorno virtual de Python 3.12 con `python -m pip install fastmcp "psycopg[binary]" python-dotenv`.
Define `DATABASE_URL` en el archivo local `mcp-inventario/.env` con un rol de PostgreSQL de solo lectura que tenga acceso a los productos que quieras consultar.

El servidor se ejecuta con `python mcp-inventario/server.py` y usa el transporte stdio.
Ofrece `buscar_producto(nombre)` para buscar por nombre y `stock_bajo()` para listar existencias por debajo del mínimo. Cada consulta devuelve hasta 50 productos.
