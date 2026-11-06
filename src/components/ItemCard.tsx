import { useEffect, useRef } from 'react';
import { BARRIER_BY_ID } from '../data/barriers';
import { BENEFIT_BY_ID } from '../data/benefits';
import { ja } from '../data/ja';
import type { Band, BarrierId, BenefitId, FrameworkItem, StageDef, StageId } from '../data/schema';
import { STAGE_BY_ID } from '../data/types';
import { Button, LayerBadge } from './ui';

export type ItemRef = { kind: 'stage'; id: StageId } | { kind: 'benefit'; id: BenefitId } | { kind: 'barrier'; id: BarrierId };

export function resolveItem(ref: ItemRef): FrameworkItem | StageDef {
  if (ref.kind === 'stage') return STAGE_BY_ID[ref.id];
  if (ref.kind === 'benefit') return BENEFIT_BY_ID[ref.id];
  return BARRIER_BY_ID[ref.id];
}

export function refFromId(id: string): ItemRef | null {
  if (id in STAGE_BY_ID) return { kind: 'stage', id: id as StageId };
  if (id in BENEFIT_BY_ID) return { kind: 'benefit', id: id as BenefitId };
  if (id in BARRIER_BY_ID) return { kind: 'barrier', id: id as BarrierId };
  return null;
}

interface CardProps {
  item: FrameworkItem | StageDef;
  band?: Band; // シミュレーターでの段階（便益=期待度、障壁=高さ）
  dimmed?: boolean;
  highlighted?: boolean;
  onOpen?: (ref: ItemRef) => void;
  onRelated?: (ref: ItemRef) => void;
  compact?: boolean;
}

function isFramework(item: FrameworkItem | StageDef): item is FrameworkItem {
  return 'layer' in item;
}

/** D/B/W 共通カード。探索画面では一覧表示、チャートからはダイアログ内で使う。 */
export function ItemCard({ item, band, dimmed, highlighted, onRelated, compact }: CardProps) {
  const fw = isFramework(item) ? item : null;
  return (
    <article
      className={`rounded-lg border p-3 sm:p-4 transition-opacity print-break-inside-avoid ${
        highlighted
          ? 'border-blue-500 ring-1 ring-blue-500 dark:border-blue-400 dark:ring-blue-400'
          : 'border-gray-200 dark:border-gray-800'
      } ${dimmed ? 'opacity-45' : ''} bg-white dark:bg-gray-900`}
      aria-label={`${item.id} ${item.name}`}
    >
      <div className="flex items-start gap-2 flex-wrap">
        <span className="font-mono text-xs text-gray-500 dark:text-gray-400 pt-1">{item.id}</span>
        {fw && <LayerBadge layer={fw.layer} />}
        {fw?.distinctNature && (
          <span className="inline-block rounded px-1.5 py-0.5 text-xs font-medium bg-red-100 text-red-900 dark:bg-red-900/50 dark:text-red-100">
            {ja.card.distinct}
          </span>
        )}
        {band !== undefined && fw && (
          <span className="ml-auto text-sm font-semibold">
            {fw.layer === 'cost' || fw.layer === 'tech' || fw.layer === 'decision'
              ? ja.simulate.barrierBandLabel
              : ja.simulate.benefitBandLabel}
            : {ja.bands[band]}
          </span>
        )}
      </div>
      {fw ? (
        <>
          <p className="mt-1 text-xl font-bold leading-tight">【{fw.tagline}】</p>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">{fw.name}</h3>
        </>
      ) : (
        <h3 className="mt-1 text-xl font-bold leading-tight">{item.name}</h3>
      )}
      {!compact && <p className="mt-2 text-sm leading-relaxed">{item.summary}</p>}
      {!compact && item.examples && item.examples.length > 0 && (
        <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
          <span className="font-medium">{ja.card.examples}: </span>
          {item.examples.join('、')}
        </p>
      )}
      {!compact && fw?.loweredBy && fw.loweredBy.length > 0 && (
        <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
          <span className="font-medium">{ja.card.loweredBy}: </span>
          {fw.loweredBy.map((k) => ja.sliders[k].label).join('、')}
        </p>
      )}
      {!compact && fw?.related && fw.related.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1 items-center">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{ja.card.related}:</span>
          {fw.related.map((rid) => {
            const ref = refFromId(rid);
            const target = ref ? resolveItem(ref) : null;
            const label = target && isFramework(target) ? `${rid} ${target.tagline}` : rid;
            return onRelated && ref ? (
              <button
                key={rid}
                type="button"
                onClick={() => onRelated(ref)}
                className="rounded-full border border-gray-300 dark:border-gray-600 px-2 py-0.5 text-xs hover:bg-gray-100 dark:hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                {label}
              </button>
            ) : (
              <span key={rid} className="rounded-full border border-gray-300 dark:border-gray-600 px-2 py-0.5 text-xs">
                {label}
              </span>
            );
          })}
        </div>
      )}
    </article>
  );
}

/** チャートの棒をクリックしたときに開く定義カードのダイアログ */
export function ItemDialog({
  itemRef,
  band,
  onClose,
  onNavigate,
}: {
  itemRef: ItemRef | null;
  band?: Band;
  onClose: () => void;
  onNavigate: (ref: ItemRef) => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!itemRef) return;
    restoreRef.current = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      restoreRef.current?.focus?.();
    };
  }, [itemRef, onClose]);

  if (!itemRef) return null;
  const item = resolveItem(itemRef);
  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-0 sm:p-4" role="presentation">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="item-dialog-title"
        className="relative w-full sm:max-w-lg max-h-[85vh] overflow-y-auto rounded-t-xl sm:rounded-xl bg-white dark:bg-gray-900 shadow-xl p-4"
      >
        <div className="flex items-center justify-between mb-2">
          <h2 id="item-dialog-title" className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {item.id} {item.name}
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            {ja.card.close}
          </button>
        </div>
        <ItemCard item={item} band={band} onRelated={onNavigate} />
        <div className="mt-3 text-right">
          <Button variant="secondary" onClick={onClose}>
            {ja.card.close}
          </Button>
        </div>
      </div>
    </div>
  );
}
