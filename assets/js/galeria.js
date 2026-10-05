/* Galería de «lo más destacado».

   Sin guion es una fila que se desliza con el dedo, la rueda o el teclado:
   ya funciona. Este módulo añade lo que solo sirve con guion —los puntos
   que dicen dónde estás, el avance solo y su botón de pausa— y por eso los
   controles llegan con `hidden` en el HTML.

   El reloj del avance es la propia animación CSS del punto activo: cuando
   termina de llenarse, se pasa a la siguiente. Pausar es pausar esa
   animación, así que el punto se queda a medias y retoma donde iba.

   Se queda quieta: con `prefers-reduced-motion`, mientras el cursor o el
   foco están dentro, y mientras la galería no se ve. */

const UMBRAL_ACTIVA = 0.6;

export function iniciarGaleria() {
  const galeria = document.querySelector('.galeria');
  const pista = document.getElementById('galeria-pista');
  const controles = document.getElementById('galeria-controles');
  if (!galeria || !pista || !controles) return;

  const momentos = Array.from(pista.querySelectorAll('.momento'));
  const puntos = controles.querySelector('.galeria__puntos');
  const pausa = controles.querySelector('.galeria__pausa');
  if (momentos.length < 2 || !puntos || !pausa) return;

  const sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let activa = 0;
  let pausadaAMano = sinMovimiento;
  let encima = false;
  let fuera = true;

  const botones = momentos.map((momento, i) => {
    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = 'galeria__punto';
    boton.setAttribute('aria-label', 'Ir a: ' + (momento.dataset.titulo || 'tarjeta ' + (i + 1)));
    const relleno = document.createElement('span');
    relleno.className = 'galeria__relleno';
    boton.appendChild(relleno);
    boton.addEventListener('click', () => ir(i));
    puntos.appendChild(boton);
    return boton;
  });

  /** Desliza la pista hasta dejar la tarjeta `i` alineada con el texto. */
  function ir(i) {
    const destino = momentos[(i + momentos.length) % momentos.length];
    const relleno = parseFloat(getComputedStyle(pista).scrollPaddingLeft) || 0;
    const delta = destino.getBoundingClientRect().left - pista.getBoundingClientRect().left - relleno;
    pista.scrollBy({ left: delta, behavior: sinMovimiento ? 'auto' : 'smooth' });
  }

  function marcar(i) {
    if (i < 0) return;
    activa = i;
    botones.forEach((boton, j) => {
      if (j === i) boton.setAttribute('aria-current', 'true');
      else boton.removeAttribute('aria-current');
    });
  }

  /** Corre si nadie la pausó, nadie está encima y se ve en pantalla. */
  function actualizar() {
    galeria.classList.toggle('galeria--corre', !pausadaAMano);
    galeria.classList.toggle('galeria--quieta', pausadaAMano || encima || fuera);
    pausa.setAttribute('aria-pressed', pausadaAMano ? 'true' : 'false');
    pausa.setAttribute('aria-label', pausadaAMano ? 'Reproducir la galería' : 'Pausar la galería');
  }

  puntos.addEventListener('animationend', (evento) => {
    if (evento.animationName === 'llenar') ir(activa + 1);
  });

  pausa.addEventListener('click', () => {
    pausadaAMano = !pausadaAMano;
    actualizar();
  });

  galeria.addEventListener('pointerenter', () => { encima = true; actualizar(); });
  galeria.addEventListener('pointerleave', () => { encima = false; actualizar(); });
  galeria.addEventListener('focusin', () => { encima = true; actualizar(); });
  galeria.addEventListener('focusout', (evento) => {
    if (galeria.contains(evento.relatedTarget)) return;
    encima = false;
    actualizar();
  });

  if ('IntersectionObserver' in window) {
    const observador = new IntersectionObserver((entradas) => {
      entradas.forEach((entrada) => {
        if (entrada.isIntersecting) marcar(momentos.indexOf(entrada.target));
      });
    }, { root: pista, threshold: UMBRAL_ACTIVA });
    momentos.forEach((momento) => observador.observe(momento));

    new IntersectionObserver((entradas) => {
      fuera = !entradas[0].isIntersecting;
      actualizar();
    }, { threshold: 0.35 }).observe(pista);
  }

  // Sin movimiento no hay avance solo, y un botón de reproducir que no
  // reproduce nada sobra: la hoja de estilos reduce toda animación a casi
  // cero y el punto saltaría de tarjeta en tarjeta sin parar.
  if (sinMovimiento) pausa.hidden = true;

  marcar(0);
  actualizar();
  controles.hidden = false;
}
