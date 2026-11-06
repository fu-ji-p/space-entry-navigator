import type { Band } from './schema';

// 表示用の段階（低・中・高）。内部スコア（0〜100）はこの閾値で 3 段階に丸めて表示する。
// 数値そのものに論文上の根拠はないため、画面には段階（記号と文字）だけを出す。
export const BANDS: Band[] = ['low', 'mid', 'high'];

// score < MID_FROM → 低、score < HIGH_FROM → 中、それ以外 → 高
export const BAND_THRESHOLDS = {
  MID_FROM: 34,
  HIGH_FROM: 67,
};

export const BAND_LEVEL: Record<Band, 1 | 2 | 3> = { low: 1, mid: 2, high: 3 };
export const MAX_LEVEL = 3;

// 段階を表す記号。便益は ★、障壁は ▲（★は「良い」の含みがあるため障壁には使わない）。
export const BAND_SYMBOLS = {
  benefit: { filled: '★', empty: '☆' },
  barrier: { filled: '▲', empty: '△' },
} as const;
export type RatingKind = keyof typeof BAND_SYMBOLS;
