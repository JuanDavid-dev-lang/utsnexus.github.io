/* Arranque, antes de la hoja de estilos.

   Dos cosas y nada más:
   1. Aplicar el tema guardado antes de pintar. Leerlo después deja el primer
      fotograma con el tema del sistema y lo cambia a continuación: quien
      eligió claro con el equipo en oscuro ve un fogonazo.
   2. Marcar que hay JavaScript (`html.js`). Las animaciones de entrada solo
      esconden contenido cuando existe un guion que lo va a mostrar; sin
      esta marca, todo está visible desde el principio.

   Es un archivo aparte y no un guion en línea para que la política de
   seguridad de contenido pueda prohibir TODO guion en línea sin excepciones
   ni hashes que haya que recalcular en cada edición. */
(function () {
  var raiz = document.documentElement;
  raiz.classList.add('js');

  var elegido = null;
  try { elegido = localStorage.getItem('uts-tema'); } catch (e) { /* modo privado */ }
  if (elegido === 'claro' || elegido === 'oscuro') {
    raiz.setAttribute('data-tema', elegido);
  }
  var oscuro = elegido === 'oscuro' || (elegido !== 'claro' &&
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  raiz.style.colorScheme = oscuro ? 'dark' : 'light';
})();
