import { CheckResult, ExactRule } from "./types";
import { getContextSnippet, getLineAndColumn, nextResultId } from "./textUtils";

interface RawMatch {
  rule: ExactRule;
  ng: string;
  start: number;
  end: number;
}

/**
 * 指定句マスターには「メンバー」の ng として「会員」が登録されているが、
 * 仕様書の「文脈判定対象」セクションで明記されている通り、「会員」は単純な
 * 誤り(ERROR)ではなく文脈確認(WARNING)の対象として扱う。
 * そのため、この組み合わせのみ機械的なERROR判定の対象から除外し、
 * lib/contextChecker.ts 側のWARNING判定に処理を委ねる。
 */
function isContextOnlyPair(ok: string, ng: string): boolean {
  return ok === "メンバー" && ng === "会員";
}

/**
 * 指定句マスター(exactRules)に基づき、NG表記が本文中に存在しないかを機械的に検索する。
 * 「文脈判定」は一切行わない、単純な文字列マッチング。
 *
 * 指定句マスターの中には「会員」(→メンバー) と「会員会議所」(→LOM) のように、
 * 短いNG表記が別のNG表記に完全に含まれるケースがある。これをそのまま検出すると
 * 同じ箇所に矛盾した指摘（「メンバーに直せ」と「LOMに直せ」）が重複して出てしまうため、
 * 同一範囲・包含関係にある一致は「最長一致」を優先し、短い一致は除外する。
 */
export function checkExactRules(text: string, rules: ExactRule[], year: number): CheckResult[] {
  const rawMatches: RawMatch[] = [];

  for (const rule of rules) {
    for (const ng of rule.ng) {
      if (!ng) continue;
      if (isContextOnlyPair(rule.ok, ng)) continue;
      let searchFrom = 0;
      while (searchFrom <= text.length) {
        const idx = text.indexOf(ng, searchFrom);
        if (idx === -1) break;
        rawMatches.push({ rule, ng, start: idx, end: idx + ng.length });
        searchFrom = idx + ng.length;
      }
    }
  }

  // 長い一致を優先し、短い一致がその範囲に完全に含まれる場合は除外する
  rawMatches.sort((a, b) => b.end - b.start - (a.end - a.start));

  const accepted: RawMatch[] = [];
  for (const candidate of rawMatches) {
    const isContained = accepted.some(
      (a) => candidate.start >= a.start && candidate.end <= a.end
    );
    if (!isContained) accepted.push(candidate);
  }

  accepted.sort((a, b) => a.start - b.start);

  const results: CheckResult[] = accepted.map(({ rule, ng, start, end }) => {
    const { line, column } = getLineAndColumn(text, start);
    return {
      id: nextResultId(),
      severity: "ERROR",
      category: "指定句",
      matched: ng,
      suggestion: rule.ok,
      reason: `${year}年度統一文言表では「${rule.ok}」と表記します。`,
      contextText: getContextSnippet(text, start, end),
      line,
      column,
      startIndex: start,
      endIndex: end,
    };
  });

  return results;
}
