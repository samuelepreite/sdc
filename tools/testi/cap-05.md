# Cap. 5 — Il problema di Saint-Venant (pp. 99–143)

> Convenzioni LaTeX: vedi `cap-01.md`. `[[p. N]]` = inizio pagina N.
> **Convenzioni del capitolo (da rispettare in app e modelli):** riferimento con origine nel baricentro della base di sinistra, asse $z$ lungo l'asse del solido ($z=0$ base di sinistra, $z=L$ base di destra); $x,y$ = **assi principali centrali d'inerzia**, $x$ di inerzia massima. Dalla figura e dal testo (fibre tese per $y>0$ con $M_x>0$, «sotto l'asse neutro»), **$y$ è rivolto verso il basso** nei disegni della sezione. Componenti dello spostamento $u,v,w$. Rotazione della sezione in flessione $\varphi(z)=-v'(z)$ (rotazione oraria negativa). Versi positivi delle CdS: concordi agli assi sulla base di destra.

**Contenuti.** Kirchhoff; formulazione; ipotesi di Saint-Venant e metodo semi-inverso; equilibrio globale e CdS; problema indebolito e postulato; sforzo normale, flessione semplice (retta e deviata, Navier, binomia e monomia, teoremi della flessione), sforzo normale eccentrico (nocciolo, parzializzazione), flessione composta (Jourawski, regola delle tangenti), torsione (Clebsch, Prandtl, sezioni esatte, analogia idrodinamica, sottili aperte e chiuse). Riunisce le parti 5A e 5B degli appunti.

## 5.1 Richiami: energia del corpo e teorema di Kirchhoff [[p. 99]]
*Oss.* $\Phi(\tens E_1+\tens E_2)\ne\Phi(\tens E_1)+\Phi(\tens E_2)$, $\Phi=\int_{\mathcal B}\varphi\,dV$.
**Teo. 5.1.1 (Unicità di Kirchhoff).** Problema elastico lineare con $\mathbb A\in\mathrm{Pos}^+$: se la soluzione esiste è unica a meno di uno spostamento rigido infinitesimo: $\{\vet u+\vet u^{r,\infty},\tens E,\tens T\}$. Un solo $\tens E$ e un solo $\tens T$, non un solo $\vet u$ (aereo in crociera). Incondizionata se $\mathcal B$ è sufficientemente vincolato.
*Dim. (per assurdo).* Due soluzioni $\{\tens E_1,\tens T_1,\vet u_1\}$, $\{\tens E_2,\tens T_2,\vet u_2\}$ con gli stessi dati.
- **Problema differenza:** per sovrapposizione ($\alpha=1,\beta=-1$) $\{\tens E,\tens T,\vet u\}=\{\tens E_1-\tens E_2,\dots\}$ risolve il problema a dati nulli. [[p. 100]]
- **TLV:** FT $=\{\vet 0,\vet 0,\tens T\}$ (equilibrato), SD $=\{\vet u,\tens E\}$ (congruente, $\vet u=\vet 0$ su $\partial\mathcal B_v$):
$$\underbrace{\int_{\partial\mathcal B_\ell}\hat{\vet s}\cdot\vet u}_{=0}+\underbrace{\int_{\partial\mathcal B_v}\tens T\hat n\cdot\vet u}_{=0}+\underbrace{\int_{\mathcal B}\vet b\cdot\vet u}_{=0}=\int_{\mathcal B}\tens T\cdot\tens E\ \Rightarrow\ \int_{\mathcal B}\mathbb A\tens E\cdot\tens E\,dV=0.$$
- **Definita positività:** se $\tens E\ne\tens O$ in un punto (e quindi in un intorno) l'integrale sarebbe positivo: $\tens E=\tens O$ ovunque.
- **Conclusione:** $\tens E_1=\tens E_2$, $\tens T_1=\mathbb A\tens E_1=\tens T_2$, $\vet u_1=\vet u_2+\vet u^{r,\infty}$. ■
*Oss.* Con una trave appoggiata la deformata è unica perché è vincolata; $\mathbb A\in\mathrm{Pos}^+$ serve per invertibilità, plausibilità e per Kirchhoff.

## 5.2 Il problema di Saint-Venant (1855)
Uno dei pochi problemi elastici di cui si conosce la soluzione; usato per le travi (aste delle reticolari). Richiede il **metodo semi-inverso**.
**Def. 5.2.1.** Problema elastico **nelle forze** per un **solido cilindrico retto** molto allungato ($\operatorname{diam}A\ll L$), sezione qualsiasi **semplicemente connessa**, materiale **elastico lineare, omogeneo, isotropo** ($E,G,\nu$ costanti), $\vet b=\vet 0$, **mantello scarico**, forze arbitrarie sulle basi ($\hat{\vet s}^+$, $\hat{\vet s}^-$). [[p. 101]]
*Figura (p. 101):* cilindro con $G_0$, $G_L$, asse $z$, base di sinistra ($\hat{\vet s}^-$) e di destra ($\hat{\vet s}^+$), mantello, sezione $A$, lunghezza $L$.
Non è una trave, ma le sue soluzioni servono per le travi. Nessun vincolo: problema nelle forze.

### 5.2.1 Equazioni
**Campo:** congruenza $E_{xx}=\partial u/\partial x$, …, $E_{xy}=\frac12(\partial u/\partial y+\partial v/\partial x)$, …; equilibrio $\sum_j\partial T_{ij}/\partial x_j=0$; simmetria; legame inverso con i moduli tecnici ($E_{xx}=\frac1E[T_{xx}-\nu(T_{yy}+T_{zz})]$, …, $E_{xy}=T_{xy}/(2G)$, …). 18 equazioni. [[p. 102]]
**Contorno:** mantello $\tens T\hat n=\vet 0$ con $\hat n=(n_x,n_y,0)$: $T_{xx}n_x+T_{xy}n_y=0$, $T_{yx}n_x+T_{yy}n_y=0$, $T_{zx}n_x+T_{zy}n_y=0$; base di destra $\tens T\hat e_z=\hat{\vet s}^+$; di sinistra $\tens T(-\hat e_z)=\hat{\vet s}^-$.

### 5.2.2 Ipotesi di Saint-Venant e metodo semi-inverso
Problema **diretto** (dati → soluzione), **inverso** (effetti → sistema, identificazione strutturale); Saint-Venant sta **in mezzo**: **semi-inverso**, fulcro Kirchhoff: si congettura parte della soluzione da un'interpretazione meccanica, si risolve il resto; se tutto torna, è l'unica soluzione. Si perde l'arbitrarietà del dato, che si assegna "in media" (CdS): **forma indebolita**, giustificata dal **postulato**.
**Ipotesi di Saint-Venant:** comportamento **"a fibre"** (mazzo di spaghetti): fibre contigue si scambiano solo forze parallele all'asse:
$$T_{xx}=T_{yy}=T_{xy}=T_{yx}\equiv0\quad\forall(x,y,z).$$ [[p. 103]]
*Figura (p. 103):* tre fibre contigue, con $T_{xx}$, $T_{yy}$ ipotizzate nulle.
Basta il vettore tensione sulla sezione trasversale ("analisi per sezioni trasversali"):
$$[\tens T]=\begin{bmatrix}0&0&T_{xz}\\0&0&T_{yz}\\T_{zx}&T_{zy}&T_{zz}\end{bmatrix}.$$

### 5.2.3 Equazioni con l'ipotesi
- Congruenza: in più $E_{xy}=0$, cioè $\partial u/\partial y+\partial v/\partial x=0$.
- Equilibrio: $\partial T_{xz}/\partial z=0\Rightarrow T_{xz}=A(x,y)$; $T_{yz}=B(x,y)$; $\partial_xT_{zx}+\partial_yT_{zy}+\partial_zT_{zz}=0$, derivata rispetto a $z$: $\partial^2T_{zz}/\partial z^2=0\Rightarrow$
$$T_{zz}=C(x,y)\,z+D(x,y)\qquad(\star)$$
- Legame: $E_{xx}=E_{yy}=-\frac\nu ET_{zz}$, $E_{zz}=\frac1ET_{zz}$, $E_{xy}=0$, $E_{yz}=\frac{T_{yz}}{2G}$, $E_{zx}=\frac{T_{zx}}{2G}$.
- Mantello: resta $T_{zx}n_x+T_{zy}n_y=0\iff\boldsymbol\tau_z\cdot\hat n=0$: **la tangenziale sul contorno della sezione è tangente al bordo.** [[p. 104]]
*Oss.* $III=0$, $II=-(T_{xz}^2+T_{yz}^2)\ne0$: **biassiale**; $I=T_{zz}$. Sulla sezione $\sigma_z=T_{zz}$, $\tau_z=\sqrt{T_{zx}^2+T_{zy}^2}$.

### 5.2.4 Metodo semi-inverso
Si fissa a priori parte della soluzione e si ricava il resto; se la terna soddisfa tutto, per Kirchhoff è **la** soluzione: il metodo non influisce sulla qualità.

### 5.2.5 Equilibrio globale
Nei problemi nelle forze il dato deve essere equivalente a zero (compatibilità sul dato). Con $G_0$, $G_L$ baricentri delle basi:
$$\vet R_0=\int_{A_0}\hat{\vet s}^-dA,\ \vet M_0=\int_{A_0}(X-G_0)\wedge\hat{\vet s}^-dA,\quad\vet R_L=\int_{A_L}\hat{\vet s}^+dA,\ \vet M_L=\int_{A_L}(X-G_L)\wedge\hat{\vet s}^+dA$$
$$\vet R_0+\vet R_L=\vet 0,\qquad\vet M_0+\vet M_L+L\hat e_z\wedge\vet R_L=\vet 0\tag{5.1}$$ [[p. 105]]

### 5.2.6 Caratteristiche della sollecitazione
**Def. 5.2.2.** Per la sezione $A_z$ di baricentro $G_z$: $$\vet R(z)=\int_{A_z}\vet t_{e_z}dA,\qquad\vet M(z)=\int_{A_z}(X-G_z)\wedge\vet t_{e_z}dA,$$ componenti negli **APCdI**.
Equilibrio di $\mathcal B^-$ (tra base di sinistra e $A_z$): $\vet R_0+\vet R(z)=\vet 0$, $\vet M_0+\vet M(z)+z\hat e_z\wedge\vet R(z)=\vet 0$; sottraendo (5.1):
$$\vet R(z)=\vet R_L,\qquad\vet M(z)=\vet M_L+(L-z)\hat e_z\wedge\vet R_L.$$
*Oss.* $\vet R$ costante; $\vet M$ al più lineare in $z$. [[p. 106]]
Componenti ($\{X-G_z\}=(x,y,0)$, $\vet t_{e_z}=(T_{zx},T_{zy},T_{zz})$):
$$T_x=\int T_{zx}dA,\ T_y=\int T_{zy}dA,\ N=\int T_{zz}dA,\ M_x=\int T_{zz}y\,dA,\ M_y=-\int T_{zz}x\,dA,\ M_z=\int(T_{zy}x-T_{zx}y)\,dA.$$
Forze esterne sulla base di destra $\{\hat T_x,\hat T_y,\hat N\}$, $\{\hat M_x,\hat M_y,\hat M_z\}$; $(L-z)\hat e_z\wedge\vet R_L=-(L-z)\hat T_y\hat e_x+(L-z)\hat T_x\hat e_y$.
**Teo. 5.2.3 (Leggi di variazione delle CdS).** (togliendo il cappuccio)
$$T_x(z)\equiv T_x,\ T_y(z)\equiv T_y,\ N(z)\equiv N,\ M_z(z)\equiv M_z;\qquad M_x(z)=M_x-T_y(L-z),\quad M_y(z)=M_y+T_x(L-z).$$
Tagli, sforzo normale e torcente costanti; flettenti al più lineari. [[p. 107]] (Negli appunti «$N(z)\equiv T_z$»: va letto $N$.)

### 5.2.7 Problema indebolito
La congettura vincola anche le tensioni sulle basi: si assegnano solo le **CdS** (risultante e momento).
- Dato **forte** (puntuale): $T_{zx}=\hat s^+_x$, $T_{zy}=\hat s^+_y$, $T_{zz}=\hat s^+_z$ su ogni punto della base.
- Dato **debole** (integrale, in media): es. $\int_{A_L}T_{zz}dA=\int_{A_L}\hat s^+_zdA$, cioè $N=\hat N$.
1. Infinite distribuzioni hanno lo stesso integrale: si assegna una **classe** di dati staticamente equivalenti. 2. Risolto il problema, dal campo di tensione in $z=L$ si ricavano a posteriori le $\hat{\vet s}^+$ effettive (**back analysis**). 3. Basta assegnare le forze su una base (destra).

### 5.2.8 Postulato di Saint-Venant (dimostrato nel 1960)
**Teo. 5.2.4.** Soluzioni con distribuzioni sulle basi diverse ma **staticamente equivalenti** sono **indistinguibili a sufficiente distanza dalle basi.** [[p. 108]]
*Figura (p. 108):* tre distribuzioni diverse di $N$, soluzioni indistinguibili oltre la distanza $d$.
**Distanza di estinzione** $d$: legata ai raggi d'inerzia della sezione.
*Oss.* 1) Nei sistemi di travi si calcolano comunque le CdS: si rinuncia a una cosa che non serve. 2) Telaio di bicicletta: per ogni sezione si "apre il libro" di Saint-Venant con le stesse CdS; valido nelle **regioni B** (Beam, Bernoulli), non nelle **regioni D** (Discontinuity/Deviation: estremità, nodi, cambi di curvatura) → metodi numerici. *Figura (p. 108):* telaio con regioni B e D.

