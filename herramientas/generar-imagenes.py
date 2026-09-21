# -*- coding: utf-8 -*-
"""Genera las imágenes derivadas del logotipo: iconos de la app, favicon.ico y
la imagen de Open Graph (1200×630) que ven Twitter, WhatsApp y compañía.

Se generan y no se dibujan a mano por la misma razón que el documento
imprimible: si cambia el logotipo, se corre esto y salen todas iguales.

    python herramientas/generar-imagenes.py
"""
import os
from PIL import Image, ImageDraw, ImageFont

D = os.path.dirname(os.path.abspath(__file__))
SITIO = os.path.dirname(D)
ASSETS = os.path.join(SITIO, 'assets')

MARCA = (20, 77, 55)        # --marca
MARCA_NOCHE = (13, 51, 37)  # --marca-noche
LIMA = (202, 210, 37)       # --lima
BLANCO = (255, 255, 255)

logo = Image.open(os.path.join(ASSETS, 'logo.png')).convert('RGBA')


def fuente(nombre, tam):
    """Una fuente del sistema; si no está, la de PIL. La OG se genera una vez
    en la máquina de quien publica, así que no hace falta empaquetar TTF."""
    for candidata in (nombre, 'arialbd.ttf', 'DejaVuSans-Bold.ttf'):
        try:
            return ImageFont.truetype(candidata, tam)
        except OSError:
            continue
    return ImageFont.load_default()


# ── Iconos de la app: el logotipo centrado sobre el verde con aire alrededor.
#    El margen es para los iconos «maskable» de Android, que recortan un
#    círculo: sin él, el logotipo pierde las puntas.
def icono(tam, margen):
    lienzo = Image.new('RGBA', (tam, tam), MARCA)
    interior = tam - 2 * margen
    l = logo.resize((interior, interior), Image.LANCZOS)
    lienzo.alpha_composite(l, (margen, margen))
    return lienzo


icono(512, 96).save(os.path.join(ASSETS, 'icono-512.png'), optimize=True)
icono(192, 36).save(os.path.join(ASSETS, 'icono-192.png'), optimize=True)
icono(180, 30).convert('RGB').save(os.path.join(ASSETS, 'apple-touch-icon.png'), optimize=True)

# ── favicon.ico: el logotipo tal cual, sin fondo, en los tres tamaños que
#    piden los navegadores. Va en la raíz porque los navegadores lo piden ahí
#    aunque nadie lo enlace, y un 404 en cada visita ensucia la consola.
logo.save(os.path.join(SITIO, 'favicon.ico'), sizes=[(16, 16), (32, 32), (48, 48)])

# ── Open Graph 1200×630 ───────────────────────────────────────────────────
W, H = 1200, 630
og = Image.new('RGB', (W, H), MARCA)
pintor = ImageDraw.Draw(og)

# Degradado diagonal como el del hero: de --marca a --marca-noche.
for y in range(H):
    t = y / H
    color = tuple(int(MARCA[i] + (MARCA_NOCHE[i] - MARCA[i]) * t) for i in range(3))
    pintor.line([(0, y), (W, y)], fill=color)

# Un halo lima arriba a la derecha, como el radial-gradient del hero.
halo = Image.new('RGBA', (W, H), (0, 0, 0, 0))
ph = ImageDraw.Draw(halo)
ph.ellipse([W - 520, -260, W + 200, 300], fill=LIMA + (34,))
og = Image.alpha_composite(og.convert('RGBA'), halo)
pintor = ImageDraw.Draw(og)

# Logotipo
og.alpha_composite(logo.resize((132, 132), Image.LANCZOS), (84, 76))

f_ojo = fuente('consolab.ttf', 22)
f_titulo = fuente('segoeuib.ttf', 74)
f_sub = fuente('segoeui.ttf', 30)
f_pie = fuente('segoeui.ttf', 24)

pintor.text((236, 96), 'UNIDADES TECNOLÓGICAS DE SANTANDER', font=f_ojo, fill=LIMA)
pintor.text((236, 132), 'UTS Nexus Académico', font=fuente('segoeuib.ttf', 40), fill=BLANCO)

pintor.text((84, 268), 'La planilla del semestre,', font=f_titulo, fill=BLANCO)
pintor.text((84, 352), 'con alertas y todo ya hechas.', font=f_titulo, fill=LIMA)

pintor.text((84, 470), 'Notas por corte, asistencia por minutos reales y riesgo académico.',
            font=f_sub, fill=(255, 255, 255, 214))

# Pie: plataformas, como una fila de distintivos.
x = 84
for etiqueta in ('Windows', 'Linux', 'Android', 'Gratis · Uso académico'):
    caja = pintor.textbbox((0, 0), etiqueta, font=f_pie)
    ancho = caja[2] - caja[0] + 36
    pintor.rounded_rectangle([x, 546, x + ancho, 546 + 46], radius=23,
                             outline=(255, 255, 255, 110), width=2)
    pintor.text((x + 18, 554), etiqueta, font=f_pie, fill=(255, 255, 255, 230))
    x += ancho + 14

og.convert('RGB').save(os.path.join(ASSETS, 'og.png'), optimize=True)

for nombre in ('icono-512.png', 'icono-192.png', 'apple-touch-icon.png', 'og.png'):
    ruta = os.path.join(ASSETS, nombre)
    print(nombre, os.path.getsize(ruta) // 1024, 'KB')
print('favicon.ico', os.path.getsize(os.path.join(SITIO, 'favicon.ico')) // 1024, 'KB')
