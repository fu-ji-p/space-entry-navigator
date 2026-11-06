import { useCallback, useMemo, useState } from 'react';
import { ItemCard, ItemDialog, type ItemRef } from '../components/ItemCard';
import PairDiagram from '../components/PairDiagram';
import { Section } from '../components/ui';
import { BARRIERS } from '../data/barriers';
import { BENEFITS } from '../data/benefits';
import { ja } from '../data/ja';
import { barrierBase, benefitRelevance } from '../data/relevance';
import type { BarrierId, BenefitId, StageId } from '../data/schema';
import { STAGES } from '../data/types';

interface Props {
  stageFilter: StageId | null;
  setStageFilter: (s: StageId | null) => void;
}

const STRONG = 2; // この関連度以上を「関連が強い」とする

export default function Explore({ stageFilter, setStageFilter }: Props) {
  const [dialog, setDialog] = useState<ItemRef | null>(null);
  const closeDialog = useCallback(() => setDialog(null), []);

  const strongBenefits = useMemo(
    () => new Set(stageFilter ? BENEFITS.filter((b) => benefitRelevance(b.id, stageFilter) >= STRONG).map((b) => b.id) : []),
    [stageFilter],
  );
  const strongBarriers = useMemo(
    () => new Set(stageFilter ? BARRIERS.filter((w) => barrierBase(w.id, stageFilter) >= STRONG).map((w) => w.id) : []),
    [stageFilter],
  );

  const openById = (id: BenefitId | BarrierId) =>
    setDialog(id.startsWith('B') ? { kind: 'benefit', id: id as BenefitId } : { kind: 'barrier', id: id as BarrierId });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">{ja.nav.explore}</h1>
        <p className="mt-1 text-sm text-gray-700 dark:text-gray-300 max-w-3xl">{ja.explore.lead}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor="stage-filter" className="text-sm font-medium">
          {ja.explore.filterLabel}
        </label>
        <select
          id="stage-filter"
          value={stageFilter ?? ''}
          onChange={(e) => setStageFilter((e.target.value || null) as StageId | null)}
          className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-2 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <option value="">{ja.explore.filterAll}</option>
          {STAGES.filter((s) => s.id !== 'D-').map((s) => (
            <option key={s.id} value={s.id}>
              {s.id} {s.name}
            </option>
          ))}
        </select>
        {stageFilter && <span className="text-xs text-gray-600 dark:text-gray-400">{ja.explore.highlighted}を強調しています</span>}
      </div>

      <Section title={ja.explore.stagesTitle}>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {STAGES.map((s) => (
            <ItemCard key={s.id} item={s} highlighted={stageFilter === s.id} dimmed={!!stageFilter && stageFilter !== s.id} />
          ))}
        </div>
      </Section>

      <Section title={ja.explore.benefitsTitle}>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {BENEFITS.map((b) => (
            <ItemCard
              key={b.id}
              item={b}
              highlighted={strongBenefits.has(b.id)}
              dimmed={!!stageFilter && !strongBenefits.has(b.id)}
              onRelated={setDialog}
            />
          ))}
        </div>
        {stageFilter && (
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {ja.explore.relevanceLabel}（0〜3）が {STRONG} 以上の項目を強調しています。
          </p>
        )}
      </Section>

      <Section title={ja.explore.barriersTitle}>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {BARRIERS.map((w) => (
            <ItemCard
              key={w.id}
              item={w}
              highlighted={strongBarriers.has(w.id)}
              dimmed={!!stageFilter && !strongBarriers.has(w.id)}
              onRelated={setDialog}
            />
          ))}
        </div>
        {stageFilter && (
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {ja.explore.baseLabel}（0〜3）が {STRONG} 以上の項目を強調しています。
          </p>
        )}
      </Section>

      <Section title={ja.explore.pairsTitle} hint={ja.explore.pairsLead}>
        <PairDiagram
          highlightBenefits={stageFilter ? strongBenefits : undefined}
          highlightBarriers={stageFilter ? strongBarriers : undefined}
          onOpen={openById}
        />
      </Section>

      <ItemDialog itemRef={dialog} onClose={closeDialog} onNavigate={setDialog} />
    </div>
  );
}
