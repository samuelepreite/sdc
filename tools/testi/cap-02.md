# Cap. 2 — Analisi della deformazione (pp. 15–35)

> Convenzioni LaTeX: vedi `cap-01.md` (`\tens{A}`, `\vet{u}`, `\hat e`). `[[p. N]]` = inizio pagina N.

**Contenuti.** Corpo materiale, configurazioni, deformazione e spostamento; requisiti di plausibilità fisica; gradiente di deformazione e di spostamento, identità cinematica fondamentale; deformazioni omogenee, traslazioni, rotazioni, deformazioni rigide; studio locale e deformazione omogenea tangente; parametri di misura e tensore di deformazione finita; teoria infinitesima, piccoli spostamenti ed equilibrio referenziale; tensore di deformazione infinitesima, equazione di congruenza, interpretazione meccanica; formula di rappresentazione; compatibilità (unicità ed esistenza); dilatazioni e direzioni principali, equazione secolare, casi notevoli.

## 2.1 Corpo materiale, configurazioni, deformazione [[p. 15]]

### 2.1.1 Corpo materiale e punto materiale
A un oggetto fisico (es. la scocca di un autoveicolo) si associa un simulacro in $\mathcal E$, il **corpo materiale** $\mathcal B$.
**Def. 2.1.1.** $\mathcal B$ è una regione **regolare e limitata** di $\mathcal E$: frontiera $\partial\mathcal B$ unione di superfici almeno $C^1$. I suoi punti sono **punti materiali** (dotati di massa; qui irrilevante: lo studio fa astrazione dal tempo).
*Oss.* Lo studio statico è il limite, per accelerazione → 0, di un fenomeno reale molto lento (passeggeri che salgono lentamente sul veicolo): le forze d'inerzia sono trascurabili.

### 2.1.2 Che cosa studia l'analisi della deformazione
Studio **puramente cinematico** (geometrico) delle evoluzioni di $\mathcal B$, indipendente dalle cause. [[p. 16]]
- **configurazione di riferimento** $\mathcal B$, punto generico $X$;
- **configurazione attuale** $f(\mathcal B)$, punto generico $x$.

**Lagrangiano:** si segue il punto $X$ (adottato nel corso). **Euleriano:** si parte dalla configurazione attuale e si risale a $x$ (es. vela: la spinta dipende dalla forma deformata). Le differenze contano per grandi spostamenti/deformazioni; nel corso si lavora con deformazioni e spostamenti piccoli.

### 2.1.3 Deformazione e spostamento
*Figura (p. 16):* $\mathcal B$ con frontiera $\partial\mathcal B$ e punto $X$ (configurazione di riferimento) mappato da $f$ in $f(\mathcal B)$, punto $x$ (configurazione attuale); vettore $\vet u(X)$ da $X$ a $x$.
**Def. 2.1.2.** Deformazione $f:\mathcal B\to\mathcal E$, $x=f(X)$; spostamento
$$\vet u(X)=x-X=f(X)-X.$$
Entrambi campi vettoriali: la deformazione trasforma un corpo in un altro; lo spostamento porta il singolo punto. In componenti $x_i=f_i(X_1,X_2,X_3)$, $u_i=f_i-X_i$.

## 2.2 Requisiti di plausibilità fisica [[p. 17]]
Restrizioni scelte in base ai fenomeni da descrivere.

**1) Biettività. Def. 2.2.1.** $\forall X\ \exists!\,x=f(X)$ e ogni $x$ proviene da un solo $X$. Esclude: **compenetrazione e autocontatto** ($X_1\ne X_2$ con $f(X_1)=f(X_2)$, iniettività violata); **frattura** (un punto genera $x',x''$; negli appunti: suriettività violata).
*Oss.* A rigore la frattura è esclusa già dal fatto che $f$ è una funzione e dalla continuità.

**2) Bicontinuità e regolarità. Def. 2.2.2.** $f$ e $f^{-1}$ continue e regolari (in particolare $f$ con derivata prima continua). *Principio di continuità:* punti vicini restano vicini. La derivata continua fa sì che le fibre diventino curve regolari, senza discontinuità della tangente: niente gradienti discontinui.
*Oss.* Gradienti discontinui: comportamento "patologico" possibile nei compositi fibrorinforzati (rigidezze diverse di fibre e matrice → concentrazioni di tensione, delaminazione); richiede teorie più complesse.

