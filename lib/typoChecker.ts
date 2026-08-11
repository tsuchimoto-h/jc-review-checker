import { CheckResult } from "./types";
import { getContextSnippet, getLineAndColumn, nextResultId } from "./textUtils";

// ひらがな・カタカナ・漢字のみを対象とする（記号・数字・アルファベット・長音符ーは対象外）
const JAPANESE_CHAR = /[\u3041-\u309f\u30a1-\u30ff\u4e00-\u9fff]/;

// 意図的な重複が一般的な語（誤検出を減らすためのホワイトリスト）。
// 該当箇所を含む前後2文字がこれらの語に一致する場合はスキップする。
const SAFE_REPEATS = [
  "様々",
  "色々",
  "時々",
  "日々",
  "人々",
  "国々",
  "我々",
  "代々",
  "近々",
  "段々",
  "隅々",
  "ますます",
  "いよいよ",
  "そろそろ",
  "わざわざ",
  "着々",
  "続々",
  "着々",
  "重々",
  "常々",
  "口々",
];

function isSafeRepeat(text: string, start: number, end: number): boolean {
  const windowStart = Math.max(0, start - 4);
  const windowEnd = Math.min(text.length, end + 4);
  const around = text.slice(windowStart, windowEnd);
  return SAFE_REPEATS.some((word) => around.includes(word));
}

/**
 * 同一文字が連続して2回以上出現する箇所を検出する（例：「行うう」「するることで」の「るる」）。
 * これは「誤字脱字チェック」のうち、明確な誤字・重複文字・不自然な助詞の連続を機械的に検出するもの。
 * 文章表現の改善提案は一切行わない。
 */
export function checkTypos(text: string): CheckResult[] {
  const results: CheckResult[] = [];
  const regex = /([\u3041-\u309f\u30a1-\u30ff\u4e00-\u9fff])\1+/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const start = match.index;
    const end = start + match[0].length;

    if (!JAPANESE_CHAR.test(match[1])) continue;
    if (isSafeRepeat(text, start, end)) continue;

    const { line, column } = getLineAndColumn(text, start);
    const suggestion = match[1]; // 重複を1文字に収めた場合の候補

    results.push({
      id: nextResultId(),
      severity: "TYPO",
      category: "誤字脱字",
      matched: match[0],
      suggestion,
      reason: "同じ文字が連続しています。重複文字による誤字の可能性があります。",
      contextText: getContextSnippet(text, start, end),
      line,
      column,
      startIndex: start,
      endIndex: end,
    });
  }

  return results;
}
