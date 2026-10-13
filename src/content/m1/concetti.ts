/**
 * Modulo 1 — Algebra e analisi tensoriale (Cap. 1, pp. 1–14). Fonte: tools/testi/cap-01.md.
 * Notazione della dispensa: \tens{A} tensore del II ordine, \vet{u} vettore, \mathbb{A} IV ordine.
 */
import { D } from '../../engine/types';
import type { Concept } from '../types';

export const M1_CONCETTI: Concept[] = [
  {
    id: 'c1.1',
    module: 'm1',
    title: 'Vettori, tensori del II ordine e componenti',
    prereq: [],
    source: D(1, '1.1–1.2.3', 'Def 1.1.1, 1.2.1, 1.2.2', '1–3'),
    meaning: 'Un tensore del II ordine è una **trasformazione lineare** che a ogni vettore associa un altro vettore. È un ente intrinseco: le sue 9 componenti dipendono dal riferimento scelto, il tensore no.',
    formulas: [
      { tex: '\\tens A:\\mathcal V\\to\\mathcal V,\\quad \\tens A(\\alpha\\vet u+\\beta\\vet v)=\\alpha\\tens A\\vet u+\\beta\\tens A\\vet v', label: 'definizione e linearità', rif: 'Def 1.2.1' },
      { tex: 'A_{ij}:=\\tens A\\hat e_j\\cdot\\hat e_i', label: 'componenti', rif: 'Def 1.2.2' },
      { tex: '(\\tens A\\vet v)_i=\\textstyle\\sum_j A_{ij}v_j', label: 'applicazione in componenti', rif: '§1.2.2' },
    ],
    explanation: `La dispensa distingue due livelli: la **notazione assoluta**, indipendente dal riferimento, e la **notazione in componenti**, che sottintende sempre «fissato un riferimento» ortonormale destrorso $\\{\\hat e_1,\\hat e_2,\\hat e_3\\}$ con $\\hat e_i\\cdot\\hat e_j=\\delta_{ij}$.

Gli enti si classificano per **ordine**: in 3D un ente di ordine $n$ ha $3^n$ componenti. Scalari (1), vettori (3), tensori del II ordine (9), del IV ordine (81).

La componente $A_{ij}$ si legge $(\\tens A\\hat e_j)\\cdot\\hat e_i$: prima si applica il tensore al versore, poi si proietta. Quindi la **colonna $j$** della matrice $[\\tens A]$ contiene le componenti dell'immagine di $\\hat e_j$.

Casi notevoli: l'identità $\\tens I$ ($I_{ij}=\\delta_{ij}$) e il tensore nullo $\\tens O$. Dalla linearità segue $\\tens A\\vet 0=\\vet 0$.`,
    pitfalls: [
      'Leggere $\\tens A\\hat e_j\\cdot\\hat e_i$ come $\\tens A(\\hat e_j\\cdot\\hat e_i)$: il tensore finirebbe per operare su un numero (Attenzione, p. 3).',
      'Confondere il tensore con la sua matrice: la matrice cambia con il riferimento, il tensore no.',
      'Scambiare righe e colonne: la colonna $j$ è $\\tens A\\hat e_j$, non la riga.',
    ],
    visual: { kind: 'tensori3d', scene: { mode: 'trasforma', presets: ['taglio', 'stiramento', 'rotazione', 'generico'], controls: ['preset', 'cube'], cube: false } },
    recall: [
      { id: 'c1.1-q1', kind: 'scelta', q: 'Che cosa contiene la colonna $j$ della matrice $[\\tens A]$?', options: ['Le componenti di $\\tens A\\hat e_j$', 'Le componenti di $\\tens A^T\\hat e_j$', 'I coefficienti di $\\hat e_j$ nella riga $j$', 'La traccia di $\\tens A$'], correct: 0, why: 'Da $A_{ij}=\\tens A\\hat e_j\\cdot\\hat e_i$: fissato $j$, al variare di $i$ si leggono le componenti del vettore $\\tens A\\hat e_j$.', source: D(1, '1.2.2', 'Def 1.2.2', 2) },
      { id: 'c1.1-q2', kind: 'vf', q: 'Un tensore del II ordine trasforma sempre il vettore nullo nel vettore nullo.', answer: true, why: 'È il caso $\\alpha=\\beta=0$ della linearità: $\\tens A\\vet 0=\\vet 0$ (§1.2.1).', source: D(1, '1.2.1', 'Def 1.2.1', 2) },
      { id: 'c1.1-q3', kind: 'aperta', q: 'Quante componenti ha un tensore del IV ordine in 3D, e perché?', answer: '$3^4=81$: il numero di componenti, fissato il riferimento in uno spazio tridimensionale, è $3^{\\text{ordine}}$ (§1.1.3).', source: D(1, '1.1.3', undefined, 2) },
    ],
  },
  {
    id: 'c1.2',
    module: 'm1',
    title: 'Diade, base di Lin, proiettori, composizione',
    prereq: ['c1.1'],
    source: D(1, '1.2.4–1.2.6', 'Def 1.2.3, Prop 1.2.4, Def 1.2.5–1.2.7', '3–4'),
    meaning: 'La **diade** $\\vet a\\otimes\\vet b$ è il tensore più semplice: manda ogni vettore in un multiplo di $\\vet a$. Le 9 diadi dei versori sono una base: ogni tensore è una loro combinazione, con coefficienti le sue componenti.',
    formulas: [
      { tex: '(\\vet a\\otimes\\vet b)\\vet u=(\\vet b\\cdot\\vet u)\\,\\vet a,\\qquad (\\vet a\\otimes\\vet b)_{ij}=a_ib_j', label: 'diade', rif: 'Def 1.2.3' },
      { tex: '\\tens A=\\textstyle\\sum_{i,j}A_{ij}\\,\\hat e_i\\otimes\\hat e_j', label: 'base di Lin', rif: 'Prop 1.2.4' },
      { tex: '\\vet u=(\\hat e\\otimes\\hat e)\\vet u+(\\tens I-\\hat e\\otimes\\hat e)\\vet u', label: 'proiettori', rif: 'Def 1.2.5' },
      { tex: '(\\tens A\\tens B)\\vet u=\\tens A(\\tens B\\vet u),\\qquad (\\tens A\\tens B)_{ij}=\\textstyle\\sum_k A_{ik}B_{kj}', label: 'composizione', rif: 'Def 1.2.7' },
    ],
    explanation: `La diade trasforma un vettore in un vettore **parallelo ad $\\vet a$**, con intensità proporzionale alla componente di $\\vet u$ lungo $\\vet b$.

Con le diadi dei versori si passa dalla notazione indiciale a quella assoluta: $\\tens A=\\sum_{ij}A_{ij}\\,\\hat e_i\\otimes\\hat e_j$ (Prop 1.2.4). Sono indipendenti: una combinazione nulla ha tutti i coefficienti nulli.

Con $\\hat e$ versore, $\\hat e\\otimes\\hat e$ è il **proiettore** in direzione $\\hat e$: dà il vettore lungo $\\hat e$ con modulo (con segno) pari alla componente di $\\vet u$. $\\tens I-\\hat e\\otimes\\hat e$ è il **proiettore ortogonale**: dà la parte nel piano $\\pi\\perp\\hat e$.

La **composizione** $\\tens A\\tens B$ applica prima $\\tens B$ e poi $\\tens A$. In generale **non è commutativa**. Commutano con ogni tensore tutti e soli i tensori sferici $\\lambda\\tens I$.`,
    pitfalls: [
      'Dire che $\\vet a\\otimes\\vet b$ dà vettori paralleli a $\\vet b$: sono paralleli ad $\\vet a$; $\\vet b$ dice solo «quanto».',
      'Dare per scontato che $\\tens A\\tens B=\\tens B\\tens A$.',
      'Ordine nella composizione: in $\\tens A\\tens B\\vet u$ agisce prima $\\tens B$.',
    ],
    visual: { kind: 'tensori3d', scene: { mode: 'proiettori', controls: ['dir', 'u'] } },
    recall: [
      { id: 'c1.2-q1', kind: 'vf', q: 'La diade $\\vet a\\otimes\\vet b$ trasforma ogni vettore in un vettore parallelo a $\\vet b$.', answer: false, why: '$(\\vet a\\otimes\\vet b)\\vet u=(\\vet b\\cdot\\vet u)\\vet a$: il risultato è parallelo ad $\\vet a$ (Def 1.2.3).', source: D(1, '1.2.4', 'Def 1.2.3', 3) },
      { id: 'c1.2-q2', kind: 'scelta', q: 'Quanto vale $(\\vet a\\otimes\\vet b)_{ij}$?', options: ['$a_ib_j$', '$a_jb_i$', '$a_i+b_j$', '$\\vet a\\cdot\\vet b\\,\\delta_{ij}$'], correct: 0, why: '$(\\vet a\\otimes\\vet b)\\hat e_j\\cdot\\hat e_i=(\\vet b\\cdot\\hat e_j)(\\vet a\\cdot\\hat e_i)=b_ja_i$.', source: D(1, '1.2.4', 'Def 1.2.3', 3) },
      { id: 'c1.2-q3', kind: 'aperta', q: 'Che cosa restituiscono $\\hat e\\otimes\\hat e$ e $\\tens I-\\hat e\\otimes\\hat e$ applicati a $\\vet u$?', answer: 'Il primo la proiezione di $\\vet u$ lungo $\\hat e$, cioè $(\\hat e\\cdot\\vet u)\\hat e$; il secondo la parte di $\\vet u$ nel piano ortogonale a $\\hat e$. La somma ridà $\\vet u$ (Def 1.2.5).', source: D(1, '1.2.5', 'Def 1.2.5', 4) },
      { id: 'c1.2-q4', kind: 'vf', q: 'I tensori sferici $\\lambda\\tens I$ sono gli unici che commutano con ogni tensore.', answer: true, why: 'Osservazione di §1.2.6: commutano con ogni tensore tutti e soli i tensori sferici ($\\tens I$ e $\\tens O$ sono i casi $\\lambda=1$ e $\\lambda=0$).', source: D(1, '1.2.6', undefined, 4) },
    ],
  },
  {
    id: 'c1.3',
    module: 'm1',
    title: 'Trasposto, simmetrici e antisimmetrici, vettore assiale',
    prereq: ['c1.2'],
    source: D(1, '1.3', 'Def 1.3.1–1.3.2, Teo 1.3.3–1.3.4', '5–6'),
    meaning: 'Ogni tensore si spezza in modo unico in una parte **simmetrica** (6 componenti) e una **antisimmetrica** (3). La parte antisimmetrica agisce come un prodotto vettoriale per un vettore: il **vettore assiale**.',
    formulas: [
      { tex: '(\\tens A\\vet u)\\cdot\\vet v=(\\tens A^T\\vet v)\\cdot\\vet u,\\qquad A^T_{ij}=A_{ji}', label: 'trasposto', rif: 'Def 1.3.1' },
      { tex: '\\tens A=\\underbrace{\\tfrac12(\\tens A+\\tens A^T)}_{\\tens E\\in\\mathrm{Sym}}+\\underbrace{\\tfrac12(\\tens A-\\tens A^T)}_{\\tens W\\in\\mathrm{Skw}}', label: 'I teorema di decomposizione', rif: 'Teo 1.3.3' },
      { tex: '\\tens W\\vet u=\\vet w\\wedge\\vet u,\\quad [\\tens W]=\\begin{bmatrix}0&-w_3&w_2\\\\w_3&0&-w_1\\\\-w_2&w_1&0\\end{bmatrix}', label: 'vettore assiale', rif: 'Teo 1.3.4' },
    ],
    explanation: `Il **trasposto** si definisce con il prodotto scalare: $(\\tens A\\vet u)\\cdot\\vet v=(\\tens A^T\\vet v)\\cdot\\vet u$. In componenti scambia gli indici. Valgono $(\\tens A\\tens B)^T=\\tens B^T\\tens A^T$ e $(\\vet a\\otimes\\vet b)^T=\\vet b\\otimes\\vet a$.

$\\mathrm{Sym}$ raccoglie i tensori uguali al trasposto, $\\mathrm{Skw}$ quelli opposti. Un antisimmetrico ha **diagonale nulla**: $W_{ii}=-W_{ii}$ è possibile solo se $W_{ii}=0$. Restano 3 componenti indipendenti.

Il **I teorema di decomposizione** dice che ogni tensore è somma di una parte simmetrica e una antisimmetrica, **e in un solo modo**. L'unicità viene dal fatto che un tensore insieme simmetrico e antisimmetrico è uguale al proprio opposto: è $\\tens O$.

Le 3 componenti di $\\tens W$ sono quelle di un vettore $\\vet w$, il **vettore assiale**: $\\tens W\\vet u=\\vet w\\wedge\\vet u$. Il prodotto vettoriale richiama la rotazione (§1.5). Inoltre $\\tens W\\vet w=\\vet 0$ e $\\tens W\\vet u$ è ortogonale sia a $\\vet u$ sia a $\\vet w$.`,
    pitfalls: [
      'Dimenticare l\'unicità nel teorema di decomposizione: all\'orale si chiede «esistenza **e** unicità».',
      'Segni della matrice di $\\tens W$: sopra la diagonale $-w_3$, $w_2$, $-w_1$.',
      'Pensare che un antisimmetrico abbia 6 componenti indipendenti: sono 3, come il vettore assiale.',
    ],
    visual: { kind: 'svg', id: 'matrici', params: { focus: 'decomposizione' } },
    recall: [
      { id: 'c1.3-q1', kind: 'vf', q: 'Un tensore antisimmetrico ha diagonale nulla.', answer: true, why: '$W_{ii}=-W_{ii}$ implica $W_{ii}=0$ (§1.3.2).', source: D(1, '1.3.2', 'Def 1.3.2', 5) },
      { id: 'c1.3-q2', kind: 'aperta', q: 'Perché la decomposizione $\\tens A=\\tens E+\\tens W$ è unica?', answer: 'Se $\\tens A=\\tens E+\\tens W=\\tens E\'+\\tens W\'$, allora $\\tens E-\\tens E\'=\\tens W\'-\\tens W$ è simmetrico e antisimmetrico insieme, quindi uguale al proprio opposto: è $\\tens O$ (Teo 1.3.3).', source: D(1, '1.3.3', 'Teo 1.3.3', 5) },
      { id: 'c1.3-q3', kind: 'scelta', q: 'Se $\\vet w$ è il vettore assiale di $\\tens W$, quanto vale $\\tens W\\vet w$?', options: ['$\\vet 0$', '$\\vet w$', '$|\\vet w|^2\\hat e_1$', 'Dipende dal riferimento'], correct: 0, why: '$\\tens W\\vet w=\\vet w\\wedge\\vet w=\\vet 0$: il vettore assiale sta nel nucleo di $\\tens W$ (Oss. dopo Teo 1.3.4).', source: D(1, '1.3.4', 'Teo 1.3.4', 6) },
      { id: 'c1.3-q4', kind: 'vf', q: '$(\\tens A\\tens B)^T=\\tens A^T\\tens B^T$.', answer: false, why: 'L\'ordine si inverte: $(\\tens A\\tens B)^T=\\tens B^T\\tens A^T$ (§1.3.1).', source: D(1, '1.3.1', 'Def 1.3.1', 5) },
    ],
  },
  {
    id: 'c1.4',
    module: 'm1',
    title: 'Determinante, inverso, tensori ortogonali, formula di Eulero',
    prereq: ['c1.3'],
    source: D(1, '1.4–1.5', 'Def 1.4.1–1.4.2, 1.5.1, Prop 1.5.2, Teo 1.5.3, eq. (1.1)', '6–8'),
    meaning: 'Il **determinante** è il fattore con cui il tensore moltiplica i volumi (con segno). I tensori **ortogonali** conservano lunghezze e angoli: sono rotazioni ($\\det=1$) o riflessioni ($\\det=-1$). Ogni rotazione si scrive con la **formula di Eulero**.',
    formulas: [
      { tex: '\\det\\tens A:=\\dfrac{\\tens A\\vet u\\cdot\\tens A\\vet v\\wedge\\tens A\\vet w}{\\vet u\\cdot\\vet v\\wedge\\vet w}', label: 'determinante', rif: 'Def 1.4.1' },
      { tex: '\\tens Q\\in\\mathrm{Orth}:\\ \\tens Q^T\\tens Q=\\tens I,\\ \\ \\det\\tens Q=\\pm1', label: 'tensori ortogonali', rif: 'Prop 1.5.2' },
      { tex: '\\tens R=\\tens I+(1-\\cos\\varphi)\\tens W^2+\\sin\\varphi\\,\\tens W', label: 'formula di Eulero', rif: 'eq. (1.1)' },
      { tex: '\\tens R\\vet v\\simeq\\vet v+\\varphi\\,\\hat e\\wedge\\vet v\\quad(\\varphi\\ll1)', label: 'rotazioni infinitesime', rif: '§1.5.2' },
    ],
    explanation: `Il determinante è il rapporto tra il prodotto misto dei trasformati e quello dei vettori di partenza; non dipende dalla terna scelta. Valgono $\\det(\\tens A\\tens B)=\\det\\tens A\\det\\tens B$ e $\\det\\tens A^T=\\det\\tens A$. **Non è lineare**: $\\det(\\lambda\\tens A)=\\lambda^3\\det\\tens A$.

L'**inverso** esiste se e solo se $\\det\\tens A\\neq0$.

I tensori **ortogonali** conservano il prodotto scalare. Da $\\tens Q\\vet u\\cdot\\tens Q\\vet v=\\vet u\\cdot\\vet v$ per ogni coppia segue $\\tens Q^T\\tens Q=\\tens I$, cioè il trasposto è l'inverso, e $(\\det\\tens Q)^2=1$. Si dividono in **rotazioni** ($\\det=+1$) e **riflessioni** ($\\det=-1$), che non si ottengono da una rotazione per continuità.

Una rotazione propria ha un **asse** $\\hat e$ con $\\tens R\\hat e=\\hat e$. Con $\\tens W$ antisimmetrico di vettore assiale $\\hat e$ vale la **formula di Eulero (1.1)**. Per $\\varphi\\ll1$ il termine in $\\tens W^2$ è di ordine superiore: $\\tens R\\vet v\\simeq\\vet v+\\varphi\\,\\hat e\\wedge\\vet v$. Si sta approssimando l'arco con la tangente: la lunghezza è conservata solo al primo ordine.`,
    pitfalls: [
      'Scrivere $\\det(\\tens A+\\tens B)=\\det\\tens A+\\det\\tens B$ o $\\det(\\lambda\\tens A)=\\lambda\\det\\tens A$ (Attenzione, p. 6).',
      'Dimenticare che le riflessioni sono ortogonali ma non sono rotazioni.',
      'Nella rotazione infinitesima, dire che la lunghezza di $\\vet v$ è conservata esattamente: lo è solo al primo ordine.',
    ],
    visual: { kind: 'tensori3d', scene: { mode: 'eulero', controls: ['dir', 'angle', 'tangent'], angle: 50 } },
    recall: [
      { id: 'c1.4-q1', kind: 'scelta', q: 'Quanto vale $\\det(2\\tens A)$?', options: ['$8\\det\\tens A$', '$2\\det\\tens A$', '$4\\det\\tens A$', '$\\det\\tens A+2$'], correct: 0, why: 'Il determinante non è lineare: $\\det(\\lambda\\tens A)=\\lambda^3\\det\\tens A$ (Attenzione, p. 6).', source: D(1, '1.4.1', 'Def 1.4.1', 6) },
      { id: 'c1.4-q2', kind: 'aperta', q: 'Dimostra che per un tensore ortogonale $\\tens Q^T=\\tens Q^{-1}$.', answer: '$\\tens Q\\vet u\\cdot\\tens Q\\vet v=\\tens Q^T\\tens Q\\vet u\\cdot\\vet v=\\vet u\\cdot\\vet v$ per ogni $\\vet u,\\vet v$, quindi $(\\tens Q^T\\tens Q-\\tens I)\\vet u\\cdot\\vet v=0$ e $\\tens Q^T\\tens Q=\\tens I$ (Prop 1.5.2).', source: D(1, '1.5.1', 'Prop 1.5.2', 7) },
      { id: 'c1.4-q3', kind: 'vf', q: 'Una riflessione è un tensore ortogonale con determinante $-1$.', answer: true, why: '$\\mathrm{Orth}$ si divide in $\\mathrm{Rot}$ ($\\det=1$) e $\\mathrm{Rfl}$ ($\\det=-1$) (§1.5.1).', source: D(1, '1.5.1', undefined, 7) },
      { id: 'c1.4-q4', kind: 'aperta', q: 'Che cosa diventa la formula di Eulero per $\\varphi\\ll1$, e perché?', answer: '$\\cos\\varphi\\simeq1$, $\\sin\\varphi\\simeq\\varphi$: il termine $(1-\\cos\\varphi)\\tens W^2$ è $O(\\varphi^2)$ e si trascura. Resta $\\tens R\\simeq\\tens I+\\varphi\\tens W$, cioè $\\tens R\\vet v\\simeq\\vet v+\\varphi\\,\\hat e\\wedge\\vet v$: l\'arco approssimato con la tangente (§1.5.2).', source: D(1, '1.5.2', 'eq. (1.1)', 8) },
    ],
  },
  {
    id: 'c1.5',
    module: 'm1',
    title: 'Traccia, prodotto scalare, Sym ortogonale a Skw',
    prereq: ['c1.3'],
    source: D(1, '1.6', 'Def 1.6.1–1.6.2, Prop 1.6.3', '8–9'),
    meaning: 'La **traccia** è la somma della diagonale; il **prodotto scalare** tra tensori è la somma dei prodotti delle componenti omonime. Simmetrici e antisimmetrici sono **ortogonali**: $\\mathrm{Lin}=\\mathrm{Sym}\\oplus\\mathrm{Skw}$.',
    formulas: [
      { tex: '\\operatorname{tr}(\\vet a\\otimes\\vet b):=\\vet a\\cdot\\vet b,\\qquad \\operatorname{tr}\\tens A=A_{11}+A_{22}+A_{33}', label: 'traccia', rif: 'Def 1.6.1' },
      { tex: '\\tens A\\cdot\\tens B:=\\operatorname{tr}(\\tens A\\tens B^T)=\\textstyle\\sum_{ij}A_{ij}B_{ij}', label: 'prodotto scalare', rif: 'Def 1.6.2' },
      { tex: '\\tens E\\cdot\\tens W=0\\quad\\forall\\tens E\\in\\mathrm{Sym},\\ \\tens W\\in\\mathrm{Skw}', label: 'Sym ⊥ Skw', rif: 'Prop 1.6.3' },
    ],
    explanation: `La traccia si definisce sulle diadi, $\\operatorname{tr}(\\vet a\\otimes\\vet b)=\\vet a\\cdot\\vet b$, e si estende per linearità: diventa la somma delle componenti a indici uguali. Proprietà: $\\operatorname{tr}\\tens A=\\operatorname{tr}\\tens A^T$, $\\operatorname{tr}(\\tens A\\tens B)=\\operatorname{tr}(\\tens B\\tens A)$, $\\operatorname{tr}\\tens I=3$ e $\\operatorname{tr}\\tens W=0$.

Il prodotto scalare $\\tens A\\cdot\\tens B=\\operatorname{tr}(\\tens A\\tens B^T)$ dà la norma $\\|\\tens A\\|=(\\tens A\\cdot\\tens A)^{1/2}$, analoga al modulo di un vettore. Proprietà: $\\tens A\\cdot\\tens I=\\operatorname{tr}\\tens A$ e $\\tens A\\cdot(\\vet a\\otimes\\vet b)=\\tens A\\vet b\\cdot\\vet a$.

La proprietà più importante: un simmetrico e un antisimmetrico sono **ortogonali**. $\\mathrm{Sym}$ e $\\mathrm{Skw}$ hanno in comune solo $\\tens O$ e sono ortogonali: con il teorema di decomposizione, $\\mathrm{Lin}=\\mathrm{Sym}\\oplus\\mathrm{Skw}$ è una somma diretta ortogonale ($9=6+3$). Questo fatto tornerà nel teorema dei lavori virtuali (Cap. 4): $\\tens T\\cdot\\tens H=\\tens T\\cdot\\tens E$ perché $\\tens T$ è simmetrico.`,
    pitfalls: [
      'Scrivere $\\tens A\\cdot\\tens B=\\operatorname{tr}(\\tens A\\tens B)$: manca la trasposta.',
      'Dimostrare $\\tens E\\cdot\\tens W=0$ solo «in componenti» senza saper fare il passaggio con la traccia (domanda 8 della dispensa).',
    ],
    visual: { kind: 'svg', id: 'matrici', params: { focus: 'traccia' } },
    recall: [
      { id: 'c1.5-q1', kind: 'vf', q: 'Il prodotto scalare tra tensori è $\\tens A\\cdot\\tens B=\\operatorname{tr}(\\tens A\\tens B)$.', answer: false, why: 'È $\\operatorname{tr}(\\tens A\\tens B^T)=\\sum_{ij}A_{ij}B_{ij}$ (Def 1.6.2).', source: D(1, '1.6.2', 'Def 1.6.2', 9) },
      { id: 'c1.5-q2', kind: 'aperta', q: 'Perché la traccia di un tensore antisimmetrico è nulla?', answer: '$\\operatorname{tr}\\tens W=\\operatorname{tr}\\tens W^T=\\operatorname{tr}(-\\tens W)=-\\operatorname{tr}\\tens W$, quindi è zero (o, in componenti, $W_{ii}=0$) (§1.6.1).', source: D(1, '1.6.1', undefined, 8) },
      { id: 'c1.5-q3', kind: 'scelta', q: 'Quanto vale $\\tens A\\cdot\\tens I$?', options: ['$\\operatorname{tr}\\tens A$', '$\\det\\tens A$', '$\\|\\tens A\\|$', '$3$'], correct: 0, why: '$\\tens A\\cdot\\tens I=\\operatorname{tr}(\\tens A\\tens I^T)=\\operatorname{tr}\\tens A$ (Prop 1.6.3).', source: D(1, '1.6.2', 'Prop 1.6.3', 9) },
    ],
  },
  {
    id: 'c1.6',
    module: 'm1',
    title: 'Tensori del IV ordine: simmetrie e definita positività',
    prereq: ['c1.5'],
    source: D(1, '1.7', 'Def 1.7.1–1.7.7', '9–11'),
    meaning: 'Un tensore del IV ordine trasforma tensori del II ordine in tensori del II ordine (sarà il **tensore elastico**, Cap. 4). Le simmetrie riducono le componenti indipendenti da 81 a 36 e a 21.',
    formulas: [
      { tex: '(\\mathbb A\\tens A)_{ij}=\\textstyle\\sum_{h,k}\\mathbb A_{ijhk}A_{hk},\\qquad \\mathbb A_{ijhk}:=[\\mathbb A(\\hat e_h\\otimes\\hat e_k)]\\cdot(\\hat e_i\\otimes\\hat e_j)', label: 'componenti', rif: 'Def 1.7.1' },
      { tex: '\\mathbb A_{ijhk}=\\mathbb A_{hkij}', label: 'simmetria maggiore', rif: 'Def 1.7.3' },
      { tex: '\\mathbb A_{ijhk}=\\mathbb A_{jihk},\\qquad \\mathbb A_{ijhk}=\\mathbb A_{ijkh}', label: 'prima e seconda simmetria minore', rif: 'Def 1.7.4–1.7.5' },
      { tex: '\\mathbb A\\in\\mathrm{Pos}^+\\iff\\mathbb A\\tens A\\cdot\\tens A>0\\ \\ \\forall\\tens A\\neq\\tens O', label: 'definita positività', rif: 'Def 1.7.6' },
    ],
    explanation: `Il **trasposto** di $\\mathbb A$ scambia la prima coppia di indici con la seconda: $\\mathbb A^T_{ijhk}=\\mathbb A_{hkij}$.

Con quattro indici ci sono più simmetrie. **Maggiore**: $\\mathbb A=\\mathbb A^T$. **Prima minore**: $\\mathbb A$ restituisce sempre tensori simmetrici. **Seconda minore**: $\\mathbb A$ «vede» solo la parte simmetrica dell'argomento e annulla gli antisimmetrici, $\\mathbb A\\tens W=\\tens O$.

**Conteggio.** Con le due minori la coppia $(ij)$ e la coppia $(hk)$ assumono solo 6 valori distinti: $\\mathbb A$ è una matrice $6\\times6$, cioè **36** componenti. Se c'è anche la maggiore la matrice è simmetrica: $6+15=$ **21**.

**Definita positività e invertibilità.** Se $\\mathbb A\\in\\mathrm{Pos}^+$ e $\\mathbb A\\tens A=\\tens O$, allora $\\mathbb A\\tens A\\cdot\\tens A=0$, quindi $\\tens A=\\tens O$: il nucleo è banale e $\\mathbb A$ è invertibile. La definita positività è **sufficiente** ma **non necessaria**: $-\\mathbb I$ è invertibile ma non definito positivo.`,
    pitfalls: [
      'Confondere maggiore e minori: la maggiore scambia le coppie $(ij)\\leftrightarrow(hk)$, le minori gli indici dentro una coppia.',
      'Dire che invertibile implica definito positivo: è il contrario (domanda 10 della dispensa).',
      'Contare 21 come «6 + 15» senza spiegare da dove vengono: diagonale della 6×6 più metà dei fuori diagonale.',
    ],
    visual: { kind: 'svg', id: 'simmetrie4' },
    recall: [
      { id: 'c1.6-q1', kind: 'scelta', q: 'Quante componenti distinte ha un tensore del IV ordine con entrambe le simmetrie minori e la maggiore?', options: ['21', '36', '81', '6'], correct: 0, why: 'Le minori lo riducono a una matrice $6\\times6$ (36); la maggiore la rende simmetrica: $6\\cdot7/2=21$ (§1.7.3).', source: D(1, '1.7.3', undefined, 10) },
      { id: 'c1.6-q2', kind: 'vf', q: 'Un tensore del IV ordine invertibile è sempre definito positivo.', answer: false, why: 'Vale il contrario: $\\mathrm{Pos}^+$ implica invertibile. $-\\mathbb I$ è invertibile ma non definito positivo (Attenzione, p. 11).', source: D(1, '1.7.4', 'Def 1.7.6–1.7.7', 11) },
      { id: 'c1.6-q3', kind: 'aperta', q: 'Che cosa significa che $\\mathbb A$ ha la seconda simmetria minore?', answer: '$\\mathbb A\\tens A=\\mathbb A[\\operatorname{sym}\\tens A]$: vede solo la parte simmetrica dell\'argomento e annulla ogni tensore antisimmetrico, $\\mathbb A\\tens W=\\tens O$. In componenti $\\mathbb A_{ijhk}=\\mathbb A_{ijkh}$ (Def 1.7.5).', source: D(1, '1.7.3', 'Def 1.7.5', 10) },
    ],
  },
  {
    id: 'c1.7',
    module: 'm1',
    title: 'Gradiente, divergenza, rotore, teorema della divergenza',
    prereq: ['c1.5'],
    source: D(1, '1.8', 'Def 1.8.1–1.8.6, Teo 1.8.4', '11–13'),
    meaning: 'Il gradiente alza di uno l\'ordine di un campo, la divergenza lo abbassa, il rotore lo lascia uguale. Il **teorema della divergenza** trasforma il flusso attraverso una superficie chiusa in un integrale di volume.',
    formulas: [
      { tex: '(\\nabla\\vet u)_{ij}:=\\dfrac{\\partial u_i}{\\partial x_j},\\qquad \\operatorname{div}\\vet u:=\\operatorname{tr}\\nabla\\vet u', label: 'gradiente e divergenza di un vettore', rif: 'Def 1.8.1–1.8.2' },
      { tex: '\\vet a\\cdot\\operatorname{div}\\tens A:=\\operatorname{div}(\\tens A^T\\vet a),\\qquad (\\operatorname{div}\\tens A)_i=\\textstyle\\sum_j\\dfrac{\\partial A_{ij}}{\\partial x_j}', label: 'divergenza di un tensore', rif: 'Def 1.8.3' },
      { tex: '\\int_{\\partial D}\\vet u\\cdot\\hat n\\,dA=\\int_D\\operatorname{div}\\vet u\\,dV,\\qquad \\int_{\\partial D}\\tens A\\hat n\\,dA=\\int_D\\operatorname{div}\\tens A\\,dV', label: 'teorema della divergenza', rif: 'Teo 1.8.4' },
      { tex: '\\operatorname{rot}\\vet u\\wedge\\vet a=(\\nabla\\vet u-\\nabla\\vet u^T)\\vet a', label: 'rotore', rif: 'Def 1.8.5' },
    ],
    explanation: `Nella matrice del **gradiente** la riga è la componente, la colonna la variabile di derivazione. La **divergenza** di un vettore è la traccia del gradiente.

La divergenza di un **campo tensoriale** si definisce in modo intrinseco attraverso quella di un vettore: per ogni $\\vet a$ fisso, $\\vet a\\cdot\\operatorname{div}\\tens A=\\operatorname{div}(\\tens A^T\\vet a)$. In componenti è la divergenza **per righe**.

Il **teorema della divergenza** dice che il flusso uscente da una superficie chiusa è l'integrale della divergenza nel volume racchiuso. La versione tensoriale si ricava da quella vettoriale applicandola a $\\tens A^T\\vet a$ con $\\vet a$ fisso arbitrario. Servirà per Cauchy–Poisson (Cap. 3) e per il lemma fondamentale (Cap. 4).

Il **rotore** di $\\vet u$ è il vettore assiale di $\\nabla\\vet u-\\nabla\\vet u^T=2\\operatorname{skw}\\nabla\\vet u$. La dispensa rimanda qui a «§3.4»: il vettore assiale è in §1.3.4 (NF-01). Anche il rotore di un tensore si definisce attraverso $\\tens A^T\\vet a$.`,
    pitfalls: [
      'Divergenza di un tensore «per colonne»: con la convenzione della dispensa è per righe, $\\sum_j\\partial A_{ij}/\\partial x_j$.',
      'Dimenticare che la normale nel teorema della divergenza è quella **uscente**.',
      'Pensare che divergenza nulla voglia dire campo nullo: una rotazione rigida ha divergenza nulla ma non è nulla.',
    ],
    visual: { kind: 'svg', id: 'divergenza' },
    recall: [
      { id: 'c1.7-q1', kind: 'scelta', q: 'Quanto vale $(\\operatorname{div}\\tens A)_i$?', options: ['$\\sum_j\\partial A_{ij}/\\partial x_j$', '$\\sum_j\\partial A_{ji}/\\partial x_j$', '$\\partial A_{ii}/\\partial x_i$', '$\\operatorname{tr}\\nabla\\tens A$'], correct: 0, why: 'Dalla definizione $\\vet a\\cdot\\operatorname{div}\\tens A=\\operatorname{div}(\\tens A^T\\vet a)$: divergenza per righe (Def 1.8.3).', source: D(1, '1.8.2', 'Def 1.8.3', 12) },
      { id: 'c1.7-q2', kind: 'vf', q: 'Il gradiente alza di uno l\'ordine del campo, la divergenza lo abbassa di uno.', answer: true, why: 'Osservazione di §1.8: il rotore invece lo lascia invariato.', source: D(1, '1.8', undefined, 11) },
      { id: 'c1.7-q3', kind: 'aperta', q: 'Enuncia il teorema della divergenza per un campo tensoriale e di\' come si ricava da quello vettoriale.', answer: '$\\int_{\\partial D}\\tens A\\hat n\\,dA=\\int_D\\operatorname{div}\\tens A\\,dV$, con $\\hat n$ normale uscente. Si applica la versione vettoriale al campo $\\tens A^T\\vet a$ con $\\vet a$ fisso arbitrario (Teo 1.8.4).', source: D(1, '1.8.3', 'Teo 1.8.4', 12) },
    ],
  },
];
