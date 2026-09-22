/* Enlaces de descarga.

   Los botones traen escritos los archivos de Dropbox, que el publicador de
   versiones sobrescribe en su sitio: no caducan al salir una versión nueva.
   Si la administración configura otros desde la app, el servidor los
   devuelve aquí y se sustituyen.

   El orden importa: primero un enlace que funciona, después el que toque. Al
   revés, un servidor caído dejaría la página de descargas sin descargas.

   Carga: la respuesta se guarda una hora en el navegador y la petición se
   lanza cuando el navegador está ocioso, después de pintar. Mil docentes
   abriendo la página el primer día de semestre son mil peticiones repartidas
   en la hora, no mil golpes al servidor en el mismo segundo. */

import { leer, guardar, pedirJson, cuandoSobre } from './cache.js';

const API = 'https://nexusback.ciaiuts.com/api/v1/descargas';
const CLAVE = 'uts-descargas';
const MINUTOS = 60;
const PLAZO_MS = 4000;

/** windows | android | linux | null, a partir de lo que el navegador cuenta. */
function plataforma() {
  const datos = navigator.userAgentData;
  const texto = ((datos && datos.platform) || navigator.userAgent || '').toLowerCase();
  if (texto.includes('android')) return 'android';
  if (texto.includes('win')) return 'windows';
  if (texto.includes('linux') || texto.includes('x11')) return 'linux';
  return null;
}

/** Señala la tarjeta del equipo desde el que se mira, sin moverla de sitio. */
function sellarTuEquipo() {
  const cual = plataforma();
  if (!cual) return;
  const tarjeta = document.querySelector('[data-plataforma="' + cual + '"]');
  if (!tarjeta) return;
  const sello = document.createElement('span');
  sello.className = 'tarjeta__tuya';
  sello.textContent = 'Tu equipo';
  tarjeta.classList.add('tarjeta--tuya');
  tarjeta.prepend(sello);
}

export function iniciarDescargas() {
  sellarTuEquipo();

  // Linux no lleva `data-descarga`: su botón entrega el INSTALADOR, no el
  // archivo de la aplicación, y el servidor devuelve la dirección de la
  // AppImage. Sustituirla dejaría el botón entregando otra cosa que la que
  // anuncia.
  const botones = document.querySelectorAll('[data-descarga]');
  if (!botones.length || !window.fetch) return;

  function aplicar(enlaces) {
    botones.forEach((boton) => {
      const destino = enlaces[boton.dataset.descarga];
      // Solo https: un enlace en claro se puede sustituir en tránsito, y lo
      // que hay al otro lado es un ejecutable.
      if (typeof destino !== 'string' || !destino.startsWith('https://')) return;
      boton.href = destino;
    });
  }

  const guardados = leer(CLAVE);
  if (guardados) { aplicar(guardados); return; }

  cuandoSobre(() => {
    pedirJson(API, PLAZO_MS)
      .then((datos) => {
        const enlaces = datos && datos.enlaces;
        if (!enlaces || typeof enlaces !== 'object') return;
        guardar(CLAVE, enlaces, MINUTOS);
        aplicar(enlaces);
      })
      .catch(() => { /* los enlaces escritos en el HTML siguen sirviendo */ });
  });
}
