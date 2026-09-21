/* Revelar al entrar en pantalla.

   Cada `.revela` recibe `.revela--visto` la primera vez que asoma un 12 % en
   el viewport, y ahí se queda: una tarjeta que se esconde al salir y vuelve
   a entrar al subir es una tarjeta que parpadea. Lo que ya está en pantalla
   al cargar se marca de inmediato, sin esperar al observador. */
export function iniciarRevelar() {
  // Los números de sección no se esconden, pero su regla se dibuja al
  // entrar: van al mismo observador con la misma marca.
  const elementos = document.querySelectorAll('.revela, .seccion__num');
  if (!elementos.length) return;

  const sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (sinMovimiento || !('IntersectionObserver' in window)) {
    elementos.forEach((el) => el.classList.add('revela--visto'));
    return;
  }

  const observador = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
      if (!entrada.isIntersecting) return;
      entrada.target.classList.add('revela--visto');
      observador.unobserve(entrada.target);
    });
  }, { threshold: .12, rootMargin: '0px 0px -6% 0px' });

  elementos.forEach((el) => observador.observe(el));

  // Red de seguridad: si el observador no ha disparado pasado un segundo y
  // medio (una pestaña en segundo plano, un iframe recortado), lo que ya
  // está dentro de la ventana se muestra igual. Una tarjeta que nunca
  // aparece es peor que una que aparece sin animación.
  setTimeout(() => {
    const limite = window.innerHeight + 200;
    elementos.forEach((el) => {
      if (el.getBoundingClientRect().top < limite) el.classList.add('revela--visto');
    });
  }, 1500);
}
