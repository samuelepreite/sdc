/**
 * Lezioni guidate del Modulo 3 (Cap. 3). Derivazioni solo dove la dispensa le sviluppa (ANALISI §4); ogni riga con
 * `val` è verificata su 25 campioni casuali (tests/lezioni.test.ts). I numeri dei passi «numeri» vengono dal motore.
 */
import { D } from '../../engine/types';
import * as T from '../../engine/tensor';
import { ES_314, ES_314_N, ES_3172, mohr, principalStress, tauMax, traction } from '../../engine/tensione';
import type { Lesson, LessonVisual, StressScene } from '../types';

type R = Record<string, number>;
const mat = (v: R, p: string): T.Mat => Array.from({ length: 9 }, (_, k) => v[`${p}${k}`]);
const vec = (v: R, p: string): T.Vec => [v[`${p}0`], v[`${p}1`], v[`${p}2`]];
const putMat = (o: R, p: string, A: T.Mat) => A.forEach((a, k) => (o[`${p}${k}`] = a));
const putVec = (o: R, p: string, a: T.Vec) => a.forEach((x, k) => (o[`${p}${k}`] = x));
const idx = (r: () => number) => Math.min(2, Math.floor(3 * r()));
const ST = (scene: StressScene): LessonVisual => ({ kind: 'tensione3d', scene });
const MOHR = (params: Record<string, string | number | boolean>): LessonVisual => ({ kind: 'svg', id: 'mohr', params });
const f = (x: number, d = 4) => T.fmt(Math.abs(x) < 1e-12 ? 0 : x, d);
const fd = (x: number) => T.fmt(x, 4);

// ------------------------------------------------------------------ numeri dal motore
const P314 = principalStress(ES_314);
const TM314 = tauMax(ES_314);
const TR314 = traction(ES_314, ES_314_N);
const M3172 = mohr(ES_3172);
const Q30 = M3172.at(Math.PI / 6);
const Q120 = M3172.at(Math.PI / 6 + Math.PI / 2);

/** campione per Mohr: σ1, σ2, τ12, α */
const sampleMohr = (r: () => number): R => ({ s1: 4 * r() - 2, s2: 4 * r() - 2, t: 4 * r() - 2, a: Math.PI * (2 * r() - 1) });

