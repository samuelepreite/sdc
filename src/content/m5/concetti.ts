/**
 * Modulo 5 — Elasticità isotropa e problema elastico (Cap. 4, §4.12–4.17, pp. 86–98). Fonte: tools/testi/cap-04.md.
 */
import { D } from '../../engine/types';
import type { Concept } from '../types';

export const M5_CONCETTI: Concept[] = [
  {
    id: 'c5.1',
    module: 'm5',
    title: 'Lamé, isotropia e iperelasticità, legame inverso, coassialità',
    prereq: ['c4.6', 'c3.6'],
    source: D(4, '4.12', 'Teo 4.12.1–4.12.2, Prop 4.12.3, Teo 4.12.4', '86–88'),
    meaning: 'Per un materiale elastico lineare **isotropo** il legame dipende da due sole costanti, $\\mu$ e $\\lambda$: $\\tens T=2\\mu\\tens E+\\lambda(\\operatorname{tr}\\tens E)\\tens I$. Un tale materiale è sempre iperelastico, il legame si inverte, e le direzioni principali di tensione e di deformazione **coincidono**.',
    formulas: [
      { tex: '\\tens T=2\\mu\\tens E+\\lambda(\\operatorname{tr}\\tens E)\\tens I', label: 'teorema di Lamé', rif: 'Teo 4.12.1' },
      { tex: '\\tens E=\\dfrac1{2\\mu}\\tens T-\\dfrac{\\lambda}{2\\mu(2\\mu+3\\lambda)}(\\operatorname{tr}\\tens T)\\tens I', label: 'legame inverso', rif: 'Prop 4.12.3' },
      { tex: '\\Theta=\\dfrac{\\sigma_m}K,\\qquad K=\\dfrac{2\\mu+3\\lambda}3', label: 'modulo di comprimibilità', rif: '§4.12.2' },
      { tex: '\\tens E\\hat m=e\\hat m\\ \\Rightarrow\\ \\tens T\\hat m=(2\\mu e+\\lambda\\operatorname{tr}\\tens E)\\hat m', label: 'coassialità', rif: 'Teo 4.12.4' },
    ],
    explanation: `**Isotropo** vuol dire che ogni trasformazione ortogonale è di simmetria: $\\mathbb A[\\tens Q\\tens E\\tens Q^T]=\\tens Q(\\mathbb A\\tens E)\\tens Q^T$ per ogni $\\tens Q\\in\\mathrm{Orth}$.

**Teorema di Lamé** (Teo 4.12.1, enunciato senza dimostrazione): esistono $\\mu$, $\\lambda$ con $\\tens T=2\\mu\\tens E+\\lambda(\\operatorname{tr}\\tens E)\\tens I$. In componenti $T_{ij}=2\\mu E_{ij}+\\lambda(E_{11}+E_{22}+E_{33})\\delta_{ij}$: le tensioni normali dipendono da tutte le dilatazioni, le tangenziali solo dallo scorrimento omonimo.

**Isotropo ⇒ iperelastico** (Teo 4.12.2): per la commutatività del prodotto scalare e $\\tens I\\cdot\\tens E=\\operatorname{tr}\\tens E$, $\\mathbb A\\tens E_1\\cdot\\tens E_2=\\mathbb A\\tens E_2\\cdot\\tens E_1$: il tensore elastico è sempre simmetrico.

**Legame inverso** (Prop 4.12.3): si applica la traccia a Lamé, $\\operatorname{tr}\\tens T=(2\\mu+3\\lambda)\\operatorname{tr}\\tens E$, e si sostituisce. Con $\\operatorname{tr}\\tens T=3\\sigma_m$ (tre volte la tensione normale media): $\\Theta=\\sigma_m/K$, governato dal **modulo di comprimibilità volumetrica** $K$.

**Coassialità** (Teo 4.12.4): se $\\hat m$ è principale per $\\tens E$, applicando Lamé lo è anche per $\\tens T$. In generale (anisotropi) non vale, e i programmi di calcolo che la danno per scontata sbagliano. Una sferetta isotropa in compressione idrostatica diventa una sfera più piccola; una anisotropa un ellissoide.`,
    pitfalls: [
      'Pensare che la coassialità valga sempre: è una proprietà degli isotropi.',
      'Dimenticare che per gli isotropi elastico e iperelastico coincidono.',
      '$\\lambda$ non ha un’interpretazione fisica diretta: per questo si usano i moduli tecnici.',
    ],
    visual: { kind: 'svg', id: 'isotropia', params: { tab: 'provino' } },
    recall: [
      { id: 'c5.1-q1', kind: 'scelta', q: 'Da quante costanti dipende il legame elastico lineare isotropo?', options: ['2', '5', '9', '21'], correct: 0, why: 'Teo 4.12.1: $\\mu$ e $\\lambda$, le costanti di Lamé.', source: D(4, '4.12', 'Teo 4.12.1', 86) },
      { id: 'c5.1-q2', kind: 'vf', q: 'Per un materiale anisotropo le direzioni principali di tensione e di deformazione coincidono sempre.', answer: false, why: 'Teo 4.12.4 vale per gli isotropi; in generale la coassialità non è garantita (§4.12.3).', source: D(4, '4.12.3', 'Teo 4.12.4', 88) },
      { id: 'c5.1-q3', kind: 'aperta', q: 'Ricava $\\operatorname{tr}\\tens E$ in funzione di $\\operatorname{tr}\\tens T$ per un isotropo.', answer: 'Applicando la traccia al legame di Lamé, con $\\operatorname{tr}\\tens I=3$: $\\operatorname{tr}\\tens T=2\\mu\\operatorname{tr}\\tens E+3\\lambda\\operatorname{tr}\\tens E$, quindi $\\operatorname{tr}\\tens E=\\operatorname{tr}\\tens T/(2\\mu+3\\lambda)$; con $\\operatorname{tr}\\tens T=3\\sigma_m$ si ha $\\Theta=\\sigma_m/K$ (§4.12.2).', source: D(4, '4.12.2', 'Prop 4.12.3', 87) },
    ],
  },
  {
    id: 'c5.2',
    module: 'm5',
    title: 'Moduli tecnici',
    prereq: ['c5.1'],
    source: D(4, '4.13', undefined, '88–90'),
    meaning: 'I **moduli tecnici** si leggono direttamente dagli esperimenti: il modulo di Young $E$ e il coefficiente di Poisson $\\nu$ dalla prova monoassiale, il modulo di elasticità tangenziale $G$ dallo scorrimento semplice. Per un isotropo solo due sono indipendenti: $E=2G(1+\\nu)$.',
    formulas: [
      { tex: 'E=\\dfrac{\\mu(2\\mu+3\\lambda)}{\\mu+\\lambda},\\qquad\\nu=\\dfrac{\\lambda}{2(\\mu+\\lambda)},\\qquad G=\\mu', label: 'moduli tecnici', rif: '§4.13' },
      { tex: 'E=2G(1+\\nu)', label: 'relazione tra i moduli', rif: '§4.13.3' },
      { tex: '\\tens E=\\dfrac1E\\big[(1+\\nu)\\tens T-\\nu(\\operatorname{tr}\\tens T)\\tens I\\big]', label: 'legame inverso', rif: '§4.13.4' },
      { tex: '\\tens T=\\dfrac E{1+\\nu}\\Big[\\tens E+\\dfrac{\\nu}{1-2\\nu}(\\operatorname{tr}\\tens E)\\tens I\\Big]', label: 'legame diretto', rif: '§4.13.4' },
    ],
    explanation: `**Stato monoassiale** (§4.13.1). Provino in trazione, solo $s=F/A_0$ lungo $\\hat e_1$. Dal legame inverso $[\\tens E]=\\operatorname{diag}\\big(\\frac sE,-\\nu\\frac sE,-\\nu\\frac sE\\big)$ con $E$ e $\\nu$ definiti dalle formule sopra.
- $E$, **modulo di Young**: $\\varepsilon_1=s/E$, cioè $s=E\\varepsilon_1$ (legge di Hooke); si misura in Pa (MPa, GPa).
- $\\nu$, **coefficiente di Poisson**: $\\nu=-\\varepsilon_2/\\varepsilon_1$; il segno meno dice che in trazione il materiale si contrae lateralmente. È adimensionale.

**Scorrimento semplice** (§4.13.2), per esempio con un tubo sottile in torsione: $\\tens E=\\frac1{2\\mu}\\tens T$, e con $E_{12}=\\gamma_{12}/2$: $\\tau=G\\gamma_{12}$, con $G=\\mu$ **modulo di elasticità tangenziale**.

**Relazione** (§4.13.3): $E=2G+2G\\nu=2G(1+\\nu)$. Conviene misurare $E$ e $\\nu$ con una prova monoassiale e ricavare $G$: la prova di torsione non è facile.

**Legame con i moduli tecnici** (§4.13.4): le dilatazioni dipendono da tutte le tensioni normali (accoppiamento), gli scorrimenti solo dalla tangenziale omonima: $E_{ii}=\\frac1E[T_{ii}-\\nu(T_{jj}+T_{kk})]$, $E_{ij}=\\frac1{2G}T_{ij}$.`,
    pitfalls: [
      'Segno di $\\nu$: $\\nu=-\\varepsilon_2/\\varepsilon_1$; con $\\nu>0$ in trazione ci si contrae lateralmente.',
      '$E_{ij}=T_{ij}/(2G)$, cioè $\\gamma_{ij}=\\tau_{ij}/G$: occhio al fattore 2.',
      'I moduli tecnici sono tre ma solo due indipendenti (per gli isotropi).',
    ],
    visual: { kind: 'svg', id: 'isotropia', params: { tab: 'provino' } },
    recall: [
      { id: 'c5.2-q1', kind: 'scelta', q: 'Quale relazione lega i moduli tecnici di un isotropo?', options: ['$E=2G(1+\\nu)$', '$G=2E(1+\\nu)$', '$E=G(1-2\\nu)$', '$\\nu=E/(2G)$'], correct: 0, why: '§4.13.3.', source: D(4, '4.13.3', undefined, 90) },
      { id: 'c5.2-q2', kind: 'vf', q: 'Il coefficiente di Poisson si definisce come $\\nu=-\\varepsilon_2/\\varepsilon_1$ in uno stato monoassiale lungo 1.', answer: true, why: '§4.13.1.', source: D(4, '4.13.1', undefined, 89) },
      { id: 'c5.2-q3', kind: 'aperta', q: 'Perché si ricava $G$ da $E$ e $\\nu$ invece di misurarlo?', answer: 'Perché ricavare $G$ da una prova di torsione (scorrimento semplice) non è facile, mentre $E$ e $\\nu$ si ottengono da una prova monoassiale; poi $G=E/(2(1+\\nu))$ (§4.13.3).', source: D(4, '4.13.3', undefined, 90) },
    ],
  },
  {
    id: 'c5.3',
    module: 'm5',
    title: 'Energia per isotropi e restrizioni di plausibilità',
    prereq: ['c5.2', 'c4.5'],
    source: D(4, '4.14–4.15', 'Prop 4.14.1', '91–94'),
    meaning: 'Per un isotropo l’energia specifica si scrive in funzione di $\\tens E$ o di $\\tens T$, anche con le sole quantità principali. Chiedere $\\mathbb A\\in\\mathrm{Pos}^+$ (per deformare si spende energia) equivale a $\\mu>0$, $2\\mu+3\\lambda>0$, cioè $E>0$, $G>0$, $-1<\\nu<\\frac12$.',
    formulas: [
      { tex: '\\varphi(\\tens E)=\\mu\\tens E\\cdot\\tens E+\\tfrac\\lambda2(\\operatorname{tr}\\tens E)^2', label: 'energia in funzione di E', rif: 'Prop 4.14.1' },
      { tex: '\\varphi(\\tens T)=\\dfrac1{2E}(s_1^2+s_2^2+s_3^2)-\\dfrac\\nu E(s_1s_2+s_2s_3+s_3s_1)', label: 'energia con le tensioni principali', rif: 'Prop 4.14.1' },
      { tex: '\\mathbb A\\in\\mathrm{Pos}^+\\iff\\mu>0,\\ 2\\mu+3\\lambda>0\\iff E>0,\\ G>0,\\ -1<\\nu<\\tfrac12', label: 'plausibilità fisica', rif: '§4.15' },
    ],
    explanation: `**Espressioni di $\\varphi$** (§4.14): da $\\varphi=\\frac12\\mathbb A\\tens E\\cdot\\tens E=\\frac12\\mathbb A^{-1}\\tens T\\cdot\\tens T$. Per la coassialità, nel riferimento principale comune $[\\tens E]$ e $[\\tens T]$ sono diagonali e $\\varphi$ dipende solo da $e_i$ o da $s_i$.

**Plausibilità** (§4.15). In una dimensione $\\sigma=E\\varepsilon$ ha senso fisico solo con $E>0$: con $E<0$ a una trazione corrisponderebbe una contrazione. In tre dimensioni la condizione è $\\mathbb A\\in\\mathrm{Pos}^+$, che (per gli iperelastici) vuol dire $\\varphi>0$: per deformare bisogna spendere lavoro.

**Con i moduli di Lamé** (§4.15.2): $\\varphi(\\tens E)$ è una forma quadratica completa in $e_1,e_2,e_3$; il criterio di **Sylvester** sui minori principali della sua matrice dà $\\mu+\\lambda/2>0$, $\\mu(\\mu+\\lambda)>0$, $\\mu^2(\\mu+\\frac32\\lambda)>0$, che si riducono a $\\mu>0$ e $2\\mu+3\\lambda>0$.

**Con i moduli tecnici** (§4.15.3): $G=\\mu>0$; $E>0$ perché $\\mu+\\lambda>\\mu/3>0$; da $G=E/(2(1+\\nu))$, $\\nu>-1$; da $\\operatorname{tr}\\tens E=\\frac{1-2\\nu}E\\operatorname{tr}\\tens T$ con lo stesso segno, $\\nu<\\frac12$.

**Discussione** (§4.15.4): $E$ e $G$ non possono essere nulli (deformazioni infinite). $\\nu<0$ non si vede nei materiali naturali ma sì nei **metamateriali auxetici** (guarnizioni, filtri, isolamento acustico). Nei materiali da costruzione i limiti pratici sono $0<\\nu\\le\\frac12$. Con $\\nu\\to\\frac12$ il materiale è **incomprimibile** ($\\Theta=0$): gomme, biotessuti; è un caso limite ($\\lambda\\to+\\infty$), escluso dalla condizione stretta.`,
    pitfalls: [
      '$\\nu=\\frac12$ è un limite (incomprimibile), escluso dalla condizione stretta $\\mathbb A\\in\\mathrm{Pos}^+$ con moduli finiti.',
      'Dimenticare che $\\nu<0$ è ammesso dalla teoria (auxetici), escluso solo nella pratica dei materiali naturali.',
      'Il criterio di Sylvester si applica alla matrice dei coefficienti della forma quadratica, con i doppi prodotti divisi per 2.',
    ],
    visual: { kind: 'svg', id: 'isotropia', params: { tab: 'nu' } },
    recall: [
      { id: 'c5.3-q1', kind: 'scelta', q: 'Qual è il campo teorico di ν per $\\mathbb A\\in\\mathrm{Pos}^+$?', options: ['$-1<\\nu<\\frac12$', '$0<\\nu<\\frac12$', '$0\\le\\nu\\le1$', '$-\\frac12<\\nu<1$'], correct: 0, why: '§4.15.3.', source: D(4, '4.15.3', undefined, 93) },
      { id: 'c5.3-q2', kind: 'vf', q: 'Con ν = ½ il materiale è incomprimibile: Θ = 0 per ogni stato di tensione.', answer: true, why: '§4.15.4: $\\Theta=\\frac{1-2\\nu}E3\\sigma_m=0$.', source: D(4, '4.15.4', undefined, 93) },
      { id: 'c5.3-q3', kind: 'aperta', q: 'Che cosa significa fisicamente $\\mathbb A\\in\\mathrm{Pos}^+$ per un materiale iperelastico?', answer: 'Che $\\varphi(\\tens E)>0$ per ogni deformazione non nulla: per passare dalla configurazione naturale a una deformata bisogna spendere lavoro (§4.15.1). Inoltre $\\mathbb A$ è invertibile.', source: D(4, '4.15.1', undefined, 92) },
    ],
  },
  {
    id: 'c5.4',
    module: 'm5',
    title: 'Problema elastico: posizione e buona posizione',
    prereq: ['c5.1', 'c3.4', 'c2.7'],
    source: D(4, '4.16.1–4.16.3', 'Def 4.16.1', '94–96'),
    meaning: 'Il **problema elastico** mette insieme cinematica, statica e materiale: dati geometria, carichi, vincoli e tensore elastico, si cerca lo **stato elastico** $\\{\\vet u,\\tens E,\\tens T\\}$ che soddisfa congruenza, legame, equilibrio e le condizioni al contorno. Ha tante equazioni quante incognite, ma questo non basta: deve essere **ben posto** (esistenza, unicità, stabilità).',
    formulas: [
      { tex: '\\tens E=\\tfrac12(\\nabla\\vet u+\\nabla\\vet u^T),\\quad\\tens T=\\mathbb A\\tens E,\\quad\\operatorname{div}\\tens T+\\vet b=\\vet 0,\\quad\\tens T=\\tens T^T', label: 'equazioni di campo', rif: '§4.16.1' },
      { tex: '\\tens T\\hat n=\\hat{\\vet s}\\ \\text{su }\\partial\\mathcal B_\\ell,\\qquad\\vet u=\\hat{\\vet u}\\ \\text{su }\\partial\\mathcal B_v', label: 'condizioni al contorno', rif: '§4.16.1' },
      { tex: '18\\ \\text{incognite}\\ (3+6+9)=18\\ \\text{equazioni}\\ (6+9+3)', label: 'conteggio', rif: '§4.16.3' },
    ],
    explanation: `**Dati** (§4.16.1): la geometria ($\\mathcal B$, con la frontiera divisa in $\\partial\\mathcal B_v$ vincolata e $\\partial\\mathcal B_\\ell$ libera, disgiunte); i carichi ($\\vet b$ nel corpo, $\\hat{\\vet s}$ su $\\partial\\mathcal B_\\ell$); i vincoli ($\\vet u=\\hat{\\vet u}$ su $\\partial\\mathcal B_v$: il vincolo è una condizione sugli spostamenti); il materiale ($\\mathbb A(x)$).

**Incognita:** lo stato elastico $\\{\\vet u(x),\\tens E(x),\\tens T(x)\\}$.

**Tipi:** negli spostamenti ($\\partial\\mathcal B_v\\equiv\\partial\\mathcal B$, trave a doppio incastro con cedimento), nelle forze ($\\partial\\mathcal B_\\ell\\equiv\\partial\\mathcal B$, aereo in volo), misto.

**Analogia con la trave** (§4.16.2): mensola incastrata in A e caricata in B; corpo $[0,L]$, frontiera vincolata A ($w=0$), libera B ($N(L)=F$). Equazioni $\\varepsilon=w'$, $N=EA\\varepsilon$, $N'=-p$: combinandole si ha la linea elastica. Nella trave grandezze scalari ed equazioni ordinarie; nel solido vettori e tensori ed equazioni alle derivate parziali.

**Conteggio** (§4.16.3): incognite $\\vet u$ (3) + $\\tens E$ (6) + $\\tens T$ (9) = 18; equazioni congruenza (6) + legame (9) + equilibrio alla traslazione (3) = 18 (15 e 15 se si impone a parte la simmetria).

**Buona posizione** (Def 4.16.1, Hadamard): la soluzione esiste, è unica, è stabile (variando poco i dati varia poco). Esempio di instabilità: l'arco ribassato che scatta (snap-through); il buckling precede il collasso. Il **teorema di Kirchhoff** (Cap. 5) garantisce l'unicità se $\\mathbb A\\in\\mathrm{Pos}^+$.`,
    pitfalls: [
      'Pensare che equazioni = incognite garantisca la soluzione: serve la buona posizione.',
      'Le equazioni indefinite valgono nell’interno; sulla frontiera libera c’è $\\tens T\\hat n=\\hat{\\vet s}$, su quella vincolata $\\vet u=\\hat{\\vet u}$.',
      'Nel problema nelle forze lo spostamento è determinato a meno di un moto rigido.',
    ],
    visual: { kind: 'svg', id: 'problema' },
    recall: [
      { id: 'c5.4-q1', kind: 'scelta', q: 'Quali sono le tre richieste di Hadamard per un problema ben posto?', options: ['Esistenza, unicità, stabilità', 'Linearità, simmetria, positività', 'Congruenza, equilibrio, legame', 'Esistenza, linearità, isotropia'], correct: 0, why: 'Def 4.16.1.', source: D(4, '4.16.3', 'Def 4.16.1', 96) },
      { id: 'c5.4-q2', kind: 'vf', q: 'Un aereo in volo, soggetto solo a carichi, è un problema elastico nelle forze.', answer: true, why: '§4.16.1: $\\partial\\mathcal B_\\ell\\equiv\\partial\\mathcal B$, nessuna frontiera vincolata.', source: D(4, '4.16.1', undefined, 95) },
      { id: 'c5.4-q3', kind: 'aperta', q: 'Conta equazioni e incognite del problema elastico.', answer: 'Incognite: $\\vet u$ (3), $\\tens E$ (6), $\\tens T$ (9) = 18. Equazioni: congruenza (6), legame (9), equilibrio alla traslazione (3) = 18. Imponendo a parte la simmetria di $\\tens T$: 15 e 15 (§4.16.3).', source: D(4, '4.16.3', undefined, 95) },
    ],
  },
  {
    id: 'c5.5',
    module: 'm5',
    title: 'Sovrapposizione degli stati elastici e non linearità dell’energia',
    prereq: ['c5.4', 'c5.3'],
    source: D(4, '4.16.4–4.16.5', 'Teo 4.16.2–4.16.3', '96–97'),
    meaning: 'Il problema elastico lineare permette di **sovrapporre**: a una combinazione lineare di dati corrisponde la stessa combinazione delle soluzioni. L’energia però **non** si sovrappone: l’energia dello stato somma contiene un termine di accoppiamento.',
    formulas: [
      { tex: '\\{\\alpha\\vet b_1+\\beta\\vet b_2,\\ \\alpha\\hat{\\vet s}_1+\\beta\\hat{\\vet s}_2,\\ \\alpha\\hat{\\vet u}_1+\\beta\\hat{\\vet u}_2\\}\\ \\mapsto\\ \\{\\alpha\\vet u_1+\\beta\\vet u_2,\\ \\alpha\\tens E_1+\\beta\\tens E_2,\\ \\alpha\\tens T_1+\\beta\\tens T_2\\}', label: 'sovrapposizione', rif: 'Teo 4.16.2' },
      { tex: '\\varphi(\\tens E_1+\\tens E_2)=\\varphi(\\tens E_1)+\\varphi(\\tens E_2)+\\mathbb A\\tens E_1\\cdot\\tens E_2', label: 'non linearità dell’energia', rif: 'Teo 4.16.3' },
    ],
    explanation: `**Sovrapposizione** (Teo 4.16.2): per la linearità di tutte le equazioni (congruenza, legame, equilibrio, contorno), la combinazione lineare delle soluzioni risolve il problema con la combinazione lineare dei dati.
- $\\alpha\\ne0$, $\\beta=0$: raddoppiando la forza raddoppia la freccia — solo perché il problema è lineare;
- $\\alpha=\\beta=1$: un telaio con due carichi si studia sommando i due casi separati.

Non vale in generale: con un problema non lineare (per esempio con attrito) cambiando l'ordine dei carichi cambia la soluzione, e bisogna conoscere lo scenario di carico.

**Non linearità dell'energia** (Teo 4.16.3): con $\\mathbb A=\\mathbb A^T$ si sviluppa $\\frac12\\mathbb A(\\tens E_1+\\tens E_2)\\cdot(\\tens E_1+\\tens E_2)$: i due termini misti sono uguali e danno il **termine di accoppiamento** $\\mathbb A\\tens E_1\\cdot\\tens E_2$. Lo stesso per l'energia del corpo: $\\Phi(\\tens E_1+\\tens E_2)\\ne\\Phi(\\tens E_1)+\\Phi(\\tens E_2)$ (Cap. 5).`,
    pitfalls: [
      'Sommare le energie di due casi di carico: manca il termine di accoppiamento.',
      'Applicare la sovrapposizione a problemi non lineari (attrito, grandi spostamenti).',
    ],
    visual: { kind: 'svg', id: 'cammino' },
    recall: [
      { id: 'c5.5-q1', kind: 'vf', q: 'In un problema elastico lineare l’energia dello stato somma è la somma delle energie.', answer: false, why: 'Teo 4.16.3: c’è il termine di accoppiamento $\\mathbb A\\tens E_1\\cdot\\tens E_2$.', source: D(4, '4.16.5', 'Teo 4.16.3', 97) },
      { id: 'c5.5-q2', kind: 'scelta', q: 'Perché vale il teorema di sovrapposizione degli stati elastici?', options: ['Perché tutte le equazioni del problema sono lineari', 'Perché il materiale è isotropo', 'Perché l’energia è quadratica', 'Perché il corpo è vincolato'], correct: 0, why: 'Teo 4.16.2: la dimostrazione è immediata dalla linearità.', source: D(4, '4.16.4', 'Teo 4.16.2', 96) },
      { id: 'c5.5-q3', kind: 'aperta', q: 'Ricava il termine di accoppiamento.', answer: '$\\varphi(\\tens E_1+\\tens E_2)=\\frac12\\mathbb A(\\tens E_1+\\tens E_2)\\cdot(\\tens E_1+\\tens E_2)=\\frac12(\\mathbb A\\tens E_1\\cdot\\tens E_1+\\mathbb A\\tens E_1\\cdot\\tens E_2+\\mathbb A\\tens E_2\\cdot\\tens E_1+\\mathbb A\\tens E_2\\cdot\\tens E_2)$; con $\\mathbb A=\\mathbb A^T$ i termini misti sono uguali: resta $\\varphi_1+\\varphi_2+\\mathbb A\\tens E_1\\cdot\\tens E_2$ (Teo 4.16.3).', source: D(4, '4.16.5', 'Teo 4.16.3', 97) },
    ],
  },
];
