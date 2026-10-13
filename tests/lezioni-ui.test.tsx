// @vitest-environment jsdom
/** Lezione guidata (interfaccia): si avanza solo completando il passo; derivazione con «prova tu»; giudizi e fine. */
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import { StateProvider, useApp } from '../src/ui/state';
import { LessonPage, visualAt } from '../src/ui/components/Lesson';
import { OralRunner } from '../src/ui/pages/orale';
import { ALL_LESSONS, getLesson } from '../src/content/lezioni';
import { ALL_ORALI } from '../src/content/orale';
import { defaultState, type AppState } from '../src/storage/store';
import { mdToSpeech } from '../src/ui/speech';

vi.mock('../src/three/Tensori3D', () => ({ Tensori3D: () => null }));
afterEach(cleanup);
let probe: AppState | null = null;
function Probe() {
  probe = useApp().state;
  return null;
}
const mount = (node: React.ReactNode) =>
  render(
    <StateProvider initial={defaultState()}>
      {node}
      <Probe />
    </StateProvider>,
  );
const avanti = () => screen.getByRole('button', { name: /^Avanti$/ });

describe('lezione guidata', () => {
  it('ogni passo di ogni lezione ha una scena (eredita l\'ultima impostata)', () => {
    for (const l of ALL_LESSONS) for (let i = 0; i < l.steps.length; i++) expect(visualAt(l, i), `${l.concept} passo ${i}`).not.toBeNull();
  });
  it('c1.1: giudizio salvato, domanda che blocca «Avanti», fine lezione → concetto studiato', () => {
    const l = getLesson('c1.1')!;
    mount(<LessonPage id="c1.1" />);
    expect(screen.getByRole('heading', { name: l.title })).toBeTruthy();
    fireEvent.click(screen.getAllByRole('button', { name: 'chiaro' })[0]);
    expect(probe!.lessons['c1.1'].feedback['l11-1'].v).toBe('chiaro');
    for (let i = 0; i < 5; i++) fireEvent.click(avanti()); // fino alla domanda (passo 6)
    expect(screen.queryByRole('button', { name: /^Avanti$/ })).toBeNull();
    fireEvent.click(screen.getByText(/prima il tensore sul versore/));
    expect(probe!.recall.some((r) => r.qid === 'lezione:l11-q1' && r.correct)).toBe(true);
    fireEvent.click(avanti());
    fireEvent.click(avanti());
    fireEvent.click(screen.getByRole('button', { name: 'Ho finito la lezione' }));
    expect(probe!.lessons['c1.1'].doneAt).toBeDefined();
    expect(screen.getByRole('link', { name: 'Spiegalo a voce' })).toBeTruthy();
  });
  it('c1.2: derivazione con «prova tu» prima del passaggio chiave', () => {
    mount(<LessonPage id="c1.2" />);
    fireEvent.click(avanti());
    fireEvent.click(screen.getByRole('button', { name: 'Cominciamo' }));
    expect(screen.queryByRole('button', { name: /^Avanti$/ })).toBeNull();
    for (let g = 0; g < 10; g++) {
      const opt = document.querySelector('.lesson-step.active .deriv-next .option:not([disabled])') as HTMLButtonElement | null;
      if (opt) {
        fireEvent.click(opt);
        fireEvent.click(screen.getByRole('button', { name: 'Scrivi il passaggio' }));
        continue;
      }
      const nx = screen.queryByRole('button', { name: 'Passaggio successivo' });
      if (nx) fireEvent.click(nx);
      else break;
    }
    expect(document.querySelectorAll('.lesson-step.active .deriv-line').length).toBe(getLesson('c1.2')!.steps[1].kind === 'derivazione' ? 3 : -1);
    expect(avanti()).toBeTruthy();
  });
  it('la voce legge le formule della notazione in parole', () => {
    expect(mdToSpeech('$\\tens A\\vet v$')).toContain('tensore A');
    expect(mdToSpeech('$\\operatorname{tr}\\tens A = 0$')).toContain('traccia di');
  });
});

describe('spiegalo a voce', () => {
  it('cronometro, scaletta, equazioni una alla volta, registrazione', () => {
    const o = ALL_ORALI.find((x) => (x.lavagna?.length ?? 0) >= 2)!;
    mount(<OralRunner o={o} />);
    fireEvent.click(screen.getByRole('button', { name: /Ho finito, confronta/ }));
    const boxes = screen.getAllByRole('checkbox');
    expect(boxes).toHaveLength(o.scaletta.length);
    fireEvent.click(boxes[0]);
    fireEvent.click(boxes[1]);
    expect(document.querySelectorAll('.lavagna .formula')).toHaveLength(0);
    fireEvent.click(screen.getByRole('button', { name: /Mostra la 1ª equazione/ }));
    expect(document.querySelectorAll('.lavagna .formula')).toHaveLength(1);
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /^Registra: 2 di/ }));
    });
    const log = probe!.oral.at(-1)!;
    expect(log.qid).toBe(o.id);
    expect(log.points).toEqual([0, 1]);
    expect(log.total).toBe(o.scaletta.length);
    expect(probe!.srs[`o:${o.id}`]).toBeDefined();
  });
});
