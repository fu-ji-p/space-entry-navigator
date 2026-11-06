import { BARRIER_BY_ID } from '../data/barriers';
import { BENEFIT_BY_ID } from '../data/benefits';
import { ja } from '../data/ja';
import { LAYERS } from '../data/layers';
import { PAIRS } from '../data/pairs';
import type { BarrierId, BenefitId } from '../data/schema';

interface Props {
  highlightBenefits?: Set<BenefitId>;
  highlightBarriers?: Set<BarrierId>;
  onOpen?: (id: BenefitId | BarrierId) => void;
}

/** 便益⇔障壁の対応図（表と裏の関係） */
export default function PairDiagram({ highlightBenefits, highlightBarriers, onOpen }: Props) {
  const chip = (id: BenefitId | BarrierId, kind: 'benefit' | 'barrier') => {
    const item = kind === 'benefit' ? BENEFIT_BY_ID[id as BenefitId] : BARRIER_BY_ID[id as BarrierId];
    const hl = kind === 'benefit' ? highlightBenefits?.has(id as BenefitId) : highlightBarriers?.has(id as BarrierId);
    const dim = (highlightBenefits || highlightBarriers) && !hl;
    const cls = `inline-flex flex-col items-start rounded-md border px-2 py-1 text-left ${LAYERS[item.layer].badgeClass} ${
      dim ? 'opacity-45' : ''
    } ${hl ? 'ring-2 ring-blue-500' : ''} ${item.distinctNature ? 'border-dashed border-red-500' : 'border-transparent'}`;
    const body = (
      <>
        <span className="text-sm font-bold">【{item.tagline}】</span>
        <span className="text-[11px]">
          {item.id} {item.name}
        </span>
      </>
    );
    return onOpen ? (
      <button key={id} type="button" onClick={() => onOpen(id)} className={`${cls} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500`}>
        {body}
      </button>
    ) : (
      <span key={id} className={cls}>
        {body}
      </span>
    );
  };

  return (
    <ol className="space-y-3">
      {PAIRS.map((p) => (
        <li key={p.group} className="rounded-lg border border-gray-200 dark:border-gray-800 p-3 print-break-inside-avoid">
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-2 items-center">
            <div>
              <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                {ja.explore.barriersTitle} {p.group}（{ja.card.layerLabel}: {ja.layers[BARRIER_BY_ID[p.barriers[0]].layer]}）
              </div>
              <div className="flex flex-wrap gap-1">{p.barriers.map((id) => chip(id, 'barrier'))}</div>
            </div>
            <div className="text-center text-gray-500 dark:text-gray-400 text-sm font-medium px-2" aria-hidden="true">
              表 ⇔ 裏
            </div>
            <div>
              <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">裏側の{ja.explore.benefitsTitle}</div>
              <div className="flex flex-wrap gap-1">{p.benefits.map((id) => chip(id, 'benefit'))}</div>
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{p.description}</p>
        </li>
      ))}
    </ol>
  );
}
