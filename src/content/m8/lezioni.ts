/**
 * Lezioni guidate del Modulo 8 (Cap. 6). Derivazioni solo dove la dispensa le sviluppa; le righe con `val` sono
 * verificate su 25 campioni casuali (tests/lezioni.test.ts). Numeri da engine/criteri, engine/elastico, engine/tensione.
 */
import { D } from '../../engine/types';
import * as T from '../../engine/tensor';
import * as C from '../../engine/criteri';
import * as El from '../../engine/elastico';
import { tauMax } from '../../engine/tensione';
import { eigSym } from '../../engine/spettro';
import type { Lesson, LessonVisual } from '../types';

type R = Record<string, number>;
const SVG = (id: 'criteri' | 'jourawski', params?: Record<string, string | number | boolean>): LessonVisual => ({ kind: 'svg', id, params });
const SPAZIO = (stato: 'trazione' | 'taglio' | 'huber' | 'generico', show: ('vonMises' | 'tresca' | 'beltrami' | 'galileo')[]): LessonVisual => ({ kind: 'criteri3d', scene: { mode: 'spazio', stato, show } });

const sample = (r: () => number): R => {
  const o: R = { a: 4 * r() - 2, b: 4 * r() - 2, c: 4 * r() - 2, nu: 0.05 + 0.4 * r(), E: 1 + 3 * r(), mu: 0.5 + 2 * r(), la: 0.2 + 2 * r(), p: 0.2 + 3 * r(), sz: 4 * r() - 2, tx: 2 * r() - 1, ty: 2 * r() - 1, co: 0.5 + r(), phi: 0.1 + 0.8 * r() };
  for (let k = 0; k < 6; k++) o[`e${k}`] = 2 * r() - 1;
  return o;
};
const S3 = (v: R): C.S3 => C.sortS([v.a, v.b, v.c]);
const diag = (s: C.S3): T.Mat => [s[0], 0, 0, 0, s[1], 0, 0, 0, s[2]];
const Esym = (v: R): T.Mat => [v.e0, v.e3, v.e5, v.e3, v.e1, v.e4, v.e5, v.e4, v.e2];

