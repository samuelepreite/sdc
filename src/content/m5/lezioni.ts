/**
 * Lezioni guidate del Modulo 5 (Cap. 4, §4.12–4.16). Derivazioni solo dove la dispensa le sviluppa (ANALISI §4); le
 * righe con `val` sono verificate su 25 campioni casuali (tests/lezioni.test.ts). I numeri dei passi «numeri» vengono
 * dal motore. Le lezioni contengono anche tutto ciò che stava nella scheda del concetto (src/content/m5/concetti.ts).
 */
import { D } from '../../engine/types';
import * as T from '../../engine/tensor';
import * as El from '../../engine/elastico';
import { eigSym } from '../../engine/spettro';
import type { Lesson, LessonVisual } from '../types';

type R = Record<string, number>;
const SVG = (id: 'isotropia' | 'problema' | 'cammino', params?: Record<string, string | number | boolean>): LessonVisual => ({ kind: 'svg', id, params });

/** campione: μ > 0, λ con 2μ + 3λ > 0, due deformazioni simmetriche, due scalari */
const sample = (r: () => number): R => {
  const mu = 0.5 + 2 * r();
  const o: R = { mu, la: -0.6 * mu + 3 * r(), al: 4 * r() - 2, be: 4 * r() - 2 };
  for (const p of ['a', 'b'])
    for (let i = 0; i < 3; i++)
      for (let j = i; j < 3; j++) {
        const x = 2 * r() - 1;
        o[`${p}${3 * i + j}`] = x;
        o[`${p}${3 * j + i}`] = x;
      }
  return o;
};
const sym = (v: R, p: string): T.Mat => Array.from({ length: 9 }, (_, k) => v[`${p}${k}`]);
const A = (v: R) => El.lameTensor(v.mu, v.la);
const tech = (v: R) => El.techFromLame(v.mu, v.la);
const TT = (v: R) => El.stressIso(v.mu, v.la, sym(v, 'a'));
const phiE = (v: R, E: T.Mat) => El.energy(A(v), E);

/** numeri per l'acciaio (E = 205 000 MPa, ν = 0,3), come nel diagramma */
const ST = El.lameFromTech(205000, 0.3);
const STK = El.techFromLame(ST.mu, ST.lambda).K;
const r0 = (x: number) => Math.round(x);

