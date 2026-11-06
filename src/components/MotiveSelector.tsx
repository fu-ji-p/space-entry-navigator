import { ja, MOTIVE_KEYS } from '../data/ja';
import type { Motive } from '../data/schema';

interface Props {
  motives: Motive[];
  onChange: (motives: Motive[]) => void;
}

export default function MotiveSelector({ motives, onChange }: Props) {
  const toggle = (m: Motive) => {
    onChange(motives.includes(m) ? motives.filter((x) => x !== m) : [...motives, m]);
  };
  return (
    <fieldset>
      <legend className="sr-only">{ja.simulate.motivesTitle}</legend>
      <div className="flex flex-wrap gap-2">
        {MOTIVE_KEYS.map((m) => {
          const checked = motives.includes(m);
          return (
            <label
              key={m}
              className={`cursor-pointer select-none rounded-full border px-3 py-1 text-sm transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-blue-500 has-[:focus-visible]:ring-offset-1 ${
                checked
                  ? 'border-blue-600 bg-blue-600 text-white dark:border-blue-400 dark:bg-blue-500 dark:text-gray-950'
                  : 'border-gray-300 bg-white text-gray-800 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800'
              }`}
            >
              <input type="checkbox" className="sr-only" checked={checked} onChange={() => toggle(m)} />
              【{ja.motives[m]}】
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