## 5.3 I casi del problema [[p. 109]]
Per sovrapposizione: **4 casi fondamentali**: 1) **sforzo normale**; 2) **flessione semplice** ($M_x,M_y$); 3) **flessione composta** (taglio $T_x,T_y$, con momento lungo il solido); 4) **torsione**. 1 e 2 danno solo $\sigma_z=T_{zz}$; 3 e 4 tangenziali $\tau_{zx},\tau_{zy}$ (in 3, fuori dalla base di destra, anche $\sigma_z$). **Quinto caso derivato:** sforzo normale eccentrico ($N\oplus M_x,M_y$, coppia di trasporto).

## 5.4 Sforzo normale
**Def. 5.4.1.** Forze sulle basi staticamente equivalenti a due forze uguali e opposte $N$ lungo l'asse, applicate ai baricentri (l'unica CdS non nulla è $N$). [[p. 110]] Il dato non può essere una forza concentrata: conta l'equivalenza statica. Trazione $N>0$, compressione $N<0$.
*Oss.* Versi positivi: concordi agli assi a destra, opposti a sinistra. Generalizza la linea elastica estensionale a soluzione tridimensionale.
### 5.4.1 Congetture
Standard + ulteriore: $T_{xz}=T_{yz}\equiv0$, $T_{zz}=D$ costante (in $(\star)$: $A=B=C=0$, $D(x,y)=D$).
### 5.4.2 Equilibrio
Campo ✓ (forma $(\star)$); mantello ✓; basi indebolite: $N=DA\Rightarrow D=N/A$; $M_x=DS_x=0$, $M_y=-DS_y=0$ (assi baricentrici, Varignon), tagli e torcente nulli. [[p. 111]]
### 5.4.3 Congruenza
$$\frac{\partial u}{\partial x}=-\frac{\nu N}{EA},\quad\frac{\partial v}{\partial y}=-\frac{\nu N}{EA},\quad\frac{\partial w}{\partial z}=\frac N{EA},\quad\text{scorrimenti nulli.}$$
Integrando: $u=-\frac{\nu N}{EA}x+\bar u(y,z)$, $v=-\frac{\nu N}{EA}y+\bar v(x,z)$, $w=\frac N{EA}z+\bar w(x,y)$. Si verifica che $\bar{\vet u}$ ha $\bar{\tens E}=\tens O$ (diagonale: non dipende dalla variabile; fuori diagonale: $\bar E_{xy}=E_{xy}=0$ ecc.): è rigido infinitesimo. ■
### 5.4.4 Soluzione
**Teo. 5.4.2.** $$\{\vet u\}=\Big(-\frac{\nu N}{EA}x,\,-\frac{\nu N}{EA}y,\,\frac N{EA}z\Big)+\vet u^{r,\infty},\quad[\tens E]=\operatorname{diag}\Big(-\frac{\nu N}{EA},-\frac{\nu N}{EA},\frac N{EA}\Big),\quad[\tens T]=\operatorname{diag}\Big(0,0,\frac NA\Big).$$
**Tensione:** uniforme, monoassiale ($N>0$: $s_1=N/A$; $N<0$: $s_3=N/A$); riferimento principale di tensione e (coassialità) di deformazione. [[p. 112]] Piani scarichi: il fascio di asse parallelo a $z$ per il punto ($\infty^1$; negli appunti «$\infty^2$»). Sulla sezione niente tangenziali; su altre giaciture sì. Mohr: $\tau_{\max}=N/(2A)$ a 45° dall'asse. *Figura (p. 112):* cerchio con $A\equiv P$, $C=N/2A$.
**Deformazione:** scorrimenti nulli; asse: $w(z)=\frac N{EA}z$,
$$\Delta L=\frac{NL}{EA}=\frac N{K_N},\qquad K_N:=\frac{EA}L\ \text{(rigidezza estensionale)},\qquad N=EA\,w'$$ (legame della linea elastica estensionale: la linea elastica è la parte della soluzione relativa all'asse). **Sezione:** $|\vet u^{dp}_{xy}|=\frac{\nu N}{EA}r$, $v/u=y/x$: deformazione **omotetica** (contrazione per $N>0$), il baricentro non si sposta. [[p. 113]] Le sezioni restano ortogonali all'asse e traslano di $\frac N{EA}z$ (la base sinistra ferma è solo la parte di deformazione pura).
**Volume ed energia:** $\Theta=\frac{1-2\nu}E\frac NA$ (segno di $N$), $\varphi=\frac{N^2}{2EA^2}$;
$$\Delta V=\frac{1-2\nu}ENL,\qquad\Phi=\frac{N^2L}{2EA}=\frac12N\Delta L.$$
*Oss. (Clapeyron):* il ½ nasce perché il carico cresce quasi staticamente da 0 a $N$: area del triangolo sotto la retta $N$–$\Delta L$.

