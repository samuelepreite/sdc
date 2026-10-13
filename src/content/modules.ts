import type { ModuleId } from '../engine/types';

/** Moduli nell'ordine della dispensa (ANALISI.md §3). `pages` = pagine della dispensa (pesi del piano). */
export const MODULES: { id: ModuleId; title: string; short: string; source: string; pages: number }[] = [
  { id: 'm1', title: 'Algebra e analisi tensoriale', short: 'Tensori', source: 'Cap. 1, pp. 1–14', pages: 14 },
  { id: 'm2', title: 'Analisi della deformazione', short: 'Deformazione', source: 'Cap. 2, pp. 15–35', pages: 21 },
  { id: 'm3', title: 'Analisi della tensione', short: 'Tensione', source: 'Cap. 3, pp. 36–65', pages: 30 },
  { id: 'm4', title: 'Lavoro, legami costitutivi, iperelasticità', short: 'Legami costitutivi', source: 'Cap. 4, §4.1–4.11, pp. 66–86', pages: 21 },
  { id: 'm5', title: 'Elasticità isotropa e problema elastico', short: 'Problema elastico', source: 'Cap. 4, §4.12–4.17, pp. 86–98', pages: 12 },
  { id: 'm6', title: 'Saint-Venant: sforzo normale e flessione', short: 'Saint-Venant I', source: 'Cap. 5, §5.1–5.6, pp. 99–125', pages: 27 },
  { id: 'm7', title: 'Saint-Venant: taglio e torsione', short: 'Saint-Venant II', source: 'Cap. 5, §5.7–5.9, pp. 125–143', pages: 17 },
  { id: 'm8', title: 'Criteri di resistenza', short: 'Criteri', source: 'Cap. 6, pp. 144–159', pages: 16 },
];
export const moduleTitle = (id: string) => MODULES.find((m) => m.id === id)?.title ?? id;
