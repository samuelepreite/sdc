"""Genera docs/stato-sdc.html (infografica di stato) da docs/stato.json. Uso: python3 tools/stato.py"""
import json, pathlib, html
ROOT = pathlib.Path(__file__).resolve().parent.parent
d = json.loads((ROOT / 'docs' / 'stato.json').read_text())
head = (ROOT / 'docs' / 'stato-head.html').read_text()
li = lambda xs: '\n'.join(f'        <li>{x}</li>' for x in xs)
ph = '\n'.join(f'      <div class="ph {p.get("cls","")}"><b>{p["t"]}</b><span>{p["s"]}</span></div>' for p in d['fasi'])
nums = '\n'.join(f'      <div class="n{" warn" if n.get("warn") else ""}"><strong>{n["v"]}</strong><span>{n["l"]}</span></div>' for n in d['numeri'])
qs = '\n'.join(f'      <li>{x}</li>' for x in d['da_te'])
out = f'''{head}<div class="wrap">
  <header>
    <div class="eyebrow">App per l'orale di Scienza delle Costruzioni · aggiornato {d["quando"]}</div>
    <h1>{d["titolo"]}</h1>
    <p class="lede">{d["lede"]}</p>
  </header>

  <section>
    <h2>Moduli (larghezza = pagine della dispensa)</h2>
    <div class="tube" id="tube"></div>
    <div class="legend"><span><i style="background:var(--done-soft)"></i>analizzato</span><span><i style="background:var(--done)"></i>nell'app</span><span><i style="background:var(--todo)"></i>da fare</span></div>
  </section>

  <section>
    <h2>Fasi</h2>
    <div class="phases">
{ph}
    </div>
  </section>

  <section>
    <h2>Numeri</h2>
    <div class="nums">
{nums}
    </div>
  </section>

  <div class="two">
    <section>
      <h2>Fatto</h2>
      <ul>
{li(d["fatto"])}
      </ul>
    </section>
    <section>
      <h2>Prossimo passo e scelte fatte da solo</h2>
      <ul>
{li(d["prossimo"])}
      </ul>
    </section>
  </div>

  <section class="q">
    <h2>Da te (quando puoi)</h2>
    <ol>
{qs}
    </ol>
  </section>
</div>
<script>
const M=[["M1","Algebra tensoriale",14,7],["M2","Deformazione",21,8],["M3","Tensione",30,9],["M4","Legami costitutivi",21,7],["M5","Elasticità isotropa",12,5],["M6","Saint-Venant I",27,8],["M7","Taglio e torsione",17,6],["M8","Criteri di resistenza",16,7]];
const DONE={json.dumps(d["moduli_fatti"])};
const t=document.getElementById('tube');
for(const [id,n,p,c] of M){{const d=document.createElement('div');d.className='seg';d.style.flex=p+' 1 0';
d.innerHTML=`<div class="bar"><div class="a"></div><div class="b" style="width:${{DONE.includes(id)?100:0}}%"></div></div><div class="lab">${{id}}</div><div class="sub">${{n}}<br>${{c}} concetti · ${{p}} pp.</div>`;t.appendChild(d);}}
</script>
'''
(ROOT / 'docs' / 'stato-sdc.html').write_text(out)
print('ok', len(out))
