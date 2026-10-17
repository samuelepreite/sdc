// @vitest-environment jsdom
/** Lezione (interfaccia): si avanza solo completando il passo; derivazione con «prova tu»; a fine lezione domande e orale. */
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import { StateProvider, useApp } from '../src/ui/state';
import { LessonPage, visualAt } from '../src/ui/components/Lesson';
import { OralRunner } from '../src/ui/pages/orale';
import { ALL_LESSONS } from '../src/content/lezioni';
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
  it('ogni lezione si percorre fino in fondo: «Avanti» bloccato finché il passo non è completo; a fine lezione domande e orale', () => {
    for (const l of ALL_LESSONS) {
      const { unmount } = mount(<LessonPage id={l.concept} />);
      expect(screen.getByRole('heading', { name: l.title })).toBeTruthy();
      expect(screen.queryByRole('button', { name: 'chiaro' })).toBeNull(); // niente più giudizi sui passi
      for (let i = 0; i < l.steps.length; i++) {
        const st = l.steps[i];
        const act = () => document.querySelector('.lesson-step.active') as HTMLElement;
        if (st.kind === 'domanda') {
          expect(screen.queryByRole('button', { name: /^Avanti$/ }), `${l.concept} ${st.id}`).toBeNull();
          const q = st.q;
          if (q.kind === 'vf') fireEvent.click([...act().querySelectorAll('.recall .seg button')].find((b) => b.textContent === (q.answer ? 'Vero' : 'Falso'))!);
          else if (q.kind === 'scelta') fireEvent.click(act().querySelectorAll('.recall .options button')[q.correct]);
          else {
            fireEvent.click([...act().querySelectorAll('button')].find((b) => /mostra la risposta/.test(b.textContent ?? ''))!);
            fireEvent.click([...act().querySelectorAll('button')].find((b) => b.textContent === 'Bene')!);
          }
          expect(probe!.recall.some((r) => r.qid === `lezione:${q.id}` && r.correct), `${l.concept} ${q.id}`).toBe(true);
        }
        if (st.kind === 'derivazione') {
          for (let g = 0; g < 200; g++) {
            const opt = act().querySelector('.deriv-next .option:not([disabled])') as HTMLButtonElement | null;
            const btn = [...act().querySelectorAll('.deriv-next button')].find((b) => /^(Cominciamo|Passaggio successivo|Scrivi il passaggio)$/.test(b.textContent ?? '')) as HTMLButtonElement | undefined;
            if (opt) fireEvent.click(opt);
            else if (btn) fireEvent.click(btn);
            else break;
          }
          expect(act().querySelectorAll('.deriv-line').length, `${l.concept} ${st.id}`).toBe(st.der.lines.length);
        }
        if (i < l.steps.length - 1) fireEvent.click(avanti());
      }
      fireEvent.click(screen.getByRole('button', { name: 'Ho finito la lezione' }));
      expect(probe!.lessons[l.concept].doneAt, l.concept).toBeDefined();
      expect(screen.getByRole('heading', { name: 'Mettiti alla prova' })).toBeTruthy();
      expect(document.querySelectorAll('.lesson-after .recall').length).toBeGreaterThan(0);
      unmount();
    }
  }, 120000);
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
