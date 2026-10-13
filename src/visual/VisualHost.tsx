/**
 * Smista ogni visual della lezione o della scheda: diagrammi SVG e modelli 3D (caricati solo quando servono).
 * Aggiungere un modello: un nuovo `kind` in LessonVisual (content/types.ts) e un ramo qui.
 */
import { lazy, Suspense } from 'react';
import type { LessonVisual } from '../content/types';
import { DiagramHost } from '../diagrams/DiagramHost';

const Tensori3D = lazy(() => import('../three/Tensori3D').then((m) => ({ default: m.Tensori3D })));
const Tensione3D = lazy(() => import('../three/Tensione3D').then((m) => ({ default: m.Tensione3D })));
const Trave3D = lazy(() => import('../three/Trave3D').then((m) => ({ default: m.Trave3D })));
const Deforma3D = lazy(() => import('../three/Deforma3D').then((m) => ({ default: m.Deforma3D })));

/** chiave del visual: tipo + parametri, così un passo con una scena diversa rimonta il componente */
export const visualKey = (v: LessonVisual) => (v.kind === 'svg' ? `svg:${v.id}:${JSON.stringify(v.params ?? {})}` : `${v.kind}:${JSON.stringify(v.scene)}`);

export function VisualHost({ v, height = 440 }: { v: LessonVisual; height?: number }) {
  if (v.kind === 'svg') return <DiagramHost key={visualKey(v)} id={v.id} params={v.params} />;
  return (
    <Suspense fallback={<div className="p3-loading">Carico il modello 3D…</div>}>
      {v.kind === 'tensori3d' && <Tensori3D scene={v.scene} height={height} />}
      {v.kind === 'deforma3d' && <Deforma3D scene={v.scene} height={height} />}
      {v.kind === 'tensione3d' && <Tensione3D scene={v.scene} height={height} />}
      {v.kind === 'trave3d' && <Trave3D scene={v.scene} height={height} />}
    </Suspense>
  );
}
