/**
 * Lezioni guidate del Modulo 1 (Cap. 1). Derivazioni solo dove la dispensa le sviluppa; ogni riga con `val`
 * è verificata su 25 campioni casuali (tests/lezioni.test.ts). I numeri dei passi «numeri» vengono dal motore.
 */
import { D } from '../../engine/types';
import * as T from '../../engine/tensor';
import { PRESETS } from '../../engine/lab';
import type { Lesson, LessonVisual } from '../types';

type R = Record<string, number>;
const mat = (v: R, p: string): T.Mat => Array.from({ length: 9 }, (_, k) => v[`${p}${k}`]);
const vec = (v: R, p: string): T.Vec => [v[`${p}0`], v[`${p}1`], v[`${p}2`]];
const putMat = (out: R, p: string, A: T.Mat) => A.forEach((a, k) => (out[`${p}${k}`] = a));
const putVec = (out: R, p: string, a: T.Vec) => a.forEach((x, k) => (out[`${p}${k}`] = x));
const idx = (r: () => number) => Math.min(2, Math.floor(3 * r()));

const LAB = (scene: Extract<LessonVisual, { kind: 'tensori3d' }>['scene']): LessonVisual => ({ kind: 'tensori3d', scene });
const SVG = (id: 'matrici' | 'simmetrie4' | 'divergenza', params?: Record<string, string | number | boolean>): LessonVisual => ({ kind: 'svg', id, params });

// ------------------------------------------------------------------ numeri d'esempio (dal motore)
const A_GEN = PRESETS.generico.A;
const V_EX: T.Vec = [1, 2, -1];
const AV = T.apply(A_GEN, V_EX);
const AB = T.mul(PRESETS.taglio.A, PRESETS.rotazione.A);
const BA = T.mul(PRESETS.rotazione.A, PRESETS.taglio.A);
export const NUMERI_M1 = {
  Av: AV,
  AB12: AB[1],
  BA12: BA[1],
  AB11: AB[0],
  BA11: BA[0],
  det: { taglio: T.det(PRESETS.taglio.A), sferico: T.det(PRESETS.sferico.A), riflessione: T.det(PRESETS.riflessione.A), singolare: T.det(PRESETS.singolare.A) },
  count: { tutte: T.distinctComponents({}), minori: T.distinctComponents({ minor1: true, minor2: true }), tutte3: T.distinctComponents({ minor1: true, minor2: true, major: true }) },
};
const f = (x: number, d = 3) => T.fmt(x, d);

// ------------------------------------------------------------------ campo tensoriale quadratico per c1.7
/** A_ij(x) = c_ij + Σ_k d_ijk x_k + q_ij x_j² ; derivata analitica ∂A_ij/∂x_m */
const Aat = (v: R, x: T.Vec): T.Mat => Array.from({ length: 9 }, (_, n) => {
  const i = Math.floor(n / 3), j = n % 3;
  return v[`c${n}`] + [0, 1, 2].reduce((s, k) => s + v[`d${n}_${k}`] * x[k], 0) + v[`q${n}`] * x[j] * x[j] + 0 * i;
});
const dA = (v: R, x: T.Vec, n: number, m: number) => v[`d${n}_${m}`] + (m === n % 3 ? 2 * v[`q${n}`] * x[m] : 0);
const fieldSample = (r: () => number): R => {
  const out: R = {};
  for (let n = 0; n < 9; n++) {
    out[`c${n}`] = 2 * r() - 1;
    out[`q${n}`] = 2 * r() - 1;
    for (let k = 0; k < 3; k++) out[`d${n}_${k}`] = 2 * r() - 1;
  }
  putVec(out, 'a', T.randVec(r));
  putVec(out, 'x', T.randVec(r));
  return out;
};

