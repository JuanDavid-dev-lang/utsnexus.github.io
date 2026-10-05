# -*- coding: utf-8 -*-
"""Genera las imágenes derivadas del logotipo: iconos de la app, favicon.ico y
la imagen de Open Graph (1200×630) que ven Twitter, WhatsApp y compañía.

Se generan y no se dibujan a mano por la misma razón que el documento
imprimible: si cambia el logotipo, se corre esto y salen todas iguales.

    python herramientas/generar-imagenes.py
"""
import os
import pathlib
import subprocess
from PIL import Image

D = os.path.dirname(os.path.abspath(__file__))
SITIO = os.path.dirname(D)
ASSETS = os.path.join(SITIO, 'assets')

MARCA = (20, 77, 55)        # --marca

logo = Image.open(os.path.join(ASSETS, 'logo.png')).convert('RGBA')


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
#    Se dibuja con HTML (herramientas/og.html) y la fotografía un Chrome o un
#    Edge sin ventana: así lleva las mismas fuentes, degradados y planilla que
#    el hero, cosa que con PIL habría que imitar a mano.
#
#    WhatsApp no muestra la imagen si pesa demasiado (pasados unos 300 KB se
#    queda con el título solo), así que se comprueba al final.
NAVEGADORES = (
    r'C:\Program Files\Google\Chrome\Application\chrome.exe',
    r'C:\Program Files (x86)\Google\Chrome\Application\chrome.exe',
    r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',
    r'C:\Program Files\Microsoft\Edge\Application\msedge.exe',
    '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
)
OG_MAX_KB = 300


def fotografiar_og():
    navegador = next((n for n in NAVEGADORES if os.path.exists(n)), None)
    if not navegador:
        print('og.png: no encontré Chrome ni Edge; se queda la que había')
        return
    plantilla = pathlib.Path(D, 'og.html').as_uri()
    destino = os.path.join(ASSETS, 'og.png')
    subprocess.run([
        navegador, '--headless=new', '--disable-gpu', '--hide-scrollbars',
        '--force-device-scale-factor=1', '--window-size=1200,630',
        # Tiempo para que lleguen las fuentes de Google antes de la foto.
        '--virtual-time-budget=10000',
        '--screenshot=' + destino, plantilla,
    ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    Image.open(destino).convert('RGB').save(destino, optimize=True)
    kb = os.path.getsize(destino) // 1024
    if kb > OG_MAX_KB:
        print(f'AVISO: og.png pesa {kb} KB; WhatsApp puede no mostrarla')


fotografiar_og()

for nombre in ('icono-512.png', 'icono-192.png', 'apple-touch-icon.png', 'og.png'):
    ruta = os.path.join(ASSETS, nombre)
    print(nombre, os.path.getsize(ruta) // 1024, 'KB')
print('favicon.ico', os.path.getsize(os.path.join(SITIO, 'favicon.ico')) // 1024, 'KB')
