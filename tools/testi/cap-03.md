# Cap. 3 — Analisi della tensione (pp. 36–65)

> Convenzioni LaTeX: vedi `cap-01.md`. `[[p. N]]` = inizio pagina N.

**Contenuti.** Sistemi di forze per continui deformabili; modello di Eulero–Cauchy (principio delle sezioni, principio delle tensioni); componenti normale e tangenziale; assiomi di Eulero; lemma di Cauchy; teorema di Cauchy–Poisson con dimostrazione (tetraedro, equazioni indefinite, simmetria); rappresentazione ingegneristica di $\tens T$; calcolo di $\sigma_n$, $\tau_{n\nu}$; tensioni e direzioni principali; classificazione; tensioni estreme; esercizio svolto; Mohr ed esempi.

## 3.1 Sistemi di forze per continui deformabili [[p. 36]]
La tensione è il descrittore delle forze interne: si studia l'equilibrio del solido deformato. Il corpo, come sistema termodinamico, interagisce con l'ambiente; in meccanica le interazioni sono forze. $\mathcal P\subseteq\mathcal B$ parte generica, $x\in\mathcal P$.
*Figura (p. 36):* corpo $\mathcal B$ con frontiera $\partial\mathcal B$, parte $\mathcal P$ con frontiera $\partial\mathcal P$, forza di volume $\vet b$ e di superficie $\hat{\vet s}$; schema: forze **esterne** (di volume, a distanza, $\vet b(x)$, $x\in\mathcal B$; di superficie, per contatto, $\hat{\vet s}(x)$, $x\in\partial\mathcal B$) e **interne** → tensioni (interazioni di $\mathcal P$ col resto di $\mathcal B$).
- **Volume** $\vet b$: a distanza (peso). **Superficie** $\hat{\vet s}$: per contatto sulla frontiera. **Interne**: introdotte storicamente (Galileo '600, formulazione attuale '700–'800). [[p. 37]]
Dimensioni: $|\vet b|=[F][L^{-3}]$ (peso $\rho g$), $|\hat{\vet s}|=[F][L^{-2}]$ (vento su una vela).
*Oss.* Le forze interne sono indispensabili: il peso di una persona sul balcone va trasmesso attraverso la materia fino alle fondamenta; tagliando idealmente il corpo la trasmissione si interromperebbe. La tensione descrive le forze interne che trasmettono i carichi.

## 3.2 Modello di tensione di Eulero–Cauchy
Due principi: **sezioni di Eulero** (≈1750) e **tensioni di Cauchy** (1823).
**Per l'orale:** sono **assiomi**: la loro validità sta nella riprova sperimentale (predittività). Non esiste il "tensiometro": si misura la deformazione, la tensione si stima con la teoria.

### 3.2.1 Principio delle sezioni di Eulero
Piano $\pi$ di normale $\hat n$ (giacitura) per $x$: parti $\mathcal B^+$ e $\mathcal B^-$ dalla parte positiva/negativa di $\hat n$; sezione $A$, intorno $\Delta A$ di $x$. *Figura (p. 37):* il taglio, $\Delta A$ attorno a $x$, $\vet t_n(x)$ applicato. [[p. 38]]
**Def. 3.2.1.** L'azione di $\mathcal B^+$ su $\mathcal B^-$ attraverso $\Delta A$ equivale a un campo di forze definito su $\Delta A$: **le forze interne sono forze di superficie.** Ipotesi limitativa (un magnete ha interazioni interne anche a distanza) ma adeguata all'ingegneria.

### 3.2.2 Principio delle tensioni di Cauchy
$\operatorname{diam}(\Delta A)$ = diametro del più piccolo cerchio che contiene $\Delta A$.
**Def. 3.2.2.** Con $\Delta\vet F$ risultante e $\Delta\vet M$ momento risultante rispetto a $x$:
1. esiste finito $\displaystyle\lim_{\operatorname{diam}\Delta A\to0}\frac{\Delta\vet F}{\Delta A}=:\vet t_n(x)$, **vettore tensione** relativo alla giacitura $\hat n$;
2. esiste finito $\displaystyle\lim_{\operatorname{diam}\Delta A\to0}\frac{\Delta\vet M}{\Delta A}=\vet 0$: a livello infinitesimo il momento è trascurabile.

*Oss.* Escludere momenti interni basta quasi sempre; altrimenti **continui polari** (Cosserat, micromomento: ogni punto può anche ruotare), es. muratura (giunti → struttura interna direzionale); prezzo: complessità matematica.

### 3.2.3 Osservazioni sul vettore tensione
1. Conta solo la giacitura $\hat n$: superfici diverse (anche curve) con la stessa normale in $x$ danno lo stesso $\vet t_n$.
2. Giaciture diverse danno in generale vettori diversi: in $x$ ci sono $\infty^2$ vettori tensione. [[p. 39]]
*Figura (p. 39):* "stessa normale ⇒ stesso $\vet t_n$"; "giaciture diverse ⇒ $\vet t_n\neq\vet t_m$".

## 3.3 Componenti speciali del vettore tensione
Componenti ordinarie $(t_n)_i$; **speciali** con un asse lungo $\hat n$:
- **tensione normale** $\boldsymbol\sigma_n=\sigma_n\hat n$, $\sigma_n=\vet t_n\cdot\hat n$: $\sigma_n>0$ trazione (tende a lacerare), $<0$ compressione (compenetrazione);
- **tensione tangenziale** $\boldsymbol\tau_n=\tau_n\hat\mu\perp\hat n$: azione radente, tende a far scivolare le facce.

**Teo. 3.3.1 (Decomposizione).** $$\vet t_n=(\hat n\otimes\hat n)\vet t_n+(\tens I-\hat n\otimes\hat n)\vet t_n=\sigma_n\hat n+\tau_n\hat\mu.$$
*Figura (p. 39):* sul piano $\pi$, $\vet t_n$ scomposto in $\boldsymbol\sigma_n$ lungo $\hat n$ e $\boldsymbol\tau_n$ nel piano. [[p. 40]]
La direzione $\hat\mu$ è in generale incognita; si possono fissare due assi nel piano e usare $\tau_{n1},\tau_{n2}$.
*Oss. (indici).* In $\tau_{ni}$ il primo indice è la giacitura, il secondo la direzione; $\sigma_n$ al posto di $\sigma_{nn}$.

## 3.4 Forma integrale dell'equilibrio: assiomi di Eulero
Un assioma non si dimostra; si verifica dalla predittività. Generalizzazione per livelli: punto materiale ($\sum\vet F_i=\vet 0$) → corpo rigido (ECS: $\sum\vet F_i=\vet 0$, $\vet M_O=\vet 0\ \forall O$) → sistema di corpi rigidi (ECS per ogni parte) → corpo continuo (infinite parti).
**Def. 3.4.1 (Assiomi di Eulero).** $\mathcal B$ è in equilibrio se e solo se per ogni parte $\mathcal P$:
$$\vet r(\mathcal P)=\vet 0,\qquad\vet m_O(\mathcal P)=\vet 0\quad\forall O,\ \forall\mathcal P\subseteq\mathcal B.$$
Richiederlo per **ogni parte** lo rende un principio valido in ogni punto interno. [[p. 41]]
Tabella *corpo rigido* (moto complessivo, nessuna tensione interna; meccanica razionale; es. lancio di un'asta) vs *corpo continuo* (stato interno di tensione e deformazione; Scienza delle Costruzioni; es. inflessione di una trave).

### 3.4.1 Espressione delle risultanti
**Parte interna** ($\partial\mathcal P\cap\partial\mathcal B=\emptyset$):
$$\vet r(\mathcal P)=\int_{\mathcal P}\vet b\,dV+\int_{\partial\mathcal P}\vet t_n\,dA,\quad\vet m_O(\mathcal P)=\int_{\mathcal P}(x-O)\wedge\vet b\,dV+\int_{\partial\mathcal P}(x-O)\wedge\vet t_n\,dA$$
($\hat n$ normale esterna; si approssima la superficie con il piano tangente).
**Parte affiorante**: $\partial\mathcal P_2:=\partial\mathcal P\cap\partial\mathcal B$ (agisce $\hat{\vet s}$), $\partial\mathcal P_1:=\partial\mathcal P-\partial\mathcal P_2$ (agiscono le tensioni); si aggiungono i termini $\int_{\partial\mathcal P_2}\hat{\vet s}\,dA$ e $\int_{\partial\mathcal P_2}(x-O)\wedge\hat{\vet s}\,dA$.

### 3.4.2 ECS e assiomi di Eulero
$\mathcal P\equiv\mathcal B$ dà le ECS: caso particolare.
**Teo. 3.4.2.** Per un corpo deformabile le ECS sono **necessarie ma non sufficienti**.
*Esempio (compasso):* due forze uguali, opposte e collineari agli estremi delle gambe: ECS soddisfatte, ma il compasso si apre. Le ECS bastano solo per il rigido (cerniera saldata). [[p. 42]] *Figura:* compasso con le due forze $F$; "ECS: soddisfatte; equilibrio: no".

## 3.5 Lemma di Cauchy
Contropartita locale di azione e reazione.
**Teo. 3.5.1.** Se valgono gli assiomi di Eulero: $$\vet t_n(x)=-\vet t_{-n}(x)\quad\forall x,\ \forall\hat n.$$
$\vet t_n$ azione di $\mathcal B^+$ su $\mathcal B^-$; $\vet t_{-n}$ di $\mathcal B^-$ su $\mathcal B^+$.
*Dim.* Normale esterna a $\mathcal B^+$ su $A$: $-\hat n$; a $\mathcal B^-$: $\hat n$.
$$\vet r(\mathcal B^+)=\int_{\mathcal B^+}\vet b+\int_{\partial\mathcal B^+}\hat{\vet s}+\int_A\vet t_{-n}=\vet 0,\qquad\vet r(\mathcal B^-)=\int_{\mathcal B^-}\vet b+\int_{\partial\mathcal B^-}\hat{\vet s}+\int_A\vet t_n=\vet 0.$$
Sommando: $\underbrace{\int_{\mathcal B}\vet b+\int_{\partial\mathcal B}\hat{\vet s}}_{=\vet r(\mathcal B)=\vet 0\ \text{(ECS)}}+\int_A(\vet t_n+\vet t_{-n})\,dA=\vet 0$. Per l'arbitrarietà del dominio $A$: $\vet t_n+\vet t_{-n}=\vet 0$. ■
**Attenzione:** integrale nullo non implica integranda nulla ($\int_0^{2\pi}\sin x\,dx=0$); serve l'arbitrarietà del dominio (con $f$ continua).

## 3.6 Teorema di Cauchy–Poisson
Risultato principale della meccanica dei solidi; CN Cauchy 1823, CS Poisson 1829. *Oss. CN/CS:* la patente è necessaria ma non sufficiente per guidare; stare guidando è sufficiente per avere la patente. [[p. 43]]
**Teo. 3.6.1.** Dato $\mathcal B$ sotto $\vet b$, $\hat{\vet s}$, CNS per l'equilibrio è:
1. $\forall x\ \exists\tens T(x)\in\mathrm{Lin}$: $\vet t_n(x)=\tens T(x)\hat n\ \forall\hat n$ (**tensore di tensione di Cauchy**);
2. **equazioni indefinite di equilibrio:** $\operatorname{div}\tens T(x)+\vet b(x)=\vet 0\ \forall x\in\mathring{\mathcal B}=\mathcal B-\partial\mathcal B$ (contropartita locale di $\vet r(\mathcal P)=\vet 0$);
3. **simmetria:** $\tens T=\tens T^T\iff\tens T\in\mathrm{Sym}$ (contropartita locale di $\vet m_O(\mathcal P)=\vet 0$).

**Attenzione (della dispensa):** per la sufficienza serve anche l'equilibrio al contorno $\tens T\hat n=\hat{\vet s}$ su $\partial\mathcal B$ (non scritto negli appunti; nel problema elastico è condizione al contorno).
**Per l'orale — significato dei tre punti:**
1. doppio risultato: esistenza del tensore e operatività: da $\infty^2$ informazioni a **3** (tre giaciture ortogonali);
2. trasforma l'equilibrio alla traslazione da integrale a locale (differenziale), con il teorema della divergenza;
3. localizza l'equilibrio alla rotazione nella simmetria di $\tens T$.

## 3.7 Dimostrazione (CN) [[p. 44]]
Solo la necessaria (la sufficiente perderebbe evidenza meccanica). Dagli assiomi di Eulero.

### 3.7.1 Primo punto: tetraedro di Cauchy
Tetraedro con vertice in $x$: tre facce sui piani coordinati, normali esterne $-\hat e_i$, aree $A_i$; faccia inclinata di area $A$ e normale $\hat n$. *Figura (p. 44):* il tetraedro con le normali $-\hat e_1,-\hat e_2,-\hat e_3$ e $\hat n$.
Proiezioni: $$A_i=A(\hat e_i\cdot\hat n)=An_i\Rightarrow\frac{n_i}{A_i}=\frac1A.$$
Equilibrio alla traslazione: $\int_\Delta\vet b\,dV+\int_A\vet t_n\,dA+\sum_i\int_{A_i}\vet t_{-e_i}\,dA_i=\vet 0$. Si divide per $A$ e si usa il lemma ($\vet t_{-e_i}=-\vet t_{e_i}$):
$$\frac1A\int_\Delta\vet b\,dV+\frac1A\int_A\vet t_n\,dA-\sum_i\frac{n_i}{A_i}\int_{A_i}\vet t_{e_i}\,dA_i=\vet 0.$$
**Localizzazione:** $d$ = distanza del baricentro della faccia inclinata da $x$, $d\to0$ traslando la faccia parallelamente. [[p. 45]] Volume $\sim d^3$, area $\sim d^2$: $\frac1A\int_\Delta\vet b\,dV=O(d)\to0$; $\frac1A\int_A\vet t_n\to\vet t_n(x)$; $\frac1{A_i}\int_{A_i}\vet t_{e_i}\to\vet t_{e_i}(x)$:
$$\vet t_n(x)=\sum_{i=1}^3\vet t_{e_i}(x)\,n_i.$$
In componenti la matrice ha per $j$-esima colonna le componenti di $\vet t_{e_j}$: $\{\vet t_n\}=[\tens T]\{\hat n\}$, $T_{ij}=\tens T\hat e_j\cdot\hat e_i=(\vet t_{e_j})_i$. Relazione lineare in $\hat n$ ⇒ esiste $\tens T\in\mathrm{Lin}$.

### 3.7.2 Secondo punto: equazioni indefinite
$\mathcal P\subset\mathring{\mathcal B}$: $\int_{\mathcal P}\vet b\,dV+\int_{\partial\mathcal P}\tens T\hat n\,dA=\int_{\mathcal P}(\vet b+\operatorname{div}\tens T)\,dV=\vet 0$ (teorema della divergenza). Per l'arbitrarietà di $\mathcal P$: $$\operatorname{div}\tens T+\vet b=\vet 0\quad\forall x\in\mathring{\mathcal B}.$$

### 3.7.3 Terzo punto: simmetria
Parallelepipedo infinitesimo di spigoli $dx_1,dx_2,dx_3$, vertice in $x$; momento assiale nullo rispetto a tre assi $u,v,w$ per il baricentro $G$, paralleli agli assi. [[p. 46]] *Figura (p. 46):* il parallelepipedo con $G$ e gli assi $u,v,w$.
- Volume: risultante $\vet b\,dx_1dx_2dx_3$ in $G$, momento nullo.
- Superficie: si scrive $T_{ij}=\vet t_{e_i}\cdot\hat e_j$ (primo indice giacitura, secondo direzione). Faccia $-\hat e_i$ (contiene $x$): componenti $-T_{ij}$; faccia $+\hat e_i$: $T_{ij}+\frac{\partial T_{ij}}{\partial x_i}dx_i$.

Momento rispetto a $u\parallel\hat e_1$: facce $\pm\hat e_1$ con forze sull'asse → nullo; facce $\pm\hat e_2$: le componenti lungo $\hat e_3$ danno
$$\Big[\Big(T_{23}+\frac{\partial T_{23}}{\partial x_2}dx_2\Big)dx_1dx_3+T_{23}\,dx_1dx_3\Big]\frac{dx_2}{2}\simeq T_{23}\,dx_1dx_2dx_3;$$
facce $\pm\hat e_3$: $\simeq-T_{32}\,dx_1dx_2dx_3$ (si trascura l'infinitesimo di ordine superiore). Somma nulla ⇒ $T_{23}=T_{32}$; analogamente $T_{13}=T_{31}$, $T_{12}=T_{21}$: $\tens T=\tens T^T$. [[p. 47]]
**Teo. 3.7.1 (Reciprocità delle tensioni tangenziali).** $\tau_{ij}=\tau_{ji}$: la tangenziale sulla giacitura $\hat e_i$ in direzione $\hat e_j$ è uguale a quella su $\hat e_j$ in direzione $\hat e_i$. *Figura (p. 47):* elemento con le coppie di $\tau_{ij}$ (antioraria) e $\tau_{ji}$ (oraria) che si bilanciano.

## 3.8 Osservazioni su Cauchy–Poisson
1. Esistenza: tre vettori tensione su tre piani ortogonali bastano (da $\infty^2$ a 3).
2. Equazioni indefinite in componenti: $$\frac{\partial T_{i1}}{\partial x_1}+\frac{\partial T_{i2}}{\partial x_2}+\frac{\partial T_{i3}}{\partial x_3}+b_i=0,\quad i=1,2,3.$$
3. Simmetria ⇔ reciprocità.

*Oss. (regolarità):* serve $\tens T$ regolare per la divergenza; si dimostra che lo è se discende dal punto 1. *Oss. (perché $\mathring{\mathcal B}$):* le derivate sono rapporti incrementali; sulla frontiera non si può incrementare verso l'esterno. [[p. 48]] *Oss. (div o Div):* div = configurazione attuale, Div = di riferimento; con $\|\tens H\|\ll1$, $|\vet u|\ll1$ (equilibrio referenziale) è indifferente; si usa il minuscolo per ricordare che l'equilibrio va scritto, in generale, nella configurazione attuale.

## 3.9 Rappresentazione ingegneristica di $\tens T$
Colonne = vettori tensione sulle giaciture coordinate. Componente di $\vet t_{e_i}$ lungo $\hat e_i$: $\sigma_i$; le altre due: $\tau_{ij}$. Letta per colonne:
$$[\tens T]=\begin{bmatrix}\sigma_1&\tau_{21}&\tau_{31}\\\tau_{12}&\sigma_2&\tau_{32}\\\tau_{13}&\tau_{23}&\sigma_3\end{bmatrix}=\begin{bmatrix}\sigma_1&\tau_{12}&\tau_{13}\\\tau_{12}&\sigma_2&\tau_{23}\\\tau_{13}&\tau_{23}&\sigma_3\end{bmatrix}$$
(discordanza con "prima la giacitura" irrilevante per simmetria).

## 3.10 Calcolo di $\vet t_n$, $\sigma_n$, $\tau_{n\nu}$
Dati $[\tens T]$, $\hat n$, $\hat\nu$ con $\hat n\cdot\hat\nu=0$:
$$\{\vet t_n\}=[\tens T]\{\hat n\},\qquad\sigma_n=\tens T\hat n\cdot\hat n=T_{11}n_1^2+T_{22}n_2^2+T_{33}n_3^2+2T_{12}n_1n_2+2T_{23}n_2n_3+2T_{31}n_3n_1$$
[[p. 49]] (forma quadratica completa in $\hat n$);
$$\tau_{n\nu}=\vet t_n\cdot\hat\nu=T_{11}n_1\nu_1+T_{22}n_2\nu_2+T_{33}n_3\nu_3+T_{12}(n_1\nu_2+n_2\nu_1)+T_{23}(n_2\nu_3+n_3\nu_2)+T_{31}(n_3\nu_1+n_1\nu_3)$$
(componente lungo $\hat\nu$, in generale non l'intera tangenziale).
**Tangenziale totale** (indiretto $\vet t_n\to\sigma_n\to\boldsymbol\tau_n$): $$\boldsymbol\tau_n=\vet t_n-\sigma_n\hat n,\quad\tau_n=|\boldsymbol\tau_n|,\quad\hat\mu=\boldsymbol\tau_n/\tau_n,\qquad|\vet t_n|^2=\sigma_n^2+\tau_n^2.$$
Il segno di $\tau$ è inessenziale (lo scorrimento avviene comunque). *Oss.* Nella dispensa $\hat\mu$ = direzione di $\boldsymbol\tau_n$, $\hat\nu$ = direzione assegnata (negli appunti erano scambiati).

## 3.11 Tensioni e direzioni principali
Esistono giaciture con tensione solo normale? Senso meccanico: tangenziale e normale impegnano diversamente le risorse del materiale.
$$\tens T\hat n=\lambda\hat n\iff(\tens T-\lambda\tens I)\hat n=\vet 0.$$
Autovalori = **tensioni principali** ($\sigma_n=\lambda$); autovettori = **direzioni principali** (tensione solo normale). [[p. 50]]
**Def. 3.11.1 (Piano principale di tensione).** Piano ortogonale a una direzione principale: tensione principale $\lambda$, tangenziali nulle.

### 3.11.1 Risoluzione
Come per la deformazione; spettrale applicabile perché $\tens T\in\mathrm{Sym}$ (punto 3 di Cauchy–Poisson). Equazione secolare $\lambda^3-I\lambda^2+II\lambda-III=0$, $I=\operatorname{tr}\tens T$, $II=\frac12[(\operatorname{tr}\tens T)^2-\operatorname{tr}\tens T^2]$ (somma dei minori principali 2×2), $III=\det\tens T$. Nel riferimento principale $[\tens T]=\operatorname{diag}(\lambda_1,\lambda_2,\lambda_3)$, $I=\sum\lambda_i$, $II=\lambda_1\lambda_2+\lambda_2\lambda_3+\lambda_1\lambda_3$, $III=\lambda_1\lambda_2\lambda_3$. Autovettori con la normalizzazione.
Ordinamento $s_1\ge s_2\ge s_3$: $s_1$ "tensione principale di trazione", $s_3$ "di compressione" (possono però essere tutte dello stesso segno).

### 3.11.2 Casi
1) **Distinte:** $\tens T=\sum\lambda_i\hat n_i\otimes\hat n_i$ (rappresentazione spettrale); [[p. 51]] $\tens T\hat n_2=\lambda_2\hat n_2$.
2) **Doppia:** $\tens T=\lambda_3\hat n_3\otimes\hat n_3+\lambda(\tens I-\hat n_3\otimes\hat n_3)$; $\infty^1$ sistemi principali.
3) **Tripla:** $\tens T=\lambda\tens I$, ogni riferimento è principale: stato **idrostatico** (sferetta in un fluido in quiete).
*Oss.* La tensione generalizza la pressione: un fluido in quiete non ammette sforzi tangenziali, i solidi sì.

## 3.12 Classificazione degli stati di tensione
Per $\hat m$ con componenti $m_i$ nel riferimento principale:
- **Triassiale** (tre non nulli): $\vet t_m=\lambda_1m_1\hat n_1+\lambda_2m_2\hat n_2+\lambda_3m_3\hat n_3$, direzione generica.
- **Biassiale (piano)** ($\lambda_1=0$): $\vet t_m=\lambda_2m_2\hat n_2+\lambda_3m_3\hat n_3$ sempre nel piano $\hat n_2\hat n_3$; $\vet t_{n_1}=\vet 0$: **piano scarico**. Caso comune (stato di scorrimento nelle travi). [[p. 52]] *Es.* $[\tens T]$ con solo $\tau_{12}=\tau$: piano di normale $\hat e_3$ scarico, al più biassiale.
- **Monoassiale** ($\lambda_1=\lambda_2=0$): $\vet t_m=\lambda_3m_3\hat n_3\parallel\hat n_3$; $\infty^1$ piani scarichi (fascio di asse $\hat n_3$). *Es.* $\operatorname{diag}(\sigma,0,0)$: trazione ($\sigma>0$) o compressione semplice.

**Attenzione:** monoassiale non vuol dire tensione solo normale su ogni piano: nel provino in trazione il taglio retto ha solo $\sigma_n$; un taglio obliquo ha $\sigma_m$ e $\tau_m$ (il vettore resta parallelo all'asse). *Figura (p. 52):* provino con $F$; taglio retto ($\vet t_n=\sigma_n\hat n$) e taglio obliquo ($\sigma_m$, $\tau_m$).
**Dagli invarianti:** $III\ne0$ triassiale; $III=0$, $II\ne0$ biassiale; $III=II=0$ monoassiale ($I=II=III=0$: stato nullo).

## 3.13 Tensioni in grado di estremo [[p. 53]]
### 3.13.1 Tensioni normali estreme
Nel riferimento principale $\sigma_m=s_1m_1^2+s_2m_2^2+s_3m_3^2$, massimo vincolato a $\hat m\cdot\hat m=1$ (problema di ottimizzazione), risolto **euristicamente**: $\sigma_m\le s_1(m_1^2+m_2^2+m_3^2)=s_1$, ed è raggiunto su $\hat n_1$; analogamente $\ge s_3$.
**Prop. 3.13.1.** $$s_3\le\sigma_m\le s_1\quad\forall\hat m.$$

### 3.13.2 Tensione tangenziale massima
$\tau_{m\nu}=s_1m_1\nu_1+s_2m_2\nu_2+s_3m_3\nu_3$, funzione di 6 variabili [[p. 54]] con vincoli $|\hat m|=|\hat\nu|=1$, $\hat m\cdot\hat\nu=0$: moltiplicatori di Lagrange (risultato senza derivazione).
**Prop. 3.13.2.** $$\tau_{\max}=\frac{s_1-s_3}{2},\qquad\hat m=\tfrac1{\sqrt2}(\hat n_1-\hat n_3),\quad\hat\nu=\tfrac1{\sqrt2}(\hat n_1+\hat n_3)$$
lungo la bisettrice del quadrante $\hat n_1$–$\hat n_3$. *Verifica:* $\hat m=(1,0,-1)/\sqrt2$, $\hat\nu=(1,0,1)/\sqrt2$: $\tau_{m\nu}=\frac12(s_1-s_3)$; sullo stesso piano $\sigma_m=\frac12(s_1+s_3)$: la giacitura di $\tau_{\max}$ **non è scarica** di tensione normale. *Figura (p. 54):* $\hat m$ e $\hat\nu$ a 45° tra $\hat n_1$ e $\hat n_3$.
*Nota della dispensa:* negli appunti compariva $\frac1{\sqrt2}(\hat m_1-\hat m_2)$; corretta la combinazione tra le direzioni di $s_1$ e $s_3$.

## 3.14 Esercizio svolto (pp. 54–56)
$$[\tens T]=\begin{bmatrix}0&-3&0\\-3&0&6\\0&6&0\end{bmatrix}.$$
**1) Classificazione.** $III=0$ (al più biassiale); $II=-9+0-36=-45\ne0$ ⇒ **biassiale**; $I=0$.
**2) Principali.** $\lambda(\lambda^2-45)=0$: $s_1=3\sqrt5$, $s_2=0$, $s_3=-3\sqrt5$.
$s_1$: $n_2=-\sqrt5n_1$, $n_3=-2n_1$, $n_1^2(1+5+4)=1$: $\{\hat n_1\}=(\sqrt{10}/10,\,-\sqrt2/2,\,-\sqrt{10}/5)$.
$s_2=0$: $n_2=0$, $n_1=2n_3$: $\{\hat n_2\}=(2\sqrt5/5,\,0,\,\sqrt5/5)$.
$s_3$: $\hat n_3=\hat n_1\wedge\hat n_2=(-\sqrt{10}/10,\,-\sqrt2/2,\,\sqrt{10}/5)$; verifica $\tens T\hat n_3=-3\sqrt5\,\hat n_3$ (vedi NF-05).
**3)** $\tau_{\max}=3\sqrt5$; $\{\hat n\}=\frac1{\sqrt2}(\hat n_1-\hat n_3)=\frac{\sqrt5}5(1,0,-2)$, $\{\hat\nu\}=\frac1{\sqrt2}(\hat n_1+\hat n_3)=(0,-1,0)$. Verifica: $\tens T\hat n=(0,-3\sqrt5,0)$, $\tau_{n\nu}=3\sqrt5$, $\sigma_n=0=\frac12(s_1+s_3)$ ✓ (negli appunti fattore $\frac12$ da leggere $\frac1{\sqrt2}$). [[p. 56]]
**4)** $\{\hat n\}=\frac1{\sqrt6}(1,-1,-2)$: $\{\vet t_n\}=\frac3{\sqrt6}(1,-5,-2)$, $\sigma_n=5$; $\{\boldsymbol\tau_n\}=-\frac2{\sqrt6}(1,5,-2)$, $\tau_n=2\sqrt5$, $\{\hat\mu\}=-\frac{\sqrt{30}}{30}(1,5,-2)$. Verifica: $|\vet t_n|^2=45=25+20$; $s_3\le5\le s_1\simeq6{,}71$; $\tau_n\le\tau_{\max}$ ✓.

