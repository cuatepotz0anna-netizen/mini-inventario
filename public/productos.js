const CLAVE = 'mini-inventario.productos.v1';

function leer() {
  let productos;
  try {
    productos = JSON.parse(localStorage.getItem(CLAVE) ?? '[]');
  } catch {
    throw new Error('No se pudo leer el inventario. Revisa el almacenamiento del navegador.');
  }
  if (!Array.isArray(productos) || productos.some(p => !p || typeof p.id !== 'string' ||
    typeof p.nombre !== 'string' || !p.nombre.trim() || typeof p.sku !== 'string' || !p.sku.trim() ||
    !Number.isSafeInteger(p.cantidad) || p.cantidad < 0 || !Number.isSafeInteger(p.minimo) || p.minimo < 0)) {
    throw new Error('El inventario guardado tiene un formato inválido. No se modificaron los datos.');
  }
  return productos;
}

const normalizar = sku => sku.trim().toLowerCase();

export async function listarProductos() {
  return leer();
}

export async function guardarProducto(datos, id = null) {
  const productos = leer();
  const nombre = String(datos.nombre ?? '').trim();
  const sku = String(datos.sku ?? '').trim();
  if (!nombre || !sku) throw new Error('El nombre y el SKU son obligatorios.');
  const cantidades = ['cantidad', 'minimo'].map(campo => {
    const valor = datos[campo];
    if ((typeof valor !== 'number' && typeof valor !== 'string') || String(valor).trim() === '' ||
      !Number.isSafeInteger(Number(valor)) || Number(valor) < 0) {
      throw new Error('La cantidad y el mínimo deben ser números enteros mayores o iguales a cero.');
    }
    return Number(valor);
  });
  if (productos.some(p => p.id !== id && normalizar(p.sku) === normalizar(sku))) {
    throw new Error('Ya existe un producto con ese SKU.');
  }
  const anterior = id === null ? null : productos.find(p => p.id === id);
  if (id !== null && !anterior) throw new Error('El producto ya no existe. Actualiza el listado.');
  const producto = { id: anterior?.id ?? crypto.randomUUID(), nombre, sku,
    cantidad: cantidades[0], minimo: cantidades[1], created_at: anterior?.created_at ?? new Date().toISOString() };
  const nuevos = anterior ? productos.map(p => p.id === id ? producto : p) : [...productos, producto];
  try {
    localStorage.setItem(CLAVE, JSON.stringify(nuevos));
  } catch {
    throw new Error('No se pudo guardar. Revisa el espacio y los permisos del navegador.');
  }
  return producto;
}
