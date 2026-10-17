# Guida di scrittura delle lezioni

Da ottobre 2026 l'app ha **un solo tipo di lezione**: la lezione guidata. Le schede (spiegazione, «errori tipici», formule) non si leggono più a parte, quindi **tutto ciò che stava nella scheda del concetto deve trovarsi nella lezione**. Lo studente ha segnalato che le lezioni erano difficili da seguire («mi perdo nei passaggi»): erano scritte come appunti compressi. Questa guida dice come riscriverle.

## Perché così: che cosa sappiamo su come si impara

Ogni regola sotto viene da un risultato solido della ricerca sull'apprendimento. Li riassumo perché chi scrive capisca lo scopo e non applichi le regole a memoria.

1. **La memoria di lavoro è piccola.** Mentre legge, uno studente tiene «in mano» pochi elementi nuovi alla volta (circa quattro). Un simbolo nuovo, una parola tecnica nuova, un passaggio algebrico non spiegato: ognuno occupa un posto. Quando i posti finiscono, lo studente «si perde». *(Teoria del carico cognitivo, Sweller; Cowan.)* → Un'idea nuova per passo; mai due simboli nuovi nella stessa frase; ogni simbolo detto anche a parole.
2. **Si impara agganciando il nuovo a ciò che si sa già.** Un concetto isolato non si fissa; uno collegato a qualcosa di noto sì. *(Ausubel: organizzatori anticipati; schemi.)* → Ogni lezione parte da ciò che lo studente sa (la lezione prima, un caso di tutti i giorni, il caso a una dimensione) e dichiara dove sta andando.
3. **Prima il concreto, poi l'astratto.** Un'immagine fisica o un caso semplice danno al cervello qualcosa a cui appendere la formula generale. *(Concreteness fading.)* → Esempio o caso scalare prima della definizione generale.
4. **Il «perché» fissa meglio del «che cosa».** Chiedersi perché una cosa è così produce ricordi più stabili che leggerla. *(Elaborative interrogation; self-explanation, Chi.)* → Ogni definizione arriva come risposta a un problema; ogni requisito dice che cosa andrebbe storto senza.
5. **Gli esempi svolti insegnano più degli esercizi, se ogni passo è motivato.** All'inizio lo studente impara guardando un esperto ragionare ad alta voce, purché nessun passaggio resti implicito. *(Worked-example effect.)* → Nelle derivazioni ogni riga fa **una sola mossa**, e la spiegazione dice quale mossa e perché.
6. **Parole e immagini insieme, nello stesso momento.** Se il testo dice «guarda il cubetto» mentre il modello lo mostra, le due vie si rinforzano; se testo e immagine sono scollegati, si fanno concorrenza. *(Dual coding, Paivio; principio di contiguità, Mayer.)* → Quando un passo usa il modello, il testo dice esattamente che cosa guardare.
7. **Richiamare a memoria consolida.** Rispondere a una domanda subito dopo aver capito un pezzo fissa più che rileggere. *(Retrieval practice, Roediger e Karpicke.)* → Una domanda ogni due-tre passi di spiegazione, che chieda di capire (perché, che cosa succede se…), non di riconoscere una frase.
8. **Gli errori tipici vanno nominati e smontati.** Una concezione sbagliata non sparisce da sola: va messa a confronto con quella giusta. *(Conceptual change.)* → Gli «errori tipici» della scheda diventano un passo «Attenzione a…» che spiega perché l'errore è tentante e perché è sbagliato.
9. **La coerenza del racconto riduce la fatica.** Frasi collegate («quindi», «perché», «cioè», «ora ci chiediamo») permettono di seguire il filo; frasi giustapposte costringono a ricostruirlo. *(Signaling; coerenza.)* → Stile discorsivo, mai telegrafico.

## Struttura di una lezione

1. **Primo passo: «Dove siamo e dove andiamo»** (`spiega`). In 3–6 frasi: che cosa sappiamo dalla lezione precedente (nominala), quale domanda risolve questa lezione e perché serve, quali tappe faremo. Se c'è un'immagine fisica utile, qui.
2. **Corpo della lezione**: una sequenza di passi brevi. Ogni passo:
   - ha un **titolo che è un'affermazione o una domanda** («Perché la massa non entra nei conti», «Che cosa succede alle fibre?»), non un'etichetta;
   - si **apre agganciandosi al passo prima** (una frase) e si chiude dove comincia il successivo;
   - contiene **un'idea** sola, in circa 100–220 parole;
   - introduce ogni simbolo **con il suo nome a parole** («$\tens F$, il gradiente di deformazione»), e lo ri-nomina se ricompare dopo qualche passo.
