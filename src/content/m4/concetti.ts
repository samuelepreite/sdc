/**
 * Modulo 4 — Lavoro, legami costitutivi, iperelasticità (Cap. 4, §4.1–4.11, pp. 66–86). Fonte: tools/testi/cap-04.md.
 * §4.1 (isostatiche) è facoltativo: la dispensa dice «non richiesto all'orale» (NF-07).
 */
import { D } from '../../engine/types';
import type { Concept } from '../types';

export const M4_CONCETTI: Concept[] = [
  {
    id: 'c4.0',
    module: 'm4',
    title: 'Linee isostatiche',
    prereq: ['c3.6'],
    facoltativo: 'La dispensa lo presenta come approfondimento «non richiesto all’orale» (§4.1, p. 66).',
    source: D(4, '4.1', undefined, 66),
    meaning: 'Le **linee isostatiche** sono le curve tangenti, punto per punto, alle direzioni principali di tensione massima e minima: mostrano come i carichi fluiscono nel corpo.',
    formulas: [{ tex: '\\text{tangente alla linea in }x\\ \\parallel\\ \\hat n_1(x)\\ \\text{oppure}\\ \\hat n_3(x)', label: 'definizione', rif: '§4.1' }],
    explanation: `Finora lo stato di tensione è stato studiato in un punto. Segnando in ogni punto le direzioni principali di tensione massima e minima e collegandole si ottengono due famiglie di curve (nello spazio una terza, delle principali medie): le **isostatiche**.

Come le curve di livello di una carta topografica si infittiscono dove il terreno è ripido, le isostatiche sono più fitte dove la tensione è maggiore. Indicano dove conviene addensare la materia (il telaio di una moto) per usarla in modo efficiente. Oggi si calcolano al computer.`,
    pitfalls: ['Non è argomento d’orale secondo la dispensa: serve solo come collegamento tra tensione in un punto e progetto.'],
    visual: { kind: 'tensione3d', scene: { mode: 'principali', presets: ['generico', 'esercizio'], controls: ['preset'] } },
    recall: [
      { id: 'c4.0-q1', kind: 'vf', q: 'Le linee isostatiche sono tangenti alle direzioni principali di tensione.', answer: true, why: '§4.1: due famiglie tangenti alle direzioni di $s_1$ e di $s_3$.', source: D(4, '4.1', undefined, 66) },
      { id: 'c4.0-q2', kind: 'scelta', q: 'Dove le isostatiche sono più fitte?', options: ['Dove la tensione è maggiore', 'Dove la tensione è nulla', 'Sui bordi liberi', 'Ovunque uguali'], correct: 0, why: '§4.1: come le curve di livello dove il terreno è più ripido.', source: D(4, '4.1', undefined, 66) },
      { id: 'c4.0-q3', kind: 'aperta', q: 'A che cosa servono le isostatiche nel progetto?', answer: 'Mostrano come i carichi fluiscono: conviene addensare la materia lungo di esse per usarla in modo efficiente (§4.1).', source: D(4, '4.1', undefined, 66) },
    ],
  },
  {
    id: 'c4.1',
    module: 'm4',
    title: 'Lemma fondamentale e teorema dei lavori virtuali',
    prereq: ['c3.4', 'c2.6', 'c1.7'],
    source: D(4, '4.2–4.3', 'Teo 4.2.1, Def 4.3.1–4.3.3, Teo 4.3.4', '67–69'),
    meaning: 'Il lavoro lega enti statici (forze, tensioni) ed enti cinematici (spostamenti, deformazioni). Il **teorema dei lavori virtuali** dice che, per un qualsiasi sistema di forze e tensioni **equilibrato** e un qualsiasi sistema di spostamenti e deformazioni **congruente** dello stesso corpo, il lavoro esterno è uguale a quello interno. Nessun nesso di causa ed effetto è richiesto.',
    formulas: [
      { tex: '\\int_{\\partial\\mathcal B}\\tens T\\hat n\\cdot\\vet u\\,dA=\\int_{\\mathcal B}\\operatorname{div}\\tens T\\cdot\\vet u\\,dV+\\int_{\\mathcal B}\\tens T\\cdot\\tens H\\,dV', label: 'lemma fondamentale', rif: 'Teo 4.2.1' },
      { tex: '\\int_{\\partial\\mathcal B}\\hat{\\vet s}\\cdot\\vet u\\,dA+\\int_{\\mathcal B}\\vet b\\cdot\\vet u\\,dV=\\int_{\\mathcal B}\\tens T\\cdot\\tens E\\,dV', label: 'identità dei lavori virtuali', rif: 'Teo 4.3.4' },
    ],
    explanation: `**Lemma fondamentale** (Teo 4.2.1): vale per qualunque $\\tens T$ e $\\vet u$ regolari. Si dimostra con la definizione di trasposto ($\\tens T\\hat n\\cdot\\vet u=\\tens T^T\\vet u\\cdot\\hat n$), il teorema della divergenza e l'identità $\\operatorname{div}(\\tens T^T\\vet u)=\\operatorname{div}\\tens T\\cdot\\vet u+\\tens T\\cdot\\nabla\\vet u$. Quando $\\tens T$ è in equilibrio i tre termini sono il lavoro delle forze di superficie, quello (cambiato di segno) delle forze di volume e il lavoro di deformazione: ricorda la conservazione dell'energia.

**Sistema FT equilibrato** (Def 4.3.1): $\\{\\vet b,\\hat{\\vet s},\\tens T\\}$ con $\\operatorname{div}\\tens T+\\vet b=\\vet 0$, $\\tens T\\in\\mathrm{Sym}$, $\\tens T\\hat n=\\hat{\\vet s}$. **Sistema SD congruente** (Def 4.3.2): $\\{\\vet u,\\tens E\\}$ con $\\vet u$ ammissibile e infinitesimo e $\\tens E=\\operatorname{sym}\\nabla\\vet u$. Virtuale = ipotetico, uno spostamento di prova.

**TLV** (Teo 4.3.4): si parte dal lemma; con FT equilibrato $\\operatorname{div}\\tens T=-\\vet b$ e $\\tens T\\hat n=\\hat{\\vet s}$; poiché $\\tens T$ è simmetrico e $\\mathrm{Sym}\\perp\\mathrm{Skw}$, $\\tens T\\cdot\\tens H=\\tens T\\cdot\\tens E$. È un'**identità**: vale a priori.

**Osservazioni:** per un corpo rigido $\\tens E=\\tens O$ e il lavoro esterno è nullo; equilibrio, congruenza e TLV formano un triangolo (due vertici danno il terzo); con l'approccio della dispensa è un **teorema**, mentre la scuola francese assume come principio l'identità dei lavori virtuali e ne ricava l'equilibrio.`,
    pitfalls: [
      'Pensare che FT e SD debbano essere legati (le tensioni causate da quegli spostamenti): il TLV vale per qualsiasi coppia.',
      'Dimenticare perché nel lavoro interno compare $\\tens E$ e non $\\tens H$: $\\tens T\\cdot\\tens W=0$ per la simmetria di $\\tens T$.',
      'Confondere «principio» e «teorema»: dipende da che cosa si assume come assioma.',
    ],
    visual: { kind: 'svg', id: 'divergenza' },
    recall: [
      { id: 'c4.1-q1', kind: 'vf', q: 'Il teorema dei lavori virtuali richiede che le deformazioni del sistema SD siano quelle prodotte dalle tensioni del sistema FT.', answer: false, why: '§4.3.2: FT e SD sono definiti a priori, senza alcun nesso; basta che FT sia equilibrato e SD congruente.', source: D(4, '4.3.2', 'Teo 4.3.4', 68) },
      { id: 'c4.1-q2', kind: 'scelta', q: 'Perché nel TLV il lavoro interno si scrive con $\\tens E$ invece che con $\\tens H$?', options: ['Perché $\\tens T$ è simmetrico e $\\tens T\\cdot\\tens W=0$', 'Perché $\\tens H$ è nullo', 'Perché $\\tens E$ è definito positivo', 'Per il teorema della divergenza'], correct: 0, why: 'Dim. del Teo 4.3.4: $\\tens H=\\tens E+\\tens W$ e Sym ⊥ Skw (Prop 1.6.3).', source: D(4, '4.3.2', 'Teo 4.3.4', 69) },
      { id: 'c4.1-q3', kind: 'aperta', q: 'Che cosa diventa il TLV per un corpo rigido?', answer: 'Gli spostamenti ammessi sono solo rigidi, quindi $\\tens E=\\tens O$ e il lavoro interno è nullo: $\\int_{\\partial\\mathcal B}\\hat{\\vet s}\\cdot\\vet u+\\int_{\\mathcal B}\\vet b\\cdot\\vet u=0$ (§4.3.3, oss. 1).', source: D(4, '4.3.3', undefined, 69) },
      { id: 'c4.1-q4', kind: 'aperta', q: 'Che cosa vuol dire «identità triangolare» tra equilibrio, congruenza e TLV?', answer: 'Bastano due dei tre vertici per determinare il terzo: per esempio congruenza + TLV implicano l’equilibrio (§4.3.3, oss. 4–5).', source: D(4, '4.3.3', undefined, 69) },
    ],
  },
  {
    id: 'c4.2',
    module: 'm4',
    title: 'Legami costitutivi e classificazione dei comportamenti',
    prereq: ['c3.6'],
    source: D(4, '4.4', 'Def 4.4.1–4.4.5', '69–73'),
    meaning: 'Il **legame costitutivo** è l’espressione matematica della natura del materiale: lega tensioni e deformazioni. La meccanica dei continui lo descrive in modo **fenomenologico** e classifica i comportamenti: elastico, elastico lineare, iperelastico, elasto-plastico, viscoso.',
    formulas: [
      { tex: '\\tens T=\\hat{\\tens T}(\\tens E)\\quad\\text{(elastico)}', label: 'risposta elastica', rif: 'Def 4.4.2' },
      { tex: '\\tens T=\\mathbb A\\tens E\\quad\\text{(elastico lineare)}', label: 'legge di Hooke generalizzata', rif: 'Def 4.4.3' },
    ],
    explanation: `Tre travi uguali di legno, acciaio e ferro con lo stesso carico si deformano in modo diverso: la deformazione dipende dal **materiale**.

**Descrizione fenomenologica** (§4.4.1): non si studia la micromeccanica (atomi, cristalli) ma il comportamento macroscopico. La materia è un continuo osservato a una scala abbastanza grande: l'**elemento di volume rappresentativo** (RVE, Def 4.4.1) contiene così tanti costituenti che la loro distribuzione è statisticamente irrilevante. Metalli: millimetri; legno: centimetri; muratura: metri. Sotto il micron il continuo non vale più.

**Classificazione** (§4.4.2), dall'osservazione della prova di trazione:
- **elastico** (Def 4.4.2): risposta indipendente dal tempo e deformazione reversibile; a uno sforzo corrisponde una sola deformazione;
- **elastico lineare** (Def 4.4.3): la relazione è lineare, $\\tens T=\\mathbb A\\tens E$ (ut tensio sic vis);
- **iperelastico** (Def 4.4.4): anche reversibilità termodinamica, l'energia spesa viene restituita;
- **elasto-plastico** (Def 4.4.5): indipendente dal tempo ma con deformazione residua allo scarico (plastico se non rientra nulla);
- **viscoso**: dipende dal tempo, per dissipazione interna: **creep** a forza imposta, **rilassamento** a deformazione imposta.

**Scelta del modello** (§4.4.3): non esiste un modello universale; si usa il più semplice che sia descrittivo e predittivo nelle condizioni d'esercizio. La carrozzeria in esercizio è elastica, nell'urto è utile che si plasticizzi; ad alta temperatura serve la viscosità.`,
    pitfalls: [
      'Una curva di carico crescente non basta a dire «elastico»: bisogna verificare che allo scarico si torni indietro e che non conti il tempo.',
      'Creep e rilassamento: il primo a forza imposta (cresce la deformazione), il secondo a deformazione imposta (cala la forza).',
      'Il modello dipende dal campo di sollecitazioni, non solo dal materiale.',
    ],
    visual: { kind: 'svg', id: 'prove', params: { tab: 'tempo' } },
    recall: [
      { id: 'c4.2-q1', kind: 'scelta', q: 'Quale comportamento ha deformazione reversibile ma anche restituzione dell’energia spesa?', options: ['Iperelastico', 'Elasto-plastico', 'Viscoso', 'Plastico'], correct: 0, why: 'Def 4.4.4: alla reversibilità meccanica si aggiunge quella termodinamica.', source: D(4, '4.4.2', 'Def 4.4.4', 71) },
      { id: 'c4.2-q2', kind: 'vf', q: 'Il creep si osserva imponendo una deformazione costante.', answer: false, why: '§4.4.2: a forza imposta si osserva il creep (la deformazione cresce), a deformazione imposta il rilassamento (la forza cala).', source: D(4, '4.4.2', undefined, 72) },
      { id: 'c4.2-q3', kind: 'aperta', q: 'Che cos’è l’elemento di volume rappresentativo e perché la sua dimensione dipende dal materiale?', answer: 'Un volume con abbastanza costituenti microscopici da rendere irrilevante la loro distribuzione interna ai fini della risposta globale (Def 4.4.1). Dipende dalla scala della struttura interna: millimetri per i metalli, centimetri per il legno (fibre), metri per la muratura (conci e giunti).', source: D(4, '4.4.1', 'Def 4.4.1', 70) },
    ],
  },
  {
    id: 'c4.3',
    module: 'm4',
    title: 'Prove su acciaio e calcestruzzo',
    prereq: ['c4.2', 'c3.9'],
    source: D(4, '4.5–4.7', undefined, '73–77'),
    meaning: 'La prova di trazione sull’acciaio mostra i tratti **elastico, snervamento, incrudimento, strizione**; allo snervamento compaiono le **linee di Lüders** a 45°. La prova di compressione sul calcestruzzo, fatta a controllo di deformazione, rivela il **softening** e spiega la rottura fragile.',
    formulas: [
      { tex: '\\sigma=\\dfrac F{A_0},\\qquad\\varepsilon=\\dfrac{\\Delta L}{L_0},\\qquad\\sigma=E\\,\\varepsilon', label: 'diagramma σ–ε della norma e legge di Hooke', rif: '§4.5.3' },
      { tex: 'E\\simeq205\\,000\\ \\text{MPa}=205\\ \\text{GPa}\\ \\text{(acciai)}', label: 'modulo di Young', rif: '§4.5.3' },
    ],
    explanation: `**Acciaio in trazione** (§4.5). Si guarda il tratto utile $L_0$, lontano dalle ganasce, soggetto a trazione centrata.
- **Elastico**: lineare fino a $F_p$ (proporzionalità), poi elastico non lineare fino a $F_y$ (snervamento). Scaricando si torna indietro.
- **Snervamento**: il materiale si deforma a carico circa costante; scaricando resta una deformazione residua. Ricaricando, snerva di nuovo solo al carico massimo raggiunto.
- **Incrudimento**: riprende a portare carico, con rigidezza più bassa, fino a $F_t$.
- **Rottura**: dopo il picco una caduta ripida, con la **strizione** (necking) dove il materiale è più debole: lì si localizza la deformazione.

**Linee di Lüders** (§4.5.1): con una vernice screpolante, allo snervamento compaiono linee a 45° dalla trazione. Dal cerchio di Mohr: a 45° c'è la tangenziale massima; la crisi arriva quando questa supera un limite.

**Da F–ΔL a σ–ε** (§4.5.3): $\\sigma=F/A_0$, $\\varepsilon=\\Delta L/L_0$ (media), $\\sigma=E\\varepsilon$ nel tratto lineare. La curva reale ($F/A$ con la sezione che si restringe) mostra **hardening**, cioè nessun softening; la norma usa la curva con $A_0$ per avere parametri confrontabili in qualunque laboratorio. Acciai ad alto carbonio: stesso $E$, più resistenza, meno duttilità, snervamento convenzionale allo 0,2%.

**Calcestruzzo in compressione** (§4.6). A **controllo di carico** il provino esplode al picco (l'energia diventa cinetica). A **controllo di deformazione** compare un ramo discendente: **softening**. In una struttura il punto in softening cede carico ai vicini, che entrano in crisi a catena: **rottura fragile**, senza preavviso.

**Altri aspetti** (§4.7): comportamento uguale o diverso in trazione e compressione (acciaio sì, calcestruzzo no); dipendenza dalla direzione (FRP 0/90).`,
    pitfalls: [
      'Pensare che la curva della norma sia quella reale: è una convenzione per confrontare i laboratori.',
      'Dire che il calcestruzzo «non ha» ramo discendente: lo si vede solo a deformazione controllata.',
      'Unità: $E\\simeq205\\,000$ MPa, non GPa (refuso degli appunti).',
    ],
    visual: { kind: 'svg', id: 'prove', params: { tab: 'acciaio' } },
    recall: [
      { id: 'c4.3-q1', kind: 'scelta', q: 'Perché le linee di Lüders sono inclinate di 45° rispetto alla trazione?', options: ['Perché a 45° agisce la tensione tangenziale massima', 'Perché a 45° la tensione normale è massima', 'Per la forma delle ganasce', 'Per la strizione'], correct: 0, why: '§4.5.1: dal cerchio di Mohr dello stato monoassiale, i piani di $\\tau_{\\max}=\\sigma/2$ sono a 45°.', source: D(4, '4.5.1', undefined, 74) },
      { id: 'c4.3-q2', kind: 'vf', q: 'Una prova a controllo di carico sul calcestruzzo mostra il ramo di softening.', answer: false, why: '§4.6: a controllo di carico il provino esplode al picco; il softening si vede a controllo di deformazione.', source: D(4, '4.6', undefined, 76) },
      { id: 'c4.3-q3', kind: 'aperta', q: 'Perché si usa la curva σ = F/A₀ della norma e non quella reale?', answer: 'La norma vuole una procedura ripetibile in qualunque laboratorio senza strumentazione speciale: la curva con $A_0$ dà parametri di confronto universali. La curva reale ($F/A$, deformazioni locali) mostrerebbe hardening (§4.5.3).', source: D(4, '4.5.3', undefined, '74–75') },
      { id: 'c4.3-q4', kind: 'aperta', q: 'Come nasce la rottura fragile di una struttura in calcestruzzo?', answer: 'Dal softening: il punto che ha superato il picco continua a deformarsi cedendo carico ai punti vicini, che a loro volta entrano in crisi e cedono carico; la crisi si propaga senza deformazioni premonitrici marcate (§4.6).', source: D(4, '4.6', undefined, 76) },
    ],
  },
  {
    id: 'c4.4',
    module: 'm4',
    title: 'Elasticità lineare e simmetrie minori',
    prereq: ['c4.2', 'c1.6', 'c2.6'],
    source: D(4, '4.8', 'Def 4.8.1', '77–78'),
    meaning: 'Nell’elasticità lineare la tensione in un punto dipende **solo e linearmente** dalla deformazione infinitesima in quel punto: $\\tens T=\\mathbb A\\tens E$. Poiché $\\tens T$ ed $\\tens E$ sono simmetrici, il tensore elastico ha le due simmetrie minori: da 81 a 36 costanti, e i moti rigidi non generano tensione.',
    formulas: [
      { tex: '\\tens T(x)=\\mathbb A(x)\\big[\\tens E(x)\\big],\\qquad T_{ij}=\\textstyle\\sum_{h,k}A_{ijhk}E_{hk}', label: 'elasticità lineare', rif: 'Def 4.8.1' },
      { tex: 'A_{ijhk}=A_{jihk}=A_{ijkh}\\ \\Rightarrow\\ 36\\ \\text{costanti}', label: 'simmetrie minori', rif: '§4.8.1' },
      { tex: '\\mathbb A\\tens W=\\tens O\\quad\\forall\\tens W\\in\\mathrm{Skw}', label: 'nessuna tensione dai moti rigidi', rif: '§4.8.1' },
      { tex: '\\tens T_0=\\tens T(\\tens E=\\tens O)=\\tens O', label: 'configurazione di riferimento naturale', rif: '§4.8.1' },
    ],
    explanation: `**Elastico** vuol dire: lo sforzo in $x$ dipende solo dalla deformazione **attuale** (niente storia) **in $x$** (niente comportamenti non locali), e non dal tempo. **Lineare** vuol dire: piccoli spostamenti (si riferisce $\\tens T$ ai punti di $\\mathcal B$) e piccole deformazioni (si usa $\\tens E$).

**Def 4.8.1:** fissato $x$ esiste il **tensore elastico** $\\mathbb A$ con $\\tens T=\\mathbb A\\tens E$. Può cambiare da punto a punto (una roccia stratificata); per un corpo **omogeneo** è costante. Le sue componenti sono i **moduli elastici**: 81, da misurare. Ma sono davvero indipendenti?

**Simmetrie minori** (§4.8.1): $\\mathbb A$ manda tensori simmetrici in tensori simmetrici.
- prima minore: $\\mathbb A\\tens A$ è sempre simmetrico ($\\tens T$ lo è), $A_{ijhk}=A_{jihk}$;
- seconda minore: $\\mathbb A$ vede solo la parte simmetrica dell'argomento, $A_{ijhk}=A_{ijkh}$, cioè $\\mathbb A\\tens W=\\tens O$.

Con entrambe le componenti indipendenti scendono a **36**. Fisicamente: applicando $\\mathbb A$ a $\\tens H$ si ottiene lo stesso che con $\\tens E$; una rototraslazione rigida infinitesima non genera tensione, perché per far nascere uno sforzo serve una deformazione.

**Configurazione di riferimento naturale:** si aggiunge l'ipotesi $\\tens T_0=\\tens O$: nella configurazione di riferimento non ci sono sforzi residui.`,
    pitfalls: [
      'Contare 81 costanti indipendenti: le simmetrie minori le riducono a 36 (e la maggiore a 21).',
      'Dimenticare l’ipotesi di configurazione naturale (niente sforzi residui).',
      'Pensare che il legame lineare discenda dall’elasticità: servono anche piccoli spostamenti e piccole deformazioni.',
    ],
    visual: { kind: 'svg', id: 'simmetrie4', params: { minor1: true, minor2: true } },
    recall: [
      { id: 'c4.4-q1', kind: 'scelta', q: 'Quante costanti indipendenti ha un tensore elastico con entrambe le simmetrie minori?', options: ['36', '81', '21', '9'], correct: 0, why: '§4.8.1: le coppie $(ij)$ e $(hk)$ prendono 6 valori ciascuna: matrice 6×6.', source: D(4, '4.8.1', undefined, 78) },
      { id: 'c4.4-q2', kind: 'vf', q: 'Una rotazione rigida infinitesima genera tensioni in un materiale elastico lineare.', answer: false, why: '§4.8.1: $\\mathbb A\\tens W=\\tens O$ per la seconda simmetria minore.', source: D(4, '4.8.1', undefined, 78) },
      { id: 'c4.4-q3', kind: 'aperta', q: 'Quali ipotesi stanno dietro l’aggettivo «lineare» in elasticità lineare?', answer: 'Piccoli spostamenti ($|\\vet u|\\ll1$: si riferisce $\\tens T$ ai punti della configurazione di riferimento) e piccole deformazioni ($\\|\\tens H\\|\\ll1$: si usa $\\tens E$). Con grandi spostamenti o deformazioni si parla di elasticità non lineare (§4.8).', source: D(4, '4.8', undefined, 77) },
    ],
  },
  {
    id: 'c4.5',
    module: 'm4',
    title: 'Iperelasticità e teorema sull’energia specifica',
    prereq: ['c4.4', 'c4.1'],
    source: D(4, '4.9', 'Def 4.9.1, Teo 4.9.2', '79–82'),
    meaning: 'Un materiale è **iperelastico** se esiste l’energia specifica di deformazione $\\varphi$ con $\\tens T=\\partial\\varphi/\\partial\\tens E$. Allora il lavoro per deformare un punto non dipende dal cammino e su un cammino chiuso è nullo; per il caso lineare questo equivale alla simmetria maggiore $\\mathbb A=\\mathbb A^T$ (21 costanti) e a $\\varphi=\\frac12\\mathbb A\\tens E\\cdot\\tens E$.',
    formulas: [
      { tex: '\\tens T=\\dfrac{\\partial\\varphi(\\tens E)}{\\partial\\tens E},\\qquad\\varphi(\\tens O)=0', label: 'materiale iperelastico', rif: 'Def 4.9.1' },
      { tex: 'w=\\int_{\\alpha_1}^{\\alpha_2}\\hat{\\tens T}\\cdot\\dfrac{d\\hat{\\tens E}}{d\\alpha}\\,d\\alpha=\\varphi(\\tens E_2)-\\varphi(\\tens E_1)', label: 'lavoro indipendente dal cammino', rif: '§4.9.1' },
      { tex: '\\exists\\varphi\\iff\\mathbb A=\\mathbb A^T\\iff\\varphi=\\tfrac12\\mathbb A\\tens E\\cdot\\tens E', label: 'teorema sull’energia specifica', rif: 'Teo 4.9.2' },
    ],
    explanation: `**Def 4.9.1:** $\\varphi:\\mathrm{Sym}\\to\\mathbb R$ è l'**energia specifica di deformazione** (lavoro per unità di volume). La derivata di una funzione scalare rispetto a un tensore è un tensore: $T_{ij}=\\partial\\varphi/\\partial E_{ij}$. L'iperelasticità si definisce anche senza linearità.

**Cammino di deformazione** (§4.9.1): una funzione $\\hat{\\tens E}(\\alpha)$ tra due stati. Se il materiale è elastico, a ogni deformazione corrisponde una tensione: c'è anche un cammino di tensione. Il lavoro elementare è $dw=\\tens T\\cdot d\\tens E$. Se $\\varphi$ esiste, l'integranda è il differenziale esatto di $\\varphi(\\hat{\\tens E}(\\alpha))$: il lavoro **non dipende dal cammino** e vale $\\varphi_2-\\varphi_1$ (processo conservativo). Su un cammino chiuso è nullo: l'energia spesa viene restituita.

**Significato assoluto** (§4.9.2): partendo da $\\tens E=\\tens O$, $\\varphi(\\tens E)$ è il lavoro speso per passare dalla configurazione naturale a $\\tens E$. L'energia del corpo è $\\Phi=\\int_{\\mathcal B}\\varphi\\,dV$. (Un arco teso come riferimento non è naturale: lì $\\varphi\\ne0$.)

**Teo 4.9.2** (elastico lineare), equivalenza di: a) esiste $\\varphi$; b) $\\mathbb A=\\mathbb A^T$; c) $\\varphi=\\frac12\\mathbb A\\tens E\\cdot\\tens E$.
- a ⇒ b: $\\partial^2\\varphi/\\partial E_{ij}\\partial E_{hk}=A_{ijhk}$, e per Schwarz l'ordine non conta: $A_{ijhk}=A_{hkij}$.
- b ⇒ c: cammino rettilineo $\\hat{\\tens E}=\\alpha\\tens E^*$: $w=\\mathbb A\\tens E^*\\cdot\\tens E^*\\int_0^1\\alpha\\,d\\alpha=\\frac12\\mathbb A\\tens E^*\\cdot\\tens E^*$.
- La dispensa nota che per chiudere servono anche c ⇒ a (immediata) e b ⇒ a.

**Definita positività** (§4.9.4): $\\mathbb A\\in\\mathrm{Pos}^+\\Rightarrow\\varphi(\\tens E)>0$ per ogni $\\tens E\\ne\\tens O$. **Tensore tangente** (§4.9.5): se il legame non è lineare, $\\mathbb A=\\partial^2\\varphi/\\partial\\tens E^2$ punto per punto.`,
    pitfalls: [
      'Dire che ogni materiale elastico è iperelastico: serve anche la reversibilità termodinamica (per gli isotropi coincidono, §4.12).',
      'Il fattore ½ in $\\varphi$ viene dall’integrale $\\int_0^1\\alpha\\,d\\alpha$ (carico applicato gradualmente).',
      'La catena a ⇒ b ⇒ c degli appunti usa a) nel passo b ⇒ c: per l’equivalenza serve chiudere il cerchio (Attenzione, p. 81).',
    ],
    visual: { kind: 'svg', id: 'cammino' },
    recall: [
      { id: 'c4.5-q1', kind: 'scelta', q: 'Quale teorema dell’analisi garantisce $A_{ijhk}=A_{hkij}$ se esiste $\\varphi$?', options: ['Il teorema di Schwarz sull’ordine di derivazione', 'Il teorema della divergenza', 'Il teorema spettrale', 'Il lemma di Cauchy'], correct: 0, why: 'Teo 4.9.2, a ⇒ b: $A_{ijhk}=\\partial^2\\varphi/\\partial E_{ij}\\partial E_{hk}$.', source: D(4, '4.9.3', 'Teo 4.9.2', 81) },
      { id: 'c4.5-q2', kind: 'vf', q: 'Per un materiale iperelastico il lavoro su un cammino chiuso di deformazione è nullo.', answer: true, why: '§4.9.1: $w=\\varphi(\\tens E_1)-\\varphi(\\tens E_1)=0$; l’energia spesa viene restituita.', source: D(4, '4.9.1', undefined, 80) },
      { id: 'c4.5-q3', kind: 'aperta', q: 'Ricava $\\varphi=\\frac12\\mathbb A\\tens E\\cdot\\tens E$ dalla simmetria maggiore.', answer: 'Cammino rettilineo $\\hat{\\tens E}(\\alpha)=\\alpha\\tens E^*$, $\\alpha\\in[0,1]$: $w=\\int_0^1\\mathbb A(\\alpha\\tens E^*)\\cdot\\tens E^*d\\alpha=\\mathbb A\\tens E^*\\cdot\\tens E^*\\int_0^1\\alpha\\,d\\alpha=\\frac12\\mathbb A\\tens E^*\\cdot\\tens E^*$, che coincide con $\\varphi(\\tens E^*)$ (Teo 4.9.2, b ⇒ c).', source: D(4, '4.9.3', 'Teo 4.9.2', 81) },
      { id: 'c4.5-q4', kind: 'scelta', q: 'Quante costanti indipendenti ha un tensore elastico iperelastico?', options: ['21', '36', '81', '2'], correct: 0, why: 'Simmetrie minori + maggiore: matrice 6×6 simmetrica, 6 + 15 = 21.', source: D(4, '4.9', undefined, 79) },
    ],
  },
  {
    id: 'c4.6',
    module: 'm4',
    title: 'Simmetrie materiali e notazione di Voigt',
    prereq: ['c4.5', 'c1.4'],
    source: D(4, '4.10–4.11', 'Def 4.10.1', '82–86'),
    meaning: 'Un materiale può rispondere allo stesso modo in direzioni diverse: le trasformazioni ortogonali che lasciano invariata la risposta formano il **gruppo di simmetria materiale**. Più il gruppo è grande, meno costanti servono: anisotropo 21, ortotropo 9, trasversalmente isotropo 5, isotropo 2 (iperelastici).',
    formulas: [
      { tex: '\\mathbb A[\\tens Q\\tens E\\tens Q^T]=\\tens Q(\\mathbb A\\tens E)\\tens Q^T\\quad\\forall\\tens E\\in\\mathrm{Sym}', label: 'trasformazione di simmetria materiale', rif: 'Def 4.10.1' },
      { tex: '\\{\\tens T\\}=(\\sigma_1,\\sigma_2,\\sigma_3,\\tau_{23},\\tau_{31},\\tau_{12}),\\ \\ \\{\\tens E\\}=(\\varepsilon_1,\\varepsilon_2,\\varepsilon_3,\\gamma_{23},\\gamma_{31},\\gamma_{12})', label: 'notazione di Voigt', rif: '§4.11' },
      { tex: '\\text{anisotropi }36/21,\\ \\text{ortotropi }12/9,\\ \\text{trasv. isotropi }6/5,\\ \\text{isotropi }2/2', label: 'costanti (elastico/iperelastico)', rif: '§4.10.2' },
    ],
    explanation: `**Esperimento** (§4.10): da lastre di acciaio, legno e CFRP 0/90 si ricavano provini in tre direzioni. L'acciaio risponde allo stesso modo; il legno è più rigido lungo le fibre; il CFRP 0/90 uguale a 0° e 90°, più deformabile a 45°. Cercare le direzioni con la stessa risposta è cercare le **simmetrie materiali** (terminologia presa dall'ottica dei cristalli). Le prove tradizionali ritagliano molti provini; quelle a **ultrasuoni** (anche con laser) sono non distruttive.

**Condizione** (Def 4.10.1): si perturba l'intorno con $\\vet u^*=\\tens Q\\vet u$; allora $\\tens E^*=\\tens Q\\tens E\\tens Q^T$. La stessa risposta vuol dire $\\tens T^*$ ruotato come $\\tens E^*$: $\\tens T^*=\\tens Q\\tens T\\tens Q^T$. Le $\\tens Q$ che lo soddisfano formano il **gruppo di simmetria** $\\mathcal G\\subseteq\\mathrm{Orth}$; un gruppo grande obbliga molte componenti a coincidere o ad annullarsi. (Per gli anisotropi il gruppo non è vuoto: contiene $\\tens I$ e $-\\tens I$.)

**Voigt** (§4.11): tensori simmetrici come vettori a 6 componenti, con gli scorrimenti $\\gamma=2E$; il legame diventa una matrice 6×6 con quattro blocchi: NW ($\\sigma_i\\leftrightarrow\\varepsilon_h$), NE ($\\sigma_i\\leftrightarrow\\gamma_{hk}$), SW ($\\tau_{ij}\\leftrightarrow\\varepsilon_h$), SE ($\\tau_{ij}\\leftrightarrow\\gamma_{hk}$). Le semplificazioni si vedono solo nel riferimento legato alle direzioni di simmetria.

- **Ortotropi** (riferimento principale di ortotropia): NE e SW vuoti, SE diagonale; $\\tau_{23}=C_{44}\\gamma_{23}$.
- **Trasversalmente isotropi** (asse $\\hat e_3$): $C_{66}=(C_{11}-C_{12})/2$. Il riferimento del materiale può non coincidere con quello di calcolo: serve una trasformazione tensoriale.
- **Isotropi**: $\\lambda+2\\mu$, $\\lambda$, $\\mu$ in qualunque riferimento; disaccoppiamento tra comportamento estensionale e di scorrimento. Elastico e iperelastico coincidono.

Gli oggetti stampati in 3D sono spiccatamente anisotropi.`,
    pitfalls: [
      'Leggere le semplificazioni di $[\\mathbb A]$ in un riferimento qualunque: valgono in quello solidale alle direzioni di simmetria.',
      'Dimenticare il fattore 2 negli scorrimenti di Voigt ($\\gamma_{ij}=2E_{ij}$).',
      'Dire che per gli anisotropi il gruppo di simmetria è vuoto: contiene sempre $\\tens I$ e $-\\tens I$ (Attenzione, p. 84).',
    ],
    visual: { kind: 'svg', id: 'voigt', params: { classe: 'ortotropo' } },
    recall: [
      { id: 'c4.6-q1', kind: 'scelta', q: 'Quante costanti ha un materiale ortotropo iperelastico?', options: ['9', '12', '5', '21'], correct: 0, why: 'Tabella di p. 84: 12 se elastico, 9 se iperelastico ($C_{12}=C_{21}$, …).', source: D(4, '4.10.2', undefined, 84) },
      { id: 'c4.6-q2', kind: 'vf', q: 'Per un isotropo la matrice di Voigt ha i blocchi NE e SW nulli in qualunque riferimento.', answer: true, why: '§4.11.1, 3): la risposta non dipende dalla direzione; basta un riferimento qualsiasi.', source: D(4, '4.11.1', undefined, 86) },
      { id: 'c4.6-q3', kind: 'aperta', q: 'Scrivi la condizione perché $\\tens Q$ sia una trasformazione di simmetria materiale e spiegala.', answer: '$\\mathbb A[\\tens Q\\tens E\\tens Q^T]=\\tens Q(\\mathbb A\\tens E)\\tens Q^T$ per ogni $\\tens E$: se si ruota la deformazione, la tensione che ne risulta è la tensione di prima ruotata allo stesso modo, cioè la risposta si riproduce uguale nella direzione ruotata (Def 4.10.1).', source: D(4, '4.10.2', 'Def 4.10.1', 83) },
    ],
  },
];