## 3.15 Rappresentazione grafica di Mohr
Stato di tensione in un punto per i piani di un **fascio con asse una direzione principale** (anche in stato triassiale); il cerchio "classico" è per lo stato biassiale.
### 3.15.1 Impostazione
$$[\tens T]=\begin{bmatrix}\sigma_1&\tau_{12}&0\\\tau_{12}&\sigma_2&0\\0&0&\sigma_3\end{bmatrix}$$
$\hat e_3$ principale. $\hat m=(\cos\alpha,\sin\alpha,0)$, $\hat\nu=(-\sin\alpha,\cos\alpha,0)$ ($\hat m$ ruotato in senso antiorario si sovrappone a $\hat\nu$). $\vet t_m$ sta nel piano $\hat e_1\hat e_2$. [[p. 57]] (In biassiale vale per ogni $\hat m$; in triassiale solo per il fascio.)

### 3.15.2 Equazione del cerchio
$$\sigma_m=\sigma_1\cos^2\alpha+\sigma_2\sin^2\alpha+2\tau_{12}\sin\alpha\cos\alpha,\quad\tau_{m\nu}=(\sigma_2-\sigma_1)\sin\alpha\cos\alpha+\tau_{12}(\cos^2\alpha-\sin^2\alpha)$$
$$\sigma_m=\frac{\sigma_1+\sigma_2}2+\frac{\sigma_1-\sigma_2}2\cos2\alpha+\tau_{12}\sin2\alpha,\qquad\tau_{m\nu}=-\frac{\sigma_1-\sigma_2}2\sin2\alpha+\tau_{12}\cos2\alpha$$
$$\Big(\sigma_m-\frac{\sigma_1+\sigma_2}2\Big)^2+\tau_{m\nu}^2=\Big(\frac{\sigma_1-\sigma_2}2\Big)^2+\tau_{12}^2$$
Cerchio di centro $C=\big(\frac{\sigma_1+\sigma_2}2,0\big)$, raggio $R=\sqrt{\big(\frac{\sigma_1-\sigma_2}2\big)^2+\tau_{12}^2}$ (negli appunti refuso con la semisomma).
**Convenzione:** asse $\sigma$ parallelo e concorde a $\hat e_1$; asse $\tau$ parallelo e **opposto** a $\hat e_2$ (verso il basso). [[p. 58]]

