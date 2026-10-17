/**
 * Lezioni guidate del Modulo 2 (Cap. 2). Derivazioni solo dove la dispensa le sviluppa (ANALISI §4); ogni riga con
 * `val` è verificata su 25 campioni casuali (tests/lezioni.test.ts). I numeri dei passi «numeri» vengono dal motore.
 */
import { D } from '../../engine/types';
import * as T from '../../engine/tensor';
import { H_PRESETS, finiteD, finiteMeasures, linearMeasures, principal } from '../../engine/deformazione';
import { eigSym } from '../../engine/spettro';
import type { DeformScene, Lesson, LessonVisual } from '../types';

type R = Record<string, number>;
const mat = (v: R, p: string): T.Mat => Array.from({ length: 9 }, (_, k) => v[`${p}${k}`]);
const vec = (v: R, p: string): T.Vec => [v[`${p}0`], v[`${p}1`], v[`${p}2`]];
const putMat = (o: R, p: string, A: T.Mat) => A.forEach((a, k) => (o[`${p}${k}`] = a));
const putVec = (o: R, p: string, a: T.Vec) => a.forEach((x, k) => (o[`${p}${k}`] = x));
const idx = (r: () => number) => Math.min(2, Math.floor(3 * r()));
const DEF = (scene: DeformScene): LessonVisual => ({ kind: 'deforma3d', scene });
const f = (x: number, d = 3) => T.fmt(x, d);

/** F vicino all'identità (det F > 0) e coppia di fibre ortogonali */
const sampleF = (r: () => number, o: R = {}) => {
  putMat(o, 'F', T.add(T.I3, T.scale(T.randMat(r), 0.2)));
  const n = T.unit(T.randVec(r));
  const m = T.unit(T.cross(n, T.randVec(r)));
  putVec(o, 'n', n);
  putVec(o, 'm', m);
  o.dL = 0.1 + r();
  return o;
};
/** mappa quadratica f_i = c_i + X_i + Σ_k a_ik X_k + q_i X_i² e suo gradiente analitico */
const fMap = (v: R, X: T.Vec): T.Vec => [0, 1, 2].map((i) => v[`c${i}`] + X[i] + [0, 1, 2].reduce((s, k) => s + v[`a${3 * i + k}`] * X[k], 0) + v[`q${i}`] * X[i] * X[i]) as T.Vec;
const Fmap = (v: R, X: T.Vec): T.Mat => Array.from({ length: 9 }, (_, n) => (n % 4 === 0 ? 1 : 0) + v[`a${n}`] + (n % 4 === 0 ? 2 * v[`q${Math.floor(n / 3)}`] * X[Math.floor(n / 3)] : 0));

// ------------------------------------------------------------------ numeri d'esempio (dal motore)
const HT = H_PRESETS.taglio.H;
const LIN_T = linearMeasures(HT, [1, 0, 0], [0, 1, 0]);
const FIN_T = finiteMeasures(T.add(T.I3, HT), [1, 0, 0], [0, 1, 0]);
const HG = H_PRESETS.generico.H;
const PG = principal(T.sym(HG));
const PP = principal(H_PRESETS.piana.H);

