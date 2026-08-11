import type { CheckResult } from "@/lib/types";
import ResultItem from "./ResultItem";

interface Props {
  results: CheckResult[];
  activeId: string | null;
  onSelect: (id: string) => void;
}

export default function ResultsList({ results, activeId, onSelect }: Props) {
  if (results.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-ink-300 bg-white p-8 text-center text-sm text-ink-500">
        指摘事項はありませんでした。
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {results.map((result) => (
        <ResultItem
          key={result.id}
          result={result}
          isActive={result.id === activeId}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
