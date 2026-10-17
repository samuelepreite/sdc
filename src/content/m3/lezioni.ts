/**
 * Lezioni guidate del Modulo 3 (Cap. 3), riscritte secondo docs/GUIDA_LEZIONI.md: contengono anche tutto ciò che stava
 * nelle schede dei concetti (significato, formule, spiegazione, errori tipici). Derivazioni solo dove la dispensa le
 * sviluppa (ANALISI §4); ogni riga con `val` è verificata su 25 campioni casuali (tests/lezioni.test.ts). I numeri dei
 * passi «numeri» vengono dal motore.
 */
import { D } from '../../engine/types';
import * as T from '../../engine/tensor';
import { ES_314, ES_314_N, ES_3172, mohr, principalStress, tauMax, traction } from '../../engine/tensione';
import type { Lesson, LessonVisual, StressScene } from '../types';

type R = Record<string, number>;
const mat = (v: R, p: string): T.Mat => Array.from({ length: 9 }, (_, k) => v[`${p}${k}`]);
const vec = (v: R, p: string): T.Vec => [v[`${p}0`], v[`${p}1`], v[`${p}2`]];
const putMat = (o: R, p: string, A: T.Mat) => A.forEach((a, k) => (o[`${p}${k}`] = a));
const putVec = (o: R, p: string, a: T.Vec) => a.forEach((x, k) => (o[`${p}${k}`] = x));
const idx = (r: () => number) => Math.min(2, Math.floor(3 * r()));
const ST = (scene: StressScene): LessonVisual => ({ kind: 'tensione3d', scene });
const MOHR = (params: Record<string, string | number | boolean>): LessonVisual => ({ kind: 'svg', id: 'mohr', params });
const f = (x: number, d = 4) => T.fmt(Math.abs(x) < 1e-12 ? 0 : x, d);
const fd = (x: number) => T.fmt(x, 4);

// ------------------------------------------------------------------ numeri dal motore
const P314 = principalStress(ES_314);
const TM314 = tauMax(ES_314);
const TR314 = traction(ES_314, ES_314_N);
const M3172 = mohr(ES_3172);
const Q30 = M3172.at(Math.PI / 6);
const Q120 = M3172.at(Math.PI / 6 + Math.PI / 2);

/** campione per Mohr: σ1, σ2, τ12, α */
const sampleMohr = (r: () => number): R => ({ s1: 4 * r() - 2, s2: 4 * r() - 2, t: 4 * r() - 2, a: Math.PI * (2 * r() - 1) });

