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
   Enlaces de descarga.

   Los botones traen escritos los archivos de Dropbox, que el publicador de
   versiones sobrescribe en su sitio: no caducan al salir una versión nueva. Si
   la administración configura otros desde la app, el servidor los devuelve aquí
   y se sustituyen.

   El orden importa: primero un enlace que funciona, después el que toque. Al
   revés, un servidor caído dejaría la página de descargas sin descargas.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var API = 'https://3-14-147-55.sslip.io/api/v1/descargas';

  var botones = document.querySelectorAll('[data-descarga]');
  if (!botones.length || !window.fetch) return;

  // Si el servidor tarda, la página se queda con lo que ya tiene. Nadie debería
  // mirar un botón muerto porque una API va lenta.
  var corta = new AbortController();
  var plazo = setTimeout(function () { corta.abort(); }, 4000);

  fetch(API, { signal: corta.signal })
    .then(function (respuesta) {
      if (!respuesta.ok) throw new Error('HTTP ' + respuesta.status);
      return respuesta.json();
    })
    .then(function (datos) {
      var enlaces = datos && datos.enlaces;
      if (!enlaces) return;

      botones.forEach(function (boton) {
        var destino = enlaces[boton.dataset.descarga];
        if (!destino) return;
        // Solo https: un enlace en claro se puede sustituir en tránsito, y lo
        // que hay al otro lado es un ejecutable.
        if (destino.slice(0, 8) !== 'https://') return;
        boton.href = destino;
      });
    })
    .catch(function () {
      // Silencio deliberado: los enlaces escritos en el HTML siguen sirviendo.
    })
    .then(function () {
      clearTimeout(plazo);
    });
})();

/* ═══════════════════════════════════════════════════════════════════════════
   Tema: claro, oscuro y seguir al sistema.

   El tercer estado no es un adorno. Con dos posiciones, quien toca el
   interruptor una vez deja la página fijada para siempre, y el equipo que
   cambia solo al anochecer deja de hacerlo sin que nada lo explique. Por eso
   «seguir al sistema» es una opción visible y además el valor de partida.

   Quien elige a mano manda sobre el sistema: se guarda `claro` u `oscuro` en
   el navegador y el atributo `data-tema` gana a la consulta de medios en la
   hoja de estilos. Elegir «sistema» borra la preferencia en vez de escribir
   el valor actual — si guardara el valor, mañana seguiría el de hoy.

   El fogonazo del primer fotograma lo evita el guion en línea de <head>: este
   solo se ocupa de los botones y de mantener el color de la barra del
   navegador al día.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var CLAVE = 'uts-tema';
  var COLOR = { claro: '#144d37', oscuro: '#232922' };

  var opciones = document.querySelectorAll('[data-tema-op]');
  if (!opciones.length) return;

  var meta = document.getElementById('metaTema');
  var delSistema = window.matchMedia
    ? window.matchMedia('(prefers-color-scheme: dark)')
    : null;

  function guardado() {
    try {
      var v = localStorage.getItem(CLAVE);
      return (v === 'claro' || v === 'oscuro') ? v : 'sistema';
    } catch (e) {
      // Navegación privada o almacenamiento bloqueado: se sigue al sistema y
      // los botones funcionan igual durante la visita.
      return 'sistema';
    }
  }

  function aplicar(eleccion) {
    var raiz = document.documentElement;

    if (eleccion === 'sistema') raiz.removeAttribute('data-tema');
    else raiz.setAttribute('data-tema', eleccion);

    var esOscuro = eleccion === 'oscuro' ||
      (eleccion === 'sistema' && !!delSistema && delSistema.matches);

    raiz.style.colorScheme = esOscuro ? 'dark' : 'light';
    if (meta) meta.setAttribute('content', esOscuro ? COLOR.oscuro : COLOR.claro);

    opciones.forEach(function (boton) {
      boton.setAttribute('aria-pressed',
        boton.dataset.temaOp === eleccion ? 'true' : 'false');
    });
  }

  opciones.forEach(function (boton) {
    boton.addEventListener('click', function () {
      var eleccion = boton.dataset.temaOp;
      try {
        if (eleccion === 'sistema') localStorage.removeItem(CLAVE);
        else localStorage.setItem(CLAVE, eleccion);
      } catch (e) { /* la elección vale para esta visita */ }
      aplicar(eleccion);
    });
  });

  // Con «seguir al sistema» puesto, el equipo puede cambiar de tema mientras la
  // página está abierta. La hoja de estilos se recoloca sola; esto es para que
  // la barra del navegador no se quede con el color anterior.
  if (delSistema) {
    var alCambiar = function () { if (guardado() === 'sistema') aplicar('sistema'); };
    if (delSistema.addEventListener) delSistema.addEventListener('change', alCambiar);
    else if (delSistema.addListener) delSistema.addListener(alCambiar);
  }

  aplicar(guardado());
})();

/* ═══════════════════════════════════════════════════════════════════════════
   Pestañas de los diagramas UML.

   Sin JavaScript los cuatro paneles quedan visibles uno debajo de otro: el
   `hidden` de los tres últimos lo pone este guion, no el HTML. Así la página
   sigue contando lo mismo si el script no llega, que es la misma regla que
   sigue la sección de novedades.

   Teclado: flechas para moverse entre pestañas, Inicio y Fin para los
   extremos. Es el comportamiento que un lector de pantalla anuncia al entrar
   en un `tablist`, así que tiene que existir de verdad.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var lista = document.querySelector('[role="tablist"]');
  if (!lista) return;

  var pestanas = Array.prototype.slice.call(lista.querySelectorAll('[role="tab"]'));
  if (pestanas.length < 2) return;

  var paneles = pestanas.map(function (pestana) {
    return document.getElementById(pestana.getAttribute('aria-controls'));
  });
  if (paneles.indexOf(null) !== -1) return;

  function activar(indice, mover) {
    pestanas.forEach(function (pestana, i) {
      var activa = i === indice;
      pestana.setAttribute('aria-selected', activa ? 'true' : 'false');
      // Roving tabindex: el tabulador entra una vez al grupo y sale; dentro se
      // navega con las flechas. Con cuatro pestañas tabulables, llegar al
      // panel exigiría cuatro pulsaciones.
      pestana.tabIndex = activa ? 0 : -1;
      paneles[i].hidden = !activa;
    });
    if (mover) pestanas[indice].focus();
  }

  pestanas.forEach(function (pestana, i) {
    pestana.addEventListener('click', function () { activar(i, false); });

    pestana.addEventListener('keydown', function (evento) {
      var destino = null;
      if (evento.key === 'ArrowRight' || evento.key === 'ArrowDown') destino = (i + 1) % pestanas.length;
      else if (evento.key === 'ArrowLeft' || evento.key === 'ArrowUp') destino = (i - 1 + pestanas.length) % pestanas.length;
      else if (evento.key === 'Home') destino = 0;
      else if (evento.key === 'End') destino = pestanas.length - 1;
      if (destino === null) return;
      evento.preventDefault();
      activar(destino, true);
    });
  });

  activar(0, false);
})();
