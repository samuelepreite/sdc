/**
 * Lezioni guidate del Modulo 4 (Cap. 4, §4.1–4.11). Derivazioni solo dove la dispensa le sviluppa; le righe con `val`
 * sono verificate su 25 campioni casuali (tests/lezioni.test.ts).
 */
import { D } from '../../engine/types';
import * as T from '../../engine/tensor';
import * as El from '../../engine/elastico';
import type { Lesson, LessonVisual } from '../types';

type R = Record<string, number>;
const mat = (v: R, p: string): T.Mat => Array.from({ length: 9 }, (_, k) => v[`${p}${k}`]);
const putMat = (o: R, p: string, A: T.Mat) => A.forEach((a, k) => (o[`${p}${k}`] = a));
const SVG = (id: 'prove' | 'voigt' | 'cammino' | 'simmetrie4' | 'divergenza', params?: Record<string, string | number | boolean>): LessonVisual => ({ kind: 'svg', id, params });

/** campi per il lemma: T lineare e u quadratico, ricostruiti dal campione */
const lemmaSample = (r: () => number): R => {
  const o: R = {};
  for (let k = 0; k < 9; k++) o[`p${k}`] = 4 * r() - 2;
  for (let k = 0; k < 27; k++) o[`q${k}`] = 4 * r() - 2;
  for (let k = 0; k < 3; k++) o[`a${k}`] = 4 * r() - 2;
  for (let k = 0; k < 9; k++) {
    o[`b${k}`] = 4 * r() - 2;
    o[`c${k}`] = 4 * r() - 2;
  }
  return o;
};
const fields = (v: R) => {
  const Tf: El.LinTen = { p: Array.from({ length: 9 }, (_, k) => v[`p${k}`]), q: Array.from({ length: 27 }, (_, k) => v[`q${k}`]) };
  const u: El.QuadVec = { a: [v.a0, v.a1, v.a2], b: Array.from({ length: 9 }, (_, k) => v[`b${k}`]), c: Array.from({ length: 9 }, (_, k) => v[`c${k}`]) };
  return { Tf, u };
};
/** tensore elastico con simmetria maggiore costruito dal campione (81 numeri) */
const A81 = (v: R) => El.symmetrize4(Array.from({ length: 81 }, (_, k) => v[`A${k}`]), true);
/** lavoro lungo il cammino E(α) = E1 + α(E2 − E1) + α(1 − α)C con derivata esatta; Simpson (integranda cubica: esatto) */
const workQuad = (A: number[], E1: T.Mat, E2: T.Mat, C: T.Mat) => {
  const E = (a: number) => T.add(T.add(E1, T.scale(T.sub(E2, E1), a)), T.scale(C, a * (1 - a)));
  const dE = (a: number) => T.add(T.sub(E2, E1), T.scale(C, 1 - 2 * a));
  const g = (a: number) => T.ddot(T.apply4(A, E(a)), dE(a));
  return (g(0) + 4 * g(0.5) + g(1)) / 6;
};

const N36 = T.distinctComponents({ minor1: true, minor2: true });
const N21 = T.distinctComponents({ minor1: true, minor2: true, major: true });