**3) Conservazione dell'orientazione locale** [[p. 18]]
**Def. 2.2.3 (Gradiente di deformazione).** $\tens F(X):=\nabla f(X)$, $F_{ij}=\partial f_i/\partial X_j$.
**Def. 2.2.4 (Orientation preserving).** $\det\tens F(X)>0\ \forall X$.
Da Cap. 1: $\det\tens F=\dfrac{\tens F\hat e_1\wedge\tens F\hat e_2\cdot\tens F\hat e_3}{\hat e_1\wedge\hat e_2\cdot\hat e_3}$: con $\det\tens F>0$ la terna trasformata resta destrorsa (non più necessariamente ortogonale). Si dimostrerà (§2.5.5) che $\det\tens F=dv/dV$.
- $\det\tens F=0$: un volume finito diventa nullo: **implosione**;
- volume nullo che diventa finito (negli appunti "$\det\tens F^{-1}=0$"): **esplosione**, cioè $\det\tens F\to+\infty$.
Nella configurazione di riferimento $\tens F=\tens I$, $\det=1$: richiedere $\det\tens F>0$ significa che, partendo da 1, non può mai attraversare lo zero.
*Figura (p. 18):* andamento di $\det\tens F$ durante l'evoluzione, che parte da 1 e resta nella regione $>0$.

## 2.3 Gradiente di spostamento e tipi speciali di deformazione
**Def. 2.3.1.** $\tens H(X):=\nabla\vet u(X)$, $H_{ij}=\partial u_i/\partial X_j$. Il gradiente di $X\mapsto X$ è $\tens I$, quindi $\tens H=\tens F-\tens I$: [[p. 19]]
**Teo. 2.3.2 (Identità cinematica fondamentale).** $$\tens F=\tens I+\tens H.$$

### 2.3.1 Tipi speciali
- $\tens F=\text{cost}$: deformazioni **omogenee**;
- $\vet u=\text{cost}$: **traslazioni**;
- $\tens F=\tens R\in\mathrm{Rot}$ fisso: $f(X)=X_0+\tens R(X-X_0)$, **rotazione** attorno a $X_0$; con Eulero e $\varphi\ll1$: $\tens R\simeq\tens I+\varphi\tens W$, $\tens R\vet v\simeq\vet v+\varphi\hat e\wedge\vet v$.

### 2.3.2 Deformazioni rigide
**Def. 2.3.3.** $|f(X)-f(Y)|=|X-Y|\ \forall X,Y$.
**Teo. 2.3.4 (senza dim.).** $f$ rigida $\iff\exists\tens Q\in\mathrm{Orth}$: $f(X)=f(X_0)+\tens Q(X-X_0)$.
Comprende rotazioni, traslazioni ($\tens Q=\tens I$) e riflessioni ($\det\tens Q=-1$), queste ultime escluse da $\det\tens F>0$.
*Oss.* $f(X)=\underbrace{f(X_0)-X_0}_{\text{trasl. di }X_0}+\underbrace{X_0+\tens Q(X-X_0)}_{\text{rot./rifl. attorno a }X_0}$: **rototraslazione**.

