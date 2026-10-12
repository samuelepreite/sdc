
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
