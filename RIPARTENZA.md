# RIPARTENZA — leggere per primo

## §0 Stato dell'ultima sessione
**FINITA alle 19:30 del 12/10/2026** (sessione 1, Fase 0).
- Fatto: trascrizione completa della dispensa (6 capitoli, `tools/testi/`), `ANALISI.md` (8 moduli, 57 concetti, grafo dei prerequisiti verificato, convenzioni, 8 modelli visivi), `NOTE_FONTI.md` (NF-01…NF-13, 2 da chiedere al docente), infografica di stato pubblicata.
- **Prossimo passo preciso:** Fase 1. (1) leggere le risposte dello studente alle 3 domande (data dell'orale, domande degli anni passati/argomenti esclusi, PDF allegato); se ha allegato il PDF, rivedere le figure (NF-12) e NF-03/NF-10 con `pdftoppm -r 100 -gray` solo sulle pagine con figure; (2) aggiungere `samuelepreite/seimafi` in lettura, clonarlo in `/home/claude/seimafi` e **copiare** l'infrastruttura (vedi «Riusare SEIMAFI» nel prompt di partenza); (3) modulo M1: motore + test + lezioni guidate di c1.1…c1.7 + modello V1 (rotazione di Eulero); (4) build, Playwright, pubblicazione dell'app, infografica aggiornata.

## §0b Economia di token
- La dispensa **non si rilegge**: si leggono `tools/testi/cap-XX.md` (solo il capitolo del modulo in lavorazione). Il testo grezzo è in `tools/fonte/dispensa.txt` solo per emergenze.
- Una sessione = un modulo. Test mirati durante il lavoro, suite completa una volta. Output filtrato. Una pubblicazione a fine sessione.
- Non avviare subagenti se lo studente non lo chiede.

## Dove sono le cose
- Repository: https://github.com/samuelepreite/sdc (ramo `main`). Clonare con `git clone --depth 1`.
- Infografica di stato: sorgente `docs/stato-sdc.html`, artifact **stesso URL ogni volta**: https://claude.ai/code/artifact/4f6f0a8c-0000-0000-0000-000000000000 (aggiornare se diverso)
- App: non ancora pubblicata (Fase 1).
- Copia di sicurezza nel progetto Claude: `claude/codice.tar.gz.b64` (ripristino: `base64 -d codice.tar.gz.b64 | tar xz`), più `claude/RIPARTENZA.md`, `claude/ANALISI.md`, `claude/NOTE_FONTI.md`.
- Dispensa: nel progetto Claude come «Dispensa SDC.pdf» (il tool del progetto restituisce solo testo).

## Cosa è fatto
| Fase | Stato | Note |
|---|---|---|
| 0 Analisi | ✅ fatta | trascrizione, ANALISI, NOTE_FONTI, grafo (`tools/grafo.py` → `tools/grafo.json`) |
| 1 Impianto + M1 | ⏳ prossima | |
| 2 Moduli M2–M8 | — | uno per sessione, sempre uno avanti allo studente |
| 3 Orale | — | banca domande (74 dalla fonte), spiegalo a voce, lavagna, mappa, simulatore |
| 4 Rifinitura | — | piano fino alla data dell'orale |

## Prossimi passi in ordine
1. Fase 1 come in §0.
2. M2 (deformazione) con il modello V2 (intorno che si deforma, sfera → ellissoide).
3. M3 (tensione) con V3 e V4 (piano di taglio, Mohr, arbelo).
4. M4, M5, M6 (V6 trave 3D), M7 (V7 taglio/torsione), M8 (V8 criteri).

## Regole dello studente (vincolanti)
1. Unica fonte: la dispensa (notazione, segni, ordine; ogni contenuto cita §, Def/Teo/eq., pagina).
2. Niente «corretto» senza test o confronto con la dispensa.
3. Ciò che non è nella dispensa si marca *deduzione* / *passaggio aggiunto* / *fonte esterna*.
4. Derivazioni solo dove la dispensa le sviluppa (elenco in ANALISI §4); altrove il risultato spiegato a parole (NF-11).
5. Dubbi sulla dispensa → `NOTE_FONTI.md` (NF-xx).
6. Italiano; report brevi; il quadro completo sta nell'infografica.
7. A ogni avanzamento: infografica ripubblicata, commit e push su `main`, questo file aggiornato.
8. Layout di riferimento: computer, desktop largo.

## Procedura: aggiungere un modulo
1. Leggere `tools/testi/cap-XX.md` del modulo e le righe di `tools/grafo.py`.
2. Motore in `src/engine/` (SI, funzioni pure) + test (casi noti, verifiche indipendenti).
3. Contenuti in `src/content/mN/`: concetti, schede, lezioni guidate (ultimo passo = riassunto con domande d'orale), domande; derivazioni con `sample`/`val` verificate su 25 campioni.
4. Visual del modulo (V#), robusto (vedi trappole del prompt).
5. `npx tsc --noEmit -p .`, suite, build, Playwright; infografica; commit, push, pubblicazione.

## Trappole già incontrate (in questo progetto)
- Il tool del progetto restituisce il PDF come **testo estratto**, non come PDF: niente immagini delle pagine. Chiedere allo studente di allegare il PDF in chat se servono le figure.
- Il primo `git push` dopo il clone di un repository vuoto può fallire con «expected 'acknowledgments'»: rilanciare `git push -u origin main`.
- Nel testo estratto le matrici sono spezzate da caratteri `\f`: i numeri di pagina si riconoscono come riga con solo il numero seguita da «Scienza delle Costruzioni …» o da «Capitolo N».
- Vedi anche la tabella «Trappole già incontrate» del prompt di partenza (3D, formule lunghe, FSRS, prompt notturni).
