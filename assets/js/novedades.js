/* Novedades: las dos últimas versiones, leídas de los Releases de GitHub.

   Las tarjetas van HORNEADAS en el HTML: se ven siempre, con o sin
   JavaScript y aunque un bloqueador corte la petición. Este guion solo las
   REEMPLAZA cuando la API responde con algo más nuevo. Si no responde (sin
   red, límite de peticiones), no pasa nada visible: nunca un error.

   La respuesta se guarda seis horas. GitHub da 60 peticiones por hora por
   dirección IP, y un campus entero comparte una o dos. */

import { leer, guardar, pedirJson, cuandoSobre } from './cache.js';

const API = 'https://api.github.com/repos/JuanDavid-dev-lang/UTS_Nexus_Releases/releases?per_page=2';
const CLAVE = 'uts-novedades';
const MINUTOS = 6 * 60;
const PLAZO_MS = 6000;

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

function tarjeta(release) {
  const articulo = document.createElement('article');
  articulo.className = 'tarjeta revela revela--visto';

  const titulo = document.createElement('h3');
  titulo.className = 'tarjeta__titulo';
  titulo.textContent = String(release.name || release.tag_name || '')
    .replace('UTS Nexus Académico ', '');
  articulo.appendChild(titulo);

  const fecha = document.createElement('p');
  fecha.className = 'tarjeta__fecha';
  fecha.textContent = fechaLarga(release.published_at);
  articulo.appendChild(fecha);

  const cambios = titulares(release.body);
  if (cambios.length) {
    const lista = document.createElement('ul');
    lista.className = 'tarjeta__cambios';
    cambios.forEach((cambio) => {
      const item = document.createElement('li');
      item.textContent = cambio;
      lista.appendChild(item);
    });
    articulo.appendChild(lista);
  }
  return articulo;
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
    contenedor.replaceChildren(...releases.map(tarjeta));
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
      .catch(() => { /* quedan las tarjetas horneadas en el HTML */ });
  });
}
