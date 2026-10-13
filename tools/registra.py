"""Registra un modulo nei tre indici dei contenuti. Uso: python3 tools/registra.py 4  (aggiunge m4 dopo m3)"""
import sys, pathlib
n = int(sys.argv[1]); prev = n - 1
ROOT = pathlib.Path(__file__).resolve().parent.parent / 'src' / 'content'
for f, kind in [('index.ts', 'CONCETTI'), ('orale.ts', 'ORALE'), ('lezioni.ts', 'LEZIONI')]:
    p = ROOT / f; s = p.read_text(); fname = {'CONCETTI': 'concetti', 'ORALE': 'orale', 'LEZIONI': 'lezioni'}[kind]
    a, b = f'M{prev}_{kind}', f'M{n}_{kind}'
    if b in s: continue
    s = s.replace(f"import {{ {a} }} from './m{prev}/{fname}';", f"import {{ {a} }} from './m{prev}/{fname}';\nimport {{ {b} }} from './m{n}/{fname}';")
    s = s.replace(f"...{a}]", f"...{a}, ...{b}]")
    p.write_text(s)
print('ok')
