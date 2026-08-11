import { CheckResult, FormatRules } from "./types";
import { getContextSnippet, getLineAndColumn, nextResultId } from "./textUtils";

const FULLWIDTH_ASCII_START = 0xff01; // ！
const FULLWIDTH_ASCII_END = 0xff5e; // ～
const FULLWIDTH_ASCII_OFFSET = 0xfee0;

function toHalfWidthAscii(char: string): string {
  const code = char.codePointAt(0);
  if (code === undefined) return char;
  if (code >= FULLWIDTH_ASCII_START && code <= FULLWIDTH_ASCII_END) {
    return String.fromCharCode(code - FULLWIDTH_ASCII_OFFSET);
  }
  return char;
}

function isFullWidthAscii(char: string): boolean {
  const code = char.codePointAt(0);
  if (code === undefined) return false;
  return code >= FULLWIDTH_ASCII_START && code <= FULLWIDTH_ASCII_END;
}

/**
 * 全角の英数字・記号（()-_. など、Unicode 全角形ブロック U+FF01-FF5E）を検出する。
 * 連続する全角ASCII文字はまとめて1件として報告する。
 */
function checkFullWidthAsciiRuns(text: string): CheckResult[] {
  const results: CheckResult[] = [];
  let i = 0;
  while (i < text.length) {
    if (isFullWidthAscii(text[i])) {
      const start = i;
      let j = i;
      let converted = "";
      while (j < text.length && isFullWidthAscii(text[j])) {
        converted += toHalfWidthAscii(text[j]);
        j += 1;
      }
      const end = j;
      const matched = text.slice(start, end);
      const isAlnum = /^[Ａ-Ｚａ-ｚ０-９]+$/.test(matched);
      const { line, column } = getLineAndColumn(text, start);

      results.push({
        id: nextResultId(),
        severity: "ERROR",
        category: isAlnum ? "全角半角" : "記号",
        matched,
        suggestion: converted,
        reason: isAlnum
          ? "英数字は半角で表記します。"
          : "記号は原則半角で表記します。",
        contextText: getContextSnippet(text, start, end),
        line,
        column,
        startIndex: start,
        endIndex: end,
      });
      i = end;
    } else {
      i += 1;
    }
  }
  return results;
}

/** 全角スペース「　」の検出 */
function checkFullWidthSpace(text: string): CheckResult[] {
  const results: CheckResult[] = [];
  let searchFrom = 0;
  while (searchFrom <= text.length) {
    const idx = text.indexOf("\u3000", searchFrom);
    if (idx === -1) break;
    const start = idx;
    const end = idx + 1;
    const { line, column } = getLineAndColumn(text, start);
    results.push({
      id: nextResultId(),
      severity: "ERROR",
      category: "スペース",
      matched: "　",
      suggestion: " ",
      reason: "全角スペースは半角スペースに変更します。",
      contextText: getContextSnippet(text, start, end),
      line,
      column,
      startIndex: start,
      endIndex: end,
    });
    searchFrom = end;
  }
  return results;
}

/** 「JCI日本」の検出（候補が複数あるため利用者に選択させる） */
function checkJciNihon(text: string, rule: FormatRules["jciNihon"]): CheckResult[] {
  if (!rule.enabled) return [];
  const results: CheckResult[] = [];
  let searchFrom = 0;
  while (searchFrom <= text.length) {
    const idx = text.indexOf(rule.detect, searchFrom);
    if (idx === -1) break;
    const start = idx;
    const end = idx + rule.detect.length;
    const { line, column } = getLineAndColumn(text, start);
    results.push({
      id: nextResultId(),
      severity: "ERROR",
      category: "JCI日本",
      matched: rule.detect,
      suggestion: rule.suggestions.join(" / "),
      suggestions: rule.suggestions,
      reason: `「${rule.detect}」は使用しません。文脈に応じて候補から選択してください。`,
      contextText: getContextSnippet(text, start, end),
      line,
      column,
      startIndex: start,
      endIndex: end,
    });
    searchFrom = end;
  }
  return results;
}

/** 半角かぎ括弧｢｣（原則使用しない、WARNING） */
function checkHalfWidthBrackets(text: string, rule: FormatRules["halfWidthBrackets"]): CheckResult[] {
  if (!rule.enabled) return [];
  const results: CheckResult[] = [];
  for (const bracket of rule.detect) {
    let searchFrom = 0;
    while (searchFrom <= text.length) {
      const idx = text.indexOf(bracket, searchFrom);
      if (idx === -1) break;
      const start = idx;
      const end = idx + 1;
      const { line, column } = getLineAndColumn(text, start);
      results.push({
        id: nextResultId(),
        severity: "WARNING",
        category: "かぎ括弧",
        matched: bracket,
        suggestion: rule.suggestion,
        reason: "半角のかぎ括弧は原則使用しません。全角の「」を使用してください。",
        contextText: getContextSnippet(text, start, end),
        line,
        column,
        startIndex: start,
        endIndex: end,
      });
      searchFrom = end;
    }
  }
  return results;
}

/** 半角中黒･（原則使用しない、WARNING。会頭所信・基本資料内の既存文言は例外のためWARNINGに留める） */
function checkHalfWidthNakaguro(text: string, rule: FormatRules["halfWidthNakaguro"]): CheckResult[] {
  if (!rule.enabled) return [];
  const results: CheckResult[] = [];
  let searchFrom = 0;
  while (searchFrom <= text.length) {
    const idx = text.indexOf(rule.detect, searchFrom);
    if (idx === -1) break;
    const start = idx;
    const end = idx + 1;
    const { line, column } = getLineAndColumn(text, start);
    results.push({
      id: nextResultId(),
      severity: "WARNING",
      category: "中黒",
      matched: rule.detect,
      suggestion: rule.suggestion,
      reason:
        "半角の中黒（･）は原則使用しません。全角の「・」を使用してください（会頭所信・基本資料内の既存文言は例外）。",
      contextText: getContextSnippet(text, start, end),
      line,
      column,
      startIndex: start,
      endIndex: end,
    });
    searchFrom = end;
  }
  return results;
}

export function checkFormatRules(text: string, formatRules: FormatRules): CheckResult[] {
  const results: CheckResult[] = [];

  if (formatRules.fullWidthAlnumSymbol.enabled) {
    results.push(...checkFullWidthAsciiRuns(text));
  }
  if (formatRules.fullWidthSpace.enabled) {
    results.push(...checkFullWidthSpace(text));
  }
  results.push(...checkJciNihon(text, formatRules.jciNihon));
  results.push(...checkHalfWidthBrackets(text, formatRules.halfWidthBrackets));
  results.push(...checkHalfWidthNakaguro(text, formatRules.halfWidthNakaguro));

  return results;
}
