# Diseño técnico de Mini Inventario

## Tecnologías

- **Node.js 22 con Express:** sirve la página HTML y los archivos JavaScript.
- **HTML y JavaScript sin framework:** presentan la interfaz y permiten interactuar con el inventario.
- **Supabase:** gestiona el registro, el inicio de sesión y la base de datos.

## Funcionamiento general

1. La persona abre la página servida por Express.
2. Desde el navegador, crea su cuenta o inicia sesión con correo electrónico y contraseña mediante Supabase.
3. Una vez identificada, puede consultar, registrar, editar y eliminar sus productos.
4. El navegador envía las operaciones a Supabase con la sesión de la persona.
5. Supabase comprueba los permisos y las restricciones de los datos antes de aceptar cada operación.
6. Al cerrar sesión, la interfaz deja de mostrar el inventario y solicita iniciar sesión nuevamente.

Express sirve los archivos de la interfaz. No necesita una API propia para productos, porque Supabase proporciona el acceso autenticado a los datos.

La recuperación de contraseña queda fuera de esta versión.

## Tabla productos

| Campo | Tipo | Reglas |
|---|---|---|
| `id` | UUID | Clave primaria, generada automáticamente. |
| `user_id` | UUID | Obligatorio. Referencia al usuario de Supabase propietario del producto. |
| `nombre` | Texto | Obligatorio. No puede quedar vacío ni contener únicamente espacios. |
| `sku` | Texto | Obligatorio. No puede quedar vacío ni contener únicamente espacios. Debe ser único por usuario. |
| `cantidad` | Entero | Obligatorio. Debe ser mayor o igual a cero. |
| `minimo` | Entero | Obligatorio. Debe ser mayor o igual a cero. |
| `created_at` | Fecha y hora con zona horaria | Obligatorio. Se asigna automáticamente al crear el producto. |

La unicidad del SKU se comprueba combinando `user_id` y el SKU normalizado: se ignoran mayúsculas y espacios al principio o al final. Así, `ABC-01` y ` abc-01 ` representan el mismo SKU para una persona. Usuarios diferentes pueden utilizar ese mismo SKU.

## Qué valida cada capa

### 1. Navegador / interfaz

La interfaz comprueba los datos antes de enviarlos para mostrar errores claros:

- Solicita correo y contraseña para registrarse o iniciar sesión.
- Comprueba que nombre y SKU tengan contenido.
- Comprueba que cantidad y mínimo sean enteros mayores o iguales a cero.
- Solicita confirmación antes de eliminar un producto.
- Muestra los errores que devuelve Supabase, como un SKU duplicado o credenciales incorrectas.
- Actualiza los listados después de una operación exitosa.
- Oculta el inventario cuando no hay una sesión activa.

Estas comprobaciones ayudan a la persona, pero pueden eludirse. La protección de los datos depende de Supabase.

### 2. Servidor Express

Express tiene una responsabilidad limitada:

- Atiende las rutas necesarias para servir la página y sus archivos JavaScript.
- Devuelve un error cuando se solicita una ruta inexistente.
- Expone únicamente los archivos públicos de la interfaz.

Como las operaciones de productos se envían directamente a Supabase, Express no valida su contenido ni decide quién puede acceder a ellos.

El navegador puede recibir la URL del proyecto y la clave publicable de Supabase. Las claves secretas o administrativas nunca se incluyen en los archivos públicos ni en el repositorio.

### 3. Supabase / base de datos

Supabase aplica las comprobaciones que deben cumplirse aunque se omita la interfaz:

- **Autenticación:** verifica las credenciales y la sesión mediante Supabase Auth.
- **Propiedad:** aplica seguridad por filas (RLS) para permitir que cada persona consulte, cree, edite y elimine únicamente productos cuyo `user_id` coincida con su usuario autenticado.
- **Inserción y edición:** impide asignar o cambiar un producto a otro usuario.
- **Acceso sin sesión:** impide consultar o modificar productos.
- **Campos obligatorios:** rechaza valores ausentes en los campos requeridos.
- **Textos:** rechaza nombres y SKU vacíos o formados únicamente por espacios.
- **Cantidades:** rechaza valores negativos, fraccionarios o fuera del rango del tipo entero.
- **SKU único:** impide duplicados dentro del inventario de una persona, incluso si llegan dos solicitudes simultáneas.
- **Identificadores y fechas:** genera el identificador y la fecha de creación automáticamente.

## Lista de existencias bajas

Un producto tiene existencias bajas cuando `cantidad < minimo`.

La interfaz consulta una lista aparte con los productos propios que cumplen esa condición. La lista muestra nombre, SKU, cantidad y mínimo.

Si la cantidad es igual al mínimo, el producto queda fuera. Si ningún producto cumple la condición, se muestra un mensaje que lo indica.

No se guarda una columna adicional para esta condición: se calcula a partir de la cantidad y el mínimo actuales.

## Alcance

Este diseño cubre las cinco historias de usuario aprobadas. No incluye inventarios compartidos, recuperación de contraseña ni tecnologías adicionales.
