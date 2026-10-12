# Cap. 4 — Legami costitutivi. Solidi elastici lineari (pp. 66–98)

> Convenzioni LaTeX: vedi `cap-01.md`. `[[p. N]]` = inizio pagina N.

**Contenuti.** Linee isostatiche; lemma fondamentale e teorema dei lavori virtuali; legami costitutivi e classificazione (elastico, elastico lineare, iperelastico, elasto-plastico, viscoso); prova di trazione sull'acciaio e di compressione sul calcestruzzo; elasticità lineare e tensore elastico; iperelasticità ed energia specifica; simmetrie materiali e Voigt; elasticità isotropa (Lamé, coassialità, moduli tecnici, espressioni di $\varphi$); restrizioni di plausibilità; problema elastico (posizione, buona posizione, sovrapposizione, non linearità dell'energia).

## 4.1 Linee isostatiche [[p. 66]]
**Oss. (della dispensa): approfondimento presentato a lezione, NON richiesto all'orale.**
In ogni punto si segnano le direzioni principali di tensione massima e minima; le curve tangenti formano due famiglie (nello spazio una terza, delle medie): le **linee isostatiche**. Come le curve di livello, sono più fitte dove la tensione è maggiore. Mostrano come i carichi fluiscono e indicano dove addensare la materia (telaio di una moto). *Figura (p. 66):* corpo con le due famiglie $s_1$, $s_3$ in un punto $x$.

## 4.2 Lavoro: relazioni generali [[p. 67]]
Il lavoro (forza × spostamento) lega enti statici e cinematici. Il TLV li mette in relazione **senza nesso di causalità**; la causalità richiede il **legame costitutivo** (espressione della natura del materiale).

### 4.2.1 Lemma fondamentale
**Teo. 4.2.1.** Per $\tens T(x)$, $\vet u(x)$ ammissibili (regolari), $\tens H=\nabla\vet u$:
$$\int_{\partial\mathcal B}\tens T\hat n\cdot\vet u\,dA=\int_{\mathcal B}\operatorname{div}\tens T\cdot\vet u\,dV+\int_{\mathcal B}\tens T\cdot\tens H\,dV.$$
*Dim.* $\tens T\hat n\cdot\vet u=\tens T^T\vet u\cdot\hat n$; teorema della divergenza e identità $\operatorname{div}(\tens T^T\vet u)=\operatorname{div}\tens T\cdot\vet u+\tens T\cdot\nabla\vet u$. ■
**Significato** (con $\tens T$ in equilibrio): 1) lavoro delle forze di superficie ($\hat{\vet s}=\tens T\hat n$); 2) a meno del segno lavoro delle forze di volume ($\operatorname{div}\tens T=-\vet b$); 3) **lavoro di deformazione**. Richiama la conservazione dell'energia: lavoro fornito dall'esterno = lavoro delle forze interne.

## 4.3 Teorema dei lavori virtuali (Bernoulli, 1725) [[p. 68]]
**Def. 4.3.1 (Sistema FT equilibrato).** $FT=\{\vet b,\hat{\vet s},\tens T\}$ con $\operatorname{div}\tens T+\vet b=\vet 0$ in $\mathring{\mathcal B}$, $\tens T\in\mathrm{Sym}$, $\tens T\hat n=\hat{\vet s}$ su $\partial\mathcal B$.
**Def. 4.3.2 (Sistema SD congruente o virtuale).** $SD=\{\vet u,\tens E\}$, $\vet u$ ammissibile e infinitesimo, $\tens E=\frac12(\nabla\vet u+\nabla\vet u^T)$.
- *Virtuale:* ipotetico, non compiuto nel tempo; spostamento di prova per testare l'equilibrio di FT.
- *Cinematicamente ammissibile:* rispetta i vincoli e genera deformazioni congruenti.
- *Deformazioni congruenti:* ottenibili da uno spostamento continuo e derivabile.

**Def. 4.3.3.** $$L_v^{EST}:=\int_{\mathcal B}\vet b\cdot\vet u\,dV+\int_{\partial\mathcal B}\hat{\vet s}\cdot\vet u\,dA,\qquad L_v^{INT}:=\int_{\mathcal B}\tens T\cdot\tens E\,dV.$$
**Teo. 4.3.4 (TLV).** Per ogni FT equilibrato e SD congruente: $$L_v^{EST}=L_v^{INT}\iff\int_{\partial\mathcal B}\hat{\vet s}\cdot\vet u\,dA+\int_{\mathcal B}\vet b\cdot\vet u\,dV=\int_{\mathcal B}\tens T\cdot\tens E\,dV$$ (identità: vale a priori). [[p. 69]]
*Dim.* Dal lemma, con $\operatorname{div}\tens T=-\vet b$, $\tens T\hat n=\hat{\vet s}$; $\tens H=\tens E+\tens W$ e, poiché $\mathrm{Sym}\perp\mathrm{Skw}$, $\tens T\cdot\tens W=0\Rightarrow\tens T\cdot\tens H=\tens T\cdot\tens E$. ■

### 4.3.3 Osservazioni
1. **Corpo rigido:** la rigidità è un vincolo costitutivo (solo spostamenti rigidi, $\tens E=\tens O$): $L_v^{EST}=0$.
2. Vale senza nesso causa–effetto; anche per la coppia correlata.
3. **Dimensioni:** $[\tens T]=[F][L^{-2}]$, $[\tens E]$ adimensionale, $[dV]=[L^3]$: lavoro.
4. **Identità triangolare:** equilibrio, congruenza, TLV: bastano due vertici per il terzo.
5. **Principio o teorema?** Con equilibrio assiomatico (Eulero → Cauchy) e congruenza rigorosa, il TLV è un **teorema** (scuola italiana e statunitense); la scuola francese assume l'identità come **principio** e ne ricava l'equilibrio (congruenza + PLV ⇒ equilibrio). Origine nella meccanica aristotelica.

