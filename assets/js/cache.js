/* Caché pequeña sobre `localStorage`, con caducidad.

   Existe por una razón de carga, no de velocidad: las dos peticiones que
   hace la página (la API de descargas y los Releases de GitHub) no cambian
   más de una vez al día, y GitHub limita a 60 peticiones por hora POR
   DIRECCIÓN IP. Un edificio entero de la UTS sale a internet por una o dos
   direcciones, así que sin caché el visitante número 61 de la hora ya no ve
   novedades. Con ella, cada navegador pregunta una vez y se calla. */

/** Devuelve el valor guardado bajo `clave` si aún no caducó; si no, null. */
export function leer(clave) {
  try {
    const crudo = localStorage.getItem(clave);
    if (!crudo) return null;
    const { hasta, valor } = JSON.parse(crudo);
    return Date.now() < hasta ? valor : null;
  } catch (e) {
    return null;
  }
}

/** Guarda `valor` durante `minutos`. Si no hay almacenamiento, no pasa nada. */
export function guardar(clave, valor, minutos) {
  try {
    localStorage.setItem(clave, JSON.stringify({
      hasta: Date.now() + minutos * 60 * 1000,
      valor
    }));
  } catch (e) { /* navegación privada o cuota llena: se vive sin caché */ }
}

/**
 * `fetch` con plazo. Si el servidor tarda, la página se queda con lo que ya
 * tiene: nadie debería mirar un botón muerto porque una API va lenta.
 */
export function pedirJson(url, ms) {
  const corta = new AbortController();
  const plazo = setTimeout(() => corta.abort(), ms);
  return fetch(url, { signal: corta.signal, priority: 'low' })
    .then((res) => {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .finally(() => clearTimeout(plazo));
}

/** Corre `fn` cuando el navegador esté ocioso, o enseguida si no sabe esperar. */
export function cuandoSobre(fn) {
  if ('requestIdleCallback' in window) requestIdleCallback(fn, { timeout: 2500 });
  else setTimeout(fn, 300);
}
