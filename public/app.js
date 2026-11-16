import { listarProductos, guardarProducto } from './productos.js';

const form = document.querySelector('#producto-form');
const error = document.querySelector('#error');
const estado = document.querySelector('#estado');
const cancelar = document.querySelector('#cancelar');
const guardar = document.querySelector('#guardar');
let editando = null;

function terminarEdicion() {
  editando = null;
  form.reset();
  document.querySelector('#form-title').textContent = 'Agregar producto';
  cancelar.hidden = true;
  guardar.textContent = 'Guardar producto';
}

function tabla(destino, productos, editable, vacio) {
  destino.replaceChildren();
  if (!productos.length) {
    const texto = document.createElement('p');
    texto.textContent = vacio;
    destino.append(texto);
    return;
  }
  const table = document.createElement('table');
  const head = table.createTHead().insertRow();
  for (const titulo of ['Nombre', 'SKU', 'Cantidad', 'Mínimo', 'Estado', ...(editable ? ['Acciones'] : [])]) {
    const th = document.createElement('th');
    th.scope = 'col'; th.textContent = titulo; head.append(th);
  }
  const body = table.createTBody();
  for (const producto of productos) {
    const row = body.insertRow();
    const baja = producto.cantidad < producto.minimo;
    for (const valor of [producto.nombre, producto.sku, producto.cantidad, producto.minimo, baja ? 'Existencias bajas' : 'En nivel']) {
      row.insertCell().textContent = valor;
    }
    if (baja) row.classList.add('baja');
    if (editable) {
      const boton = document.createElement('button');
      boton.type = 'button'; boton.className = 'secondary'; boton.textContent = 'Editar';
      boton.setAttribute('aria-label', `Editar ${producto.nombre}`);
      boton.addEventListener('click', () => {
        editando = producto.id;
        for (const campo of ['nombre', 'sku', 'cantidad', 'minimo']) form.elements[campo].value = producto[campo];
        document.querySelector('#form-title').textContent = 'Editar producto';
        guardar.textContent = 'Guardar cambios'; cancelar.hidden = false;
        error.textContent = ''; estado.textContent = '';
        form.elements.nombre.focus();
      });
      row.insertCell().append(boton);
    }
  }
  destino.append(table);
}

async function actualizar() {
  const productos = await listarProductos();
  tabla(document.querySelector('#inventario'), productos, true, 'Todavía no tienes productos. Agrega el primero con el formulario.');
  tabla(document.querySelector('#bajas'), productos.filter(p => p.cantidad < p.minimo), false, 'No hay productos por debajo del mínimo.');
}

form.addEventListener('submit', async event => {
  event.preventDefault(); error.textContent = ''; estado.textContent = ''; guardar.disabled = true;
  try {
    await guardarProducto(Object.fromEntries(new FormData(form)), editando);
    terminarEdicion();
    await actualizar();
    estado.textContent = 'Producto guardado correctamente.';
  } catch (e) { error.textContent = e.message; }
  finally { guardar.disabled = false; }
});
cancelar.addEventListener('click', () => { terminarEdicion(); error.textContent = ''; estado.textContent = ''; });
window.addEventListener('storage', () => actualizar().catch(e => { error.textContent = e.message; }));
actualizar().catch(e => { error.textContent = e.message; });