## 4.4 Legami costitutivi
Stesso barile da 100 kg su tre travi (legno, acciaio, ferro): deformazioni diverse ⇒ dipende dal materiale. [[p. 70]]
### 4.4.1 Descrizione fenomenologica e RVE
Descrizione **macromeccanica** (continuo, campi), non micromeccanica.
**Def. 4.4.1 (Elemento di Volume Rappresentativo).** Volume con così tanti costituenti da rendere statisticamente irrilevante la loro distribuzione interna. Sotto il micron il continuo non vale. RVE: metalli ~mm, legno ~cm, muratura ~m.

### 4.4.2 Classificazione dei comportamenti
Indagine fondamentale: prova di trazione sul tratto utile $L_0$ (lontano dalle ganasce, stato assiale centrato). *Figura (p. 70):* provino con $F$ e tratto utile $L_0$. [[p. 71]]
**Def. 4.4.2 (Elastico).** Risposta indipendente dal tempo e deformazione **reversibile** (scarico = carico): $\tens T=\hat{\tens T}(\tens E)$ biunivoca. Non basta una curva crescente: va verificato il ritorno e l'indipendenza dal tempo.
**Def. 4.4.3 (Elastico lineare).** Legge di Hooke (*ut tensio sic vis*): $$\tens T=\mathbb A\tens E,$$ $\mathbb A$ tensore elastico del IV ordine.
**Def. 4.4.4 (Iperelastico).** Anche reversibilità **termodinamica**: l'energia spesa viene restituita. Nella modellazione standard i materiali si assumono iperelastici (dissipazione bassa).
**Def. 4.4.5 (Elasto-plastico).** Indipendente dal tempo ma irreversibile: allo scarico rientra la parte elastica, persiste quella plastica; **plastico** se non rientra nulla. *Figura (p. 71):* curve $F$–$\Delta L$ con $\Delta L_{res}$ e $\Delta L_e$; caso plastico $\Delta L_{\max}=\Delta L_{res}$. [[p. 72]]
**Viscoso/viscoelastico:** dipendenza dal tempo per dissipazione interna.
- **Creep:** forza imposta, la deformazione cresce nel tempo (cavo polimerico, calcestruzzo sotto carichi permanenti).
- **Rilassamento:** deformazione imposta, la tensione cala (corde della chitarra).
*Figura (p. 72):* $F(t)$ costante e $\Delta L(t)$ crescente (creep); $\Delta L$ costante e $F(t)$ decrescente (rilassamento).

### 4.4.3 Scelta del modello
Nessun modello universale: il più semplice descrittivo e predittivo, in base al range di sollecitazione: carrozzeria in esercizio → elastico; urto → elasto-plastico (dissipa); alte temperature → viscoso; tutto insieme → elasto-plasto-viscoso. Si studia l'**elastico lineare** [[p. 73]] (formulazioni risolvibili; plasticità meno usata dal meccanico; viscosità per gli pneumatici).

## 4.5 Prova di trazione sull'acciaio
*Figura (p. 73):* diagramma $F$–$\Delta L$ con $F_p$, $F_y$, $F_t$ e tratti elastico, snervamento, incrudimento, strizione.
- **Elastico:** rettilineo fino al limite di proporzionalità $F_p$, poi breve tratto elastico non lineare fino allo **snervamento** $F_y$.
- **Snervamento:** oscillazioni, deformazione a carico costante, apparente perdita di rigidezza (carico per deformare di 1); scaricando resta deformazione residua (modello plastico); dopo $F_x>F_y$ e ricarico snerva a $F_x$ (memoria).
- **Incrudimento:** torna a equilibrare incrementi (rigidezza più bassa).
- **Rottura:** picco $F_t$ (carico limite a rottura), poi caduta ripida.

### 4.5.1 Linee di Lüders
Con vernice screpolante: famiglia di linee a **45°**. [[p. 74]] Dal cerchio di Mohr, a 45° c'è la tangenziale massima: superato un limite, micro-scorrimenti a 45° che danno una deformazione longitudinale.
### 4.5.2 Strizione e localizzazione
Inclusioni indeboliscono localmente: si forma il **collo** (necking), dove avverrà la rottura (posizione non prevedibile). Un estensimetro lontano non la vede; la **DIC** (Digital Image Correlation) sì.
### 4.5.3 Da $F$–$\Delta L$ a $\sigma$–$\varepsilon$
Idealizzazione (carico uniforme sul tratto utile): $$\sigma=\frac F{A_0},\qquad\varepsilon=\frac{\Delta L}{L_0};$$ $\sigma_p$, $\sigma_y$, $\sigma_t$; nel tratto lineare $$\sigma=E\varepsilon$$ (Hooke, $E$ modulo di Young). Ma: la sezione si riduce, $\sigma_R=F/A>F/A_0$; $\varepsilon$ è media. Il diagramma reale mostra **hardening** (la tensione reale cresce sempre), non softening. [[p. 75]] *Figura (p. 75):* curva reale (hardening) sopra quella di norma ($F/A_0$), pendenza iniziale $E$.
Si usa la curva della norma per avere parametri di confronto universali, ripetibili in ogni laboratorio.
**Acciai ad alto tenore di carbonio (armonici):** stesso $E\simeq205\,000$ MPa $=205$ GPa (negli appunti «205 000 GPa»: unità corretta MPa); resistenza molto più alta, poca duttilità, snervamento non visibile: si usa la tensione allo **0,2%** di allungamento residuo.