### 3.15.3 Costruzione
1. $A(\sigma_1,0)$, $B(\sigma_2,0)$ (B a sinistra); 2. $C$ a metà; 3. **polo** $P(\sigma_1,-\tau_{12})$; 4. cerchio di centro $C$ e raggio $CP$ ($CP^2=R^2$).
$Q_0(\sigma_1,\tau_{12})$, simmetrico di $P$, rappresenta $\hat m=\hat e_1$ ($\alpha=0$). *Figura (p. 58):* cerchio con $A,B,C,P,Q_0,M$.

### 3.15.4 Impiego
Per $P$ la parallela a $\hat\nu$ (traccia del piano di giacitura $\hat m$) interseca il cerchio in $Q_m(\sigma_m,\tau_{m\nu})$. $\widehat{Q_0PQ_m}=\alpha$ (alla circonferenza) ⇒ $\widehat{Q_0CQ_m}=2\alpha$; con $\widehat{Q_0PM}=\gamma$, $\widehat{Q_0CM}=2\gamma$, $\widehat{Q_mCM}=\Theta=2\gamma-2\alpha$.
**Prop. 3.15.1.** $\sigma_m=\frac{\sigma_1+\sigma_2}2+R\cos\Theta$, $\tau_{m\nu}=R\sin\Theta$, $\Theta=2\gamma-2\alpha$.
*Dim.* Dal triangolo $CAQ_0$: $\frac{\sigma_1-\sigma_2}2=R\cos2\gamma$, $\tau_{12}=R\sin2\gamma$. [[p. 59]] $R\cos(2\gamma-2\alpha)=R\cos2\gamma\cos2\alpha+R\sin2\gamma\sin2\alpha$ ✓; $R\sin(2\gamma-2\alpha)=R\sin2\gamma\cos2\alpha-R\cos2\gamma\sin2\alpha$ ✓. ■
**Faccia di normale $\hat\nu$:** l'asse $\hat m$ per $P$ dà $Q'_m$ diametralmente opposto, $(\sigma_\nu,-\tau_{\nu m})$; non contraddice la reciprocità: per $\hat m':=\hat\nu$ la direzione ruotata di 90° è $\hat\nu'=-\hat m$ (lemma di Cauchy). **Facce ortogonali → punti diametralmente opposti.**

