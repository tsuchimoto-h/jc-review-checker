"use client";

import { Fragment, useMemo } from "react";
import type { CheckResult } from "@/lib/types";
import { removeOverlaps } from "@/lib/textUtils";

interface Props {
  text: string;
  results: CheckResult[];
  activeId: string | null;
  registerMarkRef: (id: string, el: HTMLElement | null) => void;
  onSelect: (id: string) => void;
}

export default function HighlightedText({
  text,
  results,
  activeId,
  registerMarkRef,
  onSelect,
}: Props) {
  const segments = useMemo(() => {
    const nonOverlapping = removeOverlaps(results);
    const parts: Array<
      | { type: "text"; value: string }
      | { type: "mark"; value: string; result: CheckResult }
    > = [];

    let cursor = 0;
    for (const r of nonOverlapping) {
      if (r.startIndex > cursor) {
        parts.push({ type: "text", value: text.slice(cursor, r.startIndex) });
      }
      parts.push({ type: "mark", value: text.slice(r.startIndex, r.endIndex), result: r });
      cursor = r.endIndex;
    }
    if (cursor < text.length) {
      parts.push({ type: "text", value: text.slice(cursor) });
    }
    return parts;
  }, [text, results]);

  return (
    <div className="whitespace-pre-wrap break-words rounded-lg border border-ink-300 bg-white p-4 font-mono text-sm leading-7 text-ink-900">
      {segments.map((seg, i) =>
        seg.type === "text" ? (
          <Fragment key={i}>{seg.value}</Fragment>
        ) : (
          <mark
            key={seg.result.id}
            ref={(el) => registerMarkRef(seg.result.id, el)}
            className={`severity-${seg.result.severity} ${
              seg.result.id === activeId ? "is-active" : ""
            }`}
            title={`${seg.result.category}：${seg.result.reason}`}
            onClick={() => onSelect(seg.result.id)}
          >
            {seg.value}
          </mark>
        )
      )}
    </div>
  );
}
