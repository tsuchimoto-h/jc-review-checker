import { RuleSet } from "./types";
import rules2026 from "@/rules/2026.json";

// ------------------------------------------------------------------
// 年度別ルールセットの登録。
//
// 【2027年度以降のルールを追加する方法】
//   1. rules/2027.json を作成する（rules/2026.json をコピーして編集するのが簡単）
//   2. 下記のように import して RULE_SETS に追記する
//
//     import rules2027 from "@/rules/2027.json";
//     const RULE_SETS: Record<number, RuleSet> = {
//       2026: rules2026 as unknown as RuleSet,
//       2027: rules2027 as unknown as RuleSet,
//     };
//
//   これだけで、UI上部の年度プルダウンに自動的に「2027年度」が追加され、
//   選択・切り替えができるようになる（詳細はREADME.mdを参照）。
// ------------------------------------------------------------------
const RULE_SETS: Record<number, RuleSet> = {
  2026: rules2026 as unknown as RuleSet,
};

/** 初期選択値として使用する年度（現状は最新年度） */
export const DEFAULT_YEAR = 2026;

export function getAvailableYears(): number[] {
  return Object.keys(RULE_SETS)
    .map(Number)
    .sort((a, b) => a - b);
}

export function getRuleSet(year: number): RuleSet {
  const ruleSet = RULE_SETS[year];
  if (!ruleSet) {
    throw new Error(`未対応の年度です: ${year}年度`);
  }
  return ruleSet;
}
