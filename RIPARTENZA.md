# RIPARTENZA — leggere per primo

## §0 Stato dell'ultima sessione
**FINITA alle 08:30 del 13/10/2026** (sessione 2, Fase 1). Precedente: sessione 1 FINITA il 12/10 (Fase 0).
- Fatto: impianto ripreso da SEIMAFI e adattato all'orale (stato `sdc:v1`, FSRS con schede `q:` richiamo e `o:` orale, padronanza, sessione, piano, sincronizzazione `core`/`rec-i`/`ora-i`); **M1 completo**: 7 concetti, 7 lezioni guidate con derivazioni verificate, 13 domande d'orale (11 dalla dispensa + 2 dedotte), modello 3D dei tensori (trasforma, proiettori, assiale, Eulero) e 3 diagrammi SVG (matrici, simmetrie IV ordine, divergenza); pagine Oggi, Studia, Moduli, Orale («spiegalo a voce» con cronometro, scaletta, lavagna, figura), Progressi, Piano, Fonti, Impostazioni.
- Verifiche: `tsc` pulito, 89 test verdi, `python3 tools/verifica_ui.py` (Chromium: tutte le pagine in chiaro/scuro e a 820 px, tutte le 7 lezioni percorse fino in fondo, 3D che disegna anche con shader PBR rotti) → 0 problemi.
- Lo studente ha allegato il PDF della dispensa in due parti (13/10): **pagina PDF = pagina dispensa + 4** (parte 1 pp. 1–99 della numerazione PDF, parte 2 pp. 100–163). Figure del Cap. 1 controllate; NF-03 risolta. I PDF stanno solo nella chat: se il contenitore si perde, chiederli di nuovo.
- Le 3 domande della sessione 1 (data dell'orale, domande degli anni passati, PDF) hanno ricevuto risposta solo per il PDF: data e argomenti esclusi restano da chiedere; nel frattempo facoltativi esclusi, piano su 8 settimane.
- **Prossimo passo preciso:** M2 (analisi della deformazione, Cap. 2, pp. 15–35). (1) controllare sul PDF le figure del Cap. 2 (PDF pp. 19–39) e NF-02 (p. 32, PDF 36); (2) motore della deformazione in `src/engine/` + test; (3) concetti, lezioni (derivazioni elencate in ANALISI §4), domande d'orale del Cap. 2 (riquadro «Per l'orale»); (4) modello V2: intorno che si deforma, sfera → ellissoide, nuova modalità in `src/three/`; (5) suite, build, `tools/verifica_ui.py` (aggiungere i concetti m2 alla lista), pubblicazione, infografica, commit.

## §0b Economia di token
- La dispensa **non si rilegge**: si leggono `tools/testi/cap-XX.md` (solo il capitolo del modulo in lavorazione). Il testo grezzo è in `tools/fonte/dispensa.txt` solo per emergenze.
- Una sessione = un modulo. Test mirati durante il lavoro, suite completa una volta. Output filtrato. Una pubblicazione a fine sessione.
- Non avviare subagenti se lo studente non lo chiede.

## Dove sono le cose
- Repository: https://github.com/samuelepreite/sdc (ramo `main`). Clonare con `git clone --depth 1`.
- Infografica di stato: sorgente `docs/stato-sdc.html`, artifact **stesso URL ogni volta**: https://claude.ai/artifact/TQhQFzSG6QsnVv4chE4GcW (ripubblicare passando questo URL come `url`)
- App: https://claude.ai/artifact/M9zqUrr9t4zY2Fgqos87EJ — ripubblicare `dist-artifact/sdc.html` passando questo URL come `url`, **senza** `capabilities` (restano `db`, `user`, `downloads`). Build: `npm run build:artifact`.
- Copia di sicurezza nel progetto Claude: `claude/codice.tar.gz.b64` (ripristino: `base64 -d codice.tar.gz.b64 | tar xz`), più `claude/RIPARTENZA.md`, `claude/ANALISI.md`, `claude/NOTE_FONTI.md`.
- Dispensa: nel progetto Claude come «Dispensa SDC.pdf» (il tool del progetto restituisce solo testo).

## Cosa è fatto
| Fase | Stato | Note |
|---|---|---|
| 0 Analisi | ✅ fatta | trascrizione, ANALISI, NOTE_FONTI, grafo (`tools/grafo.py` → `tools/grafo.json`) |
| 1 Impianto + M1 | ✅ fatta | app pubblicata; M1 completo; verifica UI automatica |
| 2 Moduli M2–M8 | — | uno per sessione, sempre uno avanti allo studente |
| 3 Orale | — | banca domande (74 dalla fonte), spiegalo a voce, lavagna, mappa, simulatore |
| 4 Rifinitura | — | piano fino alla data dell'orale |

## Prossimi passi in ordine
1. M2 (deformazione) con il modello V2 (intorno che si deforma, sfera → ellissoide).
2. M3 (tensione) con V3 e V4 (piano di taglio, Mohr, arbelo).
3. M4, M5, M6 (V6 trave 3D), M7 (V7 taglio/torsione), M8 (V8 criteri).

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
- Il tool del progetto restituisce il PDF come **testo estratto**: per le figure usare i PDF allegati in chat (Read con `pages`, pagina PDF = pagina + 4).
- Playwright sui passi delle lezioni: aspettare il ridisegno di React prima di dichiarare un passo bloccato; le domande di richiamo sono di tre tipi (scelta, vero/falso, aperta).
- I font Google non si caricano dal contenitore (ERR_TUNNEL): errore di console da ignorare nella verifica.
- Il primo `git push` dopo il clone di un repository vuoto può fallire con «expected 'acknowledgments'»: rilanciare `git push -u origin main`.
- Nel testo estratto le matrici sono spezzate da caratteri `\f`: i numeri di pagina si riconoscono come riga con solo il numero seguita da «Scienza delle Costruzioni …» o da «Capitolo N».
- Vedi anche la tabella «Trappole già incontrate» del prompt di partenza (3D, formule lunghe, FSRS, prompt notturni).
