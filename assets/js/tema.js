/* Tema: claro, oscuro y seguir al sistema.

   Quien elige a mano manda sobre el sistema: se guarda `claro` u `oscuro` en
   el navegador y el atributo `data-tema` gana a la consulta de medios en la
   hoja de estilos. Elegir «sistema» borra la preferencia en vez de escribir
   el valor actual — si guardara el valor, mañana seguiría el de hoy.

   El fogonazo del primer fotograma lo evita `tema-inicial.js`: este solo se
   ocupa de los botones y de mantener el color de la barra del navegador. */

const CLAVE = 'uts-tema';
const COLOR = { claro: '#144d37', oscuro: '#232922' };

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

  function aplicar(eleccion) {
    if (eleccion === 'sistema') raiz.removeAttribute('data-tema');
    else raiz.setAttribute('data-tema', eleccion);

    const esOscuro = eleccion === 'oscuro' ||
      (eleccion === 'sistema' && !!delSistema && delSistema.matches);

    raiz.style.colorScheme = esOscuro ? 'dark' : 'light';
    if (meta) meta.setAttribute('content', esOscuro ? COLOR.oscuro : COLOR.claro);

    opciones.forEach((boton) => {
      boton.setAttribute('aria-pressed', boton.dataset.temaOp === eleccion ? 'true' : 'false');
    });
  }

  /* El cambio de tema pasa por una transición de vista cuando el navegador
     la tiene: un fundido de toda la página en vez de cada color cambiando
     por su cuenta. Donde no, el cambio es inmediato y las transiciones de
     color de la hoja de estilos lo suavizan. */
  function cambiar(eleccion) {
    const sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const oculta = document.visibilityState === 'hidden';
    if (!document.startViewTransition || sinMovimiento || oculta) {
      aplicar(eleccion);
      return;
    }
    // Si el navegador aborta la transición (pestaña que pasa a segundo
    // plano a mitad de camino), el tema ya quedó aplicado: el rechazo no
    // tiene que llegar a la consola.
    const transicion = document.startViewTransition(() => aplicar(eleccion));
    transicion.ready.catch(() => {});
    transicion.finished.catch(() => {});
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
