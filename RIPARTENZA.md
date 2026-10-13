# RIPARTENZA — leggere per primo

## §0 Stato dell'ultima sessione
**Sessione 3 (13/10/2026, lavoro automatico): M2–M8 FATTI e pubblicati (Fase 2 chiusa).**
- M8 (criteri: `engine/criteri.ts`, V8 `three/criteriRenderer.ts` + `Criteri3D.tsx` kind `criteri3d`, `diagrams/Criteri.tsx`, contenuti `src/content/m8/`) completo: 360 test verdi, `verifica_ui.py --lezioni=m8` 0 problemi. 57/57 concetti, 94 domande (74 della dispensa, tutte).
- `RichText` rende gli elenchi; tabelle markdown NON supportate. Testi in `tools/testi/cap-XX.md`. Nei `val` delle derivazioni tolleranza 1e-9.
- **Fase 3 scritta, non collegata:** `learning/simulatore.ts` (+ test), `ui/pages/simulatore.tsx`, `ui/pages/mappa.tsx`, CSS in coda a `styles.css`. Lo script `fase3.py` (nella scratchpad della sessione 3, da rifare se perso) aggiunge le rotte `mappa` e `simulatore` (App.tsx NAV/TABS/Router, Altro, link dalla banca) e i controlli in `verifica_ui.py`.
- **Prossimo passo preciso:** collegare Fase 3 → `tsc`, suite, build, `verifica_ui.py` (completa), pubblicazione, infografica, commit. Poi Fase 4: note sulla fonte aggiornate nella pagina Fonti (NF-09, NF-10, NF-12, NF-14), piano collegato al simulatore e alle domande per modulo; ciclo finale.

## §0c Lavoro automatico (dalla sessione 3)
Lo studente non segue in diretta: **non fare domande**, scegli la lettura più ragionevole e scrivila in §0 e nell'infografica. Si ferma solo una decisione irreversibile e ambigua (preparala, descrivila, fermati).
- Ciclo per modulo (M2 → M8): figure del capitolo sul PDF → motore + test → contenuti (concetti, lezioni, domande d'orale) → modello visivo → `tsc`, suite, build, `verifica_ui.py` → pubblicazione app e infografica → commit e push → §0 aggiornato → copia `claude/codice.tar.gz.b64` e `claude/RIPARTENZA.md` nel progetto. **Un modulo è finito solo dopo il push.**
- Dopo M8: Fase 3 (banca di tutte le domande d'orale, mappa dei concetti, simulatore d'orale a domande miste con tempo), poi Fase 4 (rifinitura, piano). Ogni fase chiude con lo stesso ciclo.
- Risparmio di token senza perdere qualità:
  - leggi solo `tools/testi/cap-XX.md` del modulo e le parti dei file di codice che servono (grep, range di righe); M1 è il modello da copiare: `src/content/m1/`, `src/three/tensorRenderer.ts`, `src/diagrams/`;
  - PDF solo per le pagine con figure (Read con `pages`, pagina PDF = pagina + 4), mai il capitolo intero;
  - non rileggere un file dopo averlo scritto; output di test e build filtrati (`tail`, `grep`);
  - test mirati mentre lavori, suite completa e `verifica_ui.py` una volta per modulo; screenshot guardati solo se la verifica segnala qualcosa o per un controllo visivo del nuovo modello;
  - una sola pubblicazione per modulo; niente subagenti;
  - messaggi allo studente: 2–3 righe a fine modulo, nient'altro tra un modulo e l'altro.
- Se la chat si interrompe o si riassume: rileggi questo file e riparti dal «Prossimo passo preciso».

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
| 2 Moduli M2–M8 | ✅ fatta | M2–M8 fatti (13/10) |
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
- Ripubblicare l'app: se la sessione non ha ancora letto l'artifact, il publish viene rifiutato. Fare UNA `Artifact read` dell'URL senza `path` (salva l'HTML su file, mostra solo la testa: ~25k token), poi publish. Nella stessa sessione i publish successivi dello stesso file passano.
- `pkill -f verifica_ui` uccide anche la shell che lo lancia: usare `ps … | awk | xargs kill`.
- La prova nel browser con tutte le lezioni dura ~10 min per passata: usare `--lezioni=mN` e lanciarla in background (`nohup … &`), leggendo il log.
- Vedi anche la tabella «Trappole già incontrate» del prompt di partenza (3D, formule lunghe, FSRS, prompt notturni).
