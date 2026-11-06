import { useMemo, useState } from 'react';
import type { Answers } from '../App';
import { ItemCard } from '../components/ItemCard';
import { Button } from '../components/ui';
import { ja } from '../data/ja';
import { QUESTIONS } from '../data/questions';
import type { SimInput, StageId } from '../data/schema';
import { STAGES, STAGE_BY_ID } from '../data/types';
import { diagnose } from '../logic/diagnose';
import type { Route } from '../logic/urlState';

interface Props {
  currentAnswers: Answers;
  targetAnswers: Answers;
  setCurrentAnswers: (a: Answers) => void;
  setTargetAnswers: (a: Answers) => void;
  input: SimInput;
  navigate: (r: Route, next?: SimInput) => void;
}

function QuestionGroup({
  idPrefix,
  title,
  lead,
  variant,
  answers,
  onChange,
}: {
  idPrefix: string;
  title: string;
  lead: string;
  variant: 'current' | 'target';
  answers: Answers;
  onChange: (a: Answers) => void;
}) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-bold">{title}</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">{lead}</p>
      </div>
      <ol className="space-y-2">
        {QUESTIONS.map((q, i) => {
          const name = `${idPrefix}-${i}`;
          const v = answers[i];
          return (
            <li key={q.stage}>
              <fieldset className="rounded-lg border border-gray-200 dark:border-gray-800 p-3">
                <legend className="text-sm font-medium px-1">
                  <span className="font-mono text-xs text-gray-500 dark:text-gray-400 mr-1">Q{i + 1}</span>
                  {q[variant]}
                </legend>
                <div className="mt-1 flex gap-2">
                  {([true, false] as const).map((val) => {
                    const checked = v === val;
                    return (
                      <label
                        key={String(val)}
                        className={`cursor-pointer rounded-md border px-3 py-1.5 text-sm has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-blue-500 ${
                          checked
                            ? val
                              ? 'border-blue-600 bg-blue-600 text-white dark:bg-blue-500 dark:text-gray-950'
                              : 'border-gray-700 bg-gray-700 text-white dark:bg-gray-300 dark:text-gray-900'
                            : 'border-gray-300 bg-white hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-900 dark:hover:bg-gray-800'
                        }`}
                      >
                        <input
                          type="radio"
                          name={name}
                          className="sr-only"
                          checked={checked}
                          onChange={() => {
                            const next = [...answers];
                            next[i] = val;
                            onChange(next);
                          }}
                        />
                        {val ? ja.diagnose.yes : ja.diagnose.no}
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function StageSelect({ id, value, onChange }: { id: string; value: StageId; onChange: (v: StageId) => void }) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value as StageId)}
      className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
    >
      {STAGES.map((s) => (
        <option key={s.id} value={s.id}>
          {s.id} {s.name}
        </option>
      ))}
    </select>
  );
}

export default function Diagnose({ currentAnswers, targetAnswers, setCurrentAnswers, setTargetAnswers, input, navigate }: Props) {
  const diagCurrent = useMemo(() => diagnose(currentAnswers), [currentAnswers]);
  const diagTarget = useMemo(() => diagnose(targetAnswers), [targetAnswers]);
  const [overrideCurrent, setOverrideCurrent] = useState<StageId | null>(null);
  const [overrideTarget, setOverrideTarget] = useState<StageId | null>(null);
  const current = overrideCurrent ?? diagCurrent;
  const target = overrideTarget ?? diagTarget;
  const answeredCurrent = currentAnswers.some((a) => a !== null);
  const answeredTarget = targetAnswers.some((a) => a !== null);

  const send = () => navigate('simulate', { ...input, current, target });
  const reset = () => {
    setCurrentAnswers([null, null, null, null, null, null]);
    setTargetAnswers([null, null, null, null, null, null]);
    setOverrideCurrent(null);
    setOverrideTarget(null);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">{ja.nav.diagnose}</h1>
        <p className="mt-1 text-sm text-gray-700 dark:text-gray-300 max-w-3xl">{ja.diagnose.lead}</p>
        <p className="text-xs text-gray-600 dark:text-gray-400">{ja.diagnose.noneNote}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QuestionGroup
          idPrefix="cur"
          title={ja.diagnose.currentTitle}
          lead={ja.diagnose.currentLead}
          variant="current"
          answers={currentAnswers}
          onChange={(a) => {
            setCurrentAnswers(a);
            setOverrideCurrent(null);
          }}
        />
        <QuestionGroup
          idPrefix="tgt"
          title={ja.diagnose.targetTitle}
          lead={ja.diagnose.targetLead}
          variant="target"
          answers={targetAnswers}
          onChange={(a) => {
            setTargetAnswers(a);
            setOverrideTarget(null);
          }}
        />
      </div>

      <section aria-live="polite" className="space-y-3">
        <h2 className="text-lg font-bold">{ja.diagnose.resultTitle}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(
            [
              ['cur', ja.diagnose.resultCurrent, current, answeredCurrent, setOverrideCurrent],
              ['tgt', ja.diagnose.resultTarget, target, answeredTarget, setOverrideTarget],
            ] as const
          ).map(([key, label, stage, answered, setOverride]) => (
            <div key={key} className="space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <h3 className="text-sm font-medium">
                  {label}
                  {!answered && <span className="ml-2 text-xs text-gray-500">({ja.diagnose.unanswered})</span>}
                </h3>
                <label className="text-xs flex items-center gap-1">
                  {ja.diagnose.override}
                  <StageSelect id={`override-${key}`} value={stage} onChange={(v) => setOverride(v)} />
                </label>
              </div>
              <ItemCard item={STAGE_BY_ID[stage]} highlighted />
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={send}>{ja.diagnose.send}</Button>
          <Button variant="secondary" onClick={reset}>
            {ja.diagnose.reset}
          </Button>
        </div>
      </section>
    </div>
  );
}
