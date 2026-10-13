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
    minutes: 12,
    source: D(1, '1.1–1.2.3', 'Def 1.1.1, 1.2.1, 1.2.2', '1–3'),
    visual: LAB({ mode: 'trasforma', presets: ['taglio', 'stiramento', 'rotazione', 'generico'], controls: ['preset', 'cube'], cube: false }),
    steps: [
      {
        id: 'l11-1',
        kind: 'spiega',
        title: 'Perché servono i tensori',
        md: `In Scienza delle Costruzioni ci servirà un oggetto che, dato un vettore, ne restituisce un altro.

Due esempi che vedremo. Nel Cap. 2 una fibra $d\\vet X$ del corpo diventa $d\\vet x=\\tens F\\,d\\vet X$. Nel Cap. 3 a ogni giacitura $\\hat n$ corrisponde un vettore tensione $\\vet t_n=\\tens T\\hat n$.

In entrambi i casi l'oggetto è un **tensore del secondo ordine**. A destra ne vedi uno al lavoro: i versori grigi sono $\\hat e_1,\\hat e_2,\\hat e_3$, le frecce colorate sono le loro immagini.`,
      },
      {
        id: 'l11-2',
        kind: 'spiega',
        title: 'Ordine di un ente e notazione',
        md: `Gli enti si classificano per **ordine**. In uno spazio tridimensionale un ente di ordine $n$ ha $3^n$ componenti (§1.1.3).

- scalari: ordine 0, 1 componente, lettere greche $\\alpha,\\lambda$;
- vettori: ordine 1, 3 componenti, minuscole sottosegnate $\\vet u$;
- tensori del II ordine: 9 componenti, maiuscole con tilde sottoscritta $\\tens A$;
- tensori del IV ordine: 81 componenti, maiuscole «filettate» $\\mathbb A$.

Le componenti di un vettore sono $v_i:=\\vet v\\cdot\\hat e_i$ (Def 1.1.1), in un riferimento **ortonormale destrorso**: $\\hat e_i\\cdot\\hat e_j=\\delta_{ij}$.`,
      },
      {
        id: 'l11-3',
        kind: 'spiega',
        title: 'Definizione: una trasformazione lineare',
        md: `**Def 1.2.1.** Un tensore del II ordine $\\tens A$ è una trasformazione lineare di $\\mathcal V$ in $\\mathcal V$:

$$\\tens A(\\alpha\\vet u+\\beta\\vet v)=\\alpha\\tens A\\vet u+\\beta\\tens A\\vet v\\quad\\forall\\alpha,\\beta,\\ \\forall\\vet u,\\vet v.$$

Tre casi particolari: con $\\alpha=\\beta=1$ l'**additività**, con $\\beta=0$ l'**omogeneità**, con $\\alpha=\\beta=0$ la conseguenza $\\tens A\\vet 0=\\vet 0$.

Per convenzione si scrive prima il tensore e poi il vettore. L'insieme dei tensori del II ordine si chiama $\\mathrm{Lin}$.`,
      },
      {
        id: 'l11-4',
        kind: 'prova',
        title: 'Guarda dove vanno i versori',
        md: 'Nel modello le frecce colorate sono $\\tens A\\hat e_1$, $\\tens A\\hat e_2$, $\\tens A\\hat e_3$. Sotto c\'è la matrice $[\\tens A]$.',
        tasks: [
          'Scegli «stiramento lungo x»: cambia solo $\\tens A\\hat e_1$. Ritrovi i suoi numeri nella **prima colonna** di $[\\tens A]$.',
          'Scegli «taglio»: $\\tens A\\hat e_2$ si inclina verso x. Leggi $(0{,}8;\\ 1;\\ 0)$ nella **seconda colonna**.',
          'Scegli «rotazione»: le tre immagini restano lunghe 1 e ortogonali tra loro.',
          'Accendi «cubo unitario trasformato»: con il taglio il cubo diventa un parallelepipedo inclinato.',
        ],
        visual: LAB({ mode: 'trasforma', presets: ['stiramento', 'taglio', 'rotazione', 'generico'], controls: ['preset', 'cube'], cube: false, A: PRESETS.stiramento.A }),
      },
      {
        id: 'l11-5',
        kind: 'spiega',
        title: 'Le componenti, e in che ordine si legge',
        md: `**Def 1.2.2.** Le 9 componenti di $\\tens A$ sono

$$A_{ij}:=\\tens A\\hat e_j\\cdot\\hat e_i.$$

Attenzione all'ordine (box di p. 3). Si legge $(\\tens A\\hat e_j)\\cdot\\hat e_i$: prima si applica l'ente di ordine superiore a quello di ordine inferiore, poi si fa il prodotto scalare, che è tra grandezze omogenee (vettore con vettore). Leggere $\\tens A(\\hat e_j\\cdot\\hat e_i)$ non ha senso: il tensore opererebbe su un numero.

Per questo la **colonna $j$** di $[\\tens A]$ è l'immagine di $\\hat e_j$: è quello che hai visto nel modello. E applicare $\\tens A$ a un vettore diventa il prodotto righe per colonna: $(\\tens A\\vet v)_i=\\sum_jA_{ij}v_j$.

La definizione di tensore non dipende dal riferimento; la matrice sì.`,
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
          why: 'Si satura prima l\'ente di ordine superiore su quello di ordine inferiore; il prodotto scalare va fatto tra due vettori (Attenzione, p. 3).',
        },
      },
      {
        id: 'l11-7',
        kind: 'numeri',
        title: 'Un esempio con i numeri',
        md: `Prendiamo il tensore «generico» del modello e $\\vet v=(1;\\ 2;\\ -1)$. Righe per colonna:

$$\\tens A\\vet v=(${f(AV[0])};\\ ${f(AV[1])};\\ ${f(AV[2])}).$$

Per esempio $(\\tens A\\vet v)_1=A_{11}\\cdot1+A_{12}\\cdot2+A_{13}\\cdot(-1)=1{,}2+1-0{,}1=${f(AV[0])}$. La componente $A_{23}=${f(A_GEN[5])}$ è la seconda componente di $\\tens A\\hat e_3$.`,
        values: { Av1: AV[0], Av2: AV[1], Av3: AV[2], A23: A_GEN[5] },
        visual: LAB({ mode: 'trasforma', A: A_GEN, controls: ['cube'], cube: false }),
      },
      {
        id: 'l11-8',
        kind: 'riassunto',
        md: `**In una frase:** un tensore del II ordine è una trasformazione lineare dei vettori; le sue componenti $A_{ij}=\\tens A\\hat e_j\\cdot\\hat e_i$ dipendono dal riferimento, il tensore no.

- $3^n$ componenti per un ente di ordine $n$.
- Linearità: additività, omogeneità, $\\tens A\\vet 0=\\vet 0$.
- Colonna $j$ di $[\\tens A]$ = immagine di $\\hat e_j$.`,
        orale: ["Che cos'è un tensore del II ordine? Perché le componenti si definiscono come $\\tens A\\hat e_j\\cdot\\hat e_i$ e in che ordine si eseguono le operazioni? (dispensa, domanda 1)"],
      },
    ],
  },

  // ================================================================== c1.2
  {
    concept: 'c1.2',
    title: 'Diade, base di Lin, proiettori, composizione',
    minutes: 16,
    source: D(1, '1.2.4–1.2.6', 'Def 1.2.3, Prop 1.2.4, Def 1.2.5–1.2.7', '3–4'),
    visual: LAB({ mode: 'trasforma', A: T.dyad([1, 0.4, 0.3], [0.5, 0.7, 0.2]), controls: ['cube'], cube: true }),
    steps: [
      {
        id: 'l12-1',
        kind: 'spiega',
        title: 'La diade',
        md: `**Def 1.2.3.** Dati $\\vet a,\\vet b$, la diade $\\vet a\\otimes\\vet b$ è il tensore tale che

$$(\\vet a\\otimes\\vet b)\\vet u=(\\vet b\\cdot\\vet u)\\,\\vet a\\quad\\forall\\vet u.$$

Qualunque vettore le dai, il risultato è **parallelo ad $\\vet a$**. Il vettore $\\vet b$ decide solo «quanto»: l'intensità è proporzionale alla componente di $\\vet u$ lungo $\\vet b$.

Nel modello c'è una diade: le tre immagini dei versori stanno tutte sulla stessa retta e il cubo si schiaccia su un segmento.`,
      },
      {
        id: 'l12-2',
        kind: 'derivazione',
        title: 'Le componenti della diade',
        md: 'Usiamo solo la definizione di componente (Def 1.2.2) e quella di diade.',
        source: D(1, '1.2.4', 'Def 1.2.3', 3),
        der: {
          sample: (r) => {
            const o: R = { i: idx(r), j: idx(r) };
            putVec(o, 'a', T.randVec(r));
            putVec(o, 'b', T.randVec(r));
            return o;
          },
          lines: [
            { tex: '(\\vet a\\otimes\\vet b)_{ij}=(\\vet a\\otimes\\vet b)\\hat e_j\\cdot\\hat e_i', why: 'Partiamo dalla definizione di componente: si applica il tensore a $\\hat e_j$ e si proietta su $\\hat e_i$.', val: (v) => T.dotv(T.apply(T.dyad(vec(v, 'a'), vec(v, 'b')), T.basis(v.j)), T.basis(v.i)) },
            {
              tex: '=\\big[(\\vet b\\cdot\\hat e_j)\\,\\vet a\\big]\\cdot\\hat e_i',
              why: 'Applichiamo la definizione di diade al vettore $\\hat e_j$.',
              ask: { q: 'Quanto vale $(\\vet a\\otimes\\vet b)\\hat e_j$?', options: ['$(\\vet b\\cdot\\hat e_j)\\,\\vet a$', '$(\\vet a\\cdot\\hat e_j)\\,\\vet b$', '$\\vet a\\wedge\\vet b$', '$a_jb_j$'], correct: 0, why: 'Per definizione $(\\vet a\\otimes\\vet b)\\vet u=(\\vet b\\cdot\\vet u)\\vet a$, con $\\vet u=\\hat e_j$.' },
              val: (v) => T.dotv(T.scalev(vec(v, 'a'), T.dotv(vec(v, 'b'), T.basis(v.j))), T.basis(v.i)),
            },
            { tex: '=(\\vet b\\cdot\\hat e_j)(\\vet a\\cdot\\hat e_i)=b_j\\,a_i', why: 'Il numero $\\vet b\\cdot\\hat e_j$ esce dal prodotto scalare; restano le componenti dei due vettori.', eq: 'Def 1.2.3', val: (v) => vec(v, 'b')[v.j] * vec(v, 'a')[v.i] },
          ],
        },
      },
      {
        id: 'l12-3',
        kind: 'derivazione',
        title: 'Le 9 diadi dei versori sono una base di Lin',
        md: '**Prop 1.2.4:** ogni tensore è la somma dei prodotti di ciascuna componente per la diade dei versori omonimi. Mostriamo che la somma fa lo stesso effetto di $\\tens A$ su un vettore qualunque.',
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
              why: 'Applichiamo a $\\vet u$ la somma delle diadi pesate con le componenti; guardiamo la componente $k$ del risultato.',
              val: (v) => {
                let S = T.O3;
                const A = mat(v, 'A');
                for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) S = T.add(S, T.scale(T.dyad(T.basis(i), T.basis(j)), T.at(A, i, j)));
                return T.apply(S, vec(v, 'u'))[v.k];
              },
            },
            {
              tex: '=\\Big[\\textstyle\\sum_{ij}A_{ij}\\,u_j\\,\\hat e_i\\Big]_k',
              why: 'Ogni diade dà $(\\hat e_j\\cdot\\vet u)\\hat e_i=u_j\\hat e_i$.',
              ask: { q: 'Quanto vale $(\\hat e_i\\otimes\\hat e_j)\\vet u$?', options: ['$u_j\\,\\hat e_i$', '$u_i\\,\\hat e_j$', '$\\delta_{ij}\\vet u$', '$u_iu_j$'], correct: 0, why: 'Definizione di diade con $\\vet a=\\hat e_i$, $\\vet b=\\hat e_j$: $(\\hat e_j\\cdot\\vet u)\\hat e_i=u_j\\hat e_i$.' },
              val: (v) => {
                const A = mat(v, 'A');
                const u = vec(v, 'u');
                return [0, 1, 2].reduce((s, j) => s + T.at(A, v.k, j) * u[j], 0);
              },
            },
            { tex: '=\\Big[\\textstyle\\sum_i(\\tens A\\vet u)_i\\,\\hat e_i\\Big]_k=(\\tens A\\vet u)_k', why: 'La somma su $j$ è proprio la componente $i$ di $\\tens A\\vet u$ (righe per colonna). Quindi la somma delle diadi agisce come $\\tens A$ su ogni vettore.', eq: 'Prop 1.2.4', val: (v) => T.apply(mat(v, 'A'), vec(v, 'u'))[v.k] },
          ],
        },
      },
      {
        id: 'l12-4',
        kind: 'spiega',
        title: 'Indipendenza, e a che cosa serve',
        md: `Resta l'indipendenza lineare: se $\\sum_{ij}c_{ij}\\,\\hat e_i\\otimes\\hat e_j=\\tens O$, questo tensore ha componenti $c_{ij}$, che quindi sono tutte nulle.

La rappresentazione $\\tens A=\\sum_{ij}A_{ij}\\,\\hat e_i\\otimes\\hat e_j$ permette di passare dalla notazione indiciale a quella assoluta. Le stesse diadi serviranno a definire le componenti dei tensori del IV ordine (§1.7).`,
      },
      {
        id: 'l12-5',
        kind: 'spiega',
        title: 'I proiettori',
        md: `**Def 1.2.5.** Con $\\hat e$ versore:

- $\\hat e\\otimes\\hat e$ è il **proiettore in direzione $\\hat e$**: $(\\hat e\\otimes\\hat e)\\vet u=(\\hat e\\cdot\\vet u)\\hat e$;
- $\\tens I-\\hat e\\otimes\\hat e$ è il **proiettore ortogonale**: porta $\\vet u$ sul piano $\\pi\\perp\\hat e$.

Il primo dà un vettore con la direzione di $\\hat e$ e modulo, con segno, pari alla componente di $\\vet u$ lungo $\\hat e$. Il secondo dà la parte che resta. Insieme ricostruiscono $\\vet u$:

$$\\vet u=(\\hat e\\otimes\\hat e)\\vet u+(\\tens I-\\hat e\\otimes\\hat e)\\vet u.$$`,
        visual: LAB({ mode: 'proiettori', controls: ['dir', 'u'] }),
      },
      {
        id: 'l12-6',
        kind: 'prova',
        title: 'Muovi ê e guarda le due parti',
        md: 'Nel modello: $\\vet u$ viola, $\\hat e$ verde scuro, la proiezione lungo $\\hat e$ arancione, quella sul piano verde chiaro.',
        tasks: [
          'Porta $\\hat e$ circa nella direzione di $\\vet u$: la parte sul piano diventa quasi nulla.',
          'Rendi $\\hat e$ circa ortogonale a $\\vet u$: ora è $(\\hat e\\otimes\\hat e)\\vet u$ a sparire.',
          'Supera i 90° tra $\\hat e$ e $\\vet u$: $\\hat e\\cdot\\vet u$ diventa negativo e la freccia arancione punta al contrario di $\\hat e$.',
          'Controlla nel pannello che le due parti sommate diano sempre $\\vet u$.',
        ],
        visual: LAB({ mode: 'proiettori', controls: ['dir', 'u'] }),
      },
      {
        id: 'l12-7',
        kind: 'domanda',
        q: { id: 'l12-q1', kind: 'vf', q: 'La diade $\\vet a\\otimes\\vet b$ trasforma ogni vettore in un vettore parallelo a $\\vet b$.', answer: false, why: '$(\\vet a\\otimes\\vet b)\\vet u=(\\vet b\\cdot\\vet u)\\vet a$: il risultato è parallelo ad $\\vet a$.' },
      },
      {
        id: 'l12-8',
        kind: 'spiega',
        title: 'Somma e composizione',
        md: `**Def 1.2.6–1.2.7.** La somma agisce componente per componente. Il **prodotto di composizione** applica i tensori uno dopo l'altro:

$$(\\tens A\\tens B)\\vet u=\\tens A(\\tens B\\vet u),\\qquad (\\tens A\\tens B)_{ij}=\\textstyle\\sum_kA_{ik}B_{kj}.$$

In generale $\\tens A\\tens B\\neq\\tens B\\tens A$. Quando sono uguali si dice che i due tensori **commutano**. $\\tens I$ e $\\tens O$ commutano con tutti; più in generale commutano con ogni tensore **tutti e soli** i tensori sferici $\\lambda\\tens I$.`,
      },
      {
        id: 'l12-9',
        kind: 'numeri',
        title: 'Taglio e rotazione non commutano',
        md: `Con $\\tens A$ = taglio e $\\tens B$ = rotazione di 30° attorno a z (preimpostazioni del modello):

$$(\\tens A\\tens B)_{11}=${f(AB[0], 4)},\\qquad (\\tens B\\tens A)_{11}=${f(BA[0], 4)}.$$

Sono diversi: «prima ruoto e poi taglio» non è «prima taglio e poi ruoto».`,
        values: { AB11: AB[0], BA11: BA[0] },
      },
      {
        id: 'l12-10',
        kind: 'riassunto',
        md: `**In una frase:** la diade $\\vet a\\otimes\\vet b$ manda tutto lungo $\\vet a$; le 9 diadi dei versori sono una base di Lin, e $\\hat e\\otimes\\hat e$, $\\tens I-\\hat e\\otimes\\hat e$ proiettano lungo $\\hat e$ e sul piano ortogonale.

- $(\\vet a\\otimes\\vet b)_{ij}=a_ib_j$.
- $\\tens A=\\sum_{ij}A_{ij}\\,\\hat e_i\\otimes\\hat e_j$.
- La composizione non commuta; commutano con tutti solo i $\\lambda\\tens I$.`,
        orale: ['Definire la diade e dimostrare che le 9 diadi $\\hat e_i\\otimes\\hat e_j$ sono una base di Lin. (domanda 2)', 'Proiettore lungo $\\hat e$ e proiettore ortogonale: definizione e interpretazione geometrica. (domanda 3)'],
      },
    ],
  },

  // ================================================================== c1.3
  {
    concept: 'c1.3',
    title: 'Simmetrico, antisimmetrico, vettore assiale',
    minutes: 16,
    source: D(1, '1.3', 'Def 1.3.1–1.3.2, Teo 1.3.3–1.3.4', '5–6'),
    visual: SVG('matrici', { focus: 'decomposizione' }),
    steps: [
      {
        id: 'l13-1',
        kind: 'spiega',
        title: 'Il trasposto',
        md: `**Def 1.3.1.** Il trasposto $\\tens A^T$ è il tensore tale che

$$(\\tens A\\vet u)\\cdot\\vet v=(\\tens A^T\\vet v)\\cdot\\vet u\\quad\\forall\\vet u,\\vet v.$$

In componenti scambia gli indici: $A^T_{ij}=A_{ji}$. Proprietà: $(\\tens A+\\tens B)^T=\\tens A^T+\\tens B^T$, $(\\tens A\\tens B)^T=\\tens B^T\\tens A^T$ (l'ordine si inverte), $(\\tens A^T)^T=\\tens A$, $(\\vet a\\otimes\\vet b)^T=\\vet b\\otimes\\vet a$.`,
      },
      {
        id: 'l13-2',
        kind: 'spiega',
        title: 'Simmetrici e antisimmetrici',
        md: `Alcuni tensori restano uguali se trasposti, altri cambiano segno (**Def 1.3.2**):

$$\\mathrm{Sym}:=\\{\\tens A=\\tens A^T\\},\\qquad \\mathrm{Skw}:=\\{\\tens W=-\\tens W^T\\}.$$

Un simmetrico ha 6 componenti distinte. In un antisimmetrico ogni componente diagonale dovrebbe essere opposta a sé stessa: $W_{ii}=-W_{ii}$, quindi $W_{ii}=0$. Restano **3** componenti indipendenti.

A destra puoi scrivere i numeri di $[\\tens A]$ e vedere le due parti.`,
      },
      {
        id: 'l13-3',
        kind: 'derivazione',
        title: 'I teorema di decomposizione: esistenza',
        md: '**Teo 1.3.3.** Per ogni $\\tens A$ esistono e sono unici $\\tens E\\in\\mathrm{Sym}$ e $\\tens W\\in\\mathrm{Skw}$ con $\\tens A=\\tens E+\\tens W$. Per l\'esistenza basta esibirli: $\\tens E=\\frac12(\\tens A+\\tens A^T)$, $\\tens W=\\frac12(\\tens A-\\tens A^T)$.',
        source: D(1, '1.3.3', 'Teo 1.3.3', 5),
        der: {
          sample: (r) => {
            const o: R = { p: idx(r), q: idx(r) };
            putMat(o, 'A', T.randMat(r));
            return o;
          },
          lines: [
            { tex: '(\\tens E+\\tens W)_{pq}', why: 'Sommiamo le due parti proposte e guardiamo una componente qualunque $pq$.', val: (v) => T.add(T.sym(mat(v, 'A')), T.skw(mat(v, 'A')))[3 * v.p + v.q] },
            {
              tex: '=\\tfrac12(A_{pq}+A_{qp})+\\tfrac12(A_{pq}-A_{qp})',
              why: 'Scriviamo le definizioni in componenti, ricordando che $A^T_{pq}=A_{qp}$.',
              val: (v) => {
                const A = mat(v, 'A');
                return 0.5 * (T.at(A, v.p, v.q) + T.at(A, v.q, v.p)) + 0.5 * (T.at(A, v.p, v.q) - T.at(A, v.q, v.p));
              },
            },
            {
              tex: '=A_{pq}',
              why: 'I termini $A_{qp}$ si elidono: la somma ridà $\\tens A$.',
              eq: 'Teo 1.3.3',
              ask: { q: 'Che cosa resta della somma?', options: ['$A_{pq}$', '$A_{qp}$', '$\\frac12A_{pq}$', '$0$'], correct: 0, why: '$\\frac12A_{pq}+\\frac12A_{pq}=A_{pq}$, mentre $+\\frac12A_{qp}-\\frac12A_{qp}=0$.' },
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
        id: 'l13-4',
        kind: 'derivazione',
        title: 'I teorema di decomposizione: unicità',
        md: 'All\'orale si chiede «esistenza **e** unicità». L\'unicità si dimostra supponendo due decomposizioni.',
        source: D(1, '1.3.3', 'Teo 1.3.3', 5),
        der: {
          lines: [
            { tex: '\\tens A=\\tens E+\\tens W=\\tens E\'+\\tens W\'', why: 'Supponiamo che $\\tens A$ si scriva in due modi, con $\\tens E,\\tens E\'$ simmetrici e $\\tens W,\\tens W\'$ antisimmetrici.' },
            {
              tex: '\\tens E-\\tens E\'=\\tens W\'-\\tens W',
              why: 'Portiamo le parti simmetriche a sinistra e quelle antisimmetriche a destra.',
              ask: { q: 'Che cosa ha di speciale il tensore $\\tens E-\\tens E\'=\\tens W\'-\\tens W$?', options: ['È simmetrico e antisimmetrico insieme', 'È ortogonale', 'Ha determinante nullo', 'È sferico'], correct: 0, why: 'A sinistra è differenza di simmetrici, a destra di antisimmetrici: è entrambe le cose.' },
            },
            { tex: '\\tens E-\\tens E\'=-(\\tens E-\\tens E\')\\ \\Rightarrow\\ \\tens E=\\tens E\',\\ \\ \\tens W=\\tens W\'', why: 'Un tensore simmetrico e antisimmetrico è uguale al proprio opposto: è $\\tens O$. Le due decomposizioni coincidono.', eq: 'Teo 1.3.3' },
          ],
        },
      },
      {
        id: 'l13-5',
        kind: 'prova',
        title: 'Scomponi un tensore',
        md: 'Nel diagramma a destra scrivi i numeri di $[\\tens A]$ e osserva le due parti.',
        tasks: [
          'Con «generico»: la diagonale di $\\operatorname{skw}\\tens A$ è nulla, quella di $\\operatorname{sym}\\tens A$ è la diagonale di $\\tens A$.',
          'Premi «simmetrico»: la parte antisimmetrica sparisce del tutto.',
          'Premi «antisimmetrico»: sparisce quella simmetrica, e compare il vettore assiale.',
          'Cambia $A_{12}$ e $A_{21}$ in modo diverso: la differenza finisce tutta in $\\operatorname{skw}\\tens A$.',
        ],
        visual: SVG('matrici', { focus: 'decomposizione' }),
      },
      {
        id: 'l13-6',
        kind: 'spiega',
        title: 'Il vettore assiale',
        md: `**Teo 1.3.4.** Per ogni $\\tens W\\in\\mathrm{Skw}$ esiste un unico vettore $\\vet w$, il **vettore assiale**, tale che

$$\\tens W\\vet u=\\vet w\\wedge\\vet u\\quad\\forall\\vet u,\\qquad [\\tens W]=\\begin{bmatrix}0&-w_3&w_2\\\\w_3&0&-w_1\\\\-w_2&w_1&0\\end{bmatrix}.$$

Le 3 componenti indipendenti di $\\tens W$ sono le 3 componenti di $\\vet w$; la matrice si verifica sviluppando $\\vet w\\wedge\\vet u$.

Due conseguenze: $\\tens W\\vet w=\\vet w\\wedge\\vet w=\\vet 0$ (il vettore assiale sta nel nucleo), e $\\tens W\\vet u$ è ortogonale sia a $\\vet u$ sia a $\\vet w$. Il prodotto vettoriale richiama la rotazione: lo useremo nella formula di Eulero.`,
        visual: LAB({ mode: 'assiale', controls: ['dir', 'wLen', 'u'] }),
      },
      {
        id: 'l13-7',
        kind: 'prova',
        title: 'W u è sempre ortogonale',
        md: 'Nel modello: $\\vet w$ verde scuro, $\\vet u$ viola, $\\tens W\\vet u$ arancione.',
        tasks: [
          'Ruota $\\vet w$: nel pannello $\\tens W\\vet u\\cdot\\vet u$ e $\\tens W\\vet u\\cdot\\vet w$ restano 0.',
          'Porta $\\vet w$ parallelo a $\\vet u$: $\\tens W\\vet u$ si annulla.',
          'Raddoppia $|\\vet w|$: $\\tens W\\vet u$ raddoppia (linearità).',
        ],
        visual: LAB({ mode: 'assiale', controls: ['dir', 'wLen', 'u'] }),
      },
      {
        id: 'l13-8',
        kind: 'domanda',
        q: { id: 'l13-q1', kind: 'vf', q: 'Un tensore antisimmetrico ha 6 componenti indipendenti.', answer: false, why: 'Sono 3: la diagonale è nulla e $W_{ij}=-W_{ji}$. Sono le componenti del vettore assiale.' },
      },
      {
        id: 'l13-9',
        kind: 'riassunto',
        md: `**In una frase:** ogni tensore si scrive in un solo modo come somma di una parte simmetrica e una antisimmetrica, e la parte antisimmetrica agisce come $\\vet w\\wedge\\cdot$.

- $\\tens E=\\frac12(\\tens A+\\tens A^T)$, $\\tens W=\\frac12(\\tens A-\\tens A^T)$; unicità: simmetrico e antisimmetrico ⇒ nullo.
- $W_{ii}=0$; 3 componenti; $\\tens W\\vet w=\\vet 0$.`,
        orale: ['Enunciare e dimostrare il I teorema di decomposizione (esistenza e unicità). (domanda 4)', "Perché un tensore antisimmetrico ha diagonale nulla? Che cos'è il vettore assiale? (domanda 5)"],
      },
    ],
  },

  // ================================================================== c1.4
  {
    concept: 'c1.4',
    title: 'Determinante, ortogonali e formula di Eulero',
    minutes: 22,
    source: D(1, '1.4–1.5', 'Def 1.4.1–1.4.2, 1.5.1, Prop 1.5.2, Teo 1.5.3, eq. (1.1)', '6–8'),
    visual: LAB({ mode: 'trasforma', presets: ['taglio', 'sferico', 'riflessione', 'singolare', 'generico'], controls: ['preset'], cube: true, A: PRESETS.sferico.A }),
    steps: [
      {
        id: 'l14-1',
        kind: 'spiega',
        title: 'Il determinante misura i volumi',
        md: `**Def 1.4.1.** Per tre vettori $\\vet u,\\vet v,\\vet w$ linearmente indipendenti

$$\\det\\tens A:=\\frac{\\tens A\\vet u\\cdot\\tens A\\vet v\\wedge\\tens A\\vet w}{\\vet u\\cdot\\vet v\\wedge\\vet w}.$$

È il rapporto tra il prodotto misto dei trasformati e quello dei tre vettori, e non dipende dalla terna scelta. Geometricamente: è il fattore con cui $\\tens A$ moltiplica il **volume, con segno**, del parallelepipedo costruito sui tre vettori. Nel modello: il cubo unitario e il suo trasformato.`,
      },
      {
        id: 'l14-2',
        kind: 'prova',
        title: 'Volume e segno',
        md: 'Cambia tensore e leggi nel pannello $\\det\\tens A$ e il volume del cubo trasformato.',
        tasks: [
          `Sferico $1{,}3\\,\\tens I$: $\\det=${f(NUMERI_M1.det.sferico, 4)}=1{,}3^3$. Il determinante **non è lineare**: $\\det(\\lambda\\tens A)=\\lambda^3\\det\\tens A$.`,
          `Taglio: il cubo si inclina ma $\\det=${f(NUMERI_M1.det.taglio)}$: il volume non cambia.`,
          `Riflessione: $\\det=${f(NUMERI_M1.det.riflessione)}$; il solido diventa arancione: la terna immagine è sinistrorsa.`,
          `Singolare: $\\det=${f(NUMERI_M1.det.singolare)}$, il cubo si schiaccia su un piano.`,
        ],
        visual: LAB({ mode: 'trasforma', presets: ['sferico', 'taglio', 'riflessione', 'singolare', 'generico'], controls: ['preset'], cube: true, A: PRESETS.sferico.A }),
      },
      {
        id: 'l14-3',
        kind: 'spiega',
        title: 'Proprietà e inverso',
        md: `Proprietà: $\\det(\\tens A\\tens B)=\\det\\tens A\\det\\tens B$, $\\det\\tens A^T=\\det\\tens A$, $\\det\\tens A^{-1}=1/\\det\\tens A$. Attenzione: $\\det(\\tens A+\\tens B)\\neq\\det\\tens A+\\det\\tens B$.

**Def 1.4.2.** L'inverso $\\tens A^{-1}$ è l'unico tensore con $\\tens A\\tens A^{-1}=\\tens A^{-1}\\tens A=\\tens I$. Esiste **se e solo se** $\\det\\tens A\\neq0$: il caso singolare del modello non si può invertire, perché un volume schiacciato non torna indietro. Inoltre $(\\tens A^{-1})^T=(\\tens A^T)^{-1}=:\\tens A^{-T}$.`,
      },
      {
        id: 'l14-4',
        kind: 'spiega',
        title: 'Tensori ortogonali',
        md: `**Def 1.5.1.** $\\mathrm{Orth}:=\\{\\tens Q\\mid \\tens Q\\vet u\\cdot\\tens Q\\vet v=\\vet u\\cdot\\vet v\\ \\ \\forall\\vet u,\\vet v\\}$.

Conservano il prodotto scalare, quindi lunghezze e angoli. **Prop 1.5.2:** $\\det\\tens Q=\\pm1$ e $\\tens Q^T\\tens Q=\\tens Q\\tens Q^T=\\tens I$, cioè il trasposto è l'inverso. Dimostriamolo.`,
        visual: LAB({ mode: 'trasforma', presets: ['rotazione', 'riflessione'], controls: ['preset'], cube: true, A: PRESETS.rotazione.A }),
      },
      {
        id: 'l14-5',
        kind: 'derivazione',
        title: 'Il trasposto di un ortogonale è l’inverso',
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
            { tex: '\\tens Q\\vet u\\cdot\\tens Q\\vet v', why: 'Partiamo dal prodotto scalare dei trasformati.', val: (v) => T.dotv(T.apply(mat(v, 'Q'), vec(v, 'u')), T.apply(mat(v, 'Q'), vec(v, 'v'))) },
            {
              tex: '=\\tens Q^T\\tens Q\\vet u\\cdot\\vet v',
              why: 'Definizione di trasposto applicata a $\\tens Q$, con il vettore $\\tens Q\\vet u$ al posto di $\\vet u$: $(\\tens Q\\vet a)\\cdot\\vet b=(\\tens Q^T\\vet b)\\cdot\\vet a$.',
              ask: { q: 'Come sposto $\\tens Q$ dall\'altra parte del prodotto scalare?', options: ['Con il trasposto: $\\tens Q^T\\tens Q\\vet u\\cdot\\vet v$', 'Con l\'inverso: $\\tens Q^{-1}\\tens Q\\vet u\\cdot\\vet v$', 'Non si può', 'Con il determinante'], correct: 0, why: 'È la definizione di trasposto (Def 1.3.1). Che il trasposto sia l\'inverso è proprio quello che vogliamo dimostrare.' },
              val: (v) => T.dotv(T.apply(T.mul(T.transpose(mat(v, 'Q')), mat(v, 'Q')), vec(v, 'u')), vec(v, 'v')),
            },
            { tex: '=\\vet u\\cdot\\vet v', why: 'Perché $\\tens Q$ è ortogonale (definizione).', val: (v) => T.dotv(vec(v, 'u'), vec(v, 'v')) },
            { tex: '(\\tens Q^T\\tens Q-\\tens I)\\vet u\\cdot\\vet v=0\\ \\ \\forall\\vet u,\\vet v\\ \\Rightarrow\\ \\tens Q^T\\tens Q=\\tens I', why: 'Le ultime due righe dicono che questo prodotto scalare è nullo per ogni coppia di vettori: il tensore tra parentesi è nullo. Ne segue $\\tens Q^{-1}=\\tens Q^T$, e quindi anche $\\tens Q\\tens Q^T=\\tens I$.', eq: 'Prop 1.5.2' },
          ],
          checks: [{ what: 'componente $pq$ di $\\tens Q^T\\tens Q$ uguale a $\\delta_{pq}$', f: (v) => [T.mul(T.transpose(mat(v, 'Q')), mat(v, 'Q'))[3 * v.p + v.q], v.p === v.q ? 1 : 0] }],
        },
      },
      {
        id: 'l14-6',
        kind: 'derivazione',
        title: 'Il determinante vale ±1',
        source: D(1, '1.5.1', 'Prop 1.5.2', 7),
        der: {
          sample: (r) => {
            const o: R = {};
            const Q0 = T.eulerR(T.unit(T.randVec(r)), 2 * Math.PI * r());
            putMat(o, 'Q', r() < 0.5 ? Q0 : T.mul(PRESETS.riflessione.A, Q0));
            return o;
          },
          lines: [
            { tex: '1=\\det\\tens I', why: 'Il determinante dell\'identità è 1.', val: () => T.det(T.I3) },
            { tex: '=\\det(\\tens Q^T\\tens Q)', why: 'Abbiamo appena dimostrato $\\tens Q^T\\tens Q=\\tens I$.', val: (v) => T.det(T.mul(T.transpose(mat(v, 'Q')), mat(v, 'Q'))) },
            {
              tex: '=\\det\\tens Q^T\\det\\tens Q=(\\det\\tens Q)^2',
              why: 'Il determinante di un prodotto è il prodotto dei determinanti, e $\\det\\tens Q^T=\\det\\tens Q$.',
              ask: { q: 'Quali proprietà del determinante servono qui?', options: ['$\\det(\\tens A\\tens B)=\\det\\tens A\\det\\tens B$ e $\\det\\tens A^T=\\det\\tens A$', 'La linearità: $\\det(\\tens A+\\tens B)=\\det\\tens A+\\det\\tens B$', '$\\det(\\lambda\\tens A)=\\lambda\\det\\tens A$', 'Nessuna'], correct: 0, why: 'Il determinante non è lineare; si usano solo le proprietà del prodotto e del trasposto.' },
              val: (v) => T.det(mat(v, 'Q')) ** 2,
            },
            { tex: '\\Rightarrow\\ \\det\\tens Q=\\pm1', why: 'Un numero il cui quadrato è 1 vale $+1$ o $-1$.', eq: 'Prop 1.5.2' },
          ],
        },
      },
      {
        id: 'l14-7',
        kind: 'spiega',
        title: 'Rotazioni e riflessioni',
        md: `Il segno del determinante divide $\\mathrm{Orth}$ in due:

$$\\mathrm{Rot}:=\\{\\det\\tens R=1\\}\\ \\text{(rotazioni)},\\qquad \\mathrm{Rfl}:=\\{\\det\\tens P=-1\\}\\ \\text{(riflessioni)}.$$

Le riflessioni sono un'operazione analoga alla rotazione che però **non si ottiene da questa per continuità**: non puoi ruotare con continuità un guanto destro fino a farlo diventare sinistro. $\\tens I$ è una rotazione.`,
      },
      {
        id: 'l14-8',
        kind: 'spiega',
        title: 'La formula di Eulero',
        md: `**Teo 1.5.3.** Sia $\\tens R$ una rotazione propria ($\\tens R\\neq\\tens I$). Il suo **asse** è l'unico versore con $\\tens R\\hat e=\\hat e$. Allora esiste $\\varphi\\in[0,2\\pi)$ tale che

$$\\tens R=\\tens I+(1-\\cos\\varphi)\\,\\tens W^2+\\sin\\varphi\\,\\tens W\\tag{1.1}$$

dove $\\tens W$ è l'antisimmetrico con vettore assiale $\\hat e$ ($\\tens W\\vet v=\\hat e\\wedge\\vet v$) e $\\varphi$ è l'ampiezza.

$\\tens R$ fa ruotare $\\vet v$ di $\\varphi$ attorno a $\\hat e$. E l'asse resta fermo: $\\tens W\\hat e=\\hat e\\wedge\\hat e=\\vet 0$, quindi $\\tens R\\hat e=\\hat e$.`,
        visual: LAB({ mode: 'eulero', controls: ['dir', 'angle'], angle: 60 }),
      },
      {
        id: 'l14-9',
        kind: 'prova',
        title: 'Ruota v attorno all’asse',
        md: 'Nel modello: l\'asse $\\hat e$, il vettore $\\vet v$ (viola) e $\\tens R\\vet v$ (arancione) calcolato con la (1.1). La punta di $\\vet v$ percorre una circonferenza nel piano $\\pi\\perp\\hat e$.',
        tasks: [
          'Muovi l\'asse: $|\\tens R\\hat e-\\hat e|$ resta 0 nel pannello.',
          'Porta $\\varphi$ a 180°: $|\\tens R\\vet v|=|\\vet v|$ sempre; la rotazione conserva le lunghezze.',
          'Guarda «lungo l\'asse»: vedi la rotazione di ampiezza $\\varphi$ nel piano.',
          'Controlla $\\det\\tens R=1$.',
        ],
        visual: LAB({ mode: 'eulero', controls: ['dir', 'angle'], angle: 60 }),
      },
      {
        id: 'l14-10',
        kind: 'derivazione',
        title: 'Rotazioni infinitesime',
        md: 'Che cosa succede se $\\varphi\\ll1$? La dispensa approssima seno e coseno al primo ordine.',
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
              why: 'Per angoli piccoli: il termine in $\\tens W^2$ è di ordine superiore al primo.',
              ask: { q: 'Quale termine della (1.1) diventa trascurabile per $\\varphi\\ll1$?', options: ['$(1-\\cos\\varphi)\\tens W^2$', '$\\sin\\varphi\\,\\tens W$', '$\\tens I$', 'Nessuno'], correct: 0, why: '$1-\\cos\\varphi\\simeq\\varphi^2/2$: è di ordine superiore rispetto a $\\sin\\varphi\\simeq\\varphi$.' },
            },
            { tex: '\\tens R-\\tens I=\\varphi\\,\\tens W+o(\\varphi)', why: 'Resta solo il termine del primo ordine.' },
            { tex: '\\tens R\\vet v\\simeq\\tens I\\vet v+\\varphi\\,\\tens W\\vet v=\\vet v+\\varphi\\,\\hat e\\wedge\\vet v', why: 'Trascurando $o(\\varphi)$ e usando il vettore assiale. Si aggiunge a $\\vet v$ un vettore ortogonale a $\\vet v$ e a $\\hat e$: si approssima l\'arco con la tangente.' },
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
        id: 'l14-11',
        kind: 'prova',
        title: 'Arco e tangente',
        md: 'Accendi l\'approssimazione infinitesima: in giallo $\\varphi\\,\\hat e\\wedge\\vet v$ e il vettore $\\vet v+\\varphi\\,\\hat e\\wedge\\vet v$.',
        tasks: [
          'Con $\\varphi=5°$ la punta gialla quasi coincide con $\\tens R\\vet v$: l\'errore nel pannello è piccolissimo.',
          'Porta $\\varphi$ a 60°: la tangente «esce» dalla circonferenza, l\'errore cresce.',
          'Confronta $|\\vet v+\\varphi\\,\\hat e\\wedge\\vet v|$ con $|\\vet v|$: la lunghezza è conservata solo al primo ordine.',
        ],
        visual: LAB({ mode: 'eulero', controls: ['dir', 'angle', 'tangent'], angle: 5, tangent: true, view: 'asse' }),
      },
      {
        id: 'l14-12',
        kind: 'domanda',
        q: { id: 'l14-q1', kind: 'scelta', q: 'Un tensore ortogonale con $\\det=-1$ è…', options: ['una riflessione', 'una rotazione', 'non invertibile', 'antisimmetrico'], correct: 0, why: '$\\mathrm{Rfl}=\\{\\tens P\\in\\mathrm{Orth}\\mid\\det\\tens P=-1\\}$; esiste sempre l\'inverso $\\tens P^T$.' },
      },
      {
        id: 'l14-13',
        kind: 'riassunto',
        md: `**In una frase:** il determinante è il fattore di volume; gli ortogonali conservano lunghezze e angoli, hanno $\\tens Q^T=\\tens Q^{-1}$ e $\\det=\\pm1$; ogni rotazione si scrive con la (1.1), che per angoli piccoli diventa $\\vet v+\\varphi\\,\\hat e\\wedge\\vet v$.

- $\\det$ non è lineare: $\\det(\\lambda\\tens A)=\\lambda^3\\det\\tens A$.
- Inverso ⇔ $\\det\\neq0$.
- Rotazioni ($+1$) e riflessioni ($-1$) non sono collegate per continuità.`,
        orale: ['Dimostrare che per $\\tens Q\\in\\mathrm{Orth}$ si ha $\\tens Q^T=\\tens Q^{-1}$ e $\\det\\tens Q=\\pm1$; distinguere rotazioni e riflessioni. (domanda 6)', 'Scrivere la formula di Eulero, spiegare ogni termine e ricavare le rotazioni infinitesime. (domanda 7)'],
      },
    ],
  },

  // ================================================================== c1.5
  {
    concept: 'c1.5',
    title: 'Traccia, prodotto scalare e Sym ⊥ Skw',
    minutes: 14,
    source: D(1, '1.6', 'Def 1.6.1–1.6.2, Prop 1.6.3', '8–9'),
    visual: SVG('matrici', { focus: 'traccia' }),
    steps: [
      {
        id: 'l15-1',
        kind: 'spiega',
        title: 'La traccia',
        md: `**Def 1.6.1.** La traccia è l'operatore lineare $\\operatorname{tr}:\\mathrm{Lin}\\to\\mathbb R$ definito sulle diadi da

$$\\operatorname{tr}(\\vet a\\otimes\\vet b):=\\vet a\\cdot\\vet b.$$

Le diadi dei versori sono una base, quindi per linearità $\\operatorname{tr}\\tens A=\\sum_{ij}A_{ij}\\,\\hat e_i\\cdot\\hat e_j=A_{11}+A_{22}+A_{33}$: la somma della diagonale.

Proprietà: $\\operatorname{tr}\\tens A=\\operatorname{tr}\\tens A^T$, $\\operatorname{tr}(\\tens A\\tens B)=\\operatorname{tr}(\\tens B\\tens A)$, $\\operatorname{tr}\\tens I=3$, $\\operatorname{tr}\\tens W=0$.`,
      },
      {
        id: 'l15-2',
        kind: 'derivazione',
        title: 'La traccia di un antisimmetrico è nulla',
        source: D(1, '1.6.1', undefined, 8),
        der: {
          sample: (r) => {
            const o: R = {};
            putMat(o, 'A', T.randMat(r));
            return o;
          },
          lines: [
            { tex: '\\operatorname{tr}\\tens W', why: 'Sia $\\tens W$ antisimmetrico (qui: la parte antisimmetrica di un tensore a caso).', val: (v) => T.trace(T.skw(mat(v, 'A'))) },
            { tex: '=\\operatorname{tr}\\tens W^T', why: 'La traccia non cambia trasponendo.', val: (v) => T.trace(T.transpose(T.skw(mat(v, 'A')))) },
            {
              tex: '=\\operatorname{tr}(-\\tens W)=-\\operatorname{tr}\\tens W',
              why: 'Antisimmetria $\\tens W^T=-\\tens W$, poi linearità della traccia.',
              ask: { q: 'Quanto vale $\\tens W^T$ se $\\tens W$ è antisimmetrico?', options: ['$-\\tens W$', '$\\tens W$', '$\\tens W^{-1}$', '$\\tens O$'], correct: 0, why: 'È la definizione di $\\mathrm{Skw}$.' },
              val: (v) => -T.trace(T.skw(mat(v, 'A'))),
            },
            { tex: '\\Rightarrow\\ \\operatorname{tr}\\tens W=0', why: 'Un numero uguale al proprio opposto è zero. In componenti: $W_{ii}=0$.', eq: '§1.6.1', val: () => 0 },
          ],
        },
      },
      {
        id: 'l15-3',
        kind: 'spiega',
        title: 'Prodotto scalare tra tensori',
        md: `**Def 1.6.2.**

$$\\tens A\\cdot\\tens B:=\\operatorname{tr}(\\tens A\\tens B^T)=\\textstyle\\sum_{ij}A_{ij}B_{ij}.$$

È la somma dei prodotti delle componenti omonime, come per i vettori ma con 9 componenti. Dà la **norma** $\\|\\tens A\\|=(\\tens A\\cdot\\tens A)^{1/2}$, analoga al modulo. Due tensori sono **ortogonali** se $\\tens A\\cdot\\tens B=0$.

**Prop 1.6.3:** $\\tens A\\cdot\\tens I=\\operatorname{tr}\\tens A$; $\\tens A\\cdot(\\vet a\\otimes\\vet b)=\\tens A\\vet b\\cdot\\vet a$; $\\tens E\\cdot\\tens W=0$.`,
      },
      {
        id: 'l15-4',
        kind: 'derivazione',
        title: 'Prodotto scalare con una diade',
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
            { tex: '=\\textstyle\\sum_{ij}A_{ij}\\,a_ib_j', why: 'Somma dei prodotti delle componenti omonime, con $(\\vet a\\otimes\\vet b)_{ij}=a_ib_j$.', val: (v) => { const A = mat(v, 'A'), a = vec(v, 'a'), b = vec(v, 'b'); let s = 0; for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) s += T.at(A, i, j) * a[i] * b[j]; return s; } },
            {
              tex: '=\\textstyle\\sum_i a_i\\,(\\tens A\\vet b)_i',
              why: 'La somma su $j$ di $A_{ij}b_j$ è la componente $i$ di $\\tens A\\vet b$.',
              ask: { q: 'Che cosa è $\\sum_jA_{ij}b_j$?', options: ['$(\\tens A\\vet b)_i$', '$(\\tens A^T\\vet b)_i$', '$\\operatorname{tr}\\tens A$', '$a_ib_i$'], correct: 0, why: 'È il prodotto righe per colonna: componente $i$ di $\\tens A\\vet b$.' },
              val: (v) => T.dotv(vec(v, 'a'), T.apply(mat(v, 'A'), vec(v, 'b'))),
            },
            { tex: '=\\tens A\\vet b\\cdot\\vet a', why: 'È un prodotto scalare tra vettori.', eq: 'Prop 1.6.3', val: (v) => T.dotv(T.apply(mat(v, 'A'), vec(v, 'b')), vec(v, 'a')) },
          ],
          checks: [{ what: '$\\tens A\\cdot\\tens I=\\operatorname{tr}\\tens A$', f: (v) => [T.ddot(mat(v, 'A'), T.I3), T.trace(mat(v, 'A'))] }],
        },
      },
      {
        id: 'l15-5',
        kind: 'derivazione',
        title: 'Simmetrici e antisimmetrici sono ortogonali',
        md: 'È la domanda 8 della dispensa. Si gioca con la traccia in due modi diversi.',
        source: D(1, '1.6.2', 'Prop 1.6.3', 9),
        der: {
          sample: (r) => {
            const o: R = {};
            putMat(o, 'A', T.randMat(r));
            putMat(o, 'B', T.randMat(r));
            return o;
          },
          lines: [
            { tex: '\\tens E\\cdot\\tens W=\\operatorname{tr}(\\tens E\\tens W^T)', why: 'Definizione di prodotto scalare, con $\\tens E$ simmetrico e $\\tens W$ antisimmetrico.', val: (v) => T.ddot(T.sym(mat(v, 'A')), T.skw(mat(v, 'B'))) },
            { tex: '=-\\operatorname{tr}(\\tens E\\tens W)', why: 'Primo modo: $\\tens W^T=-\\tens W$.', val: (v) => -T.trace(T.mul(T.sym(mat(v, 'A')), T.skw(mat(v, 'B')))) },
            {
              tex: '\\operatorname{tr}(\\tens E\\tens W^T)=\\operatorname{tr}\\big((\\tens E\\tens W^T)^T\\big)=\\operatorname{tr}(\\tens W\\tens E)=\\operatorname{tr}(\\tens E\\tens W)',
              why: 'Secondo modo: la traccia non cambia trasponendo; $(\\tens E\\tens W^T)^T=\\tens W\\tens E^T=\\tens W\\tens E$; e $\\operatorname{tr}(\\tens W\\tens E)=\\operatorname{tr}(\\tens E\\tens W)$.',
              ask: { q: 'Quanto vale $(\\tens E\\tens W^T)^T$?', options: ['$\\tens W\\tens E$', '$\\tens E\\tens W$', '$\\tens E^T\\tens W$', '$-\\tens E\\tens W$'], correct: 0, why: '$(\\tens A\\tens B)^T=\\tens B^T\\tens A^T$: $(\\tens E\\tens W^T)^T=\\tens W\\tens E^T=\\tens W\\tens E$ perché $\\tens E$ è simmetrico.' },
              val: (v) => T.trace(T.mul(T.sym(mat(v, 'A')), T.skw(mat(v, 'B')))),
            },
            { tex: '\\Rightarrow\\ \\operatorname{tr}(\\tens E\\tens W)=-\\operatorname{tr}(\\tens E\\tens W)=0', why: 'Lo stesso numero è uguale al proprio opposto: è zero.', eq: 'Prop 1.6.3', val: () => 0 },
          ],
        },
      },
      {
        id: 'l15-6',
        kind: 'spiega',
        title: 'Lin = Sym ⊕ Skw',
        md: `$\\mathrm{Sym}$ e $\\mathrm{Skw}$ non sono solo disgiunti (l'unico tensore comune è $\\tens O$): sono **ortogonali**. Con il teorema di decomposizione, $\\mathrm{Lin}=\\mathrm{Sym}\\oplus\\mathrm{Skw}$ è una **somma diretta ortogonale**: $9=6+3$ componenti.

Conseguenza pratica, che ritroverai nel Cap. 4: se $\\tens T$ è simmetrico, $\\tens T\\cdot\\tens H=\\tens T\\cdot\\tens E$, perché il prodotto con la parte antisimmetrica di $\\tens H$ è nullo.`,
      },
      {
        id: 'l15-7',
        kind: 'prova',
        title: 'Prova a rompere l’ortogonalità',
        md: 'Nel diagramma, cambia le componenti di $[\\tens A]$.',
        tasks: [
          'Qualunque numero scrivi, $\\tens E\\cdot\\tens W$ resta 0.',
          'Controlla che $\\|\\tens A\\|^2=\\|\\tens E\\|^2+\\|\\tens W\\|^2$: è Pitagora, perché le due parti sono ortogonali.',
          'Cambia solo la diagonale: cambia $\\operatorname{tr}\\tens A$, mai $\\operatorname{tr}\\tens W$.',
        ],
        visual: SVG('matrici', { focus: 'traccia' }),
      },
      {
        id: 'l15-8',
        kind: 'domanda',
        q: { id: 'l15-q1', kind: 'vf', q: '$\\tens A\\cdot\\tens B=\\operatorname{tr}(\\tens A\\tens B)$.', answer: false, why: 'Manca la trasposta: $\\tens A\\cdot\\tens B=\\operatorname{tr}(\\tens A\\tens B^T)=\\sum_{ij}A_{ij}B_{ij}$ (Def 1.6.2).' },
      },
      {
        id: 'l15-9',
        kind: 'riassunto',
        md: `**In una frase:** traccia = somma della diagonale; $\\tens A\\cdot\\tens B=\\operatorname{tr}(\\tens A\\tens B^T)$; simmetrici e antisimmetrici sono ortogonali, quindi $\\mathrm{Lin}=\\mathrm{Sym}\\oplus\\mathrm{Skw}$.

- $\\operatorname{tr}(\\vet a\\otimes\\vet b)=\\vet a\\cdot\\vet b$, $\\operatorname{tr}\\tens W=0$.
- $\\tens A\\cdot\\tens I=\\operatorname{tr}\\tens A$, $\\tens A\\cdot(\\vet a\\otimes\\vet b)=\\tens A\\vet b\\cdot\\vet a$.`,
        orale: ['Dimostrare che Sym e Skw sono ortogonali ($\\tens E\\cdot\\tens W=0$). (domanda 8)'],
      },
    ],
  },

  // ================================================================== c1.6
  {
    concept: 'c1.6',
    title: 'Tensori del IV ordine',
    minutes: 13,
    source: D(1, '1.7', 'Def 1.7.1–1.7.7', '9–11'),
    visual: SVG('simmetrie4'),
    steps: [
      {
        id: 'l16-1',
        kind: 'spiega',
        title: 'Un tensore che agisce sui tensori',
        md: `**Def 1.7.1.** Un tensore del IV ordine è una trasformazione lineare di $\\mathrm{Lin}$ in $\\mathrm{Lin}$: prende un tensore del II ordine e ne restituisce un altro.

Le sue $3^4=81$ componenti si costruiscono con le diadi dei versori:

$$\\mathbb A_{ijhk}:=[\\mathbb A(\\hat e_h\\otimes\\hat e_k)]\\cdot(\\hat e_i\\otimes\\hat e_j),\\qquad (\\mathbb A\\tens A)_{ij}=\\textstyle\\sum_{h,k}\\mathbb A_{ijhk}A_{hk}.$$

Perché ci interessa: nel Cap. 4 il legame elastico lineare sarà $\\tens T=\\mathbb A\\tens E$, con $\\mathbb A$ tensore elastico.`,
      },
      {
        id: 'l16-2',
        kind: 'spiega',
        title: 'Trasposto e simmetrie',
        md: `**Def 1.7.2.** Il trasposto scambia la prima coppia di indici con la seconda: $\\mathbb A^T_{ijhk}=\\mathbb A_{hkij}$.

Con quattro indici ci sono più simmetrie:

- **maggiore** (Def 1.7.3): $\\mathbb A=\\mathbb A^T$, cioè $\\mathbb A_{ijhk}=\\mathbb A_{hkij}$;
- **prima minore** (Def 1.7.4): $\\mathbb A\\tens A$ è sempre simmetrico; $\\mathbb A_{ijhk}=\\mathbb A_{jihk}$;
- **seconda minore** (Def 1.7.5): $\\mathbb A$ vede solo la parte simmetrica dell'argomento e annulla gli antisimmetrici, $\\mathbb A\\tens W=\\tens O$; $\\mathbb A_{ijhk}=\\mathbb A_{ijkh}$.`,
      },
      {
        id: 'l16-3',
        kind: 'prova',
        title: 'Conta le componenti',
        md: 'Nel diagramma le 81 componenti sono in una griglia 9 × 9: righe = coppia $(ij)$, colonne = coppia $(hk)$. Le componenti costrette a valere uguale hanno lo stesso colore.',
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
        md: `Con le due simmetrie minori la coppia $(ij)$ e la coppia $(hk)$ possono assumere solo **6** valori distinti ($11,22,33,23,13,12$): $\\mathbb A$ si rappresenta con una matrice $6\\times6$, cioè ${NUMERI_M1.count.minori}$ componenti.

La simmetria maggiore rende quella matrice simmetrica: $6$ sulla diagonale più $15$ sopra, $\\frac{6\\cdot7}{2}=${NUMERI_M1.count.tutte3}$.

(I numeri ${NUMERI_M1.count.tutte}$, ${NUMERI_M1.count.minori}$, ${NUMERI_M1.count.tutte3}$ li conta anche il motore dell'app, raggruppando le 81 componenti: è una verifica indipendente.)`,
        values: { n81: NUMERI_M1.count.tutte, n36: NUMERI_M1.count.minori, n21: NUMERI_M1.count.tutte3 },
      },
      {
        id: 'l16-5',
        kind: 'derivazione',
        title: 'Definita positività ⇒ invertibilità',
        md: '**Def 1.7.6:** $\\mathbb A\\in\\mathrm{Pos}^+$ se $\\mathbb A\\tens A\\cdot\\tens A>0$ per ogni $\\tens A\\neq\\tens O$. **Def 1.7.7:** invertibile se esiste $\\mathbb A^{-1}$ con $\\mathbb A\\mathbb A^{-1}=\\mathbb A^{-1}\\mathbb A=\\mathbb I$.',
        source: D(1, '1.7.4', 'Def 1.7.6–1.7.7, Attenzione', 11),
        der: {
          lines: [
            { tex: '\\mathbb A\\in\\mathrm{Pos}^+,\\quad \\mathbb A\\tens A=\\tens O', why: 'Prendiamo un tensore $\\tens A$ nel nucleo di $\\mathbb A$.' },
            {
              tex: '\\Rightarrow\\ \\mathbb A\\tens A\\cdot\\tens A=0',
              why: 'Il prodotto scalare di $\\tens O$ con qualunque tensore è nullo.',
              ask: { q: 'Che cosa ci dice $\\mathbb A\\tens A\\cdot\\tens A=0$, sapendo che $\\mathbb A\\in\\mathrm{Pos}^+$?', options: ['che $\\tens A=\\tens O$', 'niente', 'che $\\mathbb A=\\mathbb O$', 'che $\\tens A$ è antisimmetrico'], correct: 0, why: 'Per un definito positivo $\\mathbb A\\tens A\\cdot\\tens A>0$ per ogni $\\tens A\\neq\\tens O$: l\'unico che dà 0 è $\\tens O$.' },
            },
            { tex: '\\Rightarrow\\ \\tens A=\\tens O:\\ \\text{nucleo banale, }\\mathbb A\\text{ invertibile}', why: 'La definita positività è **sufficiente** per l\'invertibilità.', eq: 'Def 1.7.6' },
            { tex: '-\\mathbb I:\\ \\text{invertibile, ma }-\\mathbb I\\tens A\\cdot\\tens A=-\\|\\tens A\\|^2<0', why: 'Ma **non è necessaria**: $-\\mathbb I$ è invertibile (è inverso di sé stesso) e non è definito positivo.' },
          ],
        },
      },
      {
        id: 'l16-6',
        kind: 'domanda',
        q: { id: 'l16-q1', kind: 'vf', q: 'Se un tensore del IV ordine è invertibile, allora è definito positivo.', answer: false, why: 'È il contrario: $\\mathrm{Pos}^+\\Rightarrow$ invertibile. Controesempio: $-\\mathbb I$.' },
      },
      {
        id: 'l16-7',
        kind: 'riassunto',
        md: `**In una frase:** un tensore del IV ordine trasforma tensori in tensori; le simmetrie minori lo riducono a una matrice $6\\times6$ (36 componenti), la maggiore la rende simmetrica (21); la definita positività garantisce l'invertibilità, non il viceversa.`,
        orale: ['Simmetrie dei tensori del IV ordine: definizioni, significato e conteggio 81 / 36 / 21. (domanda 9)', "Definita positività e invertibilità di un tensore del IV ordine: quale implica l'altra? (domanda 10)"],
      },
    ],
  },

  // ================================================================== c1.7
  {
    concept: 'c1.7',
    title: 'Gradiente, divergenza e teorema della divergenza',
    minutes: 16,
    source: D(1, '1.8', 'Def 1.8.1–1.8.6, Teo 1.8.4', '11–13'),
    visual: SVG('divergenza'),
    steps: [
      {
        id: 'l17-1',
        kind: 'spiega',
        title: 'Campi e ordine',
        md: `Ora i vettori e i tensori cambiano da punto a punto: sono **campi** $\\vet u(X)$, $\\tens A(X)$ in un dominio regolare $D$.

Regola da ricordare (§1.8): il **gradiente alza** di uno l'ordine, la **divergenza lo abbassa** di uno, il **rotore lo lascia** invariato.

**Def 1.8.1.** $(\\nabla\\vet u)_{ij}:=\\dfrac{\\partial u_i}{\\partial x_j}$: nella matrice la riga è la componente, la colonna la variabile di derivazione.

**Def 1.8.2.** $\\operatorname{div}\\vet u:=\\operatorname{tr}\\nabla\\vet u=\\dfrac{\\partial u_1}{\\partial x_1}+\\dfrac{\\partial u_2}{\\partial x_2}+\\dfrac{\\partial u_3}{\\partial x_3}$.`,
      },
      {
        id: 'l17-2',
        kind: 'spiega',
        title: 'Divergenza di un campo tensoriale',
        md: `**Def 1.8.3.** Non la si definisce «per indici», ma attraverso quella di un vettore: per ogni vettore fisso $\\vet a$

$$\\vet a\\cdot\\operatorname{div}\\tens A:=\\operatorname{div}(\\tens A^T\\vet a).$$

È una definizione **intrinseca**: non dipende dal riferimento. Ora ne ricaviamo le componenti.`,
      },
      {
        id: 'l17-3',
        kind: 'derivazione',
        title: 'Le componenti della divergenza di un tensore',
        source: D(1, '1.8.2', 'Def 1.8.3', 12),
        der: {
          sample: fieldSample,
          lines: [
            {
              tex: '\\vet a\\cdot\\operatorname{div}\\tens A=\\operatorname{div}(\\tens A^T\\vet a)',
              why: 'Partiamo dalla definizione. (Il controllo numerico di questa riga calcola $\\operatorname{div}(\\tens A^T\\vet a)$ con differenze finite, per una strada indipendente.)',
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
              why: 'Con $\\vet a$ costante, $(\\tens A^T\\vet a)_j=\\sum_iA_{ij}a_i$; la divergenza somma le derivate delle componenti.',
              ask: { q: 'Quanto vale $(\\tens A^T\\vet a)_j$?', options: ['$\\sum_iA_{ij}a_i$', '$\\sum_iA_{ji}a_i$', '$A_{jj}a_j$', '$\\sum_iA_{ij}a_j$'], correct: 0, why: '$(\\tens A^T)_{ji}=A_{ij}$, quindi $(\\tens A^T\\vet a)_j=\\sum_iA_{ij}a_i$.' },
              val: (v) => {
                const a = vec(v, 'a'), x = vec(v, 'x');
                let s = 0;
                for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++) s += dA(v, x, 3 * i + j, j) * a[i];
                return s;
              },
            },
            {
              tex: '=\\textstyle\\sum_i a_i\\sum_j\\partial_jA_{ij}',
              why: '$\\vet a$ è costante: esce dalle derivate; si scambiano le somme.',
              val: (v) => {
                const a = vec(v, 'a'), x = vec(v, 'x');
                return [0, 1, 2].reduce((s, i) => s + a[i] * [0, 1, 2].reduce((t, j) => t + dA(v, x, 3 * i + j, j), 0), 0);
              },
            },
            { tex: '\\Rightarrow\\ (\\operatorname{div}\\tens A)_i=\\textstyle\\sum_j\\dfrac{\\partial A_{ij}}{\\partial x_j}', why: 'Confrontando con $\\vet a\\cdot\\operatorname{div}\\tens A=\\sum_ia_i(\\operatorname{div}\\tens A)_i$ per ogni $\\vet a$: la divergenza si fa **per righe**.', eq: 'Def 1.8.3' },
          ],
        },
      },
      {
        id: 'l17-4',
        kind: 'spiega',
        title: 'Il teorema della divergenza',
        md: `**Teo 1.8.4.** Sia $D$ un dominio regolare con frontiera $\\partial D$ e normale **uscente** $\\hat n$. Per un campo vettoriale e per uno tensoriale:

$$\\int_{\\partial D}\\vet u\\cdot\\hat n\\,dA=\\int_D\\operatorname{div}\\vet u\\,dV,\\qquad \\int_{\\partial D}\\tens A\\hat n\\,dA=\\int_D\\operatorname{div}\\tens A\\,dV.$$

Trasforma integrali di superficie in integrali di volume: il **flusso** attraverso la superficie chiusa è l'integrale della divergenza nel volume. La versione tensoriale si ricava da quella vettoriale applicandola a $\\tens A^T\\vet a$ con $\\vet a$ fisso arbitrario.

Nel diagramma un campo piano su un quadrato. Il campo non dipende da $z$ e non ha componente $z$: sul cubo il flusso dalle facce $z=$ cost. è nullo e il teorema si legge sul quadrato.`,
      },
      {
        id: 'l17-5',
        kind: 'prova',
        title: 'Flusso e divergenza',
        md: 'Sul contorno il flusso di ogni lato (rosso uscente, blu entrante); sullo sfondo la divergenza.',
        tasks: [
          'Sorgente $\\vet u=(x,y)$: divergenza 2 ovunque; il flusso totale è 2, come l\'integrale della divergenza.',
          'Rotazione rigida $\\vet u=(-y,x)$: divergenza nulla, flusso totale nullo anche se il campo non è nullo.',
          'Traslazione: ciò che entra da un lato esce dall\'altro.',
          'Campo misto: la divergenza cambia da punto a punto, ma i due numeri in fondo coincidono sempre.',
        ],
        visual: SVG('divergenza'),
      },
      {
        id: 'l17-6',
        kind: 'spiega',
        title: 'Il rotore',
        md: `**Def 1.8.5.** Il rotore di $\\vet u$ è l'unico campo vettoriale tale che

$$\\operatorname{rot}\\vet u\\wedge\\vet a=(\\nabla\\vet u-\\nabla\\vet u^T)\\vet a\\quad\\forall\\vet a.$$

In altre parole è il **vettore assiale** di $\\nabla\\vet u-\\nabla\\vet u^T=2\\operatorname{skw}\\nabla\\vet u$. La dispensa a questo punto rimanda a «§3.4»; il vettore assiale è in §1.3.4 (vedi NF-01).

**Def 1.8.6.** Il rotore di un campo tensoriale si definisce, come la divergenza, attraverso il campo vettoriale $\\tens A^T\\vet a$.`,
      },
      {
        id: 'l17-7',
        kind: 'domanda',
        q: { id: 'l17-q1', kind: 'scelta', q: 'Un campo ha divergenza nulla in tutto il dominio. Che cosa puoi dire del flusso uscente dalla frontiera?', options: ['È nullo', 'È positivo', 'Dipende dalla forma del dominio', 'Il campo è nullo'], correct: 0, why: 'Per il teorema della divergenza il flusso è l\'integrale della divergenza: zero. Il campo però non è necessariamente nullo (rotazione rigida).' },
      },
      {
        id: 'l17-8',
        kind: 'riassunto',
        md: `**In una frase:** il gradiente alza l'ordine e la divergenza lo abbassa; la divergenza di un tensore si definisce con $\\vet a\\cdot\\operatorname{div}\\tens A=\\operatorname{div}(\\tens A^T\\vet a)$ e in componenti si fa per righe; il teorema della divergenza scambia flusso e integrale di volume.

Servirà subito: nel Cap. 3 trasforma l'equilibrio di una parte del corpo nelle equazioni indefinite $\\operatorname{div}\\tens T+\\vet b=\\vet 0$.`,
        orale: ['Divergenza di un campo tensoriale: definizione intrinseca e derivazione delle componenti; teorema della divergenza. (domanda 11)'],
      },
    ],
  },
];
