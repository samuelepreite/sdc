/**
 * Lezioni guidate del Modulo 5 (Cap. 4, §4.12–4.16). Derivazioni solo dove la dispensa le sviluppa; le righe con `val`
 * sono verificate su 25 campioni casuali (tests/lezioni.test.ts).
 */
import { D } from '../../engine/types';
import * as T from '../../engine/tensor';
import * as El from '../../engine/elastico';
import { eigSym } from '../../engine/spettro';
import type { Lesson, LessonVisual } from '../types';

type R = Record<string, number>;
const SVG = (id: 'isotropia' | 'problema' | 'cammino', params?: Record<string, string | number | boolean>): LessonVisual => ({ kind: 'svg', id, params });

/** campione: μ > 0, λ con 2μ + 3λ > 0, due deformazioni simmetriche, due scalari */
const sample = (r: () => number): R => {
  const mu = 0.5 + 2 * r();
  const o: R = { mu, la: -0.6 * mu + 3 * r(), al: 4 * r() - 2, be: 4 * r() - 2 };
  for (const p of ['a', 'b'])
    for (let i = 0; i < 3; i++)
      for (let j = i; j < 3; j++) {
        const x = 2 * r() - 1;
        o[`${p}${3 * i + j}`] = x;
        o[`${p}${3 * j + i}`] = x;
      }
  return o;
};
const sym = (v: R, p: string): T.Mat => Array.from({ length: 9 }, (_, k) => v[`${p}${k}`]);
const A = (v: R) => El.lameTensor(v.mu, v.la);
const tech = (v: R) => El.techFromLame(v.mu, v.la);
const TT = (v: R) => El.stressIso(v.mu, v.la, sym(v, 'a'));
const phiE = (v: R, E: T.Mat) => El.energy(A(v), E);

/** numeri per l'acciaio (E = 205 000 MPa, ν = 0,3), come nel diagramma */
const ST = El.lameFromTech(205000, 0.3);
const STK = El.techFromLame(ST.mu, ST.lambda).K;
const r0 = (x: number) => Math.round(x);

