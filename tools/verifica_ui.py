"""
Verifica dell'interfaccia sulla build in file unico (dist-single/index.html), con Chromium headless:
  - ogni pagina si apre senza errori in console, in chiaro e in scuro;
  - nessuno scorrimento orizzontale della pagina (desktop 1366 px e finestra stretta 820 px);
  - ogni lezione si percorre fino in fondo: «Avanti», domande (si sceglie la prima opzione), derivazioni, fine;
  - il modello 3D disegna davvero qualcosa (pixel non uniformi), anche simulando il fallimento degli shader PBR;
  - una domanda d'orale si espone e si registra.
Uso: python3 tools/verifica_ui.py [cartella-screenshot]
"""
import json, sys, pathlib
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
URL = (ROOT / 'dist-single' / 'index.html').as_uri()
SHOTS = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else None
CONCEPTS = [c['id'] for c in json.loads((ROOT / 'tools' / 'grafo.json').read_text()) if c['modulo'] == 'm1']

# simula uno shader PBR che non compila: il link dei programmi con «#define STANDARD» fallisce
SHADER_FAIL = """
(() => {
  for (const P of [WebGLRenderingContext.prototype, WebGL2RenderingContext.prototype]) {
    const src = P.shaderSource, att = P.attachShader, gp = P.getProgramParameter;
    P.shaderSource = function (s, t) { s.__src = t; return src.call(this, s, t); };
    P.attachShader = function (p, s) { (p.__sh ??= []).push(s); return att.call(this, p, s); };
    P.getProgramParameter = function (p, n) {
      if (n === this.LINK_STATUS && (p.__sh ?? []).some((s) => (s.__src ?? '').includes('#define STANDARD'))) return false;
      return gp.call(this, p, n);
    };
  }
})();
"""

problems: list[str] = []


def check(cond, msg):
    if not cond:
        problems.append(msg)
        print('  ✗', msg)


def overflow(page):
    return page.evaluate('document.documentElement.scrollWidth - document.documentElement.clientWidth')


def canvas_varies(page):
    # legge i pixel del canvas WebGL tramite una copia 2D: deviazione dei grigi > soglia = c'è un disegno
    return page.evaluate(
        """() => { const c = document.querySelector('.p3-canvas canvas'); if (!c) return -1;
        const t = document.createElement('canvas'); t.width = 120; t.height = 80; const g = t.getContext('2d');
        g.drawImage(c, 0, 0, 120, 80); const d = g.getImageData(0, 0, 120, 80).data; let s = 0, s2 = 0, n = 0;
        for (let i = 0; i < d.length; i += 4) { const v = (d[i] + d[i+1] + d[i+2]) / 3; s += v; s2 += v * v; n++; }
        return Math.sqrt(s2 / n - (s / n) ** 2); }"""
    )


def walk_lesson(page, cid):
    stuck = 0
    for _ in range(300):
        page.wait_for_timeout(40)
        if page.locator('button:has-text("Ho finito la lezione")').count():
            page.click('button:has-text("Ho finito la lezione")')
            return True
        if page.locator('.lesson-end .verdict').count():
            return True
        av = page.locator('.lesson-nav button.primary')
        if av.count() and av.is_enabled():
            av.click()
            stuck = 0
            continue
        act = '.lesson-step.active'
        if page.locator(f'{act} button:has-text("Cominciamo")').count():
            page.click(f'{act} button:has-text("Cominciamo")')
            continue
        opt = page.locator(f'{act} .deriv-next .option:not([disabled])')
        if opt.count():
            opt.first.click()
            page.click(f'{act} button:has-text("Scrivi il passaggio")')
            continue
        nx = page.locator(f'{act} button:has-text("Passaggio successivo")')
        if nx.count():
            nx.click()
            stuck = 0
            continue
        ro = page.locator(f'{act} .recall .options button:not([disabled]), {act} .recall .seg button:not([disabled]), {act} .recall button.primary')
        if ro.count():
            ro.first.click()
            stuck = 0
            continue
        stuck += 1
        if stuck < 10:
            page.wait_for_timeout(150)
            continue
        print('   [debug]', page.evaluate("location.hash"), page.locator('.lesson-nav').inner_html()[:300] if page.locator('.lesson-nav').count() else 'no nav', page.locator(act).count())
        problems.append(f'lezione {cid}: bloccata (nessuna azione possibile)')
        return False
    return False


