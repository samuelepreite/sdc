"""Grafo dei concetti (Fase 0). Fonte unica per ANALISI.md e, in Fase 1, per src/content.
Ogni concetto: id, modulo, titolo, paragrafi, riferimenti (Def/Teo/eq), pagine, prerequisiti, derivazioni sviluppate dalla dispensa, flag."""
import json, sys
M = {
 "m1": "Algebra e analisi tensoriale (Cap. 1)",
 "m2": "Analisi della deformazione (Cap. 2)",
 "m3": "Analisi della tensione (Cap. 3)",
 "m4": "Lavoro, legami costitutivi, iperelasticità (Cap. 4, §4.1–4.11)",
 "m5": "Elasticità isotropa e problema elastico (Cap. 4, §4.12–4.16)",
 "m6": "Saint-Venant I: impostazione, sforzo normale, flessione (Cap. 5, §5.1–5.6)",
 "m7": "Saint-Venant II: taglio e torsione (Cap. 5, §5.7–5.8)",
 "m8": "Criteri di resistenza (Cap. 6)",
}
C = [
 # id, modulo, titolo, §, riferimenti, pagine, prerequisiti, derivazioni della dispensa, flag
 ("c1.1","m1","Vettori, tensori del II ordine e componenti","1.1–1.2.3","Def 1.1.1, 1.2.1, 1.2.2","1–3",[],"—",""),
 ("c1.2","m1","Diade, base di Lin, proiettori, composizione","1.2.4–1.2.6","Def 1.2.3, Prop 1.2.4, Def 1.2.5–1.2.7","3–4",["c1.1"],"componenti della diade; base di Lin",""),
 ("c1.3","m1","Trasposto, Sym/Skw, decomposizione, vettore assiale","1.3","Def 1.3.1–1.3.2, Teo 1.3.3–1.3.4","5–6",["c1.2"],"I teorema di decomposizione (esistenza e unicità)",""),
 ("c1.4","m1","Determinante, inverso, ortogonali, formula di Eulero","1.4–1.5","Def 1.4.1–1.4.2, 1.5.1, Prop 1.5.2, Teo 1.5.3, eq (1.1)","6–8",["c1.3"],"proprietà degli ortogonali; rotazioni infinitesime",""),
 ("c1.5","m1","Traccia, prodotto scalare, Sym ⊥ Skw","1.6","Def 1.6.1–1.6.2, Prop 1.6.3","8–9",["c1.3"],"tr W = 0; E·W = 0",""),
 ("c1.6","m1","Tensori del IV ordine: simmetrie e definita positività","1.7","Def 1.7.1–1.7.7","9–11",["c1.5"],"conteggio 81/36/21; Pos+ ⇒ invertibile",""),
 ("c1.7","m1","Gradiente, divergenza, rotore, teorema della divergenza","1.8","Def 1.8.1–1.8.6, Teo 1.8.4","11–13",["c1.5"],"componenti della divergenza tensoriale",""),
 ("c2.1","m2","Corpo, configurazioni, deformazione e spostamento","2.1","Def 2.1.1–2.1.2","15–16",["c1.1"],"—",""),
 ("c2.2","m2","Plausibilità fisica, F e H, deformazioni rigide","2.2–2.3","Def 2.2.1–2.2.4, 2.3.1, Teo 2.3.2, Def 2.3.3, Teo 2.3.4","17–19",["c2.1","c1.4","c1.7"],"identità cinematica fondamentale",""),
 ("c2.3","m2","Studio locale: deformazione omogenea tangente","2.4","eq (2.1)","20",["c2.2"],"Taylor → dx = F dX",""),
 ("c2.4","m2","Parametri di misura e tensore di deformazione finita","2.5","Def 2.5.1–2.5.8, Prop 2.5.2–2.5.9","20–23",["c2.3"],"ε_n, sin γ, ΔS, Θ = det F − 1",""),
 ("c2.5","m2","Piccole deformazioni, piccoli spostamenti, equilibrio referenziale","2.6.1–2.6.2","Def 2.6.1–2.6.2","23–24",["c2.4"],"—",""),
 ("c2.6","m2","Tensore E, rotazione W, parametri linearizzati","2.6.3–2.6.6","Prop 2.6.3, Def 2.6.4, Teo 2.6.5, Prop 2.6.6","24–26",["c2.5","c1.3"],"linearizzazione di D; parametri linearizzati",""),
 ("c2.7","m2","Formula di rappresentazione e compatibilità","2.7–2.8","Teo 2.7.1, eq (2.2)–(2.3), Teo 2.8.1–2.8.2","27–29",["c2.6"],"formula di rappresentazione",""),
 ("c2.8","m2","Dilatazioni e direzioni principali","2.9–2.10","Def 2.9.1, Teo 2.9.2–2.9.3, Prop 2.9.4","29–33",["c2.6"],"spettrale (b); estremo; lettura dagli invarianti",""),
 ("c3.1","m3","Forze, principi di Eulero e Cauchy, componenti speciali","3.1–3.3","Def 3.2.1–3.2.2, Teo 3.3.1","36–40",["c1.2"],"—",""),
 ("c3.2","m3","Assiomi di Eulero, ECS e lemma di Cauchy","3.4–3.5","Def 3.4.1, Teo 3.4.2, Teo 3.5.1","40–42",["c3.1"],"lemma di Cauchy",""),
 ("c3.3","m3","Teorema di Cauchy–Poisson e tetraedro","3.6–3.7.1","Teo 3.6.1","42–45",["c3.2"],"tetraedro di Cauchy",""),
 ("c3.4","m3","Equazioni indefinite di equilibrio e simmetria di T","3.7.2–3.8","Teo 3.7.1","45–48",["c3.3","c1.7"],"div T + b = 0; T23 = T32",""),
 ("c3.5","m3","Rappresentazione ingegneristica; σ_n, τ_nν, τ_n","3.9–3.10","—","48–49",["c3.4"],"σ_n come forma quadratica",""),
 ("c3.6","m3","Tensioni principali e classificazione","3.11–3.12","Def 3.11.1","49–52",["c3.5","c2.8"],"lettura dagli invarianti",""),
 ("c3.7","m3","Tensioni estreme ed esercizio svolto","3.13–3.14","Prop 3.13.1–3.13.2","53–56",["c3.6"],"s3 ≤ σ_m ≤ s1 (euristica); τ_max solo enunciata",""),
 ("c3.8","m3","Cerchio di Mohr: equazione, costruzione, impiego","3.15","Prop 3.15.1","56–60",["c3.5"],"equazione del cerchio; correttezza della costruzione",""),
 ("c3.9","m3","Mohr: esempi, arbelo, esempio numerico","3.16–3.17","Teo 3.17.1","60–63",["c3.8","c3.7"],"—",""),
 ("c4.0","m4","Linee isostatiche","4.1","—","66",["c3.6"],"—","facoltativo: la dispensa dice «non richiesto all'orale»"),
 ("c4.1","m4","Lemma fondamentale e teorema dei lavori virtuali","4.2–4.3","Teo 4.2.1, Def 4.3.1–4.3.3, Teo 4.3.4","67–69",["c3.4","c2.6","c1.7"],"lemma; TLV",""),
 ("c4.2","m4","Legami costitutivi e classificazione dei comportamenti","4.4","Def 4.4.1–4.4.5","69–73",["c3.6"],"—",""),
 ("c4.3","m4","Prove su acciaio e calcestruzzo","4.5–4.7","—","73–77",["c4.2","c3.9"],"—",""),
 ("c4.4","m4","Elasticità lineare e simmetrie minori","4.8","Def 4.8.1","77–78",["c4.2","c1.6","c2.6"],"81 → 36",""),
 ("c4.5","m4","Iperelasticità e teorema sull'energia specifica","4.9","Def 4.9.1, Teo 4.9.2","79–82",["c4.4","c4.1"],"lavoro indipendente dal cammino; a ⇒ b ⇒ c",""),
 ("c4.6","m4","Simmetrie materiali e notazione di Voigt","4.10–4.11","Def 4.10.1","82–86",["c4.5","c1.4"],"—",""),
 ("c5.1","m5","Lamé, isotropia ⇒ iperelasticità, legame inverso, coassialità","4.12","Teo 4.12.1–4.12.2, Prop 4.12.3, Teo 4.12.4","86–88",["c4.6","c3.6"],"isotropo ⇒ A = Aᵀ; legame inverso; coassialità",""),
 ("c5.2","m5","Moduli tecnici","4.13","—","88–90",["c5.1"],"E, ν da monoassiale; G da scorrimento; E = 2G(1+ν)",""),
 ("c5.3","m5","Energia per isotropi e restrizioni di plausibilità","4.14–4.15","Prop 4.14.1","91–94",["c5.2","c4.5"],"espressioni di φ; Sylvester",""),
 ("c5.4","m5","Problema elastico: posizione e buona posizione","4.16.1–4.16.3","Def 4.16.1","94–96",["c5.1","c3.4","c2.7"],"—",""),
 ("c5.5","m5","Sovrapposizione e non linearità dell'energia","4.16.4–4.16.5","Teo 4.16.2–4.16.3","96–97",["c5.4","c5.3"],"termine di accoppiamento",""),
 ("c6.1","m6","Teorema di unicità di Kirchhoff","5.1","Teo 5.1.1","99–100",["c5.5","c4.1"],"dimostrazione per assurdo",""),
 ("c6.2","m6","Problema di Saint-Venant: formulazione, ipotesi, semi-inverso","5.2.1–5.2.4","Def 5.2.1","100–104",["c6.1","c5.4"],"T_zz = C z + D",""),
 ("c6.3","m6","Equilibrio globale, CdS, problema indebolito, postulato","5.2.5–5.2.8","eq (5.1), Def 5.2.2, Teo 5.2.3–5.2.4","104–108",["c6.2"],"leggi di variazione delle CdS",""),
 ("c6.4","m6","Sforzo normale","5.3–5.4","Def 5.4.1, Teo 5.4.2","109–113",["c6.3","c5.2"],"soluzione completa; Clapeyron",""),
 ("c6.5","m6","Assi principali centrali ed ellisse d'inerzia","5.5.1–5.5.2","Def 5.5.2","113–115",["c6.3"],"—",""),
 ("c6.6","m6","Flessione semplice retta (Navier)","5.5.3–5.5.4","—","115–120",["c6.4","c6.5"],"Navier; spostamenti; anticlastica",""),
 ("c6.7","m6","Flessione deviata e teoremi della flessione","5.5.5","Teo 5.5.3–5.5.4","120–122",["c6.6"],"I e II teorema",""),
 ("c6.8","m6","Sforzo normale eccentrico, nocciolo, parzializzazione","5.6","Def 5.6.1–5.6.2","122–125",["c6.7"],"trinomia; regola delle 3u","facoltativo: la dispensa dice «non trattato a lezione»"),
 ("c7.1","m7","Flessione composta: formula di Jourawski","5.7.1–5.7.2","Def 5.7.1, Teo 5.7.2, Prop 5.7.3","125–129",["c6.6"],"formula di Jourawski",""),
 ("c7.2","m7","τ_zx e regola delle tangenti","5.7.3–5.7.4","—","129–131",["c7.1","c3.4"],"linearità di τ_zx sulla corda",""),
 ("c7.3","m7","Torsione: congettura di Clebsch e problema di Neumann","5.8.1–5.8.2","Def 5.8.1–5.8.2, Teo 5.8.3","131–133",["c6.3","c5.2"],"equazioni dalla congettura",""),
 ("c7.4","m7","Funzione di Prandtl e fattore di torsione","5.8.3–5.8.4","Def 5.8.4, Teo 5.8.5, Def 5.8.6","133–135",["c7.3","c1.7"],"∇²F = 2; M_z = Gγ∫(−2F)",""),
 ("c7.5","m7","Sezioni esatte, analogia idrodinamica, chiusa vs aperta","5.8.5–5.8.8","—","135–138",["c7.4"],"sezione circolare; confronto chiusa/aperta",""),
 ("c7.6","m7","Sezioni sottili aperte e teoria di Bredt","5.8.9–5.8.10","Teo 5.8.7","139–141",["c7.5"],"formula di Bredt",""),
 ("c8.1","m8","Verifica di resistenza e di sicurezza monoassiale","6.1–6.2","Def 6.2.1","144–146",["c4.3"],"—",""),
 ("c8.2","m8","Criteri di resistenza e tensione ideale","6.3","Def 6.3.1","147–148",["c8.1","c3.7"],"—",""),
 ("c8.3","m8","Criteri di Galileo, Tresca, Grashof","6.4.1–6.4.3","—","148–150",["c8.2","c3.9","c5.2"],"tensioni ideali",""),
 ("c8.4","m8","Beltrami e confutazione di Huber","6.4.4–6.4.5","—","150–151",["c8.3","c5.3"],"σ_id di Beltrami; h_L",""),
 ("c8.5","m8","Secondo teorema di decomposizione e von Mises","6.5","Teo 6.5.1, Def 6.5.2, Teo 6.5.3","151–154",["c8.4"],"φ_d; σ_id di von Mises",""),
 ("c8.6","m8","Criterio di Mohr–Coulomb","6.6","—","154–155",["c8.2","c3.9"],"verifica con il cerchio massimo",""),
 ("c8.7","m8","Tensioni ideali alla Saint-Venant, travature, verifica e progetto","6.7–6.9","—","155–158",["c8.5","c8.3","c7.1","c6.7"],"σ_id alla Saint-Venant",""),
]
ids={c[0] for c in C}
assert len(ids)==len(C), "id duplicati"
for c in C:
    for p in c[6]: assert p in ids, (c[0],p)
# controllo cicli e ordine (prerequisiti sempre prima nell'ordine della dispensa)
order={c[0]:i for i,c in enumerate(C)}
for c in C:
    for p in c[6]: assert order[p]<order[c[0]], f"{p} non precede {c[0]}"
if __name__=="__main__":
    json.dump([dict(id=c[0],modulo=c[1],titolo=c[2],par=c[3],rif=c[4],pagine=c[5],prereq=c[6],derivazioni=c[7],flag=c[8]) for c in C],
              open(sys.argv[1],"w"),ensure_ascii=False,indent=1)
    print(len(C),"concetti,",sum(1 for c in C if c[8]),"facoltativi; grafo aciclico e ordinato")
