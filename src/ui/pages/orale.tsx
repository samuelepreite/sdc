/**
 * Orale: banca delle domande e «spiegalo a voce».
 * Il microfono non è disponibile dentro un artifact, quindi l'esposizione è autovalutata:
 *  1. leggi la domanda, parte il cronometro, esponi a voce (facoltativo: appunti scritti);
 *  2. «Ho finito»: compaiono la scaletta della risposta, le equazioni da scrivere alla lavagna (una alla volta) e la figura;
 *  3. spunti i punti della scaletta che hai toccato → voto FSRS (gradeOral) e padronanza dei concetti collegati.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { ALL_ORALI, getOral } from '../../content/orale';
import { MODULES } from '../../content/modules';
import { getConcept } from '../../content';
import type { OralQ } from '../../content/types';
import { addOral } from '../../learning/actions';
import { useApp } from '../state';
import { SourceTag } from '../components/bits';
import { Inline, Tex } from '../components/Tex';
import { Icon } from '../components/Icon';
import { OralList } from './pages';

const KIND_LABEL: Record<OralQ['kind'], string> = { espositiva: 'espositiva', collegamento: 'collegamento', trabocchetto: 'trabocchetto' };
const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

export function OralRunner({ o, onDone }: { o: OralQ; onDone?: () => void }) {
  const { update } = useApp();
  const [phase, setPhase] = useState<'espongo' | 'confronto' | 'fatto'>('espongo');
  const [secs, setSecs] = useState(0);
  const [notes, setNotes] = useState('');
  const [ticked, setTicked] = useState<number[]>([]);
  const [shownEq, setShownEq] = useState(0);
  const t0 = useRef(Date.now());
  useEffect(() => {
    if (phase !== 'espongo') return;
    const h = window.setInterval(() => setSecs(Math.round((Date.now() - t0.current) / 1000)), 1000);
    return () => window.clearInterval(h);
  }, [phase]);
  const lav = o.lavagna ?? [];
  const toggle = (i: number) => setTicked((t) => (t.includes(i) ? t.filter((x) => x !== i) : [...t, i].sort((a, b) => a - b)));
  const submit = () => {
    update((s) => addOral(s, { qid: o.id, at: new Date().toISOString(), points: ticked, total: o.scaletta.length, seconds: secs }));
    setPhase('fatto');
    onDone?.();
  };
  const share = o.scaletta.length ? ticked.length / o.scaletta.length : 0;
  return (
    <article className="card oral-runner" data-phase={phase}>
      <div className="ex-head">
        <span className={`ex-id kind-${o.kind}`}>{KIND_LABEL[o.kind]}</span>
        <SourceTag source={o.source} />
      </div>
      <h2 className="oral-q">
        <Inline text={o.q} />
      </h2>
      <p className="small muted">
        Concetti:{' '}
        {o.concepts.map((c, i) => (
          <span key={c}>
            {i ? ', ' : ''}
            <a href={`#/concetto/${c}`}>{getConcept(c)?.title ?? c}</a>
          </span>
        ))}
      </p>
      {phase === 'espongo' && (
        <>
          <p className="oral-timer" aria-live="off">
            <Icon name="tempo" size={18} /> {mmss(secs)}
          </p>
          <p>Rispondi a voce, come davanti al docente: ipotesi, passaggi chiave, risultato, significato. Scrivi alla lavagna (su carta) le equazioni che useresti.</p>
          <label className="small muted" htmlFor={`notes-${o.id}`}>
            Appunti (facoltativi, restano solo qui)
          </label>
          <textarea id={`notes-${o.id}`} rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Parole chiave della tua risposta…" />
          <button className="primary" onClick={() => setPhase('confronto')}>
            Ho finito, confronta con la scaletta
          </button>
        </>
      )}
      {phase !== 'espongo' && (
        <>
          <p className="small muted">Tempo: {mmss(secs)}. Spunta i punti che hai toccato davvero.</p>
          <ol className="scaletta">
            {o.scaletta.map((p, i) => (
              <li key={i}>
                <label className="check">
                  <input type="checkbox" disabled={phase === 'fatto'} checked={ticked.includes(i)} onChange={() => toggle(i)} /> <Inline text={p} />
                </label>
              </li>
            ))}
          </ol>
          {lav.length > 0 && (
            <section className="lavagna" aria-label="Alla lavagna">
              <h3>Alla lavagna</h3>
              {lav.slice(0, shownEq).map((e, i) => (
                <div key={i} className="formula">
                  <Tex tex={e.tex} display />
                  {e.rif && <span className="tag">{e.rif}</span>}
                </div>
              ))}
              {shownEq < lav.length && (
                <button onClick={() => setShownEq(shownEq + 1)}>
                  Mostra la {shownEq + 1}ª equazione ({shownEq + 1} di {lav.length})
                </button>
              )}
            </section>
          )}
          {o.figura && (
            <section className="figura">
              <h3>Figura da disegnare</h3>
              <p>
                <Inline text={o.figura} />
              </p>
            </section>
          )}
          {phase === 'confronto' ? (
            <button className="primary" onClick={submit}>
              Registra: {ticked.length} di {o.scaletta.length} punti
            </button>
          ) : (
            <p className={`oral-result ${share >= 0.75 ? 'ok' : share >= 0.5 ? 'mid' : 'ko'}`}>
              {share >= 1
                ? 'Risposta completa: la domanda torna tra parecchi giorni.'
                : share >= 0.75
                  ? 'Buona: rivedi il punto mancante; la domanda torna tra qualche giorno.'
                  : share >= 0.5
                    ? 'Incompleta: ripassa la lezione e riprova; torna presto.'
                    : 'Da rifare: riapri la lezione dei concetti collegati. La domanda torna domani.'}
            </p>
          )}
        </>
      )}
    </article>
  );
}

/** Banca delle domande, per modulo; filtro per tipo. */
export function OraleIndex() {
  const { state } = useApp();
  const [kind, setKind] = useState<'tutte' | OralQ['kind']>('tutte');
  const byMod = useMemo(
    () =>
      MODULES.map((m) => ({ m, list: ALL_ORALI.filter((o) => (kind === 'tutte' || o.kind === kind) && getConcept(o.concepts[0])?.module === m.id) })).filter((x) => x.list.length),
    [kind],
  );
  const done = new Set((state.oral ?? []).map((x) => x.qid)).size;
  return (
    <div className="page">
      <h1>Orale</h1>
      <p className="lead muted">
        {ALL_ORALI.length} domande ({ALL_ORALI.filter((o) => o.source.kind === 'dispensa').length} dai riquadri «Per l&apos;orale» della dispensa), {done} già esposte almeno una volta. Ognuna ha la scaletta della risposta, le equazioni alla lavagna con il riferimento e la figura da disegnare.
      </p>
      <div className="chips" role="radiogroup" aria-label="Tipo di domanda">
        {(['tutte', 'espositiva', 'collegamento', 'trabocchetto'] as const).map((k) => (
          <button key={k} role="radio" aria-checked={kind === k} className={kind === k ? 'on' : ''} onClick={() => setKind(k)}>
            {k === 'tutte' ? 'Tutte' : KIND_LABEL[k]} ({k === 'tutte' ? ALL_ORALI.length : ALL_ORALI.filter((o) => o.kind === k).length})
          </button>
        ))}
      </div>
      {byMod.map(({ m, list }) => (
        <section key={m.id} className={`card mod-${m.id}`}>
          <h2>
            {m.id.toUpperCase()} · {m.title}
          </h2>
          <OralList list={list} />
        </section>
      ))}
    </div>
  );
}

export function OralePage({ id }: { id: string }) {
  const o = getOral(id);
  const [n, setN] = useState(0);
  if (!o) return <div className="page card">Domanda non trovata.</div>;
  return (
    <div className="page">
      <p className="small">
        <a href="#/orale">← tutte le domande</a>
      </p>
      <OralRunner key={n} o={o} />
      <button onClick={() => setN(n + 1)}>Rifalla da capo</button>
    </div>
  );
}