export const M5_LEZIONI: Lesson[] = [
  // ================================================================== c5.1
  {
    concept: 'c5.1',
    title: 'Il teorema di Lamé e le sue conseguenze',
    minutes: 32,
    source: D(4, '4.12', 'Teo 4.12.1–4.12.4', '86–88'),
    visual: SVG('isotropia', { tab: 'provino' }),
    steps: [
      {
        id: 'l51-1',
        kind: 'spiega',
        title: 'Dove siamo e dove andiamo',
        md: `Nell'ultima lezione del modulo precedente, sulle simmetrie materiali e la notazione di Voigt, abbiamo visto che più un materiale è «simmetrico» meno costanti servono a descriverlo: 21 per il caso più generale, 9 per l'ortotropo, 5 per il trasversalmente isotropo e infine **2** per l'isotropo. Quella matrice di Voigt dell'isotropo, con i suoi blocchi di zeri, era il punto d'arrivo.

In questa lezione partiamo proprio da lì e ci chiediamo: **che forma ha il legame tra tensione e deformazione quando il materiale risponde allo stesso modo in tutte le direzioni?** È il caso dell'acciaio e, in prima approssimazione, del calcestruzzo: i materiali che userai per tutto il resto del corso.

Le tappe sono quattro. Prima scriviamo il legame (teorema di Lamé). Poi dimostriamo che un materiale isotropo ha sempre un'energia di deformazione. Poi invertiamo il legame, per sapere quale deformazione nasce da una tensione assegnata. Infine scopriamo che tensione e deformazione hanno le stesse direzioni principali (coassialità).`,
      },
      {
        id: 'l51-2',
        kind: 'spiega',
        title: 'Che cosa vuol dire «isotropo»?',
        md: `Un materiale è **isotropo** quando la sua risposta non dipende dalla direzione: se ruoti il provino prima di caricarlo, ottieni la stessa risposta ruotata allo stesso modo. Nel modulo precedente questa idea si scriveva così: una trasformazione ortogonale $\\tens Q$ (una rotazione o una riflessione) è **di simmetria** per il materiale se

$$\\mathbb A[\\tens Q\\tens E\\tens Q^T]=\\tens Q(\\mathbb A\\tens E)\\tens Q^T.$$

Leggila da sinistra a destra. $\\tens E$ è il tensore di deformazione infinitesima, $\\mathbb A$ il tensore elastico, che a una deformazione associa la tensione $\\tens T=\\mathbb A\\tens E$. A sinistra ruoti la deformazione e poi calcoli la tensione; a destra calcoli la tensione e poi la ruoti. Se i due risultati coincidono, il materiale «non si accorge» della rotazione.

Un materiale è **elastico lineare isotropo** quando questa uguaglianza vale per **ogni** $\\tens E$ simmetrico e per **ogni** $\\tens Q\\in\\mathrm{Orth}$, l'insieme dei tensori ortogonali (§4.12): nessuna direzione è privilegiata.`,
      },
      {
        id: 'l51-3',
        kind: 'spiega',
        title: 'Il teorema di Lamé: due costanti bastano',
        md: `Una richiesta così forte (ogni rotazione è di simmetria) restringe molto la forma che il legame può avere. Il risultato è il **Teorema 4.12.1 (di Lamé)**: se il materiale è isotropo, esistono due numeri reali $\\mu$ e $\\lambda$, le **costanti di Lamé**, tali che

$$\\tens T=2\\mu\\tens E+\\lambda(\\operatorname{tr}\\tens E)\\tens I.$$

Guardiamo i due pezzi. Il primo, $2\\mu\\tens E$, è la deformazione stessa moltiplicata per un numero: una tensione «parallela» alla deformazione. Il secondo contiene $\\operatorname{tr}\\tens E$, la traccia della deformazione, cioè la somma degli elementi diagonali $E_{11}+E_{22}+E_{33}$; dal Modulo 2 sai che è la dilatazione volumica $\\Theta$, la variazione relativa di volume. Questa traccia moltiplica $\\tens I$, il tensore identità: è quindi una tensione uguale in tutte le direzioni, come una pressione, proporzionale a quanto è cambiato il volume.

La dispensa enuncia il teorema e lo usa, senza riportarne la dimostrazione (p. 86): quindi all'orale si enuncia, non si dimostra (deduzione).`,
      },
      {
        id: 'l51-4',
        kind: 'spiega',
        title: 'Che cosa dice il legame, componente per componente?',
        md: `Per capire che cosa lega a che cosa, scriviamo il teorema di Lamé in componenti. Con $\\delta_{ij}$, la delta di Kronecker (vale 1 se $i=j$ e 0 altrimenti):

$$T_{ij}=2\\mu E_{ij}+\\lambda(E_{11}+E_{22}+E_{33})\\delta_{ij}.$$

Separiamo i due casi.
- **Componenti normali** ($i=j$): $T_{11}=2\\mu E_{11}+\\lambda(E_{11}+E_{22}+E_{33})$, e analoghe per 22 e 33. Ogni tensione normale dipende da **tutte e tre** le dilatazioni, attraverso la traccia.
- **Componenti tangenziali** ($i\\ne j$): la delta vale zero e resta $T_{12}=2\\mu E_{12}$, e analoghe. Ogni tensione tangenziale dipende **solo** dallo scorrimento omonimo.

È esattamente la struttura della matrice di Voigt dell'isotropo: i blocchi fuori diagonale (NE e SW) sono nulli, quindi il comportamento estensionale (tensioni normali e dilatazioni) e quello di scorrimento (tensioni tangenziali e scorrimenti) sono **disaccoppiati**. La delta di Kronecker è il modo compatto di scrivere quei blocchi di zeri.`,
      },
      {
        id: 'l51-5',
        kind: 'domanda',
        q: { id: 'l51-q2', kind: 'scelta', q: 'In un materiale isotropo imponi una deformazione con il solo scorrimento $E_{12}\\ne0$ (tutte le altre componenti nulle). Quali tensioni nascono?', options: ['Solo $T_{12}=T_{21}=2\\mu E_{12}$', 'Anche le normali $T_{11}$, $T_{22}$, $T_{33}$, attraverso $\\lambda$', 'Tutte le componenti di $\\tens T$', 'Nessuna, perché $\\operatorname{tr}\\tens E=0$'], correct: 0, why: 'Le tangenziali dipendono solo dallo scorrimento omonimo: $T_{12}=2\\mu E_{12}$. Le normali dipendono da $E_{12}$ solo attraverso la traccia, che qui è nulla: il termine con $\\lambda$ sparisce, ma il termine $2\\mu\\tens E$ resta, quindi «nessuna» è sbagliato.' },
      },
      {
        id: 'l51-6',
        kind: 'spiega',
        title: 'Un isotropo ha sempre un’energia?',
        md: `Nel modulo precedente hai incontrato il teorema sull'energia specifica: un materiale elastico lineare è **iperelastico**, cioè ha un'energia specifica di deformazione $\\varphi$, se e solo se il tensore elastico è simmetrico, $\\mathbb A=\\mathbb A^T$ (la cosiddetta simmetria maggiore). Per un materiale anisotropo questa è un'ipotesi in più: con essa le costanti scendono da 36 a 21.

Per l'isotropo ci chiediamo se serve la stessa ipotesi. La risposta della dispensa è no: il tensore di Lamé è **sempre** simmetrico (Teo 4.12.2). Per questo l'isotropo ha 2 costanti sia come elastico sia come iperelastico.

Che cosa dobbiamo dimostrare? Ricorda la definizione di trasposto di un tensore del quarto ordine: $\\mathbb A^T$ è quello per cui $\\mathbb A\\tens A\\cdot\\tens B=\\mathbb A^T\\tens B\\cdot\\tens A$ per ogni coppia di tensori. Il punto $\\cdot$ tra due tensori è il prodotto scalare, la somma dei prodotti delle componenti omonime, $\\tens A\\cdot\\tens B=A_{ij}B_{ij}$. Quindi $\\mathbb A=\\mathbb A^T$ equivale a dire che **scambiando le due deformazioni il numero $\\mathbb A\\tens E_1\\cdot\\tens E_2$ non cambia**.`,
      },
      {
        id: 'l51-7',
        kind: 'derivazione',
        title: 'Dimostrazione: il tensore di Lamé è simmetrico',
        md: 'Vogliamo arrivare a $\\mathbb A\\tens E_1\\cdot\\tens E_2=\\mathbb A\\tens E_2\\cdot\\tens E_1$ per ogni coppia di deformazioni simmetriche. L’idea è semplice: scriviamo il primo membro con il legame di Lamé, riordiniamo i pezzi finché non riconosciamo il legame di Lamé applicato a $\\tens E_2$. Il controllo numerico prende $\\mu$, $\\lambda$ e due deformazioni a caso.',
        source: D(4, '4.12.1', 'Teo 4.12.2', 87),
        der: {
          sample,
          lines: [
            { tex: '\\mathbb A\\tens E_1\\cdot\\tens E_2', why: `Partiamo dal numero che vogliamo confrontare: la tensione prodotta da $\\tens E_1$, moltiplicata scalarmente per $\\tens E_2$.`, val: (v) => T.ddot(T.apply4(A(v), sym(v, 'a')), sym(v, 'b')) },
            {
              tex: '=2\\mu\\,\\tens E_1\\cdot\\tens E_2+\\lambda(\\operatorname{tr}\\tens E_1)\\,\\tens I\\cdot\\tens E_2',
              why: `Al posto di $\\mathbb A\\tens E_1$ scriviamo il legame di Lamé, $2\\mu\\tens E_1+\\lambda(\\operatorname{tr}\\tens E_1)\\tens I$, e distribuiamo il prodotto scalare sui due addendi. Gli scalari $2\\mu$ e $\\lambda\\operatorname{tr}\\tens E_1$ escono dal prodotto.`,
              val: (v) => 2 * v.mu * T.ddot(sym(v, 'a'), sym(v, 'b')) + v.la * T.trace(sym(v, 'a')) * T.ddot(T.I3, sym(v, 'b')),
            },
            {
              tex: '=2\\mu\\,\\tens E_2\\cdot\\tens E_1+\\lambda(\\operatorname{tr}\\tens E_1)\\,\\tens I\\cdot\\tens E_2',
              why: `Nel primo addendo scambiamo i due fattori: il prodotto scalare tra tensori è commutativo, perché $A_{ij}B_{ij}=B_{ij}A_{ij}$. Il secondo addendo resta com'è.`,
              aggiunto: true,
              val: (v) => 2 * v.mu * T.ddot(sym(v, 'b'), sym(v, 'a')) + v.la * T.trace(sym(v, 'a')) * T.ddot(T.I3, sym(v, 'b')),
            },
            {
              tex: '=2\\mu\\,\\tens E_2\\cdot\\tens E_1+\\lambda(\\operatorname{tr}\\tens E_1)(\\operatorname{tr}\\tens E_2)',
              why: `Ora il secondo addendo: il prodotto scalare dell'identità con un tensore è la sua traccia, $\\tens I\\cdot\\tens E_2=\\operatorname{tr}\\tens E_2$. A questo punto l'espressione è **simmetrica**: scambiando i pedici 1 e 2 non cambia nulla.`,
              ask: { q: 'Quanto vale $\\tens I\\cdot\\tens E_2$?', options: ['$\\operatorname{tr}\\tens E_2$', '$\\det\\tens E_2$', '$|\\tens E_2|$', '$3$'], correct: 0, why: '$\\tens I\\cdot\\tens A=\\delta_{ij}A_{ij}$: la delta tiene solo i termini con $i=j$, cioè $A_{11}+A_{22}+A_{33}$, la traccia. Il determinante è un prodotto, non una somma; il modulo è $\\sqrt{\\tens A\\cdot\\tens A}$; 3 è la traccia di $\\tens I$, non di $\\tens E_2$.' },
              val: (v) => 2 * v.mu * T.ddot(sym(v, 'b'), sym(v, 'a')) + v.la * T.trace(sym(v, 'a')) * T.trace(sym(v, 'b')),
            },
            {
              tex: '=2\\mu\\,\\tens E_2\\cdot\\tens E_1+\\lambda(\\operatorname{tr}\\tens E_2)\\,\\tens I\\cdot\\tens E_1',
              why: `Facciamo il percorso inverso sull'altra traccia: riscriviamo $\\operatorname{tr}\\tens E_1$ come $\\tens I\\cdot\\tens E_1$. È la stessa identità di prima, letta al contrario.`,
              val: (v) => 2 * v.mu * T.ddot(sym(v, 'b'), sym(v, 'a')) + v.la * T.trace(sym(v, 'b')) * T.ddot(T.I3, sym(v, 'a')),
            },
            {
              tex: '=\\big[2\\mu\\tens E_2+\\lambda(\\operatorname{tr}\\tens E_2)\\tens I\\big]\\cdot\\tens E_1=\\mathbb A\\tens E_2\\cdot\\tens E_1',
              why: `Raccogliamo $\\tens E_1$ a destra: tra parentesi quadre c'è proprio il legame di Lamé applicato a $\\tens E_2$, cioè $\\mathbb A\\tens E_2$. Siamo arrivati: per la definizione di trasposto, $\\mathbb A=\\mathbb A^T$.`,
              val: (v) => T.ddot(T.apply4(A(v), sym(v, 'b')), sym(v, 'a')),
              eq: 'Teo 4.12.2',
            },
          ],
        },
      },
      {
        id: 'l51-8',
        kind: 'spiega',
        title: 'Che cosa abbiamo dimostrato',
        md: `Il risultato si legge così: **un materiale elastico lineare isotropo è sempre iperelastico**. Il motivo profondo sta nella forma del legame: i due ingredienti, $\\tens E_1\\cdot\\tens E_2$ e $(\\operatorname{tr}\\tens E_1)(\\operatorname{tr}\\tens E_2)$, sono già simmetrici negli argomenti, quindi non c'è nulla da imporre.

Prova il risultato su un caso semplice (esempio aggiunto): prendi $\\tens E_1=\\tens I$. Allora $\\mathbb A\\tens I=2\\mu\\tens I+3\\lambda\\tens I$ (perché $\\operatorname{tr}\\tens I=3$) e $\\mathbb A\\tens I\\cdot\\tens E_2=(2\\mu+3\\lambda)\\operatorname{tr}\\tens E_2$. Dall'altra parte $\\mathbb A\\tens E_2\\cdot\\tens I$ è la traccia di $\\mathbb A\\tens E_2$, cioè $2\\mu\\operatorname{tr}\\tens E_2+3\\lambda\\operatorname{tr}\\tens E_2$: lo stesso numero.

La conseguenza pratica è che per un isotropo esiste sempre l'energia specifica $\\varphi$, e la scriveremo nella lezione «Energia e restrizioni di plausibilità» (§4.14). Per gli anisotropi, invece, elastico e iperelastico restano due casi diversi (36 costanti contro 21).`,
      },
      {
        id: 'l51-9',
        kind: 'spiega',
        title: 'Perché vogliamo invertire il legame',
        md: `Il teorema di Lamé risponde alla domanda «data la deformazione, quale tensione?». Nelle prove di laboratorio però succede spesso il contrario: si **conosce la tensione** (per esempio una forza nota divisa per l'area del provino) e si vuole sapere **quale deformazione** produce. Serve il legame inverso, $\\tens E=\\mathbb A^{-1}\\tens T$.

Possiamo invertire? Sì, perché si dà per scontato che nei materiali $\\mathbb A\\in\\mathrm{Pos}^+$, cioè $\\mathbb A\\tens A\\cdot\\tens A>0$ per ogni tensore non nullo (definita positività). Dal Modulo 1 sai che un tensore del quarto ordine definito positivo è invertibile. Questo vale per ogni classe di simmetria, non solo per gli isotropi (§4.12.2).

Per l'isotropo possiamo anche scrivere l'inverso in forma esplicita. La difficoltà è che nel legame di Lamé $\\tens E$ compare due volte: da sola e dentro la traccia. L'idea è **calcolare prima la traccia**, che è un solo numero, e poi sostituirla.`,
      },
      {
        id: 'l51-10',
        kind: 'derivazione',
        title: 'Il legame inverso, passo per passo',
        md: 'Vogliamo arrivare a $\\tens E$ scritto solo in funzione di $\\tens T$. Strategia: isoliamo $\\tens E$ (resta una traccia di $\\tens E$ a secondo membro), ricaviamo quella traccia applicando la traccia al legame di Lamé, sostituiamo. Il controllo numerico segue la componente 11.',
        source: D(4, '4.12.2', 'Prop 4.12.3', 87),
        der: {
          sample,
          lines: [
            { tex: 'E_{11}', why: `Il valore da ritrovare: la componente 11 della deformazione del campione.`, val: (v) => sym(v, 'a')[0] },
            {
              tex: '2\\mu\\tens E=\\tens T-\\lambda(\\operatorname{tr}\\tens E)\\tens I',
              why: `Nel legame di Lamé $\\tens T=2\\mu\\tens E+\\lambda(\\operatorname{tr}\\tens E)\\tens I$ portiamo il termine con la traccia dall'altra parte: è una semplice sottrazione ai due membri.`,
              aggiunto: true,
            },
            {
              tex: '\\tens E=\\frac1{2\\mu}\\tens T-\\frac{\\lambda}{2\\mu}(\\operatorname{tr}\\tens E)\\tens I',
              why: `Dividiamo per $2\\mu$ (lecito se $\\mu\\ne0$). $\\tens E$ è isolato, ma a destra resta $\\operatorname{tr}\\tens E$, ancora incognita: dobbiamo esprimerla con $\\tens T$.`,
              val: (v) => TT(v)[0] / (2 * v.mu) - (v.la / (2 * v.mu)) * T.trace(sym(v, 'a')),
            },
            {
              tex: '\\operatorname{tr}\\tens T=2\\mu\\operatorname{tr}\\tens E+\\lambda(\\operatorname{tr}\\tens E)\\operatorname{tr}\\tens I=2\\mu\\operatorname{tr}\\tens E+3\\lambda\\operatorname{tr}\\tens E',
              why: `Torniamo al legame di Lamé e prendiamo la traccia di entrambi i membri. La traccia è lineare (la traccia di una somma è la somma delle tracce, gli scalari escono), e $\\operatorname{tr}\\tens I=3$.`,
              ask: { q: 'Che cosa si fa per liberarsi di $\\operatorname{tr}\\tens E$?', options: ['Si applica la traccia al legame di Lamé', 'Si calcola il determinante del legame', 'Si moltiplica scalarmente il legame per $\\tens E$', 'Si usa la coassialità'], correct: 0, why: 'La traccia trasforma un’equazione tra tensori in un’equazione tra numeri in cui l’unica incognita è $\\operatorname{tr}\\tens E$. Il determinante non è lineare e complicherebbe tutto; il prodotto per $\\tens E$ fa comparire $\\tens E\\cdot\\tens E$, un’incognita nuova; la coassialità riguarda le direzioni principali, non la traccia.' },
            },
            {
              tex: '\\operatorname{tr}\\tens T=(2\\mu+3\\lambda)\\operatorname{tr}\\tens E',
              why: `Raccogliamo $\\operatorname{tr}\\tens E$. Ora la traccia della tensione e quella della deformazione sono legate da un solo numero.`,
            },
            {
              tex: '\\operatorname{tr}\\tens E=\\frac{\\operatorname{tr}\\tens T}{2\\mu+3\\lambda}',
              why: `Dividiamo per $2\\mu+3\\lambda$, lecito se questo numero non è nullo. Abbiamo la traccia incognita in funzione della tensione.`,
            },
            {
              tex: '\\tens E=\\frac1{2\\mu}\\tens T-\\frac{\\lambda}{2\\mu}\\,\\frac{\\operatorname{tr}\\tens T}{2\\mu+3\\lambda}\\,\\tens I',
              why: `Sostituiamo questa traccia nell'espressione di $\\tens E$ trovata due righe sopra.`,
              aggiunto: true,
              val: (v) => TT(v)[0] / (2 * v.mu) - (v.la / (2 * v.mu)) * (T.trace(TT(v)) / (2 * v.mu + 3 * v.la)),
            },
            {
              tex: '\\tens E=\\frac1{2\\mu}\\tens T-\\frac{\\lambda}{2\\mu(2\\mu+3\\lambda)}(\\operatorname{tr}\\tens T)\\tens I',
              why: `Moltiplichiamo tra loro le due frazioni del secondo termine, $\\frac{\\lambda}{2\\mu}\\cdot\\frac1{2\\mu+3\\lambda}$, e otteniamo un solo coefficiente. È il legame costitutivo inverso, valido con $\\mu\\ne0$ e $2\\mu+3\\lambda\\ne0$, condizioni coerenti con $\\mathbb A\\in\\mathrm{Pos}^+$.`,
              val: (v) => TT(v)[0] / (2 * v.mu) - (v.la / (2 * v.mu * (2 * v.mu + 3 * v.la))) * T.trace(TT(v)),
              eq: 'Prop 4.12.3',
            },
          ],
          checks: [{ what: '$\\operatorname{tr}\\tens T=(2\\mu+3\\lambda)\\operatorname{tr}\\tens E$', f: (v) => [T.trace(TT(v)), (2 * v.mu + 3 * v.la) * T.trace(sym(v, 'a'))] }],
        },
      },
      {
        id: 'l51-11',
        kind: 'spiega',
        title: 'Il legame inverso su un caso semplice',
        md: `Il legame inverso ha la stessa struttura di quello diretto: un termine proporzionale a $\\tens T$ e un termine «di pressione» proporzionale a $(\\operatorname{tr}\\tens T)\\tens I$. Cambiano solo i coefficienti.

Mettiamolo alla prova (esempio aggiunto) con una compressione uguale in tutte le direzioni, $\\tens T=-p\\,\\tens I$, come quella di un oggetto immerso in acqua. Allora $\\operatorname{tr}\\tens T=-3p$ e
$$\\tens E=-\\frac{p}{2\\mu}\\tens I+\\frac{3\\lambda p}{2\\mu(2\\mu+3\\lambda)}\\tens I=-\\frac{p}{2\\mu+3\\lambda}\\tens I.$$
La deformazione è anch'essa proporzionale all'identità: il cubetto si accorcia allo stesso modo nelle tre direzioni, senza distorcersi. È quello che ci si aspetta da un materiale che non ha direzioni privilegiate.

Il numero $2\\mu+3\\lambda$ che compare qui sarà protagonista del prossimo passo.`,
      },
      {
        id: 'l51-12',
        kind: 'spiega',
        title: 'Il modulo di comprimibilità volumetrica',
        md: `La dispensa trae dal legame inverso due osservazioni (p. 87–88).

**Prima: le dimensioni.** $\\operatorname{tr}\\tens E=\\Theta$, la dilatazione volumica, è un numero puro (rapporto tra volumi). La traccia della tensione ha le dimensioni di una forza su una superficie, $[F][L^{-2}]$. Poiché $\\operatorname{tr}\\tens E=\\operatorname{tr}\\tens T/(2\\mu+3\\lambda)$, anche $2\\mu+3\\lambda$ deve essere una tensione: le costanti di Lamé si misurano in Pascal (deduzione).

**Seconda: il volume.** La traccia della tensione è $\\sigma_1+\\sigma_2+\\sigma_3=3\\sigma_m$, dove $\\sigma_m$ è la **tensione normale media**. Sostituendo,
$$\\Theta=\\frac{3\\sigma_m}{2\\mu+3\\lambda}=\\frac{\\sigma_m}{K},\\qquad K:=\\frac{2\\mu+3\\lambda}3.$$
$K$ si chiama **modulo di comprimibilità volumetrica** (bulk modulus). La formula dice una cosa notevole: **la variazione di volume dipende solo dalla tensione normale media**, non da come la tensione è distribuita tra le direzioni né dalle tensioni tangenziali (deduzione). Più $K$ è grande, più il materiale resiste a cambiare volume (deduzione).`,
      },
      {
        id: 'l51-13',
        kind: 'domanda',
        q: { id: 'l51-q1', kind: 'scelta', q: 'Il modulo di comprimibilità $K$ lega…', options: ['la dilatazione volumica $\\Theta$ alla tensione normale media $\\sigma_m$', 'lo scorrimento alla tensione tangenziale', 'la dilatazione longitudinale alla tensione monoassiale', 'l’energia alla deformazione'], correct: 0, why: '§4.12.2: $\\Theta=\\sigma_m/K$, con $K=(2\\mu+3\\lambda)/3$. Le altre coppie esistono ma hanno altri moduli: lo scorrimento è governato da $\\mu$ (che diventerà $G$), la dilatazione longitudinale dal modulo di Young $E$, che vedremo nella lezione «I moduli tecnici».' },
      },
      {
        id: 'l51-14',
        kind: 'spiega',
        title: 'Tensione e deformazione hanno le stesse direzioni principali?',
        md: `Ricorda dai moduli 2 e 3 che cos'è una **direzione principale**: un versore $\\hat m$ che il tensore trasforma in un multiplo di sé stesso, cioè un autovettore. Per la deformazione, $\\tens E\\hat m=e\\,\\hat m$: la fibra lungo $\\hat m$ si allunga o si accorcia senza ruotare rispetto alle altre direzioni principali. Per la tensione, $\\tens T\\hat m=s\\,\\hat m$: sulla giacitura di normale $\\hat m$ agisce solo tensione normale.

In generale tensione e deformazione hanno ciascuna la propria terna principale, e non c'è motivo che coincidano. Il **Teorema 4.12.4 (coassialità)** dice che per un isotropo invece coincidono, purché $\\tens T$ e $\\tens E$ non siano casuali ma l'uno sia l'effetto dell'altro attraverso il legame. Si può allora parlare di **riferimento principale** comune.

L'idea della dimostrazione: prendiamo una direzione principale della deformazione, applichiamo $\\tens T$ attraverso il legame di Lamé, e vediamo che il risultato è ancora un multiplo di $\\hat m$.`,
      },
      {
        id: 'l51-15',
        kind: 'derivazione',
        title: 'Dimostrazione della coassialità',
        md: 'Ipotesi: $\\hat m$ è direzione principale di $\\tens E$, cioè $\\tens E\\hat m=e\\hat m$ per un certo numero $e$. Tesi: esiste un numero $s$ con $\\tens T\\hat m=s\\hat m$. Il controllo numerico prende un autovettore della deformazione del campione.',
        source: D(4, '4.12.3', 'Teo 4.12.4', 88),
        der: {
          sample,
          lines: [
            { tex: '\\tens T\\hat m=\\big[2\\mu\\tens E+\\lambda(\\operatorname{tr}\\tens E)\\tens I\\big]\\hat m', why: `Applichiamo la tensione al versore $\\hat m$, scrivendo $\\tens T$ con il legame di Lamé.` },
            {
              tex: '=2\\mu\\,\\tens E\\hat m+\\lambda(\\operatorname{tr}\\tens E)\\,\\tens I\\hat m',
              why: `Distribuiamo: un tensore somma applicato a un vettore dà la somma delle applicazioni, e gli scalari escono.`,
              aggiunto: true,
            },
            { tex: '=2\\mu e\\,\\hat m+\\lambda(\\operatorname{tr}\\tens E)\\,\\hat m', why: `Usiamo l'ipotesi $\\tens E\\hat m=e\\hat m$ nel primo addendo, e il fatto che l'identità lascia invariato ogni vettore, $\\tens I\\hat m=\\hat m$, nel secondo.` },
            {
              tex: '=\\big(2\\mu e+\\lambda\\operatorname{tr}\\tens E\\big)\\hat m=s\\,\\hat m',
              why: `Raccogliamo $\\hat m$. Il coefficiente tra parentesi è un numero, che chiamiamo $s$: quindi $\\hat m$ è autovettore anche di $\\tens T$, con autovalore $s=2\\mu e+\\lambda\\operatorname{tr}\\tens E$.`,
              eq: 'Teo 4.12.4',
            },
          ],
          checks: [
            {
              what: '$\\tens T\\hat m=s\\hat m$ sulla prima componente',
              f: (v) => {
                const E = sym(v, 'a');
                const { values, vectors } = eigSym(E);
                const m = vectors[0];
                const s = 2 * v.mu * values[0] + v.la * T.trace(E);
                return [T.apply(TT(v), m)[0], s * m[0]];
              },
            },
          ],
        },
      },
      {
        id: 'l51-16',
        kind: 'spiega',
        title: 'Quando la coassialità manca',
        md: `La dimostrazione ha usato un solo fatto: nel legame di Lamé $\\tens E$ compare «da sola», moltiplicata per un numero, e il resto è un multiplo dell'identità. Entrambi i pezzi rispettano le direzioni principali di $\\tens E$. In più la dimostrazione dà anche il valore della tensione principale: $s=2\\mu e+\\lambda\\operatorname{tr}\\tens E$, cioè la stessa formula della componente normale $T_{11}$, scritta nel riferimento principale (deduzione).

Per un materiale non isotropo la coassialità **non è garantita**. La dispensa avverte di un rischio concreto: i programmi di calcolo spesso la presumono, e possono sbagliare con materiali anisotropi se in qualche parte del codice l'ipotesi non è stata rimossa.

L'esempio fisico (p. 88): una piccola sfera di materiale isotropo in compressione isotropa, per esempio immersa sott'acqua (trascurando la variazione della pressione con la profondità), diventa una sfera più piccola, omotetica a quella di partenza. Se il materiale fosse trasversalmente isotropo diventerebbe un **ellissoide**: la stessa pressione in tutte le direzioni produrrebbe accorciamenti diversi.`,
      },
      {
        id: 'l51-17',
        kind: 'prova',
        title: 'Il provino isotropo',
        md: 'Il diagramma applica una trazione $\\sigma$ al provino (tratteggio: prima; azzurro: dopo, con spostamenti amplificati) e calcola le deformazioni con il legame inverso. Guarda la tabella sotto il disegno mentre muovi i cursori.',
        tasks: [
          'Il cursore ν regola il coefficiente di Poisson, che definiremo nella lezione «I moduli tecnici» (§4.13.1): per ora lascialo al valore iniziale e osserva il disegno: il provino si allunga lungo il carico e si contrae nelle due direzioni trasversali, della stessa quantità. Le due contrazioni uguali sono la firma dell’isotropia: nessuna direzione trasversale è privilegiata.',
          'Nota che il rettangolo azzurro resta un rettangolo con i lati paralleli a quelli tratteggiati: gli assi del provino sono direzioni principali sia della tensione sia della deformazione. È la coassialità.',
          'Leggi nella tabella $\\Theta$: dipende solo da $\\sigma$, che qui è tre volte la tensione normale media. È la formula $\\Theta=\\sigma_m/K$.',
        ],
        visual: SVG('isotropia', { tab: 'provino' }),
      },
      {
        id: 'l51-18',
        kind: 'domanda',
        q: { id: 'l51-q3', kind: 'vf', q: 'Per un materiale anisotropo le direzioni principali di tensione e di deformazione coincidono sempre, purché $\\tens T=\\mathbb A\\tens E$.', answer: false, why: 'Il Teo 4.12.4 vale per gli isotropi, e la dimostrazione usa proprio la forma del legame di Lamé. Per un anisotropo la coassialità non è garantita (§4.12.3): una sferetta trasversalmente isotropa sotto pressione uniforme diventa un ellissoide.' },
      },
      {
        id: 'l51-19',
        kind: 'spiega',
        title: 'Attenzione a…',
        md: `Tre errori ricorrono su questo argomento.

1. **Pensare che la coassialità valga sempre.** È tentante, perché in tutti gli esercizi con l'acciaio le direzioni principali di tensione e deformazione coincidono. Ma è una proprietà degli isotropi, che discende dalla forma del legame di Lamé; per un anisotropo non vale, e darla per scontata è proprio l'errore che la dispensa attribuisce ai programmi di calcolo.
2. **Dimenticare che per gli isotropi elastico e iperelastico coincidono.** Per gli anisotropi la simmetria maggiore è un'ipotesi in più (36 costanti contro 21); per gli isotropi è un teorema (Teo 4.12.2), e le costanti sono 2 in entrambi i casi.
3. **Cercare un significato fisico diretto in $\\lambda$.** Le costanti di Lamé rendono il legame semplice da scrivere, ma $\\lambda$ non ha un'interpretazione fisica diretta, perché non gli si può associare il risultato di una prova, e $\\mu$ ne ha poca (§4.13). È proprio questo il motivo per cui nella lezione seguente, «I moduli tecnici», introdurremo moduli legati alle prove.`,
      },
      {
        id: 'l51-20',
        kind: 'riassunto',
        md: `**Il filo della lezione.** Un materiale isotropo risponde allo stesso modo in tutte le direzioni, e questa richiesta basta a ridurre il legame a due costanti: $\\tens T=2\\mu\\tens E+\\lambda(\\operatorname{tr}\\tens E)\\tens I$, con le tensioni normali legate a tutte le dilatazioni e le tangenziali solo allo scorrimento omonimo. Poiché il legame è costruito con pezzi simmetrici, il tensore elastico è sempre simmetrico e quindi l'isotropo è sempre iperelastico. Applicando la traccia al legame si ricava la traccia della deformazione e, sostituendo, il legame inverso; da qui si vede che la variazione di volume dipende solo dalla tensione normale media, attraverso il modulo $K$. Infine, applicando il legame a una direzione principale della deformazione si scopre che è principale anche per la tensione.

- Lamé: $\\tens T=2\\mu\\tens E+\\lambda(\\operatorname{tr}\\tens E)\\tens I$ (Teo 4.12.1).
- Isotropo, quindi iperelastico: $\\mathbb A\\tens E_1\\cdot\\tens E_2=2\\mu\\tens E_1\\cdot\\tens E_2+\\lambda\\operatorname{tr}\\tens E_1\\operatorname{tr}\\tens E_2=\\mathbb A\\tens E_2\\cdot\\tens E_1$ (Teo 4.12.2).
- Inverso: $\\tens E=\\frac1{2\\mu}\\tens T-\\frac{\\lambda}{2\\mu(2\\mu+3\\lambda)}(\\operatorname{tr}\\tens T)\\tens I$ (Prop 4.12.3).
- $\\Theta=\\sigma_m/K$, $K=(2\\mu+3\\lambda)/3$ (§4.12.2).
- Coassialità: $\\tens E\\hat m=e\\hat m\\Rightarrow\\tens T\\hat m=(2\\mu e+\\lambda\\operatorname{tr}\\tens E)\\hat m$ (Teo 4.12.4).`,
        orale: ['Teorema di Lamé; dimostrare che l’isotropo è iperelastico; legame inverso; bulk modulus; coassialità. (dispensa, domanda 11)'],
      },
    ],
  },
  // ================================================================== c5.2
  {
    concept: 'c5.2',
    title: 'I moduli tecnici',
    minutes: 32,
    source: D(4, '4.13', undefined, '88–90'),
    visual: SVG('isotropia', { tab: 'provino' }),
    steps: [
      {
        id: 'l52-1',
        kind: 'spiega',
        title: 'Dove siamo e dove andiamo',
        md: `Nella lezione precedente abbiamo scritto il legame dell'isotropo con le costanti di Lamé, $\\mu$ e $\\lambda$, e lo abbiamo invertito: $\\tens E=\\frac1{2\\mu}\\tens T-\\frac{\\lambda}{2\\mu(2\\mu+3\\lambda)}(\\operatorname{tr}\\tens T)\\tens I$. Matematicamente è tutto a posto. Ma se vai in laboratorio con un provino d'acciaio, nessuna prova ti restituisce «$\\lambda$».

La domanda di questa lezione è quindi: **quali numeri misura davvero l'ingegnere, e come si collegano a $\\mu$ e $\\lambda$?** Sono i **moduli tecnici**.

Le tappe: con una prova di trazione ricaviamo il modulo di Young $E$ e il coefficiente di Poisson $\\nu$; con uno scorrimento semplice il modulo di elasticità tangenziale $G$; poi scopriamo che i tre non sono indipendenti, $E=2G(1+\\nu)$; infine riscriviamo i legami diretto e inverso con i moduli tecnici, che sono quelli che userai negli esercizi.`,
      },
      {
        id: 'l52-2',
        kind: 'spiega',
        title: 'Perché le costanti di Lamé non bastano all’ingegnere',
        md: `I moduli di Lamé permettono di scrivere il legame nel modo più semplice, ma hanno poca interpretazione fisica diretta: $\\lambda$ non ne ha, perché non gli si può associare il risultato di una prova, e $\\mu$ ne ha poca (§4.13).

I **moduli tecnici** nascono al contrario: si sceglie un esperimento semplice, si guarda che cosa succede al provino, e si chiama «modulo» il numero che descrive quella risposta. L'ingegnere fa l'esperimento, misura una quantità e tende a usare quella. Si passa così dalla formulazione matematicamente più comoda a una formulazione ingegneristica.

Il metodo che useremo è lo stesso in entrambe le prove di questa lezione, ed è bene averlo chiaro prima di cominciare: **nella prova conosciamo la tensione**, perché sappiamo che forza applichiamo e su quale area. Quindi usiamo il **legame inverso**, che dalla tensione dà la deformazione, e leggiamo nei coefficienti i moduli tecnici.`,
      },
      {
        id: 'l52-3',
        kind: 'spiega',
        title: 'La prova di trazione in linguaggio tensoriale',
        md: `Prendi un provino in trazione, come nella prova sull'acciaio del modulo precedente. Nel tratto utile, lontano dagli afferraggi, la tensione è **monoassiale**: c'è solo una tensione normale $s$ lungo l'asse del provino, che prendiamo come direzione $\\hat e_1$. Con l'ipotesi di carico distribuito uniformemente, $s=F/A_0$: la forza divisa per l'area iniziale della sezione.

In matrice:
$$[\\tens T]=\\begin{bmatrix}s&0&0\\\\0&0&0\\\\0&0&0\\end{bmatrix},\\qquad\\operatorname{tr}\\tens T=s.$$

Sostituiamo nel legame inverso. Il primo termine, $\\frac1{2\\mu}\\tens T$, ha solo la componente 11; il secondo, proporzionale a $(\\operatorname{tr}\\tens T)\\tens I=s\\tens I$, ha tre componenti diagonali uguali. Quindi la deformazione è diagonale: niente scorrimenti, solo dilatazioni lungo i tre assi. Calcoliamo prima quella lungo il carico.`,
      },
      {
        id: 'l52-4',
        kind: 'derivazione',
        title: 'La dilatazione lungo il carico: nasce E',
        md: 'Vogliamo scrivere $E_{11}$ come «tensione divisa per un numero», per dare un nome a quel numero. Strategia: mettiamo i due termini del legame inverso sotto un solo denominatore e semplifichiamo. Il campione usa la $T_{11}$ di una tensione a caso come valore di $s$.',
        source: D(4, '4.13.1', undefined, '88–89'),
        der: {
          sample,
          lines: [
            {
              tex: 'E_{11}=\\frac{s}{2\\mu}-\\frac{\\lambda s}{2\\mu(2\\mu+3\\lambda)}',
              why: `Componente 11 del legame inverso: dal primo termine viene $s/(2\\mu)$, dal secondo $-\\lambda\\,\\operatorname{tr}\\tens T/(2\\mu(2\\mu+3\\lambda))$ con $\\operatorname{tr}\\tens T=s$.`,
              val: (v) => El.strainIso(tech(v).E, tech(v).nu, [TT(v)[0], 0, 0, 0, 0, 0, 0, 0, 0])[0],
            },
            {
              tex: '=\\frac{(2\\mu+3\\lambda)\\,s}{2\\mu(2\\mu+3\\lambda)}-\\frac{\\lambda s}{2\\mu(2\\mu+3\\lambda)}',
              why: `Portiamo le due frazioni allo stesso denominatore, $2\\mu(2\\mu+3\\lambda)$: la prima frazione va moltiplicata sopra e sotto per $2\\mu+3\\lambda$, la seconda ha già quel denominatore. Il valore non cambia, perché abbiamo moltiplicato per $1$.`,
              aggiunto: true,
              val: (v) => (TT(v)[0] * (2 * v.mu + 3 * v.la)) / (2 * v.mu * (2 * v.mu + 3 * v.la)) - (v.la * TT(v)[0]) / (2 * v.mu * (2 * v.mu + 3 * v.la)),
            },
            {
              tex: '=\\frac{2\\mu+3\\lambda-\\lambda}{2\\mu(2\\mu+3\\lambda)}\\,s=\\frac{2\\mu+2\\lambda}{2\\mu(2\\mu+3\\lambda)}\\,s',
              why: `Ora che il denominatore è lo stesso, sottraiamo i numeratori: $(2\\mu+3\\lambda)-\\lambda=2\\mu+2\\lambda$.`,
              val: (v) => (TT(v)[0] * (2 * v.mu + 2 * v.la)) / (2 * v.mu * (2 * v.mu + 3 * v.la)),
            },
            {
              tex: '=\\frac{\\mu+\\lambda}{\\mu(2\\mu+3\\lambda)}\\,s',
              why: `Semplifichiamo il 2 tra numeratore e denominatore.`,
              val: (v) => (TT(v)[0] * (v.mu + v.la)) / (v.mu * (2 * v.mu + 3 * v.la)),
            },
            {
              tex: '=\\frac sE,\\qquad E:=\\frac{\\mu(2\\mu+3\\lambda)}{\\mu+\\lambda}',
              why: `Diamo un nome all'inverso del coefficiente: è il **modulo di Young** $E$. Chiamando $\\varepsilon_1=E_{11}$ la dilatazione lungo $\\hat e_1$, si ha $\\varepsilon_1=s/E$, cioè $s=E\\varepsilon_1$: la legge di Hooke.`,
              val: (v) => TT(v)[0] / tech(v).E,
              eq: '§4.13.1',
            },
          ],
          checks: [
            {
              what: '$E_{22}=-\\frac{\\lambda s}{2\\mu(2\\mu+3\\lambda)}=-\\nu\\frac sE$ con $\\nu=\\frac{\\lambda}{2(\\mu+\\lambda)}$',
              f: (v) => {
                const s = TT(v)[0];
                const { E, nu } = tech(v);
                return [-(v.la * s) / (2 * v.mu * (2 * v.mu + 3 * v.la)), (-nu * s) / E];
              },
            },
          ],
        },
      },
      {
        id: 'l52-5',
        kind: 'spiega',
        title: 'Che cosa misura il modulo di Young',
        md: `Il risultato $\\varepsilon_1=s/E$ dice che, in una prova di trazione, **la dilatazione lungo il carico è la tensione divisa per $E$**. È la legge di Hooke $\\sigma=E\\varepsilon$ che conosci dal tratto elastico della curva tensione-deformazione: $E$ è la pendenza di quel tratto. Per questo $E$ si chiama anche **modulo di elasticità longitudinale**.

Attenzione ai simboli: la dispensa usa la stessa lettera per due cose diverse. $E$ da sola è il modulo di Young, un numero; $\\tens E$ è il tensore di deformazione, e le sue componenti $E_{11}$, $E_{22}$, $E_{12}$ si riconoscono dai due pedici. Per questo scriviamo spesso $\\varepsilon_1$ al posto di $E_{11}$.

Le dimensioni: $\\varepsilon$ è un numero puro, quindi $[E]=[s]/[\\varepsilon]=[F][L^{-2}]$, una tensione. Si misura in Pascal, di solito in MPa o GPa.

Controlliamo la formula su un caso (esempio aggiunto): se $\\lambda=0$, il legame di Lamé si riduce a $\\tens T=2\\mu\\tens E$ e la formula dà $E=\\mu\\cdot2\\mu/\\mu=2\\mu$. In effetti con $\\lambda=0$ la componente 11 del legame è $T_{11}=2\\mu E_{11}$, cioè $s=2\\mu\\varepsilon_1$: lo stesso risultato.`,
      },
      {
        id: 'l52-6',
        kind: 'spiega',
        title: 'Che cosa succede di lato: il coefficiente di Poisson',
        md: `Ora le due direzioni trasversali. Lì il primo termine del legame inverso non contribuisce (la tensione ha solo la componente 11), e resta il secondo:
$$E_{22}=E_{33}=-\\frac{\\lambda s}{2\\mu(2\\mu+3\\lambda)}.$$
La dispensa riscrive questo coefficiente come multiplo di $s/E$, definendo il **coefficiente di Poisson** $\\nu:=\\frac{\\lambda}{2(\\mu+\\lambda)}$. Facciamo il conto che lo giustifica (passaggio aggiunto): moltiplichiamo $\\nu$ per $\\frac1E=\\frac{\\mu+\\lambda}{\\mu(2\\mu+3\\lambda)}$, l'inverso del modulo di Young appena trovato, e il fattore $\\mu+\\lambda$ si semplifica tra numeratore e denominatore:
$$\\frac{\\nu}{E}=\\frac{\\lambda}{2(\\mu+\\lambda)}\\cdot\\frac{\\mu+\\lambda}{\\mu(2\\mu+3\\lambda)}=\\frac{\\lambda}{2\\mu(2\\mu+3\\lambda)}.$$
È proprio il coefficiente di $s$ nella dilatazione trasversale. Quindi $E_{22}=E_{33}=-\\nu\\,s/E$ e, poiché $s/E=\\varepsilon_1$, $E_{22}=E_{33}=-\\nu\\,\\varepsilon_1$. Ne segue
$$\\nu=-\\frac{\\varepsilon_2}{\\varepsilon_1}=-\\frac{\\varepsilon_3}{\\varepsilon_1}.$$

Tre cose da notare.
- Le due dilatazioni trasversali sono **uguali**: è l'isotropia.
- Il segno meno traduce il fatto che **in trazione il materiale si contrae di lato**: con $\\varepsilon_1>0$ e $\\nu>0$ viene $\\varepsilon_2<0$.
- $\\nu$ è un rapporto tra dilatazioni, quindi **adimensionale**: è un coefficiente, non un modulo. Si chiama anche coefficiente di contrazione trasversale.`,
      },
      {
        id: 'l52-7',
        kind: 'domanda',
        q: { id: 'l52-q2', kind: 'scelta', q: 'Un provino con $\\nu=0{,}3$ in trazione si allunga di $\\varepsilon_1=10^{-3}$. Quanto vale la dilatazione trasversale $\\varepsilon_2$?', options: ['$-3\\cdot10^{-4}$', '$+3\\cdot10^{-4}$', '$-3\\cdot10^{-3}$', '$-0{,}3$'], correct: 0, why: '$\\varepsilon_2=-\\nu\\varepsilon_1=-0{,}3\\cdot10^{-3}$. Il segno è negativo perché in trazione il provino si contrae di lato; dimenticare il segno meno nella definizione $\\nu=-\\varepsilon_2/\\varepsilon_1$ dà la risposta positiva. $-0{,}3$ è il coefficiente stesso, non la dilatazione.' },
      },
      {
        id: 'l52-8',
        kind: 'spiega',
        title: 'Una seconda prova: lo scorrimento semplice',
        md: `Il modulo di Young e il coefficiente di Poisson descrivono come il materiale si allunga e si contrae. Resta da capire come risponde a una **distorsione** degli angoli. Serve una prova in cui agisca solo tensione tangenziale: uno **scorrimento semplice**. Si ottiene, per esempio, torcendo un tubo a parete sottile (§4.13.2).

In matrice la tensione è
$$[\\tens T]=\\begin{bmatrix}0&\\tau&0\\\\\\tau&0&0\\\\0&0&0\\end{bmatrix},\\qquad\\operatorname{tr}\\tens T=0.$$
La traccia è nulla perché non ci sono tensioni normali. Allora nel legame inverso il secondo termine sparisce e resta solo $\\tens E=\\frac1{2\\mu}\\tens T$: la deformazione ha la stessa forma della tensione, con la sola componente 12 (e la sua simmetrica 21).`,
      },
      {
        id: 'l52-9',
        kind: 'derivazione',
        title: 'Dallo scorrimento al modulo G',
        md: 'Vogliamo una relazione tra la tensione tangenziale $\\tau$ e lo scorrimento angolare $\\gamma_{12}$, la grandezza che si vede nel provino. Strategia: leggiamo $E_{12}$ dal legame inverso e ricordiamo che $E_{12}$ è metà dello scorrimento.',
        source: D(4, '4.13.2', undefined, 89),
        der: {
          sample,
          lines: [
            {
              tex: 'E_{12}=\\frac{\\tau}{2\\mu}',
              why: `Componente 12 di $\\tens E=\\frac1{2\\mu}\\tens T$, il legame inverso con $\\operatorname{tr}\\tens T=0$.`,
              val: (v) => El.strainIso(tech(v).E, tech(v).nu, [0, TT(v)[1], 0, TT(v)[1], 0, 0, 0, 0, 0])[1],
            },
            {
              tex: '=\\frac{\\tau}{2G},\\qquad G:=\\mu',
              why: `Diamo a $\\mu$ il nome di **modulo di elasticità tangenziale** $G$: per definizione $G$ coincide con $\\mu$, quindi al posto di $2\\mu$ scriviamo $2G$.`,
              val: (v) => TT(v)[1] / (2 * tech(v).G),
            },
            {
              tex: '\\frac{\\gamma_{12}}2=\\frac{\\tau}{2G}',
              why: `Dal Modulo 2: la componente fuori diagonale della deformazione infinitesima è metà dello scorrimento angolare, $E_{12}=\\gamma_{12}/2$.`,
              val: (v) => TT(v)[1] / (2 * tech(v).G),
            },
            {
              tex: '\\tau=G\\,\\gamma_{12},\\qquad\\gamma_{12}=\\frac\\pi2-\\theta',
              why: `Moltiplichiamo per 2 e riordiniamo. $\\theta$ è l'angolo che, dopo la deformazione, formano le due fibre inizialmente ortogonali lungo $\\hat e_1$ e $\\hat e_2$: lo scorrimento è quanto quell'angolo retto si è chiuso.`,
              eq: '§4.13.2',
            },
          ],
        },
      },
      {
        id: 'l52-10',
        kind: 'spiega',
        title: 'Che cosa misura G',
        md: `Il risultato $\\tau=G\\gamma_{12}$ è la «legge di Hooke» degli scorrimenti: $G$ è il coefficiente di proporzionalità tra la tensione tangenziale e lo scorrimento mutuo angolare tra le due direzioni a cui si riferisce. Come $E$, è una tensione e si misura in Pascal, perché $\\gamma$ è un angolo, quindi un numero puro.

La figura della dispensa (p. 89) aiuta a vederlo: un quadratino con i lati lungo $\\hat e_1$ e $\\hat e_2$ diventa un rombo; ciascun lato ruota di $\\gamma_{12}/2$ e l'angolo tra i lati diventa $\\theta=\\frac\\pi2-\\gamma_{12}$. Più $G$ è grande, meno il quadratino si «schiaccia» a parità di $\\tau$.

Nota anche che cosa **non** succede: nessuna dilatazione. La tensione non ha componenti normali e la sua traccia è nulla, quindi $\\tens E=\\frac1{2G}\\tens T$ ha la diagonale nulla: $E_{11}=E_{22}=E_{33}=0$. È il disaccoppiamento tra comportamento estensionale e di scorrimento visto con Lamé.`,
      },
      {
        id: 'l52-11',
        kind: 'spiega',
        title: 'Tre moduli, due costanti: qualcosa deve legarli',
        md: `Facciamo il conto. L'isotropo ha **due** costanti indipendenti, $\\mu$ e $\\lambda$. Noi però abbiamo introdotto **tre** moduli tecnici, $E$, $\\nu$ e $G$, tutti espressi con $\\mu$ e $\\lambda$. Tre funzioni di due variabili non possono essere indipendenti: una deve potersi scrivere con le altre due (§4.13.3).

Per trovare la relazione partiamo dalla definizione di $E$ e cerchiamo di farvi comparire $G=\\mu$ e $\\nu=\\lambda/(2(\\mu+\\lambda))$. Il trucco è spezzare il $3\\lambda$ del numeratore in modo da isolare un pezzo che si semplifica con il denominatore $\\mu+\\lambda$.

Una nota della dispensa: i moduli tecnici si definiscono anche per gli anisotropi, ma con un modulo diverso per ogni direzione. Un composito con fibre tutte parallele, per esempio, ha un modulo di Young lungo le fibre e uno, diverso, ortogonale alle fibre.`,
      },
      {
        id: 'l52-12',
        kind: 'derivazione',
        title: 'La relazione E = 2G(1 + ν)',
        md: 'Vogliamo scrivere $E$ usando solo $G$ e $\\nu$. Strategia: spezziamo $3\\lambda=2\\lambda+\\lambda$, separiamo la frazione in due, e riconosciamo in ciascun pezzo $G$ e $\\nu$.',
        source: D(4, '4.13.3', undefined, 90),
        der: {
          sample,
          lines: [
            { tex: 'E=\\frac{\\mu(2\\mu+3\\lambda)}{\\mu+\\lambda}', why: `Partiamo dalla definizione del modulo di Young trovata con la prova di trazione.`, val: (v) => tech(v).E },
            { tex: '=\\frac{\\mu(2\\mu+2\\lambda+\\lambda)}{\\mu+\\lambda}', why: `Spezziamo $3\\lambda=2\\lambda+\\lambda$: così compare $2\\mu+2\\lambda=2(\\mu+\\lambda)$, che si semplificherà con il denominatore.`, val: (v) => (v.mu * (2 * v.mu + 2 * v.la + v.la)) / (v.mu + v.la) },
            { tex: '=\\mu\\,\\frac{2(\\mu+\\lambda)}{\\mu+\\lambda}+\\mu\\,\\frac{\\lambda}{\\mu+\\lambda}', why: `Separiamo la frazione nella somma di due frazioni con lo stesso denominatore.`, val: (v) => (v.mu * 2 * (v.mu + v.la)) / (v.mu + v.la) + (v.mu * v.la) / (v.mu + v.la) },
            { tex: '=2\\mu+\\mu\\,\\frac{\\lambda}{\\mu+\\lambda}', why: `Nella prima frazione $\\mu+\\lambda$ si semplifica e resta $2\\mu$.`, aggiunto: true, val: (v) => 2 * v.mu + (v.mu * v.la) / (v.mu + v.la) },
            {
              tex: '=2G+2G\\nu',
              why: `Sostituiamo $\\mu=G$ in entrambi i termini e riconosciamo che $\\frac{\\lambda}{\\mu+\\lambda}=2\\nu$.`,
              ask: { q: 'A che cosa è uguale $\\lambda/(\\mu+\\lambda)$?', options: ['$2\\nu$', '$\\nu$', '$1+\\nu$', '$E/G$'], correct: 0, why: 'Per definizione $\\nu=\\lambda/(2(\\mu+\\lambda))$, quindi $\\lambda/(\\mu+\\lambda)$ è il doppio di $\\nu$. Rispondere $\\nu$ significa dimenticare il 2 nel denominatore della definizione.' },
              val: (v) => 2 * tech(v).G + 2 * tech(v).G * tech(v).nu,
            },
            {
              tex: '=2G(1+\\nu)',
              why: `Raccogliamo $2G$.`,
              val: (v) => 2 * tech(v).G * (1 + tech(v).nu),
              eq: '§4.13.3',
            },
          ],
        },
      },
      {
        id: 'l52-13',
        kind: 'spiega',
        title: 'Perché si misurano E e ν e si calcola G',
        md: `La relazione $E=2G(1+\\nu)$ dice che, per un isotropo, **basta conoscere due moduli tecnici qualsiasi** per avere il terzo. Con $\\nu$ tra 0 e ½, come nei materiali da costruzione, $G$ è tra un terzo e la metà di $E$ (deduzione).

Quali due conviene misurare? La dispensa è netta: si fa una prova di trazione (o compressione) monoassiale, da cui si leggono insieme $E$ (dall'allungamento) e $\\nu$ (dalla contrazione laterale), e si calcola $G=E/(2(1+\\nu))$. Ricavare $G$ direttamente da una prova di torsione, che genera lo scorrimento semplice, **non è affatto facile**.

Nel passo seguente il motore fa questo conto per l'acciaio.`,
      },
      {
        id: 'l52-14',
        kind: 'numeri',
        title: 'L’acciaio in numeri',
        md: `Con $E=205\\,000$ MPa e $\\nu=0{,}3$ il motore dà $G=\\mu=${r0(ST.mu)}$ MPa, $\\lambda=${r0(ST.lambda)}$ MPa e $K=${r0(STK)}$ MPa. Controlla a mente la relazione appena dimostrata: $2G(1+\\nu)=2\\cdot${r0(ST.mu)}\\cdot1{,}3\\approx205\\,000$. Nota che $G$ è circa il 38% di $E$, dentro la fascia tra un terzo e la metà vista sopra. Il valore $E=205\\,000$ MPa è quello che la dispensa dà per gli acciai (§4.5.3, p. 75); $\\nu=0{,}3$ invece è un valore d'esempio, non della dispensa.`,
        values: { G: r0(ST.mu), lambda: r0(ST.lambda), K: r0(STK) },
        visual: SVG('isotropia', { tab: 'provino', E: 205000, nu: 0.3 }),
      },
      {
        id: 'l52-15',
        kind: 'spiega',
        title: 'Il legame inverso con i moduli tecnici',
        md: `Ora che abbiamo i moduli tecnici, riscriviamo il legame inverso di Lamé usando solo loro (§4.13.4). Bastano due sostituzioni nei coefficienti:
$$\\frac1{2\\mu}=\\frac1{2G}=\\frac{1+\\nu}E,\\qquad\\frac{\\lambda}{2\\mu(2\\mu+3\\lambda)}=\\frac\\nu E.$$
La prima viene da $G=\\mu$ e da $E=2G(1+\\nu)$. La seconda l'abbiamo già incontrata nel passo sul coefficiente di Poisson: lì abbiamo calcolato $\\frac\\nu E=\\frac{\\lambda}{2(\\mu+\\lambda)}\\cdot\\frac{\\mu+\\lambda}{\\mu(2\\mu+3\\lambda)}=\\frac{\\lambda}{2\\mu(2\\mu+3\\lambda)}$, il coefficiente della dilatazione trasversale nella prova di trazione. Si ottiene
$$\\tens E=\\frac1E\\big[(1+\\nu)\\tens T-\\nu(\\operatorname{tr}\\tens T)\\tens I\\big].$$

In componenti:
$$E_{ii}=\\frac1E\\big[T_{ii}-\\nu(T_{jj}+T_{kk})\\big],\\qquad E_{ij}=\\frac1{2G}T_{ij}\\ (i\\ne j).$$
Per esempio $E_{11}=\\frac1E[T_{11}-\\nu(T_{22}+T_{33})]$. Leggila così: la tensione lungo 1 allunga lungo 1; le tensioni lungo 2 e 3, attraverso l'effetto Poisson, accorciano lungo 1. Le **dilatazioni** sono quindi accoppiate a **tutte** le tensioni normali, mentre ogni **scorrimento** dipende **solo** dalla tangenziale omonima (disaccoppiamento).`,
      },
      {
        id: 'l52-16',
        kind: 'spiega',
        title: 'Il legame diretto con i moduli tecnici',
        md: `Serve anche il verso opposto, dalla deformazione alla tensione. Bisogna esprimere $\\lambda$ con i moduli tecnici. Dalla definizione $\\nu=\\lambda/(2(\\mu+\\lambda))$, moltiplicando in croce: $2\\nu\\mu+2\\nu\\lambda=\\lambda$, cioè $\\lambda(1-2\\nu)=2\\nu\\mu$, e quindi
$$\\lambda=\\frac{2\\nu\\mu}{1-2\\nu}=\\frac{\\nu}{1-2\\nu}\\cdot\\frac E{1+\\nu},\\qquad2\\mu=2G=\\frac E{1+\\nu}.$$
Sostituendo nel legame di Lamé:
$$\\tens T=\\frac E{1+\\nu}\\Big[\\tens E+\\frac\\nu{1-2\\nu}(\\operatorname{tr}\\tens E)\\tens I\\Big].$$
In componenti: $T_{ii}=\\frac E{1+\\nu}E_{ii}+\\frac{E\\nu}{(1+\\nu)(1-2\\nu)}(E_{11}+E_{22}+E_{33})$ e $T_{ij}=2GE_{ij}$ per $i\\ne j$.

Osserva il fattore $1-2\\nu$ al denominatore: se $\\nu$ si avvicina a ½ il coefficiente esplode. Lo ritroveremo nella lezione «Energia e restrizioni di plausibilità», quando parleremo di materiali incomprimibili (§4.15.4).`,
      },
      {
        id: 'l52-17',
        kind: 'domanda',
        q: { id: 'l52-q1', kind: 'vf', q: 'Nel legame con i moduli tecnici lo scorrimento $\\gamma_{12}$ dipende anche dalle tensioni normali.', answer: false, why: '$E_{12}=T_{12}/(2G)$, cioè $\\gamma_{12}=\\tau_{12}/G$: solo la tangenziale omonima (§4.13.4). Sono le dilatazioni, non gli scorrimenti, a dipendere da tutte le tensioni normali attraverso $\\nu$.' },
      },
      {
        id: 'l52-18',
        kind: 'domanda',
        q: { id: 'l52-q3', kind: 'scelta', q: 'Un pannello è teso ugualmente in due direzioni, $T_{11}=T_{22}=s$, con tutte le altre componenti nulle. Quanto vale la dilatazione nello spessore, $E_{33}$?', options: ['$-2\\nu s/E$', '$0$', '$-\\nu s/E$', '$(1-\\nu)s/E$'], correct: 0, why: '$E_{33}=\\frac1E[T_{33}-\\nu(T_{11}+T_{22})]=\\frac1E[0-2\\nu s]$. Dire zero significa dimenticare l’effetto Poisson (una dilatazione può esserci anche dove la tensione è nulla); $-\\nu s/E$ conta una sola delle due tensioni; $(1-\\nu)s/E$ è $E_{11}$, non $E_{33}$.' },
      },
      {
        id: 'l52-19',
        kind: 'spiega',
        title: 'Attenzione a…',
        md: `Tre errori ricorrono sui moduli tecnici.

1. **Il segno di $\\nu$.** La definizione è $\\nu=-\\varepsilon_2/\\varepsilon_1$, con il meno. È tentante scrivere $\\nu=\\varepsilon_2/\\varepsilon_1$, «rapporto tra le dilatazioni»; ma allora i materiali comuni avrebbero $\\nu$ negativo. Con $\\nu>0$, in trazione il materiale si contrae lateralmente.
2. **Il fattore 2 negli scorrimenti.** $E_{ij}=T_{ij}/(2G)$, mentre $\\gamma_{ij}=\\tau_{ij}/G$. L'errore nasce dal confondere la componente del tensore di deformazione con lo scorrimento angolare: ricorda che $E_{ij}=\\gamma_{ij}/2$.
3. **Pensare che i tre moduli tecnici siano indipendenti.** Per un isotropo le costanti sono due, quindi uno dei tre si ricava dagli altri: $E=2G(1+\\nu)$. Se in un esercizio ti danno $E$, $\\nu$ e $G$ che non rispettano questa relazione, c'è un errore nei dati (deduzione).`,
      },
      {
        id: 'l52-20',
        kind: 'riassunto',
        md: `**Il filo della lezione.** Le costanti di Lamé non corrispondono a nessuna prova, quindi si definiscono moduli che si leggono negli esperimenti, usando sempre il legame inverso perché in laboratorio si conosce la tensione. Nella prova di trazione la dilatazione lungo il carico dà il modulo di Young $E$, quella trasversale il coefficiente di Poisson $\\nu$; nello scorrimento semplice la tensione tangenziale e lo scorrimento sono legati dal modulo $G$, che coincide con $\\mu$. Poiché le costanti indipendenti sono due, i tre moduli sono legati da $E=2G(1+\\nu)$: in pratica si misurano $E$ e $\\nu$ e si calcola $G$. Infine i legami diretto e inverso si riscrivono con i moduli tecnici, mostrando che le dilatazioni sono accoppiate a tutte le tensioni normali e gli scorrimenti no.

- $E=\\frac{\\mu(2\\mu+3\\lambda)}{\\mu+\\lambda}$, $\\nu=\\frac\\lambda{2(\\mu+\\lambda)}$, $G=\\mu$ (§4.13.1–4.13.2).
- $\\varepsilon_1=s/E$, $\\varepsilon_2=\\varepsilon_3=-\\nu\\varepsilon_1$; $\\tau=G\\gamma_{12}$.
- $E=2G(1+\\nu)$ (§4.13.3).
- $\\tens E=\\frac1E[(1+\\nu)\\tens T-\\nu(\\operatorname{tr}\\tens T)\\tens I]$; $\\tens T=\\frac E{1+\\nu}[\\tens E+\\frac\\nu{1-2\\nu}(\\operatorname{tr}\\tens E)\\tens I]$ (§4.13.4).`,
        orale: ['Moduli tecnici: definizioni dalle prove, relazione $E=2G(1+\\nu)$, legami con i moduli tecnici. (dispensa, domanda 12)'],
      },
    ],
  },
  // ================================================================== c5.3
  {
    concept: 'c5.3',
    title: 'Energia e restrizioni di plausibilità',
    minutes: 38,
    source: D(4, '4.14–4.15', 'Prop 4.14.1', '91–94'),
    visual: SVG('isotropia', { tab: 'nu' }),
    steps: [
      {
        id: 'l53-1',
        kind: 'spiega',
        title: 'Dove siamo e dove andiamo',
        md: `Nelle due lezioni precedenti abbiamo scritto il legame dell'isotropo con le costanti di Lamé e con i moduli tecnici, e abbiamo dimostrato che un isotropo è sempre iperelastico: possiede un'**energia specifica di deformazione** $\\varphi$. Ma non l'abbiamo ancora scritta.

Questa lezione ha due parti legate tra loro. Nella prima scriviamo $\\varphi$ in funzione della deformazione e della tensione: deformando un corpo gli si trasferisce energia, e conoscendo lo stato energetico ci si fa un'idea di quanto è sollecitato. Nella seconda usiamo proprio $\\varphi$ per rispondere a una domanda nuova: **le costanti elastiche possono avere un valore qualsiasi?** Scopriremo che no, e che l'energia ci dice esattamente quali valori sono fisicamente plausibili.

Chiuderemo discutendo due casi limite interessanti: i materiali con coefficiente di Poisson negativo e quelli incomprimibili.`,
      },
      {
        id: 'l53-2',
        kind: 'spiega',
        title: 'Da dove partiamo per scrivere φ',
        md: `Dal modulo precedente conosciamo la **formula di rappresentazione** dell'energia di un materiale iperelastico lineare:
$$\\varphi=\\tfrac12\\tens T\\cdot\\tens E=\\tfrac12\\mathbb A\\tens E\\cdot\\tens E.$$
È metà del prodotto scalare tra tensione e deformazione, come in una molla l'energia è metà della forza per l'allungamento.

Se il legame è invertibile, cioè $\\tens E=\\mathbb A^{-1}\\tens T$, la stessa energia si scrive con la sola tensione: sostituendo, $\\varphi=\\frac12\\mathbb A\\mathbb A^{-1}\\tens T\\cdot\\mathbb A^{-1}\\tens T=\\frac12\\tens T\\cdot\\mathbb A^{-1}\\tens T$ (§4.14). Avremo quindi due espressioni, $\\varphi(\\tens E)$ e $\\varphi(\\tens T)$.

C'è un'ulteriore semplificazione. Per la **coassialità** dell'isotropo esiste un riferimento principale comune: in esso sia $\\tens E$ sia $\\tens T$ sono diagonali, $[\\tens E]=\\operatorname{diag}(e_1,e_2,e_3)$ e $[\\tens T]=\\operatorname{diag}(s_1,s_2,s_3)$, dove $e_i$ sono le dilatazioni principali e $s_i$ le tensioni principali. Così $\\varphi$ si potrà scrivere con soli tre numeri.`,
      },
      {
        id: 'l53-3',
        kind: 'derivazione',
        title: 'L’energia in funzione della deformazione',
        md: 'Vogliamo $\\varphi$ scritta con $\\tens E$ e con le costanti di Lamé, e poi con le sole dilatazioni principali. Strategia: sostituiamo il legame di Lamé nella formula di rappresentazione, poi passiamo al riferimento principale. Il campione calcola l’energia con il tensore di Lamé completo.',
        source: D(4, '4.14', 'Prop 4.14.1', 91),
        der: {
          sample,
          lines: [
            { tex: '\\varphi=\\tfrac12\\mathbb A\\tens E\\cdot\\tens E', why: `La formula di rappresentazione dell'energia.`, val: (v) => phiE(v, sym(v, 'a')) },
            { tex: '=\\tfrac12\\big[2\\mu\\tens E+\\lambda(\\operatorname{tr}\\tens E)\\tens I\\big]\\cdot\\tens E', why: `Al posto di $\\mathbb A\\tens E$ scriviamo il legame di Lamé.`, val: (v) => 0.5 * T.ddot(TT(v), sym(v, 'a')) },
            {
              tex: '=\\mu\\,\\tens E\\cdot\\tens E+\\tfrac\\lambda2(\\operatorname{tr}\\tens E)\\,\\tens I\\cdot\\tens E',
              why: `Distribuiamo il prodotto scalare e portiamo fuori il fattore $\\frac12$: $\\frac12\\cdot2\\mu=\\mu$.`,
              val: (v) => v.mu * T.ddot(sym(v, 'a'), sym(v, 'a')) + (v.la / 2) * T.trace(sym(v, 'a')) * T.ddot(T.I3, sym(v, 'a')),
            },
            {
              tex: '=\\mu\\,\\tens E\\cdot\\tens E+\\tfrac\\lambda2(\\operatorname{tr}\\tens E)^2',
              why: `Il prodotto scalare con l'identità dà la traccia, $\\tens I\\cdot\\tens E=\\operatorname{tr}\\tens E$, che moltiplicata per l'altra traccia dà il quadrato.`,
              val: (v) => v.mu * T.ddot(sym(v, 'a'), sym(v, 'a')) + (v.la / 2) * T.trace(sym(v, 'a')) ** 2,
              eq: 'Prop 4.14.1',
            },
            {
              tex: '=\\mu(e_1^2+e_2^2+e_3^2)+\\tfrac\\lambda2(e_1^2+e_2^2+e_3^2+2e_1e_2+2e_2e_3+2e_3e_1)',
              why: `Passiamo al riferimento principale. Con $\\tens E$ diagonale, $\\tens E\\cdot\\tens E$ è la somma dei quadrati delle dilatazioni principali; la traccia è $e_1+e_2+e_3$, e il suo quadrato si sviluppa in quadrati più doppi prodotti.`,
              val: (v) => {
                const [a, b, c] = eigSym(sym(v, 'a')).values;
                return v.mu * (a * a + b * b + c * c) + (v.la / 2) * (a * a + b * b + c * c + 2 * a * b + 2 * b * c + 2 * c * a);
              },
            },
            {
              tex: '=\\big(\\mu+\\tfrac\\lambda2\\big)(e_1^2+e_2^2+e_3^2)+\\lambda(e_1e_2+e_2e_3+e_3e_1)',
              why: `Raccogliamo: i quadrati compaiono con coefficiente $\\mu+\\frac\\lambda2$, i doppi prodotti con $\\frac\\lambda2\\cdot2=\\lambda$.`,
              val: (v) => {
                const [a, b, c] = eigSym(sym(v, 'a')).values;
                return (v.mu + v.la / 2) * (a * a + b * b + c * c) + v.la * (a * b + b * c + c * a);
              },
              eq: 'Prop 4.14.1',
            },
          ],
        },
      },
      {
        id: 'l53-4',
        kind: 'spiega',
        title: 'Leggere φ(E) su due casi semplici',
        md: `L'espressione $\\varphi=\\mu\\tens E\\cdot\\tens E+\\frac\\lambda2(\\operatorname{tr}\\tens E)^2$ ha due pezzi, come il legame di Lamé: uno che «vede» tutta la deformazione e uno che vede solo la variazione di volume.

Due controlli (esempio aggiunto).
- **Deformazione senza variazione di volume**, per esempio uno scorrimento puro con $\\operatorname{tr}\\tens E=0$: resta $\\varphi=\\mu\\tens E\\cdot\\tens E$, e conta solo $\\mu$, cioè $G$. È coerente con la lezione precedente: lo scorrimento è governato da $G$.
- **Dilatazione in una sola direzione**, $e_1=e$ ed $e_2=e_3=0$: tutti i doppi prodotti si annullano e resta $\\varphi=(\\mu+\\frac\\lambda2)e^2$, positiva se $\\mu+\\frac\\lambda2>0$. Questa condizione ricomparirà tra poco.

La dispensa nota che l'espressione di $\\varphi(\\tens E)$ con i moduli tecnici è poco utilizzata; per questo con i moduli tecnici ricaviamo $\\varphi(\\tens T)$, l'energia in funzione della tensione.`,
      },
      {
        id: 'l53-5',
        kind: 'derivazione',
        title: 'L’energia in funzione della tensione',
        md: 'Vogliamo $\\varphi$ scritta con $\\tens T$ e con i moduli tecnici, poi con le sole tensioni principali. Strategia: nella formula $\\varphi=\\frac12\\tens T\\cdot\\tens E$ sostituiamo $\\tens E$ con il legame inverso tecnico, poi passiamo al riferimento principale. Attenzione ai simboli: qui $E$ senza pedici è il modulo di Young, un numero, mentre $\\tens E$ è il tensore di deformazione.',
        source: D(4, '4.14', 'Prop 4.14.1', 91),
        der: {
          sample,
          lines: [
            { tex: '\\varphi=\\tfrac12\\tens T\\cdot\\tens E', why: `La formula di rappresentazione, con $\\tens T=\\mathbb A\\tens E$.`, val: (v) => 0.5 * T.ddot(TT(v), sym(v, 'a')) },
            {
              tex: '=\\tfrac12\\tens T\\cdot\\tfrac1E\\big[(1+\\nu)\\tens T-\\nu(\\operatorname{tr}\\tens T)\\tens I\\big]',
              why: `Al posto di $\\tens E$ scriviamo il legame inverso con i moduli tecnici. Ora c'è solo la tensione.`,
              val: (v) => {
                const { E, nu } = tech(v);
                const S = TT(v);
                return 0.5 * T.ddot(S, T.scale(T.sub(T.scale(S, 1 + nu), T.scale(T.I3, nu * T.trace(S))), 1 / E));
              },
            },
            {
              tex: '=\\frac{1+\\nu}{2E}\\tens T\\cdot\\tens T-\\frac\\nu{2E}(\\operatorname{tr}\\tens T)^2',
              why: `Distribuiamo il prodotto scalare. Nel secondo termine $\\tens T\\cdot\\tens I=\\operatorname{tr}\\tens T$, che moltiplicato per l'altra traccia dà il quadrato.`,
              val: (v) => {
                const { E, nu } = tech(v);
                const S = TT(v);
                return ((1 + nu) / (2 * E)) * T.ddot(S, S) - (nu / (2 * E)) * T.trace(S) ** 2;
              },
              eq: 'Prop 4.14.1',
            },
            {
              tex: '=\\frac{1+\\nu}{2E}\\sum s_i^2-\\frac\\nu{2E}\\Big(\\sum s_i^2+2\\sum s_is_j\\Big)',
              why: `Nel riferimento principale $\\tens T\\cdot\\tens T=s_1^2+s_2^2+s_3^2$ e $(\\operatorname{tr}\\tens T)^2$ si sviluppa in quadrati più doppi prodotti ($\\sum s_is_j$ indica $s_1s_2+s_2s_3+s_3s_1$).`,
              val: (v) => {
                const { E, nu } = tech(v);
                const [a, b, c] = eigSym(TT(v)).values;
                const q = a * a + b * b + c * c;
                const p = a * b + b * c + c * a;
                return ((1 + nu) / (2 * E)) * q - (nu / (2 * E)) * (q + 2 * p);
              },
            },
            {
              tex: '=\\frac1{2E}(s_1^2+s_2^2+s_3^2)-\\frac\\nu E(s_1s_2+s_2s_3+s_3s_1)',
              why: `Raccogliamo: per i quadrati $\\frac{1+\\nu}{2E}-\\frac\\nu{2E}=\\frac1{2E}$; per i doppi prodotti $-\\frac\\nu{2E}\\cdot2=-\\frac\\nu E$.`,
              val: (v) => {
                const { E, nu } = tech(v);
                const s = eigSym(TT(v)).values as [number, number, number];
                return El.energyPrincipal(E, nu, s);
              },
              eq: 'Prop 4.14.1',
            },
          ],
          checks: [
            {
              what: 'con Lamé: $\\varphi=\\frac1{4\\mu}\\tens T\\cdot\\tens T-\\frac{\\lambda}{4\\mu(2\\mu+3\\lambda)}(\\operatorname{tr}\\tens T)^2$',
              f: (v) => {
                const S = TT(v);
                return [T.ddot(S, S) / (4 * v.mu) - (v.la / (4 * v.mu * (2 * v.mu + 3 * v.la))) * T.trace(S) ** 2, 0.5 * T.ddot(S, sym(v, 'a'))];
              },
            },
          ],
        },
      },
      {
        id: 'l53-6',
        kind: 'spiega',
        title: 'Leggere φ(T) e la sua versione con Lamé',
        md: `Controlliamo il risultato sulla prova di trazione (esempio aggiunto): con $s_1=s$ e $s_2=s_3=0$ resta $\\varphi=s^2/(2E)$. Siccome $\\varepsilon_1=s/E$, è lo stesso che $\\frac12s\\,\\varepsilon_1$: metà della tensione per la dilatazione, esattamente come per una molla. Il coefficiente di Poisson non compare, perché le contrazioni laterali avvengono dove la tensione è nulla e non fanno lavoro (deduzione).

La stessa energia si può scrivere con le costanti di Lamé, sostituendo il legame inverso di Lamé invece di quello tecnico (Prop 4.14.1):
$$\\varphi(\\tens T)=\\frac1{4\\mu}\\tens T\\cdot\\tens T-\\frac{\\lambda}{4\\mu(2\\mu+3\\lambda)}(\\operatorname{tr}\\tens T)^2=\\frac{\\mu+\\lambda}{2\\mu(2\\mu+3\\lambda)}\\sum s_i^2-\\frac{\\lambda}{2\\mu(2\\mu+3\\lambda)}\\sum s_is_j.$$
Nel riferimento principale il coefficiente dei quadrati è $\\frac1{4\\mu}-\\frac{\\lambda}{4\\mu(2\\mu+3\\lambda)}=\\frac{\\mu+\\lambda}{2\\mu(2\\mu+3\\lambda)}$, cioè $\\frac1{2E}$ (deduzione: è l'inverso di $2E$, con $E=\\frac{\\mu(2\\mu+3\\lambda)}{\\mu+\\lambda}$): le due versioni coincidono, come verifica il controllo numerico della derivazione.`,
      },
      {
        id: 'l53-7',
        kind: 'domanda',
        q: { id: 'l53-q2', kind: 'scelta', q: 'Uno stato di taglio puro ha tensioni principali $s_1=\\tau$, $s_2=-\\tau$, $s_3=0$. Quanto vale $\\varphi$?', options: ['$\\tau^2(1+\\nu)/E$, cioè $\\tau^2/(2G)$', '$\\tau^2/E$', '$\\tau^2(1-\\nu)/E$', '$0$, perché $\\operatorname{tr}\\tens T=0$'], correct: 0, why: 'Con l’espressione principale: quadrati $\\frac1{2E}(2\\tau^2)=\\tau^2/E$; doppi prodotti $s_1s_2=-\\tau^2$, quindi $-\\frac\\nu E(-\\tau^2)=+\\nu\\tau^2/E$. In totale $\\tau^2(1+\\nu)/E=\\tau^2/(2G)$ (deduzione). Chi sbaglia il segno del doppio prodotto ottiene $(1-\\nu)$; chi lo dimentica ottiene $\\tau^2/E$. Traccia nulla significa volume invariato, non energia nulla.' },
      },
      {
        id: 'l53-8',
        kind: 'spiega',
        title: 'Le costanti possono valere qualsiasi cosa?',
        md: `Passiamo alla seconda parte. In molte teorie costruite con la matematica servono **restrizioni di plausibilità fisica** (§4.15). Il caso a una dimensione lo mostra bene.

In una dimensione il legame $\\tens T=\\mathbb A\\tens E$ diventa la legge di Hooke $\\sigma=E\\varepsilon$. In trazione, $\\sigma>0$: con $E>0$ si ottiene una dilatazione, $\\varepsilon>0$, ed è ciò che accade. Con $E<0$, invece, a una trazione corrisponderebbe un **accorciamento**: tiri una barra e quella si accorcia. Nessun materiale si comporta così (figura di p. 92).

Il punto è che la formula $\\sigma=E\\varepsilon$ funziona con qualunque valore del parametro: la matematica non si lamenta. Per descrivere i comportamenti reali bisogna aggiungere noi che il modulo non può assumere valori qualsiasi, cioè $E>0$.

In tre dimensioni al posto del numero $E$ c'è il tensore elastico $\\mathbb A$. Che cosa vuol dire «$\\mathbb A$ positivo»?`,
      },
      {
        id: 'l53-9',
        kind: 'spiega',
        title: 'La restrizione in tre dimensioni: per deformare si spende lavoro',
        md: `La generalizzazione di $E>0$ è la **definita positività** del tensore elastico (§4.15.1):
$$\\mathbb A\\in\\mathrm{Pos}^+\\iff\\mathbb A\\tens E\\cdot\\tens E>0\\quad\\forall\\tens E\\in\\mathrm{Sym}-\\{\\tens O\\}.$$
Qui $\\mathrm{Sym}$ è l'insieme dei tensori simmetrici, da cui si toglie il tensore nullo $\\tens O$: per ogni deformazione simmetrica non nulla, il numero $\\mathbb A\\tens E\\cdot\\tens E$ deve essere positivo.

Presa così è una relazione matematica astratta. Il significato fisico arriva dall'energia: per un materiale iperelastico $\\mathbb A\\tens E\\cdot\\tens E=2\\varphi(\\tens E)$, quindi la condizione dice $\\varphi(\\tens E)>0$ per ogni deformazione non nulla. Siccome nella configurazione naturale ($\\tens E=\\tens O$) l'energia è zero, **per passare a una qualsiasi configurazione deformata bisogna spendere lavoro**. Va precisato: si spende lavoro per deformare a partire dallo stato naturale; rilasciando la causa, in un materiale iperelastico è il corpo a restituire quell'energia.

C'è un secondo guadagno: se $\\mathbb A\\in\\mathrm{Pos}^+$, $\\mathbb A$ è invertibile, ed è ciò che ci ha permesso di scrivere il legame inverso.`,
      },
      {
        id: 'l53-10',
        kind: 'spiega',
        title: 'Che cosa diventa la condizione per un isotropo',
        md: `Le componenti di $\\mathbb A$ sono i moduli elastici, quindi chiedere $\\mathbb A\\in\\mathrm{Pos}^+$ significa restringere i valori dei moduli, come $E>0$ in una dimensione. Per un isotropo il risultato della dispensa è:
$$\\mathbb A\\in\\mathrm{Pos}^+\\iff\\begin{cases}\\mu>0\\\\2\\mu+3\\lambda>0\\end{cases}\\iff\\begin{cases}E>0\\\\G>0\\\\-1<\\nu<\\frac12\\end{cases}$$
Le due condizioni sulle costanti di Lamé equivalgono a tre condizioni sui moduli tecnici, i **limiti teorici**. Nella pratica dei materiali da costruzione si usano limiti un po' diversi, i **limiti pratici**: $E>0$, $G>0$, $0<\\nu\\le\\frac12$. Capiremo alla fine perché.

Ora dimostriamo le due equivalenze, una alla volta. Per la prima useremo l'energia $\\varphi(\\tens E)$ scritta con le dilatazioni principali: chiedere $\\mathbb A\\in\\mathrm{Pos}^+$ equivale a chiedere che quella espressione sia positiva per ogni terna $(e_1,e_2,e_3)$ non nulla.`,
      },
      {
        id: 'l53-11',
        kind: 'derivazione',
        title: 'Le condizioni sulle costanti di Lamé (Sylvester)',
        md: 'Vogliamo arrivare a $\\mu>0$ e $2\\mu+3\\lambda>0$. Strategia: scriviamo $\\varphi$ come forma quadratica $\\{x\\}^T[A]\\{x\\}$ nelle tre dilatazioni principali e applichiamo il criterio di Sylvester. Questo criterio dice che una forma quadratica è definita positiva (positiva per ogni vettore non nullo) se e solo se i minori principali della sua matrice, cioè i determinanti delle sottomatrici in alto a sinistra di ordine 1, 2 e 3, sono tutti positivi; equivalentemente, se tutti gli autovalori di $[A]$ sono positivi.',
        source: D(4, '4.15.2', undefined, '92–93'),
        der: {
          sample,
          lines: [
            {
              tex: '\\varphi=\\big(\\mu+\\tfrac\\lambda2\\big)(e_1^2+e_2^2+e_3^2)+\\tfrac\\lambda2(2e_1e_2+2e_2e_3+2e_3e_1)',
              why: `Partiamo da $\\varphi(\\tens E)$ nel riferimento principale e moltiplichiamo e dividiamo per 2 il secondo termine: $\\lambda\\,e_1e_2=\\frac\\lambda2\\cdot2e_1e_2$. Così ogni doppio prodotto ha davanti il coefficiente che andrà nella matrice. È una forma quadratica **completa**: ci sono tutti i quadrati e tutti i doppi prodotti.`,
            },
            {
              tex: '[A]=\\begin{bmatrix}\\mu+\\frac\\lambda2&\\frac\\lambda2&\\frac\\lambda2\\\\\\frac\\lambda2&\\mu+\\frac\\lambda2&\\frac\\lambda2\\\\\\frac\\lambda2&\\frac\\lambda2&\\mu+\\frac\\lambda2\\end{bmatrix},\\quad\\varphi=\\{x\\}^T[A]\\{x\\},\\ \\{x\\}=(e_1,e_2,e_3)^T',
              why: `Scriviamo la matrice dei coefficienti: i coefficienti dei quadrati in diagonale, i coefficienti dei doppi prodotti (già divisi per 2) fuori diagonale. Infatti $\\{x\\}^T[A]\\{x\\}$ contiene ogni termine misto due volte, una per $A_{12}$ e una per $A_{21}$.`,
            },
            {
              tex: '\\mu+\\tfrac\\lambda2>0',
              why: `Primo minore principale: l'elemento in alto a sinistra.`,
              ask: { q: 'Quale criterio dà la definita positività di una forma quadratica dai minori principali della sua matrice?', options: ['Sylvester', 'Hadamard', 'Kirchhoff', 'Schwarz'], correct: 0, why: 'È il criterio di Sylvester (§4.15.2). Hadamard è il nome della buona posizione di un problema, Kirchhoff quello del teorema di unicità, Schwarz quello del teorema sulle derivate seconde miste: nomi che compaiono nel corso, ma in altri contesti.' },
            },
            {
              tex: '\\big(\\mu+\\tfrac\\lambda2\\big)^2-\\big(\\tfrac\\lambda2\\big)^2=\\mu(\\mu+\\lambda)>0',
              why: `Secondo minore: il determinante della sottomatrice $2\\times2$ in alto a sinistra, prodotto della diagonale meno prodotto fuori diagonale. È una differenza di quadrati, $(a-b)(a+b)$ con $a=\\mu+\\frac\\lambda2$ e $b=\\frac\\lambda2$, che dà $\\mu\\cdot(\\mu+\\lambda)$.`,
            },
            {
              tex: '\\det[A]=\\mu^2\\big(\\mu+\\tfrac32\\lambda\\big)>0',
              why: `Terzo minore: il determinante di tutta la matrice. Da dove viene la fattorizzazione (passaggio aggiunto): una matrice $3\\times3$ con tutti gli elementi diagonali uguali ad $a$ e tutti quelli fuori diagonale uguali a $b$ ha determinante $(a-b)^2(a+2b)$; qui $a-b=\\mu$ e $a+2b=\\mu+\\frac32\\lambda$. Il controllo numerico verifica la fattorizzazione.`,
            },
            {
              tex: '2\\mu+\\lambda>0,\\qquad\\mu>0,\\qquad2\\mu+3\\lambda>0',
              why: `Traduciamo le tre condizioni. La prima, moltiplicata per 2, dà $2\\mu+\\lambda>0$. Dalla seconda la dispensa ricava $\\mu>0$, osservando che $\\mu+\\frac\\lambda2>0$ e $\\mu+\\frac\\lambda2>\\frac\\lambda2$. Un modo per vederlo per esteso (passaggio aggiunto): se fosse $\\mu<0$, per avere $\\mu(\\mu+\\lambda)>0$ servirebbe $\\lambda<-\\mu$, mentre la prima condizione chiede $\\lambda>-2\\mu$, che è più grande di $-\\mu$: impossibile. Nella terza $\\mu^2>0$, quindi conta il segno di $\\mu+\\frac32\\lambda$, cioè di $2\\mu+3\\lambda$.`,
            },
            {
              tex: '\\mu>0,\\qquad2\\mu+3\\lambda>0',
              why: `Quale tra $2\\mu+\\lambda>0$ e $2\\mu+3\\lambda>0$ prevale? Con $\\mu>0$: se $\\lambda>0$ sono vere entrambe; se $\\lambda<0$, il termine $3\\lambda$ è più negativo di $\\lambda$, quindi $2\\mu+3\\lambda>0$ implica a maggior ragione $2\\mu+\\lambda>0$. Restano due condizioni.`,
              eq: '§4.15.2',
            },
          ],
          checks: [
            { what: 'minore di ordine 2 $=\\mu(\\mu+\\lambda)$', f: (v) => [El.sylvester(v.mu, v.la).m2, v.mu * (v.mu + v.la)] },
            { what: '$\\det[A]=\\mu^2(\\mu+\\frac32\\lambda)$', f: (v) => [El.sylvester(v.mu, v.la).m3, v.mu * v.mu * (v.mu + 1.5 * v.la)] },
          ],
        },
      },
      {
        id: 'l53-12',
        kind: 'spiega',
        title: 'Che cosa dicono le due condizioni',
        md: `Il risultato si legge bene alla luce della lezione sul teorema di Lamé. $\\mu>0$ dice che il modulo che governa lo scorrimento è positivo: se distorci il materiale, spendi lavoro (deduzione). $2\\mu+3\\lambda>0$ è la stessa cosa che $K>0$, perché $K=(2\\mu+3\\lambda)/3$ (deduzione): se cambi il volume, spendi lavoro. Le due condizioni corrispondono quindi ai due modi «indipendenti» in cui un isotropo si deforma: cambiando forma e cambiando volume (deduzione).

Nota invece che **$\\lambda$ può essere negativo**: basta che non lo sia troppo, $\\lambda>-\\frac23\\mu$. Non c'è nessuna condizione «$\\lambda>0$».

Controllo sull'acciaio: con i numeri della lezione «I moduli tecnici» $\\mu$ e $\\lambda$ sono entrambi positivi, quindi le condizioni sono soddisfatte. Ora traduciamo le stesse condizioni nei moduli tecnici, che sono quelli che si misurano.`,
      },
      {
        id: 'l53-13',
        kind: 'domanda',
        q: { id: 'l53-q3', kind: 'vf', q: 'Per un materiale isotropo con $\\mathbb A\\in\\mathrm{Pos}^+$ entrambe le costanti di Lamé devono essere positive.', answer: false, why: 'Le condizioni sono $\\mu>0$ e $2\\mu+3\\lambda>0$ (§4.15.2): $\\lambda$ può essere negativo, purché $\\lambda>-\\frac23\\mu$. L’errore viene dall’immaginare che ogni costante elastica debba essere positiva come $E$ in una dimensione.' },
      },
      {
        id: 'l53-14',
        kind: 'derivazione',
        title: 'Le stesse condizioni con i moduli tecnici',
        md: 'Vogliamo dedurre da $\\mu>0$ e $2\\mu+3\\lambda>0$ i limiti $E>0$, $G>0$, $-1<\\nu<\\frac12$. Non è una catena di uguaglianze ma di deduzioni logiche: ogni riga usa le precedenti e le formule dei moduli tecnici.',
        source: D(4, '4.15.3', undefined, 93),
        der: {
          lines: [
            { tex: 'G=\\mu>0', why: `Il modulo di elasticità tangenziale coincide con $\\mu$, che è positivo per la prima condizione.` },
            { tex: '2\\mu+3\\lambda>0\\ \\Rightarrow\\ \\lambda>-\\tfrac23\\mu', why: `Riscriviamo la seconda condizione isolando $\\lambda$.` },
            { tex: '\\mu+\\lambda>\\mu-\\tfrac23\\mu=\\tfrac13\\mu>0', why: `Aggiungiamo $\\mu$ a entrambi i membri. Questo ci serve perché $\\mu+\\lambda$ è il denominatore di $E$.` },
            { tex: 'E=\\frac{\\mu(2\\mu+3\\lambda)}{\\mu+\\lambda}>0', why: `Il numeratore è prodotto di due quantità positive, il denominatore è positivo per la riga precedente: $E$, prodotto e rapporto di quantità positive, è positivo.` },
            { tex: 'G=\\frac E{2(1+\\nu)}>0\\ \\Rightarrow\\ \\nu>-1', why: `Dalla relazione $E=2G(1+\\nu)$: con $G>0$ ed $E>0$ deve essere positivo anche $1+\\nu$.` },
            {
              tex: '\\operatorname{tr}\\tens E=\\frac1E\\big[(1+\\nu)\\operatorname{tr}\\tens T-3\\nu\\operatorname{tr}\\tens T\\big]=\\frac{1-2\\nu}E\\operatorname{tr}\\tens T',
              why: `Per il limite superiore guardiamo il volume. Applichiamo la traccia al legame inverso tecnico: $\\operatorname{tr}\\tens T$ è un numero e $\\operatorname{tr}\\tens I=3$.`,
            },
            {
              tex: '\\operatorname{tr}\\tens E=\\frac{\\operatorname{tr}\\tens T}{2\\mu+3\\lambda},\\ 2\\mu+3\\lambda>0\\ \\Rightarrow\\ 1-2\\nu>0\\ \\Rightarrow\\ \\nu<\\tfrac12',
              why: `Dalla lezione sul teorema di Lamé (§4.12.2) sappiamo che $\\operatorname{tr}\\tens E=\\operatorname{tr}\\tens T/(2\\mu+3\\lambda)$, con denominatore positivo: le due tracce hanno lo **stesso segno**. Confrontando con la riga sopra, e con $E>0$, deve essere $1-2\\nu>0$.`,
              ask: { q: 'Da dove viene il limite $\\nu<\\frac12$?', options: ['$\\operatorname{tr}\\tens E$ e $\\operatorname{tr}\\tens T$ devono avere lo stesso segno', 'Da $E>0$ da solo', 'Da $G>0$ da solo', 'Dalla coassialità'], correct: 0, why: 'Una tensione media di trazione deve aumentare il volume (§4.15.3): è la condizione $K>0$ letta sui moduli tecnici (deduzione). $E>0$ e $G>0$ insieme danno solo $\\nu>-1$; la coassialità non dice nulla sui valori dei moduli.' },
              eq: '§4.15.3',
            },
          ],
        },
      },
      {
        id: 'l53-15',
        kind: 'spiega',
        title: 'E e G possono essere nulli?',
        md: `Ora la discussione dei limiti (§4.15.4), un modulo alla volta.

I limiti teorici escludono $E=0$ e $G=0$. Il senso fisico è semplice. In uno stato monoassiale $\\varepsilon=\\sigma/E$: se $E\\to0$, la dilatazione tende all'infinito qualunque sia la tensione. In uno scorrimento semplice $\\gamma=\\tau/G$: se $G\\to0$, lo scorrimento tende all'infinito qualunque sia la tensione tangenziale. Un materiale così non sosterrebbe nessun carico: per questo $E\\ne0$ e $G\\ne0$, e anzi entrambi positivi.

Fin qui limiti teorici e pratici coincidono. La differenza è tutta su $\\nu$, e la vediamo nei prossimi due passi.`,
      },
      {
        id: 'l53-16',
        kind: 'spiega',
        title: 'Ha senso un coefficiente di Poisson negativo?',
        md: `La teoria ammette $-1<\\nu<0$. Che cosa vorrebbe dire? Ricorda che $\\nu=-\\varepsilon_2/\\varepsilon_1$. In trazione $\\varepsilon_1>0$; con $\\nu<0$ verrebbe $\\varepsilon_2>0$: il provino, tirato, **si allargherebbe** anche di lato. In compressione si stringerebbe di lato. Nei materiali naturali non succede.

Questo, dice la dispensa, «mette in crisi»: sembrava che $\\mathbb A\\in\\mathrm{Pos}^+$ fosse l'unica condizione di plausibilità da cui discende tutto il resto, e invece lascia passare un comportamento che in natura non si vede.

Però questi materiali esistono, artificiali: sono i **metamateriali auxetici**, la cui struttura interna è progettata geometricamente (anche con la stampa 3D). Hanno molte applicazioni: guarnizioni che, compresse, si stringono anche di lato e si accomodano in un solco; filtri per la trasmissione di certe onde; isolamento acustico; materiali che respingono o assorbono la radiazione elettromagnetica (uso militare). Nei materiali da costruzione naturali questi fenomeni non accadono e si escludono: da qui il limite pratico $\\nu>0$.`,
      },
      {
        id: 'l53-17',
        kind: 'spiega',
        title: 'Che cosa succede quando ν si avvicina a ½',
        md: `All'altro estremo c'è $\\nu\\to\\frac12$. Dalla traccia del legame inverso tecnico, appena ricavata, e con $\\operatorname{tr}\\tens T=3\\sigma_m$:
$$\\Theta=\\operatorname{tr}\\tens E=\\frac{1-2\\nu}E\\,3\\sigma_m.$$
Per $\\nu\\to\\frac12$ il fattore $1-2\\nu$ si annulla, e quindi $\\Theta=0$ **per ogni stato di tensione**: il volume non cambia mai. Il materiale è **incomprimibile**, la deformazione è sempre isocora. È un buon modello per gomme e biotessuti.

Perché allora i limiti teorici dicono $\\nu<\\frac12$ e quelli pratici $\\nu\\le\\frac12$? Perché $\\nu=\\frac12$ è un **valore limite**: corrisponde a $\\lambda\\to+\\infty$, e quindi $K\\to+\\infty$, a $\\mu$ fissato (ricorda il fattore $1-2\\nu$ al denominatore di $\\lambda$ nel legame diretto). Con moduli finiti è escluso dalla condizione stretta $\\mathbb A\\in\\mathrm{Pos}^+$, ma nella pratica si accetta l'incomprimibilità come caso limite.`,
      },
      {
        id: 'l53-18',
        kind: 'prova',
        title: 'Muovi ν e guarda le conseguenze',
        md: 'Il diagramma ha due viste. Nella vista «campo di ν» la curva mostra il rapporto $K/E=1/(3(1-2\\nu))$ al variare di $\\nu$ (deduzione: si ottiene confrontando $\\Theta=\\sigma_m/K$ con $\\Theta=\\frac{1-2\\nu}E3\\sigma_m$), con le fasce dei limiti teorici e pratici. Nella vista «provino in trazione» il cursore ν cambia il comportamento del provino.',
        tasks: [
          'Nella vista «campo di ν», segui la curva verso destra: per $\\nu\\to\\frac12$ cresce senza limite. Un $K$ infinito vuol dire che il volume non può cambiare: è l’incomprimibilità.',
          'Confronta le due fasce: quella teorica (−1 < ν < ½) e quella pratica (0 < ν ≤ ½). La differenza a sinistra sono gli auxetici; a destra, l’estremo ½ incluso solo nei limiti pratici.',
          'Passa alla vista «provino in trazione» e porta ν sotto zero: il provino teso si allarga di lato. Poi porta ν a 0,5 e guarda $\\Theta$ nella tabella: diventa zero.',
        ],
        visual: SVG('isotropia', { tab: 'nu' }),
      },
      {
        id: 'l53-19',
        kind: 'domanda',
        q: { id: 'l53-q1', kind: 'scelta', q: 'Quali sono i limiti pratici dei moduli tecnici?', options: ['$E>0$, $G>0$, $0<\\nu\\le\\frac12$', '$E>0$, $G>0$, $-1<\\nu<\\frac12$', '$E\\ge0$, $G\\ge0$, $0\\le\\nu\\le1$', '$\\mu>0$, $2\\mu+3\\lambda>0$'], correct: 0, why: '§4.15.1: $-1<\\nu<\\frac12$ sono i limiti teorici; i pratici escludono gli auxetici ($\\nu<0$) e il valore $\\nu=0$, e includono l’incomprimibile come caso limite ($\\nu=\\frac12$). L’ultima opzione è la condizione teorica scritta con le costanti di Lamé.' },
      },
      {
        id: 'l53-20',
        kind: 'spiega',
        title: 'Attenzione a…',
        md: `Tre errori ricorrono su questo argomento.

1. **Trattare $\\nu=\\frac12$ come un valore ammesso dalla condizione stretta.** È tentante perché gomme e biotessuti si modellano proprio con $\\nu=\\frac12$. Ma quel valore corrisponde a $\\lambda\\to+\\infty$: con moduli finiti è escluso da $\\mathbb A\\in\\mathrm{Pos}^+$, ed entra solo nei limiti pratici come caso limite.
2. **Dire che la teoria esclude $\\nu<0$.** Non è così: $\\mathbb A\\in\\mathrm{Pos}^+$ ammette $-1<\\nu<0$. È la pratica dei materiali naturali a escluderlo, e infatti i metamateriali auxetici esistono.
3. **Sbagliare la matrice del criterio di Sylvester.** Fuori diagonale vanno i coefficienti dei doppi prodotti **divisi per 2**, perché $\\{x\\}^T[A]\\{x\\}$ conta ogni termine misto due volte. Mettere $\\lambda$ invece di $\\frac\\lambda2$ fuori diagonale porta a condizioni sbagliate.`,
      },
      {
        id: 'l53-21',
        kind: 'riassunto',
        md: `**Il filo della lezione.** Partendo dalla formula di rappresentazione e usando il legame di Lamé o quello inverso tecnico, l'energia dell'isotropo si scrive in funzione della deformazione o della tensione e, grazie alla coassialità, con le sole quantità principali. La stessa energia dà il significato fisico della restrizione di plausibilità $\\mathbb A\\in\\mathrm{Pos}^+$: per deformare un corpo a partire dallo stato naturale bisogna spendere lavoro, come $E>0$ in una dimensione. Applicando il criterio di Sylvester alla forma quadratica $\\varphi(e_1,e_2,e_3)$ si ottengono $\\mu>0$ e $2\\mu+3\\lambda>0$, che con i moduli tecnici diventano $E>0$, $G>0$, $-1<\\nu<\\frac12$. I limiti pratici escludono gli auxetici ($\\nu<0$, possibili solo nei metamateriali) e ammettono come caso limite l'incomprimibile ($\\nu=\\frac12$).

- $\\varphi(\\tens E)=\\mu\\tens E\\cdot\\tens E+\\frac\\lambda2(\\operatorname{tr}\\tens E)^2=(\\mu+\\frac\\lambda2)\\sum e_i^2+\\lambda\\sum e_ie_j$ (Prop 4.14.1).
- $\\varphi(\\tens T)=\\frac{1+\\nu}{2E}\\tens T\\cdot\\tens T-\\frac\\nu{2E}(\\operatorname{tr}\\tens T)^2=\\frac1{2E}\\sum s_i^2-\\frac\\nu E\\sum s_is_j$ (Prop 4.14.1).
- Minori di Sylvester: $\\mu+\\frac\\lambda2$, $\\mu(\\mu+\\lambda)$, $\\mu^2(\\mu+\\frac32\\lambda)$ (§4.15.2).
- $\\mathbb A\\in\\mathrm{Pos}^+\\iff\\mu>0,\\ 2\\mu+3\\lambda>0\\iff E>0,\\ G>0,\\ -1<\\nu<\\frac12$ (§4.15.1).
- $\\Theta=\\frac{1-2\\nu}E3\\sigma_m$: per $\\nu\\to\\frac12$ incomprimibile (§4.15.4).`,
        orale: ['Espressioni di $\\varphi$; restrizioni di plausibilità fisica e dimostrazioni; $\\nu<0$ (auxetici) e $\\nu\\to\\frac12$ (incomprimibilità). (dispensa, domanda 13)'],
      },
    ],
  },
  // ================================================================== c5.4
  {
    concept: 'c5.4',
    title: 'Il problema elastico',
    minutes: 30,
    source: D(4, '4.16.1–4.16.3', 'Def 4.16.1', '94–96'),
    visual: SVG('problema'),
    steps: [
      {
        id: 'l54-1',
        kind: 'spiega',
        title: 'Dove siamo e dove andiamo',
        md: `Finora abbiamo costruito tre pezzi, ciascuno per conto suo. Nel Modulo 2, l'analisi della deformazione (la **cinematica**): come si descrive il cambiamento di forma, con lo spostamento $\\vet u$ e la deformazione $\\tens E$. Nel Modulo 3, l'analisi della tensione (la **statica**): come si descrivono le forze interne, con il tensore di Cauchy $\\tens T$ e le equazioni di equilibrio. Nel Modulo 4 e nelle ultime lezioni, il **legame costitutivo**: come un materiale collega tensione e deformazione, fino all'isotropo con $E$ e $\\nu$.

Ora mettiamo insieme i tre ingredienti in un unico problema, il **problema elastico**: descrivere la risposta meccanica di un solido elastico caricato e vincolato. Ci servirà subito: il problema di Saint-Venant, nel prossimo modulo, ne è un caso particolare.

Le tappe: che cosa si assegna, che cosa si cerca, con quali equazioni; un'analogia con una trave caricata lungo l'asse; il conto di equazioni e incognite; e infine perché quel conto, da solo, non basta.`,
      },
      {
        id: 'l54-2',
        kind: 'spiega',
        title: 'Che cosa vuol dire «formulare» un problema',
        md: `Prima di risolvere qualcosa bisogna sapere con precisione di che problema si tratta. Secondo la dispensa, **formulare un problema** significa sapere tre cose (§4.16):
- che cosa si deve assegnare: i **dati**;
- quali **equazioni** si hanno a disposizione per risolverlo;
- qual è la **struttura della soluzione**, cioè che cosa si cerca.

Può sembrare pedante, ma senza queste tre risposte non si sa nemmeno che cosa voglia dire «risolvere». Più avanti in questa lezione la dispensa fa lo stesso su una trave, il caso a una dimensione (§4.16.2); qui lo facciamo per un solido tridimensionale qualsiasi. Cominciamo dai dati, che sono quattro: geometria, carichi, vincoli, materiale.`,
      },
      {
        id: 'l54-3',
        kind: 'spiega',
        title: 'La geometria: una frontiera divisa in due',
        md: `Il primo dato è il corpo $\\mathcal B$ con la sua frontiera $\\partial\\mathcal B$, la superficie che lo racchiude. La frontiera è divisa in due porzioni (§4.16.1):
- $\\partial\\mathcal B_v$, la frontiera **vincolata**: lì si assegnano gli spostamenti (è la parte attaccata a qualcosa);
- $\\partial\\mathcal B_\\ell$, la frontiera **libera**: lì si assegnano le forze di superficie.

Le due porzioni insieme formano tutta la frontiera e non si sovrappongono: $\\partial\\mathcal B_v\\cup\\partial\\mathcal B_\\ell=\\partial\\mathcal B$ e $\\partial\\mathcal B_v\\cap\\partial\\mathcal B_\\ell=\\emptyset$. Il motivo è che in ogni punto della frontiera si assegna **una** delle due cose: o sai dove il punto deve stare, o sai quale forza agisce lì.

Guarda il diagramma: il bordo rosso in basso è $\\partial\\mathcal B_v$, il resto del contorno è $\\partial\\mathcal B_\\ell$.`,
        visual: SVG('problema'),
      },
      {
        id: 'l54-4',
        kind: 'spiega',
        title: 'Carichi, vincoli e materiale',
        md: `Gli altri tre dati (§4.16.1).

**Carichi.** Le forze di volume $\\vet b(x)$ in ogni punto $x$ del corpo (per esempio il peso); le forze di superficie $\\hat{\\vet s}(x)$ sui punti della frontiera libera. Il cappello su $\\hat{\\vet s}$ ricorda che è un valore **assegnato**.

**Vincoli.** Sulla frontiera vincolata lo spostamento è uguale a un valore noto: $\\vet u(x)=\\hat{\\vet u}(x)$. Un incastro perfetto è $\\hat{\\vet u}=\\vet 0$; un cedimento imposto è un $\\hat{\\vet u}$ non nullo. Qui **il vincolo è una condizione matematica sugli spostamenti**; rispetto alle travi cambia la prospettiva: il vincolo non entra come un oggetto che esercita reazioni (deduzione).

**Materiale.** Il tensore elastico $\\mathbb A(x)$ in ogni punto: può anche variare da punto a punto, per esempio in un corpo fatto di materiali diversi.

Una precisazione: le frontiere sono «eventuali». Una delle due può mancare, e vedremo tra poco che proprio questo distingue i tipi di problema.`,
      },
      {
        id: 'l54-5',
        kind: 'spiega',
        title: 'Che cosa si cerca: lo stato elastico',
        md: `Assegnati i dati, si vuole determinare lo **stato elastico**
$$\\{\\vet u(x),\\tens E(x),\\tens T(x)\\}\\quad\\forall x\\in\\mathcal B,$$
cioè tre campi definiti in ogni punto del corpo: lo spostamento $\\vet u$ (un vettore), la deformazione infinitesima $\\tens E$ (un tensore simmetrico) e la tensione $\\tens T$ (il tensore di Cauchy).

Sottolinea la parola **campi**: l'incognita non è un numero né un vettore, ma una terna di **funzioni** del punto. Questo è ciò che rende difficile il problema elastico: si cercano funzioni, non pochi numeri (deduzione).

Perché cercarli tutti e tre, se $\\tens E$ si ricava da $\\vet u$ e $\\tens T$ da $\\tens E$? Perché ciascuno serve a qualcosa: $\\vet u$ dice come si sposta la struttura, $\\tens E$ come si deforma localmente, $\\tens T$ quanto è sollecitato il materiale (e quindi se resiste). E ciascuno compare in un gruppo diverso di equazioni (deduzione).`,
      },
      {
        id: 'l54-6',
        kind: 'domanda',
        q: { id: 'l54-q2', kind: 'scelta', q: 'Su un punto della frontiera vincolata $\\partial\\mathcal B_v$ che cosa si assegna?', options: ['Lo spostamento, $\\vet u=\\hat{\\vet u}$', 'La forza di superficie, $\\tens T\\hat n=\\hat{\\vet s}$', 'Sia lo spostamento sia la forza', 'Il tensore elastico $\\mathbb A$'], correct: 0, why: 'Sulla frontiera vincolata il dato è lo spostamento; la forza che lì si scambia con il vincolo è un risultato del problema, non un dato. Assegnarle entrambe è proprio ciò che la divisione disgiunta $\\partial\\mathcal B_v\\cap\\partial\\mathcal B_\\ell=\\emptyset$ evita. Il materiale si assegna in tutto il corpo, non solo sulla frontiera.' },
      },
      {
        id: 'l54-7',
        kind: 'spiega',
        title: 'Le equazioni di campo: i tre ingredienti',
        md: `Lo stato elastico deve soddisfare, in ogni punto del corpo, le **equazioni di campo** (§4.16.1). Ciascuna viene da uno dei tre moduli.

**Congruenza** (Modulo 2), in ogni punto di $\\mathcal B$: $\\tens E=\\frac12(\\nabla\\vet u+\\nabla\\vet u^T)$. La deformazione è la parte simmetrica del gradiente di spostamento: lega $\\tens E$ a $\\vet u$.

**Legame costitutivo** (Modulo 4 e lezioni precedenti), in ogni punto di $\\mathcal B$: $\\tens T=\\mathbb A\\tens E$. Lega $\\tens T$ a $\\tens E$.

**Equilibrio** (Modulo 3), in due equazioni:
- $\\operatorname{div}\\tens T+\\vet b=\\vet 0$ nei punti interni $\\mathring{\\mathcal B}$ (il cerchietto indica l'interno, senza la frontiera): è l'equilibrio alla traslazione in forma locale, la prima equazione cardinale scritta punto per punto. La divergenza di un tensore è il vettore di componenti $\\sum_j\\partial T_{ij}/\\partial x_j$, che misura come varia la tensione da un punto all'altro;
- $\\tens T=\\tens T^T$ in $\\mathcal B$: la simmetria del tensore di Cauchy, cioè l'equilibrio alla rotazione.

Nota la catena: $\\vet u\\to\\tens E\\to\\tens T\\to$ equilibrio con i carichi $\\vet b$.`,
      },
      {
        id: 'l54-8',
        kind: 'spiega',
        title: 'Le equazioni al contorno: dove entrano vincoli e forze',
        md: `Le equazioni di campo valgono nel corpo, ma non sanno nulla di come il corpo è caricato sul bordo né di come è vincolato. Per questo servono le **equazioni al contorno** (§4.16.1), una per ciascuna porzione di frontiera:
$$\\tens T\\hat n=\\hat{\\vet s}\\quad\\text{su }\\partial\\mathcal B_\\ell,\\qquad\\vet u=\\hat{\\vet u}\\quad\\text{su }\\partial\\mathcal B_v.$$

La prima è una condizione **statica**: sulla frontiera libera, il vettore tensione sulla giacitura di normale $\\hat n$ (la normale uscente) deve essere uguale alla forza di superficie assegnata. È il teorema di Cauchy del Modulo 3, applicato al bordo. La seconda è una condizione **cinematica**: sulla frontiera vincolata lo spostamento è quello prescritto.

Ogni equazione «lavora» quindi in una zona precisa: congruenza e legame in tutto il corpo, l'equilibrio indefinito nei punti interni, la condizione sulle forze sulla frontiera libera e quella sugli spostamenti sulla frontiera vincolata.`,
      },
      {
        id: 'l54-9',
        kind: 'spiega',
        title: 'Tre tipi di problema',
        md: `A seconda di quale porzione di frontiera c'è, il problema prende un nome diverso (§4.16.1).
1. **Problema negli spostamenti**: $\\partial\\mathcal B_v\\equiv\\partial\\mathcal B$, quindi non c'è frontiera libera. Sul bordo si assegnano solo spostamenti. Esempio: una trave a doppio incastro a cui si impone un cedimento.
2. **Problema nelle forze**: $\\partial\\mathcal B_\\ell\\equiv\\partial\\mathcal B$, quindi non c'è frontiera vincolata. Sul bordo si assegnano solo forze. Esempio: un aereo in volo, non soggetto a vincoli ma solo a carichi.
3. **Problema misto**: ci sono entrambe le porzioni. È il caso più comune nelle strutture (deduzione).

Nel problema nelle forze manca qualunque condizione sugli spostamenti. Ci torneremo tra poco: è la ragione per cui in quel caso lo spostamento resta determinato solo a meno di un moto rigido.`,
      },
      {
        id: 'l54-10',
        kind: 'prova',
        title: 'Frontiera vincolata e frontiera libera',
        md: 'Il diagramma mostra il corpo con le due porzioni di frontiera; i pulsanti in alto cambiano il tipo di problema. A destra c’è la trave dell’analogia che vedremo tra poco.',
        tasks: [
          'Nel problema misto riconosci il tratto rosso, dove è assegnato $\\vet u=\\hat{\\vet u}$, e il resto del contorno, dove è assegnato $\\tens T\\hat n=\\hat{\\vet s}$.',
          'Passa a «spostamenti»: tutta la frontiera diventa vincolata, le forze di superficie spariscono dai dati. Poi passa a «forze»: spariscono i vincoli, e leggi la nota sul moto rigido.',
        ],
        visual: SVG('problema'),
      },
      {
        id: 'l54-11',
        kind: 'domanda',
        q: { id: 'l54-q1', kind: 'scelta', q: 'Una trave a doppio incastro con un cedimento imposto è un problema…', options: ['negli spostamenti', 'nelle forze', 'misto', 'mal posto'], correct: 0, why: '§4.16.1: la frontiera è tutta vincolata, con spostamenti assegnati (nulli negli incastri, pari al cedimento dove è imposto). Il cedimento è uno spostamento, non una forza: per questo non è un problema nelle forze né misto.' },
      },
      {
        id: 'l54-12',
        kind: 'spiega',
        title: 'Un caso a una dimensione: la mensola',
        md: `Per rendere concreta questa struttura astratta, la dispensa la confronta con una trave (§4.16.2). Prendi una mensola lunga $L$, incastrata in A e libera in B, con una forza assiale concentrata $F$ in B e un carico assiale distribuito $p(z)$ lungo l'asse $z$.

Facciamo la corrispondenza pezzo per pezzo.
- Il **corpo** è il segmento $[0,L]$.
- Il punto **A** fa da frontiera vincolata: lì è assegnato lo spostamento assiale, $\\hat w=0$.
- Il punto **B** fa da frontiera libera: lì è assegnato lo sforzo normale, $N(L)=F$. La forza interna, che nella trave fa le veci della tensione, è uguale al carico applicato, proprio come $\\tens T\\hat n=\\hat{\\vet s}$.
- La **soluzione** è la terna $\\{w(z),\\varepsilon(z),N(z)\\}$: spostamento assiale, deformazione estensionale e sforzo normale, che corrisponde a $\\{\\vet u,\\tens E,\\tens T\\}$.

Assegnando la geometria si assegnano anche le caratteristiche della sezione (area $A$, momento d'inerzia $J$); il materiale entra con $E$ (o $G$, per un problema di torsione). Qui $E$ è il modulo di Young, da non confondere con il tensore di deformazione $\\tens E$; e $A$ è l'area della sezione, da non confondere con il tensore elastico $\\mathbb A$.`,
      },
      {
        id: 'l54-13',
        kind: 'spiega',
        title: 'Le equazioni della mensola',
        md: `Le equazioni della mensola ricalcano esattamente quelle del solido:
$$\\underbrace{\\varepsilon=w'}_{\\text{congruenza}},\\qquad\\underbrace{N=EA\\,\\varepsilon}_{\\text{legame}},\\qquad\\underbrace{N'=-p}_{\\text{equilibrio}};\\qquad\\underbrace{w(0)=0}_{\\text{cinematica}},\\quad\\underbrace{N(L)=F}_{\\text{statica}}.$$
L'apice indica la derivata rispetto a $z$. Le prime tre sono le equazioni di campo, le ultime due quelle al contorno, una cinematica sulla frontiera vincolata e una statica su quella libera.

Combinando le tre equazioni di campo (sostituendo la congruenza nel legame e il legame nell'equilibrio) si ottiene l'equazione della linea elastica, un'unica equazione nello spostamento (deduzione).

La differenza con il solido sta nella natura delle grandezze. Nella trave sono **scalari** e la variabile è **una sola**, $z$: il problema è retto da equazioni differenziali **ordinarie**. Nel solido sono vettori e tensori, funzioni di tre coordinate: il problema è retto da equazioni differenziali **alle derivate parziali**. La struttura però è la stessa.`,
      },
      {
        id: 'l54-14',
        kind: 'spiega',
        title: 'Contiamo le incognite',
        md: `Torniamo al solido e facciamo il bilancio (§4.16.3). Prima le incognite, contando le funzioni scalari da trovare in ogni punto:
- lo spostamento $\\vet u$ ha **3** componenti;
- la deformazione $\\tens E$ è simmetrica, quindi ha **6** componenti indipendenti (tre sulla diagonale e tre fuori);
- la tensione $\\tens T$, finché non imponiamo la simmetria, ha **9** componenti.

In tutto $3+6+9=18$ funzioni incognite.

Perché $\\tens E$ ne ha 6 e $\\tens T$ 9? Perché $\\tens E$ è simmetrica **per definizione** (è la parte simmetrica del gradiente), mentre la simmetria di $\\tens T$ non è gratuita: è un'equazione, l'equilibrio alla rotazione, e possiamo scegliere se contarla tra le equazioni o usarla subito per ridurre le incognite. Vediamo entrambe le scelte.`,
      },
      {
        id: 'l54-15',
        kind: 'numeri',
        title: 'Equazioni e incognite tornano',
        md: `Ora le equazioni, contando le equazioni scalari:
- la **congruenza** $\\tens E=\\frac12(\\nabla\\vet u+\\nabla\\vet u^T)$ è un'uguaglianza tra tensori simmetrici: **6** equazioni, una per ogni componente di $\\tens E$;
- il **legame** $\\tens T=\\mathbb A\\tens E$ è un'uguaglianza tra tensori con 9 componenti: **9** equazioni, una per ogni componente di $\\tens T$;
- l'**equilibrio alla traslazione** $\\operatorname{div}\\tens T+\\vet b=\\vet 0$ è un'uguaglianza tra vettori: **3** equazioni.

In tutto $6+9+3=$ **18** equazioni in **18** incognite. Se invece si impone a parte l'equilibrio alla rotazione, cioè si prende $\\tens T$ simmetrico fin dall'inizio con 6 incognite, si hanno $3+6+6=$ **15** incognite e $6+6+3=$ **15** equazioni. In entrambi i casi il bilancio torna.

Nota che ogni gruppo di equazioni «determina» una delle incognite a partire dalla precedente: la congruenza dà le 6 componenti di $\\tens E$ da $\\vet u$, il legame le componenti di $\\tens T$ da $\\tens E$, e le 3 equazioni di equilibrio restano per le 3 componenti di $\\vet u$ (deduzione). Combinando le equazioni (legame e simmetria sono algebriche, non contengono derivate) si ottiene comunque un sistema di equazioni alle derivate parziali.`,
        values: { incognite: 18, equazioni: 18, ridotte: 15 },
        visual: SVG('problema'),
      },
      {
        id: 'l54-16',
        kind: 'spiega',
        title: 'Perché il bilancio non basta: la buona posizione',
        md: `Avere tante equazioni quante incognite è rassicurante, ma **non garantisce che il problema sia risolvibile**. Anche un sistema di due equazioni in due incognite può non avere soluzione, o averne infinite.

Per questo serve un concetto più forte. **Def 4.16.1 (buona posizione, Hadamard).** Un problema alle derivate parziali è **ben posto** se la soluzione:
- **esiste**. Va stabilito prima di affidarsi al calcolatore, che restituisce comunque un numero, anche quando il problema non ha soluzione: un risultato privo di significato;
- è **unica**. L'esempio della dispensa: un'equazione di terzo grado ha tre soluzioni, e bisogna individuare quella con senso fisico;
- è **stabile**: variando di poco i dati, la soluzione varia in maniera contenuta.

La terza richiesta è la meno intuitiva, e merita un esempio.`,
      },
      {
        id: 'l54-17',
        kind: 'spiega',
        title: 'Un esempio di instabilità e il teorema di Kirchhoff',
        md: `Immagina un **arco ribassato**, cioè poco curvo, caricato al centro (§4.16.3). Aumentando il carico, a un certo punto l'arco può **saltare** di colpo in un'altra configurazione, rovesciandosi: una piccola variazione del carico produce una grande variazione della soluzione. È l'**instabilità a scatto** (snap-through), che spesso porta al cedimento della struttura. In generale l'instabilità (il buckling) precede il collasso. Nel corso si studiano le condizioni di unicità.

Per l'unicità la dispensa richiama, senza svolgerlo in questo capitolo, il **teorema di unicità di Kirchhoff**, che vedrai nel prossimo modulo: se $\\mathbb A\\in\\mathrm{Pos}^+$, il problema elastico ha **al più una** soluzione in termini di $\\tens E$ e $\\tens T$. Lo spostamento è unico se esiste una frontiera vincolata, $\\partial\\mathcal B_v\\ne\\emptyset$; nel problema nelle forze, invece, è determinato solo a meno di uno spostamento rigido infinitesimo. Ha senso: senza vincoli, puoi traslare o ruotare (infinitesimamente) l'aereo senza cambiare deformazioni e tensioni (deduzione).

È qui che la restrizione di plausibilità della lezione «Energia e restrizioni di plausibilità» mostra la sua importanza: non serve solo a escludere materiali strani, ma garantisce che la soluzione, se esiste, sia una sola in termini di $\\tens E$ e $\\tens T$.`,
      },
      {
        id: 'l54-18',
        kind: 'domanda',
        q: { id: 'l54-q3', kind: 'vf', q: 'Poiché il problema elastico ha 18 equazioni in 18 incognite, la sua soluzione esiste ed è unica.', answer: false, why: 'Il bilancio tra equazioni e incognite non basta (§4.16.3): bisogna dimostrare la buona posizione di Hadamard, cioè esistenza, unicità e stabilità. L’unicità, per esempio, la dà il teorema di Kirchhoff, e solo sotto l’ipotesi $\\mathbb A\\in\\mathrm{Pos}^+$.' },
      },
      {
        id: 'l54-19',
        kind: 'spiega',
        title: 'Attenzione a…',
        md: `Tre errori ricorrono sul problema elastico.

1. **Pensare che «equazioni = incognite» garantisca la soluzione.** Il conto 18 e 18 (o 15 e 15) è rassicurante, ma non dice nulla su esistenza, unicità e stabilità: per quelle serve la buona posizione.
2. **Usare le equazioni nel posto sbagliato.** L'equilibrio indefinito $\\operatorname{div}\\tens T+\\vet b=\\vet 0$ vale nei punti interni; sulla frontiera libera vale $\\tens T\\hat n=\\hat{\\vet s}$, su quella vincolata $\\vet u=\\hat{\\vet u}$. Non si assegnano mai forza e spostamento nello stesso punto.
3. **Dimenticare il moto rigido nel problema nelle forze.** Senza frontiera vincolata deformazioni e tensioni sono uniche (se $\\mathbb A\\in\\mathrm{Pos}^+$), ma lo spostamento è determinato solo a meno di uno spostamento rigido infinitesimo.`,
      },
      {
        id: 'l54-20',
        kind: 'riassunto',
        md: `**Il filo della lezione.** Il problema elastico mette insieme cinematica, statica e legame per descrivere la risposta di un solido. Si assegnano la geometria, con la frontiera divisa in una parte vincolata e una libera, i carichi di volume e di superficie, gli spostamenti sulla parte vincolata e il materiale; si cerca lo stato elastico, cioè i campi di spostamento, deformazione e tensione. Le equazioni sono la congruenza, il legame e l'equilibrio nel corpo, più una condizione statica sulla frontiera libera e una cinematica su quella vincolata; a seconda di quale frontiera c'è, il problema è negli spostamenti, nelle forze o misto, e la mensola caricata assialmente ne è la versione a una dimensione. Il conto torna, 18 equazioni in 18 incognite, ma non basta: il problema deve essere ben posto nel senso di Hadamard, e l'unicità discende da $\\mathbb A\\in\\mathrm{Pos}^+$ (Kirchhoff).

- Campo: $\\tens E=\\frac12(\\nabla\\vet u+\\nabla\\vet u^T)$, $\\tens T=\\mathbb A\\tens E$, $\\operatorname{div}\\tens T+\\vet b=\\vet 0$, $\\tens T=\\tens T^T$ (§4.16.1).
- Contorno: $\\tens T\\hat n=\\hat{\\vet s}$ su $\\partial\\mathcal B_\\ell$, $\\vet u=\\hat{\\vet u}$ su $\\partial\\mathcal B_v$ (§4.16.1).
- Trave: $\\varepsilon=w'$, $N=EA\\varepsilon$, $N'=-p$; $w(0)=0$, $N(L)=F$ (§4.16.2).
- Conteggio: $3+6+9=18=6+9+3$, oppure 15 e 15 (§4.16.3); buona posizione: esistenza, unicità, stabilità (Def 4.16.1).`,
        orale: ['Problema elastico: dati, equazioni, tipi di problema; analogia con la trave; 18 equazioni; buona posizione. (dispensa, domanda 14, prima parte)'],
      },
    ],
  },
  // ================================================================== c5.5
  {
    concept: 'c5.5',
    title: 'Sovrapposizione e non linearità dell’energia',
    minutes: 24,
    source: D(4, '4.16.4–4.16.5', 'Teo 4.16.2, Teo 4.16.3', '96–97'),
    visual: SVG('cammino'),
    steps: [
      {
        id: 'l55-1',
        kind: 'spiega',
        title: 'Dove siamo e dove andiamo',
        md: `Nella lezione precedente abbiamo formulato il problema elastico: dati geometria, carichi, vincoli e materiale, si cerca lo stato elastico $\\{\\vet u,\\tens E,\\tens T\\}$ che soddisfa congruenza, legame, equilibrio e condizioni al contorno. Una caratteristica di tutte quelle equazioni è che sono **lineari**.

In questa lezione vediamo due conseguenze di quella linearità, una positiva e una che sorprende. La prima: se conosci la soluzione per due casi di carico, conosci subito la soluzione per qualsiasi loro combinazione (**sovrapposizione degli stati elastici**). È ciò che ti permette, negli esercizi, di spezzare un telaio con tanti carichi in tanti casi semplici.

La seconda: l'**energia**, invece, non si sovrappone. L'energia dello stato somma non è la somma delle energie: compare un termine in più, di **accoppiamento**. Capiremo da dove viene e perché è inevitabile.`,
      },
      {
        id: 'l55-2',
        kind: 'spiega',
        title: 'Che cosa vuol dire che un’equazione è lineare',
        md: `Ricordiamo l'idea con un caso scalare. L'equazione $y=3x$ è lineare: se $x_1$ dà $y_1$ e $x_2$ dà $y_2$, allora $\\alpha x_1+\\beta x_2$ dà $\\alpha y_1+\\beta y_2$, per qualsiasi numeri $\\alpha$ e $\\beta$. L'equazione $y=x^2$ invece no: raddoppiando $x$, $y$ quadruplica.

Ora guarda le equazioni del problema elastico una per una.
- La **congruenza** $\\tens E=\\frac12(\\nabla\\vet u+\\nabla\\vet u^T)$: il gradiente di una combinazione è la combinazione dei gradienti, e così il trasposto.
- Il **legame** $\\tens T=\\mathbb A\\tens E$: $\\mathbb A$ è un tensore, cioè una trasformazione lineare.
- L'**equilibrio** $\\operatorname{div}\\tens T+\\vet b=\\vet 0$ e $\\tens T=\\tens T^T$: la divergenza è una derivata, quindi lineare, e la simmetria si conserva nelle combinazioni.
- Le **condizioni al contorno** $\\tens T\\hat n=\\hat{\\vet s}$ e $\\vet u=\\hat{\\vet u}$: anche queste sono lineari nelle incognite e nei dati.

Nessuna equazione contiene prodotti tra incognite, quadrati o funzioni non lineari (deduzione: la dispensa parla della «linearità delle equazioni del problema» senza esaminarle una per una). Tieni a mente questo elenco: è tutta la dimostrazione del teorema che segue.`,
      },
      {
        id: 'l55-3',
        kind: 'spiega',
        title: 'Il teorema di sovrapposizione',
        md: `**Teo 4.16.2 (sovrapposizione degli stati elastici).** Prendi un corpo elastico lineare, cioè fissati $\\mathcal B$, le frontiere $\\partial\\mathcal B_\\ell$ e $\\partial\\mathcal B_v$ e il materiale $\\mathbb A$. Supponi che
- ai dati $\\{\\vet b_1,\\hat{\\vet s}_1,\\hat{\\vet u}_1\\}$ corrisponda la soluzione $\\{\\vet u_1,\\tens E_1,\\tens T_1\\}$;
- ai dati $\\{\\vet b_2,\\hat{\\vet s}_2,\\hat{\\vet u}_2\\}$ corrisponda la soluzione $\\{\\vet u_2,\\tens E_2,\\tens T_2\\}$.

Allora, per ogni coppia di numeri reali $\\alpha$ e $\\beta$, lo stato elastico
$$\\{\\alpha\\vet u_1+\\beta\\vet u_2,\\ \\alpha\\tens E_1+\\beta\\tens E_2,\\ \\alpha\\tens T_1+\\beta\\tens T_2\\}$$
è soluzione del problema con dati $\\{\\alpha\\vet b_1+\\beta\\vet b_2,\\ \\alpha\\hat{\\vet s}_1+\\beta\\hat{\\vet s}_2,\\ \\alpha\\hat{\\vet u}_1+\\beta\\hat{\\vet u}_2\\}$.

In parole: **a una combinazione lineare di dati corrisponde la stessa combinazione lineare delle soluzioni**. La dimostrazione, secondo la dispensa, discende direttamente dalla linearità delle equazioni del problema: basta sostituire lo stato combinato in ciascuna equazione dell'elenco del passo precedente e usare la linearità.`,
      },
      {
        id: 'l55-4',
        kind: 'spiega',
        title: 'Perché la combinazione funziona: il legame è lineare',
        md: `Fermiamoci su uno degli ingredienti, il legame costitutivo, per capire da dove viene la sovrapposizione. Il tensore elastico $\\mathbb A$ trasforma una deformazione in una tensione **in modo lineare**: se gli dai la deformazione combinata $\\alpha\\tens E_1+\\beta\\tens E_2$, restituisce la tensione combinata
$$\\mathbb A[\\alpha\\tens E_1+\\beta\\tens E_2]=\\alpha\\,\\mathbb A\\tens E_1+\\beta\\,\\mathbb A\\tens E_2=\\alpha\\tens T_1+\\beta\\tens T_2.$$
È esattamente ciò che il Teo 4.16.2 chiede alla tensione dello stato combinato. Lo stesso accade per le altre due famiglie di equazioni: la congruenza (la parte simmetrica del gradiente di una somma è la somma delle parti simmetriche) e l'equilibrio (la divergenza di una somma è la somma delle divergenze) (deduzione). Tutte e tre le equazioni sono lineari, e per questo la combinazione delle soluzioni è ancora una soluzione.`,
      },
      {
        id: 'l55-5',
        kind: 'spiega',
        title: 'Due casi particolari che usi sempre',
        md: `La dispensa mette in evidenza due scelte di $\\alpha$ e $\\beta$.

1. **$\\alpha\\ne0$, $\\beta=0$.** Moltiplicando i dati per $\\alpha$ si ottiene $\\alpha$ volte la soluzione. Se una forza $F$ inflette una trave di $\\delta$, una forza $2F$ la inflette di $2\\delta$. Sembra scontato, ma vale **solo perché il problema è lineare**.
2. **$\\alpha=\\beta=1$.** Il problema con i dati sommati ha per soluzione la somma delle soluzioni dei singoli dati. È ciò che fai quando scomponi un telaio caricato da $F_1$ e $F_2$ nella somma di due casi, uno con la sola $F_1$ e uno con la sola $F_2$.

C'è anche una conseguenza meno evidente: nella combinazione entrano anche i vincoli $\\hat{\\vet u}$. Un caso con carichi e cedimenti si può quindi spezzare in un caso con i soli carichi e uno con i soli cedimenti (deduzione).`,
      },
      {
        id: 'l55-6',
        kind: 'spiega',
        title: 'Quando la sovrapposizione non vale',
        md: `La sovrapposizione **non è garantita in generale**: è una caratteristica dei problemi lineari. Se anche una sola equazione non è lineare, il teorema non è più garantito (deduzione).

L'esempio della dispensa è l'**attrito**. Immagina un corpo appoggiato con attrito su cui agiscono due carichi. Se applichi prima l'uno e poi l'altro, oppure nell'ordine inverso, il corpo può scivolare in momenti diversi e arrivare a configurazioni finali diverse (deduzione). Con un problema non lineare **l'ordine di applicazione dei carichi cambia la soluzione**, e per risolvere bisognerebbe sapere qual è lo scenario di carico da studiare, cioè la storia completa dei carichi.

Nel problema elastico lineare questo non succede: la soluzione dipende solo dai dati finali, non dall'ordine con cui sono stati applicati (deduzione). È una semplificazione enorme, ed è il motivo per cui l'ipotesi di linearità è così preziosa.`,
      },
      {
        id: 'l55-7',
        kind: 'domanda',
        q: { id: 'l55-q1', kind: 'vf', q: 'Con l’attrito la sovrapposizione degli effetti continua a valere, purché i carichi siano piccoli.', answer: false, why: '§4.16.4: l’attrito rende il problema non lineare, e allora l’ordine di applicazione dei carichi cambia la soluzione. La piccolezza dei carichi non c’entra: ciò che conta è che tutte le equazioni siano lineari.' },
      },
      {
        id: 'l55-8',
        kind: 'spiega',
        title: 'E l’energia? Si somma anche lei?',
        md: `Visto che stati elastici si sommano, viene spontaneo pensare che anche le energie si sommino: l'energia della trave con $F_1$ e $F_2$ sarebbe l'energia con la sola $F_1$ più quella con la sola $F_2$. Il **Teo 4.16.3** dice di no:
$$\\varphi(\\tens E_1+\\tens E_2)\\ne\\varphi(\\tens E_1)+\\varphi(\\tens E_2).$$
Anche se il problema elastico è lineare, l'energia specifica di deformazione non lo è.

Il motivo, a grandi linee, lo conosci già dal caso scalare: l'energia di una molla è $\\frac12kx^2$, una funzione **quadratica**, e $(x_1+x_2)^2$ non è $x_1^2+x_2^2$: c'è il doppio prodotto $2x_1x_2$. Per i tensori succede la stessa cosa.

Per la dimostrazione serve un'ipotesi: se si parla di energia il materiale è iperelastico, quindi $\\mathbb A=\\mathbb A^T$, cioè $\\mathbb A\\tens E_1\\cdot\\tens E_2=\\mathbb A\\tens E_2\\cdot\\tens E_1$. Strategia: sviluppiamo l'energia dello stato somma come si sviluppa un quadrato di binomio.`,
      },
      {
        id: 'l55-9',
        kind: 'derivazione',
        title: 'Il termine di accoppiamento',
        md: 'Vogliamo confrontare $\\varphi(\\tens E_1+\\tens E_2)$ con $\\varphi(\\tens E_1)+\\varphi(\\tens E_2)$ e trovare esattamente che cosa c’è in più. Sviluppiamo il prodotto, usiamo la simmetria di $\\mathbb A$ per riunire i termini misti, riconosciamo le due energie singole.',
        source: D(4, '4.16.5', 'Teo 4.16.3', 97),
        der: {
          sample,
          lines: [
            { tex: '\\varphi(\\tens E_1+\\tens E_2)=\\tfrac12\\mathbb A[\\tens E_1+\\tens E_2]\\cdot(\\tens E_1+\\tens E_2)', why: `La formula di rappresentazione dell'energia, applicata alla deformazione somma.`, val: (v) => phiE(v, T.add(sym(v, 'a'), sym(v, 'b'))) },
            {
              tex: '=\\tfrac12\\big(\\mathbb A\\tens E_1\\cdot\\tens E_1+\\mathbb A\\tens E_1\\cdot\\tens E_2+\\mathbb A\\tens E_2\\cdot\\tens E_1+\\mathbb A\\tens E_2\\cdot\\tens E_2\\big)',
              why: `Sviluppiamo: $\\mathbb A$ è lineare, quindi $\\mathbb A[\\tens E_1+\\tens E_2]=\\mathbb A\\tens E_1+\\mathbb A\\tens E_2$, e poi il prodotto scalare si distribuisce sui due addendi del secondo fattore. Escono quattro termini, come nel quadrato di un binomio.`,
              val: (v) => {
                const [a, b, M] = [sym(v, 'a'), sym(v, 'b'), A(v)];
                return 0.5 * (T.ddot(T.apply4(M, a), a) + T.ddot(T.apply4(M, a), b) + T.ddot(T.apply4(M, b), a) + T.ddot(T.apply4(M, b), b));
              },
            },
            {
              tex: '=\\tfrac12\\big(\\mathbb A\\tens E_1\\cdot\\tens E_1+2\\,\\mathbb A\\tens E_1\\cdot\\tens E_2+\\mathbb A\\tens E_2\\cdot\\tens E_2\\big)',
              why: `Usiamo l'ipotesi $\\mathbb A=\\mathbb A^T$: i due termini misti sono uguali, $\\mathbb A\\tens E_2\\cdot\\tens E_1=\\mathbb A\\tens E_1\\cdot\\tens E_2$, e si sommano in un unico termine con il fattore 2.`,
              aggiunto: true,
              ask: { q: 'Perché i due termini misti si possono riunire?', options: ['Perché $\\mathbb A=\\mathbb A^T$', 'Perché $\\tens E_1=\\tens E_2$', 'Perché il materiale è isotropo', 'Perché $\\varphi$ è lineare'], correct: 0, why: 'È la simmetria maggiore, che vale per ogni materiale iperelastico: $\\mathbb A\\tens E_1\\cdot\\tens E_2=\\mathbb A\\tens E_2\\cdot\\tens E_1$. Le due deformazioni sono qualsiasi; l’isotropia basterebbe (per Teo 4.12.2) ma non è necessaria; e $\\varphi$ lineare è proprio ciò che il teorema smentisce.' },
              val: (v) => {
                const [a, b, M] = [sym(v, 'a'), sym(v, 'b'), A(v)];
                return 0.5 * (T.ddot(T.apply4(M, a), a) + 2 * T.ddot(T.apply4(M, a), b) + T.ddot(T.apply4(M, b), b));
              },
            },
            {
              tex: '=\\tfrac12\\mathbb A\\tens E_1\\cdot\\tens E_1+\\tfrac12\\mathbb A\\tens E_2\\cdot\\tens E_2+\\mathbb A\\tens E_1\\cdot\\tens E_2',
              why: `Distribuiamo il $\\frac12$: sul termine misto si semplifica con il 2.`,
              val: (v) => phiE(v, sym(v, 'a')) + phiE(v, sym(v, 'b')) + T.ddot(T.apply4(A(v), sym(v, 'a')), sym(v, 'b')),
            },
            {
              tex: '=\\varphi(\\tens E_1)+\\varphi(\\tens E_2)+\\mathbb A\\tens E_1\\cdot\\tens E_2',
              why: `I primi due addendi sono le energie dei due stati presi da soli. Resta un terzo addendo, il **termine di accoppiamento** $\\mathbb A\\tens E_1\\cdot\\tens E_2$, che in generale non è nullo.`,
              val: (v) => phiE(v, sym(v, 'a')) + phiE(v, sym(v, 'b')) + T.ddot(T.apply4(A(v), sym(v, 'a')), sym(v, 'b')),
              eq: 'Teo 4.16.3',
            },
          ],
        },
      },
      {
        id: 'l55-10',
        kind: 'spiega',
        title: 'Che cosa dice il termine di accoppiamento',
        md: `Il risultato si legge così: l'energia dello stato somma è la somma delle energie **più** un termine che dipende da entrambi gli stati insieme. Poiché $\\mathbb A\\tens E_1=\\tens T_1$, quel termine si può leggere anche come $\\tens T_1\\cdot\\tens E_2$: è il lavoro che la tensione del primo stato compie sulla deformazione del secondo (deduzione). Non appartiene a nessuno dei due casi da soli: nasce solo quando ci sono entrambi.

Controllo su un caso semplice (esempio aggiunto): prendi $\\tens E_2=\\tens E_1$. Lo stato somma è $2\\tens E_1$, e siccome $\\varphi$ è quadratica la sua energia è $4\\varphi(\\tens E_1)$. La formula dà $\\varphi(\\tens E_1)+\\varphi(\\tens E_1)+\\mathbb A\\tens E_1\\cdot\\tens E_1=2\\varphi(\\tens E_1)+2\\varphi(\\tens E_1)$: di nuovo $4\\varphi(\\tens E_1)$. Senza il termine di accoppiamento avremmo trovato la metà.

La conseguenza pratica: puoi sommare spostamenti, deformazioni e tensioni di due casi di carico, ma **non le loro energie**. Lo stesso vale per l'energia di tutto il corpo, che è l'integrale di $\\varphi$ sul volume (deduzione): la incontrerai nel prossimo modulo.`,
      },
      {
        id: 'l55-11',
        kind: 'prova',
        title: 'Il lavoro dipende dal quadrato dello stato finale',
        md: 'Il diagramma del cammino di deformazione, già visto nella lezione «Energia specifica e iperelasticità», porta un corpo dalla configurazione naturale a uno stato finale $\\tens E^*$ lungo tre cammini diversi e calcola il lavoro speso.',
        tasks: [
          'Con la simmetria maggiore attiva, leggi il lavoro lungo i tre cammini: coincide sempre con $\\varphi(\\tens E^*)=\\frac12\\mathbb A\\tens E^*\\cdot\\tens E^*$, che dipende solo dallo stato finale.',
          'Nota che quel lavoro è quadratico nello stato finale (deduzione): per uno stato doppio il lavoro quadruplica, non raddoppia. È la stessa ragione per cui nella somma di due stati compare il termine di accoppiamento.',
        ],
        visual: SVG('cammino'),
      },
      {
        id: 'l55-12',
        kind: 'domanda',
        q: { id: 'l55-q2', kind: 'scelta', q: 'Un isotropo subisce prima una compressione uniforme $\\tens E_1=a\\tens I$, poi gli si somma uno scorrimento $\\tens E_2$ con $\\operatorname{tr}\\tens E_2=0$. Quanto vale il termine di accoppiamento $\\mathbb A\\tens E_1\\cdot\\tens E_2$?', options: ['Zero', '$2\\mu a$', '$3\\lambda a$', 'Non si può dire senza conoscere $\\tens E_2$'], correct: 0, why: 'Con Lamé, $\\mathbb A\\tens E_1=(2\\mu+3\\lambda)a\\tens I$, e $\\tens I\\cdot\\tens E_2=\\operatorname{tr}\\tens E_2=0$ (deduzione). In questo caso particolare le energie si sommano: una variazione di volume e una distorsione a volume costante non si «accoppiano» in un isotropo. In generale però il termine non è nullo.' },
      },
      {
        id: 'l55-13',
        kind: 'spiega',
        title: 'Attenzione a…',
        md: `Due errori ricorrono su questo argomento.

1. **Sommare le energie di due casi di carico.** È tentante, perché tutto il resto del problema si sovrappone: spostamenti, deformazioni, tensioni. Ma l'energia è quadratica nella deformazione, e nella somma compare il termine di accoppiamento $\\mathbb A\\tens E_1\\cdot\\tens E_2$. Sommare le energie significa dimenticarlo.
2. **Applicare la sovrapposizione a problemi non lineari.** Il teorema discende dalla linearità di **tutte** le equazioni. Con l'attrito (e, più in generale, con qualunque non linearità, come i grandi spostamenti (deduzione)) la soluzione dipende dalla storia e dall'ordine dei carichi, e la somma delle soluzioni non è la soluzione della somma.`,
      },
      {
        id: 'l55-14',
        kind: 'riassunto',
        md: `**Il filo della lezione.** Tutte le equazioni del problema elastico, congruenza, legame, equilibrio e condizioni al contorno, sono lineari; per questo a una combinazione lineare dei dati corrisponde la stessa combinazione delle soluzioni, ed è ciò che permette di raddoppiare un carico raddoppiando la risposta o di scomporre un telaio in casi semplici. Con un problema non lineare, per esempio con attrito, questo cade e conta l'ordine dei carichi. L'energia invece non si sovrappone nemmeno nel caso lineare, perché è quadratica: sviluppando l'energia dello stato somma e usando la simmetria $\\mathbb A=\\mathbb A^T$ si trova, oltre alle due energie, il termine di accoppiamento.

- Sovrapposizione: $\\{\\alpha\\vet b_1+\\beta\\vet b_2,\\ \\alpha\\hat{\\vet s}_1+\\beta\\hat{\\vet s}_2,\\ \\alpha\\hat{\\vet u}_1+\\beta\\hat{\\vet u}_2\\}\\mapsto\\{\\alpha\\vet u_1+\\beta\\vet u_2,\\ \\alpha\\tens E_1+\\beta\\tens E_2,\\ \\alpha\\tens T_1+\\beta\\tens T_2\\}$ (Teo 4.16.2).
- Non linearità dell'energia: $\\varphi(\\tens E_1+\\tens E_2)=\\varphi(\\tens E_1)+\\varphi(\\tens E_2)+\\mathbb A\\tens E_1\\cdot\\tens E_2$ (Teo 4.16.3).`,
        orale: ['Problema elastico: sovrapposizione; non linearità di $\\varphi$. (dispensa, domanda 14, seconda parte)'],
      },
    ],
  },
];
