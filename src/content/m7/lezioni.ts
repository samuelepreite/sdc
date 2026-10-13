/**
 * Lezioni guidate del Modulo 7 (Cap. 5, §5.7–5.8). Derivazioni solo dove la dispensa le sviluppa; le righe con `val`
 * sono verificate su 25 campioni casuali (tests/lezioni.test.ts). Numeri da engine/taglio e engine/torsione.
 */
import { D } from '../../engine/types';
import * as J from '../../engine/taglio';
import * as Tor from '../../engine/torsione';
import type { Lesson, LessonVisual } from '../types';

type R = Record<string, number>;
const SVG = (id: 'jourawski' | 'torsione', params?: Record<string, string | number | boolean>): LessonVisual => ({ kind: 'svg', id, params });
const TOR = (mode: 'clebsch' | 'prandtl', extra: Record<string, unknown> = {}): LessonVisual => ({ kind: 'torsione3d', scene: { mode, ...extra } });

const sample = (r: () => number): R => {
  const B = 1 + 2 * r();
  return { B, H: B * (1.2 + 2 * r()), T: 1 + 4 * r(), t: 0.05 + 0.9 * r(), g: 0.2 + r(), c: 2 * r() - 1, x: 2 * r() - 1, y: 2 * r() - 1, z: 3 * r(), a: 1 + 2 * r(), b: 0.5 + r(), gx: 0.2 + 0.6 * r(), gy: 0.2 + 0.6 * r() };
};
const rectPoly = (v: R): [number, number][] => [
  [-v.B / 2, -v.H / 2],
  [v.B / 2, -v.H / 2],
  [v.B / 2, v.H / 2],
  [-v.B / 2, v.H / 2],
];
const yb = (v: R) => -v.H / 2 + v.t * v.H;
/** campo di Clebsch con un ingobbamento armonico di prova φ = c·xy (solo per verificare le formule) */
const clebsch = (v: R, p: [number, number, number]): [number, number, number] => [-v.g * p[1] * p[2], v.g * p[0] * p[2], v.g * v.c * p[0] * p[1]];
const dfd = (f: (p: [number, number, number]) => number[], p: [number, number, number], i: number, k: number, h = 1e-3) => {
  const a = [...p] as [number, number, number],
    b = [...p] as [number, number, number];
  a[i] += h;
  b[i] -= h;
  return (f(a)[k] - f(b)[k]) / (2 * h);
};
/** integrale su un'ellisse di semiassi a, b (coordinate ellittiche; Gauss a 3 punti in r, 16 punti in θ: esatto per i polinomi usati) */
const GR = [0.5 - Math.sqrt(0.15), 0.5, 0.5 + Math.sqrt(0.15)];
const GW = [5 / 18, 8 / 18, 5 / 18];
const intEllipse = (a: number, b: number, f: (x: number, y: number) => number) => {
  let s = 0;
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 16; j++) {
      const r = GR[i],
        th = (2 * Math.PI * j) / 16;
      s += f(a * r * Math.cos(th), b * r * Math.sin(th)) * a * b * r * GW[i] * ((2 * Math.PI) / 16);
    }
  return s;
};

const SQ = Tor.prandtl(Tor.SEZ_TORSIONE.quadrato.poly, 60);
const sqTau = (100 / SQ.I) * SQ.gmax; // kN/cm² con M_z = 100 kN·cm, lato 24 cm
const TUBE = Tor.tubeCompare(10, 0.2, 100);