## 4.6 Prova di compressione sul calcestruzzo
Materiali lapidei (marmo, tufo; calcestruzzo = acqua + cemento + inerti). Provino con lunghezza utile = altezza.
- **Controllo di carico** (acqua versata in un contenitore, 1 kg = 1 L): elastico non lineare fino al carico limite, poi **esplosione** (l'energia diventa cinetica). [[p. 76]]
- **Controllo di deformazione** (torchio a vite): oltre il picco **tratto discendente**: **softening** (continua a deformarsi cedendo carico).
*Figura (p. 76):* $\sigma$–$\varepsilon$: controllo di carico (si interrompe al picco) e controllo di deformazione (ramo discendente).
**Meccanismo:** il punto in softening cede carico ai vicini, che entrano in crisi a catena: rottura **fragile**, non preannunciata (l'acciaio invece è **duttile**). Macchine idrauliche (carico) vs elettromeccaniche a vite (deformazione).

## 4.7 Altri aspetti
### 4.7.1 Trazione e compressione
Acciaio (duttile): risposta simmetrica (la prova di compressione è instabile per buckling). Calcestruzzo: molto diversa. *Figura (p. 76):* curve uguali vs diverse in t/c. [[p. 77]]
### 4.7.2 Dipendenza dalla direzione
Provini orizzontale, verticale, obliquo: acciaio identici; FRP 0/90 identici in orizzontale e verticale, diverso l'obliquo.
*Oss.* Accoppiamenti termomeccanici, chimici, magnetici, elettrici: qui solo elasticità lineare.

## 4.8 Elasticità lineare
**Elastico:** 1) la tensione in $x$ dipende solo dalla deformazione **attuale** (no storia) **in $x$** (no non località); 2) niente tempo.
**Lineare:** 1) $|\vet u|\ll1$ (si riferisce $\tens T$ ai punti di $\mathcal B$); 2) $\|\tens H\|\ll1$ (si usa $\tens E$).
**Def. 4.8.1.** $\tens T(x)$ dipende solo e linearmente da $\tens E(x)$: $\exists\mathbb A$ (tensore elastico) con $$\tens T(x)=\mathbb A(x)[\tens E(x)].$$ Può variare da punto a punto (roccia stratificata); [[p. 78]] corpo **omogeneo**: $\mathbb A$ costante. $T_{ij}=\sum_{h,k}\mathbb A_{ijhk}E_{hk}$: 81 moduli elastici.

### 4.8.1 Simmetrie minori
$\mathbb A:\mathrm{Sym}\to\mathrm{Sym}$: **prima minore** $\mathbb A_{ijhk}=\mathbb A_{jihk}$ ($\tens T$ simmetrico); **seconda minore** $\mathbb A_{ijhk}=\mathbb A_{ijkh}$, cioè $\mathbb A\tens W=\tens O$.
**Per l'orale:** conta solo $\tens E$; $\mathbb A\tens W=\tens O$: una rototraslazione rigida non genera tensione (serve deformazione). Da 81 a **36**.
*Oss. (configurazione di riferimento naturale):* $\tens E=\tens O\Rightarrow\tens T=\tens O$; si assume $\tens T_0=\tens O$ (niente sforzi residui).

## 4.9 Materiali iperelastici [[p. 79]]
**Def. 4.9.1.** In $x$ il materiale è iperelastico se $\exists\varphi:\mathrm{Sym}\to\mathbb R$:
$$\tens T=\frac{\partial\varphi(\tens E)}{\partial\tens E},\qquad\varphi(\tens O)=0$$
(energia specifica, o densità, di deformazione); $T_{ij}=\partial\varphi/\partial E_{ij}$. $[\varphi]=[F][L^{-2}]=$ energia/volume.
*Oss.* Definita indipendentemente dalla linearità; con linearità $\mathbb A$ ha anche la simmetria maggiore: da 36 a **21**.

### 4.9.1 Interpretazione meccanica di $\varphi$
Cammino di deformazione $\hat{\tens E}(\alpha)$, $\alpha\in[\alpha_1,\alpha_2]$, tra deformazioni congruenti, e cammino di tensione $\hat{\tens T}(\alpha)=\mathbb A\hat{\tens E}(\alpha)$. *Figura (p. 79):* spazio delle deformazioni congruenti e spazio delle tensioni con i cammini corrispondenti. [[p. 80]] Lavoro elementare $dw=\tens T\cdot d\tens E$:
$$w=\int_{\alpha_1}^{\alpha_2}\hat{\tens T}(\alpha)\cdot\frac{d\hat{\tens E}}{d\alpha}d\alpha\overset{\exists\varphi}=\int_{\alpha_1}^{\alpha_2}\frac{\partial\varphi}{\partial\tens E}\Big|_{\hat{\tens E}(\alpha)}\cdot\frac{d\hat{\tens E}}{d\alpha}d\alpha=\int_{\alpha_1}^{\alpha_2}\frac{d}{d\alpha}\varphi(\hat{\tens E}(\alpha))\,d\alpha=\varphi_2-\varphi_1.$$
a) il lavoro non dipende dal cammino; b) è la variazione di $\varphi$: processo **conservativo**. **Cammino chiuso:** $w=0$; l'energia spesa viene restituita.

