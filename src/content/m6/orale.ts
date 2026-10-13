/**
 * Domande d'orale del Cap. 5, parte M6 (§5.1–5.6): domande 1–9 del riquadro «Per l'orale» (pp. 142–143) più tre
 * dedotte; le 10–12 sono in M7.
 */
import { D } from '../../engine/types';
import type { OralQ } from '../types';

export const P5 = (n: number) => D(5, '5.9', `«Per l'orale», domanda ${n}`, '142–143');

export const M6_ORALE: OralQ[] = [
  {
    id: 'o6.1',
    kind: 'espositiva',
    q: 'Enunciare e dimostrare il teorema di Kirchhoff; ruolo di $\\mathbb A\\in\\mathrm{Pos}^+$.',
    concepts: ['c6.1'],
    source: P5(1),
    scaletta: [
      'Enunciato: unicità a meno di uno spostamento rigido infinitesimo (Teo 5.1.1); aereo in crociera.',
      'Problema differenza a dati nulli (sovrapposizione con α = 1, β = −1).',
      'TLV con FT = {0, 0, T} e SD = {u, E}: $\\int\\mathbb A\\tens E\\cdot\\tens E=0$.',
      'Definita positività ⇒ $\\tens E=\\tens O$ ⇒ stessi $\\tens E$, $\\tens T$; $\\vet u$ a meno di un moto rigido.',
      '$\\mathbb A\\in\\mathrm{Pos}^+$: invertibilità, plausibilità, unicità; fulcro del semi-inverso.',
    ],
    lavagna: [{ tex: '\\int_{\\mathcal B}\\mathbb A\\tens E\\cdot\\tens E\\,dV=0\\ \\Rightarrow\\ \\tens E=\\tens O', rif: 'Teo 5.1.1' }],
  },
  {
    id: 'o6.2',
    kind: 'espositiva',
    q: 'Definire il problema di Saint-Venant e scriverne le equazioni di campo e al contorno.',
    concepts: ['c6.2'],
    source: P5(2),
    scaletta: [
      'Def 5.2.1: cilindro retto allungato, sezione semplicemente connessa, isotropo omogeneo, $\\vet b=\\vet 0$, mantello scarico, forze sulle basi.',
      'Problema nelle forze; riferimento con $z$ lungo l’asse e $x$, $y$ principali centrali.',
      'Campo: congruenza, equilibrio, simmetria, legame inverso con i moduli tecnici (18 equazioni).',
      'Contorno: $\\tens T\\hat n=\\vet 0$ sul mantello con $\\hat n=(n_x,n_y,0)$; $\\tens T(\\pm\\hat e_z)=\\hat{\\vet s}^\\pm$ sulle basi.',
    ],
    figura: 'Il cilindro con basi, mantello, $G_0$, $G_L$ e asse z (p. 101).',
  },
  {
    id: 'o6.3',
    kind: 'espositiva',
    q: 'Ipotesi di Saint-Venant e conseguenze; metodo semi-inverso e perché funziona.',
    concepts: ['c6.2'],
    source: P5(3),
    scaletta: [
      'Problema diretto, inverso, semi-inverso.',
      'Ipotesi a fibre: $T_{xx}=T_{yy}=T_{xy}\\equiv0$ (mazzo di spaghetti).',
      'Equilibrio: $T_{xz}=A(x,y)$, $T_{yz}=B(x,y)$, $T_{zz}=Cz+D$.',
      'Mantello: $\\boldsymbol\\tau_z\\cdot\\hat n=0$, tangenziale tangente al bordo; stato biassiale.',
      'Se tutto torna, per Kirchhoff è la soluzione; il prezzo è il dato indebolito.',
    ],
    lavagna: [{ tex: 'T_{zz}=C(x,y)\\,z+D(x,y)', rif: '(⋆) §5.2.3' }],
    figura: 'Tre fibre contigue con $T_{xx}$, $T_{yy}$ nulle (p. 103).',
  },
  {
    id: 'o6.4',
    kind: 'espositiva',
    q: 'Equilibrio globale e leggi di variazione delle caratteristiche della sollecitazione.',
    concepts: ['c6.3'],
    source: P5(4),
    scaletta: [
      'Dato equivalente a zero: eq. (5.1).',
      'Def 5.2.2: $\\vet R(z)$, $\\vet M(z)$ e le sei componenti negli APCdI.',
      'Equilibrio del tratto di sinistra meno (5.1): $\\vet R(z)=\\vet R_L$, $\\vet M(z)=\\vet M_L+(L-z)\\hat e_z\\wedge\\vet R_L$.',
      'Teo 5.2.3: tagli, $N$, $M_z$ costanti; $M_x(z)=M_x-T_y(L-z)$, $M_y(z)=M_y+T_x(L-z)$.',
    ],
    lavagna: [{ tex: 'M_x(z)=M_x-T_y(L-z),\\quad M_y(z)=M_y+T_x(L-z)', rif: 'Teo 5.2.3' }],
  },
  {
    id: 'o6.5',
    kind: 'espositiva',
    q: 'Problema indebolito, postulato di Saint-Venant, regioni B e D.',
    concepts: ['c6.3'],
    source: P5(5),
    scaletta: [
      'La congettura vincola le tensioni sulle basi: dato forte impossibile.',
      'Dato debole: si assegnano le CdS, una classe di dati staticamente equivalenti; back analysis.',
      'Postulato (Teo 5.2.4, dimostrato nel 1960): indistinguibili a sufficiente distanza; distanza di estinzione.',
      'Telaio di bicicletta: regioni B (Beam, Bernoulli) e D (nodi, estremità, curvature) → metodi numerici.',
    ],
    figura: 'Tre distribuzioni di N con soluzioni uguali oltre la distanza d; il telaio con regioni B e D (p. 108).',
  },
  {
    id: 'o6.6',
    kind: 'espositiva',
    q: 'Sforzo normale: congetture, soluzione, tensione e deformazione, Clapeyron.',
    concepts: ['c6.4'],
    source: P5(6),
    scaletta: [
      'Def 5.4.1; congetture $T_{xz}=T_{yz}=0$, $T_{zz}=D$.',
      'Equilibrio: $D=N/A$; momenti nulli per assi baricentrici.',
      'Congruenza: integrazione e spostamento rigido; Teo 5.4.2.',
      'Tensione uniforme monoassiale, $\\tau_{\\max}=N/(2A)$ a 45°; sezione omotetica, piana.',
      '$\\Delta L=NL/(EA)$, $K_N=EA/L$, $N=EAw\'$; $\\Phi=\\frac12N\\Delta L$ (Clapeyron, carico lento).',
    ],
    lavagna: [
      { tex: '\\sigma_z=\\frac NA,\\quad\\Delta L=\\frac{NL}{EA}', rif: 'Teo 5.4.2' },
      { tex: '\\Phi=\\frac{N^2L}{2EA}=\\frac12N\\Delta L', rif: '§5.4.4' },
    ],
    figura: 'Il cerchio di Mohr con $A\\equiv P$ e centro $N/2A$ (p. 112).',
  },
  {
    id: 'o6.7',
    kind: 'espositiva',
    q: 'Flessione retta: Navier, spostamenti, Bernoulli–Navier, rigidezza flessionale, anticlastica.',
    concepts: ['c6.5', 'c6.6'],
    source: P5(7),
    scaletta: [
      'Def 5.5.1; APCdI, ellisse d’inerzia, convenzioni; retta e deviata (Def 5.5.2).',
      'Congetture $T_{zz}=Dy$; $D=M_x/J_x$; $M_y=0$ perché $J_{xy}=0$; Navier, farfalla, moduli di resistenza.',
      'Spostamenti con le correzioni su $v$; scorrimenti nulli ⇒ sezioni piane (Bernoulli–Navier).',
      'Arco di cerchio: $M_x=EJ_x\\kappa$, $\\Delta\\varphi=M_xL/(EJ_x)$, $K_f=EJ_x/L$; doppio T.',
      'Anticlastica $|\\rho\'|=r/\\nu$; $\\Delta V=0$; $\\Phi=\\frac12M_x\\Delta\\varphi$.',
    ],
    lavagna: [
      { tex: '\\sigma_z=\\frac{M_x}{J_x}y', rif: 'Navier §5.5.3' },
      { tex: 'v=-\\frac{\\nu M_x}{2EJ_x}\\Big[(y^2-x^2)+\\frac{z^2}\\nu\\Big]', rif: '§5.5.3' },
    ],
    figura: 'Sezione con $x\\equiv n$, $y\\equiv s\\equiv f$ e diagramma a farfalla (p. 117); arco di raggio r (p. 118); sezione a sella (p. 119).',
  },
  {
    id: 'o6.8',
    kind: 'espositiva',
    q: 'Flessione deviata: angoli, binomia e monomia, primo e secondo teorema con dimostrazione.',
    concepts: ['c6.7'],
    source: P5(8),
    scaletta: [
      'Angoli α, γ, β, θ, δ e orientamento di $n$.',
      'Binomia per sovrapposizione; monomia con $M_n$, $J_n$, $f$.',
      'I teorema: $\\sigma_z=0$ ⇒ $\\tan\\beta=\\tan\\alpha\\,\\rho_x^2/\\rho_y^2$ ⇒ coniugio con $s$.',
      'II teorema: asse piano ($u,v\\propto z^2$), $\\tan\\theta=v/u=-1/\\tan\\beta$.',
      'Procedura $s\\to n\\to f$; caso retto.',
    ],
    lavagna: [
      { tex: '\\tan\\beta\\tan\\gamma=-\\frac{\\rho_x^2}{\\rho_y^2}', rif: 'Teo 5.5.3' },
      { tex: '\\tan\\theta\\tan\\beta=-1', rif: 'Teo 5.5.4' },
    ],
    figura: 'La sezione con M, s, n, f e gli angoli (p. 121).',
  },
  {
    id: 'o6.9',
    kind: 'espositiva',
    q: 'Sforzo normale eccentrico, nocciolo, materiale non reagente a trazione, regola delle 3u.',
    concepts: ['c6.8'],
    source: P5(9),
    scaletta: [
      'Argomento negli appunti ma non trattato a lezione (§5.6).',
      'Centro di sollecitazione e coppia di trasporto; trinomia e binomia.',
      'Polo e antipolare; nocciolo come antipoli delle rette radenti; casi $c_1$–$c_4$.',
      'Parzializzazione: parte reagente con $c$ sul contorno del suo nocciolo; casi limite.',
      'Rettangolo: terzi medi, $3u$, $\\sigma_{\\max}=2N/(3uB)$.',
    ],
    lavagna: [{ tex: '\\sigma_z=\\frac NA\\Big(1+\\frac{xx_c}{\\rho_y^2}+\\frac{yy_c}{\\rho_x^2}\\Big)', rif: '§5.6' }],
    figura: 'Nocciolo con le posizioni $c_1$–$c_4$ e i diagrammi (p. 124); rettangolo con la regola delle 3u (p. 125).',
  },
  {
    id: 'o6.10',
    kind: 'collegamento',
    q: 'In che senso la soluzione di Saint-Venant «contiene» la linea elastica della trave?',
    concepts: ['c6.4', 'c6.6', 'c5.4'],
    source: { kind: 'deduzione', da: '§4.16.2, §5.4.4, §5.5.3', spiegazione: 'La dispensa osserva che la linea elastica è la parte della soluzione relativa all’asse e ritrova i legami $N=EAw\'$ e $M_x=EJ_x\\kappa$; la domanda chiede di collegarli all’analogia del Cap. 4.' },
    scaletta: [
      'Cap. 4: analogia trave–solido, $\\varepsilon=w\'$, $N=EA\\varepsilon$, $N\'=-p$.',
      'Sforzo normale: lo spostamento dell’asse dà $N=EA\\,w\'$.',
      'Flessione: la curvatura dell’asse dà $M_x=EJ_x\\kappa$.',
      'La soluzione tridimensionale dice in più come sono distribuite tensioni e deformazioni sulla sezione.',
    ],
  },
  {
    id: 'o6.11',
    kind: 'trabocchetto',
    q: 'In flessione retta la sezione resta piana: vuol dire che non si deforma?',
    concepts: ['c6.6'],
    source: { kind: 'deduzione', da: '§5.5.3', spiegazione: 'La dispensa ricava sia Bernoulli–Navier sia la deformazione anticlastica: la domanda gioca sulla differenza.' },
    scaletta: [
      'No: resta piana e ortogonale all’asse (scorrimenti nulli, fuori dal suo piano).',
      'Nel suo piano si deforma: anticlastica, per effetto Poisson.',
      'L’asse neutro si incurva con raggio $r/\\nu$, in verso opposto all’asse.',
    ],
  },
  {
    id: 'o6.12',
    kind: 'trabocchetto',
    q: 'In flessione l’asse neutro è sempre ortogonale all’asse di sollecitazione?',
    concepts: ['c6.7', 'c6.5'],
    source: { kind: 'deduzione', da: '§5.5.5', spiegazione: 'Il primo teorema dà il coniugio, non l’ortogonalità: la domanda prova a far dire il contrario.' },
    scaletta: [
      'No: sono coniugati rispetto all’ellisse centrale d’inerzia.',
      'Ortogonali solo in flessione retta o con ellisse circolare (quadrato, cerchio).',
      'È l’asse di flessione $f$ a essere ortogonale all’asse neutro (II teorema).',
    ],
  },
];