export const M8_LEZIONI: Lesson[] = [
  // ================================================================== c8.1
  {
    concept: 'c8.1',
    title: 'Dalla risposta alla verifica',
    minutes: 12,
    source: D(6, '6.1–6.2', 'Def 6.2.1', '144–146'),
    visual: SVG('criteri', { tab: 'verifica' }),
    steps: [
      {
        id: 'l81-1',
        kind: 'spiega',
        title: 'Quando il materiale va in crisi?',
        md: `I problemi visti finora sono di **risposta**: lineari (carichi doppi, risposte doppie), dicono quanto valgono tensioni e deformazioni, ma non quando il materiale va in **crisi** (locale: una lesione; globale: il collasso). Serve **verificare** che lo stato di tensione sia compatibile con la resistenza.

- **Duttili** (acciaio da carpenteria): snervamento $\\sigma_y$ e ampio campo plastico; stesso comportamento in trazione e compressione ($\\pm\\sigma_y$).
- **Fragili** (calcestruzzo): poca deformazione prima della rottura; resistenza a compressione molto maggiore di quella a trazione.

In uno stato monoassiale basta confrontare con la prova.`,
      },
      {
        id: 'l81-2',
        kind: 'spiega',
        title: 'Verifica di resistenza',
        md: `Lo stato di esercizio $\\tens T_{es}(P)$ è l'effetto dei carichi (il telaio di una moto) e si verifica **nel punto**: in tutti i punti, o in quelli che garantiscono gli altri. Nel caso monoassiale $[\\tens T_{es}]=\\operatorname{diag}(\\sigma_{es},0,0)$.

**Tensione limite** $\\sigma_L$: per i duttili $\\sigma_L=\\sigma_y$ (in esercizio non si accettano deformazioni permanenti), per i fragili $\\sigma_L=\\sigma_R$. Il dominio di resistenza è un segmento:

$$\\sigma_L^c\\le\\sigma_{es}\\le\\sigma_L^t\\qquad\\text{(condizione di resistenza).}$$`,
      },
      {
        id: 'l81-3',
        kind: 'spiega',
        title: 'Verifica di sicurezza',
        md: `Non si può lambire la crisi: basterebbe un uccellino che si posa sulla copertura. Geometria, carichi, modello e resistenza sono incerti; le incertezze si riducono ma non si eliminano.

**Def 6.2.1.** Coefficiente di sicurezza $\\nu\\ge1$ (qui $\\nu$ non è il coefficiente di Poisson), divisore delle resistenze:

$$\\sigma_{adm}:=\\frac{\\sigma_L}\\nu,\\qquad\\sigma_{adm}^c\\le\\sigma_{es}\\le\\sigma_{adm}^t\\quad\\text{(metodo delle tensioni ammissibili).}$$

Valori indicativi: acciaio 1,7–1,8; legno 2,5; calcestruzzo 3; muratura 4–10. Più bassi per i duttili, che hanno una riserva oltre lo snervamento. Il dominio di sicurezza sta dentro quello di resistenza.`,
      },
      {
        id: 'l81-4',
        kind: 'prova',
        title: 'Due domini sullo stesso asse',
        md: 'Sposta la tensione di esercizio e confronta i due domini.',
        tasks: ['Acciaio: dominio simmetrico; tra σ_adm e σ_L la resistenza è verificata ma la sicurezza no.', 'Calcestruzzo: in trazione il dominio è molto più corto che in compressione.'],
        visual: SVG('criteri', { tab: 'verifica' }),
      },
      {
        id: 'l81-5',
        kind: 'domanda',
        q: { id: 'l81-q1', kind: 'scelta', q: 'Che cosa rappresenta il coefficiente ν della Def 6.2.1?', options: ['Un divisore delle resistenze che tiene conto delle incertezze', 'Il coefficiente di Poisson', 'Il rapporto tra trazione e compressione', 'Un moltiplicatore dei carichi'], correct: 0, why: 'Def 6.2.1 (attenzione al simbolo, NF-08).' },
      },
      {
        id: 'l81-6',
        kind: 'riassunto',
        md: `**In una frase:** in uno stato monoassiale si verifica $\\sigma_L^c\\le\\sigma_{es}\\le\\sigma_L^t$ (resistenza) e, con $\\sigma_{adm}=\\sigma_L/\\nu$, $\\sigma_{adm}^c\\le\\sigma_{es}\\le\\sigma_{adm}^t$ (sicurezza).

- Duttili: $\\sigma_L=\\sigma_y$; fragili: $\\sigma_L=\\sigma_R$, diverse in trazione e compressione.
- $\\nu$ più basso per i duttili.`,
        orale: ['Duttili e fragili; tensione limite; verifica di resistenza monoassiale. (dispensa, domanda 1)', 'Coefficiente di sicurezza, tensione ammissibile, dominio di sicurezza. (dispensa, domanda 2)'],
      },
    ],
  },
  // ================================================================== c8.2
  {
    concept: 'c8.2',
    title: 'Perché servono i criteri',
    minutes: 12,
    source: D(6, '6.3', 'Def 6.3.1', '147–148'),
    visual: SVG('criteri', { tab: 'piano' }),
    steps: [
      {
        id: 'l82-1',
        kind: 'spiega',
        title: 'Un tensore non si confronta con un numero',
        md: `Per uno stato pluriassiale servirebbe il dominio limite nello spazio a 6 dimensioni delle componenti di $\\tens T$: proibitivo da determinare (le prove biassiali si fanno solo nella ricerca). Le prove sono monoassiali: bisognerebbe confrontare un vettore a 6 componenti con $(\\sigma_L,0,0,0,0,0)$, ma **tra vettori non esiste un ordinamento univoco**.

**Def 6.3.1.** Un **criterio di resistenza** è un modello che dalle tensioni di esercizio ricava una **tensione ideale** $\\sigma_{id}$: la tensione monoassiale fittizia **ugualmente pericolosa** (equivalenza del cimento). Ogni criterio parte da una congettura sulla causa della crisi, tradotta in una **funzione di crisi** $F(\\sigma_x,\\sigma_y,\\sigma_z,\\tau_{xy},\\tau_{yz},\\tau_{zx})$.`,
      },
      {
        id: 'l82-2',
        kind: 'derivazione',
        title: 'La procedura per i materiali isotropi',
        md: 'Se il materiale è isotropo fino alla crisi e la crisi è isotropa, si usa il riferimento principale. Catena di passaggi logici.',
        source: D(6, '6.3.3', undefined, '147–148'),
        der: {
          lines: [
            { tex: 'F(\\sigma_x,\\dots,\\tau_{zx})\\ \\to\\ F(s_1,s_2,s_3)', why: 'Isotropia: da 6 a 3 dimensioni.' },
            { tex: '\\tens T_{es}\\ \\to\\ s_1,s_2,s_3\\ \\to\\ F(s_1,s_2,s_3)', why: '1) Calcolo dello stato di esercizio e delle tensioni principali.' },
            { tex: 'F(\\sigma_L,0,0)', why: '2) Dalla prova monoassiale.' },
            {
              tex: 'F(s_1,s_2,s_3)\\le F(\\sigma_L,0,0)\\iff\\sigma_{id}(s_1,s_2,s_3)\\le\\sigma_L',
              why: '3) Verifica; isolando $\\sigma_L$ si ottiene la tensione ideale.',
              ask: { q: 'Da dove viene il secondo membro della verifica?', options: ['Dalla prova monoassiale', 'Dal calcolo strutturale', 'Dalla norma', 'Dal legame costitutivo'], correct: 0, why: '§6.3.3.' },
              eq: '(⋆) §6.3.3',
            },
          ],
        },
      },
      {
        id: 'l82-3',
        kind: 'spiega',
        title: 'Due osservazioni',
        md: `1. Con resistenze diverse in trazione e compressione servono due funzioni, $F^t$ e $F^c$, e due disuguaglianze.
2. Per la verifica di sicurezza al posto di $\\sigma_L$ si usa $\\sigma_{adm}$.

Il criterio si sceglie in base agli esperimenti sul materiale: non ce n'è uno valido per tutti.`,
      },
      {
        id: 'l82-4',
        kind: 'prova',
        title: 'Un punto, cinque risposte',
        md: 'Nel piano s₃ = 0 lo stesso punto di lavoro dà tensioni ideali diverse a seconda del criterio.',
        tasks: ['Metti il punto in trazione semplice (σ_b = 0): tutti i criteri danno σ_id = σ.', 'Spostalo in puro taglio (σ_b = −σ_a): i criteri si separano.'],
        visual: SVG('criteri', { tab: 'piano' }),
      },
      {
        id: 'l82-5',
        kind: 'domanda',
        q: { id: 'l82-q1', kind: 'vf', q: 'La tensione ideale è la tensione principale massima dello stato di esercizio.', answer: false, why: 'Def 6.3.1: è una tensione monoassiale fittizia, ugualmente pericolosa; coincide con $s_1$ solo per Galileo.' },
      },
      {
        id: 'l82-6',
        kind: 'riassunto',
        md: `**In una frase:** un criterio traduce una congettura sulla crisi in una funzione $F$; per materiali isotropi $F(s_1,s_2,s_3)\\le F(\\sigma_L,0,0)$ equivale a $\\sigma_{id}\\le\\sigma_L$.

- Tra vettori non c'è ordinamento: serve ridurre lo stato a un numero.
- Resistenze diverse: due funzioni.`,
        orale: ['Perché servono i criteri; tensione ideale e funzione di crisi; riduzione allo spazio delle tensioni principali. (dispensa, domanda 3)'],
      },
    ],
  },
  // ================================================================== c8.3
  {
    concept: 'c8.3',
    title: 'Galileo, Tresca, Grashof',
    minutes: 18,
    source: D(6, '6.4.1–6.4.3', undefined, '148–150'),
    visual: SVG('criteri', { tab: 'piano' }),
    steps: [
      {
        id: 'l83-1',
        kind: 'spiega',
        title: 'Galileo: la massima tensione normale',
        md: `Criterio di Galileo (nella forma di Navier), metà del XVII secolo, di importanza storica: la crisi dipende dalla massima e dalla minima tensione normale, cioè dagli estremi del Cap. 3:

$$\\sigma_{id}^t=s_1\\le\\sigma_L^t,\\qquad\\sigma_{id}^c=s_3\\ge\\sigma_L^c.$$

Ammette resistenze diverse in trazione e compressione, ma non rappresenta la realtà.`,
      },
      {
        id: 'l83-2',
        kind: 'derivazione',
        title: 'Tresca: la massima tangenziale',
        md: 'Seconda metà del XIX secolo (metallurgia, estrusione). Ispirato alle linee di Lüders: a 45° agisce $\\tau_{\\max}$. Il campione calcola la tangenziale massima di uno stato principale a caso con il motore del Cap. 3.',
        source: D(6, '6.4.2', undefined, 149),
        der: {
          sample,
          lines: [
            { tex: 'F=\\max_{\\hat n,\\hat\\nu}\\tau_{n\\nu}', why: 'Congettura: la crisi arriva quando la tangenziale supera una soglia.', val: (v) => tauMax(diag(S3(v))).value },
            { tex: '=\\frac{s_1-s_3}2', why: 'Tangenziale massima (Prop 3.13.2).', val: (v) => (S3(v)[0] - S3(v)[2]) / 2 },
            {
              tex: '\\le F(\\sigma_L,0,0)=\\frac{\\sigma_L}2\\ \\Rightarrow\\ \\sigma_{id}=s_1-s_3\\le\\sigma_L',
              why: 'Nella prova monoassiale $\\tau_{\\max}=\\sigma_L/2$ (il cerchio con $s_1=\\sigma_L$).',
              ask: { q: 'Quanto vale la tangenziale massima nella prova di trazione al limite?', options: ['$\\sigma_L/2$', '$\\sigma_L$', '0', '$2\\sigma_L$'], correct: 0, why: 'Cerchio di Mohr dello stato monoassiale.' },
              val: (v) => C.tresca(S3(v)) / 2,
              eq: '§6.4.2',
            },
          ],
        },
      },
      {
        id: 'l83-3',
        kind: 'spiega',
        title: 'Quando usare Tresca',
        md: `Tresca richiede **uguale resistenza** in trazione e compressione ed è adatto ai metalli molto duttili (rame, acciaio dolce). Lo snervamento dei metalli duttili è governato dalla tangenziale massima: è lo stesso filo che lega il cerchio di Mohr della trazione (Cap. 3), le linee di Lüders (Cap. 4) e questo criterio.`,
      },
      {
        id: 'l83-4',
        kind: 'derivazione',
        title: 'Grashof: la massima dilatazione',
        md: 'Ipotesi: elastico lineare isotropo fino alla crisi, quindi coassialità; resistenze anche diverse. Il campione calcola la dilatazione principale con il legame inverso del motore (ν di Poisson).',
        source: D(6, '6.4.3', undefined, '149–150'),
        der: {
          sample,
          lines: [
            { tex: 'F^t=\\max\\varepsilon_n=e_1', why: 'Congettura: governa la dilatazione massima (minima per la compressione).' },
            {
              tex: 'e_1\\,E',
              why: 'Dilatazione principale moltiplicata per $E$: per la coassialità $e_1$ è nella direzione di $s_1$.',
              val: (v) => El.strainIso(v.E, v.nu, diag(S3(v)))[0] * v.E,
            },
            {
              tex: '=s_1-\\nu(s_2+s_3)\\le\\sigma_L^t',
              why: 'Legame inverso con i moduli tecnici, confrontato con la prova: $e_1\\le\\sigma_L^t/E$.',
              val: (v) => C.grashof(S3(v), v.nu).t,
              eq: '§6.4.3',
            },
          ],
          checks: [{ what: 'compressione: $e_3E=s_3-\\nu(s_1+s_2)$', f: (v) => [El.strainIso(v.E, v.nu, diag(S3(v)))[8] * v.E, C.grashof(S3(v), v.nu).c] }],
        },
      },
      {
        id: 'l83-5',
        kind: 'prova',
        title: 'Tre domini nel piano',
        md: 'Confronta i domini di Galileo, Tresca e Grashof nel piano s₃ = 0.',
        tasks: ['Galileo è un quadrato: conta solo la tensione normale più grande.', 'Tresca è un esagono: nel secondo e quarto quadrante (segni opposti) taglia gli angoli.', 'Grashof dipende da ν (qui 0,3).'],
        visual: SVG('criteri', { tab: 'piano' }),
      },
      {
        id: 'l83-6',
        kind: 'domanda',
        q: { id: 'l83-q1', kind: 'scelta', q: 'Per quale materiale la dispensa indica Grashof?', options: ['La ghisa', 'L’acciaio dolce', 'Il rame', 'Le gomme'], correct: 0, why: '§6.4.3: fragile, con resistenze diverse.' },
      },
      {
        id: 'l83-7',
        kind: 'riassunto',
        md: `**In una frase:** Galileo guarda la tensione normale ($s_1$, $s_3$), Tresca la tangenziale massima ($s_1-s_3$), Grashof la dilatazione massima ($s_1-\\nu(s_2+s_3)$, con la coassialità).

- Tresca: duttili, uguale resistenza t/c; Lüders.
- Grashof: fragili (ghisa), resistenze diverse.`,
        orale: ['Galileo, Tresca (Lüders), Grashof (coassialità), Beltrami: congetture, ipotesi, tensioni ideali, campi di applicazione. (dispensa, domanda 4)'],
      },
    ],
  },
  // ================================================================== c8.4
  {
    concept: 'c8.4',
    title: 'Beltrami e l’esperimento di Huber',
    minutes: 14,
    source: D(6, '6.4.4–6.4.5', undefined, '150–151'),
    visual: SPAZIO('huber', ['beltrami', 'vonMises']),
    steps: [
      {
        id: 'l84-1',
        kind: 'derivazione',
        title: 'Beltrami: l’energia di deformazione',
        md: 'Primo criterio energetico (1885): $F=\\varphi$. Ipotesi: elastico lineare isotropo (quindi iperelastico), uguale resistenza t/c. Il campione usa l’espressione di φ del motore (Prop 4.14.1).',
        source: D(6, '6.4.4', undefined, 150),
        der: {
          sample,
          lines: [
            { tex: '\\varphi=\\frac1{2E}(s_1^2+s_2^2+s_3^2)-\\frac\\nu E(s_1s_2+s_2s_3+s_3s_1)\\le\\frac{\\sigma_L^2}{2E}', why: 'Energia specifica in tensioni principali; a destra $\\varphi(\\sigma_L,0,0)$.' },
            { tex: '\\sqrt{2E\\,\\varphi}', why: 'Si isola $\\sigma_L$.', val: (v) => Math.sqrt(2 * v.E * El.energyPrincipal(v.E, v.nu, S3(v))) },
            {
              tex: '=\\sqrt{s_1^2+s_2^2+s_3^2-2\\nu(s_1s_2+s_2s_3+s_3s_1)}=\\sigma_{id}\\le\\sigma_L',
              why: 'Tensione ideale di Beltrami (ν di Poisson).',
              val: (v) => C.beltrami(S3(v), v.nu),
              eq: '§6.4.4',
            },
          ],
        },
      },
      {
        id: 'l84-2',
        kind: 'spiega',
        title: 'Una rappresentazione utile',
        md: `Nello spazio delle tensioni principali Beltrami è un ellissoide con l'asse lungo la direzione idrostatica $s_1=s_2=s_3$. La dispensa avverte: la rappresentazione grafica è utile ma non indispensabile, e i criteri vanno comunque verificati sperimentalmente.`,
      },
      {
        id: 'l84-3',
        kind: 'derivazione',
        title: 'La confutazione di Huber',
        md: 'Punto immerso a profondità $h$ (autoclave): $\\tens T=-\\rho gh\\,\\tens I$. Il campione usa $p=\\rho gh$ a caso.',
        source: D(6, '6.4.5', undefined, '150–151'),
        der: {
          sample,
          lines: [
            { tex: 's_1=s_2=s_3=-\\rho gh', why: 'Stato idrostatico di compressione.' },
            { tex: '\\sigma_{id}^B', why: 'Beltrami calcolato dal motore.', val: (v) => C.beltrami([-v.p, -v.p, -v.p], v.nu) },
            {
              tex: '=\\sqrt{3(\\rho gh)^2-2\\nu\\cdot3(\\rho gh)^2}=\\rho gh\\sqrt{3-6\\nu}',
              why: 'Tre quadrati e tre doppi prodotti uguali.',
              ask: { q: 'Che cosa prevede Beltrami aumentando la profondità?', options: ['La crisi oltre una profondità finita $h_L$', 'Mai la crisi', 'La crisi a qualsiasi profondità', 'La crisi solo in trazione'], correct: 0, why: '§6.4.5: $\\sigma_{id}$ cresce linearmente con $h$.' },
              val: (v) => v.p * Math.sqrt(3 - 6 * v.nu),
            },
            { tex: '\\Rightarrow\\ h_L=\\frac{\\sigma_L}{\\rho g\\sqrt{3-6\\nu}}', why: 'Ma Huber non osservò crisi nemmeno per $h\\gg h_L$: basta un controesempio, Beltrami fallisce.', eq: '§6.4.5' },
          ],
        },
      },
      {
        id: 'l84-4',
        kind: 'prova',
        title: 'Il punto scende lungo l’asse',
        md: 'Nel modello scegli lo stato di Huber e aumenta la pressione.',
        tasks: ['Il punto di lavoro scende lungo l’asse idrostatico.', 'Esce dall’ellissoide di Beltrami (crisi prevista), ma resta sempre dentro il cilindro di von Mises.'],
        visual: SPAZIO('huber', ['beltrami', 'vonMises']),
      },
      {
        id: 'l84-5',
        kind: 'domanda',
        q: { id: 'l84-q1', kind: 'vf', q: 'Per confutare un criterio basta un solo controesempio sperimentale.', answer: true, why: '§6.4.5: Huber fa cadere Beltrami con lo stato idrostatico.' },
      },
      {
        id: 'l84-6',
        kind: 'riassunto',
        md: `**In una frase:** Beltrami usa l'energia di deformazione, $\\sigma_{id}=\\sqrt{\\sum s_i^2-2\\nu\\sum s_is_j}$, ma prevede la crisi di un punto in pressione idrostatica a $h_L=\\sigma_L/(\\rho g\\sqrt{3-6\\nu})$, che Huber non osserva.`,
        orale: ['La confutazione di Huber e cosa implica. (dispensa, domanda 5)'],
      },
    ],
  },
  // ================================================================== c8.5
  {
    concept: 'c8.5',
    title: 'Energia distorcente e criterio di von Mises',
    minutes: 22,
    source: D(6, '6.5', 'Teo 6.5.1, Def 6.5.2, Teo 6.5.3', '151–154'),
    visual: SPAZIO('generico', ['vonMises', 'tresca']),
    steps: [
      {
        id: 'l85-1',
        kind: 'spiega',
        title: 'Un invariante, poi un’energia',
        md: `Von Mises (1913) propone un invariante della parte deviatorica (il «$J_2$»); Hencky (1924) mostra che equivale a usare l'**energia distorcente**, la parte di energia legata alla variazione di forma e non di volume. Ipotesi: elastico lineare isotropo, uguale resistenza in trazione e compressione.

**Teo 6.5.1 (secondo teorema di decomposizione in somma).** Per ogni $\\tens A$ esistono e sono unici

$$\\tens A_s=\\operatorname{sph}\\tens A=\\tfrac13(\\operatorname{tr}\\tens A)\\tens I,\\qquad\\tens A_d=\\operatorname{dev}\\tens A=\\tens A-\\tfrac13(\\operatorname{tr}\\tens A)\\tens I,\\qquad\\tens A=\\tens A_s+\\tens A_d.$$`,
      },
      {
        id: 'l85-2',
        kind: 'derivazione',
        title: 'Proprietà della decomposizione',
        md: 'Il campione prende un tensore simmetrico a caso.',
        source: D(6, '6.5.1', 'Teo 6.5.1', '151–152'),
        der: {
          sample,
          lines: [
            { tex: '\\operatorname{tr}\\tens A_s', why: 'Traccia della parte sferica.', val: (v) => T.trace(C.sph(Esym(v))) },
            { tex: '=\\operatorname{tr}\\tens A,\\qquad\\operatorname{tr}\\tens A_d=0', why: 'La parte deviatorica ha traccia nulla.', val: (v) => T.trace(Esym(v)), eq: 'Teo 6.5.1' },
          ],
          checks: [
            { what: '$\\tens A_s\\cdot\\tens A_d=\\lambda\\operatorname{tr}\\tens A_d=0$: decomposizione ortogonale', f: (v) => [T.ddot(C.sph(Esym(v)), C.dev(Esym(v))), 0] },
            { what: '$\\operatorname{tr}\\tens A_d=0$', f: (v) => [T.trace(C.dev(Esym(v))), 0] },
          ],
        },
      },
      {
        id: 'l85-3',
        kind: 'spiega',
        title: 'Che cosa rappresentano le due parti',
        md: `- Su $\\tens E$: $\\tens E_s=\\frac13\\Theta\\tens I$ porta **tutta la variazione di volume** (deformazione omotetica, autovalore triplo $\\Theta/3$); $\\tens E_d$ solo la **variazione di forma**.
- Su $\\tens T$: $\\tens T_s=\\sigma_m\\tens I$ (tensione normale media); $\\tens T_d$ è lo scostamento da uno stato idrostatico.`,
      },
      {
        id: 'l85-4',
        kind: 'derivazione',
        title: 'Legame ed energia si separano (isotropi)',
        md: 'In generale da $\\tens T_s+\\tens T_d=\\mathbb A\\tens E_s+\\mathbb A\\tens E_d$ non si separano gli addendi. Per un isotropo sì; il campione usa μ, λ e una deformazione a caso (componente 11 della parte deviatorica).',
        source: D(6, '6.5.1', undefined, 152),
        der: {
          sample,
          lines: [
            { tex: '(\\tens T_d)_{11}', why: 'Parte deviatorica della tensione di Lamé.', val: (v) => C.dev(El.stressIso(v.mu, v.la, Esym(v)))[0] },
            {
              tex: '=2\\mu(\\tens E_d)_{11}',
              why: '$\\mathbb A\\tens E_s$ è sferico, $\\mathbb A\\tens E_d=2\\mu\\tens E_d$ deviatorico: per l’unicità della decomposizione $\\tens T_s=\\mathbb A\\tens E_s$, $\\tens T_d=2\\mu\\tens E_d$.',
              ask: { q: 'Perché $\\mathbb A\\tens E_d=2\\mu\\tens E_d$?', options: ['Perché nel legame di Lamé il termine con la traccia si annulla: $\\operatorname{tr}\\tens E_d=0$', 'Perché $\\lambda=0$', 'Perché $\\tens E_d$ è sferico', 'Per la coassialità'], correct: 0, why: '§6.5.1.' },
              val: (v) => 2 * v.mu * C.dev(Esym(v))[0],
              eq: '§6.5.1',
            },
          ],
          checks: [{ what: '$\\varphi=\\varphi(\\tens E_s)+\\varphi(\\tens E_d)$: niente accoppiamento ($\\tens T_s\\cdot\\tens E_d=0$)', f: (v) => {
            const A = El.lameTensor(v.mu, v.la);
            const E = Esym(v);
            return [El.energy(A, E), El.energy(A, C.sph(E)) + El.energy(A, C.dev(E))];
          } }],
        },
      },
      {
        id: 'l85-5',
        kind: 'derivazione',
        title: 'Energia distorcente in tensioni principali',
        md: '**Def 6.5.2:** $\\varphi_d:=\\frac12\\mathbb A\\tens E_d\\cdot\\tens E_d$. Il campione parte da una deformazione a caso e calcola tutto con il motore.',
        source: D(6, '6.5.2', 'Def 6.5.2', 153),
        der: {
          sample,
          lines: [
            { tex: '\\varphi_d=\\tfrac12\\mathbb A\\tens E_d\\cdot\\tens E_d', why: 'Definizione.', val: (v) => El.energy(El.lameTensor(v.mu, v.la), C.dev(Esym(v))) },
            { tex: '=\\tfrac12\\tens T_d\\cdot\\tens E_d=\\frac1{4\\mu}\\tens T_d\\cdot\\tens T_d', why: '$\\tens E_d=\\tens T_d/(2\\mu)$.', val: (v) => C.phiD(El.stressIso(v.mu, v.la, Esym(v)), v.mu) },
            {
              tex: '=\\frac1{4\\mu}\\Big[\\tens T\\cdot\\tens T-\\frac13(\\operatorname{tr}\\tens T)^2\\Big]',
              why: 'Sviluppando con $\\tens T\\cdot\\tens I=\\operatorname{tr}\\tens T$ e $\\tens I\\cdot\\tens I=3$.',
              val: (v) => {
                const S = El.stressIso(v.mu, v.la, Esym(v));
                return (T.ddot(S, S) - T.trace(S) ** 2 / 3) / (4 * v.mu);
              },
            },
            {
              tex: '=\\frac1{12\\mu}\\big[(s_1-s_2)^2+(s_2-s_3)^2+(s_3-s_1)^2\\big]',
              why: 'Nel riferimento principale (con le tensioni principali del motore).',
              val: (v) => C.phiDprincipal(C.sortS(eigSym(El.stressIso(v.mu, v.la, Esym(v))).values), v.mu),
              eq: 'Def 6.5.2',
            },
          ],
        },
      },
      {
        id: 'l85-6',
        kind: 'derivazione',
        title: 'Il criterio di von Mises',
        md: '$F=\\varphi_d$, confrontata con la prova monoassiale.',
        source: D(6, '6.5.2', 'Teo 6.5.3', 153),
        der: {
          sample,
          lines: [
            { tex: '\\varphi_d(\\sigma_L,0,0)=\\frac{2\\sigma_L^2}{12\\mu}=\\frac{\\sigma_L^2}{6\\mu}', why: 'Nella prova due differenze valgono $\\sigma_L$, una 0.' },
            { tex: '\\sqrt{6\\mu\\,\\varphi_d(s_1,s_2,s_3)}', why: 'Si isola $\\sigma_L$.', val: (v) => Math.sqrt(6 * v.mu * C.phiDprincipal(S3(v), v.mu)) },
            {
              tex: '=\\sqrt{\\tfrac12\\big[(s_1-s_2)^2+(s_2-s_3)^2+(s_3-s_1)^2\\big]}=\\sigma_{id}\\le\\sigma_L',
              why: 'Teo 6.5.3.',
              val: (v) => C.vonMises(S3(v)),
              eq: 'Teo 6.5.3',
            },
          ],
        },
      },
      {
        id: 'l85-7',
        kind: 'spiega',
        title: 'Pressure insensitive',
        md: `1. Allo stato di Huber tutte le differenze sono nulle: $\\sigma_{id}^{vM}=0$, nessuna crisi. Il criterio è **insensibile alla pressione** idrostatica.
2. Anche Tresca: $s_1-s_3=0$. Questi criteri dipendono solo dalle **differenze** delle tensioni principali.
3. Von Mises va bene per l'acciaio.
4. Huber a segni invertiti, $\\tens T=t\\tens I$ (trazione uniforme): nella realtà rottura fragile per decoesione a sforzi bassi; von Mises dà 0, Beltrami $t\\sqrt{3-6\\nu}\\ne0$. Sono stati rari nelle strutture, dove prevale la compressione.

**Procedura per l'orale:** $\\sigma_m=\\frac13\\operatorname{tr}\\tens T$; se $\\sigma_m\\le0$ **von Mises**, se $\\sigma_m>0$ **Beltrami**.`,
      },
      {
        id: 'l85-8',
        kind: 'prova',
        title: 'Cilindro ed esagono',
        md: 'Nel modello: von Mises è un cilindro attorno all’asse idrostatico, Tresca un prisma esagonale inscritto.',
        tasks: ['Guarda lungo l’asse idrostatico: esagono inscritto nel cerchio, si toccano negli stati monoassiali.', 'Scegli il puro taglio: Tresca dà 2τ, von Mises √3 τ.', 'Muovi il punto lungo l’asse: le tensioni ideali non cambiano.'],
        visual: SPAZIO('taglio', ['vonMises', 'tresca']),
      },
      {
        id: 'l85-9',
        kind: 'domanda',
        q: { id: 'l85-q1', kind: 'scelta', q: 'Con trazione idrostatica prevalente (σ_m > 0) quale criterio indica la dispensa?', options: ['Beltrami', 'von Mises', 'Tresca', 'Galileo'], correct: 0, why: '§6.5.3: von Mises darebbe σ_id = 0.' },
      },
      {
        id: 'l85-10',
        kind: 'riassunto',
        md: `**In una frase:** la decomposizione ortogonale in parte sferica e deviatorica separa, per un isotropo, legame ($\\tens T_d=2\\mu\\tens E_d$) ed energia; von Mises usa $\\varphi_d=\\frac1{12\\mu}\\sum(s_i-s_j)^2$ e dà $\\sigma_{id}=\\sqrt{\\frac12\\sum(s_i-s_j)^2}$, insensibile alla pressione.

- $\\sigma_m\\le0$: von Mises; $\\sigma_m>0$: Beltrami.`,
        orale: ['II teorema di decomposizione; decomposizione del legame e dell’energia per isotropi; energia distorcente; dimostrazione di von Mises. (dispensa, domanda 6)', 'Criteri pressure insensitive; Huber a segni invertiti; quando von Mises e quando Beltrami. (dispensa, domanda 7)'],
      },
    ],
  },
  // ================================================================== c8.6
  {
    concept: 'c8.6',
    title: 'Mohr–Coulomb',
    minutes: 14,
    source: D(6, '6.6', undefined, '154–155'),
    visual: SVG('criteri', { tab: 'mohr' }),
    steps: [
      {
        id: 'l86-1',
        kind: 'spiega',
        title: 'Attrito e coesione',
        md: `Crisi di natura **attritiva**, con **due parametri**: la coesione $c$ e l'angolo di attrito interno $\\phi$.

**Attrito puro** (Coulomb, Settecento): un blocco non scivola se $T<-N\\tan\\phi$, con $\\tan\\phi=\\mu$: c'è resistenza solo con compressione. Localmente, nessuna crisi se $\\tau<-\\sigma\\tan\\phi$.

**Coesione:** resistenza anche con $N=0$. **Mohr–Coulomb** (1900):

$$|\\tau|<c-\\sigma\\tan\\phi.$$

Nel piano di Mohr: due semirette per $(c/\\tan\\phi,0)$ e $(0,\\pm c)$, con il dominio di resistenza tra di esse.`,
      },
      {
        id: 'l86-2',
        kind: 'derivazione',
        title: 'La verifica con il cerchio massimo',
        md: 'Tutti gli stati del punto stanno nell’arbelo; i più gravosi sul cerchio massimo. Il campione calcola geometricamente la distanza del centro dalla semiretta.',
        source: D(6, '6.6', undefined, 155),
        der: {
          sample,
          lines: [
            { tex: 'C=\\frac{s_1+s_3}2,\\qquad R=\\frac{s_1-s_3}2', why: 'Centro e raggio del cerchio massimo.' },
            {
              tex: 'd=\\frac{|C\\tan\\phi-c|}{\\sqrt{1+\\tan^2\\phi}}',
              why: 'Distanza del centro dalla retta $\\sigma\\tan\\phi+\\tau-c=0$ (centro dalla parte del dominio).',
              val: (v) => {
                const s = S3(v);
                const Cc = (s[0] + s[2]) / 2;
                return Math.abs(Cc * Math.tan(v.phi) - v.co) / Math.sqrt(1 + Math.tan(v.phi) ** 2) * Math.sign(v.co - Cc * Math.tan(v.phi));
              },
            },
            { tex: '=\\Big(c-\\frac{s_1+s_3}2\\tan\\phi\\Big)\\cos\\phi', why: '$1/\\sqrt{1+\\tan^2\\phi}=\\cos\\phi$.', val: (v) => (v.co - ((S3(v)[0] + S3(v)[2]) / 2) * Math.tan(v.phi)) * Math.cos(v.phi) },
            {
              tex: 'd\\ge R\\iff(s_1-s_3)+(s_1+s_3)\\sin\\phi\\le2c\\cos\\phi',
              why: 'Moltiplicando per 2 e usando $\\tan\\phi\\cos\\phi=\\sin\\phi$; la coppia (1,3) dà il massimo di $F$.',
              ask: { q: 'Quando la crisi è imminente?', options: ['Quando il cerchio massimo è tangente alla semiretta', 'Quando un cerchio qualsiasi tocca l’asse τ', 'Quando $s_1=0$', 'Quando $\\phi=0$'], correct: 0, why: '§6.6.' },
              eq: '§6.6',
            },
          ],
          checks: [{ what: '$F$ del motore coincide con il primo membro per la coppia (1,3) quando è massima', f: (v) => {
            const s = S3(v);
            const f13 = s[0] - s[2] + (s[0] + s[2]) * Math.sin(v.phi);
            const F = C.mohrCoulomb(s, v.co, v.phi).F;
            return [Math.max(F, f13), F];
          } }],
        },
      },
      {
        id: 'l86-3',
        kind: 'prova',
        title: 'Il cerchio massimo e le semirette',
        md: 'Muovi le tensioni principali, la coesione e l’angolo di attrito.',
        tasks: ['Aumenta la compressione media (sposta tutti i cerchi a sinistra): il dominio si allarga, il materiale resiste di più.', 'Porta il cerchio massimo a toccare una semiretta: crisi imminente.', 'Con c → 0 (solo attrito) non c’è resistenza in trazione.'],
        visual: SVG('criteri', { tab: 'mohr' }),
      },
      {
        id: 'l86-4',
        kind: 'domanda',
        q: { id: 'l86-q1', kind: 'vf', q: 'Per Mohr–Coulomb la resistenza a taglio cresce con la compressione.', answer: true, why: '§6.6: $|\\tau|<c-\\sigma\\tan\\phi$ con $\\sigma<0$.' },
      },
      {
        id: 'l86-5',
        kind: 'riassunto',
        md: `**In una frase:** $|\\tau|<c-\\sigma\\tan\\phi$: nel piano di Mohr il dominio sta tra due semirette e basta il cerchio massimo; in tensioni principali $(s_1-s_3)+(s_1+s_3)\\sin\\phi\\le2c\\cos\\phi$.`,
        orale: ['Mohr–Coulomb: attrito, coesione, dominio nel piano di Mohr, cerchio massimo. (dispensa, domanda 8)'],
      },
    ],
  },
  // ================================================================== c8.7
  {
    concept: 'c8.7',
    title: 'Dalla sezione alla struttura: verifica e progetto',
    minutes: 18,
    source: D(6, '6.7–6.9', undefined, '155–158'),
    visual: SVG('jourawski', { section: 'T' }),
    steps: [
      {
        id: 'l87-1',
        kind: 'derivazione',
        title: 'Principali di uno stato alla Saint-Venant',
        md: 'Sulla sezione ci sono solo $\\sigma_z$, $\\tau_{zx}$, $\\tau_{zy}$; con $\\tau_z^2=\\tau_{zx}^2+\\tau_{zy}^2$. Il campione confronta con il calcolo spettrale del motore.',
        source: D(6, '6.7', undefined, 155),
        der: {
          sample,
          lines: [
            { tex: 's_{\\max}', why: 'Tensione principale massima del tensore $[\\tens T_{es}]$, dal motore.', val: (v) => eigSym([0, 0, v.tx, 0, 0, v.ty, v.tx, v.ty, v.sz]).values[0] },
            {
              tex: '=\\frac{\\sigma_z}2+\\frac12\\sqrt{\\sigma_z^2+4\\tau_z^2}',
              why: 'Lo stato è al più biassiale: una principale è nulla. La dispensa chiama $s_{1,2}$ le due non nulle e $s_3$ quella nulla, «che sta tra le due»: qui gli indici sono nomi, non un ordinamento (NF-09).',
              val: (v) => C.svPrincipal(v.sz, v.tx, v.ty).a,
              eq: '§6.7',
            },
          ],
        },
      },
      {
        id: 'l87-2',
        kind: 'derivazione',
        title: 'Le tensioni ideali',
        md: 'Con le due principali non nulle $s_{1,2}$ e quella nulla. Il campione confronta con i criteri generali applicati alle principali del motore.',
        source: D(6, '6.7', undefined, '155–156'),
        der: {
          sample,
          lines: [
            { tex: '\\sigma_{id}^{vM}', why: 'Von Mises sulle tre principali (ordinate) del motore.', val: (v) => C.vonMises(C.sortS(eigSym([0, 0, v.tx, 0, 0, v.ty, v.tx, v.ty, v.sz]).values)) },
            {
              tex: '=\\sqrt{\\tfrac12\\big[(s_1-s_2)^2+s_2^2+s_1^2\\big]}=\\sqrt{\\sigma_z^2+3\\tau_z^2}',
              why: 'Con $s_1+s_2=\\sigma_z$, $s_1s_2=-\\tau_z^2$ e quindi $s_1^2+s_2^2=\\sigma_z^2+2\\tau_z^2$.',
              ask: { q: 'Quanto vale $s_1s_2$ per lo stato alla Saint-Venant?', options: ['$-\\tau_z^2$', '$\\tau_z^2$', '$\\sigma_z^2$', '0'], correct: 0, why: 'Prodotto delle radici di $s^2-\\sigma_zs-\\tau_z^2=0$ (passaggio aggiunto).' },
              val: (v) => C.svIdeal(v.sz, v.tx, v.ty, 0.3).vonMises,
              eq: '§6.7',
            },
          ],
          checks: [
            { what: 'Tresca: $s_1-s_2=\\sqrt{\\sigma_z^2+4\\tau_z^2}$', f: (v) => [C.tresca(C.sortS(eigSym([0, 0, v.tx, 0, 0, v.ty, v.tx, v.ty, v.sz]).values)), C.svIdeal(v.sz, v.tx, v.ty, v.nu).tresca] },
            { what: 'Grashof: $s_1-\\nu s_2=\\frac{1-\\nu}2\\sigma_z+\\frac{1+\\nu}2\\sqrt{\\sigma_z^2+4\\tau_z^2}$', f: (v) => { const p = C.svPrincipal(v.sz, v.tx, v.ty); return [p.a - v.nu * p.b, C.svIdeal(v.sz, v.tx, v.ty, v.nu).grashofT]; } },
          ],
        },
      },
      {
        id: 'l87-3',
        kind: 'spiega',
        title: 'Riepilogo e controprova',
        md: `$$\\sigma_{id}^{Tresca}=\\sqrt{\\sigma_z^2+4\\tau_z^2},\\quad\\sigma_{id}^{vM}=\\sqrt{\\sigma_z^2+3\\tau_z^2},\\quad\\sigma_{id}^{t,c}=\\frac{1-\\nu}2\\sigma_z\\pm\\frac{1+\\nu}2\\sqrt{\\sigma_z^2+4\\tau_z^2}.$$

Tresca e von Mises per i duttili, Grashof per i fragili. Negli appunti i coefficienti di Grashof erano scambiati; controprova con il puro taglio: $\\sigma_{id}^t=(1+\\nu)\\tau_z$.`,
      },
      {
        id: 'l87-4',
        kind: 'spiega',
        title: 'Le travature',
        md: `Un capannone (colonne, mensole per il carroponte, copertura a volta, pensilina) ha assi curvi, sezioni variabili, forze sul mantello (vento, impianti), peso proprio: Saint-Venant non si applica direttamente.

Ma nelle **parti regolari** (regioni B) lo stato di tensione di una sezione è quello della sezione di un solido di Saint-Venant con le **stesse CdS**. Altrove servono procedimenti specifici (gli irrigidimenti di un doppio T sotto un macchinario, da norme o calcoli dedicati).

**Atteggiamento:** CdS con l'analisi strutturale → $\\tens T$ con Saint-Venant → verifica con i criteri.`,
      },
      {
        id: 'l87-5',
        kind: 'spiega',
        title: 'Verifica e progetto di un telaio',
        md: `- **Verifica:** tutto assegnato; in ogni punto di ogni sezione $\\tens T$ dev'essere compatibile (nella tecnica anche deformabilità e stabilità).
- **Progetto:** la forma è nota a meno di un parametro $a$ (ad esempio un doppio T con ali $6a\\times a$ e anima $20a$).

Traccia tipo: portale $L\\times H$ con carico $q$ sul traverso, sezione a T proporzionale ad $a$, $\\sigma_{adm}$ assegnata.
1. **CdS** ($N$, $T$, $M$).
2. **Sezioni critiche**, asta per asta (estremi, sezione con $M$ massimo, simmetrie).
3. **Punti pericolosi:** lembi ($\\sigma$ massima, $\\tau=0$), attacco ala–anima (prima e dopo il salto di Jourawski), corda baricentrica ($\\tau$ massima).
4. **Verifiche di sicurezza** punto per punto (ad esempio con Tresca) in una tabella $\\sigma_z$, $\\tau_{zx}$, $\\tau_{zy}$, $\\sigma_{id}$.

Nel progetto si aggiunge il **predimensionamento a flessione** sulla sezione con $|M|_{\\max}$: $\\sigma'_z=M/W'$, $\\sigma''_z=M/W''$, $|\\sigma_z|_{\\max}\\le\\sigma_{adm}\\Rightarrow a_{\\min}$; si arrotonda in eccesso (circa +10%) e si verifica, considerando anche una sezione con taglio.`,
      },
      {
        id: 'l87-6',
        kind: 'prova',
        title: 'I punti pericolosi di una sezione a T',
        md: 'Nel diagramma di Jourawski della sezione a T individua i punti da verificare.',
        tasks: ['Ai lembi τ̄ = 0: conta solo σ_z, massima.', 'All’attacco ala–anima τ̄ salta: verifica subito sopra e subito sotto.', 'Sulla corda baricentrica τ̄ è massima e σ_z da flessione è nulla.'],
        visual: SVG('jourawski', { section: 'T' }),
      },
      {
        id: 'l87-7',
        kind: 'domanda',
        q: { id: 'l87-q1', kind: 'scelta', q: 'Quale tensione ideale ha il puro taglio τ secondo von Mises?', options: ['$\\sqrt3\\,\\tau$', '$2\\tau$', '$\\tau$', '$(1+\\nu)\\tau$'], correct: 0, why: '§6.7 con $\\sigma_z=0$.' },
      },
      {
        id: 'l87-8',
        kind: 'riassunto',
        md: `**In una frase:** per stati alla Saint-Venant $\\sigma_{id}^{T}=\\sqrt{\\sigma_z^2+4\\tau_z^2}$, $\\sigma_{id}^{vM}=\\sqrt{\\sigma_z^2+3\\tau_z^2}$, Grashof $\\frac{1-\\nu}2\\sigma_z\\pm\\frac{1+\\nu}2\\sqrt{\\sigma_z^2+4\\tau_z^2}$; nelle travature: CdS → Saint-Venant → criteri, nelle regioni B.

- Punti pericolosi: lembi, attacco ala–anima, corda baricentrica.
- Progetto: predimensionamento a flessione, poi verifica.`,
        orale: ['Tensioni ideali alla Saint-Venant (Tresca, von Mises, Grashof). (dispensa, domanda 9)', 'Estensione alle travature; schema di verifica e di progetto di un telaio. (dispensa, domanda 10)'],
      },
    ],
  },
];