export const M2_LEZIONI: Lesson[] = [
  // ================================================================== c2.1
  {
    concept: 'c2.1',
    title: 'Configurazioni, deformazione, spostamento',
    minutes: 14,
    source: D(2, '2.1', 'Def 2.1.1–2.1.2', '15–16'),
    visual: DEF({ mode: 'rappresentazione', preset: 'generico' }),
    steps: [
      {
        id: 'l21-1',
        kind: 'spiega',
        title: 'Dove siamo e dove andiamo',
        md: `Nel primo modulo abbiamo costruito gli attrezzi: vettori, tensori, gradienti. Da qui comincia la meccanica vera e propria, e la domanda che guida tutto il capitolo 2 è semplice da dire: **quando un corpo cambia forma, come si descrive quel cambiamento con precisione?**

In questa lezione non facciamo ancora conti. Mettiamo in fila le parole che useremo per tutto il corso (corpo materiale, configurazione, deformazione, spostamento) e per ciascuna capiamo perché serve. Le tappe sono tre: prima sostituiamo l'oggetto reale con un oggetto matematico; poi decidiamo che cosa vogliamo descrivere e da quale punto di vista; infine diamo un nome preciso al cambiamento.

Alla fine dovresti saper raccontare, senza formule davanti, che differenza c'è tra «deformazione» e «spostamento»: è la prima domanda d'orale del capitolo.`,
      },
      {
        id: 'l21-2',
        kind: 'spiega',
        title: 'Dall\'oggetto reale al corpo materiale',
        md: `Pensa alla scocca di un'automobile, l'esempio che usa la dispensa. È un oggetto fisico, fatto di lamiere, saldature, vernice. Per studiarlo con la matematica ci serve un suo sostituto geometrico: la regione di spazio che la scocca occupa. Questa regione si chiama **corpo materiale** e si indica con $\\mathcal B$ (§2.1.1).

Non va bene una regione qualunque. La Def 2.1.1 chiede due cose:
- che $\\mathcal B$ sia **limitata**, cioè contenuta in una porzione finita di spazio, come ogni oggetto reale;
- che sia **regolare**: il suo bordo, che si scrive $\\partial\\mathcal B$, deve essere fatto di superfici almeno $C^1$, cioè superfici lisce, con il piano tangente che cambia senza salti.

I punti di $\\mathcal B$ si chiamano **punti materiali**. La differenza rispetto ai punti della geometria è che hanno una massa: sono pezzetti di materia, non solo posizioni.`,
      },
      {
        id: 'l21-3',
        kind: 'spiega',
        title: 'Perché possiamo dimenticare la massa',
        md: `Abbiamo appena detto che i punti materiali hanno massa. Eppure nel corso la massa non entra quasi mai nei conti. Come mai?

Ragioniamo sull'esempio dell'auto. Se dei passeggeri saltano dentro di colpo, la scocca sobbalza: ci sono accelerazioni, e dove c'è un'accelerazione la massa produce forze d'inerzia. Se invece i passeggeri salgono **molto lentamente**, la scocca si adatta piano piano, le accelerazioni sono quasi nulle e quindi anche le forze d'inerzia sono trascurabili.

Lo studio **statico**, quello del corso, è proprio il caso limite di un fenomeno così lento che le accelerazioni tendono a zero (§2.1.1). In quel limite il tempo non conta più, e con lui sparisce il ruolo della massa. Ecco perché possiamo «fare astrazione dal tempo», come dice la dispensa.`,
      },
      {
        id: 'l21-4',
        kind: 'domanda',
        q: { id: 'l21-q0', kind: 'scelta', q: 'Perché nello studio statico le forze d\'inerzia sono trascurabili?', options: ['Perché il fenomeno è pensato così lento che le accelerazioni tendono a zero', 'Perché i punti materiali non hanno massa', 'Perché il corpo materiale è una regione limitata', 'Perché le forze d\'inerzia si annullano sempre nei solidi'], correct: 0, why: 'La massa c\'è (i punti materiali la hanno), ma la forza d\'inerzia è massa per accelerazione: se l\'accelerazione tende a zero, la forza d\'inerzia diventa trascurabile (§2.1.1). La limitatezza di $\\mathcal B$ non c\'entra.' },
      },
      {
        id: 'l21-5',
        kind: 'spiega',
        title: 'Che cosa vogliamo descrivere: solo la geometria',
        md: `Sistemato il corpo, chiediamoci che cosa vogliamo dire di lui. L'analisi della deformazione ha un compito preciso e volutamente limitato: descrivere **come** il corpo ha cambiato forma, non **perché**. Le cause, cioè le forze e il materiale, arriveranno nei capitoli 3 e 4. Qui facciamo solo geometria: lo studio è **puramente cinematico** (§2.1.2).

Per descrivere un cambiamento servono due «fotografie» del corpo, un prima e un dopo. La regione occupata dal corpo si chiama **configurazione**, e il nome ricorda che può cambiare.
- La **configurazione di riferimento** è il «prima», che scegliamo noi: è proprio $\\mathcal B$, e il suo punto generico si chiama $X$, con la maiuscola.
- La **configurazione attuale** è il «dopo»: si scrive $f(\\mathcal B)$, e il suo punto generico si chiama $x$, con la minuscola.

Tieni a mente questa convenzione, perché la useremo sempre: **maiuscole per il prima, minuscole per il dopo**.`,
      },
      {
        id: 'l21-6',
        kind: 'spiega',
        title: 'Due modi di guardare: lagrangiano ed euleriano',
        md: `Fissati il prima e il dopo, possiamo partire da una delle due fotografie.

Il punto di vista **lagrangiano** parte dal prima: prendi un punto $X$ del corpo e ti chiedi dove è andato a finire. È come mettere un'etichetta su un pezzetto di materia e seguirlo. È il punto di vista adottato nel corso.

Il punto di vista **euleriano** parte dal dopo: guardi un punto $x$ della configurazione attuale e ti chiedi da dove viene. Serve quando ciò che conta è la forma finale. L'esempio della dispensa è la vela: la spinta del vento dipende dalla forma che la vela ha adesso, gonfia, non da quella che aveva quando era ripiegata.

Le due descrizioni portano a risultati diversi solo quando spostamenti e deformazioni sono **grandi**. Noi lavoreremo con spostamenti e deformazioni piccoli, quindi scegliere il punto di vista lagrangiano non ci fa perdere nulla (§2.1.2).`,
      },
      {
        id: 'l21-7',
        kind: 'domanda',
        q: { id: 'l21-q2', kind: 'vf', q: 'Nel punto di vista lagrangiano si parte da un punto $x$ della configurazione attuale e si risale alla sua origine.', answer: false, why: 'Questo è il punto di vista euleriano. Il lagrangiano fa il contrario: parte dal punto $X$ della configurazione di riferimento e lo segue fino a $x$ (§2.1.2).' },
      },
      {
        id: 'l21-8',
        kind: 'spiega',
        title: 'La deformazione: la regola che sposta tutti i punti',
        md: `Ora possiamo dare un nome preciso al cambiamento. La **deformazione** è la funzione $f$ che a ogni punto del prima associa il suo punto nel dopo (Def 2.1.2):
$$f:\\mathcal B\\to\\mathcal E,\\qquad x=f(X).$$
Leggila così: $f$ prende un punto del corpo di riferimento e restituisce un punto dello spazio euclideo $\\mathcal E$, cioè la sua nuova posizione. Siccome entra un punto (tre coordinate) ed esce un punto (tre coordinate), $f$ è una funzione vettoriale di variabile vettoriale.

In componenti si scrive $x_i=f_i(X_1,X_2,X_3)$: ciascuna coordinata finale può dipendere da **tutte e tre** le coordinate iniziali. È questo che permette a $f$ di descrivere allungamenti, scorrimenti, rotazioni: non sposta i punti uno per uno a caso, ma con una regola unica per tutto il corpo.`,
      },
      {
        id: 'l21-9',
        kind: 'spiega',
        title: 'Lo spostamento: la freccia del singolo punto',
        md: `La deformazione dice **dove** si trova adesso ogni punto. Spesso però ci interessa un'altra cosa: **di quanto e in che direzione** si è mosso. Questa informazione è lo **spostamento** (Def 2.1.2), cioè il vettore che va dalla posizione iniziale a quella finale:
$$\\vet u(X)=x-X=f(X)-X.$$
In componenti, $u_i=f_i(X_1,X_2,X_3)-X_i$.

Deformazione e spostamento sono entrambi **campi vettoriali**: a ogni punto $X$ assegnano qualcosa. Ma rispondono a domande diverse. Un esempio lo rende chiaro (esempio aggiunto): se il corpo resta perfettamente fermo, ogni punto rimane dov'era, quindi $f(X)=X$. La deformazione allora è la funzione identità, **non** zero; lo spostamento invece è nullo, $\\vet u=\\vet 0$.

Nel modello a destra vedi due punti, $X$ e $Y$, e le frecce dei loro spostamenti: ogni punto ha la sua freccia, ed è questo che fa di $\\vet u$ un campo.`,
      },
      {
        id: 'l21-10',
        kind: 'domanda',
        q: { id: 'l21-q1', kind: 'scelta', q: 'Il corpo non si muove affatto. Quanto valgono la deformazione $f$ e lo spostamento $\\vet u$?', options: ['$f$ è l\'identità, $f(X)=X$; $\\vet u$ è nullo', '$f$ e $\\vet u$ sono entrambi nulli', '$f$ è nulla, $\\vet u$ è l\'identità', '$f$ e $\\vet u$ sono entrambi l\'identità'], correct: 0, why: 'La deformazione restituisce la posizione finale, che coincide con quella iniziale: $f(X)=X$. Una $f$ nulla manderebbe tutti i punti nell\'origine. Lo spostamento è la differenza $f(X)-X=\\vet 0$ (Def 2.1.2).' },
      },
      {
        id: 'l21-11',
        kind: 'spiega',
        title: 'Attenzione a non confondere',
        md: `Tre errori ricorrono spesso all'orale su questo argomento.

1. **Confondere deformazione e spostamento.** $f$ è la mappa che trasforma tutto il corpo e restituisce posizioni; $\\vet u$ è la freccia che porta il singolo punto da $X$ a $x$. Sono entrambi campi vettoriali, ma l'esempio del corpo fermo mostra che non coincidono.
2. **Dire che l'analisi della deformazione studia le cause.** No: è puramente cinematica, descrive il cambiamento di forma qualunque sia la sua origine.
3. **Credere che lagrangiano ed euleriano diano risultati diversi anche per piccoli spostamenti.** Le differenze si apprezzano solo per grandi spostamenti e deformazioni.`,
      },
      {
        id: 'l21-12',
        kind: 'riassunto',
        md: `**Il filo della lezione.** Per studiare un oggetto reale lo sostituiamo con un corpo materiale $\\mathcal B$, una regione limitata e regolare i cui punti hanno massa; la massa però non conta, perché lavoriamo nel limite statico di un fenomeno lentissimo. Vogliamo descrivere solo la geometria del cambiamento di forma, confrontando una configurazione di riferimento (punti $X$) con una attuale (punti $x$), e seguendo i punti dal prima al dopo, alla maniera lagrangiana. La deformazione $f$ è la regola che dà la nuova posizione di ogni punto; lo spostamento $\\vet u$ è la freccia che va dalla vecchia alla nuova posizione.

- Deformazione: $x=f(X)$ (Def 2.1.2).
- Spostamento: $\\vet u(X)=f(X)-X$, in componenti $u_i=f_i-X_i$ (Def 2.1.2).`,
        orale: ['Definire corpo materiale, configurazioni, deformazione e spostamento; punto di vista lagrangiano ed euleriano. (dispensa, domanda 1)'],
      },
    ],
  },
  // ================================================================== c2.2
  {
    concept: 'c2.2',
    title: 'Deformazioni plausibili, gradienti F e H, moti rigidi',
    minutes: 24,
    source: D(2, '2.2–2.3', 'Def 2.2.1–2.2.4, Teo 2.3.2, Teo 2.3.4', '17–19'),
    visual: DEF({ mode: 'intorno', presets: ['allungamento', 'taglio', 'rotazione', 'generico'], controls: ['preset', 'amp'] }),
    steps: [
      {
        id: 'l22-1',
        kind: 'spiega',
        title: 'Dove siamo e dove andiamo',
        md: `Nella lezione precedente abbiamo dato un nome al cambiamento di forma: la **deformazione** $f$, che porta ogni punto $X$ della configurazione di riferimento nel punto $x=f(X)$ della configurazione attuale, e lo **spostamento** $\\vet u=f(X)-X$.

Ora ci chiediamo due cose. La prima: **qualunque funzione $f$ va bene per descrivere un corpo reale?** Vedremo di no, e fisseremo tre requisiti. La seconda: **come si descrive il modo in cui $f$ cambia da un punto all'altro?** Per questo useremo il gradiente, lo strumento del Modulo 1 che dice quanto rapidamente varia un campo.

Le tappe sono quattro: i requisiti di plausibilità fisica; i due gradienti, quello di deformazione $\\tens F$ e quello di spostamento $\\tens H$, e il legame tra loro (l'identità cinematica fondamentale); alcuni tipi speciali di deformazione; infine le deformazioni rigide, quelle che spostano il corpo senza cambiarne la forma.`,
      },
      {
        id: 'l22-2',
        kind: 'spiega',
        title: 'Perché non basta una funzione qualunque',
        md: `Matematicamente $f$ potrebbe essere una funzione qualsiasi da $\\mathcal B$ allo spazio. Ammettere funzioni molto generali permetterebbe di descrivere fenomeni molto generali, ma con grandi difficoltà, e soprattutto includerebbe comportamenti che un corpo reale non ha. La dispensa sceglie allora delle restrizioni, i **requisiti di plausibilità fisica** (§2.2), scelti in base ai fenomeni che si vogliono descrivere.

Sono tre, e ciascuno esclude qualcosa che nella realtà non accade (o che non vogliamo descrivere):
- la **biettività**, che riguarda il fatto che i punti non si sovrappongano né si sdoppino;
- la **bicontinuità e regolarità**, che riguarda il fatto che punti vicini restino vicini;
- la **conservazione dell'orientazione**, che riguarda il fatto che il volume non si annulli e il corpo non si «rovesci».

Li vediamo uno per volta, chiedendoci ogni volta che cosa andrebbe storto senza di essi.`,
      },
      {
        id: 'l22-3',
        kind: 'spiega',
        title: 'Primo requisito: ogni punto ha un solo posto, ogni posto un solo punto',
        md: `La **biettività** (Def 2.2.1) chiede due cose. Ogni punto $X$ ha una e una sola immagine $x=f(X)$; e ogni punto $x$ della configurazione attuale proviene da un solo punto $X$.

Che cosa succederebbe senza? Se due punti distinti $X_1\\ne X_2$ finissero nello stesso posto, $f(X_1)=f(X_2)$, avremmo due pezzetti di materia nello stesso punto dello spazio: è la **compenetrazione** della materia, o l'**autocontatto** quando due parti del corpo vengono a toccarsi. In termini matematici, si viola l'iniettività di $f$.

L'altro fenomeno escluso è la **frattura**: un punto che si «sdoppia» e genera due punti distinti $x'$ e $x''$, come succede ai due lembi di una crepa. Negli appunti questo è collegato alla suriettività. La dispensa osserva però che, a rigore, la frattura è già esclusa dal fatto stesso che $f$ è una funzione (un punto ha una sola immagine) e dalla continuità, che vediamo nel prossimo passo.`,
      },
      {
        id: 'l22-4',
        kind: 'spiega',
        title: 'Secondo requisito: punti vicini restano vicini',
        md: `Il secondo requisito, **bicontinuità e regolarità** (Def 2.2.2), chiede che sia $f$ sia la sua inversa $f^{-1}$ siano continue, e che $f$ abbia derivata prima continua.

La continuità esprime il **principio di continuità**: punti vicini prima della deformazione restano vicini dopo. Chiederla anche per $f^{-1}$ vuol dire che vale anche al contrario: punti vicini nella configurazione attuale venivano da punti vicini.

La derivata prima continua aggiunge qualcosa di più fine. Una **fibra**, cioè una linea di materia tracciata nel corpo, dopo la deformazione diventa una curva **regolare**, senza spigoli: la tangente non fa salti. In altre parole si escludono i gradienti discontinui.

Esistono materiali in cui i gradienti discontinui sono possibili: la dispensa cita i **compositi fibrorinforzati**, dove fibre e matrice hanno rigidezze diverse; ne nascono concentrazioni di tensione e delaminazione. È un comportamento «patologico» che richiede teorie più complesse di quella del corso.`,
      },
      {
        id: 'l22-5',
        kind: 'domanda',
        q: { id: 'l22-q2', kind: 'scelta', q: `Due punti distinti del corpo finiscono nello stesso punto dello spazio. Quale requisito è violato?`, options: [`La biettività: è la compenetrazione (o l'autocontatto), $f$ non è iniettiva`, `La regolarità: la derivata di $f$ è discontinua`, `La conservazione dell'orientazione: $\\det\\tens F<0$`, `Nessuno: è ammesso se il corpo è vincolato`], correct: 0, why: `Due punti con la stessa immagine violano l'iniettività, una delle due metà della biettività (Def 2.2.1). La regolarità riguarda le tangenti delle fibre, non la sovrapposizione dei punti; l'orientazione riguarda il segno di $\\det\\tens F$, che vedremo tra poco.` },
      },
      {
        id: 'l22-6',
        kind: 'spiega',
        title: 'Il gradiente di deformazione F',
        md: `Per il terzo requisito ci serve uno strumento nuovo. Nel Modulo 1 il gradiente di un campo vettoriale è il tensore che dice come varia il campo quando ci si sposta di poco. Applichiamolo alla deformazione: il **gradiente di deformazione** è
$$\\tens F(X):=\\nabla f(X),\\qquad F_{ij}=\\frac{\\partial f_i}{\\partial X_j}\\qquad\\text{(Def 2.2.3)}.$$

Leggi la componente così: $F_{ij}$ dice quanto cambia la coordinata $i$ della posizione finale quando sposti di poco il punto di partenza lungo la direzione $j$. Per esempio $F_{12}$ misura quanto il punto si muove lungo l'asse 1 se lo prendi un po' più in là lungo l'asse 2.

Un caso di controllo, che riprende la lezione precedente: se il corpo resta fermo, $f(X)=X$, ogni coordinata finale coincide con quella iniziale, quindi $F_{ij}$ vale 1 se $i=j$ e 0 altrimenti. Cioè $\\tens F=\\tens I$, il tensore identità (passaggio aggiunto). Tieni a mente questo fatto: «niente deformazione» corrisponde a $\\tens F=\\tens I$, non a $\\tens F$ nullo.`,
      },
      {
        id: 'l22-7',
        kind: 'spiega',
        title: 'Terzo requisito: il determinante di F resta positivo',
        md: `Il terzo requisito è la **conservazione dell'orientazione** (Def 2.2.4): $\\det\\tens F(X)>0$ in ogni punto del corpo.

Per capirlo ricordiamo dal Modulo 1 (Def 1.4.1) che il determinante di un tensore è il rapporto tra il prodotto misto dei tre vettori della base trasformati e quello dei vettori originali:
$$\\det\\tens F=\\frac{\\tens F\\hat e_1\\wedge\\tens F\\hat e_2\\cdot\\tens F\\hat e_3}{\\hat e_1\\wedge\\hat e_2\\cdot\\hat e_3}.$$
Il prodotto misto è il volume, con segno, del parallelepipedo costruito sui tre vettori. Se $\\det\\tens F>0$, la terna trasformata è ancora **destrorsa**, anche se in generale non è più ortogonale.

Più avanti (§2.5.5) dimostreremo che $\\det\\tens F=dv/dV$, il rapporto tra il volume di un pezzetto dopo e prima. Con questa lettura si vede che cosa si esclude: $\\det\\tens F=0$ vuol dire un volume finito che diventa nullo, l'**implosione**; $\\det\\tens F\\to+\\infty$ vuol dire un volume nullo che diventa finito, l'**esplosione**.`,
      },
      {
        id: 'l22-8',
        kind: 'spiega',
        title: 'Perché basta chiedere «positivo»',
        md: `Potresti chiederti perché il requisito sia $\\det\\tens F>0$ e non semplicemente $\\det\\tens F\\ne0$. La risposta sta nel punto di partenza.

Nella configurazione di riferimento il corpo non è ancora deformato, quindi $\\tens F=\\tens I$ e $\\det\\tens F=1$. Mentre il corpo evolve, $\\det\\tens F$ cambia con continuità. La figura di p. 18 mostra proprio questo andamento: una curva che parte da 1 e resta sempre nella regione positiva. Per diventare negativo, $\\det\\tens F$ dovrebbe attraversare lo zero, e passare per lo zero vorrebbe dire implodere. Quindi chiedere $\\det\\tens F>0$ significa: **partendo da 1, il determinante non attraversa mai lo zero**.

C'è una conseguenza che useremo alla fine della lezione: un determinante negativo corrisponde a una terna trasformata sinistrorsa, cioè a un corpo «rovesciato come in uno specchio». Anche questo è escluso, e tra poco vedremo che riguarda le riflessioni.`,
      },
      {
        id: 'l22-9',
        kind: 'domanda',
        q: { id: 'l22-q3', kind: 'scelta', q: `In un punto del corpo si trova $\\det\\tens F=0$. Che cosa sta succedendo lì?`, options: [`Un volume finito si annulla: è l'implosione, esclusa dal terzo requisito`, `Il corpo è fermo: non c'è deformazione`, `Si è formata una frattura`, `Il volume diventa infinito: è l'esplosione`], correct: 0, why: `Poiché $\\det\\tens F=dv/dV$, $\\det\\tens F=0$ vuol dire $dv=0$: un volume finito che si annulla (Def 2.2.4). Il corpo fermo ha $\\tens F=\\tens I$ e quindi $\\det\\tens F=1$, non 0. L'esplosione è il caso opposto, $\\det\\tens F\\to+\\infty$.` },
      },
      {
        id: 'l22-10',
        kind: 'spiega',
        title: 'Il gradiente di spostamento H',
        md: `Abbiamo il gradiente della deformazione. Possiamo fare la stessa operazione sullo spostamento: il **gradiente di spostamento** è
$$\\tens H(X):=\\nabla\\vet u(X),\\qquad H_{ij}=\\frac{\\partial u_i}{\\partial X_j}\\qquad\\text{(Def 2.3.1)}.$$

Mentre $\\tens F$ dice come varia la **posizione** finale da punto a punto, $\\tens H$ dice come varia lo **spostamento**. Sono due informazioni molto vicine, perché lo spostamento è la posizione finale meno quella iniziale, $\\vet u=f(X)-X$. Ci aspettiamo quindi che $\\tens F$ e $\\tens H$ differiscano per qualcosa che viene dal termine $-X$.

Il prossimo passo ricava questo legame. Vedremo che è semplicissimo da scrivere, ma è uno dei più usati del corso: ogni volta che diremo «deformazioni piccole» parleremo di $\\tens H$ piccolo, e il legame ci dirà subito che cosa succede a $\\tens F$.`,
      },
      {
        id: 'l22-11',
        kind: 'derivazione',
        title: 'Identità cinematica fondamentale',
        md: `**Dove vogliamo arrivare:** una relazione tra $\\tens F$ e $\\tens H$. **L'idea:** scriviamo una componente di $\\tens H$ usando $u_i=f_i-X_i$, deriviamo i due pezzi separatamente e riconosciamo che cosa sono. Per controllare ogni riga l'app usa una mappa $f$ non lineare scelta a caso.`,
        source: D(2, '2.3', 'Teo 2.3.2', '18–19'),
        der: {
          sample: (r) => {
            const o: R = { i: idx(r), j: idx(r) };
            for (let k = 0; k < 9; k++) o[`a${k}`] = 0.4 * r() - 0.2;
            for (let k = 0; k < 3; k++) {
              o[`c${k}`] = 2 * r() - 1;
              o[`q${k}`] = 0.4 * r() - 0.2;
            }
            putVec(o, 'X', T.randVec(r));
            return o;
          },
          lines: [
            {
              tex: 'H_{ij}=\\dfrac{\\partial u_i}{\\partial X_j}',
              why: `Partiamo dalla definizione della componente $(i,j)$ del gradiente di spostamento (Def 2.3.1). Il valore accanto è calcolato derivando davvero la funzione $u_i=f_i-X_i$ della mappa di prova.`,
              val: (v) => {
                const X = vec(v, 'X');
                const h = 1e-5;
                const Xp = [...X] as T.Vec;
                const Xm = [...X] as T.Vec;
                Xp[v.j] += h;
                Xm[v.j] -= h;
                // u è quadratico: la differenza centrata è esatta a meno dell'arrotondamento; si arrotonda al gradiente analitico
                const fd = (fMap(v, Xp)[v.i] - Xp[v.i] - (fMap(v, Xm)[v.i] - Xm[v.i])) / (2 * h);
                const an = T.at(Fmap(v, X), v.i, v.j) - (v.i === v.j ? 1 : 0);
                return Math.abs(fd - an) < 1e-6 ? an : NaN;
              },
            },
            {
              tex: '=\\dfrac{\\partial f_i}{\\partial X_j}-\\dfrac{\\partial X_i}{\\partial X_j}',
              why: `Abbiamo sostituito $u_i=f_i-X_i$ e usato la regola che la derivata di una differenza è la differenza delle derivate. Ora i due pezzi si possono guardare separatamente.`,
              val: (v) => T.at(Fmap(v, vec(v, 'X')), v.i, v.j) - (v.i === v.j ? 1 : 0),
            },
            {
              tex: '=F_{ij}-\\dfrac{\\partial X_i}{\\partial X_j}',
              why: `Il primo pezzo è proprio la componente $F_{ij}$ del gradiente di deformazione (Def 2.2.3). Il secondo lo lasciamo per il momento com'è.`,
              aggiunto: true,
              val: (v) => T.at(Fmap(v, vec(v, 'X')), v.i, v.j) - (v.i === v.j ? 1 : 0),
            },
            {
              tex: '=F_{ij}-\\delta_{ij}',
              why: `Il secondo pezzo è il gradiente della mappa $X\\mapsto X$, che lascia ogni punto dov'è: vale 1 se $i=j$ e 0 se $i\\ne j$, cioè è il simbolo $\\delta_{ij}$, le componenti dell'identità $\\tens I$.`,
              ask: { q: `Quanto vale $\\partial X_i/\\partial X_j$?`, options: [`$\\delta_{ij}$`, `$1$ sempre`, `$0$ sempre`, `$X_j$`], correct: 0, why: `Se $i=j$ si deriva una coordinata rispetto a sé stessa e si ottiene 1; se $i\\ne j$ le coordinate sono indipendenti e la derivata è 0. «Sempre 1» dimentica il caso $i\\ne j$; «sempre 0» dimentica il caso $i=j$; $X_j$ confonde la derivata con la funzione.` },
              val: (v) => T.at(Fmap(v, vec(v, 'X')), v.i, v.j) - (v.i === v.j ? 1 : 0),
            },
            {
              tex: '\\tens H=\\tens F-\\tens I',
              why: `La relazione vale per ogni coppia di indici $(i,j)$, quindi vale tra i tensori interi: $\\tens H$ è $\\tens F$ meno l'identità.`,
              aggiunto: true,
            },
            { tex: '\\Rightarrow\\ \\tens F=\\tens I+\\tens H', why: `Portiamo $\\tens I$ dall'altra parte: è l'identità cinematica fondamentale, nella forma in cui la scrive la dispensa.`, eq: 'Teo 2.3.2' },
          ],
        },
      },
      {
        id: 'l22-12',
        kind: 'spiega',
        title: 'Che cosa dice l\'identità cinematica',
        md: `Il risultato $\\tens F=\\tens I+\\tens H$ (Teo 2.3.2) si legge così: il gradiente di deformazione è fatto di una parte che «non fa niente», l'identità, più una parte che contiene tutto il cambiamento, il gradiente di spostamento.

Controlliamolo su due casi. Se il corpo è fermo, lo spostamento è nullo ovunque, quindi $\\tens H=\\tens O$ (il tensore nullo) e l'identità dà $\\tens F=\\tens I$: è quello che avevamo trovato direttamente. Se il corpo trasla, cioè ogni punto si sposta dello stesso vettore, lo spostamento è costante, la sua derivata è nulla, e di nuovo $\\tens H=\\tens O$ e $\\tens F=\\tens I$.

Questa lettura serve subito: quando nella teoria infinitesima diremo che le deformazioni sono piccole, chiederemo che $\\tens H$ sia piccolo, e l'identità ci dirà che $\\tens F$ è vicino a $\\tens I$, cioè all'assenza di deformazione.`,
      },
      {
        id: 'l22-13',
        kind: 'prova',
        title: 'Guarda F al lavoro sul cubetto',
        md: `Nel modello il cubetto tratteggiato è un piccolo intorno del punto $X$ prima della deformazione; il cubetto azzurro è lo stesso intorno dopo, trasformato da $\\tens F=\\tens I+k\\tens H$, dove $k$ è l'amplificazione che rende visibili spostamenti piccoli.`,
        tasks: [
          `Scegli «allungamento lungo x»: il cubetto si allunga solo lungo x. Qui $\\tens H$ ha una sola componente non nulla, $H_{11}$.`,
          `Scegli «rotazione rigida infinitesima»: il cubetto ruota senza cambiare forma. Se aumenti molto l'amplificazione noti una leggera deformazione: è un effetto del disegno amplificato, non del moto, che è rigido solo finché è piccolo.`,
          `Scegli «taglio semplice»: le facce verticali si inclinano e l'angolo retto tra x e y si chiude. Nota che nessuno dei tre casi ribalta il cubetto: $\\det\\tens F$ resta positivo.`,
        ],
        visual: DEF({ mode: 'intorno', presets: ['allungamento', 'rotazione', 'taglio', 'generico'], controls: ['preset', 'amp'], preset: 'allungamento' }),
      },
      {
        id: 'l22-14',
        kind: 'spiega',
        title: 'Tre tipi speciali di deformazione',
        md: `Con $\\tens F$ e $\\vet u$ in mano possiamo dare un nome ad alcune deformazioni particolari (§2.3.1).
- **Omogenee**: $\\tens F$ è costante, uguale in tutti i punti del corpo. Ogni pezzetto si deforma nello stesso modo.
- **Traslazioni**: lo spostamento $\\vet u$ è costante. Tutti i punti si muovono dello stesso vettore e, come abbiamo visto, $\\tens H=\\tens O$.
- **Rotazioni**: $\\tens F=\\tens R$, un tensore di rotazione fisso. Nel Modulo 1 $\\mathrm{Rot}$ è l'insieme dei tensori ortogonali con determinante $+1$, quelli che ruotano i vettori senza cambiarne la lunghezza. La deformazione si scrive $f(X)=X_0+\\tens R(X-X_0)$: il punto $X_0$ resta fermo e ogni altro punto ruota attorno a lui.

Per le rotazioni piccole si usa la formula di Eulero del Modulo 1. Se l'angolo $\\varphi$ è molto piccolo, $\\varphi\\ll1$, si ha $\\tens R\\simeq\\tens I+\\varphi\\tens W$, dove $\\tens W$ è il tensore antisimmetrico che ha per vettore assiale il versore $\\hat e$ dell'asse. Applicato a un vettore: $\\tens R\\vet v\\simeq\\vet v+\\varphi\\,\\hat e\\wedge\\vet v$. Ritroveremo questa forma nella teoria infinitesima.`,
      },
      {
        id: 'l22-15',
        kind: 'domanda',
        q: { id: 'l22-q1', kind: 'vf', q: `Una traslazione ha $\\tens H=\\tens O$ e quindi $\\tens F=\\tens I$.`, answer: true, why: `In una traslazione $\\vet u$ è lo stesso in tutti i punti, quindi la sua derivata, il gradiente $\\tens H$, è nulla. Per l'identità cinematica $\\tens F=\\tens I+\\tens O=\\tens I$. Attenzione: $\\tens F=\\tens I$ non vuol dire che il corpo sia fermo, ma che non cambia forma.` },
      },
      {
        id: 'l22-16',
        kind: 'spiega',
        title: 'Le deformazioni rigide: muoversi senza cambiare forma',
        md: `Traslazioni e rotazioni hanno una cosa in comune: il corpo si muove, ma la sua forma resta la stessa. La dispensa dà un nome a questa proprietà. Una deformazione è **rigida** se conserva la distanza tra due punti qualunque (Def 2.3.3):
$$|f(X)-f(Y)|=|X-Y|\\qquad\\forall X,Y.$$

Il Teo 2.3.4, che la dispensa enuncia senza dimostrazione, dice com'è fatta ogni deformazione rigida: $f$ è rigida **se e solo se** esiste un tensore ortogonale $\\tens Q$ tale che
$$f(X)=f(X_0)+\\tens Q(X-X_0),\\qquad\\tens Q\\in\\mathrm{Orth}.$$
Ricorda che un tensore ortogonale conserva le lunghezze dei vettori: per questo la distanza non cambia.

Aggiungendo e togliendo $X_0$ la formula si legge come una **rototraslazione**: $f(X)=\\big[f(X_0)-X_0\\big]+\\big[X_0+\\tens Q(X-X_0)\\big]$. Il primo pezzo è la traslazione del punto $X_0$; il secondo è una rotazione (o una riflessione) attorno a $X_0$.`,
      },
      {
        id: 'l22-17',
        kind: 'spiega',
        title: 'Le riflessioni: rigide ma escluse',
        md: `Il teorema include tutti i $\\tens Q$ ortogonali, e tra questi ci sono tre famiglie. Con $\\tens Q=\\tens I$ si ottiene una **traslazione**. Con $\\tens Q$ ortogonale e $\\det\\tens Q=+1$ si ottiene una **rotazione**. Con $\\det\\tens Q=-1$ si ottiene una **riflessione**, come l'immagine in uno specchio.

Le riflessioni conservano le distanze, quindi sono rigide a pieno titolo. Però in una deformazione rigida il gradiente è proprio $\\tens F=\\tens Q$ (passaggio aggiunto), e con $\\det\\tens Q=-1$ il determinante di $\\tens F$ è negativo. Il terzo requisito di plausibilità le esclude (§2.3.2): un corpo reale non può trasformarsi nella sua immagine speculare con un movimento continuo.

Qui si chiude il cerchio con il passo sul determinante: $\\det\\tens F>0$ non esclude soltanto l'implosione, esclude anche l'inversione dell'orientazione.`,
      },
      {
        id: 'l22-18',
        kind: 'domanda',
        q: { id: 'l22-q4', kind: 'scelta', q: `Quale di queste affermazioni sulle deformazioni rigide è corretta?`, options: [`Sono rototraslazioni con $\\tens Q$ ortogonale; le riflessioni sono rigide ma escluse da $\\det\\tens F>0$`, `Sono sempre rotazioni`, `Sono tutte fisicamente ammissibili, riflessioni comprese`, `Hanno $\\tens F=\\tens O$`], correct: 0, why: `Teo 2.3.4: rigida vuol dire $f(X)=f(X_0)+\\tens Q(X-X_0)$ con $\\tens Q$ ortogonale, che comprende traslazioni ($\\tens Q=\\tens I$), rotazioni e riflessioni. Le riflessioni hanno $\\det\\tens Q=-1$ e violano il terzo requisito. $\\tens F=\\tens O$ manderebbe ogni fibra in un punto: è l'opposto di un moto rigido.` },
      },
      {
        id: 'l22-19',
        kind: 'spiega',
        title: 'Attenzione a…',
        md: `Tre errori ricorrono spesso all'orale su questo argomento.

1. **Dire che $\\det\\tens F>0$ esclude solo l'implosione.** È tentante perché la lettura $\\det\\tens F=dv/dV$ fa pensare subito ai volumi. Ma il segno conta: un determinante negativo vuol dire terna trasformata sinistrorsa, cioè una riflessione. Il requisito esclude anche l'inversione dell'orientazione.
2. **Confondere $\\tens F$ con $\\tens H$.** Differiscono per l'identità: $\\tens F=\\tens I+\\tens H$. In assenza di deformazione $\\tens F=\\tens I$ mentre $\\tens H=\\tens O$. Chi dice «non c'è deformazione, quindi $\\tens F$ è nullo» sta pensando a $\\tens H$.
3. **Credere che una deformazione rigida sia sempre una rotazione.** Il Teo 2.3.4 comprende anche le traslazioni ($\\tens Q=\\tens I$) e, matematicamente, le riflessioni, che sono rigide ma escluse dal terzo requisito.`,
      },
      {
        id: 'l22-20',
        kind: 'riassunto',
        md: `**Il filo della lezione.** Non ogni funzione $f$ descrive un corpo reale: chiediamo che sia biettiva, per escludere compenetrazione, autocontatto e frattura; bicontinua e regolare, perché punti vicini restino vicini e le fibre non facciano spigoli; e che conservi l'orientazione, $\\det\\tens F>0$, per escludere implosione, esplosione e riflessioni. Il gradiente di deformazione $\\tens F$ e quello di spostamento $\\tens H$ differiscono per l'identità, perché lo spostamento è la posizione meno il punto di partenza. Le deformazioni rigide, che conservano le distanze, sono rototraslazioni con un tensore ortogonale.

- Gradiente di deformazione: $\\tens F=\\nabla f$, $F_{ij}=\\partial f_i/\\partial X_j$ (Def 2.2.3).
- Conservazione dell'orientazione: $\\det\\tens F(X)>0$ per ogni $X$ (Def 2.2.4).
- Identità cinematica fondamentale: $\\tens F=\\tens I+\\tens H$, con $\\tens H=\\nabla\\vet u$ (Teo 2.3.2).
- Deformazione rigida: $f(X)=f(X_0)+\\tens Q(X-X_0)$, $\\tens Q\\in\\mathrm{Orth}$ (Teo 2.3.4).`,
        orale: ['Requisiti di plausibilità fisica: quali fenomeni escludono e perché; significato di $\\det\\tens F>0$. (dispensa, domanda 2)', 'Identità cinematica fondamentale; deformazioni omogenee, traslazioni, rotazioni, deformazioni rigide. (dispensa, domanda 3)'],
      },
    ],
  },
  // ================================================================== c2.3
  {
    concept: 'c2.3',
    title: 'Lo studio locale: dx = F dX',
    minutes: 16,
    source: D(2, '2.4', 'eq. (2.1)', 20),
    visual: DEF({ mode: 'intorno', presets: ['taglio', 'generico'], controls: ['preset', 'amp', 'alpha'], alpha: 30 }),
    steps: [
      {
        id: 'l23-1',
        kind: 'spiega',
        title: 'Dove siamo e dove andiamo',
        md: `Nella lezione precedente abbiamo introdotto il gradiente di deformazione $\\tens F=\\nabla f$ e abbiamo visto che cosa chiediamo a una deformazione plausibile. Resta un problema pratico: la funzione $f$ in generale **non è lineare**, e studiare funzioni non lineari in tre dimensioni è difficile.

L'idea di questa lezione è guardare il corpo **da vicino**, in un piccolo intorno di un punto. Lì la deformazione, anche se complicata, si comporta in modo semplice: diventa un tensore che agisce su un vettore. In altre parole lo studio locale trasforma uno studio analitico, fatto di funzioni, in uno studio **algebrico**, fatto di prodotti tensore per vettore (§2.4).

Le tappe: prima il caso a una dimensione, dove l'idea è la retta tangente; poi il caso a tre dimensioni con lo sviluppo di Taylor; infine il significato del nome «deformazione omogenea tangente» e il ruolo della regolarità di $f$.`,
      },
      {
        id: 'l23-2',
        kind: 'spiega',
        title: 'In una dimensione: la retta tangente',
        md: `Parti da una funzione di una sola variabile, $x=f(X)$, disegnata come una curva. Vicino a un punto $X_0$, se fai un passo piccolo $dX$, la curva è quasi indistinguibile dalla sua **retta tangente**. Quindi la variazione della funzione si approssima con
$$dx\\simeq f'(X_0)\\,dX.$$
La derivata prima $f'(X_0)$ dice quanto rapidamente varia la funzione vicino a $X_0$: è la pendenza della tangente.

Un esempio con i numeri (esempio aggiunto): prendi $f(X)=X^2$ e $X_0=1$, quindi $f'(1)=2$. Con $dX=0{,}01$ la variazione vera è $1{,}01^2-1=0{,}0201$; la tangente dà $2\\cdot0{,}01=0{,}02$. L'errore, $0{,}0001$, è molto più piccolo del passo: è un infinitesimo di ordine superiore.

Nel caso vettoriale il ruolo della derivata lo prende il gradiente, cioè proprio $\\tens F$. Vediamo come.`,
      },
      {
        id: 'l23-3',
        kind: 'spiega',
        title: 'In tre dimensioni: la fibra e il suo intorno',
        md: `Prendiamo un punto $X$ del corpo e una **fibra** che passa per lui, cioè un piccolo segmento di materia in una direzione data dal versore $\\hat n$. Su questa fibra scegliamo un punto $Y$ vicino a $X$, nel suo intorno.

Diamo un nome a ogni oggetto, uno alla volta:
- $d\\vet X=Y-X$ è il vettore della fibra prima della deformazione;
- $dL=|Y-X|$ è la sua lunghezza iniziale.

Dopo la deformazione i due punti diventano $x=f(X)$ e $y=f(Y)$, e la fibra cambia:
- $d\\vet x=y-x$ è il vettore della fibra deformata;
- $dl$ è la sua lunghezza finale, e $\\hat\\nu$ è la sua nuova direzione.

La domanda è: **come si ottiene $d\\vet x$ da $d\\vet X$?** Nel caso a una dimensione la risposta era «moltiplica per la derivata». Ci aspettiamo che qui sia «applica il gradiente».`,
      },
      {
        id: 'l23-4',
        kind: 'domanda',
        q: { id: 'l23-q2', kind: 'scelta', q: `Nel passaggio dal caso scalare a quello vettoriale, quale oggetto prende il posto della derivata $f'(X_0)$?`, options: [`Il gradiente di deformazione $\\tens F(X)$`, `Lo spostamento $\\vet u(X)$`, `Il determinante $\\det\\tens F$`, `Il vettore $d\\vet X$`], correct: 0, why: `La derivata dice come varia la funzione vicino al punto; per una funzione vettoriale di variabile vettoriale questo ruolo è del gradiente, $\\tens F=\\nabla f$. Lo spostamento è un valore del campo, non una sua variazione; il determinante è un numero ricavato da $\\tens F$; $d\\vet X$ è il passo, non la «pendenza».` },
      },
      {
        id: 'l23-5',
        kind: 'derivazione',
        title: 'Da Taylor alla deformazione omogenea tangente',
        md: `**Dove vogliamo arrivare:** scrivere il vettore della fibra deformata $d\\vet x$ in funzione di quello iniziale $d\\vet X$. **L'idea:** sviluppiamo $f(Y)$ con Taylor attorno a $X$, arrestandoci al primo ordine, come la tangente del caso scalare. Guardiamo una componente $k$ alla volta. Per controllare le righe l'app usa una $f$ affine, per cui il resto trascurato è esattamente nullo.`,
        source: D(2, '2.4', 'eq. (2.1)', 20),
        der: {
          sample: (r) => {
            const o: R = { k: idx(r) };
            putMat(o, 'F', T.add(T.I3, T.scale(T.randMat(r), 0.2)));
            putVec(o, 'c', T.randVec(r));
            putVec(o, 'X', T.randVec(r));
            putVec(o, 'd', T.scalev(T.randVec(r), 0.05));
            return o;
          },
          lines: [
            {
              tex: 'dx_k=f_k(Y)-f_k(X)',
              why: `Partiamo dalla definizione: $d\\vet x=y-x$, e $y$ e $x$ sono le immagini $f(Y)$ e $f(X)$. Ne scriviamo la componente $k$.`,
              val: (v) => {
                const fa = (P: T.Vec) => T.addv(vec(v, 'c'), T.apply(mat(v, 'F'), P));
                const X = vec(v, 'X');
                return fa(T.addv(X, vec(v, 'd')))[v.k] - fa(X)[v.k];
              },
            },
            {
              tex: '=f_k(X)+\\big[\\tens F(X)(Y-X)\\big]_k+o(|Y-X|)-f_k(X)',
              why: `Al posto di $f_k(Y)$ mettiamo il suo sviluppo di Taylor con origine in $X$: $f(Y)=f(X)+\\tens F(X)(Y-X)+o(|Y-X|)$. Il gradiente $\\tens F(X)$ fa la parte che nel caso scalare faceva la derivata; $o(|Y-X|)$ indica termini che diventano piccoli più in fretta di $|Y-X|$.`,
              aggiunto: true,
              val: (v) => T.apply(mat(v, 'F'), vec(v, 'd'))[v.k],
            },
            {
              tex: '=\\big[\\tens F(X)(Y-X)\\big]_k+o(|Y-X|)',
              why: `Il termine $f_k(X)$ compare una volta con il più e una con il meno: si cancella. Resta il termine lineare più l'infinitesimo di ordine superiore.`,
              val: (v) => T.apply(mat(v, 'F'), vec(v, 'd'))[v.k],
            },
            {
              tex: '\\simeq\\big[\\tens F\\,d\\vet X\\big]_k',
              why: `Ora facciamo l'approssimazione, una volta per tutte: in un intorno abbastanza piccolo trascuriamo $o(|Y-X|)$, come nel caso scalare si trascurava la differenza tra curva e tangente. Scriviamo poi $d\\vet X$ al posto di $Y-X$. Il tensore $\\tens F$ è quello calcolato nel centro $X$.`,
              ask: { q: `Quale $\\tens F$ si usa per tutti i punti $Y$ dell'intorno?`, options: [`Quello calcolato nel centro $X$`, `Quello calcolato in ciascun $Y$`, `La sua media sull'intorno`, `L'identità`], correct: 0, why: `Lo sviluppo di Taylor ha origine in $X$, quindi il gradiente è $\\tens F(X)$, lo stesso per ogni $Y$ dell'intorno: è questo che rende la deformazione «omogenea». Usare $\\tens F(Y)$ vorrebbe dire sviluppare attorno a ogni $Y$; la media non compare da nessuna parte; l'identità darebbe un intorno che non si deforma.` },
              val: (v) => T.apply(mat(v, 'F'), vec(v, 'd'))[v.k],
              eq: 'eq. (2.1)',
            },
            {
              tex: 'd\\vet x=\\tens F\\,d\\vet X,\\qquad\\tens F=\\tens F(X)',
              why: `La relazione vale per ogni componente $k$, quindi vale tra i vettori: è l'equazione (2.1), con $\\tens F$ calcolato nel centro dell'intorno.`,
            },
          ],
        },
      },
      {
        id: 'l23-6',
        kind: 'spiega',
        title: 'Che cosa abbiamo ottenuto',
        md: `Il risultato $d\\vet x=\\tens F\\,d\\vet X$ (eq. 2.1) dice: per sapere dove va a finire una fibra piccola uscente da $X$, basta **applicare il tensore $\\tens F$ al vettore della fibra**. Non serve più conoscere la funzione $f$ in tutti i punti: basta il suo gradiente nel centro.

Due controlli. Se il corpo trasla soltanto, $\\tens F=\\tens I$ e quindi $d\\vet x=d\\vet X$: la fibra si sposta ma resta identica, come ci aspettiamo. In una dimensione $\\tens F$ si riduce al numero $f'(X_0)$ e ritroviamo $dx\\simeq f'(X_0)\\,dX$, la tangente da cui siamo partiti.

Questa è la base di tutto ciò che segue nel capitolo: la prossima lezione misurerà quanto si allunga una fibra, quanto si chiude un angolo, quanto cambia un volume, e lo farà sempre partendo da $d\\vet x=\\tens F\\,d\\vet X$.`,
      },
      {
        id: 'l23-7',
        kind: 'spiega',
        title: 'Perché «omogenea» e perché «tangente»',
        md: `La (2.1) descrive la **deformazione omogenea tangente**, e i due aggettivi hanno un significato preciso.

**Omogenea**, perché il tensore $\\tens F$, calcolato nel centro $X$, è lo stesso per tutti i punti dell'intorno. Nel passo sui tipi speciali della lezione precedente abbiamo chiamato omogenee le deformazioni con $\\tens F$ costante: qui $\\tens F$ è costante, ma solo nell'intorno, perché abbiamo deciso di usare quello del centro.

**Tangente**, per analogia con l'approssimazione della curva con la sua retta tangente: abbiamo tenuto solo il termine di primo ordine dello sviluppo.

Il riquadro «Per l'orale» di p. 20 riassume il punto chiave: limitandosi a un intorno, la deformazione di **tutti** i suoi punti si esprime attraverso la deformazione del centro, con un'operazione algebrica, cioè un tensore applicato a un vettore.`,
      },
      {
        id: 'l23-8',
        kind: 'domanda',
        q: { id: 'l23-q1', kind: 'scelta', q: `Perché la deformazione $d\\vet x=\\tens F\\,d\\vet X$ si dice «omogenea»?`, options: [`Perché lo stesso $\\tens F$, quello del centro, vale per tutti i punti dell'intorno`, `Perché il corpo è fatto di un materiale omogeneo`, `Perché $\\tens F$ è l'identità`, `Perché tutte le fibre si allungano della stessa quantità`], correct: 0, why: `«Omogenea» si riferisce al tensore: $\\tens F$ è calcolato nel centro e non cambia nell'intorno (§2.4). Il materiale non c'entra, perché lo studio è puramente geometrico; $\\tens F=\\tens I$ è solo un caso particolare; e fibre in direzioni diverse si allungano in modo diverso, come vedrai nel modello.` },
      },
      {
        id: 'l23-9',
        kind: 'spiega',
        title: 'Perché serve la regolarità di f',
        md: `C'è un'ipotesi nascosta in tutto il ragionamento: abbiamo dato per buono che il punto $y=f(Y)$ stia vicino a $x=f(X)$, cioè che la fibra deformata sia ancora piccola. Senza questa proprietà parlare di «intorno» dopo la deformazione non avrebbe senso.

Qui tornano i requisiti di plausibilità della lezione precedente. La dispensa sottolinea che serve la regolarità di $f$: **senza la bicontinuità non si potrebbe dire che $f(Y)$ stia nell'intorno di $f(X)$**. È il principio di continuità, «punti vicini restano vicini», che rende lecito lo studio locale.

Ricorda anche il prezzo dell'approssimazione: la (2.1) vale solo in un intorno sufficientemente piccolo, perché abbiamo trascurato $o(|Y-X|)$. Per una fibra lunga, che dopo la deformazione può diventare curva, bisogna mettere insieme tanti intorni piccoli, come faremo con le misure globali.`,
      },
      {
        id: 'l23-10',
        kind: 'prova',
        title: 'Ruota la fibra e guarda come cambia',
        md: `Le frecce rossa e verde sono le fibre $\\hat n$ e $\\hat m$ dopo essere state trasformate da $\\tens F$: è la (2.1) applicata a due direzioni. Sotto il modello trovi i parametri di misura, che studieremo nella prossima lezione.`,
        tasks: [
          `Con il taglio, ruota la fibra $\\hat n$ con il comando dell'angolo: per certi angoli la fibra si allunga, per altri si accorcia. Lo stesso $\\tens F$ tratta direzioni diverse in modo diverso.`,
          `Cerca l'angolo per cui la fibra non cambia lunghezza: il parametro $\\varepsilon_n$ passa per zero. Vuol dire che la fibra ruota senza allungarsi.`,
        ],
        visual: DEF({ mode: 'intorno', preset: 'taglio', presets: ['taglio', 'generico'], controls: ['preset', 'amp', 'alpha'], alpha: 30 }),
      },
      {
        id: 'l23-11',
        kind: 'spiega',
        title: 'Attenzione a…',
        md: `Due errori tipici su questo argomento.

1. **Pensare che $\\tens F$ vari da punto a punto dell'intorno.** È tentante perché $\\tens F(X)$ è un campo e in generale cambia da punto a punto del corpo. Ma nello studio locale abbiamo deciso di usare per tutto l'intorno il valore del centro: è proprio ciò che rende la deformazione «omogenea».
2. **Dimenticare che il risultato vale solo nell'intorno.** La (2.1) è un'approssimazione al primo ordine, ottenuta trascurando $o(|Y-X|)$. Vale in un intorno sufficientemente piccolo, non per fibre lunghe.`,
      },
      {
        id: 'l23-12',
        kind: 'riassunto',
        md: `**Il filo della lezione.** La deformazione $f$ in generale non è lineare, ma da vicino si comporta in modo semplice. Come nel caso scalare si sostituisce la curva con la sua tangente, nel caso vettoriale si sviluppa $f$ con Taylor attorno al punto $X$ e si trascura una volta per tutte l'infinitesimo di ordine superiore. Resta $d\\vet x=\\tens F\\,d\\vet X$: ogni fibra piccola si trasforma applicandole lo stesso tensore, quello del centro. Per questo la deformazione si dice omogenea e tangente, e lo studio diventa algebrico; tutto si regge sulla bicontinuità di $f$.

- Taylor: $f(Y)=f(X)+\\tens F(X)(Y-X)+o(|Y-X|)$ (§2.4).
- Deformazione omogenea tangente: $d\\vet x=\\tens F\\,d\\vet X$, con $\\tens F=\\tens F(X)$ (eq. 2.1).`,
        orale: ['Studio locale: dallo sviluppo di Taylor alla deformazione omogenea tangente. (dispensa, domanda 4)'],
      },
    ],
  },
  // ================================================================== c2.4
  {
    concept: 'c2.4',
    title: 'Quanto si deforma: i parametri di misura',
    minutes: 32,
    source: D(2, '2.5', 'Def 2.5.1–2.5.8, Prop 2.5.2–2.5.9', '20–23'),
    visual: DEF({ mode: 'intorno', presets: ['taglio', 'allungamento', 'isocora', 'generico'], controls: ['preset', 'amp', 'alpha'] }),
    steps: [
      {
        id: 'l24-1',
        kind: 'spiega',
        title: 'Dove siamo e dove andiamo',
        md: `Nella lezione precedente abbiamo trovato che, vicino a un punto, ogni fibra si trasforma con lo stesso tensore: $d\\vet x=\\tens F\\,d\\vet X$. Questo dice **come** si trasforma l'intorno, ma all'ingegnere non basta: vuole sapere **quanto** è cambiato. Una fibra si è allungata? Due fibre che erano ad angolo retto lo sono ancora? Un volume è cresciuto o diminuito?

I **parametri di misura** sono numeri che rispondono a queste domande, sempre in un punto, cioè nell'intorno di $X$ (§2.5). Ne vediamo quattro: la dilatazione lineare $\\varepsilon_n$ (allungamento di una fibra), lo scorrimento angolare $\\gamma_{n,m}$ (perdita di ortogonalità), la dilatazione superficiale $\\Delta S$ (variazione d'area) e la dilatazione volumica $\\Theta$ (variazione di volume).

Scopriremo che i primi tre si leggono tutti su un unico tensore, $\\tens F^T\\tens F$, da cui nasce il **tensore di deformazione finita** $\\tens D$; il quarto si legge sul determinante di $\\tens F$.`,
      },
      {
        id: 'l24-2',
        kind: 'spiega',
        title: 'Perché misurare variazioni specifiche',
        md: `Prima di definire i parametri, una scelta di fondo: misureremo sempre **variazioni specifiche**, cioè la variazione divisa per il valore iniziale, e non variazioni assolute.

L'esempio della dispensa lo motiva. Prendi due elastici identici, uno lungo 4 m e uno lungo 1 m, e appendi a ciascuno lo stesso peso. Quello lungo si allunga di più in metri, ma ogni suo pezzo da un metro si allunga quanto l'elastico corto. L'allungamento specifico, allungamento diviso lunghezza iniziale, è lo stesso.

Ai fini della **sollecitazione** del materiale conta proprio quello specifico: i due elastici sono «tirati» allo stesso modo. Per questo tutti i parametri che seguono sono rapporti del tipo (dopo meno prima) diviso prima.`,
      },
      {
        id: 'l24-3',
        kind: 'spiega',
        title: 'La dilatazione lineare: quanto si allunga una fibra',
        md: `Il primo parametro riguarda una fibra in direzione $\\hat n$. Una fibra infinitesima, dopo la deformazione, resta un segmento (una linea finita, invece, potrebbe diventare curva): ha senso quindi confrontare la sua lunghezza prima e dopo.

Con $dL$ lunghezza iniziale e $dl$ lunghezza finale, il **coefficiente di dilatazione lineare** è (Def 2.5.1)
$$\\varepsilon_n(X):=\\frac{dl-dL}{dL}=\\frac{dl}{dL}-1.$$
Per esempio, se una fibra lunga $dL=1$ mm diventa lunga $1{,}02$ mm, $\\varepsilon_n=0{,}02$: si è allungata del 2%. Se diventa lunga $0{,}99$ mm, $\\varepsilon_n=-0{,}01$: si è accorciata dell'1%.

La definizione usa le lunghezze, ma noi conosciamo il tensore $\\tens F$. Il prossimo passo esprime $\\varepsilon_n$ in funzione di $\\tens F$ e della direzione $\\hat n$.`,
      },
      {
        id: 'l24-4',
        kind: 'derivazione',
        title: 'La dilatazione lineare in funzione di F',
        md: `**Dove vogliamo arrivare:** $\\varepsilon_n$ scritto con $\\tens F$ e $\\hat n$. **L'idea:** il rapporto $dl/dL$ si ottiene più facilmente dai quadrati, perché il quadrato di una lunghezza è il prodotto scalare del vettore per sé stesso. Useremo $d\\vet x=\\tens F\\,d\\vet X$ e il fatto che la fibra iniziale è $d\\vet X=dL\\,\\hat n$.`,
        source: D(2, '2.5.1', 'Prop 2.5.2', 21),
        der: {
          sample: (r) => sampleF(r),
          lines: [
            { tex: 'dl^2=d\\vet x\\cdot d\\vet x', why: `Il quadrato della lunghezza della fibra deformata è il prodotto scalare del suo vettore per sé stesso.`, val: (v) => { const dx = T.apply(mat(v, 'F'), T.scalev(vec(v, 'n'), v.dL)); return T.dotv(dx, dx); } },
            {
              tex: '=\\tens F d\\vet X\\cdot\\tens F d\\vet X',
              why: `Sostituiamo $d\\vet x$ con $\\tens F\\,d\\vet X$, in tutti e due i fattori: è la deformazione omogenea tangente, eq. (2.1).`,
              aggiunto: true,
              val: (v) => { const dx = T.apply(mat(v, 'F'), T.scalev(vec(v, 'n'), v.dL)); return T.dotv(dx, dx); },
            },
            {
              tex: '=\\tens F^T\\tens F d\\vet X\\cdot d\\vet X',
              why: `Spostiamo il secondo $\\tens F$ dall'altra parte del prodotto scalare. È lecito per la definizione di trasposto (Def 1.3.1): il trasposto $\\tens A^T$ è il tensore che, passando dall'altro lato del prodotto scalare, dà lo stesso risultato, $\\tens A\\vet a\\cdot\\vet b=\\vet a\\cdot\\tens A^T\\vet b$. Qui $\\tens A=\\tens F$.`,
              ask: { q: `Quale proprietà permette di spostare $\\tens F$ da un lato all'altro del prodotto scalare?`, options: [`La definizione di trasposto`, `La simmetria di $\\tens F$`, `Il teorema spettrale`, `La linearità del determinante`], correct: 0, why: `Def 1.3.1: $(\\tens A\\vet u)\\cdot\\vet v=\\vet u\\cdot(\\tens A^T\\vet v)$, per qualunque tensore. La simmetria non si può usare perché $\\tens F$ in generale non è simmetrico; il teorema spettrale e il determinante non c'entrano con lo spostamento di un tensore nel prodotto scalare.` },
              val: (v) => { const F = mat(v, 'F'); const dX = T.scalev(vec(v, 'n'), v.dL); return T.dotv(T.apply(T.mul(T.transpose(F), F), dX), dX); },
            },
            { tex: '=(\\tens F^T\\tens F\\hat n\\cdot\\hat n)\\,dL^2', why: `Scriviamo $d\\vet X=dL\\,\\hat n$ in entrambi i fattori: il numero $dL$ esce una volta da ciascuno, quindi in tutto esce $dL^2$.`, val: (v) => { const F = mat(v, 'F'); const n = vec(v, 'n'); return T.dotv(T.apply(T.mul(T.transpose(F), F), n), n) * v.dL * v.dL; } },
            {
              tex: '\\Rightarrow\\ dl=\\sqrt{\\tens F^T\\tens F\\hat n\\cdot\\hat n}\\;dL',
              why: `Estraiamo la radice quadrata dei due membri: le lunghezze sono positive, quindi prendiamo la radice positiva.`,
              aggiunto: true,
            },
            { tex: '\\Rightarrow\\ \\varepsilon_n=\\dfrac{dl}{dL}-1=\\sqrt{\\tens F^T\\tens F\\hat n\\cdot\\hat n}-1', why: `Dividiamo per $dL$ e sostituiamo nella definizione $\\varepsilon_n=dl/dL-1$.`, eq: 'Prop 2.5.2' },
          ],
          checks: [
            { what: 'ε_n dal motore = |F n̂| − 1', f: (v) => [finiteMeasures(mat(v, 'F'), vec(v, 'n'), vec(v, 'm')).epsN, T.norm(T.apply(mat(v, 'F'), vec(v, 'n'))) - 1] },
            { what: 'ε_n = √(2Dn·n + 1) − 1', f: (v) => { const D2 = finiteD(mat(v, 'F')); const n = vec(v, 'n'); return [Math.sqrt(2 * T.dotv(T.apply(D2, n), n) + 1) - 1, T.norm(T.apply(mat(v, 'F'), n)) - 1]; } },
          ],
        },
      },
      {
        id: 'l24-5',
        kind: 'spiega',
        title: 'Leggere la formula di ε_n',
        md: `La Prop 2.5.2 dice: per sapere quanto si allunga la fibra in direzione $\\hat n$, applica a $\\hat n$ il tensore $\\tens F^T\\tens F$, fai il prodotto scalare con $\\hat n$, estrai la radice e togli 1.

Controllo sul caso più semplice: se non c'è deformazione, $\\tens F=\\tens I$, quindi $\\tens F^T\\tens F=\\tens I$, il prodotto vale $\\hat n\\cdot\\hat n=1$, la radice vale 1 e $\\varepsilon_n=0$. Lo stesso accade per una rotazione rigida, perché per un tensore ortogonale $\\tens R^T\\tens R=\\tens I$ (deduzione): una rotazione non allunga le fibre, come deve essere.

La formula **non è lineare** in $\\tens F$: c'è una radice, e $\\tens F$ compare moltiplicato per sé stesso, come un $x^2$. Raddoppiare $\\tens H$ non raddoppia $\\varepsilon_n$.

Il **campo di variazione**: se la fibra si allunga, $\\varepsilon_n>0$, e al limite di un allungamento infinito $\\varepsilon_n\\to+\\infty$. Se si accorcia, $\\varepsilon_n<0$, e al limite di una fibra che degenera in un punto $\\varepsilon_n\\to-1$. Gli estremi sono **esclusi**, perché niente annichilimento della materia ($\\det\\tens F>0$): $\\varepsilon_n\\in\\,]-1,+\\infty[$.`,
      },
      {
        id: 'l24-6',
        kind: 'domanda',
        q: { id: 'l24-q2', kind: 'scelta', q: `Una fibra si accorcia moltissimo, fino a ridursi quasi a un punto. A che cosa tende $\\varepsilon_n$?`, options: [`A $-1$, valore escluso`, `A $0$`, `A $-\\infty$`, `A $-1$, valore raggiungibile`], correct: 0, why: `Con $dl\\to0$ si ha $\\varepsilon_n=dl/dL-1\\to-1$. Non si arriva a $-\\infty$ perché $dl$ non può diventare negativo. E $-1$ non si raggiunge: vorrebbe dire una fibra annichilita, escluso da $\\det\\tens F>0$ (§2.5.1).` },
      },
      {
        id: 'l24-7',
        kind: 'spiega',
        title: 'Il tensore di deformazione finita D',
        md: `Nella formula di $\\varepsilon_n$ il protagonista è $\\tens F^T\\tens F$. Ha un difetto pratico: quando non c'è deformazione non vale zero ma $\\tens I$. La dispensa preferisce allora un tensore che si annulli in assenza di deformazione, il **tensore di deformazione finita** di Green–Saint-Venant (Def 2.5.3):
$$\\tens D:=\\tfrac12(\\tens F^T\\tens F-\\tens I)\\in\\mathrm{Sym}.$$

Due proprietà. È **simmetrico**: infatti $(\\tens F^T\\tens F)^T=\\tens F^T\\tens F$, perché trasporre un prodotto inverte l'ordine e trasporre due volte riporta al tensore di partenza (passaggio aggiunto). Ed è **nullo** quando $\\tens F=\\tens I$.

Rovesciando la definizione, $\\tens F^T\\tens F=2\\tens D+\\tens I$, e la dilatazione lineare diventa
$$\\varepsilon_n=\\sqrt{2\\tens D\\hat n\\cdot\\hat n+1}-1.$$
Da qui in avanti tutti i parametri si potranno scrivere con $\\tens D$.`,
      },
      {
        id: 'l24-8',
        kind: 'spiega',
        title: 'Lo scorrimento angolare: quanto si chiude un angolo retto',
        md: `Il secondo parametro riguarda una coppia di fibre. Prendi due fibre **ortogonali** uscenti da $X$, con direzioni $\\hat n$ e $\\hat m$. Dopo la deformazione diventano due fibre con direzioni $\\hat\\nu$ e $\\hat\\mu$, che formano un angolo $\\theta$, in generale non più retto.

Il **coefficiente di scorrimento mutuo angolare** misura quanto l'angolo si è allontanato da $\\pi/2$ (Def 2.5.4):
$$\\gamma_{n,m}:=\\frac\\pi2-\\theta.$$

Il segno ha un significato preciso: se $\\gamma>0$ allora $\\theta<\\pi/2$, cioè l'angolo **si chiude**; se $\\gamma<0$ l'angolo **si apre**. Nel taglio semplice del modello l'angolo retto tra x e y si chiude: lì lo scorrimento è positivo.

Come per $\\varepsilon_n$, vogliamo esprimere $\\gamma$ con il tensore $\\tens D$.`,
      },
      {
        id: 'l24-9',
        kind: 'derivazione',
        title: 'Lo scorrimento angolare in funzione di D',
        md: `**Dove vogliamo arrivare:** $\\sin\\gamma_{n,m}$ in funzione di $\\tens D$. **L'idea:** il seno di $\\gamma$ è il coseno di $\\theta$, e il coseno dell'angolo tra due vettori si calcola con il prodotto scalare diviso per le lunghezze. Poi riconosciamo $\\tens F^T\\tens F=2\\tens D+\\tens I$ al numeratore e le dilatazioni lineari al denominatore.`,
        source: D(2, '2.5.3', 'Prop 2.5.5', 22),
        der: {
          sample: (r) => sampleF(r),
          lines: [
            { tex: '\\sin\\gamma_{n,m}=\\sin\\big(\\tfrac\\pi2-\\theta\\big)=\\cos\\theta', why: `Usiamo la definizione $\\gamma=\\pi/2-\\theta$ e la trigonometria: il seno dell'angolo complementare è il coseno.`, val: (v) => finiteMeasures(mat(v, 'F'), vec(v, 'n'), vec(v, 'm')).sinGamma },
            { tex: '=\\dfrac{\\tens F\\hat n\\cdot\\tens F\\hat m}{|\\tens F\\hat n|\\,|\\tens F\\hat m|}', why: `Il coseno dell'angolo tra due vettori è il loro prodotto scalare diviso il prodotto delle lunghezze. I vettori sono le fibre deformate, che per la (2.1) sono proporzionali a $\\tens F\\hat n$ e $\\tens F\\hat m$.`, val: (v) => { const F = mat(v, 'F'); const a = T.apply(F, vec(v, 'n')); const b = T.apply(F, vec(v, 'm')); return T.dotv(a, b) / (T.norm(a) * T.norm(b)); } },
            {
              tex: '=\\dfrac{\\tens F^T\\tens F\\hat m\\cdot\\hat n}{|\\tens F\\hat n|\\,|\\tens F\\hat m|}',
              why: `Al numeratore spostiamo il primo $\\tens F$ dall'altra parte del prodotto scalare con la definizione di trasposto, come nella derivazione di $\\varepsilon_n$. Il denominatore resta com'è.`,
              aggiunto: true,
              val: (v) => { const F = mat(v, 'F'); const n = vec(v, 'n'); const m = vec(v, 'm'); return T.dotv(T.apply(T.mul(T.transpose(F), F), m), n) / (T.norm(T.apply(F, n)) * T.norm(T.apply(F, m))); },
            },
            {
              tex: '=\\dfrac{(2\\tens D+\\tens I)\\hat m\\cdot\\hat n}{|\\tens F\\hat n|\\,|\\tens F\\hat m|}',
              why: `Al numeratore sostituiamo $\\tens F^T\\tens F=2\\tens D+\\tens I$, cioè la definizione di $\\tens D$ letta al contrario.`,
              aggiunto: true,
              val: (v) => { const F = mat(v, 'F'); const D2 = finiteD(F); const n = vec(v, 'n'); const m = vec(v, 'm'); const num = T.dotv(T.apply(T.add(T.scale(D2, 2), T.I3), m), n); return num / (T.norm(T.apply(F, n)) * T.norm(T.apply(F, m))); },
            },
            {
              tex: '=\\dfrac{(2\\tens D+\\tens I)\\hat m\\cdot\\hat n}{(\\varepsilon_n+1)(\\varepsilon_m+1)}',
              why: `Al denominatore, $|\\tens F\\hat n|$ è il rapporto $dl/dL$ della fibra $\\hat n$, cioè $\\varepsilon_n+1$; allo stesso modo $|\\tens F\\hat m|=\\varepsilon_m+1$.`,
              val: (v) => { const F = mat(v, 'F'); const D2 = finiteD(F); const n = vec(v, 'n'); const m = vec(v, 'm'); const num = T.dotv(T.apply(T.add(T.scale(D2, 2), T.I3), m), n); return num / (Math.sqrt(2 * T.dotv(T.apply(D2, n), n) + 1) * Math.sqrt(2 * T.dotv(T.apply(D2, m), m) + 1)); },
            },
            {
              tex: '=\\dfrac{2\\tens D\\hat m\\cdot\\hat n}{(\\varepsilon_n+1)(\\varepsilon_m+1)}',
              why: `Il pezzo con l'identità vale $\\tens I\\hat m\\cdot\\hat n=\\hat m\\cdot\\hat n=0$, perché le due fibre erano ortogonali: sparisce e resta solo il termine con $\\tens D$.`,
              ask: { q: `Perché sparisce il termine $\\tens I\\hat m\\cdot\\hat n$?`, options: [`Perché $\\hat m\\perp\\hat n$`, `Perché $\\tens D$ è simmetrico`, `Perché $\\det\\tens F>0$`, `Perché $\\tens I$ è sferico`], correct: 0, why: `$\\tens I\\hat m\\cdot\\hat n=\\hat m\\cdot\\hat n$, che è zero per ipotesi: le fibre di partenza sono ortogonali. La simmetria di $\\tens D$ e il segno di $\\det\\tens F$ non annullano nulla qui; che $\\tens I$ sia sferico è vero ma non spiega perché il prodotto scalare sia zero.` },
              val: (v) => { const F = mat(v, 'F'); const D2 = finiteD(F); const n = vec(v, 'n'); const m = vec(v, 'm'); return (2 * T.dotv(T.apply(D2, m), n)) / (T.norm(T.apply(F, n)) * T.norm(T.apply(F, m))); },
              eq: 'Prop 2.5.5',
            },
          ],
        },
      },
      {
        id: 'l24-10',
        kind: 'spiega',
        title: 'Leggere la formula dello scorrimento',
        md: `La Prop 2.5.5 dice che la perdita di ortogonalità tra $\\hat n$ e $\\hat m$ dipende dal termine «misto» $\\tens D\\hat m\\cdot\\hat n$, diviso per le lunghezze finali delle due fibre. La dispensa la scrive anche con le radici, sostituendo $\\varepsilon_n+1=\\sqrt{2\\tens D\\hat n\\cdot\\hat n+1}$:
$$\\sin\\gamma_{n,m}=\\frac{2\\tens D\\hat m\\cdot\\hat n}{\\sqrt{2\\tens D\\hat n\\cdot\\hat n+1}\\,\\sqrt{2\\tens D\\hat m\\cdot\\hat m+1}}.$$

Controllo: senza deformazione $\\tens D=\\tens O$, il numeratore è zero e $\\gamma=0$, l'angolo resta retto. Anche qui la formula non è lineare: c'è un seno e ci sono le radici al denominatore.

Ricorda il segno: numeratore positivo vuol dire $\\gamma>0$ e angolo che si chiude.`,
      },
      {
        id: 'l24-11',
        kind: 'domanda',
        q: { id: 'l24-q3', kind: 'scelta', q: `Due fibre inizialmente ortogonali, dopo la deformazione, formano un angolo di 80°. Quanto vale lo scorrimento $\\gamma_{n,m}$?`, options: [`$+10°$: l'angolo si è chiuso`, `$-10°$: l'angolo si è chiuso`, `$+80°$`, `$-10°$: l'angolo si è aperto`], correct: 0, why: `$\\gamma=\\pi/2-\\theta=90°-80°=+10°$, positivo perché l'angolo si è chiuso (Def 2.5.4). Il segno negativo corrisponderebbe a un angolo maggiore di 90°, cioè che si apre; 80° è l'angolo finale, non lo scorrimento.` },
      },
      {
        id: 'l24-12',
        kind: 'spiega',
        title: 'La dilatazione superficiale: quanto cambia un\'area',
        md: `Il terzo parametro riguarda l'area. Due fibre ortogonali $\\hat n$ e $\\hat m$ individuano un piccolo quadrato di area $dS$; dopo la deformazione diventa un parallelogramma di area $ds$. Il **coefficiente di dilatazione superficiale** è (Def 2.5.6)
$$\\Delta S_{n,m}:=\\frac{ds-dS}{dS}.$$

Il ragionamento della dispensa (Prop 2.5.7) è simile ai precedenti. L'area di un parallelogramma è la lunghezza del prodotto vettoriale dei lati, quindi $ds/dS=|\\tens F\\hat n\\wedge\\tens F\\hat m|$. Per far comparire i prodotti scalari si usa l'**identità di Lagrange**, $|\\vet a\\wedge\\vet b|^2=|\\vet a|^2|\\vet b|^2-(\\vet a\\cdot\\vet b)^2$, e poi ancora $\\tens F^T\\tens F=2\\tens D+\\tens I$. Il risultato è
$$\\Delta S_{n,m}=\\sqrt{(2\\tens D\\hat n\\cdot\\hat n+1)(2\\tens D\\hat m\\cdot\\hat m+1)-4(\\tens D\\hat m\\cdot\\hat n)^2}-1.$$
Leggilo così: i primi due fattori sono i quadrati degli allungamenti dei due lati; il termine sottratto tiene conto che, se l'angolo si chiude, il parallelogramma si «schiaccia» e perde area. Anche $\\Delta S$ varia in $]-1,+\\infty[$. La dispensa nota che, per fibre non ortogonali, sotto radice si divide per $1-(\\hat n\\cdot\\hat m)^2$ e $2\\tens D\\hat m\\cdot\\hat n$ diventa $2\\tens D\\hat m\\cdot\\hat n+\\hat n\\cdot\\hat m$.`,
      },
      {
        id: 'l24-13',
        kind: 'derivazione',
        title: 'La dilatazione volumica: Θ = det F − 1',
        md: `L'ultimo parametro riguarda il volume: $\\Theta:=(dv-dV)/dV$ (Def 2.5.8). **Dove vogliamo arrivare:** $\\Theta$ in funzione di $\\tens F$. **L'idea:** tre fibre non complanari $d\\vet X$, $d\\vet Y$, $d\\vet Z$ uscenti da $X$ formano un piccolo parallelepipedo, e il volume di un parallelepipedo è il prodotto misto dei suoi spigoli. Confrontiamo il prodotto misto prima e dopo.`,
        source: D(2, '2.5.5', 'Prop 2.5.9', 23),
        der: {
          sample: (r) => { const o = sampleF(r); putVec(o, 'p', T.randVec(r)); putVec(o, 'q', T.randVec(r)); putVec(o, 's', T.randVec(r)); return o; },
          lines: [
            { tex: '\\dfrac{dv}{dV}=\\dfrac{d\\vet x\\wedge d\\vet y\\cdot d\\vet z}{d\\vet X\\wedge d\\vet Y\\cdot d\\vet Z}', why: `Scriviamo ciascun volume come prodotto misto dei tre spigoli: sopra quelli deformati, sotto quelli iniziali.`, val: (v) => { const F = mat(v, 'F'); const [a, b, c] = [vec(v, 'p'), vec(v, 'q'), vec(v, 's')]; return T.dotv(T.cross(T.apply(F, a), T.apply(F, b)), T.apply(F, c)) / T.dotv(T.cross(a, b), c); } },
            {
              tex: '=\\dfrac{\\tens Fd\\vet X\\wedge\\tens Fd\\vet Y\\cdot\\tens Fd\\vet Z}{d\\vet X\\wedge d\\vet Y\\cdot d\\vet Z}',
              why: `Ogni spigolo deformato si ottiene dalla (2.1): $d\\vet x=\\tens F\\,d\\vet X$, $d\\vet y=\\tens F\\,d\\vet Y$, $d\\vet z=\\tens F\\,d\\vet Z$. Lo sostituiamo al numeratore.`,
              aggiunto: true,
              val: (v) => { const F = mat(v, 'F'); const [a, b, c] = [vec(v, 'p'), vec(v, 'q'), vec(v, 's')]; return T.dotv(T.cross(T.apply(F, a), T.apply(F, b)), T.apply(F, c)) / T.dotv(T.cross(a, b), c); },
            },
            {
              tex: '=\\det\\tens F',
              why: `Il rapporto tra il prodotto misto di tre vettori trasformati da $\\tens F$ e il prodotto misto dei vettori di partenza è, per definizione, il determinante di $\\tens F$ (Def 1.4.1). Non serve alcun conto: è la definizione.`,
              ask: { q: `Quale definizione chiude la dimostrazione?`, options: [`Quella di determinante (rapporto di prodotti misti)`, `Quella di traccia`, `Il teorema della divergenza`, `L'identità di Lagrange`], correct: 0, why: `Def 1.4.1: $\\det\\tens A$ è il rapporto tra il prodotto misto dei vettori trasformati e quello dei vettori di partenza. La traccia comparirà nella teoria infinitesima, non qui; la divergenza riguarda campi, non un singolo tensore; l'identità di Lagrange serviva per l'area.` },
              val: (v) => T.det(mat(v, 'F')),
            },
            { tex: '\\Rightarrow\\ \\Theta=\\dfrac{dv}{dV}-1=\\det\\tens F-1', why: `Sostituiamo nella definizione $\\Theta=dv/dV-1$.`, eq: 'Prop 2.5.9' },
          ],
        },
      },
      {
        id: 'l24-14',
        kind: 'spiega',
        title: 'Leggere Θ = det F − 1',
        md: `La Prop 2.5.9 è la più breve del capitolo e chiude un conto rimasto aperto. Nella lezione sui requisiti di plausibilità abbiamo usato la lettura $\\det\\tens F=dv/dV$ promettendo di dimostrarla: eccola. Il determinante di $\\tens F$ è il fattore per cui si moltiplicano i volumi piccoli.

Controlli: senza deformazione $\\det\\tens I=1$ e $\\Theta=0$. Per una rotazione rigida $\\det\\tens R=1$ e di nuovo $\\Theta=0$: ruotare non cambia il volume.

Ora il requisito $\\det\\tens F>0$ si traduce in $\\Theta>-1$: il volume non può annullarsi. Insieme all'esplosione esclusa, $\\Theta\\in\\,]-1,+\\infty[$, lo stesso campo di $\\varepsilon_n$ e $\\Delta S$.`,
      },
      {
        id: 'l24-15',
        kind: 'domanda',
        q: { id: 'l24-q4', kind: 'scelta', q: `In un punto $\\det\\tens F=0{,}9$. Che cosa succede al volume di un piccolo intorno?`, options: [`Diminuisce del 10%: $\\Theta=-0{,}1$`, `Diminuisce del 90%: $\\Theta=-0{,}9$`, `Resta uguale, perché $\\det\\tens F>0$`, `Aumenta del 90%`], correct: 0, why: `$\\Theta=\\det\\tens F-1=-0{,}1$ (Prop 2.5.9): $dv=0{,}9\\,dV$. Confondere $\\Theta$ con $\\det\\tens F$ porta a $-0{,}9$. Che $\\det\\tens F$ sia positivo dice solo che il volume non si annulla, non che resta uguale.` },
      },
      {
        id: 'l24-16',
        kind: 'spiega',
        title: 'Dal punto al corpo intero: le misure globali',
        md: `Tutti i parametri visti finora sono **locali**: valgono nell'intorno di un punto. Per un oggetto finito si mettono insieme i contributi di tutti i punti, cioè si **integra** (§2.5.6).

La variazione di lunghezza di una linea $\\Gamma$ tra i punti $A$ e $B$ è
$$\\Delta L^{\\Gamma}_{AB}=\\int_A^B\\varepsilon_n(X)\\,dl,$$
dove $\\hat n$ è la tangente alla curva, che cambia da punto a punto. La variazione di volume del corpo intero è
$$\\Delta V_{\\mathcal B}=\\int_{\\mathcal B}\\Theta(X)\\,dV.$$

È lo stesso schema del caso scalare: ogni pezzetto piccolo si comporta in modo semplice, e il comportamento dell'insieme si ottiene sommando i pezzetti.`,
      },
      {
        id: 'l24-17',
        kind: 'prova',
        title: 'Leggi i parametri sul modello',
        md: `Nella tabella sotto il modello trovi i parametri della teoria finita, calcolati con il gradiente vero e non con quello amplificato del disegno.`,
        tasks: [
          `Scegli «allungamento lungo x» e la fibra a 0°: leggi $\\varepsilon_n=0{,}04$ e $\\gamma=0$. La fibra lungo x si allunga e l'angolo retto con y resta retto.`,
          `Scegli «isocora»: $\\Theta$ è quasi zero. Il cubetto cambia forma ma non volume (al primo ordine; il piccolo residuo è un effetto non lineare).`,
          `Con il taglio, metti la fibra a 45°: si allunga. Portala a 135°: si accorcia. Lo stesso tensore allunga una diagonale e accorcia l'altra.`,
        ],
        visual: DEF({ mode: 'intorno', preset: 'allungamento', presets: ['allungamento', 'isocora', 'taglio', 'generico'], controls: ['preset', 'amp', 'alpha'] }),
      },
      {
        id: 'l24-18',
        kind: 'spiega',
        title: 'Attenzione a…',
        md: `Tre errori tipici sui parametri di misura finiti.

1. **Dire che $\\varepsilon_n$ è lineare in $\\tens F$.** È tentante perché $d\\vet x=\\tens F\\,d\\vet X$ è lineare. Ma la lunghezza si ottiene con un prodotto scalare e una radice: $\\tens F$ compare moltiplicato per sé stesso, come un $x^2$, e poi sotto radice.
2. **Sbagliare il segno di $\\gamma$.** $\\gamma=\\pi/2-\\theta$ è positivo quando l'angolo tra le fibre si **chiude** ($\\theta<\\pi/2$), non quando si apre.
3. **Includere gli estremi nel campo di variazione.** $-1$ e $+\\infty$ sono esclusi: $-1$ vorrebbe dire una fibra, un'area o un volume annichiliti, impedito da $\\det\\tens F>0$.`,
      },
      {
        id: 'l24-19',
        kind: 'riassunto',
        md: `**Il filo della lezione.** Per dire quanto si deforma un intorno misuriamo variazioni specifiche, perché è quello che conta per la sollecitazione. Partendo da $d\\vet x=\\tens F\\,d\\vet X$, lunghezze e angoli si calcolano con prodotti scalari, e in essi compare sempre $\\tens F^T\\tens F$; togliendo l'identità e dividendo per due nasce il tensore di deformazione finita $\\tens D$, simmetrico e nullo senza deformazione. Così si ottengono la dilatazione lineare, lo scorrimento e la dilatazione superficiale, tutte non lineari. Il volume invece si legge sul determinante, per la definizione stessa di determinante. Le misure globali si ottengono integrando.

- Dilatazione lineare: $\\varepsilon_n=\\sqrt{\\tens F^T\\tens F\\hat n\\cdot\\hat n}-1=\\sqrt{2\\tens D\\hat n\\cdot\\hat n+1}-1$ (Prop 2.5.2).
- Tensore di Green–Saint-Venant: $\\tens D=\\tfrac12(\\tens F^T\\tens F-\\tens I)\\in\\mathrm{Sym}$ (Def 2.5.3).
- Scorrimento: $\\sin\\gamma_{n,m}=2\\tens D\\hat m\\cdot\\hat n/[(\\varepsilon_n+1)(\\varepsilon_m+1)]$, positivo se l'angolo si chiude (Prop 2.5.5).
- Dilatazione superficiale: Prop 2.5.7. Dilatazione volumica: $\\Theta=\\det\\tens F-1$ (Prop 2.5.9).
- Campi: $\\varepsilon_n,\\ \\Delta S,\\ \\Theta\\in\\,]-1,+\\infty[$, estremi esclusi.`,
        orale: ['Ricavare $\\varepsilon_n$ in funzione di $\\tens F$ e di $\\tens D$; campo di variazione. (dispensa, domanda 5)', 'Dimostrare che $\\Theta=\\det\\tens F-1$. (dispensa, domanda 6)'],
      },
    ],
  },
  // ================================================================== c2.5
  {
    concept: 'c2.5',
    title: 'Piccole deformazioni e piccoli spostamenti',
    minutes: 17,
    source: D(2, '2.6.1–2.6.2', 'Def 2.6.1–2.6.2', '23–24'),
    visual: DEF({ mode: 'intorno', preset: 'rotazione', presets: ['rotazione', 'allungamento'], part: 'W', amp: 20, controls: ['preset', 'part', 'amp'] }),
    steps: [
      {
        id: 'l25-1',
        kind: 'spiega',
        title: 'Dove siamo e dove andiamo',
        md: `Nella lezione precedente abbiamo ricavato i parametri di misura della teoria finita: formule esatte, ma con radici, seni e prodotti di $\\tens F$ per sé stesso. Sono **non lineari** e non portano a calcoli semplici.

Questa lezione apre la **teoria delle deformazioni infinitesime** (§2.6). L'idea è approfittare di un fatto concreto: i materiali da costruzione ordinari, come acciaio e calcestruzzo, si deformano pochissimo, tanto che le deformazioni si percepiscono solo con gli strumenti. Si possono quindi sviluppare teorie approssimate.

Introdurremo due ipotesi di «piccolezza» che sembrano simili ma sono diverse: **piccole deformazioni** e **piccoli spostamenti**. Vedremo che cosa dice ciascuna, perché non vanno confuse e quale conseguenza ha ciascuna: la prima semplifica la descrizione della deformazione, la seconda semplifica l'equilibrio.`,
      },
      {
        id: 'l25-2',
        kind: 'spiega',
        title: 'Piccole deformazioni: H piccolo',
        md: `La prima ipotesi riguarda il gradiente di spostamento $\\tens H$. Si parla di **piccole deformazioni** quando (Def 2.6.1)
$$\\|\\tens H\\|\\ll1.$$
La norma di un tensore, dal Modulo 1, è la radice del prodotto scalare del tensore con sé stesso: un numero che misura quanto è «grande» il tensore.

Perché confrontarla proprio con 1? Perché $\\tens H$ è **adimensionale**: le sue componenti sono derivate di lunghezze (gli spostamenti) rispetto a lunghezze (le coordinate), quindi sono numeri puri. Ha senso dire che sono piccole rispetto a 1.

Ricorda l'identità cinematica: $\\tens F=\\tens I+\\tens H$. Se $\\tens H$ è piccolo, $\\tens F\\simeq\\tens I$: la deformazione è vicina all'assenza di deformazione. È questa ipotesi che permette di **linearizzare le deformazioni**, come faremo nella prossima lezione.`,
      },
      {
        id: 'l25-3',
        kind: 'spiega',
        title: 'Piccoli spostamenti: u piccolo',
        md: `La seconda ipotesi riguarda lo spostamento stesso, non il suo gradiente. Si parla di **piccoli spostamenti** quando (Def 2.6.2)
$$|\\vet u|\\ll1,$$
dove «piccoli» vuol dire piccoli rispetto alle dimensioni caratteristiche del corpo: una trave lunga 5 m che si abbassa di un centimetro ha spostamenti piccoli.

Nota la differenza tra le due ipotesi. Le piccole deformazioni dicono che **punti vicini si spostano quasi allo stesso modo**: lo spostamento varia poco da un punto all'altro. I piccoli spostamenti dicono che **ogni punto si muove poco** rispetto alla sua posizione iniziale.

Spesso le due ipotesi si adottano insieme, e per questo si confondono. Ma sono indipendenti in quasi tutti i casi, e il prossimo passo lo mostra con esempi.`,
      },
      {
        id: 'l25-4',
        kind: 'domanda',
        q: { id: 'l25-q2', kind: 'vf', q: `Se le deformazioni sono piccole, anche gli spostamenti sono necessariamente piccoli.`, answer: false, why: `Le piccole deformazioni dicono che lo spostamento varia poco da punto a punto, non che è piccolo. Un foglio piegato o una vela gonfia si spostano molto pur deformandosi pochissimo (§2.6.2).` },
      },
      {
        id: 'l25-5',
        kind: 'spiega',
        title: 'Le quattro combinazioni',
        md: `La dispensa (§2.6.2) passa in rassegna le combinazioni possibili.
- **Grandi spostamenti non implicano grandi deformazioni.** Traccia un segmento di 10 cm su un foglio e piega il foglio: il segmento si sposta di centimetri, ma resta lungo 10 cm.
- **Grandi deformazioni implicano grandi spostamenti.** Gli spostamenti si ottengono integrando le deformazioni: se le deformazioni sono grandi, sommandole si accumulano spostamenti grandi.
- **Piccole deformazioni e grandi spostamenti**: è il caso della **vela**, che si muove e si gonfia molto mentre le fibre del tessuto si allungano pochissimo. **Piccole deformazioni e piccoli spostamenti**: le travi comuni.
- **Grandi deformazioni e piccoli spostamenti**: impossibile, per il secondo punto.

Nel modello a destra c'è una sola rotazione rigida: i punti lontani dall'asse si spostano molto, ma il cubetto non cambia forma. È il caso «spostamenti grandi, deformazioni nulle» in miniatura.`,
      },
      {
        id: 'l25-6',
        kind: 'domanda',
        q: { id: 'l25-q1', kind: 'scelta', q: `Una vela gonfiata dal vento è un esempio di…`, options: [`piccole deformazioni e grandi spostamenti`, `grandi deformazioni e piccoli spostamenti`, `piccole deformazioni e piccoli spostamenti`, `grandi deformazioni e grandi spostamenti`], correct: 0, why: `§2.6.2: la vela si muove e si flette molto, mentre le fibre del tessuto si allungano pochissimo. «Grandi deformazioni e piccoli spostamenti» è la combinazione impossibile; «piccole e piccoli» descrive le travi comuni.` },
      },
      {
        id: 'l25-7',
        kind: 'prova',
        title: 'Spostarsi molto senza deformarsi',
        md: `Il modello mostra un intorno sottoposto a una rotazione rigida, con un'amplificazione forte. Con «parte disegnata» scegli quale pezzo del gradiente $\\tens H$ vedere.`,
        tasks: [
          `Con «rotazione rigida infinitesima», guarda gli spigoli del cubetto lontani dall'asse: si spostano parecchio, eppure il cubetto non cambia forma. Spostamenti grandi, deformazione nulla.`,
          `Passa a «allungamento lungo x» e scegli di vedere tutto $\\tens H$: ora il cubetto cambia forma. Qui c'è deformazione vera.`,
        ],
        visual: DEF({ mode: 'intorno', preset: 'rotazione', presets: ['rotazione', 'allungamento'], part: 'W', amp: 20, controls: ['preset', 'part', 'amp'] }),
      },
      {
        id: 'l25-8',
        kind: 'spiega',
        title: 'Dove contano i piccoli spostamenti: l\'equilibrio',
        md: `Se i piccoli spostamenti non servono a descrivere la deformazione, a che cosa servono? All'**equilibrio**, che studieremo nel capitolo 3.

Pensa a un elastico che regge un secchio, riempito d'acqua piano piano. L'elastico si allunga finché le forze non si bilanciano: l'equilibrio si raggiunge nella configurazione **deformata**, non in quella iniziale. Il guaio è che la configurazione deformata all'inizio **non si conosce**: è proprio ciò che vogliamo calcolare. Per scrivere l'equilibrio servirebbe la forma deformata, e per trovare la forma deformata servirebbe l'equilibrio. Il problema è **implicito**.

Il prossimo passo mostra questo circolo con un esempio concreto e mostra come l'ipotesi di piccoli spostamenti lo spezza.`,
      },
      {
        id: 'l25-9',
        kind: 'spiega',
        title: 'Il palo portafari',
        md: `Un palo verticale incastrato alla base porta in cima un faro, il cui peso $P$ agisce con un'**eccentricità** $e$, cioè a distanza $e$ dall'asse del palo.

Se trascuriamo la deformazione, il momento alla base è semplicemente
$$M=Pe.$$
In realtà il momento piega il palo, e la sommità si sposta orizzontalmente di una quantità $f$ (qui $f$ indica lo spostamento della sommità, non la deformazione). Allora il braccio del carico diventa $e+f$ e il momento vero è
$$M=P(e+f).$$
Ma $f$ dipende a sua volta da $M$: più grande è il momento, più il palo si piega. Ecco il problema implicito.

Se però lo spostamento è piccolo rispetto all'eccentricità, $f\\ll e$, il termine $f$ si può trascurare e torniamo a $M\\simeq Pe$: il momento si calcola sulla forma iniziale.`,
      },
      {
        id: 'l25-10',
        kind: 'spiega',
        title: 'L\'equilibrio referenziale',
        md: `Il palo mostra il caso generale. Quando gli spostamenti sono piccoli, la configurazione deformata è quasi sovrapposta a quella di riferimento, e ai fini dell'equilibrio le si può **confondere**: l'equilibrio si impone sulla configurazione di riferimento, che conosciamo. Si chiama **equilibrio referenziale** (§2.6.2), e trasforma un problema implicito in uno esplicito.

Il riquadro «Per l'orale» di p. 24 mette in parallelo le due ipotesi, ed è la frase da ricordare:
- piccole deformazioni permettono la **linearizzazione delle deformazioni**;
- piccoli spostamenti permettono la **linearizzazione dell'equilibrio**.

Nel resto del corso le useremo entrambe, ma all'orale bisogna saper dire quale serve a che cosa.`,
      },
      {
        id: 'l25-11',
        kind: 'domanda',
        q: { id: 'l25-q3', kind: 'scelta', q: `Quale ipotesi autorizza a scrivere l'equilibrio nella configurazione di riferimento?`, options: [`Piccoli spostamenti`, `Piccole deformazioni`, `$\\det\\tens F>0$`, `Biettività di $f$`], correct: 0, why: `Riquadro di p. 24: sono i piccoli spostamenti a permettere l'equilibrio referenziale. Le piccole deformazioni linearizzano invece la descrizione della deformazione; gli altri due sono requisiti di plausibilità e non c'entrano con l'equilibrio.` },
      },
      {
        id: 'l25-12',
        kind: 'spiega',
        title: 'Attenzione a…',
        md: `Due errori tipici su questo argomento.

1. **Dire che grandi spostamenti implicano grandi deformazioni.** È tentante perché «molto movimento» sembra voler dire «molta deformazione». Il foglio piegato e la vela lo smentiscono: ci si può spostare molto restando quasi indeformati. L'implicazione vera va nell'altro verso: grandi deformazioni portano grandi spostamenti.
2. **Attribuire l'equilibrio referenziale all'ipotesi di piccole deformazioni.** L'equilibrio dipende da dove si trovano i carichi, cioè dagli spostamenti: è l'ipotesi di piccoli spostamenti che permette di confondere la configurazione deformata con quella di riferimento.`,
      },
      {
        id: 'l25-13',
        kind: 'riassunto',
        md: `**Il filo della lezione.** I materiali da costruzione si deformano poco, e questo permette di approssimare. Le ipotesi di piccolezza sono due e diverse. Piccole deformazioni, $\\|\\tens H\\|\\ll1$, vuol dire che lo spostamento varia poco da punto a punto, quindi $\\tens F$ è vicino all'identità: serve a linearizzare le deformazioni. Piccoli spostamenti, $|\\vet u|\\ll1$, vuol dire che ogni punto si muove poco: serve a scrivere l'equilibrio sulla configurazione di riferimento, come nel palo portafari. Le due ipotesi sono indipendenti, tranne il fatto che grandi deformazioni portano grandi spostamenti.

- Piccole deformazioni: $\\|\\tens H\\|\\ll1\\Rightarrow\\tens F\\simeq\\tens I$ (Def 2.6.1).
- Piccoli spostamenti: $|\\vet u|\\ll1$ rispetto alle dimensioni del corpo (Def 2.6.2).
- Palo portafari: $M=P(e+f)\\simeq Pe$ se $f\\ll e$ (§2.6.2).`,
        orale: ['Differenza tra piccole deformazioni e piccoli spostamenti; equilibrio referenziale (esempio del palo). (dispensa, domanda 7)'],
      },
    ],
  },
  // ================================================================== c2.6
  {
    concept: 'c2.6',
    title: 'Il tensore di deformazione infinitesima',
    minutes: 34,
    source: D(2, '2.6.3–2.6.6', 'Prop 2.6.3, Def 2.6.4, Teo 2.6.5, Prop 2.6.6', '24–26'),
    visual: DEF({ mode: 'intorno', presets: ['taglio', 'rotazione', 'generico', 'isocora'], part: 'H', controls: ['preset', 'part', 'amp', 'alpha'] }),
    steps: [
      {
        id: 'l26-1',
        kind: 'spiega',
        title: 'Dove siamo e dove andiamo',
        md: `Nella lezione precedente abbiamo introdotto l'ipotesi di piccole deformazioni, $\\|\\tens H\\|\\ll1$, promettendo che avrebbe permesso di linearizzare le deformazioni. In questa lezione manteniamo la promessa.

Le tappe sono quattro. Prima vediamo **come** si trascurano i termini piccoli quando si lavora con tensori, con un procedimento formale. Poi lo applichiamo al tensore di deformazione finita $\\tens D$ e otteniamo il **tensore di deformazione infinitesima** $\\tens E$. Quindi scopriamo che cosa resta fuori da $\\tens E$: una rotazione rigida, descritta dal tensore $\\tens W$. Infine riscriviamo tutti i parametri di misura della lezione sui parametri finiti, che diventano **lineari** in $\\tens E$, e leggiamo il significato delle componenti di $\\tens E$.

Questa è la lezione che userai di più nel resto del corso: da qui in avanti la deformazione sarà sempre descritta da $\\tens E$.`,
      },
      {
        id: 'l26-2',
        kind: 'spiega',
        title: 'Come si trascura un termine piccolo in un tensore',
        md: `Con i numeri trascurare gli infinitesimi di ordine superiore è facile: se $h$ è piccolo, $h^2$ è molto più piccolo e lo si butta. Con un tensore è meno chiaro che cosa voglia dire «$\\tens H^2$ è piccolo rispetto a $\\tens H$». La dispensa usa allora un **procedimento formale** in quattro mosse (§2.6.3):
1. si scrive $\\tens F=\\tens I+\\epsilon\\tens H$, dove $\\epsilon$ è un numero, il **parametro di piccolezza**;
2. si calcola la grandezza che interessa;
3. si trascurano i termini con $\\epsilon^2$, $\\epsilon^3$ e così via;
4. si pone $\\epsilon=1$, perché $\\epsilon$ era stato introdotto apposta e non ha significato fisico.

Il numero $\\epsilon$ fa da «etichetta»: conta quante volte compare $\\tens H$ in ciascun termine. Un esempio scalare (esempio aggiunto): $(1+\\epsilon h)^2=1+2\\epsilon h+\\epsilon^2h^2$; trascurando $\\epsilon^2$ e ponendo $\\epsilon=1$ resta $1+2h$, l'approssimazione al primo ordine.`,
      },
      {
        id: 'l26-3',
        kind: 'derivazione',
        title: 'Linearizzazione di D',
        md: `**Dove vogliamo arrivare:** la forma che prende il tensore di deformazione finita $\\tens D=\\tfrac12(\\tens F^T\\tens F-\\tens I)$ quando $\\tens H$ è piccolo. **L'idea:** applichiamo le quattro mosse del procedimento formale. L'app controlla una componente $(i,j)$ con un $\\tens H$ e un $\\epsilon$ scelti a caso.`,
        source: D(2, '2.6.3', 'Prop 2.6.3', 25),
        der: {
          sample: (r) => { const o: R = { i: idx(r), j: idx(r), e: 0.5 * r() }; putMat(o, 'H', T.randMat(r)); return o; },
          lines: [
            { tex: '\\tens D=\\tfrac12\\big[(\\tens I+\\epsilon\\tens H)^T(\\tens I+\\epsilon\\tens H)-\\tens I\\big]', why: `Prima mossa: nella definizione di $\\tens D$ scriviamo $\\tens F=\\tens I+\\epsilon\\tens H$.`, val: (v) => T.at(finiteD(T.add(T.I3, T.scale(mat(v, 'H'), v.e))), v.i, v.j) },
            {
              tex: '=\\tfrac12\\big[(\\tens I+\\epsilon\\tens H^T)(\\tens I+\\epsilon\\tens H)-\\tens I\\big]',
              why: `Calcoliamo il trasposto del primo fattore. Il trasposto di una somma è la somma dei trasposti, e l'identità è uguale al suo trasposto, $\\tens I^T=\\tens I$.`,
              val: (v) => { const H = mat(v, 'H'); const A = T.mul(T.add(T.I3, T.scale(T.transpose(H), v.e)), T.add(T.I3, T.scale(H, v.e))); return 0.5 * T.at(T.sub(A, T.I3), v.i, v.j); },
            },
            {
              tex: '=\\tfrac12\\big(\\tens I+\\epsilon\\tens H+\\epsilon\\tens H^T+\\epsilon^2\\tens H^T\\tens H-\\tens I\\big)',
              why: `Sviluppiamo il prodotto dei due fattori, termine per termine, come $(1+a)(1+b)=1+a+b+ab$. Attenzione all'ordine nell'ultimo termine: è $\\tens H^T\\tens H$, perché il prodotto di tensori non è commutativo.`,
              aggiunto: true,
              val: (v) => { const H = mat(v, 'H'); const A = T.sub(T.add(T.add(T.add(T.I3, T.scale(H, v.e)), T.scale(T.transpose(H), v.e)), T.scale(T.mul(T.transpose(H), H), v.e * v.e)), T.I3); return 0.5 * T.at(A, v.i, v.j); },
            },
            {
              tex: '=\\tfrac12\\big(\\epsilon\\tens H+\\epsilon\\tens H^T+\\epsilon^2\\tens H^T\\tens H\\big)',
              why: `Le due identità, una con il più e una con il meno, si cancellano. Seconda mossa compiuta: abbiamo calcolato $\\tens D$.`,
              ask: { q: `Quale termine è di ordine superiore al primo?`, options: [`$\\epsilon^2\\tens H^T\\tens H$`, `$\\epsilon\\tens H$`, `$\\epsilon\\tens H^T$`, `nessuno`], correct: 0, why: `È l'unico termine in cui $\\tens H$ compare due volte, e infatti porta $\\epsilon^2$: è quello che la terza mossa trascura. Gli altri due hanno $\\epsilon$ alla prima potenza e restano.` },
              val: (v) => { const H = mat(v, 'H'); const A = T.add(T.add(T.scale(H, v.e), T.scale(T.transpose(H), v.e)), T.scale(T.mul(T.transpose(H), H), v.e * v.e)); return 0.5 * T.at(A, v.i, v.j); },
            },
            {
              tex: '\\simeq\\tfrac12\\big(\\epsilon\\tens H+\\epsilon\\tens H^T\\big)',
              why: `Terza mossa: trascuriamo il termine con $\\epsilon^2$. Da qui il segno non è più «uguale» ma «circa uguale».`,
              aggiunto: true,
            },
            { tex: '\\simeq\\tfrac12\\big(\\tens H+\\tens H^T\\big)=:\\tens E', why: `Quarta mossa: poniamo $\\epsilon=1$. Quello che resta ha un nome: è il tensore di deformazione infinitesima $\\tens E$.`, eq: 'Prop 2.6.3, Def 2.6.4' },
          ],
        },
      },
      {
        id: 'l26-4',
        kind: 'spiega',
        title: 'Che cosa è E',
        md: `Il risultato (Prop 2.6.3, Def 2.6.4) è
$$\\tens E:=\\tfrac12(\\tens H+\\tens H^T).$$
Dal Modulo 1 riconosci questa espressione: è la **parte simmetrica** di $\\tens H$, cioè la media tra il tensore e il suo trasposto. Quindi $\\tens E$ è simmetrico per costruzione.

Due controlli (passaggio aggiunto). Se $\\tens H$ è già simmetrico, $\\tens E=\\tens H$: non si butta via niente. Se $\\tens H$ è antisimmetrico, $\\tens H^T=-\\tens H$ e $\\tens E=\\tens O$: tutto il gradiente finisce fuori da $\\tens E$. Vedremo tra poco che cosa rappresenta questa parte esclusa.

Un fatto importante della dispensa: nella teoria finita esistono molte misure tensoriali di deformazione (lagrangiane, euleriane); nella teoria infinitesima **collassano tutte in $\\tens E$**. Da qui in avanti avremo una sola misura di deformazione.`,
      },
      {
        id: 'l26-5',
        kind: 'spiega',
        title: 'L\'equazione di congruenza',
        md: `Siccome $\\tens H$ è il gradiente dello spostamento, $\\tens H=\\nabla\\vet u$, possiamo scrivere $\\tens E$ direttamente con lo spostamento. È l'**equazione di congruenza**, o di compatibilità (Teo 2.6.5):
$$\\tens E=\\tfrac12(\\nabla\\vet u+\\nabla\\vet u^T),$$
che si scrive anche $\\tens E=\\operatorname{sym}\\nabla\\vet u$. È il legame tra spostamenti e deformazioni.

$\\tens E$ è un **campo**: in ogni punto $X$ del corpo c'è un suo valore $\\tens E(X)$. In componenti
$$E_{ij}=\\frac12\\left(\\frac{\\partial u_i}{\\partial X_j}+\\frac{\\partial u_j}{\\partial X_i}\\right),\\qquad E_{ii}=\\frac{\\partial u_i}{\\partial X_i}.$$
Nota che sulla diagonale i due termini coincidono, quindi il $\\tfrac12$ si semplifica.`,
      },
      {
        id: 'l26-6',
        kind: 'domanda',
        q: { id: 'l26-q2', kind: 'scelta', q: `Il gradiente di spostamento ha una sola componente non nulla, $H_{12}=0{,}02$. Quanto vale $E_{12}$?`, options: [`$0{,}01$`, `$0{,}02$`, `$0$`, `$0{,}04$`], correct: 0, why: `$E_{12}=\\tfrac12(H_{12}+H_{21})=\\tfrac12(0{,}02+0)=0{,}01$. Rispondere $0{,}02$ vuol dire dimenticare il $\\tfrac12$ della parte simmetrica; $0$ vuol dire pensare che conti solo la diagonale; $0{,}04$ raddoppia invece di dimezzare.` },
      },
      {
        id: 'l26-7',
        kind: 'spiega',
        title: 'Che cosa resta fuori: la rotazione W',
        md: `Abbiamo visto che $\\tens E$ è solo la parte simmetrica di $\\tens H$. Il **primo teorema di decomposizione** del Modulo 1 dice che ogni tensore si scrive in modo unico come somma di una parte simmetrica e una antisimmetrica (§2.6.4):
$$\\underset{(9)}{\\tens H}=\\underset{(6)}{\\tens E}+\\underset{(3)}{\\tens W},\\qquad\\tens W:=\\tfrac12(\\tens H-\\tens H^T)\\in\\mathrm{Skw}.$$
I numeri tra parentesi contano le componenti indipendenti: le 9 di $\\tens H$ si dividono in 6 di $\\tens E$ e 3 di $\\tens W$. Il tensore $\\tens W$ si chiama **tensore di rotazione rigida infinitesima**.

Perché questo nome? Guardiamo i casi. Per una **traslazione** $\\tens H=\\tens O$, quindi $\\tens E=\\tens W=\\tens O$. Per una **rotazione rigida** la formula di Eulero dà $\\tens F=\\tens R=\\tens I+\\sin\\varphi\\,\\tens W+(1-\\cos\\varphi)\\tens W^2$. Se la rotazione è **infinitesima**, $\\tens F\\simeq\\tens I+\\varphi\\tens W$, quindi $\\tens H=\\varphi\\tens W$, che è antisimmetrico; per l'unicità della decomposizione la sua parte simmetrica è nulla: $\\tens E=\\tens O$. In generale si chiama **spostamento rigido infinitesimo** quello con $\\tens H=\\tens W$ e $\\tens E=\\tens O$.`,
      },
      {
        id: 'l26-8',
        kind: 'spiega',
        title: 'Che cosa misura E',
        md: `Mettiamo insieme. Il gradiente di spostamento contiene due informazioni mescolate: quanto il pezzetto si deforma davvero e quanto ruota rigidamente. La decomposizione le separa.

Il riquadro «Per l'orale» di p. 26 lo dice così: $\\tens E$ misura la **deformazione pura**, cioè ciò che resta una volta tolto lo spostamento rigido infinitesimo, descritto da $\\tens W$.

La conseguenza fisica è importante per i capitoli successivi: gli spostamenti rigidi infinitesimi **non producono deformazioni**, cioè non cambiano lunghezze, angoli, aree e volumi, e quindi **non producono nemmeno tensioni**. Quando nel capitolo 4 legheremo le tensioni alle deformazioni, sarà $\\tens E$, e non $\\tens H$, a entrare nel legame.`,
      },
      {
        id: 'l26-9',
        kind: 'prova',
        title: 'Separa deformazione pura e rotazione',
        md: `Con il comando «parte disegnata» scegli che cosa vedere: tutto $\\tens H$, solo $\\tens E$ o solo $\\tens W$. La parte $\\tens W$ è disegnata come rotazione esatta attorno al suo vettore assiale $\\vet w$, così resta rigida anche quando il disegno è amplificato.`,
        tasks: [
          `Con il taglio semplice, guarda «solo deformazione pura E»: il cubetto si deforma in modo simmetrico, allungandosi lungo una diagonale e accorciandosi lungo l'altra.`,
          `Ora scegli «solo rotazione rigida W»: il cubetto ruota attorno all'asse z senza deformarsi. Il taglio semplice è quindi una deformazione pura più una rotazione.`,
          `Passa a «rotazione rigida infinitesima» e guarda la parte $\\tens E$: il cubetto non si muove, perché $[\\tens E]=\\tens O$.`,
        ],
        visual: DEF({ mode: 'intorno', preset: 'taglio', presets: ['taglio', 'rotazione', 'generico'], part: 'E', controls: ['preset', 'part', 'amp'] }),
      },
      {
        id: 'l26-10',
        kind: 'domanda',
        q: { id: 'l26-q3', kind: 'scelta', q: `In un punto il gradiente di spostamento $\\tens H$ è antisimmetrico. Che cosa puoi concludere?`, options: [`$\\tens E=\\tens O$: l'intorno subisce solo uno spostamento rigido infinitesimo, senza deformarsi`, `$\\tens E=\\tens H$: tutta la deformazione è pura`, `$\\tens W=\\tens O$`, `Il corpo è necessariamente fermo`], correct: 0, why: `Se $\\tens H\\in\\mathrm{Skw}$ allora $\\tens H=\\tens W$ e, per l'unicità della decomposizione, $\\tens E=\\tens O$ (§2.6.4). Il corpo può muoversi, perché ruota e trasla, ma non si deforma.` },
      },
      {
        id: 'l26-11',
        kind: 'spiega',
        title: 'Linearizzare i parametri di misura: gli strumenti',
        md: `Ora riprendiamo i parametri di misura della lezione sui parametri finiti e li semplifichiamo con l'ipotesi di piccole deformazioni (§2.6.5). Gli attrezzi sono tre approssimazioni al primo ordine, che la dispensa cita nella dimostrazione della Prop 2.6.6:
- $\\tens D\\simeq\\tens E$, appena ricavato;
- $\\sqrt{1+2x}\\simeq1+x$ per $x$ piccolo, l'analogo della tangente per la radice;
- $\\arcsin x\\simeq x$ per $x$ piccolo.

Cominciamo dalla dilatazione lineare. Nella teoria finita $\\varepsilon_n=\\sqrt{2\\tens D\\hat n\\cdot\\hat n+1}-1$. Sostituendo $\\tens D$ con $\\tens E$ e usando la radice approssimata con $x=\\tens E\\hat n\\cdot\\hat n$, si ottiene $\\varepsilon_n\\simeq1+\\tens E\\hat n\\cdot\\hat n-1$, cioè
$$\\varepsilon_n=\\tens E\\hat n\\cdot\\hat n.$$
La radice è sparita: la formula è lineare in $\\tens E$. Nel prossimo passo la scriviamo in componenti.`,
      },
      {
        id: 'l26-12',
        kind: 'derivazione',
        title: 'Dilatazione lineare linearizzata in componenti',
        md: `**Dove vogliamo arrivare:** $\\varepsilon_n=\\tens E\\hat n\\cdot\\hat n$ (Prop 2.6.6) scritta con le componenti di $\\tens E$ e di $\\hat n$. **L'idea:** sviluppiamo il prodotto tensore per vettore e poi il prodotto scalare, e raccogliamo i termini uguali grazie alla simmetria di $\\tens E$.`,
        source: D(2, '2.6.5', 'Prop 2.6.6', 26),
        der: {
          sample: (r) => { const o: R = {}; putMat(o, 'H', T.randMat(r)); putVec(o, 'n', T.unit(T.randVec(r))); return o; },
          lines: [
            { tex: '\\varepsilon_n=\\tens E\\hat n\\cdot\\hat n', why: `Partiamo dalla dilatazione linearizzata appena ottenuta.`, val: (v) => { const E = T.sym(mat(v, 'H')); const n = vec(v, 'n'); return T.dotv(T.apply(E, n), n); } },
            {
              tex: '=\\textstyle\\sum_{i,j}E_{ij}n_in_j',
              why: `La componente $i$ di $\\tens E\\hat n$ è $\\sum_jE_{ij}n_j$ (prodotto righe per colonna); il prodotto scalare con $\\hat n$ la moltiplica per $n_i$ e somma su $i$. Sono nove termini.`,
              aggiunto: true,
              val: (v) => { const E = T.sym(mat(v, 'H')); const n = vec(v, 'n'); let s = 0; for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) s += E[3 * i + j] * n[i] * n[j]; return s; },
            },
            {
              tex: '=E_{11}n_1^2+E_{22}n_2^2+E_{33}n_3^2+2E_{12}n_1n_2+2E_{23}n_2n_3+2E_{31}n_3n_1',
              why: `Raccogliamo. I tre termini con $i=j$ danno i quadrati. Gli altri sei vanno a coppie, per esempio $E_{12}n_1n_2$ e $E_{21}n_2n_1$, e sono uguali perché $\\tens E$ è simmetrico: ogni coppia diventa un termine doppio.`,
              ask: { q: `Da dove vengono i fattori 2?`, options: [`Dalla simmetria di $\\tens E$: $E_{12}n_1n_2+E_{21}n_2n_1=2E_{12}n_1n_2$`, `Dalla definizione di $\\gamma$`, `Dal procedimento formale`, `Sono un errore`], correct: 0, why: `Ogni termine fuori diagonale compare due volte nella somma, con gli indici scambiati, e i due sono uguali perché $E_{12}=E_{21}$ (osservazione dopo la Prop 2.6.6). Lo scorrimento e il procedimento formale non c'entrano con questo raccoglimento.` },
              val: (v) => { const E = T.sym(mat(v, 'H')); const n = vec(v, 'n'); return E[0] * n[0] ** 2 + E[4] * n[1] ** 2 + E[8] * n[2] ** 2 + 2 * E[1] * n[0] * n[1] + 2 * E[5] * n[1] * n[2] + 2 * E[6] * n[2] * n[0]; },
              eq: 'Prop 2.6.6',
            },
          ],
        },
      },
      {
        id: 'l26-13',
        kind: 'spiega',
        title: 'Leggere la formula in componenti',
        md: `La formula dice che la dilatazione di una fibra qualunque è una combinazione delle sei componenti di $\\tens E$, pesata dai prodotti delle componenti di $\\hat n$.

Un controllo: prendi la fibra lungo il primo asse, $\\hat n=\\hat e_1$, cioè $n_1=1$ e $n_2=n_3=0$. Tutti i termini spariscono tranne il primo, e resta $\\varepsilon_1=E_{11}$ (passaggio aggiunto). La componente diagonale di $\\tens E$ è proprio la dilatazione lungo quell'asse: lo ritroveremo tra poco come «interpretazione meccanica».

Un altro controllo: per una fibra a 45° nel piano 1-2, $n_1=n_2=1/\\sqrt2$, si ottiene $\\varepsilon_n=\\tfrac12(E_{11}+E_{22})+E_{12}$ (passaggio aggiunto): anche la componente fuori diagonale contribuisce all'allungamento delle fibre inclinate. È quello che hai visto nel modello con il taglio a 45°.`,
      },
      {
        id: 'l26-14',
        kind: 'spiega',
        title: 'Gli altri parametri linearizzati',
        md: `Con gli stessi attrezzi la Prop 2.6.6 linearizza anche gli altri parametri; la dispensa ne dà i cenni di dimostrazione.

**Scorrimento.** Nella formula finita il denominatore $(\\varepsilon_n+1)(\\varepsilon_m+1)$ vale 1 al primo ordine, e $\\arcsin x\\simeq x$ toglie il seno: $\\gamma_{n,m}=2\\tens E\\hat m\\cdot\\hat n$.

**Area.** Sotto la radice di $\\Delta S$ si tengono solo i termini di primo ordine: $\\Delta S_{n,m}=\\varepsilon_n+\\varepsilon_m$, per fibre ortogonali.

**Volume.** Si usa lo sviluppo $\\det(\\tens I+\\epsilon\\tens H)=1+\\epsilon\\operatorname{tr}\\tens H+O(\\epsilon^2)$, dove la traccia è la somma degli elementi diagonali. Poiché $\\tens H=\\tens E+\\tens W$ e un tensore antisimmetrico ha diagonale nulla, $\\operatorname{tr}\\tens W=0$, resta
$$\\Theta=\\operatorname{tr}\\tens E=\\operatorname{div}\\vet u.$$
L'ultima uguaglianza viene dal fatto che la traccia del gradiente di un campo è la sua divergenza (Modulo 1). Se $\\Theta\\equiv0$ la deformazione è **isocora** (non cambia i volumi) e il campo $\\vet u$ è **solenoidale**, cioè a divergenza nulla.

Ora tutti i parametri sono **lineari** in $\\tens E$.`,
      },
      {
        id: 'l26-15',
        kind: 'domanda',
        q: { id: 'l26-q4', kind: 'vf', q: `Nella teoria infinitesima la dilatazione volumica vale $\\Theta=\\det\\tens E$.`, answer: false, why: `$\\Theta=\\operatorname{tr}\\tens E=\\operatorname{div}\\vet u$ (Prop 2.6.6). Il determinante compariva nella teoria finita, ma di $\\tens F$, non di $\\tens E$: $\\Theta=\\det\\tens F-1$. Linearizzandolo resta la traccia, perché $\\det(\\tens I+\\epsilon\\tens H)=1+\\epsilon\\operatorname{tr}\\tens H+O(\\epsilon^2)$.` },
      },
      {
        id: 'l26-16',
        kind: 'spiega',
        title: 'Il significato delle componenti di E',
        md: `Con i parametri linearizzati possiamo dire che cosa significa ogni casella della matrice di $\\tens E$ (§2.6.6).

Sulla **diagonale**: $E_{ii}=\\tens E\\hat e_i\\cdot\\hat e_i=\\varepsilon_i$, la dilatazione della fibra lungo l'asse $i$.

**Fuori diagonale**, per $i\\ne j$: $E_{ij}=\\tens E\\hat e_j\\cdot\\hat e_i$, e confrontando con $\\gamma_{ij}=2\\tens E\\hat e_j\\cdot\\hat e_i$ si ottiene $E_{ij}=\\tfrac12\\gamma_{ij}$: **metà** dello scorrimento tra gli assi $i$ e $j$.

Quindi
$$[\\tens E]=\\begin{bmatrix}\\varepsilon_1&\\frac12\\gamma_{12}&\\frac12\\gamma_{13}\\\\ \\cdot&\\varepsilon_2&\\frac12\\gamma_{23}\\\\ \\cdot&\\cdot&\\varepsilon_3\\end{bmatrix},$$
dove i punti ricordano che la parte sotto la diagonale è uguale a quella sopra, per simmetria. È la risposta alla domanda d'orale sull'interpretazione meccanica delle componenti.`,
      },
      {
        id: 'l26-17',
        kind: 'domanda',
        q: { id: 'l26-q1', kind: 'vf', q: `In un riferimento in cui $[\\tens E]$ ha $E_{12}=0{,}01$, lo scorrimento tra gli assi 1 e 2 vale $0{,}01$.`, answer: false, why: `La componente fuori diagonale è metà dello scorrimento: $\\gamma_{12}=2E_{12}=0{,}02$ (§2.6.6). L'errore nasce dal leggere la matrice come se ogni casella fosse direttamente un parametro di misura: vale per la diagonale, non fuori.` },
      },
      {
        id: 'l26-18',
        kind: 'numeri',
        title: 'Teoria finita e teoria infinitesima a confronto',
        md: `Mettiamo alla prova la linearizzazione su un caso concreto: un taglio semplice con $H_{12}=0{,}05$, con le fibre lungo x e y. I numeri sono calcolati dal motore dell'app.

Teoria infinitesima: $\\varepsilon_x=${f(LIN_T.epsN)}$, $\\gamma_{xy}=2E_{12}=${f(LIN_T.gamma)}$, $\\Theta=${f(LIN_T.Theta)}$.

Teoria finita: $\\varepsilon_x=${f(FIN_T.epsN)}$, $\\varepsilon_y=${f(FIN_T.epsM, 4)}$, $\\gamma_{xy}=${f(FIN_T.gamma, 4)}$ rad, $\\Theta=${f(FIN_T.Theta)}$.

Le due teorie quasi coincidono. La differenza più visibile è che nella teoria finita la fibra y si allunga di circa $H_{12}^2/2$: è un effetto del secondo ordine, proprio il tipo di termine che la linearizzazione trascura. La dispensa (§2.10) lo dice così: le espressioni linearizzate differiscono da quelle esatte (per esempio la tangente di un angolo si confonde con l'angolo), ma ne sono il limite quando l'ampiezza della deformazione tende a zero.`,
        values: { epsLin: LIN_T.epsN, gammaLin: LIN_T.gamma, epsFinY: FIN_T.epsM, gammaFin: FIN_T.gamma },
        visual: DEF({ mode: 'intorno', preset: 'taglio', presets: ['taglio'], controls: ['amp', 'alpha'] }),
      },
      {
        id: 'l26-19',
        kind: 'spiega',
        title: 'Attenzione a…',
        md: `Tre errori tipici sul tensore di deformazione infinitesima.

1. **Scrivere $E_{12}=\\gamma_{12}$.** È tentante perché sulla diagonale ogni casella è direttamente un parametro, $E_{11}=\\varepsilon_1$. Fuori diagonale no: la componente è **metà** dello scorrimento, $E_{12}=\\tfrac12\\gamma_{12}$.
2. **Includere $\\tens W$ nella deformazione.** $\\tens W$ fa parte di $\\tens H$, ma descrive una rotazione rigida infinitesima: non cambia lunghezze né angoli, e quindi non genera tensioni. La deformazione è solo $\\tens E$.
3. **Dimenticare i fattori 2 dei doppi prodotti** in $\\varepsilon_n=\\sum_{ij}E_{ij}n_in_j$: i termini fuori diagonale compaiono due volte, per la simmetria di $\\tens E$.`,
      },
      {
        id: 'l26-20',
        kind: 'riassunto',
        md: `**Il filo della lezione.** Con l'ipotesi di piccole deformazioni scriviamo $\\tens F=\\tens I+\\epsilon\\tens H$, sviluppiamo, trascuriamo i termini in $\\epsilon^2$ e poniamo $\\epsilon=1$: il tensore di deformazione finita si riduce alla parte simmetrica del gradiente di spostamento, $\\tens E$, l'unica misura di deformazione della teoria infinitesima. La parte antisimmetrica $\\tens W$ descrive una rotazione rigida infinitesima, che non deforma e non genera tensioni. Con le approssimazioni al primo ordine tutti i parametri di misura diventano lineari in $\\tens E$, e le componenti di $\\tens E$ si leggono come dilatazioni (diagonale) e metà degli scorrimenti (fuori diagonale).

- Linearizzazione: $\\tens D\\simeq\\tfrac12(\\tens H+\\tens H^T)=\\tens E$ (Prop 2.6.3, Def 2.6.4).
- Congruenza: $\\tens E=\\tfrac12(\\nabla\\vet u+\\nabla\\vet u^T)$ (Teo 2.6.5).
- Decomposizione: $\\tens H=\\tens E+\\tens W$, $\\tens W=\\tfrac12(\\tens H-\\tens H^T)\\in\\mathrm{Skw}$ (§2.6.4).
- Parametri linearizzati: $\\varepsilon_n=\\tens E\\hat n\\cdot\\hat n$, $\\gamma_{n,m}=2\\tens E\\hat m\\cdot\\hat n$, $\\Delta S=\\varepsilon_n+\\varepsilon_m$, $\\Theta=\\operatorname{tr}\\tens E=\\operatorname{div}\\vet u$ (Prop 2.6.6).
- Componenti: $E_{ii}=\\varepsilon_i$, $E_{ij}=\\tfrac12\\gamma_{ij}$ (§2.6.6).`,
        orale: ['Linearizzare $\\tens D$ e ottenere $\\tens E$; ricavare i parametri di misura linearizzati. (dispensa, domanda 8)', 'Interpretazione meccanica delle componenti di $\\tens E$. (dispensa, domanda 9)'],
      },
    ],
  },
  // ================================================================== c2.7
  {
    concept: 'c2.7',
    title: 'Formula di rappresentazione e compatibilità',
    minutes: 28,
    source: D(2, '2.7–2.8', 'Teo 2.7.1, eq. (2.2)–(2.3), Teo 2.8.1–2.8.2', '27–29'),
    visual: DEF({ mode: 'rappresentazione', presets: ['taglio', 'rotazione', 'generico'], controls: ['preset', 'amp'] }),
    steps: [
      {
        id: 'l27-0',
        kind: 'spiega',
        title: 'Dove siamo e dove andiamo',
        md: `Nella lezione precedente abbiamo diviso il gradiente di spostamento in due parti: $\\tens H=\\tens E+\\tens W$, la deformazione pura più la rotazione rigida infinitesima. Questa lezione usa quella divisione in due direzioni.

La prima è la **formula di rappresentazione** (§2.7): se conosco lo spostamento di un punto $X$, quanto vale lo spostamento di un punto vicino $Y$? Vedremo che si scompone in tre pezzi con un significato fisico preciso, e capiremo quale pezzo è responsabile della deformazione e quindi, alla fine, della rottura.

La seconda è il **problema della compatibilità** (§2.8): finora siamo andati dallo spostamento alla deformazione, derivando. Ora ci chiediamo il contrario: se qualcuno mi dà un campo di deformazione $\\tens E$, esiste uno spostamento che lo produce? E se esiste, è unico? Le risposte sono due teoremi, di unicità e di esistenza (Saint-Venant).`,
      },
      {
        id: 'l27-1',
        kind: 'derivazione',
        title: 'Lo spostamento di un punto vicino in tre pezzi',
        md: `**Dove vogliamo arrivare:** lo spostamento $\\vet u(Y)$ di un punto $Y$ vicino a $X$, scritto con lo spostamento di $X$ e con i tensori $\\tens E$ e $\\tens W$. **L'idea:** partiamo dallo sviluppo di Taylor della deformazione (quello della lezione sullo studio locale, senza il resto), togliamo $Y$ a sinistra e a destra per far comparire gli spostamenti, e poi usiamo l'identità cinematica e la decomposizione. Ipotesi: piccole deformazioni e piccoli spostamenti, $\\|\\tens H\\|\\ll1$ e $|\\vet u|\\ll1$. Nel campione di controllo $f$ è affine, quindi Taylor è esatto. Guardiamo la componente $k$.`,
        source: D(2, '2.7', 'Teo 2.7.1', 27),
        der: {
          sample: (r) => { const o: R = { k: idx(r) }; putMat(o, 'H', T.scale(T.randMat(r), 0.1)); putVec(o, 'c', T.randVec(r)); putVec(o, 'X', T.randVec(r)); putVec(o, 'Y', T.randVec(r)); return o; },
          lines: [
            { tex: 'f(Y)-Y', why: `Questo è lo spostamento del punto $Y$, per la definizione $\\vet u(Y)=f(Y)-Y$. Per il controllo numerico l'app usa un campo affine $f(P)=\\vet c+(\\tens I+\\tens H)P$.`, val: (v) => { const F = T.add(T.I3, mat(v, 'H')); const Y = vec(v, 'Y'); return T.subv(T.addv(vec(v, 'c'), T.apply(F, Y)), Y)[v.k]; } },
            {
              tex: '=f(X)+\\tens F(Y-X)-Y',
              why: `Al posto di $f(Y)$ mettiamo lo sviluppo di Taylor attorno a $X$, senza il resto: $f(Y)=f(X)+\\tens F(Y-X)$.`,
              aggiunto: true,
              val: (v) => { const F = T.add(T.I3, mat(v, 'H')); const X = vec(v, 'X'); const Y = vec(v, 'Y'); return T.subv(T.addv(T.addv(vec(v, 'c'), T.apply(F, X)), T.apply(F, T.subv(Y, X))), Y)[v.k]; },
            },
            {
              tex: '=f(X)-X+\\tens F(Y-X)-(Y-X)',
              why: `Scriviamo $Y$ come $X+(Y-X)$: è aggiungere e togliere $X$. Così compare $f(X)-X$, che è uno spostamento, e compare due volte il vettore $Y-X$.`,
              aggiunto: true,
              val: (v) => { const F = T.add(T.I3, mat(v, 'H')); const X = vec(v, 'X'); const d = T.subv(vec(v, 'Y'), X); const uX = T.subv(T.addv(vec(v, 'c'), T.apply(F, X)), X); return T.subv(T.addv(uX, T.apply(F, d)), d)[v.k]; },
            },
            {
              tex: '=f(X)-X+(\\tens F-\\tens I)(Y-X)',
              why: `Raccogliamo $Y-X$: il vettore da solo è $\\tens I(Y-X)$, e per la linearità dei tensori $\\tens F(Y-X)-\\tens I(Y-X)=(\\tens F-\\tens I)(Y-X)$.`,
              val: (v) => { const H = mat(v, 'H'); const F = T.add(T.I3, H); const X = vec(v, 'X'); const uX = T.subv(T.addv(vec(v, 'c'), T.apply(F, X)), X); return T.addv(uX, T.apply(H, T.subv(vec(v, 'Y'), X)))[v.k]; },
            },
            {
              tex: '=\\vet u(X)+\\tens H(Y-X)',
              why: `Riconosciamo due oggetti noti: $f(X)-X$ è lo spostamento $\\vet u(X)$, e $\\tens F-\\tens I$ è il gradiente di spostamento $\\tens H$, per l'identità cinematica fondamentale.`,
              aggiunto: true,
              val: (v) => { const H = mat(v, 'H'); const X = vec(v, 'X'); const uX = T.addv(vec(v, 'c'), T.apply(H, X)); return T.addv(uX, T.apply(H, T.subv(vec(v, 'Y'), X)))[v.k]; },
            },
            {
              tex: '=\\vet u(X)+(\\tens E+\\tens W)(Y-X)',
              why: `Dividiamo $\\tens H$ nella sua parte simmetrica e antisimmetrica, $\\tens H=\\tens E+\\tens W$: è il primo teorema di decomposizione, usato nella lezione precedente.`,
              ask: { q: `Che cosa diventa $\\tens H$?`, options: [`$\\tens E+\\tens W$`, `$\\tens E$ soltanto`, `$\\tens W$ soltanto`, `$\\tens D$`], correct: 0, why: `Ogni tensore è somma unica della sua parte simmetrica $\\tens E$ e antisimmetrica $\\tens W$. Tenere solo $\\tens E$ butterebbe via la rotazione, tenere solo $\\tens W$ la deformazione; $\\tens D$ è il tensore della teoria finita, non una parte di $\\tens H$.` },
              val: (v) => { const H = mat(v, 'H'); const X = vec(v, 'X'); const uX = T.addv(vec(v, 'c'), T.apply(H, X)); return T.addv(uX, T.apply(T.add(T.sym(H), T.skw(H)), T.subv(vec(v, 'Y'), X)))[v.k]; },
            },
            {
              tex: '\\vet u(Y)=\\underbrace{\\vet u(X)}_{\\text{trasl.}}+\\underbrace{\\tens W(Y-X)}_{\\text{rot. rigida inf.}}+\\underbrace{\\tens E(Y-X)}_{\\vet u^{dp}}',
              why: `Distribuiamo il prodotto e diamo un nome a ciascuno dei tre contributi: la traslazione rigida, la rotazione rigida infinitesima e lo spostamento di deformazione pura $\\vet u^{dp}$.`,
              val: (v) => { const H = mat(v, 'H'); const X = vec(v, 'X'); const d = T.subv(vec(v, 'Y'), X); const uX = T.addv(vec(v, 'c'), T.apply(H, X)); return (T.addv(T.addv(uX, T.apply(T.skw(H), d)), T.apply(T.sym(H), d)))[v.k]; },
              eq: 'Teo 2.7.1',
            },
          ],
          checks: [{ what: 'W(Y−X) ⊥ (Y−X)', f: (v) => { const d = T.subv(vec(v, 'Y'), vec(v, 'X')); return [T.dotv(T.apply(T.skw(mat(v, 'H')), d), d), 0]; } }],
        },
      },
      {
        id: 'l27-1b',
        kind: 'spiega',
        title: 'Leggere la formula di rappresentazione',
        md: `Il Teo 2.7.1 dice che lo spostamento del punto vicino $Y$ si ottiene sommando tre pezzi.
- $\\vet u(X)$: $Y$ si muove come $X$. È una **traslazione rigida**, uguale per tutto l'intorno.
- $\\tens W(Y-X)$: $Y$ ruota attorno a $X$. Dal Modulo 1, un tensore antisimmetrico agisce come un prodotto vettoriale con il suo vettore assiale $\\vet w$: $\\tens W(Y-X)=\\vet w\\wedge(Y-X)$, che è **ortogonale** a $Y-X$. È la **rotazione rigida infinitesima**.
- $\\tens E(Y-X)$: il resto, lo **spostamento di deformazione pura**, $\\vet u^{dp}:=\\tens E(Y-X)$.

I primi due insieme formano lo **spostamento rigido infinitesimo**, una rototraslazione. Controllo: se l'intorno subisce solo una rotazione rigida infinitesima, $\\tens E=\\tens O$ e il terzo pezzo sparisce, come deve.`,
      },
      {
        id: 'l27-2',
        kind: 'prova',
        title: 'Costruisci u(Y) come nella figura di p. 27',
        md: `Il modello ripete la costruzione della figura di p. 27. Partendo da $Y$: prima la traslazione $\\vet u(X)$ (freccia arancio), poi la rotazione $\\tens W(Y-X)$ (rossa), poi la deformazione pura $\\vet u^{dp}=\\tens E(Y-X)$ (viola). La somma delle tre è $\\vet u(Y)$ (blu).`,
        tasks: [
          `Scegli «rotazione rigida infinitesima»: manca il pezzo viola, perché $\\vet u^{dp}=\\vet 0$. Il punto $Y$ si muove, ma solo rigidamente.`,
          `Guarda dall'alto: il pezzo rosso è ortogonale al tratteggio $Y-X$. Per questo la rotazione non cambia la distanza tra $X$ e $Y$.`,
          `Con «generico» compaiono tutti e tre i pezzi. Solo quello viola cambia la distanza tra i due punti.`,
        ],
        visual: DEF({ mode: 'rappresentazione', preset: 'taglio', presets: ['taglio', 'rotazione', 'generico'], controls: ['preset', 'amp'] }),
      },
      {
        id: 'l27-3',
        kind: 'spiega',
        title: 'Che cosa deforma davvero: il trampolino',
        md: `La formula dice una cosa forte: fino alla rotazione rigida la distanza tra $X$ e $Y$ non cambia, perché la traslazione sposta i due punti insieme e la rotazione sposta $Y$ ortogonalmente a $Y-X$. **Solo lo spostamento di deformazione pura cambia la configurazione dal punto di vista deformativo.**

L'esempio della dispensa è il **trampolino**: una mensola caricata in punta, che si inflette. Ingrandiamo attorno a due punti vicini $X$ e $Y$. Se il tratto oltre $X$ fosse rigido, $Y$ subirebbe la stessa traslazione di $X$ e poi si sposterebbe lungo la tangente alla deformata in $X$: è la rotazione rigida. Ma il trampolino non è rigido: c'è un contributo in più, che porta $Y$ fino alla deformata effettiva. Quel contributo è la deformazione pura.

Da qui la conclusione della dispensa: **un corpo si può rompere solo per effetto della deformazione pura**. Traslare e ruotare un corpo, da soli, non lo danneggiano.`,
      },
      {
        id: 'l27-3b',
        kind: 'domanda',
        q: { id: 'l27-q2', kind: 'scelta', q: `Due punti vicini $X$ e $Y$: quale termine della formula di rappresentazione può cambiare la loro distanza?`, options: [`$\\tens E(Y-X)$, lo spostamento di deformazione pura`, `$\\tens W(Y-X)$, perché fa ruotare $Y$`, `$\\vet u(X)$, perché sposta tutto l'intorno`, `Nessuno: nella teoria infinitesima le distanze non cambiano`], correct: 0, why: `La traslazione sposta $X$ e $Y$ dello stesso vettore; la rotazione sposta $Y$ ortogonalmente a $Y-X$, quindi al primo ordine non ne cambia la lunghezza. Resta solo $\\vet u^{dp}=\\tens E(Y-X)$ (§2.7). Se nessun termine cambiasse le distanze, non ci sarebbe deformazione da studiare.` },
      },
      {
        id: 'l27-4',
        kind: 'spiega',
        title: 'Il problema diretto e il problema inverso',
        md: `Passiamo alla seconda parte. L'equazione di congruenza della lezione precedente lega spostamenti e deformazioni:
$$\\tens E(X)=\\tfrac12\\big(\\nabla\\vet u(X)+\\nabla\\vet u^T(X)\\big)\\qquad(2.2)$$

Si può leggere in due versi.
- **Problema diretto**: dato lo spostamento $\\vet u$, trovare $\\tens E$. Basta derivare, cioè calcolare il gradiente e prenderne la parte simmetrica: si può sempre fare.
- **Problema inverso**, o **di compatibilità**: dato un campo $\\tens E$ simmetrico e regolare, esiste uno spostamento $\\vet u$ che lo produce? **Non sempre.**

Perché il verso inverso è più difficile? Scritta in componenti, la (2.2) dà 6 equazioni alle derivate parziali (una per ogni componente indipendente di $\\tens E$, come $\\partial u_1/\\partial X_1=E_{11}$) in sole 3 incognite, le componenti di $\\vet u$. Ci sono più equazioni che incognite: la soluzione può non esistere e, se esiste, può non essere unica.`,
      },
      {
        id: 'l27-4b',
        kind: 'spiega',
        title: 'Perché ci interessa che il problema sia ben posto',
        md: `Ci si potrebbe chiedere perché preoccuparsi di esistenza e unicità: non basta calcolare?

La dispensa risponde con un'osservazione pratica. Nella realtà le soluzioni si calcolano al computer, numericamente. Se il problema è mal posto, cioè non ha soluzione o ne ha molte, il computer restituisce **comunque un numero**: un numero che però è frutto solo della propagazione degli errori di calcolo, e non ha alcun significato fisico.

I teoremi di esistenza e unicità sono la garanzia che il numero calcolato descriva davvero qualcosa. Nei prossimi due passi vediamo prima l'unicità, poi l'esistenza.`,
      },
      {
        id: 'l27-5',
        kind: 'spiega',
        title: 'Unicità: a meno di un moto rigido',
        md: `Il Teo 2.8.1 (unicità) dice: dato $\\tens E$, la soluzione $\\vet u$, se esiste, è **unica a meno di uno spostamento rigido infinitesimo**. In formula, due soluzioni differiscono per uno spostamento rigido: $\\vet u_1=\\vet u_2+\\vet u^\\infty$.

Il motivo si capisce con la formula di rappresentazione: la differenza di due soluzioni ha deformazione nulla, perché entrambe producono lo stesso $\\tens E$; e uno spostamento con $\\tens E=\\tens O$ è fatto solo di traslazione e rotazione rigida.

Fisicamente: conoscere come è deformato un corpo non dice **dove** si trova. L'esempio della dispensa è un aereo in volo: si può sapere come è deformato, ma non la sua posizione. Se invece il corpo è vincolato in modo da impedire i moti rigidi, come un edificio fondato al suolo, l'unicità diventa incondizionata.

Una nota sul nome: la dispensa chiama questo teorema «di Kirchhoff», ma avverte che il teorema di Kirchhoff del problema elastico, che si vedrà con i legami costitutivi, è un'altra cosa (nota NF-04).`,
      },
      {
        id: 'l27-5b',
        kind: 'domanda',
        q: { id: 'l27-q3', kind: 'vf', q: `Dato un campo $\\tens E$ compatibile, lo spostamento $\\vet u$ che lo produce è unico.`, answer: false, why: `È unico solo a meno di uno spostamento rigido infinitesimo (Teo 2.8.1): aggiungendo una traslazione e una rotazione rigida infinitesima $\\tens E$ non cambia. Diventa unico in senso stretto solo se i vincoli impediscono i moti rigidi.` },
      },
      {
        id: 'l27-6a',
        kind: 'spiega',
        title: 'Esistenza: la condizione di Saint-Venant',
        md: `Resta la domanda più delicata: quando esiste uno spostamento che produce un dato $\\tens E$? La risposta è il Teo 2.8.2 (esistenza, di Saint-Venant), che la dispensa enuncia senza dimostrazione.

La **condizione necessaria** è
$$\\operatorname{rot}\\big(\\operatorname{rot}\\tens E(X)\\big)=\\tens O\\qquad\\forall X\\qquad(2.3)$$
dove il rotore è l'operatore di derivazione del Modulo 1 (§1.8), qui applicato due volte al campo tensoriale $\\tens E$. In componenti sono 6 **equazioni di Saint-Venant**, del tipo
$$\\frac{\\partial^2E_{11}}{\\partial X_2^2}+\\frac{\\partial^2E_{22}}{\\partial X_1^2}=2\\frac{\\partial^2E_{12}}{\\partial X_1\\partial X_2}$$
più le analoghe ottenute permutando gli indici e tre miste.

La condizione è anche **sufficiente** se il corpo è **semplicemente connesso**: ogni curva chiusa tracciata nel corpo si può ridurre con continuità a un punto senza uscire dal corpo. Un corpo con una cavità passante, come un anello, non lo è: una curva che gira attorno al buco non si può stringere fino a un punto.`,
      },
      {
        id: 'l27-6b',
        kind: 'spiega',
        title: 'Che cosa vuol dire «compatibile»: le tessere',
        md: `La dispensa dà un'interpretazione meccanica della compatibilità che aiuta a ricordarla.

Immagina di dividere il corpo in tante **tessere** infinitesime, come un mosaico. Ognuna si deforma in modo omogeneo, secondo il valore di $\\tens E$ nel suo punto: si allunga, si accorcia, si inclina. Ora prova a rimettere insieme le tessere deformate. Se si ricompongono **senza vuoti né sovrapposizioni**, il campo è compatibile: esiste uno spostamento continuo che le porta tutte al loro posto. Se invece restano buchi o tessere che si accavallano, il campo non è compatibile: nessuno spostamento lo produce.

Le equazioni di Saint-Venant sono la traduzione matematica di «le tessere combaciano». Il modello del prossimo passo mostra proprio questa figura (p. 29).`,
      },
      {
        id: 'l27-6',
        kind: 'prova',
        title: 'Le tessere (figura di p. 29)',
        md: `Il corpo è diviso in tessere, ciascuna deformata in modo omogeneo secondo $\\tens E$ nel suo punto. Il campo è compatibile se le tessere deformate si ricompongono senza vuoti né sovrapposizioni.`,
        tasks: [
          `Nel campo compatibile ($E_{11}=c\\,y$, come in una flessione) le tessere ruotano e si richiudono: il residuo dell'equazione di Saint-Venant è 0.`,
          `Nel campo non compatibile ($E_{11}=c\\,y^2$) le righe di tessere hanno lunghezze che nessun moto rigido riesce a riconciliare: il residuo vale $2c$, perché $\\partial^2E_{11}/\\partial y^2=2c$ non è bilanciato da altri termini.`,
        ],
        visual: { kind: 'svg', id: 'compatibilita' },
      },
      {
        id: 'l27-7',
        kind: 'domanda',
        q: { id: 'l27-q1', kind: 'scelta', q: `Per un corpo con un foro passante, la condizione (2.3) è…`, options: [`necessaria ma non sufficiente`, `necessaria e sufficiente`, `né necessaria né sufficiente`, `sufficiente ma non necessaria`], correct: 0, why: `Teo 2.8.2: la (2.3) è sempre necessaria; diventa anche sufficiente solo se il corpo è semplicemente connesso, e con una cavità passante non lo è. «Necessaria e sufficiente» vale per i corpi senza buchi passanti.` },
      },
      {
        id: 'l27-7b',
        kind: 'spiega',
        title: 'Attenzione a…',
        md: `Quattro errori tipici su questa lezione.

1. **Dire che $\\tens W(Y-X)$ cambia la distanza tra $X$ e $Y$.** È tentante perché $\\tens W$ sposta davvero il punto $Y$. Ma lo sposta ortogonalmente a $Y-X$, quindi al primo ordine la distanza resta la stessa.
2. **Credere che ogni campo $\\tens E$ simmetrico venga da uno spostamento.** Il problema inverso ha 6 equazioni in 3 incognite: serve la condizione $\\operatorname{rot}\\operatorname{rot}\\tens E=\\tens O$.
3. **Dimenticare la semplice connessione.** Senza di essa la condizione di Saint-Venant è solo necessaria.
4. **Confondere l'unicità della compatibilità (Teo 2.8.1) con il teorema di Kirchhoff del problema elastico (Teo 5.1.1).** Il primo riguarda il problema cinematico, il secondo il problema elastico con i legami costitutivi.`,
      },
      {
        id: 'l27-8',
        kind: 'riassunto',
        md: `**Il filo della lezione.** Partendo da Taylor e togliendo $Y-X$, lo spostamento di un punto vicino si scompone in tre pezzi: la traslazione di $X$, una rotazione rigida infinitesima ortogonale a $Y-X$, e lo spostamento di deformazione pura $\\tens E(Y-X)$. Solo l'ultimo cambia le distanze, e quindi solo lui può rompere un corpo, come mostra il trampolino. Il problema inverso, trovare $\\vet u$ dato $\\tens E$, ha più equazioni che incognite: la soluzione è unica a meno di un moto rigido, ed esiste se vale la condizione di Saint-Venant, che è anche sufficiente per corpi semplicemente connessi. Compatibile vuol dire che le tessere deformate si ricompongono senza vuoti né sovrapposizioni.

- Formula di rappresentazione: $\\vet u(Y)=\\vet u(X)+\\tens W(Y-X)+\\tens E(Y-X)$ (Teo 2.7.1); $\\tens W(Y-X)\\perp(Y-X)$.
- Compatibilità: $\\tens E=\\tfrac12(\\nabla\\vet u+\\nabla\\vet u^T)$ (eq. 2.2).
- Unicità a meno di uno spostamento rigido infinitesimo (Teo 2.8.1), da non confondere con Kirchhoff (Teo 5.1.1).
- Saint-Venant: $\\operatorname{rot}\\operatorname{rot}\\tens E=\\tens O$, sufficiente se il corpo è semplicemente connesso (eq. 2.3, Teo 2.8.2).`,
        orale: ['Formula di rappresentazione: significato dei tre termini; che cosa misura $\\tens E$ e che cosa $\\tens W$. (dispensa, domanda 10)', 'Problema di compatibilità: teorema di unicità e teorema di Saint-Venant; ruolo della semplice connessione. (dispensa, domanda 11)'],
      },
    ],
  },
  // ================================================================== c2.8
  {
    concept: 'c2.8',
    title: 'Direzioni e dilatazioni principali',
    minutes: 36,
    source: D(2, '2.9–2.10', 'Def 2.9.1, Teo 2.9.2–2.9.3, Prop 2.9.4', '29–33'),
    visual: DEF({ mode: 'ellissoide', presets: ['generico', 'rivoluzione', 'omotetia', 'piana', 'allungamento'], controls: ['preset', 'amp', 'probe'] }),
    steps: [
      {
        id: 'l28-0',
        kind: 'spiega',
        title: 'Dove siamo e dove andiamo',
        md: `Nella lezione precedente abbiamo isolato lo spostamento di deformazione pura, $\\vet u^{dp}=\\tens E(Y-X)$, l'unico pezzo che cambia davvero la forma. Ora lo studiamo più da vicino, con una domanda geometrica: **esistono direzioni in cui la deformazione pura allunga o accorcia le fibre senza farle inclinare?**

La risposta è sì, e quelle direzioni, le **direzioni principali**, sono il riferimento più naturale per descrivere la deformazione in un punto. Le tappe: tradurre la domanda in un problema di autovalori; il teorema spettrale, che garantisce che le direzioni esistano e siano ortogonali; l'equazione secolare per trovarle; i tre casi possibili, con l'immagine di una sfera che diventa un ellissoide; la proprietà di estremo; infine i casi con dilatazioni principali nulle.

Molti di questi strumenti torneranno identici nel capitolo 3 per le tensioni principali.`,
      },
      {
        id: 'l28-1',
        kind: 'spiega',
        title: 'La domanda: fibre che non si inclinano',
        md: `Prendi una fibra uscente da $X$ in direzione $\\hat n$, e un suo punto $Y$. Lo spostamento di deformazione pura di $Y$ è $\\vet u^{dp}=\\tens E(Y-X)=|Y-X|\\,\\tens E\\hat n$ (§2.9.1). In generale il vettore $\\tens E\\hat n$ **non è parallelo** a $\\hat n$: la fibra, oltre ad allungarsi, si inclina.

Ci chiediamo se esistano direzioni $\\hat n$ per cui $\\tens E\\hat n$ è parallelo a $\\hat n$. Se esistono si chiamano **direzioni principali**, e il valore di $\\varepsilon_n$ lungo di esse si chiama **dilatazione principale** (Def 2.9.1).

«Parallelo» vuol dire che $\\tens E\\hat n$ è un multiplo di $\\hat n$: $\\tens E\\hat n=\\lambda\\hat n$ per un numero $\\lambda$. Portando tutto a sinistra,
$$(\\tens E-\\lambda\\tens I)\\hat n=\\vet 0.$$
Dal Modulo 1 riconosci il **problema degli autovalori**: $\\lambda$ è un autovalore di $\\tens E$ e $\\hat n$ un autovettore. La coppia $(\\lambda,\\hat n)$ si chiama **autocoppia**. Nota che lungo una direzione principale $\\varepsilon_n=\\tens E\\hat n\\cdot\\hat n=\\lambda\\,\\hat n\\cdot\\hat n=\\lambda$: l'autovalore è proprio la dilatazione principale.`,
      },
      {
        id: 'l28-1b',
        kind: 'domanda',
        q: { id: 'l28-q2', kind: 'scelta', q: `In un punto si trova $\\tens E\\hat n=0{,}003\\,\\hat n$. Che cosa puoi dire della fibra $\\hat n$?`, options: [`È una direzione principale, con dilatazione principale $0{,}003$`, `Non si allunga, perché $\\tens E\\hat n$ è parallelo a $\\hat n$`, `Si inclina di $0{,}003$ radianti`, `È ortogonale a tutte le altre fibre`], correct: 0, why: `$\\tens E\\hat n=\\lambda\\hat n$ è la definizione di autocoppia, quindi $\\hat n$ è principale e $\\varepsilon_n=\\tens E\\hat n\\cdot\\hat n=0{,}003$ (Def 2.9.1). «Parallelo» vuol dire che non si inclina, non che non si allunga.` },
      },
      {
        id: 'l28-2a',
        kind: 'spiega',
        title: 'Il teorema spettrale: che cosa promette',
        md: `Un problema agli autovalori può anche non avere soluzioni reali. Per $\\tens E$ la situazione è buona, grazie al **teorema spettrale** (Teo 2.9.2): per ogni tensore simmetrico,
- a) esistono **almeno tre autocoppie reali**;
- b) ad autovalori **distinti** corrispondono autovettori **ortogonali**.

L'unica ipotesi è la **simmetria**, e $\\tens E$ è simmetrico per costruzione (è la parte simmetrica di $\\tens H$). Per un tensore non simmetrico gli autovalori possono essere complessi, e allora non ci sarebbero direzioni reali da cercare.

Le tre direzioni principali, ortogonali tra loro, formano il **sistema di riferimento principale di deformazione**. La parte b) è quella che la dispensa dimostra, e la vediamo nel prossimo passo.`,
      },
      {
        id: 'l28-2',
        kind: 'derivazione',
        title: 'Teorema spettrale, parte b)',
        md: `**Dove vogliamo arrivare:** se $\\lambda_1\\ne\\lambda_2$, allora $\\hat n_1\\cdot\\hat n_2=0$. **L'idea:** calcoliamo la stessa quantità, $\\tens E\\hat n_1\\cdot\\hat n_2$, in due modi diversi: una volta facendo agire $\\tens E$ su $\\hat n_1$, una volta spostandolo su $\\hat n_2$. I due risultati devono coincidere, e questo forza l'ortogonalità. Nel campione di controllo $\\hat n_1$ e $\\hat n_2$ sono autovettori veri di un $\\tens E$ casuale, quindi ogni riga vale zero.`,
        source: D(2, '2.9.1', 'Teo 2.9.2', 30),
        der: {
          sample: (r) => { const o: R = {}; const E = T.sym(T.randMat(r)); putMat(o, 'E', E); const s = eigSym(E); putVec(o, 'a', s.vectors[0]); putVec(o, 'b', s.vectors[1]); o.l1 = s.values[0]; o.l2 = s.values[1]; putVec(o, 'p', T.randVec(r)); putVec(o, 'q', T.randVec(r)); return o; },
          lines: [
            { tex: '\\lambda_1\\,\\hat n_1\\cdot\\hat n_2=\\tens E\\hat n_1\\cdot\\hat n_2', why: `Partiamo dalla prima autocoppia: $\\tens E\\hat n_1=\\lambda_1\\hat n_1$. Ne facciamo il prodotto scalare con $\\hat n_2$.`, val: (v) => v.l1 * T.dotv(vec(v, 'a'), vec(v, 'b')) },
            { tex: '=\\hat n_1\\cdot\\tens E^T\\hat n_2', why: `Spostiamo $\\tens E$ dall'altra parte del prodotto scalare. È la definizione di trasposto: passando dall'altro lato, il tensore diventa il suo trasposto.`, val: (v) => T.dotv(vec(v, 'a'), T.apply(T.transpose(mat(v, 'E')), vec(v, 'b'))) },
            {
              tex: '=\\hat n_1\\cdot\\tens E\\hat n_2',
              why: `Qui usiamo l'unica ipotesi del teorema: $\\tens E$ è simmetrico, cioè uguale al suo trasposto, $\\tens E^T=\\tens E$.`,
              aggiunto: true,
              ask: { q: `Quale ipotesi si usa in questo passaggio?`, options: [`$\\tens E$ è simmetrico`, `$\\lambda_1\\ne\\lambda_2$`, `$\\det\\tens E\\ne0$`, `$\\tens E$ è definito positivo`], correct: 0, why: `Per togliere il trasposto serve $\\tens E^T=\\tens E$, la simmetria, unica ipotesi del teorema spettrale. L'ipotesi $\\lambda_1\\ne\\lambda_2$ servirà solo all'ultima riga; determinante e definita positività non sono richiesti.` },
              val: (v) => T.dotv(vec(v, 'a'), T.apply(mat(v, 'E'), vec(v, 'b'))),
            },
            {
              tex: '=\\lambda_2\\,\\hat n_1\\cdot\\hat n_2',
              why: `Ora $\\tens E$ agisce su $\\hat n_2$, e usiamo la seconda autocoppia: $\\tens E\\hat n_2=\\lambda_2\\hat n_2$.`,
              val: (v) => v.l2 * T.dotv(vec(v, 'a'), vec(v, 'b')),
            },
            {
              tex: '\\Rightarrow\\ (\\lambda_1-\\lambda_2)\\,\\hat n_1\\cdot\\hat n_2=0',
              why: `Il primo membro e l'ultimo sono uguali: sottraendoli e raccogliendo $\\hat n_1\\cdot\\hat n_2$ si ottiene zero.`,
              aggiunto: true,
            },
            { tex: '\\Rightarrow\\ \\hat n_1\\cdot\\hat n_2=0\\ \\text{ se }\\lambda_1\\ne\\lambda_2', why: `Un prodotto di due numeri è nullo solo se uno dei due è nullo. Se gli autovalori sono distinti, il primo fattore non è zero, quindi deve esserlo il prodotto scalare: gli autovettori sono ortogonali.`, eq: 'Teo 2.9.2' },
          ],
          checks: [{ what: 'per vettori qualunque E a·b = a·E b (simmetria)', f: (v) => [T.dotv(T.apply(mat(v, 'E'), vec(v, 'p')), vec(v, 'q')), T.dotv(vec(v, 'p'), T.apply(mat(v, 'E'), vec(v, 'q')))] }],
        },
      },
      {
        id: 'l28-2b',
        kind: 'spiega',
        title: 'Che cosa ci dà il teorema spettrale',
        md: `La dimostrazione mostra dove serve la simmetria: senza, non potremmo far «saltare» $\\tens E$ da $\\hat n_1$ a $\\hat n_2$ senza cambiarlo nel suo trasposto, e l'argomento crollerebbe.

Il risultato ha una conseguenza pratica. In ogni punto del corpo esistono tre direzioni mutuamente ortogonali, quelle principali, lungo cui le fibre si allungano o si accorciano **senza inclinarsi**. Sono un sistema di riferimento privilegiato, scelto dalla deformazione stessa e non da noi.

Un controllo semplice: se in un certo riferimento la matrice di $\\tens E$ è già diagonale, i vettori della base sono autovettori, perché $\\tens E\\hat e_1=E_{11}\\hat e_1$ e così via (passaggio aggiunto). Quel riferimento è già quello principale. Il problema generale è trovarlo quando la matrice non è diagonale: è il compito dell'equazione secolare.`,
      },
      {
        id: 'l28-3',
        kind: 'spiega',
        title: 'Come si trovano: l\'equazione secolare di Laplace',
        md: `Il sistema $(\\tens E-\\lambda\\tens I)\\hat n=\\vet 0$ è lineare e **omogeneo** (il termine noto è zero). Ha sempre la soluzione banale $\\hat n=\\vet 0$, che non ci interessa perché non è un versore. Ha soluzioni non banali, infinite, solo se la matrice dei coefficienti non ha rango massimo, cioè se il suo determinante è nullo. Il Teo 2.9.3 dà allora la condizione necessaria e sufficiente:
$$\\det(\\tens E-\\lambda\\tens I)=0\\iff\\lambda^3-I\\lambda^2+II\\lambda-III=0.$$
È l'**equazione secolare di Laplace**, di terzo grado in $\\lambda$. I suoi coefficienti sono gli **invarianti** di $\\tens E$:
- $I=\\operatorname{tr}\\tens E=E_{11}+E_{22}+E_{33}$, lineare;
- $II=\\tfrac12\\big[(\\operatorname{tr}\\tens E)^2-\\operatorname{tr}\\tens E^2\\big]$, la somma dei minori principali di ordine 2, quadratico;
- $III=\\det\\tens E$, cubico.

Si chiamano invarianti perché **non dipendono dal riferimento**, come le radici dell'equazione. Trovata una radice $\\lambda^*$, la direzione si ricava da $(\\tens E-\\lambda^*\\tens I)\\hat n^*=\\vet 0$ insieme alla normalizzazione $\\hat n^*\\cdot\\hat n^*=1$, che sceglie il versore tra le infinite soluzioni.`,
      },
      {
        id: 'l28-3b',
        kind: 'domanda',
        q: { id: 'l28-q3', kind: 'vf', q: `Cambiando il sistema di riferimento cambiano le componenti di $\\tens E$, e quindi cambia anche il suo invariante $I=\\operatorname{tr}\\tens E$.`, answer: false, why: `Le singole componenti cambiano, ma la loro somma sulla diagonale no: $I$, $II$ e $III$ sono invarianti, non dipendono dal riferimento, e per questo neppure le radici dell'equazione secolare (Teo 2.9.3). È coerente: le dilatazioni principali sono proprietà del punto, non della base.` },
      },
      {
        id: 'l28-4',
        kind: 'prova',
        title: 'Sfera → ellissoide: i tre casi',
        md: `La sfera tratteggiata è un intorno di $X$; la superficie azzurra è la sua immagine sotto la sola deformazione pura $\\tens I+k\\tens E$, con $k$ amplificazione. Gli assi colorati sono le direzioni principali.`,
        tasks: [
          `«generico»: radici distinte, la sfera diventa un **ellissoide triassiale**, con tre semiassi diversi. Gli assi principali restano ortogonali.`,
          `«rivoluzione»: radice doppia, ellissoide di rivoluzione (un «pallone da rugby»). Nel piano ortogonale a $\\hat n_3$ nessuna direzione è privilegiata.`,
          `«omotetia»: radice tripla, la sfera resta sfera, solo più grande o più piccola (deformazione omotetica).`,
          `Muovi la fibra di prova $\\hat m$: il vettore $\\tens E\\hat m$ è parallelo a $\\hat m$ solo quando $\\hat m$ è lungo un asse principale.`,
        ],
        visual: DEF({ mode: 'ellissoide', preset: 'generico', presets: ['generico', 'rivoluzione', 'omotetia'], controls: ['preset', 'amp', 'probe'] }),
      },
      {
        id: 'l28-5',
        kind: 'spiega',
        title: 'Primo caso: tre radici distinte',
        md: `L'equazione secolare ha tre radici, e il loro numero di coincidenze divide lo studio in tre casi (§2.9.3).

**Caso 1, radici distinte.** Ci sono tre autocoppie e, per la parte b) del teorema spettrale, i tre autovettori sono ortogonali: formano il sistema principale di deformazione. In esso la matrice è diagonale, $[\\tens E]=\\operatorname{diag}(\\lambda_1,\\lambda_2,\\lambda_3)$, e il tensore si scrive come somma di diadi (il prodotto tensoriale $\\hat n\\otimes\\hat n$ del Modulo 1, il proiettore sulla direzione $\\hat n$):
$$\\tens E=\\lambda_1\\hat n_1\\otimes\\hat n_1+\\lambda_2\\hat n_2\\otimes\\hat n_2+\\lambda_3\\hat n_3\\otimes\\hat n_3.$$

Che cosa vuol dire fisicamente? Sulla diagonale ci sono le dilatazioni principali, $\\varepsilon_n=\\lambda$. E gli scorrimenti tra direzioni principali sono nulli: $\\gamma_{ij}=2\\tens E\\hat n_j\\cdot\\hat n_i=2\\lambda_j\\hat n_j\\cdot\\hat n_i=0$. Le direzioni principali **restano ortogonali**. Una sfera materiale diventa un **ellissoide triassiale**. Gli scorrimenti che compaiono in un riferimento non principale sono solo un effetto della scelta della base.`,
      },
      {
        id: 'l28-5b',
        kind: 'spiega',
        title: 'Radici multiple: rugby e omotetia',
        md: `**Caso 2, radice doppia**: $\\lambda_1=\\lambda_2=\\lambda\\ne\\lambda_3$. Ci sono $\\infty^1$ autocoppie: oltre a $\\hat n_3$, è principale **ogni** direzione ortogonale a $\\hat n_3$. Il tensore si scrive
$$\\tens E=\\lambda_3\\hat n_3\\otimes\\hat n_3+\\lambda(\\tens I-\\hat n_3\\otimes\\hat n_3),$$
dove $\\tens I-\\hat n_3\\otimes\\hat n_3$ è il proiettore sul piano ortogonale a $\\hat n_3$. Tutte le direzioni di quel piano hanno la stessa dilatazione $\\lambda$; l'asse $\\hat n_3$ è privilegiato. La sfera diventa un **ellissoide di rivoluzione**, il «pallone da rugby».

**Caso 3, radice tripla**: tutte le radici uguali a $\\lambda$. Ci sono $\\infty^2$ autocoppie, cioè ogni terna è principale, e $\\tens E=\\lambda\\tens I$, un tensore **sferico**. La deformazione è **omotetica**: nessuno scorrimento, $\\gamma\\equiv0$, ogni fibra ha la stessa dilatazione $\\varepsilon_n=\\lambda$, lo spostamento di deformazione pura è radiale e la sfera resta sfera.`,
      },
      {
        id: 'l28-5c',
        kind: 'domanda',
        q: { id: 'l28-q4', kind: 'scelta', q: `L'equazione secolare ha una radice doppia e una semplice. In che cosa si trasforma una sfera materiale?`, options: [`In un ellissoide di rivoluzione`, `In un ellissoide triassiale`, `In una sfera più grande o più piccola`, `In un cilindro`], correct: 0, why: `Con la radice doppia tutte le direzioni del piano ortogonale a $\\hat n_3$ hanno la stessa dilatazione: la sezione in quel piano resta un cerchio, e si ottiene il «pallone da rugby» (§2.9.3, caso 2). Il triassiale corrisponde a radici distinte, la sfera a radice tripla.` },
      },
      {
        id: 'l28-6',
        kind: 'derivazione',
        title: 'Proprietà di estremo',
        md: `Ordiniamo le dilatazioni principali dalla più grande alla più piccola, $e_1\\ge e_2\\ge e_3$: si chiamano massima, intermedia e minima (§2.9.4). **Dove vogliamo arrivare:** la dilatazione di una fibra qualunque sta sempre tra la minima e la massima. **L'idea:** scriviamo $\\varepsilon_n$ nel riferimento principale, dove la matrice è diagonale, con $\\hat n=\\sum_in_i\\hat n_i$ e $\\sum_in_i^2=1$ perché $\\hat n$ è un versore.`,
        source: D(2, '2.9.4', 'Prop 2.9.4', 32),
        der: {
          sample: (r) => { const o: R = {}; const E = T.sym(T.randMat(r)); putMat(o, 'E', E); putVec(o, 'n', T.unit(T.randVec(r))); return o; },
          lines: [
            { tex: '\\varepsilon_n=\\tens E\\hat n\\cdot\\hat n', why: `Partiamo dalla dilatazione linearizzata della lezione sul tensore $\\tens E$ (Prop 2.6.6).`, val: (v) => T.dotv(T.apply(mat(v, 'E'), vec(v, 'n')), vec(v, 'n')) },
            {
              tex: '=e_1n_1^2+e_2n_2^2+e_3n_3^2',
              why: `Usiamo la formula in componenti di $\\varepsilon_n$ nel riferimento principale: lì la matrice di $\\tens E$ è diagonale, quindi tutti i doppi prodotti spariscono e restano solo i tre quadrati. Le componenti di $\\hat n$ sono $n_i=\\hat n\\cdot\\hat n_i$.`,
              val: (v) => { const s = eigSym(mat(v, 'E')); const n = vec(v, 'n'); return s.values.reduce((acc, e, i) => acc + e * T.dotv(n, s.vectors[i]) ** 2, 0); },
            },
            { tex: '\\Rightarrow\\ e_3\\le\\varepsilon_n\\le e_1', why: `L'espressione è una media pesata delle tre dilatazioni principali: i pesi $n_i^2$ sono non negativi e hanno somma 1. Una media pesata non può superare il valore più grande né scendere sotto il più piccolo.`, eq: 'Prop 2.9.4' },
          ],
          checks: [{ what: 'e3 ≤ ε_n ≤ e1', f: (v) => { const s = eigSym(mat(v, 'E')); const e = T.dotv(T.apply(mat(v, 'E'), vec(v, 'n')), vec(v, 'n')); return [e >= s.values[2] - 1e-12 && e <= s.values[0] + 1e-12 ? 1 : 0, 1]; } }],
        },
      },
      {
        id: 'l28-6b',
        kind: 'spiega',
        title: 'Leggere la proprietà di estremo',
        md: `La Prop 2.9.4 dice che le dilatazioni principali non sono solo dilatazioni «speciali»: sono la **massima** e la **minima** tra tutte le direzioni. Nessuna fibra uscente dal punto si allunga più di $e_1$ o meno di $e_3$.

Controlli: per la fibra lungo $\\hat n_1$ si ha $n_1=1$ e $n_2=n_3=0$, quindi $\\varepsilon_n=e_1$, il massimo è raggiunto. Per una fibra «a metà» tra $\\hat n_1$ e $\\hat n_3$, con $n_1^2=n_3^2=\\tfrac12$, si ottiene la media $\\tfrac12(e_1+e_3)$ (passaggio aggiunto).

Questo spiega perché le direzioni principali interessano all'ingegnere: se si vuole sapere quale fibra è più allungata in un punto, basta cercare la dilatazione principale massima. La dispensa nota che c'è un risultato analogo per le tensioni principali, che incontrerai nel capitolo 3.`,
      },
      {
        id: 'l28-7a',
        kind: 'spiega',
        title: 'Quando una dilatazione principale è nulla',
        md: `L'ultima parte del capitolo (§2.10) guarda che cosa succede quando qualche dilatazione principale vale zero. Il punto di partenza è la scrittura spettrale applicata a una fibra qualunque $\\hat m$:
$$\\tens E\\hat m=\\lambda_1(\\hat m\\cdot\\hat n_1)\\hat n_1+\\lambda_2(\\hat m\\cdot\\hat n_2)\\hat n_2+\\lambda_3(\\hat m\\cdot\\hat n_3)\\hat n_3.$$
Ogni dilatazione nulla toglie un termine.
1. **Tutte diverse da zero**: deformazione tridimensionale, la sfera diventa un ellissoide triassiale.
2. **$\\lambda_1=0$**: manca il termine lungo $\\hat n_1$, quindi $\\vet u^{dp}$ è sempre parallelo al piano di $\\hat n_2$ e $\\hat n_3$. La fibra lungo $\\hat n_1$ non cambia lunghezza, il che non vuol dire che il corpo resti fermo attorno a quella direzione.
3. **$\\lambda_1=\\lambda_2=0$**: resta solo l'ultimo termine, $\\tens E\\hat m=\\lambda_3(\\hat m\\cdot\\hat n_3)\\hat n_3$, sempre parallelo a $\\hat n_3$. La deformazione avviene solo lungo $\\hat n_3$.

Sul caso 2 la dispensa scrive che «una sfera si deforma in un'ellisse piatta nel piano $\\hat n_2\\hat n_3$»: torneremo su questa frase con i numeri nel passo seguente.`,
      },
      {
        id: 'l28-7',
        kind: 'numeri',
        title: 'Contare le dilatazioni nulle con gli invarianti',
        md: `Non serve calcolare le radici per sapere quante sono nulle: bastano gli invarianti, che in termini delle dilatazioni principali sono $III=\\lambda_1\\lambda_2\\lambda_3$, $II=\\lambda_1\\lambda_2+\\lambda_2\\lambda_3+\\lambda_3\\lambda_1$, $I=\\lambda_1+\\lambda_2+\\lambda_3$ (§2.10).
- Se $III\\ne0$ nessuna è nulla: stato **triassiale**.
- Se $III=0$ e $II\\ne0$, l'equazione diventa $\\lambda(\\lambda^2-I\\lambda+II)=0$: una radice nulla, stato **biassiale**.
- Se $III=II=0$ e $I\\ne0$, diventa $\\lambda^2(\\lambda-I)=0$: due radici nulle, stato **monoassiale**. Se anche $I=0$, $\\tens E=\\tens O$.

Esempio «generico», con i numeri del motore: $I=${f(PG.invarianti[0])}$, $II=${f(PG.invarianti[1])}$, $III=${f(PG.invarianti[2])}$, quindi ${PG.stato}. Esempio con una dilatazione nulla: $III=${f(Math.abs(PP.invarianti[2]) < 1e-15 ? 0 : PP.invarianti[2])}$, $II=${f(PP.invarianti[1])}$, quindi ${PP.stato}; le dilatazioni principali sono ${PP.values.map((x) => f(Math.abs(x) < 1e-15 ? 0 : x)).join('; ')}.

Nel modello, con una dilatazione nulla, $\\vet u^{dp}$ è sempre parallelo al piano delle altre due direzioni. Ma la sfera non diventa un'«ellisse piatta», come dice la dispensa: diventa un ellissoide con un semiasse **invariato**, perché la fibra lungo quella direzione non cambia lunghezza. Vedi la nota NF-02.`,
        values: { I: PG.invarianti[0], II: PG.invarianti[1], IIIp: PP.invarianti[2] },
        visual: DEF({ mode: 'ellissoide', preset: 'piana', presets: ['piana', 'allungamento', 'generico'], controls: ['preset', 'amp', 'probe'] }),
      },
      {
        id: 'l28-8',
        kind: 'domanda',
        q: { id: 'l28-q1', kind: 'scelta', q: `Se $III=II=0$ e $I\\ne0$, la deformazione…`, options: [`avviene solo lungo una direzione principale`, `è omotetica`, `è isocora`, `è nulla`], correct: 0, why: `Due dilatazioni principali sono nulle: $\\tens E=\\lambda_3\\hat n_3\\otimes\\hat n_3$ e $\\tens E\\hat m$ è sempre parallelo a $\\hat n_3$ (§2.10, caso 3). Omotetica vorrebbe tre radici uguali; isocora vorrebbe $I=0$, escluso dall'ipotesi; nulla vorrebbe anche $I=0$.` },
      },
      {
        id: 'l28-9a',
        kind: 'spiega',
        title: 'Attenzione a…',
        md: `Quattro errori tipici su direzioni e dilatazioni principali.

1. **Pensare che gli scorrimenti siano una proprietà del punto.** In un riferimento qualunque compaiono scorrimenti, ma sono un effetto della base scelta: tra le direzioni principali sono nulli.
2. **Credere che una dilatazione principale nulla voglia dire «corpo fermo» in quella direzione.** Vuol dire soltanto che la fibra lungo quella direzione non cambia lunghezza (§2.10).
3. **Dimenticare l'ipotesi del teorema spettrale.** Serve la simmetria: per tensori non simmetrici gli autovalori possono essere complessi.
4. **Ripetere alla lettera «la sfera diventa un'ellisse piatta» (NF-02).** Con $\\lambda_1=0$ un intorno sferico diventa un ellissoide con un semiasse invariato; ciò che è parallelo al piano $\\hat n_2\\hat n_3$ è lo spostamento $\\vet u^{dp}$, non la figura deformata.`,
      },
      {
        id: 'l28-9',
        kind: 'riassunto',
        md: `**Il filo della lezione.** Lo spostamento di deformazione pura di una fibra è in generale inclinato rispetto alla fibra; le direzioni in cui non lo è sono le direzioni principali, e trovarle è un problema di autovalori di $\\tens E$. Siccome $\\tens E$ è simmetrico, il teorema spettrale garantisce tre direzioni reali e ortogonali; le dilatazioni principali sono le radici dell'equazione secolare, i cui coefficienti, gli invarianti, non dipendono dal riferimento. Secondo quante radici coincidono, una sfera diventa un ellissoide triassiale, di rivoluzione o resta sfera. Le dilatazioni principali sono la massima e la minima tra tutte le fibre, e gli invarianti dicono quante di esse sono nulle.

- Autocoppie: $(\\tens E-\\lambda\\tens I)\\hat n=\\vet 0$, $\\hat n\\cdot\\hat n=1$ (Def 2.9.1).
- Teorema spettrale: tre autocoppie reali, autovettori ortogonali se gli autovalori sono distinti (Teo 2.9.2).
- Equazione secolare: $\\lambda^3-I\\lambda^2+II\\lambda-III=0$ (Teo 2.9.3).
- Rappresentazione spettrale: $\\tens E=\\sum_i\\lambda_i\\,\\hat n_i\\otimes\\hat n_i$ (§2.9.3).
- Estremo: $e_3\\le\\varepsilon_n\\le e_1$ per ogni $\\hat n$ (Prop 2.9.4).
- Dilatazioni nulle: $III\\ne0$ triassiale; $III=0,\\ II\\ne0$ biassiale; $III=II=0,\\ I\\ne0$ monoassiale (§2.10).`,
        orale: ['Direzioni e dilatazioni principali: teorema spettrale, equazione secolare, invarianti, i tre casi, proprietà di estremo. (dispensa, domanda 12)', 'Dilatazioni principali nulle e lettura dagli invarianti. (dispensa, domanda 13)'],
      },
    ],
  },
];
