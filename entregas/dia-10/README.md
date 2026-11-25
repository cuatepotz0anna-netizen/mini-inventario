# Día 10 · Incidente de SKU duplicado

## 1. Reporte recibido

> Pude registrar dos productos con el mismo SKU.

## 2. Investigación

En producción, PostgreSQL ya impedía guardar dos productos con el mismo SKU normalizado para un usuario. La web intentaba guardar y dependía del error `23505` para mostrar «Ya existe un producto con ese SKU.».

La consulta de solo lectura en Supabase encontró 0 grupos duplicados por usuario según `lower(btrim(sku))`, 0 filas con cantidad negativa y 0 filas con mínimo negativo. El índice único sobre `(user_id, lower(btrim(sku)))` estaba activo y era válido. Las restricciones `CHECK (cantidad >= 0)` y `CHECK (minimo >= 0)` estaban validadas.

## 3. Issue

El issue incluyó el reporte, los pasos de reproducción, la causa del rechazo y los criterios de aceptación. [Issue #20](https://github.com/cuatepotz0anna-netizen/mini-inventario/issues/20)

## 4. Prueba antes de corregir

La regresión Playwright cargó un producto con el SKU `SKU-DIA-10` e intentó agregar otro para la misma cuenta con `  sku-dia-10  `. El mensaje era correcto, pero la prueba falló porque esperaba cero escrituras y el navegador emitió un `POST`. Playwright interceptó esa solicitud y simuló el error `23505`. [Evidencia de la falla](./regresion-sku.md)

## 5. Corrección

El único archivo de la aplicación que cambió fue `public/app.js`. Antes de llamar a `insert` en un alta, la web compara el SKU ingresado con los SKU de los productos ya cargados del mismo usuario. Aplica `trim().toLowerCase()` a ambos valores y, si coinciden, muestra «Ya existe un producto con ese SKU.» y detiene el envío.

El manejo de `23505` sigue activo como segunda protección, por ejemplo, si otra sesión guarda el mismo SKU mientras el inventario cargado está desactualizado. La corrección no requirió cambios en SQL ni en los datos porque PostgreSQL ya aplicaba las restricciones.

## 6. Pruebas después de corregir

- La regresión pasó **1/1** y confirmó que el mensaje aparece sin emitir un `POST`.
- La suite Playwright completa pasó **5/5** con un servicio local simulado, sin escribir en Supabase.

## 7. Producción

El PR incluyó `Closes #20`. El check de Playwright terminó con éxito y el PR se integró a `main` en el commit `2d67aac`. Render desplegó ese mismo commit y lo marcó como activo. [PR #21](https://github.com/cuatepotz0anna-netizen/mini-inventario/pull/21) · [CI](https://github.com/cuatepotz0anna-netizen/mini-inventario/actions/runs/45671568049/job/139407926210) · [Despliegue](https://dashboard.render.com/web/srv-dc31hus9v7es73f4b950/deploys/dep-dc3i7le0tbcc73dfe8dg)

En la comprobación manual reportada, la URL pública rechazó el SKU duplicado y mostró «Ya existe un producto con ese SKU.». La ausencia del `POST` se comprobó con la regresión de Playwright. [Aplicación pública](https://mini-inventario-u821.onrender.com/)

## 8. Qué aprendió el sistema

Una regla importante necesita validación en la web y en la base de datos. La web responde de inmediato cuando dispone de la información para detectar el duplicado. PostgreSQL garantiza que los datos sigan siendo válidos incluso si dos sesiones intentan guardar al mismo tiempo.

## 9. Siguiente requisito

> Agregar validación preventiva también al editar un producto, evitando cambiar su SKU por uno ya usado por el mismo usuario.

## 10. Qué delegaría a un agente

- Ejecutar pruebas.
- Revisar logs.
- Consultar datos en solo lectura.
- Preparar el pull request y la documentación.

## 11. Qué seguiría revisando yo

- Aprobar cambios de datos o SQL.
- Revisar migraciones.
- Confirmar el comportamiento final en producción.

## 12. Prompts clave

1. «Usa playwright-cli en la URL pública para verificar ambos casos. Revisa los logs recientes con el MCP de Render y consulta los datos con Supabase en solo lectura.»
2. «Crea un issue en GitHub usando gh.»
3. «Agrega una prueba de regresión» para detectar el SKU duplicado antes de enviarlo a Supabase. «Ejecuta únicamente la prueba nueva y confirma si falla con el código actual.»
4. «Propón la corrección mínima necesaria en la web para que detecte el SKU duplicado antes de llamar a insert.»
5. «Apruebo la corrección mínima propuesta.» Ejecuta primero la regresión y después toda la suite Playwright.
6. «Abre un pull request hacia main.» Incluye `Closes #20` y reporta el estado del CI.

## 13. Error o mala decisión de la IA

Al principio, la IA tomó el reporte como un duplicado que todavía podía guardarse. La prueba en producción y la consulta de Supabase mostraron que PostgreSQL ya lo bloqueaba y que no había duplicados. El incidente se acotó al comportamiento que sí se pudo reproducir: la web dependía de `23505` y enviaba el `insert` antes de detectar el duplicado.

## 14. Comando o herramienta aprobada

Se aprobó el merge del PR #21 solo después de que `gh pr checks 21` mostró todos los checks exitosos. La aprobación se dio porque Playwright había validado el cambio en CI. GitHub registra que el check terminó antes del merge.

## 15. Cómo se comprobó

- Antes de corregir, Playwright registró un `POST` y la regresión falló.
- Después de corregir, la regresión pasó **1/1** sin emitir el `POST` y la suite pasó **5/5**.
- GitHub Actions registró el CI en verde y Render desplegó el commit integrado a `main`.
- En la comprobación manual reportada, la URL pública rechazó el SKU duplicado, mostró «Ya existe un producto con ese SKU.» y el producto no se creó. [Captura de producción](./evidencias/produccion-sku-duplicado.png)
