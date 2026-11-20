export function crearRepositorioProductos(supabase) {
  const tabla = () => supabase.from('productos');

  return {
    async listarProductos() {
      const { data, error } = await tabla().select('*').order('created_at').order('id');
      if (error) throw new Error('No se pudo leer el inventario.', { cause: error });
      return data;
    },

    async guardarProducto(datos, id, userId) {
      const producto = validarProducto(datos);
      const consulta = id === null
        ? tabla().insert({ ...producto, user_id: userId })
        : tabla().update(producto).eq('id', id);
      const { data, error } = await consulta.select().maybeSingle();
      if (error?.code === '23505') throw new Error('Ya existe un producto con ese SKU.');
      if (error) throw new Error('No se pudo guardar el producto.', { cause: error });
      if (!data) throw new Error('El producto ya no está disponible.');
      return data;
    },

    async eliminarProducto(id) {
      const { data, error } = await tabla().delete().eq('id', id).select('id').maybeSingle();
      if (error) throw new Error('No se pudo eliminar el producto.', { cause: error });
      if (!data) throw new Error('El producto ya no está disponible.');
    }
  };
}

function validarProducto(datos) {
  const nombre = String(datos.nombre ?? '').trim();
  const sku = String(datos.sku ?? '').trim();
  if (!nombre || !sku) throw new Error('El nombre y el SKU son obligatorios.');

  const [cantidad, minimo] = ['cantidad', 'minimo'].map(campo => {
    const valor = datos[campo];
    const numero = Number(valor);
    if ((typeof valor !== 'number' && typeof valor !== 'string') || String(valor).trim() === '' ||
        !Number.isInteger(numero) || numero < 0 || numero > 2147483647) {
      throw new Error('La cantidad y el mínimo deben ser enteros entre 0 y 2147483647.');
    }
    return numero;
  });
  return { nombre, sku, cantidad, minimo };
}