### 3.15.5 Principali con Mohr
$$s_{1,2}=\sigma_C\pm R=\frac{\sigma_1+\sigma_2}2\pm\sqrt{\Big(\frac{\sigma_1-\sigma_2}2\Big)^2+\tau_{12}^2}$$
$S_1P$ dà l'asse $\eta$ (traccia del piano su cui agisce $s_1$), $S_2P$ l'asse $\xi$; $\xi$ ruotando antiorario va su $\eta$; inclinazione $\gamma$ con $$\tan2\gamma=\frac{2\tau_{12}}{\sigma_1-\sigma_2}.$$
(Negli appunti «$A,B=C\pm R$»: sono $S_1,S_2$.) [[p. 60]] *Figura (p. 60):* cerchio con $S_1,S_2$, assi $\xi,\eta$, piani $\alpha,\beta$ di $\tau_{\max}$.

### 3.15.6 Tangenziali massime
Punti estremi $\pm\tau_{\max}$ sulla verticale per $C$; uniti a $P$ danno i piani $\alpha$ (minima) e $\beta$ (massima), con $\sigma=\sigma_C$ (non nulla), $\alpha$ ruotando antiorario va su $\beta$, $$\tau_{\max}=R,$$ a **45°** dai piani principali (90° al centro = 45° reali).
*Oss.* $R=\frac{s_1-s_2}2$ è la massima nel fascio di asse $\hat e_3$; in triassiale la massima assoluta è $\frac{s_{\max}-s_{\min}}2$, $\sigma_3$ compresa.