### 4.9.2 Significato assoluto
Da $\tens O$ a $\tens E$: $w=\varphi(\tens E)$: lavoro specifico per passare dalla configurazione **naturale** a $\tens E$.
*Oss.* Con riferimento già deformato (arco teso) $\varphi\neq0$ nel riferimento: serve una teoria più complessa.
1. Energia del corpo $\Phi=\int_{\mathcal B}\varphi(\tens E(x))\,dV$. 2. Se esiste, $\varphi$ è unica. [[p. 81]]

### 4.9.3 Teorema sull'energia specifica
**Teo. 4.9.2.** Per un materiale elastico lineare sono equivalenti:
a) esiste $\varphi$ (lavoro nullo su ogni cammino chiuso);
b) $\mathbb A=\mathbb A^T$ (simmetria maggiore, 36 → 21);
c) $\varphi=\frac12\mathbb A\tens E\cdot\tens E$.
*Dim. a ⇒ b.* $T_{ij}=\partial\varphi/\partial E_{ij}=\sum_{hk}\mathbb A_{ijhk}E_{hk}\Rightarrow\dfrac{\partial^2\varphi}{\partial E_{ij}\partial E_{hk}}=\mathbb A_{ijhk}$; analogamente $\dfrac{\partial^2\varphi}{\partial E_{hk}\partial E_{ij}}=\mathbb A_{hkij}$; Schwarz: $\mathbb A_{ijhk}=\mathbb A_{hkij}$, $\mathbb A=\dfrac{\partial^2\varphi}{\partial\tens E^2}$.
*b ⇒ c.* Cammino rettilineo $\hat{\tens E}(\alpha)=\alpha\tens E^*$, $\alpha\in[0,1]$:
$$w=\int_0^1\mathbb A(\alpha\tens E^*)\cdot\tens E^*d\alpha=\mathbb A\tens E^*\cdot\tens E^*\int_0^1\alpha\,d\alpha=\tfrac12\mathbb A\tens E^*\cdot\tens E^*,$$ che con a) coincide con $\varphi(\tens E^*)$. ■
*Attenzione (della dispensa):* in b ⇒ c si usa a); per chiudere: c ⇒ a immediato; con la simmetria maggiore $\partial(\frac12\mathbb A\tens E\cdot\tens E)/\partial\tens E=\mathbb A\tens E=\tens T$, cioè b ⇒ a.

### 4.9.4 Definita positività
$\mathbb A\in\mathrm{Pos}^+$ si riduce (simmetrie minori) a $\mathbb A\tens E\cdot\tens E>0\ \forall\tens E\in\mathrm{Sym}\setminus\{\tens O\}$; con $\varphi=\frac12\mathbb A\tens E\cdot\tens E$: $\varphi(\tens E)>0$. [[p. 82]]
### 4.9.5 Tensore elastico tangente
Se il legame non è lineare: $\mathbb A=\dfrac{\partial\tens T}{\partial\tens E}=\dfrac{\partial^2\varphi}{\partial\tens E^2}$ (incrementale); con deformazioni finite $\tens E$ si sostituisce con altre misure. *Figura (p. 82):* curva $\tens T$–$\tens E$ con la tangente $\mathbb A$.

## 4.10 Simmetrie materiali
Lastre di acciaio, legno, CFRP 0/90; provini a 0° (1), 45° (2), 90° (3). *Figura (p. 82):* tre diagrammi $F$–$\Delta L$.
- Acciaio: curve sovrapposte (trafilatura a parte). Legno: 1 (lungo le fibre) il più rigido, 3 il più deformabile, 2 intermedio. CFRP 0/90: 1 e 3 coincidono, 2 più deformabile. [[p. 83]]
Simmetria materiale = riproposizione della stessa risposta; terminologia dall'ottica dei cristalli. Più simmetria, meno costanti.
### 4.10.1 Esperimenti
Campioni ritagliati in più direzioni (oneroso) oppure **ultrasuoni** (non distruttivi: vasca a immersione con robot, laser pulsato termomeccanico).
### 4.10.2 Ricerca delle simmetrie
Perturbazione $\vet u$ e poi $\vet u^*=\tens Q\vet u$, $\tens Q\in\mathrm{Rot}$: $\tens E^*=\tens Q\tens E\tens Q^T$, $\tens T^*=\mathbb A[\tens Q\tens E\tens Q^T]$. Stessa risposta se $\tens T^*=\tens Q\tens T\tens Q^T$:
$$\mathbb A[\tens Q\tens E\tens Q^T]=\tens Q(\mathbb A\tens E)\tens Q^T.$$
**Def. 4.10.1 (Gruppo di simmetria materiale).** $\tens Q\in\mathrm{Orth}$ è trasformazione di simmetria se vale la condizione $\forall\tens E\in\mathrm{Sym}$; [[p. 84]] $\mathcal G:=\{\tens Q\in\mathrm{Orth}\mid\dots\}\subseteq\mathrm{Orth}$. Un gruppo obbliga $\mathbb A$ ad avere una forma specifica.

| Classe | Gruppo | Elastico | Iperelastico |
|---|---|---|---|
| Anisotropi | banale (nessuna simmetria) | 36 | 21 |
| Ortotropi | riflessioni rispetto a 3 piani ortogonali (CFRP 0/90, muratura) | 12 | 9 |
| Trasversalmente isotropi | rotazioni attorno a un asse $\hat e$ (legno, compositi unidirezionali) | 6 | 5 |
| Isotropi | $\mathcal G\equiv\mathrm{Orth}$ (acciaio) | 2 | 2 |