export const M3_LEZIONI: Lesson[] = [
  // ================================================================== c3.1
  {
    concept: 'c3.1',
    title: 'Le forze interne e il vettore tensione',
    minutes: 15,
    source: D(3, '3.1–3.3', 'Def 3.2.1–3.2.2, Teo 3.3.1', '36–40'),
    visual: ST({ mode: 'taglio', presets: ['esercizio', 'trazione', 'scorrimento', 'generico'], controls: ['preset', 'dir'] }),
    steps: [
      {
        id: 'l31-1',
        kind: 'spiega',
        title: 'Tre classi di forze',
        md: `L'analisi della tensione descrive le **forze interne** di un corpo continuo. Sul corpo $\\mathcal B$ agiscono (§3.1):

- forze di **volume** $\\vet b(x)$: a distanza, senza contatto, come il peso ($\\rho g$); dimensioni $[F][L^{-3}]$;
- forze di **superficie** $\\hat{\\vet s}(x)$: per contatto, sulla frontiera $\\partial\\mathcal B$, come il vento su una vela; $[F][L^{-2}]$;
- forze **interne**: ciò che una parte $\\mathcal P$ scambia con il resto del corpo.

Perché servono le interne? Il peso di una persona sul balcone deve arrivare alle fondamenta, e può farlo solo passando per la materia. Se si taglia idealmente il corpo, la trasmissione si interrompe e la parte tagliata non è più in equilibrio. La **tensione** descrive le forze interne che la materia mette in gioco per trasmettere i carichi.`,
      },
      {
        id: 'l31-2',
        kind: 'spiega',
        title: 'Il principio delle sezioni di Eulero',
        md: `Si taglia il corpo con un piano $\\pi$ per $x$, di normale $\\hat n$ (la **giacitura**): restano $\\mathcal B^+$ (dalla parte di $\\hat n$) e $\\mathcal B^-$. Sia $\\Delta A$ un intorno di $x$ sulla sezione.

**Def 3.2.1.** L'azione di $\\mathcal B^+$ su $\\mathcal B^-$ attraverso $\\Delta A$ equivale a un campo di forze definito su $\\Delta A$: **le forze interne sono forze di superficie.**

È un'ipotesi limitativa: in un magnete le due parti si attirano anche a distanza. Ma è adeguata alla maggior parte dei problemi dell'ingegneria.`,
      },
      {
        id: 'l31-3',
        kind: 'spiega',
        title: 'Il principio delle tensioni di Cauchy',
        md: `**Def 3.2.2.** Dette $\\Delta\\vet F$ la risultante e $\\Delta\\vet M$ il momento risultante (rispetto a $x$) delle forze su $\\Delta A$:

1. esiste finito $\\displaystyle\\lim_{\\operatorname{diam}\\Delta A\\to0}\\frac{\\Delta\\vet F}{\\Delta A}=:\\vet t_n(x)$, il **vettore tensione** sulla giacitura $\\hat n$;
2. $\\displaystyle\\lim_{\\operatorname{diam}\\Delta A\\to0}\\frac{\\Delta\\vet M}{\\Delta A}=\\vet 0$: nel punto non c'è momento.

Escludere i momenti interni basta quasi sempre. Se non basta (la muratura, con i suoi giunti) si usano i **continui polari** dei fratelli Cosserat, in cui ogni punto può anche ruotare: più complicati.

Perché «principi»? Sono **assiomi**: non si dimostrano, valgono perché ciò che se ne ricava predice gli esperimenti. E non esiste un «tensiometro»: si misura la deformazione e la tensione si stima con la teoria.`,
      },
      {
        id: 'l31-4',
        kind: 'prova',
        title: 'Cambia giacitura',
        md: 'Nel modello: il piano $\\pi$ per il punto, la sua normale $\\hat n$ e il vettore tensione $\\vet t_n$ (arancio).',
        tasks: ['Muovi inclinazione e azimut: $\\vet t_n$ cambia con la giacitura. In un punto ci sono $\\infty^2$ vettori tensione (§3.2.3).', 'Con «trazione semplice» $\\vet t_n$ resta sempre parallelo all\'asse x, qualunque sia il piano.', 'Con «idrostatico» $\\vet t_n$ è sempre lungo $\\hat n$.'],
        visual: ST({ mode: 'taglio', preset: 'esercizio', presets: ['esercizio', 'trazione', 'idrostatico', 'generico'], controls: ['preset', 'dir'] }),
      },
      {
        id: 'l31-5',
        kind: 'spiega',
        title: 'Normale e tangenziale',
        md: `Conta solo la giacitura: superfici diverse, anche curve, con la stessa normale in $x$ danno lo stesso $\\vet t_n$ (§3.2.3).

Le **componenti speciali** si prendono con un asse lungo $\\hat n$ e due nel piano del taglio (§3.3):

- **tensione normale** $\\boldsymbol\\sigma_n=\\sigma_n\\hat n$, $\\sigma_n=\\vet t_n\\cdot\\hat n$: tende a lacerare le facce del taglio se $\\sigma_n>0$ (trazione), a farle compenetrare se $\\sigma_n<0$ (compressione);
- **tensione tangenziale** $\\boldsymbol\\tau_n=\\tau_n\\hat\\mu$, nel piano: tende a far scivolare una faccia sull'altra.

Con i proiettori del Cap. 1 (Teo 3.3.1):

$$\\vet t_n=(\\hat n\\otimes\\hat n)\\vet t_n+(\\tens I-\\hat n\\otimes\\hat n)\\vet t_n=\\sigma_n\\hat n+\\tau_n\\hat\\mu.$$

La direzione di $\\boldsymbol\\sigma_n$ è nota (è $\\hat n$); quella di $\\boldsymbol\\tau_n$, $\\hat\\mu$, va calcolata. Convenzione: in $\\tau_{ni}$ il primo indice è la giacitura, il secondo la direzione.`,
      },
      {
        id: 'l31-6',
        kind: 'domanda',
        q: { id: 'l31-q1', kind: 'scelta', q: 'Quale proiettore dà la tensione tangenziale?', options: ['$\\tens I-\\hat n\\otimes\\hat n$', '$\\hat n\\otimes\\hat n$', '$\\tens I$', '$\\hat\\mu\\otimes\\hat n$'], correct: 0, why: 'Teo 3.3.1: il proiettore ortogonale a $\\hat n$ dà la parte di $\\vet t_n$ nel piano del taglio.' },
      },
      {
        id: 'l31-7',
        kind: 'riassunto',
        md: `**In una frase:** le forze interne sono forze di superficie sui tagli ideali (Eulero), descritte in ogni punto e per ogni giacitura dal vettore tensione $\\vet t_n$ (Cauchy), che si scompone in $\\sigma_n\\hat n$ e $\\tau_n\\hat\\mu$.

- Forze di volume, di superficie, interne.
- I due principi sono assiomi; i continui polari ne superano il limite.
- $\\vet t_n$ dipende solo da $\\hat n$.`,
        orale: ['Classi di forze su un continuo; perché servono le forze interne. (dispensa, domanda 1)', 'Principio delle sezioni di Eulero e principio delle tensioni di Cauchy: enunciati, perché sono assiomi, limiti. (dispensa, domanda 2)', 'Il vettore tensione dipende dalla giacitura e non dalla forma della superficie; componenti normale e tangenziale. (dispensa, domanda 3)'],
      },
    ],
  },
  // ================================================================== c3.2
  {
    concept: 'c3.2',
    title: 'Equilibrio di ogni parte e lemma di Cauchy',
    minutes: 14,
    source: D(3, '3.4–3.5', 'Def 3.4.1, Teo 3.4.2, Teo 3.5.1', '40–42'),
    visual: ST({ mode: 'taglio', preset: 'esercizio', presets: ['esercizio', 'generico'], controls: ['preset', 'dir'] }),
    steps: [
      {
        id: 'l32-1',
        kind: 'spiega',
        title: 'L’equilibrio, livello per livello',
        md: `L'equilibrio si generalizza per livelli successivi (§3.4):

- **punto materiale**: risultante nulla, $\\sum\\vet F_i=\\vet 0$ (un assioma);
- **corpo rigido**: equazioni cardinali della statica (ECS), risultante nulla e momento nullo rispetto a ogni polo;
- **sistema di corpi rigidi**: ECS per ogni corpo;
- **corpo continuo**: le parti sono infinite.

**Def 3.4.1 (assiomi di Eulero).** $\\mathcal B$ è in equilibrio se e solo se, per ogni parte $\\mathcal P$,

$$\\vet r(\\mathcal P)=\\vet 0,\\qquad\\vet m_O(\\mathcal P)=\\vet 0\\quad\\forall O,\\ \\forall\\mathcal P\\subseteq\\mathcal B.$$

Richiederlo per **ogni** parte lo rende un principio valido in ogni punto interno.`,
      },
      {
        id: 'l32-2',
        kind: 'spiega',
        title: 'Le risultanti su una parte',
        md: `**Parte interna** ($\\partial\\mathcal P\\cap\\partial\\mathcal B=\\emptyset$): agiscono le forze di volume e, sulla frontiera, le tensioni (con $\\hat n$ normale esterna):

$$\\vet r(\\mathcal P)=\\int_{\\mathcal P}\\vet b\\,dV+\\int_{\\partial\\mathcal P}\\vet t_n\\,dA,\\qquad\\vet m_O(\\mathcal P)=\\int_{\\mathcal P}(x-O)\\wedge\\vet b\\,dV+\\int_{\\partial\\mathcal P}(x-O)\\wedge\\vet t_n\\,dA.$$

**Parte affiorante**: sul tratto di frontiera in comune con $\\partial\\mathcal B$ agiscono le forze esterne $\\hat{\\vet s}$ invece delle tensioni.

Con $\\mathcal P=\\mathcal B$ si ritrovano le ECS: ne sono un caso particolare.`,
      },
      {
        id: 'l32-3',
        kind: 'spiega',
        title: 'Il compasso',
        md: `**Teo 3.4.2.** Per un corpo deformabile le ECS sono **necessarie ma non sufficienti**.

Due forze uguali e opposte, collineari, applicate agli estremi delle gambe di un compasso: risultante nulla, momento nullo (braccio zero). Le ECS sono soddisfatte, eppure il compasso si apre. Non c'è equilibrio perché una parte (una gamba) non è in equilibrio.

Le ECS bastano solo per un corpo rigido: se si salda la cerniera, il compasso resta fermo. Per un corpo deformabile serve l'equilibrio di ogni parte.`,
      },
      {
        id: 'l32-4',
        kind: 'derivazione',
        title: 'Lemma di Cauchy',
        md: 'Si taglia $\\mathcal B$ con il piano di normale $\\hat n$ per $x$; $A$ è la sezione. La normale esterna a $\\mathcal B^+$ su $A$ è $-\\hat n$, quella a $\\mathcal B^-$ è $\\hat n$. È una catena di passaggi logici: non c’è nulla da calcolare.',
        source: D(3, '3.5', 'Teo 3.5.1', 42),
        der: {
          lines: [
            { tex: '\\int_{\\mathcal B^+}\\vet b\\,dV+\\int_{\\partial\\mathcal B^+}\\hat{\\vet s}\\,dA+\\int_A\\vet t_{-n}\\,dA=\\vet 0', why: 'Assiomi di Eulero per $\\mathcal B^+$: sulla sezione agisce l\'azione di $\\mathcal B^-$, con normale esterna $-\\hat n$.' },
            { tex: '\\int_{\\mathcal B^-}\\vet b\\,dV+\\int_{\\partial\\mathcal B^-}\\hat{\\vet s}\\,dA+\\int_A\\vet t_{n}\\,dA=\\vet 0', why: 'Lo stesso per $\\mathcal B^-$, con normale esterna $\\hat n$.' },
            {
              tex: '\\underbrace{\\int_{\\mathcal B}\\vet b\\,dV+\\int_{\\partial\\mathcal B}\\hat{\\vet s}\\,dA}_{=\\vet r(\\mathcal B)=\\vet 0}+\\int_A(\\vet t_n+\\vet t_{-n})\\,dA=\\vet 0',
              why: 'Si sommano membro a membro, con $\\mathcal B=\\mathcal B^+\\cup\\mathcal B^-$: i primi due termini sono la risultante del corpo intero, nulla per le ECS.',
              ask: { q: 'Perché i primi due integrali si annullano?', options: ['Sono la risultante delle forze esterne sul corpo intero, nulla per le ECS', 'Perché $\\vet b=\\vet 0$', 'Per il teorema della divergenza', 'Per la simmetria di $\\tens T$'], correct: 0, why: 'Le ECS sono il caso $\\mathcal P=\\mathcal B$ degli assiomi di Eulero.' },
            },
            {
              tex: '\\Rightarrow\\ \\vet t_n(x)=-\\vet t_{-n}(x)',
              why: 'L\'integrale su $A$ è nullo per qualunque sezione (si può cambiare piano, giacitura, parte tagliata): per l\'arbitrarietà del dominio l\'integranda è nulla.',
              ask: { q: 'Che cosa permette di concludere che l\'integranda è nulla?', options: ['L\'arbitrarietà del dominio di integrazione', 'Un integrale nullo implica sempre integranda nulla', 'La continuità di $\\vet b$', 'La linearità di $\\tens T$'], correct: 0, why: 'Attenzione di p. 42: $\\int_0^{2\\pi}\\sin x\\,dx=0$ ma $\\sin x\\not\\equiv0$; serve che l\'integrale sia nullo su ogni dominio.' },
              eq: 'Teo 3.5.1',
            },
          ],
        },
      },
      {
        id: 'l32-5',
        kind: 'domanda',
        q: { id: 'l32-q1', kind: 'vf', q: 'Il lemma di Cauchy è la contropartita locale del principio di azione e reazione.', answer: true, why: '§3.5: nel punto, l’azione di una parte sull’altra è uguale e opposta a quella della seconda sulla prima.' },
      },
      {
        id: 'l32-6',
        kind: 'riassunto',
        md: `**In una frase:** un corpo continuo è in equilibrio se lo è ogni sua parte; le ECS da sole non bastano (compasso), e in ogni punto $\\vet t_n=-\\vet t_{-n}$.

- Assiomi di Eulero per ogni $\\mathcal P\\subseteq\\mathcal B$.
- Parte interna: volume + tensioni; affiorante: anche $\\hat{\\vet s}$.
- Lemma di Cauchy dall'arbitrarietà del dominio.`,
        orale: ['Assiomi di Eulero; perché le ECS sono solo necessarie per il corpo deformabile (esempio del compasso). (dispensa, domanda 4)', 'Enunciare e dimostrare il lemma di Cauchy (ruolo dell’arbitrarietà del dominio). (dispensa, domanda 5)'],
      },
    ],
  },
  // ================================================================== c3.3
  {
    concept: 'c3.3',
    title: 'Cauchy–Poisson e il tetraedro',
    minutes: 20,
    source: D(3, '3.6–3.7.1', 'Teo 3.6.1', '42–45'),
    visual: ST({ mode: 'tetraedro', presets: ['esercizio', 'generico', 'trazione'], controls: ['preset', 'dir'] }),
    steps: [
      {
        id: 'l33-1',
        kind: 'spiega',
        title: 'L’enunciato',
        md: `È considerato il risultato principale della meccanica dei solidi: la condizione necessaria è di Cauchy (1823), la sufficiente di Poisson (1829).

**Teo 3.6.1.** Dato un corpo continuo $\\mathcal B$ sotto $\\vet b$ e $\\hat{\\vet s}$, condizione necessaria e sufficiente per l'equilibrio è che:

1. in ogni punto esista $\\tens T(x)\\in\\mathrm{Lin}$ con $\\vet t_n(x)=\\tens T(x)\\hat n$ per ogni $\\hat n$ (**tensore di tensione di Cauchy**);
2. $\\operatorname{div}\\tens T+\\vet b=\\vet 0$ in ogni punto interno (**equazioni indefinite di equilibrio**);
3. $\\tens T=\\tens T^T$ (**simmetria**).

Per la sufficienza serve anche l'equilibrio al contorno $\\tens T\\hat n=\\hat{\\vet s}$ su $\\partial\\mathcal B$: la dispensa lo aggiunge (negli appunti mancava). Ricorda: la patente è necessaria per guidare, ma non sufficiente.`,
      },
      {
        id: 'l33-2',
        kind: 'spiega',
        title: 'Il tetraedro di Cauchy',
        md: `Si dimostra la condizione necessaria, partendo dagli assiomi di Eulero. Per il punto 1 si sceglie come parte un **tetraedro** con un vertice in $x$:

- tre facce sui piani coordinati, con normali esterne $-\\hat e_1,-\\hat e_2,-\\hat e_3$ e aree $A_1,A_2,A_3$;
- una faccia inclinata di area $A$ e normale $\\hat n$.

Le facce coordinate sono le **proiezioni** di quella inclinata:

$$A_i=A\\,(\\hat e_i\\cdot\\hat n)=A\\,n_i\\quad\\Longrightarrow\\quad\\frac{n_i}{A_i}=\\frac1A.$$

Il tetraedro è una parte interna: sulle facce agiscono solo tensioni.`,
        visual: ST({ mode: 'tetraedro', preset: 'esercizio', presets: ['esercizio', 'generico'], controls: ['preset', 'dir'] }),
      },
      {
        id: 'l33-3',
        kind: 'derivazione',
        title: 'Dall’equilibrio del tetraedro al tensore',
        md: 'Equilibrio alla traslazione, diviso per $A$, con il lemma di Cauchy $\\vet t_{-e_i}=-\\vet t_{e_i}$; poi la **localizzazione**: la faccia inclinata si avvicina a $x$ parallelamente a sé stessa ($d\\to0$). Le ultime righe sono verificate in componenti su un campione.',
        source: D(3, '3.7.1', 'Teo 3.6.1', '44–45'),
        der: {
          sample: (r) => { const o: R = { k: idx(r) }; putMat(o, 'T', T.randMat(r)); putVec(o, 'n', T.unit([0.1 + r(), 0.1 + r(), 0.1 + r()])); return o; },
          lines: [
            { tex: '\\frac1A\\int_\\Delta\\vet b\\,dV+\\frac1A\\int_A\\vet t_n\\,dA-\\sum_{i=1}^3\\frac{n_i}{A_i}\\int_{A_i}\\vet t_{e_i}\\,dA_i=\\vet 0', why: 'Equilibrio alla traslazione diviso per $A$; sulle facce coordinate $\\vet t_{-e_i}=-\\vet t_{e_i}$ e $1/A=n_i/A_i$.' },
            {
              tex: '\\vet t_n(x)-\\sum_{i=1}^3n_i\\,\\vet t_{e_i}(x)=\\vet 0',
              why: 'Per $d\\to0$: il volume va come $d^3$ e l\'area come $d^2$, quindi il primo termine è $O(d)\\to0$; gli altri rapporti forza/area tendono ai vettori tensione in $x$ (definizione di Cauchy).',
              ask: { q: 'Perché il termine delle forze di volume sparisce nel limite?', options: ['Perché il volume decresce come $d^3$ e l\'area come $d^2$', 'Perché $\\vet b=\\vet 0$ per ipotesi', 'Per il lemma di Cauchy', 'Perché il tetraedro è rigido'], correct: 0, why: '§3.7.1: il rapporto $\\frac1A\\int_\\Delta\\vet b\\,dV$ è $O(d)$.' },
            },
            { tex: '(\\vet t_n)_k=\\Big[\\textstyle\\sum_i n_i\\,\\vet t_{e_i}\\Big]_k', why: 'Guardiamo la componente $k$. Nel campione $\\vet t_{e_i}$ è la colonna $i$ di una matrice qualunque.', val: (v) => [0, 1, 2].reduce((s, i) => s + v[`n${i}`] * T.col(mat(v, 'T'), i)[v.k], 0) },
            { tex: '=\\textstyle\\sum_i (\\vet t_{e_i})_k\\,n_i=\\sum_i T_{ki}\\,n_i', why: 'Si chiama $T_{ki}$ la componente $k$ di $\\vet t_{e_i}$: la colonna $i$ della matrice contiene $\\vet t_{e_i}$.', val: (v) => [0, 1, 2].reduce((s, i) => s + T.at(mat(v, 'T'), v.k, i) * v[`n${i}`], 0) },
            { tex: '=\\big([\\tens T]\\{\\hat n\\}\\big)_k\\ \\Rightarrow\\ \\vet t_n=\\tens T\\hat n', why: 'È il prodotto righe per colonna: la relazione è lineare in $\\hat n$, quindi esiste il tensore $\\tens T$, con $T_{ij}=\\tens T\\hat e_j\\cdot\\hat e_i=(\\vet t_{e_j})_i$.', val: (v) => T.apply(mat(v, 'T'), vec(v, 'n'))[v.k], eq: 'Teo 3.6.1, punto 1' },
          ],
        },
      },
      {
        id: 'l33-4',
        kind: 'prova',
        title: 'Controlla il tetraedro',
        md: 'Sulla faccia inclinata agisce $\\vet t_n$ (arancio), sulle facce coordinate $\\vet t_{-e_i}=-\\vet t_{e_i}$. Sotto, il motore confronta $\\tens T\\hat n$ con $\\sum_i\\vet t_{e_i}n_i$.',
        tasks: ['Muovi la giacitura della faccia inclinata: le due righe della tabella restano uguali.', 'Con «trazione semplice» solo la faccia di normale $-\\hat e_1$ è caricata.'],
        visual: ST({ mode: 'tetraedro', preset: 'generico', presets: ['generico', 'esercizio', 'trazione'], controls: ['preset', 'dir'] }),
      },
      {
        id: 'l33-5',
        kind: 'spiega',
        title: 'Perché è un risultato operativo',
        md: `Il punto 1 contiene un doppio risultato (riquadro di p. 43):

- **esistenza**: c'è un tensore che manda ogni giacitura nel suo vettore tensione;
- **operatività**: in un punto ci sono $\\infty^2$ vettori tensione, uno per giacitura. Senza il teorema servirebbero $\\infty^2$ informazioni per ciascuno degli infiniti punti; con il teorema bastano i vettori tensione su **tre** giaciture mutuamente ortogonali.

Il teorema rende operativo il concetto di tensione. I punti 2 e 3 faranno lo stesso con l'equilibrio.`,
      },
      {
        id: 'l33-6',
        kind: 'riassunto',
        md: `**In una frase:** dall'equilibrio del tetraedro, nel limite, $\\vet t_n=\\sum_i\\vet t_{e_i}n_i=\\tens T\\hat n$: bastano tre giaciture ortogonali.

- $A_i=An_i$; lemma di Cauchy sulle facce coordinate.
- Localizzazione: volume $\\sim d^3$, area $\\sim d^2$.
- Colonna $j$ di $[\\tens T]$ = $\\vet t_{e_j}$.`,
        orale: ['Enunciare il teorema di Cauchy–Poisson; significato dei tre punti. (dispensa, domanda 6)', 'Dimostrare il punto 1 (tetraedro di Cauchy). (dispensa, domanda 7)'],
      },
    ],
  },
  // ================================================================== c3.4
  {
    concept: 'c3.4',
    title: 'Equilibrio locale e simmetria',
    minutes: 16,
    source: D(3, '3.7.2–3.8', 'Teo 3.7.1', '45–48'),
    visual: ST({ mode: 'parallelepipedo', presets: ['scorrimento', 'esercizio', 'generico'], controls: ['preset'] }),
    steps: [
      {
        id: 'l34-1',
        kind: 'derivazione',
        title: 'Punto 2: le equazioni indefinite',
        md: 'Si prende una parte interna qualunque $\\mathcal P\\subset\\mathring{\\mathcal B}$ e si scrive $\\vet r(\\mathcal P)=\\vet 0$.',
        source: D(3, '3.7.2', 'Teo 3.6.1, punto 2', 45),
        der: {
          lines: [
            { tex: '\\int_{\\mathcal P}\\vet b\\,dV+\\int_{\\partial\\mathcal P}\\vet t_n\\,dA=\\vet 0', why: 'Le forze di superficie sulla frontiera di una parte interna sono tensioni, sulle giaciture normali alla frontiera.' },
            { tex: '\\int_{\\mathcal P}\\vet b\\,dV+\\int_{\\partial\\mathcal P}\\tens T\\hat n\\,dA=\\vet 0', why: 'Dal punto 1: $\\vet t_n=\\tens T\\hat n$.' },
            {
              tex: '\\int_{\\mathcal P}\\big(\\vet b+\\operatorname{div}\\tens T\\big)\\,dV=\\vet 0',
              why: 'Teorema della divergenza per un campo tensoriale (Teo 1.8.4): l\'integrale di superficie diventa di volume.',
              ask: { q: 'Quale teorema trasforma l\'integrale di superficie?', options: ['Il teorema della divergenza', 'Il lemma di Cauchy', 'Il teorema spettrale', 'Il teorema di Schwarz'], correct: 0, why: 'Teo 1.8.4: $\\int_{\\partial D}\\tens A\\hat n\\,dA=\\int_D\\operatorname{div}\\tens A\\,dV$.' },
            },
            { tex: '\\Rightarrow\\ \\operatorname{div}\\tens T+\\vet b=\\vet 0\\quad\\forall x\\in\\mathring{\\mathcal B}', why: 'La parte $\\mathcal P$ è arbitraria: l\'integranda è nulla.', eq: 'Teo 3.6.1, punto 2' },
          ],
        },
      },
      {
        id: 'l34-2',
        kind: 'spiega',
        title: 'In componenti, e tre osservazioni',
        md: `Con la divergenza per righe (Def 1.8.3):

$$\\frac{\\partial T_{i1}}{\\partial x_1}+\\frac{\\partial T_{i2}}{\\partial x_2}+\\frac{\\partial T_{i3}}{\\partial x_3}+b_i=0,\\qquad i=1,2,3:$$

un sistema di equazioni alle derivate parziali (§3.8).

- **Regolarità.** Serve $\\tens T$ regolare per farne la divergenza; si dimostra che lo è se discende dal punto 1.
- **Perché $\\mathring{\\mathcal B}$.** Le derivate sono rapporti incrementali: sulla frontiera non si può incrementare verso l'esterno.
- **div o Div.** div = configurazione attuale, Div = di riferimento. Con piccoli spostamenti e deformazioni (equilibrio referenziale, Cap. 2) è indifferente; si scrive il minuscolo per ricordare che in generale l'equilibrio va scritto nella configurazione attuale.`,
      },
      {
        id: 'l34-3',
        kind: 'spiega',
        title: 'Punto 3: il parallelepipedo',
        md: `Per l'equilibrio alla rotazione si sceglie un **parallelepipedo** infinitesimo di spigoli $dx_1,dx_2,dx_3$, con un vertice in $x$. Imporre il momento nullo rispetto a ogni polo equivale a imporlo rispetto a tre assi ortogonali per un punto: si scelgono gli assi $u,v,w$ per il baricentro $G$, paralleli agli spigoli.

Qui la dispensa scrive $T_{ij}=\\vet t_{e_i}\\cdot\\hat e_j$: primo indice la giacitura, secondo la direzione (nel tetraedro erano le colonne; per la simmetria non importa, nota NF-06).

- La risultante delle forze di volume passa per $G$: momento nullo.
- Sulla faccia di normale $-\\hat e_i$ (contiene $x$) agiscono $-T_{ij}$; su quella di normale $\\hat e_i$, a distanza $dx_i$, agiscono $T_{ij}+\\frac{\\partial T_{ij}}{\\partial x_i}dx_i$.`,
      },
      {
        id: 'l34-4',
        kind: 'derivazione',
        title: 'Momento attorno all’asse u',
        md: 'Asse $u\\parallel\\hat e_1$ per $G$. Le facce $\\pm\\hat e_1$ hanno le forze applicate sull\'asse; delle facce $\\pm\\hat e_2$ e $\\pm\\hat e_3$ danno momento solo le componenti che non sono parallele a $u$ né lo incontrano.',
        source: D(3, '3.7.3', 'Teo 3.7.1', 46),
        der: {
          lines: [
            { tex: '\\Big[\\Big(T_{23}+\\frac{\\partial T_{23}}{\\partial x_2}dx_2\\Big)dx_1dx_3+T_{23}\\,dx_1dx_3\\Big]\\frac{dx_2}2\\simeq T_{23}\\,dx_1dx_2dx_3', why: 'Facce $\\pm\\hat e_2$ (area $dx_1dx_3$): le componenti lungo $\\hat e_3$ hanno braccio $dx_2/2$. Il termine con la derivata è un infinitesimo di ordine superiore.' },
            { tex: '-\\Big[\\Big(T_{32}+\\frac{\\partial T_{32}}{\\partial x_3}dx_3\\Big)dx_1dx_2+T_{32}\\,dx_1dx_2\\Big]\\frac{dx_3}2\\simeq-T_{32}\\,dx_1dx_2dx_3', why: 'Facce $\\pm\\hat e_3$ (area $dx_1dx_2$): le componenti lungo $\\hat e_2$ danno un momento di verso opposto.' },
            {
              tex: 'T_{23}\\,dV-T_{32}\\,dV=0\\ \\Rightarrow\\ T_{23}=T_{32}',
              why: 'La somma deve essere nulla. Con gli assi $v$ e $w$: $T_{13}=T_{31}$, $T_{12}=T_{21}$.',
              ask: { q: 'Che cosa si trascura per arrivare a $T_{23}=T_{32}$?', options: ['I termini con le derivate, infinitesimi di ordine superiore', 'Le forze di volume, che però non danno momento comunque', 'Le tensioni normali', 'Nulla'], correct: 0, why: '$\\frac{\\partial T_{23}}{\\partial x_2}dx_2\\cdot\\frac{dx_2}2$ è di ordine superiore rispetto a $dV$.' },
              eq: 'Teo 3.6.1, punto 3',
            },
          ],
        },
      },
      {
        id: 'l34-5',
        kind: 'prova',
        title: 'Le tangenziali reciproche',
        md: 'Sul cubetto: le tangenziali sulle facce $\\pm\\hat e_1$ in direzione $\\hat e_2$ e quelle sulle facce $\\pm\\hat e_2$ in direzione $\\hat e_1$.',
        tasks: ['Con lo «scorrimento semplice» la coppia delle $\\tau_{12}$ (antioraria) è bilanciata dalla coppia delle $\\tau_{21}$ (oraria).', 'Cambia stato: $\\tau_{ij}=\\tau_{ji}$ sempre (figura di p. 47).'],
        visual: ST({ mode: 'parallelepipedo', preset: 'scorrimento', presets: ['scorrimento', 'esercizio', 'generico'], controls: ['preset'] }),
      },
      {
        id: 'l34-6',
        kind: 'domanda',
        q: { id: 'l34-q1', kind: 'scelta', q: 'Che cosa esprime la reciprocità delle tensioni tangenziali?', options: ['La tangenziale sulla giacitura $\\hat e_i$ in direzione $\\hat e_j$ è uguale a quella sulla giacitura $\\hat e_j$ in direzione $\\hat e_i$', 'Le tangenziali sono nulle sui piani principali', 'Le tangenziali sono uguali alle normali', '$\\tau_{ij}=-\\tau_{ji}$'], correct: 0, why: 'Teo 3.7.1: $\\tau_{ij}=\\tau_{ji}$, equivalente alla simmetria di $\\tens T$.' },
      },
      {
        id: 'l34-7',
        kind: 'riassunto',
        md: `**In una frase:** l'equilibrio alla traslazione di ogni parte diventa $\\operatorname{div}\\tens T+\\vet b=\\vet 0$ (teorema della divergenza); quello alla rotazione diventa $\\tens T=\\tens T^T$ (parallelepipedo).

- Equazioni nell'interno $\\mathring{\\mathcal B}$; sulla frontiera $\\tens T\\hat n=\\hat{\\vet s}$.
- div o Div: indifferente con l'equilibrio referenziale.
- Reciprocità $\\tau_{ij}=\\tau_{ji}$.`,
        orale: ['Perché $\\mathring{\\mathcal B}$; div o Div (dispensa, domanda 6).', 'Dimostrare il punto 2 (teorema della divergenza) e il punto 3 (parallelepipedo, reciprocità). (dispensa, domanda 7)'],
      },
    ],
  },
  // ================================================================== c3.5
  {
    concept: 'c3.5',
    title: 'Calcolare σ_n e τ su una giacitura',
    minutes: 14,
    source: D(3, '3.9–3.10', undefined, '48–49'),
    visual: ST({ mode: 'taglio', preset: 'esercizio', presets: ['esercizio', 'generico'], controls: ['preset', 'dir'] }),
    steps: [
      {
        id: 'l35-1',
        kind: 'spiega',
        title: 'Leggere la matrice di T',
        md: `Fissato un riferimento, le colonne di $[\\tens T]$ sono i vettori tensione sulle tre giaciture coordinate (§3.9). Di $\\vet t_{e_i}$ la componente lungo $\\hat e_i$ è la **tensione normale** $\\sigma_i$; le altre due, nel piano di normale $\\hat e_i$, sono **tangenziali** $\\tau_{ij}$ (giacitura $i$, direzione $j$).

Letta per colonne, la matrice avrebbe $\\tau_{21}$ dove ci aspetteremmo $\\tau_{12}$: per la simmetria la discordanza è irrilevante, e si scrive

$$[\\tens T]=\\begin{bmatrix}\\sigma_1&\\tau_{12}&\\tau_{13}\\\\\\tau_{12}&\\sigma_2&\\tau_{23}\\\\\\tau_{13}&\\tau_{23}&\\sigma_3\\end{bmatrix}.$$`,
      },
      {
        id: 'l35-2',
        kind: 'derivazione',
        title: 'σ_n è una forma quadratica',
        md: 'Dati $[\\tens T]$ simmetrico e $\\hat n$: $\\{\\vet t_n\\}=[\\tens T]\\{\\hat n\\}$ e poi la proiezione su $\\hat n$.',
        source: D(3, '3.10', undefined, 48),
        der: {
          sample: (r) => { const o: R = {}; putMat(o, 'T', T.sym(T.randMat(r))); putVec(o, 'n', T.unit(T.randVec(r))); return o; },
          lines: [
            { tex: '\\sigma_n=\\vet t_n\\cdot\\hat n=\\tens T\\hat n\\cdot\\hat n', why: 'Definizione di tensione normale.', val: (v) => traction(mat(v, 'T'), vec(v, 'n')).sigma },
            { tex: '=\\textstyle\\sum_{i,j}T_{ij}n_jn_i', why: 'Prodotto righe per colonna, poi scalare.', val: (v) => { const Tm = mat(v, 'T'); const n = vec(v, 'n'); let s = 0; for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) s += T.at(Tm, i, j) * n[j] * n[i]; return s; } },
            {
              tex: '=T_{11}n_1^2+T_{22}n_2^2+T_{33}n_3^2+2T_{12}n_1n_2+2T_{23}n_2n_3+2T_{31}n_3n_1',
              why: 'I termini doppi nascono da $T_{12}n_2n_1+T_{21}n_1n_2$ e dalla simmetria. È una forma quadratica completa in $\\hat n$.',
              ask: { q: 'Che cosa produce i fattori 2?', options: ['La simmetria di $\\tens T$', 'La normalizzazione di $\\hat n$', 'Il lemma di Cauchy', 'La forma ingegneristica'], correct: 0, why: '$T_{12}=T_{21}$: i due termini misti sono uguali e si sommano.' },
              val: (v) => { const Tm = mat(v, 'T'); const n = vec(v, 'n'); return Tm[0] * n[0] ** 2 + Tm[4] * n[1] ** 2 + Tm[8] * n[2] ** 2 + 2 * Tm[1] * n[0] * n[1] + 2 * Tm[5] * n[1] * n[2] + 2 * Tm[6] * n[2] * n[0]; },
              eq: '§3.10',
            },
          ],
        },
      },
      {
        id: 'l35-3',
        kind: 'derivazione',
        title: 'La componente tangenziale lungo ν̂',
        md: 'Con un versore $\\hat\\nu$ del piano ($\\hat n\\cdot\\hat\\nu=0$) si proietta $\\vet t_n$ su $\\hat\\nu$.',
        source: D(3, '3.10', undefined, 49),
        der: {
          sample: (r) => { const o: R = {}; putMat(o, 'T', T.sym(T.randMat(r))); const n = T.unit(T.randVec(r)); putVec(o, 'n', n); putVec(o, 'v', T.unit(T.cross(n, T.randVec(r)))); return o; },
          lines: [
            { tex: '\\tau_{n\\nu}=\\vet t_n\\cdot\\hat\\nu', why: 'Proiezione del vettore tensione sulla direzione scelta.', val: (v) => T.dotv(T.apply(mat(v, 'T'), vec(v, 'n')), vec(v, 'v')) },
            {
              tex: '=T_{11}n_1\\nu_1+T_{22}n_2\\nu_2+T_{33}n_3\\nu_3+T_{12}(n_1\\nu_2+n_2\\nu_1)+T_{23}(n_2\\nu_3+n_3\\nu_2)+T_{31}(n_3\\nu_1+n_1\\nu_3)',
              why: 'Stesso sviluppo, con la simmetria che raccoglie i termini misti.',
              val: (v) => { const t = mat(v, 'T'); const n = vec(v, 'n'); const u = vec(v, 'v'); return t[0] * n[0] * u[0] + t[4] * n[1] * u[1] + t[8] * n[2] * u[2] + t[1] * (n[0] * u[1] + n[1] * u[0]) + t[5] * (n[1] * u[2] + n[2] * u[1]) + t[6] * (n[2] * u[0] + n[0] * u[2]); },
              eq: '§3.10',
            },
          ],
          checks: [{ what: '|t_n|² = σ_n² + τ_n²', f: (v) => { const tr = traction(mat(v, 'T'), vec(v, 'n')); return [T.dotv(tr.t, tr.t), tr.sigma ** 2 + tr.tau ** 2]; } }],
        },
      },
      {
        id: 'l35-4',
        kind: 'spiega',
        title: 'La tangenziale totale',
        md: `$\\tau_{n\\nu}$ è la componente lungo la direzione scelta: in generale **non** è l'intera tangenziale. Quella si trova per via indiretta, $\\vet t_n\\to\\sigma_n\\to\\boldsymbol\\tau_n$:

$$\\boldsymbol\\tau_n=\\vet t_n-\\sigma_n\\hat n,\\qquad\\tau_n=|\\boldsymbol\\tau_n|,\\qquad\\hat\\mu=\\frac{\\boldsymbol\\tau_n}{\\tau_n}.$$

Il segno di $\\tau$ è inessenziale: la tangenziale fa scorrere le facce del taglio, e lo scorrimento avviene comunque. Controllo utile: $|\\vet t_n|^2=\\sigma_n^2+\\tau_n^2$.`,
      },
      {
        id: 'l35-5',
        kind: 'numeri',
        title: 'Esercizio §3.14, punto 4',
        md: `$[\\tens T]$ con righe $(0,-3,0)$, $(-3,0,6)$, $(0,6,0)$ e $\\hat n=(1,-1,-2)/\\sqrt6$:

- $\\{\\vet t_n\\}=\\frac3{\\sqrt6}(1,-5,-2)=(${f(TR314.t[0])};\\ ${f(TR314.t[1])};\\ ${f(TR314.t[2])})$;
- $\\sigma_n=${f(TR314.sigma)}$;
- $\\{\\boldsymbol\\tau_n\\}=-\\frac2{\\sqrt6}(1,5,-2)$, $\\tau_n=2\\sqrt5=${f(TR314.tau)}$;
- controllo: $|\\vet t_n|^2=${f(T.dotv(TR314.t, TR314.t))}=25+20$.`,
        values: { sigma: TR314.sigma, tau: TR314.tau },
        visual: ST({ mode: 'taglio', preset: 'esercizio', presets: ['esercizio'], dir: [-54.7356, -45] }),
      },
      {
        id: 'l35-5b',
        kind: 'domanda',
        q: { id: 'l35-q1', kind: 'scelta', q: 'Su una giacitura $|\\vet t_n|=5$ e $\\sigma_n=3$. Quanto vale $\\tau_n$?', options: ['4', '2', '8', '$\\sqrt{34}$'], correct: 0, why: '$|\\vet t_n|^2=\\sigma_n^2+\\tau_n^2$: $\\tau_n=\\sqrt{25-9}=4$ (§3.10).' },
      },
      {
        id: 'l35-6',
        kind: 'riassunto',
        md: `**In una frase:** $\\vet t_n=\\tens T\\hat n$; $\\sigma_n=\\tens T\\hat n\\cdot\\hat n$ (forma quadratica), $\\tau_{n\\nu}=\\vet t_n\\cdot\\hat\\nu$ (componente), $\\boldsymbol\\tau_n=\\vet t_n-\\sigma_n\\hat n$ (totale).

- Forma ingegneristica: $\\sigma_i$ in diagonale, $\\tau_{ij}=\\tau_{ji}$ fuori.
- Controllo $|\\vet t_n|^2=\\sigma_n^2+\\tau_n^2$.`,
        orale: ['Rappresentazione ingegneristica di $\\tens T$; calcolo di $\\sigma_n$, $\\tau_{n\\nu}$, $\\tau_n$. (dispensa, domanda 8)'],
      },
    ],
  },
  // ================================================================== c3.6
  {
    concept: 'c3.6',
    title: 'Tensioni principali e stati di tensione',
    minutes: 16,
    source: D(3, '3.11–3.12', 'Def 3.11.1', '49–52'),
    visual: ST({ mode: 'principali', presets: ['esercizio', 'generico', 'trazione', 'scorrimento', 'idrostatico'], controls: ['preset'] }),
    steps: [
      {
        id: 'l36-1',
        kind: 'spiega',
        title: 'Giaciture con sola tensione normale',
        md: `Al variare della giacitura cambia il vettore tensione. Esistono giaciture su cui la tensione è **solo normale**? La domanda ha senso meccanico: tangenziali e normali impegnano le risorse del materiale in modo diverso.

$$\\tens T\\hat n=\\lambda\\hat n\\iff(\\tens T-\\lambda\\tens I)\\hat n=\\vet 0:$$

gli **autovalori** sono le **tensioni principali** (su quelle giaciture $\\sigma_n=\\lambda$), gli **autovettori** le **direzioni principali**. **Def 3.11.1:** il piano ortogonale a una direzione principale è un **piano principale**: tangenziali nulle.

Si procede come per la deformazione (Cap. 2): il teorema spettrale vale perché $\\tens T$ è simmetrico, cioè per il punto 3 di Cauchy–Poisson.`,
      },
      {
        id: 'l36-2',
        kind: 'spiega',
        title: 'Equazione secolare e casi',
        md: `$\\lambda^3-I\\lambda^2+II\\lambda-III=0$ con $I=\\operatorname{tr}\\tens T$, $II$ somma dei minori principali di ordine 2, $III=\\det\\tens T$; nel riferimento principale $I=\\sum\\lambda_i$, $II=\\lambda_1\\lambda_2+\\lambda_2\\lambda_3+\\lambda_1\\lambda_3$, $III=\\lambda_1\\lambda_2\\lambda_3$. Si ordinano $s_1\\ge s_2\\ge s_3$.

- **Distinte:** $\\tens T=\\sum\\lambda_i\\hat n_i\\otimes\\hat n_i$, una sola terna principale.
- **Doppia:** $\\tens T=\\lambda_3\\hat n_3\\otimes\\hat n_3+\\lambda(\\tens I-\\hat n_3\\otimes\\hat n_3)$, $\\infty^1$ terne.
- **Tripla:** $\\tens T=\\lambda\\tens I$, ogni terna è principale: **stato idrostatico**, come una sferetta in un fluido in quiete.

La tensione generalizza la **pressione**: un fluido in quiete non sopporta tangenziali, un solido sì.`,
      },
      {
        id: 'l36-3',
        kind: 'prova',
        title: 'Le direzioni principali',
        md: 'Nel modello le tre direzioni principali con le loro tensioni, e (in giallo) la giacitura della tangenziale massima, che vedremo nella prossima lezione.',
        tasks: ['«idrostatico»: radice tripla, il motore sceglie una terna qualunque.', '«esercizio §3.14»: una tensione principale è nulla.', '«trazione semplice»: due sono nulle.'],
        visual: ST({ mode: 'principali', preset: 'generico', presets: ['generico', 'esercizio', 'trazione', 'idrostatico'], controls: ['preset'] }),
      },
      {
        id: 'l36-4',
        kind: 'spiega',
        title: 'Triassiale, biassiale, monoassiale',
        md: `Per una giacitura $\\hat m$ (componenti $m_i$ nel riferimento principale): $\\vet t_m=\\lambda_1m_1\\hat n_1+\\lambda_2m_2\\hat n_2+\\lambda_3m_3\\hat n_3$ (§3.12).

- **Triassiale** (tre non nulli): $\\vet t_m$ ha direzione generica.
- **Biassiale** ($\\lambda_1=0$): $\\vet t_m$ sta sempre nel piano $\\hat n_2\\hat n_3$, e sul piano di normale $\\hat n_1$ il vettore tensione è nullo: **piano scarico**. È lo stato tipico delle travi.
- **Monoassiale** ($\\lambda_1=\\lambda_2=0$): $\\vet t_m$ sempre parallelo a $\\hat n_3$; $\\infty^1$ piani scarichi (il fascio di asse $\\hat n_3$). Esempio: $\\operatorname{diag}(\\sigma,0,0)$, trazione o compressione semplice.

Dagli invarianti, senza calcolare gli autovalori: $III\\ne0$ triassiale; $III=0$, $II\\ne0$ biassiale; $III=II=0$ monoassiale.`,
      },
      {
        id: 'l36-5',
        kind: 'domanda',
        q: { id: 'l36-q1', kind: 'vf', q: 'In un provino in trazione (stato monoassiale) un taglio obliquo ha solo tensione normale.', answer: false, why: 'Attenzione di p. 52: il vettore tensione resta parallelo all’asse, ma sul taglio obliquo si scompone in $\\sigma_m$ e $\\tau_m$.' },
      },
      {
        id: 'l36-6',
        kind: 'numeri',
        title: 'Esercizio §3.14: classificazione e principali',
        md: `Invarianti: $I=${f(P314.invarianti[0])}$, $II=${f(P314.invarianti[1])}$, $III=${f(P314.invarianti[2])}$ → **${P314.stato}**. L'equazione secolare diventa $\\lambda(\\lambda^2-45)=0$:

$$s_1=3\\sqrt5=${f(P314.s[0])},\\quad s_2=0,\\quad s_3=-3\\sqrt5=${f(P314.s[2])}.$$

Direzioni (a meno del verso): $\\hat n_1=(${f(P314.n[0][0])};\\ ${f(P314.n[0][1])};\\ ${f(P314.n[0][2])})$, $\\hat n_2=(${f(P314.n[1][0])};\\ ${f(P314.n[1][1])};\\ ${f(P314.n[1][2])})$, $\\hat n_3=\\hat n_1\\wedge\\hat n_2$. La verifica $\\tens T\\hat n_3=-3\\sqrt5\\,\\hat n_3$, illeggibile negli appunti, è stata ricalcolata (nota NF-05).`,
        values: { s1: P314.s[0], s3: P314.s[2], II: P314.invarianti[1] },
        visual: ST({ mode: 'principali', preset: 'esercizio', presets: ['esercizio'] }),
      },
      {
        id: 'l36-7',
        kind: 'riassunto',
        md: `**In una frase:** le direzioni principali sono le giaciture con sola tensione normale; dal numero di tensioni principali nulle (letto sugli invarianti) lo stato è triassiale, biassiale (piano scarico) o monoassiale.

- Spettrale grazie alla simmetria di $\\tens T$.
- Idrostatico: $\\tens T=\\lambda\\tens I$.
- Monoassiale ≠ solo tensioni normali.`,
        orale: ['Tensioni e direzioni principali; casi dell’equazione secolare; stato idrostatico. (dispensa, domanda 9)', 'Classificazione degli stati di tensione (anche tramite gli invarianti); piano scarico; monoassiale e taglio obliquo. (dispensa, domanda 10)'],
      },
    ],
  },
  // ================================================================== c3.7
  {
    concept: 'c3.7',
    title: 'Tensioni estreme',
    minutes: 14,
    source: D(3, '3.13–3.14', 'Prop 3.13.1–3.13.2', '53–56'),
    visual: ST({ mode: 'principali', preset: 'esercizio', presets: ['esercizio', 'generico', 'trazione'], controls: ['preset'] }),
    steps: [
      {
        id: 'l37-1',
        kind: 'derivazione',
        title: 'Tensioni normali estreme (euristica)',
        md: 'Nel riferimento principale $[\\tens T]=\\operatorname{diag}(s_1,s_2,s_3)$. È un massimo vincolato ($\\hat m\\cdot\\hat m=1$): la dispensa lo risolve con un ragionamento euristico.',
        source: D(3, '3.13.1', 'Prop 3.13.1', 53),
        der: {
          sample: (r) => { const o: R = {}; putMat(o, 'T', T.sym(T.randMat(r))); putVec(o, 'm', T.unit(T.randVec(r))); return o; },
          lines: [
            { tex: '\\sigma_m=\\vet t_m\\cdot\\hat m', why: 'Tensione normale sulla giacitura $\\hat m$.', val: (v) => traction(mat(v, 'T'), vec(v, 'm')).sigma },
            { tex: '=s_1m_1^2+s_2m_2^2+s_3m_3^2', why: 'Nel riferimento principale $\\{\\vet t_m\\}=(s_1m_1,s_2m_2,s_3m_3)$.', val: (v) => { const p = principalStress(mat(v, 'T')); const m = vec(v, 'm'); return p.s.reduce((a, s, i) => a + s * T.dotv(m, p.n[i]) ** 2, 0); } },
            {
              tex: '\\le s_1(m_1^2+m_2^2+m_3^2)=s_1',
              why: 'Sostituendo $s_2$ e $s_3$ con $s_1\\ge s_2\\ge s_3$ si ottiene una quantità più grande; i pesi sono non negativi e sommano a 1. E $s_1$ è raggiunto su $\\hat n_1$: è il massimo.',
              ask: { q: 'Perché $s_1$ non è solo un estremo superiore ma il massimo?', options: ['Perché appartiene al codominio: è la tensione normale sulla giacitura $\\hat n_1$', 'Perché $s_1>0$', 'Perché $s_2=0$', 'Per i moltiplicatori di Lagrange'], correct: 0, why: '§3.13.1: un estremo superiore raggiunto è un massimo.' },
              eq: 'Prop 3.13.1',
            },
          ],
          checks: [{ what: 's3 ≤ σ_m ≤ s1', f: (v) => { const p = principalStress(mat(v, 'T')); const s = traction(mat(v, 'T'), vec(v, 'm')).sigma; return [s <= p.s[0] + 1e-12 && s >= p.s[2] - 1e-12 ? 1 : 0, 1]; } }],
        },
      },
      {
        id: 'l37-2',
        kind: 'spiega',
        title: 'Tangenziale massima: il risultato',
        md: `Per la tangenziale le incognite sono la giacitura $\\hat m$ **e** la direzione $\\hat\\nu\\perp\\hat m$:

$$\\tau_{m\\nu}=s_1m_1\\nu_1+s_2m_2\\nu_2+s_3m_3\\nu_3,$$

6 variabili con i vincoli $|\\hat m|=|\\hat\\nu|=1$, $\\hat m\\cdot\\hat\\nu=0$. L'euristica non basta: servono i moltiplicatori di Lagrange, e la dispensa dà il **risultato** (Prop 3.13.2):

$$\\tau_{\\max}=\\frac{s_1-s_3}2,\\qquad\\hat m=\\tfrac1{\\sqrt2}(\\hat n_1-\\hat n_3),\\qquad\\hat\\nu=\\tfrac1{\\sqrt2}(\\hat n_1+\\hat n_3):$$

la semidifferenza tra la principale massima e la minima, sulla bisettrice del quadrante $\\hat n_1$–$\\hat n_3$ (figura di p. 54). Gli appunti avevano $\\frac1{\\sqrt2}(\\hat m_1-\\hat m_2)$: la combinazione giusta è tra le direzioni di $s_1$ e $s_3$.`,
      },
      {
        id: 'l37-3',
        kind: 'derivazione',
        title: 'Verifica (non dimostrazione)',
        md: 'Nel riferimento principale $\\hat m=(1,0,-1)/\\sqrt2$ e $\\hat\\nu=(1,0,1)/\\sqrt2$.',
        source: D(3, '3.13.2', 'Prop 3.13.2', 54),
        der: {
          sample: (r) => { const o: R = {}; putMat(o, 'T', T.sym(T.randMat(r))); return o; },
          lines: [
            { tex: '\\tau_{m\\nu}=\\tens T\\hat m\\cdot\\hat\\nu', why: 'Componente tangenziale lungo $\\hat\\nu$ (calcolata dal motore con le direzioni principali vere).', val: (v) => { const t = tauMax(mat(v, 'T')); return traction(mat(v, 'T'), t.m, t.nu).tauNu; } },
            { tex: '=\\tfrac12\\big(s_1\\cdot1\\cdot1+s_3\\cdot(-1)\\cdot1\\big)=\\tfrac12(s_1-s_3)', why: 'Componenti nel riferimento principale: solo i termini 1 e 3.', val: (v) => { const p = principalStress(mat(v, 'T')); return (p.s[0] - p.s[2]) / 2; }, eq: 'Prop 3.13.2' },
          ],
          checks: [{ what: 'σ sullo stesso piano = (s1 + s3)/2', f: (v) => { const t = tauMax(mat(v, 'T')); const p = principalStress(mat(v, 'T')); return [traction(mat(v, 'T'), t.m).sigma, (p.s[0] + p.s[2]) / 2]; } }],
        },
      },
      {
        id: 'l37-4',
        kind: 'domanda',
        q: { id: 'l37-q1', kind: 'vf', q: 'La giacitura della tangenziale massima è scarica di tensione normale.', answer: false, why: '§3.13.2: su di essa $\\sigma_m=\\frac12(s_1+s_3)$, in generale non nulla.' },
      },
      {
        id: 'l37-5',
        kind: 'numeri',
        title: 'Esercizio §3.14, punto 3',
        md: `$\\tau_{\\max}=\\frac{3\\sqrt5-(-3\\sqrt5)}2=3\\sqrt5=${f(TM314.value)}$ sulla giacitura $\\{\\hat n\\}=\\frac{\\sqrt5}5(1,0,-2)$, in direzione $\\hat\\nu=(0,-1,0)$ (a meno del verso). Su quel piano $\\sigma=\\frac12(s_1+s_3)=${f(TM314.sigmaOn)}$: qui è nulla perché $s_1=-s_3$. Gli appunti scrivevano il fattore $\\frac12$ al posto di $\\frac1{\\sqrt2}$.`,
        values: { tmax: TM314.value },
        visual: ST({ mode: 'principali', preset: 'esercizio', presets: ['esercizio'] }),
      },
      {
        id: 'l37-6',
        kind: 'riassunto',
        md: `**In una frase:** le tensioni principali estreme sono gli estremi della tensione normale, e la tangenziale massima è $(s_1-s_3)/2$ a 45° tra $\\hat n_1$ e $\\hat n_3$, su un piano non scarico.

- $s_3\\le\\sigma_m\\le s_1$: ragionamento euristico.
- $\\tau_{\\max}$: risultato con Lagrange, solo verificato.`,
        orale: ['Tensioni normali estreme (metodo euristico) e tensione tangenziale massima. (dispensa, domanda 11)'],
      },
    ],
  },
  // ================================================================== c3.8
  {
    concept: 'c3.8',
    title: 'Il cerchio di Mohr',
    minutes: 22,
    source: D(3, '3.15', 'Prop 3.15.1', '56–60'),
    visual: MOHR({ preset: 'esempio', alpha: 30 }),
    steps: [
      {
        id: 'l38-1',
        kind: 'spiega',
        title: 'Un fascio di piani attorno a una direzione principale',
        md: `Mohr è una rappresentazione **grafica** dello stato di tensione in un punto, per i piani di un fascio che ha per asse una direzione principale. Un tempo era molto usata perché fa vedere cose che il calcolo matriciale nasconde.

Sia (§3.15.1)

$$[\\tens T]=\\begin{bmatrix}\\sigma_1&\\tau_{12}&0\\\\\\tau_{12}&\\sigma_2&0\\\\0&0&\\sigma_3\\end{bmatrix}:$$

$\\hat e_3$ è principale. Un piano del fascio di asse $\\hat e_3$ ha giacitura $\\hat m=(\\cos\\alpha,\\sin\\alpha,0)$; la direzione $\\hat\\nu=(-\\sin\\alpha,\\cos\\alpha,0)$ è $\\hat m$ ruotato di 90° in senso antiorario. Il vettore tensione sta nel piano $\\hat e_1\\hat e_2$: tutto si riduce a quel piano, anche se lo stato è triassiale.`,
      },
      {
        id: 'l38-2',
        kind: 'derivazione',
        title: 'σ_m in funzione di 2α',
        md: 'Con $\\sigma_m=\\tens T\\hat m\\cdot\\hat m$ e le formule di duplicazione.',
        source: D(3, '3.15.2', undefined, 57),
        der: {
          sample: sampleMohr,
          lines: [
            { tex: '\\sigma_m=\\sigma_1\\cos^2\\alpha+\\sigma_2\\sin^2\\alpha+2\\tau_{12}\\sin\\alpha\\cos\\alpha', why: 'Forma quadratica con $\\hat m=(\\cos\\alpha,\\sin\\alpha,0)$.', val: (v) => v.s1 * Math.cos(v.a) ** 2 + v.s2 * Math.sin(v.a) ** 2 + 2 * v.t * Math.sin(v.a) * Math.cos(v.a) },
            {
              tex: '=\\sigma_1\\tfrac{1+\\cos2\\alpha}2+\\sigma_2\\tfrac{1-\\cos2\\alpha}2+\\tau_{12}\\sin2\\alpha',
              why: 'Formule $\\cos^2\\alpha=\\frac{1+\\cos2\\alpha}2$, $\\sin^2\\alpha=\\frac{1-\\cos2\\alpha}2$, $2\\sin\\alpha\\cos\\alpha=\\sin2\\alpha$.',
              val: (v) => (v.s1 * (1 + Math.cos(2 * v.a))) / 2 + (v.s2 * (1 - Math.cos(2 * v.a))) / 2 + v.t * Math.sin(2 * v.a),
            },
            { tex: '=\\dfrac{\\sigma_1+\\sigma_2}2+\\dfrac{\\sigma_1-\\sigma_2}2\\cos2\\alpha+\\tau_{12}\\sin2\\alpha', why: 'Si raccolgono i termini costanti e quelli in $\\cos2\\alpha$.', val: (v) => mohr({ s1: v.s1, s2: v.s2, t12: v.t }).at(v.a).sigma, eq: '§3.15.2' },
          ],
        },
      },
      {
        id: 'l38-3',
        kind: 'derivazione',
        title: 'L’equazione del cerchio',
        md: 'Analogamente $\\tau_{m\\nu}=-\\frac{\\sigma_1-\\sigma_2}2\\sin2\\alpha+\\tau_{12}\\cos2\\alpha$. Si porta a sinistra la semisomma, si eleva al quadrato e si somma.',
        source: D(3, '3.15.2', undefined, 57),
        der: {
          sample: sampleMohr,
          lines: [
            { tex: '\\Big(\\sigma_m-\\dfrac{\\sigma_1+\\sigma_2}2\\Big)^2+\\tau_{m\\nu}^2', why: 'Somma dei quadrati delle due espressioni.', val: (v) => { const q = mohr({ s1: v.s1, s2: v.s2, t12: v.t }).at(v.a); return (q.sigma - (v.s1 + v.s2) / 2) ** 2 + q.tau ** 2; } },
            {
              tex: '=\\Big(\\dfrac{\\sigma_1-\\sigma_2}2\\Big)^2(\\cos^22\\alpha+\\sin^22\\alpha)+\\tau_{12}^2(\\sin^22\\alpha+\\cos^22\\alpha)',
              why: 'I doppi prodotti si elidono (segni opposti).',
              val: (v) => ((v.s1 - v.s2) / 2) ** 2 * (Math.cos(2 * v.a) ** 2 + Math.sin(2 * v.a) ** 2) + v.t ** 2,
            },
            {
              tex: '=\\Big(\\dfrac{\\sigma_1-\\sigma_2}2\\Big)^2+\\tau_{12}^2=R^2',
              why: '$\\cos^2+\\sin^2=1$: $\\alpha$ sparisce. Nel piano $(\\sigma_m,\\tau_{m\\nu})$ è un cerchio di centro $C=(\\frac{\\sigma_1+\\sigma_2}2,0)$.',
              ask: { q: 'Che cosa compare nel raggio?', options: ['La semidifferenza $\\frac{\\sigma_1-\\sigma_2}2$ e $\\tau_{12}$', 'La semisomma $\\frac{\\sigma_1+\\sigma_2}2$', '$\\sigma_3$', 'L\'angolo $\\alpha$'], correct: 0, why: 'Gli appunti avevano un refuso con la semisomma (Attenzione, p. 57).' },
              val: (v) => mohr({ s1: v.s1, s2: v.s2, t12: v.t }).R ** 2,
              eq: '§3.15.2',
            },
          ],
        },
      },
      {
        id: 'l38-4',
        kind: 'spiega',
        title: 'Costruzione con il polo',
        md: `**Convenzione:** asse $\\sigma$ concorde a $\\hat e_1$, asse $\\tau$ concorde a $-\\hat e_2$, cioè **verso il basso**.

1. $A(\\sigma_1,0)$ e $B(\\sigma_2,0)$, con $B$ a sinistra;
2. il centro $C$, a metà;
3. il **polo di rappresentazione** $P(\\sigma_1,-\\tau_{12})$;
4. il cerchio di centro $C$ per $P$: $\\overline{CP}^2=R^2$.

$Q_0(\\sigma_1,\\tau_{12})$, simmetrico di $P$, rappresenta $\\hat m=\\hat e_1$ ($\\alpha=0$).

**Impiego:** per $P$ si traccia la retta parallela a $\\hat\\nu$ (la traccia del piano di giacitura $\\hat m$): incontra il cerchio in $Q_m(\\sigma_m,\\tau_{m\\nu})$.`,
        visual: MOHR({ preset: 'esempio', alpha: 30, principali: false }),
      },
      {
        id: 'l38-5',
        kind: 'derivazione',
        title: 'Correttezza della costruzione',
        md: '$\\widehat{Q_0PQ_m}=\\alpha$ è un angolo alla circonferenza: al centro diventa $2\\alpha$. Con $\\widehat{Q_0PM}=\\gamma$, l\'angolo al centro di $Q_m$ da $M$ è $\\Theta=2\\gamma-2\\alpha$. Dal triangolo $CAQ_0$: $\\frac{\\sigma_1-\\sigma_2}2=R\\cos2\\gamma$, $\\tau_{12}=R\\sin2\\gamma$.',
        source: D(3, '3.15.4', 'Prop 3.15.1', '58–59'),
        der: {
          sample: sampleMohr,
          lines: [
            { tex: 'R\\cos(2\\gamma-2\\alpha)', why: 'Ascissa di $Q_m$ rispetto a $C$ secondo la figura.', val: (v) => { const M = mohr({ s1: v.s1, s2: v.s2, t12: v.t }); const g2 = Math.atan2(v.t, (v.s1 - v.s2) / 2); return M.R * Math.cos(g2 - 2 * v.a); } },
            { tex: '=R\\cos2\\gamma\\cos2\\alpha+R\\sin2\\gamma\\sin2\\alpha', why: 'Formula di sottrazione del coseno.', val: (v) => { const M = mohr({ s1: v.s1, s2: v.s2, t12: v.t }); const g2 = Math.atan2(v.t, (v.s1 - v.s2) / 2); return M.R * Math.cos(g2) * Math.cos(2 * v.a) + M.R * Math.sin(g2) * Math.sin(2 * v.a); } },
            {
              tex: '=\\dfrac{\\sigma_1-\\sigma_2}2\\cos2\\alpha+\\tau_{12}\\sin2\\alpha=\\sigma_m-\\sigma_C',
              why: 'Dal triangolo $CAQ_0$. È proprio $\\sigma_m$ meno il centro: la costruzione dà la tensione normale giusta. Lo stesso con il seno dà $\\tau_{m\\nu}$.',
              ask: { q: 'Quanto vale $R\\cos2\\gamma$?', options: ['$\\frac{\\sigma_1-\\sigma_2}2$', '$\\tau_{12}$', '$\\frac{\\sigma_1+\\sigma_2}2$', '$R$'], correct: 0, why: 'È il cateto $\\overline{AC}$ del triangolo $CAQ_0$.' },
              val: (v) => mohr({ s1: v.s1, s2: v.s2, t12: v.t }).at(v.a).sigma - (v.s1 + v.s2) / 2,
              eq: 'Prop 3.15.1',
            },
          ],
          checks: [{ what: 'R sin(2γ − 2α) = τ_mν', f: (v) => { const M = mohr({ s1: v.s1, s2: v.s2, t12: v.t }); const g2 = Math.atan2(v.t, (v.s1 - v.s2) / 2); return [M.R * Math.sin(g2 - 2 * v.a), M.at(v.a).tau]; } }],
        },
      },
      {
        id: 'l38-6',
        kind: 'prova',
        title: 'Usa il cerchio',
        md: 'Muovi $\\alpha$: la retta verde (traccia del piano per il polo) scorre e $Q_m$ percorre il cerchio.',
        tasks: ['Con $\\alpha=0$ la retta è verticale e $Q_m=Q_0$.', 'Il cerchietto vuoto è la faccia ortogonale: sempre diametralmente opposto.', 'Accendi le principali: $S_{1,2}=C\\pm R$; le rette $PS_1$ e $PS_2$ sono le tracce $\\eta$ e $\\xi$ dei piani principali.', 'Accendi le tangenziali estreme: $\\tau_{\\max}=R$, sui piani a 45° da quelli principali.'],
        visual: MOHR({ preset: 'generico', alpha: 0, principali: false }),
      },
      {
        id: 'l38-7',
        kind: 'spiega',
        title: 'Principali e tangenziali estreme dal cerchio',
        md: `**Faccia di normale $\\hat\\nu$:** l'asse $\\hat m$ per $P$ dà $Q'_m$, diametralmente opposto, di coordinate $(\\sigma_\\nu,-\\tau_{\\nu m})$. Il segno meno non contraddice la reciprocità: per la faccia $\\hat m'=\\hat\\nu$ la direzione ruotata di 90° è $-\\hat m$ (lemma di Cauchy). **Facce ortogonali → punti diametralmente opposti.**

**Principali** (§3.15.5): le intersezioni con l'asse $\\sigma$,

$$s_{1,2}=\\frac{\\sigma_1+\\sigma_2}2\\pm\\sqrt{\\Big(\\frac{\\sigma_1-\\sigma_2}2\\Big)^2+\\tau_{12}^2},\\qquad\\tan2\\gamma=\\frac{2\\tau_{12}}{\\sigma_1-\\sigma_2}.$$

(Negli appunti «$A,B=C\\pm R$»: sono $S_1,S_2$.)

**Tangenziali estreme** (§3.15.6): i punti più alto e più basso, uniti a $P$, danno i piani $\\alpha$ e $\\beta$; $\\tau_{\\max}=R$, con tensione normale $\\sigma_C$ (non nulla), a 45° dai piani principali. In uno stato triassiale $R$ è la massima nel fascio; quella assoluta è $\\frac{s_{\\max}-s_{\\min}}2$ con tutte e tre le principali.`,
        visual: MOHR({ preset: 'generico', alpha: 20, principali: true, tmax: true }),
      },
      {
        id: 'l38-8',
        kind: 'riassunto',
        md: `**In una frase:** per i piani di un fascio di asse principale, $(\\sigma_m,\\tau_{m\\nu})$ percorre un cerchio di centro $\\frac{\\sigma_1+\\sigma_2}2$ e raggio $R$; dal polo $P(\\sigma_1,-\\tau_{12})$ la parallela alla traccia del piano dà il punto.

- Asse $\\tau$ verso il basso; angoli doppi sul cerchio.
- $s_{1,2}=\\sigma_C\\pm R$, $\\tan2\\gamma=2\\tau_{12}/(\\sigma_1-\\sigma_2)$, $\\tau_{\\max}=R$ a 45°.
- Facce ortogonali: punti opposti.`,
        orale: ['Cerchio di Mohr: derivazione, costruzione, polo, dimostrazione, facce ortogonali, tensioni principali, $\\tau_{\\max}$. (dispensa, domanda 12)'],
      },
    ],
  },
  // ================================================================== c3.9
  {
    concept: 'c3.9',
    title: 'Mohr al lavoro: esempi e arbelo',
    minutes: 16,
    source: D(3, '3.16–3.17', 'Teo 3.17.1', '60–63'),
    visual: MOHR({ preset: 'trazione', alpha: 45, tmax: true }),
    steps: [
      {
        id: 'l39-1',
        kind: 'spiega',
        title: 'Scorrimento semplice',
        md: `Solo $\\tau_{12}=\\tau>0$ (§3.16.1). Il piano di normale $\\hat e_3$ è principale e scarico; $III=0$, $II=-\\tau^2\\ne0$: biassiale.

Costruzione: $A=B=C=(0,0)$, polo $P=(0,-\\tau)$, cerchio centrato nell'origine di raggio $\\tau$.

- Principali $s_1=\\tau$ (trazione), $s_2=-\\tau$ (compressione), sulle **bisettrici** degli assi.
- $\\tau_{\\max}=\\tau$, sui piani coordinati.

Con $\\alpha=30°$: $\\sigma_m=\\tau\\sin60°=\\frac{\\sqrt3}2\\tau$, $\\tau_{m\\nu}=\\tau\\cos60°=\\frac\\tau2$; si verifica con $\\vet t_m=(\\tau/2,\\sqrt3\\tau/2,0)$.`,
        visual: MOHR({ preset: 'scorrimento', alpha: 30, principali: true }),
      },
      {
        id: 'l39-2',
        kind: 'spiega',
        title: 'Trazione semplice e linee di Lüders',
        md: `$\\operatorname{diag}(\\sigma,0,0)$ con $\\sigma=F/A$ (§3.16.2): monoassiale. $A=(\\sigma,0)\\equiv P$, $B=(0,0)$, $C=(\\sigma/2,0)$, $R=\\sigma/2$: il cerchio passa per l'origine.

La tangenziale massima vale $\\sigma/2$ e agisce su due piani ortogonali, a $\\pm45°$ dalla direzione della trazione, con tensione normale $\\sigma/2$ e tangenziali di segno opposto.

**Per l'orale:** sono i piani più sollecitati a scorrimento. Su un provino in trazione rivestito di vernice fragile compare una doppia famiglia di linee a 45°: le **linee di Lüders**. Lo snervamento è governato più dalla tangenziale massima che dalla normale massima: è l'idea dei criteri di **Tresca** e **von Mises** (Cap. 6).`,
        visual: MOHR({ preset: 'trazione', alpha: 45, principali: false, tmax: true }),
      },
      {
        id: 'l39-3',
        kind: 'domanda',
        q: { id: 'l39-q1', kind: 'scelta', q: 'Nella trazione semplice il cerchio di Mohr…', options: ['passa per l’origine e ha raggio $\\sigma/2$', 'è centrato nell’origine', 'ha raggio $\\sigma$', 'degenera in un punto'], correct: 0, why: '§3.16.2: $A\\equiv P=(\\sigma,0)$ e $B=(0,0)$; il centro è $\\sigma/2$.' },
      },
      {
        id: 'l39-4',
        kind: 'prova',
        title: 'L’arbelo',
        md: 'Tre cerchi sulle tensioni principali e i punti di 300 giaciture prese a caso, calcolati dal motore.',
        tasks: ['Nel caso triassiale i punti riempiono la regione grigia tra il cerchio massimo e i due minori (Teo 3.17.1).', 'Nessun punto supera l\'ordinata $\\tau_{\\max}=(s_1-s_3)/2$, raggio del cerchio massimo.', 'Con l\'esempio §3.17.2 il cerchio massimo è quello tra $s_1$ e 0.'],
        visual: { kind: 'svg', id: 'arbelo', params: { caso: 'generico' } },
      },
      {
        id: 'l39-5',
        kind: 'numeri',
        title: 'Esempio numerico §3.17.2',
        md: `$\\sigma_1=98$, $\\sigma_2=14$, $\\tau_{12}=21$ MPa, piano $\\hat e_3$ scarico.

- $C=(${fd(M3172.C)};0)$, $R=\\sqrt{42^2+21^2}=${fd(M3172.R)}$ MPa;
- $s_1=${fd(M3172.sMax)}$, $s_2=${fd(M3172.sMin)}$ MPa (entrambe di trazione);
- $\\tan2\\gamma=42/84=0{,}5$, $\\gamma=${fd((M3172.gamma * 180) / Math.PI)}°$ (gli appunti riportavano 31,72° = 45° − 13,28°);
- $\\alpha=30°$: $\\sigma_m=${fd(Q30.sigma)}$, $\\tau_{m\\nu}=${fd(Q30.tau)}$ MPa; faccia ortogonale $\\sigma_\\nu=${fd(Q120.sigma)}$ MPa, e $\\sigma_m+\\sigma_\\nu=${fd(Q30.sigma + Q120.sigma)}=\\sigma_1+\\sigma_2$ (invariante).

Attenzione: $\\tau_{\\max}=R$ vale **nel fascio** di asse $\\hat e_3$. Con la terza principale nulla, l'arbelo dice che la massima assoluta è $(s_1-0)/2=${fd(M3172.sMax / 2)}$ MPa, sui piani del fascio di asse $\\hat n_2$.`,
        values: { R: M3172.R, s1: M3172.sMax, s2: M3172.sMin, sigma30: Q30.sigma, tau30: Q30.tau },
        visual: MOHR({ preset: 'esempio', alpha: 30, principali: true }),
      },
      {
        id: 'l39-6',
        kind: 'riassunto',
        md: `**In una frase:** con Mohr la trazione semplice mostra la tangenziale massima $\\sigma/2$ a 45° (linee di Lüders, Tresca e von Mises); in tre dimensioni ogni giacitura cade nell'arbelo, e la massima assoluta è il raggio del cerchio massimo.

- Scorrimento: principali $\\pm\\tau$ a 45°.
- Esempio §3.17.2: $R$ nel fascio ≠ $\\tau_{\\max}$ assoluta.`,
        orale: ['Trazione semplice e scorrimento semplice con Mohr; linee di Lüders e legame con i criteri di resistenza. (dispensa, domanda 13)', 'Arbelo di Mohr: costruzione dei tre cerchi e significato della regione ammissibile. (dispensa, domanda 14)'],
      },
    ],
  },
];
