import { ja } from '../data/ja';
import type { StageId } from '../data/schema';
import { STAGES } from '../data/types';

interface Props {
  current: StageId;
  target: StageId;
  onChange: (next: { current: StageId; target: StageId }) => void;
  onOpenStage?: (id: StageId) => void;
}

/** 横一列の D-〜D5 と 2 つのマーカー（現在地・目標）。矢印や「進む」は使わない。 */
export default function StageStepper({ current, target, onChange, onOpenStage }: Props) {
  return (
    <div className="space-y-3">
      <ol className="grid grid-cols-7 gap-1" aria-label={ja.simulate.stageTitle}>
        {STAGES.map((s) => {
          const isCur = s.id === current;
          const isTgt = s.id === target;
          return (
            <li key={s.id} className="flex flex-col items-center text-center">
              <div className="h-5 text-[10px] leading-5 font-medium text-blue-700 dark:text-blue-300">
                {isCur ? ja.simulate.currentLabel : ''}
              </div>
              <button
                type="button"
                onClick={() => onOpenStage?.(s.id)}
                title={s.name}
                aria-label={`${s.id} ${s.name}`}
                className={`w-full rounded-md border px-0.5 py-1.5 text-xs font-mono transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  isCur && isTgt
                    ? 'border-blue-600 bg-blue-600 text-white dark:bg-blue-500 dark:border-blue-500 dark:text-gray-950'
                    : isTgt
                      ? 'border-emerald-600 bg-emerald-600 text-white dark:bg-emerald-500 dark:border-emerald-500 dark:text-gray-950'
                      : isCur
                        ? 'border-blue-600 bg-blue-100 text-blue-900 dark:bg-blue-900/50 dark:text-blue-100 dark:border-blue-400'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800'
                }`}
              >
                {s.id}
              </button>
              <div className="h-5 text-[10px] leading-5 font-medium text-emerald-700 dark:text-emerald-300">
                {isTgt ? ja.simulate.targetLabel : ''}
              </div>
            </li>
          );
        })}
      </ol>
      <div className="grid grid-cols-2 gap-3">
        <label className="block text-sm">
          <span className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{ja.simulate.currentLabel}</span>
          <select
            value={current}
            onChange={(e) => onChange({ current: e.target.value as StageId, target })}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-2 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            {STAGES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.id} {s.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{ja.simulate.targetLabel}</span>
          <select
            value={target}
            onChange={(e) => onChange({ current, target: e.target.value as StageId })}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-2 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            {STAGES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.id} {s.name}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
