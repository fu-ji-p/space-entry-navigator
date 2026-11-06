import { BAND_LEVEL, BAND_SYMBOLS, MAX_LEVEL, type RatingKind } from '../data/bands';
import { ja } from '../data/ja';
import { LAYERS } from '../data/layers';
import type { Band, Layer } from '../data/schema';

export interface RatingRow {
  id: string;
  name: string;
  tagline: string;
  layer: Layer;
  band: Band;
  highlighted?: boolean; // 動機に合致（undefined = 動機未選択）
  distinct?: boolean; // W3（性質が異なる）
}

interface Props {
  kind: RatingKind;
  rows: RatingRow[];
  onSelect?: (id: string) => void;
}

/** 段階を記号（★/▲）で示す。数値や軸は出さない。 */
export function Rating({ band, kind, layer, distinct }: { band: Band; kind: RatingKind; layer: Layer; distinct?: boolean }) {
  const { filled, empty } = BAND_SYMBOLS[kind];
  const n = BAND_LEVEL[band];
  return (
    <span
      className={`inline-flex gap-0.5 text-lg leading-none tabular-nums ${distinct ? 'rounded border border-dashed border-red-500 px-1' : ''}`}
      style={{ color: LAYERS[layer].color }}
      aria-hidden="true"
    >
      {Array.from({ length: MAX_LEVEL }, (_, i) => (
        <span key={i} className="transition-opacity duration-300" style={{ opacity: i < n ? 1 : 0.35 }}>
          {i < n ? filled : empty}
        </span>
      ))}
    </span>
  );
}

export default function RatingList({ kind, rows, onSelect }: Props) {
  return (
    <ul className="divide-y divide-gray-100 dark:divide-gray-800">
      {rows.map((r) => {
        const label = ja.chart.ariaBar(r.name, r.tagline, ja.bands[r.band]);
        const dim = r.highlighted === false;
        const inner = (
          <>
            <span className="flex items-center gap-1.5 shrink-0">
              <span className={`inline-block h-2.5 w-2.5 rounded-sm`} style={{ backgroundColor: LAYERS[r.layer].color }} aria-hidden="true" />
              <span className="font-mono text-[11px] text-gray-500 dark:text-gray-400 w-9">{r.id}</span>
            </span>
            <span className="min-w-0 flex-1">
              <span className={`block text-sm leading-tight ${r.highlighted ? 'font-bold' : 'font-medium'}`}>
                【{r.tagline}】
                {r.highlighted && (
                  <span className="ml-1 rounded bg-blue-100 px-1 py-0.5 text-[10px] font-medium text-blue-900 dark:bg-blue-900/50 dark:text-blue-100">
                    {ja.simulate.motiveMatch}
                  </span>
                )}
              </span>
              <span className="block text-xs text-gray-600 dark:text-gray-400 truncate">{r.name}</span>
            </span>
            <span className="flex items-center gap-2 shrink-0">
              <Rating band={r.band} kind={kind} layer={r.layer} distinct={r.distinct} />
              <span className="w-5 text-right text-sm font-semibold">{ja.bands[r.band]}</span>
            </span>
          </>
        );
        const cls = `flex w-full items-center gap-2 py-1.5 text-left transition-opacity ${dim ? 'opacity-50' : ''}`;
        return (
          <li key={r.id}>
            {onSelect ? (
              <button
                type="button"
                onClick={() => onSelect(r.id)}
                aria-label={label}
                className={`${cls} rounded hover:bg-gray-50 dark:hover:bg-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500`}
              >
                {inner}
              </button>
            ) : (
              <div className={cls} aria-label={label}>
                {inner}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function LayerLegend({ layers, note }: { layers: Layer[]; note?: string }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
      <ul className="flex flex-wrap gap-x-3 gap-y-1" aria-label={ja.a11y.legend}>
        {layers.map((l) => (
          <li key={l} className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: LAYERS[l].color }} aria-hidden="true" />
            {LAYERS[l].label}
          </li>
        ))}
      </ul>
      {note && <span className="text-gray-600 dark:text-gray-400">{note}</span>}
    </div>
  );
}
