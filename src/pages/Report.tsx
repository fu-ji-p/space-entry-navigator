import { useMemo } from 'react';
import { ATTRIBUTION_TEXT } from '../config/attribution';
import InsightList from '../components/InsightList';
import { Button, Disclaimer, LayerBadge } from '../components/ui';
import { BARRIER_BY_ID } from '../data/barriers';
import { BENEFIT_BY_ID } from '../data/benefits';
import { ja, SLIDER_KEYS } from '../data/ja';
import type { SimInput } from '../data/schema';
import { STAGE_BY_ID } from '../data/types';
import { useFlash } from '../hooks';
import { toBand } from '../logic/band';
import { evaluateInsights } from '../logic/insights';
import { barriersDesc, buildMarkdown, formatDateTime, topBenefits } from '../logic/report';
import { computeScores, motiveBenefitIds } from '../logic/score';
import { buildShareUrl } from '../logic/urlState';

interface Props {
  input: SimInput;
}

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through */
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

export default function Report({ input }: Props) {
  const scores = useMemo(() => computeScores(input), [input]);
  const insights = useMemo(() => evaluateInsights(input, scores), [input, scores]);
  const generatedAt = useMemo(() => new Date(), [input]); // eslint-disable-line react-hooks/exhaustive-deps
  const shareUrl = useMemo(() => buildShareUrl(input), [input]);
  const markdown = useMemo(
    () => buildMarkdown({ input, scores, insights, generatedAt, shareUrl }),
    [input, scores, insights, generatedAt, shareUrl],
  );
  const [flash, setFlash] = useFlash();
  const highlighted = motiveBenefitIds(input);
  const r = ja.report;

  const doCopy = async (text: string) => {
    const ok = await copyText(text);
    setFlash(ok ? r.copied : r.copyFailed);
  };

  return (
    <div className="space-y-6">
      <div className="no-print space-y-3">
        <h1 className="text-2xl font-bold">{ja.nav.report}</h1>
        <p className="text-sm text-gray-700 dark:text-gray-300 max-w-3xl">{r.lead}</p>
        <div className="flex flex-wrap gap-2 items-center">
          <Button onClick={() => doCopy(markdown)}>{r.copyMarkdown}</Button>
          <Button variant="secondary" onClick={() => doCopy(shareUrl)}>
            {r.copyUrl}
          </Button>
          <Button variant="secondary" onClick={() => window.print()}>
            {r.print}
          </Button>
          <span role="status" aria-live="polite" className="text-sm text-emerald-700 dark:text-emerald-300 min-h-[1.25rem]">
            {flash ?? ''}
          </span>
        </div>
      </div>

      <article className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 sm:p-6 space-y-6 max-w-3xl print:border-0 print:p-0 print:max-w-none">
        <header>
          <h2 className="text-xl font-bold">{r.title}</h2>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {r.generatedAt}: {formatDateTime(generatedAt)}
          </p>
        </header>

        <section>
          <h3 className="font-bold border-b border-gray-200 dark:border-gray-700 pb-1 mb-2">{r.stageSection}</h3>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
            <dt className="text-gray-600 dark:text-gray-400">{ja.simulate.currentLabel}</dt>
            <dd>
              {input.current} {STAGE_BY_ID[input.current].name}
            </dd>
            <dt className="text-gray-600 dark:text-gray-400">{ja.simulate.targetLabel}</dt>
            <dd>
              {input.target} {STAGE_BY_ID[input.target].name}
            </dd>
            <dt className="text-gray-600 dark:text-gray-400">{ja.simulate.gapLabel}</dt>
            <dd>{scores.gap}</dd>
          </dl>
        </section>

        <section>
          <h3 className="font-bold border-b border-gray-200 dark:border-gray-700 pb-1 mb-2">{r.inputSection}</h3>
          <ul className="text-sm space-y-0.5">
            {SLIDER_KEYS.map((k) => (
              <li key={k}>
                {ja.sliders[k].label}: {input[k]} / 5（{ja.sliders[k].levels[input[k]]}）
              </li>
            ))}
            <li>
              {r.motivesLabel}: {input.motives.length ? input.motives.map((m) => ja.motives[m]).join('、') : r.motivesNone}
            </li>
            <li>{input.usePublicFunds ? r.publicFundsYes : r.publicFundsNo}</li>
            <li>{input.spaceOnlyValue ? r.spaceOnlyYes : r.spaceOnlyNo}</li>
          </ul>
        </section>

        <section>
          <h3 className="font-bold border-b border-gray-200 dark:border-gray-700 pb-1 mb-2">{r.topBenefits}</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-600 dark:text-gray-400">
                <th scope="col" className="py-1 pr-2 font-medium">{ja.chart.colId}</th>
                <th scope="col" className="py-1 pr-2 font-medium">{ja.chart.colName}</th>
                <th scope="col" className="py-1 pr-2 font-medium">{ja.chart.colLayer}</th>
                <th scope="col" className="py-1 text-right font-medium">{ja.chart.colScore}</th>
              </tr>
            </thead>
            <tbody>
              {topBenefits(scores).map(({ id, score }) => {
                const b = BENEFIT_BY_ID[id];
                return (
                  <tr key={id} className="border-t border-gray-100 dark:border-gray-800">
                    <td className="py-1 pr-2 font-mono text-xs whitespace-nowrap">{id}</td>
                    <td className="py-1 pr-2">
                      <span className="font-semibold">【{b.tagline}】</span>
                      {b.name}
                      {highlighted.has(id) && <span className="ml-1 text-xs text-blue-700 dark:text-blue-300">（{ja.simulate.motiveMatch}）</span>}
                    </td>
                    <td className="py-1 pr-2">
                      <LayerBadge layer={b.layer} />
                    </td>
                    <td className="py-1 text-right">{ja.bands[toBand(score)]}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        <section>
          <h3 className="font-bold border-b border-gray-200 dark:border-gray-700 pb-1 mb-2">{r.barriers}</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-600 dark:text-gray-400">
                <th scope="col" className="py-1 pr-2 font-medium">{ja.chart.colId}</th>
                <th scope="col" className="py-1 pr-2 font-medium">{ja.chart.colName}</th>
                <th scope="col" className="py-1 pr-2 font-medium">{ja.chart.colLayer}</th>
                <th scope="col" className="py-1 text-right font-medium">{ja.chart.colScore}</th>
              </tr>
            </thead>
            <tbody>
              {barriersDesc(scores).map(({ id, score }) => {
                const w = BARRIER_BY_ID[id];
                return (
                  <tr key={id} className="border-t border-gray-100 dark:border-gray-800">
                    <td className="py-1 pr-2 font-mono text-xs whitespace-nowrap">{id}</td>
                    <td className="py-1 pr-2">
                      <span className="font-semibold">【{w.tagline}】</span>
                      {w.name}
                      {w.distinctNature && <span className="ml-1 text-xs text-red-700 dark:text-red-300">（{r.distinctMark}）</span>}
                    </td>
                    <td className="py-1 pr-2">
                      <LayerBadge layer={w.layer} />
                    </td>
                    <td className="py-1 text-right">{ja.bands[toBand(score)]}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        <p className="text-xs text-gray-600 dark:text-gray-400">{r.bandNote}</p>

        <section>
          <h3 className="font-bold border-b border-gray-200 dark:border-gray-700 pb-1 mb-2">{r.insights}</h3>
          <InsightList insights={insights} />
        </section>

        <section className="space-y-2">
          <h3 className="font-bold border-b border-gray-200 dark:border-gray-700 pb-1 mb-2">{r.disclaimerSection}</h3>
          <Disclaimer long />
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {r.sourceLabel}: {ATTRIBUTION_TEXT}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 break-all">
            {ja.nav.simulate} URL: {shareUrl}
          </p>
        </section>
      </article>
    </div>
  );
}
