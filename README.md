# SDC — app per l'orale di Scienza delle Costruzioni

Web app di studio per l'esame **solo orale** di Scienza delle Costruzioni, costruita sulla dispensa del corso (unica fonte). Lezioni guidate da «professore», modelli 3D e diagrammi interattivi calcolati da un motore verificato, ripasso distanziato e preparazione dell'orale.

**Stato:** Fase 0 completata (analisi della fonte). L'app arriva dalla Fase 1. Vedi `RIPARTENZA.md`.

## Dove sono le cose
- `tools/testi/cap-01.md … cap-06.md` — trascrizione fedele della dispensa (formule in LaTeX, pagine, definizioni e teoremi numerati, domande d'orale).
- `ANALISI.md` — inventario, moduli, 57 concetti con prerequisiti e riferimenti, convenzioni, modelli visivi.
- `NOTE_FONTI.md` — dubbi e scelte sulla dispensa (NF-xx).
- `tools/grafo.py` — grafo dei concetti (fonte dei contenuti); `python3 tools/analisi.py` rigenera ANALISI.md e verifica il grafo.
- `docs/stato-sdc.html` — infografica di stato (pubblicata come artifact).

## Architettura (dalla Fase 1)
React 18 + TypeScript + Vite, KaTeX, three.js, SVG, Vitest + Playwright, ts-fsrs, build in un unico HTML pubblicato come artifact claude.ai; infrastruttura ripresa da SEIMAFI. Dettagli nel prompt di partenza del progetto.