*Attenzione (della dispensa):* per gli anisotropi non $\mathcal G=\emptyset$ ma $\{\tens I,-\tens I\}$.
Stampa 3D/additive: fortemente anisotropi. Gli isotropi sono sempre iperelastici. Ultrasuoni: prima **classificazione** (gruppo), poi **rappresentazione** (moduli).

## 4.11 Notazione di Voigt
$$\{\tens T\}=(\sigma_1,\sigma_2,\sigma_3,\tau_{23},\tau_{31},\tau_{12})^T,\qquad\{\tens E\}=(\varepsilon_1,\varepsilon_2,\varepsilon_3,\gamma_{23},\gamma_{31},\gamma_{12})^T,\ \gamma_{ij}=2E_{ij}.$$
[[p. 85]] Matrice 6×6 ($C_{IJ}$); blocchi **NW** ($\sigma\leftrightarrow\varepsilon$), **NE** ($\sigma\leftrightarrow\gamma$), **SW** ($\tau\leftrightarrow\varepsilon$), **SE** ($\tau\leftrightarrow\gamma$):
$$\sigma_1=\underbrace{C_{11}\varepsilon_1+C_{12}\varepsilon_2+C_{13}\varepsilon_3}_{NW}+\underbrace{C_{14}\gamma_{23}+C_{15}\gamma_{31}+C_{16}\gamma_{12}}_{NE}.$$
Le componenti dipendono dal riferimento: le semplificazioni appaiono nei riferimenti legati alle direzioni di simmetria.

### 4.11.1 Struttura di $[\mathbb A]$
**Ortotropi** (riferimento principale di ortotropia): NE e SW nulli, SE diagonale ($C_{44},C_{55},C_{66}$): 12, iperelastico 9 ($C_{12}=C_{21}$, …). $\tau_{23}=C_{44}\gamma_{23}$. [[p. 86]]
**Trasversalmente isotropi** (asse $\hat e_3$):
$$[\mathbb A]=\begin{bmatrix}C_{11}&C_{12}&C_{13}&0&0&0\\C_{12}&C_{11}&C_{13}&0&0&0\\C_{31}&C_{31}&C_{33}&0&0&0\\0&0&0&C_{44}&0&0\\0&0&0&0&C_{44}&0\\0&0&0&0&0&\frac{C_{11}-C_{12}}2\end{bmatrix}$$ 6 / 5 ($C_{13}=C_{31}$). *Oss.* I moduli sono riferiti alle direzioni del materiale: serve una trasformazione tensoriale verso il riferimento di calcolo.
**Isotropi** (qualunque riferimento):
$$[\mathbb A]=\begin{bmatrix}\lambda+2\mu&\lambda&\lambda&0&0&0\\\lambda&\lambda+2\mu&\lambda&0&0&0\\\lambda&\lambda&\lambda+2\mu&0&0&0\\0&0&0&\mu&0&0\\0&0&0&0&\mu&0\\0&0&0&0&0&\mu\end{bmatrix}$$ 2 costanti di **Lamé** $\mu,\lambda$; disaccoppiamento estensionale/scorrimento: $\sigma_i=\sigma_i(\varepsilon_1,\varepsilon_2,\varepsilon_3)$, $\tau_{ij}=\tau_{ij}(\gamma_{ij})$.

## 4.12 Elasticità lineare isotropa
Isotropo: $\mathbb A[\tens Q\tens E\tens Q^T]=\tens Q(\mathbb A\tens E)\tens Q^T\ \forall\tens E,\ \forall\tens Q\in\mathrm{Orth}$.
**Teo. 4.12.1 (Lamé)** (senza dimostrazione): $\exists\mu,\lambda$: $$\tens T=2\mu\tens E+\lambda(\operatorname{tr}\tens E)\tens I.$$ [[p. 87]]
$T_{ij}=2\mu E_{ij}+\lambda(E_{11}+E_{22}+E_{33})\delta_{ij}$: $T_{ii}=2\mu E_{ii}+\lambda\operatorname{tr}\tens E$, $T_{ij}=2\mu E_{ij}$.

**Teo. 4.12.2 (Isotropia ⇒ iperelasticità).** $\mathbb A=\mathbb A^T$.
*Dim.* $\mathbb A\tens E_1\cdot\tens E_2=2\mu\tens E_1\cdot\tens E_2+\lambda(\operatorname{tr}\tens E_1)(\operatorname{tr}\tens E_2)$, simmetrica nello scambio: $=\mathbb A\tens E_2\cdot\tens E_1$. ■

### 4.12.2 Legame inverso
$\mathbb A\in\mathrm{Pos}^+$ ⇒ invertibile: $\tens E=\mathbb A^{-1}\tens T$ (ogni classe). Da Lamé, $\tens E=\frac1{2\mu}\tens T-\frac\lambda{2\mu}(\operatorname{tr}\tens E)\tens I$; la traccia: $\operatorname{tr}\tens T=(2\mu+3\lambda)\operatorname{tr}\tens E$.
**Prop. 4.12.3.** $$\tens E=\frac1{2\mu}\tens T-\frac{\lambda}{2\mu(2\mu+3\lambda)}(\operatorname{tr}\tens T)\tens I\qquad(\mu\ne0,\ 2\mu+3\lambda\ne0).$$
1. $[2\mu+3\lambda]=[F][L^{-2}]$. [[p. 88]] 2. $\operatorname{tr}\tens T=3\sigma_m$ (tensione normale media):
$$\Theta=\frac{\sigma_m}K,\qquad K:=\frac{2\mu+3\lambda}3\ \text{(bulk modulus, modulo di comprimibilità volumetrica).}$$

