import { describe, expect, it } from 'vitest';
import { diagnose } from '../src/logic/diagnose';
import { QUESTIONS } from '../src/data/questions';

describe('diagnose', () => {
  it('質問は D0〜D5 の順に 6 問ある', () => {
    expect(QUESTIONS.map((q) => q.stage)).toEqual(['D0', 'D1', 'D2', 'D3', 'D4', 'D5']);
  });

  it('Yes なしなら D-', () => {
    expect(diagnose([false, false, false, false, false, false])).toBe('D-');
    expect(diagnose([])).toBe('D-');
    expect(diagnose([null, undefined, false, null, null, null])).toBe('D-');
  });

  it('D4 と D1 に Yes なら D4', () => {
    expect(diagnose([false, true, false, false, true, false])).toBe('D4');
  });

  it('D0 だけ Yes なら D0、D5 に Yes なら常に D5', () => {
    expect(diagnose([true, false, false, false, false, false])).toBe('D0');
    expect(diagnose([true, true, true, true, true, true])).toBe('D5');
  });

  it('未回答（null）は No と同じ扱い', () => {
    expect(diagnose([null, null, true, null, null, null])).toBe('D2');
  });
});