## 3.16 Esempi
### 3.16.1 Scorrimento semplice
Solo $\tau_{12}=\tau>0$: $\hat e_3$ principale e scarico; $III=0$, $II=-\tau^2\ne0$: biassiale. $A=B=C=(0,0)$, $P=(0,-\tau)$, $R=\tau$. [[p. 61]] $s_1=\tau$, $s_2=-\tau$, direzioni principali a 45° (bisettrici); $\tau_{\max}=\tau$ sui piani coordinati. *Figura (p. 61).*
Esercizio ($\alpha=30°$): $\sigma_m=\tau\sin60°=\frac{\sqrt3}2\tau$, $\tau_{m\nu}=\tau\cos60°=\frac\tau2$; verifica con $\vet t_m=(\tau/2,\sqrt3\tau/2,0)$ ✓.

### 3.16.2 Trazione semplice
$\operatorname{diag}(\sigma,0,0)$, $\sigma=F/A$: monoassiale, $s_1=\sigma$, $s_2=s_3=0$. $A=(\sigma,0)\equiv P$, $B=(0,0)$, $C=(\sigma/2,0)$, $R=\sigma/2$.
$\tau_{\max}=\sigma/2$ su piani a ±45° dalla direzione della trazione, [[p. 62]] ortogonali tra loro, con $\sigma=\sigma/2$ e $|\tau|=\sigma/2$ di segno opposto. *Figura (p. 61):* cerchio passante per l'origine, provino con linee di Lüders a ±45°.
**Per l'orale:** i piani $\alpha$, $\beta$ sono i più sollecitati a scorrimento: **linee di Lüders** (vernice fragile). Lo snervamento è governato dalla tangenziale massima → criteri di **Tresca** e **von Mises** (Cap. 6).

