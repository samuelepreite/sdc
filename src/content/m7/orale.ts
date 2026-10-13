/**
 * Domande d'orale del Cap. 5, parte M7 (§5.7–5.8): domande 10–12 del riquadro «Per l'orale» (pp. 142–143) più tre dedotte.
 */
import type { OralQ } from '../types';
import { P5 } from '../m6/orale';

export const M7_ORALE: OralQ[] = [
  {
    id: 'o7.1',
    kind: 'espositiva',
    q: 'Flessione composta: Jourawski (dimostrazione), valore medio, massimo, scorrimento, diagrammi, regola delle tangenti.',
    concepts: ['c7.1', 'c7.2'],
    source: P5(10),
    scaletta: [
      'Def 5.7.1: dove c’è taglio c’è momento; centro di taglio; teoria approssimata (solo equilibrio, valore medio).',
      'Porzione sotto la corda: equilibrio lungo z ⇒ $\\bar\\tau_{zy}=T_yS_x/(J_xb_r)$ (Teo 5.7.2).',
      'Media rappresentativa su corde parallele all’asse neutro; $S_x=A_ry_{G_r}$, nulla ai lembi.',
      'Massimo sulla baricentrica se e solo se è massima, minima o stazionaria (Prop 5.7.3); triangolo.',
      'Scorrimento e collegamenti; diagrammi a T e a croce; regola delle tangenti e τ_zx lineare.',
    ],
    lavagna: [
      { tex: '\\bar\\tau_{zy}=\\frac{T_yS_x}{J_xb_r}', rif: 'Teo 5.7.2' },
      { tex: '\\tau_{zx}=-2\\frac{\\bar\\tau_{zy}\\tan\\alpha}{b_r}x', rif: '§5.7.4' },
    ],
    figura: 'Sezione con corda, area sottesa e τ_zy (p. 127); diagrammi a T, croce, triangolo (p. 129); tangenti che si incontrano su y (p. 130).',
  },
  {
    id: 'o7.2',
    kind: 'espositiva',
    q: 'Torsione: Clebsch, Neumann, Prandtl e Dirichlet, fattore di torsione.',
    concepts: ['c7.3', 'c7.4'],
    source: P5(11),
    scaletta: [
      'Congettura sugli spostamenti: $u=-\\gamma yz$, $v=\\gamma xz$, $w=\\gamma\\varphi$ (Def 5.8.2).',
      'Deformazione isocora, $\\tens T=2G\\tens E$, tensioni $T_{zx}$, $T_{zy}$.',
      'Neumann per Laplace (Teo 5.8.3).',
      'Prandtl: equilibrio automatico, $\\nabla^2F=2$, $F=0$ sul contorno (Teo 5.8.5).',
      '$M_z=G\\gamma\\int(-2F)$, $q=J_0/\\int(-2F)\\ge1$, $\\gamma=qM_z/(GJ_0)$.',
    ],
    lavagna: [
      { tex: '\\nabla^2F=2\\ \\text{in }\\mathring A,\\quad F=0\\ \\text{su }\\partial A', rif: 'Teo 5.8.5' },
      { tex: '\\gamma=q\\frac{M_z}{GJ_0}', rif: 'Def 5.8.6' },
    ],
    figura: 'La fibra che diventa elica, rotazione θ(z) e ingobbamento (p. 131).',
  },
  {
    id: 'o7.3',
    kind: 'espositiva',
    q: 'Sezione circolare (piena e cava) e altre sezioni; analogia idrodinamica; sottili aperte e chiuse, Bredt.',
    concepts: ['c7.5', 'c7.6'],
    source: P5(12),
    scaletta: [
      'Cerchio: $F=(r^2-R^2)/2$, niente ingobbamento, $q=1$, $\\tau=M_zr/J_0$; cerchio cavo.',
      'Ellisse, triangolo equilatero, rettangolo con α e β.',
      'Analogia idrodinamica: spigoli convessi e concavi, raccordi, fatica.',
      'Chiusa contro aperta: costante contro lineare nello spessore, rapporto dell’ordine di (B − t)/t.',
      'Rettangoli allungati per le aperte; Bredt $\\bar\\tau_z=M_z/(2\\Omega h)$ per le chiuse.',
    ],
    lavagna: [
      { tex: '|\\tau_z|_{\\max}=\\frac{2M_z}{\\pi R^3}', rif: '§5.8.5' },
      { tex: '\\bar\\tau_z=\\frac{M_z}{2\\Omega h}', rif: 'Teo 5.8.7' },
    ],
    figura: 'Sezione circolare con τ ortogonale al raggio (p. 136); L con le linee di flusso (p. 137); tubolare chiuso e tagliato (p. 138); linea media con Ω (p. 140).',
  },
  {
    id: 'o7.4',
    kind: 'collegamento',
    q: 'La condizione «mantello scarico» compare in taglio e in torsione: che cosa impone in ciascun caso?',
    concepts: ['c6.2', 'c7.2', 'c7.4'],
    source: { kind: 'deduzione', da: '§5.2.3, §5.7.4, §5.8.3', spiegazione: 'La stessa condizione $\\boldsymbol\\tau_z\\cdot\\hat n=0$ produce la regola delle tangenti e la condizione F = 0 sul contorno: la domanda chiede di riconoscerla.' },
    scaletta: [
      'Dall’ipotesi di Saint-Venant: $\\boldsymbol\\tau_z\\cdot\\hat n=0$, tangenziale tangente al bordo.',
      'Taglio: agli estremi della corda fissa τ_zx (regola delle tangenti).',
      'Torsione: diventa $d\\varphi/dn=yn_x-xn_y$ (Neumann) o $dF/dt=0$, cioè F = 0 (Dirichlet).',
      'Analogia idrodinamica: il contorno è una linea di flusso.',
    ],
  },
  {
    id: 'o7.5',
    kind: 'trabocchetto',
    q: 'Il massimo della tangenziale di taglio sta sempre sulla corda baricentrica?',
    concepts: ['c7.1'],
    source: { kind: 'deduzione', da: '§5.7.2, Prop 5.7.3', spiegazione: 'La proposizione dà una condizione necessaria e sufficiente; il triangolo è il controesempio della dispensa.' },
    scaletta: [
      'No: solo se la corda baricentrica è massima, minima o stazionaria (Prop 5.7.3).',
      'Sì per rettangolo, cerchio, doppio T; no per il triangolo.',
      'Motivo: $d\\bar\\tau/dy=0\\iff S\'_xb_r-S_xb\'_r=0$ e sulla baricentrica $S\'_x=0$.',
    ],
  },
  {
    id: 'o7.6',
    kind: 'trabocchetto',
    q: 'Nella torsione di un rettangolo la tangenziale massima è negli spigoli, che sono i punti più lontani dal baricentro?',
    concepts: ['c7.5'],
    source: { kind: 'deduzione', da: '§5.8.6–5.8.7', spiegazione: 'L’intuizione «più lontano = più sollecitato» vale per il cerchio, non per il rettangolo: la domanda la mette alla prova.' },
    scaletta: [
      'No: negli spigoli convessi τ → 0 (analogia idrodinamica).',
      'Il massimo è ai punti medi dei lati lunghi: $\\tau_{\\max}=M_z/(\\alpha b^2h)$.',
      'Solo nel cerchio τ cresce con la distanza dal centro.',
    ],
  },
];
