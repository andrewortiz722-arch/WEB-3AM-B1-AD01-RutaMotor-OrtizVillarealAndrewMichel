// Funciones de la vista del cliente y registro del vehículo.
document.addEventListener('DOMContentLoaded', () => {
  const { claves, leerLista, guardarLista, sesion, escapar, alerta } = RutaMotor;
  const vista = document.getElementById('vista-usuario');
  if (!vista) return;
  const cuenta = sesion();
  if (!cuenta || cuenta.rol !== 'usuario') { location.href = 'login.html'; return; }

  const formulario = document.getElementById('form-solicitud');
  const botonMostrar = document.getElementById('mostrar-formulario');
  const contenedor = document.getElementById('contenedor-formulario');
  botonMostrar?.addEventListener('click', () => {
    contenedor.hidden = false;
    botonMostrar.hidden = true;
    formulario.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  formulario?.addEventListener('submit', async evento => {
    evento.preventDefault();
    const datos = new FormData(formulario);
    const telefono = datos.get('telefono').trim();
    const placa = datos.get('placa').trim().toUpperCase();
    const anio = Number(datos.get('anio'));
    const odometro = datos.get('odometro') === '' ? null : Number(datos.get('odometro'));
    const servicios = datos.getAll('servicios');

    // Validación del teléfono móvil ecuatoriano (09 seguido de ocho dígitos).
    if (!/^09\d{8}$/.test(telefono)) {
      await alerta({ icon: 'warning', title: 'Revisa el teléfono', text: 'Escribe un celular ecuatoriano de 10 dígitos que empiece por 09.' });
      formulario.elements.telefono.focus(); return;
    }
    // Solo se reciben placas de Pichincha: empiezan con P y usan formato ABC-123 o ABC-1234.
    if (!/^P[A-Z]{2}-\d{3,4}$/.test(placa)) {
      await alerta({ icon: 'warning', title: 'Placa no válida', text: 'Solo recibimos vehículos matriculados en Quito, Pichincha. Usa el formato PXX-123 o PXX-1234.' });
      formulario.elements.placa.focus(); return;
    }
    // El año debe estar entre 1950 y el siguiente año calendario.
    if (anio < 1950 || anio > new Date().getFullYear() + 1) {
      await alerta({ icon: 'warning', title: 'Año fuera de rango', text: 'Ingresa un año válido entre 1950 y el próximo año.' });
      formulario.elements.anio.focus(); return;
    }
    // El kilometraje es opcional, pero si se informa debe ser un número no negativo.
    if (odometro !== null && (!Number.isFinite(odometro) || odometro < 0)) {
      await alerta({ icon: 'warning', title: 'Kilometraje no válido', text: 'El kilometraje debe ser cero o un número positivo.' });
      formulario.elements.odometro.focus(); return;
    }
    // El cliente debe seleccionar al menos un servicio para crear el ingreso.
    if (servicios.length === 0) {
      await alerta({ icon: 'warning', title: 'Selecciona un servicio', text: 'Marca al menos un trabajo solicitado.' });
      formulario.querySelector('[name="servicios"]')?.focus(); return;
    }

    const ahora = new Date();
    const informe = {
      id: crypto.randomUUID(), clienteId: cuenta.id,
      nombre: datos.get('nombre').trim(), telefono, correo: datos.get('correo').trim(),
      marca: datos.get('marca'), modelo: datos.get('modelo').trim(), anio, placa,
      combustible: datos.get('combustible'), transmision: datos.get('transmision'),
      odometro, color: datos.get('color').trim(), servicios,
      movilizacion: datos.get('movilizacion'), fallas: datos.get('descripcion').trim(),
      observaciones: datos.get('observaciones').trim(), diagnostico: '', recomendaciones: '',
      estado: 'Pendiente', fecha: ahora.toLocaleDateString('es-EC'),
      hora: ahora.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })
    };
    const informes = leerLista(claves.informes, []);
    informes.unshift(informe);
    guardarLista(claves.informes, informes);

    const clientes = leerLista(claves.clientes, []);
    let cliente = clientes.find(item => item.id === cuenta.id);
    if (!cliente) {
      cliente = { id: cuenta.id, nombre: informe.nombre, telefono, correo: informe.correo, estado: 'Activo', solicitudBaja: false };
      clientes.push(cliente);
    }
    cliente.telefono = telefono; cliente.correo = informe.correo;
    guardarLista(claves.clientes, clientes);
    formulario.reset(); contenedor.hidden = true; botonMostrar.hidden = false;
    mostrarInformes();
    await alerta({ icon: 'success', title: 'Ingreso registrado', text: `Número de informe: ${informe.id.slice(0, 8).toUpperCase()}` });
    document.getElementById('mis-informes').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  function mostrarInformes() {
    const lista = document.getElementById('lista-solicitudes');
    if (!lista) return;
    const informes = leerLista(claves.informes, []).filter(item => item.clienteId === cuenta.id);
    lista.innerHTML = informes.length ? informes.map(informe => `<article class="tarjeta-informe"><div class="tarjeta-informe__cabecera"><h3>${escapar(informe.marca)} ${escapar(informe.modelo)} · ${escapar(informe.placa)}</h3><span class="etiqueta-estado">${escapar(informe.estado)}</span></div><p><strong>Ingreso:</strong> ${escapar(informe.fecha)} · ${escapar(informe.hora)}</p><p><strong>Fallas:</strong> ${escapar(informe.fallas)}</p><p><strong>Servicios:</strong> ${escapar(informe.servicios.join(', '))}</p>${informe.diagnostico ? `<p><strong>Diagnóstico:</strong> ${escapar(informe.diagnostico)}</p>` : ''}</article>`).join('') : '<p>Aún no hay informes de ingreso.</p>';
  }
  mostrarInformes();

  document.getElementById('solicitar-baja')?.addEventListener('click', async () => {
    const clientes = leerLista(claves.clientes, []);
    let cliente = clientes.find(item => item.id === cuenta.id);
    if (!cliente) { cliente = { id: cuenta.id, nombre: 'Cliente de Ruta Motor', telefono: '', correo: '', estado: 'Activo', solicitudBaja: false }; clientes.push(cliente); }
    cliente.solicitudBaja = true; guardarLista(claves.clientes, clientes);
    await alerta({ icon: 'success', title: 'Solicitud enviada', text: 'El taller recibió tu solicitud.' });
  });
  const estado = leerLista(claves.clientes, []).find(item => item.id === cuenta.id)?.estado || 'Activo';
  const etiquetaEstado = document.getElementById('estado-cliente');
  if (etiquetaEstado) etiquetaEstado.textContent = estado;
});
