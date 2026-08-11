import { CheckResult } from "./types";
import { getContextSnippet, getLineAndColumn, nextResultId } from "./textUtils";

function pushWarning(
  results: CheckResult[],
  text: string,
  start: number,
  end: number,
  matched: string,
  reason: string
) {
  const { line, column } = getLineAndColumn(text, start);
  results.push({
    id: nextResultId(),
    severity: "WARNING",
    category: "文脈確認",
    matched,
    suggestion: "（文脈に応じて確認）",
    reason,
    contextText: getContextSnippet(text, start, end),
    line,
    column,
    startIndex: start,
    endIndex: end,
  });
}

/** 指定した正規表現に一致する箇所すべてについて callback を呼ぶ */
function forEachMatch(text: string, regex: RegExp, callback: (match: RegExpExecArray) => void) {
  const re = new RegExp(regex.source, regex.flags.includes("g") ? regex.flags : regex.flags + "g");
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    callback(match);
    if (match[0].length === 0) re.lastIndex += 1; // 無限ループ防止
  }
}

/** 青年会議所 / JC：団体名か複合語(JC〇〇)かは文脈判断が必要なため、両方の出現をWARNINGにする */
function checkJcOrganization(text: string): CheckResult[] {
  const results: CheckResult[] = [];

  forEachMatch(text, /青年会議所/g, (m) => {
    const start = m.index;
    const end = start + m[0].length;
    pushWarning(
      results,
      text,
      start,
      end,
      m[0],
      "団体そのものを指す場合は「青年会議所」の表記で問題ありません。前後の文脈を確認してください。"
    );
  });

  // JCI（JCI日本／JCI Japan）は formatChecker 側で別途処理するため除外する
  forEachMatch(text, /JC(?!I)/g, (m) => {
    const start = m.index;
    const end = start + m[0].length;
    pushWarning(
      results,
      text,
      start,
      end,
      m[0],
      "団体そのものを指す場合は「青年会議所」、JC宣言・JC運動等の複合語の場合は「JC〇〇」と表記します。前後の文脈を確認してください。"
    );
  });

  return results;
}

/** 私たち / メンバー / 会員：全会員を指す主語なら「私たち」、それ以外は「メンバー」 */
function checkMembers(text: string): CheckResult[] {
  const results: CheckResult[] = [];

  forEachMatch(text, /私たち/g, (m) => {
    const start = m.index;
    const end = start + m[0].length;
    pushWarning(
      results,
      text,
      start,
      end,
      m[0],
      "日本の青年会議所会員全員を指す主語の場合は「私たち」を使用します。それ以外を指す場合は「メンバー」に変更してください。"
    );
  });

  forEachMatch(text, /メンバー/g, (m) => {
    const start = m.index;
    const end = start + m[0].length;
    pushWarning(
      results,
      text,
      start,
      end,
      m[0],
      "全会員を指す主語の場合は「私たち」、それ以外の場合は「メンバー」を使用します。文脈を確認してください。"
    );
  });

  // 「会員会議所」は exactRules 側で ERROR として処理されるため、それに含まれる「会員」は除外する
  forEachMatch(text, /会員(?!会議所)/g, (m) => {
    const start = m.index;
    const end = start + m[0].length;
    pushWarning(
      results,
      text,
      start,
      end,
      m[0],
      "「会員」は原則「メンバー」を使用します。使用する場合は文脈を確認してください。"
    );
  });

  return results;
}

const HAJIME_SAFE_PATTERNS = [
  /をはじめ/,
  /はじめとした/,
  /はじめとする/,
  /はじめ、/,
  /始める/,
  /始めて/,
  /始めまし/,
  /始まる/,
  /始まり/,
];

/** はじめ / 始め：比喩的用法（をはじめ 等）と動作そのもの（始める 等）以外はWARNING */
function checkHajime(text: string): CheckResult[] {
  const results: CheckResult[] = [];

  forEachMatch(text, /(はじめ|始め)/g, (m) => {
    const start = m.index;
    const end = start + m[0].length;
    const around = text.slice(Math.max(0, start - 4), Math.min(text.length, end + 6));
    const isSafe = HAJIME_SAFE_PATTERNS.some((p) => p.test(around));
    if (isSafe) return;

    pushWarning(
      results,
      text,
      start,
      end,
      m[0],
      "比喩的・慣用的表現（〜をはじめ、はじめとした）はひらがな、動作そのもの（始める等）は漢字を使用します。単純に置換できないため文脈を確認してください。"
    );
  });

  return results;
}

/** うえで / 上で：文脈によって適切な表記が異なるため常にWARNING */
function checkUede(text: string): CheckResult[] {
  const results: CheckResult[] = [];

  forEachMatch(text, /(うえで|上で)/g, (m) => {
    const start = m.index;
    const end = start + m[0].length;
    pushWarning(
      results,
      text,
      start,
      end,
      m[0],
      "「うえで」「上で」は文脈によって適切な表記が異なります。前後の文章を確認してください。"
    );
  });

  return results;
}

/**
 * 文脈判定が必要な項目をまとめてチェックする。
 * ここではルールベースの簡易ヒューリスティックのみを実装しており、
 * 将来的にAI（LLM）による文脈理解を組み込む場合は、この関数の出力を
 * 一次候補として渡し、AIには「該当箇所が本当に確認が必要か」の絞り込みや
 * 理由文の精緻化のみを担わせる想定（指定句そのものの正誤判定はAIに行わせない）。
 */
export function checkContextRules(text: string): CheckResult[] {
  return [
    ...checkJcOrganization(text),
    ...checkMembers(text),
    ...checkHajime(text),
    ...checkUede(text),
  ];
}
