"""Fotografa una pagina della build in file unico: python3 tools/foto.py '#/lezione/c2.1' out.png [larghezza] [scorri_y]"""
import sys, pathlib
from playwright.sync_api import sync_playwright
ROOT = pathlib.Path(__file__).resolve().parent.parent
route, out = sys.argv[1], sys.argv[2]
w = int(sys.argv[3]) if len(sys.argv) > 3 else 1366
y = int(sys.argv[4]) if len(sys.argv) > 4 else 0
with sync_playwright() as p:
    b = p.chromium.launch(args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
    pg = b.new_page(viewport={'width': w, 'height': 900})
    pg.goto((ROOT / 'dist-single' / 'index.html').as_uri() + route)
    pg.wait_for_timeout(2500)
    if y:
        pg.mouse.wheel(0, y)
        pg.wait_for_timeout(600)
    pg.screenshot(path=out)
    b.close()