def run(scheme, width, shader_fail=False):
    print(f'== {scheme} {width}px{" shader-fail" if shader_fail else ""}')
    with sync_playwright() as p:
        b = p.chromium.launch(args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        ctx = b.new_context(viewport={'width': width, 'height': 900}, color_scheme=scheme)
        if shader_fail:
            ctx.add_init_script(SHADER_FAIL)
        page = ctx.new_page()
        errs: list[str] = []
        page.on('pageerror', lambda e: errs.append(str(e)))
        page.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
        page.goto(URL)
        page.wait_for_selector('.page, .lesson')

        def visit(route, wait=200):
            page.evaluate(f"location.hash = '#/{route}'")
            page.wait_for_timeout(wait)
            check(overflow(page) <= 1, f'{scheme} {width}: scorrimento orizzontale in #/{route} ({overflow(page)} px)')

        if shader_fail:
            visit('lezione/c1.1', 1500)
            v = canvas_varies(page)
            check(v > 4, f'shader-fail: il modello 3D non disegna (deviazione {v:.1f})')
            check(not [e for e in errs if 'Uncaught' in e], f'shader-fail: errori {errs[:3]}')
            print('  deviazione pixel 3D con fallback:', round(v, 1))
            b.close()
            return

        for r in ['', 'moduli', 'orale', 'progressi', 'piano', 'fonti', 'impostazioni', 'altro', 'sessione'] + [f'modulo/m{i}' for i in range(1, 9)] + [f'concetto/{c}' for c in CONCEPTS]:
            visit(r)
        # scheda intera con modelli e diagrammi
        for c in CONCEPTS:
            visit(f'concetto/{c}')
            page.click('button:has-text("Scheda intera")')
            page.wait_for_timeout(400)
            check(overflow(page) <= 1, f'{scheme} {width}: scorrimento orizzontale nella scheda intera {c}')
        # lezioni complete
        for c in CONCEPTS:
            visit(f'lezione/{c}', 600)
            if c == 'c1.1':
                page.wait_for_timeout(1200)
                v = canvas_varies(page)
                check(v > 4, f'{scheme}: il modello 3D della lezione c1.1 non disegna (deviazione {v:.1f})')
                if SHOTS:
                    page.screenshot(path=str(SHOTS / f'lezione-c1.1-{scheme}-{width}.png'))
            ok = walk_lesson(page, c)
            check(ok, f'lezione {c} non completata')
            check(overflow(page) <= 1, f'{scheme} {width}: scorrimento orizzontale a fine lezione {c}')
            if SHOTS and c == 'c1.6':
                page.screenshot(path=str(SHOTS / f'lezione-c1.6-{scheme}-{width}.png'), full_page=False)
        # orale
        visit('orale')
        page.locator('.oral-list a').first.click()
        page.wait_for_timeout(300)
        page.click('button:has-text("Ho finito, confronta")')
        boxes = page.locator('.scaletta input[type=checkbox]')
        for i in range(min(2, boxes.count())):
            boxes.nth(i).check()
        page.locator('button:has-text("Registra")').click()
        check(page.locator('.oral-result').count() == 1, 'orale: esito non mostrato')
        if SHOTS:
            page.screenshot(path=str(SHOTS / f'orale-{scheme}-{width}.png'))
        for r in ['', 'progressi', 'piano']:
            visit(r, 300)
            if SHOTS:
                page.screenshot(path=str(SHOTS / f'{r or "oggi"}-{scheme}-{width}.png'))
        state = page.evaluate("JSON.parse(localStorage.getItem('sdc:v1'))")
        check(sum(1 for l in state['lessons'].values() if l.get('doneAt')) == len(CONCEPTS), 'non tutte le lezioni risultano finite nello stato')
        check(len(state['oral']) == 1, 'esposizione orale non salvata')
        real = [e for e in errs if 'favicon' not in e and 'fonts.g' not in e and 'ERR_TUNNEL' not in e]  # i font Google non sono raggiungibili da qui
        check(not real, f'{scheme} {width}: errori in console {real[:3]}')
        b.close()


if SHOTS:
    SHOTS.mkdir(parents=True, exist_ok=True)
run('light', 1366)
run('dark', 1366)
run('light', 820)
run('light', 1366, shader_fail=True)
print('\nPROBLEMI:', len(problems))
for x in problems:
    print(' -', x)
sys.exit(1 if problems else 0)