## 3.17 Arbelo di Mohr ed esempio numerico
### 3.17.1 Arbelo
Riferimento principale $\operatorname{diag}(s_1,s_2,s_3)$, $s_1\ge s_2\ge s_3$: un cerchio per ciascun fascio di asse principale: $s_1$–$s_2$, $s_1$–$s_3$ (massimo), $s_2$–$s_3$. *Figura (p. 62):* tre cerchi, regione grigia tra il massimo e i due minori.
**Teo. 3.17.1 (Arbelo di Mohr).** Per ogni giacitura il punto $(\sigma_m,\tau_m)$ sta nella regione compresa tra il cerchio massimo e i due minori, o sui bordi. [[p. 63]] Si rileggono $s_3\le\sigma_m\le s_1$ e $\tau_{\max}=\frac{s_1-s_3}2$.

### 3.17.2 Esempio numerico
$$[\tens T]=\begin{bmatrix}98&21&0\\21&14&0\\0&0&0\end{bmatrix}\ \text{MPa}$$
$A(98,0)$, $B(14,0)$, $C(56,0)$, $P(98,-21)$, $R=\sqrt{42^2+21^2}=46{,}96$ MPa. $s_1=102{,}96$, $s_2=9{,}04$ MPa (entrambe di trazione). $\tan2\gamma=42/84=0{,}5$, $\gamma=13{,}28°$ (negli appunti 31,72° = 45° − 13,28°).
$\tau_{\max}=R=46{,}96$ MPa nel fascio di asse $\hat e_3$, con $\sigma_C=56$ MPa; la massima assoluta è $(s_1-0)/2=51{,}48$ MPa, sui piani del fascio di asse $\hat n_2$, a 45° tra $\hat n_1$ ed $\hat e_3$.
$\alpha=30°$: $\sigma_m=56+21+18{,}19=95{,}19$ MPa, $\tau_{m\nu}=-36{,}37+10{,}50=-25{,}87$ MPa; $\sigma_\nu=16{,}81$ MPa; verifica $\sigma_m+\sigma_\nu=112=\sigma_1+\sigma_2$ ✓.
*Oss.* $\tan2\gamma$ dà due soluzioni (angolo e +90°): per $s_1$ si sceglie quella con $\sigma_m$ maggiore. *Attenzione:* $\tau_{\max}=R$ vale nel fascio; su tutte le giaciture conta l'arbelo.

