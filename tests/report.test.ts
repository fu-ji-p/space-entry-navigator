import { describe, expect, it } from 'vitest';
import { evaluateInsights } from '../src/logic/insights';
import { buildMarkdown, topBenefits } from '../src/logic/report';
import { computeScores, DEFAULT_INPUT } from '../src/logic/score';

describe('report', () => {
  it('Markdown に類型・上位便益 5 件・障壁 5 件・考察・免責・生成日時が含まれる', () => {
    const input = { ...DEFAULT_INPUT, motives: ['profit' as const] };
    const scores = computeScores(input);
    const insights = evaluateInsights(input, scores);
    const md = buildMarkdown({ input, scores, insights, generatedAt: new Date(2026, 10, 6, 9, 5) });
    expect(md).toContain('2026-11-06 09:05');
    expect(md).toContain('D3 宇宙ソリューション提供型');
    expect(md).toContain('D- 未関与');
    for (const { id } of topBenefits(scores)) expect(md).toContain(`| ${id} |`);
    for (const id of ['W1-1', 'W1-2', 'W2-1', 'W2-2', 'W3']) expect(md).toContain(`| ${id} |`);
    for (const ins of insights) expect(md).toContain(ins.title);
    expect(md).toContain('予測ではなく');
    expect(md).toContain('学術論文の分類枠組み');
    expect(md).toContain('動機に合致');
    expect(md).toContain('数値的な根拠はありません');
    expect(md).toMatch(/\| 高 \|/);
    expect(md).not.toMatch(/\| \d+ \|/);
  });

  it('上位便益は 5 件、降順', () => {
    const top = topBenefits(computeScores(DEFAULT_INPUT));
    expect(top.length).toBe(5);
    for (let i = 1; i < top.length; i++) expect(top[i - 1].score).toBeGreaterThanOrEqual(top[i].score);
  });
});
