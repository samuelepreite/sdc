/** Smista i diagrammi SVG per id (contenuti come dati: la lezione dice quale diagramma e con quali parametri). */
import type { SvgId } from '../content/types';
import { MatrixLab } from './MatrixLab';
import { Simmetrie4 } from './Simmetrie4';
import { Divergenza } from './Divergenza';
import { Compatibilita } from './Compatibilita';
import { Mohr } from './Mohr';
import { Arbelo } from './Arbelo';
import { Prove } from './Prove';
import { Voigt } from './Voigt';
import { Cammino } from './Cammino';
import { Isotropia } from './Isotropia';
import { Problema } from './Problema';

export const SVG_IDS: SvgId[] = ['matrici', 'simmetrie4', 'divergenza', 'compatibilita', 'mohr', 'arbelo', 'prove', 'voigt', 'cammino', 'isotropia', 'problema'];

export function DiagramHost({ id, params }: { id: SvgId; params?: Record<string, number | string | boolean> }) {
  if (id === 'matrici') return <MatrixLab params={params} />;
  if (id === 'simmetrie4') return <Simmetrie4 params={params} />;
  if (id === 'prove') return <Prove params={params} />;
  if (id === 'problema') return <Problema />;
  if (id === 'isotropia') return <Isotropia params={params} />;
  if (id === 'cammino') return <Cammino />;
  if (id === 'voigt') return <Voigt params={params} />;
  if (id === 'mohr') return <Mohr params={params} />;
  if (id === 'arbelo') return <Arbelo params={params} />;
  if (id === 'compatibilita') return <Compatibilita params={params} />;
  return <Divergenza params={params} />;
}