## 2.4 Studio locale della deformazione [[p. 20]]
Trasforma uno studio analitico (funzioni non lineari) in uno algebrico. *Caso scalare:* $dx\simeq f'(X_0)\,dX$, la tangente. *Caso 3D:* fibra $\hat n$ per $X$, $Y$ nell'intorno, $dL=|Y-X|$, $d\vet X=Y-X$; dopo la deformazione fibra $\hat\nu$, $dl$, $d\vet x=y-x$. Taylor:
$$f(Y)=f(X)+\tens F(X)(Y-X)+o(|Y-X|).$$
Trascurando $o(\cdot)$ una volta per tutte:
$$d\vet x=\tens F\,d\vet X,\qquad\tens F=\tens F(X)\ (\text{centro dell'intorno}).\tag{2.1}$$
**Deformazione omogenea tangente:** *omogenea* perché $\tens F$ calcolato nel centro resta costante nell'intorno; *tangente* per analogia con la curva.
**Per l'orale:** limitandosi a un intorno, la deformazione di tutti i suoi punti si esprime con un'operazione algebrica ($\tens F$ applicato a $d\vet X$). Serve la regolarità di $f$: senza bicontinuità non si potrebbe dire che $f(Y)$ sta nell'intorno di $f(X)$.

## 2.5 Parametri di misura della deformazione
Misure scalari locali (variazione di volume, allungamento di fibre, perdita di ortogonalità); il globale si ottiene integrando (§2.5.6).
*Oss.* Sono sempre **variazioni specifiche**: due elastici di 4 m e 1 m con lo stesso peso hanno allungamenti totali diversi ma uguale allungamento specifico; per la sollecitazione conta quello specifico.

### 2.5.1 Coefficiente di dilatazione lineare [[p. 21]]
La fibra infinitesima resta un segmento (una linea finita potrebbe diventare curva).
**Def. 2.5.1.** $\varepsilon_n(X):=\dfrac{dl-dL}{dL}=\dfrac{dl}{dL}-1$.
**Prop. 2.5.2.** $$\varepsilon_n=\sqrt{\tens F^T\tens F\hat n\cdot\hat n}-1.$$
*Dim.* $d\vet x=\tens F d\vet X$, $d\vet X=dL\,\hat n$: $dl^2=\tens Fd\vet X\cdot\tens Fd\vet X=\tens F^T\tens Fd\vet X\cdot d\vet X=(\tens F^T\tens F\hat n\cdot\hat n)\,dL^2$. ■
Non lineare in $\tens F$ (radice e prodotto di $\tens F$ per sé stesso, come un $x^2$).
Campo: $\varepsilon_n>0$ dilatazione ($dl\to\infty\Rightarrow+\infty$); $=0$; $<0$ contrazione (fibra che degenera in un punto: $\to-1$). $$\varepsilon_n\in\,]-1,+\infty[$$ estremi esclusi (niente annichilimento, $\det\tens F>0$).

### 2.5.2 Tensore di deformazione finita
**Def. 2.5.3 (Green–Saint-Venant).** $$\tens D:=\tfrac12(\tens F^T\tens F-\tens I)\in\mathrm{Sym}.$$
Simmetrico; nullo in assenza di deformazione ($\tens F=\tens I$). [[p. 22]] Da $\tens F^T\tens F=2\tens D+\tens I$: $$\varepsilon_n=\sqrt{2\tens D\hat n\cdot\hat n+1}-1.$$

### 2.5.3 Coefficiente di scorrimento mutuo angolare
Fibre ortogonali $\hat n,\hat m$ diventano $\hat\nu,\hat\mu$ con angolo $\theta$.
**Def. 2.5.4.** $\gamma_{n,m}:=\dfrac\pi2-\theta$.
**Prop. 2.5.5.** $$\sin\gamma_{n,m}=\frac{2\tens D\hat m\cdot\hat n}{\sqrt{2\tens D\hat n\cdot\hat n+1}\sqrt{2\tens D\hat m\cdot\hat m+1}}=\frac{2\tens D\hat m\cdot\hat n}{(\varepsilon_n+1)(\varepsilon_m+1)}.$$
*Dim.* $\sin\gamma=\cos\theta=\dfrac{\tens F\hat n\cdot\tens F\hat m}{|\tens F\hat n||\tens F\hat m|}$; numeratore $\tens F^T\tens F\hat m\cdot\hat n=(2\tens D+\tens I)\hat m\cdot\hat n=2\tens D\hat m\cdot\hat n$ ($\hat m\cdot\hat n=0$); $|\tens F\hat n|=\varepsilon_n+1$. ■
$\gamma>0$: l'angolo si chiude ($\theta<\pi/2$); $\gamma<0$: si apre.

### 2.5.4 Coefficiente di dilatazione superficiale
**Def. 2.5.6.** $\Delta S_{n,m}:=\dfrac{ds-dS}{dS}$.
**Prop. 2.5.7** ($\hat n\perp\hat m$): $$\Delta S_{n,m}=\sqrt{(2\tens D\hat n\cdot\hat n+1)(2\tens D\hat m\cdot\hat m+1)-4(\tens D\hat m\cdot\hat n)^2}-1,\quad\in\,]-1,+\infty[.$$
*Dim.* $ds/dS=|\tens F\hat n\wedge\tens F\hat m|$, identità di Lagrange $|\vet a\wedge\vet b|^2=|\vet a|^2|\vet b|^2-(\vet a\cdot\vet b)^2$. ■ (Se non ortogonali: dividere sotto radice per $1-(\hat n\cdot\hat m)^2$ e $2\tens D\hat m\cdot\hat n\to2\tens D\hat m\cdot\hat n+\hat n\cdot\hat m$.)

### 2.5.5 Coefficiente di dilatazione volumica [[p. 23]]
**Def. 2.5.8.** $\Theta:=\dfrac{dv-dV}{dV}$. **Prop. 2.5.9.** $$\Theta=\det\tens F-1,\quad\in\,]-1,+\infty[.$$
*Dim.* $dV=d\vet X\wedge d\vet Y\cdot d\vet Z$, $dv=\tens Fd\vet X\wedge\tens Fd\vet Y\cdot\tens Fd\vet Z$: il rapporto è $\det\tens F$ per definizione. ■

### 2.5.6 Misure globali
$$\Delta L^{\Gamma}_{AB}=\int_A^B\varepsilon_n(X)\,dl,\qquad\Delta V_{\mathcal B}=\int_{\mathcal B}\Theta(X)\,dV$$
($\hat n$ = tangente alla curva $\Gamma$, varia col punto).

## 2.6 Teoria delle deformazioni infinitesime
### 2.6.1 Piccole deformazioni
**Def. 2.6.1.** $\|\tens H\|\ll1$ ($\tens H$ adimensionale). Allora $\tens F\simeq\tens I$: consente la **linearizzazione delle deformazioni**.

### 2.6.2 Piccoli spostamenti ed equilibrio referenziale [[p. 24]]
**Def. 2.6.2.** $|\vet u|\ll1$, piccoli rispetto alle dimensioni caratteristiche del corpo. Da non confondere:
- grandi spostamenti ⇏ grandi deformazioni (foglio piegato: il segmento resta 10 cm);
- grandi deformazioni ⇒ grandi spostamenti (gli spostamenti integrano le deformazioni);
- piccole def. e grandi spost.: la vela; piccole e piccoli: travi comuni; grandi def. e piccoli spost.: impossibile.

Piccoli spostamenti non toccano la descrizione della deformazione ma l'**equilibrio**, che va imposto nella configurazione deformata, non nota in partenza: problema implicito (elastico con secchio).
*Esempio (palo portafari):* carico $P$ con eccentricità $e$: $M=Pe$ trascurando la deformazione; in realtà $M=P(e+f)$, con $f$ dipendente da $M$; se $f\ll e$, $M\simeq Pe$.
**Per l'orale:** piccoli spostamenti ⇒ **equilibrio referenziale** (si confonde la configurazione deformata con quella di riferimento). Piccole deformazioni ⇒ linearizzazione delle deformazioni; piccoli spostamenti ⇒ linearizzazione dell'equilibrio.

### 2.6.3 Dalla teoria finita a quella infinitesima
Procedimento formale: 1) $\tens F=\tens I+\epsilon\tens H$; 2) calcolo; 3) si trascurano $\epsilon^2,\epsilon^3,\dots$; 4) $\epsilon=1$. [[p. 25]]
**Prop. 2.6.3.** $$\tens D=\tfrac12\big[(\tens I+\epsilon\tens H^T)(\tens I+\epsilon\tens H)-\tens I\big]=\tfrac12\big(\epsilon\tens H+\epsilon\tens H^T+\epsilon^2\tens H^T\tens H\big)\simeq\tfrac12(\tens H+\tens H^T).$$
**Def. 2.6.4.** $$\tens E:=\tfrac12(\tens H+\tens H^T).$$ Nella teoria infinitesima tutte le misure (lagrangiane, euleriane) collassano in $\tens E$.
**Teo. 2.6.5 (Equazione di congruenza o di compatibilità).** $$\tens E=\tfrac12(\nabla\vet u+\nabla\vet u^T).$$
$\tens E=\operatorname{sym}\nabla\vet u\in\mathrm{Sym}$, è un **campo** $\tens E(X)$. $E_{ij}=\frac12\left(\frac{\partial u_i}{\partial X_j}+\frac{\partial u_j}{\partial X_i}\right)$, $E_{ii}=\partial u_i/\partial X_i$.

