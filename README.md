# SDC — app per l'orale di Scienza delle Costruzioni

Web app di studio per l'esame **solo orale** di Scienza delle Costruzioni, costruita sulla dispensa del corso (unica fonte). Una lezione guidata per concetto (il «professore» costruisce il concetto passo passo; le vecchie schede sono confluite nelle lezioni), modelli 3D e diagrammi interattivi calcolati da un motore verificato, ripasso distanziato e preparazione dell'orale.

**Stato:** completa (Fasi 0–4): 8 moduli, 57 concetti, ciascuno con la sua lezione (riscritte il 17/10/2026 secondo `docs/GUIDA_LEZIONI.md`: 948 passi, 175 domande di richiamo dentro le lezioni), 94 domande d'orale (tutte le 74 della dispensa), modelli 3D e diagrammi, mappa dei concetti, simulatore d'orale, piano di studio. Tutte le note sulla fonte sono risolte. App pubblicata: https://claude.ai/artifact/M9zqUrr9t4zY2Fgqos87EJ. Vedi `RIPARTENZA.md`.

**Comandi:** `npm test` (suite), `npx tsc --noEmit -p .`, `npm run build:artifact` (→ `dist-artifact/sdc.html`), `python3 tools/verifica_ui.py [cartella-screenshot] [--lezioni=m1,m2]` (verifica nel browser; senza `--lezioni` percorre tutte le lezioni).

## Dove sono le cose
- `tools/testi/cap-01.md … cap-06.md` — trascrizione fedele della dispensa (formule in LaTeX, pagine, definizioni e teoremi numerati, domande d'orale).
- `ANALISI.md` — inventario, moduli, 57 concetti con prerequisiti e riferimenti, convenzioni, modelli visivi.
- `NOTE_FONTI.md` — dubbi e scelte sulla dispensa (NF-xx).
- `tools/grafo.py` — grafo dei concetti (fonte dei contenuti); `python3 tools/analisi.py` rigenera ANALISI.md e verifica il grafo.
- `docs/stato-sdc.html` — infografica di stato (pubblicata come artifact).
- `src/engine/` motore (tensori, campi) · `src/content/mN/` concetti, lezioni, domande d'orale · `src/three/` modelli 3D · `src/diagrams/` SVG · `src/learning/` FSRS, padronanza, sessione, piano · `src/storage/` stato e sincronizzazione · `src/ui/` pagine.

## Architettura
React 19 + TypeScript + Vite, KaTeX, three.js, SVG, Vitest + Playwright, ts-fsrs, build in un unico HTML pubblicato come artifact claude.ai; infrastruttura ripresa da SEIMAFI. Dettagli nel prompt di partenza del progetto.
