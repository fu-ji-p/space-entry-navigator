import type { StageId } from '../data/schema';
import { QUESTIONS } from '../data/questions';

/**
 * 6 問の Yes/No 配列（QUESTIONS と同じ順序）を受け取り、Yes のうち最も高い類型を返す。
 * Yes が一つもなければ D-（未関与）。
 */
export function diagnose(answers: ReadonlyArray<boolean | null | undefined>): StageId {
  let result: StageId = 'D-';
  QUESTIONS.forEach((q, i) => {
    if (answers[i] === true) result = q.stage;
  });
  return result;
}
