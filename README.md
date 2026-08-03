# UTS Nexus Académico — página de descarga

Sitio estático desde el que los docentes de las Unidades Tecnológicas de
Santander descargan las aplicaciones de **UTS Nexus Académico** para Windows y
Android.

Hecho por el **Grupo CIAI**. Desarrollo principal: **Juan David Gómez Vargas**.

- Instaladores: <https://github.com/JuanDavid-dev-lang/UTS_Nexus_Releases/releases/latest>

---

## Qué hay aquí

```
index.html            la página completa
assets/styles.css     estilos
assets/app.js         la planilla del hero
assets/logo.png       logotipo (256 px)
assets/favicon.png    ícono de pestaña (64 px)
.nojekyll             desactiva Jekyll en GitHub Pages
```

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
> Por eso todas las rutas del HTML son **relativas** (`assets/styles.css`, no
> `/assets/styles.css`): con una ruta absoluta los estilos no cargarían en una
> subruta. Si más adelante se renombra el repositorio, la página sigue
> funcionando sin tocar nada.

## Los enlaces de descarga

Los dos botones bajan la carpeta de Dropbox donde están los instaladores. El
`dl=1` del final es lo que hace que descargue en vez de abrir el visor:

```
https://www.dropbox.com/scl/fo/6eqhwwq7qyp2f3gi5bvve/ALiY2eeTlRAfSERJIKHZ0w4?rlkey=nsav5fvvvnzjokt8my5swvxit&dl=1
```

Es un enlace de **carpeta**, no de archivo, así que descarga un ZIP con todo lo
que haya dentro: el instalador de Windows y el `.apk` juntos. Por eso los dos
botones llevan al mismo sitio y la página lo avisa. Para que cada botón baje
solo su archivo hacen falta enlaces por archivo, que Dropbox genera uno a uno
(clic derecho sobre el archivo → copiar enlace) y también terminan en `dl=1`.

Debajo de cada botón hay una salida a la publicación de GitHub, para quien
quiera un solo archivo:

```
https://github.com/JuanDavid-dev-lang/UTS_Nexus_Releases/releases/latest
```

Ese enlace no hay que tocarlo nunca: GitHub resuelve `latest` solo. El de
Dropbox sí, cada vez que se suba una versión nueva a la carpeta —los
instaladores no llegan ahí por su cuenta.

El repositorio del código es privado. El que se enlaza aquí es público y no
tiene una línea de código: solo los instaladores publicados.

## La planilla del hero

No es una imagen ni una captura. `assets/app.js` calcula las definitivas con
los mismos pesos que el motor de calificaciones real —C1 33% + C2 33% +
C3 34%, se aprueba desde 3.0— y coloca la línea del umbral midiendo el DOM ya
pintado. Si se cambia una nota de ejemplo, la definitiva, el orden de las filas
y la línea se recolocan solos.

Las notas de ejemplo están en la constante `GRUPO`, al principio del archivo.
