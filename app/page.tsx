"use client";

import { useCallback, useRef, useState } from "react";
import { runCheck } from "./actions";
import { DEFAULT_YEAR, getAvailableYears } from "@/lib/ruleLoader";
import type { CheckResponse } from "@/lib/types";
import YearSelector from "@/components/YearSelector";
import InputPanel from "@/components/InputPanel";
import ResultsSummary from "@/components/ResultsSummary";
import ResultsList from "@/components/ResultsList";
import HighlightedText from "@/components/HighlightedText";

const EMPTY_RESPONSE: CheckResponse = {
  year: DEFAULT_YEAR,
  results: [],
  summary: { errorCount: 0, warningCount: 0, typoCount: 0, totalCount: 0 },
};

export default function Home() {
  const years = getAvailableYears();
  const [year, setYear] = useState(DEFAULT_YEAR);
  const [text, setText] = useState("");
  const [checkedText, setCheckedText] = useState("");
  const [response, setResponse] = useState<CheckResponse>(EMPTY_RESPONSE);
  const [isChecking, setIsChecking] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hasChecked, setHasChecked] = useState(false);

  const markRefs = useRef<Map<string, HTMLElement>>(new Map());

  const registerMarkRef = useCallback((id: string, el: HTMLElement | null) => {
    if (el) markRefs.current.set(id, el);
    else markRefs.current.delete(id);
  }, []);

  const handleCheck = useCallback(async () => {
    setIsChecking(true);
    try {
      const result = await runCheck(text, year);
      setResponse(result);
      setCheckedText(text);
      setHasChecked(true);
      setActiveId(null);
    } finally {
      setIsChecking(false);
    }
  }, [text, year]);

  const handleClear = useCallback(() => {
    setText("");
    setCheckedText("");
    setResponse(EMPTY_RESPONSE);
    setActiveId(null);
    setHasChecked(false);
  }, []);

  const handleSelect = useCallback((id: string) => {
    setActiveId(id);
    const el = markRefs.current.get(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-ink-300 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">JC議案チェッカー</h1>
          <p className="mt-1 text-sm text-ink-500">
            日本青年会議所 年度別統一ルールに基づく議案文章の表記チェックツール
          </p>
        </div>
        <YearSelector years={years} value={year} onChange={setYear} />
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-ink-700">議案本文</h2>
        <InputPanel
          value={text}
          onChange={setText}
          onCheck={handleCheck}
          onClear={handleClear}
          isChecking={isChecking}
        />
      </section>

      {hasChecked && (
        <section className="flex flex-col gap-4 border-t border-ink-300 pt-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-ink-700">チェック結果</h2>
            <ResultsSummary summary={response.summary} />
          </div>

          {response.results.length > 0 && (
            <div className="flex flex-col gap-2">
              <h3 className="text-xs font-semibold text-ink-500">
                ハイライトプレビュー（クリックで該当項目を確認できます）
              </h3>
              <HighlightedText
                text={checkedText}
                results={response.results}
                activeId={activeId}
                registerMarkRef={registerMarkRef}
                onSelect={handleSelect}
              />
            </div>
          )}

          <div className="grid gap-2">
            <h3 className="text-xs font-semibold text-ink-500">指摘一覧（クリックで該当箇所へスクロール）</h3>
            <ResultsList results={response.results} activeId={activeId} onSelect={handleSelect} />
          </div>
        </section>
      )}

      <footer className="mt-4 border-t border-ink-300 pt-4 text-xs text-ink-500">
        本ツールは表記・統一ルールの校正のみを行います。議案内容の評価、事業内容への改善提案、
        背景・目的・手法の整合性評価、採点・審査は行いません。
      </footer>
    </main>
  );
}
