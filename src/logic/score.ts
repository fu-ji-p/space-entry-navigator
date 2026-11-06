import type { BarrierId, BenefitId, SimInput, SimScores, SliderKey, StageId } from '../data/schema';
import { BENEFITS } from '../data/benefits';
import { BARRIERS } from '../data/barriers';
import { PAIRS } from '../data/pairs';
import { barrierBase, benefitRelevance } from '../data/relevance';
import { STAGE_ORDER } from '../data/types';
import {
  BARRIER_K,
  BENEFIT_BASE_SCALE,
  GAP_FACTOR,
  MOTIVE_BENEFITS,
  MOTIVE_FACTOR,
  PUBLIC_FUNDS_BARRIER,
  PUBLIC_FUNDS_BENEFIT,
  SCARCITY_FACTOR,
  SCORE_MAX,
  SPACE_ONLY_BARRIER,
  SPACE_ONLY_BENEFIT,
} from '../data/weights';

export const DEFAULT_INPUT: SimInput = {
  current: 'D-',
  target: 'D3',
  capital: 3,
  patience: 3,
  techFit: 3,
  spaceKnow: 3,
  conviction: 3,
  motives: [],
  usePublicFunds: false,
  spaceOnlyValue: false,
};

const clip = (v: number) => Math.max(0, Math.min(SCORE_MAX, v));
const round1 = (v: number) => Math.round(v * 10) / 10;

/** 目標と現在地の段数差。目標が現在地以下なら 0。 */
export function stageGap(current: StageId, target: StageId): number {
  return Math.max(0, STAGE_ORDER[target] - STAGE_ORDER[current]);
}

/** 障壁に紐づくスライダー値の平均（1〜5）。紐づきがなければ 1 とみなす（下げられない）。 */
function resourceLevel(input: SimInput, keys: SliderKey[] | undefined): number {
  if (!keys || keys.length === 0) return 1;
  return keys.reduce((sum, k) => sum + input[k], 0) / keys.length;
}

export function computeBarriers(input: SimInput): Record<BarrierId, number> {
  const gap = stageGap(input.current, input.target);
  const out = {} as Record<BarrierId, number>;
  for (const w of BARRIERS) {
    const base = barrierBase(w.id, input.target);
    const r = resourceLevel(input, w.loweredBy);
    const k = BARRIER_K[w.id];
    let score = SCORE_MAX * (base / 3) * (1 - k * ((r - 1) / 4)) * (1 + GAP_FACTOR * gap);
    if (input.usePublicFunds) score *= PUBLIC_FUNDS_BARRIER[w.id] ?? 1;
    if (input.spaceOnlyValue) score *= SPACE_ONLY_BARRIER[w.id] ?? 1;
    out[w.id] = round1(clip(score));
  }
  return out;
}

/** 便益 b の裏側にある障壁グループの代表スコア（グループ内の最大値）。対応がなければ 0。 */
function pairedBarrierScore(benefitId: BenefitId, barriers: Record<BarrierId, number>): number {
  let max = 0;
  for (const p of PAIRS) {
    if (!p.benefits.includes(benefitId)) continue;
    for (const w of p.barriers) max = Math.max(max, barriers[w]);
  }
  return max;
}

export function computeBenefits(input: SimInput, barriers: Record<BarrierId, number>): Record<BenefitId, number> {
  const motiveTargets = new Set<BenefitId>();
  for (const m of input.motives) for (const b of MOTIVE_BENEFITS[m]) motiveTargets.add(b);

  const out = {} as Record<BenefitId, number>;
  for (const b of BENEFITS) {
    const rel = benefitRelevance(b.id, input.target);
    const m = motiveTargets.has(b.id) ? MOTIVE_FACTOR : 1;
    const paired = pairedBarrierScore(b.id, barriers);
    const s = paired > 0 ? 1 + SCARCITY_FACTOR * (paired / SCORE_MAX) : 1;
    const p = input.usePublicFunds ? (PUBLIC_FUNDS_BENEFIT[b.id] ?? 1) : 1;
    const o = input.spaceOnlyValue ? (SPACE_ONLY_BENEFIT[b.id] ?? 1) : 1;
    out[b.id] = round1(clip(SCORE_MAX * BENEFIT_BASE_SCALE * (rel / 3) * m * s * p * o));
  }
  return out;
}

export function computeScores(input: SimInput): SimScores {
  const barriers = computeBarriers(input);
  const benefits = computeBenefits(input, barriers);
  return { benefits, barriers, gap: stageGap(input.current, input.target) };
}

/** 動機に対応する便益 ID の集合（UI の強調用） */
export function motiveBenefitIds(input: SimInput): Set<BenefitId> {
  const set = new Set<BenefitId>();
  for (const m of input.motives) for (const b of MOTIVE_BENEFITS[m]) set.add(b);
  return set;
}
