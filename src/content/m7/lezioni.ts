/**
 * Lezioni guidate del Modulo 7 (Cap. 5, §5.7–5.8), riscritte secondo docs/GUIDA_LEZIONI.md: ogni lezione contiene
 * anche tutto ciò che stava nella scheda del concetto (m7/concetti.ts). Derivazioni solo dove la dispensa le sviluppa;
 * le righe con `val` sono verificate su 25 campioni casuali (tests/lezioni.test.ts). Numeri da engine/taglio e
 * engine/torsione.
 */
import { D } from '../../engine/types';
import * as J from '../../engine/taglio';
import * as Tor from '../../engine/torsione';
import type { Lesson, LessonVisual } from '../types';

type R = Record<string, number>;
const SVG = (id: 'jourawski' | 'torsione', params?: Record<string, string | number | boolean>): LessonVisual => ({ kind: 'svg', id, params });
const TOR = (mode: 'clebsch' | 'prandtl', extra: Record<string, unknown> = {}): LessonVisual => ({ kind: 'torsione3d', scene: { mode, ...extra } });

const sample = (r: () => number): R => {
  const B = 1 + 2 * r();
  return { B, H: B * (1.2 + 2 * r()), T: 1 + 4 * r(), t: 0.05 + 0.9 * r(), g: 0.2 + r(), c: 2 * r() - 1, x: 2 * r() - 1, y: 2 * r() - 1, z: 3 * r(), a: 1 + 2 * r(), b: 0.5 + r(), gx: 0.2 + 0.6 * r(), gy: 0.2 + 0.6 * r() };
};
const rectPoly = (v: R): [number, number][] => [
  [-v.B / 2, -v.H / 2],
  [v.B / 2, -v.H / 2],
  [v.B / 2, v.H / 2],
  [-v.B / 2, v.H / 2],
];
const yb = (v: R) => -v.H / 2 + v.t * v.H;
/** campo di Clebsch con un ingobbamento armonico di prova φ = c·xy (solo per verificare le formule) */
const clebsch = (v: R, p: [number, number, number]): [number, number, number] => [-v.g * p[1] * p[2], v.g * p[0] * p[2], v.g * v.c * p[0] * p[1]];
const dfd = (f: (p: [number, number, number]) => number[], p: [number, number, number], i: number, k: number, h = 1e-3) => {
  const a = [...p] as [number, number, number],
    b = [...p] as [number, number, number];
  a[i] += h;
  b[i] -= h;
  return (f(a)[k] - f(b)[k]) / (2 * h);
};
/** integrale su un'ellisse di semiassi a, b (coordinate ellittiche; Gauss a 3 punti in r, 16 punti in θ: esatto per i polinomi usati) */
const GR = [0.5 - Math.sqrt(0.15), 0.5, 0.5 + Math.sqrt(0.15)];
const GW = [5 / 18, 8 / 18, 5 / 18];
const intEllipse = (a: number, b: number, f: (x: number, y: number) => number) => {
  let s = 0;
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 16; j++) {
      const r = GR[i],
        th = (2 * Math.PI * j) / 16;
      s += f(a * r * Math.cos(th), b * r * Math.sin(th)) * a * b * r * GW[i] * ((2 * Math.PI) / 16);
    }
  return s;
};

const SQ = Tor.prandtl(Tor.SEZ_TORSIONE.quadrato.poly, 60);
const sqTau = (100 / SQ.I) * SQ.gmax; // kN/cm² con M_z = 100 kN·cm, lato 24 cm
const TUBE = Tor.tubeCompare(10, 0.2, 100);


