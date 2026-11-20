---
name: pruebas-inventario
description: Usa esta skill cuando se pidan pruebas de Mini Inventario, ya sea para escribirlas, revisarlas o ejecutarlas con Playwright.
---

# Pruebas de Mini Inventario

- Escribe las pruebas de Playwright en `tests/` y reutiliza los fixtures existentes cuando corresponda.
- Lee las credenciales desde `process.env.TEST_EMAIL` y `process.env.TEST_PASSWORD`. Evita incluir sus valores en el código o en los registros.
- Genera un SKU único por prueba con `randomUUID()` y úsalo para identificar el producto de prueba.
- Usa un fixture o un bloque `finally` para borrar únicamente los datos creados por cada prueba, incluso si falla una comprobación. Respeta la aprobación requerida por el repositorio antes de ejecutar pruebas que borren datos.
- Selecciona elementos por rol y nombre accesible con `getByRole()` o por etiqueta con `getByLabel()`.
- Cubre el flujo correcto y un caso de error. Comprueba el resultado visible del flujo correcto y la respuesta esperada en el caso de error.
