import { ja, SLIDER_KEYS } from '../data/ja';
import type { Level, SimInput, SliderKey } from '../data/schema';

interface Props {
  input: SimInput;
  onChange: (key: SliderKey, value: Level) => void;
}

export default function SituationSliders({ input, onChange }: Props) {
  return (
    <div className="space-y-4">
      {SLIDER_KEYS.map((key) => {
        const s = ja.sliders[key];
        const v = input[key];
        const id = `slider-${key}`;
        return (
          <div key={key}>
            <div className="flex items-baseline justify-between gap-2">
              <label htmlFor={id} className="text-sm font-medium">
                {s.label}
              </label>
              <span className="text-xs tabular-nums text-gray-600 dark:text-gray-400" aria-hidden="true">
                {v} / 5
              </span>
            </div>
            <input
              id={id}
              type="range"
              min={1}
              max={5}
              step={1}
              value={v}
              onChange={(e) => onChange(key, Number(e.target.value) as Level)}
              aria-valuetext={`${v}: ${s.levels[v]}`}
              aria-describedby={`${id}-desc`}
              className="mt-1"
            />
            <p id={`${id}-desc`} className="mt-1 text-xs text-gray-600 dark:text-gray-400 min-h-[1.25rem]">
              {s.levels[v]}
            </p>
          </div>
        );
      })}
    </div>
  );
}
