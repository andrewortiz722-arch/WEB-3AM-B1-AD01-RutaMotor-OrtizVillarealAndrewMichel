// Controles administrativos: consulta, edición y eliminación de registros.
document.addEventListener('DOMContentLoaded', () => {
  const { claves, leerLista, guardarLista, sesion, escapar, alerta } = RutaMotor;
  const vista = document.getElementById('vista-administrador');
  if (!vista) return;
  const cuenta = sesion();
  if (!cuenta || cuenta.rol !== 'admin') { location.href = 'login.html'; return; }

  document.querySelectorAll('[data-panel]').forEach(boton => boton.addEventListener('click', () => mostrarPanel(boton.dataset.panel)));
  document.getElementById('volver-paneles')?.addEventListener('click', () => mostrarPanel('bienvenida'));
  mostrarPanel('bienvenida');

  function mostrarPanel(panel) {
    document.querySelectorAll('[data-vista-admin]').forEach(seccion => { seccion.hidden = seccion.dataset.vistaAdmin !== panel; });
    if (panel === 'informes') cargarInformes();
    if (panel === 'clientes') cargarClientes();
  }

  function cargarInformes() {
    const contenedor = document.getElementById('lista-admin-informes');
    const informes = leerLista(claves.informes, []);
    const estados = ['Pendiente', 'En revisión', 'En proceso', 'Finalizado', 'Cancelado'];
    contenedor.innerHTML = informes.length ? informes.map(informe => `
      <form class="tarjeta-informe formulario-informe" data-informe="${escapar(informe.id)}">
      <div class="tarjeta-informe__cabecera">
      <h3>${escapar(informe.marca)} ${escapar(informe.modelo)} · ${escapar(informe.placa)}</h3>
      <span>${escapar(informe.fecha)} · ${escapar(informe.hora)}</span></div>
      <div class="rejilla-admin">
      <label>Nombre (solo lectura)<input class="form-control" value="${escapar(informe.nombre)}" readonly></label>
      <label>Teléfono<input class="form-control" name="telefono" value="${escapar(informe.telefono)}" required pattern="09[0-9]{8}" title="Celular ecuatoriano de 10 dígitos, empieza por 09"></label>
      <label>Correo<input class="form-control" name="correo" type="email" value="${escapar(informe.correo)}"></label>
      <label>Vehículo (solo lectura)<input class="form-control" value="${escapar(`${informe.marca} ${informe.modelo} ${informe.anio} · ${informe.placa}`)}" readonly></label>
      <label>Fallas<textarea class="form-control" name="fallas" rows="3" required>${escapar(informe.fallas)}</textarea></label>
      <label>Diagnóstico<textarea class="form-control" name="diagnostico" rows="3">${escapar(informe.diagnostico)}</textarea></label>
      <label>Recomendaciones<textarea class="form-control" name="recomendaciones" rows="3">${escapar(informe.recomendaciones)}</textarea></label>
      <label>Estado<select class="form-select" name="estado">${estados.map(estado => `<option ${estado === informe.estado ? 'selected' : ''}>${estado}</option>`).join('')}</select></label></div>
      <p><strong>Servicios:</strong> ${escapar(informe.servicios.join(', '))}</p>
      <button class="btn btn-primary" type="submit">Guardar cambios</button> 
      <button class="btn btn-outline-danger" type="button" data-eliminar-informe="${escapar(informe.id)}">Eliminar informe</button>
      <p class="aviso-edicion" role="status"></p></form>`).join('') : '<p>Aún no se han recibido informes.</p>';

    contenedor.querySelectorAll('.formulario-informe').forEach(formulario => formulario.addEventListener('submit', evento => {
      evento.preventDefault();
      const lista = leerLista(claves.informes, []);
      const informe = lista.find(item => item.id === formulario.dataset.informe);
      if (!informe) return;
      const telefono = formulario.elements.telefono.value.trim();
      if (!/^09\d{8}$/.test(telefono)) { alerta({ icon: 'warning', title: 'Teléfono no válido', text: 'Usa un celular ecuatoriano de 10 dígitos que empiece por 09.' }); return; }
      for (const campo of ['telefono', 'correo', 'fallas', 'diagnostico', 'recomendaciones', 'estado']) informe[campo] = formulario.elements[campo].value.trim();
      guardarLista(claves.informes, lista);
      const clientes = leerLista(claves.clientes, []);
      const cliente = clientes.find(item => item.id === informe.clienteId);
      if (cliente) { cliente.telefono = informe.telefono; cliente.correo = informe.correo; guardarLista(claves.clientes, clientes); }
      alerta({ icon: 'success', title: 'Cambios guardados', text: 'El informe fue actualizado.' });
    }));

    contenedor.querySelectorAll('[data-eliminar-informe]').forEach(boton => boton.addEventListener('click', async () => {
      const confirmacion = await alerta(
        { icon: 'warning', 
          title: '¿Eliminar este informe?',
           text: 'Esta acción no se puede deshacer.', 
           showCancelButton: true, 
           confirmButtonText: 'Sí, eliminar', 
           cancelButtonText: 'Conservar', 
           confirmButtonColor: '#b42318' });
      if (!confirmacion.isConfirmed) return;
      guardarLista(claves.informes, leerLista(claves.informes, []).filter(informe => informe.id !== boton.dataset.eliminarInforme));
      await alerta({ icon: 'success', title: 'Informe eliminado' });
      cargarInformes();
    }));
  }

  function cargarClientes() {
    const contenedor = document.getElementById('lista-admin-clientes');
    const informes = leerLista(claves.informes, []);
    const clientes = leerLista(claves.clientes, []);
    for (const informe of informes) {
      if (!clientes.some(cliente => cliente.id === informe.clienteId)) 
        clientes.push(
      { id: informe.clienteId,
         nombre: informe.nombre,
          telefono: informe.telefono,
           correo: informe.correo,
            estado: 'Activo',
             solicitudBaja: false });
    }
    guardarLista(claves.clientes, clientes);
    contenedor.innerHTML = clientes.map(cliente => `
      <form class="tarjeta-informe formulario-cliente" data-cliente="${escapar(cliente.id)}">
      <div class="tarjeta-informe__cabecera">
      <h3>${escapar(cliente.nombre)}</h3>${cliente.solicitudBaja ? 
        '<span>Solicita suspender el servicio</span>' : ''}</div>
        <label>Nombre (solo lectura)<input class="form-control" value="${escapar(cliente.nombre)}" readonly></label>
        <div class="rejilla-admin">
          <label>Teléfono<input class="form-control" name="telefono" value="${escapar(cliente.telefono)}" required pattern="09[0-9]{8}" title="Celular ecuatoriano de 10 dígitos, empieza por 09"></label>
          <label>Correo<input class="form-control" type="email" name="correo" value="${escapar(cliente.correo)}"></label>
          <label>Estado del servicio<select class="form-select" name="estado"><option ${cliente.estado === 'Activo' ? 'selected' : ''}>Activo</option>
            <option ${cliente.estado === 'Suspendido' ? 'selected' : ''}>Suspendido</option></select></label></div>
            <button class="btn btn-primary" type="submit">Guardar cliente</button>
            <p class="aviso-edicion" role="status"></p></form>`).join('') || '<p>Aún no hay clientes.</p>';
    contenedor.querySelectorAll('.formulario-cliente').forEach(formulario => formulario.addEventListener('submit', evento => {
      evento.preventDefault();
      const lista = leerLista(claves.clientes, []);
      const cliente = lista.find(item => item.id === formulario.dataset.cliente);
      if (!cliente) return;
      const telefono = formulario.elements.telefono.value.trim();
      if (!/^09\d{8}$/.test(telefono)) 
        { alerta(
          { icon: 'warning',
             title: 'Teléfono no válido',
              text: 'Usa un celular ecuatoriano de 10 dígitos que empiece por 09.' });
         return; }
      for (const campo of ['telefono', 'correo', 'estado']) cliente[campo] = formulario.elements[campo].value.trim();
      if (cliente.estado === 'Suspendido') cliente.solicitudBaja = false;
      guardarLista(claves.clientes, lista);
      alerta({ icon: 'success', title: 'Cliente actualizado' });
    }));
  }
});