export const M7_LEZIONI: Lesson[] = [
  // ================================================================== c7.1
  {
    concept: 'c7.1',
    title: 'Il taglio: la formula di Jourawski',
    minutes: 36,
    source: D(5, '5.7.1–5.7.2', 'Def 5.7.1, Teo 5.7.2, Prop 5.7.3', '125–129'),
    visual: SVG('jourawski', { section: 'rettangolo' }),
    steps: [
      {
        id: 'l71-1',
        kind: 'spiega',
        title: 'Dove siamo e dove andiamo',
        md: `Nel Modulo 6 abbiamo risolto i casi del problema di Saint-Venant in cui la sezione lavora solo con **tensioni normali** $\\sigma_z$, cioè perpendicolari alla sezione: lo sforzo normale, la flessione retta e deviata, lo sforzo normale eccentrico. Restano due sollecitazioni, il **taglio** e la **torsione**, che producono invece **tensioni tangenziali**, cioè tensioni che giacciono nel piano della sezione e tendono a far scorrere una faccia rispetto all'altra.

Questa lezione è dedicata al taglio, e la domanda che la guida è: **quanto vale la tensione tangenziale prodotta da una forza di taglio, e come si distribuisce sulla sezione?**

Le tappe sono queste. Prima capiamo perché il taglio non arriva mai da solo, ma sempre insieme a un momento flettente. Poi vediamo perché ci accontentiamo di una teoria approssimata, quella di Jourawski, e con quali ipotesi. Il cuore della lezione è la dimostrazione: isoliamo un pezzetto di trave e ne scriviamo l'equilibrio. Infine leggiamo la formula: dove la tensione è nulla, dove è massima, che forma hanno i diagrammi.`,
      },
      {
        id: 'l71-2',
        kind: 'spiega',
        title: 'Perché dove c’è taglio c’è momento?',
        md: `Partiamo dalla definizione di flessione composta (Def 5.7.1). Sulla base di destra del solido le forze applicate sono equivalenti a una sola forza $\\vet T$, il **taglio**, che sta nel piano della base e ha componenti $T_x$ e $T_y$. Sulla base di sinistra, perché il solido sia in equilibrio, deve agire la forza opposta $-\\vet T$.

Ma due forze uguali e opposte applicate a distanza $L$, la lunghezza del solido, non bastano all'equilibrio: formano una coppia, che va bilanciata. Per questo sulla base di sinistra agisce anche una coppia, di momento $M=TL$. Ecco il motivo della frase della dispensa: **dove c'è taglio c'è momento flettente**.

Le leggi di variazione delle caratteristiche della sollecitazione (CdS) che abbiamo visto nel Modulo 6 (Teo 5.2.3) dicono come varia questo momento lungo l'asse: il taglio è costante, il momento è lineare in $z$. Con il solo taglio $T_y$ si ottiene
$$M_x(z)=-T_y\\,(L-z),$$
nullo sulla base di destra ($z=L$) e massimo in valore sulla base di sinistra ($z=0$). Tieni a mente che **il momento cambia da una sezione all'altra**: sarà la chiave della dimostrazione.`,
      },
      {
        id: 'l71-3',
        kind: 'spiega',
        title: 'Perché una teoria approssimata?',
        md: `Il caso del taglio ha una difficoltà che i casi del Modulo 6 non avevano: la soluzione esatta **dipende molto dalla forma della sezione**, e la si conosce solo per geometrie semplici (§5.7). Non esiste una formula valida per tutte le sezioni, come era la formula di Navier per la flessione.

Si usa allora la **teoria approssimata di Jourawski** (§5.7.1), che fa due rinunce consapevoli:
- usa **solo l'equilibrio**, senza imporre la congruenza e il legame costitutivo;
- non cerca la tensione punto per punto, ma il suo **valore medio** lungo una **corda**, cioè un segmento che attraversa la sezione da un bordo all'altro.

Le ipotesi sono due. La prima: l'asse $y$ è un **asse di simmetria** della sezione. La seconda: il taglio è **retto**, cioè diretto lungo $y$, $T\\equiv T_y$; di conseguenza anche il momento è retto, $M\\equiv M_x$, e la parte di flessione è quella di Navier che già conosciamo: $\\sigma_z=\\frac{M_x}{J_x}y$, con $J_x$ momento d'inerzia della sezione rispetto all'asse $x$.`,
      },
      {
        id: 'l71-4',
        kind: 'spiega',
        title: 'Dove deve passare il taglio: il centro di taglio',
        md: `C'è una condizione in più, che la dispensa segnala con un'osservazione (§5.7.1). Perché la sezione si fletta senza torcersi, la retta d'azione del taglio deve passare per un punto preciso, il **centro di taglio** $C_T$ (la dispensa cita Sollazzo–Marzano). Se il taglio passa altrove, nasce anche una torsione. L'esempio tipico è il **profilo a C**: caricato nel suo piano medio, oltre a flettersi si torce.

Dove si trova il centro di taglio? La dispensa dà due regole che ci bastano:
- il centro di taglio **giace su ogni asse di simmetria** della sezione;
- se gli assi di simmetria sono due, il centro di taglio sta sulla loro intersezione, quindi **coincide con il baricentro**.

Per un rettangolo, un cerchio o un doppio T, dunque, basta che il taglio passi per il baricentro. Per una sezione a T, che ha un solo asse di simmetria, sappiamo solo che il centro di taglio sta su quell'asse. Da qui in poi supponiamo sempre che il taglio passi per il centro di taglio.`,
      },
      {
        id: 'l71-5',
        kind: 'domanda',
        q: { id: 'l71-q2', kind: 'scelta', q: 'Perché nella flessione composta il taglio è sempre accompagnato da un momento flettente?', options: ['Perché $\\vet T$ sulla base di destra e $-\\vet T$ su quella di sinistra formano una coppia, che va equilibrata da un momento $M=TL$', 'Perché il taglio non passa mai per il centro di taglio', 'Perché le tensioni tangenziali generano sempre tensioni normali per il legame costitutivo', 'Non è vero: il momento compare solo se la sezione non è simmetrica'], correct: 0, why: 'È una questione di equilibrio globale (Def 5.7.1): due forze opposte a distanza $L$ formano una coppia, e solo un momento la bilancia; lungo il solido $M_x(z)=-T_y(L-z)$. Il centro di taglio riguarda la torsione, non il momento flettente; il legame costitutivo e la simmetria non c’entrano.' },
      },
      {
        id: 'l71-6',
        kind: 'spiega',
        title: 'L’idea: isolare un pezzetto di trave',
        md: `Le tensioni tangenziali sono forze **interne**: finché la trave è intera non compaiono in nessuna equazione di equilibrio globale. Il trucco per farle comparire è **tagliare**: se isoliamo un pezzo di trave, le forze che il resto della trave esercitava su di esso diventano forze esterne al pezzo, e possiamo scriverne l'equilibrio.

Ecco il pezzo che si sceglie (§5.7.2). Prendiamo la porzione $\\mathcal P$ di trave compresa tra due sezioni vicinissime, a quota $z$ e $z+dz$. Poi la tagliamo con un piano parallelo al piano $xz$, cioè orizzontale nel disegno della sezione: questo piano interseca la sezione lungo una **corda**, di lunghezza $b_r$. Teniamo solo la parte che sta sotto la corda:
- la sua faccia sulla sezione è l'**area sottesa** $A_r$ (la parte gialla nel diagramma);
- la faccia orizzontale creata dal taglio è il **rettangolo di taglio** $A_t$, lungo $b_r$ e largo $dz$.

Sul mantello, cioè sulla superficie laterale della trave, non agisce niente: è scarico. Quindi sul nostro pezzetto agiscono solo le tensioni normali $\\sigma_z$ sulle due facce $A_r$ e le tensioni tangenziali sul rettangolo di taglio. Muovi la corda nel diagramma e guarda come cambiano $b_r$ e l'area gialla.`,
      },
      {
        id: 'l71-7',
        kind: 'derivazione',
        title: 'La formula di Jourawski',
        md: 'Vogliamo arrivare a $\\bar\\tau_{zy}=\\frac{T_yS_x}{J_xb_r}$, il valore medio della tensione tangenziale sulla corda. L’idea è una sola: le tensioni normali sulle due facce del pezzetto non si bilanciano, perché il momento cambia tra $z$ e $z+dz$; la differenza la deve assorbire la forza tangenziale sul rettangolo di taglio. Scriviamo quindi l’equilibrio del pezzetto lungo l’asse $z$. Il campione numerico è un rettangolo con una corda a caso; il motore taglia davvero la sezione.',
        source: D(5, '5.7.2', 'Teo 5.7.2', '126–127'),
        der: {
          sample,
          lines: [
            {
              tex: '\\int_{A_r}-\\sigma_z(z)\\,dA+\\int_{A_r}\\sigma_z(z+dz)\\,dA+\\int_{A_t}-\\tau_{yz}\\,dA=0',
              why: 'Questo è l’equilibrio alla traslazione lungo $z$ del pezzetto. Il primo integrale è la forza sulla faccia di sinistra: ha il segno meno perché la normale uscente da quella faccia è $-\\hat e_z$. Il secondo è la forza sulla faccia di destra, con normale $+\\hat e_z$. Il terzo è la forza tangenziale sul rettangolo di taglio, la cui normale uscente punta verso il basso del pezzo, verso $-\\hat e_y$.',
            },
            {
              tex: '\\sigma_z(z)=-\\frac{T_y(L-z)}{J_x}\\,y\\qquad\\Rightarrow\\qquad\\frac{\\partial\\sigma_z}{\\partial z}=\\frac{T_y}{J_x}\\,y',
              why: 'Ora ci serve sapere quanto cambia $\\sigma_z$ tra le due facce. La tensione normale è quella di Navier, $\\sigma_z=\\frac{M_x}{J_x}y$, con il momento che varia lungo l’asse, $M_x(z)=-T_y(L-z)$. Derivando rispetto a $z$, l’unico fattore che dipende da $z$ è $(L-z)$, la cui derivata è $-1$: i due segni meno si compensano.',
              aggiunto: true,
            },
            {
              tex: '\\int_{A_r}\\big[\\sigma_z(z+dz)-\\sigma_z(z)\\big]dA=dz\\int_{A_r}\\frac{\\partial\\sigma_z}{\\partial z}\\,dA=\\int_{A_t}\\tau_{yz}\\,dA',
              why: 'Abbiamo raccolto i due integrali su $A_r$ in uno solo e portato il terzo a destra. Poi, siccome $dz$ è piccolissimo, la differenza $\\sigma_z(z+dz)-\\sigma_z(z)$ è la derivata per $dz$ (sviluppo al primo ordine).',
              aggiunto: true,
            },
            {
              tex: '\\frac{T_y}{J_x}dz\\int_{A_r}y\\,dA=dz\\int_{b_r}\\tau_{zy}\\,dx',
              why: 'A sinistra abbiamo sostituito la derivata appena calcolata, portando fuori dall’integrale le costanti $T_y/J_x$. A destra, il rettangolo di taglio è lungo $b_r$ (in $x$) e largo $dz$ (in $z$), e $\\tau_{zy}$ non dipende da $z$: l’integrale sull’area diventa $dz$ per l’integrale lungo la corda. Abbiamo anche scritto $\\tau_{zy}$ al posto di $\\tau_{yz}$: sono uguali per la reciprocità delle tensioni tangenziali, cioè la simmetria del tensore degli sforzi.',
              ask: { q: 'Che cosa equilibra la differenza tra le risultanti di $\\sigma_z$ sulle due facce del pezzetto?', options: ['La forza tangenziale sul rettangolo di taglio', 'Lo sforzo normale $N$', 'Il momento torcente', 'Niente: le due risultanti sono uguali'], correct: 0, why: 'Il mantello è scarico, quindi l’unica altra forza lungo $z$ è quella tangenziale sul rettangolo di taglio (§5.7.2). Le due risultanti non sono uguali proprio perché il momento varia lungo $z$; $N$ e $M_z$ qui sono nulli.' },
            },
            {
              tex: '\\frac{T_y}{J_x}\\,S_x=b_r\\,\\bar\\tau_{zy},\\qquad S_x:=\\int_{A_r}y\\,dA,\\quad\\bar\\tau_{zy}:=\\frac1{b_r}\\int_{b_r}\\tau_{zy}\\,dx',
              why: 'Abbiamo semplificato $dz$ e dato un nome ai due integrali. Il primo è il **momento statico** $S_x$ dell’area sottesa rispetto all’asse $x$, che è l’asse neutro della flessione associata. Il secondo, diviso per $b_r$, è il **valore medio** $\\bar\\tau_{zy}$ della tangenziale sulla corda: l’equilibrio non ci dà la distribuzione lungo la corda, solo il suo integrale.',
              aggiunto: true,
            },
            { tex: '\\bar\\tau_{zy}', why: 'Per controllo, ecco il valore medio calcolato dal motore sul campione: taglia la sezione alla quota della corda e calcola il momento statico dell’area sottesa.', val: (v) => { const p = rectPoly(v); return J.jourawski(p, v.T, yb(v), (v.B * v.H ** 3) / 12).tau; } },
            {
              tex: '=\\frac{T_y\\,S_x}{J_x\\,b_r}',
              why: 'Basta dividere per $b_r$. Questa è la **formula di Jourawski**. Attenzione ai due momenti: $S_x$ è il momento statico della sola area sottesa, $J_x$ il momento d’inerzia di **tutta** la sezione. Per il rettangolo di base $B$ e altezza $H$, con la corda a quota $\\bar y$, $S_x=\\frac B2\\big(\\frac{H^2}4-\\bar y^2\\big)$, ed è questo che il campione usa.',
              val: (v) => (v.T * (v.B / 2) * (v.H ** 2 / 4 - yb(v) ** 2)) / (((v.B * v.H ** 3) / 12) * v.B),
              eq: 'Teo 5.7.2',
            },
          ],
        },
      },
      {
        id: 'l71-8',
        kind: 'spiega',
        title: 'Che cosa dice la formula, e un controllo sul rettangolo',
        md: `Rileggiamo la formula $\\bar\\tau_{zy}=\\frac{T_yS_x}{J_xb_r}$ a parole: la tensione tangenziale media su una corda è **proporzionale al taglio** e al momento statico dell'area che sta sotto la corda, ed è **inversamente proporzionale** al momento d'inerzia della sezione e alla lunghezza della corda. Una corda stretta concentra la stessa forza su meno materiale, quindi la tensione cresce.

Controlliamola sul rettangolo di base $B$ e altezza $H$ (controllo aggiunto). Con $S_x=\\frac B2\\big(\\frac{H^2}4-\\bar y^2\\big)$, $J_x=\\frac{BH^3}{12}$ e $b_r=B$:
$$\\bar\\tau_{zy}=\\frac{6T_y}{BH^3}\\Big(\\frac{H^2}4-\\bar y^2\\Big).$$
È una **parabola** in $\\bar y$: vale zero ai lembi, $\\bar y=\\pm H/2$, ed è massima sulla corda baricentrica, $\\bar y=0$, dove vale $\\frac32\\frac{T_y}{BH}$, cioè una volta e mezza la tensione media $T_y/A$ (passaggio aggiunto: il valore $\\frac32$ è il controllo classico, non è nella dispensa).

È proprio la parabola che vedi nel diagramma a destra quando la sezione è il rettangolo. La formula servirà a dimensionare le anime delle travi e i loro collegamenti.`,
      },
      {
        id: 'l71-9',
        kind: 'domanda',
        q: { id: 'l71-q3', kind: 'scelta', q: 'Nella formula di Jourawski, di quale area sono calcolati $S_x$ e $J_x$?', options: ['$S_x$ della sola area sottesa dalla corda, $J_x$ di tutta la sezione', 'Entrambi della sola area sottesa', 'Entrambi di tutta la sezione', '$S_x$ di tutta la sezione, $J_x$ dell’area sottesa'], correct: 0, why: '$S_x$ nasce dall’integrale delle $\\sigma_z$ sulla faccia del pezzetto isolato, che è l’area sottesa; $J_x$ viene dalla formula di Navier, che riguarda la flessione di tutta la sezione (Teo 5.7.2). Inoltre $S_x$ di tutta la sezione rispetto a un asse baricentrico è nullo: la formula darebbe sempre zero.' },
      },
      {
        id: 'l71-10',
        kind: 'spiega',
        title: 'Quando la media è affidabile?',
        md: `Abbiamo ricavato un valore **medio** sulla corda. Ci chiediamo ora: quanto è vicino alla tensione vera nei singoli punti della corda?

La risposta della dispensa (§5.7.2, oss. 1) è: la media è rappresentativa solo se $\\tau_{zy}$ **varia poco lungo la corda**, e in particolare se non cambia segno. Una media di valori positivi e negativi può venire piccola anche quando le tensioni vere sono grandi.

In pratica questo succede con le **corde parallele all'asse neutro**, cioè orizzontali nel nostro disegno: lungo di esse la tangenziale ha lo stesso verso, e la media è una buona stima. Con corde inclinate o verticali, invece, la media può essere fuorviante; ci torneremo nella prossima lezione con un esempio preciso. La figura di p. 128 della dispensa riassume la regola con un «OK» sulla corda orizzontale e un «NO» su quella obliqua.`,
      },
      {
        id: 'l71-11',
        kind: 'spiega',
        title: 'Come varia S_x lungo l’altezza',
        md: `La formula ha due ingredienti che cambiano con la quota della corda, $S_x$ e $b_r$. Guardiamo prima il momento statico $S_x$ (§5.7.2, oss. 2).

Per il teorema di Varignon il momento statico di un'area è l'area per la distanza del suo baricentro dall'asse: $S_x=A_r\\,y_{G_r}$, dove $y_{G_r}$ è l'ordinata del baricentro dell'area sottesa. Da qui si leggono i casi estremi:
- se la corda sta sul **lembo inferiore**, l'area sottesa è nulla, quindi $S_x=0$;
- se la corda sta sul **lembo superiore**, l'area sottesa è tutta la sezione, il cui baricentro sta sull'asse $x$: anche ora $S_x=0$;
- in mezzo $S_x$ cresce e poi cala, ed è **massimo sulla corda baricentrica**.

Di conseguenza anche $\\bar\\tau$ **si annulla ai due lembi**. Ma attenzione: lì si annulla anche $b_r$ in certe sezioni (pensa al cerchio), e potremmo avere uno zero diviso zero. La dispensa precisa che $S_x$ va a zero più velocemente di $b_r$, quindi il rapporto va comunque a zero. Infine il **segno** di $\\bar\\tau$ è quello di $T_y$, perché $S_x$, $J_x$ e $b_r$ sono positivi.`,
      },
      {
        id: 'l71-12',
        kind: 'spiega',
        title: 'Dove sta il massimo?',
        md: `Viene spontaneo pensare: $S_x$ è massimo sulla corda baricentrica, quindi lì è massima anche la tensione. Non è sempre vero, perché conta anche il denominatore $b_r$.

Il massimo di $\\bar\\tau_{zy}$ come funzione della quota $y$ si trova annullando la derivata del rapporto $S_x/b_r$ (§5.7.2, oss. 3):
$$\\frac{d\\bar\\tau_{zy}}{dy}=0\\iff S'_xb_r-S_xb'_r=0,$$
dove l'apice indica la derivata rispetto alla quota. Sulla corda baricentrica $S_x$ è massimo, quindi $S'_x=0$ (deduzione: è la condizione di massimo di $S_x$), e la condizione si riduce a $b'_r=0$.

È il contenuto della **Prop 5.7.3**: il massimo di $\\bar\\tau$ sta sulla corda baricentrica **se e solo se** la corda baricentrica è massima, minima o stazionaria, cioè $b'_r(0)=0$. Esempi: il **cerchio** (corda baricentrica massima), la **clessidra** (minima), il **doppio T** (la larghezza dell'anima è costante, quindi stazionaria). Il **triangolo**, invece, ha la larghezza che cambia linearmente: la corda baricentrica non è stazionaria e il massimo sta altrove, va calcolato.`,
      },
      {
        id: 'l71-13',
        kind: 'domanda',
        q: { id: 'l71-q4', kind: 'vf', q: 'In una sezione triangolare soggetta a taglio, il massimo di $\\bar\\tau_{zy}$ è sulla corda baricentrica, perché lì il momento statico $S_x$ è massimo.', answer: false, why: 'Il massimo di $S_x$ non basta: conta il rapporto $S_x/b_r$. Nel triangolo la larghezza $b_r$ varia linearmente con la quota, quindi $b’_r(0)\\ne0$ e per la Prop 5.7.3 il massimo non è sulla baricentrica.' },
      },
      {
        id: 'l71-14',
        kind: 'spiega',
        title: 'Perché servono chiodi e bulloni: lo scorrimento',
        md: `Che significato fisico ha questa tensione tangenziale sulle corde orizzontali? La dispensa (§5.7.2, oss. 4) lo spiega con un'immagine.

Prendi due tavole appoggiate una sull'altra, senza colla, e caricale come una trave. Ognuna si flette per conto suo: le fibre inferiori della tavola di sopra si allungano, quelle superiori della tavola di sotto si accorciano, e le due superfici a contatto **scorrono** l'una sull'altra. È lo stesso che succede con un mazzetto di stuzzicadenti piegato. Se invece le tavole sono incollate, lo scorrimento è impedito: la colla deve trasmettere proprio la tensione tangenziale $\\bar\\tau$ che Jourawski calcola sulla corda di contatto.

Per questo nelle **travi composte** i collegamenti (chiodi, bulloni, saldature) vanno dimensionati con questa tensione. L'esempio raccontato a lezione è una gru a portale con travi bullonate: attorno ai fori la vernice era «mangiata», segno che le parti avevano lavorato scorrendo l'una sull'altra.`,
      },
      {
        id: 'l71-15',
        kind: 'spiega',
        title: 'Disegnare i diagrammi senza fare conti',
        md: `Con quanto sappiamo si possono disegnare i diagrammi di $\\bar\\tau$ lungo l'altezza anche senza calcolarli (§5.7.2, oss. 5).

**Sezione a T.** All'attacco tra ala e anima la corda passa di colpo dalla larghezza dell'ala $B$ a quella dell'anima $b$. Il momento statico $S_x$ non salta, perché l'area sottesa cambia con continuità; salta solo $b_r$. Quindi $\\bar\\tau$ fa un **salto** nel rapporto $B/b$: nell'anima la tensione è $B/b$ volte quella nell'ala. Il massimo sta sulla corda baricentrica, che cade nell'anima dove la larghezza è costante (stazionaria). Per tracciare il diagramma bastano dunque due corde: quella dell'attacco e quella baricentrica.

**Sezione a croce.** Si hanno salti a ogni cambio di larghezza e un massimo relativo in $y=0$.

**Triangolo.** Il massimo non sta sulla corda baricentrica: qui non si può indovinare, va calcolato.`,
      },
      {
        id: 'l71-16',
        kind: 'numeri',
        title: 'Tre sezioni a confronto',
        md: `Mettiamo dei numeri, calcolati dal motore con un taglio $T_y=100$ kN. Nel **rettangolo** 20×40 cm il massimo vale $${(J.shearDiagram('rettangolo', 100, 200).pts.reduce((a, b) => (b.tau > a.tau ? b : a)).tau * 10).toFixed(3).replace('.', ',')}$ MPa: è proprio $\\frac32\\frac TA$, il controllo classico che abbiamo visto prima (non è nella dispensa). Nel **doppio T** l'ala è larga 20 cm e l'anima 1,5 cm, quindi all'attacco ala–anima la tensione salta nel rapporto $20/1{,}5\\approx13{,}3$. Nel **triangolo** il massimo cade a ${Math.round(Math.abs(J.shearDiagram('triangolo', 100, 400).pts.reduce((a, b) => (b.tau > a.tau ? b : a)).y) * 10) / 10} cm dal baricentro, non sulla corda baricentrica, come prevede la Prop 5.7.3.`,
        values: { salto: Math.round((20 / 1.5) * 10) / 10 },
        visual: SVG('jourawski', { section: 'doppioT' }),
      },
      {
        id: 'l71-17',
        kind: 'prova',
        title: 'Muovi la corda',
        md: 'Usa il cursore per spostare la corda dal lembo superiore a quello inferiore. Guarda insieme tre cose: l’area gialla (l’area sottesa), la lunghezza della corda $b_r$ nella tabella e il punto del diagramma di $\\bar\\tau$ a destra.',
        tasks: [
          'Scegli il rettangolo: il diagramma è una parabola, nulla ai lembi e massima sulla corda baricentrica. Controlla nella tabella che il massimo sia 3/2 di T/A.',
          'Scegli la T: attraversa lentamente l’attacco tra ala e anima e guarda il salto del diagramma. Nota che S_x nella tabella non salta: salta solo b_r.',
          'Scegli il triangolo: la tabella dice che il massimo non sta sulla corda baricentrica (Prop 5.7.3). Trova con il cursore la quota del massimo.',
        ],
        visual: SVG('jourawski', { section: 'T' }),
      },
      {
        id: 'l71-18',
        kind: 'domanda',
        q: { id: 'l71-q1', kind: 'scelta', q: 'In una sezione a T, passando dall’ala all’anima, che cosa fa $\\bar\\tau_{zy}$?', options: ['Fa un salto nel rapporto tra le larghezze $B/b$', 'Raggiunge il massimo assoluto', 'Si annulla', 'Cambia segno'], correct: 0, why: 'All’attacco $S_x$ è continuo, perché l’area sottesa cambia con continuità, mentre $b_r$ passa di colpo da $B$ a $b$: la tensione salta nel rapporto $B/b$ (§5.7.2, oss. 5). Il massimo è sulla corda baricentrica, nell’anima; il segno resta quello di $T_y$.' },
      },
      {
        id: 'l71-19',
        kind: 'spiega',
        title: 'Attenzione a…',
        md: `Tre errori ricorrono spesso all'orale su Jourawski.

1. **Usare il $J_x$ della sola area sottesa.** È tentante perché $S_x$ è dell'area sottesa e viene naturale fare lo stesso con $J_x$. Ma $J_x$ arriva dalla formula di Navier, che descrive la flessione di tutta la sezione: è il momento d'inerzia di **tutta** la sezione.
2. **Credere che il massimo stia sempre sulla corda baricentrica.** È vero per rettangolo, cerchio e doppio T, e per questo sembra una regola generale. Ma dipende dalla larghezza: per la Prop 5.7.3 serve che la corda baricentrica sia massima, minima o stazionaria. Il triangolo è il controesempio.
3. **Dimenticare che $\\bar\\tau$ è una media.** L'equilibrio dà solo l'integrale della tangenziale lungo la corda. Su corde dove $\\tau$ cambia segno, come le corde verticali, la media non rappresenta la tensione vera.`,
      },
      {
        id: 'l71-20',
        kind: 'riassunto',
        md: `**Il filo della lezione.** Il taglio non arriva mai da solo: per l'equilibrio è accompagnato da un momento flettente che varia lungo l'asse, $M_x(z)=-T_y(L-z)$. La soluzione esatta dipende troppo dalla forma della sezione, quindi si usa la teoria approssimata di Jourawski, con un asse di simmetria, il taglio retto e passante per il centro di taglio. Isolando il pezzetto di trave sotto una corda, tra $z$ e $z+dz$, le tensioni normali sulle due facce non si bilanciano perché il momento cambia; la differenza la assorbe la forza tangenziale sul rettangolo di taglio, e se ne ricava il valore medio della tangenziale sulla corda. La media è affidabile su corde parallele all'asse neutro; si annulla ai lembi, ed è massima sulla baricentrica solo se questa è massima, minima o stazionaria.

- Taglio e momento: $M_x(z)=-T_y(L-z)$ (Def 5.7.1, Teo 5.2.3).
- Formula di Jourawski: $\\bar\\tau_{zy}=\\frac{T_yS_x}{J_xb_r}$, con $S_x=\\int_{A_r}y\\,dA=A_ry_{G_r}$ (Teo 5.7.2).
- Massimo: $\\frac{d\\bar\\tau_{zy}}{dy}=0\\iff S'_xb_r-S_xb'_r=0$; sulla baricentrica se e solo se $b'_r(0)=0$ (Prop 5.7.3).
- Sezione a T: salto nel rapporto $B/b$ all'attacco ala–anima.`,
        orale: ['Flessione composta: Jourawski (dimostrazione), valore medio, massimo, scorrimento, diagrammi. (dispensa, domanda 10, prima parte)', 'Perché dove c’è taglio c’è momento flettente? (Def 5.7.1)'],
      },
    ],
  },
  // ================================================================== c7.2
  {
    concept: 'c7.2',
    title: 'La componente τ_zx e la regola delle tangenti',
    minutes: 24,
    source: D(5, '5.7.3–5.7.4', undefined, '129–131'),
    visual: SVG('jourawski', { section: 'triangolo', corda: 0.6 }),
    steps: [
      {
        id: 'l72-1',
        kind: 'spiega',
        title: 'Dove siamo e dove andiamo',
        md: `Nella lezione precedente abbiamo ricavato la formula di Jourawski: su una corda orizzontale la tensione tangenziale **verticale** $\\tau_{zy}$ ha valore medio $\\bar\\tau_{zy}=\\frac{T_yS_x}{J_xb_r}$. Ma la tensione tangenziale in un punto della sezione è un vettore nel piano della sezione, con due componenti: oltre a $\\tau_{zy}$, lungo $y$, c'è $\\tau_{zx}$, lungo $x$. Di questa seconda componente non sappiamo ancora niente.

La domanda di questa lezione è quindi: **quanto vale $\\tau_{zx}$, e come si distribuisce lungo una corda?**

Le tappe sono tre. Prima vediamo che la stessa idea di Jourawski funziona con corde di direzione qualsiasi, e perché sulle corde verticali non dà un risultato utile. Poi ricaviamo la **regola delle tangenti**, che dà $\\tau_{zx}$ agli estremi della corda usando la condizione sul bordo. Infine dimostriamo che lungo la corda $\\tau_{zx}$ varia in modo lineare, e guardiamo tre casi: cerchio, rettangolo, sezioni sottili.`,
      },
      {
        id: 'l72-2',
        kind: 'spiega',
        title: 'Jourawski su una corda qualsiasi',
        md: `Nella dimostrazione di Jourawski la corda era orizzontale, ma l'orizzontalità non è mai servita davvero. Se tagliamo il pezzetto di trave con una corda di **direzione qualsiasi** (§5.7.3), il ragionamento si ripete identico.

Introduciamo un riferimento legato alla corda: $r$ lungo la corda, $t$ perpendicolare a essa. Sul rettangolo di taglio ora lavora la componente della tangenziale **perpendicolare alla corda**, $\\tau_{zt}$, e l'equilibrio lungo $z$ ne dà il valore medio con la stessa formula:
$$\\bar\\tau_{zt}=\\frac{T_yS_x}{J_xb_r}.$$
Il momento d'inerzia $J_x$ e il momento statico $S_x$ restano calcolati **rispetto all'asse $x$**: vengono dalla formula di Navier, che non sa nulla della direzione della corda. Cambia solo l'area sottesa, che ora è la parte della sezione tagliata via dalla corda obliqua.

In principio, usando in un punto $P$ due corde diverse, si potrebbero ricostruire entrambe le componenti $\\bar\\tau_{zx}(P)$ e $\\bar\\tau_{zy}(P)$, e quindi la matrice delle tensioni $[\\tens T(P)]$ sulla base di destra.`,
      },
      {
        id: 'l72-3',
        kind: 'spiega',
        title: 'Perché la corda verticale non funziona',
        md: `Proviamo allora a ricavare $\\tau_{zx}$ con una corda **verticale**, cioè parallela a $y$: la componente perpendicolare alla corda è proprio $\\tau_{zx}$. Sembra la via diretta, ma la dispensa avverte che non funziona (§5.7.3), per due ragioni che si combinano.

La prima: il taglio lungo $x$ è nullo, $T_x=\\int_A\\tau_{zx}\\,dA=0$, perché il carico è $T_y$. Quindi sulla sezione la componente $\\tau_{zx}$ deve essere positiva in alcune zone e negativa in altre, per dare risultante zero.

La seconda: sul bordo la tangenziale deve essere tangente al contorno, $\\boldsymbol\\tau_z\\cdot\\hat n=0$ (la condizione del mantello scarico, §5.2.3). Su una corda verticale questo obbliga $\\tau_{zx}$ ad avere versi diversi nella parte alta e nella parte bassa della sezione: **cambia segno** lungo la corda.

E abbiamo visto nella lezione precedente che, quando la tensione cambia segno lungo la corda, il valore medio non è rappresentativo. Serve un'altra strada: la regola delle tangenti.`,
      },
      {
        id: 'l72-4',
        kind: 'domanda',
        q: { id: 'l72-q2', kind: 'scelta', q: 'Perché non si ricava $\\tau_{zx}$ applicando Jourawski su una corda verticale?', options: ['Perché lungo una corda verticale $\\tau_{zx}$ cambia segno e la media non è rappresentativa', 'Perché su una corda verticale $S_x$ è sempre nullo', 'Perché la formula di Jourawski vale solo per $\\tau_{zy}$', 'Perché $J_x$ va sostituito con $J_y$ e non è noto'], correct: 0, why: 'Con $T_x=0$ e la condizione $\\boldsymbol\\tau_z\\cdot\\hat n=0$ sul bordo, $\\tau_{zx}$ cambia segno lungo la corda verticale: una media fra valori di segno opposto non dice nulla sui valori veri (§5.7.3). La formula vale per corde di direzione qualsiasi, sempre con $J_x$ e $S_x$ rispetto a $x$.' },
      },
      {
        id: 'l72-5',
        kind: 'spiega',
        title: 'L’idea della regola delle tangenti',
        md: `La strada buona usa proprio la condizione sul bordo che ha creato il problema. Prendiamo una corda **orizzontale** a quota $\\bar y$, con estremi $A$ e $B$ sul contorno (§5.7.4). Da Jourawski conosciamo già $\\bar\\tau_{zy}(\\bar y)$; supponiamo che in $A$ e in $B$ la componente verticale valga proprio questa media.

Ora usiamo il bordo. Nei punti $A$ e $B$ la tensione tangenziale totale $\\boldsymbol\\tau_z$, che ha componenti $\\tau_{zx}$ e $\\tau_{zy}$, deve essere **diretta lungo la tangente al contorno**. Conosciamo la direzione della tangente (dipende solo dalla geometria) e conosciamo la componente verticale: allora la componente orizzontale è determinata. È come conoscere la pendenza di una retta e il cateto verticale di un triangolo rettangolo: il cateto orizzontale ne segue.

Per la simmetria della sezione rispetto all'asse $y$, le tangenti al contorno in $A$ e in $B$ sono simmetriche e si incontrano in un punto $C$ **sull'asse $y$**. Questo punto dà il nome alla regola. Nel diagramma le frecce rosse agli estremi della corda sono la tangenziale totale: guarda che seguono il contorno.`,
      },
      {
        id: 'l72-6',
        kind: 'derivazione',
        title: 'Regola delle tangenti e andamento lineare di τ_zx',
        md: 'Vogliamo arrivare a due risultati: il valore di $\\tau_{zx}$ agli estremi della corda, e la legge con cui varia lungo la corda. Strategia: per gli estremi usiamo la condizione sul bordo; per l’interno usiamo l’equazione di equilibrio lungo $z$ e mostriamo che la derivata seconda di $\\tau_{zx}$ in $x$ è nulla, cioè che $\\tau_{zx}$ è una retta; infine scegliamo la retta che passa per i due valori agli estremi. È una catena di passaggi logici, senza numeri da verificare.',
        source: D(5, '5.7.4', undefined, '130–131'),
        der: {
          lines: [
            { tex: '\\boldsymbol\\tau_z\\cdot\\hat n=0\\ \\text{in }A\\text{ e }B', why: 'Punto di partenza: il mantello è scarico, quindi in ogni punto del contorno la tangenziale non ha componente lungo la normale $\\hat n$ al bordo. In altre parole è diretta lungo la tangente al contorno.' },
            {
              tex: '\\tau^A_{zx}=-\\bar\\tau_{zy}(\\bar y)\\tan\\alpha\',\\qquad\\tau^B_{zx}=\\bar\\tau_{zy}(\\bar y)\\tan\\alpha\'\\qquad(\\alpha\'\'=-\\alpha\')',
              why: 'Prendiamo la componente verticale agli estremi uguale alla media di Jourawski. Se la tangente al contorno forma con la verticale l’angolo $\\alpha\'$, il rapporto tra componente orizzontale e verticale è $\\tan\\alpha\'$. Per la simmetria della sezione, in $A$ l’angolo è opposto, $\\alpha\'\'=-\\alpha\'$: le due componenti orizzontali sono uguali e opposte.',
            },
            {
              tex: '\\frac{\\partial\\tau_{zx}}{\\partial x}+\\frac{\\partial\\tau_{zy}}{\\partial y}+\\frac{\\partial\\sigma_z}{\\partial z}=0',
              why: 'Passiamo all’interno della corda. Questa è la terza equazione indefinita di equilibrio, quella lungo $z$, scritta con le componenti che il problema di Saint-Venant lascia diverse da zero.',
              aggiunto: true,
            },
            {
              tex: '\\frac{\\partial\\tau_{zy}}{\\partial y}\\ \\text{e}\\ \\frac{\\partial\\sigma_z}{\\partial z}=\\frac{T_y}{J_x}y\\ \\text{non dipendono da }x',
              why: 'Il secondo e il terzo termine non dipendono da $x$: nella teoria di Jourawski si prende $\\tau_{zy}$ uguale alla sua media $\\bar\\tau_{zy}$, che è funzione della sola $y$; e la derivata di $\\sigma_z$ rispetto a $z$, calcolata nella lezione precedente, dipende solo da $y$.',
              aggiunto: true,
            },
            {
              tex: '\\frac{\\partial^2\\tau_{zx}}{\\partial x^2}=0',
              why: 'Deriviamo l’equazione di equilibrio rispetto a $x$: i due termini che non dipendono da $x$ spariscono, e resta solo la derivata seconda di $\\tau_{zx}$, che quindi è nulla.',
              ask: { q: 'Se la derivata seconda di $\\tau_{zx}$ rispetto a $x$ è nulla, che cosa ne segue per $\\tau_{zx}$ lungo la corda?', options: ['È lineare in $x$', 'È costante', 'È parabolica', 'È nulla'], correct: 0, why: 'Una funzione con derivata seconda nulla è una retta, $\\tau_{zx}=a+bx$ (§5.7.4). Costante o nulla sarebbe solo un caso particolare: i valori agli estremi, opposti, lo escludono in generale. Parabolica è la $\\bar\\tau_{zy}$ del rettangolo lungo l’altezza, non la $\\tau_{zx}$ lungo la corda.' },
            },
            {
              tex: '\\tau_{zx}(x,\\bar y,z)=-2\\frac{\\bar\\tau_{zy}(\\bar y)\\tan\\alpha(\\bar y)}{b_r(\\bar y)}\\,x',
              why: 'La retta deve assumere valori opposti nei due estremi, che stanno in $x=\\pm b_r/2$: passa quindi per lo zero in $x=0$ e ha pendenza pari alla differenza dei valori estremi divisa per la lunghezza $b_r$ della corda. Il segno davanti dipende da come la dispensa misura l’angolo $\\alpha(\\bar y)$ nella figura di p. 130; ciò che conta è che la retta valga zero al centro e valori opposti agli estremi.',
              eq: '§5.7.4',
            },
          ],
        },
      },
      {
        id: 'l72-7',
        kind: 'spiega',
        title: 'Che cosa dice il risultato',
        md: `Leggiamo la formula appena ottenuta. Lungo una corda orizzontale la componente $\\tau_{zx}$ è:
- **lineare** in $x$, cioè il suo diagramma lungo la corda è una retta;
- **antisimmetrica**: in due punti simmetrici rispetto all'asse $y$ ha valori opposti;
- **nulla sull'asse $y$**, al centro della corda.

La pendenza della retta è fissata dalla tangenziale verticale media $\\bar\\tau_{zy}$ e dall'inclinazione del contorno agli estremi, $\\tan\\alpha$: più il contorno è inclinato, più è grande $\\tau_{zx}$.

Un controllo (deduzione): la $\\tau_{zx}$ antisimmetrica ha integrale nullo lungo ogni corda orizzontale, quindi anche su tutta la sezione. È coerente con $T_x=\\int\\tau_{zx}\\,dA=0$, la condizione che ci aveva bloccato con la corda verticale.

Nel diagramma, scegli il triangolo e muovi la corda: le frecce agli estremi restano lungo i lati obliqui, e la loro parte orizzontale cresce con la tensione verticale.`,
      },
      {
        id: 'l72-8',
        kind: 'spiega',
        title: 'Tre casi: cerchio, rettangolo, sezioni sottili',
        md: `Applichiamo la regola a tre sezioni (§5.7.4).

**Cerchio.** Sulla corda baricentrica gli estremi stanno sul diametro orizzontale, dove la tangente al contorno è **verticale**: $\\tan\\alpha=0$, quindi $\\tau_{zx}=0$ su tutta quella corda. Sulle altre corde le tangenti sono inclinate e si incontrano su un punto dell'asse $y$, e $\\tau_{zx}$ c'è.

**Rettangolo.** I lati sono verticali a ogni quota: $\\tan\\alpha=0$ su ogni corda, quindi $\\tau_{zx}\\equiv0$ in tutta la sezione. Nel rettangolo la tangenziale è tutta verticale.

**T sottile.** Nell'ala, lunga e sottile, le tensioni sono orizzontali; nell'anima sono verticali. La dispensa nota che si comportano **come un fluido** che scorre lungo le pareti: un'immagine che ritroveremo, in forma precisa, nella torsione.`,
      },
      {
        id: 'l72-9',
        kind: 'prova',
        title: 'Le frecce agli estremi della corda',
        md: 'Nel diagramma le frecce rosse agli estremi della corda rappresentano la tangenziale totale $\\boldsymbol\\tau_z$, e nella tabella leggi il valore di $\\tau_{zx}$ agli estremi dato dalla regola delle tangenti. Parti dal cerchio.',
        tasks: [
          'Cerchio: porta la corda sulla baricentrica e controlla che le frecce siano verticali e che τ_zx agli estremi valga zero.',
          'Cerchio: sposta la corda verso un lembo. Le frecce si inclinano seguendo il contorno e τ_zx cresce.',
          'Rettangolo: muovi la corda a qualsiasi quota. Le frecce restano verticali: τ_zx è nulla ovunque.',
          'Triangolo: muovi la corda e verifica che le frecce restino sempre lungo i lati obliqui.',
        ],
        visual: SVG('jourawski', { section: 'cerchio', corda: 0.3 }),
      },
      {
        id: 'l72-10',
        kind: 'domanda',
        q: { id: 'l72-q1', kind: 'vf', q: 'Sulla corda baricentrica di un cerchio, con taglio verticale, la componente $\\tau_{zx}$ è nulla.', answer: true, why: 'Gli estremi della corda baricentrica stanno sul diametro orizzontale, dove la tangente al contorno è verticale: la regola delle tangenti dà $\\tau_{zx}=0$ agli estremi e, essendo lineare, $\\tau_{zx}=0$ su tutta la corda (§5.7.4).' },
      },
      {
        id: 'l72-11',
        kind: 'domanda',
        q: { id: 'l72-q3', kind: 'scelta', q: 'Come varia $\\tau_{zx}$ lungo una corda orizzontale?', options: ['Linearmente, in modo antisimmetrico, nulla sull’asse $y$', 'È costante e uguale al valore agli estremi', 'Parabolica, massima al centro', 'È sempre nulla'], correct: 0, why: 'Dall’equilibrio lungo $z$ segue $\\partial^2\\tau_{zx}/\\partial x^2=0$: è una retta; ai due estremi i valori sono opposti, quindi passa per zero sull’asse di simmetria (§5.7.4). È nulla ovunque solo in casi particolari, come il rettangolo.' },
      },
      {
        id: 'l72-12',
        kind: 'spiega',
        title: 'Attenzione a…',
        md: `Tre errori tipici su questo argomento.

1. **Dimenticare la condizione sul bordo.** Sul contorno la tangenziale deve essere tangente al bordo, $\\boldsymbol\\tau_z\\cdot\\hat n=0$, perché il mantello è scarico. È facile scordarla perché la formula di Jourawski non la usa; ma è proprio da qui che nasce $\\tau_{zx}$, ed è l'unica informazione che la regola delle tangenti sfrutta.
2. **Pensare che $\\tau_{zx}$ sia costante sulla corda.** Viene spontaneo per analogia con $\\bar\\tau_{zy}$, che usiamo come costante sulla corda. Invece $\\tau_{zx}$ è lineare e antisimmetrica: ha valori opposti agli estremi e zero al centro.
3. **Applicare la media di Jourawski a una corda verticale.** La formula vale per corde di qualsiasi direzione, ma su una corda verticale $\\tau_{zx}$ cambia segno e la media non rappresenta i valori veri.`,
      },
      {
        id: 'l72-13',
        kind: 'riassunto',
        md: `**Il filo della lezione.** La tensione tangenziale ha anche una componente orizzontale $\\tau_{zx}$, che Jourawski da solo non dà: la formula vale per corde di qualsiasi direzione, ma sulle corde verticali $\\tau_{zx}$ cambia segno e la media non serve. Si usa allora la condizione sul mantello scarico: agli estremi di una corda orizzontale la tangenziale deve seguire il contorno, e conoscendo la componente verticale media e l'inclinazione della tangente si ottiene quella orizzontale. All'interno, l'equilibrio lungo $z$ dice che $\\tau_{zx}$ è lineare in $x$; con i valori opposti agli estremi risulta antisimmetrica e nulla sull'asse di simmetria. Nel rettangolo è nulla ovunque, nel cerchio sulla corda baricentrica.

- Corda qualsiasi: $\\bar\\tau_{zt}=\\frac{T_yS_x}{J_xb_r}$, con $J_x$ e $S_x$ rispetto a $x$ (§5.7.3).
- Regola delle tangenti: $\\tau^B_{zx}=\\bar\\tau_{zy}(\\bar y)\\tan\\alpha'$, $\\tau^A_{zx}=-\\bar\\tau_{zy}(\\bar y)\\tan\\alpha'$ (§5.7.4).
- Andamento sulla corda: $\\tau_{zx}(x,\\bar y)=-2\\frac{\\bar\\tau_{zy}(\\bar y)\\tan\\alpha(\\bar y)}{b_r(\\bar y)}\\,x$ (§5.7.4).`,
        orale: ['Flessione composta: … diagrammi, regola delle tangenti. (dispensa, domanda 10, seconda parte)', 'Da dove viene la regola delle tangenti? Come varia τ_zx sulla corda?'],
      },
    ],
  },
  // ================================================================== c7.3
  {
    concept: 'c7.3',
    title: 'La torsione secondo Clebsch: rotazione e ingobbamento',
    minutes: 32,
    source: D(5, '5.8.1–5.8.2', 'Def 5.8.1–5.8.2, Teo 5.8.3', '131–133'),
    visual: TOR('clebsch', { section: 'rettangolo', controls: ['section', 'twist', 'warp'] }),
    steps: [
      {
        id: 'l73-1',
        kind: 'spiega',
        title: 'Dove siamo e dove andiamo',
        md: `Con le due lezioni sul taglio abbiamo visto la prima sollecitazione che produce tensioni tangenziali. Resta la seconda, la **torsione**, ed è il contributo più originale di Saint-Venant: la dispensa ricorda che lo sforzo normale era noto da Galileo e la flessione da Navier, mentre la torsione è il caso nuovo.

La domanda di questa lezione è: **come si deforma un solido torto, e quali equazioni risolvono il problema?**

Le tappe sono quattro. Prima diciamo che cosa si intende per torsione e perché qui la congettura riguarda gli spostamenti invece delle tensioni. Poi scriviamo la congettura di Clebsch: le sezioni ruotano e si **ingobbano**, cioè escono dal loro piano. Quindi ne ricaviamo deformazioni e tensioni. Infine vediamo quali condizioni deve soddisfare la funzione d'ingobbamento: è il **problema di Neumann** del Teo 5.8.3. Nel modello a destra vedi il solido torto: tienilo sott'occhio.`,
      },
      {
        id: 'l73-2',
        kind: 'spiega',
        title: 'Che cos’è la torsione, e perché si congetturano gli spostamenti',
        md: `Per la Def 5.8.1 si ha **torsione** quando le forze sulle due basi sono equivalenti a **due coppie uguali e opposte**, con momento diretto lungo l'asse del solido. Il momento torcente si indica con $M_z$.

Nei casi del Modulo 6 il metodo semi-inverso partiva sempre da una congettura sulle **tensioni** (per esempio $\\sigma_z=Dy$ nella flessione) e da lì ricavava il resto. Nella torsione la dispensa segnala un'**eccezione**: si segue l'approccio di **Clebsch**, che congettura il campo di **spostamento**. Il motivo è che qui è più facile immaginare come si muove il solido che come si distribuiscono le tensioni: torcendo una gomma tra le dita vedi subito che le sezioni ruotano l'una rispetto all'altra.

Lo schema resta quello del metodo semi-inverso: si congettura una parte della soluzione, si ricava il resto, e se tutte le equazioni tornano il teorema di Kirchhoff garantisce che la soluzione trovata è l'unica.`,
      },
      {
        id: 'l73-3',
        kind: 'spiega',
        title: 'La congettura: le sezioni ruotano e si ingobbano',
        md: `Che cosa immagina Clebsch (§5.8.1)? Due cose insieme.

La prima: ogni sezione **ruota** nel suo piano attorno all'asse, di un angolo $\\theta(z)$ che cambia da sezione a sezione. Di conseguenza le fibre longitudinali, che prima erano rette parallele all'asse, diventano **eliche**. Nel modello lo vedi sulle linee blu del mantello.

La seconda: le sezioni non restano piane, ma si **ingobbano**, cioè i loro punti si spostano anche lungo l'asse $z$, uscendo dal piano della sezione. E si ingobbano **tutte allo stesso modo**: la forma dell'ingobbamento è descritta da una funzione $\\varphi(x,y)$, la **funzione d'ingobbamento**, che dipende dalla posizione nella sezione ma **non** da $z$. L'immagine della dispensa è una clip a C: torcendola, le sue estremità escono dal piano.

Nel modello guarda la base di destra: con il rettangolo la griglia disegnata sulla base si piega fuori dal piano. Il cursore dell'ingobbamento lo amplifica per renderlo visibile.`,
      },
      {
        id: 'l73-4',
        kind: 'spiega',
        title: 'L’angolo unitario di torsione',
        md: `Come varia la rotazione $\\theta(z)$ lungo l'asse? La congettura la prende **lineare** (§5.8.1):
$$\\theta(z)=\\theta(0)+\\gamma z,\\qquad\\gamma:=\\theta'(0).$$
La costante $\\gamma$ è l'**angolo unitario di torsione**: è la rotazione relativa tra due sezioni che distano una unità di lunghezza (§5.8.4 lo dice come $\\gamma=\\theta(z+1)-\\theta(z)$). Il termine $\\theta(0)$ è una rotazione uguale per tutte le sezioni, cioè un moto rigido, che non produce deformazione; la parte che deforma è $\\theta^{dp}=\\gamma z$.

Ora traduciamo la rotazione in spostamenti. Un punto $P$ a distanza $r$ dall'asse, ruotando di $\\gamma z$, percorre un arco di lunghezza $r\\gamma z$. Siccome la rotazione è piccola, l'arco si confonde con la sua tangente: il punto si sposta di $PP'=r\\gamma z$ in direzione perpendicolare al raggio. Scomponendo questo spostamento lungo $x$ e $y$ si ottiene la **Def 5.8.2**:
$$u=-\\gamma yz,\\qquad v=\\gamma xz,\\qquad w=\\gamma\\varphi(x,y).$$
Le prime due sono la rotazione, la terza è l'ingobbamento, scritto con un fattore $\\gamma$ davanti per comodità.`,
      },
      {
        id: 'l73-5',
        kind: 'domanda',
        q: { id: 'l73-q2', kind: 'scelta', q: 'Che cosa congettura Clebsch per la torsione?', options: ['Il campo di spostamento: le sezioni ruotano di $\\theta(z)=\\gamma z$ e si ingobbano tutte allo stesso modo, $w=\\gamma\\varphi(x,y)$', 'Il campo di tensione: solo $T_{zz}$ diversa da zero', 'Che le sezioni ruotino restando piane', 'Che l’angolo unitario $\\gamma$ vari lungo l’asse'], correct: 0, why: 'È la Def 5.8.2: la congettura riguarda gli spostamenti, non le tensioni (eccezione rispetto ai casi del Modulo 6). Le sezioni non restano piane in generale: si ingobbano. $\\gamma$ è costante, perché $\\theta$ è lineare in $z$.' },
      },
      {
        id: 'l73-6',
        kind: 'derivazione',
        title: 'Dalla congettura alle deformazioni e alle tensioni',
        md: 'Vogliamo arrivare alle due tensioni tangenziali $T_{zx}$ e $T_{zy}$ in funzione di $\\gamma$ e di $\\varphi$. Strategia: dagli spostamenti ricaviamo le deformazioni con la congruenza (le derivate degli spostamenti), poi dalle deformazioni le tensioni con il legame elastico. Il campione numerico usa un ingobbamento di prova $\\varphi=c\\,xy$ e deriva numericamente il campo di Clebsch in un punto.',
        source: D(5, '5.8.2', undefined, 132),
        der: {
          sample,
          lines: [
            { tex: 'E_{zx}=\\tfrac12\\Big(\\frac{\\partial u}{\\partial z}+\\frac{\\partial w}{\\partial x}\\Big)', why: 'Partiamo dalla congruenza: la componente $E_{zx}$ del tensore di deformazione è la semisomma delle due derivate «incrociate» degli spostamenti. Il motore la calcola con derivate numeriche nel punto del campione.', val: (v) => { const p: [number, number, number] = [v.x, v.y, v.z]; return 0.5 * (dfd((q) => clebsch(v, q), p, 2, 0) + dfd((q) => clebsch(v, q), p, 0, 2)); } },
            {
              tex: '=\\tfrac12\\gamma\\Big(-y+\\frac{\\partial\\varphi}{\\partial x}\\Big)',
              why: 'Sostituiamo la congettura: da $u=-\\gamma yz$ viene $\\partial u/\\partial z=-\\gamma y$; da $w=\\gamma\\varphi(x,y)$ viene $\\partial w/\\partial x=\\gamma\\,\\partial\\varphi/\\partial x$. Raccogliendo $\\gamma$ si ottiene la riga.',
              val: (v) => 0.5 * v.g * (-v.y + v.c * v.y),
            },
            {
              tex: 'E_{yz}=\\tfrac12\\gamma\\Big(x+\\frac{\\partial\\varphi}{\\partial y}\\Big)',
              why: 'Allo stesso modo, $\\partial v/\\partial z=\\gamma x$ e $\\partial w/\\partial y=\\gamma\\,\\partial\\varphi/\\partial y$. È l’altro scorrimento diverso da zero.',
              aggiunto: true,
            },
            {
              tex: 'E_{xx}=E_{yy}=E_{zz}=E_{xy}=0\\qquad\\Rightarrow\\qquad\\Theta=\\operatorname{tr}\\tens E=0',
              why: 'Tutte le altre componenti sono nulle: $u$ non dipende da $x$, $v$ non dipende da $y$, $w$ non dipende da $z$, e in $E_{xy}$ i contributi $-\\gamma z$ e $+\\gamma z$ si elidono. In particolare la traccia di $\\tens E$, cioè la somma delle componenti sulla diagonale, che misura la variazione di volume, è nulla: la deformazione è **isocora** (§5.8.2).',
              aggiunto: true,
            },
            {
              tex: 'T_{zx}=G\\gamma\\Big(-y+\\frac{\\partial\\varphi}{\\partial x}\\Big),\\qquad T_{zy}=G\\gamma\\Big(x+\\frac{\\partial\\varphi}{\\partial y}\\Big)',
              why: 'Ora il legame. Per un materiale isotropo vale la legge di Lamé, $\\tens T=2G\\tens E+\\lambda(\\operatorname{tr}\\tens E)\\tens I$; siccome la traccia è nulla resta $\\tens T=2G\\tens E$. Moltiplicando per $2G$ i due scorrimenti si ottengono le due tensioni tangenziali.',
              ask: { q: 'Perché qui il legame elastico si riduce a $\\tens T=2G\\tens E$?', options: ['Perché la deformazione è isocora: $\\operatorname{tr}\\tens E=0$', 'Perché in torsione si prende $\\nu=0$', 'Perché $\\tens E$ è diagonale', 'Perché la sezione è circolare'], correct: 0, why: 'Nella legge di Lamé il termine $\\lambda(\\operatorname{tr}\\tens E)\\tens I$ sparisce se la traccia è nulla, ed è il caso della torsione. $\\nu$ non viene annullato; $\\tens E$ non è diagonale, anzi ha solo componenti fuori diagonale; e il ragionamento vale per ogni sezione.' },
              eq: '§5.8.2',
            },
          ],
          checks: [{ what: '$E_{zz}=\\partial w/\\partial z=0$', f: (v) => [dfd((q) => clebsch(v, q), [v.x, v.y, v.z], 2, 2), 0] }],
        },
      },
      {
        id: 'l73-7',
        kind: 'spiega',
        title: 'Che cosa abbiamo ottenuto',
        md: `Fermiamoci a leggere il risultato. In torsione l'unico stato di tensione è fatto di **tensioni tangenziali** nel piano della sezione, $T_{zx}$ e $T_{zy}$; tutte le tensioni normali sono nulle. E la deformazione **non cambia il volume**.

Ogni tensione ha due pezzi. Il primo, $-y$ in $T_{zx}$ e $x$ in $T_{zy}$, viene dalla sola rotazione delle sezioni. Il secondo, con le derivate di $\\varphi$, viene dall'ingobbamento.

Un caso particolare aiuta (deduzione: il caso del cerchio lo ritroveremo nella lezione sulle sezioni esatte, §5.8.5): se la sezione **non** si ingobba, $\\varphi=0$, e restano $T_{zx}=-G\\gamma y$, $T_{zy}=G\\gamma x$. È un vettore perpendicolare al raggio $(x,y)$ e di modulo $G\\gamma r$: la tensione gira attorno all'asse e cresce con la distanza dall'asse. Vedremo che è esattamente il caso del cerchio.

Per tutte le altre sezioni, invece, serve conoscere $\\varphi$. Le prossime domande sono: quali equazioni deve soddisfare, e come si trova $\\gamma$?`,
      },
      {
        id: 'l73-8',
        kind: 'domanda',
        q: { id: 'l73-q3', kind: 'vf', q: 'Nella torsione secondo Clebsch la deformazione è isocora.', answer: true, why: 'Le componenti sulla diagonale di $\\tens E$ sono tutte nulle ($E_{xx}=E_{yy}=E_{zz}=0$), quindi la traccia $\\Theta$, che misura la variazione di volume, è zero (§5.8.2). Proprio per questo il legame si riduce a $\\tens T=2G\\tens E$.' },
      },
      {
        id: 'l73-9',
        kind: 'derivazione',
        title: 'Le condizioni che deve soddisfare φ',
        md: 'Abbiamo le tensioni, ma la congettura funziona solo se queste tensioni rispettano anche l’equilibrio e le condizioni al contorno. Vogliamo vedere che cosa ne segue per la funzione d’ingobbamento $\\varphi$. Strategia: imponiamo nell’ordine l’equilibrio nell’interno, il mantello scarico e le condizioni sulle basi. È una catena di passaggi logici.',
        source: D(5, '5.8.2', 'Teo 5.8.3', '132–133'),
        der: {
          lines: [
            { tex: '\\frac{\\partial T_{zx}}{\\partial x}+\\frac{\\partial T_{zy}}{\\partial y}=G\\gamma\\,\\nabla^2\\varphi=0\\ \\text{in }\\mathring A', why: 'L’equilibrio nell’interno della sezione $\\mathring A$. Le prime due equazioni indefinite sono soddisfatte da sole, perché le tensioni non dipendono da $z$. Resta la terza: sostituendo le tensioni, i termini $-y$ e $x$ hanno derivata nulla e restano le derivate seconde di $\\varphi$, cioè il suo laplaciano $\\nabla^2\\varphi=\\varphi_{,xx}+\\varphi_{,yy}$. Deve essere zero: è l’**equazione di Laplace**.' },
            { tex: 'T_{zx}n_x+T_{zy}n_y=0\\ \\Rightarrow\\ \\frac{d\\varphi}{dn}=\\nabla\\varphi\\cdot\\hat n=yn_x-xn_y\\ \\text{su }\\partial A', why: 'Il mantello è scarico: sul contorno $\\partial A$ della sezione la tangenziale non ha componente lungo la normale $\\hat n=(n_x,n_y)$. Sostituendo le tensioni e portando a destra i termini senza $\\varphi$, si ottiene una condizione sulla **derivata normale** di $\\varphi$, cioè sulla sua derivata nella direzione perpendicolare al bordo.' },
            { tex: 'N=M_x=M_y=0,\\quad T_x=T_y=0,\\quad M_z=\\int_A(T_{zy}x-T_{zx}y)\\,dA', why: 'Restano le basi. Sforzo normale e momenti flettenti sono nulli perché $T_{zz}=0$. Che anche i due tagli siano nulli la dispensa lo afferma senza svolgerlo («si dimostra»). L’unica condizione che lavora è l’ultima: il momento torcente delle tensioni deve uguagliare quello applicato, e questo determina $\\gamma$.', eq: 'Teo 5.8.3' },
          ],
        },
      },
      {
        id: 'l73-10',
        kind: 'spiega',
        title: 'Il teorema di Clebsch e il problema di Neumann',
        md: `Mettiamo insieme le tre condizioni: è il **Teo 5.8.3 (Clebsch)**. La funzione d'ingobbamento $\\varphi$ risolve il problema
$$\\nabla^2\\varphi=0\\ \\text{in }\\mathring A,\\qquad\\frac{d\\varphi}{dn}=yn_x-xn_y\\ \\text{su }\\partial A,$$
e l'angolo unitario $\\gamma$ si ricava dal momento torcente $M_z$.

Questo tipo di problema ha un nome. L'equazione di Laplace è un'equazione alle derivate del **secondo ordine**, e per individuare la soluzione basta assegnare sul contorno **o** la funzione **o** la sua derivata normale. Quando si assegna la funzione si parla di **problema di Dirichlet**; quando si assegna la derivata normale, di **problema di Neumann** (§5.8.2). Qui il dato è sulla derivata, quindi è un problema di **Neumann per l'equazione di Laplace**.

Nota che il problema dipende solo dalla **forma della sezione**: il contorno e la sua normale. Il carico entra solo attraverso $\\gamma$. Nella prossima lezione trasformeremo questo problema in un altro, più comodo, con la funzione di Prandtl.`,
      },
      {
        id: 'l73-11',
        kind: 'domanda',
        q: { id: 'l73-q1', kind: 'scelta', q: 'Quale problema al contorno risolve la funzione d’ingobbamento $\\varphi$?', options: ['Neumann per Laplace', 'Dirichlet per Poisson', 'Dirichlet per Laplace', 'Neumann per Poisson'], correct: 0, why: 'L’equazione è $\\nabla^2\\varphi=0$, cioè Laplace (Poisson avrebbe un termine noto diverso da zero); sul contorno è assegnata la derivata normale, quindi Neumann (Teo 5.8.3). «Dirichlet per Poisson» è il problema della funzione di Prandtl, che vedremo nella prossima lezione.' },
      },
      {
        id: 'l73-12',
        kind: 'prova',
        title: 'Rotazione e ingobbamento nel modello',
        md: 'Nel modello il solido ruota e si ingobba con la funzione $\\varphi$ calcolata dal motore. Il colore del mantello indica l’intensità della tangenziale sul contorno (rosso = massima). La rotazione disegnata è finita e amplificata; la dispensa la linearizza.',
        tasks: [
          'Guarda il mantello: le fibre blu, rette prima della torsione, diventano eliche. Aumenta la rotazione e osserva che si avvolgono di più.',
          'Con il rettangolo, scegli la vista «dalla base di destra»: la griglia esce dal piano, alternando zone che avanzano e zone che arretrano. È l’ingobbamento.',
          'Porta a zero l’amplificazione dell’ingobbamento e poi rialzala, per distinguere la rotazione dall’ingobbamento.',
          'Passa al cerchio: la base resta piana anche con l’ingobbamento amplificato. Il cerchio non si ingobba.',
        ],
        visual: TOR('clebsch', { section: 'rettangolo', controls: ['section', 'twist', 'warp'], view: 'prospettiva' }),
      },
      {
        id: 'l73-13',
        kind: 'spiega',
        title: 'Attenzione a…',
        md: `Tre errori tipici sulla torsione di Clebsch.

1. **Pensare che in torsione le sezioni restino piane.** È tentante perché nella flessione valeva l'ipotesi di Bernoulli–Navier delle sezioni piane. In torsione, invece, le sezioni si ingobbano; l'unica eccezione è il cerchio (e, lo vedremo, il cerchio cavo).
2. **Confondere Neumann e Dirichlet.** Il criterio è che cosa si assegna sul contorno: la derivata normale nel problema di Neumann, la funzione stessa nel problema di Dirichlet. Per $\\varphi$ si assegna la derivata, quindi è Neumann.
3. **Dimenticare che qui la congettura è sugli spostamenti.** Nei casi del Modulo 6 si congetturavano le tensioni; in torsione, con Clebsch, si congetturano gli spostamenti, e tensioni e deformazioni se ne ricavano.`,
      },
      {
        id: 'l73-14',
        kind: 'riassunto',
        md: `**Il filo della lezione.** La torsione nasce da due coppie opposte con momento lungo l'asse. Seguendo Clebsch si congettura il campo di spostamento: le sezioni ruotano di un angolo lineare in $z$, con angolo unitario $\\gamma$, e si ingobbano tutte allo stesso modo secondo una funzione $\\varphi(x,y)$. Dalla congruenza risultano solo due scorrimenti e una deformazione isocora; il legame si riduce allora a $\\tens T=2G\\tens E$ e dà le due tensioni tangenziali. Imponendo l'equilibrio interno e il mantello scarico si trova che $\\varphi$ risolve un problema di Neumann per l'equazione di Laplace, che dipende solo dalla forma della sezione; il momento torcente fissa $\\gamma$.

- Congettura di Clebsch: $u=-\\gamma yz$, $v=\\gamma xz$, $w=\\gamma\\varphi(x,y)$ (Def 5.8.2).
- Tensioni: $T_{zx}=G\\gamma(-y+\\varphi_{,x})$, $T_{zy}=G\\gamma(x+\\varphi_{,y})$ (§5.8.2).
- Problema di Neumann: $\\nabla^2\\varphi=0$ in $\\mathring A$, $\\frac{d\\varphi}{dn}=yn_x-xn_y$ su $\\partial A$ (Teo 5.8.3).
- Momento torcente: $M_z=\\int_A(T_{zy}x-T_{zx}y)\\,dA$ determina $\\gamma$.`,
        orale: ['Torsione: Clebsch, Neumann, Prandtl e Dirichlet, fattore di torsione. (dispensa, domanda 11, prima parte)', 'Ricava le tensioni dalla congettura di Clebsch.'],
      },
    ],
  },
  // ================================================================== c7.4
  {
    concept: 'c7.4',
    title: 'La funzione di Prandtl e il fattore di torsione',
    minutes: 32,
    source: D(5, '5.8.3–5.8.4', 'Def 5.8.4, Teo 5.8.5, Def 5.8.6', '133–135'),
    visual: TOR('prandtl', { section: 'quadrato', controls: ['section'] }),
    steps: [
      {
        id: 'l74-1',
        kind: 'spiega',
        title: 'Dove siamo e dove andiamo',
        md: `Nella lezione precedente, con la congettura di Clebsch, abbiamo ridotto la torsione a un problema sulla funzione d'ingobbamento $\\varphi$: un **problema di Neumann** per l'equazione di Laplace, con la derivata normale di $\\varphi$ assegnata sul contorno (Teo 5.8.3). Resta però scomodo: il dato sul contorno dipende dalla normale punto per punto, e le tensioni si ottengono solo dopo aver derivato $\\varphi$.

Prandtl propone un cambio di funzione incognita. La domanda della lezione è: **quale funzione rende il problema più semplice, e come si ricava da essa il legame tra momento torcente e angolo di torsione?**

Le tappe sono tre. Definiamo la **funzione di Prandtl** $F$ e vediamo che con essa l'equilibrio è soddisfatto da solo. Poi ricaviamo le equazioni per $F$: diventano un **problema di Dirichlet** per l'equazione di Poisson, con $F=0$ sul contorno. Infine calcoliamo il momento torcente e introduciamo il **fattore di torsione** $q$, che misura quanto una sezione è meno efficiente del cerchio.`,
      },
      {
        id: 'l74-2',
        kind: 'spiega',
        title: 'L’idea: una funzione che soddisfa l’equilibrio per costruzione',
        md: `Ricordiamo l'equazione di equilibrio nell'interno della sezione: $\\frac{\\partial T_{zx}}{\\partial x}+\\frac{\\partial T_{zy}}{\\partial y}=0$. L'idea è scegliere le tensioni in modo che questa equazione sia vera **qualunque** sia la funzione da cui le ricaviamo.

Il trucco è questo (spiegazione aggiunta). Se scriviamo $T_{zx}$ come derivata rispetto a $y$ di una funzione $F$, con il segno meno, e $T_{zy}$ come derivata rispetto a $x$ della stessa $F$, nella somma compaiono le due derivate seconde miste $F_{,yx}$ e $F_{,xy}$ con segni opposti. Per il **teorema di Schwarz** le derivate miste non dipendono dall'ordine di derivazione, quindi si cancellano.

Una funzione così si chiama **funzione delle tensioni**: invece di cercare due tensioni legate da un'equazione, cerchiamo una sola funzione, e l'equazione di equilibrio sparisce dal problema. Il prezzo da pagare è capire quali condizioni deve soddisfare $F$ perché le tensioni vengano davvero da un campo di spostamento di Clebsch.`,
      },
      {
        id: 'l74-3',
        kind: 'derivazione',
        title: 'Da Neumann a Dirichlet: le equazioni per F',
        md: 'Vogliamo arrivare al Teo 5.8.5: $\\nabla^2F=2$ nella sezione e $F=0$ sul contorno. Strategia: definiamo $F$ attraverso le sue derivate, confrontandole con le tensioni di Clebsch; poi traduciamo nell’ordine l’equilibrio, la condizione che $\\varphi$ esista e il mantello scarico. È una catena di passaggi logici.',
        source: D(5, '5.8.3', 'Def 5.8.4, Teo 5.8.5', '133–134'),
        der: {
          lines: [
            { tex: '\\frac{\\partial F}{\\partial x}=x+\\frac{\\partial\\varphi}{\\partial y},\\qquad\\frac{\\partial F}{\\partial y}=-\\Big(-y+\\frac{\\partial\\varphi}{\\partial x}\\Big)', why: 'È la definizione della funzione di Prandtl (Def 5.8.4): le sue derivate sono, a meno del fattore $G\\gamma$ e di un segno, le parentesi che compaiono nelle tensioni di Clebsch.' },
            { tex: 'T_{zx}=-G\\gamma\\frac{\\partial F}{\\partial y},\\qquad T_{zy}=G\\gamma\\frac{\\partial F}{\\partial x}', why: 'Confrontiamo con le tensioni della lezione precedente, $T_{zx}=G\\gamma(-y+\\varphi_{,x})$ e $T_{zy}=G\\gamma(x+\\varphi_{,y})$: basta sostituire le parentesi con le derivate di $F$.', aggiunto: true },
            { tex: '\\frac{\\partial T_{zx}}{\\partial x}+\\frac{\\partial T_{zy}}{\\partial y}=G\\gamma\\Big(-F_{,yx}+F_{,xy}\\Big)=0', why: 'L’equilibrio di campo: derivando le tensioni compaiono le due derivate miste di $F$ con segno opposto, che per il teorema di Schwarz sono uguali. L’equazione è soddisfatta **identicamente**, per qualunque $F$ regolare.' },
            {
              tex: '\\nabla^2F=\\frac{\\partial}{\\partial x}\\Big(x+\\varphi_{,y}\\Big)+\\frac{\\partial}{\\partial y}\\Big(y-\\varphi_{,x}\\Big)=2',
              why: 'Ora l’altra faccia della medaglia: le derivate di $F$ devono venire da una vera funzione $\\varphi$ (integrabilità). Calcoliamo il laplaciano di $F$, la somma delle derivate seconde, derivando la prima definizione rispetto a $x$ e la seconda rispetto a $y$. Restano $1+1=2$, più $\\varphi_{,yx}-\\varphi_{,xy}$, che si cancellano ancora per Schwarz, ora applicato a $\\varphi$.',
              ask: { q: 'Quanto vale il laplaciano della funzione di Prandtl?', options: ['2', '0', '1', '$-2$'], correct: 0, why: 'Derivando $x$ rispetto a $x$ e $y$ rispetto a $y$ si ottiene $1+1=2$, e le derivate miste di $\\varphi$ si cancellano (Teo 5.8.5). Zero è il laplaciano di $\\varphi$, non di $F$: è facile confonderli.' },
            },
            { tex: 'T_{zx}n_x+T_{zy}n_y=G\\gamma\\big(-F_{,y}n_x+F_{,x}n_y\\big)=0', why: 'Il mantello scarico: sostituiamo nella condizione sul contorno le tensioni scritte con $F$.', aggiunto: true },
            { tex: '\\frac{dF}{dt}=\\nabla F\\cdot\\hat t=0\\ \\text{su }\\partial A,\\qquad\\hat t=(-n_y,n_x)', why: 'Il vettore $\\hat t=(-n_y,n_x)$ è la normale ruotata di 90°, cioè la **tangente** al contorno. La condizione di prima, cambiata di segno, è proprio il prodotto scalare tra il gradiente di $F$ e $\\hat t$: la derivata di $F$ lungo il contorno è nulla.', aggiunto: true },
            { tex: 'F=\\text{cost.}\\ \\text{su }\\partial A\\quad\\Rightarrow\\quad F=0\\ \\text{su }\\partial A', why: 'Se la derivata lungo il contorno è nulla, $F$ è costante sul contorno. La costante si può scegliere liberamente, perché le tensioni dipendono solo dalle derivate di $F$; per una sezione **semplicemente connessa**, che ha un solo contorno, si sceglie zero.', eq: 'Teo 5.8.5' },
          ],
        },
      },
      {
        id: 'l74-4',
        kind: 'spiega',
        title: 'Che cosa abbiamo guadagnato: il problema di Dirichlet',
        md: `Il risultato è il **Teo 5.8.5**: la funzione di Prandtl risolve il **problema di Dirichlet per l'equazione di Poisson**,
$$\\nabla^2F=2\\ \\text{in }\\mathring A,\\qquad F=0\\ \\text{su }\\partial A.$$
I nomi si leggono così: «Poisson» perché il laplaciano è uguale a un termine noto diverso da zero (con zero sarebbe Laplace); «Dirichlet» perché sul contorno si assegna il valore della funzione, non la sua derivata.

Confrontalo con il problema di Neumann per $\\varphi$. Lì il dato sul contorno cambiava punto per punto con la normale; qui è semplicemente **zero** su tutto il bordo. E l'equilibrio non va più controllato: è automatico.

Questo suggerisce anche un modo di cercare la soluzione, che la dispensa indica come «primo tentativo»: se il contorno è descritto da un'equazione del tipo $g(x,y)=0$, allora $F=c\\,g(x,y)$ è nulla sul contorno per costruzione, e basta scegliere la costante $c$ perché il laplaciano valga 2. Lo useremo nella prossima lezione per il cerchio.`,
      },
      {
        id: 'l74-5',
        kind: 'domanda',
        q: { id: 'l74-q2', kind: 'scelta', q: 'Quale problema al contorno risolve la funzione di Prandtl $F$?', options: ['Dirichlet per Poisson: $\\nabla^2F=2$ nella sezione, $F=0$ sul contorno', 'Neumann per Laplace', 'Dirichlet per Laplace: $\\nabla^2F=0$, $F=0$ sul contorno', 'Nessuno: $F$ è nota a priori'], correct: 0, why: 'Il laplaciano vale 2 (non zero), quindi è Poisson; sul contorno si assegna la funzione, quindi è Dirichlet (Teo 5.8.5). Neumann per Laplace è il problema di $\\varphi$; con $\\nabla^2F=0$ e $F=0$ sul bordo la soluzione sarebbe $F\\equiv0$, cioè nessuna tensione.' },
      },
      {
        id: 'l74-6',
        kind: 'domanda',
        q: { id: 'l74-q1', kind: 'vf', q: 'Con la funzione di Prandtl l’equazione di equilibrio nell’interno della sezione è soddisfatta automaticamente.', answer: true, why: 'Scrivendo $T_{zx}=-G\\gamma F_{,y}$ e $T_{zy}=G\\gamma F_{,x}$, l’equilibrio diventa $G\\gamma(F_{,xy}-F_{,yx})=0$, vero per il teorema di Schwarz (§5.8.3). La condizione che resta su $F$ viene dall’integrabilità di $\\varphi$, non dall’equilibrio.' },
      },
      {
        id: 'l74-7',
        kind: 'spiega',
        title: 'Come si «vede» F: il grafico sulla sezione',
        md: `Il modello a destra mostra la funzione di Prandtl calcolata dal motore come una **superficie** sopra la sezione: l'altezza in ogni punto è $-F$. Questa rappresentazione è un aiuto per gli occhi: la dispensa usa invece, come immagine fisica, l'analogia idrodinamica che vedremo nella prossima lezione.

Che cosa guardare? Tre cose, che si leggono dalle formule di questa lezione (deduzione).
- La superficie è **nulla sul contorno** ($F=0$) e si alza all'interno: è una specie di cupola. Siccome $\\nabla^2F=2$ è positivo, $F$ è negativa all'interno, e $-F$ positiva.
- Le **curve di livello** di $F$ sono le **linee di tensione**: dalle formule di Def 5.8.4 il vettore tensione è perpendicolare al gradiente di $F$, quindi è tangente alle curve $F=$ costante.
- L'intensità della tangenziale è $G\\gamma|\\nabla F|$, cioè proporzionale alla **pendenza** della superficie: dove la cupola è più ripida, la tensione è più grande.`,
      },
      {
        id: 'l74-8',
        kind: 'prova',
        title: 'Leggere la cupola di −F',
        md: 'Il modello mostra il grafico di $-F$ calcolato dal motore: nullo sul contorno, massimo all’interno. Il colore indica $|\\nabla F|$, proporzionale a $|\\tau_z|$; le curve sono le curve di livello.',
        tasks: [
          'Quadrato: individua dove la superficie è più ripida. Sono i punti medi dei lati, ed è lì che la tangenziale è massima.',
          'Quadrato: guarda gli spigoli. La superficie lì è quasi piatta: la tensione è quasi nulla.',
          'Passa alla vista dall’alto: le curve di livello sono le linee di tensione, chiuse e annidate attorno al centro.',
          'Confronta il valore di q nella tabella per cerchio (circa 1), quadrato e triangolo.',
        ],
        visual: TOR('prandtl', { section: 'quadrato', controls: ['section'] }),
      },
      {
        id: 'l74-9',
        kind: 'derivazione',
        title: 'Il momento torcente in funzione di F',
        md: 'Ora colleghiamo $F$ al carico. Vogliamo arrivare a $M_z=G\\gamma\\int_A(-2F)\\,dA$. Strategia: scriviamo il momento torcente con le tensioni di Prandtl; poi riconosciamo nell’integrando la divergenza di un campo vettoriale, che con il teorema della divergenza diventa un integrale sul contorno, dove $F=0$. Il campione numerico usa la $F$ esatta di un’ellisse con semiassi a caso e integra numericamente.',
        source: D(5, '5.8.4', 'Def 5.8.6', '134–135'),
        der: {
          sample,
          lines: [
            { tex: 'M_z=\\int_A\\big(T_{zy}\\,x-T_{zx}\\,y\\big)\\,dA', why: 'Il momento torcente è la somma dei momenti delle tensioni tangenziali rispetto al baricentro (Def 5.2.2 del Modulo 6).', aggiunto: true },
            {
              tex: '\\frac{M_z}{G\\gamma}=\\int_A\\Big(x\\frac{\\partial F}{\\partial x}+y\\frac{\\partial F}{\\partial y}\\Big)dA',
              why: 'Sostituiamo $T_{zy}=G\\gamma F_{,x}$ e $T_{zx}=-G\\gamma F_{,y}$: il segno meno davanti a $T_{zx}$ diventa un più. Poi dividiamo per $G\\gamma$, che è costante. Il motore calcola l’integrale con il gradiente esatto della $F$ dell’ellisse.',
              val: (v) => {
                const A = v.a + v.b,
                  B = v.b;
                const k = (A * A * B * B) / (A * A + B * B);
                // ∇F esatto dell'ellisse: F_x = 2kx/a², F_y = 2ky/b²
                return intEllipse(A, B, (x, y) => x * ((2 * k * x) / (A * A)) + y * ((2 * k * y) / (B * B)));
              },
            },
            {
              tex: '=\\int_A\\big(\\operatorname{div}\\vet w-2F\\big)dA,\\qquad\\vet w=(xF,\\,yF)',
              why: 'Introduciamo il campo $\\vet w=(xF,yF)$. La sua divergenza, cioè $\\partial(xF)/\\partial x+\\partial(yF)/\\partial y$, per la regola del prodotto vale $F+xF_{,x}+F+yF_{,y}$. Quindi l’integrando di prima è $\\operatorname{div}\\vet w-2F$.',
            },
            {
              tex: '\\int_A\\operatorname{div}\\vet w\\,dA=\\oint_{\\partial A}\\vet w\\cdot\\hat n\\,ds=0',
              why: 'Il teorema della divergenza (Modulo 1) trasforma l’integrale della divergenza sull’area nell’integrale del flusso di $\\vet w$ attraverso il contorno. Ma sul contorno $F=0$, quindi $\\vet w=\\vet 0$ e l’integrale è nullo.',
              aggiunto: true,
            },
            {
              tex: '=\\int_A(-2F)\\,dA',
              why: 'Resta solo il termine $-2F$. Moltiplicando per $G\\gamma$ si ha $M_z=G\\gamma\\int_A(-2F)\\,dA$. Il motore lo calcola con la funzione $F$ dell’ellisse e trova lo stesso numero della prima riga.',
              val: (v) => {
                const e = Tor.ellipse(v.a + v.b, v.b, 1);
                return intEllipse(v.a + v.b, v.b, (x, y) => -2 * e.F(x, y));
              },
              eq: '§5.8.4',
            },
          ],
        },
      },
      {
        id: 'l74-10',
        kind: 'spiega',
        title: 'Il fattore di torsione q e la rigidezza torsionale',
        md: `Il risultato si legge così: il momento torcente è $G\\gamma$ per un numero, $\\int_A(-2F)\\,dA$, che dipende solo dalla **forma** della sezione. Siccome $F$ è negativa all'interno, l'integrale è positivo: momento e angolo hanno lo stesso segno.

La dispensa confronta questo numero con il **momento polare d'inerzia** $J_0=\\int_A(x^2+y^2)\\,dA$ e definisce (Def 5.8.6) il **fattore di torsione**
$$q:=\\frac{J_0}{\\int_A(-2F)\\,dA}\\ge1,$$
che vale 1 **solo per il cerchio**. Allora l'angolo unitario è
$$\\gamma=q\\frac{M_z}{GJ_0}=\\frac{M_z}{K_t},\\qquad K_t:=\\frac{GJ_0}{q},$$
dove $K_t$ è la **rigidezza torsionale**. Il fattore $q$ è un **fattore di efficienza**: dice quante volte la sezione è meno rigida a torsione di quanto farebbe credere il suo momento polare. Per il cerchio la rigidezza è proprio $GJ_0$; per ogni altra sezione è più piccola.`,
      },
      {
        id: 'l74-11',
        kind: 'spiega',
        title: 'Lo schema per l’orale, e quali sezioni si sanno risolvere',
        md: `La dispensa riassume la torsione in uno schema in tre passi (§5.8.4), utile da ripetere all'orale:
1. la **congettura** di Clebsch, con l'angolo unitario $\\gamma$ e la funzione d'ingobbamento $\\varphi$, a cui corrisponde la funzione di Prandtl $F$;
2. il **problema di Dirichlet** per $F$: $\\nabla^2F=2$ nella sezione, $F=0$ sul contorno;
3. la relazione tra momento e angolo, $\\gamma=qM_z/(GJ_0)$.

Per quali sezioni si sa risolvere il problema? La dispensa le divide in tre gruppi:
- **esatte in forma chiusa**: il cerchio e l'ellisse, anche cavi, e il triangolo equilatero;
- **esatte in serie**: il rettangolo e il quadrato;
- **approssimate**: le sezioni sottili, chiuse e aperte.

Le prossime due lezioni percorrono proprio questo elenco.`,
      },
      {
        id: 'l74-12',
        kind: 'domanda',
        q: { id: 'l74-q3', kind: 'vf', q: 'Il fattore di torsione $q$ può essere minore di 1 per sezioni molto compatte, come il quadrato.', answer: false, why: 'Per la Def 5.8.6 $q\\ge1$, e vale 1 solo per il cerchio: nessuna sezione è più efficiente del cerchio a torsione. Il quadrato ha $q$ leggermente maggiore di 1, come mostra la tabella del modello.' },
      },
      {
        id: 'l74-13',
        kind: 'spiega',
        title: 'Attenzione a…',
        md: `Tre errori tipici su Prandtl.

1. **Dimenticare il 2 in $\\nabla^2F=2$.** È facile confondere l'equazione di $F$ con quella di $\\varphi$, che è $\\nabla^2\\varphi=0$. Il 2 viene da $\\partial x/\\partial x+\\partial y/\\partial y$: senza di esso, con $F=0$ sul bordo, la soluzione sarebbe $F\\equiv0$ e non ci sarebbe alcuna tensione.
2. **Pensare che $q$ possa essere minore di 1.** Il cerchio è la sezione più efficiente: $q=1$ per il cerchio e $q>1$ per tutte le altre.
3. **Scambiare i segni nelle formule delle tensioni.** La regola è $T_{zx}=-G\\gamma F_{,y}$ e $T_{zy}=G\\gamma F_{,x}$: il segno meno sta sulla componente lungo $x$, che si ottiene derivando rispetto a $y$. Scambiandoli, l'equilibrio non sarebbe più automatico.`,
      },
      {
        id: 'l74-14',
        kind: 'riassunto',
        md: `**Il filo della lezione.** Per rendere più semplice il problema di Neumann su $\\varphi$, Prandtl introduce una funzione delle tensioni $F$, le cui derivate danno le due tangenziali. Con questa scelta l'equilibrio è automatico per il teorema di Schwarz; l'esistenza di $\\varphi$ impone $\\nabla^2F=2$, e il mantello scarico impone che $F$ sia costante sul contorno, cioè nulla per una sezione semplicemente connessa: è un problema di Dirichlet per Poisson. Il momento torcente, con il teorema della divergenza, risulta $G\\gamma\\int(-2F)$; confrontando con il momento polare si definisce il fattore di torsione $q\\ge1$, uguale a 1 solo per il cerchio, e la rigidezza torsionale $K_t=GJ_0/q$.

- Funzione di Prandtl: $T_{zx}=-G\\gamma F_{,y}$, $T_{zy}=G\\gamma F_{,x}$ (Def 5.8.4).
- Problema di Dirichlet per Poisson: $\\nabla^2F=2$ in $\\mathring A$, $F=0$ su $\\partial A$ (Teo 5.8.5).
- Momento torcente: $M_z=G\\gamma\\int_A(-2F)\\,dA$ (§5.8.4).
- Fattore di torsione: $q=\\frac{J_0}{\\int_A(-2F)\\,dA}\\ge1$, $\\gamma=q\\frac{M_z}{GJ_0}=\\frac{M_z}{K_t}$, $K_t=\\frac{GJ_0}q$ (Def 5.8.6).`,
        orale: ['Torsione: Clebsch, Neumann, Prandtl e Dirichlet, fattore di torsione. (dispensa, domanda 11)', 'Ricava $M_z=G\\gamma\\int(-2F)\\,dA$.'],
      },
    ],
  },
  // ================================================================== c7.5
  {
    concept: 'c7.5',
    title: 'Sezioni esatte, analogia idrodinamica, chiusa contro aperta',
    minutes: 36,
    source: D(5, '5.8.5–5.8.8', undefined, '135–138'),
    visual: SVG('torsione', { tab: 'flusso', section: 'quadrato' }),
    steps: [
      {
        id: 'l75-1',
        kind: 'spiega',
        title: 'Dove siamo e dove andiamo',
        md: `Nella lezione precedente abbiamo ridotto la torsione al **problema di Dirichlet** per la funzione di Prandtl $F$: $\\nabla^2F=2$ nella sezione, $F=0$ sul contorno (Teo 5.8.5). Dalla soluzione si ricavano le tensioni e, con il fattore di torsione $q$, l'angolo unitario $\\gamma=qM_z/(GJ_0)$.

Ora usiamo questo strumento sulle sezioni concrete. Le domande sono due: **dove si trova la tensione massima nelle sezioni più comuni, e che cosa insegnano i risultati sulla forma da dare a un pezzo che lavora a torsione?**

Le tappe: prima risolviamo esattamente il **cerchio**, che è il caso più semplice e l'unico senza ingobbamento; poi guardiamo i risultati della dispensa per ellisse, triangolo e rettangolo. Quindi introduciamo l'**analogia idrodinamica**, che permette di indovinare dove la tensione è grande o piccola senza fare conti. Infine confrontiamo un tubo chiuso con lo stesso tubo tagliato, e vediamo il cerchio cavo.`,
      },
      {
        id: 'l75-2',
        kind: 'derivazione',
        title: 'La sezione circolare: trovare F',
        md: 'Vogliamo trovare la funzione di Prandtl del cerchio di raggio $R$. Strategia: usiamo il «primo tentativo» suggerito dalla dispensa, cioè l’equazione del contorno, che è nulla sul bordo per costruzione; poi aggiustiamo la costante perché il laplaciano valga 2. Il campione prende un raggio e un punto a caso, e il motore calcola il laplaciano numericamente.',
        source: D(5, '5.8.5', undefined, '135–136'),
        der: {
          sample,
          lines: [
            { tex: 'F=x^2+y^2-R^2:\\quad\\nabla^2F=4', why: 'Il contorno del cerchio ha equazione $x^2+y^2-R^2=0$, quindi questa funzione è nulla sul bordo. Il suo laplaciano è $2+2=4$: il doppio di quello che serve.' },
            {
              tex: 'F=\\frac{x^2+y^2-R^2}2:\\quad\\nabla^2F',
              why: 'Allora dividiamo per 2: la funzione resta nulla sul contorno e il laplaciano si dimezza. Il motore lo calcola con le differenze finite nel punto del campione…',
              val: (v) => {
                const R = v.a;
                const f = (x: number, y: number) => Tor.circle(R, 1).F(x, y);
                const h = 1e-2,
                  x = v.x * 0.5 * R,
                  y = v.y * 0.5 * R;
                return (f(x + h, y) + f(x - h, y) + f(x, y + h) + f(x, y - h) - 4 * f(x, y)) / (h * h);
              },
            },
            { tex: '=2\\ ✓', why: '…e trova 2. Entrambe le condizioni del problema di Dirichlet sono soddisfatte, e per l’unicità della soluzione questa è la $F$ del cerchio.', val: () => 2, eq: '§5.8.5' },
          ],
        },
      },
      {
        id: 'l75-3',
        kind: 'spiega',
        title: 'Il cerchio non si ingobba',
        md: `Trovata $F$, ricaviamo che cosa succede alla sezione circolare (§5.8.5).

Prima l'ingobbamento. Dalle definizioni della funzione di Prandtl (Def 5.8.4) si ricavano le derivate di $\\varphi$:
$$\\frac{\\partial\\varphi}{\\partial y}=\\frac{\\partial F}{\\partial x}-x=x-x=0,\\qquad\\frac{\\partial\\varphi}{\\partial x}=y-\\frac{\\partial F}{\\partial y}=y-y=0.$$
Le derivate di $\\varphi$ sono nulle, quindi $\\varphi$ è costante: **niente ingobbamento**, la sezione circolare ruota restando piana.

Poi il fattore di torsione. Il momento polare è $J_0=\\pi R^4/2$; l'integrale di $-2F=R^2-r^2$ sul cerchio, dove $r$ è la distanza dal centro, vale anch'esso $\\pi R^4/2$. Il loro rapporto è $q=1$, e quindi la rigidezza torsionale è proprio $K_t=GJ_0$. È il caso che abbiamo anticipato nella lezione su Clebsch: con $\\varphi=0$ le tensioni sono solo quelle prodotte dalla rotazione.`,
      },
      {
        id: 'l75-4',
        kind: 'spiega',
        title: 'Le tensioni nel cerchio',
        md: `Con $F=\\frac{x^2+y^2-R^2}2$ le derivate sono semplicemente $F_{,x}=x$ e $F_{,y}=y$. Sostituendo nelle formule di Prandtl ed eliminando $G\\gamma$ con $\\gamma=M_z/(GJ_0)$ si ottiene (§5.8.5):
$$\\tau_{zx}=-\\frac{M_z}{J_0}\\,y,\\qquad\\tau_{zy}=\\frac{M_z}{J_0}\\,x,\\qquad|\\tau_z|=\\frac{2M_z}{\\pi R^4}\\,r,\\qquad|\\tau_z|_{\\max}=\\frac{2M_z}{\\pi R^3}.$$

Leggiamole a parole. La tangenziale è:
- **ortogonale al raggio vettore**: il vettore $(-y,x)$ è il raggio $(x,y)$ ruotato di 90°, quindi la tensione gira attorno al centro;
- **lineare con il raggio**: è nulla al centro e cresce in proporzione alla distanza;
- **massima sul contorno**, dove $r=R$.

Un controllo (deduzione): la massima tensione dipende dal cubo del raggio. Raddoppiare il diametro di un albero riduce la tensione massima di otto volte. Nel diagramma, scegli il cerchio: le linee di tensione sono circonferenze concentriche e il colore cresce verso il bordo.`,
      },
      {
        id: 'l75-5',
        kind: 'domanda',
        q: { id: 'l75-q2', kind: 'vf', q: 'Nella sezione circolare piena soggetta a torsione la tangenziale è massima al centro e nulla sul contorno.', answer: false, why: 'È il contrario: $|\\tau_z|=\\frac{2M_z}{\\pi R^4}r$ cresce linearmente con la distanza $r$ dal centro, quindi è nulla al centro e massima sul contorno, $\\frac{2M_z}{\\pi R^3}$ (§5.8.5).' },
      },
      {
        id: 'l75-6',
        kind: 'spiega',
        title: 'Altre sezioni esatte: ellisse e triangolo',
        md: `La dispensa riporta anche i risultati per altre sezioni (§5.8.6), senza svolgerli. Per l'orale conta soprattutto **dove** sta il massimo.

**Ellisse** con semiassi $a>b$. La tangenziale massima vale
$$\\tau_{\\max}=\\frac{2M_z}{\\pi ab^2}$$
e si trova **ai piedi dell'asse minore**, cioè nei punti del contorno più vicini al centro. A differenza del cerchio, l'ellisse **si ingobba**. Se $a=b=R$ ritrovi la formula del cerchio (deduzione).

**Triangolo equilatero** di lato $a$. Il momento polare è $J_0=\\frac{\\sqrt3}{48}a^4$ e la tangenziale massima vale
$$\\tau_{\\max}=\\frac{5\\sqrt3}{12}\\frac{M_z}{J_0}a=\\frac{20M_z}{a^3},$$
**ai punti medi dei lati**, ancora i punti del contorno più vicini al centro.

Nota la regola comune (deduzione): il massimo sta dove il contorno si avvicina di più al centro. L'analogia idrodinamica ci darà tra poco un'immagine per ricordarla.`,
      },
      {
        id: 'l75-7',
        kind: 'spiega',
        title: 'Il rettangolo e la tabella di α e β',
        md: `Il **rettangolo** di lati $h\\ge b$ ha una soluzione esatta in serie, e la dispensa ne riporta i risultati tramite due coefficienti, $\\alpha$ e $\\beta$, che dipendono dal rapporto $h/b$ (§5.8.6):
$$\\tau_{\\max}=\\frac1\\alpha\\frac{M_z}{b^2h},\\qquad\\theta^{(1)}=\\frac1\\beta\\frac{M_z}{Gb^3h},$$
dove $\\theta^{(1)}$ è la rotazione relativa tra sezioni a distanza unitaria, cioè l'angolo unitario. Il massimo sta **ai punti medi dei lati lunghi**, che sono gli estremi della mediana più corta (negli appunti è scritto «diagonale più piccola», ma si intende la mediana).

Alcuni valori della tabella: per $h/b=1$ (il quadrato) $\\alpha=0{,}208$ e $\\beta=0{,}141$; per $h/b=2$, $\\alpha=0{,}246$ e $\\beta=0{,}229$; per $h/b=10$, entrambi $0{,}312$; e per $h/b\\to\\infty$ entrambi tendono a $\\frac13$. Due casi da ricordare:
- **quadrato**: $\\tau_{\\max}=4{,}8\\,M_z/a^3$;
- **rettangolo molto allungato**: con $\\alpha=\\frac13$, $\\tau_{\\max}=3\\frac{M_z}{b^2h}$. Questa formula sarà la base delle sezioni sottili aperte.`,
      },
      {
        id: 'l75-8',
        kind: 'numeri',
        title: 'Il quadrato, calcolato dal motore',
        md: `Controlliamo la tabella con il motore. Per il quadrato di lato 24 cm il risolutore numerico del problema di Dirichlet dà $\\tau_{\\max}\\approx${(sqTau * 24 ** 3 / 100).toFixed(2).replace('.', ',')}\\,M_z/a^3$, contro il $4{,}8$ della tabella, e un fattore di torsione $q\\approx${SQ.q.toFixed(3).replace('.', ',')}$, poco più di 1. Le differenze di qualche per cento vengono dalla griglia finita usata dal motore.`,
        values: { coeff: Math.round((sqTau * 24 ** 3) / 100 * 100) / 100, q: Math.round(SQ.q * 1000) / 1000 },
        visual: SVG('torsione', { tab: 'flusso', section: 'quadrato' }),
      },
      {
        id: 'l75-9',
        kind: 'domanda',
        q: { id: 'l75-q3', kind: 'scelta', q: 'Dove è massima la tangenziale in un rettangolo soggetto a torsione?', options: ['Ai punti medi dei lati lunghi', 'Negli spigoli', 'Al baricentro', 'Ai punti medi dei lati corti'], correct: 0, why: 'Il massimo sta ai punti medi dei lati lunghi, gli estremi della mediana più corta, cioè i punti del contorno più vicini al centro (§5.8.6). Negli spigoli, che sono convessi, la tensione tende a zero; al baricentro è nulla.' },
      },
      {
        id: 'l75-10',
        kind: 'spiega',
        title: 'L’analogia idrodinamica',
        md: `Per le sezioni senza soluzione esatta serve un'intuizione. La dispensa la trova in un'analogia (§5.8.7): le equazioni della torsione sono **le stesse** del moto laminare, cioè ordinato, di un fluido che ruota in un recipiente con la forma della sezione. L'immagine è un giradischi con sopra un recipiente d'acqua, fermato di colpo; qualche goccia d'inchiostro rende visibili le traiettorie.

La corrispondenza è questa:
- l'intensità della tangenziale $|\\tau_z|$ corrisponde alla **velocità** $|v|$ del fluido;
- le **linee di tensione** corrispondono alle **linee di flusso**;
- in un tubo di flusso, cioè la striscia compresa tra due linee di flusso vicine, la portata è costante: $\\tau_z\\,b=$ costante, dove $b$ è la larghezza del tubo. Dove il tubo si stringe, la tensione aumenta, come la velocità dell'acqua in una strettoia.

Nel diagramma le curve sono le linee di tensione (le curve di livello di $F$) e il colore è $|\\tau_z|$: guarda dove le linee si avvicinano tra loro e dove si allontanano.`,
      },
      {
        id: 'l75-11',
        kind: 'spiega',
        title: 'Che cosa insegna l’analogia: spigoli e raccordi',
        md: `Con l'immagine del fluido si prevedono i punti critici di una sezione (§5.8.7).

Negli **spigoli convessi**, quelli che sporgono verso l'esterno come gli angoli di un quadrato, il fluido ristagna: $\\tau\\to0$. Negli **spigoli concavi**, quelli rientranti come l'angolo interno di una L, il fluido deve girare di colpo e le linee si addensano: la tensione diventa **massima**, in teoria illimitata se lo spigolo è vivo. In generale la tensione è nulla sulla linea media della sezione e massima al contorno.

Le conseguenze pratiche sono importanti. In uno spigolo vivo concavo il materiale si **plasticizza** anche con momenti modesti; l'esempio della dispensa è la gola di scarico di un albero. Per questo gli spigoli concavi si **raccordano**, cioè si arrotondano: anche i profilati a doppio T hanno raccordi tra anima e ali. Questi picchi di tensione contano soprattutto per la **fatica**, cioè la rottura sotto carichi ripetuti.`,
      },
      {
        id: 'l75-12',
        kind: 'prova',
        title: 'Linee di tensione e spigoli',
        md: 'Il diagramma mostra le linee di tensione (curve di livello di $F$) e, a colori, l’intensità di $|\\tau_z|$; il cerchietto segna il punto di tensione massima trovato dal motore.',
        tasks: [
          'Quadrato: verifica che il colore svanisca negli spigoli convessi e che il massimo stia ai punti medi dei lati.',
          'Passa alla L: le linee di tensione si addensano attorno allo spigolo concavo e il massimo si sposta lì. È il punto che va raccordato.',
          'Passa al cerchio: linee concentriche, colore che cresce dal centro verso il bordo. Confronta il τ_max del motore con il valore esatto nella tabella.',
          'Passa al triangolo: il massimo sta ai punti medi dei lati, i punti del contorno più vicini al centro.',
        ],
        visual: SVG('torsione', { tab: 'flusso', section: 'L' }),
      },
      {
        id: 'l75-13',
        kind: 'domanda',
        q: { id: 'l75-q1', kind: 'scelta', q: 'In un rettangolo soggetto a torsione, che cosa accade alla tangenziale negli spigoli?', options: ['Tende a zero, perché gli spigoli sono convessi', 'È massima, perché negli spigoli le linee si addensano', 'È infinita', 'È uguale al valore medio sulla sezione'], correct: 0, why: 'Per l’analogia idrodinamica negli spigoli convessi il fluido ristagna, quindi $\\tau\\to0$ (§5.8.7). Le linee si addensano e la tensione diventa massima negli spigoli concavi, come l’angolo interno di una L, che il rettangolo non ha.' },
      },
      {
        id: 'l75-14',
        kind: 'spiega',
        title: 'Tubo chiuso contro tubo tagliato: il ragionamento',
        md: `L'analogia permette anche un confronto famoso (§5.8.7). Prendiamo un tubolare quadrato sottile, di lato $B$ e spessore $t$, e lo stesso tubolare **tagliato** lungo una generatrice, così che la sezione diventi aperta. Applichiamo lo stesso momento torcente.

**Sezione chiusa.** Il fluido può girare tutto attorno al tubo. Siccome lo spessore è piccolo, la tensione $\\tau^{(1)}$ è circa **costante nello spessore**. Sulla corda baricentrica le forze $\\tau^{(1)}t$ dei due lati opposti formano una coppia di braccio $B-t$, e la dispensa scrive il loro momento come $dM_z=\\tau^{(1)}t(B-t)$.

**Sezione aperta.** Il taglio impedisce al fluido di girare attorno: deve tornare indietro all'interno dello spessore stesso. La tensione $\\tau^{(2)}$ varia allora **linearmente nello spessore**, nulla sulla linea media e con versi opposti sulle due facce. La dispensa calcola il momento di questi due triangoli di tensione: $dM_z=2\\cdot\\frac12\\cdot\\frac t2\\tau^{(2)}\\cdot\\frac23t=\\frac13\\tau^{(2)}t^2$.

La differenza decisiva è il **braccio**: nella chiusa è tutto il lato $B-t$, nell'aperta è una frazione dello spessore $t$.`,
      },
      {
        id: 'l75-15',
        kind: 'spiega',
        title: 'Quanto è grande la differenza?',
        md: `Uguagliando i due momenti, a parità di $M_z$, la dispensa ricava
$$\\tau^{(2)}=3\\,\\frac{B-t}{t}\\,\\tau^{(1)},$$
cioè circa **150 volte** con $B=100$ mm e $t=2$ mm (il conto dà 147), e avverte che si tratta di un calcolo qualitativo.

Il fattore va però **dimezzato** (passaggio aggiunto, NF-14): la corda baricentrica attraversa **due** pareti anche nella sezione aperta, quindi il suo momento è $2\\cdot\\frac13\\tau^{(2)}t^2$, e il confronto omogeneo dà $\\tau^{(2)}=\\frac32\\frac{B-t}t\\tau^{(1)}$, circa ${TUBE.ratio.toFixed(1).replace('.', ',')}$ volte. Lo stesso valore viene dalle formule globali della dispensa, la formula di Bredt per la chiusa e quella del rettangolo allungato per l'aperta, che vedremo nella prossima lezione.

All'orale esponi il ragionamento della dispensa e, se serve, precisa il fattore. La conclusione non cambia: **le sezioni chiuse resistono a torsione molto meglio di quelle aperte**, di decine di volte. Per questo gli alberi e i telai che lavorano a torsione si fanno tubolari chiusi.`,
      },
      {
        id: 'l75-16',
        kind: 'prova',
        title: 'Tagliare il tubo',
        md: 'Il diagramma confronta il tubolare quadrato chiuso con lo stesso tubolare tagliato, con $B=100$ mm e lo stesso momento torcente. La tabella riporta le due tensioni e il loro rapporto.',
        tasks: [
          'Con t = 2 mm leggi il rapporto tra le due tensioni: la sezione aperta ha tensioni decine di volte maggiori.',
          'Aumenta lo spessore con il cursore: il rapporto scende, perché cresce il braccio delle tensioni nella sezione aperta, ma resta grande.',
          'Confronta il rapporto del motore con il valore della dispensa, 3(B − t)/t: è la metà, come spiegato nel passo precedente.',
        ],
        visual: SVG('torsione', { tab: 'sottili' }),
      },
      {
        id: 'l75-17',
        kind: 'spiega',
        title: 'Il cerchio cavo',
        md: `Ultimo caso esatto: il **cerchio cavo**, cioè una corona circolare di raggi $R_i$ e $R_e$ (§5.8.8). La sezione non è più semplicemente connessa, perché ha due contorni, e la scelta $F=0$ su tutto il bordo non è più garantita.

L'analogia idrodinamica suggerisce la soluzione. Nel cerchio pieno le linee di flusso sono circonferenze concentriche; il **bordo interno** del cerchio cavo è una di queste circonferenze. Togliere il materiale interno è come mettere una parete lungo una linea di flusso: il fluido non se ne accorge. In termini di $F$: la funzione del cerchio pieno è costante sul bordo interno, e questo basta perché il mantello interno sia scarico.

Quindi **la stessa $F$ del cerchio pieno risolve il problema**, e le tensioni hanno la stessa forma:
$$\\tau_z=\\frac{M_z}{J_0}\\,r,\\quad r\\in[R_i,R_e],\\qquad J_0=\\frac{\\pi(R_e^4-R_i^4)}2.$$
Cambia solo il momento polare, quello della corona. Il cerchio cavo, come il pieno, non si ingobba. La dispensa nota che lo stesso ragionamento vale per l'ellisse cava.`,
      },
      {
        id: 'l75-18',
        kind: 'spiega',
        title: 'Attenzione a…',
        md: `Tre errori tipici su queste sezioni.

1. **Dire che anche il quadrato non si ingobba.** Il quadrato ha la stessa simmetria in tutte e quattro le direzioni, e sembra «quasi un cerchio». Ma l'ingobbamento è nullo **solo** per il cerchio, pieno o cavo: l'ellisse, il quadrato e il rettangolo si ingobbano.
2. **Mettere il massimo negli spigoli del rettangolo.** È tentante perché gli spigoli sono i punti più lontani dal centro, e nel cerchio la tensione cresce con la distanza. Ma gli spigoli sono convessi e lì $\\tau\\to0$; il massimo è ai punti medi dei lati lunghi.
3. **Usare per una sezione aperta la formula di Bredt.** La formula di Bredt, che vedremo nella prossima lezione, vale per le sezioni sottili **chiuse**, dove la tensione può girare tutta attorno. Nelle aperte la tensione cambia verso nello spessore e serve la formula dei rettangoli allungati.`,
      },
      {
        id: 'l75-19',
        kind: 'riassunto',
        md: `**Il filo della lezione.** Per il cerchio il primo tentativo con l'equazione del contorno, diviso per 2, risolve il problema di Dirichlet: la sezione non si ingobba, $q=1$, e la tangenziale è ortogonale al raggio, lineare con esso e massima sul bordo. Ellisse, triangolo equilatero e rettangolo hanno soluzioni esatte, con il massimo nei punti del contorno più vicini al centro, e si ingobbano. L'analogia idrodinamica traduce le tensioni nelle velocità di un fluido: si annullano negli spigoli convessi e si concentrano in quelli concavi, che vanno raccordati. Lo stesso ragionamento mostra che un tubo chiuso resiste a torsione decine di volte meglio dello stesso tubo tagliato; il cerchio cavo si risolve con la $F$ del pieno.

- Cerchio: $F=\\frac{x^2+y^2-R^2}2$, $|\\tau_z|=\\frac{2M_z}{\\pi R^4}r$, $|\\tau_z|_{\\max}=\\frac{2M_z}{\\pi R^3}$ (§5.8.5).
- Ellisse $\\frac{2M_z}{\\pi ab^2}$; triangolo equilatero $\\frac{20M_z}{a^3}$ (§5.8.6).
- Rettangolo: $\\tau_{\\max}=\\frac{M_z}{\\alpha b^2h}$, $\\theta^{(1)}=\\frac{M_z}{\\beta Gb^3h}$; quadrato $4{,}8M_z/a^3$; allungato $3M_z/(b^2h)$ (§5.8.6).
- Chiusa contro aperta: dispensa $\\tau^{(2)}=3\\frac{B-t}t\\tau^{(1)}$; confronto omogeneo $\\frac32\\frac{B-t}t$ (passaggio aggiunto, NF-14) (§5.8.7).
- Cerchio cavo: $\\tau_z=\\frac{M_z}{J_0}r$, $J_0=\\frac{\\pi(R_e^4-R_i^4)}2$ (§5.8.8).`,
        orale: ['Sezione circolare (piena e cava) e altre sezioni; analogia idrodinamica. (dispensa, domanda 12, prima parte)', 'Che cosa dice l’analogia idrodinamica sugli spigoli? Perché le sezioni chiuse sono migliori di quelle aperte?'],
      },
    ],
  },
  // ================================================================== c7.6
  {
    concept: 'c7.6',
    title: 'Sezioni sottili: aperte e chiuse (Bredt)',
    minutes: 28,
    source: D(5, '5.8.9–5.8.10', 'Teo 5.8.7', '139–141'),
    visual: SVG('torsione', { tab: 'sottili' }),
    steps: [
      {
        id: 'l76-1',
        kind: 'spiega',
        title: 'Dove siamo e dove andiamo',
        md: `Nella lezione precedente abbiamo visto le sezioni con soluzione esatta e, con l'analogia idrodinamica, il confronto tra un tubo chiuso e lo stesso tubo tagliato: la sezione chiusa resiste decine di volte meglio. Ma nella pratica i profilati sono quasi sempre **sottili**: lamiere piegate a L, a C, a doppio T, oppure tubi chiusi. Per queste sezioni la dispensa non dà soluzioni esatte, ma **formule approssimate** (§5.8.9–5.8.10).

La domanda di questa lezione è: **come si calcola la tensione tangenziale massima in una sezione sottile, aperta o chiusa?**

Le tappe sono due. Prima le sezioni sottili **aperte**, che si trattano come insiemi di rettangoli allungati. Poi le sezioni sottili **chiuse**, con la teoria di **Bredt** (1896): ne vedremo le ipotesi, la dimostrazione e il significato. Alla fine avrai le tre formule che la dispensa indica per l'orale: Jourawski per il taglio, Bredt per le sottili chiuse, rettangoli allungati per le sottili aperte.`,
      },
      {
        id: 'l76-2',
        kind: 'spiega',
        title: 'Sottili aperte: una somma di rettangoli allungati',
        md: `Partiamo dal risultato della lezione precedente per il **rettangolo molto allungato**: con $\\alpha=\\frac13$ la tensione massima è $3\\frac{M_z}{b^2h}$, con $b$ spessore e $h$ lunghezza. Una sezione sottile aperta, come una L o un doppio T, è fatta di più rettangoli allungati uniti fra loro.

La dispensa (§5.8.9) la tratta proprio così: $n$ rettangoli, il generico con spessore $b_i$ e lunghezza $h_i$. La tensione massima nel rettangolo $i$-esimo è
$$\\tau^i_{z,\\max}=\\frac{3M_z}{\\sum_jb_j^3h_j}\\,b_i,$$
dove la somma al denominatore corre su tutti i rettangoli. Di conseguenza la tensione massima in assoluto sta nel rettangolo **più spesso**:
$$(\\tau_{z,\\max})_{\\max}=\\frac{3M_z}{\\sum_jb_j^3h_j}\\,b_{\\max}.$$
Con un solo rettangolo ritrovi $3M_z/(b^2h)$ (deduzione). La formula dà una **piccola sovrastima**, cioè è a favore di sicurezza; negli spigoli, dove i rettangoli si uniscono, servono metodi numerici.`,
      },
      {
        id: 'l76-3',
        kind: 'spiega',
        title: 'Perché il massimo sta nel rettangolo più spesso?',
        md: `Il risultato può sorprendere: verrebbe da pensare che la parete più sottile sia la più sollecitata. Ragioniamo sulla formula (spiegazione aggiunta, dalla formula della dispensa).

Al denominatore c'è $\\sum b_j^3h_j$, che misura la rigidezza torsionale dell'intera sezione: ogni rettangolo contribuisce con il **cubo** del suo spessore. Il momento torcente si ripartisce tra i rettangoli in proporzione alla loro rigidezza, quindi un rettangolo spesso ne assorbe una quota molto maggiore. Al numeratore, poi, la tensione massima del rettangolo è proporzionale al suo spessore $b_i$, perché in una parete aperta la tensione varia linearmente nello spessore e il valore sulla faccia cresce con esso.

L'altra conseguenza riguarda la rigidezza: siccome conta il cubo dello spessore, le sezioni aperte sottili sono **molto deformabili** a torsione. È lo stesso messaggio del tubo tagliato, visto dall'altra parte.`,
      },
      {
        id: 'l76-4',
        kind: 'domanda',
        q: { id: 'l76-q1', kind: 'scelta', q: 'In una sezione sottile aperta fatta di rettangoli allungati, in quale rettangolo è massima la tangenziale?', options: ['Nel rettangolo più spesso', 'Nel rettangolo più lungo', 'Nel rettangolo più sottile', 'È uguale in tutti i rettangoli'], correct: 0, why: 'Dalla formula $\\tau^i_{\\max}=\\frac{3M_z}{\\sum b_j^3h_j}b_i$ il denominatore è uguale per tutti, quindi la tensione è proporzionale allo spessore $b_i$ (§5.8.9). La lunghezza entra solo nella somma comune; il più sottile è il meno sollecitato.' },
      },
      {
        id: 'l76-5',
        kind: 'spiega',
        title: 'Sottili chiuse: le ipotesi di Bredt',
        md: `Passiamo alle sezioni sottili **chiuse**, come un tubo di forma qualsiasi (§5.8.10). Descriviamo la parete con la sua **linea media** $\\Gamma$, una curva chiusa e regolare; su di essa usiamo l'ascissa curvilinea $s$, cioè la lunghezza misurata lungo la curva, e chiamiamo $h(s)$ lo **spessore** della parete nel punto $s$, che può variare.

La teoria di Bredt fa queste ipotesi:
- lo spessore è piccolo rispetto alle dimensioni della sezione, $h/D\\ll1$, con $D$ il diametro;
- si usa **solo l'equilibrio alla rotazione**;
- la tangenziale si confonde con il suo **valore medio** $\\bar\\tau_z$ sulla corda che attraversa lo spessore, ed è **parallela alla tangente** alla linea media;
- **ipotesi di Bredt**: il prodotto $\\bar\\tau_z\\,h$ è **costante** lungo la linea media.

L'ultima ipotesi è il cuore della teoria, e l'analogia idrodinamica la rende naturale: in un condotto chiuso la **portata** è la stessa in ogni sezione. Il prodotto $\\bar\\tau_zh$, chiamato **flusso** di tensione, è come la portata: dove la parete si stringe, la tensione cresce.`,
      },
      {
        id: 'l76-6',
        kind: 'derivazione',
        title: 'La formula di Bredt',
        md: 'Vogliamo arrivare a $\\bar\\tau_z=\\frac{M_z}{2\\Omega h}$, con $\\Omega$ area racchiusa dalla linea media. Strategia: scriviamo il momento torcente come somma dei momenti delle forze sui tratti di parete; grazie all’ipotesi di Bredt il flusso esce dall’integrale, e ciò che resta è un integrale puramente geometrico, che riconosciamo come il doppio di un’area. Il campione prende come linea media un rettangolo $a\\times b$ e un polo $G$ interno a caso.',
        source: D(5, '5.8.10', 'Teo 5.8.7', '139–140'),
        der: {
          sample,
          lines: [
            { tex: 'd\\vet F=\\bar\\tau_z(s)\\,h(s)\\,\\hat t(s)\\,ds', why: 'Il primo passo è la forza su un tratto di parete di lunghezza $ds$. La tensione media $\\bar\\tau_z$ agisce sulla corda di lunghezza $h$, quindi la forza è tensione per area, $\\bar\\tau_zh\\,ds$, ed è diretta lungo il versore $\\hat t$ tangente alla linea media.' },
            { tex: 'M_z=\\oint_\\Gamma\\big[(P(s)-G)\\wedge d\\vet F\\big]\\cdot\\hat e_z', why: 'Il momento torcente è la somma, su tutta la linea media chiusa, dei momenti di queste forze rispetto a un polo $G$: il prodotto vettoriale tra il braccio $P(s)-G$ e la forza, di cui si prende la componente lungo l’asse $z$.', aggiunto: true },
            { tex: '=\\bar\\tau_zh\\oint_\\Gamma\\big[(P-G)\\wedge\\hat t\\big]\\cdot\\hat e_z\\,ds', why: 'Sostituiamo $d\\vet F$. Per l’ipotesi di Bredt il flusso $\\bar\\tau_zh$ è lo stesso in ogni punto, quindi è una costante e può uscire dall’integrale. Senza questa ipotesi resterebbe dentro e non sapremmo andare avanti.' },
            {
              tex: '\\oint_\\Gamma\\big[(P-G)\\wedge\\hat t\\big]\\cdot\\hat e_z\\,ds',
              why: 'Ciò che resta è un integrale che dipende solo dalla geometria della linea media. Il motore lo calcola numericamente sul contorno del campione…',
              val: (v) => {
                const P: [number, number][] = [
                  [0, 0],
                  [v.a, 0],
                  [v.a, v.b],
                  [0, v.b],
                ];
                const G = [v.gx * v.a, v.gy * v.b];
                let s = 0;
                for (let i = 0; i < 4; i++) {
                  const A = P[i],
                    B = P[(i + 1) % 4];
                  const L = Math.hypot(B[0] - A[0], B[1] - A[1]);
                  const t = [(B[0] - A[0]) / L, (B[1] - A[1]) / L];
                  for (let k = 0; k < 50; k++) {
                    const u = (k + 0.5) / 50;
                    const p = [A[0] + u * (B[0] - A[0]) - G[0], A[1] + u * (B[1] - A[1]) - G[1]];
                    s += (p[0] * t[1] - p[1] * t[0]) * (L / 50);
                  }
                }
                return s;
              },
            },
            {
              tex: '=2\\Omega',
              why: '…e lo interpretiamo. Il prodotto misto $[(P-G)\\wedge\\hat t\\,ds]\\cdot\\hat e_z$ è il doppio dell’area del triangolino di vertici $G$, $P(s)$, $P(s+ds)$: il prodotto vettoriale di due lati dà infatti il doppio dell’area del triangolo. Sommando i triangolini su tutto il giro si copre esattamente l’area $\\Omega$ racchiusa dalla linea media, qualunque sia il polo $G$.',
              ask: { q: 'Che cosa rappresenta $\\frac12[(P-G)\\wedge\\hat t]\\cdot\\hat e_z\\,ds$?', options: ['L’area del triangolino $G$, $P(s)$, $P(s+ds)$', 'La lunghezza dell’arco $ds$', 'Il momento d’inerzia del tratto di parete', 'La forza sul tratto di parete'], correct: 0, why: 'Metà del prodotto vettoriale di due lati di un triangolo è la sua area; qui i lati sono $P(s)-G$ e $\\hat t\\,ds$ (§5.8.10). La forza sul tratto è $d\\vet F$, che abbiamo già portato fuori; momento d’inerzia e lunghezza non c’entrano.' },
              val: (v) => 2 * v.a * v.b,
            },
            { tex: 'M_z=\\bar\\tau_zh\\,2\\Omega\\ \\Rightarrow\\ \\bar\\tau_z(s)=\\frac{M_z}{2\\Omega h(s)}', why: 'Mettendo insieme, il momento è il flusso per il doppio dell’area racchiusa. Dividendo per $2\\Omega h$ si ottiene la **formula di Bredt**.', eq: 'Teo 5.8.7' },
          ],
        },
      },
      {
        id: 'l76-7',
        kind: 'spiega',
        title: 'Che cosa dice la formula di Bredt',
        md: `Leggiamo $\\bar\\tau_z(s)=\\frac{M_z}{2\\Omega h(s)}$ con le osservazioni della dispensa (Teo 5.8.7).

1. **La tensione è massima dove lo spessore è minimo.** Il numeratore e $\\Omega$ sono gli stessi per tutta la sezione, quindi la tensione dipende solo da $h(s)$: dove la parete è più sottile, la tensione è più grande. È la portata costante dell'analogia: in una strettoia il fluido accelera.
2. **Conta l'area racchiusa, non l'area del materiale.** A parità di materiale, conviene «gonfiare» la sezione, allontanando la parete dal centro: $\\Omega$ cresce e la tensione cala.
3. **Bredt dà la media nello spessore.** Per un tubo circolare la soluzione esatta (il cerchio cavo della lezione precedente) è lineare nello spessore; Bredt ne dà il valore medio, con un errore trascurabile se lo spessore è sottile.
4. **Con gli spigoli l'approssimazione peggiora.** Se la linea media non è regolare, per esempio in un tubo quadrato, negli spigoli la tensione si concentra: servono coefficienti di sicurezza maggiori o un'analisi locale, per esempio con il metodo degli elementi finiti (FEM).

Un controllo (deduzione): per un tubo circolare sottile di raggio medio $R$ e spessore $h$, $\\Omega=\\pi R^2$ e $\\bar\\tau_z=\\frac{M_z}{2\\pi R^2h}$; è ciò che dà $\\frac{M_z}{J_0}R$ con il momento polare della corona sottile, $J_0\\simeq2\\pi R^3h$.`,
      },
      {
        id: 'l76-8',
        kind: 'domanda',
        q: { id: 'l76-q2', kind: 'scelta', q: 'Che cos’è $\\Omega$ nella formula di Bredt?', options: ['L’area racchiusa dalla linea media della parete', 'L’area del materiale della sezione', 'Il momento polare d’inerzia', 'La lunghezza della linea media'], correct: 0, why: '$\\Omega$ nasce dalla somma dei triangolini con vertice nel polo $G$, che coprono la regione racchiusa dalla linea media, cavità compresa (Teo 5.8.7). L’area del materiale è la sola parete: confonderle è l’errore più comune.' },
      },
      {
        id: 'l76-9',
        kind: 'domanda',
        q: { id: 'l76-q3', kind: 'vf', q: 'Nella teoria di Bredt la tensione tangenziale è massima dove lo spessore della parete è massimo.', answer: false, why: 'Il flusso $\\bar\\tau_zh$ è costante, quindi la tensione è inversamente proporzionale allo spessore: è massima dove lo spessore è **minimo** (Teo 5.8.7, oss. 1). È l’opposto delle sezioni aperte, dove il massimo sta nel rettangolo più spesso.' },
      },
      {
        id: 'l76-10',
        kind: 'numeri',
        title: 'Il tubolare in numeri',
        md: `Torniamo al tubolare quadrato della lezione precedente, con lato $B=100$ mm, spessore $t=2$ mm e momento $M_z=1$ kN·m. Con la formula di Bredt (area racchiusa $\\Omega=(B-t)^2$) la sezione chiusa ha $\\tau\\approx${(TUBE.closed * 10).toFixed(1).replace('.', ',')}$ MPa. Tagliata e trattata come un unico rettangolo allungato di lunghezza $4(B-t)$, la sezione aperta ha $\\tau_{\\max}\\approx${(TUBE.open * 10).toFixed(0)}$ MPa. Sono valori di esempio calcolati dal motore, e il loro rapporto è quello del confronto omogeneo visto prima.`,
        values: { chiusa: Math.round(TUBE.closed * 100) / 10, aperta: Math.round(TUBE.open * 10) },
        visual: SVG('torsione', { tab: 'sottili' }),
      },
      {
        id: 'l76-11',
        kind: 'prova',
        title: 'Chiusa e aperta con le formule globali',
        md: 'Il diagramma confronta il tubolare chiuso, calcolato con Bredt, e quello tagliato, calcolato come rettangolo allungato. Muovi lo spessore e guarda le due tensioni nella tabella.',
        tasks: [
          'Raddoppia lo spessore da 2 a 4 mm: la tensione della chiusa si dimezza circa, perché è inversamente proporzionale a h.',
          'Con lo stesso raddoppio la tensione dell’aperta scende a circa un quarto, perché va con l’inverso del quadrato dello spessore.',
          'Nota che anche con lo spessore massimo la sezione aperta resta molto più sollecitata della chiusa.',
        ],
        visual: SVG('torsione', { tab: 'sottili' }),
      },
      {
        id: 'l76-12',
        kind: 'spiega',
        title: 'Attenzione a…',
        md: `Tre errori tipici sulle sezioni sottili.

1. **Usare l'area del materiale invece dell'area $\\Omega$ racchiusa dalla linea media.** Viene spontaneo perché in quasi tutte le formule delle tensioni compare l'area della sezione resistente. In Bredt, invece, $\\Omega$ viene dai triangolini con vertice nel polo, che coprono anche la cavità.
2. **Dimenticare che la tensione massima è dove lo spessore è minimo.** È la conseguenza diretta del flusso costante $\\bar\\tau_zh$; nelle sezioni aperte vale il contrario, e confonderle è facile.
3. **Applicare Bredt a sezioni aperte.** La dimostrazione usa una linea media **chiusa**: l'integrale sul giro completo dà $2\\Omega$, e il flusso circola tutto attorno. In una sezione aperta la tensione cambia verso nello spessore, e serve la formula dei rettangoli allungati.`,
      },
      {
        id: 'l76-13',
        kind: 'riassunto',
        md: `**Il filo della lezione.** Le sezioni sottili si trattano con formule approssimate. Una sezione aperta è un insieme di rettangoli allungati: la rigidezza va con il cubo degli spessori, e la tensione massima sta nel rettangolo più spesso. Per una sezione chiusa, Bredt suppone che la tensione media nello spessore sia tangente alla linea media e che il flusso $\\bar\\tau_zh$ sia costante, come la portata in un condotto; l'equilibrio alla rotazione dà allora il momento come flusso per il doppio dell'area racchiusa dalla linea media. La tensione è massima dove la parete è più sottile, e l'approssimazione è buona per spessori sottili e linee medie senza spigoli.

- Sottili aperte: $\\tau^i_{z,\\max}=\\frac{3M_z}{\\sum_jb_j^3h_j}\\,b_i$, massimo con $b_{\\max}$ (§5.8.9).
- Formula di Bredt: $M_z=\\bar\\tau_zh\\,2\\Omega$, cioè $\\bar\\tau_z(s)=\\frac{M_z}{2\\Omega h(s)}$ (Teo 5.8.7).
- Per l'orale: Jourawski per il taglio; Bredt per la torsione delle sottili chiuse; rettangoli allungati per le sottili aperte.`,
        orale: ['Sottili aperte e chiuse, Bredt. (dispensa, domanda 12, seconda parte)', 'Ricava la formula di Bredt e commentane le ipotesi.'],
      },
    ],
  },
];
