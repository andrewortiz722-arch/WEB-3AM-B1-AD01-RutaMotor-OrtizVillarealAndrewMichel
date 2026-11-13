// Funciones compartidas por las páginas del sitio.
window.RutaMotor = {
  claves: { informes: 'rutaMotor:informes',
     clientes: 'rutaMotor:clientes',
      sesion: 'rutaMotor:sesion' },
  leerLista(clave, inicial = []) {
    try { return JSON.parse(sessionStorage.getItem(clave)) || inicial; }
    catch { return inicial; }
  },
  guardarLista(clave, lista) { sessionStorage.setItem(clave, JSON.stringify(lista)); },
  sesion() { try { return JSON.parse(sessionStorage.getItem(window.RutaMotor.claves.sesion)); } catch { return null; } },
  escapar(texto) {
    return String(texto ?? '').replace(/[&<>"']/g, caracter => (
      { '&':'&amp;',
       '<':'&lt;', '>':'&gt;',
        '"':'&quot;',
         "'":'&#39;' }[caracter]));
  },
  alerta(opciones) {
    if (window.Swal) return Swal.fire(opciones);
    window.alert(opciones.text || opciones.title || '');
    return Promise.resolve({ isConfirmed: true });
  }
};

async function cargarPlantilla(id, ruta) {
  const espacio = document.getElementById(id);
  if (!espacio) return;
  try {
    const respuesta = await fetch(ruta);
    if (!respuesta.ok) throw new Error(`No se pudo cargar ${ruta}`);
    espacio.innerHTML = await respuesta.text();
  } catch (error) { console.error(error); }
}

document.addEventListener('DOMContentLoaded', async () => {
  if (document.getElementById('header')) await cargarPlantilla('header', './plantillas/header.html');
  if (document.getElementById('footer')) await cargarPlantilla('footer', './plantillas/footer.html');
  const anio = document.querySelector('[data-current-year]');
  if (anio) anio.textContent = new Date().getFullYear();
  window.dispatchEvent(new Event('rutamotor:plantillas-cargadas'));
  document.querySelectorAll('[data-cerrar-sesion]').forEach(boton => boton.addEventListener('click', () => {
    sessionStorage.removeItem(RutaMotor.claves.sesion);
    location.href = 'login.html';
  }));
});
