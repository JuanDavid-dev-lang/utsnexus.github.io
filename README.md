# UTS Nexus Académico — página de descarga

Sitio estático desde el que los docentes de las Unidades Tecnológicas de
Santander descargan las aplicaciones de **UTS Nexus Académico** para Windows y
Android.

Hecho por el **Grupo CIAI**. Desarrollo principal: **Juan David Gómez Vargas**.

- Aplicaciones: <https://github.com/JuanDavid-dev-lang/UTS_Nexus_Academico>

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

Los dos botones apuntan a la última publicación del repositorio de las
aplicaciones:

```
https://github.com/JuanDavid-dev-lang/UTS_Nexus_Academico/releases/latest
```

No hay que actualizar esta página cuando salga una versión nueva: GitHub
resuelve `latest` solo. **Hasta que exista la primera publicación etiquetada,
ese enlace da 404.**

## La planilla del hero

No es una imagen ni una captura. `assets/app.js` calcula las definitivas con
los mismos pesos que el motor de calificaciones real —C1 33% + C2 33% +
C3 34%, se aprueba desde 3.0— y coloca la línea del umbral midiendo el DOM ya
pintado. Si se cambia una nota de ejemplo, la definitiva, el orden de las filas
y la línea se recolocan solos.

Las notas de ejemplo están en la constante `GRUPO`, al principio del archivo.
