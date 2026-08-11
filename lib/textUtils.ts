/**
 * 本文全体での絶対位置(index)から、行番号(1始まり)と行内文字位置(1始まり)を求める。
 */
export function getLineAndColumn(
  text: string,
  index: number
): { line: number; column: number } {
  const before = text.slice(0, index);
  const lines = before.split("\n");
  const line = lines.length;
  const column = lines[lines.length - 1].length + 1;
  return { line, column };
}

/**
 * 該当箇所の前後文章を抽出する。改行は空白に置き換え、切り詰めた場合は "…" を付与する。
 */
export function getContextSnippet(
  text: string,
  start: number,
  end: number,
  radius = 15
): string {
  const from = Math.max(0, start - radius);
  const to = Math.min(text.length, end + radius);
  const snippet = text.slice(from, to).replace(/\n/g, " ");
  const prefix = from > 0 ? "…" : "";
  const suffix = to < text.length ? "…" : "";
  return prefix + snippet + suffix;
}

let idCounter = 0;

/** チェック結果用の一意なIDを発行する（呼び出しごとにインクリメント） */
export function nextResultId(): string {
  idCounter += 1;
  return `res-${idCounter}-${Date.now().toString(36)}`;
}

export function resetResultIdCounter(): void {
  idCounter = 0;
}

/**
 * 複数の [start, end) 範囲について、開始位置が早い順・範囲が広い順に並べ、
 * 重なりのあるものは後から出てきた方を除外する（ハイライト表示用）。
 */
export function removeOverlaps<T extends { startIndex: number; endIndex: number }>(
  items: T[]
): T[] {
  const sorted = [...items].sort((a, b) => {
    if (a.startIndex !== b.startIndex) return a.startIndex - b.startIndex;
    return b.endIndex - b.startIndex - (a.endIndex - a.startIndex);
  });
  const result: T[] = [];
  let lastEnd = -1;
  for (const item of sorted) {
    if (item.startIndex >= lastEnd) {
      result.push(item);
      lastEnd = item.endIndex;
    }
  }
  return result;
}
