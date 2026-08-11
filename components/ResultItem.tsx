import type { CheckResult } from "@/lib/types";

const SEVERITY_STYLE: Record<CheckResult["severity"], { label: string; cls: string }> = {
  ERROR: { label: "ERROR", cls: "bg-err-bg text-err border-err-border" },
  WARNING: { label: "WARNING", cls: "bg-warn-bg text-warn border-warn-border" },
  TYPO: { label: "TYPO", cls: "bg-typo-bg text-typo border-typo-border" },
};

interface Props {
  result: CheckResult;
  isActive: boolean;
  onSelect: (id: string) => void;
}

export default function ResultItem({ result, isActive, onSelect }: Props) {
  const style = SEVERITY_STYLE[result.severity];

  return (
    <button
      type="button"
      onClick={() => onSelect(result.id)}
      className={`w-full rounded-lg border bg-white p-4 text-left shadow-sm transition hover:shadow-md ${
        isActive ? "ring-2 ring-brand" : ""
      }`}
    >
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className={`rounded border px-2 py-0.5 text-xs font-bold ${style.cls}`}>
          {style.label}
        </span>
        <span className="text-xs text-ink-500">{result.category}</span>
        <span className="ml-auto text-xs text-ink-500">
          {result.line}行目 / {result.column}文字目
        </span>
      </div>

      <div className="mb-1 text-sm">
        <span className="text-ink-500">該当箇所：</span>
        <span className="font-semibold text-ink-900">「{result.matched}」</span>
      </div>

      <div className="mb-1 text-sm">
        <span className="text-ink-500">推奨：</span>
        {result.suggestions && result.suggestions.length > 1 ? (
          <span className="font-semibold text-ink-900">
            {result.suggestions.map((s) => `「${s}」`).join(" または ")}
          </span>
        ) : (
          <span className="font-semibold text-ink-900">「{result.suggestion}」</span>
        )}
      </div>

      <div className="mb-2 text-sm text-ink-700">
        <span className="text-ink-500">理由：</span>
        {result.reason}
      </div>

      <div className="rounded bg-ink-100 px-2 py-1.5 font-mono text-xs text-ink-700">
        {result.contextText}
      </div>
    </button>
  );
}
