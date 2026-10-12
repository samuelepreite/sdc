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

### M1 — Algebra e analisi tensoriale (Cap. 1) · 7 concetti

| id | Concetto | § | Riferimenti | pp. | Prerequisiti | Derivazioni sviluppate dalla dispensa |
|---|---|---|---|---|---|---|
| c1.1 | Vettori, tensori del II ordine e componenti | 1.1–1.2.3 | Def 1.1.1, 1.2.1, 1.2.2 | 1–3 | — | — |
| c1.2 | Diade, base di Lin, proiettori, composizione | 1.2.4–1.2.6 | Def 1.2.3, Prop 1.2.4, Def 1.2.5–1.2.7 | 3–4 | c1.1 | componenti della diade; base di Lin |
| c1.3 | Trasposto, Sym/Skw, decomposizione, vettore assiale | 1.3 | Def 1.3.1–1.3.2, Teo 1.3.3–1.3.4 | 5–6 | c1.2 | I teorema di decomposizione (esistenza e unicità) |
| c1.4 | Determinante, inverso, ortogonali, formula di Eulero | 1.4–1.5 | Def 1.4.1–1.4.2, 1.5.1, Prop 1.5.2, Teo 1.5.3, eq (1.1) | 6–8 | c1.3 | proprietà degli ortogonali; rotazioni infinitesime |
| c1.5 | Traccia, prodotto scalare, Sym ⊥ Skw | 1.6 | Def 1.6.1–1.6.2, Prop 1.6.3 | 8–9 | c1.3 | tr W = 0; E·W = 0 |
| c1.6 | Tensori del IV ordine: simmetrie e definita positività | 1.7 | Def 1.7.1–1.7.7 | 9–11 | c1.5 | conteggio 81/36/21; Pos+ ⇒ invertibile |
| c1.7 | Gradiente, divergenza, rotore, teorema della divergenza | 1.8 | Def 1.8.1–1.8.6, Teo 1.8.4 | 11–13 | c1.5 | componenti della divergenza tensoriale |

### M2 — Analisi della deformazione (Cap. 2) · 8 concetti

| id | Concetto | § | Riferimenti | pp. | Prerequisiti | Derivazioni sviluppate dalla dispensa |
|---|---|---|---|---|---|---|
| c2.1 | Corpo, configurazioni, deformazione e spostamento | 2.1 | Def 2.1.1–2.1.2 | 15–16 | c1.1 | — |
| c2.2 | Plausibilità fisica, F e H, deformazioni rigide | 2.2–2.3 | Def 2.2.1–2.2.4, 2.3.1, Teo 2.3.2, Def 2.3.3, Teo 2.3.4 | 17–19 | c2.1, c1.4, c1.7 | identità cinematica fondamentale |
| c2.3 | Studio locale: deformazione omogenea tangente | 2.4 | eq (2.1) | 20 | c2.2 | Taylor → dx = F dX |
| c2.4 | Parametri di misura e tensore di deformazione finita | 2.5 | Def 2.5.1–2.5.8, Prop 2.5.2–2.5.9 | 20–23 | c2.3 | ε_n, sin γ, ΔS, Θ = det F − 1 |
| c2.5 | Piccole deformazioni, piccoli spostamenti, equilibrio referenziale | 2.6.1–2.6.2 | Def 2.6.1–2.6.2 | 23–24 | c2.4 | — |
| c2.6 | Tensore E, rotazione W, parametri linearizzati | 2.6.3–2.6.6 | Prop 2.6.3, Def 2.6.4, Teo 2.6.5, Prop 2.6.6 | 24–26 | c2.5, c1.3 | linearizzazione di D; parametri linearizzati |
| c2.7 | Formula di rappresentazione e compatibilità | 2.7–2.8 | Teo 2.7.1, eq (2.2)–(2.3), Teo 2.8.1–2.8.2 | 27–29 | c2.6 | formula di rappresentazione |
| c2.8 | Dilatazioni e direzioni principali | 2.9–2.10 | Def 2.9.1, Teo 2.9.2–2.9.3, Prop 2.9.4 | 29–33 | c2.6 | spettrale (b); estremo; lettura dagli invarianti |

### M3 — Analisi della tensione (Cap. 3) · 9 concetti