## 5.5 Flessione semplice
**Def. 5.5.1.** Forze sulle basi staticamente equivalenti a due coppie uguali e opposte nel piano delle basi. Piano di sollecitazione $\pi_s\perp\vet M$; **asse di sollecitazione** $s$ = traccia di $\pi_s$ sulla sezione. Qui $x,y$ devono essere APCdI. [[p. 114]]
### 5.5.1 APCdI ed ellisse centrale d'inerzia
APCdI: coppia ortogonale, baricentrica, **coniugata** ($J_{xy}=0$). Un asse di simmetria è APCdI. Raggi d'inerzia $\rho_x=\sqrt{J_x/A}$, $\rho_y=\sqrt{J_y/A}$. **ECdI**: diagramma polare dei raggi d'inerzia; il raggio relativo a un asse si riporta lungo la direzione **coniugata** (lungo $y$ si riporta $\rho_x$). L a lati uguali: asse di simmetria sulla bisettrice, baricentro fuori dalla figura; L a lati disuguali: APCdI da calcolare; quadrato e poligoni regolari: ECdI circolare, ogni coppia ortogonale è principale. *Figura (p. 114):* ECdI con $\rho_x>\rho_y$; L a lati uguali; ECdI circolare. [[p. 115]]
### 5.5.2 Convenzioni
1. $x$ = APCdI di inerzia massima; 2. $\alpha\in]-\pi,\pi[$ inclinazione di $\vet M$ su $x$; 3. $\gamma=\frac\pi2+\alpha$ inclinazione di $s$ ($\vet M$ ruotando antiorario va sul verso positivo di $s$); 4. $M_x=M\cos\alpha$, $M_y=M\sin\alpha$. *Figura (p. 115).*
**Def. 5.5.2.** Flessione **retta** se $s$ coincide con un APCdI, **deviata** altrimenti. (Doppio T con momento obliquo: deviata; L a lati uguali con $s$ sulla simmetria: retta; quadrato: sempre retta.)
Piano: retta $M_x$; retta $M_y$; deviata come sovrapposizione.

### 5.5.3 Flessione retta $M\equiv M_x$
Congetture: standard + $T_{zx}=T_{zy}\equiv0$, $T_{zz}=Dy$. [[p. 116]]
Equilibrio: campo ✓, mantello ✓; basi: $N=DS_x=0$, $M_x=DJ_x\Rightarrow D=M_x/J_x$, $M_y=-DJ_{xy}=0$ (APCdI), $M_z=0$. $[\tens T]=\operatorname{diag}(0,0,\frac{M_x}{J_x}y)$.
Legame: $E_{xx}=E_{yy}=-\frac\nu E\frac{M_x}{J_x}y$, $E_{zz}=\frac{M_x}{EJ_x}y$, scorrimenti nulli.
Congruenza: per sezione semplicemente connessa CNS $\operatorname{rot}\operatorname{rot}\tens E=\tens O$, soddisfatta (componenti lineari). Integrando le diagonali: $u=-\frac\nu E\frac{M_x}{J_x}xy+\bar u$, $v=-\frac\nu E\frac{M_x}{2J_x}y^2+\bar v$, $w=\frac{M_x}{EJ_x}yz+\bar w$; risultano $\bar E_{xy}\ne0$, $\bar E_{yz}\ne0$: si aggiungono a $v$ i termini $+\frac{\nu M_x}{2EJ_x}x^2$ e $-\frac{M_x}{2EJ_x}z^2$: [[p. 117]]
$$u=-\frac{\nu M_x}{EJ_x}xy,\qquad v=-\frac{\nu M_x}{2EJ_x}\Big[(y^2-x^2)+\frac{z^2}\nu\Big],\qquad w=\frac{M_x}{EJ_x}yz\qquad(+\vet u^{r,\infty}).$$
Verifica $E_{xy}=E_{yz}=E_{zx}=0$ ✓. (Negli appunti in un passaggio «$-z^2/\nu$»: corretto «$+$».)
**Formula di Navier:** $$\sigma_z=\frac{M_x}{J_x}y.$$ Stato monoassiale. (N/A noto da Galileo, flessione da Navier; il contributo nuovo di Saint-Venant è soprattutto la torsione.) Asse neutro $n$: $y=0$ (asse $x$); diagramma **a farfalla**: per $M_x>0$ fibre tese per $y>0$ (sotto), compresse sopra; estremi ai lembi:
$$\sigma'_z=\frac{M_x}{W'_x},\quad\sigma''_z=\frac{M_x}{W''_x},\quad W'_x=\frac{J_x}{y'},\ W''_x=\frac{J_x}{y''}\ \text{(moduli di resistenza)}.$$
*Figura (p. 117):* sezione con $x\equiv n$, $y\equiv s\equiv f$, diagramma a farfalla. [[p. 118]]
**Deformazione:** scorrimenti nulli: la linea elastica resta ortogonale alla deformata della sezione, che resta **piana** (**Bernoulli–Navier**). Asse: $v^{dp}=-\frac{M_x}{2EJ_x}z^2$, rotazione $\varphi(z)=-v'(z)=\frac{M_x}{EJ_x}z$; piano di flessione $\pi_f$, asse di flessione $f\equiv y$. Curvatura $\kappa\simeq-v''=\frac{M_x}{EJ_x}$:
$$M_x=EJ_x\,\kappa\ \text{(legame della linea elastica flessionale)},\quad r=\frac{EJ_x}{M_x}\ \text{(arco di circonferenza)},\quad\Delta\varphi=\frac{M_xL}{EJ_x}=\frac{M_x}{K_f},\ K_f:=\frac{EJ_x}L.$$
*Figura (p. 118):* linea elastica ad arco di raggio $r$, rotazioni $\varphi(\bar z)$, $\varphi(L)$. [[p. 119]]
*Oss. (forma):* a parità di area, allontanare l'area dall'asse aumenta $J_x$ (≈ cubo delle dimensioni): minori $\Delta\varphi$ e $\sigma_{\max}$; il **doppio T** è ottimale.
**Deformazione anticlastica:** a $\bar z=0$: $u^{dp}=-\frac{\nu M_x}{EJ_x}xy$, $v^{dp}=-\frac{\nu M_x}{2EJ_x}(y^2-x^2)$. Asse neutro: $v^{dp}=\frac{\nu M_x}{2EJ_x}x^2$, arco con $$\rho'=-\frac{EJ_x}{\nu M_x},\quad|\rho'|=\frac r\nu>r:$$ asse del solido e asse neutro si incurvano da parti opposte (effetto Poisson). *Figura (p. 119):* sezione deformata a sella.
Fibre: $\Delta L=\frac{M_xL}{EJ_x}y$ (si allungano sotto, si accorciano sopra).
**Volume ed energia:** $\Theta=\frac{1-2\nu}E\frac{M_x}{J_x}y$, $\Delta V=\frac{1-2\nu}E\frac{M_xL}{J_x}S_x=0$; [[p. 120]] $\varphi=\frac{M_x^2}{2EJ_x^2}y^2$, $$\Phi=\frac{M_x^2L}{2EJ_x}=\frac12M_x\Delta\varphi$$ (Clapeyron: carico lento rispetto al periodo naturale di vibrazione).

