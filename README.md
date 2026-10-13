# SDC — app per l'orale di Scienza delle Costruzioni

Web app di studio per l'esame **solo orale** di Scienza delle Costruzioni, costruita sulla dispensa del corso (unica fonte). Lezioni guidate da «professore», modelli 3D e diagrammi interattivi calcolati da un motore verificato, ripasso distanziato e preparazione dell'orale.

**Stato:** Fase 1 completata: app pubblicata con il modulo M1 (algebra tensoriale). Vedi `RIPARTENZA.md`.

**Comandi:** `npm test` (suite), `npx tsc --noEmit -p .`, `npm run build:artifact` (→ `dist-artifact/sdc.html`), `python3 tools/verifica_ui.py [cartella-screenshot]` (verifica nel browser).

## Dove sono le cose
- `tools/testi/cap-01.md … cap-06.md` — trascrizione fedele della dispensa (formule in LaTeX, pagine, definizioni e teoremi numerati, domande d'orale).
- `ANALISI.md` — inventario, moduli, 57 concetti con prerequisiti e riferimenti, convenzioni, modelli visivi.
- `NOTE_FONTI.md` — dubbi e scelte sulla dispensa (NF-xx).
- `tools/grafo.py` — grafo dei concetti (fonte dei contenuti); `python3 tools/analisi.py` rigenera ANALISI.md e verifica il grafo.
- `docs/stato-sdc.html` — infografica di stato (pubblicata come artifact).
- `src/engine/` motore (tensori, campi) · `src/content/mN/` concetti, lezioni, domande d'orale · `src/three/` modelli 3D · `src/diagrams/` SVG · `src/learning/` FSRS, padronanza, sessione, piano · `src/storage/` stato e sincronizzazione · `src/ui/` pagine.

## Architettura
React 18 + TypeScript + Vite, KaTeX, three.js, SVG, Vitest + Playwright, ts-fsrs, build in un unico HTML pubblicato come artifact claude.ai; infrastruttura ripresa da SEIMAFI. Dettagli nel prompt di partenza del progetto.
