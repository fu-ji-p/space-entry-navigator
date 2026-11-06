import { describe, expect, it } from 'vitest';
import type { SimInput } from '../src/data/schema';
import { INSIGHT_RULES, MAX_INSIGHTS } from '../src/data/insights';
import { evaluateInsights } from '../src/logic/insights';
import { computeScores, DEFAULT_INPUT } from '../src/logic/score';
import { toBand } from '../src/logic/band';

const ids = (input: SimInput) => evaluateInsights(input, computeScores(input)).map((i) => i.id);
const allIds = (input: SimInput) =>
  evaluateInsights(input, computeScores(input), INSIGHT_RULES, 100).map((i) => i.id);

describe('考察ルール', () => {
  it('ルール ID は仕様の 12 件', () => {
    expect(INSIGHT_RULES.map((r) => r.id)).toEqual([
      'unknown-high',
      'mission-driven',
      'space-only',
      'scarcity',
      'stepping-stone',
      'tech-growth',
      'efficiency-only',
      'big-leap',
      'spillover-focus',
      'low-conviction',
      'cluster',
      'balanced',
    ]);
  });

  it('最大 5 件、優先度順', () => {
    const input: SimInput = {
      ...DEFAULT_INPUT,
      current: 'D-',
      target: 'D5',
      capital: 1,
      patience: 1,
      techFit: 1,
      spaceKnow: 1,
      conviction: 1,
      motives: ['mission', 'tech', 'spillover'],
      spaceOnlyValue: true,
    };
    const result = evaluateInsights(input, computeScores(input));
    expect(result.length).toBe(MAX_INSIGHTS);
    const priorities = result.map((r) => r.priority);
    expect([...priorities].sort((a, b) => a - b)).toEqual(priorities);
    expect(result[0].id).toBe('unknown-high');
  });

  it('unknown-high: W3 が「高」で発火', () => {
    const input: SimInput = { ...DEFAULT_INPUT, target: 'D3', conviction: 1 };
    expect(toBand(computeScores(input).barriers.W3)).toBe('high');
    expect(allIds(input)).toContain('unknown-high');
    const calm: SimInput = { ...DEFAULT_INPUT, current: 'D2', target: 'D2', conviction: 5 };
    expect(toBand(computeScores(calm).barriers.W3)).not.toBe('high');
    expect(allIds(calm)).not.toContain('unknown-high');
  });

  it('mission-driven: mission を含み W3 が「中」以上', () => {
    const input: SimInput = { ...DEFAULT_INPUT, motives: ['mission'], conviction: 3 };
    expect(toBand(computeScores(input).barriers.W3)).not.toBe('low');
    expect(allIds(input)).toContain('mission-driven');
    expect(allIds({ ...input, motives: [] })).not.toContain('mission-driven');
  });

  it('space-only: spaceOnlyValue が真', () => {
    expect(allIds({ ...DEFAULT_INPUT, spaceOnlyValue: true })).toContain('space-only');
    expect(allIds({ ...DEFAULT_INPUT, spaceOnlyValue: false })).not.toContain('space-only');
  });

  it('scarcity: 公的支援なしで W1-1 が「高」', () => {
    const input: SimInput = { ...DEFAULT_INPUT, target: 'D4', capital: 1, usePublicFunds: false };
    expect(toBand(computeScores(input).barriers['W1-1'])).toBe('high');
    expect(allIds(input)).toContain('scarcity');
    expect(allIds({ ...input, usePublicFunds: true })).not.toContain('scarcity');
  });

  it('stepping-stone: 公的支援を活用する前提', () => {
    expect(allIds({ ...DEFAULT_INPUT, usePublicFunds: true })).toContain('stepping-stone');
    expect(allIds({ ...DEFAULT_INPUT, usePublicFunds: false })).not.toContain('stepping-stone');
  });

  it('tech-growth: W2-1 が「中」以上で tech または org', () => {
    const input: SimInput = { ...DEFAULT_INPUT, target: 'D4', techFit: 1, spaceKnow: 1, motives: ['org'] };
    expect(toBand(computeScores(input).barriers['W2-1'])).not.toBe('low');
    expect(allIds(input)).toContain('tech-growth');
    expect(allIds({ ...input, motives: ['profit'] })).not.toContain('tech-growth');
  });

  it('efficiency-only: 目標が D1', () => {
    expect(allIds({ ...DEFAULT_INPUT, target: 'D1' })).toContain('efficiency-only');
    expect(allIds({ ...DEFAULT_INPUT, target: 'D2' })).not.toContain('efficiency-only');
  });

  it('big-leap: 段数差 3 以上', () => {
    expect(allIds({ ...DEFAULT_INPUT, current: 'D-', target: 'D3' })).toContain('big-leap');
    expect(allIds({ ...DEFAULT_INPUT, current: 'D1', target: 'D3' })).not.toContain('big-leap');
  });

  it('spillover-focus: spillover を含み目標が D5', () => {
    expect(allIds({ ...DEFAULT_INPUT, target: 'D5', motives: ['spillover'] })).toContain('spillover-focus');
    expect(allIds({ ...DEFAULT_INPUT, target: 'D4', motives: ['spillover'] })).not.toContain('spillover-focus');
  });

  it('low-conviction: 納得度 2 以下', () => {
    expect(allIds({ ...DEFAULT_INPUT, conviction: 2 })).toContain('low-conviction');
    expect(allIds({ ...DEFAULT_INPUT, conviction: 3 })).not.toContain('low-conviction');
  });

  it('cluster: 目標が D4 または D5', () => {
    expect(allIds({ ...DEFAULT_INPUT, target: 'D4' })).toContain('cluster');
    expect(allIds({ ...DEFAULT_INPUT, target: 'D5' })).toContain('cluster');
    expect(allIds({ ...DEFAULT_INPUT, target: 'D3' })).not.toContain('cluster');
  });

  it('balanced: 他のどれにも該当しないときだけ', () => {
    const quiet: SimInput = { ...DEFAULT_INPUT, current: 'D2', target: 'D2', conviction: 5, capital: 5 };
    const result = ids(quiet);
    expect(result).toEqual(['balanced']);
    expect(ids(DEFAULT_INPUT)).not.toContain('balanced');
  });
});