### 5.5.4 Flessione retta $M\equiv M_y$
$T_{zz}=Dx$, $M_y=-DJ_y\Rightarrow$ $$\sigma_z=-\frac{M_y}{J_y}x;$$ asse neutro $\equiv y$, compressione per $x>0$. Asse: $u^{dp}(0,0,z)=\frac{M_y}{2EJ_y}z^2$. Campo completato dalla dispensa (negli appunti lasciato a metà):
$$u=\frac{M_y}{2EJ_y}\big[\nu(x^2-y^2)+z^2\big],\quad v=\frac{\nu M_y}{EJ_y}xy,\quad w=-\frac{M_y}{EJ_y}xz.$$

### 5.5.5 Flessione deviata
Schema: sezione e momento; APCdI; asse $s$; classificazione. Angoli rispetto a $x$:
$$\alpha=\widehat{MGx},\ \gamma=\tfrac\pi2+\alpha,\ \beta=\widehat{nGx},\ \theta=\widehat{fGx}=\tfrac\pi2+\beta,\ \delta=\widehat{fGs}=\theta-\gamma=\beta-\alpha$$
($n$ asse neutro orientato con $\vet M$ di componente positiva lungo $n$; $f$ asse di flessione; $\delta$ angolo di deviazione). In deviata l'asse si inflette in un piano diverso da quello della coppia. [[p. 121]] *Figura (p. 121):* $\vet M$, $s$, $n$, $f$ e gli angoli.
**Formula binomia:** $$\sigma_z=\frac{M_x}{J_x}y-\frac{M_y}{J_y}x.$$
**Formula monomia:** $$\sigma_z=\frac{M_n}{J_n}f,\quad M_n=M\cos\delta,\quad J_n=J_x\cos^2\beta+J_y\sin^2\beta,\quad n=x\cos\beta+y\sin\beta,\ f=-x\sin\beta+y\cos\beta.$$
**Teo. 5.5.3 (Primo teorema della flessione).** $n$ e $s$ sono **coniugati** rispetto all'ECdI: $$\tan\beta\tan\gamma=-\frac{\rho_x^2}{\rho_y^2}.$$
*Dim.* $\sigma_z=0$: $\tan\beta=\frac yx=\frac{M_y}{J_y}\frac{J_x}{M_x}=\tan\alpha\frac{\rho_x^2}{\rho_y^2}$; $\tan\alpha=-1/\tan\gamma$. ■ [[p. 122]]
*Oss.* $J_a=\rho_a^2A$; coppie coniugate non necessariamente ortogonali. Procedura: $(M,\alpha)\to s\xrightarrow{\text{I}}n\xrightarrow{\text{II}}f$.
**Teo. 5.5.4 (Secondo teorema).** $f\perp n$: $$\tan\theta\tan\beta=-1.$$
*Dim.* Asse: $v^{dp}=-\frac{M_x}{2EJ_x}z^2$, $u^{dp}=\frac{M_y}{2EJ_y}z^2$: stessa dipendenza da $z$ ⇒ asse piano (non un'elica). $\tan\theta=\frac{v^{dp}}{u^{dp}}=-\frac{M_x}{J_x}\frac{J_y}{M_y}=-\frac1{\tan\alpha}\frac{\rho_y^2}{\rho_x^2}=\tan\gamma\frac{\rho_y^2}{\rho_x^2}=-\frac1{\tan\beta}$ (I teorema). ■
*Oss.* Retta: $\alpha=0\Rightarrow\beta=0$ ($n\equiv x$), $\theta=\pi/2$ ($f\equiv y$); monomia → Navier.

## 5.6 Sforzo normale eccentrico
**Oss. (della dispensa): caso derivato, negli appunti ma NON trattato a lezione.**
**Def. 5.6.1.** Forze equivalenti a due forze uguali e opposte parallele all'asse ma non per il baricentro; traccia = **centro di sollecitazione** $c$ (di trazione / di compressione). Coppia di trasporto
$$\vet M=(c-G)\wedge N\hat e_z=Ny_c\hat e_x-Nx_c\hat e_y\ \Rightarrow\ M_x=Ny_c,\ M_y=-Nx_c\iff x_c=-\frac{M_y}N,\ y_c=\frac{M_x}N.$$ [[p. 123]] Eccentricità $e$, $|\vet M|=|N|e$; $c-G$ è l'asse di sollecitazione.
$$\sigma_z=\frac NA+\frac{M_x}{J_x}y-\frac{M_y}{J_y}x=\frac NA\Big(1+\frac{xx_c}{\rho_y^2}+\frac{yy_c}{\rho_x^2}\Big)\ \text{(trinomia)},\qquad\sigma_z=\frac NA+\frac{M_n}{J_n}f\ \text{(binomia)}.$$
Asse neutro $1+\frac{xx_c}{\rho_y^2}+\frac{yy_c}{\rho_x^2}=0$: $c$ e $n$ sono **polo e antipolare** nella polarità d'inerzia; intercette $(-\rho_y^2/x_c,0)$, $(0,-\rho_x^2/y_c)$; $n'$ (della flessione associata) parallelo e baricentrico. Diagramma lineare: nullo su $n$, $N/A$ su $n'$.
### 5.6.1 Nocciolo centrale d'inerzia
**Def. 5.6.2.** Luogo degli antipoli delle rette che non tagliano la sezione; contorno = antipoli delle rette radenti.
$c_1\equiv G$ uniforme; $c_2$ interno: trapezio, sezione tutta compressa (o tesa); $c_3$ sul contorno: triangolo, nullo a un lembo; $c_4$ esterno: farfalla; $c_5\to\infty$ con $N\to0$: flessione semplice. Allontanandosi la compressione massima cresce. [[p. 124]] *Figura (p. 124):* nocciolo, posizioni $c_1$–$c_4$ su $s$ e diagrammi.
### 5.6.2 Materiale non reagente a trazione: parzializzazione
Contatto unilatero (fondazioni, ruota–strada, piede–suolo; archi in muratura).
- $c$ nel nocciolo o sul contorno: sezione tutta compressa, soluzione invariata.
- $c$ esterno al nocciolo: **parzializzazione**; la parte reagente è tale che $c$ cada sul contorno del **suo** nocciolo; diagramma triangolare, $N/A_{reag}$ al baricentro della parte reagente; compressione crescente («saracinesca che si chiude»).
- $c$ sul contorno della sezione: reagisce un punto, $\sigma\to\infty$ («ballerina sulle punte»).
- $c$ fuori dalla sezione: equilibrio impossibile (ribaltamento).
Risultante del triangolo a 1/3 dell'altezza reagente dal lembo più compresso = centro di pressione. *Oss.* Problema non lineare e implicito. [[p. 125]]
**Rettangolo $B\times H$, regola delle "3u":** nocciolo = rombo dei terzi medi (±H/6, ±B/6). Con $c$ su un asse a distanza $u$ dal lembo compresso, la parte reagente è alta $3u$: $$N=\tfrac12\sigma_{\max}B(3u)\Rightarrow\sigma_{\max}=\frac{2N}{3uB}.$$ *Figura (p. 125).*

## 5.7 Flessione composta (taglio)
**Def. 5.7.1.** Forze sulla base di destra equivalenti a una forza $\vet T$ ($T_x,T_y$) nel piano della base; a sinistra $-\vet T$ e una coppia: **dove c'è taglio c'è momento flettente** ($M=TL$). *Figura (p. 125).*
Forte dipendenza dalla forma della sezione; soluzione esatta solo per geometrie semplici. [[p. 126]]
### 5.7.1 Teoria approssimata di Jourawski
Approssimazioni: solo equilibrio; valore **medio** su corde. Ipotesi: asse di simmetria $y$; taglio retto $T\equiv T_y$ ⇒ $M\equiv M_x$, $M_x(z)=-T_y(L-z)$.
*Oss.* Il taglio deve passare per il **centro di taglio** $C_T$ (Sollazzo–Marzano), altrimenti torsione (profilo a C). *Attenzione (della dispensa):* il centro di taglio giace su ogni asse di simmetria; coincide col baricentro se gli assi sono due.
### 5.7.2 Formula di Jourawski
Porzione $\mathcal P$ tra $z$ e $z+dz$ tagliata da un piano parallelo a $xz$: **corda** $b_r$, **area sottesa** $A_r$, rettangolo di taglio $A_t$. [[p. 127]] *Figura (p. 127):* sezione con corda, $A_r$, $\tau_{zy}$.
Equilibrio in $z$: $$\int_{A_r}-\sigma_z(z)\,dA+\int_{A_r}\sigma_z(z+dz)\,dA+\int_{A_t}-\tau_{yz}\,dA=0.$$ Con $\sigma_z=-\frac{T_y(L-z)}{J_x}y$, $\frac{\partial\sigma_z}{\partial z}=\frac{T_y}{J_x}y$: $\frac{T_y}{J_x}dz\int_{A_r}y\,dA=dz\int_{b_r}\tau_{zy}dx$ ($\tau_{zy}$ indipendente da $z$). Con $S_x=\int_{A_r}y\,dA$ e $\bar\tau_{zy}:=\frac1{b_r}\int_{b_r}\tau_{zy}dx$:
**Teo. 5.7.2.** $$\bar\tau_{zy}=\frac{T_yS_x}{J_xb_r}$$ ($S_x$ momento statico dell'area sottesa rispetto all'asse neutro della flessione associata; $J_x$ di tutta la sezione).
**Oss. 1:** la media è rappresentativa solo se $\tau_{zy}$ varia poco sulla corda (stesso segno). [[p. 128]] *Figura:* "OK" (corda parallela all'asse neutro) / "NO".
**Oss. 2:** $S_x=A_r\,y_{G_r}$ (Varignon); nullo ai due lembi, massimo sulla corda baricentrica; $\bar\tau$ nulla ai lembi ($S_x$ va a zero più velocemente di $b_r$); segno di $T_y$.
**Oss. 3:** $\frac{d\bar\tau_{zy}}{dy}=0\iff S'_xb_r-S_xb'_r=0$.
**Prop. 5.7.3.** Il massimo è sulla corda baricentrica **se e solo se** essa è massima, minima o stazionaria ($b'_r(0)=0$): cerchio, clessidra, doppio T.
**Oss. 4 (scorrimento):** senza tensioni tangenziali due parti incollate scorrerebbero (stuzzicadenti); i collegamenti delle travi composte (chiodi, bulloni, saldature) trasmettono queste tensioni. [[p. 129]] (Esempio di lezione: gru a portale con travi bullonate, vernice "mangiata" nei fori.)
**Oss. 5 (diagrammi qualitativi):** sezione a T: salto all'attacco ala–anima in rapporto $B/b$, massimo sulla corda baricentrica (stazionaria): bastano due corde; sezione a croce: salti e massimo relativo in $y=0$; triangolo: massimo non sulla baricentrica (va calcolato). *Figura (p. 129).*
### 5.7.3 $\bar\tau_{zx}$ con Jourawski
Corda di direzione qualsiasi (riferimento $r$ lungo, $t$ ortogonale): [[p. 130]] $\bar\tau_{zt}=\frac{T_yS_x}{J_xb_r}$ (sempre $J_x$ e $S_x$ rispetto a $x$). $[\tens T(P)]$ sulla base di destra con $\bar\tau_{zx}(P)$, $\bar\tau_{zy}(P)$.
*Oss.* $T_x=\int\tau_{zx}=0$; sul bordo $\boldsymbol\tau_z\cdot\hat n=0$; su una corda verticale $\tau_{zx}$ cambia segno: la media di Jourawski non è rappresentativa.
### 5.7.4 Regola delle tangenti
Corda parallela a $x$ a distanza $\bar y$, estremi $A$, $B$; le tangenti al contorno si incontrano in $C$ sull'asse $y$:
$$\tau^A_{zx}=-\bar\tau_{zy}(\bar y)\tan\alpha',\qquad\tau^B_{zx}=\bar\tau_{zy}(\bar y)\tan\alpha'\ (\alpha''=-\alpha').$$
*Figura (p. 130).* Dalla terza equazione indefinita, con $\bar\tau_{zy}$ funzione di $y$: $\partial^2\tau_{zx}/\partial x^2=0$: lineare in $x$; [[p. 131]] imponendo gli estremi:
$$\tau_{zx}(x,\bar y,z)=-2\frac{\bar\tau_{zy}(\bar y)\tan\alpha(\bar y)}{b_r(\bar y)}x$$ (lineare, antisimmetrico, nullo sull'asse $y$).
*Oss.* Cerchio: $\tau_{zx}=0$ sulla corda baricentrica; rettangolo: $\tau_{zx}\equiv0$; T sottile: nell'ala orizzontali, nell'anima verticali (come un fluido).

## 5.8 Torsione
**Def. 5.8.1.** Forze sulle basi equivalenti a due coppie uguali e opposte con momento lungo l'asse. **Eccezione:** approccio di **Clebsch**, congettura sul campo di **spostamento**. *Figura (p. 131):* fibra → elica; rotazione $\theta(z)$ + ingobbamento $\varphi(x,y)$.
### 5.8.1 Congettura
Le sezioni ruotano di $\theta(z)$ (fibre → eliche) e si **ingobbano** allo stesso modo ($\varphi(x,y)$, indipendente da $z$; clip a C). [[p. 132]] $\theta(z)=\theta(0)+\gamma z$, $\gamma:=\theta'(0)$ **angolo unitario di torsione**; $\theta^{dp}=\gamma z$. Arco ≈ tangente: $PP'=r\gamma z$, $u=-\gamma yz$, $v=\gamma xz$.
**Def. 5.8.2.** $$u=-\gamma yz,\qquad v=\gamma xz,\qquad w=\gamma\varphi(x,y).$$
### 5.8.2 Equazioni
Congruenza: $E_{xx}=E_{yy}=E_{zz}=E_{xy}=0$, $$E_{yz}=\tfrac12\gamma\Big(x+\frac{\partial\varphi}{\partial y}\Big),\quad E_{zx}=\tfrac12\gamma\Big(-y+\frac{\partial\varphi}{\partial x}\Big);$$ $\Theta=0$ (isocora).
Legame: $\tens T=2G\tens E$: $$T_{zx}=G\gamma\Big(-y+\frac{\partial\varphi}{\partial x}\Big),\quad T_{zy}=G\gamma\Big(x+\frac{\partial\varphi}{\partial y}\Big).$$
Equilibrio di campo: $\nabla^2\varphi=0$ in $\mathring A$. [[p. 133]] Mantello: $$\frac{d\varphi}{dn}=\nabla\varphi\cdot\hat n=yn_x-xn_y\ \text{su }\partial A.$$ Basi: $N=M_x=M_y=0$; si dimostra $T_x=T_y=0$; $M_z=\int(T_{zy}x-T_{zx}y)\,dA$ dà $\gamma$.
**Teo. 5.8.3 (Clebsch).** $\varphi$ risolve il **problema di Neumann** per Laplace: $\nabla^2\varphi=0$ in $\mathring A$, $\frac{d\varphi}{dn}=yn_x-xn_y$ su $\partial A$; $\gamma$ da $M_z$. (Equazione del II ordine: basta la funzione o la derivata; Neumann = dato sulla derivata.)
### 5.8.3 Funzione di Prandtl
**Def. 5.8.4.** $$\frac{\partial F}{\partial x}=x+\frac{\partial\varphi}{\partial y},\quad\frac{\partial F}{\partial y}=-\Big(-y+\frac{\partial\varphi}{\partial x}\Big)\ \Rightarrow\ T_{zx}=-G\gamma\frac{\partial F}{\partial y},\quad T_{zy}=G\gamma\frac{\partial F}{\partial x}.$$
Equilibrio di campo identicamente soddisfatto (Schwarz). [[p. 134]] Integrabilità: $\nabla^2F=2$. Contorno: con $\hat t=(-n_y,n_x)$: $dF/dt=0$ ⇒ $F$ costante, si sceglie $F=0$ su $\partial A$ (sezione semplicemente connessa); l'equazione del contorno è un primo tentativo per $F$.
**Teo. 5.8.5 (Dirichlet per Poisson).** $$\nabla^2F=2\ \text{in }\mathring A,\qquad F=0\ \text{su }\partial A.$$
### 5.8.4 Angolo unitario e fattore di torsione
$M_z=G\gamma\int_A(x\partial_xF+y\partial_yF)dA$; con $\vet w=(xF,yF)$: $x\partial_xF+y\partial_yF=\operatorname{div}\vet w-2F$, e $\vet w=\vet 0$ su $\partial A$: $$M_z=G\gamma\int_A(-2F)\,dA.$$
**Def. 5.8.6.** $$q:=\frac{J_0}{\int_A(-2F)\,dA}\ge1\ (=1\text{ solo per il cerchio}),\qquad\gamma=q\frac{M_z}{GJ_0}=\frac{M_z}{K_t},\quad K_t:=\frac{GJ_0}q.$$ $q$ = fattore di efficienza. [[p. 135]] *Oss.* $\gamma=\theta(z+1)-\theta(z)$: rotazione relativa di sezioni a distanza unitaria.
**Per l'orale — schema:** 1) congettura ($\gamma$, $\varphi$ ↔ $F$); 2) Dirichlet; 3) $\gamma=qM_z/(GJ_0)$. Soluzioni: esatte chiuse (cerchio, ellisse, anche cavi; triangolo equilatero); esatte in serie (rettangolo, quadrato); approssimate (sottili chiuse e aperte).
### 5.8.5 Sezione circolare
Tentativo $F=x^2+y^2-R^2$ ($\nabla^2F=4$), diviso per 2: $$F=\frac{x^2+y^2-R^2}2,\ \nabla^2F=2\ ✓.$$ $\partial\varphi/\partial y=\partial F/\partial x-x=0$, $\partial\varphi/\partial x=y-\partial F/\partial y=0$: **niente ingobbamento**. $J_0=\pi R^4/2$, $\int(R^2-r^2)dA=\pi R^4/2$: $q=1$, $K_t=GJ_0$.
$$\tau_{zx}=-\frac{M_z}{J_0}y,\quad\tau_{zy}=\frac{M_z}{J_0}x,\quad|\tau_z|=\frac{2M_z}{\pi R^4}r,\quad|\tau_z|_{\max}=\frac{2M_z}{\pi R^3}$$ [[p. 136]] lineare col raggio, ortogonale al raggio vettore, massima sul contorno. *Figura (p. 136).*
### 5.8.6 Altre sezioni esatte
- **Ellisse** ($a>b$): $\tau_{\max}=\frac{2M_z}{\pi ab^2}$ ai piedi dell'asse minore; si ingobba.
- **Triangolo equilatero** (lato $a$): $\tau_{\max}=\frac{5\sqrt3}{12}\frac{M_z}{J_0}a=\frac{20M_z}{a^3}$ ($J_0=\frac{\sqrt3}{48}a^4$), ai punti medi dei lati.
- **Rettangolo** ($h\ge b$): $\theta^{(1)}=\frac1\beta\frac{M_z}{Gb^3h}$, $\tau_{\max}=\frac1\alpha\frac{M_z}{b^2h}$ ai punti medi dei lati lunghi (estremi della mediana più corta).

| $h/b$ | 1,0 | 1,2 | 1,5 | 2,0 | 2,5 | 3 | 4 | 5 | 10 | ∞ |
|---|---|---|---|---|---|---|---|---|---|---|
| $\alpha$ | 0,208 | 0,219 | 0,231 | 0,246 | 0,258 | 0,267 | 0,282 | 0,291 | 0,312 | 0,333 |
| $\beta$ | 0,141 | 0,166 | 0,196 | 0,229 | 0,249 | 0,263 | 0,281 | 0,291 | 0,312 | 0,333 |

Quadrato: $\tau_{\max}=4{,}8\,M_z/a^3$; rettangolo molto allungato: $\alpha,\beta\to\frac13$, $|\tau_{\max}|=3\frac{M_z}{b^2h}$. [[p. 137]] (Negli appunti «diagonale più piccola»: si intende la mediana più corta.)
### 5.8.7 Analogia idrodinamica
Stesse equazioni del moto laminare di un fluido in un recipiente con la forma della sezione (giradischi fermato, gocce d'inchiostro): $|\tau_z|\leftrightarrow|v|$; linee di tensione ↔ linee di flusso; tubo di flusso: $\tau_zb=$ cost. **Spigoli convessi** $\tau\to0$; **concavi** $\tau\to\max$; sulla linea media 0, al contorno massima. Spigoli vivi concavi → plasticizzazione (gola di scarico): servono **raccordi** (anche nei doppi T); picchi rilevanti per la fatica.
**Sottile chiusa vs aperta** (tubolare quadrato lato $B$, spessore $t$): chiusa: $\tau^{(1)}$ costante nello spessore, $dM_z=\tau^{(1)}t(B-t)$; aperta: lineare nello spessore, [[p. 138]] $dM_z=2\cdot\frac12\frac t2\tau^{(2)}\cdot\frac23t=\frac13\tau^{(2)}t^2$:
$$\tau^{(2)}=3\frac{B-t}t\tau^{(1)}$$ ($B=100$ mm, $t=2$ mm: $147\,\tau^{(1)}$, ≈150 volte). Le sezioni chiuse sono molto migliori a torsione. *Figura (p. 138).*
### 5.8.8 Sezione circolare cava
Il bordo interno è una linea di flusso: $F$ costante su $\partial A_{int}$; la stessa $F$ della piena risolve il problema:
$$\tau_z=\frac{M_z}{J_0}r,\ r\in[R_i,R_e],\qquad J_0=\frac{\pi(R_e^4-R_i^4)}2.$$ Analogo per l'ellisse cava. [[p. 139]]
### 5.8.9 Sezioni sottili aperte
$n$ rettangoli allungati ($b_i$ spessore, $h_i$ lunghezza):
$$\tau^i_{z,\max}=\frac{3M_z}{\sum_jb_j^3h_j}b_i,\qquad(\tau_{z,\max})_{\max}=\frac{3M_z}{\sum_jb_j^3h_j}b_{\max}.$$ Piccola sovrastima; negli spigoli metodi numerici.
### 5.8.10 Sezioni sottili chiuse: Bredt (1896)
Linea media $\Gamma$ chiusa regolare, ascissa $s$, spessore $h(s)$, $D$ diametro. Ipotesi: $h/D\ll1$; solo equilibrio alla rotazione; $\tau_z\simeq\bar\tau_z$ sulla corda; tensione parallela alla tangente alla linea media; **ipotesi di Bredt**: $\bar\tau_zh=$ cost. (portata costante).
**Derivazione:** $d\vet F=\bar\tau_z(s)h(s)\hat t(s)\,ds$ [[p. 140]]
$$M_z=\oint_\Gamma\big[(P(s)-G)\wedge d\vet F\big]\cdot\hat e_z=\bar\tau_zh\oint_\Gamma\big[(P-G)\wedge\hat t\big]\cdot\hat e_z\,ds,$$ e il prodotto misto è il doppio dell'area del triangolino $G,P(s),P(s+ds)$: $\oint=2\Omega$. *Figura (p. 140):* $\Gamma$, $\Omega$, $P(s)$, $\hat t(s)$, $G$.
**Teo. 5.8.7 (Formula di Bredt).** $$M_z=\bar\tau_zh\,2\Omega\ \Rightarrow\ \bar\tau_z(s)=\frac{M_z}{2\Omega h(s)}.$$
1. Massimo dove $h=h_{\min}$. 2. Rispetto alla soluzione esatta del tubo circolare (lineare nello spessore) dà la media; errore trascurabile per spessori sottili. 3. Linea media non regolare (spigoli): approssimazione scadente, [[p. 141]] serve più sicurezza o analisi locali (FEM).
**Per l'orale:** Jourawski per il taglio; Bredt per la torsione delle sottili chiuse; rettangoli allungati per le sottili aperte.

## 5.9 Quadro riassuntivo (p. 142)
Kirchhoff; solido di S-V; ipotesi; mantello; CdS; postulato; sforzo normale ($\sigma_z=N/A$, $\Delta L$, $K_N$, omotetia, $\Phi=\frac12N\Delta L$); retta $M_x$ (Navier, $M_x=EJ_x\kappa$, $K_f$, arco, anticlastica); retta $M_y$; deviata (binomia, monomia, teoremi); SNE (trinomia, polo-antipolare); nocciolo e 3u; Jourawski; tangenti; Clebsch, Prandtl, $q$; cerchio; altre sezioni; sottili aperte; Bredt.

## Per l'orale — domande della dispensa (pp. 142–143)
1. Enunciare e dimostrare Kirchhoff; ruolo di $\mathbb A\in\mathrm{Pos}^+$.
2. Definire il problema di S-V e scriverne le equazioni di campo e al contorno.
3. Ipotesi di S-V e conseguenze; metodo semi-inverso e perché funziona.
4. Equilibrio globale e leggi di variazione delle CdS.
5. Problema indebolito, postulato di S-V, regioni B e D.
6. Sforzo normale: congetture, soluzione, tensione e deformazione, Clapeyron.
7. Flessione retta: Navier, spostamenti, Bernoulli–Navier, rigidezza flessionale, anticlastica.
8. Flessione deviata: angoli, binomia e monomia, I e II teorema con dimostrazione.
9. SNE, nocciolo, materiale non reagente a trazione, regola delle 3u.
10. Flessione composta: Jourawski (dimostrazione), valore medio, massimo, scorrimento, diagrammi, regola delle tangenti.
11. Torsione: Clebsch, Neumann, Prandtl e Dirichlet, fattore di torsione.
12. Sezione circolare (piena e cava) e altre sezioni; analogia idrodinamica; sottili aperte e chiuse, Bredt.
