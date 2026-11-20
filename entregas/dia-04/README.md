# Día 04 · Inventario privado con Supabase

## Prompts clave

1. «Crea una migración con la tabla productos según docs/diseno.md. Activa Row Level Security y crea políticas para que cada usuario solo pueda leer, crear, editar y borrar sus propios productos. Muéstrame el SQL completo antes de aplicarlo».
2. «Conserva el archivo de migración que preparaste. Lleva ese cambio a la rama dia-04-supabase. No crees otra rama. No hagas merge».
3. «El SQL está aprobado. Aplica la migración usando el MCP de Supabase únicamente en el proyecto con Project Ref qohzirqsepoywaglakih».
4. «Cambia public/productos.js para usar Supabase en lugar de localStorage. Agrega registro e inicio de sesión con correo y contraseña. Lee SUPABASE_URL y SUPABASE_KEY del archivo .env y entrégalas al navegador desde la ruta /config.js».
5. «Verifica que .env esté ignorado por Git. Ejecuta las pruebas. Verifica que /config.js funcione y que rechace una llave service_role o secreta».

## Error de la IA y corrección

La IA creó la rama `feat/productos-rls` antes de seguir con la práctica. Le indiqué que la rama correcta era `dia-04-supabase`. Cambió a esa rama, conservó el archivo de migración y mostró de nuevo el SQL completo. El resto de la práctica continuó en `dia-04-supabase`.

## Problema con la configuración

El cliente de Supabase no iniciaba porque la aplicación no estaba cargando correctamente las variables de `.env`. Comprobé el problema consultando `/config.js`. Lo corregí recreando `.env` con `SUPABASE_URL` y `SUPABASE_KEY`, usando una llave pública. Después comprobé que `/config.js` entregaba la configuración al navegador.

## Comando aprobado

Revisé el SQL completo antes de aprobar su aplicación. Tras la aprobación, la IA ejecutó `apply_migration` mediante el MCP de Supabase en el proyecto `qohzirqsepoywaglakih`. La migración `crear_productos` creó `public.productos`, activó RLS y agregó las cuatro políticas de propiedad.

## Cómo comprobé el resultado

| Comprobación | Resultado |
| --- | --- |
| Inventario de `usuario1` | Solo aparece `Mouse usuario 1`. |
| Inventario de `usuario2` | Solo aparece `Teclado Usuario 2`. |
| Archivo `.env` | `git check-ignore -v -- .env` confirmó que Git lo ignora. |
| Seguridad en PostgreSQL | `public.productos` tiene RLS activo y políticas `SELECT`, `INSERT`, `UPDATE` y `DELETE` para el rol `authenticated`. |
| Configuración pública | `/config.js` devolvió `200` con llaves ficticias `publishable` y `anon`, y `503` con llaves ficticias `service_role` y `sb_secret_`. |
| Pruebas automatizadas | `npm test` ejecutó 3 pruebas y todas pasaron. |

La integración mediante pull request y el merge quedan pendientes.
