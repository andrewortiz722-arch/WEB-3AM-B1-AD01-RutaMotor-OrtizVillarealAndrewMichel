// Controla el formulario de inicio de sesión.
document.addEventListener('DOMContentLoaded', () => {
  const formulario = document.getElementById('login-form');
  if (!formulario) return;

  formulario.addEventListener('submit', async evento => {
    evento.preventDefault();
    const usuario = formulario.elements.username.value.trim();
    const contrasena = formulario.elements.password.value;
    const { claves, leerLista, alerta } = RutaMotor;

    if (usuario === 'admin' && contrasena === 'admin123') {
      sessionStorage.setItem(claves.sesion, JSON.stringify({ id: 'administrador', rol: 'admin' }));
      location.href = 'perfil-admin.html';
      return;
    }
    if (usuario === 'usuario' && contrasena === 'usuario123') {
      const cliente = leerLista(claves.clientes, []).find(item => item.id === 'cliente-principal');
      if (cliente?.estado === 'Suspendido') {
        await alerta({ icon: 'warning', title: 'Servicio suspendido', text: 'Contacta al taller para recibir ayuda.' });
        return;
      }
      sessionStorage.setItem(claves.sesion, JSON.stringify({ id: 'cliente-principal', rol: 'usuario' }));
      location.href = 'perfil-usuario.html';
      return;
    }
    await alerta({ icon: 'error', title: 'No se pudo iniciar sesión', text: 'Revisa el usuario y la contraseña.' });
  });
});