### 2.6.4 Rotazione rigida infinitesima e spostamenti rigidi
$$\underset{(9)}{\tens H}=\underset{(6)}{\tens E}+\underset{(3)}{\tens W},\qquad\tens W:=\tfrac12(\tens H-\tens H^T)\in\mathrm{Skw}$$ (tensore di rotazione rigida infinitesima).
- Traslazione: $\tens H=\tens O\Rightarrow\tens E=\tens W=\tens O$.
- Rotazione rigida: $\tens F=\tens R=\tens I+\sin\varphi\tens W+(1-\cos\varphi)\tens W^2$.
- Rotazione rigida infinitesima: $\tens F\simeq\tens I+\varphi\tens W\Rightarrow\tens H=\varphi\tens W\in\mathrm{Skw}$, per unicità $\tens E=\tens O$. [[p. 26]]
Spostamento rigido infinitesimo: $\tens H=\tens W$, $\tens E=\tens O$.
**Per l'orale:** $\tens E$ misura la **deformazione pura**, ciò che resta tolto lo spostamento rigido infinitesimo ($\tens W$). Gli spostamenti rigidi infinitesimi non producono deformazioni, quindi nemmeno tensioni.

### 2.6.5 Parametri linearizzati
**Prop. 2.6.6.**
$$\varepsilon_n=\tens E\hat n\cdot\hat n=E_{11}n_1^2+E_{22}n_2^2+E_{33}n_3^2+2E_{12}n_1n_2+2E_{23}n_2n_3+2E_{31}n_3n_1,$$
$$\gamma_{n,m}=2\tens E\hat m\cdot\hat n,\qquad\Delta S_{n,m}=\varepsilon_n+\varepsilon_m\ (\hat n\perp\hat m),\qquad\Theta=\operatorname{tr}\tens E=\operatorname{div}\vet u.$$
*Dim. (cenni).* $\tens D\simeq\tens E$, $\sqrt{1+2x}\simeq1+x$, $\arcsin x\simeq x$; $\det(\tens I+\epsilon\tens H)=1+\epsilon\operatorname{tr}\tens H+O(\epsilon^2)$ e $\operatorname{tr}\tens W=0$. ■ Tutto lineare in $\tens E$.
*Oss.* $\Theta\equiv0\iff$ deformazione **isocora** $\iff\vet u$ solenoidale ($\operatorname{div}\vet u=0$).

