# Día 5 · Bitácora de la práctica

## Prompts clave

1. **Exploración con `playwright-cli`.** Abrir la app, iniciar sesión con las variables de prueba sin mostrar sus valores, agregar un producto con cantidad menor al mínimo, revisar la consola y guardar capturas a 1280 × 800 y 390 × 844.
2. **Corrección del favicon.** Corregir únicamente el 404 de `/favicon.ico`, volver a abrir la app, revisar la consola y guardar una captura de evidencia.
3. **Pruebas de Playwright.** Crear cuatro casos en Chromium para inicio de sesión válido, rechazo de una contraseña incorrecta, alta de producto y existencias bajas. Usar `webServer`, un SKU único por producto de prueba y limpieza al finalizar.
4. **Falla provocada y reversión.** Invertir temporalmente la comparación de existencias bajas, ejecutar las pruebas, guardar el fallo, restaurar la comparación y guardar el resultado correcto.

## Mala decisión de la IA y cómo se corrigió

La IA creó las ramas `fix/favicon` y `test/playwright-inventario`, aunque la práctica debía mantenerse en `dia-05-pruebas`. La revisión con `git status --short --branch` mostró que la rama activa era `test/playwright-inventario`. Se ejecutó `git switch dia-05-pruebas` conservando los cambios locales, sin fusionar ramas. Después se verificaron la rama activa y la presencia del favicon, las capturas, las pruebas, la configuración de Playwright y los archivos de npm.

## Comando aprobado

Se aprobó `npm run test:e2e` porque ejecuta las pruebas automáticas y los cambios de datos se limitan a los productos creados por las propias pruebas. Cada caso de inventario usa un SKU único y su limpieza elimina únicamente su producto. Playwright arranca y detiene la aplicación mediante `webServer`.

## Cómo se comprobó

- Se exploraron la pantalla de acceso y la sección **Existencias bajas** en 1280 × 800 y 390 × 844. El producto de exploración tenía cantidad 1 y mínimo 5.
- Tras corregir el favicon, `/favicon.ico` respondió con HTTP 200 y la consola de una sesión nueva registró cero errores y cero advertencias.
- Con el servidor gestionado por Playwright, pasaron las cuatro pruebas en Chromium.
- Al cambiar el filtro de `<` a `>`, falló únicamente la prueba «marca existencias bajas cuando la cantidad es menor al mínimo». El filtro excluyó el producto con cantidad 1 y mínimo 5 de la sección **Existencias bajas**.
- Se restauró la comparación original y se verificó que `public/app.js` coincidía con el archivo previo a la demostración. Las cuatro pruebas volvieron a pasar en 12,5 segundos.

## Evidencias

- [Pantalla de acceso a 1280 × 800](mini-inventario-1280x800.png)
- [Pantalla de acceso a 390 × 844](mini-inventario-390x844.png)
- [Existencias bajas a 1280 × 800](inventario-existencias-bajas-1280x800.png)
- [Existencias bajas a 390 × 844](inventario-existencias-bajas-390x844.png)
- [Captura tras verificar el favicon](favicon-verificado.png)
- [Resultado de la falla provocada](e2e-falla-provocada.txt)
- [Resultado tras restaurar la comparación](e2e-resultado-correcto.txt)
