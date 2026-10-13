/**
 * Scheda di un concetto (impianto di SEIMAFI):
 *  - scheda intera: significato, formule con riferimento, modello o diagramma, spiegazione, errori tipici;
 *  - scheda «a pezzi»: la scheda si legge in 2–4 pezzi con una domanda di richiamo tra un pezzo e l'altro.
 */
import { lazy, Suspense, useState, type ReactNode } from 'react';
import type { Concept, ConceptFormula } from '../../content/types';
import { DiagramHost } from '../../diagrams/DiagramHost';
import { chunkConcept } from '../../learning/chunks';
import { addRecall } from '../../learning/actions';
import { getConcept } from '../../content';
import { useApp } from '../state';
import { RichText, Inline, Tex } from './Tex';
import { SourceTag } from './bits';
import { RecallCard } from './RecallCard';

const Tensori3D = lazy(() => import('../../three/Tensori3D').then((m) => ({ default: m.Tensori3D })));

export function ConceptVisual({ c }: { c: Concept }) {
  const v = c.visual;
  if (!v) return null;
  if (v.kind === 'svg') return <DiagramHost id={v.id} params={v.params} />;
  return (
    <Suspense fallback={<div className="p3-loading">Carico il modello 3D…</div>}>
      <Tensori3D scene={v.scene} height={380} />
    </Suspense>
  );
}

export function FormulaList({ fs }: { fs: ConceptFormula[] }) {
  return (
    <div className="formula-list">
      {fs.map((f, i) => (
        <div key={i} className="formula">
          <div className="formula-head">
            <strong>{f.label}</strong>
            {f.rif && <span className="tag">{f.rif}</span>}
          </div>
          <Tex tex={f.tex} display />
        </div>
      ))}
    </div>
  );
}

function Prereq({ c }: { c: Concept }) {
  if (!c.prereq.length) return null;
  return (
    <p className="small muted">
      Prerequisiti:{' '}
      {c.prereq.map((p, i) => (
        <span key={p}>
          {i ? ', ' : ''}
          <a href={`#/concetto/${p}`}>{getConcept(p)?.title ?? p}</a>
        </span>
      ))}
    </p>
  );
}

function Pitfalls({ c }: { c: Concept }) {
  if (!c.pitfalls.length) return null;
  return (
    <>
      <h3>Errori tipici</h3>
      <ul>
        {c.pitfalls.map((p, i) => (
          <li key={i}>
            <Inline text={p} />
          </li>
        ))}
      </ul>
    </>
  );
}

/** Scheda intera. */
export function ConceptFull({ c }: { c: Concept }) {
  return (
    <article className="card concept">
      <div className="ex-head">
        <h2>{c.title}</h2>
        <SourceTag source={c.source} />
      </div>
      <h3>In una frase</h3>
      <RichText text={c.meaning} />
      <h3>Formule</h3>
      <FormulaList fs={c.formulas} />
      {c.visual && (
        <>
          <h3>{c.visual.kind === 'svg' ? 'Diagramma' : 'Modello'}</h3>
          <ConceptVisual c={c} />
        </>
      )}
      <h3>Spiegazione</h3>
      <RichText text={c.explanation} />
      <Pitfalls c={c} />
      <Prereq c={c} />
    </article>
  );
}

/** Scheda a pezzi: dopo ogni pezzo una domanda di richiamo; si va avanti dopo aver risposto. */
export function GuidedConcept({ c, onFinish, footer }: { c: Concept; onFinish?: () => void; footer?: ReactNode }) {
  const { update } = useApp();
  const { pieces, gates } = chunkConcept(c);
  const [step, setStep] = useState(0);
  const [answered, setAnswered] = useState<Record<number, boolean>>({});
  const last = step >= pieces.length - 1;
  const gate = gates[step];
  const canGo = !gate || answered[step];
  const piece = (i: number) => {
    const p = pieces[i];
    if (p.kind === 'base')
      return (
        <>
          <h3>In una frase</h3>
          <RichText text={c.meaning} />
          <h3>Formule</h3>
          <FormulaList fs={c.formulas} />
        </>
      );
    if (p.kind === 'diagram')
      return (
        <>
          <h3>{c.visual?.kind === 'svg' ? 'Diagramma' : 'Modello'}</h3>
          <ConceptVisual c={c} />
        </>
      );
    return (
      <>
        <h3>{pieces.findIndex((q) => q.kind === 'text') === i ? 'Spiegazione' : 'Spiegazione (continua)'}</h3>
        {p.paras.length > 0 && <RichText text={p.paras.join('\n\n')} />}
        {p.pitfalls && <Pitfalls c={c} />}
        {p.pitfalls && <Prereq c={c} />}
      </>
    );
  };
  return (
    <article className="card concept guided">
      <div className="ex-head">
        <h2>{c.title}</h2>
        <SourceTag source={c.source} />
      </div>
      <div className="guided-steps" aria-label={`Pezzo ${step + 1} di ${pieces.length}`}>
        {pieces.map((_, i) => (
          <span key={i} className={i < step ? 'done' : i === step ? 'on' : ''} />
        ))}
        <span className="small muted">
          pezzo {step + 1} di {pieces.length}
        </span>
      </div>
      {pieces.slice(0, step + 1).map((_, i) => (
        <section key={i} className={`guided-piece ${i === step ? 'current' : ''}`}>
          {piece(i)}
          {i < step && gates[i] && <p className="small muted">✓ domanda di richiamo fatta</p>}
        </section>
      ))}
      {gate && !last && (
        <div className="guided-gate">
          <p className="small muted">Prima di andare avanti, rispondi a memoria:</p>
          <RecallCard
            key={gate.id + step}
            q={gate}
            concept={c}
            onAnswer={(correct, grade) => {
              setAnswered((a) => ({ ...a, [step]: true }));
              update((s) => addRecall(s, { qid: gate.id, conceptId: c.id, at: new Date().toISOString(), correct, grade }));
            }}
          />
        </div>
      )}
      {!last ? (
        <button className="primary" disabled={!canGo} onClick={() => setStep(step + 1)}>
          Continua
        </button>
      ) : (
        footer ??
        (onFinish && (
          <button className="primary" onClick={onFinish}>
            Ho finito la scheda
          </button>
        ))
      )}
    </article>
  );
}