export const M4_LEZIONI: Lesson[] = [
  // ================================================================== c4.0 (facoltativo)
  {
    concept: 'c4.0',
    title: 'Le linee isostatiche (facoltativo)',
    minutes: 10,
    source: D(4, '4.1', undefined, 66),
    visual: { kind: 'tensione3d', scene: { mode: 'principali', preset: 'generico', presets: ['generico', 'esercizio'], controls: ['preset'] } },
    steps: [
      {
        id: 'l40-1',
        kind: 'spiega',
        title: 'Dalla tensione in un punto al corpo intero',
        md: `La dispensa presenta questo argomento come approfondimento **non richiesto all'orale** (§4.1): lo trovi qui solo per completezza.

In ogni punto del corpo si segnano le direzioni principali di tensione massima e minima, come quelle del modello. Ripetendo l'operazione in ogni punto si costruiscono due famiglie di curve tangenti a quelle direzioni: le **linee isostatiche** (nello spazio c'è una terza famiglia, delle principali medie).

Come le curve di livello di una carta topografica, sono più fitte dove la tensione è maggiore. Mostrano come i carichi fluiscono e dove conviene mettere la materia (il telaio di una moto).`,
      },
      {
        id: 'l40-2',
        kind: 'domanda',
        q: { id: 'l40-q1', kind: 'vf', q: 'Le isostatiche sono tangenti alle direzioni principali di tensione.', answer: true, why: '§4.1.' },
      },
      { id: 'l40-3', kind: 'riassunto', md: '**In una frase:** le isostatiche sono le curve tangenti alle direzioni principali di tensione; più fitte dove la tensione è maggiore, guidano il progetto. Argomento facoltativo.' },
    ],
  },
  // ================================================================== c4.1
  {
    concept: 'c4.1',
    title: 'Il teorema dei lavori virtuali',
    minutes: 20,
    source: D(4, '4.2–4.3', 'Teo 4.2.1, Teo 4.3.4', '67–69'),
    visual: SVG('divergenza'),
    steps: [
      {
        id: 'l41-1',
        kind: 'spiega',
        title: 'Il lavoro unisce statica e cinematica',
        md: `Finora deformazione (enti cinematici) e tensione (enti statici) sono state studiate separatamente. Il concetto che le mette in comunicazione è il **lavoro**: forza per spostamento.

Il **teorema dei lavori virtuali** le collega **senza** alcun nesso di causalità: non dice che certe deformazioni sono prodotte da certe forze. L'unico requisito è che si riferiscano allo stesso corpo. Il nesso di causa ed effetto arriverà con il **legame costitutivo**, l'espressione matematica della natura del materiale (§4.2).`,
      },
      {
        id: 'l41-2',
        kind: 'derivazione',
        title: 'Lemma fondamentale',
        md: 'Per $\\tens T(x)$ e $\\vet u(x)$ regolari qualsiasi, con $\\tens H=\\nabla\\vet u$. Il campione è il cubo unitario con $\\tens T$ lineare e $\\vet u$ quadratico: gli integrali sono calcolati davvero (quadratura di Gauss, esatta per questi polinomi).',
        source: D(4, '4.2.1', 'Teo 4.2.1', 67),
        der: {
          sample: lemmaSample,
          lines: [
            { tex: '\\int_{\\partial\\mathcal B}\\tens T\\hat n\\cdot\\vet u\\,dA', why: 'Il termine di superficie.', val: (v) => { const { Tf, u } = fields(v); return El.lemmaTerms(Tf, u)[0]; } },
            {
              tex: '=\\int_{\\partial\\mathcal B}\\tens T^T\\vet u\\cdot\\hat n\\,dA',
              why: 'Definizione di trasposto: $\\tens T\\hat n\\cdot\\vet u=\\tens T^T\\vet u\\cdot\\hat n$.',
              val: (v) => { const { Tf, u } = fields(v); return El.lemmaTerms(Tf, u)[0]; },
            },
            {
              tex: '=\\int_{\\mathcal B}\\operatorname{div}(\\tens T^T\\vet u)\\,dV',
              why: 'Teorema della divergenza per il campo vettoriale $\\tens T^T\\vet u$ (Teo 1.8.4).',
              ask: { q: 'Quale teorema trasforma l\'integrale di superficie in uno di volume?', options: ['Il teorema della divergenza', 'Il lemma di Cauchy', 'Il teorema di Schwarz', 'Il teorema spettrale'], correct: 0, why: 'Teo 1.8.4: $\\int_{\\partial D}\\vet w\\cdot\\hat n=\\int_D\\operatorname{div}\\vet w$.' },
              val: (v) => { const { Tf, u } = fields(v); const [, a, b] = El.lemmaTerms(Tf, u); return a + b; },
            },
            { tex: '=\\int_{\\mathcal B}\\operatorname{div}\\tens T\\cdot\\vet u\\,dV+\\int_{\\mathcal B}\\tens T\\cdot\\tens H\\,dV', why: 'Identità $\\operatorname{div}(\\tens T^T\\vet u)=\\operatorname{div}\\tens T\\cdot\\vet u+\\tens T\\cdot\\nabla\\vet u$ (derivata del prodotto).', val: (v) => { const { Tf, u } = fields(v); const [, a, b] = El.lemmaTerms(Tf, u); return a + b; }, eq: 'Teo 4.2.1' },
          ],
        },
      },
      {
        id: 'l41-3',
        kind: 'spiega',
        title: 'Che cosa significano i tre termini',
        md: `Se $\\tens T$ è in equilibrio con i carichi:
1. $\\int_{\\partial\\mathcal B}\\tens T\\hat n\\cdot\\vet u$ è il lavoro delle forze di superficie ($\\hat{\\vet s}=\\tens T\\hat n$ sulla frontiera) per gli spostamenti dei loro punti;
2. $\\int_{\\mathcal B}\\operatorname{div}\\tens T\\cdot\\vet u$ è, a meno del segno ($\\operatorname{div}\\tens T=-\\vet b$), il lavoro delle forze di volume;
3. $\\int_{\\mathcal B}\\tens T\\cdot\\tens H$ è il **lavoro di deformazione**: tensioni per spostamenti associati alla deformazione.

Ricorda la conservazione dell'energia: quanto lavoro le forze esterne forniscono al corpo, tanto è il lavoro delle forze interne.`,
      },
      {
        id: 'l41-4',
        kind: 'spiega',
        title: 'FT equilibrato, SD congruente',
        md: `**Def 4.3.1.** Un sistema **forze–tensioni equilibrato** $\\mathrm{FT}=\\{\\vet b,\\hat{\\vet s},\\tens T\\}$: $\\operatorname{div}\\tens T+\\vet b=\\vet 0$ nell'interno, $\\tens T\\in\\mathrm{Sym}$, $\\tens T\\hat n=\\hat{\\vet s}$ sulla frontiera.

**Def 4.3.2.** Un sistema **spostamenti–deformazioni congruente** (o virtuale) $\\mathrm{SD}=\\{\\vet u,\\tens E\\}$: $\\vet u$ ammissibile e infinitesimo, $\\tens E=\\frac12(\\nabla\\vet u+\\nabla\\vet u^T)$.

- **virtuale**: ipotetico, non compiuto davvero; uno spostamento di prova per saggiare l'equilibrio;
- **cinematicamente ammissibile**: rispetta i vincoli e genera deformazioni congruenti;
- **congruenti**: ottenibili da uno spostamento continuo e derivabile.

**Def 4.3.3.** $L^{EST}_v=\\int\\vet b\\cdot\\vet u\\,dV+\\int\\hat{\\vet s}\\cdot\\vet u\\,dA$, $L^{INT}_v=\\int\\tens T\\cdot\\tens E\\,dV$.`,
      },
      {
        id: 'l41-5',
        kind: 'derivazione',
        title: 'Teorema dei lavori virtuali',
        md: 'Si parte dal lemma e si usano le proprietà di FT. Catena di passaggi logici.',
        source: D(4, '4.3.2', 'Teo 4.3.4', '68–69'),
        der: {
          lines: [
            { tex: '\\int_{\\partial\\mathcal B}\\tens T\\hat n\\cdot\\vet u\\,dA=\\int_{\\mathcal B}\\operatorname{div}\\tens T\\cdot\\vet u\\,dV+\\int_{\\mathcal B}\\tens T\\cdot\\tens H\\,dV', why: 'Lemma fondamentale.' },
            {
              tex: '\\int_{\\partial\\mathcal B}\\hat{\\vet s}\\cdot\\vet u\\,dA=-\\int_{\\mathcal B}\\vet b\\cdot\\vet u\\,dV+\\int_{\\mathcal B}\\tens T\\cdot\\tens H\\,dV',
              why: 'FT equilibrato: $\\tens T\\hat n=\\hat{\\vet s}$ sulla frontiera, $\\operatorname{div}\\tens T=-\\vet b$ nell\'interno.',
            },
            {
              tex: '\\tens T\\cdot\\tens H=\\tens T\\cdot(\\tens E+\\tens W)=\\tens T\\cdot\\tens E',
              why: '$\\tens T$ è simmetrico e $\\mathrm{Sym}\\perp\\mathrm{Skw}$: $\\tens T\\cdot\\tens W=0$.',
              ask: { q: 'Perché sparisce $\\tens T\\cdot\\tens W$?', options: ['Perché $\\tens T$ è simmetrico e Sym è ortogonale a Skw', 'Perché $\\tens W$ è nullo', 'Perché $\\vet u$ è infinitesimo', 'Per il teorema della divergenza'], correct: 0, why: 'Prop 1.6.3: $\\tens E\\cdot\\tens W=0$ per ogni simmetrico e antisimmetrico.' },
            },
            { tex: '\\int_{\\partial\\mathcal B}\\hat{\\vet s}\\cdot\\vet u\\,dA+\\int_{\\mathcal B}\\vet b\\cdot\\vet u\\,dV=\\int_{\\mathcal B}\\tens T\\cdot\\tens E\\,dV', why: 'Si porta a sinistra il lavoro delle forze di volume: $L^{EST}_v=L^{INT}_v$, per qualsiasi FT equilibrato e SD congruente.', eq: 'Teo 4.3.4' },
          ],
        },
      },
      {
        id: 'l41-6',
        kind: 'spiega',
        title: 'Osservazioni',
        md: `1. **Corpo rigido.** La rigidità è un vincolo: ammette solo spostamenti rigidi, con $\\tens E=\\tens O$. Allora $L^{INT}_v=0$ e $L^{EST}_v=0$.
2. Vale per **qualsiasi** coppia FT–SD, anche scollegata; se si prende la coppia «vera» vale comunque.
3. **Dimensioni:** $[\\tens T]=[F][L^{-2}]$, $\\tens E$ adimensionale, $dV=[L^3]$: un lavoro.
4. **Identità triangolare:** equilibrio, congruenza, TLV; due vertici danno il terzo.
5. **Principio o teorema?** Con l'equilibrio introdotto come assioma (scuola italiana e statunitense) il TLV è un teorema. La scuola francese assume come assioma l'identità dei lavori virtuali (**principio**) e ne ricava l'equilibrio.`,
      },
      {
        id: 'l41-7',
        kind: 'domanda',
        q: { id: 'l41-q1', kind: 'scelta', q: 'Che cosa serve al sistema SD per poter applicare il TLV?', options: ['Essere congruente: $\\vet u$ ammissibile e infinitesimo, $\\tens E=\\operatorname{sym}\\nabla\\vet u$', 'Essere causato dalle tensioni di FT', 'Avere $\\tens E$ definito positivo', 'Essere rigido'], correct: 0, why: 'Def 4.3.2 e Teo 4.3.4.' },
      },
      {
        id: 'l41-8',
        kind: 'riassunto',
        md: `**In una frase:** per un FT equilibrato e un SD congruente qualsiasi, lavoro virtuale esterno = lavoro virtuale interno; si ricava dal lemma fondamentale con il teorema della divergenza.

- Lemma: superficie = volume (div T · u) + deformazione (T · H).
- Con FT equilibrato: $\\tens T\\hat n=\\hat{\\vet s}$, $\\operatorname{div}\\tens T=-\\vet b$, $\\tens T\\cdot\\tens H=\\tens T\\cdot\\tens E$.
- Corpo rigido: lavoro esterno nullo.`,
        orale: ['Lemma fondamentale: enunciato, dimostrazione, significato dei termini. (dispensa, domanda 1)', 'Teorema dei lavori virtuali: FT e SD, enunciato, dimostrazione, osservazioni. (dispensa, domanda 2)'],
      },
    ],
  },
  // ================================================================== c4.2
  {
    concept: 'c4.2',
    title: 'Che cos’è un legame costitutivo',
    minutes: 14,
    source: D(4, '4.4', 'Def 4.4.1–4.4.5', '69–73'),
    visual: SVG('prove', { tab: 'tempo' }),
    steps: [
      {
        id: 'l42-1',
        kind: 'spiega',
        title: 'Il materiale entra in scena',
        md: `L'analisi della deformazione ha come descrittore $\\tens E$, quella della tensione $\\tens T$. Ora interessa metterli in relazione, e questo dipende dal **materiale**: tre travi uguali di legno, acciaio e ferro con lo stesso barile da 100 kg si deformano in modo diverso.

La meccanica dei continui usa una descrizione **fenomenologica**: si osserva il comportamento macroscopico, non come atomi e cristalli producono la deformazione. La materia è un mezzo continuo e le grandezze sono campi.

**Def 4.4.1.** L'**elemento di volume rappresentativo** (RVE) contiene tanti costituenti microscopici da rendere statisticamente irrilevante la loro distribuzione interna. Dipende dal materiale: metalli (millimetri), legno (centimetri, per le fibre), muratura (metri, per conci e giunti). Sotto il micron (microattuatori, cellule) il continuo non vale.`,
      },
      {
        id: 'l42-2',
        kind: 'spiega',
        title: 'Elastico, elastico lineare, iperelastico',
        md: `La prova fondamentale è la **trazione**: si misura l'allungamento del tratto utile $L_0$ al crescere della forza.

**Def 4.4.2 (elastico):** la risposta non dipende dal tempo e la deformazione è reversibile: scaricando si ripercorre la curva fino all'origine. A uno sforzo corrisponde una e una sola deformazione, $\\tens T=\\hat{\\tens T}(\\tens E)$. Una curva di carico crescente non basta: bisogna verificare lo scarico e l'indipendenza dal tempo.

**Def 4.4.3 (elastico lineare):** la relazione è lineare (legge di Hooke, *ut tensio sic vis*): $\\tens T=\\mathbb A\\tens E$, con $\\mathbb A$ tensore elastico del IV ordine.

**Def 4.4.4 (iperelastico):** oltre alla reversibilità meccanica c'è quella **termodinamica**: viene restituita l'energia spesa. Nella modellazione standard i materiali sono quasi sempre iperelastici.`,
      },
      {
        id: 'l42-3',
        kind: 'spiega',
        title: 'Plastico e viscoso',
        md: `**Def 4.4.5 (elasto-plastico):** indipendente dal tempo, ma scaricando la deformazione non rientra tutta: rientra la parte **elastica**, resta quella **plastica**. Termodinamicamente irreversibile. Se non rientra nulla, il comportamento è **plastico**.

**Viscoso o viscoelastico:** la risposta evolve nel tempo per dissipazione interna (calore, attriti, riassestamenti).
- **creep** (scorrimento viscoso): a **forza imposta** la deformazione cresce nel tempo (il cavo polimerico, il calcestruzzo sotto carichi permanenti);
- **rilassamento**: a **deformazione imposta** la forza cala nel tempo (le corde della chitarra che si scordano).`,
      },
      {
        id: 'l42-4',
        kind: 'prova',
        title: 'Creep e rilassamento a confronto',
        md: 'Il diagramma mostra le due prove con il tempo in ascissa.',
        tasks: ['In alto: forza costante, deformazione che cresce (creep).', 'In basso: deformazione costante, forza che diminuisce (rilassamento).'],
        visual: SVG('prove', { tab: 'tempo' }),
      },
      {
        id: 'l42-5',
        kind: 'spiega',
        title: 'Quale modello scegliere',
        md: `Non esiste un modello universale (§4.4.3): si usa il più semplice che sia descrittivo e predittivo. La scelta dipende soprattutto dal **campo di sollecitazioni** e dalle condizioni d'esercizio:
- carrozzeria sotto i carichi d'esercizio: niente deformazioni permanenti, modello **elastico**;
- assorbimento di energia in un urto: conviene che si plasticizzi, modello **elasto-plastico**;
- alta temperatura: modello **viscoso**;
- problemi complessi: elasto-plasto-viscosi.

Il corso studia l'elasticità lineare: la maggior parte degli oggetti si progetta così.`,
      },
      {
        id: 'l42-6',
        kind: 'domanda',
        q: { id: 'l42-q1', kind: 'scelta', q: 'Scaricando un provino resta una deformazione permanente, ma la risposta non dipende dal tempo. Il comportamento è…', options: ['elasto-plastico', 'viscoso', 'iperelastico', 'elastico lineare'], correct: 0, why: 'Def 4.4.5.' },
      },
      {
        id: 'l42-7',
        kind: 'riassunto',
        md: `**In una frase:** il legame costitutivo, descritto in modo fenomenologico su un RVE, classifica i materiali in elastici (lineari, iperelastici), elasto-plastici e viscosi (creep, rilassamento); si sceglie il modello più semplice adatto all'uso.`,
        orale: ['Perché serve il legame costitutivo; descrizione fenomenologica e RVE. (dispensa, domanda 3)', 'Classificazione dei comportamenti: elastico, elastico lineare, iperelastico, elasto-plastico, viscoso; scelta del modello. (dispensa, domanda 4)'],
      },
    ],
  },
  // ================================================================== c4.3
  {
    concept: 'c4.3',
    title: 'In laboratorio: acciaio e calcestruzzo',
    minutes: 18,
    source: D(4, '4.5–4.7', undefined, '73–77'),
    visual: SVG('prove', { tab: 'acciaio' }),
    steps: [
      {
        id: 'l43-1',
        kind: 'spiega',
        title: 'La prova di trazione sull’acciaio',
        md: `Un provino di sezione $A_0$ in trazione; si studia il tratto utile $L_0$, lontano dalle ganasce, dove lo stato è monoassiale (§4.5).

- **Tratto elastico:** lineare fino al carico limite di proporzionalità $F_p$, poi per un breve tratto elastico non lineare fino al carico di snervamento $F_y$ (yielding). Scaricando si torna all'origine.
- **Snervamento:** con oscillazioni, il materiale si deforma a carico circa costante: sembra aver perso rigidezza. Scaricando resta una deformazione residua. Ricaricando, snerva di nuovo solo al massimo carico raggiunto.
- **Incrudimento:** torna a portare incrementi di carico, con rigidezza più bassa.
- **Rottura:** dopo il picco $F_t$, una caduta ripida fino alla separazione in due tronconi.`,
      },
      {
        id: 'l43-2',
        kind: 'prova',
        title: 'Carica e scarica',
        md: 'Sposta il punto da cui si scarica: la retta verde scende con la pendenza del tratto elastico.',
        tasks: ['Scarica dal tratto elastico (ΔL < 1): torni all\'origine.', 'Scarica dallo snervamento o dall\'incrudimento: resta un allungamento residuo.', 'Accendi la curva «reale»: la tensione con la sezione vera cresce sempre (hardening).'],
        visual: SVG('prove', { tab: 'acciaio', scarico: 8 }),
      },
      {
        id: 'l43-3',
        kind: 'spiega',
        title: 'Linee di Lüders e strizione',
        md: `**Linee di Lüders** (§4.5.1). Con una vernice screpolante, durante lo snervamento la vernice non si crepa né in orizzontale né lungo l'asse, ma lungo linee a **45°**. Dal cerchio di Mohr dello stato monoassiale, a 45° ci sono le giaciture di tangenziale massima: la crisi arriva quando questa supera un limite, con micro-scorrimenti interni che si traducono in un allungamento.

**Strizione** (§4.5.2). Vicino al carico di rottura, le inclusioni indeboliscono il materiale e alcuni tratti si deformano più degli altri: **localizzazione della deformazione**. Nella zona più debole si forma un collo (necking), dove avverrà la rottura, non prevedibile a priori. Un estensimetro lontano non la vede; la correlazione d'immagini (DIC) sì.`,
      },
      {
        id: 'l43-4',
        kind: 'spiega',
        title: 'Dal diagramma F–ΔL al diagramma σ–ε',
        md: `Ipotizzando il carico uniforme sul tratto utile: $\\sigma=F/A_0$, $\\varepsilon=\\Delta L/L_0$. Nel tratto lineare $\\sigma=E\\varepsilon$, con $E$ **modulo di Young** (per gli acciai circa 205 000 MPa, cioè 205 GPa; gli appunti scrivevano GPa per errore).

Ma la sezione si restringe ($\\sigma_R=F/A>F/A_0$) e $\\Delta L/L_0$ è una media che ignora la strizione. La curva reale mostra **hardening**: la tensione cresce sempre, nessun softening. Perché allora la norma usa $A_0$? Per una procedura ripetibile in qualunque laboratorio, che dà parametri di confronto universali.

Acciai ad **alto tenore di carbonio** (armonici): stesso $E$, resistenza molto più alta, poca deformabilità plastica, snervamento non visibile; si usa una tensione convenzionale allo 0,2% di allungamento residuo.`,
      },
      {
        id: 'l43-5',
        kind: 'prova',
        title: 'Calcestruzzo: carico o deformazione controllati',
        md: 'Due prove di compressione sullo stesso calcestruzzo.',
        tasks: ['A controllo di carico (acqua in un contenitore, macchina idraulica): al picco il provino esplode.', 'A controllo di deformazione (torchio a vite): oltre il picco compare un ramo che scende, il softening.'],
        visual: SVG('prove', { tab: 'calcestruzzo', controllo: 'deformazione' }),
      },
      {
        id: 'l43-6',
        kind: 'spiega',
        title: 'Softening e rottura fragile',
        md: `Il softening spiega la rottura dei materiali lapidei (§4.6). In un punto di una muratura che ha superato il picco il materiale continua a deformarsi ma porta meno carico; il carico ceduto passa ai punti vicini, che entrano in crisi e cedono a loro volta. La rottura è **fragile**, senza i segnali premonitori della rottura **duttile** dell'acciaio.

**Altri aspetti** (§4.7): l'acciaio si comporta allo stesso modo in trazione e compressione, il calcestruzzo no. E la risposta può dipendere dalla direzione: in un FRP 0/90 i provini a 0° e 90° coincidono, quello a 45° no.`,
      },
      {
        id: 'l43-7',
        kind: 'domanda',
        q: { id: 'l43-q1', kind: 'vf', q: 'La curva σ–ε reale dell’acciaio mostra softening dopo il picco.', answer: false, why: '§4.5.3: con la sezione reale la tensione cresce sempre (hardening); il ramo discendente della curva della norma viene da $A_0$.' },
      },
      {
        id: 'l43-8',
        kind: 'riassunto',
        md: `**In una frase:** l'acciaio passa per elastico, snervamento (Lüders a 45°), incrudimento e strizione, con rottura duttile; il calcestruzzo, a deformazione controllata, mostra il softening che spiega la rottura fragile.

- $\\sigma=F/A_0$, $\\varepsilon=\\Delta L/L_0$, $\\sigma=E\\varepsilon$; la norma non dà la curva reale.
- Carico controllato: esplosione; deformazione controllata: softening.`,
        orale: ['Prova di trazione sull’acciaio: tratti, linee di Lüders, strizione, passaggio a σ–ε, perché si usa la curva della norma. (dispensa, domanda 5)', 'Prova di compressione sul calcestruzzo: controllo di carico e di deformazione, softening, rottura fragile. (dispensa, domanda 6)'],
      },
    ],
  },
  // ================================================================== c4.4
  {
    concept: 'c4.4',
    title: 'Il tensore elastico',
    minutes: 14,
    source: D(4, '4.8', 'Def 4.8.1', '77–78'),
    visual: SVG('simmetrie4', { minor1: true, minor2: true }),
    steps: [
      {
        id: 'l44-1',
        kind: 'spiega',
        title: 'Elastico e lineare: le ipotesi',
        md: `**Elastico** (§4.8):
1. lo sforzo in $x$ dipende solo dalla deformazione **attuale** (niente memoria del passato, a differenza dello snervamento dell'acciaio) **in $x$** (niente comportamenti non locali);
2. nessuna dipendenza dal tempo.

**Lineare**:
1. $|\\vet u|\\ll1$: si riferisce la tensione ai punti della configurazione di riferimento;
2. $\\|\\tens H\\|\\ll1$: si usa $\\tens E$ come misura di deformazione.

**Def 4.8.1.** $\\tens T(x)=\\mathbb A(x)[\\tens E(x)]$, con $\\mathbb A$ **tensore elastico**. Può cambiare da punto a punto (una roccia stratificata); se il corpo è omogeneo è costante. In componenti $T_{ij}=\\sum_{hk}A_{ijhk}E_{hk}$: 81 **moduli elastici**. Prima di misurarli, conviene chiedersi se sono davvero 81.`,
      },
      {
        id: 'l44-2',
        kind: 'spiega',
        title: 'Le simmetrie minori',
        md: `$\\mathbb A$ manda $\\tens E\\in\\mathrm{Sym}$ in $\\tens T\\in\\mathrm{Sym}$:
- **prima simmetria minore**: $\\mathbb A\\tens A$ è sempre simmetrico, $A_{ijhk}=A_{jihk}$;
- **seconda simmetria minore**: $\\mathbb A\\tens A=\\mathbb A[\\operatorname{sym}\\tens A]$, $A_{ijhk}=A_{ijkh}$, equivalente a $\\mathbb A\\tens W=\\tens O$.

Le coppie $(ij)$ e $(hk)$ prendono ciascuna solo 6 valori distinti: restano **36** componenti indipendenti.

**Per l'orale:** applicando $\\mathbb A$ a $\\tens H=\\tens E+\\tens W$ si ottiene lo stesso che con $\\tens E$: la parte $\\tens W$ (rotazione rigida infinitesima) non produce nulla, come una traslazione. Una rototraslazione rigida non genera tensione: per far nascere uno sforzo serve una deformazione.`,
      },
      {
        id: 'l44-3',
        kind: 'numeri',
        title: 'Il conteggio, fatto dal motore',
        md: `Il motore conta le classi di componenti uguali, una quaterna $(i,j,h,k)$ alla volta: con le due simmetrie minori risultano **${N36}** componenti distinte; aggiungendo la maggiore (prossima lezione) **${N21}**. Nella griglia a destra le caselle dello stesso colore devono valere uguale.`,
        values: { minori: N36, tutte: N21 },
        visual: SVG('simmetrie4', { minor1: true, minor2: true }),
      },
      {
        id: 'l44-4',
        kind: 'spiega',
        title: 'Configurazione di riferimento naturale',
        md: `Se $\\tens E=\\tens O$ (nessuno spostamento, o uno rigido infinitesimo) lo sforzo è nullo. In elasticità lineare si aggiunge l'ipotesi

$$\\tens T_0=\\tens T(\\tens E=\\tens O)=\\tens O:$$

nella configurazione di riferimento non ci sono sforzi residui. È «di riferimento» perché lì $\\tens E=\\tens O$, «naturale» perché non è stressata.`,
      },
      {
        id: 'l44-5',
        kind: 'domanda',
        q: { id: 'l44-q1', kind: 'vf', q: 'La seconda simmetria minore equivale a dire che il tensore elastico annulla ogni tensore antisimmetrico.', answer: true, why: 'Def 1.7.5 e §4.8.1: $\\mathbb A\\tens W=\\tens O$ per ogni $\\tens W\\in\\mathrm{Skw}$.' },
      },
      {
        id: 'l44-6',
        kind: 'riassunto',
        md: `**In una frase:** in elasticità lineare $\\tens T=\\mathbb A\\tens E$ punto per punto; $\\mathbb A$ ha le due simmetrie minori (36 costanti) e i moti rigidi non generano tensione.

- Ipotesi: niente storia, niente non località, niente tempo; piccoli spostamenti e deformazioni.
- Configurazione naturale: $\\tens T_0=\\tens O$.`,
        orale: ['Elasticità lineare: ipotesi, tensore elastico, simmetrie minori (81 → 36), $\\mathbb A\\tens W=\\tens O$, configurazione naturale. (dispensa, domanda 7)'],
      },
    ],
  },
  // ================================================================== c4.5
  {
    concept: 'c4.5',
    title: 'Energia specifica e iperelasticità',
    minutes: 22,
    source: D(4, '4.9', 'Def 4.9.1, Teo 4.9.2', '79–82'),
    visual: SVG('cammino'),
    steps: [
      {
        id: 'l45-1',
        kind: 'spiega',
        title: 'Iperelastico: esiste φ',
        md: `**Def 4.9.1.** In $x$ il materiale è **iperelastico** se esiste $\\varphi:\\mathrm{Sym}\\to\\mathbb R$ con

$$\\tens T=\\frac{\\partial\\varphi(\\tens E)}{\\partial\\tens E},\\qquad\\varphi(\\tens O)=0.$$

$\\varphi$ è l'**energia specifica** (densità) **di deformazione**. In componenti $T_{ij}=\\partial\\varphi/\\partial E_{ij}$: la derivata di uno scalare rispetto a un tensore è un tensore. Dimensionalmente $[\\varphi]=[F][L^{-2}]=$ lavoro / volume.

L'iperelasticità si definisce anche senza linearità. Se il materiale è anche lineare, le componenti indipendenti di $\\mathbb A$ passano da 36 a **21**, come vedremo.`,
      },
      {
        id: 'l45-2',
        kind: 'derivazione',
        title: 'Il lavoro non dipende dal cammino',
        md: 'Un **cammino di deformazione** $\\hat{\\tens E}(\\alpha)$, $\\alpha\\in[\\alpha_1,\\alpha_2]$, porta da $\\tens E_1$ a $\\tens E_2$; a esso corrisponde il cammino di tensione $\\hat{\\tens T}(\\alpha)$. Nel campione: $\\mathbb A$ con la simmetria maggiore e un cammino curvo (parabolico) tra due stati casuali.',
        source: D(4, '4.9.1', undefined, 80),
        der: {
          sample: (r) => { const o: R = {}; for (let k = 0; k < 81; k++) o[`A${k}`] = 2 * r() - 1; putMat(o, 'P', T.sym(T.randMat(r))); putMat(o, 'Q', T.sym(T.randMat(r))); putMat(o, 'C', T.sym(T.randMat(r))); return o; },
          lines: [
            { tex: 'w=\\int_{\\alpha_1}^{\\alpha_2}\\hat{\\tens T}(\\alpha)\\cdot\\dfrac{d\\hat{\\tens E}}{d\\alpha}\\,d\\alpha', why: 'Lavoro specifico: somma dei lavori elementari $dw=\\tens T\\cdot d\\tens E$ lungo il cammino.', val: (v) => workQuad(A81(v), mat(v, 'P'), mat(v, 'Q'), mat(v, 'C')) },
            {
              tex: '=\\int_{\\alpha_1}^{\\alpha_2}\\dfrac{\\partial\\varphi}{\\partial\\tens E}\\Big|_{\\hat{\\tens E}(\\alpha)}\\cdot\\dfrac{d\\hat{\\tens E}}{d\\alpha}\\,d\\alpha=\\int_{\\alpha_1}^{\\alpha_2}\\dfrac{d}{d\\alpha}\\varphi\\big(\\hat{\\tens E}(\\alpha)\\big)\\,d\\alpha',
              why: 'Se $\\varphi$ esiste, $\\tens T=\\partial\\varphi/\\partial\\tens E$, e l\'integranda è la derivata di $\\varphi$ lungo il cammino (regola della catena): un differenziale esatto.',
              ask: { q: 'Che cosa rende l\'integranda un differenziale esatto?', options: ['L\'esistenza di $\\varphi$ con $\\tens T=\\partial\\varphi/\\partial\\tens E$', 'La linearità del legame', 'La simmetria di $\\tens E$', 'Il fatto che il cammino sia rettilineo'], correct: 0, why: 'È la definizione di materiale iperelastico.' },
              val: (v) => workQuad(A81(v), mat(v, 'P'), mat(v, 'Q'), mat(v, 'C')),
            },
            { tex: '=\\varphi(\\tens E_2)-\\varphi(\\tens E_1)', why: 'Teorema fondamentale del calcolo: dipende solo dagli estremi.', val: (v) => El.energy(A81(v), mat(v, 'Q')) - El.energy(A81(v), mat(v, 'P')), eq: '§4.9.1' },
          ],
        },
      },
      {
        id: 'l45-3',
        kind: 'prova',
        title: 'Tre cammini, un solo lavoro',
        md: 'Nel piano di due stati di deformazione si va da O a $\\tens E^*$ lungo tre strade.',
        tasks: ['Materiale iperelastico: i tre lavori coincidono con $\\frac12\\mathbb A\\tens E^*\\cdot\\tens E^*$ e il giro chiuso dà zero.', 'Tensore con le sole simmetrie minori: i lavori sono diversi e il giro chiuso non dà zero: non esiste $\\varphi$.'],
        visual: SVG('cammino'),
      },
      {
        id: 'l45-4',
        kind: 'spiega',
        title: 'Cammini chiusi e significato di φ',
        md: `Se il materiale è iperelastico il lavoro specifico (a) non dipende dal cammino, (b) è la variazione di $\\varphi$: la deformazione è un processo **conservativo**. Su un cammino chiuso $\\tens E_1\\to\\tens E^*\\to\\tens E_1$ il lavoro è nullo: l'energia spesa per andare viene tutta restituita al ritorno.

**Significato assoluto** (§4.9.2): partendo da $\\tens O$, $w=\\varphi(\\tens E)-\\varphi(\\tens O)=\\varphi(\\tens E)$: è il lavoro speso per passare dalla configurazione naturale a $\\tens E$. Se la configurazione di riferimento fosse già deformata (l'arco teso) $\\varphi$ non sarebbe nulla lì, e servirebbe una teoria più complessa.

L'energia del corpo intero è $\\Phi=\\int_{\\mathcal B}\\varphi(\\tens E(x))\\,dV$; $\\varphi$, se esiste, è unica.`,
      },
      {
        id: 'l45-5',
        kind: 'derivazione',
        title: 'Teorema sull’energia: a ⇒ b',
        md: '**Teo 4.9.2** (elastico lineare): sono equivalenti a) esiste $\\varphi$; b) $\\mathbb A=\\mathbb A^T$; c) $\\varphi=\\frac12\\mathbb A\\tens E\\cdot\\tens E$. Prima a ⇒ b.',
        source: D(4, '4.9.3', 'Teo 4.9.2', 81),
        der: {
          lines: [
            { tex: 'T_{ij}=\\dfrac{\\partial\\varphi}{\\partial E_{ij}}=\\textstyle\\sum_{h,k}A_{ijhk}E_{hk}', why: 'Se $\\varphi$ esiste la tensione è la sua derivata; ed è anche $\\mathbb A\\tens E$.' },
            { tex: '\\dfrac{\\partial^2\\varphi}{\\partial E_{ij}\\partial E_{hk}}=A_{ijhk},\\qquad\\dfrac{\\partial^2\\varphi}{\\partial E_{hk}\\partial E_{ij}}=A_{hkij}', why: 'Derivando rispetto a $E_{hk}$ restano solo i termini che lo contengono; lo stesso con gli indici scambiati.' },
            {
              tex: '\\Rightarrow\\ A_{ijhk}=A_{hkij},\\qquad\\mathbb A=\\mathbb A^T=\\dfrac{\\partial^2\\varphi}{\\partial\\tens E^2}',
              why: 'Per il teorema di Schwarz l\'ordine di derivazione è indifferente: è la simmetria maggiore.',
              ask: { q: 'Quale teorema chiude la dimostrazione?', options: ['Schwarz (derivate miste)', 'Divergenza', 'Spettrale', 'Kirchhoff'], correct: 0, why: 'Le derivate seconde miste di una funzione regolare non dipendono dall\'ordine.' },
              eq: 'Teo 4.9.2, a ⇒ b',
            },
          ],
        },
      },
      {
        id: 'l45-6',
        kind: 'derivazione',
        title: 'Teorema sull’energia: b ⇒ c',
        md: 'Cammino rettilineo da $\\tens O$ a $\\tens E^*$: $\\hat{\\tens E}(\\alpha)=\\alpha\\tens E^*$, $\\alpha\\in[0,1]$, con $\\hat{\\tens T}=\\mathbb A\\hat{\\tens E}$. Nel campione $\\mathbb A$ casuale con la simmetria maggiore.',
        source: D(4, '4.9.3', 'Teo 4.9.2', 81),
        der: {
          sample: (r) => { const o: R = {}; for (let k = 0; k < 81; k++) o[`A${k}`] = 2 * r() - 1; putMat(o, 'E', T.sym(T.randMat(r))); return o; },
          lines: [
            { tex: 'w=\\int_0^1\\hat{\\tens T}(\\alpha)\\cdot\\dfrac{d\\hat{\\tens E}}{d\\alpha}\\,d\\alpha=\\int_0^1\\mathbb A(\\alpha\\tens E^*)\\cdot\\tens E^*\\,d\\alpha', why: 'Lavoro lungo il cammino, con $d\\hat{\\tens E}/d\\alpha=\\tens E^*$.', val: (v) => workQuad(A81(v), T.O3, mat(v, 'E'), T.O3) },
            { tex: '=\\mathbb A\\tens E^*\\cdot\\tens E^*\\int_0^1\\alpha\\,d\\alpha', why: 'Per la linearità di $\\mathbb A$ il fattore $\\alpha$ esce.', val: (v) => T.ddot(T.apply4(A81(v), mat(v, 'E')), mat(v, 'E')) * 0.5 },
            {
              tex: '=\\tfrac12\\,\\mathbb A\\tens E^*\\cdot\\tens E^*',
              why: '$\\int_0^1\\alpha\\,d\\alpha=\\frac12$. Con a) questo lavoro coincide con $\\varphi(\\tens E^*)$.',
              ask: { q: 'Da dove viene il fattore ½?', options: ['Da $\\int_0^1\\alpha\\,d\\alpha$: lo sforzo cresce con la deformazione lungo il cammino', 'Dalla simmetria di $\\tens E$', 'Da una convenzione', 'Dalla definizione di $\\tens D$'], correct: 0, why: 'È lo stesso ½ del teorema di Clapeyron (Cap. 5).' },
              val: (v) => El.energy(A81(v), mat(v, 'E')),
              eq: 'Teo 4.9.2, b ⇒ c',
            },
          ],
        },
      },
      {
        id: 'l45-7',
        kind: 'spiega',
        title: 'Chiudere l’equivalenza; Pos⁺ e tensore tangente',
        md: `La catena a ⇒ b ⇒ c degli appunti usa a) nel passo b ⇒ c. Per chiudere l'equivalenza (Attenzione, p. 81): c ⇒ a è immediato (se $\\varphi=\\frac12\\mathbb A\\tens E\\cdot\\tens E$ esiste, il lavoro su un cammino chiuso è nullo); e con la simmetria maggiore $\\partial(\\frac12\\mathbb A\\tens E\\cdot\\tens E)/\\partial\\tens E=\\mathbb A\\tens E=\\tens T$, cioè b ⇒ a.

**Definita positività** (§4.9.4): $\\mathbb A\\in\\mathrm{Pos}^+$ significa $\\mathbb A\\tens E\\cdot\\tens E>0$ per ogni $\\tens E\\ne\\tens O$; con $\\varphi=\\frac12\\mathbb A\\tens E\\cdot\\tens E$ vuol dire $\\varphi(\\tens E)>0$: per deformare bisogna spendere energia.

**Tensore elastico tangente** (§4.9.5): se il legame non è lineare, in ogni punto del cammino si definisce $\\mathbb A=\\partial\\tens T/\\partial\\tens E=\\partial^2\\varphi/\\partial\\tens E^2$.`,
      },
      {
        id: 'l45-8',
        kind: 'riassunto',
        md: `**In una frase:** con $\\tens T=\\partial\\varphi/\\partial\\tens E$ il lavoro di deformazione è $\\varphi_2-\\varphi_1$, indipendente dal cammino; nel caso lineare equivale a $\\mathbb A=\\mathbb A^T$ (21 costanti) e a $\\varphi=\\frac12\\mathbb A\\tens E\\cdot\\tens E$.

- a ⇒ b con Schwarz; b ⇒ c con il cammino rettilineo.
- $\\mathbb A\\in\\mathrm{Pos}^+\\Rightarrow\\varphi>0$.`,
        orale: ['Iperelasticità: definizione di $\\varphi$, cammino di deformazione, lavoro indipendente dal cammino, significato assoluto. (dispensa, domanda 8)', 'Teorema sull’energia specifica: equivalenza a)–b)–c) e dimostrazioni. (dispensa, domanda 9)'],
      },
    ],
  },
  // ================================================================== c4.6
  {
    concept: 'c4.6',
    title: 'Simmetrie materiali e Voigt',
    minutes: 18,
    source: D(4, '4.10–4.11', 'Def 4.10.1', '82–86'),
    visual: SVG('voigt', { classe: 'ortotropo' }),
    steps: [
      {
        id: 'l46-1',
        kind: 'spiega',
        title: 'Lo stesso materiale, direzioni diverse',
        md: `Da tre lastre (acciaio, legno, CFRP 0/90) si ricavano provini orizzontali, verticali e a 45°, provati a basso carico (§4.10):
- **acciaio**: curve sovrapposte, la direzione non conta;
- **legno**: il provino lungo le fibre è il più rigido, quello ortogonale il più deformabile;
- **CFRP 0/90**: 0° e 90° coincidono (stessa grammatura), 45° è più deformabile.

Cercare le direzioni con la stessa risposta è cercare le **simmetrie materiali**. Più direzioni rispondono allo stesso modo, più il legame è semplice. Le prove a ultrasuoni (anche generati e letti da laser) permettono di saggiarle su un solo campione, senza distruggerlo.`,
      },
      {
        id: 'l46-2',
        kind: 'spiega',
        title: 'La condizione di simmetria',
        md: `Si perturba l'intorno di $x$ con $\\vet u$: $\\tens E$, $\\tens T=\\mathbb A\\tens E$. Poi con $\\vet u^*=\\tens Q\\vet u$, ruotato di $\\tens Q\\in\\mathrm{Rot}$: per la congruenza $\\tens E^*=\\tens Q\\tens E\\tens Q^T$, e $\\tens T^*=\\mathbb A\\tens E^*$ (il legame è una proprietà del punto, non cambia).

Se la risposta lungo $\\vet u^*$ è «la stessa», $\\tens T^*$ non è uguale a $\\tens T$ ma ruotato allo stesso modo: $\\tens T^*=\\tens Q\\tens T\\tens Q^T$. Quindi:

$$\\mathbb A[\\tens Q\\tens E\\tens Q^T]=\\tens Q(\\mathbb A\\tens E)\\tens Q^T\\quad\\forall\\tens E\\in\\mathrm{Sym}.$$

**Def 4.10.1:** le $\\tens Q\\in\\mathrm{Orth}$ che lo soddisfano formano il **gruppo di simmetria materiale** $\\mathcal G$. Un gruppo grande obbliga molte componenti di $\\mathbb A$ a coincidere o ad annullarsi.`,
      },
      {
        id: 'l46-3',
        kind: 'spiega',
        title: 'Le classi',
        md: `Costanti indipendenti (elastico / iperelastico), tabella di p. 84:

- **anisotropi**, nessuna simmetria: 36 / 21;
- **ortotropi**, riflessioni rispetto a 3 piani ortogonali (CFRP 0/90, muratura): 12 / 9;
- **trasversalmente isotropi**, rotazioni attorno a un asse (legno, compositi unidirezionali): 6 / 5;
- **isotropi**, tutto Orth (acciaio): 2 / 2.

Per gli anisotropi gli appunti scrivevano $\\mathcal G=\\emptyset$; un gruppo contiene sempre l'identità, e qui anche $-\\tens I$ (Attenzione, p. 84). Gli isotropi sono sempre iperelastici: per questo chi lavora con l'acciaio fatica a vedere la differenza. Gli oggetti stampati in 3D sono invece spiccatamente anisotropi.`,
      },
      {
        id: 'l46-4',
        kind: 'prova',
        title: 'La matrice di Voigt',
        md: 'Con la notazione di Voigt un tensore simmetrico è un vettore di 6 numeri, e il legame una matrice 6×6 divisa in quattro blocchi.',
        tasks: ['Anisotropo: tutte le caselle piene; togli «iperelastico»: da 21 a 36 costanti.', 'Ortotropo: i blocchi NE e SW si svuotano, SE resta diagonale: $\\tau_{23}=C_{44}\\gamma_{23}$.', 'Trasversalmente isotropo: $C_{66}=(C_{11}-C_{12})/2$ non è una costante nuova.', 'Isotropo: $\\lambda+2\\mu$, $\\lambda$, $\\mu$.'],
        visual: SVG('voigt', { classe: 'anisotropo' }),
      },
      {
        id: 'l46-5',
        kind: 'spiega',
        title: 'Notazione di Voigt',
        md: `$$\\{\\tens T\\}=(\\sigma_1,\\sigma_2,\\sigma_3,\\tau_{23},\\tau_{31},\\tau_{12}),\\qquad\\{\\tens E\\}=(\\varepsilon_1,\\varepsilon_2,\\varepsilon_3,\\gamma_{23},\\gamma_{31},\\gamma_{12}),$$

con gli scorrimenti $\\gamma_{ij}=2E_{ij}$ (§4.11). Alcuni testi indicano le costanti con due indici, $C_{IJ}$. I blocchi: **NW** $\\sigma_i\\leftrightarrow\\varepsilon_h$, **NE** $\\sigma_i\\leftrightarrow\\gamma_{hk}$, **SW** $\\tau_{ij}\\leftrightarrow\\varepsilon_h$, **SE** $\\tau_{ij}\\leftrightarrow\\gamma_{hk}$.

I coefficienti dipendono dal riferimento: in uno qualunque il tensore è una struttura poco chiara. Le semplificazioni si vedono solo nel riferimento legato alle direzioni di simmetria (riferimento principale di ortotropia; per l'isotropia trasversa una qualunque coppia di assi nel piano di isotropia). Se il riferimento del calcolo è diverso, serve una trasformazione tensoriale.`,
      },
      {
        id: 'l46-6',
        kind: 'domanda',
        q: { id: 'l46-q1', kind: 'scelta', q: 'In un materiale ortotropo, nel riferimento principale di ortotropia, da che cosa dipende $\\tau_{23}$?', options: ['Solo da $\\gamma_{23}$', 'Da tutte le deformazioni', 'Dalle dilatazioni $\\varepsilon_i$', 'Da $\\gamma_{12}$ e $\\gamma_{31}$'], correct: 0, why: '§4.11.1: blocco SE diagonale, $\\tau_{23}=C_{44}\\gamma_{23}$.' },
      },
      {
        id: 'l46-7',
        kind: 'riassunto',
        md: `**In una frase:** le trasformazioni $\\tens Q$ con $\\mathbb A[\\tens Q\\tens E\\tens Q^T]=\\tens Q(\\mathbb A\\tens E)\\tens Q^T$ formano il gruppo di simmetria; più è grande, meno costanti: 21, 9, 5, 2 per anisotropi, ortotropi, trasversalmente isotropi, isotropi (iperelastici).

- Voigt: vettori di 6 componenti, $\\gamma=2E$, matrice 6×6 a blocchi.
- Le semplificazioni si leggono nel riferimento del materiale.`,
        orale: ['Simmetrie materiali: condizione, gruppo di simmetria, classi e numero di costanti; notazione di Voigt e struttura di $[\\mathbb A]$. (dispensa, domanda 10)'],
      },
    ],
  },
];
