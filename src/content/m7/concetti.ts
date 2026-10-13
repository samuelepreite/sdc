/**
 * Modulo 7 — Il problema di Saint-Venant, seconda parte: taglio e torsione (Cap. 5, §5.7–5.8, pp. 125–141).
 * Fonte: tools/testi/cap-05.md. Disegni della sezione con x verso sinistra e y verso il basso (NF-10).
 */
import { D } from '../../engine/types';
import type { Concept } from '../types';

export const M7_CONCETTI: Concept[] = [
  {
    id: 'c7.1',
    module: 'm7',
    title: 'Flessione composta: formula di Jourawski',
    prereq: ['c6.6'],
    source: D(5, '5.7.1–5.7.2', 'Def 5.7.1, Teo 5.7.2, Prop 5.7.3', '125–129'),
    meaning: 'Dove c’è taglio c’è momento flettente variabile; la differenza di σ_z tra due sezioni vicine deve essere equilibrata da tensioni tangenziali. Jourawski ne dà il **valore medio** su una corda: τ̄ = T_y S_x/(J_x b_r).',
    formulas: [
      { tex: '\\bar\\tau_{zy}=\\frac{T_y\\,S_x}{J_x\\,b_r}', label: 'formula di Jourawski', rif: 'Teo 5.7.2' },
      { tex: 'S_x=\\int_{A_r}y\\,dA=A_r\\,y_{G_r}', label: 'momento statico dell’area sottesa', rif: '§5.7.2' },
      { tex: '\\frac{d\\bar\\tau_{zy}}{dy}=0\\iff S\'_xb_r-S_xb\'_r=0', label: 'condizione di stazionarietà', rif: 'Prop 5.7.3' },
    ],
    explanation: `**Def 5.7.1.** Sulla base di destra una forza $\\vet T$ nel piano della base; sulla sinistra $-\\vet T$ e una coppia: **dove c'è taglio c'è momento flettente** ($M=TL$). La soluzione esatta dipende molto dalla forma della sezione e si conosce solo per geometrie semplici.

**Teoria approssimata di Jourawski:** si usa solo l'equilibrio e si calcola il valore **medio** su una corda. Ipotesi: asse di simmetria $y$, taglio retto $T\\equiv T_y$ (quindi $M_x(z)=-T_y(L-z)$). Il taglio deve passare per il **centro di taglio** (sta su ogni asse di simmetria; coincide col baricentro se gli assi sono due), altrimenti nasce torsione (profilo a C).

**Dimostrazione:** si isola la porzione tra $z$ e $z+dz$ tagliata da una corda parallela all'asse neutro: area sottesa $A_r$, corda $b_r$. L'equilibrio lungo $z$ dice che la differenza delle risultanti di $\\sigma_z$ sulle due facce è uguale alla forza tangenziale sul rettangolo di taglio: $\\frac{T_y}{J_x}S_x\\,dz=\\bar\\tau_{zy}b_r\\,dz$.

**Osservazioni.** La media è rappresentativa se $\\tau_{zy}$ varia poco sulla corda (corda parallela all'asse neutro). $S_x$ è nullo ai lembi e massimo sulla corda baricentrica; $\\bar\\tau$ si annulla ai lembi. Il massimo è sulla corda baricentrica **se e solo se** essa è massima, minima o stazionaria (cerchio, clessidra, doppio T; Prop 5.7.3). Senza tangenziali due tavole incollate scorrerebbero: chiodi, bulloni e saldature trasmettono queste tensioni. Diagrammi qualitativi: a T salto all'attacco ala–anima in rapporto $B/b$; nel triangolo il massimo non sta sulla baricentrica.`,
    pitfalls: ['Usare $J_x$ della sola area sottesa: è quello di tutta la sezione.', 'Pensare che il massimo sia sempre sulla corda baricentrica (triangolo).', 'Dimenticare che τ̄ è una media: su corde in cui $\\tau$ cambia segno non è rappresentativa.'],
    visual: { kind: 'svg', id: 'jourawski', params: { section: 'rettangolo' } },
    recall: [
      { id: 'c7.1-q1', kind: 'scelta', q: 'Nella formula di Jourawski, $S_x$ è il momento statico di…', options: ['l’area sottesa dalla corda, rispetto all’asse neutro', 'tutta la sezione', 'la corda', 'l’ala superiore'], correct: 0, why: 'Teo 5.7.2.', source: D(5, '5.7.2', 'Teo 5.7.2', 127) },
      { id: 'c7.1-q2', kind: 'vf', q: 'In una sezione triangolare il massimo di τ̄ è sulla corda baricentrica.', answer: false, why: 'Prop 5.7.3: la corda baricentrica del triangolo non è stazionaria; il massimo va calcolato.', source: D(5, '5.7.2', 'Prop 5.7.3', 128) },
      { id: 'c7.1-q3', kind: 'aperta', q: 'Perché dove c’è taglio c’è momento flettente?', answer: 'Per l’equilibrio del solido: la forza $T$ sulla base di destra e la $-T$ su quella di sinistra formano una coppia di braccio $L$, equilibrata da un momento $M=TL$; lungo il solido $M_x(z)=-T_y(L-z)$ (Def 5.7.1, Teo 5.2.3).', source: D(5, '5.7', 'Def 5.7.1', 125) },
    ],
  },
  {
    id: 'c7.2',
    module: 'm7',
    title: 'τ_zx e regola delle tangenti',
    prereq: ['c7.1', 'c3.4'],
    source: D(5, '5.7.3–5.7.4', undefined, '129–131'),
    meaning: 'Sul bordo la tangenziale dev’essere tangente al contorno: agli estremi di una corda nasce una componente τ_zx, fissata dalle tangenti al contorno; lungo la corda τ_zx è lineare e antisimmetrica.',
    formulas: [
      { tex: '\\tau^B_{zx}=\\bar\\tau_{zy}(\\bar y)\\tan\\alpha\',\\qquad\\tau^A_{zx}=-\\bar\\tau_{zy}(\\bar y)\\tan\\alpha\'', label: 'regola delle tangenti', rif: '§5.7.4' },
      { tex: '\\tau_{zx}(x,\\bar y)=-2\\frac{\\bar\\tau_{zy}(\\bar y)\\tan\\alpha(\\bar y)}{b_r(\\bar y)}\\,x', label: 'andamento lineare sulla corda', rif: '§5.7.4' },
    ],
    explanation: `**Corde qualsiasi** (§5.7.3): con una corda di direzione qualsiasi si ottiene allo stesso modo la media della componente ortogonale alla corda, $\\bar\\tau_{zt}=T_yS_x/(J_xb_r)$, sempre con $J_x$ e $S_x$ rispetto a $x$. Si ricostruisce così $[\\tens T(P)]$ con $\\bar\\tau_{zx}$ e $\\bar\\tau_{zy}$. Attenzione: $T_x=\\int\\tau_{zx}=0$, e su una corda verticale $\\tau_{zx}$ cambia segno: la media di Jourawski non è rappresentativa.

**Regola delle tangenti** (§5.7.4): corda parallela a $x$ a quota $\\bar y$, estremi $A$ e $B$; le tangenti al contorno in $A$ e $B$ si incontrano in un punto $C$ sull'asse $y$. Poiché sul bordo $\\boldsymbol\\tau_z\\cdot\\hat n=0$, la tangenziale agli estremi è diretta lungo la tangente: $\\tau_{zx}^{A,B}=\\mp\\bar\\tau_{zy}\\tan\\alpha'$.

**Andamento:** dalla terza equazione indefinita, con $\\bar\\tau_{zy}$ funzione della sola $y$, $\\partial^2\\tau_{zx}/\\partial x^2=0$: $\\tau_{zx}$ è **lineare** in $x$; imponendo i valori agli estremi è antisimmetrica e nulla sull'asse $y$.

Casi: cerchio, $\\tau_{zx}=0$ sulla corda baricentrica; rettangolo, $\\tau_{zx}\\equiv0$; T sottile: nell'ala tensioni orizzontali, nell'anima verticali, come un fluido.`,
    pitfalls: ['Dimenticare che sul contorno la tangenziale deve essere tangente al bordo.', 'Pensare che τ_zx sia costante sulla corda: è lineare e antisimmetrica.', 'Applicare la media di Jourawski su una corda verticale.'],
    visual: { kind: 'svg', id: 'jourawski', params: { section: 'triangolo', corda: 0.6 } },
    recall: [
      { id: 'c7.2-q1', kind: 'vf', q: 'Nel rettangolo, con taglio verticale, τ_zx è nulla ovunque secondo la regola delle tangenti.', answer: true, why: '§5.7.4: i lati sono verticali, le tangenti al contorno sono parallele a y.', source: D(5, '5.7.4', undefined, 131) },
      { id: 'c7.2-q2', kind: 'scelta', q: 'Come varia τ_zx lungo una corda orizzontale?', options: ['Linearmente, antisimmetrica, nulla sull’asse y', 'È costante', 'Parabolica', 'È nulla'], correct: 0, why: '§5.7.4: $\\partial^2\\tau_{zx}/\\partial x^2=0$.', source: D(5, '5.7.4', undefined, 131) },
      { id: 'c7.2-q3', kind: 'aperta', q: 'Da dove viene la regola delle tangenti?', answer: 'Dalla condizione sul mantello scarico, $\\boldsymbol\\tau_z\\cdot\\hat n=0$: agli estremi della corda la tangenziale è diretta lungo la tangente al contorno; nota $\\bar\\tau_{zy}$ da Jourawski, $\\tau_{zx}=\\pm\\bar\\tau_{zy}\\tan\\alpha\'$ (§5.7.4).', source: D(5, '5.7.4', undefined, 130) },
    ],
  },
  {
    id: 'c7.3',
    module: 'm7',
    title: 'Torsione: congettura di Clebsch e problema di Neumann',
    prereq: ['c6.3', 'c5.2'],
    source: D(5, '5.8.1–5.8.2', 'Def 5.8.1–5.8.2, Teo 5.8.3', '131–133'),
    meaning: 'In torsione la congettura riguarda gli **spostamenti**: le sezioni ruotano rigidamente di θ(z) = γz e si ingobbano tutte allo stesso modo, w = γφ(x, y). La funzione d’ingobbamento risolve un problema di Neumann per l’equazione di Laplace.',
    formulas: [
      { tex: 'u=-\\gamma yz,\\qquad v=\\gamma xz,\\qquad w=\\gamma\\varphi(x,y)', label: 'congettura di Clebsch', rif: 'Def 5.8.2' },
      { tex: 'T_{zx}=G\\gamma\\Big(-y+\\frac{\\partial\\varphi}{\\partial x}\\Big),\\quad T_{zy}=G\\gamma\\Big(x+\\frac{\\partial\\varphi}{\\partial y}\\Big)', label: 'tensioni', rif: '§5.8.2' },
      { tex: '\\nabla^2\\varphi=0\\ \\text{in }\\mathring A,\\qquad\\frac{d\\varphi}{dn}=yn_x-xn_y\\ \\text{su }\\partial A', label: 'problema di Neumann', rif: 'Teo 5.8.3' },
    ],
    explanation: `**Def 5.8.1.** Forze sulle basi equivalenti a due coppie uguali e opposte con momento lungo l'asse. Eccezione nel metodo: con l'approccio di **Clebsch** la congettura è sul campo di **spostamento**.

**Congettura** (§5.8.1): le sezioni ruotano di $\\theta(z)=\\theta(0)+\\gamma z$ (le fibre diventano eliche) e si **ingobbano** allo stesso modo, con $\\varphi(x,y)$ indipendente da $z$ (pensa a una clip a C). $\\gamma$ è l'**angolo unitario di torsione**. Per rotazioni piccole (arco ≈ tangente) $u=-\\gamma yz$, $v=\\gamma xz$.

**Equazioni.** Congruenza: $E_{xx}=E_{yy}=E_{zz}=E_{xy}=0$ e due scorrimenti; $\\Theta=0$, deformazione isocora. Legame: $\\tens T=2G\\tens E$. Equilibrio di campo: $\\nabla^2\\varphi=0$. Mantello: $d\\varphi/dn=yn_x-xn_y$. Basi: $N=M_x=M_y=0$; si dimostra che $T_x=T_y=0$ (la dispensa lo afferma senza svolgerlo); $M_z$ determina $\\gamma$.

**Teo 5.8.3 (Clebsch).** $\\varphi$ risolve il **problema di Neumann** per Laplace (dato sulla derivata normale); $\\gamma$ si ricava da $M_z$.`,
    pitfalls: ['Pensare che in torsione le sezioni restino piane: si ingobbano (tranne il cerchio).', 'Confondere Neumann (dato sulla derivata) con Dirichlet (dato sulla funzione).', 'Dimenticare che qui la congettura è sugli spostamenti, non sulle tensioni.'],
    visual: { kind: 'torsione3d', scene: { mode: 'clebsch', section: 'rettangolo', controls: ['section', 'twist', 'warp'] } },
    recall: [
      { id: 'c7.3-q1', kind: 'scelta', q: 'Che cosa congettura Clebsch?', options: ['Il campo di spostamento: rotazione θ(z) = γz più ingobbamento γφ(x, y)', 'Le tensioni: solo $T_{zz}$', 'Che le sezioni restino piane', 'Che $\\gamma$ dipenda da $z$'], correct: 0, why: 'Def 5.8.2.', source: D(5, '5.8.1', 'Def 5.8.2', 132) },
      { id: 'c7.3-q2', kind: 'vf', q: 'In torsione secondo Clebsch la deformazione è isocora.', answer: true, why: '§5.8.2: $E_{xx}=E_{yy}=E_{zz}=0$, $\\Theta=0$.', source: D(5, '5.8.2', undefined, 132) },
      { id: 'c7.3-q3', kind: 'aperta', q: 'Ricava le tensioni dalla congettura.', answer: 'Da $u=-\\gamma yz$, $v=\\gamma xz$, $w=\\gamma\\varphi$: $E_{zx}=\\frac12\\gamma(-y+\\varphi_{,x})$, $E_{zy}=\\frac12\\gamma(x+\\varphi_{,y})$, gli altri nulli; con $\\tens T=2G\\tens E$ si ottengono $T_{zx}=G\\gamma(-y+\\varphi_{,x})$, $T_{zy}=G\\gamma(x+\\varphi_{,y})$ (§5.8.2).', source: D(5, '5.8.2', undefined, 132) },
    ],
  },
  {
    id: 'c7.4',
    module: 'm7',
    title: 'Funzione di Prandtl e fattore di torsione',
    prereq: ['c7.3', 'c1.7'],
    source: D(5, '5.8.3–5.8.4', 'Def 5.8.4, Teo 5.8.5, Def 5.8.6', '133–135'),
    meaning: 'Con la funzione degli sforzi di Prandtl F l’equilibrio è automatico e il problema diventa di Dirichlet: ∇²F = 2 nella sezione, F = 0 sul contorno. Il momento torcente è Gγ∫(−2F); il fattore di torsione q ≥ 1 misura quanto la sezione è meno efficiente del cerchio.',
    formulas: [
      { tex: 'T_{zx}=-G\\gamma\\frac{\\partial F}{\\partial y},\\qquad T_{zy}=G\\gamma\\frac{\\partial F}{\\partial x}', label: 'funzione di Prandtl', rif: 'Def 5.8.4' },
      { tex: '\\nabla^2F=2\\ \\text{in }\\mathring A,\\qquad F=0\\ \\text{su }\\partial A', label: 'problema di Dirichlet per Poisson', rif: 'Teo 5.8.5' },
      { tex: 'M_z=G\\gamma\\int_A(-2F)\\,dA,\\quad q=\\frac{J_0}{\\int_A(-2F)\\,dA}\\ge1,\\quad\\gamma=q\\frac{M_z}{GJ_0}=\\frac{M_z}{K_t}', label: 'angolo unitario e fattore di torsione', rif: 'Def 5.8.6' },
    ],
    explanation: `**Def 5.8.4.** $\\partial F/\\partial x=x+\\partial\\varphi/\\partial y$, $\\partial F/\\partial y=y-\\partial\\varphi/\\partial x$, così che $T_{zx}=-G\\gamma F_{,y}$ e $T_{zy}=G\\gamma F_{,x}$. L'equilibrio di campo è soddisfatto identicamente (teorema di Schwarz). L'integrabilità di $\\varphi$ dà $\\nabla^2F=2$. Sul contorno, con $\\hat t=(-n_y,n_x)$, la condizione del mantello diventa $dF/dt=0$: $F$ costante, e per una sezione semplicemente connessa si sceglie $F=0$. L'equazione del contorno è un primo tentativo per $F$.

**Teo 5.8.5:** problema di **Dirichlet** per l'equazione di **Poisson**.

**Angolo unitario** (§5.8.4): $M_z=G\\gamma\\int(xF_{,x}+yF_{,y})$; con $\\vet w=(xF,yF)$, $xF_{,x}+yF_{,y}=\\operatorname{div}\\vet w-2F$ e $\\vet w=\\vet 0$ sul bordo, quindi $M_z=G\\gamma\\int(-2F)$. Si definisce il **fattore di torsione** $q=J_0/\\int(-2F)\\ge1$ (= 1 solo per il cerchio) e la rigidezza torsionale $K_t=GJ_0/q$; $\\gamma$ è la rotazione relativa di due sezioni a distanza unitaria.

**Schema per l'orale:** congettura ($\\gamma$, $\\varphi\\leftrightarrow F$), Dirichlet, $\\gamma=qM_z/(GJ_0)$. Soluzioni esatte chiuse (cerchio, ellisse, anche cavi; triangolo equilatero), esatte in serie (rettangolo), approssimate (sottili).`,
    pitfalls: ['Dimenticare il 2 in $\\nabla^2F=2$.', 'Pensare che q possa essere minore di 1: il cerchio è la sezione più efficiente.', 'Scambiare i segni di $T_{zx}$ e $T_{zy}$ in funzione delle derivate di F.'],
    visual: { kind: 'torsione3d', scene: { mode: 'prandtl', section: 'quadrato', controls: ['section'] } },
    recall: [
      { id: 'c7.4-q1', kind: 'scelta', q: 'Quale problema risolve la funzione di Prandtl?', options: ['Dirichlet per Poisson: $\\nabla^2F=2$, $F=0$ sul bordo', 'Neumann per Laplace', 'Dirichlet per Laplace', 'Nessuno: è nota a priori'], correct: 0, why: 'Teo 5.8.5.', source: D(5, '5.8.3', 'Teo 5.8.5', 134) },
      { id: 'c7.4-q2', kind: 'vf', q: 'Il fattore di torsione q vale 1 solo per la sezione circolare.', answer: true, why: 'Def 5.8.6.', source: D(5, '5.8.4', 'Def 5.8.6', 134) },
      { id: 'c7.4-q3', kind: 'aperta', q: 'Ricava $M_z=G\\gamma\\int(-2F)dA$.', answer: '$M_z=\\int(T_{zy}x-T_{zx}y)=G\\gamma\\int(xF_{,x}+yF_{,y})$. Con $\\vet w=(xF,yF)$: $\\operatorname{div}\\vet w=xF_{,x}+yF_{,y}+2F$; per il teorema della divergenza $\\int\\operatorname{div}\\vet w=\\oint\\vet w\\cdot\\hat n=0$ perché $F=0$ sul bordo; resta $M_z=G\\gamma\\int(-2F)$ (§5.8.4).', source: D(5, '5.8.4', undefined, 134) },
    ],
  },
  {
    id: 'c7.5',
    module: 'm7',
    title: 'Sezioni esatte, analogia idrodinamica, chiusa vs aperta',
    prereq: ['c7.4'],
    source: D(5, '5.8.5–5.8.8', undefined, '135–138'),
    meaning: 'Per il cerchio F è un paraboloide: niente ingobbamento, q = 1, τ lineare con il raggio. Per le altre sezioni le linee di tensione si comportano come le linee di flusso di un fluido: si addensano negli spigoli concavi e svaniscono in quelli convessi. Le sezioni sottili chiuse sono molto più efficienti di quelle aperte.',
    formulas: [
      { tex: 'F=\\frac{x^2+y^2-R^2}2,\\qquad|\\tau_z|=\\frac{2M_z}{\\pi R^4}r,\\qquad|\\tau_z|_{\\max}=\\frac{2M_z}{\\pi R^3}', label: 'sezione circolare', rif: '§5.8.5' },
      { tex: '\\tau_{\\max}=\\frac{M_z}{\\alpha b^2h},\\qquad\\theta^{(1)}=\\frac{M_z}{\\beta Gb^3h}', label: 'rettangolo (tabella)', rif: '§5.8.6' },
      { tex: '\\tau_z=\\frac{M_z}{J_0}r,\\quad J_0=\\frac{\\pi(R_e^4-R_i^4)}2', label: 'cerchio cavo', rif: '§5.8.8' },
    ],
    explanation: `**Cerchio** (§5.8.5): il tentativo $F=x^2+y^2-R^2$ dà $\\nabla^2F=4$; diviso per 2 funziona. Allora $\\partial\\varphi/\\partial x=\\partial\\varphi/\\partial y=0$: **niente ingobbamento**; $q=1$, $K_t=GJ_0$. La tangenziale è lineare con il raggio, ortogonale al raggio vettore, massima sul contorno.

**Altre sezioni esatte** (§5.8.6): ellisse ($\\tau_{\\max}=2M_z/(\\pi ab^2)$ ai piedi dell'asse minore, si ingobba), triangolo equilatero ($\\tau_{\\max}=20M_z/a^3$ ai punti medi dei lati), rettangolo con la tabella di $\\alpha$ e $\\beta$ (massimo ai punti medi dei lati lunghi; quadrato $4{,}8M_z/a^3$; molto allungato $\\alpha,\\beta\\to\\frac13$).

**Analogia idrodinamica** (§5.8.7): stesse equazioni del moto laminare di un fluido in un recipiente con la forma della sezione. $|\\tau_z|\\leftrightarrow|v|$, linee di tensione ↔ linee di flusso, $\\tau_zb=$ costante in un tubo di flusso. **Spigoli convessi** $\\tau\\to0$, **concavi** $\\tau\\to\\max$: servono i raccordi (anche nei doppi T), importanti per la fatica.

**Sottile chiusa e aperta:** nella chiusa la tensione è costante nello spessore, nell'aperta varia linearmente e cambia segno. La dispensa stima, con un calcolo qualitativo, $\\tau^{(2)}=3\\frac{B-t}t\\tau^{(1)}$ (circa 150 volte per $B=100$ mm, $t=2$ mm): le sezioni chiuse resistono molto meglio a torsione.

**Cerchio cavo** (§5.8.8): il bordo interno è una linea di flusso, la stessa $F$ del cerchio pieno risolve il problema.`,
    pitfalls: ['Dire che anche il quadrato non si ingobba: solo il cerchio (e il cerchio cavo).', 'Mettere il massimo negli spigoli del rettangolo: lì τ → 0; il massimo è ai punti medi dei lati lunghi.', 'Usare per la sezione aperta la formula di Bredt.'],
    visual: { kind: 'svg', id: 'torsione', params: { tab: 'flusso', section: 'quadrato' } },
    recall: [
      { id: 'c7.5-q1', kind: 'scelta', q: 'Dove è massima la tangenziale in un rettangolo soggetto a torsione?', options: ['Ai punti medi dei lati lunghi', 'Negli spigoli', 'Al baricentro', 'Ai punti medi dei lati corti'], correct: 0, why: '§5.8.6; negli spigoli convessi τ → 0.', source: D(5, '5.8.6', undefined, 136) },
      { id: 'c7.5-q2', kind: 'vf', q: 'Nella sezione circolare piena in torsione non c’è ingobbamento.', answer: true, why: '§5.8.5: le derivate di φ sono nulle.', source: D(5, '5.8.5', undefined, 135) },
      { id: 'c7.5-q3', kind: 'aperta', q: 'Che cosa dice l’analogia idrodinamica sugli spigoli?', answer: 'Le linee di tensione si comportano come linee di flusso: negli spigoli convessi la velocità, quindi τ, tende a zero; in quelli concavi le linee si addensano e τ è massima. Per questo si raccordano gli spigoli concavi (§5.8.7).', source: D(5, '5.8.7', undefined, 137) },
    ],
  },
  {
    id: 'c7.6',
    module: 'm7',
    title: 'Sezioni sottili aperte e teoria di Bredt',
    prereq: ['c7.5'],
    source: D(5, '5.8.9–5.8.10', 'Teo 5.8.7', '139–141'),
    meaning: 'Una sezione sottile aperta si tratta come somma di rettangoli allungati; in una sezione sottile chiusa il flusso di tensione τh è costante lungo la linea media e il momento è M_z = τh·2Ω (Bredt).',
    formulas: [
      { tex: '\\tau^i_{z,\\max}=\\frac{3M_z}{\\sum_jb_j^3h_j}\\,b_i', label: 'sottili aperte', rif: '§5.8.9' },
      { tex: 'M_z=\\bar\\tau_zh\\,2\\Omega\\ \\Rightarrow\\ \\bar\\tau_z(s)=\\frac{M_z}{2\\Omega h(s)}', label: 'formula di Bredt', rif: 'Teo 5.8.7' },
    ],
    explanation: `**Sottili aperte** (§5.8.9): $n$ rettangoli allungati di spessore $b_i$ e lunghezza $h_i$: $\\tau^i_{z,\\max}=\\frac{3M_z}{\\sum b_j^3h_j}b_i$; il massimo assoluto nel rettangolo più spesso. Piccola sovrastima; negli spigoli servono metodi numerici.

**Sottili chiuse, Bredt (1896)** (§5.8.10). Linea media chiusa regolare $\\Gamma$, ascissa $s$, spessore $h(s)$. Ipotesi: spessore piccolo rispetto al diametro; solo equilibrio alla rotazione; $\\tau_z\\simeq\\bar\\tau_z$ sulla corda e parallela alla tangente alla linea media; **ipotesi di Bredt**: $\\bar\\tau_zh=$ costante (portata costante).

**Derivazione:** la forza su un tratto $ds$ è $d\\vet F=\\bar\\tau_zh\\,\\hat t\\,ds$; il momento rispetto a $G$ è $\\bar\\tau_zh\\oint[(P-G)\\wedge\\hat t]\\cdot\\hat e_z\\,ds$, e il prodotto misto è il doppio dell'area del triangolino $G,P(s),P(s+ds)$: l'integrale vale $2\\Omega$, con $\\Omega$ area racchiusa dalla linea media.

**Teo 5.8.7:** $\\bar\\tau_z=M_z/(2\\Omega h)$. Massimo dove lo spessore è minimo; rispetto al tubo circolare esatto dà la media; con spigoli l'approssimazione è scadente (analisi locali, FEM).

**Per l'orale:** Jourawski per il taglio, Bredt per la torsione delle sottili chiuse, rettangoli allungati per le sottili aperte.`,
    pitfalls: ['Usare l’area del materiale invece dell’area Ω racchiusa dalla linea media.', 'Dimenticare che la tensione massima è dove lo spessore è minimo.', 'Applicare Bredt a sezioni aperte.'],
    visual: { kind: 'svg', id: 'torsione', params: { tab: 'sottili' } },
    recall: [
      { id: 'c7.6-q1', kind: 'scelta', q: 'Che cos’è Ω nella formula di Bredt?', options: ['L’area racchiusa dalla linea media', 'L’area del materiale', 'Il momento polare', 'La lunghezza della linea media'], correct: 0, why: 'Teo 5.8.7.', source: D(5, '5.8.10', 'Teo 5.8.7', 140) },
      { id: 'c7.6-q2', kind: 'vf', q: 'Nella teoria di Bredt la tensione è massima dove lo spessore è minimo.', answer: true, why: 'Teo 5.8.7, oss. 1: $\\bar\\tau_z h$ costante.', source: D(5, '5.8.10', 'Teo 5.8.7', 140) },
      { id: 'c7.6-q3', kind: 'aperta', q: 'Ricava la formula di Bredt.', answer: 'Con $\\bar\\tau_zh$ costante, $d\\vet F=\\bar\\tau_zh\\hat t\\,ds$; $M_z=\\oint[(P-G)\\wedge d\\vet F]\\cdot\\hat e_z=\\bar\\tau_zh\\oint[(P-G)\\wedge\\hat t]\\cdot\\hat e_z\\,ds$; il prodotto misto è il doppio dell’area del triangolino, quindi l’integrale è $2\\Omega$: $\\bar\\tau_z=M_z/(2\\Omega h)$ (Teo 5.8.7).', source: D(5, '5.8.10', 'Teo 5.8.7', 140) },
    ],
  },
];
