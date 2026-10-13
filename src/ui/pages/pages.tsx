import { useMemo, useRef, useState } from 'react';
import { ALL_CONCEPTS, conceptIdsByModule, conceptsOf, getConcept } from '../../content';
import { MODULES } from '../../content/modules';
import { ALL_LESSONS, getLesson } from '../../content/lezioni';
import { ALL_ORALI, oralsOfConcept } from '../../content/orale';
import type { Concept } from '../../content/types';
import { masteryByConcept, MASTERY_OK } from '../../learning/mastery';
import { dueCards } from '../../learning/srs';
import { isStudied, planSession, studyOrder, type SessionPlan } from '../../learning/session';
import { defaultState, exportJSON, importJSON } from '../../storage/store';
import { addRecall } from '../../learning/actions';
import { go, useApp } from '../state';
import { Collapsible, Progress } from '../components/bits';
import { RecallCard } from '../components/RecallCard';
import { Icon } from '../components/Icon';
import { ConceptFull, GuidedConcept } from '../components/Guided';
import { Inline } from '../components/Tex';
import { OralRunner } from './orale';

// ------------------------------------------------------------------ Oggi
const greeting = (d: Date) => (d.getHours() < 5 ? 'Buonanotte' : d.getHours() < 13 ? 'Buongiorno' : d.getHours() < 18 ? 'Buon pomeriggio' : 'Buonasera');

function useNextSession() {
  const { state } = useApp();
  return useMemo(() => {
    const plan = planSession(state, ALL_CONCEPTS, ALL_ORALI, { seed: 1 });
    const minutes = plan.recall.length * 1.5 + (plan.oral ? 8 : 0) + (plan.lesson ? (getLesson(plan.lesson.id)?.minutes ?? 15) : 0);
    return { plan, minutes: Math.round(minutes) };
  }, [state]);
}

export function Home() {
  const { state } = useApp();
  const now = new Date();
  const { plan, minutes } = useNextSession();
  const due = dueCards(state, now).length;
  const parts: string[] = [];
  if (plan.recall.length) parts.push(`${plan.recall.length} ${plan.recall.length === 1 ? 'domanda' : 'domande'} a memoria`);
  if (plan.oral) parts.push('una domanda da esporre a voce');
  if (plan.lesson) parts.push('una lezione nuova');
  const started = ALL_LESSONS.find((l) => state.lessons?.[l.concept] && !state.lessons[l.concept].doneAt);
  return (
    <div className="page home">
      <section className="today">
        <p className="greet">{greeting(now)}.</p>
        <h1 className="today-title">{parts.length ? `Oggi: ${parts.join(', ').replace(/, ([^,]*)$/, ' e $1')}.` : 'Tutto in pari: nessun ripasso in scadenza.'}</h1>
        {plan.lesson && (
          <p className="today-next">
            Lezione nuova: <a href={`#/lezione/${plan.lesson.id}`}>{getLesson(plan.lesson.id)?.title ?? plan.lesson.title}</a>
            <span className={`mod-tag mod-${plan.lesson.module}`}>{plan.lesson.module.toUpperCase()}</span>
          </p>
        )}
        <ol className="session-steps" aria-label="Come è fatta la sessione">
          <li className={plan.recall.length ? '' : 'off'}>
            <b>Richiamo</b>
            <span>{plan.recall.length ? `${plan.recall.length} domande a memoria${due ? `, ${due} in scadenza` : ''}` : 'nessuna domanda'}</span>
          </li>
          <li className={plan.oral ? '' : 'off'}>
            <b>Orale</b>
            <span>{plan.oral ? 'esponi a voce, poi confronta con la scaletta' : 'dopo la prima lezione'}</span>
          </li>
          <li className={plan.lesson ? '' : 'off'}>
            <b>Lezione</b>
            <span>{plan.lesson ? `circa ${getLesson(plan.lesson.id)?.minutes ?? 15} minuti con il professore` : 'nessuna lezione nuova'}</span>
          </li>
        </ol>
        <div className="cta-row">
          <button className="primary big" onClick={() => go('sessione')}>
            <Icon name="studia" />
            Inizia la sessione di oggi
          </button>
          {minutes > 0 && (
            <span className="muted">
              <Icon name="tempo" size={16} /> circa {minutes} minuti
            </span>
          )}
        </div>
        {started && (
          <p className="small">
            Hai una lezione a metà: <a href={`#/lezione/${started.concept}`}>{started.title}</a> (passo {state.lessons[started.concept].step + 1} di {started.steps.length}).
          </p>
        )}
      </section>
      <section className="path-section">
        <div className="section-head">
          <h2>La dispensa, modulo per modulo</h2>
          <a href="#/moduli" className="small">
            Tutti i moduli
          </a>
        </div>
        <Pipeline />
      </section>
      <div className="home-grid">
        <WeakCard />
        <ExamCard />
      </div>
    </div>
  );
}

