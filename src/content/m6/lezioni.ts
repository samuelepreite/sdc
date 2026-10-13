/**
 * Lezioni guidate del Modulo 6 (Cap. 5, §5.1–5.6). Derivazioni solo dove la dispensa le sviluppa; le righe con `val`
 * sono verificate su 25 campioni casuali (tests/lezioni.test.ts). Il campione è un rettangolo B×H (H > B) con carichi
 * casuali; gli spostamenti sono derivati numericamente da engine/sezioni.
 */
import { D } from '../../engine/types';
import * as T from '../../engine/tensor';
import * as S from '../../engine/sezioni';
import type { Lesson, LessonVisual } from '../types';

type R = Record<string, number>;
const SVG = (id: 'sezione' | 'cds' | 'problema', params?: Record<string, string | number | boolean>): LessonVisual => ({ kind: 'svg', id, params });
const BEAM = (mode: 'fibre' | 'normale' | 'flessione' | 'anticlastica', extra: Record<string, unknown> = {}): LessonVisual => ({ kind: 'trave3d', scene: { mode, section: 'rettangolo', ...extra } });

const sample = (r: () => number): R => {
  const B = 1 + 2 * r();
  return {
    B,
    H: B * (1.2 + 2 * r()),
    E: 1 + 3 * r(),
    nu: 0.05 + 0.4 * r(),
    N: 4 * r() - 2,
    Mx: 4 * r() - 2,
    My: 4 * r() - 2,
    x: 2 * r() - 1,
    y: 2 * r() - 1,
    z: 3 * r(),
    L: 2 + 4 * r(),
    a: -3 + 6 * r(),
    Tx: 4 * r() - 2,
    Ty: 4 * r() - 2,
    Txz: 2 * r() - 1,
    Tyz: 2 * r() - 1,
    Tzz: 2 * r() - 1,
  };
};
const sec = (v: R): S.SecK => ({ A: v.B * v.H, Jx: (v.B * v.H ** 3) / 12, Jy: (v.H * v.B ** 3) / 12 });
const pt = (v: R): [number, number, number] => [(v.x * v.B) / 2, (v.y * v.H) / 2, v.z];
const strain = (v: R, L: S.Loads) => S.strainOf((q) => S.displacement(L, sec(v), v.E, v.nu, q), pt(v));
const ang = (v: R) => S.bendingAngles(v.a, sec(v).Jx / sec(v).A, sec(v).Jy / sec(v).A);