export const M1_LEZIONI: Lesson[] = [
  // ================================================================== c1.1
  {
    concept: 'c1.1',
    title: 'Che cos’è un tensore',
    minutes: 22,
    source: D(1, '1.1–1.2.3', 'Def 1.1.1, 1.2.1, 1.2.2', '1–3'),
    visual: LAB({ mode: 'trasforma', presets: ['taglio', 'stiramento', 'rotazione', 'generico'], controls: ['preset', 'cube'], cube: false }),
    steps: [
      {
        id: 'l11-1',
        kind: 'spiega',
        title: 'Dove siamo e dove andiamo',
        md: `Questa è la prima lezione del corso, quindi partiamo da una cosa che conosci già: i vettori, le frecce con direzione, verso e lunghezza che hai usato in Fisica e in Geometria.

In Scienza delle Costruzioni ci servirà un oggetto un gradino più su: una «macchina» che riceve un vettore e ne restituisce un altro. Per esempio, nel Cap. 3 a ogni giacitura, individuata dal suo versore normale $\\hat n$, corrisponderà il vettore tensione $\\vet t_n=\\tens T\\hat n$. La macchina $\\tens T$ è un **tensore del secondo ordine**.

La domanda di questa lezione è: che cos'è esattamente un tensore, e come lo si descrive con dei numeri? Faremo tre tappe: prima fissiamo il riferimento e i nomi degli oggetti; poi diamo la definizione di tensore; infine vediamo le sue componenti e l'ordine in cui si leggono, che è la prima domanda d'orale del capitolo.

A destra vedi già un tensore al lavoro: i versori grigi sono quelli che entrano, le frecce colorate quelli che escono.`,
      },
      {
        id: 'l11-2',
        kind: 'spiega',
        title: 'Il riferimento: tre versori perpendicolari',
        md: `Lavoriamo nello **spazio euclideo tridimensionale**, che la dispensa chiama $\\mathcal E$ (§1.1.1): i suoi oggetti sono i punti. Un **vettore** è la freccia che porta un punto in un altro; l'insieme dei vettori si chiama $\\mathcal V$.

Per descrivere un vettore con dei numeri serve un **riferimento**: tre versori, cioè vettori lunghi 1, che si scrivono $\\hat e_1,\\hat e_2,\\hat e_3$. Pensa allo spigolo di una stanza: un versore lungo il pavimento verso destra, uno lungo il pavimento in avanti, uno verso il soffitto.

La dispensa usa solo riferimenti **ortonormali**, cioè con versori lunghi 1 e perpendicolari tra loro, e **destrorsi**: ciascun versore si sovrappone al successivo ruotando in senso antiorario. Le due richieste «lungo 1» e «perpendicolari» si condensano in una sola formula, che vediamo nel prossimo passo.`,
      },
      {
        id: 'l11-3',
        kind: 'spiega',
        title: 'Il delta di Kronecker, con i numeri',
        md: `Ricorda che il prodotto scalare di un vettore con sé stesso è il quadrato della sua lunghezza, e che il prodotto scalare di due vettori perpendicolari è zero. Applichiamolo ai versori del riferimento.

Un versore lungo 1 per sé stesso dà 1: $\\hat e_1\\cdot\\hat e_1=1$, e lo stesso $\\hat e_2\\cdot\\hat e_2=1$, $\\hat e_3\\cdot\\hat e_3=1$. Due versori diversi sono perpendicolari, quindi danno zero: $\\hat e_1\\cdot\\hat e_2=0$, $\\hat e_1\\cdot\\hat e_3=0$, $\\hat e_2\\cdot\\hat e_3=0$.

La regola è: **1 se gli indici sono uguali, 0 se sono diversi**. Il simbolo che la esprime si chiama **delta di Kronecker**, $\\delta_{ij}$. Per esempio $\\delta_{11}=1$, $\\delta_{22}=1$, $\\delta_{12}=0$, $\\delta_{31}=0$. Con questo simbolo le uguaglianze di sopra, insieme a quelle con gli indici scambiati, nove in tutto, diventano una sola:

$$\\hat e_i\\cdot\\hat e_j=\\delta_{ij}.$$

Se metti i valori di $\\delta_{ij}$ in una tabella $3\\times3$, con $i$ come riga e $j$ come colonna, ottieni 1 sulla diagonale e 0 altrove (deduzione). Rivedrai questa tabella tra poco.`,
      },
      {
        id: 'l11-d1',
        kind: 'domanda',
        q: { id: 'l11-q2', kind: 'scelta', q: 'Quanto valgono $\\hat e_2\\cdot\\hat e_3$ e $\\delta_{33}$?', options: ['$0$ e $1$', '$1$ e $0$', '$1$ e $1$', '$0$ e $3$'], correct: 0, why: '$\\hat e_2$ ed $\\hat e_3$ sono perpendicolari, quindi il loro prodotto scalare è $0$, cioè $\\delta_{23}=0$. Invece $\\delta_{33}$ ha gli indici uguali e vale $1$: è $\\hat e_3\\cdot\\hat e_3$, il quadrato della lunghezza di un versore. Il delta non vale mai $3$: vale solo 0 o 1.' },
      },
      {
        id: 'l11-4',
        kind: 'spiega',
        title: 'Le componenti di un vettore',
        md: `Fissato il riferimento, ogni vettore si descrive con tre numeri. La **componente** $i$ di $\\vet v$ è la sua proiezione sul versore $i$-esimo (Def 1.1.1):

$$v_i:=\\vet v\\cdot\\hat e_i.$$

Il simbolo $:=$ significa «è uguale per definizione»: non è un risultato, è il nome che diamo a quella quantità (§1.1.2). Il vettore si ricostruisce sommando i versori, ciascuno moltiplicato per la sua componente: $\\vet v=\\sum_iv_i\\hat e_i$.

Un controllo con il delta (esempio aggiunto): la componente 1 del versore $\\hat e_2$ è $\\hat e_2\\cdot\\hat e_1=\\delta_{21}=0$, la componente 2 è $\\delta_{22}=1$. Quindi $\\hat e_2$ ha componenti $(0;1;0)$, come ti aspetti.

La dispensa distingue due modi di scrivere. La **notazione assoluta** definisce gli oggetti senza riferimento, come «la freccia $\\vet v$». La **notazione in componenti** usa i numeri $v_i$ e sottintende sempre «fissato un riferimento» (§1.1.2).`,
      },
      {
        id: 'l11-4o',
        kind: 'spiega',
        title: 'L’ordine di un ente e la notazione',
        md: `Scalari, vettori, tensori: la dispensa li classifica per **ordine** (§1.1.3). L'ordine dice quanti indici servono per individuare una componente, e in tre dimensioni ogni indice va da 1 a 3. Quindi un ente di ordine $n$ ha $3^n$ componenti.

- **Scalari**, ordine 0: un solo numero ($3^0=1$). Si scrivono con lettere greche minuscole, come $\\alpha,\\lambda$.
- **Vettori**, ordine 1: tre componenti $v_i$. Minuscole sottosegnate, come $\\vet u$.
- **Tensori del II ordine**: nove componenti, con due indici. Maiuscole con la tilde sotto, come $\\tens A$.
- **Tensori del IV ordine**: $3^4=81$ componenti, con quattro indici. Maiuscole «filettate», come $\\mathbb A$; li incontreremo nella lezione sui tensori del IV ordine (§1.7).

La notazione ti dice a colpo d'occhio con che cosa hai a che fare: quando vedi la tilde sotto una lettera, è un tensore del II ordine.`,
      },
      {
        id: 'l11-d2',
        kind: 'domanda',
        q: { id: 'l11-q3', kind: 'scelta', q: 'Quante componenti ha in tre dimensioni un tensore del II ordine, e perché?', options: ['$9=3^2$: due indici, ciascuno da 1 a 3', '$6$: una per faccia del cubo', '$3$: come un vettore', '$8=2^3$'], correct: 0, why: 'Un ente di ordine $n$ ha $3^n$ componenti (§1.1.3): l\'ordine è il numero di indici, e ogni indice prende 3 valori. Il numero 6 tornerà per i tensori simmetrici, che sono un caso particolare; $2^3$ scambia base ed esponente.' },
      },
      {
        id: 'l11-5m',
        kind: 'spiega',
        title: 'Un tensore è una macchina che trasforma i vettori',
        md: `Ora l'oggetto nuovo. Immagina una macchina con un ingresso e un'uscita: metti dentro un vettore $\\vet u$ ed esce un altro vettore, che si scrive $\\tens A\\vet u$. Nel modello a destra vedi proprio questo: entrano i versori grigi, escono le frecce colorate.

La dispensa lo dice così (Def 1.2.1): un tensore del II ordine $\\tens A$ è una trasformazione di $\\mathcal V$ in $\\mathcal V$, cioè una regola che a ogni vettore $\\vet u$ associa un vettore $\\vet v=\\tens A\\vet u$.

Due convenzioni di scrittura. Si scrive **prima il tensore e poi il vettore**: $\\tens A\\vet u$, non $\\vet u\\tens A$. E l'insieme di tutti i tensori del II ordine si chiama $\\mathrm{Lin}$, da «lineare».

Quel nome anticipa la parte importante della definizione: non ogni macchina che trasforma vettori è un tensore, ma solo quelle **lineari**. Che cosa vuol dire lo vediamo nel prossimo passo.`,
      },
      {
        id: 'l11-6l',
        kind: 'spiega',
        title: 'La linearità: combinare prima o dopo è lo stesso',
        md: `La Def 1.2.1 chiede che la macchina sia lineare:

$$\\tens A(\\alpha\\vet u+\\beta\\vet v)=\\alpha\\tens A\\vet u+\\beta\\tens A\\vet v\\quad\\forall\\alpha,\\beta\\in\\mathbb R,\\ \\forall\\vet u,\\vet v.$$

A parole: trasformare una combinazione di vettori dà la stessa combinazione dei vettori trasformati. Tre casi particolari la rendono concreta.
- Con $\\alpha=\\beta=1$ è l'**additività**: il trasformato di una somma è la somma dei trasformati.
- Con $\\beta=0$ è l'**omogeneità**: se raddoppi l'ingresso, raddoppia l'uscita.
- Con $\\alpha=\\beta=0$ si ottiene $\\tens A\\vet 0=\\vet 0$: il vettore nullo resta nullo.

Geometricamente la linearità impedisce di «piegare» lo spazio: rette restano rette, e il cubo unitario del modello diventa un parallelepipedo, mai una forma curva (deduzione). Accendi «cubo unitario trasformato» e guardalo con il taglio.`,
      },
      {
        id: 'l11-d3',
        kind: 'domanda',
        q: { id: 'l11-q4', kind: 'vf', q: 'Esiste un tensore del II ordine che manda il vettore nullo in un vettore diverso da zero.', answer: false, why: 'Prendendo $\\alpha=\\beta=0$ nella linearità si ottiene $\\tens A\\vet 0=\\vet 0$ per ogni tensore (§1.2.1). Una macchina che sposta l\'origine, come una traslazione, non è lineare e quindi non è un tensore.' },
      },
      {
        id: 'l11-7c',
        kind: 'spiega',
        title: 'Le componenti: che cosa misura il numero $A_{ij}$',
        md: `Abbiamo una macchina; ora vogliamo descriverla con dei numeri, come abbiamo fatto con un vettore. La **Def 1.2.2** dice

$$A_{ij}:=\\tens A\\hat e_j\\cdot\\hat e_i.$$

Leggila come una ricetta in due tempi: fai passare il versore $\\hat e_j$ nella macchina, poi misura il vettore che esce lungo $\\hat e_i$ con un prodotto scalare. È la stessa idea di $v_i=\\vet v\\cdot\\hat e_i$, applicata al vettore $\\tens A\\hat e_j$: quindi $A_{ij}$ è la componente $i$ dell'immagine di $\\hat e_j$ (deduzione).

Se tieni fisso $j$ e fai variare $i$ da 1 a 3, ottieni le tre componenti di $\\tens A\\hat e_j$. Messe in colonna formano la **colonna $j$** della matrice $[\\tens A]$, una tabella $3\\times3$. Nel modello: la freccia colorata che esce da $\\hat e_2$ ha per componenti i numeri della seconda colonna.`,
      },
      {
        id: 'l11-8n',
        kind: 'spiega',
        title: 'Perché bastano nove numeri',
        md: `Nove numeri dicono dove vanno i tre versori. Ma un tensore deve agire su **ogni** vettore: come fanno a bastare?

Qui serve la linearità del passo precedente. Ogni vettore è una combinazione dei versori, $\\vet v=\\sum_jv_j\\hat e_j$. Per la linearità, trasformarlo dà la stessa combinazione dei versori trasformati (passaggio aggiunto):

$$\\tens A\\vet v=\\textstyle\\sum_jv_j\\,\\tens A\\hat e_j.$$

Quindi, se sai dove vanno i tre versori, sai dove va qualunque vettore.

In componenti questa somma diventa una regola che conosci dall'algebra lineare, il prodotto righe per colonna (§1.2.2):

$$(\\tens A\\vet v)_i=\\textstyle\\sum_jA_{ij}v_j,\\qquad\\{\\tens A\\vet v\\}=[\\tens A]\\{\\vet v\\}.$$

La componente $i$ del risultato si ottiene moltiplicando la riga $i$ della matrice per la colonna delle componenti di $\\vet v$. Lo proverai con i numeri sul modello.`,
      },
      {
        id: 'l11-9t',
        kind: 'spiega',
        title: 'Due tensori notevoli, e il tensore senza la matrice',
        md: `Due tensori meritano un nome (§1.2.3). L'**identità** $\\tens I$ lascia ogni vettore com'è, $\\tens I\\vet v=\\vet v$. Le sue componenti sono $I_{ij}=\\tens I\\hat e_j\\cdot\\hat e_i=\\hat e_j\\cdot\\hat e_i=\\delta_{ij}$ (passaggio aggiunto): è la tabella del delta di Kronecker, 1 sulla diagonale e 0 altrove. Il **tensore nullo** $\\tens O$ manda ogni vettore nel vettore nullo, $\\tens O\\vet v=\\vet 0$, e ha tutte le componenti nulle.

Un'ultima idea, la più importante per l'orale. La definizione di tensore come trasformazione lineare è in **notazione assoluta**: non nomina nessun riferimento. La matrice $[\\tens A]$, invece, dipende dal riferimento: se scegli versori diversi, i nove numeri in generale cambiano. Il tensore no: la freccia che esce da un dato vettore resta la stessa.

È come una persona descritta in due lingue diverse: le parole cambiano, la persona no (deduzione).`,
      },
      {
        id: 'l11-5',
        kind: 'spiega',
        title: 'Attenzione a tre errori sulle componenti',
        md: `Su questa definizione si sbaglia in tre modi, e conviene vederli subito.

1. **Leggere le operazioni nell'ordine sbagliato.** La scrittura $\\tens A\\hat e_j\\cdot\\hat e_i$ si legge $(\\tens A\\hat e_j)\\cdot\\hat e_i$. La regola della dispensa (box Attenzione, p. 3) è: prima si applica l'ente di ordine superiore a quello di ordine inferiore, poi si fa il prodotto scalare, che va fatto tra grandezze omogenee, vettore con vettore. La lettura $\\tens A(\\hat e_j\\cdot\\hat e_i)$ è tentante perché il punto sembra «legare» i due versori, ma non ha senso: $\\hat e_j\\cdot\\hat e_i$ è un numero, e il tensore opera sui vettori, non sui numeri.
2. **Confondere il tensore con la sua matrice.** Se cambi riferimento cambiano i versori, quindi in generale cambiano i nove numeri; la trasformazione, cioè che cosa succede a ogni freccia, resta la stessa.
3. **Scambiare righe e colonne.** È la colonna $j$, non la riga, a contenere $\\tens A\\hat e_j$: l'indice del versore che entra nella macchina è il secondo.`,
      },
      {
        id: 'l11-6',
        kind: 'domanda',
        q: {
          id: 'l11-q1',
          kind: 'scelta',
          q: 'Come va letta la scrittura $\\tens A\\hat e_j\\cdot\\hat e_i$?',
          options: ['$(\\tens A\\hat e_j)\\cdot\\hat e_i$: prima il tensore sul versore, poi il prodotto scalare', '$\\tens A(\\hat e_j\\cdot\\hat e_i)$: prima il prodotto scalare, poi il tensore', 'È indifferente', '$\\hat e_j\\cdot(\\tens A\\hat e_i)$'],
          correct: 0,
          why: 'Si applica prima l\'ente di ordine superiore (il tensore) a quello di ordine inferiore (il versore), poi si fa il prodotto scalare tra due vettori (Attenzione, p. 3). La seconda lettura farebbe agire il tensore su un numero. L\'ordine non è indifferente, e la quarta scrittura è un\'altra quantità: $\\tens A\\hat e_i\\cdot\\hat e_j$ è $A_{ji}$, non $A_{ij}$.',
        },
      },
      {
        id: 'l11-7',
        kind: 'prova',
        title: 'Guarda dove vanno i versori',
        md: 'Ora controlla sul modello quello che abbiamo detto. Le frecce colorate sono $\\tens A\\hat e_1$, $\\tens A\\hat e_2$, $\\tens A\\hat e_3$; sotto c\'è la matrice $[\\tens A]$. Per ogni preimpostazione cerca la corrispondenza tra una freccia e una colonna: è la Def 1.2.2 vista con gli occhi.',
        tasks: [
          'Scegli «stiramento lungo x»: cambia solo $\\tens A\\hat e_1$. Ritrovi i suoi numeri nella **prima colonna** di $[\\tens A]$.',
          'Scegli «taglio»: $\\tens A\\hat e_2$ si inclina verso x. Leggi $(0{,}8;\\ 1;\\ 0)$ nella **seconda colonna**.',
          'Scegli «rotazione»: le tre immagini restano lunghe 1 e perpendicolari tra loro.',
          'Accendi «cubo unitario trasformato»: con il taglio il cubo diventa un parallelepipedo inclinato, con le facce ancora piane.',
          `Scegli «generico» e applicalo a $\\vet v=(1;\\ 2;\\ -1)$ righe per colonna: $(\\tens A\\vet v)_1=A_{11}\\cdot1+A_{12}\\cdot2+A_{13}\\cdot(-1)=${f(A_GEN[0])}+${f(2 * A_GEN[1])}-${f(A_GEN[2])}=${f(AV[0])}$. Le altre due componenti valgono ${f(AV[1])}$ e ${f(AV[2])}$.`,
          `Sempre con «generico»: $A_{23}=${f(A_GEN[5])}$ è la seconda componente della freccia $\\tens A\\hat e_3$. Ritrovala nella terza colonna, seconda riga.`,
        ],
        visual: LAB({ mode: 'trasforma', presets: ['stiramento', 'taglio', 'rotazione', 'generico'], controls: ['preset', 'cube'], cube: false, A: PRESETS.stiramento.A }),
      },
      {
        id: 'l11-8',
        kind: 'riassunto',
        md: `**Il filo della lezione.** Abbiamo fissato un riferimento ortonormale destrorso, in cui ogni vettore ha tre componenti $v_i=\\vet v\\cdot\\hat e_i$, e abbiamo classificato gli enti per ordine. Un tensore del II ordine è una macchina lineare che trasforma vettori in vettori, e la linearità fa sì che basti sapere dove vanno i tre versori. Per questo le sue nove componenti si definiscono come $A_{ij}=\\tens A\\hat e_j\\cdot\\hat e_i$: la colonna $j$ della matrice è l'immagine di $\\hat e_j$. Le operazioni si leggono nell'ordine giusto, prima il tensore sul versore e poi il prodotto scalare; la matrice dipende dal riferimento, il tensore no.

- Componenti di un vettore: $v_i:=\\vet v\\cdot\\hat e_i$ (Def 1.1.1).
- Ente di ordine $n$: $3^n$ componenti (§1.1.3).
- Linearità: $\\tens A(\\alpha\\vet u+\\beta\\vet v)=\\alpha\\tens A\\vet u+\\beta\\tens A\\vet v$, da cui $\\tens A\\vet 0=\\vet 0$ (Def 1.2.1).
- Componenti: $A_{ij}:=\\tens A\\hat e_j\\cdot\\hat e_i$ (Def 1.2.2); applicazione $(\\tens A\\vet v)_i=\\sum_jA_{ij}v_j$ (§1.2.2).`,
        orale: ["Che cos'è un tensore del II ordine? Perché le componenti si definiscono come $\\tens A\\hat e_j\\cdot\\hat e_i$ e in che ordine si eseguono le operazioni? (dispensa, domanda 1)"],
      },
    ],
  },

  // ================================================================== c1.2
  {
    concept: 'c1.2',
    title: 'Diade, base di Lin, proiettori, composizione',
    minutes: 26,
    source: D(1, '1.2.4–1.2.6', 'Def 1.2.3, Prop 1.2.4, Def 1.2.5–1.2.7', '3–4'),
    visual: LAB({ mode: 'trasforma', A: T.dyad([1, 0.4, 0.3], [0.5, 0.7, 0.2]), controls: ['cube'], cube: true }),
    steps: [
      {
        id: 'l12-1',
        kind: 'spiega',
        title: 'Dove siamo e dove andiamo: il tensore più semplice',
        md: `Nella lezione precedente abbiamo definito il tensore del II ordine come una trasformazione lineare dei vettori, descritta da nove componenti $A_{ij}$. Ora ci chiediamo come si **costruisce** un tensore a partire da oggetti più semplici, e come si **combinano** due tensori. Le tappe sono quattro: il tensore più semplice di tutti, la diade; la scoperta che con nove diadi si costruisce qualunque tensore; due diadi speciali, i proiettori; la somma e la composizione.

Cominciamo dalla diade. Immaginala come una macchina in due tempi, costruita con due vettori $\\vet a$ e $\\vet b$: prima **misura** quanto il vettore in ingresso $\\vet u$ va nella direzione di $\\vet b$, con il prodotto scalare $\\vet b\\cdot\\vet u$; poi **produce** una freccia lungo $\\vet a$, moltiplicata per quel numero. È la **Def 1.2.3**:

$$(\\vet a\\otimes\\vet b)\\vet u=(\\vet b\\cdot\\vet u)\\,\\vet a\\quad\\forall\\vet u.$$

Il simbolo $\\otimes$ si legge «diade» (la dispensa parla anche di prodotto diadico tra vettori, §1.2.4). Qualunque vettore le dai, il risultato è **parallelo ad $\\vet a$**, con intensità proporzionale alla componente di $\\vet u$ lungo $\\vet b$. Nel modello c'è una diade: le tre immagini dei versori stanno sulla stessa retta e il cubo si schiaccia su un segmento.`,
      },
      {
        id: 'l12-2',
        kind: 'derivazione',
        title: 'Le componenti della diade',
        md: 'Vogliamo la matrice della diade, cioè i numeri $(\\vet a\\otimes\\vet b)_{ij}$. La strategia è applicare la definizione di componente (Def 1.2.2, lezione precedente) e sostituirci dentro la definizione di diade: non serve altro.',
        source: D(1, '1.2.4', 'Def 1.2.3', 3),
        der: {
          sample: (r) => {
            const o: R = { i: idx(r), j: idx(r) };
            putVec(o, 'a', T.randVec(r));
            putVec(o, 'b', T.randVec(r));
            return o;
          },
          lines: [
            { tex: '(\\vet a\\otimes\\vet b)_{ij}=(\\vet a\\otimes\\vet b)\\hat e_j\\cdot\\hat e_i', why: 'Partiamo dalla definizione di componente: si applica il tensore, qui la diade, al versore $\\hat e_j$, e si proietta il risultato su $\\hat e_i$. Ricorda l\'ordine: prima il tensore sul versore, poi il prodotto scalare.', val: (v) => T.dotv(T.apply(T.dyad(vec(v, 'a'), vec(v, 'b')), T.basis(v.j)), T.basis(v.i)) },
            {
              tex: '=\\big[(\\vet b\\cdot\\hat e_j)\\,\\vet a\\big]\\cdot\\hat e_i',
              why: 'Abbiamo sostituito $(\\vet a\\otimes\\vet b)\\hat e_j$ con ciò che dice la definizione di diade, prendendo $\\vet u=\\hat e_j$: esce il vettore $\\vet a$ moltiplicato per il numero $\\vet b\\cdot\\hat e_j$.',
              aggiunto: true,
              ask: { q: 'Quanto vale $(\\vet a\\otimes\\vet b)\\hat e_j$?', options: ['$(\\vet b\\cdot\\hat e_j)\\,\\vet a$', '$(\\vet a\\cdot\\hat e_j)\\,\\vet b$', '$\\vet a\\wedge\\vet b$', '$a_jb_j$'], correct: 0, why: 'Per definizione $(\\vet a\\otimes\\vet b)\\vet u=(\\vet b\\cdot\\vet u)\\vet a$, con $\\vet u=\\hat e_j$. La seconda opzione scambia i ruoli: è $\\vet b$ a misurare e $\\vet a$ a dare la direzione. Le ultime due non sono nemmeno vettori del tipo giusto: il prodotto vettoriale non c\'entra, e $a_jb_j$ è un numero.' },
              val: (v) => T.dotv(T.scalev(vec(v, 'a'), T.dotv(vec(v, 'b'), T.basis(v.j))), T.basis(v.i)),
            },
            { tex: '=(\\vet b\\cdot\\hat e_j)(\\vet a\\cdot\\hat e_i)=b_j\\,a_i', why: 'Il numero $\\vet b\\cdot\\hat e_j$ è uno scalare e può uscire dal prodotto scalare. Restano due prodotti scalari con i versori, che per la Def 1.1.1 sono proprio le componenti: $\\vet b\\cdot\\hat e_j=b_j$ e $\\vet a\\cdot\\hat e_i=a_i$.', eq: 'Def 1.2.3', val: (v) => vec(v, 'b')[v.j] * vec(v, 'a')[v.i] },
          ],
        },
      },
      {
        id: 'l12-3',
        kind: 'spiega',
        title: 'Che cosa dice il risultato $a_ib_j$',
        md: `Il risultato $(\\vet a\\otimes\\vet b)_{ij}=a_ib_j$ si legge così: il numero in riga $i$ e colonna $j$ è il prodotto della componente $i$ di $\\vet a$ per la componente $j$ di $\\vet b$. Quindi la colonna $j$ della matrice è il vettore $\\vet a$ moltiplicato per il numero $b_j$ (deduzione): tutte e tre le colonne sono multipli di $\\vet a$. È la conferma, in numeri, di quello che hai visto nel modello: le tre immagini dei versori stanno tutte sulla retta di $\\vet a$.

Un caso particolare che ci servirà subito (esempio aggiunto). Prendi $\\vet a=\\hat e_1$ e $\\vet b=\\hat e_2$. Le componenti di $\\hat e_1$ sono $(1;0;0)$, quelle di $\\hat e_2$ sono $(0;1;0)$, quindi l'unico prodotto $a_ib_j$ diverso da zero è quello con $i=1$ e $j=2$. La matrice di $\\hat e_1\\otimes\\hat e_2$ ha un solo 1, in riga 1 e colonna 2, e zeri altrove.

Allo stesso modo la diade $\\hat e_i\\otimes\\hat e_j$ ha un solo 1, nel posto $(i,j)$. Tieni a mente queste nove «matrici con un solo 1»: sono i mattoni della prossima tappa.`,
      },
      {
        id: 'l12-4',
        kind: 'domanda',
        q: { id: 'l12-q1', kind: 'vf', q: 'La diade $\\vet a\\otimes\\vet b$ trasforma ogni vettore in un vettore parallelo a $\\vet b$.', answer: false, why: 'Il risultato è $(\\vet b\\cdot\\vet u)\\vet a$, un multiplo di $\\vet a$ (Def 1.2.3). L\'errore è tentante perché nella scrittura $\\vet b$ sta accanto a $\\vet u$; ma $\\vet b$ entra solo nel prodotto scalare, cioè decide «quanto», non «in che direzione».' },
      },
      {
        id: 'l12-5',
        kind: 'spiega',
        title: 'Nove mattoni per costruire ogni tensore',
        md: `Ricordi come si ricostruisce un vettore dalle sue componenti? $\\vet v=\\sum_iv_i\\hat e_i$: le componenti dicono quanto prendere di ciascun versore. La **Prop 1.2.4** dice la stessa cosa un gradino più su: ogni tensore si ricostruisce dalle sue nove componenti usando come mattoni le nove diadi dei versori,

$$\\tens A=\\textstyle\\sum_{i,j}A_{ij}\\,\\hat e_i\\otimes\\hat e_j.$$

Con il risultato del passo precedente, in termini di matrici è un'affermazione quasi da contabile: la matrice $[\\tens A]$ è la somma di nove matrici con un solo 1, ciascuna moltiplicata per la componente che va in quel posto (deduzione).

Si dice che le diadi $\\hat e_i\\otimes\\hat e_j$ sono una **base** di $\\mathrm{Lin}$, e per dimostrarlo servono due cose: che ogni tensore si scriva così, e che i mattoni siano indipendenti. Per la prima parte la dispensa usa un'idea che tornerà spesso: due tensori sono uguali se fanno la stessa cosa su ogni vettore. Applichiamo quindi la somma delle diadi a un vettore qualunque $\\vet u$ e mostriamo che il risultato è $\\tens A\\vet u$.`,
      },
      {
        id: 'l12-6',
        kind: 'derivazione',
        title: 'Le 9 diadi dei versori ricostruiscono ogni tensore',
        md: 'Vogliamo mostrare che la somma $\\sum_{ij}A_{ij}\\,\\hat e_i\\otimes\\hat e_j$ agisce su ogni vettore come $\\tens A$. Strategia: guardiamo la componente $k$ del risultato e la trasformiamo un passo alla volta, usando la definizione di diade e poi la regola righe per colonna.',
        source: D(1, '1.2.4', 'Prop 1.2.4', '3–4'),
        der: {
          sample: (r) => {
            const o: R = { k: idx(r) };
            putMat(o, 'A', T.randMat(r));
            putVec(o, 'u', T.randVec(r));
            return o;
          },
          lines: [
            {
              tex: '\\Big[\\textstyle\\sum_{ij}A_{ij}(\\hat e_i\\otimes\\hat e_j)\\vet u\\Big]_k',
              why: 'Applichiamo a un vettore qualunque $\\vet u$ la somma delle nove diadi, ciascuna pesata con la sua componente $A_{ij}$, e guardiamo la componente $k$ del vettore che esce.',
              val: (v) => {
                let S = T.O3;
                const A = mat(v, 'A');
                for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) S = T.add(S, T.scale(T.dyad(T.basis(i), T.basis(j)), T.at(A, i, j)));
                return T.apply(S, vec(v, 'u'))[v.k];
              },
            },
            {
              tex: '=\\Big[\\textstyle\\sum_{ij}A_{ij}\\,u_j\\,\\hat e_i\\Big]_k',
              why: 'Su ogni diade abbiamo usato la definizione (Def 1.2.3) con $\\vet a=\\hat e_i$ e $\\vet b=\\hat e_j$: $(\\hat e_i\\otimes\\hat e_j)\\vet u=(\\hat e_j\\cdot\\vet u)\\hat e_i$, e $\\hat e_j\\cdot\\vet u$ è la componente $u_j$.',
              ask: { q: 'Quanto vale $(\\hat e_i\\otimes\\hat e_j)\\vet u$?', options: ['$u_j\\,\\hat e_i$', '$u_i\\,\\hat e_j$', '$\\delta_{ij}\\vet u$', '$u_iu_j$'], correct: 0, why: 'Definizione di diade con $\\vet a=\\hat e_i$, $\\vet b=\\hat e_j$: il secondo vettore misura ($\\hat e_j\\cdot\\vet u=u_j$), il primo dà la direzione ($\\hat e_i$). La seconda opzione scambia i ruoli; $\\delta_{ij}\\vet u$ confonde la diade con il prodotto scalare dei versori; $u_iu_j$ è un numero, non un vettore.' },
              val: (v) => {
                const A = mat(v, 'A');
                const u = vec(v, 'u');
                return [0, 1, 2].reduce((s, j) => s + T.at(A, v.k, j) * u[j], 0);
              },
            },
            {
              tex: '=\\Big[\\textstyle\\sum_i(\\tens A\\vet u)_i\\,\\hat e_i\\Big]_k',
              why: 'Abbiamo raccolto i termini con lo stesso versore $\\hat e_i$: davanti a ciascuno resta la somma $\\sum_jA_{ij}u_j$, che è la regola righe per colonna della lezione precedente, cioè la componente $i$ di $\\tens A\\vet u$.',
              val: (v) => T.apply(mat(v, 'A'), vec(v, 'u'))[v.k],
            },
            { tex: '=(\\tens A\\vet u)_k', why: 'Una somma di componenti per versori è il vettore stesso (Def 1.1.1): $\\sum_i(\\tens A\\vet u)_i\\hat e_i=\\tens A\\vet u$, e la sua componente $k$ è $(\\tens A\\vet u)_k$. Siccome $k$ e $\\vet u$ erano qualunque, la somma delle diadi fa su ogni vettore ciò che fa $\\tens A$: è $\\tens A$.', eq: 'Prop 1.2.4', val: (v) => T.apply(mat(v, 'A'), vec(v, 'u'))[v.k] },
          ],
        },
      },
      {
        id: 'l12-7',
        kind: 'spiega',
        title: 'I mattoni sono indipendenti, e a che cosa serve',
        md: `Resta la seconda metà della Prop 1.2.4: l'**indipendenza**. Vuol dire che nessun mattone si ottiene combinando gli altri, cioè che l'unico modo di ottenere il tensore nullo è prendere tutti i coefficienti nulli.

La dispensa lo mostra così. Supponi che $\\sum_{ij}c_{ij}\\,\\hat e_i\\otimes\\hat e_j=\\tens O$. Per quello che abbiamo appena dimostrato, il tensore a sinistra ha come componenti proprio i numeri $c_{ij}$; il tensore nullo ha tutte le componenti nulle; quindi ogni $c_{ij}$ è zero.

Che cosa ci guadagniamo? L'indipendenza garantisce che la scrittura di un tensore con le diadi sia **unica** (deduzione): le componenti $A_{ij}$ sono gli unici coefficienti possibili. E la formula $\\tens A=\\sum_{ij}A_{ij}\\,\\hat e_i\\otimes\\hat e_j$ è il ponte tra le due notazioni viste nella lezione precedente: permette di passare dalla notazione indiciale, con gli indici, a quella assoluta, senza indici. Le stesse diadi dei versori serviranno anche per definire le componenti dei tensori del IV ordine (§1.7).`,
      },
      {
        id: 'l12-8',
        kind: 'domanda',
        q: { id: 'l12-q2', kind: 'scelta', q: 'Un tensore ha tutte le componenti nulle tranne $A_{23}=5$. Come si scrive in notazione assoluta?', options: ['$5\\,\\hat e_2\\otimes\\hat e_3$', '$5\\,\\hat e_3\\otimes\\hat e_2$', '$5\\,(\\hat e_2+\\hat e_3)$', '$5\\,\\hat e_2\\cdot\\hat e_3$'], correct: 0, why: 'Nella somma della Prop 1.2.4 resta un solo termine, $A_{23}\\,\\hat e_2\\otimes\\hat e_3$: il primo indice va nel primo vettore della diade, il secondo nel secondo, perché $\\hat e_i\\otimes\\hat e_j$ ha il suo 1 nel posto $(i,j)$. La seconda opzione mette il 5 nel posto $(3,2)$; la terza è un vettore, non un tensore; la quarta è il numero 0.' },
      },
      {
        id: 'l12-9',
        kind: 'spiega',
        title: 'Il proiettore: l’ombra di un vettore su una retta',
        md: `Ora una diade speciale. Prendi un versore $\\hat e$, cioè un vettore lungo 1 (la dispensa scrive $\\hat e\\in\\mathcal N$, l'insieme dei versori), e costruisci la diade con $\\vet a=\\vet b=\\hat e$. Per la definizione di diade

$$(\\hat e\\otimes\\hat e)\\vet u=(\\hat e\\cdot\\vet u)\\,\\hat e.$$

Pensa all'ombra di un'asta sotto il sole a picco, proiettata su un binario orientato come $\\hat e$: il risultato ha la direzione di $\\hat e$ e lunghezza pari alla componente di $\\vet u$ lungo $\\hat e$, con il suo segno. Se $\\vet u$ forma un angolo ottuso con $\\hat e$, il numero $\\hat e\\cdot\\vet u$ è negativo e l'ombra punta al contrario di $\\hat e$. Per questo $\\hat e\\otimes\\hat e$ si chiama **proiettore in direzione $\\hat e$** (Def 1.2.5).

Perché serve proprio un versore? Se $\\hat e$ fosse lungo 2, il prodotto scalare darebbe il doppio della componente e la moltiplicazione per $\\hat e$ raddoppierebbe ancora: l'«ombra» risulterebbe quattro volte più lunga (deduzione). Con lunghezza 1 i due fattori non alterano nulla.

Nel modello a destra $\\vet u$ è viola, $\\hat e$ verde scuro e la proiezione lungo $\\hat e$ arancione.`,
        visual: LAB({ mode: 'proiettori', controls: ['dir', 'u'] }),
      },
      {
        id: 'l12-10',
        kind: 'spiega',
        title: 'Il proiettore ortogonale: ciò che resta',
        md: `Se dal vettore $\\vet u$ togli la sua ombra lungo $\\hat e$, che cosa resta? Resta la parte di $\\vet u$ che sta nel piano $\\pi$ perpendicolare a $\\hat e$. Il tensore che la estrae è il **proiettore ortogonale** (Def 1.2.5):

$$(\\tens I-\\hat e\\otimes\\hat e)\\vet u=\\vet u-(\\hat e\\cdot\\vet u)\\,\\hat e,$$

dove abbiamo usato $\\tens I\\vet u=\\vet u$ e il fatto che una differenza di tensori agisce vettore per vettore (passaggio aggiunto).

Controlliamo che il risultato stia davvero nel piano, cioè che sia perpendicolare a $\\hat e$ (passaggio aggiunto). Il suo prodotto scalare con $\\hat e$ vale $\\hat e\\cdot\\vet u-(\\hat e\\cdot\\vet u)(\\hat e\\cdot\\hat e)$, e siccome $\\hat e\\cdot\\hat e=1$ i due termini si cancellano. Ecco di nuovo perché $\\hat e$ deve essere un versore.

Mettendo insieme i due proiettori si ricostruisce il vettore di partenza:

$$\\vet u=(\\hat e\\otimes\\hat e)\\vet u+(\\tens I-\\hat e\\otimes\\hat e)\\vet u.$$

È la figura di p. 4: $\\vet u$ scomposto in una parte lungo $\\hat e$ e una parte sul piano $\\pi\\perp\\hat e$; nel modello la seconda è la freccia verde chiaro. Questa scomposizione tornerà quando leggeremo la formula di Eulero delle rotazioni.`,
      },
      {
        id: 'l12-11',
        kind: 'prova',
        title: 'Muovi ê e guarda le due parti',
        md: 'Nel modello: $\\vet u$ viola, $\\hat e$ verde scuro, la proiezione lungo $\\hat e$ arancione, quella sul piano verde chiaro. Muovi $\\hat e$ e osserva come le due parti si scambiano il «peso» di $\\vet u$.',
        tasks: [
          'Porta $\\hat e$ circa nella direzione di $\\vet u$: la parte sul piano diventa quasi nulla, perché quasi tutto $\\vet u$ sta lungo $\\hat e$.',
          'Rendi $\\hat e$ circa perpendicolare a $\\vet u$: ora è $(\\hat e\\otimes\\hat e)\\vet u$ a sparire.',
          'Supera i 90° tra $\\hat e$ e $\\vet u$: $\\hat e\\cdot\\vet u$ diventa negativo e la freccia arancione punta al contrario di $\\hat e$.',
          'Controlla nel pannello che le due parti sommate diano sempre $\\vet u$.',
        ],
        visual: LAB({ mode: 'proiettori', controls: ['dir', 'u'] }),
      },
      {
        id: 'l12-12',
        kind: 'domanda',
        q: { id: 'l12-q3', kind: 'scelta', q: 'Il versore $\\hat e$ è perpendicolare a $\\vet u$. Quanto vale $(\\tens I-\\hat e\\otimes\\hat e)\\vet u$?', options: ['$\\vet u$', '$\\vet 0$', '$\\hat e$', '$-\\vet u$'], correct: 0, why: 'Se $\\hat e\\perp\\vet u$, la componente $\\hat e\\cdot\\vet u$ è zero: l\'ombra lungo $\\hat e$ è nulla e tutto $\\vet u$ sta già nel piano $\\pi$, quindi il proiettore ortogonale lo lascia com\'è. Il vettore nullo è la risposta giusta per l\'altro proiettore, $(\\hat e\\otimes\\hat e)\\vet u$.' },
      },
      {
        id: 'l12-13',
        kind: 'spiega',
        title: 'Somma e composizione: macchine in parallelo e in serie',
        md: `Ultima tappa: come si combinano due tensori $\\tens A$ e $\\tens B$. Ci sono due modi naturali.

La **somma** (Def 1.2.6) mette le due macchine «in parallelo»: lo stesso vettore entra in entrambe e le uscite si sommano, $(\\tens A+\\tens B)\\vet u=\\tens A\\vet u+\\tens B\\vet u$. In componenti si sommano i posti corrispondenti, $(\\tens A+\\tens B)_{ij}=A_{ij}+B_{ij}$.

Il **prodotto di composizione** (Def 1.2.7) mette le macchine «in serie»: il vettore passa prima in $\\tens B$, e ciò che esce entra in $\\tens A$,

$$(\\tens A\\tens B)\\vet u=\\tens A(\\tens B\\vet u),\\qquad (\\tens A\\tens B)_{ij}=\\textstyle\\sum_kA_{ik}B_{kj}.$$

Attenzione all'ordine di lettura: nella scrittura $\\tens A\\tens B\\vet u$ agisce per primo il tensore più vicino al vettore, cioè $\\tens B$; si legge da destra verso sinistra. In componenti la composizione è il prodotto righe per colonne delle due matrici, quello che conosci dall'algebra lineare.

Una catena di macchine può dare un risultato diverso se ne scambi l'ordine: lo vediamo ora con i numeri.`,
      },
      {
        id: 'l12-14',
        kind: 'numeri',
        title: 'Taglio e rotazione non commutano',
        md: `Prendiamo dal modello $\\tens A$ = taglio, che inclina $\\hat e_2$ verso $x$, e $\\tens B$ = rotazione di 30° attorno a $z$. Facendo i prodotti righe per colonne si trova

$$(\\tens A\\tens B)_{11}=${f(AB[0], 4)},\\qquad (\\tens B\\tens A)_{11}=${f(BA[0], 4)}.$$

Sono diversi: «prima ruoto e poi taglio» non è «prima taglio e poi ruoto». In generale $\\tens A\\tens B\\neq\\tens B\\tens A$; quando i due prodotti coincidono si dice che i due tensori **commutano** (Def 1.2.7).

Alcuni tensori però commutano con tutti. L'identità $\\tens I$ e il tensore nullo $\\tens O$ certamente; e più in generale, osserva la dispensa (§1.2.6), commutano con ogni tensore **tutti e soli** i tensori **sferici** $\\lambda\\tens I$, quelli che dilatano ogni vettore dello stesso fattore $\\lambda$. Un'idea del perché commutano (deduzione): moltiplicare tutto per $\\lambda$ prima o dopo una trasformazione lineare dà lo stesso risultato, per l'omogeneità. Il «soli» dice che nessun altro tensore ha questa proprietà.`,
        values: { AB11: AB[0], BA11: BA[0] },
      },
      {
        id: 'l12-15',
        kind: 'spiega',
        title: 'Attenzione a tre errori',
        md: `Tre errori ricorrono su questi argomenti.

1. **Dire che $\\vet a\\otimes\\vet b$ dà vettori paralleli a $\\vet b$.** Sono paralleli ad $\\vet a$. L'errore nasce dal fatto che $\\vet b$ «tocca» il vettore in ingresso; ma lo tocca solo per misurarlo, con un prodotto scalare, cioè decide quanto lungo sarà il risultato, non la sua direzione.
2. **Dare per scontato che $\\tens A\\tens B=\\tens B\\tens A$.** Con i numeri si è abituati a scambiare i fattori, ma la composizione è una catena di trasformazioni: hai appena visto che taglio e rotazione danno risultati diversi nei due ordini. Gli unici tensori che commutano con tutti sono i sferici $\\lambda\\tens I$.
3. **Sbagliare l'ordine nella composizione.** In $\\tens A\\tens B\\vet u$ agisce prima $\\tens B$, perché $(\\tens A\\tens B)\\vet u=\\tens A(\\tens B\\vet u)$: si legge da destra a sinistra, partendo dal vettore.`,
      },
      {
        id: 'l12-16',
        kind: 'domanda',
        q: { id: 'l12-q4', kind: 'scelta', q: 'Nella scrittura $\\tens A\\tens B\\vet u$, quale tensore agisce per primo su $\\vet u$?', options: ['$\\tens B$', '$\\tens A$', 'Agiscono insieme, l\'ordine non conta', 'Dipende dal riferimento'], correct: 0, why: 'Per la Def 1.2.7 $(\\tens A\\tens B)\\vet u=\\tens A(\\tens B\\vet u)$: prima $\\tens B$, poi $\\tens A$ sul risultato. L\'ordine conta, perché in generale $\\tens A\\tens B\\neq\\tens B\\tens A$; e non dipende dal riferimento, perché la definizione è in notazione assoluta.' },
      },
      {
        id: 'l12-17',
        kind: 'riassunto',
        md: `**Il filo della lezione.** La diade $\\vet a\\otimes\\vet b$ è il tensore più semplice: misura il vettore lungo $\\vet b$ e restituisce un multiplo di $\\vet a$, e le sue componenti sono $a_ib_j$. Le nove diadi dei versori hanno un solo 1 nella matrice e sono una base di $\\mathrm{Lin}$: ogni tensore è la loro combinazione con coefficienti le sue componenti, e in modo unico perché sono indipendenti. Con un versore $\\hat e$ la diade $\\hat e\\otimes\\hat e$ diventa il proiettore lungo $\\hat e$, e $\\tens I-\\hat e\\otimes\\hat e$ prende ciò che resta sul piano perpendicolare. Infine i tensori si sommano «in parallelo» e si compongono «in serie», e la composizione in generale non commuta.

- Diade: $(\\vet a\\otimes\\vet b)\\vet u=(\\vet b\\cdot\\vet u)\\vet a$, $(\\vet a\\otimes\\vet b)_{ij}=a_ib_j$ (Def 1.2.3).
- Base di Lin: $\\tens A=\\sum_{ij}A_{ij}\\,\\hat e_i\\otimes\\hat e_j$ (Prop 1.2.4).
- Proiettori: $\\vet u=(\\hat e\\otimes\\hat e)\\vet u+(\\tens I-\\hat e\\otimes\\hat e)\\vet u$ (Def 1.2.5).
- Composizione: $(\\tens A\\tens B)\\vet u=\\tens A(\\tens B\\vet u)$, $(\\tens A\\tens B)_{ij}=\\sum_kA_{ik}B_{kj}$ (Def 1.2.7); commutano con tutti solo i $\\lambda\\tens I$ (§1.2.6).`,
        orale: ['Definire la diade e dimostrare che le 9 diadi $\\hat e_i\\otimes\\hat e_j$ sono una base di Lin. (dispensa, domanda 2)', 'Proiettore lungo $\\hat e$ e proiettore ortogonale: definizione e interpretazione geometrica. (dispensa, domanda 3)'],
      },
    ],
  },

  // ================================================================== c1.3
  {
    concept: 'c1.3',
    title: 'Simmetrico, antisimmetrico, vettore assiale',
    minutes: 27,
    source: D(1, '1.3', 'Def 1.3.1–1.3.2, Teo 1.3.3–1.3.4', '5–6'),
    visual: SVG('matrici', { focus: 'decomposizione' }),
    steps: [
      {
        id: 'l13-0',
        kind: 'spiega',
        title: 'Dove siamo e dove andiamo',
        md: `Nelle due lezioni precedenti abbiamo visto che un tensore è una trasformazione lineare dei vettori, che ha nove componenti e che si costruisce con le diadi. Ora impariamo a **smontarlo** in pezzi con un significato geometrico preciso.

L'idea guida, che diventerà fisica nel Cap. 2, è questa: il modo in cui un piccolo pezzo di materiale cambia si può separare in una parte che lo **deforma** davvero e una parte che lo fa solo **ruotare**. Matematicamente le due parti saranno un tensore simmetrico e uno antisimmetrico.

Le tappe: prima definiamo il trasposto, l'operazione che serve per parlare di simmetria; poi i tensori simmetrici e antisimmetrici e quante componenti hanno; poi il I teorema di decomposizione, con la dimostrazione di esistenza e di unicità, che all'orale si chiede sempre; infine scopriamo che un tensore antisimmetrico agisce come un prodotto vettoriale, e il vettore che lo descrive si chiama vettore assiale.`,
      },
      {
        id: 'l13-1',
        kind: 'spiega',
        title: 'Il trasposto: spostare un tensore dall’altra parte del prodotto scalare',
        md: `Partiamo da un numero: $(\\tens A\\vet u)\\cdot\\vet v$. Lo ottieni trasformando $\\vet u$ con $\\tens A$ e poi misurando il risultato lungo $\\vet v$. Ci chiediamo: esiste un tensore che dia lo stesso numero lavorando «dall'altra parte», cioè trasformando $\\vet v$ e misurando lungo $\\vet u$? Esiste, e si chiama **trasposto** di $\\tens A$ (Def 1.3.1):

$$(\\tens A\\vet u)\\cdot\\vet v=(\\tens A^T\\vet v)\\cdot\\vet u\\quad\\forall\\vet u,\\vet v.$$

Ricorda questa definizione come una regola di spostamento: un tensore può passare da un lato all'altro del prodotto scalare purché diventi il suo trasposto. La useremo moltissimo, già nella lezione sui tensori ortogonali (§1.5).

In componenti il trasposto scambia gli indici, $A^T_{ij}=A_{ji}$: la matrice si ribalta rispetto alla diagonale. Valgono quattro proprietà (§1.3.1):
- $(\\tens A+\\tens B)^T=\\tens A^T+\\tens B^T$;
- $(\\tens A\\tens B)^T=\\tens B^T\\tens A^T$: **l'ordine si inverte**, come quando ti togli prima le scarpe e poi le calze, al contrario di come le hai messe;
- $(\\tens A^T)^T=\\tens A$;
- $(\\vet a\\otimes\\vet b)^T=\\vet b\\otimes\\vet a$: trasporre una diade scambia i due vettori.`,
      },
      {
        id: 'l13-d1',
        kind: 'domanda',
        q: { id: 'l13-q2', kind: 'vf', q: '$(\\tens A\\tens B)^T=\\tens A^T\\tens B^T$.', answer: false, why: 'L\'ordine si inverte: $(\\tens A\\tens B)^T=\\tens B^T\\tens A^T$ (§1.3.1). L\'errore è tentante perché per la somma l\'ordine non conta; ma la composizione non è commutativa, e scrivere $\\tens A^T\\tens B^T$ dà in generale un tensore diverso.' },
      },
      {
        id: 'l13-2',
        kind: 'spiega',
        title: 'Simmetrici e antisimmetrici: quante componenti?',
        md: `Con il trasposto possiamo distinguere due famiglie (Def 1.3.2). I tensori che restano uguali trasposti sono i **simmetrici**; quelli che cambiano segno sono gli **antisimmetrici**:

$$\\mathrm{Sym}:=\\{\\tens A=\\tens A^T\\},\\qquad \\mathrm{Skw}:=\\{\\tens W=-\\tens W^T\\}.$$

Contiamo le componenti. Un simmetrico ha la matrice speculare rispetto alla diagonale, $A_{ij}=A_{ji}$: sono libere le 3 componenti della diagonale e le 3 sopra di essa, quelle sotto sono copie. Totale **6** componenti distinte.

In un antisimmetrico vale $W_{ij}=-W_{ji}$. Guarda che cosa succede sulla diagonale, dove $i=j$: la condizione diventa $W_{ii}=-W_{ii}$, cioè una componente uguale alla propria opposta. L'unico numero con questa proprietà è lo zero, quindi la **diagonale è nulla**. Restano le 3 componenti sopra la diagonale; quelle sotto sono le loro opposte. Totale **3** componenti indipendenti.

Osserva che $6+3=9$, le componenti di un tensore qualunque: è un primo indizio di quello che dirà il teorema del prossimo passo. Nel diagramma a destra puoi scrivere i numeri di $[\\tens A]$ e vedere le due parti.`,
      },
      {
        id: 'l13-d2',
        kind: 'domanda',
        q: { id: 'l13-q1', kind: 'vf', q: 'Un tensore antisimmetrico ha 6 componenti indipendenti.', answer: false, why: 'Sono 3. La diagonale è nulla, perché $W_{ii}=-W_{ii}$ obbliga $W_{ii}=0$, e delle 6 componenti fuori diagonale solo 3 sono libere, perché le altre sono le loro opposte. Il numero 6 vale per i simmetrici.' },
      },
      {
        id: 'l13-2b',
        kind: 'spiega',
        title: 'Il I teorema di decomposizione: che cosa afferma',
        md: `Il conteggio $9=6+3$ suggerisce che un tensore qualunque si possa spezzare in un pezzo simmetrico e uno antisimmetrico. Il **Teo 1.3.3**, I teorema di decomposizione in somma, dice esattamente questo: per ogni $\\tens A$ **esistono e sono unici** $\\tens E\\in\\mathrm{Sym}$ e $\\tens W\\in\\mathrm{Skw}$ tali che $\\tens A=\\tens E+\\tens W$, e sono

$$\\tens E=\\operatorname{sym}\\tens A:=\\tfrac12(\\tens A+\\tens A^T),\\qquad \\tens W=\\operatorname{skw}\\tens A:=\\tfrac12(\\tens A-\\tens A^T).$$

Da dove vengono queste formule? Un'idea per ricordarle (deduzione): se $\\tens A=\\tens E+\\tens W$, trasponendo si ha $\\tens A^T=\\tens E-\\tens W$; sommando le due uguaglianze si isola $\\tens E$, sottraendole si isola $\\tens W$. A parole: la parte simmetrica è la «media» tra il tensore e il suo trasposto, quella antisimmetrica è la «semidifferenza».

L'enunciato contiene due affermazioni distinte, e vanno dimostrate entrambe. **Esistenza**: le due parti proposte sono davvero una simmetrica e una antisimmetrica, e sommate ridanno $\\tens A$. **Unicità**: non c'è nessun altro modo di fare la stessa scomposizione.`,
      },
      {
        id: 'l13-3',
        kind: 'derivazione',
        title: 'I teorema di decomposizione: esistenza',
        md: 'Dobbiamo verificare tre cose: che $\\tens E$ sia simmetrico, che $\\tens W$ sia antisimmetrico, e che la loro somma sia $\\tens A$. Le prime due sono controllate sotto, nelle verifiche. Per la terza la dispensa scrive direttamente $\\tens E+\\tens W=\\tens A$; qui la sviluppiamo su una componente qualunque, usando $A^T_{pq}=A_{qp}$ (passaggio aggiunto).',
        source: D(1, '1.3.3', 'Teo 1.3.3', 5),
        der: {
          sample: (r) => {
            const o: R = { p: idx(r), q: idx(r) };
            putMat(o, 'A', T.randMat(r));
            return o;
          },
          lines: [
            { tex: '(\\tens E+\\tens W)_{pq}', why: 'Sommiamo le due parti proposte e guardiamo una componente qualunque, quella in riga $p$ e colonna $q$.', val: (v) => T.add(T.sym(mat(v, 'A')), T.skw(mat(v, 'A')))[3 * v.p + v.q] },
            {
              tex: '=\\tfrac12(A_{pq}+A_{qp})+\\tfrac12(A_{pq}-A_{qp})',
              why: 'Abbiamo scritto le due definizioni in componenti. L\'unica cosa da ricordare è che la componente $pq$ del trasposto è la componente $qp$ del tensore: $A^T_{pq}=A_{qp}$.',
              aggiunto: true,
              val: (v) => {
                const A = mat(v, 'A');
                return 0.5 * (T.at(A, v.p, v.q) + T.at(A, v.q, v.p)) + 0.5 * (T.at(A, v.p, v.q) - T.at(A, v.q, v.p));
              },
            },
            {
              tex: '=A_{pq}',
              why: 'I due mezzi di $A_{pq}$ si sommano e danno $A_{pq}$; i due termini in $A_{qp}$ hanno segni opposti e si cancellano. Siccome la componente era qualunque, $\\tens E+\\tens W=\\tens A$.',
              eq: 'Teo 1.3.3',
              ask: { q: 'Che cosa resta della somma?', options: ['$A_{pq}$', '$A_{qp}$', '$\\frac12A_{pq}$', '$0$'], correct: 0, why: '$\\frac12A_{pq}+\\frac12A_{pq}=A_{pq}$, mentre $+\\frac12A_{qp}-\\frac12A_{qp}=0$. Chi risponde $A_{qp}$ ha cancellato i termini sbagliati; chi risponde $\\frac12A_{pq}$ ne ha contato uno solo.' },
              val: (v) => T.at(mat(v, 'A'), v.p, v.q),
            },
          ],
          checks: [
            { what: '$\\tens E^T=\\frac12(\\tens A^T+\\tens A)=\\tens E$: E simmetrico', f: (v) => [T.sym(mat(v, 'A'))[3 * v.p + v.q], T.sym(mat(v, 'A'))[3 * v.q + v.p]] },
            { what: '$\\tens W^T=\\frac12(\\tens A^T-\\tens A)=-\\tens W$: W antisimmetrico', f: (v) => [T.skw(mat(v, 'A'))[3 * v.p + v.q], -T.skw(mat(v, 'A'))[3 * v.q + v.p]] },
          ],
        },
      },
      {
        id: 'l13-3b',
        kind: 'spiega',
        title: 'Perché le due parti hanno la simmetria giusta',
        md: `Nelle verifiche sotto la derivazione compaiono le altre due metà dell'esistenza, quelle che la dispensa scrive per prime. Leggiamole con calma, perché usano le proprietà del trasposto del passo iniziale.

Per la parte simmetrica: $\\tens E^T=\\tfrac12(\\tens A+\\tens A^T)^T$. Il trasposto di una somma è la somma dei trasposti, e trasporre due volte riporta al tensore di partenza, $(\\tens A^T)^T=\\tens A$; quindi $\\tens E^T=\\tfrac12(\\tens A^T+\\tens A)=\\tens E$. È simmetrico.

Per la parte antisimmetrica, con gli stessi due passaggi: $\\tens W^T=\\tfrac12(\\tens A^T-\\tens A)$. Questa è la stessa differenza di prima con i termini scambiati, cioè $-\\tfrac12(\\tens A-\\tens A^T)=-\\tens W$. È antisimmetrico.

L'esistenza è dimostrata: abbiamo esibito due tensori con le proprietà richieste. Ma attenzione, questo non esclude che esistano anche altre coppie simmetrico più antisimmetrico con la stessa somma. Escluderlo è il compito dell'unicità.`,
      },
      {
        id: 'l13-4',
        kind: 'derivazione',
        title: 'I teorema di decomposizione: unicità',
        md: 'Per dimostrare che la scomposizione è unica supponiamo che ce ne siano due e mostriamo che coincidono. Il cuore dell\'argomento è un tensore che è contemporaneamente simmetrico e antisimmetrico.',
        source: D(1, '1.3.3', 'Teo 1.3.3', 5),
        der: {
          lines: [
            { tex: '\\tens A=\\tens E+\\tens W=\\tens E\'+\\tens W\'', why: 'Supponiamo che $\\tens A$ si scriva in due modi, con $\\tens E,\\tens E\'$ simmetrici e $\\tens W,\\tens W\'$ antisimmetrici.' },
            {
              tex: '\\tens E-\\tens E\'=\\tens W\'-\\tens W',
              why: 'Abbiamo portato le parti simmetriche a sinistra e quelle antisimmetriche a destra, sottraendo $\\tens E\'$ e $\\tens W$ da entrambi i membri.',
              ask: { q: 'Che cosa ha di speciale il tensore $\\tens E-\\tens E\'=\\tens W\'-\\tens W$?', options: ['È simmetrico e antisimmetrico insieme', 'È ortogonale', 'Ha determinante nullo', 'È sferico'], correct: 0, why: 'A sinistra è differenza di due simmetrici, quindi simmetrico (il trasposto di una differenza è la differenza dei trasposti); a destra è differenza di due antisimmetrici, quindi antisimmetrico. Le altre proprietà non hanno motivo di valere.' },
            },
            { tex: '(\\tens E-\\tens E\')^T=\\tens E-\\tens E\'=-(\\tens E-\\tens E\')', why: 'Chiamiamo $\\tens S$ questo tensore. Essere simmetrico dice $\\tens S^T=\\tens S$; essere antisimmetrico dice $\\tens S^T=-\\tens S$. Messe insieme: $\\tens S$ è uguale al proprio opposto.' },
            { tex: '\\tens E-\\tens E\'=\\tens O\\ \\Rightarrow\\ \\tens E=\\tens E\',\\ \\ \\tens W=\\tens W\'', why: 'Un tensore uguale al proprio opposto ha ogni componente uguale alla propria opposta, quindi nulla: è il tensore nullo $\\tens O$. Allora $\\tens E=\\tens E\'$ e, dalla seconda riga, $\\tens W=\\tens W\'$: le due decomposizioni coincidono.', eq: 'Teo 1.3.3' },
          ],
        },
      },
      {
        id: 'l13-4b',
        kind: 'spiega',
        title: 'Che cosa dice il teorema, e che cosa ci resta in mano',
        md: `Rileggiamo il risultato. Ogni tensore, comunque complicato, si separa **in un solo modo** in una parte simmetrica, con 6 componenti, e una antisimmetrica, con 3. Il fatto chiave dell'unicità è che l'unico tensore che sta in entrambe le famiglie è $\\tens O$.

Un caso particolare conferma l'enunciato (deduzione). Se $\\tens A$ è già simmetrico, $\\tens A^T=\\tens A$ e le formule danno $\\tens E=\\tens A$, $\\tens W=\\tens O$: la parte antisimmetrica sparisce, come deve. Se $\\tens A$ è antisimmetrico succede il contrario.

A che cosa servirà? Nel Cap. 2 il gradiente di spostamento $\\tens H$ si scomporrà proprio così, $\\tens H=\\tens E+\\tens W$: la parte simmetrica $\\tens E$ misura la deformazione vera, quella antisimmetrica $\\tens W$ una rotazione rigida infinitesima.

Ci resta da capire che cosa fa geometricamente la parte antisimmetrica. Ha solo tre numeri: viene il sospetto che si possa descrivere con un vettore. È così, ed è il prossimo passo.`,
      },
      {
        id: 'l13-5',
        kind: 'prova',
        title: 'Scomponi un tensore',
        md: 'Nel diagramma a destra scrivi i numeri di $[\\tens A]$ e osserva le due parti, $\\operatorname{sym}\\tens A$ e $\\operatorname{skw}\\tens A$. Verifica con i tuoi occhi i conteggi e i casi particolari che abbiamo appena discusso.',
        tasks: [
          'Con «generico»: la diagonale di $\\operatorname{skw}\\tens A$ è nulla, quella di $\\operatorname{sym}\\tens A$ è la diagonale di $\\tens A$.',
          'Premi «simmetrico»: la parte antisimmetrica sparisce del tutto, come previsto dalle formule.',
          'Premi «antisimmetrico»: sparisce quella simmetrica, e nel pannello leggi il suo vettore assiale.',
          'Cambia $A_{12}$ e $A_{21}$ in modo diverso: la loro media va in $\\operatorname{sym}\\tens A$, la loro semidifferenza in $\\operatorname{skw}\\tens A$.',
        ],
        visual: SVG('matrici', { focus: 'decomposizione' }),
      },
      {
        id: 'l13-6',
        kind: 'spiega',
        title: 'Il vettore assiale: un antisimmetrico è un prodotto vettoriale',
        md: `Un tensore antisimmetrico ha tre componenti indipendenti, come un vettore. Il **Teo 1.3.4** dice che non è una coincidenza: per ogni $\\tens W\\in\\mathrm{Skw}$ esiste un unico vettore $\\vet w$, detto **vettore assiale**, tale che

$$\\tens W\\vet u=\\vet w\\wedge\\vet u\\quad\\forall\\vet u,\\qquad [\\tens W]=\\begin{bmatrix}0&-w_3&w_2\\\\w_3&0&-w_1\\\\-w_2&w_1&0\\end{bmatrix}.$$

Il simbolo $\\wedge$ è il prodotto vettoriale. Quindi applicare $\\tens W$ a un vettore equivale a farne il prodotto vettoriale con $\\vet w$. Le tre componenti indipendenti di $[\\tens W]$ sono, a meno del segno, le tre componenti di $\\vet w$.

Puoi verificare la matrice da solo (passaggio aggiunto). Sviluppa $\\vet w\\wedge\\vet u$: la sua prima componente è $w_2u_3-w_3u_2$. Con la regola righe per colonna, la prima riga di $[\\tens W]$ applicata a $\\vet u$ dà $0\\cdot u_1-w_3u_2+w_2u_3$: è lo stesso numero. Le altre due righe si controllano allo stesso modo.

Per ricordare i segni: sopra la diagonale, leggendo da sinistra, ci sono $-w_3$, $w_2$ e poi $-w_1$; sotto ci sono gli opposti.`,
        visual: LAB({ mode: 'assiale', controls: ['dir', 'wLen', 'u'] }),
      },
      {
        id: 'l13-6b',
        kind: 'spiega',
        title: 'Che cosa fa geometricamente un antisimmetrico',
        md: `Il prodotto vettoriale ha proprietà che conosci, e ora passano al tensore $\\tens W$ (Oss. dopo il Teo 1.3.4).

Primo: $\\tens W\\vet w=\\vet w\\wedge\\vet w=\\vet 0$, perché il prodotto vettoriale di un vettore con sé stesso è nullo. Il vettore assiale è quindi una direzione che $\\tens W$ manda in zero: si dice che sta nel **nucleo** di $\\tens W$.

Secondo: $\\tens W\\vet u$ è **perpendicolare sia a $\\vet u$ sia a $\\vet w$**, perché il prodotto vettoriale è perpendicolare a entrambi i suoi fattori.

Mettile insieme e prova a immaginare un corpo rigido che gira attorno a un asse diretto come $\\vet w$: le velocità dei suoi punti sono perpendicolari all'asse e alla congiungente con l'asse, e i punti sull'asse non si muovono (esempio aggiunto). È lo stesso schema, e infatti la dispensa osserva che il prodotto vettoriale richiama l'idea di rotazione, che vedremo nel §1.5. Nel modello $\\vet w$ è verde scuro, $\\vet u$ viola e $\\tens W\\vet u$ arancione.`,
        visual: LAB({ mode: 'assiale', controls: ['dir', 'wLen', 'u'] }),
      },
      {
        id: 'l13-7',
        kind: 'prova',
        title: 'W u è sempre perpendicolare',
        md: 'Nel modello: $\\vet w$ verde scuro, $\\vet u$ viola, $\\tens W\\vet u$ arancione. Controlla le due proprietà dell\'osservazione e la linearità.',
        tasks: [
          'Ruota $\\vet w$: nel pannello $\\tens W\\vet u\\cdot\\vet u$ e $\\tens W\\vet u\\cdot\\vet w$ restano 0.',
          'Porta $\\vet w$ parallelo a $\\vet u$: $\\tens W\\vet u$ si annulla, perché $\\vet u$ sta ora nel nucleo.',
          'Raddoppia $|\\vet w|$: $\\tens W\\vet u$ raddoppia (linearità).',
        ],
        visual: LAB({ mode: 'assiale', controls: ['dir', 'wLen', 'u'] }),
      },
      {
        id: 'l13-8',
        kind: 'domanda',
        q: { id: 'l13-q3', kind: 'scelta', q: 'Se $\\vet w$ è il vettore assiale di $\\tens W$, quanto vale $\\tens W\\vet w$?', options: ['$\\vet 0$', '$\\vet w$', '$|\\vet w|^2\\hat e_1$', 'Dipende dal riferimento'], correct: 0, why: '$\\tens W\\vet w=\\vet w\\wedge\\vet w=\\vet 0$: il vettore assiale sta nel nucleo di $\\tens W$. Rispondere $\\vet w$ significa confondere «direzione che non si muove» (sarà l\'asse di una rotazione, §1.5.2) con «direzione mandata in zero». Il risultato non dipende dal riferimento, perché è una proprietà del prodotto vettoriale.' },
      },
      {
        id: 'l13-8b',
        kind: 'spiega',
        title: 'Attenzione a tre errori',
        md: `Tre errori ricorrono su questa lezione.

1. **Dimenticare l'unicità.** All'orale si chiede «enuncia e dimostra il teorema di decomposizione»: la dimostrazione ha due parti, esistenza **e** unicità. Mostrare che $\\tens E+\\tens W=\\tens A$ è solo metà del lavoro; l'altra metà è l'argomento del tensore simmetrico e antisimmetrico, quindi nullo.
2. **Sbagliare i segni della matrice di $\\tens W$.** Sopra la diagonale ci sono $-w_3$, $w_2$, $-w_1$. Se hai un dubbio non tirare a indovinare: sviluppa una componente di $\\vet w\\wedge\\vet u$ e confrontala con la riga corrispondente, come abbiamo fatto.
3. **Pensare che un antisimmetrico abbia 6 componenti indipendenti.** Sono 3: la diagonale è nulla e metà delle componenti fuori diagonale sono opposte alle altre. Sono proprio le 3 componenti del vettore assiale.`,
      },
      {
        id: 'l13-9',
        kind: 'riassunto',
        md: `**Il filo della lezione.** Il trasposto è il tensore che permette di spostare $\\tens A$ dall'altra parte di un prodotto scalare; in componenti scambia gli indici. Con esso si definiscono i simmetrici, con 6 componenti, e gli antisimmetrici, con diagonale nulla e 3 componenti. Il I teorema di decomposizione afferma che ogni tensore è, in un solo modo, somma di una parte simmetrica e una antisimmetrica: l'esistenza si verifica con le formule esplicite, l'unicità perché un tensore simmetrico e antisimmetrico è nullo. Infine la parte antisimmetrica agisce come un prodotto vettoriale per il vettore assiale, e questo richiama una rotazione.

- Trasposto: $(\\tens A\\vet u)\\cdot\\vet v=(\\tens A^T\\vet v)\\cdot\\vet u$, $A^T_{ij}=A_{ji}$, $(\\tens A\\tens B)^T=\\tens B^T\\tens A^T$ (Def 1.3.1).
- Decomposizione: $\\tens A=\\tfrac12(\\tens A+\\tens A^T)+\\tfrac12(\\tens A-\\tens A^T)$, unica (Teo 1.3.3).
- Vettore assiale: $\\tens W\\vet u=\\vet w\\wedge\\vet u$, $\\tens W\\vet w=\\vet 0$ (Teo 1.3.4).`,
        orale: ['Enunciare e dimostrare il I teorema di decomposizione (esistenza e unicità). (dispensa, domanda 4)', "Perché un tensore antisimmetrico ha diagonale nulla? Che cos'è il vettore assiale? (dispensa, domanda 5)"],
      },
    ],
  },

  // ================================================================== c1.4
  {
    concept: 'c1.4',
    title: 'Determinante, ortogonali e formula di Eulero',
    minutes: 38,
    source: D(1, '1.4–1.5', 'Def 1.4.1–1.4.2, 1.5.1, Prop 1.5.2, Teo 1.5.3, eq. (1.1)', '6–8'),
    visual: LAB({ mode: 'trasforma', presets: ['taglio', 'sferico', 'riflessione', 'singolare', 'generico'], controls: ['preset'], cube: true, A: PRESETS.sferico.A }),
    steps: [
      {
        id: 'l14-0',
        kind: 'spiega',
        title: 'Dove siamo e dove andiamo',
        md: `Nella lezione precedente abbiamo smontato un tensore in una parte simmetrica e una antisimmetrica, e abbiamo intuito che la parte antisimmetrica ha a che fare con le rotazioni. Ora diamo forma precisa a quell'intuizione.

Il percorso ha tre tappe. Prima il **determinante**, un numero che dice di quanto un tensore ingrandisce o rimpicciolisce i volumi, e l'**inverso**, cioè la trasformazione che disfa quella data. Poi i **tensori ortogonali**, le trasformazioni rigide che non alterano lunghezze e angoli; dimostreremo le loro due proprietà fondamentali e li divideremo in rotazioni e riflessioni. Infine la **formula di Eulero**, che scrive ogni rotazione con il tensore antisimmetrico della lezione precedente, e la sua versione per angoli piccoli, le **rotazioni infinitesime**, che ritroveremo nel Cap. 2.

Le domande d'orale 6 e 7 della dispensa coprono proprio queste dimostrazioni.`,
      },
      {
        id: 'l14-1',
        kind: 'spiega',
        title: 'Il determinante misura come cambiano i volumi',
        md: `Parti da un'immagine: tre vettori $\\vet u,\\vet v,\\vet w$ non complanari individuano un parallelepipedo. Il suo volume, con un segno, è il **prodotto misto** $\\vet u\\cdot\\vet v\\wedge\\vet w$: il prodotto vettoriale $\\vet v\\wedge\\vet w$ ha per modulo l'area della base, e il prodotto scalare con $\\vet u$ moltiplica per l'altezza. Il segno è positivo se la terna è destrorsa (deduzione).

Ora trasforma i tre vettori con $\\tens A$: ottieni un nuovo parallelepipedo. Il **determinante** è il rapporto tra il nuovo volume e quello vecchio (Def 1.4.1):

$$\\det\\tens A:=\\frac{\\tens A\\vet u\\cdot\\tens A\\vet v\\wedge\\tens A\\vet w}{\\vet u\\cdot\\vet v\\wedge\\vet w}\\quad\\text{per }\\vet u,\\vet v,\\vet w\\text{ linearmente indipendenti}.$$

La richiesta di indipendenza serve a non dividere per zero: tre vettori complanari hanno volume nullo. La dispensa precisa che il rapporto **non dipende dalla terna** scelta: qualunque parallelepipedo prendi, $\\tens A$ moltiplica il suo volume per lo stesso fattore. Quindi $\\det\\tens A$ è il fattore con cui $\\tens A$ moltiplica i volumi, **con segno**: se è negativo, la terna trasformata è diventata sinistrorsa, come un oggetto visto allo specchio (deduzione).

Nel modello vedi il cubo unitario e il suo trasformato.`,
      },
      {
        id: 'l14-2',
        kind: 'prova',
        title: 'Volume e segno',
        md: 'Cambia tensore e leggi nel pannello $\\det\\tens A$ e il volume del cubo trasformato. Per ogni caso chiediti: che cosa succede al volume, e la terna resta destrorsa?',
        tasks: [
          `Sferico $1{,}3\\,\\tens I$: $\\det=${f(NUMERI_M1.det.sferico, 4)}=1{,}3^3$. Ogni spigolo si allunga di 1,3, il volume del cubo di $1{,}3^3$.`,
          `Taglio: il cubo si inclina ma $\\det=${f(NUMERI_M1.det.taglio)}$: base e altezza non cambiano, quindi neanche il volume (deduzione).`,
          `Riflessione: $\\det=${f(NUMERI_M1.det.riflessione)}$; il solido diventa arancione: la terna immagine è sinistrorsa.`,
          `Singolare: $\\det=${f(NUMERI_M1.det.singolare)}$, il cubo si schiaccia su un piano e il volume si annulla.`,
        ],
        visual: LAB({ mode: 'trasforma', presets: ['sferico', 'taglio', 'riflessione', 'singolare', 'generico'], controls: ['preset'], cube: true, A: PRESETS.sferico.A }),
      },
      {
        id: 'l14-3',
        kind: 'spiega',
        title: 'Le proprietà del determinante, e perché non è lineare',
        md: `Il significato di fattore di volume rende naturali le proprietà della dispensa (§1.4).

- $\\det(\\tens A\\tens B)=\\det\\tens A\\,\\det\\tens B$. Se $\\tens B$ moltiplica i volumi per 2 e poi $\\tens A$ per 3, in serie li moltiplicano per 6.
- $\\det\\tens A^T=\\det\\tens A$: trasporre non cambia il determinante.
- $\\det\\tens A^{-1}=1/\\det\\tens A$: la trasformazione inversa riporta il volume com'era, quindi divide per lo stesso fattore.

Il box Attenzione di p. 6 segnala invece che il determinante **non è lineare**. Primo, $\\det(\\tens A+\\tens B)\\neq\\det\\tens A+\\det\\tens B$ in generale. Secondo, $\\det(\\lambda\\tens A)=\\lambda^3\\det\\tens A$, non $\\lambda\\det\\tens A$. Il cubo sferico del modello mostra il perché: moltiplicare il tensore per $\\lambda$ allunga di $\\lambda$ ciascuno dei **tre** spigoli, e il volume, che è un prodotto di tre lunghezze, cresce di $\\lambda^3$.`,
      },
      {
        id: 'l14-d1',
        kind: 'domanda',
        q: { id: 'l14-q2', kind: 'scelta', q: 'Quanto vale $\\det(2\\tens A)$?', options: ['$8\\det\\tens A$', '$2\\det\\tens A$', '$4\\det\\tens A$', '$\\det\\tens A+2$'], correct: 0, why: 'Moltiplicare il tensore per 2 raddoppia ciascuno dei tre spigoli del parallelepipedo, quindi il volume cresce di $2^3=8$: $\\det(\\lambda\\tens A)=\\lambda^3\\det\\tens A$ (Attenzione, p. 6). La risposta $2\\det\\tens A$ tratta il determinante come lineare; $4$ è il fattore delle aree, che sarebbe giusto in due dimensioni.' },
      },
      {
        id: 'l14-3b',
        kind: 'spiega',
        title: 'L’inverso: disfare una trasformazione',
        md: `Una trasformazione si può sempre disfare? L'**inverso** $\\tens A^{-1}$ è il tensore che riporta ogni vettore dov'era, sia applicato dopo sia prima di $\\tens A$ (Def 1.4.2):

$$\\tens A\\tens A^{-1}=\\tens A^{-1}\\tens A=\\tens I.$$

La dispensa dà la condizione necessaria e sufficiente: l'inverso esiste **se e solo se** $\\det\\tens A\\neq0$. Il caso singolare del modello mostra perché serve. Quando il cubo si schiaccia su un piano, vettori diversi finiscono nello stesso punto del piano, e nessuna trasformazione può sapere da quale dei due venivano: un volume schiacciato non torna indietro (deduzione).

Un'ultima proprietà: trasporre e invertire si possono fare in qualunque ordine, $(\\tens A^{-1})^T=(\\tens A^T)^{-1}$, e la dispensa chiama questo tensore $\\tens A^{-T}$.`,
      },
      {
        id: 'l14-4',
        kind: 'spiega',
        title: 'Tensori ortogonali: le trasformazioni rigide',
        md: `Tra tutte le trasformazioni ci interessano in modo speciale quelle che muovono gli oggetti **senza deformarli**: un corpo rigido che ruota non cambia né le lunghezze dei suoi segmenti né gli angoli tra loro. Lunghezze e angoli si calcolano entrambi con il prodotto scalare, quindi la definizione naturale è: un tensore è **ortogonale** se conserva il prodotto scalare (Def 1.5.1),

$$\\mathrm{Orth}:=\\{\\tens Q\\mid\\tens Q\\vet u\\cdot\\tens Q\\vet v=\\vet u\\cdot\\vet v\\ \\ \\forall\\vet u,\\vet v\\}.$$

Con $\\vet u=\\vet v$ si ottiene $|\\tens Q\\vet u|^2=|\\vet u|^2$: le lunghezze si conservano (passaggio aggiunto). E siccome si conservano sia i prodotti scalari sia le lunghezze, si conserva anche il coseno dell'angolo tra due vettori.

La **Prop 1.5.2** dice due cose su questi tensori: a) $\\det\\tens Q=\\pm1$; b) $\\tens Q^T\\tens Q=\\tens Q\\tens Q^T=\\tens I$, cioè **il trasposto è l'inverso**. La seconda è utilissima in pratica: invertire un ortogonale non costa nessun calcolo, basta ribaltarne la matrice. Dimostriamole, partendo da b).`,
        visual: LAB({ mode: 'trasforma', presets: ['rotazione', 'riflessione'], controls: ['preset'], cube: true, A: PRESETS.rotazione.A }),
      },
      {
        id: 'l14-5',
        kind: 'derivazione',
        title: 'Il trasposto di un ortogonale è l’inverso',
        md: 'Vogliamo arrivare a $\\tens Q^T\\tens Q=\\tens I$. Strategia: scriviamo lo stesso prodotto scalare $\\tens Q\\vet u\\cdot\\tens Q\\vet v$ in due modi, una volta con la regola di spostamento del trasposto (Def 1.3.1) e una volta con la definizione di ortogonale, e confrontiamo.',
        source: D(1, '1.5.1', 'Prop 1.5.2', 7),
        der: {
          sample: (r) => {
            const o: R = { p: idx(r), q: idx(r) };
            const Q0 = T.eulerR(T.unit(T.randVec(r)), 2 * Math.PI * r());
            putMat(o, 'Q', r() < 0.5 ? Q0 : T.mul(PRESETS.riflessione.A, Q0));
            putVec(o, 'u', T.randVec(r));
            putVec(o, 'v', T.randVec(r));
            return o;
          },
          lines: [
            { tex: '\\tens Q\\vet u\\cdot\\tens Q\\vet v', why: 'Partiamo dal prodotto scalare dei due vettori trasformati.', val: (v) => T.dotv(T.apply(mat(v, 'Q'), vec(v, 'u')), T.apply(mat(v, 'Q'), vec(v, 'v'))) },
            {
              tex: '=\\tens Q^T\\tens Q\\vet u\\cdot\\vet v',
              why: 'Abbiamo spostato il $\\tens Q$ che agisce su $\\vet v$ dall\'altra parte del prodotto scalare. È la definizione di trasposto (Def 1.3.1), $(\\tens Q\\vet a)\\cdot\\vet b=(\\tens Q^T\\vet b)\\cdot\\vet a$, letta con $\\vet a=\\vet v$ e $\\vet b=\\tens Q\\vet u$: il tensore spostato diventa $\\tens Q^T$ e si accoda a $\\tens Q\\vet u$.',
              ask: { q: 'Come sposto $\\tens Q$ dall\'altra parte del prodotto scalare?', options: ['Con il trasposto: $\\tens Q^T\\tens Q\\vet u\\cdot\\vet v$', 'Con l\'inverso: $\\tens Q^{-1}\\tens Q\\vet u\\cdot\\vet v$', 'Non si può', 'Con il determinante'], correct: 0, why: 'La regola di spostamento è la definizione di trasposto (Def 1.3.1) e vale per ogni tensore. Usare l\'inverso sarebbe un circolo vizioso: che il trasposto sia l\'inverso è proprio quello che vogliamo dimostrare.' },
              val: (v) => T.dotv(T.apply(T.mul(T.transpose(mat(v, 'Q')), mat(v, 'Q')), vec(v, 'u')), vec(v, 'v')),
            },
            { tex: '=\\vet u\\cdot\\vet v', why: 'Ora usiamo l\'ipotesi: il primo membro, $\\tens Q\\vet u\\cdot\\tens Q\\vet v$, è uguale a $\\vet u\\cdot\\vet v$ perché $\\tens Q$ è ortogonale (Def 1.5.1).', aggiunto: true, val: (v) => T.dotv(vec(v, 'u'), vec(v, 'v')) },
            { tex: '(\\tens Q^T\\tens Q-\\tens I)\\vet u\\cdot\\vet v=0\\quad\\forall\\vet u,\\vet v', why: 'Abbiamo portato tutto a sinistra, scrivendo $\\vet u\\cdot\\vet v$ come $\\tens I\\vet u\\cdot\\vet v$ e raccogliendo $\\vet u$.' },
            { tex: '\\tens Q^T\\tens Q=\\tens I', why: 'Il vettore $(\\tens Q^T\\tens Q-\\tens I)\\vet u$ ha prodotto scalare nullo con **ogni** $\\vet v$, quindi è nullo (basta prendere $\\vet v$ uguale a lui stesso); e questo per ogni $\\vet u$, quindi il tensore tra parentesi è $\\tens O$.', eq: 'Prop 1.5.2' },
            { tex: '\\tens Q^T=\\tens Q^{-1},\\qquad \\tens Q\\tens Q^T=\\tens I', why: 'La riga prima dice soltanto che $\\tens Q^T$, messo a sinistra di $\\tens Q$, dà l\'identità: è un inverso «sinistro». Per dire che è l\'inverso serve un passo in più (passaggio aggiunto). Prima di tutto $\\det\\tens Q\\neq0$: prendendo il determinante di $\\tens Q^T\\tens Q=\\tens I$ si trova $(\\det\\tens Q)^2=1$, come vedremo nella prossima derivazione; quindi $\\tens Q^{-1}$ esiste (Def 1.4.2). Moltiplicando $\\tens Q^T\\tens Q=\\tens I$ a destra per $\\tens Q^{-1}$ si ha $\\tens Q^T=\\tens Q^{-1}$, e allora $\\tens Q\\tens Q^T=\\tens Q\\tens Q^{-1}=\\tens I$. La dispensa scrive questa conclusione: «ne segue $\\tens Q^{-1}=\\tens Q^T$ e quindi anche $\\tens Q\\tens Q^T=\\tens I$».', eq: 'Prop 1.5.2' },
          ],
          checks: [
            { what: 'componente $pq$ di $\\tens Q^T\\tens Q$ uguale a $\\delta_{pq}$', f: (v) => [T.mul(T.transpose(mat(v, 'Q')), mat(v, 'Q'))[3 * v.p + v.q], v.p === v.q ? 1 : 0] },
            { what: 'componente $pq$ di $\\tens Q\\tens Q^T$ uguale a $\\delta_{pq}$', f: (v) => [T.mul(mat(v, 'Q'), T.transpose(mat(v, 'Q')))[3 * v.p + v.q], v.p === v.q ? 1 : 0] },
          ],
        },
      },
      {
        id: 'l14-6',
        kind: 'derivazione',
        title: 'Il determinante di un ortogonale vale ±1',
        md: 'Ora la parte a) della Prop 1.5.2. Strategia: prendiamo il determinante di entrambi i membri dell\'uguaglianza appena dimostrata, $\\tens Q^T\\tens Q=\\tens I$, e usiamo due proprietà del determinante viste prima.',
        source: D(1, '1.5.1', 'Prop 1.5.2', 7),
        der: {
          sample: (r) => {
            const o: R = {};
            const Q0 = T.eulerR(T.unit(T.randVec(r)), 2 * Math.PI * r());
            putMat(o, 'Q', r() < 0.5 ? Q0 : T.mul(PRESETS.riflessione.A, Q0));
            return o;
          },
          lines: [
            { tex: '1=\\det\\tens I', why: 'L\'identità non cambia nessun volume, quindi il suo determinante è 1.', val: () => T.det(T.I3) },
            { tex: '=\\det(\\tens Q^T\\tens Q)', why: 'Abbiamo sostituito $\\tens I$ con $\\tens Q^T\\tens Q$: è il risultato della derivazione precedente.', val: (v) => T.det(T.mul(T.transpose(mat(v, 'Q')), mat(v, 'Q'))) },
            {
              tex: '=\\det\\tens Q^T\\det\\tens Q',
              why: 'Il determinante di una composizione è il prodotto dei determinanti: i fattori di volume si moltiplicano.',
              ask: { q: 'Quale proprietà del determinante serve qui?', options: ['$\\det(\\tens A\\tens B)=\\det\\tens A\\det\\tens B$', 'La linearità: $\\det(\\tens A+\\tens B)=\\det\\tens A+\\det\\tens B$', '$\\det(\\lambda\\tens A)=\\lambda\\det\\tens A$', 'Nessuna'], correct: 0, why: 'C\'è un prodotto di tensori, quindi serve la regola del prodotto. Il determinante non è lineare (Attenzione, p. 6), e comunque qui non compare nessuna somma né nessun multiplo.' },
              aggiunto: true,
              val: (v) => T.det(T.transpose(mat(v, 'Q'))) * T.det(mat(v, 'Q')),
            },
            { tex: '=(\\det\\tens Q)^2', why: 'Trasporre non cambia il determinante, $\\det\\tens Q^T=\\det\\tens Q$: i due fattori sono uguali.', val: (v) => T.det(mat(v, 'Q')) ** 2 },
            { tex: '\\Rightarrow\\ \\det\\tens Q=\\pm1', why: 'Un numero il cui quadrato è 1 vale $+1$ o $-1$. Geometricamente: un tensore ortogonale non cambia i volumi, al più ne inverte il segno (deduzione).', eq: 'Prop 1.5.2' },
          ],
        },
      },
      {
        id: 'l14-7',
        kind: 'spiega',
        title: 'Rotazioni e riflessioni',
        md: `Il segno del determinante divide i tensori ortogonali in due famiglie (§1.5.1):

$$\\mathrm{Rot}:=\\{\\tens R\\in\\mathrm{Orth}\\mid\\det\\tens R=1\\},\\qquad \\mathrm{Rfl}:=\\{\\tens P\\in\\mathrm{Orth}\\mid\\det\\tens P=-1\\}.$$

Le **rotazioni** conservano l'orientamento: una terna destrorsa resta destrorsa. Le **riflessioni** lo invertono, come uno specchio (deduzione). Nel modello, con «riflessione $z\\to-z$», il cubo resta un cubo unitario ma si colora di arancione: la terna immagine è sinistrorsa.

La dispensa sottolinea che le riflessioni sono un'operazione analoga alla rotazione che però **non si ottiene da una rotazione per continuità**. Pensa a un guanto destro: puoi girarlo come vuoi, con continuità, ma non diventerà mai un guanto sinistro. Il motivo matematico (deduzione): durante un movimento continuo il determinante varia con continuità, ma può valere solo $+1$ o $-1$, quindi non può saltare dall'uno all'altro. Infine la dispensa nota che l'identità $\\tens I$ è una rotazione (§1.5.1).`,
      },
      {
        id: 'l14-d2',
        kind: 'domanda',
        q: { id: 'l14-q1', kind: 'scelta', q: 'Un tensore ortogonale con $\\det=-1$ è…', options: ['una riflessione', 'una rotazione', 'non invertibile', 'antisimmetrico'], correct: 0, why: '$\\mathrm{Rfl}=\\{\\tens P\\in\\mathrm{Orth}\\mid\\det\\tens P=-1\\}$. Non è una rotazione, che ha determinante $+1$. È invertibile, perché il determinante non è zero, e il suo inverso è il trasposto $\\tens P^T$. Ortogonale e antisimmetrico sono proprietà diverse: un antisimmetrico ha sempre un vettore nel nucleo, quindi non è nemmeno invertibile (deduzione).' },
      },
      {
        id: 'l14-8',
        kind: 'spiega',
        title: 'La formula di Eulero: una rotazione scritta con i proiettori',
        md: `Ora scriviamo esplicitamente una rotazione. Sia $\\tens R$ una rotazione diversa dall'identità. Il suo **asse** è l'unico versore che non si muove, $\\tens R\\hat e=\\hat e$. Il **Teo 1.5.3** dice che esiste un'ampiezza $\\varphi\\in[0,2\\pi)$ tale che

$$\\tens R=\\tens I+(1-\\cos\\varphi)\\,\\tens W^2+\\sin\\varphi\\,\\tens W\\tag{1.1}$$

dove $\\tens W$ è il tensore antisimmetrico che ha per vettore assiale proprio l'asse, cioè $\\tens W\\vet v=\\hat e\\wedge\\vet v$ (Teo 1.3.4), e $\\tens W^2:=\\tens W\\tens W$ è la sua composizione con sé stesso.

Per leggere i tre termini ricorda la scomposizione con i proiettori della lezione sulla diade e i proiettori (§1.2.5): $\\vet v$ ha una parte lungo l'asse e una parte nel piano perpendicolare. Un calcolo con il prodotto vettoriale (passaggio aggiunto) mostra che $\\tens W^2\\vet v=\\hat e\\wedge(\\hat e\\wedge\\vet v)$ è proprio l'opposto della parte di $\\vet v$ nel piano, cioè $\\tens W^2=-(\\tens I-\\hat e\\otimes\\hat e)$.

Con questo fatto la (1.1) si legge un termine alla volta (passaggio aggiunto). Sommando $\\tens I$ e la parte $\\tens W^2$ si ottiene $\\hat e\\otimes\\hat e$, quindi di $\\vet v$ resta soltanto la parte lungo l'asse, che non ruota. Il termine rimasto, $-\\cos\\varphi\\,\\tens W^2$, restituisce allora la parte di $\\vet v$ nel piano, moltiplicata per $\\cos\\varphi$. Infine $\\sin\\varphi\\,\\tens W$ aggiunge, sempre nel piano, il vettore $\\hat e\\wedge\\vet v$, che è perpendicolare a quella parte, moltiplicato per $\\sin\\varphi$.

Coseno lungo una direzione e seno lungo quella perpendicolare: è la rotazione di ampiezza $\\varphi$ che faresti in due dimensioni. È proprio ciò che afferma la dispensa: $\\tens R$ fa ruotare $\\vet v$ dell'angolo $\\varphi$ attorno all'asse $\\hat e$ (p. 8).`,
        visual: LAB({ mode: 'eulero', controls: ['dir', 'angle'], angle: 60 }),
      },
      {
        id: 'l14-8b',
        kind: 'spiega',
        title: 'Perché l’asse resta fermo',
        md: `La dispensa verifica subito una proprietà della (1.1) (p. 8): l'asse non si muove. Il ragionamento usa un fatto della lezione precedente, che il vettore assiale sta nel nucleo del suo antisimmetrico.

Qui il vettore assiale di $\\tens W$ è $\\hat e$, quindi $\\tens W\\hat e=\\hat e\\wedge\\hat e=\\vet 0$. Allora anche $\\tens W^2\\hat e=\\tens W(\\tens W\\hat e)=\\tens W\\vet 0=\\vet 0$ (passaggio aggiunto). Nella (1.1) applicata a $\\hat e$ i due termini con $\\tens W$ e $\\tens W^2$ si annullano e resta solo $\\tens I\\hat e$:

$$\\tens R\\hat e=\\hat e.$$

Nel modello vedi l'asse $\\hat e$, il vettore $\\vet v$ in viola e $\\tens R\\vet v$ in arancione, calcolato con la (1.1). La punta di $\\vet v$ percorre una circonferenza nel piano $\\pi\\perp\\hat e$.`,
        visual: LAB({ mode: 'eulero', controls: ['dir', 'angle'], angle: 60 }),
      },
      {
        id: 'l14-9',
        kind: 'prova',
        title: 'Ruota v attorno all’asse',
        md: 'Nel modello: l\'asse $\\hat e$, il vettore $\\vet v$ (viola) e $\\tens R\\vet v$ (arancione) calcolato con la (1.1). Controlla le proprietà di una rotazione che abbiamo dimostrato.',
        tasks: [
          'Muovi l\'asse: $|\\tens R\\hat e-\\hat e|$ resta 0 nel pannello.',
          'Porta $\\varphi$ a 180°: $|\\tens R\\vet v|=|\\vet v|$ sempre; la rotazione conserva le lunghezze, come ogni ortogonale.',
          'Guarda «lungo l\'asse»: vedi la rotazione di ampiezza $\\varphi$ nel piano.',
          'Controlla $\\det\\tens R=1$: è una rotazione, non una riflessione.',
        ],
        visual: LAB({ mode: 'eulero', controls: ['dir', 'angle'], angle: 60 }),
      },
      {
        id: 'l14-10',
        kind: 'derivazione',
        title: 'Rotazioni infinitesime',
        md: 'Che cosa diventa la (1.1) quando l\'ampiezza è piccolissima, $\\varphi\\ll1$? Strategia della dispensa: si sostituiscono seno e coseno con le loro approssimazioni per angoli piccoli e si tengono solo i termini del primo ordine in $\\varphi$.',
        source: D(1, '1.5.2', 'eq. (1.1)', 8),
        der: {
          sample: (r) => {
            const o: R = { k: idx(r), phi: 2 * Math.PI * r() };
            putVec(o, 'e', T.unit(T.randVec(r)));
            putVec(o, 'v', T.randVec(r));
            return o;
          },
          lines: [
            { tex: '\\tens R=\\tens I+(1-\\cos\\varphi)\\tens W^2+\\sin\\varphi\\,\\tens W', why: 'Partiamo dalla formula di Eulero.', eq: 'eq. (1.1)' },
            {
              tex: '\\cos\\varphi\\simeq1,\\quad \\sin\\varphi\\simeq\\varphi,\\quad 1-\\cos\\varphi=O(\\varphi^2)',
              why: 'Per angoli piccoli il coseno è quasi 1 e il seno quasi uguale all\'angolo. La differenza $1-\\cos\\varphi$ è dell\'ordine di $\\varphi^2$, cioè va a zero molto più in fretta di $\\varphi$: il termine in $\\tens W^2$ è di ordine superiore al primo.',
              ask: { q: 'Quale termine della (1.1) diventa trascurabile per $\\varphi\\ll1$?', options: ['$(1-\\cos\\varphi)\\tens W^2$', '$\\sin\\varphi\\,\\tens W$', '$\\tens I$', 'Nessuno'], correct: 0, why: '$1-\\cos\\varphi\\simeq\\varphi^2/2$ è di ordine superiore rispetto a $\\sin\\varphi\\simeq\\varphi$. Il termine $\\sin\\varphi\\,\\tens W$ è del primo ordine e resta; $\\tens I$ non dipende da $\\varphi$ e resta anch\'esso.' },
            },
            { tex: '\\tens R-\\tens I=\\varphi\\,\\tens W+o(\\varphi)', why: 'Abbiamo portato $\\tens I$ a sinistra e sostituito $\\sin\\varphi$ con $\\varphi$; tutto ciò che è più piccolo di $\\varphi$, compreso il termine in $\\tens W^2$, è raccolto nel simbolo $o(\\varphi)$, che si legge «o piccolo di $\\varphi$».' },
            { tex: '\\tens R\\vet v\\simeq\\vet v+\\varphi\\,\\tens W\\vet v', why: 'Abbiamo applicato l\'uguaglianza a un vettore $\\vet v$, trascurando $o(\\varphi)$ e usando $\\tens I\\vet v=\\vet v$.' },
            { tex: '\\tens R\\vet v\\simeq\\vet v+\\varphi\\,\\hat e\\wedge\\vet v', why: 'Infine abbiamo scritto $\\tens W\\vet v$ con il vettore assiale: $\\tens W\\vet v=\\hat e\\wedge\\vet v$ (Teo 1.3.4).', eq: '§1.5.2' },
          ],
          checks: [
            { what: 'forma esatta della (1.1) su $\\vet v$ (passaggio aggiunto): $\\tens R\\vet v-\\vet v=(1-\\cos\\varphi)\\hat e\\wedge(\\hat e\\wedge\\vet v)+\\sin\\varphi\\,\\hat e\\wedge\\vet v$', f: (v) => {
              const e = vec(v, 'e'), x = vec(v, 'v');
              const lhs = T.subv(T.apply(T.eulerR(e, v.phi), x), x)[v.k];
              const rhs = T.addv(T.scalev(T.cross(e, T.cross(e, x)), 1 - Math.cos(v.phi)), T.scalev(T.cross(e, x), Math.sin(v.phi)))[v.k];
              return [lhs, rhs];
            } },
            { what: '$\\tens R\\hat e=\\hat e$', f: (v) => [T.apply(T.eulerR(vec(v, 'e'), v.phi), vec(v, 'e'))[v.k], vec(v, 'e')[v.k]] },
          ],
        },
      },
      {
        id: 'l14-10b',
        kind: 'spiega',
        title: 'Che cosa dice il risultato: l’arco approssimato con la tangente',
        md: `Leggiamo $\\tens R\\vet v\\simeq\\vet v+\\varphi\\,\\hat e\\wedge\\vet v$. Per ruotare di poco un vettore basta **aggiungergli** un piccolo vettore, $\\varphi\\,\\hat e\\wedge\\vet v$, che per le proprietà del prodotto vettoriale (lezione precedente) è perpendicolare sia a $\\vet v$ sia all'asse, e ha modulo $\\varphi\\,|\\hat e\\wedge\\vet v|$.

Pensa alla figura di p. 8, nel piano perpendicolare all'asse. La punta del vettore ruotato esattamente si muove su un arco di circonferenza; la formula approssimata la sposta invece lungo la **tangente** all'arco. Per angoli piccoli arco e tangente quasi coincidono.

C'è un prezzo: la punta che si muove sulla tangente si allontana un poco dal centro, quindi la lunghezza di $\\vet v$ **è conservata solo al primo ordine**, non esattamente. In questa approssimazione una rotazione diventa la somma dell'identità e di un tensore antisimmetrico, $\\tens R\\simeq\\tens I+\\varphi\\tens W$. È proprio così che, nel Cap. 2, la parte antisimmetrica del gradiente di spostamento si leggerà come una rotazione rigida infinitesima.`,
      },
      {
        id: 'l14-11',
        kind: 'prova',
        title: 'Arco e tangente',
        md: 'Accendi l\'approssimazione infinitesima: in giallo $\\varphi\\,\\hat e\\wedge\\vet v$ e il vettore $\\vet v+\\varphi\\,\\hat e\\wedge\\vet v$. Confronta la punta gialla con quella arancione, che è la rotazione esatta.',
        tasks: [
          'Con $\\varphi=5°$ la punta gialla quasi coincide con $\\tens R\\vet v$: l\'errore nel pannello è piccolissimo.',
          'Porta $\\varphi$ a 60°: la tangente «esce» dalla circonferenza, l\'errore cresce.',
          'Confronta $|\\vet v+\\varphi\\,\\hat e\\wedge\\vet v|$ con $|\\vet v|$: la lunghezza è conservata solo al primo ordine.',
        ],
        visual: LAB({ mode: 'eulero', controls: ['dir', 'angle', 'tangent'], angle: 5, tangent: true, view: 'asse' }),
      },
      {
        id: 'l14-12',
        kind: 'spiega',
        title: 'Attenzione a tre errori',
        md: `Tre errori ricorrono su questa lezione.

1. **Trattare il determinante come lineare.** Le scritture $\\det(\\tens A+\\tens B)=\\det\\tens A+\\det\\tens B$ e $\\det(\\lambda\\tens A)=\\lambda\\det\\tens A$ sono sbagliate (Attenzione, p. 6). Il determinante è un fattore di volume, e il volume è un prodotto di tre lunghezze: per questo $\\det(\\lambda\\tens A)=\\lambda^3\\det\\tens A$.
2. **Dimenticare le riflessioni.** Ortogonale non vuol dire rotazione: anche le riflessioni conservano lunghezze e angoli, ma hanno determinante $-1$ e invertono l'orientamento. Le rotazioni sono solo gli ortogonali con determinante $+1$.
3. **Dire che una rotazione infinitesima conserva esattamente la lunghezza.** La formula $\\vet v+\\varphi\\,\\hat e\\wedge\\vet v$ sposta la punta lungo la tangente, non sull'arco: la lunghezza è conservata solo al primo ordine in $\\varphi$. La rotazione esatta, data dalla (1.1), la conserva invece esattamente.`,
      },
      {
        id: 'l14-d3',
        kind: 'domanda',
        q: { id: 'l14-q3', kind: 'vf', q: 'Il vettore $\\vet v+\\varphi\\,\\hat e\\wedge\\vet v$ ha esattamente la stessa lunghezza di $\\vet v$.', answer: false, why: 'Il vettore aggiunto è perpendicolare a $\\vet v$, quindi per Pitagora il quadrato della lunghezza cresce di $\\varphi^2|\\hat e\\wedge\\vet v|^2$ (deduzione): la differenza è del secondo ordine, e la lunghezza è conservata solo al primo ordine (§1.5.2). È l\'arco approssimato con la tangente.' },
      },
      {
        id: 'l14-13',
        kind: 'riassunto',
        md: `**Il filo della lezione.** Il determinante è il fattore, con segno, con cui un tensore moltiplica i volumi; per questo non è lineare, si moltiplica nelle composizioni, e quando è nullo il tensore schiaccia lo spazio e non si può invertire. I tensori ortogonali conservano il prodotto scalare, quindi lunghezze e angoli: spostando $\\tens Q$ con il trasposto si dimostra che $\\tens Q^T\\tens Q=\\tens I$, e prendendone il determinante che $\\det\\tens Q=\\pm1$. Il segno separa le rotazioni dalle riflessioni, che non si raggiungono per continuità. Ogni rotazione si scrive con la formula di Eulero usando l'antisimmetrico che ha per vettore assiale l'asse; per angoli piccoli diventa $\\vet v+\\varphi\\,\\hat e\\wedge\\vet v$, l'arco approssimato con la tangente.

- Determinante: $\\det\\tens A=\\dfrac{\\tens A\\vet u\\cdot\\tens A\\vet v\\wedge\\tens A\\vet w}{\\vet u\\cdot\\vet v\\wedge\\vet w}$ (Def 1.4.1); $\\det(\\lambda\\tens A)=\\lambda^3\\det\\tens A$.
- Inverso: esiste se e solo se $\\det\\tens A\\neq0$ (Def 1.4.2).
- Ortogonali: $\\tens Q^T\\tens Q=\\tens I$, $\\det\\tens Q=\\pm1$ (Prop 1.5.2).
- Eulero: $\\tens R=\\tens I+(1-\\cos\\varphi)\\tens W^2+\\sin\\varphi\\,\\tens W$ (eq. 1.1); infinitesime: $\\tens R\\vet v\\simeq\\vet v+\\varphi\\,\\hat e\\wedge\\vet v$ (§1.5.2).`,
        orale: ['Dimostrare che per $\\tens Q\\in\\mathrm{Orth}$ si ha $\\tens Q^T=\\tens Q^{-1}$ e $\\det\\tens Q=\\pm1$; distinguere rotazioni e riflessioni. (dispensa, domanda 6)', 'Scrivere la formula di Eulero, spiegare ogni termine e ricavare le rotazioni infinitesime. (dispensa, domanda 7)'],
      },
    ],
  },

  // ================================================================== c1.5
  {
    concept: 'c1.5',
    title: 'Traccia, prodotto scalare e Sym ⊥ Skw',
    minutes: 28,
    source: D(1, '1.6', 'Def 1.6.1–1.6.2, Prop 1.6.3', '8–9'),
    visual: SVG('matrici', { focus: 'traccia' }),
    steps: [
      {
        id: 'l15-0',
        kind: 'spiega',
        title: 'Dove siamo e dove andiamo',
        md: `Con i vettori sai fare una cosa preziosa: il prodotto scalare, che dà lunghezze, angoli e perpendicolarità. In questa lezione costruiamo lo stesso strumento per i tensori. Partiamo dalla lezione sul trasposto e sulla decomposizione $\\tens A=\\tens E+\\tens W$ in parte simmetrica e antisimmetrica.

Le tappe sono quattro. Prima la **traccia**, un numero associato a ogni tensore. Poi la usiamo per definire il **prodotto scalare tra tensori** e la **norma**, cioè la «lunghezza» di un tensore. Poi dimostriamo il risultato principale: ogni tensore simmetrico è **perpendicolare** a ogni antisimmetrico. Infine ne leggiamo il significato: lo spazio dei tensori è diviso in due «piani» perpendicolari, come uno spazio a 9 dimensioni scomposto in uno da 6 e uno da 3.

Questo fatto sembra astratto, ma nel Cap. 4 farà sparire la parte rotazionale dal lavoro delle tensioni. La dimostrazione è la domanda d'orale 8.`,
      },
      {
        id: 'l15-1',
        kind: 'spiega',
        title: 'La traccia: definita sulle diadi, estesa per linearità',
        md: `La dispensa definisce la traccia in un modo che all'inizio sorprende (Def 1.6.1): non dice «somma della diagonale», ma dice che cosa fa su una diade. La traccia è l'operatore **lineare** $\\operatorname{tr}:\\mathrm{Lin}\\to\\mathbb R$, cioè una regola che a ogni tensore associa un numero, tale che

$$\\operatorname{tr}(\\vet a\\otimes\\vet b):=\\vet a\\cdot\\vet b.$$

Perché basta? Perché dalla lezione sulla diade sappiamo che le diadi dei versori sono una base: ogni tensore è $\\tens A=\\sum_{ij}A_{ij}\\,\\hat e_i\\otimes\\hat e_j$ (Prop 1.2.4). La linearità permette di portare la traccia dentro la somma (passaggio aggiunto):

$$\\operatorname{tr}\\tens A=\\textstyle\\sum_{ij}A_{ij}\\operatorname{tr}(\\hat e_i\\otimes\\hat e_j)=\\sum_{ij}A_{ij}\\,\\hat e_i\\cdot\\hat e_j=\\sum_{ij}A_{ij}\\,\\delta_{ij}.$$

Il delta di Kronecker uccide tutti i termini con $i\\neq j$, e resta $\\operatorname{tr}\\tens A=A_{11}+A_{22}+A_{33}$: la somma della diagonale. Il vantaggio della definizione sulle diadi è che è assoluta, non dipende dal riferimento; la somma della diagonale ne è la conseguenza in componenti.`,
      },
      {
        id: 'l15-1b',
        kind: 'spiega',
        title: 'Le proprietà della traccia',
        md: `La dispensa elenca sei proprietà (§1.6.1). Le prime cinque, raccolte qui in quattro punti, sono quasi delle osservazioni.

- $\\operatorname{tr}\\tens A=\\operatorname{tr}\\tens A^T$: trasporre ribalta la matrice rispetto alla diagonale, e la diagonale resta dov'è.
- $\\operatorname{tr}(\\tens A+\\tens B)=\\operatorname{tr}\\tens A+\\operatorname{tr}\\tens B$, e più in generale è lineare.
- $\\operatorname{tr}\\tens I=3$: la diagonale dell'identità è fatta di tre 1.
- $\\operatorname{tr}(\\tens A\\tens B)=\\operatorname{tr}(\\tens B\\tens A)$: anche se in generale $\\tens A\\tens B\\neq\\tens B\\tens A$ (Def 1.2.7), le due composizioni hanno la stessa traccia. In componenti (passaggio aggiunto) entrambe valgono $\\sum_{ik}A_{ik}B_{ki}$.

La sesta, $\\operatorname{tr}\\tens W=0$ per ogni antisimmetrico, la dimostriamo, perché il ragionamento è un modello che riuseremo tra poco. Tieni a mente in particolare la prima e la quarta: saranno i due attrezzi della dimostrazione principale.`,
      },
      {
        id: 'l15-2',
        kind: 'derivazione',
        title: 'La traccia di un antisimmetrico è nulla',
        md: 'Vogliamo $\\operatorname{tr}\\tens W=0$. L\'idea è mostrare che $\\operatorname{tr}\\tens W$ è uguale al proprio opposto, combinando la prima proprietà della traccia con la definizione di antisimmetrico.',
        source: D(1, '1.6.1', undefined, 8),
        der: {
          sample: (r) => {
            const o: R = {};
            putMat(o, 'A', T.randMat(r));
            return o;
          },
          lines: [
            { tex: '\\operatorname{tr}\\tens W', why: 'Sia $\\tens W$ antisimmetrico. (Nella verifica numerica è la parte antisimmetrica di un tensore preso a caso.)', val: (v) => T.trace(T.skw(mat(v, 'A'))) },
            { tex: '=\\operatorname{tr}\\tens W^T', why: 'La traccia non cambia trasponendo: è la prima proprietà del passo precedente.', val: (v) => T.trace(T.transpose(T.skw(mat(v, 'A')))) },
            {
              tex: '=\\operatorname{tr}(-\\tens W)',
              why: 'Abbiamo sostituito $\\tens W^T$ con $-\\tens W$: è la definizione di antisimmetrico (Def 1.3.2).',
              ask: { q: 'Quanto vale $\\tens W^T$ se $\\tens W$ è antisimmetrico?', options: ['$-\\tens W$', '$\\tens W$', '$\\tens W^{-1}$', '$\\tens O$'], correct: 0, why: 'È la definizione di $\\mathrm{Skw}$, l\'insieme degli antisimmetrici. $\\tens W^T=\\tens W$ vale per i simmetrici; l\'uguaglianza tra trasposto e inverso vale per gli ortogonali; e $\\tens W^T$ è nullo solo se $\\tens W$ stesso è nullo.' },
              val: (v) => T.trace(T.scale(T.skw(mat(v, 'A')), -1)),
            },
            { tex: '=-\\operatorname{tr}\\tens W', why: 'La traccia è lineare, quindi il segno meno esce.', val: (v) => -T.trace(T.skw(mat(v, 'A'))) },
            { tex: '\\Rightarrow\\ \\operatorname{tr}\\tens W=0', why: 'Confrontando la prima e l\'ultima riga, $\\operatorname{tr}\\tens W$ è un numero uguale al proprio opposto: è zero. In componenti è la diagonale nulla vista nella lezione sul simmetrico e l\'antisimmetrico (§1.3.2), $W_{ii}=0$.', eq: '§1.6.1', val: () => 0 },
          ],
        },
      },
      {
        id: 'l15-3',
        kind: 'spiega',
        title: 'Il prodotto scalare tra tensori',
        md: `Per i vettori il prodotto scalare è la somma dei prodotti delle componenti con lo stesso indice, $\\vet u\\cdot\\vet v=\\sum_iu_iv_i$. Per i tensori facciamo lo stesso, ma con nove componenti (Def 1.6.2):

$$\\tens A\\cdot\\tens B:=\\operatorname{tr}(\\tens A\\tens B^T)=\\textstyle\\sum_{ij}A_{ij}B_{ij}.$$

Si usa lo stesso simbolo «$\\cdot$» dei vettori: è il contesto a dire di quale prodotto si tratta. La definizione assoluta passa per la traccia; quella in componenti è la somma dei prodotti delle componenti omonime, cioè dello stesso posto nelle due matrici. Il trasposto serve proprio ad allineare i posti (passaggio aggiunto): l'elemento diagonale $i$ di $\\tens A\\tens B^T$ è $\\sum_jA_{ij}B^T_{ji}=\\sum_jA_{ij}B_{ij}$, e sommando su $i$ si ottiene la doppia somma.

Con il prodotto scalare arrivano gli stessi concetti dei vettori. La **norma**, la «lunghezza» di un tensore, è $\\|\\tens A\\|:=(\\tens A\\cdot\\tens A)^{1/2}$, la radice della somma dei quadrati delle nove componenti. E due tensori sono **ortogonali** se $\\tens A\\cdot\\tens B=0$.`,
      },
      {
        id: 'l15-d1',
        kind: 'domanda',
        q: { id: 'l15-q1', kind: 'vf', q: '$\\tens A\\cdot\\tens B=\\operatorname{tr}(\\tens A\\tens B)$.', answer: false, why: 'Manca la trasposta: $\\tens A\\cdot\\tens B=\\operatorname{tr}(\\tens A\\tens B^T)=\\sum_{ij}A_{ij}B_{ij}$ (Def 1.6.2). Senza trasposta si ottiene $\\sum_{ij}A_{ij}B_{ji}$, che moltiplica componenti di posti diversi: per esempio con $\\tens A=\\tens B$ antisimmetrico non nullo darebbe un numero negativo, impossibile per il quadrato di una norma (deduzione).' },
      },
      {
        id: 'l15-3b',
        kind: 'spiega',
        title: 'Tre proprietà del prodotto scalare',
        md: `La **Prop 1.6.3** elenca tre proprietà. La prima è un collegamento con la traccia:

$$\\tens A\\cdot\\tens I=\\operatorname{tr}\\tens A,$$

perché $\\tens I^T=\\tens I$ e $\\tens A\\tens I=\\tens A$ (passaggio aggiunto). Fare il prodotto scalare con l'identità vuol dire sommare la diagonale.

La seconda dice come si fa il prodotto scalare con una diade:

$$\\tens A\\cdot(\\vet a\\otimes\\vet b)=\\tens A\\vet b\\cdot\\vet a.$$

Leggila così: trasformi $\\vet b$ con $\\tens A$ e misuri il risultato lungo $\\vet a$. Nota la somiglianza con la definizione di componente di un tensore (Def 1.2.2): con $\\vet a=\\hat e_i$ e $\\vet b=\\hat e_j$ si ottiene $\\tens A\\cdot(\\hat e_i\\otimes\\hat e_j)=\\tens A\\hat e_j\\cdot\\hat e_i=A_{ij}$ (deduzione). La componente $A_{ij}$ è il prodotto scalare di $\\tens A$ con il mattone $\\hat e_i\\otimes\\hat e_j$, esattamente come $v_i=\\vet v\\cdot\\hat e_i$ per i vettori. Questa forma tornerà per i tensori del IV ordine.

La terza, $\\tens E\\cdot\\tens W=0$, è il cuore della lezione e le dedichiamo una derivazione a parte. Prima dimostriamo la seconda.`,
      },
      {
        id: 'l15-4',
        kind: 'derivazione',
        title: 'Prodotto scalare con una diade',
        md: 'Vogliamo $\\tens A\\cdot(\\vet a\\otimes\\vet b)=\\tens A\\vet b\\cdot\\vet a$. Strategia: passiamo in componenti, usiamo le componenti della diade (Def 1.2.3) e riconosciamo dentro la somma la regola righe per colonna.',
        source: D(1, '1.6.2', 'Prop 1.6.3', 9),
        der: {
          sample: (r) => {
            const o: R = {};
            putMat(o, 'A', T.randMat(r));
            putVec(o, 'a', T.randVec(r));
            putVec(o, 'b', T.randVec(r));
            return o;
          },
          lines: [
            { tex: '\\tens A\\cdot(\\vet a\\otimes\\vet b)', why: 'Prodotto scalare di un tensore con una diade.', val: (v) => T.ddot(mat(v, 'A'), T.dyad(vec(v, 'a'), vec(v, 'b'))) },
            { tex: '=\\textstyle\\sum_{ij}A_{ij}\\,a_ib_j', why: 'Abbiamo scritto il prodotto scalare come somma dei prodotti delle componenti omonime (Def 1.6.2), con le componenti della diade $(\\vet a\\otimes\\vet b)_{ij}=a_ib_j$ (Def 1.2.3).', val: (v) => { const A = mat(v, 'A'), a = vec(v, 'a'), b = vec(v, 'b'); let s = 0; for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) s += T.at(A, i, j) * a[i] * b[j]; return s; } },
            {
              tex: '=\\textstyle\\sum_i a_i\\,(\\tens A\\vet b)_i',
              why: 'Fissato $i$, abbiamo raccolto $a_i$ e fatto prima la somma su $j$: $\\sum_jA_{ij}b_j$ è la regola righe per colonna, cioè la componente $i$ di $\\tens A\\vet b$.',
              ask: { q: 'Che cosa è $\\sum_jA_{ij}b_j$?', options: ['$(\\tens A\\vet b)_i$', '$(\\tens A^T\\vet b)_i$', '$\\operatorname{tr}\\tens A$', '$a_ib_i$'], correct: 0, why: 'È il prodotto della riga $i$ di $[\\tens A]$ per la colonna $\\{\\vet b\\}$: la componente $i$ di $\\tens A\\vet b$. Con il trasposto si sommerebbe su $A_{ji}$, cioè lungo una colonna; la traccia somma solo la diagonale.' },
              val: (v) => T.dotv(vec(v, 'a'), T.apply(mat(v, 'A'), vec(v, 'b'))),
            },
            { tex: '=\\tens A\\vet b\\cdot\\vet a', why: 'Una somma di prodotti di componenti omonime di due vettori è il loro prodotto scalare: qui tra $\\tens A\\vet b$ e $\\vet a$.', eq: 'Prop 1.6.3', val: (v) => T.dotv(T.apply(mat(v, 'A'), vec(v, 'b')), vec(v, 'a')) },
          ],
          checks: [{ what: '$\\tens A\\cdot\\tens I=\\operatorname{tr}\\tens A$', f: (v) => [T.ddot(mat(v, 'A'), T.I3), T.trace(mat(v, 'A'))] }],
        },
      },
      {
        id: 'l15-4b',
        kind: 'spiega',
        title: 'Simmetrici e antisimmetrici sono perpendicolari: l’idea',
        md: `Arriviamo al risultato principale: se $\\tens E$ è simmetrico e $\\tens W$ è antisimmetrico, allora $\\tens E\\cdot\\tens W=0$ (Prop 1.6.3).

In componenti se ne capisce il motivo (deduzione). Nella somma $\\sum_{ij}E_{ij}W_{ij}$ i termini diagonali sono nulli perché $W_{ii}=0$; quelli fuori diagonale vanno a coppie, $E_{12}W_{12}$ ed $E_{21}W_{21}$, e siccome $E_{21}=E_{12}$ mentre $W_{21}=-W_{12}$, ogni coppia si cancella.

La dispensa però dimostra il risultato in notazione assoluta, con la traccia, ed è questa dimostrazione che all'orale ci si aspetta. L'idea è la stessa della traccia di $\\tens W$: calcolare lo stesso numero in **due modi diversi** e scoprire che è uguale al proprio opposto. Gli attrezzi sono quelli che ti ho chiesto di tenere a mente: la traccia non cambia trasponendo, e la traccia di una composizione non cambia scambiando i fattori. Serve anche una proprietà del trasposto (§1.3.1): $(\\tens A\\tens B)^T=\\tens B^T\\tens A^T$, l'ordine si inverte.`,
      },
      {
        id: 'l15-5',
        kind: 'derivazione',
        title: 'Simmetrici e antisimmetrici sono ortogonali',
        md: 'Vogliamo $\\tens E\\cdot\\tens W=0$. Primo modo: usiamo l\'antisimmetria di $\\tens W$. Secondo modo: trasponiamo l\'argomento della traccia e usiamo la simmetria di $\\tens E$. Confrontando i due risultati il numero risulterà uguale al proprio opposto.',
        source: D(1, '1.6.2', 'Prop 1.6.3', 9),
        der: {
          sample: (r) => {
            const o: R = {};
            putMat(o, 'A', T.randMat(r));
            putMat(o, 'B', T.randMat(r));
            return o;
          },
          lines: [
            { tex: '\\tens E\\cdot\\tens W=\\operatorname{tr}(\\tens E\\tens W^T)', why: 'Definizione di prodotto scalare tra tensori (Def 1.6.2), con $\\tens E$ simmetrico e $\\tens W$ antisimmetrico.', val: (v) => T.ddot(T.sym(mat(v, 'A')), T.skw(mat(v, 'B'))) },
            { tex: '=-\\operatorname{tr}(\\tens E\\tens W)', why: 'Primo modo. Abbiamo sostituito $\\tens W^T=-\\tens W$ e portato fuori il segno meno per la linearità della traccia.', val: (v) => -T.trace(T.mul(T.sym(mat(v, 'A')), T.skw(mat(v, 'B')))) },
            { tex: '\\operatorname{tr}(\\tens E\\tens W^T)=\\operatorname{tr}\\big((\\tens E\\tens W^T)^T\\big)', why: 'Secondo modo: ripartiamo da $\\operatorname{tr}(\\tens E\\tens W^T)$ e trasponiamo il suo argomento, cosa lecita perché la traccia non cambia trasponendo.', val: (v) => T.trace(T.transpose(T.mul(T.sym(mat(v, 'A')), T.transpose(T.skw(mat(v, 'B')))))) },
            {
              tex: '=\\operatorname{tr}(\\tens W\\tens E)',
              why: 'Abbiamo calcolato il trasposto: l\'ordine si inverte, $(\\tens E\\tens W^T)^T=(\\tens W^T)^T\\tens E^T=\\tens W\\tens E^T$, e $\\tens E^T=\\tens E$ perché $\\tens E$ è simmetrico.',
              ask: { q: 'Quanto vale $(\\tens E\\tens W^T)^T$?', options: ['$\\tens W\\tens E$', '$\\tens E\\tens W$', '$\\tens E^T\\tens W$', '$-\\tens E\\tens W$'], correct: 0, why: '$(\\tens A\\tens B)^T=\\tens B^T\\tens A^T$: $(\\tens E\\tens W^T)^T=\\tens W\\tens E^T=\\tens W\\tens E$ perché $\\tens E$ è simmetrico. La seconda e la terza opzione dimenticano che l\'ordine si inverte; la quarta usa l\'antisimmetria, ma qui il trasposto di $\\tens W^T$ è semplicemente $\\tens W$.' },
              val: (v) => T.trace(T.mul(T.skw(mat(v, 'B')), T.sym(mat(v, 'A')))),
            },
            { tex: '=\\operatorname{tr}(\\tens E\\tens W)', why: 'La traccia di una composizione non cambia scambiando i fattori: $\\operatorname{tr}(\\tens W\\tens E)=\\operatorname{tr}(\\tens E\\tens W)$.', val: (v) => T.trace(T.mul(T.sym(mat(v, 'A')), T.skw(mat(v, 'B')))) },
            { tex: '\\Rightarrow\\ \\operatorname{tr}(\\tens E\\tens W)=-\\operatorname{tr}(\\tens E\\tens W)=0', why: 'Il numero $\\operatorname{tr}(\\tens E\\tens W^T)$ vale $-\\operatorname{tr}(\\tens E\\tens W)$ per il primo modo e $\\operatorname{tr}(\\tens E\\tens W)$ per il secondo: lo stesso numero è uguale al proprio opposto, quindi è zero. E con lui $\\tens E\\cdot\\tens W$.', eq: 'Prop 1.6.3', val: () => 0 },
          ],
        },
      },
      {
        id: 'l15-6',
        kind: 'spiega',
        title: 'Lin = Sym ⊕ Skw: lo spazio dei tensori in due pezzi perpendicolari',
        md: `Mettiamo insieme due risultati. Dalla lezione sul simmetrico e l'antisimmetrico (Teo 1.3.3) sappiamo che ogni tensore si scrive in un solo modo come $\\tens E+\\tens W$, e che l'unico tensore comune a $\\mathrm{Sym}$ e $\\mathrm{Skw}$, gli insiemi dei simmetrici e degli antisimmetrici, è $\\tens O$. Ora sappiamo anche che le due famiglie sono **perpendicolari**: ogni simmetrico è ortogonale a ogni antisimmetrico.

La dispensa riassume tutto scrivendo $\\mathrm{Lin}=\\mathrm{Sym}\\oplus\\mathrm{Skw}$, una **somma diretta ortogonale**, con $9=6+3$ componenti (Oss. §1.6). L'immagine geometrica è quella di un vettore dello spazio scomposto nella sua parte su un piano e in quella sulla retta perpendicolare, come con i proiettori: qui lo «spazio» ha 9 dimensioni, il «piano» dei simmetrici ne ha 6 e la «retta» degli antisimmetrici 3.

Come per i vettori, dalla perpendicolarità segue il teorema di Pitagora (deduzione): $\\|\\tens A\\|^2=\\|\\tens E\\|^2+\\|\\tens W\\|^2$, perché nel quadrato di $\\tens E+\\tens W$ il doppio prodotto $2\\,\\tens E\\cdot\\tens W$ è zero.

La conseguenza pratica arriverà nel Cap. 4, nel teorema dei lavori virtuali: se $\\tens T$ è simmetrico, $\\tens T\\cdot\\tens H=\\tens T\\cdot\\tens E$, perché il prodotto con la parte antisimmetrica $\\tens W$ di $\\tens H$ è nullo.`,
      },
      {
        id: 'l15-7',
        kind: 'prova',
        title: 'Prova a rompere l’ortogonalità',
        md: 'Nel diagramma cambia le componenti di $[\\tens A]$: il pannello mostra la traccia, $\\tens E\\cdot\\tens W$ e le norme. Prova davvero a trovare un tensore per cui $\\tens E\\cdot\\tens W$ non sia zero: non ci riuscirai, ed è questo il teorema.',
        tasks: [
          'Qualunque numero scrivi, $\\tens E\\cdot\\tens W$ resta 0.',
          'Controlla che $\\|\\tens A\\|^2=\\|\\tens E\\|^2+\\|\\tens W\\|^2$: è Pitagora, perché le due parti sono ortogonali.',
          'Cambia solo la diagonale: cambia $\\operatorname{tr}\\tens A$, mai $\\operatorname{tr}\\tens W$, che resta 0.',
          'Premi «sferico»: $\\tens A=1{,}5\\,\\tens I$ ha traccia $4{,}5=1{,}5\\cdot\\operatorname{tr}\\tens I$.',
        ],
        visual: SVG('matrici', { focus: 'traccia' }),
      },
      {
        id: 'l15-8',
        kind: 'spiega',
        title: 'Attenzione a due errori',
        md: `Due errori ricorrono su questa lezione.

1. **Scrivere $\\tens A\\cdot\\tens B=\\operatorname{tr}(\\tens A\\tens B)$.** Manca la trasposta. È tentante perché per i vettori il prodotto scalare non ha trasposte; ma senza il trasposto si moltiplicano componenti di posti diversi, $A_{ij}B_{ji}$, e non si ottiene più la somma dei prodotti delle componenti omonime.
2. **Dimostrare $\\tens E\\cdot\\tens W=0$ solo in componenti.** L'argomento delle coppie che si cancellano è un buon controllo, ma la domanda 8 della dispensa chiede la dimostrazione con la traccia: i due modi di calcolare $\\operatorname{tr}(\\tens E\\tens W^T)$, uno con $\\tens W^T=-\\tens W$, l'altro trasponendo l'argomento, invertendo l'ordine e scambiando i fattori. Ripetila finché non sai dire quale proprietà usi in ogni riga.`,
      },
      {
        id: 'l15-d2',
        kind: 'domanda',
        q: { id: 'l15-q2', kind: 'scelta', q: '$\\tens T$ è simmetrico e $\\tens H=\\tens E+\\tens W$ è la decomposizione di un tensore qualunque. Quanto vale $\\tens T\\cdot\\tens H$?', options: ['$\\tens T\\cdot\\tens E$', '$\\tens T\\cdot\\tens W$', '$0$', '$\\operatorname{tr}\\tens T\\,\\operatorname{tr}\\tens H$'], correct: 0, why: 'Il prodotto scalare è lineare, quindi $\\tens T\\cdot\\tens H=\\tens T\\cdot\\tens E+\\tens T\\cdot\\tens W$, e il secondo termine è nullo perché un simmetrico è ortogonale a ogni antisimmetrico (Prop 1.6.3). Sparisce la parte antisimmetrica, non quella simmetrica; e il prodotto scalare non è il prodotto delle tracce. È il passaggio usato nel teorema dei lavori virtuali (Cap. 4).' },
      },
      {
        id: 'l15-9',
        kind: 'riassunto',
        md: `**Il filo della lezione.** La traccia si definisce sulle diadi, $\\operatorname{tr}(\\vet a\\otimes\\vet b)=\\vet a\\cdot\\vet b$, e grazie alla base delle diadi diventa la somma della diagonale; non cambia trasponendo né scambiando i fattori di una composizione, e per un antisimmetrico è nulla perché uguale alla propria opposta. Con la traccia si definisce il prodotto scalare tra tensori, $\\operatorname{tr}(\\tens A\\tens B^T)$, che è la somma dei prodotti delle componenti omonime e dà la norma. Calcolando $\\operatorname{tr}(\\tens E\\tens W^T)$ in due modi si dimostra che simmetrici e antisimmetrici sono ortogonali, quindi lo spazio dei tensori si divide in due parti perpendicolari, $\\mathrm{Lin}=\\mathrm{Sym}\\oplus\\mathrm{Skw}$.

- Traccia: $\\operatorname{tr}(\\vet a\\otimes\\vet b):=\\vet a\\cdot\\vet b$, $\\operatorname{tr}\\tens A=A_{11}+A_{22}+A_{33}$, $\\operatorname{tr}\\tens W=0$ (Def 1.6.1, §1.6.1).
- Prodotto scalare: $\\tens A\\cdot\\tens B:=\\operatorname{tr}(\\tens A\\tens B^T)=\\sum_{ij}A_{ij}B_{ij}$, $\\|\\tens A\\|=(\\tens A\\cdot\\tens A)^{1/2}$ (Def 1.6.2).
- $\\tens A\\cdot\\tens I=\\operatorname{tr}\\tens A$, $\\tens A\\cdot(\\vet a\\otimes\\vet b)=\\tens A\\vet b\\cdot\\vet a$, $\\tens E\\cdot\\tens W=0$ (Prop 1.6.3).`,
        orale: ['Dimostrare che Sym e Skw sono ortogonali ($\\tens E\\cdot\\tens W=0$). (dispensa, domanda 8)'],
      },
    ],
  },

  // ================================================================== c1.6
  {
    concept: 'c1.6',
    title: 'Tensori del IV ordine',
    minutes: 26,
    source: D(1, '1.7', 'Def 1.7.1–1.7.7', '9–11'),
    visual: SVG('simmetrie4'),
    steps: [
      {
        id: 'l16-0',
        kind: 'spiega',
        title: 'Dove siamo e dove andiamo',
        md: `Un tensore del II ordine è una macchina che trasforma vettori in vettori. Ora saliamo di un gradino: una macchina che trasforma **tensori del II ordine** in tensori del II ordine. È il **tensore del IV ordine**.

Perché ci interessa? Nel Cap. 4 il legame elastico lineare, la legge di Hooke, sarà $\\tens T=\\mathbb A\\tens E$: il tensore elastico $\\mathbb A$, del IV ordine, prende la deformazione $\\tens E$ e restituisce la tensione $\\tens T$. Tutto ciò che diciamo qui serve a capire quel tensore.

Le tappe: prima la definizione e le 81 componenti, costruite come abbiamo fatto per il II ordine; poi il trasposto e le tre **simmetrie**, ciascuna con il suo significato; poi il conteggio delle componenti indipendenti, da 81 a 36 a 21; infine due proprietà, la definita positività e l'invertibilità, e quale delle due implica l'altra. Sono le domande d'orale 9 e 10.`,
      },
      {
        id: 'l16-1',
        kind: 'spiega',
        title: 'Una macchina che trasforma tensori, e le sue 81 componenti',
        md: `La **Def 1.7.1** è la copia, un gradino più su, della definizione di tensore del II ordine (Def 1.2.1): un tensore del IV ordine $\\mathbb A$ è una trasformazione **lineare** di $\\mathrm{Lin}$ in $\\mathrm{Lin}$, che a ogni tensore $\\tens A$ associa un tensore $\\mathbb A\\tens A=\\tens B$. L'insieme di questi oggetti si chiama $\\mathbb{L}\\mathrm{in}$.

Anche le componenti si costruiscono imitando la Def 1.2.2. Là facevamo entrare un versore $\\hat e_j$ e misuravamo l'uscita lungo $\\hat e_i$. Qui i «versori» dello spazio dei tensori sono le diadi dei versori, i mattoni della Prop 1.2.4: facciamo entrare il mattone $\\hat e_h\\otimes\\hat e_k$ e misuriamo l'uscita lungo il mattone $\\hat e_i\\otimes\\hat e_j$ con il prodotto scalare tra tensori della lezione precedente:

$$\\mathbb A_{ijhk}:=\\big[\\mathbb A(\\hat e_h\\otimes\\hat e_k)\\big]\\cdot(\\hat e_i\\otimes\\hat e_j).$$

Gli indici sono quattro, ciascuno da 1 a 3: $3^4=81$ componenti. E l'applicazione a un tensore diventa una regola «righe per colonna» con due indici sommati:

$$(\\mathbb A\\tens A)_{ij}=\\textstyle\\sum_{h,k}\\mathbb A_{ijhk}A_{hk}.$$

Attenzione alla notazione della dispensa: $\\mathbb A$, maiuscola «filettata», è il tensore del IV ordine, mentre $\\tens A$, con la tilde, è il tensore del II ordine su cui agisce. Sono due oggetti diversi con la stessa lettera.

Conviene pensare ai quattro indici come a **due coppie**: la prima $(ij)$ dice quale componente del risultato stai calcolando, la seconda $(hk)$ quale componente dell'argomento stai usando.`,
      },
      {
        id: 'l16-2',
        kind: 'spiega',
        title: 'Il trasposto e la simmetria maggiore',
        md: `Anche il trasposto si definisce come per il II ordine (Def 1.3.1), con la regola di spostamento attraverso il prodotto scalare, ora tra tensori (Def 1.7.2):

$$\\mathbb A\\tens A\\cdot\\tens B=\\mathbb A^T\\tens B\\cdot\\tens A\\quad\\forall\\tens A,\\tens B,\\qquad \\mathbb A^T_{ijhk}=\\mathbb A_{hkij}.$$

In componenti il trasposto **scambia la prima coppia di indici con la seconda**, così come per il II ordine scambiava i due indici.

Un tensore del IV ordine uguale al proprio trasposto ha la **simmetria maggiore** (Def 1.7.3):

$$\\mathbb A=\\mathbb A^T\\iff\\mathbb A\\tens A\\cdot\\tens B=\\mathbb A\\tens B\\cdot\\tens A\\iff\\mathbb A_{ijhk}=\\mathbb A_{hkij}.$$

A parole: puoi scambiare i ruoli dei due tensori $\\tens A$ e $\\tens B$ senza cambiare il numero. Se disponi le 81 componenti in una griglia $9\\times9$, con le righe indicizzate dalla coppia $(ij)$ e le colonne dalla coppia $(hk)$, la simmetria maggiore dice che la griglia è simmetrica rispetto alla sua diagonale (deduzione). È la griglia del diagramma a destra.`,
      },
      {
        id: 'l16-2b',
        kind: 'spiega',
        title: 'Le due simmetrie minori: uscite simmetriche e argomenti visti a metà',
        md: `Con quattro indici ci sono altre simmetrie, che scambiano gli indici **dentro** una coppia. Si chiamano minori.

La **prima simmetria minore** (Def 1.7.4) riguarda l'uscita: $\\mathbb A\\tens A$ è **sempre simmetrico**, qualunque sia $\\tens A$. In simboli $\\mathbb A:\\mathrm{Lin}\\to\\mathrm{Sym}$, cioè $\\mathbb A$ porta un tensore qualunque nell'insieme $\\mathrm{Sym}$ dei simmetrici; in componenti $\\mathbb A_{ijhk}=\\mathbb A_{jihk}$: scambiando gli indici della prima coppia non cambia nulla, perché il risultato ha componenti $ij$ e $ji$ uguali.

La **seconda simmetria minore** (Def 1.7.5) riguarda l'ingresso: $\\mathbb A$ **«vede» solo la parte simmetrica** del suo argomento,

$$\\mathbb A\\tens A=\\mathbb A[\\operatorname{sym}\\tens A]\\iff\\mathbb A\\tens W=\\tens O\\ \\ \\forall\\tens W\\in\\mathrm{Skw}.$$

Perché le due forme sono equivalenti? Con il I teorema di decomposizione (Teo 1.3.3), $\\tens A=\\operatorname{sym}\\tens A+\\operatorname{skw}\\tens A$, e per linearità $\\mathbb A\\tens A=\\mathbb A[\\operatorname{sym}\\tens A]+\\mathbb A[\\operatorname{skw}\\tens A]$ (passaggio aggiunto): dire che conta solo la parte simmetrica equivale a dire che la parte antisimmetrica viene mandata in zero. In simboli $\\mathbb A:\\mathrm{Sym}\\to\\mathrm{Lin}$, cioè basta conoscere $\\mathbb A$ sui tensori simmetrici; in componenti $\\mathbb A_{ijhk}=\\mathbb A_{ijkh}$.

Per il tensore elastico questo avrà un significato fisico: nel Cap. 4 la dispensa osserva che ai fini dello sforzo conta solo la parte simmetrica del gradiente di spostamento; la parte antisimmetrica, la rotazione rigida infinitesima, non produce tensione (deduzione).`,
      },
      {
        id: 'l16-d0',
        kind: 'domanda',
        q: { id: 'l16-q2', kind: 'scelta', q: '$\\mathbb A$ ha la seconda simmetria minore e $\\tens W$ è antisimmetrico. Quanto vale $\\mathbb A\\tens W$?', options: ['$\\tens O$', '$\\tens W$', 'un tensore simmetrico qualunque', 'dipende da $\\mathbb A$'], correct: 0, why: 'La seconda simmetria minore dice che $\\mathbb A$ vede solo la parte simmetrica dell\'argomento; la parte simmetrica di un antisimmetrico è nulla, quindi $\\mathbb A\\tens W=\\tens O$ (Def 1.7.5). Chi risponde «un simmetrico qualunque» confonde con la prima simmetria minore, che riguarda l\'uscita, non l\'ingresso.' },
      },
      {
        id: 'l16-3',
        kind: 'prova',
        title: 'Conta le componenti',
        md: 'Nel diagramma le 81 componenti sono in una griglia 9 × 9: righe = coppia $(ij)$, colonne = coppia $(hk)$. Le componenti costrette a valere uguale hanno lo stesso colore. Accendi le simmetrie una alla volta e conta i colori che restano.',
        tasks: [
          'Senza simmetrie: 81 colori diversi.',
          'Accendi le due simmetrie minori: 36. Righe e colonne si raggruppano a coppie (12 con 21, …).',
          'Aggiungi la maggiore: 21. La griglia diventa simmetrica rispetto alla diagonale.',
          'Passa sopra una casella per vedere tutte quelle che devono essere uguali a lei.',
        ],
        visual: SVG('simmetrie4'),
      },
      {
        id: 'l16-4',
        kind: 'numeri',
        title: 'Perché 36 e 21',
        md: `Ora contiamo con un ragionamento, come fa la dispensa (§1.7.3). Con le due simmetrie minori l'ordine degli indici dentro ciascuna coppia non conta: $\\mathbb A_{ijhk}=\\mathbb A_{jihk}=\\mathbb A_{ijkh}$. Quante coppie $(ij)$ distinte ci sono, se $(ij)$ e $(ji)$ contano come una sola? Tre con gli indici uguali, $11,22,33$, e tre con gli indici diversi, $23,13,12$: **6** in tutto. Lo stesso per la coppia $(hk)$.

Quindi $\\mathbb A$ si rappresenta con una tabella $6\\times6$: righe per la prima coppia, colonne per la seconda. Sono $6\\times6=${NUMERI_M1.count.minori}$ componenti.

La simmetria maggiore scambia le due coppie, quindi rende **simmetrica** questa tabella. Come per un tensore simmetrico del II ordine, le componenti libere sono quelle sulla diagonale, che sono 6, più quelle sopra la diagonale, che sono $(36-6)/2=15$. In tutto $6+15=\\frac{6\\cdot7}{2}=${NUMERI_M1.count.tutte3}$.

I numeri ${NUMERI_M1.count.tutte}$, ${NUMERI_M1.count.minori}$, ${NUMERI_M1.count.tutte3}$ li conta anche il motore dell'app, raggruppando le 81 componenti: è una verifica indipendente del ragionamento.`,
        values: { n81: NUMERI_M1.count.tutte, n36: NUMERI_M1.count.minori, n21: NUMERI_M1.count.tutte3 },
      },
      {
        id: 'l16-d1',
        kind: 'domanda',
        q: { id: 'l16-q3', kind: 'scelta', q: 'Quante componenti distinte ha un tensore del IV ordine con le due simmetrie minori ma senza la maggiore?', options: ['36', '21', '81', '6'], correct: 0, why: 'Con le minori ogni coppia di indici assume solo 6 valori distinti, quindi la tabella è $6\\times6=36$. Il numero 21 richiede anche la maggiore, che rende simmetrica la tabella; 81 è il caso senza simmetrie; 6 è il numero di valori di una sola coppia.' },
      },
      {
        id: 'l16-4b',
        kind: 'spiega',
        title: 'Definita positività e invertibilità',
        md: `Restano due proprietà. La prima generalizza un'idea che conosci per i numeri: un numero $a$ è positivo se $a\\,x\\cdot x=ax^2>0$ per ogni $x\\neq0$. Analogamente $\\mathbb A$ è **definito positivo**, si scrive $\\mathbb A\\in\\mathrm{Pos}^+$, se (Def 1.7.6)

$$\\mathbb A\\tens A\\cdot\\tens A>0\\quad\\forall\\tens A\\neq\\tens O.$$

A parole: il tensore trasformato forma sempre un «angolo acuto» con quello di partenza, cioè ha prodotto scalare positivo con esso (deduzione). Nel Cap. 4 questa condizione garantirà che l'energia specifica di deformazione sia positiva per ogni deformazione non nulla (§4.9.4).

La seconda è l'**invertibilità** (Def 1.7.7): $\\mathbb A$ è invertibile se esiste $\\mathbb A^{-1}$ con $\\mathbb A\\mathbb A^{-1}=\\mathbb A^{-1}\\mathbb A=\\mathbb I$, dove $\\mathbb I$ è l'identità del IV ordine, $\\mathbb I\\tens A=\\tens A$.

Le due proprietà sono legate, ma in una direzione sola. Per vederlo serve un criterio che la dispensa usa senza dimostrarlo: una trasformazione lineare è invertibile quando l'unico elemento che manda in zero è lo zero, cioè quando il suo **nucleo** è banale (passaggio aggiunto). È la stessa idea del caso singolare visto con il determinante (§1.4.2): se vettori diversi finiscono nello stesso punto, non si torna indietro.`,
      },
      {
        id: 'l16-5',
        kind: 'derivazione',
        title: 'La definita positività implica l’invertibilità',
        md: 'Vogliamo mostrare che un tensore definito positivo ha nucleo banale, quindi è invertibile, e poi che il viceversa è falso. Strategia: prendiamo un tensore che $\\mathbb A$ manda in zero e usiamo la definita positività per mostrare che è nullo.',
        source: D(1, '1.7.4', 'Def 1.7.6–1.7.7, Attenzione', 11),
        der: {
          lines: [
            { tex: '\\mathbb A\\in\\mathrm{Pos}^+,\\quad \\mathbb A\\tens A=\\tens O', why: 'Prendiamo un tensore $\\tens A$ nel nucleo di $\\mathbb A$, cioè uno che $\\mathbb A$ manda nel tensore nullo.' },
            {
              tex: '\\Rightarrow\\ \\mathbb A\\tens A\\cdot\\tens A=0',
              why: 'Abbiamo fatto il prodotto scalare di entrambi i membri con $\\tens A$. A destra il prodotto scalare di $\\tens O$ con qualunque tensore è nullo, perché tutte le componenti di $\\tens O$ sono zero.',
              ask: { q: 'Che cosa ci dice $\\mathbb A\\tens A\\cdot\\tens A=0$, sapendo che $\\mathbb A\\in\\mathrm{Pos}^+$?', options: ['che $\\tens A=\\tens O$', 'niente', 'che $\\mathbb A=\\mathbb O$', 'che $\\tens A$ è antisimmetrico'], correct: 0, why: 'Per un definito positivo $\\mathbb A\\tens A\\cdot\\tens A>0$ per ogni $\\tens A\\neq\\tens O$: se il numero è zero, $\\tens A$ non può essere diverso da $\\tens O$. Il risultato riguarda $\\tens A$, non $\\mathbb A$; e un antisimmetrico non nullo darebbe comunque un numero positivo.' },
            },
            { tex: '\\Rightarrow\\ \\tens A=\\tens O:\\ \\text{nucleo banale, }\\mathbb A\\text{ invertibile}', why: 'L\'unico tensore mandato in zero è $\\tens O$: il nucleo è banale e $\\mathbb A$ è invertibile. La definita positività è quindi **sufficiente** per l\'invertibilità.', eq: 'Def 1.7.6' },
            { tex: '-\\mathbb I:\\ \\text{invertibile, ma }-\\mathbb I\\tens A\\cdot\\tens A=-\\|\\tens A\\|^2<0', why: 'Ma **non è necessaria**. Il controesempio della dispensa è $-\\mathbb I$, che cambia segno a ogni tensore: è invertibile, perché è l\'inverso di sé stesso (deduzione), ma $-\\mathbb I\\tens A\\cdot\\tens A=-\\tens A\\cdot\\tens A=-\\|\\tens A\\|^2$ è negativo per ogni $\\tens A\\neq\\tens O$ (passaggio aggiunto), quindi non è definito positivo.' },
          ],
        },
      },
      {
        id: 'l16-5b',
        kind: 'spiega',
        title: 'Che cosa dice il risultato, e attenzione a tre errori',
        md: `Il risultato si riassume in una freccia sola: $\\mathrm{Pos}^+\\Rightarrow$ invertibile. Nel Cap. 4 servirà proprio così: il tensore elastico è definito positivo, quindi invertibile, e la legge $\\tens T=\\mathbb A\\tens E$ si può rovesciare in $\\tens E=\\mathbb A^{-1}\\tens T$.

Su questa lezione ricorrono tre errori.

1. **Confondere simmetria maggiore e minori.** La maggiore scambia le **coppie**, $(ij)\\leftrightarrow(hk)$; le minori scambiano gli indici **dentro** una coppia, $i\\leftrightarrow j$ oppure $h\\leftrightarrow k$. Un modo per ricordarlo: la maggiore riguarda la griglia $9\\times9$ intera, le minori riguardano l'uscita (prima) e l'ingresso (seconda).
2. **Dire che invertibile implica definito positivo.** È il contrario: definito positivo implica invertibile (domanda 10 della dispensa). L'errore viene dal leggere la freccia al rovescio; il controesempio $-\\mathbb I$ basta a smontarlo.
3. **Dire «21 = 6 + 15» senza spiegare da dove vengono.** Il 6 sono le componenti sulla diagonale della tabella $6\\times6$, il 15 è la metà delle 30 fuori diagonale, perché la simmetria maggiore le rende uguali a coppie.`,
      },
      {
        id: 'l16-6',
        kind: 'domanda',
        q: { id: 'l16-q1', kind: 'vf', q: 'Se un tensore del IV ordine è invertibile, allora è definito positivo.', answer: false, why: 'È il contrario: $\\mathrm{Pos}^+\\Rightarrow$ invertibile, perché la definita positività rende banale il nucleo. Il controesempio della dispensa è $-\\mathbb I$: invertibile (è l\'inverso di sé stesso) ma con $-\\mathbb I\\tens A\\cdot\\tens A<0$ (Attenzione, p. 11).' },
      },
      {
        id: 'l16-7',
        kind: 'riassunto',
        md: `**Il filo della lezione.** Un tensore del IV ordine trasforma linearmente tensori del II ordine in tensori del II ordine; le sue 81 componenti si ottengono facendo entrare e misurando le diadi dei versori, e conviene pensarle come due coppie di indici. Il trasposto scambia le due coppie, e la simmetria maggiore dice che $\\mathbb A$ è uguale al suo trasposto; la prima simmetria minore dice che l'uscita è sempre simmetrica, la seconda che l'ingresso conta solo per la sua parte simmetrica. Con le due minori ogni coppia assume 6 valori e restano 36 componenti; la maggiore rende simmetrica la tabella $6\\times6$ e ne restano 21. Infine la definita positività rende banale il nucleo e quindi garantisce l'invertibilità, mentre il viceversa è falso.

- Componenti: $\\mathbb A_{ijhk}:=[\\mathbb A(\\hat e_h\\otimes\\hat e_k)]\\cdot(\\hat e_i\\otimes\\hat e_j)$, $(\\mathbb A\\tens A)_{ij}=\\sum_{hk}\\mathbb A_{ijhk}A_{hk}$ (Def 1.7.1).
- Maggiore $\\mathbb A_{ijhk}=\\mathbb A_{hkij}$; prima minore $\\mathbb A_{ijhk}=\\mathbb A_{jihk}$; seconda minore $\\mathbb A_{ijhk}=\\mathbb A_{ijkh}$, cioè $\\mathbb A\\tens W=\\tens O$ (Def 1.7.3–1.7.5).
- Conteggio $81\\to36\\to21$ (§1.7.3).
- $\\mathrm{Pos}^+$: $\\mathbb A\\tens A\\cdot\\tens A>0$ per $\\tens A\\neq\\tens O$ (Def 1.7.6); sufficiente, non necessaria, per l'invertibilità (Attenzione, p. 11).`,
        orale: ['Simmetrie dei tensori del IV ordine: definizioni, significato e conteggio 81 / 36 / 21. (dispensa, domanda 9)', "Definita positività e invertibilità di un tensore del IV ordine: quale implica l'altra? (dispensa, domanda 10)"],
      },
    ],
  },

  // ================================================================== c1.7
  {
    concept: 'c1.7',
    title: 'Gradiente, divergenza e teorema della divergenza',
    minutes: 27,
    source: D(1, '1.8', 'Def 1.8.1–1.8.6, Teo 1.8.4', '11–13'),
    visual: SVG('divergenza'),
    steps: [
      {
        id: 'l17-0',
        kind: 'spiega',
        title: 'Dove siamo e dove andiamo',
        md: `Finora vettori e tensori erano oggetti fissi. In un corpo che si deforma, però, lo spostamento cambia da punto a punto, e così la tensione: ci servono **campi**, cioè regole che a ogni punto $X$ di una regione associano un vettore $\\vet u(X)$ o un tensore $\\tens A(X)$. La dispensa li considera definiti in un **dominio regolare** $D$, cioè in una regione dello spazio.

Per i campi servono le derivate, e questa lezione introduce i tre operatori dell'analisi tensoriale: **gradiente**, **divergenza** e **rotore**. Poi enuncia il **teorema della divergenza**, che lega ciò che esce dal bordo di una regione a ciò che succede dentro.

Le tappe: gradiente e divergenza di un campo vettoriale; la divergenza di un campo tensoriale, con la derivazione delle sue componenti; il teorema della divergenza; infine il rotore. Nel Cap. 3 il teorema della divergenza trasformerà l'equilibrio di una parte del corpo nelle equazioni indefinite; la domanda d'orale 11 copre questa lezione.`,
      },
      {
        id: 'l17-1',
        kind: 'spiega',
        title: 'Il gradiente: come cambia il campo vicino a un punto',
        md: `Parti da una funzione di una variabile: la sua derivata dice di quanto cambia il valore quando ti sposti di poco. Per un campo vettoriale $\\vet u$ le cose si moltiplicano: ci sono tre componenti che possono cambiare, e tre direzioni in cui spostarsi. Le derivate possibili sono quindi $3\\times3=9$, e la dispensa le raccoglie in un tensore del II ordine, il **gradiente** (Def 1.8.1):

$$(\\nabla\\vet u)_{ij}:=\\dfrac{\\partial u_i}{\\partial x_j}.$$

Il simbolo $\\nabla$ si legge «nabla» o «gradiente». Nella matrice la **riga** $i$ è la componente che stai derivando, la **colonna** $j$ è la coordinata rispetto a cui derivi:

$$[\\nabla\\vet u]=\\begin{bmatrix}\\partial_1u_1&\\partial_2u_1&\\partial_3u_1\\\\\\partial_1u_2&\\partial_2u_2&\\partial_3u_2\\\\\\partial_1u_3&\\partial_2u_3&\\partial_3u_3\\end{bmatrix},$$

dove $\\partial_j$ abbrevia $\\partial/\\partial x_j$. Il gradiente è un tensore, e un tensore trasforma vettori (Def 1.2.1): qui trasforma un piccolo spostamento dal punto nella variazione del campo, al primo ordine (deduzione). Nel Cap. 2 il gradiente di spostamento sarà proprio il tensore $\\tens H$.

La dispensa fa un'osservazione generale (§1.8): il gradiente **alza di uno** l'ordine del campo, la divergenza lo **abbassa di uno**, il rotore lo **lascia invariato**. Da un vettore, ordine 1, il gradiente produce un tensore, ordine 2.`,
      },
      {
        id: 'l17-1b',
        kind: 'spiega',
        title: 'La divergenza di un vettore: quanto il campo «esce» da un punto',
        md: `Dal gradiente, che ha nove numeri, possiamo estrarne uno solo prendendo la traccia (Def 1.6.1), cioè la somma della diagonale. Così si definisce la **divergenza** di un campo vettoriale (Def 1.8.2):

$$\\operatorname{div}\\vet u:=\\operatorname{tr}\\nabla\\vet u=\\dfrac{\\partial u_1}{\\partial x_1}+\\dfrac{\\partial u_2}{\\partial x_2}+\\dfrac{\\partial u_3}{\\partial x_3}.$$

Il risultato è uno scalare: l'ordine è sceso da 1 a 0, come dice l'osservazione del passo precedente.

Che cosa misura? Ciascun termine dice quanto la componente $i$ del campo cresce spostandosi nella direzione $i$, cioè quanto il campo «si allarga» in quella direzione. Immagina il campo come la velocità di un fluido (deduzione): divergenza positiva vuol dire che in quel punto il fluido si espande, come vicino a una sorgente; divergenza nulla che tanto entra quanto esce. Il teorema della divergenza, tra qualche passo, renderà precisa questa immagine.

Un esempio che userai sul modello: il campo piano $\\vet u=(x,y)$ ha $\\partial_1u_1=1$ e $\\partial_2u_2=1$, quindi divergenza 2 ovunque; il campo $\\vet u=(-y,x)$, una rotazione rigida, ha divergenza nulla (esempio aggiunto).`,
      },
      {
        id: 'l17-2',
        kind: 'spiega',
        title: 'La divergenza di un tensore: definita attraverso un vettore',
        md: `Ora vogliamo la divergenza di un campo **tensoriale** $\\tens A$; per l'osservazione sull'ordine deve essere un vettore. Si potrebbe definirla direttamente con gli indici, ma la dispensa sceglie una strada intrinseca, cioè indipendente dal riferimento (Def 1.8.3). Fissa un vettore **costante** $\\vet a$, lo stesso in tutti i punti, e chiede che

$$\\vet a\\cdot\\operatorname{div}\\tens A:=\\operatorname{div}(\\tens A^T\\vet a)\\quad\\forall\\vet a.$$

Leggila da destra. $\\tens A^T\\vet a$ è un campo vettoriale: in ogni punto applichi il trasposto di $\\tens A$ al vettore fisso $\\vet a$. Di un campo vettoriale sappiamo già fare la divergenza, e otteniamo un numero. La definizione dice che questo numero è la componente del vettore $\\operatorname{div}\\tens A$ lungo $\\vet a$. Siccome lo sappiamo per ogni $\\vet a$, il vettore è determinato (deduzione): un vettore di cui conosci il prodotto scalare con ogni altro vettore è noto.

È lo stesso trucco usato per definire il trasposto: invece di dire che cosa è un oggetto, si dice come si comporta nei prodotti scalari. Ora ne ricaviamo le componenti; la risposta sarà «la divergenza si fa per righe».`,
      },
      {
        id: 'l17-3',
        kind: 'derivazione',
        title: 'Le componenti della divergenza di un tensore',
        md: 'Vogliamo una formula per $(\\operatorname{div}\\tens A)_i$. Strategia della dispensa: scriviamo in componenti il secondo membro della definizione, $\\operatorname{div}(\\tens A^T\\vet a)$, portiamo fuori $\\vet a$ che è costante, e confrontiamo il risultato con il primo membro.',
        source: D(1, '1.8.2', 'Def 1.8.3', 12),
        der: {
          sample: fieldSample,
          lines: [
            {
              tex: '\\vet a\\cdot\\operatorname{div}\\tens A=\\operatorname{div}(\\tens A^T\\vet a)',
              why: 'Partiamo dalla definizione. (Il controllo numerico di questa riga calcola $\\operatorname{div}(\\tens A^T\\vet a)$ con differenze finite, per una strada indipendente dalle righe successive.)',
              val: (v) => {
                const a = vec(v, 'a'), x = vec(v, 'x');
                const h = 0.5;
                let s = 0;
                for (let j = 0; j < 3; j++) {
                  const xp: T.Vec = [...x] as T.Vec, xm: T.Vec = [...x] as T.Vec;
                  xp[j] += h;
                  xm[j] -= h;
                  s += (T.apply(T.transpose(Aat(v, xp)), a)[j] - T.apply(T.transpose(Aat(v, xm)), a)[j]) / (2 * h);
                }
                return s;
              },
            },
            {
              tex: '=\\textstyle\\sum_j\\partial_j\\big(\\sum_iA_{ij}a_i\\big)',
              why: 'Abbiamo scritto la divergenza del campo vettoriale $\\tens A^T\\vet a$ come somma delle derivate delle sue componenti (Def 1.8.2), e la componente $j$ di quel campo con la regola righe per colonna applicata al trasposto: $(\\tens A^T\\vet a)_j=\\sum_iA^T_{ji}a_i=\\sum_iA_{ij}a_i$.',
              ask: { q: 'Quanto vale $(\\tens A^T\\vet a)_j$?', options: ['$\\sum_iA_{ij}a_i$', '$\\sum_iA_{ji}a_i$', '$A_{jj}a_j$', '$\\sum_iA_{ij}a_j$'], correct: 0, why: 'Il trasposto scambia gli indici, $(\\tens A^T)_{ji}=A_{ij}$, quindi $(\\tens A^T\\vet a)_j=\\sum_iA_{ij}a_i$. La seconda opzione è $(\\tens A\\vet a)_j$, senza trasposto; la terza tiene solo la diagonale; la quarta somma sull\'indice sbagliato del vettore.' },
              val: (v) => {
                const a = vec(v, 'a'), x = vec(v, 'x');
                let s = 0;
                for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++) s += dA(v, x, 3 * i + j, j) * a[i];
                return s;
              },
            },
            {
              tex: '=\\textstyle\\sum_i a_i\\sum_j\\partial_jA_{ij}',
              why: 'Il vettore $\\vet a$ è costante, quindi le sue componenti $a_i$ escono dalle derivate. Poi abbiamo scambiato l\'ordine delle due somme, lecito perché sono somme finite, e raccolto $a_i$.',
              val: (v) => {
                const a = vec(v, 'a'), x = vec(v, 'x');
                return [0, 1, 2].reduce((s, i) => s + a[i] * [0, 1, 2].reduce((t, j) => t + dA(v, x, 3 * i + j, j), 0), 0);
              },
            },
            { tex: '\\Rightarrow\\ (\\operatorname{div}\\tens A)_i=\\textstyle\\sum_j\\dfrac{\\partial A_{ij}}{\\partial x_j}', why: 'Il primo membro, scritto in componenti, è $\\vet a\\cdot\\operatorname{div}\\tens A=\\sum_ia_i(\\operatorname{div}\\tens A)_i$. Le due espressioni devono coincidere per ogni $\\vet a$; scegliendo $\\vet a=\\hat e_i$ resta un solo termine per lato (passaggio aggiunto), e i coefficienti di $a_i$ sono uguali. La divergenza si fa **per righe**.', eq: 'Def 1.8.3' },
          ],
        },
      },
      {
        id: 'l17-3b',
        kind: 'spiega',
        title: 'Che cosa dice il risultato: la divergenza per righe',
        md: `Leggiamo la formula: la componente $i$ della divergenza di $\\tens A$ si ottiene prendendo la **riga $i$** della matrice $[\\tens A]$ e facendone la divergenza come se fosse un vettore, cioè derivando il primo elemento rispetto a $x_1$, il secondo rispetto a $x_2$, il terzo rispetto a $x_3$, e sommando.

Per esempio la prima componente è $\\partial_1A_{11}+\\partial_2A_{12}+\\partial_3A_{13}$. L'indice sommato è sempre il secondo, quello della colonna, ed è lo stesso indice rispetto a cui si deriva.

Un controllo di coerenza (deduzione): se $\\tens A$ è costante nello spazio, tutte le derivate sono nulle e $\\operatorname{div}\\tens A=\\vet 0$, come la divergenza di un vettore costante.

Perché ci teniamo a «per righe»? Perché con un'altra convenzione, la divergenza per colonne, si otterrebbe in generale un vettore diverso (deduzione). Nel Cap. 3 la divergenza del tensore delle tensioni comparirà nelle equazioni indefinite di equilibrio, $\\operatorname{div}\\tens T+\\vet b=\\vet 0$, e lì il tensore è simmetrico, quindi le due convenzioni danno lo stesso risultato (deduzione); ma in generale no.`,
      },
      {
        id: 'l17-d1',
        kind: 'domanda',
        q: { id: 'l17-q2', kind: 'scelta', q: 'Quanto vale $(\\operatorname{div}\\tens A)_2$?', options: ['$\\partial_1A_{21}+\\partial_2A_{22}+\\partial_3A_{23}$', '$\\partial_1A_{12}+\\partial_2A_{22}+\\partial_3A_{32}$', '$\\partial_2A_{22}$', '$\\partial_2A_{21}+\\partial_2A_{22}+\\partial_2A_{23}$'], correct: 0, why: 'Si prende la riga 2 e si deriva ogni elemento rispetto alla coordinata della sua colonna: $\\sum_j\\partial_jA_{2j}$ (Def 1.8.3). La seconda opzione è la divergenza per colonne; la terza tiene solo la diagonale; la quarta deriva sempre rispetto a $x_2$.' },
      },
      {
        id: 'l17-4',
        kind: 'spiega',
        title: 'Il teorema della divergenza: ciò che esce dal bordo',
        md: `Torniamo all'immagine del fluido. Prendi una regione $D$ con bordo chiuso $\\partial D$, e in ogni punto del bordo il versore normale **uscente** $\\hat n$, che punta fuori dalla regione. Quanto fluido esce in tutto dal bordo? In ogni punto conta solo la componente del campo lungo la normale, $\\vet u\\cdot\\hat n$: positiva se il campo esce, negativa se entra. Sommandola su tutto il bordo si ottiene il **flusso** uscente.

Il **Teo 1.8.4** dice che questo flusso è uguale all'integrale della divergenza dentro la regione:

$$\\int_{\\partial D}\\vet u\\cdot\\hat n\\,dA=\\int_D\\operatorname{div}\\vet u\\,dV.$$

È la versione precisa dell'immagine del passo sulla divergenza: ciò che esce dal bordo è la somma di quanto il campo «si allarga» in ogni punto dell'interno. Il teorema trasforma un integrale di superficie, $dA$ è l'elemento d'area, in un integrale di volume, $dV$ è l'elemento di volume.

Esiste anche una versione tensoriale, che è quella che useremo nel Cap. 3:

$$\\int_{\\partial D}\\tens A\\hat n\\,dA=\\int_D\\operatorname{div}\\tens A\\,dV.$$

A sinistra c'è un vettore: in ogni punto del bordo il tensore trasforma la normale, e si sommano i risultati. Nel Cap. 3 al posto di $\\tens A$ ci sarà il tensore delle tensioni $\\tens T$, e $\\tens T\\hat n$ sarà la forza per unità di superficie sul bordo.`,
      },
      {
        id: 'l17-4b',
        kind: 'spiega',
        title: 'Dalla versione vettoriale a quella tensoriale',
        md: `La dispensa dice come si ottiene la versione tensoriale: applicando quella vettoriale al campo $\\tens A^T\\vet a$, con $\\vet a$ fisso arbitrario. È lo stesso trucco della definizione di divergenza, e vale la pena seguirlo una volta (passaggio aggiunto).

Il campo $\\tens A^T\\vet a$ è vettoriale, quindi il teorema vettoriale dice che $\\int_{\\partial D}\\tens A^T\\vet a\\cdot\\hat n\\,dA=\\int_D\\operatorname{div}(\\tens A^T\\vet a)\\,dV$.

A sinistra usiamo la regola di spostamento del trasposto (Def 1.3.1): $\\tens A^T\\vet a\\cdot\\hat n=\\tens A\\hat n\\cdot\\vet a$. A destra usiamo la definizione della divergenza di un tensore: $\\operatorname{div}(\\tens A^T\\vet a)=\\vet a\\cdot\\operatorname{div}\\tens A$. Siccome $\\vet a$ è costante, esce da entrambi gli integrali:

$$\\vet a\\cdot\\int_{\\partial D}\\tens A\\hat n\\,dA=\\vet a\\cdot\\int_D\\operatorname{div}\\tens A\\,dV.$$

Questo vale per ogni $\\vet a$, quindi i due vettori sono uguali: è la versione tensoriale.

Nel diagramma a destra c'è un campo piano su un quadrato. Il campo non dipende da $z$ e non ha componente $z$: su un cubo il flusso dalle facce $z=$ costante sarebbe nullo, e il teorema si legge sul quadrato (deduzione).`,
      },
      {
        id: 'l17-5',
        kind: 'prova',
        title: 'Flusso e divergenza',
        md: 'Sul contorno vedi il flusso di ogni lato (rosso uscente, blu entrante); sullo sfondo la divergenza. In fondo al diagramma ci sono i due numeri del teorema: il flusso totale e l\'integrale della divergenza. Per ogni campo controlla che coincidano, e chiediti perché.',
        tasks: [
          'Sorgente $\\vet u=(x,y)$: divergenza 2 ovunque; il flusso totale è 2, come l\'integrale della divergenza.',
          'Rotazione rigida $\\vet u=(-y,x)$: divergenza nulla, flusso totale nullo anche se il campo non è nullo.',
          'Traslazione: ciò che entra da un lato esce dall\'altro, e la divergenza è zero.',
          'Campo misto: la divergenza cambia da punto a punto, ma i due numeri in fondo coincidono sempre.',
        ],
        visual: SVG('divergenza'),
      },
      {
        id: 'l17-6',
        kind: 'spiega',
        title: 'Il rotore: la parte rotazionale del gradiente',
        md: `L'ultimo operatore è il rotore, e lo costruiamo con un attrezzo del §1.3.4, il vettore assiale. Il gradiente $\\nabla\\vet u$ è un tensore, quindi ha una parte antisimmetrica; e ogni antisimmetrico agisce come un prodotto vettoriale per il suo vettore assiale (Teo 1.3.4). Il **rotore** di $\\vet u$ è definito proprio in questo modo (Def 1.8.5): è il campo vettoriale tale che

$$\\operatorname{rot}\\vet u\\wedge\\vet a=(\\nabla\\vet u-\\nabla\\vet u^T)\\vet a\\quad\\forall\\vet a.$$

In altre parole $\\operatorname{rot}\\vet u$ è il **vettore assiale** del tensore antisimmetrico $\\nabla\\vet u-\\nabla\\vet u^T$, che è il doppio della parte antisimmetrica del gradiente, $2\\operatorname{skw}\\nabla\\vet u$. Da un vettore si ottiene un vettore: l'ordine resta invariato, come dice l'osservazione all'inizio.

L'intuizione (deduzione): la parte antisimmetrica del gradiente descrive come il campo «gira» intorno al punto, e il vettore assiale ne dà l'asse. Per la rotazione rigida del modello il rotore è diverso da zero, per la sorgente è nullo (deduzione).

Una nota sulla fonte: a questo punto la dispensa rimanda a «§3.4» per il vettore assiale, ma il vettore assiale è trattato nel §1.3.4 (vedi NF-01). Infine (Def 1.8.6) il rotore di un campo tensoriale si definisce, per analogia con la divergenza, attraverso il campo vettoriale $\\tens A^T\\vet a$: $(\\operatorname{rot}\\tens A)\\vet a=\\operatorname{rot}(\\tens A^T\\vet a)$ per ogni $\\vet a$.`,
      },
      {
        id: 'l17-6b',
        kind: 'spiega',
        title: 'Attenzione a tre errori',
        md: `Tre errori ricorrono su questa lezione.

1. **Fare la divergenza di un tensore «per colonne».** Con la convenzione della dispensa si fa per righe: $(\\operatorname{div}\\tens A)_i=\\sum_j\\partial A_{ij}/\\partial x_j$. La convenzione nasce dal trasposto nella definizione, $\\operatorname{div}(\\tens A^T\\vet a)$: se ti confondi, rifai i tre passaggi della derivazione.
2. **Dimenticare che la normale è uscente.** Nel teorema della divergenza $\\hat n$ punta fuori dalla regione. Con la normale entrante il flusso cambierebbe segno e l'uguaglianza diventerebbe falsa (deduzione).
3. **Pensare che divergenza nulla voglia dire campo nullo.** La rotazione rigida $\\vet u=(-y,x)$ del modello ha divergenza nulla ovunque, ma il campo non è nullo: semplicemente tanto entra quanto esce da ogni regione (deduzione).`,
      },
      {
        id: 'l17-7',
        kind: 'domanda',
        q: { id: 'l17-q1', kind: 'scelta', q: 'Un campo ha divergenza nulla in tutto il dominio. Che cosa puoi dire del flusso uscente dalla frontiera?', options: ['È nullo', 'È positivo', 'Dipende dalla forma del dominio', 'Il campo è nullo'], correct: 0, why: 'Per il teorema della divergenza il flusso uscente è l\'integrale della divergenza nel volume, che qui è zero per qualunque forma del dominio. Il campo però non è necessariamente nullo: la rotazione rigida ha divergenza nulla ed è diversa da zero.' },
      },
      {
        id: 'l17-8',
        kind: 'riassunto',
        md: `**Il filo della lezione.** Per i campi servono le derivate. Il gradiente raccoglie le nove derivate di un campo vettoriale in un tensore, con la componente in riga e la derivata in colonna, e alza l'ordine; la divergenza ne prende la traccia e lo abbassa. La divergenza di un campo tensoriale si definisce in modo intrinseco, chiedendo che la sua componente lungo ogni vettore fisso $\\vet a$ sia $\\operatorname{div}(\\tens A^T\\vet a)$, e da qui si ricava che si fa per righe. Il teorema della divergenza dice che il flusso uscente dal bordo è l'integrale della divergenza nel volume, e la versione tensoriale si ottiene da quella vettoriale con lo stesso trucco del vettore fisso. Il rotore è il vettore assiale della parte antisimmetrica del gradiente, raddoppiata.

- Gradiente: $(\\nabla\\vet u)_{ij}:=\\partial u_i/\\partial x_j$ (Def 1.8.1); divergenza: $\\operatorname{div}\\vet u:=\\operatorname{tr}\\nabla\\vet u$ (Def 1.8.2).
- Divergenza di un tensore: $\\vet a\\cdot\\operatorname{div}\\tens A:=\\operatorname{div}(\\tens A^T\\vet a)$, $(\\operatorname{div}\\tens A)_i=\\sum_j\\partial A_{ij}/\\partial x_j$ (Def 1.8.3).
- Teorema della divergenza: $\\int_{\\partial D}\\vet u\\cdot\\hat n\\,dA=\\int_D\\operatorname{div}\\vet u\\,dV$, $\\int_{\\partial D}\\tens A\\hat n\\,dA=\\int_D\\operatorname{div}\\tens A\\,dV$ (Teo 1.8.4).
- Rotore: $\\operatorname{rot}\\vet u\\wedge\\vet a=(\\nabla\\vet u-\\nabla\\vet u^T)\\vet a$ (Def 1.8.5).

Servirà subito: nel Cap. 3 il teorema della divergenza trasforma l'equilibrio di una parte del corpo nelle equazioni indefinite $\\operatorname{div}\\tens T+\\vet b=\\vet 0$.`,
        orale: ['Divergenza di un campo tensoriale: definizione intrinseca e derivazione delle componenti; teorema della divergenza. (dispensa, domanda 11)'],
      },
    ],
  },
];
