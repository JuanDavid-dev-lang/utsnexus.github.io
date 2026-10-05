/* Luz e inclinación que siguen al cursor.

   Cada elemento con `data-foco` recibe dos pares de variables: `--fx`/`--fy`
   (dónde está el cursor, para la luz) y `--rx`/`--ry` (cuánto se inclina).
   La hoja de estilos decide qué hacer con ellas; este guion solo mide.

   Solo con un puntero que flota (ratón, lápiz): en una pantalla táctil no
   hay cursor que seguir. Y nada de inclinarse con `prefers-reduced-motion`. */

const INCLINACION_MAX = 5;

export function iniciarFoco() {
  const elementos = document.querySelectorAll('[data-foco]');
  if (!elementos.length) return;
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const inclinar = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  elementos.forEach((el) => {
    let pedido = 0;
    let ultimo = null;

    function pintar() {
      pedido = 0;
      if (!ultimo) return;
      const caja = el.getBoundingClientRect();
      const x = (ultimo.clientX - caja.left) / caja.width;
      const y = (ultimo.clientY - caja.top) / caja.height;
      el.style.setProperty('--fx', (x * 100).toFixed(1) + '%');
      el.style.setProperty('--fy', (y * 100).toFixed(1) + '%');
      if (inclinar) {
        el.style.setProperty('--rx', ((0.5 - y) * INCLINACION_MAX * 2).toFixed(2) + 'deg');
        el.style.setProperty('--ry', ((x - 0.5) * INCLINACION_MAX * 2).toFixed(2) + 'deg');
      }
    }

    el.addEventListener('pointermove', (evento) => {
      ultimo = evento;
      if (!pedido) pedido = requestAnimationFrame(pintar);
    });
    el.addEventListener('pointerleave', () => {
      ultimo = null;
      el.style.setProperty('--rx', '0deg');
      el.style.setProperty('--ry', '0deg');
    });
  });
}
