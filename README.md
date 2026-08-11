# JC議案チェッカー

日本青年会議所の年度別統一ルールに基づき、議案文章の

- 指定句（NG表現・言い換え）
- 表記ゆれ
- 誤字脱字（重複文字など）
- 全角半角
- スペース
- その他の指定表記ルール（JCI日本、かぎ括弧、中黒 等）

をチェックするWebアプリです。

**議案内容そのものの評価（背景・目的・手法の整合性、事業内容への改善提案、採点・審査など）は一切行いません。純粋な表記・統一ルールの校正に特化しています。**

---

## 1. 起動方法

### 必要環境

- Node.js 18.17 以降
- npm（または pnpm / yarn）

### 手順

```bash
# 1. 依存パッケージのインストール
npm install

# 2. 開発サーバーの起動
npm run dev
```

ブラウザで `http://localhost:3000` を開くとアプリが表示されます。

### 本番ビルド

```bash
npm run build
npm run start
```

---

## 2. ファイル構成

```
jc-review-checker/
├── app/
│   ├── page.tsx           … メイン画面（入力欄・結果表示のUI/状態管理）
│   ├── actions.ts         … Server Action（チェック処理の呼び出し口）
│   ├── layout.tsx          … 全体レイアウト（<html>/<body>、メタ情報）
│   └── globals.css         … 全体スタイル（Tailwind + ハイライト用CSS）
│
├── components/
│   ├── YearSelector.tsx     … 年度選択プルダウン
│   ├── InputPanel.tsx       … 議案本文入力欄・チェック/クリアボタン
│   ├── HighlightedText.tsx  … 入力文章のハイライトプレビュー表示
│   ├── ResultsSummary.tsx   … 「エラー○件 / 要確認○件 / 誤字脱字○件」サマリー
│   ├── ResultsList.tsx      … チェック結果一覧
│   └── ResultItem.tsx       … チェック結果1件分のカード表示
│
├── lib/
│   ├── types.ts              … ルールマスター／チェック結果の型定義
│   ├── ruleLoader.ts          … 年度別ルールセットの読み込み（★年度追加時に編集）
│   ├── checker.ts             … チェック処理全体のオーケストレーション
│   ├── exactChecker.ts        … 指定句マスターに基づく完全一致チェック（ERROR）
│   ├── formatChecker.ts       … 全角半角・スペース・記号・JCI日本 等（ERROR/WARNING）
│   ├── contextChecker.ts      … 文脈判定が必要な項目のチェック（WARNING）
│   ├── typoChecker.ts         … 誤字脱字（重複文字）チェック（TYPO）
│   ├── mixedUsageChecker.ts   … 同一文書内の表記ゆれチェック（TYPO）
│   └── textUtils.ts           … 行番号・文字位置・前後文章抽出などの共通処理
│
├── rules/
│   └── 2026.json            … ★2026年度の統一ルールマスター（本体）
│
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.mjs
└── README.md
```

### 処理の流れ（`lib/checker.ts`）

`checkText(text, ruleSet)` が全体のエントリポイントです。設計方針の「AI使用方針」に準拠し、以下の順序で処理します。

1. **ルールベース判定**（`exactChecker.ts` / `formatChecker.ts`）
   指定句マスターとの完全一致、全角半角・記号・スペースなどの機械的な判定。**AIには一切判定させず、必ずプログラム側で判定します。**
2. **文脈依存チェック**（`contextChecker.ts`）
   「青年会議所／JC」「私たち／メンバー／会員」「はじめ／始め」「うえで／上で」など、単純な置換ができない項目を洗い出し、**必ずWARNING（要確認）として提示**します（自動での書き換えは行いません）。
3. **誤字脱字・表記ゆれチェック**（`typoChecker.ts` / `mixedUsageChecker.ts`）
   重複文字（例：「行うう」「するることで」）や、同一文書内での表記ゆれ（例：「メンバー」と「会員」の混在）を検出します。**文章表現の改善提案は行いません。**

