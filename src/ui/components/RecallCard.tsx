/** Domanda di richiamo: si risponde a memoria, poi si vede la risposta (recupero attivo). */
import { useState } from 'react';
import type { Concept, RecallQ } from '../../content/types';
import { RichText } from './Tex';

export function RecallCard({ q, concept, onAnswer }: { q: RecallQ; concept: Concept; onAnswer: (correct: boolean, grade?: 1 | 2 | 3 | 4) => void }) {
  const [choice, setChoice] = useState<number | boolean | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [done, setDone] = useState(false);
  const answer = (correct: boolean, grade?: 1 | 2 | 3 | 4) => {
    if (done) return;
    setDone(true);
    onAnswer(correct, grade);
  };
  return (
    <div className="card recall">
      <div className="small muted">Richiamo · {concept.title}</div>
      <RichText text={q.q} className="q" />
      {q.kind === 'vf' && (
        <>
          <div className="seg">
            {[true, false].map((v) => (
              <button
                key={String(v)}
                disabled={choice !== null}
                className={choice === v ? 'on' : ''}
                onClick={() => {
                  setChoice(v);
                  answer(v === q.answer);
                }}
              >
                {v ? 'Vero' : 'Falso'}
              </button>
            ))}
          </div>
          {choice !== null && (
            <div className={choice === q.answer ? 'verdict ok' : 'verdict ko'}>
              <strong>{choice === q.answer ? 'Giusto.' : `Sbagliato: è ${q.answer ? 'vero' : 'falso'}.`}</strong> <RichText text={q.why} />
            </div>
          )}
        </>
      )}
      {q.kind === 'scelta' && (
        <>
          <div className="options">
            {q.options.map((o, i) => (
              <button
                key={i}
                disabled={choice !== null}
                className={`option ${choice === i ? 'on' : ''} ${choice !== null && i === q.correct ? 'right' : ''}`}
                onClick={() => {
                  setChoice(i);
                  answer(i === q.correct);
                }}
              >
                <RichText text={o} />
              </button>
            ))}
          </div>
          {choice !== null && (
            <div className={choice === q.correct ? 'verdict ok' : 'verdict ko'}>
              <RichText text={q.why} />
            </div>
          )}
        </>
      )}
      {q.kind === 'aperta' && (
        <>
          {!revealed ? (
            <button className="primary" onClick={() => setRevealed(true)}>
              Ho risposto a mente: mostra la risposta
            </button>
          ) : (
            <>
              <div className="model-answer">
                <RichText text={q.answer} />
              </div>
              <div className="seg">
                {(
                  [
                    [1, 'Non ricordavo'],
                    [2, 'In parte'],
                    [3, 'Bene'],
                    [4, 'Facile'],
                  ] as const
                ).map(([g, l]) => (
                  <button key={g} disabled={done} onClick={() => answer(g >= 3, g)}>
                    {l}
                  </button>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
