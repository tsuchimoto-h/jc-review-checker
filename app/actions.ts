"use server";

import { checkText } from "@/lib/checker";
import { getRuleSet } from "@/lib/ruleLoader";
import type { CheckResponse } from "@/lib/types";

/**
 * 議案本文と対象年度を受け取り、統一ルールチェックを実行するServer Action。
 * ルール判定はすべてサーバー側（プログラム）で行い、AIには文脈依存部分のみを
 * 将来的に組み込む想定（現状はルールベースのみ）。
 */
export async function runCheck(text: string, year: number): Promise<CheckResponse> {
  const ruleSet = getRuleSet(year);
  return checkText(text, ruleSet);
}