### 2.6.6 Interpretazione meccanica delle componenti di $\tens E$
$E_{ii}=\varepsilon_i$, $E_{ij}=\tfrac12\gamma_{ij}$ ($i\ne j$): diagonale = dilatazioni lungo gli assi, fuori diagonale = **metà** degli scorrimenti.
$$[\tens E]=\begin{bmatrix}\varepsilon_1&\frac12\gamma_{12}&\frac12\gamma_{13}\\\cdot&\varepsilon_2&\frac12\gamma_{23}\\\cdot&\cdot&\varepsilon_3\end{bmatrix}.$$

## 2.7 Formula di rappresentazione [[p. 27]]
Ipotesi $\|\tens H\|\ll1$, $|\vet u|\ll1$. Da Taylor, sottraendo $Y-X$: $f(Y)-Y=f(X)-X+(\tens F-\tens I)(Y-X)$, e $\tens F-\tens I=\tens H=\tens E+\tens W$:
**Teo. 2.7.1.** $$\vet u(Y)=\underbrace{\vet u(X)}_{\text{trasl. rigida}}+\underbrace{\tens W(Y-X)}_{\text{rot. rigida infinitesima}}+\underbrace{\tens E(Y-X)}_{\text{spost. di deformazione pura}}$$
$\vet u^{dp}:=\tens E(Y-X)$. *Figura (p. 27):* costruzione vettoriale: $Y-X$, $\vet u(X)$ riportato in $Y$, poi $\tens W(Y-X)$ ortogonale a $Y-X$, poi $\tens E(Y-X)$, fino a $\vet u(Y)$ e a $y$.
$\tens W(Y-X)=\vet w\wedge(Y-X)\perp(Y-X)$: fino alla rotazione rigida la distanza non cambia; solo $\vet u^{dp}$ deforma.
*Esempio (trampolino):* mensola caricata in punta; se il tratto oltre $X$ fosse rigido, $Y$ trasla con $X$ e si sposta lungo la tangente alla deformata (rotazione rigida); il contributo aggiuntivo, fino alla deformata effettiva, è la deformazione pura. **Un corpo si può rompere solo per effetto della deformazione pura.**

