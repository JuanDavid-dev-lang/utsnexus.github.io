/* Comparador «antes y ahora».

   El control es un `<input type="range">` invisible que cubre todo el
   comparador: el navegador ya sabe arrastrarlo con ratón, dedo y flechas, y
   anunciarlo a un lector de pantalla. Este guion solo copia su valor a la
   variable `--corte`, que recorta la capa de «ahora».

   La primera vez que asoma, la línea hace un barrido corto para que se note
   que se puede mover. Si alguien ya la tocó, o prefiere menos movimiento,
   no hay barrido. */

const BARRIDO_MS = 1400;
const DESDE = 82;
const HASTA = 50;

/** Arranca rápido y frena al llegar. */
function curva(t) {
  return 1 - Math.pow(1 - t, 3);
}

export function iniciarComparador() {
  const comparador = document.getElementById('comparador');
  const control = comparador && comparador.querySelector('.comparador__control');
  if (!comparador || !control) return;

  const pintar = (valor) => comparador.style.setProperty('--corte', valor + '%');
  let tocado = false;

  control.addEventListener('input', () => {
    tocado = true;
    pintar(control.value);
  });
  pintar(control.value);

  const sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (sinMovimiento || !('IntersectionObserver' in window)) return;

  function barrer() {
    const inicio = performance.now();
    function paso(ahora) {
      if (tocado) return;
      const t = Math.min(1, (ahora - inicio) / BARRIDO_MS);
      const valor = DESDE + (HASTA - DESDE) * curva(t);
      control.value = String(Math.round(valor));
      pintar(valor.toFixed(2));
      if (t < 1) requestAnimationFrame(paso);
    }
    pintar(DESDE);
    requestAnimationFrame(paso);
  }

  const observador = new IntersectionObserver((entradas) => {
    if (!entradas[0].isIntersecting) return;
    observador.disconnect();
    if (!tocado) barrer();
  }, { threshold: 0.5 });
  observador.observe(comparador);
}
