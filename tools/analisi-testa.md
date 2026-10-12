# ANALISI — Fase 0

> Fonte unica: *Scienza delle Costruzioni — Dispensa didattica* (159 pagine numerate + indice). Trascrizione in `tools/testi/cap-01.md … cap-06.md`; testo estratto originale in `tools/fonte/dispensa.txt`. I concetti sono dati in `tools/grafo.py` (questo file ne genera le tabelle: `python3 tools/analisi.py`).

## 1. Inventario della fonte

| Cap. | Titolo | Pagine | Caratteri estratti | Domande «Per l'orale» della dispensa |
|---|---|---|---|---|
| 1 | Algebra e analisi tensoriale | 1–14 | 30 k | 11 |
| 2 | Analisi della deformazione | 15–35 | 41 k | 13 |
| 3 | Analisi della tensione | 36–65 | 57 k | 14 |
| 4 | Legami costitutivi. Solidi elastici lineari | 66–98 | 74 k | 14 |
| 5 | Il problema di Saint-Venant | 99–143 | 92 k | 12 |
| 6 | Criteri di resistenza | 144–159 | 35 k | 10 |

- **Forma della fonte.** Dal progetto Claude arriva solo il testo estratto del PDF (non le pagine come immagini): formule ricostruite in LaTeX dal contesto (2014 formule, tutte valide in KaTeX) e figure descritte dalle etichette rimaste nel testo. Le pagine 34 e 141 hanno poco testo (fine capitolo/figure). → NF-03, NF-12.
- **Numerazione.** La dispensa numera **Definizioni, Teoremi, Proposizioni** (es. *Teo 3.6.1*) e pochissime equazioni: (1.1), (2.1), (2.2), (2.3), (5.1). L'app cita quindi «§, Def/Teo/Prop, eq., p.».
- **Domande d'orale.** Ogni capitolo chiude con un riquadro «Per l'orale — domande tipiche»: **74 domande dalla fonte**, base della banca delle domande. Ci sono anche riquadri «Per l'orale» dentro il testo (punti da saper argomentare).
- **Note della dispensa sugli appunti.** La dispensa stessa corregge vari errori «degli appunti» (box *Attenzione*): l'app adotta sempre la lettura della dispensa.
- **Avvertenze sul programma (dalla dispensa):** §4.1 *linee isostatiche* «non richiesto all'orale»; §5.6 *sforzo normale eccentrico* «presente negli appunti ma non trattato a lezione». Nell'app sono **facoltativi** (NF-07).

## 2. Che cosa NON c'è (rispetto al prompt di partenza)
Il prompt elencava argomenti tipici di SdC. **Non sono nella dispensa** e quindi non entrano nell'app: travi e sistemi di travi come teoria a sé (linea elastica, diagrammi N/T/M di strutture), metodi per le iperstatiche (metodo delle forze, PLV applicato alle strutture), stabilità dell'equilibrio (Eulero). Ci sono invece: il **teorema dei lavori virtuali** per il continuo (§4.3), la linea elastica solo come «analogia» e come restrizione all'asse delle soluzioni di Saint-Venant (§4.16.2, §5.4.4, §5.5.3), e lo schema di verifica di un portale (§6.9), che presuppone le CdS note.

## 3. Struttura in moduli

| Modulo | Contenuto | Concetti | Pagine |
|---|---|---|---|
| M1 | Algebra e analisi tensoriale | 7 | 14 |
| M2 | Analisi della deformazione | 8 | 21 |
| M3 | Analisi della tensione | 9 | 30 |
| M4 | Lavoro, legami costitutivi, iperelasticità | 6 + 1 facoltativo | 21 |
| M5 | Elasticità isotropa e problema elastico | 5 | 12 |
| M6 | Saint-Venant I (Kirchhoff, impostazione, N, flessione) | 7 + 1 facoltativo | 27 |
| M7 | Saint-Venant II (taglio, torsione) | 6 | 17 |
| M8 | Criteri di resistenza | 7 | 16 |
| **Totale** | | **57** (55 + 2 facoltativi) | 159 |

Scelte: il Cap. 4 è diviso in due moduli (legami generali / isotropia e problema elastico) e il Cap. 5 in due (flessione / taglio e torsione), perché sono i capitoli più lunghi e densi di derivazioni; un modulo resta così una sessione di lavoro. L'ordine è sempre quello della dispensa; ogni prerequisito precede il concetto (controllato dal codice).

## 4. Concetti, prerequisiti, riferimenti
