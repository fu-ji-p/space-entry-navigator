import { BAND_LEVEL, BAND_THRESHOLDS } from '../data/bands';
import type { Band } from '../data/schema';

/** 内部スコア（0〜100）を表示用の 3 段階に丸める */
export function toBand(score: number): Band {
  if (score < BAND_THRESHOLDS.MID_FROM) return 'low';
  if (score < BAND_THRESHOLDS.HIGH_FROM) return 'mid';
  return 'high';
}

/** 段階を 1〜3 の整数にする（チャートの棒の長さに使う） */
export function bandLevel(score: number): 1 | 2 | 3 {
  return BAND_LEVEL[toBand(score)];
}

/** score の段階が band 以上か */
export function atLeast(score: number, band: Band): boolean {
  return BAND_LEVEL[toBand(score)] >= BAND_LEVEL[band];
}