現バージョンではこれらすべてをルールベースのヒューリスティックで実装しており、AI（LLM）呼び出しは行っていません。将来的にAIを組み込む場合は、`contextChecker.ts` / `typoChecker.ts` が返す候補に対して、AIには「本当に確認が必要な箇所の絞り込み」や「理由文の精緻化」のみを担わせ、指定句そのものの正誤判定はAIに委ねない設計を維持してください（`lib/checker.ts` のコメント参照）。

---

## 3. ルール追加方法（同一年度内でのルール追加・修正）

年度別ルールは `rules/2026.json` にJSON形式で管理されています。コードの変更は不要です。

### 指定句（NG表現→正しい表現）を追加する

`exactRules` 配列に `{ "ok": "正しい表記", "ng": ["NG表記1", "NG表記2"] }` の形式で追記します。

```json
{ "ok": "取り組み", "ng": ["取組", "取組み"] }
```

### 全角半角・記号などの表記ルールを変更する

`formatRules` 内の各項目（`fullWidthAlnumSymbol` / `fullWidthSpace` / `jciNihon` / `halfWidthBrackets` / `halfWidthNakaguro`）の `enabled` を `true`/`false` で切り替えたり、`description` や候補（`suggestions` 等）を編集できます。

### 文脈判定項目（青年会議所/JC など）を追加する

`contextRules` はUIやドキュメント表示用のメタ情報です。実際の判定ロジックそのものを追加・変更したい場合は `lib/contextChecker.ts` に判定関数を追加し、`checkContextRules()` から呼び出してください（文脈判定はJSONだけでは表現しきれないロジックのため、プログラム側の実装が必要です）。

---

## 4. 2027年度ルールの追加方法

将来、年度が変わってルールが更新された場合の手順です。**コードの構造自体は変更不要**で、以下の2ステップだけで切り替えられます。

### 手順

1. **`rules/2027.json` を作成する**
   `rules/2026.json` をコピーして、2027年度版の指定句・表記ルールに書き換えます。

   ```
   rules/
     2026.json
     2027.json   ← 新規作成
   ```

   ```json
   {
     "year": 2027,
     "exactRules": [ ... 2027年度の指定句マスター ... ],
     "contextRules": [ ... ],
     "formatRules": { ... }
   }
   ```

2. **`lib/ruleLoader.ts` に2027年度を登録する**

   ```ts
   import rules2026 from "@/rules/2026.json";
   import rules2027 from "@/rules/2027.json"; // ← 追加

   const RULE_SETS: Record<number, RuleSet> = {
     2026: rules2026 as unknown as RuleSet,
     2027: rules2027 as unknown as RuleSet, // ← 追加
   };
   ```

以上で、画面上部の年度プルダウンに自動的に「2027年度」が追加され、選択して2027年度ルールでチェックできるようになります（`DEFAULT_YEAR` を変更しない限り、初期選択値は2026年度のままです）。

年度によって文脈判定のロジック自体（「私たち／メンバー」の使い分け基準など）が変わる場合は、`lib/contextChecker.ts` 側で `ruleSet.year` を参照した分岐を追加してください。

---

## 5. 今後の拡張予定（Ver.1では未実装）

設計上、以下は将来追加できる構造にしていますが、Ver.1では実装していません。

- Word / PDF / Excel ファイルのアップロードチェック
- フォント・文字サイズ・太字・下線・インデント・改ページ・ファイル名等のチェック
- AI（LLM）による文脈依存チェックの精度向上

---

## 6. 対象外の機能（意図的に実装していません）

- 議案内容そのものの改善提案
- 事業内容の評価
- 背景・目的・手法の整合性評価
- 議案がJC運動として適切かどうかの評価
- 採点・議案審査

本ツールはあくまで「年度別統一ルールに沿った表記になっているか」「誤字脱字がないか」を確認する校正ツールです。
