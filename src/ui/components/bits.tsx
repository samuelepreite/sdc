import type { ReactNode } from 'react';
import type { Source } from '../../engine/types';
import { sourceLabel } from '../../engine/types';
import { Inline } from './Tex';

export function SourceTag({ source }: { source: Source }) {
  const cls = source.kind === 'deduzione' ? 'tag tag-ded' : source.kind === 'esterna' ? 'tag tag-ext' : 'tag';
  const title = source.kind === 'deduzione' ? source.spiegazione : source.kind === 'esterna' ? source.note : 'Dispensa del corso';
  return (
    <span className={cls} title={title}>
      {sourceLabel(source)}
    </span>
  );
}

export function Collapsible({ title, children, open = false }: { title: ReactNode; children: ReactNode; open?: boolean }) {
  return (
    <details className="collapsible" open={open}>
      <summary>{title}</summary>
      <div>{children}</div>
    </details>
  );
}

export function Progress({ value, label }: { value: number; label?: string }) {
  return (
    <div className="progress" aria-label={label}>
      <div style={{ width: `${Math.round(Math.max(0, Math.min(1, value)) * 100)}%` }} />
    </div>
  );
}

export { Inline };
