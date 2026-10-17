/**
 * Lezione: è l'unico modo di studiare un concetto (le schede a parte non ci sono più). Il professore costruisce il
 * concetto un passo alla volta. A sinistra il racconto (spiegazioni, derivazioni passaggio per passaggio con la
 * domanda «qual è il passo successivo?», prove sul modello, domande); a destra, fissa, la scena (modello 3D o
 * diagramma) che ogni passo imposta. In fondo, a lezione finita, le domande di richiamo del concetto e quelle d'orale.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import type { DerivLine, Lesson, LessonStep, LessonVisual } from '../../content/types';
import { getLesson, lessonQid, ALL_LESSONS } from '../../content/lezioni';
import { getConcept } from '../../content';
import { oralsOfConcept } from '../../content/orale';
import { addRecall, lessonStep } from '../../learning/actions';
import { useApp } from '../state';
import { RichText, Tex, Inline } from './Tex';
import { RecallCard } from './RecallCard';
import { SourceTag } from './bits';
import { OralList } from '../pages/pages';
import { MODULES } from '../../content/modules';
import { canSpeak, speak, stopSpeaking } from '../speech';

import { VisualHost } from '../../visual/VisualHost';

/** scena da mostrare al passo i: l'ultima impostata da un passo precedente (o la scena iniziale della lezione) */
export function visualAt(lesson: Lesson, i: number): LessonVisual | null {
  for (let k = i; k >= 0; k--) {
    const s = lesson.steps[k];
    if ('visual' in s && s.visual) return s.visual;
  }
  return lesson.visual ?? null;
}

function SpeakButton({ text }: { text: string }) {
  const [on, setOn] = useState(false);
  useEffect(() => () => stopSpeaking(), []);
  if (!canSpeak()) return null;
  return (
    <button
      className="link speak"
      onClick={() => {
        if (on) {
          stopSpeaking();
          setOn(false);
        } else {
          setOn(true);
          speak(text, () => setOn(false));
        }
      }}
      aria-pressed={on}
    >
      {on ? '■ ferma la voce' : '▶ ascolta'}
    </button>
  );
}