### 4.12.3 Coassialità
**Teo. 4.12.4.** Per un isotropo, se $\tens T$ è effetto di $\tens E$ tramite il legame, le direzioni principali coincidono.
*Dim.* $\tens E\hat m=e\hat m\Rightarrow\tens T\hat m=(2\mu e+\lambda\operatorname{tr}\tens E)\hat m=s\hat m$. ■
Non garantita per anisotropi (rischio nei codici di calcolo). Sferetta isotropa in compressione isotropa → sfera omotetica; trasversalmente isotropa → ellissoide.

## 4.13 Moduli tecnici
Lamé: comodi ma senza (o con poca) interpretazione fisica; i moduli tecnici sono legati a prove.
### 4.13.1 Monoassiale: Young e Poisson
$[\tens T]=\operatorname{diag}(s,0,0)$, $s=F/A_0$, $\operatorname{tr}\tens T=s$: [[p. 89]] prima componente $\frac1{2\mu}-\frac{\lambda}{2\mu(2\mu+3\lambda)}=\frac{\mu+\lambda}{\mu(2\mu+3\lambda)}$:
$$[\tens E]=s\operatorname{diag}\Big(\frac{\mu+\lambda}{\mu(2\mu+3\lambda)},\,-\frac{\lambda}{2\mu(2\mu+3\lambda)},\,-\frac{\lambda}{2\mu(2\mu+3\lambda)}\Big)=\operatorname{diag}\Big(\frac sE,-\nu\frac sE,-\nu\frac sE\Big)$$
$$E:=\frac{\mu(2\mu+3\lambda)}{\mu+\lambda},\qquad\nu:=\frac{\lambda}{2(\mu+\lambda)}.$$
$E$: $s=E\varepsilon_1$ (Hooke), in Pa (MPa, GPa). $\nu=-\varepsilon_2/\varepsilon_1=-\varepsilon_3/\varepsilon_1$: contrazione trasversale, adimensionale.

### 4.13.2 Scorrimento semplice: $G$
(es. torsione di un tubo sottile) $[\tens T]$ con solo $\tau_{12}=\tau$, $\operatorname{tr}\tens T=0$: $[\tens E]=\frac1{2\mu}[\tens T]$, $G:=\mu$; $E_{12}=\gamma_{12}/2=\tau/(2G)$:
$$\tau=G\gamma_{12},\qquad\gamma_{12}=\frac\pi2-\theta.$$ *Figura (p. 89):* quadrato che diventa rombo, angolo $\theta$, $\gamma_{12}/2$ per lato. [[p. 90]]

### 4.13.3 Relazione
$$E=\frac{\mu(2\mu+3\lambda)}{\mu+\lambda}=\mu\frac{2(\mu+\lambda)}{\mu+\lambda}+\mu\underbrace{\frac{\lambda}{\mu+\lambda}}_{2\nu}=2G+2G\nu\ \Rightarrow\ E=2G(1+\nu).$$
Conviene misurare $E$ e $\nu$ (trazione) e ricavare $G$ (la torsione è difficile).

### 4.13.4 Legame con i moduli tecnici
**Inverso** ($\frac1{2\mu}=\frac{1+\nu}E$, $\frac\lambda{2\mu(2\mu+3\lambda)}=\frac\nu E$):
$$\tens E=\frac1E\big[(1+\nu)\tens T-\nu(\operatorname{tr}\tens T)\tens I\big],\quad E_{ii}=\frac1E\big[T_{ii}-\nu(T_{jj}+T_{kk})\big],\quad E_{ij}=\frac1{2G}T_{ij}.$$
Dilatazioni accoppiate a tutte le normali; scorrimenti solo alla tangenziale omonima.
**Diretto** ($\lambda=\frac{2\nu\mu}{1-2\nu}=\frac\nu{1-2\nu}\frac E{1+\nu}$, $2\mu=\frac E{1+\nu}$):
$$\tens T=\frac E{1+\nu}\Big[\tens E+\frac\nu{1-2\nu}(\operatorname{tr}\tens E)\tens I\Big],\quad T_{ii}=\frac E{1+\nu}E_{ii}+\frac{E\nu}{(1+\nu)(1-2\nu)}\operatorname{tr}\tens E,\quad T_{ij}=2GE_{ij}.$$

## 4.14 Espressioni di $\varphi$ (isotropi) [[p. 91]]
$\varphi=\frac12\tens T\cdot\tens E=\frac12\mathbb A\tens E\cdot\tens E=\frac12\mathbb A^{-1}\tens T\cdot\tens T$; per coassialità, nel riferimento principale comune $\operatorname{diag}(e_i)$, $\operatorname{diag}(s_i)$.
**Prop. 4.14.1.**
$$\varphi(\tens E)=\mu\tens E\cdot\tens E+\frac\lambda2(\operatorname{tr}\tens E)^2=\Big(\mu+\frac\lambda2\Big)(e_1^2+e_2^2+e_3^2)+\lambda(e_1e_2+e_2e_3+e_3e_1)$$
$$\varphi(\tens T)=\frac1{4\mu}\tens T\cdot\tens T-\frac{\lambda}{4\mu(2\mu+3\lambda)}(\operatorname{tr}\tens T)^2=\frac{\mu+\lambda}{2\mu(2\mu+3\lambda)}\sum s_i^2-\frac{\lambda}{2\mu(2\mu+3\lambda)}(s_1s_2+s_2s_3+s_3s_1)$$
$$\varphi(\tens T)=\frac{1+\nu}{2E}\tens T\cdot\tens T-\frac\nu{2E}(\operatorname{tr}\tens T)^2=\frac1{2E}(s_1^2+s_2^2+s_3^2)-\frac\nu E(s_1s_2+s_2s_3+s_3s_1)$$
($\varphi(\tens E)$ con i moduli tecnici poco usata). *Dim.* sostituzioni dirette (Lamé, legame inverso, $(\operatorname{tr})^2=\sum e_i^2+2\sum e_ie_j$). ■

