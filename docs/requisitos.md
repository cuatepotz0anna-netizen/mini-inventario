# Requisitos de Mini Inventario

## 1. Iniciar y cerrar sesión

**Como persona usuaria, quiero iniciar y cerrar sesión para controlar el acceso a mi inventario privado.**

Criterios de aceptación:

- Puedo crear una cuenta con correo electrónico y contraseña.
- No puedo registrar dos cuentas con el mismo correo.
- Puedo iniciar sesión con credenciales correctas.
- Si las credenciales son incorrectas, se muestra un error y se impide el acceso.
- Puedo cerrar sesión; después debo volver a identificarme para acceder al inventario.

La recuperación de contraseña queda fuera de esta versión.

## 2. Registrar productos

**Como persona usuaria, quiero registrar productos para llevar el control de mis existencias.**

Criterios de aceptación:

- Cada producto requiere nombre, SKU, cantidad y cantidad mínima.
- El nombre y el SKU no pueden quedar vacíos.
- La cantidad y la cantidad mínima deben ser números enteros mayores o iguales a cero.
- Si ya tengo un producto con el mismo SKU, el registro se rechaza con un mensaje claro.
- Dos usuarios distintos pueden usar el mismo SKU.
- Un producto registrado correctamente aparece en mi inventario.

## 3. Consultar mi inventario privado

**Como persona usuaria, quiero consultar mis productos para conocer sus existencias.**

Criterios de aceptación:

- El listado muestra nombre, SKU, cantidad y cantidad mínima de cada producto.
- Solo aparecen productos que pertenecen a mi cuenta.
- No puedo consultar ni modificar productos ajenos, incluso intentando acceder mediante su dirección o identificador.
- Si todavía no tengo productos, se muestra un mensaje que lo indica.

## 4. Editar y eliminar productos

**Como persona usuaria, quiero editar y eliminar mis productos para mantener actualizado mi inventario.**

Criterios de aceptación de **edición**:

- Puedo modificar el nombre, SKU, cantidad y cantidad mínima de mis productos.
- La edición aplica las mismas validaciones que el registro, incluida la unicidad del SKU dentro de mi inventario.
- Los cambios guardados aparecen al volver a consultar el inventario.
- Si una modificación no cumple las validaciones, se muestra un error y se conservan los datos previamente guardados.

Criterios de aceptación de **eliminación**:

- Puedo solicitar la eliminación de uno de mis productos.
- Antes de eliminarlo, se solicita confirmación.
- Si cancelo, el producto permanece sin cambios.
- Si confirmo, el producto deja de aparecer en el inventario y en la lista de existencias bajas.

## 5. Consultar productos con existencias bajas

**Como persona usuaria, quiero ver una lista aparte de productos por debajo del mínimo para identificar cuáles necesitan reposición.**

Criterios de aceptación:

- La lista incluye únicamente mis productos cuya cantidad sea menor que su cantidad mínima.
- Un producto con cantidad igual o superior al mínimo queda fuera.
- Cada fila muestra nombre, SKU, cantidad actual y cantidad mínima.
- Después de registrar o editar un producto, su presencia en esta lista refleja los valores guardados.
- Si ningún producto está por debajo del mínimo, se muestra un mensaje que lo indica.

## Correcciones realizadas

1. Se cambió la historia 1 para enfocarla en iniciar y cerrar sesión. El registro de cuenta se mantuvo como criterio de aceptación.
2. Se separaron claramente los criterios de edición y eliminación en la historia 4 para facilitar su comprobación independiente.
