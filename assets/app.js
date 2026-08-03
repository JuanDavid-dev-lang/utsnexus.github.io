/* ═══════════════════════════════════════════════════════════════════════════
   La planilla del hero.

   Las definitivas no están escritas a mano: se calculan aquí con los mismos
   pesos que usa el motor de calificaciones del producto (C1 33% + C2 33% +
   C3 34%, se aprueba desde 3.0). Si alguien cambia una nota de ejemplo, la
   definitiva y la línea del umbral se recolocan solas — que es exactamente la
   promesa de la aplicación.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var PESOS = { c1: 0.33, c2: 0.33, c3: 0.34 };
  var APRUEBA = 3.0;

  // Notas de ejemplo. Se ordenan solas, así que el orden de esta lista no importa.
  var GRUPO = [
    { nombre: 'Ana Ruiz',        c1: 4.2, c2: 3.9, c3: 4.4 },
    { nombre: 'Andrés Mejía',    c1: 3.8, c2: 4.1, c3: 3.7 },
    { nombre: 'Camilo Peña',     c1: 3.4, c2: 3.1, c3: 3.2 },
    { nombre: 'Laura Gómez',     c1: 3.1, c2: 2.9, c3: 3.3 },
    { nombre: 'Valentina Soto',  c1: 2.6, c2: 2.2, c3: 2.4 }
  ];

  var cuerpo = document.getElementById('filas');
  var umbral = document.getElementById('umbral');
  var planilla = document.getElementById('planilla');
  if (!cuerpo || !umbral || !planilla) return;

  var sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function definitiva(fila) {
    return fila.c1 * PESOS.c1 + fila.c2 * PESOS.c2 + fila.c3 * PESOS.c3;
  }

  /** Una nota siempre se muestra con un decimal: "4" en una planilla se lee mal. */
  function nota(valor) {
    return valor.toFixed(1);
  }

  var filas = GRUPO
    .map(function (fila) {
      return { datos: fila, final: definitiva(fila) };
    })
    .sort(function (a, b) { return b.final - a.final; });

  filas.forEach(function (fila) {
    var aprueba = fila.final >= APRUEBA;
    var tr = document.createElement('tr');
    tr.className = 'fila';
    if (!aprueba) tr.dataset.reprueba = 'si';

    var celdas = [
      fila.datos.nombre,
      nota(fila.datos.c1),
      nota(fila.datos.c2),
      nota(fila.datos.c3)
    ];

    celdas.forEach(function (texto) {
      var td = document.createElement('td');
      td.textContent = texto;
      tr.appendChild(td);
    });

    var tdFinal = document.createElement('td');
    tdFinal.className = 'def ' + (aprueba ? 'def--alta' : 'def--baja');
    tdFinal.textContent = nota(fila.final);

    if (!aprueba) {
      var marca = document.createElement('span');
      marca.className = 'marca-riesgo';
      marca.textContent = 'riesgo alto';
      tdFinal.appendChild(marca);
    }

    tr.appendChild(tdFinal);
    cuerpo.appendChild(tr);
  });

  /**
   * Coloca la línea del 3.0 justo donde deja de aprobarse.
   *
   * Se mide contra el DOM ya pintado en vez de calcularse por número de filas:
   * si el texto se ajusta a dos líneas en un teléfono, la línea sigue cayendo
   * en el sitio correcto.
   */
  function colocarUmbral() {
    var primeraQueReprueba = cuerpo.querySelector('tr[data-reprueba]');
    if (!primeraQueReprueba) {
      umbral.style.display = 'none';
      return;
    }
    var alto = planilla.getBoundingClientRect().top;
    var fila = primeraQueReprueba.getBoundingClientRect().top;
    umbral.style.top = Math.round(fila - alto) + 'px';
  }

  function revelar() {
    var elementos = cuerpo.querySelectorAll('.fila');

    if (sinMovimiento) {
      elementos.forEach(function (fila) { fila.classList.add('esta'); });
      colocarUmbral();
      umbral.classList.add('esta');
      var marcaFija = cuerpo.querySelector('.marca-riesgo');
      if (marcaFija) marcaFija.classList.add('esta');
      return;
    }

    // Secuencia: se llena la lista, después se traza el umbral y solo al final
    // aparece la alerta. Ese orden cuenta la historia del producto: primero los
    // datos, después el criterio, después la conclusión.
    elementos.forEach(function (fila, i) {
      setTimeout(function () { fila.classList.add('esta'); }, 190 + i * 110);
    });

    var trasFilas = 190 + elementos.length * 110;

    setTimeout(function () {
      colocarUmbral();
      umbral.classList.add('esta');
    }, trasFilas + 160);

    setTimeout(function () {
      var marca = cuerpo.querySelector('.marca-riesgo');
      if (marca) marca.classList.add('esta');
    }, trasFilas + 620);
  }

  // Recolocar al cambiar de tamaño: el umbral está posicionado en píxeles.
  var pendiente;
  window.addEventListener('resize', function () {
    clearTimeout(pendiente);
    pendiente = setTimeout(colocarUmbral, 120);
  });

  // Las fuentes cambian el alto de las filas al cargar; sin esperarlas la línea
  // queda unos píxeles desplazada durante el primer segundo.
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(revelar);
  } else {
    revelar();
  }
})();

/* ═══════════════════════════════════════════════════════════════════════════
   Enlaces de descarga: los manda el HTML, y solo el HTML.

   Aquí había una consulta a `https://3-14-147-55.sslip.io/api/v1/descargas` que
   reescribía el `href` de los botones con lo que devolviera el servidor, para
   poder cambiar las descargas desde el panel sin desplegar la página.

   Está quitada porque hacía lo contrario de lo que se quiere: el servidor
   devuelve la publicacion de GitHub como valor por defecto —no como algo que
   nadie haya configurado—, así que la página cargaba con los archivos de
   Dropbox y a los pocos milisegundos los cambiaba por los de GitHub. Los
   botones no llevaban a donde decía el HTML.

   El arreglo de fondo está hecho en el backend (los valores por defecto pasan a
   estar vacíos, y un campo vacío no se aplica), pero mientras esa versión no
   esté desplegada, preguntar es peor que no preguntar.

   Para devolver la funcion: `git revert` del commit que borró esto. Los botones
   conservan su `data-descarga`, que es lo unico que necesitaba.
   ═══════════════════════════════════════════════════════════════════════════ */
