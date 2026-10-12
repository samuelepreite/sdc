# Cap. 6 — Criteri di resistenza (pp. 144–159)

> Convenzioni LaTeX: vedi `cap-01.md`. `[[p. N]]` = inizio pagina N. Tensioni principali $s_1\ge s_2\ge s_3$, trazione positiva (salvo §6.7, vedi NF-09). **Attenzione al simbolo:** in questo capitolo $\nu$ indica sia il **coefficiente di sicurezza** (§6.2.3) sia il **coefficiente di Poisson** (Grashof, Beltrami): vedi NF-08.

**Contenuti.** Dal problema di risposta alla verifica; materiali duttili e fragili; verifica di resistenza e di sicurezza per stati monoassiali (tensione limite, coefficiente di sicurezza, tensione ammissibile); stati pluriassiali (tensione ideale, funzione di crisi); criteri di Galileo, Tresca, Grashof, Beltrami; confutazione di Huber; secondo teorema di decomposizione ed energia distorcente; von Mises; Mohr–Coulomb; tensioni ideali alla Saint-Venant; estensione alle travature; verifica e progetto.

## 6.1 Dal problema di risposta alla verifica [[p. 144]]
I problemi di **risposta** (lineari: carichi doppi, risposte doppie) non dicono quando il materiale va in **crisi** (locale: lesione; globale: collasso). Serve verificare la compatibilità dello stato di tensione con la resistenza.
### 6.1.1 Duttili e fragili
- **Duttili** (acciaio da carpenteria): snervamento $\sigma_y$ e ampio campo plastico; stesso comportamento in trazione e compressione ($\pm\sigma_y$).
- **Fragili** (calcestruzzo): poca deformazione prima della rottura; resistenza a compressione molto maggiore di quella a trazione. [[p. 145]]
*Figura (p. 145):* $\sigma$–$\varepsilon$ dell'acciaio (simmetrica, $\pm\sigma_y$) e del calcestruzzo ($\sigma_t$, $\sigma_c$ diversi).
Stato monoassiale: basta confrontare con la prova.

## 6.2 Verifica di resistenza e di sicurezza in un punto
### 6.2.1 Stato tensionale di esercizio
$\tens T_{es}(P)$ = effetto dei carichi (telaio di una moto); la verifica si fa **nel punto** (tutti i punti, o quelli che garantiscono gli altri). Monoassiale: $[\tens T_{es}]=\operatorname{diag}(\sigma_{es},0,0)$.
### 6.2.2 Verifica di resistenza
**Tensione limite** $\sigma_L$: duttili $\sigma_L=\sigma_y$ (non si accettano deformazioni permanenti in esercizio); fragili $\sigma_L=\sigma_R$. Dominio di resistenza = segmento:
$$\sigma_L^c\le\sigma_{es}\le\sigma_L^t\qquad\text{(condizione di resistenza)}.$$ [[p. 146]] *Figura (p. 146):* segmento $[\sigma_L^c,\sigma_L^t]$ con esempi OK/NO.
### 6.2.3 Verifica di sicurezza
Non si può lambire la crisi (l'uccellino sulla copertura): incertezze su geometria, carichi, modello, resistenza; riducibili, mai eliminabili.
**Def. 6.2.1.** Coefficiente di sicurezza $\nu\ge1$ (divisore delle resistenze): $$\sigma_{adm}:=\frac{\sigma_L}\nu.$$

| Materiale | acciaio | legno | calcestruzzo | muratura |
|---|---|---|---|---|
| $\nu$ | 1,7–1,8 | 2,5 | 3 | 4–10 |

Più basso per i duttili (riserva oltre lo snervamento). $$\sigma_{adm}^c\le\sigma_{es}\le\sigma_{adm}^t$$ (**metodo delle tensioni ammissibili**, il più vecchio); dominio di sicurezza ⊂ dominio di resistenza. *Figura (p. 146).*

## 6.3 Stati pluriassiali e criteri di resistenza [[p. 147]]
### 6.3.1 Il problema
Servirebbe il dominio limite nello spazio 6D delle componenti di $\tens T$: proibitivo (prove biassiali solo per ricerca). Le prove sono monoassiali: si dovrebbe confrontare un vettore 6D di esercizio con $(\sigma_L,0,0,0,0,0)$, ma **tra vettori non esiste un ordinamento univoco**.
### 6.3.2 Criteri e tensione ideale
**Def. 6.3.1.** Criterio di resistenza: modello che, dalle tensioni pluriassiali di esercizio, dà una **tensione ideale** $\sigma_{id}$: tensione monoassiale fittizia **ugualmente pericolosa** (equivalenza del cimento). Ogni criterio parte da una congettura sulla causa della crisi, tradotta in una **funzione di crisi** $F(\sigma_x,\sigma_y,\sigma_z,\tau_{xy},\tau_{yz},\tau_{zx})$.
### 6.3.3 Materiali isotropi
Se il materiale è isotropo fino alla crisi e la crisi è isotropa, si usa il riferimento principale: $F(s_1,s_2,s_3)$ (da 6D a 3D). [[p. 148]]
Procedura: 1) calcolo di $\tens T_{es}$, $s_i$, $F(s_1,s_2,s_3)$; 2) sperimentazione $F(\sigma_L,0,0)$; 3) verifica $$F(s_1,s_2,s_3)\le F(\sigma_L,0,0)\qquad(\star)$$ e, isolando $\sigma_L$: $$\sigma_{id}(s_1,s_2,s_3)\le\sigma_L.$$
*Oss.* 1) Con $\sigma_L^t\ne\sigma_L^c$ due funzioni $F^t$, $F^c$ e due disuguaglianze. 2) Per la sicurezza si usa $\sigma_{adm}$. Il criterio si sceglie in base agli esperimenti sul materiale.

