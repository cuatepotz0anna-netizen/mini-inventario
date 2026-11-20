import { crearRepositorioProductos } from './productos.js';

const form = document.querySelector('#producto-form');
const error = document.querySelector('#error');
const estado = document.querySelector('#estado');
const cancelar = document.querySelector('#cancelar');
const guardar = document.querySelector('#guardar');
const authForm = document.querySelector('#auth-form');
const authError = document.querySelector('#auth-error');
const authEstado = document.querySelector('#auth-estado');
const cerrarSesion = document.querySelector('#cerrar-sesion');
const privado = document.querySelector('#inventario-privado');
const inventario = document.querySelector('#inventario');
const bajas = document.querySelector('#bajas');
let editando = null;
let repositorio;
let userId = null;
let versionSesion = 0;
let versionListado = 0;

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
    const baja = producto.cantidad <= producto.minimo;
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
      const borrar = document.createElement('button');
      borrar.type = 'button';
      borrar.className = 'secondary';
      borrar.textContent = 'Eliminar';
      borrar.setAttribute('aria-label', `Eliminar ${producto.nombre}`);
      borrar.addEventListener('click', () => eliminar(producto, borrar));
      row.insertCell().append(boton, borrar);
    }
  }
  destino.append(table);
}

async function actualizar(sesion = versionSesion) {
  if (!userId || sesion !== versionSesion) return;
  const listado = ++versionListado;
  const productos = await repositorio.listarProductos();
  if (sesion !== versionSesion || listado !== versionListado) return;
  tabla(inventario, productos, true, 'Todavía no tienes productos. Agrega el primero con el formulario.');
  tabla(bajas, productos.filter(p => p.cantidad < p.minimo), false, 'No hay productos por debajo del mínimo.');
}

async function eliminar(producto, boton) {
  if (!userId || !window.confirm(`¿Eliminar «${producto.nombre}»?`)) return;
  const sesion = versionSesion;
  boton.disabled = true;
  error.textContent = '';
  estado.textContent = '';
  try {
    await repositorio.eliminarProducto(producto.id);
    if (sesion !== versionSesion) return;
    if (editando === producto.id) terminarEdicion();
    await actualizar(sesion);
    if (sesion === versionSesion) estado.textContent = 'Producto eliminado.';
  } catch (e) {
    if (sesion === versionSesion) error.textContent = e.message;
  } finally {
    boton.disabled = false;
  }
}

function limpiarExito() {
  estado.textContent = '';
}

form.addEventListener('input', limpiarExito);
form.addEventListener('focusin', limpiarExito);
form.addEventListener('invalid', limpiarExito, true);

form.addEventListener('submit', async event => {
  event.preventDefault();
  if (!userId || guardar.disabled) return;
  const sesion = versionSesion;
  error.textContent = '';
  estado.textContent = '';
  guardar.disabled = true;
  try {
    await repositorio.guardarProducto(Object.fromEntries(new FormData(form)), editando, userId);
    if (sesion !== versionSesion) return;
    terminarEdicion();
    await actualizar(sesion);
    if (sesion === versionSesion) estado.textContent = 'Producto guardado correctamente.';
  } catch (e) {
    if (sesion === versionSesion) error.textContent = e.message;
  } finally {
    if (sesion === versionSesion) guardar.disabled = false;
  }
});
cancelar.addEventListener('click', () => { terminarEdicion(); error.textContent = ''; estado.textContent = ''; });

function mostrarSesion(session) {
  const siguiente = session?.user.id ?? null;
  if (siguiente === userId) return;
  userId = siguiente;
  const sesion = ++versionSesion;
  privado.hidden = !userId;
  authForm.hidden = Boolean(userId);
  cerrarSesion.hidden = !userId;
  authEstado.textContent = session ? `Sesión iniciada como ${session.user.email}.` : '';
  authError.textContent = '';
  inventario.replaceChildren();
  bajas.replaceChildren();
  terminarEdicion();
  guardar.disabled = false;
  error.textContent = '';
  estado.textContent = '';
  if (userId) {
    // Evita iniciar otra operación de Supabase dentro del callback de Auth.
    setTimeout(() => actualizar(sesion).catch(e => {
      if (sesion === versionSesion) error.textContent = e.message;
    }), 0);
  }
}

async function iniciar() {
  let supabase;
  try {
    const { config } = await import('/config.js');
    supabase = globalThis.supabase.createClient(config.url, config.key);
    repositorio = crearRepositorioProductos(supabase);
  } catch {
    authError.textContent = 'No se pudo iniciar Supabase. Revisa la configuración del servidor.';
    return;
  }

  supabase.auth.onAuthStateChange((_evento, session) => mostrarSesion(session));
  const botones = [...authForm.querySelectorAll('button')];
  for (const boton of botones) boton.disabled = false;

  authForm.addEventListener('submit', async event => {
    event.preventDefault();
    const registro = event.submitter?.value === 'signup';
    const credenciales = Object.fromEntries(new FormData(authForm));
    authError.textContent = '';
    authEstado.textContent = '';
    for (const boton of botones) boton.disabled = true;
    try {
      const { data, error } = registro
        ? await supabase.auth.signUp(credenciales)
        : await supabase.auth.signInWithPassword(credenciales);
      if (error) throw error;
      authForm.reset();
      if (registro && !data.session) {
        authEstado.textContent = 'Si recibes un correo de confirmación, abre el enlace para activar tu cuenta.';
      }
    } catch (e) {
      authError.textContent = e.message;
    } finally {
      for (const boton of botones) boton.disabled = false;
    }
  });

  cerrarSesion.addEventListener('click', async () => {
    cerrarSesion.disabled = true;
    authError.textContent = '';
    try {
      const { error } = await supabase.auth.signOut({ scope: 'local' });
      if (error) throw error;
    } catch (e) {
      authError.textContent = e.message;
    } finally {
      cerrarSesion.disabled = false;
    }
  });
}

iniciar();