/** I moduli come un tubo che si riempie: quota di concetti con la lezione finita. */
export function Pipeline() {
  const { state } = useApp();
  const byModule = conceptIdsByModule();
  const current = MODULES.find((m) => (byModule[m.id] ?? []).some((c) => !isStudied(state, c)))?.id;
  return (
    <ol className="pipeline">
      {MODULES.map((m, i) => {
        const cs = byModule[m.id] ?? [];
        const done = cs.filter((c) => isStudied(state, c)).length;
        const fill = cs.length ? done / cs.length : 0;
        const st = !cs.length ? 'soon' : m.id === current ? 'current' : fill >= 1 ? 'done' : 'open';
        return (
          <li key={m.id} className={`pipe-node mod-${m.id} st-${st}`}>
            <a href={`#/modulo/${m.id}`} className="pipe-link">
              <span className="pipe-dot">{st === 'done' ? <Icon name="ok" size={18} /> : i + 1}</span>
              <span className="pipe-text">
                <b>{m.title}</b>
                <span className="small muted">{st === 'soon' ? `in preparazione · ${m.source}` : `${done} di ${cs.length} lezioni · ${m.source}`}</span>
              </span>
            </a>
            {i < MODULES.length - 1 && (
              <span className="pipe-seg" aria-hidden="true">
                <span className={`pipe-fluid ${fill > 0 && fill < 1 ? 'flowing' : ''}`} style={{ ['--fill' as string]: fill }} />
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

function WeakCard() {
  const { state } = useApp();
  const mastery = masteryByConcept(state, new Date());
  const weak = ALL_CONCEPTS.filter((c) => isStudied(state, c.id))
    .sort((a, b) => (mastery[a.id] ?? 0) - (mastery[b.id] ?? 0))
    .slice(0, 4);
  return (
    <section className="card soft">
      <h2>Da rinforzare</h2>
      {weak.length ? (
        <ul className="weak-list">
          {weak.map((c) => (
            <li key={c.id} className={`mod-${c.module}`}>
              <a href={`#/concetto/${c.id}`}>{c.title}</a>
              <Ring value={mastery[c.id] ?? 0} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="muted">Qui compariranno i concetti studiati con la padronanza più bassa. Si comincia dalla prima lezione.</p>
      )}
      <a href="#/progressi" className="small">
        Vedi tutti i progressi
      </a>
    </section>
  );
}

function ExamCard() {
  const { state } = useApp();
  const d = state.settings.examDate;
  const days = d ? Math.ceil((Date.parse(d) - Date.now()) / 86400000) : null;
  return (
    <section className="card soft exam-card">
      <h2>Orale</h2>
      {days !== null && days >= 0 ? (
        <>
          <p className="countdown">
            <span className="big-num">{days}</span> {days === 1 ? 'giorno' : 'giorni'}
          </p>
          <p className="small muted">
            al {new Date(d!).toLocaleDateString('it-IT', { day: 'numeric', month: 'long' })}, con {state.settings.hoursPerWeek} ore di studio a settimana.
          </p>
          <a href="#/piano" className="small">
            Apri il piano settimanale
          </a>
        </>
      ) : (
        <>
          <p className="muted">Indica la data dell&apos;orale e le ore a settimana: il piano distribuisce i moduli fino a quel giorno.</p>
          <a href="#/impostazioni" className="small">
            Imposta la data
          </a>
        </>
      )}
    </section>
  );
}

/** Anello di padronanza 0–1. */
export function Ring({ value, size = 34 }: { value: number; size?: number }) {
  const r = 14;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value));
  return (
    <svg className="ring" width={size} height={size} viewBox="0 0 34 34" role="img" aria-label={`padronanza ${Math.round(v * 100)} %`}>
      <circle cx="17" cy="17" r={r} className="ring-track" />
      {v > 0.005 && <circle cx="17" cy="17" r={r} className="ring-fill" strokeDasharray={`${v * c} ${c}`} transform="rotate(-90 17 17)" />}
      <text x="17" y="21" textAnchor="middle" className="ring-text">
        {Math.round(v * 100)}
      </text>
    </svg>
  );
}

export function ModuliPage() {
  return (
    <div className="page">
      <h1>Moduli</h1>
      <p className="lead muted">Otto moduli nell&apos;ordine della dispensa. Nessun modulo è bloccato: all&apos;orale si porta tutto, l&apos;ordine consigliato lo danno i prerequisiti.</p>
      <Pipeline />
    </div>
  );
}

export function Altro() {
  const items = [
    { to: 'piano', icon: 'piano', t: 'Piano di studio', d: "Ore per settimana fino all'orale" },
    { to: 'fonti', icon: 'fonti', t: 'Fonti e verifiche', d: 'Come sono controllati formule e numeri; note sulla dispensa' },
    { to: 'impostazioni', icon: 'impostazioni', t: 'Impostazioni', d: "Data dell'orale, ore, salvataggio" },
  ];
  return (
    <div className="page">
      <h1>Altro</h1>
      <ul className="menu-list">
        {items.map((i) => (
          <li key={i.to}>
            <a href={`#/${i.to}`}>
              <Icon name={i.icon} size={22} />
              <span>
                <b>{i.t}</b>
                <span className="small muted">{i.d}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ------------------------------------------------------------------ Sessione
export function Session() {
  const { state, update } = useApp();
  const planRef = useRef<SessionPlan | null>(null);
  if (!planRef.current) planRef.current = planSession(state, ALL_CONCEPTS, ALL_ORALI);
  const plan = planRef.current;
  const steps = [
    ...plan.recall.map((r) => ({ kind: 'recall' as const, r })),
    ...(plan.oral ? [{ kind: 'oral' as const, o: plan.oral }] : []),
    ...(plan.lesson ? [{ kind: 'lesson' as const, c: plan.lesson }] : []),
  ];
  const [i, setI] = useState(0);
  const [ready, setReady] = useState(false);
  const cur = steps[i];
  const next = () => {
    setReady(false);
    setI(i + 1);
    window.scrollTo?.(0, 0);
  };
  if (!cur)
    return (
      <div className="page">
        <section className="card">
          <h2>Sessione completata</h2>
          <p>Le domande sbagliate torneranno domani; la prossima sessione propone il concetto successivo.</p>
          <button className="primary" onClick={() => go('')}>
            Torna a Oggi
          </button>
        </section>
      </div>
    );
  return (
    <div className="page">
      <div className="session-bar">
        <span>
          Passo {i + 1} di {steps.length}: {cur.kind === 'recall' ? 'richiamo a memoria' : cur.kind === 'oral' ? 'esposizione orale' : 'lezione nuova'}
        </span>
        <Progress value={i / steps.length} />
      </div>
      {cur.kind === 'recall' && (
        <RecallCard
          key={cur.r.q.id}
          q={cur.r.q}
          concept={cur.r.concept}
          onAnswer={(correct, grade) => {
            update((s) => addRecall(s, { qid: cur.r.q.id, conceptId: cur.r.concept.id, at: new Date().toISOString(), correct, grade }));
            setReady(true);
          }}
        />
      )}
      {cur.kind === 'oral' && <OralRunner key={cur.o.id} o={cur.o} onDone={() => setReady(true)} />}
      {cur.kind === 'lesson' && (
        <section className={`card lesson-cta mod-${cur.c.module}`}>
          <div>
            <h3>{getLesson(cur.c.id)?.title ?? cur.c.title}</h3>
            <p className="small muted">Lezione guidata di circa {getLesson(cur.c.id)?.minutes ?? 15} minuti: il professore costruisce il concetto con te.</p>
          </div>
          <a className="button primary" href={`#/lezione/${cur.c.id}`}>
            Inizia la lezione
          </a>
        </section>
      )}
      {cur.kind !== 'lesson' && (
        <button className="primary next" disabled={!ready} onClick={next}>
          Avanti
        </button>
      )}
    </div>
  );
}

// ------------------------------------------------------------------ Modulo e scheda
export function ModulePage({ id }: { id: string }) {
  const { state } = useApp();
  const m = MODULES.find((x) => x.id === id);
  const mastery = masteryByConcept(state);
  const cs = studyOrder(conceptsOf(id));
  if (!m) return <div className="page card">Modulo non trovato.</div>;
  const avg = cs.length ? cs.reduce((s, c) => s + (mastery[c.id] ?? 0), 0) / cs.length : 0;
  const orals = ALL_ORALI.filter((o) => o.concepts.some((c) => cs.some((x) => x.id === c)));
  return (
    <div className={`page module-page mod-${id}`}>
      <header className="mod-head">
        <span className="mod-num" aria-hidden="true">
          {id.slice(1)}
        </span>
        <div>
          <p className="small muted">
            Modulo {id.slice(1)} · {m.source}
          </p>
          <h1>{m.title}</h1>
          {cs.length > 0 && (
            <div className="mod-stats">
              <span>
                <b>{cs.length}</b> concetti
              </span>
              <span>
                <b>{orals.length}</b> domande d&apos;orale
              </span>
              <span>
                <b>{Math.round(avg * 100)} %</b> padronanza media
              </span>
            </div>
          )}
        </div>
      </header>
      {cs.length === 0 && <p className="callout">Questo modulo è in preparazione: arriva una sessione di lavoro alla volta, sempre un modulo avanti rispetto a dove studi.</p>}
      {cs.length > 0 && (
        <section className="card">
          <h2>Lezioni, nell&apos;ordine della dispensa</h2>
          <ol className="concept-path">
            {cs.map((c) => {
              const l = state.lessons?.[c.id];
              const lesson = getLesson(c.id);
              return (
                <li key={c.id} className={isStudied(state, c.id) ? 'seen' : ''}>
                  <a href={`#/concetto/${c.id}`}>
                    <span className="cp-title">{c.title}</span>
                    {l?.doneAt ? <span className="tag tag-ok">lezione fatta</span> : l ? <span className="tag">passo {l.step + 1} di {lesson?.steps.length}</span> : lesson ? <span className="tag">{lesson.minutes} min</span> : null}
                    {c.facoltativo && <span className="tag tag-ded">facoltativo</span>}
                  </a>
                  <Ring value={mastery[c.id] ?? 0} size={30} />
                </li>
              );
            })}
          </ol>
        </section>
      )}
      {orals.length > 0 && (
        <section className="card">
          <h2>
            <Icon name="orale" /> Domande d&apos;orale del modulo
          </h2>
          <OralList list={orals} />
        </section>
      )}
    </div>
  );
}

export function OralList({ list }: { list: typeof ALL_ORALI }) {
  const { state } = useApp();
  return (
    <ul className="ex-list oral-list">
      {list.map((o) => {
        const logs = (state.oral ?? []).filter((x) => x.qid === o.id);
        const last = logs.at(-1);
        return (
          <li key={o.id}>
            <a href={`#/orale/${o.id}`}>
              <span className={`ex-id kind-${o.kind}`}>{o.kind === 'espositiva' ? 'espositiva' : o.kind === 'collegamento' ? 'collegamento' : 'trabocchetto'}</span>
              <span className="ex-title">
                <Inline text={o.q} />
              </span>
              <span className="ex-meta small muted">
                {o.source.kind === 'dispensa' ? 'dalla dispensa' : 'dedotta'}
                {last ? ` · ultima volta ${last.points.length}/${last.total} punti` : ''}
              </span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}

export function ConceptPage({ id }: { id: string }) {
  const { state, update } = useApp();
  const c = getConcept(id);
  const [mode, setMode] = useState<'pezzi' | 'intera'>(c && isStudied(state, c.id) ? 'intera' : 'pezzi');
  if (!c) return <div className="page card">Concetto non trovato.</div>;
  const lesson = getLesson(id);
  const ls = state.lessons?.[id];
  const orals = oralsOfConcept(id);
  return (
    <div className={`page mod-${c.module}`}>
      {c.facoltativo && <p className="callout">Facoltativo: {c.facoltativo}.</p>}
      {lesson && (
        <div className="lesson-cta">
          <div>
            <h3>Lezione guidata: {lesson.title}</h3>
            <p className="small muted">
              Il professore costruisce il concetto con te, passo passo. Circa {lesson.minutes} minuti.
              {ls?.doneAt ? ' Completata: rifalla come ripasso, ricavando tu le formule.' : ls ? ` Sei al passo ${ls.step + 1} di ${lesson.steps.length}.` : ''}
            </p>
          </div>
          <a className="button primary" href={`#/lezione/${id}`}>
            {ls?.doneAt ? 'Ripassa' : ls ? 'Riprendi' : 'Inizia la lezione'}
          </a>
        </div>
      )}
      <div className="seg small-seg" role="group" aria-label="Modo di lettura">
        <button className={mode === 'pezzi' ? 'on' : ''} onClick={() => setMode('pezzi')}>
          Scheda a pezzi
        </button>
        <button className={mode === 'intera' ? 'on' : ''} onClick={() => setMode('intera')}>
          Scheda intera
        </button>
      </div>
      {mode === 'pezzi' ? <GuidedConcept key={c.id} c={c} onFinish={() => setMode('intera')} /> : <ConceptFull c={c} />}
      {mode === 'intera' && (
        <section className="card">
          <h3>Mettiti alla prova</h3>
          {c.recall.map((q) => (
            <RecallCard key={q.id} q={q} concept={c} onAnswer={(correct, grade) => update((s) => addRecall(s, { qid: q.id, conceptId: c.id, at: new Date().toISOString(), correct, grade }))} />
          ))}
          {orals.length > 0 && (
            <>
              <h3>All&apos;orale ti possono chiedere</h3>
              <OralList list={orals} />
            </>
          )}
        </section>
      )}
    </div>
  );
}

// ------------------------------------------------------------------ Impostazioni
export function Settings() {
  const { state, update, replace, saveOk, sync } = useApp();
  const [msg, setMsg] = useState('');
  const [exported, setExported] = useState<string | null>(null);
  const [askReset, setAskReset] = useState(false);
  const [pasted, setPasted] = useState('');
  const s = state.settings;
  const download = async () => {
    const json = exportJSON(state);
    const filename = `sdc-progressi-${new Date().toISOString().slice(0, 10)}.json`;
    const claude = (globalThis as unknown as { claude?: { use(n: string): Promise<unknown> } }).claude;
    const dl = claude?.use ? ((await claude.use('downloads').catch(() => null)) as { save(r: { filename: string; data: string }): Promise<{ status: string }> } | null) : null;
    if (dl) {
      try {
        const r = await dl.save({ filename, data: json });
        setMsg(r.status === 'saved' ? 'File salvato.' : 'File inviato.');
        return;
      } catch {
        setExported(json);
        return;
      }
    }
    setExported(json);
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(exported ?? '');
      setMsg('Copiato negli appunti.');
    } catch {
      setMsg('Copia non consentita qui: seleziona il testo e copialo a mano.');
    }
  };
  const importText = (text: string) => {
    try {
      replace(importJSON(text));
      setMsg('Progressi importati.');
      setPasted('');
    } catch (e) {
      setMsg('Import non riuscito: ' + (e as Error).message);
    }
  };
  return (
    <div className="page">
      <h1>Impostazioni</h1>
      <section className="card form">
        <label>
          Data dell&apos;orale
          <input id="set-exam" type="date" value={s.examDate ?? ''} onChange={(e) => update((st) => ({ ...st, settings: { ...st.settings, examDate: e.target.value || undefined } }))} />
        </label>
        <label>
          Ore di studio a settimana
          <input id="set-hours" type="number" min={1} max={60} value={s.hoursPerWeek} onChange={(e) => update((st) => ({ ...st, settings: { ...st.settings, hoursPerWeek: Math.max(1, Math.min(60, Number(e.target.value) || 1)) } }))} />
        </label>
        <label className="check">
          <input id="set-opt" type="checkbox" checked={!!s.facoltativi} onChange={(e) => update((st) => ({ ...st, settings: { ...st.settings, facoltativi: e.target.checked } }))} /> Includi gli argomenti facoltativi (linee isostatiche, sforzo normale eccentrico: la dispensa li dice non richiesti o non trattati a lezione)
        </label>
      </section>
      <section className="card">
        <h2>Progressi</h2>
        <p className={`sync-line sync-${sync.status}`}>
          <SyncText status={sync.status} detail={sync.detail} />
          {sync.status !== 'locale' && (
            <button className="link" onClick={sync.now}>
              sincronizza ora
            </button>
          )}
        </p>
        <p className="small muted">
          {sync.status === 'locale'
            ? `Fuori da claude.ai i progressi restano solo in questo browser${saveOk ? '' : ' (salvataggio non disponibile: esporta per non perderli)'}.`
            : "Ogni modifica viene salvata nel browser e, dopo pochi secondi, nello spazio privato del tuo account: la ritrovi su ogni dispositivo. L'export resta utile come copia di riserva."}
        </p>
        <div className="row">
          <button onClick={download}>Esporta JSON</button>
          <label className="button">
            Importa JSON
            <input type="file" accept="application/json" hidden onChange={async (e) => e.target.files?.[0] && importText(await e.target.files[0].text())} />
          </label>
          {!askReset ? (
            <button className="danger" onClick={() => setAskReset(true)}>
              Azzera
            </button>
          ) : (
            <span className="row">
              <span>Cancellare tutti i progressi?</span>
              <button
                className="danger"
                onClick={() => {
                  const now = new Date().toISOString();
                  replace({ ...defaultState(), meta: { resetAt: now, settingsAt: now } });
                  setAskReset(false);
                  setMsg('Progressi azzerati.');
                }}
              >
                Sì, cancella
              </button>
              <button onClick={() => setAskReset(false)}>Annulla</button>
            </span>
          )}
        </div>
        {exported && (
          <div className="export-box">
            <p className="small muted">Copia questo testo e salvalo come .json.</p>
            <textarea id="export-json" readOnly rows={5} value={exported} onFocus={(e) => e.currentTarget.select()} />
            <button onClick={copy}>Copia</button>
          </div>
        )}
        <Collapsible title="Importa incollando il testo">
          <textarea id="import-json" rows={4} value={pasted} onChange={(e) => setPasted(e.target.value)} placeholder="Incolla qui il JSON esportato" />
          <button disabled={!pasted.trim()} onClick={() => importText(pasted)}>
            Importa
          </button>
        </Collapsible>
        {msg && <p>{msg}</p>}
        <p className="small muted">
          {Object.values(state.lessons ?? {}).filter((l) => l.doneAt).length} lezioni finite · {state.recall.length} richiami · {(state.oral ?? []).length} esposizioni orali
        </p>
      </section>
    </div>
  );
}

export function SyncText({ status, detail }: { status: string; detail?: string }) {
  const t: Record<string, string> = {
    locale: 'Progressi salvati in questo browser',
    collegamento: 'Collegamento al tuo account…',
    sincronizzato: 'Progressi salvati sul tuo account',
    errore: `Sincronizzazione non riuscita${detail ? `: ${detail}` : ''}. I progressi restano salvati nel browser.`,
  };
  return <span>{t[status] ?? status}</span>;
}

// ------------------------------------------------------------------ Fonti
const NF = [
  ['NF-01', 'A', '§1.8.4, p. 13: il rimando «§3.4» per il vettore assiale va letto §1.3.4.'],
  ['NF-02', 'B', '§2.10, p. 32: con una dilatazione principale nulla la sfera diventa un ellissoide con un semiasse invariato; è lo spostamento a stare nel piano. Da chiedere al docente.'],
  ['NF-04', 'D', 'Teo 2.8.1 «di Kirchhoff» (compatibilità) e Teo 5.1.1 (problema elastico): nell\'app hanno nomi distinti.'],
  ['NF-07', 'D', 'Linee isostatiche (§4.1) e sforzo normale eccentrico (§5.6): facoltativi, come dice la dispensa. Da confermare con il docente.'],
  ['NF-08', 'D', 'Cap. 6: ν indica sia il coefficiente di sicurezza sia quello di Poisson.'],
  ['NF-11', 'D', 'Risultati che la dispensa enuncia senza dimostrazione (es. Lamé, τmax con Lagrange, arbelo): nell\'app niente derivazione, spiegazione a parole.'],
  ['NF-12', 'C', 'Figure della dispensa: quelle del Cap. 1 (pp. 4, 8, 12) sono controllate sul PDF; le altre si controllano modulo per modulo.'],
];

export function Fonti() {
  const nDer = ALL_LESSONS.flatMap((l) => l.steps.filter((s) => s.kind === 'derivazione')).length;
  return (
    <div className="page">
      <h1>Fonti e verifiche</h1>
      <section className="card">
        <p>
          Unica fonte di verità: la <b>dispensa del corso</b> (6 capitoli, 159 pagine). Notazione, segni e ordine degli argomenti sono quelli della dispensa; ogni contenuto cita capitolo, paragrafo, Def/Teo/eq. e pagina. Ciò che non viene dalla dispensa è marcato come <span className="tag tag-ded">deduzione</span> o <span className="tag tag-ext">fonte esterna</span>, e ogni passaggio non scritto nella dispensa come <span className="badge-added">passaggio aggiunto</span>.
        </p>
        <ul>
          <li>
            {nDer} derivazioni nelle lezioni: ogni riga con un valore è ricalcolata su 25 campioni casuali e deve dare lo stesso numero della precedente (un segno sbagliato o un fattore 2 perso fanno fallire i test).
          </li>
          <li>Il motore che disegna i modelli è verificato per strade indipendenti: proprietà dei tensori su campioni casuali, conteggio delle componenti del IV ordine per classi di equivalenza, teorema della divergenza con due integrazioni numeriche diverse.</li>
          <li>Tutte le formule sono compilate da KaTeX nei test, con le macro della notazione della dispensa.</li>
          <li>{ALL_ORALI.filter((o) => o.source.kind === 'dispensa').length} domande d&apos;orale vengono dai riquadri «Per l&apos;orale» della dispensa; {ALL_ORALI.filter((o) => o.source.kind !== 'dispensa').length} sono dedotte e marcate come tali.</li>
        </ul>
      </section>
      <section className="card">
        <h2>Note sulla dispensa</h2>
        <p className="small muted">Classi: A refuso certo · B incongruenza · C lettura dubbia · D scelta didattica. L&apos;elenco completo è in NOTE_FONTI.md.</p>
        <table className="readout">
          <tbody>
            {NF.map(([id, cl, t]) => (
              <tr key={id}>
                <td>
                  <b>{id}</b>
                </td>
                <td>{cl}</td>
                <td>{t}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export const studiedConcepts = (state: ReturnType<typeof useApp>['state']): Concept[] => ALL_CONCEPTS.filter((c) => isStudied(state, c.id));
export { MASTERY_OK };
