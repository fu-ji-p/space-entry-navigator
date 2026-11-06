import { describe, expect, it } from 'vitest';
import type { Level, SimInput } from '../src/data/schema';
import { BARRIERS } from '../src/data/barriers';
import { BENEFITS } from '../src/data/benefits';
import { barrierBase } from '../src/data/relevance';
import { BARRIER_K } from '../src/data/weights';
import { computeScores, DEFAULT_INPUT, stageGap } from '../src/logic/score';

const withLevels = (base: SimInput, level: Level): SimInput => ({
  ...base,
  capital: level,
  patience: level,
  techFit: level,
  spaceKnow: level,
  conviction: level,
});

describe('stageGap', () => {
  it('D- から D5 は 6、同じなら 0、縮小は 0', () => {
    expect(stageGap('D-', 'D5')).toBe(6);
    expect(stageGap('D3', 'D3')).toBe(0);
    expect(stageGap('D4', 'D1')).toBe(0);
    expect(stageGap('D1', 'D3')).toBe(2);
  });
});

describe('障壁スコア', () => {
  it('スライダー全て 5 で最小、全て 1 で最大（単調性）', () => {
    const base: SimInput = { ...DEFAULT_INPUT, current: 'D1', target: 'D4' };
    const lo = computeScores(withLevels(base, 1)).barriers;
    const mid = computeScores(withLevels(base, 3)).barriers;
    const hi = computeScores(withLevels(base, 5)).barriers;
    for (const w of BARRIERS) {
      expect(lo[w.id]).toBeGreaterThanOrEqual(mid[w.id]);
      expect(mid[w.id]).toBeGreaterThanOrEqual(hi[w.id]);
      expect(lo[w.id]).toBeGreaterThan(hi[w.id]);
    }
  });

  it('全ステージで、各スライダーを 1 段上げても障壁は増えない', () => {
    for (const target of ['D0', 'D1', 'D2', 'D3', 'D4', 'D5'] as const) {
      for (const key of ['capital', 'patience', 'techFit', 'spaceKnow', 'conviction'] as const) {
        for (let lv = 1; lv < 5; lv++) {
          const a = computeScores({ ...DEFAULT_INPUT, target, [key]: lv as Level }).barriers;
          const b = computeScores({ ...DEFAULT_INPUT, target, [key]: (lv + 1) as Level }).barriers;
          for (const w of BARRIERS) expect(b[w.id]).toBeLessThanOrEqual(a[w.id]);
        }
      }
    }
  });

  it('W3 はスライダー最大でも base×0.6 以上残る（k=0.4）', () => {
    expect(BARRIER_K.W3).toBeCloseTo(0.4);
    for (const target of ['D0', 'D1', 'D2', 'D3', 'D4', 'D5'] as const) {
      const input = withLevels({ ...DEFAULT_INPUT, current: target, target }, 5);
      const w3 = computeScores(input).barriers.W3;
      const floor = 100 * (barrierBase('W3', target) / 3) * 0.6;
      expect(w3).toBeGreaterThanOrEqual(floor - 1e-6);
      expect(w3).toBeGreaterThan(0);
    }
  });

  it('全スライダー最大でも W3 は 0 にならない（既定の目標 D3）', () => {
    const w3 = computeScores(withLevels(DEFAULT_INPUT, 5)).barriers.W3;
    expect(w3).toBeGreaterThan(0);
  });

  it('段数差が大きいほど障壁が高い', () => {
    const near = computeScores({ ...DEFAULT_INPUT, current: 'D2', target: 'D3' }).barriers;
    const far = computeScores({ ...DEFAULT_INPUT, current: 'D-', target: 'D3' }).barriers;
    for (const w of BARRIERS) expect(far[w.id]).toBeGreaterThanOrEqual(near[w.id]);
    expect(far['W1-1']).toBeGreaterThan(near['W1-1']);
  });

  it('スコアは 0〜100 に収まる', () => {
    const extreme = withLevels({ ...DEFAULT_INPUT, current: 'D-', target: 'D5' }, 1);
    const s = computeScores(extreme);
    for (const w of BARRIERS) {
      expect(s.barriers[w.id]).toBeLessThanOrEqual(100);
      expect(s.barriers[w.id]).toBeGreaterThanOrEqual(0);
    }
    for (const b of BENEFITS) {
      expect(s.benefits[b.id]).toBeLessThanOrEqual(100);
      expect(s.benefits[b.id]).toBeGreaterThanOrEqual(0);
    }
  });

  it('目標が D- なら障壁・便益は全て 0', () => {
    const s = computeScores({ ...DEFAULT_INPUT, target: 'D-' });
    for (const w of BARRIERS) expect(s.barriers[w.id]).toBe(0);
    for (const b of BENEFITS) expect(s.benefits[b.id]).toBe(0);
  });
});

