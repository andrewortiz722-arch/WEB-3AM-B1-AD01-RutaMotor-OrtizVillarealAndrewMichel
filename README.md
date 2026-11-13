# Ruta Motor — gestión de taller

Sitio local para organizar la atención de clientes y vehículos.

## Recorrido

- El encabezado y la navegación aparecen únicamente en `html/index.html`.
- El cliente inicia sesión, ve una bienvenida y elige cuándo abrir la ficha de ingreso.
- Al enviar la ficha, aparece un informe en su historial y en el panel administrativo.
- El cliente puede consultar sus informes; no puede editarlos ni eliminarlos.
- El administrador elige entre informes y clientes. Puede corregir teléfono, correo, fallas, diagnóstico, recomendaciones y estado; también puede eliminar informes y actualizar el estado del servicio.
- Los nombres, vehículos y fecha/hora de ingreso quedan como referencia y no se editan desde administración.
- SweetAlert2 muestra avisos de acceso, registro y cambios, y pide confirmación antes de eliminar un informe.

## Organización del código

- `html/`: páginas de inicio, acceso y perfiles; `html/plantillas/` contiene encabezado y pie compartidos.
- `CSS/`: estilos generales y estilos específicos de cada página.
- `JS/comun.js`: almacenamiento temporal, escape de texto, plantillas y cierre de sesión.
- `JS/inicio.js`: menú y cinta automática de imágenes del inicio.
- `JS/acceso.js`: validación de credenciales y entrada a los perfiles.
- `JS/usuario.js`: formulario del cliente, validaciones y consulta de informes.
- `JS/administrador.js`: panel, edición, estados y eliminación de informes.
- Bootstrap y SweetAlert2 se cargan desde CDN.

## Validaciones del ingreso

- Los campos marcados son obligatorios; el correo debe tener formato válido.
- El teléfono debe ser un celular ecuatoriano de 10 dígitos que empiece por `09`.
- El taller recibe vehículos matriculados en Pichincha (Quito): la placa debe comenzar con `P` y escribirse como `PXX-123` o `PXX-1234`.
- El año permitido va de 1950 al siguiente año calendario. El kilometraje puede omitirse; si se informa, debe ser cero o positivo.
- Se debe seleccionar por lo menos un servicio. La fecha y hora de recepción se asignan automáticamente al enviar.
- Los estados del informe son `Pendiente`, `En revisión`, `En proceso`, `Finalizado` y `Cancelado`.

## Acceso

- Administrador: `admin` / `admin123`
- Cliente: `usuario` / `usuario123`

## Alcance de los datos

Los informes se guardan temporalmente en `sessionStorage` para que estén disponibles al cambiar entre las páginas de usuario y administración durante la misma sesión de la pestaña. Al cerrar la pestaña, los informes se eliminan. No se usa SQL ni se envían los formularios a un servidor.

## Abrir el proyecto

Inicia Live Server desde `html/index.html`. Bootstrap y SweetAlert2 se cargan desde CDN, así que se requiere conexión a internet para esos recursos.

Las seis fotografías de Pexels y sus créditos están dentro de `IMG/` y documentados al final de este README.

## Créditos fotográficos

Las fotografías de la cinta proceden de Pexels. La licencia permite su uso gratuito; la atribución no es obligatoria. Dejo constancia de los autores y las páginas originales:

- `imagen1.jpg` — Renee Razumov: [Pexels](https://www.pexels.com/photo/mechanic-working-on-car-in-auto-workshop-33814735/)
- `imagen2.jpg` — Didier VEILLON: [Pexels](https://www.pexels.com/photo/car-mechanic-working-in-a-workshop-24407415/)
- `imagen3.jpg` — Renee Razumov: [Pexels](https://www.pexels.com/photo/car-repair-and-maintenance-workshop-interior-33814734/)
- `imagen4.jpg` — Artem Podrez: [Pexels](https://www.pexels.com/photo/a-mechanic-working-on-an-engine-in-an-auto-repair-shop-8986040/)
- `imagen5.jpg` — Abasiakan: [Pexels](https://www.pexels.com/photo/mechanics-working-on-a-vehicle-12555009/)
- `imagen6.jpg` — Sergey Meshkov: [Pexels](https://www.pexels.com/photo/mechanic-fixing-a-car-8478233/)