## 4.15 Restrizioni di plausibilità fisica
1D: $\sigma=E\varepsilon$; con $E<0$ la trazione accorcerebbe: va imposto $E>0$. [[p. 92]] *Figura (p. 92):* $E>0\Rightarrow\varepsilon>0$; $E<0\Rightarrow\varepsilon<0$.
### 4.15.1 Restrizione
$$\mathbb A\in\mathrm{Pos}^+\iff\mathbb A\tens E\cdot\tens E>0\ \forall\tens E\in\mathrm{Sym}\setminus\{\tens O\}$$ (iperelastici: $\varphi>0$, per deformare si spende lavoro; inoltre $\mathbb A$ invertibile). Isotropi:
$$\mathbb A\in\mathrm{Pos}^+\iff\mu>0,\ 2\mu+3\lambda>0\iff E>0,\ G>0,\ -1<\nu<\tfrac12\quad(\text{limiti pratici: }0<\nu\le\tfrac12).$$
### 4.15.2 Dimostrazione (Lamé)
$\varphi=(\mu+\frac\lambda2)\sum e_i^2+\frac\lambda2\sum2e_ie_j=\{x\}^T[A]\{x\}$, con $[A]$ di diagonale $\mu+\frac\lambda2$ e fuori diagonale $\frac\lambda2$. **Sylvester** (minori principali positivi):
$$\mu+\tfrac\lambda2>0,\qquad\big(\mu+\tfrac\lambda2\big)^2-\big(\tfrac\lambda2\big)^2=\mu(\mu+\lambda)>0,\qquad\det[A]=\mu^2\big(\mu+\tfrac32\lambda\big)>0$$
⇒ $2\mu+\lambda>0$, $\mu>0$, $2\mu+3\lambda>0$; [[p. 93]] con $\mu>0$, $2\mu+3\lambda>0$ implica $2\mu+\lambda>0$ (se $\lambda<0$; ovvio se $\lambda>0$). Restano $\mu>0$, $2\mu+3\lambda>0$.
### 4.15.3 Dimostrazione (tecnici)
$G=\mu>0$; $E$: numeratore $>0$, e $\lambda>-\frac23\mu\Rightarrow\mu+\lambda>\frac13\mu>0$ ⇒ $E>0$; $G=\frac E{2(1+\nu)}>0\Rightarrow\nu>-1$; $\operatorname{tr}\tens E=\frac{1-2\nu}E\operatorname{tr}\tens T$ con lo stesso segno di $\operatorname{tr}\tens T$ ⇒ $\nu<\frac12$.
### 4.15.4 Discussione
$E\neq0$ ($\varepsilon\to\infty$); $G\neq0$ ($\gamma\to\infty$); $\nu<0$: in trazione dilatazione trasversale, non nei materiali naturali ma sì nei **metamateriali auxetici** (guarnizioni, filtri d'onda, isolamento, assorbimento elettromagnetico) ⇒ limiti pratici $0<\nu\le\frac12$.
$\nu\to\frac12$: $\Theta=\frac{1-2\nu}E3\sigma_m=0$: **incomprimibile**, isocoro (gomme, biotessuti). [[p. 94]] *Oss.* $\nu=\frac12$ ↔ $\lambda\to+\infty$, $K\to+\infty$ a $\mu$ fisso: escluso dalla condizione stretta, caso limite nei pratici.

## 4.16 Problema elastico: posizione e proprietà
Formulare = sapere i dati, le equazioni e la struttura della soluzione.
### 4.16.1 Formulazione
$\partial\mathcal B=\partial\mathcal B_v\cup\partial\mathcal B_\ell$ (vincolata / libera), disgiunte. *Figura (p. 94):* corpo con $\partial\mathcal B_v$, $\partial\mathcal B_\ell$, $\hat{\vet s}$, $\vet b$.
**Dati:** geometria; carichi $\vet b$ in $\mathcal B$, $\hat{\vet s}$ su $\partial\mathcal B_\ell$; vincoli $\vet u=\hat{\vet u}$ su $\partial\mathcal B_v$; materiale $\mathbb A(x)$.
**Incognita:** stato elastico $\{\vet u,\tens E,\tens T\}$ con
$$\tens E=\tfrac12(\nabla\vet u+\nabla\vet u^T),\quad\tens T=\mathbb A\tens E\ \ \text{in }\mathcal B;\qquad\operatorname{div}\tens T+\vet b=\vet 0\ \text{in }\mathring{\mathcal B},\quad\tens T=\tens T^T\ \text{in }\mathcal B;$$
[[p. 95]] $$\hat{\vet s}=\tens T\hat n\ \text{su }\partial\mathcal B_\ell,\qquad\vet u=\hat{\vet u}\ \text{su }\partial\mathcal B_v.$$
Tipi: 1) $\partial\mathcal B_v\equiv\partial\mathcal B$: **negli spostamenti** (doppio incastro con cedimento); 2) $\partial\mathcal B_\ell\equiv\partial\mathcal B$: **nelle forze** (aereo in volo); 3) **misto**.

