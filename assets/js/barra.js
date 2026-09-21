/* La barra: progreso de lectura y sección activa.

   Las dos cosas se calculan en el hilo principal pero baratas: el progreso
   es una división por `scroll` y se pinta con `transform`; la sección
   activa la decide un IntersectionObserver, no un cálculo por evento. */

export function iniciarBarra() {
  const progreso = document.getElementById('progreso');
  if (progreso) {
    let pedido = false;
    const pintar = () => {
      pedido = false;
      const raiz = document.documentElement;
      const total = raiz.scrollHeight - raiz.clientHeight;
      const p = total > 0 ? Math.min(1, window.scrollY / total) : 0;
      progreso.style.transform = 'scaleX(' + p.toFixed(4) + ')';
    };
    window.addEventListener('scroll', () => {
      if (pedido) return;
      pedido = true;
      requestAnimationFrame(pintar);
    }, { passive: true });
    pintar();
  }

  const enlaces = Array.from(document.querySelectorAll('#enlaces a[href^="#"]'));
  if (!enlaces.length || !('IntersectionObserver' in window)) return;

  const porId = new Map(enlaces.map((a) => [a.getAttribute('href').slice(1), a]));
  const secciones = Array.from(porId.keys()).map((id) => document.getElementById(id)).filter(Boolean);

  // La sección activa es la que ocupa la franja central de la ventana. Con
  // `rootMargin` se recorta la ventana a esa franja, y así una sección
  // corta no se queda sin turno cuando la anterior aún asoma por arriba.
  const observador = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
      if (!entrada.isIntersecting) return;
      enlaces.forEach((a) => a.removeAttribute('aria-current'));
      const enlace = porId.get(entrada.target.id);
      if (enlace) enlace.setAttribute('aria-current', 'true');
    });
  }, { rootMargin: '-40% 0px -50% 0px' });

  secciones.forEach((seccion) => observador.observe(seccion));
}