describe('トグル', () => {
  it('usePublicFunds を真にすると W1-1 と B1-5 が下がり B2-2 が上がる', () => {
    const off = computeScores({ ...DEFAULT_INPUT, usePublicFunds: false });
    const on = computeScores({ ...DEFAULT_INPUT, usePublicFunds: true });
    expect(on.barriers['W1-1']).toBeLessThan(off.barriers['W1-1']);
    expect(on.barriers['W1-2']).toBeLessThan(off.barriers['W1-2']);
    expect(on.benefits['B1-5']).toBeLessThan(off.benefits['B1-5']);
    expect(on.benefits['B2-2']).toBeGreaterThan(off.benefits['B2-2']);
    // 他の障壁は変わらない
    expect(on.barriers.W3).toBe(off.barriers.W3);
  });

  it('spaceOnlyValue を真にすると W3 が下がり B2-6 が上がる', () => {
    const off = computeScores({ ...DEFAULT_INPUT, spaceOnlyValue: false });
    const on = computeScores({ ...DEFAULT_INPUT, spaceOnlyValue: true });
    expect(on.barriers.W3).toBeLessThan(off.barriers.W3);
    expect(on.benefits['B2-6']).toBeGreaterThan(off.benefits['B2-6']);
    expect(on.barriers['W1-1']).toBe(off.barriers['W1-1']);
  });
});

describe('便益スコア', () => {
  it('動機を選ぶと対応する便益が 1.25 倍になる', () => {
    const none = computeScores(DEFAULT_INPUT);
    const profit = computeScores({ ...DEFAULT_INPUT, motives: ['profit'] });
    expect(profit.benefits['B1-1']).toBeCloseTo(Math.min(100, none.benefits['B1-1'] * 1.25), 0);
    expect(profit.benefits['B1-2']).toBe(none.benefits['B1-2']);
  });

  it('society は B3-1・B3-2・B3-3 に効く', () => {
    const none = computeScores(DEFAULT_INPUT);
    const soc = computeScores({ ...DEFAULT_INPUT, motives: ['society'] });
    for (const id of ['B3-1', 'B3-2', 'B3-3'] as const) {
      expect(soc.benefits[id]).toBeGreaterThan(none.benefits[id]);
    }
    expect(soc.benefits['B3-4']).toBe(none.benefits['B3-4']);
  });

  it('希少性: コスト障壁が高いほど B1-5 が高い（表と裏）', () => {
    const rich = computeScores({ ...DEFAULT_INPUT, capital: 5, patience: 5 });
    const poor = computeScores({ ...DEFAULT_INPUT, capital: 1, patience: 1 });
    expect(poor.barriers['W1-1']).toBeGreaterThan(rich.barriers['W1-1']);
    expect(poor.benefits['B1-5']).toBeGreaterThan(rich.benefits['B1-5']);
    // 対応のない便益は変わらない
    expect(poor.benefits['B1-1']).toBe(rich.benefits['B1-1']);
  });

  it('希少性: 技術障壁が高いほど B1-2/B1-3/B1-4 が高い', () => {
    const skilled = computeScores({ ...DEFAULT_INPUT, techFit: 5, spaceKnow: 5 });
    const novice = computeScores({ ...DEFAULT_INPUT, techFit: 1, spaceKnow: 1 });
    for (const id of ['B1-2', 'B1-3', 'B1-4'] as const) {
      expect(novice.benefits[id]).toBeGreaterThan(skilled.benefits[id]);
    }
  });
});
