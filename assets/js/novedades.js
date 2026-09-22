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

/* La ÚLTIMA publicada, no el listado.

   El listado (`/releases?per_page=N`) viene ordenado por la fecha de creación
   de cada entrada, que es la del commit etiquetado y no la de publicación. Con
   la numeración reiniciada —las 2.x son anteriores a las 1.x—, las primeras
   diez eran todas 2.x: la página anunciaba como versión actual una que ya no
   se reparte, y la 1.6.1 ni aparecía. Pedir más entradas no lo arregla, solo
   mueve el problema y engorda la respuesta.

   `/releases/latest` es lo que GitHub considera publicado ahora mismo, en una
   sola petición y sin traer el historial entero. La segunda entrada de la
   línea de tiempo es la que ya está escrita en el HTML. */
const API = 'https://api.github.com/repos/JuanDavid-dev-lang/UTS_Nexus_Releases/releases/latest';
// La caché guarda seis horas. Al corregir qué entrada es la más nueva hay que
// cambiar la clave: si no, quien ya tuviera la anterior seguiría viendo la
// versión equivocada hasta que caducara.
const CLAVE = 'uts-novedades-2';
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

/** Los titulares de las notas (líneas «## …» o «### …») resumen los cambios. */
function titulares(cuerpo) {
  return String(cuerpo || '')
    .split('\n')
    .filter((linea) => /^#{2,3} /.test(linea))
    .map((linea) => linea.replace(/^#{2,3} /, '').trim())
    // Fuera el que repite el nombre de la versión y el de «cómo actualizarte»:
    // ninguno de los dos es un cambio, y en una lista de tres líneas ocupan
    // el sitio de los que sí lo son.
    .filter((t) => Boolean(t) && !/UTS Nexus/.test(t) && !/actualizarte/i.test(t));
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

/** «Versión actual v1.6.1 · 22 de septiembre de 2026», con la más nueva. */
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

  /* La nueva entra arriba y la primera de las escritas en el HTML se queda
     debajo, salvo que sea la misma versión. Así la línea de tiempo sigue
     teniendo dos hitos con una sola petición. */
  function pintar(release) {
    if (!release || !release.tag_name) return;
    const nombre = nombreCorto(release);
    const previas = Array.from(contenedor.children).filter((li) => {
      const titulo = li.querySelector('.hito__titulo');
      return !titulo || titulo.textContent.trim() !== nombre;
    });
    contenedor.replaceChildren(hito(release), ...previas.slice(0, 1));
    pintarVersion(release);
  }

  const guardada = leer(CLAVE);
  if (guardada) { pintar(guardada); return; }

  cuandoSobre(() => {
    pedirJson(API, PLAZO_MS)
      .then((release) => {
        if (!release || !release.tag_name) return;
        const breve = resumir(release);
        guardar(CLAVE, breve, MINUTOS);
        pintar(breve);
      })
      .catch(() => { /* quedan las entradas horneadas en el HTML */ });
  });
}
