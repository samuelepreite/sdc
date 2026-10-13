/**
 * Domande d'orale del Cap. 4, parte M5 (§4.12–4.16): domande 11–14 del riquadro «Per l'orale» (p. 98) più tre dedotte.
 */
import type { OralQ } from '../types';
import { P4 } from '../m4/orale';

export const M5_ORALE: OralQ[] = [
  {
    id: 'o5.1',
    kind: 'espositiva',
    q: 'Teorema di Lamé; dimostrare che l’isotropo è iperelastico; legame inverso; bulk modulus; coassialità.',
    concepts: ['c5.1'],
    source: P4(11),
    scaletta: [
      'Isotropia: ogni $\\tens Q\\in\\mathrm{Orth}$ è di simmetria; Lamé $\\tens T=2\\mu\\tens E+\\lambda(\\operatorname{tr}\\tens E)\\tens I$ (Teo 4.12.1), in componenti con $\\delta_{ij}$.',
      'Iperelastico: $\\mathbb A\\tens E_1\\cdot\\tens E_2=2\\mu\\tens E_1\\cdot\\tens E_2+\\lambda\\operatorname{tr}\\tens E_1\\operatorname{tr}\\tens E_2$, simmetrico (Teo 4.12.2).',
      'Inverso: traccia del legame, $\\operatorname{tr}\\tens E=\\operatorname{tr}\\tens T/(2\\mu+3\\lambda)$, poi Prop 4.12.3.',
      'Bulk modulus: $\\Theta=\\sigma_m/K$, $K=(2\\mu+3\\lambda)/3$; dimensioni.',
      'Coassialità: $\\tens T\\hat m=(2\\mu e+\\lambda\\operatorname{tr}\\tens E)\\hat m$ (Teo 4.12.4); non vale per gli anisotropi (sfera sott’acqua).',
    ],
    lavagna: [
      { tex: '\\tens T=2\\mu\\tens E+\\lambda(\\operatorname{tr}\\tens E)\\tens I', rif: 'Teo 4.12.1' },
      { tex: '\\tens E=\\frac1{2\\mu}\\tens T-\\frac{\\lambda}{2\\mu(2\\mu+3\\lambda)}(\\operatorname{tr}\\tens T)\\tens I', rif: 'Prop 4.12.3' },
    ],
  },
  {
    id: 'o5.2',
    kind: 'espositiva',
    q: 'Moduli tecnici: definizioni dalle prove, relazione $E=2G(1+\\nu)$, legami con i moduli tecnici.',
    concepts: ['c5.2'],
    source: P4(12),
    scaletta: [
      'Perché: $\\lambda$ non ha interpretazione fisica, i moduli tecnici si leggono nelle prove.',
      'Monoassiale con il legame inverso: $E=\\frac{\\mu(2\\mu+3\\lambda)}{\\mu+\\lambda}$, $\\nu=\\frac\\lambda{2(\\mu+\\lambda)}$, $\\nu=-\\varepsilon_2/\\varepsilon_1$.',
      'Scorrimento semplice (tubo in torsione): $\\tau=G\\gamma_{12}$, $G=\\mu$.',
      '$E=2\\mu+\\mu\\frac\\lambda{\\mu+\\lambda}=2G(1+\\nu)$; si misurano $E$, $\\nu$ e si ricava $G$.',
      'Legame inverso e diretto con i moduli tecnici; accoppiamento delle dilatazioni, disaccoppiamento degli scorrimenti.',
    ],
    lavagna: [
      { tex: 'E=2G(1+\\nu)', rif: '§4.13.3' },
      { tex: '\\tens E=\\frac1E\\big[(1+\\nu)\\tens T-\\nu(\\operatorname{tr}\\tens T)\\tens I\\big]', rif: '§4.13.4' },
    ],
    figura: 'Lo scorrimento semplice con l’angolo θ e γ₁₂/2 (p. 89).',
  },
  {
    id: 'o5.3',
    kind: 'espositiva',
    q: 'Espressioni di $\\varphi$; restrizioni di plausibilità fisica e dimostrazioni; $\\nu<0$ (auxetici) e $\\nu\\to\\frac12$ (incomprimibilità).',
    concepts: ['c5.3'],
    source: P4(13),
    scaletta: [
      '$\\varphi(\\tens E)=\\mu\\tens E\\cdot\\tens E+\\frac\\lambda2(\\operatorname{tr}\\tens E)^2$, $\\varphi(\\tens T)=\\frac{1+\\nu}{2E}\\tens T\\cdot\\tens T-\\frac\\nu{2E}(\\operatorname{tr}\\tens T)^2$ e forme principali (Prop 4.14.1).',
      'Motivazione 1D ($E>0$) e $\\mathbb A\\in\\mathrm{Pos}^+$: per deformare si spende lavoro.',
      'Sylvester sulla matrice dei coefficienti: $\\mu>0$, $2\\mu+3\\lambda>0$.',
      'Moduli tecnici: $G>0$, $E>0$, $\\nu>-1$, $\\nu<\\frac12$ (segno delle tracce).',
      'Limiti pratici $0<\\nu\\le\\frac12$: auxetici (metamateriali) e incomprimibile ($\\Theta=0$, gomme).',
    ],
    lavagna: [
      { tex: '\\mathbb A\\in\\mathrm{Pos}^+\\iff\\mu>0,\\ 2\\mu+3\\lambda>0\\iff E>0,\\ G>0,\\ -1<\\nu<\\tfrac12', rif: '§4.15.1' },
      { tex: '\\det[A]=\\mu^2\\big(\\mu+\\tfrac32\\lambda\\big)', rif: '§4.15.2' },
    ],
  },
  {
    id: 'o5.4',
    kind: 'espositiva',
    q: 'Problema elastico: dati, equazioni, tipi di problema; analogia con la trave; 18 equazioni; buona posizione; sovrapposizione; non linearità di $\\varphi$.',
    concepts: ['c5.4', 'c5.5'],
    source: P4(14),
    scaletta: [
      'Dati: geometria, carichi, vincoli, materiale; incognite $\\{\\vet u,\\tens E,\\tens T\\}$.',
      'Equazioni di campo (congruenza, legame, equilibrio) e al contorno; problemi negli spostamenti, nelle forze, misto.',
      'Analogia con la mensola: $\\varepsilon=w\'$, $N=EA\\varepsilon$, $N\'=-p$; ODE contro PDE.',
      '18 equazioni in 18 incognite (15 e 15); Hadamard: esistenza, unicità, stabilità (snap-through); Kirchhoff richiamato.',
      'Sovrapposizione dalla linearità (Teo 4.16.2); $\\varphi(\\tens E_1+\\tens E_2)=\\varphi_1+\\varphi_2+\\mathbb A\\tens E_1\\cdot\\tens E_2$ (Teo 4.16.3).',
    ],
    lavagna: [{ tex: '\\varphi(\\tens E_1+\\tens E_2)=\\varphi(\\tens E_1)+\\varphi(\\tens E_2)+\\mathbb A\\tens E_1\\cdot\\tens E_2', rif: 'Teo 4.16.3' }],
    figura: 'Il corpo con ∂B_v e ∂B_ℓ (p. 94) e la mensola con p(z) e F (p. 95).',
  },
  {
    id: 'o5.5',
    kind: 'collegamento',
    q: 'Che cosa ha in comune la coassialità degli isotropi con le direzioni principali dei Capitoli 2 e 3?',
    concepts: ['c5.1', 'c3.6'],
    source: { kind: 'deduzione', da: '§2.6, §3.11, §4.12.3', spiegazione: 'La dispensa studia separatamente le direzioni principali di deformazione e di tensione; la coassialità le fa coincidere: la domanda chiede di ricucire i tre capitoli.' },
    scaletta: [
      'Cap. 2: direzioni principali di $\\tens E$, nessuno scorrimento tra loro.',
      'Cap. 3: direzioni principali di $\\tens T$, giaciture senza tangenziale.',
      'Cap. 4: per un isotropo coincidono (Teo 4.12.4), quindi un solo riferimento principale.',
      'Per gli anisotropi no: la sfera diventa un ellissoide sotto pressione uniforme.',
    ],
  },
  {
    id: 'o5.6',
    kind: 'trabocchetto',
    q: 'Se $\\mathbb A\\in\\mathrm{Pos}^+$, un coefficiente di Poisson negativo è escluso?',
    concepts: ['c5.3'],
    source: { kind: 'deduzione', da: '§4.15.3–4.15.4', spiegazione: 'La dispensa sottolinea che i limiti teorici ammettono $-1<\\nu<0$ e che li escludono solo i limiti pratici.' },
    scaletta: [
      'No: $\\mathbb A\\in\\mathrm{Pos}^+$ dà $-1<\\nu<\\frac12$, che include valori negativi.',
      'Con $\\nu<0$ un provino in trazione si dilaterebbe di lato: non accade nei materiali naturali.',
      'Esistono però i metamateriali auxetici; per i materiali da costruzione si usa $0<\\nu\\le\\frac12$.',
    ],
  },
  {
    id: 'o5.7',
    kind: 'trabocchetto',
    q: 'Il problema elastico ha 18 equazioni in 18 incognite: la soluzione esiste quindi sempre ed è unica?',
    concepts: ['c5.4'],
    source: { kind: 'deduzione', da: '§4.16.3', spiegazione: 'La dispensa avverte che il bilancio tra equazioni e incognite non garantisce la risolvibilità e introduce Hadamard.' },
    scaletta: [
      'No: il bilancio non garantisce che il problema sia risolvibile.',
      'Serve la buona posizione: esistenza, unicità, stabilità (Def 4.16.1).',
      'L’unicità (Kirchhoff, richiamato) richiede $\\mathbb A\\in\\mathrm{Pos}^+$; nel problema nelle forze lo spostamento è a meno di un moto rigido.',
    ],
  },
];
