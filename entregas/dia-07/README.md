# Día 07 · Prueba de edición de productos sin y con skill

## Prompts clave

1. «Escribe una prueba de Playwright para editar un producto.»
2. Crear la skill `pruebas-inventario` para escribir, revisar y ejecutar pruebas de Mini Inventario.
3. Repetir «Escribe una prueba de Playwright para editar un producto.» con la skill activa.
4. Crear el subagente `revisor-pr` y usarlo para revisar `git diff main` en modo de solo lectura.
5. Revisar las validaciones pendientes y atender el hallazgo sobre el encabezado YAML con PyYAML.

## Código generado SIN skill

```js
test('edita un producto y conserva los cambios al recargar', async ({ page, sku }) => {
  await agregarProducto(page, sku, 8, 5);
  const row = productRow(page.locator('#inventario'), sku);
  const form = page.locator('#producto-form');
  const nombre = form.getByLabel('Nombre');
  const cantidad = form.locator('[name=cantidad]');
  const nombreEditado = 'Producto editado E2E';

  await row.getByRole('button', { name: 'Editar Producto de prueba E2E', exact: true }).click();
  await expect(nombre).toHaveValue('Producto de prueba E2E');
  await expect(cantidad).toHaveValue('8');
  await nombre.fill(nombreEditado);
  await cantidad.fill('2');
  await form.getByRole('button', { name: 'Guardar cambios' }).click();
  await expect(page.locator('#estado')).toHaveText('Producto guardado correctamente.');

  await page.reload();
  await expect(row).toHaveCount(1);
  await expect(row.getByRole('cell', { name: nombreEditado, exact: true })).toBeVisible();
  await expect(row.getByRole('cell', { name: '2', exact: true })).toBeVisible();
  await expect(row.getByRole('cell', { name: 'Existencias bajas', exact: true })).toBeVisible();
  await expect(productRow(page.locator('#bajas'), sku)).toBeVisible();
});
```

## Comparación

| Aspecto | SIN skill | CON skill |
| --- | --- | --- |
| Casos generados | Un caso de edición. | Dos casos, uno de edición correcta y uno de error. |
| Edición y persistencia | Intentó editar el nombre y la cantidad. Incluyó comprobaciones de persistencia al recargar y de aparición en **Existencias bajas**. | Incluyó comprobaciones del guardado, de la persistencia del nombre y la cantidad al recargar y de la aparición en **Existencias bajas**. |
| Validación | Cubrió el flujo correcto. | Intentó guardar un nombre compuesto solo por espacios y comprobó el mensaje de error y la persistencia del nombre original. |
| Verificación | La ejecución se detuvo durante el inicio de sesión, antes de llegar a la edición. | Playwright detectó los dos casos con `--list`. La ejecución de extremo a extremo quedó pendiente de autorización para limpiar los productos temporales. |
| Rama | Creó `test-playwright-editar-producto`. | Creó `test/editar-producto-playwright`. |

## Mejora y correcciones

La cobertura pasó de uno a dos casos. La mejora concreta fue añadir la validación del nombre en blanco. La edición, la persistencia y **Existencias bajas** ya formaban parte del primer intento.

Durante el segundo intento hubo ajustes puntuales en las comprobaciones de la interfaz. Se acotaron los mensajes de éxito y error a la región correspondiente y se quitaron las comprobaciones sobre el texto de los botones de la tabla. `--list` confirmó que Playwright podía cargar los dos casos. En ambos intentos quedó sin confirmar el flujo de edición en el navegador.

## Error de la IA y corrección

La IA abrió `test-playwright-editar-producto` en el primer intento y `test/editar-producto-playwright` en el segundo, aunque la rama de trabajo del Día 7 era `dia-07-skill`. La rama activa se detectó con `git status --short --branch`. Antes de retirar las pruebas del segundo intento, `git diff -- tests/inventario.spec.js` confirmó que las únicas modificaciones del archivo eran los dos casos generados. Se descartaron esas pruebas y se volvió a `dia-07-skill`. Una segunda comprobación confirmó que el archivo de pruebas quedó limpio.

## Herramienta aprobada

Se aprobó el uso de `revisor-pr` para inspeccionar `git diff main`, porque su función era de solo lectura y no debía modificar archivos, el índice ni el repositorio.

## Cómo comprobé que funciona

- **Skill.** Quedó en `.agents/skills/pruebas-inventario/SKILL.md`.
- **Subagente.** Quedó en `.codex/agents/revisor-pr.toml`. Se validó el TOML con `tomllib` y se comprobaron los campos `name`, `description` y `developer_instructions`.

- **Hallazgo de gravedad baja.** La validación automática del encabezado YAML de `.agents/skills/pruebas-inventario/SKILL.md` quedó pendiente porque faltaba PyYAML. El subagente revisó manualmente el encabezado y el contenido de la skill.
- **Cómo se atendió.** Se instaló PyYAML 6.0.3 en una carpeta temporal fuera del repositorio y se ejecutó el validador de skills de Codex. Las dependencias del proyecto quedaron intactas.
- **Resultado.** El validador confirmó que la skill y su encabezado YAML son válidos.
- **Estado de la revisión.** El subagente trabajó en modo de solo lectura. `git status` y las huellas de los tres archivos preparados coincidieron antes y después de su revisión.
