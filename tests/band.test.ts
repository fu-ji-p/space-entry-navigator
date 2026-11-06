import { describe, expect, it } from 'vitest';
import { BAND_THRESHOLDS } from '../src/data/bands';
import { atLeast, bandLevel, toBand } from '../src/logic/band';
import { computeScores, DEFAULT_INPUT } from '../src/logic/score';

describe('段階（低・中・高）', () => {
  it('閾値で 3 段階に丸める', () => {
    expect(toBand(0)).toBe('low');
    expect(toBand(BAND_THRESHOLDS.MID_FROM - 0.1)).toBe('low');
    expect(toBand(BAND_THRESHOLDS.MID_FROM)).toBe('mid');
    expect(toBand(BAND_THRESHOLDS.HIGH_FROM - 0.1)).toBe('mid');
    expect(toBand(BAND_THRESHOLDS.HIGH_FROM)).toBe('high');
    expect(toBand(100)).toBe('high');
  });

  it('段階の序数と比較', () => {
    expect(bandLevel(10)).toBe(1);
    expect(bandLevel(50)).toBe(2);
    expect(bandLevel(90)).toBe(3);
    expect(atLeast(50, 'mid')).toBe(true);
    expect(atLeast(50, 'high')).toBe(false);
    expect(atLeast(90, 'low')).toBe(true);
  });

  it('関連度 1・2・3 が既定では 低・中・高 に対応する', () => {
    const s = computeScores({ ...DEFAULT_INPUT, current: 'D3', target: 'D3' });
    // D3: B2-2 は関連度 2、B1-1 は 3、B2-5 は 1
    expect(toBand(s.benefits['B2-5'])).toBe('low');
    expect(toBand(s.benefits['B2-2'])).toBe('mid');
    expect(toBand(s.benefits['B1-1'])).toBe('high');
  });
});
