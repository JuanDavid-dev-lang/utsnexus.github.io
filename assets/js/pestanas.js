/* Pestañas de los diagramas UML.

   Sin JavaScript los cuatro paneles quedan visibles uno debajo de otro: el
   `hidden` de los tres últimos lo pone este guion, no el HTML. Así la página
   sigue contando lo mismo si el script no llega.

   Teclado: flechas para moverse entre pestañas, Inicio y Fin para los
   extremos. Es el comportamiento que un lector de pantalla anuncia al entrar
   en un `tablist`, así que tiene que existir de verdad. */
export function iniciarPestanas() {
  const lista = document.querySelector('[role="tablist"]');
  if (!lista) return;

  const pestanas = Array.from(lista.querySelectorAll('[role="tab"]'));
  if (pestanas.length < 2) return;

  const paneles = pestanas.map((p) => document.getElementById(p.getAttribute('aria-controls')));
  if (paneles.includes(null)) return;

  function activar(indice, mover) {
    pestanas.forEach((pestana, i) => {
      const activa = i === indice;
      pestana.setAttribute('aria-selected', activa ? 'true' : 'false');
      // Roving tabindex: el tabulador entra una vez al grupo y sale; dentro
      // se navega con las flechas.
      pestana.tabIndex = activa ? 0 : -1;
      paneles[i].hidden = !activa;
    });
    if (mover) pestanas[indice].focus();
  }

  const SALTOS = {
    ArrowRight: (i) => (i + 1) % pestanas.length,
    ArrowDown: (i) => (i + 1) % pestanas.length,
    ArrowLeft: (i) => (i - 1 + pestanas.length) % pestanas.length,
    ArrowUp: (i) => (i - 1 + pestanas.length) % pestanas.length,
    Home: () => 0,
    End: () => pestanas.length - 1
  };

  pestanas.forEach((pestana, i) => {
    pestana.addEventListener('click', () => activar(i, false));
    pestana.addEventListener('keydown', (evento) => {
      const salto = SALTOS[evento.key];
      if (!salto) return;
      evento.preventDefault();
      activar(salto(i), true);
    });
  });

  activar(0, false);
}
