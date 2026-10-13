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
    minutes: 10,
    source: D(2, '2.1', 'Def 2.1.1–2.1.2', '15–16'),
    visual: DEF({ mode: 'rappresentazione', preset: 'generico' }),
    steps: [
      {
        id: 'l21-1',
        kind: 'spiega',
        title: 'Che cosa studiamo',
        md: `Un corpo solido può cambiare forma per tante cause. L'**analisi della deformazione** studia questo cambiamento da un punto di vista **puramente cinematico**, cioè geometrico: descrive come il corpo si è trasformato, senza chiedersi perché (§2.1.2).

All'oggetto reale (la scocca di un'auto) si associa un simulacro nello spazio euclideo: il **corpo materiale** $\\mathcal B$, una regione regolare e limitata. Regolare vuol dire che la frontiera $\\partial\\mathcal B$ è fatta di superfici almeno $C^1$ (Def 2.1.1).`,
      },
      {
        id: 'l21-2',
        kind: 'spiega',
        title: 'Perché la massa non entra',
        md: `I punti di $\\mathcal B$ sono **punti materiali**: rispetto ai punti geometrici hanno massa. Nel corso però la massa non conta, perché lo studio fa astrazione dal tempo.

Ogni fenomeno reale si svolge in un tempo, e accelerazioni rapide generano forze d'inerzia. Se il fenomeno è molto lento (passeggeri che salgono piano sull'auto) l'accelerazione tende a zero e le forze d'inerzia diventano trascurabili. Lo studio statico è quel limite.`,
      },
      {
        id: 'l21-3',
        kind: 'spiega',
        title: 'Due configurazioni, due punti di vista',
        md: `La regione occupata dal corpo si chiama **configurazione**, perché può cambiare. Se ne sceglie una come **riferimento**, $\\mathcal B$, con punto generico $X$; la generica altra è la configurazione **attuale** $f(\\mathcal B)$, con punto generico $x$.

- **Lagrangiano**: si segue il singolo punto $X$ e si guarda dove va. È il punto di vista del corso.
- **Euleriano**: si parte dalla configurazione attuale e si risale all'origine del punto $x$. Serve anche nei solidi: la spinta del vento su una vela dipende dalla sua forma deformata.

Le differenze tra i due si vedono solo per grandi spostamenti e deformazioni; noi lavoreremo con quelli piccoli.`,
      },
      {
        id: 'l21-4',
        kind: 'spiega',
        title: 'Deformazione e spostamento',
        md: `**Def 2.1.2.** La **deformazione** è la mappa $f:\\mathcal B\\to\\mathcal E$, $x=f(X)$: una funzione vettoriale di variabile vettoriale. Lo **spostamento** è

$$\\vet u(X)=x-X=f(X)-X.$$

Sono entrambi campi vettoriali, ma diversi: $f$ trasforma un corpo in un altro, $\\vet u$ è il vettore che porta il singolo $X$ in $x$. In componenti $u_i=f_i(X_1,X_2,X_3)-X_i$.

Nel modello a destra (che riprenderemo nella formula di rappresentazione) vedi due punti $X$ e $Y$ e i loro spostamenti.`,
      },
      {
        id: 'l21-5',
        kind: 'domanda',
        q: { id: 'l21-q1', kind: 'scelta', q: 'Quale affermazione è corretta?', options: ['$f$ è la mappa che trasforma il corpo; $\\vet u$ è il vettore che porta il singolo punto', '$f$ e $\\vet u$ sono la stessa cosa', '$\\vet u$ è uno scalare', 'Lo spostamento dipende dalle cause della deformazione'], correct: 0, why: '§2.1.3: entrambi campi vettoriali; la deformazione è la mappa, lo spostamento il vettore $x-X$.' },
      },
      {
        id: 'l21-6',
        kind: 'riassunto',
        md: `**In una frase:** il corpo materiale passa dalla configurazione di riferimento $\\mathcal B$ a quella attuale $f(\\mathcal B)$; ogni punto si sposta di $\\vet u=f(X)-X$.

- Studio puramente cinematico e statico (forze d'inerzia trascurabili).
- Lagrangiano (si segue $X$) contro euleriano (si risale da $x$).`,
        orale: ['Definire corpo materiale, configurazioni, deformazione e spostamento; punto di vista lagrangiano ed euleriano. (dispensa, domanda 1)'],
      },
    ],
  },
  // ================================================================== c2.2
  {
    concept: 'c2.2',
    title: 'Deformazioni plausibili, F e H',
    minutes: 15,
    source: D(2, '2.2–2.3', 'Def 2.2.1–2.2.4, Teo 2.3.2, Teo 2.3.4', '17–19'),
    visual: DEF({ mode: 'intorno', presets: ['allungamento', 'taglio', 'rotazione', 'generico'], controls: ['preset', 'amp'] }),
    steps: [
      {
        id: 'l22-1',
        kind: 'spiega',
        title: 'Non tutte le funzioni vanno bene',
        md: `Ammettere funzioni $f$ molto generali descriverebbe fenomeni molto generali, ma con grandi difficoltà. Si chiedono quindi dei **requisiti di plausibilità fisica** (§2.2).

**1) Biettività** (Def 2.2.1). Ogni $X$ ha una sola immagine e ogni $x$ viene da un solo $X$. Esclude la **compenetrazione** e l'**autocontatto** (due punti distinti finiscono nello stesso posto) e la **frattura** (un punto si sdoppia).

**2) Bicontinuità e regolarità** (Def 2.2.2). $f$ e $f^{-1}$ continue, $f$ con derivata prima continua: punti vicini restano vicini, e le fibre diventano curve senza spigoli.`,
      },
      {
        id: 'l22-2',
        kind: 'spiega',
        title: 'Il gradiente di deformazione',
        md: `**Def 2.2.3.** $\\tens F(X):=\\nabla f(X)$, con $F_{ij}=\\partial f_i/\\partial X_j$.

**3) Conservazione dell'orientazione** (Def 2.2.4): $\\det\\tens F>0$ in ogni punto.

Ricordando la definizione di determinante (Def 1.4.1), $\\det\\tens F$ è il rapporto tra il prodotto misto di $\\tens F\\hat e_1,\\tens F\\hat e_2,\\tens F\\hat e_3$ e quello dei versori. Se è positivo la terna trasformata resta destrorsa, anche se non più ortogonale.

Vedremo che $\\det\\tens F=dv/dV$. Allora $\\det\\tens F=0$ è un volume finito che si annulla (**implosione**), $\\det\\tens F\\to+\\infty$ un volume nullo che diventa finito (**esplosione**). Partendo da 1 nella configurazione di riferimento, $\\det\\tens F$ non può mai attraversare lo zero (figura di p. 18).`,
      },
      {
        id: 'l22-3',
        kind: 'derivazione',
        title: 'Identità cinematica fondamentale',
        md: 'Prendiamo una componente $(i,j)$ del gradiente di spostamento e usiamo $\\vet u=f(X)-X$. Il campione usa una mappa $f$ non lineare qualunque.',
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
              why: 'Definizione del gradiente di spostamento (Def 2.3.1). Il valore è calcolato dalla derivata della funzione $u_i=f_i-X_i$.',
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
              why: 'La derivata della differenza è la differenza delle derivate.',
              val: (v) => T.at(Fmap(v, vec(v, 'X')), v.i, v.j) - (v.i === v.j ? 1 : 0),
            },
            {
              tex: '=F_{ij}-\\delta_{ij}',
              why: 'Il primo termine è $F_{ij}$; il gradiente della mappa $X\\mapsto X$ è l\'identità, cioè $\\delta_{ij}$.',
              ask: { q: 'Quanto vale $\\partial X_i/\\partial X_j$?', options: ['$\\delta_{ij}$', '$1$ sempre', '$0$ sempre', '$X_j$'], correct: 0, why: 'Vale 1 se $i=j$ e 0 altrimenti: sono le componenti di $\\tens I$.' },
              val: (v) => T.at(Fmap(v, vec(v, 'X')), v.i, v.j) - (v.i === v.j ? 1 : 0),
            },
            { tex: '\\Rightarrow\\ \\tens F=\\tens I+\\tens H', why: 'Vale per ogni coppia $(i,j)$: è l\'identità cinematica fondamentale.', eq: 'Teo 2.3.2' },
          ],
        },
      },
      {
        id: 'l22-4',
        kind: 'prova',
        title: 'Guarda F al lavoro',
        md: 'Il cubetto azzurro è $\\tens F=\\tens I+k\\tens H$ applicato al cubetto tratteggiato (spostamenti amplificati di $k$).',
        tasks: [
          'Scegli «allungamento lungo x»: il cubetto si allunga solo lungo x.',
          'Scegli «rotazione rigida infinitesima»: il cubetto ruota senza cambiare forma (a meno dell\'amplificazione, che rende il moto non esattamente rigido).',
          'Scegli «taglio semplice»: le facce verticali si inclinano; l\'angolo retto tra x e y si chiude.',
        ],
        visual: DEF({ mode: 'intorno', presets: ['allungamento', 'rotazione', 'taglio', 'generico'], controls: ['preset', 'amp'], preset: 'allungamento' }),
      },
      {
        id: 'l22-5',
        kind: 'spiega',
        title: 'Tipi speciali e deformazioni rigide',
        md: `Tipi speciali (§2.3.1): **omogenee** ($\\tens F$ costante), **traslazioni** ($\\vet u$ costante), **rotazioni** ($\\tens F=\\tens R\\in\\mathrm{Rot}$ fisso, $f(X)=X_0+\\tens R(X-X_0)$). Per $\\varphi\\ll1$, dalla formula di Eulero, $\\tens R\\vet v\\simeq\\vet v+\\varphi\\hat e\\wedge\\vet v$.

**Rigida** (Def 2.3.3): conserva la distanza tra i punti, $|f(X)-f(Y)|=|X-Y|$. Il Teo 2.3.4 (la dispensa lo enuncia senza dimostrazione) dice che $f$ è rigida se e solo se

$$f(X)=f(X_0)+\\tens Q(X-X_0),\\qquad\\tens Q\\in\\mathrm{Orth}.$$

Aggiungendo e togliendo $X_0$ si legge una **rototraslazione**: traslazione di $X_0$ più rotazione (o riflessione) attorno a $X_0$. Le riflessioni ($\\det\\tens Q=-1$) sono rigide ma escluse da $\\det\\tens F>0$.`,
      },
      {
        id: 'l22-6',
        kind: 'domanda',
        q: { id: 'l22-q1', kind: 'vf', q: 'Una traslazione ha $\\tens H=\\tens O$ e quindi $\\tens F=\\tens I$.', answer: true, why: 'Con $\\vet u$ costante il gradiente è nullo; per l\'identità cinematica $\\tens F=\\tens I$.' },
      },
      {
        id: 'l22-7',
        kind: 'riassunto',
        md: `**In una frase:** una deformazione plausibile è biettiva, bicontinua e regolare, e ha $\\det\\tens F>0$; il suo gradiente è $\\tens F=\\tens I+\\tens H$.

- Biettività: niente compenetrazione, autocontatto, frattura.
- $\\det\\tens F>0$: niente implosione, esplosione, riflessioni.
- Rigide = rototraslazioni con $\\tens Q$ ortogonale (Teo 2.3.4).`,
        orale: ['Requisiti di plausibilità fisica: quali fenomeni escludono e perché; significato di $\\det\\tens F>0$. (dispensa, domanda 2)', 'Identità cinematica fondamentale; deformazioni omogenee, traslazioni, rotazioni, deformazioni rigide. (dispensa, domanda 3)'],
      },
    ],
  },
  // ================================================================== c2.3
  {
    concept: 'c2.3',
    title: 'Lo studio locale: dx = F dX',
    minutes: 10,
    source: D(2, '2.4', 'eq. (2.1)', 20),
    visual: DEF({ mode: 'intorno', presets: ['taglio', 'generico'], controls: ['preset', 'amp', 'alpha'], alpha: 30 }),
    steps: [
      {
        id: 'l23-1',
        kind: 'spiega',
        title: 'Dalla curva alla tangente',
        md: `Lo studio locale trasforma uno studio analitico, fatto di funzioni in generale non lineari, in uno **algebrico**.

Nel caso scalare, data la curva $x=f(X)$, per un incremento piccolo $dX$ attorno a $X_0$ si approssima la curva con la tangente: $dx\\simeq f'(X_0)\\,dX$. La derivata prima dice quanto rapidamente varia la funzione vicino a $X_0$. Nel caso vettoriale questo ruolo è del gradiente.`,
      },
      {
        id: 'l23-2',
        kind: 'derivazione',
        title: 'Da Taylor alla deformazione omogenea tangente',
        md: 'Fibra per $X$ in direzione $\\hat n$, un suo punto $Y$ vicino: $d\\vet X=Y-X$. Per verificare i passaggi uso una $f$ affine, per cui l\'infinitesimo trascurato è esattamente nullo.',
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
              why: 'Il vettore $d\\vet x=y-x$ unisce le immagini dei due punti.',
              val: (v) => {
                const fa = (P: T.Vec) => T.addv(vec(v, 'c'), T.apply(mat(v, 'F'), P));
                const X = vec(v, 'X');
                return fa(T.addv(X, vec(v, 'd')))[v.k] - fa(X)[v.k];
              },
            },
            {
              tex: '=\\big[\\tens F(X)(Y-X)\\big]_k+o(|Y-X|)',
              why: 'Sviluppo di Taylor con origine in $X$: il gradiente $\\tens F(X)$ fa la parte della derivata.',
              val: (v) => T.apply(mat(v, 'F'), vec(v, 'd'))[v.k],
            },
            {
              tex: '\\simeq\\big[\\tens F\\,d\\vet X\\big]_k',
              why: 'Si trascura una volta per tutte $o(|Y-X|)$ in un intorno sufficientemente piccolo; $\\tens F$ è quello del centro.',
              ask: { q: 'Quale $\\tens F$ si usa per tutti i punti $Y$ dell\'intorno?', options: ['Quello calcolato nel centro $X$', 'Quello calcolato in ciascun $Y$', 'La sua media sull\'intorno', 'L\'identità'], correct: 0, why: 'È ciò che rende la deformazione «omogenea»: $\\tens F=\\tens F(X)$ resta costante nell\'intorno.' },
              val: (v) => T.apply(mat(v, 'F'), vec(v, 'd'))[v.k],
              eq: 'eq. (2.1)',
            },
          ],
        },
      },
      {
        id: 'l23-3',
        kind: 'spiega',
        title: 'Perché «omogenea» e perché «tangente»',
        md: `$$d\\vet x=\\tens F\\,d\\vet X\\qquad(2.1)$$

**Omogenea**, perché $\\tens F$, calcolato nel centro dell'intorno, resta costante qualunque sia il punto dell'intorno. **Tangente**, per analogia con l'approssimazione della curva con la sua tangente.

Il punto chiave per l'orale (riquadro di p. 20): limitandosi a un intorno, la deformazione di **tutti** i suoi punti si esprime con la deformazione del centro, tramite un'operazione algebrica (un tensore applicato a un vettore). Serve la regolarità di $f$: senza bicontinuità non si potrebbe dire che $f(Y)$ stia nell'intorno di $f(X)$.`,
      },
      {
        id: 'l23-4',
        kind: 'prova',
        title: 'Ruota la fibra',
        md: 'Le frecce rossa e verde sono le fibre $\\hat n$ e $\\hat m$ trasformate da $\\tens F$. Sotto: i parametri di misura, che vedremo nella prossima lezione.',
        tasks: ['Con il taglio, ruota la fibra $\\hat n$: per certi angoli si allunga, per altri si accorcia.', 'Cerca l\'angolo per cui la fibra non cambia lunghezza: $\\varepsilon_n$ passa per zero.'],
        visual: DEF({ mode: 'intorno', preset: 'taglio', presets: ['taglio', 'generico'], controls: ['preset', 'amp', 'alpha'], alpha: 30 }),
      },
      {
        id: 'l23-5',
        kind: 'riassunto',
        md: `**In una frase:** in un intorno piccolo ogni fibra si trasforma con lo stesso tensore, quello del centro: $d\\vet x=\\tens F\\,d\\vet X$.

- Taylor arrestato al primo ordine, $o(|Y-X|)$ trascurato.
- Omogenea ($\\tens F$ costante nell'intorno), tangente (come la retta tangente).`,
        orale: ['Studio locale: dallo sviluppo di Taylor alla deformazione omogenea tangente. (dispensa, domanda 4)'],
      },
    ],
  },
  // ================================================================== c2.4
  {
    concept: 'c2.4',
    title: 'Quanto si deforma: i parametri di misura',
    minutes: 20,
    source: D(2, '2.5', 'Def 2.5.1–2.5.8, Prop 2.5.2–2.5.9', '20–23'),
    visual: DEF({ mode: 'intorno', presets: ['taglio', 'allungamento', 'isocora', 'generico'], controls: ['preset', 'amp', 'alpha'] }),
    steps: [
      {
        id: 'l24-1',
        kind: 'spiega',
        title: 'Variazioni specifiche',
        md: `All'ingegnere non basta sapere che il corpo si è trasformato: vuole sapere **quanto** è cambiato un volume, se una fibra si è allungata, se due fibre ortogonali non lo sono più. I **parametri di misura** sono numeri che lo dicono, sempre in un punto (nell'intorno di $X$).

Sono sempre **variazioni specifiche**: due elastici identici di 4 m e di 1 m, caricati con lo stesso peso, si allungano di quantità diverse ma con lo stesso allungamento specifico. Ai fini della sollecitazione conta quello.`,
      },
      {
        id: 'l24-2',
        kind: 'derivazione',
        title: 'La dilatazione lineare in funzione di F',
        md: '**Def 2.5.1:** $\\varepsilon_n:=(dl-dL)/dL$. Calcoliamo $dl^2$ con $d\\vet x=\\tens F\\,d\\vet X$ e $d\\vet X=dL\\,\\hat n$.',
        source: D(2, '2.5.1', 'Prop 2.5.2', 21),
        der: {
          sample: (r) => sampleF(r),
          lines: [
            { tex: 'dl^2=d\\vet x\\cdot d\\vet x=\\tens F d\\vet X\\cdot\\tens F d\\vet X', why: 'Il quadrato della lunghezza è il prodotto scalare del vettore per sé stesso.', val: (v) => { const dx = T.apply(mat(v, 'F'), T.scalev(vec(v, 'n'), v.dL)); return T.dotv(dx, dx); } },
            {
              tex: '=\\tens F^T\\tens F d\\vet X\\cdot d\\vet X',
              why: 'Definizione di trasposto: $\\tens A\\vet u\\cdot\\vet v=\\vet u\\cdot\\tens A^T\\vet v$, con $\\tens A=\\tens F$.',
              ask: { q: 'Quale proprietà sposta $\\tens F$ da un lato all\'altro del prodotto scalare?', options: ['La definizione di trasposto', 'La simmetria di $\\tens F$', 'Il teorema spettrale', 'La linearità del determinante'], correct: 0, why: 'Def 1.3.1: $(\\tens A\\vet u)\\cdot\\vet v=(\\tens A^T\\vet v)\\cdot\\vet u$. $\\tens F$ non è simmetrico in generale.' },
              val: (v) => { const F = mat(v, 'F'); const dX = T.scalev(vec(v, 'n'), v.dL); return T.dotv(T.apply(T.mul(T.transpose(F), F), dX), dX); },
            },
            { tex: '=(\\tens F^T\\tens F\\hat n\\cdot\\hat n)\\,dL^2', why: 'Si porta fuori $dL$ da entrambi i fattori.', val: (v) => { const F = mat(v, 'F'); const n = vec(v, 'n'); return T.dotv(T.apply(T.mul(T.transpose(F), F), n), n) * v.dL * v.dL; } },
            { tex: '\\Rightarrow\\ \\varepsilon_n=\\dfrac{dl}{dL}-1=\\sqrt{\\tens F^T\\tens F\\hat n\\cdot\\hat n}-1', why: 'Si estrae la radice e si sostituisce nella definizione.', eq: 'Prop 2.5.2' },
          ],
          checks: [
            { what: 'ε_n dal motore = |F n̂| − 1', f: (v) => [finiteMeasures(mat(v, 'F'), vec(v, 'n'), vec(v, 'm')).epsN, T.norm(T.apply(mat(v, 'F'), vec(v, 'n'))) - 1] },
            { what: 'ε_n = √(2Dn·n + 1) − 1', f: (v) => { const D2 = finiteD(mat(v, 'F')); const n = vec(v, 'n'); return [Math.sqrt(2 * T.dotv(T.apply(D2, n), n) + 1) - 1, T.norm(T.apply(mat(v, 'F'), n)) - 1]; } },
          ],
        },
      },
      {
        id: 'l24-3',
        kind: 'spiega',
        title: 'Campo di variazione e tensore D',
        md: `L'espressione **non è lineare** in $\\tens F$: c'è la radice e $\\tens F$ compare moltiplicato per sé stesso, come un $x^2$.

- $\\varepsilon_n>0$: dilatazione; al limite $dl\\to\\infty$, $\\varepsilon_n\\to+\\infty$.
- $\\varepsilon_n<0$: contrazione; al limite la fibra degenera in un punto, $\\varepsilon_n\\to-1$.

Quindi $\\varepsilon_n\\in\\,]-1,+\\infty[$, estremi esclusi (niente annichilimento della materia, $\\det\\tens F>0$).

Si preferisce lavorare con il **tensore di deformazione finita** (Green–Saint-Venant, Def 2.5.3):

$$\\tens D:=\\tfrac12(\\tens F^T\\tens F-\\tens I)\\in\\mathrm{Sym},$$

simmetrico e nullo in assenza di deformazione. Da $\\tens F^T\\tens F=2\\tens D+\\tens I$: $\\varepsilon_n=\\sqrt{2\\tens D\\hat n\\cdot\\hat n+1}-1$.`,
      },
      {
        id: 'l24-4',
        kind: 'derivazione',
        title: 'Lo scorrimento angolare',
        md: '**Def 2.5.4:** $\\gamma_{n,m}:=\\pi/2-\\theta$, con $\\theta$ l\'angolo tra le fibre $\\hat n\\perp\\hat m$ dopo la deformazione.',
        source: D(2, '2.5.3', 'Prop 2.5.5', 22),
        der: {
          sample: (r) => sampleF(r),
          lines: [
            { tex: '\\sin\\gamma_{n,m}=\\sin\\big(\\tfrac\\pi2-\\theta\\big)=\\cos\\theta', why: 'Il seno del complementare è il coseno.', val: (v) => finiteMeasures(mat(v, 'F'), vec(v, 'n'), vec(v, 'm')).sinGamma },
            { tex: '=\\dfrac{\\tens F\\hat n\\cdot\\tens F\\hat m}{|\\tens F\\hat n|\\,|\\tens F\\hat m|}', why: 'Il coseno dell\'angolo tra le fibre trasformate.', val: (v) => { const F = mat(v, 'F'); const a = T.apply(F, vec(v, 'n')); const b = T.apply(F, vec(v, 'm')); return T.dotv(a, b) / (T.norm(a) * T.norm(b)); } },
            {
              tex: '=\\dfrac{(2\\tens D+\\tens I)\\hat m\\cdot\\hat n}{(\\varepsilon_n+1)(\\varepsilon_m+1)}',
              why: 'Al numeratore $\\tens F^T\\tens F\\hat m\\cdot\\hat n$ con $\\tens F^T\\tens F=2\\tens D+\\tens I$; al denominatore $|\\tens F\\hat n|=\\varepsilon_n+1$.',
              val: (v) => { const F = mat(v, 'F'); const D2 = finiteD(F); const n = vec(v, 'n'); const m = vec(v, 'm'); const num = T.dotv(T.apply(T.add(T.scale(D2, 2), T.I3), m), n); return num / (T.norm(T.apply(F, n)) * T.norm(T.apply(F, m))); },
            },
            {
              tex: '=\\dfrac{2\\tens D\\hat m\\cdot\\hat n}{(\\varepsilon_n+1)(\\varepsilon_m+1)}',
              why: 'Il termine con $\\tens I$ dà $\\hat m\\cdot\\hat n=0$: le fibre erano ortogonali.',
              ask: { q: 'Perché sparisce $\\tens I\\hat m\\cdot\\hat n$?', options: ['Perché $\\hat m\\perp\\hat n$', 'Perché $\\tens D$ è simmetrico', 'Perché $\\det\\tens F>0$', 'Perché $\\tens I$ è sferico'], correct: 0, why: '$\\tens I\\hat m\\cdot\\hat n=\\hat m\\cdot\\hat n=0$ per ipotesi.' },
              val: (v) => { const F = mat(v, 'F'); const D2 = finiteD(F); const n = vec(v, 'n'); const m = vec(v, 'm'); return (2 * T.dotv(T.apply(D2, m), n)) / (T.norm(T.apply(F, n)) * T.norm(T.apply(F, m))); },
              eq: 'Prop 2.5.5',
            },
          ],
        },
      },
      {
        id: 'l24-5',
        kind: 'derivazione',
        title: 'La dilatazione volumica: Θ = det F − 1',
        md: '**Def 2.5.8:** $\\Theta:=(dv-dV)/dV$. Tre fibre non complanari $d\\vet X,d\\vet Y,d\\vet Z$ uscenti da $X$ individuano $dV$.',
        source: D(2, '2.5.5', 'Prop 2.5.9', 23),
        der: {
          sample: (r) => { const o = sampleF(r); putVec(o, 'p', T.randVec(r)); putVec(o, 'q', T.randVec(r)); putVec(o, 's', T.randVec(r)); return o; },
          lines: [
            { tex: '\\dfrac{dv}{dV}=\\dfrac{d\\vet x\\wedge d\\vet y\\cdot d\\vet z}{d\\vet X\\wedge d\\vet Y\\cdot d\\vet Z}', why: 'Il volume (con segno) del parallelepipedo è il prodotto misto delle fibre.', val: (v) => { const F = mat(v, 'F'); const [a, b, c] = [vec(v, 'p'), vec(v, 'q'), vec(v, 's')]; return T.dotv(T.cross(T.apply(F, a), T.apply(F, b)), T.apply(F, c)) / T.dotv(T.cross(a, b), c); } },
            {
              tex: '=\\dfrac{\\tens Fd\\vet X\\wedge\\tens Fd\\vet Y\\cdot\\tens Fd\\vet Z}{d\\vet X\\wedge d\\vet Y\\cdot d\\vet Z}=\\det\\tens F',
              why: 'Ogni fibra si trasforma con la (2.1); il rapporto è esattamente la definizione di determinante (Def 1.4.1).',
              ask: { q: 'Quale definizione chiude la dimostrazione?', options: ['Quella di determinante (rapporto di prodotti misti)', 'Quella di traccia', 'Il teorema della divergenza', 'L\'identità di Lagrange'], correct: 0, why: 'Def 1.4.1: $\\det\\tens A$ è il rapporto tra il prodotto misto dei trasformati e quello dei vettori.' },
              val: (v) => T.det(mat(v, 'F')),
              eq: 'Prop 2.5.9',
            },
          ],
        },
      },
      {
        id: 'l24-6',
        kind: 'spiega',
        title: 'Area e misure globali',
        md: `**Dilatazione superficiale** (Def 2.5.6, Prop 2.5.7). Due fibre ortogonali individuano $dS$; dopo la deformazione $ds/dS=|\\tens F\\hat n\\wedge\\tens F\\hat m|$. Con l'identità di Lagrange $|\\vet a\\wedge\\vet b|^2=|\\vet a|^2|\\vet b|^2-(\\vet a\\cdot\\vet b)^2$:

$$\\Delta S_{n,m}=\\sqrt{(2\\tens D\\hat n\\cdot\\hat n+1)(2\\tens D\\hat m\\cdot\\hat m+1)-4(\\tens D\\hat m\\cdot\\hat n)^2}-1.$$

Anche $\\Delta S$ e $\\Theta$ variano in $]-1,+\\infty[$. I parametri sono **locali**: per un oggetto finito si integra (§2.5.6), per esempio $\\Delta V_{\\mathcal B}=\\int_{\\mathcal B}\\Theta\\,dV$; per una curva $\\hat n$ è la tangente, che cambia da punto a punto.`,
      },
      {
        id: 'l24-7',
        kind: 'prova',
        title: 'Leggi i parametri',
        md: 'Nella tabella sotto il modello trovi i parametri della teoria finita (con il gradiente vero, non amplificato).',
        tasks: ['Scegli «allungamento lungo x» e fibra a 0°: $\\varepsilon_n=0{,}04$, $\\gamma=0$.', 'Scegli «isocora»: $\\Theta$ è quasi zero (zero al primo ordine).', 'Con il taglio e la fibra a 45°: la fibra si allunga e quella a 135° si accorcia.'],
        visual: DEF({ mode: 'intorno', preset: 'allungamento', presets: ['allungamento', 'isocora', 'taglio', 'generico'], controls: ['preset', 'amp', 'alpha'] }),
      },
      {
        id: 'l24-8',
        kind: 'riassunto',
        md: `**In una frase:** tutti i parametri di misura finiti si leggono su $\\tens F^T\\tens F=2\\tens D+\\tens I$; il volume su $\\det\\tens F$.

- $\\varepsilon_n=\\sqrt{2\\tens D\\hat n\\cdot\\hat n+1}-1$, non lineare.
- $\\sin\\gamma=2\\tens D\\hat m\\cdot\\hat n/[(\\varepsilon_n+1)(\\varepsilon_m+1)]$, positivo se l'angolo si chiude.
- $\\Theta=\\det\\tens F-1$; campi $]-1,+\\infty[$.`,
        orale: ['Ricavare $\\varepsilon_n$ in funzione di $\\tens F$ e di $\\tens D$; campo di variazione. (dispensa, domanda 5)', 'Dimostrare che $\\Theta=\\det\\tens F-1$. (dispensa, domanda 6)'],
      },
    ],
  },
  // ================================================================== c2.5
  {
    concept: 'c2.5',
    title: 'Piccole deformazioni e piccoli spostamenti',
    minutes: 10,
    source: D(2, '2.6.1–2.6.2', 'Def 2.6.1–2.6.2', '23–24'),
    visual: DEF({ mode: 'intorno', preset: 'rotazione', presets: ['rotazione', 'allungamento'], part: 'W', amp: 20, controls: ['preset', 'part', 'amp'] }),
    steps: [
      {
        id: 'l25-1',
        kind: 'spiega',
        title: 'Perché approssimare',
        md: `Le formule della teoria finita sono non lineari e non portano a calcoli semplici. Però i materiali da costruzione ordinari si deformano poco: le deformazioni si percepiscono solo con strumenti. Si sviluppano quindi teorie approssimate.

**Def 2.6.1 (piccole deformazioni):** $\\|\\tens H\\|\\ll1$. Si confronta con 1 perché $\\tens H$ è adimensionale (derivate di lunghezze rispetto a lunghezze). Per l'identità cinematica $\\tens F\\simeq\\tens I$: la deformazione è vicina all'assenza di deformazione. È l'ipotesi che permette di **linearizzare le deformazioni**.`,
      },
      {
        id: 'l25-2',
        kind: 'spiega',
        title: 'Piccoli spostamenti: non è la stessa cosa',
        md: `**Def 2.6.2:** $|\\vet u|\\ll1$, spostamenti piccoli rispetto alle dimensioni del corpo. Spesso si adottano insieme, ma sono diverse:

- grandi spostamenti **non** implicano grandi deformazioni: piegando un foglio, un segmento tracciato si sposta di centimetri ma resta lungo 10 cm;
- grandi deformazioni implicano grandi spostamenti (gli spostamenti integrano le deformazioni);
- piccole deformazioni e grandi spostamenti: la **vela**; piccole e piccoli: le travi comuni;
- grandi deformazioni e piccoli spostamenti: impossibile.

Nel modello a destra c'è solo una rotazione rigida: i punti lontani dall'asse si spostano molto, ma il cubetto non cambia forma.`,
      },
      {
        id: 'l25-3',
        kind: 'domanda',
        q: { id: 'l25-q1', kind: 'scelta', q: 'Una vela gonfiata dal vento è un esempio di…', options: ['piccole deformazioni e grandi spostamenti', 'grandi deformazioni e piccoli spostamenti', 'piccole deformazioni e piccoli spostamenti', 'grandi deformazioni e grandi spostamenti'], correct: 0, why: '§2.6.2: la vela si muove e si flette molto mentre le fibre del tessuto si allungano pochissimo.' },
      },
      {
        id: 'l25-4',
        kind: 'spiega',
        title: 'Equilibrio referenziale: il palo portafari',
        md: `I piccoli spostamenti non cambiano la descrizione della deformazione, ma l'**equilibrio**. Un corpo deformabile raggiunge l'equilibrio nella configurazione deformata (l'elastico che regge un secchio riempito piano piano si allunga finché non si ferma), e questa non si conosce all'inizio: il problema è **implicito**.

**Palo portafari.** Un carico $P$ con eccentricità $e$. Trascurando la deformazione il momento alla base è $M=Pe$; in realtà, detto $f$ lo spostamento della sommità, $M=P(e+f)$, e $f$ dipende a sua volta da $M$. Se $f\\ll e$, $M\\simeq Pe$.

Con spostamenti piccoli si può quindi imporre l'equilibrio nella configurazione di riferimento: **equilibrio referenziale**.`,
      },
      {
        id: 'l25-5',
        kind: 'riassunto',
        md: `**In una frase:** piccole deformazioni ⇒ linearizzazione delle deformazioni; piccoli spostamenti ⇒ linearizzazione dell'equilibrio (equilibrio referenziale).

- Le due ipotesi sono indipendenti tranne una: grandi deformazioni portano grandi spostamenti.
- Palo portafari: $M=P(e+f)\\simeq Pe$ se $f\\ll e$.`,
        orale: ['Differenza tra piccole deformazioni e piccoli spostamenti; equilibrio referenziale (esempio del palo). (dispensa, domanda 7)'],
      },
    ],
  },
  // ================================================================== c2.6
  {
    concept: 'c2.6',
    title: 'Il tensore di deformazione infinitesima',
    minutes: 20,
    source: D(2, '2.6.3–2.6.6', 'Prop 2.6.3, Def 2.6.4, Teo 2.6.5, Prop 2.6.6', '24–26'),
    visual: DEF({ mode: 'intorno', presets: ['taglio', 'rotazione', 'generico', 'isocora'], part: 'H', controls: ['preset', 'part', 'amp', 'alpha'] }),
    steps: [
      {
        id: 'l26-1',
        kind: 'spiega',
        title: 'Un procedimento formale',
        md: `Trascurare gli infinitesimi di ordine superiore è facile per uno scalare, meno per un tensore. La dispensa usa un **procedimento formale** (§2.6.3):

1. si scrive $\\tens F=\\tens I+\\epsilon\\tens H$, con $\\epsilon$ parametro di piccolezza;
2. si calcola la grandezza che interessa;
3. si trascurano i termini in $\\epsilon^2,\\epsilon^3,\\dots$;
4. si pone $\\epsilon=1$ (era stato introdotto apposta).`,
      },
      {
        id: 'l26-2',
        kind: 'derivazione',
        title: 'Linearizzazione di D',
        md: 'Applichiamo il procedimento a $\\tens D$ e guardiamo una componente $(i,j)$.',
        source: D(2, '2.6.3', 'Prop 2.6.3', 25),
        der: {
          sample: (r) => { const o: R = { i: idx(r), j: idx(r), e: 0.5 * r() }; putMat(o, 'H', T.randMat(r)); return o; },
          lines: [
            { tex: '\\tens D=\\tfrac12\\big[(\\tens I+\\epsilon\\tens H)^T(\\tens I+\\epsilon\\tens H)-\\tens I\\big]', why: 'Definizione di $\\tens D$ con $\\tens F=\\tens I+\\epsilon\\tens H$.', val: (v) => T.at(finiteD(T.add(T.I3, T.scale(mat(v, 'H'), v.e))), v.i, v.j) },
            {
              tex: '=\\tfrac12\\big[(\\tens I+\\epsilon\\tens H^T)(\\tens I+\\epsilon\\tens H)-\\tens I\\big]',
              why: 'Il trasposto di una somma è la somma dei trasposti; $\\tens I^T=\\tens I$.',
              val: (v) => { const H = mat(v, 'H'); const A = T.mul(T.add(T.I3, T.scale(T.transpose(H), v.e)), T.add(T.I3, T.scale(H, v.e))); return 0.5 * T.at(T.sub(A, T.I3), v.i, v.j); },
            },
            {
              tex: '=\\tfrac12\\big(\\epsilon\\tens H+\\epsilon\\tens H^T+\\epsilon^2\\tens H^T\\tens H\\big)',
              why: 'Si sviluppa il prodotto; i due $\\tens I$ si elidono.',
              ask: { q: 'Quale termine è di ordine superiore al primo?', options: ['$\\epsilon^2\\tens H^T\\tens H$', '$\\epsilon\\tens H$', '$\\epsilon\\tens H^T$', 'nessuno'], correct: 0, why: 'È l\'unico termine in $\\epsilon^2$: è quello che si trascura.' },
              val: (v) => { const H = mat(v, 'H'); const A = T.add(T.add(T.scale(H, v.e), T.scale(T.transpose(H), v.e)), T.scale(T.mul(T.transpose(H), H), v.e * v.e)); return 0.5 * T.at(A, v.i, v.j); },
            },
            { tex: '\\simeq\\tfrac12\\big(\\tens H+\\tens H^T\\big)=:\\tens E', why: 'Si trascura il termine in $\\epsilon^2$ e si pone $\\epsilon=1$: resta il tensore di deformazione infinitesima.', eq: 'Prop 2.6.3, Def 2.6.4' },
          ],
        },
      },
      {
        id: 'l26-3',
        kind: 'spiega',
        title: 'Equazione di congruenza; E e W',
        md: `Nella teoria finita esistono molte misure tensoriali di deformazione (lagrangiane, euleriane); in quella infinitesima **collassano tutte** in $\\tens E$. Poiché $\\tens H=\\nabla\\vet u$:

$$\\tens E=\\tfrac12(\\nabla\\vet u+\\nabla\\vet u^T)\\qquad\\text{(Teo 2.6.5)}$$

È la relazione tra spostamenti e deformazioni; $\\tens E=\\operatorname{sym}\\nabla\\vet u$ è un **campo** $\\tens E(X)$.

Per il primo teorema di decomposizione, $\\tens H$ (9 componenti) $=\\tens E$ (6) $+\\tens W$ (3), con $\\tens W:=\\frac12(\\tens H-\\tens H^T)\\in\\mathrm{Skw}$, il **tensore di rotazione rigida infinitesima**. Per una rotazione rigida infinitesima $\\tens F\\simeq\\tens I+\\varphi\\tens W$, quindi $\\tens H=\\varphi\\tens W$ è antisimmetrico e, per l'unicità della decomposizione, $\\tens E=\\tens O$.`,
      },
      {
        id: 'l26-4',
        kind: 'prova',
        title: 'Separa deformazione pura e rotazione',
        md: 'Con «parte disegnata» scegli che cosa vedere. La parte $\\tens W$ è disegnata come rotazione esatta di asse $\\vet w$, così resta rigida anche amplificata.',
        tasks: ['Con il taglio semplice, guarda «solo deformazione pura E»: il cubetto si deforma simmetricamente.', 'Ora «solo rotazione rigida W»: il cubetto ruota attorno a z senza deformarsi.', 'Con «rotazione rigida infinitesima», la parte $\\tens E$ non fa nulla: $[\\tens E]=\\tens O$.'],
        visual: DEF({ mode: 'intorno', preset: 'taglio', presets: ['taglio', 'rotazione', 'generico'], part: 'E', controls: ['preset', 'part', 'amp'] }),
      },
      {
        id: 'l26-5',
        kind: 'derivazione',
        title: 'Dilatazione lineare linearizzata',
        md: 'Con $\\tens D\\simeq\\tens E$ e $\\sqrt{1+2x}\\simeq1+x$ si ha $\\varepsilon_n\\simeq\\tens E\\hat n\\cdot\\hat n$ (Prop 2.6.6). Sviluppiamola in componenti.',
        source: D(2, '2.6.5', 'Prop 2.6.6', 26),
        der: {
          sample: (r) => { const o: R = {}; putMat(o, 'H', T.randMat(r)); putVec(o, 'n', T.unit(T.randVec(r))); return o; },
          lines: [
            { tex: '\\varepsilon_n=\\tens E\\hat n\\cdot\\hat n=\\textstyle\\sum_{i,j}E_{ij}n_in_j', why: 'Prodotto righe per colonna e poi scalare.', val: (v) => { const E = T.sym(mat(v, 'H')); const n = vec(v, 'n'); return T.dotv(T.apply(E, n), n); } },
            {
              tex: '=E_{11}n_1^2+E_{22}n_2^2+E_{33}n_3^2+2E_{12}n_1n_2+2E_{23}n_2n_3+2E_{31}n_3n_1',
              why: 'I termini fuori diagonale compaiono due volte e sono uguali, per la simmetria di $\\tens E$.',
              ask: { q: 'Da dove vengono i fattori 2?', options: ['Dalla simmetria di $\\tens E$: $E_{12}n_1n_2+E_{21}n_2n_1=2E_{12}n_1n_2$', 'Dalla definizione di $\\gamma$', 'Dal procedimento formale', 'Sono un errore'], correct: 0, why: 'Osservazione dopo la Prop 2.6.6.' },
              val: (v) => { const E = T.sym(mat(v, 'H')); const n = vec(v, 'n'); return E[0] * n[0] ** 2 + E[4] * n[1] ** 2 + E[8] * n[2] ** 2 + 2 * E[1] * n[0] * n[1] + 2 * E[5] * n[1] * n[2] + 2 * E[6] * n[2] * n[0]; },
              eq: 'Prop 2.6.6',
            },
          ],
        },
      },
      {
        id: 'l26-6',
        kind: 'spiega',
        title: 'Gli altri parametri e le componenti di E',
        md: `Con $\\arcsin x\\simeq x$ e denominatore pari a 1 al primo ordine: $\\gamma_{n,m}=2\\tens E\\hat m\\cdot\\hat n$. Sotto radice: $\\Delta S=\\varepsilon_n+\\varepsilon_m$. Con $\\det(\\tens I+\\epsilon\\tens H)=1+\\epsilon\\operatorname{tr}\\tens H+O(\\epsilon^2)$ e $\\operatorname{tr}\\tens W=0$: $\\Theta=\\operatorname{tr}\\tens E=\\operatorname{div}\\vet u$. Tutto è ora **lineare** in $\\tens E$.

$\\Theta\\equiv0$: deformazione **isocora**, cioè $\\vet u$ solenoidale.

**Interpretazione delle componenti** (§2.6.6): $E_{ii}=\\tens E\\hat e_i\\cdot\\hat e_i=\\varepsilon_i$ e, per $i\\ne j$, $E_{ij}=\\tens E\\hat e_j\\cdot\\hat e_i=\\frac12\\gamma_{ij}$:

$$[\\tens E]=\\begin{bmatrix}\\varepsilon_1&\\frac12\\gamma_{12}&\\frac12\\gamma_{13}\\\\ \\cdot&\\varepsilon_2&\\frac12\\gamma_{23}\\\\ \\cdot&\\cdot&\\varepsilon_3\\end{bmatrix}.$$`,
      },
      {
        id: 'l26-7',
        kind: 'numeri',
        title: 'Finita e infinitesima a confronto',
        md: `Taglio semplice con $H_{12}=0{,}05$, fibre lungo x e y. Teoria infinitesima: $\\varepsilon_x=${f(LIN_T.epsN)}$, $\\gamma_{xy}=2E_{12}=${f(LIN_T.gamma)}$, $\\Theta=${f(LIN_T.Theta)}$. Teoria finita: $\\varepsilon_x=${f(FIN_T.epsN)}$, $\\varepsilon_y=${f(FIN_T.epsM, 4)}$, $\\gamma_{xy}=${f(FIN_T.gamma, 4)}$ rad, $\\Theta=${f(FIN_T.Theta)}$.

La fibra y si allunga di circa $H_{12}^2/2$: un effetto del secondo ordine che la teoria infinitesima trascura. Le espressioni linearizzate sono i limiti di quelle esatte quando l'ampiezza tende a zero (§2.10, «teoria finita e infinitesima a confronto»).`,
        values: { epsLin: LIN_T.epsN, gammaLin: LIN_T.gamma, epsFinY: FIN_T.epsM, gammaFin: FIN_T.gamma },
        visual: DEF({ mode: 'intorno', preset: 'taglio', presets: ['taglio'], controls: ['amp', 'alpha'] }),
      },
      {
        id: 'l26-8',
        kind: 'domanda',
        q: { id: 'l26-q1', kind: 'vf', q: 'In un riferimento in cui $[\\tens E]$ ha $E_{12}=0{,}01$, lo scorrimento tra gli assi 1 e 2 vale $0{,}01$.', answer: false, why: '$\\gamma_{12}=2E_{12}=0{,}02$ (§2.6.6).' },
      },
      {
        id: 'l26-9',
        kind: 'riassunto',
        md: `**In una frase:** con $\\|\\tens H\\|\\ll1$ resta un'unica misura di deformazione, $\\tens E=\\operatorname{sym}\\nabla\\vet u$; la parte $\\tens W$ è una rotazione rigida infinitesima e non deforma.

- $\\varepsilon_n=\\tens E\\hat n\\cdot\\hat n$, $\\gamma=2\\tens E\\hat m\\cdot\\hat n$, $\\Delta S=\\varepsilon_n+\\varepsilon_m$, $\\Theta=\\operatorname{tr}\\tens E=\\operatorname{div}\\vet u$.
- $E_{ii}=\\varepsilon_i$, $E_{ij}=\\gamma_{ij}/2$.
- Spostamenti rigidi infinitesimi: niente deformazione, niente tensione.`,
        orale: ['Linearizzare $\\tens D$ e ottenere $\\tens E$; ricavare i parametri di misura linearizzati. (dispensa, domanda 8)', 'Interpretazione meccanica delle componenti di $\\tens E$. (dispensa, domanda 9)'],
      },
    ],
  },
  // ================================================================== c2.7
  {
    concept: 'c2.7',
    title: 'Formula di rappresentazione e compatibilità',
    minutes: 18,
    source: D(2, '2.7–2.8', 'Teo 2.7.1, eq. (2.2)–(2.3), Teo 2.8.1–2.8.2', '27–29'),
    visual: DEF({ mode: 'rappresentazione', presets: ['taglio', 'rotazione', 'generico'], controls: ['preset', 'amp'] }),
    steps: [
      {
        id: 'l27-1',
        kind: 'derivazione',
        title: 'Tre pezzi dello spostamento',
        md: 'Ipotesi $\\|\\tens H\\|\\ll1$, $|\\vet u|\\ll1$; $Y$ nell\'intorno di $X$. Partiamo da Taylor trascurando $o(|Y-X|)$ (nel campione $f$ è affine, quindi è esatto) e guardiamo la componente $k$.',
        source: D(2, '2.7', 'Teo 2.7.1', 27),
        der: {
          sample: (r) => { const o: R = { k: idx(r) }; putMat(o, 'H', T.scale(T.randMat(r), 0.1)); putVec(o, 'c', T.randVec(r)); putVec(o, 'X', T.randVec(r)); putVec(o, 'Y', T.randVec(r)); return o; },
          lines: [
            { tex: 'f(Y)-Y', why: 'Lo spostamento di $Y$. Per un campo affine $f(P)=\\vet c+(\\tens I+\\tens H)P$.', val: (v) => { const F = T.add(T.I3, mat(v, 'H')); const Y = vec(v, 'Y'); return T.subv(T.addv(vec(v, 'c'), T.apply(F, Y)), Y)[v.k]; } },
            {
              tex: '=f(X)-X+(\\tens F-\\tens I)(Y-X)',
              why: 'Da $f(Y)=f(X)+\\tens F(Y-X)$ si sottrae $Y-X=\\tens I(Y-X)$ a entrambi i membri.',
              val: (v) => { const H = mat(v, 'H'); const F = T.add(T.I3, H); const X = vec(v, 'X'); const uX = T.subv(T.addv(vec(v, 'c'), T.apply(F, X)), X); return T.addv(uX, T.apply(H, T.subv(vec(v, 'Y'), X)))[v.k]; },
            },
            {
              tex: '=\\vet u(X)+(\\tens E+\\tens W)(Y-X)',
              why: '$f(X)-X=\\vet u(X)$ e $\\tens F-\\tens I=\\tens H=\\tens E+\\tens W$.',
              ask: { q: 'Che cosa diventa $\\tens F-\\tens I$?', options: ['$\\tens H=\\tens E+\\tens W$', '$\\tens E$ soltanto', '$\\tens W$ soltanto', '$\\tens D$'], correct: 0, why: 'Identità cinematica e primo teorema di decomposizione.' },
              val: (v) => { const H = mat(v, 'H'); const X = vec(v, 'X'); const uX = T.addv(vec(v, 'c'), T.apply(H, X)); return T.addv(uX, T.apply(T.add(T.sym(H), T.skw(H)), T.subv(vec(v, 'Y'), X)))[v.k]; },
            },
            {
              tex: '\\vet u(Y)=\\underbrace{\\vet u(X)}_{\\text{trasl.}}+\\underbrace{\\tens W(Y-X)}_{\\text{rot. rigida inf.}}+\\underbrace{\\tens E(Y-X)}_{\\vet u^{dp}}',
              why: 'Si separano i tre contributi.',
              val: (v) => { const H = mat(v, 'H'); const X = vec(v, 'X'); const d = T.subv(vec(v, 'Y'), X); const uX = T.addv(vec(v, 'c'), T.apply(H, X)); return (T.addv(T.addv(uX, T.apply(T.skw(H), d)), T.apply(T.sym(H), d)))[v.k]; },
              eq: 'Teo 2.7.1',
            },
          ],
          checks: [{ what: 'W(Y−X) ⊥ (Y−X)', f: (v) => { const d = T.subv(vec(v, 'Y'), vec(v, 'X')); return [T.dotv(T.apply(T.skw(mat(v, 'H')), d), d), 0]; } }],
        },
      },
      {
        id: 'l27-2',
        kind: 'prova',
        title: 'Costruisci u(Y) come nella figura di p. 27',
        md: 'Da $Y$: prima la traslazione $\\vet u(X)$ (arancio), poi $\\tens W(Y-X)$ (rosso), poi $\\vet u^{dp}=\\tens E(Y-X)$ (viola). La somma è $\\vet u(Y)$ (blu).',
        tasks: ['Scegli «rotazione rigida infinitesima»: manca il pezzo viola, $\\vet u^{dp}=\\vet 0$.', 'Guarda dall\'alto: il pezzo rosso è ortogonale al tratteggio $Y-X$.', 'Con «generico» compaiono tutti e tre.'],
        visual: DEF({ mode: 'rappresentazione', preset: 'taglio', presets: ['taglio', 'rotazione', 'generico'], controls: ['preset', 'amp'] }),
      },
      {
        id: 'l27-3',
        kind: 'spiega',
        title: 'Che cosa deforma davvero',
        md: `I primi due termini sono lo **spostamento rigido infinitesimo** (rototraslazione). Poiché $\\tens W(Y-X)=\\vet w\\wedge(Y-X)$ è ortogonale a $Y-X$, fino alla rotazione rigida la distanza tra i due punti non cambia. Solo lo spostamento di **deformazione pura** cambia la configurazione dal punto di vista deformativo.

**Il trampolino.** Una mensola caricata in punta si inflette. Ingrandendo attorno a $X$ e $Y$: se il tratto oltre $X$ fosse rigido, $Y$ subirebbe la traslazione di $X$ e poi si sposterebbe lungo la tangente alla deformata (rotazione rigida). Il trampolino non è rigido: c'è un contributo in più, fino alla deformata effettiva. È la deformazione pura, e **un corpo si può rompere solo per effetto della deformazione pura**.`,
      },
      {
        id: 'l27-4',
        kind: 'spiega',
        title: 'Il problema inverso: la compatibilità',
        md: `$$\\tens E(X)=\\tfrac12\\big(\\nabla\\vet u(X)+\\nabla\\vet u^T(X)\\big)\\qquad(2.2)$$

- **Diretto**: dato $\\vet u$, trovare $\\tens E$. Si deriva: sempre possibile.
- **Inverso** (di compatibilità): dato $\\tens E$ simmetrico e regolare, esiste $\\vet u$? **Non sempre.** È un sistema di 6 equazioni alle derivate parziali in 3 incognite: la soluzione può non esistere e, se esiste, non essere unica.

Perché interessa: nella pratica si calcola al computer. Se il problema è mal posto, il computer restituisce comunque un numero, frutto solo della propagazione degli errori. I teoremi di esistenza e unicità garantiscono che quel numero abbia senso fisico.`,
      },
      {
        id: 'l27-5',
        kind: 'spiega',
        title: 'Unicità ed esistenza',
        md: `**Teo 2.8.1 (unicità).** Dato $\\tens E$, la soluzione, se esiste, è unica **a meno di uno spostamento rigido infinitesimo**: $\\vet u_1=\\vet u_2+\\vet u^\\infty$, perché la differenza di due soluzioni ha deformazione nulla. È incondizionata se il corpo è vincolato in modo da impedire i moti rigidi (un edificio); per un aereo in volo si sa come è deformato, non dove si trova. La dispensa lo chiama «di Kirchhoff» ma avverte che il teorema di Kirchhoff del problema elastico è un'altra cosa (Cap. 5, nota NF-04).

**Teo 2.8.2 (esistenza, Saint-Venant)** — enunciato senza dimostrazione. Condizione necessaria:

$$\\operatorname{rot}\\big(\\operatorname{rot}\\tens E(X)\\big)=\\tens O\\qquad(2.3)$$

ed è anche sufficiente se il corpo è **semplicemente connesso**: ogni curva chiusa si riduce per continuità a un punto restando nel corpo (impossibile con cavità passanti). In componenti sono 6 equazioni, del tipo $\\dfrac{\\partial^2E_{11}}{\\partial X_2^2}+\\dfrac{\\partial^2E_{22}}{\\partial X_1^2}=2\\dfrac{\\partial^2E_{12}}{\\partial X_1\\partial X_2}$.`,
      },
      {
        id: 'l27-6',
        kind: 'prova',
        title: 'Le tessere (figura di p. 29)',
        md: 'Il corpo diviso in tessere, ciascuna deformata in modo omogeneo secondo $\\tens E$ nel suo punto. Il campo è compatibile se le tessere si ricompongono senza vuoti né sovrapposizioni.',
        tasks: ['Nel campo compatibile ($E_{11}=c\\,y$, flessione) le tessere si ruotano e si richiudono: il residuo di Saint-Venant è 0.', 'Nel campo non compatibile ($E_{11}=c\\,y^2$) le righe hanno lunghezze che nessun moto rigido riconcilia: residuo $2c$.'],
        visual: { kind: 'svg', id: 'compatibilita' },
      },
      {
        id: 'l27-7',
        kind: 'domanda',
        q: { id: 'l27-q1', kind: 'scelta', q: 'Per un corpo con un foro passante, la condizione (2.3) è…', options: ['necessaria ma non sufficiente', 'necessaria e sufficiente', 'né necessaria né sufficiente', 'sufficiente ma non necessaria'], correct: 0, why: 'Teo 2.8.2: la sufficienza richiede che il corpo sia semplicemente connesso; con una cavità passante non lo è.' },
      },
      {
        id: 'l27-8',
        kind: 'riassunto',
        md: `**In una frase:** $\\vet u(Y)=\\vet u(X)+\\tens W(Y-X)+\\tens E(Y-X)$, e solo l'ultimo termine deforma; dato $\\tens E$, $\\vet u$ esiste se $\\operatorname{rot}\\operatorname{rot}\\tens E=\\tens O$ (e il corpo è semplicemente connesso) ed è unico a meno di moti rigidi.

- $\\tens W(Y-X)\\perp(Y-X)$: non cambia le distanze.
- Unicità (Teo 2.8.1) ≠ Kirchhoff del problema elastico (Teo 5.1.1).
- Interpretazione: tessere che si ricompongono.`,
        orale: ['Formula di rappresentazione: significato dei tre termini; che cosa misura $\\tens E$ e che cosa $\\tens W$. (dispensa, domanda 10)', 'Problema di compatibilità: teorema di unicità e teorema di Saint-Venant; ruolo della semplice connessione. (dispensa, domanda 11)'],
      },
    ],
  },
  // ================================================================== c2.8
  {
    concept: 'c2.8',
    title: 'Direzioni e dilatazioni principali',
    minutes: 22,
    source: D(2, '2.9–2.10', 'Def 2.9.1, Teo 2.9.2–2.9.3, Prop 2.9.4', '29–33'),
    visual: DEF({ mode: 'ellissoide', presets: ['generico', 'rivoluzione', 'omotetia', 'piana', 'allungamento'], controls: ['preset', 'amp', 'probe'] }),
    steps: [
      {
        id: 'l28-1',
        kind: 'spiega',
        title: 'La domanda',
        md: `Lo spostamento di deformazione pura di un punto della fibra $\\hat n$ è $\\vet u^{dp}=|Y-X|\\,\\tens E\\hat n$. In generale $\\tens E\\hat n$ non è parallelo a $\\hat n$: la fibra, oltre ad allungarsi, si inclina.

**Esistono direzioni $\\hat n$ con $\\tens E\\hat n\\parallel\\hat n$?** Se esistono si chiamano **direzioni principali**, e il loro $\\varepsilon_n$ **dilatazione principale** (Def 2.9.1). Parallelo vuol dire $\\tens E\\hat n=\\lambda\\hat n$, cioè

$$(\\tens E-\\lambda\\tens I)\\hat n=\\vet 0:$$

la ricerca degli autovalori e autovettori di $\\tens E$, le **autocoppie** $(\\lambda,\\hat n)$.`,
      },
      {
        id: 'l28-2',
        kind: 'derivazione',
        title: 'Teorema spettrale, parte b)',
        md: '**Teo 2.9.2:** per $\\tens E$ simmetrico (a) esistono almeno 3 autocoppie reali; (b) ad autovalori distinti corrispondono autovettori ortogonali. Dimostriamo (b). Nel campione $\\hat n_1,\\hat n_2$ sono autovettori veri di un $\\tens E$ casuale, quindi ogni riga vale zero.',
        source: D(2, '2.9.1', 'Teo 2.9.2', 30),
        der: {
          sample: (r) => { const o: R = {}; const E = T.sym(T.randMat(r)); putMat(o, 'E', E); const s = eigSym(E); putVec(o, 'a', s.vectors[0]); putVec(o, 'b', s.vectors[1]); o.l1 = s.values[0]; o.l2 = s.values[1]; putVec(o, 'p', T.randVec(r)); putVec(o, 'q', T.randVec(r)); return o; },
          lines: [
            { tex: '\\lambda_1\\,\\hat n_1\\cdot\\hat n_2=\\tens E\\hat n_1\\cdot\\hat n_2', why: '$(\\lambda_1,\\hat n_1)$ è un\'autocoppia: $\\tens E\\hat n_1=\\lambda_1\\hat n_1$.', val: (v) => v.l1 * T.dotv(vec(v, 'a'), vec(v, 'b')) },
            { tex: '=\\hat n_1\\cdot\\tens E^T\\hat n_2', why: 'Definizione di trasposto.', val: (v) => T.dotv(vec(v, 'a'), T.apply(T.transpose(mat(v, 'E')), vec(v, 'b'))) },
            {
              tex: '=\\hat n_1\\cdot\\tens E\\hat n_2=\\lambda_2\\,\\hat n_1\\cdot\\hat n_2',
              why: 'Qui serve la simmetria: $\\tens E^T=\\tens E$. Poi si usa la seconda autocoppia.',
              ask: { q: 'Quale ipotesi si usa in questo passaggio?', options: ['$\\tens E$ è simmetrico', '$\\lambda_1\\ne\\lambda_2$', '$\\det\\tens E\\ne0$', '$\\tens E$ è definito positivo'], correct: 0, why: 'È l\'unica ipotesi del teorema spettrale.' },
              val: (v) => v.l2 * T.dotv(vec(v, 'a'), vec(v, 'b')),
            },
            { tex: '\\Rightarrow\\ (\\lambda_1-\\lambda_2)\\,\\hat n_1\\cdot\\hat n_2=0\\ \\Rightarrow\\ \\hat n_1\\cdot\\hat n_2=0\\ \\text{ se }\\lambda_1\\ne\\lambda_2', why: 'Si sottraggono il primo e l\'ultimo membro.', eq: 'Teo 2.9.2' },
          ],
          checks: [{ what: 'per vettori qualunque E a·b = a·E b (simmetria)', f: (v) => [T.dotv(T.apply(mat(v, 'E'), vec(v, 'p')), vec(v, 'q')), T.dotv(vec(v, 'p'), T.apply(mat(v, 'E'), vec(v, 'q')))] }],
        },
      },
      {
        id: 'l28-3',
        kind: 'spiega',
        title: 'Equazione secolare di Laplace',
        md: `$(\\tens E-\\lambda\\tens I)\\hat n=\\vet 0$ è un sistema lineare omogeneo: ha sempre la soluzione banale $\\hat n=\\vet 0$, che non interessa. Ha soluzioni non banali (infinite, il nucleo) solo se il rango non è massimo:

$$\\det(\\tens E-\\lambda\\tens I)=0\\iff\\lambda^3-I\\lambda^2+II\\lambda-III=0\\qquad\\text{(Teo 2.9.3)}$$

con gli **invarianti** $I=\\operatorname{tr}\\tens E$, $II=\\frac12[(\\operatorname{tr}\\tens E)^2-\\operatorname{tr}\\tens E^2]$ (somma dei minori principali di ordine 2), $III=\\det\\tens E$. Non dipendono dal riferimento, come le radici.

Trovata una radice $\\lambda^*$, l'autovettore si ricava da $(\\tens E-\\lambda^*\\tens I)\\hat n^*=\\vet 0$ con la normalizzazione $\\hat n^*\\cdot\\hat n^*=1$, che sceglie il versore tra le infinite soluzioni.`,
      },
      {
        id: 'l28-4',
        kind: 'prova',
        title: 'Sfera → ellissoide: i tre casi',
        md: 'La sfera tratteggiata è un intorno di $X$; la superficie azzurra è la sua immagine sotto la sola deformazione pura $\\tens I+k\\tens E$. Gli assi colorati sono le direzioni principali.',
        tasks: ['«generico»: radici distinte, **ellissoide triassiale**; gli assi principali restano ortogonali.', '«rivoluzione»: radice doppia, ellissoide di rivoluzione («pallone da rugby»); nel piano ⊥ $\\hat n_3$ nessuna direzione è privilegiata.', '«omotetia»: radice tripla, la sfera resta sfera (deformazione omotetica).', 'Muovi la fibra di prova $\\hat m$: $\\tens E\\hat m$ è parallelo a $\\hat m$ solo lungo gli assi principali.'],
        visual: DEF({ mode: 'ellissoide', preset: 'generico', presets: ['generico', 'rivoluzione', 'omotetia'], controls: ['preset', 'amp', 'probe'] }),
      },
      {
        id: 'l28-5',
        kind: 'spiega',
        title: 'Che cosa succede nel riferimento principale',
        md: `**Caso 1 (radici distinte).** Tre autocoppie, autovettori ortogonali: il **sistema principale di deformazione**. In esso $[\\tens E]=\\operatorname{diag}(\\lambda_1,\\lambda_2,\\lambda_3)$ e

$$\\tens E=\\lambda_1\\hat n_1\\otimes\\hat n_1+\\lambda_2\\hat n_2\\otimes\\hat n_2+\\lambda_3\\hat n_3\\otimes\\hat n_3.$$

Sulla diagonale ci sono le dilatazioni principali ($\\varepsilon_n=\\tens E\\hat n\\cdot\\hat n=\\lambda$) e gli scorrimenti tra direzioni principali sono nulli ($\\gamma_{ij}=2\\lambda_j\\hat n_j\\cdot\\hat n_i=0$): restano ortogonali. Gli scorrimenti che compaiono in un altro riferimento sono solo un effetto della base.

**Caso 2 (doppia).** $\\infty^1$ sistemi principali: $\\tens E=\\lambda_3\\hat n_3\\otimes\\hat n_3+\\lambda(\\tens I-\\hat n_3\\otimes\\hat n_3)$, con il proiettore ortogonale a $\\hat n_3$.

**Caso 3 (tripla).** $\\infty^2$: ogni terna è principale, $\\tens E=\\lambda\\tens I$ (sferico), $\\vet u^{dp}$ radiale.`,
      },
      {
        id: 'l28-6',
        kind: 'derivazione',
        title: 'Proprietà di estremo',
        md: 'Ordinate $e_1\\ge e_2\\ge e_3$. Nel riferimento principale, con $\\hat n=\\sum_in_i\\hat n_i$ e $\\sum_in_i^2=1$:',
        source: D(2, '2.9.4', 'Prop 2.9.4', 32),
        der: {
          sample: (r) => { const o: R = {}; const E = T.sym(T.randMat(r)); putMat(o, 'E', E); putVec(o, 'n', T.unit(T.randVec(r))); return o; },
          lines: [
            { tex: '\\varepsilon_n=\\tens E\\hat n\\cdot\\hat n', why: 'Dilatazione linearizzata (Prop 2.6.6).', val: (v) => T.dotv(T.apply(mat(v, 'E'), vec(v, 'n')), vec(v, 'n')) },
            {
              tex: '=e_1n_1^2+e_2n_2^2+e_3n_3^2',
              why: 'Nel riferimento principale $[\\tens E]$ è diagonale; $n_i=\\hat n\\cdot\\hat n_i$.',
              val: (v) => { const s = eigSym(mat(v, 'E')); const n = vec(v, 'n'); return s.values.reduce((acc, e, i) => acc + e * T.dotv(n, s.vectors[i]) ** 2, 0); },
            },
            { tex: '\\Rightarrow\\ e_3\\le\\varepsilon_n\\le e_1', why: 'È una media pesata delle $e_i$, con pesi $n_i^2\\ge0$ a somma 1: sta tra la minima e la massima.', eq: 'Prop 2.9.4' },
          ],
          checks: [{ what: 'e3 ≤ ε_n ≤ e1', f: (v) => { const s = eigSym(mat(v, 'E')); const e = T.dotv(T.apply(mat(v, 'E'), vec(v, 'n')), vec(v, 'n')); return [e >= s.values[2] - 1e-12 && e <= s.values[0] + 1e-12 ? 1 : 0, 1]; } }],
        },
      },
      {
        id: 'l28-7',
        kind: 'numeri',
        title: 'Lettura dagli invarianti',
        md: `Con $III=\\lambda_1\\lambda_2\\lambda_3$, $II=\\lambda_1\\lambda_2+\\lambda_2\\lambda_3+\\lambda_3\\lambda_1$, $I=\\lambda_1+\\lambda_2+\\lambda_3$ (§2.10):

- $III\\ne0$: nessuna dilatazione nulla, **triassiale**;
- $III=0$, $II\\ne0$: una nulla, $\\lambda(\\lambda^2-I\\lambda+II)=0$, **biassiale**;
- $III=II=0$, $I\\ne0$: due nulle, $\\lambda^2(\\lambda-I)=0$, **monoassiale**.

Esempio «generico»: $I=${f(PG.invarianti[0])}$, $II=${f(PG.invarianti[1])}$, $III=${f(PG.invarianti[2])}$ → ${PG.stato}. Esempio «una dilatazione nulla»: $III=${f(Math.abs(PP.invarianti[2]) < 1e-15 ? 0 : PP.invarianti[2])}$, $II=${f(PP.invarianti[1])}$ → ${PP.stato}; le dilatazioni principali sono ${PP.values.map((x) => f(Math.abs(x) < 1e-15 ? 0 : x)).join('; ')}.

Con una dilatazione nulla $\\vet u^{dp}$ è sempre parallelo al piano delle altre due direzioni. La dispensa dice che «una sfera si deforma in un'ellisse piatta»: nel modello vedi invece un ellissoide con un semiasse **invariato** (la fibra lungo quella direzione non cambia lunghezza). Vedi la nota NF-02.`,
        values: { I: PG.invarianti[0], II: PG.invarianti[1], IIIp: PP.invarianti[2] },
        visual: DEF({ mode: 'ellissoide', preset: 'piana', presets: ['piana', 'allungamento', 'generico'], controls: ['preset', 'amp', 'probe'] }),
      },
      {
        id: 'l28-8',
        kind: 'domanda',
        q: { id: 'l28-q1', kind: 'scelta', q: 'Se $III=II=0$ e $I\\ne0$, la deformazione…', options: ['avviene solo lungo una direzione principale', 'è omotetica', 'è isocora', 'è nulla'], correct: 0, why: 'Due dilatazioni principali nulle: $\\tens E=\\lambda_3\\hat n_3\\otimes\\hat n_3$ e $\\tens E\\hat m\\parallel\\hat n_3$ (§2.10, caso 3).' },
      },
      {
        id: 'l28-9',
        kind: 'riassunto',
        md: `**In una frase:** $\\tens E$ simmetrico ha tre direzioni principali ortogonali, lungo cui le fibre si allungano senza inclinarsi; le dilatazioni principali sono gli estremi di $\\varepsilon_n$.

- Equazione secolare $\\lambda^3-I\\lambda^2+II\\lambda-III=0$; invarianti indipendenti dal riferimento.
- Tre casi: ellissoide triassiale, di rivoluzione, sfera (omotetia).
- Dilatazioni nulle: si contano con $III$ e $II$.`,
        orale: ['Direzioni e dilatazioni principali: teorema spettrale, equazione secolare, invarianti, i tre casi, proprietà di estremo. (dispensa, domanda 12)', 'Dilatazioni principali nulle e lettura dagli invarianti. (dispensa, domanda 13)'],
      },
    ],
  },
];
