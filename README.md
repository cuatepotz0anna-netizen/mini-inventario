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

## Requisitos funcionales

Las cinco historias de usuario y sus criterios de aceptación están en [docs/requisitos.md](docs/requisitos.md).
