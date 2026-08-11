import { CheckResult } from "./types";
import { getContextSnippet, getLineAndColumn, nextResultId } from "./textUtils";

interface MixedUsageGroup {
  label: string;
  /** グループ内の表記。このうち2種類以上が本文中に出現したら表記ゆれとして報告する */
  variants: RegExp[];
}

// 指定句マスターで ERROR になる組み合わせ（子ども/こども、人財/人材 等）は
// 既にERRORとして報告されるため、ここでは重複しない「表記ゆれ」のみを対象とする。
const GROUPS: MixedUsageGroup[] = [
  {
    label: "メンバー / 会員",
    variants: [/メンバー/, /会員(?!会議所)/],
  },
];

/**
 * 同一文書内で、同じ概念を指す複数の表記が混在していないかチェックする（TYPO扱い）。
 * 該当グループのうち2種類以上の表記が出現した場合、最初に出現した「後発の表記」の
 * 箇所に1件だけ報告する。
 */
export function checkMixedUsage(text: string): CheckResult[] {
  const results: CheckResult[] = [];

  for (const group of GROUPS) {
    const foundVariants: { pattern: RegExp; matchText: string; index: number }[] = [];

    for (const pattern of group.variants) {
      const re = new RegExp(pattern.source, "g");
      const m = re.exec(text);
      if (m) {
        foundVariants.push({ pattern, matchText: m[0], index: m.index });
      }
    }

    if (foundVariants.length < 2) continue;

    // 2番目以降に出現した表記の位置に警告を出す
    foundVariants.sort((a, b) => a.index - b.index);
    const target = foundVariants[1];
    const start = target.index;
    const end = start + target.matchText.length;
    const { line, column } = getLineAndColumn(text, start);
    const allForms = foundVariants.map((v) => v.matchText).join("」「");

    results.push({
      id: nextResultId(),
      severity: "TYPO",
      category: "表記ゆれ",
      matched: target.matchText,
      suggestion: "（文書内で表記を統一してください）",
      reason: `文書内に「${allForms}」など表記ゆれの可能性がある表現が混在しています（${group.label}）。文脈を確認のうえ統一してください。`,
      contextText: getContextSnippet(text, start, end),
      line,
      column,
      startIndex: start,
      endIndex: end,
    });
  }

  return results;
}