## 2.8 Il problema della compatibilità
$$\tens E(X)=\tfrac12\big(\nabla\vet u(X)+\nabla\vet u^T(X)\big).\tag{2.2}$$
- **Diretto:** dato $\vet u$, trovare $\tens E$: sì, basta derivare.
- **Inverso (compatibilità):** dato $\tens E$ simmetrico e regolare, esiste $\vet u$? Non sempre. [[p. 28]] 6 PDE in 3 incognite: $\partial u_1/\partial X_1=E_{11}$, $\frac12(\partial u_1/\partial X_2+\partial u_2/\partial X_1)=E_{12}$, …
*Oss.* Nella pratica le soluzioni sono numeriche: un problema mal posto darebbe comunque un numero, frutto della sola propagazione degli errori; esistenza e unicità garantiscono senso fisico.

**Teo. 2.8.1 (Unicità, «di Kirchhoff» nella dispensa).** La soluzione, se esiste, è unica a meno di uno spostamento rigido infinitesimo: $\vet u_1=\vet u_2+\vet u^\infty$ (la differenza ha deformazione nulla).
*Oss.* Unicità incondizionata se $\mathcal B$ è sufficientemente vincolato (edificio); aereo in volo: deformata nota, posizione assoluta no.
*Attenzione (della dispensa):* qui è l'unicità del problema cinematico; il teorema di Kirchhoff per il problema elastico si vedrà con i legami costitutivi (vedi NF-04).

**Teo. 2.8.2 (Esistenza, Saint-Venant).** Condizione necessaria: $$\operatorname{rot}\big(\operatorname{rot}\tens E(X)\big)=\tens O\quad\forall X\tag{2.3}$$ anche sufficiente se $\mathcal B$ è **semplicemente connesso** (ogni curva chiusa si riduce per continuità a un punto restando nel dominio; impossibile con cavità passanti). [[p. 29]]
*Oss.* In componenti 6 equazioni di Saint-Venant, del tipo $\dfrac{\partial^2E_{11}}{\partial X_2^2}+\dfrac{\partial^2E_{22}}{\partial X_1^2}=2\dfrac{\partial^2E_{12}}{\partial X_1\partial X_2}$ (e permutazioni), più tre miste.
**Interpretazione meccanica:** corpo diviso in tessere infinitesime, ciascuna deformata in modo omogeneo secondo $\tens E(X)$; compatibile se le tessere deformate si ricompongono senza vuoti né sovrapposizioni. *Figura (p. 29):* tessere deformate che si ricompongono (compatibile) o lasciano vuoti/sovrapposizioni (non compatibile).

## 2.9 Dilatazioni e direzioni principali
### 2.9.1 Posizione del problema
$\vet u^{dp}(Y)=\tens E(Y-X)=|Y-X|\tens E\hat n$: in generale non parallelo a $\hat n$. Esistono $\hat n$ con $\tens E\hat n\parallel\hat n$?
**Def. 2.9.1.** Tali $\hat n$ sono **direzioni principali**; il corrispondente $\varepsilon_n$ è la **dilatazione principale**. $\tens E\hat n=\lambda\hat n\iff(\tens E-\lambda\tens I)\hat n=\vet 0$: autovalori/autovettori, autocoppia $(\lambda,\hat n)$. [[p. 30]]

