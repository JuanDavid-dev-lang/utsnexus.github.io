# -*- coding: utf-8 -*-
"""Arma el documento imprimible (necesidad + requerimientos + UML) y lo deja
listo para que el navegador lo convierta a PDF.

Se monta a partir de las mismas piezas que ya usan la portada y la página de
documentación, no de una copia escrita aparte: si el texto se corrige en un
sitio, el PDF sale corregido. Copiar las secciones a un archivo nuevo era
garantizar que dentro de dos meses el PDF dijera otra cosa que la web.
"""
import io, os, re

D = os.path.dirname(os.path.abspath(__file__))
SITIO = os.path.dirname(D)  # la raíz del sitio, un nivel por encima
SALIDA = os.path.join(SITIO, 'documento-imprimible.html')


def leer(ruta):
    return io.open(ruta, encoding='utf-8').read()


def entre(texto, inicio, fin):
    i = texto.index(inicio)
    j = texto.index(fin, i)
    return texto[i:j]


# ── Las tres secciones, sacadas de donde ya viven ───────────────────────────
indice = leer(os.path.join(SITIO, 'index.html'))
necesidad = entre(indice, '  <!-- ── 04 La necesidad ─', '  <!-- ── 05 Créditos ─')
# El papel rayado es un recurso de pantalla para separar secciones; en papel
# sería una banda gris. Y `revela` es la animación de entrada: aquí no hay
# guion que la dispare, así que la clase sobra.
necesidad = necesidad.replace('<section class="seccion seccion--rayada" id="necesidad">',
                              '<section class="seccion" id="necesidad">')
necesidad = necesidad.replace(' revela"', '"')

doc = leer(os.path.join(SITIO, 'requerimientos-uml.html'))
requerimientos = entre(doc, '  <!-- ── Requerimientos ─', '  <!-- ── Modelo UML ─')
uml = entre(doc, '  <!-- ── Modelo UML ─', '\n</main>')

# En papel no hay pestañas: los cuatro diagramas se enseñan a la vez y la
# alternativa en texto va abierta, porque es donde está explicado el dibujo y
# nadie puede desplegarla en una hoja.
requerimientos = requerimientos.replace(' revela"', '"')
uml = uml.replace('<details class="diag__texto">', '<details class="diag__texto" open>')
uml = uml.replace('<summary>Leer el diagrama en texto</summary>',
                  '<summary>El diagrama, en texto</summary>')
uml = re.sub(r'\s+tabindex="0"', '', uml)

# Las pestanas se van del todo, no solo se ocultan al imprimir. Este archivo no
# carga JavaScript, asi que serian cuatro botones que no hacen nada para quien
# lo abra en el navegador; y sin ellas, `role="tabpanel"` y `aria-labelledby`
# apuntarian a controles que no existen.
uml = re.sub(r'\s*<div class="diag__pestanas".*?</div>\s*\n', '\n', uml, flags=re.S)
uml = re.sub(r' role="tabpanel"', '', uml)
uml = re.sub(r' aria-labelledby="pest-[a-z]+"', '', uml)

# La franja verde de la sección UML no aplica en papel; el CSS de impresión ya
# la neutraliza, pero se quita también la clase para que no dependa de eso.
uml = uml.replace('<section class="seccion seccion--marca" id="uml">',
                  '<section class="seccion" id="uml">')

CABECERA = """<!doctype html>
<html lang="es-CO" data-tema="claro">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'self' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; base-uri 'none'; form-action 'none'; object-src 'none'">
<title>UTS Nexus Académico — Necesidad, requerimientos y modelo UML</title>
<meta name="author" content="Grupo CIAI — Unidades Tecnológicas de Santander">
<!-- Es la fuente del PDF, no una página para leer en el navegador: lo que
     hay que indexar es requerimientos-uml.html, que dice lo mismo. -->
<meta name="robots" content="noindex, follow">
<link rel="canonical" href="https://juandavid-dev-lang.github.io/utsnexus.github.io/requerimientos-uml.html">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/tokens.css">
<link rel="stylesheet" href="assets/css/base.css">
<link rel="stylesheet" href="assets/css/secciones.css">
<link rel="stylesheet" href="assets/css/documento.css">
<link rel="stylesheet" href="assets/css/imprimir.css">
</head>
<body>

<main class="envoltorio">

  <!-- ── Portada ────────────────────────────────────────────────────────── -->
  <section class="portada-pdf">
    <div class="portada-pdf__marca">
      <img src="assets/logo.png" alt="">
      <div>
        <p class="portada-pdf__institucion">Unidades Tecnológicas de Santander · Grupo CIAI</p>
        <p class="portada-pdf__producto">UTS Nexus Académico</p>
      </div>
    </div>

    <h1>Necesidad,<br>requerimientos y<br><span>modelo UML</span></h1>

    <p class="portada-pdf__resumen">
      Qué problema resuelve la plataforma, qué tiene que hacer, qué tiene que
      cumplir mientras lo hace, y cuatro vistas del sistema: quién lo usa, qué
      guarda, de qué piezas está hecho y qué ocurre cuando alguien escribe una
      nota.
    </p>

    <dl class="portada-pdf__ficha">
      <div><dt>Sistema</dt><dd>UTS Nexus Académico</dd></div>
      <div><dt>Institución</dt><dd>Unidades Tecnológicas de Santander</dd></div>
      <div><dt>Contenido</dt><dd>6 necesidades · 12 requisitos funcionales · 10 no funcionales · 4 diagramas UML</dd></div>
      <div><dt>Licencia</dt><dd>PolyForm Noncommercial 1.0.0</dd></div>
    </dl>
  </section>

  <!-- ── Contenido ──────────────────────────────────────────────────────── -->
  <section class="indice-pdf">
    <header class="seccion__cab">
      <h2 class="titulo2">Contenido</h2>
    </header>
    <ol>
      <li><strong>La necesidad</strong> — el problema que se resolvía a mano</li>
      <li><strong>Requerimientos</strong>
        <ul>
          <li>Funcionales · RF-01 a RF-12</li>
          <li>No funcionales · RNF-01 a RNF-10</li>
        </ul>
      </li>
      <li><strong>Modelo UML</strong>
        <ul>
          <li>Figura 1 · Casos de uso</li>
          <li>Figura 2 · Clases y modelo de datos</li>
          <li>Figura 3 · Componentes y despliegue</li>
          <li>Figura 4 · Secuencia: registrar una nota</li>
        </ul>
      </li>
    </ol>
  </section>

"""

PIE = """
</main>
</body>
</html>
"""

html = (CABECERA
        + necesidad.rstrip() + '\n\n'
        + requerimientos.rstrip() + '\n\n'
        + uml.rstrip() + '\n'
        + PIE)

io.open(SALIDA, 'w', encoding='utf-8', newline='\n').write(html)
print('escrito', SALIDA, len(html), 'bytes')
