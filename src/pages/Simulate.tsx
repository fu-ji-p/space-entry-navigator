import { useCallback, useMemo, useState } from 'react';
import BarrierChart from '../components/BarrierChart';
import BenefitChart from '../components/BenefitChart';
import InsightList from '../components/InsightList';
import { ItemDialog, type ItemRef } from '../components/ItemCard';
import MotiveSelector from '../components/MotiveSelector';
import SituationSliders from '../components/SituationSliders';
import StageStepper from '../components/StageStepper';
import Toggle from '../components/Toggle';
import { Button, Disclaimer, Section } from '../components/ui';
import { ja } from '../data/ja';
import type { SimInput } from '../data/schema';
import { toBand } from '../logic/band';
import { evaluateInsights } from '../logic/insights';
import { computeScores, DEFAULT_INPUT } from '../logic/score';
import type { Route } from '../logic/urlState';

interface Props {
  input: SimInput;
  setInput: (i: SimInput) => void;
  navigate: (r: Route) => void;
}

export default function Simulate({ input, setInput, navigate }: Props) {
  const scores = useMemo(() => computeScores(input), [input]);
  const insights = useMemo(() => evaluateInsights(input, scores), [input, scores]);
  const [inputsOpen, setInputsOpen] = useState(false);
  const [dialog, setDialog] = useState<ItemRef | null>(null);
  const closeDialog = useCallback(() => setDialog(null), []);

  const dialogBand =
    dialog?.kind === 'benefit'
      ? toBand(scores.benefits[dialog.id])
      : dialog?.kind === 'barrier'
        ? toBand(scores.barriers[dialog.id])
        : undefined;

  const inputs = (
    <div className="space-y-6">
      <Section title={ja.simulate.stageTitle}>
        <StageStepper
          current={input.current}
          target={input.target}
          onChange={(v) => setInput({ ...input, ...v })}
          onOpenStage={(id) => setDialog({ kind: 'stage', id })}
        />
        <p className="text-xs text-gray-600 dark:text-gray-400">
          {ja.simulate.gapLabel}: {scores.gap}
        </p>
      </Section>
      <Section title={ja.simulate.situationTitle}>
        <SituationSliders input={input} onChange={(key, value) => setInput({ ...input, [key]: value })} />
      </Section>
      <Section title={ja.simulate.motivesTitle}>
        <MotiveSelector motives={input.motives} onChange={(motives) => setInput({ ...input, motives })} />
      </Section>
      <Section title={ja.simulate.togglesTitle}>
        <div className="space-y-3">
          <Toggle
            id="toggle-public"
            label={ja.simulate.usePublicFunds}
            hint={ja.simulate.usePublicFundsHint}
            checked={input.usePublicFunds}
            onChange={(v) => setInput({ ...input, usePublicFunds: v })}
          />
          <Toggle
            id="toggle-spaceonly"
            label={ja.simulate.spaceOnlyValue}
            hint={ja.simulate.spaceOnlyValueHint}
            checked={input.spaceOnlyValue}
            onChange={(v) => setInput({ ...input, spaceOnlyValue: v })}
          />
        </div>
      </Section>
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={() => setInput(DEFAULT_INPUT)}>
          {ja.simulate.resetAll}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">{ja.nav.simulate}</h1>
        <Button onClick={() => navigate('report')}>{ja.simulate.toReport}</Button>
      </div>
      <Disclaimer />

      <div className="lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-8">
        {/* モバイル: 出力を上、入力は折りたたみ。デスクトップ: 入力左・出力右 */}
        <div className="lg:hidden mb-3">
          <button
            type="button"
            onClick={() => setInputsOpen((o) => !o)}
            aria-expanded={inputsOpen}
            aria-controls="sim-inputs"
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm font-medium text-left flex justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <span>
              {ja.simulate.inputsTitle}（{input.current} → {input.target}）
            </span>
            <span aria-hidden="true">{inputsOpen ? '−' : '+'}</span>
          </button>
        </div>
        <aside id="sim-inputs" className={`${inputsOpen ? 'block' : 'hidden'} lg:block mb-6 lg:mb-0`} aria-label={ja.simulate.inputsTitle}>
          {inputs}
        </aside>

        <div className="space-y-8 min-w-0">
          <Section title={ja.simulate.benefitChartTitle} hint={ja.simulate.benefitChartHint}>
            <BenefitChart input={input} scores={scores} onSelect={(id) => setDialog({ kind: 'benefit', id })} />
          </Section>
          <Section title={ja.simulate.barrierChartTitle} hint={ja.simulate.barrierChartHint}>
            <BarrierChart scores={scores} onSelect={(id) => setDialog({ kind: 'barrier', id })} />
          </Section>
          <Section title={ja.simulate.insightsTitle} hint={ja.simulate.insightsHint}>
            <InsightList insights={insights} />
          </Section>
        </div>
      </div>

      <ItemDialog itemRef={dialog} band={dialogBand} onClose={closeDialog} onNavigate={setDialog} />
    </div>
  );
}
