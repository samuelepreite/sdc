/**
 * Lezioni guidate del Modulo 8 (Cap. 6). Derivazioni solo dove la dispensa le sviluppa; le righe con `val` sono
 * verificate su 25 campioni casuali (tests/lezioni.test.ts). Numeri da engine/criteri, engine/elastico, engine/tensione.
 * Riscritte secondo docs/GUIDA_LEZIONI.md: il contenuto delle schede (significato, formule, spiegazione, errori tipici)
 * sta tutto nelle lezioni.
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
const SPAZIO = (stato: 'trazione' | 'taglio' | 'huber' | 'generico', show: ('vonMises' | 'tresca' | 'beltrami' | 'galileo')[], view?: 'prospettiva' | 'asse'): LessonVisual => ({
  kind: 'criteri3d',
  scene: { mode: 'spazio', stato, show, ...(view ? { view } : {}) },
});
const f = (x: number, d = 3) => T.fmt(x, d);

const sample = (r: () => number): R => {
  const o: R = { a: 4 * r() - 2, b: 4 * r() - 2, c: 4 * r() - 2, nu: 0.05 + 0.4 * r(), E: 1 + 3 * r(), mu: 0.5 + 2 * r(), la: 0.2 + 2 * r(), p: 0.2 + 3 * r(), sz: 4 * r() - 2, tx: 2 * r() - 1, ty: 2 * r() - 1, co: 0.5 + r(), phi: 0.1 + 0.8 * r() };
  for (let k = 0; k < 6; k++) o[`e${k}`] = 2 * r() - 1;
  return o;
};
const S3 = (v: R): C.S3 => C.sortS([v.a, v.b, v.c]);
const diag = (s: C.S3): T.Mat => [s[0], 0, 0, 0, s[1], 0, 0, 0, s[2]];
const Esym = (v: R): T.Mat => [v.e0, v.e3, v.e5, v.e3, v.e1, v.e4, v.e5, v.e4, v.e2];

// ------------------------------------------------------------------ numeri d'esempio (dal motore)
/** acciaio del diagramma: σ_y = 235 MPa, ν (sicurezza) = 1,75 */
const ADM_ACCIAIO = 235 / 1.75;
/** profondità di crisi prevista da Beltrami nel modello 3D (σ_L = 1, ρg = 1, ν di Poisson = 0,3) */
const HL_MODELLO = C.huberDepth(1, 1, 0.3);
/** stato d'esempio (80, 40, −100) MPa */
const ES: C.S3 = [80, 40, -100];

