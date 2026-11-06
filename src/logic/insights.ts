import type { InsightRule, SimInput, SimScores } from '../data/schema';
import { INSIGHT_RULES, MAX_INSIGHTS } from '../data/insights';

export interface Insight {
  id: string;
  priority: number;
  title: string;
  body: string;
}

/** 条件に合致した考察ルールを優先度順に最大 MAX_INSIGHTS 件返す。どれにも該当しなければ fallback ルール。 */
export function evaluateInsights(
  input: SimInput,
  scores: SimScores,
  rules: InsightRule[] = INSIGHT_RULES,
  max: number = MAX_INSIGHTS,
): Insight[] {
  const matched = rules
    .filter((r) => !r.fallback && r.when(input, scores))
    .sort((a, b) => a.priority - b.priority);
  const chosen = matched.length > 0 ? matched : rules.filter((r) => r.fallback);
  return chosen.slice(0, max).map(({ id, priority, title, body }) => ({ id, priority, title, body }));
}