**Teo. 2.9.2 (Spettrale).** $\forall\tens E\in\mathrm{Sym}$: a) almeno 3 autocoppie reali; b) autovalori distinti ⇒ autovettori ortogonali. ⇒ **sistema di riferimento principale di deformazione**. (Unica ipotesi: simmetria; non simmetrico ⇒ autovalori possibilmente complessi.)
*Dim. b).* $\lambda_1\hat n_1\cdot\hat n_2=\tens E\hat n_1\cdot\hat n_2=\hat n_1\cdot\tens E^T\hat n_2=\hat n_1\cdot\tens E\hat n_2=\lambda_2\hat n_1\cdot\hat n_2\Rightarrow(\lambda_1-\lambda_2)\hat n_1\cdot\hat n_2=0$. ■

### 2.9.2 Equazione secolare di Laplace
Sistema $(\tens E-\lambda\tens I)\hat n=\vet 0$, $\hat n\cdot\hat n=1$; soluzioni non banali solo se il rango non è massimo.
**Teo. 2.9.3.** CNS: $$\det(\tens E-\lambda\tens I)=0\iff\lambda^3-I\lambda^2+II\lambda-III=0\qquad(\star)$$

| Invariante | Assoluta | Componenti |
|---|---|---|
| $I$ lineare | $\operatorname{tr}\tens E$ | $E_{11}+E_{22}+E_{33}$ |
| $II$ quadratico | $\frac12[(\operatorname{tr}\tens E)^2-\operatorname{tr}\tens E^2]$ | somma dei minori principali 2×2 |
| $III$ cubico | $\det\tens E$ | $\det[\tens E]$ |

Indipendenti dal riferimento, come le radici. Trovata $\lambda^*$, $\hat n^*$ da $(\tens E-\lambda^*\tens I)\hat n^*=\vet 0$, $\hat n^*\cdot\hat n^*=1$. [[p. 31]]

### 2.9.3 I tre casi
**Caso 1 — distinti.** 3 autocoppie, terna principale ortogonale: $$[\tens E]=\operatorname{diag}(\lambda_1,\lambda_2,\lambda_3),\qquad\tens E=\sum_i\lambda_i\,\hat n_i\otimes\hat n_i.$$ Diagonale = dilatazioni principali ($\varepsilon_n=\lambda$); scorrimenti nulli tra direzioni principali ($\gamma_{ij}=2\lambda_j\hat n_j\cdot\hat n_i=0$): restano ortogonali. Una sfera materiale → ellissoide triassiale. Gli scorrimenti in un riferimento non principale sono effetto della base.
**Caso 2 — doppia** $\lambda_1=\lambda_2=\lambda\ne\lambda_3$: $\infty^1$ autocoppie, ogni $\hat n\perp\hat n_3$; $$\tens E=\lambda_3\hat n_3\otimes\hat n_3+\lambda(\tens I-\hat n_3\otimes\hat n_3).$$ Tutte le direzioni del piano hanno dilatazione $\lambda$; asse $\hat n_3$ privilegiato. Sfera → ellissoide di rivoluzione (pallone da rugby).
**Caso 3 — tripla:** $\infty^2$ autocoppie, $\tens E=\lambda\tens I$ (sferico): deformazione **omotetica**, $\gamma\equiv0$, $\varepsilon_n=\lambda$; $\vet u^{dp}$ radiale; la sfera resta sfera. [[p. 32]]

### 2.9.4 Ordinamento e proprietà di estremo
$\lambda_1\ge\lambda_2\ge\lambda_3\iff e_1\ge e_2\ge e_3$ (massima, intermedia, minima).
**Prop. 2.9.4.** $$e_3\le\varepsilon_n\le e_1\quad\forall\hat n.$$
*Dim.* Nel riferimento principale $\varepsilon_n=e_1n_1^2+e_2n_2^2+e_3n_3^2$, media pesata con pesi $\ge0$ a somma 1. ■ (Analogo delle tensioni principali.)

