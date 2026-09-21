/* Novedades: las dos últimas versiones, leídas de los Releases de GitHub.

   Las entradas van HORNEADAS en el HTML: se ven siempre, con o sin
   JavaScript y aunque un bloqueador corte la petición. Este guion solo las
   REEMPLAZA cuando la API responde con algo más nuevo, y con la misma
   respuesta actualiza la «versión actual» de la sección de descargas: una
   petición, dos usos. Si no responde (sin red, límite de peticiones), no
   pasa nada visible: nunca un error.

   La respuesta se guarda seis horas. GitHub da 60 peticiones por hora por
   dirección IP, y un campus entero comparte una o dos. */

import { leer, guardar, pedirJson, cuandoSobre } from './cache.js';

const API = 'https://api.github.com/repos/JuanDavid-dev-lang/UTS_Nexus_Releases/releases?per_page=2';
const CLAVE = 'uts-novedades';
const MINUTOS = 6 * 60;
const PLAZO_MS = 6000;

/** «1 sept 2026»: corta, porque va en una columna angosta de la línea. */
function fechaCorta(iso) {
  const fecha = new Date(iso);
  if (isNaN(fecha)) return '';
  // Armada a mano: el formato corto del navegador da «1 de sept de 2026»,
  // y los dos «de» no caben en la columna.
  const mes = fecha.toLocaleDateString('es-CO', { month: 'short' }).replace('.', '');
  return fecha.getDate() + ' ' + mes + ' ' + fecha.getFullYear();
}

/** «1 de septiembre de 2026»: para la versión actual, donde hay sitio. */
function fechaLarga(iso) {
  const fecha = new Date(iso);
  if (isNaN(fecha)) return '';
  return fecha.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
}

/** Los titulares de las notas (líneas «### …») resumen los cambios. */
function titulares(cuerpo) {
  return String(cuerpo || '')
    .split('\n')
    .filter((linea) => linea.startsWith('### '))
    .map((linea) => linea.slice(4).trim())
    .filter(Boolean);
}

function nombreCorto(release) {
  return String(release.name || release.tag_name || '').replace('UTS Nexus Académico ', '');
}

function hito(release) {
  const li = document.createElement('li');
  li.className = 'hito revela revela--visto';

  const fecha = document.createElement('time');
  fecha.className = 'hito__fecha';
  fecha.dateTime = String(release.published_at || '').slice(0, 10);
  fecha.textContent = fechaCorta(release.published_at);
  li.appendChild(fecha);

  const cuerpo = document.createElement('div');
  cuerpo.className = 'hito__cuerpo';

  const titulo = document.createElement('h3');
  titulo.className = 'hito__titulo';
  titulo.textContent = nombreCorto(release);
  cuerpo.appendChild(titulo);

  const cambios = titulares(release.body);
  if (cambios.length) {
    const lista = document.createElement('ul');
    lista.className = 'hito__cambios';
    cambios.forEach((cambio) => {
      const item = document.createElement('li');
      item.textContent = cambio;
      lista.appendChild(item);
    });
    cuerpo.appendChild(lista);
  }

  li.appendChild(cuerpo);
  return li;
}

/** «Versión actual v2.16.0 · 1 de septiembre de 2026», con la más nueva. */
function pintarVersion(release) {
  const nodo = document.getElementById('version-actual');
  if (!nodo || !release.tag_name) return;
  const punto = nodo.querySelector('.version__punto');

  const etiqueta = document.createElement('b');
  etiqueta.textContent = release.tag_name;
  const fecha = document.createElement('time');
  fecha.dateTime = String(release.published_at || '').slice(0, 10);
  fecha.textContent = fechaLarga(release.published_at);

  nodo.replaceChildren();
  if (punto) nodo.appendChild(punto);
  nodo.append('Versión actual ', etiqueta, ' · ', fecha);
}

/** Se queda solo con lo que la página usa; el resto no merece ocupar caché. */
function resumir(releases) {
  return releases.map((r) => ({
    name: r.name, tag_name: r.tag_name, published_at: r.published_at,
    body: titulares(r.body).map((t) => '### ' + t).join('\n')
  }));
}

export function iniciarNovedades() {
  const contenedor = document.getElementById('novedades-lista');
  if (!contenedor || !window.fetch) return;

  function pintar(releases) {
    if (!Array.isArray(releases) || !releases.length) return;
    contenedor.replaceChildren(...releases.map(hito));
    pintarVersion(releases[0]);
  }

  const guardadas = leer(CLAVE);
  if (guardadas) { pintar(guardadas); return; }

  cuandoSobre(() => {
    pedirJson(API, PLAZO_MS)
      .then((releases) => {
        if (!Array.isArray(releases) || !releases.length) return;
        const breves = resumir(releases);
        guardar(CLAVE, breves, MINUTOS);
        pintar(breves);
      })
      .catch(() => { /* quedan las entradas horneadas en el HTML */ });
  });
}
