/* Tema: claro, oscuro y seguir al sistema.

   Quien elige a mano manda sobre el sistema: se guarda `claro` u `oscuro` en
   el navegador y el atributo `data-tema` gana a la consulta de medios en la
   hoja de estilos. Elegir «sistema» borra la preferencia en vez de escribir
   el valor actual — si guardara el valor, mañana seguiría el de hoy.

   El fogonazo del primer fotograma lo evita `tema-inicial.js`: este solo se
   ocupa de los botones y de mantener el color de la barra del navegador. */

const CLAVE = 'uts-tema';
// El color de la barra del navegador en el teléfono: el del fondo de la
// página en cada tema, para que la barra y la página se lean como una.
const COLOR = { claro: '#fbfbf8', oscuro: '#232922' };

export function iniciarTema() {
  const opciones = document.querySelectorAll('[data-tema-op]');
  if (!opciones.length) return;

  const raiz = document.documentElement;
  const meta = document.getElementById('metaTema');
  const delSistema = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

  function guardado() {
    try {
      const v = localStorage.getItem(CLAVE);
      return (v === 'claro' || v === 'oscuro') ? v : 'sistema';
    } catch (e) {
      return 'sistema';
    }
  }

  function oscuroSi(eleccion) {
    return eleccion === 'oscuro' ||
      (eleccion === 'sistema' && !!delSistema && delSistema.matches);
  }

  function aplicar(eleccion) {
    if (eleccion === 'sistema') raiz.removeAttribute('data-tema');
    else raiz.setAttribute('data-tema', eleccion);

    const esOscuro = oscuroSi(eleccion);

    raiz.style.colorScheme = esOscuro ? 'dark' : 'light';
    if (meta) meta.setAttribute('content', esOscuro ? COLOR.oscuro : COLOR.claro);

    opciones.forEach((boton) => {
      boton.setAttribute('aria-pressed', boton.dataset.temaOp === eleccion ? 'true' : 'false');
    });
    // El disco que se desliza lee este atributo desde la hoja de estilos.
    const grupo = opciones[0].closest('.tema');
    if (grupo) grupo.dataset.activo = eleccion;
  }

  /* El cambio de tema entra como una planilla que se llena: el tema nuevo
     barre la página fila por fila, de arriba abajo. Hacia el oscuro barre
     desde la derecha, que es donde está el interruptor; hacia el claro, desde
     la izquierda. El barrido lo dibuja la hoja de estilos sobre la
     transición de vista; este guion solo marca hacia dónde va
     (`data-cambio-tema`) mientras dura.

     Sin transiciones de vista, con movimiento reducido, con la pestaña
     oculta o cuando la elección no cambia cómo se ve la página («sistema»
     estando ya en oscuro), el cambio es inmediato. */
  function cambiar(eleccion) {
    const sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const oculta = document.visibilityState === 'hidden';
    const igual = oscuroSi(eleccion) === (raiz.style.colorScheme === 'dark');
    if (!document.startViewTransition || sinMovimiento || oculta || igual) {
      aplicar(eleccion);
      return;
    }
    raiz.dataset.cambioTema = oscuroSi(eleccion) ? 'oscuro' : 'claro';
    const transicion = document.startViewTransition(() => aplicar(eleccion));
    // Si el navegador aborta la transición (pestaña que pasa a segundo
    // plano a mitad de camino), el tema ya quedó aplicado: el rechazo no
    // tiene que llegar a la consola.
    transicion.ready.catch(() => {});
    transicion.finished
      .catch(() => {})
      .finally(() => { delete raiz.dataset.cambioTema; });
  }

  opciones.forEach((boton) => {
    boton.addEventListener('click', () => {
      const eleccion = boton.dataset.temaOp;
      try {
        if (eleccion === 'sistema') localStorage.removeItem(CLAVE);
        else localStorage.setItem(CLAVE, eleccion);
      } catch (e) { /* la elección vale para esta visita */ }
      cambiar(eleccion);
    });
  });

  if (delSistema) {
    const alCambiar = () => { if (guardado() === 'sistema') aplicar('sistema'); };
    if (delSistema.addEventListener) delSistema.addEventListener('change', alCambiar);
    else if (delSistema.addListener) delSistema.addListener(alCambiar);
  }

  aplicar(guardado());
}