export const M8_LEZIONI: Lesson[] = [
  // ================================================================== c8.1
  {
    concept: 'c8.1',
    title: 'Dalla risposta alla verifica: resistenza e sicurezza',
    minutes: 20,
    source: D(6, '6.1–6.2', 'Def 6.2.1', '144–146'),
    visual: SVG('criteri', { tab: 'verifica' }),
    steps: [
      {
        id: 'l81-1',
        kind: 'spiega',
        title: 'Dove siamo e dove andiamo',
        md: `Dopo sette moduli sappiamo fare una cosa importante: dato un corpo, i suoi vincoli e i suoi carichi, sappiamo calcolare **lo stato di tensione in ogni punto**, cioè il tensore $\\tens T$ (Cap. 3), e per le travi lo sappiamo fare con formule esplicite (Saint-Venant, Cap. 5). Manca però la domanda che interessa davvero a chi progetta: **con quelle tensioni il materiale regge, oppure no?**

Il capitolo 6 risponde a questa domanda. In questa prima lezione partiamo dal caso più semplice, quello in cui in un punto agisce una sola tensione normale, come nel provino di una prova di trazione. Le tappe sono quattro: capire perché la teoria lineare da sola non avvisa della rottura; distinguere i materiali duttili da quelli fragili; scrivere la **verifica di resistenza**; aggiungere un margine e arrivare alla **verifica di sicurezza**.`,
      },
      {
        id: 'l81-2',
        kind: 'spiega',
        title: 'Che cosa la teoria lineare non può dirci',
        md: `Partiamo da quello che abbiamo fatto finora. I problemi che abbiamo risolto si chiamano **problemi di risposta** (§6.1): dati i carichi, troviamo la risposta del corpo, cioè spostamenti, deformazioni e tensioni. Sono problemi **lineari**: se raddoppi i carichi, raddoppiano tutte le risposte.

Proprio questa linearità ci dice che il modello non contiene da nessuna parte il momento in cui il materiale cede. Puoi moltiplicare i carichi per dieci, per mille: il modello risponde con tensioni dieci o mille volte più grandi e non segnala niente di diverso. Nella realtà, invece, a un certo punto arriva la **crisi** del materiale. La dispensa ne distingue due livelli: una crisi **locale**, come una lesione in un punto, e una crisi **globale**, cioè il collasso della struttura.

Serve quindi un passo in più, che il problema di risposta non fa: **verificare** che lo stato di tensione trovato sia compatibile con la resistenza del materiale. Per sapere quanto resiste un materiale, però, dobbiamo guardare gli esperimenti.`,
      },
      {
        id: 'l81-3',
        kind: 'spiega',
        title: 'Due famiglie di materiali: duttili e fragili',
        md: `Nel Cap. 4 abbiamo visto la prova di trazione sull'acciaio e quella di compressione sul calcestruzzo. Le due curve tensione–deformazione sono molto diverse, e la dispensa ne ricava due famiglie di materiali (§6.1.1, figura a p. 145).

- I materiali **duttili**, come l'acciaio da carpenteria, a un certo valore della tensione **snervano**: la tensione di snervamento si indica con $\\sigma_y$. Dopo lo snervamento hanno un ampio campo plastico, cioè si deformano molto prima di rompersi. Inoltre si comportano allo stesso modo in trazione e in compressione: snervano a $+\\sigma_y$ e a $-\\sigma_y$.
- I materiali **fragili**, come il calcestruzzo, si deformano poco prima della rottura. In più resistono **molto di più a compressione che a trazione**: la resistenza a trazione $\\sigma_t$ e quella a compressione $\\sigma_c$ sono molto diverse.

Tieni a mente questa differenza, perché tornerà in ogni criterio del capitolo: alcuni criteri ammettono resistenze diverse in trazione e compressione, altri no.`,
      },
      {
        id: 'l81-4',
        kind: 'domanda',
        q: { id: 'l81-q2', kind: 'scelta', q: 'Perché un problema di risposta, da solo, non può dirci quando il materiale va in crisi?', options: ['Perché è lineare: raddoppiando i carichi raddoppiano le risposte, e nel modello non c\'è un valore oltre il quale cambia qualcosa', 'Perché non sa calcolare le tensioni nei punti interni', 'Perché vale solo per i materiali fragili', 'Perché trascura le forze d\'inerzia'], correct: 0, why: 'Il problema di risposta calcola le tensioni benissimo, anche all\'interno; il punto è che, essendo lineare, risponde a qualunque carico senza mai segnalare la crisi (§6.1). Il legame con i materiali fragili e le forze d\'inerzia non c\'entrano: la crisi va cercata confrontando le tensioni con la resistenza misurata.' },
      },
      {
        id: 'l81-5',
        kind: 'spiega',
        title: 'Il caso facile: una sola tensione normale',
        md: `Ora che sappiamo che serve un confronto con gli esperimenti, chiediamoci in quale caso il confronto è semplice.

Lo stato di tensione prodotto in esercizio dai carichi si chiama **stato tensionale di esercizio** e si scrive $\\tens T_{es}(P)$, dove $P$ è il punto. L'esempio della dispensa è il telaio di una moto: in ogni punto del telaio i carichi producono un certo $\\tens T_{es}$. La verifica si fa **punto per punto** (§6.2.1): in tutti i punti, oppure in quelli che, se verificati, garantiscono anche gli altri.

Il caso facile è quello **monoassiale**, in cui nel riferimento giusto la matrice è
$$[\\tens T_{es}]=\\operatorname{diag}(\\sigma_{es},0,0),$$
cioè c'è una sola tensione normale $\\sigma_{es}$ e tutto il resto è zero. È esattamente lo stato del provino in una prova di trazione o di compressione. Quindi possiamo confrontare $\\sigma_{es}$ direttamente con il risultato della prova: stiamo paragonando situazioni dello stesso tipo.`,
      },
      {
        id: 'l81-6',
        kind: 'spiega',
        title: 'Quale valore della prova prendere come limite?',
        md: `Per confrontare ci serve un numero preso dalla prova: la **tensione limite** $\\sigma_L$ (§6.2.2). Quale numero scegliere dipende dal tipo di materiale.

- Per un **duttile** si prende $\\sigma_L=\\sigma_y$, la tensione di snervamento, e non quella di rottura. Il motivo è che in esercizio non si accettano deformazioni permanenti: una struttura che dopo ogni carico resta un po' storta non è accettabile, anche se non si è rotta.
- Per un **fragile** si prende $\\sigma_L=\\sigma_R$, la tensione di rottura, perché un fragile si rompe senza un vero snervamento prima (deduzione).

Siccome trazione e compressione possono dare valori diversi, la dispensa scrive $\\sigma_L^t$ per la tensione limite di trazione e $\\sigma_L^c$ per quella di compressione. Con la convenzione del corso, trazione positiva, $\\sigma_L^c$ è un numero **negativo**.`,
      },
      {
        id: 'l81-7',
        kind: 'spiega',
        title: 'Il dominio di resistenza è un segmento',
        md: `Mettiamo insieme i pezzi. Lo stato monoassiale è compatibile con la resistenza se la tensione di esercizio sta tra i due limiti:
$$\\sigma_L^c\\le\\sigma_{es}\\le\\sigma_L^t\\qquad\\text{(condizione di resistenza, §6.2.2).}$$
Leggila sull'asse dei numeri: i valori ammessi formano un **segmento**, che va dal limite di compressione (a sinistra dello zero) al limite di trazione (a destra). Questo segmento si chiama **dominio di resistenza**. Se il punto che rappresenta $\\sigma_{es}$ cade dentro, la verifica è soddisfatta; se cade fuori, il materiale in quel punto va in crisi (figura a p. 146).

Per l'acciaio il segmento è simmetrico, $[-\\sigma_y,\\sigma_y]$. Per il calcestruzzo è molto sbilanciato: corto dalla parte della trazione, lungo dalla parte della compressione. Nel diagramma a destra vedi il segmento azzurro: è proprio questo dominio.`,
      },
      {
        id: 'l81-8',
        kind: 'domanda',
        q: { id: 'l81-q3', kind: 'scelta', q: 'Per verificare un acciaio da carpenteria, quale tensione limite si usa?', options: ['La tensione di snervamento $\\sigma_y$', 'La tensione di rottura $\\sigma_R$', 'La media tra snervamento e rottura', 'Una tensione diversa in trazione e compressione'], correct: 0, why: 'L\'acciaio è duttile e in esercizio non si accettano deformazioni permanenti, quindi $\\sigma_L=\\sigma_y$ (§6.2.2). La rottura arriva dopo un ampio campo plastico: usarla vorrebbe dire accettare deformazioni permanenti. E l\'acciaio si comporta allo stesso modo in trazione e compressione.' },
      },
      {
        id: 'l81-9',
        kind: 'spiega',
        title: 'Perché non possiamo lavorare vicino al limite',
        md: `La verifica di resistenza ci dice se siamo dentro il dominio. Ma basterebbe progettare in modo che $\\sigma_{es}$ arrivi appena sotto $\\sigma_L$?

La dispensa risponde con un'immagine (§6.2.3): una copertura progettata per lambire la crisi crollerebbe appena un uccellino ci si posa sopra. Il punto è che tutto ciò che entra nel calcolo è **incerto**:
- la **geometria** reale differisce da quella del disegno;
- i **carichi** reali non sono esattamente quelli previsti;
- il **modello** (Saint-Venant, l'elasticità lineare) è un'idealizzazione;
- la **resistenza** del materiale varia da un pezzo all'altro.

Queste incertezze si possono ridurre, con calcoli migliori e controlli migliori, ma **non si possono eliminare**. Quindi serve un margine tra la situazione di esercizio e quella di crisi.`,
      },
      {
        id: 'l81-10',
        kind: 'spiega',
        title: 'Il coefficiente di sicurezza e la tensione ammissibile',
        md: `Il margine si introduce con un numero. La **Def 6.2.1** introduce il **coefficiente di sicurezza** $\\nu\\ge1$, che è un **divisore delle resistenze**: invece di confrontare con $\\sigma_L$, si confronta con un valore più piccolo, la **tensione ammissibile**
$$\\sigma_{adm}:=\\frac{\\sigma_L}\\nu.$$
Attenzione al simbolo: in questo capitolo la dispensa usa $\\nu$ anche per il coefficiente di Poisson, che comparirà nei criteri di Grashof e di Beltrami. Qui $\\nu$ è il **coefficiente di sicurezza**, e non ha niente a che fare con la contrazione trasversale.

La verifica di sicurezza diventa
$$\\sigma_{adm}^c\\le\\sigma_{es}\\le\\sigma_{adm}^t.$$
Questo modo di procedere si chiama **metodo delle tensioni ammissibili** ed è il più vecchio. Siccome $\\nu\\ge1$, il nuovo segmento sta tutto dentro il precedente: il **dominio di sicurezza** è contenuto nel dominio di resistenza.

Per fare un conto (esempio aggiunto): con $\\sigma_y=235$ MPa, il valore usato nel diagramma, e $\\nu=1{,}75$, la tensione ammissibile è circa ${f(ADM_ACCIAIO)}$ MPa.`,
      },
      {
        id: 'l81-11',
        kind: 'spiega',
        title: 'Quanto vale ν, e perché cambia con il materiale',
        md: `Il coefficiente di sicurezza non è uguale per tutti i materiali. La dispensa dà questi valori indicativi:
- acciaio: 1,7–1,8;
- legno: 2,5;
- calcestruzzo: 3;
- muratura: 4–10.

La regola che la dispensa mette in evidenza è una: il coefficiente è **più basso per i duttili**. Il motivo, dice la dispensa, è la loro capacità di resistenza anche quando si supera lo snervamento: un duttile ha ancora una **riserva**. Un fragile invece cede di colpo, senza preavviso, e il margine deve essere più ampio (deduzione).

Nota anche l'ampiezza dell'intervallo per la muratura: più il materiale è incerto, più il margine cresce (deduzione). Per l'orale ricorda la regola e l'ordine di grandezza, non serve ricordare ogni valore.`,
      },
      {
        id: 'l81-12',
        kind: 'prova',
        title: 'Due domini sullo stesso asse',
        md: 'Nel diagramma il segmento azzurro è il dominio di resistenza, quello verde, più corto, il dominio di sicurezza. Il pallino è la tensione di esercizio: muovila con il cursore e guarda di che colore diventa.',
        tasks: [
          'Con l\'acciaio porta σ_es tra la tensione ammissibile e la tensione limite: il pallino cambia colore perché la resistenza è verificata ma la sicurezza no. È proprio la zona del margine.',
          'Passa al calcestruzzo: nota quanto è corto il dominio dalla parte della trazione rispetto a quella della compressione. È la fragilità vista sul dominio.',
          'Sempre con il calcestruzzo, prova una trazione di 2 MPa: esce già dal dominio di sicurezza, mentre una compressione di 8 MPa, quattro volte più grande, è ancora accettata.',
        ],
        visual: SVG('criteri', { tab: 'verifica' }),
      },
      {
        id: 'l81-13',
        kind: 'domanda',
        q: { id: 'l81-q1', kind: 'scelta', q: 'Che cosa rappresenta il coefficiente ν della Def 6.2.1?', options: ['Un divisore delle resistenze che tiene conto delle incertezze', 'Il coefficiente di Poisson', 'Il rapporto tra resistenza a trazione e a compressione', 'Un moltiplicatore della tensione limite'], correct: 0, why: 'Nella Def 6.2.1 $\\nu\\ge1$ divide $\\sigma_L$ e dà $\\sigma_{adm}$: serve a coprire le incertezze su geometria, carichi, modello e resistenza. Il simbolo è lo stesso del coefficiente di Poisson (nota NF-08), ed è per questo che la confusione è facile. Se moltiplicasse la tensione limite, il dominio si allargherebbe invece di restringersi.' },
      },
      {
        id: 'l81-14',
        kind: 'spiega',
        title: 'Attenzione a…',
        md: `Tre errori ricorrono spesso su questo argomento.

1. **Confondere il $\\nu$ di sicurezza con il coefficiente di Poisson.** Nel capitolo 6 lo stesso simbolo indica tutti e due (nota NF-08). Il $\\nu$ di sicurezza è maggiore o uguale a 1 e divide la resistenza; quello di Poisson è un numero tra 0 e 1/2 che descrive la contrazione trasversale. Quando li trovi vicini, chiediti sempre quale dei due è.
2. **Usare per un duttile la tensione di rottura invece di quella di snervamento.** È tentante perché la rottura sembra «il vero limite». Ma la verifica riguarda l'esercizio, e in esercizio non si accettano deformazioni permanenti: il limite è lo snervamento.
3. **Dimenticare che i fragili hanno resistenze diverse in trazione e compressione.** Un calcestruzzo verificato con un segmento simmetrico, preso dalla compressione, risulterebbe sicuro in trazioni che in realtà lo rompono.`,
      },
      {
        id: 'l81-15',
        kind: 'riassunto',
        md: `**Il filo della lezione.** I problemi di risposta sono lineari e non dicono mai quando il materiale cede: per saperlo bisogna confrontare le tensioni con la resistenza misurata nelle prove. Nel caso monoassiale il confronto è diretto, perché lo stato del punto è dello stesso tipo di quello del provino. Si prende come tensione limite lo snervamento per i duttili e la rottura per i fragili, che hanno resistenze diverse in trazione e compressione, e si ottiene un dominio di resistenza a forma di segmento. Siccome geometria, carichi, modello e resistenza sono incerti, si divide la resistenza per un coefficiente di sicurezza e si verifica con la tensione ammissibile.

- Condizione di resistenza: $\\sigma_L^c\\le\\sigma_{es}\\le\\sigma_L^t$ (§6.2.2); duttili $\\sigma_L=\\sigma_y$, fragili $\\sigma_L=\\sigma_R$.
- Tensione ammissibile, con $\\nu$ di sicurezza: $\\sigma_{adm}=\\sigma_L/\\nu$, $\\nu\\ge1$ (Def 6.2.1).
- Verifica di sicurezza: $\\sigma_{adm}^c\\le\\sigma_{es}\\le\\sigma_{adm}^t$ (metodo delle tensioni ammissibili).
- Valori di $\\nu$: acciaio 1,7–1,8; legno 2,5; calcestruzzo 3; muratura 4–10; più bassi per i duttili.`,
        orale: ['Duttili e fragili; tensione limite; verifica di resistenza monoassiale. (dispensa, domanda 1)', 'Coefficiente di sicurezza, tensione ammissibile, dominio di sicurezza (tensioni ammissibili). (dispensa, domanda 2)'],
      },
    ],
  },
  // ================================================================== c8.2
  {
    concept: 'c8.2',
    title: 'Perché servono i criteri: la tensione ideale',
    minutes: 20,
    source: D(6, '6.3', 'Def 6.3.1', '147–148'),
    visual: SVG('criteri', { tab: 'piano' }),
    steps: [
      {
        id: 'l82-1',
        kind: 'spiega',
        title: 'Dove siamo e dove andiamo',
        md: `Nella lezione precedente, «Dalla risposta alla verifica: resistenza e sicurezza», abbiamo verificato uno stato **monoassiale**: una sola tensione normale, confrontata con il segmento che va da $\\sigma_L^c$ a $\\sigma_L^t$. Il problema è che in una struttura vera lo stato monoassiale è un'eccezione. Già in una trave inflessa e tagliata, in un punto della sezione agiscono insieme una tensione normale $\\sigma_z$ e delle tangenziali.

La domanda di questa lezione è quindi: **come si confronta uno stato di tensione qualunque con una prova che è monoassiale?** Vedremo prima perché il confronto diretto non funziona; poi l'idea che risolve il problema, la **tensione ideale**; infine la procedura concreta per i materiali isotropi, che useremo con ogni criterio nelle lezioni successive.`,
      },
      {
        id: 'l82-2',
        kind: 'spiega',
        title: 'Che cosa servirebbe davvero: un dominio a sei dimensioni',
        md: `Il tensore delle tensioni $\\tens T$ è simmetrico, quindi è determinato da **sei** numeri: le tre normali $\\sigma_x,\\sigma_y,\\sigma_z$ e le tre tangenziali $\\tau_{xy},\\tau_{yz},\\tau_{zx}$. Uno stato di tensione è allora un punto in uno spazio a sei dimensioni.

Generalizzando il segmento della lezione precedente, la cosa più naturale sarebbe determinare con gli esperimenti il **dominio limite** in questo spazio: l'insieme di tutti gli stati che il materiale sopporta (§6.3.1). Ma per tracciarlo bisognerebbe sottoporre provini a tutte le combinazioni possibili delle sei componenti. La dispensa dice che in pratica è **molto difficile**: già le prove biassiali, con due tensioni insieme, si fanno solo a scopi di ricerca, o dove l'investimento economico giustifica prove lunghe e costose. Nella pratica le informazioni sperimentali vengono da prove monoassiali.`,
      },
      {
        id: 'l82-3',
        kind: 'spiega',
        title: 'Perché non basta confrontare componente per componente',
        md: `Allora proviamo a usare la sola prova monoassiale. In sei componenti la prova al limite è il vettore $(\\sigma_L,0,0,0,0,0)$, mentre lo stato di esercizio è un vettore con sei componenti qualsiasi. Dovremmo decidere se il secondo è «più piccolo» del primo.

Il guaio, dice la dispensa, è che **tra vettori non esiste un ordinamento univoco**: tra due numeri si sa sempre quale è maggiore, tra due vettori no. Un esempio lo mostra (esempio aggiunto): prendi uno stato piano con $\\sigma_x=0{,}9\\,\\sigma_L$ e $\\sigma_y=-0{,}9\\,\\sigma_L$. Ogni componente, in valore assoluto, è minore di $\\sigma_L$. Vuol dire che lo stato è meno pericoloso della prova? Non lo sappiamo: una trazione in una direzione e una compressione nell'altra potrebbero sommare i loro effetti. Per rispondere serve un'ipotesi in più su che cosa causa la crisi. Ritroveremo questo esempio nella prova sul diagramma, e vedrai che alcuni criteri lo danno in crisi.`,
      },
      {
        id: 'l82-4',
        kind: 'domanda',
        q: { id: 'l82-q2', kind: 'vf', q: 'Se ogni componente di $\\tens T_{es}$ è, in valore assoluto, minore di $\\sigma_L$, il punto è sicuramente verificato.', answer: false, why: 'Tra vettori non c\'è un ordinamento univoco (§6.3.1): il fatto che ogni componente sia piccola non dice niente su come le componenti si combinano. Lo stato con $\\sigma_x=0{,}9\\,\\sigma_L$ e $\\sigma_y=-0{,}9\\,\\sigma_L$ ha componenti minori di $\\sigma_L$, eppure con il criterio di Tresca risulta in crisi.' },
      },
      {
        id: 'l82-5',
        kind: 'spiega',
        title: 'L\'idea: una tensione monoassiale «ugualmente pericolosa»',
        md: `Visto che sappiamo confrontare solo numeri, l'idea è trasformare lo stato pluriassiale in **un solo numero** che si possa paragonare con la prova.

La **Def 6.3.1** dice: un **criterio di resistenza** è un modello che, a partire dalle tensioni pluriassiali di esercizio, fornisce una **tensione ideale** $\\sigma_{id}$. La tensione ideale è la tensione **monoassiale fittizia** che sarebbe **ugualmente pericolosa** dello stato reale. La dispensa chiama questa idea **equivalenza del cimento**, dove «cimento» vuol dire lo sforzo a cui il materiale è sottoposto.

Due parole su «fittizia». Nel punto non agisce nessuna tensione pari a $\\sigma_{id}$: è un numero costruito apposta, che risponde alla domanda «quale trazione semplice metterebbe il materiale nella stessa situazione?». Una volta che ce l'hai, la verifica torna quella della lezione precedente: $\\sigma_{id}\\le\\sigma_L$.`,
      },
      {
        id: 'l82-6',
        kind: 'spiega',
        title: 'Da dove viene un criterio: una congettura sulla causa della crisi',
        md: `Resta da capire come si costruisce la tensione ideale. Qui entra la fisica.

Ogni criterio parte da una **congettura** su che cosa provoca la crisi (§6.3.2): per esempio, «il materiale cede quando la tensione normale è troppo grande», oppure «quando la tangenziale supera una soglia», oppure «quando l'energia accumulata è eccessiva». La congettura si traduce in una **funzione di crisi**
$$F(\\sigma_x,\\sigma_y,\\sigma_z,\\tau_{xy},\\tau_{yz},\\tau_{zx}),$$
un numero che misura quanto lo stato è vicino alla crisi secondo quella ipotesi.

Siccome ogni congettura è diversa, criteri diversi danno tensioni ideali diverse per lo stesso stato. Nessun criterio è vero in assoluto: va confrontato con gli esperimenti sul materiale, e lo vedremo in modo drammatico con l'esperimento di Huber.`,
      },
      {
        id: 'l82-7',
        kind: 'domanda',
        q: { id: 'l82-q1', kind: 'vf', q: 'La tensione ideale è la tensione principale massima dello stato di esercizio.', answer: false, why: 'La tensione ideale è una tensione monoassiale fittizia, ugualmente pericolosa dello stato reale (Def 6.3.1), e il suo valore dipende dalla congettura del criterio. Coincide con $s_1$ solo per il criterio di Galileo; con Tresca, per esempio, vale $s_1-s_3$.' },
      },
      {
        id: 'l82-8',
        kind: 'spiega',
        title: 'Materiali isotropi: da sei numeri a tre',
        md: `Sei variabili sono ancora tante. La dispensa le riduce con un'ipotesi (§6.3.3): il materiale è **isotropo fino alla crisi**, cioè si comporta allo stesso modo in tutte le direzioni, e anche la **crisi è isotropa**, cioè non ha direzioni privilegiate.

Ricordiamo dal Cap. 3 che per ogni stato di tensione esiste un riferimento, quello **principale**, in cui la matrice di $\\tens T$ è diagonale. Sulla diagonale ci sono le **tensioni principali**, ordinate come $s_1\\ge s_2\\ge s_3$. La dispensa ne conclude che si può lavorare nel riferimento principale e scrivere la funzione di crisi come
$$F(s_1,s_2,s_3):$$
le variabili passano da sei a tre. Il motivo lo dà la dispensa: se materiale e crisi sono isotropi, si può cambiare riferimento senza influenzare il problema, e conviene scegliere quello in cui lo stato di tensione è più semplice, cioè il principale. Detto a parole, conta solo «quanto» si tira o si comprime, non «in quale direzione». Senza questa ipotesi, per esempio nei materiali compositi, il cambio di riferimento non è «gratuito». Ed è per questo che tutti i criteri del capitolo si disegnano nello **spazio delle tensioni principali**, con tre assi $s_1,s_2,s_3$.`,
      },
      {
        id: 'l82-9',
        kind: 'derivazione',
        title: 'La procedura per i materiali isotropi',
        md: 'Dove vogliamo arrivare: una disuguaglianza tra **due numeri**, la tensione ideale e la tensione limite. L\'idea è valutare la stessa funzione di crisi su due stati, quello di esercizio e quello della prova al limite, e confrontarli. Ogni riga è una tappa della procedura del §6.3.3.',
        source: D(6, '6.3.3', undefined, '147–148'),
        der: {
          lines: [
            { tex: 'F(\\sigma_x,\\dots,\\tau_{zx})\\ \\to\\ F(s_1,s_2,s_3)', why: 'Prima di tutto usiamo l\'isotropia del materiale e della crisi: invece delle sei componenti in un riferimento qualunque bastano le tre tensioni principali.' },
            { tex: '\\tens T_{es}\\ \\to\\ s_1,s_2,s_3\\ \\to\\ F(s_1,s_2,s_3)', why: 'Passo 1, il calcolo: si trova lo stato di esercizio $\\tens T_{es}$ con il problema di risposta, se ne calcolano le tensioni principali (gli autovalori, Cap. 3) e si valuta la funzione di crisi.' },
            { tex: 'F(\\sigma_L,0,0)', why: 'Passo 2, la sperimentazione: la prova monoassiale al limite è anch\'essa uno stato di tensione, con principali $\\sigma_L$, 0, 0. Valutiamo su di essa la stessa funzione di crisi.' },
            {
              tex: 'F(s_1,s_2,s_3)\\le F(\\sigma_L,0,0)',
              why: 'Passo 3, la verifica: lo stato di esercizio non deve essere più vicino alla crisi della prova al limite, secondo la misura $F$ scelta dal criterio. È la disuguaglianza $(\\star)$ della dispensa.',
              ask: { q: 'Da dove viene il secondo membro della verifica?', options: ['Dalla prova monoassiale al limite', 'Dal calcolo strutturale', 'Dalla norma tecnica', 'Dal legame costitutivo'], correct: 0, why: 'Il secondo membro è la funzione di crisi valutata nella prova, cioè nello stato $(\\sigma_L,0,0)$ (§6.3.3). Il calcolo strutturale dà invece il primo membro, attraverso $\\tens T_{es}$; il legame costitutivo può servire per scrivere $F$, ma non dà il valore limite.' },
              eq: '(⋆) §6.3.3',
            },
            { tex: '\\sigma_{id}(s_1,s_2,s_3)\\le\\sigma_L', why: 'Infine, **se** la disuguaglianza si può manipolare in modo che a destra resti solo la tensione limite, quello che resta a sinistra è, per definizione, la tensione ideale del criterio. Non sempre si può: per Mohr–Coulomb, come vedremo, una tensione ideale semplice non c\'è.' },
          ],
        },
      },
      {
        id: 'l82-10',
        kind: 'spiega',
        title: 'Leggiamo la procedura su due casi',
        md: `La procedura dice, in parole: «calcola quanto è pericoloso lo stato secondo il criterio, calcola quanto è pericolosa la prova al limite secondo lo stesso criterio, e confronta».

Controlliamola sul caso che conosciamo già (deduzione). Se lo stato di esercizio è una trazione semplice, $(\\sigma,0,0)$, la verifica diventa $F(\\sigma,0,0)\\le F(\\sigma_L,0,0)$: lo stesso stato della prova, con un valore diverso. Per ogni criterio del capitolo che ha una tensione ideale (cioè tutti tranne Mohr–Coulomb) questo dà $\\sigma_{id}=\\sigma$ in trazione semplice, e torniamo esattamente alla verifica monoassiale della lezione precedente. Un criterio è dunque un modo coerente di estendere il segmento a tutti gli stati.

La dispensa aggiunge due osservazioni.
1. Se le resistenze in trazione e compressione sono diverse, $\\sigma_L^t\\ne\\sigma_L^c$, servono **due funzioni**, $F^t$ e $F^c$, e **due disuguaglianze**.
2. Per la **verifica di sicurezza** si usa $\\sigma_{adm}$ al posto di $\\sigma_L$.

Infine, il criterio si sceglie **in base agli esperimenti** sul materiale: non ne esiste uno valido per tutti.`,
      },
      {
        id: 'l82-11',
        kind: 'prova',
        title: 'Un punto, cinque risposte',
        md: 'Il diagramma mostra il piano in cui la terza tensione principale è nulla. Ogni curva è il bordo del dominio di un criterio, cioè il luogo dove $\\sigma_{id}=\\sigma_L$; il pallino è lo stato di lavoro e la tabella sotto dà le cinque tensioni ideali.',
        tasks: [
          'Metti il punto in trazione semplice (σ_b = 0, σ_a qualsiasi): tutte le curve passano per lo stesso punto sull\'asse e la tabella dà la stessa tensione ideale per ogni criterio. È il controllo del passo precedente.',
          'Porta il punto in σ_a = 0,9 e σ_b = −0,9: è l\'esempio della lezione. Nota che Galileo lo accetta, mentre Tresca e von Mises lo danno in crisi.',
          'Muovi il punto lungo la diagonale tratteggiata (σ_a = σ_b): qui i criteri si separano in un altro modo. Ricordatene quando parleremo di Huber.',
        ],
        visual: SVG('criteri', { tab: 'piano' }),
      },
      {
        id: 'l82-12',
        kind: 'domanda',
        q: { id: 'l82-q3', kind: 'scelta', q: 'Quando si può scrivere la funzione di crisi come $F(s_1,s_2,s_3)$?', options: ['Quando il materiale è isotropo fino alla crisi e la crisi è isotropa', 'Sempre, per qualunque materiale', 'Solo per i materiali duttili', 'Solo quando lo stato è monoassiale'], correct: 0, why: 'La riduzione da sei a tre variabili richiede che né il materiale né la crisi abbiano direzioni privilegiate (§6.3.3). Per un materiale in cui la crisi dipende dalla direzione, come i compositi citati dalla dispensa, la direzione dello stato conta e le sole principali non bastano. Duttilità e monoassialità non c\'entrano.' },
      },
      {
        id: 'l82-13',
        kind: 'spiega',
        title: 'Attenzione a…',
        md: `Tre errori tipici su questo argomento.

1. **Pensare che la tensione ideale sia una tensione realmente presente.** È fittizia: è la trazione semplice che sarebbe ugualmente pericolosa. Nessuna faccetta del punto ha su di sé $\\sigma_{id}$.
2. **Dimenticare che il riferimento principale si può usare solo per materiali e crisi isotropi.** La riduzione a $F(s_1,s_2,s_3)$ è una conseguenza dell'isotropia, non una regola generale.
3. **Credere che esista un criterio valido per tutti i materiali.** Ogni criterio nasce da una congettura e va confermato dagli esperimenti; per questo la dispensa ne presenta diversi, ciascuno con il suo campo di applicazione.`,
      },
      {
        id: 'l82-14',
        kind: 'riassunto',
        md: `**Il filo della lezione.** In uno stato pluriassiale non si può confrontare un tensore con un numero: il dominio limite a sei dimensioni non si può misurare, e tra vettori non c'è un ordinamento. Un criterio di resistenza risolve il problema partendo da una congettura sulla causa della crisi, tradotta in una funzione di crisi; da essa ricava una tensione ideale, cioè la trazione semplice fittizia ugualmente pericolosa. Se materiale e crisi sono isotropi la funzione dipende solo dalle tre tensioni principali; la verifica confronta la funzione sullo stato di esercizio con quella sulla prova al limite, e isolando $\\sigma_L$ diventa $\\sigma_{id}\\le\\sigma_L$.

- Verifica con un criterio: $F(s_1,s_2,s_3)\\le F(\\sigma_L,0,0)\\iff\\sigma_{id}(s_1,s_2,s_3)\\le\\sigma_L$ (§6.3.3).
- Resistenze diverse: due funzioni $F^t$, $F^c$ e due disuguaglianze; per la sicurezza $\\sigma_{adm}$ al posto di $\\sigma_L$.`,
        orale: ['Perché servono i criteri; tensione ideale e funzione di crisi; riduzione allo spazio delle tensioni principali. (dispensa, domanda 3)'],
      },
    ],
  },
  // ================================================================== c8.3
  {
    concept: 'c8.3',
    title: 'Galileo, Tresca, Grashof',
    minutes: 26,
    source: D(6, '6.4.1–6.4.3', undefined, '148–150'),
    visual: SVG('criteri', { tab: 'piano' }),
    steps: [
      {
        id: 'l83-1',
        kind: 'spiega',
        title: 'Dove siamo e dove andiamo',
        md: `Nella lezione precedente, «Perché servono i criteri: la tensione ideale», abbiamo costruito lo schema di ogni criterio: una congettura sulla causa della crisi, una funzione di crisi $F(s_1,s_2,s_3)$, il confronto con la prova $F(\\sigma_L,0,0)$ e infine la tensione ideale $\\sigma_{id}\\le\\sigma_L$.

Ora riempiamo lo schema con tre congetture diverse, una per ciascuna grandezza «locale» che conosciamo:
- **Galileo**: conta la **tensione normale** più grande;
- **Tresca**: conta la **tensione tangenziale** più grande;
- **Grashof**: conta la **dilatazione** più grande.

Per ogni criterio ci chiederemo sempre le stesse quattro cose: qual è l'idea fisica, quanto vale la tensione ideale, che forma ha il dominio e per quali materiali va bene.`,
      },
      {
        id: 'l83-2',
        kind: 'spiega',
        title: 'Galileo: la crisi dipende dalla tensione normale',
        md: `Il criterio più antico risale a Galileo, a metà del Seicento, e si usa nella forma data da Navier; si chiama anche criterio delle **massime tensioni normali** (§6.4.1). L'idea fisica è la più semplice possibile: il materiale cede quando la tensione normale, su qualche giacitura, diventa troppo grande in trazione o troppo grande in compressione.

Dal Cap. 3 sappiamo che, al variare della giacitura, la tensione normale sta sempre tra la minima e la massima principale: $s_3\\le\\sigma_m\\le s_1$ (Prop 3.13.1), dove $\\sigma_m$ è la tensione normale sulla giacitura di normale $\\hat m$. Quindi la tensione normale massima è $s_1$ e la minima è $s_3$, e la congettura dà subito
$$\\sigma_{id}^t=s_1\\le\\sigma_L^t,\\qquad\\sigma_{id}^c=s_3\\ge\\sigma_L^c.$$
Nota che il criterio usa due disuguaglianze, una per la trazione e una per la compressione: per questo **ammette resistenze diverse**. Nota anche che in ciascuna compare una sola tensione principale: le altre due non contano.`,
      },
      {
        id: 'l83-3',
        kind: 'spiega',
        title: 'Galileo nello spazio delle principali: un cubo',
        md: `Guardiamo che forma ha il dominio di Galileo nello spazio delle tensioni principali, il modello 3D a destra con i tre assi $s_1,s_2,s_3$.

Le due disuguaglianze dicono che **ogni** tensione principale deve stare tra $\\sigma_L^c$ e $\\sigma_L^t$. Nello spazio questo è una scatola con le facce parallele ai piani coordinati; con resistenze uguali in trazione e compressione, come nel modello, è un **cubo** centrato nell'origine (deduzione: la dispensa non descrive la forma). Nel modello lo vedi come il cubo grigio a spigoli.

La dispensa dà al criterio di Galileo un'**importanza storica** e dice chiaramente che **non rappresenta la realtà**. Un modo per capirlo (deduzione): per Galileo uno stato con $s_1=s_2=s_3$ vicino a $\\sigma_L$ e una trazione semplice $\\sigma_L$ sono ugualmente pericolosi, perché il criterio guarda una sola principale alla volta e ignora come si combinano.`,
        visual: SPAZIO('generico', ['galileo']),
      },
      {
        id: 'l83-4',
        kind: 'domanda',
        q: { id: 'l83-q2', kind: 'scelta', q: `Uno stato ha tensioni principali $(${ES[0]};\\ ${ES[1]};\\ ${ES[2]})$ MPa. Quanto vale la tensione ideale a trazione di Galileo?`, options: [`${C.galileo(ES).t} MPa`, `${C.tresca(ES)} MPa`, `${ES[1]} MPa`, `${-ES[2]} MPa`], correct: 0, why: `Per Galileo conta solo la massima tensione normale, $\\sigma_{id}^t=s_1=${C.galileo(ES).t}$ MPa (§6.4.1). ${C.tresca(ES)} MPa è $s_1-s_3$, cioè la tensione ideale di Tresca; ${-ES[2]} MPa è il valore assoluto di $s_3$, che serve nella verifica a compressione, $s_3\\ge\\sigma_L^c$.` },
      },
      {
        id: 'l83-5',
        kind: 'spiega',
        title: 'Tresca: l\'idea nasce dalle linee di Lüders',
        md: `Il secondo criterio viene dalla metallurgia della seconda metà dell'Ottocento, dallo studio dell'estrusione dei metalli; si deve a Tresca e a Guest ed è detto della **massima tensione tangenziale** (§6.4.2).

L'ispirazione è un fenomeno che abbiamo visto nella prova di trazione sull'acciaio (Cap. 4, §4.5.1): se il provino è coperto di vernice screpolante, a un certo punto compare una famiglia di linee inclinate di **45°** rispetto all'asse, le **linee di Lüders**. Dal cerchio di Mohr della trazione sappiamo che a 45° agisce proprio la **tensione tangenziale massima**: le linee sono la traccia di micro-scorrimenti lungo quelle giaciture.

Da qui la congettura: **la crisi arriva quando la tangenziale massima supera una soglia**. Il criterio ha un solo valore limite, quindi richiede **uguale resistenza** in trazione e compressione.`,
      },
      {
        id: 'l83-6',
        kind: 'derivazione',
        title: 'La tensione ideale di Tresca',
        md: 'Dove vogliamo arrivare: la tensione ideale di Tresca, scritta con le tensioni principali. La strategia è quella della procedura: calcolare la tangenziale massima nello stato di esercizio, calcolarla nella prova al limite, confrontare e isolare $\\sigma_L$. Il campione prende uno stato principale a caso e calcola la tangenziale massima con il motore del Cap. 3.',
        source: D(6, '6.4.2', undefined, 149),
        der: {
          sample,
          lines: [
            { tex: 'F=\\max_{\\hat n,\\hat\\nu}\\tau_{n\\nu}', why: 'Traduciamo la congettura in una funzione di crisi: $F$ è la più grande tensione tangenziale $\\tau_{n\\nu}$ al variare della giacitura $\\hat n$ e della direzione $\\hat\\nu$ nel suo piano.', val: (v) => tauMax(diag(S3(v))).value },
            { tex: '=\\frac{s_1-s_3}2', why: 'Il massimo lo conosciamo dal Cap. 3: la tangenziale massima è metà della differenza tra la massima e la minima tensione principale, ed è il raggio del cerchio di Mohr più grande (Prop 3.13.2).', val: (v) => (S3(v)[0] - S3(v)[2]) / 2 },
            {
              tex: 'F(\\sigma_L,0,0)=\\frac{\\sigma_L-0}2=\\frac{\\sigma_L}2',
              why: 'Applichiamo la stessa formula alla prova al limite, che ha principali $\\sigma_L$, 0, 0: la massima è $\\sigma_L$ e la minima è 0. È il cerchio di Mohr della figura a p. 149, con $s_1=\\sigma_L$ e raggio $\\sigma_L/2$.',
              ask: { q: 'Quanto vale la tangenziale massima nella prova di trazione al limite?', options: ['$\\sigma_L/2$', '$\\sigma_L$', '0', '$2\\sigma_L$'], correct: 0, why: 'Nella prova le principali sono $\\sigma_L$, 0, 0, e la tangenziale massima è $(\\sigma_L-0)/2$, il raggio del cerchio di Mohr. $\\sigma_L$ è la tensione normale, non la tangenziale; 0 è la tangenziale sulla sezione trasversale, che è una giacitura principale.' },
            },
            { tex: '\\frac{s_1-s_3}2\\le\\frac{\\sigma_L}2', why: 'Ora confrontiamo, come nella disuguaglianza $(\\star)$: la tangenziale massima dello stato non deve superare quella della prova al limite.', val: (v) => C.tresca(S3(v)) / 2 },
            { tex: '\\sigma_{id}=s_1-s_3\\le\\sigma_L', why: 'Moltiplichiamo entrambi i membri per 2, che è positivo e quindi non cambia il verso della disuguaglianza. A destra resta $\\sigma_L$, e a sinistra la tensione ideale di Tresca.', eq: '§6.4.2' },
          ],
        },
      },
      {
        id: 'l83-7',
        kind: 'spiega',
        title: 'Leggiamo Tresca su due casi',
        md: `Il risultato dice: **per Tresca conta la differenza tra la massima e la minima tensione principale**, cioè il diametro del cerchio di Mohr più grande. La principale intermedia $s_2$ non entra.

Controlliamolo sulla **trazione semplice** $(\\sigma,0,0)$: $\\sigma_{id}=\\sigma-0=\\sigma$, come deve essere.

Ora il **puro taglio** di intensità $\\tau$: dal Cap. 3 le principali sono $\\tau$, 0, $-\\tau$. Allora $\\sigma_{id}=\\tau-(-\\tau)=2\\tau$ (passaggio aggiunto). Quindi per Tresca un taglio puro è pericoloso quanto una trazione di intensità doppia, e la crisi arriva per $\\tau=\\sigma_L/2$.

Un'ultima lettura, che ci servirà con Huber: se aggiungi la stessa quantità a tutte e tre le principali, la differenza $s_1-s_3$ non cambia. Una pressione uniforme non cambia la tensione ideale di Tresca (lo nota la dispensa in §6.5.3).`,
      },
      {
        id: 'l83-8',
        kind: 'prova',
        title: 'Galileo e Tresca nello spazio delle principali',
        md: 'Nel modello sono accesi il cubo di Galileo e il prisma di Tresca. Il prisma si sviluppa lungo la diagonale $s_1=s_2=s_3$, l\'**asse idrostatico** disegnato tratteggiato. La forma del dominio di Tresca è una deduzione: la dispensa dà la rappresentazione nello spazio delle principali come aiuto, «utile ma non indispensabile».',
        tasks: [
          'Scegli la vista «lungo l\'asse idrostatico»: la sezione del prisma di Tresca è un esagono. Le sei facce corrispondono alle sei possibili coppie «massima–minima» tra le tre principali.',
          'Torna in prospettiva e nota che il prisma non si chiude: lungo l\'asse idrostatico è illimitato, perché una pressione uniforme non cambia s₁ − s₃.',
          'Scegli il puro taglio e leggi la tabella: Tresca dà 2τ. Poi scegli la trazione semplice: tutti i criteri danno la stessa tensione ideale.',
        ],
        visual: SPAZIO('generico', ['tresca', 'galileo']),
      },
      {
        id: 'l83-9',
        kind: 'domanda',
        q: { id: 'l83-q3', kind: 'scelta', q: 'Per Tresca, quanto vale la tensione ideale di un puro taglio di intensità $\\tau$?', options: ['$2\\tau$', '$\\tau$', '$\\sqrt3\\,\\tau$', '$\\tau/2$'], correct: 0, why: 'Le principali del puro taglio sono $\\tau$, 0, $-\\tau$, quindi $s_1-s_3=2\\tau$. $\\tau$ è quello che darebbe Galileo, che guarda solo $s_1$; $\\sqrt3\\,\\tau$ è von Mises, che vedremo più avanti; $\\tau/2$ confonde la tensione ideale con la tangenziale massima divisa per due.' },
      },
      {
        id: 'l83-10',
        kind: 'spiega',
        title: 'Per quali materiali va bene Tresca',
        md: `Mettiamo insieme le ipotesi e il risultato. Tresca richiede **uguale resistenza** in trazione e compressione, perché c'è un solo limite $\\sigma_L$. E l'idea viene dallo snervamento dei metalli: lo stesso filo lega il cerchio di Mohr della trazione (Cap. 3), le linee di Lüders a 45° (Cap. 4) e questo criterio.

Per questo la dispensa lo indica come **buono per i metalli molto duttili**, come il **rame** e l'**acciaio dolce**. Per un materiale fragile come il calcestruzzo, che ha resistenze molto diverse in trazione e compressione, Tresca non è adatto: il suo dominio è simmetrico per costruzione.`,
      },
      {
        id: 'l83-11',
        kind: 'spiega',
        title: 'Grashof: la crisi come dilatazione eccessiva',
        md: `Il terzo criterio, dovuto a Grashof e a Saint-Venant, è detto delle **massime dilatazioni** (§6.4.3). Questa volta la congettura riguarda la deformazione: il materiale cede quando una fibra si allunga troppo (in trazione) o si accorcia troppo (in compressione).

Le funzioni di crisi sono quindi due: $F^t=\\max\\varepsilon_n=e_1$ e $F^c=e_3$. Qui $\\varepsilon_n$ è la dilatazione della fibra di direzione $\\hat n$, e $e_1\\ge e_2\\ge e_3$ sono le **dilatazioni principali**, gli autovalori del tensore di deformazione $\\tens E$ (Cap. 2): come per le tensioni, la dilatazione massima e quella minima sono gli autovalori estremi. Due funzioni vuol dire che il criterio **ammette resistenze diverse** in trazione e compressione.

Per passare dalle dilatazioni alle tensioni serve però un legame costitutivo, e qui c'è l'ipotesi forte: il materiale è **elastico lineare isotropo fino alla crisi**.`,
      },
      {
        id: 'l83-12',
        kind: 'spiega',
        title: 'Perché serve la coassialità',
        md: `Abbiamo detto che il criterio guarda la dilatazione principale $e_1$, ma il calcolo ci dà le tensioni principali $s_1,s_2,s_3$. Per collegarle dobbiamo essere sicuri che $e_1$ sia misurata **nella stessa direzione** in cui agisce $s_1$.

Questo lo garantisce la **coassialità** (Teo 4.12.4): in un materiale elastico lineare isotropo le direzioni principali di deformazione e di tensione coincidono. Nel riferimento principale comune sia $[\\tens E]$ sia $[\\tens T]$ sono diagonali, e il legame inverso con i moduli tecnici (Cap. 4, §4.13.4) collega direttamente gli elementi diagonali:
$$e_1=\\frac1E\\big[s_1-\\nu(s_2+s_3)\\big].$$
Qui $E$ è il modulo di Young e $\\nu$ è il **coefficiente di Poisson**, non il coefficiente di sicurezza. Attenzione anche alla lettera $E$: il modulo di Young $E$, in corsivo, non va confuso con il tensore di deformazione $\\tens E$, in grassetto, che compare nello stesso ragionamento. Senza coassialità non potremmo scrivere questa relazione così semplice, ed è per questo che l'ipotesi di elasticità lineare isotropa fino alla crisi è essenziale.`,
      },
      {
        id: 'l83-13',
        kind: 'derivazione',
        title: 'La tensione ideale di Grashof',
        md: 'Dove vogliamo arrivare: la tensione ideale a trazione di Grashof, scritta con le tensioni principali. La strategia è confrontare la dilatazione massima dello stato con quella della prova al limite, e poi moltiplicare per il modulo di Young per tornare a una tensione. Il campione calcola la dilatazione con il legame inverso del motore ($\\nu$ di Poisson).',
        source: D(6, '6.4.3', undefined, '149–150'),
        der: {
          sample,
          lines: [
            { tex: 'F^t=\\max\\varepsilon_n=e_1', why: 'Traduciamo la congettura: la funzione di crisi a trazione è la dilatazione massima, cioè la dilatazione principale più grande.' },
            { tex: 'e_1\\le\\frac{\\sigma_L^t}E', why: 'Nella prova al limite le tensioni principali sono $\\sigma_L^t$, 0, 0, e il legame inverso dà $e_1=\\sigma_L^t/E$. La verifica $(\\star)$ chiede che la dilatazione dello stato non superi questo valore.', ask: { q: 'Quanto vale la dilatazione principale massima nella prova monoassiale al limite?', options: ['$\\sigma_L^t/E$', '$\\sigma_L^t$', '$-\\nu\\sigma_L^t/E$', '0'], correct: 0, why: 'Con principali $\\sigma_L^t$, 0, 0 il legame inverso dà $e_1=\\frac1E[\\sigma_L^t-\\nu(0+0)]=\\sigma_L^t/E$. $-\\nu\\sigma_L^t/E$ è la contrazione trasversale, cioè $e_2=e_3$; $\\sigma_L^t$ è una tensione, non una dilatazione.' } },
            {
              tex: 'e_1\\,E\\le\\sigma_L^t',
              why: 'Moltiplichiamo per $E$, che è positivo per le restrizioni di plausibilità (§4.15): il verso non cambia, e a destra resta la tensione limite. Il campione calcola $e_1E$ con il legame del motore.',
              val: (v) => El.strainIso(v.E, v.nu, diag(S3(v)))[0] * v.E,
              aggiunto: true,
            },
            {
              tex: '\\sigma_{id}^t=s_1-\\nu(s_2+s_3)\\le\\sigma_L^t',
              why: 'Sostituiamo $e_1=\\frac1E[s_1-\\nu(s_2+s_3)]$, valido per la coassialità: il fattore $E$ si semplifica e quello che resta è la tensione ideale a trazione.',
              val: (v) => C.grashof(S3(v), v.nu).t,
              eq: '§6.4.3',
            },
          ],
          checks: [
            { what: 'legame inverso: $e_1=\\frac1E[s_1-\\nu(s_2+s_3)]$', f: (v) => [El.strainIso(v.E, v.nu, diag(S3(v)))[0], (S3(v)[0] - v.nu * (S3(v)[1] + S3(v)[2])) / v.E] },
            { what: 'compressione: $e_3E=s_3-\\nu(s_1+s_2)$', f: (v) => [El.strainIso(v.E, v.nu, diag(S3(v)))[8] * v.E, C.grashof(S3(v), v.nu).c] },
          ],
        },
      },
      {
        id: 'l83-14',
        kind: 'spiega',
        title: 'Leggiamo Grashof: compressione e casi di controllo',
        md: `In compressione si ragiona allo stesso modo con la dilatazione minima $e_3$, che non deve scendere sotto $\\sigma_L^c/E$:
$$\\sigma_{id}^c=s_3-\\nu(s_1+s_2)\\ge\\sigma_L^c.$$
Il verso è $\\ge$ perché $\\sigma_L^c$ è negativo: la compressione non deve essere «più negativa» del limite.

Il risultato dice che, per Grashof, contano **tutte e tre** le principali: quella nella direzione della fibra e, attraverso il coefficiente di Poisson, le due trasversali. Per esempio (deduzione), comprimere lateralmente un corpo, cioè rendere negative $s_2$ e $s_3$, fa crescere $\\sigma_{id}^t$: per l'effetto Poisson la fibra 1 si allunga.

Due controlli. Trazione semplice $(\\sigma,0,0)$: $\\sigma_{id}^t=\\sigma$. Puro taglio, principali $\\tau$, 0, $-\\tau$: $\\sigma_{id}^t=\\tau-\\nu(0-\\tau)=(1+\\nu)\\tau$ (passaggio aggiunto), lo stesso valore che la dispensa usa come controprova in §6.7.`,
      },
      {
        id: 'l83-15',
        kind: 'prova',
        title: 'Tre domini nel piano',
        md: 'Grashof non è disegnato nel modello 3D; lo vedi qui, nel piano in cui la terza principale è nulla, insieme agli altri criteri. Le curve sono tracciate con resistenze uguali in trazione e compressione e con $\\nu=0{,}3$ (Poisson). Le forme sono deduzioni dalle formule.',
        tasks: [
          'Galileo è un quadrato: conta solo la tensione normale più grande, in trazione o in compressione.',
          'Tresca è un esagono: coincide con il quadrato nel primo e terzo quadrante (segni uguali), ma nel secondo e quarto (segni opposti) taglia gli angoli, perché lì la differenza s₁ − s₃ cresce.',
          'Porta il punto in puro taglio, σ_a = 0,5 e σ_b = −0,5: leggi Galileo 0,5, Tresca 1 e Grashof 0,65, cioè (1 + ν) per 0,5.',
        ],
        visual: SVG('criteri', { tab: 'piano' }),
      },
      {
        id: 'l83-16',
        kind: 'domanda',
        q: { id: 'l83-q1', kind: 'scelta', q: 'Per quale materiale la dispensa indica il criterio di Grashof?', options: ['La ghisa', 'L’acciaio dolce', 'Il rame', 'Qualunque materiale duttile'], correct: 0, why: 'Grashof ammette resistenze diverse in trazione e compressione, tipiche dei fragili, e la dispensa lo indica per la ghisa (§6.4.3). Acciaio dolce e rame sono i metalli molto duttili per cui la dispensa indica Tresca.' },
      },
      {
        id: 'l83-17',
        kind: 'spiega',
        title: 'Attenzione a…',
        md: `Tre errori tipici, più uno sul simbolo.

1. **Dimenticare che Tresca richiede uguale resistenza in trazione e compressione.** Ha un solo limite $\\sigma_L$ e un dominio simmetrico; per un fragile non va bene.
2. **Usare Grashof senza ricordare l'ipotesi di elasticità lineare isotropa fino alla crisi.** È questa ipotesi che dà la coassialità e permette di scrivere $e_1$ con le tensioni principali; se cade, la formula non vale.
3. **Confondere il $\\nu$ di Poisson di Grashof con il coefficiente di sicurezza.** Nella formula $s_1-\\nu(s_2+s_3)$ il $\\nu$ è quello di Poisson, tra 0 e 1/2.
4. **Prendere Galileo come criterio realistico.** Ha importanza storica, ma la dispensa avverte che non rappresenta la realtà.`,
      },
      {
        id: 'l83-18',
        kind: 'riassunto',
        md: `**Il filo della lezione.** Tre criteri, tre congetture locali. Galileo suppone che conti la tensione normale estrema, quindi $s_1$ e $s_3$, e ha un dominio a forma di scatola; ha solo importanza storica. Tresca, ispirato alle linee di Lüders, suppone che conti la tangenziale massima, quindi la differenza $s_1-s_3$; il dominio è un prisma esagonale illimitato lungo l'asse idrostatico, richiede uguale resistenza ed è adatto ai metalli molto duttili. Grashof suppone che conti la dilatazione estrema; con l'elasticità lineare isotropa e la coassialità la riscrive con le tensioni principali, ammette resistenze diverse ed è adatto alla ghisa.

- Galileo: $\\sigma_{id}^t=s_1\\le\\sigma_L^t$, $\\sigma_{id}^c=s_3\\ge\\sigma_L^c$ (§6.4.1).
- Tresca: $\\sigma_{id}=s_1-s_3\\le\\sigma_L$ (§6.4.2); puro taglio $2\\tau$.
- Grashof, con $\\nu$ di Poisson: $\\sigma_{id}^t=s_1-\\nu(s_2+s_3)\\le\\sigma_L^t$, $\\sigma_{id}^c=s_3-\\nu(s_1+s_2)\\ge\\sigma_L^c$ (§6.4.3).`,
        orale: ['Galileo, Tresca (Lüders), Grashof (coassialità), Beltrami: congetture, ipotesi, tensioni ideali, campi di applicazione. (dispensa, domanda 4)'],
      },
    ],
  },
  // ================================================================== c8.4
  {
    concept: 'c8.4',
    title: 'Beltrami e l’esperimento di Huber',
    minutes: 22,
    source: D(6, '6.4.4–6.4.5', undefined, '150–151'),
    visual: SPAZIO('huber', ['beltrami', 'vonMises']),
    steps: [
      {
        id: 'l84-1',
        kind: 'spiega',
        title: 'Dove siamo e dove andiamo',
        md: `Nella lezione precedente, «Galileo, Tresca, Grashof», le tre congetture guardavano ciascuna una sola grandezza locale: una tensione normale, una tangenziale, una dilatazione. Nel 1885 Beltrami propone un'idea diversa: guardare **tutto insieme**, attraverso l'energia che il materiale accumula deformandosi.

In questa lezione faremo due cose. Prima ricaveremo la tensione ideale di Beltrami. Poi vedremo come un esperimento, quello di **Huber** del 1904, la mette in crisi: è il primo esempio di come un criterio si confronta con la realtà, e ci porterà direttamente al criterio di von Mises nella prossima lezione.`,
        visual: SPAZIO('generico', ['beltrami']),
      },
      {
        id: 'l84-2',
        kind: 'spiega',
        title: 'L\'idea energetica',
        md: `Ricordiamo dal Cap. 4 che cos'è l'**energia specifica di deformazione** $\\varphi$: in un materiale iperelastico è l'energia accumulata per unità di volume quando il materiale si deforma, energia che viene restituita quando il carico viene tolto.

Beltrami prende proprio questa come funzione di crisi: $F=\\varphi$ (§6.4.4). La congettura è che **il materiale vada in crisi quando l'energia accumulata in un punto supera una soglia**. È il primo **criterio energetico** della storia.

Le ipotesi sono due:
- il materiale è **elastico lineare isotropo fino alla crisi**, quindi anche iperelastico (lo abbiamo visto nel Cap. 4), e l'energia $\\varphi$ esiste;
- la resistenza è **uguale in trazione e compressione**.`,
      },
      {
        id: 'l84-3',
        kind: 'spiega',
        title: 'L\'energia scritta con le tensioni principali',
        md: `Per usare l'energia come funzione di crisi dobbiamo scriverla con le tensioni principali. Lo abbiamo già fatto nel Cap. 4: grazie alla coassialità, nel riferimento principale comune la Prop 4.14.1 dà
$$\\varphi=\\frac1{2E}\\big(s_1^2+s_2^2+s_3^2\\big)-\\frac\\nu E\\big(s_1s_2+s_2s_3+s_3s_1\\big).$$
Leggila così: il primo termine somma i quadrati delle tre principali, il secondo i loro **prodotti a due a due**. $E$ è il modulo di Young e $\\nu$ il **coefficiente di Poisson**.

Nota una proprietà che spiega la seconda ipotesi (deduzione): se cambi segno a tutte le tensioni, i quadrati e i prodotti non cambiano, quindi $\\varphi$ resta uguale. Per Beltrami una trazione e la compressione opposta sono ugualmente pericolose, ed è per questo che il criterio richiede uguale resistenza.`,
      },
      {
        id: 'l84-4',
        kind: 'domanda',
        q: { id: 'l84-q2', kind: 'vf', q: 'Nella formula di Beltrami il simbolo $\\nu$ è il coefficiente di sicurezza.', answer: false, why: 'Qui $\\nu$ viene dall\'energia elastica (Prop 4.14.1), quindi è il coefficiente di Poisson. Il capitolo usa lo stesso simbolo per il coefficiente di sicurezza della Def 6.2.1 (nota NF-08): guarda sempre da dove viene la formula.' },
      },
      {
        id: 'l84-5',
        kind: 'derivazione',
        title: 'La tensione ideale di Beltrami',
        md: 'Dove vogliamo arrivare: una tensione ideale da confrontare con $\\sigma_L$. La strategia è la solita: valutare l\'energia sullo stato e sulla prova al limite, confrontarle e poi «tornare a una tensione», che qui vuol dire moltiplicare e prendere una radice quadrata. Il campione usa l\'espressione di $\\varphi$ del motore (Prop 4.14.1).',
        source: D(6, '6.4.4', undefined, 150),
        der: {
          sample,
          lines: [
            { tex: '\\varphi(s_1,s_2,s_3)=\\frac1{2E}(s_1^2+s_2^2+s_3^2)-\\frac\\nu E(s_1s_2+s_2s_3+s_3s_1)', why: 'Partiamo dalla funzione di crisi, cioè l\'energia specifica scritta con le tensioni principali dello stato di esercizio.' },
            { tex: '\\varphi(\\sigma_L,0,0)=\\frac{\\sigma_L^2}{2E}', why: 'Valutiamo la stessa formula sulla prova al limite: con principali $\\sigma_L$, 0, 0 sopravvive solo il quadrato $\\sigma_L^2$, e tutti i prodotti a due a due contengono uno zero.', ask: { q: 'Quanto vale l\'energia di Beltrami nella prova monoassiale al limite?', options: ['$\\sigma_L^2/(2E)$', '$\\sigma_L^2/E$', '$\\sigma_L/(2E)$', '$(1-2\\nu)\\sigma_L^2/(2E)$'], correct: 0, why: 'Con $s_1=\\sigma_L$ e $s_2=s_3=0$ resta $\\frac1{2E}\\sigma_L^2$: il termine con $\\nu$ sparisce perché ogni prodotto contiene uno zero. Il fattore $(1-2\\nu)$ comparirebbe solo se le tre tensioni fossero uguali.' } },
            { tex: '\\varphi(s_1,s_2,s_3)\\le\\frac{\\sigma_L^2}{2E}', why: 'La verifica $(\\star)$: l\'energia dello stato non deve superare quella della prova al limite.' },
            { tex: 's_1^2+s_2^2+s_3^2-2\\nu(s_1s_2+s_2s_3+s_3s_1)\\le\\sigma_L^2', why: 'Moltiplichiamo entrambi i membri per $2E$, che è positivo: il verso resta, a destra rimane $\\sigma_L^2$ e a sinistra il fattore $\\frac\\nu E$ diventa $2\\nu$.', aggiunto: true },
            { tex: '\\sqrt{2E\\,\\varphi}', why: 'Per avere una tensione e non il suo quadrato prendiamo la radice. È lecito perché entrambi i membri non sono negativi: $\\varphi\\ge0$ per le restrizioni di plausibilità del Cap. 4. Il campione calcola $\\sqrt{2E\\varphi}$ con il motore.', val: (v) => Math.sqrt(2 * v.E * El.energyPrincipal(v.E, v.nu, S3(v))), aggiunto: true },
            {
              tex: '=\\sqrt{s_1^2+s_2^2+s_3^2-2\\nu(s_1s_2+s_2s_3+s_3s_1)}=\\sigma_{id}\\le\\sigma_L',
              why: 'Scritta con le principali, la radice è la tensione ideale di Beltrami, con $\\nu$ di Poisson; a destra della disuguaglianza la radice di $\\sigma_L^2$ è $\\sigma_L$.',
              val: (v) => C.beltrami(S3(v), v.nu),
              eq: '§6.4.4',
            },
          ],
        },
      },
      {
        id: 'l84-6',
        kind: 'spiega',
        title: 'Leggiamo Beltrami su tre casi',
        md: `La formula dice che per Beltrami contano tutte e tre le principali, attraverso i quadrati e i prodotti a due a due. Proviamola (i tre conti sono passaggi aggiunti).

- **Trazione semplice** $(\\sigma,0,0)$: resta $\\sqrt{\\sigma^2}=\\sigma$, come deve essere.
- **Puro taglio**, principali $\\tau$, 0, $-\\tau$: la somma dei quadrati è $2\\tau^2$, quella dei prodotti è $-\\tau^2$, quindi $\\sigma_{id}=\\tau\\sqrt{2(1+\\nu)}$.
- **Tre principali uguali** a $s$, cioè uno stato idrostatico: la somma dei quadrati è $3s^2$ e anche quella dei prodotti è $3s^2$, quindi $\\sigma_{id}=|s|\\sqrt{3-6\\nu}$.

L'ultimo caso è il più interessante. Per un materiale reale $\\nu<1/2$, quindi $\\sqrt{3-6\\nu}$ è un numero positivo: **per Beltrami anche una pressione uniforme, se abbastanza grande, porta alla crisi**. Tieni a mente questa previsione: è quella che Huber metterà alla prova.`,
      },
      {
        id: 'l84-7',
        kind: 'spiega',
        title: 'Il dominio di Beltrami: un ellissoide chiuso',
        md: `Guarda il modello 3D: la superficie di Beltrami è un **ellissoide** con l'asse lungo la diagonale $s_1=s_2=s_3$, l'asse idrostatico (la forma è una deduzione dalla formula: la somma di quadrati e prodotti è una forma quadratica).

La cosa da notare è che l'ellissoide è **chiuso**: muovendoti lungo l'asse idrostatico, prima o poi esci. È la versione geometrica del conto che abbiamo appena fatto: una pressione uniforme abbastanza grande porta fuori dal dominio. Confrontalo con il prisma di Tresca della lezione precedente, che lungo l'asse non si chiudeva mai.

La dispensa aggiunge un avvertimento importante: la rappresentazione grafica nello spazio delle tensioni principali è **utile ma non indispensabile**, e soprattutto **i criteri vanno verificati sperimentalmente**.`,
        visual: SPAZIO('generico', ['beltrami', 'tresca']),
      },
      {
        id: 'l84-8',
        kind: 'domanda',
        q: { id: 'l84-q3', kind: 'scelta', q: 'Lungo l\'asse idrostatico $s_1=s_2=s_3$, che cosa prevede il criterio di Beltrami?', options: ['La crisi, quando la pressione o la trazione uniforme superano un valore finito', 'Mai la crisi, qualunque sia la pressione', 'La crisi solo in trazione uniforme', 'La crisi per qualunque pressione diversa da zero'], correct: 0, why: 'Per tre principali uguali $\\sigma_{id}=|s|\\sqrt{3-6\\nu}$, che cresce con $|s|$ e raggiunge $\\sigma_L$ a un valore finito; il dominio è un ellissoide chiuso. «Mai la crisi» è il comportamento di Tresca e von Mises; e Beltrami non distingue la trazione dalla compressione.' },
      },
      {
        id: 'l84-9',
        kind: 'spiega',
        title: 'L\'esperimento di Huber',
        md: `Nel 1904 Huber mette alla prova proprio questa previsione (§6.4.5). Pensa a un punto di un corpo **immerso a profondità $h$** in un fluido, o chiuso in un'**autoclave**, cioè un recipiente in cui si alza la pressione. Il fluido spinge allo stesso modo da tutte le parti, quindi lo stato di tensione è
$$\\tens T=-\\rho gh\\,\\tens I,\\qquad s_1=s_2=s_3=-\\rho gh.$$
Qui $\\rho$ è la densità del fluido, $g$ l'accelerazione di gravità, e $\\rho gh$ è la pressione alla profondità $h$; il segno meno dice che è una compressione. Dal Cap. 3 sai che uno stato come questo, con tre principali uguali, si chiama **idrostatico**: ogni riferimento è principale.

Che cosa dice Beltrami di questo punto? Facciamo il conto.`,
        visual: SPAZIO('huber', ['beltrami', 'vonMises']),
      },
      {
        id: 'l84-10',
        kind: 'derivazione',
        title: 'La profondità di crisi prevista da Beltrami',
        md: 'Dove vogliamo arrivare: la profondità $h_L$ alla quale, secondo Beltrami, il punto immerso dovrebbe andare in crisi. L\'idea è sostituire nella formula tre principali uguali, semplificare e porre la tensione ideale uguale a $\\sigma_L$. Il campione usa una pressione $p=\\rho gh$ a caso.',
        source: D(6, '6.4.5', undefined, '150–151'),
        der: {
          sample,
          lines: [
            { tex: 's_1=s_2=s_3=-\\rho gh', why: 'Lo stato di Huber: compressione idrostatica, tre principali uguali e negative.' },
            { tex: '\\sigma_{id}^B', why: 'Vogliamo la tensione ideale di Beltrami di questo stato; il campione la calcola con il motore.', val: (v) => C.beltrami([-v.p, -v.p, -v.p], v.nu) },
            { tex: 's_1^2+s_2^2+s_3^2=3(\\rho gh)^2,\\qquad s_1s_2+s_2s_3+s_3s_1=3(\\rho gh)^2', why: 'Calcoliamo separatamente le due somme. Attenzione ai segni: ogni prodotto è $(-\\rho gh)(-\\rho gh)$, cioè il prodotto di due numeri negativi, quindi è **positivo**. I tre quadrati e i tre prodotti valgono tutti $(\\rho gh)^2$.', aggiunto: true },
            { tex: '=\\sqrt{3(\\rho gh)^2-2\\nu\\cdot3(\\rho gh)^2}', why: 'Sostituiamo le due somme nella formula di Beltrami.', val: (v) => Math.sqrt(3 * v.p ** 2 - 2 * v.nu * 3 * v.p ** 2) },
            {
              tex: '=\\rho gh\\sqrt{3-6\\nu}',
              why: 'Raccogliamo $(\\rho gh)^2$ sotto radice e lo portiamo fuori come $\\rho gh$, che è positivo. La tensione ideale cresce in proporzione alla profondità.',
              ask: { q: 'Che cosa prevede Beltrami aumentando la profondità?', options: ['La crisi oltre una profondità finita $h_L$', 'Mai la crisi', 'La crisi a qualsiasi profondità', 'La crisi solo in trazione'], correct: 0, why: '$\\sigma_{id}$ cresce linearmente con $h$ e prima o poi raggiunge $\\sigma_L$ (§6.4.5). «Mai la crisi» è ciò che Huber osserverà, non ciò che prevede Beltrami; e a profondità piccola $\\sigma_{id}$ è ancora sotto $\\sigma_L$.' },
              val: (v) => v.p * Math.sqrt(3 - 6 * v.nu),
            },
            { tex: '\\rho gh_L\\sqrt{3-6\\nu}=\\sigma_L', why: 'La crisi è prevista quando la tensione ideale raggiunge la tensione limite; chiamiamo $h_L$ la profondità in cui succede.' },
            { tex: 'h_L=\\frac{\\sigma_L}{\\rho g\\sqrt{3-6\\nu}}', why: 'Dividiamo per $\\rho g\\sqrt{3-6\\nu}$, positivo perché $\\nu<1/2$. Questa è la profondità finita a cui, secondo Beltrami, il punto dovrebbe andare in crisi.', eq: '§6.4.5' },
          ],
        },
      },
      {
        id: 'l84-11',
        kind: 'spiega',
        title: 'Il controesempio: Huber non vede nessuna crisi',
        md: `Abbiamo ottenuto una previsione precisa: oltre la profondità $h_L$ il punto dovrebbe andare in crisi. Huber, invece, **non osservò crisi nemmeno per profondità molto maggiori** di $h_L$ (figura a p. 151).

Che cosa implica? Un criterio è un'affermazione che deve valere per **tutti** gli stati di tensione. Per smentirla basta **un solo controesempio**: uno stato in cui la previsione è sbagliata. Lo stato di Huber è quel controesempio, e quindi **il criterio di Beltrami fallisce**.

C'è anche una lezione più costruttiva (deduzione). Una pressione uniforme cambia il volume del corpo ma non la sua forma, e Beltrami conta anche l'energia di questa variazione di volume. L'esperimento suggerisce che quella parte di energia non provochi la crisi. È esattamente l'idea che porterà a von Mises: tenere solo l'energia legata al **cambiamento di forma**.`,
      },
      {
        id: 'l84-12',
        kind: 'prova',
        title: 'Il punto scende lungo l’asse',
        md: `Nel modello è selezionato lo stato di Huber: il punto di lavoro sta sull'asse idrostatico, dalla parte delle compressioni. Il cursore regola la pressione, in unità di $\\sigma_L$; il modello usa $\\nu=0{,}3$ (Poisson).`,
        tasks: [
          'Aumenta la pressione: il punto scende lungo l\'asse idrostatico, sempre esattamente su di esso.',
          `Nota il momento in cui il punto esce dall'ellissoide di Beltrami: succede per p circa ${f(HL_MODELLO)} σ_L, cioè 1/√(3 − 6ν) con ν = 0,3. È la profondità h_L in unità adimensionali.`,
          'Guarda il cilindro di von Mises: il punto ci resta sempre dentro, per qualunque pressione. È l\'anticipazione della prossima lezione.',
        ],
        visual: SPAZIO('huber', ['beltrami', 'vonMises']),
      },
      {
        id: 'l84-13',
        kind: 'domanda',
        q: { id: 'l84-q1', kind: 'vf', q: 'Per confutare un criterio basta un solo controesempio sperimentale.', answer: true, why: 'Un criterio pretende di valere per tutti gli stati: uno solo in cui la previsione è smentita basta a farlo cadere. È quello che fa Huber con lo stato idrostatico (§6.4.5). Al contrario, nessun numero di conferme basta a dimostrare che un criterio è giusto.' },
      },
      {
        id: 'l84-14',
        kind: 'spiega',
        title: 'Attenzione a…',
        md: `Gli errori tipici su Beltrami e Huber.

1. **Dimenticare che Beltrami presuppone uguale resistenza a trazione e compressione.** L'energia non cambia se cambi segno a tutte le tensioni, quindi il criterio non può distinguere le due resistenze.
2. **Pensare che Huber abbia confutato tutti i criteri energetici.** Huber confuta Beltrami, che usa tutta l'energia. Von Mises usa solo l'**energia distorcente**, quella del cambiamento di forma, e allo stato di Huber dà zero: regge.
3. **Dimenticare il fattore $\\sqrt{3-6\\nu}$**, oppure sbagliarlo per un errore di segno. Nello stato di Huber i prodotti $s_is_j$ sono **positivi**, perché sono prodotti di due compressioni: la somma dei prodotti vale $+3(\\rho gh)^2$, non $-3(\\rho gh)^2$.`,
      },
      {
        id: 'l84-15',
        kind: 'riassunto',
        md: `**Il filo della lezione.** Beltrami propone il primo criterio energetico: il materiale, supposto elastico lineare isotropo e con uguale resistenza in trazione e compressione, va in crisi quando l'energia specifica di deformazione supera quella della prova al limite. Confrontando le due energie e prendendo la radice si ottiene la tensione ideale. Il dominio è un ellissoide chiuso, quindi Beltrami prevede la crisi anche sotto una pressione uniforme, a una profondità finita $h_L$. Huber osserva che un punto immerso non va in crisi nemmeno molto oltre $h_L$: un solo controesempio basta, e Beltrami cade. L'esperimento suggerisce di escludere l'energia della variazione di volume.

- Beltrami, con $\\nu$ di Poisson: $\\sigma_{id}=\\sqrt{s_1^2+s_2^2+s_3^2-2\\nu(s_1s_2+s_2s_3+s_3s_1)}\\le\\sigma_L$ (§6.4.4).
- Stato di Huber: $\\tens T=-\\rho gh\\,\\tens I$, $\\sigma_{id}^B=\\rho gh\\sqrt{3-6\\nu}$ (§6.4.5).
- Profondità di crisi prevista: $h_L=\\dfrac{\\sigma_L}{\\rho g\\sqrt{3-6\\nu}}$ (§6.4.5).`,
        orale: ['Galileo, Tresca (Lüders), Grashof (coassialità), Beltrami: congetture, ipotesi, tensioni ideali, campi di applicazione. (dispensa, domanda 4)', 'La confutazione di Huber e cosa implica. (dispensa, domanda 5)'],
      },
    ],
  },
  // ================================================================== c8.5
  {
    concept: 'c8.5',
    title: 'Energia distorcente e criterio di von Mises',
    minutes: 32,
    source: D(6, '6.5', 'Teo 6.5.1, Def 6.5.2, Teo 6.5.3', '151–154'),
    visual: SPAZIO('generico', ['vonMises', 'tresca']),
    steps: [
      {
        id: 'l85-1',
        kind: 'spiega',
        title: 'Dove siamo e dove andiamo',
        md: `L'esperimento di Huber, nella lezione precedente («Beltrami e l’esperimento di Huber»), ha fatto cadere Beltrami: una pressione uniforme accumula energia nel materiale ma non lo porta in crisi. Viene allora l'idea di **dividere l'energia in due parti**, quella dovuta al cambiamento di volume e quella dovuta al cambiamento di forma, e di usare come funzione di crisi solo la seconda.

Per farlo serve uno strumento matematico: il **secondo teorema di decomposizione**, che spezza ogni tensore in una parte «di volume» e una parte «di forma», un po' come il primo teorema del Cap. 1 lo spezzava in parte simmetrica e antisimmetrica. Le tappe sono: il teorema; che cosa rappresentano le due parti per la deformazione e per la tensione; come si separano legame ed energia in un materiale isotropo; l'energia distorcente e il criterio; infine le osservazioni della dispensa su quando usarlo.`,
      },
      {
        id: 'l85-2',
        kind: 'spiega',
        title: 'Von Mises e Hencky: due strade per lo stesso criterio',
        md: `Un po' di storia aiuta a capire il nome del criterio (§6.5). Nel 1913 **von Mises** propone come funzione di crisi un invariante della parte deviatorica della tensione, il secondo, che la dispensa chiama «$J_2$»; non ci serve la sua definizione, ci basta sapere che è un numero che non dipende dal riferimento. Nel 1924 **Hencky** mostra che usare quell'invariante equivale a usare l'**energia distorcente** $\\varphi_d$, cioè la parte dell'energia legata alla **variazione di forma** e non a quella di volume.

È la strada energetica di Hencky quella che segue la dispensa, ed è quella che faremo noi. Le ipotesi sono le stesse di Beltrami: materiale **elastico lineare isotropo fino alla crisi** e **uguale resistenza** in trazione e compressione.`,
      },
      {
        id: 'l85-3',
        kind: 'spiega',
        title: 'Il secondo teorema di decomposizione',
        md: `Ricordiamo che la **traccia** di un tensore, $\\operatorname{tr}\\tens A$, è la somma degli elementi sulla diagonale della sua matrice. Un tensore **sferico** è un multiplo dell'identità $\\tens I$, cioè un numero per $\\tens I$: agisce allo stesso modo in tutte le direzioni.

**Teo 6.5.1.** Per ogni tensore $\\tens A$ esistono e sono unici
$$\\tens A_s=\\operatorname{sph}\\tens A:=\\tfrac13(\\operatorname{tr}\\tens A)\\tens I,\\qquad\\tens A_d=\\operatorname{dev}\\tens A:=\\tens A-\\tfrac13(\\operatorname{tr}\\tens A)\\tens I,$$
con $\\tens A=\\tens A_s+\\tens A_d$. La prima è la **parte sferica**, che appartiene all'insieme $\\mathrm{Sph}$ dei tensori sferici, cioè dei multipli dell'identità; la seconda è la **parte deviatorica**, che appartiene all'insieme $\\mathrm{Dev}$ dei tensori **deviatorici**, cioè dei tensori a **traccia nulla**.

In parole: la parte sferica è l'identità moltiplicata per **la media degli elementi diagonali**; la parte deviatorica è tutto ciò che resta. Proviamo ora le due proprietà che rendono utile questa scomposizione.`,
      },
      {
        id: 'l85-4',
        kind: 'derivazione',
        title: 'Le proprietà della decomposizione',
        md: 'Dove vogliamo arrivare: mostrare che la parte deviatorica ha **traccia nulla** e che le due parti sono **ortogonali**. L\'idea è usare due fatti del Cap. 1: la traccia è lineare, e il prodotto scalare di un tensore con l\'identità è la sua traccia (il prodotto scalare tra due tensori è la somma dei prodotti delle componenti corrispondenti). La dispensa svolge le due prove in una riga ciascuna («Infatti…»); le righe che non sono nella dispensa sono marcate come aggiunte. Il campione prende un tensore simmetrico a caso.',
        source: D(6, '6.5.1', 'Teo 6.5.1', '151–152'),
        der: {
          sample,
          lines: [
            { tex: '\\operatorname{tr}\\tens A_s', why: 'Calcoliamo prima la traccia della parte sferica: la dispensa enuncia la proprietà $\\operatorname{tr}\\tens A=\\operatorname{tr}\\tens A_s$ senza conto, e il passaggio della riga successiva è aggiunto.', val: (v) => T.trace(C.sph(Esym(v))) },
            { tex: '=\\tfrac13(\\operatorname{tr}\\tens A)\\,\\operatorname{tr}\\tens I', why: 'La parte sferica è il numero $\\tfrac13\\operatorname{tr}\\tens A$ per $\\tens I$; la traccia è lineare, quindi il numero esce fuori.', val: (v) => (T.trace(Esym(v)) / 3) * 3, aggiunto: true },
            { tex: '=\\operatorname{tr}\\tens A', why: 'La traccia dell\'identità è $1+1+1=3$, che semplifica il $\\tfrac13$: la parte sferica ha la stessa traccia del tensore di partenza.', val: (v) => T.trace(Esym(v)), eq: 'Teo 6.5.1' },
            { tex: '\\operatorname{tr}\\tens A_d=\\operatorname{tr}\\tens A-\\tfrac13(\\operatorname{tr}\\tens A)\\operatorname{tr}\\tens I=\\operatorname{tr}\\tens A-\\operatorname{tr}\\tens A=0', why: 'Ora la parte deviatorica, come fa la dispensa: prendiamo la traccia della sua definizione, $\\tens A-\\tfrac13(\\operatorname{tr}\\tens A)\\tens I$, usiamo la linearità e $\\operatorname{tr}\\tens I=3$. Il risultato è zero: tutta la traccia sta nella parte sferica, e quindi $\\tens A_d$ appartiene davvero a $\\mathrm{Dev}$.' },
            { tex: '\\tens A_s\\cdot\\tens A_d=\\lambda\\tens I\\cdot\\tens A_d=\\lambda\\operatorname{tr}\\tens A_d=0', why: 'Infine il prodotto scalare tra le due parti. Scriviamo la parte sferica come $\\lambda\\tens I$: **attenzione**, qui $\\lambda$ è solo il numero che moltiplica l\'identità (per $\\tens A_s$ vale $\\tfrac13\\operatorname{tr}\\tens A$), ed è la lettera che usa la dispensa; nella derivazione sulla separazione del legame la stessa lettera sarà la costante di Lamé, che è un\'altra cosa. Il prodotto scalare di $\\tens I$ con un tensore ne dà la traccia (Cap. 1), e la traccia della parte deviatorica è zero. Le due parti sono **ortogonali**: è una decomposizione ortogonale.' },
          ],
          checks: [
            { what: '$\\tens A_s\\cdot\\tens A_d=\\lambda\\operatorname{tr}\\tens A_d=0$: decomposizione ortogonale', f: (v) => [T.ddot(C.sph(Esym(v)), C.dev(Esym(v))), 0] },
            { what: '$\\operatorname{tr}\\tens A_d=0$', f: (v) => [T.trace(C.dev(Esym(v))), 0] },
          ],
        },
      },
      {
        id: 'l85-5',
        kind: 'spiega',
        title: 'Le due parti della deformazione: volume e forma',
        md: `Applichiamo la decomposizione al tensore di deformazione infinitesima $\\tens E$. La sua traccia è il **coefficiente di dilatazione volumica** $\\Theta=\\operatorname{tr}\\tens E$, cioè la variazione relativa di volume (Cap. 2). Quindi
$$\\tens E_s=\\tfrac13\\Theta\\,\\tens I,\\qquad\\tens E_d=\\tens E-\\tfrac13\\Theta\\,\\tens I.$$

La parte sferica ha la stessa traccia di $\\tens E$, quindi **porta tutta la variazione di volume**. È una deformazione **omotetica**, con l'autovalore $\\Theta/3$ triplo: ogni fibra si allunga allo stesso modo, e una sfera resta una sfera, solo più grande o più piccola.

La parte deviatorica ha traccia nulla, quindi **non cambia il volume**: porta **solo la variazione di forma**, per esempio una sfera che diventa un ellissoide con lo stesso volume.`,
      },
      {
        id: 'l85-6',
        kind: 'spiega',
        title: 'Le due parti della tensione: pressione media e scostamento',
        md: `Lo stesso vale per il tensore delle tensioni $\\tens T$. La sua parte sferica è
$$\\tens T_s=\\sigma_m\\tens I,\\qquad\\sigma_m=\\tfrac13\\operatorname{tr}\\tens T,$$
dove $\\sigma_m$ è la **tensione normale media**, la media delle tre tensioni normali sulla diagonale. La parte deviatorica $\\tens T_d$ misura lo **scostamento da uno stato idrostatico**: quanto lo stato reale differisce da una pressione o trazione uguale in tutte le direzioni.

Ora rileggi lo stato di Huber, $\\tens T=-\\rho gh\\,\\tens I$. È già sferico: la sua media è $-\\rho gh$ e lo scostamento è zero, cioè $\\tens T_d=\\tens O$. Lo stato che ha fatto cadere Beltrami è **tutto parte sferica**. Se riusciamo a costruire un criterio che guarda solo la parte deviatorica, quello stato non sarà mai pericoloso.`,
      },
      {
        id: 'l85-7',
        kind: 'domanda',
        q: { id: 'l85-q2', kind: 'scelta', q: 'Per lo stato di Huber $\\tens T=-\\rho gh\\,\\tens I$, quanto vale la parte deviatorica $\\tens T_d$?', options: ['Il tensore nullo $\\tens O$', '$-\\rho gh\\,\\tens I$', '$\\tens T$ stesso', '$-\\tfrac13\\rho gh\\,\\tens I$'], correct: 0, why: 'La traccia è $-3\\rho gh$, quindi $\\sigma_m=-\\rho gh$ e $\\tens T_s=-\\rho gh\\,\\tens I=\\tens T$; ciò che resta è zero. $-\\rho gh\\,\\tens I$ è la parte sferica, non la deviatorica; $-\\tfrac13\\rho gh\\,\\tens I$ dimentica che la traccia somma tre termini uguali.' },
      },
      {
        id: 'l85-8',
        kind: 'derivazione',
        title: 'Legame ed energia si separano (isotropi)',
        md: 'Dove vogliamo arrivare: per un materiale isotropo la parte sferica della tensione dipende solo dalla parte sferica della deformazione, e la deviatorica solo dalla deviatorica, con $\\tens T_d=2\\mu\\tens E_d$. In generale non è così: da $\\tens T_s+\\tens T_d=\\mathbb A\\tens E_s+\\mathbb A\\tens E_d$, dove $\\mathbb A$ è il tensore elastico, non si possono separare gli addendi. L\'idea è calcolare con il legame di Lamé dove finiscono $\\mathbb A\\tens E_s$ e $\\mathbb A\\tens E_d$, e poi usare l\'unicità della decomposizione. La dispensa fa il conto in una riga; le righe che non sono nella dispensa sono marcate come aggiunte. **Attenzione al simbolo:** qui $\\mu$ e $\\lambda$ sono le **costanti di Lamé** del Cap. 4, mentre nella derivazione sulle proprietà della decomposizione $\\lambda$ era solo il numero che moltiplica $\\tens I$ in un tensore sferico; la dispensa usa la stessa lettera per tutti e due. Il campione usa $\\mu$, $\\lambda$ e una deformazione a caso.',
        source: D(6, '6.5.1', undefined, 152),
        der: {
          sample,
          lines: [
            { tex: '\\mathbb A\\tens E_s=2\\mu\\tens E_s+\\lambda(\\operatorname{tr}\\tens E_s)\\tens I\\in\\mathrm{Sph}', why: 'Applichiamo il legame di Lamé, $\\mathbb A\\tens E=2\\mu\\tens E+\\lambda(\\operatorname{tr}\\tens E)\\tens I$ (Teo 4.12.1), alla parte sferica. Entrambi i termini sono multipli dell\'identità, quindi il risultato è sferico, cioè sta in $\\mathrm{Sph}$.' },
            {
              tex: '\\mathbb A\\tens E_d=2\\mu\\tens E_d+\\lambda(\\operatorname{tr}\\tens E_d)\\tens I=2\\mu\\tens E_d\\in\\mathrm{Dev}',
              why: 'Ora la parte deviatorica. Il termine con $\\lambda$ sparisce perché la traccia di $\\tens E_d$ è zero, e resta $2\\mu\\tens E_d$, che ha anch\'esso traccia nulla: il risultato è deviatorico, cioè sta in $\\mathrm{Dev}$.',
              ask: { q: 'Perché $\\mathbb A\\tens E_d=2\\mu\\tens E_d$?', options: ['Perché nel legame di Lamé il termine con la traccia si annulla: $\\operatorname{tr}\\tens E_d=0$', 'Perché $\\lambda=0$', 'Perché $\\tens E_d$ è sferico', 'Per la coassialità'], correct: 0, why: 'Il termine $\\lambda(\\operatorname{tr}\\tens E_d)\\tens I$ è nullo perché la parte deviatorica ha traccia nulla, non perché $\\lambda$ sia zero. $\\tens E_d$ è deviatorico, non sferico; la coassialità riguarda le direzioni principali e qui non serve.' },
            },
            { tex: '\\tens T_s+\\tens T_d=\\underbrace{\\mathbb A\\tens E_s}_{\\in\\mathrm{Sph}}+\\underbrace{\\mathbb A\\tens E_d}_{\\in\\mathrm{Dev}}\\ \\Rightarrow\\ \\tens T_s=\\mathbb A\\tens E_s,\\quad\\tens T_d=2\\mu\\tens E_d', why: 'A destra abbiamo un tensore sferico più uno deviatorico. Ma la decomposizione di $\\tens T$ in sferico più deviatorico è **unica** (Teo 6.5.1): quindi i pezzi devono coincidere uno a uno. Perché l\'unicità vale? (passaggio aggiunto) Se $a\\tens I+\\tens D=a\'\\tens I+\\tens D\'$, con $\\tens D$ e $\\tens D\'$ a traccia nulla, prendendo la traccia di entrambi i membri si ha $3a=3a\'$, cioè $a=a\'$; togliendo $a\\tens I$ da entrambi i membri resta anche $\\tens D=\\tens D\'$.' },
            { tex: '(\\tens T_d)_{11}', why: 'Controlliamo il risultato su una componente (controllo numerico, non nella dispensa): la componente 11 della parte deviatorica della tensione di Lamé, calcolata dal motore.', val: (v) => C.dev(El.stressIso(v.mu, v.la, Esym(v)))[0], aggiunto: true },
            {
              tex: '=2\\mu(\\tens E_d)_{11}',
              why: 'È proprio $2\\mu$ per la componente 11 della parte deviatorica della deformazione.',
              val: (v) => 2 * v.mu * C.dev(Esym(v))[0],
              aggiunto: true,
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
        id: 'l85-9',
        kind: 'spiega',
        title: 'Anche l\'energia si spezza in due',
        md: `Il legame si è separato; vediamo l'energia. L'energia specifica è $\\varphi=\\frac12\\tens T\\cdot\\tens E$. Se scriviamo $\\tens T=\\tens T_s+\\tens T_d$ ed $\\tens E=\\tens E_s+\\tens E_d$ e sviluppiamo il prodotto, compaiono quattro termini (passaggio aggiunto): $\\tens T_s\\cdot\\tens E_s$, $\\tens T_d\\cdot\\tens E_d$ e i due «misti» $\\tens T_s\\cdot\\tens E_d$ e $\\tens T_d\\cdot\\tens E_s$.

I termini misti sono prodotti tra un tensore sferico e uno deviatorico, e quindi sono **nulli** per l'ortogonalità che abbiamo dimostrato. La dispensa lo dice così: per i materiali isotropi il **termine di accoppiamento** si annulla, e
$$\\varphi=\\varphi(\\tens E_s)+\\varphi(\\tens E_d).$$
L'energia è la somma di un'energia di volume e di un'energia di forma. La seconda ha un nome:

**Def 6.5.2 (energia distorcente).** $\\varphi_d:=\\tfrac12\\mathbb A\\tens E_d\\cdot\\tens E_d$.

Per un materiale elastico lineare generico questo non funziona: la dispensa avverte che da $\\tens T_s+\\tens T_d=\\mathbb A\\tens E_s+\\mathbb A\\tens E_d$ non si può dedurre l'uguaglianza a coppie, perché $\\mathbb A\\tens E_s$ potrebbe non essere sferico, e le due parti resterebbero accoppiate (deduzione).`,
      },
      {
        id: 'l85-10',
        kind: 'domanda',
        q: { id: 'l85-q3', kind: 'vf', q: 'La decomposizione $\\varphi=\\varphi(\\tens E_s)+\\varphi(\\tens E_d)$ vale per qualunque materiale elastico lineare.', answer: false, why: 'Vale per gli isotropi: è il legame di Lamé che manda la parte sferica in una tensione sferica e la deviatorica in una deviatorica, e così i termini misti sono prodotti tra tensori ortogonali (§6.5.1). In generale da $\\tens T_s+\\tens T_d=\\mathbb A\\tens E_s+\\mathbb A\\tens E_d$ non si separano gli addendi.' },
      },
      {
        id: 'l85-11',
        kind: 'derivazione',
        title: 'Energia distorcente in tensioni principali',
        md: 'Dove vogliamo arrivare: scrivere $\\varphi_d$ con le tensioni principali, per poterla usare come funzione di crisi. La strategia ha tre mosse: sostituire la deformazione con la tensione grazie a $\\tens T_d=2\\mu\\tens E_d$; sviluppare $\\tens T_d\\cdot\\tens T_d$ usando la definizione di parte deviatorica; passare al riferimento principale. Il campione parte da una deformazione a caso e calcola tutto con il motore.',
        source: D(6, '6.5.2', 'Def 6.5.2', 153),
        der: {
          sample,
          lines: [
            { tex: '\\varphi_d=\\tfrac12\\mathbb A\\tens E_d\\cdot\\tens E_d', why: 'Partiamo dalla definizione (Def 6.5.2).', val: (v) => El.energy(El.lameTensor(v.mu, v.la), C.dev(Esym(v))) },
            { tex: '=\\tfrac12\\tens T_d\\cdot\\tens E_d', why: 'Abbiamo appena visto che $\\mathbb A\\tens E_d=\\tens T_d$ per un isotropo.', val: (v) => 0.5 * T.ddot(C.dev(El.stressIso(v.mu, v.la, Esym(v))), C.dev(Esym(v))) },
            { tex: '=\\frac1{4\\mu}\\tens T_d\\cdot\\tens T_d', why: 'Ora eliminiamo la deformazione: da $\\tens T_d=2\\mu\\tens E_d$ si ha $\\tens E_d=\\tens T_d/(2\\mu)$, e $\\frac12\\cdot\\frac1{2\\mu}=\\frac1{4\\mu}$.', val: (v) => C.phiD(El.stressIso(v.mu, v.la, Esym(v)), v.mu) },
            {
              tex: '=\\frac1{4\\mu}\\Big[\\tens T\\cdot\\tens T-\\tfrac23(\\operatorname{tr}\\tens T)\\,\\tens T\\cdot\\tens I+\\tfrac19(\\operatorname{tr}\\tens T)^2\\,\\tens I\\cdot\\tens I\\Big]',
              why: 'Scriviamo $\\tens T_d=\\tens T-\\frac13(\\operatorname{tr}\\tens T)\\tens I$ e sviluppiamo il prodotto scalare come il quadrato di una differenza: quadrato del primo, doppio prodotto, quadrato del secondo.',
              val: (v) => {
                const S = El.stressIso(v.mu, v.la, Esym(v));
                return (T.ddot(S, S) - (2 / 3) * T.trace(S) * T.ddot(S, T.I3) + (1 / 9) * T.trace(S) ** 2 * T.ddot(T.I3, T.I3)) / (4 * v.mu);
              },
              aggiunto: true,
            },
            {
              tex: '=\\frac1{4\\mu}\\Big[\\tens T\\cdot\\tens T-\\frac13(\\operatorname{tr}\\tens T)^2\\Big]',
              why: 'Usiamo $\\tens T\\cdot\\tens I=\\operatorname{tr}\\tens T$ e $\\tens I\\cdot\\tens I=3$: il doppio prodotto diventa $-\\frac23(\\operatorname{tr}\\tens T)^2$, l\'ultimo termine $+\\frac13(\\operatorname{tr}\\tens T)^2$, e sommati danno $-\\frac13(\\operatorname{tr}\\tens T)^2$.',
              val: (v) => {
                const S = El.stressIso(v.mu, v.la, Esym(v));
                return (T.ddot(S, S) - T.trace(S) ** 2 / 3) / (4 * v.mu);
              },
            },
            {
              tex: '=\\frac1{4\\mu}\\Big[s_1^2+s_2^2+s_3^2-\\tfrac13(s_1+s_2+s_3)^2\\Big]',
              why: 'Passiamo al riferimento principale, dove $[\\tens T]$ è diagonale: $\\tens T\\cdot\\tens T$ è la somma dei quadrati delle principali e la traccia è la loro somma. Cambiare riferimento è lecito perché $\\tens T\\cdot\\tens T$ e $\\operatorname{tr}\\tens T$ sono **invarianti**: hanno lo stesso valore in ogni riferimento. Il campione usa le principali calcolate dal motore.',
              val: (v) => {
                const s = eigSym(El.stressIso(v.mu, v.la, Esym(v))).values;
                return (s[0] ** 2 + s[1] ** 2 + s[2] ** 2 - (s[0] + s[1] + s[2]) ** 2 / 3) / (4 * v.mu);
              },
            },
            {
              tex: '=\\frac1{12\\mu}\\big[2(s_1^2+s_2^2+s_3^2)-2(s_1s_2+s_2s_3+s_3s_1)\\big]',
              why: 'Portiamo fuori $\\frac13$, così davanti c\'è $\\frac1{12\\mu}$, e sviluppiamo $(s_1+s_2+s_3)^2$ come somma dei quadrati più il doppio dei prodotti: $3\\sum s_i^2-\\sum s_i^2-2\\sum s_is_j$.',
              val: (v) => {
                const s = eigSym(El.stressIso(v.mu, v.la, Esym(v))).values;
                return (2 * (s[0] ** 2 + s[1] ** 2 + s[2] ** 2) - 2 * (s[0] * s[1] + s[1] * s[2] + s[2] * s[0])) / (12 * v.mu);
              },
            },
            {
              tex: '=\\frac1{12\\mu}\\big[(s_1-s_2)^2+(s_2-s_3)^2+(s_3-s_1)^2\\big]',
              why: 'Riconosciamo la somma dei quadrati delle tre differenze: sviluppandola, ogni quadrato compare due volte e ogni prodotto con $-2$. Nell\'energia distorcente entrano solo le **differenze** tra le principali.',
              val: (v) => C.phiDprincipal(C.sortS(eigSym(El.stressIso(v.mu, v.la, Esym(v))).values), v.mu),
              eq: 'Def 6.5.2',
            },
          ],
        },
      },
      {
        id: 'l85-12',
        kind: 'derivazione',
        title: 'Il criterio di von Mises',
        md: 'Dove vogliamo arrivare: la tensione ideale di von Mises (Teo 6.5.3). La funzione di crisi è l\'energia distorcente, $F=\\varphi_d$; la strategia è quella di sempre: valutarla sulla prova al limite, confrontare, e tornare a una tensione con una radice.',
        source: D(6, '6.5.2', 'Teo 6.5.3', 153),
        der: {
          sample,
          lines: [
            {
              tex: '\\varphi_d(\\sigma_L,0,0)=\\frac{2\\sigma_L^2}{12\\mu}=\\frac{\\sigma_L^2}{6\\mu}',
              why: 'Nella prova al limite le principali sono $\\sigma_L$, 0, 0: le differenze valgono $\\sigma_L$, 0 e $-\\sigma_L$, quindi la somma dei loro quadrati è $2\\sigma_L^2$.',
              ask: { q: 'Nella prova $(\\sigma_L,0,0)$, quanto vale $(s_1-s_2)^2+(s_2-s_3)^2+(s_3-s_1)^2$?', options: ['$2\\sigma_L^2$', '$\\sigma_L^2$', '$3\\sigma_L^2$', '0'], correct: 0, why: 'Le tre differenze sono $\\sigma_L-0$, $0-0$ e $0-\\sigma_L$: due quadrati valgono $\\sigma_L^2$ e uno zero. $\\sigma_L^2$ dimentica la terza differenza; zero sarebbe lo stato di Huber.' },
            },
            { tex: '\\varphi_d(s_1,s_2,s_3)\\le\\frac{\\sigma_L^2}{6\\mu}', why: 'La verifica $(\\star)$: l\'energia distorcente dello stato non deve superare quella della prova al limite.' },
            { tex: '\\sqrt{6\\mu\\,\\varphi_d(s_1,s_2,s_3)}', why: 'Moltiplichiamo per $6\\mu>0$, così a destra resta $\\sigma_L^2$, e prendiamo la radice di entrambi i membri, che non sono negativi.', val: (v) => Math.sqrt(6 * v.mu * C.phiDprincipal(S3(v), v.mu)), aggiunto: true },
            {
              tex: '=\\sqrt{\\tfrac12\\big[(s_1-s_2)^2+(s_2-s_3)^2+(s_3-s_1)^2\\big]}=\\sigma_{id}\\le\\sigma_L',
              why: 'Sostituiamo l\'espressione di $\\varphi_d$: $6\\mu\\cdot\\frac1{12\\mu}=\\frac12$, e $\\mu$ sparisce. È la tensione ideale di von Mises.',
              val: (v) => C.vonMises(S3(v)),
              eq: 'Teo 6.5.3',
            },
          ],
        },
      },
      {
        id: 'l85-13',
        kind: 'spiega',
        title: 'Leggiamo von Mises su tre casi',
        md: `Il Teo 6.5.3 dice che per von Mises contano **solo le differenze tra le tensioni principali**. Proviamolo (i conti sono passaggi aggiunti).

- **Trazione semplice** $(\\sigma,0,0)$: dentro la parentesi $\\sigma^2+0+\\sigma^2$, metà fa $\\sigma^2$, e la radice dà $\\sigma$. Come deve essere.
- **Puro taglio**, principali $\\tau$, 0, $-\\tau$: le differenze sono $\\tau$, $\\tau$ e $-2\\tau$, i quadrati sommano $6\\tau^2$, metà fa $3\\tau^2$, quindi $\\sigma_{id}=\\sqrt3\\,\\tau$. Tresca dava $2\\tau$: i due criteri sono vicini ma non uguali.
- **Stato di Huber**, tre principali uguali: tutte le differenze sono nulle e $\\sigma_{id}^{vM}=0$. **Nessuna crisi**, per qualunque profondità: è esattamente ciò che Huber ha osservato.`,
      },
      {
        id: 'l85-14',
        kind: 'spiega',
        title: 'Criteri insensibili alla pressione',
        md: `L'ultimo caso merita un nome. La dispensa (§6.5.3) osserva:
1. allo stato di Huber von Mises dà zero: il criterio è **insensibile alla pressione** idrostatica, in inglese **pressure insensitive**;
2. lo stesso vale per **Tresca**, perché anche $s_1-s_3$ è nullo. Entrambi i criteri dipendono solo dalle **differenze** delle tensioni principali, e una pressione uniforme non cambia le differenze;
3. von Mises **va bene per l'acciaio**.

Nello spazio delle principali questo ha una forma precisa (deduzione): il dominio di von Mises è un **cilindro** con l'asse lungo l'asse idrostatico, e il prisma esagonale di Tresca è **inscritto** nel cilindro. Entrambi sono infiniti lungo l'asse, perché muoversi lungo l'asse vuol dire aggiungere una pressione uniforme. La prova sul modello te lo fa vedere.`,
        visual: SPAZIO('generico', ['vonMises', 'tresca']),
      },
      {
        id: 'l85-15',
        kind: 'prova',
        title: 'Cilindro ed esagono',
        md: 'Nel modello sono accesi il cilindro di von Mises e il prisma di Tresca. Sono disegnati con $\\sigma_L$ uguale in trazione e compressione, l\'ipotesi di entrambi i criteri.',
        tasks: [
          'Scegli la vista «lungo l\'asse idrostatico»: vedi un esagono inscritto in un cerchio. I sei vertici, dove i due si toccano, corrispondono agli stati monoassiali, dove i due criteri danno lo stesso valore (deduzione).',
          'Scegli il puro taglio e leggi la tabella: Tresca dà 2τ, von Mises √3 τ. Il taglio cade a metà di un lato dell\'esagono, dove esagono e cerchio sono più distanti (deduzione).',
          'Scegli lo stato di Huber e aumenta la pressione: il punto scorre lungo l\'asse, e le tensioni ideali di Tresca e von Mises restano zero.',
        ],
        visual: SPAZIO('taglio', ['vonMises', 'tresca']),
      },
      {
        id: 'l85-16',
        kind: 'spiega',
        title: 'Huber a segni invertiti: dove von Mises sbaglia',
        md: `Se von Mises ignora del tutto la parte sferica, c'è un caso in cui sbaglia. La dispensa (§6.5.3, osservazione 4) lo trova rovesciando l'esperimento di Huber: una **trazione uniforme** $\\tens T=t\\,\\tens I$, con $t>0$.

Nella realtà, sotto una trazione uguale in tutte le direzioni il materiale ha una **rottura fragile per decoesione**, cioè le sue parti si separano, e succede già a sforzi bassi. Von Mises invece dà $\\sigma_{id}=0$: non prevede nessuna crisi. Beltrami, al contrario, dà $t\\sqrt{3-6\\nu}\\ne0$ e la crisi la prevede. La dispensa nota che stati come questo sono **praticamente rari** nelle strutture, dove prevale la compressione.

Da qui la **procedura per l'orale**: calcola la tensione normale media $\\sigma_m=\\frac13\\operatorname{tr}\\tens T$. Se $\\sigma_m\\le0$, usa **von Mises**; se $\\sigma_m>0$, usa **Beltrami**.`,
      },
      {
        id: 'l85-17',
        kind: 'domanda',
        q: { id: 'l85-q1', kind: 'scelta', q: 'Con trazione media positiva ($\\sigma_m>0$), quale criterio indica la dispensa?', options: ['Beltrami', 'von Mises', 'Tresca', 'Galileo'], correct: 0, why: 'Con trazione prevalente il rischio è la rottura per decoesione, che von Mises non vede: per una trazione uniforme darebbe $\\sigma_{id}=0$. Beltrami, che conta anche l\'energia di volume, la coglie (§6.5.3). Tresca ha lo stesso difetto di von Mises, perché anch\'esso dipende solo dalle differenze (deduzione).' },
      },
      {
        id: 'l85-18',
        kind: 'spiega',
        title: 'Attenzione a…',
        md: `Tre errori tipici su questo argomento.

1. **Dimenticare che le parti sferica e deviatorica sono ortogonali.** È proprio l'ortogonalità, insieme al legame di Lamé, che annulla i termini di accoppiamento e permette di separare l'energia di volume da quella di forma.
2. **Pensare che von Mises sia adatto alla trazione idrostatica.** Dà $\\sigma_{id}=0$ per ogni trazione uniforme, mentre nella realtà il materiale si rompe per decoesione: per $\\sigma_m>0$ la dispensa indica Beltrami.
3. **Confondere von Mises con Tresca.** Entrambi dipendono dalle differenze delle principali e sono insensibili alla pressione, ma non coincidono: nel puro taglio Tresca dà $2\\tau$ e von Mises $\\sqrt3\\,\\tau$; coincidono negli stati monoassiali (deduzione).`,
      },
      {
        id: 'l85-19',
        kind: 'riassunto',
        md: `**Il filo della lezione.** Ogni tensore si scompone in modo unico in una parte sferica, la media della diagonale per l'identità, e una deviatorica a traccia nulla, e le due parti sono ortogonali. Sulla deformazione la parte sferica porta la variazione di volume e la deviatorica quella di forma; sulla tensione la sferica è la pressione media e la deviatorica lo scostamento dallo stato idrostatico. Per un isotropo il legame di Lamé manda ciascuna parte nella sua, quindi $\\tens T_d=2\\mu\\tens E_d$ e l'energia si spezza in energia di volume più energia distorcente. Von Mises, nella lettura di Hencky, usa come funzione di crisi solo l'energia distorcente: la tensione ideale dipende solo dalle differenze delle principali, dà zero allo stato di Huber ed è adatta all'acciaio; per trazione media positiva si usa Beltrami.

- Secondo teorema di decomposizione: $\\tens A_s=\\tfrac13(\\operatorname{tr}\\tens A)\\tens I$, $\\tens A_d=\\tens A-\\tfrac13(\\operatorname{tr}\\tens A)\\tens I$, $\\tens A_s\\cdot\\tens A_d=0$ (Teo 6.5.1).
- Isotropi: $\\tens T_s=\\mathbb A\\tens E_s$, $\\tens T_d=2\\mu\\tens E_d$; $\\varphi=\\varphi(\\tens E_s)+\\varphi(\\tens E_d)$ (§6.5.1).
- Energia distorcente: $\\varphi_d=\\tfrac12\\mathbb A\\tens E_d\\cdot\\tens E_d=\\frac1{12\\mu}\\big[(s_1-s_2)^2+(s_2-s_3)^2+(s_3-s_1)^2\\big]$ (Def 6.5.2).
- Von Mises: $\\sigma_{id}=\\sqrt{\\tfrac12\\big[(s_1-s_2)^2+(s_2-s_3)^2+(s_3-s_1)^2\\big]}\\le\\sigma_L$ (Teo 6.5.3); puro taglio $\\sqrt3\\,\\tau$.
- Scelta: $\\sigma_m\\le0$ von Mises, $\\sigma_m>0$ Beltrami (§6.5.3).`,
        orale: ['II teorema di decomposizione; decomposizione del legame e dell’energia per isotropi; energia distorcente; dimostrazione di von Mises. (dispensa, domanda 6)', 'Criteri pressure insensitive; Huber a segni invertiti; quando von Mises e quando Beltrami. (dispensa, domanda 7)'],
      },
    ],
  },
  // ================================================================== c8.6
  {
    concept: 'c8.6',
    title: 'Mohr–Coulomb: la crisi per attrito',
    minutes: 18,
    source: D(6, '6.6', undefined, '154–155'),
    visual: SVG('criteri', { tab: 'mohr' }),
    steps: [
      {
        id: 'l86-1',
        kind: 'spiega',
        title: 'Dove siamo e dove andiamo',
        md: `Nella lezione precedente, «Energia distorcente e criterio di von Mises», abbiamo visto che Tresca e von Mises sono insensibili alla pressione: una compressione uniforme non cambia nulla. Ci sono però materiali per cui la compressione **conta, e aiuta**: più li comprimi, più resistono allo scorrimento. La dispensa parla di una crisi di natura **attritiva** (§6.6).

Il criterio di **Mohr–Coulomb** descrive questa crisi con **due parametri**, la **coesione** $c$ e l'**angolo di attrito interno** $\\phi$. A differenza dei criteri precedenti, non lo disegneremo nello spazio delle tensioni principali ma nel **piano di Mohr** del Cap. 3, quello con la tensione normale $\\sigma$ in ascissa e la tangenziale $\\tau$ in ordinata. Le tappe: l'attrito, la coesione, il dominio nel piano di Mohr, la verifica con il cerchio massimo e la forma in tensioni principali.`,
      },
      {
        id: 'l86-2',
        kind: 'spiega',
        title: 'L\'attrito: un blocco appoggiato su un piano',
        md: `Partiamo da un'esperienza di tutti i giorni, studiata da Coulomb nel Settecento. Un blocco è appoggiato su un piano; il piano gli trasmette una forza normale $N$ e una tangenziale $T$. Con la convenzione del corso, trazione positiva, un blocco premuto sul piano ha $N<0$.

Il blocco **non scivola** finché
$$T<-N\\tan\\phi,\\qquad\\tan\\phi=\\mu,$$
dove $\\mu$ è il coefficiente d'attrito (qui $\\mu$ non è il modulo di Lamé) e $\\phi$ l'angolo d'attrito. Leggi il segno: $-N$ è positivo quando il blocco è premuto, quindi **più lo premi, più forza tangenziale sopporta**. Se invece non lo premi, $N=0$, il blocco scivola alla minima spinta: **c'è resistenza solo con la compressione**.

Portato a livello locale, su una giacitura con tensione normale $\\sigma$ e tangenziale $\\tau$: nessuna crisi se $\\tau<-\\sigma\\tan\\phi$.`,
      },
      {
        id: 'l86-3',
        kind: 'spiega',
        title: 'La coesione: resistenza anche senza compressione',
        md: `L'attrito puro ha un limite: senza compressione non c'è alcuna resistenza a taglio. Molti materiali, invece, resistono un po' anche quando nessuno li preme, perché le loro parti sono «incollate» tra loro. Questa resistenza in assenza di compressione, cioè con $N=0$, si chiama **coesione** e si indica con $c$.

Aggiungendo la coesione all'attrito si ottiene il criterio di **Mohr–Coulomb** (1900):
$$|\\tau|<c-\\sigma\\tan\\phi.$$
Il valore assoluto c'è perché il verso della tangenziale non conta. Controlliamo due casi. Con $\\sigma=0$ resta $|\\tau|<c$: la coesione è la resistenza a taglio senza compressione. Con $\\sigma<0$, una compressione, il termine $-\\sigma\\tan\\phi$ è positivo e la resistenza cresce. I due parametri del criterio sono $c$ e $\\phi$.`,
      },
      {
        id: 'l86-4',
        kind: 'domanda',
        q: { id: 'l86-q1', kind: 'vf', q: 'Per Mohr–Coulomb la resistenza a taglio cresce con la compressione.', answer: true, why: 'Nella disuguaglianza $|\\tau|<c-\\sigma\\tan\\phi$, se $\\sigma<0$ il termine $-\\sigma\\tan\\phi$ è positivo e alza il limite (§6.6). È la differenza essenziale rispetto a Tresca e von Mises, per i quali la pressione non cambia nulla.' },
      },
      {
        id: 'l86-5',
        kind: 'spiega',
        title: 'Il dominio nel piano di Mohr: due semirette',
        md: `Disegniamo la condizione nel piano di Mohr, con $\\sigma$ in ascissa e $\\tau$ in ordinata. Il confine $\\tau=c-\\sigma\\tan\\phi$ è una retta inclinata:
- incontra l'asse $\\tau$ (cioè $\\sigma=0$) nel punto $(0,c)$;
- incontra l'asse $\\sigma$ (cioè $\\tau=0$) nel punto $(c/\\tan\\phi,0)$, dalla parte delle trazioni.

Il valore assoluto raddoppia il confine: c'è anche la semiretta simmetrica che passa per $(0,-c)$. Le due semirette partono dallo stesso vertice $(c/\\tan\\phi,0)$ e si aprono verso le compressioni, cioè verso sinistra. Il **dominio di resistenza** è la regione compresa tra le due semirette (figura a p. 154).

Nel diagramma a destra le vedi in blu, con la regione ombreggiata tra di esse. Nota la forma: stretta dalla parte delle trazioni, sempre più larga andando verso le compressioni. È la traduzione grafica di «la compressione aiuta».`,
      },
      {
        id: 'l86-6',
        kind: 'spiega',
        title: 'Quale cerchio guardare: l\'arbelo e il cerchio massimo',
        md: `Il criterio riguarda la coppia $(\\sigma,\\tau)$ su una giacitura. Ma in un punto le giaciture sono infinite: quali dobbiamo controllare?

Qui ci aiuta il Cap. 3. Per il teorema dell'**arbelo di Mohr** (Teo 3.17.1), il punto $(\\sigma,\\tau)$ di ogni giacitura sta nella regione compresa tra il **cerchio massimo**, di diametro $s_1-s_3$, e i due cerchi minori. Questa regione è l'arbelo. Gli stati più gravosi stanno sul suo bordo esterno, il **cerchio massimo**: basta controllare quello.

Il confronto tra cerchio massimo e semirette ha tre esiti:
- cerchio **interno** al dominio: nessuna crisi;
- cerchio **tangente** a una semiretta: crisi imminente;
- cerchio che **esce** dal dominio: lo stato è incompatibile con la resistenza.`,
      },
      {
        id: 'l86-7',
        kind: 'prova',
        title: 'Il cerchio massimo e le semirette',
        md: 'Nel diagramma vedi i tre cerchi di Mohr del punto e le due semirette del dominio. I cursori regolano le tre tensioni principali, la coesione $c$ e l\'angolo di attrito $\\phi$; la riga «cerchio massimo» della tabella dice in quale dei tre casi sei. I valori sono adimensionali.',
        tasks: [
          'Sposta tutte e tre le principali verso sinistra della stessa quantità, cioè aggiungi una compressione uniforme: i cerchi traslano senza cambiare raggio, e il cerchio massimo si allontana dalle semirette. Il materiale resiste di più.',
          'Ora allarga il cerchio massimo, allontanando s₁ da s₃, finché tocca una semiretta: è la crisi imminente.',
          'Riduci la coesione verso il minimo: il vertice delle semirette si avvicina all\'origine e il dominio dalla parte delle trazioni quasi sparisce. Con solo attrito non c\'è resistenza in trazione.',
        ],
        visual: SVG('criteri', { tab: 'mohr' }),
      },
      {
        id: 'l86-8',
        kind: 'domanda',
        q: { id: 'l86-q2', kind: 'scelta', q: 'Perché per la verifica di Mohr–Coulomb basta controllare il cerchio massimo?', options: ['Perché i punti di tutte le giaciture stanno nell\'arbelo, e il cerchio massimo ne è il bordo esterno', 'Perché i cerchi minori corrispondono a giaciture senza tangenziale', 'Perché il cerchio massimo è l\'unico che passa per l\'origine', 'Perché la coesione agisce solo sul cerchio massimo'], correct: 0, why: 'Per il Teo 3.17.1 ogni giacitura dà un punto nell\'arbelo; se il cerchio massimo sta nel dominio, ci sta tutto l\'arbelo. Sui cerchi minori la tangenziale non è nulla in generale, e nessun cerchio deve per forza passare per l\'origine.' },
      },
      {
        id: 'l86-9',
        kind: 'derivazione',
        title: 'La verifica con il cerchio massimo',
        md: 'Dove vogliamo arrivare: tradurre «il cerchio massimo sta dentro il dominio» in una disuguaglianza sulle tensioni principali $s_1$ e $s_3$. L\'idea geometrica è semplice: un cerchio sta tutto da una parte di una retta se la **distanza del suo centro dalla retta** è almeno uguale al **raggio**. Il campione calcola la distanza del centro dalla semiretta superiore.',
        source: D(6, '6.6', undefined, 155),
        der: {
          sample,
          lines: [
            { tex: 'C=\\frac{s_1+s_3}2,\\qquad R=\\frac{s_1-s_3}2', why: 'Il cerchio massimo ha il centro sull\'asse $\\sigma$, a metà tra $s_3$ e $s_1$, e raggio pari alla metà della loro differenza (Cap. 3).' },
            { tex: '\\sigma\\tan\\phi+\\tau-c=0', why: 'Scriviamo la semiretta superiore $\\tau=c-\\sigma\\tan\\phi$ portando tutto a sinistra: è la forma che serve per la formula della distanza punto–retta.', aggiunto: true },
            {
              tex: 'd=\\frac{|C\\tan\\phi-c|}{\\sqrt{1+\\tan^2\\phi}}',
              why: 'Distanza del centro $(C,0)$ dalla retta: si sostituisce il punto nell\'equazione, si prende il valore assoluto e si divide per la radice della somma dei quadrati dei coefficienti di $\\sigma$ e $\\tau$, cioè $\\tan\\phi$ e 1.',
              aggiunto: true,
              val: (v) => {
                const s = S3(v);
                const Cc = (s[0] + s[2]) / 2;
                return Math.abs(Cc * Math.tan(v.phi) - v.co) / Math.sqrt(1 + Math.tan(v.phi) ** 2) * Math.sign(v.co - Cc * Math.tan(v.phi));
              },
            },
            { tex: '=\\frac{c-C\\tan\\phi}{\\sqrt{1+\\tan^2\\phi}}', why: 'Togliamo il valore assoluto prendendo la distanza con il segno: è positiva quando il centro sta dalla parte del dominio, che è il caso che ci interessa. Il campione usa la stessa convenzione.', val: (v) => (v.co - ((S3(v)[0] + S3(v)[2]) / 2) * Math.tan(v.phi)) / Math.sqrt(1 + Math.tan(v.phi) ** 2), aggiunto: true },
            { tex: '=\\Big(c-\\frac{s_1+s_3}2\\tan\\phi\\Big)\\cos\\phi', why: 'Per la trigonometria $1+\\tan^2\\phi=1/\\cos^2\\phi$, quindi dividere per la radice equivale a moltiplicare per $\\cos\\phi$; e al posto di $C$ scriviamo la sua espressione.', val: (v) => (v.co - ((S3(v)[0] + S3(v)[2]) / 2) * Math.tan(v.phi)) * Math.cos(v.phi) },
            { tex: 'd\\ge R\\iff\\frac{s_1-s_3}2\\le\\Big(c-\\frac{s_1+s_3}2\\tan\\phi\\Big)\\cos\\phi', why: 'Imponiamo la condizione geometrica: distanza almeno uguale al raggio. Per la simmetria del dominio, la semiretta inferiore dà la stessa condizione (deduzione).' },
            { tex: 's_1-s_3\\le2c\\cos\\phi-(s_1+s_3)\\tan\\phi\\cos\\phi', why: 'Moltiplichiamo per 2 entrambi i membri e distribuiamo il $\\cos\\phi$.', aggiunto: true },
            {
              tex: '(s_1-s_3)+(s_1+s_3)\\sin\\phi\\le2c\\cos\\phi',
              why: 'Usiamo $\\tan\\phi\\cos\\phi=\\sin\\phi$ e portiamo a sinistra il termine con le tensioni. Questa è la condizione sul cerchio massimo.',
              ask: { q: 'Quando la crisi è imminente?', options: ['Quando il cerchio massimo è tangente a una semiretta', 'Quando un cerchio qualsiasi tocca l’asse τ', 'Quando $s_1=0$', 'Quando $\\phi=0$'], correct: 0, why: 'Tangenza vuol dire distanza uguale al raggio, cioè la disuguaglianza diventa un\'uguaglianza (§6.6). Toccare l\'asse $\\tau$ non ha un significato particolare per il criterio, e $s_1=0$ o $\\phi=0$ sono solo casi particolari dei dati.' },
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
        id: 'l86-10',
        kind: 'spiega',
        title: 'La forma generale in tensioni principali',
        md: `La dispensa scrive il criterio in tensioni principali in forma simmetrica:
$$F=\\max_{i,j}\\big\\{|s_i-s_j|+(s_i+s_j)\\sin\\phi\\big\\}\\le2c\\cos\\phi.$$
Il massimo è preso su tutte le coppie di tensioni principali, cioè sui tre cerchi di Mohr; la dispensa osserva che è la coppia $(1,3)$, cioè il cerchio massimo, a dare il massimo, e per quella coppia la formula è la condizione che abbiamo appena ricavato. La dispensa dà questa formula senza dimostrazione e ne fa solo la verifica (nota NF-11).

Nota che **non c'è una tensione ideale semplice**: a sinistra non resta una tensione da confrontare con $\\sigma_L$, ma una combinazione che dipende da $\\phi$. Leggiamo però due casi (deduzione). In trazione semplice $(\\sigma,0,0)$ la condizione diventa $\\sigma(1+\\sin\\phi)\\le2c\\cos\\phi$; in compressione semplice, di intensità $\\sigma$, diventa $\\sigma(1-\\sin\\phi)\\le2c\\cos\\phi$. Siccome $1-\\sin\\phi<1+\\sin\\phi$, il materiale **resiste di più a compressione che a trazione**: il criterio descrive da solo resistenze diverse.`,
      },
      {
        id: 'l86-11',
        kind: 'spiega',
        title: 'Attenzione a…',
        md: `Il campo di applicazione, nelle parole della dispensa, è quello dei materiali con una crisi di **natura attritiva**. Gli errori tipici sono tre.

1. **Dimenticare che la resistenza a taglio cresce con la compressione.** È il cuore del criterio: chi ragiona «alla Tresca» si aspetta che una pressione non cambi nulla.
2. **Verificare con un cerchio qualsiasi invece che con il cerchio massimo.** I cerchi minori stanno dentro il massimo; se controlli uno di loro puoi dichiarare verificato uno stato che è in crisi.
3. **Cercare una tensione ideale semplice.** Per Mohr–Coulomb non c'è: si verifica la disuguaglianza $F\\le2c\\cos\\phi$, oppure la posizione del cerchio massimo rispetto alle semirette.`,
      },
      {
        id: 'l86-12',
        kind: 'riassunto',
        md: `**Il filo della lezione.** Per i materiali con crisi attritiva la resistenza a taglio cresce con la compressione. L'attrito puro di Coulomb resiste solo se c'è compressione; aggiungendo la coesione, la resistenza senza compressione, si arriva al criterio di Mohr–Coulomb, con due parametri, $c$ e $\\phi$. Nel piano di Mohr il dominio è compreso tra due semirette che si aprono verso le compressioni. Siccome tutte le giaciture stanno nell'arbelo, basta controllare il cerchio massimo: interno, tangente o esterno. Imponendo che la distanza del centro dalla semiretta sia almeno uguale al raggio si ottiene la condizione in tensioni principali, che non ha una tensione ideale semplice.

- Mohr–Coulomb: $|\\tau|<c-\\sigma\\tan\\phi$ (§6.6).
- In tensioni principali: $F=\\max_{i,j}\\big\\{|s_i-s_j|+(s_i+s_j)\\sin\\phi\\big\\}\\le2c\\cos\\phi$ (§6.6).
- Cerchio massimo: $(s_1-s_3)+(s_1+s_3)\\sin\\phi\\le2c\\cos\\phi$.`,
        orale: ['Mohr–Coulomb: attrito, coesione, dominio nel piano di Mohr, cerchio massimo. (dispensa, domanda 8)'],
      },
    ],
  },
  // ================================================================== c8.7
  {
    concept: 'c8.7',
    title: 'Dalla sezione alla struttura: verifica e progetto',
    minutes: 28,
    source: D(6, '6.7–6.9', undefined, '155–158'),
    visual: SVG('jourawski', { section: 'T' }),
    steps: [
      {
        id: 'l87-1',
        kind: 'spiega',
        title: 'Dove siamo e dove andiamo',
        md: `Abbiamo ora una collezione di criteri, tutti scritti con le tensioni principali. Ma nella pratica le tensioni che calcoliamo sono quelle del solido di **Saint-Venant** (Cap. 5): sulla sezione della trave c'è la tensione normale $\\sigma_z$, dovuta a sforzo normale e flessione, e le tangenziali $\\tau_{zx}$, $\\tau_{zy}$, dovute a taglio e torsione. Ogni volta dovremmo calcolare le principali e poi applicare il criterio.

In questa lezione facciamo il conto una volta per tutte e otteniamo le **tensioni ideali direttamente da $\\sigma_z$ e dalle tangenziali**. Poi allarghiamo lo sguardo: come si usa Saint-Venant per una struttura vera, che non è un solido di Saint-Venant, e come si organizzano la **verifica** e il **progetto** di un telaio. È la lezione che chiude il corso e che lega insieme i capitoli 5 e 6.`,
      },
      {
        id: 'l87-2',
        kind: 'spiega',
        title: 'Com\'è fatto uno stato alla Saint-Venant',
        md: `Nel solido di Saint-Venant le tensioni $\\sigma_x$, $\\sigma_y$ e $\\tau_{xy}$ sono nulle. La matrice dello stato di esercizio è quindi (§6.7)
$$[\\tens T_{es}]=\\begin{bmatrix}0&0&\\tau_{zx}\\\\0&0&\\tau_{zy}\\\\\\tau_{zx}&\\tau_{zy}&\\sigma_z\\end{bmatrix}.$$
Le due tangenziali compaiono sempre insieme, ed è comodo riassumerle in un solo numero, il modulo della tangenziale sulla sezione:
$$\\tau_z^2=\\tau_{zx}^2+\\tau_{zy}^2.$$

Guarda le prime due righe della matrice: hanno entrambe zero nelle prime due posizioni, quindi sono proporzionali. Ne segue che il determinante è nullo e che **una tensione principale è zero** (passaggio aggiunto). La dispensa lo dice così: lo stato è **al più biassiale**.`,
      },
      {
        id: 'l87-3',
        kind: 'derivazione',
        title: 'Le tensioni principali di uno stato alla Saint-Venant',
        md: 'Dove vogliamo arrivare: le due tensioni principali non nulle, scritte con $\\sigma_z$ e $\\tau_z$. L\'idea è scrivere l\'equazione secolare (Cap. 3), mettere in evidenza la radice nulla e risolvere l\'equazione di secondo grado che resta. Il campione confronta con il calcolo spettrale del motore.',
        source: D(6, '6.7', undefined, 155),
        der: {
          sample,
          lines: [
            { tex: '\\det\\big([\\tens T_{es}]-s\\,\\tens I\\big)=-s\\,\\big(s^2-\\sigma_zs-\\tau_z^2\\big)=0', why: 'Le tensioni principali sono le radici dell\'equazione secolare. Sviluppando il determinante si può raccogliere $s$: una radice è $s=0$, le altre due risolvono l\'equazione di secondo grado tra parentesi.', aggiunto: true },
            { tex: 's_{\\max}', why: 'Prendiamo la più grande delle radici; il campione la calcola con il motore spettrale sulla matrice $[\\tens T_{es}]$.', val: (v) => eigSym([0, 0, v.tx, 0, 0, v.ty, v.tx, v.ty, v.sz]).values[0] },
            {
              tex: '=\\frac{\\sigma_z}2+\\frac12\\sqrt{\\sigma_z^2+4\\tau_z^2}',
              why: 'La formula risolutiva di $s^2-\\sigma_zs-\\tau_z^2=0$ dà $\\frac{\\sigma_z}2\\pm\\frac12\\sqrt{\\sigma_z^2+4\\tau_z^2}$; il segno più dà la radice maggiore. Il discriminante $\\sigma_z^2+4\\tau_z^2$ non è mai negativo, quindi le radici sono reali (deduzione).',
              val: (v) => C.svPrincipal(v.sz, v.tx, v.ty).a,
              eq: '§6.7',
            },
          ],
        },
      },
      {
        id: 'l87-4',
        kind: 'spiega',
        title: 'Attenzione agli indici: qui non indicano un ordine',
        md: `Abbiamo trovato le principali
$$s_{1,2}=\\frac{\\sigma_z}2\\pm\\frac12\\sqrt{\\sigma_z^2+4\\tau_z^2},\\qquad s_3=0.$$
Qui c'è una trappola di notazione (nota NF-09). In tutto il capitolo gli indici seguono l'ordine $s_1\\ge s_2\\ge s_3$. In §6.7, invece, la dispensa chiama $s_1$ e $s_2$ le due principali **non nulle** e $s_3$ quella **nulla**, che «sta tra le due».

Perché sta tra le due? Il prodotto delle radici dell'equazione di secondo grado è $s_1s_2=-\\tau_z^2\\le0$ (passaggio aggiunto): una è positiva e l'altra negativa, e lo zero sta in mezzo. Quindi in questa sezione **gli indici sono nomi, non un ordinamento**: la massima è $s_1$, la minima è $s_2$, e la differenza massima, quella che serve a Tresca, è $s_1-s_2$.`,
      },
      {
        id: 'l87-5',
        kind: 'derivazione',
        title: 'La tensione ideale di von Mises alla Saint-Venant',
        md: 'Dove vogliamo arrivare: $\\sigma_{id}^{vM}$ scritta con $\\sigma_z$ e $\\tau_z$. L\'idea è non sostituire direttamente le radici, che contengono una radice quadrata, ma usare la loro **somma** e il loro **prodotto**, che sono semplici. Il campione confronta con il criterio generale applicato alle principali del motore.',
        source: D(6, '6.7', undefined, '155–156'),
        der: {
          sample,
          lines: [
            { tex: '\\sigma_{id}^{vM}', why: 'Partiamo dalla tensione ideale di von Mises, calcolata dal motore sulle tre principali ordinate.', val: (v) => C.vonMises(C.sortS(eigSym([0, 0, v.tx, 0, 0, v.ty, v.tx, v.ty, v.sz]).values)) },
            {
              tex: '=\\sqrt{\\tfrac12\\big[(s_1-s_2)^2+(s_2-0)^2+(0-s_1)^2\\big]}',
              why: 'Applichiamo il Teo 6.5.3 con le principali $s_1$, $s_2$ e $s_3=0$. Per von Mises l\'ordine non conta, perché compaiono tutte e tre le differenze al quadrato.',
              val: (v) => {
                const p = C.svPrincipal(v.sz, v.tx, v.ty);
                return C.vonMises(C.sortS([p.a, 0, p.b]));
              },
            },
            {
              tex: '=\\sqrt{s_1^2+s_2^2-s_1s_2}',
              why: 'Sviluppiamo $(s_1-s_2)^2=s_1^2-2s_1s_2+s_2^2$: dentro la parentesi restano $2s_1^2+2s_2^2-2s_1s_2$, e la metà è $s_1^2+s_2^2-s_1s_2$.',
              val: (v) => {
                const p = C.svPrincipal(v.sz, v.tx, v.ty);
                return Math.sqrt(p.a ** 2 + p.b ** 2 - p.a * p.b);
              },
              aggiunto: true,
            },
            {
              tex: 's_1+s_2=\\sigma_z,\\qquad s_1s_2=-\\tau_z^2,\\qquad s_1^2+s_2^2=\\sigma_z^2+2\\tau_z^2',
              why: 'Somma e prodotto delle radici di $s^2-\\sigma_zs-\\tau_z^2=0$ si leggono dai coefficienti; da essi $s_1^2+s_2^2=(s_1+s_2)^2-2s_1s_2$. La dispensa usa proprio quest\'ultima relazione.',
              aggiunto: true,
              ask: { q: 'Quanto vale $s_1s_2$ per lo stato alla Saint-Venant?', options: ['$-\\tau_z^2$', '$\\tau_z^2$', '$\\sigma_z^2$', '0'], correct: 0, why: 'In un\'equazione $s^2+bs+c=0$ il prodotto delle radici è il termine noto, qui $-\\tau_z^2$. Il segno meno dice che le due principali hanno segno opposto. Zero sarebbe il prodotto con la terza principale, quella nulla.' },
            },
            {
              tex: '=\\sqrt{(\\sigma_z^2+2\\tau_z^2)+\\tau_z^2}',
              why: 'Sostituiamo: $s_1^2+s_2^2$ vale $\\sigma_z^2+2\\tau_z^2$, e $-s_1s_2$ vale $+\\tau_z^2$.',
              val: (v) => {
                const t2 = v.tx ** 2 + v.ty ** 2;
                return Math.sqrt(v.sz ** 2 + 2 * t2 + t2);
              },
              aggiunto: true,
            },
            {
              tex: '=\\sqrt{\\sigma_z^2+3\\tau_z^2}',
              why: 'Sommiamo i termini in $\\tau_z^2$: la tensione ideale di von Mises per uno stato alla Saint-Venant.',
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
        id: 'l87-6',
        kind: 'spiega',
        title: 'Tresca e Grashof alla Saint-Venant',
        md: `Gli altri due criteri si ottengono allo stesso modo, e la dispensa ne fa la verifica.

**Tresca.** La differenza tra la massima e la minima è $s_1-s_2$, cioè la differenza tra le due radici, che vale la radice del discriminante:
$$\\sigma_{id}^{Tresca}=\\sqrt{\\sigma_z^2+4(\\tau_{zx}^2+\\tau_{zy}^2)}.$$

**Grashof**, con $\\nu$ di Poisson. A trazione $\\sigma_{id}^t=s_1-\\nu(s_2+0)=s_1-\\nu s_2$; a compressione $\\sigma_{id}^c=s_2-\\nu s_1$. Sostituendo le radici:
$$\\sigma_{id}^{t,c}=\\frac{1-\\nu}2\\sigma_z\\pm\\frac{1+\\nu}2\\sqrt{\\sigma_z^2+4(\\tau_{zx}^2+\\tau_{zy}^2)}.$$

La dispensa avverte che negli appunti originali i coefficienti di Grashof erano **scambiati**, e suggerisce una controprova: nel **puro taglio** ($\\sigma_z=0$) si deve trovare $\\sigma_{id}^t=(1+\\nu)\\tau_z$, che è proprio quello che dà la formula giusta.`,
      },
      {
        id: 'l87-7',
        kind: 'spiega',
        title: 'Leggiamo le tre formule su due casi',
        md: `Mettiamo le tre formule una accanto all'altra e proviamole.

Con **sola tensione normale**, $\\tau_z=0$: Tresca e von Mises danno $|\\sigma_z|$; Grashof a trazione dà $\\frac{1-\\nu}2\\sigma_z+\\frac{1+\\nu}2\\sigma_z=\\sigma_z$ per $\\sigma_z>0$ (passaggio aggiunto). Torniamo alla verifica monoassiale.

Con **solo taglio**, $\\sigma_z=0$: Tresca dà $2\\tau_z$, von Mises $\\sqrt3\\,\\tau_z$, Grashof $(1+\\nu)\\tau_z$. Sono gli stessi valori trovati nelle lezioni «Galileo, Tresca, Grashof» e «Energia distorcente e criterio di von Mises».

Nota anche che, a parità di dati, Tresca dà sempre un valore almeno pari a quello di von Mises, perché sotto radice c'è $4\\tau_z^2$ invece di $3\\tau_z^2$ (deduzione): Tresca è il più prudente dei due. Quanto ai materiali, la dispensa conclude: **Tresca e von Mises per i duttili, Grashof per i fragili**.`,
      },
      {
        id: 'l87-8',
        kind: 'domanda',
        q: { id: 'l87-q1', kind: 'scelta', q: 'Quale tensione ideale ha il puro taglio $\\tau$ secondo von Mises, in uno stato alla Saint-Venant?', options: ['$\\sqrt3\\,\\tau$', '$2\\tau$', '$\\tau$', '$(1+\\nu)\\tau$'], correct: 0, why: 'Con $\\sigma_z=0$ la formula $\\sqrt{\\sigma_z^2+3\\tau_z^2}$ dà $\\sqrt3\\,\\tau$ (§6.7). $2\\tau$ è Tresca, $(1+\\nu)\\tau$ è Grashof a trazione; $\\tau$ è la tensione principale massima, cioè Galileo.' },
      },
      {
        id: 'l87-9',
        kind: 'spiega',
        title: 'Le travature: perché Saint-Venant non basta da solo',
        md: `Abbiamo formule comode per le sezioni di un solido di Saint-Venant. Ma le strutture vere sono solidi di Saint-Venant?

L'esempio della dispensa è un **capannone** (§6.8): colonne, mensole che reggono il carroponte, una copertura a volta, una pensilina, magari pannelli fotovoltaici. Guardalo con gli occhi del Cap. 5 e trovi molte differenze rispetto alle ipotesi di Saint-Venant:
- ci sono aste ad **asse curvo**, come la volta;
- ci sono **sezioni variabili** lungo l'asse;
- ci sono **forze sul mantello**, cioè sulla superficie laterale, come il vento o gli impianti appesi;
- c'è il **peso proprio**, una forza di volume.

Nel solido di Saint-Venant, invece, il mantello è scarico e le forze di volume sono nulle. Quindi la soluzione di Saint-Venant **non si applica direttamente** alla struttura intera.`,
      },
      {
        id: 'l87-10',
        kind: 'spiega',
        title: 'La regola: le parti regolari e le stesse caratteristiche della sollecitazione',
        md: `La dispensa risolve il problema con una regola da ricordare per l'orale. **Non** si assimila la struttura a un solido di Saint-Venant. Si osserva invece che nelle **parti regolari** della struttura, che la dispensa chiama **regioni B** (le stesse del Cap. 5, lontane da brusche variazioni di sezione, carichi concentrati e curvature forti), lo stato di tensione di una sezione è quello della sezione di un solido di Saint-Venant soggetto alle **stesse caratteristiche della sollecitazione** (in breve CdS: sforzo normale, tagli, momenti flettenti e torcente).

Dove la struttura non è regolare, per esempio nei nodi o sotto un carico concentrato, servono **procedimenti specifici**. L'esempio della dispensa: in una trave a doppio T su cui poggia un macchinario pesante, in corrispondenza degli appoggi le ali sono irrigidite da profili trasversali, che si dimensionano secondo le norme (regole di dettaglio costruttivo) o con calcoli specifici.

Da qui l'**atteggiamento** da tenere, sempre:
1. si calcolano le CdS con l'**analisi strutturale**;
2. si ricava $\\tens T$ con le formule di **Saint-Venant**;
3. si verifica con i **criteri di resistenza**.`,
      },
      {
        id: 'l87-11',
        kind: 'domanda',
        q: { id: 'l87-q2', kind: 'scelta', q: 'In un capannone, dove si può usare la soluzione di Saint-Venant per calcolare le tensioni in una sezione?', options: ['Nelle parti regolari, con le stesse caratteristiche della sollecitazione della sezione', 'Ovunque, perché ogni asta è un solido di Saint-Venant', 'Solo nei nodi, dove le aste si incontrano', 'Da nessuna parte, perché ci sono forze sul mantello'], correct: 0, why: 'La regola del §6.8 è che nelle regioni regolari lo stato di una sezione è quello del solido di Saint-Venant con le stesse CdS. Non vale ovunque: nei nodi e nelle discontinuità servono procedimenti specifici. E le forze sul mantello impediscono di usare Saint-Venant per l\'intera struttura, non per le parti regolari.' },
      },
      {
        id: 'l87-12',
        kind: 'spiega',
        title: 'Verifica e progetto: due problemi diversi',
        md: `Sappiamo ora calcolare e verificare le tensioni in ogni sezione. La dispensa distingue due tipi di problema (§6.9).

- Nella **verifica** tutto è assegnato: geometria, sezioni, materiale, carichi. Si controlla che in **ogni punto di ogni sezione** lo stato $\\tens T$ sia compatibile con la resistenza. Nella tecnica, avverte la dispensa, si considerano anche la deformabilità e la stabilità.
- Nel **progetto** si deve **dimensionare**: la forma della sezione è assegnata **a meno di un parametro** $a$, e bisogna trovarne il valore. Per esempio, un doppio T con ali di $6a\\times a$ e anima alta $20a$: tutte le dimensioni sono multipli di $a$.

La traccia tipo d'esame è un **portale** di luce $L$ e altezza $H$, con un carico distribuito $q$ sul traverso, sezione a T con dimensioni proporzionali ad $a$ e tensione ammissibile $\\sigma_{adm}$ assegnata (figura a p. 157).`,
      },
      {
        id: 'l87-13',
        kind: 'spiega',
        title: 'Lo schema della verifica: sezioni critiche',
        md: `La verifica di un telaio si fa in quattro passi. I primi due servono a non dover controllare infinite sezioni.

1. **Caratteristiche della sollecitazione.** Con l'analisi strutturale si tracciano i diagrammi di sforzo normale $N$, taglio $T$ e momento $M$.
2. **Sezioni critiche.** Si cercano, asta per asta, le sezioni dove le CdS sono più gravose. Per il portale ABCD della dispensa: sul ritto AB le sezioni A e B$_A$ (cioè B vista dal ritto); sul traverso B$_C$, la sezione K dove il momento è massimo, e C$_B$; sull'altro ritto C$_D$ e D. Per **simmetria** alcune di queste sezioni si possono omettere.

Una volta scelte le sezioni critiche, bisogna decidere **in quali punti** di ciascuna sezione verificare: è il passo successivo, e lì serve quello che sappiamo su flessione e taglio.`,
      },
      {
        id: 'l87-14',
        kind: 'spiega',
        title: 'Lo schema della verifica: punti pericolosi e tabella',
        md: `3. **Punti pericolosi.** In ogni sezione critica si tracciano i diagrammi di $\\sigma_z$, dovuta a $N$ e $M$, della $\\tau_{zy}$ nell'anima con la formula di Jourawski, e della $\\tau_{zx}$ nell'ala. Per una sezione a T i punti da guardare sono tre:
   - i **lembi**, dove $\\sigma_z$ è massima e la tangenziale è nulla;
   - l'**attacco ala–anima**, appena prima e appena dopo il salto della tangenziale: qui $\\sigma_z$ è ancora grande e $\\tau$ cambia bruscamente, quindi possono essere grandi entrambe (deduzione);
   - la **corda baricentrica**, dove la tangenziale è massima.
4. **Verifiche di sicurezza.** Punto per punto si applica un criterio, per esempio Tresca, con le formule alla Saint-Venant, e si riassume tutto in una tabella con $\\sigma_z$, $\\tau_{zx}$, $\\tau_{zy}$ e $\\sigma_{id}$ da confrontare con $\\sigma_{adm}$.`,
      },
      {
        id: 'l87-15',
        kind: 'prova',
        title: 'I punti pericolosi di una sezione a T',
        md: 'Il diagramma mostra la sezione a T e la tangenziale media $\\bar\\tau$ di Jourawski sulle corde. Il cursore sposta la corda dal lembo superiore verso il basso; l\'area sotto la corda, in giallo, è quella che entra nel momento statico.',
        tasks: [
          'Porta la corda al lembo: la tangenziale è nulla. Lì conta solo σ_z, che con la flessione è massima.',
          'Porta la corda all\'attacco tra ala e anima e spostala appena sopra e appena sotto: la tangenziale salta, perché la larghezza della corda cambia di colpo. Per questo la verifica si fa in entrambi i punti.',
          'Porta la corda al baricentro: la tangenziale è massima, mentre la σ_z dovuta al momento è nulla, perché lì passa l\'asse neutro della flessione retta (deduzione).',
        ],
        visual: SVG('jourawski', { section: 'T' }),
      },
      {
        id: 'l87-16',
        kind: 'spiega',
        title: 'Il progetto: prima predimensionare, poi verificare',
        md: `Nel progetto non conosciamo $a$, quindi non possiamo partire dalla verifica. La dispensa aggiunge un passo, il **2′**, tra le sezioni critiche e i punti pericolosi: il **predimensionamento a flessione**.

Si prende la sezione con il momento massimo in valore assoluto, $|M|_{\\max}$, e si considera solo la flessione. Per una sezione a T, che non è simmetrica rispetto all'asse neutro, le fibre superiori e inferiori hanno distanze diverse dal baricentro, e quindi due **moduli di resistenza** diversi, $W'$ e $W''$:
$$\\sigma'_z=\\frac M{W'},\\qquad\\sigma''_z=\\frac M{W''}.$$
Siccome $W'$ e $W''$ dipendono da $a$, imponendo $|\\sigma_z|_{\\max}\\le\\sigma_{adm}$ si trova il valore minimo $a_{\\min}$; nell'esempio della dispensa è 14,81 mm. Poi si **aumenta** $a$, di circa il 10% fino a un valore comodo (nell'esempio 17 mm), perché la flessione da sola non dice tutto (deduzione). Infine si fa la **verifica completa** con i passi 3 e 4, considerando anche una sezione in cui il taglio non è nullo.`,
      },
      {
        id: 'l87-17',
        kind: 'domanda',
        q: { id: 'l87-q3', kind: 'scelta', q: 'Perché dopo il predimensionamento a flessione bisogna comunque fare la verifica completa?', options: ['Perché il predimensionamento considera solo la $\\sigma_z$ di flessione nella sezione con momento massimo, e trascura le tangenziali e le altre sezioni', 'Perché il valore di $a$ trovato è sempre sbagliato', 'Perché la verifica serve solo a scegliere il criterio', 'Non serve: se la flessione è verificata, lo è anche tutto il resto'], correct: 0, why: 'Il passo 2′ guarda solo la flessione nella sezione più sollecitata; nei punti con taglio, come l\'attacco ala–anima, la tensione ideale può essere più grande (§6.9). Per questo si arrotonda $a$ in eccesso e si rifà la verifica, considerando anche una sezione con taglio non nullo.' },
      },
      {
        id: 'l87-18',
        kind: 'spiega',
        title: 'Attenzione a…',
        md: `Tre errori tipici su questo argomento.

1. **Prendere per ordinati gli indici di §6.7.** Lì $s_3=0$ è la principale nulla e sta tra le due non nulle (nota NF-09): la differenza massima, per Tresca, è $s_1-s_2$, non $s_1-s_3$.
2. **Verificare solo i lembi.** Ai lembi $\\sigma_z$ è massima, ma all'attacco ala–anima $\\sigma_z$ è ancora grande e la tangenziale ha il salto di Jourawski: la tensione ideale può essere maggiore.
3. **Applicare Saint-Venant nei nodi o dove ci sono carichi sul mantello.** La regola vale nelle parti regolari, con le stesse caratteristiche della sollecitazione; altrove servono procedimenti specifici.`,
      },
      {
        id: 'l87-19',
        kind: 'riassunto',
        md: `**Il filo della lezione.** Uno stato alla Saint-Venant ha solo $\\sigma_z$ e le tangenziali sulla sezione: è al più biassiale, con una principale nulla che sta tra le due non nulle. Usando somma e prodotto delle principali si ottengono le tensioni ideali in forma chiusa, da usare con Tresca e von Mises per i duttili e con Grashof per i fragili. Una struttura vera non è un solido di Saint-Venant, ma nelle sue parti regolari ogni sezione si comporta come quella di Saint-Venant con le stesse caratteristiche della sollecitazione: si calcolano le CdS con l'analisi strutturale, le tensioni con Saint-Venant e si verifica con i criteri. La verifica di un telaio passa per sezioni critiche, punti pericolosi e tabella; il progetto premette un predimensionamento a flessione, poi arrotonda il parametro e verifica.

- Principali: $s_{1,2}=\\frac{\\sigma_z}2\\pm\\frac12\\sqrt{\\sigma_z^2+4\\tau_z^2}$, $s_3=0$, con $\\tau_z^2=\\tau_{zx}^2+\\tau_{zy}^2$ (§6.7).
- Tresca e von Mises: $\\sigma_{id}^{Tresca}=\\sqrt{\\sigma_z^2+4\\tau_z^2}$, $\\sigma_{id}^{vM}=\\sqrt{\\sigma_z^2+3\\tau_z^2}$ (§6.7).
- Grashof, con $\\nu$ di Poisson: $\\sigma_{id}^{t,c}=\\frac{1-\\nu}2\\sigma_z\\pm\\frac{1+\\nu}2\\sqrt{\\sigma_z^2+4\\tau_z^2}$; puro taglio $(1+\\nu)\\tau_z$ (§6.7).
- Punti pericolosi della sezione a T: lembi, attacco ala–anima prima e dopo il salto, corda baricentrica (§6.9).`,
        orale: ['Tensioni ideali alla Saint-Venant (Tresca, von Mises, Grashof). (dispensa, domanda 9)', 'Estensione alle travature; schema di verifica e di progetto di un telaio. (dispensa, domanda 10)'],
      },
    ],
  },
];