## 6.4 I criteri
### 6.4.1 Galileo (Navier, massime tensioni normali)
Metà XVII secolo, forma di Navier; importanza storica. Crisi governata dalla massima/minima tensione normale (estremi, Cap. 3):
$$\sigma_{id}^t=s_1\le\sigma_L^t,\qquad\sigma_{id}^c=s_3\ge\sigma_L^c.$$ Ammette resistenze diverse; non rappresenta la realtà. [[p. 149]]
### 6.4.2 Tresca (Guest, massima tensione tangenziale)
Seconda metà XIX secolo (metallurgia, estrusione). Uguale resistenza t/c. Ispirato alle **linee di Lüders**: a 45° c'è $\tau_{\max}$; la crisi è dovuta alla tangenziale che supera una soglia.
$$F=\max_{\hat n,\hat\nu}\tau_{n\nu}=\frac{s_1-s_3}2\le F(\sigma_L,0,0)=\frac{\sigma_L}2\ \Rightarrow\ \sigma_{id}=s_1-s_3\le\sigma_L.$$ Buono per metalli molto duttili (rame, acciaio dolce). *Figura (p. 149):* linee di Lüders e cerchio con $s_1=\sigma_L$, $\tau_{\max}=\sigma_L/2$.
### 6.4.3 Grashof (Saint-Venant, massime dilatazioni)
Ipotesi: elastico lineare isotropo fino alla crisi (⇒ **coassialità**); resistenze t/c possibilmente diverse. Crisi governata dalla dilatazione: $F^t=\max\varepsilon_n=e_1$, $F^c=e_3$; [[p. 150]] con il legame e la coassialità:
$$e_1=\frac1E[s_1-\nu(s_2+s_3)]\le\frac{\sigma_L^t}E,\qquad e_3=\frac1E[s_3-\nu(s_1+s_2)]\ge\frac{\sigma_L^c}E$$
$$\sigma_{id}^t=s_1-\nu(s_2+s_3)\le\sigma_L^t,\qquad\sigma_{id}^c=s_3-\nu(s_1+s_2)\ge\sigma_L^c.$$ Adatto alla ghisa; per resistenze diverse t/c.
### 6.4.4 Beltrami (1885)
Primo criterio **energetico**: $F=\varphi$. Ipotesi: elastico lineare isotropo (⇒ iperelastico), uguale resistenza t/c.
$$\varphi=\frac1{2E}(s_1^2+s_2^2+s_3^2)-\frac\nu E(s_1s_2+s_2s_3+s_3s_1)\le\frac{\sigma_L^2}{2E}$$
$$\sigma_{id}=\sqrt{s_1^2+s_2^2+s_3^2-2\nu(s_1s_2+s_2s_3+s_3s_1)}\le\sigma_L.$$
*Oss.* Rappresentazione grafica nello spazio delle tensioni principali utile ma non indispensabile; i criteri vanno verificati sperimentalmente.
### 6.4.5 La confutazione di Huber (1904)
Punto immerso a profondità $h$ (autoclave): $\tens T=-\rho gh\,\tens I$, $s_1=s_2=s_3=-\rho gh$.
$$\sigma_{id}^B=\sqrt{3(\rho gh)^2-2\nu\cdot3(\rho gh)^2}=\rho gh\sqrt{3-6\nu}$$ [[p. 151]] ⇒ crisi prevista a $$h_L=\frac{\sigma_L}{\rho g\sqrt{3-6\nu}},$$ ma Huber non osservò crisi nemmeno per $h\gg h_L$: Beltrami fallisce (basta un controesempio). *Figura (p. 151).*

