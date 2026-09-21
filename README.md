# UTS Nexus Académico — página de descarga

Sitio estático desde el que los docentes de las Unidades Tecnológicas de
Santander descargan las aplicaciones de **UTS Nexus Académico** para Windows y
Android.

Hecho por el **Grupo CIAI**. Desarrollo principal: **Juan David Gómez Vargas**.

- Instaladores: <https://github.com/JuanDavid-dev-lang/UTS_Nexus_Releases/releases/latest>

---

## Qué hay aquí

```
index.html                 la página de descarga
requerimientos-uml.html    el documento: requisitos y cuatro diagramas UML
documento-imprimible.html  la fuente del PDF (se GENERA, no se edita a mano)
404.html                   página de error, con código 404 de verdad

assets/css/
  tokens.css     colores (claro y oscuro), tipografía, radios y MOVIMIENTO
  base.css       reset, utilidades, tipografía de portada, botones
  barra.css      barra superior, interruptor de tema, menú de teléfono
  hero.css       hero y planilla de la portada
  secciones.css  descargas, qué hace, novedades, necesidad, créditos, pie, 404
  documento.css  portada del documento, requisitos, diagramas y pestañas
  movimiento.css revelar al entrar, transiciones entre páginas, reduced-motion
  imprimir.css   hoja de impresión del documento (solo el imprimible)

assets/js/
  tema-inicial.js  ÚNICO guion síncrono: aplica el tema guardado antes de
                   pintar y marca `html.js`
  app.js           punto de entrada (módulo ES); llama a los demás
  tema.js          los tres botones de tema
  menu.js          cierra el menú de teléfono al elegir una sección
  barra.js         progreso de lectura y enlace de la sección activa
  revelar.js       observador que anima las tarjetas al entrar en pantalla
  planilla.js      anima las filas, traza la línea del 3.0 y deja CAMBIAR
                   una nota: recalcula, reordena y mueve la línea
  descargas.js     sustituye los enlaces si la administración configuró otros
                   y sella la tarjeta del equipo desde el que se mira
  novedades.js     las dos últimas versiones y la «versión actual», desde
                   los Releases de GitHub
  pestanas.js      pestañas accesibles de los diagramas UML
  cache.js         caché con caducidad en localStorage y fetch con plazo

assets/logo.png, favicon.png, apple-touch-icon.png, icono-192.png,
icono-512.png, og.png      imágenes (las cuatro últimas se generan)
favicon.ico                lo piden los navegadores aunque nadie lo enlace

robots.txt, sitemap.xml, llms.txt, site.webmanifest
herramientas/armar-documento.py     genera documento-imprimible.html
herramientas/generar-imagenes.py    genera iconos, favicon.ico y og.png
.nojekyll                  desactiva Jekyll en GitHub Pages
```

Cada archivo hace una cosa y cabe en una pantalla larga. Los estilos se
cargan como siete `<link>` en vez de uno: con HTTP/2 llegan en paralelo, y
quien toca la barra no tiene que leer la planilla.

### El logotipo

Es el mismo archivo que usan el escritorio y el móvil
(`flutter_app/assets/logo.png` y `desktop/src/assets/logo.png` en el
repositorio de las aplicaciones, idénticos entre sí), reescalado de 1024 px a
256 px para no cargar 639 KB en una barra de 36 px.

Si la marca cambia, hay que volver a exportarlo desde ese original para que los
tres clientes y esta página no se desincronicen.

Sin dependencias, sin compilación y sin gestor de paquetes. Se abre
`index.html` en el navegador y ya.

## Ver la página localmente

```bash
python -m http.server 8000
# después: http://localhost:8000
```

Abrir el archivo directamente con doble clic también funciona.

## Publicar

GitHub Pages sirve la rama `main` tal cual:

**Settings → Pages → Source: Deploy from a branch → `main` / `(root)`**

Cada `git push` a `main` republica el sitio en uno o dos minutos.

> **Sobre la dirección.** Un sitio *de usuario* en GitHub exige que el
> repositorio se llame exactamente `<usuario>.github.io`. Como este se llama
> `utsnexus.github.io` y el usuario es `JuanDavid-dev-lang`, se publica como
> sitio *de proyecto*, en una subruta:
>
> `https://juandavid-dev-lang.github.io/utsnexus.github.io/`
>
> Por eso todas las rutas del HTML son **relativas** (`assets/css/base.css`, no
> `/assets/css/base.css`): con una ruta absoluta los estilos no cargarían en una
> subruta. Si más adelante se renombra el repositorio, la página sigue
> funcionando sin tocar nada… salvo lo que va con dirección absoluta porque
> no le queda otra: `404.html` (se sirve desde cualquier profundidad), las
> etiquetas `canonical` y `og:image`, el `sitemap.xml` y el `robots.txt`.
> Todos llevan `https://juandavid-dev-lang.github.io/utsnexus.github.io/`
> escrito; un buscar-y-reemplazar los cambia.
>
> **`robots.txt` y `llms.txt` solo cuentan en la raíz del dominio.** Bajo la
> subruta actual los rastreadores no los leen: quedan escritos para el día en
> que el sitio tenga dominio propio o pase a ser sitio de usuario.

## Los enlaces de descarga

Los dos botones apuntan a un archivo concreto de Dropbox: el `.exe` y el `.apk`.

