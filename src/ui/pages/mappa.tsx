/**
 * Mappa dei concetti (Fase 3): i 57 concetti in colonne per modulo, con le frecce dei prerequisiti (grafo di
 * tools/grafo.py, riportato in ogni scheda) e il colore della padronanza. Selezionando un concetto si evidenziano
 * tutto ciò che serve prima (a monte) e tutto ciò che ne dipende (a valle).
 */
import { useMemo, useState } from 'react';
import { ALL_CONCEPTS } from '../../content';
import { MODULES } from '../../content/modules';
import { masteryByConcept, MASTERY_OK } from '../../learning/mastery';
import { useApp } from '../state';

const W = 150,
  H = 46,
  GX = 34,
  GY = 14,
  TOP = 40;

export function Mappa() {
  const { state } = useApp();
  const [sel, setSel] = useState<string | null>(null);
  const mastery = useMemo(() => masteryByConcept(state), [state]);
  const pos = useMemo(() => {
    const p: Record<string, { x: number; y: number }> = {};
    MODULES.forEach((m, i) => {
      ALL_CONCEPTS.filter((c) => c.module === m.id).forEach((c, j) => (p[c.id] = { x: 12 + i * (W + GX), y: TOP + j * (H + GY) }));
    });
    return p;
  }, []);
  const byId = useMemo(() => new Map(ALL_CONCEPTS.map((c) => [c.id, c])), []);
  const closure = (start: string, dir: 'su' | 'giu') => {
    const out = new Set<string>();
    const st = [start];
    while (st.length) {
      const id = st.pop()!;
      const next = dir === 'su' ? (byId.get(id)?.prereq ?? []) : ALL_CONCEPTS.filter((c) => c.prereq.includes(id)).map((c) => c.id);
      for (const n of next) if (!out.has(n)) (out.add(n), st.push(n));
    }
    return out;
  };
  const up = sel ? closure(sel, 'su') : new Set<string>();
  const down = sel ? closure(sel, 'giu') : new Set<string>();
  const rows = Math.max(...MODULES.map((m) => ALL_CONCEPTS.filter((c) => c.module === m.id).length));
  const width = 12 + MODULES.length * (W + GX);
  const height = TOP + rows * (H + GY) + 10;
  const cls = (id: string) => {
    const m = mastery[id];
    const st = m === undefined || m === 0 ? 'none' : m >= MASTERY_OK ? 'ok' : 'mid';
    const hl = !sel ? '' : id === sel ? ' sel' : up.has(id) ? ' up' : down.has(id) ? ' down' : ' dim';
    return `map-node st-${st}${hl}`;
  };
  return (
    <div className="page">
      <h1>Mappa dei concetti</h1>
      <p className="lead muted">
        {ALL_CONCEPTS.length} concetti, uno per scheda, nell&apos;ordine della dispensa. Le frecce vanno dal prerequisito al concetto che lo usa. Tocca un concetto: in blu ciò che serve prima, in arancio ciò che ne dipende; tocca di nuovo per aprire la scheda.
      </p>
      <div className="legend small">
        <span className="map-key st-none">non ancora</span> <span className="map-key st-mid">in corso</span> <span className="map-key st-ok">padroneggiato</span> <span className="map-key fac">facoltativo</span>
      </div>
      <div className="svg-scroll card">
        <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} role="img" aria-label="Mappa dei concetti con i prerequisiti">
          {MODULES.map((m, i) => (
            <text key={m.id} x={12 + i * (W + GX) + W / 2} y={22} textAnchor="middle" className={`map-col mod-${m.id}`}>
              {m.id.toUpperCase()} · {m.title}
            </text>
          ))}
          {ALL_CONCEPTS.flatMap((c) =>
            c.prereq
              .filter((p) => pos[p])
              .map((p) => {
                const a = pos[p],
                  b = pos[c.id];
                const on = sel && (c.id === sel || p === sel || (up.has(p) && (up.has(c.id) || c.id === sel)) || (down.has(c.id) && (down.has(p) || p === sel)));
                let d: string;
                if (a.x === b.x) {
                  const x = a.x;
                  d = `M${x},${a.y + H / 2} C${x - 26},${a.y + H / 2} ${x - 26},${b.y + H / 2} ${x},${b.y + H / 2}`;
                } else {
                  const x1 = a.x + W,
                    y1 = a.y + H / 2,
                    x2 = b.x,
                    y2 = b.y + H / 2;
                  d = `M${x1},${y1} C${x1 + GX},${y1} ${x2 - GX},${y2} ${x2},${y2}`;
                }
                return <path key={`${p}-${c.id}`} d={d} className={`map-edge${on ? ' on' : sel ? ' dim' : ''}`} markerEnd="url(#map-arrow)" />;
              }),
          )}
          <defs>
            <marker id="map-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M0,0 L8,4 L0,8 z" className="map-arrowhead" />
            </marker>
          </defs>
          {ALL_CONCEPTS.map((c) => {
            const p = pos[c.id];
            const title = c.title.length > 44 ? `${c.title.slice(0, 42)}…` : c.title;
            const words = title.split(' ');
            const lines: string[] = [''];
            for (const w of words) {
              if ((lines[lines.length - 1] + ' ' + w).trim().length > 24 && lines.length < 2) lines.push(w);
              else lines[lines.length - 1] = (lines[lines.length - 1] + ' ' + w).trim();
            }
            return (
              <g
                key={c.id}
                className={cls(c.id)}
                transform={`translate(${p.x},${p.y})`}
                role="button"
                tabIndex={0}
                aria-label={`${c.id} ${c.title}`}
                onClick={() => (sel === c.id ? (window.location.hash = `#/concetto/${c.id}`) : setSel(c.id))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') sel === c.id ? (window.location.hash = `#/concetto/${c.id}`) : setSel(c.id);
                }}
              >
                <rect width={W} height={H} rx={8} strokeDasharray={c.facoltativo ? '4 3' : undefined} />
                <text x={8} y={15} className="map-id">
                  {c.id}
                  {mastery[c.id] ? ` · ${Math.round(mastery[c.id] * 100)}%` : ''}
                </text>
                {lines.map((l, i) => (
                  <text key={i} x={8} y={29 + i * 12} className="map-title">
                    {l}
                  </text>
                ))}
              </g>
            );
          })}
        </svg>
      </div>
      {sel && (
        <p className="small">
          <b>{sel}</b> · {byId.get(sel)?.title}: {up.size} concetti a monte, {down.size} a valle. <a href={`#/concetto/${sel}`}>Apri la scheda</a> ·{' '}
          <button className="link" onClick={() => setSel(null)}>
            togli la selezione
          </button>
        </p>
      )}
    </div>
  );
}