export const M6_LEZIONI: Lesson[] = [
  // ================================================================== c6.1
  {
    concept: 'c6.1',
    title: 'Il teorema di unicità di Kirchhoff',
    minutes: 14,
    source: D(5, '5.1', 'Teo 5.1.1', '99–100'),
    visual: SVG('problema'),
    steps: [
      {
        id: 'l61-1',
        kind: 'spiega',
        title: 'Perché serve un teorema di unicità',
        md: `Il problema elastico ha tante equazioni quante incognite, ma questo non basta. Il **teorema di Kirchhoff** (Teo 5.1.1) dice che, se $\\mathbb A\\in\\mathrm{Pos}^+$ e la soluzione esiste, è **unica** a meno di uno spostamento rigido infinitesimo:

$$\\{\\vet u+\\vet u^{r,\\infty},\\ \\tens E,\\ \\tens T\\}.$$

Un solo $\\tens E$ e un solo $\\tens T$, non un solo $\\vet u$: un aereo in crociera può traslare e ruotare rigidamente senza cambiare il suo stato di deformazione. Se il corpo è sufficientemente vincolato, l'unicità è completa.

Ricorda anche che l'energia non si sovrappone: $\\Phi(\\tens E_1+\\tens E_2)\\ne\\Phi(\\tens E_1)+\\Phi(\\tens E_2)$, con $\\Phi=\\int\\varphi\\,dV$.`,
      },
      {
        id: 'l61-2',
        kind: 'derivazione',
        title: 'Dimostrazione per assurdo',
        md: 'Due soluzioni $\\{\\tens E_1,\\tens T_1,\\vet u_1\\}$ e $\\{\\tens E_2,\\tens T_2,\\vet u_2\\}$ con gli stessi dati. Catena di passaggi logici.',
        source: D(5, '5.1', 'Teo 5.1.1', '99–100'),
        der: {
          lines: [
            { tex: '\\{\\tens E,\\tens T,\\vet u\\}=\\{\\tens E_1-\\tens E_2,\\ \\tens T_1-\\tens T_2,\\ \\vet u_1-\\vet u_2\\}', why: 'Problema differenza: per sovrapposizione ($\\alpha=1$, $\\beta=-1$) risolve il problema a **dati nulli**.' },
            {
              tex: '\\underbrace{\\int_{\\partial\\mathcal B_\\ell}\\hat{\\vet s}\\cdot\\vet u}_{=0}+\\underbrace{\\int_{\\partial\\mathcal B_v}\\tens T\\hat n\\cdot\\vet u}_{=0}+\\underbrace{\\int_{\\mathcal B}\\vet b\\cdot\\vet u}_{=0}=\\int_{\\mathcal B}\\tens T\\cdot\\tens E',
              why: 'TLV con FT $=\\{\\vet 0,\\vet 0,\\tens T\\}$ (equilibrato) e SD $=\\{\\vet u,\\tens E\\}$ (congruente, $\\vet u=\\vet 0$ su $\\partial\\mathcal B_v$).',
              ask: { q: 'Perché il lavoro esterno è nullo?', options: ['Perché nel problema differenza carichi e spostamenti imposti sono nulli', 'Perché il corpo è rigido', 'Perché $\\tens T$ è simmetrico', 'Perché $\\mathbb A\\in\\mathrm{Pos}^+$'], correct: 0, why: '$\\hat{\\vet s}=\\vet 0$, $\\vet b=\\vet 0$, $\\vet u=\\vet 0$ su $\\partial\\mathcal B_v$.' },
            },
            { tex: '\\int_{\\mathcal B}\\mathbb A\\tens E\\cdot\\tens E\\,dV=0', why: 'Legame $\\tens T=\\mathbb A\\tens E$.' },
            { tex: '\\tens E=\\tens O\\quad\\text{in }\\mathcal B', why: 'Definita positività: se $\\tens E\\ne\\tens O$ in un punto, e quindi in un intorno, l’integrale sarebbe positivo.' },
            { tex: '\\tens E_1=\\tens E_2,\\quad\\tens T_1=\\mathbb A\\tens E_1=\\tens T_2,\\quad\\vet u_1=\\vet u_2+\\vet u^{r,\\infty}', why: 'Uno spostamento con $\\tens E=\\tens O$ è rigido infinitesimo.', eq: 'Teo 5.1.1' },
          ],
        },
      },
      {
        id: 'l61-3',
        kind: 'spiega',
        title: 'A che cosa serve Pos⁺',
        md: `Con una trave appoggiata la deformata è unica perché la trave è vincolata. La condizione $\\mathbb A\\in\\mathrm{Pos}^+$ entra tre volte nel corso: rende il legame **invertibile**, traduce la **plausibilità fisica** e garantisce l'**unicità** di Kirchhoff. Il teorema è anche il fulcro del metodo semi-inverso di Saint-Venant.`,
      },
      {
        id: 'l61-4',
        kind: 'domanda',
        q: { id: 'l61-q1', kind: 'scelta', q: 'Nella dimostrazione di Kirchhoff quale FT si usa nel TLV?', options: ['$\\{\\vet 0,\\vet 0,\\tens T\\}$ con $\\tens T$ del problema differenza', 'I carichi del problema originale', 'Un FT qualsiasi', 'Nessuno: si usa la congruenza'], correct: 0, why: '§5.1: il problema differenza ha dati nulli, quindi $\\{\\vet 0,\\vet 0,\\tens T\\}$ è equilibrato.' },
      },
      {
        id: 'l61-5',
        kind: 'riassunto',
        md: `**In una frase:** con $\\mathbb A\\in\\mathrm{Pos}^+$ due soluzioni con gli stessi dati hanno la stessa deformazione e la stessa tensione: la loro differenza risolve il problema a dati nulli, il TLV dà $\\int\\mathbb A\\tens E\\cdot\\tens E=0$ e quindi $\\tens E=\\tens O$.

- Spostamento unico a meno di un moto rigido infinitesimo.
- Ingredienti: sovrapposizione, TLV, definita positività.`,
        orale: ['Enunciare e dimostrare Kirchhoff; ruolo di $\\mathbb A\\in\\mathrm{Pos}^+$. (dispensa, domanda 1)'],
      },
    ],
  },
  // ================================================================== c6.2
  {
    concept: 'c6.2',
    title: 'Il problema di Saint-Venant e il metodo semi-inverso',
    minutes: 20,
    source: D(5, '5.2.1–5.2.4', 'Def 5.2.1', '100–104'),
    visual: BEAM('fibre', { sections: ['rettangolo', 'doppioT', 'cerchio'], controls: ['section'] }),
    steps: [
      {
        id: 'l62-1',
        kind: 'spiega',
        title: 'Il solido',
        md: `**Def 5.2.1.** Problema elastico **nelle forze** per un **solido cilindrico retto** molto allungato (diametro della sezione $\\ll L$), sezione qualsiasi semplicemente connessa, materiale **elastico lineare, omogeneo, isotropo** ($E$, $G$, $\\nu$ costanti), $\\vet b=\\vet 0$, **mantello scarico**, forze arbitrarie sulle basi $\\hat{\\vet s}^+$, $\\hat{\\vet s}^-$.

Riferimento: origine nel baricentro della base di sinistra, $z$ lungo l'asse, $x$ e $y$ assi principali centrali d'inerzia. Non è una trave, ma è uno dei pochi problemi elastici di cui si conosce la soluzione e le sue soluzioni servono per le travi.

**Equazioni** (18): congruenza, equilibrio, simmetria, legame inverso con i moduli tecnici. **Al contorno:** sul mantello $\\tens T\\hat n=\\vet 0$ con $\\hat n=(n_x,n_y,0)$; sulle basi $\\tens T\\hat e_z=\\hat{\\vet s}^+$ e $\\tens T(-\\hat e_z)=\\hat{\\vet s}^-$.`,
      },
      {
        id: 'l62-2',
        kind: 'spiega',
        title: 'L’ipotesi: un mazzo di spaghetti',
        md: `Il problema **diretto** va dai dati alla soluzione, quello **inverso** dagli effetti al sistema (identificazione strutturale). Saint-Venant sta **in mezzo**: **metodo semi-inverso**. Si congettura una parte della soluzione da un'interpretazione meccanica e si ricava il resto.

**Ipotesi di Saint-Venant:** comportamento **a fibre**. Fibre contigue si scambiano solo forze parallele all'asse:

$$T_{xx}=T_{yy}=T_{xy}=T_{yx}\\equiv0\\quad\\forall(x,y,z).$$

Basta allora il vettore tensione sulla sezione trasversale: $[\\tens T]$ ha solo $T_{xz}$, $T_{yz}$, $T_{zz}$ (analisi per sezioni trasversali).`,
      },
      {
        id: 'l62-3',
        kind: 'derivazione',
        title: 'Che cosa resta delle equazioni',
        md: 'Si inserisce l’ipotesi nelle equazioni di equilibrio e al contorno. Catena di passaggi logici.',
        source: D(5, '5.2.3', '(⋆)', '103–104'),
        der: {
          lines: [
            { tex: '\\frac{\\partial T_{xz}}{\\partial z}=0,\\quad\\frac{\\partial T_{yz}}{\\partial z}=0\\ \\Rightarrow\\ T_{xz}=A(x,y),\\ T_{yz}=B(x,y)', why: 'Prime due equazioni di equilibrio, con $T_{xx}=T_{xy}=T_{yy}=0$.' },
            { tex: '\\frac{\\partial T_{zx}}{\\partial x}+\\frac{\\partial T_{zy}}{\\partial y}+\\frac{\\partial T_{zz}}{\\partial z}=0', why: 'Terza equazione.' },
            {
              tex: '\\frac{\\partial^2T_{zz}}{\\partial z^2}=0\\ \\Rightarrow\\ T_{zz}=C(x,y)\\,z+D(x,y)',
              why: 'Derivando rispetto a $z$: i primi due termini non dipendono da $z$.',
              ask: { q: 'Come si ottiene che $T_{zz}$ è lineare in $z$?', options: ['Derivando la terza equazione di equilibrio rispetto a $z$', 'Dalla congruenza', 'Dal legame costitutivo', 'Dalla condizione sul mantello'], correct: 0, why: '§5.2.3.' },
              eq: '(⋆)',
            },
            { tex: 'T_{zx}n_x+T_{zy}n_y=0\\iff\\boldsymbol\\tau_z\\cdot\\hat n=0', why: 'Sul mantello, delle tre condizioni resta solo la terza: **la tangenziale sul contorno della sezione è tangente al bordo**.' },
          ],
        },
      },
      {
        id: 'l62-4',
        kind: 'derivazione',
        title: 'Lo stato di tensione è biassiale',
        md: 'Il campione prende $T_{xz}$, $T_{yz}$, $T_{zz}$ a caso e calcola il secondo invariante con il motore.',
        source: D(5, '5.2.3', undefined, 104),
        der: {
          sample,
          lines: [
            { tex: 'II', why: 'Secondo invariante di $[\\tens T]$ con le sole componenti $T_{xz}$, $T_{yz}$, $T_{zz}$.', val: (v) => T.invariants([0, 0, v.Txz, 0, 0, v.Tyz, v.Txz, v.Tyz, v.Tzz])[1] },
            { tex: '=-(T_{xz}^2+T_{yz}^2)\\ne0,\\qquad III=0,\\qquad I=T_{zz}', why: 'Il determinante è nullo: una tensione principale è zero, lo stato è **biassiale**. Sulla sezione $\\sigma_z=T_{zz}$, $\\tau_z=\\sqrt{T_{zx}^2+T_{zy}^2}$.', val: (v) => -(v.Txz ** 2 + v.Tyz ** 2), eq: '§5.2.3' },
          ],
          checks: [{ what: '$III=\\det[\\tens T]=0$', f: (v) => [T.det([0, 0, v.Txz, 0, 0, v.Tyz, v.Txz, v.Tyz, v.Tzz]), 0] }],
        },
      },
      {
        id: 'l62-5',
        kind: 'spiega',
        title: 'Perché il metodo funziona',
        md: `Si fissa a priori parte della soluzione e si ricava il resto. Se la terna $\\{\\vet u,\\tens E,\\tens T\\}$ soddisfa **tutte** le equazioni, per il teorema di Kirchhoff è **la** soluzione: il metodo non ne influenza la qualità. Il prezzo: la congettura vincola anche le tensioni sulle basi, che non si possono più assegnare in modo arbitrario (problema indebolito, prossima lezione).`,
      },
      {
        id: 'l62-6',
        kind: 'prova',
        title: 'Fibre e sezione',
        md: 'Il modello mostra il solido come un fascio di fibre e il vettore tensione su una sezione.',
        tasks: ['Riconosci $\\sigma_z$ lungo l’asse e $\\tau_z$ nel piano della sezione.', 'Sul bordo la tangenziale è disegnata lungo il contorno: $\\boldsymbol\\tau_z\\cdot\\hat n=0$.', 'Cambia sezione: la congettura non dipende dalla forma.'],
        visual: BEAM('fibre', { sections: ['rettangolo', 'doppioT', 'cerchio'], controls: ['section'] }),
      },
      {
        id: 'l62-7',
        kind: 'domanda',
        q: { id: 'l62-q1', kind: 'vf', q: 'Nel solido di Saint-Venant la tangenziale in un punto del bordo della sezione è ortogonale al contorno.', answer: false, why: '§5.2.3: è tangente al contorno, $\\boldsymbol\\tau_z\\cdot\\hat n=0$, perché il mantello è scarico.' },
      },
      {
        id: 'l62-8',
        kind: 'riassunto',
        md: `**In una frase:** cilindro allungato, isotropo, con mantello scarico e forze sulle basi; con l'ipotesi a fibre $T_{xx}=T_{yy}=T_{xy}=0$ restano $T_{xz}(x,y)$, $T_{yz}(x,y)$, $T_{zz}=Cz+D$, e la tangenziale al bordo è tangente al contorno.

- Stato biassiale: $III=0$, $II=-(T_{xz}^2+T_{yz}^2)$.
- Semi-inverso: se tutto torna, per Kirchhoff è la soluzione.`,
        orale: ['Definire il problema di S-V e scriverne le equazioni di campo e al contorno. (dispensa, domanda 2)', 'Ipotesi di S-V e conseguenze; metodo semi-inverso e perché funziona. (dispensa, domanda 3)'],
      },
    ],
  },
  // ================================================================== c6.3
  {
    concept: 'c6.3',
    title: 'Caratteristiche della sollecitazione e postulato di Saint-Venant',
    minutes: 18,
    source: D(5, '5.2.5–5.2.8', 'Def 5.2.2, Teo 5.2.3–5.2.4', '104–108'),
    visual: SVG('cds'),
    steps: [
      {
        id: 'l63-1',
        kind: 'spiega',
        title: 'Equilibrio globale e CdS',
        md: `In un problema nelle forze il dato deve essere equivalente a zero. Con $\\vet R_0$, $\\vet M_0$ risultante e momento (rispetto a $G_0$) delle forze sulla base di sinistra e $\\vet R_L$, $\\vet M_L$ su quella di destra:

$$\\vet R_0+\\vet R_L=\\vet 0,\\qquad\\vet M_0+\\vet M_L+L\\hat e_z\\wedge\\vet R_L=\\vet 0.\\tag{5.1}$$

**Def 5.2.2.** Per la sezione $A_z$ di baricentro $G_z$: $\\vet R(z)=\\int_{A_z}\\vet t_{e_z}dA$, $\\vet M(z)=\\int_{A_z}(X-G_z)\\wedge\\vet t_{e_z}dA$. In componenti, con $\\vet t_{e_z}=(T_{zx},T_{zy},T_{zz})$:

$$T_x=\\int T_{zx},\\ T_y=\\int T_{zy},\\ N=\\int T_{zz},\\ M_x=\\int T_{zz}y,\\ M_y=-\\int T_{zz}x,\\ M_z=\\int(T_{zy}x-T_{zx}y).$$`,
      },
      {
        id: 'l63-2',
        kind: 'derivazione',
        title: 'Leggi di variazione delle CdS',
        md: 'Equilibrio del tratto $\\mathcal B^-$ tra la base di sinistra e $A_z$, poi si sottrae (5.1). Il campione controlla la componente $x$ del momento con il prodotto vettoriale.',
        source: D(5, '5.2.6', 'Teo 5.2.3', '105–106'),
        der: {
          sample,
          lines: [
            { tex: '\\vet R_0+\\vet R(z)=\\vet 0,\\qquad\\vet M_0+\\vet M(z)+z\\hat e_z\\wedge\\vet R(z)=\\vet 0', why: 'Equilibrio di $\\mathcal B^-$: sulla sezione $A_z$ agisce $\\vet t_{e_z}$.' },
            { tex: '\\vet R(z)=\\vet R_L,\\qquad\\vet M(z)=\\vet M_L+(L-z)\\hat e_z\\wedge\\vet R_L', why: 'Sottraendo (5.1).' },
            {
              tex: 'M_x(z)=\\big[\\vet M_L+(L-z)\\hat e_z\\wedge\\vet R_L\\big]_x',
              why: 'Componente $x$, calcolata con il prodotto vettoriale.',
              val: (v) => v.Mx + (v.L - v.z) * T.cross([0, 0, 1], [v.Tx, v.Ty, v.N])[0],
            },
            {
              tex: '=M_x-T_y(L-z),\\qquad M_y(z)=M_y+T_x(L-z)',
              why: '$\\hat e_z\\wedge\\vet R_L=(-T_y,\\ T_x,\\ 0)$. Tagli, sforzo normale e torcente restano costanti.',
              ask: { q: 'Quali CdS sono costanti lungo il solido?', options: ['$T_x$, $T_y$, $N$, $M_z$', 'Solo $N$', '$M_x$ e $M_y$', 'Nessuna'], correct: 0, why: 'Teo 5.2.3: solo i flettenti variano, al più linearmente.' },
              val: (v) => S.cds(v.z, v.L, { Tx: v.Tx, Ty: v.Ty, N: v.N, Mx: v.Mx, My: v.My, Mz: 0 }).Mx,
              eq: 'Teo 5.2.3',
            },
          ],
        },
      },
      {
        id: 'l63-3',
        kind: 'spiega',
        title: 'Il problema indebolito',
        md: `La congettura vincola anche le tensioni sulle basi: non si può assegnare un dato **forte** ($T_{zx}=\\hat s^+_x$, … in ogni punto). Si assegna un dato **debole**, cioè le sole CdS, ad esempio $\\int_{A_L}T_{zz}dA=\\int_{A_L}\\hat s^+_zdA$, cioè $N=\\hat N$.
1. Infinite distribuzioni hanno lo stesso integrale: si assegna una **classe** di dati staticamente equivalenti.
2. Risolto il problema, dal campo di tensione in $z=L$ si ricavano a posteriori le forze effettive (**back analysis**).
3. Basta assegnare la base di destra.`,
      },
      {
        id: 'l63-4',
        kind: 'spiega',
        title: 'Il postulato di Saint-Venant',
        md: `**Teo 5.2.4** (dimostrato nel 1960; la dispensa lo enuncia senza dimostrazione): soluzioni con distribuzioni sulle basi diverse ma **staticamente equivalenti** sono **indistinguibili a sufficiente distanza dalle basi**. La **distanza di estinzione** è legata ai raggi d'inerzia della sezione.

Nei sistemi di travi si calcolano comunque le CdS: si rinuncia a una cosa che non serve. Nel telaio di una bicicletta, per ogni sezione si «apre il libro» di Saint-Venant con le sue CdS. Vale nelle **regioni B** (Beam, Bernoulli), non nelle **regioni D** (Discontinuity: estremità, nodi, cambi di curvatura), dove servono metodi numerici.`,
      },
      {
        id: 'l63-5',
        kind: 'prova',
        title: 'Le CdS lungo il solido',
        md: 'Assegna i carichi sulla base di destra e guarda i diagrammi.',
        tasks: ['Con il solo taglio $\\hat T_y$: $T_y$ costante, $M_x$ lineare, nullo sulla base di destra.', 'Aggiungi $\\hat M_x$: il diagramma di $M_x$ trasla.', 'Lo sforzo normale resta costante qualunque cosa tu faccia.'],
        visual: SVG('cds'),
      },
      {
        id: 'l63-6',
        kind: 'domanda',
        q: { id: 'l63-q1', kind: 'scelta', q: 'Che cosa garantisce il postulato di Saint-Venant?', options: ['Che distribuzioni staticamente equivalenti danno soluzioni indistinguibili lontano dalle basi', 'Che la soluzione esiste', 'Che le sezioni restano piane', 'Che il momento è costante'], correct: 0, why: 'Teo 5.2.4.' },
      },
      {
        id: 'l63-7',
        kind: 'riassunto',
        md: `**In una frase:** i carichi sulle basi sono in equilibrio, le CdS sono costanti tranne i flettenti (lineari), si assegnano solo le CdS e il postulato garantisce che, lontano dalle basi, la distribuzione effettiva non conta.

- $M_x(z)=M_x-T_y(L-z)$, $M_y(z)=M_y+T_x(L-z)$.
- Dato debole: classe di dati staticamente equivalenti; back analysis.
- Regioni B sì, regioni D no.`,
        orale: ['Equilibrio globale e leggi di variazione delle CdS. (dispensa, domanda 4)', 'Problema indebolito, postulato di S-V, regioni B e D. (dispensa, domanda 5)'],
      },
    ],
  },
  // ================================================================== c6.4
  {
    concept: 'c6.4',
    title: 'Lo sforzo normale',
    minutes: 20,
    source: D(5, '5.3–5.4', 'Def 5.4.1, Teo 5.4.2', '109–113'),
    visual: BEAM('normale', { controls: ['section', 'amp'] }),
    steps: [
      {
        id: 'l64-1',
        kind: 'spiega',
        title: 'Quattro casi più uno',
        md: `Per sovrapposizione bastano **4 casi fondamentali** (§5.3): sforzo normale, flessione semplice ($M_x$, $M_y$), flessione composta (taglio), torsione. I primi due danno solo $\\sigma_z=T_{zz}$, gli altri anche tangenziali. Lo **sforzo normale eccentrico** è un quinto caso derivato.

**Def 5.4.1.** Forze sulle basi staticamente equivalenti a due forze uguali e opposte $N$ lungo l'asse, nei baricentri: l'unica CdS non nulla è $N$ (trazione $N>0$). Il dato non è una forza concentrata: conta l'equivalenza statica.

**Congetture:** oltre a quella di Saint-Venant, $T_{xz}=T_{yz}\\equiv0$ e $T_{zz}=D$ costante.`,
      },
      {
        id: 'l64-2',
        kind: 'derivazione',
        title: 'Equilibrio sulla base',
        md: 'Equilibrio di campo e mantello sono soddisfatti dalla forma $(\\star)$. Restano le condizioni indebolite sulla base.',
        source: D(5, '5.4.2', undefined, '110–111'),
        der: {
          lines: [
            { tex: 'N=\\int_AD\\,dA=DA\\ \\Rightarrow\\ D=\\frac NA', why: 'Sforzo normale.' },
            {
              tex: 'M_x=D\\,S_x=0,\\qquad M_y=-D\\,S_y=0',
              why: 'Gli assi sono baricentrici: i momenti statici sono nulli (Varignon). Tagli e torcente sono nulli perché mancano le tangenziali.',
              ask: { q: 'Perché i momenti flettenti sono nulli?', options: ['Perché gli assi sono baricentrici: $S_x=S_y=0$', 'Perché $D=0$', 'Perché la sezione è simmetrica', 'Perché il mantello è scarico'], correct: 0, why: '§5.4.2.' },
              eq: '§5.4.2',
            },
          ],
        },
      },
      {
        id: 'l64-3',
        kind: 'derivazione',
        title: 'Congruenza e soluzione',
        md: 'Dal legame inverso si integrano le dilatazioni; il campione deriva numericamente lo spostamento della soluzione in un punto a caso.',
        source: D(5, '5.4.3–5.4.4', 'Teo 5.4.2', '111–112'),
        der: {
          sample,
          lines: [
            { tex: 'E_{xx}=\\frac{\\partial u}{\\partial x}', why: 'Derivata numerica dello spostamento della soluzione.', val: (v) => strain(v, { N: v.N, Mx: 0, My: 0 }).xx },
            {
              tex: '=-\\frac{\\nu N}{EA}',
              why: 'Legame inverso con $T_{zz}=N/A$ e le altre nulle; allo stesso modo $\\partial v/\\partial y=-\\frac{\\nu N}{EA}$, $\\partial w/\\partial z=\\frac N{EA}$, scorrimenti nulli.',
              val: (v) => (-v.nu * v.N) / (v.E * sec(v).A),
            },
          ],
          checks: [
            { what: '$E_{zz}=N/(EA)$', f: (v) => [strain(v, { N: v.N, Mx: 0, My: 0 }).zz, v.N / (v.E * sec(v).A)] },
            { what: 'scorrimento $E_{yz}=0$', f: (v) => [strain(v, { N: v.N, Mx: 0, My: 0 }).yz, 0] },
          ],
        },
      },
      {
        id: 'l64-4',
        kind: 'spiega',
        title: 'La soluzione e la sua lettura',
        md: `Integrando, $u=-\\frac{\\nu N}{EA}x+\\bar u(y,z)$ e simili; le funzioni d'integrazione hanno deformazione nulla, quindi sono uno spostamento rigido. **Teo 5.4.2:**

$$\\{\\vet u\\}=\\Big(-\\frac{\\nu N}{EA}x,\\,-\\frac{\\nu N}{EA}y,\\,\\frac N{EA}z\\Big)+\\vet u^{r,\\infty},\\qquad[\\tens T]=\\operatorname{diag}\\Big(0,0,\\frac NA\\Big).$$

- **Tensione** uniforme e monoassiale. Sulla sezione niente tangenziali, su altre giaciture sì: dal cerchio di Mohr $\\tau_{\\max}=N/(2A)$ a 45° dall'asse. I piani scarichi sono quelli del fascio di asse parallelo a $z$ per il punto.
- **Deformazione:** scorrimenti nulli, sezioni piane e ortogonali all'asse che traslano di $\\frac N{EA}z$. La sezione si deforma in modo **omotetico** ($v/u=y/x$): contrazione per $N>0$, baricentro fermo.
- **Asse:** $w(z)=\\frac N{EA}z$, $N=EA\\,w'$: è il legame della linea elastica estensionale; $\\Delta L=\\frac{NL}{EA}=\\frac N{K_N}$, $K_N=\\frac{EA}L$.
- **Volume:** $\\Delta V=\\frac{1-2\\nu}ENL$, con il segno di $N$.`,
      },
      {
        id: 'l64-5',
        kind: 'derivazione',
        title: 'Energia: il teorema di Clapeyron',
        md: 'L’energia specifica è uniforme, quindi basta moltiplicare per il volume.',
        source: D(5, '5.4.4', undefined, 113),
        der: {
          sample,
          lines: [
            { tex: '\\Phi=\\int_{\\mathcal B}\\varphi\\,dV=\\frac{N^2}{2EA^2}\\,AL', why: '$\\varphi=\\frac{\\sigma^2}{2E}$ per lo stato monoassiale (Prop 4.14.1).', val: (v) => (v.N ** 2 / (2 * v.E * sec(v).A ** 2)) * sec(v).A * v.L },
            { tex: '=\\frac{N^2L}{2EA}=\\frac12N\\,\\Delta L', why: 'Con $\\Delta L=\\frac{NL}{EA}$. Il ½: il carico cresce lentamente da 0 a $N$, il lavoro è l’area del triangolo sotto la retta $N$–$\\Delta L$.', val: (v) => 0.5 * v.N * ((v.N * v.L) / (v.E * sec(v).A)), eq: '§5.4.4' },
          ],
        },
      },
      {
        id: 'l64-6',
        kind: 'prova',
        title: 'Il solido teso',
        md: 'Il modello calcola la deformata con il campo della dispensa.',
        tasks: ['Colore uniforme: la tensione è la stessa in ogni punto.', 'Aumenta l’amplificazione: il solido si allunga e la sezione si restringe in modo omotetico.', 'Guarda dalla base di destra: il contorno deformato è simile a quello iniziale.'],
        visual: BEAM('normale', { controls: ['section', 'amp'], view: 'prospettiva' }),
      },
      {
        id: 'l64-7',
        kind: 'domanda',
        q: { id: 'l64-q1', kind: 'scelta', q: 'Quanto vale la tangenziale massima nello sforzo normale?', options: ['$N/(2A)$, a 45° dall’asse', '0 su ogni giacitura', '$N/A$ sulla sezione', '$2N/A$'], correct: 0, why: '§5.4.4, cerchio di Mohr dello stato monoassiale.' },
      },
      {
        id: 'l64-8',
        kind: 'riassunto',
        md: `**In una frase:** $\\sigma_z=N/A$ uniforme e monoassiale, $\\Delta L=NL/(EA)$, sezioni piane che si contraggono in modo omotetico, $\\Phi=\\frac12N\\Delta L$.

- Congetture: $T_{xz}=T_{yz}=0$, $T_{zz}$ costante; $D=N/A$.
- $K_N=EA/L$; $N=EA\\,w'$.
- $\\tau_{\\max}=N/(2A)$ a 45°.`,
        orale: ['Sforzo normale: congetture, soluzione, tensione e deformazione, Clapeyron. (dispensa, domanda 6)'],
      },
    ],
  },
  // ================================================================== c6.5
  {
    concept: 'c6.5',
    title: 'Assi principali centrali ed ellisse d’inerzia',
    minutes: 12,
    source: D(5, '5.5.1–5.5.2', 'Def 5.5.1–5.5.2', '113–115'),
    visual: SVG('sezione', { tab: 'ecdi' }),
    steps: [
      {
        id: 'l65-1',
        kind: 'spiega',
        title: 'Flessione semplice e asse di sollecitazione',
        md: `**Def 5.5.1.** Forze sulle basi staticamente equivalenti a due coppie uguali e opposte nel piano delle basi. Il piano di sollecitazione $\\pi_s$ è ortogonale a $\\vet M$; l'**asse di sollecitazione** $s$ è la traccia di $\\pi_s$ sulla sezione.

**APCdI:** coppia di assi ortogonali, baricentrici e **coniugati** ($J_{xy}=0$). Un asse di simmetria è principale. Raggi d'inerzia $\\rho_x=\\sqrt{J_x/A}$, $\\rho_y=\\sqrt{J_y/A}$.

**Ellisse centrale d'inerzia:** diagramma polare dei raggi d'inerzia; il raggio relativo a un asse si riporta lungo la direzione **coniugata** (lungo $y$ si riporta $\\rho_x$).`,
      },
      {
        id: 'l65-2',
        kind: 'numeri',
        title: 'Le sezioni d’esempio',
        md: `Il motore calcola le proprietà dal contorno (formule di Green). Rettangolo 20×40: $J_x=${Math.round(S.principal(S.SEZIONI.rettangolo.poly).Jx)}$ cm⁴ ($BH^3/12$). Doppio T di 40 cm: $J_x=${Math.round(S.principal(S.SEZIONI.doppioT.poly).Jx)}$ cm⁴ con meno della metà dell'area. L a lati uguali: APCdI ruotati di ${Math.round((Math.abs(S.principal(S.SEZIONI.L.poly).psi) * 180) / Math.PI)}° (bisettrice), baricentro fuori dalla figura. Valori di esempio, non della dispensa.`,
        values: { Jrett: Math.round(S.principal(S.SEZIONI.rettangolo.poly).Jx), JdoppioT: Math.round(S.principal(S.SEZIONI.doppioT.poly).Jx), psiL: Math.round((Math.abs(S.principal(S.SEZIONI.L.poly).psi) * 180) / Math.PI) },
        visual: SVG('sezione', { tab: 'ecdi', section: 'L' }),
      },
      {
        id: 'l65-3',
        kind: 'spiega',
        title: 'Convenzioni e classificazione',
        md: `1. $x$ è l'APCdI di inerzia massima;
2. $\\alpha\\in\\,]-\\pi,\\pi[$ è l'inclinazione di $\\vet M$ su $x$;
3. $\\gamma=\\frac\\pi2+\\alpha$ è l'inclinazione di $s$ ($\\vet M$, ruotando in senso antiorario, va sul verso positivo di $s$);
4. $M_x=M\\cos\\alpha$, $M_y=M\\sin\\alpha$.

**Def 5.5.2.** Flessione **retta** se $s$ coincide con un APCdI, **deviata** altrimenti. Doppio T con momento obliquo: deviata. L a lati uguali con $s$ sull'asse di simmetria: retta. Quadrato: sempre retta (ellisse circolare). Si studiano la retta con $M_x$, la retta con $M_y$ e la deviata come loro sovrapposizione.`,
      },
      {
        id: 'l65-4',
        kind: 'prova',
        title: 'Ellissi a confronto',
        md: 'Cambia sezione e osserva l’ellisse centrale d’inerzia.',
        tasks: ['Rettangolo: ellisse allungata lungo y, perché lungo y si riporta $\\rho_x$ (il più grande).', 'L a lati uguali: assi ruotati di 45°.', 'Cerchio: ellisse circolare, ogni coppia di assi ortogonali è principale.'],
        visual: SVG('sezione', { tab: 'ecdi' }),
      },
      {
        id: 'l65-5',
        kind: 'domanda',
        q: { id: 'l65-q1', kind: 'vf', q: 'Una L a lati uguali con l’asse di sollecitazione sulla bisettrice è in flessione retta.', answer: true, why: 'Def 5.5.2: la bisettrice è asse di simmetria, quindi APCdI.' },
      },
      {
        id: 'l65-6',
        kind: 'riassunto',
        md: `**In una frase:** gli APCdI sono baricentrici, ortogonali e con $J_{xy}=0$; l'ellisse centrale d'inerzia riporta $\\rho_x$ lungo $y$ e $\\rho_y$ lungo $x$; la flessione è retta se $s$ è un APCdI.

- $x$ di inerzia massima, $\\alpha$ di $\\vet M$, $\\gamma=\\frac\\pi2+\\alpha$ di $s$.
- Quadrato e poligoni regolari: ellisse circolare.`,
        orale: ['Flessione retta: Navier, spostamenti, Bernoulli–Navier, rigidezza flessionale, anticlastica. (dispensa, domanda 7: le convenzioni)'],
      },
    ],
  },
  // ================================================================== c6.6
  {
    concept: 'c6.6',
    title: 'La flessione retta: Navier',
    minutes: 24,
    source: D(5, '5.5.3–5.5.4', undefined, '115–120'),
    visual: BEAM('flessione', { alpha: 0, controls: ['section', 'amp'] }),
    steps: [
      {
        id: 'l66-1',
        kind: 'derivazione',
        title: 'Tensione: la formula di Navier',
        md: 'Congetture: Saint-Venant più $T_{zx}=T_{zy}\\equiv0$ e $T_{zz}=Dy$. Campo e mantello sono soddisfatti; restano le condizioni sulla base.',
        source: D(5, '5.5.3', undefined, '115–117'),
        der: {
          lines: [
            { tex: 'N=D\\int_Ay\\,dA=DS_x=0', why: 'Asse $x$ baricentrico.' },
            { tex: 'M_x=D\\int_Ay^2dA=DJ_x\\ \\Rightarrow\\ D=\\frac{M_x}{J_x}', why: 'Definizione di $M_x$.' },
            {
              tex: 'M_y=-D\\int_Axy\\,dA=-DJ_{xy}=0',
              why: 'Gli assi sono **principali**: qui serve che $x$, $y$ siano APCdI.',
              ask: { q: 'Perché $M_y$ risulta nullo?', options: ['Perché $J_{xy}=0$ negli assi principali', 'Perché $S_y=0$', 'Perché $D=0$', 'Perché $M_z=0$'], correct: 0, why: '§5.5.3.' },
            },
            { tex: '\\sigma_z=\\frac{M_x}{J_x}\\,y', why: 'Formula di Navier: stato monoassiale, $[\\tens T]=\\operatorname{diag}(0,0,\\frac{M_x}{J_x}y)$.', eq: 'Navier §5.5.3' },
          ],
        },
      },
      {
        id: 'l66-2',
        kind: 'derivazione',
        title: 'Gli spostamenti sono congruenti',
        md: 'La dispensa integra le dilatazioni e aggiunge a $v$ i termini $+\\frac{\\nu M_x}{2EJ_x}x^2$ e $-\\frac{M_x}{2EJ_x}z^2$ per annullare gli scorrimenti. Il campione deriva numericamente il campo risultante.',
        source: D(5, '5.5.3', undefined, '116–117'),
        der: {
          sample,
          lines: [
            { tex: 'u=-\\frac{\\nu M_x}{EJ_x}xy,\\quad v=-\\frac{\\nu M_x}{2EJ_x}\\Big[(y^2-x^2)+\\frac{z^2}\\nu\\Big],\\quad w=\\frac{M_x}{EJ_x}yz', why: 'Il campo di spostamento (più un moto rigido).' },
            { tex: 'E_{zz}=\\frac{\\partial w}{\\partial z}', why: 'Derivata numerica in un punto a caso.', val: (v) => strain(v, { N: 0, Mx: v.Mx, My: 0 }).zz },
            { tex: '=\\frac{M_x}{EJ_x}\\,y=\\frac{\\sigma_z}E', why: 'Legame inverso: torna.', val: (v) => (v.Mx / (v.E * sec(v).Jx)) * pt(v)[1], eq: '§5.5.3' },
          ],
          checks: [
            { what: '$E_{xy}=0$', f: (v) => [strain(v, { N: 0, Mx: v.Mx, My: 0 }).xy, 0] },
            { what: '$E_{yz}=0$', f: (v) => [strain(v, { N: 0, Mx: v.Mx, My: 0 }).yz, 0] },
            { what: '$E_{xx}=-\\nu\\sigma_z/E$', f: (v) => [strain(v, { N: 0, Mx: v.Mx, My: 0 }).xx, (-v.nu * v.Mx * pt(v)[1]) / (v.E * sec(v).Jx)] },
          ],
        },
      },
      {
        id: 'l66-3',
        kind: 'spiega',
        title: 'Diagramma a farfalla e moduli di resistenza',
        md: `L'**asse neutro** $n$ è $y=0$, cioè l'asse $x$. Con $M_x>0$ e $y$ rivolto verso il basso le fibre sotto l'asse neutro sono tese, quelle sopra compresse: diagramma **a farfalla**. I valori estremi si hanno ai lembi:

$$\\sigma'_z=\\frac{M_x}{W'_x},\\quad\\sigma''_z=\\frac{M_x}{W''_x},\\qquad W'_x=\\frac{J_x}{y'},\\ W''_x=\\frac{J_x}{y''}\\ \\text{(moduli di resistenza)},$$

riportati nei sagomari dei profilati metallici. Nota storica: $N/A$ era noto da Galileo, la flessione da Navier; il contributo nuovo di Saint-Venant riguarda soprattutto la torsione.

Con $M_y$ (§5.5.4): $\\sigma_z=-\\frac{M_y}{J_y}x$, asse neutro $\\equiv y$, compressione per $x>0$.`,
      },
      {
        id: 'l66-4',
        kind: 'derivazione',
        title: 'L’asse si incurva ad arco di cerchio',
        md: 'Spostamento dell’asse: $v^{dp}(z)=-\\frac{M_x}{2EJ_x}z^2$. Il campione calcola la curvatura per differenze finite.',
        source: D(5, '5.5.3', undefined, 118),
        der: {
          sample,
          lines: [
            {
              tex: '\\kappa\\simeq-v\'\'(z)',
              why: 'Curvatura dell’asse (rotazione $\\varphi=-v\'$).',
              val: (v) => {
                const f = (z: number) => S.displacement({ N: 0, Mx: v.Mx, My: 0 }, sec(v), v.E, v.nu, [0, 0, z])[1];
                const h = 1e-3;
                return -(f(v.z + h) - 2 * f(v.z) + f(v.z - h)) / (h * h);
              },
            },
            {
              tex: '=\\frac{M_x}{EJ_x}\\ \\Rightarrow\\ M_x=EJ_x\\,\\kappa',
              why: 'Curvatura costante: l’asse è un **arco di circonferenza** di raggio $r=EJ_x/M_x$. È il legame della linea elastica flessionale.',
              ask: { q: 'Che forma ha l’asse deformato in flessione retta?', options: ['Un arco di circonferenza', 'Una parabola cubica', 'Una retta', 'Un’elica'], correct: 0, why: 'Curvatura costante $M_x/(EJ_x)$ (§5.5.3).' },
              val: (v) => v.Mx / (v.E * sec(v).Jx),
              eq: '§5.5.3',
            },
          ],
          checks: [{ what: '$\\Delta\\varphi=\\varphi(L)-\\varphi(0)=M_xL/(EJ_x)$', f: (v) => {
            const f = (z: number) => S.displacement({ N: 0, Mx: v.Mx, My: 0 }, sec(v), v.E, v.nu, [0, 0, z])[1];
            const h = 1e-4;
            const phi = (z: number) => -(f(z + h) - f(z - h)) / (2 * h);
            return [phi(v.L) - phi(0), (v.Mx * v.L) / (v.E * sec(v).Jx)];
          } }],
        },
      },
      {
        id: 'l66-5',
        kind: 'spiega',
        title: 'Sezioni piane, rigidezza e forma',
        md: `Gli scorrimenti sono nulli: la linea elastica resta ortogonale alla sezione deformata, che resta **piana** (**Bernoulli–Navier**, qui ottenuto come risultato). Asse di flessione $f\\equiv y$. Rotazione relativa delle basi:

$$\\Delta\\varphi=\\frac{M_xL}{EJ_x}=\\frac{M_x}{K_f},\\qquad K_f=\\frac{EJ_x}L\\ \\text{(rigidezza flessionale)}.$$

**Forma:** a parità di area, allontanare il materiale dall'asse aumenta $J_x$ (che cresce come il cubo delle dimensioni): diminuiscono $\\Delta\\varphi$ e $\\sigma_{\\max}$. Il **doppio T** è ottimale. Le fibre si allungano di $\\Delta L=\\frac{M_xL}{EJ_x}y$: sotto si allungano, sopra si accorciano.`,
      },
      {
        id: 'l66-6',
        kind: 'derivazione',
        title: 'La deformazione anticlastica',
        md: 'Sulla sezione $\\bar z=0$: $v^{dp}=-\\frac{\\nu M_x}{2EJ_x}(y^2-x^2)$. Lungo l’asse neutro ($y=0$) resta $v^{dp}=\\frac{\\nu M_x}{2EJ_x}x^2$; il campione ne calcola la curvatura.',
        source: D(5, '5.5.3', undefined, 119),
        der: {
          sample,
          lines: [
            {
              tex: '\\frac1{\\rho\'}=\\frac{d^2v}{dx^2}\\Big|_{y=0}',
              why: 'Curvatura dell’asse neutro della sezione.',
              val: (v) => {
                const f = (x: number) => S.displacement({ N: 0, Mx: v.Mx, My: 0 }, sec(v), v.E, v.nu, [x, 0, 0])[1];
                const h = 1e-3;
                return (f(h) - 2 * f(0) + f(-h)) / (h * h);
              },
            },
            {
              tex: '=\\frac{\\nu M_x}{EJ_x}\\ \\Rightarrow\\ \\rho\'=-\\frac{EJ_x}{\\nu M_x},\\quad|\\rho\'|=\\frac r\\nu>r',
              why: 'Segno opposto alla curvatura dell’asse del solido: asse e asse neutro si incurvano da parti opposte (effetto Poisson). Il segno di $\\rho\'$ segue la convenzione della dispensa.',
              val: (v) => (v.nu * v.Mx) / (v.E * sec(v).Jx),
              eq: '§5.5.3',
            },
          ],
        },
      },
      {
        id: 'l66-7',
        kind: 'spiega',
        title: 'Volume ed energia',
        md: `$\\Theta=\\frac{1-2\\nu}E\\frac{M_x}{J_x}y$ cambia segno con $y$; integrando, $\\Delta V=\\frac{1-2\\nu}E\\frac{M_xL}{J_x}S_x=0$: il volume non cambia.

$\\varphi=\\frac{M_x^2}{2EJ_x^2}y^2$ e, integrando sulla sezione ($\\int y^2=J_x$) e sulla lunghezza,

$$\\Phi=\\frac{M_x^2L}{2EJ_x}=\\frac12M_x\\,\\Delta\\varphi\\quad\\text{(Clapeyron: carico lento rispetto al periodo naturale di vibrazione).}$$`,
      },
      {
        id: 'l66-8',
        kind: 'prova',
        title: 'Arco, sezioni piane e sella',
        md: 'Il modello usa il campo di spostamento della dispensa, amplificato.',
        tasks: ['Di lato: l’asse è un arco, le basi restano piane e ortogonali all’asse.', 'I colori: rosso sotto (trazione), blu sopra (compressione), bianco sull’asse neutro.', 'Passa al doppio T: a parità di momento le tensioni estreme scendono rispetto al rettangolo di pari area (vedi i numeri).'],
        visual: BEAM('flessione', { alpha: 0, controls: ['section', 'amp'], view: 'lato' }),
      },
      {
        id: 'l66-9',
        kind: 'prova',
        title: 'Guarda la sezione',
        md: 'Vista dalla base di destra, con la griglia della sezione deformata (spostamenti fortemente amplificati).',
        tasks: ['La riga dell’asse neutro si incurva in verso opposto all’asse del solido.', 'Le fibre tese (sotto) si restringono, quelle compresse (sopra) si allargano: la sezione diventa un trapezio curvo.'],
        visual: BEAM('anticlastica', { controls: ['section', 'amp'], view: 'sezione' }),
      },
      {
        id: 'l66-10',
        kind: 'domanda',
        q: { id: 'l66-q1', kind: 'scelta', q: 'Qual è la rigidezza flessionale del solido?', options: ['$EJ_x/L$', '$EA/L$', '$GJ/L$', '$EJ_x$'], correct: 0, why: '§5.5.3: $\\Delta\\varphi=M_x/K_f$.' },
      },
      {
        id: 'l66-11',
        kind: 'riassunto',
        md: `**In una frase:** $\\sigma_z=M_xy/J_x$ a farfalla, sezioni piane, asse ad arco di cerchio con $M_x=EJ_x\\kappa$, sezione anticlastica con $|\\rho'|=r/\\nu$, volume invariato, $\\Phi=\\frac12M_x\\Delta\\varphi$.

- $D=M_x/J_x$; $M_y=0$ perché $J_{xy}=0$.
- $W=J_x/y$; $K_f=EJ_x/L$; doppio T ottimale.
- Con $M_y$: $\\sigma_z=-M_yx/J_y$.`,
        orale: ['Flessione retta: Navier, spostamenti, Bernoulli–Navier, rigidezza flessionale, anticlastica. (dispensa, domanda 7)'],
      },
    ],
  },
  // ================================================================== c6.7
  {
    concept: 'c6.7',
    title: 'La flessione deviata e i due teoremi',
    minutes: 20,
    source: D(5, '5.5.5', 'Teo 5.5.3–5.5.4', '120–122'),
    visual: SVG('sezione', { tab: 'deviata', section: 'doppioT', alpha: 30 }),
    steps: [
      {
        id: 'l67-1',
        kind: 'spiega',
        title: 'Gli angoli in gioco',
        md: `Schema: sezione e momento, APCdI, asse $s$, classificazione. Angoli misurati da $x$:

$$\\alpha=\\widehat{MGx},\\quad\\gamma=\\tfrac\\pi2+\\alpha,\\quad\\beta=\\widehat{nGx},\\quad\\theta=\\widehat{fGx}=\\tfrac\\pi2+\\beta,\\quad\\delta=\\widehat{fGs}=\\theta-\\gamma=\\beta-\\alpha.$$

$n$ è l'asse neutro, orientato in modo che $\\vet M$ abbia componente positiva lungo $n$; $f$ è l'asse di flessione; $\\delta$ è l'angolo di deviazione. In deviata **l'asse si inflette in un piano diverso da quello della coppia**.

**Formula binomia** (sovrapposizione di $M_x$ e $M_y$): $\\sigma_z=\\frac{M_x}{J_x}y-\\frac{M_y}{J_y}x$. È scomoda: le zone compresse dei due diagrammi sono diverse e non si vede subito dove la sezione è più sollecitata.`,
      },
      {
        id: 'l67-2',
        kind: 'derivazione',
        title: 'La formula monomia',
        md: 'La tensione dipende solo dalla distanza $f$ dall’asse neutro. Il campione confronta le due formule in un punto a caso, con α casuale.',
        source: D(5, '5.5.5', undefined, 121),
        der: {
          sample,
          lines: [
            { tex: '\\sigma_z=\\frac{M_x}{J_x}y-\\frac{M_y}{J_y}x', why: 'Binomia, con $M_x=M\\cos\\alpha$, $M_y=M\\sin\\alpha$.', val: (v) => S.sigmaZ({ N: 0, Mx: 2 * Math.cos(v.a), My: 2 * Math.sin(v.a) }, sec(v), pt(v)[0], pt(v)[1]) },
            {
              tex: '=\\frac{M_n}{J_n}f,\\quad M_n=M\\cos\\delta,\\quad J_n=J_x\\cos^2\\beta+J_y\\sin^2\\beta,\\quad f=-x\\sin\\beta+y\\cos\\beta',
              why: '$M_n$ componente di $\\vet M$ lungo $n$, $J_n$ momento d’inerzia rispetto a $n$ (rotazione degli assi, $J_{xy}=0$), $f$ coordinata del punto nel riferimento $(n,f)$.',
              val: (v) => S.monomia(2, v.a, sec(v), pt(v)[0], pt(v)[1]).sigma,
              eq: '§5.5.5',
            },
          ],
        },
      },
      {
        id: 'l67-3',
        kind: 'derivazione',
        title: 'Primo teorema: n e s sono coniugati',
        md: 'Sull’asse neutro $\\sigma_z=0$.',
        source: D(5, '5.5.5', 'Teo 5.5.3', 121),
        der: {
          sample,
          lines: [
            { tex: '\\frac{M_x}{J_x}y=\\frac{M_y}{J_y}x', why: 'Asse neutro dalla binomia.' },
            { tex: '\\tan\\beta=\\frac yx=\\frac{M_y}{J_y}\\frac{J_x}{M_x}=\\frac{M\\sin\\alpha}{A\\rho_y^2}\\frac{A\\rho_x^2}{M\\cos\\alpha}=\\tan\\alpha\\,\\frac{\\rho_x^2}{\\rho_y^2}', why: 'Coefficiente angolare dell’asse neutro, con $J=A\\rho^2$.' },
            {
              tex: '\\tan\\beta\\,\\tan\\gamma',
              why: 'Con $\\gamma=\\frac\\pi2+\\alpha$, $\\tan\\alpha=-1/\\tan\\gamma$: sostituendo…',
              val: (v) => Math.tan(ang(v).beta) * Math.tan(ang(v).gamma),
            },
            {
              tex: '=-\\frac{\\rho_x^2}{\\rho_y^2}',
              why: '…si ottiene la condizione di coniugio rispetto all’ellisse centrale d’inerzia.',
              ask: { q: 'Che cosa significa la relazione trovata?', options: ['Che $n$ e $s$ sono diametri coniugati dell’ellisse centrale d’inerzia', 'Che $n$ e $s$ sono ortogonali', 'Che la flessione è retta', 'Che $\\delta=0$'], correct: 0, why: 'Teo 5.5.3. Coniugati, non necessariamente ortogonali.' },
              val: (v) => -(sec(v).Jx / sec(v).Jy),
              eq: 'Teo 5.5.3',
            },
          ],
        },
      },
      {
        id: 'l67-4',
        kind: 'derivazione',
        title: 'Secondo teorema: f è ortogonale a n',
        md: 'Spostamenti dell’asse: $v^{dp}=-\\frac{M_x}{2EJ_x}z^2$, $u^{dp}=\\frac{M_y}{2EJ_y}z^2$. Stessa dipendenza da $z$: l’asse resta in un piano (non è un’elica).',
        source: D(5, '5.5.5', 'Teo 5.5.4', 122),
        der: {
          sample,
          lines: [
            {
              tex: '\\tan\\theta=\\frac{v^{dp}}{u^{dp}}',
              why: 'Il piano di flessione contiene l’asse deformato: il rapporto non dipende da $z$.',
              val: (v) => {
                const d = S.displacement({ N: 0, Mx: Math.cos(v.a), My: Math.sin(v.a) }, sec(v), v.E, v.nu, [0, 0, v.z + 0.5]);
                return d[1] / d[0];
              },
            },
            { tex: '=-\\frac{M_x}{J_x}\\frac{J_y}{M_y}=-\\frac1{\\tan\\alpha}\\frac{\\rho_y^2}{\\rho_x^2}=\\tan\\gamma\\,\\frac{\\rho_y^2}{\\rho_x^2}', why: '$M_y/M_x=\\tan\\alpha$ e $\\tan\\alpha=-1/\\tan\\gamma$.', val: (v) => -(Math.cos(v.a) / sec(v).Jx) * (sec(v).Jy / Math.sin(v.a)) },
            {
              tex: '=-\\frac1{\\tan\\beta}\\ \\Rightarrow\\ \\tan\\theta\\tan\\beta=-1',
              why: 'Primo teorema: $\\tan\\gamma\\,\\rho_y^2/\\rho_x^2=-1/\\tan\\beta$.',
              val: (v) => -1 / Math.tan(ang(v).beta),
              eq: 'Teo 5.5.4',
            },
          ],
        },
      },
      {
        id: 'l67-5',
        kind: 'spiega',
        title: 'La procedura',
        md: `$$ (M,\\alpha)\\ \\to\\ s\\ \\xrightarrow{\\ \\text{I teorema}\\ }\\ n\\ \\xrightarrow{\\ \\text{II teorema}\\ }\\ f.$$

Le coppie coniugate non sono in generale ortogonali: per questo $n$ non è ortogonale a $s$. In flessione retta $\\alpha=0$ dà $\\beta=0$ ($n\\equiv x$) e $\\theta=\\pi/2$ ($f\\equiv y$): la monomia torna Navier.`,
      },
      {
        id: 'l67-6',
        kind: 'prova',
        title: 'Ruota il momento',
        md: 'Nel diagramma della sezione muovi α e confronta s, n e f.',
        tasks: ['Doppio T, α = 30°: l’asse neutro è molto più vicino a x di quanto s sia vicino a y (δ grande).', 'Porta α a 0° o 90°: flessione retta, n ⊥ s.', 'Cerchio: per ogni α l’asse neutro è ortogonale a s (ellisse circolare).', 'Leggi nella tabella la verifica del primo teorema.'],
        visual: SVG('sezione', { tab: 'deviata', section: 'doppioT', alpha: 30 }),
      },
      {
        id: 'l67-7',
        kind: 'prova',
        title: 'Il solido in flessione deviata',
        md: 'Lo stesso nel modello 3D: il solido si inflette nel piano di f, non in quello della coppia.',
        tasks: ['Imposta α = 30° sul doppio T e guarda dalla base di destra: f è lontano da s.', 'L’asse neutro sulla base di destra separa la zona rossa da quella blu.'],
        visual: { kind: 'trave3d', scene: { mode: 'flessione', section: 'doppioT', alpha: 30, controls: ['section', 'alpha', 'amp'] } },
      },
      {
        id: 'l67-8',
        kind: 'domanda',
        q: { id: 'l67-q1', kind: 'vf', q: 'In flessione deviata il solido si inflette nel piano della coppia.', answer: false, why: '§5.5.5: si inflette nel piano di $f$, ortogonale all’asse neutro, che differisce da $s$ di $\\delta$.' },
      },
      {
        id: 'l67-9',
        kind: 'riassunto',
        md: `**In una frase:** in flessione deviata $\\sigma_z=\\frac{M_n}{J_n}f$, l'asse neutro è coniugato di $s$ rispetto all'ellisse d'inerzia ($\\tan\\beta\\tan\\gamma=-\\rho_x^2/\\rho_y^2$) e il solido si inflette nel piano ortogonale all'asse neutro ($\\tan\\theta\\tan\\beta=-1$).

- Binomia = sovrapposizione; monomia = distanza dall'asse neutro.
- Procedura $s\\to n\\to f$.`,
        orale: ['Flessione deviata: angoli, binomia e monomia, I e II teorema con dimostrazione. (dispensa, domanda 8)'],
      },
    ],
  },
  // ================================================================== c6.8 (facoltativo)
  {
    concept: 'c6.8',
    title: 'Sforzo normale eccentrico e nocciolo (facoltativo)',
    minutes: 16,
    source: D(5, '5.6', 'Def 5.6.1–5.6.2', '122–125'),
    visual: SVG('sezione', { tab: 'nocciolo', section: 'rettangolo', yc: 10 }),
    steps: [
      {
        id: 'l68-1',
        kind: 'spiega',
        title: 'Un caso derivato',
        md: `La dispensa avverte che questo caso è negli appunti ma **non è stato trattato a lezione**: lo trovi qui per completezza.

**Def 5.6.1.** Forze sulle basi equivalenti a due forze uguali e opposte parallele all'asse ma non passanti per il baricentro; la loro traccia è il **centro di sollecitazione** $c$. Trasportando la forza nel baricentro nasce la coppia di trasporto

$$\\vet M=(c-G)\\wedge N\\hat e_z\\ \\Rightarrow\\ M_x=Ny_c,\\ M_y=-Nx_c\\iff x_c=-\\frac{M_y}N,\\ y_c=\\frac{M_x}N.$$`,
      },
      {
        id: 'l68-2',
        kind: 'derivazione',
        title: 'La formula trinomia',
        md: 'Sovrapposizione di sforzo normale e flessione; il campione prende un centro a caso.',
        source: D(5, '5.6', undefined, 123),
        der: {
          sample,
          lines: [
            { tex: '\\sigma_z=\\frac NA+\\frac{M_x}{J_x}y-\\frac{M_y}{J_y}x', why: 'Sovrapposizione.', val: (v) => S.sigmaZ({ N: v.N, Mx: v.N * v.y, My: -v.N * v.x }, sec(v), pt(v)[0], pt(v)[1]) },
            {
              tex: '=\\frac NA\\Big(1+\\frac{xx_c}{\\rho_y^2}+\\frac{yy_c}{\\rho_x^2}\\Big)',
              why: 'Con $M_x=Ny_c$, $M_y=-Nx_c$ e $J=A\\rho^2$ (qui $x_c=v_x$, $y_c=v_y$ del campione).',
              val: (v) => S.trinomia(v.N, [v.x, v.y], sec(v), pt(v)[0], pt(v)[1]),
              eq: '§5.6',
            },
          ],
        },
      },
      {
        id: 'l68-3',
        kind: 'spiega',
        title: 'Polo, antipolare e nocciolo',
        md: `L'asse neutro $1+\\frac{xx_c}{\\rho_y^2}+\\frac{yy_c}{\\rho_x^2}=0$ e il centro $c$ sono **polo e antipolare** nella polarità d'inerzia: intercette $(-\\rho_y^2/x_c,0)$ e $(0,-\\rho_x^2/y_c)$. L'asse neutro della flessione associata è parallelo e baricentrico; il diagramma è lineare, nullo su $n$.

**Def 5.6.2.** Il **nocciolo centrale d'inerzia** è il luogo degli antipoli delle rette che non tagliano la sezione; il suo contorno è dato dalle rette radenti. Con $c$ nel baricentro la tensione è uniforme; dentro il nocciolo il diagramma è un trapezio (sezione tutta compressa o tesa); sul contorno un triangolo; fuori una farfalla; con $c\\to\\infty$ e $N\\to0$ si torna alla flessione semplice.

**Materiale non reagente a trazione** (contatto unilatero: fondazioni, ruota–strada, archi in muratura): con $c$ fuori dal nocciolo la sezione si **parzializza**; la parte reagente è tale che $c$ cada sul contorno del suo nocciolo («saracinesca che si chiude»). Con $c$ sul contorno della sezione reagisce un punto ($\\sigma\\to\\infty$, «ballerina sulle punte»); fuori, ribaltamento. Il problema è non lineare e implicito.`,
      },
      {
        id: 'l68-4',
        kind: 'derivazione',
        title: 'Rettangolo: la regola delle 3u',
        md: 'Nocciolo = rombo dei terzi medi. Con $c$ su un asse a distanza $u$ dal lembo compresso e $c$ fuori dal nocciolo, il diagramma è triangolare.',
        source: D(5, '5.6.2', undefined, 125),
        der: {
          sample,
          lines: [
            { tex: 'h=3u', why: 'La risultante del triangolo sta a un terzo dell’altezza reagente $h$ dal lembo più compresso e deve passare per $c$.' },
            { tex: 'N=\\tfrac12\\sigma_{\\max}B\\,(3u)', why: 'Risultante del diagramma triangolare (il campione usa $e=0{,}3H$, fuori dal nocciolo).', val: (v) => { const r = S.treU(Math.abs(v.N) + 1, v.B, v.H, 0.3 * v.H); return 0.5 * r.sMax * v.B * r.reag; } },
            {
              tex: '\\Rightarrow\\ \\sigma_{\\max}=\\frac{2N}{3uB}',
              why: 'Regola delle 3u; il valore in tabella è $|N|$ ricostruito dal motore.',
              val: (v) => Math.abs(v.N) + 1,
              eq: '§5.6.2',
            },
          ],
        },
      },
      {
        id: 'l68-5',
        kind: 'prova',
        title: 'Sposta il centro di sollecitazione',
        md: 'Nel diagramma muovi $c$ e guarda l’asse neutro e il nocciolo.',
        tasks: ['Con c nel nocciolo l’asse neutro non taglia la sezione.', 'Con c sul contorno del nocciolo l’asse neutro è radente.', 'Rettangolo, c sull’asse y fuori dal nocciolo: accendi «non reagente a trazione» e leggi l’altezza reagente 3u.'],
        visual: SVG('sezione', { tab: 'nocciolo', section: 'rettangolo', yc: 10, nontrazione: true }),
      },
      {
        id: 'l68-6',
        kind: 'domanda',
        q: { id: 'l68-q1', kind: 'scelta', q: 'Che cosa accade a un materiale non reagente a trazione con il centro di sollecitazione fuori dalla sezione?', options: ['L’equilibrio è impossibile (ribaltamento)', 'La sezione è tutta compressa', 'Reagisce l’intera sezione', 'La tensione è uniforme'], correct: 0, why: '§5.6.2.' },
      },
      {
        id: 'l68-7',
        kind: 'riassunto',
        md: `**In una frase:** una forza eccentrica equivale a $N$ più una coppia; $\\sigma_z=\\frac NA(1+\\frac{xx_c}{\\rho_y^2}+\\frac{yy_c}{\\rho_x^2})$, $c$ e asse neutro sono polo e antipolare, il nocciolo separa le sezioni tutte compresse da quelle parzializzate. Argomento non trattato a lezione.

- Rettangolo: rombo dei terzi medi; $\\sigma_{\\max}=\\frac{2N}{3uB}$ con altezza reagente $3u$.`,
        orale: ['SNE, nocciolo, materiale non reagente a trazione, regola delle 3u. (dispensa, domanda 9; argomento non trattato a lezione)'],
      },
    ],
  },
];