3. **Derivazioni** (`derivazione`):
   - il campo `md` dice **dove vogliamo arrivare** e **l'idea della strategia** in una o due frasi, prima della prima riga;
   - ogni riga fa **una sola mossa**; se una riga della vecchia versione ne faceva due, spezzala e marca la riga nuova `aggiunto: true` con il suo `val`;
   - il `why` di ogni riga dice *che cosa è cambiato rispetto alla riga prima e perché è lecito* («abbiamo portato $\tens F$ dall'altra parte del prodotto scalare: è la definizione di trasposto»), in frasi complete;
   - le domande «Prova tu» (`ask`) servono nei punti dove lo studente può davvero prevedere il passo; il loro `why` spiega anche perché le alternative sono sbagliate;
   - **dopo** la derivazione, un passo `spiega` che legge il risultato a parole: che cosa dice, un caso particolare che lo conferma, a che cosa servirà.
4. **Domande** (`domanda`): dopo ogni blocco di due-tre passi. Distrattori = errori veri che uno studente fa. Il `why` spiega l'errore, non ripete solo la risposta.
5. **Prove sul modello** (`prova`): compiti concreti («scegli…, guarda…, nota che…») con quello che lo studente deve osservare e perché conta.
6. **«Attenzione a…»** (`spiega`): gli errori tipici della scheda del concetto, ciascuno spiegato.
7. **Riassunto** (ultimo passo, `riassunto`): prima **il filo del ragionamento in 3–5 frasi** (racconto, non elenco), poi le formule chiave con riferimento, poi `orale` con le domande d'orale.

## Stile

- Italiano chiaro, frasi complete, connettivi espliciti. Seconda persona («guarda», «prova a pensare»), tono del professore che parla a un solo studente.
- **Vietato** lo stile da appunti: niente catene di parentesi, niente «⇒» nel testo, niente elenchi per un ragionamento (gli elenchi solo per cose parallele: tre requisiti, due punti di vista).
- **Vietati** «è immediato», «banalmente», «si vede facilmente», «ovviamente»: se fosse ovvio non servirebbe scriverlo; se serve, va spiegato.
- Niente sigle non sciolte (CdS → «caratteristiche della sollecitazione» almeno la prima volta in ogni lezione).
- Non dare per scontato il Modulo 1: quando si usa un'operazione tensoriale (trasposto, prodotto scalare tra tensori, traccia, divergenza) ricordane in mezza frase il significato.
- Lunghezza: meglio più passi brevi che pochi lunghi. Una lezione tipica ha 10–18 passi.

## Fedeltà alla fonte (regole vincolanti dello studente)

- **Unica fonte: la dispensa** (`tools/testi/cap-XX.md`). Notazione, segni, nomi, ordine della dispensa. Citare §, Def/Teo/Prop/eq., pagina dove si enuncia qualcosa.
- Spiegazioni didattiche (analogie, esempi numerici semplici, riformulazioni) sono libere **purché non aggiungano fatti**. Un fatto, un'affermazione o un passaggio che **non è nella dispensa** si marca: nelle derivazioni `aggiunto: true`; nel testo con *(deduzione)* o *(passaggio aggiunto)* scritti così, tra parentesi, subito dopo la frase.
- Derivazioni **solo** dove la dispensa le sviluppa (ANALISI §4, colonna «Derivazioni sviluppate dalla dispensa»); altrove il risultato si spiega a parole.
- Non cambiare `tex`, `val`, `sample`, `checks` che già funzionano, salvo correggerli; ogni riga nuova con un valore numerico ha il suo `val`.

## Regole tecniche

- File: `src/content/mN/lezioni.ts`. Tipi in `src/content/types.ts`. Testo in template literal: le barre rovesciate LaTeX si raddoppiano (`\\tens F`).
- `RichText` capisce: paragrafi separati da riga vuota, elenchi `- ` e `1. `, **grassetto**, `$…$` e `$$…$$`. **Non** capisce: corsivo con asterisco singolo, tabelle, titoli `#`. Per il corsivo dei marcatori di fonte scrivi semplicemente «(deduzione)».
- Id dei passi e delle domande unici in tutta l'app (mantieni il prefisso della lezione, es. `l21-…`, `l21-q…`).
- `minutes`: stima realistica (circa 120 parole al minuto, più 1 minuto per domanda e 2 per derivazione), tra 10 e 40.
- L'ultimo passo è `riassunto`; almeno una `domanda` o `prova` per lezione.
- Verifica: `npx tsc --noEmit -p .` e `npx vitest run tests/lezioni.test.ts tests/contenuti.test.ts tests/lezioni-ui.test.tsx`.

## Esempio

La lezione `c2.1` in `src/content/m2/lezioni.ts` è riscritta secondo questa guida: usala come modello di tono, lunghezza dei passi e marcature.
