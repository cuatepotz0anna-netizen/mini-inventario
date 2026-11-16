# Bitácora de la práctica — Día 03

## 1. Prompts clave

- Construir la primera versión de Mini Inventario leyendo `docs/requisitos.md` y `docs/diseno.md`, con Express, localStorage y sin inicio de sesión.
- Conservar los cambios y llevarlos a `dia-03-web`, sin abrir otro PR ni hacer merge.
- Corregir únicamente el mensaje de éxito que permanecía visible al probar un formulario inválido.
- Revisar solo `public/productos.js` contra `docs/diseno.md`.

## 2. Error de la IA

La IA creó la rama `feat/primera-version-inventario`, aunque la práctica pedía trabajar en `dia-03-web`. También abrió el PR #8 antes de terminar las pruebas manuales y la revisión de contexto.

Se corrigió llevando los cambios a `dia-03-web` y dejando el PR #8 sin merge.

## 3. Problema detectado durante la prueba

El mensaje "Producto guardado correctamente." podía quedarse visible al probar un formulario inválido.

Se corrigió en `public/app.js` para que desaparezca al volver a interactuar con el formulario o cuando el envío no es válido.

## 4. Comando aprobado

`git cherry-pick 2071158`

Lo aprobé porque permitió conservar los cambios y moverlos a la rama correcta `dia-03-web`.

## 5. Pruebas realizadas

- Se agregaron 3 productos.
- Teclado quedó con existencias bajas porque 2 < 5.
- Se recargó la página y los productos siguieron guardados con localStorage.
- Se comprobó que no se puede guardar con Nombre vacío.

## 6. Revisión de contexto

- Antes de `/compact`: 95% disponible, 35.5K usados de 475K.
- Después de `/compact`: 96% disponible, 28.4K usados de 475K.
- Después de compactar, la revisión se hizo más acotada: se revisó únicamente `public/productos.js` contra `docs/diseno.md`.

## 7. Estado de la entrega

El PR #8 queda sin merge. El pull request final todavía no se abre.
