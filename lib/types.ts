// ============================================================
// ルールマスターの型
// ============================================================

/** 指定句マスターの1エントリ（正しい表記と、NGとなる表記のバリエーション） */
export interface ExactRule {
  ok: string;
  ng: string[];
}

/** 文脈判定が必要な項目のメタ情報（実際の判定ロジックは lib/contextChecker.ts 側で実装） */
export interface ContextRuleMeta {
  key: string;
  label: string;
  description: string;
}

export interface JciNihonRule {
  enabled: boolean;
  detect: string;
  suggestions: string[];
  description: string;
}

export interface BracketRule {
  enabled: boolean;
  detect: string[];
  suggestion: string;
  description: string;
}

export interface NakaguroRule {
  enabled: boolean;
  detect: string;
  suggestion: string;
  description: string;
}

export interface ToggleRule {
  enabled: boolean;
  description: string;
}

export interface FormatRules {
  fullWidthAlnumSymbol: ToggleRule;
  fullWidthSpace: ToggleRule;
  jciNihon: JciNihonRule;
  halfWidthBrackets: BracketRule;
  halfWidthNakaguro: NakaguroRule;
}

/** 年度別ルールセット全体（rules/YYYY.json の形） */
export interface RuleSet {
  year: number;
  exactRules: ExactRule[];
  contextRules: ContextRuleMeta[];
  formatRules: FormatRules;
}

// ============================================================
// チェック結果の型
// ============================================================

export type Severity = "ERROR" | "WARNING" | "TYPO";

export type ResultCategory =
  | "指定句"
  | "全角半角"
  | "スペース"
  | "記号"
  | "JCI日本"
  | "かぎ括弧"
  | "中黒"
  | "文脈確認"
  | "表記ゆれ"
  | "誤字脱字";

export interface CheckResult {
  id: string;
  severity: Severity;
  category: ResultCategory;
  /** 該当文字 */
  matched: string;
  /** 正しい表現（複数候補がある場合は suggestions を使用） */
  suggestion: string;
  /** JCI日本のように候補が複数あり、利用者が選択すべき場合に使用 */
  suggestions?: string[];
  /** 理由 */
  reason: string;
  /** 該当箇所の前後文章 */
  contextText: string;
  /** 行番号（1始まり） */
  line: number;
  /** 文字位置（行内、1始まり） */
  column: number;
  /** 本文全体内での開始位置（ハイライト用） */
  startIndex: number;
  /** 本文全体内での終了位置（ハイライト用、非包含） */
  endIndex: number;
}

export interface CheckSummary {
  errorCount: number;
  warningCount: number;
  typoCount: number;
  totalCount: number;
}

export interface CheckResponse {
  year: number;
  results: CheckResult[];
  summary: CheckSummary;
}