| id | Concetto | § | Riferimenti | pp. | Prerequisiti | Derivazioni sviluppate dalla dispensa |
|---|---|---|---|---|---|---|
| c3.1 | Forze, principi di Eulero e Cauchy, componenti speciali | 3.1–3.3 | Def 3.2.1–3.2.2, Teo 3.3.1 | 36–40 | c1.2 | — |
| c3.2 | Assiomi di Eulero, ECS e lemma di Cauchy | 3.4–3.5 | Def 3.4.1, Teo 3.4.2, Teo 3.5.1 | 40–42 | c3.1 | lemma di Cauchy |
| c3.3 | Teorema di Cauchy–Poisson e tetraedro | 3.6–3.7.1 | Teo 3.6.1 | 42–45 | c3.2 | tetraedro di Cauchy |
| c3.4 | Equazioni indefinite di equilibrio e simmetria di T | 3.7.2–3.8 | Teo 3.7.1 | 45–48 | c3.3, c1.7 | div T + b = 0; T23 = T32 |
| c3.5 | Rappresentazione ingegneristica; σ_n, τ_nν, τ_n | 3.9–3.10 | — | 48–49 | c3.4 | σ_n come forma quadratica |
| c3.6 | Tensioni principali e classificazione | 3.11–3.12 | Def 3.11.1 | 49–52 | c3.5, c2.8 | lettura dagli invarianti |
| c3.7 | Tensioni estreme ed esercizio svolto | 3.13–3.14 | Prop 3.13.1–3.13.2 | 53–56 | c3.6 | s3 ≤ σ_m ≤ s1 (euristica); τ_max solo enunciata |
| c3.8 | Cerchio di Mohr: equazione, costruzione, impiego | 3.15 | Prop 3.15.1 | 56–60 | c3.5 | equazione del cerchio; correttezza della costruzione |
| c3.9 | Mohr: esempi, arbelo, esempio numerico | 3.16–3.17 | Teo 3.17.1 | 60–63 | c3.8, c3.7 | — |

### M4 — Lavoro, legami costitutivi, iperelasticità (Cap. 4, §4.1–4.11) · 7 concetti

