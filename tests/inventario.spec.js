import { randomUUID } from 'node:crypto';
import { expect, test as base } from '@playwright/test';

const test = base.extend({
  sku: async ({ page }, use) => {
    const sku = `E2E-${randomUUID()}`;
    await use(sku);

    await expect(page.locator('#guardar')).toBeEnabled();
    await page.reload();
    const inventory = page.locator('#inventario');
    await expect(inventory.locator('table, p').first()).toBeVisible();
    const row = productRow(inventory, sku);
    if (await row.count()) {
      page.once('dialog', dialog => dialog.accept());
      await row.getByRole('button', { name: /Eliminar/ }).click();
      await expect(page.locator('#estado')).toHaveText('Producto eliminado.');
      await expect(row).toHaveCount(0);
    }
  },
});

function productRow(section, sku) {
  return section.getByRole('row').filter({
    has: section.page().getByRole('cell', { name: sku, exact: true }),
  });
}

async function iniciarSesion(page, incorrecta = false) {
  const { TEST_EMAIL: email, TEST_PASSWORD: password } = process.env;
  if (!email?.trim() || !password?.trim()) {
    throw new Error('Configura TEST_EMAIL y TEST_PASSWORD en el entorno.');
  }
  await page.goto('/');
  const form = page.locator('#auth-form');
  const submit = form.locator('[value=login]');
  await expect(submit).toBeEnabled();
  await form.evaluate((element, credentials) => {
    element.elements.email.value = credentials.email;
    element.elements.password.value = credentials.password;
  }, { email, password: incorrecta ? `incorrecta-${randomUUID()}` : password });
  await submit.click();
}

async function agregarProducto(page, sku, cantidad, minimo) {
  const form = page.locator('#producto-form');
  await form.getByLabel('Nombre').fill('Producto de prueba E2E');
  await form.getByLabel('SKU').fill(sku);
  await form.locator('[name=cantidad]').fill(String(cantidad));
  await form.locator('[name=minimo]').fill(String(minimo));
  await form.getByRole('button', { name: 'Guardar producto' }).click();
  await expect(page.locator('#estado')).toHaveText('Producto guardado correctamente.');
}

test('inicia sesión correctamente', async ({ page }) => {
  await iniciarSesion(page);
  await expect(page.locator('#inventario-privado')).toBeVisible();
  await expect(page.locator('#cerrar-sesion')).toBeVisible();
});

test('rechaza una contraseña incorrecta', async ({ page }) => {
  await iniciarSesion(page, true);
  await expect(page.locator('#auth-error')).toHaveText('Invalid login credentials');
  await expect(page.locator('#inventario-privado')).toBeHidden();
});

test.describe('productos', () => {
  test.beforeEach(async ({ page }) => {
    await iniciarSesion(page);
    await expect(page.locator('#inventario-privado')).toBeVisible();
  });

  test('agrega un producto', async ({ page, sku }) => {
    await agregarProducto(page, sku, 5, 5);
    const row = productRow(page.locator('#inventario'), sku);
    await expect(row.getByRole('cell', { name: 'Producto de prueba E2E', exact: true })).toBeVisible();
    await expect(row.getByRole('cell', { name: 'En nivel' })).toBeVisible();
    await expect(productRow(page.locator('#bajas'), sku)).toHaveCount(0);
  });

  test('marca existencias bajas cuando la cantidad es menor al mínimo', async ({ page, sku }) => {
    await agregarProducto(page, sku, 1, 5);
    const row = productRow(page.locator('#inventario'), sku);
    await expect(row.getByRole('cell', { name: 'Existencias bajas' })).toBeVisible();
    await expect(productRow(page.locator('#bajas'), sku)).toBeVisible();
  });
});
