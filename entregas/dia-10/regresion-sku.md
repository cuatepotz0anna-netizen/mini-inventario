# Día 10 · Regresión de SKU duplicado

[Issue #20](https://github.com/cuatepotz0anna-netizen/mini-inventario/issues/20)

La prueba se ejecutó en `dia-10-incidente`, creada desde `main` en `7d14c9e`, el mismo commit que devolvió GitHub para `refs/heads/main`.

```powershell
npm.cmd run test:e2e -- --grep 'bloquea un SKU duplicado normalizado antes de escribir en Supabase' --workers=1 --reporter=line
```

Playwright cargó un producto simulado con el SKU `SKU-DIA-10` y envió el formulario para la misma cuenta con `  sku-dia-10  `. La prueba interceptó el `POST` y devolvió HTTP 409 con el código `23505`. La comprobación del mensaje «Ya existe un producto con ese SKU.» pasó. La comprobación de escrituras falló.

```text
Running 1 test using 1 worker
Error: La web debe rechazar el duplicado antes de enviar la escritura
Expected: []
Received: ["POST"]
```

`validarProducto` recorta los espacios exteriores del SKU. Después, `guardarProducto` llama a `insert` sin compararlo con el SKU existente. El mensaje aparece cuando el cliente recibe el código `23505`, después del intento de escritura. La interceptación evitó escrituras en Supabase.
