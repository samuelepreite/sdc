# Cap. 1 — Il linguaggio dello studio: algebra e analisi tensoriale (pp. 1–14)

> Trascrizione fedele della dispensa (Fase 0). Fonte: testo estratto dal PDF del progetto; formule ricostruite in LaTeX.
> **Convenzioni di scrittura LaTeX** (valide per tutti i file `cap-XX.md`, macro KaTeX dell'app):
> - `\tens{A}` = tensore del II ordine, maiuscola con tilde sottoscritta $\underset{\sim}{A}$;
> - `\vet{u}` = vettore, minuscola sottosegnata $\underline{u}$;
> - `\mathbb{A}` = tensore del IV ordine (maiuscola "filettata");
> - `\hat e` = versore. `[[p. N]]` = inizio della pagina N della dispensa.
> La dispensa numera **Definizioni / Teoremi / Proposizioni** (es. *Def. 1.2.3*) e solo poche equazioni (es. *(1.1)*): l'app cita entrambi.

**Contenuti.** Vettori e tensori del secondo ordine; diadi e proiettori; operazioni fondamentali; tensori simmetrici e antisimmetrici, vettore assiale; inverso e determinante; tensori ortogonali, rotazioni e formula di Eulero; traccia e prodotto scalare tra tensori; tensori del quarto ordine e loro simmetrie; elementi di analisi tensoriale (gradiente, divergenza, rotore, teorema della divergenza).

## 1.1 Ambiente e convenzioni [[p. 1]]

### 1.1.1 Spazio euclideo e sistema di riferimento
Spazio euclideo tridimensionale $\mathcal E$, i cui oggetti sono i punti; un punto è individuato dalle coordinate fissato un riferimento. Solo riferimenti **ortonormali e destrorsi**, base $\{\hat e_1,\hat e_2,\hat e_3\}$:
- mutuamente ortogonali e unitari: $\hat e_i\cdot\hat e_j=\delta_{ij}$;
- orientati in modo che ciascun versore si sovrapponga al successivo ruotando in senso antiorario.

Il vettore è l'ente che trasforma un punto nell'altro; spazio vettoriale $\mathcal V$. Versori:
$$\mathcal N:=\{\hat e\in\mathcal V\mid \hat e\cdot\hat e=1\}.$$

### 1.1.2 Enti assoluti e componenti
- notazione **assoluta (intrinseca)**: definizioni indipendenti dal riferimento;
- notazione **in componenti**: fissato un riferimento. Ogni formula in componenti sottintende "fissato un sistema di riferimento".
- `:=` uguaglianza definitoria.

### 1.1.3 Ordine di un ente [[p. 2]]
Numero di componenti in 3D $=3^{\text{ordine}}$.

| Ente | Ordine | N. comp. | Notazione |
|---|---|---|---|
| Scalare | 0 | $3^0=1$ | greche minuscole $\alpha,\beta,\lambda$ |
| Vettore | 1 | $3^1=3$ | minuscole sottosegnate $\vet u,\vet v$ |
| Tensore II ordine | 2 | $3^2=9$ | maiuscole con tilde sottoscritta $\tens A,\tens B$ |
| Tensore IV ordine | 4 | $3^4=81$ | maiuscole "filettate" $\mathbb A,\mathbb C$ |

**Def. 1.1.1 (Componenti di un vettore).** $v_i:=\vet v\cdot\hat e_i$, $\;\vet v=\sum_{i=1}^3 v_i\hat e_i$.

## 1.2 Tensori del secondo ordine

### 1.2.1 Definizione e linearità
**Def. 1.2.1 (Tensore del II ordine).** $\tens A:\mathcal V\to\mathcal V$ lineare: $\forall\vet u\ \exists\vet v=\tens A\vet u$, con
$$\tens A(\alpha\vet u+\beta\vet v)=\alpha\tens A\vet u+\beta\tens A\vet v\quad\forall\alpha,\beta\in\mathbb R,\ \forall\vet u,\vet v.$$
Insieme: $\mathrm{Lin}$. Si scrive prima il tensore e poi il vettore. Casi: $\alpha=\beta=1$ additività; $\beta=0$ omogeneità; $\alpha=\beta=0$: $\tens A\vet 0=\vet 0$.

### 1.2.2 Componenti e matrice associata
**Def. 1.2.2.** $A_{ij}:=\tens A\hat e_j\cdot\hat e_i$. [[p. 3]]

**Attenzione:** si legge $(\tens A\hat e_j)\cdot\hat e_i$: prima l'applicazione dell'ente di ordine superiore, poi il prodotto scalare (tra grandezze omogenee). Leggere $\tens A(\hat e_j\cdot\hat e_i)$ non ha senso.

Matrice $[\tens A]$ 3×3; la definizione è intrinseca, la matrice no.
$$\{\tens A\vet v\}=[\tens A]\{\vet v\},\qquad (\tens A\vet v)_i=\sum_j A_{ij}v_j.$$

### 1.2.3 Tensori notevoli
Identità $\tens I\vet v=\vet v$, $I_{ij}=\delta_{ij}$; nullo $\tens O\vet v=\vet 0$.

### 1.2.4 Diade
**Def. 1.2.3.** $(\vet a\otimes\vet b)\vet u=(\vet b\cdot\vet u)\,\vet a$. Trasforma un vettore in uno parallelo ad $\vet a$, intensità proporzionale alla componente di $\vet u$ lungo $\vet b$. $(\vet a\otimes\vet b)_{ij}=a_ib_j$.
*Dim.* $(\vet a\otimes\vet b)\hat e_j\cdot\hat e_i=(\vet b\cdot\hat e_j)(\vet a\cdot\hat e_i)=b_ja_i$. ■

**Prop. 1.2.4 (Le diadi dei versori sono base di Lin).** $\tens A=\sum_{i,j}A_{ij}\,\hat e_i\otimes\hat e_j$. [[p. 4]]
*Dim.* $\sum_{ij}A_{ij}(\hat e_i\otimes\hat e_j)\vet u=\sum_{ij}A_{ij}u_j\hat e_i=\sum_i(\tens A\vet u)_i\hat e_i=\tens A\vet u$. Indipendenza: $\sum c_{ij}\hat e_i\otimes\hat e_j=\tens O$ ha componenti $c_{ij}$, tutte nulle. ■ Consente il passaggio da notazione indiciale ad assoluta.

### 1.2.5 Proiettori
**Def. 1.2.5.** Con $\hat e\in\mathcal N$: $\hat e\otimes\hat e$ proiettore in direzione $\hat e$, $(\hat e\otimes\hat e)\vet u=(\hat e\cdot\vet u)\hat e$; $\tens I-\hat e\otimes\hat e$ proiettore ortogonale (sul piano $\pi\perp\hat e$). Decomposizione $\vet u=(\hat e\otimes\hat e)\vet u+(\tens I-\hat e\otimes\hat e)\vet u$.
*Figura (p. 4):* vettore $\vet u$ scomposto nella componente lungo $\hat e$ e in quella sul piano $\pi\perp\hat e$.

### 1.2.6 Somma e composizione
**Def. 1.2.6.** $(\tens A+\tens B)\vet u=\tens A\vet u+\tens B\vet u$, $(\tens A+\tens B)_{ij}=A_{ij}+B_{ij}$.
**Def. 1.2.7.** $(\tens A\tens B)\vet u=\tens A(\tens B\vet u)$, $(\tens A\tens B)_{ij}=\sum_k A_{ik}B_{kj}$. In generale $\tens A\tens B\ne\tens B\tens A$; se uguali, "commutano".
*Oss.* $\tens I$ e $\tens O$ commutano con tutti; più in generale commutano con ogni tensore **tutti e soli i tensori sferici** $\lambda\tens I$.

## 1.3 Trasposto, simmetria e antisimmetria [[p. 5]]

**Def. 1.3.1 (Trasposto).** $(\tens A\vet u)\cdot\vet v=(\tens A^T\vet v)\cdot\vet u\ \forall\vet u,\vet v$; $A^T_{ij}=A_{ji}$.
Proprietà: $(\tens A+\tens B)^T=\tens A^T+\tens B^T$, $(\tens A\tens B)^T=\tens B^T\tens A^T$, $(\tens A^T)^T=\tens A$, $(\vet a\otimes\vet b)^T=\vet b\otimes\vet a$.

**Def. 1.3.2.** $\mathrm{Sym}:=\{\tens A=\tens A^T\}$, $\mathrm{Skw}:=\{\tens W=-\tens W^T\}$. $W_{ij}=-W_{ji}\Rightarrow W_{ii}=0$. Simmetrico: 6 componenti distinte; antisimmetrico: 3 (una componente diagonale opposta a sé stessa è nulla).

**Teo. 1.3.3 (I teorema di decomposizione in somma).** $\forall\tens A$ esistono e sono unici $\tens E\in\mathrm{Sym}$, $\tens W\in\mathrm{Skw}$ con $\tens A=\tens E+\tens W$:
$$\tens E=\operatorname{sym}\tens A:=\tfrac12(\tens A+\tens A^T),\qquad \tens W=\operatorname{skw}\tens A:=\tfrac12(\tens A-\tens A^T).$$
*Dim. Esistenza:* $\tens E^T=\tfrac12(\tens A^T+\tens A)=\tens E$, $\tens W^T=\tfrac12(\tens A^T-\tens A)=-\tens W$, $\tens E+\tens W=\tens A$. *Unicità:* se $\tens E+\tens W=\tens E'+\tens W'$, allora $\tens E-\tens E'=\tens W'-\tens W$ è simmetrico e antisimmetrico, uguale al proprio opposto: $\tens O$. ■

### 1.3.4 Vettore assiale [[p. 6]]
**Teo. 1.3.4.** $\forall\tens W\in\mathrm{Skw}\ \exists!\,\vet w$ (vettore assiale) con $\tens W\vet u=\vet w\wedge\vet u\ \forall\vet u$;
$$[\tens W]=\begin{bmatrix}0&-w_3&w_2\\ w_3&0&-w_1\\ -w_2&w_1&0\end{bmatrix}.$$
Il prodotto vettoriale richiama la rotazione (§1.5). *Oss.* $\tens W\vet w=\vet 0$ (il vettore assiale sta nel nucleo); $\tens W\vet u\perp\vet u$ e $\perp\vet w$.

## 1.4 Determinante e inverso
**Def. 1.4.1.**
$$\det\tens A:=\frac{\tens A\vet u\cdot\tens A\vet v\wedge\tens A\vet w}{\vet u\cdot\vet v\wedge\vet w}\quad\forall\vet u,\vet v,\vet w\ \text{lin. indip.}$$
Rapporto tra prodotto misto dei trasformati e prodotto misto dei vettori; non dipende dalla terna. Fattore con cui $\tens A$ moltiplica il volume (con segno). Richiami: $\vet u\wedge\vet v$ e $\vet u\cdot\vet v\wedge\vet w$ come determinanti simbolici.
Proprietà: $\det(\tens A\tens B)=\det\tens A\det\tens B$, $\det\tens A^T=\det\tens A$, $\det\tens A^{-1}=1/\det\tens A$.
**Attenzione:** non lineare: $\det(\tens A+\tens B)\neq\det\tens A+\det\tens B$, $\det(\lambda\tens A)=\lambda^3\det\tens A$.

**Def. 1.4.2 (Inverso)** [[p. 7]] $\tens A\tens A^{-1}=\tens A^{-1}\tens A=\tens I$; CNS: $\det\tens A\neq0$. $(\tens A^{-1})^T=(\tens A^T)^{-1}=:\tens A^{-T}$.

## 1.5 Tensori ortogonali, rotazioni e riflessioni
**Def. 1.5.1.** $\mathrm{Orth}:=\{\tens Q\mid\tens Q\vet u\cdot\tens Q\vet v=\vet u\cdot\vet v\}$: preservano lunghezze e angoli.
**Prop. 1.5.2.** a) $\det\tens Q=\pm1$; b) $\tens Q\tens Q^T=\tens Q^T\tens Q=\tens I$, $\tens Q^{-1}=\tens Q^T$.
*Dim.* $\tens Q\vet u\cdot\tens Q\vet v=\tens Q^T\tens Q\vet u\cdot\vet v\Rightarrow(\tens Q^T\tens Q-\tens I)\vet u\cdot\vet v=0\ \forall\vet u,\vet v\Rightarrow\tens Q^T\tens Q=\tens I$; quindi $\tens Q^{-1}=\tens Q^T$, anche $\tens Q\tens Q^T=\tens I$; $1=\det\tens I=\det(\tens Q^T\tens Q)=(\det\tens Q)^2$. ■
$\mathrm{Rot}:=\{\det=1\}$ (rotazioni), $\mathrm{Rfl}:=\{\det=-1\}$ (riflessioni: non si ottengono per continuità da una rotazione). $\tens I\in\mathrm{Rot}$.