export const M5_LEZIONI: Lesson[] = [
  // ================================================================== c5.1
  {
    concept: 'c5.1',
    title: 'Il teorema di Lamé e le sue conseguenze',
    minutes: 22,
    source: D(4, '4.12', 'Teo 4.12.1–4.12.4', '86–88'),
    visual: SVG('isotropia', { tab: 'provino' }),
    steps: [
      {
        id: 'l51-1',
        kind: 'spiega',
        title: 'Isotropia: ogni rotazione è di simmetria',
        md: `Un materiale è **elastico lineare isotropo** se la risposta non dipende dalla direzione: ogni trasformazione ortogonale appartiene al gruppo di simmetria,

$$\\mathbb A[\\tens Q\\tens E\\tens Q^T]=\\tens Q(\\mathbb A\\tens E)\\tens Q^T\\quad\\forall\\tens E\\in\\mathrm{Sym},\\ \\forall\\tens Q\\in\\mathrm{Orth}.$$

**Teo 4.12.1 (Lamé).** Allora esistono due scalari $\\mu,\\lambda$ (le **costanti di Lamé**) tali che

$$\\tens T=2\\mu\\tens E+\\lambda(\\operatorname{tr}\\tens E)\\tens I.$$

In componenti $T_{ij}=2\\mu E_{ij}+\\lambda(E_{11}+E_{22}+E_{33})\\delta_{ij}$: le tensioni normali dipendono da tutte le dilatazioni, ciascuna tangenziale solo dallo scorrimento omonimo ($T_{12}=2\\mu E_{12}$). La delta di Kronecker riflette i blocchi NE e SW nulli della matrice di Voigt. Il teorema si enuncia e si usa: la dispensa non ne riporta la dimostrazione.`,
      },
      {
        id: 'l51-2',
        kind: 'derivazione',
        title: 'L’isotropo è sempre iperelastico',
        md: 'Bisogna mostrare $\\mathbb A\\tens E_1\\cdot\\tens E_2=\\mathbb A\\tens E_2\\cdot\\tens E_1$ per ogni coppia di simmetrici. Il campione prende $\\mu,\\lambda$ e due deformazioni a caso.',
        source: D(4, '4.12.1', 'Teo 4.12.2', 87),
        der: {
          sample,
          lines: [
            { tex: '\\mathbb A\\tens E_1\\cdot\\tens E_2', why: 'Il termine da confrontare.', val: (v) => T.ddot(T.apply4(A(v), sym(v, 'a')), sym(v, 'b')) },
            {
              tex: '=2\\mu\\,\\tens E_1\\cdot\\tens E_2+\\lambda(\\operatorname{tr}\\tens E_1)\\,\\tens I\\cdot\\tens E_2',
              why: 'Legame di Lamé applicato a $\\tens E_1$.',
              val: (v) => 2 * v.mu * T.ddot(sym(v, 'a'), sym(v, 'b')) + v.la * T.trace(sym(v, 'a')) * T.ddot(T.I3, sym(v, 'b')),
            },
            {
              tex: '=2\\mu\\,\\tens E_2\\cdot\\tens E_1+\\lambda(\\operatorname{tr}\\tens E_1)(\\operatorname{tr}\\tens E_2)',
              why: 'Il prodotto scalare è commutativo e $\\tens I\\cdot\\tens E_2=\\operatorname{tr}\\tens E_2$.',
              ask: { q: 'Quanto vale $\\tens I\\cdot\\tens E_2$?', options: ['$\\operatorname{tr}\\tens E_2$', '$\\det\\tens E_2$', '$|\\tens E_2|$', '$3$'], correct: 0, why: '$\\tens I\\cdot\\tens A=\\delta_{ij}A_{ij}=A_{ii}$.' },
              val: (v) => 2 * v.mu * T.ddot(sym(v, 'b'), sym(v, 'a')) + v.la * T.trace(sym(v, 'a')) * T.trace(sym(v, 'b')),
            },
            {
              tex: '=2\\mu\\,\\tens E_2\\cdot\\tens E_1+\\lambda(\\operatorname{tr}\\tens E_2)\\,\\tens I\\cdot\\tens E_1=\\mathbb A\\tens E_2\\cdot\\tens E_1',
              why: 'Si riscrive $\\operatorname{tr}\\tens E_1=\\tens E_1\\cdot\\tens I$: è il legame di Lamé applicato a $\\tens E_2$. Quindi $\\mathbb A=\\mathbb A^T$.',
              val: (v) => T.ddot(T.apply4(A(v), sym(v, 'b')), sym(v, 'a')),
              eq: 'Teo 4.12.2',
            },
          ],
        },
      },
      {
        id: 'l51-3',
        kind: 'spiega',
        title: 'Perché per gli isotropi non c’è differenza',
        md: `Per gli anisotropi il caso elastico (36 costanti) e quello iperelastico (21) differiscono, perché la simmetria maggiore riduce le costanti. Per gli isotropi no: le costanti sono **2** in entrambi i casi, perché il tensore di Lamé è già simmetrico. Esiste quindi sempre l'energia specifica $\\varphi$.`,
      },
      {
        id: 'l51-4',
        kind: 'derivazione',
        title: 'Legame inverso',
        md: '$\\mathbb A$ è invertibile perché $\\mathbb A\\in\\mathrm{Pos}^+$ (proprietà data per scontata nei materiali). Si esplicita $\\tens E$ dal legame di Lamé; la riga mostrata è la componente 11.',
        source: D(4, '4.12.2', 'Prop 4.12.3', 87),
        der: {
          sample,
          lines: [
            { tex: 'E_{11}', why: 'La deformazione del campione, componente 11.', val: (v) => sym(v, 'a')[0] },
            {
              tex: '\\tens E=\\frac1{2\\mu}\\tens T-\\frac{\\lambda}{2\\mu}(\\operatorname{tr}\\tens E)\\tens I',
              why: 'Si isola $\\tens E$ nel legame di Lamé.',
              val: (v) => TT(v)[0] / (2 * v.mu) - (v.la / (2 * v.mu)) * T.trace(sym(v, 'a')),
            },
            {
              tex: '\\operatorname{tr}\\tens T=(2\\mu+3\\lambda)\\operatorname{tr}\\tens E\\ \\Rightarrow\\ \\operatorname{tr}\\tens E=\\frac{\\operatorname{tr}\\tens T}{2\\mu+3\\lambda}',
              why: 'Traccia del legame di Lamé, con $\\operatorname{tr}\\tens I=3$.',
              ask: { q: 'Che cosa si fa per eliminare $\\operatorname{tr}\\tens E$?', options: ['Si applica la traccia al legame di Lamé', 'Si calcola il determinante', 'Si moltiplica per $\\tens E$', 'Si usa la coassialità'], correct: 0, why: '$\\operatorname{tr}\\tens T=2\\mu\\operatorname{tr}\\tens E+3\\lambda\\operatorname{tr}\\tens E$.' },
            },
            {
              tex: '\\tens E=\\frac1{2\\mu}\\tens T-\\frac{\\lambda}{2\\mu(2\\mu+3\\lambda)}(\\operatorname{tr}\\tens T)\\tens I',
              why: 'Sostituendo: legame costitutivo inverso, valido con $\\mu\\ne0$ e $2\\mu+3\\lambda\\ne0$, coerente con $\\mathbb A\\in\\mathrm{Pos}^+$.',
              val: (v) => TT(v)[0] / (2 * v.mu) - (v.la / (2 * v.mu * (2 * v.mu + 3 * v.la))) * T.trace(TT(v)),
              eq: 'Prop 4.12.3',
            },
          ],
        },
      },
      {
        id: 'l51-5',
        kind: 'spiega',
        title: 'Dimensioni e modulo di comprimibilità',
        md: `1. $\\operatorname{tr}\\tens E=\\Theta$ è adimensionale e $[\\operatorname{tr}\\tens T]=[F][L^{-2}]$: anche $2\\mu+3\\lambda$ è una tensione.
2. Con $\\operatorname{tr}\\tens T=\\sigma_1+\\sigma_2+\\sigma_3=3\\sigma_m$ (tre volte la tensione normale media):

$$\\Theta=\\frac{\\sigma_m}{K},\\qquad K:=\\frac{2\\mu+3\\lambda}3\\ \\text{(bulk modulus)}.$$

La dilatazione volumica dipende solo dalla tensione normale media, attraverso il **modulo di comprimibilità volumetrica** $K$.`,
      },
      {
        id: 'l51-6',
        kind: 'derivazione',
        title: 'Coassialità',
        md: 'Se $\\hat m$ è direzione principale di $\\tens E$ ($\\tens E\\hat m=e\\hat m$), è direzione principale anche di $\\tens T$. Il controllo numerico prende l’autovettore principale massimo della deformazione del campione.',
        source: D(4, '4.12.3', 'Teo 4.12.4', 88),
        der: {
          sample,
          lines: [
            { tex: '\\tens T\\hat m=\\big[2\\mu\\tens E+\\lambda(\\operatorname{tr}\\tens E)\\tens I\\big]\\hat m', why: 'Legame di Lamé.' },
            { tex: '=2\\mu e\\,\\hat m+\\lambda(\\operatorname{tr}\\tens E)\\,\\hat m', why: '$\\tens E\\hat m=e\\hat m$ e $\\tens I\\hat m=\\hat m$.' },
            {
              tex: '=\\big(2\\mu e+\\lambda\\operatorname{tr}\\tens E\\big)\\hat m=s\\,\\hat m',
              why: 'Il coefficiente è uno scalare: $\\hat m$ è autovettore anche di $\\tens T$, con $s=2\\mu e+\\lambda\\operatorname{tr}\\tens E$.',
              eq: 'Teo 4.12.4',
            },
          ],
          checks: [
            {
              what: '$\\tens T\\hat m=s\\hat m$ sulla prima componente',
              f: (v) => {
                const E = sym(v, 'a');
                const { values, vectors } = eigSym(E);
                const m = vectors[0];
                const s = 2 * v.mu * values[0] + v.la * T.trace(E);
                return [T.apply(TT(v), m)[0], s * m[0]];
              },
            },
          ],
        },
      },
      {
        id: 'l51-7',
        kind: 'spiega',
        title: 'Quando la coassialità manca',
        md: `Per un materiale non isotropo la coassialità **non è garantita**. I programmi di calcolo spesso la presumono, e sbagliano con gli anisotropi se in qualche parte del codice l'ipotesi non è stata rimossa.

Esempio della dispensa: una piccola sfera isotropa in compressione isotropa (immersa sott'acqua) diventa una sfera più piccola, omotetica; se fosse trasversalmente isotropa diventerebbe un ellissoide.`,
      },
      {
        id: 'l51-8',
        kind: 'prova',
        title: 'Il provino isotropo',
        md: 'Il diagramma applica una trazione al provino e calcola le deformazioni con il legame inverso.',
        tasks: ['Osserva che il provino si allunga lungo il carico e si contrae nelle due direzioni trasversali, della stessa quantità.', 'Le direzioni principali della deformazione coincidono con quelle della tensione: è la coassialità.'],
        visual: SVG('isotropia', { tab: 'provino' }),
      },
      {
        id: 'l51-9',
        kind: 'domanda',
        q: { id: 'l51-q1', kind: 'scelta', q: 'Il modulo di comprimibilità $K$ lega…', options: ['la dilatazione volumica $\\Theta$ alla tensione normale media $\\sigma_m$', 'lo scorrimento alla tensione tangenziale', 'la dilatazione longitudinale alla tensione monoassiale', 'l’energia alla deformazione'], correct: 0, why: '§4.12.2: $\\Theta=\\sigma_m/K$, $K=(2\\mu+3\\lambda)/3$.' },
      },
      {
        id: 'l51-10',
        kind: 'riassunto',
        md: `**In una frase:** per un isotropo $\\tens T=2\\mu\\tens E+\\lambda(\\operatorname{tr}\\tens E)\\tens I$ con due sole costanti; il tensore è simmetrico (sempre iperelastico), si inverte passando per la traccia e ha direzioni principali comuni a $\\tens T$ ed $\\tens E$.

- Iperelasticità: $\\mathbb A\\tens E_1\\cdot\\tens E_2=2\\mu\\tens E_1\\cdot\\tens E_2+\\lambda\\operatorname{tr}\\tens E_1\\operatorname{tr}\\tens E_2$, simmetrico negli argomenti.
- Inverso: $\\tens E=\\frac1{2\\mu}\\tens T-\\frac{\\lambda}{2\\mu(2\\mu+3\\lambda)}(\\operatorname{tr}\\tens T)\\tens I$.
- $\\Theta=\\sigma_m/K$, $K=(2\\mu+3\\lambda)/3$.
- Coassialità: $\\tens T\\hat m=(2\\mu e+\\lambda\\operatorname{tr}\\tens E)\\hat m$.`,
        orale: ['Teorema di Lamé; dimostrare che l’isotropo è iperelastico; legame inverso; bulk modulus; coassialità. (dispensa, domanda 11)'],
      },
    ],
  },
  // ================================================================== c5.2
  {
    concept: 'c5.2',
    title: 'I moduli tecnici',
    minutes: 18,
    source: D(4, '4.13', undefined, '88–90'),
    visual: SVG('isotropia', { tab: 'provino' }),
    steps: [
      {
        id: 'l52-1',
        kind: 'spiega',
        title: 'Dalla formulazione comoda a quella dell’ingegnere',
        md: `I moduli di Lamé scrivono il legame nel modo più semplice, ma non hanno ($\\lambda$) o hanno poca ($\\mu$) interpretazione fisica: a $\\lambda$ non si associa il risultato di nessuna prova. I **moduli tecnici** invece si leggono direttamente negli esperimenti: l'ingegnere misura, ad esempio, il modulo di Young e usa quello.`,
      },
      {
        id: 'l52-2',
        kind: 'derivazione',
        title: 'Prova monoassiale: E e ν',
        md: 'Provino in trazione con $[\\tens T]=\\operatorname{diag}(s,0,0)$, $s=F/A_0$, e il legame inverso. Il campione usa la $T_{11}$ di una tensione a caso come $s$.',
        source: D(4, '4.13.1', undefined, '88–89'),
        der: {
          sample,
          lines: [
            {
              tex: 'E_{11}=\\frac{s}{2\\mu}-\\frac{\\lambda s}{2\\mu(2\\mu+3\\lambda)}',
              why: 'Legame inverso con $\\operatorname{tr}\\tens T=s$.',
              val: (v) => El.strainIso(tech(v).E, tech(v).nu, [TT(v)[0], 0, 0, 0, 0, 0, 0, 0, 0])[0],
            },
            {
              tex: '=\\frac{2\\mu+2\\lambda}{2\\mu(2\\mu+3\\lambda)}s=\\frac{\\mu+\\lambda}{\\mu(2\\mu+3\\lambda)}s=\\frac sE',
              why: 'Denominatore comune; si definisce il **modulo di Young** $E:=\\frac{\\mu(2\\mu+3\\lambda)}{\\mu+\\lambda}$: è la legge di Hooke $s=E\\varepsilon_1$.',
              val: (v) => (TT(v)[0] * (v.mu + v.la)) / (v.mu * (2 * v.mu + 3 * v.la)),
              eq: '§4.13.1',
            },
          ],
          checks: [
            {
              what: '$E_{22}=-\\frac{\\lambda s}{2\\mu(2\\mu+3\\lambda)}=-\\nu\\frac sE$ con $\\nu=\\frac{\\lambda}{2(\\mu+\\lambda)}$',
              f: (v) => {
                const s = TT(v)[0];
                const { E, nu } = tech(v);
                return [-(v.la * s) / (2 * v.mu * (2 * v.mu + 3 * v.la)), (-nu * s) / E];
              },
            },
          ],
        },
      },
      {
        id: 'l52-3',
        kind: 'spiega',
        title: 'Significato di E e ν',
        md: `- $E$, **modulo di Young** (di elasticità longitudinale): $\\varepsilon_1=s/E$. È una tensione, si misura in Pascal (di solito MPa o GPa).
- $\\nu$, **coefficiente di Poisson** (di contrazione trasversale): $\\varepsilon_2=\\varepsilon_3=-\\nu\\varepsilon_1$, cioè $\\nu=-\\varepsilon_2/\\varepsilon_1$. Le due dilatazioni trasversali sono uguali; il segno meno dice che in trazione il materiale si contrae di lato. È adimensionale.`,
      },
      {
        id: 'l52-4',
        kind: 'derivazione',
        title: 'Scorrimento semplice: G',
        md: 'Torsione di un tubo a parete sottile: $T_{12}=T_{21}=\\tau$, tutte le altre nulle, $\\operatorname{tr}\\tens T=0$.',
        source: D(4, '4.13.2', undefined, 89),
        der: {
          sample,
          lines: [
            { tex: 'E_{12}=\\frac{\\tau}{2\\mu}', why: 'Legame inverso con $\\operatorname{tr}\\tens T=0$: resta solo $\\frac1{2\\mu}\\tens T$.', val: (v) => El.strainIso(tech(v).E, tech(v).nu, [0, TT(v)[1], 0, TT(v)[1], 0, 0, 0, 0, 0])[1] },
            {
              tex: '\\frac{\\gamma_{12}}2=\\frac{\\tau}{2G}\\ \\Rightarrow\\ \\tau=G\\gamma_{12},\\quad G:=\\mu',
              why: 'Con $E_{12}=\\gamma_{12}/2$ e $\\gamma_{12}=\\frac\\pi2-\\theta$: il **modulo di elasticità tangenziale** coincide con $\\mu$.',
              val: (v) => TT(v)[1] / (2 * tech(v).G),
              eq: '§4.13.2',
            },
          ],
        },
      },
      {
        id: 'l52-5',
        kind: 'derivazione',
        title: 'La relazione E = 2G(1 + ν)',
        md: 'Due moduli indipendenti, tre moduli tecnici: uno dipende dagli altri.',
        source: D(4, '4.13.3', undefined, 90),
        der: {
          sample,
          lines: [
            { tex: 'E=\\frac{\\mu(2\\mu+3\\lambda)}{\\mu+\\lambda}', why: 'Definizione.', val: (v) => tech(v).E },
            { tex: '=\\frac{\\mu(2\\mu+2\\lambda+\\lambda)}{\\mu+\\lambda}=2\\mu+\\mu\\frac{\\lambda}{\\mu+\\lambda}', why: 'Si spezza $3\\lambda=2\\lambda+\\lambda$.', val: (v) => 2 * v.mu + (v.mu * v.la) / (v.mu + v.la) },
            {
              tex: '=2G+2G\\nu=2G(1+\\nu)',
              why: '$\\mu=G$ e $\\frac{\\lambda}{\\mu+\\lambda}=2\\nu$.',
              ask: { q: 'A che cosa è uguale $\\lambda/(\\mu+\\lambda)$?', options: ['$2\\nu$', '$\\nu$', '$1+\\nu$', '$E/G$'], correct: 0, why: '$\\nu=\\lambda/(2(\\mu+\\lambda))$.' },
              val: (v) => 2 * tech(v).G * (1 + tech(v).nu),
              eq: '§4.13.3',
            },
          ],
        },
      },
      {
        id: 'l52-6',
        kind: 'spiega',
        title: 'Legami con i moduli tecnici',
        md: `Da $\\frac1{2\\mu}=\\frac1{2G}=\\frac{1+\\nu}E$ e $\\frac{\\lambda}{2\\mu(2\\mu+3\\lambda)}=\\frac\\nu E$:

$$\\tens E=\\frac1E\\big[(1+\\nu)\\tens T-\\nu(\\operatorname{tr}\\tens T)\\tens I\\big],\\qquad E_{ii}=\\frac1E\\big[T_{ii}-\\nu(T_{jj}+T_{kk})\\big],\\quad E_{ij}=\\frac{T_{ij}}{2G}.$$

Le dilatazioni dipendono da tutte le tensioni normali (accoppiamento); gli scorrimenti solo dalla tangenziale omonima (disaccoppiamento).

Legame diretto, con $\\lambda=\\frac{\\nu E}{(1+\\nu)(1-2\\nu)}$ e $2\\mu=\\frac E{1+\\nu}$:

$$\\tens T=\\frac E{1+\\nu}\\Big[\\tens E+\\frac\\nu{1-2\\nu}(\\operatorname{tr}\\tens E)\\tens I\\Big].$$

Conviene misurare $E$ e $\\nu$ con una prova monoassiale e ricavare $G$: una prova a torsione non è affatto facile.`,
      },
      {
        id: 'l52-7',
        kind: 'numeri',
        title: 'L’acciaio in numeri',
        md: `Con $E=205\\,000$ MPa e $\\nu=0{,}3$ il motore dà $G=\\mu=${r0(ST.mu)}$ MPa, $\\lambda=${r0(ST.lambda)}$ MPa e $K=${r0(STK)}$ MPa. Controlla a mente: $2G(1+\\nu)=2\\cdot${r0(ST.mu)}\\cdot1{,}3\\approx205\\,000$. Valori di esempio, non della dispensa.`,
        values: { G: r0(ST.mu), lambda: r0(ST.lambda), K: r0(STK) },
        visual: SVG('isotropia', { tab: 'provino', E: 205000, nu: 0.3 }),
      },
      {
        id: 'l52-8',
        kind: 'domanda',
        q: { id: 'l52-q1', kind: 'vf', q: 'Nel legame con i moduli tecnici lo scorrimento $\\gamma_{12}$ dipende anche dalle tensioni normali.', answer: false, why: '$E_{12}=T_{12}/(2G)$: solo la tangenziale omonima (§4.13.4).' },
      },
      {
        id: 'l52-9',
        kind: 'riassunto',
        md: `**In una frase:** dalla prova monoassiale si leggono $E$ e $\\nu$, dallo scorrimento semplice $G=\\mu$; vale $E=2G(1+\\nu)$ e il legame si riscrive con i moduli tecnici.

- $E=\\frac{\\mu(2\\mu+3\\lambda)}{\\mu+\\lambda}$, $\\nu=\\frac\\lambda{2(\\mu+\\lambda)}$, $G=\\mu$.
- $\\tens E=\\frac1E[(1+\\nu)\\tens T-\\nu(\\operatorname{tr}\\tens T)\\tens I]$.
- $\\tens T=\\frac E{1+\\nu}[\\tens E+\\frac\\nu{1-2\\nu}(\\operatorname{tr}\\tens E)\\tens I]$.`,
        orale: ['Moduli tecnici: definizioni dalle prove, relazione $E=2G(1+\\nu)$, legami con i moduli tecnici. (dispensa, domanda 12)'],
      },
    ],
  },
  // ================================================================== c5.3
  {
    concept: 'c5.3',
    title: 'Energia e restrizioni di plausibilità',
    minutes: 24,
    source: D(4, '4.14–4.15', 'Prop 4.14.1', '91–94'),
    visual: SVG('isotropia', { tab: 'nu' }),
    steps: [
      {
        id: 'l53-1',
        kind: 'derivazione',
        title: 'φ in funzione della deformazione',
        md: 'L’isotropo è iperelastico, quindi $\\varphi=\\frac12\\mathbb A\\tens E\\cdot\\tens E$. Il campione calcola l’energia con il tensore di Lamé completo.',
        source: D(4, '4.14', 'Prop 4.14.1', 91),
        der: {
          sample,
          lines: [
            { tex: '\\varphi=\\tfrac12\\mathbb A\\tens E\\cdot\\tens E', why: 'Formula di rappresentazione.', val: (v) => phiE(v, sym(v, 'a')) },
            { tex: '=\\tfrac12\\big[2\\mu\\tens E+\\lambda(\\operatorname{tr}\\tens E)\\tens I\\big]\\cdot\\tens E', why: 'Legame di Lamé.', val: (v) => 0.5 * T.ddot(TT(v), sym(v, 'a')) },
            {
              tex: '=\\mu\\,\\tens E\\cdot\\tens E+\\tfrac\\lambda2(\\operatorname{tr}\\tens E)^2',
              why: '$\\tens I\\cdot\\tens E=\\operatorname{tr}\\tens E$.',
              val: (v) => v.mu * T.ddot(sym(v, 'a'), sym(v, 'a')) + (v.la / 2) * T.trace(sym(v, 'a')) ** 2,
              eq: 'Prop 4.14.1',
            },
            {
              tex: '=\\big(\\mu+\\tfrac\\lambda2\\big)(e_1^2+e_2^2+e_3^2)+\\lambda(e_1e_2+e_2e_3+e_3e_1)',
              why: 'Nel riferimento principale (comune a $\\tens T$ ed $\\tens E$ per la coassialità): $\\tens E\\cdot\\tens E=\\sum e_i^2$, $(\\operatorname{tr}\\tens E)^2=\\sum e_i^2+2\\sum e_ie_j$.',
              val: (v) => {
                const [a, b, c] = eigSym(sym(v, 'a')).values;
                return (v.mu + v.la / 2) * (a * a + b * b + c * c) + v.la * (a * b + b * c + c * a);
              },
            },
          ],
        },
      },
      {
        id: 'l53-2',
        kind: 'derivazione',
        title: 'φ in funzione della tensione',
        md: 'Con il legame invertibile $\\varphi=\\frac12\\mathbb A^{-1}\\tens T\\cdot\\tens T$; l’espressione con i moduli tecnici è la più usata.',
        source: D(4, '4.14', 'Prop 4.14.1', 91),
        der: {
          sample,
          lines: [
            { tex: '\\varphi=\\tfrac12\\tens T\\cdot\\tens E', why: 'Rappresentazione, con $\\tens T=\\mathbb A\\tens E$.', val: (v) => 0.5 * T.ddot(TT(v), sym(v, 'a')) },
            {
              tex: '=\\tfrac12\\tens T\\cdot\\tfrac1E\\big[(1+\\nu)\\tens T-\\nu(\\operatorname{tr}\\tens T)\\tens I\\big]=\\frac{1+\\nu}{2E}\\tens T\\cdot\\tens T-\\frac\\nu{2E}(\\operatorname{tr}\\tens T)^2',
              why: 'Legame inverso con i moduli tecnici.',
              val: (v) => {
                const { E, nu } = tech(v);
                const S = TT(v);
                return ((1 + nu) / (2 * E)) * T.ddot(S, S) - (nu / (2 * E)) * T.trace(S) ** 2;
              },
            },
            {
              tex: '=\\frac1{2E}(s_1^2+s_2^2+s_3^2)-\\frac\\nu E(s_1s_2+s_2s_3+s_3s_1)',
              why: 'Nel riferimento principale: $\\frac{1+\\nu}{2E}\\sum s_i^2-\\frac\\nu{2E}\\big(\\sum s_i^2+2\\sum s_is_j\\big)$.',
              val: (v) => {
                const { E, nu } = tech(v);
                const s = eigSym(TT(v)).values as [number, number, number];
                return El.energyPrincipal(E, nu, s);
              },
              eq: 'Prop 4.14.1',
            },
          ],
        },
      },
      {
        id: 'l53-3',
        kind: 'spiega',
        title: 'Perché servono restrizioni',
        md: `In una dimensione il legame è $\\sigma=E\\varepsilon$. Con $E<0$ a una trazione corrisponderebbe una contrazione: la formula funziona per qualsiasi valore, ma non descrive nulla di reale. Bisogna dire che $E>0$.

In tre dimensioni al posto di $E$ c'è il tensore elastico, e la restrizione è

$$\\mathbb A\\in\\mathrm{Pos}^+\\iff\\mathbb A\\tens E\\cdot\\tens E>0\\quad\\forall\\tens E\\in\\mathrm{Sym}-\\{\\tens O\\}.$$

Per un iperelastico significa $\\varphi(\\tens E)>0$: per passare dalla configurazione naturale a una deformata **bisogna spendere lavoro** (rilasciando la causa è il corpo a restituirlo). Inoltre $\\mathbb A$ è invertibile.`,
      },
      {
        id: 'l53-4',
        kind: 'derivazione',
        title: 'Sylvester: le condizioni sui moduli di Lamé',
        md: 'Si chiede che $\\varphi(\\tens E)$ sia definita positiva come forma quadratica in $(e_1,e_2,e_3)$.',
        source: D(4, '4.15.2', undefined, '92–93'),
        der: {
          sample,
          lines: [
            { tex: '\\varphi=\\big(\\mu+\\tfrac\\lambda2\\big)(e_1^2+e_2^2+e_3^2)+\\tfrac\\lambda2(2e_1e_2+2e_2e_3+2e_3e_1)', why: 'Si moltiplica e divide per 2 il secondo termine: quadrati in diagonale, doppi prodotti fuori.' },
            { tex: '[A]=\\begin{bmatrix}\\mu+\\frac\\lambda2&\\frac\\lambda2&\\frac\\lambda2\\\\\\frac\\lambda2&\\mu+\\frac\\lambda2&\\frac\\lambda2\\\\\\frac\\lambda2&\\frac\\lambda2&\\mu+\\frac\\lambda2\\end{bmatrix},\\quad\\varphi=\\{x\\}^T[A]\\{x\\}', why: 'Matrice dei coefficienti.' },
            {
              tex: '\\mu+\\tfrac\\lambda2>0,\\quad\\big(\\mu+\\tfrac\\lambda2\\big)^2-\\tfrac{\\lambda^2}4=\\mu(\\mu+\\lambda)>0,\\quad\\det[A]=\\mu^2\\big(\\mu+\\tfrac32\\lambda\\big)>0',
              why: 'Criterio di Sylvester: i minori principali di ordine 1, 2, 3 devono essere positivi.',
              ask: { q: 'Quale criterio dà la definitezza positiva dai minori principali?', options: ['Sylvester', 'Hadamard', 'Kirchhoff', 'Schwarz'], correct: 0, why: '§4.15.2.' },
            },
            { tex: '2\\mu+\\lambda>0,\\quad\\mu>0,\\quad2\\mu+3\\lambda>0', why: 'Dalla seconda: essendo $\\mu+\\frac\\lambda2>\\frac\\lambda2$, deve essere $\\mu>0$; nella terza $\\mu^2>0$.' },
            { tex: '\\mu>0,\\qquad2\\mu+3\\lambda>0', why: 'Con $\\mu>0$: se $\\lambda>0$ valgono entrambe; se $\\lambda<0$, $2\\mu+3\\lambda>0$ implica $2\\mu+\\lambda>0$.', eq: '§4.15.2' },
          ],
          checks: [
            { what: 'minore di ordine 2 $=\\mu(\\mu+\\lambda)$', f: (v) => [El.sylvester(v.mu, v.la).m2, v.mu * (v.mu + v.la)] },
            { what: '$\\det[A]=\\mu^2(\\mu+\\frac32\\lambda)$', f: (v) => [El.sylvester(v.mu, v.la).m3, v.mu * v.mu * (v.mu + 1.5 * v.la)] },
          ],
        },
      },
      {
        id: 'l53-5',
        kind: 'derivazione',
        title: 'Le stesse condizioni con i moduli tecnici',
        md: 'Catena di passaggi logici a partire da $\\mu>0$ e $2\\mu+3\\lambda>0$.',
        source: D(4, '4.15.3', undefined, 93),
        der: {
          lines: [
            { tex: 'G=\\mu>0', why: 'Immediato.' },
            { tex: '\\lambda>-\\tfrac23\\mu\\ \\Rightarrow\\ \\mu+\\lambda>\\tfrac13\\mu>0\\ \\Rightarrow\\ E=\\frac{\\mu(2\\mu+3\\lambda)}{\\mu+\\lambda}>0', why: 'Numeratore positivo; il denominatore lo è per la seconda condizione.' },
            { tex: 'G=\\frac E{2(1+\\nu)}>0\\ \\Rightarrow\\ \\nu>-1', why: 'Con $G>0$ ed $E>0$ deve essere $1+\\nu>0$.' },
            {
              tex: '\\operatorname{tr}\\tens E=\\frac{1-2\\nu}E\\operatorname{tr}\\tens T\\ \\Rightarrow\\ \\nu<\\tfrac12',
              why: 'Poiché $\\operatorname{tr}\\tens E=\\frac{\\operatorname{tr}\\tens T}{2\\mu+3\\lambda}$, le due tracce hanno lo stesso segno; dalla traccia del legame tecnico serve $1-2\\nu>0$.',
              ask: { q: 'Da dove viene il limite $\\nu<\\frac12$?', options: ['$\\operatorname{tr}\\tens E$ e $\\operatorname{tr}\\tens T$ devono avere lo stesso segno', 'Da $E>0$', 'Da $G>0$', 'Dalla coassialità'], correct: 0, why: '§4.15.3.' },
              eq: '§4.15.3',
            },
          ],
        },
      },
      {
        id: 'l53-6',
        kind: 'spiega',
        title: 'Limiti teorici e limiti pratici',
        md: `Limiti teorici: $E>0$, $G>0$, $-1<\\nu<\\frac12$. Limiti pratici: $E>0$, $G>0$, $0<\\nu\\le\\frac12$.

- $E$ e $G$ non possono essere nulli: con $E\\to0$, $\\varepsilon=\\sigma/E\\to\\infty$; con $G\\to0$, $\\gamma=\\tau/G\\to\\infty$.
- Con $\\nu<0$ un provino in trazione si **dilaterebbe** di lato: nei materiali naturali non succede. Esistono però metamateriali progettati (anche stampati in 3D), i **materiali auxetici**: guarnizioni che si accomodano in un solco, filtri per onde, isolamento acustico, assorbimento della radiazione elettromagnetica. Per questo $\\mathbb A\\in\\mathrm{Pos}^+$ non basta a escludere tutto ciò che non è naturale.
- Con $\\nu\\to\\frac12$: $\\Theta=\\frac{1-2\\nu}E3\\sigma_m\\to0$ per ogni stato, materiale **incomprimibile** (gomme, biotessuti). È un valore limite ($\\lambda,K\\to+\\infty$ a $\\mu$ fissato): per questo nei limiti teorici c'è $<$ e in quelli pratici $\\le$.`,
      },
      {
        id: 'l53-7',
        kind: 'prova',
        title: 'Muovi ν',
        md: 'Nel diagramma il cursore cambia il coefficiente di Poisson e mostra le conseguenze sui moduli e sul provino.',
        tasks: ['Segui la curva $K/E=1/(3(1-2\\nu))$: per ν → ½ cresce senza limite, il volume non cambia più.', 'Confronta la fascia teorica (−1 < ν < ½) con quella pratica (0 < ν ≤ ½).', 'Nella scheda del provino porta ν sotto zero: in trazione il provino si allarga di lato (auxetico).'],
        visual: SVG('isotropia', { tab: 'nu' }),
      },
      {
        id: 'l53-8',
        kind: 'domanda',
        q: { id: 'l53-q1', kind: 'scelta', q: 'Quali sono i limiti pratici dei moduli tecnici?', options: ['$E>0$, $G>0$, $0<\\nu\\le\\frac12$', '$E>0$, $G>0$, $-1<\\nu<\\frac12$', '$E\\ge0$, $G\\ge0$, $0\\le\\nu\\le1$', '$\\mu>0$, $2\\mu+3\\lambda>0$'], correct: 0, why: '§4.15.1: i teorici sono $-1<\\nu<\\frac12$; i pratici escludono gli auxetici e includono l’incomprimibile.' },
      },
      {
        id: 'l53-9',
        kind: 'riassunto',
        md: `**In una frase:** $\\varphi$ si scrive in $\\tens E$ o in $\\tens T$ (con Lamé o con i moduli tecnici); chiedere $\\varphi>0$ (Sylvester) dà $\\mu>0$, $2\\mu+3\\lambda>0$, cioè $E>0$, $G>0$, $-1<\\nu<\\frac12$.

- $\\varphi(\\tens E)=\\mu\\tens E\\cdot\\tens E+\\frac\\lambda2(\\operatorname{tr}\\tens E)^2$; $\\varphi(\\tens T)=\\frac{1+\\nu}{2E}\\tens T\\cdot\\tens T-\\frac\\nu{2E}(\\operatorname{tr}\\tens T)^2$.
- Minori: $\\mu+\\frac\\lambda2$, $\\mu(\\mu+\\lambda)$, $\\mu^2(\\mu+\\frac32\\lambda)$.
- $\\nu<0$ auxetici (metamateriali); $\\nu\\to\\frac12$ incomprimibile.`,
        orale: ['Espressioni di $\\varphi$; restrizioni di plausibilità fisica e dimostrazioni; $\\nu<0$ (auxetici) e $\\nu\\to\\frac12$ (incomprimibilità). (dispensa, domanda 13)'],
      },
    ],
  },
  // ================================================================== c5.4
  {
    concept: 'c5.4',
    title: 'Il problema elastico',
    minutes: 16,
    source: D(4, '4.16.1–4.16.3', 'Def 4.16.1', '94–96'),
    visual: SVG('problema'),
    steps: [
      {
        id: 'l54-1',
        kind: 'spiega',
        title: 'Tre ingredienti, un problema',
        md: `Deformazione (cinematica), tensione (statica) e legame (materiale) sono stati sviluppati separatamente. Ora si mettono insieme per descrivere la risposta di un solido elastico. Formulare un problema significa sapere **che cosa si assegna**, **quali equazioni** si hanno e **che cosa si cerca**.

**Dati:** geometria ($\\mathcal B$, $\\partial\\mathcal B=\\partial\\mathcal B_v\\cup\\partial\\mathcal B_\\ell$, disgiunte); carichi ($\\vet b$ in $\\mathcal B$, $\\hat{\\vet s}$ su $\\partial\\mathcal B_\\ell$); vincoli ($\\vet u=\\hat{\\vet u}$ su $\\partial\\mathcal B_v$, una condizione matematica sugli spostamenti); materiale ($\\mathbb A(x)$, anche variabile da punto a punto).

**Incognita:** lo stato elastico $\\{\\vet u(x),\\tens E(x),\\tens T(x)\\}$ in ogni punto.`,
      },
      {
        id: 'l54-2',
        kind: 'spiega',
        title: 'Equazioni di campo e al contorno',
        md: `$$\\tens E=\\tfrac12(\\nabla\\vet u+\\nabla\\vet u^T)\\ \\text{(congruenza)},\\quad\\tens T=\\mathbb A\\tens E\\ \\text{(legame)},\\quad\\operatorname{div}\\tens T+\\vet b=\\vet 0,\\ \\tens T=\\tens T^T\\ \\text{(equilibrio)}$$

$$\\hat{\\vet s}=\\tens T\\hat n\\ \\text{su }\\partial\\mathcal B_\\ell,\\qquad\\vet u=\\hat{\\vet u}\\ \\text{su }\\partial\\mathcal B_v.$$

Tipi di problema:
1. $\\partial\\mathcal B_v\\equiv\\partial\\mathcal B$: **negli spostamenti** (trave a doppio incastro con cedimento imposto);
2. $\\partial\\mathcal B_\\ell\\equiv\\partial\\mathcal B$: **nelle forze** (aereo in volo);
3. entrambe non vuote: **misto**.`,
      },
      {
        id: 'l54-3',
        kind: 'spiega',
        title: 'L’analogia con la trave',
        md: `Mensola incastrata in A, libera in B, con forza $F$ in B e carico $p(z)$ lungo l'asse. Il corpo è $[0,L]$; A fa da frontiera vincolata ($\\hat w=0$), B da frontiera libera ($N(L)=F$).

$$\\varepsilon=w'\\ \\text{(congruenza)},\\quad N=EA\\,\\varepsilon\\ \\text{(legame)},\\quad N'=-p\\ \\text{(equilibrio)};\\qquad w(0)=0,\\ N(L)=F.$$

La soluzione $\\{w,\\varepsilon,N\\}$ corrisponde a $\\{\\vet u,\\tens E,\\tens T\\}$. Nella trave le grandezze sono scalari e c'è una sola variabile: equazioni differenziali **ordinarie**; nel solido vettori e tensori: equazioni **alle derivate parziali**.`,
      },
      {
        id: 'l54-4',
        kind: 'numeri',
        title: 'Conta equazioni e incognite',
        md: `Incognite: $\\vet u$ (3) + $\\tens E$ (6) + $\\tens T$ (9) = **18**. Equazioni: congruenza (6) + legame (9) + equilibrio alla traslazione (3) = **18**. Imponendo a parte la simmetria di $\\tens T$: **15** e **15**. Il bilancio torna, ma non garantisce che il problema sia risolvibile.`,
        values: { incognite: 18, equazioni: 18, ridotte: 15 },
        visual: SVG('problema'),
      },
      {
        id: 'l54-5',
        kind: 'spiega',
        title: 'Buona posizione',
        md: `**Def 4.16.1 (Hadamard).** Un problema alle derivate parziali è ben posto se la soluzione
- **esiste** (da sapere prima di affidarsi al calcolatore, che restituisce comunque un numero);
- è **unica** (un'equazione di terzo grado ha tre soluzioni: va scelta quella con senso fisico);
- è **stabile**: piccole variazioni dei dati danno piccole variazioni della soluzione.

Esempio di instabilità: un arco ribassato caricato al centro può saltare di configurazione (snap-through); spesso l'instabilità precede il collasso.

Il **teorema di unicità di Kirchhoff** è solo richiamato nella dispensa, senza dimostrazione: se $\\mathbb A\\in\\mathrm{Pos}^+$ la soluzione è unica in $\\tens E$ e $\\tens T$; lo spostamento è unico se $\\partial\\mathcal B_v\\ne\\emptyset$, altrimenti a meno di uno spostamento rigido infinitesimo. Qui la condizione di plausibilità mostra la sua importanza.`,
      },
      {
        id: 'l54-6',
        kind: 'prova',
        title: 'Frontiera vincolata e libera',
        md: 'Il diagramma mostra il corpo con le due porzioni di frontiera.',
        tasks: ['Riconosci dove si assegnano gli spostamenti e dove le forze.', 'Passa da problema misto a problema nelle forze e negli spostamenti.'],
        visual: SVG('problema'),
      },
      {
        id: 'l54-7',
        kind: 'domanda',
        q: { id: 'l54-q1', kind: 'scelta', q: 'Una trave a doppio incastro con un cedimento imposto è un problema…', options: ['negli spostamenti', 'nelle forze', 'misto', 'mal posto'], correct: 0, why: '§4.16.1: tutta la frontiera significativa è vincolata, con spostamenti assegnati.' },
      },
      {
        id: 'l54-8',
        kind: 'riassunto',
        md: `**In una frase:** il problema elastico assegna geometria, carichi, vincoli e materiale e cerca $\\{\\vet u,\\tens E,\\tens T\\}$ con congruenza, legame ed equilibrio nel corpo e condizioni su $\\partial\\mathcal B_\\ell$ e $\\partial\\mathcal B_v$.

- Tipi: negli spostamenti, nelle forze, misto.
- Trave: $\\varepsilon=w'$, $N=EA\\varepsilon$, $N'=-p$.
- 18 equazioni in 18 incognite (15 e 15); Hadamard: esistenza, unicità, stabilità.`,
        orale: ['Problema elastico: dati, equazioni, tipi di problema; analogia con la trave; 18 equazioni; buona posizione. (dispensa, domanda 14, prima parte)'],
      },
    ],
  },
  // ================================================================== c5.5
  {
    concept: 'c5.5',
    title: 'Sovrapposizione e non linearità dell’energia',
    minutes: 14,
    source: D(4, '4.16.4–4.16.5', 'Teo 4.16.2, Teo 4.16.3', '96–97'),
    visual: SVG('cammino'),
    steps: [
      {
        id: 'l55-1',
        kind: 'spiega',
        title: 'Il teorema di sovrapposizione',
        md: `**Teo 4.16.2.** Se ai dati $\\{\\vet b_1,\\hat{\\vet s}_1,\\hat{\\vet u}_1\\}$ corrisponde la soluzione $\\{\\vet u_1,\\tens E_1,\\tens T_1\\}$ e ai dati $\\{\\vet b_2,\\hat{\\vet s}_2,\\hat{\\vet u}_2\\}$ la soluzione $\\{\\vet u_2,\\tens E_2,\\tens T_2\\}$, allora per ogni $\\alpha,\\beta$ lo stato $\\{\\alpha\\vet u_1+\\beta\\vet u_2,\\ \\alpha\\tens E_1+\\beta\\tens E_2,\\ \\alpha\\tens T_1+\\beta\\tens T_2\\}$ risolve il problema con i dati combinati allo stesso modo.

La dimostrazione è immediata: tutte le equazioni del problema sono lineari.
1. $\\beta=0$: una forza $2F$ inflette la trave di $2\\delta$ (solo perché il problema è lineare).
2. $\\alpha=\\beta=1$: un telaio con $F_1$ e $F_2$ si studia come somma dei due casi. Con un problema non lineare (ad esempio con attrito) l'ordine dei carichi cambia la soluzione.`,
      },
      {
        id: 'l55-2',
        kind: 'derivazione',
        title: 'Il legame rispetta la sovrapposizione',
        md: 'Controllo numerico di uno degli ingredienti: il legame isotropo applicato a $\\alpha\\tens E_1+\\beta\\tens E_2$ (componente 11).',
        source: D(4, '4.16.4', 'Teo 4.16.2', 96),
        der: {
          sample,
          lines: [
            { tex: '\\mathbb A[\\alpha\\tens E_1+\\beta\\tens E_2]_{11}', why: 'Tensione dello stato combinato.', val: (v) => El.stressIso(v.mu, v.la, T.add(T.scale(sym(v, 'a'), v.al), T.scale(sym(v, 'b'), v.be)))[0] },
            {
              tex: '=\\alpha(\\mathbb A\\tens E_1)_{11}+\\beta(\\mathbb A\\tens E_2)_{11}',
              why: 'Linearità di $\\mathbb A$; allo stesso modo sono lineari congruenza ed equilibrio.',
              val: (v) => v.al * El.stressIso(v.mu, v.la, sym(v, 'a'))[0] + v.be * El.stressIso(v.mu, v.la, sym(v, 'b'))[0],
              eq: 'Teo 4.16.2',
            },
          ],
        },
      },
      {
        id: 'l55-3',
        kind: 'derivazione',
        title: 'L’energia non si sovrappone',
        md: 'Se si parla di energia il materiale è iperelastico: $\\mathbb A=\\mathbb A^T$.',
        source: D(4, '4.16.5', 'Teo 4.16.3', 97),
        der: {
          sample,
          lines: [
            { tex: '\\varphi(\\tens E_1+\\tens E_2)=\\tfrac12\\mathbb A[\\tens E_1+\\tens E_2]\\cdot(\\tens E_1+\\tens E_2)', why: 'Definizione.', val: (v) => phiE(v, T.add(sym(v, 'a'), sym(v, 'b'))) },
            {
              tex: '=\\tfrac12\\big(\\mathbb A\\tens E_1\\cdot\\tens E_1+\\mathbb A\\tens E_1\\cdot\\tens E_2+\\mathbb A\\tens E_2\\cdot\\tens E_1+\\mathbb A\\tens E_2\\cdot\\tens E_2\\big)',
              why: 'Si sviluppa il prodotto.',
              val: (v) => {
                const [a, b, M] = [sym(v, 'a'), sym(v, 'b'), A(v)];
                return 0.5 * (T.ddot(T.apply4(M, a), a) + T.ddot(T.apply4(M, a), b) + T.ddot(T.apply4(M, b), a) + T.ddot(T.apply4(M, b), b));
              },
            },
            {
              tex: '=\\varphi(\\tens E_1)+\\varphi(\\tens E_2)+\\mathbb A\\tens E_1\\cdot\\tens E_2',
              why: 'Con $\\mathbb A=\\mathbb A^T$ i due termini misti sono uguali: resta il **termine di accoppiamento**.',
              ask: { q: 'Perché i due termini misti si sommano?', options: ['Perché $\\mathbb A=\\mathbb A^T$', 'Perché $\\tens E_1=\\tens E_2$', 'Perché il materiale è isotropo', 'Perché $\\varphi$ è lineare'], correct: 0, why: 'Simmetria maggiore: $\\mathbb A\\tens E_1\\cdot\\tens E_2=\\mathbb A\\tens E_2\\cdot\\tens E_1$.' },
              val: (v) => phiE(v, sym(v, 'a')) + phiE(v, sym(v, 'b')) + T.ddot(T.apply4(A(v), sym(v, 'a')), sym(v, 'b')),
              eq: 'Teo 4.16.3',
            },
          ],
        },
      },
      {
        id: 'l55-4',
        kind: 'prova',
        title: 'Lavoro e cammino',
        md: 'Il diagramma del cammino di deformazione (lezione sull’iperelasticità) ricorda che il lavoro speso è $\\varphi(\\tens E^*)=\\frac12\\mathbb A\\tens E^*\\cdot\\tens E^*$: quadratico nello stato finale.',
        tasks: ['Leggi il lavoro lungo i tre cammini: coincide con $\\frac12\\mathbb A\\tens E^*\\cdot\\tens E^*$.', 'Passaggio aggiunto: essendo quadratico, per uno stato doppio il lavoro quadruplica; è la stessa ragione del termine di accoppiamento.'],
        visual: SVG('cammino'),
      },
      {
        id: 'l55-5',
        kind: 'domanda',
        q: { id: 'l55-q1', kind: 'vf', q: 'Con l’attrito la sovrapposizione degli effetti continua a valere, purché i carichi siano piccoli.', answer: false, why: '§4.16.4: l’attrito rende il problema non lineare; l’ordine di applicazione dei carichi cambia la soluzione.' },
      },
      {
        id: 'l55-6',
        kind: 'riassunto',
        md: `**In una frase:** in un problema elastico lineare le soluzioni si sommano come i dati, ma l'energia no: $\\varphi(\\tens E_1+\\tens E_2)=\\varphi_1+\\varphi_2+\\mathbb A\\tens E_1\\cdot\\tens E_2$.

- Sovrapposizione: conseguenza della linearità di tutte le equazioni.
- Accoppiamento: i due termini misti coincidono per $\\mathbb A=\\mathbb A^T$.`,
        orale: ['Problema elastico: sovrapposizione; non linearità di $\\varphi$. (dispensa, domanda 14, seconda parte)'],
      },
    ],
  },
];