## 2.10 Proprietà di $\tens E$ con dilatazioni principali nulle
$\tens E\hat m=\lambda_1(\hat m\cdot\hat n_1)\hat n_1+\lambda_2(\hat m\cdot\hat n_2)\hat n_2+\lambda_3(\hat m\cdot\hat n_3)\hat n_3$.
1. Tutti $\ne0$: deformazione tridimensionale, sfera → ellissoide triassiale.
2. $\lambda_1=0$: $\vet u^{dp}$ sempre parallelo al piano $\hat n_2\hat n_3$; la dispensa scrive «una sfera si deforma in un'ellisse piatta nel piano $\hat n_2\hat n_3$» (vedi **NF-02**). La fibra lungo $\hat n_1$ non cambia lunghezza (il che non vuol dire che il corpo resti fermo attorno a quella direzione).
3. $\lambda_1=\lambda_2=0$: $\tens E\hat m=\lambda_3(\hat m\cdot\hat n_3)\hat n_3\parallel\hat n_3$: deformazione solo lungo $\hat n_3$.

**Lettura dagli invarianti** ($III=\lambda_1\lambda_2\lambda_3$, $II=\lambda_1\lambda_2+\lambda_2\lambda_3+\lambda_3\lambda_1$, $I=\sum\lambda_i$): [[p. 33]]

| Invarianti | Nulle | Stato |
|---|---|---|
| $III\ne0$ | nessuna | triassiale |
| $III=0,\ II\ne0$ | una | biassiale |
| $III=II=0,\ I\ne0$ | due | monoassiale |

$III=0\Rightarrow\lambda(\lambda^2-I\lambda+II)=0$; anche $II=0\Rightarrow\lambda^2(\lambda-I)=0$. Tutti nulli ⇒ $\tens E=\tens O$.

**Teoria finita e infinitesima a confronto.** Con la teoria finita, per campi semplici, i risultati coincidono con la geometria analitica; con quella infinitesima differiscono (es. la tangente di un angolo si confonde con l'angolo) ma ne sono il limite al tendere a zero dell'ampiezza.

## 2.11 Quadro riassuntivo (p. 34)
Tabella delle formule: $x=f(X)$, $\vet u=f-X$; requisiti; $\tens F=\nabla f$, $\tens H=\nabla\vet u$, $\tens F=\tens I+\tens H$; rigida; $d\vet x=\tens Fd\vet X$; $\varepsilon_n$, $\tens D$, $\sin\gamma$, $\Delta S$, $\Theta=\det\tens F-1$ e campi $]-1,+\infty[$; piccole deformazioni/spostamenti; $\tens E,\tens W$; parametri linearizzati; $E_{ii}=\varepsilon_i$, $E_{ij}=\gamma_{ij}/2$; rappresentazione; compatibilità; equazione secolare; tre casi; estremo.

## Per l'orale — domande della dispensa (pp. 34–35)
1. Definire corpo materiale, configurazioni, deformazione e spostamento; punto di vista lagrangiano ed euleriano.
2. Requisiti di plausibilità fisica: quali fenomeni escludono e perché; significato di $\det\tens F>0$.
3. Identità cinematica fondamentale; deformazioni omogenee, traslazioni, rotazioni, rigide.
4. Studio locale: da Taylor alla deformazione omogenea tangente.
5. Ricavare $\varepsilon_n$ in funzione di $\tens F$ e di $\tens D$; campo di variazione.
6. Dimostrare che $\Theta=\det\tens F-1$.
7. Piccole deformazioni vs piccoli spostamenti; equilibrio referenziale (palo).
8. Linearizzare $\tens D$ e ottenere $\tens E$; parametri linearizzati.
9. Interpretazione meccanica delle componenti di $\tens E$.
10. Formula di rappresentazione: i tre termini; cosa misura $\tens E$ e cosa $\tens W$.
11. Compatibilità: unicità e teorema di Saint-Venant; ruolo della semplice connessione.
12. Direzioni e dilatazioni principali: spettrale, secolare, invarianti, tre casi, estremo.
13. Dilatazioni principali nulle e lettura dagli invarianti.