export const M7_LEZIONI: Lesson[] = [
  // ================================================================== c7.1
  {
    concept: 'c7.1',
    title: 'Il taglio: la formula di Jourawski',
    minutes: 22,
    source: D(5, '5.7.1–5.7.2', 'Def 5.7.1, Teo 5.7.2, Prop 5.7.3', '125–129'),
    visual: SVG('jourawski', { section: 'rettangolo' }),
    steps: [
      {
        id: 'l71-1',
        kind: 'spiega',
        title: 'Dove c’è taglio c’è momento',
        md: `**Def 5.7.1.** Sulla base di destra una forza $\\vet T=(T_x,T_y)$ nel piano della base; sulla sinistra $-\\vet T$ e una coppia. **Dove c'è taglio c'è momento flettente** ($M=TL$): per le leggi di variazione, $M_x(z)=-T_y(L-z)$.

La soluzione esatta dipende molto dalla forma della sezione e si conosce solo per geometrie semplici. Si usa allora la **teoria approssimata di Jourawski**: solo equilibrio, e il **valore medio** della tangenziale su una corda. Ipotesi: $y$ asse di simmetria, taglio retto $T\\equiv T_y$.

Il taglio deve passare per il **centro di taglio** $C_T$ (Sollazzo–Marzano), altrimenti la sezione si torce (profilo a C). Il centro di taglio sta su ogni asse di simmetria e coincide con il baricentro se gli assi di simmetria sono due.`,
      },
      {
        id: 'l71-2',
        kind: 'derivazione',
        title: 'La formula di Jourawski',
        md: 'Porzione tra $z$ e $z+dz$ tagliata da una corda parallela all’asse neutro: corda $b_r$, area sottesa $A_r$, rettangolo di taglio $A_t$. Il campione è un rettangolo con una corda a caso; il motore taglia davvero la sezione.',
        source: D(5, '5.7.2', 'Teo 5.7.2', '126–127'),
        der: {
          sample,
          lines: [
            { tex: '\\int_{A_r}-\\sigma_z(z)\\,dA+\\int_{A_r}\\sigma_z(z+dz)\\,dA+\\int_{A_t}-\\tau_{yz}\\,dA=0', why: 'Equilibrio della porzione lungo $z$.' },
            {
              tex: '\\frac{T_y}{J_x}dz\\int_{A_r}y\\,dA=dz\\int_{b_r}\\tau_{zy}\\,dx',
              why: 'Con $\\sigma_z=-\\frac{T_y(L-z)}{J_x}y$, $\\partial\\sigma_z/\\partial z=\\frac{T_y}{J_x}y$; $\\tau_{zy}$ non dipende da $z$.',
              ask: { q: 'Che cosa equilibra la variazione di $\\sigma_z$ tra le due facce?', options: ['La forza tangenziale sul rettangolo di taglio', 'Lo sforzo normale', 'Il momento torcente', 'Niente: è nulla'], correct: 0, why: '§5.7.2.' },
            },
            { tex: '\\bar\\tau_{zy}', why: 'Valore medio sulla corda, calcolato dal motore sul campione (taglio della sezione, momento statico dell’area sottesa).', val: (v) => { const p = rectPoly(v); return J.jourawski(p, v.T, yb(v), (v.B * v.H ** 3) / 12).tau; } },
            {
              tex: '=\\frac{T_y\\,S_x}{J_x\\,b_r},\\qquad S_x=\\int_{A_r}y\\,dA,\\quad\\bar\\tau_{zy}=\\frac1{b_r}\\int_{b_r}\\tau_{zy}\\,dx',
              why: '$S_x$ è il momento statico dell’area sottesa rispetto all’asse neutro della flessione associata; $J_x$ è quello di tutta la sezione. Per il rettangolo $S_x=\\frac B2\\big(\\frac{H^2}4-\\bar y^2\\big)$.',
              val: (v) => (v.T * (v.B / 2) * (v.H ** 2 / 4 - yb(v) ** 2)) / (((v.B * v.H ** 3) / 12) * v.B),
              eq: 'Teo 5.7.2',
            },
          ],
        },
      },
      {
        id: 'l71-3',
        kind: 'spiega',
        title: 'Come leggere la formula',
        md: `1. La media è rappresentativa solo se $\\tau_{zy}$ varia poco sulla corda (stesso segno): corde parallele all'asse neutro sì, altre no.
2. $S_x=A_r\\,y_{G_r}$ (Varignon) è nullo ai due lembi e massimo sulla corda baricentrica; $\\bar\\tau$ si annulla ai lembi, perché $S_x$ va a zero più velocemente di $b_r$. Il segno è quello di $T_y$.
3. $\\dfrac{d\\bar\\tau_{zy}}{dy}=0\\iff S'_xb_r-S_xb'_r=0$.

**Prop 5.7.3.** Il massimo è sulla corda baricentrica **se e solo se** essa è massima, minima o stazionaria ($b'_r(0)=0$): cerchio, clessidra, doppio T. Sulla baricentrica $S'_x=0$, quindi la condizione si riduce a $b'_r=0$.

4. **Scorrimento:** senza tensioni tangenziali due parti incollate scorrerebbero l'una sull'altra; nelle travi composte le trasmettono chiodi, bulloni, saldature (la gru a portale con la vernice «mangiata» nei fori).
5. **Diagrammi qualitativi:** a T, salto all'attacco ala–anima nel rapporto $B/b$ e massimo sulla corda baricentrica (bastano due corde); a croce, salti e massimo relativo in $y=0$; triangolo, massimo non sulla baricentrica.`,
      },
      {
        id: 'l71-4',
        kind: 'numeri',
        title: 'Tre sezioni a confronto',
        md: `Con $T_y=100$ kN il motore dà: rettangolo 20×40, massimo $${(J.shearDiagram('rettangolo', 100, 200).pts.reduce((a, b) => (b.tau > a.tau ? b : a)).tau * 10).toFixed(3).replace('.', ',')}$ MPa, cioè $\\frac32\\frac TA$ (controllo classico, non nella dispensa); doppio T, salto ala–anima nel rapporto $20/1{,}5\\approx13{,}3$; triangolo, massimo a ${Math.round(Math.abs(J.shearDiagram('triangolo', 100, 400).pts.reduce((a, b) => (b.tau > a.tau ? b : a)).y) * 10) / 10} cm dal baricentro, non sulla corda baricentrica.`,
        values: { salto: Math.round((20 / 1.5) * 10) / 10 },
        visual: SVG('jourawski', { section: 'doppioT' }),
      },
      {
        id: 'l71-5',
        kind: 'prova',
        title: 'Muovi la corda',
        md: 'Sposta la corda dall’alto in basso e guarda l’area sottesa e il diagramma.',
        tasks: ['Rettangolo: diagramma parabolico, massimo sulla corda baricentrica.', 'Doppio T: attraversa l’attacco ala–anima e osserva il salto.', 'Triangolo: il massimo non è sulla corda baricentrica (Prop 5.7.3).'],
        visual: SVG('jourawski', { section: 'T' }),
      },
      {
        id: 'l71-6',
        kind: 'domanda',
        q: { id: 'l71-q1', kind: 'scelta', q: 'In una sezione a T, all’attacco ala–anima, τ̄ ha…', options: ['un salto nel rapporto tra le larghezze B/b', 'un massimo assoluto', 'valore nullo', 'un cambio di segno'], correct: 0, why: '§5.7.2, oss. 5: $S_x$ è continuo, $b_r$ salta.' },
      },
      {
        id: 'l71-7',
        kind: 'riassunto',
        md: `**In una frase:** l'equilibrio della porzione sotto una corda dà $\\bar\\tau_{zy}=\\frac{T_yS_x}{J_xb_r}$, una media su corde parallele all'asse neutro; il massimo sta sulla baricentrica solo se questa è massima, minima o stazionaria.

- Taglio sempre accompagnato da momento; centro di taglio.
- $S_x=A_ry_{G_r}$; nulla ai lembi; salti dove cambia $b_r$.`,
        orale: ['Flessione composta: Jourawski (dimostrazione), valore medio, massimo, scorrimento, diagrammi. (dispensa, domanda 10, prima parte)'],
      },
    ],
  },
  // ================================================================== c7.2
  {
    concept: 'c7.2',
    title: 'La regola delle tangenti',
    minutes: 14,
    source: D(5, '5.7.3–5.7.4', undefined, '129–131'),
    visual: SVG('jourawski', { section: 'triangolo', corda: 0.6 }),
    steps: [
      {
        id: 'l72-1',
        kind: 'spiega',
        title: 'Corde qualsiasi',
        md: `Con una corda di direzione qualsiasi (riferimento $r$ lungo la corda, $t$ ortogonale) lo stesso equilibrio dà la media della componente ortogonale alla corda, $\\bar\\tau_{zt}=\\frac{T_yS_x}{J_xb_r}$, sempre con $J_x$ e $S_x$ rispetto a $x$. Si ricostruisce così $[\\tens T(P)]$ con $\\bar\\tau_{zx}(P)$ e $\\bar\\tau_{zy}(P)$.

Attenzione: $T_x=\\int\\tau_{zx}=0$ e sul bordo $\\boldsymbol\\tau_z\\cdot\\hat n=0$; su una corda verticale $\\tau_{zx}$ cambia segno, e la media di Jourawski non è rappresentativa.`,
      },
      {
        id: 'l72-2',
        kind: 'derivazione',
        title: 'Regola delle tangenti',
        md: 'Corda parallela a $x$ a quota $\\bar y$, estremi $A$ e $B$; le tangenti al contorno in $A$ e $B$ si incontrano in $C$ sull’asse $y$. Catena di passaggi logici.',
        source: D(5, '5.7.4', undefined, '130–131'),
        der: {
          lines: [
            { tex: '\\boldsymbol\\tau_z\\cdot\\hat n=0\\ \\text{in }A\\text{ e }B', why: 'Mantello scarico: agli estremi la tangenziale è diretta lungo la tangente al contorno.' },
            { tex: '\\tau^A_{zx}=-\\bar\\tau_{zy}(\\bar y)\\tan\\alpha\',\\qquad\\tau^B_{zx}=\\bar\\tau_{zy}(\\bar y)\\tan\\alpha\'\\quad(\\alpha\'\'=-\\alpha\')', why: 'Con $\\tau_{zy}=\\bar\\tau_{zy}$ agli estremi, la tangente fissa il rapporto tra le componenti; per simmetria gli angoli sono opposti.' },
            {
              tex: '\\frac{\\partial\\tau_{zx}}{\\partial x}+\\frac{\\partial\\tau_{zy}}{\\partial y}+\\frac{\\partial\\sigma_z}{\\partial z}=0\\ \\Rightarrow\\ \\frac{\\partial^2\\tau_{zx}}{\\partial x^2}=0',
              why: 'Terza equazione indefinita, con $\\bar\\tau_{zy}$ funzione della sola $y$ e $\\partial\\sigma_z/\\partial z$ lineare in $y$: derivando rispetto a $x$.',
              ask: { q: 'Che cosa ne segue per τ_zx sulla corda?', options: ['È lineare in x', 'È costante', 'È parabolica', 'È nulla'], correct: 0, why: '§5.7.4.' },
            },
            { tex: '\\tau_{zx}(x,\\bar y,z)=-2\\frac{\\bar\\tau_{zy}(\\bar y)\\tan\\alpha(\\bar y)}{b_r(\\bar y)}\\,x', why: 'Imponendo i valori agli estremi: lineare, antisimmetrica, nulla sull’asse $y$.', eq: '§5.7.4' },
          ],
        },
      },
      {
        id: 'l72-3',
        kind: 'spiega',
        title: 'Tre casi',
        md: `- **Cerchio:** sulla corda baricentrica le tangenti sono verticali, $\\tau_{zx}=0$; altrove le tangenti convergono sull'asse $y$.
- **Rettangolo:** i lati sono verticali, $\\tau_{zx}\\equiv0$.
- **T sottile:** nell'ala le tensioni sono orizzontali, nell'anima verticali: come un fluido che scorre.`,
      },
      {
        id: 'l72-4',
        kind: 'prova',
        title: 'Le frecce agli estremi',
        md: 'Nel diagramma le frecce rosse agli estremi della corda sono la tangenziale totale: devono seguire il contorno.',
        tasks: ['Triangolo: muovi la corda e verifica che le frecce restino lungo i lati obliqui.', 'Cerchio: sulla corda baricentrica le frecce sono verticali.', 'Rettangolo: τ_zx = 0, frecce verticali ovunque.'],
        visual: SVG('jourawski', { section: 'cerchio', corda: 0.3 }),
      },
      {
        id: 'l72-5',
        kind: 'domanda',
        q: { id: 'l72-q1', kind: 'vf', q: 'Sulla corda baricentrica di un cerchio, con taglio verticale, τ_zx è nulla.', answer: true, why: '§5.7.4: le tangenti al contorno agli estremi sono verticali.' },
      },
      {
        id: 'l72-6',
        kind: 'riassunto',
        md: `**In una frase:** agli estremi di una corda la tangenziale segue il contorno, $\\tau_{zx}=\\pm\\bar\\tau_{zy}\\tan\\alpha'$, e lungo la corda $\\tau_{zx}$ è lineare, antisimmetrica e nulla sull'asse di simmetria.

- Rettangolo $\\tau_{zx}\\equiv0$; cerchio nulla sulla baricentrica.
- Corde verticali: media non rappresentativa.`,
        orale: ['Flessione composta: … diagrammi, regola delle tangenti. (dispensa, domanda 10, seconda parte)'],
      },
    ],
  },
  // ================================================================== c7.3
  {
    concept: 'c7.3',
    title: 'La torsione secondo Clebsch',
    minutes: 18,
    source: D(5, '5.8.1–5.8.2', 'Def 5.8.1–5.8.2, Teo 5.8.3', '131–133'),
    visual: TOR('clebsch', { section: 'rettangolo', controls: ['section', 'twist', 'warp'] }),
    steps: [
      {
        id: 'l73-1',
        kind: 'spiega',
        title: 'Una congettura sugli spostamenti',
        md: `**Def 5.8.1.** Forze sulle basi equivalenti a due coppie uguali e opposte con momento lungo l'asse. Eccezione: con l'approccio di **Clebsch** si congettura il campo di **spostamento**, non quello di tensione.

**Congettura** (§5.8.1): le sezioni **ruotano** di $\\theta(z)$ (le fibre diventano eliche) e si **ingobbano** tutte allo stesso modo, con una funzione $\\varphi(x,y)$ che non dipende da $z$ (una clip a C torta). $\\theta(z)=\\theta(0)+\\gamma z$ con $\\gamma=\\theta'(0)$ **angolo unitario di torsione**; la parte di deformazione pura è $\\theta^{dp}=\\gamma z$. Con l'arco confuso con la tangente, $PP'=r\\gamma z$:

$$u=-\\gamma yz,\\qquad v=\\gamma xz,\\qquad w=\\gamma\\varphi(x,y)\\qquad\\text{(Def 5.8.2)}.$$`,
      },
      {
        id: 'l73-2',
        kind: 'derivazione',
        title: 'Deformazioni e tensioni',
        md: 'Il campione usa un ingobbamento di prova armonico, $\\varphi=c\\,xy$, e deriva numericamente il campo di Clebsch.',
        source: D(5, '5.8.2', undefined, 132),
        der: {
          sample,
          lines: [
            { tex: 'E_{zx}=\\tfrac12\\Big(\\frac{\\partial u}{\\partial z}+\\frac{\\partial w}{\\partial x}\\Big)', why: 'Congruenza; derivata numerica nel punto del campione.', val: (v) => { const p: [number, number, number] = [v.x, v.y, v.z]; return 0.5 * (dfd((q) => clebsch(v, q), p, 2, 0) + dfd((q) => clebsch(v, q), p, 0, 2)); } },
            {
              tex: '=\\tfrac12\\gamma\\Big(-y+\\frac{\\partial\\varphi}{\\partial x}\\Big)',
              why: 'Dalla congettura. Allo stesso modo $E_{yz}=\\frac12\\gamma(x+\\varphi_{,y})$, mentre $E_{xx}=E_{yy}=E_{zz}=E_{xy}=0$: $\\Theta=0$, deformazione **isocora**.',
              val: (v) => 0.5 * v.g * (-v.y + v.c * v.y),
            },
            {
              tex: 'T_{zx}=G\\gamma\\Big(-y+\\frac{\\partial\\varphi}{\\partial x}\\Big),\\qquad T_{zy}=G\\gamma\\Big(x+\\frac{\\partial\\varphi}{\\partial y}\\Big)',
              why: 'Legame: con $\\operatorname{tr}\\tens E=0$, $\\tens T=2G\\tens E$.',
              ask: { q: 'Perché il legame si riduce a $\\tens T=2G\\tens E$?', options: ['Perché la deformazione è isocora: $\\operatorname{tr}\\tens E=0$', 'Perché $\\nu=0$', 'Perché $\\tens E$ è diagonale', 'Perché la sezione è circolare'], correct: 0, why: 'Lamé con $\\operatorname{tr}\\tens E=0$.' },
              eq: '§5.8.2',
            },
          ],
          checks: [{ what: '$E_{zz}=\\partial w/\\partial z=0$', f: (v) => [dfd((q) => clebsch(v, q), [v.x, v.y, v.z], 2, 2), 0] }],
        },
      },
      {
        id: 'l73-3',
        kind: 'derivazione',
        title: 'Il problema di Neumann',
        md: 'Equilibrio di campo e condizione sul mantello. Catena di passaggi logici.',
        source: D(5, '5.8.2', 'Teo 5.8.3', '132–133'),
        der: {
          lines: [
            { tex: '\\frac{\\partial T_{zx}}{\\partial x}+\\frac{\\partial T_{zy}}{\\partial y}=G\\gamma\\,\\nabla^2\\varphi=0\\ \\text{in }\\mathring A', why: 'Terza equazione indefinita (le altre due sono identiche: le tensioni non dipendono da $z$).' },
            { tex: 'T_{zx}n_x+T_{zy}n_y=0\\ \\Rightarrow\\ \\frac{d\\varphi}{dn}=\\nabla\\varphi\\cdot\\hat n=yn_x-xn_y\\ \\text{su }\\partial A', why: 'Mantello scarico.' },
            { tex: 'N=M_x=M_y=0,\\quad T_x=T_y=0,\\quad M_z=\\int_A(T_{zy}x-T_{zx}y)\\,dA', why: 'Condizioni sulle basi; che i tagli siano nulli la dispensa lo afferma senza svolgerlo. $M_z$ determina $\\gamma$.', eq: 'Teo 5.8.3' },
          ],
        },
      },
      {
        id: 'l73-4',
        kind: 'spiega',
        title: 'Teorema di Clebsch',
        md: `**Teo 5.8.3.** $\\varphi$ risolve il **problema di Neumann** per l'equazione di Laplace: $\\nabla^2\\varphi=0$ nell'interno, $d\\varphi/dn=yn_x-xn_y$ sul contorno; $\\gamma$ si ricava da $M_z$.

È un'equazione del secondo ordine: sul contorno basta assegnare la funzione (Dirichlet) o la sua derivata normale (Neumann); qui è assegnata la derivata.`,
      },
      {
        id: 'l73-5',
        kind: 'prova',
        title: 'Rotazione e ingobbamento',
        md: 'Nel modello le sezioni ruotano e si ingobbano con la funzione φ calcolata dal motore.',
        tasks: ['Le fibre del mantello diventano eliche.', 'Rettangolo: guarda la base di destra, la griglia esce dal piano (ingobbamento).', 'Passa al cerchio: nessun ingobbamento, la base resta piana.'],
        visual: TOR('clebsch', { section: 'rettangolo', controls: ['section', 'twist', 'warp'], view: 'prospettiva' }),
      },
      {
        id: 'l73-6',
        kind: 'domanda',
        q: { id: 'l73-q1', kind: 'scelta', q: 'Quale problema al contorno risolve la funzione d’ingobbamento φ?', options: ['Neumann per Laplace', 'Dirichlet per Poisson', 'Dirichlet per Laplace', 'Neumann per Poisson'], correct: 0, why: 'Teo 5.8.3.' },
      },
      {
        id: 'l73-7',
        kind: 'riassunto',
        md: `**In una frase:** Clebsch congettura $u=-\\gamma yz$, $v=\\gamma xz$, $w=\\gamma\\varphi$; la deformazione è isocora, $\\tens T=2G\\tens E$, e $\\varphi$ risolve un problema di Neumann per Laplace.

- $T_{zx}=G\\gamma(-y+\\varphi_{,x})$, $T_{zy}=G\\gamma(x+\\varphi_{,y})$.
- $M_z$ determina $\\gamma$.`,
        orale: ['Torsione: Clebsch, Neumann, Prandtl e Dirichlet, fattore di torsione. (dispensa, domanda 11, prima parte)'],
      },
    ],
  },
  // ================================================================== c7.4
  {
    concept: 'c7.4',
    title: 'La funzione di Prandtl',
    minutes: 18,
    source: D(5, '5.8.3–5.8.4', 'Def 5.8.4, Teo 5.8.5, Def 5.8.6', '133–135'),
    visual: TOR('prandtl', { section: 'quadrato', controls: ['section'] }),
    steps: [
      {
        id: 'l74-1',
        kind: 'derivazione',
        title: 'Da Neumann a Dirichlet',
        md: 'Si introduce una funzione delle tensioni che soddisfa l’equilibrio per costruzione. Catena di passaggi logici.',
        source: D(5, '5.8.3', 'Def 5.8.4, Teo 5.8.5', '133–134'),
        der: {
          lines: [
            { tex: '\\frac{\\partial F}{\\partial x}=x+\\frac{\\partial\\varphi}{\\partial y},\\quad\\frac{\\partial F}{\\partial y}=-\\Big(-y+\\frac{\\partial\\varphi}{\\partial x}\\Big)\\ \\Rightarrow\\ T_{zx}=-G\\gamma\\frac{\\partial F}{\\partial y},\\ T_{zy}=G\\gamma\\frac{\\partial F}{\\partial x}', why: 'Def 5.8.4.' },
            { tex: '\\frac{\\partial T_{zx}}{\\partial x}+\\frac{\\partial T_{zy}}{\\partial y}=G\\gamma\\Big(-F_{,yx}+F_{,xy}\\Big)=0', why: 'Equilibrio identicamente soddisfatto (teorema di Schwarz).' },
            {
              tex: '\\nabla^2F=\\frac{\\partial}{\\partial x}\\Big(x+\\varphi_{,y}\\Big)+\\frac{\\partial}{\\partial y}\\Big(y-\\varphi_{,x}\\Big)=2',
              why: 'Integrabilità di $\\varphi$: le derivate miste di $\\varphi$ si elidono.',
              ask: { q: 'Quanto vale il laplaciano di F?', options: ['2', '0', '1', '$-2$'], correct: 0, why: 'Teo 5.8.5.' },
            },
            { tex: '\\frac{dF}{dt}=\\nabla F\\cdot\\hat t=0\\ \\text{su }\\partial A\\ \\Rightarrow\\ F=0\\ \\text{su }\\partial A', why: 'Con $\\hat t=(-n_y,n_x)$ la condizione del mantello diventa $dF/dt=0$: $F$ costante sul contorno; per una sezione semplicemente connessa si sceglie 0.', eq: 'Teo 5.8.5' },
          ],
        },
      },
      {
        id: 'l74-2',
        kind: 'derivazione',
        title: 'Il momento torcente',
        md: 'Il campione usa la $F$ esatta dell’ellisse (semiassi a caso) e integra numericamente.',
        source: D(5, '5.8.4', 'Def 5.8.6', '134–135'),
        der: {
          sample,
          lines: [
            {
              tex: '\\frac{M_z}{G\\gamma}=\\int_A\\Big(x\\frac{\\partial F}{\\partial x}+y\\frac{\\partial F}{\\partial y}\\Big)dA',
              why: '$M_z=\\int(T_{zy}x-T_{zx}y)$ con la funzione di Prandtl.',
              val: (v) => {
                const A = v.a + v.b,
                  B = v.b;
                const k = (A * A * B * B) / (A * A + B * B);
                // ∇F esatto dell'ellisse: F_x = 2kx/a², F_y = 2ky/b²
                return intEllipse(A, B, (x, y) => x * ((2 * k * x) / (A * A)) + y * ((2 * k * y) / (B * B)));
              },
            },
            {
              tex: '=\\int_A\\big(\\operatorname{div}\\vet w-2F\\big)dA,\\qquad\\vet w=(xF,\\,yF)',
              why: '$\\operatorname{div}\\vet w=xF_{,x}+yF_{,y}+2F$.',
            },
            {
              tex: '=\\int_A(-2F)\\,dA',
              why: 'Teorema della divergenza: $\\int\\operatorname{div}\\vet w=\\oint\\vet w\\cdot\\hat n=0$ perché $F=0$ sul contorno.',
              val: (v) => {
                const e = Tor.ellipse(v.a + v.b, v.b, 1);
                return intEllipse(v.a + v.b, v.b, (x, y) => -2 * e.F(x, y));
              },
              eq: '§5.8.4',
            },
          ],
        },
      },
      {
        id: 'l74-3',
        kind: 'spiega',
        title: 'Fattore di torsione e rigidezza',
        md: `**Def 5.8.6.**

$$q:=\\frac{J_0}{\\int_A(-2F)\\,dA}\\ge1\\ (=1\\text{ solo per il cerchio}),\\qquad\\gamma=q\\frac{M_z}{GJ_0}=\\frac{M_z}{K_t},\\quad K_t:=\\frac{GJ_0}q.$$

$q$ è un fattore di efficienza: quanto la sezione è meno rigida a torsione di quanto direbbe il suo momento polare. $\\gamma=\\theta(z+1)-\\theta(z)$ è la rotazione relativa di due sezioni a distanza unitaria.

**Schema per l'orale:** 1) congettura ($\\gamma$, $\\varphi\\leftrightarrow F$); 2) Dirichlet; 3) $\\gamma=qM_z/(GJ_0)$. Soluzioni esatte in forma chiusa (cerchio, ellisse, anche cavi; triangolo equilatero), esatte in serie (rettangolo, quadrato), approssimate (sezioni sottili chiuse e aperte).`,
      },
      {
        id: 'l74-4',
        kind: 'prova',
        title: 'La forma di F',
        md: 'Il modello mostra il grafico di −F calcolato dal motore: nullo sul contorno, massimo all’interno.',
        tasks: ['La pendenza della superficie è proporzionale a |τ|: è massima ai punti medi dei lati del quadrato.', 'Le curve di livello sono le linee di tensione.', 'Confronta q per cerchio (≈ 1), quadrato e triangolo nella tabella.'],
        visual: TOR('prandtl', { section: 'quadrato', controls: ['section'] }),
      },
      {
        id: 'l74-5',
        kind: 'domanda',
        q: { id: 'l74-q1', kind: 'vf', q: 'Con la funzione di Prandtl l’equilibrio di campo è soddisfatto automaticamente.', answer: true, why: '§5.8.3: teorema di Schwarz.' },
      },
      {
        id: 'l74-6',
        kind: 'riassunto',
        md: `**In una frase:** con $T_{zx}=-G\\gamma F_{,y}$, $T_{zy}=G\\gamma F_{,x}$ l'equilibrio è automatico e il problema diventa $\\nabla^2F=2$, $F=0$ sul contorno; $M_z=G\\gamma\\int(-2F)$ e $\\gamma=qM_z/(GJ_0)$.

- $q\\ge1$, uguale a 1 solo per il cerchio; $K_t=GJ_0/q$.`,
        orale: ['Torsione: Clebsch, Neumann, Prandtl e Dirichlet, fattore di torsione. (dispensa, domanda 11)'],
      },
    ],
  },
  // ================================================================== c7.5
  {
    concept: 'c7.5',
    title: 'Sezioni esatte e analogia idrodinamica',
    minutes: 20,
    source: D(5, '5.8.5–5.8.8', undefined, '135–138'),
    visual: SVG('torsione', { tab: 'flusso', section: 'quadrato' }),
    steps: [
      {
        id: 'l75-1',
        kind: 'derivazione',
        title: 'La sezione circolare',
        md: 'Si prova con l’equazione del contorno. Il campione prende un raggio e un punto a caso.',
        source: D(5, '5.8.5', undefined, '135–136'),
        der: {
          sample,
          lines: [
            { tex: 'F=x^2+y^2-R^2:\\quad\\nabla^2F=4', why: 'Primo tentativo: l’equazione del contorno.' },
            {
              tex: 'F=\\frac{x^2+y^2-R^2}2:\\quad\\nabla^2F',
              why: 'Diviso per 2; laplaciano calcolato numericamente nel punto del campione…',
              val: (v) => {
                const R = v.a;
                const f = (x: number, y: number) => Tor.circle(R, 1).F(x, y);
                const h = 1e-2,
                  x = v.x * 0.5 * R,
                  y = v.y * 0.5 * R;
                return (f(x + h, y) + f(x - h, y) + f(x, y + h) + f(x, y - h) - 4 * f(x, y)) / (h * h);
              },
            },
            { tex: '=2\\ ✓', why: '…e vale 2.', val: () => 2, eq: '§5.8.5' },
          ],
        },
      },
      {
        id: 'l75-2',
        kind: 'spiega',
        title: 'Che cosa si ricava per il cerchio',
        md: `$\\partial\\varphi/\\partial y=\\partial F/\\partial x-x=0$ e $\\partial\\varphi/\\partial x=y-\\partial F/\\partial y=0$: **niente ingobbamento**. $J_0=\\pi R^4/2$ e $\\int(-2F)=\\int(R^2-r^2)=\\pi R^4/2$: $q=1$, $K_t=GJ_0$.

$$\\tau_{zx}=-\\frac{M_z}{J_0}y,\\quad\\tau_{zy}=\\frac{M_z}{J_0}x,\\quad|\\tau_z|=\\frac{2M_z}{\\pi R^4}r,\\quad|\\tau_z|_{\\max}=\\frac{2M_z}{\\pi R^3}:$$

lineare con il raggio, ortogonale al raggio vettore, massima sul contorno.

**Altre sezioni esatte** (§5.8.6):
- **ellisse** ($a>b$): $\\tau_{\\max}=\\frac{2M_z}{\\pi ab^2}$ ai piedi dell'asse minore; si ingobba;
- **triangolo equilatero** di lato $a$: $\\tau_{\\max}=\\frac{20M_z}{a^3}$ ai punti medi dei lati;
- **rettangolo** $h\\ge b$: $\\theta^{(1)}=\\frac1\\beta\\frac{M_z}{Gb^3h}$, $\\tau_{\\max}=\\frac1\\alpha\\frac{M_z}{b^2h}$ ai punti medi dei lati lunghi, con $\\alpha$, $\\beta$ in tabella ($h/b=1$: 0,208 e 0,141; $h/b\\to\\infty$: $\\frac13$). Quadrato: $4{,}8M_z/a^3$; rettangolo molto allungato: $3M_z/(b^2h)$.`,
      },
      {
        id: 'l75-3',
        kind: 'numeri',
        title: 'Il quadrato, calcolato dal motore',
        md: `Per il quadrato di lato 24 cm il risolutore numerico della funzione di Prandtl dà $\\tau_{\\max}\\approx${(sqTau * 24 ** 3 / 100).toFixed(2).replace('.', ',')}\\,M_z/a^3$ (tabella: $4{,}8$) e $q\\approx${SQ.q.toFixed(3).replace('.', ',')}$. Differenze di qualche per cento: la griglia è finita.`,
        values: { coeff: Math.round((sqTau * 24 ** 3) / 100 * 100) / 100, q: Math.round(SQ.q * 1000) / 1000 },
        visual: SVG('torsione', { tab: 'flusso', section: 'quadrato' }),
      },
      {
        id: 'l75-4',
        kind: 'spiega',
        title: 'L’analogia idrodinamica',
        md: `La tensione non si misura (si misura al più la deformazione); ma la torsione ha le stesse equazioni del **moto laminare** di un fluido in un recipiente con la forma della sezione (un giradischi fermato di colpo, gocce d'inchiostro):
- $|\\tau_z|\\leftrightarrow|v|$;
- linee di tensione ↔ linee di flusso;
- in un tubo di flusso a portata costante $\\tau_zb=$ costante: dove il tubo si stringe la tensione aumenta.

**Spigoli convessi** $\\tau\\to0$; **spigoli concavi** $\\tau\\to\\max$; sulla linea media 0, al contorno massima. Negli spigoli vivi concavi il materiale si plasticizza anche con momenti bassi: servono i **raccordi** (anche nei profilati a doppio T), importanti per la fatica.`,
      },
      {
        id: 'l75-5',
        kind: 'prova',
        title: 'Linee di tensione',
        md: 'Il diagramma mostra le linee di tensione (curve di livello di F) e l’intensità di |τ_z|.',
        tasks: ['Quadrato: τ nulla negli spigoli convessi, massima ai punti medi dei lati.', 'L: le linee si addensano nello spigolo concavo.', 'Cerchio: linee concentriche, τ crescente con il raggio.'],
        visual: SVG('torsione', { tab: 'flusso', section: 'L' }),
      },
      {
        id: 'l75-6',
        kind: 'spiega',
        title: 'Chiusa contro aperta, e la sezione cava',
        md: `Tubolare quadrato chiuso (lato $B$, spessore $t$) e lo stesso tagliato, con lo stesso $M_z$.
- **Chiusa:** per lo spessore piccolo la tensione è costante nello spessore; sulla corda baricentrica le forze $\\tau^{(1)}t$ dei due lati opposti formano una coppia di braccio $B-t$: $dM_z=\\tau^{(1)}t(B-t)$.
- **Aperta:** la tensione varia linearmente nello spessore, nulla al centro: $dM_z=\\frac13\\tau^{(2)}t^2$.

A parità di momento la dispensa ricava $\\tau^{(2)}=3\\frac{B-t}t\\tau^{(1)}$, circa 150 volte con $B=100$ mm e $t=2$ mm, avvertendo che è un calcolo qualitativo. Combinando le sue formule globali (Bredt per la chiusa, rettangolo allungato per l'aperta) il motore trova circa la metà, ${TUBE.ratio.toFixed(1).replace('.', ',')}$ volte (**passaggio aggiunto**, NF-14). La conclusione non cambia: **le sezioni chiuse resistono molto meglio a torsione**.

**Cerchio cavo** (§5.8.8): il bordo interno è una linea di flusso, $F$ costante su di esso; la stessa $F$ del cerchio pieno risolve il problema: $\\tau_z=\\frac{M_z}{J_0}r$, $r\\in[R_i,R_e]$, $J_0=\\frac{\\pi(R_e^4-R_i^4)}2$.`,
      },
      {
        id: 'l75-7',
        kind: 'prova',
        title: 'Tagliare il tubo',
        md: 'Confronta la tubolare chiusa e quella tagliata.',
        tasks: ['Con t = 2 mm la sezione aperta ha tensioni decine di volte maggiori.', 'Aumenta lo spessore: il rapporto scende, ma resta grande.'],
        visual: SVG('torsione', { tab: 'sottili' }),
      },
      {
        id: 'l75-8',
        kind: 'domanda',
        q: { id: 'l75-q1', kind: 'scelta', q: 'In un rettangolo soggetto a torsione, che cosa accade negli spigoli?', options: ['τ → 0 (spigoli convessi)', 'τ è massima', 'τ è infinita', 'τ è uguale al valore medio'], correct: 0, why: '§5.8.7: analogia idrodinamica.' },
      },
      {
        id: 'l75-9',
        kind: 'riassunto',
        md: `**In una frase:** per il cerchio $F=\\frac{r^2-R^2}2$, niente ingobbamento, $q=1$, $\\tau=\\frac{M_z}{J_0}r$; le altre sezioni si ingobbano; l'analogia idrodinamica spiega spigoli e raccordi; le sezioni chiuse sono molto più efficienti di quelle aperte.

- Ellisse $\\frac{2M_z}{\\pi ab^2}$; triangolo $\\frac{20M_z}{a^3}$; rettangolo con la tabella $\\alpha$, $\\beta$.
- Cerchio cavo: stessa $F$, $J_0=\\frac\\pi2(R_e^4-R_i^4)$.`,
        orale: ['Sezione circolare (piena e cava) e altre sezioni; analogia idrodinamica. (dispensa, domanda 12, prima parte)'],
      },
    ],
  },
  // ================================================================== c7.6
  {
    concept: 'c7.6',
    title: 'Sezioni sottili: aperte e chiuse (Bredt)',
    minutes: 14,
    source: D(5, '5.8.9–5.8.10', 'Teo 5.8.7', '139–141'),
    visual: SVG('torsione', { tab: 'sottili' }),
    steps: [
      {
        id: 'l76-1',
        kind: 'spiega',
        title: 'Sottili aperte',
        md: `Una sezione sottile aperta (una L, una C, un doppio T) si tratta come insieme di $n$ rettangoli allungati, di spessore $b_i$ e lunghezza $h_i$:

$$\\tau^i_{z,\\max}=\\frac{3M_z}{\\sum_jb_j^3h_j}\\,b_i,\\qquad(\\tau_{z,\\max})_{\\max}=\\frac{3M_z}{\\sum_jb_j^3h_j}\\,b_{\\max}.$$

È una piccola sovrastima; negli spigoli servono metodi numerici.`,
      },
      {
        id: 'l76-2',
        kind: 'derivazione',
        title: 'La formula di Bredt',
        md: 'Linea media $\\Gamma$ chiusa e regolare, spessore $h(s)$. Ipotesi: spessore piccolo, solo equilibrio alla rotazione, tensione media sulla corda parallela alla tangente, $\\bar\\tau_zh=$ costante (ipotesi di Bredt, portata costante). Il campione prende come linea media un rettangolo $a\\times b$ e un polo $G$ interno a caso.',
        source: D(5, '5.8.10', 'Teo 5.8.7', '139–140'),
        der: {
          sample,
          lines: [
            { tex: 'd\\vet F=\\bar\\tau_z(s)h(s)\\,\\hat t(s)\\,ds', why: 'Forza sul tratto $ds$ della parete.' },
            { tex: 'M_z=\\oint_\\Gamma\\big[(P(s)-G)\\wedge d\\vet F\\big]\\cdot\\hat e_z=\\bar\\tau_zh\\oint_\\Gamma\\big[(P-G)\\wedge\\hat t\\big]\\cdot\\hat e_z\\,ds', why: 'Per l’ipotesi di Bredt $\\bar\\tau_zh$ esce dall’integrale.' },
            {
              tex: '\\oint_\\Gamma\\big[(P-G)\\wedge\\hat t\\big]\\cdot\\hat e_z\\,ds',
              why: 'Calcolato numericamente sul contorno del campione…',
              val: (v) => {
                const P: [number, number][] = [
                  [0, 0],
                  [v.a, 0],
                  [v.a, v.b],
                  [0, v.b],
                ];
                const G = [v.gx * v.a, v.gy * v.b];
                let s = 0;
                for (let i = 0; i < 4; i++) {
                  const A = P[i],
                    B = P[(i + 1) % 4];
                  const L = Math.hypot(B[0] - A[0], B[1] - A[1]);
                  const t = [(B[0] - A[0]) / L, (B[1] - A[1]) / L];
                  for (let k = 0; k < 50; k++) {
                    const u = (k + 0.5) / 50;
                    const p = [A[0] + u * (B[0] - A[0]) - G[0], A[1] + u * (B[1] - A[1]) - G[1]];
                    s += (p[0] * t[1] - p[1] * t[0]) * (L / 50);
                  }
                }
                return s;
              },
            },
            {
              tex: '=2\\Omega',
              why: '…il prodotto misto è il doppio dell’area del triangolino $G,P(s),P(s+ds)$: l’integrale è il doppio dell’area racchiusa dalla linea media, qualunque sia $G$.',
              ask: { q: 'Che cosa rappresenta $\\frac12[(P-G)\\wedge\\hat t]\\cdot\\hat e_z\\,ds$?', options: ['L’area del triangolino G, P(s), P(s+ds)', 'La lunghezza dell’arco', 'Il momento d’inerzia', 'La forza sul tratto'], correct: 0, why: '§5.8.10.' },
              val: (v) => 2 * v.a * v.b,
            },
            { tex: 'M_z=\\bar\\tau_zh\\,2\\Omega\\ \\Rightarrow\\ \\bar\\tau_z(s)=\\frac{M_z}{2\\Omega h(s)}', why: 'Formula di Bredt.', eq: 'Teo 5.8.7' },
          ],
        },
      },
      {
        id: 'l76-3',
        kind: 'spiega',
        title: 'Osservazioni',
        md: `1. La tensione è massima dove lo spessore è minimo.
2. Rispetto alla soluzione esatta del tubo circolare (lineare nello spessore) Bredt dà la media: errore trascurabile per spessori sottili.
3. Con una linea media non regolare (spigoli) l'approssimazione è scadente: serve più sicurezza o un'analisi locale (FEM).

**Per l'orale:** Jourawski per il taglio, Bredt per la torsione delle sottili chiuse, rettangoli allungati per le sottili aperte.`,
      },
      {
        id: 'l76-4',
        kind: 'numeri',
        title: 'Il tubolare in numeri',
        md: `Tubolare quadrato $B=100$ mm, $t=2$ mm, $M_z=1$ kN·m: chiuso (Bredt) $\\tau\\approx${(TUBE.closed * 10).toFixed(1).replace('.', ',')}$ MPa; tagliato (rettangolo allungato) $\\tau_{\\max}\\approx${(TUBE.open * 10).toFixed(0)}$ MPa. Valori di esempio.`,
        values: { chiusa: Math.round(TUBE.closed * 100) / 10, aperta: Math.round(TUBE.open * 10) },
        visual: SVG('torsione', { tab: 'sottili' }),
      },
      {
        id: 'l76-5',
        kind: 'domanda',
        q: { id: 'l76-q1', kind: 'scelta', q: 'In una sezione sottile aperta fatta di rettangoli allungati, dove è la tangenziale massima?', options: ['Nel rettangolo più spesso', 'Nel rettangolo più lungo', 'Nel rettangolo più sottile', 'È uguale in tutti'], correct: 0, why: '§5.8.9: $\\tau^i_{\\max}\\propto b_i$.' },
      },
      {
        id: 'l76-6',
        kind: 'riassunto',
        md: `**In una frase:** sottili aperte come rettangoli allungati, $\\tau^i_{\\max}=\\frac{3M_z}{\\sum b_j^3h_j}b_i$; sottili chiuse con Bredt, $\\bar\\tau_z=\\frac{M_z}{2\\Omega h}$, perché il flusso $\\bar\\tau_zh$ è costante e $\\oint[(P-G)\\wedge\\hat t]\\cdot\\hat e_zds=2\\Omega$.`,
        orale: ['Sottili aperte e chiuse, Bredt. (dispensa, domanda 12, seconda parte)'],
      },
    ],
  },
];

