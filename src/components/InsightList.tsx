import type { Insight } from '../logic/insights';

export default function InsightList({ insights }: { insights: Insight[] }) {
  return (
    <ol className="space-y-3">
      {insights.map((ins, i) => (
        <li key={ins.id} className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-3 print-break-inside-avoid">
          <h3 className="font-semibold text-sm">
            <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-800 text-white text-xs dark:bg-gray-200 dark:text-gray-900" aria-hidden="true">
              {i + 1}
            </span>
            {ins.title}
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-gray-700 dark:text-gray-300">{ins.body}</p>
        </li>
      ))}
    </ol>
  );
}