export const M3_LEZIONI: Lesson[] = [
  // ================================================================== c3.1
  {
    concept: 'c3.1',
    title: 'Le forze interne e il vettore tensione',
    minutes: 28,
    source: D(3, '3.1–3.3', 'Def 3.2.1–3.2.2, Teo 3.3.1', '36–40'),
    visual: ST({ mode: 'taglio', presets: ['esercizio', 'trazione', 'scorrimento', 'generico'], controls: ['preset', 'dir'] }),
    steps: [
      {
        id: 'l31-1',
        kind: 'spiega',
        title: 'Dove siamo e dove andiamo',
        md: `Nel capitolo 2 abbiamo descritto **come** un corpo cambia forma: deformazione, spostamento, tensore di deformazione. Lo abbiamo fatto in modo puramente geometrico, senza chiederci **perché** il corpo si deforma. Ora cominciamo a occuparci delle cause, cioè delle forze.

La domanda di questo capitolo è: **come si descrivono le forze che la materia trasmette al proprio interno?** Il descrittore di queste forze si chiama **tensione**, e con essa studieremo l'equilibrio del solido deformato (§3.1).

In questa lezione facciamo quattro tappe. Prima mettiamo in ordine le forze che possono agire su un corpo; poi capiamo perché servono anche forze «interne»; poi le rendiamo precise con due principi, di Eulero e di Cauchy, che portano al **vettore tensione**; infine scomponiamo quel vettore in una parte normale e una tangenziale. Tieni a mente un'immagine che ci accompagnerà sempre: **un taglio ideale che divide il corpo in due parti**, e le forze che una parte esercita sull'altra attraverso il taglio.`,
      },
      {
        id: 'l31-2',
        kind: 'spiega',
        title: 'Che cosa può agire su un corpo dall\'esterno',
        md: `Un corpo, visto come sistema fisico, interagisce con l'ambiente che lo circonda; in meccanica queste interazioni sono **forze** (§3.1). La dispensa ne distingue due classi «esterne».

- Le **forze di volume**, indicate con $\\vet b(x)$, agiscono **a distanza**, senza contatto, su ogni punto $x$ del corpo $\\mathcal B$. L'esempio tipico è il peso: ogni pezzetto di materia è attirato dalla Terra, che lo tocchi o no. Si misurano come forza per unità di volume, quindi $|\\vet b|=[F][L^{-3}]$; per il peso la densità di forza vale $\\rho g$, densità per accelerazione di gravità.
- Le **forze di superficie**, indicate con $\\hat{\\vet s}(x)$, agiscono **per contatto** sui punti della frontiera $\\partial\\mathcal B$, cioè della superficie che delimita il corpo. L'esempio della dispensa è il vento che spinge su una vela. Sono forze per unità di area: $|\\hat{\\vet s}|=[F][L^{-2}]$.

Nota la differenza di dimensioni: le prime si «spalmano» su un volume, le seconde su un'area. Ci servirà più avanti, quando faremo rimpicciolire un pezzetto di corpo e vedremo quale delle due conta di più.`,
      },
      {
        id: 'l31-3',
        kind: 'spiega',
        title: 'Perché servono anche le forze interne',
        md: `Le forze esterne non bastano a spiegare l'equilibrio di un corpo. L'esempio della dispensa lo fa vedere bene (§3.1). Una persona sta su un balcone: il suo peso agisce sul pavimento del balcone, ma alla fine deve arrivare alle fondamenta dell'edificio. Come ci arriva? **Passando attraverso la materia**: la soletta, le travi, i pilastri.

Ora immagina di **tagliare idealmente** il balcone con un piano, senza separare davvero le parti. Se tra le due parti non ci fosse nessuna forza, la parte esterna non avrebbe più niente che la sostiene, e la trasmissione del peso si interromperebbe. Siccome il balcone in realtà sta su, attraverso ogni taglio ideale le due parti devono scambiarsi forze.

Queste sono le **forze interne**: le interazioni di una parte $\\mathcal P$ del corpo con il resto del corpo. La **tensione** è proprio il descrittore delle forze interne che la materia mette in gioco per trasmettere i carichi. L'idea risale a Galileo, nel Seicento; la formulazione attuale è maturata tra Settecento e Ottocento.`,
      },
      {
        id: 'l31-4',
        kind: 'domanda',
        q: { id: 'l31-q2', kind: 'scelta', q: `Perché, per studiare un corpo continuo, non bastano le forze di volume e di superficie?`, options: [`Perché i carichi devono essere trasmessi attraverso la materia: tagliando idealmente il corpo, ciascuna parte resta in equilibrio solo grazie alle forze che l'altra le esercita`, `Perché le forze di volume sono sempre trascurabili`, `Perché le forze di superficie agiscono solo sui corpi rigidi`, `Perché senza forze interne il corpo non avrebbe massa`], correct: 0, why: `È l'esempio del balcone (§3.1): il peso deve arrivare alle fondamenta passando per la materia. Le forze di volume non sono trascurabili in generale (il peso è una forza di volume) e le forze di superficie agiscono su qualunque corpo; la massa non c'entra.` },
      },
      {
        id: 'l31-5',
        kind: 'spiega',
        title: 'Il taglio ideale: il principio delle sezioni di Eulero',
        md: `Rendiamo precisa l'immagine del taglio. Prendi un punto $x$ del corpo e fai passare per $x$ un piano $\\pi$. Il piano è individuato dal suo versore normale $\\hat n$, che si chiama **giacitura**: dire «giacitura $\\hat n$» vuol dire «il piano per $x$ perpendicolare a $\\hat n$». Il piano divide il corpo in due parti: $\\mathcal B^+$, quella dalla parte verso cui punta $\\hat n$, e $\\mathcal B^-$, quella dall'altra parte. Sulla sezione $A$ prendi un piccolo intorno di $x$, di area $\\Delta A$ (§3.2.1).

Il **principio delle sezioni di Eulero** (Def 3.2.1, attorno al 1750) dice che l'azione di $\\mathcal B^+$ su $\\mathcal B^-$ attraverso $\\Delta A$ equivale a un campo di forze definito su $\\Delta A$. In parole: **le forze interne sono forze di superficie**, agiscono sulle facce del taglio, come se il taglio fosse una superficie esterna.

È un'ipotesi limitativa, e la dispensa lo dice: in un magnete le due parti si attirano anche a distanza, attraverso il vuoto, e quelle interazioni non sono forze di superficie. Per la grande maggioranza dei problemi dell'ingegneria, però, l'ipotesi è adeguata.

Nel modello a destra vedi proprio questo: il piano $\\pi$ per il punto e la sua normale $\\hat n$.`,
      },
      {
        id: 'l31-6',
        kind: 'spiega',
        title: 'Dalla forza sul pezzetto alla tensione nel punto',
        md: `Il principio di Eulero ci dà forze distribuite sul pezzetto $\\Delta A$. Noi però vogliamo un'informazione **nel punto** $x$, non su un'area. Ci pensa il **principio delle tensioni di Cauchy** (Def 3.2.2, 1823).

Sia $\\Delta\\vet F$ la risultante delle forze che agiscono su $\\Delta A$. Facciamo rimpicciolire $\\Delta A$ attorno a $x$; per misurare quanto è piccolo si usa il suo diametro, $\\operatorname{diam}(\\Delta A)$, cioè il diametro del più piccolo cerchio che lo contiene. Il primo punto del principio afferma che esiste ed è finito il limite
$$\\vet t_n(x):=\\lim_{\\operatorname{diam}\\Delta A\\to0}\\frac{\\Delta\\vet F}{\\Delta A}.$$
Questo vettore si chiama **vettore tensione** relativo alla giacitura $\\hat n$. Leggilo come «la forza per unità di area che $\\mathcal B^+$ esercita su $\\mathcal B^-$ attraverso il taglio di normale $\\hat n$, nel punto $x$». Ha le dimensioni di una forza su un'area, come $\\hat{\\vet s}$: è la stessa idea, applicata a una superficie che passa dentro il corpo.

È lo stesso procedimento con cui si passa dalla massa di un pezzetto alla densità in un punto: rapporto, poi limite (esempio aggiunto).`,
      },
      {
        id: 'l31-7',
        kind: 'spiega',
        title: 'E il momento? Perché si può trascurare',
        md: `Le forze su $\\Delta A$ non hanno solo una risultante $\\Delta\\vet F$: hanno anche un momento risultante $\\Delta\\vet M$ rispetto a $x$. Il secondo punto del principio di Cauchy dice che, rapportato all'area, questo momento sparisce nel limite:
$$\\lim_{\\operatorname{diam}\\Delta A\\to0}\\frac{\\Delta\\vet M}{\\Delta A}=\\vet 0.$$
In parole: **a livello infinitesimo il momento interno è trascurabile**, e nel punto resta solo il vettore tensione.

Escludere i momenti interni basta quasi sempre. Quando non basta servono i **continui polari** dei fratelli Cosserat: in essi ogni punto, oltre a traslare, può anche ruotare, e le sue rotazioni generano dei **micromomenti**. L'esempio della dispensa è la **muratura**, in cui i giunti tra i mattoni danno al materiale una struttura interna direzionale. Il prezzo da pagare è una complessità matematica molto maggiore; nel corso non li useremo.`,
      },
      {
        id: 'l31-8',
        kind: 'domanda',
        q: { id: 'l31-q4', kind: 'scelta', q: `Quale delle due affermazioni appartiene al principio delle sezioni di Eulero, e non a quello delle tensioni di Cauchy?`, options: [`L'azione di una parte sull'altra attraverso il taglio equivale a un campo di forze di superficie`, `Il rapporto $\\Delta\\vet F/\\Delta A$ ha limite finito`, `Il momento per unità di area tende a zero`, `Il tensore di tensione è simmetrico`], correct: 0, why: `Eulero (Def 3.2.1) stabilisce che le forze interne sono forze di superficie. I due limiti, quello della forza e quello del momento, sono i due punti del principio di Cauchy (Def 3.2.2). La simmetria del tensore è un risultato molto successivo (Teo 3.6.1).` },
      },
      {
        id: 'l31-9',
        kind: 'spiega',
        title: 'Perché li chiamiamo principi: sono assiomi',
        md: `Hai notato che non abbiamo **dimostrato** né il principio di Eulero né quello di Cauchy. Non è una dimenticanza: sono **assiomi** (§3.2). Un assioma non si dimostra a partire da qualcos'altro; la sua validità sta nella **riprova sperimentale**, cioè nella capacità della teoria che ne deriva di prevedere ciò che si osserva. Finora le previsioni costruite su questi due principi hanno funzionato, e per questo li usiamo.

C'è anche un fatto pratico che vale la pena dire all'orale: **non esiste un «tensiometro»**, uno strumento che misuri direttamente la tensione. In laboratorio si misura la deformazione, e la tensione si stima attraverso la teoria. Anche per questo i principi non possono essere verificati «guardando» le tensioni: si verificano attraverso le loro conseguenze.`,
      },
      {
        id: 'l31-10',
        kind: 'spiega',
        title: 'Conta solo la giacitura, non la forma del taglio',
        md: `Due osservazioni sul vettore tensione (§3.2.3) chiariscono da che cosa dipende.

**Prima: conta solo la giacitura.** Per il punto $x$ possono passare superfici diverse, anche curve, purché abbiano in $x$ la stessa normale $\\hat n$: il vettore tensione in $x$ è lo stesso per tutte. Questo è il motivo per cui possiamo sempre ragionare con un piano: di una superficie qualunque, nel punto, conta solo il piano tangente.

**Seconda: giaciture diverse danno, in generale, vettori diversi.** Se giri il piano attorno a $x$, cambia $\\hat n$ e cambia $\\vet t_n$. Quante giaciture ci sono? Un versore nello spazio si sceglie con due angoli, quindi le giaciture sono $\\infty^2$, e in ogni punto ci sono **$\\infty^2$ vettori tensione**, uno per giacitura. Tienilo a mente: è un'enormità di informazione, e una delle prossime lezioni (Cauchy–Poisson) mostrerà come ridurla.`,
      },
      {
        id: 'l31-11',
        kind: 'prova',
        title: 'Cambia giacitura e guarda il vettore tensione',
        md: `Nel modello vedi il piano $\\pi$ per il punto, la sua normale $\\hat n$ e il vettore tensione $\\vet t_n$, disegnato in arancio. Con i cursori «inclinazione» e «azimut» scegli la giacitura.`,
        tasks: [`Con «esercizio §3.14» muovi inclinazione e azimut: $\\vet t_n$ cambia direzione e lunghezza. Sono gli $\\infty^2$ vettori tensione del punto (§3.2.3).`, `Scegli «trazione semplice»: qualunque piano tu scelga, $\\vet t_n$ resta parallelo all'asse x. Cambia solo la sua lunghezza.`, `Scegli «idrostatico»: $\\vet t_n$ è sempre diretto lungo $\\hat n$, cioè perpendicolare al piano. Su questo caso torneremo nella lezione sulle tensioni principali.`],
        visual: ST({ mode: 'taglio', preset: 'esercizio', presets: ['esercizio', 'trazione', 'idrostatico', 'generico'], controls: ['preset', 'dir'] }),
      },
      {
        id: 'l31-12',
        kind: 'spiega',
        title: 'Due effetti diversi sul taglio: normale e tangenziale',
        md: `Il vettore tensione si può scomporre lungo tre assi qualunque, ottenendo le sue componenti ordinarie $(t_n)_i$. Ma c'è una scelta molto più significativa: un asse lungo $\\hat n$ e due nel piano del taglio. Le componenti che si ottengono si chiamano **componenti speciali** (§3.3), e corrispondono a due effetti fisici diversi.

- La **tensione normale** è la parte di $\\vet t_n$ lungo $\\hat n$: $\\boldsymbol\\sigma_n=\\sigma_n\\hat n$, con $\\sigma_n=\\vet t_n\\cdot\\hat n$ (il prodotto scalare dà la proiezione su $\\hat n$). Se $\\sigma_n>0$ si parla di **trazione**: la tensione tende a **lacerare** il materiale, allontanando le due facce del taglio. Se $\\sigma_n<0$ si parla di **compressione**: tende a farle **compenetrare**.
- La **tensione tangenziale** è la parte di $\\vet t_n$ che giace nel piano del taglio: $\\boldsymbol\\tau_n=\\tau_n\\hat\\mu$, con $\\hat\\mu$ versore perpendicolare a $\\hat n$. È un'azione **radente**: tende a far **scivolare** una faccia del taglio sull'altra.

Pensa a un mazzo di carte (esempio aggiunto): premerlo dall'alto è un'azione normale; spingere la carta in cima di lato, facendola scorrere, è un'azione tangenziale.`,
      },
      {
        id: 'l31-13',
        kind: 'spiega',
        title: 'La scomposizione scritta con i proiettori',
        md: `La scomposizione appena descritta a parole si scrive con i **proiettori** del Modulo 1 (Def 1.2.5). Ricorda: $\\hat n\\otimes\\hat n$ applicato a un vettore ne prende la parte lungo $\\hat n$; $\\tens I-\\hat n\\otimes\\hat n$ ne prende la parte nel piano perpendicolare a $\\hat n$; la somma dei due è l'identità $\\tens I$. Applicandoli a $\\vet t_n$ si ottiene il **teorema di decomposizione** (Teo 3.3.1):
$$\\vet t_n=(\\hat n\\otimes\\hat n)\\vet t_n+(\\tens I-\\hat n\\otimes\\hat n)\\vet t_n=\\sigma_n\\hat n+\\tau_n\\hat\\mu.$$
Il primo addendo è la tensione normale, il secondo la tangenziale.

Le due parti non sono note allo stesso modo. La direzione della normale è $\\hat n$, che conosciamo; la direzione $\\hat\\mu$ della tangenziale invece **in generale è incognita** e va calcolata. In alternativa si fissano due assi nel piano del taglio e si usano le due componenti $\\tau_{n1}$, $\\tau_{n2}$.

Una convenzione sugli indici (§3.3): in $\\tau_{ni}$ il **primo indice è la giacitura**, il secondo la **direzione**. Per la normale si scrive semplicemente $\\sigma_n$ invece di $\\sigma_{nn}$.`,
      },
      {
        id: 'l31-14',
        kind: 'domanda',
        q: { id: 'l31-q1', kind: 'scelta', q: `Quale proiettore, applicato a $\\vet t_n$, dà la tensione tangenziale?`, options: [`$\\tens I-\\hat n\\otimes\\hat n$`, `$\\hat n\\otimes\\hat n$`, `$\\tens I$`, `$\\hat\\mu\\otimes\\hat n$`], correct: 0, why: `La tangenziale è la parte di $\\vet t_n$ nel piano del taglio, cioè perpendicolare a $\\hat n$: la prende il proiettore ortogonale $\\tens I-\\hat n\\otimes\\hat n$ (Teo 3.3.1). $\\hat n\\otimes\\hat n$ dà invece la parte normale, $\\tens I$ restituisce tutto il vettore. $\\hat\\mu\\otimes\\hat n$ non è un proiettore, e per di più $\\hat\\mu$ è proprio ciò che non conosciamo.` },
      },
      {
        id: 'l31-15',
        kind: 'spiega',
        title: 'Attenzione a non confondere',
        md: `Tre errori ricorrono all'orale su questo argomento.

1. **Pensare che $\\vet t_n$ dipenda dalla forma della superficie di taglio.** È tentante, perché il taglio «reale» potrebbe essere curvo. Ma nel punto conta solo la normale $\\hat n$: superfici diverse con la stessa normale in $x$ danno lo stesso vettore tensione (§3.2.3).
2. **Presentare i principi di Eulero e di Cauchy come teoremi.** Sono assiomi: non si dimostrano, si giustificano con la predittività della teoria. Se all'orale ti chiedono «perché valgono?», la risposta è la riprova sperimentale.
3. **Scambiare gli indici di $\\tau_{ni}$.** Il primo indice dice su quale giacitura agisce la tangenziale, il secondo in quale direzione. La stessa convenzione tornerà con $\\tau_{ij}$ nella matrice del tensore di tensione.`,
      },
      {
        id: 'l31-16',
        kind: 'riassunto',
        md: `**Il filo della lezione.** Su un corpo agiscono forze di volume, a distanza, e forze di superficie, per contatto sulla frontiera; ma perché i carichi arrivino ai vincoli la materia deve trasmetterli, quindi attraverso ogni taglio ideale le due parti si scambiano forze interne. Il principio di Eulero dice che queste forze interne sono forze di superficie sul taglio; quello di Cauchy le riduce, nel limite, a un vettore tensione $\\vet t_n$ per ogni punto e ogni giacitura, con momento trascurabile (quando non lo è servono i continui polari). Entrambi sono assiomi. Il vettore tensione dipende solo dalla giacitura, e si scompone in una parte normale, che tende a lacerare o a comprimere, e una tangenziale, che tende a far scivolare.

- Dimensioni: $|\\vet b|=[F][L^{-3}]$, $|\\hat{\\vet s}|=[F][L^{-2}]$ (§3.1).
- Principio delle tensioni: $\\vet t_n(x):=\\lim\\limits_{\\operatorname{diam}\\Delta A\\to0}\\Delta\\vet F/\\Delta A$, $\\ \\lim\\limits_{\\operatorname{diam}\\Delta A\\to0}\\Delta\\vet M/\\Delta A=\\vet 0$ (Def 3.2.2).
- Decomposizione: $\\vet t_n=(\\hat n\\otimes\\hat n)\\vet t_n+(\\tens I-\\hat n\\otimes\\hat n)\\vet t_n=\\sigma_n\\hat n+\\tau_n\\hat\\mu$ (Teo 3.3.1).
- Tensione normale: $\\sigma_n=\\vet t_n\\cdot\\hat n$, positiva se di trazione (§3.3).`,
        orale: ['Classi di forze su un continuo; perché servono le forze interne. (dispensa, domanda 1)', 'Principio delle sezioni di Eulero e principio delle tensioni di Cauchy: enunciati, perché sono assiomi, limiti. (dispensa, domanda 2)', 'Il vettore tensione dipende dalla giacitura e non dalla forma della superficie; componenti normale e tangenziale. (dispensa, domanda 3)'],
      },
    ],
  },
  // ================================================================== c3.2
  {
    concept: 'c3.2',
    title: 'Equilibrio di ogni parte e lemma di Cauchy',
    minutes: 26,
    source: D(3, '3.4–3.5', 'Def 3.4.1, Teo 3.4.2, Teo 3.5.1', '40–42'),
    visual: ST({ mode: 'taglio', preset: 'esercizio', presets: ['esercizio', 'generico'], controls: ['preset', 'dir'] }),
    steps: [
      {
        id: 'l32-1',
        kind: 'spiega',
        title: 'Dove siamo e dove andiamo',
        md: `Nella lezione precedente abbiamo dato un nome alle forze interne: in ogni punto $x$ e per ogni giacitura $\\hat n$ c'è un vettore tensione $\\vet t_n$, la forza per unità di area che una parte del corpo esercita sull'altra attraverso un taglio ideale. Non abbiamo ancora detto **quando** un corpo continuo è in equilibrio.

Questa lezione risponde a quella domanda. Le tappe sono quattro: vediamo come l'idea di equilibrio si allarga dal punto materiale al corpo continuo; enunciamo gli **assiomi di Eulero**, che chiedono l'equilibrio di ogni parte; capiamo con l'esempio del compasso perché le equazioni cardinali non bastano più; e dimostriamo il **lemma di Cauchy**, la versione «nel punto» del principio di azione e reazione. È la prima dimostrazione del capitolo, ed è anche una domanda d'orale.`,
      },
      {
        id: 'l32-2',
        kind: 'spiega',
        title: 'L\'equilibrio, un livello alla volta',
        md: `La dispensa costruisce l'idea di equilibrio per livelli successivi, ciascuno generalizzazione del precedente (§3.4).

- Per un **punto materiale** l'equilibrio è risultante nulla, $\\sum\\vet F_i=\\vet 0$.
- Per un **corpo rigido** servono le **equazioni cardinali della statica** (ECS): risultante nulla e momento risultante nullo rispetto a ogni polo $O$.
- Per un **sistema di corpi rigidi** le ECS si scrivono per ciascun corpo, non solo per il sistema intero.
- Per un **corpo continuo** il passo è lo stesso, ma le parti in cui il corpo si può dividere sono **infinite**: ogni porzione $\\mathcal P$ del corpo è una «parte».

Anche qui la dispensa ricorda che si tratta di un **assioma**: non si dimostra, si verifica attraverso la sua capacità di predire.`,
      },
      {
        id: 'l32-3',
        kind: 'spiega',
        title: 'Gli assiomi di Eulero: ogni parte in equilibrio',
        md: `Il passo naturale per il corpo continuo è chiedere le ECS a **ogni** sua parte. Sono gli **assiomi di Eulero** (Def 3.4.1): il corpo $\\mathcal B$ è in equilibrio se e solo se, per ogni parte $\\mathcal P$,
$$\\vet r(\\mathcal P)=\\vet 0,\\qquad\\vet m_O(\\mathcal P)=\\vet 0\\quad\\forall O,\\ \\forall\\mathcal P\\subseteq\\mathcal B.$$
Qui $\\vet r(\\mathcal P)$ è la **risultante** di tutte le forze che agiscono su $\\mathcal P$ e $\\vet m_O(\\mathcal P)$ il loro **momento risultante** rispetto al polo $O$.

Perché è così importante il «per ogni parte»? Perché le parti possono essere piccole a piacere e stare ovunque: chiedere l'equilibrio di tutte vuol dire chiederlo, in pratica, **in ogni punto interno**. Ed è questa la differenza tra le due discipline che la dispensa mette a confronto. La meccanica razionale studia il **corpo rigido**: ne interessa il moto complessivo, non c'è stato interno di tensione (un'asta lanciata). La Scienza delle Costruzioni studia il **corpo continuo**: ne interessa lo stato interno di tensione e deformazione (una trave che si inflette).`,
      },
      {
        id: 'l32-4',
        kind: 'spiega',
        title: 'Quali forze agiscono su una parte interna',
        md: `Per usare gli assiomi bisogna saper scrivere $\\vet r(\\mathcal P)$ e $\\vet m_O(\\mathcal P)$ (§3.4.1). Cominciamo da una **parte interna**, cioè una parte che non tocca la frontiera del corpo: $\\partial\\mathcal P\\cap\\partial\\mathcal B=\\emptyset$.

Su di essa agiscono due cose. Nel suo volume, le forze di volume $\\vet b$. Sulla sua frontiera $\\partial\\mathcal P$, le forze che il resto del corpo le esercita: per il principio di Eulero sono forze di superficie, e per quello di Cauchy in ogni punto valgono $\\vet t_n$, dove $\\hat n$ è la **normale esterna** a $\\mathcal P$ (della superficie curva conta il piano tangente, come abbiamo visto). Sommando su tutto:
$$\\vet r(\\mathcal P)=\\int_{\\mathcal P}\\vet b\\,dV+\\int_{\\partial\\mathcal P}\\vet t_n\\,dA,$$
$$\\vet m_O(\\mathcal P)=\\int_{\\mathcal P}(x-O)\\wedge\\vet b\\,dV+\\int_{\\partial\\mathcal P}(x-O)\\wedge\\vet t_n\\,dA.$$
Nel momento ogni forza è moltiplicata vettorialmente per il suo braccio $x-O$, come per un sistema di forze concentrate.`,
      },
      {
        id: 'l32-5',
        kind: 'spiega',
        title: 'E se la parte tocca la frontiera del corpo?',
        md: `Una parte può anche **affiorare**, cioè avere un pezzo della propria frontiera sulla frontiera del corpo. Allora la frontiera di $\\mathcal P$ si divide in due tratti (§3.4.1):

- $\\partial\\mathcal P_2:=\\partial\\mathcal P\\cap\\partial\\mathcal B$, il tratto in comune con l'esterno: lì agiscono le forze di superficie esterne $\\hat{\\vet s}$;
- $\\partial\\mathcal P_1:=\\partial\\mathcal P-\\partial\\mathcal P_2$, il resto: lì agiscono le tensioni, come prima.

Nelle due formule si aggiungono quindi i termini $\\int_{\\partial\\mathcal P_2}\\hat{\\vet s}\\,dA$ nella risultante e $\\int_{\\partial\\mathcal P_2}(x-O)\\wedge\\hat{\\vet s}\\,dA$ nel momento.

Un caso particolare merita attenzione: se prendi come parte **tutto il corpo**, $\\mathcal P\\equiv\\mathcal B$, non resta nessuna superficie interna, e gli assiomi di Eulero diventano le ECS del corpo intero (§3.4.2). Le ECS sono quindi **un caso particolare** degli assiomi.`,
      },
      {
        id: 'l32-6',
        kind: 'domanda',
        q: { id: 'l32-q4', kind: 'scelta', q: `Su una parte interna $\\mathcal P$ (che non tocca $\\partial\\mathcal B$), quali forze compaiono in $\\vet r(\\mathcal P)$?`, options: [`Le forze di volume $\\vet b$ e le tensioni $\\vet t_n$ sulla frontiera $\\partial\\mathcal P$`, `Solo le forze esterne $\\vet b$ e $\\hat{\\vet s}$`, `Le forze di volume e le forze di superficie $\\hat{\\vet s}$ su $\\partial\\mathcal P$`, `Solo le tensioni, perché le forze di volume si annullano`], correct: 0, why: `Su una parte interna le forze $\\hat{\\vet s}$ non agiscono: agiscono solo sulla frontiera del corpo. Sulla frontiera di $\\mathcal P$ c'è il resto del corpo, che agisce con le tensioni (§3.4.1). Le forze di volume non si annullano: agiscono su ogni punto di $\\mathcal P$.` },
      },
      {
        id: 'l32-7',
        kind: 'spiega',
        title: 'Il compasso: le equazioni cardinali non bastano più',
        md: `Abbiamo appena visto che le ECS sono il caso $\\mathcal P=\\mathcal B$ degli assiomi di Eulero. Bastano da sole? Per un corpo deformabile **no**: sono **necessarie ma non sufficienti** (Teo 3.4.2).

L'esempio della dispensa è un **compasso**. Applica agli estremi delle due gambe due forze uguali, opposte e sulla stessa retta, che tendono ad allontanare le punte. La risultante è nulla, perché le forze sono opposte; il momento è nullo, perché sono sulla stessa retta e quindi non formano una coppia. Le ECS sono soddisfatte. Eppure il compasso **si apre**: non è in equilibrio.

Che cosa non va? Guarda una sola gamba: su di essa agisce una delle due forze, e la cerniera non riesce a bilanciarla perché lascia ruotare. Quella parte non è in equilibrio, e gli assiomi di Eulero, che chiedono l'equilibrio di ogni parte, lo rilevano; le ECS, che guardano solo il tutto, no. Se invece saldi la cerniera, il compasso diventa un corpo rigido e resta fermo: **le ECS bastano solo per il rigido**.`,
      },
      {
        id: 'l32-8',
        kind: 'domanda',
        q: { id: 'l32-q2', kind: 'vf', q: `Per un corpo deformabile, se le equazioni cardinali della statica sono soddisfatte, il corpo è in equilibrio.`, answer: false, why: `Le ECS sono solo necessarie (Teo 3.4.2). Il compasso con due forze opposte e collineari le soddisfa, ma si apre: una gamba, presa da sola, non è in equilibrio. Per il corpo deformabile serve l'equilibrio di ogni parte, cioè gli assiomi di Eulero.` },
      },
      {
        id: 'l32-9',
        kind: 'spiega',
        title: 'Il lemma di Cauchy: azione e reazione nel punto',
        md: `Ora usiamo gli assiomi per ottenere il primo risultato. Riprendi il taglio ideale: il piano per $x$ di normale $\\hat n$ divide il corpo in $\\mathcal B^+$ e $\\mathcal B^-$. Su ciascuna faccia del taglio agisce un vettore tensione, e bisogna fare attenzione a **chi agisce su chi**:

- $\\vet t_n$ è l'azione di $\\mathcal B^+$ su $\\mathcal B^-$ (giacitura $\\hat n$);
- $\\vet t_{-n}$ è l'azione di $\\mathcal B^-$ su $\\mathcal B^+$ (giacitura $-\\hat n$).

Il **lemma di Cauchy** (Teo 3.5.1) afferma che, se valgono gli assiomi di Eulero,
$$\\vet t_n(x)=-\\vet t_{-n}(x)\\qquad\\forall x,\\ \\forall\\hat n.$$
È la contropartita locale del principio di **azione e reazione**: le due facce del taglio si scambiano forze uguali e opposte.

L'idea della dimostrazione è scrivere l'equilibrio alla traslazione di $\\mathcal B^+$ e di $\\mathcal B^-$ separatamente, sommarle e vedere che cosa resta. Prima di cominciare fissiamo le normali esterne sulla sezione $A$: per $\\mathcal B^+$ la normale esterna è $-\\hat n$ (punta verso $\\mathcal B^-$), per $\\mathcal B^-$ è $\\hat n$.`,
      },
      {
        id: 'l32-10',
        kind: 'derivazione',
        title: 'Dimostrazione del lemma di Cauchy',
        md: `**Dove vogliamo arrivare:** $\\vet t_n=-\\vet t_{-n}$. **L'idea:** scriviamo $\\vet r=\\vet 0$ per le due metà; sommandole, le forze esterne ricompongono il corpo intero (e si annullano per le ECS), mentre restano solo le tensioni sulla sezione. È una catena di passaggi logici: non c'è nulla da calcolare numericamente.`,
        source: D(3, '3.5', 'Teo 3.5.1', 42),
        der: {
          lines: [
            { tex: '\\int_{\\mathcal B^+}\\vet b\\,dV+\\int_{\\partial\\mathcal B^+}\\hat{\\vet s}\\,dA+\\int_A\\vet t_{-n}\\,dA=\\vet 0', why: `È l'assioma di Eulero $\\vet r(\\mathcal B^+)=\\vet 0$. $\\mathcal B^+$ è una parte affiorante: nel volume agisce $\\vet b$, sul tratto di frontiera esterna (qui scritto $\\partial\\mathcal B^+$) agisce $\\hat{\\vet s}$, e sulla sezione $A$ agisce l'azione di $\\mathcal B^-$, cioè il vettore tensione con la normale esterna di $\\mathcal B^+$, che è $-\\hat n$.` },
            { tex: '\\int_{\\mathcal B^-}\\vet b\\,dV+\\int_{\\partial\\mathcal B^-}\\hat{\\vet s}\\,dA+\\int_A\\vet t_{n}\\,dA=\\vet 0', why: `Lo stesso per l'altra metà, $\\vet r(\\mathcal B^-)=\\vet 0$. L'unica differenza è sulla sezione: la normale esterna di $\\mathcal B^-$ è $\\hat n$, quindi agisce $\\vet t_n$.` },
            { tex: '\\int_{\\mathcal B}\\vet b\\,dV+\\int_{\\partial\\mathcal B}\\hat{\\vet s}\\,dA+\\int_A(\\vet t_n+\\vet t_{-n})\\,dA=\\vet 0', why: `Abbiamo sommato membro a membro le due righe precedenti. Gli integrali di volume su $\\mathcal B^+$ e $\\mathcal B^-$ si uniscono in un integrale su tutto $\\mathcal B=\\mathcal B^+\\cup\\mathcal B^-$; allo stesso modo i due tratti di frontiera esterna formano tutta $\\partial\\mathcal B$. I due integrali sulla stessa sezione $A$ si raccolgono in uno solo.`, aggiunto: true },
            {
              tex: '\\underbrace{\\int_{\\mathcal B}\\vet b\\,dV+\\int_{\\partial\\mathcal B}\\hat{\\vet s}\\,dA}_{=\\vet r(\\mathcal B)=\\vet 0}+\\int_A(\\vet t_n+\\vet t_{-n})\\,dA=\\vet 0',
              why: `Riconosciamo nei primi due termini la risultante di tutte le forze esterne sul corpo intero, $\\vet r(\\mathcal B)$. È nulla, perché il corpo intero è una delle parti per cui valgono gli assiomi (sono le ECS). Quindi resta $\\int_A(\\vet t_n+\\vet t_{-n})\\,dA=\\vet 0$.`,
              ask: { q: `Perché i primi due integrali, insieme, si annullano?`, options: [`Sono la risultante delle forze esterne sul corpo intero, nulla per le ECS`, `Perché $\\vet b=\\vet 0$`, `Per il teorema della divergenza`, `Per la simmetria di $\\tens T$`], correct: 0, why: `Le ECS sono il caso $\\mathcal P=\\mathcal B$ degli assiomi di Eulero, e qui li stiamo supponendo validi. Non serve che $\\vet b$ sia nullo: si annulla la somma delle forze esterne, non ciascuna. Il teorema della divergenza e la simmetria di $\\tens T$ arriveranno solo con Cauchy–Poisson, che usa proprio questo lemma.` },
            },
            {
              tex: '\\vet t_n(x)+\\vet t_{-n}(x)=\\vet 0',
              why: `L'integrale su $A$ è nullo **qualunque** sezione si scelga: possiamo cambiare il piano, la sua posizione, la porzione di sezione considerata. Un integrale nullo su ogni dominio, con integranda continua, impone che l'integranda sia nulla in ogni punto: è l'**arbitrarietà del dominio**.`,
              ask: { q: `Che cosa permette di concludere che l'integranda è nulla?`, options: [`L'arbitrarietà del dominio di integrazione`, `Un integrale nullo implica sempre integranda nulla`, `La continuità di $\\vet b$`, `La linearità di $\\tens T$`], correct: 0, why: `Un integrale nullo su un solo dominio non basta: $\\int_0^{2\\pi}\\sin x\\,dx=0$ ma $\\sin x$ non è identicamente nulla (Attenzione di p. 42). Serve che l'integrale sia nullo su ogni dominio. La continuità di $\\vet b$ non c'entra, e $\\tens T$ non è ancora stato introdotto.` },
            },
            {
              tex: '\\Rightarrow\\ \\vet t_n(x)=-\\vet t_{-n}(x)',
              why: `Abbiamo portato $\\vet t_{-n}$ a destra dell'uguale, cambiandogli segno. È l'enunciato del lemma: i due vettori tensione sulle due facce del taglio sono opposti.`,
              eq: 'Teo 3.5.1',
            },
          ],
        },
      },
      {
        id: 'l32-11',
        kind: 'spiega',
        title: 'Che cosa abbiamo dimostrato',
        md: `Rileggiamo il risultato. Nel punto $x$, la forza per unità di area che $\\mathcal B^+$ esercita su $\\mathcal B^-$ è uguale e opposta a quella che $\\mathcal B^-$ esercita su $\\mathcal B^+$. Detto in termini di giaciture: **girare la normale cambia il segno del vettore tensione**.

Controllalo su un caso semplice (esempio aggiunto): una barra tirata alle due estremità. Fai un taglio trasversale. La parte di destra tira verso destra la parte di sinistra; la parte di sinistra tira verso sinistra quella di destra. Le due forze sono uguali e opposte, ed entrambe le facce sono in **trazione**: la tensione normale $\\sigma_n=\\vet t_n\\cdot\\hat n$ non cambia segno, perché cambiano segno sia $\\vet t_n$ sia $\\hat n$.

Nota infine **che cosa ha fatto il lavoro** nella dimostrazione: non un calcolo, ma l'arbitrarietà della sezione. Lo stesso argomento tornerà più volte nel capitolo, ogni volta che passeremo da un'equazione integrale a un'equazione nel punto. Nella prossima lezione il lemma servirà a trattare le facce del tetraedro di Cauchy.`,
      },
      {
        id: 'l32-12',
        kind: 'domanda',
        q: { id: 'l32-q3', kind: 'scelta', q: `Uno studente dice: «$\\int_A(\\vet t_n+\\vet t_{-n})\\,dA=\\vet 0$, quindi l'integranda è nulla, perché un integrale nullo implica integranda nulla». Che cosa c'è di sbagliato?`, options: [`L'implicazione è falsa in generale: serve che l'integrale sia nullo per ogni dominio $A$`, `Niente, il ragionamento è corretto`, `Bisognerebbe usare il teorema della divergenza`, `Serve anche la simmetria del tensore di tensione`], correct: 0, why: `$\\int_0^{2\\pi}\\sin x\\,dx=0$ eppure $\\sin x\\neq0$ quasi ovunque. La conclusione è giusta, ma la ragione è l'arbitrarietà del dominio, con l'integranda continua (§3.5). Teorema della divergenza e simmetria non intervengono nel lemma.` },
      },
      {
        id: 'l32-13',
        kind: 'spiega',
        title: 'Attenzione a non confondere',
        md: `Tre errori tipici su questa lezione.

1. **«Integrale nullo implica integranda nulla».** È falso: l'esempio di $\\sin x$ su $[0,2\\pi]$ lo smentisce. È vero se l'integrale è nullo **per ogni dominio** e l'integranda è continua. All'orale, nel lemma di Cauchy, nomina esplicitamente l'arbitrarietà del dominio.
2. **Credere che le ECS bastino per un corpo deformabile.** Bastano per il rigido; per il deformabile sono solo necessarie, e il compasso lo mostra. Serve l'equilibrio di ogni parte.
3. **Confondere chi agisce su chi.** $\\vet t_n$ è l'azione di $\\mathcal B^+$ (la parte verso cui punta $\\hat n$) su $\\mathcal B^-$. Sbagliare questa convenzione fa sbagliare le normali esterne, e quindi i segni, nella dimostrazione.`,
      },
      {
        id: 'l32-14',
        kind: 'riassunto',
        md: `**Il filo della lezione.** L'equilibrio si generalizza dal punto al rigido, ai sistemi di rigidi e infine al corpo continuo, che ha infinite parti: gli assiomi di Eulero chiedono risultante e momento nulli per ogni parte, e così l'equilibrio vale in ogni punto interno. Su una parte interna agiscono le forze di volume e le tensioni sulla frontiera; su una affiorante anche le forze esterne di superficie. Le ECS sono il caso della parte uguale al corpo intero: necessarie ma non sufficienti, come mostra il compasso. Scrivendo l'equilibrio delle due metà di un taglio e sommando si ottiene, per l'arbitrarietà del dominio, il lemma di Cauchy: azione e reazione nel punto.

- Assiomi di Eulero: $\\vet r(\\mathcal P)=\\vet 0$, $\\vet m_O(\\mathcal P)=\\vet 0$ $\\ \\forall O,\\ \\forall\\mathcal P\\subseteq\\mathcal B$ (Def 3.4.1).
- Parte interna: $\\vet r(\\mathcal P)=\\int_{\\mathcal P}\\vet b\\,dV+\\int_{\\partial\\mathcal P}\\vet t_n\\,dA$ (§3.4.1).
- ECS necessarie ma non sufficienti per il corpo deformabile (Teo 3.4.2).
- Lemma di Cauchy: $\\vet t_n(x)=-\\vet t_{-n}(x)$ (Teo 3.5.1).`,
        orale: ['Assiomi di Eulero; perché le ECS sono solo necessarie per il corpo deformabile (esempio del compasso). (dispensa, domanda 4)', 'Enunciare e dimostrare il lemma di Cauchy (ruolo dell’arbitrarietà del dominio). (dispensa, domanda 5)'],
      },
    ],
  },
  // ================================================================== c3.3
  {
    concept: 'c3.3',
    title: 'Cauchy–Poisson e il tetraedro',
    minutes: 32,
    source: D(3, '3.6–3.7.1', 'Teo 3.6.1', '42–45'),
    visual: ST({ mode: 'tetraedro', presets: ['esercizio', 'generico', 'trazione'], controls: ['preset', 'dir'] }),
    steps: [
      {
        id: 'l33-1',
        kind: 'spiega',
        title: 'Dove siamo e dove andiamo',
        md: `Nelle due lezioni precedenti abbiamo introdotto il vettore tensione $\\vet t_n$ e gli assiomi di Eulero, e ne abbiamo ricavato il lemma di Cauchy, $\\vet t_n=-\\vet t_{-n}$. Ci è rimasto però un problema aperto: in ogni punto ci sono $\\infty^2$ vettori tensione, uno per giacitura. Descrivere lo stato di tensione così sarebbe impraticabile.

Questa lezione presenta il **teorema di Cauchy–Poisson**, che la dispensa chiama il risultato principale della meccanica dei solidi. Ne leggiamo l'enunciato completo, capiamo il significato dei suoi tre punti e dimostriamo il **primo**: esiste un tensore $\\tens T$, il **tensore di tensione**, che manda ogni giacitura nel suo vettore tensione. Lo strumento della dimostrazione è un piccolo tetraedro, il **tetraedro di Cauchy**. Gli altri due punti saranno la lezione successiva.`,
      },
      {
        id: 'l33-2',
        kind: 'spiega',
        title: 'L\'enunciato di Cauchy–Poisson',
        md: `La condizione necessaria è dovuta a Cauchy (1823), la sufficiente a Poisson (1829). Ecco l'enunciato (Teo 3.6.1).

Dato un corpo $\\mathcal B$ soggetto a forze di volume $\\vet b$ e di superficie $\\hat{\\vet s}$, condizione necessaria e sufficiente per l'equilibrio è che valgano tre fatti.

1. In ogni punto $x$ esiste un tensore $\\tens T(x)\\in\\mathrm{Lin}$ (un'applicazione lineare dai vettori ai vettori) tale che $\\vet t_n(x)=\\tens T(x)\\hat n$ per ogni giacitura $\\hat n$. $\\tens T$ si chiama **tensore di tensione di Cauchy**.
2. Vale $\\operatorname{div}\\tens T(x)+\\vet b(x)=\\vet 0$ in ogni punto interno, $x\\in\\mathring{\\mathcal B}=\\mathcal B-\\partial\\mathcal B$: sono le **equazioni indefinite di equilibrio**.
3. $\\tens T$ è **simmetrico**: $\\tens T=\\tens T^T$, cioè $\\tens T\\in\\mathrm{Sym}$.

La dispensa aggiunge un'avvertenza che negli appunti mancava: per la **sufficienza** serve anche l'equilibrio al contorno, $\\tens T\\hat n=\\hat{\\vet s}$ su $\\partial\\mathcal B$, che nel problema elastico comparirà come condizione al contorno.`,
      },
      {
        id: 'l33-3',
        kind: 'spiega',
        title: 'Necessario e sufficiente, e il senso dei tre punti',
        md: `Ricorda la differenza tra le due condizioni con l'esempio della dispensa: avere la patente è **necessario** per guidare, ma non **sufficiente** (serve anche un'auto); stare guidando è **sufficiente** per dire che hai la patente. Qui «necessario» vuol dire: se il corpo è in equilibrio, allora valgono i tre punti.

Il riquadro «Per l'orale» di p. 43 dà il significato di ciascun punto.

1. Il primo punto è un **doppio risultato**. Dice che il tensore **esiste**, e rende il concetto di tensione **operativo**: invece di $\\infty^2$ informazioni per punto ne bastano **tre**, i vettori tensione su tre giaciture mutuamente ortogonali.
2. Il secondo trasforma l'equilibrio alla **traslazione** da forma integrale ($\\vet r(\\mathcal P)=\\vet 0$) a forma **locale**, cioè differenziale, grazie al teorema della divergenza.
3. Il terzo localizza l'equilibrio alla **rotazione** ($\\vet m_O(\\mathcal P)=\\vet 0$) nella simmetria di $\\tens T$.

Vedi la struttura: gli assiomi di Eulero chiedono due cose per ogni parte, e il teorema le trasforma in due proprietà nel punto, dopo aver costruito il tensore che serve per scriverle.`,
      },
      {
        id: 'l33-4',
        kind: 'domanda',
        q: { id: 'l33-q1', kind: 'scelta', q: `Grazie al punto 1 di Cauchy–Poisson, che cosa basta conoscere per avere il vettore tensione su tutte le giaciture di un punto?`, options: [`I vettori tensione su tre giaciture mutuamente ortogonali`, `I vettori tensione su $\\infty^2$ giaciture`, `La sola tensione normale su una giacitura`, `Le forze di volume nel punto`], correct: 0, why: `Il tensore $\\tens T$ è determinato dalla sua azione su una base: le tre colonne della matrice sono i vettori tensione sulle tre giaciture coordinate (riquadro di p. 43). Una sola componente su una giacitura non basta, e le forze di volume non entrano nel punto 1.` },
      },
      {
        id: 'l33-5',
        kind: 'spiega',
        title: 'Che cosa dimostriamo, e con quale parte del corpo',
        md: `La dispensa dimostra solo la condizione **necessaria**: la sufficiente richiederebbe passaggi che farebbero perdere di vista il significato meccanico (§3.7). Il punto di partenza sono gli assiomi di Eulero: supponiamo il corpo in equilibrio, quindi ogni sua parte in equilibrio, e ne ricaviamo i tre punti.

Per il punto 1 conviene scegliere una parte di forma molto particolare. Vogliamo legare il vettore tensione su una giacitura **qualunque** $\\hat n$ ai vettori tensione sulle tre giaciture coordinate $\\hat e_1,\\hat e_2,\\hat e_3$. Ci serve quindi un solido che abbia una faccia con normale $\\hat n$ e tre facce con normali coordinate: è un **tetraedro**. Lo mettiamo con un vertice proprio nel punto $x$ che ci interessa; poi lo faremo rimpicciolire fino a schiacciarlo su $x$, in modo che le sue facce diventino giaciture **nel punto**.`,
      },
      {
        id: 'l33-6',
        kind: 'spiega',
        title: 'Il tetraedro di Cauchy e le aree delle sue facce',
        md: `Descriviamo il tetraedro (§3.7.1). Ha un vertice in $x$ e quattro facce:

- tre facce sui piani coordinati per $x$; le loro **normali esterne** sono $-\\hat e_1,-\\hat e_2,-\\hat e_3$ (puntano fuori dal tetraedro, cioè «indietro» rispetto agli assi), e le loro aree sono $A_1,A_2,A_3$;
- una faccia inclinata, di area $A$ e normale esterna $\\hat n$, con componenti $n_i=\\hat n\\cdot\\hat e_i$ tutte positive.

Le tre facce coordinate sono le **proiezioni** della faccia inclinata sui piani coordinati. Proiettare un'area su un piano la moltiplica per il coseno dell'angolo tra le due normali, e quel coseno è proprio $\\hat e_i\\cdot\\hat n=n_i$. Quindi
$$A_i=A\\,(\\hat e_i\\cdot\\hat n)=A\\,n_i\\qquad\\Longrightarrow\\qquad\\frac{n_i}{A_i}=\\frac1A.$$
Un controllo: se $\\hat n=\\hat e_1$, la faccia inclinata è parallela al piano coordinato di normale $\\hat e_1$ e la sua proiezione la riproduce identica, $A_1=A$; sugli altri due piani si schiaccia in un segmento, $A_2=A_3=0$ (esempio aggiunto).

Nel modello a destra la faccia inclinata ha la normale che scegli con i cursori.`,
        visual: ST({ mode: 'tetraedro', preset: 'esercizio', presets: ['esercizio', 'generico'], controls: ['preset', 'dir'] }),
      },
      {
        id: 'l33-7',
        kind: 'domanda',
        q: { id: 'l33-q2', kind: 'scelta', q: `Sulla faccia del tetraedro di normale esterna $-\\hat e_2$, quale vettore tensione agisce?`, options: [`$\\vet t_{-e_2}=-\\vet t_{e_2}$, per il lemma di Cauchy`, `$\\vet t_{e_2}$`, `$\\vet t_n$`, `Nessuno: la faccia sta su un piano coordinato`], correct: 0, why: `Su una faccia agisce il vettore tensione della sua normale esterna, qui $-\\hat e_2$. Il lemma di Cauchy permette di riscriverlo come $-\\vet t_{e_2}$: è il passaggio che nella dimostrazione fa comparire i vettori tensione sulle giaciture coordinate. $\\vet t_n$ agisce sulla faccia inclinata.` },
      },
      {
        id: 'l33-8',
        kind: 'derivazione',
        title: 'Dall\'equilibrio del tetraedro al tensore',
        md: `**Dove vogliamo arrivare:** $\\vet t_n=\\sum_i\\vet t_{e_i}n_i$, e da lì all'esistenza di $\\tens T$ con $\\vet t_n=\\tens T\\hat n$. **L'idea:** scriviamo che il tetraedro è in equilibrio alla traslazione, dividiamo tutto per l'area $A$ e poi facciamo tendere il tetraedro al punto $x$ (la **localizzazione**). Nel limite il termine delle forze di volume sparisce, perché il volume si rimpicciolisce più in fretta dell'area. Le ultime tre righe sono verificate numericamente in componenti, su una matrice qualunque.`,
        source: D(3, '3.7.1', 'Teo 3.6.1', '44–45'),
        der: {
          sample: (r) => { const o: R = { k: idx(r) }; putMat(o, 'T', T.randMat(r)); putVec(o, 'n', T.unit([0.1 + r(), 0.1 + r(), 0.1 + r()])); return o; },
          lines: [
            { tex: '\\int_\\Delta\\vet b\\,dV+\\int_A\\vet t_n\\,dA+\\sum_{i=1}^3\\int_{A_i}\\vet t_{-e_i}\\,dA_i=\\vet 0', why: `È l'assioma di Eulero $\\vet r=\\vet 0$ per il tetraedro $\\Delta$, che è una parte interna. Nel volume agisce $\\vet b$; sulla faccia inclinata agisce il vettore tensione della sua normale esterna $\\hat n$; su ciascuna faccia coordinata quello della normale esterna $-\\hat e_i$.` },
            { tex: '\\frac1A\\int_\\Delta\\vet b\\,dV+\\frac1A\\int_A\\vet t_n\\,dA+\\sum_{i=1}^3\\frac1A\\int_{A_i}\\vet t_{-e_i}\\,dA_i=\\vet 0', why: `Abbiamo diviso ogni termine per l'area $A$ della faccia inclinata. È lecito perché $A>0$, e serve perché nel limite vogliamo ottenere forze per unità di area, cioè vettori tensione.`, aggiunto: true },
            { tex: '\\frac1A\\int_\\Delta\\vet b\\,dV+\\frac1A\\int_A\\vet t_n\\,dA-\\sum_{i=1}^3\\frac1A\\int_{A_i}\\vet t_{e_i}\\,dA_i=\\vet 0', why: `Abbiamo usato il lemma di Cauchy della lezione precedente: $\\vet t_{-e_i}=-\\vet t_{e_i}$. Il segno meno esce dall'integrale e cambia il «più» della somma in un «meno». Così compaiono i vettori tensione sulle giaciture coordinate positive.`, aggiunto: true },
            { tex: '\\frac1A\\int_\\Delta\\vet b\\,dV+\\frac1A\\int_A\\vet t_n\\,dA-\\sum_{i=1}^3\\frac{n_i}{A_i}\\int_{A_i}\\vet t_{e_i}\\,dA_i=\\vet 0', why: `Abbiamo sostituito $\\frac1A=\\frac{n_i}{A_i}$, che viene da $A_i=An_i$. Lo scopo è avere ogni integrale diviso per l'area della **propria** faccia: $\\frac1{A_i}\\int_{A_i}\\vet t_{e_i}\\,dA_i$ è la media di $\\vet t_{e_i}$ su quella faccia.` },
            {
              tex: '\\frac1A\\int_\\Delta\\vet b\\,dV=O(d)\\ \\longrightarrow\\ \\vet 0',
              why: `Ora la localizzazione. Sia $d$ la distanza da $x$ del baricentro della faccia inclinata; facciamo tendere $d$ a zero traslando la faccia parallelamente a sé stessa, così $\\hat n$ e i rapporti tra le aree non cambiano. Il volume del tetraedro va come $d^3$, l'area come $d^2$: il loro rapporto va come $d$, e tende a zero.`,
              ask: { q: `Perché il termine delle forze di volume sparisce nel limite?`, options: [`Perché il volume decresce come $d^3$ e l'area come $d^2$: il rapporto va come $d$`, `Perché $\\vet b=\\vet 0$ per ipotesi`, `Per il lemma di Cauchy`, `Perché il tetraedro è rigido`], correct: 0, why: `Le forze di volume ci sono, ma nel limite pesano sempre meno rispetto a quelle di superficie (§3.7.1). Non si suppone $\\vet b=\\vet 0$; il lemma di Cauchy l'abbiamo già usato per le facce coordinate; la rigidità non c'entra.` },
            },
            {
              tex: '\\vet t_n(x)-\\sum_{i=1}^3n_i\\,\\vet t_{e_i}(x)=\\vet 0',
              why: `Gli altri termini sono medie di vettori tensione su facce che si stringono attorno a $x$: per la definizione di Cauchy tendono ai vettori tensione in $x$, cioè $\\frac1A\\int_A\\vet t_n\\,dA\\to\\vet t_n(x)$ e $\\frac1{A_i}\\int_{A_i}\\vet t_{e_i}\\,dA_i\\to\\vet t_{e_i}(x)$. Le $n_i$ restano fisse.`,
            },
            { tex: '(\\vet t_n)_k=\\Big[\\textstyle\\sum_i n_i\\,\\vet t_{e_i}\\Big]_k', why: `Abbiamo portato la somma a destra e guardiamo una sola componente, la $k$-esima. Nel campione numerico $\\vet t_{e_i}$ è la colonna $i$ di una matrice qualunque.`, val: (v) => [0, 1, 2].reduce((s, i) => s + v[`n${i}`] * T.col(mat(v, 'T'), i)[v.k], 0) },
            { tex: '=\\textstyle\\sum_i (\\vet t_{e_i})_k\\,n_i=\\sum_i T_{ki}\\,n_i', why: `Abbiamo dato un nome ai numeri: $T_{ki}$ è la componente $k$ del vettore tensione $\\vet t_{e_i}$. Disponendo questi nove numeri in una matrice, la colonna $i$ contiene proprio $\\vet t_{e_i}$.`, val: (v) => [0, 1, 2].reduce((s, i) => s + T.at(mat(v, 'T'), v.k, i) * v[`n${i}`], 0) },
            { tex: '=\\big([\\tens T]\\{\\hat n\\}\\big)_k\\ \\Rightarrow\\ \\vet t_n=\\tens T\\hat n', why: `$\\sum_iT_{ki}n_i$ è la riga $k$ della matrice per la colonna delle componenti di $\\hat n$: è il prodotto righe per colonna. La relazione tra $\\hat n$ e $\\vet t_n$ è quindi **lineare**, e un'applicazione lineare dai vettori ai vettori è un tensore: esiste $\\tens T$, con $T_{ij}=\\tens T\\hat e_j\\cdot\\hat e_i=(\\vet t_{e_j})_i$.`, val: (v) => T.apply(mat(v, 'T'), vec(v, 'n'))[v.k], eq: 'Teo 3.6.1, punto 1' },
          ],
        },
      },
      {
        id: 'l33-9',
        kind: 'spiega',
        title: 'Che cosa dice il risultato, e un controllo',
        md: `Rileggiamo a parole: **il vettore tensione su una giacitura qualunque è una combinazione dei tre vettori tensione sulle giaciture coordinate, pesata con le componenti della normale**, $\\vet t_n=\\sum_i\\vet t_{e_i}n_i$. Siccome la dipendenza da $\\hat n$ è lineare, c'è un tensore che la rappresenta: $\\vet t_n=\\tens T\\hat n$.

Controllo su un caso particolare: prendi $\\hat n=\\hat e_1$. Allora $n_1=1$, $n_2=n_3=0$, e la formula dà $\\vet t_{e_1}=\\vet t_{e_1}$: nessuna contraddizione. E in componenti $\\tens T\\hat e_1$ è la prima colonna della matrice: **la colonna $j$ della matrice di $\\tens T$ è il vettore tensione sulla giacitura $\\hat e_j$**, $T_{ij}=(\\vet t_{e_j})_i$. È la stessa regola del Modulo 1 per qualunque tensore, $A_{ij}=\\tens A\\hat e_j\\cdot\\hat e_i$.

Ecco perché il risultato è **operativo**: tre vettori, cioè nove numeri, sostituiscono gli $\\infty^2$ vettori tensione del punto. Tutti i calcoli delle prossime lezioni partono da qui.`,
      },
      {
        id: 'l33-10',
        kind: 'prova',
        title: 'Controlla il tetraedro sul modello',
        md: `Sulla faccia inclinata agisce $\\vet t_n$ (in arancio), sulle facce coordinate agiscono $\\vet t_{-e_i}=-\\vet t_{e_i}$. Nella tabella sotto il modello il motore confronta $\\tens T\\hat n$ con $\\sum_i\\vet t_{e_i}n_i$.`,
        tasks: [`Muovi la giacitura della faccia inclinata: le due righe della tabella restano uguali per ogni scelta. È il teorema del tetraedro.`, `Scegli «trazione semplice»: solo la faccia di normale $-\\hat e_1$ è caricata, perché $\\vet t_{e_2}$ e $\\vet t_{e_3}$ sono nulli. Il vettore sulla faccia inclinata resta parallelo all'asse x.`],
        visual: ST({ mode: 'tetraedro', preset: 'generico', presets: ['generico', 'esercizio', 'trazione'], controls: ['preset', 'dir'] }),
      },
      {
        id: 'l33-11',
        kind: 'domanda',
        q: { id: 'l33-q3', kind: 'vf', q: `Nella dimostrazione del tetraedro le forze di volume si possono trascurare perché, nel limite, il loro contributo diviso per $A$ tende a zero.`, answer: true, why: `Il volume va come $d^3$ e l'area come $d^2$: $\\frac1A\\int_\\Delta\\vet b\\,dV$ è $O(d)$ e tende a zero (§3.7.1). Non si suppone che $\\vet b$ sia nullo: semplicemente nel punto le forze di superficie dominano.` },
      },
      {
        id: 'l33-12',
        kind: 'spiega',
        title: 'Attenzione a non confondere',
        md: `Tre errori tipici su questa dimostrazione.

1. **Dimenticare il lemma di Cauchy.** Sulle facce coordinate la normale esterna è $-\\hat e_i$, quindi agisce $\\vet t_{-e_i}$, non $\\vet t_{e_i}$. Senza il lemma, $\\vet t_{-e_i}=-\\vet t_{e_i}$, i segni non tornano e i vettori tensione sulle giaciture coordinate non compaiono.
2. **Credere che le forze di volume contino nel limite.** Decrescono come $d^3$, contro il $d^2$ delle superfici: divise per l'area, tendono a zero. Questa è anche la ragione per cui la tensione si può definire punto per punto.
3. **Scambiare righe e colonne.** Nel tetraedro la colonna $j$ della matrice di $\\tens T$ è $\\vet t_{e_j}$: $T_{ij}=(\\vet t_{e_j})_i$. Nella dimostrazione della simmetria la dispensa userà la convenzione per righe (nota NF-06); vedremo che per un tensore simmetrico la differenza non conta.`,
      },
      {
        id: 'l33-13',
        kind: 'riassunto',
        md: `**Il filo della lezione.** In un punto ci sono infiniti vettori tensione, e il teorema di Cauchy–Poisson (necessaria di Cauchy, sufficiente di Poisson) dice che l'equilibrio equivale a tre fatti: esiste un tensore di tensione, valgono le equazioni indefinite nell'interno, il tensore è simmetrico; per la sufficienza serve anche l'equilibrio al contorno. Il primo punto si dimostra con un tetraedro con vertice nel punto: le facce coordinate hanno area $An_i$, sulle facce coordinate il lemma di Cauchy cambia segno ai vettori tensione, e facendo tendere il tetraedro al punto le forze di volume spariscono. Resta $\\vet t_n=\\sum_i\\vet t_{e_i}n_i$, lineare in $\\hat n$: esiste $\\tens T$, e bastano tre giaciture ortogonali.

- Tensore di tensione: $\\vet t_n(x)=\\tens T(x)\\hat n$ $\\ \\forall\\hat n$ (Teo 3.6.1, punto 1).
- Aree del tetraedro: $A_i=A\\,(\\hat e_i\\cdot\\hat n)=A\\,n_i$ (§3.7.1).
- Teorema del tetraedro: $\\vet t_n(x)=\\sum_{i=1}^3\\vet t_{e_i}(x)\\,n_i$ (§3.7.1).
- Colonne = vettori tensione: $T_{ij}=\\tens T\\hat e_j\\cdot\\hat e_i=(\\vet t_{e_j})_i$ (§3.7.1).`,
        orale: ['Enunciare il teorema di Cauchy–Poisson; significato dei tre punti. (dispensa, domanda 6)', 'Dimostrare il punto 1 (tetraedro di Cauchy). (dispensa, domanda 7)'],
      },
    ],
  },
  // ================================================================== c3.4
  {
    concept: 'c3.4',
    title: 'Equilibrio locale e simmetria',
    minutes: 32,
    source: D(3, '3.7.2–3.8', 'Teo 3.7.1', '45–48'),
    visual: ST({ mode: 'parallelepipedo', presets: ['scorrimento', 'esercizio', 'generico'], controls: ['preset'] }),
    steps: [
      {
        id: 'l34-0',
        kind: 'spiega',
        title: 'Dove siamo e dove andiamo',
        md: `Nella lezione precedente abbiamo dimostrato il punto 1 del teorema di Cauchy–Poisson: in ogni punto esiste il tensore di tensione $\\tens T$, e il vettore tensione su qualunque giacitura è $\\vet t_n=\\tens T\\hat n$. Restano da dimostrare gli altri due punti, che riguardano l'equilibrio vero e proprio.

Gli assiomi di Eulero chiedono due cose a ogni parte del corpo: risultante nulla (equilibrio alla **traslazione**) e momento nullo (equilibrio alla **rotazione**). In questa lezione le trasformiamo entrambe in condizioni **nel punto**. La prima diventa un sistema di equazioni differenziali, le **equazioni indefinite di equilibrio** $\\operatorname{div}\\tens T+\\vet b=\\vet 0$; la seconda diventa la **simmetria** di $\\tens T$, che in termini di tensioni si chiama **reciprocità delle tensioni tangenziali**. Gli strumenti sono due: il teorema della divergenza del Modulo 1 e un piccolo parallelepipedo.`,
      },
      {
        id: 'l34-1a',
        kind: 'spiega',
        title: 'L\'idea: da un integrale sulla superficie a uno sul volume',
        md: `Prendi una parte interna qualunque $\\mathcal P$, cioè contenuta nell'interno $\\mathring{\\mathcal B}$ del corpo. Il suo equilibrio alla traslazione contiene due integrali di natura diversa: uno sul **volume** di $\\mathcal P$, quello delle forze di volume, e uno sulla **superficie** $\\partial\\mathcal P$, quello delle tensioni. Finché sono su domini diversi non possiamo metterli insieme, e quindi non possiamo usare l'argomento che conosciamo dal lemma di Cauchy: «integrale nullo su ogni dominio, quindi integranda nulla».

Ci serve allora uno strumento che trasformi l'integrale di superficie in un integrale di volume. È il **teorema della divergenza** (Teo 1.8.4): l'integrale su una superficie chiusa del «flusso» $\\tens A\\hat n$ di un campo tensoriale è uguale all'integrale, sul volume racchiuso, della sua **divergenza** $\\operatorname{div}\\tens A$. Ricorda che la divergenza di un tensore è un vettore, e che in componenti si fa **per righe**: $(\\operatorname{div}\\tens A)_i=\\sum_j\\partial A_{ij}/\\partial x_j$ (Def 1.8.3). È proprio qui che il punto 1 diventa indispensabile: senza $\\vet t_n=\\tens T\\hat n$ non avremmo un campo tensoriale a cui applicare il teorema.`,
      },
      {
        id: 'l34-1',
        kind: 'derivazione',
        title: 'Punto 2: le equazioni indefinite di equilibrio',
        md: `**Dove vogliamo arrivare:** $\\operatorname{div}\\tens T+\\vet b=\\vet 0$ in ogni punto interno. **La strategia:** scriviamo $\\vet r(\\mathcal P)=\\vet 0$ per una parte interna, sostituiamo $\\vet t_n=\\tens T\\hat n$, portiamo tutto sul volume con il teorema della divergenza e concludiamo con l'arbitrarietà di $\\mathcal P$.`,
        source: D(3, '3.7.2', 'Teo 3.6.1, punto 2', 45),
        der: {
          lines: [
            { tex: '\\int_{\\mathcal P}\\vet b\\,dV+\\int_{\\partial\\mathcal P}\\vet t_n\\,dA=\\vet 0', why: `È l'assioma di Eulero $\\vet r(\\mathcal P)=\\vet 0$ per una parte interna: nel volume agiscono le forze di volume, sulla frontiera solo le tensioni, ciascuna sulla giacitura della normale esterna $\\hat n$ (§3.4.1).` },
            { tex: '\\int_{\\mathcal P}\\vet b\\,dV+\\int_{\\partial\\mathcal P}\\tens T\\hat n\\,dA=\\vet 0', why: `Abbiamo sostituito il vettore tensione con la sua espressione data dal punto 1, $\\vet t_n=\\tens T\\hat n$. Ora nell'integrale di superficie compare il flusso di un campo tensoriale.` },
            {
              tex: '\\int_{\\mathcal P}\\vet b\\,dV+\\int_{\\mathcal P}\\operatorname{div}\\tens T\\,dV=\\vet 0',
              aggiunto: true,
              why: `Abbiamo applicato il teorema della divergenza (Teo 1.8.4) al secondo integrale: $\\int_{\\partial\\mathcal P}\\tens T\\hat n\\,dA=\\int_{\\mathcal P}\\operatorname{div}\\tens T\\,dV$. Ora entrambi gli integrali sono sullo stesso dominio, il volume di $\\mathcal P$.`,
              ask: { q: `Quale teorema trasforma l'integrale di superficie in un integrale di volume?`, options: [`Il teorema della divergenza`, `Il lemma di Cauchy`, `Il teorema spettrale`, `Il teorema di Schwarz`], correct: 0, why: `Teo 1.8.4: $\\int_{\\partial D}\\tens A\\hat n\\,dA=\\int_D\\operatorname{div}\\tens A\\,dV$. Il lemma di Cauchy riguarda il cambio di segno della normale, il teorema spettrale gli autovalori, quello di Schwarz l'ordine delle derivate: nessuno dei tre cambia il dominio di integrazione.` },
            },
            { tex: '\\int_{\\mathcal P}\\big(\\vet b+\\operatorname{div}\\tens T\\big)\\,dV=\\vet 0', why: `Due integrali sullo stesso dominio si sommano in un unico integrale della somma: è la linearità dell'integrale.` },
            { tex: '\\Rightarrow\\ \\operatorname{div}\\tens T+\\vet b=\\vet 0\\quad\\forall x\\in\\mathring{\\mathcal B}', why: `La parte $\\mathcal P$ è arbitraria: l'integrale è nullo su ogni regione interna. Come nel lemma di Cauchy, per l'arbitrarietà del dominio l'integranda è nulla in ogni punto interno.`, eq: 'Teo 3.6.1, punto 2' },
          ],
        },
      },
      {
        id: 'l34-2',
        kind: 'spiega',
        title: 'Che cosa dicono le equazioni indefinite',
        md: `Rileggiamo il risultato. L'equilibrio alla traslazione, che gli assiomi chiedono per ogni parte, equivale in ogni punto interno a un'equazione: la divergenza del tensore di tensione bilancia le forze di volume. Scritta in componenti, con la divergenza per righe (§3.8):
$$\\frac{\\partial T_{i1}}{\\partial x_1}+\\frac{\\partial T_{i2}}{\\partial x_2}+\\frac{\\partial T_{i3}}{\\partial x_3}+b_i=0,\\qquad i=1,2,3.$$
Sono tre equazioni alle derivate parziali: dicono come le tensioni devono **variare** da punto a punto perché ogni pezzetto di materia sia in equilibrio.

Un caso particolare per controllare (esempio aggiunto): se le forze di volume sono nulle e la tensione è uguale in tutti i punti, tutte le derivate sono zero e le equazioni sono soddisfatte. È ragionevole: in un pezzetto qualunque di un corpo così, le forze sulle facce opposte sono uguali e contrarie per il lemma di Cauchy, e si bilanciano. Se invece c'è il peso, $\\vet b\\neq\\vet 0$, la tensione **deve** variare con la quota, perché ogni strato regge il peso di quelli sopra.`,
      },
      {
        id: 'l34-2q',
        kind: 'domanda',
        q: { id: 'l34-q2', kind: 'scelta', q: `Nella dimostrazione del punto 2, perché serve il punto 1 ($\\vet t_n=\\tens T\\hat n$)?`, options: [`Perché il teorema della divergenza si applica al flusso $\\tens T\\hat n$ di un campo tensoriale: senza il tensore non potremmo trasformare l'integrale di superficie`, `Perché il punto 1 garantisce che $\\vet b=\\vet 0$`, `Perché il punto 1 dice che $\\tens T$ è simmetrico`, `Non serve: il punto 2 si dimostra direttamente dal lemma di Cauchy`], correct: 0, why: `Il teorema della divergenza (Teo 1.8.4) lega $\\int_{\\partial\\mathcal P}\\tens T\\hat n\\,dA$ a $\\int_{\\mathcal P}\\operatorname{div}\\tens T\\,dV$: richiede che la forza sulla superficie sia scritta come un tensore applicato alla normale. Il punto 1 non dice nulla su $\\vet b$ né sulla simmetria, che è il punto 3.` },
      },
      {
        id: 'l34-3a',
        kind: 'spiega',
        title: 'Tre osservazioni: regolarità, interno, div o Div',
        md: `La dispensa accompagna il punto 2 con tre osservazioni (§3.8), tutte possibili domande d'orale.

**Regolarità.** Per fare la divergenza di $\\tens T$ bisogna poterlo derivare. Si dimostra che $\\tens T$ è abbastanza regolare se discende dal punto 1.

**Perché nell'interno $\\mathring{\\mathcal B}$.** Le derivate sono limiti di **rapporti incrementali**: per derivare in un punto bisogna potersi spostare un poco in tutte le direzioni. Sulla frontiera non si può incrementare verso l'esterno, perché lì il corpo finisce; all'interno sì, senza limitazioni. Sulla frontiera vale invece l'equilibrio al contorno $\\tens T\\hat n=\\hat{\\vet s}$, che abbiamo incontrato nell'enunciato.

**div o Div.** Con il minuscolo si indica la divergenza fatta nella configurazione **attuale**, con il maiuscolo quella fatta nella configurazione di **riferimento** (Cap. 2). L'equilibrio, in generale, va scritto nella configurazione attuale: è lì che il corpo si trova quando le forze agiscono. Se però spostamenti e deformazioni sono piccoli, $\\|\\tens H\\|\\ll1$ e $|\\vet u|\\ll1$, vale l'**equilibrio referenziale** del capitolo 2 e la differenza è trascurabile. La dispensa scrive comunque il minuscolo, per ricordare la regola generale.`,
      },
      {
        id: 'l34-3q',
        kind: 'domanda',
        q: { id: 'l34-q3', kind: 'vf', q: `Le equazioni indefinite di equilibrio valgono anche nei punti della frontiera $\\partial\\mathcal B$.`, answer: false, why: `Valgono nell'interno $\\mathring{\\mathcal B}$: sulla frontiera non si può incrementare verso l'esterno, quindi le derivate non si possono fare in tutte le direzioni (§3.8). Sulla frontiera si scrive invece l'equilibrio al contorno $\\tens T\\hat n=\\hat{\\vet s}$.` },
      },
      {
        id: 'l34-3',
        kind: 'spiega',
        title: 'Punto 3: perché un parallelepipedo',
        md: `Passiamo all'equilibrio alla **rotazione**. Questa volta la dispensa non usa il teorema della divergenza, ma una parte di forma comoda: un **parallelepipedo infinitesimo** con spigoli $dx_1,dx_2,dx_3$ paralleli agli assi e un vertice in $x$ (§3.7.3). Le sue facce hanno normali $\\pm\\hat e_1,\\pm\\hat e_2,\\pm\\hat e_3$, quindi su ciascuna agiscono vettori tensione di giaciture coordinate, le cui componenti sono proprio i $T_{ij}$.

Gli assiomi chiedono momento nullo rispetto a ogni polo. La dispensa impone che sia nullo il **momento assiale** rispetto a tre assi ortogonali per un punto. Basta, perché quando la risultante è nulla il momento non dipende dal polo, e un vettore con tre componenti nulle è nullo (passaggio aggiunto). Come assi sceglie $u,v,w$ che passano per il **baricentro** $G$ del parallelepipedo e sono paralleli agli spigoli.

Una nota sulla notazione. Qui la dispensa scrive $T_{ij}=\\vet t_{e_i}\\cdot\\hat e_j$: **primo indice la giacitura, secondo la direzione**. Nel tetraedro avevamo $T_{ij}=(\\vet t_{e_j})_i$, per colonne. È la nota NF-06: per un tensore simmetrico, che è proprio ciò che stiamo per dimostrare, le due letture coincidono.`,
      },
      {
        id: 'l34-3b',
        kind: 'spiega',
        title: 'Quali forze danno momento attorno all\'asse u',
        md: `Fissiamo l'asse $u$, parallelo a $\\hat e_1$ e passante per $G$, e chiediamoci quali forze hanno momento rispetto a esso.

- Le **forze di volume** hanno risultante $\\vet b\\,dx_1dx_2dx_3$ applicata in $G$: passano per l'asse, momento nullo.
- Sulla faccia di normale $-\\hat e_i$, quella che contiene $x$, agiscono le componenti $-T_{ij}$ (lemma di Cauchy). Sulla faccia opposta, di normale $+\\hat e_i$ e a distanza $dx_i$, la tensione è cambiata di poco: le componenti sono $T_{ij}+\\frac{\\partial T_{ij}}{\\partial x_i}dx_i$, cioè il valore in $x$ più la sua variazione al primo ordine.
- Sulle facce $\\pm\\hat e_1$, perpendicolari all'asse, le forze hanno la retta d'azione che incontra l'asse oppure gli è parallela: momento nullo.
- Restano le facce $\\pm\\hat e_2$ e $\\pm\\hat e_3$. Su di esse le componenti lungo $\\hat e_1$ sono parallele all'asse e le componenti normali passano per l'asse: niente momento. Danno momento solo le **tangenziali** $T_{23}$, sulle facce $\\pm\\hat e_2$ in direzione $\\hat e_3$, e $T_{32}$, sulle facce $\\pm\\hat e_3$ in direzione $\\hat e_2$.

Ognuna di queste forze ha braccio metà spigolo, perché l'asse passa per il baricentro.`,
      },
      {
        id: 'l34-4',
        kind: 'derivazione',
        title: 'Momento attorno all\'asse u',
        md: `**Dove vogliamo arrivare:** $T_{23}=T_{32}$. **La strategia:** scriviamo il momento delle tangenziali sulle facce $\\pm\\hat e_2$, poi quello delle tangenziali sulle facce $\\pm\\hat e_3$, trascuriamo gli infinitesimi di ordine superiore e imponiamo che la somma sia nulla. Ogni forza è componente di tensione per area della faccia; il momento è forza per braccio.`,
        source: D(3, '3.7.3', 'Teo 3.7.1', 46),
        der: {
          lines: [
            { tex: '\\Big[\\Big(T_{23}+\\frac{\\partial T_{23}}{\\partial x_2}dx_2\\Big)dx_1dx_3+T_{23}\\,dx_1dx_3\\Big]\\frac{dx_2}2', why: `Facce $\\pm\\hat e_2$, di area $dx_1dx_3$. La componente lungo $\\hat e_3$ sulla faccia lontana è $T_{23}$ più il suo incremento, su quella che contiene $x$ è $-T_{23}$; le due forze sono opposte e stanno da parti opposte dell'asse, a distanza $dx_2/2$, quindi i loro momenti si sommano con lo stesso segno.` },
            { tex: '\\simeq T_{23}\\,dx_1dx_2dx_3', aggiunto: true, why: `Abbiamo sviluppato il prodotto e trascurato il termine con la derivata: vale $\\frac{\\partial T_{23}}{\\partial x_2}\\frac{dx_2^2}{2}dx_1dx_3$, che contiene quattro fattori infinitesimi invece di tre, ed è quindi un infinitesimo di ordine superiore rispetto a $dV=dx_1dx_2dx_3$. I due termini $T_{23}\\,dx_1dx_3\\,\\frac{dx_2}2$ si sommano.` },
            { tex: '-\\Big[\\Big(T_{32}+\\frac{\\partial T_{32}}{\\partial x_3}dx_3\\Big)dx_1dx_2+T_{32}\\,dx_1dx_2\\Big]\\frac{dx_3}2', why: `Facce $\\pm\\hat e_3$, di area $dx_1dx_2$, con le componenti lungo $\\hat e_2$ e braccio $dx_3/2$. Il ragionamento è identico, ma la coppia che si forma ha verso di rotazione **opposto** attorno a $u$: per questo c'è il segno meno.` },
            { tex: '\\simeq-T_{32}\\,dx_1dx_2dx_3', aggiunto: true, why: `Come prima, trascuriamo il termine con la derivata, infinitesimo di ordine superiore.` },
            {
              tex: 'T_{23}\\,dV-T_{32}\\,dV=0',
              why: `Imponiamo che il momento totale attorno a $u$ sia nullo: abbiamo visto che le altre forze non danno contributo, quindi restano solo i due termini trovati.`,
              ask: { q: `Che cosa si è trascurato per arrivare a questa equazione?`, options: [`I termini con le derivate, infinitesimi di ordine superiore rispetto a $dV$`, `Le forze di volume, che invece danno momento`, `Le tensioni normali, che invece danno momento`, `Nulla: l'equazione è esatta`], correct: 0, why: `$\\frac{\\partial T_{23}}{\\partial x_2}dx_2\\cdot\\frac{dx_2}2\\,dx_1dx_3$ è di ordine superiore a $dV$ (§3.7.3). Forze di volume e tensioni normali non sono state «trascurate»: non danno momento, perché passano per l'asse. L'equazione non è esatta proprio per i termini trascurati, che però spariscono rispetto a $dV$.` },
            },
            { tex: '\\Rightarrow\\ T_{23}=T_{32}', why: `Dividiamo per il volume $dV$, che non è nullo. Ripetendo il ragionamento con gli assi $v\\parallel\\hat e_2$ e $w\\parallel\\hat e_3$ si ottengono $T_{13}=T_{31}$ e $T_{12}=T_{21}$: tutte le componenti fuori diagonale sono simmetriche, cioè $\\tens T=\\tens T^T$.`, eq: 'Teo 3.6.1, punto 3' },
          ],
        },
      },
      {
        id: 'l34-4b',
        kind: 'spiega',
        title: 'La reciprocità delle tensioni tangenziali',
        md: `Che cosa vuol dire, fisicamente, $T_{23}=T_{32}$? Ricorda la lettura «primo indice la giacitura, secondo la direzione». $T_{23}$ è la tangenziale sulla giacitura $\\hat e_2$ in direzione $\\hat e_3$; $T_{32}$ è la tangenziale sulla giacitura $\\hat e_3$ in direzione $\\hat e_2$. Sono **uguali**.

È il **teorema di reciprocità delle tensioni tangenziali** (Teo 3.7.1): $\\tau_{ij}=\\tau_{ji}$. La figura di p. 47 lo rende visibile. Le tangenziali sulle due facce opposte di normale $\\pm\\hat e_i$ formano una **coppia**, che da sola farebbe ruotare il cubetto, diciamo in senso antiorario. Per l'equilibrio alla rotazione serve una coppia uguale e opposta, oraria: la danno le tangenziali sulle facce di normale $\\pm\\hat e_j$. Le due coppie hanno bracci uguali, quindi devono avere forze uguali.

Controllo con lo **scorrimento semplice** (esempio della lezione su Mohr, anticipato): se l'unica tangenziale non nulla fosse $\\tau_{12}$ sulle facce $\\pm\\hat e_1$, il cubetto girerebbe; la reciprocità impone che ci sia anche $\\tau_{21}=\\tau_{12}$ sulle facce $\\pm\\hat e_2$. Simmetria del tensore e reciprocità sono quindi **la stessa cosa** (§3.8, osservazione 3).`,
      },
      {
        id: 'l34-5',
        kind: 'prova',
        title: 'Le tangenziali reciproche sul cubetto',
        md: `Sul cubetto del modello sono disegnate le tangenziali sulle facce $\\pm\\hat e_1$ in direzione $\\hat e_2$ e quelle sulle facce $\\pm\\hat e_2$ in direzione $\\hat e_1$.`,
        tasks: [`Con «scorrimento semplice» guarda le due coppie: quella delle $\\tau_{12}$ gira in un verso, quella delle $\\tau_{21}$ nel verso opposto, con la stessa intensità.`, `Cambia stato di tensione: le due coppie restano sempre bilanciate, perché $\\tau_{ij}=\\tau_{ji}$ (figura di p. 47).`],
        visual: ST({ mode: 'parallelepipedo', preset: 'scorrimento', presets: ['scorrimento', 'esercizio', 'generico'], controls: ['preset'] }),
      },
      {
        id: 'l34-6',
        kind: 'domanda',
        q: { id: 'l34-q1', kind: 'scelta', q: `Che cosa esprime la reciprocità delle tensioni tangenziali?`, options: [`La tangenziale sulla giacitura $\\hat e_i$ in direzione $\\hat e_j$ è uguale a quella sulla giacitura $\\hat e_j$ in direzione $\\hat e_i$`, `Le tangenziali sono nulle sui piani coordinati`, `Le tangenziali sono uguali alle normali`, `$\\tau_{ij}=-\\tau_{ji}$`], correct: 0, why: `Teo 3.7.1: $\\tau_{ij}=\\tau_{ji}$, equivalente alla simmetria di $\\tens T$. Il segno meno sarebbe l'antisimmetria: le due coppie si sommerebbero invece di bilanciarsi. Sui piani coordinati le tangenziali in generale non sono nulle, e non c'è nessun legame con le normali.` },
      },
      {
        id: 'l34-7a',
        kind: 'spiega',
        title: 'Attenzione a non confondere',
        md: `Tre errori tipici su questa lezione.

1. **Scrivere le equazioni indefinite anche sulla frontiera.** Valgono nell'interno, dove si può derivare in ogni direzione. Sulla frontiera la condizione è un'altra: $\\tens T\\hat n=\\hat{\\vet s}$.
2. **Confondersi con gli indici tra tetraedro e parallelepipedo.** Nel tetraedro la dispensa legge la matrice per colonne, $T_{ij}=(\\vet t_{e_j})_i$; nel parallelepipedo per righe, $T_{ij}=\\vet t_{e_i}\\cdot\\hat e_j$ (nota NF-06). Per un tensore simmetrico le due letture danno lo stesso numero, ed è per questo che la dispensa non se ne preoccupa.
3. **Pensare che la simmetria sia una proprietà del materiale.** Non lo è: è la forma locale dell'**equilibrio alla rotazione**, e vale per qualunque materiale, purché si accetti il principio di Cauchy (momento per unità di area nullo). Nei continui polari, dove i micromomenti esistono, la simmetria non è garantita (deduzione).`,
      },
      {
        id: 'l34-7',
        kind: 'riassunto',
        md: `**Il filo della lezione.** L'equilibrio alla traslazione di una parte interna contiene un integrale di volume e uno di superficie; scrivendo il secondo come flusso di $\\tens T$ e applicando il teorema della divergenza diventano un unico integrale di volume, e per l'arbitrarietà della parte si ottengono le equazioni indefinite, valide nell'interno (sulla frontiera vale $\\tens T\\hat n=\\hat{\\vet s}$; con l'equilibrio referenziale div e Div coincidono). L'equilibrio alla rotazione di un parallelepipedo infinitesimo, trascurando gli infinitesimi di ordine superiore, dà $T_{23}=T_{32}$ e le analoghe: $\\tens T$ è simmetrico, cioè le tangenziali sono reciproche.

- Equazioni indefinite: $\\operatorname{div}\\tens T+\\vet b=\\vet 0$ $\\ \\forall x\\in\\mathring{\\mathcal B}$ (Teo 3.6.1, punto 2).
- In componenti: $\\dfrac{\\partial T_{i1}}{\\partial x_1}+\\dfrac{\\partial T_{i2}}{\\partial x_2}+\\dfrac{\\partial T_{i3}}{\\partial x_3}+b_i=0$ (§3.8).
- Simmetria e reciprocità: $\\tens T=\\tens T^T\\iff\\tau_{ij}=\\tau_{ji}$ (Teo 3.6.1 punto 3, Teo 3.7.1).`,
        orale: ['Perché $\\mathring{\\mathcal B}$; div o Div (dispensa, domanda 6).', 'Dimostrare il punto 2 (teorema della divergenza) e il punto 3 (parallelepipedo, reciprocità). (dispensa, domanda 7)'],
      },
    ],
  },
  // ================================================================== c3.5
  {
    concept: 'c3.5',
    title: 'Calcolare σ_n e τ su una giacitura',
    minutes: 28,
    source: D(3, '3.9–3.10', undefined, '48–49'),
    visual: ST({ mode: 'taglio', preset: 'esercizio', presets: ['esercizio', 'generico'], controls: ['preset', 'dir'] }),
    steps: [
      {
        id: 'l35-0',
        kind: 'spiega',
        title: 'Dove siamo e dove andiamo',
        md: `Con il teorema di Cauchy–Poisson, dimostrato nelle due lezioni precedenti, sappiamo che in ogni punto lo stato di tensione è descritto da un tensore simmetrico $\\tens T$, e che il vettore tensione su qualunque giacitura è $\\vet t_n=\\tens T\\hat n$.

Ora passiamo dalla teoria al calcolo. La domanda di questa lezione è pratica: **data la matrice di $\\tens T$ in un riferimento e una giacitura $\\hat n$, come si trovano la tensione normale e la tangenziale su quel piano?** Prima impariamo a leggere la matrice (che cosa c'è sulla diagonale, che cosa fuori); poi ricaviamo la formula della tensione normale, che è una forma quadratica in $\\hat n$; poi quella della componente tangenziale lungo una direzione data; infine la tangenziale totale, con un controllo che ti salverà molti errori di conto. Chiudiamo con il punto 4 dell'esercizio svolto della dispensa.`,
      },
      {
        id: 'l35-1',
        kind: 'spiega',
        title: 'Leggere la matrice di T',
        md: `Nel tetraedro abbiamo visto che **le colonne di $[\\tens T]$ sono i vettori tensione sulle tre giaciture coordinate** (§3.9): la prima colonna è $\\vet t_{e_1}$, la seconda $\\vet t_{e_2}$, la terza $\\vet t_{e_3}$.

Guardiamo $\\vet t_{e_1}$, cioè la forza per unità di area sulla faccia di normale $\\hat e_1$. La sua componente lungo $\\hat e_1$, cioè perpendicolare alla faccia, è una tensione **normale**: la chiamiamo $\\sigma_1$. Le altre due componenti, lungo $\\hat e_2$ e $\\hat e_3$, stanno nel piano della faccia: sono tensioni **tangenziali**, $\\tau_{12}$ e $\\tau_{13}$ (giacitura 1, direzione 2 o 3). Lo stesso per le altre due colonne.

Quindi la matrice ha un aspetto molto leggibile: **sulla diagonale le tre tensioni normali, fuori diagonale le tangenziali**. È la **rappresentazione ingegneristica** di $\\tens T$.`,
      },
      {
        id: 'l35-1b',
        kind: 'spiega',
        title: 'Un piccolo conflitto di indici, risolto dalla simmetria',
        md: `C'è un dettaglio da chiarire. Se scriviamo la matrice mettendo davvero in colonna $j$ le componenti di $\\vet t_{e_j}$, otteniamo (§3.9)
$$[\\tens T]=\\begin{bmatrix}\\sigma_1&\\tau_{21}&\\tau_{31}\\\\\\tau_{12}&\\sigma_2&\\tau_{32}\\\\\\tau_{13}&\\tau_{23}&\\sigma_3\\end{bmatrix}.$$
In posizione (riga 1, colonna 2) c'è $\\tau_{21}$: la componente lungo $\\hat e_1$ del vettore tensione sulla giacitura $\\hat e_2$. Gli indici sono «scambiati» rispetto alla convenzione «prima la giacitura».

Ma il tensore è simmetrico (punto 3 di Cauchy–Poisson), e la reciprocità dice $\\tau_{21}=\\tau_{12}$. La discordanza è quindi **irrilevante**, e si scrive la forma più comoda:
$$[\\tens T]=\\begin{bmatrix}\\sigma_1&\\tau_{12}&\\tau_{13}\\\\\\tau_{12}&\\sigma_2&\\tau_{23}\\\\\\tau_{13}&\\tau_{23}&\\sigma_3\\end{bmatrix}.$$
Nota anche quanti numeri servono davvero: sei, tre normali e tre tangenziali (deduzione).`,
      },
      {
        id: 'l35-1q',
        kind: 'domanda',
        q: { id: 'l35-q2', kind: 'scelta', q: `In $[\\tens T]$, che cosa rappresenta la seconda colonna?`, options: [`Il vettore tensione sulla giacitura $\\hat e_2$: in seconda posizione la normale $\\sigma_2$, nelle altre due le tangenziali`, `Le tre tensioni normali`, `Il vettore tensione in direzione $\\hat e_2$ su tutte le giaciture`, `Le tensioni principali`], correct: 0, why: `Le colonne di $[\\tens T]$ sono $\\vet t_{e_1},\\vet t_{e_2},\\vet t_{e_3}$ (§3.7.1, §3.9). Le tensioni normali stanno sulla diagonale, non in una colonna. Le tensioni principali compaiono sulla diagonale solo nel riferimento principale.` },
      },
      {
        id: 'l35-2a',
        kind: 'spiega',
        title: 'Il problema: dato $\\hat n$, quanto valgono normale e tangenziale?',
        md: `Ora il calcolo vero (§3.10). Sono dati la matrice $[\\tens T]$ e il versore $\\hat n$ della giacitura. Il primo passo è sempre lo stesso: il vettore tensione si ottiene con il prodotto righe per colonna,
$$\\{\\vet t_n\\}=[\\tens T]\\{\\hat n\\}.$$
Poi si separano le due componenti speciali della lezione sul vettore tensione: la **normale** $\\sigma_n=\\vet t_n\\cdot\\hat n$, proiezione su $\\hat n$, e la **tangenziale**, la parte che resta nel piano.

Per la normale la dispensa scrive una formula esplicita, che conviene saper ricavare: mostra che $\\sigma_n$ dipende da $\\hat n$ in modo **quadratico**. Lo facciamo nella derivazione che segue.`,
      },
      {
        id: 'l35-2',
        kind: 'derivazione',
        title: 'σ_n è una forma quadratica in n̂',
        md: `**Dove vogliamo arrivare:** la formula esplicita di $\\sigma_n$ in funzione delle componenti di $\\hat n$. **La strategia:** scriviamo $\\sigma_n=\\tens T\\hat n\\cdot\\hat n$ in componenti, svolgiamo tutti i nove termini e raccogliamo quelli uguali grazie alla simmetria. Ogni riga è verificata numericamente su un tensore simmetrico e una giacitura casuali.`,
        source: D(3, '3.10', undefined, 48),
        der: {
          sample: (r) => { const o: R = {}; putMat(o, 'T', T.sym(T.randMat(r))); putVec(o, 'n', T.unit(T.randVec(r))); return o; },
          lines: [
            { tex: '\\sigma_n=\\vet t_n\\cdot\\hat n=\\tens T\\hat n\\cdot\\hat n', why: `È la definizione di tensione normale (proiezione del vettore tensione su $\\hat n$), con $\\vet t_n=\\tens T\\hat n$ dal punto 1 di Cauchy–Poisson.`, val: (v) => traction(mat(v, 'T'), vec(v, 'n')).sigma },
            { tex: '=\\textstyle\\sum_{i,j}T_{ij}n_jn_i', why: `In componenti: la $i$-esima componente di $\\tens T\\hat n$ è $\\sum_jT_{ij}n_j$ (prodotto righe per colonna); il prodotto scalare con $\\hat n$ la moltiplica per $n_i$ e somma su $i$.`, val: (v) => { const Tm = mat(v, 'T'); const n = vec(v, 'n'); let s = 0; for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) s += T.at(Tm, i, j) * n[j] * n[i]; return s; } },
            {
              tex: '=T_{11}n_1^2+T_{22}n_2^2+T_{33}n_3^2+(T_{12}+T_{21})n_1n_2+(T_{23}+T_{32})n_2n_3+(T_{31}+T_{13})n_3n_1',
              aggiunto: true,
              why: `Abbiamo scritto esplicitamente i nove termini della doppia somma: i tre con $i=j$ danno i quadrati; i sei con $i\\neq j$ si presentano a coppie con lo stesso prodotto $n_in_j$, che abbiamo raccolto.`,
              val: (v) => { const t = mat(v, 'T'); const n = vec(v, 'n'); return t[0] * n[0] ** 2 + t[4] * n[1] ** 2 + t[8] * n[2] ** 2 + (t[1] + t[3]) * n[0] * n[1] + (t[5] + t[7]) * n[1] * n[2] + (t[6] + t[2]) * n[2] * n[0]; },
            },
            {
              tex: '=T_{11}n_1^2+T_{22}n_2^2+T_{33}n_3^2+2T_{12}n_1n_2+2T_{23}n_2n_3+2T_{31}n_3n_1',
              why: `Abbiamo usato la simmetria, $T_{21}=T_{12}$ e le analoghe: ogni coppia è il doppio di un solo termine. Il risultato è una **forma quadratica completa** in $\\hat n$: tutti i quadrati e tutti i doppi prodotti.`,
              ask: { q: `Da dove vengono i fattori 2?`, options: [`Dalla simmetria di $\\tens T$: i due termini misti con lo stesso $n_in_j$ sono uguali`, `Dalla normalizzazione di $\\hat n$`, `Dal lemma di Cauchy`, `Dalla forma ingegneristica, che raddoppia le tangenziali`], correct: 0, why: `$T_{12}n_1n_2+T_{21}n_2n_1=2T_{12}n_1n_2$ perché $T_{12}=T_{21}$. La normalizzazione $|\\hat n|=1$ non interviene in questo passaggio; il lemma di Cauchy riguarda il cambio di verso della normale; la forma ingegneristica cambia solo i nomi, non i valori.` },
              val: (v) => { const Tm = mat(v, 'T'); const n = vec(v, 'n'); return Tm[0] * n[0] ** 2 + Tm[4] * n[1] ** 2 + Tm[8] * n[2] ** 2 + 2 * Tm[1] * n[0] * n[1] + 2 * Tm[5] * n[1] * n[2] + 2 * Tm[6] * n[2] * n[0]; },
              eq: '§3.10',
            },
          ],
        },
      },
      {
        id: 'l35-2b',
        kind: 'spiega',
        title: 'Leggere la formula della tensione normale',
        md: `La formula dice che la tensione normale su un piano è una **somma pesata** di tutte le componenti di $\\tens T$: le normali $T_{ii}$ pesate con i quadrati $n_i^2$, le tangenziali $T_{ij}$ pesate con il doppio prodotto $2n_in_j$. Anche le tangenziali dei piani coordinati, quindi, contribuiscono alla tensione **normale** su un piano inclinato.

Controllo su un caso particolare: se $\\hat n=\\hat e_1$, cioè $n_1=1$ e $n_2=n_3=0$, sopravvive solo il primo termine e $\\sigma_n=T_{11}=\\sigma_1$. È giusto: sulla giacitura $\\hat e_1$ la tensione normale è quella scritta in posizione (1,1).

Secondo controllo (esempio aggiunto): nello scorrimento semplice, con solo $T_{12}=\\tau$, sul piano inclinato a 45° nel piano $\\hat e_1\\hat e_2$, cioè $n_1=n_2=1/\\sqrt2$, si trova $\\sigma_n=2\\tau\\cdot\\frac12=\\tau$. Una tangenziale pura sui piani coordinati diventa una tensione normale su un piano a 45°: lo ritroveremo con il cerchio di Mohr.`,
      },
      {
        id: 'l35-3',
        kind: 'derivazione',
        title: 'La componente tangenziale lungo una direzione ν̂',
        md: `**Dove vogliamo arrivare:** la componente della tangenziale lungo una direzione $\\hat\\nu$ scelta nel piano del taglio, cioè con $\\hat n\\cdot\\hat\\nu=0$. **La strategia:** la stessa di prima, proiettando $\\vet t_n$ su $\\hat\\nu$ invece che su $\\hat n$. Controlliamo anche, numericamente, la relazione $|\\vet t_n|^2=\\sigma_n^2+\\tau_n^2$ che useremo subito dopo.`,
        source: D(3, '3.10', undefined, 49),
        der: {
          sample: (r) => { const o: R = {}; putMat(o, 'T', T.sym(T.randMat(r))); const n = T.unit(T.randVec(r)); putVec(o, 'n', n); putVec(o, 'v', T.unit(T.cross(n, T.randVec(r)))); return o; },
          lines: [
            { tex: '\\tau_{n\\nu}=\\vet t_n\\cdot\\hat\\nu', why: `È la definizione: la proiezione del vettore tensione sulla direzione $\\hat\\nu$. Siccome $\\hat\\nu$ è perpendicolare a $\\hat n$, la parte normale di $\\vet t_n$ non contribuisce, e resta la componente della tangenziale lungo $\\hat\\nu$.`, val: (v) => T.dotv(T.apply(mat(v, 'T'), vec(v, 'n')), vec(v, 'v')) },
            { tex: '=\\textstyle\\sum_{i,j}T_{ij}n_j\\nu_i', aggiunto: true, why: `In componenti, come per $\\sigma_n$: la componente $i$ di $\\tens T\\hat n$ è $\\sum_jT_{ij}n_j$, e il prodotto scalare con $\\hat\\nu$ la moltiplica per $\\nu_i$.`, val: (v) => { const Tm = mat(v, 'T'); const n = vec(v, 'n'); const u = vec(v, 'v'); let s = 0; for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) s += T.at(Tm, i, j) * n[j] * u[i]; return s; } },
            {
              tex: '=T_{11}n_1\\nu_1+T_{22}n_2\\nu_2+T_{33}n_3\\nu_3+T_{12}(n_1\\nu_2+n_2\\nu_1)+T_{23}(n_2\\nu_3+n_3\\nu_2)+T_{31}(n_3\\nu_1+n_1\\nu_3)',
              why: `Abbiamo svolto i nove termini e raccolto, grazie alla simmetria, quelli con la stessa componente di $\\tens T$. Qui i termini misti non si raddoppiano, perché $n_1\\nu_2$ e $n_2\\nu_1$ in generale sono diversi.`,
              val: (v) => { const t = mat(v, 'T'); const n = vec(v, 'n'); const u = vec(v, 'v'); return t[0] * n[0] * u[0] + t[4] * n[1] * u[1] + t[8] * n[2] * u[2] + t[1] * (n[0] * u[1] + n[1] * u[0]) + t[5] * (n[1] * u[2] + n[2] * u[1]) + t[6] * (n[2] * u[0] + n[0] * u[2]); },
              eq: '§3.10',
            },
          ],
          checks: [{ what: '|t_n|² = σ_n² + τ_n²', f: (v) => { const tr = traction(mat(v, 'T'), vec(v, 'n')); return [T.dotv(tr.t, tr.t), tr.sigma ** 2 + tr.tau ** 2]; } }],
        },
      },
      {
        id: 'l35-4a',
        kind: 'spiega',
        title: 'Una componente non è tutta la tangenziale',
        md: `Il risultato appena trovato va letto con attenzione: $\\tau_{n\\nu}$ è la componente della tangenziale **lungo la direzione che abbiamo scelto**, $\\hat\\nu$. Nel piano del taglio ci sono infinite direzioni, e la tangenziale vera, $\\boldsymbol\\tau_n$, punta in una sola di esse, $\\hat\\mu$, che in generale non conosciamo. Quindi **$\\tau_{n\\nu}$ in generale non è l'intera tangenziale**: lo è solo se per caso abbiamo scelto $\\hat\\nu=\\hat\\mu$.

Controllo su un caso particolare: con $\\hat n=\\hat e_1$ e $\\hat\\nu=\\hat e_2$ la formula dà $\\tau_{n\\nu}=T_{12}(1\\cdot1+0)=\\tau_{12}$, cioè la tangenziale sulla giacitura $\\hat e_1$ in direzione $\\hat e_2$, come deve essere. Ma sulla stessa giacitura c'è anche $\\tau_{13}$, che con questa scelta di $\\hat\\nu$ non vediamo.

Una nota di nomenclatura: nella dispensa $\\hat\\mu$ è la direzione della tangenziale e $\\hat\\nu$ una direzione assegnata; negli appunti erano scambiati.`,
      },
      {
        id: 'l35-4',
        kind: 'spiega',
        title: 'La tangenziale totale, per differenza',
        md: `Come si trova allora l'intera tangenziale? Per **via indiretta**, in tre mosse: prima il vettore tensione, poi la sua parte normale, e infine quello che resta (§3.10):
$$\\vet t_n\\ \\to\\ \\sigma_n\\ \\to\\ \\boldsymbol\\tau_n=\\vet t_n-\\sigma_n\\hat n.$$
Il modulo $\\tau_n=|\\boldsymbol\\tau_n|$ è l'intensità della tangenziale, e la sua direzione è $\\hat\\mu=\\boldsymbol\\tau_n/\\tau_n$. È esattamente la decomposizione con i proiettori della prima lezione, fatta con i numeri.

Il **segno** di $\\tau$ è inessenziale: la tangenziale fa scorrere le due facce del taglio, e lo scorrimento avviene comunque, in un verso o nell'altro.

Infine un controllo prezioso. La parte normale e la tangenziale sono **perpendicolari**, quindi per il teorema di Pitagora
$$|\\vet t_n|^2=\\sigma_n^2+\\tau_n^2.$$
Se dopo un esercizio questa relazione non torna, c'è un errore di conto.`,
      },
      {
        id: 'l35-5b',
        kind: 'domanda',
        q: { id: 'l35-q1', kind: 'scelta', q: `Su una giacitura $|\\vet t_n|=5$ e $\\sigma_n=3$. Quanto vale $\\tau_n$?`, options: [`4`, `2`, `8`, `$\\sqrt{34}$`], correct: 0, why: `$|\\vet t_n|^2=\\sigma_n^2+\\tau_n^2$, quindi $\\tau_n=\\sqrt{25-9}=4$ (§3.10). 2 è la differenza dei moduli, ma le componenti non si sottraggono come numeri: sono perpendicolari. $\\sqrt{34}$ viene dal sommare i quadrati invece di sottrarli.` },
      },
      {
        id: 'l35-5',
        kind: 'numeri',
        title: 'Esercizio §3.14, punto 4',
        md: `Mettiamo in fila le tre mosse sull'esercizio della dispensa. La matrice ha righe $(0,-3,0)$, $(-3,0,6)$, $(0,6,0)$, e la giacitura è $\\hat n=(1,-1,-2)/\\sqrt6$. Nel modello il piano è già orientato su questa giacitura.

- Vettore tensione, prodotto righe per colonna: $\\{\\vet t_n\\}=\\frac3{\\sqrt6}(1,-5,-2)=(${f(TR314.t[0])};\\ ${f(TR314.t[1])};\\ ${f(TR314.t[2])})$.
- Tensione normale, proiezione su $\\hat n$: $\\sigma_n=${f(TR314.sigma)}$, positiva, quindi di trazione.
- Tangenziale per differenza: $\\{\\boldsymbol\\tau_n\\}=-\\frac2{\\sqrt6}(1,5,-2)$, con modulo $\\tau_n=2\\sqrt5=${f(TR314.tau)}$.
- Controllo di Pitagora: $|\\vet t_n|^2=${f(T.dotv(TR314.t, TR314.t))}=25+20$. Torna.`,
        values: { sigma: TR314.sigma, tau: TR314.tau },
        visual: ST({ mode: 'taglio', preset: 'esercizio', presets: ['esercizio'], dir: [-54.7356, -45] }),
      },
      {
        id: 'l35-6a',
        kind: 'spiega',
        title: 'Attenzione a non confondere',
        md: `Tre errori tipici nei calcoli.

1. **Confondere $\\tau_{n\\nu}$ con $\\tau_n$.** La prima è la componente lungo una direzione scelta, la seconda l'intera tangenziale. Se l'esercizio chiede «la tensione tangenziale» sul piano, si intende $\\tau_n$, e va trovata per differenza.
2. **Dimenticare i fattori 2 dei doppi prodotti in $\\sigma_n$.** Vengono dalla simmetria: ogni tangenziale compare due volte nella matrice. Se scrivi $T_{12}n_1n_2$ invece di $2T_{12}n_1n_2$, sbagli il risultato.
3. **Non usare il controllo $|\\vet t_n|^2=\\sigma_n^2+\\tau_n^2$.** È gratuito e intercetta quasi tutti gli errori di conto: fallo sempre alla fine.`,
      },
      {
        id: 'l35-6',
        kind: 'riassunto',
        md: `**Il filo della lezione.** Le colonne della matrice di $\\tens T$ sono i vettori tensione sulle giaciture coordinate: sulla diagonale ci sono le tensioni normali, fuori le tangenziali, e la simmetria rende irrilevante lo scambio di indici della lettura per colonne. Su una giacitura qualunque si calcola prima $\\vet t_n=\\tens T\\hat n$; la tensione normale è una forma quadratica completa in $\\hat n$, con i doppi prodotti dovuti alla simmetria; la proiezione su una direzione $\\hat\\nu$ del piano dà una componente della tangenziale, non tutta; la tangenziale totale si ottiene per differenza, e Pitagora controlla il conto.

- Forma ingegneristica: $[\\tens T]=\\begin{bmatrix}\\sigma_1&\\tau_{12}&\\tau_{13}\\\\\\tau_{12}&\\sigma_2&\\tau_{23}\\\\\\tau_{13}&\\tau_{23}&\\sigma_3\\end{bmatrix}$ (§3.9).
- $\\sigma_n=\\tens T\\hat n\\cdot\\hat n=T_{11}n_1^2+T_{22}n_2^2+T_{33}n_3^2+2T_{12}n_1n_2+2T_{23}n_2n_3+2T_{31}n_3n_1$ (§3.10).
- $\\tau_{n\\nu}=\\vet t_n\\cdot\\hat\\nu$, con $\\hat\\nu\\perp\\hat n$ (§3.10).
- $\\boldsymbol\\tau_n=\\vet t_n-\\sigma_n\\hat n$, $\\ |\\vet t_n|^2=\\sigma_n^2+\\tau_n^2$ (§3.10).`,
        orale: ['Rappresentazione ingegneristica di $\\tens T$; calcolo di $\\sigma_n$, $\\tau_{n\\nu}$, $\\tau_n$. (dispensa, domanda 8)'],
      },
    ],
  },
  // ================================================================== c3.6
  {
    concept: 'c3.6',
    title: 'Tensioni principali e stati di tensione',
    minutes: 30,
    source: D(3, '3.11–3.12', 'Def 3.11.1', '49–52'),
    visual: ST({ mode: 'principali', presets: ['esercizio', 'generico', 'trazione', 'scorrimento', 'idrostatico'], controls: ['preset'] }),
    steps: [
      {
        id: 'l36-0',
        kind: 'spiega',
        title: 'Dove siamo e dove andiamo',
        md: `Nella lezione precedente abbiamo imparato a calcolare, su una giacitura qualunque, la tensione normale e la tangenziale. Abbiamo visto che al variare del piano le due parti cambiano, e che in generale sono entrambe presenti.

Questa lezione si chiede se esistono piani **speciali**: piani su cui la tensione è **solo normale**, senza tangenziale. Vedremo che esistono sempre, almeno tre e mutuamente ortogonali, e che il problema è identico a quello delle dilatazioni principali del capitolo 2: un problema agli autovalori. Poi useremo le tensioni principali per **classificare** gli stati di tensione (triassiale, biassiale, monoassiale), anche senza calcolarle, guardando solo gli invarianti. Chiudiamo con la prima parte dell'esercizio svolto della dispensa.`,
      },
      {
        id: 'l36-1a',
        kind: 'spiega',
        title: 'Perché cercare piani senza tangenziale',
        md: `Prima di fare conti, chiediamoci se la domanda ha senso fisico. La dispensa risponde di sì (§3.11): la tensione normale e quella tangenziale **impegnano in modo diverso le risorse del materiale**. Ricorda i due effetti: la normale tende a lacerare o a schiacciare, la tangenziale tende a far scorrere. Un materiale può resistere bene a uno dei due e male all'altro, e per giudicare se regge serve sapere quali valori le due parti raggiungono e dove. I piani in cui la tangenziale sparisce sono il punto di partenza naturale.

Traduciamo la richiesta. Su un piano con sola tensione normale il vettore tensione è **parallelo** alla normale: $\\vet t_n=\\lambda\\hat n$ per qualche numero $\\lambda$. Con $\\vet t_n=\\tens T\\hat n$ diventa
$$\\tens T\\hat n=\\lambda\\hat n\\iff(\\tens T-\\lambda\\tens I)\\hat n=\\vet 0.$$
È il **problema agli autovalori** di $\\tens T$, lo stesso che abbiamo risolto per il tensore di deformazione $\\tens E$ (§2.9).`,
      },
      {
        id: 'l36-1',
        kind: 'spiega',
        title: 'Tensioni principali, direzioni principali, piani principali',
        md: `Diamo i nomi (§3.11).

- Gli **autovalori** $\\lambda$ di $\\tens T$ si chiamano **tensioni principali**. Su quei piani la tensione normale vale proprio $\\lambda$: infatti $\\sigma_n=\\tens T\\hat n\\cdot\\hat n=\\lambda\\,\\hat n\\cdot\\hat n=\\lambda$.
- Gli **autovettori** $\\hat n$ si chiamano **direzioni principali**: sono le giaciture su cui la tensione è solo normale.
- Il piano ortogonale a una direzione principale si chiama **piano principale di tensione** (Def 3.11.1): su di esso agisce la tensione principale $\\lambda$ e le tangenziali sono nulle.

Ma siamo sicuri che autovalori e autovettori reali esistano? Qui torna utile il punto 3 di Cauchy–Poisson. Il **teorema spettrale** del capitolo 2 (Teo 2.9.2) garantisce, per ogni tensore **simmetrico**, almeno tre autocoppie reali con autovettori ortogonali. Siccome $\\tens T$ è simmetrico, il teorema si applica: esiste sempre una **terna principale di tensione**. Per un tensore non simmetrico gli autovalori potrebbero essere complessi, e la domanda non avrebbe risposta.`,
      },
      {
        id: 'l36-1q',
        kind: 'domanda',
        q: { id: 'l36-q2', kind: 'scelta', q: `Perché si può applicare il teorema spettrale al tensore di tensione?`, options: [`Perché $\\tens T$ è simmetrico, per il punto 3 di Cauchy–Poisson`, `Perché $\\tens T$ è invertibile`, `Perché le tensioni principali sono positive`, `Perché $\\tens T$ è lineare in $\\hat n$`], correct: 0, why: `L'unica ipotesi del teorema spettrale è la simmetria (Teo 2.9.2), garantita dall'equilibrio alla rotazione. $\\tens T$ non è necessariamente invertibile (nell'esercizio §3.14 $\\det\\tens T=0$), le tensioni principali possono avere qualunque segno, e la linearità vale per ogni tensore.` },
      },
      {
        id: 'l36-2a',
        kind: 'spiega',
        title: 'Come si calcolano: l\'equazione secolare',
        md: `Si procede esattamente come per la deformazione (§3.11.1). Il sistema $(\\tens T-\\lambda\\tens I)\\hat n=\\vet 0$ ha soluzioni non nulle solo se il determinante della matrice è zero. Sviluppando il determinante si ottiene l'**equazione secolare**:
$$\\lambda^3-I\\lambda^2+II\\lambda-III=0.$$
I coefficienti sono gli **invarianti** di $\\tens T$, numeri che non dipendono dal riferimento:
- $I=\\operatorname{tr}\\tens T$, la **traccia**, cioè la somma degli elementi sulla diagonale;
- $II=\\frac12[(\\operatorname{tr}\\tens T)^2-\\operatorname{tr}\\tens T^2]$, che in pratica si calcola come **somma dei tre minori principali** 2×2;
- $III=\\det\\tens T$, il **determinante**.

Trovata una radice $\\lambda$, la direzione corrispondente si ricava dal sistema, insieme alla **normalizzazione** $\\hat n\\cdot\\hat n=1$. Nel riferimento principale la matrice è diagonale, $[\\tens T]=\\operatorname{diag}(\\lambda_1,\\lambda_2,\\lambda_3)$, e gli invarianti si leggono sulle radici: $I=\\lambda_1+\\lambda_2+\\lambda_3$, $II=\\lambda_1\\lambda_2+\\lambda_2\\lambda_3+\\lambda_1\\lambda_3$, $III=\\lambda_1\\lambda_2\\lambda_3$.`,
      },
      {
        id: 'l36-2b',
        kind: 'spiega',
        title: 'L\'ordinamento e i nomi delle tensioni principali',
        md: `Le tre radici si ordinano dalla più grande alla più piccola e si chiamano $s_1\\ge s_2\\ge s_3$ (§3.11.1).

La dispensa chiama $s_1$ «tensione principale di **trazione**» e $s_3$ «tensione principale di **compressione**». Sono nomi comodi, ma vanno presi con cautela: le tre tensioni principali **possono avere tutte lo stesso segno**. In uno stato di compressione da tutte le parti, per esempio, anche $s_1$ è negativa; nell'esempio numerico che vedremo con Mohr sono invece tutte non negative. Il nome indica la posizione nell'ordinamento, non il segno.`,
      },
      {
        id: 'l36-2',
        kind: 'spiega',
        title: 'Radici distinte, doppie, triple',
        md: `Come per la deformazione, ci sono tre casi (§3.11.2).

- **Radici distinte.** C'è una sola terna principale, e il tensore si scrive nella **rappresentazione spettrale** $\\tens T=\\sum_i\\lambda_i\\hat n_i\\otimes\\hat n_i$: somma di tre proiettori, ciascuno pesato con la sua tensione principale. Applicandola a $\\hat n_2$, per esempio, sopravvive solo il secondo termine e si ritrova $\\tens T\\hat n_2=\\lambda_2\\hat n_2$.
- **Radice doppia**, $\\lambda_1=\\lambda_2=\\lambda\\neq\\lambda_3$. La direzione $\\hat n_3$ è privilegiata, e ogni direzione perpendicolare a essa è principale: $\\tens T=\\lambda_3\\hat n_3\\otimes\\hat n_3+\\lambda(\\tens I-\\hat n_3\\otimes\\hat n_3)$. Le terne principali sono $\\infty^1$.
- **Radice tripla**, $\\lambda_1=\\lambda_2=\\lambda_3=\\lambda$. Allora $\\tens T=\\lambda\\tens I$, e **ogni** riferimento è principale. È lo stato **idrostatico**, di cui parliamo subito.`,
      },
      {
        id: 'l36-2c',
        kind: 'spiega',
        title: 'Lo stato idrostatico e la pressione',
        md: `Con $\\tens T=\\lambda\\tens I$ il vettore tensione su qualunque giacitura è $\\vet t_n=\\lambda\\hat n$: su **ogni** piano la tensione è solo normale e vale sempre $\\lambda$. Nessun piano ha tangenziale.

L'immagine della dispensa è una piccola **sfera immersa in un fluido in quiete**: il fluido la spinge con la stessa pressione da tutte le parti, sempre perpendicolarmente alla superficie. Con la convenzione dei segni del corso, la pressione corrisponde a $\\lambda<0$ (deduzione).

Questo collegamento dice una cosa importante: **la tensione generalizza la pressione**. Un fluido in quiete non sopporta sforzi tangenziali, quindi il suo stato di tensione è sempre idrostatico e un solo numero, la pressione, lo descrive. Un solido invece può sopportare anche tangenziali, e per questo servono le sei componenti di un tensore simmetrico.`,
      },
      {
        id: 'l36-3',
        kind: 'prova',
        title: 'Le direzioni principali sul modello',
        md: `Nel modello vedi le tre direzioni principali, ciascuna con la sua tensione principale, e in giallo la giacitura della tangenziale massima, che studieremo nella prossima lezione.`,
        tasks: [`Scegli «idrostatico»: la radice è tripla e ogni terna è principale; il motore ne disegna una qualunque.`, `Scegli «esercizio §3.14»: una delle tre tensioni principali è nulla. Tienilo a mente per la classificazione.`, `Scegli «trazione semplice»: due tensioni principali sono nulle.`],
        visual: ST({ mode: 'principali', preset: 'generico', presets: ['generico', 'esercizio', 'trazione', 'idrostatico'], controls: ['preset'] }),
      },
      {
        id: 'l36-3q',
        kind: 'domanda',
        q: { id: 'l36-q4', kind: 'scelta', q: `In uno stato idrostatico $\\tens T=\\lambda\\tens I$, quanto vale la tensione tangenziale su un piano qualunque?`, options: [`Zero: su ogni piano $\\vet t_n=\\lambda\\hat n$ è solo normale`, `$\\lambda$`, `$\\lambda/2$`, `Dipende dal piano`], correct: 0, why: `Con radice tripla ogni direzione è principale (§3.11.2): il vettore tensione è sempre parallelo a $\\hat n$, quindi la tangenziale è nulla su ogni piano. $\\lambda$ è la tensione normale, uguale su tutti i piani.` },
      },
      {
        id: 'l36-4',
        kind: 'spiega',
        title: 'Il vettore tensione visto dal riferimento principale',
        md: `Le tensioni principali servono anche a **classificare** gli stati di tensione (§3.12). Per farlo, guardiamo il vettore tensione su una giacitura qualunque $\\hat m$, scritto nel riferimento principale. Se $m_i$ sono le componenti di $\\hat m$ in quel riferimento, dalla rappresentazione spettrale si ottiene
$$\\vet t_m=\\lambda_1m_1\\hat n_1+\\lambda_2m_2\\hat n_2+\\lambda_3m_3\\hat n_3.$$
Ogni componente di $\\hat m$ viene «stirata» dalla sua tensione principale.

Se tutte e tre le tensioni principali sono diverse da zero, lo stato si dice **triassiale**: $\\vet t_m$ può avere qualunque direzione nello spazio. Ma che cosa succede se qualcuna è nulla? Lo vediamo nel prossimo passo.`,
      },
      {
        id: 'l36-4b',
        kind: 'spiega',
        title: 'Biassiale e monoassiale: i piani scarichi',
        md: `**Stato biassiale, o piano** (una tensione principale nulla, diciamo $\\lambda_1=0$). Il primo termine sparisce: $\\vet t_m=\\lambda_2m_2\\hat n_2+\\lambda_3m_3\\hat n_3$. Il vettore tensione sta **sempre nel piano** di $\\hat n_2$ e $\\hat n_3$. Inoltre sulla giacitura $\\hat n_1$ il vettore tensione è **nullo**, $\\vet t_{n_1}=\\vet 0$: niente normale e niente tangenziale. Quel piano si chiama **piano scarico**. È un caso molto comune: è lo stato degli elementi di trave che vedremo con Saint-Venant. Esempio della dispensa: una matrice con il solo $\\tau_{12}=\\tau$ ha il piano di normale $\\hat e_3$ scarico, e lo stato è al più biassiale.

**Stato monoassiale** (due nulle, $\\lambda_1=\\lambda_2=0$). Resta $\\vet t_m=\\lambda_3m_3\\hat n_3$: il vettore tensione è **sempre parallelo** a $\\hat n_3$. I piani scarichi sono $\\infty^1$: tutti quelli che contengono la direzione $\\hat n_3$, cioè il fascio di asse $\\hat n_3$, perché per essi $m_3=0$. Esempio: $\\operatorname{diag}(\\sigma,0,0)$, la **trazione** semplice se $\\sigma>0$ o la **compressione** semplice se $\\sigma<0$.`,
      },
      {
        id: 'l36-4c',
        kind: 'spiega',
        title: 'Monoassiale non vuol dire «solo tensione normale»',
        md: `Il nome «monoassiale» induce in un errore frequente, e la dispensa lo segnala con un riquadro (p. 52). Pensa a un provino tirato da una forza $F$ lungo il suo asse.

Se lo tagli con un piano **retto**, perpendicolare all'asse, il vettore tensione è parallelo all'asse e quindi perpendicolare al taglio: c'è solo tensione normale, $\\vet t_n=\\sigma_n\\hat n$.

Se lo tagli con un piano **obliquo**, il vettore tensione è ancora parallelo all'asse (lo stato è monoassiale), ma ora l'asse non è perpendicolare al taglio. Il vettore quindi ha sia una componente normale $\\sigma_m$ sia una tangenziale $\\tau_m$.

Quindi «monoassiale» descrive la **direzione** del vettore tensione, sempre la stessa, non l'assenza di tangenziali. Vedremo con Mohr che proprio sui tagli obliqui a 45° la tangenziale del provino è massima.`,
      },
      {
        id: 'l36-5',
        kind: 'domanda',
        q: { id: 'l36-q1', kind: 'vf', q: `In un provino in trazione (stato monoassiale) un taglio obliquo ha solo tensione normale.`, answer: false, why: `Attenzione di p. 52: il vettore tensione resta parallelo all'asse del provino, ma su un taglio obliquo non è perpendicolare al piano, quindi si scompone in $\\sigma_m$ e $\\tau_m$. Solo il taglio retto ha tensione puramente normale.` },
      },
      {
        id: 'l36-5a',
        kind: 'spiega',
        title: 'Classificare senza calcolare gli autovalori',
        md: `Per classificare uno stato di tensione non serve risolvere l'equazione secolare: bastano gli **invarianti** (§3.12). La regola della dispensa è:

- $III\\neq0$: **triassiale**;
- $III=0$ e $II\\neq0$: **biassiale**;
- $III=II=0$: **monoassiale** (e se anche $I=0$ lo stato è nullo).

Il perché si vede scrivendo gli invarianti con le radici (passaggio aggiunto). $III=\\lambda_1\\lambda_2\\lambda_3$ è un prodotto: è nullo se e solo se almeno una tensione principale è nulla. Se $\\lambda_1=0$, allora $II=\\lambda_1\\lambda_2+\\lambda_2\\lambda_3+\\lambda_1\\lambda_3$ si riduce a $\\lambda_2\\lambda_3$, che è nullo se e solo se è nulla anche una seconda tensione principale. Ecco perché il determinante dice se ce n'è almeno una nulla, e il secondo invariante se ce n'è una seconda.

Lo stesso ragionamento, nel capitolo 2, classificava le deformazioni con dilatazioni principali nulle (§2.10).`,
      },
      {
        id: 'l36-5q',
        kind: 'domanda',
        q: { id: 'l36-q3', kind: 'scelta', q: `Con $III=0$ e $II\\neq0$ lo stato di tensione è…`, options: [`biassiale`, `triassiale`, `monoassiale`, `idrostatico`], correct: 0, why: `$III=\\lambda_1\\lambda_2\\lambda_3=0$ dice che almeno una tensione principale è nulla; con quella nulla $II$ si riduce al prodotto delle altre due, e $II\\neq0$ dice che sono entrambe diverse da zero (§3.12). Triassiale richiederebbe $III\\neq0$; idrostatico ha tre radici uguali, e con una nulla sarebbe lo stato nullo.` },
      },
      {
        id: 'l36-6',
        kind: 'numeri',
        title: 'Esercizio §3.14: classificazione e tensioni principali',
        md: `Applichiamo tutto all'esercizio della dispensa, la matrice con righe $(0,-3,0)$, $(-3,0,6)$, $(0,6,0)$.

**Classificazione.** Gli invarianti sono $I=${f(P314.invarianti[0])}$, $II=${f(P314.invarianti[1])}$, $III=${f(P314.invarianti[2])}$. Il determinante è nullo e il secondo invariante no, quindi lo stato è **${P314.stato}**.

**Tensioni principali.** L'equazione secolare diventa $\\lambda(\\lambda^2-45)=0$, con radici
$$s_1=3\\sqrt5=${f(P314.s[0])},\\quad s_2=0,\\quad s_3=-3\\sqrt5=${f(P314.s[2])}.$$
**Direzioni** (a meno del verso): $\\hat n_1=(${f(P314.n[0][0])};\\ ${f(P314.n[0][1])};\\ ${f(P314.n[0][2])})$, $\\hat n_2=(${f(P314.n[1][0])};\\ ${f(P314.n[1][1])};\\ ${f(P314.n[1][2])})$, e $\\hat n_3=\\hat n_1\\wedge\\hat n_2$, perché la terna è ortogonale. La giacitura $\\hat n_2$, con tensione principale nulla, è il **piano scarico**. La verifica $\\tens T\\hat n_3=-3\\sqrt5\\,\\hat n_3$, illeggibile negli appunti, è stata ricalcolata (nota NF-05).`,
        values: { s1: P314.s[0], s3: P314.s[2], II: P314.invarianti[1] },
        visual: ST({ mode: 'principali', preset: 'esercizio', presets: ['esercizio'] }),
      },
      {
        id: 'l36-6a',
        kind: 'spiega',
        title: 'Attenzione a non confondere',
        md: `Tre errori tipici su questa lezione.

1. **«Monoassiale» scambiato per «solo tensioni normali».** Il vettore tensione ha sempre la stessa direzione, ma su un taglio obliquo si scompone in normale e tangenziale (riquadro di p. 52).
2. **Dimenticare perché vale il teorema spettrale.** All'orale, quando dici «$\\tens T$ ha tre direzioni principali ortogonali», aggiungi «perché è simmetrico, per il punto 3 di Cauchy–Poisson». È il collegamento che il docente cerca.
3. **Credere che sia sempre $s_1>0$ e $s_3<0$.** I nomi «di trazione» e «di compressione» indicano solo la più grande e la più piccola; le tre tensioni principali possono avere tutte lo stesso segno.`,
      },
      {
        id: 'l36-7',
        kind: 'riassunto',
        md: `**Il filo della lezione.** Normale e tangenziale impegnano diversamente il materiale, quindi ci chiediamo su quali piani la tangenziale sparisce: è il problema agli autovalori di $\\tens T$, che ha sempre una terna ortogonale di soluzioni reali perché $\\tens T$ è simmetrico. Le radici dell'equazione secolare, ordinate $s_1\\ge s_2\\ge s_3$, sono le tensioni principali; se sono distinte la terna è unica, se c'è una radice doppia le terne sono infinite, se la radice è tripla lo stato è idrostatico, come in un fluido in quiete. Contando le tensioni principali nulle, leggibili anche dagli invarianti, lo stato è triassiale, biassiale (con un piano scarico) o monoassiale; e monoassiale non vuol dire senza tangenziali.

- Problema agli autovalori: $(\\tens T-\\lambda\\tens I)\\hat n=\\vet 0$, $\\ \\lambda^3-I\\lambda^2+II\\lambda-III=0$ (§3.11.1).
- Rappresentazione spettrale: $\\tens T=\\sum_i\\lambda_i\\,\\hat n_i\\otimes\\hat n_i$ (§3.11.2).
- Stato idrostatico: $\\tens T=\\lambda\\tens I$ (§3.11.2).
- Classificazione: $III\\neq0$ triassiale; $III=0,\\ II\\neq0$ biassiale; $III=II=0$ monoassiale (§3.12).`,
        orale: ['Tensioni e direzioni principali; casi dell’equazione secolare; stato idrostatico. (dispensa, domanda 9)', 'Classificazione degli stati di tensione (anche tramite gli invarianti); piano scarico; monoassiale e taglio obliquo. (dispensa, domanda 10)'],
      },
    ],
  },
  // ================================================================== c3.7
  {
    concept: 'c3.7',
    title: 'Tensioni estreme',
    minutes: 26,
    source: D(3, '3.13–3.14', 'Prop 3.13.1–3.13.2', '53–56'),
    visual: ST({ mode: 'principali', preset: 'esercizio', presets: ['esercizio', 'generico', 'trazione'], controls: ['preset'] }),
    steps: [
      {
        id: 'l37-0',
        kind: 'spiega',
        title: 'Dove siamo e dove andiamo',
        md: `Nella lezione precedente abbiamo trovato le tensioni principali $s_1\\ge s_2\\ge s_3$, le tensioni normali sui tre piani privi di tangenziale. Ora le usiamo per rispondere a una domanda da ingegneri: **su quale piano la tensione è più grande, e quanto vale?**

La domanda ha due versioni, perché le tensioni sono di due tipi. Per la **tensione normale** la risposta è semplice e la dispensa la ricava con un ragionamento breve: la massima e la minima sono proprio $s_1$ e $s_3$. Per la **tensione tangenziale** il problema è più difficile, e la dispensa dà il risultato senza dimostrarlo: noi lo enunciamo, lo capiamo e lo verifichiamo. Chiudiamo con il punto 3 dell'esercizio svolto.`,
      },
      {
        id: 'l37-0b',
        kind: 'spiega',
        title: 'Un problema di massimo vincolato',
        md: `Mettiamoci nel **riferimento principale**, dove $[\\tens T]=\\operatorname{diag}(s_1,s_2,s_3)$. Una giacitura qualunque $\\hat m$ ha componenti $m_1,m_2,m_3$, e la tensione normale su di essa è la forma quadratica della lezione sul calcolo, che qui ha solo i quadrati perché le tangenziali sono nulle:
$$\\sigma_m=s_1m_1^2+s_2m_2^2+s_3m_3^2.$$
Vogliamo il massimo di questa funzione al variare di $\\hat m$. Ma le $m_i$ non sono libere: $\\hat m$ è un versore, quindi deve valere $\\hat m\\cdot\\hat m=m_1^2+m_2^2+m_3^2=1$. È un **massimo vincolato**, uno dei tanti problemi di ottimizzazione che si incontrano in ingegneria (§3.13.1).

Si potrebbe risolvere con le tecniche dell'analisi, ma la dispensa usa un ragionamento **euristico** molto più diretto. L'osservazione chiave è che i pesi $m_i^2$ sono **non negativi** e **sommano a 1**: $\\sigma_m$ è una media pesata delle tre tensioni principali.`,
      },
      {
        id: 'l37-1',
        kind: 'derivazione',
        title: 'Tensioni normali estreme (ragionamento euristico)',
        md: `**Dove vogliamo arrivare:** $s_3\\le\\sigma_m\\le s_1$ per ogni giacitura. **L'idea:** in una media pesata, se sostituisci ogni valore con il più grande, il risultato non può diminuire; e il valore più grande si raggiunge davvero, su $\\hat n_1$. Il controllo numerico verifica la disuguaglianza su tensori e giaciture casuali.`,
        source: D(3, '3.13.1', 'Prop 3.13.1', 53),
        der: {
          sample: (r) => { const o: R = {}; putMat(o, 'T', T.sym(T.randMat(r))); putVec(o, 'm', T.unit(T.randVec(r))); return o; },
          lines: [
            { tex: '\\sigma_m=\\vet t_m\\cdot\\hat m', why: `È la definizione di tensione normale sulla giacitura $\\hat m$.`, val: (v) => traction(mat(v, 'T'), vec(v, 'm')).sigma },
            { tex: '=s_1m_1^2+s_2m_2^2+s_3m_3^2', why: `Nel riferimento principale il vettore tensione ha componenti $(s_1m_1,s_2m_2,s_3m_3)$, come abbiamo visto con la classificazione; il prodotto scalare con $\\hat m$ moltiplica ciascuna per $m_i$. Il campione numerico calcola le $m_i$ proiettando $\\hat m$ sulle direzioni principali vere.`, val: (v) => { const p = principalStress(mat(v, 'T')); const m = vec(v, 'm'); return p.s.reduce((a, s, i) => a + s * T.dotv(m, p.n[i]) ** 2, 0); } },
            {
              tex: '\\le s_1(m_1^2+m_2^2+m_3^2)',
              aggiunto: true,
              why: `Abbiamo sostituito $s_2$ e $s_3$ con $s_1$, che è il più grande dei tre. Siccome ogni peso $m_i^2$ è non negativo, aumentare un coefficiente non può far diminuire la somma: la nuova quantità è maggiore o uguale.`,
            },
            {
              tex: '=s_1',
              why: `Il vincolo $m_1^2+m_2^2+m_3^2=1$ chiude il conto: $\\sigma_m\\le s_1$ per ogni giacitura. Inoltre il valore $s_1$ si raggiunge sulla giacitura $\\hat n_1$, dove $m_1=1$: non è solo un limite superiore, è il **massimo**. Con $s_3$ al posto di $s_1$ e la disuguaglianza rovesciata si trova che $s_3$ è il minimo.`,
              ask: { q: `Perché $s_1$ non è solo un limite superiore, ma proprio il massimo?`, options: [`Perché si raggiunge: è la tensione normale sulla giacitura $\\hat n_1$`, `Perché $s_1>0$`, `Perché $s_2=0$`, `Per i moltiplicatori di Lagrange`], correct: 0, why: `Un limite superiore che viene raggiunto è un massimo (§3.13.1). Il segno di $s_1$ non conta (può essere negativa), $s_2$ non è necessariamente nulla, e i moltiplicatori di Lagrange sono proprio ciò che il ragionamento euristico evita.` },
              eq: 'Prop 3.13.1',
            },
          ],
          checks: [{ what: 's3 ≤ σ_m ≤ s1', f: (v) => { const p = principalStress(mat(v, 'T')); const s = traction(mat(v, 'T'), vec(v, 'm')).sigma; return [s <= p.s[0] + 1e-12 && s >= p.s[2] - 1e-12 ? 1 : 0, 1]; } }],
        },
      },
      {
        id: 'l37-1b',
        kind: 'spiega',
        title: 'Che cosa dice il risultato sulle normali',
        md: `Rileggiamo la Prop 3.13.1: **la tensione normale su qualunque piano è compresa tra la tensione principale minima e la massima**, $s_3\\le\\sigma_m\\le s_1$. Le tensioni principali non sono solo i valori sui piani senza tangenziale: sono anche gli **estremi** della tensione normale.

Controllo su un caso particolare: nello stato idrostatico $s_1=s_2=s_3=\\lambda$, e la disuguaglianza diventa $\\lambda\\le\\sigma_m\\le\\lambda$, cioè $\\sigma_m=\\lambda$ su ogni piano. È proprio ciò che sapevamo dalla lezione precedente.

È lo stesso risultato già incontrato nel capitolo 2 per le dilatazioni, $e_3\\le\\varepsilon_n\\le e_1$ (Prop 2.9.4), con la stessa dimostrazione. Ed è un ottimo **controllo** negli esercizi: una tensione normale fuori da $[s_3,s_1]$ è un errore di conto.`,
      },
      {
        id: 'l37-1q',
        kind: 'domanda',
        q: { id: 'l37-q2', kind: 'scelta', q: `In un punto le tensioni principali sono $s_1=8$, $s_2=2$, $s_3=-4$. Uno studente trova, su una certa giacitura, $\\sigma_m=9$. Che cosa concludi?`, options: [`C'è un errore di conto: deve essere $-4\\le\\sigma_m\\le8$`, `Va bene: $\\sigma_m$ può superare $s_1$ se c'è tangenziale`, `Va bene, purché il piano non sia principale`, `Dipende da $s_2$`], correct: 0, why: `Per la Prop 3.13.1 la tensione normale su qualunque giacitura sta tra $s_3$ e $s_1$. La presenza di tangenziali non cambia nulla: la disuguaglianza vale per tutti i piani, principali o no.` },
      },
      {
        id: 'l37-2a',
        kind: 'spiega',
        title: 'Perché la tangenziale è più difficile',
        md: `Proviamo lo stesso per la tangenziale (§3.13.2). Nella lezione sul calcolo abbiamo visto che la componente tangenziale lungo una direzione $\\hat\\nu$ del piano si ottiene proiettando il vettore tensione su $\\hat\\nu$. Nel riferimento principale diventa
$$\\tau_{m\\nu}=s_1m_1\\nu_1+s_2m_2\\nu_2+s_3m_3\\nu_3.$$
Ora le incognite sono **due versori**: la giacitura $\\hat m$ e la direzione $\\hat\\nu$. In tutto sei variabili, con tre vincoli: $|\\hat m|=1$, $|\\hat\\nu|=1$ e $\\hat m\\cdot\\hat\\nu=0$, perché $\\hat\\nu$ deve stare nel piano.

Qui i coefficienti $m_i\\nu_i$ possono essere negativi, e il trucco della media pesata non funziona più. Serve il metodo dei **moltiplicatori di Lagrange**, e la dispensa riporta il **risultato senza la derivazione** (nota NF-11). Noi faremo lo stesso: lo enunciamo e poi lo verifichiamo.`,
      },
      {
        id: 'l37-2',
        kind: 'spiega',
        title: 'Il risultato: la tangenziale massima',
        md: `La Prop 3.13.2 afferma:
$$\\tau_{\\max}=\\frac{s_1-s_3}2,\\qquad\\hat m=\\tfrac1{\\sqrt2}(\\hat n_1-\\hat n_3),\\qquad\\hat\\nu=\\tfrac1{\\sqrt2}(\\hat n_1+\\hat n_3).$$
Leggila così. La tangenziale massima vale **metà della differenza tra la tensione principale massima e la minima**. Agisce su un piano la cui normale $\\hat m$ sta a metà strada tra $\\hat n_1$ e $\\hat n_3$, cioè sulla **bisettrice** del quadrante formato dalle direzioni di $s_1$ e di $s_3$ (figura di p. 54); la sua direzione $\\hat\\nu$ è l'altra bisettrice dello stesso quadrante. La direzione intermedia $\\hat n_2$ e la tensione $s_2$ non entrano.

Una nota della dispensa: negli appunti compariva $\\frac1{\\sqrt2}(\\hat m_1-\\hat m_2)$, ma la combinazione corretta è tra le direzioni di $s_1$ e di $s_3$.

Nel modello la giacitura della tangenziale massima è quella disegnata in giallo.`,
      },
      {
        id: 'l37-3',
        kind: 'derivazione',
        title: 'Verifica del risultato (non dimostrazione)',
        md: `**Che cosa facciamo:** non dimostriamo che quello è il massimo (servirebbe Lagrange), ma **verifichiamo** che sul piano indicato la tangenziale vale davvero $\\frac12(s_1-s_3)$, come fa la dispensa. Nel riferimento principale $\\hat m=(1,0,-1)/\\sqrt2$ e $\\hat\\nu=(1,0,1)/\\sqrt2$. Il controllo finale calcola anche la tensione normale sullo stesso piano.`,
        source: D(3, '3.13.2', 'Prop 3.13.2', 54),
        der: {
          sample: (r) => { const o: R = {}; putMat(o, 'T', T.sym(T.randMat(r))); return o; },
          lines: [
            { tex: '\\tau_{m\\nu}=\\tens T\\hat m\\cdot\\hat\\nu', why: `È la componente tangenziale lungo $\\hat\\nu$. Il campione numerico la calcola con le direzioni principali vere di un tensore simmetrico casuale.`, val: (v) => { const t = tauMax(mat(v, 'T')); return traction(mat(v, 'T'), t.m, t.nu).tauNu; } },
            { tex: '=s_1m_1\\nu_1+s_2m_2\\nu_2+s_3m_3\\nu_3', aggiunto: true, why: `Abbiamo scritto la formula nel riferimento principale, dove $\\tens T$ è diagonale.`, val: (v) => { const p = principalStress(mat(v, 'T')); const t = tauMax(mat(v, 'T')); return p.s.reduce((a, s, i) => a + s * T.dotv(t.m, p.n[i]) * T.dotv(t.nu, p.n[i]), 0); } },
            { tex: '=s_1\\tfrac1{\\sqrt2}\\tfrac1{\\sqrt2}+s_2\\cdot0\\cdot0+s_3\\big(-\\tfrac1{\\sqrt2}\\big)\\tfrac1{\\sqrt2}', aggiunto: true, why: `Abbiamo sostituito le componenti: $m_1=\\nu_1=\\frac1{\\sqrt2}$, $m_2=\\nu_2=0$, $m_3=-\\frac1{\\sqrt2}$, $\\nu_3=\\frac1{\\sqrt2}$. Il termine con $s_2$ sparisce.`, val: (v) => { const p = principalStress(mat(v, 'T')); return p.s[0] / 2 - p.s[2] / 2; } },
            { tex: '=\\tfrac12(s_1-s_3)', why: `Abbiamo raccolto il fattore $\\frac12$. È il valore annunciato dalla Prop 3.13.2.`, val: (v) => { const p = principalStress(mat(v, 'T')); return (p.s[0] - p.s[2]) / 2; }, eq: 'Prop 3.13.2' },
          ],
          checks: [{ what: 'σ sullo stesso piano = (s1 + s3)/2', f: (v) => { const t = tauMax(mat(v, 'T')); const p = principalStress(mat(v, 'T')); return [traction(mat(v, 'T'), t.m).sigma, (p.s[0] + p.s[2]) / 2]; } }],
        },
      },
      {
        id: 'l37-3b',
        kind: 'spiega',
        title: 'Il piano della tangenziale massima non è scarico',
        md: `Il controllo finale della verifica dice una cosa importante. Sullo stesso piano su cui agisce $\\tau_{\\max}$, la tensione normale vale
$$\\sigma_m=s_1m_1^2+s_2m_2^2+s_3m_3^2=\\tfrac12(s_1+s_3).$$
Quindi la giacitura della tangenziale massima **non è scarica** di tensione normale: in generale su di essa c'è anche una normale, pari alla **semisomma** di $s_1$ e $s_3$, mentre la tangenziale è la **semidifferenza**.

Controllo su un caso particolare: la trazione semplice, con $s_1=\\sigma$ e $s_2=s_3=0$. Allora $\\tau_{\\max}=\\sigma/2$ e sullo stesso piano $\\sigma_m=\\sigma/2$: è il taglio obliquo a 45° del provino, che nella lezione precedente sapevamo avere sia normale sia tangenziale. La normale sul piano di $\\tau_{\\max}$ è nulla solo se $s_1=-s_3$, come nell'esercizio che vediamo adesso.`,
      },
      {
        id: 'l37-4',
        kind: 'domanda',
        q: { id: 'l37-q1', kind: 'vf', q: `La giacitura della tangenziale massima è scarica di tensione normale.`, answer: false, why: `Su di essa $\\sigma_m=\\frac12(s_1+s_3)$, che in generale non è nulla (§3.13.2). Nella trazione semplice vale $\\sigma/2$. È nulla solo nel caso particolare $s_1=-s_3$.` },
      },
      {
        id: 'l37-5',
        kind: 'numeri',
        title: 'Esercizio §3.14, punto 3',
        md: `Riprendiamo l'esercizio della dispensa, con $s_1=3\\sqrt5$, $s_2=0$, $s_3=-3\\sqrt5$ trovate nella lezione precedente.

- **Valore.** $\\tau_{\\max}=\\frac{3\\sqrt5-(-3\\sqrt5)}2=3\\sqrt5=${f(TM314.value)}$.
- **Giacitura.** $\\{\\hat m\\}=\\frac1{\\sqrt2}(\\hat n_1-\\hat n_3)=\\frac{\\sqrt5}5(1,0,-2)$, e **direzione** $\\{\\hat\\nu\\}=\\frac1{\\sqrt2}(\\hat n_1+\\hat n_3)=(0,-1,0)$, a meno del verso.
- **Normale sullo stesso piano.** $\\sigma=\\frac12(s_1+s_3)=${f(TM314.sigmaOn)}$: qui è nulla proprio perché $s_1=-s_3$.

La dispensa verifica anche con il calcolo diretto: $\\tens T\\hat m=(0,-3\\sqrt5,0)$, da cui $\\tau_{m\\nu}=3\\sqrt5$ e $\\sigma_m=0$. Negli appunti compariva il fattore $\\frac12$ dove andava letto $\\frac1{\\sqrt2}$. Per il punto 4 (la giacitura $(1,-1,-2)/\\sqrt6$) avevamo trovato $\\sigma_n=5$ e $\\tau_n=2\\sqrt5$: entrambi rispettano $s_3\\le5\\le s_1\\simeq6{,}71$ e $\\tau_n\\le\\tau_{\\max}$.`,
        values: { tmax: TM314.value },
        visual: ST({ mode: 'principali', preset: 'esercizio', presets: ['esercizio'] }),
      },
      {
        id: 'l37-5a',
        kind: 'spiega',
        title: 'Attenzione a non confondere',
        md: `Tre errori tipici su questa lezione.

1. **Dire che il piano di $\\tau_{\\max}$ è scarico.** Su di esso agisce anche la normale $\\frac12(s_1+s_3)$; è nulla solo se $s_1=-s_3$, come nell'esercizio §3.14, che proprio per questo può trarre in inganno.
2. **Dire che la dispensa dimostra la formula di $\\tau_{\\max}$.** La dispensa dà il risultato, ottenuto con i moltiplicatori di Lagrange, e lo **verifica**; la dimostrazione vera c'è solo per le normali estreme, con il ragionamento euristico.
3. **Combinare le direzioni sbagliate.** La tangenziale massima sta sulla bisettrice tra $\\hat n_1$ e $\\hat n_3$, cioè tra la direzione della principale massima e quella della minima, non tra $\\hat n_1$ e $\\hat n_2$ (era il refuso degli appunti).`,
      },
      {
        id: 'l37-6',
        kind: 'riassunto',
        md: `**Il filo della lezione.** Nel riferimento principale la tensione normale su un piano è una media pesata delle tensioni principali, con pesi non negativi a somma uno: per questo non può superare $s_1$ né scendere sotto $s_3$, e i due estremi si raggiungono sui piani principali. Per la tangenziale le incognite sono due versori vincolati, serve Lagrange e la dispensa dà il risultato: la massima è la semidifferenza tra $s_1$ e $s_3$, sulla bisettrice tra le loro direzioni, e lì agisce anche una tensione normale pari alla semisomma. Nell'esercizio §3.14 la tangenziale massima vale $3\\sqrt5$ e la normale sul suo piano è nulla perché $s_1=-s_3$.

- Normali estreme: $s_3\\le\\sigma_m\\le s_1$ $\\ \\forall\\hat m$ (Prop 3.13.1).
- Tangenziale massima: $\\tau_{\\max}=\\dfrac{s_1-s_3}2$, $\\ \\hat m=\\tfrac1{\\sqrt2}(\\hat n_1-\\hat n_3)$, $\\ \\hat\\nu=\\tfrac1{\\sqrt2}(\\hat n_1+\\hat n_3)$ (Prop 3.13.2).
- Normale sul piano di $\\tau_{\\max}$: $\\sigma_m=\\tfrac12(s_1+s_3)$ (§3.13.2).`,
        orale: ['Tensioni normali estreme (metodo euristico) e tensione tangenziale massima. (dispensa, domanda 11)'],
      },
    ],
  },
  // ================================================================== c3.8
  {
    concept: 'c3.8',
    title: 'Il cerchio di Mohr',
    minutes: 38,
    source: D(3, '3.15', 'Prop 3.15.1', '56–60'),
    visual: MOHR({ preset: 'esempio', alpha: 30 }),
    steps: [
      {
        id: 'l38-0',
        kind: 'spiega',
        title: 'Dove siamo e dove andiamo',
        md: `Finora abbiamo calcolato le tensioni con le matrici: il vettore tensione $\\tens T\\hat n$, la normale come forma quadratica, le tensioni principali come autovalori. Nella lezione sul calcolo e in quella sulle tensioni principali abbiamo anche visto che normale e tangenziale cambiano al variare del piano, ma non abbiamo mai **visto** come cambiano.

Il **cerchio di Mohr** è una rappresentazione **grafica** dello stato di tensione in un punto (§3.15). Un tempo era molto usato perché mostra a colpo d'occhio cose che il calcolo nasconde: dove sono le tensioni principali, quanto vale la tangenziale massima, come sono legati piani ortogonali. Le tappe: delimitiamo la famiglia di piani che il cerchio descrive; ricaviamo normale e tangenziale in funzione dell'angolo del piano; mostriamo che i punti stanno su un cerchio; impariamo a costruirlo con il **polo**; dimostriamo che la costruzione è giusta; e leggiamo sul cerchio tensioni principali e tangenziali estreme.`,
      },
      {
        id: 'l38-1',
        kind: 'spiega',
        title: 'Un fascio di piani attorno a una direzione principale',
        md: `Mohr non descrive tutti i piani per il punto, ma quelli di un **fascio**, cioè tutti i piani che contengono una stessa retta, quando quella retta è una **direzione principale** (§3.15.1). Prendiamo
$$[\\tens T]=\\begin{bmatrix}\\sigma_1&\\tau_{12}&0\\\\\\tau_{12}&\\sigma_2&0\\\\0&0&\\sigma_3\\end{bmatrix}.$$
Le tangenziali $\\tau_{13}$ e $\\tau_{23}$ sono nulle, quindi $\\tens T\\hat e_3=\\sigma_3\\hat e_3$: **$\\hat e_3$ è una direzione principale**.

Attenzione ai nomi: qui $\\sigma_1$, $\\sigma_2$ sono le tensioni normali sulle giaciture $\\hat e_1$, $\\hat e_2$, cioè componenti della matrice in questo riferimento, **non** le tensioni principali, che chiamiamo $s$.

I piani del fascio di asse $\\hat e_3$ hanno normali perpendicolari a $\\hat e_3$, che si descrivono con un solo angolo $\\alpha$:
$$\\hat m=(\\cos\\alpha,\\sin\\alpha,0),\\qquad\\hat\\nu=(-\\sin\\alpha,\\cos\\alpha,0).$$
$\\hat\\nu$ è la direzione nel piano del taglio che si ottiene ruotando $\\hat m$ di 90° **in senso antiorario**: è rispetto a essa che misureremo la tangenziale.`,
      },
      {
        id: 'l38-1b',
        kind: 'spiega',
        title: 'Perché tutto si riduce a un piano',
        md: `Con questa scelta il problema diventa piano. Il vettore tensione su un piano del fascio è $\\tens T\\hat m$; siccome $\\hat m$ non ha componente lungo $\\hat e_3$ e la terza riga della matrice ha zeri nelle prime due posizioni, anche $\\vet t_m$ **non ha componente lungo $\\hat e_3$**: sta nel piano di $\\hat e_1$ e $\\hat e_2$ (§3.15.1).

Quindi sul piano di giacitura $\\hat m$ il vettore tensione ha solo due componenti speciali che ci interessano: la normale $\\sigma_m$, lungo $\\hat m$, e la tangenziale $\\tau_{m\\nu}$, lungo $\\hat\\nu$. Non c'è tangenziale lungo $\\hat e_3$, e quindi $\\tau_{m\\nu}$ è **tutta** la tangenziale, a meno del segno (deduzione). Ogni piano del fascio è descritto da una coppia di numeri $(\\sigma_m,\\tau_{m\\nu})$, cioè da un punto in un piano cartesiano: questa è l'idea di Mohr.

Due precisazioni della dispensa. Se lo stato è **biassiale**, con $\\hat e_3$ piano scarico, questo vale per ogni giacitura, ed è il cerchio «classico». Se lo stato è **triassiale**, vale solo per i piani del fascio; per gli altri servirà l'arbelo, nella prossima lezione.`,
      },
      {
        id: 'l38-1q',
        kind: 'domanda',
        q: { id: 'l38-q1', kind: 'scelta', q: `Perché per i piani del fascio di asse $\\hat e_3$ il vettore tensione sta nel piano $\\hat e_1\\hat e_2$?`, options: [`Perché $\\hat e_3$ è principale ($\\tau_{13}=\\tau_{23}=0$) e $\\hat m$ non ha componente lungo $\\hat e_3$`, `Perché $\\sigma_3=0$ in ogni caso`, `Perché il cerchio di Mohr vale solo per stati monoassiali`, `Perché $\\hat\\nu$ è perpendicolare a $\\hat m$`], correct: 0, why: `La terza componente di $\\tens T\\hat m$ è $\\tau_{13}\\cos\\alpha+\\tau_{23}\\sin\\alpha+\\sigma_3\\cdot0=0$. Non serve $\\sigma_3=0$: il ragionamento vale anche in stato triassiale, per i piani del fascio. La perpendicolarità di $\\hat\\nu$ e $\\hat m$ è vera ma non spiega nulla sulla componente lungo $\\hat e_3$.` },
      },
      {
        id: 'l38-2',
        kind: 'derivazione',
        title: 'La tensione normale in funzione di 2α',
        md: `**Dove vogliamo arrivare:** $\\sigma_m$ scritta con l'angolo doppio $2\\alpha$. **L'idea:** partiamo dalla forma quadratica della lezione sul calcolo con $\\hat m=(\\cos\\alpha,\\sin\\alpha,0)$; poi le formule di duplicazione trasformano quadrati e prodotti di seni e coseni in funzioni di $2\\alpha$. Il motivo di questo cambio sarà chiaro tra due passi: con $2\\alpha$ comparirà un cerchio.`,
        source: D(3, '3.15.2', undefined, 57),
        der: {
          sample: sampleMohr,
          lines: [
            { tex: '\\sigma_m=\\sigma_1\\cos^2\\alpha+\\sigma_2\\sin^2\\alpha+2\\tau_{12}\\sin\\alpha\\cos\\alpha', why: `È la forma quadratica $\\sigma_m=\\tens T\\hat m\\cdot\\hat m$ con $m_1=\\cos\\alpha$, $m_2=\\sin\\alpha$, $m_3=0$: restano i quadrati delle prime due componenti e il doppio prodotto con $\\tau_{12}$.`, val: (v) => v.s1 * Math.cos(v.a) ** 2 + v.s2 * Math.sin(v.a) ** 2 + 2 * v.t * Math.sin(v.a) * Math.cos(v.a) },
            {
              tex: '=\\sigma_1\\tfrac{1+\\cos2\\alpha}2+\\sigma_2\\tfrac{1-\\cos2\\alpha}2+\\tau_{12}\\sin2\\alpha',
              aggiunto: true,
              why: `Abbiamo usato le formule di duplicazione: $\\cos^2\\alpha=\\frac{1+\\cos2\\alpha}2$, $\\sin^2\\alpha=\\frac{1-\\cos2\\alpha}2$ e $2\\sin\\alpha\\cos\\alpha=\\sin2\\alpha$. Ora compare solo l'angolo doppio.`,
              val: (v) => (v.s1 * (1 + Math.cos(2 * v.a))) / 2 + (v.s2 * (1 - Math.cos(2 * v.a))) / 2 + v.t * Math.sin(2 * v.a),
            },
            { tex: '=\\dfrac{\\sigma_1+\\sigma_2}2+\\dfrac{\\sigma_1-\\sigma_2}2\\cos2\\alpha+\\tau_{12}\\sin2\\alpha', why: `Abbiamo raccolto i termini che non dipendono dall'angolo, $\\frac{\\sigma_1}2+\\frac{\\sigma_2}2$, e quelli che moltiplicano $\\cos2\\alpha$, $\\frac{\\sigma_1}2-\\frac{\\sigma_2}2$.`, val: (v) => mohr({ s1: v.s1, s2: v.s2, t12: v.t }).at(v.a).sigma, eq: '§3.15.2' },
          ],
        },
      },
      {
        id: 'l38-2b',
        kind: 'spiega',
        title: 'La tangenziale, con lo stesso procedimento',
        md: `La tangenziale si ottiene allo stesso modo, proiettando il vettore tensione su $\\hat\\nu=(-\\sin\\alpha,\\cos\\alpha,0)$ con la formula di $\\tau_{n\\nu}$ della lezione sul calcolo (§3.15.2):
$$\\tau_{m\\nu}=(\\sigma_2-\\sigma_1)\\sin\\alpha\\cos\\alpha+\\tau_{12}(\\cos^2\\alpha-\\sin^2\\alpha).$$
Con $\\sin\\alpha\\cos\\alpha=\\frac12\\sin2\\alpha$ e $\\cos^2\\alpha-\\sin^2\\alpha=\\cos2\\alpha$ diventa
$$\\tau_{m\\nu}=-\\frac{\\sigma_1-\\sigma_2}2\\sin2\\alpha+\\tau_{12}\\cos2\\alpha.$$
Controllo con $\\alpha=0$: il piano è quello di giacitura $\\hat e_1$, e le formule danno $\\sigma_m=\\sigma_1$ e $\\tau_{m\\nu}=\\tau_{12}$. È giusto: sulla faccia $\\hat e_1$ la normale è $\\sigma_1$ e la tangenziale in direzione $\\hat e_2$ è $\\tau_{12}$.

Guarda la struttura delle due formule: un termine costante (solo in $\\sigma_m$) più una combinazione di $\\cos2\\alpha$ e $\\sin2\\alpha$ con gli **stessi coefficienti**, scambiati. Questo è il segnale che c'è un cerchio.`,
      },
      {
        id: 'l38-3',
        kind: 'derivazione',
        title: 'L\'equazione del cerchio',
        md: `**Dove vogliamo arrivare:** una relazione tra $\\sigma_m$ e $\\tau_{m\\nu}$ in cui l'angolo $\\alpha$ non compare più. **L'idea:** portiamo a sinistra la semisomma $\\frac{\\sigma_1+\\sigma_2}2$, così restano due combinazioni di $\\cos2\\alpha$ e $\\sin2\\alpha$; elevando al quadrato e sommando, la relazione $\\cos^2+\\sin^2=1$ elimina l'angolo, esattamente come $x=R\\cos t$, $y=R\\sin t$ dà $x^2+y^2=R^2$.`,
        source: D(3, '3.15.2', undefined, 57),
        der: {
          sample: sampleMohr,
          lines: [
            { tex: '\\Big(\\sigma_m-\\dfrac{\\sigma_1+\\sigma_2}2\\Big)^2+\\tau_{m\\nu}^2', why: `È la quantità che vogliamo calcolare: la somma dei quadrati delle due espressioni, dopo aver tolto a $\\sigma_m$ la semisomma.`, val: (v) => { const q = mohr({ s1: v.s1, s2: v.s2, t12: v.t }).at(v.a); return (q.sigma - (v.s1 + v.s2) / 2) ** 2 + q.tau ** 2; } },
            {
              tex: '=\\Big(\\dfrac{\\sigma_1-\\sigma_2}2\\cos2\\alpha+\\tau_{12}\\sin2\\alpha\\Big)^2+\\Big(-\\dfrac{\\sigma_1-\\sigma_2}2\\sin2\\alpha+\\tau_{12}\\cos2\\alpha\\Big)^2',
              aggiunto: true,
              why: `Abbiamo sostituito le due formule trovate: togliendo la semisomma da $\\sigma_m$ resta solo la parte che dipende dall'angolo.`,
              val: (v) => { const d = (v.s1 - v.s2) / 2; const c = Math.cos(2 * v.a); const s = Math.sin(2 * v.a); return (d * c + v.t * s) ** 2 + (-d * s + v.t * c) ** 2; },
            },
            {
              tex: '=\\Big(\\dfrac{\\sigma_1-\\sigma_2}2\\Big)^2(\\cos^22\\alpha+\\sin^22\\alpha)+\\tau_{12}^2(\\sin^22\\alpha+\\cos^22\\alpha)',
              why: `Abbiamo sviluppato i due quadrati. I doppi prodotti valgono $+2\\frac{\\sigma_1-\\sigma_2}2\\tau_{12}\\sin2\\alpha\\cos2\\alpha$ nel primo e $-2\\frac{\\sigma_1-\\sigma_2}2\\tau_{12}\\sin2\\alpha\\cos2\\alpha$ nel secondo: hanno segni opposti e si elidono. I quadrati si raccolgono a due a due.`,
              val: (v) => ((v.s1 - v.s2) / 2) ** 2 * (Math.cos(2 * v.a) ** 2 + Math.sin(2 * v.a) ** 2) + v.t ** 2,
            },
            {
              tex: '=\\Big(\\dfrac{\\sigma_1-\\sigma_2}2\\Big)^2+\\tau_{12}^2=R^2',
              why: `$\\cos^22\\alpha+\\sin^22\\alpha=1$: l'angolo sparisce. Resta un numero che dipende solo dalla matrice, e lo chiamiamo $R^2$.`,
              ask: { q: `Che cosa compare nel raggio?`, options: [`La semidifferenza $\\frac{\\sigma_1-\\sigma_2}2$ e $\\tau_{12}$`, `La semisomma $\\frac{\\sigma_1+\\sigma_2}2$ e $\\tau_{12}$`, `$\\sigma_3$`, `L'angolo $\\alpha$`], correct: 0, why: `La semisomma è stata portata a sinistra: diventa il centro, non il raggio. Negli appunti c'era proprio questo refuso (§3.15.2). $\\sigma_3$ non entra, perché riguarda la direzione dell'asse del fascio, e $\\alpha$ è stato eliminato.` },
              val: (v) => mohr({ s1: v.s1, s2: v.s2, t12: v.t }).R ** 2,
              eq: '§3.15.2',
            },
          ],
        },
      },
      {
        id: 'l38-3b',
        kind: 'spiega',
        title: 'Che cosa dice l\'equazione',
        md: `Il risultato è l'equazione di un **cerchio** nel piano di coordinate $(\\sigma,\\tau)$:
$$\\Big(\\sigma_m-\\frac{\\sigma_1+\\sigma_2}2\\Big)^2+\\tau_{m\\nu}^2=R^2,\\qquad C=\\Big(\\frac{\\sigma_1+\\sigma_2}2,\\,0\\Big),\\qquad R=\\sqrt{\\Big(\\frac{\\sigma_1-\\sigma_2}2\\Big)^2+\\tau_{12}^2}.$$
In parole: **al ruotare del piano attorno a $\\hat e_3$, il punto $(\\sigma_m,\\tau_{m\\nu})$ percorre un cerchio** con centro sull'asse delle $\\sigma$, nella semisomma delle due tensioni normali, e raggio che dipende dalla semidifferenza e dalla tangenziale. Siccome nelle formule compare $2\\alpha$, quando il piano fa mezzo giro ($\\alpha$ da 0 a 180°) il punto fa un giro intero: **gli angoli sul cerchio sono doppi** di quelli nello spazio.

Controllo su un caso particolare: nello stato idrostatico del piano, $\\sigma_1=\\sigma_2$ e $\\tau_{12}=0$, il raggio è zero e il cerchio si riduce a un punto: tutti i piani hanno la stessa normale e nessuna tangenziale, come sapevamo.`,
      },
      {
        id: 'l38-4a',
        kind: 'spiega',
        title: 'La convenzione sugli assi',
        md: `Per disegnare il cerchio serve una convenzione sugli assi, e quella della dispensa ha una particolarità da ricordare (§3.15.2):

- l'asse $\\sigma$ è parallelo e **concorde** a $\\hat e_1$, cioè verso destra;
- l'asse $\\tau$ è parallelo e **opposto** a $\\hat e_2$, cioè **verso il basso**.

La dispensa non ne discute il motivo; è la scelta con cui la costruzione con il polo, che vediamo nel prossimo passo, dà i segni giusti (deduzione). In pratica: un punto con $\\tau>0$ si disegna **sotto** l'asse $\\sigma$, uno con $\\tau<0$ **sopra**. Nel diagramma a destra trovi questa convenzione.`,
      },
      {
        id: 'l38-4',
        kind: 'spiega',
        title: 'Costruire il cerchio con il polo',
        md: `La costruzione della dispensa ha quattro passi (§3.15.3).

1. Segna i punti $A(\\sigma_1,0)$ e $B(\\sigma_2,0)$ sull'asse $\\sigma$ (nella figura $B$ sta a sinistra).
2. Segna il centro $C$, a metà tra $A$ e $B$.
3. Segna il **polo di rappresentazione** $P(\\sigma_1,-\\tau_{12})$.
4. Traccia il cerchio di centro $C$ che passa per $P$. È il cerchio giusto, perché $\\overline{CP}^2=\\big(\\frac{\\sigma_1-\\sigma_2}2\\big)^2+\\tau_{12}^2=R^2$.

Il punto $Q_0(\\sigma_1,\\tau_{12})$, simmetrico di $P$ rispetto all'asse $\\sigma$, è il punto che rappresenta la giacitura $\\hat m=\\hat e_1$, cioè $\\alpha=0$: lo abbiamo appena controllato con le formule.

Ora l'**impiego** (§3.15.4). Per trovare il punto di una giacitura $\\hat m$ qualunque, traccia per il polo $P$ la retta parallela a $\\hat\\nu$. Quella retta è la **traccia** del piano di giacitura $\\hat m$, cioè la linea in cui il piano taglia il foglio $\\hat e_1\\hat e_2$. La retta incontra il cerchio in un secondo punto $Q_m$, e le coordinate di $Q_m$ sono proprio $(\\sigma_m,\\tau_{m\\nu})$. Nel diagramma è la retta verde tratteggiata.`,
        visual: MOHR({ preset: 'esempio', alpha: 30, principali: false }),
      },
      {
        id: 'l38-4q',
        kind: 'domanda',
        q: { id: 'l38-q2', kind: 'scelta', q: `Con $\\sigma_1=10$, $\\sigma_2=2$, $\\tau_{12}=3$, dove stanno il centro e il polo, e quanto vale il raggio?`, options: [`$C=(6,0)$, $P=(10,-3)$, $R=5$`, `$C=(4,0)$, $P=(10,3)$, $R=5$`, `$C=(6,0)$, $P=(10,3)$, $R=\\sqrt{45}$`, `$C=(6,0)$, $P=(2,-3)$, $R=5$`], correct: 0, why: `Il centro è la semisomma $(10+2)/2=6$; il polo è $(\\sigma_1,-\\tau_{12})=(10,-3)$; il raggio è $\\sqrt{4^2+3^2}=5$, con la semidifferenza. $C=(4,0)$ usa la semidifferenza come centro; $\\sqrt{45}$ viene dalla semisomma nel raggio, il refuso degli appunti; $(2,-3)$ usa $\\sigma_2$ invece di $\\sigma_1$, e $(10,3)$ è $Q_0$, non il polo.` },
      },
      {
        id: 'l38-5a',
        kind: 'spiega',
        title: 'Perché la costruzione funziona: l\'idea geometrica',
        md: `La costruzione con il polo va **dimostrata**: perché mai la retta per $P$ parallela a $\\hat\\nu$ dovrebbe cadere proprio nel punto giusto? La dispensa lo fa con un po' di geometria (Prop 3.15.1).

Chiama $M$ il punto del cerchio sul semiasse positivo delle $\\sigma$, quello più a destra. Ci servono tre fatti.

1. L'angolo $\\widehat{Q_0PQ_m}$ è $\\alpha$, perché la retta $PQ_0$ è verticale (traccia del piano $\\hat e_1$) e la retta $PQ_m$ è inclinata di $\\alpha$ rispetto a essa. È un **angolo alla circonferenza**, e un angolo alla circonferenza è metà dell'angolo al centro che insiste sullo stesso arco: quindi $\\widehat{Q_0CQ_m}=2\\alpha$. Ecco da dove vengono gli angoli doppi.
2. Chiama $\\gamma$ l'angolo $\\widehat{Q_0PM}$: allo stesso modo $\\widehat{Q_0CM}=2\\gamma$, e l'angolo al centro tra $Q_m$ e $M$ è $\\Theta=2\\gamma-2\\alpha$.
3. Nel triangolo rettangolo $CAQ_0$ i cateti sono $\\overline{CA}=\\frac{\\sigma_1-\\sigma_2}2$ e $\\overline{AQ_0}=\\tau_{12}$, e l'ipotenusa è $R$. Quindi $\\frac{\\sigma_1-\\sigma_2}2=R\\cos2\\gamma$ e $\\tau_{12}=R\\sin2\\gamma$.

La tesi è che le coordinate di $Q_m$, misurate dal centro, siano $R\\cos\\Theta$ e $R\\sin\\Theta$ e coincidano con le formule di $\\sigma_m$ e $\\tau_{m\\nu}$.`,
      },
      {
        id: 'l38-5',
        kind: 'derivazione',
        title: 'Correttezza della costruzione',
        md: `**Dove vogliamo arrivare:** $\\sigma_m=\\sigma_C+R\\cos\\Theta$ e $\\tau_{m\\nu}=R\\sin\\Theta$ con $\\Theta=2\\gamma-2\\alpha$. **La strategia:** sviluppiamo $R\\cos(2\\gamma-2\\alpha)$ con la formula di sottrazione e sostituiamo $R\\cos2\\gamma$ e $R\\sin2\\gamma$ con i cateti del triangolo $CAQ_0$. Facciamo il conto per l'ascissa; per l'ordinata il controllo numerico in fondo verifica l'analogo con il seno.`,
        source: D(3, '3.15.4', 'Prop 3.15.1', '58–59'),
        der: {
          sample: sampleMohr,
          lines: [
            { tex: 'R\\cos(2\\gamma-2\\alpha)', why: `È l'ascissa di $Q_m$ misurata dal centro $C$: il punto sta sul cerchio di raggio $R$, all'angolo $\\Theta=2\\gamma-2\\alpha$ da $M$.`, val: (v) => { const M = mohr({ s1: v.s1, s2: v.s2, t12: v.t }); const g2 = Math.atan2(v.t, (v.s1 - v.s2) / 2); return M.R * Math.cos(g2 - 2 * v.a); } },
            { tex: '=R\\cos2\\gamma\\cos2\\alpha+R\\sin2\\gamma\\sin2\\alpha', why: `Abbiamo applicato la formula di sottrazione del coseno: $\\cos(a-b)=\\cos a\\cos b+\\sin a\\sin b$.`, val: (v) => { const M = mohr({ s1: v.s1, s2: v.s2, t12: v.t }); const g2 = Math.atan2(v.t, (v.s1 - v.s2) / 2); return M.R * Math.cos(g2) * Math.cos(2 * v.a) + M.R * Math.sin(g2) * Math.sin(2 * v.a); } },
            {
              tex: '=\\dfrac{\\sigma_1-\\sigma_2}2\\cos2\\alpha+\\tau_{12}\\sin2\\alpha',
              why: `Abbiamo sostituito i cateti del triangolo $CAQ_0$: $R\\cos2\\gamma=\\frac{\\sigma_1-\\sigma_2}2$ e $R\\sin2\\gamma=\\tau_{12}$.`,
              ask: { q: `Quanto vale $R\\cos2\\gamma$?`, options: [`$\\frac{\\sigma_1-\\sigma_2}2$`, `$\\tau_{12}$`, `$\\frac{\\sigma_1+\\sigma_2}2$`, `$R$`], correct: 0, why: `È il cateto orizzontale $\\overline{CA}$ del triangolo $CAQ_0$, distanza tra il centro e $A(\\sigma_1,0)$. $\\tau_{12}$ è il cateto verticale, cioè $R\\sin2\\gamma$; la semisomma è la posizione del centro, non una distanza da esso.` },
              val: (v) => (v.s1 - v.s2) / 2 * Math.cos(2 * v.a) + v.t * Math.sin(2 * v.a),
            },
            {
              tex: '=\\sigma_m-\\sigma_C',
              why: `Confrontando con la formula di $\\sigma_m$ ricavata all'inizio, è esattamente $\\sigma_m$ meno la semisomma $\\sigma_C=\\frac{\\sigma_1+\\sigma_2}2$, cioè meno l'ascissa del centro. Quindi l'ascissa di $Q_m$ è la tensione normale giusta. Lo stesso conto con il seno, $R\\sin(2\\gamma-2\\alpha)=R\\sin2\\gamma\\cos2\\alpha-R\\cos2\\gamma\\sin2\\alpha$, dà $\\tau_{m\\nu}$.`,
              val: (v) => mohr({ s1: v.s1, s2: v.s2, t12: v.t }).at(v.a).sigma - (v.s1 + v.s2) / 2,
              eq: 'Prop 3.15.1',
            },
          ],
          checks: [{ what: 'R sin(2γ − 2α) = τ_mν', f: (v) => { const M = mohr({ s1: v.s1, s2: v.s2, t12: v.t }); const g2 = Math.atan2(v.t, (v.s1 - v.s2) / 2); return [M.R * Math.sin(g2 - 2 * v.a), M.at(v.a).tau]; } }],
        },
      },
      {
        id: 'l38-5b',
        kind: 'spiega',
        title: 'Facce ortogonali: punti diametralmente opposti',
        md: `Abbiamo dimostrato che la costruzione è corretta. Una sua prima conseguenza riguarda la faccia **ortogonale**, quella di normale $\\hat\\nu$ (§3.15.4).

Per trovarla si traccia per $P$ la parallela all'asse $\\hat m$ (la traccia del piano di giacitura $\\hat\\nu$), e si ottiene un punto $Q'_m$ **diametralmente opposto** a $Q_m$. Il motivo è l'angolo doppio: ruotare la giacitura di 90° nello spazio vuol dire ruotare di 180° sul cerchio. Le coordinate di $Q'_m$ sono $(\\sigma_\\nu,-\\tau_{\\nu m})$.

Quel segno meno sembra contraddire la reciprocità delle tangenziali, ma non è così. Per la faccia $\\hat m':=\\hat\\nu$ la direzione ottenuta ruotando di 90° in senso antiorario è $\\hat\\nu'=-\\hat m$, e per il lemma di Cauchy il segno si inverte. Ricorda la regola: **facce ortogonali, punti diametralmente opposti**.

Un controllo che ne discende (deduzione): le ascisse di due punti opposti hanno per media il centro, quindi $\\sigma_m+\\sigma_\\nu=\\sigma_1+\\sigma_2$, che è la traccia del tensore ristretta al piano. Lo useremo nell'esempio numerico.`,
      },
      {
        id: 'l38-6',
        kind: 'prova',
        title: 'Usa il cerchio',
        md: `Muovi il cursore di $\\alpha$: la retta verde, traccia del piano per il polo, ruota attorno a $P$ e il punto $Q_m$ percorre il cerchio.`,
        tasks: [`Porta $\\alpha=0$: la retta diventa verticale e $Q_m$ coincide con $Q_0(\\sigma_1,\\tau_{12})$, la faccia $\\hat e_1$.`, `Il cerchietto vuoto è la faccia ortogonale: qualunque $\\alpha$ tu scelga, sta sempre dalla parte opposta del diametro.`, `Fai variare $\\alpha$ di 90°: $Q_m$ fa mezzo giro del cerchio. Gli angoli sul cerchio sono doppi.`, `Accendi le principali: compaiono $S_1$ e $S_2$ sull'asse $\\sigma$, e le rette $PS_1$, $PS_2$. Accendi le tangenziali estreme: compaiono i punti più alto e più basso. Li spieghiamo nel prossimo passo.`],
        visual: MOHR({ preset: 'generico', alpha: 0, principali: false }),
      },
      {
        id: 'l38-7',
        kind: 'spiega',
        title: 'Le tensioni principali sul cerchio',
        md: `Sul cerchio si leggono subito le **tensioni principali** del fascio (§3.15.5). Sono i piani senza tangenziale, quindi i punti del cerchio con $\\tau=0$: le due intersezioni $S_1$ e $S_2$ con l'asse $\\sigma$. Le loro ascisse sono il centro più e meno il raggio:
$$s_{1,2}=\\sigma_C\\pm R=\\frac{\\sigma_1+\\sigma_2}2\\pm\\sqrt{\\Big(\\frac{\\sigma_1-\\sigma_2}2\\Big)^2+\\tau_{12}^2}.$$
Negli appunti questi punti erano chiamati «$A,B=C\\pm R$»: sono $S_1$ e $S_2$, da non confondere con $A$ e $B$ della costruzione.

Anche le **direzioni** si leggono dal polo. La retta $PS_1$ è l'asse $\\eta$, traccia del piano su cui agisce $s_1$; la retta $PS_2$ è l'asse $\\xi$. Ruotando $\\xi$ in senso antiorario si va su $\\eta$. La loro inclinazione $\\gamma$ rispetto agli assi coordinati è data da
$$\\tan2\\gamma=\\frac{2\\tau_{12}}{\\sigma_1-\\sigma_2},$$
che viene dal triangolo $CAQ_0$: è il rapporto tra $R\\sin2\\gamma=\\tau_{12}$ e $R\\cos2\\gamma=\\frac{\\sigma_1-\\sigma_2}2$.`,
        visual: MOHR({ preset: 'generico', alpha: 20, principali: true }),
      },
      {
        id: 'l38-7b',
        kind: 'spiega',
        title: 'Le tangenziali estreme sul cerchio',
        md: `Le **tangenziali estreme** del fascio sono i punti del cerchio con $|\\tau|$ più grande: il più alto e il più basso, sulla verticale per il centro $C$ (§3.15.6). Le loro ordinate sono $\\pm R$, quindi
$$\\tau_{\\max}=R.$$
Uniti al polo, danno le tracce di due piani, che la dispensa chiama $\\alpha$ (tangenziale minima) e $\\beta$ (massima); ruotando $\\alpha$ in senso antiorario si va su $\\beta$. Su entrambi la tensione normale è l'ascissa del centro, $\\sigma_C$, che **non è nulla** in generale: è lo stesso fatto della lezione precedente, il piano di $\\tau_{\\max}$ non è scarico.

Dove stanno questi piani? Sul cerchio, tra $S_1$ e il punto più alto c'è un quarto di giro, cioè 90° al centro; per la regola degli angoli doppi nello spazio sono **45°**. I piani di tangenziale massima sono inclinati di 45° rispetto ai piani principali, come la Prop 3.13.2 prevedeva con le bisettrici.

Un'avvertenza importante: $R=\\frac{s_1-s_2}2$ è la tangenziale massima **nel fascio di asse $\\hat e_3$**. In uno stato triassiale la massima assoluta, su tutti i piani, è $\\frac{s_{\\max}-s_{\\min}}2$ con tutte e tre le principali, compresa $\\sigma_3$.`,
        visual: MOHR({ preset: 'generico', alpha: 20, principali: true, tmax: true }),
      },
      {
        id: 'l38-7q',
        kind: 'domanda',
        q: { id: 'l38-q3', kind: 'scelta', q: `Di quanto sono inclinati, nello spazio, i piani di tangenziale massima rispetto ai piani principali?`, options: [`45°`, `90°`, `30°`, `Dipende dallo stato di tensione`], correct: 0, why: `Sul cerchio $S_1$ e il punto più alto distano 90° al centro; gli angoli sul cerchio sono doppi, quindi nello spazio sono 45° (§3.15.6). 90° è l'angolo sul cerchio scambiato per quello reale. Il risultato non dipende dallo stato.` },
      },
      {
        id: 'l38-7c',
        kind: 'spiega',
        title: 'Attenzione a non confondere',
        md: `Quattro errori tipici con il cerchio di Mohr.

1. **L'asse $\\tau$ verso l'alto.** Nella convenzione della dispensa punta **verso il basso**. Il polo $P(\\sigma_1,-\\tau_{12})$ quindi si disegna **sopra** l'asse $\\sigma$ se $\\tau_{12}>0$.
2. **La semisomma nel raggio.** Il raggio contiene la semidifferenza $\\frac{\\sigma_1-\\sigma_2}2$; la semisomma è la posizione del centro. Gli appunti avevano proprio questo refuso.
3. **$\\tau_{\\max}=R$ preso come massimo assoluto.** Vale nel fascio di asse $\\hat e_3$. In uno stato triassiale la massima assoluta è $(s_{\\max}-s_{\\min})/2$ con tutte e tre le principali: lo vedremo con l'arbelo.
4. **Angoli sul cerchio letti come angoli nello spazio.** Sul cerchio sono doppi: 180° sul cerchio sono facce ortogonali, 90° sul cerchio sono 45° nello spazio.`,
      },
      {
        id: 'l38-8',
        kind: 'riassunto',
        md: `**Il filo della lezione.** Per i piani di un fascio che ha per asse una direzione principale, il vettore tensione resta nel piano perpendicolare all'asse, e ogni piano è descritto dalla coppia normale–tangenziale. Scrivendole con l'angolo doppio e sommandone i quadrati, l'angolo sparisce e resta un cerchio con centro nella semisomma e raggio dato da semidifferenza e tangenziale. Con l'asse $\\tau$ verso il basso, il cerchio si costruisce dal polo $P(\\sigma_1,-\\tau_{12})$, e la retta per il polo parallela alla traccia di un piano incontra il cerchio nel punto di quel piano; la dimostrazione usa l'angolo alla circonferenza, che spiega gli angoli doppi. Facce ortogonali sono punti opposti; le tensioni principali sono le intersezioni con l'asse $\\sigma$, le tangenziali estreme valgono $R$ su piani a 45°.

- Stato sul piano inclinato di $\\alpha$: $\\sigma_m=\\dfrac{\\sigma_1+\\sigma_2}2+\\dfrac{\\sigma_1-\\sigma_2}2\\cos2\\alpha+\\tau_{12}\\sin2\\alpha$, $\\ \\tau_{m\\nu}=-\\dfrac{\\sigma_1-\\sigma_2}2\\sin2\\alpha+\\tau_{12}\\cos2\\alpha$ (§3.15.2).
- Cerchio: $\\Big(\\sigma_m-\\dfrac{\\sigma_1+\\sigma_2}2\\Big)^2+\\tau_{m\\nu}^2=\\Big(\\dfrac{\\sigma_1-\\sigma_2}2\\Big)^2+\\tau_{12}^2$ (§3.15.2).
- Costruzione: $\\sigma_m=\\sigma_C+R\\cos\\Theta$, $\\tau_{m\\nu}=R\\sin\\Theta$, $\\Theta=2\\gamma-2\\alpha$ (Prop 3.15.1).
- $s_{1,2}=\\sigma_C\\pm R$, $\\ \\tan2\\gamma=\\dfrac{2\\tau_{12}}{\\sigma_1-\\sigma_2}$, $\\ \\tau_{\\max}=R$ (§3.15.5–3.15.6).`,
        orale: ['Cerchio di Mohr: derivazione, costruzione, polo, dimostrazione, facce ortogonali, tensioni principali, $\\tau_{\\max}$. (dispensa, domanda 12)'],
      },
    ],
  },
  // ================================================================== c3.9
  {
    concept: 'c3.9',
    title: 'Mohr al lavoro: esempi e arbelo',
    minutes: 28,
    source: D(3, '3.16–3.17', 'Teo 3.17.1', '60–63'),
    visual: MOHR({ preset: 'trazione', alpha: 45, tmax: true }),
    steps: [
      {
        id: 'l39-0',
        kind: 'spiega',
        title: 'Dove siamo e dove andiamo',
        md: `Nella lezione precedente abbiamo costruito il cerchio di Mohr: per i piani di un fascio con asse principale, i punti (tensione normale, tangenziale) stanno su un cerchio, che si disegna a partire dal polo e su cui si leggono tensioni principali e tangenziali estreme.

Ora mettiamo il cerchio al lavoro. Prima su due stati semplici e importanti, lo **scorrimento semplice** e la **trazione semplice**: la seconda spiega un fenomeno che si osserva sui provini, le **linee di Lüders**, e prepara i criteri di resistenza del capitolo 6. Poi affrontiamo il caso triassiale, in cui un cerchio solo non basta: con tre cerchi si ottiene l'**arbelo di Mohr**, che contiene tutti i piani. Chiudiamo con l'esempio numerico della dispensa, che mostra proprio la differenza tra la tangenziale massima nel fascio e quella assoluta.`,
      },
      {
        id: 'l39-1',
        kind: 'spiega',
        title: 'Scorrimento semplice: il cerchio centrato nell\'origine',
        md: `Lo **scorrimento semplice** è lo stato con una sola tangenziale non nulla, $\\tau_{12}=\\tau>0$ (§3.16.1). Classifichiamolo con la lezione sulle tensioni principali: la giacitura $\\hat e_3$ è principale e **scarica**, perché la terza colonna è nulla; gli invarianti valgono $III=0$ e $II=-\\tau^2\\neq0$, quindi lo stato è **biassiale**.

Costruiamo il cerchio. Con $\\sigma_1=\\sigma_2=0$ i punti $A$, $B$ e il centro $C$ coincidono con l'origine; il polo è $P=(0,-\\tau)$, e il raggio vale $R=\\sqrt{0+\\tau^2}=\\tau$. È un cerchio **centrato nell'origine**, di raggio $\\tau$.

Sul disegno si leggono direttamente due risultati:
- le tensioni principali sono $s_1=\\tau$ (di trazione) e $s_2=-\\tau$ (di compressione), su piani orientati lungo le **bisettrici** degli assi, cioè a 45° dai piani coordinati;
- la tangenziale massima vale $\\tau$ e agisce proprio sui **piani coordinati**, dove infatti c'è solo tangenziale.

Ritrovi così il controllo che avevamo fatto con la forma quadratica: sul piano a 45° la tensione normale vale $\\tau$.`,
        visual: MOHR({ preset: 'scorrimento', alpha: 30, principali: true }),
      },
      {
        id: 'l39-1b',
        kind: 'spiega',
        title: 'Un piano a 30° nello scorrimento semplice',
        md: `La dispensa propone un piccolo esercizio: il piano con $\\alpha=30°$ nello stesso stato (§3.16.1). Con le formule della lezione precedente, che qui hanno solo i termini con $\\tau_{12}$:
$$\\sigma_m=\\tau\\sin60°=\\frac{\\sqrt3}2\\tau,\\qquad\\tau_{m\\nu}=\\tau\\cos60°=\\frac\\tau2.$$
Nota che compare $60°=2\\alpha$, l'angolo doppio.

Lo stesso risultato si verifica senza Mohr. Con $\\hat m=(\\cos30°,\\sin30°,0)=(\\frac{\\sqrt3}2,\\frac12,0)$, il vettore tensione è $\\vet t_m=\\tens T\\hat m=(\\tau/2,\\ \\sqrt3\\tau/2,\\ 0)$: la prima componente è $\\tau\\,m_2$, la seconda $\\tau\\,m_1$. Proiettandolo su $\\hat m$ si ottiene $\\frac{\\sqrt3}4\\tau+\\frac{\\sqrt3}4\\tau=\\frac{\\sqrt3}2\\tau$, e proiettandolo su $\\hat\\nu=(-\\frac12,\\frac{\\sqrt3}2,0)$ si ottiene $-\\frac\\tau4+\\frac34\\tau=\\frac\\tau2$ (passaggio aggiunto). Le due strade coincidono.`,
      },
      {
        id: 'l39-2',
        kind: 'spiega',
        title: 'Trazione semplice: il cerchio passa per l\'origine',
        md: `La **trazione semplice** è lo stato $\\operatorname{diag}(\\sigma,0,0)$, con $\\sigma=F/A$: la forza applicata al provino divisa per l'area della sezione (§3.16.2). È **monoassiale**, con $s_1=\\sigma$ e $s_2=s_3=0$.

Costruiamo il cerchio nel fascio di asse $\\hat e_3$. Il punto $A=(\\sigma,0)$ coincide con il polo $P$, perché $\\tau_{12}=0$; il punto $B$ è l'origine; il centro è $C=(\\sigma/2,0)$ e il raggio $R=\\sigma/2$. Il cerchio **passa per l'origine**.

Leggiamo la tangenziale massima: vale $R=\\sigma/2$ e agisce su due piani **ortogonali tra loro**, inclinati di $\\pm45°$ rispetto alla direzione della trazione. Su entrambi la tensione normale è l'ascissa del centro, $\\sigma/2$, e le tangenziali hanno modulo $\\sigma/2$ e **segno opposto**, come devono avere due facce ortogonali, che sul cerchio sono punti opposti.

Sono i tagli obliqui del provino di cui parlavamo con la classificazione: lo stato è monoassiale, ma a 45° la tangenziale è la più grande possibile.`,
        visual: MOHR({ preset: 'trazione', alpha: 45, principali: false, tmax: true }),
      },
      {
        id: 'l39-3',
        kind: 'domanda',
        q: { id: 'l39-q1', kind: 'scelta', q: `Nella trazione semplice di intensità $\\sigma$, il cerchio di Mohr…`, options: [`passa per l'origine e ha raggio $\\sigma/2$`, `è centrato nell'origine e ha raggio $\\sigma$`, `ha raggio $\\sigma$`, `degenera in un punto`], correct: 0, why: `$A\\equiv P=(\\sigma,0)$ e $B=(0,0)$, quindi il centro è $\\sigma/2$ e il raggio $\\sigma/2$ (§3.16.2). Centrato nell'origine è il cerchio dello scorrimento semplice. Degenera in un punto solo lo stato idrostatico del piano.` },
      },
      {
        id: 'l39-2b',
        kind: 'spiega',
        title: 'Le linee di Lüders e i criteri di resistenza',
        md: `Il risultato della trazione semplice ha una conseguenza che la dispensa segnala **per l'orale** (§3.16.2). I piani a $\\pm45°$ sono i **più sollecitati a scorrimento**: se il materiale cede per scorrimento, cede lungo quei piani.

E lo si vede davvero. Se si ricopre un provino di acciaio con una **vernice fragile** e lo si tira, quando il materiale comincia a snervare sulla vernice compare una doppia famiglia di linee inclinate a 45° rispetto all'asse: sono le **linee di Lüders**. Il cerchio di Mohr ne dà la spiegazione: sono le tracce dei piani di tangenziale massima.

L'osservazione suggerisce un'idea che tornerà nel capitolo 6: lo **snervamento** di materiali come l'acciaio è governato dalla **tangenziale massima**, più che dalla normale massima. Su questa idea sono costruiti i criteri di resistenza di **Tresca** e di **von Mises**.`,
      },
      {
        id: 'l39-2q',
        kind: 'domanda',
        q: { id: 'l39-q2', kind: 'scelta', q: `Perché sul provino in trazione le linee di Lüders sono inclinate di circa 45° rispetto all'asse?`, options: [`Perché a 45° agisce la tangenziale massima $\\sigma/2$, e lo snervamento è governato dalla tangenziale`, `Perché a 45° la tensione normale è massima`, `Perché a 45° il piano è scarico`, `Perché la vernice si deforma sempre a 45°`], correct: 0, why: `Dal cerchio della trazione semplice, i piani di $\\tau_{\\max}=\\sigma/2$ stanno a $\\pm45°$ (§3.16.2). La normale massima, $\\sigma$, agisce sulla sezione retta; sui piani a 45° la normale è $\\sigma/2$, quindi non sono scarichi. La vernice serve solo a rendere visibili le linee.` },
      },
      {
        id: 'l39-4a',
        kind: 'spiega',
        title: 'Lo stato triassiale: tre cerchi',
        md: `Finora un cerchio solo è bastato, perché lavoravamo con un fascio di piani attorno a una direzione principale. Ma in uno stato **triassiale** la maggior parte dei piani non appartiene a nessun fascio di questo tipo. Che cosa succede a loro?

L'idea della dispensa (§3.17.1) è mettersi nel riferimento principale, $\\operatorname{diag}(s_1,s_2,s_3)$ con $s_1\\ge s_2\\ge s_3$, e osservare che le direzioni principali sono **tre**: ogni direzione principale è l'asse di un fascio, e ogni fascio ha il suo cerchio. Si ottengono così tre cerchi, tutti con il centro sull'asse $\\sigma$:

- il fascio di asse $\\hat n_3$ dà il cerchio con diametro tra $s_1$ e $s_2$;
- il fascio di asse $\\hat n_2$ dà il cerchio tra $s_1$ e $s_3$, il **più grande**;
- il fascio di asse $\\hat n_1$ dà il cerchio tra $s_2$ e $s_3$.

I due cerchi piccoli stanno dentro quello grande e si toccano in $s_2$. La figura che formano si chiama **arbelo di Mohr**.`,
      },
      {
        id: 'l39-4b',
        kind: 'spiega',
        title: 'Il teorema dell\'arbelo',
        md: `I piani che non stanno in nessuno dei tre fasci dove finiscono? La risposta è il **teorema dell'arbelo di Mohr** (Teo 3.17.1): per qualunque giacitura, il punto $(\\sigma_m,\\tau_m)$ cade nella **regione compresa tra il cerchio massimo e i due cerchi minori**, oppure sui loro bordi. La dispensa lo enuncia senza dimostrazione (nota NF-11).

Il teorema permette di **rileggere graficamente** i risultati della lezione sulle tensioni estreme:
- la regione è compresa tra le ascisse $s_3$ e $s_1$, quindi $s_3\\le\\sigma_m\\le s_1$ (Prop 3.13.1);
- il punto più alto della regione è la cima del cerchio massimo, di raggio $\\frac{s_1-s_3}2$, quindi $\\tau_{\\max}=\\frac{s_1-s_3}2$ (Prop 3.13.2); e quel punto ha ascissa $\\frac{s_1+s_3}2$, la normale sul piano di $\\tau_{\\max}$.

Ecco perché, nella lezione precedente, $R$ era la tangenziale massima solo **nel fascio**: il cerchio del fascio di asse $\\hat e_3$ può essere uno dei cerchi piccoli dell'arbelo.`,
        visual: { kind: 'svg', id: 'arbelo', params: { caso: 'generico' } },
      },
      {
        id: 'l39-4',
        kind: 'prova',
        title: 'L\'arbelo, giacitura per giacitura',
        md: `Il diagramma mostra i tre cerchi costruiti sulle tensioni principali e i punti $(\\sigma_m,\\tau_m)$ di 300 giaciture prese a caso, calcolati dal motore. Qui $\\tau_m$ è il modulo della tangenziale, quindi si vede solo la metà superiore.`,
        tasks: [`Nel caso triassiale guarda dove cadono i punti: riempiono la regione grigia tra il cerchio massimo e i due minori, e nessuno cade dentro un cerchio piccolo (Teo 3.17.1).`, `Nessun punto supera l'altezza $\\tau_{\\max}=(s_1-s_3)/2$, il raggio del cerchio massimo.`, `Scegli l'esempio §3.17.2: con una tensione principale nulla il cerchio massimo è quello tra $s_1$ e 0, più grande del cerchio del fascio di asse $\\hat e_3$.`],
        visual: { kind: 'svg', id: 'arbelo', params: { caso: 'generico' } },
      },
      {
        id: 'l39-4q',
        kind: 'domanda',
        q: { id: 'l39-q3', kind: 'vf', q: `In uno stato triassiale, il punto $(\\sigma_m,\\tau_m)$ di una giacitura qualunque può cadere all'interno di uno dei due cerchi minori dell'arbelo.`, answer: false, why: `Per il Teo 3.17.1 cade nella regione tra il cerchio massimo e i due minori, o sui bordi: mai all'interno dei cerchi piccoli, né fuori da quello grande.` },
      },
      {
        id: 'l39-5',
        kind: 'numeri',
        title: 'Esempio numerico §3.17.2',
        md: `L'esempio della dispensa: $\\sigma_1=98$, $\\sigma_2=14$, $\\tau_{12}=21$ MPa, con il piano di normale $\\hat e_3$ scarico. Seguiamo la costruzione.

- **Cerchio.** $A(98,0)$, $B(14,0)$, centro $C=(${fd(M3172.C)};0)$, polo $P(98,-21)$, raggio $R=\\sqrt{42^2+21^2}=${fd(M3172.R)}$ MPa.
- **Principali del fascio.** $s_1=${fd(M3172.sMax)}$ e $s_2=${fd(M3172.sMin)}$ MPa: **entrambe di trazione**, un caso in cui la principale «di compressione» del nome non lo è affatto.
- **Direzione principale.** $\\tan2\\gamma=42/84=0{,}5$, da cui $\\gamma=${fd((M3172.gamma * 180) / Math.PI)}°$. Gli appunti riportavano 31,72°, che è $45°-13{,}28°$. Siccome $\\tan2\\gamma$ ha due soluzioni, $\\gamma$ e $\\gamma+90°$, per $s_1$ si sceglie quella con $\\sigma_m$ maggiore.
- **Piano a $\\alpha=30°$.** $\\sigma_m=${fd(Q30.sigma)}$ e $\\tau_{m\\nu}=${fd(Q30.tau)}$ MPa; la faccia ortogonale ha $\\sigma_\\nu=${fd(Q120.sigma)}$ MPa. Controllo: $\\sigma_m+\\sigma_\\nu=${fd(Q30.sigma + Q120.sigma)}=\\sigma_1+\\sigma_2$, come deve essere per due punti opposti.`,
        values: { R: M3172.R, s1: M3172.sMax, s2: M3172.sMin, sigma30: Q30.sigma, tau30: Q30.tau },
        visual: MOHR({ preset: 'esempio', alpha: 30, principali: true }),
      },
      {
        id: 'l39-5b',
        kind: 'numeri',
        title: 'Nell\'esempio, quale tangenziale è la massima?',
        md: `Nel fascio di asse $\\hat e_3$ la tangenziale massima è il raggio, $\\tau_{\\max}=R=${fd(M3172.R)}$ MPa, sui piani con tensione normale $\\sigma_C=${fd(M3172.C)}$ MPa.

Ma il punto ha **tre** tensioni principali: oltre a $s_1$ e $s_2$ c'è quella del piano scarico, che vale 0. Ordinandole, la più grande è $${fd(M3172.sMax)}$ e la più piccola è $0$. Per l'arbelo il cerchio massimo è quello tra queste due, e la tangenziale massima **assoluta** è
$$\\frac{s_{\\max}-s_{\\min}}2=\\frac{${fd(M3172.sMax)}-0}2=${fd(M3172.sMax / 2)}\\ \\text{MPa},$$
più grande di $R$. Agisce sui piani del fascio di asse $\\hat n_2$ (la direzione principale con tensione ${fd(M3172.sMin)} MPa), a 45° tra la direzione di $s_1$ e $\\hat e_3$.

È proprio l'avvertenza della dispensa: **$\\tau_{\\max}=R$ vale nel fascio; su tutte le giaciture conta l'arbelo**.`,
        values: { R: M3172.R, tauAss: M3172.sMax / 2 },
        visual: { kind: 'svg', id: 'arbelo', params: { caso: 'esempio' } },
      },
      {
        id: 'l39-5q',
        kind: 'domanda',
        q: { id: 'l39-q4', kind: 'vf', q: `Nell'esempio di §3.17.2 la tangenziale massima su tutte le giaciture è $R=46{,}96$ MPa.`, answer: false, why: `$R$ è la massima nel fascio di asse $\\hat e_3$. Con la terza principale nulla, il cerchio massimo dell'arbelo va da 0 a $s_1=102{,}96$ MPa, e la massima assoluta è $102{,}96/2=51{,}48$ MPa (Attenzione di p. 63).` },
      },
      {
        id: 'l39-5a',
        kind: 'spiega',
        title: 'Attenzione a non confondere',
        md: `Tre errori tipici su questi esempi.

1. **Prendere il raggio del cerchio del fascio come tangenziale massima assoluta.** Lo è solo se il cerchio del fascio è quello massimo dell'arbelo. Nell'esempio §3.17.2 non lo è: la terza principale, nulla, allarga il cerchio massimo.
2. **Scegliere la soluzione sbagliata di $\\tan2\\gamma$.** L'equazione dà due angoli, $\\gamma$ e $\\gamma+90°$, che corrispondono alle due direzioni principali. Per quella di $s_1$ si sceglie l'angolo che dà la $\\sigma_m$ maggiore.
3. **Credere che, nella trazione semplice, i piani di $\\tau_{\\max}$ abbiano solo tangenziale.** Su di essi agisce anche la normale $\\sigma/2$, l'ascissa del centro.`,
      },
      {
        id: 'l39-6',
        kind: 'riassunto',
        md: `**Il filo della lezione.** Nello scorrimento semplice il cerchio è centrato nell'origine: le principali sono $\\pm\\tau$ sulle bisettrici e la tangenziale massima sta sui piani coordinati. Nella trazione semplice il cerchio passa per l'origine: la tangenziale massima vale $\\sigma/2$ su piani a 45°, dove compaiono le linee di Lüders, e da qui nasce l'idea dei criteri di Tresca e von Mises. In uno stato triassiale ogni direzione principale dà un fascio e un cerchio: i tre cerchi formano l'arbelo, e per il Teo 3.17.1 ogni giacitura cade tra il cerchio massimo e i due minori. Per questo il raggio del cerchio di un fascio può essere più piccolo della tangenziale massima assoluta, come nell'esempio numerico.

- Trazione semplice: $s_1=\\sigma$, $\\ R=\\tau_{\\max}=\\tfrac\\sigma2$ a $\\pm45°$ (§3.16.2).
- Scorrimento semplice: $s_{1,2}=\\pm\\tau$, $\\ \\tau_{\\max}=\\tau$ (§3.16.1).
- Arbelo: $(\\sigma_m,\\tau_m)$ tra il cerchio massimo e i due minori; $\\ \\tau_{\\max}=\\tfrac{s_1-s_3}2$ (Teo 3.17.1).`,
        orale: ['Trazione semplice e scorrimento semplice con Mohr; linee di Lüders e legame con i criteri di resistenza. (dispensa, domanda 13)', 'Arbelo di Mohr: costruzione dei tre cerchi e significato della regione ammissibile. (dispensa, domanda 14)'],
      },
    ],
  },
];
