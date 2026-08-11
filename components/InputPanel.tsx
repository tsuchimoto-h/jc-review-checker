"use client";

interface Props {
  value: string;
  onChange: (value: string) => void;
  onCheck: () => void;
  onClear: () => void;
  isChecking: boolean;
}

export default function InputPanel({ value, onChange, onCheck, onClear, isChecking }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <textarea
        className="h-72 w-full resize-y rounded-lg border border-ink-300 bg-white p-4 font-mono text-sm leading-7 text-ink-900 shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
        placeholder="議案本文をここに貼り付けてください…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
      />
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onCheck}
          disabled={isChecking || value.trim().length === 0}
          className="rounded-md bg-brand px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isChecking ? "チェック中…" : "チェックする"}
        </button>
        <button
          type="button"
          onClick={onClear}
          disabled={isChecking}
          className="rounded-md border border-ink-300 bg-white px-5 py-2 text-sm font-semibold text-ink-700 shadow-sm transition hover:bg-ink-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          クリア
        </button>
        <span className="ml-auto text-xs text-ink-500">{value.length}文字</span>
      </div>
    </div>
  );
}