/** Derivazione passo passo: prima di ogni riga con domanda lo studente sceglie il passaggio successivo. */
function DerivationView({ lines, done, review, onComplete }: { lines: DerivLine[]; done: boolean; review: boolean; onComplete: () => void }) {
  const [k, setK] = useState(done ? lines.length : 0);
  const [pick, setPick] = useState<number | null>(null);
  const finished = k >= lines.length;
  useEffect(() => {
    if (finished) onComplete();
  }, [finished, onComplete]);
  const next = lines[k];
  const reveal = () => {
    setK((x) => x + 1);
    setPick(null);
  };
  return (
    <div className="deriv">
      {lines.slice(0, k).map((l, i) => (
        <div key={i} className="deriv-line">
          <div className="deriv-tex">
            <Tex tex={l.tex} display />
            {l.eq && <span className="eq-tag">({l.eq})</span>}
          </div>
          <div className="deriv-why">
            {l.aggiunto && <span className="badge-added">passaggio aggiunto</span>}
            <RichText text={l.why} />
          </div>
        </div>
      ))}
      {!finished && next && (
        <div className="deriv-next">
          {next.ask ? (
            <>
              <div className="deriv-q">
                <span className="kicker">Prova tu</span>
                <RichText text={next.ask.q} />
              </div>
              <div className="options">
                {next.ask.options.map((o, i) => (
                  <button key={i} disabled={pick !== null} className={`option ${pick === i ? 'on' : ''} ${pick !== null && i === next.ask!.correct ? 'right' : ''}`} onClick={() => setPick(i)}>
                    <RichText text={o} />
                  </button>
                ))}
              </div>
              {pick !== null && (
                <div className={pick === next.ask.correct ? 'verdict ok' : 'verdict ko'}>
                  <strong>{pick === next.ask.correct ? 'Esatto.' : 'Non proprio.'}</strong> <RichText text={next.ask.why} />
                </div>
              )}
              {pick !== null && (
                <button onClick={reveal}>
                  Scrivi il passaggio
                </button>
              )}
            </>
          ) : (
            <>
              {review && (
                <p className="small muted">
                  <b>Ripasso:</b> pensa a quale sarebbe il passaggio successivo, poi scoprilo.
                </p>
              )}
              <button onClick={reveal}>
                {k === 0 ? 'Cominciamo' : 'Passaggio successivo'}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function Tasks({ tasks }: { tasks: string[] }) {
  const [done, setDone] = useState<boolean[]>(() => tasks.map(() => false));
  return (
    <ol className="tasks">
      {tasks.map((t, i) => (
        <li key={i} className={done[i] ? 'done' : ''}>
          <label>
            <input type="checkbox" checked={done[i]} onChange={() => setDone((d) => d.map((x, j) => (j === i ? !x : x)))} />
            <span>
              <Inline text={t} />
            </span>
          </label>
        </li>
      ))}
    </ol>
  );
}

function speechOf(s: LessonStep): string {
  if (s.kind === 'spiega' || s.kind === 'numeri' || s.kind === 'prova') return `${'title' in s && s.title ? s.title + '. ' : ''}${s.md}${s.kind === 'prova' ? ' ' + s.tasks.join(' ') : ''}`;
  if (s.kind === 'derivazione') return `${s.title}. ${s.md ?? ''} ${s.der.lines.map((l) => l.why).join(' ')}`;
  if (s.kind === 'riassunto') return s.md;
  return '';
}

function StepView({ lesson, step, index, active, wasDone, review, onComplete }: { lesson: Lesson; step: LessonStep; index: number; active: boolean; wasDone: boolean; review: boolean; onComplete: () => void }) {
  const { update } = useApp();
  const c = getConcept(lesson.concept)!;
  const title = 'title' in step ? step.title : step.kind === 'domanda' ? 'Fermati un attimo' : step.kind === 'riassunto' ? 'Riassunto' : '';
  const kicker = { spiega: 'Spiegazione', derivazione: 'Derivazione', prova: 'Prova sul modello', domanda: 'Domanda', numeri: 'Numeri', riassunto: 'Per chiudere' }[step.kind];
  useEffect(() => {
    if (step.kind === 'spiega' || step.kind === 'numeri' || step.kind === 'prova' || step.kind === 'riassunto') onComplete();
  }, [step.kind, onComplete]);
  const text = speechOf(step);
  return (
    <section className={`lesson-step k-${step.kind} ${active ? 'active' : ''}`} id={`passo-${index}`}>
      <div className="lesson-step-head">
        <span className="kicker">
          {index + 1}. {kicker}
        </span>
        {text && <SpeakButton text={text} />}
      </div>
      {title && <h3>{title}</h3>}
      {step.kind === 'spiega' && <RichText text={step.md} className="prof" />}
      {step.kind === 'numeri' && <RichText text={step.md} className="prof" />}
      {step.kind === 'prova' && (
        <>
          <RichText text={step.md} className="prof" />
          <p className="small muted">Usa il modello qui a fianco:</p>
          <Tasks tasks={step.tasks} />
        </>
      )}
      {step.kind === 'derivazione' && (
        <>
          {step.md && <RichText text={step.md} className="prof" />}
          <DerivationView lines={step.der.lines} done={wasDone} review={review} onComplete={onComplete} />
          <div className="small muted deriv-src">
            Fonte: <SourceTag source={step.source} />
          </div>
        </>
      )}
      {step.kind === 'domanda' && (
        <RecallCard
          q={step.q}
          concept={c}
          onAnswer={(correct, grade) => {
            update((s) => addRecall(s, { qid: lessonQid(step.q.id), conceptId: c.id, at: new Date().toISOString(), correct, grade }));
            onComplete();
          }}
        />
      )}
      {step.kind === 'riassunto' && (
        <>
          <RichText text={step.md} className="prof" />
          {step.orale && (
            <div className="orale">
              <h4>All&apos;orale ti possono chiedere</h4>
              <ul>
                {step.orale.map((o, i) => (
                  <li key={i}>
                    <Inline text={o} />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </section>
  );
}

/** chiave del visual: id + parametri della scena, così un passo con una scena diversa rimonta il componente */
export { visualKey } from '../../visual/VisualHost';

export function VisualPanel({ visual }: { visual: LessonVisual | null }) {
  if (!visual) return <div className="lesson-visual-empty small muted">In questo passo non serve il modello.</div>;
  return <VisualHost v={visual} height={440} />;
}

export function LessonPage({ id }: { id: string }) {
  const lesson = getLesson(id);
  const c = getConcept(id);
  const { state, update } = useApp();
  const saved = state.lessons?.[id];
  const startAt = useRef(Math.min(saved?.step ?? 0, (lesson?.steps.length ?? 1) - 1));
  const review = !!saved?.doneAt;
  const [cur, setCur] = useState(startAt.current);
  const [ok, setOk] = useState<Record<number, boolean>>({});
  const visual = useMemo(() => (lesson ? visualAt(lesson, cur) : null), [lesson, cur]);
  useEffect(() => {
    if (lesson && !saved) update((s) => lessonStep(s, id, 0));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);
  if (!lesson || !c) return <div className="page card">Lezione non trovata.</div>;
  const last = lesson.steps.length - 1;
  const advance = () => {
    const nx = Math.min(cur + 1, last);
    setCur(nx);
    update((s) => lessonStep(s, id, nx));
    setTimeout(() => document.getElementById(`passo-${nx}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
  };
  const finish = () => update((s) => lessonStep(s, id, last, true));
  const idx = ALL_LESSONS.findIndex((l) => l.concept === id);
  const nextLesson = ALL_LESSONS[idx + 1];
  const orals = oralsOfConcept(id);
  return (
    <div className={`lesson mod-${c.module}`}>
      <header className="lesson-head">
        <a href={`#/modulo/${c.module}`} className="small">
          ← {MODULES.find((m) => m.id === c.module)?.title ?? 'Modulo'}
        </a>
        <h1>{lesson.title}</h1>
        <div className="lesson-meta small muted">
          Lezione · circa {lesson.minutes} minuti · <SourceTag source={lesson.source} />
          {review && <span className="badge-review">ripasso: le derivazioni le ricavi tu</span>}
        </div>
        <div className="lesson-progress" aria-label={`passo ${cur + 1} di ${lesson.steps.length}`}>
          {lesson.steps.map((s, i) => (
            <button key={s.id} className={`dot ${i < cur ? 'past' : ''} ${i === cur ? 'now' : ''}`} disabled={i > cur} title={`passo ${i + 1}`} onClick={() => document.getElementById(`passo-${i}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })} />
          ))}
        </div>
      </header>
      <div className="lesson-grid">
        <div className="lesson-col">
          {lesson.steps.slice(0, cur + 1).map((s, i) => (
            <StepView key={s.id} lesson={lesson} step={s} index={i} active={i === cur} wasDone={i < startAt.current} review={review} onComplete={() => setOk((o) => (o[i] ? o : { ...o, [i]: true }))} />
          ))}
          <div className="lesson-nav">
            {cur < last ? (
              <button className="primary" disabled={!ok[cur]} onClick={advance}>
                {ok[cur] ? 'Avanti' : lesson.steps[cur].kind === 'domanda' ? 'Rispondi per andare avanti' : 'Completa il passo per andare avanti'}
              </button>
            ) : (
              <div className="lesson-end">
                {!state.lessons?.[id]?.doneAt ? (
                  <button className="primary" onClick={finish}>
                    Ho finito la lezione
                  </button>
                ) : (
                  <p className="verdict ok">
                    <strong>Lezione completata.</strong> Ora fissala: rispondi a memoria alle domande qui sotto, poi prova a spiegarla a voce.
                  </p>
                )}
                {state.lessons?.[id]?.doneAt && (
                  <section className="card lesson-after">
                    <h3>Mettiti alla prova</h3>
                    <p className="small muted">Rispondi senza tornare su: richiamare a memoria è ciò che fissa la lezione. Queste domande torneranno nel ripasso dei prossimi giorni.</p>
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
                <div className="lesson-links">
                  {nextLesson && (
                    <a className="button primary" href={`#/lezione/${nextLesson.concept}`}>
                      Lezione successiva →
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        <aside className="lesson-visual">
          <VisualPanel visual={visual} />
        </aside>
      </div>
    </div>
  );
}
