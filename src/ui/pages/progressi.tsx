/**
 * Progressi e piano di studio (impianto di SEIMAFI). Tutti i numeri vengono da src/learning (mastery, srs, plan, session).
 */
import { useMemo } from 'react';
import { ALL_CONCEPTS, conceptIdsByModule, conceptsOf } from '../../content';
import { MODULES } from '../../content/modules';
import { ALL_LESSONS } from '../../content/lezioni';
import { ALL_ORALI } from '../../content/orale';
import { masteryDetail, moduleMastery, MASTERY_OK } from '../../learning/mastery';
import { buildPlan } from '../../learning/plan';
import { cardsOf, dueCards, forecast, retrievabilityAt } from '../../learning/srs';
import { isStudied } from '../../learning/session';
import { go, useApp } from '../state';
import { addDays, daysBetween, parseLocalDate } from '../../learning/dates';

const pct = (x: number) => `${Math.round(x * 100)} %`;
const fmtDate = (d: Date) => d.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });

function HBars({ rows, threshold }: { rows: { label: string; value: number; href?: string; cls?: string }[]; threshold?: number }) {
  return (
    <div className="hbars" role="list">
      {rows.map((r) => (
        <div key={r.label} className={`hbar-row ${r.cls ?? ''}`} role="listitem" title={`${r.label}: ${pct(r.value)}`}>
          <span className="hbar-label">{r.href ? <a href={r.href}>{r.label}</a> : r.label}</span>
          <span className="hbar-track">
            <span className="hbar-fill" style={{ width: `${Math.max(0, Math.min(1, r.value)) * 100}%` }} />
            {threshold !== undefined && <span className="hbar-threshold" style={{ left: `${threshold * 100}%` }} />}
          </span>
          <span className="hbar-value">{pct(r.value)}</span>
        </div>
      ))}
    </div>
  );
}

