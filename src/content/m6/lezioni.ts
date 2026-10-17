/**
 * Lezioni guidate del Modulo 6 (Cap. 5, §5.1–5.6), scritte secondo docs/GUIDA_LEZIONI.md. Derivazioni solo dove la
 * dispensa le sviluppa (ANALISI §4); le righe con `val` sono verificate su 25 campioni casuali (tests/lezioni.test.ts).
 * Il campione è un rettangolo B×H (H > B) con carichi casuali; gli spostamenti sono derivati numericamente da
 * engine/sezioni. Le righe marcate `aggiunto` e i passi marcati «(deduzione)» o «(passaggio aggiunto)» non sono
 * scritti nella dispensa.
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
    minutes: 24,
    source: D(5, '5.1', 'Teo 5.1.1', '99–100'),
    visual: SVG('problema'),
    steps: [
      {
        id: 'l61-1',
        kind: 'spiega',
        title: 'Dove siamo e dove andiamo',
        md: `Nel Modulo 5 abbiamo scritto il **problema elastico lineare**: un corpo fatto di un materiale descritto dal tensore di elasticità $\\mathbb A$, caricato da forze di volume e da forze sul contorno, vincolato su una parte del contorno. Lo abbiamo posto, ma non lo abbiamo risolto. Per un corpo di forma qualunque le equazioni sono troppe e troppo intrecciate fra loro: in generale non si sa scriverne la soluzione con carta e penna.

La strategia del capitolo 5 è allora scegliere un **caso speciale**, abbastanza semplice da risolvere esattamente e abbastanza utile da servire nella pratica: un cilindro molto allungato caricato solo alle estremità, cioè il modello tridimensionale di una trave. Per risolverlo useremo un procedimento furbo: **indovineremo** la forma della soluzione e poi controlleremo che soddisfi tutte le equazioni.

Questo procedimento ha senso solo se sappiamo che la soluzione è **una sola**: altrimenti potremmo aver trovato una soluzione qualsiasi, non quella vera. Questa lezione serve proprio a garantirlo, con il **teorema di unicità di Kirchhoff** (§5.1, Teo 5.1.1). Le tappe sono quattro: che cosa dice il teorema; perché lo spostamento è unico solo «a meno di un moto rigido»; la dimostrazione per assurdo; il ruolo della condizione $\\mathbb A\\in\\mathrm{Pos}^+$.`,
      },
      {
        id: 'l61-2',
        kind: 'spiega',
        title: 'Che cosa afferma il teorema',
        md: `Ricordiamo che cosa vuol dire «risolvere» il problema elastico: trovare una terna $\\{\\vet u,\\tens E,\\tens T\\}$, cioè un campo di spostamento $\\vet u$, un campo di deformazione $\\tens E$ e un campo di tensione $\\tens T$, che soddisfi tutte le equazioni (congruenza, equilibrio, legame costitutivo) e tutte le condizioni al contorno.

Il **teorema di Kirchhoff** (Teo 5.1.1) dice: se il materiale ha $\\mathbb A\\in\\mathrm{Pos}^+$ e se la soluzione esiste, allora è unica **a meno di uno spostamento rigido infinitesimo**. In formula, ogni soluzione ha la forma
$$\\{\\vet u+\\vet u^{r,\\infty},\\ \\tens E,\\ \\tens T\\}.$$

Leggiamo i simboli. $\\mathbb A\\in\\mathrm{Pos}^+$ significa che il tensore di elasticità è **definito positivo**: per ogni deformazione non nulla $\\tens E$ vale $\\mathbb A\\tens E\\cdot\\tens E>0$, cioè deformare il materiale costa sempre energia (Modulo 5). $\\vet u^{r,\\infty}$ è uno **spostamento rigido infinitesimo**, cioè una piccola traslazione più una piccola rotazione, che come sappiamo dal Modulo 2 non produce deformazione.

Nota la frase «se la soluzione esiste»: il teorema non dice che una soluzione c'è, dice che **non ce ne possono essere due diverse**.`,
      },
      {
        id: 'l61-3',
        kind: 'spiega',
        title: 'Perché lo spostamento non è unico del tutto',
        md: `Il teorema distingue: deformazione e tensione sono uniche, lo spostamento no. Perché questa differenza?

Prendi una soluzione e aggiungi allo spostamento un piccolo moto rigido. La deformazione di un moto rigido infinitesimo è nulla, quindi $\\tens E$ non cambia; se non cambia $\\tens E$, per il legame non cambia nemmeno $\\tens T$, e l'equilibrio resta soddisfatto. Abbiamo ottenuto una seconda terna che risolve le stesse equazioni: il moto rigido «non si vede» nelle equazioni.

L'esempio della dispensa è un **aereo in crociera**. È un problema nelle forze: ci sono solo carichi, nessun vincolo lo tiene fermo. Possiamo sapere esattamente come è deformato e quanto è sollecitato, ma non dove si trova: spostarlo rigidamente non cambia nulla.

Se invece il corpo è **sufficientemente vincolato**, i vincoli impediscono i moti rigidi e l'unicità diventa completa, anche per lo spostamento. È il caso di una trave appoggiata: la sua deformata è unica proprio perché la trave è vincolata (Oss., §5.1).`,
      },
      {
        id: 'l61-4',
        kind: 'domanda',
        q: { id: 'l61-q2', kind: 'vf', q: 'Per il teorema di Kirchhoff, anche lo spostamento di un corpo libero nello spazio (un aereo in volo) è determinato in modo unico.', answer: false, why: `È determinato solo a meno di uno spostamento rigido infinitesimo: aggiungere un piccolo moto rigido non cambia né $\\tens E$ né $\\tens T$, quindi le equazioni non lo possono «vedere» (Teo 5.1.1). Uno spostamento unico del tutto si ha solo se i vincoli impediscono i moti rigidi.` },
      },
      {
        id: 'l61-5',
        kind: 'spiega',
        title: 'Gli attrezzi che servono per dimostrarlo',
        md: `La dimostrazione usa tre risultati che conosci già. Conviene ripassarli prima, così durante la dimostrazione non dovrai tenere a mente nulla di nuovo.

1. **La sovrapposizione degli effetti** (Modulo 5). Il problema è lineare: se due terne risolvono il problema con certi dati, una loro combinazione, $\\alpha$ volte la prima più $\\beta$ volte la seconda, risolve il problema con i dati combinati allo stesso modo.
2. **Il teorema dei lavori virtuali** (TLV, Modulo 4). Se un sistema di forze e tensioni (FT) è **equilibrato** e un sistema di spostamenti e deformazioni (SD) è **congruente**, il lavoro esterno delle forze di FT sugli spostamenti di SD è uguale al lavoro interno $\\int_{\\mathcal B}\\tens T\\cdot\\tens E\\,dV$. Qui $\\tens T\\cdot\\tens E$ è il prodotto scalare fra tensori, cioè la somma dei prodotti delle componenti corrispondenti, $\\sum_{ij}T_{ij}E_{ij}$.
3. **La definita positività** di $\\mathbb A$, ricordata nel passo precedente.

Un avvertimento: si sovrappongono le **soluzioni**, non le **energie**. La dispensa lo ricorda subito (§5.1): l'energia $\\Phi=\\int_{\\mathcal B}\\varphi\\,dV$ è quadratica nella deformazione, quindi $\\Phi(\\tens E_1+\\tens E_2)\\ne\\Phi(\\tens E_1)+\\Phi(\\tens E_2)$.`,
      },
      {
        id: 'l61-6',
        kind: 'spiega',
        title: 'L’idea della dimostrazione',
        md: `La dimostrazione è **per assurdo**: supponiamo che esistano due soluzioni diverse con gli stessi dati e mostriamo che in realtà hanno la stessa deformazione e la stessa tensione.

Il filo è questo. Invece di confrontare direttamente le due soluzioni, guardiamo la loro **differenza**. Per la sovrapposizione la differenza è a sua volta una soluzione, ma di un problema molto particolare: quello in cui tutti i dati sono nulli, cioè un corpo senza carichi e con spostamenti imposti nulli. Intuitivamente un corpo così non dovrebbe essere deformato. Il TLV trasforma questa intuizione in un conto: dice che il lavoro interno della differenza è zero. La definita positività di $\\mathbb A$ chiude il ragionamento: un lavoro interno nullo è possibile solo se la deformazione è nulla ovunque.

Tieni a mente queste tre mosse (differenza, TLV, definita positività): sono anche la scaletta della risposta all'orale.`,
      },
      {
        id: 'l61-7',
        kind: 'derivazione',
        title: 'Dimostrazione per assurdo',
        md: `Vogliamo arrivare a $\\tens E_1=\\tens E_2$ e $\\tens T_1=\\tens T_2$ per due soluzioni qualsiasi con gli stessi dati. Strategia: la differenza delle due soluzioni risolve il problema a dati nulli; il TLV applicato alla differenza dice che il lavoro interno è nullo; la definita positività dice che allora la deformazione è nulla.`,
        source: D(5, '5.1', 'Teo 5.1.1', '99–100'),
        der: {
          lines: [
            {
              tex: '\\{\\tens E_1,\\tens T_1,\\vet u_1\\},\\quad\\{\\tens E_2,\\tens T_2,\\vet u_2\\}\\quad\\text{con gli stessi dati}',
              why: `Punto di partenza: supponiamo che esistano due soluzioni. «Stessi dati» vuol dire stesse forze di volume $\\vet b$, stesse forze $\\hat{\\vet s}$ sul contorno libero $\\partial\\mathcal B_\\ell$, stessi spostamenti imposti sul contorno vincolato $\\partial\\mathcal B_v$.`,
            },
            {
              tex: '\\{\\tens E,\\tens T,\\vet u\\}=\\{\\tens E_1-\\tens E_2,\\ \\tens T_1-\\tens T_2,\\ \\vet u_1-\\vet u_2\\}',
              why: `Definiamo il **problema differenza**. Per la sovrapposizione con $\\alpha=1$ e $\\beta=-1$, questa terna è una soluzione: soddisfa congruenza, equilibrio e legame, con dati uguali alla differenza dei dati.`,
              ask: { q: 'Quale problema risolve la differenza delle due soluzioni?', options: ['Il problema a dati nulli', 'Lo stesso problema, con gli stessi dati', 'Il problema con i dati raddoppiati', 'Nessun problema: la differenza non è una soluzione'], correct: 0, why: `Per la sovrapposizione la differenza risolve il problema con dati «primo meno secondo», e siccome i dati sono uguali la differenza dei dati è zero. Non è lo stesso problema (servirebbe $\\alpha+\\beta=1$) e la linearità garantisce che la differenza sia una soluzione.` },
            },
            {
              tex: '\\vet b=\\vet 0\\ \\text{in }\\mathcal B,\\qquad\\hat{\\vet s}=\\vet 0\\ \\text{su }\\partial\\mathcal B_\\ell,\\qquad\\vet u=\\vet 0\\ \\text{su }\\partial\\mathcal B_v',
              why: `Scriviamo esplicitamente che cosa vuol dire «dati nulli»: nessuna forza di volume, nessuna forza sul contorno libero, spostamento nullo dove il corpo è vincolato.`,
              aggiunto: true,
            },
            {
              tex: '\\underbrace{\\int_{\\partial\\mathcal B_\\ell}\\hat{\\vet s}\\cdot\\vet u}_{=0}+\\underbrace{\\int_{\\partial\\mathcal B_v}\\tens T\\hat n\\cdot\\vet u}_{=0}+\\underbrace{\\int_{\\mathcal B}\\vet b\\cdot\\vet u}_{=0}=\\int_{\\mathcal B}\\tens T\\cdot\\tens E',
              why: `Applichiamo il TLV al problema differenza, usando come FT la terna $\\{\\vet 0,\\vet 0,\\tens T\\}$ (forze di volume nulle, forze sul contorno nulle, tensione $\\tens T$ della differenza), che è equilibrata, e come SD la coppia $\\{\\vet u,\\tens E\\}$, che è congruente. A sinistra il lavoro esterno è diviso fra contorno libero, contorno vincolato (dove agisce la reazione $\\tens T\\hat n$) e volume.`,
              ask: { q: 'Perché i tre termini a sinistra sono nulli?', options: ['Perché nel problema differenza le forze assegnate e gli spostamenti imposti sono nulli', 'Perché il corpo è rigido', 'Perché $\\tens T$ è simmetrico', 'Perché $\\mathbb A\\in\\mathrm{Pos}^+$'], correct: 0, why: `Il primo e il terzo sono nulli perché $\\hat{\\vet s}=\\vet 0$ e $\\vet b=\\vet 0$; il secondo perché sul vincolo $\\vet u=\\vet 0$, anche se la reazione $\\tens T\\hat n$ non è nulla. La definita positività serve dopo, non qui; il corpo non è rigido, è proprio ciò che vogliamo dimostrare.` },
            },
            {
              tex: '\\int_{\\mathcal B}\\tens T\\cdot\\tens E\\,dV=0',
              why: `Il lavoro esterno è zero, quindi anche il lavoro interno, che il TLV gli rende uguale, è zero.`,
              aggiunto: true,
            },
            {
              tex: '\\int_{\\mathcal B}\\mathbb A\\tens E\\cdot\\tens E\\,dV=0',
              why: `Sostituiamo il legame $\\tens T=\\mathbb A\\tens E$, che vale anche per la differenza perché è lineare.`,
            },
            {
              tex: '\\tens E=\\tens O\\quad\\text{in }\\mathcal B',
              why: `Qui entra la definita positività: l'integrando $\\mathbb A\\tens E\\cdot\\tens E$ non è mai negativo ed è positivo dove $\\tens E\\ne\\tens O$. Se $\\tens E$ fosse diverso da zero in un punto, per la regolarità dei campi lo sarebbe in tutto un intorno, e l'integrale sarebbe positivo. Quindi $\\tens E$ è nullo ovunque.`,
            },
            {
              tex: '\\tens E_1=\\tens E_2',
              why: `Ricordando che $\\tens E=\\tens E_1-\\tens E_2$: le due deformazioni coincidono.`,
            },
            {
              tex: '\\tens T_1=\\mathbb A\\tens E_1=\\mathbb A\\tens E_2=\\tens T_2',
              why: `Le tensioni si ottengono dalle deformazioni con il legame: deformazioni uguali danno tensioni uguali.`,
            },
            {
              tex: '\\vet u_1=\\vet u_2+\\vet u^{r,\\infty}',
              why: `La differenza $\\vet u=\\vet u_1-\\vet u_2$ ha deformazione nulla, e uno spostamento con deformazione nulla è uno spostamento rigido infinitesimo (Modulo 2). È la tesi del teorema.`,
              eq: 'Teo 5.1.1',
            },
          ],
        },
      },
      {
        id: 'l61-8',
        kind: 'spiega',
        title: 'Che cosa abbiamo dimostrato e a che cosa servirà',
        md: `Rileggiamo il risultato a parole: **due soluzioni dello stesso problema elastico possono differire solo per un moto rigido infinitesimo**, che non deforma e non sollecita il corpo. Lo stato di deformazione e lo stato di tensione sono quindi determinati dai dati.

Controlliamolo sui due casi estremi. Per l'aereo in crociera, libero nello spazio, il moto rigido resta indeterminato: sappiamo come è deformato, non dove si trova. Per la trave appoggiata, invece, gli appoggi impongono spostamenti nulli in certi punti; un moto rigido che rispetti quei vincoli deve essere nullo, quindi la deformata è unica (deduzione: la dispensa lo afferma per l'esempio, senza svolgere il passaggio).

A che cosa servirà? Il teorema è il **fulcro del metodo semi-inverso** di Saint-Venant (§5.2.2): se indoviniamo una terna e verifichiamo che soddisfa tutte le equazioni, Kirchhoff ci garantisce che è **la** soluzione, non una fra tante. Senza questo teorema, indovinare non basterebbe.`,
      },
      {
        id: 'l61-9',
        kind: 'spiega',
        title: 'Perché serve proprio la definita positività',
        md: `Nella dimostrazione la condizione $\\mathbb A\\in\\mathrm{Pos}^+$ è servita in un punto solo, ma decisivo: il passaggio da «integrale nullo» a «deformazione nulla». Che cosa succederebbe senza?

Se esistesse una deformazione $\\tens E\\ne\\tens O$ con $\\mathbb A\\tens E\\cdot\\tens E=0$, il corpo potrebbe deformarsi in quel modo senza spendere energia, e l'integrale nullo non ci direbbe più nulla: la dimostrazione si fermerebbe lì (deduzione).

La dispensa sottolinea che la stessa condizione compare **tre volte** nel corso (Oss., §5.1):
- rende il legame **invertibile**, così che si può scrivere $\\tens E$ in funzione di $\\tens T$;
- traduce la **plausibilità fisica** del materiale: deformare costa lavoro;
- garantisce l'**unicità** di Kirchhoff.`,
      },
      {
        id: 'l61-10',
        kind: 'domanda',
        q: { id: 'l61-q1', kind: 'scelta', q: 'Nella dimostrazione di Kirchhoff, quale sistema FT si usa nel TLV?', options: ['$\\{\\vet 0,\\vet 0,\\tens T\\}$, con $\\tens T$ tensione del problema differenza', 'I carichi del problema originale con $\\tens T_1$', 'Un FT qualsiasi, purché equilibrato', 'Nessuno: si usa solo la congruenza'], correct: 0, why: `Il problema differenza ha dati nulli, quindi le forze di volume e sul contorno sono nulle e il sistema $\\{\\vet 0,\\vet 0,\\tens T\\}$ è equilibrato (§5.1). Usare i carichi originali non darebbe lavoro esterno nullo; un FT qualsiasi non sarebbe legato alla stessa $\\tens E$.` },
      },
      {
        id: 'l61-11',
        kind: 'spiega',
        title: 'Attenzione a…',
        md: `Quattro errori ricorrono all'orale su questo teorema.

1. **Dire che anche lo spostamento è sempre unico.** È unico solo a meno di un moto rigido infinitesimo; lo diventa del tutto se i vincoli impediscono i moti rigidi. L'errore è tentante perché nei problemi di travi vincolate la deformata è unica, ma è merito dei vincoli, non del teorema.
2. **Dimenticare il ruolo di $\\mathbb A\\in\\mathrm{Pos}^+$ nel passo finale.** Senza la definita positività l'integrale nullo non implica $\\tens E=\\tens O$.
3. **Usare nel TLV un FT non equilibrato.** Il TLV vale solo per FT equilibrati; quello giusto è $\\{\\vet 0,\\vet 0,\\tens T\\}$, che è equilibrato proprio perché il problema differenza ha dati nulli.
4. **Credere che il teorema garantisca l'esistenza della soluzione.** Dice soltanto che, se una soluzione c'è, è unica.`,
      },
      {
        id: 'l61-12',
        kind: 'domanda',
        q: { id: 'l61-q3', kind: 'scelta', q: 'Che cosa NON garantisce il teorema di Kirchhoff?', options: ['Che la soluzione esista', 'Che la tensione sia unica', 'Che la deformazione sia unica', 'Che due spostamenti soluzione differiscano al più per un moto rigido infinitesimo'], correct: 0, why: `L'enunciato comincia con «se la soluzione esiste»: l'esistenza è un'altra questione. Le altre tre affermazioni sono proprio la tesi del Teo 5.1.1.` },
      },
      {
        id: 'l61-13',
        kind: 'riassunto',
        md: `**Il filo della lezione.** Il problema elastico generale è troppo difficile, quindi risolveremo un caso speciale indovinando la forma della soluzione; per fidarci del risultato serve sapere che la soluzione è unica. Il teorema di Kirchhoff lo garantisce per materiali con $\\mathbb A\\in\\mathrm{Pos}^+$: deformazione e tensione sono uniche, lo spostamento lo è a meno di un moto rigido infinitesimo, che le equazioni non possono vedere. La dimostrazione considera la differenza di due soluzioni, che risolve il problema a dati nulli; il TLV dice che il suo lavoro interno è nullo e la definita positività che allora la sua deformazione è nulla.

- Struttura della soluzione: $\\{\\vet u+\\vet u^{r,\\infty},\\ \\tens E,\\ \\tens T\\}$ (Teo 5.1.1).
- Passo chiave: $\\int_{\\mathcal B}\\mathbb A\\tens E\\cdot\\tens E\\,dV=0\\ \\Rightarrow\\ \\tens E=\\tens O$ (Teo 5.1.1).
- Ingredienti: sovrapposizione ($\\alpha=1$, $\\beta=-1$), TLV con FT $=\\{\\vet 0,\\vet 0,\\tens T\\}$, definita positività.`,
        orale: ['Enunciare e dimostrare Kirchhoff; ruolo di $\\mathbb A\\in\\mathrm{Pos}^+$. (dispensa, domanda 1)'],
      },
    ],
  },
  // ================================================================== c6.2
  {
    concept: 'c6.2',
    title: 'Il problema di Saint-Venant e il metodo semi-inverso',
    minutes: 32,
    source: D(5, '5.2.1–5.2.4', 'Def 5.2.1', '100–104'),
    visual: BEAM('fibre', { sections: ['rettangolo', 'doppioT', 'cerchio'], controls: ['section'] }),
    steps: [
      {
        id: 'l62-1',
        kind: 'spiega',
        title: 'Dove siamo e dove andiamo',
        md: `Nella lezione precedente abbiamo dimostrato il teorema di Kirchhoff: se troviamo una terna $\\{\\vet u,\\tens E,\\tens T\\}$ che soddisfa tutte le equazioni del problema elastico, quella è **la** soluzione, a meno di un moto rigido. Ora lo mettiamo al lavoro.

Il problema elastico per un corpo qualunque è troppo difficile, quindi scegliamo un corpo speciale: un cilindro lungo e sottile, caricato solo alle estremità. È il **problema di Saint-Venant** (1855), uno dei pochi problemi elastici di cui si conosce la soluzione, ed è il modello tridimensionale delle travi, per esempio delle aste di una travatura reticolare.

Le tappe della lezione sono cinque: definiamo il solido e scriviamo le sue equazioni; capiamo che cosa vuol dire risolverlo con il **metodo semi-inverso**; formuliamo l'**ipotesi di Saint-Venant**, che è il «tentativo» da cui si parte; vediamo che cosa resta delle equazioni con questa ipotesi; infine classifichiamo lo stato di tensione che ne viene fuori.`,
      },
      {
        id: 'l62-2',
        kind: 'spiega',
        title: 'Il solido di Saint-Venant',
        md: `La **Def 5.2.1** chiede molte cose insieme. Vediamole una per una, ciascuna con il suo motivo.

- **Solido cilindrico retto molto allungato**: una sezione $A$ qualsiasi, traslata lungo un asse per una lunghezza $L$, con il diametro della sezione molto minore di $L$. È la forma di una trave.
- **Sezione semplicemente connessa**: senza buchi. Servirà per la congruenza.
- **Materiale elastico lineare, omogeneo e isotropo**: le costanti $E$ (modulo di Young), $G$ (modulo di taglio) e $\\nu$ (coefficiente di Poisson) sono le stesse in ogni punto e in ogni direzione.
- **Forze di volume nulle**, $\\vet b=\\vet 0$.
- **Mantello scarico**: la superficie laterale del cilindro non è caricata.
- **Forze arbitrarie sulle basi**: $\\hat{\\vet s}^-$ sulla base di sinistra e $\\hat{\\vet s}^+$ su quella di destra.

Non ci sono vincoli: è un problema **nelle forze**, come l'aereo in crociera. La dispensa precisa che questo solido **non è una trave**, ma che le sue soluzioni servono per le travi.`,
      },
      {
        id: 'l62-3',
        kind: 'spiega',
        title: 'Il riferimento e le equazioni di campo',
        md: `Fissiamo il riferimento come la dispensa: origine nel baricentro della base di sinistra, asse $z$ lungo l'asse del solido (la base di sinistra è $z=0$, quella di destra $z=L$), assi $x$ e $y$ nel piano della sezione, scelti come **assi principali centrali d'inerzia** (li studieremo nella lezione c6.5). Le componenti dello spostamento si chiamano $u$, $v$, $w$.

Le **equazioni di campo** sono quelle del problema elastico (§5.2.1):
- **congruenza**: $E_{xx}=\\partial u/\\partial x$, …, $E_{xy}=\\frac12(\\partial u/\\partial y+\\partial v/\\partial x)$, …;
- **equilibrio**: $\\sum_j\\partial T_{ij}/\\partial x_j=0$, senza forze di volume;
- **simmetria** di $\\tens T$;
- **legame inverso** con i moduli tecnici: $E_{xx}=\\frac1E[T_{xx}-\\nu(T_{yy}+T_{zz})]$, …, $E_{xy}=T_{xy}/(2G)$, ….

In tutto sono 18 equazioni. Il conto torna con le incognite (deduzione): 3 componenti di spostamento, 6 di deformazione e 9 di tensione, contro 6 equazioni di congruenza, 3 di equilibrio, 3 di simmetria e 6 di legame.`,
      },
      {
        id: 'l62-4',
        kind: 'spiega',
        title: 'Le condizioni al contorno',
        md: `Alle equazioni di campo si aggiungono le condizioni al contorno, che dicono quali forze agiscono sulla superficie del solido.

Sul **mantello** la normale uscente è orizzontale, $\\hat n=(n_x,n_y,0)$, perché il cilindro è retto. Il mantello è scarico, quindi il vettore tensione $\\tens T\\hat n$ deve essere nullo. In componenti sono tre equazioni:
$$T_{xx}n_x+T_{xy}n_y=0,\\qquad T_{yx}n_x+T_{yy}n_y=0,\\qquad T_{zx}n_x+T_{zy}n_y=0.$$

Sulle **basi** la normale è l'asse $z$. Sulla base di destra la normale uscente è $\\hat e_z$ e si chiede $\\tens T\\hat e_z=\\hat{\\vet s}^+$; su quella di sinistra la normale uscente è $-\\hat e_z$ e si chiede $\\tens T(-\\hat e_z)=\\hat{\\vet s}^-$.

Risolvere il problema vuol dire trovare $\\vet u$, $\\tens E$, $\\tens T$ che soddisfino tutto questo insieme. Detto così sembra ancora un problema generale; il passo decisivo è il modo in cui lo affronteremo.`,
      },
      {
        id: 'l62-5',
        kind: 'domanda',
        q: { id: 'l62-q2', kind: 'scelta', q: 'Quale di queste NON è una richiesta della Def 5.2.1 per il solido di Saint-Venant?', options: ['Che sia vincolato su una base', 'Che il mantello sia scarico', 'Che il materiale sia omogeneo e isotropo', 'Che la sezione sia semplicemente connessa'], correct: 0, why: `Il solido di Saint-Venant non ha vincoli: è un problema nelle forze, con forze arbitrarie su entrambe le basi. Le altre tre richieste fanno parte della definizione (Def 5.2.1). Pensarlo incastrato è un errore comune perché lo si associa a una mensola.` },
      },
      {
        id: 'l62-6',
        kind: 'spiega',
        title: 'Diretto, inverso, semi-inverso',
        md: `Come si risolve un problema così? La dispensa (§5.2.2) distingue tre atteggiamenti.

Nel **problema diretto** si parte dai dati (forma, materiale, carichi) e si calcola la soluzione: è ciò che vorremmo fare, ma in generale non sappiamo farlo. Nel **problema inverso** si parte dagli effetti misurati e si risale al sistema che li ha prodotti: è l'identificazione strutturale.

Saint-Venant sta **in mezzo**, con il **metodo semi-inverso**. Il ragionamento ha tre tempi:
1. si **ipotizza** una parte della soluzione, guidati da un'interpretazione meccanica di come si comporta il solido;
2. si **ricava il resto** dalle equazioni;
3. si **verifica** che la terna ottenuta soddisfi tutte le equazioni di campo e al contorno.

Se la verifica riesce, il teorema di Kirchhoff garantisce che abbiamo trovato **la** soluzione esatta. L'ipotesi iniziale, quindi, non peggiora la qualità del risultato: o porta alla soluzione vera, o fallisce la verifica (§5.2.4).`,
      },
      {
        id: 'l62-7',
        kind: 'spiega',
        title: 'Il prezzo del metodo',
        md: `C'è però un prezzo, e conviene vederlo subito. Se ipotizziamo la forma della tensione dentro il solido, la stessa forma vale anche sulle basi, perché le basi fanno parte del solido. Allora non possiamo più imporre sulle basi una distribuzione di forze **qualsiasi**: possiamo imporre solo quelle compatibili con la forma ipotizzata.

La dispensa lo dice così: si perde l'**arbitrarietà del dato**, che si assegna solo «in media», attraverso le **caratteristiche della sollecitazione** (CdS: risultante e momento delle forze su una sezione). Il problema diventa una **forma indebolita** del problema originale. Che questa rinuncia sia accettabile lo garantisce il **postulato di Saint-Venant**: lontano dalle basi, il modo esatto in cui le forze sono distribuite non conta.

Caratteristiche della sollecitazione, problema indebolito e postulato sono l'argomento della prossima lezione. Qui ci concentriamo sull'ipotesi.`,
      },
      {
        id: 'l62-8',
        kind: 'spiega',
        title: 'L’ipotesi: un mazzo di spaghetti',
        md: `Qual è l'interpretazione meccanica da cui parte Saint-Venant? Immagina il solido come un **mazzo di spaghetti**: un fascio di fibre parallele all'asse $z$. L'**ipotesi di Saint-Venant** (§5.2.2) dice che il solido ha un comportamento **«a fibre»**: due fibre vicine si scambiano solo forze **parallele all'asse**, mai forze che le spingano l'una contro l'altra o le facciano scorrere di lato nel piano della sezione.

In formule, sono nulle tutte le componenti di tensione che agiscono fra fibre nel piano $xy$:
$$T_{xx}=T_{yy}=T_{xy}=T_{yx}\\equiv0\\quad\\forall(x,y,z).$$

Restano solo le componenti che hanno almeno un indice $z$, e la matrice della tensione diventa
$$[\\tens T]=\\begin{bmatrix}0&0&T_{xz}\\\\0&0&T_{yz}\\\\T_{zx}&T_{zy}&T_{zz}\\end{bmatrix}.$$
Nota che tutte le componenti superstiti si leggono sul vettore tensione della **sezione trasversale**, $\\tens T\\hat e_z=(T_{zx},T_{zy},T_{zz})$: basta studiare quello. La dispensa la chiama «analisi per sezioni trasversali».`,
      },
      {
        id: 'l62-9',
        kind: 'prova',
        title: 'Guarda le fibre e la sezione',
        md: 'Il modello mostra il solido come un fascio di fibre grigie parallele all’asse $z$, con una sezione $A_z$ evidenziata a metà lunghezza.',
        tasks: [
          'Individua le fibre grigie: l’ipotesi dice che fra due fibre vicine agiscono solo forze lungo il loro asse.',
          'Sulla sezione $A_z$ guarda le due frecce in un punto interno: $\\sigma_z$ lungo l’asse e $\\tau_z$ nel piano della sezione. Sono le sole componenti che restano.',
          'Guarda la freccia su un punto del bordo: la tangenziale è disegnata lungo il contorno. Lo dimostreremo fra poco.',
          'Cambia sezione (doppio T, cerchio): l’ipotesi non dipende dalla forma della sezione.',
        ],
        visual: BEAM('fibre', { sections: ['rettangolo', 'doppioT', 'cerchio'], controls: ['section'] }),
      },
      {
        id: 'l62-10',
        kind: 'domanda',
        q: { id: 'l62-q3', kind: 'scelta', q: 'Che cosa afferma l’ipotesi di Saint-Venant?', options: ['$T_{xx}=T_{yy}=T_{xy}\\equiv0$: le fibre si scambiano solo forze parallele all’asse', '$T_{zz}\\equiv0$: le fibre non sono né tese né compresse', '$T_{xz}=T_{yz}\\equiv0$: non ci sono tangenziali', '$\\tens T$ è sferico'], correct: 0, why: `L'ipotesi riguarda le forze fra fibre nel piano della sezione (§5.2.2). $T_{zz}$ è proprio la tensione delle fibre, che resta; le tangenziali $T_{xz}$, $T_{yz}$ restano anch'esse in generale e si annullano solo in alcuni casi (sforzo normale, flessione).` },
      },
      {
        id: 'l62-11',
        kind: 'spiega',
        title: 'Che cosa ci aspettiamo dall’equilibrio',
        md: `Ora inseriamo l'ipotesi nelle equazioni e guardiamo che cosa ne resta. Cominciamo dall'equilibrio, che coinvolge solo le tensioni.

Le tre equazioni di equilibrio, senza forze di volume, sono
$$\\frac{\\partial T_{xx}}{\\partial x}+\\frac{\\partial T_{xy}}{\\partial y}+\\frac{\\partial T_{xz}}{\\partial z}=0,$$
e le due analoghe per le righe $y$ e $z$. Siccome molte componenti sono nulle, ci aspettiamo che queste equazioni diventino molto semplici, e che ci dicano **come possono dipendere da $z$** le componenti superstiti. È esattamente ciò che succede: scopriremo che le tangenziali non cambiano lungo l'asse e che la tensione normale cambia al più linearmente.`,
      },
      {
        id: 'l62-12',
        kind: 'derivazione',
        title: 'Che cosa resta dell’equilibrio',
        md: `Vogliamo arrivare alla forma generale delle tre componenti superstiti, $T_{xz}$, $T_{yz}$ e $T_{zz}$. Strategia: le prime due equazioni di equilibrio contengono una sola componente non nulla ciascuna; la terza, derivata rispetto a $z$, ne lascia una sola.`,
        source: D(5, '5.2.3', '(⋆)', '103–104'),
        der: {
          lines: [
            {
              tex: '\\frac{\\partial T_{xz}}{\\partial z}=0',
              why: `Prima equazione di equilibrio: i termini $\\partial T_{xx}/\\partial x$ e $\\partial T_{xy}/\\partial y$ sono nulli per l'ipotesi, e resta solo l'ultimo.`,
            },
            {
              tex: 'T_{xz}=A(x,y)',
              why: `Una funzione con derivata nulla rispetto a $z$ non dipende da $z$: può dipendere solo da $x$ e $y$. La chiamiamo $A(x,y)$.`,
            },
            {
              tex: '\\frac{\\partial T_{yz}}{\\partial z}=0\\quad\\Rightarrow\\quad T_{yz}=B(x,y)',
              why: `Lo stesso ragionamento sulla seconda equazione, dove sono nulli $T_{yx}$ e $T_{yy}$.`,
            },
            {
              tex: '\\frac{\\partial T_{zx}}{\\partial x}+\\frac{\\partial T_{zy}}{\\partial y}+\\frac{\\partial T_{zz}}{\\partial z}=0',
              why: `Terza equazione di equilibrio: qui nessun termine è nullo a priori.`,
            },
            {
              tex: '\\frac{\\partial}{\\partial z}\\Big(\\frac{\\partial T_{zx}}{\\partial x}+\\frac{\\partial T_{zy}}{\\partial y}\\Big)+\\frac{\\partial^2T_{zz}}{\\partial z^2}=0',
              why: `Deriviamo tutta l'equazione rispetto a $z$. È lecito perché l'equazione vale in ogni punto, quindi vale anche la sua derivata.`,
              ask: { q: 'Come si fa sparire la parte con le tangenziali?', options: ['Derivando la terza equazione rispetto a $z$: per la simmetria $T_{zx}=A(x,y)$ e $T_{zy}=B(x,y)$ non dipendono da $z$', 'Integrando sulla sezione', 'Usando la condizione sul mantello', 'Usando il legame costitutivo'], correct: 0, why: `Per simmetria $T_{zx}=T_{xz}=A(x,y)$ e $T_{zy}=B(x,y)$: derivati rispetto a $z$ danno zero. Integrare sulla sezione darebbe una condizione sulle CdS, non sulla forma puntuale; mantello e legame non riguardano questa equazione.` },
              aggiunto: true,
            },
            {
              tex: '\\frac{\\partial^2T_{zz}}{\\partial z^2}=0',
              why: `Il primo gruppo di termini è nullo: $T_{zx}$ e $T_{zy}$ sono uguali per simmetria ad $A(x,y)$ e $B(x,y)$, che non dipendono da $z$, e scambiando l'ordine delle derivate la loro derivata rispetto a $z$ è zero.`,
            },
            {
              tex: 'T_{zz}=C(x,y)\\,z+D(x,y)',
              why: `Una funzione di $z$ con derivata seconda nulla è lineare in $z$: pendenza $C$ e termine noto $D$, che possono dipendere da $x$ e $y$. È la forma $(\\star)$ della dispensa.`,
              eq: '(⋆)',
            },
          ],
        },
      },
      {
        id: 'l62-13',
        kind: 'spiega',
        title: 'Come leggere la forma (⋆)',
        md: `Abbiamo ottenuto, solo dall'ipotesi e dall'equilibrio:
$$T_{xz}=A(x,y),\\qquad T_{yz}=B(x,y),\\qquad T_{zz}=C(x,y)\\,z+D(x,y).$$
A parole: **le tangenziali sono le stesse in ogni sezione**, e la **tensione normale varia al più linearmente lungo l'asse**. Le quattro funzioni $A$, $B$, $C$, $D$ restano da determinare.

Questo è il «telaio» comune a tutti i casi del problema. In ogni caso (sforzo normale, flessione, taglio, torsione) aggiungeremo un'ipotesi più specifica su $A$, $B$, $C$, $D$ e poi verificheremo. Per esempio, nello sforzo normale si sceglierà $A=B=C=0$ e $D$ costante, e verrà $D=N/A$ (lezione c6.4).

Nota che $C\\ne0$ vuol dire tensione normale che cambia da sezione a sezione: succederà nel taglio, dove il momento flettente varia lungo l'asse.`,
      },
      {
        id: 'l62-14',
        kind: 'derivazione',
        title: 'Che cosa resta sul mantello',
        md: `Vogliamo capire che cosa impone il mantello scarico alle tensioni superstiti. Strategia: scriviamo le tre condizioni al contorno e vediamo quali sono già soddisfatte dall'ipotesi.`,
        source: D(5, '5.2.3', undefined, '103–104'),
        der: {
          lines: [
            {
              tex: 'T_{xx}n_x+T_{xy}n_y=0,\\qquad T_{yx}n_x+T_{yy}n_y=0',
              why: `Le prime due condizioni sul mantello contengono solo componenti che l'ipotesi pone uguali a zero: sono soddisfatte automaticamente, $0=0$.`,
              aggiunto: true,
            },
            {
              tex: 'T_{zx}n_x+T_{zy}n_y=0',
              why: `Resta solo la terza, che coinvolge le tangenziali della sezione trasversale.`,
            },
            {
              tex: '\\boldsymbol\\tau_z\\cdot\\hat n=0',
              why: `Chiamiamo $\\boldsymbol\\tau_z=(T_{zx},T_{zy})$ la tangenziale sulla sezione: la condizione dice che il suo prodotto scalare con la normale al contorno è nullo, cioè che è ortogonale alla normale. **La tangenziale sul contorno della sezione è tangente al bordo.**`,
              ask: { q: 'Che cosa significa geometricamente $\\boldsymbol\\tau_z\\cdot\\hat n=0$ in un punto del bordo della sezione?', options: ['Che la tangenziale è tangente al contorno della sezione', 'Che la tangenziale è ortogonale al contorno', 'Che la tangenziale è nulla sul bordo', 'Che $\\sigma_z$ è nulla sul bordo'], correct: 0, why: `Un vettore ortogonale alla normale è tangente al contorno. Non deve essere nullo: può avere qualsiasi intensità purché sia diretto lungo il bordo. La condizione non dice nulla su $\\sigma_z$, che non compare.` },
              eq: '§5.2.3',
            },
          ],
        },
      },
      {
        id: 'l62-15',
        kind: 'spiega',
        title: 'Perché la tangenziale deve seguire il bordo',
        md: `C'è un modo fisico di capire questo risultato. Per la simmetria del tensore delle tensioni, una componente tangenziale sulla sezione che puntasse **fuori dal bordo** richiederebbe una componente uguale sul mantello, diretta lungo l'asse $z$. Ma il mantello è scarico: quella componente deve essere zero, e quindi anche la parte della tangenziale che punta fuori dal bordo (deduzione: è la simmetria $T_{zn}=T_{nz}$ letta sul bordo).

Questo risultato tornerà nel Modulo 7, quando studieremo il taglio e la torsione: sul bordo della sezione la tangenziale deve sempre essere diretta lungo il contorno.

Guarda il modello: la freccia sul punto del bordo è disegnata proprio lungo il lato della sezione.`,
      },
      {
        id: 'l62-16',
        kind: 'spiega',
        title: 'Che cosa resta di legame e congruenza',
        md: `Restano le equazioni che coinvolgono le deformazioni. Dal **legame inverso**, con $T_{xx}=T_{yy}=T_{xy}=0$, si ottiene (§5.2.3):
$$E_{xx}=E_{yy}=-\\frac\\nu E\\,T_{zz},\\qquad E_{zz}=\\frac1E\\,T_{zz},\\qquad E_{xy}=0,\\qquad E_{yz}=\\frac{T_{yz}}{2G},\\qquad E_{zx}=\\frac{T_{zx}}{2G}.$$
Leggile così: la fibra si allunga di $T_{zz}/E$ e, per l'effetto Poisson, si restringe lateralmente di $\\nu$ volte tanto; gli scorrimenti nel piano della sezione sono nulli; gli scorrimenti fra sezione e asse sono legati alle tangenziali.

Nella **congruenza** compare quindi una condizione in più: $E_{xy}=0$, cioè
$$\\frac{\\partial u}{\\partial y}+\\frac{\\partial v}{\\partial x}=0.$$
La useremo, insieme alle altre, quando integreremo gli spostamenti nei singoli casi.`,
      },
      {
        id: 'l62-17',
        kind: 'derivazione',
        title: 'Lo stato di tensione è biassiale',
        md: `Vogliamo classificare lo stato di tensione con gli invarianti (Modulo 3: $III\\ne0$ triassiale; $III=0$ e $II\\ne0$ biassiale). Strategia: calcolare $II$ come somma dei minori principali $2\\times2$ e $III$ come determinante. Il campione prende $T_{xz}$, $T_{yz}$, $T_{zz}$ a caso e calcola il secondo invariante con il motore.`,
        source: D(5, '5.2.3', undefined, 104),
        der: {
          sample,
          lines: [
            { tex: 'II', why: `Secondo invariante di $[\\tens T]$ con le sole componenti $T_{xz}$, $T_{yz}$, $T_{zz}$, calcolato dal motore.`, val: (v) => T.invariants([0, 0, v.Txz, 0, 0, v.Tyz, v.Txz, v.Tyz, v.Tzz])[1] },
            {
              tex: '=(0\\cdot0-0^2)+(0\\cdot T_{zz}-T_{xz}^2)+(0\\cdot T_{zz}-T_{yz}^2)',
              why: `$II$ è la somma dei tre minori principali $2\\times2$: quello delle righe e colonne $x,y$, quello di $x,z$ e quello di $y,z$. Il primo è nullo perché la parte $xy$ della matrice è tutta zero.`,
              val: (v) => 0 + (0 * v.Tzz - v.Txz ** 2) + (0 * v.Tzz - v.Tyz ** 2),
              aggiunto: true,
            },
            { tex: '=-(T_{xz}^2+T_{yz}^2)', why: `Sommando: $II$ è diverso da zero appena c'è una tangenziale sulla sezione.`, val: (v) => -(v.Txz ** 2 + v.Tyz ** 2), eq: '§5.2.3' },
          ],
          checks: [{ what: '$III=\\det[\\tens T]=0$', f: (v) => [T.det([0, 0, v.Txz, 0, 0, v.Tyz, v.Txz, v.Tyz, v.Tzz]), 0] }],
        },
      },
      {
        id: 'l62-18',
        kind: 'spiega',
        title: 'Lettura: biassiale, e che cosa si legge sulla sezione',
        md: `Il terzo invariante è nullo: $III=\\det[\\tens T]=0$, perché le prime due righe della matrice, $(0,0,T_{xz})$ e $(0,0,T_{yz})$, sono proporzionali (passaggio aggiunto). Una tensione principale è quindi zero. Con $II=-(T_{xz}^2+T_{yz}^2)\\ne0$ lo stato è **biassiale**; il primo invariante è $I=T_{zz}$ (§5.2.3).

Controlliamo un caso particolare (deduzione): se le tangenziali sono nulle, $II=0$ e lo stato diventa **monoassiale**, con la sola $T_{zz}$. È ciò che troveremo nello sforzo normale e nella flessione.

Sulla sezione trasversale si leggono due grandezze, che useremo sempre da qui in poi: la tensione normale $\\sigma_z=T_{zz}$ e il modulo della tangenziale $\\tau_z=\\sqrt{T_{zx}^2+T_{zy}^2}$.`,
      },
      {
        id: 'l62-19',
        kind: 'domanda',
        q: { id: 'l62-q1', kind: 'vf', q: 'Nel solido di Saint-Venant la tangenziale in un punto del bordo della sezione è ortogonale al contorno.', answer: false, why: `È tangente al contorno: $\\boldsymbol\\tau_z\\cdot\\hat n=0$, perché il mantello è scarico (§5.2.3). L'errore nasce dal confondere la normale al contorno con la direzione della tangenziale.` },
      },
      {
        id: 'l62-20',
        kind: 'spiega',
        title: 'Attenzione a…',
        md: `Tre errori tipici su questo argomento.

1. **Confondere il solido di Saint-Venant con una trave.** È un solido tridimensionale, studiato con le equazioni dell'elasticità; le travi sono modelli monodimensionali che ne usano le soluzioni. L'errore è tentante perché la forma è la stessa.
2. **Dimenticare che sul bordo della sezione la tangenziale è tangente al contorno.** È una conseguenza diretta del mantello scarico ed è essenziale per taglio e torsione.
3. **Pensare che il metodo semi-inverso dia una soluzione approssimata.** Si parte da un'ipotesi, ma se tutte le equazioni sono soddisfatte il teorema di Kirchhoff dice che la soluzione è quella esatta. L'unica rinuncia riguarda la distribuzione dei carichi sulle basi, non la qualità della soluzione.`,
      },
      {
        id: 'l62-21',
        kind: 'riassunto',
        md: `**Il filo della lezione.** Il problema di Saint-Venant riguarda un cilindro lungo, omogeneo e isotropo, senza vincoli e con il mantello scarico, caricato solo sulle basi. Lo si risolve con il metodo semi-inverso: si ipotizza parte della soluzione, si ricava il resto e si verifica; se tutto torna, per Kirchhoff è la soluzione esatta, ma i carichi sulle basi si possono assegnare solo in media. L'ipotesi di partenza è il comportamento a fibre: le fibre si scambiano solo forze parallele all'asse. L'equilibrio dice allora che le tangenziali non cambiano lungo l'asse e la tensione normale vi varia al più linearmente; il mantello scarico obbliga la tangenziale a seguire il bordo; lo stato di tensione è biassiale.

- Ipotesi di Saint-Venant: $T_{xx}=T_{yy}=T_{xy}\\equiv0$ (§5.2.2).
- Conseguenze dell'equilibrio: $T_{xz}=A(x,y)$, $T_{yz}=B(x,y)$, $T_{zz}=C(x,y)\\,z+D(x,y)$ ($\\star$, §5.2.3).
- Mantello scarico: $T_{zx}n_x+T_{zy}n_y=0\\iff\\boldsymbol\\tau_z\\cdot\\hat n=0$ (§5.2.3).
- Invarianti: $III=0$, $II=-(T_{xz}^2+T_{yz}^2)$, $I=T_{zz}$: stato biassiale (§5.2.3).`,
        orale: ['Definire il problema di S-V e scriverne le equazioni di campo e al contorno. (dispensa, domanda 2)', 'Ipotesi di S-V e conseguenze; metodo semi-inverso e perché funziona. (dispensa, domanda 3)'],
      },
    ],
  },
  // ================================================================== c6.3
  {
    concept: 'c6.3',
    title: 'Caratteristiche della sollecitazione e postulato di Saint-Venant',
    minutes: 30,
    source: D(5, '5.2.5–5.2.8', 'Def 5.2.2, Teo 5.2.3–5.2.4', '104–108'),
    visual: SVG('cds'),
    steps: [
      {
        id: 'l63-1',
        kind: 'spiega',
        title: 'Dove siamo e dove andiamo',
        md: `Nella lezione precedente abbiamo impostato il problema di Saint-Venant e formulato l'ipotesi a fibre. Abbiamo anche visto il prezzo del metodo semi-inverso: i carichi sulle basi non si possono più assegnare punto per punto, ma solo «in media».

Questa lezione chiarisce che cosa vuol dire «in media» e perché va bene. Le tappe sono quattro: l'**equilibrio globale**, cioè la condizione che i carichi sulle due basi devono rispettare; le **caratteristiche della sollecitazione** (CdS), cioè la risultante e il momento delle tensioni su una sezione; le **leggi con cui le CdS variano** lungo l'asse; infine il **problema indebolito** e il **postulato di Saint-Venant**, che giustifica la rinuncia al dato punto per punto e dice dove i risultati valgono.

Alla fine avrai il ponte fra il solido tridimensionale e la trave: le CdS che calcoli nei sistemi di travi sono proprio queste.`,
      },
      {
        id: 'l63-2',
        kind: 'spiega',
        title: 'I carichi devono farsi equilibrio da soli',
        md: `Il solido di Saint-Venant non ha vincoli. In un problema nelle forze nessun vincolo può fornire reazioni, quindi i carichi assegnati devono essere **in equilibrio fra loro**: in termini di forze e momenti, devono essere **equivalenti a zero**. È una condizione di compatibilità sul dato: se non è rispettata, il problema non ha soluzione (§5.2.5).

Per scriverla riduciamo le forze di ciascuna base al suo baricentro. Sulla base di sinistra, di baricentro $G_0$, la risultante e il momento risultante sono
$$\\vet R_0=\\int_{A_0}\\hat{\\vet s}^-dA,\\qquad\\vet M_0=\\int_{A_0}(X-G_0)\\wedge\\hat{\\vet s}^-dA,$$
dove $X-G_0$ è il vettore che va dal baricentro al punto $X$ in cui agisce la forza. Sulla base di destra, di baricentro $G_L$, si definiscono allo stesso modo $\\vet R_L$ e $\\vet M_L$.`,
      },
      {
        id: 'l63-3',
        kind: 'spiega',
        title: 'L’equazione (5.1)',
        md: `Ora imponiamo l'equilibrio di tutto il solido, prendendo i momenti rispetto a $G_0$:
$$\\vet R_0+\\vet R_L=\\vet 0,\\qquad\\vet M_0+\\vet M_L+L\\hat e_z\\wedge\\vet R_L=\\vet 0.\\tag{5.1}$$

La prima equazione dice che le due risultanti sono uguali e opposte. Nella seconda compare un termine in più, $L\\hat e_z\\wedge\\vet R_L$. Da dove viene? $\\vet M_L$ è il momento delle forze di destra rispetto a $G_L$, non rispetto a $G_0$. Per spostare il polo da $G_L$ a $G_0$ bisogna aggiungere il momento della risultante $\\vet R_L$ applicata in $G_L$, e il braccio è il vettore $G_L-G_0=L\\hat e_z$ (passaggio aggiunto: è la regola del trasporto dei momenti).

Terremo questa equazione da parte: fra poco la sottrarremo a un'altra equazione di equilibrio.`,
      },
      {
        id: 'l63-4',
        kind: 'spiega',
        title: 'Le caratteristiche della sollecitazione',
        md: `Tagliamo ora il solido con una sezione trasversale $A_z$, a distanza $z$ dalla base di sinistra, di baricentro $G_z$. Sulla faccia del tratto di sinistra che guarda verso destra, la normale uscente è $\\hat e_z$ e agisce il vettore tensione $\\vet t_{e_z}=\\tens T\\hat e_z$.

Le **caratteristiche della sollecitazione** (Def 5.2.2) sono la risultante e il momento risultante, rispetto a $G_z$, di queste tensioni:
$$\\vet R(z)=\\int_{A_z}\\vet t_{e_z}\\,dA,\\qquad\\vet M(z)=\\int_{A_z}(X-G_z)\\wedge\\vet t_{e_z}\\,dA.$$
Le loro componenti si prendono negli **assi principali centrali d'inerzia** $x$, $y$ e lungo $z$.

L'idea è riassumere un campo di tensioni, che varia da punto a punto della sezione, con sei numeri: tre componenti di forza e tre di momento. Sono le stesse grandezze che nella teoria delle travi chiami sforzo normale, taglio e momento.`,
      },
      {
        id: 'l63-5',
        kind: 'spiega',
        title: 'Le sei componenti, una per una',
        md: `Scriviamo le componenti. Nel riferimento scelto il braccio è $\\{X-G_z\\}=(x,y,0)$ e il vettore tensione è $\\vet t_{e_z}=(T_{zx},T_{zy},T_{zz})$. Il prodotto vettoriale $(x,y,0)\\wedge(T_{zx},T_{zy},T_{zz})$ ha componenti $(y\\,T_{zz},\\ -x\\,T_{zz},\\ x\\,T_{zy}-y\\,T_{zx})$ (passaggio aggiunto). Integrando sulla sezione:
$$T_x=\\int T_{zx}dA,\\quad T_y=\\int T_{zy}dA,\\quad N=\\int T_{zz}dA,$$
$$M_x=\\int T_{zz}\\,y\\,dA,\\quad M_y=-\\int T_{zz}\\,x\\,dA,\\quad M_z=\\int(T_{zy}x-T_{zx}y)\\,dA.$$

I nomi: $T_x$ e $T_y$ sono i **tagli**, $N$ lo **sforzo normale**, $M_x$ e $M_y$ i **momenti flettenti**, $M_z$ il **momento torcente**. Il segno meno di $M_y$ non è una convenzione arbitraria: viene dal prodotto vettoriale. Nota anche quale tensione genera che cosa: la $\\sigma_z=T_{zz}$ produce $N$, $M_x$, $M_y$; le tangenziali producono i tagli e il torcente.`,
      },
      {
        id: 'l63-6',
        kind: 'domanda',
        q: { id: 'l63-q2', kind: 'scelta', q: 'Su una sezione agisce solo la tensione normale $\\sigma_z=T_{zz}$, senza tangenziali. Quali CdS possono essere diverse da zero?', options: ['$N$, $M_x$, $M_y$', '$T_x$, $T_y$, $M_z$', 'Solo $N$', 'Tutte e sei'], correct: 0, why: `Nelle formule della Def 5.2.2, $N$, $M_x$ e $M_y$ contengono solo $T_{zz}$, mentre $T_x$, $T_y$ e $M_z$ contengono solo le tangenziali, che qui sono nulle. «Solo $N$» dimentica che una $\\sigma_z$ non uniforme dà anche momento.` },
      },
      {
        id: 'l63-7',
        kind: 'spiega',
        title: 'Come varieranno le CdS lungo l’asse?',
        md: `Sappiamo che cosa sono le CdS in una sezione; ora ci chiediamo **come cambiano spostando la sezione** lungo l'asse. La risposta viene dall'equilibrio, senza bisogno di conoscere le tensioni.

L'idea è questa. Consideriamo il tratto $\\mathcal B^-$ del solido compreso fra la base di sinistra e la sezione $A_z$. Su di esso agiscono solo due gruppi di forze: quelle della base di sinistra, riassunte da $\\vet R_0$ e $\\vet M_0$, e le tensioni sulla sezione $A_z$, riassunte da $\\vet R(z)$ e $\\vet M(z)$. Il mantello è scarico e non ci sono forze di volume. Imponendo l'equilibrio di $\\mathcal B^-$ e confrontandolo con l'equilibrio globale (5.1), $\\vet R_0$ e $\\vet M_0$ si eliminano e restano le CdS in funzione dei soli carichi della base di destra.`,
      },
      {
        id: 'l63-8',
        kind: 'derivazione',
        title: 'Leggi di variazione delle CdS',
        md: `Vogliamo esprimere $\\vet R(z)$ e $\\vet M(z)$ con i carichi della base di destra. Strategia: equilibrio del tratto $\\mathcal B^-$, poi sottrazione dell'equilibrio globale (5.1), infine le componenti. Il campione controlla la componente $x$ del momento con il prodotto vettoriale.`,
        source: D(5, '5.2.6', 'Teo 5.2.3', '105–106'),
        der: {
          sample,
          lines: [
            {
              tex: '\\vet R_0+\\vet R(z)=\\vet 0',
              why: `Equilibrio alla traslazione di $\\mathcal B^-$: la risultante delle forze sulla base di sinistra più quella delle tensioni sulla sezione $A_z$ deve essere nulla.`,
            },
            {
              tex: '\\vet M_0+\\vet M(z)+z\\hat e_z\\wedge\\vet R(z)=\\vet 0',
              why: `Equilibrio alla rotazione di $\\mathcal B^-$, con polo $G_0$. Come nella (5.1), $\\vet M(z)$ è calcolato rispetto a $G_z$, e per portarlo in $G_0$ si aggiunge il momento di $\\vet R(z)$ con braccio $G_z-G_0=z\\hat e_z$.`,
            },
            {
              tex: '\\vet R(z)=\\vet R_L',
              why: `Sottraiamo la prima equazione di (5.1), $\\vet R_0+\\vet R_L=\\vet 0$: $\\vet R_0$ si elimina.`,
            },
            {
              tex: '\\vet M(z)=\\vet M_L+(L-z)\\hat e_z\\wedge\\vet R_L',
              why: `Sottraiamo la seconda equazione di (5.1) e usiamo $\\vet R(z)=\\vet R_L$: $\\vet M_0$ si elimina, e i due termini di trasporto, con bracci $L$ e $z$, si combinano nel braccio $L-z$.`,
              ask: { q: 'Che cosa rappresenta il termine $(L-z)\\hat e_z\\wedge\\vet R_L$?', options: ['Il momento della risultante di destra trasportata dalla base di destra alla sezione $A_z$', 'Il momento torcente', 'Un errore di segno, si semplifica', 'Il momento delle forze di sinistra'], correct: 0, why: `La distanza fra $G_L$ e $G_z$ è $L-z$: il termine è il momento di trasporto di $\\vet R_L$ da $G_L$ a $G_z$. Ha componenti solo lungo $x$ e $y$, perché il prodotto vettoriale con $\\hat e_z$ non ha componente $z$: quindi non è torcente.` },
            },
            {
              tex: 'M_x(z)=\\big[\\vet M_L+(L-z)\\hat e_z\\wedge\\vet R_L\\big]_x',
              why: `Prendiamo la componente $x$, calcolata dal campione con il prodotto vettoriale.`,
              val: (v) => v.Mx + (v.L - v.z) * T.cross([0, 0, 1], [v.Tx, v.Ty, v.N])[0],
            },
            {
              tex: '=M_x+(L-z)(-T_y)',
              why: `Con $\\vet R_L=(T_x,T_y,N)$ il prodotto vettoriale vale $\\hat e_z\\wedge\\vet R_L=(-T_y,\\ T_x,\\ 0)$: la sua componente $x$ è $-T_y$. Qui, come fa la dispensa, togliamo il «cappuccio» ai carichi della base di destra e li scriviamo come le CdS.`,
              val: (v) => v.Mx + (v.L - v.z) * -v.Ty,
              aggiunto: true,
            },
            {
              tex: '=M_x-T_y(L-z)',
              why: `Riordinando. È la prima legge di variazione dei flettenti.`,
              val: (v) => S.cds(v.z, v.L, { Tx: v.Tx, Ty: v.Ty, N: v.N, Mx: v.Mx, My: v.My, Mz: 0 }).Mx,
              eq: 'Teo 5.2.3',
            },
            {
              tex: 'M_y(z)=M_y+T_x(L-z)',
              why: `Allo stesso modo dalla componente $y$, che vale $+T_x$. Le componenti di $\\vet R(z)$ e la componente $z$ del momento, cioè tagli, sforzo normale e torcente, restano uguali ai valori sulla base di destra.`,
              ask: { q: 'Quali CdS sono costanti lungo il solido?', options: ['$T_x$, $T_y$, $N$, $M_z$', 'Solo $N$', '$M_x$ e $M_y$', 'Nessuna'], correct: 0, why: `$\\vet R(z)=\\vet R_L$ rende costanti tagli e sforzo normale; il termine di trasporto non ha componente $z$, quindi anche $M_z$ è costante. Solo i flettenti cambiano, al più linearmente (Teo 5.2.3).` },
            },
          ],
        },
      },
      {
        id: 'l63-9',
        kind: 'spiega',
        title: 'Lettura delle leggi di variazione',
        md: `Il **Teo 5.2.3** riassume il risultato:
$$T_x(z)\\equiv T_x,\\quad T_y(z)\\equiv T_y,\\quad N(z)\\equiv N,\\quad M_z(z)\\equiv M_z;\\qquad M_x(z)=M_x-T_y(L-z),\\quad M_y(z)=M_y+T_x(L-z).$$
A parole: **tagli, sforzo normale e momento torcente sono costanti; i momenti flettenti variano al più linearmente**, e variano solo se c'è un taglio.

Controlliamolo su due casi. Sulla base di destra, $z=L$, il termine $(L-z)$ si annulla e ritroviamo $M_x(L)=M_x$, il valore assegnato: torna. Se il taglio è nullo, i flettenti sono costanti: è ciò che accadrà nella flessione semplice, dove il solido è caricato da sole coppie.

La lettura fisica è quella di una mensola caricata all'estremo (deduzione): il taglio è lo stesso ovunque, e il momento cresce con la distanza dal punto di applicazione del carico.`,
      },
      {
        id: 'l63-10',
        kind: 'prova',
        title: 'Le CdS lungo il solido',
        md: 'Il diagramma mostra $N(z)$, $T_y(z)$ e $M_x(z)$ lungo il solido; con i cursori assegni i carichi sulla base di destra.',
        tasks: [
          'Assegna solo il taglio $\\hat T_y$: il diagramma di $T_y$ è costante, quello di $M_x$ è una retta che vale zero sulla base di destra.',
          'Aggiungi $\\hat M_x$: il diagramma di $M_x$ trasla in blocco, senza cambiare pendenza. La pendenza dipende solo dal taglio.',
          'Cambia $\\hat N$: lo sforzo normale resta costante qualunque cosa tu faccia.',
        ],
        visual: SVG('cds'),
      },
      {
        id: 'l63-11',
        kind: 'domanda',
        q: { id: 'l63-q3', kind: 'vf', q: 'Se sulla base di destra agisce un taglio $T_y\\ne0$, il momento flettente $M_x$ è comunque costante lungo il solido.', answer: false, why: `Varia linearmente: $M_x(z)=M_x-T_y(L-z)$ (Teo 5.2.3). L'errore viene dal ricordare che «le CdS sono costanti», dimenticando l'eccezione dei flettenti in presenza di taglio.` },
      },
      {
        id: 'l63-12',
        kind: 'spiega',
        title: 'Il problema indebolito: dato forte e dato debole',
        md: `Torniamo al prezzo del metodo semi-inverso. L'ipotesi vincola la forma delle tensioni in tutto il solido, quindi anche sulle basi. Per esempio, se ipotizziamo $T_{zz}$ uniforme sulla sezione, sulla base di destra $T_{zz}$ sarà uniforme, e non potremo imporre che le forze vere siano concentrate al centro (esempio aggiunto).

La dispensa (§5.2.7) distingue allora due modi di assegnare il carico sulla base.
- **Dato forte**, cioè puntuale: in ogni punto della base si impone $T_{zx}=\\hat s^+_x$, $T_{zy}=\\hat s^+_y$, $T_{zz}=\\hat s^+_z$. È ciò che chiederebbe il problema originale, e la congettura in generale non lo permette.
- **Dato debole**, cioè integrale, «in media»: si impone solo che gli integrali coincidano, per esempio $\\int_{A_L}T_{zz}dA=\\int_{A_L}\\hat s^+_zdA$, cioè $N=\\hat N$. In pratica si assegnano le sole CdS.

Il problema con il dato debole si chiama **problema indebolito**.`,
      },
      {
        id: 'l63-13',
        kind: 'spiega',
        title: 'Tre conseguenze del dato debole',
        md: `Assegnare il carico in forma debole ha tre conseguenze, che la dispensa elenca (§5.2.7).

1. **Si assegna una classe di dati.** Infinite distribuzioni diverse hanno lo stesso integrale: tutte quelle **staticamente equivalenti**, cioè con la stessa risultante e lo stesso momento. Il problema indebolito le tratta tutte allo stesso modo.
2. **Back analysis.** Risolto il problema, dal campo di tensione trovato in $z=L$ si ricava a posteriori quale distribuzione di forze sulla base corrisponde davvero alla soluzione.
3. **Basta assegnare una base**, quella di destra. Le CdS della base di sinistra sono infatti fissate dall'equilibrio globale (5.1) (deduzione).

Rimane una domanda: la soluzione del problema indebolito vale anche per il problema vero, in cui le forze sulle basi sono distribuite in un modo preciso? Risponde il postulato di Saint-Venant.`,
      },
      {
        id: 'l63-14',
        kind: 'domanda',
        q: { id: 'l63-q4', kind: 'scelta', q: 'Che differenza c’è fra dato forte e dato debole sulle basi?', options: ['Il forte assegna le tensioni punto per punto, il debole solo le CdS', 'Il forte assegna le CdS, il debole le tensioni punto per punto', 'Il forte riguarda la base di destra, il debole quella di sinistra', 'Sono la stessa cosa scritta in due modi'], correct: 0, why: `Il dato debole è integrale: per esempio $N=\\hat N$ invece di $T_{zz}=\\hat s^+_z$ in ogni punto (§5.2.7). Non sono equivalenti: lo stesso integrale corrisponde a infinite distribuzioni diverse.` },
      },
      {
        id: 'l63-15',
        kind: 'spiega',
        title: 'Il postulato di Saint-Venant',
        md: `Il **postulato di Saint-Venant** (Teo 5.2.4) afferma: soluzioni ottenute con distribuzioni di forze sulle basi **diverse ma staticamente equivalenti** sono **indistinguibili a sufficiente distanza dalle basi**.

La figura di p. 108 lo mostra con tre modi diversi di applicare lo stesso sforzo normale $N$: concentrato, uniforme, distribuito in modo irregolare. Vicino alla base le tensioni sono molto diverse; oltre una certa distanza $d$, detta **distanza di estinzione**, le tre soluzioni coincidono. La distanza di estinzione è legata ai **raggi d'inerzia** della sezione, cioè alle sue dimensioni trasversali: in un solido molto allungato è piccola rispetto a $L$.

Nato come postulato, l'enunciato è stato dimostrato nel 1960; la dispensa lo enuncia senza dimostrazione. È questo risultato che giustifica il problema indebolito: rinunciamo a descrivere bene solo una zona vicina alle basi.`,
      },
      {
        id: 'l63-16',
        kind: 'spiega',
        title: 'Dove vale: regioni B e regioni D',
        md: `La dispensa aggiunge due osservazioni pratiche (§5.2.8).

La prima: nei sistemi di travi si calcolano comunque **solo le CdS**, quindi rinunciare alla distribuzione esatta dei carichi vuol dire rinunciare a una cosa che non serve.

La seconda è un'immagine: il **telaio di una bicicletta**. In ogni sezione di un tubo si calcolano le CdS e si «apre il libro» di Saint-Venant con quelle CdS, cioè si usano le soluzioni che troveremo nelle prossime lezioni. Questo è lecito nelle **regioni B** (Beam, Bernoulli), i tratti regolari lontani dalle discontinuità. Non è lecito nelle **regioni D** (Discontinuity o Deviation): le estremità, i nodi dove si incontrano i tubi, i cambi di curvatura. Lì le tensioni dipendono dai dettagli e servono metodi numerici.`,
      },
      {
        id: 'l63-17',
        kind: 'domanda',
        q: { id: 'l63-q1', kind: 'scelta', q: 'Che cosa garantisce il postulato di Saint-Venant?', options: ['Che distribuzioni staticamente equivalenti danno soluzioni indistinguibili lontano dalle basi', 'Che la soluzione esiste', 'Che le sezioni restano piane', 'Che vale anche nei nodi di un telaio'], correct: 0, why: `Teo 5.2.4. L'esistenza non c'entra; la planarità delle sezioni sarà un risultato della flessione; nei nodi (regioni D) il postulato non si applica, perché sono vicini a discontinuità.` },
      },
      {
        id: 'l63-18',
        kind: 'spiega',
        title: 'Attenzione a…',
        md: `Tre errori tipici.

1. **Pensare che il momento flettente sia costante anche in presenza di taglio.** Varia linearmente, con pendenza pari al taglio: $M_x(z)=M_x-T_y(L-z)$. Solo tagli, sforzo normale e torcente sono costanti.
2. **Assegnare un dato puntuale sulle basi.** La congettura lo impedisce: si assegnano le CdS, cioè una classe di distribuzioni staticamente equivalenti.
3. **Credere che il postulato valga vicino alle basi o nei nodi.** Vale a distanza sufficiente dalle basi, nelle regioni B; nelle regioni D (estremità, nodi, cambi di curvatura) no.`,
      },
      {
        id: 'l63-19',
        kind: 'riassunto',
        md: `**Il filo della lezione.** Il solido non è vincolato, quindi i carichi sulle due basi devono equilibrarsi da soli: è l'equazione (5.1). Riassumiamo le tensioni su ogni sezione con le caratteristiche della sollecitazione, cioè risultante e momento rispetto al baricentro. L'equilibrio del tratto fra la base di sinistra e una sezione, confrontato con quello globale, mostra che tagli, sforzo normale e torcente sono costanti e i flettenti variano al più linearmente. Poiché l'ipotesi semi-inversa vincola le tensioni anche sulle basi, assegniamo solo le CdS (problema indebolito); il postulato di Saint-Venant garantisce che, lontano dalle basi, la distribuzione effettiva non conta, e questo rende i risultati validi nelle regioni B.

- Equilibrio globale: $\\vet R_0+\\vet R_L=\\vet 0$, $\\vet M_0+\\vet M_L+L\\hat e_z\\wedge\\vet R_L=\\vet 0$ (eq. 5.1).
- CdS: $N=\\int T_{zz}$, $T_x=\\int T_{zx}$, $T_y=\\int T_{zy}$, $M_x=\\int T_{zz}y$, $M_y=-\\int T_{zz}x$, $M_z=\\int(T_{zy}x-T_{zx}y)$ (Def 5.2.2).
- Leggi di variazione: $M_x(z)=M_x-T_y(L-z)$, $M_y(z)=M_y+T_x(L-z)$, le altre costanti (Teo 5.2.3).
- Postulato: distribuzioni staticamente equivalenti sono indistinguibili lontano dalle basi (Teo 5.2.4).`,
        orale: ['Equilibrio globale e leggi di variazione delle CdS. (dispensa, domanda 4)', 'Problema indebolito, postulato di S-V, regioni B e D. (dispensa, domanda 5)'],
      },
    ],
  },
  // ================================================================== c6.4
  {
    concept: 'c6.4',
    title: 'Lo sforzo normale',
    minutes: 34,
    source: D(5, '5.3–5.4', 'Def 5.4.1, Teo 5.4.2', '109–113'),
    visual: BEAM('normale', { controls: ['section', 'amp'] }),
    steps: [
      {
        id: 'l64-1',
        kind: 'spiega',
        title: 'Dove siamo e dove andiamo',
        md: `Nelle due lezioni precedenti abbiamo preparato il terreno: il solido di Saint-Venant, l'ipotesi a fibre, le caratteristiche della sollecitazione (CdS) e il postulato che ci permette di assegnare solo quelle. Da qui in poi risolviamo davvero il problema, un caso alla volta.

Questa lezione affronta il caso più semplice, lo **sforzo normale**: il solido tirato (o schiacciato) da due forze uguali e opposte lungo l'asse. È il caso che conosci dalla linea elastica estensionale delle travi, ma qui lo risolviamo in tre dimensioni.

È anche la prima volta che vediamo il metodo semi-inverso al lavoro dall'inizio alla fine, quindi segui con attenzione la ricetta, che si ripeterà identica nella flessione: **ipotesi** sulla forma della tensione, **equilibrio** (nel volume, sul mantello, sulle basi), **legame** per passare alle deformazioni, **congruenza** per trovare gli spostamenti, **verifica** finale. Poi leggeremo la soluzione: tensione, deformazione, volume ed energia.`,
      },
      {
        id: 'l64-2',
        kind: 'spiega',
        title: 'Quattro casi più uno',
        md: `Prima di cominciare, chiediamoci quanti casi dobbiamo risolvere. Le CdS sono sei: $N$, $T_x$, $T_y$, $M_x$, $M_y$, $M_z$. Il problema è lineare, quindi per la sovrapposizione basta risolvere ogni caso separatamente e poi sommare le soluzioni.

La dispensa (§5.3) raggruppa i casi in **quattro casi fondamentali**:
1. **sforzo normale**, con la sola $N$;
2. **flessione semplice**, con $M_x$ e $M_y$;
3. **flessione composta**, cioè il taglio $T_x$, $T_y$, che come abbiamo visto porta con sé un momento variabile lungo il solido;
4. **torsione**, con $M_z$.

I primi due producono solo la tensione normale $\\sigma_z=T_{zz}$; il terzo e il quarto producono anche le tangenziali $\\tau_{zx}$, $\\tau_{zy}$. C'è poi un **quinto caso derivato**, lo **sforzo normale eccentrico**: una forza lungo l'asse ma non applicata nel baricentro, che equivale a sforzo normale più flessione (lezione c6.8). In questo modulo studiamo i casi 1 e 2; taglio e torsione sono del Modulo 7.`,
      },
      {
        id: 'l64-3',
        kind: 'spiega',
        title: 'Che cosa intendiamo per sforzo normale',
        md: `La **Def 5.4.1** dice: le forze sulle basi sono **staticamente equivalenti** a due forze uguali e opposte di intensità $N$, dirette lungo l'asse e applicate nei baricentri delle basi. In altre parole, l'unica CdS non nulla è $N$.

Due precisazioni. La prima: il dato **non è** una forza concentrata nel baricentro. Una forza concentrata produrrebbe tensioni infinite nel punto di applicazione; ciò che conta, grazie al problema indebolito, è solo l'**equivalenza statica**: qualsiasi distribuzione con risultante $N$ lungo l'asse e momento nullo rispetto al baricentro.

La seconda riguarda i segni: i versi positivi delle CdS sono concordi agli assi sulla base di destra e opposti sulla base di sinistra. Quindi $N>0$ è **trazione** e $N<0$ è **compressione**.

Guarda il modello: le due frecce $N$ sono applicate ai centri delle basi e tirano il solido verso l'esterno.`,
      },
      {
        id: 'l64-4',
        kind: 'spiega',
        title: 'L’ipotesi: tutte le fibre tirate allo stesso modo',
        md: `Primo tempo del metodo semi-inverso: indovinare. Che forma ci aspettiamo per la tensione? Se il solido è tirato lungo l'asse e non c'è niente che lo pieghi o lo torca, è naturale pensare che **ogni fibra sia tirata allo stesso modo** e che non ci siano tangenziali.

La dispensa (§5.4.1) aggiunge quindi all'ipotesi di Saint-Venant una **congettura ulteriore**:
$$T_{xz}=T_{yz}\\equiv0,\\qquad T_{zz}=D\\ \\text{costante}.$$
Nella forma generale $(\\star)$ della lezione c6.2, $T_{xz}=A$, $T_{yz}=B$, $T_{zz}=Cz+D$, questo vuol dire scegliere $A=B=C=0$ e $D(x,y)=D$, un numero solo.

Ricorda il senso di questa mossa: non stiamo affermando che la soluzione è così; stiamo facendo un tentativo. Se tutte le equazioni risulteranno soddisfatte, il teorema di Kirchhoff ci dirà che il tentativo era giusto. Resta da trovare il valore di $D$.`,
      },
      {
        id: 'l64-5',
        kind: 'domanda',
        q: { id: 'l64-q2', kind: 'scelta', q: 'Nel metodo semi-inverso applicato allo sforzo normale, che cosa ci autorizza a dire che la soluzione trovata è quella vera?', options: ['Il teorema di Kirchhoff, una volta verificate tutte le equazioni', 'Il fatto che la congettura è fisicamente ragionevole', 'Il postulato di Saint-Venant', 'Nulla: la soluzione è approssimata'], correct: 0, why: `Una congettura ragionevole è solo un buon punto di partenza: diventa la soluzione quando si verifica che soddisfa tutte le equazioni, e allora Kirchhoff garantisce l'unicità. Il postulato riguarda invece la distribuzione dei carichi sulle basi, non la correttezza della soluzione del problema indebolito.` },
      },
      {
        id: 'l64-6',
        kind: 'derivazione',
        title: 'Equilibrio: nel volume, sul mantello, sulla base',
        md: `Vogliamo verificare l'equilibrio e trovare $D$. Strategia: l'equilibrio nel volume e sul mantello è già soddisfatto dalla forma $(\\star)$; restano le condizioni indebolite sulla base, cioè che le CdS calcolate con la tensione ipotizzata siano quelle assegnate.`,
        source: D(5, '5.4.2', undefined, '110–111'),
        der: {
          lines: [
            {
              tex: '\\text{campo e mantello: soddisfatti}',
              why: `La congettura è un caso particolare della forma $(\\star)$, che abbiamo ricavato proprio dalle equazioni di equilibrio; sul mantello resta $T_{zx}n_x+T_{zy}n_y=0$, vero perché le tangenziali sono nulle.`,
            },
            {
              tex: 'N=\\int_AT_{zz}\\,dA=\\int_AD\\,dA=DA',
              why: `Prima condizione sulla base: lo sforzo normale calcolato con la tensione ipotizzata deve essere $N$. Siccome $D$ è costante esce dall'integrale, e $\\int_AdA$ è l'area $A$ della sezione.`,
            },
            {
              tex: 'D=\\frac NA',
              why: `Dividendo per l'area: la tensione normale è lo sforzo normale diviso l'area.`,
              eq: '§5.4.2',
            },
            {
              tex: 'M_x=\\int_AD\\,y\\,dA=D\\,S_x=0,\\qquad M_y=-\\int_AD\\,x\\,dA=-D\\,S_y=0',
              why: `Le CdS flettenti devono essere nulle, e lo sono: $\\int y\\,dA=S_x$ e $\\int x\\,dA=S_y$ sono i momenti statici della sezione, nulli perché gli assi passano per il baricentro (teorema di Varignon).`,
              ask: { q: 'Perché i momenti flettenti risultano nulli?', options: ['Perché gli assi sono baricentrici: $S_x=S_y=0$', 'Perché $D=0$', 'Perché la sezione è simmetrica', 'Perché il mantello è scarico'], correct: 0, why: `Il baricentro è proprio il punto rispetto al quale i momenti statici si annullano (§5.4.2). Non serve alcuna simmetria della sezione, e $D=N/A$ non è nullo.` },
            },
            {
              tex: 'T_x=T_y=M_z=0',
              why: `Tagli e momento torcente contengono solo le tangenziali, che la congettura pone nulle: anche queste CdS sono quelle assegnate. L'equilibrio è soddisfatto in tutto.`,
            },
          ],
        },
      },
      {
        id: 'l64-7',
        kind: 'derivazione',
        title: 'Dalla tensione alle deformazioni',
        md: `Vogliamo le deformazioni prodotte da $[\\tens T]=\\operatorname{diag}(0,0,N/A)$. Strategia: inserire la tensione nel legame inverso con i moduli tecnici. Il campione deriva numericamente lo spostamento della soluzione in un punto a caso e controlla che dia proprio queste deformazioni.`,
        source: D(5, '5.4.3–5.4.4', 'Teo 5.4.2', '111–112'),
        der: {
          sample,
          lines: [
            { tex: 'E_{xx}=\\frac{\\partial u}{\\partial x}', why: `Definizione della dilatazione lungo $x$; il valore è la derivata numerica dello spostamento della soluzione, calcolata dal motore.`, val: (v) => strain(v, { N: v.N, Mx: 0, My: 0 }).xx },
            {
              tex: '=\\frac1E\\big[T_{xx}-\\nu(T_{yy}+T_{zz})\\big]',
              why: `Legame inverso con i moduli tecnici: la dilatazione lungo $x$ dipende dalla tensione lungo $x$ e, tramite il coefficiente di Poisson, dalle tensioni nelle altre due direzioni.`,
              val: (v) => (1 / v.E) * (0 - v.nu * (0 + v.N / sec(v).A)),
              aggiunto: true,
            },
            {
              tex: '=-\\frac{\\nu N}{EA}',
              why: `Con $T_{xx}=T_{yy}=0$ e $T_{zz}=N/A$. Allo stesso modo $\\partial v/\\partial y=-\\frac{\\nu N}{EA}$ e $\\partial w/\\partial z=\\frac N{EA}$; gli scorrimenti sono nulli perché non ci sono tangenziali.`,
              val: (v) => (-v.nu * v.N) / (v.E * sec(v).A),
              eq: 'Teo 5.4.2',
            },
          ],
          checks: [
            { what: '$E_{zz}=N/(EA)$', f: (v) => [strain(v, { N: v.N, Mx: 0, My: 0 }).zz, v.N / (v.E * sec(v).A)] },
            { what: 'scorrimento $E_{yz}=0$', f: (v) => [strain(v, { N: v.N, Mx: 0, My: 0 }).yz, 0] },
          ],
        },
      },
      {
        id: 'l64-8',
        kind: 'spiega',
        title: 'Come si trovano gli spostamenti',
        md: `Conosciamo le deformazioni; ora cerchiamo gli spostamenti $u$, $v$, $w$ che le producono. È il passo della **congruenza**.

L'idea è integrare. Le dilatazioni sono derivate parziali: per esempio $E_{xx}=\\partial u/\\partial x$. Integrando rispetto a $x$ si trova $u$, ma solo a meno di una «costante» d'integrazione che non dipende da $x$: può dipendere dalle altre due variabili, $y$ e $z$. Avremo quindi tre funzioni incognite, $\\bar u(y,z)$, $\\bar v(x,z)$, $\\bar w(x,y)$.

Poi bisogna controllare gli scorrimenti, che devono essere nulli. Scopriremo che queste tre funzioni formano uno spostamento senza deformazione, cioè uno spostamento rigido infinitesimo: esattamente la parte che Kirchhoff lascia indeterminata.`,
      },
      {
        id: 'l64-9',
        kind: 'derivazione',
        title: 'Congruenza: integrare gli spostamenti',
        md: `Vogliamo il campo di spostamento completo. Strategia: integrare le tre dilatazioni, ciascuna rispetto alla propria variabile, e poi usare gli scorrimenti nulli per capire che cosa sono le funzioni d'integrazione.`,
        source: D(5, '5.4.3', 'Teo 5.4.2', '111'),
        der: {
          lines: [
            {
              tex: '\\frac{\\partial u}{\\partial x}=-\\frac{\\nu N}{EA},\\qquad\\frac{\\partial v}{\\partial y}=-\\frac{\\nu N}{EA},\\qquad\\frac{\\partial w}{\\partial z}=\\frac N{EA}',
              why: `Le tre dilatazioni trovate al passo precedente, scritte come derivate degli spostamenti.`,
            },
            {
              tex: 'u=-\\frac{\\nu N}{EA}x+\\bar u(y,z)',
              why: `Integriamo la prima rispetto a $x$: la derivata è costante, quindi $u$ è lineare in $x$, più una funzione che non dipende da $x$.`,
            },
            {
              tex: 'v=-\\frac{\\nu N}{EA}y+\\bar v(x,z),\\qquad w=\\frac N{EA}z+\\bar w(x,y)',
              why: `Lo stesso per le altre due, ciascuna rispetto alla propria variabile.`,
            },
            {
              tex: '\\bar E_{xx}=\\frac{\\partial\\bar u}{\\partial x}=0,\\quad\\bar E_{yy}=0,\\quad\\bar E_{zz}=0',
              why: `Guardiamo la deformazione $\\bar{\\tens E}$ del solo campo $\\bar{\\vet u}=(\\bar u,\\bar v,\\bar w)$. I termini diagonali sono nulli perché ogni funzione d'integrazione non dipende dalla variabile rispetto a cui la deriviamo.`,
            },
            {
              tex: '\\bar E_{xy}=E_{xy}=0,\\quad\\bar E_{yz}=E_{yz}=0,\\quad\\bar E_{zx}=E_{zx}=0',
              why: `I termini fuori diagonale: le parti lineari $-\\frac{\\nu N}{EA}x$, … non contribuiscono agli scorrimenti, perché $x$ derivato rispetto a $y$ dà zero. Quindi gli scorrimenti di $\\bar{\\vet u}$ sono quelli di tutto il campo, che il legame vuole nulli.`,
              ask: { q: 'Che cosa concludiamo da $\\bar{\\tens E}=\\tens O$?', options: ['Che $\\bar{\\vet u}$ è uno spostamento rigido infinitesimo', 'Che $\\bar{\\vet u}$ è nullo', 'Che la soluzione non esiste', 'Che $N=0$'], correct: 0, why: `Un campo di spostamento con deformazione nulla è rigido infinitesimo (Modulo 2), non necessariamente nullo: è proprio il moto rigido che Kirchhoff lascia indeterminato in un problema nelle forze.` },
            },
            {
              tex: '\\{\\vet u\\}=\\Big(-\\frac{\\nu N}{EA}x,\\,-\\frac{\\nu N}{EA}y,\\,\\frac N{EA}z\\Big)+\\vet u^{r,\\infty}',
              why: `$\\bar{\\vet u}$ è quindi uno spostamento rigido infinitesimo, e il campo è determinato. La congruenza è soddisfatta: abbiamo trovato uno spostamento che produce proprio le deformazioni richieste.`,
              eq: 'Teo 5.4.2',
            },
          ],
        },
      },
      {
        id: 'l64-10',
        kind: 'spiega',
        title: 'La soluzione completa e perché è quella vera',
        md: `Abbiamo verificato equilibrio, legame e congruenza: la congettura funziona. Il **Teo 5.4.2** raccoglie la soluzione:
$$\\{\\vet u\\}=\\Big(-\\frac{\\nu N}{EA}x,\\,-\\frac{\\nu N}{EA}y,\\,\\frac N{EA}z\\Big)+\\vet u^{r,\\infty},\\quad[\\tens E]=\\operatorname{diag}\\Big(-\\frac{\\nu N}{EA},-\\frac{\\nu N}{EA},\\frac N{EA}\\Big),\\quad[\\tens T]=\\operatorname{diag}\\Big(0,0,\\frac NA\\Big).$$
Per il teorema di Kirchhoff è **la** soluzione del problema indebolito, a meno del moto rigido.

Leggiamola sul caso particolare $\\nu=0$, un materiale senza effetto Poisson (deduzione): $u$ e $v$ si annullano, e resta solo $w=\\frac N{EA}z$. Il solido si allunga senza restringersi, come ci si aspetta. Con $\\nu>0$, invece, l'allungamento lungo $z$ si accompagna a una contrazione nel piano della sezione.

La dispensa osserva che questa soluzione **generalizza** la linea elastica estensionale delle travi a una soluzione tridimensionale.`,
      },
      {
        id: 'l64-11',
        kind: 'spiega',
        title: 'Lo stato di tensione',
        md: `Cominciamo la lettura dalla tensione. $\\sigma_z=N/A$ è **uniforme**, la stessa in ogni punto, e lo stato è **monoassiale**: c'è una sola tensione principale non nulla, $s_1=N/A$ se $N>0$ oppure $s_3=N/A$ se $N<0$. Il riferimento $x,y,z$ è principale di tensione e, per la coassialità dei materiali isotropi, anche di deformazione.

Quali piani sono scarichi? Tutti quelli del **fascio di piani** che contengono una retta parallela a $z$ passante per il punto: su di essi il vettore tensione è nullo. Sono infiniti, uno per ogni angolo ($\\infty^1$).

Attenzione: sulla sezione trasversale non ci sono tangenziali, ma **su altre giaciture sì**. Il cerchio di Mohr dello stato monoassiale (figura di p. 112) ha centro in $N/(2A)$ e raggio $N/(2A)$; la tangenziale massima vale
$$\\tau_{\\max}=\\frac N{2A}$$
e agisce sui piani inclinati di 45° rispetto all'asse.`,
      },
      {
        id: 'l64-12',
        kind: 'domanda',
        q: { id: 'l64-q1', kind: 'scelta', q: 'Quanto vale la tangenziale massima nello sforzo normale?', options: ['$N/(2A)$, sui piani a 45° dall’asse', '0 su ogni giacitura', '$N/A$, sulla sezione trasversale', '$2N/A$'], correct: 0, why: `Il raggio del cerchio di Mohr dello stato monoassiale è $N/(2A)$ (§5.4.4). Rispondere «zero» confonde la sezione trasversale, dove le tangenziali mancano, con tutte le giaciture; sulla sezione la tensione $N/A$ è normale, non tangenziale.` },
      },
      {
        id: 'l64-13',
        kind: 'spiega',
        title: 'L’asse si allunga: rigidezza estensionale',
        md: `Passiamo alla deformazione, guardando prima l'**asse** del solido, cioè la retta $x=y=0$. Gli scorrimenti sono nulli e i punti dell'asse si spostano solo lungo $z$, di $w(z)=\\frac N{EA}z$.

L'allungamento totale è lo spostamento della base di destra, $z=L$, rispetto a quella di sinistra:
$$\\Delta L=\\frac{NL}{EA}=\\frac N{K_N},\\qquad K_N:=\\frac{EA}L\\ \\text{(rigidezza estensionale)}.$$
La **rigidezza estensionale** $K_N$ è la forza necessaria per un allungamento unitario: cresce con il modulo di Young $E$ e con l'area $A$, diminuisce con la lunghezza $L$.

Derivando $w$ rispetto a $z$ si ottiene $w'=\\frac N{EA}$, cioè
$$N=EA\\,w'.$$
È il **legame della linea elastica estensionale**. La dispensa osserva che la linea elastica delle travi è proprio la parte della soluzione tridimensionale che riguarda l'asse.`,
      },
      {
        id: 'l64-14',
        kind: 'spiega',
        title: 'La sezione resta piana e si contrae in modo omotetico',
        md: `Ora guardiamo la **sezione**. Nel suo piano, lo spostamento di un punto $(x,y)$ è $\\big(-\\frac{\\nu N}{EA}x,\\,-\\frac{\\nu N}{EA}y\\big)$: è diretto verso il baricentro (per $N>0$) e ha modulo $\\frac{\\nu N}{EA}r$, proporzionale alla distanza $r$ dal baricentro. Inoltre $v/u=y/x$: ogni punto si muove lungo la retta che lo congiunge al baricentro.

Questa è una deformazione **omotetica**: la sezione si rimpicciolisce mantenendo la sua forma, come una fotografia ridotta, per $N>0$ (si allarga per $N<0$). Il baricentro non si sposta.

Lungo $z$, invece, tutti i punti di una sezione traslano della stessa quantità $\\frac N{EA}z$: le sezioni **restano piane e ortogonali all'asse**. Un'avvertenza della dispensa: nella soluzione scritta la base di sinistra sembra ferma, ma questo vale solo per la parte di deformazione pura; il moto rigido $\\vet u^{r,\\infty}$ resta arbitrario.`,
      },
      {
        id: 'l64-15',
        kind: 'prova',
        title: 'Il solido teso',
        md: 'Il modello calcola la deformata con il campo di spostamento della dispensa; il tratteggio grigio è la forma iniziale.',
        tasks: [
          'Guarda il colore: è uniforme su tutto il solido, perché $\\sigma_z=N/A$ è la stessa in ogni punto.',
          'Aumenta l’amplificazione: il solido si allunga e la sezione si restringe, sempre conservando la sua forma.',
          'Scegli la vista «dalla base di destra»: il contorno deformato è una copia rimpicciolita di quello iniziale, con lo stesso baricentro.',
          'Leggi nella tabella $\\sigma_z=N/A$ e $\\Delta L=NL/(EA)$, e prova a cambiare sezione: a parità di area, l’allungamento non cambia.',
        ],
        visual: BEAM('normale', { controls: ['section', 'amp'], view: 'prospettiva' }),
      },
      {
        id: 'l64-16',
        kind: 'spiega',
        title: 'Il volume cambia',
        md: `Dopo forma e dimensioni, guardiamo il volume. La dilatazione cubica $\\Theta$, cioè la variazione relativa di volume di un elementino, è la traccia di $\\tens E$, la somma dei suoi termini diagonali:
$$\\Theta=-\\frac{\\nu N}{EA}-\\frac{\\nu N}{EA}+\\frac N{EA}=\\frac{1-2\\nu}E\\,\\frac NA.$$
Ha il segno di $N$, dato che $\\nu<\\frac12$: in trazione il volume aumenta, in compressione diminuisce. Moltiplicando per il volume $AL$ si ottiene la variazione totale:
$$\\Delta V=\\frac{1-2\\nu}E\\,NL.$$

Caso particolare (deduzione): per un materiale incomprimibile, $\\nu=\\frac12$, il volume non cambia, perché la contrazione della sezione compensa esattamente l'allungamento.`,
      },
      {
        id: 'l64-17',
        kind: 'derivazione',
        title: 'Energia: il teorema di Clapeyron',
        md: `Vogliamo l'energia elastica immagazzinata nel solido e confrontarla con il lavoro della forza. Strategia: l'energia specifica è uniforme, quindi basta moltiplicarla per il volume e poi riconoscere $\\Delta L$.`,
        source: D(5, '5.4.4', undefined, 113),
        der: {
          sample,
          lines: [
            { tex: '\\Phi=\\int_{\\mathcal B}\\varphi\\,dV=\\frac{N^2}{2EA^2}\\,AL', why: `L'energia specifica dello stato monoassiale è $\\varphi=\\frac{\\sigma^2}{2E}$ (Prop 4.14.1), qui $\\frac{N^2}{2EA^2}$; è uniforme, quindi l'integrale è $\\varphi$ per il volume $AL$.`, val: (v) => (v.N ** 2 / (2 * v.E * sec(v).A ** 2)) * sec(v).A * v.L },
            { tex: '=\\frac{N^2L}{2EA}', why: `Semplificando un'area.`, val: (v) => (v.N ** 2 * v.L) / (2 * v.E * sec(v).A), aggiunto: true },
            {
              tex: '=\\frac12N\\cdot\\frac{NL}{EA}=\\frac12N\\,\\Delta L',
              why: `Mettiamo in evidenza $\\frac12N$ e riconosciamo nel resto l'allungamento $\\Delta L=\\frac{NL}{EA}$.`,
              ask: { q: 'Il lavoro della forza $N$ che produce l’allungamento $\\Delta L$ è…', options: ['$\\frac12N\\Delta L$, perché la forza cresce da 0 a $N$ durante il carico', '$N\\Delta L$, perché la forza vale $N$', '$2N\\Delta L$', 'Zero, perché il solido torna indietro'], correct: 0, why: `Il carico è applicato lentamente: la forza cresce linearmente da 0 a $N$ mentre l'allungamento cresce da 0 a $\\Delta L$. Il lavoro è l'area del triangolo sotto la retta $N$–$\\Delta L$, non del rettangolo $N\\Delta L$.` },
              val: (v) => 0.5 * v.N * ((v.N * v.L) / (v.E * sec(v).A)),
              eq: '§5.4.4',
            },
          ],
        },
      },
      {
        id: 'l64-18',
        kind: 'spiega',
        title: 'Da dove viene il ½',
        md: `Il risultato $\\Phi=\\frac12N\\,\\Delta L$ è un caso del **teorema di Clapeyron**: l'energia elastica è metà del prodotto del carico finale per lo spostamento finale. Perché metà?

Perché il carico non è applicato di colpo. Nello studio statico lo si immagina crescere **molto lentamente** da 0 a $N$; in ogni istante il solido è in equilibrio e, essendo elastico lineare, l'allungamento cresce in proporzione alla forza. Nel piano forza–allungamento il processo descrive una retta dall'origine al punto $(\\Delta L,N)$. Il lavoro fatto è l'area sotto questa retta: un **triangolo** di base $\\Delta L$ e altezza $N$, la cui area è $\\frac12N\\Delta L$.

Se invece la forza $N$ agisse tutta subito, il lavoro sarebbe l'area del rettangolo, $N\\Delta L$, e la differenza andrebbe in oscillazioni (deduzione).`,
      },
      {
        id: 'l64-19',
        kind: 'domanda',
        q: { id: 'l64-q3', kind: 'vf', q: 'Nello sforzo normale la sezione trasversale resta identica a quella iniziale e trasla soltanto.', answer: false, why: `Trasla lungo $z$ e resta piana, ma nel suo piano si contrae (per $N>0$) in modo omotetico, per l'effetto Poisson: $v/u=y/x$, con il baricentro fermo (§5.4.4).` },
      },
      {
        id: 'l64-20',
        kind: 'spiega',
        title: 'Attenzione a…',
        md: `Tre errori tipici sullo sforzo normale.

1. **Dire che non ci sono tangenziali.** Mancano sulla sezione trasversale, non su altre giaciture: sui piani a 45° dall'asse la tangenziale vale $N/(2A)$. L'errore nasce dal guardare solo la matrice nel riferimento $x,y,z$.
2. **Dimenticare il ½ nell'energia.** $\\Phi=\\frac12N\\Delta L$, perché il carico cresce lentamente da zero (Clapeyron).
3. **Pensare che la sezione resti uguale.** Resta piana e ortogonale all'asse, ma si contrae per $N>0$, e si dilata per $N<0$, in modo omotetico.`,
      },
      {
        id: 'l64-21',
        kind: 'riassunto',
        md: `**Il filo della lezione.** Lo sforzo normale è il primo caso risolto con il metodo semi-inverso. Si ipotizza che tutte le fibre siano tese allo stesso modo e senza tangenziali; l'equilibrio sulla base dà $\\sigma_z=N/A$ e i momenti sono nulli perché gli assi sono baricentrici. Il legame dà le deformazioni e l'integrazione gli spostamenti, che risultano congruenti a meno di un moto rigido: per Kirchhoff è la soluzione. La tensione è uniforme e monoassiale, con tangenziale massima a 45°; l'asse si allunga di $NL/(EA)$, la sezione resta piana e si contrae in modo omotetico, il volume cambia e l'energia è metà del lavoro «a carico pieno».

- Soluzione: $[\\tens T]=\\operatorname{diag}(0,0,N/A)$, $[\\tens E]=\\operatorname{diag}\\big(-\\frac{\\nu N}{EA},-\\frac{\\nu N}{EA},\\frac N{EA}\\big)$ (Teo 5.4.2).
- Allungamento: $\\Delta L=\\frac{NL}{EA}=\\frac N{K_N}$, $K_N=\\frac{EA}L$, $N=EA\\,w'$ (§5.4.4).
- Mohr: $\\tau_{\\max}=\\frac N{2A}$ a 45° (§5.4.4).
- Volume ed energia: $\\Delta V=\\frac{1-2\\nu}ENL$, $\\Phi=\\frac{N^2L}{2EA}=\\frac12N\\Delta L$ (§5.4.4).`,
        orale: ['Sforzo normale: congetture, soluzione, tensione e deformazione, Clapeyron. (dispensa, domanda 6)'],
      },
    ],
  },
  // ================================================================== c6.5
  {
    concept: 'c6.5',
    title: 'Assi principali centrali ed ellisse d’inerzia',
    minutes: 22,
    source: D(5, '5.5.1–5.5.2', 'Def 5.5.1–5.5.2', '113–115'),
    visual: SVG('sezione', { tab: 'ecdi' }),
    steps: [
      {
        id: 'l65-1',
        kind: 'spiega',
        title: 'Dove siamo e dove andiamo',
        md: `Nella lezione precedente abbiamo risolto lo sforzo normale. Lì la forma della sezione contava poco: serviva solo la sua area $A$, e il fatto che gli assi passassero per il baricentro.

Il prossimo caso, la **flessione**, è diverso: la sezione viene «piegata», e come resiste dipende da come l'area è distribuita attorno agli assi. Prima di risolverlo ci servono quindi alcuni strumenti di geometria delle aree. Le tappe di questa lezione sono quattro: che cosa vuol dire flessione semplice e che cos'è l'asse di sollecitazione; gli **assi principali centrali d'inerzia**; l'**ellisse centrale d'inerzia**, che li rappresenta con un disegno; le **convenzioni** sugli angoli e la distinzione fra flessione **retta** e **deviata**. Qui non ci sono derivazioni: sono definizioni da capire bene, perché le useremo in tutte le lezioni seguenti.`,
      },
      {
        id: 'l65-2',
        kind: 'spiega',
        title: 'Flessione semplice e asse di sollecitazione',
        md: `La **Def 5.5.1** dice: si ha **flessione semplice** quando le forze sulle basi sono staticamente equivalenti a **due coppie uguali e opposte**, che agiscono nel piano delle basi. L'unica caratteristica della sollecitazione (CdS) non nulla è quindi il momento flettente $\\vet M$, un vettore che giace nel piano della sezione.

Una coppia «fa ruotare» in un piano preciso: il **piano di sollecitazione** $\\pi_s$, ortogonale al vettore $\\vet M$ e contenente l'asse del solido. Per esempio, una coppia con vettore lungo $x$ fa ruotare il solido nel piano $yz$ (deduzione).

L'intersezione di $\\pi_s$ con la sezione è una retta per il baricentro: si chiama **asse di sollecitazione** $s$. Per costruzione $s$ è ortogonale a $\\vet M$. La dispensa precisa che da qui in poi è essenziale che $x$ e $y$ siano **assi principali centrali d'inerzia**: vediamo che cosa sono.`,
      },
      {
        id: 'l65-3',
        kind: 'spiega',
        title: 'Richiamo: momenti d’inerzia e momento centrifugo',
        md: `Ricordiamo dal corso di geometria delle aree le grandezze che misurano come è distribuita l'area attorno agli assi (passaggio aggiunto: la dispensa le usa senza ridefinirle).

- Il **momento statico** rispetto a $x$ è $S_x=\\int_Ay\\,dA$. È nullo se l'asse passa per il baricentro: lo abbiamo usato nello sforzo normale.
- Il **momento d'inerzia** rispetto a $x$ è $J_x=\\int_Ay^2\\,dA$: pesa ogni pezzetto d'area con il quadrato della sua distanza dall'asse. Più l'area è lontana dall'asse, più $J_x$ è grande. Allo stesso modo $J_y=\\int_Ax^2\\,dA$.
- Il **momento centrifugo** è $J_{xy}=\\int_Axy\\,dA$. Può essere positivo, negativo o nullo, a seconda di come è disposta l'area nei quattro quadranti.

Nella flessione il momento centrifugo comparirà in una CdS: se non fosse nullo, un momento lungo $x$ produrrebbe anche un momento lungo $y$ (lezione c6.6). Per questo vogliamo assi in cui $J_{xy}=0$.`,
      },
      {
        id: 'l65-4',
        kind: 'spiega',
        title: 'Gli assi principali centrali d’inerzia',
        md: `Gli **assi principali centrali d'inerzia** (APCdI, §5.5.1) sono una coppia di assi con tre proprietà:
- sono **ortogonali** fra loro;
- sono **baricentrici**, cioè passano per il baricentro («centrali»);
- sono **coniugati**, cioè hanno momento centrifugo nullo, $J_{xy}=0$ («principali»).

Una proprietà utile: **un asse di simmetria è principale**. Il motivo è semplice (deduzione): rispetto a un asse di simmetria $y$, a ogni pezzetto d'area in $(x,y)$ ne corrisponde uno in $(-x,y)$; i loro contributi $xy$ a $J_{xy}$ sono opposti e si cancellano a coppie.

Per un rettangolo o un doppio T gli APCdI sono quindi gli assi di simmetria. Per una sezione senza simmetrie, come una L a lati disuguali, vanno calcolati. La dispensa sceglie come $x$ l'APCdI di inerzia **massima**: nel rettangolo alto e stretto, $x$ è l'asse orizzontale.`,
      },
      {
        id: 'l65-5',
        kind: 'domanda',
        q: { id: 'l65-q2', kind: 'scelta', q: 'Quale delle seguenti NON è una proprietà richiesta agli assi principali centrali d’inerzia?', options: ['Essere assi di simmetria della sezione', 'Passare per il baricentro', 'Essere ortogonali fra loro', 'Avere momento centrifugo nullo'], correct: 0, why: `Un asse di simmetria è sempre principale, ma non vale il contrario: anche una sezione senza simmetrie, come la L a lati disuguali, ha i suoi APCdI, che vanno calcolati (§5.5.1). Le altre tre sono proprio la definizione.` },
      },
      {
        id: 'l65-6',
        kind: 'spiega',
        title: 'Raggi d’inerzia ed ellisse centrale d’inerzia',
        md: `Il momento d'inerzia dipende dall'area: una sezione più grande ha $J$ più grande. Per confrontare la **forma** si usa il **raggio d'inerzia**, una lunghezza:
$$\\rho_x=\\sqrt{J_x/A},\\qquad\\rho_y=\\sqrt{J_y/A}.$$
Leggilo così: $\\rho_x$ è la distanza dall'asse $x$ a cui dovresti concentrare tutta l'area per avere lo stesso momento d'inerzia. Vale anche al contrario: $J_x=\\rho_x^2A$.

L'**ellisse centrale d'inerzia** (ECdI) è il diagramma polare dei raggi d'inerzia: per ogni asse baricentrico si riporta il suo raggio d'inerzia. C'è un dettaglio che confonde sempre: il raggio relativo a un asse si riporta lungo la direzione **coniugata**, non lungo l'asse stesso. Negli APCdI la direzione coniugata di $x$ è $y$, quindi **lungo $y$ si riporta $\\rho_x$** e lungo $x$ si riporta $\\rho_y$. I semiassi dell'ellisse sono $\\rho_y$ lungo $x$ e $\\rho_x$ lungo $y$.

Per il rettangolo alto ($\\rho_x>\\rho_y$) l'ellisse è quindi allungata **in verticale**, come la sezione.`,
      },
      {
        id: 'l65-7',
        kind: 'numeri',
        title: 'Le sezioni d’esempio',
        md: `Il motore calcola le proprietà dal contorno (formule di Green). Rettangolo 20×40: $J_x=${Math.round(S.principal(S.SEZIONI.rettangolo.poly).Jx)}$ cm⁴ ($BH^3/12$). Doppio T di 40 cm: $J_x=${Math.round(S.principal(S.SEZIONI.doppioT.poly).Jx)}$ cm⁴ con meno della metà dell'area: l'area è stata spostata nelle ali, lontano dall'asse, e $J_x$ è cresciuto. L a lati uguali: APCdI ruotati di ${Math.round((Math.abs(S.principal(S.SEZIONI.L.poly).psi) * 180) / Math.PI)}° (bisettrice), baricentro fuori dalla figura. Valori di esempio, non della dispensa.`,
        values: { Jrett: Math.round(S.principal(S.SEZIONI.rettangolo.poly).Jx), JdoppioT: Math.round(S.principal(S.SEZIONI.doppioT.poly).Jx), psiL: Math.round((Math.abs(S.principal(S.SEZIONI.L.poly).psi) * 180) / Math.PI) },
        visual: SVG('sezione', { tab: 'ecdi', section: 'L' }),
      },
      {
        id: 'l65-8',
        kind: 'spiega',
        title: 'Tre casi che la dispensa disegna',
        md: `La figura di p. 114 mostra tre situazioni tipiche, che conviene saper disegnare.

- **L a lati uguali.** L'asse di simmetria è la bisettrice dell'angolo, quindi è un APCdI; l'altro è ortogonale. Il baricentro cade **fuori dalla figura**, nel vuoto dell'angolo.
- **L a lati disuguali.** Non c'è simmetria: gli APCdI vanno calcolati, cercando la rotazione che annulla $J_{xy}$.
- **Quadrato e poligoni regolari.** Il momento d'inerzia è lo stesso per ogni asse baricentrico: l'ellisse diventa un **cerchio**. Allora $J_{xy}=0$ per ogni coppia di assi ortogonali, e **ogni coppia di assi baricentrici ortogonali è principale**.

L'ultimo caso è controintuitivo: un quadrato ha solo quattro assi di simmetria, eppure gli assi principali sono infiniti.`,
      },
      {
        id: 'l65-9',
        kind: 'prova',
        title: 'Ellissi a confronto',
        md: 'Il diagramma mostra la sezione, gli assi principali e l’ellisse centrale d’inerzia; con i pulsanti cambi sezione.',
        tasks: [
          'Rettangolo: l’ellisse è allungata lungo $y$, perché lungo $y$ si riporta $\\rho_x$, il più grande.',
          'L a lati uguali: gli assi principali sono ruotati di 45°, sulla bisettrice; guarda dove cade il baricentro.',
          'Cerchio: l’ellisse è circolare, e ogni coppia di assi ortogonali è principale.',
        ],
        visual: SVG('sezione', { tab: 'ecdi' }),
      },
      {
        id: 'l65-10',
        kind: 'spiega',
        title: 'Le convenzioni sugli angoli',
        md: `Per descrivere un momento con direzione qualsiasi servono degli angoli, e la dispensa fissa quattro convenzioni (§5.5.2, figura di p. 115).

1. $x$ è l'APCdI di inerzia **massima**.
2. $\\alpha\\in\\,]-\\pi,\\pi[$ è l'**inclinazione di $\\vet M$** sull'asse $x$.
3. $\\gamma=\\frac\\pi2+\\alpha$ è l'**inclinazione dell'asse di sollecitazione** $s$. Il verso positivo di $s$ è quello su cui va $\\vet M$ ruotando di 90° in senso antiorario.
4. Le componenti del momento sono $M_x=M\\cos\\alpha$ e $M_y=M\\sin\\alpha$.

Il punto 3 è coerente con quanto detto prima: $s$ è ortogonale a $\\vet M$, quindi la sua inclinazione differisce da quella di $\\vet M$ di un angolo retto.`,
      },
      {
        id: 'l65-11',
        kind: 'spiega',
        title: 'Flessione retta e flessione deviata',
        md: `Con questi strumenti possiamo classificare la flessione (**Def 5.5.2**): è **retta** se l'asse di sollecitazione $s$ coincide con uno degli APCdI, **deviata** altrimenti.

Gli esempi della dispensa:
- doppio T con un momento obliquo: $s$ non è un asse di simmetria, la flessione è **deviata**;
- L a lati uguali con $s$ sull'asse di simmetria: la flessione è **retta**;
- quadrato: la flessione è **sempre retta**, perché ogni asse baricentrico è principale.

Il piano di studio è questo: risolveremo la flessione retta con $M_x$ (lezione c6.6), poi quella con $M_y$, e otterremo la deviata come sovrapposizione delle due (lezione c6.7).`,
      },
      {
        id: 'l65-12',
        kind: 'domanda',
        q: { id: 'l65-q1', kind: 'vf', q: 'Una L a lati uguali con l’asse di sollecitazione sulla bisettrice è in flessione retta.', answer: true, why: `La bisettrice è asse di simmetria, quindi principale: $s$ coincide con un APCdI (Def 5.5.2). Lo si sbaglia se si guarda solo al fatto che $s$ è «inclinato» rispetto ai lati.` },
      },
      {
        id: 'l65-13',
        kind: 'spiega',
        title: 'Attenzione a…',
        md: `Tre errori tipici.

1. **Riportare $\\rho_x$ lungo $x$.** Va riportato lungo la direzione coniugata, cioè $y$. Per questo l'ellisse di una sezione alta è allungata in verticale.
2. **Pensare che un momento obliquo dia sempre flessione deviata.** Dipende dalla sezione: nel quadrato, e nei poligoni regolari, l'ellisse è circolare e la flessione è sempre retta.
3. **Usare assi baricentrici non principali nelle formule di Navier.** Le formule che troveremo valgono solo negli APCdI: con $J_{xy}\\ne0$ un momento lungo $x$ produrrebbe anche un momento lungo $y$.`,
      },
      {
        id: 'l65-14',
        kind: 'riassunto',
        md: `**Il filo della lezione.** La flessione semplice è prodotta da due coppie sulle basi; il piano in cui fanno ruotare il solido taglia la sezione lungo l'asse di sollecitazione $s$. Come la sezione resiste dipende da come l'area è distribuita, e per descriverlo usiamo gli assi principali centrali d'inerzia: baricentrici, ortogonali e con momento centrifugo nullo. I raggi d'inerzia ne danno l'ellisse centrale, in cui ogni raggio si riporta lungo la direzione coniugata. Fissati gli angoli di $\\vet M$ e di $s$, la flessione è retta se $s$ è un asse principale, deviata altrimenti.

- APCdI e raggi d'inerzia: $J_{xy}=\\int_Axy\\,dA=0$, $\\rho_x=\\sqrt{J_x/A}$, $\\rho_y=\\sqrt{J_y/A}$ (§5.5.1).
- Convenzioni: $M_x=M\\cos\\alpha$, $M_y=M\\sin\\alpha$, $\\gamma=\\frac\\pi2+\\alpha$ (§5.5.2).
- Retta se $s$ coincide con un APCdI, deviata altrimenti (Def 5.5.2).`,
        orale: ['Flessione retta: Navier, spostamenti, Bernoulli–Navier, rigidezza flessionale, anticlastica. (dispensa, domanda 7: le convenzioni)'],
      },
    ],
  },
  // ================================================================== c6.6
  {
    concept: 'c6.6',
    title: 'La flessione retta: Navier',
    minutes: 40,
    source: D(5, '5.5.3–5.5.4', undefined, '115–120'),
    visual: BEAM('flessione', { alpha: 0, controls: ['section', 'amp'] }),
    steps: [
      {
        id: 'l66-1',
        kind: 'spiega',
        title: 'Dove siamo e dove andiamo',
        md: `Nella lezione c6.4 abbiamo risolto lo sforzo normale con il metodo semi-inverso; nella lezione c6.5 abbiamo preparato gli strumenti per la flessione: assi principali centrali d'inerzia (APCdI), momenti d'inerzia, convenzioni sugli angoli.

Ora risolviamo la **flessione retta** con un momento $M_x$ lungo l'asse $x$: il solido viene piegato nel piano $yz$. Seguiremo la stessa ricetta dello sforzo normale: **ipotesi** sulla tensione, **equilibrio**, **legame**, **congruenza**, **verifica**. Il risultato più famoso è la **formula di Navier**, $\\sigma_z=\\frac{M_x}{J_x}y$.

Poi leggeremo la soluzione con calma, perché è ricca: la tensione «a farfalla», le sezioni che restano piane, l'asse che si incurva ad arco di cerchio, la sezione che si incurva nel verso opposto (deformazione anticlastica), volume ed energia. Alla fine vedremo in breve il caso con $M_y$.`,
      },
      {
        id: 'l66-2',
        kind: 'spiega',
        title: 'L’ipotesi: tensione lineare nella sezione',
        md: `Primo tempo: indovinare. Immagina di piegare una riga di plastica: le fibre da una parte si allungano, quelle dall'altra si accorciano, e in mezzo ce ne sono alcune che non cambiano lunghezza. È naturale pensare che la tensione cambi **linearmente** passando da un lato all'altro.

La dispensa (§5.5.3) aggiunge quindi all'ipotesi di Saint-Venant la congettura
$$T_{zx}=T_{zy}\\equiv0,\\qquad T_{zz}=D\\,y,$$
con $D$ costante da determinare. Nella forma $(\\star)$ della lezione c6.2 vuol dire $A=B=C=0$ e $D(x,y)=D\\,y$.

Ricorda la convenzione della dispensa: nei disegni della sezione l'asse **$y$ è rivolto verso il basso**. Con $D>0$, quindi, la tensione è di trazione nella parte bassa della sezione ($y>0$) e di compressione in quella alta.`,
      },
      {
        id: 'l66-3',
        kind: 'derivazione',
        title: 'Equilibrio: la formula di Navier',
        md: `Vogliamo trovare $D$ e verificare l'equilibrio. Strategia: campo e mantello sono soddisfatti dalla forma $(\\star)$ e dalle tangenziali nulle; restano le sei caratteristiche della sollecitazione (CdS) sulla base, calcolate con la tensione ipotizzata, che devono essere $M_x$ e zero tutte le altre.`,
        source: D(5, '5.5.3', undefined, '115–117'),
        der: {
          lines: [
            { tex: 'T_{zz}=D\\,y', why: `La congettura. Con le tangenziali nulle, tagli e momento torcente sono già nulli; restano $N$, $M_x$, $M_y$.` },
            { tex: 'N=\\int_AD\\,y\\,dA=D\\,S_x=0', why: `Lo sforzo normale deve essere nullo, e lo è: $\\int y\\,dA$ è il momento statico $S_x$, nullo perché l'asse $x$ è baricentrico.` },
            { tex: 'M_x=\\int_AT_{zz}\\,y\\,dA=D\\int_Ay^2dA=D\\,J_x', why: `Il momento flettente lungo $x$, dalla Def 5.2.2: $y$ moltiplicato per $D\\,y$ dà $D\\,y^2$, e l'integrale di $y^2$ è il momento d'inerzia $J_x$.` },
            { tex: 'D=\\frac{M_x}{J_x}', why: `Imponiamo che sia proprio il momento assegnato, e dividiamo per $J_x$.` },
            {
              tex: 'M_y=-\\int_AD\\,y\\,x\\,dA=-D\\,J_{xy}=0',
              why: `Il momento lungo $y$ deve essere nullo. L'integrale di $xy$ è il momento centrifugo $J_{xy}$, nullo perché gli assi sono **principali**. È qui che serve davvero che $x$ e $y$ siano APCdI.`,
              ask: { q: 'Perché $M_y$ risulta nullo?', options: ['Perché $J_{xy}=0$ negli assi principali', 'Perché $S_y=0$ negli assi baricentrici', 'Perché $D=0$', 'Perché $M_z=0$'], correct: 0, why: `Nell'integrale compare $xy$, non $x$: serve il momento centrifugo nullo, cioè assi principali (§5.5.3). Il momento statico nullo basterebbe solo se la tensione fosse uniforme. Con assi baricentrici ma non principali, un $M_x$ produrrebbe anche un $M_y$.` },
            },
            { tex: '\\sigma_z=\\frac{M_x}{J_x}\\,y', why: `Sostituendo $D$ nella congettura: è la **formula di Navier**. Lo stato è monoassiale, $[\\tens T]=\\operatorname{diag}(0,0,\\frac{M_x}{J_x}y)$.`, eq: 'Navier §5.5.3' },
          ],
        },
      },
      {
        id: 'l66-4',
        kind: 'spiega',
        title: 'Dal legame alle deformazioni',
        md: `L'equilibrio è soddisfatto. Ora il **legame inverso**, come nello sforzo normale, con l'unica differenza che $T_{zz}$ non è più costante ma vale $\\frac{M_x}{J_x}y$ (§5.5.3):
$$E_{xx}=E_{yy}=-\\frac\\nu E\\,\\frac{M_x}{J_x}\\,y,\\qquad E_{zz}=\\frac{M_x}{EJ_x}\\,y,\\qquad\\text{scorrimenti nulli}.$$
A parole: ogni fibra si allunga in proporzione alla sua distanza $y$ dall'asse $x$, e si restringe lateralmente di $\\nu$ volte tanto.

Prima di integrare gli spostamenti c'è una domanda: queste deformazioni sono **congruenti**, cioè esiste davvero uno spostamento che le produce? Per una sezione semplicemente connessa la condizione necessaria e sufficiente è la compatibilità, $\\operatorname{rot}\\operatorname{rot}\\tens E=\\tens O$, che contiene solo derivate seconde delle componenti di $\\tens E$. Qui le componenti sono **lineari**, le derivate seconde sono nulle e la condizione è soddisfatta. Possiamo integrare con fiducia.`,
      },
      {
        id: 'l66-5',
        kind: 'derivazione',
        title: 'Congruenza: integrare e correggere',
        md: `Vogliamo il campo di spostamento. Strategia: integrare le tre dilatazioni come nello sforzo normale; questa volta però gli scorrimenti non vengono nulli da soli, e bisogna correggere $v$ con due termini scelti apposta per annullarli.`,
        source: D(5, '5.5.3', undefined, '116–117'),
        der: {
          lines: [
            {
              tex: 'u=-\\frac\\nu E\\frac{M_x}{J_x}xy+\\bar u,\\qquad v=-\\frac\\nu E\\frac{M_x}{2J_x}y^2+\\bar v,\\qquad w=\\frac{M_x}{EJ_x}yz+\\bar w',
              why: `Integriamo $\\partial u/\\partial x$ rispetto a $x$, $\\partial v/\\partial y$ rispetto a $y$ (da $y$ viene $y^2/2$) e $\\partial w/\\partial z$ rispetto a $z$, più le funzioni d'integrazione $\\bar u$, $\\bar v$, $\\bar w$.`,
            },
            {
              tex: '2E_{xy}=\\frac{\\partial u}{\\partial y}+\\frac{\\partial v}{\\partial x}=-\\frac{\\nu M_x}{EJ_x}x+\\dots\\ne0',
              why: `Controlliamo lo scorrimento nel piano della sezione, che deve essere nullo. Derivando $u$ rispetto a $y$ resta un termine in $x$ che nessun'altra parte cancella: le sole parti integrate non bastano.`,
              aggiunto: true,
            },
            {
              tex: 'v\\ \\to\\ v+\\frac{\\nu M_x}{2EJ_x}x^2',
              why: `Aggiungiamo a $v$ un termine in $x^2$: la sua derivata rispetto a $x$ è $+\\frac{\\nu M_x}{EJ_x}x$ e cancella il termine trovato. Non cambia $E_{yy}=\\partial v/\\partial y$, perché non dipende da $y$.`,
            },
            {
              tex: '2E_{yz}=\\frac{\\partial v}{\\partial z}+\\frac{\\partial w}{\\partial y}=\\frac{M_x}{EJ_x}z+\\dots\\ne0',
              why: `Lo stesso problema per lo scorrimento fra sezione e asse: la derivata di $w$ rispetto a $y$ lascia un termine in $z$.`,
              aggiunto: true,
            },
            {
              tex: 'v\\ \\to\\ v-\\frac{M_x}{2EJ_x}z^2',
              why: `Aggiungiamo a $v$ un termine in $z^2$, la cui derivata rispetto a $z$, $-\\frac{M_x}{EJ_x}z$, cancella quello trovato. Anche questo non tocca $E_{yy}$. Lo scorrimento $E_{zx}$ è già nullo, perché $u$ non dipende da $z$ e $w$ non dipende da $x$.`,
            },
            {
              tex: 'u=-\\frac{\\nu M_x}{EJ_x}xy,\\quad v=-\\frac{\\nu M_x}{2EJ_x}\\Big[(y^2-x^2)+\\frac{z^2}\\nu\\Big],\\quad w=\\frac{M_x}{EJ_x}yz',
              why: `Raccogliendo i tre termini di $v$: il fattore comune è $-\\frac{\\nu M_x}{2EJ_x}$, e il termine in $z^2$, diviso per questo fattore, diventa $+z^2/\\nu$. A questo campo si aggiunge un moto rigido $\\vet u^{r,\\infty}$ arbitrario.`,
              ask: { q: 'Perché i termini aggiunti a $v$ non alterano le dilatazioni già trovate?', options: ['Perché dipendono da $x$ e da $z$, non da $y$, e quindi non cambiano $\\partial v/\\partial y$', 'Perché sono piccoli', 'Perché sono moti rigidi', 'Perché si annullano sulla base di sinistra'], correct: 0, why: `$v$ entra solo in $E_{yy}=\\partial v/\\partial y$ fra le dilatazioni, e un termine in $x^2$ o in $z^2$ ha derivata nulla rispetto a $y$. Non sono moti rigidi: un termine quadratico deforma, ma solo come serve per annullare gli scorrimenti.` },
              eq: '§5.5.3',
            },
          ],
        },
      },
      {
        id: 'l66-6',
        kind: 'derivazione',
        title: 'Verifica numerica del campo',
        md: `Vogliamo controllare che il campo trovato dia davvero le deformazioni del legame. Strategia: il campione deriva numericamente lo spostamento in un punto a caso del rettangolo e confronta con le formule.`,
        source: D(5, '5.5.3', undefined, '116–117'),
        der: {
          sample,
          lines: [
            { tex: 'E_{zz}=\\frac{\\partial w}{\\partial z}', why: `Derivata numerica della componente $w$ del campo, in un punto a caso.`, val: (v) => strain(v, { N: 0, Mx: v.Mx, My: 0 }).zz },
            { tex: '=\\frac{M_x}{EJ_x}\\,y', why: `Derivando $w=\\frac{M_x}{EJ_x}yz$ rispetto a $z$.`, val: (v) => (v.Mx / (v.E * sec(v).Jx)) * pt(v)[1], aggiunto: true },
            { tex: '=\\frac{\\sigma_z}E', why: `È la tensione di Navier divisa per $E$, come vuole il legame: torna. Le altre componenti sono controllate qui sotto.`, val: (v) => ((v.Mx / sec(v).Jx) * pt(v)[1]) / v.E, eq: '§5.5.3' },
          ],
          checks: [
            { what: '$E_{xy}=0$', f: (v) => [strain(v, { N: 0, Mx: v.Mx, My: 0 }).xy, 0] },
            { what: '$E_{yz}=0$', f: (v) => [strain(v, { N: 0, Mx: v.Mx, My: 0 }).yz, 0] },
            { what: '$E_{xx}=-\\nu\\sigma_z/E$', f: (v) => [strain(v, { N: 0, Mx: v.Mx, My: 0 }).xx, (-v.nu * v.Mx * pt(v)[1]) / (v.E * sec(v).Jx)] },
          ],
        },
      },
      {
        id: 'l66-7',
        kind: 'domanda',
        q: { id: 'l66-q2', kind: 'scelta', q: 'Nella flessione retta, perché si è sicuri che il campo di spostamento esista prima di integrarlo?', options: ['Perché la sezione è semplicemente connessa e le componenti di $\\tens E$ sono lineari, quindi $\\operatorname{rot}\\operatorname{rot}\\tens E=\\tens O$', 'Perché il materiale è isotropo', 'Perché lo dice il postulato di Saint-Venant', 'Perché gli scorrimenti sono nulli'], correct: 0, why: `La compatibilità contiene derivate seconde di $\\tens E$, nulle per componenti lineari, ed è sufficiente per domini semplicemente connessi (§5.5.3). Isotropia e postulato non riguardano la congruenza; gli scorrimenti nulli sono una richiesta, non una garanzia.` },
      },
      {
        id: 'l66-8',
        kind: 'spiega',
        title: 'La tensione: diagramma a farfalla',
        md: `La soluzione è completa e, per Kirchhoff, è quella vera. Cominciamo a leggerla dalla tensione: la formula di Navier
$$\\sigma_z=\\frac{M_x}{J_x}\\,y$$
dice che la tensione è **proporzionale alla distanza dall'asse $x$** e non dipende da $x$. Lo stato è monoassiale.

Dove la tensione è nulla? Per $y=0$: è l'**asse neutro** $n$, che coincide con l'asse $x$. Le fibre che lo attraversano non si allungano né si accorciano.

Con $M_x>0$ e $y$ rivolto verso il basso, le fibre **sotto** l'asse neutro ($y>0$) sono **tese**, quelle **sopra** sono **compresse**. Il diagramma di $\\sigma_z$ lungo $y$ è una retta che passa per zero sull'asse neutro: due triangoli opposti, il diagramma **a farfalla** (figura di p. 117). Nella stessa figura l'asse $y$ coincide con l'asse di sollecitazione $s$ e con l'asse di flessione $f$, che definiremo fra poco.`,
      },
      {
        id: 'l66-9',
        kind: 'spiega',
        title: 'Le tensioni massime e i moduli di resistenza',
        md: `Il diagramma a farfalla ha i valori estremi ai **lembi**, i punti della sezione più lontani dall'asse neutro. Chiamiamo $y'$ e $y''$ le distanze del lembo inferiore e del lembo superiore. Allora
$$\\sigma'_z=\\frac{M_x}{W'_x},\\qquad\\sigma''_z=\\frac{M_x}{W''_x},\\qquad W'_x=\\frac{J_x}{y'},\\quad W''_x=\\frac{J_x}{y''}.$$
I $W$ si chiamano **moduli di resistenza**: dipendono solo dalla sezione, e per i profilati metallici sono riportati nei sagomari. Più $W$ è grande, più bassa è la tensione massima a parità di momento.

Una nota storica della dispensa: la formula $N/A$ era nota già a Galileo, quella della flessione a Navier; il contributo davvero nuovo di Saint-Venant riguarda soprattutto la torsione (Modulo 7). Qui Saint-Venant **ritrova** Navier come soluzione esatta del problema tridimensionale.`,
      },
      {
        id: 'l66-10',
        kind: 'prova',
        title: 'Guarda la farfalla sul solido',
        md: 'Il modello colora la superficie con $\\sigma_z$ e disegna il solido deformato con il campo di spostamento della dispensa, amplificato.',
        tasks: [
          'Guarda i colori: rosso sotto (trazione), blu sopra (compressione), bianco a metà altezza, sull’asse neutro.',
          'Sulla base di destra leggi la retta $n$: è l’asse neutro, orizzontale, che separa la zona rossa da quella blu.',
          'Leggi nella tabella $\\sigma_{z,\\max}$ e $\\sigma_{z,\\min}$: nel rettangolo sono uguali e opposte, perché i due lembi sono alla stessa distanza dall’asse neutro.',
          'Passa al T: i due valori diventano diversi, perché il baricentro non è più a metà altezza e la distanza $y\'$ del lembo inferiore è diversa dalla distanza $y\'\'$ del lembo superiore.',
        ],
        visual: BEAM('flessione', { alpha: 0, controls: ['section', 'amp'] }),
      },
      {
        id: 'l66-11',
        kind: 'domanda',
        q: { id: 'l66-q3', kind: 'scelta', q: 'Con $M_x>0$ e $y$ rivolto verso il basso, dove sono le fibre tese?', options: ['Sotto l’asse neutro ($y>0$)', 'Sopra l’asse neutro ($y<0$)', 'Su tutta la sezione', 'Sull’asse neutro'], correct: 0, why: `$\\sigma_z=M_xy/J_x$ è positiva dove $y>0$, e $y>0$ è sotto perché l'asse è rivolto verso il basso (§5.5.3). L'errore tipico è ragionare con $y$ verso l'alto, come nei disegni di analisi matematica.` },
      },
      {
        id: 'l66-12',
        kind: 'spiega',
        title: 'Le sezioni restano piane: Bernoulli–Navier',
        md: `Passiamo alla deformazione, e prima di tutto alle sezioni. Gli **scorrimenti sono nulli**: gli angoli retti fra le fibre longitudinali e le sezioni restano retti. Inoltre $w=\\frac{M_x}{EJ_x}yz$ è lineare in $y$ su ogni sezione $z=\\text{cost}$: i punti di una sezione si spostano lungo l'asse in proporzione alla loro quota, quindi la sezione deformata è ancora un **piano**, che ruota attorno all'asse neutro.

La dispensa lo riassume così: la linea elastica resta ortogonale alla deformata della sezione, che resta **piana**. È l'**ipotesi di Bernoulli–Navier** della teoria delle travi. La differenza importante è che lì era un'ipotesi; qui è un **risultato**, ottenuto risolvendo il problema tridimensionale.

Nota però una sottigliezza: piana in direzione $z$ non vuol dire che la sezione non si deformi nel suo piano. Lo vedremo con la deformazione anticlastica.`,
      },
      {
        id: 'l66-13',
        kind: 'derivazione',
        title: 'L’asse si incurva ad arco di cerchio',
        md: `Vogliamo la forma dell'asse deformato e la sua curvatura. Strategia: prendere lo spostamento dei punti dell'asse ($x=y=0$), derivarlo una volta per la rotazione e due volte per la curvatura. Il campione calcola la curvatura per differenze finite.`,
        source: D(5, '5.5.3', undefined, 118),
        der: {
          sample,
          lines: [
            {
              tex: 'v^{dp}(z)=-\\frac{M_x}{2EJ_x}z^2',
              why: `Mettendo $x=y=0$ nel campo, $u$ e $w$ si annullano e di $v$ resta solo il termine in $z^2$. L'apice $dp$ ricorda che è la parte di deformazione pura, senza moto rigido. Con $M_x>0$ è negativo: l'asse si sposta verso $y<0$, cioè verso l'alto.`,
            },
            {
              tex: '\\varphi(z)=-v\'(z)=\\frac{M_x}{EJ_x}z',
              why: `La rotazione della sezione, con la convenzione della dispensa $\\varphi=-v'$ (rotazione oraria negativa): derivando una volta.`,
            },
            {
              tex: '\\kappa\\simeq-v\'\'(z)',
              why: `La curvatura dell'asse, per spostamenti piccoli, è la derivata seconda dello spostamento, con lo stesso segno della rotazione. Il valore è calcolato dal motore per differenze finite.`,
              val: (v) => {
                const f = (z: number) => S.displacement({ N: 0, Mx: v.Mx, My: 0 }, sec(v), v.E, v.nu, [0, 0, z])[1];
                const h = 1e-3;
                return -(f(v.z + h) - 2 * f(v.z) + f(v.z - h)) / (h * h);
              },
            },
            {
              tex: '=\\frac{M_x}{EJ_x}',
              why: `Derivando ancora $\\varphi$: la curvatura è **costante** lungo l'asse.`,
              ask: { q: 'Che forma ha l’asse deformato in flessione retta?', options: ['Un arco di circonferenza', 'Una parabola cubica', 'Una retta', 'Un’elica'], correct: 0, why: `Una curva piana con curvatura costante è un arco di circonferenza (§5.5.3). Lo spostamento $v^{dp}$ è una parabola, ma solo come approssimazione per piccoli spostamenti dell'arco; non è un'elica, perché resta nel piano $yz$.` },
              val: (v) => v.Mx / (v.E * sec(v).Jx),
              eq: '§5.5.3',
            },
            {
              tex: 'M_x=EJ_x\\,\\kappa',
              why: `Riscritta al contrario: il momento è la rigidezza $EJ_x$ per la curvatura. È il **legame della linea elastica flessionale**, che conosci dalla teoria delle travi.`,
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
        id: 'l66-14',
        kind: 'spiega',
        title: 'Lettura: arco, rotazione relativa, rigidezza flessionale',
        md: `Abbiamo trovato che l'asse ha **curvatura costante** $\\kappa=\\frac{M_x}{EJ_x}$: è un **arco di circonferenza** di raggio
$$r=\\frac{EJ_x}{M_x}$$
(figura di p. 118). Ha senso: il momento è lo stesso in ogni sezione, quindi ogni tratto si piega allo stesso modo. Il piano in cui l'asse si incurva si chiama **piano di flessione** $\\pi_f$; la sua traccia sulla sezione è l'**asse di flessione** $f$, che qui coincide con $y$.

La rotazione relativa fra le due basi è la differenza delle rotazioni:
$$\\Delta\\varphi=\\varphi(L)-\\varphi(0)=\\frac{M_xL}{EJ_x}=\\frac{M_x}{K_f},\\qquad K_f:=\\frac{EJ_x}L\\ \\text{(rigidezza flessionale)}.$$
Confrontala con lo sforzo normale: lì $\\Delta L=N/K_N$ con $K_N=EA/L$. Lo schema è identico, con l'area $A$ sostituita dal momento d'inerzia $J_x$ e l'allungamento dalla rotazione.

Le fibre si allungano di $\\Delta L=\\frac{M_xL}{EJ_x}y$: sotto si allungano, sopra si accorciano.`,
      },
      {
        id: 'l66-15',
        kind: 'spiega',
        title: 'Perché il doppio T',
        md: `La rigidezza flessionale e i moduli di resistenza dipendono da $J_x=\\int y^2dA$. Questo ha una conseguenza pratica, che la dispensa sottolinea (Oss., §5.5.3).

A **parità di area**, cioè di materiale e di peso, conviene **allontanare l'area dall'asse neutro**: ogni pezzetto d'area pesa con il quadrato della sua distanza. Il momento d'inerzia cresce come il cubo delle dimensioni della sezione, per esempio $BH^3/12$ nel rettangolo. Aumentare $J_x$ fa diminuire sia la rotazione $\\Delta\\varphi$ sia la tensione massima.

La sezione che sfrutta meglio questo principio è il **doppio T**: due ali lontane dall'asse, dove la tensione è grande, collegate da un'anima sottile vicino all'asse, dove la tensione è piccola e il materiale servirebbe poco. È la sezione ottimale per la flessione. Lo hai visto nei numeri della lezione c6.5: il doppio T d'esempio ha un $J_x$ molto grande con meno della metà dell'area del rettangolo.`,
      },
      {
        id: 'l66-16',
        kind: 'prova',
        title: 'Arco e sezioni piane',
        md: 'Vista di lato del solido inflesso; il tratteggio grigio è la forma iniziale.',
        tasks: [
          'Guarda l’asse: è un arco di cerchio, con la concavità verso l’alto (verso $y<0$) per $M_x>0$.',
          'Guarda le basi: restano piane e ortogonali all’asse deformato. È Bernoulli–Navier, ottenuto come risultato.',
          'Leggi nella tabella il raggio $r=EJ_x/M_x$ e la rotazione $\\Delta\\varphi$; passa al doppio T e nota che, a parità di momento, $\\Delta\\varphi$ cambia con $J_x$.',
        ],
        visual: BEAM('flessione', { alpha: 0, controls: ['section', 'amp'], view: 'lato' }),
      },
      {
        id: 'l66-17',
        kind: 'domanda',
        q: { id: 'l66-q1', kind: 'scelta', q: 'Qual è la rigidezza flessionale del solido?', options: ['$EJ_x/L$', '$EA/L$', '$GJ/L$', '$EJ_x$'], correct: 0, why: `Dalla rotazione relativa $\\Delta\\varphi=M_xL/(EJ_x)=M_x/K_f$ (§5.5.3). $EA/L$ è la rigidezza estensionale; $EJ_x$ da solo lega momento e curvatura, non momento e rotazione: manca la lunghezza.` },
      },
      {
        id: 'l66-18',
        kind: 'spiega',
        title: 'Anche la sezione si incurva',
        md: `Torniamo alla sezione. È piana in direzione $z$, ma nel suo piano si deforma, per l'**effetto Poisson**. Le fibre tese, sotto, si allungano e quindi si **restringono** lateralmente; quelle compresse, sopra, si accorciano e si **allargano**. La sezione rettangolare diventa così una specie di trapezio, e i suoi lati orizzontali si incurvano.

Guardiamo i conti sulla sezione $\\bar z=0$ (§5.5.3), dove il termine in $z^2$ si annulla:
$$u^{dp}=-\\frac{\\nu M_x}{EJ_x}xy,\\qquad v^{dp}=-\\frac{\\nu M_x}{2EJ_x}(y^2-x^2).$$
Sull'asse neutro ($y=0$) resta $v^{dp}=\\frac{\\nu M_x}{2EJ_x}x^2$: l'asse neutro, che era una retta, diventa una **parabola**, cioè (per piccoli spostamenti) un arco. Ci chiediamo: con quale curvatura, e verso quale parte?`,
      },
      {
        id: 'l66-19',
        kind: 'derivazione',
        title: 'La deformazione anticlastica',
        md: `Vogliamo la curvatura dell'asse neutro della sezione e confrontarla con quella dell'asse del solido. Strategia: derivare due volte $v^{dp}$ rispetto a $x$ sull'asse neutro, e leggere il segno con la stessa convenzione usata per l'asse del solido. Il campione calcola la derivata seconda per differenze finite.`,
        source: D(5, '5.5.3', undefined, 119),
        der: {
          sample,
          lines: [
            {
              tex: '\\frac{d^2v^{dp}}{dx^2}\\Big|_{y=0}',
              why: `Derivata seconda dello spostamento verticale lungo l'asse neutro della sezione, calcolata dal motore.`,
              val: (v) => {
                const f = (x: number) => S.displacement({ N: 0, Mx: v.Mx, My: 0 }, sec(v), v.E, v.nu, [x, 0, 0])[1];
                const h = 1e-3;
                return (f(h) - 2 * f(0) + f(-h)) / (h * h);
              },
            },
            {
              tex: '=\\frac{\\nu M_x}{EJ_x}',
              why: `Derivando due volte $\\frac{\\nu M_x}{2EJ_x}x^2$. Ha il segno **opposto** a quello di $v''$ lungo l'asse del solido, che vale $-\\frac{M_x}{EJ_x}$: le due linee si piegano da parti opposte.`,
              val: (v) => (v.nu * v.Mx) / (v.E * sec(v).Jx),
            },
            {
              tex: '\\frac1{\\rho\'}=-\\frac{d^2v^{dp}}{dx^2}=-\\frac{\\nu M_x}{EJ_x}',
              why: `Misuriamo la curvatura con la stessa convenzione dell'asse del solido, $\\kappa\\simeq-v''$, così i due segni sono confrontabili. Con questa lettura si ottiene il segno della dispensa.`,
              aggiunto: true,
            },
            {
              tex: '\\rho\'=-\\frac{EJ_x}{\\nu M_x},\\qquad|\\rho\'|=\\frac r\\nu>r',
              why: `Invertendo. In modulo il raggio è quello dell'asse, $r=EJ_x/M_x$, diviso per $\\nu$: siccome $\\nu<1$, la sezione si incurva **meno** dell'asse. Il segno meno dice che si incurva dalla parte opposta.`,
              eq: '§5.5.3',
            },
          ],
          checks: [{ what: 'curvatura dell’asse neutro $=-\\nu\\,\\times$ curvatura dell’asse del solido', f: (v) => {
            const fx = (x: number) => S.displacement({ N: 0, Mx: v.Mx, My: 0 }, sec(v), v.E, v.nu, [x, 0, 0])[1];
            const h = 1e-3;
            return [-(fx(h) - 2 * fx(0) + fx(-h)) / (h * h), -v.nu * (v.Mx / (v.E * sec(v).Jx))];
          } }],
        },
      },
      {
        id: 'l66-20',
        kind: 'spiega',
        title: 'Lettura: una sella',
        md: `Il risultato ha un nome: **deformazione anticlastica**. L'asse del solido e l'asse neutro della sezione si incurvano **da parti opposte**: il solido si piega «a cupola» in un senso lungo l'asse e nel senso contrario attraverso la sezione. La superficie che ne risulta ricorda una **sella** (figura di p. 119).

Il raggio dell'asse neutro è $|\\rho'|=r/\\nu$, più grande di $r$: con $\\nu=0{,}3$ circa tre volte più grande, quindi la curvatura trasversale è più debole di quella longitudinale. Caso di controllo (deduzione): con $\\nu=0$ non c'è effetto Poisson, $|\\rho'|\\to\\infty$ e la sezione resta indeformata nel suo piano.

Puoi vederlo con una gomma da cancellare: piegandola, le facce laterali si incurvano nel verso opposto (deduzione: esempio aggiunto).`,
      },
      {
        id: 'l66-21',
        kind: 'prova',
        title: 'Guarda la sezione',
        md: 'Vista dalla base di destra, con la griglia della sezione deformata (spostamenti fortemente amplificati).',
        tasks: [
          'Individua la riga orizzontale a metà altezza: è l’asse neutro, e si incurva in verso opposto all’asse del solido.',
          'Confronta il lato in basso e il lato in alto: le fibre tese (sotto) si restringono, quelle compresse (sopra) si allargano, e la sezione diventa un trapezio curvo.',
          'Leggi nella tabella $r$ e $|\\rho\'|=r/\\nu$: il rapporto è $1/\\nu$, circa 3,3 per $\\nu=0{,}3$.',
        ],
        visual: BEAM('anticlastica', { controls: ['section', 'amp'], view: 'sezione' }),
      },
      {
        id: 'l66-22',
        kind: 'spiega',
        title: 'Volume ed energia',
        md: `Come nello sforzo normale, chiudiamo con volume ed energia.

La dilatazione cubica è la traccia di $\\tens E$: $\\Theta=\\frac{1-2\\nu}E\\frac{M_x}{J_x}y$. Cambia segno con $y$: il volume aumenta sotto, dove le fibre sono tese, e diminuisce sopra. Integrando sul solido si trova
$$\\Delta V=\\frac{1-2\\nu}E\\,\\frac{M_xL}{J_x}\\,S_x=0,$$
perché il momento statico $S_x$ è nullo: aumenti e diminuzioni si compensano esattamente e **il volume non cambia**.

L'energia specifica è $\\varphi=\\frac{\\sigma_z^2}{2E}=\\frac{M_x^2}{2EJ_x^2}y^2$. Integrando sulla sezione compare $\\int y^2dA=J_x$, e sulla lunghezza un fattore $L$:
$$\\Phi=\\frac{M_x^2L}{2EJ_x}=\\frac12M_x\\,\\Delta\\varphi.$$
È di nuovo il teorema di **Clapeyron**, con il momento al posto della forza e la rotazione al posto dell'allungamento. La dispensa precisa che il carico deve crescere lentamente **rispetto al periodo naturale di vibrazione** del solido.`,
      },
      {
        id: 'l66-23',
        kind: 'spiega',
        title: 'Il caso con M_y',
        md: `Resta la flessione retta con il momento lungo l'altro asse principale, $M_y$ (§5.5.4). Il ragionamento è lo stesso, con i ruoli di $x$ e $y$ scambiati: si ipotizza $T_{zz}=D\\,x$, e dalla CdS $M_y=-\\int T_{zz}x\\,dA=-D\\,J_y$ si trova $D=-M_y/J_y$, cioè
$$\\sigma_z=-\\frac{M_y}{J_y}\\,x.$$
Il segno meno viene dalla definizione di $M_y$ (Def 5.2.2), ed è facile dimenticarlo. L'asse neutro è l'asse $y$; con $M_y>0$ la sezione è compressa per $x>0$.

L'asse si sposta lungo $x$: $u^{dp}(0,0,z)=\\frac{M_y}{2EJ_y}z^2$. Il campo completo, che negli appunti era rimasto a metà e che la dispensa completa, è
$$u=\\frac{M_y}{2EJ_y}\\big[\\nu(x^2-y^2)+z^2\\big],\\qquad v=\\frac{\\nu M_y}{EJ_y}xy,\\qquad w=-\\frac{M_y}{EJ_y}xz.$$
Questi due casi retti sono i mattoni della flessione deviata.`,
      },
      {
        id: 'l66-24',
        kind: 'domanda',
        q: { id: 'l66-q4', kind: 'vf', q: 'In flessione retta le sezioni restano piane e quindi non si deformano nel loro piano.', answer: false, why: `Restano piane in direzione $z$ (Bernoulli–Navier), ma nel loro piano si deformano per l'effetto Poisson: è la deformazione anticlastica, con $|\\rho'|=r/\\nu$ (§5.5.3).` },
      },
      {
        id: 'l66-25',
        kind: 'spiega',
        title: 'Attenzione a…',
        md: `Tre errori tipici sulla flessione retta.

1. **Sbagliare il segno della tensione.** Con $y$ verso il basso e $M_x>0$ le fibre tese sono **sotto**. È tentante pensare il contrario perché siamo abituati a $y$ verso l'alto.
2. **Dire che la sezione non si deforma.** Resta piana, ma nel suo piano si incurva in verso opposto all'asse: deformazione anticlastica.
3. **Dimenticare il segno meno in $\\sigma_z=-M_yx/J_y$.** Nasce dal segno meno nella definizione di $M_y$; senza di esso la zona compressa finirebbe dalla parte sbagliata.`,
      },
      {
        id: 'l66-26',
        kind: 'riassunto',
        md: `**Il filo della lezione.** Con un momento $M_x$ si ipotizza una tensione normale lineare nella quota $y$ e nessuna tangenziale. L'equilibrio sulla base dà la formula di Navier, e i momenti parassiti sono nulli perché gli assi sono baricentrici e principali. Il legame dà deformazioni lineari, compatibili; integrandole e correggendo $v$ con due termini quadratici si trova uno spostamento congruente, quindi per Kirchhoff la soluzione esatta. La tensione è a farfalla, nulla sull'asse neutro; le sezioni restano piane (Bernoulli–Navier come risultato) e l'asse diventa un arco di cerchio di curvatura $M_x/(EJ_x)$; per l'effetto Poisson la sezione si incurva dalla parte opposta; il volume non cambia e l'energia segue Clapeyron.

- Navier: $\\sigma_z=\\frac{M_x}{J_x}\\,y$; moduli di resistenza $W=J_x/y$ (§5.5.3).
- Linea elastica flessionale: $M_x=EJ_x\\,\\kappa$, $r=\\frac{EJ_x}{M_x}$, $\\Delta\\varphi=\\frac{M_xL}{EJ_x}=\\frac{M_x}{K_f}$, $K_f=\\frac{EJ_x}L$ (§5.5.3).
- Anticlastica: $\\rho'=-\\frac{EJ_x}{\\nu M_x}$, $|\\rho'|=\\frac r\\nu$ (§5.5.3).
- Volume ed energia: $\\Delta V=0$, $\\Phi=\\frac{M_x^2L}{2EJ_x}=\\frac12M_x\\Delta\\varphi$ (§5.5.3).
- Con $M_y$: $\\sigma_z=-\\frac{M_y}{J_y}x$ (§5.5.4).`,
        orale: ['Flessione retta: Navier, spostamenti, Bernoulli–Navier, rigidezza flessionale, anticlastica. (dispensa, domanda 7)'],
      },
    ],
  },
  // ================================================================== c6.7
  {
    concept: 'c6.7',
    title: 'La flessione deviata e i due teoremi',
    minutes: 36,
    source: D(5, '5.5.5', 'Teo 5.5.3–5.5.4', '120–122'),
    visual: SVG('sezione', { tab: 'deviata', section: 'doppioT', alpha: 30 }),
    steps: [
      {
        id: 'l67-1',
        kind: 'spiega',
        title: 'Dove siamo e dove andiamo',
        md: `Nella lezione precedente abbiamo risolto la flessione **retta**: con un momento lungo un asse principale centrale d'inerzia (APCdI) la tensione segue la formula di Navier, l'asse neutro è l'altro asse principale e il solido si inflette nel piano della coppia.

Ora il momento è **obliquo**: il vettore $\\vet M$ non sta su un asse principale, e la flessione è **deviata** (Def 5.5.2). Non serve risolvere un nuovo problema: per la sovrapposizione basta scomporre $\\vet M$ nelle componenti $M_x$ e $M_y$ e sommare le due flessioni rette. Ma il risultato riserva una sorpresa: **l'asse neutro non è più ortogonale all'asse di sollecitazione, e il solido non si inflette nel piano della coppia**.

Le tappe: gli angoli che servono per descrivere la situazione; la formula **binomia** e la formula **monomia**; il **primo teorema** della flessione, che dice dove sta l'asse neutro; il **secondo teorema**, che dice in quale piano si inflette il solido; infine la procedura che li mette insieme.`,
      },
      {
        id: 'l67-2',
        kind: 'spiega',
        title: 'Le rette in gioco sulla sezione',
        md: `Sulla sezione, in flessione deviata, si incontrano quattro rette per il baricentro $G$, ciascuna con il suo significato. Conviene averle chiare prima degli angoli.

- La direzione del **momento** $\\vet M$.
- L'**asse di sollecitazione** $s$, traccia del piano in cui la coppia fa ruotare il solido; è ortogonale a $\\vet M$ (lezione c6.5).
- L'**asse neutro** $n$, la retta dei punti in cui $\\sigma_z=0$. La dispensa lo orienta in modo che $\\vet M$ abbia componente positiva lungo $n$.
- L'**asse di flessione** $f$, traccia del piano in cui si incurva davvero l'asse del solido.

In flessione retta con $M_x$ queste rette erano semplici: $\\vet M$ e $n$ lungo $x$, $s$ e $f$ lungo $y$. In deviata, come vedremo, si separano.

Lo schema della dispensa per affrontare un esercizio è: disegnare sezione e momento; trovare gli APCdI; tracciare $s$; classificare la flessione.`,
      },
      {
        id: 'l67-3',
        kind: 'spiega',
        title: 'Gli angoli, tutti misurati da x',
        md: `Per ciascuna retta la dispensa definisce un angolo, sempre misurato a partire dall'asse $x$ (§5.5.5, figura di p. 121):
$$\\alpha=\\widehat{MGx},\\quad\\gamma=\\tfrac\\pi2+\\alpha,\\quad\\beta=\\widehat{nGx},\\quad\\theta=\\widehat{fGx}=\\tfrac\\pi2+\\beta,\\quad\\delta=\\widehat{fGs}=\\theta-\\gamma=\\beta-\\alpha.$$

Leggiamoli in ordine. $\\alpha$ è l'inclinazione del momento, $\\gamma$ quella dell'asse di sollecitazione: differiscono di 90° perché $s\\perp\\vet M$. $\\beta$ è l'inclinazione dell'asse neutro, $\\theta$ quella dell'asse di flessione; anch'essi differiscono di 90°, ma questo è un risultato (il secondo teorema), non una definizione.

L'ultimo angolo, $\\delta$, è l'**angolo di deviazione**: di quanto il piano in cui il solido si inflette è ruotato rispetto al piano della coppia. In flessione retta vale zero; in flessione deviata no, ed è questo che dà il nome al caso: **l'asse si inflette in un piano diverso da quello della coppia**.`,
      },
      {
        id: 'l67-4',
        kind: 'domanda',
        q: { id: 'l67-q2', kind: 'scelta', q: 'Che cosa misura l’angolo di deviazione $\\delta$?', options: ['L’angolo fra l’asse di flessione $f$ e l’asse di sollecitazione $s$', 'L’angolo fra $\\vet M$ e l’asse $x$', 'L’angolo fra l’asse neutro e l’asse $x$', 'L’angolo fra $\\vet M$ e $s$'], correct: 0, why: `$\\delta=\\widehat{fGs}=\\theta-\\gamma=\\beta-\\alpha$ (§5.5.5): di quanto il piano di inflessione devia da quello della coppia. L'angolo fra $\\vet M$ e $x$ è $\\alpha$, quello fra $n$ e $x$ è $\\beta$; fra $\\vet M$ e $s$ c'è sempre un angolo retto.` },
      },
      {
        id: 'l67-5',
        kind: 'spiega',
        title: 'La formula binomia',
        md: `Ora la tensione. Il momento ha componenti $M_x=M\\cos\\alpha$ e $M_y=M\\sin\\alpha$ lungo gli assi principali. Ciascuna produce una flessione retta, che sappiamo risolvere: $M_x$ dà $\\frac{M_x}{J_x}y$, $M_y$ dà $-\\frac{M_y}{J_y}x$. Per la sovrapposizione la tensione è la somma, la **formula binomia**:
$$\\sigma_z=\\frac{M_x}{J_x}\\,y-\\frac{M_y}{J_y}\\,x.$$

La formula è corretta ma scomoda (deduzione: la dispensa la presenta come sovrapposizione, il commento sulla scomodità è nostro). Le zone compresse dei due diagrammi sono diverse: $M_x$ comprime sopra l'asse $x$, $M_y$ comprime da un lato dell'asse $y$. Guardando la formula non si capisce subito dove la sezione è più sollecitata. Vorremmo una formula che, come Navier, dipenda da **una sola distanza**: la distanza dall'asse neutro.`,
      },
      {
        id: 'l67-6',
        kind: 'derivazione',
        title: 'La formula monomia',
        md: `Vogliamo scrivere la tensione come una formula di Navier rispetto all'asse neutro. Strategia: passare al riferimento ruotato $(n,f)$, con $n$ lungo l'asse neutro e $f$ ortogonale, in cui la tensione dipende solo da $f$. Il campione confronta le due formule in un punto a caso, con $\\alpha$ casuale.`,
        source: D(5, '5.5.5', undefined, 121),
        der: {
          sample,
          lines: [
            { tex: '\\sigma_z=\\frac{M_x}{J_x}y-\\frac{M_y}{J_y}x', why: `Binomia, con $M_x=M\\cos\\alpha$ e $M_y=M\\sin\\alpha$ (il campione usa $M=2$).`, val: (v) => S.sigmaZ({ N: 0, Mx: 2 * Math.cos(v.a), My: 2 * Math.sin(v.a) }, sec(v), pt(v)[0], pt(v)[1]) },
            {
              tex: '=\\frac{M_n}{J_n}f,\\quad M_n=M\\cos\\delta,\\quad J_n=J_x\\cos^2\\beta+J_y\\sin^2\\beta,\\quad f=-x\\sin\\beta+y\\cos\\beta',
              why: `È la formula **monomia**. $f$ è la coordinata del punto lungo l'asse ortogonale all'asse neutro, cioè la sua distanza (con segno) dall'asse neutro; $M_n$ è la componente di $\\vet M$ lungo $n$, che forma con $\\vet M$ l'angolo $\\delta$; $J_n$ è il momento d'inerzia rispetto a $n$, ottenuto ruotando gli assi principali (dove $J_{xy}=0$). Il valore del campione coincide con quello della binomia.`,
              val: (v) => S.monomia(2, v.a, sec(v), pt(v)[0], pt(v)[1]).sigma,
              eq: '§5.5.5',
            },
          ],
        },
      },
      {
        id: 'l67-7',
        kind: 'spiega',
        title: 'Lettura della monomia',
        md: `La formula monomia, $\\sigma_z=\\frac{M_n}{J_n}f$, è una **formula di Navier scritta rispetto all'asse neutro**: la tensione è proporzionale alla distanza $f$ dall'asse neutro, nulla su di esso, massima nei punti della sezione più lontani da esso. Per trovare il punto più sollecitato basta quindi tracciare l'asse neutro e cercare il punto più lontano, come nella flessione retta.

Le due coordinate del riferimento ruotato sono $n=x\\cos\\beta+y\\sin\\beta$ e $f=-x\\sin\\beta+y\\cos\\beta$: è la rotazione di un angolo $\\beta$.

Controllo sul caso retto: con $\\alpha=0$ il momento è lungo $x$, l'asse neutro è $x$ ($\\beta=0$) e $\\delta=0$. Allora $M_n=M=M_x$, $J_n=J_x$, $f=y$, e la monomia diventa $\\frac{M_x}{J_x}y$: **ritroviamo Navier**.

Resta però da sapere dove sta l'asse neutro, cioè quanto vale $\\beta$. Lo dice il primo teorema.`,
      },
      {
        id: 'l67-8',
        kind: 'spiega',
        title: 'Diametri coniugati: che cosa vuol dire',
        md: `Il primo teorema dirà che asse neutro e asse di sollecitazione sono **coniugati** rispetto all'ellisse centrale d'inerzia. Prima di dimostrarlo, chiariamo la parola (passaggio aggiunto: la dispensa usa la nozione senza richiamarla).

In un'ellisse, due diametri si dicono **coniugati** se ciascuno è parallelo alle tangenti all'ellisse negli estremi dell'altro. In un **cerchio** due diametri coniugati sono sempre **ortogonali**; in un'ellisse allungata, in generale **no**: tranne la coppia dei due assi dell'ellisse, i diametri coniugati formano un angolo diverso da 90°. La dispensa lo ricorda: le coppie coniugate non sono necessariamente ortogonali.

C'è un modo comodo per riconoscerli. Per un'ellisse con semiasse $a$ lungo $x$ e $b$ lungo $y$, due diametri di coefficienti angolari $m_1$ e $m_2$ sono coniugati quando $m_1m_2=-b^2/a^2$ (passaggio aggiunto). Nell'ellisse centrale d'inerzia il semiasse lungo $x$ è $\\rho_y$ e quello lungo $y$ è $\\rho_x$: la condizione diventa $m_1m_2=-\\rho_x^2/\\rho_y^2$. Tienila a mente.`,
      },
      {
        id: 'l67-9',
        kind: 'derivazione',
        title: 'Primo teorema: n e s sono coniugati',
        md: `Vogliamo una relazione fra l'inclinazione $\\beta$ dell'asse neutro e l'inclinazione $\\gamma$ dell'asse di sollecitazione. Strategia: l'asse neutro è il luogo dove la binomia si annulla; da qui si legge il suo coefficiente angolare $\\tan\\beta$, che poi si esprime con $\\gamma$.`,
        source: D(5, '5.5.5', 'Teo 5.5.3', 121),
        der: {
          sample,
          lines: [
            { tex: '\\frac{M_x}{J_x}y-\\frac{M_y}{J_y}x=0', why: `Sull'asse neutro la tensione è nulla: imponiamo che la binomia valga zero.`, aggiunto: true },
            { tex: '\\frac{M_x}{J_x}y=\\frac{M_y}{J_y}x', why: `Portiamo il secondo termine a destra: è l'equazione dell'asse neutro, una retta per il baricentro.` },
            { tex: '\\tan\\beta=\\frac yx=\\frac{M_y}{J_y}\\frac{J_x}{M_x}', why: `Il coefficiente angolare di una retta per l'origine è $y/x$, e vale $\\tan\\beta$ perché $\\beta$ è l'inclinazione dell'asse neutro. Lo ricaviamo dividendo l'equazione per $x$ e per $M_x/J_x$.` },
            {
              tex: '=\\frac{M\\sin\\alpha}{A\\rho_y^2}\\,\\frac{A\\rho_x^2}{M\\cos\\alpha}',
              why: `Sostituiamo le componenti del momento, $M_y=M\\sin\\alpha$ e $M_x=M\\cos\\alpha$, e i momenti d'inerzia scritti con i raggi d'inerzia, $J=A\\rho^2$.`,
              aggiunto: true,
            },
            { tex: '=\\tan\\alpha\\,\\frac{\\rho_x^2}{\\rho_y^2}', why: `$M$ e $A$ si semplificano, e $\\sin\\alpha/\\cos\\alpha=\\tan\\alpha$.` },
            {
              tex: '\\tan\\alpha=-\\frac1{\\tan\\gamma}',
              why: `Ora passiamo da $\\alpha$ a $\\gamma$. Siccome $\\gamma=\\frac\\pi2+\\alpha$, le due rette sono ortogonali, e per due rette ortogonali il prodotto dei coefficienti angolari è $-1$.`,
              ask: { q: 'Come si esprime $\\tan\\alpha$ con $\\gamma=\\frac\\pi2+\\alpha$?', options: ['$\\tan\\alpha=-1/\\tan\\gamma$', '$\\tan\\alpha=\\tan\\gamma$', '$\\tan\\alpha=1/\\tan\\gamma$', '$\\tan\\alpha=-\\tan\\gamma$'], correct: 0, why: `$\\tan(\\frac\\pi2+\\alpha)=-\\cot\\alpha$, quindi $\\tan\\gamma\\tan\\alpha=-1$: è la condizione di ortogonalità fra $\\vet M$ e $s$. Senza il segno meno le due rette sarebbero simmetriche rispetto alla bisettrice, non ortogonali.` },
            },
            {
              tex: '\\tan\\beta\\,\\tan\\gamma',
              why: `Moltiplichiamo $\\tan\\beta=\\tan\\alpha\\,\\rho_x^2/\\rho_y^2$ per $\\tan\\gamma$ e usiamo la riga precedente: $\\tan\\alpha\\tan\\gamma=-1$. Il valore del campione è calcolato dagli angoli del motore.`,
              val: (v) => Math.tan(ang(v).beta) * Math.tan(ang(v).gamma),
            },
            {
              tex: '=-\\frac{\\rho_x^2}{\\rho_y^2}',
              why: `È proprio la condizione $m_1m_2=-\\rho_x^2/\\rho_y^2$ del passo precedente: asse neutro e asse di sollecitazione sono **diametri coniugati** dell'ellisse centrale d'inerzia.`,
              ask: { q: 'Che cosa significa la relazione trovata?', options: ['Che $n$ e $s$ sono diametri coniugati dell’ellisse centrale d’inerzia', 'Che $n$ e $s$ sono ortogonali', 'Che la flessione è retta', 'Che $\\delta=0$'], correct: 0, why: `Teo 5.5.3. Ortogonali sarebbero se il prodotto valesse $-1$, cioè se $\\rho_x=\\rho_y$ (ellisse circolare): coniugati, non necessariamente ortogonali.` },
              val: (v) => -(sec(v).Jx / sec(v).Jy),
              eq: 'Teo 5.5.3',
            },
          ],
          checks: [{ what: '$\\tan\\beta=\\tan\\alpha\\,\\rho_x^2/\\rho_y^2$', f: (v) => [Math.tan(ang(v).beta), Math.tan(v.a) * (sec(v).Jx / sec(v).Jy)] }],
        },
      },
      {
        id: 'l67-10',
        kind: 'spiega',
        title: 'Lettura del primo teorema',
        md: `Il **Teo 5.5.3** dice: **l'asse neutro e l'asse di sollecitazione sono coniugati rispetto all'ellisse centrale d'inerzia**, $\\tan\\beta\\tan\\gamma=-\\rho_x^2/\\rho_y^2$.

Che cosa significa in pratica? Dalla relazione $\\tan\\beta=\\tan\\alpha\\,\\rho_x^2/\\rho_y^2$, siccome $\\rho_x>\\rho_y$ (l'asse $x$ è quello di inerzia massima), $|\\tan\\beta|>|\\tan\\alpha|$: l'asse neutro è **più inclinato** del momento, cioè ruotato verso l'asse $y$, quello di inerzia minima (deduzione). Più la sezione è «sbilanciata», come il doppio T, più l'effetto è forte.

Due controlli. Se l'ellisse è un cerchio, $\\rho_x=\\rho_y$, il prodotto vale $-1$ e $n\\perp s$: è il caso del quadrato, in cui la flessione è sempre retta. Se il momento è lungo $x$, $\\alpha=0$ dà $\\tan\\beta=0$: l'asse neutro è $x$, come in Navier.`,
      },
      {
        id: 'l67-11',
        kind: 'domanda',
        q: { id: 'l67-q3', kind: 'vf', q: 'In flessione deviata l’asse neutro è sempre ortogonale all’asse di sollecitazione.', answer: false, why: `Sono coniugati rispetto all'ellisse centrale d'inerzia, e due diametri coniugati sono ortogonali solo se l'ellisse è un cerchio o se coincidono con i suoi assi, cioè in flessione retta (Teo 5.5.3). È l'errore più comune: si estende alla deviata ciò che vale nella retta.` },
      },
      {
        id: 'l67-12',
        kind: 'spiega',
        title: 'In quale piano si inflette il solido?',
        md: `Sappiamo dove sta l'asse neutro; ora ci chiediamo come si deforma l'asse del solido. In flessione retta con $M_x$ si spostava solo lungo $y$; ora ci sono due componenti, e potremmo temere che l'asse diventi una curva sghemba, per esempio un'elica.

Non è così, e il motivo è semplice. Dai due casi retti, lo spostamento dei punti dell'asse ha componenti
$$v^{dp}=-\\frac{M_x}{2EJ_x}z^2,\\qquad u^{dp}=\\frac{M_y}{2EJ_y}z^2.$$
Entrambe crescono come $z^2$: hanno **la stessa dipendenza da $z$**. Il loro rapporto $v^{dp}/u^{dp}$ è quindi lo stesso in ogni sezione, cioè tutti i punti dell'asse si spostano nella **stessa direzione** del piano $xy$. L'asse deformato giace in un piano: il **piano di flessione**, la cui traccia sulla sezione è l'asse di flessione $f$, inclinato di $\\theta$ con $\\tan\\theta=v^{dp}/u^{dp}$.`,
      },
      {
        id: 'l67-13',
        kind: 'derivazione',
        title: 'Secondo teorema: f è ortogonale a n',
        md: `Vogliamo l'inclinazione $\\theta$ dell'asse di flessione e confrontarla con quella dell'asse neutro. Strategia: calcolare $\\tan\\theta$ come rapporto degli spostamenti dell'asse, esprimerlo con $\\gamma$ e poi usare il primo teorema per arrivare a $\\beta$.`,
        source: D(5, '5.5.5', 'Teo 5.5.4', 122),
        der: {
          sample,
          lines: [
            {
              tex: '\\tan\\theta=\\frac{v^{dp}}{u^{dp}}',
              why: `Il piano di flessione contiene l'asse deformato: la sua traccia ha coefficiente angolare uguale al rapporto fra spostamento lungo $y$ e lungo $x$, che non dipende da $z$. Il campione calcola il rapporto dal campo di spostamento del motore.`,
              val: (v) => {
                const d = S.displacement({ N: 0, Mx: Math.cos(v.a), My: Math.sin(v.a) }, sec(v), v.E, v.nu, [0, 0, v.z + 0.5]);
                return d[1] / d[0];
              },
            },
            {
              tex: '=-\\frac{M_x}{J_x}\\frac{J_y}{M_y}',
              why: `Sostituiamo i due spostamenti: il fattore $\\frac{z^2}{2E}$ si semplifica e restano i rapporti fra momenti e momenti d'inerzia.`,
              val: (v) => -(Math.cos(v.a) / sec(v).Jx) * (sec(v).Jy / Math.sin(v.a)),
            },
            {
              tex: '=-\\frac1{\\tan\\alpha}\\,\\frac{\\rho_y^2}{\\rho_x^2}',
              why: `Con $M_x/M_y=\\cos\\alpha/\\sin\\alpha=1/\\tan\\alpha$ e $J_y/J_x=\\rho_y^2/\\rho_x^2$ (l'area si semplifica).`,
              val: (v) => (-1 / Math.tan(v.a)) * (sec(v).Jy / sec(v).Jx),
              aggiunto: true,
            },
            {
              tex: '=\\tan\\gamma\\,\\frac{\\rho_y^2}{\\rho_x^2}',
              why: `Usiamo di nuovo l'ortogonalità fra $\\vet M$ e $s$: $-1/\\tan\\alpha=\\tan\\gamma$.`,
              val: (v) => Math.tan(ang(v).gamma) * (sec(v).Jy / sec(v).Jx),
            },
            {
              tex: '=-\\frac1{\\tan\\beta}',
              why: `Dal primo teorema, $\\tan\\gamma=-\\frac{\\rho_x^2}{\\rho_y^2}\\frac1{\\tan\\beta}$: moltiplicando per $\\rho_y^2/\\rho_x^2$ i raggi d'inerzia si semplificano.`,
              ask: { q: 'Quale risultato serve per passare da $\\gamma$ a $\\beta$?', options: ['Il primo teorema della flessione', 'La formula monomia', 'Il postulato di Saint-Venant', 'La formula di Navier'], correct: 0, why: `Il primo teorema lega proprio $\\beta$ e $\\gamma$: $\\tan\\beta\\tan\\gamma=-\\rho_x^2/\\rho_y^2$. La monomia usa $\\beta$ ma non lo determina; il postulato non riguarda gli angoli.` },
              val: (v) => -1 / Math.tan(ang(v).beta),
            },
            {
              tex: '\\tan\\theta\\,\\tan\\beta=-1',
              why: `Moltiplicando per $\\tan\\beta$: il prodotto dei coefficienti angolari di $f$ e $n$ vale $-1$, quindi **l'asse di flessione è ortogonale all'asse neutro**.`,
              eq: 'Teo 5.5.4',
            },
          ],
        },
      },
      {
        id: 'l67-14',
        kind: 'spiega',
        title: 'Lettura del secondo teorema e la procedura',
        md: `Il **Teo 5.5.4** dice: **l'asse di flessione è ortogonale all'asse neutro**, $\\tan\\theta\\tan\\beta=-1$. Il solido si inflette quindi nel piano ortogonale all'asse neutro, non in quello della coppia: le due direzioni differiscono dell'angolo di deviazione $\\delta=\\beta-\\alpha$.

Ha anche un significato intuitivo (deduzione): le sezioni ruotano attorno all'asse neutro, come nella flessione retta, e l'asse del solido si incurva perpendicolarmente a quella cerniera.

I due teoremi danno insieme una **procedura** in tre passi:
$$(M,\\alpha)\\ \\to\\ s\\ \\xrightarrow{\\ \\text{I teorema}\\ }\\ n\\ \\xrightarrow{\\ \\text{II teorema}\\ }\\ f.$$
Dal momento si traccia $s$, ortogonale a $\\vet M$; il primo teorema dà $n$, coniugato di $s$; il secondo dà $f$, ortogonale a $n$.

Controllo sul caso retto: $\\alpha=0$ dà $\\beta=0$ ($n\\equiv x$) e $\\theta=\\pi/2$ ($f\\equiv y$); $\\delta=0$, il solido si inflette nel piano della coppia e la monomia torna Navier.`,
      },
      {
        id: 'l67-15',
        kind: 'prova',
        title: 'Ruota il momento',
        md: 'Il diagramma della sezione mostra l’ellisse centrale d’inerzia e le rette $s$, $n$, $f$; con il cursore cambi $\\alpha$.',
        tasks: [
          'Doppio T, $\\alpha=30°$: guarda quanto l’asse neutro $n$ è ruotato verso l’asse $y$ rispetto a $\\vet M$. L’angolo di deviazione $\\delta$ è grande.',
          'Porta $\\alpha$ a 0° o a 90°: la flessione diventa retta, $n$ è ortogonale a $s$ e $f$ coincide con $s$.',
          'Scegli il cerchio: per ogni $\\alpha$ l’asse neutro è ortogonale a $s$, perché l’ellisse è circolare.',
          'Leggi nella tabella la verifica del primo teorema: $\\tan\\beta\\tan\\gamma$ coincide con $-\\rho_x^2/\\rho_y^2$.',
        ],
        visual: SVG('sezione', { tab: 'deviata', section: 'doppioT', alpha: 30 }),
      },
      {
        id: 'l67-16',
        kind: 'prova',
        title: 'Il solido in flessione deviata',
        md: 'Lo stesso nel modello 3D: sulla base di destra sono disegnati $\\vet M$ (doppia freccia), $s$, $n$ e $f$.',
        tasks: [
          'Imposta $\\alpha=30°$ sul doppio T e scegli la vista dalla base di destra: l’asse $f$ è lontano da $s$, e il solido si sposta lungo $f$.',
          'Guarda i colori sulla base: l’asse neutro $n$ separa la zona rossa (trazione) da quella blu (compressione).',
          'Verifica a occhio che $f$ è ortogonale a $n$, mentre $s$ non lo è.',
        ],
        visual: { kind: 'trave3d', scene: { mode: 'flessione', section: 'doppioT', alpha: 30, controls: ['section', 'alpha', 'amp'] } },
      },
      {
        id: 'l67-17',
        kind: 'domanda',
        q: { id: 'l67-q1', kind: 'vf', q: 'In flessione deviata il solido si inflette nel piano della coppia.', answer: false, why: `Si inflette nel piano di $f$, ortogonale all'asse neutro, che differisce dal piano della coppia (traccia $s$) dell'angolo di deviazione $\\delta$ (Teo 5.5.4). L'intuizione «si piega dove lo spingo» vale solo in flessione retta.` },
      },
      {
        id: 'l67-18',
        kind: 'spiega',
        title: 'Attenzione a…',
        md: `Tre errori tipici sulla flessione deviata.

1. **Disegnare l'asse neutro ortogonale a $s$.** Lo è solo in flessione retta o con ellisse circolare; in generale $n$ è il coniugato di $s$.
2. **Confondere coniugato con ortogonale.** Due diametri coniugati di un'ellisse sono ortogonali solo se l'ellisse è un cerchio o se sono i suoi assi.
3. **Pensare che il solido si inflette nel piano della coppia.** Si inflette nel piano ortogonale all'asse neutro, ruotato di $\\delta$ rispetto a quello della coppia.`,
      },
      {
        id: 'l67-19',
        kind: 'riassunto',
        md: `**Il filo della lezione.** Un momento obliquo si scompone lungo gli assi principali, e la tensione è la somma di due flessioni rette: la formula binomia. Riscritta rispetto all'asse neutro diventa la formula monomia, una Navier in cui conta solo la distanza dall'asse neutro. Imponendo $\\sigma_z=0$ si trova che l'asse neutro è il coniugato dell'asse di sollecitazione rispetto all'ellisse centrale d'inerzia (primo teorema). Gli spostamenti dell'asse hanno la stessa dipendenza da $z$, quindi l'asse si inflette in un piano, che risulta ortogonale all'asse neutro (secondo teorema): diverso, in generale, dal piano della coppia.

- Binomia: $\\sigma_z=\\frac{M_x}{J_x}y-\\frac{M_y}{J_y}x$ (§5.5.5).
- Monomia: $\\sigma_z=\\frac{M_n}{J_n}f$, $M_n=M\\cos\\delta$, $J_n=J_x\\cos^2\\beta+J_y\\sin^2\\beta$ (§5.5.5).
- Primo teorema: $\\tan\\beta\\,\\tan\\gamma=-\\frac{\\rho_x^2}{\\rho_y^2}$ (Teo 5.5.3).
- Secondo teorema: $\\tan\\theta\\,\\tan\\beta=-1$ (Teo 5.5.4).
- Procedura: $(M,\\alpha)\\to s\\to n\\to f$.`,
        orale: ['Flessione deviata: angoli, binomia e monomia, I e II teorema con dimostrazione. (dispensa, domanda 8)'],
      },
    ],
  },
  // ================================================================== c6.8 (facoltativo)
  {
    concept: 'c6.8',
    title: 'Sforzo normale eccentrico e nocciolo (facoltativo)',
    minutes: 30,
    source: D(5, '5.6', 'Def 5.6.1–5.6.2', '122–125'),
    visual: SVG('sezione', { tab: 'nocciolo', section: 'rettangolo', yc: 10 }),
    steps: [
      {
        id: 'l68-1',
        kind: 'spiega',
        title: 'Dove siamo e dove andiamo',
        md: `**Argomento facoltativo.** La dispensa avverte che questo caso è negli appunti ma **non è stato trattato a lezione** (§5.6): lo trovi qui per completezza, e la domanda d'orale corrispondente resta nell'elenco della dispensa.

Nelle lezioni precedenti abbiamo risolto lo sforzo normale (una forza lungo l'asse, nel baricentro) e la flessione (una coppia). Che cosa succede se la forza è parallela all'asse ma **non passa per il baricentro**? È ciò che accade a un pilastro caricato fuori centro, o a una fondazione.

Non serve un problema nuovo: è il **quinto caso derivato** di cui parlava la lezione c6.4, che si ottiene sommando sforzo normale e flessione. Le tappe: la coppia di trasporto e il centro di sollecitazione; la formula **trinomia**; l'asse neutro come **antipolare** del centro; il **nocciolo centrale d'inerzia**; infine i materiali che non reagiscono a trazione, con la **parzializzazione** e la **regola delle 3u** per il rettangolo.`,
      },
      {
        id: 'l68-2',
        kind: 'spiega',
        title: 'Il centro di sollecitazione e la coppia di trasporto',
        md: `La **Def 5.6.1** dice: le forze sulle basi sono equivalenti a due forze uguali e opposte, **parallele all'asse ma non passanti per il baricentro**. Il punto in cui la retta d'azione della forza buca la sezione si chiama **centro di sollecitazione** $c$, di coordinate $(x_c,y_c)$; si parla di centro di trazione o di compressione secondo il segno di $N$.

Per ricondurci ai casi noti, **trasportiamo** la forza nel baricentro $G$. Spostare una forza parallelamente a sé stessa richiede di aggiungere la coppia di trasporto, cioè il momento della forza rispetto al nuovo punto:
$$\\vet M=(c-G)\\wedge N\\hat e_z=N\\,y_c\\,\\hat e_x-N\\,x_c\\,\\hat e_y.$$
Quindi $M_x=Ny_c$ e $M_y=-Nx_c$, o al contrario $x_c=-\\frac{M_y}N$ e $y_c=\\frac{M_x}N$.

La distanza di $c$ dal baricentro è l'**eccentricità** $e$, e $|\\vet M|=|N|\\,e$. La retta $c-G$ è l'asse di sollecitazione della flessione associata.`,
      },
      {
        id: 'l68-3',
        kind: 'derivazione',
        title: 'La formula trinomia',
        md: `Vogliamo la tensione in funzione della posizione del centro di sollecitazione. Strategia: sommare lo sforzo normale e le due flessioni rette, poi sostituire i momenti con la coppia di trasporto e i momenti d'inerzia con i raggi d'inerzia. Il campione prende un centro a caso.`,
        source: D(5, '5.6', undefined, 123),
        der: {
          sample,
          lines: [
            { tex: '\\sigma_z=\\frac NA+\\frac{M_x}{J_x}y-\\frac{M_y}{J_y}x', why: `Sovrapposizione: lo sforzo normale dà $N/A$, la flessione dà la binomia della lezione c6.7.`, val: (v) => S.sigmaZ({ N: v.N, Mx: v.N * v.y, My: -v.N * v.x }, sec(v), pt(v)[0], pt(v)[1]) },
            {
              tex: '=\\frac NA+\\frac{N\\,y_c}{J_x}y+\\frac{N\\,x_c}{J_y}x',
              why: `Sostituiamo la coppia di trasporto, $M_x=Ny_c$ e $M_y=-Nx_c$: il segno meno di $M_y$ e quello della binomia si compensano. Nel campione $x_c$ e $y_c$ sono le variabili $x$ e $y$.`,
              val: (v) => v.N / sec(v).A + ((v.N * v.y) / sec(v).Jx) * pt(v)[1] + ((v.N * v.x) / sec(v).Jy) * pt(v)[0],
              aggiunto: true,
            },
            {
              tex: '=\\frac NA\\Big(1+\\frac{xx_c}{\\rho_y^2}+\\frac{yy_c}{\\rho_x^2}\\Big)',
              why: `Raccogliamo $N/A$ e scriviamo i momenti d'inerzia con i raggi d'inerzia, $J_x=A\\rho_x^2$ e $J_y=A\\rho_y^2$: è la formula **trinomia**.`,
              val: (v) => S.trinomia(v.N, [v.x, v.y], sec(v), pt(v)[0], pt(v)[1]),
              eq: '§5.6',
            },
          ],
        },
      },
      {
        id: 'l68-4',
        kind: 'spiega',
        title: 'L’asse neutro: polo e antipolare',
        md: `Esiste anche una forma più compatta: con la flessione scritta in forma monomia, $\\sigma_z=\\frac NA+\\frac{M_n}{J_n}f$ (formula **binomia** dello sforzo normale eccentrico).

L'asse neutro si trova annullando la parentesi della trinomia:
$$1+\\frac{x\\,x_c}{\\rho_y^2}+\\frac{y\\,y_c}{\\rho_x^2}=0.$$
È una retta che **non passa per il baricentro** (in $G$ il primo membro vale 1). Le sue intercette sugli assi sono $\\big(-\\rho_y^2/x_c,\\,0\\big)$ e $\\big(0,\\,-\\rho_x^2/y_c\\big)$: hanno segno opposto alle coordinate di $c$, quindi l'asse neutro sta **dalla parte opposta** al centro di sollecitazione.

La dispensa dice che $c$ e $n$ sono **polo e antipolare** nella polarità d'inerzia: a ogni punto corrisponde una retta, e viceversa. Si noti la reciprocità: più $c$ è vicino al baricentro, più l'asse neutro è lontano. L'asse neutro $n'$ della sola flessione associata è parallelo a $n$ e passa per il baricentro. Il diagramma di $\\sigma_z$ è lineare: nullo su $n$, uguale a $N/A$ su $n'$.`,
      },
      {
        id: 'l68-5',
        kind: 'domanda',
        q: { id: 'l68-q2', kind: 'scelta', q: 'Il centro di sollecitazione si avvicina al baricentro. Che cosa fa l’asse neutro?', options: ['Si allontana dal baricentro, restando dalla parte opposta a $c$', 'Si avvicina al baricentro', 'Passa sempre per il baricentro', 'Resta fermo'], correct: 0, why: `Le intercette $-\\rho_y^2/x_c$ e $-\\rho_x^2/y_c$ crescono in modulo quando $x_c$, $y_c$ diminuiscono (§5.6). Nel limite $c\\equiv G$ l'asse neutro va all'infinito e la tensione è uniforme. Passa per il baricentro solo nella flessione pura, $N\\to0$.` },
      },
      {
        id: 'l68-6',
        kind: 'spiega',
        title: 'Il nocciolo centrale d’inerzia',
        md: `Domanda pratica: dove deve stare $c$ perché la sezione sia **tutta compressa** (o tutta tesa)? Serve che l'asse neutro non tagli la sezione.

La **Def 5.6.2** risponde: il **nocciolo centrale d'inerzia** è il luogo degli antipoli delle rette che **non tagliano** la sezione. Il suo **contorno** è dato dagli antipoli delle rette **radenti**, quelle che toccano la sezione senza attraversarla.

La dispensa (figura di p. 124) percorre l'asse di sollecitazione allontanando $c$ dal baricentro:
- $c_1\\equiv G$: tensione **uniforme**, è lo sforzo normale centrato;
- $c_2$ interno al nocciolo: diagramma a **trapezio**, sezione tutta compressa (o tutta tesa);
- $c_3$ sul contorno del nocciolo: diagramma a **triangolo**, tensione nulla in un lembo;
- $c_4$ esterno: diagramma a **farfalla**, una parte tesa e una compressa;
- $c_5\\to\\infty$ con $N\\to0$: si ritrova la flessione semplice.

Allontanandosi dal baricentro, la compressione massima cresce.`,
      },
      {
        id: 'l68-7',
        kind: 'spiega',
        title: 'Il nocciolo del rettangolo',
        md: `Per il rettangolo $B\\times H$ il nocciolo è il **rombo dei terzi medi**: un rombo con i vertici sugli assi, a $\\pm H/6$ lungo $y$ e $\\pm B/6$ lungo $x$ (§5.6.2).

Verifichiamolo su un vertice (passaggio aggiunto). La retta radente il lato inferiore è $y=H/2$. Il suo antipolo ha $x_c=0$, e dall'intercetta $H/2=-\\rho_x^2/y_c$ si ricava $y_c=-2\\rho_x^2/H$. Per il rettangolo $\\rho_x^2=J_x/A=H^2/12$, quindi $y_c=-H/6$: il vertice del nocciolo è a un sesto dell'altezza dal baricentro, dalla parte opposta al lato radente.

Ne segue la regola pratica: se il centro di compressione cade nel **terzo medio** della sezione, la sezione è tutta compressa. Non confondere il nocciolo con l'ellisse d'inerzia: sono costruiti diversamente e hanno forme diverse.`,
      },
      {
        id: 'l68-8',
        kind: 'prova',
        title: 'Sposta il centro di sollecitazione',
        md: 'Il diagramma mostra la sezione, il nocciolo e l’asse neutro; con i cursori $x_c$ e $y_c$ sposti il centro di sollecitazione.',
        tasks: [
          'Con $c$ dentro il nocciolo, l’asse neutro non taglia la sezione: è tutta compressa.',
          'Porta $c$ sul contorno del nocciolo: l’asse neutro diventa radente alla sezione.',
          'Porta $c$ fuori dal nocciolo: l’asse neutro taglia la sezione, che ha una parte tesa.',
        ],
        visual: SVG('sezione', { tab: 'nocciolo', section: 'rettangolo', yc: 10 }),
      },
      {
        id: 'l68-9',
        kind: 'spiega',
        title: 'Materiali che non reagiscono a trazione',
        md: `Fin qui il materiale reagiva sia a trazione sia a compressione. Ci sono però situazioni di **contatto unilatero**, in cui la trazione non può essere trasmessa: una fondazione appoggiata sul terreno, la ruota sulla strada, il piede sul suolo, gli archi in muratura (§5.6.2). La dispensa distingue quattro casi.

- **$c$ nel nocciolo o sul suo contorno**: la sezione è tutta compressa, quindi nulla cambia e la soluzione è quella trinomia.
- **$c$ fuori dal nocciolo**: la trinomia darebbe trazioni che il materiale non sopporta. La sezione si **parzializza**: reagisce solo una parte, scelta in modo che $c$ cada sul contorno del **suo** nocciolo. Il diagramma è triangolare, vale $N/A_{reag}$ nel baricentro della parte reagente, e la compressione cresce man mano che $c$ si allontana: la dispensa parla di una «saracinesca che si chiude».
- **$c$ sul contorno della sezione**: reagisce un solo punto, e la tensione tende all'infinito («ballerina sulle punte»).
- **$c$ fuori dalla sezione**: l'equilibrio è impossibile, il corpo si ribalta.

Il problema è **non lineare e implicito**: la parte reagente dipende dalla soluzione.`,
      },
      {
        id: 'l68-10',
        kind: 'domanda',
        q: { id: 'l68-q1', kind: 'scelta', q: 'Che cosa accade a un materiale non reagente a trazione con il centro di sollecitazione fuori dalla sezione?', options: ['L’equilibrio è impossibile (ribaltamento)', 'La sezione è tutta compressa', 'Reagisce l’intera sezione', 'La tensione è uniforme'], correct: 0, why: `La risultante delle compressioni deve passare per $c$, ma le compressioni agiscono solo dentro la sezione: se $c$ è fuori, nessuna distribuzione possibile la equilibra (§5.6.2). Con $c$ sul contorno reagisce un punto; dentro il nocciolo la sezione è tutta compressa.` },
      },
      {
        id: 'l68-11',
        kind: 'derivazione',
        title: 'Rettangolo: la regola delle 3u',
        md: `Vogliamo la tensione massima in un rettangolo $B\\times H$ parzializzato, con $c$ su un asse di simmetria, fuori dal nocciolo, a distanza $u$ dal lembo compresso. Strategia: il diagramma è triangolare; la sua risultante deve valere $N$ e passare per $c$. Il campione usa un'eccentricità $e=0{,}3H$, fuori dal nocciolo.`,
        source: D(5, '5.6.2', undefined, 125),
        der: {
          sample,
          lines: [
            {
              tex: 'R=\\tfrac12\\sigma_{\\max}\\,B\\,h',
              why: `La parte reagente è alta $h$, con tensione che va da $\\sigma_{\\max}$ sul lembo compresso a zero. La risultante è il volume del prisma triangolare: area del triangolo, $\\frac12\\sigma_{\\max}h$, per la larghezza $B$.`,
              aggiunto: true,
            },
            {
              tex: '\\frac h3=u\\quad\\Rightarrow\\quad h=3u',
              why: `La risultante di un diagramma triangolare sta a un terzo dell'altezza dal lato più carico, cioè dal lembo più compresso: è il **centro di pressione**. Perché ci sia equilibrio deve passare per $c$, che dista $u$ da quel lembo.`,
            },
            {
              tex: 'N=\\tfrac12\\sigma_{\\max}B\\,(3u)',
              why: `Imponiamo che la risultante sia uguale alla forza applicata, con $h=3u$. Il valore del campione è ricostruito con la soluzione del motore.`,
              val: (v) => { const r = S.treU(Math.abs(v.N) + 1, v.B, v.H, 0.3 * v.H); return 0.5 * r.sMax * v.B * r.reag; },
            },
            {
              tex: '\\Rightarrow\\ \\sigma_{\\max}=\\frac{2N}{3uB}',
              why: `Risolvendo per $\\sigma_{\\max}$: è la **regola delle 3u**. Il valore in tabella è $|N|$, il dato del motore, che coincide con la riga precedente.`,
              val: (v) => Math.abs(v.N) + 1,
              eq: '§5.6.2',
            },
          ],
        },
      },
      {
        id: 'l68-12',
        kind: 'spiega',
        title: 'Lettura della regola delle 3u',
        md: `La regola dice che la parte reagente è alta **tre volte** la distanza $u$ del centro di sollecitazione dal lembo compresso, e che la tensione massima è $\\sigma_{\\max}=\\frac{2N}{3uB}$ (figura di p. 125).

Controlliamola sul caso limite (deduzione). Se $c$ è proprio sul vertice del nocciolo, $u=\\frac H2-\\frac H6=\\frac H3$ e $3u=H$: reagisce tutta la sezione, con diagramma triangolare, come previsto per $c$ sul contorno del nocciolo. La formula dà $\\sigma_{\\max}=\\frac{2N}{BH}$, il doppio della tensione media.

Se $c$ si avvicina al lembo, $u\\to0$: la parte reagente si riduce a zero e $\\sigma_{\\max}\\to\\infty$, è la «ballerina sulle punte».`,
      },
      {
        id: 'l68-13',
        kind: 'prova',
        title: 'Parzializzazione nel rettangolo',
        md: 'Lo stesso diagramma, con l’opzione «non reagente a trazione» attiva.',
        tasks: [
          'Porta $c$ sull’asse $y$, fuori dal nocciolo: la parte tesa sparisce e resta una zona reagente.',
          'Leggi l’altezza reagente: è $3u$, tre volte la distanza di $c$ dal lembo compresso.',
          'Avvicina $c$ al lembo: la zona reagente si stringe e la tensione massima cresce.',
        ],
        visual: SVG('sezione', { tab: 'nocciolo', section: 'rettangolo', yc: 10, nontrazione: true }),
      },
      {
        id: 'l68-14',
        kind: 'spiega',
        title: 'Attenzione a…',
        md: `Tre errori tipici.

1. **Dimenticare che l'argomento è segnalato come non trattato a lezione.** Va conosciuto per completezza, ma la dispensa lo dichiara facoltativo.
2. **Confondere il nocciolo con l'ellisse d'inerzia.** L'ellisse riporta i raggi d'inerzia; il nocciolo è il luogo degli antipoli delle rette che non tagliano la sezione. Per il rettangolo il nocciolo è un rombo, l'ellisse no.
3. **Usare la trinomia per un materiale non reagente a trazione con $c$ fuori dal nocciolo.** La trinomia darebbe trazioni che il materiale non può sopportare: bisogna parzializzare la sezione.`,
      },
      {
        id: 'l68-15',
        kind: 'riassunto',
        md: `**Il filo della lezione** (argomento non trattato a lezione). Una forza parallela all'asse ma fuori dal baricentro si trasporta nel baricentro aggiungendo una coppia: il caso diventa sforzo normale più flessione, e la tensione è data dalla formula trinomia. L'asse neutro è l'antipolare del centro di sollecitazione nella polarità d'inerzia, e sta dalla parte opposta. Il nocciolo centrale d'inerzia raccoglie i centri per cui l'asse neutro non taglia la sezione, cioè la sezione è tutta compressa; per il rettangolo è il rombo dei terzi medi. Se il materiale non reagisce a trazione e $c$ esce dal nocciolo, la sezione si parzializza; nel rettangolo reagisce un'altezza $3u$.

- Centro di sollecitazione: $x_c=-\\frac{M_y}N$, $y_c=\\frac{M_x}N$ (Def 5.6.1).
- Trinomia: $\\sigma_z=\\frac NA\\Big(1+\\frac{xx_c}{\\rho_y^2}+\\frac{yy_c}{\\rho_x^2}\\Big)$ (§5.6).
- Regola delle 3u: $\\sigma_{\\max}=\\frac{2N}{3uB}$ (§5.6.2).`,
        orale: ['SNE, nocciolo, materiale non reagente a trazione, regola delle 3u. (dispensa, domanda 9; argomento non trattato a lezione)'],
      },
    ],
  },
];