**No hay que tocarlos cuando salga una versión nueva.** El workflow `Release`
del repositorio de las aplicaciones sube los instaladores recién compilados
*encima* de esos dos archivos (`mode=overwrite`), así que el enlace es el mismo
y lo que entrega es la versión última. El detalle está en
`docs/PUBLICAR_VERSION.md` de aquel repositorio.

Consecuencia de sobrescribir en vez de subir un archivo nuevo: el **nombre**
del archivo se queda congelado en el de la primera subida (`…2.3.3…`) aunque
dentro vaya una versión posterior. Para cambiarlo hay que subir un archivo con
otro nombre, y eso son enlaces nuevos aquí y en el workflow.

Los enlaces van sin el parámetro `st=` que Dropbox añade al copiarlos: es un
testigo temporal y caduca. El que da acceso es `rlkey`, y ese no caduca.

Son enlaces **por archivo**, nunca el de la carpeta: el de la carpeta
(`/scl/fo/…`) con `dl=1` descarga un ZIP con todo lo que haya dentro, así que
el botón de Windows acabaría trayendo también el `.apk`. Y terminan en `dl=1`,
no `dl=0`: con `dl=0` se abre el visor de Dropbox en vez de descargarse.

Si hay que apuntarlos a otro sitio sin desplegar la página, `assets/js/descargas.js`
consulta al arrancar los enlaces que la administración haya guardado en el
servidor (Configuración → Enlaces de descarga, en el escritorio) y sustituye los
del HTML. Si el servidor no contesta en cuatro segundos, se queda con estos, que
siempre sirven.

Esa consulta estuvo desactivada un rato: el servidor devolvía la publicación de
GitHub como **valor por defecto** y pisaba los enlaces de Dropbox nada más
cargar la página. Ahora los valores por defecto van vacíos y un campo vacío no
se aplica, así que el servidor solo habla cuando alguien ha configurado algo.
Si se vuelve a tocar esto, esa es la propiedad que hay que conservar.

El repositorio de instaladores
(<https://github.com/JuanDavid-dev-lang/UTS_Nexus_Releases/releases/latest>)
sigue publicándose igual y es de donde se actualizan solas las apps ya
instaladas; la página solo ya no depende de él para descargar.

## La planilla del hero

No es una imagen ni una captura. Las filas van **escritas en el HTML**, con la
definitiva ya calculada con los pesos del motor real —C1 33% + C2 33% +
C3 34%, se aprueba desde 3.0—: así existen sin JavaScript, las lee un
buscador y están en el primer fotograma.

Con JavaScript, además, se puede tocar: los botones «− / +» cambian el corte
2 de Laura Gómez, y `assets/js/planilla.js` recalcula con los mismos pesos,
reordena las filas (con la API de transiciones de vista, donde exista) y
recoloca la línea del 3.0. En cinco toques Laura pasa de reprobar a
adelantar a Camilo: el recorrido entero de lo que hace el producto.

Las notas de ejemplo van en los atributos `data-c1`, `data-c2` y `data-c3`
de cada fila; la que se puede cambiar lleva `data-editable`. Si se cambia
una nota a mano hay que dejar coherente la definitiva escrita en la celda.

## Carga y concurrencia

No hay servidor propio detrás de la página. GitHub Pages la sirve desde una
CDN, y los instaladores bajan de Dropbox y de GitHub Releases: mil docentes
descargando a la vez no tocan nada nuestro.

Lo único que sí golpea a un servidor son dos peticiones opcionales que hace
el navegador después de pintar:

| Petición | Para qué | Protección |
|---|---|---|
| `api.github.com/…/releases` | las dos últimas novedades | caché 6 h en el navegador, plazo 6 s |
| `3-14-147-55.sslip.io/api/v1/descargas` | enlaces configurados por la administración | caché 1 h, plazo 4 s |

Las dos se lanzan con `requestIdleCallback` (después de la primera pintura),
se guardan en `localStorage` con caducidad, y si fallan la página se queda con
lo que trae escrito. GitHub limita a 60 peticiones por hora **por IP**, y un
edificio de la UTS sale por una o dos; sin la caché, el visitante 61 de la
hora ya no vería novedades.

## SEO y seguridad

- Todo el contenido va en el HTML: `view-source:` muestra la página entera,
  no un `<div id="root">` vacío.
- Un solo `<h1>` por página; `canonical` absoluta; Open Graph y Twitter Card
  con `assets/og.png` (1200×630); JSON-LD (`SoftwareApplication`,
  `Organization`, `WebSite`, `TechArticle`).
- `404.html` responde con código 404 de verdad (GitHub Pages lo hace solo)
  y no redirige. Un `.js` o `.png` que falte también devuelve 404.
- **CSP** en una etiqueta `<meta>` (GitHub Pages no deja poner cabeceras):
  sin guiones ni estilos en línea, por eso no hay `unsafe-inline` ni hashes
  que recalcular. Lo que una `meta` no puede cubrir —`frame-ancestors`,
  `X-Frame-Options`, HSTS— exige un servidor propio o Cloudflare delante.
- No hay sourcemaps porque no hay compilación. Ningún guion escribe en la
  consola.

## Regenerar lo que se genera

```bash
python herramientas/armar-documento.py   # documento-imprimible.html
python herramientas/generar-imagenes.py  # iconos, favicon.ico, og.png
```

Después de armar el documento, abrirlo en Chrome, Ctrl+P, «Guardar como
PDF», y reemplazar `UTS_Nexus_Necesidad_Requerimientos_UML.pdf`.
