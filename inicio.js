// Controles propios de la página de inicio: menú y cinta de imágenes.
document.addEventListener('DOMContentLoaded', () => {
  const cinta = document.getElementById('cinta-imagen');
  if (cinta) iniciarCinta(cinta);
});

// El encabezado llega con fetch; conectamos el botón cuando ya está insertado.
window.addEventListener('rutamotor:plantillas-cargadas', () => {
  const boton = document.querySelector('.boton-menu');
  const navegacion = document.querySelector('.navegacion-sitio');
  if (boton && navegacion) boton.addEventListener('click', () => {
    const abierto = boton.getAttribute('aria-expanded') === 'true';
    boton.setAttribute('aria-expanded', String(!abierto));
    navegacion.classList.toggle('navegacion-sitio--abierta', !abierto);
  });

});

function iniciarCinta(cinta) {
  const diapositivas = [...cinta.querySelectorAll('.diapositiva')];
  const puntos = [...cinta.querySelectorAll('.indicador-cinta')];
  if (!diapositivas.length || diapositivas.length !== puntos.length) return;
  let actual = 0;
  diapositivas.forEach(diapositiva => {
    const imagen = diapositiva.querySelector('img');
    const mostrarAlternativa = () => {
      diapositiva.classList.add('diapositiva--sin-foto');
      diapositiva.style.setProperty('--texto-foto-vacia', `"${imagen.dataset.textoVacio}"`);
    };
    imagen?.addEventListener('error', mostrarAlternativa);
    if (imagen?.complete && !imagen.naturalWidth) mostrarAlternativa();
  });
  const mostrar = indice => {
    actual = (indice + diapositivas.length) % diapositivas.length;
    diapositivas.forEach((diapositiva, posicion) => {
      diapositiva.hidden = posicion !== actual;
      puntos[posicion].classList.toggle('indicador-cinta--activo', posicion === actual);
      puntos[posicion].setAttribute('aria-current', String(posicion === actual));
    });
  };
  cinta.querySelectorAll('[data-paso]').forEach(control => control.addEventListener('click', () => mostrar(actual + Number(control.dataset.paso))));
  puntos.forEach(punto => punto.addEventListener('click', () => mostrar(Number(punto.dataset.indice))));
  mostrar(0);
  setInterval(() => mostrar(actual + 1), 6000);
}
