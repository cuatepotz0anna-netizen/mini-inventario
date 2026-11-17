# Mini Inventario

Aplicación web de inventario con HTML, JavaScript y Express.

## Requisitos

- Node.js 22
- Python 3.12

Python no se utiliza para ejecutar esta primera versión.

## Ejecutar

```sh
npm install
npm start
```

Abre http://localhost:3000. La variable de entorno `PORT` permite cambiar el puerto. En PowerShell, si la política bloquea `npm.ps1`, utiliza `npm.cmd`.

`GET /health` devuelve `{"status":"ok"}`. Express publica únicamente el directorio `public/`; las rutas inexistentes devuelven 404.

## Primera versión local

- Permite registrar, listar y editar nombre, SKU, cantidad y mínimo.
- Rechaza campos vacíos, cantidades que no sean enteros no negativos y SKU duplicados (ignorando mayúsculas y espacios exteriores).
- Marca productos con `cantidad < minimo` y los muestra también en una lista aparte.
- Guarda en localStorage del navegador. Los datos persisten al recargar en el mismo origen; otro navegador o puerto tiene almacenamiento independiente. Borrar los datos del navegador elimina este inventario.
- No incluye cuentas, privacidad por usuario, sincronización, eliminación ni Supabase todavía. Evita usar esta versión para información sensible.

`public/productos.js` concentra todo acceso a los datos y expone `listarProductos()` y `guardarProducto(datos, id)`, ambas asíncronas. La interfaz en `public/app.js` consume estas funciones; la futura integración de Supabase debe sustituir esa capa y aplicar las restricciones y RLS descritas en el diseño.

## Comprobar

```sh
npm test
```

Las pruebas verifican validación, SKU únicos, edición, persistencia y las rutas HTTP.

## Requisitos funcionales

Las cinco historias de usuario y sus criterios de aceptación están en [docs/requisitos.md](docs/requisitos.md).