## 6.5 Criterio di von Mises
Von Mises (1913): un invariante della parte deviatorica ("$J_2$"); **Hencky** (1924): equivale a usare l'**energia distorcente** $\varphi_d$ (variazione di forma, non di volume). Ipotesi: elastico lineare isotropo, uguale resistenza t/c.
### 6.5.1 Secondo teorema di decomposizione in somma
**Teo. 6.5.1.** $\forall\tens A$ esistono e sono unici
$$\tens A_s=\operatorname{sph}\tens A:=\tfrac13(\operatorname{tr}\tens A)\tens I\in\mathrm{Sph},\qquad\tens A_d=\operatorname{dev}\tens A:=\tens A-\tfrac13(\operatorname{tr}\tens A)\tens I\in\mathrm{Dev},\qquad\tens A=\tens A_s+\tens A_d.$$
$\operatorname{tr}\tens A_d=0$. Proprietà: $\operatorname{tr}\tens A=\operatorname{tr}\tens A_s$; $\tens A_s\cdot\tens A_d=0$ ($\lambda\tens I\cdot\tens A_d=\lambda\operatorname{tr}\tens A_d=0$): **decomposizione ortogonale**. [[p. 152]]
**Su $\tens E$:** $\tens E_s=\frac13\Theta\tens I$ porta tutta la variazione di volume (omotetica, autovalore triplo $\Theta/3$); $\tens E_d$ solo variazione di forma.
**Su $\tens T$:** $\tens T_s=\sigma_m\tens I$ (tensione normale media); $\tens T_d$ = scostamento da uno stato idrostatico.
**Legame:** in generale da $\tens T_s+\tens T_d=\mathbb A\tens E_s+\mathbb A\tens E_d$ non si separano gli addendi; per isotropi (Lamé) $\mathbb A\tens E_s\in\mathrm{Sph}$, $\mathbb A\tens E_d=2\mu\tens E_d\in\mathrm{Dev}$, quindi per unicità $$\tens T_s=\mathbb A\tens E_s,\qquad\tens T_d=2\mu\tens E_d.$$
**Energia:** per isotropi il termine di accoppiamento $\tens T_s\cdot\tens E_d=0$: $$\varphi=\varphi(\tens E_s)+\varphi(\tens E_d).$$
**Def. 6.5.2 (Energia distorcente).** $$\varphi_d:=\tfrac12\mathbb A\tens E_d\cdot\tens E_d.$$ [[p. 153]]
### 6.5.2 Il criterio
$F=\varphi_d$. $\varphi_d=\frac12\tens T_d\cdot\tens E_d=\frac1{4\mu}\tens T_d\cdot\tens T_d$; sviluppando con $\tens T\cdot\tens I=\operatorname{tr}\tens T$, $\tens I\cdot\tens I=3$:
$$\varphi_d=\frac1{4\mu}\Big[\tens T\cdot\tens T-\frac13(\operatorname{tr}\tens T)^2\Big]=\frac1{12\mu}\big[(s_1-s_2)^2+(s_2-s_3)^2+(s_3-s_1)^2\big].$$
$\varphi_d(\sigma_L,0,0)=\frac{2\sigma_L^2}{12\mu}=\frac{\sigma_L^2}{6\mu}$.
**Teo. 6.5.3 (Criterio di von Mises).** $$\sigma_{id}=\sqrt{\tfrac12\big[(s_1-s_2)^2+(s_2-s_3)^2+(s_3-s_1)^2\big]}\le\sigma_L.$$
### 6.5.3 Osservazioni
1. Stato di Huber: tutte le differenze nulle, $\sigma_{id}^{VM}=0$: nessuna crisi (**pressure insensitive**).
2. Anche Tresca: $s_1-s_3=0$. Questi criteri dipendono dalle **differenze** delle tensioni principali.
3. Von Mises va bene per l'acciaio. [[p. 154]]
4. Huber a segni invertiti, $\tens T=t\tens I$ (trazione uniforme): nella realtà rottura fragile per decoesione a sforzi bassi; von Mises dà 0, Beltrami $t\sqrt{3-6\nu}\ne0$. Stati praticamente rari nelle strutture (prevale la compressione).
**Per l'orale — procedura:** $\sigma_m=\frac13\operatorname{tr}\tens T$; se $\sigma_m\le0$ **von Mises**, se $\sigma_m>0$ **Beltrami**.

