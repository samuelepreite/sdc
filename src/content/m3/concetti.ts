/**
 * Modulo 3 — Analisi della tensione (Cap. 3, pp. 36–65). Fonte: tools/testi/cap-03.md.
 * Figure controllate sul PDF (Mohr, p. 58). NF-05 (p. 55) e NF-06 (pp. 45–46) in NOTE_FONTI.md.
 */
import { D } from '../../engine/types';
import type { Concept } from '../types';

export const M3_CONCETTI: Concept[] = [
  {
    id: 'c3.1',
    module: 'm3',
    title: 'Forze, principi di Eulero e Cauchy, componenti speciali',
    prereq: ['c1.2'],
    source: D(3, '3.1–3.3', 'Def 3.2.1–3.2.2, Teo 3.3.1', '36–40'),
    meaning: 'Le forze interne trasmettono i carichi attraverso la materia. Il modello di Eulero–Cauchy le rappresenta come forze di superficie sui tagli ideali: in ogni punto e per ogni giacitura $\\hat n$ c’è un **vettore tensione** $\\vet t_n$, che si scompone in una parte **normale** (trazione o compressione) e una **tangenziale** (scorrimento).',
    formulas: [
      { tex: '\\vet t_n(x):=\\lim_{\\operatorname{diam}\\Delta A\\to0}\\dfrac{\\Delta\\vet F}{\\Delta A},\\qquad\\lim_{\\operatorname{diam}\\Delta A\\to0}\\dfrac{\\Delta\\vet M}{\\Delta A}=\\vet 0', label: 'principio delle tensioni di Cauchy', rif: 'Def 3.2.2' },
      { tex: '\\vet t_n=(\\hat n\\otimes\\hat n)\\vet t_n+(\\tens I-\\hat n\\otimes\\hat n)\\vet t_n=\\sigma_n\\hat n+\\tau_n\\hat\\mu', label: 'decomposizione', rif: 'Teo 3.3.1' },
      { tex: '\\sigma_n=\\vet t_n\\cdot\\hat n', label: 'tensione normale (>0 trazione)', rif: '§3.3' },
      { tex: '|\\vet b|=[F][L^{-3}],\\qquad|\\hat{\\vet s}|=[F][L^{-2}]', label: 'forze di volume e di superficie', rif: '§3.1' },
    ],
    explanation: `Sul corpo agiscono tre classi di interazioni (§3.1): forze di **volume** $\\vet b$ (a distanza, come il peso), forze di **superficie** $\\hat{\\vet s}$ (per contatto, sulla frontiera) e forze **interne**, che una parte $\\mathcal P$ scambia con il resto del corpo. Le forze interne sono indispensabili: il peso di una persona sul balcone deve arrivare alle fondamenta passando per la materia; tagliando idealmente il corpo la trasmissione si interromperebbe.

**Principio delle sezioni di Eulero** (Def 3.2.1): l'azione di $\\mathcal B^+$ su $\\mathcal B^-$ attraverso l'intorno $\\Delta A$ di $x$ è un campo di forze definito su $\\Delta A$: le forze interne sono forze di **superficie**. È limitativo (un magnete ha interazioni interne a distanza) ma adeguato all'ingegneria.

**Principio delle tensioni di Cauchy** (Def 3.2.2): il rapporto tra risultante e area ha limite finito, il vettore tensione; il momento per unità di area tende a zero. Escludere i momenti interni basta quasi sempre; altrimenti servono i **continui polari** di Cosserat (per esempio la muratura).

Sono **assiomi**: si giustificano con la riprova sperimentale. Non esiste un «tensiometro»: si misura la deformazione e si stima la tensione con la teoria.

$\\vet t_n$ dipende solo dalla **giacitura** $\\hat n$, non dalla forma della superficie; in un punto ci sono $\\infty^2$ vettori tensione. Le **componenti speciali** (Teo 3.3.1): $\\sigma_n$ tende a lacerare ($>0$, trazione) o a far compenetrare ($<0$) le facce del taglio; $\\boldsymbol\\tau_n$ tende a farle scivolare. La direzione $\\hat\\mu$ della tangenziale in generale è incognita.`,
    pitfalls: [
      'Pensare che $\\vet t_n$ dipenda dalla forma della superficie di taglio: conta solo la normale in $x$.',
      'Dimenticare che i principi sono assiomi: non si dimostrano, si verificano dalla predittività.',
      'Indici: in $\\tau_{ni}$ il primo è la giacitura, il secondo la direzione.',
    ],
    visual: { kind: 'tensione3d', scene: { mode: 'taglio', presets: ['esercizio', 'trazione', 'scorrimento', 'generico'], controls: ['preset', 'dir'] } },
    recall: [
      { id: 'c3.1-q1', kind: 'vf', q: 'Il vettore tensione in $x$ dipende dalla forma della superficie di taglio, oltre che dalla sua normale.', answer: false, why: '§3.2.3: superfici diverse, anche curve, con la stessa normale in $x$ danno lo stesso $\\vet t_n$.', source: D(3, '3.2.3', undefined, 38) },
      { id: 'c3.1-q2', kind: 'scelta', q: 'Che cosa afferma il principio delle sezioni di Eulero?', options: ['Che le forze interne sono forze di superficie', 'Che il momento interno è nullo', 'Che il tensore di tensione è simmetrico', 'Che le forze di volume sono trascurabili'], correct: 0, why: 'Def 3.2.1: l’azione di una parte sull’altra attraverso $\\Delta A$ equivale a un campo di forze definito su $\\Delta A$.', source: D(3, '3.2.1', 'Def 3.2.1', 38) },
      { id: 'c3.1-q3', kind: 'aperta', q: 'Quando servono i continui polari di Cosserat?', answer: 'Quando non si può escludere l’esistenza di momenti interni: ogni punto, oltre a traslare, può ruotare localmente generando micromomenti. Esempio: la muratura, dove i giunti introducono una struttura interna direzionale (§3.2.2).', source: D(3, '3.2.2', undefined, 38) },
      { id: 'c3.1-q4', kind: 'scelta', q: 'Che dimensioni ha la densità di forza di superficie $\\hat{\\vet s}$?', options: ['$[F][L^{-2}]$', '$[F][L^{-3}]$', '$[F]$', '$[F][L]$'], correct: 0, why: '§3.1: forza per unità di area (es. il vento su una vela); $\\vet b$ è per unità di volume.', source: D(3, '3.1', undefined, 37) },
    ],
  },
  {
    id: 'c3.2',
    module: 'm3',
    title: 'Assiomi di Eulero, ECS e lemma di Cauchy',
    prereq: ['c3.1'],
    source: D(3, '3.4–3.5', 'Def 3.4.1, Teo 3.4.2, Teo 3.5.1', '40–42'),
    meaning: 'Un corpo continuo è in equilibrio se lo è **ogni sua parte**: risultante e momento risultante nulli per ogni $\\mathcal P\\subseteq\\mathcal B$. Le equazioni cardinali della statica (la sola parte $\\mathcal P=\\mathcal B$) diventano necessarie ma non sufficienti. In ogni punto vale azione e reazione: $\\vet t_n=-\\vet t_{-n}$.',
    formulas: [
      { tex: '\\vet r(\\mathcal P)=\\vet 0,\\quad\\vet m_O(\\mathcal P)=\\vet 0\\quad\\forall O,\\ \\forall\\mathcal P\\subseteq\\mathcal B', label: 'assiomi di Eulero', rif: 'Def 3.4.1' },
      { tex: '\\vet r(\\mathcal P)=\\int_{\\mathcal P}\\vet b\\,dV+\\int_{\\partial\\mathcal P}\\vet t_n\\,dA', label: 'risultante su una parte interna', rif: '§3.4.1' },
      { tex: '\\vet t_n(x)=-\\vet t_{-n}(x)', label: 'lemma di Cauchy', rif: 'Teo 3.5.1' },
    ],
    explanation: `L'equilibrio si generalizza per livelli: punto materiale (risultante nulla), corpo rigido (ECS), sistema di corpi rigidi (ECS per ogni corpo), corpo continuo, che ha **infinite** parti. Gli **assiomi di Eulero** (Def 3.4.1) chiedono le ECS per ogni parte: così diventano un principio valido in ogni punto interno.

Per una parte **interna** sulla frontiera agiscono solo le tensioni; per una parte **affiorante** anche le forze esterne $\\hat{\\vet s}$ sul tratto di frontiera in comune con $\\partial\\mathcal B$.

**Teo 3.4.2:** per un corpo deformabile le ECS sono **necessarie ma non sufficienti**. Esempio del **compasso**: due forze uguali, opposte e collineari agli estremi delle gambe soddisfano le ECS, ma il compasso si apre. Le ECS bastano solo per il rigido (cerniera saldata).

**Lemma di Cauchy** (Teo 3.5.1): è la versione locale di azione e reazione. Si taglia il corpo con un piano; si scrive $\\vet r=\\vet 0$ per le due parti e si somma: restano le ECS del corpo intero (nulle) più $\\int_A(\\vet t_n+\\vet t_{-n})\\,dA=\\vet 0$. Per l'**arbitrarietà del dominio** l'integranda è nulla.`,
    pitfalls: [
      'Dire che un integrale nullo implica integranda nulla: $\\int_0^{2\\pi}\\sin x\\,dx=0$; serve che sia nullo per ogni dominio (con $f$ continua).',
      'Credere che le ECS bastino per un corpo deformabile: il compasso lo smentisce.',
      'Confondere chi agisce su chi: $\\vet t_n$ è l’azione di $\\mathcal B^+$ su $\\mathcal B^-$.',
    ],
    visual: { kind: 'tensione3d', scene: { mode: 'taglio', preset: 'esercizio', presets: ['esercizio', 'generico'], controls: ['preset', 'dir'] } },
    recall: [
      { id: 'c3.2-q1', kind: 'vf', q: 'Per un corpo deformabile le equazioni cardinali della statica sono sufficienti per l’equilibrio.', answer: false, why: 'Teo 3.4.2: sono solo necessarie; il compasso soddisfa le ECS ma si apre.', source: D(3, '3.4.2', 'Teo 3.4.2', 41) },
      { id: 'c3.2-q2', kind: 'scelta', q: 'Nella dimostrazione del lemma di Cauchy, che cosa permette di passare da $\\int_A(\\vet t_n+\\vet t_{-n})dA=\\vet 0$ a $\\vet t_n+\\vet t_{-n}=\\vet 0$?', options: ['L’arbitrarietà del dominio di integrazione', 'La simmetria di $\\tens T$', 'Il teorema della divergenza', 'Le equazioni indefinite di equilibrio'], correct: 0, why: 'Teo 3.5.1: il risultato vale per qualunque sezione $A$; un integrale nullo su ogni dominio implica integranda nulla.', source: D(3, '3.5', 'Teo 3.5.1', 42) },
      { id: 'c3.2-q3', kind: 'aperta', q: 'Perché gli assiomi di Eulero sono più forti delle ECS?', answer: 'Perché chiedono risultante e momento nulli per ogni parte del corpo, non solo per il corpo intero: così l’equilibrio vale in ogni punto interno (Def 3.4.1). Le ECS sono il caso $\\mathcal P=\\mathcal B$.', source: D(3, '3.4', 'Def 3.4.1', 40) },
    ],
  },
  {
    id: 'c3.3',
    module: 'm3',
    title: 'Teorema di Cauchy–Poisson e tetraedro',
    prereq: ['c3.2'],
    source: D(3, '3.6–3.7.1', 'Teo 3.6.1', '42–45'),
    meaning: 'Il risultato principale della meccanica dei solidi: in ogni punto esiste un tensore $\\tens T$ tale che $\\vet t_n=\\tens T\\hat n$. Bastano i vettori tensione su **tre** giaciture ortogonali per conoscere quelli su tutte le $\\infty^2$ giaciture. Il teorema dice anche come si scrive l’equilibrio localmente.',
    formulas: [
      { tex: '\\vet t_n(x)=\\tens T(x)\\hat n\\quad\\forall\\hat n', label: 'tensore di tensione di Cauchy', rif: 'Teo 3.6.1, punto 1' },
      { tex: 'A_i=A\\,(\\hat e_i\\cdot\\hat n)=A\\,n_i', label: 'aree delle facce del tetraedro', rif: '§3.7.1' },
      { tex: '\\vet t_n(x)=\\textstyle\\sum_{i=1}^3\\vet t_{e_i}(x)\\,n_i', label: 'teorema del tetraedro', rif: '§3.7.1' },
      { tex: 'T_{ij}=\\tens T\\hat e_j\\cdot\\hat e_i=(\\vet t_{e_j})_i', label: 'colonne = vettori tensione', rif: '§3.7.1' },
    ],
    explanation: `**Teo 3.6.1** (Cauchy 1823 la necessaria, Poisson 1829 la sufficiente). Per un corpo sotto $\\vet b$ e $\\hat{\\vet s}$, condizione necessaria e sufficiente per l'equilibrio è che: (1) esista $\\tens T$ con $\\vet t_n=\\tens T\\hat n$; (2) $\\operatorname{div}\\tens T+\\vet b=\\vet 0$ nell'interno; (3) $\\tens T$ sia simmetrico. Per la sufficienza serve anche l'equilibrio al contorno $\\tens T\\hat n=\\hat{\\vet s}$ (la dispensa lo aggiunge).

**Significato del punto 1** (riquadro p. 43): un doppio risultato. Esiste il tensore, e il concetto di tensione diventa **operativo**: da $\\infty^2$ informazioni per punto se ne passa a 3.

**Tetraedro di Cauchy** (§3.7.1). Un tetraedro con vertice in $x$, tre facce sui piani coordinati (normali esterne $-\\hat e_i$, aree $A_i$) e una faccia inclinata di normale $\\hat n$ e area $A$. Le facce coordinate sono le proiezioni di quella inclinata: $A_i=An_i$. Si scrive l'equilibrio alla traslazione, si divide per $A$, si usa il lemma di Cauchy e si **localizza**: si avvicina la faccia inclinata a $x$ parallelamente a sé stessa. Il termine di volume va a zero più velocemente (volume $\\sim d^3$, area $\\sim d^2$), i rapporti forza/area tendono ai vettori tensione. Resta una relazione **lineare** in $\\hat n$: esiste il tensore.`,
    pitfalls: [
      'Dimenticare il lemma di Cauchy nel tetraedro: sulle facce coordinate agisce $\\vet t_{-e_i}=-\\vet t_{e_i}$.',
      'Credere che le forze di volume contino nel limite: decrescono come $d^3$, contro $d^2$ delle superfici.',
      'Scambiare righe e colonne: la colonna $j$ di $[\\tens T]$ è $\\vet t_{e_j}$ (nel tetraedro); vedi NF-06 per il parallelepipedo.',
    ],
    visual: { kind: 'tensione3d', scene: { mode: 'tetraedro', presets: ['esercizio', 'generico', 'trazione'], controls: ['preset', 'dir'] } },
    recall: [
      { id: 'c3.3-q1', kind: 'scelta', q: 'Quante informazioni servono, grazie al punto 1 di Cauchy–Poisson, per conoscere lo stato di tensione in un punto?', options: ['I vettori tensione su tre giaciture mutuamente ortogonali', 'I vettori tensione su $\\infty^2$ giaciture', 'Solo la tensione normale su una giacitura', 'Le tre tensioni principali e basta'], correct: 0, why: 'Riquadro di p. 43: da $\\infty^2$ informazioni a 3.', source: D(3, '3.6', 'Teo 3.6.1', 43) },
      { id: 'c3.3-q2', kind: 'vf', q: 'Nel limite del tetraedro il termine delle forze di volume diviso per $A$ tende a zero.', answer: true, why: '§3.7.1: il volume va come $d^3$, l’area come $d^2$: il rapporto è $O(d)$.', source: D(3, '3.7.1', undefined, 45) },
      { id: 'c3.3-q3', kind: 'aperta', q: 'Perché le aree delle facce coordinate del tetraedro valgono $A n_i$?', answer: 'Perché sono le proiezioni della faccia inclinata sui piani coordinati: $A_i=A(\\hat e_i\\cdot\\hat n)=An_i$ (§3.7.1).', source: D(3, '3.7.1', undefined, 44) },
    ],
  },
  {
    id: 'c3.4',
    module: 'm3',
    title: 'Equazioni indefinite di equilibrio e simmetria di T',
    prereq: ['c3.3', 'c1.7'],
    source: D(3, '3.7.2–3.8', 'Teo 3.7.1', '45–48'),
    meaning: 'L’equilibrio alla traslazione di ogni parte, scritto in forma integrale, diventa un’equazione **locale**: $\\operatorname{div}\\tens T+\\vet b=\\vet 0$ in ogni punto interno. L’equilibrio alla rotazione diventa la **simmetria** di $\\tens T$: le tensioni tangenziali sono reciproche.',
    formulas: [
      { tex: '\\operatorname{div}\\tens T+\\vet b=\\vet 0\\quad\\forall x\\in\\mathring{\\mathcal B}', label: 'equazioni indefinite di equilibrio', rif: 'Teo 3.6.1, punto 2' },
      { tex: '\\dfrac{\\partial T_{i1}}{\\partial x_1}+\\dfrac{\\partial T_{i2}}{\\partial x_2}+\\dfrac{\\partial T_{i3}}{\\partial x_3}+b_i=0', label: 'in componenti', rif: '§3.8' },
      { tex: '\\tens T=\\tens T^T\\iff\\tau_{ij}=\\tau_{ji}', label: 'simmetria e reciprocità', rif: 'Teo 3.6.1 punto 3, Teo 3.7.1' },
    ],
    explanation: `**Punto 2** (§3.7.2). Per una parte interna $\\mathcal P$: $\\int_{\\mathcal P}\\vet b\\,dV+\\int_{\\partial\\mathcal P}\\tens T\\hat n\\,dA=\\vet 0$. Con il **teorema della divergenza** l'integrale di superficie diventa $\\int_{\\mathcal P}\\operatorname{div}\\tens T\\,dV$; per l'arbitrarietà di $\\mathcal P$ l'integranda è nulla. È un sistema di equazioni alle derivate parziali.

Perché $\\mathring{\\mathcal B}$: le derivate sono rapporti incrementali, e sulla frontiera non si può incrementare verso l'esterno. **div o Div**: in generale l'equilibrio va scritto nella configurazione attuale (div); con piccoli spostamenti e deformazioni (equilibrio referenziale, Cap. 2) è indifferente.

**Punto 3** (§3.7.3). Si prende un parallelepipedo infinitesimo e si annulla il momento rispetto a tre assi per il baricentro. Le forze di volume e quelle sulle facce perpendicolari all'asse non danno momento; restano le tangenziali sulle altre due coppie di facce. Trascurando gli infinitesimi di ordine superiore: $T_{23}\\,dV-T_{32}\\,dV=0$. Così per gli altri assi: $\\tens T=\\tens T^T$.

**Reciprocità** (Teo 3.7.1): la tangenziale sulla giacitura $\\hat e_i$ in direzione $\\hat e_j$ è uguale a quella sulla giacitura $\\hat e_j$ in direzione $\\hat e_i$: le due coppie (antioraria e oraria) si bilanciano.`,
    pitfalls: [
      'Scrivere le equazioni indefinite anche sulla frontiera: valgono nell’interno; sulla frontiera vale $\\tens T\\hat n=\\hat{\\vet s}$.',
      'NF-06: nel parallelepipedo la dispensa scrive $T_{ij}=\\vet t_{e_i}\\cdot\\hat e_j$ (righe), nel tetraedro $(\\vet t_{e_j})_i$ (colonne): per la simmetria è irrilevante.',
      'Dimenticare che la simmetria è l’equilibrio alla rotazione (non una proprietà del materiale).',
    ],
    visual: { kind: 'tensione3d', scene: { mode: 'parallelepipedo', presets: ['scorrimento', 'esercizio', 'generico'], controls: ['preset'] } },
    recall: [
      { id: 'c3.4-q1', kind: 'scelta', q: 'Che cosa trasforma l’equilibrio alla traslazione da forma integrale a forma locale?', options: ['Il teorema della divergenza e l’arbitrarietà della parte', 'Il lemma di Cauchy', 'La simmetria di $\\tens T$', 'Il teorema spettrale'], correct: 0, why: '§3.7.2: $\\int_{\\partial\\mathcal P}\\tens T\\hat n=\\int_{\\mathcal P}\\operatorname{div}\\tens T$; poi l’integranda è nulla perché $\\mathcal P$ è arbitraria.', source: D(3, '3.7.2', undefined, 45) },
      { id: 'c3.4-q2', kind: 'vf', q: 'La simmetria del tensore di tensione è la contropartita locale dell’equilibrio alla rotazione.', answer: true, why: 'Teo 3.6.1, punto 3, dimostrato con il parallelepipedo (§3.7.3).', source: D(3, '3.7.3', 'Teo 3.6.1', 46) },
      { id: 'c3.4-q3', kind: 'aperta', q: 'Perché le equazioni indefinite si scrivono in $\\mathring{\\mathcal B}$ e non su tutto $\\mathcal B$?', answer: 'Perché le derivate sono rapporti incrementali: sulla frontiera non si può incrementare la funzione verso l’esterno; all’interno sì, senza limitazioni (Oss. di §3.8).', source: D(3, '3.8', undefined, 47) },
    ],
  },
  {
    id: 'c3.5',
    module: 'm3',
    title: 'Rappresentazione ingegneristica; σ_n, τ_nν, τ_n',
    prereq: ['c3.4'],
    source: D(3, '3.9–3.10', undefined, '48–49'),
    meaning: 'In un riferimento la matrice di $\\tens T$ ha sulla diagonale le tensioni normali e fuori le tangenziali. Data una giacitura $\\hat n$: $\\vet t_n=\\tens T\\hat n$, la tensione normale è una forma quadratica in $\\hat n$, la tangenziale totale si ottiene per differenza.',
    formulas: [
      { tex: '[\\tens T]=\\begin{bmatrix}\\sigma_1&\\tau_{12}&\\tau_{13}\\\\\\tau_{12}&\\sigma_2&\\tau_{23}\\\\\\tau_{13}&\\tau_{23}&\\sigma_3\\end{bmatrix}', label: 'forma ingegneristica', rif: '§3.9' },
      { tex: '\\sigma_n=\\tens T\\hat n\\cdot\\hat n=T_{11}n_1^2+T_{22}n_2^2+T_{33}n_3^2+2T_{12}n_1n_2+2T_{23}n_2n_3+2T_{31}n_3n_1', label: 'tensione normale', rif: '§3.10' },
      { tex: '\\tau_{n\\nu}=\\vet t_n\\cdot\\hat\\nu\\quad(\\hat\\nu\\perp\\hat n)', label: 'componente tangenziale lungo ν̂', rif: '§3.10' },
      { tex: '\\boldsymbol\\tau_n=\\vet t_n-\\sigma_n\\hat n,\\quad|\\vet t_n|^2=\\sigma_n^2+\\tau_n^2', label: 'tangenziale totale', rif: '§3.10' },
    ],
    explanation: `**Forma ingegneristica** (§3.9). Le colonne di $[\\tens T]$ sono i vettori tensione sulle giaciture coordinate. Di $\\vet t_{e_i}$ la componente lungo $\\hat e_i$ è la tensione normale $\\sigma_i$, le altre due sono tangenziali $\\tau_{ij}$ (giacitura $i$, direzione $j$). Letta per colonne la matrice avrebbe gli indici delle $\\tau$ scambiati rispetto alla convenzione «prima la giacitura»: per la simmetria non importa.

**Calcolo** (§3.10). $\\{\\vet t_n\\}=[\\tens T]\\{\\hat n\\}$. $\\sigma_n$ è una **forma quadratica completa** in $\\hat n$: tutti i quadrati e tutti i doppi prodotti, con i fattori 2 dalla simmetria. Con un versore $\\hat\\nu$ del piano si ha la componente tangenziale **lungo quella direzione**, che in generale non è l'intera tangenziale.

**Tangenziale totale**, per via indiretta: $\\vet t_n\\to\\sigma_n\\to\\boldsymbol\\tau_n=\\vet t_n-\\sigma_n\\hat n$; il modulo è $\\tau_n$, la direzione $\\hat\\mu=\\boldsymbol\\tau_n/\\tau_n$. Il segno di $\\tau$ è inessenziale: lo scorrimento avviene comunque. Nella dispensa $\\hat\\mu$ è la direzione della tangenziale, $\\hat\\nu$ una direzione assegnata.`,
    pitfalls: [
      'Confondere $\\tau_{n\\nu}$ (componente lungo una direzione scelta) con $\\tau_n$ (intera tangenziale).',
      'Dimenticare i fattori 2 dei doppi prodotti in $\\sigma_n$.',
      'Dimenticare che $|\\vet t_n|^2=\\sigma_n^2+\\tau_n^2$ è un ottimo controllo dei calcoli.',
    ],
    visual: { kind: 'tensione3d', scene: { mode: 'taglio', preset: 'esercizio', presets: ['esercizio', 'generico'], controls: ['preset', 'dir'] } },
    recall: [
      { id: 'c3.5-q1', kind: 'vf', q: '$\\tau_{n\\nu}$ calcolata con un versore $\\hat\\nu$ qualsiasi del piano è sempre l’intera tensione tangenziale.', answer: false, why: '§3.10: è la componente lungo $\\hat\\nu$; coincide con $\\tau_n$ solo se $\\hat\\nu=\\hat\\mu$.', source: D(3, '3.10', undefined, 49) },
      { id: 'c3.5-q2', kind: 'scelta', q: 'Come si calcola la tensione tangenziale totale su una giacitura?', options: ['$\\boldsymbol\\tau_n=\\vet t_n-\\sigma_n\\hat n$, poi il modulo', '$\\tau_n=\\vet t_n\\cdot\\hat n$', '$\\tau_n=\\operatorname{tr}\\tens T$', '$\\tau_n=\\tens T\\hat n\\cdot\\hat\\nu$ con $\\hat\\nu$ qualsiasi'], correct: 0, why: '§3.10: via indiretta $\\vet t_n\\to\\sigma_n\\to\\boldsymbol\\tau_n$.', source: D(3, '3.10', undefined, 49) },
      { id: 'c3.5-q3', kind: 'aperta', q: 'Per l’esercizio di §3.14, con $\\hat n=(1,-1,-2)/\\sqrt6$, quanto valgono $\\sigma_n$ e $\\tau_n$? Che controllo fai?', answer: '$\\sigma_n=5$, $\\tau_n=2\\sqrt5$; controllo $|\\vet t_n|^2=45=25+20$ e $s_3\\le\\sigma_n\\le s_1$ (§3.14, punto 4).', source: D(3, '3.14', undefined, 56) },
    ],
  },
  {
    id: 'c3.6',
    module: 'm3',
    title: 'Tensioni principali e classificazione',
    prereq: ['c3.5', 'c2.8'],
    source: D(3, '3.11–3.12', 'Def 3.11.1', '49–52'),
    meaning: 'Esistono almeno tre giaciture ortogonali su cui la tensione è **solo normale**: le direzioni principali, con le tensioni principali $s_1\\ge s_2\\ge s_3$. Contando quante sono nulle (anche dagli invarianti) lo stato è triassiale, biassiale (con un piano scarico) o monoassiale.',
    formulas: [
      { tex: '(\\tens T-\\lambda\\tens I)\\hat n=\\vet 0,\\qquad\\lambda^3-I\\lambda^2+II\\lambda-III=0', label: 'problema agli autovalori', rif: '§3.11.1' },
      { tex: '\\tens T=\\textstyle\\sum_i\\lambda_i\\,\\hat n_i\\otimes\\hat n_i', label: 'rappresentazione spettrale', rif: '§3.11.2' },
      { tex: '\\tens T=\\lambda\\tens I', label: 'stato idrostatico (radice tripla)', rif: '§3.11.2' },
      { tex: 'III\\ne0:\\text{ triassiale};\\ \\ III=0,II\\ne0:\\text{ biassiale};\\ \\ III=II=0:\\text{ monoassiale}', label: 'classificazione dagli invarianti', rif: '§3.12' },
    ],
    explanation: `La domanda ha senso meccanico: tensioni normali e tangenziali impegnano in modo diverso le risorse del materiale. $\\tens T\\hat n=\\lambda\\hat n$ è il problema degli autovalori: gli **autovalori** sono le tensioni principali ($\\sigma_n=\\lambda$), gli **autovettori** le direzioni principali. Il **piano principale** (Def 3.11.1) è quello ortogonale a una direzione principale: tangenziali nulle.

Si procede come per la deformazione: il teorema spettrale vale perché $\\tens T$ è simmetrico (punto 3 di Cauchy–Poisson). Equazione secolare, invarianti, normalizzazione. Ordinamento $s_1\\ge s_2\\ge s_3$: $s_1$ «di trazione», $s_3$ «di compressione», anche se possono avere tutte lo stesso segno.

**Casi:** radici distinte (terna principale unica), doppia ($\\infty^1$ terne, $\\tens T=\\lambda_3\\hat n_3\\otimes\\hat n_3+\\lambda(\\tens I-\\hat n_3\\otimes\\hat n_3)$), tripla: **stato idrostatico**, come una sferetta in un fluido in quiete. La tensione generalizza la pressione: un fluido in quiete non ha sforzi tangenziali, un solido sì.

**Classificazione** (§3.12): **triassiale** (vettore tensione di direzione generica); **biassiale** (un autovalore nullo: $\\vet t_m$ sta sempre nel piano delle altre due direzioni, e il piano di normale $\\hat n_1$ è **scarico**; è lo stato tipico delle travi); **monoassiale** (due nulli: $\\vet t_m$ sempre parallelo a $\\hat n_3$, $\\infty^1$ piani scarichi).

Monoassiale **non** vuol dire tensione solo normale su ogni piano: nel provino in trazione il taglio retto ha solo $\\sigma$, un taglio obliquo ha anche $\\tau$.`,
    pitfalls: [
      'Monoassiale ≠ «solo tensioni normali»: su un taglio obliquo compare anche la tangenziale (Attenzione, p. 52).',
      'Dimenticare che il teorema spettrale si applica a $\\tens T$ grazie alla simmetria (punto 3 di Cauchy–Poisson).',
      'Pensare che $s_1>0$ e $s_3<0$ sempre: possono avere tutte lo stesso segno.',
    ],
    visual: { kind: 'tensione3d', scene: { mode: 'principali', presets: ['esercizio', 'generico', 'trazione', 'scorrimento', 'idrostatico'], controls: ['preset'] } },
    recall: [
      { id: 'c3.6-q1', kind: 'vf', q: 'In uno stato monoassiale la tensione è solo normale su ogni giacitura.', answer: false, why: 'Attenzione di p. 52: il vettore tensione è sempre parallelo a una direzione, ma su un taglio obliquo ha componenti normale e tangenziale.', source: D(3, '3.12', undefined, 52) },
      { id: 'c3.6-q2', kind: 'scelta', q: 'Che cos’è un piano scarico in uno stato biassiale?', options: ['Il piano principale con tensione principale nulla: vettore tensione nullo', 'Un piano con tensione solo normale', 'Il piano di $\\tau_{\\max}$', 'Un piano su cui $\\sigma_n=0$ e $\\tau_n\\ne0$'], correct: 0, why: '§3.12: con $\\lambda_1=0$ anche le tangenziali su quel piano sono nulle: $\\vet t_{n_1}=\\vet 0$.', source: D(3, '3.12', undefined, 51) },
      { id: 'c3.6-q3', kind: 'scelta', q: 'Con $III=0$ e $II\\ne0$ lo stato di tensione è…', options: ['biassiale', 'triassiale', 'monoassiale', 'idrostatico'], correct: 0, why: '§3.12: $III=0$ dà una radice nulla; $II\\ne0$ esclude la seconda.', source: D(3, '3.12', undefined, 52) },
      { id: 'c3.6-q4', kind: 'aperta', q: 'Che cosa caratterizza lo stato idrostatico?', answer: 'Radice tripla: $\\tens T=\\lambda\\tens I$, ogni riferimento è principale e su ogni piano la tensione è normale e uguale a $\\lambda$, come una piccola sfera in un fluido in quiete (§3.11.2).', source: D(3, '3.11.2', undefined, 51) },
    ],
  },
  {
    id: 'c3.7',
    module: 'm3',
    title: 'Tensioni estreme ed esercizio svolto',
    prereq: ['c3.6'],
    source: D(3, '3.13–3.14', 'Prop 3.13.1–3.13.2', '53–56'),
    meaning: 'Le tensioni principali danno subito il campo di variazione della tensione normale, $s_3\\le\\sigma_m\\le s_1$, e la tangenziale massima, $\\tau_{\\max}=(s_1-s_3)/2$, che agisce sulla bisettrice tra $\\hat n_1$ e $\\hat n_3$, su un piano **non scarico** di tensione normale.',
    formulas: [
      { tex: 's_3\\le\\sigma_m\\le s_1\\quad\\forall\\hat m', label: 'tensioni normali estreme', rif: 'Prop 3.13.1' },
      { tex: '\\tau_{\\max}=\\dfrac{s_1-s_3}2,\\quad\\hat m=\\tfrac1{\\sqrt2}(\\hat n_1-\\hat n_3),\\quad\\hat\\nu=\\tfrac1{\\sqrt2}(\\hat n_1+\\hat n_3)', label: 'tangenziale massima', rif: 'Prop 3.13.2' },
      { tex: '\\sigma_m\\big|_{\\tau_{\\max}}=\\tfrac12(s_1+s_3)', label: 'normale sul piano di τ_max', rif: '§3.13.2' },
    ],
    explanation: `**Normali estreme** (§3.13.1). Nel riferimento principale $\\sigma_m=s_1m_1^2+s_2m_2^2+s_3m_3^2$: è un massimo vincolato ($\\hat m\\cdot\\hat m=1$), uno dei tanti problemi di ottimizzazione dell'ingegneria. La dispensa lo risolve in modo **euristico**: sostituendo $s_2$ e $s_3$ con $s_1$ la quantità cresce, quindi $\\sigma_m\\le s_1$; e $s_1$ si raggiunge su $\\hat n_1$, quindi è il massimo. Allo stesso modo $s_3$ è il minimo.

**Tangenziale massima** (§3.13.2). Qui la giacitura $\\hat m$ e la direzione $\\hat\\nu\\perp\\hat m$ sono entrambe incognite: 6 variabili con tre vincoli. L'euristica non basta: si usano i moltiplicatori di Lagrange, e la dispensa dà il **risultato senza derivazione** (NF-11). La verifica è semplice: con $\\hat m=(1,0,-1)/\\sqrt2$ e $\\hat\\nu=(1,0,1)/\\sqrt2$ nel riferimento principale si trova $\\tau_{m\\nu}=\\frac12(s_1-s_3)$, e sullo stesso piano $\\sigma_m=\\frac12(s_1+s_3)$.

**Esercizio svolto** (§3.14): $[\\tens T]$ con $III=0$, $II=-45$ è biassiale; $s=3\\sqrt5,\\,0,\\,-3\\sqrt5$; $\\tau_{\\max}=3\\sqrt5$ con $\\sigma=0$ sulla sua giacitura; con $\\hat n=(1,-1,-2)/\\sqrt6$: $\\sigma_n=5$, $\\tau_n=2\\sqrt5$.`,
    pitfalls: [
      'Il piano di $\\tau_{\\max}$ non è scarico: su di esso $\\sigma=\\frac12(s_1+s_3)$.',
      'Dire che la dispensa dimostra $\\tau_{\\max}$: dà il risultato (moltiplicatori di Lagrange) e una verifica.',
      'Combinare le direzioni sbagliate: $\\tau_{\\max}$ sta tra $\\hat n_1$ e $\\hat n_3$ (gli appunti avevano un refuso).',
    ],
    visual: { kind: 'tensione3d', scene: { mode: 'principali', preset: 'esercizio', presets: ['esercizio', 'generico', 'trazione'], controls: ['preset'] } },
    recall: [
      { id: 'c3.7-q1', kind: 'scelta', q: 'Su quale giacitura agisce $\\tau_{\\max}$?', options: ['$\\hat m=(\\hat n_1-\\hat n_3)/\\sqrt2$, bisettrice tra le direzioni di $s_1$ e $s_3$', '$\\hat n_2$', '$\\hat n_1$', '$(\\hat n_1-\\hat n_2)/\\sqrt2$'], correct: 0, why: 'Prop 3.13.2.', source: D(3, '3.13.2', 'Prop 3.13.2', 54) },
      { id: 'c3.7-q2', kind: 'vf', q: 'Sul piano della tangenziale massima la tensione normale è nulla.', answer: false, why: '§3.13.2: vale $\\frac12(s_1+s_3)$; è nulla solo se $s_1=-s_3$, come nell’esercizio di §3.14.', source: D(3, '3.13.2', undefined, 54) },
      { id: 'c3.7-q3', kind: 'aperta', q: 'Spiega il ragionamento euristico che dà $\\sigma_m\\le s_1$.', answer: 'Nel riferimento principale $\\sigma_m=s_1m_1^2+s_2m_2^2+s_3m_3^2\\le s_1(m_1^2+m_2^2+m_3^2)=s_1$, perché $s_2,s_3\\le s_1$ e i pesi sono non negativi; il valore $s_1$ si raggiunge su $\\hat n_1$, quindi è il massimo (Prop 3.13.1).', source: D(3, '3.13.1', 'Prop 3.13.1', 53) },
    ],
  },
  {
    id: 'c3.8',
    module: 'm3',
    title: 'Cerchio di Mohr: equazione, costruzione, impiego',
    prereq: ['c3.5'],
    source: D(3, '3.15', 'Prop 3.15.1', '56–60'),
    meaning: 'Per i piani di un fascio che ha per asse una direzione principale, i punti $(\\sigma_m,\\tau_{m\\nu})$ stanno su un **cerchio**. Con il **polo** $P(\\sigma_1,-\\tau_{12})$ e una retta parallela alla traccia del piano si legge lo stato di tensione di ogni giacitura del fascio, e si trovano a colpo d’occhio tensioni principali e tangenziali estreme.',
    formulas: [
      { tex: '\\sigma_m=\\dfrac{\\sigma_1+\\sigma_2}2+\\dfrac{\\sigma_1-\\sigma_2}2\\cos2\\alpha+\\tau_{12}\\sin2\\alpha,\\quad\\tau_{m\\nu}=-\\dfrac{\\sigma_1-\\sigma_2}2\\sin2\\alpha+\\tau_{12}\\cos2\\alpha', label: 'stato sul piano inclinato di α', rif: '§3.15.2' },
      { tex: '\\Big(\\sigma_m-\\dfrac{\\sigma_1+\\sigma_2}2\\Big)^2+\\tau_{m\\nu}^2=\\Big(\\dfrac{\\sigma_1-\\sigma_2}2\\Big)^2+\\tau_{12}^2', label: 'equazione del cerchio', rif: '§3.15.2' },
      { tex: 's_{1,2}=\\sigma_C\\pm R,\\qquad\\tan2\\gamma=\\dfrac{2\\tau_{12}}{\\sigma_1-\\sigma_2},\\qquad\\tau_{\\max}=R', label: 'principali e tangenziale estrema', rif: '§3.15.5–3.15.6' },
    ],
    explanation: `**Impostazione** (§3.15.1). Con $\\tau_{13}=\\tau_{23}=0$, $\\hat e_3$ è principale. Per i piani del fascio di asse $\\hat e_3$, $\\hat m=(\\cos\\alpha,\\sin\\alpha,0)$ e $\\hat\\nu=(-\\sin\\alpha,\\cos\\alpha,0)$ ($\\hat m$ ruotato di 90° in senso antiorario). Il vettore tensione sta nel piano $\\hat e_1\\hat e_2$: lo studio si riduce a quel piano, anche in uno stato triassiale (in uno biassiale vale per ogni giacitura).

**Equazione** (§3.15.2): con le formule di duplicazione si ricavano $\\sigma_m$ e $\\tau_{m\\nu}$; portando a sinistra la semisomma, elevando al quadrato e sommando si ottiene un cerchio di centro $C=(\\frac{\\sigma_1+\\sigma_2}2,0)$ e raggio $R$ (negli appunti c'era un refuso con la semisomma). **Convenzione:** asse $\\sigma$ concorde a $\\hat e_1$, asse $\\tau$ **opposto** a $\\hat e_2$, cioè verso il basso.

**Costruzione** (§3.15.3): $A(\\sigma_1,0)$, $B(\\sigma_2,0)$, il centro $C$, il **polo** $P(\\sigma_1,-\\tau_{12})$; il cerchio di centro $C$ per $P$. $Q_0(\\sigma_1,\\tau_{12})$ rappresenta $\\hat m=\\hat e_1$.

**Impiego** (§3.15.4): per $P$ la retta parallela a $\\hat\\nu$ (la traccia del piano di giacitura $\\hat m$) incontra il cerchio in $Q_m(\\sigma_m,\\tau_{m\\nu})$. La Prop 3.15.1 lo dimostra con l'angolo alla circonferenza ($2\\alpha$ al centro) e le formule di sottrazione. **Facce ortogonali** → punti diametralmente opposti (non contraddice la reciprocità: per la faccia $\\hat\\nu$ la direzione ruotata è $-\\hat m$).

**Principali** (§3.15.5): le intersezioni con l'asse $\\sigma$, $s_{1,2}=\\sigma_C\\pm R$; le rette $PS_1$, $PS_2$ sono le tracce $\\eta$, $\\xi$ dei piani principali. **Tangenziali estreme** (§3.15.6): i punti più alto e più basso, $\\tau_{\\max}=R$, su piani a 45° da quelli principali, con $\\sigma=\\sigma_C$ (90° sul cerchio sono 45° nello spazio).`,
    pitfalls: [
      'Asse $\\tau$ verso il basso: il polo $P(\\sigma_1,-\\tau_{12})$ sta in alto se $\\tau_{12}>0$.',
      'Raggio: $R$ contiene la semidifferenza $\\frac{\\sigma_1-\\sigma_2}2$, non la semisomma (refuso degli appunti).',
      '$\\tau_{\\max}=R$ vale nel fascio di asse $\\hat e_3$: in triassiale la massima assoluta è $(s_{\\max}-s_{\\min})/2$ con tutte e tre le principali.',
      'Angoli: sul cerchio sono doppi rispetto allo spazio fisico.',
    ],
    visual: { kind: 'svg', id: 'mohr', params: { preset: 'esempio', alpha: 30 } },
    recall: [
      { id: 'c3.8-q1', kind: 'scelta', q: 'Dove si trova il polo di rappresentazione?', options: ['$P(\\sigma_1,-\\tau_{12})$', '$P(\\sigma_1,\\tau_{12})$', 'Nel centro $C$', '$P(\\sigma_2,\\tau_{12})$'], correct: 0, why: '§3.15.3, punto 3. Il simmetrico $Q_0(\\sigma_1,\\tau_{12})$ rappresenta $\\hat m=\\hat e_1$.', source: D(3, '3.15.3', undefined, 58) },
      { id: 'c3.8-q2', kind: 'vf', q: 'Due facce ortogonali sono rappresentate da punti diametralmente opposti del cerchio.', answer: true, why: '§3.15.4: ruotare la giacitura di 90° nello spazio vuol dire 180° sul cerchio.', source: D(3, '3.15.4', undefined, 59) },
      { id: 'c3.8-q3', kind: 'scelta', q: 'Di quanto sono inclinati i piani di tangenziale massima rispetto ai piani principali?', options: ['45°', '90°', '30°', 'dipende dallo stato'], correct: 0, why: '§3.15.6: sul cerchio $S_{1,2}$ e i punti di $\\tau_{\\max}$ distano 90° al centro, cioè 45° nello spazio.', source: D(3, '3.15.6', undefined, 60) },
      { id: 'c3.8-q4', kind: 'aperta', q: 'Come si ricava l’equazione del cerchio di Mohr?', answer: 'Si scrivono $\\sigma_m$ e $\\tau_{m\\nu}$ per $\\hat m=(\\cos\\alpha,\\sin\\alpha,0)$, $\\hat\\nu=(-\\sin\\alpha,\\cos\\alpha,0)$; con le formule di duplicazione diventano funzioni di $2\\alpha$; si porta a sinistra $\\frac{\\sigma_1+\\sigma_2}2$, si eleva al quadrato e si somma: $\\cos^2+\\sin^2=1$ elimina $\\alpha$ (§3.15.2).', source: D(3, '3.15.2', undefined, 57) },
    ],
  },
  {
    id: 'c3.9',
    module: 'm3',
    title: 'Mohr: esempi, arbelo, esempio numerico',
    prereq: ['c3.8', 'c3.7'],
    source: D(3, '3.16–3.17', 'Teo 3.17.1', '60–63'),
    meaning: 'Con Mohr la trazione semplice mostra subito che la tangenziale massima, $\\sigma/2$, agisce a 45°: sono le **linee di Lüders**, alla base dei criteri di Tresca e von Mises. Per uno stato triassiale i tre cerchi costruiti sulle principali formano l’**arbelo**: ogni giacitura vi cade dentro.',
    formulas: [
      { tex: '\\text{trazione: } s_1=\\sigma,\\ \\ R=\\tau_{\\max}=\\tfrac\\sigma2\\ \\text{ a }\\pm45^\\circ', label: 'trazione semplice', rif: '§3.16.2' },
      { tex: '\\text{scorrimento: } s_{1,2}=\\pm\\tau,\\ \\ \\tau_{\\max}=\\tau', label: 'scorrimento semplice', rif: '§3.16.1' },
      { tex: '(\\sigma_m,\\tau_m)\\in\\text{arbelo};\\qquad\\tau_{\\max}=\\tfrac{s_1-s_3}2', label: 'arbelo di Mohr', rif: 'Teo 3.17.1' },
    ],
    explanation: `**Scorrimento semplice** (§3.16.1): solo $\\tau_{12}=\\tau$. Il piano di normale $\\hat e_3$ è scarico, $III=0$, $II=-\\tau^2$: biassiale. Il cerchio è centrato nell'origine con raggio $\\tau$: $s_{1,2}=\\pm\\tau$ sulle bisettrici, $\\tau_{\\max}=\\tau$ sui piani coordinati. Esercizio: $\\alpha=30°$ dà $\\sigma_m=\\frac{\\sqrt3}2\\tau$, $\\tau_{m\\nu}=\\frac\\tau2$.

**Trazione semplice** (§3.16.2): $\\operatorname{diag}(\\sigma,0,0)$, monoassiale. Il cerchio passa per l'origine, $R=\\sigma/2$. La tangenziale massima $\\sigma/2$ agisce su due piani ortogonali a $\\pm45°$ dalla trazione, con tensione normale $\\sigma/2$. **Per l'orale:** sono i piani più sollecitati a scorrimento; con una vernice fragile compaiono le **linee di Lüders**. Lo snervamento è governato dalla tangenziale massima: è l'idea dei criteri di **Tresca** e **von Mises** (Cap. 6).

**Arbelo** (§3.17.1, Teo 3.17.1, enunciato senza dimostrazione): nel riferimento principale si disegna un cerchio per ciascun fascio di asse principale ($s_1$–$s_2$, $s_1$–$s_3$ massimo, $s_2$–$s_3$). Il punto di ogni giacitura cade nella regione tra il cerchio massimo e i due minori. Si rileggono $s_3\\le\\sigma_m\\le s_1$ e $\\tau_{\\max}=\\frac{s_1-s_3}2$.

**Esempio numerico** (§3.17.2), MPa: $\\sigma_1=98$, $\\sigma_2=14$, $\\tau_{12}=21$: $R=46{,}96$, $s_1=102{,}96$, $s_2=9{,}04$, $\\gamma=13{,}28°$ (gli appunti riportavano 31,72° = 45° − 13,28°). Con $\\alpha=30°$: $\\sigma_m=95{,}19$, $\\tau_{m\\nu}=-25{,}87$, $\\sigma_\\nu=16{,}81$ ($\\sigma_m+\\sigma_\\nu=112$, invariante). Attenzione: $R$ è la massima **nel fascio** di asse $\\hat e_3$; considerando tutte le giaciture (terza principale nulla) la massima è $s_1/2=51{,}48$ MPa.`,
    pitfalls: [
      'Prendere $\\tau_{\\max}=R$ del cerchio del fascio come massima assoluta: con l’arbelo può essere più grande (esempio §3.17.2).',
      '$\\tan2\\gamma$ ha due soluzioni ($\\gamma$ e $\\gamma+90°$): per $s_1$ si sceglie quella con $\\sigma_m$ maggiore.',
      'Nella trazione semplice i piani di $\\tau_{\\max}$ hanno anche $\\sigma=\\sigma/2$.',
    ],
    visual: { kind: 'svg', id: 'arbelo' },
    recall: [
      { id: 'c3.9-q1', kind: 'scelta', q: 'In trazione semplice di intensità $\\sigma$, quanto vale la tangenziale massima e dove agisce?', options: ['$\\sigma/2$, su piani a ±45° dalla trazione', '$\\sigma$, sui piani coordinati', '$0$', '$\\sigma/2$, sul piano della sezione retta'], correct: 0, why: '§3.16.2: $R=\\sigma/2$; linee di Lüders a 45°.', source: D(3, '3.16.2', undefined, 61) },
      { id: 'c3.9-q2', kind: 'vf', q: 'Nell’esempio di §3.17.2 la tangenziale massima su tutte le giaciture è $R=46{,}96$ MPa.', answer: false, why: '$R$ è la massima nel fascio di asse $\\hat e_3$; con $s_3=0$ la massima assoluta è $(102{,}96-0)/2=51{,}48$ MPa (Attenzione, p. 63).', source: D(3, '3.17.2', undefined, 63) },
      { id: 'c3.9-q3', kind: 'aperta', q: 'Che cosa dice il teorema dell’arbelo e che cosa permette di rileggere?', answer: 'Per qualunque giacitura il punto $(\\sigma_m,\\tau_m)$ cade nella regione tra il cerchio massimo ($s_1$–$s_3$) e i due minori, o sui bordi. Si rileggono graficamente $s_3\\le\\sigma_m\\le s_1$ e $\\tau_{\\max}=(s_1-s_3)/2$ (Teo 3.17.1).', source: D(3, '3.17.1', 'Teo 3.17.1', '62–63') },
    ],
  },
];
