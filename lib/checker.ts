import { CheckResponse, CheckResult, RuleSet } from "./types";
import { checkExactRules } from "./exactChecker";
import { checkFormatRules } from "./formatChecker";
import { checkContextRules } from "./contextChecker";
import { checkTypos } from "./typoChecker";
import { checkMixedUsage } from "./mixedUsageChecker";
import { resetResultIdCounter } from "./textUtils";

/**
 * 本文とルールセットを受け取り、統一ルールチェックを実行する。
 *
 * 処理順序（AI使用方針に準拠。現時点ではAIは呼び出さずルールベースのみで実装）：
 *   1. ルールベース判定  … 指定句マスター（ERROR）、全角半角・記号・スペース等（ERROR/WARNING）
 *   2. 文脈依存チェック  … 青年会議所/JC、私たち/メンバー、はじめ/始め、うえで/上で（WARNING）
 *   3. 誤字脱字チェック  … 重複文字の検出、表記ゆれの検出（TYPO）
 *
 * 議案内容そのものの評価・改善提案は一切行わない。
 */
export function checkText(text: string, ruleSet: RuleSet): CheckResponse {
  resetResultIdCounter();

  if (!text || text.trim().length === 0) {
    return {
      year: ruleSet.year,
      results: [],
      summary: { errorCount: 0, warningCount: 0, typoCount: 0, totalCount: 0 },
    };
  }

  const results: CheckResult[] = [
    // 1. ルールベース判定
    ...checkExactRules(text, ruleSet.exactRules, ruleSet.year),
    ...checkFormatRules(text, ruleSet.formatRules),
    // 2. 文脈依存チェック
    ...checkContextRules(text),
    // 3. 誤字脱字・表記ゆれチェック
    ...checkTypos(text),
    ...checkMixedUsage(text),
  ];

  results.sort((a, b) => a.startIndex - b.startIndex);

  const summary = {
    errorCount: results.filter((r) => r.severity === "ERROR").length,
    warningCount: results.filter((r) => r.severity === "WARNING").length,
    typoCount: results.filter((r) => r.severity === "TYPO").length,
    totalCount: results.length,
  };

  return { year: ruleSet.year, results, summary };
}
