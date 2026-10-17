/**
 * Lezioni guidate del Modulo 4 (Cap. 4, §4.1–4.11). Derivazioni solo dove la dispensa le sviluppa; le righe con `val`
 * sono verificate su 25 campioni casuali (tests/lezioni.test.ts). Riscritte secondo docs/GUIDA_LEZIONI.md: ogni lezione
 * contiene anche tutto ciò che stava nella scheda del concetto (significato, formule, spiegazione, errori tipici).
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
        title: 'Dove siamo e dove andiamo',
        md: `Prima di tutto un avviso: la dispensa presenta questo argomento come approfondimento **non richiesto all'orale** (§4.1, p. 66). Lo trovi qui perché fa da ponte tra il capitolo 3 e il capitolo 4, ma puoi saltarlo senza perdere nulla di necessario per l'esame.

Nel capitolo 3, nella lezione sulle tensioni principali, hai visto che in **un punto** del corpo esistono tre direzioni speciali, le direzioni principali, lungo le quali il vettore tensione è tutto normale. La domanda di questa breve lezione è: che cosa succede se guardiamo queste direzioni **in tutti i punti insieme**? Ne nasce un disegno del corpo intero, le linee isostatiche, che racconta come i carichi lo attraversano. Le tappe sono due: costruire le curve e poi capire come si leggono.`,
      },
      {
        id: 'l40-2',
        kind: 'spiega',
        title: 'Come si costruisce una linea isostatica',
        md: `Guarda il modello: in un punto vedi le direzioni principali di tensione. Chiamiamo $\\hat n_1(x)$ la direzione della tensione principale massima $s_1$ nel punto $x$, e $\\hat n_3(x)$ quella della tensione principale minima $s_3$.

Ora immagina di ripetere la stessa operazione in ogni punto del corpo: ottieni, punto per punto, una freccetta per $s_1$ e una per $s_3$. Se tracci curve che in ogni punto seguono la freccetta, cioè curve **tangenti** a quelle direzioni, ottieni due famiglie di curve: sono le **linee isostatiche** (§4.1). In formula:
$$\\text{tangente alla linea in }x\\ \\parallel\\ \\hat n_1(x)\\ \\text{oppure}\\ \\hat n_3(x).$$

Nello spazio c'è anche una terza famiglia, quella tangente alle direzioni della tensione principale media. La figura di p. 66 mostra un corpo con le due famiglie $s_1$ e $s_3$ che si incrociano in un punto $x$.`,
      },
      {
        id: 'l40-3',
        kind: 'domanda',
        q: { id: 'l40-q1', kind: 'vf', q: 'Le isostatiche sono tangenti alle direzioni principali di tensione.', answer: true, why: `È proprio la loro definizione (§4.1): in ogni punto la curva ha come tangente la direzione principale di $s_1$ (prima famiglia) o di $s_3$ (seconda famiglia). Non sono tangenti al vettore tensione su una giacitura qualsiasi.` },
      },
      {
        id: 'l40-4',
        kind: 'spiega',
        title: 'Come si leggono: come le curve di livello',
        md: `Abbiamo costruito le curve; ora chiediamoci che cosa ci dicono. La dispensa usa un paragone con le **curve di livello** di una carta topografica: dove il terreno è ripido le curve si infittiscono, dove è pianeggiante si diradano. Allo stesso modo le isostatiche sono **più fitte dove la tensione è maggiore**.

Per questo il disegno delle isostatiche mostra come i carichi «fluiscono» dentro il corpo, da dove sono applicati fino ai vincoli. Ed è un'informazione utile per progettare: dove le linee si addensano conviene addensare anche la materia, per usarla in modo efficiente. L'esempio della dispensa è il telaio di una moto, in cui si mette quanto più materiale possibile lungo le isostatiche generate dalla forma e dai carichi.`,
      },
      {
        id: 'l40-5',
        kind: 'domanda',
        q: { id: 'l40-q2', kind: 'scelta', q: 'Dove le linee isostatiche sono più fitte?', options: ['Dove la tensione è maggiore', 'Dove la tensione è nulla', 'Sempre e solo sui bordi liberi', 'Sono ugualmente fitte ovunque'], correct: 0, why: `Come le curve di livello si infittiscono dove il terreno è più ripido, le isostatiche si infittiscono dove la tensione è più alta (§4.1). Non c'è nessuna regola che le concentri sui bordi, e dove la tensione è piccola si diradano.` },
      },
      {
        id: 'l40-6',
        kind: 'spiega',
        title: 'Attenzione a che posto dare a questo argomento',
        md: `L'unico errore da evitare qui è di metodo: **non è un argomento d'orale** secondo la dispensa. Serve come collegamento tra la tensione in un punto (capitolo 3) e il progetto di un oggetto reale, e ti aiuta a immaginare le direzioni principali come qualcosa che cambia da punto a punto. Se all'orale ti chiedono le direzioni principali, parla di autovalori e autovettori di $\\tens T$, il tensore degli sforzi, non di isostatiche.`,
      },
      {
        id: 'l40-7',
        kind: 'riassunto',
        md: `**Il filo della lezione.** In ogni punto del corpo il tensore degli sforzi ha le sue direzioni principali; collegando queste direzioni da punto a punto si ottengono le linee isostatiche, curve tangenti alle direzioni di $s_1$ e di $s_3$ (e nello spazio di quella media). Come le curve di livello, si infittiscono dove la tensione è maggiore, e quindi mostrano come i carichi attraversano il corpo e dove conviene mettere la materia. È un approfondimento facoltativo.

- Definizione: tangente alla linea in $x$ parallela a $\\hat n_1(x)$ oppure a $\\hat n_3(x)$ (§4.1).`,
      },
    ],
  },
  // ================================================================== c4.1
  {
    concept: 'c4.1',
    title: 'Il lavoro e il teorema dei lavori virtuali',
    minutes: 32,
    source: D(4, '4.2–4.3', 'Teo 4.2.1, Def 4.3.1–4.3.3, Teo 4.3.4', '67–69'),
    visual: SVG('divergenza'),
    steps: [
      {
        id: 'l41-1',
        kind: 'spiega',
        title: 'Dove siamo e dove andiamo',
        md: `Nel capitolo 2 abbiamo imparato a descrivere **come** un corpo cambia forma: lo spostamento $\\vet u$ e il tensore di deformazione infinitesima $\\tens E$. Nel capitolo 3 abbiamo descritto le **forze interne**: il tensore degli sforzi $\\tens T$ e le equazioni di equilibrio. Sono due storie complete, ma separate: niente di quello che sappiamo ci dice di quanto si deforma un corpo sotto un certo carico. Manca il legame tra le due.

Il capitolo 4 costruisce questo legame in due tempi. Prima, in questa lezione, trova un ponte che collega forze e spostamenti **senza** dire chi causa chi: il lavoro, e il teorema dei lavori virtuali. Poi, dalla prossima lezione, introdurrà il materiale, che dà la causalità.

Le tappe di oggi: perché proprio il lavoro; il lemma fondamentale, con la sua dimostrazione; i due «sistemi» di cui parla il teorema; il teorema e la sua dimostrazione; infine le osservazioni che la dispensa chiede all'orale.`,
      },
      {
        id: 'l41-2',
        kind: 'spiega',
        title: 'Perché proprio il lavoro',
        md: `Il lavoro, nella sua forma più semplice, è **forza per spostamento**. Fermati su questa frase: dentro un solo numero ci sono un ente **statico**, la forza, e un ente **cinematico**, lo spostamento. È quindi la grandezza naturale per far parlare tra loro i due capitoli precedenti (§4.2).

Il teorema dei lavori virtuali (TLV) li mette in relazione in un modo preciso e un po' sorprendente: **senza alcun nesso di causalità**. Non afferma che certe deformazioni sono prodotte da certe forze; chiede soltanto che le forze e gli spostamenti si riferiscano allo stesso corpo.

E allora la causalità da dove arriva? Dal **legame costitutivo**, cioè l'espressione matematica della natura del materiale: sarà lui, nelle prossime lezioni, a dire che un acciaio e un legno sotto lo stesso carico si deformano in modo diverso. Per ora teniamo separati i due piani.`,
      },
      {
        id: 'l41-3',
        kind: 'spiega',
        title: 'Gli attrezzi che servono per il lemma',
        md: `Il lemma fondamentale (Teo 4.2.1) è un'identità di analisi: prima di dimostrarlo ripassiamo i quattro attrezzi del Modulo 1 che userà.

- **Trasposto:** $\\tens T^T$ è il tensore che permette di spostare $\\tens T$ dall'altra parte di un prodotto scalare, $\\tens T\\vet a\\cdot\\vet b=\\vet a\\cdot\\tens T^T\\vet b$.
- **Teorema della divergenza** (Teo 1.8.4): il flusso di un campo vettoriale uscente da una superficie chiusa è uguale all'integrale della sua divergenza sul volume racchiuso, $\\int_{\\partial D}\\vet w\\cdot\\hat n\\,dA=\\int_D\\operatorname{div}\\vet w\\,dV$. Il modello a destra lo mostra su un quadrato.
- **Divergenza di un tensore** (Def 1.8.3): è il vettore che si ottiene facendo la divergenza riga per riga, $(\\operatorname{div}\\tens T)_i=\\sum_j\\partial T_{ij}/\\partial x_j$.
- **Prodotto scalare tra tensori:** $\\tens A\\cdot\\tens B$ è la somma dei prodotti delle componenti omologhe, $\\sum_{ij}A_{ij}B_{ij}$.

Infine $\\tens H=\\nabla\\vet u$ è il gradiente di spostamento del capitolo 2. Il lemma vale per **qualsiasi** campo $\\tens T(x)$ e $\\vet u(x)$ regolari: non serve che $\\tens T$ sia in equilibrio.`,
      },
      {
        id: 'l41-4',
        kind: 'derivazione',
        title: 'Lemma fondamentale',
        md: `**Dove vogliamo arrivare:** trasformare l'integrale sulla frontiera $\\partial\\mathcal B$ del termine $\\tens T\\hat n\\cdot\\vet u$ in integrali sul volume del corpo $\\mathcal B$. **L'idea:** riscrivere l'integranda come il flusso di un campo vettoriale, applicare il teorema della divergenza e poi sviluppare la divergenza di un prodotto. Il campione numerico è il cubo unitario con $\\tens T$ lineare e $\\vet u$ quadratico: gli integrali sono calcolati davvero (quadratura di Gauss, esatta per questi polinomi).`,
        source: D(4, '4.2.1', 'Teo 4.2.1', 67),
        der: {
          sample: lemmaSample,
          lines: [
            { tex: '\\int_{\\partial\\mathcal B}\\tens T\\hat n\\cdot\\vet u\\,dA', why: `Il punto di partenza. In ogni punto della frontiera il tensore $\\tens T$ applicato alla normale uscente $\\hat n$ dà un vettore; lo moltiplichiamo scalarmente per lo spostamento $\\vet u$ di quel punto e sommiamo su tutta la superficie.`, val: (v) => { const { Tf, u } = fields(v); return El.lemmaTerms(Tf, u)[0]; } },
            {
              tex: '=\\int_{\\partial\\mathcal B}\\tens T^T\\vet u\\cdot\\hat n\\,dA',
              why: `Abbiamo portato $\\tens T$ dall'altra parte del prodotto scalare: per la definizione di trasposto $\\tens T\\hat n\\cdot\\vet u=\\tens T^T\\vet u\\cdot\\hat n$. Perché farlo? Perché ora l'integranda è «un vettore, $\\tens T^T\\vet u$, per la normale»: esattamente la forma di un flusso.`,
              val: (v) => { const { Tf, u } = fields(v); return El.lemmaTerms(Tf, u)[0]; },
            },
            {
              tex: '=\\int_{\\mathcal B}\\operatorname{div}(\\tens T^T\\vet u)\\,dV',
              why: `Applichiamo il teorema della divergenza (Teo 1.8.4) al campo vettoriale $\\vet w=\\tens T^T\\vet u$: il suo flusso uscente dalla frontiera è uguale all'integrale della sua divergenza sul volume. L'integrale di superficie è diventato un integrale di volume.`,
              ask: { q: `L'integranda ora è un vettore moltiplicato scalarmente per la normale. Quale teorema trasforma questo integrale di superficie in uno di volume?`, options: ['Il teorema della divergenza', 'Il lemma di Cauchy', 'Il teorema di Schwarz', 'Il teorema spettrale'], correct: 0, why: `Il teorema della divergenza (Teo 1.8.4) dice $\\int_{\\partial D}\\vet w\\cdot\\hat n\\,dA=\\int_D\\operatorname{div}\\vet w\\,dV$. Il lemma di Cauchy riguarda $\\vet t_n=-\\vet t_{-n}$, Schwarz l'ordine delle derivate miste, il teorema spettrale gli autovalori: nessuno dei tre passa dalla superficie al volume.` },
              val: (v) => { const { Tf, u } = fields(v); const [, a, b] = El.lemmaTerms(Tf, u); return a + b; },
            },
            {
              tex: '=\\int_{\\mathcal B}\\big(\\operatorname{div}\\tens T\\cdot\\vet u+\\tens T\\cdot\\tens H\\big)\\,dV',
              why: `Usiamo l'identità $\\operatorname{div}(\\tens T^T\\vet u)=\\operatorname{div}\\tens T\\cdot\\vet u+\\tens T\\cdot\\nabla\\vet u$, con $\\nabla\\vet u=\\tens H$. È la regola della derivata di un prodotto: una volta si deriva $\\tens T$ tenendo fermo $\\vet u$, una volta $\\vet u$ tenendo fermo $\\tens T$. In componenti (passaggio aggiunto): $(\\tens T^T\\vet u)_j=\\sum_iT_{ij}u_i$, e derivando rispetto a $x_j$ e sommando su $j$ si ottiene $\\sum_iu_i\\sum_j\\partial_jT_{ij}+\\sum_{ij}T_{ij}\\partial_ju_i$, cioè proprio $\\operatorname{div}\\tens T\\cdot\\vet u+\\tens T\\cdot\\tens H$.`,
              aggiunto: true,
              val: (v) => { const { Tf, u } = fields(v); const [, a, b] = El.lemmaTerms(Tf, u); return a + b; },
            },
            { tex: '=\\int_{\\mathcal B}\\operatorname{div}\\tens T\\cdot\\vet u\\,dV+\\int_{\\mathcal B}\\tens T\\cdot\\tens H\\,dV', why: `L'integrale di una somma è la somma degli integrali: separiamo i due termini, perché ciascuno ha un significato fisico suo. È l'enunciato del lemma fondamentale.`, val: (v) => { const { Tf, u } = fields(v); const [, a, b] = El.lemmaTerms(Tf, u); return a + b; }, eq: 'Teo 4.2.1' },
          ],
        },
      },
      {
        id: 'l41-5',
        kind: 'spiega',
        title: 'Che cosa dice il lemma, e un controllo',
        md: `Rileggiamo il risultato a parole: l'integrale sulla frontiera di $\\tens T\\hat n\\cdot\\vet u$ si scrive come la somma di due integrali sul volume, uno con la divergenza di $\\tens T$ e uno con il prodotto scalare $\\tens T\\cdot\\tens H$. Nota che nella dimostrazione non abbiamo mai usato l'equilibrio, né un legame tra $\\tens T$ e $\\vet u$: è un'identità che vale per campi qualsiasi.

Facciamo un controllo su un caso semplice (esempio aggiunto): prendi $\\tens T=\\tens I$, l'identità, costante. Allora $\\operatorname{div}\\tens I=\\vet 0$ perché le sue componenti non variano, e $\\tens I\\cdot\\tens H=\\operatorname{tr}\\tens H=\\operatorname{div}\\vet u$. Il lemma diventa $\\int_{\\partial\\mathcal B}\\vet u\\cdot\\hat n\\,dA=\\int_{\\mathcal B}\\operatorname{div}\\vet u\\,dV$: è di nuovo il teorema della divergenza. Il lemma, quindi, ne è una generalizzazione con un tensore «in mezzo».

A che cosa servirà? Fra poco sostituiremo a $\\tens T$ un tensore in equilibrio, e i tre termini diventeranno tre lavori.`,
      },
      {
        id: 'l41-6',
        kind: 'spiega',
        title: 'I tre termini, quando T è in equilibrio',
        md: `Supponiamo ora che $\\tens T$ sia in equilibrio con le forze di volume $\\vet b$ e con le forze di superficie $\\hat{\\vet s}$, come nel capitolo 3. Allora i tre termini del lemma acquistano un significato fisico (§4.2.1):

1. $\\int_{\\partial\\mathcal B}\\tens T\\hat n\\cdot\\vet u\\,dA$ è il **lavoro delle forze di superficie**: sulla frontiera $\\tens T\\hat n=\\hat{\\vet s}$, e lo moltiplichiamo per lo spostamento dei punti in cui agisce;
2. $\\int_{\\mathcal B}\\operatorname{div}\\tens T\\cdot\\vet u\\,dV$ è, **a meno del segno**, il lavoro delle forze di volume, perché l'equilibrio dà $\\operatorname{div}\\tens T=-\\vet b$;
3. $\\int_{\\mathcal B}\\tens T\\cdot\\tens H\\,dV$ è il **lavoro di deformazione**: tensioni per i gradienti di spostamento.

Il lemma ricorda allora la conservazione dell'energia: il lavoro che l'esterno fornisce al corpo è uguale al lavoro delle forze interne.`,
      },
      {
        id: 'l41-7',
        kind: 'domanda',
        q: { id: 'l41-q2', kind: 'scelta', q: 'Che cosa serve sapere di $\\tens T$ e $\\vet u$ perché valga il lemma fondamentale?', options: ['Solo che siano campi regolari', 'Che $\\tens T$ sia in equilibrio con i carichi', 'Che $\\tens T$ sia prodotto da $\\vet u$ tramite il materiale', 'Che $\\vet u$ sia uno spostamento rigido'], correct: 0, why: `Nella dimostrazione si usano solo il trasposto, il teorema della divergenza e la derivata di un prodotto: servono campi regolari, nient'altro (Teo 4.2.1). L'equilibrio serve solo dopo, per dare un significato fisico ai termini; il legame con il materiale non entra affatto.` },
      },
      {
        id: 'l41-8',
        kind: 'spiega',
        title: 'Il primo protagonista: un sistema forze–tensioni equilibrato',
        md: `Il teorema dei lavori virtuali mette di fronte due «sistemi» definiti sullo stesso corpo, scelti in modo del tutto indipendente. Il primo è statico.

**Def 4.3.1.** Un **sistema forze–tensioni equilibrato**, abbreviato FT, è una terna $\\mathrm{FT}=\\{\\vet b,\\hat{\\vet s},\\tens T\\}$ (forze di volume, forze di superficie, tensore degli sforzi) che soddisfa tre condizioni:
- $\\operatorname{div}\\tens T+\\vet b=\\vet 0$ nei punti interni $\\mathring{\\mathcal B}$: sono le equazioni indefinite di equilibrio del capitolo 3;
- $\\tens T\\in\\mathrm{Sym}$: il tensore degli sforzi è simmetrico, altra conseguenza dell'equilibrio;
- $\\tens T\\hat n=\\hat{\\vet s}$ sulla frontiera $\\partial\\mathcal B$: le tensioni sul bordo bilanciano i carichi applicati.

In breve, FT è qualunque stato di forze e tensioni che rispetti l'equilibrio. Non ci chiediamo da dove venga.`,
      },
      {
        id: 'l41-9',
        kind: 'spiega',
        title: 'Il secondo protagonista: un sistema spostamenti–deformazioni congruente',
        md: `Il secondo sistema è cinematico.

**Def 4.3.2.** Un **sistema spostamenti–deformazioni congruente**, o **virtuale**, abbreviato SD, è una coppia $\\mathrm{SD}=\\{\\vet u,\\tens E\\}$ in cui $\\vet u$ è uno spostamento ammissibile e infinitesimo e $\\tens E=\\frac12(\\nabla\\vet u+\\nabla\\vet u^T)$ è la deformazione che gli corrisponde. Tre parole vanno capite bene:
- **virtuale** vuol dire ipotetico: lo spostamento non avviene davvero nel tempo, è uno spostamento «di prova» con cui si saggia l'equilibrio di FT;
- **cinematicamente ammissibile** vuol dire che rispetta i vincoli e genera deformazioni congruenti;
- **congruenti** vuol dire ottenibili da uno spostamento continuo e derivabile.

Con i due sistemi si definiscono due lavori (**Def 4.3.3**): il **lavoro virtuale esterno** $L_v^{EST}=\\int_{\\mathcal B}\\vet b\\cdot\\vet u\\,dV+\\int_{\\partial\\mathcal B}\\hat{\\vet s}\\cdot\\vet u\\,dA$, fatto dai carichi di FT per gli spostamenti di SD, e il **lavoro virtuale interno** $L_v^{INT}=\\int_{\\mathcal B}\\tens T\\cdot\\tens E\\,dV$, fatto dalle tensioni di FT per le deformazioni di SD.`,
      },
      {
        id: 'l41-10',
        kind: 'domanda',
        q: { id: 'l41-q1', kind: 'scelta', q: 'Che cosa serve al sistema SD per poter applicare il TLV?', options: ['Essere congruente: $\\vet u$ ammissibile e infinitesimo, $\\tens E=\\operatorname{sym}\\nabla\\vet u$', 'Essere causato dalle tensioni di FT', 'Avere $\\tens E$ definito positivo', 'Essere rigido'], correct: 0, why: `La Def 4.3.2 chiede solo la congruenza. L'errore più comune è pensare che SD debba essere «prodotto» da FT: non è così, i due sistemi sono indipendenti. Uno spostamento rigido è ammesso, ma è un caso particolare, non un requisito.` },
      },
      {
        id: 'l41-11',
        kind: 'derivazione',
        title: 'Teorema dei lavori virtuali',
        md: `**Dove vogliamo arrivare:** $L_v^{EST}=L_v^{INT}$ per **ogni** FT equilibrato e **ogni** SD congruente (Teo 4.3.4). **L'idea:** il lemma vale per campi qualsiasi, quindi anche per la $\\tens T$ di FT e la $\\vet u$ di SD; poi si usano, una alla volta, le tre condizioni di FT per riconoscere nei suoi termini i carichi e per passare da $\\tens H$ a $\\tens E$. È una catena di passaggi logici, senza numeri da verificare.`,
        source: D(4, '4.3.2', 'Teo 4.3.4', '68–69'),
        der: {
          lines: [
            { tex: '\\int_{\\partial\\mathcal B}\\tens T\\hat n\\cdot\\vet u\\,dA=\\int_{\\mathcal B}\\operatorname{div}\\tens T\\cdot\\vet u\\,dV+\\int_{\\mathcal B}\\tens T\\cdot\\tens H\\,dV', why: `Partiamo dal lemma fondamentale, scritto per la $\\tens T$ del sistema FT e la $\\vet u$ del sistema SD. Possiamo farlo perché il lemma non chiede nessun legame tra i due campi.` },
            {
              tex: '\\int_{\\partial\\mathcal B}\\hat{\\vet s}\\cdot\\vet u\\,dA=\\int_{\\mathcal B}\\operatorname{div}\\tens T\\cdot\\vet u\\,dV+\\int_{\\mathcal B}\\tens T\\cdot\\tens H\\,dV',
              why: `A sinistra usiamo la terza condizione di FT: sulla frontiera $\\tens T\\hat n=\\hat{\\vet s}$. Il primo membro è diventato il lavoro delle forze di superficie.`,
              aggiunto: true,
            },
            {
              tex: '\\int_{\\partial\\mathcal B}\\hat{\\vet s}\\cdot\\vet u\\,dA=-\\int_{\\mathcal B}\\vet b\\cdot\\vet u\\,dV+\\int_{\\mathcal B}\\tens T\\cdot\\tens H\\,dV',
              why: `Nel primo integrale di volume usiamo la prima condizione di FT: nell'interno $\\operatorname{div}\\tens T+\\vet b=\\vet 0$, cioè $\\operatorname{div}\\tens T=-\\vet b$. Ecco comparire, con il segno meno, il lavoro delle forze di volume.`,
              aggiunto: true,
            },
            {
              tex: '\\tens T\\cdot\\tens H=\\tens T\\cdot(\\tens E+\\tens W)=\\tens T\\cdot\\tens E+\\tens T\\cdot\\tens W',
              why: `Ora guardiamo l'integranda del lavoro di deformazione. Dal capitolo 2, il gradiente di spostamento si scompone in parte simmetrica e antisimmetrica, $\\tens H=\\tens E+\\tens W$, con $\\tens W$ rotazione rigida infinitesima; il prodotto scalare è lineare, quindi si distribuisce sulla somma.`,
              aggiunto: true,
            },
            {
              tex: '\\tens T\\cdot\\tens W=0\\ \\Rightarrow\\ \\tens T\\cdot\\tens H=\\tens T\\cdot\\tens E',
              why: `Usiamo la seconda condizione di FT: $\\tens T$ è simmetrico. Un tensore simmetrico e uno antisimmetrico sono ortogonali, $\\mathrm{Sym}\\perp\\mathrm{Skw}$ (Prop 1.6.3), quindi $\\tens T\\cdot\\tens W=0$ e resta solo $\\tens T\\cdot\\tens E$.`,
              ask: { q: 'Perché sparisce $\\tens T\\cdot\\tens W$?', options: ['Perché $\\tens T$ è simmetrico e Sym è ortogonale a Skw', 'Perché $\\tens W$ è nullo', 'Perché $\\vet u$ è infinitesimo', 'Per il teorema della divergenza'], correct: 0, why: `Prop 1.6.3: il prodotto scalare tra un simmetrico e un antisimmetrico è sempre zero. $\\tens W$ in generale non è nullo (il corpo può ruotare), e l'ipotesi di spostamenti infinitesimi serve a usare $\\tens E$, non a cancellare $\\tens W$; il teorema della divergenza è già stato usato nel lemma.` },
            },
            {
              tex: '\\int_{\\partial\\mathcal B}\\hat{\\vet s}\\cdot\\vet u\\,dA=-\\int_{\\mathcal B}\\vet b\\cdot\\vet u\\,dV+\\int_{\\mathcal B}\\tens T\\cdot\\tens E\\,dV',
              why: `Sostituiamo $\\tens T\\cdot\\tens E$ al posto di $\\tens T\\cdot\\tens H$ nell'ultimo integrale. Ora l'ultimo termine è il lavoro virtuale interno della Def 4.3.3. È la riga che la dispensa scrive dopo «Sostituendo».`,
            },
            { tex: '\\int_{\\partial\\mathcal B}\\hat{\\vet s}\\cdot\\vet u\\,dA+\\int_{\\mathcal B}\\vet b\\cdot\\vet u\\,dV=\\int_{\\mathcal B}\\tens T\\cdot\\tens E\\,dV', why: `Portiamo a sinistra il lavoro delle forze di volume. A sinistra c'è $L_v^{EST}$, a destra $L_v^{INT}$: il teorema è dimostrato, per qualsiasi FT equilibrato e SD congruente.`, eq: 'Teo 4.3.4' },
          ],
        },
      },
      {
        id: 'l41-12',
        kind: 'spiega',
        title: 'Leggiamo il teorema, e proviamolo su una barra',
        md: `A parole: se scegli un qualunque stato di forze e tensioni in equilibrio e, indipendentemente, un qualunque spostamento compatibile con i vincoli, il lavoro che i carichi farebbero per quello spostamento è uguale al lavoro che le tensioni farebbero per la deformazione corrispondente. Siccome la dimostrazione usa solo l'equilibrio di FT e la congruenza di SD, il teorema è un'**identità**: vale a priori, senza esperimenti.

Proviamolo su un caso semplice (esempio aggiunto). Una barra di lunghezza $L$ e sezione $A$ è tirata da una forza $N$ alle estremità, senza forze di volume: come sistema FT prendiamo la tensione uniforme $\\sigma=N/A$ lungo l'asse. Come sistema SD prendiamo un allungamento uniforme qualsiasi $\\bar\\varepsilon$, con l'estremo sinistro fermo, così l'estremo destro si sposta di $\\bar\\varepsilon L$. Lavoro esterno: $N\\,\\bar\\varepsilon L$. Lavoro interno: $\\sigma\\,\\bar\\varepsilon$ per il volume $AL$, cioè $(N/A)\\,\\bar\\varepsilon\\,AL=N\\bar\\varepsilon L$. Coincidono, e nota che $\\bar\\varepsilon$ era arbitrario: nessun legame con $N$.`,
      },
      {
        id: 'l41-13',
        kind: 'domanda',
        q: { id: 'l41-q3', kind: 'vf', q: 'Se il tensore $\\tens T$ di FT non fosse simmetrico, nella dimostrazione del TLV si potrebbe comunque sostituire $\\tens T\\cdot\\tens H$ con $\\tens T\\cdot\\tens E$.', answer: false, why: `La sostituzione regge solo perché $\\tens T\\cdot\\tens W=0$, e questo vale proprio perché $\\tens T$ è simmetrico (Sym ⊥ Skw). Con un $\\tens T$ non simmetrico la sua parte antisimmetrica farebbe lavoro con $\\tens W$. Ecco perché la simmetria è una delle tre condizioni di FT (Def 4.3.1).` },
      },
      {
        id: 'l41-14',
        kind: 'spiega',
        title: 'Corpo rigido, causalità, dimensioni',
        md: `La dispensa accompagna il teorema con alcune osservazioni (§4.3.3), che all'orale vengono chieste. Le prime tre.

1. **Corpo rigido.** La rigidità è un vincolo costitutivo: un corpo rigido ammette solo spostamenti rigidi, per i quali $\\tens E=\\tens O$. Allora il lavoro interno è nullo e il teorema dice $L_v^{EST}=0$: $\\int_{\\partial\\mathcal B}\\hat{\\vet s}\\cdot\\vet u\\,dA+\\int_{\\mathcal B}\\vet b\\cdot\\vet u\\,dV=0$ per ogni spostamento rigido.
2. **Nessuna causalità.** Il teorema vale per una coppia FT–SD qualsiasi, anche del tutto scollegata. Se poi prendi la coppia «vera», cioè le tensioni e le deformazioni che il corpo ha davvero, vale ugualmente: è solo un caso particolare.
3. **Dimensioni.** Le tensioni sono forze su superfici, $[\\tens T]=[F][L^{-2}]$; $\\tens E$ è adimensionale; il volume è $[L^3]$. Il prodotto è $[F][L]$: un lavoro, come deve essere.`,
      },
      {
        id: 'l41-15',
        kind: 'spiega',
        title: 'Il triangolo, e la domanda «principio o teorema?»',
        md: `Le ultime due osservazioni (§4.3.3) guardano al teorema dall'alto.

4. **Identità triangolare.** Equilibrio, congruenza e TLV sono come i tre vertici di un triangolo: ne bastano due per avere il terzo. Noi abbiamo usato equilibrio e congruenza per ottenere il TLV; si può anche partire da congruenza e TLV e ricavare l'equilibrio.
5. **Principio o teorema?** Dipende da che cosa si assume come punto di partenza. Se l'equilibrio è introdotto come assioma, con gli assiomi di Eulero e il modello di Cauchy del capitolo 3, e la congruenza è definita in modo rigoroso, allora il TLV si **dimostra**: è un **teorema**. È l'impostazione della dispensa, e delle scuole italiana e statunitense. La scuola francese fa il contrario: assume come assioma l'identità dei lavori virtuali, che chiama **principio**, e ne ricava l'equilibrio (congruenza più principio danno l'equilibrio). L'idea ha radici antiche, nella meccanica aristotelica; il nome del teorema rimanda a Bernoulli (1725).`,
      },
      {
        id: 'l41-16',
        kind: 'domanda',
        q: { id: 'l41-q4', kind: 'scelta', q: 'Che cosa assume come assioma la scuola francese?', options: ['L\'identità dei lavori virtuali, da cui ricava l\'equilibrio', 'Gli assiomi di Eulero, da cui ricava il TLV', 'Il legame costitutivo, da cui ricava la congruenza', 'La rigidità del corpo'], correct: 0, why: `La scuola francese parte dal principio dei lavori virtuali e, insieme alla congruenza, ne deduce l'equilibrio. Partire dagli assiomi di Eulero e dimostrare il TLV è invece l'impostazione della dispensa (§4.3.3, oss. 5). Il legame costitutivo non c'entra: il TLV ne è indipendente.` },
      },
      {
        id: 'l41-17',
        kind: 'spiega',
        title: 'Attenzione a…',
        md: `Tre errori ricorrono su questo argomento.

1. **Pensare che FT e SD debbano essere legati**, cioè che le deformazioni di SD siano quelle prodotte dalle tensioni di FT. È tentante perché nella realtà forze e deformazioni vanno insieme; ma il teorema non lo chiede, e proprio per questo è così utile: vale per qualsiasi coppia, purché FT sia equilibrato e SD congruente.
2. **Non saper dire perché nel lavoro interno compare $\\tens E$ e non $\\tens H$.** La risposta è una riga: $\\tens H=\\tens E+\\tens W$ e $\\tens T\\cdot\\tens W=0$ perché $\\tens T$ è simmetrico e Sym è ortogonale a Skw.
3. **Confondere «principio» e «teorema».** Non è una questione di nomi: dipende da che cosa si assume come assioma. Con l'equilibrio assunto, il TLV si dimostra; assumendo il TLV, si dimostra l'equilibrio.`,
      },
      {
        id: 'l41-18',
        kind: 'riassunto',
        md: `**Il filo della lezione.** Deformazione e tensione erano due descrizioni separate; il lavoro, che moltiplica un ente statico per uno cinematico, le mette in comunicazione senza bisogno di causalità. Il lemma fondamentale, ottenuto con il trasposto, il teorema della divergenza e la derivata di un prodotto, riscrive l'integrale di frontiera di $\\tens T\\hat n\\cdot\\vet u$ come somma di due integrali di volume, e vale per campi qualsiasi. Applicandolo a un sistema FT equilibrato e a un sistema SD congruente, le condizioni di equilibrio trasformano i termini in lavori dei carichi, e la simmetria di $\\tens T$ permette di sostituire $\\tens H$ con $\\tens E$: ne esce il teorema dei lavori virtuali, un'identità che vale a priori. La causalità arriverà con il legame costitutivo.

- Lemma fondamentale: $\\int_{\\partial\\mathcal B}\\tens T\\hat n\\cdot\\vet u\\,dA=\\int_{\\mathcal B}\\operatorname{div}\\tens T\\cdot\\vet u\\,dV+\\int_{\\mathcal B}\\tens T\\cdot\\tens H\\,dV$ (Teo 4.2.1).
- FT equilibrato: $\\operatorname{div}\\tens T+\\vet b=\\vet 0$, $\\tens T\\in\\mathrm{Sym}$, $\\tens T\\hat n=\\hat{\\vet s}$ (Def 4.3.1); SD congruente: $\\vet u$ ammissibile e infinitesimo, $\\tens E=\\frac12(\\nabla\\vet u+\\nabla\\vet u^T)$ (Def 4.3.2).
- TLV: $\\int_{\\partial\\mathcal B}\\hat{\\vet s}\\cdot\\vet u\\,dA+\\int_{\\mathcal B}\\vet b\\cdot\\vet u\\,dV=\\int_{\\mathcal B}\\tens T\\cdot\\tens E\\,dV$ (Teo 4.3.4).
- Corpo rigido: $\\tens E=\\tens O$, lavoro esterno nullo (§4.3.3).`,
        orale: ['Lemma fondamentale: enunciato, dimostrazione, significato dei termini. (dispensa, domanda 1)', 'Teorema dei lavori virtuali: FT e SD, enunciato, dimostrazione, osservazioni. (dispensa, domanda 2)'],
      },
    ],
  },
  // ================================================================== c4.2
  {
    concept: 'c4.2',
    title: 'Che cos’è un legame costitutivo',
    minutes: 24,
    source: D(4, '4.4', 'Def 4.4.1–4.4.5', '69–73'),
    visual: SVG('prove', { tab: 'tempo' }),
    steps: [
      {
        id: 'l42-1',
        kind: 'spiega',
        title: 'Dove siamo e dove andiamo',
        md: `Nella lezione precedente il teorema dei lavori virtuali ci ha dato un ponte tra forze e spostamenti, ma un ponte «neutro»: vale per qualunque coppia di sistemi, senza dire quale deformazione nasce da quale carico. Per sapere di quanto si deforma davvero un corpo serve un'informazione nuova, che non è né geometria né equilibrio: la **natura del materiale**. La sua traduzione matematica si chiama **legame costitutivo** (§4.4).

In questa lezione non scriviamo ancora il legame in tutta la sua generalità; facciamo un passo prima. Ci chiediamo: a quale scala guardiamo il materiale? Quali comportamenti diversi si osservano in laboratorio, e come si chiamano? Come si sceglie il modello giusto per un problema? Le risposte ci porteranno all'elasticità lineare, il modello che il corso studia.`,
      },
      {
        id: 'l42-2',
        kind: 'spiega',
        title: 'Perché il materiale conta: il barile sulle tre travi',
        md: `L'esempio della dispensa è questo. Prendi tre travi identiche nella forma, una di legno, una di acciaio, una di ferro, e appendi a ciascuna, con gli stessi vincoli, lo stesso barile da 100 kg. Le tre travi si deformano in modo diverso (§4.4).

Eppure, per tutte e tre, le equazioni di equilibrio del capitolo 3 sono le stesse, perché la geometria e i carichi sono gli stessi; e anche le relazioni di congruenza del capitolo 2 sono le stesse. Quello che cambia è soltanto il materiale. Ecco perché equilibrio e congruenza, da soli, non bastano a dire quanto si deforma un corpo.

Un'immagine che forse conosci (esempio aggiunto): una molla. La forza e l'allungamento sono legati da una costante, la rigidezza della molla, che dipende da com'è fatta. Il legame costitutivo è l'analogo di quella costante per un solido continuo, scritto punto per punto tra la tensione $\\tens T$ e la deformazione $\\tens E$.`,
      },
      {
        id: 'l42-3',
        kind: 'spiega',
        title: 'Guardare il materiale da lontano: la descrizione fenomenologica',
        md: `Per descrivere il materiale ci sono due strade. La **micromeccanica** guarda come le forze a livello atomico o cristallino producono la deformazione del reticolo; la **macromeccanica**, che è la strada della meccanica dei continui, osserva il comportamento del materiale «da fuori», come risposta a prove di laboratorio, e lo descrive con campi definiti in ogni punto (§4.4.1). Questa seconda descrizione si dice **fenomenologica**: si basa sui fenomeni osservati, non sui loro meccanismi interni.

Il prezzo è un'ipotesi: la materia è trattata come un **mezzo continuo**, senza vuoti e senza struttura interna. Ma la materia vera ha una struttura (grani, fibre, mattoni). Quando possiamo far finta che non ci sia? La risposta è nel prossimo passo.`,
      },
      {
        id: 'l42-4',
        kind: 'spiega',
        title: 'L’elemento di volume rappresentativo',
        md: `**Def 4.4.1.** L'**elemento di volume rappresentativo**, abbreviato RVE (dall'inglese representative volume element), è un volume che contiene così tanti costituenti microscopici da rendere statisticamente irrilevante il modo in cui sono distribuiti al suo interno.

Detto in altro modo: se prendi un pezzetto di materiale grande almeno quanto l'RVE, si comporta come qualunque altro pezzetto della stessa dimensione, e lo puoi trattare come un «punto» del continuo. La sua dimensione dipende dalla scala della struttura interna:
- per i **metalli** è dell'ordine dei millimetri (i grani cristallini sono piccoli);
- per il **legno** dei centimetri (bisogna contenere molte fibre);
- per la **muratura** dei metri (bisogna contenere molti conci e giunti di malta).

Sotto il micron, invece, il modello continuo non vale più: lì la struttura interna non si può ignorare.`,
      },
      {
        id: 'l42-5',
        kind: 'domanda',
        q: { id: 'l42-q2', kind: 'scelta', q: 'Perché l’elemento di volume rappresentativo di una muratura è di alcuni metri, mentre quello di un metallo è di millimetri?', options: ['Perché deve contenere abbastanza costituenti (conci e giunti) da rendere irrilevante la loro distribuzione', 'Perché la muratura è più pesante del metallo', 'Perché la muratura si usa solo in strutture grandi', 'Perché nei metalli il continuo non vale'], correct: 0, why: `L'RVE è definito dal numero di costituenti che deve contenere (Def 4.4.1): i conci di una muratura sono grandi, quindi ne servono molti in un volume grande. Il peso e l'uso tipico non c'entrano; e nei metalli il continuo vale benissimo sopra il millimetro.` },
      },
      {
        id: 'l42-6',
        kind: 'spiega',
        title: 'La prova che decide: trazione sul tratto utile',
        md: `Come si scopre il comportamento di un materiale? L'indagine fondamentale è la **prova di trazione** (§4.4.2). Un provino viene afferrato alle estremità dalle ganasce di una macchina e tirato con una forza $F$ crescente. Non si misura l'allungamento di tutto il provino, ma quello di un **tratto utile** di lunghezza iniziale $L_0$, scelto lontano dalle ganasce: lì lo stato di tensione è assiale e centrato, cioè semplice e noto. Si registra la curva che lega la forza $F$ all'allungamento $\\Delta L$.

Tre domande, fatte su questa prova, permettono di classificare i comportamenti:
- se scarico, la curva torna indietro sulla stessa strada?
- conta quanto tempo passa, o quanto velocemente carico?
- l'energia spesa per caricare viene restituita?

I prossimi passi danno un nome a ciascuna risposta.`,
      },
      {
        id: 'l42-7',
        kind: 'spiega',
        title: 'Elastico: tornare indietro e non dipendere dal tempo',
        md: `**Def 4.4.2.** Un materiale è **elastico** se la sua risposta è indipendente dal tempo e la deformazione è **reversibile**: scaricando, la curva di scarico coincide con quella di carico e si torna all'origine. Allora a ogni stato di tensione corrisponde uno e un solo stato di deformazione, e viceversa:
$$\\tens T=\\hat{\\tens T}(\\tens E),$$
con $\\hat{\\tens T}$ una funzione biunivoca. Leggila così: la tensione è una funzione della sola deformazione attuale.

Una precisazione importante della dispensa: vedere una curva di carico crescente e regolare **non basta** per dire che il materiale è elastico. Bisogna verificare due cose in più: che allo scarico si torni davvero indietro sulla stessa curva, e che la risposta non dipenda dal tempo.`,
      },
      {
        id: 'l42-8',
        kind: 'spiega',
        title: 'Elastico lineare: la legge di Hooke',
        md: `Tra i materiali elastici, i più semplici sono quelli in cui la funzione $\\hat{\\tens T}$ è **lineare**: raddoppiando la deformazione raddoppia la tensione.

**Def 4.4.3.** Un materiale è **elastico lineare** se vale la legge di Hooke, che la dispensa cita nella forma latina originale «ut tensio sic vis» («come l'allungamento, così la forza»):
$$\\tens T=\\mathbb A\\tens E.$$

Il simbolo $\\mathbb A$ è il **tensore elastico**, un tensore del IV ordine. Ricorda dal Modulo 1 che cosa vuol dire: un tensore del IV ordine è una macchina lineare che riceve un tensore del II ordine (qui la deformazione $\\tens E$) e restituisce un altro tensore del II ordine (qui la tensione $\\tens T$). È l'analogo, nel continuo, della rigidezza della molla. Lo studieremo a fondo nella lezione sul tensore elastico (§4.8).`,
      },
      {
        id: 'l42-9',
        kind: 'spiega',
        title: 'Iperelastico: restituire anche l’energia',
        md: `La reversibilità della Def 4.4.2 è **meccanica**: la curva torna indietro. Si può chiedere di più.

**Def 4.4.4.** Un materiale è **iperelastico** se, oltre alla reversibilità meccanica, ha anche la reversibilità **termodinamica**: l'energia spesa per deformarlo viene interamente restituita allo scarico, senza perdite.

Nella modellazione standard i materiali si assumono quasi sempre iperelastici: a rigore la reversibilità termodinamica non esiste, ma nei materiali da costruzione la dissipazione è molto bassa. La differenza tra elastico e iperelastico sembra sottile, ma avrà conseguenze precise sul tensore elastico: lo vedremo nella lezione sull'energia specifica, dove scopriremo che l'iperelasticità riduce il numero di costanti da misurare.`,
      },
      {
        id: 'l42-10',
        kind: 'domanda',
        q: { id: 'l42-q3', kind: 'vf', q: 'Se la curva di carico di un provino è crescente e regolare, il materiale è elastico.', answer: false, why: `La forma della curva di carico da sola non dice nulla sulla reversibilità. Per l'elasticità bisogna verificare che allo scarico si ripercorra la stessa curva e che la risposta non dipenda dal tempo (§4.4.2). Un acciaio che snerva ha una curva di carico crescente, ma scaricando resta deformato.` },
      },
      {
        id: 'l42-11',
        kind: 'spiega',
        title: 'Elasto-plastico: una parte della deformazione resta',
        md: `Che cosa succede se, scaricando, la curva **non** torna all'origine?

**Def 4.4.5.** Un materiale è **elasto-plastico** se la sua risposta è indipendente dal tempo ma la deformazione è irreversibile: allo scarico rientra solo una parte dell'allungamento, la parte **elastica** $\\Delta L_e$, mentre un'altra parte, quella **plastica**, persiste come allungamento residuo $\\Delta L_{res}$. Se allo scarico non rientra nulla, il comportamento si dice **plastico**: l'allungamento massimo raggiunto resta tutto, $\\Delta L_{\\max}=\\Delta L_{res}$.

Guarda la figura di p. 71: nelle curve $F$–$\\Delta L$ lo scarico non torna all'origine e si ferma su $\\Delta L_{res}$; nel caso plastico $\\Delta L_{\\max}=\\Delta L_{res}$. Nota che qui il tempo continua a non contare: conta la storia di carico, non quanto velocemente la si percorre (deduzione).`,
      },
      {
        id: 'l42-12',
        kind: 'spiega',
        title: 'Viscoso: quando conta il tempo',
        md: `L'ultima famiglia è quella in cui il tempo entra in gioco. Un materiale **viscoso** o **viscoelastico** ha una risposta che evolve nel tempo, a causa di una dissipazione interna (§4.4.2). Ci sono due prove tipiche, che è facile confondere: tienile distinte guardando che cosa si **impone**.

- **Creep** (scorrimento viscoso): si impone una **forza** costante, e la deformazione **cresce** nel tempo. Esempi della dispensa: un cavo polimerico che si allunga sotto un peso, il calcestruzzo sotto carichi permanenti.
- **Rilassamento**: si impone una **deformazione** costante, e la tensione **cala** nel tempo. Esempio: le corde di una chitarra, tese a lunghezza fissa, che col tempo si allentano e si scordano.`,
      },
      {
        id: 'l42-13',
        kind: 'prova',
        title: 'Creep e rilassamento a confronto',
        md: 'Il diagramma mostra le due prove con il tempo in ascissa, come nella figura di p. 72. Per ciascuna guarda prima la grandezza tenuta costante, poi quella che cambia.',
        tasks: ['In alto (creep): la forza $F(t)$ è costante; osserva che l’allungamento $\\Delta L(t)$ continua a crescere anche senza aumentare il carico.', 'In basso (rilassamento): l’allungamento è tenuto costante; osserva che la forza necessaria per mantenerlo diminuisce nel tempo.', 'Nota la simmetria: in entrambe le prove una grandezza è imposta e l’altra «si rilassa» perché il materiale dissipa.'],
        visual: SVG('prove', { tab: 'tempo' }),
      },
      {
        id: 'l42-14',
        kind: 'domanda',
        q: { id: 'l42-q1', kind: 'scelta', q: 'Scaricando un provino resta una deformazione permanente, ma la risposta non dipende dal tempo. Il comportamento è…', options: ['elasto-plastico', 'viscoso', 'iperelastico', 'elastico lineare'], correct: 0, why: `Deformazione residua senza dipendenza dal tempo è la Def 4.4.5. «Viscoso» richiederebbe proprio una dipendenza dal tempo; «iperelastico» ed «elastico lineare» sono entrambi reversibili, quindi senza deformazione residua.` },
      },
      {
        id: 'l42-15',
        kind: 'spiega',
        title: 'Quale modello scegliere',
        md: `Abbiamo una famiglia di modelli; quale si usa? La dispensa è netta: **non esiste un modello universale** (§4.4.3). Si sceglie il più semplice che sia ancora **descrittivo** (riproduce ciò che si osserva) e **predittivo** (permette di prevedere ciò che non si è misurato), e la scelta dipende soprattutto dal campo di sollecitazioni in cui l'oggetto lavora. Lo stesso materiale, in condizioni diverse, richiede modelli diversi:
- la carrozzeria di un'auto sotto i carichi d'esercizio non deve deformarsi in modo permanente: modello **elastico**;
- la stessa carrozzeria in un urto deve assorbire energia, ed è utile che si plasticizzi: modello **elasto-plastico**;
- ad alte temperature serve un modello **viscoso**; se tutto si combina, **elasto-plasto-viscoso**.

Il corso studia l'**elasticità lineare**: porta a formulazioni risolvibili, e copre la maggior parte dei problemi di progetto. La plasticità è meno usata dal meccanico; la viscosità serve, per esempio, per gli pneumatici.`,
      },
      {
        id: 'l42-16',
        kind: 'spiega',
        title: 'Attenzione a…',
        md: `Tre errori tipici su questo argomento.

1. **Dire «elastico» guardando solo la curva di carico.** È tentante perché la curva è la cosa che si vede per prima; ma l'elasticità è una proprietà dello scarico e del tempo: bisogna verificare che si torni indietro sulla stessa curva e che il tempo non conti.
2. **Scambiare creep e rilassamento.** Il trucco è chiedersi che cosa è imposto: nel creep la forza (e cresce la deformazione), nel rilassamento la deformazione (e cala la forza).
3. **Credere che il modello dipenda solo dal materiale.** Dipende anche dal campo di sollecitazioni e dalle condizioni d'uso: la stessa lamiera è elastica in esercizio ed elasto-plastica in un urto.`,
      },
      {
        id: 'l42-17',
        kind: 'riassunto',
        md: `**Il filo della lezione.** Equilibrio e congruenza non distinguono un legno da un acciaio: per sapere quanto si deforma un corpo serve il legame costitutivo, l'espressione matematica della natura del materiale. La meccanica dei continui lo descrive in modo fenomenologico, guardando il materiale a una scala abbastanza grande, quella dell'elemento di volume rappresentativo. La prova di trazione, con carico, scarico e tempo, permette di classificare i comportamenti: elastico (reversibile e indipendente dal tempo), elastico lineare (legge di Hooke), iperelastico (restituisce anche l'energia), elasto-plastico (lascia una deformazione residua), viscoso (dipende dal tempo, con creep e rilassamento). Tra questi si sceglie il modello più semplice adatto alle condizioni d'uso; il corso studia l'elasticità lineare.

- Elastico: $\\tens T=\\hat{\\tens T}(\\tens E)$, biunivoca (Def 4.4.2).
- Elastico lineare: $\\tens T=\\mathbb A\\tens E$, legge di Hooke generalizzata (Def 4.4.3).
- RVE (Def 4.4.1); iperelastico (Def 4.4.4); elasto-plastico (Def 4.4.5).`,
        orale: ['Perché serve il legame costitutivo; descrizione fenomenologica e RVE. (dispensa, domanda 3)', 'Classificazione dei comportamenti: elastico, elastico lineare, iperelastico, elasto-plastico, viscoso; scelta del modello. (dispensa, domanda 4)'],
      },
    ],
  },
  // ================================================================== c4.3
  {
    concept: 'c4.3',
    title: 'In laboratorio: acciaio e calcestruzzo',
    minutes: 30,
    source: D(4, '4.5–4.7', undefined, '73–77'),
    visual: SVG('prove', { tab: 'acciaio' }),
    steps: [
      {
        id: 'l43-1',
        kind: 'spiega',
        title: 'Dove siamo e dove andiamo',
        md: `Nella lezione precedente abbiamo classificato i comportamenti dei materiali in astratto: elastico, plastico, viscoso. Ora entriamo davvero in laboratorio e guardiamo due prove reali, quelle che la dispensa descrive in dettaglio: la **trazione su un acciaio** e la **compressione su un calcestruzzo**.

Queste prove servono a tre cose. Mostrano che un materiale vero attraversa più comportamenti, uno dopo l'altro, al crescere del carico. Fanno nascere la prima costante elastica, il modulo di Young $E$. E spiegano due modi molto diversi di rompersi: quello **duttile** dell'acciaio e quello **fragile** del calcestruzzo.

Le tappe: i quattro tratti della curva dell'acciaio; due fenomeni visibili a occhio, le linee di Lüders e la strizione; il passaggio dalla curva forza–allungamento a quella tensione–deformazione; il calcestruzzo e il softening; infine due aspetti generali, trazione contro compressione e dipendenza dalla direzione.`,
      },
      {
        id: 'l43-2',
        kind: 'spiega',
        title: 'Il tratto elastico: fino a Fp e poi fino a Fy',
        md: `Un provino d'acciaio di sezione iniziale $A_0$ viene tirato; si registra la forza $F$ e l'allungamento $\\Delta L$ del tratto utile $L_0$, lontano dalle ganasce, dove la trazione è centrata (§4.5). La figura di p. 73, riprodotta nel diagramma, ha quattro tratti; cominciamo dal primo.

All'inizio la curva è una **retta**: forza e allungamento sono proporzionali. La retta arriva fino al **carico limite di proporzionalità** $F_p$. Subito dopo c'è un breve tratto ancora elastico ma non più lineare, che arriva fino al **carico di snervamento** $F_y$ (la $y$ viene dall'inglese yielding, cedimento). In tutto questo primo tratto, se scarichi, torni all'origine: il comportamento è elastico, come nella Def 4.4.2.`,
      },
      {
        id: 'l43-3',
        kind: 'spiega',
        title: 'Lo snervamento: il materiale cede a carico costante',
        md: `Raggiunto $F_y$, il comportamento cambia bruscamente. Con qualche oscillazione, il provino continua ad allungarsi **senza che la forza aumenti**. Sembra che il materiale abbia perso rigidezza, dove per rigidezza si intende il carico necessario per ottenere un allungamento unitario.

Se ora scarichi, la curva non torna all'origine: scende parallela al tratto elastico e lascia una **deformazione residua**: la dispensa dice che qui il materiale si comporta secondo il modello plastico della lezione sui legami costitutivi (§4.5). E c'è un effetto di memoria: se hai caricato fino a una forza $F_x$ maggiore di $F_y$, hai scaricato e poi ricarichi, il provino si comporta elasticamente fino a $F_x$ e ricomincia a snervare solo lì. Il materiale «ricorda» il carico massimo raggiunto.`,
      },
      {
        id: 'l43-4',
        kind: 'spiega',
        title: 'Incrudimento e rottura',
        md: `Dopo lo snervamento il materiale si riprende: torna a equilibrare **incrementi** di carico, anche se con una rigidezza più bassa di quella iniziale. Questo tratto si chiama **incrudimento**.

La curva sale fino a un picco, il **carico limite a rottura** $F_t$. Dopo il picco la forza registrata cade ripidamente, fino a che il provino si separa in due tronconi.

Ricapitolando i quattro tratti: elastico (fino a $F_y$), snervamento (deformazione a carico circa costante), incrudimento (fino a $F_t$), rottura. Prima di andare avanti, prova a vederli sul modello.`,
      },
      {
        id: 'l43-5',
        kind: 'prova',
        title: 'Carica e scarica',
        md: 'Il cursore sceglie il punto da cui si scarica; la retta di scarico scende con la pendenza del tratto elastico iniziale.',
        tasks: ['Scarica dal tratto elastico (ΔL < 1): la retta torna all’origine, nessun allungamento residuo. È il comportamento elastico.', 'Scarica dallo snervamento o dall’incrudimento: la retta è parallela al tratto iniziale ma arriva a un allungamento residuo. Nota che la parte recuperata è quella elastica.', 'Accendi la curva «reale»: con la sezione vera la tensione continua a crescere fino alla rottura (hardening). Ne parliamo tra poco.'],
        visual: SVG('prove', { tab: 'acciaio', scarico: 8 }),
      },
      {
        id: 'l43-6',
        kind: 'domanda',
        q: { id: 'l43-q2', kind: 'scelta', q: 'Carichi un provino d’acciaio fino a una forza $F_x$ maggiore di $F_y$, scarichi e ricarichi. A quale forza ricomincia a snervare?', options: ['A $F_x$, il carico massimo raggiunto prima', 'Di nuovo a $F_y$', 'A $F_p$, il limite di proporzionalità', 'Subito, appena ricomincia il carico'], correct: 0, why: `Il materiale ha memoria (§4.5): ricaricando si comporta elasticamente fino al carico massimo già raggiunto, $F_x$, e solo lì riprende a snervare. Rispondere $F_y$ vuol dire dimenticare che lo snervamento precedente ha cambiato il materiale.` },
      },
      {
        id: 'l43-7',
        kind: 'spiega',
        title: 'Le linee di Lüders: perché a 45 gradi',
        md: `Durante lo snervamento succede una cosa che si vede a occhio (§4.5.1). Se prima della prova si ricopre il provino con una **vernice screpolante**, allo snervamento la vernice non si crepa né in orizzontale né lungo l'asse, ma lungo una famiglia di linee inclinate di **45°** rispetto alla trazione: le **linee di Lüders**.

Perché proprio 45°? La risposta viene dal cerchio di Mohr del capitolo 3. In trazione semplice, con tensione $\\sigma$ lungo l'asse, il cerchio passa per $0$ e per $\\sigma$, ha raggio $\\sigma/2$, e la tensione tangenziale massima $\\tau_{\\max}=\\sigma/2$ agisce sulle giaciture inclinate di 45°. Quando questa tangenziale supera un certo limite, nel materiale avvengono micro-scorrimenti lungo quelle giaciture; e la somma di tanti piccoli scorrimenti obliqui produce un allungamento longitudinale del provino. Lo snervamento, dunque, è guidato dalle tensioni tangenziali.`,
      },
      {
        id: 'l43-8',
        kind: 'domanda',
        q: { id: 'l43-q3', kind: 'scelta', q: 'Perché le linee di Lüders sono inclinate di 45° rispetto alla trazione?', options: ['Perché a 45° agisce la tensione tangenziale massima', 'Perché a 45° la tensione normale è massima', 'Per la forma delle ganasce', 'Per la strizione'], correct: 0, why: `Nel cerchio di Mohr della trazione semplice la tangenziale massima, $\\sigma/2$, sta sulle giaciture a 45° (§4.5.1). La tensione normale massima è invece sulla giacitura ortogonale all'asse, a 0°; le ganasce sono lontane dal tratto utile; la strizione arriva molto dopo, vicino alla rottura.` },
      },
      {
        id: 'l43-9',
        kind: 'spiega',
        title: 'La strizione: la deformazione si localizza',
        md: `Vicino al carico di rottura compare un secondo fenomeno visibile (§4.5.2). Il materiale reale non è perfettamente uniforme: contiene piccole **inclusioni** che lo indeboliscono localmente. Vicino alla rottura alcuni tratti del provino cominciano a deformarsi molto più degli altri: è la **localizzazione della deformazione**.

Nella zona più debole la sezione si restringe visibilmente e si forma un **collo** (in inglese necking, da neck): è lì che avverrà la rottura. Dove si formerà il collo non è prevedibile a priori, perché dipende da dove stanno le inclusioni.

Una conseguenza pratica: un estensimetro, lo strumento che misura l'allungamento fra due punti, se è montato lontano dal collo non si accorge di nulla. Una tecnica come la **correlazione di immagini digitali** (DIC, Digital Image Correlation), che fotografa tutta la superficie, invece la vede.`,
      },
      {
        id: 'l43-10',
        kind: 'spiega',
        title: 'Da forza e allungamento a tensione e deformazione',
        md: `La curva $F$–$\\Delta L$ dipende dalle dimensioni del provino: un provino più grosso porta più forza. Per avere una proprietà del **materiale** bisogna dividere per le dimensioni (§4.5.3). Con un'idealizzazione, cioè supponendo il carico distribuito in modo uniforme sul tratto utile, si definiscono
$$\\sigma=\\frac F{A_0},\\qquad\\varepsilon=\\frac{\\Delta L}{L_0}:$$
la tensione è la forza divisa per l'area **iniziale** $A_0$, la deformazione è l'allungamento diviso per la lunghezza iniziale $L_0$. I carichi caratteristici diventano tensioni: $\\sigma_p$, $\\sigma_y$, $\\sigma_t$.

Nel tratto lineare vale allora la legge di Hooke in una dimensione,
$$\\sigma=E\\,\\varepsilon,$$
dove la costante $E$, la pendenza della retta, è il **modulo di Young**. Per gli acciai $E\\simeq205\\,000$ MPa, cioè 205 GPa. Attenzione: negli appunti originali compare «205 000 GPa», ma è un refuso di unità; il valore corretto è in MPa (§4.5.3).`,
      },
      {
        id: 'l43-11',
        kind: 'spiega',
        title: 'La curva della norma non è la curva reale',
        md: `Il diagramma $\\sigma$–$\\varepsilon$ appena costruito ha due approssimazioni nascoste (§4.5.3). La prima: la sezione **si riduce** durante la prova, quindi la tensione vera $\\sigma_R=F/A$, con l'area attuale $A$, è maggiore di $F/A_0$. La seconda: $\\Delta L/L_0$ è una deformazione **media** sul tratto utile, che ignora la localizzazione nel collo.

Se si corregge per entrambe, la curva reale cambia aspetto: la tensione **cresce sempre**, fino alla rottura. Questo si chiama **hardening** (indurimento); l'acciaio non presenta softening (§4.5.3). Il ramo che scende dopo il picco nella curva della norma è quindi un effetto dell'aver diviso per $A_0$ e di aver usato una deformazione media (deduzione). La figura di p. 75 mostra la curva reale sopra quella della norma, con la stessa pendenza iniziale $E$.

Perché allora la norma usa $A_0$? Perché vuole una procedura **ripetibile in qualunque laboratorio**, senza strumenti speciali, che fornisca parametri di confronto universali.`,
      },
      {
        id: 'l43-12',
        kind: 'domanda',
        q: { id: 'l43-q1', kind: 'vf', q: 'La curva σ–ε reale dell’acciaio mostra softening dopo il picco.', answer: false, why: `Con la sezione reale la tensione cresce sempre: hardening (§4.5.3). Il ramo discendente che si vede nella curva della norma nasce dall'aver diviso la forza per l'area iniziale $A_0$ mentre la sezione vera si restringeva (deduzione).` },
      },
      {
        id: 'l43-13',
        kind: 'spiega',
        title: 'Acciai armonici e lo snervamento convenzionale',
        md: `Non tutti gli acciai hanno lo stesso diagramma (§4.5.3). Gli acciai ad **alto tenore di carbonio**, detti armonici, hanno lo **stesso modulo di Young** $E\\simeq205\\,000$ MPa: nel tratto elastico si comportano come gli altri. Hanno però una **resistenza molto più alta** e una **duttilità** molto più bassa, cioè si deformano poco in campo plastico prima di rompersi.

In questi acciai lo snervamento non si vede: non c'è il tratto orizzontale a carico costante. Per avere comunque un valore di riferimento si usa una tensione convenzionale: quella che, scaricando, lascia un allungamento residuo dello **0,2%**.`,
      },
      {
        id: 'l43-14',
        kind: 'spiega',
        title: 'Il calcestruzzo in compressione: due modi di spingere',
        md: `Passiamo ai materiali lapidei: marmo, tufo e calcestruzzo, che è un impasto di acqua, cemento e inerti (§4.6). Si provano in **compressione**, su un provino la cui lunghezza utile è tutta l'altezza. Il risultato dipende da **come** si comanda la prova.

- A **controllo di carico** si impone la forza. L'esempio della dispensa: si versa acqua in un contenitore appoggiato sul provino, un litro alla volta, cioè un chilo alla volta. La curva è elastica non lineare fino al carico limite; lì il provino **esplode**, perché l'energia accumulata si trasforma in energia cinetica dei frammenti. Le macchine idrauliche lavorano così.
- A **controllo di deformazione** si impone l'accorciamento, per esempio con un torchio a vite, come nelle macchine elettromeccaniche. Ora, oltre il picco, compare un **tratto discendente**: il provino continua a deformarsi portando sempre meno carico. Questo è il **softening**.`,
      },
      {
        id: 'l43-15',
        kind: 'prova',
        title: 'Calcestruzzo: carico o deformazione controllati',
        md: 'Due prove di compressione sullo stesso calcestruzzo, come nella figura di p. 76. Passa da un controllo all’altro e confronta che cosa succede dopo il picco.',
        tasks: ['A controllo di carico: la curva si interrompe al picco, il provino esplode. Nota che il ramo dopo il picco non si può osservare.', 'A controllo di deformazione: oltre il picco compare il ramo che scende, il softening.', 'Nota che il materiale è lo stesso: cambia solo ciò che la macchina impone, e quindi ciò che si riesce a vedere.'],
        visual: SVG('prove', { tab: 'calcestruzzo', controllo: 'deformazione' }),
      },
      {
        id: 'l43-16',
        kind: 'spiega',
        title: 'Softening e rottura fragile',
        md: `Perché il softening è così importante? Perché spiega come si rompono le strutture in materiale lapideo (§4.6).

Immagina, come fa la dispensa, un punto di una muratura che ha superato il picco. Continua a deformarsi, ma porta **meno** carico di prima. Il carico che non porta più non sparisce: passa ai punti vicini, che così si caricano di più, superano a loro volta il picco ed entrano in crisi, cedendo carico ad altri ancora. La crisi si propaga **a catena**, e la struttura cede senza grandi deformazioni che la preannuncino: è la **rottura fragile**.

L'acciaio, invece, ha una rottura **duttile**: prima di rompersi si deforma molto (snervamento, incrudimento, strizione), e questo è un segnale d'allarme ben visibile.`,
      },
      {
        id: 'l43-17',
        kind: 'domanda',
        q: { id: 'l43-q4', kind: 'vf', q: 'Una prova a controllo di carico sul calcestruzzo mostra il ramo di softening.', answer: false, why: `A controllo di carico il provino esplode al picco, e il ramo discendente non si vede (§4.6). Il softening si osserva solo imponendo la deformazione, perché così la macchina può «seguire» il provino mentre porta sempre meno carico.` },
      },
      {
        id: 'l43-18',
        kind: 'spiega',
        title: 'Trazione o compressione? E in che direzione?',
        md: `Due ultimi aspetti generali (§4.7).

**Trazione e compressione.** L'acciaio, materiale duttile, risponde in modo simmetrico: la curva in compressione è la stessa della trazione, cambiata di segno. Una prova di compressione sull'acciaio, però, è difficile da fare, perché il provino tende a sbandare lateralmente (instabilità per carico di punta, in inglese buckling). Il calcestruzzo invece risponde in modo molto diverso in trazione e in compressione.

**Dipendenza dalla direzione.** Si ritagliano provini in orizzontale, in verticale e in obliquo dalla stessa lastra. Per l'acciaio le tre curve sono identiche. Per un composito FRP (plastica rinforzata con fibre) con fibre a 0° e 90°, le curve orizzontale e verticale coincidono, quella obliqua è diversa. Questa osservazione tornerà nella lezione sulle simmetrie materiali.

Infine, la dispensa ricorda che esistono accoppiamenti termomeccanici, chimici, magnetici ed elettrici: qui ci limitiamo all'elasticità lineare.`,
      },
      {
        id: 'l43-19',
        kind: 'spiega',
        title: 'Attenzione a…',
        md: `Tre errori tipici su queste prove.

1. **Pensare che la curva della norma sia quella reale.** La curva con $\\sigma=F/A_0$ è una convenzione, scelta per confrontare laboratori diversi. La curva reale, con la sezione vera, mostra hardening e nessun ramo discendente.
2. **Dire che il calcestruzzo «non ha» un ramo discendente.** Ce l'ha: semplicemente, a controllo di carico non si riesce a vederlo, perché il provino esplode al picco. Lo si vede a deformazione controllata.
3. **Sbagliare le unità del modulo di Young.** Per gli acciai $E\\simeq205\\,000$ MPa $=205$ GPa; «205 000 GPa» negli appunti è un refuso.`,
      },
      {
        id: 'l43-20',
        kind: 'riassunto',
        md: `**Il filo della lezione.** La prova di trazione sull'acciaio attraversa quattro tratti: elastico (lineare fino a $F_p$, poi fino allo snervamento $F_y$), snervamento a carico costante con deformazioni residue e memoria del carico massimo, incrudimento fino a $F_t$, rottura. Allo snervamento compaiono le linee di Lüders a 45°, guidate dalla tangenziale massima; vicino alla rottura la deformazione si localizza nella strizione. Dividendo per area e lunghezza iniziali si passa al diagramma $\\sigma$–$\\varepsilon$ della norma, che dà il modulo di Young ma non è la curva reale. Il calcestruzzo in compressione, a deformazione controllata, mostra il softening, che spiega la propagazione a catena della crisi e la rottura fragile, opposta a quella duttile dell'acciaio.

- Diagramma della norma e legge di Hooke: $\\sigma=F/A_0$, $\\varepsilon=\\Delta L/L_0$, $\\sigma=E\\varepsilon$ (§4.5.3).
- Modulo di Young degli acciai: $E\\simeq205\\,000$ MPa $=205$ GPa (§4.5.3).
- Controllo di carico: esplosione al picco; controllo di deformazione: softening (§4.6).`,
        orale: ['Prova di trazione sull’acciaio: tratti, linee di Lüders, strizione, passaggio a σ–ε, perché si usa la curva della norma. (dispensa, domanda 5)', 'Prova di compressione sul calcestruzzo: controllo di carico e di deformazione, softening, rottura fragile. (dispensa, domanda 6)'],
      },
    ],
  },
  // ================================================================== c4.4
  {
    concept: 'c4.4',
    title: 'Il tensore elastico',
    minutes: 22,
    source: D(4, '4.8', 'Def 4.8.1', '77–78'),
    visual: SVG('simmetrie4', { minor1: true, minor2: true }),
    steps: [
      {
        id: 'l44-1',
        kind: 'spiega',
        title: 'Dove siamo e dove andiamo',
        md: `Nella lezione sui legami costitutivi abbiamo dato un nome al legame più semplice, quello elastico lineare, $\\tens T=\\mathbb A\\tens E$ (Def 4.4.3). Nella lezione di laboratorio l'abbiamo visto in una dimensione, nel tratto rettilineo della prova di trazione: $\\sigma=E\\varepsilon$, con una sola costante. Attenzione alle lettere: lì $E$ è un numero, il modulo di Young (§4.5); qui $\\tens E$ è il tensore di deformazione infinitesima. Ora torniamo in tre dimensioni e prendiamo sul serio quella formula.

Le domande sono tre. Che cosa vogliono dire, esattamente, le parole «elastico» e «lineare»? Quante costanti contiene il tensore elastico $\\mathbb A$, e sono davvero tutte da misurare? Che cosa succede nella configurazione da cui partiamo? Alla fine saprai spiegare perché le costanti scendono da 81 a 36, e perché una rotazione rigida non genera tensioni.`,
      },
      {
        id: 'l44-2',
        kind: 'spiega',
        title: 'Che cosa vuol dire «elastico», in un punto',
        md: `La dispensa precisa la parola **elastico** con due richieste sulla tensione nel punto $x$ (§4.8).

1. La tensione in $x$ dipende **solo** dalla deformazione **attuale** e solo da quella **in $x$**. «Attuale» vuol dire che non conta la storia: niente memoria del passato. Ricorda l'acciaio che, dopo lo snervamento, «ricordava» il carico massimo: quello non è un comportamento elastico. «In $x$» vuol dire che non contano i punti vicini: niente comportamenti non locali.
2. Nessuna dipendenza dal **tempo**: niente creep, niente rilassamento.

Insieme, queste due richieste dicono che per conoscere la tensione in un punto basta conoscere la deformazione in quel punto, adesso.`,
      },
      {
        id: 'l44-3',
        kind: 'spiega',
        title: 'Che cosa vuol dire «lineare»: due ipotesi diverse',
        md: `La parola **lineare** nasconde due ipotesi distinte, entrambe del capitolo 2 (§4.8).

1. **Piccoli spostamenti**, $|\\vet u|\\ll1$ rispetto alle dimensioni del corpo. Grazie a questa ipotesi la tensione si può riferire ai punti della configurazione di riferimento $\\mathcal B$, senza preoccuparsi di dove sono finiti dopo la deformazione: è l'equilibrio referenziale.
2. **Piccole deformazioni**, $\\|\\tens H\\|\\ll1$, con $\\tens H$ il gradiente di spostamento. Grazie a questa ipotesi si può usare come misura di deformazione il tensore infinitesimo $\\tens E$, anziché il tensore di deformazione finita.

Senza una delle due il problema diventa non lineare anche se il materiale è elastico. Per questo «elastico lineare» non è solo una proprietà del materiale: è anche un'ipotesi sulla geometria del problema (deduzione).`,
      },
      {
        id: 'l44-4',
        kind: 'domanda',
        q: { id: 'l44-q2', kind: 'scelta', q: 'Quali ipotesi stanno dietro l’aggettivo «lineare» in elasticità lineare?', options: ['Piccoli spostamenti e piccole deformazioni', 'Solo che il materiale sia elastico', 'Che il corpo sia omogeneo', 'Che la tensione non dipenda dal tempo'], correct: 0, why: `«Lineare» chiede $|\\vet u|\\ll1$ (si riferisce $\\tens T$ ai punti di $\\mathcal B$) e $\\|\\tens H\\|\\ll1$ (si usa $\\tens E$), §4.8. L'indipendenza dal tempo fa parte di «elastico», non di «lineare»; l'omogeneità è un'ulteriore ipotesi, che rende $\\mathbb A$ costante.` },
      },
      {
        id: 'l44-5',
        kind: 'spiega',
        title: 'Il tensore elastico e i suoi 81 moduli',
        md: `Con queste ipotesi la dispensa definisce il legame.

**Def 4.8.1.** La tensione $\\tens T(x)$ dipende **solo e linearmente** dalla deformazione $\\tens E(x)$ nello stesso punto: esiste un tensore $\\mathbb A$, il **tensore elastico**, tale che
$$\\tens T(x)=\\mathbb A(x)\\big[\\tens E(x)\\big].$$
Ricorda dal Modulo 1 che un tensore del IV ordine è una mappa lineare che trasforma un tensore del II ordine in un altro. $\\mathbb A$ può cambiare da punto a punto, per esempio in una roccia stratificata; se il corpo è **omogeneo**, $\\mathbb A$ è lo stesso in tutti i punti.

In componenti
$$T_{ij}=\\textstyle\\sum_{h,k}\\mathbb A_{ijhk}E_{hk}:$$
ogni componente della tensione è una combinazione di tutte le nove componenti della deformazione. Gli indici sono quattro, ciascuno da 1 a 3, quindi le componenti di $\\mathbb A$ sono $3^4=81$: si chiamano **moduli elastici**. Prima di andare in laboratorio a misurarli, conviene chiedersi se sono davvero 81 indipendenti.`,
      },
      {
        id: 'l44-6',
        kind: 'spiega',
        title: 'Prima simmetria minore: il risultato è simmetrico',
        md: `La prima riduzione viene dal capitolo 3: il tensore degli sforzi $\\tens T$ è **simmetrico**, $T_{ij}=T_{ji}$. Quindi $\\mathbb A$, qualunque deformazione riceva, deve restituire un tensore simmetrico.

Nel Modulo 1 questa proprietà ha un nome: **prima simmetria minore** (Def 1.7.4), che vuol dire proprio «$\\mathbb A\\tens A$ è simmetrico per ogni $\\tens A$». In componenti si scrive scambiando i primi due indici:
$$\\mathbb A_{ijhk}=\\mathbb A_{jihk}.$$
Leggila così: la riga che produce $T_{ij}$ e quella che produce $T_{ji}$ devono essere uguali, perché $T_{ij}$ e $T_{ji}$ sono lo stesso numero (§4.8.1).`,
      },
      {
        id: 'l44-7',
        kind: 'spiega',
        title: 'Seconda simmetria minore: conta solo la parte simmetrica',
        md: `La seconda riduzione riguarda ciò che $\\mathbb A$ riceve. Il legame è scritto con $\\tens E$, la parte simmetrica del gradiente di spostamento $\\tens H=\\tens E+\\tens W$; la parte antisimmetrica $\\tens W$, la rotazione rigida infinitesima, non deve contare.

È la **seconda simmetria minore** (Def 1.7.5): $\\mathbb A$ «vede» solo la parte simmetrica del suo argomento, il che equivale a dire che annulla ogni tensore antisimmetrico. In componenti si scambiano gli ultimi due indici:
$$\\mathbb A_{ijhk}=\\mathbb A_{ijkh},\\qquad\\mathbb A\\tens W=\\tens O\\quad\\forall\\tens W\\in\\mathrm{Skw},$$
dove $\\mathrm{Skw}$ è l'insieme dei tensori antisimmetrici.

**Per l'orale** la dispensa sottolinea il significato fisico: applicando $\\mathbb A$ a $\\tens H$ si ottiene lo stesso risultato che applicandolo a $\\tens E$. Una rototraslazione rigida infinitesima, cioè una traslazione più una piccola rotazione, **non genera tensione**: per far nascere uno sforzo serve una deformazione (§4.8.1).`,
      },
      {
        id: 'l44-8',
        kind: 'domanda',
        q: { id: 'l44-q1', kind: 'vf', q: 'La seconda simmetria minore equivale a dire che il tensore elastico annulla ogni tensore antisimmetrico.', answer: true, why: `Def 1.7.5 e §4.8.1: «vedere solo la parte simmetrica» vuol dire che la parte antisimmetrica dà contributo nullo, cioè $\\mathbb A\\tens W=\\tens O$ per ogni $\\tens W\\in\\mathrm{Skw}$. Fisicamente: una rotazione rigida infinitesima non genera tensione.` },
      },
      {
        id: 'l44-9',
        kind: 'spiega',
        title: 'Contare: da 81 a 36',
        md: `La dispensa afferma che con entrambe le simmetrie minori le componenti indipendenti passano da 81 a 36 (§4.8.1). Ecco il conto (passaggio aggiunto). La prima simmetria dice che la coppia di indici $(i,j)$ conta solo come coppia non ordinata: $(1,2)$ e $(2,1)$ sono la stessa cosa. Le coppie distinte sono allora sei: $(1,1)$, $(2,2)$, $(3,3)$, $(2,3)$, $(3,1)$, $(1,2)$. La seconda simmetria dice la stessa cosa per la coppia $(h,k)$: anche lei prende sei valori distinti.

Una componente indipendente è quindi individuata da una delle sei coppie $(ij)$ e da una delle sei coppie $(hk)$: in tutto $6\\times6=$ **36** componenti indipendenti. In pratica il tensore elastico si può pensare come una tabella 6 per 6; questa idea diventerà la notazione di Voigt nella lezione sulle simmetrie materiali (§4.11).

Nella prossima lezione una terza simmetria, la **maggiore**, ridurrà ancora il conto.`,
      },
      {
        id: 'l44-10',
        kind: 'numeri',
        title: 'Il conteggio, fatto dal motore',
        md: `Il motore dell'app conta le classi di componenti uguali, una quaterna $(i,j,h,k)$ alla volta: con le due simmetrie minori risultano **${N36}** componenti distinte; aggiungendo la simmetria maggiore (prossima lezione) **${N21}**. Nella griglia a destra ogni riga è una coppia $(ij)$ e ogni colonna una coppia $(hk)$: le caselle dello stesso colore devono valere uguale. Prova ad accendere e spegnere le simmetrie e guarda come cambia il numero.`,
        values: { minori: N36, tutte: N21 },
        visual: SVG('simmetrie4', { minor1: true, minor2: true }),
      },
      {
        id: 'l44-11',
        kind: 'domanda',
        q: { id: 'l44-q3', kind: 'scelta', q: 'Quante costanti indipendenti ha un tensore elastico con entrambe le simmetrie minori?', options: ['36', '81', '21', '9'], correct: 0, why: `Le coppie $(ij)$ e $(hk)$ prendono ciascuna 6 valori distinti: $6\\times6=36$ (§4.8.1). 81 è il conto senza simmetrie; 21 si ottiene solo aggiungendo la simmetria maggiore; 9 sono le componenti di un tensore del II ordine.` },
      },
      {
        id: 'l44-12',
        kind: 'spiega',
        title: 'La configurazione di riferimento naturale',
        md: `Resta una domanda sul punto di partenza. Nel legame $\\tens T=\\mathbb A\\tens E$ non c'è un termine costante: se $\\tens E=\\tens O$, cioè se non c'è spostamento oppure c'è solo uno spostamento rigido infinitesimo, allora la tensione è nulla. Questo, però, è un'ipotesi sul corpo, non un fatto garantito: un corpo potrebbe avere tensioni già nella configurazione di partenza (la dispensa, nel §4.9.2, fa l'esempio di un arco teso).

In elasticità lineare si assume quindi esplicitamente (§4.8.1)
$$\\tens T_0=\\tens T(\\tens E=\\tens O)=\\tens O:$$
nella configurazione di riferimento **non ci sono sforzi residui**. Una configurazione così si dice **di riferimento naturale**: «di riferimento» perché lì $\\tens E=\\tens O$, «naturale» perché non è sotto sforzo.`,
      },
      {
        id: 'l44-13',
        kind: 'spiega',
        title: 'Attenzione a…',
        md: `Tre errori tipici su questo argomento.

1. **Contare 81 costanti indipendenti.** È il numero di componenti di un tensore del IV ordine qualsiasi; ma la simmetria di $\\tens T$ e il fatto che conti solo $\\tens E$ danno le due simmetrie minori, che le riducono a 36. La simmetria maggiore, nella prossima lezione, le porterà a 21.
2. **Dimenticare l'ipotesi di configurazione naturale.** Il legame $\\tens T=\\mathbb A\\tens E$ presuppone che a deformazione nulla corrisponda tensione nulla: niente sforzi residui nel riferimento.
3. **Pensare che il legame lineare discenda dall'elasticità.** Un materiale elastico può avere una risposta non lineare; per l'elasticità lineare servono anche piccoli spostamenti e piccole deformazioni, oltre a un legame lineare.`,
      },
      {
        id: 'l44-14',
        kind: 'riassunto',
        md: `**Il filo della lezione.** «Elastico» vuol dire che la tensione in un punto dipende solo dalla deformazione attuale in quel punto, senza storia, senza effetti non locali e senza tempo; «lineare» aggiunge piccoli spostamenti e piccole deformazioni. Con queste ipotesi la tensione è una funzione lineare della deformazione nello stesso punto, tramite il tensore elastico $\\mathbb A$, che ha 81 componenti. Poiché la tensione è simmetrica e conta solo la parte simmetrica del gradiente di spostamento, $\\mathbb A$ ha le due simmetrie minori: le costanti scendono a 36 e una rototraslazione rigida non genera tensione. Infine si assume che la configurazione di riferimento sia naturale, senza sforzi residui.

- Elasticità lineare: $\\tens T(x)=\\mathbb A(x)[\\tens E(x)]$, $T_{ij}=\\sum_{h,k}\\mathbb A_{ijhk}E_{hk}$ (Def 4.8.1).
- Simmetrie minori: $\\mathbb A_{ijhk}=\\mathbb A_{jihk}=\\mathbb A_{ijkh}$, quindi 36 costanti (§4.8.1).
- Nessuna tensione dai moti rigidi: $\\mathbb A\\tens W=\\tens O$ per ogni $\\tens W\\in\\mathrm{Skw}$ (§4.8.1).
- Configurazione naturale: $\\tens T_0=\\tens T(\\tens E=\\tens O)=\\tens O$ (§4.8.1).`,
        orale: ['Elasticità lineare: ipotesi, tensore elastico, simmetrie minori (81 → 36), $\\mathbb A\\tens W=\\tens O$, configurazione naturale. (dispensa, domanda 7)'],
      },
    ],
  },
  // ================================================================== c4.5
  {
    concept: 'c4.5',
    title: 'Energia specifica e iperelasticità',
    minutes: 38,
    source: D(4, '4.9', 'Def 4.9.1, Teo 4.9.2', '79–82'),
    visual: SVG('cammino'),
    steps: [
      {
        id: 'l45-1',
        kind: 'spiega',
        title: 'Dove siamo e dove andiamo',
        md: `Nella lezione sul tensore elastico abbiamo scritto il legame elastico lineare $\\tens T=\\mathbb A\\tens E$ e ridotto le costanti del tensore elastico $\\mathbb A$ da 81 a 36. Nella lezione sui legami costitutivi avevamo anche incontrato i materiali **iperelastici**, quelli che restituiscono tutta l'energia spesa per deformarli (Def 4.4.4). Ora rendiamo precisa questa idea.

Pensa a una molla (esempio aggiunto): la tiri, spendi lavoro, e quel lavoro resta immagazzinato nella molla come energia; quando la lasci, te lo restituisce. In questa lezione costruiamo l'equivalente per un solido: l'**energia specifica di deformazione** $\\varphi$. Le tappe: la definizione; la dimostrazione che il lavoro per deformare non dipende dal percorso seguito; il significato di $\\varphi$; il teorema che, per un materiale lineare, collega l'esistenza di $\\varphi$ alla simmetria maggiore di $\\mathbb A$ (da 36 a 21 costanti) e alla formula $\\varphi=\\frac12\\mathbb A\\tens E\\cdot\\tens E$.`,
      },
      {
        id: 'l45-2',
        kind: 'spiega',
        title: 'Prima in una dimensione',
        md: `Prima dei tensori, guardiamo il caso più semplice (esempio aggiunto): una barra in trazione con legame $\\sigma=E\\varepsilon$, quello del tratto lineare della prova di laboratorio. Attenzione alle lettere: qui $E$ è un **numero**, il modulo di Young della prova di trazione (§4.5); non va confuso con il **tensore** di deformazione $\\tens E$, che useremo nel resto della lezione.

Per allungare un cubetto unitario di materiale da $\\varepsilon=0$ a un valore $\\varepsilon$, il lavoro per unità di volume è la somma dei piccoli lavori $\\sigma\\,d\\varepsilon$, cioè l'area sotto la retta $\\sigma$–$\\varepsilon$: un triangolo di base $\\varepsilon$ e altezza $E\\varepsilon$, di area $\\frac12E\\varepsilon^2$. Chiamiamo questa quantità $\\varphi(\\varepsilon)=\\frac12E\\varepsilon^2$. Nota due cose: derivandola si ritrova la tensione, $d\\varphi/d\\varepsilon=E\\varepsilon=\\sigma$; e il lavoro dipende solo dall'allungamento finale.

Tutta la lezione è la versione tensoriale di queste due osservazioni: la tensione è la derivata di un'energia, e il lavoro dipende solo dallo stato iniziale e da quello finale.`,
      },
      {
        id: 'l45-3',
        kind: 'spiega',
        title: 'La definizione: la tensione come derivata di un’energia',
        md: `**Def 4.9.1.** Nel punto $x$ il materiale è **iperelastico** se esiste una funzione $\\varphi:\\mathrm{Sym}\\to\\mathbb R$, che riceve una deformazione simmetrica e restituisce un numero, tale che
$$\\tens T=\\frac{\\partial\\varphi(\\tens E)}{\\partial\\tens E},\\qquad\\varphi(\\tens O)=0.$$
La funzione $\\varphi$ si chiama **energia specifica** (o densità) **di deformazione**. La condizione $\\varphi(\\tens O)=0$ fissa lo zero: nessuna energia senza deformazione.

Che cosa vuol dire derivare uno scalare rispetto a un tensore? Si deriva rispetto a ciascuna componente: $T_{ij}=\\partial\\varphi/\\partial E_{ij}$. Le nove derivate formano un tensore, che è la tensione. Dimensionalmente $[\\varphi]=[F][L^{-2}]$, come una tensione, cioè un'energia per unità di volume.

Due osservazioni della dispensa. L'iperelasticità si definisce indipendentemente dalla linearità: vale anche per legami non lineari. E se il materiale è anche lineare, come vedremo, $\\mathbb A$ acquista la **simmetria maggiore** e le costanti scendono da 36 a **21**.`,
      },
      {
        id: 'l45-4',
        kind: 'spiega',
        title: 'Il cammino di deformazione',
        md: `Per parlare di lavoro ci serve un modo di descrivere come il punto passa da uno stato di deformazione a un altro (§4.9.1). Un **cammino di deformazione** è una funzione $\\hat{\\tens E}(\\alpha)$, con il parametro $\\alpha$ che va da $\\alpha_1$ ad $\\alpha_2$: per ogni valore di $\\alpha$ dà una deformazione congruente, e al variare di $\\alpha$ la deformazione va dallo stato $\\tens E_1$ allo stato $\\tens E_2$. Pensa ad $\\alpha$ come a una specie di «tempo» del caricamento, che però non ha nulla di fisico.

Siccome il materiale è elastico, a ogni deformazione corrisponde una tensione: al cammino di deformazione corrisponde quindi un **cammino di tensione** $\\hat{\\tens T}(\\alpha)=\\mathbb A\\hat{\\tens E}(\\alpha)$. La figura di p. 79 li disegna uno accanto all'altro, nello spazio delle deformazioni e in quello delle tensioni.

Il **lavoro elementare** per unità di volume, quando la deformazione cambia di $d\\tens E$, è $dw=\\tens T\\cdot d\\tens E$ (§4.9.1): ha la stessa forma dell'integranda $\\tens T\\cdot\\tens E$ del lavoro interno nel teorema dei lavori virtuali, con l'incremento $d\\tens E$ al posto della deformazione virtuale (deduzione).`,
      },
      {
        id: 'l45-5',
        kind: 'domanda',
        q: { id: 'l45-q1', kind: 'scelta', q: 'In un materiale iperelastico, come si ottiene la componente $T_{ij}$ della tensione?', options: ['Derivando $\\varphi$ rispetto alla componente $E_{ij}$ della deformazione', 'Moltiplicando $\\varphi$ per $E_{ij}$', 'Integrando $\\varphi$ lungo un cammino', 'Derivando $\\varphi$ due volte rispetto a $\\tens E$'], correct: 0, why: `Per la Def 4.9.1, $T_{ij}=\\partial\\varphi/\\partial E_{ij}$. La derivata seconda di $\\varphi$ non dà la tensione ma, come vedremo, il tensore elastico; l'integrale lungo un cammino dà il lavoro, non la tensione.` },
      },
      {
        id: 'l45-6',
        kind: 'derivazione',
        title: 'Il lavoro non dipende dal cammino',
        md: `**Dove vogliamo arrivare:** mostrare che, se $\\varphi$ esiste, il lavoro per andare da $\\tens E_1$ a $\\tens E_2$ vale $\\varphi(\\tens E_2)-\\varphi(\\tens E_1)$, qualunque sia il cammino. **L'idea:** se la tensione è la derivata di $\\varphi$, l'integranda del lavoro diventa la derivata di $\\varphi$ lungo il cammino, e l'integrale di una derivata dipende solo dagli estremi. Nel campione: $\\mathbb A$ con la simmetria maggiore e un cammino curvo (parabolico) tra due stati casuali.`,
        source: D(4, '4.9.1', undefined, 80),
        der: {
          sample: (r) => { const o: R = {}; for (let k = 0; k < 81; k++) o[`A${k}`] = 2 * r() - 1; putMat(o, 'P', T.sym(T.randMat(r))); putMat(o, 'Q', T.sym(T.randMat(r))); putMat(o, 'C', T.sym(T.randMat(r))); return o; },
          lines: [
            { tex: 'w=\\int_{\\alpha_1}^{\\alpha_2}\\hat{\\tens T}(\\alpha)\\cdot\\dfrac{d\\hat{\\tens E}}{d\\alpha}\\,d\\alpha', why: `Il lavoro specifico lungo il cammino è la somma dei lavori elementari $dw=\\tens T\\cdot d\\tens E$. Scrivendo $d\\tens E=\\frac{d\\hat{\\tens E}}{d\\alpha}d\\alpha$, la somma diventa un integrale in $\\alpha$.`, val: (v) => workQuad(A81(v), mat(v, 'P'), mat(v, 'Q'), mat(v, 'C')) },
            {
              tex: '=\\int_{\\alpha_1}^{\\alpha_2}\\dfrac{\\partial\\varphi}{\\partial\\tens E}\\Big|_{\\hat{\\tens E}(\\alpha)}\\cdot\\dfrac{d\\hat{\\tens E}}{d\\alpha}\\,d\\alpha',
              why: `Usiamo l'ipotesi: il materiale è iperelastico, quindi in ogni punto del cammino la tensione è la derivata di $\\varphi$, calcolata nella deformazione $\\hat{\\tens E}(\\alpha)$ in cui ci troviamo.`,
              ask: { q: `Che cosa ci autorizza a sostituire $\\hat{\\tens T}(\\alpha)$ con una derivata di $\\varphi$?`, options: ['L\'esistenza di $\\varphi$ con $\\tens T=\\partial\\varphi/\\partial\\tens E$', 'La linearità del legame', 'La simmetria di $\\tens E$', 'Il fatto che il cammino sia rettilineo'], correct: 0, why: `È la definizione di materiale iperelastico (Def 4.9.1). La linearità non serve in questo passaggio, perché l'iperelasticità si definisce indipendentemente da essa (deduzione). La simmetria di $\\tens E$ è sempre vera e non basta; e il cammino qui è qualsiasi, anche curvo.` },
              val: (v) => workQuad(A81(v), mat(v, 'P'), mat(v, 'Q'), mat(v, 'C')),
            },
            {
              tex: '=\\int_{\\alpha_1}^{\\alpha_2}\\dfrac{d}{d\\alpha}\\varphi\\big(\\hat{\\tens E}(\\alpha)\\big)\\,d\\alpha',
              why: `Riconosciamo la regola della catena: la derivata in $\\alpha$ della funzione composta $\\varphi(\\hat{\\tens E}(\\alpha))$ è $\\sum_{ij}\\frac{\\partial\\varphi}{\\partial E_{ij}}\\frac{d\\hat E_{ij}}{d\\alpha}$, cioè proprio il prodotto scalare della riga prima. L'integranda è la derivata di una funzione: un differenziale esatto.`,
              val: (v) => workQuad(A81(v), mat(v, 'P'), mat(v, 'Q'), mat(v, 'C')),
            },
            { tex: '=\\varphi(\\tens E_2)-\\varphi(\\tens E_1)', why: `Teorema fondamentale del calcolo: l'integrale della derivata è la differenza dei valori agli estremi, $\\hat{\\tens E}(\\alpha_2)=\\tens E_2$ e $\\hat{\\tens E}(\\alpha_1)=\\tens E_1$. Tutto ciò che stava «in mezzo» al cammino è sparito.`, val: (v) => El.energy(A81(v), mat(v, 'Q')) - El.energy(A81(v), mat(v, 'P')), eq: '§4.9.1' },
          ],
        },
      },
      {
        id: 'l45-7',
        kind: 'spiega',
        title: 'Che cosa dice il risultato: un processo conservativo',
        md: `La derivazione dice due cose (§4.9.1): (a) il lavoro specifico **non dipende dal cammino**, ma solo dalla deformazione iniziale e da quella finale; (b) è uguale alla **variazione** di $\\varphi$. Un processo con queste proprietà si dice **conservativo**, come il lavoro della forza peso in fisica.

Ne segue un caso particolare importante: il **cammino chiuso**. Se parti da $\\tens E_1$, vai fino a un'altra deformazione e torni a $\\tens E_1$, il lavoro totale è $\\varphi(\\tens E_1)-\\varphi(\\tens E_1)=0$. L'energia spesa all'andata viene tutta restituita al ritorno: è la reversibilità termodinamica della Def 4.4.4, ora scritta in formule.

Controllo in una dimensione (deduzione): con $\\varphi=\\frac12E\\varepsilon^2$, dove $E$ è ancora il modulo di Young e non il tensore $\\tens E$, andare da $0$ a $\\varepsilon$ costa $\\frac12E\\varepsilon^2$, tornare da $\\varepsilon$ a $0$ restituisce $\\frac12E\\varepsilon^2$; la somma è zero.`,
      },
      {
        id: 'l45-8',
        kind: 'prova',
        title: 'Tre cammini, un solo lavoro',
        md: 'Nel piano di due stati di deformazione $\\tens E_a$ ed $\\tens E_b$ si va dall’origine O allo stato $\\tens E^*$ lungo tre strade diverse: una retta, una spezzata, un arco. Il modello calcola il lavoro su ciascuna.',
        tasks: ['Con il materiale iperelastico: osserva che i tre lavori coincidono, e coincidono con $\\frac12\\mathbb A\\tens E^*\\cdot\\tens E^*$; il lavoro sul giro chiuso è zero.', 'Passa al tensore con le sole simmetrie minori: ora i tre lavori sono diversi e il giro chiuso non dà zero. Nota che cosa vuol dire: per quel tensore non esiste nessuna $\\varphi$.', 'Tieni a mente questa differenza: è esattamente ciò che il teorema sull’energia specifica dimostrerà.'],
        visual: SVG('cammino'),
      },
      {
        id: 'l45-9',
        kind: 'domanda',
        q: { id: 'l45-q2', kind: 'vf', q: 'Per un materiale iperelastico il lavoro su un cammino chiuso di deformazione è nullo.', answer: true, why: `Il lavoro è $\\varphi(\\text{fine})-\\varphi(\\text{inizio})$ e in un cammino chiuso fine e inizio coincidono (§4.9.1). L'energia spesa viene restituita. Per un tensore con le sole simmetrie minori, come hai visto nel modello, questo non succede.` },
      },
      {
        id: 'l45-10',
        kind: 'spiega',
        title: 'Il significato assoluto di φ',
        md: `Fin qui $\\varphi$ compare solo come differenza. Che significato ha da sola (§4.9.2)? Prendi un cammino che parte dalla deformazione nulla $\\tens O$ e arriva a $\\tens E$. Il lavoro è $\\varphi(\\tens E)-\\varphi(\\tens O)=\\varphi(\\tens E)$, perché $\\varphi(\\tens O)=0$. Quindi **$\\varphi(\\tens E)$ è il lavoro specifico speso per passare dalla configurazione naturale alla deformazione $\\tens E$**.

Questo funziona perché il riferimento è naturale, senza sforzi residui. Se il riferimento fosse già deformato, come un arco teso, lì $\\varphi$ non sarebbe zero, e servirebbe una teoria più complessa.

Due ultime osservazioni della dispensa. L'energia di tutto il corpo si ottiene sommando su tutti i punti:
$$\\Phi=\\int_{\\mathcal B}\\varphi\\big(\\tens E(x)\\big)\\,dV.$$
E $\\varphi$, se esiste, è **unica**: è il lavoro per passare da $\\tens O$ a $\\tens E$, e questo lavoro non dipende dal cammino. Un altro modo di vederlo (deduzione): due funzioni con la stessa derivata differiscono per una costante, e la condizione $\\varphi(\\tens O)=0$ fissa quella costante a zero.`,
      },
      {
        id: 'l45-11',
        kind: 'spiega',
        title: 'Il teorema sull’energia specifica: l’enunciato',
        md: `Ora restringiamoci ai materiali elastici lineari, $\\tens T=\\mathbb A\\tens E$, e chiediamoci: quando esiste $\\varphi$? La risposta è un teorema di equivalenza.

**Teo 4.9.2.** Per un materiale elastico lineare sono equivalenti:
- a) esiste $\\varphi$, cioè il lavoro è nullo su ogni cammino chiuso;
- b) $\\mathbb A=\\mathbb A^T$, la **simmetria maggiore**;
- c) $\\varphi=\\frac12\\mathbb A\\tens E\\cdot\\tens E$.

Ricorda dal Modulo 1 (Def 1.7.3) che cosa vuol dire simmetria maggiore: $\\mathbb A\\tens A\\cdot\\tens B=\\mathbb A\\tens B\\cdot\\tens A$ per ogni coppia di tensori, cioè in componenti $\\mathbb A_{ijhk}=\\mathbb A_{hkij}$: si può scambiare la prima coppia di indici con la seconda. La dispensa dice che con la simmetria maggiore le costanti passano da 36 a **21**. Il conto (passaggio aggiunto): pensando $\\mathbb A$ come la tabella 6 per 6 della lezione sul tensore elastico, la simmetria maggiore rende la tabella simmetrica, e restano le 6 caselle della diagonale più le 15 sopra la diagonale, cioè 21.

La strategia della dispensa: dimostrare che a) implica b), poi che b) implica c), e infine chiudere il cerchio.`,
      },
      {
        id: 'l45-12',
        kind: 'derivazione',
        title: 'Teorema sull’energia: a ⇒ b',
        md: `**Dove vogliamo arrivare:** dall'esistenza di $\\varphi$ alla simmetria maggiore $\\mathbb A_{ijhk}=\\mathbb A_{hkij}$. **L'idea:** calcolare le derivate seconde di $\\varphi$ in due ordini diversi; ciascuna dà una componente di $\\mathbb A$, e il teorema di Schwarz dice che l'ordine non conta.`,
        source: D(4, '4.9.3', 'Teo 4.9.2', 81),
        der: {
          lines: [
            { tex: 'T_{ij}=\\dfrac{\\partial\\varphi}{\\partial E_{ij}}', why: `Ipotesi a): $\\varphi$ esiste, quindi ogni componente della tensione è la derivata di $\\varphi$ rispetto alla componente corrispondente della deformazione (Def 4.9.1).` },
            { tex: '\\dfrac{\\partial\\varphi}{\\partial E_{ij}}=\\textstyle\\sum_{h,k}\\mathbb A_{ijhk}E_{hk}', why: `Il materiale è anche lineare: la stessa componente $T_{ij}$ è data da $\\mathbb A\\tens E$ in componenti (Def 4.8.1). Uguagliando le due espressioni di $T_{ij}$ otteniamo questa riga.` },
            {
              tex: '\\dfrac{\\partial^2\\varphi}{\\partial E_{ij}\\partial E_{hk}}=\\mathbb A_{ijhk}',
              why: `Deriviamo entrambi i membri rispetto a $E_{hk}$. A destra, nella somma, tutti i termini sono costanti rispetto a $E_{hk}$ tranne quello che lo contiene, il cui coefficiente è $\\mathbb A_{ijhk}$: le componenti di $\\mathbb A$ non dipendono dalla deformazione.`,
              ask: { q: `Deriviamo $\\sum_{p,q}\\mathbb A_{ijpq}E_{pq}$ rispetto a $E_{hk}$. Che cosa resta?`, options: ['$\\mathbb A_{ijhk}$', '$\\mathbb A_{hkij}$', '$\\sum_{p,q}\\mathbb A_{ijpq}$', 'Zero'], correct: 0, why: `Nella somma l'unico termine che contiene $E_{hk}$ è quello con $p=h$, $q=k$, di coefficiente $\\mathbb A_{ijhk}$. $\\mathbb A_{hkij}$ ha gli indici scambiati, ed è proprio quello che vogliamo dimostrare uguale; la somma di tutti i coefficienti e lo zero dimenticano che uno e un solo termine sopravvive.` },
            },
            { tex: '\\dfrac{\\partial^2\\varphi}{\\partial E_{hk}\\partial E_{ij}}=\\mathbb A_{hkij}', why: `Facciamo lo stesso conto con le coppie di indici scambiate: partiamo da $T_{hk}=\\partial\\varphi/\\partial E_{hk}=\\sum_{i,j}\\mathbb A_{hkij}E_{ij}$ e deriviamo rispetto a $E_{ij}$: nella somma sopravvive solo il termine che contiene $E_{ij}$. La dispensa scrive anche questo conto, introducendolo con «allo stesso modo».` },
            {
              tex: '\\Rightarrow\\ \\mathbb A_{ijhk}=\\mathbb A_{hkij},\\qquad\\mathbb A=\\mathbb A^T=\\dfrac{\\partial^2\\varphi}{\\partial\\tens E^2}',
              why: `Le due righe precedenti sono la stessa derivata seconda mista, fatta in due ordini. Per il teorema di Schwarz, per una funzione regolare l'ordine di derivazione è indifferente: quindi i due secondi membri sono uguali. È la simmetria maggiore, e in più abbiamo scoperto che $\\mathbb A$ è la derivata seconda di $\\varphi$.`,
              ask: { q: 'Quale teorema chiude la dimostrazione?', options: ['Schwarz (derivate miste)', 'Divergenza', 'Spettrale', 'Kirchhoff'], correct: 0, why: `Il teorema di Schwarz garantisce che le derivate seconde miste di una funzione regolare non dipendono dall'ordine. Il teorema della divergenza trasforma integrali di superficie in integrali di volume, quello spettrale riguarda autovalori: qui non servono.` },
              eq: 'Teo 4.9.2, a ⇒ b',
            },
          ],
        },
      },
      {
        id: 'l45-13',
        kind: 'spiega',
        title: 'Che cosa abbiamo ottenuto',
        md: `Il risultato si legge così: **se esiste un'energia, il tensore elastico è la sua derivata seconda**, $\\mathbb A=\\partial^2\\varphi/\\partial\\tens E^2$; e le derivate seconde, per Schwarz, sono simmetriche nello scambio delle variabili. Ecco da dove viene la simmetria maggiore: non è un'ipotesi in più, è una conseguenza dell'esistenza di $\\varphi$.

Controllo in una dimensione (deduzione): con $\\varphi=\\frac12E\\varepsilon^2$ la derivata seconda è $d^2\\varphi/d\\varepsilon^2=E$, proprio il modulo di Young, il «tensore elastico» a una componente. Ricorda che questa $E$ è un numero, da non confondere con il tensore di deformazione $\\tens E$ che compare in $\\partial^2\\varphi/\\partial\\tens E^2$.

Conseguenza pratica: un materiale elastico lineare e iperelastico ha **21** costanti indipendenti, non 36 (§4.9). In laboratorio, 15 misure in meno (deduzione).`,
      },
      {
        id: 'l45-14',
        kind: 'domanda',
        q: { id: 'l45-q3', kind: 'scelta', q: 'Quante costanti indipendenti ha un tensore elastico iperelastico?', options: ['21', '36', '81', '2'], correct: 0, why: `Alle due simmetrie minori (36 costanti, tabella 6 per 6) si aggiunge la maggiore, che rende la tabella simmetrica: 6 sulla diagonale più 15 sopra, 21 in tutto. 36 è il conto senza la simmetria maggiore; 2 è il caso isotropo, che vedremo con le simmetrie materiali.` },
      },
      {
        id: 'l45-15',
        kind: 'derivazione',
        title: 'Teorema sull’energia: b ⇒ c',
        md: `**Dove vogliamo arrivare:** la formula esplicita $\\varphi=\\frac12\\mathbb A\\tens E\\cdot\\tens E$. **L'idea:** visto che il lavoro non dipende dal cammino, scegliamo il cammino più semplice, la retta dall'origine $\\tens O$ alla deformazione $\\tens E^*$, cioè $\\hat{\\tens E}(\\alpha)=\\alpha\\tens E^*$ con $\\alpha$ da 0 a 1, e calcoliamo il lavoro lungo di essa. Nel campione $\\mathbb A$ è casuale con la simmetria maggiore.`,
        source: D(4, '4.9.3', 'Teo 4.9.2', 81),
        der: {
          sample: (r) => { const o: R = {}; for (let k = 0; k < 81; k++) o[`A${k}`] = 2 * r() - 1; putMat(o, 'E', T.sym(T.randMat(r))); return o; },
          lines: [
            { tex: 'w=\\int_0^1\\hat{\\tens T}(\\alpha)\\cdot\\dfrac{d\\hat{\\tens E}}{d\\alpha}\\,d\\alpha', why: `È la formula del lavoro lungo un cammino del §4.9.1, scritta per il nostro cammino, con $\\alpha$ che va da 0 a 1.`, val: (v) => workQuad(A81(v), T.O3, mat(v, 'E'), T.O3) },
            { tex: '=\\int_0^1\\mathbb A(\\alpha\\tens E^*)\\cdot\\tens E^*\\,d\\alpha', why: `Sul cammino rettilineo $\\hat{\\tens E}(\\alpha)=\\alpha\\tens E^*$, quindi la sua derivata è $d\\hat{\\tens E}/d\\alpha=\\tens E^*$; e la tensione è $\\hat{\\tens T}=\\mathbb A\\hat{\\tens E}=\\mathbb A(\\alpha\\tens E^*)$.`, val: (v) => workQuad(A81(v), T.O3, mat(v, 'E'), T.O3) },
            { tex: '=\\int_0^1\\alpha\\,\\mathbb A\\tens E^*\\cdot\\tens E^*\\,d\\alpha', why: `$\\mathbb A$ è lineare, quindi $\\mathbb A(\\alpha\\tens E^*)=\\alpha\\,\\mathbb A\\tens E^*$; e il numero $\\alpha$ esce anche dal prodotto scalare.`, aggiunto: true, val: (v) => T.ddot(T.apply4(A81(v), mat(v, 'E')), mat(v, 'E')) * 0.5 },
            { tex: '=\\mathbb A\\tens E^*\\cdot\\tens E^*\\int_0^1\\alpha\\,d\\alpha', why: `Il numero $\\mathbb A\\tens E^*\\cdot\\tens E^*$ non dipende da $\\alpha$: è una costante e si porta fuori dall'integrale.`, val: (v) => T.ddot(T.apply4(A81(v), mat(v, 'E')), mat(v, 'E')) * 0.5 },
            {
              tex: '=\\tfrac12\\,\\mathbb A\\tens E^*\\cdot\\tens E^*',
              why: `Resta $\\int_0^1\\alpha\\,d\\alpha=\\frac12$. E siccome per a) il lavoro da $\\tens O$ a $\\tens E^*$ è $\\varphi(\\tens E^*)$ qualunque sia il cammino, abbiamo trovato $\\varphi(\\tens E^*)=\\frac12\\mathbb A\\tens E^*\\cdot\\tens E^*$.`,
              ask: { q: 'Da dove viene il fattore ½?', options: ['Da $\\int_0^1\\alpha\\,d\\alpha$: lo sforzo cresce insieme alla deformazione lungo il cammino', 'Dalla simmetria di $\\tens E$', 'Da una convenzione di scrittura', 'Dalla simmetria maggiore di $\\mathbb A$'], correct: 0, why: `Lungo il cammino la tensione parte da zero e cresce proporzionalmente ad $\\alpha$: il lavoro è la «media» della tensione, metà di quella finale. Non è una convenzione, e non viene da simmetrie. È lo stesso ½ che ritroverai nel teorema di Clapeyron (Cap. 5): l'area di un triangolo.` },
              val: (v) => El.energy(A81(v), mat(v, 'E')),
              eq: 'Teo 4.9.2, b ⇒ c',
            },
          ],
        },
      },
      {
        id: 'l45-16',
        kind: 'spiega',
        title: 'Leggere la formula, e chiudere il cerchio',
        md: `La formula $\\varphi=\\frac12\\mathbb A\\tens E\\cdot\\tens E$ è la versione tensoriale del triangolo del secondo passo: in una dimensione, dove al posto del tensore $\\tens E$ c'è la dilatazione $\\varepsilon$ e al posto di $\\mathbb A$ il modulo di Young $E$ (un numero), diventa $\\frac12E\\varepsilon^2=\\frac12\\sigma\\varepsilon$ (deduzione). Il ½ c'è perché il carico è applicato gradualmente.

Ora un punto delicato, che la dispensa segnala con un «Attenzione» (p. 81). Rileggi l'ultima riga: per dire che il lavoro sulla retta **è** $\\varphi(\\tens E^*)$ abbiamo usato a), cioè l'esistenza di $\\varphi$. La catena «a implica b, b implica c» degli appunti, quindi, non è ancora una dimostrazione di equivalenza: bisogna chiudere il cerchio, e la dispensa lo fa in due mosse.

La prima: c) implica a). L'affermazione c) dice che l'energia esiste e vale $\\frac12\\mathbb A\\tens E\\cdot\\tens E$; quindi, in particolare, esiste, ed è proprio a). Che quella funzione sia davvero un'energia, cioè che la sua derivata dia $\\tens T$, è però un'altra questione, e richiede b).

La seconda: b) implica a). Con la simmetria maggiore la derivata di $\\frac12\\mathbb A\\tens E\\cdot\\tens E$ rispetto a $\\tens E$ è $\\mathbb A\\tens E=\\tens T$, quindi quella funzione è un'energia. Perché serve la simmetria? In generale la derivata di $\\frac12\\mathbb A\\tens E\\cdot\\tens E$ è $\\frac12(\\mathbb A+\\mathbb A^T)\\tens E$, che coincide con $\\mathbb A\\tens E$ solo se $\\mathbb A=\\mathbb A^T$ (passaggio aggiunto).`,
      },
      {
        id: 'l45-17',
        kind: 'domanda',
        q: { id: 'l45-q4', kind: 'vf', q: 'Un tensore elastico con le sole simmetrie minori ammette sempre un’energia specifica $\\varphi$.', answer: false, why: `Per il Teo 4.9.2 l'energia esiste se e solo se c'è anche la simmetria maggiore. Il modello dei tre cammini lo mostra: con le sole simmetrie minori il lavoro cambia da cammino a cammino e il giro chiuso non dà zero.` },
      },
      {
        id: 'l45-18',
        kind: 'spiega',
        title: 'Definita positività: deformare costa energia',
        md: `Che segno ha $\\varphi$? Dal Modulo 1 (Def 1.7.6) ricordi che un tensore del IV ordine è **definito positivo**, $\\mathbb A\\in\\mathrm{Pos}^+$, se $\\mathbb A\\tens A\\cdot\\tens A>0$ per ogni tensore $\\tens A$ diverso da zero. Per il tensore elastico, grazie alle simmetrie minori, basta controllarlo sulle deformazioni simmetriche (§4.9.4):
$$\\mathbb A\\tens E\\cdot\\tens E>0\\quad\\forall\\tens E\\in\\mathrm{Sym}\\setminus\\{\\tens O\\},$$
cioè per ogni deformazione simmetrica ($\\mathrm{Sym}$ è l'insieme dei tensori simmetrici) diversa dal tensore nullo. Con la formula appena trovata, $\\varphi=\\frac12\\mathbb A\\tens E\\cdot\\tens E$, questo vuol dire semplicemente
$$\\varphi(\\tens E)>0\\quad\\text{per ogni }\\tens E\\ne\\tens O:$$
qualunque deformazione non nulla richiede di **spendere** energia. È quello che ci si aspetta da un materiale fisicamente sensato: non si può ottenere energia deformandolo (deduzione). Le conseguenze sulle costanti si vedranno nel Modulo 5, con le restrizioni di plausibilità fisica (§4.15).`,
      },
      {
        id: 'l45-19',
        kind: 'spiega',
        title: 'Quando il legame non è lineare: il tensore tangente',
        md: `Abbiamo detto che l'iperelasticità non richiede la linearità. Che cosa diventa allora il tensore elastico (§4.9.5)? Se la curva tensione–deformazione non è una retta, non c'è più un'unica pendenza; ma in ogni punto del cammino se ne può definire una **locale**, la pendenza della tangente:
$$\\mathbb A=\\frac{\\partial\\tens T}{\\partial\\tens E}=\\frac{\\partial^2\\varphi}{\\partial\\tens E^2}.$$
È il **tensore elastico tangente**, che descrive la risposta a piccoli incrementi di deformazione attorno allo stato attuale (la figura di p. 82 lo disegna come tangente alla curva). Nota che è la stessa formula trovata dimostrando che a) implica b), solo che ora $\\mathbb A$ cambia lungo il cammino. Con deformazioni finite, infine, $\\tens E$ andrebbe sostituito con altre misure di deformazione.`,
      },
      {
        id: 'l45-20',
        kind: 'spiega',
        title: 'Attenzione a…',
        md: `Tre errori tipici su questo argomento.

1. **Dire che ogni materiale elastico è iperelastico.** L'elasticità chiede la reversibilità meccanica; l'iperelasticità anche quella termodinamica, cioè l'esistenza di $\\varphi$. Nel caso lineare la differenza è la simmetria maggiore. Per gli isotropi le due cose coincidono, come vedrai nel Modulo 5 (§4.12).
2. **Non saper spiegare il fattore ½.** Viene dall'integrale $\\int_0^1\\alpha\\,d\\alpha$: lungo il cammino la tensione cresce insieme alla deformazione, perché il carico è applicato gradualmente.
3. **Presentare la catena «a implica b, b implica c» come se bastasse.** Nel passo da b) a c) si usa a), per identificare il lavoro con $\\varphi$; per avere l'equivalenza bisogna chiudere il cerchio mostrando che c) implica a) e che b) implica a) (Attenzione della dispensa, p. 81).`,
      },
      {
        id: 'l45-21',
        kind: 'riassunto',
        md: `**Il filo della lezione.** Un materiale è iperelastico se la tensione è la derivata di un'energia specifica di deformazione $\\varphi$. Allora, lungo un qualsiasi cammino di deformazione, l'integranda del lavoro è la derivata di $\\varphi$, e il lavoro vale la differenza dei valori di $\\varphi$ agli estremi: non dipende dal cammino, è nullo sui cammini chiusi, e partendo dalla configurazione naturale $\\varphi(\\tens E)$ è proprio il lavoro speso per deformare. Per un materiale lineare, l'esistenza di $\\varphi$ equivale alla simmetria maggiore di $\\mathbb A$ (con Schwarz sulle derivate seconde) e alla formula $\\varphi=\\frac12\\mathbb A\\tens E\\cdot\\tens E$ (con il cammino rettilineo); le costanti scendono a 21. Se $\\mathbb A$ è definito positivo, deformare costa sempre energia; se il legame non è lineare, $\\mathbb A$ diventa il tensore tangente.

- Iperelastico: $\\tens T=\\partial\\varphi(\\tens E)/\\partial\\tens E$, $\\varphi(\\tens O)=0$ (Def 4.9.1).
- Lavoro indipendente dal cammino: $w=\\int_{\\alpha_1}^{\\alpha_2}\\hat{\\tens T}\\cdot\\frac{d\\hat{\\tens E}}{d\\alpha}\\,d\\alpha=\\varphi(\\tens E_2)-\\varphi(\\tens E_1)$ (§4.9.1).
- Teorema sull'energia specifica: $\\exists\\varphi\\iff\\mathbb A=\\mathbb A^T\\iff\\varphi=\\frac12\\mathbb A\\tens E\\cdot\\tens E$ (Teo 4.9.2).
- $\\mathbb A\\in\\mathrm{Pos}^+\\Rightarrow\\varphi(\\tens E)>0$ (§4.9.4); tensore tangente $\\mathbb A=\\partial^2\\varphi/\\partial\\tens E^2$ (§4.9.5).`,
        orale: ['Iperelasticità: definizione di $\\varphi$, cammino di deformazione, lavoro indipendente dal cammino, significato assoluto. (dispensa, domanda 8)', 'Teorema sull’energia specifica: equivalenza a)–b)–c) e dimostrazioni. (dispensa, domanda 9)'],
      },
    ],
  },
  // ================================================================== c4.6
  {
    concept: 'c4.6',
    title: 'Simmetrie materiali e Voigt',
    minutes: 32,
    source: D(4, '4.10–4.11', 'Def 4.10.1', '82–86'),
    visual: SVG('voigt', { classe: 'ortotropo' }),
    steps: [
      {
        id: 'l46-1',
        kind: 'spiega',
        title: 'Dove siamo e dove andiamo',
        md: `Nella lezione precedente siamo arrivati a 21 costanti per un materiale elastico lineare e iperelastico. Sono ancora tante da misurare. Ma la natura del materiale può aiutarci: nella lezione di laboratorio abbiamo visto che un acciaio risponde allo stesso modo in tutte le direzioni, mentre un composito no. Se un materiale risponde allo stesso modo in direzioni diverse, molte costanti devono essere uguali tra loro, o nulle.

In questa lezione trasformiamo questa intuizione in una condizione precisa. Le tappe: un esperimento con tre materiali; la condizione di simmetria materiale e il gruppo di simmetria; le classi di materiali con il loro numero di costanti; infine la **notazione di Voigt**, che scrive il tensore elastico come una tabella 6 per 6 e permette di vedere a occhio la struttura di ogni classe.`,
      },
      {
        id: 'l46-2',
        kind: 'spiega',
        title: 'Un esperimento: tre lastre, tre direzioni',
        md: `L'esperimento della dispensa (§4.10) parte da tre lastre: una di **acciaio**, una di **legno**, una di **CFRP 0/90** (plastica rinforzata con fibre di carbonio disposte a 0° e a 90°). Da ciascuna si ritagliano tre provini: a 0° (provino 1), a 45° (provino 2) e a 90° (provino 3), e si confrontano le curve $F$–$\\Delta L$ (figura di p. 82).

- **Acciaio:** le tre curve sono sovrapposte. La direzione non conta (a parte piccoli effetti della trafilatura).
- **Legno:** il provino 1, lungo le fibre, è il più rigido; il 3, ortogonale alle fibre, il più deformabile; il 2 sta in mezzo.
- **CFRP 0/90:** i provini 1 e 3 coincidono, perché le fibre sono uguali nelle due direzioni; il 2, a 45°, è più deformabile.

Tre materiali, tre comportamenti diversi rispetto alla direzione: è questo che vogliamo descrivere.`,
      },
      {
        id: 'l46-3',
        kind: 'spiega',
        title: 'Che cosa vuol dire simmetria materiale',
        md: `Una **simmetria materiale** è la riproposizione della stessa risposta in direzioni diverse (§4.10): se ruoti il provino in un certo modo e la curva non cambia, quella rotazione è una simmetria del materiale. La terminologia viene dall'ottica dei cristalli, dove si studiano le simmetrie della struttura cristallina.

La regola generale è intuitiva: **più simmetrie, meno costanti**. Se il materiale risponde allo stesso modo in molte direzioni, molte costanti di $\\mathbb A$ devono coincidere.

Come si scoprono le simmetrie in pratica (§4.10.1)? Il modo tradizionale è ritagliare campioni in molte direzioni, che è oneroso. Un'alternativa sono le prove con gli **ultrasuoni**, che non distruggono il campione: il pezzo viene immerso in una vasca e un robot lo sonda da molte direzioni, oppure gli ultrasuoni vengono generati con un laser pulsato, per effetto termomeccanico.`,
      },
      {
        id: 'l46-4',
        kind: 'domanda',
        q: { id: 'l46-q2', kind: 'scelta', q: 'Nella prova su CFRP 0/90, quale provino si comporta diversamente dagli altri due?', options: ['Quello a 45°, più deformabile', 'Quello a 0°, più rigido', 'Quello a 90°, più deformabile', 'Nessuno: le tre curve coincidono'], correct: 0, why: `Le fibre a 0° e a 90° sono uguali, quindi i provini 1 e 3 coincidono; quello a 45°, in direzione intermedia, è più deformabile (§4.10): non ha fibre allineate al carico (deduzione). Le tre curve coincidono per l'acciaio, non per il composito; «0° più rigido» descrive il legno.` },
      },
      {
        id: 'l46-5',
        kind: 'spiega',
        title: 'Ruotare la perturbazione',
        md: `Per scrivere la condizione in formule, la dispensa fa un esperimento mentale nell'intorno del punto $x$ (§4.10.2). Prima perturba l'intorno con uno spostamento $\\vet u$: nascono la deformazione $\\tens E$ e la tensione $\\tens T=\\mathbb A\\tens E$.

Poi ripete la prova con lo stesso spostamento **ruotato**: $\\vet u^*=\\tens Q\\vet u$, con $\\tens Q$ una rotazione. Per la congruenza la nuova deformazione è
$$\\tens E^*=\\tens Q\\tens E\\tens Q^T,$$
cioè la deformazione di prima «vista ruotata»: è la regola del Modulo 1 con cui un tensore si trasforma quando si ruota tutto con $\\tens Q$. La tensione che il materiale risponde si ottiene con lo **stesso** $\\mathbb A$, perché il legame è una proprietà del punto e non cambia se ruotiamo la prova:
$$\\tens T^*=\\mathbb A\\big[\\tens Q\\tens E\\tens Q^T\\big].$$`,
      },
      {
        id: 'l46-6',
        kind: 'spiega',
        title: 'La condizione: la stessa risposta, ruotata',
        md: `Quando diciamo che il materiale risponde «allo stesso modo» nella direzione ruotata, non vogliamo dire che $\\tens T^*$ è uguale a $\\tens T$: la prova è ruotata, quindi ci aspettiamo la tensione di prima, **ruotata allo stesso modo**: $\\tens T^*=\\tens Q\\tens T\\tens Q^T$. Uguagliando le due espressioni di $\\tens T^*$ si ottiene la condizione
$$\\mathbb A\\big[\\tens Q\\tens E\\tens Q^T\\big]=\\tens Q(\\mathbb A\\tens E)\\tens Q^T\\quad\\forall\\tens E\\in\\mathrm{Sym},$$
cioè per ogni deformazione simmetrica. A parole: ruotare la deformazione e poi applicare il materiale dà lo stesso risultato che applicare il materiale e poi ruotare la tensione.

**Def 4.10.1.** Un tensore ortogonale $\\tens Q\\in\\mathrm{Orth}$ (che conserva lunghezze e angoli) è una **trasformazione di simmetria materiale** se soddisfa questa condizione per ogni $\\tens E$. L'insieme di tutte le trasformazioni di simmetria è il **gruppo di simmetria materiale** $\\mathcal G\\subseteq\\mathrm{Orth}$. Nota che la definizione ammette anche le riflessioni, non solo le rotazioni: serviranno per gli ortotropi (deduzione). Un particolare gruppo di simmetria obbliga $\\mathbb A$ ad avere una forma specifica: alcune componenti devono essere uguali tra loro, altre nulle.`,
      },
      {
        id: 'l46-7',
        kind: 'domanda',
        q: { id: 'l46-q3', kind: 'vf', q: '$\\tens Q$ è una trasformazione di simmetria se, ruotando la deformazione, la tensione resta esattamente la stessa: $\\mathbb A[\\tens Q\\tens E\\tens Q^T]=\\mathbb A\\tens E$.', answer: false, why: `La prova è ruotata, quindi anche la tensione deve risultare ruotata: la condizione giusta è $\\mathbb A[\\tens Q\\tens E\\tens Q^T]=\\tens Q(\\mathbb A\\tens E)\\tens Q^T$ (Def 4.10.1). Chiedere la stessa tensione non ruotata sarebbe confondere «stessa risposta» con «stessi numeri».` },
      },
      {
        id: 'l46-8',
        kind: 'spiega',
        title: 'Le classi e il numero di costanti',
        md: `Ogni gruppo di simmetria definisce una classe di materiali; ecco le quattro della dispensa, con il numero di costanti indipendenti per un materiale elastico e per uno iperelastico (tabella di p. 84):

- **anisotropi**: nessuna simmetria, 36 / 21;
- **ortotropi**: simmetrici rispetto alle riflessioni in tre piani ortogonali, come il CFRP 0/90 e la muratura, 12 / 9;
- **trasversalmente isotropi**: simmetrici per tutte le rotazioni attorno a un asse $\\hat e$, come il legno e i compositi unidirezionali, 6 / 5;
- **isotropi**: tutte le trasformazioni ortogonali sono simmetrie, $\\mathcal G\\equiv\\mathrm{Orth}$, come l'acciaio, 2 / 2.

Leggi la tabella dall'alto in basso: il gruppo si allarga, le costanti calano. Per un isotropo bastano due numeri.`,
      },
      {
        id: 'l46-9',
        kind: 'spiega',
        title: 'Il gruppo degli anisotropi non è vuoto',
        md: `Un dettaglio che la dispensa segnala con un «Attenzione» (p. 84): per gli anisotropi gli appunti scrivevano $\\mathcal G=\\emptyset$, ma non è corretto. Il gruppo contiene sempre almeno $\\{\\tens I,-\\tens I\\}$. Per $\\tens I$ è chiaro: non ruotare nulla non cambia nulla. Per $-\\tens I$ la dispensa dà il motivo: $(-\\tens I)\\tens E(-\\tens I)^T=\\tens E$. Allo stesso modo anche la tensione resta la stessa, $\\tens Q\\tens T\\tens Q^T=\\tens T$, quindi la condizione è soddisfatta da qualunque $\\mathbb A$ (deduzione). «Nessuna simmetria» vuol dire allora «solo quelle banali».

Altre tre osservazioni della dispensa. Gli oggetti prodotti con la stampa 3D (manifattura additiva) sono fortemente anisotropi. Gli isotropi sono **sempre iperelastici**: elastico e iperelastico hanno 2 costanti entrambi, e lo dimostreremo nel Modulo 5 (§4.12); per questo chi lavora solo con l'acciaio fatica a vedere la differenza. Infine, con gli ultrasuoni si procede in due tempi: prima la **classificazione** (quale gruppo?), poi la **rappresentazione** (quanto valgono i moduli?).`,
      },
      {
        id: 'l46-10',
        kind: 'domanda',
        q: { id: 'l46-q4', kind: 'scelta', q: 'Quante costanti ha un materiale ortotropo iperelastico?', options: ['9', '12', '5', '21'], correct: 0, why: `Tabella di p. 84: un ortotropo ha 12 costanti se elastico e 9 se iperelastico, perché la simmetria maggiore rende uguali $C_{12}$ e $C_{21}$, $C_{13}$ e $C_{31}$, $C_{23}$ e $C_{32}$. 5 è il trasversalmente isotropo iperelastico, 21 l'anisotropo iperelastico.` },
      },
      {
        id: 'l46-11',
        kind: 'spiega',
        title: 'La notazione di Voigt: un tensore simmetrico come sei numeri',
        md: `Per vedere la struttura di $\\mathbb A$ in ogni classe serve una scrittura comoda. Un tensore simmetrico ha solo sei componenti indipendenti; la **notazione di Voigt** le mette in colonna (§4.11):
$$\\{\\tens T\\}=(\\sigma_1,\\sigma_2,\\sigma_3,\\tau_{23},\\tau_{31},\\tau_{12})^T,\\qquad\\{\\tens E\\}=(\\varepsilon_1,\\varepsilon_2,\\varepsilon_3,\\gamma_{23},\\gamma_{31},\\gamma_{12})^T.$$
Le prime tre componenti sono le tensioni normali e le dilatazioni; le ultime tre le tensioni tangenziali e gli **scorrimenti** angolari, con
$$\\gamma_{ij}=2E_{ij}:$$
è lo scorrimento del capitolo 2, la variazione dell'angolo retto tra due fibre, che vale il doppio della componente fuori diagonale di $\\tens E$.

Con queste colonne il legame $\\tens T=\\mathbb A\\tens E$ diventa un prodotto tra una matrice 6 per 6 e una colonna di 6 numeri: $\\{\\tens T\\}=[\\mathbb A]\\{\\tens E\\}$. Le costanti della matrice si indicano spesso con due indici, $C_{IJ}$, con $I$ e $J$ da 1 a 6.`,
      },
      {
        id: 'l46-12',
        kind: 'spiega',
        title: 'I quattro blocchi della matrice',
        md: `La matrice 6 per 6 si divide naturalmente in quattro blocchi 3 per 3, che la dispensa chiama come i punti cardinali (§4.11):
- **NW** (in alto a sinistra): come le dilatazioni $\\varepsilon$ producono tensioni normali $\\sigma$;
- **NE** (in alto a destra): come gli scorrimenti $\\gamma$ producono tensioni normali $\\sigma$;
- **SW** (in basso a sinistra): come le dilatazioni $\\varepsilon$ producono tensioni tangenziali $\\tau$;
- **SE** (in basso a destra): come gli scorrimenti $\\gamma$ producono tensioni tangenziali $\\tau$.

Per esempio la prima riga si legge
$$\\sigma_1=\\underbrace{C_{11}\\varepsilon_1+C_{12}\\varepsilon_2+C_{13}\\varepsilon_3}_{NW}+\\underbrace{C_{14}\\gamma_{23}+C_{15}\\gamma_{31}+C_{16}\\gamma_{12}}_{NE}.$$
In un anisotropo tutti i blocchi sono pieni: anche uno scorrimento può produrre una tensione normale. Le classi più simmetriche svuotano alcuni blocchi.`,
      },
      {
        id: 'l46-13',
        kind: 'spiega',
        title: 'Il riferimento conta',
        md: `Prima di guardare le strutture, un'avvertenza (§4.11). Le componenti $C_{IJ}$ dipendono dal sistema di riferimento in cui le scrivi, come le componenti di qualunque tensore. In un riferimento qualsiasi anche un materiale molto simmetrico può avere una matrice piena e poco leggibile.

Le semplificazioni compaiono solo nei riferimenti **legati alle direzioni di simmetria** del materiale: per un ortotropo il riferimento principale di ortotropia, con gli assi ortogonali ai tre piani di simmetria; per un trasversalmente isotropo un riferimento con un asse lungo l'asse di isotropia. Se poi il calcolo si fa in un riferimento diverso, bisogna trasformare il tensore elastico con le regole tensoriali.

Ora prova sul modello.`,
      },
      {
        id: 'l46-14',
        kind: 'prova',
        title: 'La matrice di Voigt, classe per classe',
        md: 'La matrice 6×6 del tensore elastico divisa nei quattro blocchi. Le caselle dello stesso colore sono la stessa costante, quelle vuote sono nulle. Passa da una classe all’altra.',
        tasks: ['Anisotropo: tutte le caselle sono piene. Togli «iperelastico» e guarda le costanti salire da 21 a 36: la matrice non è più simmetrica.', 'Ortotropo: i blocchi NE e SW si svuotano e SE resta solo diagonale. Nota che quindi $\\tau_{23}=C_{44}\\gamma_{23}$.', 'Trasversalmente isotropo: guarda l’ultima casella, $(C_{11}-C_{12})/2$: non è una costante nuova.', 'Isotropo: restano solo $\\lambda+2\\mu$, $\\lambda$ e $\\mu$.'],
        visual: SVG('voigt', { classe: 'anisotropo' }),
      },
      {
        id: 'l46-15',
        kind: 'spiega',
        title: 'Ortotropi e trasversalmente isotropi',
        md: `Ecco le strutture della dispensa (§4.11.1).

**Ortotropi**, nel riferimento principale di ortotropia: i blocchi NE e SW sono nulli, quindi dilatazioni e scorrimenti non si mescolano; il blocco SE è diagonale, con $C_{44}$, $C_{55}$, $C_{66}$. Ogni tensione tangenziale dipende solo dal suo scorrimento, per esempio $\\tau_{23}=C_{44}\\gamma_{23}$. Le costanti sono 12 (il conto, per deduzione: il blocco NW pieno ne ha 9, più le 3 diagonali di SE); con la simmetria maggiore $C_{12}=C_{21}$, $C_{13}=C_{31}$, $C_{23}=C_{32}$, e si scende a 9.

**Trasversalmente isotropi**, con asse di isotropia $\\hat e_3$:
$$[\\mathbb A]=\\begin{bmatrix}C_{11}&C_{12}&C_{13}&0&0&0\\\\C_{12}&C_{11}&C_{13}&0&0&0\\\\C_{31}&C_{31}&C_{33}&0&0&0\\\\0&0&0&C_{44}&0&0\\\\0&0&0&0&C_{44}&0\\\\0&0&0&0&0&\\frac{C_{11}-C_{12}}2\\end{bmatrix}.$$
Le direzioni 1 e 2, nel piano di isotropia, sono equivalenti, e l'ultima casella non è indipendente: costanti 6, che diventano 5 con $C_{13}=C_{31}$. La dispensa nota che questi moduli sono riferiti alle direzioni del materiale: per un calcolo in un altro riferimento serve una trasformazione tensoriale.`,
      },
      {
        id: 'l46-16',
        kind: 'domanda',
        q: { id: 'l46-q1', kind: 'scelta', q: 'In un materiale ortotropo, nel riferimento principale di ortotropia, da che cosa dipende $\\tau_{23}$?', options: ['Solo da $\\gamma_{23}$', 'Da tutte le deformazioni', 'Dalle dilatazioni $\\varepsilon_i$', 'Da $\\gamma_{12}$ e $\\gamma_{31}$'], correct: 0, why: `Il blocco SW è nullo, quindi le dilatazioni non producono tensioni tangenziali; e il blocco SE è diagonale, quindi gli altri scorrimenti non contano: $\\tau_{23}=C_{44}\\gamma_{23}$ (§4.11.1). «Da tutte le deformazioni» è il caso anisotropo, o un riferimento non principale.` },
      },
      {
        id: 'l46-17',
        kind: 'spiega',
        title: 'Isotropi: due costanti in qualunque riferimento',
        md: `Per un materiale **isotropo** il gruppo di simmetria è tutto Orth: nessuna direzione è privilegiata, quindi la struttura semplice si vede **in qualunque riferimento** (§4.11.1):
$$[\\mathbb A]=\\begin{bmatrix}\\lambda+2\\mu&\\lambda&\\lambda&0&0&0\\\\\\lambda&\\lambda+2\\mu&\\lambda&0&0&0\\\\\\lambda&\\lambda&\\lambda+2\\mu&0&0&0\\\\0&0&0&\\mu&0&0\\\\0&0&0&0&\\mu&0\\\\0&0&0&0&0&\\mu\\end{bmatrix}.$$
Le due costanti $\\mu$ e $\\lambda$ sono le **costanti di Lamé**. Nota il **disaccoppiamento** tra comportamento estensionale e di scorrimento: le tensioni normali dipendono solo dalle dilatazioni, $\\sigma_i=\\sigma_i(\\varepsilon_1,\\varepsilon_2,\\varepsilon_3)$, e ogni tensione tangenziale solo dal suo scorrimento, $\\tau_{ij}=\\tau_{ij}(\\gamma_{ij})$. Il Modulo 5 partirà proprio da qui, con il teorema di Lamé.`,
      },
      {
        id: 'l46-18',
        kind: 'spiega',
        title: 'Attenzione a…',
        md: `Tre errori tipici su questo argomento.

1. **Leggere le semplificazioni di $[\\mathbb A]$ in un riferimento qualunque.** I blocchi vuoti dell'ortotropo e la struttura del trasversalmente isotropo valgono nel riferimento solidale alle direzioni di simmetria; in un altro riferimento la matrice si riempie. Solo per l'isotropo il riferimento non conta.
2. **Dimenticare il fattore 2 negli scorrimenti.** Nella notazione di Voigt la colonna delle deformazioni contiene $\\gamma_{ij}=2E_{ij}$, non $E_{ij}$: sbagliare qui altera tutte le costanti del blocco SE (deduzione).
3. **Dire che per gli anisotropi il gruppo di simmetria è vuoto.** Un gruppo contiene sempre l'identità, e qui anche $-\\tens I$ (Attenzione, p. 84).`,
      },
      {
        id: 'l46-19',
        kind: 'riassunto',
        md: `**Il filo della lezione.** Un materiale può rispondere allo stesso modo in direzioni diverse, come mostrano le prove su acciaio, legno e CFRP. Ruotando la perturbazione con $\\tens Q$, la deformazione diventa $\\tens Q\\tens E\\tens Q^T$; la risposta è «la stessa» se la tensione risulta ruotata allo stesso modo, e le $\\tens Q$ che soddisfano questa condizione formano il gruppo di simmetria materiale. Più il gruppo è grande, meno costanti servono: 21, 9, 5, 2 per anisotropi, ortotropi, trasversalmente isotropi e isotropi iperelastici. La notazione di Voigt scrive i tensori simmetrici come colonne di sei numeri, con gli scorrimenti $\\gamma=2E$, e il tensore elastico come una matrice 6 per 6 a quattro blocchi, le cui semplificazioni si leggono nel riferimento del materiale; per gli isotropi restano le due costanti di Lamé, in qualunque riferimento.

- Trasformazione di simmetria materiale: $\\mathbb A[\\tens Q\\tens E\\tens Q^T]=\\tens Q(\\mathbb A\\tens E)\\tens Q^T$ per ogni $\\tens E\\in\\mathrm{Sym}$ (Def 4.10.1).
- Voigt: $\\{\\tens T\\}=(\\sigma_1,\\sigma_2,\\sigma_3,\\tau_{23},\\tau_{31},\\tau_{12})$, $\\{\\tens E\\}=(\\varepsilon_1,\\varepsilon_2,\\varepsilon_3,\\gamma_{23},\\gamma_{31},\\gamma_{12})$, $\\gamma_{ij}=2E_{ij}$ (§4.11).
- Costanti (elastico / iperelastico): anisotropi 36 / 21, ortotropi 12 / 9, trasversalmente isotropi 6 / 5, isotropi 2 / 2 (§4.10.2).`,
        orale: ['Simmetrie materiali: condizione, gruppo di simmetria, classi e numero di costanti; notazione di Voigt e struttura di $[\\mathbb A]$. (dispensa, domanda 10)'],
      },
    ],
  },
];