### 4.16.2 Analogia con la trave
Mensola $[0,L]$ incastrata in A ($\leftrightarrow\partial\mathcal B_v$, $\hat w=0$), libera in B ($\leftrightarrow\partial\mathcal B_\ell$), con $F$ assiale in B e $p(z)$. *Figura (p. 95).* Soluzione $\{w,\varepsilon,N\}\leftrightarrow\{\vet u,\tens E,\tens T\}$:
$$\varepsilon=w'\ (\text{congruenza}),\quad N=EA\,\varepsilon\ (\text{legame}),\quad N'=-p\ (\text{equilibrio});\qquad w(0)=0,\quad N(L)=F.$$
Trave: ODE scalari; solido: PDE vettoriali/tensoriali.

### 4.16.3 Conteggio e buona posizione
Incognite $\vet u(3)+\tens E(6)+\tens T(9)=18$; equazioni congruenza (6) + legame (9) + equilibrio alla traslazione (3) = 18. Con $\tens T$ simmetrico a parte: 15 e 15. Non basta il bilancio. [[p. 96]]
**Def. 4.16.1 (Buona posizione, Hadamard).** Soluzione **esistente**, **unica**, **stabile** (piccole variazioni dei dati → piccole variazioni della soluzione). *Instabilità:* arco ribassato, snap-through; il buckling precede il collasso.
*Oss. (richiamo, non svolto negli appunti) — Teorema di unicità di Kirchhoff:* se $\mathbb A\in\mathrm{Pos}^+$ il problema ha al più una soluzione in $\tens E$, $\tens T$; $\vet u$ unico se $\partial\mathcal B_v\ne\emptyset$, altrimenti a meno di uno spostamento rigido infinitesimo.

### 4.16.4 Sovrapposizione degli stati elastici
**Teo. 4.16.2.** Se $\{\vet b_1,\hat{\vet s}_1,\hat{\vet u}_1\}\to\{\vet u_1,\tens E_1,\tens T_1\}$ e $\{\vet b_2,\hat{\vet s}_2,\hat{\vet u}_2\}\to\{\vet u_2,\tens E_2,\tens T_2\}$, allora $\forall\alpha,\beta$ $\{\alpha\vet u_1+\beta\vet u_2,\dots\}$ risolve il problema con i dati combinati (linearità).
1. $\beta=0$: forza doppia → inflessione doppia. 2. $\alpha=\beta=1$: telaio con $F_1$, $F_2$ = somma dei due casi. Con non linearità (attrito) conta l'ordine dei carichi. [[p. 97]]

### 4.16.5 Non linearità dell'energia
**Teo. 4.16.3.** $\varphi(\tens E_1+\tens E_2)\ne\varphi(\tens E_1)+\varphi(\tens E_2)$.
*Dim.* Con $\mathbb A=\mathbb A^T$: $$\varphi(\tens E_1+\tens E_2)=\varphi(\tens E_1)+\varphi(\tens E_2)+\underbrace{\mathbb A\tens E_1\cdot\tens E_2}_{\text{accoppiamento}}.$$ ■

## 4.17 Quadro riassuntivo (p. 97)
Lemma; TLV; elastico/iperelastico/viscoso; prova di trazione; elasticità lineare (81 → 36, $\mathbb A\tens W=\tens O$, $\tens T_0=\tens O$); teorema su $\varphi$ (36 → 21); simmetria materiale; costanti 36/21, 12/9, 6/5, 2/2; Lamé e inverso; $K$; coassialità; moduli tecnici; legami tecnici; energie; plausibilità; problema elastico; Hadamard; sovrapposizione e $\varphi$ non lineare.

## Per l'orale — domande della dispensa (p. 98)
1. Lemma fondamentale: enunciato, dimostrazione, significato dei termini.
2. TLV: FT e SD, enunciato, dimostrazione, osservazioni (rigido, identità triangolare, principio o teorema).
3. Perché serve il legame costitutivo; descrizione fenomenologica e RVE.
4. Classificazione dei comportamenti; creep e rilassamento; scelta del modello.
5. Prova di trazione sull'acciaio: tratti, Lüders, strizione, $\sigma$–$\varepsilon$, perché la curva della norma.
6. Compressione sul calcestruzzo: controllo di carico e di deformazione, softening, rottura fragile.
7. Elasticità lineare: ipotesi, tensore elastico, simmetrie minori (81 → 36), $\mathbb A\tens W=\tens O$, configurazione naturale.
8. Iperelasticità: $\varphi$, cammino, lavoro indipendente dal cammino, significato assoluto.
9. Teorema sull'energia specifica: a)–b)–c) e dimostrazioni.
10. Simmetrie materiali: condizione, gruppo, classi e costanti; Voigt e struttura di $[\mathbb A]$.
11. Lamé; isotropo ⇒ iperelastico; legame inverso; bulk modulus; coassialità.
12. Moduli tecnici: definizioni dalle prove, $E=2G(1+\nu)$, legami.
13. Espressioni di $\varphi$; restrizioni di plausibilità e dimostrazioni; $\nu<0$ (auxetici) e $\nu\to\frac12$.
14. Problema elastico: dati, equazioni, tipi; analogia con la trave; 18 equazioni; buona posizione; sovrapposizione; non linearità di $\varphi$.
