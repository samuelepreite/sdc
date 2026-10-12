"""Rigenera ANALISI.md: testa + tabelle dal grafo + coda."""
import json, subprocess, os
here=os.path.dirname(__file__)
subprocess.run(["python3",os.path.join(here,"grafo.py"),os.path.join(here,"grafo.json")],check=True)
G=json.load(open(os.path.join(here,"grafo.json")))
import importlib.util
spec=importlib.util.spec_from_file_location("g",os.path.join(here,"grafo.py"));g=importlib.util.module_from_spec(spec);spec.loader.exec_module(g)
out=[]
for m,t in g.M.items():
    cs=[c for c in G if c['modulo']==m]
    out.append(f"\n### {m.upper()} — {t} · {len(cs)} concetti\n")
    out.append("| id | Concetto | § | Riferimenti | pp. | Prerequisiti | Derivazioni sviluppate dalla dispensa |")
    out.append("|---|---|---|---|---|---|---|")
    for c in cs:
        tit=c['titolo']+(f" *({c['flag']})*" if c['flag'] else "")
        out.append(f"| {c['id']} | {tit} | {c['par']} | {c['rif']} | {c['pagine']} | {', '.join(c['prereq']) or '—'} | {c['derivazioni']} |")
txt=open(os.path.join(here,"analisi-testa.md")).read()+"\n".join(out)+"\n"+open(os.path.join(here,"analisi-coda.md")).read()
open(os.path.join(here,"..","ANALISI.md"),"w").write(txt)
print("ANALISI.md:",len(txt),"caratteri")
