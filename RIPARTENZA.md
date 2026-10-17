# RIPARTENZA — leggere per primo

## §0 Stato dell'ultima sessione
**Sessione 5 (17/10/2026): un solo tipo di lezione, 57 lezioni riscritte e riviste.**
- Richiesta di Samuele: (1) niente più differenza tra lezione guidata e scheda; (2) lezioni più discorsive e concettuali, perché «mi perdo nei passaggi»; via i pulsanti «poco chiaro», che non portavano a una risposta.
- Fatto: `#/concetto/…` apre la lezione (via `Guided.tsx`, `learning/chunks.ts`, schede a pezzi/intera); a fine lezione domande di richiamo del concetto e domande d'orale; tolti i giudizi dei passi (il tipo `StepFeedback` resta in `store.ts` solo per leggere/sincronizzare i dati vecchi).
- Guida di scrittura `docs/GUIDA_LEZIONI.md` (basi: carico cognitivo, organizzatori anticipati, concreto→astratto, esempi svolti, richiamo, errori tipici) e criteri della seconda passata `docs/REVISIONE_LEZIONI.md`. **Ogni modifica futura alle lezioni segue queste due guide.**
- Lezioni: 412 → 948 passi, 175 domande nelle lezioni, ~27 h in tutto (10–40 min per lezione; il test ora ammette fino a 40). Marcatori ammessi nel testo: (deduzione), (passaggio aggiunto), (esempio aggiunto); `RichText` NON fa il corsivo con asterisco singolo.
- Revisione indipendente a campione + seconda passata su tutti i moduli. Corretti: segno dei lembi (c6.6), segni di Prandtl (c7.4), varie affermazioni più forti della fonte, aggiunte non marcate, simboli in conflitto ($E$/$\tens E$, $\lambda$). ANALISI §4: c8.5 ammette anche le due derivazioni di una riga del §6.5.
- Punto da ricordare: anticlastica (c6.6) — segno di ρ′ della dispensa, convenzione di lettura κ≃−v″ nostra e marcata.
- Test: 419 verdi (`lezioni-ui` percorre ogni lezione, un test per lezione). Prova nel browser `--lezioni=m1,m7` e `--lezioni=m3,m6`: 0 problemi.
- **Aula Studio** (artifact che contiene SdC, SEIMAFI e MAM I) si costruisce da un progetto/repository che qui non c'è: la sua copia di SdC NON è aggiornata. Per aggiornarla serve quel sorgente.
- **Prossimo passo preciso:** nessuno. Su richiesta: aggiornare Aula Studio, ritoccare singole lezioni.

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
| 3 Orale | ✅ fatta | banca (94 domande, 74 dalla fonte), spiegalo a voce, lavagna, mappa, simulatore (13/10) |
| 4 Rifinitura | ✅ fatta | piano (8 settimane senza data), Fonti aggiornate (13/10); verifica finale e NF chiuse (13/10 sera) |

## Prossimi passi in ordine
Nessuno: Fasi 0–4 chiuse, note sulla fonte tutte risolte. Lavori futuri solo su richiesta (vedi §0).

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
3. Contenuti in `src/content/mN/`: concetti (dati per richiamo e mappa) e lezioni scritte secondo `docs/GUIDA_LEZIONI.md` (ultimo passo = riassunto con domande d'orale), domande; derivazioni con `sample`/`val` verificate su 25 campioni.
4. Visual del modulo (V#), robusto (vedi trappole del prompt).
5. `npx tsc --noEmit -p .`, suite, build, Playwright; infografica; commit, push, pubblicazione.

## Trappole già incontrate (in questo progetto)
- Il tool del progetto restituisce il PDF come **testo estratto**: per le figure usare i PDF allegati in chat (Read con `pages`, pagina PDF = pagina + 4).
- Playwright sui passi delle lezioni: aspettare il ridisegno di React prima di dichiarare un passo bloccato; le domande di richiamo sono di tre tipi (scelta, vero/falso, aperta).
- I font Google non si caricano dal contenitore (ERR_TUNNEL): errore di console da ignorare nella verifica.
- Il primo `git push` dopo il clone di un repository vuoto può fallire con «expected 'acknowledgments'»: rilanciare `git push -u origin main`.
- Nel testo estratto le matrici sono spezzate da caratteri `\f`: i numeri di pagina si riconoscono come riga con solo il numero seguita da «Scienza delle Costruzioni …» o da «Capitolo N».
- Ripubblicare l'app: se la sessione non ha ancora letto l'artifact, il publish viene rifiutato. Fare UNA `Artifact read` dell'URL senza `path` (salva l'HTML su file, mostra solo la testa: ~25k token), poi publish. Nella stessa sessione i publish successivi dello stesso file passano.
- Fermare la prova nel browser: qualsiasi `pkill`/`pgrep -f` o `ps | grep` lanciato nello stesso comando che contiene il nome dello script uccide anche la shell (exit 144). Lanciare il kill in un comando a parte che NON contenga altrove il nome dello script (es. `ps aux | grep "[v]erifica_ui" | awk '{print $2}' | xargs -r kill` da solo).
- Senza `--lezioni` la prova percorre TUTTE le 57 lezioni (molto lunga): usare sempre `--lezioni=mN` (le altre: solo la prima lezione).
- La prova nel browser con tutte le lezioni dura ~10–15 min per passata (4 passate: ~45 min); lanciarla con `python3 -u` perché il log non resti nel buffer: usare `--lezioni=mN` e lanciarla in background (`nohup … &`), leggendo il log.
- Vedi anche la tabella «Trappole già incontrate» del prompt di partenza (3D, formule lunghe, FSRS, prompt notturni).
