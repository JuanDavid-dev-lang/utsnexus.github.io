/* La planilla del hero.

   Las filas van escritas en el HTML, con las definitivas ya calculadas con
   los pesos del reglamento (C1 33 % + C2 33 % + C3 34 %, se aprueba desde
   3.0): así la tabla existe para buscadores, lectores sin JavaScript y el
   primer fotograma.

   Este guion hace dos cosas. Al cargar, cuenta la historia: se llena la
   lista, después se traza el umbral y solo al final aparece la alerta.
   Y después deja TOCAR: los botones cambian una nota, y la planilla se
   recalcula con los mismos pesos, se reordena y mueve la línea del 3.0.
   Es la promesa del producto puesta en la portada, no descrita. */

const PESOS = { c1: 0.33, c2: 0.33, c3: 0.34 };
const APRUEBA = 3.0;
const NOTA_MIN = 0;
const NOTA_MAX = 5;
const PASO_FILA = 110;
const ARRANQUE = 190;

function definitiva(fila) {
  return fila.c1 * PESOS.c1 + fila.c2 * PESOS.c2 + fila.c3 * PESOS.c3;
}

/** Una nota siempre se muestra con un decimal: «4» en una planilla se lee mal. */
function nota(valor) {
  return valor.toFixed(1);
}

function leerFila(tr) {
  return {
    tr,
    nombre: tr.dataset.nombre,
    c1: parseFloat(tr.dataset.c1),
    c2: parseFloat(tr.dataset.c2),
    c3: parseFloat(tr.dataset.c3)
  };
}

export function iniciarPlanilla() {
  const cuerpo = document.getElementById('filas');
  const umbral = document.getElementById('umbral');
  const planilla = document.getElementById('planilla');
  if (!cuerpo || !umbral || !planilla) return;

  const filas = Array.from(cuerpo.querySelectorAll('.fila')).map(leerFila);
  const sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Cada fila lleva su nombre de transición de vista: cuando se reordenan,
  // el navegador las desliza de su sitio viejo al nuevo por su cuenta.
  filas.forEach((fila, i) => { fila.tr.style.viewTransitionName = 'fila-' + i; });
  umbral.style.viewTransitionName = 'umbral';

  /**
   * Coloca la línea del 3.0 justo donde deja de aprobarse.
   * Se mide contra el DOM ya pintado en vez de calcularse por número de
   * filas: si un nombre se parte en dos líneas en un teléfono, la línea
   * sigue cayendo en el sitio correcto.
   */
  function colocarUmbral() {
    const primeraQueReprueba = cuerpo.querySelector('tr[data-reprueba]');
    umbral.hidden = !primeraQueReprueba;
    if (!primeraQueReprueba) return;
    const alto = planilla.getBoundingClientRect().top;
    const fila = primeraQueReprueba.getBoundingClientRect().top;
    umbral.style.top = Math.round(fila - alto) + 'px';
  }

  /** Vuelca una fila a sus celdas: notas, definitiva, color y marca. */
  function pintarFila(fila) {
    const celdas = fila.tr.children;
    const final = definitiva(fila);
    const aprueba = final >= APRUEBA;

    celdas[1].textContent = nota(fila.c1);
    celdas[2].textContent = nota(fila.c2);
    celdas[3].textContent = nota(fila.c3);

    const def = celdas[4];
    const antes = def.firstChild && def.firstChild.textContent;
    def.className = 'def ' + (aprueba ? 'def--alta' : 'def--baja');
    def.replaceChildren(document.createTextNode(nota(final)));
    if (!aprueba) {
      const marca = document.createElement('span');
      marca.className = 'marca-riesgo esta';
      marca.textContent = 'riesgo alto';
      def.appendChild(marca);
    }
    if (antes !== nota(final)) {
      def.classList.remove('def--cambia');
      void def.offsetWidth; // reinicia la animación aunque sea el mismo valor
      def.classList.add('def--cambia');
    }

    if (aprueba) delete fila.tr.dataset.reprueba;
    else fila.tr.dataset.reprueba = 'si';
  }

  /** Reordena de mayor a menor definitiva y recoloca la línea. */
  function recalcular() {
    filas.forEach(pintarFila);
    const orden = filas.slice().sort((a, b) => definitiva(b) - definitiva(a));
    orden.forEach((fila) => cuerpo.appendChild(fila.tr));
    colocarUmbral();
  }

  function recalcularAnimado() {
    if (!document.startViewTransition || sinMovimiento || document.visibilityState === 'hidden') {
      recalcular();
      return;
    }
    const transicion = document.startViewTransition(recalcular);
    transicion.ready.catch(() => {});
    transicion.finished.catch(() => {});
  }

  // ── Los controles ──────────────────────────────────────────────────────
  const probar = document.getElementById('probar');
  const salida = document.getElementById('paso-valor');
  const viva = filas.find((fila) => fila.tr.dataset.editable);
  if (probar && salida && viva) {
    const campo = viva.tr.dataset.editable; // 'c2'
    const botones = probar.querySelectorAll('[data-paso]');

    function actualizarBotones() {
      botones.forEach((boton) => {
        const paso = parseFloat(boton.dataset.paso);
        const siguiente = viva[campo] + paso;
        boton.disabled = siguiente < NOTA_MIN - 1e-9 || siguiente > NOTA_MAX + 1e-9;
      });
    }

    botones.forEach((boton) => {
      boton.addEventListener('click', () => {
        const paso = parseFloat(boton.dataset.paso);
        const siguiente = Math.round((viva[campo] + paso) * 10) / 10;
        if (siguiente < NOTA_MIN || siguiente > NOTA_MAX) return;
        viva[campo] = siguiente;
        viva.tr.dataset[campo] = nota(siguiente);
        salida.value = nota(siguiente);
        actualizarBotones();
        recalcularAnimado();
      });
    });

    actualizarBotones();
    probar.hidden = false;
  }

  // ── La entrada ─────────────────────────────────────────────────────────
  function revelar() {
    const trs = filas.map((fila) => fila.tr);
    const marca = cuerpo.querySelector('.marca-riesgo');

    if (sinMovimiento) {
      trs.forEach((tr) => tr.classList.add('esta'));
      colocarUmbral();
      umbral.classList.add('esta');
      if (marca) marca.classList.add('esta');
      return;
    }

    trs.forEach((tr, i) => {
      setTimeout(() => tr.classList.add('esta'), ARRANQUE + i * PASO_FILA);
    });

    const trasFilas = ARRANQUE + trs.length * PASO_FILA;
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
