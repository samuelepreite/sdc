/** Smista i diagrammi SVG per id (contenuti come dati: la lezione dice quale diagramma e con quali parametri). */
import type { SvgId } from '../content/types';
import { MatrixLab } from './MatrixLab';
import { Simmetrie4 } from './Simmetrie4';
import { Divergenza } from './Divergenza';

export const SVG_IDS: SvgId[] = ['matrici', 'simmetrie4', 'divergenza'];

export function DiagramHost({ id, params }: { id: SvgId; params?: Record<string, number | string | boolean> }) {
  if (id === 'matrici') return <MatrixLab params={params} />;
  if (id === 'simmetrie4') return <Simmetrie4 params={params} />;
  return <Divergenza params={params} />;
}