**Teo. 1.5.3 (Formula di Eulero).** $\tens R\in\mathrm{Rot}$, $\tens R\neq\tens I$; asse = unico versore con $\tens R\hat e=\hat e$. Esiste $\varphi\in[0,2\pi)$:
$$\tens R=\tens I+(1-\cos\varphi)\tens W^2+\sin\varphi\,\tens W\tag{1.1}$$
con $\tens W\in\mathrm{Skw}$ di vettore assiale $\hat e$ ($\tens W\vet v=\hat e\wedge\vet v$), $\tens W^2:=\tens W\tens W$, $\varphi$ ampiezza. [[p. 8]] $\tens W\hat e=\vet 0\Rightarrow\tens R\hat e=\hat e$.

**Rotazioni infinitesime.** $\varphi\ll1$: $\cos\varphi\simeq1$, $\sin\varphi\simeq\varphi$; il termine in $\tens W^2$ è $O(\varphi^2)$:
$$\tens R-\tens I=\varphi\tens W+o(\varphi),\qquad \tens R\vet v=\vet v+\varphi\,\hat e\wedge\vet v.$$
Si aggiunge un vettore ortogonale a $\vet v$ e a $\hat e$, modulo $\varphi|\hat e\wedge\vet v|$: si approssima l'arco con la tangente; la lunghezza è conservata solo al primo ordine.
*Figura (p. 8):* sul piano $\pi\perp\hat e$, $\vet v$, $\tens R\vet v$ esatto (sull'arco di ampiezza $\varphi$) e $\varphi\,\hat e\wedge\vet v$ (tangente).

## 1.6 Traccia e prodotto scalare tra tensori
**Def. 1.6.1.** $\operatorname{tr}:\mathrm{Lin}\to\mathbb R$ lineare, $\operatorname{tr}(\vet a\otimes\vet b):=\vet a\cdot\vet b$; quindi $\operatorname{tr}\tens A=A_{11}+A_{22}+A_{33}$.
Proprietà: $\operatorname{tr}\tens A=\operatorname{tr}\tens A^T$, additiva, $\operatorname{tr}(\tens A\tens B)=\operatorname{tr}(\tens B\tens A)$, $\operatorname{tr}\tens I=3$, lineare, $\operatorname{tr}\tens W=0$.
*Dim.* $\operatorname{tr}\tens W=\operatorname{tr}\tens W^T=-\operatorname{tr}\tens W\Rightarrow0$. ■

**Def. 1.6.2** [[p. 9]] $\tens A\cdot\tens B:=\operatorname{tr}(\tens A\tens B^T)=\sum_{ij}A_{ij}B_{ij}$; norma $\|\tens A\|:=(\tens A\cdot\tens A)^{1/2}$; ortogonali se $\tens A\cdot\tens B=0$.
**Prop. 1.6.3.** $\tens A\cdot\tens I=\operatorname{tr}\tens A$; $\tens A\cdot(\vet a\otimes\vet b)=\tens A\vet b\cdot\vet a$; $\tens E\cdot\tens W=0$ per $\tens E\in\mathrm{Sym}$, $\tens W\in\mathrm{Skw}$.
*Dim. (terza).* $\tens E\cdot\tens W=\operatorname{tr}(\tens E\tens W^T)=-\operatorname{tr}(\tens E\tens W)$; ma $\operatorname{tr}(\tens E\tens W^T)=\operatorname{tr}\big((\tens E\tens W^T)^T\big)=\operatorname{tr}(\tens W\tens E)=\operatorname{tr}(\tens E\tens W)$. Dunque $\operatorname{tr}(\tens E\tens W)=0$. ■
*Oss.* $\mathrm{Sym}\cap\mathrm{Skw}=\{\tens O\}$ e sono ortogonali: $\mathrm{Lin}=\mathrm{Sym}\oplus\mathrm{Skw}$ somma diretta ortogonale ($9=6+3$).

## 1.7 Tensori del quarto ordine
**Def. 1.7.1.** $\mathbb A:\mathrm{Lin}\to\mathrm{Lin}$ lineare, $\mathbb A\tens A=\tens B$. Insieme $\mathbb{L}\mathrm{in}$. 81 componenti
$$\mathbb A_{ijhk}:=\big[\mathbb A(\hat e_h\otimes\hat e_k)\big]\cdot(\hat e_i\otimes\hat e_j),\qquad(\mathbb A\tens A)_{ij}=\sum_{h,k}\mathbb A_{ijhk}A_{hk}.$$

**Def. 1.7.2 (Trasposto)** [[p. 10]] $\mathbb A\tens A\cdot\tens B=\mathbb A^T\tens B\cdot\tens A$; $\mathbb A^T_{ijhk}=\mathbb A_{hkij}$.

**Def. 1.7.3 (Simmetria maggiore).** $\mathbb A=\mathbb A^T\iff\mathbb A\tens A\cdot\tens B=\mathbb A\tens B\cdot\tens A\iff\mathbb A_{ijhk}=\mathbb A_{hkij}$.
**Def. 1.7.4 (Prima simmetria minore).** $\mathbb A\tens A\in\mathrm{Sym}\ \forall\tens A$ ($\mathbb A:\mathrm{Lin}\to\mathrm{Sym}$); $\mathbb A_{ijhk}=\mathbb A_{jihk}$.
**Def. 1.7.5 (Seconda simmetria minore).** $\mathbb A\tens A=\mathbb A[\operatorname{sym}\tens A]\iff\mathbb A\tens W=\tens O\ \forall\tens W\in\mathrm{Skw}$: "vede" solo la parte simmetrica ($\mathbb A:\mathrm{Sym}\to\mathrm{Lin}$); $\mathbb A_{ijhk}=\mathbb A_{ijkh}$.

**Conteggio.** Entrambe le minori: $6\times6=36$. Minori + maggiore: $\frac{6\cdot7}{2}=21$ (matrice 6×6 simmetrica: $6+15$).

### 1.7.4 Definita positività e invertibilità [[p. 11]]
**Def. 1.7.6.** $\mathbb A\in\mathrm{Pos}^+\iff\mathbb A\tens A\cdot\tens A>0\ \forall\tens A\ne\tens O$.
**Def. 1.7.7.** Invertibile se $\exists\mathbb A^{-1}$: $\mathbb A\mathbb A^{-1}=\mathbb A^{-1}\mathbb A=\mathbb I$ ($\mathbb I\tens A=\tens A$).
**Attenzione:** definita positività è **sufficiente** per l'invertibilità (se $\mathbb A\tens A=\tens O$ allora $\mathbb A\tens A\cdot\tens A=0\Rightarrow\tens A=\tens O$: nucleo banale), **non necessaria** ($-\mathbb I$ invertibile ma non definito positivo).

## 1.8 Elementi di analisi tensoriale
Dominio regolare $D$, campi $\vet u(X)$, $\tens A(X)$. *Oss.* Il gradiente innalza di uno l'ordine, la divergenza lo abbassa di uno, il rotore lo lascia invariato.

**Def. 1.8.1 (Gradiente).** $(\nabla\vet u)_{ij}:=\dfrac{\partial u_i}{\partial x_j}$, $[\nabla\vet u]=\begin{bmatrix}\partial_1u_1&\partial_2u_1&\partial_3u_1\\\partial_1u_2&\partial_2u_2&\partial_3u_2\\\partial_1u_3&\partial_2u_3&\partial_3u_3\end{bmatrix}$ (riga = componente, colonna = derivata).
**Def. 1.8.2.** $\operatorname{div}\vet u:=\operatorname{tr}\nabla\vet u=\partial_1u_1+\partial_2u_2+\partial_3u_3$.
**Def. 1.8.3** [[p. 12]] $\vet a\cdot\operatorname{div}\tens A:=\operatorname{div}(\tens A^T\vet a)\ \forall\vet a$ fisso; $(\operatorname{div}\tens A)_i=\sum_j\partial A_{ij}/\partial x_j$ (divergenza per righe).
*Derivazione.* $(\tens A^T\vet a)_j=\sum_iA_{ij}a_i\Rightarrow\operatorname{div}(\tens A^T\vet a)=\sum_j\partial_j\sum_iA_{ij}a_i=\sum_ia_i\sum_j\partial_jA_{ij}$; confronto con $\sum_ia_i(\operatorname{div}\tens A)_i$ per ogni $\vet a$. ■

**Teo. 1.8.4 (della divergenza).** Normale uscente $\hat n$:
$$\int_{\partial D}\vet u\cdot\hat n\,dA=\int_D\operatorname{div}\vet u\,dV,\qquad\int_{\partial D}\tens A\hat n\,dA=\int_D\operatorname{div}\tens A\,dV.$$
Il flusso attraverso la superficie chiusa è l'integrale della divergenza. La versione tensoriale si ottiene applicando quella vettoriale a $\tens A^T\vet a$, $\vet a$ fisso arbitrario.

**Def. 1.8.5 (Rotore).** $\operatorname{rot}\vet u\wedge\vet a=(\nabla\vet u-\nabla\vet u^T)\vet a\ \forall\vet a$ [[p. 13]]: $\operatorname{rot}\vet u$ è il vettore assiale di $\nabla\vet u-\nabla\vet u^T=2\operatorname{skw}\nabla\vet u$ (la dispensa rimanda a «§3.4»: vedi NF-01).
**Def. 1.8.6.** $(\operatorname{rot}\tens A)\vet a=\operatorname{rot}(\tens A^T\vet a)\ \forall\vet a$; analogia strutturale con la divergenza.

## 1.9 Quadro riassuntivo (p. 13)
Tabella delle formule chiave: componenti, diade, base, proiettori, composizione, trasposto, decomposizione, vettore assiale, determinante, inverso, ortogonali, Eulero, rotazioni infinitesime ($\tens R\vet v\simeq\vet v+\varphi\hat e\wedge\vet v$), traccia, prodotto scalare ($\tens E\cdot\tens W=0$), IV ordine, simmetrie (36/21), gradiente/divergenza, teorema della divergenza, rotore — tutte già riportate sopra.

## Per l'orale — domande tipiche della dispensa (pp. 13–14)
1. Che cos'è un tensore del II ordine? Perché le componenti si definiscono come $\tens A\hat e_j\cdot\hat e_i$ e in che ordine si eseguono le operazioni?
2. Definire la diade e dimostrare che le 9 diadi $\hat e_i\otimes\hat e_j$ sono base di Lin.
3. Proiettore lungo $\hat e$ e proiettore ortogonale: definizione e interpretazione geometrica.
4. Enunciare e dimostrare il I teorema di decomposizione (esistenza e unicità).
5. Perché un antisimmetrico ha diagonale nulla? Che cos'è il vettore assiale?
6. Dimostrare che per $\tens Q\in\mathrm{Orth}$ $\tens Q^T=\tens Q^{-1}$ e $\det\tens Q=\pm1$; distinguere rotazioni e riflessioni.
7. Scrivere la formula di Eulero, spiegare ogni termine e ricavare le rotazioni infinitesime.
8. Dimostrare che Sym e Skw sono ortogonali ($\tens E\cdot\tens W=0$).
9. Simmetrie dei tensori del IV ordine: definizioni, significato e conteggio 81/36/21.
10. Definita positività e invertibilità di un tensore del IV ordine: quale implica l'altra?
11. Divergenza di un campo tensoriale: definizione intrinseca e derivazione delle componenti; teorema della divergenza.
