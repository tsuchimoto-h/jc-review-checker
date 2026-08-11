import type { CheckSummary } from "@/lib/types";

interface Props {
  summary: CheckSummary;
}

export default function ResultsSummary({ summary }: Props) {
  const items = [
    { label: "エラー", count: summary.errorCount, cls: "bg-err-bg text-err border-err-border" },
    { label: "要確認", count: summary.warningCount, cls: "bg-warn-bg text-warn border-warn-border" },
    { label: "誤字脱字", count: summary.typoCount, cls: "bg-typo-bg text-typo border-typo-border" },
  ];

  return (
    <div className="flex flex-wrap items-center gap-3">
      {items.map((item) => (
        <div
          key={item.label}
          className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold ${item.cls}`}
        >
          <span>{item.label}</span>
          <span className="tabular-nums">{item.count}件</span>
        </div>
      ))}
      {summary.totalCount === 0 && (
        <span className="text-sm text-ink-500">指摘事項はありません。</span>
      )}
    </div>
  );
}
