import { ATTRIBUTION_TEXT } from '../config/attribution';
import { BARRIERS } from '../data/barriers';
import { BENEFITS } from '../data/benefits';
import { ja } from '../data/ja';
import { LAYERS } from '../data/layers';
import type { BarrierLayer, BenefitLayer } from '../data/schema';
import { STAGES } from '../data/types';
import type { Route } from '../logic/urlState';
import { Button, Disclaimer } from '../components/ui';

interface Props {
  navigate: (r: Route) => void;
}

const BENEFIT_LAYERS: BenefitLayer[] = ['firm', 'industry', 'society'];
const BARRIER_LAYERS: BarrierLayer[] = ['cost', 'tech', 'decision'];

export default function Home({ navigate }: Props) {
  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          {ja.app.title}
          <span className="block text-sm font-normal text-gray-500 dark:text-gray-400">{ja.app.subtitle}</span>
        </h1>
        <p className="text-base leading-relaxed max-w-3xl">{ja.home.lead}</p>
        <Disclaimer long />
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => navigate('diagnose')}>{ja.home.startDiagnose}</Button>
          <Button variant="secondary" onClick={() => navigate('simulate')}>
            {ja.home.goSimulate}
          </Button>
          <Button variant="secondary" onClick={() => navigate('explore')}>
            {ja.home.startExplore}
          </Button>
        </div>
      </section>

      {/* 3 軸の概念図 */}
      <section aria-labelledby="axes-title" className="space-y-3">
        <h2 id="axes-title" className="text-lg font-bold">
          {ja.home.axesTitle}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-3">
            <h3 className="font-bold">{ja.home.axisD}</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{ja.home.axisDDesc}</p>
            <ol className="grid grid-cols-2 gap-1">
              {STAGES.filter((s) => s.id !== 'D-').map((s) => (
                <li key={s.id} className="rounded border border-gray-200 dark:border-gray-700 px-2 py-1 text-xs">
                  <span className="font-mono text-gray-500 dark:text-gray-400">{s.id}</span> {s.name}
                </li>
              ))}
            </ol>
          </div>
          <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-3">
            <h3 className="font-bold">{ja.home.axisB}</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{ja.home.axisBDesc}</p>
            {BENEFIT_LAYERS.map((l) => (
              <div key={l} className="mb-1.5">
                <div className="flex items-center gap-1 text-xs font-medium">
                  <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: LAYERS[l].color }} aria-hidden="true" />
                  {LAYERS[l].label}
                </div>
                <ul className="flex flex-wrap gap-1 mt-0.5">
                  {BENEFITS.filter((b) => b.layer === l).map((b) => (
                    <li key={b.id} className={`rounded px-1.5 py-0.5 text-[11px] ${LAYERS[l].badgeClass}`} title={`${b.id} ${b.name}`}>
                      {b.tagline}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-3">
            <h3 className="font-bold">{ja.home.axisW}</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{ja.home.axisWDesc}</p>
            {BARRIER_LAYERS.map((l) => (
              <div key={l} className="mb-1.5">
                <div className="flex items-center gap-1 text-xs font-medium">
                  <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: LAYERS[l].color }} aria-hidden="true" />
                  {LAYERS[l].label}
                  {l === 'decision' && <span className="text-[10px] text-red-700 dark:text-red-300">{ja.home.distinctShort}</span>}
                </div>
                <ul className="flex flex-wrap gap-1 mt-0.5">
                  {BARRIERS.filter((w) => w.layer === l).map((w) => (
                    <li key={w.id} className={`rounded px-1.5 py-0.5 text-[11px] ${LAYERS[l].badgeClass}`} title={`${w.id} ${w.name}`}>
                      {w.tagline}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-bold mb-2">{ja.home.howToTitle}</h2>
          <ol className="list-decimal pl-5 space-y-1 text-sm">
            {ja.home.howTo.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ol>
          <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">{ja.home.howToNote}</p>
        </div>
        <div>
          <h2 className="text-lg font-bold mb-2">{ja.home.coreTitle}</h2>
          <ul className="space-y-1 text-sm">
            {ja.home.core.map((t) => (
              <li key={t} className="rounded border-l-4 border-blue-500 bg-gray-50 dark:bg-gray-900 px-3 py-1.5">
                {t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <p className="text-xs text-gray-600 dark:text-gray-400">{ATTRIBUTION_TEXT}</p>
    </div>
  );
}
