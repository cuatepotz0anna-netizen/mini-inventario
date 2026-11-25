# Día 9 — Bitácora final

## 1. Docker local

Se crearon `Dockerfile` y `.dockerignore`. El archivo `.dockerignore` excluye `.env`, `node_modules`, `tests` y `entregas`. La app escucha en `0.0.0.0` y usa `process.env.PORT` para el puerto.

`docker build -t mini-inventario .` terminó correctamente. `docker run --env-file .env -e PORT=3000 -p 3000:3000 mini-inventario` inició la app en local.

## 2. Render

| Configuración | Valor |
| --- | --- |
| Servicio | `mini-inventario` |
| Language | Docker |
| Branch | `main` |
| Plan | Free |
| Auto-Deploy | On Commit |
| URL pública | <https://mini-inventario-u821.onrender.com> |

Se configuraron `SUPABASE_URL` y `SUPABASE_KEY` en **Environment** del servicio. Se comprobó que la URL pública funcionaba correctamente.

## 3. MCP de Render

Se agregó el MCP de Render a Codex. `codex mcp list` confirmó que `render` figuraba como `enabled` con OAuth.

## 4. Falla intencional

Se agregó temporalmente `RUN npm run no-existe` al `Dockerfile`. Render marcó el despliegue como `build_failed`. El MCP de Render identificó la línea 6 del `Dockerfile` y el error `Missing script: "no-existe"`.

## 5. Reparación

Se eliminó `RUN npm run no-existe`. El [PR #18](https://github.com/cuatepotz0anna-netizen/mini-inventario/pull/18) pasó el CI y se integró a `main`. Render desplegó correctamente y el servicio volvió al estado **Live**.

## 6. Error o mala decisión de la IA

Al principio, la IA buscó varias veces el problema de Supabase en los valores de las variables. Al consultar `/config-check`, se detectó que los nombres estaban escritos como `SUPERBASE_URL` y `SUPERBASE_KEY`. Se corrigieron a `SUPABASE_URL` y `SUPABASE_KEY`.

## 7. Comando aprobado

Se aprobó el comando de merge del PR #18 después de que `gh pr checks 18` mostró todos los checks exitosos. La aprobación se dio porque el CI estaba en verde.

## 8. Cómo se comprobó

- `docker build` terminó correctamente y `docker run` inició la app local.
- Render mostró **Deploy succeeded** y el servicio quedó **Live**.
- El MCP de Render diagnosticó la falla intencional a partir de los logs de compilación.
- Tras la reparación, Render volvió a **Live** y se comprobó que la URL pública funcionaba.
