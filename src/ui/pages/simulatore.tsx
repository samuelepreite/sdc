/**
 * Simulatore d'orale (Fase 3): un'interrogazione di domande miste con il tempo, una dopo l'altra, poi il resoconto.
 * Ogni esposizione è registrata come quelle della banca (voto FSRS e padronanza dei concetti collegati).
 * La scelta delle domande è in learning/simulatore (regole didattiche, non dati sugli esami).
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { ALL_CONCEPTS } from '../../content';
import { ALL_ORALI } from '../../content/orale';
import type { OralQ } from '../../content/types';
import { masteryByConcept } from '../../learning/mastery';
import { isStudied } from '../../learning/session';
import { examReport, pickExam } from '../../learning/simulatore';
import { useApp } from '../state';
import { Inline } from '../components/Tex';
import { OralRunner } from './orale';

const mmss = (s: number) => `${Math.floor(Math.max(0, s) / 60)}:${String(Math.max(0, s) % 60).padStart(2, '0')}`;
type Res = { q: OralQ; points: number; total: number; seconds: number };

export function Simulatore() {
  const { state } = useApp();
  const [n, setN] = useState(4);
  const [mins, setMins] = useState(8);
  const [scope, setScope] = useState<'tutti' | 'studiati'>('tutti');
  const [seed, setSeed] = useState(() => Date.now() % 100000);
  const [phase, setPhase] = useState<'setup' | 'run' | 'end'>('setup');
  const [idx, setIdx] = useState(0);
  const [res, setRes] = useState<Res[]>([]);
  const t0 = useRef(0);
  const [now, setNow] = useState(0);
  const exam = useMemo(
    () => pickExam(state, ALL_ORALI, ALL_CONCEPTS, { n, seed, scope, mastery: masteryByConcept(state), studied: (id) => isStudied(state, id), facoltativi: !!state.settings.facoltativi }),
    [n, seed, scope], // eslint-disable-line react-hooks/exhaustive-deps
  );
  useEffect(() => {
    if (phase !== 'run') return;
    const h = window.setInterval(() => setNow(Math.round((Date.now() - t0.current) / 1000)), 1000);
    return () => window.clearInterval(h);
  }, [phase]);
  const total = n * mins * 60;
  const start = () => {
    t0.current = Date.now();
    setNow(0);
    setIdx(0);
    setRes([]);
    setPhase('run');
  };
  if (phase === 'setup')
    return (
      <div className="page">
        <h1>Simulatore d&apos;orale</h1>
        <p className="lead muted">Un&apos;interrogazione di domande miste, con il tempo, come davanti al docente. Rispondi a voce, poi confronta con la scaletta e spunta i punti toccati.</p>
        <section className="card form">
          <label>
            Numero di domande
            <select id="sim-n" value={n} onChange={(e) => setN(Number(e.target.value))}>
              {[3, 4, 5, 6].map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </label>
          <label>
            Minuti per domanda
            <select id="sim-min" value={mins} onChange={(e) => setMins(Number(e.target.value))}>
              {[5, 8, 10, 12].map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </label>
          <div className="chips" role="radiogroup" aria-label="Ambito">
            {(['tutti', 'studiati'] as const).map((s) => (
              <button key={s} role="radio" aria-checked={scope === s} className={scope === s ? 'on' : ''} onClick={() => setScope(s)}>
                {s === 'tutti' ? 'tutto il programma' : 'solo i concetti già studiati'}
              </button>
            ))}
          </div>
          <p className="small muted">Regole della scelta (didattiche): moduli diversi, prima le domande mai esposte e i concetti più deboli; da 4 domande in su almeno un collegamento o un trabocchetto. Facoltativi {state.settings.facoltativi ? 'inclusi' : 'esclusi'} (impostazioni).</p>
        </section>
        <section className="card">
          <h2>Le domande estratte</h2>
          <ol>
            {exam.map((q) => (
              <li key={q.id}>
                <span className={`ex-id kind-${q.kind}`}>{q.kind}</span> <Inline text={q.q} />
              </li>
            ))}
          </ol>
          <div className="row">
            <button onClick={() => setSeed((x) => x + 1)}>Estrai di nuovo</button>
            <button className="primary" onClick={start} disabled={!exam.length}>
              Inizia ({n} × {mins} min)
            </button>
          </div>
        </section>
      </div>
    );
  if (phase === 'run') {
    const q = exam[idx];
    const left = total - now;
    return (
      <div className="page">
        <div className="sim-bar card">
          <b>
            Domanda {idx + 1} di {exam.length}
          </b>
          <span className={left < 0 ? 'warn' : 'muted'}>{left >= 0 ? `tempo residuo ${mmss(left)}` : `oltre il tempo di ${mmss(-left)}`}</span>
          <button onClick={() => setPhase('end')}>Termina</button>
        </div>
        <OralRunner
          key={q.id}
          o={q}
          onDone={(r) => {
            const next = [...res, { q, points: r?.points ?? 0, total: r?.total ?? q.scaletta.length, seconds: r?.seconds ?? 0 }];
            setRes(next);
            window.setTimeout(() => (idx + 1 < exam.length ? setIdx(idx + 1) : setPhase('end')), 900);
          }}
        />
      </div>
    );
  }
  const rep = examReport(res);
  return (
    <div className="page">
      <h1>Resoconto</h1>
      <section className="card">
        <p className="lead">
          Punti della scaletta toccati in media: <b>{Math.round(rep.share * 100)} %</b> — {rep.giudizio}. Tempo totale {mmss(rep.seconds)} su {mmss(total)}.
        </p>
        <table className="readout">
          <tbody>
            {res.map((r) => (
              <tr key={r.q.id}>
                <td>
                  <a href={`#/orale/${r.q.id}`}>
                    <Inline text={r.q.q} />
                  </a>
                </td>
                <td>
                  {r.points}/{r.total} · {mmss(r.seconds)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {res.length < exam.length && <p className="small muted">Interrogazione interrotta: {exam.length - res.length} domande non esposte.</p>}
        <p className="small muted">Il giudizio è un&apos;indicazione didattica sulla completezza delle esposizioni, non una previsione del voto.</p>
        <div className="row">
          <button onClick={() => setPhase('setup')}>Nuova interrogazione</button>
        </div>
      </section>
    </div>
  );
}
