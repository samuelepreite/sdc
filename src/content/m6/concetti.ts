/**
 * Modulo 6 — Il problema di Saint-Venant, prima parte (Cap. 5, §5.1–5.6, pp. 99–125). Fonte: tools/testi/cap-05.md.
 * Convenzioni del capitolo: z lungo l'asse, x e y assi principali centrali d'inerzia (x di inerzia massima); nei disegni
 * della sezione x verso sinistra e y verso il basso (controllato sulle figure di pp. 117 e 121, NF-10).
 */
import { D } from '../../engine/types';
import type { Concept } from '../types';

export const M6_CONCETTI: Concept[] = [
  {
    id: 'c6.1',
    module: 'm6',
    title: 'Teorema di unicità di Kirchhoff',
    prereq: ['c5.5', 'c4.1'],
    source: D(5, '5.1', 'Teo 5.1.1', '99–100'),
    meaning: 'Se $\\mathbb A\\in\\mathrm{Pos}^+$, il problema elastico lineare ha **al più una** soluzione in deformazione e tensione; lo spostamento è unico a meno di uno spostamento rigido infinitesimo (unico del tutto se il corpo è sufficientemente vincolato).',
    formulas: [
      { tex: '\\{\\vet u+\\vet u^{r,\\infty},\\ \\tens E,\\ \\tens T\\}', label: 'struttura della soluzione', rif: 'Teo 5.1.1' },
      { tex: '\\int_{\\mathcal B}\\mathbb A\\tens E\\cdot\\tens E\\,dV=0\\ \\Rightarrow\\ \\tens E=\\tens O', label: 'passo chiave', rif: 'Teo 5.1.1' },
    ],
    explanation: `**Enunciato** (Teo 5.1.1). Problema elastico lineare con $\\mathbb A\\in\\mathrm{Pos}^+$: se la soluzione esiste, è unica a meno di uno spostamento rigido infinitesimo. Un solo $\\tens E$ e un solo $\\tens T$, non un solo $\\vet u$: un aereo in crociera (problema nelle forze) può traslare e ruotare rigidamente.

**Dimostrazione per assurdo.** Due soluzioni con gli stessi dati. Per sovrapposizione ($\\alpha=1$, $\\beta=-1$) la differenza risolve il problema a **dati nulli**. Si applica il TLV con FT $=\\{\\vet 0,\\vet 0,\\tens T\\}$ (equilibrato) e SD $=\\{\\vet u,\\tens E\\}$ (congruente, $\\vet u=\\vet 0$ su $\\partial\\mathcal B_v$): il lavoro esterno è nullo, quindi $\\int\\mathbb A\\tens E\\cdot\\tens E=0$. Per la definita positività, se $\\tens E\\ne\\tens O$ in un punto (e quindi in un intorno) l'integrale sarebbe positivo: $\\tens E=\\tens O$ ovunque, dunque $\\tens E_1=\\tens E_2$, $\\tens T_1=\\tens T_2$ e gli spostamenti differiscono di un moto rigido.

$\\mathbb A\\in\\mathrm{Pos}^+$ serve dunque tre volte: invertibilità del legame, plausibilità fisica e unicità.`,
    pitfalls: ['Dire che anche lo spostamento è sempre unico: lo è a meno di un moto rigido infinitesimo, salvo vincoli sufficienti.', 'Dimenticare il ruolo di $\\mathbb A\\in\\mathrm{Pos}^+$ nel passo finale.', 'Usare nel TLV un FT non equilibrato: il problema differenza ha dati nulli e quindi FT $=\\{\\vet 0,\\vet 0,\\tens T\\}$ è equilibrato.'],
    visual: { kind: 'svg', id: 'problema' },
    recall: [
      { id: 'c6.1-q1', kind: 'scelta', q: 'Quale problema risolve la differenza di due soluzioni con gli stessi dati?', options: ['Il problema a dati nulli', 'Il problema con dati doppi', 'Un problema nelle forze', 'Nessun problema'], correct: 0, why: 'Sovrapposizione con $\\alpha=1$, $\\beta=-1$ (Teo 5.1.1).', source: D(5, '5.1', 'Teo 5.1.1', 100) },
      { id: 'c6.1-q2', kind: 'vf', q: 'Per Kirchhoff lo spostamento di un corpo libero nello spazio è determinato univocamente.', answer: false, why: 'È determinato a meno di uno spostamento rigido infinitesimo (aereo in crociera).', source: D(5, '5.1', 'Teo 5.1.1', 99) },
      { id: 'c6.1-q3', kind: 'aperta', q: 'Perché da $\\int_{\\mathcal B}\\mathbb A\\tens E\\cdot\\tens E\\,dV=0$ segue $\\tens E=\\tens O$?', answer: 'Perché $\\mathbb A\\in\\mathrm{Pos}^+$: l’integrando è non negativo e positivo dove $\\tens E\\ne\\tens O$; se $\\tens E$ fosse non nullo in un punto lo sarebbe in un intorno (campi regolari) e l’integrale sarebbe positivo (§5.1).', source: D(5, '5.1', 'Teo 5.1.1', 100) },
    ],
  },
  {
    id: 'c6.2',
    module: 'm6',
    title: 'Problema di Saint-Venant: formulazione, ipotesi, semi-inverso',
    prereq: ['c6.1', 'c5.4'],
    source: D(5, '5.2.1–5.2.4', 'Def 5.2.1', '100–104'),
    meaning: 'Un cilindro retto molto allungato, isotropo e omogeneo, libero, con il mantello scarico e forze solo sulle basi. Si **congettura** che le fibre si scambino solo forze parallele all’asse e si ricava il resto: se tutto torna, per Kirchhoff è la soluzione.',
    formulas: [
      { tex: 'T_{xx}=T_{yy}=T_{xy}\\equiv0', label: 'ipotesi di Saint-Venant', rif: '§5.2.2' },
      { tex: 'T_{xz}=A(x,y),\\quad T_{yz}=B(x,y),\\quad T_{zz}=C(x,y)\\,z+D(x,y)', label: 'conseguenze dell’equilibrio', rif: '(⋆) §5.2.3' },
      { tex: 'T_{zx}n_x+T_{zy}n_y=0\\iff\\boldsymbol\\tau_z\\cdot\\hat n=0', label: 'mantello scarico', rif: '§5.2.3' },
    ],
    explanation: `**Def 5.2.1.** Problema elastico **nelle forze** per un **solido cilindrico retto** molto allungato (diametro della sezione molto minore di $L$), sezione semplicemente connessa, materiale elastico lineare omogeneo isotropo, $\\vet b=\\vet 0$, **mantello scarico**, forze arbitrarie sulle basi. Non è una trave, ma le sue soluzioni servono per le travi.

**Equazioni:** congruenza, equilibrio, simmetria e legame inverso con i moduli tecnici (18); al contorno $\\tens T\\hat n=\\vet 0$ sul mantello ($\\hat n=(n_x,n_y,0)$) e i carichi sulle basi.

**Ipotesi di Saint-Venant** (comportamento «a fibre», come un mazzo di spaghetti): fibre contigue si scambiano solo forze parallele all'asse, $T_{xx}=T_{yy}=T_{xy}\\equiv0$. Basta allora il vettore tensione sulla sezione trasversale.

**Conseguenze.** Le equilibrio danno $T_{xz}=A(x,y)$, $T_{yz}=B(x,y)$ e, derivando la terza rispetto a $z$, $T_{zz}=C(x,y)z+D(x,y)$. Sul mantello resta $\\boldsymbol\\tau_z\\cdot\\hat n=0$: **la tangenziale sul contorno della sezione è tangente al bordo**. Lo stato è **biassiale** ($III=0$, $II=-(T_{xz}^2+T_{yz}^2)$).

**Metodo semi-inverso.** Il problema diretto va dai dati alla soluzione, l'inverso dagli effetti al sistema; Saint-Venant sta in mezzo: si congettura parte della soluzione da un'interpretazione meccanica e si ricava il resto. Se la terna soddisfa tutte le equazioni, per Kirchhoff è **la** soluzione: il metodo non ne peggiora la qualità. Il prezzo è che il dato sulle basi non è più arbitrario.`,
    pitfalls: ['Confondere il solido di Saint-Venant con una trave: è un solido tridimensionale, le cui soluzioni si usano per le travi.', 'Dimenticare che sul bordo della sezione la tangenziale è tangente al contorno.', 'Pensare che il metodo semi-inverso dia una soluzione approssimata: se tutto torna è quella esatta (Kirchhoff).'],
    visual: { kind: 'trave3d', scene: { mode: 'fibre', section: 'rettangolo', sections: ['rettangolo', 'doppioT', 'cerchio'], controls: ['section'] } },
    recall: [
      { id: 'c6.2-q1', kind: 'scelta', q: 'Che cosa afferma l’ipotesi di Saint-Venant?', options: ['$T_{xx}=T_{yy}=T_{xy}\\equiv0$', '$T_{zz}\\equiv0$', '$T_{xz}=T_{yz}\\equiv0$', '$\\tens T$ sferico'], correct: 0, why: '§5.2.2: le fibre si scambiano solo forze parallele all’asse.', source: D(5, '5.2.2', undefined, 102) },
      { id: 'c6.2-q2', kind: 'vf', q: 'Nel solido di Saint-Venant il mantello è caricato e le basi sono libere.', answer: false, why: 'Il contrario: mantello scarico, forze sulle basi (Def 5.2.1).', source: D(5, '5.2', 'Def 5.2.1', 100) },
      { id: 'c6.2-q3', kind: 'aperta', q: 'Perché $T_{zz}$ è lineare in $z$?', answer: 'Dalle prime due equazioni di equilibrio $\\partial T_{xz}/\\partial z=\\partial T_{yz}/\\partial z=0$; derivando la terza rispetto a $z$ si ottiene $\\partial^2T_{zz}/\\partial z^2=0$, quindi $T_{zz}=C(x,y)z+D(x,y)$ (§5.2.3).', source: D(5, '5.2.3', '(⋆)', 103) },
    ],
  },
  {
    id: 'c6.3',
    module: 'm6',
    title: 'Equilibrio globale, CdS, problema indebolito, postulato',
    prereq: ['c6.2'],
    source: D(5, '5.2.5–5.2.8', 'eq (5.1), Def 5.2.2, Teo 5.2.3–5.2.4', '104–108'),
    meaning: 'I carichi sulle basi devono essere in equilibrio; le caratteristiche della sollecitazione (risultante e momento sulla sezione) sono costanti, salvo i flettenti che variano al più linearmente. Si assegnano solo loro (problema indebolito): per il postulato di Saint-Venant, lontano dalle basi non conta come sono distribuiti.',
    formulas: [
      { tex: '\\vet R_0+\\vet R_L=\\vet 0,\\quad\\vet M_0+\\vet M_L+L\\hat e_z\\wedge\\vet R_L=\\vet 0', label: 'equilibrio globale', rif: 'eq (5.1)' },
      { tex: 'N=\\int T_{zz},\\ T_x=\\int T_{zx},\\ T_y=\\int T_{zy},\\ M_x=\\int T_{zz}y,\\ M_y=-\\int T_{zz}x,\\ M_z=\\int(T_{zy}x-T_{zx}y)', label: 'caratteristiche della sollecitazione', rif: 'Def 5.2.2' },
      { tex: 'M_x(z)=M_x-T_y(L-z),\\qquad M_y(z)=M_y+T_x(L-z)', label: 'leggi di variazione', rif: 'Teo 5.2.3' },
    ],
    explanation: `**Equilibrio globale.** In un problema nelle forze il dato deve essere equivalente a zero: risultanti e momenti delle forze sulle due basi (rispetto ai baricentri $G_0$, $G_L$) soddisfano l'eq. (5.1).

**CdS** (Def 5.2.2): per la sezione $A_z$, $\\vet R(z)=\\int\\vet t_{e_z}dA$, $\\vet M(z)=\\int(X-G_z)\\wedge\\vet t_{e_z}dA$, con componenti negli assi principali centrali. Dall'equilibrio del tratto tra la base di sinistra e $A_z$, sottraendo (5.1): $\\vet R(z)=\\vet R_L$, $\\vet M(z)=\\vet M_L+(L-z)\\hat e_z\\wedge\\vet R_L$.

**Teo 5.2.3:** tagli, sforzo normale e momento torcente costanti; flettenti al più lineari.

**Problema indebolito.** La congettura vincola anche le tensioni sulle basi, quindi non si può assegnare un dato **forte** (punto per punto): si assegna un dato **debole**, cioè le sole CdS (es. $\\int T_{zz}dA=\\hat N$). Si assegna così una **classe** di dati staticamente equivalenti; risolto il problema, le tensioni vere sulle basi si ricavano a posteriori (back analysis). Basta assegnare la base di destra.

**Postulato di Saint-Venant** (Teo 5.2.4, dimostrato nel 1960, enunciato senza dimostrazione): soluzioni con distribuzioni staticamente equivalenti sono **indistinguibili a sufficiente distanza dalle basi** (distanza di estinzione legata ai raggi d'inerzia). Nei telai vale nelle **regioni B** (Beam, Bernoulli), non nelle **regioni D** (estremità, nodi, cambi di curvatura), dove servono metodi numerici.`,
    pitfalls: ['Pensare che il momento flettente sia costante in presenza di taglio: varia linearmente.', 'Assegnare un dato puntuale sulle basi: la congettura lo impedisce, si assegnano le CdS.', 'Credere che il postulato valga vicino alle basi o nei nodi (regioni D).'],
    visual: { kind: 'svg', id: 'cds' },
    recall: [
      { id: 'c6.3-q1', kind: 'scelta', q: 'Come varia il momento flettente lungo il solido di Saint-Venant?', options: ['Al più linearmente', 'È sempre costante', 'Quadraticamente', 'Come il taglio'], correct: 0, why: 'Teo 5.2.3: $M_x(z)=M_x-T_y(L-z)$.', source: D(5, '5.2.6', 'Teo 5.2.3', 106) },
      { id: 'c6.3-q2', kind: 'vf', q: 'Il postulato di Saint-Venant vale anche nei nodi di un telaio.', answer: false, why: 'Vale nelle regioni B, non nelle regioni D (nodi, estremità, cambi di curvatura) (§5.2.8).', source: D(5, '5.2.8', 'Teo 5.2.4', 108) },
      { id: 'c6.3-q3', kind: 'aperta', q: 'Che differenza c’è tra dato forte e dato debole sulle basi?', answer: 'Forte: le tensioni sono assegnate punto per punto ($T_{zx}=\\hat s^+_x$, …). Debole: si assegnano solo integrali, cioè le CdS (es. $N=\\hat N$), quindi una classe di distribuzioni staticamente equivalenti (§5.2.7).', source: D(5, '5.2.7', undefined, 107) },
    ],
  },
  {
    id: 'c6.4',
    module: 'm6',
    title: 'Sforzo normale',
    prereq: ['c6.3', 'c5.2'],
    source: D(5, '5.3–5.4', 'Def 5.4.1, Teo 5.4.2', '109–113'),
    meaning: 'Con due forze uguali e opposte sull’asse la tensione è **uniforme e monoassiale**, $\\sigma_z=N/A$; il solido si allunga di $NL/(EA)$ e la sezione si contrae in modo omotetico, restando piana e ortogonale all’asse.',
    formulas: [
      { tex: '[\\tens T]=\\operatorname{diag}\\Big(0,0,\\frac NA\\Big),\\quad[\\tens E]=\\operatorname{diag}\\Big(-\\frac{\\nu N}{EA},-\\frac{\\nu N}{EA},\\frac N{EA}\\Big)', label: 'soluzione', rif: 'Teo 5.4.2' },
      { tex: '\\Delta L=\\frac{NL}{EA}=\\frac N{K_N},\\quad K_N=\\frac{EA}L,\\quad N=EA\\,w\'', label: 'allungamento e rigidezza estensionale', rif: '§5.4.4' },
      { tex: '\\Phi=\\frac{N^2L}{2EA}=\\frac12N\\Delta L', label: 'energia (Clapeyron)', rif: '§5.4.4' },
    ],
    explanation: `**I quattro casi** (§5.3): per sovrapposizione bastano sforzo normale, flessione semplice, flessione composta (taglio) e torsione; i primi due danno solo $\\sigma_z$, gli altri anche tangenziali. Lo sforzo normale eccentrico è un quinto caso derivato.

**Def 5.4.1.** Forze sulle basi staticamente equivalenti a due forze $N$ uguali e opposte lungo l'asse (trazione $N>0$).

**Congetture:** oltre a quella di Saint-Venant, $T_{xz}=T_{yz}\\equiv0$, $T_{zz}=D$ costante. **Equilibrio:** campo e mantello soddisfatti; sulla base $N=DA$, quindi $D=N/A$; i momenti sono nulli perché gli assi sono baricentrici. **Congruenza:** si integrano $\\partial u/\\partial x=-\\nu N/(EA)$, … e si verifica che le funzioni d'integrazione formano uno spostamento rigido.

**Tensione:** uniforme, monoassiale; nessuna tangenziale sulla sezione, ma sì su altre giaciture: $\\tau_{\\max}=N/(2A)$ a 45° (cerchio di Mohr). **Deformazione:** scorrimenti nulli, la sezione resta piana e ortogonale all'asse e si contrae in modo **omotetico** (il baricentro non si sposta). $\\Delta V=\\frac{1-2\\nu}ENL$.

**Clapeyron:** $\\Phi=\\frac12N\\Delta L$; il ½ nasce perché il carico cresce lentamente da 0 a $N$: è l'area del triangolo sotto la retta $N$–$\\Delta L$.`,
    pitfalls: ['Dire che non ci sono tangenziali: mancano sulla sezione trasversale, non su altre giaciture.', 'Dimenticare il ½ nell’energia (Clapeyron).', 'Pensare che la sezione resti uguale: si contrae (per $N>0$) in modo omotetico.'],
    visual: { kind: 'trave3d', scene: { mode: 'normale', section: 'rettangolo', controls: ['section', 'amp'] } },
    recall: [
      { id: 'c6.4-q1', kind: 'scelta', q: 'Qual è la rigidezza estensionale del solido?', options: ['$EA/L$', '$EJ/L$', '$GA/L$', '$EA$'], correct: 0, why: '§5.4.4: $\\Delta L=N/K_N$, $K_N=EA/L$.', source: D(5, '5.4.4', undefined, 112) },
      { id: 'c6.4-q2', kind: 'vf', q: 'Nello sforzo normale la sezione trasversale si deforma in modo omotetico.', answer: true, why: '§5.4.4: $v/u=y/x$, contrazione per $N>0$, baricentro fermo.', source: D(5, '5.4.4', undefined, 113) },
      { id: 'c6.4-q3', kind: 'aperta', q: 'Da dove viene il ½ di $\\Phi=\\frac12N\\Delta L$?', answer: 'Il carico è applicato lentamente, crescendo da 0 a $N$: il lavoro è l’area del triangolo sotto la retta $N$–$\\Delta L$, non quella del rettangolo (Clapeyron, §5.4.4).', source: D(5, '5.4.4', undefined, 113) },
    ],
  },
  {
    id: 'c6.5',
    module: 'm6',
    title: 'Assi principali centrali ed ellisse d’inerzia',
    prereq: ['c6.3'],
    source: D(5, '5.5.1–5.5.2', 'Def 5.5.2', '113–115'),
    meaning: 'Gli assi principali centrali d’inerzia sono la coppia di assi baricentrici ortogonali con momento centrifugo nullo; l’ellisse centrale d’inerzia ne rappresenta i raggi d’inerzia. La flessione è retta se l’asse di sollecitazione coincide con uno di essi.',
    formulas: [
      { tex: 'J_{xy}=\\int_A xy\\,dA=0,\\qquad\\rho_x=\\sqrt{J_x/A},\\ \\rho_y=\\sqrt{J_y/A}', label: 'APCdI e raggi d’inerzia', rif: '§5.5.1' },
      { tex: 'M_x=M\\cos\\alpha,\\quad M_y=M\\sin\\alpha,\\quad\\gamma=\\tfrac\\pi2+\\alpha', label: 'convenzioni', rif: '§5.5.2' },
    ],
    explanation: `**Def 5.5.1.** Flessione semplice: forze sulle basi equivalenti a due coppie uguali e opposte nel piano delle basi. Il piano di sollecitazione è ortogonale a $\\vet M$; l'**asse di sollecitazione** $s$ è la sua traccia sulla sezione.

**APCdI:** coppia di assi ortogonali, baricentrici e coniugati ($J_{xy}=0$). Un asse di simmetria è principale. **Ellisse centrale d'inerzia:** diagramma polare dei raggi d'inerzia; il raggio relativo a un asse si riporta lungo la direzione **coniugata** (lungo $y$ si riporta $\\rho_x$). Casi: L a lati uguali (asse di simmetria sulla bisettrice, baricentro fuori dalla figura); quadrato e poligoni regolari (ellisse circolare: ogni coppia ortogonale è principale).

**Convenzioni** (§5.5.2): $x$ è l'APCdI di inerzia massima; $\\alpha$ è l'inclinazione di $\\vet M$ su $x$; $\\gamma=\\frac\\pi2+\\alpha$ quella di $s$.

**Def 5.5.2.** Flessione **retta** se $s$ coincide con un APCdI, **deviata** altrimenti (doppio T con momento obliquo: deviata; quadrato: sempre retta).`,
    pitfalls: ['Riportare $\\rho_x$ lungo $x$: va lungo la direzione coniugata, $y$.', 'Pensare che un momento obliquo dia sempre flessione deviata: nel quadrato (ellisse circolare) è sempre retta.', 'Usare assi baricentrici non principali nelle formule di Navier.'],
    visual: { kind: 'svg', id: 'sezione', params: { tab: 'ecdi' } },
    recall: [
      { id: 'c6.5-q1', kind: 'scelta', q: 'Quando la flessione è retta?', options: ['Quando l’asse di sollecitazione coincide con un APCdI', 'Quando il momento è orizzontale', 'Quando la sezione è simmetrica', 'Quando $N=0$'], correct: 0, why: 'Def 5.5.2.', source: D(5, '5.5.2', 'Def 5.5.2', 115) },
      { id: 'c6.5-q2', kind: 'vf', q: 'In una sezione quadrata ogni coppia di assi baricentrici ortogonali è principale.', answer: true, why: 'L’ellisse centrale d’inerzia è un cerchio (§5.5.1).', source: D(5, '5.5.1', undefined, 114) },
      { id: 'c6.5-q3', kind: 'aperta', q: 'Come si costruisce l’ellisse centrale d’inerzia?', answer: 'È il diagramma polare dei raggi d’inerzia $\\rho=\\sqrt{J/A}$: il raggio relativo a un asse si riporta lungo la direzione coniugata; negli APCdI ha semiassi $\\rho_y$ lungo $x$ e $\\rho_x$ lungo $y$ (§5.5.1).', source: D(5, '5.5.1', undefined, 114) },
    ],
  },
  {
    id: 'c6.6',
    module: 'm6',
    title: 'Flessione semplice retta (Navier)',
    prereq: ['c6.4', 'c6.5'],
    source: D(5, '5.5.3–5.5.4', undefined, '115–120'),
    meaning: 'Con una coppia $M_x$ la tensione è monoassiale e lineare nella distanza dall’asse neutro (formula di Navier); le sezioni restano piane, l’asse si incurva ad arco di cerchio con curvatura $M_x/(EJ_x)$ e la sezione si incurva in verso opposto (anticlastica).',
    formulas: [
      { tex: '\\sigma_z=\\frac{M_x}{J_x}\\,y', label: 'formula di Navier', rif: '§5.5.3' },
      { tex: 'M_x=EJ_x\\,\\kappa,\\quad r=\\frac{EJ_x}{M_x},\\quad\\Delta\\varphi=\\frac{M_xL}{EJ_x}=\\frac{M_x}{K_f}', label: 'linea elastica flessionale', rif: '§5.5.3' },
      { tex: '\\rho\'=-\\frac{EJ_x}{\\nu M_x},\\qquad|\\rho\'|=\\frac r\\nu', label: 'anticlastica', rif: '§5.5.3' },
      { tex: '\\Phi=\\frac{M_x^2L}{2EJ_x}=\\frac12M_x\\Delta\\varphi', label: 'energia', rif: '§5.5.3' },
    ],
    explanation: `**Congetture:** Saint-Venant più $T_{zx}=T_{zy}\\equiv0$, $T_{zz}=Dy$. **Equilibrio:** $N=DS_x=0$, $M_x=DJ_x$ quindi $D=M_x/J_x$; $M_y=-DJ_{xy}=0$ perché gli assi sono principali. **Congruenza:** le componenti di $\\tens E$ sono lineari, la condizione di compatibilità è soddisfatta; integrando e correggendo con due termini si ottiene

$$u=-\\frac{\\nu M_x}{EJ_x}xy,\\quad v=-\\frac{\\nu M_x}{2EJ_x}\\Big[(y^2-x^2)+\\frac{z^2}\\nu\\Big],\\quad w=\\frac{M_x}{EJ_x}yz.$$

**Navier:** stato monoassiale; asse neutro $y=0$; diagramma **a farfalla**: con $M_x>0$ fibre tese per $y>0$ (sotto). Estremi ai lembi, $\\sigma=M_x/W$ con i **moduli di resistenza** $W=J_x/y$.

**Deformazione:** scorrimenti nulli, quindi la sezione resta **piana** e ortogonale all'asse deformato (**Bernoulli–Navier**). L'asse si incurva ad arco di cerchio: $\\kappa=M_x/(EJ_x)$, rotazione relativa $\\Delta\\varphi=M_xL/(EJ_x)$, rigidezza flessionale $K_f=EJ_x/L$. A parità di area conviene allontanare il materiale dall'asse: il **doppio T** è ottimale.

**Anticlastica:** per effetto Poisson la sezione si incurva in verso opposto all'asse, con raggio $|\\rho'|=r/\\nu>r$. **Volume:** $\\Delta V=0$ ($S_x=0$). **Energia** $\\Phi=\\frac12M_x\\Delta\\varphi$.

Con $M_y$ (§5.5.4): $\\sigma_z=-\\frac{M_y}{J_y}x$, asse neutro $\\equiv y$.`,
    pitfalls: ['Sbagliare il segno: con $y$ verso il basso e $M_x>0$ le fibre tese sono sotto.', 'Dire che la sezione non si deforma: resta piana, ma nel suo piano si incurva (anticlastica).', 'Dimenticare il segno meno in $\\sigma_z=-M_yx/J_y$.'],
    visual: { kind: 'trave3d', scene: { mode: 'flessione', section: 'rettangolo', alpha: 0, controls: ['section', 'amp'] } },
    recall: [
      { id: 'c6.6-q1', kind: 'scelta', q: 'Con $M_x>0$ e $y$ verso il basso, dove sono le fibre tese?', options: ['Sotto l’asse neutro ($y>0$)', 'Sopra l’asse neutro', 'Su tutta la sezione', 'Sull’asse neutro'], correct: 0, why: '§5.5.3: $\\sigma_z=M_xy/J_x>0$ per $y>0$.', source: D(5, '5.5.3', undefined, 117) },
      { id: 'c6.6-q2', kind: 'vf', q: 'In flessione retta le sezioni restano piane.', answer: true, why: 'Scorrimenti nulli: ipotesi di Bernoulli–Navier ritrovata come risultato (§5.5.3).', source: D(5, '5.5.3', undefined, 118) },
      { id: 'c6.6-q3', kind: 'aperta', q: 'Che cos’è la deformazione anticlastica?', answer: 'Per effetto Poisson le fibre tese si contraggono lateralmente e quelle compresse si dilatano: l’asse neutro della sezione si incurva in verso opposto all’asse del solido, con raggio $|\\rho\'|=EJ_x/(\\nu M_x)=r/\\nu$ (§5.5.3).', source: D(5, '5.5.3', undefined, 119) },
    ],
  },
  {
    id: 'c6.7',
    module: 'm6',
    title: 'Flessione deviata e teoremi della flessione',
    prereq: ['c6.6'],
    source: D(5, '5.5.5', 'Teo 5.5.3–5.5.4', '120–122'),
    meaning: 'Con un momento obliquo l’asse neutro non è ortogonale all’asse di sollecitazione ma **coniugato** rispetto all’ellisse d’inerzia, e il solido si inflette nel piano ortogonale all’asse neutro, diverso da quello della coppia.',
    formulas: [
      { tex: '\\sigma_z=\\frac{M_x}{J_x}y-\\frac{M_y}{J_y}x', label: 'formula binomia', rif: '§5.5.5' },
      { tex: '\\sigma_z=\\frac{M_n}{J_n}f,\\quad M_n=M\\cos\\delta,\\quad J_n=J_x\\cos^2\\beta+J_y\\sin^2\\beta', label: 'formula monomia', rif: '§5.5.5' },
      { tex: '\\tan\\beta\\,\\tan\\gamma=-\\frac{\\rho_x^2}{\\rho_y^2}', label: 'primo teorema: n e s coniugati', rif: 'Teo 5.5.3' },
      { tex: '\\tan\\theta\\,\\tan\\beta=-1', label: 'secondo teorema: f ⊥ n', rif: 'Teo 5.5.4' },
    ],
    explanation: `**Angoli** (misurati da $x$): $\\alpha$ di $\\vet M$, $\\gamma=\\frac\\pi2+\\alpha$ di $s$, $\\beta$ dell'asse neutro $n$ (orientato in modo che $\\vet M$ abbia componente positiva lungo $n$), $\\theta=\\frac\\pi2+\\beta$ dell'asse di flessione $f$, $\\delta=\\beta-\\alpha$ angolo di deviazione.

**Binomia:** sovrapposizione di $M_x$ e $M_y$; scomoda perché le zone compresse dei due diagrammi sono diverse. **Monomia:** la tensione dipende solo dalla distanza $f$ dall'asse neutro, con $M_n$ componente di $\\vet M$ lungo $n$ e $J_n$ momento d'inerzia rispetto a $n$.

**Primo teorema** (Teo 5.5.3): $n$ e $s$ sono **coniugati** rispetto all'ellisse centrale d'inerzia. Dall'asse neutro $\\sigma_z=0$: $\\tan\\beta=\\tan\\alpha\\,\\rho_x^2/\\rho_y^2$, e $\\tan\\alpha=-1/\\tan\\gamma$.

**Secondo teorema** (Teo 5.5.4): $f\\perp n$. Le componenti dello spostamento dell'asse hanno la stessa dipendenza da $z$ ($\\propto z^2$): l'asse resta piano; il rapporto $v/u$ dà $\\tan\\theta=-1/\\tan\\beta$.

**Procedura:** $(M,\\alpha)\\to s\\xrightarrow{\\text{I}}n\\xrightarrow{\\text{II}}f$. In flessione retta $\\beta=0$, $\\theta=\\pi/2$ e la monomia torna Navier.`,
    pitfalls: ['Disegnare l’asse neutro ortogonale a $s$: lo è solo in flessione retta o con ellisse circolare.', 'Confondere coniugato con ortogonale.', 'Pensare che il solido si inflette nel piano della coppia: si inflette nel piano ortogonale a $n$.'],
    visual: { kind: 'svg', id: 'sezione', params: { tab: 'deviata', section: 'doppioT', alpha: 30 } },
    recall: [
      { id: 'c6.7-q1', kind: 'scelta', q: 'Che relazione c’è tra asse neutro e asse di sollecitazione?', options: ['Sono coniugati rispetto all’ellisse centrale d’inerzia', 'Sono sempre ortogonali', 'Coincidono', 'Sono paralleli'], correct: 0, why: 'Teo 5.5.3.', source: D(5, '5.5.5', 'Teo 5.5.3', 121) },
      { id: 'c6.7-q2', kind: 'vf', q: 'L’asse di flessione è ortogonale all’asse neutro.', answer: true, why: 'Teo 5.5.4: $\\tan\\theta\\tan\\beta=-1$.', source: D(5, '5.5.5', 'Teo 5.5.4', 122) },
      { id: 'c6.7-q3', kind: 'aperta', q: 'Dimostra il primo teorema della flessione.', answer: 'Sull’asse neutro $\\sigma_z=0$: $\\frac{M_x}{J_x}y=\\frac{M_y}{J_y}x$, quindi $\\tan\\beta=\\frac yx=\\frac{M_y}{M_x}\\frac{J_x}{J_y}=\\tan\\alpha\\frac{\\rho_x^2}{\\rho_y^2}$; con $\\gamma=\\frac\\pi2+\\alpha$, $\\tan\\alpha=-1/\\tan\\gamma$, da cui $\\tan\\beta\\tan\\gamma=-\\rho_x^2/\\rho_y^2$ (Teo 5.5.3).', source: D(5, '5.5.5', 'Teo 5.5.3', 121) },
    ],
  },
  {
    id: 'c6.8',
    module: 'm6',
    title: 'Sforzo normale eccentrico, nocciolo, parzializzazione',
    prereq: ['c6.7'],
    source: D(5, '5.6', 'Def 5.6.1–5.6.2', '122–125'),
    facoltativo: 'La dispensa avverte che è negli appunti ma non è stato trattato a lezione (§5.6); la domanda 9 del riquadro resta per completezza.',
    meaning: 'Una forza parallela all’asse ma non baricentrica equivale a sforzo normale più flessione. Il nocciolo centrale d’inerzia è la zona in cui deve cadere il centro di sollecitazione perché la sezione sia tutta compressa (o tutta tesa); con materiali non reagenti a trazione la sezione si parzializza.',
    formulas: [
      { tex: '\\sigma_z=\\frac NA\\Big(1+\\frac{xx_c}{\\rho_y^2}+\\frac{yy_c}{\\rho_x^2}\\Big)', label: 'formula trinomia', rif: '§5.6' },
      { tex: 'x_c=-\\frac{M_y}N,\\qquad y_c=\\frac{M_x}N', label: 'centro di sollecitazione', rif: 'Def 5.6.1' },
      { tex: '\\sigma_{\\max}=\\frac{2N}{3uB}', label: 'regola delle 3u (rettangolo)', rif: '§5.6.2' },
    ],
    explanation: `**Def 5.6.1.** Forze equivalenti a due forze uguali e opposte parallele all'asse, con traccia nel **centro di sollecitazione** $c$; trasportandole nel baricentro nasce la coppia $M_x=Ny_c$, $M_y=-Nx_c$.

**Trinomia** e asse neutro $1+\\frac{xx_c}{\\rho_y^2}+\\frac{yy_c}{\\rho_x^2}=0$: $c$ e $n$ sono **polo e antipolare** nella polarità d'inerzia.

**Nocciolo centrale d'inerzia** (Def 5.6.2): luogo degli antipoli delle rette che non tagliano la sezione; il contorno è dato dalle rette radenti. $c$ nel baricentro: tensione uniforme; dentro il nocciolo: trapezio, tutta compressa; sul contorno: triangolo; fuori: farfalla; $c\\to\\infty$ con $N\\to0$: flessione semplice.

**Non reagente a trazione** (contatto unilatero, murature, fondazioni): con $c$ fuori dal nocciolo la sezione si **parzializza**; la parte reagente è tale che $c$ cada sul contorno del **suo** nocciolo; diagramma triangolare. $c$ sul contorno della sezione: reagisce un punto, $\\sigma\\to\\infty$; fuori: ribaltamento. **Rettangolo:** nocciolo = rombo dei terzi medi ($\\pm H/6$, $\\pm B/6$); con $c$ a distanza $u$ dal lembo compresso reagisce un'altezza $3u$ e $\\sigma_{\\max}=2N/(3uB)$.`,
    pitfalls: ['Dimenticare che l’argomento è segnalato come non trattato a lezione.', 'Confondere il nocciolo con l’ellisse d’inerzia.', 'Usare la trinomia per un materiale non reagente a trazione con $c$ fuori dal nocciolo.'],
    visual: { kind: 'svg', id: 'sezione', params: { tab: 'nocciolo', section: 'rettangolo', yc: 10 } },
    recall: [
      { id: 'c6.8-q1', kind: 'scelta', q: 'Qual è il nocciolo centrale d’inerzia di un rettangolo $B\\times H$?', options: ['Il rombo dei terzi medi ($\\pm H/6$, $\\pm B/6$)', 'Il rettangolo $B/3\\times H/3$', 'Il cerchio inscritto', 'L’ellisse d’inerzia'], correct: 0, why: '§5.6.2.', source: D(5, '5.6.2', undefined, 125) },
      { id: 'c6.8-q2', kind: 'vf', q: 'Con il centro di sollecitazione dentro il nocciolo la sezione è tutta compressa (o tutta tesa).', answer: true, why: 'Def 5.6.2 e discussione dei casi $c_1$–$c_4$.', source: D(5, '5.6.1', 'Def 5.6.2', 124) },
      { id: 'c6.8-q3', kind: 'aperta', q: 'Ricava la regola delle 3u.', answer: 'Parte reagente alta $h$ con diagramma triangolare: la risultante $\\frac12\\sigma_{\\max}Bh$ è a $h/3$ dal lembo compresso e deve passare per $c$, a distanza $u$: $h=3u$, quindi $N=\\frac12\\sigma_{\\max}B(3u)$ e $\\sigma_{\\max}=2N/(3uB)$ (§5.6.2).', source: D(5, '5.6.2', undefined, 125) },
    ],
  },
];