| id | Concetto | § | Riferimenti | pp. | Prerequisiti | Derivazioni sviluppate dalla dispensa |
|---|---|---|---|---|---|---|
| c4.0 | Linee isostatiche *(facoltativo: la dispensa dice «non richiesto all'orale»)* | 4.1 | — | 66 | c3.6 | — |
| c4.1 | Lemma fondamentale e teorema dei lavori virtuali | 4.2–4.3 | Teo 4.2.1, Def 4.3.1–4.3.3, Teo 4.3.4 | 67–69 | c3.4, c2.6, c1.7 | lemma; TLV |
| c4.2 | Legami costitutivi e classificazione dei comportamenti | 4.4 | Def 4.4.1–4.4.5 | 69–73 | c3.6 | — |
| c4.3 | Prove su acciaio e calcestruzzo | 4.5–4.7 | — | 73–77 | c4.2, c3.9 | — |
| c4.4 | Elasticità lineare e simmetrie minori | 4.8 | Def 4.8.1 | 77–78 | c4.2, c1.6, c2.6 | 81 → 36 |
| c4.5 | Iperelasticità e teorema sull'energia specifica | 4.9 | Def 4.9.1, Teo 4.9.2 | 79–82 | c4.4, c4.1 | lavoro indipendente dal cammino; a ⇒ b ⇒ c |
| c4.6 | Simmetrie materiali e notazione di Voigt | 4.10–4.11 | Def 4.10.1 | 82–86 | c4.5, c1.4 | — |

### M5 — Elasticità isotropa e problema elastico (Cap. 4, §4.12–4.16) · 5 concetti

| id | Concetto | § | Riferimenti | pp. | Prerequisiti | Derivazioni sviluppate dalla dispensa |
|---|---|---|---|---|---|---|
| c5.1 | Lamé, isotropia ⇒ iperelasticità, legame inverso, coassialità | 4.12 | Teo 4.12.1–4.12.2, Prop 4.12.3, Teo 4.12.4 | 86–88 | c4.6, c3.6 | isotropo ⇒ A = Aᵀ; legame inverso; coassialità |
| c5.2 | Moduli tecnici | 4.13 | — | 88–90 | c5.1 | E, ν da monoassiale; G da scorrimento; E = 2G(1+ν) |
| c5.3 | Energia per isotropi e restrizioni di plausibilità | 4.14–4.15 | Prop 4.14.1 | 91–94 | c5.2, c4.5 | espressioni di φ; Sylvester |
| c5.4 | Problema elastico: posizione e buona posizione | 4.16.1–4.16.3 | Def 4.16.1 | 94–96 | c5.1, c3.4, c2.7 | — |
| c5.5 | Sovrapposizione e non linearità dell'energia | 4.16.4–4.16.5 | Teo 4.16.2–4.16.3 | 96–97 | c5.4, c5.3 | termine di accoppiamento |

### M6 — Saint-Venant I: impostazione, sforzo normale, flessione (Cap. 5, §5.1–5.6) · 8 concetti

| id | Concetto | § | Riferimenti | pp. | Prerequisiti | Derivazioni sviluppate dalla dispensa |
|---|---|---|---|---|---|---|
| c6.1 | Teorema di unicità di Kirchhoff | 5.1 | Teo 5.1.1 | 99–100 | c5.5, c4.1 | dimostrazione per assurdo |
| c6.2 | Problema di Saint-Venant: formulazione, ipotesi, semi-inverso | 5.2.1–5.2.4 | Def 5.2.1 | 100–104 | c6.1, c5.4 | T_zz = C z + D |
| c6.3 | Equilibrio globale, CdS, problema indebolito, postulato | 5.2.5–5.2.8 | eq (5.1), Def 5.2.2, Teo 5.2.3–5.2.4 | 104–108 | c6.2 | leggi di variazione delle CdS |
| c6.4 | Sforzo normale | 5.3–5.4 | Def 5.4.1, Teo 5.4.2 | 109–113 | c6.3, c5.2 | soluzione completa; Clapeyron |
| c6.5 | Assi principali centrali ed ellisse d'inerzia | 5.5.1–5.5.2 | Def 5.5.2 | 113–115 | c6.3 | — |
| c6.6 | Flessione semplice retta (Navier) | 5.5.3–5.5.4 | — | 115–120 | c6.4, c6.5 | Navier; spostamenti; anticlastica |
| c6.7 | Flessione deviata e teoremi della flessione | 5.5.5 | Teo 5.5.3–5.5.4 | 120–122 | c6.6 | I e II teorema |
| c6.8 | Sforzo normale eccentrico, nocciolo, parzializzazione *(facoltativo: la dispensa dice «non trattato a lezione»)* | 5.6 | Def 5.6.1–5.6.2 | 122–125 | c6.7 | trinomia; regola delle 3u |

### M7 — Saint-Venant II: taglio e torsione (Cap. 5, §5.7–5.8) · 6 concetti

| id | Concetto | § | Riferimenti | pp. | Prerequisiti | Derivazioni sviluppate dalla dispensa |
|---|---|---|---|---|---|---|
| c7.1 | Flessione composta: formula di Jourawski | 5.7.1–5.7.2 | Def 5.7.1, Teo 5.7.2, Prop 5.7.3 | 125–129 | c6.6 | formula di Jourawski |
| c7.2 | τ_zx e regola delle tangenti | 5.7.3–5.7.4 | — | 129–131 | c7.1, c3.4 | linearità di τ_zx sulla corda |
| c7.3 | Torsione: congettura di Clebsch e problema di Neumann | 5.8.1–5.8.2 | Def 5.8.1–5.8.2, Teo 5.8.3 | 131–133 | c6.3, c5.2 | equazioni dalla congettura |
| c7.4 | Funzione di Prandtl e fattore di torsione | 5.8.3–5.8.4 | Def 5.8.4, Teo 5.8.5, Def 5.8.6 | 133–135 | c7.3, c1.7 | ∇²F = 2; M_z = Gγ∫(−2F) |
| c7.5 | Sezioni esatte, analogia idrodinamica, chiusa vs aperta | 5.8.5–5.8.8 | — | 135–138 | c7.4 | sezione circolare; confronto chiusa/aperta |
| c7.6 | Sezioni sottili aperte e teoria di Bredt | 5.8.9–5.8.10 | Teo 5.8.7 | 139–141 | c7.5 | formula di Bredt |

### M8 — Criteri di resistenza (Cap. 6) · 7 concetti

| id | Concetto | § | Riferimenti | pp. | Prerequisiti | Derivazioni sviluppate dalla dispensa |
|---|---|---|---|---|---|---|
| c8.1 | Verifica di resistenza e di sicurezza monoassiale | 6.1–6.2 | Def 6.2.1 | 144–146 | c4.3 | — |
| c8.2 | Criteri di resistenza e tensione ideale | 6.3 | Def 6.3.1 | 147–148 | c8.1, c3.7 | — |
| c8.3 | Criteri di Galileo, Tresca, Grashof | 6.4.1–6.4.3 | — | 148–150 | c8.2, c3.9, c5.2 | tensioni ideali |
| c8.4 | Beltrami e confutazione di Huber | 6.4.4–6.4.5 | — | 150–151 | c8.3, c5.3 | σ_id di Beltrami; h_L |
| c8.5 | Secondo teorema di decomposizione e von Mises | 6.5 | Teo 6.5.1, Def 6.5.2, Teo 6.5.3 | 151–154 | c8.4 | φ_d; σ_id di von Mises |
| c8.6 | Criterio di Mohr–Coulomb | 6.6 | — | 154–155 | c8.2, c3.9 | verifica con il cerchio massimo |
| c8.7 | Tensioni ideali alla Saint-Venant, travature, verifica e progetto | 6.7–6.9 | — | 155–158 | c8.5, c8.3, c7.1, c6.7 | σ_id alla Saint-Venant |

**Grafo dei prerequisiti:** 57 nodi, aciclico; ogni prerequisito viene prima nell'ordine della dispensa. Snodi principali (più concetti dipendono da loro): c1.3 (Sym/Skw), c1.7 (divergenza), c2.6 (tensore E), c3.4 (equilibrio indefinito), c3.6 (tensioni principali), c5.2 (moduli tecnici), c6.3 (CdS). Sono quelli da far ripassare per primi quando lo studente sbaglia più avanti.

## 5. Notazione e convenzioni da rispettare
- **Tensori** del II ordine maiuscole con tilde sottoscritta $\tens A$; **vettori** sottosegnati $\vet u$; **IV ordine** "filettate" $\mathbb A$; versori con cappello. In KaTeX: macro `\tens`, `\vet`.
- **Componenti** $A_{ij}=\tens A\hat e_j\cdot\hat e_i$ (riga = componente, colonna = vettore trasformato); gradiente $(\nabla\vet u)_{ij}=\partial u_i/\partial x_j$; divergenza per righe.
- **Prodotto scalare tra tensori** $\tens A\cdot\tens B=\operatorname{tr}(\tens A\tens B^T)$.
- **Deformazione:** $\tens F=\tens I+\tens H$, $\tens D=\frac12(\tens F^T\tens F-\tens I)$, $\tens E=\operatorname{sym}\nabla\vet u$, $\tens W=\operatorname{skw}\nabla\vet u$; $E_{ij}=\gamma_{ij}/2$; $\gamma_{n,m}=\pi/2-\theta$ (positivo se l'angolo si chiude).
- **Tensione:** trazione positiva; $\vet t_n=\tens T\hat n$; $\sigma_n=\tens T\hat n\cdot\hat n$; $\hat\mu$ direzione di $\boldsymbol\tau_n$, $\hat\nu$ direzione assegnata; tensioni principali $s_1\ge s_2\ge s_3$; dilatazioni principali $e_1\ge e_2\ge e_3$.
- **Mohr:** asse $\sigma$ concorde a $\hat e_1$, asse $\tau$ **opposto** a $\hat e_2$ (verso il basso); polo $P(\sigma_1,-\tau_{12})$; $\hat\nu$ = $\hat m$ ruotato di 90° antiorario.
- **Voigt:** ordine $(\sigma_1,\sigma_2,\sigma_3,\tau_{23},\tau_{31},\tau_{12})$, $(\varepsilon_1,\varepsilon_2,\varepsilon_3,\gamma_{23},\gamma_{31},\gamma_{12})$.
- **Saint-Venant:** $z$ lungo l'asse ($z=0$ base di sinistra), $x,y$ APCdI ($x$ di inerzia massima), $y$ rivolto verso il basso nei disegni della sezione (NF-10), spostamenti $u,v,w$; rotazione della sezione $\varphi=-v'$; $\alpha,\gamma,\beta,\theta,\delta$ come in §5.5.5; CdS positive se concordi agli assi sulla base di destra.
- **Simboli riusati** (vanno disambiguati a schermo, NF-08 e NF-13): $\nu$ Poisson / coefficiente di sicurezza; $\gamma$ scorrimento / angolo dell'asse di sollecitazione / angolo unitario di torsione; $\varphi$ energia specifica / rotazione / ingobbamento (ingobbamento in torsione); $\theta$ angolo tra fibre / angolo dell'asse di flessione / rotazione delle sezioni in torsione.
- **Unità:** motore sempre in SI (Pa, m, rad); MPa e gradi solo a schermo.

## 6. Domande d'orale
- **Dalla fonte:** 74 domande nei riquadri di fine capitolo (riportate in fondo a ciascun `cap-XX.md`), più i riquadri «Per l'orale» nel testo. Ogni domanda verrà agganciata a 1–3 concetti.
- **Dedotte (marcate come tali nell'app):** domande di collegamento tra capitoli, per esempio: perché la simmetria di $\tens T$ (Cauchy–Poisson) serve per applicare il teorema spettrale; che cosa hanno in comune la proprietà di estremo di $\varepsilon_n$ e di $\sigma_n$; perché Kirchhoff è il fondamento del metodo semi-inverso; da dove vengono le linee di Lüders (Mohr → prova di trazione → Tresca); perché le tensioni ideali alla Saint-Venant non richiedono il calcolo degli autovalori.
- **Trabocchetti tipici (dedotti):** $E_{ij}=\gamma_{ij}/2$ e non $\gamma_{ij}$; ECS solo necessarie per il deformabile; monoassiale ≠ «solo tensioni normali»; il piano di $\tau_{\max}$ non è scarico; $\nu=\frac12$ escluso dalla condizione stretta; Beltrami vs von Mises nello stato idrostatico; il taglio deve passare per il centro di taglio; Bredt solo per sezioni sottili **chiuse**.

## 7. Modelli 3D e diagrammi giustificati dalla dispensa
| # | Modello | Tipo | Moduli | Perché la dispensa lo giustifica |
|---|---|---|---|---|
| V1 | **Rotazione di Eulero**: asse $\hat e$, vettore $\vet v$, rotazione esatta vs tangente $\varphi\hat e\wedge\vet v$ | 3D | M1 | Teo 1.5.3, figura p. 8 |
| V2 | **Cubetto/intorno che si deforma** con $\tens H$ scelto: scomposizione $\tens E+\tens W$, fibre $\hat n$, $\hat m$ con $\varepsilon_n$ e $\gamma$, volume; **sfera → ellissoide** e direzioni principali (3 casi, dilatazioni nulle) | 3D | M2 | §2.5–2.10 (sfera → ellissoide, pallone da rugby, omotetia sono nel testo) |
| V3 | **Piano di taglio orientabile** in un punto: $\vet t_n$, $\boldsymbol\sigma_n$, $\boldsymbol\tau_n$; **tetraedro di Cauchy**; parallelepipedo con le $\tau_{ij}$ reciproche | 3D | M3 | §3.2–3.10, figure pp. 39, 44, 46, 47 |
| V4 | **Cerchio di Mohr** con polo, costruzione passo passo e **arbelo**, collegato a V3 (il punto sul cerchio = la giacitura nel 3D) | 2D SVG + 3D | M3, M8 | §3.15–3.17 |
| V5 | **Prove di laboratorio**: $F$–$\Delta L$ acciaio (tratti, snervamento, strizione) e calcestruzzo (controllo di carico / deformazione, softening); provino con linee di Lüders | 2D SVG | M4, M8 | §4.5–4.7 |
| V6 | **Solido di Saint-Venant 3D**: sezione a scelta (rettangolo, cerchio, doppio T, T, L), mappa di $\sigma_z$, asse neutro, deformata dell'asse (arco), sezione piana (Bernoulli), **anticlastica**; flessione deviata con $s$, $n$, $f$ ed ECdI; facoltativo nocciolo e 3u | 3D | M6 | §5.4–5.6 |
| V7 | **Sezione: taglio e torsione**: diagramma di Jourawski e regola delle tangenti; linee di tensione in torsione, $F$ di Prandtl come superficie, ingobbamento (calcolato dal motore), chiusa vs aperta, Bredt | 2D + 3D | M7 | §5.7–5.8, analogia idrodinamica |
| V8 | **Criteri nello spazio delle tensioni principali**: Tresca, von Mises, Beltrami, Galileo, Grashof con punto di lavoro e raggio idrostatico (Huber); dominio di Mohr–Coulomb sul piano di Mohr | 3D + 2D | M8 | §6.4–6.6 (la dispensa cita la rappresentazione nello spazio delle principali come «aiuto alla comprensione») |

Tutti i numeri e le forme vengono dal motore (`engine/`) che implementa le formule citate; amplificazioni dichiarate a schermo.

## 8. Verifiche numeriche già eseguite in Fase 0
Esercizio §3.14 (autovalori, autovettori, $\sigma_n=5$, $\tau_n=2\sqrt5$), esempio di Mohr §3.17.2 (R, $s_{1,2}$, $\alpha=30°$, $\gamma=13{,}28°$), determinante di Sylvester §4.15.2, $E=2G(1+\nu)$, tensioni ideali di von Mises e Grashof alla Saint-Venant, coefficienti di torsione del triangolo e del quadrato, rapporto 147 di §5.8.7: **tutti coincidono** con la dispensa (ricalcolati in Python). In Fase 1 diventano test Vitest.
