/**
 * Modulo 2 — Analisi della deformazione (Cap. 2, pp. 15–35). Fonte: tools/testi/cap-02.md.
 * Figure del capitolo controllate sul PDF (pp. 16, 18, 27, 29). NF-02 (p. 32) e NF-04 (p. 28) in NOTE_FONTI.md.
 */
import { D } from '../../engine/types';
import type { Concept } from '../types';

export const M2_CONCETTI: Concept[] = [
  {
    id: 'c2.1',
    module: 'm2',
    title: 'Corpo, configurazioni, deformazione e spostamento',
    prereq: ['c1.1'],
    source: D(2, '2.1', 'Def 2.1.1–2.1.2', '15–16'),
    meaning: 'L’analisi della deformazione è uno studio **puramente geometrico**: descrive come cambia la forma del corpo, senza chiedersi perché. La **deformazione** $f$ porta ogni punto $X$ della configurazione di riferimento nel punto $x$ di quella attuale; lo **spostamento** è $\\vet u=x-X$.',
    formulas: [
      { tex: 'f:\\mathcal B\\to\\mathcal E,\\qquad x=f(X)', label: 'deformazione', rif: 'Def 2.1.2' },
      { tex: '\\vet u(X)=x-X=f(X)-X', label: 'spostamento', rif: 'Def 2.1.2' },
      { tex: 'u_i(X_1,X_2,X_3)=f_i(X_1,X_2,X_3)-X_i', label: 'in componenti', rif: '§2.1.3' },
    ],
    explanation: `A un oggetto fisico (la scocca di un'auto) si associa il **corpo materiale** $\\mathcal B$: una regione regolare e limitata dello spazio euclideo, con frontiera $\\partial\\mathcal B$ fatta di superfici almeno $C^1$ (Def 2.1.1). I suoi punti sono i **punti materiali**.

Il punto materiale ha massa, ma nel corso non serve: lo studio fa astrazione dal tempo. È il limite, per accelerazioni che tendono a zero, di un fenomeno reale molto lento, in cui le forze d'inerzia sono trascurabili.

Tra le infinite configurazioni possibili se ne sceglie una di **riferimento** $\\mathcal B$ (punto $X$); la generica altra è la configurazione **attuale** $f(\\mathcal B)$ (punto $x$).

Punto di vista **lagrangiano**: si segue il singolo punto $X$ (quello adottato). Punto di vista **euleriano**: si parte dalla configurazione attuale e si risale all'origine del punto $x$ (serve, per esempio, per la spinta del vento su una vela, che dipende dalla forma deformata). Le differenze contano solo per grandi spostamenti e deformazioni.`,
    pitfalls: [
      'Confondere deformazione e spostamento: $f$ è la mappa che trasforma il corpo, $\\vet u$ è il vettore che porta il singolo punto; sono entrambi campi vettoriali.',
      'Dire che l’analisi della deformazione studia le cause: è puramente cinematica.',
      'Credere che lagrangiano ed euleriano diano risultati diversi anche per piccoli spostamenti: le differenze si apprezzano per grandi spostamenti e deformazioni.',
    ],
    recall: [
      { id: 'c2.1-q1', kind: 'scelta', q: 'Nel punto di vista lagrangiano…', options: ['si segue il punto $X$ nelle posizioni $x$ che occupa', 'si parte da $x$ e si risale alla sua provenienza', 'si studiano le cause della deformazione', 'si trascura la configurazione di riferimento'], correct: 0, why: '§2.1.2: lagrangiano = si segue il singolo punto $X$; è il punto di vista adottato nel corso.', source: D(2, '2.1.2', undefined, 16) },
      { id: 'c2.1-q2', kind: 'vf', q: 'Lo spostamento è $\\vet u(X)=f(X)-X$.', answer: true, why: 'Def 2.1.2: $\\vet u(X)=x-X=f(X)-X$.', source: D(2, '2.1.3', 'Def 2.1.2', 16) },
      { id: 'c2.1-q3', kind: 'aperta', q: 'Perché nel corso la massa dei punti materiali non conta?', answer: 'Perché lo studio è statico: fa astrazione dal tempo. È il limite di un fenomeno molto lento, con accelerazioni che tendono a zero e quindi forze d’inerzia trascurabili (§2.1.1).', source: D(2, '2.1.1', undefined, 15) },
    ],
  },
  {
    id: 'c2.2',
    module: 'm2',
    title: 'Plausibilità fisica, F e H, deformazioni rigide',
    prereq: ['c2.1', 'c1.4', 'c1.7'],
    source: D(2, '2.2–2.3', 'Def 2.2.1–2.2.4, 2.3.1, Teo 2.3.2, Def 2.3.3, Teo 2.3.4', '17–19'),
    meaning: 'Non ogni funzione $f$ descrive un corpo reale: si chiede che sia **biettiva**, **bicontinua e regolare** e che **conservi l’orientazione** ($\\det\\tens F>0$). Il gradiente di deformazione $\\tens F$ e quello di spostamento $\\tens H$ sono legati dall’**identità cinematica fondamentale** $\\tens F=\\tens I+\\tens H$.',
    formulas: [
      { tex: '\\tens F:=\\nabla f,\\qquad F_{ij}=\\dfrac{\\partial f_i}{\\partial X_j}', label: 'gradiente di deformazione', rif: 'Def 2.2.3' },
      { tex: '\\det\\tens F(X)>0\\quad\\forall X\\in\\mathcal B', label: 'conservazione dell’orientazione', rif: 'Def 2.2.4' },
      { tex: '\\tens F=\\tens I+\\tens H,\\qquad \\tens H:=\\nabla\\vet u', label: 'identità cinematica fondamentale', rif: 'Teo 2.3.2' },
      { tex: 'f(X)=f(X_0)+\\tens Q(X-X_0),\\quad\\tens Q\\in\\mathrm{Orth}', label: 'deformazione rigida', rif: 'Teo 2.3.4' },
    ],
    explanation: `**Biettività** (Def 2.2.1): esclude la compenetrazione della materia e l'autocontatto (due punti distinti con la stessa immagine) e la frattura (un punto che «si sdoppia»).

**Bicontinuità e regolarità** (Def 2.2.2): $f$ e $f^{-1}$ continue, $f$ con derivata prima continua. Punti vicini restano vicini; le fibre diventano curve senza spigoli. Gradienti discontinui (compositi fibrorinforzati, delaminazione) richiedono teorie più complesse.

**Orientazione** (Def 2.2.4): con $\\det\\tens F>0$ la terna $\\tens F\\hat e_1,\\tens F\\hat e_2,\\tens F\\hat e_3$ resta destrorsa, anche se non più ortogonale. Poiché $\\det\\tens F=dv/dV$ (§2.5.5), si escludono l'**implosione** ($\\det\\tens F=0$) e l'**esplosione** ($\\det\\tens F\\to+\\infty$). Nella configurazione di riferimento $\\det\\tens F=1$: chiedere $\\det\\tens F>0$ vuol dire che non può mai attraversare lo zero.

**Tipi speciali** (§2.3.1): omogenee ($\\tens F$ costante), traslazioni ($\\vet u$ costante), rotazioni ($\\tens F=\\tens R\\in\\mathrm{Rot}$). Le **rigide** conservano le distanze; per il Teo 2.3.4 (enunciato senza dimostrazione) sono rototraslazioni con $\\tens Q$ ortogonale. Le riflessioni ($\\det\\tens Q=-1$) sono rigide ma escluse da $\\det\\tens F>0$.`,
    pitfalls: [
      'Dire che $\\det\\tens F>0$ esclude solo l’implosione: esclude anche le riflessioni, e con esse l’inversione dell’orientazione.',
      'Confondere $\\tens F$ con $\\tens H$: differiscono per l’identità; nell’assenza di deformazione $\\tens F=\\tens I$ e $\\tens H=\\tens O$.',
      'Credere che una deformazione rigida sia sempre una rotazione: comprende traslazioni e (matematicamente) riflessioni.',
    ],
    visual: { kind: 'deforma3d', scene: { mode: 'intorno', presets: ['allungamento', 'taglio', 'rotazione', 'generico'], controls: ['preset', 'amp'] } },
    recall: [
      { id: 'c2.2-q1', kind: 'scelta', q: 'Quale fenomeno esclude la richiesta $\\det\\tens F>0$?', options: ['L’implosione (volume finito che si annulla) e l’inversione dell’orientazione', 'La frattura', 'La compenetrazione di due punti distinti', 'Le traslazioni rigide'], correct: 0, why: 'Def 2.2.4: $\\det\\tens F=dv/dV$; $\\det\\tens F>0$ esclude $dv=0$ e terne trasformate sinistrorse. Compenetrazione e frattura sono escluse dalla biettività e dalla continuità.', source: D(2, '2.2', 'Def 2.2.4', 18) },
      { id: 'c2.2-q2', kind: 'vf', q: 'Il gradiente della mappa $X\\mapsto X$ è il tensore identità, quindi $\\tens H=\\tens F-\\tens I$.', answer: true, why: 'Teo 2.3.2: da $\\vet u=f(X)-X$, estraendo il gradiente, $\\tens H=\\tens F-\\tens I$.', source: D(2, '2.3', 'Teo 2.3.2', '18–19') },
      { id: 'c2.2-q3', kind: 'vf', q: 'Una riflessione è una deformazione rigida fisicamente ammissibile.', answer: false, why: 'È rigida (Teo 2.3.4 con $\\det\\tens Q=-1$) ma viola $\\det\\tens F>0$ (§2.3.2).', source: D(2, '2.3.2', 'Teo 2.3.4', 19) },
      { id: 'c2.2-q4', kind: 'aperta', q: 'Che cosa esclude la biettività di $f$?', answer: 'La compenetrazione della materia e l’autocontatto (due punti distinti con la stessa immagine: iniettività violata) e la frattura (un punto che genera due punti distinti) (Def 2.2.1).', source: D(2, '2.2', 'Def 2.2.1', 17) },
    ],
  },
  {
    id: 'c2.3',
    module: 'm2',
    title: 'Studio locale: deformazione omogenea tangente',
    prereq: ['c2.2'],
    source: D(2, '2.4', 'eq. (2.1)', 20),
    meaning: 'Vicino a un punto la deformazione si approssima con la sua parte lineare: ogni fibra $d\\vet X$ dell’intorno diventa $d\\vet x=\\tens F\\,d\\vet X$, con $\\tens F$ calcolato nel centro. Uno studio di funzioni non lineari diventa un’operazione algebrica.',
    formulas: [
      { tex: 'f(Y)=f(X)+\\tens F(X)(Y-X)+o(|Y-X|)', label: 'sviluppo di Taylor', rif: '§2.4' },
      { tex: 'd\\vet x=\\tens F\\,d\\vet X,\\qquad\\tens F=\\tens F(X)', label: 'deformazione omogenea tangente', rif: 'eq. (2.1)' },
    ],
    explanation: `Nel caso scalare si approssima la curva $x=f(X)$ con la tangente: $dx\\simeq f'(X_0)\\,dX$. Nel caso vettoriale il ruolo della derivata lo svolge il gradiente.

Si prende la fibra per $X$ in direzione $\\hat n$ e un suo punto $Y$ nell'intorno: $d\\vet X=Y-X$, $dL=|Y-X|$. Dopo la deformazione $d\\vet x=y-x$, di lunghezza $dl$ e direzione $\\hat\\nu$. Taylor con origine in $X$, trascurando una volta per tutte $o(|Y-X|)$, dà l'eq. (2.1).

Si chiama **omogenea** perché $\\tens F$, calcolato nel centro, resta lo stesso per tutti i punti dell'intorno; **tangente** per analogia con la retta tangente.

Serve la regolarità di $f$: senza bicontinuità non si potrebbe nemmeno dire che $f(Y)$ stia nell'intorno di $f(X)$.`,
    pitfalls: [
      'Pensare che $\\tens F$ vari da punto a punto dell’intorno: nello studio locale è fisso, calcolato nel centro.',
      'Dimenticare che il risultato vale solo nell’intorno (sufficientemente piccolo): è un’approssimazione al primo ordine.',
    ],
    visual: { kind: 'deforma3d', scene: { mode: 'intorno', presets: ['taglio', 'generico'], controls: ['preset', 'amp', 'alpha'] } },
    recall: [
      { id: 'c2.3-q1', kind: 'vf', q: 'Nella deformazione omogenea tangente $\\tens F$ cambia da punto a punto dell’intorno.', answer: false, why: '§2.4: $\\tens F$ è calcolato nel centro $X$ e resta costante nell’intorno: per questo si dice «omogenea».', source: D(2, '2.4', 'eq. (2.1)', 20) },
      { id: 'c2.3-q2', kind: 'scelta', q: 'Quale termine si trascura per ottenere $d\\vet x=\\tens F\\,d\\vet X$?', options: ['$o(|Y-X|)$', '$\\tens F(X)(Y-X)$', '$f(X)$', 'il termine lineare'], correct: 0, why: 'Taylor: $f(Y)=f(X)+\\tens F(X)(Y-X)+o(|Y-X|)$; si trascura l’infinitesimo di ordine superiore.', source: D(2, '2.4', undefined, 20) },
      { id: 'c2.3-q3', kind: 'aperta', q: 'Qual è il concetto chiave dello studio locale (riquadro «Per l’orale», p. 20)?', answer: 'Limitandosi all’intorno di un punto, la deformazione di tutti i suoi punti si esprime con un’operazione algebrica: il tensore $\\tens F$ del centro applicato a $d\\vet X$. Richiede le proprietà di $f$ (bicontinuità).', source: D(2, '2.4', 'Per l’orale', 20) },
    ],
  },
  {
    id: 'c2.4',
    module: 'm2',
    title: 'Parametri di misura e tensore di deformazione finita',
    prereq: ['c2.3'],
    source: D(2, '2.5', 'Def 2.5.1–2.5.8, Prop 2.5.2–2.5.9', '20–23'),
    meaning: 'Quattro numeri dicono **quanto** si deforma l’intorno: l’allungamento specifico di una fibra $\\varepsilon_n$, la perdita di ortogonalità $\\gamma_{n,m}$, la variazione specifica di area $\\Delta S$ e di volume $\\Theta$. Tutti si leggono su $\\tens F^T\\tens F$, cioè sul tensore di Green–Saint-Venant $\\tens D$.',
    formulas: [
      { tex: '\\varepsilon_n=\\sqrt{\\tens F^T\\tens F\\hat n\\cdot\\hat n}-1=\\sqrt{2\\tens D\\hat n\\cdot\\hat n+1}-1', label: 'dilatazione lineare', rif: 'Prop 2.5.2' },
      { tex: '\\tens D:=\\tfrac12(\\tens F^T\\tens F-\\tens I)\\in\\mathrm{Sym}', label: 'tensore di deformazione finita', rif: 'Def 2.5.3' },
      { tex: '\\sin\\gamma_{n,m}=\\dfrac{2\\tens D\\hat m\\cdot\\hat n}{(\\varepsilon_n+1)(\\varepsilon_m+1)}', label: 'scorrimento angolare', rif: 'Prop 2.5.5' },
      { tex: '\\Theta=\\det\\tens F-1,\\qquad \\varepsilon_n,\\ \\Delta S,\\ \\Theta\\in\\,]-1,+\\infty[', label: 'dilatazione volumica e campi', rif: 'Prop 2.5.9' },
    ],
    explanation: `I parametri sono sempre **variazioni specifiche**, rapportate al valore iniziale: due elastici di 4 m e di 1 m con lo stesso peso si allungano di quantità diverse ma con lo stesso allungamento specifico, ed è questo che conta per la sollecitazione.

**Dilatazione lineare** $\\varepsilon_n=(dl-dL)/dL$ (Def 2.5.1). Dalla (2.1) $dl^2=\\tens F^T\\tens F\\,d\\vet X\\cdot d\\vet X$: l'espressione non è lineare in $\\tens F$. Varia in $]-1,+\\infty[$: $-1$ sarebbe la fibra che degenera in un punto, escluso da $\\det\\tens F>0$.

**Tensore di deformazione finita** $\\tens D$ (Def 2.5.3): simmetrico e nullo in assenza di deformazione. Con $\\tens F^T\\tens F=2\\tens D+\\tens I$ tutti i parametri si scrivono in funzione di $\\tens D$.

**Scorrimento** $\\gamma_{n,m}=\\pi/2-\\theta$ (Def 2.5.4) tra due fibre inizialmente ortogonali: positivo se l'angolo si **chiude**.

**Dilatazione superficiale** (Prop 2.5.7): $ds/dS=|\\tens F\\hat n\\wedge\\tens F\\hat m|$, con l'identità di Lagrange.

**Dilatazione volumica** (Prop 2.5.9): $dv/dV$ è proprio il rapporto dei prodotti misti, cioè $\\det\\tens F$. Le misure globali si ottengono integrando (§2.5.6).`,
    pitfalls: [
      'Dire che $\\varepsilon_n$ è lineare in $\\tens F$: c’è una radice e $\\tens F$ compare moltiplicato per sé stesso.',
      'Segno di $\\gamma$: positivo quando l’angolo tra le fibre si chiude ($\\theta<\\pi/2$).',
      'Includere gli estremi $-1$ e $+\\infty$ nel campo di variazione: sono esclusi (niente annichilimento della materia).',
    ],
    visual: { kind: 'deforma3d', scene: { mode: 'intorno', presets: ['taglio', 'allungamento', 'isocora', 'generico'], controls: ['preset', 'amp', 'alpha'] } },
    recall: [
      { id: 'c2.4-q1', kind: 'scelta', q: 'Qual è il campo di variazione di $\\varepsilon_n$?', options: ['$]-1,+\\infty[$', '$[-1,1]$', '$]0,+\\infty[$', '$]-\\infty,+\\infty[$'], correct: 0, why: '§2.5.1: $-1$ è la fibra che degenera in un punto, escluso come $+\\infty$.', source: D(2, '2.5.1', undefined, 21) },
      { id: 'c2.4-q2', kind: 'vf', q: '$\\Theta=\\det\\tens F-1$ discende direttamente dalla definizione di determinante.', answer: true, why: 'Prop 2.5.9: $dv/dV$ è il rapporto tra il prodotto misto delle fibre trasformate e quello delle fibre iniziali, cioè $\\det\\tens F$ (Def 1.4.1).', source: D(2, '2.5.5', 'Prop 2.5.9', 23) },
      { id: 'c2.4-q3', kind: 'vf', q: 'Uno scorrimento $\\gamma_{n,m}>0$ significa che l’angolo tra le fibre si è aperto.', answer: false, why: 'Def 2.5.4: $\\gamma=\\pi/2-\\theta$; $\\gamma>0$ vuol dire $\\theta<\\pi/2$, l’angolo si chiude.', source: D(2, '2.5.3', 'Def 2.5.4', 22) },
      { id: 'c2.4-q4', kind: 'aperta', q: 'Perché i parametri di misura sono variazioni specifiche e non assolute?', answer: 'Perché ai fini della sollecitazione conta la variazione rapportata al valore iniziale: due elastici di 4 m e 1 m con lo stesso peso hanno allungamenti totali diversi ma lo stesso allungamento specifico (§2.5).', source: D(2, '2.5', undefined, 20) },
    ],
  },
  {
    id: 'c2.5',
    module: 'm2',
    title: 'Piccole deformazioni, piccoli spostamenti, equilibrio referenziale',
    prereq: ['c2.4'],
    source: D(2, '2.6.1–2.6.2', 'Def 2.6.1–2.6.2', '23–24'),
    meaning: 'Due ipotesi diverse con effetti diversi: **piccole deformazioni** ($\\|\\tens H\\|\\ll1$) permettono di linearizzare la descrizione della deformazione; **piccoli spostamenti** ($|\\vet u|\\ll1$) permettono di imporre l’equilibrio nella configurazione di riferimento (**equilibrio referenziale**).',
    formulas: [
      { tex: '\\|\\tens H\\|\\ll1\\ \\Rightarrow\\ \\tens F\\simeq\\tens I', label: 'piccole deformazioni', rif: 'Def 2.6.1' },
      { tex: '|\\vet u|\\ll1', label: 'piccoli spostamenti', rif: 'Def 2.6.2' },
      { tex: 'M=P(e+f)\\simeq Pe\\quad(f\\ll e)', label: 'palo portafari', rif: '§2.6.2' },
    ],
    explanation: `$\\tens H$ è adimensionale (derivate di lunghezze rispetto a lunghezze), quindi la sua norma si confronta con 1. Se è piccola, $\\tens F$ è vicino all'identità, cioè all'assenza di deformazione.

Le due ipotesi non vanno confuse:
- grandi spostamenti **non** implicano grandi deformazioni (un foglio piegato: il segmento tracciato resta lungo 10 cm);
- grandi deformazioni implicano grandi spostamenti (gli spostamenti si ottengono integrando le deformazioni);
- piccole deformazioni e grandi spostamenti: la vela; piccole e piccoli: le travi comuni; grandi deformazioni e piccoli spostamenti: impossibile.

I piccoli spostamenti non cambiano la descrizione della deformazione, ma l'**equilibrio**: andrebbe imposto nella configurazione deformata, che non si conosce ancora, e il problema diventa implicito. Esempio del **palo portafari**: con il carico $P$ ad eccentricità $e$ il momento alla base è $P(e+f)$, con $f$ freccia della sommità che dipende a sua volta da $M$. Se $f\\ll e$, $M\\simeq Pe$.

In sintesi (riquadro «Per l'orale», p. 24): piccole deformazioni ⇒ linearizzazione delle deformazioni; piccoli spostamenti ⇒ linearizzazione dell'equilibrio.`,
    pitfalls: [
      'Dire che grandi spostamenti implicano grandi deformazioni: il foglio piegato e la vela lo smentiscono.',
      'Attribuire l’equilibrio referenziale all’ipotesi di piccole deformazioni: discende da quella di piccoli spostamenti.',
    ],
    recall: [
      { id: 'c2.5-q1', kind: 'scelta', q: 'Quale combinazione è fisicamente impossibile?', options: ['Grandi deformazioni e piccoli spostamenti', 'Piccole deformazioni e grandi spostamenti', 'Piccole deformazioni e piccoli spostamenti', 'Grandi deformazioni e grandi spostamenti'], correct: 0, why: '§2.6.2: gli spostamenti derivano dall’integrale delle deformazioni; grandi deformazioni portano grandi spostamenti.', source: D(2, '2.6.2', undefined, 24) },
      { id: 'c2.5-q2', kind: 'vf', q: 'L’ipotesi di piccoli spostamenti autorizza l’equilibrio referenziale.', answer: true, why: 'Riquadro «Per l’orale», p. 24: con spostamenti piccoli si confonde la configurazione deformata con quella di riferimento ai fini dell’equilibrio.', source: D(2, '2.6.2', 'Per l’orale', 24) },
      { id: 'c2.5-q3', kind: 'aperta', q: 'Spiega l’esempio del palo portafari.', answer: 'Il carico $P$ ha eccentricità $e$. Trascurando la deformazione il momento alla base è $Pe$; in realtà è $P(e+f)$, con $f$ spostamento della sommità che dipende a sua volta da $M$: problema implicito. Se $f\\ll e$ si può porre $M\\simeq Pe$ (§2.6.2).', source: D(2, '2.6.2', undefined, 24) },
    ],
  },
  {
    id: 'c2.6',
    module: 'm2',
    title: 'Tensore E, rotazione W, parametri linearizzati',
    prereq: ['c2.5', 'c1.3'],
    source: D(2, '2.6.3–2.6.6', 'Prop 2.6.3, Def 2.6.4, Teo 2.6.5, Prop 2.6.6', '24–26'),
    meaning: 'Con $\\|\\tens H\\|\\ll1$ il tensore $\\tens D$ si riduce a $\\tens E=\\operatorname{sym}\\nabla\\vet u$, l’unica misura di deformazione della teoria infinitesima. La parte antisimmetrica $\\tens W$ è la rotazione rigida infinitesima: non deforma. Tutti i parametri di misura diventano **lineari** in $\\tens E$.',
    formulas: [
      { tex: '\\tens E=\\tfrac12(\\nabla\\vet u+\\nabla\\vet u^T)', label: 'equazione di congruenza', rif: 'Teo 2.6.5' },
      { tex: '\\tens H=\\tens E+\\tens W,\\qquad\\tens W:=\\tfrac12(\\tens H-\\tens H^T)\\in\\mathrm{Skw}', label: 'deformazione pura + rotazione rigida', rif: '§2.6.4' },
      { tex: '\\varepsilon_n=\\tens E\\hat n\\cdot\\hat n,\\quad\\gamma_{n,m}=2\\tens E\\hat m\\cdot\\hat n,\\quad\\Delta S=\\varepsilon_n+\\varepsilon_m,\\quad\\Theta=\\operatorname{tr}\\tens E=\\operatorname{div}\\vet u', label: 'parametri linearizzati', rif: 'Prop 2.6.6' },
      { tex: 'E_{ii}=\\varepsilon_i,\\qquad E_{ij}=\\tfrac12\\gamma_{ij}\\ (i\\ne j)', label: 'interpretazione delle componenti', rif: '§2.6.6' },
    ],
    explanation: `**Procedimento formale** (§2.6.3): si scrive $\\tens F=\\tens I+\\epsilon\\tens H$, si calcola, si trascurano $\\epsilon^2,\\epsilon^3,\\dots$ e si pone $\\epsilon=1$. Applicato a $\\tens D$ cade il termine $\\epsilon^2\\tens H^T\\tens H$ e resta $\\tens E$ (Prop 2.6.3). Nella teoria finita esistono molte misure di deformazione; nella infinitesima collassano tutte in $\\tens E$.

$\\tens E$ è un **campo**: $\\tens E(X)$. Per il primo teorema di decomposizione $\\tens H$ (9 componenti) si divide in $\\tens E$ (6) e $\\tens W$ (3). Per una traslazione $\\tens E=\\tens W=\\tens O$; per una rotazione rigida infinitesima $\\tens H=\\varphi\\tens W\\in\\mathrm{Skw}$ e, per l'unicità della decomposizione, $\\tens E=\\tens O$.

**Che cosa misura $\\tens E$** (riquadro p. 26): la **deformazione pura**, ciò che resta tolto lo spostamento rigido infinitesimo. Gli spostamenti rigidi non cambiano lunghezze, angoli, aree, volumi, e quindi nella meccanica lineare non producono tensioni.

**Parametri linearizzati** (Prop 2.6.6): si usano $\\sqrt{1+2x}\\simeq1+x$, $\\arcsin x\\simeq x$, $\\det(\\tens I+\\epsilon\\tens H)=1+\\epsilon\\operatorname{tr}\\tens H+O(\\epsilon^2)$. I termini doppi in $\\varepsilon_n$ vengono dalla simmetria di $\\tens E$. $\\Theta\\equiv0$: deformazione **isocora**, $\\vet u$ solenoidale.

**Componenti** (§2.6.6): sulla diagonale le dilatazioni lungo gli assi, fuori diagonale **metà** degli scorrimenti.`,
    pitfalls: [
      'Scrivere $E_{12}=\\gamma_{12}$: la componente fuori diagonale è **metà** dello scorrimento.',
      'Includere $\\tens W$ nella deformazione: è un moto rigido infinitesimo, non deforma e non genera tensioni.',
      'Dimenticare i fattori 2 dei doppi prodotti in $\\varepsilon_n=\\sum_{ij}E_{ij}n_in_j$.',
    ],
    visual: { kind: 'deforma3d', scene: { mode: 'intorno', presets: ['taglio', 'rotazione', 'generico', 'isocora'], part: 'H', controls: ['preset', 'part', 'amp', 'alpha'] } },
    recall: [
      { id: 'c2.6-q1', kind: 'scelta', q: 'Quanto vale $E_{12}$ in funzione dello scorrimento $\\gamma_{12}$?', options: ['$\\gamma_{12}/2$', '$\\gamma_{12}$', '$2\\gamma_{12}$', '$\\sin\\gamma_{12}$'], correct: 0, why: '§2.6.6: $E_{ij}=\\tens E\\hat e_j\\cdot\\hat e_i=\\frac12\\gamma_{ij}$ per $i\\ne j$.', source: D(2, '2.6.6', undefined, 26) },
      { id: 'c2.6-q2', kind: 'vf', q: 'Uno spostamento rigido infinitesimo ha $\\tens E=\\tens O$.', answer: true, why: '§2.6.4: $\\tens H=\\tens W\\in\\mathrm{Skw}$ e, per l’unicità della decomposizione, $\\tens E=\\tens O$.', source: D(2, '2.6.4', undefined, '25–26') },
      { id: 'c2.6-q3', kind: 'scelta', q: 'Nella teoria infinitesima $\\Theta$ vale…', options: ['$\\operatorname{tr}\\tens E=\\operatorname{div}\\vet u$', '$\\det\\tens E$', '$\\operatorname{tr}\\tens W$', '$\\det\\tens F$'], correct: 0, why: 'Prop 2.6.6: $\\det(\\tens I+\\epsilon\\tens H)=1+\\epsilon\\operatorname{tr}\\tens H+O(\\epsilon^2)$ e $\\operatorname{tr}\\tens W=0$.', source: D(2, '2.6.5', 'Prop 2.6.6', 26) },
      { id: 'c2.6-q4', kind: 'aperta', q: 'Che cosa misura $\\tens E$ e che cosa $\\tens W$?', answer: '$\\tens E$ misura la deformazione pura (variazioni di lunghezza, angolo, area, volume); $\\tens W$ la rotazione rigida infinitesima, che non cambia lunghezze né angoli. Nella meccanica lineare gli spostamenti rigidi infinitesimi non producono deformazioni né tensioni (p. 26).', source: D(2, '2.6.4', 'Per l’orale', 26) },
    ],
  },
  {
    id: 'c2.7',
    module: 'm2',
    title: 'Formula di rappresentazione e compatibilità',
    prereq: ['c2.6'],
    source: D(2, '2.7–2.8', 'Teo 2.7.1, eq. (2.2)–(2.3), Teo 2.8.1–2.8.2', '27–29'),
    meaning: 'Lo spostamento di un punto vicino $Y$ è la somma di tre pezzi: traslazione rigida, rotazione rigida infinitesima e **spostamento di deformazione pura** $\\tens E(Y-X)$. Il problema inverso (dato $\\tens E$, trovare $\\vet u$) non ha sempre soluzione: serve la condizione di Saint-Venant.',
    formulas: [
      { tex: '\\vet u(Y)=\\vet u(X)+\\tens W(Y-X)+\\tens E(Y-X)', label: 'formula di rappresentazione', rif: 'Teo 2.7.1' },
      { tex: '\\tens E(X)=\\tfrac12\\big(\\nabla\\vet u(X)+\\nabla\\vet u^T(X)\\big)', label: 'equazione di compatibilità', rif: 'eq. (2.2)' },
      { tex: '\\operatorname{rot}\\big(\\operatorname{rot}\\tens E\\big)=\\tens O', label: 'condizione di Saint-Venant', rif: 'eq. (2.3), Teo 2.8.2' },
      { tex: '\\dfrac{\\partial^2E_{11}}{\\partial X_2^2}+\\dfrac{\\partial^2E_{22}}{\\partial X_1^2}=2\\dfrac{\\partial^2E_{12}}{\\partial X_1\\partial X_2}', label: 'una delle 6 equazioni', rif: '§2.8' },
    ],
    explanation: `**Formula di rappresentazione** (Teo 2.7.1). Dallo sviluppo di Taylor si sottrae $Y-X$ a entrambi i membri e si usa $\\tens F-\\tens I=\\tens H=\\tens E+\\tens W$. I primi due termini sono lo **spostamento rigido infinitesimo** (rototraslazione); il terzo, $\\vet u^{dp}:=\\tens E(Y-X)$, è lo spostamento di deformazione pura. Poiché $\\tens W(Y-X)=\\vet w\\wedge(Y-X)$ è ortogonale a $Y-X$, fino alla rotazione rigida la distanza tra i due punti non cambia. Esempio del **trampolino**: un corpo si può rompere solo per effetto della deformazione pura.

**Compatibilità** (§2.8). Il problema diretto (da $\\vet u$ a $\\tens E$) si risolve derivando. Quello inverso è un sistema di 6 equazioni alle derivate parziali in 3 incognite: la soluzione può non esistere o non essere unica. Interessa perché nella pratica si calcola al computer, che restituisce comunque un numero.

- **Unicità** (Teo 2.8.1, detto «di Kirchhoff» nella dispensa, NF-04): se esiste, $\\vet u$ è unico a meno di uno spostamento rigido infinitesimo (la differenza di due soluzioni ha deformazione nulla). Incondizionata se il corpo è vincolato (un edificio); per un aereo in volo si conosce la deformata, non la posizione.
- **Esistenza** (Teo 2.8.2, Saint-Venant, enunciato senza dimostrazione): la (2.3) è necessaria; è anche sufficiente se il corpo è **semplicemente connesso** (ogni curva chiusa si riduce a un punto restando nel corpo).

**Interpretazione meccanica:** le tessere infinitesime, ciascuna deformata secondo $\\tens E$ nel suo punto, devono potersi ricomporre senza vuoti né sovrapposizioni.`,
    pitfalls: [
      'Dire che $\\tens W(Y-X)$ cambia la distanza tra $X$ e $Y$: è ortogonale a $Y-X$, la conserva (al primo ordine).',
      'Credere che ogni campo $\\tens E$ simmetrico venga da uno spostamento: serve $\\operatorname{rot}\\operatorname{rot}\\tens E=\\tens O$.',
      'Dimenticare la semplice connessione: senza, la condizione di Saint-Venant è solo necessaria.',
      'Confondere l’unicità della compatibilità (Teo 2.8.1) con il teorema di Kirchhoff del problema elastico (Teo 5.1.1).',
    ],
    visual: { kind: 'deforma3d', scene: { mode: 'rappresentazione', presets: ['taglio', 'rotazione', 'generico'], controls: ['preset', 'amp'] } },
    recall: [
      { id: 'c2.7-q1', kind: 'scelta', q: 'Nella formula di rappresentazione, quale termine è lo spostamento di deformazione pura?', options: ['$\\tens E(Y-X)$', '$\\tens W(Y-X)$', '$\\vet u(X)$', '$\\vet u(Y)$'], correct: 0, why: 'Teo 2.7.1: $\\vet u^{dp}:=\\tens E(Y-X)$; gli altri due sono lo spostamento rigido infinitesimo.', source: D(2, '2.7', 'Teo 2.7.1', 27) },
      { id: 'c2.7-q2', kind: 'vf', q: 'La condizione $\\operatorname{rot}\\operatorname{rot}\\tens E=\\tens O$ è sempre sufficiente per l’esistenza di $\\vet u$.', answer: false, why: 'Teo 2.8.2: è necessaria; è anche sufficiente solo se il corpo è semplicemente connesso.', source: D(2, '2.8', 'Teo 2.8.2', 28) },
      { id: 'c2.7-q3', kind: 'aperta', q: 'Perché la soluzione del problema di compatibilità è unica solo «a meno di uno spostamento rigido infinitesimo»?', answer: 'Perché la differenza di due soluzioni ha deformazione nulla, quindi è uno spostamento rigido infinitesimo (Teo 2.8.1). L’unicità diventa incondizionata se il corpo è vincolato in modo da impedire gli spostamenti rigidi.', source: D(2, '2.8', 'Teo 2.8.1', 28) },
      { id: 'c2.7-q4', kind: 'vf', q: 'Un corpo si può rompere solo per effetto della deformazione pura.', answer: true, why: 'Esempio del trampolino (§2.7): la rototraslazione rigida non cambia le distanze; solo $\\vet u^{dp}$ deforma.', source: D(2, '2.7', undefined, 27) },
    ],
  },
  {
    id: 'c2.8',
    module: 'm2',
    title: 'Dilatazioni e direzioni principali',
    prereq: ['c2.6'],
    source: D(2, '2.9–2.10', 'Def 2.9.1, Teo 2.9.2–2.9.3, Prop 2.9.4', '29–33'),
    meaning: 'In ogni punto esistono almeno tre direzioni mutuamente ortogonali lungo cui la deformazione pura non devia la fibra: le **direzioni principali**. Lungo di esse le fibre si allungano o accorciano soltanto (le **dilatazioni principali**), restano ortogonali, e le dilatazioni sono la massima e la minima tra tutte le direzioni.',
    formulas: [
      { tex: '(\\tens E-\\lambda\\tens I)\\hat n=\\vet 0,\\qquad\\hat n\\cdot\\hat n=1', label: 'autocoppie', rif: 'Def 2.9.1' },
      { tex: '\\lambda^3-I\\lambda^2+II\\lambda-III=0', label: 'equazione secolare di Laplace', rif: 'Teo 2.9.3' },
      { tex: '\\tens E=\\textstyle\\sum_i\\lambda_i\\,\\hat n_i\\otimes\\hat n_i', label: 'rappresentazione spettrale', rif: '§2.9.3' },
      { tex: 'e_3\\le\\varepsilon_n\\le e_1\\quad\\forall\\hat n', label: 'proprietà di estremo', rif: 'Prop 2.9.4' },
    ],
    explanation: `Lo spostamento di deformazione pura di un punto della fibra $\\hat n$ è $|Y-X|\\,\\tens E\\hat n$, in generale non parallelo a $\\hat n$. Le direzioni con $\\tens E\\hat n\\parallel\\hat n$ sono le **principali**: è il problema degli autovalori di $\\tens E$.

**Teorema spettrale** (Teo 2.9.2): per $\\tens E$ simmetrico esistono almeno 3 autocoppie reali e ad autovalori distinti corrispondono autovettori ortogonali. L'unica ipotesi è la simmetria.

**Equazione secolare** (Teo 2.9.3): soluzioni non banali solo se $\\det(\\tens E-\\lambda\\tens I)=0$. Gli invarianti $I=\\operatorname{tr}\\tens E$, $II$ (somma dei minori principali di ordine 2), $III=\\det\\tens E$ non dipendono dal riferimento. Trovato $\\lambda^*$, la normalizzazione sceglie il versore tra le infinite soluzioni.

**I tre casi:** radici distinte, la sfera diventa un **ellissoide triassiale**; radice doppia, $\\tens E=\\lambda_3\\hat n_3\\otimes\\hat n_3+\\lambda(\\tens I-\\hat n_3\\otimes\\hat n_3)$, ellissoide di rivoluzione («pallone da rugby»); radice tripla, $\\tens E=\\lambda\\tens I$, deformazione **omotetica** (la sfera resta sfera).

**Estremo** (Prop 2.9.4): nel riferimento principale $\\varepsilon_n=e_1n_1^2+e_2n_2^2+e_3n_3^2$, media pesata delle $e_i$.

**Dilatazioni nulle** (§2.10): si leggono sugli invarianti. $III\\ne0$: triassiale; $III=0$, $II\\ne0$: una nulla, $\\vet u^{dp}$ sempre parallelo al piano $\\hat n_2\\hat n_3$ (biassiale); $III=II=0$: due nulle, deformazione solo lungo $\\hat n_3$. Sulla frase «la sfera diventa un'ellisse piatta» vedi la nota NF-02.`,
    pitfalls: [
      'Pensare che gli scorrimenti siano proprietà del punto: in un riferimento non principale compaiono per effetto della base; tra direzioni principali sono nulli.',
      'Una dilatazione principale nulla non vuol dire che il corpo resti fermo lungo quella direzione: la fibra non cambia lunghezza (§2.10).',
      'Il teorema spettrale richiede la simmetria: per tensori non simmetrici gli autovalori possono essere complessi.',
      'NF-02: con $\\lambda_1=0$ un intorno sferico diventa un ellissoide con un semiasse invariato; è $\\vet u^{dp}$ a essere parallelo al piano $\\hat n_2\\hat n_3$.',
    ],
    visual: { kind: 'deforma3d', scene: { mode: 'ellissoide', presets: ['generico', 'rivoluzione', 'omotetia', 'piana', 'allungamento'], controls: ['preset', 'amp', 'probe'] } },
    recall: [
      { id: 'c2.8-q1', kind: 'scelta', q: 'Con $III=0$ e $II\\ne0$ lo stato di deformazione è…', options: ['biassiale (una dilatazione principale nulla)', 'triassiale', 'monoassiale', 'nullo'], correct: 0, why: '§2.10: $III=0\\Rightarrow\\lambda(\\lambda^2-I\\lambda+II)=0$, una radice nulla; con $II\\ne0$ le altre due non sono entrambe nulle.', source: D(2, '2.10', undefined, '32–33') },
      { id: 'c2.8-q2', kind: 'vf', q: 'Due direzioni principali di deformazione, inizialmente ortogonali, restano ortogonali a deformazione avvenuta.', answer: true, why: '§2.9.3: $\\gamma_{ij}=2\\tens E\\hat n_j\\cdot\\hat n_i=2\\lambda_j\\hat n_j\\cdot\\hat n_i=0$.', source: D(2, '2.9.3', undefined, 31) },
      { id: 'c2.8-q3', kind: 'scelta', q: 'Con una radice doppia una sfera materiale diventa…', options: ['un ellissoide di rivoluzione', 'un ellissoide triassiale', 'una sfera più grande', 'un cilindro'], correct: 0, why: 'Caso 2 di §2.9.3: tutte le direzioni del piano $\\perp\\hat n_3$ hanno la stessa dilatazione: «pallone da rugby».', source: D(2, '2.9.3', undefined, 31) },
      { id: 'c2.8-q4', kind: 'aperta', q: 'Dimostra che $e_3\\le\\varepsilon_n\\le e_1$.', answer: 'Nel riferimento principale, con $\\hat n=\\sum n_i\\hat n_i$ e $\\sum n_i^2=1$: $\\varepsilon_n=\\tens E\\hat n\\cdot\\hat n=e_1n_1^2+e_2n_2^2+e_3n_3^2$, media pesata delle $e_i$ con pesi non negativi a somma 1: sta tra la minima e la massima (Prop 2.9.4).', source: D(2, '2.9.4', 'Prop 2.9.4', 32) },
    ],
  },
];
