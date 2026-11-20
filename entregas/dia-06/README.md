# Día 6 · Bitácora de la práctica

## Prompts clave

1. **Crear el workflow de GitHub Actions.** Ejecutar `npm ci`, instalar Chromium con sus dependencias y correr Playwright en Ubuntu con Node.js 22 en cada pull request hacia `main`. Leer las cuatro variables desde los secretos de GitHub Actions y subir el reporte HTML como artefacto. Abrir el PR desde `dia-06-ci`.
2. **Diagnosticar el primer fallo del PR #12.** Revisar los checks y el log fallido para explicar el error antes de modificar archivos o pruebas.
3. **Diagnosticar `SUPABASE_KEY`.** Agregar temporalmente al workflow comprobaciones de presencia y formato, junto con los códigos HTTP de `/health`, `/config.js` y `/supabase.js`. Registrar solo booleanos y códigos HTTP.
4. **Corregir `TEST_EMAIL` y `TEST_PASSWORD`.** Diagnosticar las tres pruebas que seguían fallando con `/config.js` en `200` y actualizar en GitHub los secretos de la cuenta de prueba del proyecto de Supabase.
5. **Provocar y restaurar una falla.** Cambiar `<` por `<=` en el estado de existencias bajas, publicar el cambio y esperar el fallo de CI. Después de revisar el error, restaurar `<` y confirmar que el mismo PR volviera a estar en verde.

## Limitación del diagnóstico inicial de la IA

Con el primer log, la IA identificó que el botón **Iniciar sesión** seguía deshabilitado, pero no pudo determinar de inmediato si fallaba la URL o la llave. Agregamos un diagnóstico temporal seguro al workflow. Registró la presencia y el formato de las variables mediante booleanos y consultó las rutas para obtener sus códigos HTTP, sin mostrar valores de secretos. Tras actualizar la llave, el siguiente intento confirmó que su formato era `publishable` y que `/config.js` devolvía `200`.

## Comando aprobado

Aprobé `gh run view --log-failed` porque permite revisar los pasos fallidos de una ejecución de GitHub Actions y encontrar la causa sin modificar archivos ni cambiar la configuración del proyecto.

## Causa de la falla con mis palabras

Primero, el secreto `SUPABASE_KEY` no tenía el formato `publishable` correcto. Por eso `/config.js` respondía `503` y la aplicación no podía iniciar Supabase. Después de corregir la llave, `/config.js` respondió `200`, pero `TEST_EMAIL` y `TEST_PASSWORD` no coincidían con la cuenta de prueba. Supabase devolvía `Invalid login credentials`. Al corregir ambos secretos de la cuenta, el PR pasó.

Después provoqué una regresión cambiando `<` por `<=`. Un producto con cantidad `5` y mínimo `5` apareció como **Existencias bajas** y la prueba «agrega un producto» falló porque esperaba **En nivel**. GitHub Actions detectó el error y, al restaurar `<`, el PR volvió a pasar.

## Cómo comprobé que funciona

- Las cuatro pruebas de Playwright pasan localmente en Chromium.
- GitHub Actions ejecuta el workflow de CI en el PR hacia `main` y publica el reporte de Playwright como artefacto.
- El mismo PR #12 pasó de verde a rojo con la falla provocada y volvió a verde al restaurar la comparación original. El intento rojo registró tres pruebas aprobadas y una fallida.
- Los cuatro secretos están configurados en GitHub Actions. El workflow los referencia por nombre y el código no contiene sus valores.

## Evidencias del Día 6

- [Workflow de GitHub Actions](../../.github/workflows/ci.yml) y [PR #12 de `dia-06-ci` hacia `main`](https://github.com/cuatepotz0anna-netizen/mini-inventario/pull/12).
- [Primer fallo de Playwright](https://github.com/cuatepotz0anna-netizen/mini-inventario/actions/runs/44648536860/job/135997251212).
- [Diagnóstico temporal con `/config.js` en `503`](https://github.com/cuatepotz0anna-netizen/mini-inventario/actions/runs/44651027208/job/136005644169).
- [Intento con `/config.js` en `200` y tres fallos de autenticación](https://github.com/cuatepotz0anna-netizen/mini-inventario/actions/runs/44651027208/job/136012257888).
- [Check en verde tras corregir la cuenta de prueba](https://github.com/cuatepotz0anna-netizen/mini-inventario/actions/runs/44651027208/job/136025310393).
- [Falla provocada en el commit `1c8c1b1`](https://github.com/cuatepotz0anna-netizen/mini-inventario/actions/runs/44657252349/job/136026408386).
- [Check en verde tras restaurar `<` en el commit `39ddf38`](https://github.com/cuatepotz0anna-netizen/mini-inventario/actions/runs/44657668826/job/136027816913).
- [Reporte `playwright-report` en los artefactos de la ejecución final](https://github.com/cuatepotz0anna-netizen/mini-inventario/actions/runs/44657668826#artifacts).