function Columns({ values, labels }: { values: number[]; labels: string[] }) {
  const W = 420, H = 140, m = { l: 8, r: 8, t: 18, b: 22 };
  const max = Math.max(1, ...values);
  const bw = (W - m.l - m.r) / values.length;
  const barW = Math.min(20, bw - 4);
  const y = (v: number) => m.t + (H - m.t - m.b) * (1 - v / max);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart" role="img" aria-label="ripassi previsti per giorno">
      <line x1={m.l} x2={W - m.r} y1={H - m.b} y2={H - m.b} className="grid" />
      {values.map((v, i) => {
        const x = m.l + i * bw + (bw - barW) / 2;
        const top = y(v);
        return (
          <g key={i}>
            <title>{`${labels[i]}: ${v} ripassi`}</title>
            {v > 0 && <rect x={x} y={top} width={barW} height={H - m.b - top} rx={3} className="col-fill" />}
            {v > 0 && (
              <text x={x + barW / 2} y={top - 4} textAnchor="middle" className="tick">
                {v}
              </text>
            )}
            {i % 2 === 0 && (
              <text x={x + barW / 2} y={H - 6} textAnchor="middle" className="tick">
                {labels[i]}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

const stepTitle = (s: (typeof ALL_LESSONS)[number]['steps'][number] | undefined) => (s && 'title' in s ? s.title : undefined);
const FB_LABEL: Record<string, string> = { chiaro: 'chiaro', veloce: 'troppo veloce', lento: 'troppo lento', confuso: 'confuso' };

export function Progressi() {
  const { state } = useApp();
  const now = useMemo(() => new Date(), []);
  const detail = useMemo(() => masteryDetail(state, now), [state, now]);
  const mastery = Object.fromEntries(Object.entries(detail).map(([k, v]) => [k, v.mastery]));
  const mm = moduleMastery(mastery, conceptIdsByModule());
  const exam = state.settings.examDate ? parseLocalDate(state.settings.examDate) : undefined;
  const days = exam ? daysBetween(now, exam) : null;
  const due = dueCards(state, now).length;
  const next14 = forecast(state, now, 14);
  const labels = next14.map((_, i) => (i === 0 ? 'oggi' : fmtDate(addDays(now, i))));
  const cards = cardsOf(state);
  const concepts = ALL_CONCEPTS.filter((c) => !c.facoltativo || state.settings.facoltativi);
  const atExam = (id: string) => {
    if (!exam) return null;
    const cs = cards.filter(([, c]) => c.last_review && c.concepts.includes(id));
    return cs.length ? cs.reduce((s, [, c]) => s + retrievabilityAt(c, exam), 0) / cs.length : null;
  };
  const mastered = concepts.filter((c) => (mastery[c.id] ?? 0) >= MASTERY_OK).length;
  const feedback = ALL_LESSONS.flatMap((l) =>
    Object.entries(state.lessons?.[l.concept]?.feedback ?? {})
      .filter(([, f]) => f.v !== 'chiaro')
      .map(([stepId, f]) => ({ l, stepId, f })),
  );
  return (
    <div className="page">
      <h1>Progressi</h1>
      <section className="tiles">
        <div className="tile">
          <span className="tile-label">Ripassi da fare oggi</span>
          <span className="tile-value">{due}</span>
          {due > 0 && (
            <button className="link" onClick={() => go('sessione')}>
              Ripassa ora
            </button>
          )}
        </div>
        <div className="tile">
          <span className="tile-label">Concetti padroneggiati</span>
          <span className="tile-value">
            {mastered}/{concepts.length}
          </span>
        </div>
        <div className="tile">
          <span className="tile-label">Esposizioni orali</span>
          <span className="tile-value">{(state.oral ?? []).length}</span>
        </div>
        <div className="tile">
          <span className="tile-label">Giorni all&apos;orale</span>
          <span className="tile-value">{days ?? '—'}</span>
          {!exam && <a href="#/impostazioni">imposta la data</a>}
        </div>
      </section>

      <section className="card">
        <h2>Padronanza per modulo</h2>
        <HBars rows={MODULES.map((m) => ({ label: `${m.id.toUpperCase()} ${m.title}`, value: mm[m.id] ?? 0, href: `#/modulo/${m.id}`, cls: `mod-${m.id}` }))} threshold={MASTERY_OK} />
        <p className="small muted">
          Padronanza = rendimento nei richiami e nelle esposizioni orali (media mobile) × quanto lo ricordi oggi (ritenibilità FSRS). La linea verticale è la soglia di «padroneggiato» ({pct(MASTERY_OK)}), una scelta didattica.
        </p>
      </section>

      <section className="card">
        <h2>Concetti</h2>
        <div className="table-wrap">
          <table className="readout concept-table">
            <thead>
              <tr>
                <th>Concetto</th>
                <th>Lezione</th>
                <th>Rendimento</th>
                <th>Ricordo oggi</th>
                <th>Padronanza</th>
                <th title="Probabilità media di ricordarlo il giorno dell'orale se non lo ripassi più">All&apos;orale</th>
              </tr>
            </thead>
            <tbody>
              {concepts.map((c) => {
                const d = detail[c.id];
                const ae = atExam(c.id);
                return (
                  <tr key={c.id} className={`mod-${c.module}`}>
                    <td>
                      <a href={`#/concetto/${c.id}`}>{c.title}</a>
                    </td>
                    <td>{state.lessons?.[c.id]?.doneAt ? 'fatta' : isStudied(state, c.id) ? 'scheda letta' : '—'}</td>
                    <td className="num">{d ? pct(d.perf) : '—'}</td>
                    <td className="num">{d && d.cards ? pct(d.recall) : '—'}</td>
                    <td className="num">{d ? pct(d.mastery) : '—'}</td>
                    <td className={`num ${ae !== null && ae < 0.8 ? 'warn-text' : ''}`}>{ae === null ? '—' : pct(ae)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="small muted">{state.settings.facoltativi ? 'Tutti i concetti della dispensa, facoltativi compresi.' : 'Tutti i concetti della dispensa tranne i facoltativi (isostatiche, sforzo normale eccentrico), che si attivano in Impostazioni.'} «All&apos;orale» sotto l&apos;80 %: serve almeno un altro ripasso prima dell&apos;esame.</p>
      </section>

      <section className="card">
        <h2>Ripassi nei prossimi 14 giorni</h2>
        {cards.length === 0 ? <p className="muted">Ancora nessuna scheda: si creano rispondendo ai richiami ed esponendo le domande d&apos;orale.</p> : <Columns values={next14} labels={labels} />}
        <p className="small muted">{cards.length} schede in ripetizione distanziata (FSRS). Un errore torna il giorno dopo; le risposte sicure tornano sempre più distanziate.</p>
      </section>

      <section className="card">
        <h2>Le tue note sulle lezioni</h2>
        {feedback.length === 0 ? (
          <p className="muted">Nessun passo segnato come confuso, troppo veloce o troppo lento.</p>
        ) : (
          <ul>
            {feedback.map(({ l, stepId, f }) => (
              <li key={l.concept + stepId}>
                <a href={`#/lezione/${l.concept}`}>{l.title}</a>, passo «{stepTitle(l.steps.find((s) => s.id === stepId)) ?? stepId}»: {FB_LABEL[f.v]}
                {f.note ? ` — ${f.note}` : ''}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export function Piano() {
  const { state, update } = useApp();
  const now = useMemo(() => new Date(), []);
  const mastery = Object.fromEntries(Object.entries(masteryDetail(state, now)).map(([k, v]) => [k, v.mastery]));
  const byMod = Object.fromEntries(MODULES.map((m) => [m.id, conceptsOf(m.id).filter((c) => !c.facoltativo || state.settings.facoltativi)]));
  const plan = buildPlan(state, { now, masteryByModule: moduleMastery(mastery, conceptIdsByModule()), conceptsByModule: byMod, masteryByConcept: mastery });
  const title = (id: string) => ALL_CONCEPTS.find((c) => c.id === id)?.title ?? id;
  const h = (x: number) => (x < 0.95 ? `${Math.round(x * 60)} min` : `${(Math.round(x * 2) / 2).toString().replace('.', ',')} h`);
  return (
    <div className="page">
      <h1>Piano di studio</h1>
      <section className="card form plan-form">
        <label>
          Data dell&apos;orale
          <input id="plan-exam" type="date" value={state.settings.examDate ?? ''} onChange={(e) => update((s) => ({ ...s, settings: { ...s.settings, examDate: e.target.value || undefined } }))} />
        </label>
        <label>
          Ore di studio a settimana
          <input id="plan-hours" type="number" min={1} max={60} value={state.settings.hoursPerWeek} onChange={(e) => update((s) => ({ ...s, settings: { ...s.settings, hoursPerWeek: Math.max(1, Math.min(60, Number(e.target.value) || 1)) } }))} />
        </label>
        {plan.assumedWeeks && <p className="warn">Senza data dell&apos;orale il piano copre 8 settimane.</p>}
        {plan.warnings.map((w, i) => (
          <p key={i} className="warn">
            {w}
          </p>
        ))}
        {plan.suggestedHours !== undefined && plan.suggestedHours > state.settings.hoursPerWeek && plan.suggestedHours < 60 && (
          <p>
            <button onClick={() => update((s) => ({ ...s, settings: { ...s.settings, hoursPerWeek: plan.suggestedHours! } }))}>
              Usa {plan.suggestedHours} ore a settimana
            </button>
          </p>
        )}
        <p className="small muted">
          Il piano si ricalcola ogni volta che lo apri. Ogni settimana: prima i ripassi programmati, poi i moduli nell&apos;ordine della dispensa (M1 → M8), con ore proporzionali alle pagine del modulo e a quanto ti manca. L&apos;ultima settimana dedica metà del tempo alla simulazione d&apos;orale. Pesi e stime sono scelte didattiche, non dati sugli esami.
        </p>
      </section>
      {plan.weeks.map((w) => (
        <section key={w.index} className={`card week ${w.index === 1 ? 'current' : ''}`}>
          <div className="week-head">
            <h2>
              Settimana {w.index} {w.index === 1 && <span className="pill st-good">questa settimana</span>}
            </h2>
            <span className="muted small">
              {fmtDate(w.start)} – {fmtDate(w.end)} · {h(w.capacity)}
            </span>
          </div>
          <ul className="week-items">
            {w.reviewHours > 0 && (
              <li>
                <b>Ripassi programmati</b> — {h(w.reviewHours)}
              </li>
            )}
            {w.items.map((it) => {
              const m = MODULES.find((x) => x.id === it.module)!;
              return (
                <li key={it.module} className={`mod-${it.module}`}>
                  <b>
                    {it.module.toUpperCase()} · {m.title}
                  </b>{' '}
                  — {h(it.hours)}
                  {' · '}
                  <a className="small" href={`#/modulo/${it.module}`}>
                    {ALL_ORALI.filter((o) => ALL_CONCEPTS.find((c) => c.id === o.concepts[0])?.module === it.module).length} domande d&apos;orale
                  </a>
                  {it.pending ? (
                    <span className="small muted"> (contenuti in arrivo nell&apos;app: studia dalla dispensa, {m.source})</span>
                  ) : (
                    it.focus.length > 0 && (
                      <div className="small">
                        Parti da:{' '}
                        {it.focus.map((f, i) => (
                          <span key={f}>
                            {i ? ', ' : ''}
                            <a href={`#/concetto/${f}`}>{title(f)}</a>
                          </span>
                        ))}
                      </div>
                    )
                  )}
                </li>
              );
            })}
            {w.simulationHours > 0 && (
              <li>
                <a href="#/simulatore">
                  <b>Simulazione d&apos;orale</b>
                </a>{' '}
                — {h(w.simulationHours)}
              </li>
            )}
          </ul>
        </section>
      ))}
    </div>
  );
}
