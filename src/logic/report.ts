import type { BarrierId, BenefitId, SimInput, SimScores } from '../data/schema';
import { ATTRIBUTION_TEXT } from '../config/attribution';
import { BENEFITS, BENEFIT_BY_ID } from '../data/benefits';
import { BARRIERS } from '../data/barriers';
import { ja, SLIDER_KEYS } from '../data/ja';
import { STAGE_BY_ID } from '../data/types';
import { ratingGlyphs, toBand } from './band';
import type { Insight } from './insights';
import { motiveBenefitIds } from './score';

export const TOP_BENEFITS = 5;

export interface ReportData {
  input: SimInput;
  scores: SimScores;
  insights: Insight[];
  generatedAt: Date;
  shareUrl?: string;
}

export function topBenefits(scores: SimScores, n = TOP_BENEFITS): { id: BenefitId; score: number }[] {
  return BENEFITS.map((b) => ({ id: b.id, score: scores.benefits[b.id] }))
    .sort((a, b) => b.score - a.score)
    .slice(0, n);
}

export function barriersDesc(scores: SimScores): { id: BarrierId; score: number }[] {
  return BARRIERS.map((w) => ({ id: w.id, score: scores.barriers[w.id] })).sort((a, b) => b.score - a.score);
}

export function formatDateTime(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function stageLabel(id: SimInput['current']): string {
  const s = STAGE_BY_ID[id];
  return `${s.id} ${s.name}`;
}

export function buildMarkdown(data: ReportData): string {
  const { input, scores, insights, generatedAt, shareUrl } = data;
  const r = ja.report;
  const lines: string[] = [];
  lines.push(`# ${r.title}`);
  lines.push('');
  lines.push(`${r.generatedAt}: ${formatDateTime(generatedAt)}`);
  lines.push('');
  lines.push(`## ${r.stageSection}`);
  lines.push('');
  lines.push(`- ${ja.simulate.currentLabel}: ${stageLabel(input.current)}`);
  lines.push(`- ${ja.simulate.targetLabel}: ${stageLabel(input.target)}`);
  lines.push(`- ${ja.simulate.gapLabel}: ${scores.gap}`);
  lines.push('');
  lines.push(`## ${r.inputSection}`);
  lines.push('');
  for (const key of SLIDER_KEYS) {
    const s = ja.sliders[key];
    lines.push(`- ${s.label}: ${input[key]} / 5（${s.levels[input[key]]}）`);
  }
  const motives = input.motives.length > 0 ? input.motives.map((m) => ja.motives[m]).join('、') : r.motivesNone;
  lines.push(`- ${r.motivesLabel}: ${motives}`);
  lines.push(`- ${input.usePublicFunds ? r.publicFundsYes : r.publicFundsNo}`);
  lines.push(`- ${input.spaceOnlyValue ? r.spaceOnlyYes : r.spaceOnlyNo}`);
  lines.push('');
  lines.push(`## ${r.topBenefits}`);
  lines.push('');
  const highlighted = motiveBenefitIds(input);
  lines.push(`| ${ja.chart.colId} | ${ja.chart.colName} | ${ja.chart.colLayer} | ${ja.chart.colScore} |`);
  lines.push('| --- | --- | --- | --- |');
  for (const { id, score } of topBenefits(scores)) {
    const b = BENEFIT_BY_ID[id];
    const mark = highlighted.has(id) ? ` (${ja.simulate.motiveMatch})` : '';
    lines.push(`| ${b.id} | 【${b.tagline}】${b.name}${mark} | ${ja.layers[b.layer]} | ${ratingGlyphs(toBand(score), 'benefit')} ${ja.bands[toBand(score)]} |`);
  }
  lines.push('');
  lines.push(`## ${r.barriers}`);
  lines.push('');
  lines.push(`| ${ja.chart.colId} | ${ja.chart.colName} | ${ja.chart.colLayer} | ${ja.chart.colScore} |`);
  lines.push('| --- | --- | --- | --- |');
  for (const { id, score } of barriersDesc(scores)) {
    const w = BARRIERS.find((x) => x.id === id)!;
    const mark = w.distinctNature ? ` (${r.distinctMark})` : '';
    lines.push(`| ${w.id} | 【${w.tagline}】${w.name}${mark} | ${ja.layers[w.layer]} | ${ratingGlyphs(toBand(score), 'barrier')} ${ja.bands[toBand(score)]} |`);
  }
  lines.push('');
  lines.push(r.bandNote);
  lines.push('');
  lines.push(`## ${r.insights}`);
  lines.push('');
  insights.forEach((ins, i) => {
    lines.push(`${i + 1}. **${ins.title}** ${ins.body}`);
  });
  lines.push('');
  if (shareUrl) {
    lines.push(`${ja.nav.simulate} URL: ${shareUrl}`);
    lines.push('');
  }
  lines.push(`## ${r.disclaimerSection}`);
  lines.push('');
  lines.push(ja.app.disclaimer);
  lines.push(ja.app.disclaimerLong);
  lines.push('');
  lines.push(`${r.sourceLabel}: ${ATTRIBUTION_TEXT}`);
  lines.push('');
  return lines.join('\n');
}
