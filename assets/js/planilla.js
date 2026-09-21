/* La planilla del hero.

   Las filas van escritas en el HTML, con las definitivas ya calculadas con
   los pesos del reglamento (C1 33 % + C2 33 % + C3 34 %, se aprueba desde
   3.0): así la tabla existe para buscadores, lectores sin JavaScript y el
   primer fotograma. Este guion no pone datos; cuenta la historia: se llena
   la lista, después se traza el umbral y solo al final aparece la alerta.
   Primero los datos, después el criterio, después la conclusión. */

const PASO_FILA = 110;
const ARRANQUE = 190;

export function iniciarPlanilla() {
  const cuerpo = document.getElementById('filas');
  const umbral = document.getElementById('umbral');
  const planilla = document.getElementById('planilla');
  if (!cuerpo || !umbral || !planilla) return;

  const filas = cuerpo.querySelectorAll('.fila');
  const marca = cuerpo.querySelector('.marca-riesgo');
  const sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /**
   * Coloca la línea del 3.0 justo donde deja de aprobarse.
   * Se mide contra el DOM ya pintado en vez de calcularse por número de
   * filas: si un nombre se parte en dos líneas en un teléfono, la línea
   * sigue cayendo en el sitio correcto.
   */
  function colocarUmbral() {
    const primeraQueReprueba = cuerpo.querySelector('tr[data-reprueba]');
    if (!primeraQueReprueba) {
      umbral.hidden = true;
      return;
    }
    const alto = planilla.getBoundingClientRect().top;
    const fila = primeraQueReprueba.getBoundingClientRect().top;
    umbral.style.top = Math.round(fila - alto) + 'px';
  }

  function revelar() {
    if (sinMovimiento) {
      filas.forEach((fila) => fila.classList.add('esta'));
      colocarUmbral();
      umbral.classList.add('esta');
      if (marca) marca.classList.add('esta');
      return;
    }

    filas.forEach((fila, i) => {
      setTimeout(() => fila.classList.add('esta'), ARRANQUE + i * PASO_FILA);
    });

    const trasFilas = ARRANQUE + filas.length * PASO_FILA;
    setTimeout(() => { colocarUmbral(); umbral.classList.add('esta'); }, trasFilas + 160);
    setTimeout(() => { if (marca) marca.classList.add('esta'); }, trasFilas + 620);
  }

  // Recolocar al cambiar de tamaño: el umbral está posicionado en píxeles.
  let pendiente;
  window.addEventListener('resize', () => {
    clearTimeout(pendiente);
    pendiente = setTimeout(colocarUmbral, 120);
  });

  // Las fuentes cambian el alto de las filas al cargar; sin esperarlas la
  // línea queda unos píxeles desplazada durante el primer segundo.
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(revelar);
  else revelar();
}