## 6.6 Criterio di Mohr–Coulomb
Crisi di natura **attritiva**; **due parametri**: coesione $c$, angolo di attrito interno $\phi$.
**Attrito puro (Coulomb, '700):** $T<-N\tan\phi$, $\tan\phi=\mu$ (resistenza solo con compressione). Localmente: niente crisi se $\tau<-\sigma\tan\phi$.
**Coesione:** resistenza anche con $N=0$. **Mohr–Coulomb (1900):** $$|\tau|<c-\sigma\tan\phi.$$
Nel piano di Mohr: due semirette per $(c/\tan\phi,0)$ e $(0,\pm c)$; dominio di resistenza tra di esse. *Figura (p. 154):* dominio, cerchio interno (OK) e tangente (crisi imminente). [[p. 155]]
Tutti gli stati in un punto stanno nell'**arbelo**; i più gravosi sul **cerchio massimo**: interno → nessuna crisi; tangente → crisi imminente; fuori → incompatibile. In tensioni principali (senza una $\sigma_{id}$ semplice):
$$F=\max_{i,j}\big\{|s_i-s_j|+(s_i+s_j)\sin\phi\big\}\le2c\cos\phi.$$
*Oss. (verifica):* cerchio massimo di centro $\frac{s_1+s_3}2$ e raggio $\frac{s_1-s_3}2$; distanza dalla semiretta ≥ raggio ⟺ $\frac{s_1-s_3}2\le\big(c-\frac{s_1+s_3}2\tan\phi\big)\cos\phi$ ⟺ $(s_1-s_3)+(s_1+s_3)\sin\phi\le2c\cos\phi$ (la coppia (1,3) dà il massimo).

## 6.7 Tensioni ideali per stati alla Saint-Venant
$$[\tens T_{es}]=\begin{bmatrix}0&0&\tau_{zx}\\0&0&\tau_{zy}\\\cdot&\cdot&\sigma_z\end{bmatrix},\qquad\tau_z^2=\tau_{zx}^2+\tau_{zy}^2$$ (al più biassiale):
$$s_{1,2}=\frac{\sigma_z}2\pm\frac12\sqrt{\sigma_z^2+4\tau_z^2},\qquad s_3=0\ \text{(la nulla sta tra le due; vedi NF-09)}.$$
$$\sigma_{id}^{Tresca}=\sqrt{\sigma_z^2+4(\tau_{zx}^2+\tau_{zy}^2)},\qquad\sigma_{id}^{vM}=\sqrt{\sigma_z^2+3(\tau_{zx}^2+\tau_{zy}^2)},$$
$$\sigma_{id}^{Grashof,\,t/c}=\frac{1-\nu}2\sigma_z\pm\frac{1+\nu}2\sqrt{\sigma_z^2+4(\tau_{zx}^2+\tau_{zy}^2)}.$$ [[p. 156]]
Tresca e von Mises per i duttili, Grashof per i fragili.
*Verifica.* Tresca: $s_1-s_2=\sqrt{\sigma_z^2+4\tau_z^2}$. Von Mises: $\frac12[(s_1-s_2)^2+s_2^2+s_1^2]$ con $s_1^2+s_2^2=\sigma_z^2+2\tau_z^2$: $\sigma_z^2+3\tau_z^2$. Grashof: $s_1-\nu s_2$ e $s_2-\nu s_1$. ■
*Attenzione (della dispensa):* negli appunti i coefficienti di Grashof erano scambiati; controprova con puro taglio: $\sigma_{id}^t=(1+\nu)\tau_z$.

**Riepilogo dei criteri**

| Criterio | Funzione di crisi | Tensione ideale | Materiali |
|---|---|---|---|
| Galileo | $\max\sigma_n=s_1$; $\min\sigma_n=s_3$ | $s_1\le\sigma_L^t$; $s_3\ge\sigma_L^c$ | storico; $\sigma_L^t\ne\sigma_L^c$ |
| Tresca | $\max\tau=\frac{s_1-s_3}2$ | $s_1-s_3\le\sigma_L$ | duttili (rame, acciaio dolce) |
| Grashof | $e_1$, $e_3$ | $s_1-\nu(s_2+s_3)\le\sigma_L^t$; $s_3-\nu(s_1+s_2)\ge\sigma_L^c$ | fragili (ghisa) |
| Beltrami | $\varphi$ | $\sqrt{\sum s_i^2-2\nu\sum s_is_j}\le\sigma_L$ | confutato da Huber |
| von Mises | $\varphi_d$ | $\sqrt{\frac12\sum(s_i-s_j)^2}\le\sigma_L$ | acciaio; pressure insensitive |
| Mohr–Coulomb | $|\tau|<c-\sigma\tan\phi$ | $\max\{|s_i-s_j|+(s_i+s_j)\sin\phi\}\le2c\cos\phi$ | crisi attritiva |

## 6.8 Estensione alle travature
Capannone (colonne, mensole per il carroponte, copertura a volta, pensilina, fotovoltaico): asse curvo, sezioni variabili, forze sul mantello (vento, impianti), peso proprio: Saint-Venant non si applica direttamente. [[p. 157]]
**Per l'orale:** non si assimila la struttura a un solido di Saint-Venant, ma nelle **parti regolari** (regioni B) lo stato di tensione di una sezione è quello della sezione di un solido di Saint-Venant con le **stesse CdS**. Altrove procedimenti specifici (es. irrigidimenti del doppio T sotto un macchinario, da norme o calcoli specifici).
**Per l'orale — atteggiamento:** CdS con l'analisi strutturale → $\tens T$ con Saint-Venant → verifica con i criteri.

## 6.9 Verifica e progetto di strutture di travi
- **Verifica:** tutto assegnato; in ogni punto di ogni sezione $\tens T$ compatibile (nella tecnica anche deformabilità e stabilità).
- **Progetto:** dimensionare (forma assegnata a meno di un parametro $a$, es. doppio T con ali $6a\times a$ e anima $20a$).
Traccia tipo: portale $L\times H$ con $q$ sul traverso, sezione a T $\propto a$, $\sigma_{adm}$. *Figura (p. 157):* portale ABCD con carico $q$. [[p. 158]]
**Verifica:** 1) CdS ($N,T,M$); 2) **sezioni critiche** (asta per asta: A, B$_A$; B$_C$, K con $M$ massimo, C$_B$; C$_D$, D; simmetrie); 3) **punti pericolosi** (diagrammi di $\sigma_z$ da $N+M$, di $\tau_{zy}$ Jourawski e $\tau_{zx}$ nell'ala): lembi (max $\sigma$, $\tau=0$), attacco ala–anima (prima e dopo il salto), corda baricentrica (max $\tau$); 4) **verifiche di sicurezza** punto per punto (es. Tresca) in tabella $\sigma_z,\tau_{zx},\tau_{zy},\sigma_{id}$.
**Progetto:** passi 1, 2, 2′, 3, 4; **2′ predimensionamento a flessione** sulla sezione con $|M|_{\max}$: $\sigma'_z=M/W'$, $\sigma''_z=M/W''$, $|\sigma_z|_{\max}\le\sigma_{adm}\Rightarrow a_{\min}$ (es. 14,81 mm), si aumenta (~+10% fino a un valore comodo, es. 17 mm) e si verifica; considerare anche una sezione con $T\ne0$.

## 6.10 Quadro riassuntivo (p. 158)
$\sigma_L$; condizione di resistenza; sicurezza; criterio; Huber; II decomposizione; $\varphi_d$; von Mises vs Beltrami; ideali alla Saint-Venant; travature; verifica/progetto.

## Per l'orale — domande della dispensa (p. 159)
1. Duttili e fragili; tensione limite; verifica di resistenza monoassiale.
2. Coefficiente di sicurezza, tensione ammissibile, dominio di sicurezza (tensioni ammissibili).
3. Perché servono i criteri; tensione ideale e funzione di crisi; riduzione allo spazio delle tensioni principali.
4. Galileo, Tresca (Lüders), Grashof (coassialità), Beltrami: congetture, ipotesi, tensioni ideali, campi di applicazione.
5. La confutazione di Huber e cosa implica.
6. II teorema di decomposizione; decomposizione del legame e dell'energia per isotropi; energia distorcente; dimostrazione di von Mises.
7. Criteri pressure insensitive; Huber a segni invertiti; quando von Mises e quando Beltrami.
8. Mohr–Coulomb: attrito, coesione, dominio nel piano di Mohr, cerchio massimo.
9. Tensioni ideali alla Saint-Venant (Tresca, von Mises, Grashof).
10. Estensione alle travature; schema di verifica e di progetto di un telaio.
