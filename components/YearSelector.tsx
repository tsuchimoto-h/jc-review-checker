"use client";

interface Props {
  years: number[];
  value: number;
  onChange: (year: number) => void;
}

export default function YearSelector({ years, value, onChange }: Props) {
  return (
    <label className="flex items-center gap-2 text-sm font-medium text-ink-700">
      年度：
      <select
        className="rounded-md border border-ink-300 bg-white px-3 py-1.5 text-sm text-ink-900 shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      >
        {years.map((year) => (
          <option key={year} value={year}>
            {year}年度
          </option>
        ))}
      </select>
    </label>
  );
}
