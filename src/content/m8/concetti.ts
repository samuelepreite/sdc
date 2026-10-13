/**
 * Modulo 8 — Criteri di resistenza (Cap. 6, pp. 144–159). Fonte: tools/testi/cap-06.md.
 * Tensioni principali s1 ≥ s2 ≥ s3, trazione positiva. In questo capitolo ν indica sia il coefficiente di sicurezza sia
 * quello di Poisson (NF-08): a schermo «ν (sicurezza)» e «ν (Poisson)» quando possono confondersi.
 */
import { D } from '../../engine/types';
import type { Concept } from '../types';

export const M8_CONCETTI: Concept[] = [
  {
    id: 'c8.1',
    module: 'm8',
    title: 'Verifica di resistenza e di sicurezza monoassiale',
    prereq: ['c4.3'],
    source: D(6, '6.1–6.2', 'Def 6.2.1', '144–146'),
    meaning: 'I problemi di risposta dicono quanto vale la tensione, non quando il materiale va in crisi. In uno stato monoassiale basta confrontare la tensione di esercizio con la tensione limite della prova, ridotta del coefficiente di sicurezza.',
    formulas: [
      { tex: '\\sigma_L^c\\le\\sigma_{es}\\le\\sigma_L^t', label: 'condizione di resistenza', rif: '§6.2.2' },
      { tex: '\\sigma_{adm}=\\frac{\\sigma_L}\\nu,\\qquad\\sigma_{adm}^c\\le\\sigma_{es}\\le\\sigma_{adm}^t', label: 'tensione ammissibile (ν di sicurezza)', rif: 'Def 6.2.1' },
    ],
    explanation: `**Dalla risposta alla verifica** (§6.1). I problemi di risposta sono lineari (carichi doppi, risposte doppie) e non dicono quando arriva la **crisi**: locale (una lesione) o globale (il collasso). Serve verificare che lo stato di tensione sia compatibile con la resistenza del materiale.

**Duttili e fragili.** I duttili (acciaio da carpenteria) hanno snervamento $\\sigma_y$ e ampio campo plastico, con lo stesso comportamento in trazione e compressione. I fragili (calcestruzzo) si deformano poco prima di rompersi e resistono molto più a compressione che a trazione.

**Verifica di resistenza** (§6.2.2): stato di esercizio $\\tens T_{es}(P)$, verificato **punto per punto**. Tensione limite: per i duttili $\\sigma_L=\\sigma_y$ (non si accettano deformazioni permanenti in esercizio), per i fragili $\\sigma_L=\\sigma_R$. Il dominio di resistenza è il segmento $[\\sigma_L^c,\\sigma_L^t]$.

**Verifica di sicurezza** (§6.2.3): non si può lambire la crisi (l'uccellino che si posa sulla copertura): incertezze su geometria, carichi, modello e resistenza si riducono ma non si eliminano. **Def 6.2.1:** coefficiente di sicurezza $\\nu\\ge1$, divisore delle resistenze; $\\sigma_{adm}=\\sigma_L/\\nu$. Valori indicativi: acciaio 1,7–1,8, legno 2,5, calcestruzzo 3, muratura 4–10; più bassi per i duttili, che hanno una riserva oltre lo snervamento. È il **metodo delle tensioni ammissibili**, il più antico; il dominio di sicurezza sta dentro quello di resistenza.`,
    pitfalls: ['Confondere il ν di sicurezza con il coefficiente di Poisson (NF-08).', 'Usare per un duttile la tensione di rottura invece di quella di snervamento.', 'Dimenticare che i fragili hanno resistenze diverse in trazione e compressione.'],
    visual: { kind: 'svg', id: 'criteri', params: { tab: 'verifica' } },
    recall: [
      { id: 'c8.1-q1', kind: 'scelta', q: 'Qual è la tensione limite di un materiale duttile?', options: ['La tensione di snervamento', 'La tensione di rottura', 'Il limite di proporzionalità', 'Zero'], correct: 0, why: '§6.2.2: in esercizio non si accettano deformazioni permanenti.', source: D(6, '6.2.2', undefined, 145) },
      { id: 'c8.1-q2', kind: 'vf', q: 'Il coefficiente di sicurezza è più alto per la muratura che per l’acciaio.', answer: true, why: 'Def 6.2.1: acciaio 1,7–1,8; muratura 4–10.', source: D(6, '6.2.3', 'Def 6.2.1', 146) },
      { id: 'c8.1-q3', kind: 'aperta', q: 'Perché serve un coefficiente di sicurezza?', answer: 'Perché geometria, carichi, modello e resistenza sono incerti: le incertezze si riducono ma non si eliminano, quindi non si può progettare lambendo la crisi; si dividono le resistenze per $\\nu\\ge1$ (§6.2.3).', source: D(6, '6.2.3', 'Def 6.2.1', 146) },
    ],
  },
  {
    id: 'c8.2',
    module: 'm8',
    title: 'Criteri di resistenza e tensione ideale',
    prereq: ['c8.1', 'c3.7'],
    source: D(6, '6.3', 'Def 6.3.1', '147–148'),
    meaning: 'In uno stato pluriassiale non si può confrontare un tensore con un numero. Un criterio di resistenza, a partire da una congettura sulla causa della crisi, assegna allo stato una tensione monoassiale «ugualmente pericolosa», la tensione ideale, da confrontare con la prova.',
    formulas: [
      { tex: 'F(s_1,s_2,s_3)\\le F(\\sigma_L,0,0)\\iff\\sigma_{id}(s_1,s_2,s_3)\\le\\sigma_L', label: 'verifica con un criterio', rif: '§6.3.3' },
    ],
    explanation: `**Il problema** (§6.3.1): servirebbe il dominio limite nello spazio a 6 dimensioni delle componenti di $\\tens T$, proibitivo da determinare (le prove biassiali si fanno solo nella ricerca). Le prove sono monoassiali, e **tra vettori non esiste un ordinamento univoco**: non si può dire se $(\\sigma_x,\\dots,\\tau_{zx})$ è «più piccolo» di $(\\sigma_L,0,\\dots,0)$.

**Def 6.3.1.** Un **criterio di resistenza** è un modello che dalle tensioni di esercizio ricava una **tensione ideale** $\\sigma_{id}$: la tensione monoassiale fittizia **ugualmente pericolosa** (equivalenza del cimento). Ogni criterio parte da una congettura sulla causa della crisi, tradotta in una **funzione di crisi** $F$.

**Materiali isotropi** (§6.3.3): se il materiale e la crisi sono isotropi si lavora nel riferimento principale, $F(s_1,s_2,s_3)$: da 6 a 3 dimensioni. Procedura: calcolare $\\tens T_{es}$ e le $s_i$; ricavare dalla prova $F(\\sigma_L,0,0)$; verificare $F(s_1,s_2,s_3)\\le F(\\sigma_L,0,0)$ e isolare $\\sigma_{id}\\le\\sigma_L$. Con resistenze diverse in trazione e compressione servono due funzioni e due disuguaglianze; per la sicurezza si usa $\\sigma_{adm}$. Il criterio si sceglie in base agli esperimenti sul materiale.`,
    pitfalls: ['Pensare che la tensione ideale sia una tensione realmente presente: è fittizia.', 'Dimenticare che il riferimento principale si può usare solo per materiali e crisi isotropi.', 'Credere che esista un criterio valido per tutti i materiali.'],
    visual: { kind: 'svg', id: 'criteri', params: { tab: 'piano' } },
    recall: [
      { id: 'c8.2-q1', kind: 'scelta', q: 'Che cos’è la tensione ideale?', options: ['Una tensione monoassiale fittizia ugualmente pericolosa dello stato reale', 'La tensione principale massima', 'La tensione ammissibile', 'La media delle tensioni principali'], correct: 0, why: 'Def 6.3.1.', source: D(6, '6.3.2', 'Def 6.3.1', 147) },
      { id: 'c8.2-q2', kind: 'vf', q: 'Per materiali isotropi la funzione di crisi si può scrivere in funzione delle sole tensioni principali.', answer: true, why: '§6.3.3: da 6 a 3 dimensioni.', source: D(6, '6.3.3', undefined, 147) },
      { id: 'c8.2-q3', kind: 'aperta', q: 'Perché non basta confrontare le componenti di $\\tens T$ con $\\sigma_L$?', answer: 'Perché lo stato di esercizio è un vettore a 6 componenti, la prova dà $(\\sigma_L,0,0,0,0,0)$, e tra vettori non c’è un ordinamento univoco: serve un criterio che riduca lo stato a un numero confrontabile (§6.3.1).', source: D(6, '6.3.1', undefined, 147) },
    ],
  },
  {
    id: 'c8.3',
    module: 'm8',
    title: 'Criteri di Galileo, Tresca, Grashof',
    prereq: ['c8.2', 'c3.9', 'c5.2'],
    source: D(6, '6.4.1–6.4.3', undefined, '148–150'),
    meaning: 'Tre congetture diverse: la crisi dipende dalla massima tensione normale (Galileo), dalla massima tangenziale (Tresca, ispirato alle linee di Lüders) o dalla massima dilatazione (Grashof).',
    formulas: [
      { tex: '\\sigma_{id}^t=s_1\\le\\sigma_L^t,\\qquad\\sigma_{id}^c=s_3\\ge\\sigma_L^c', label: 'Galileo', rif: '§6.4.1' },
      { tex: '\\sigma_{id}=s_1-s_3\\le\\sigma_L', label: 'Tresca', rif: '§6.4.2' },
      { tex: '\\sigma_{id}^t=s_1-\\nu(s_2+s_3)\\le\\sigma_L^t,\\quad\\sigma_{id}^c=s_3-\\nu(s_1+s_2)\\ge\\sigma_L^c', label: 'Grashof (ν di Poisson)', rif: '§6.4.3' },
    ],
    explanation: `**Galileo** (Navier, massime tensioni normali; §6.4.1): metà del XVII secolo, importanza storica. La crisi dipende dalla massima e dalla minima tensione normale (gli estremi del Cap. 3). Ammette resistenze diverse, ma non rappresenta la realtà.

**Tresca** (Guest, massima tangenziale; §6.4.2): seconda metà del XIX secolo, dalla metallurgia. Ispirato alle **linee di Lüders**: a 45° c'è $\\tau_{\\max}$, e la crisi arriva quando la tangenziale supera una soglia. $F=\\frac{s_1-s_3}2\\le\\frac{\\sigma_L}2$, quindi $\\sigma_{id}=s_1-s_3$. Uguale resistenza in trazione e compressione; buono per metalli molto duttili (rame, acciaio dolce).

**Grashof** (Saint-Venant, massime dilatazioni; §6.4.3): materiale elastico lineare isotropo fino alla crisi, quindi **coassialità** (le direzioni principali di deformazione e tensione coincidono). $F^t=e_1$, $F^c=e_3$; con il legame inverso $e_1=\\frac1E[s_1-\\nu(s_2+s_3)]\\le\\frac{\\sigma_L^t}E$ e analoga per $e_3$. Ammette resistenze diverse; adatto alla ghisa.`,
    pitfalls: ['Dimenticare che Tresca richiede uguale resistenza in trazione e compressione.', 'Usare Grashof senza ricordare l’ipotesi di elasticità lineare isotropa fino alla crisi (coassialità).', 'Confondere il ν di Poisson di Grashof con il coefficiente di sicurezza.'],
    visual: { kind: 'svg', id: 'criteri', params: { tab: 'piano' } },
    recall: [
      { id: 'c8.3-q1', kind: 'scelta', q: 'A quale fenomeno sperimentale si ispira Tresca?', options: ['Le linee di Lüders a 45°', 'Il softening del calcestruzzo', 'La strizione', 'Il creep'], correct: 0, why: '§6.4.2: a 45° agisce la tangenziale massima.', source: D(6, '6.4.2', undefined, 149) },
      { id: 'c8.3-q2', kind: 'vf', q: 'Il criterio di Grashof richiede la coassialità tra tensioni e deformazioni principali.', answer: true, why: '§6.4.3: ipotesi di elasticità lineare isotropa fino alla crisi.', source: D(6, '6.4.3', undefined, 149) },
      { id: 'c8.3-q3', kind: 'aperta', q: 'Ricava la tensione ideale di Tresca.', answer: 'La funzione di crisi è la tangenziale massima $F=\\frac{s_1-s_3}2$; nella prova monoassiale $F(\\sigma_L,0,0)=\\frac{\\sigma_L}2$; quindi $\\frac{s_1-s_3}2\\le\\frac{\\sigma_L}2$, cioè $\\sigma_{id}=s_1-s_3\\le\\sigma_L$ (§6.4.2).', source: D(6, '6.4.2', undefined, 149) },
    ],
  },
  {
    id: 'c8.4',
    module: 'm8',
    title: 'Beltrami e confutazione di Huber',
    prereq: ['c8.3', 'c5.3'],
    source: D(6, '6.4.4–6.4.5', undefined, '150–151'),
    meaning: 'Beltrami propone come funzione di crisi l’energia specifica di deformazione. Huber lo confuta con un controesempio: un punto in compressione idrostatica (in profondità) non va mai in crisi, mentre Beltrami prevede la crisi oltre una certa profondità.',
    formulas: [
      { tex: '\\sigma_{id}=\\sqrt{s_1^2+s_2^2+s_3^2-2\\nu(s_1s_2+s_2s_3+s_3s_1)}\\le\\sigma_L', label: 'Beltrami (ν di Poisson)', rif: '§6.4.4' },
      { tex: 'h_L=\\frac{\\sigma_L}{\\rho g\\sqrt{3-6\\nu}}', label: 'profondità di crisi prevista da Beltrami', rif: '§6.4.5' },
    ],
    explanation: `**Beltrami** (1885; §6.4.4): primo criterio **energetico**, $F=\\varphi$. Ipotesi: elastico lineare isotropo (quindi iperelastico), uguale resistenza in trazione e compressione. Con l'espressione di $\\varphi$ in tensioni principali (Prop 4.14.1):

$$\\frac1{2E}\\sum s_i^2-\\frac\\nu E\\sum s_is_j\\le\\frac{\\sigma_L^2}{2E}\\ \\Rightarrow\\ \\sigma_{id}=\\sqrt{\\textstyle\\sum s_i^2-2\\nu\\sum s_is_j}.$$

La rappresentazione nello spazio delle tensioni principali (un ellissoide) è utile ma non indispensabile; i criteri vanno comunque verificati sperimentalmente.

**Huber** (1904; §6.4.5): punto immerso a profondità $h$ (autoclave): $\\tens T=-\\rho gh\\,\\tens I$, $s_1=s_2=s_3=-\\rho gh$. Allora $\\sigma_{id}^B=\\rho gh\\sqrt{3-6\\nu}$ e Beltrami prevede la crisi a $h_L$; ma Huber non osservò crisi nemmeno per $h\\gg h_L$. Basta un controesempio: Beltrami fallisce.`,
    pitfalls: ['Dimenticare che Beltrami presuppone uguale resistenza a trazione e compressione.', 'Pensare che Huber abbia confutato tutti i criteri energetici: von Mises, che usa solo l’energia distorcente, regge.', 'Dimenticare il fattore $\\sqrt{3-6\\nu}$.'],
    visual: { kind: 'criteri3d', scene: { mode: 'spazio', stato: 'huber', show: ['beltrami', 'vonMises'] } },
    recall: [
      { id: 'c8.4-q1', kind: 'scelta', q: 'Quale funzione di crisi usa Beltrami?', options: ['L’energia specifica di deformazione φ', 'L’energia distorcente', 'La tangenziale massima', 'La dilatazione massima'], correct: 0, why: '§6.4.4.', source: D(6, '6.4.4', undefined, 150) },
      { id: 'c8.4-q2', kind: 'vf', q: 'Nell’esperimento di Huber il punto immerso non va in crisi nemmeno a grande profondità.', answer: true, why: '§6.4.5: contraddice la previsione di Beltrami.', source: D(6, '6.4.5', undefined, 151) },
      { id: 'c8.4-q3', kind: 'aperta', q: 'Ricava la profondità di crisi prevista da Beltrami per lo stato di Huber.', answer: 'Con $s_1=s_2=s_3=-\\rho gh$: $\\sum s_i^2=3(\\rho gh)^2$, $\\sum s_is_j=3(\\rho gh)^2$, quindi $\\sigma_{id}=\\rho gh\\sqrt{3-6\\nu}$; ponendolo uguale a $\\sigma_L$, $h_L=\\sigma_L/(\\rho g\\sqrt{3-6\\nu})$ (§6.4.5).', source: D(6, '6.4.5', undefined, 151) },
    ],
  },
  {
    id: 'c8.5',
    module: 'm8',
    title: 'Secondo teorema di decomposizione e von Mises',
    prereq: ['c8.4'],
    source: D(6, '6.5', 'Teo 6.5.1, Def 6.5.2, Teo 6.5.3', '151–154'),
    meaning: 'Ogni tensore si scompone in modo unico in parte sferica (variazione di volume) e deviatorica (variazione di forma). Per un isotropo anche il legame e l’energia si scompongono; von Mises usa come funzione di crisi la sola energia di distorsione, ed è insensibile alla pressione.',
    formulas: [
      { tex: '\\tens A_s=\\tfrac13(\\operatorname{tr}\\tens A)\\tens I,\\quad\\tens A_d=\\tens A-\\tfrac13(\\operatorname{tr}\\tens A)\\tens I,\\quad\\tens A_s\\cdot\\tens A_d=0', label: 'secondo teorema di decomposizione', rif: 'Teo 6.5.1' },
      { tex: '\\varphi_d=\\tfrac12\\mathbb A\\tens E_d\\cdot\\tens E_d=\\frac1{12\\mu}\\big[(s_1-s_2)^2+(s_2-s_3)^2+(s_3-s_1)^2\\big]', label: 'energia distorcente', rif: 'Def 6.5.2' },
      { tex: '\\sigma_{id}=\\sqrt{\\tfrac12\\big[(s_1-s_2)^2+(s_2-s_3)^2+(s_3-s_1)^2\\big]}\\le\\sigma_L', label: 'criterio di von Mises', rif: 'Teo 6.5.3' },
    ],
    explanation: `Von Mises (1913) usa un invariante della parte deviatorica; **Hencky** (1924) mostra che equivale a usare l'**energia distorcente**. Ipotesi: elastico lineare isotropo, uguale resistenza in trazione e compressione.

**Teo 6.5.1.** Ogni $\\tens A$ si scrive in modo unico come somma di una parte **sferica** e una **deviatorica** ($\\operatorname{tr}\\tens A_d=0$); le due parti sono ortogonali. Su $\\tens E$: $\\tens E_s=\\frac13\\Theta\\tens I$ porta tutta la variazione di volume, $\\tens E_d$ solo la variazione di forma. Su $\\tens T$: $\\tens T_s=\\sigma_m\\tens I$, $\\tens T_d$ è lo scostamento da uno stato idrostatico.

**Legame:** in generale da $\\tens T_s+\\tens T_d=\\mathbb A\\tens E_s+\\mathbb A\\tens E_d$ non si separano gli addendi; per un isotropo (Lamé) $\\mathbb A\\tens E_s$ è sferico e $\\mathbb A\\tens E_d=2\\mu\\tens E_d$ deviatorico, quindi per unicità $\\tens T_s=\\mathbb A\\tens E_s$, $\\tens T_d=2\\mu\\tens E_d$. **Energia:** il termine di accoppiamento si annulla, $\\varphi=\\varphi(\\tens E_s)+\\varphi(\\tens E_d)$.

**Il criterio:** $F=\\varphi_d=\\frac1{4\\mu}\\tens T_d\\cdot\\tens T_d$; con $\\tens T\\cdot\\tens I=\\operatorname{tr}\\tens T$ e $\\tens I\\cdot\\tens I=3$ si arriva alla forma in principali; $\\varphi_d(\\sigma_L,0,0)=\\frac{\\sigma_L^2}{6\\mu}$ dà il Teo 6.5.3.

**Osservazioni:** allo stato di Huber tutte le differenze sono nulle, $\\sigma_{id}=0$: nessuna crisi (**pressure insensitive**, come Tresca). Va bene per l'acciaio. A segni invertiti (trazione uniforme) nella realtà c'è rottura fragile per decoesione, ma von Mises dà 0. **Procedura:** $\\sigma_m=\\frac13\\operatorname{tr}\\tens T$; se $\\sigma_m\\le0$ von Mises, se $\\sigma_m>0$ Beltrami.`,
    pitfalls: ['Dimenticare che le parti sferica e deviatorica sono ortogonali: è ciò che annulla l’accoppiamento.', 'Pensare che von Mises sia adatto alla trazione idrostatica: dà σ_id = 0.', 'Confondere von Mises con Tresca: entrambi dipendono dalle differenze delle principali, ma non coincidono.'],
    visual: { kind: 'criteri3d', scene: { mode: 'spazio', stato: 'generico', show: ['vonMises', 'tresca'] } },
    recall: [
      { id: 'c8.5-q1', kind: 'scelta', q: 'Perché per un isotropo l’energia si scompone in parte sferica e deviatorica senza accoppiamento?', options: ['Perché $\\tens T_s\\cdot\\tens E_d=0$: sferico e deviatorico sono ortogonali', 'Perché $\\mu=0$', 'Perché il materiale è incomprimibile', 'Perché $\\tens E$ è diagonale'], correct: 0, why: '§6.5.1.', source: D(6, '6.5.1', 'Teo 6.5.1', 152) },
      { id: 'c8.5-q2', kind: 'vf', q: 'Il criterio di von Mises è insensibile alla pressione idrostatica.', answer: true, why: '§6.5.3: allo stato di Huber le differenze sono nulle.', source: D(6, '6.5.3', undefined, 153) },
      { id: 'c8.5-q3', kind: 'aperta', q: 'Quando si usa von Mises e quando Beltrami, secondo la dispensa?', answer: 'Si calcola $\\sigma_m=\\frac13\\operatorname{tr}\\tens T$: se $\\sigma_m\\le0$ von Mises, se $\\sigma_m>0$ Beltrami, perché con trazione prevalente von Mises non coglie la rottura per decoesione (§6.5.3).', source: D(6, '6.5.3', undefined, 154) },
    ],
  },
  {
    id: 'c8.6',
    module: 'm8',
    title: 'Criterio di Mohr–Coulomb',
    prereq: ['c8.2', 'c3.9'],
    source: D(6, '6.6', undefined, '154–155'),
    meaning: 'Per materiali con crisi di tipo attritivo la resistenza a taglio cresce con la compressione: |τ| < c − σ tan φ. Nel piano di Mohr il dominio è compreso tra due semirette; la verifica si fa con il cerchio massimo.',
    formulas: [
      { tex: '|\\tau|<c-\\sigma\\tan\\phi', label: 'Mohr–Coulomb', rif: '§6.6' },
      { tex: 'F=\\max_{i,j}\\big\\{|s_i-s_j|+(s_i+s_j)\\sin\\phi\\big\\}\\le2c\\cos\\phi', label: 'in tensioni principali', rif: '§6.6' },
    ],
    explanation: `Crisi di natura **attritiva**, con **due parametri**: la **coesione** $c$ e l'**angolo di attrito interno** $\\phi$.

**Attrito puro** (Coulomb, Settecento): un blocco non scivola se $T<-N\\tan\\phi$ (resistenza solo con compressione); localmente, nessuna crisi se $\\tau<-\\sigma\\tan\\phi$. **Con coesione** c'è resistenza anche con $N=0$: **Mohr–Coulomb** (1900), $|\\tau|<c-\\sigma\\tan\\phi$.

**Nel piano di Mohr:** due semirette per $(c/\\tan\\phi,0)$ e $(0,\\pm c)$; il dominio di resistenza sta tra di esse. Tutti gli stati in un punto stanno nell'**arbelo**, i più gravosi sul **cerchio massimo**: interno, nessuna crisi; tangente, crisi imminente; esterno, stato incompatibile.

**In tensioni principali** non c'è una tensione ideale semplice: $F=\\max\\{|s_i-s_j|+(s_i+s_j)\\sin\\phi\\}\\le2c\\cos\\phi$. **Verifica:** il cerchio massimo ha centro $\\frac{s_1+s_3}2$ e raggio $\\frac{s_1-s_3}2$; la condizione «distanza dalla semiretta ≥ raggio» dà $(s_1-s_3)+(s_1+s_3)\\sin\\phi\\le2c\\cos\\phi$, e la coppia (1,3) dà il massimo.`,
    pitfalls: ['Dimenticare che la resistenza a taglio cresce con la compressione.', 'Verificare con un cerchio qualsiasi invece che con il cerchio massimo.', 'Cercare una tensione ideale semplice: per Mohr–Coulomb non c’è.'],
    visual: { kind: 'svg', id: 'criteri', params: { tab: 'mohr' } },
    recall: [
      { id: 'c8.6-q1', kind: 'scelta', q: 'Quali sono i due parametri del criterio di Mohr–Coulomb?', options: ['Coesione c e angolo di attrito φ', 'E e ν', 'σ_L^t e σ_L^c', 'μ e λ'], correct: 0, why: '§6.6.', source: D(6, '6.6', undefined, 154) },
      { id: 'c8.6-q2', kind: 'vf', q: 'Per la verifica di Mohr–Coulomb basta controllare il cerchio massimo.', answer: true, why: '§6.6: gli stati più gravosi stanno sul cerchio massimo dell’arbelo.', source: D(6, '6.6', undefined, 155) },
      { id: 'c8.6-q3', kind: 'aperta', q: 'Ricava la condizione in tensioni principali.', answer: 'Il cerchio massimo ha centro $C=\\frac{s_1+s_3}2$ e raggio $R=\\frac{s_1-s_3}2$; la sua distanza dalla retta $\\tau=c-\\sigma\\tan\\phi$ è $(c-C\\tan\\phi)\\cos\\phi$; imponendo che sia almeno $R$: $(s_1-s_3)+(s_1+s_3)\\sin\\phi\\le2c\\cos\\phi$ (§6.6).', source: D(6, '6.6', undefined, 155) },
    ],
  },
  {
    id: 'c8.7',
    module: 'm8',
    title: 'Tensioni ideali alla Saint-Venant, travature, verifica e progetto',
    prereq: ['c8.5', 'c8.3', 'c7.1', 'c6.7'],
    source: D(6, '6.7–6.9', undefined, '155–158'),
    meaning: 'Negli stati di Saint-Venant ci sono solo σ_z e le tangenziali sulla sezione: le tensioni ideali hanno formule chiuse. Nelle travature si usa Saint-Venant nelle parti regolari: CdS dall’analisi strutturale, tensioni con Saint-Venant, verifica con i criteri.',
    formulas: [
      { tex: '\\sigma_{id}^{Tresca}=\\sqrt{\\sigma_z^2+4\\tau_z^2},\\qquad\\sigma_{id}^{vM}=\\sqrt{\\sigma_z^2+3\\tau_z^2}', label: 'Tresca e von Mises', rif: '§6.7' },
      { tex: '\\sigma_{id}^{t,c}=\\frac{1-\\nu}2\\sigma_z\\pm\\frac{1+\\nu}2\\sqrt{\\sigma_z^2+4\\tau_z^2}', label: 'Grashof (ν di Poisson)', rif: '§6.7' },
    ],
    explanation: `**Stati alla Saint-Venant** (§6.7): $[\\tens T_{es}]$ ha solo $\\tau_{zx}$, $\\tau_{zy}$, $\\sigma_z$; con $\\tau_z^2=\\tau_{zx}^2+\\tau_{zy}^2$ lo stato è al più biassiale, con principali $\\frac{\\sigma_z}2\\pm\\frac12\\sqrt{\\sigma_z^2+4\\tau_z^2}$ e una nulla. Attenzione: qui la dispensa chiama $s_{1,2}$ le due non nulle e $s_3$ quella nulla, «che sta tra le due» (NF-09): gli indici sono nomi, non un ordinamento.

Tresca: differenza tra le due non nulle. Von Mises: con $s_1^2+s_2^2=\\sigma_z^2+2\\tau_z^2$ si trova $\\sigma_z^2+3\\tau_z^2$. Grashof: $s_1-\\nu s_2$ e $s_2-\\nu s_1$ (negli appunti i coefficienti erano scambiati; controprova: puro taglio, $\\sigma_{id}^t=(1+\\nu)\\tau_z$). Tresca e von Mises per i duttili, Grashof per i fragili.

**Travature** (§6.8): un capannone ha assi curvi, sezioni variabili, carichi sul mantello: non è un solido di Saint-Venant. Ma nelle **parti regolari** (regioni B) lo stato di tensione di una sezione è quello del solido di Saint-Venant con le **stesse CdS**; altrove procedimenti specifici. Atteggiamento: CdS con l'analisi strutturale → $\\tens T$ con Saint-Venant → verifica con i criteri.

**Verifica e progetto** (§6.9): verifica con tutto assegnato; progetto con la forma nota a meno di un parametro $a$. Passi: CdS; **sezioni critiche**; **punti pericolosi** (lembi con $\\sigma$ massima e $\\tau=0$, attacco ala–anima prima e dopo il salto, corda baricentrica con $\\tau$ massima); verifiche punto per punto in tabella. Nel progetto, **predimensionamento a flessione** sulla sezione con $|M|_{\\max}$ ($|\\sigma_z|_{\\max}\\le\\sigma_{adm}\\Rightarrow a_{\\min}$), poi si arrotonda in eccesso e si verifica, considerando anche una sezione con taglio.`,
    pitfalls: ['Prendere per ordinati gli indici di §6.7: la principale nulla sta tra le due (NF-09).', 'Verificare solo i lembi: all’attacco ala–anima σ e τ sono entrambe grandi.', 'Applicare Saint-Venant nei nodi o dove ci sono carichi sul mantello.'],
    visual: { kind: 'svg', id: 'jourawski', params: { section: 'T' } },
    recall: [
      { id: 'c8.7-q1', kind: 'scelta', q: 'Qual è la tensione ideale di von Mises per uno stato alla Saint-Venant?', options: ['$\\sqrt{\\sigma_z^2+3\\tau_z^2}$', '$\\sqrt{\\sigma_z^2+4\\tau_z^2}$', '$\\sigma_z+\\tau_z$', '$\\sqrt{\\sigma_z^2+\\tau_z^2}$'], correct: 0, why: '§6.7.', source: D(6, '6.7', undefined, 155) },
      { id: 'c8.7-q2', kind: 'vf', q: 'Nella verifica di una trave a T i punti dell’attacco ala–anima vanno controllati.', answer: true, why: '§6.9: σ ancora grande e τ con il salto di Jourawski.', source: D(6, '6.9', undefined, 158) },
      { id: 'c8.7-q3', kind: 'aperta', q: 'Come si usa Saint-Venant per un telaio che non è un solido di Saint-Venant?', answer: 'Nelle parti regolari (regioni B) lo stato di tensione di una sezione è quello del solido di Saint-Venant con le stesse CdS: si calcolano le CdS con l’analisi strutturale, le tensioni con Saint-Venant e si verifica con i criteri; nei nodi e nelle discontinuità servono procedimenti specifici (§6.8).', source: D(6, '6.8', undefined, 157) },
    ],
  },
];