## 3.18 Quadro riassuntivo (p. 64)
Forze ($\vet b$ $[FL^{-3}]$, $\hat{\vet s}$ $[FL^{-2}]$); Cauchy (limiti, no Cosserat); componenti speciali; Eulero; ECS (CN non CS); lemma; Cauchy–Poisson; tetraedro ($A_i=An_i$, $\vet t_n=\sum\vet t_{e_i}n_i$); reciprocità; forma ingegneristica; $\sigma_n$, $\tau_{n\nu}$; principali; casi; classificazione; estremi; Mohr ($C$, $R$, polo, $s_{1,2}$, $\tan2\gamma$, $\tau_{\max}=R$ a 45°); trazione semplice ($\tau_{\max}=\sigma/2$, Lüders).

## Per l'orale — domande della dispensa (pp. 64–65)
1. Classi di forze su un continuo; perché servono le forze interne.
2. Principio delle sezioni e principio delle tensioni: enunciati, perché assiomi, limiti (continui polari).
3. Il vettore tensione dipende dalla giacitura e non dalla forma della superficie; componenti normale e tangenziale.
4. Assiomi di Eulero; perché le ECS sono solo necessarie (compasso).
5. Enunciare e dimostrare il lemma di Cauchy (arbitrarietà del dominio).
6. Enunciare Cauchy–Poisson; significato dei tre punti; perché $\mathring{\mathcal B}$; div o Div.
7. Dimostrare punto 1 (tetraedro), 2 (divergenza), 3 (parallelepipedo, reciprocità).
8. Rappresentazione ingegneristica di $\tens T$; calcolo di $\sigma_n$, $\tau_{n\nu}$, $\tau_n$.
9. Tensioni e direzioni principali; casi; stato idrostatico.
10. Classificazione (anche con gli invarianti); piano scarico; monoassiale e taglio obliquo.
11. Tensioni normali estreme (euristico) e tangenziale massima.
12. Cerchio di Mohr: derivazione, costruzione, polo, dimostrazione, facce ortogonali, principali, $\tau_{\max}$.
13. Trazione e scorrimento semplice con Mohr; linee di Lüders e criteri di resistenza.
14. Arbelo di Mohr: tre cerchi e regione ammissibile.
