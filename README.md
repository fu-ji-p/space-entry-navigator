# 宇宙産業参画シミュレーター（Space Entry Navigator）

異分野企業が宇宙産業への参画を検討する際に、自社の「関与類型（D-〜D5）」を見立て、期待できる「便益（B1〜B3、16 項目）」と越えるべき「障壁（W1〜W3、5 項目）」を可視化し、検討メモとして持ち帰れる単一ページ Web アプリです。

公開版: https://fu-ji-p.github.io/space-entry-navigator/

本ツールの結果は予測ではなく、検討の論点を整理するための地図です。設計の詳細は [docs/SPEC.md](docs/SPEC.md)、実装時の判断は [docs/DECISIONS.md](docs/DECISIONS.md) を参照してください。

## 技術スタック

- Vite 6 + React 18 + TypeScript（strict）
- Tailwind CSS v3、Vitest（グラフライブラリは使わず、段階を ★/▲ の記号で表示）
- バックエンド・DB・外部 API・認証なし。状態はメモリと URL ハッシュのみ。外部へのネットワーク通信なし（フォントはシステムフォント）

## ローカルで動かす

```bash
npm install
npm run dev
```

ブラウザで `http://localhost:5173/` を開きます。

| コマンド | 内容 |
| --- | --- |
| `npm run dev` | 開発サーバー |
| `npm run build` | 本番ビルド（`dist/`）。事前に `check:anon` と型チェックが走ります |
| `npm run preview` | ビルド成果物のプレビュー |
| `npm run test` | Vitest（スコアリング・診断・考察・URL 状態・レポート） |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run check:anon` | 禁止語チェック（後述） |

## GitHub Pages へのデプロイ

`vite.config.ts` の `base` は環境変数 `VITE_BASE`（既定 `/`）で切り替えます。ルーティングはハッシュ方式なので、サブパス配信でも 404 対策は不要です。

### GitHub Actions（推奨）

`.github/workflows/deploy.yml` を同梱しています。リポジトリの Settings → Pages → Build and deployment → Source を **GitHub Actions** にし、`main` に push すると自動でビルド・公開されます。`VITE_BASE` にはリポジトリ名が自動で入ります。

### 手動（gh-pages ブランチ）

```bash
VITE_BASE=/<リポジトリ名>/ npm run build
npx gh-pages -d dist
```

ユーザーサイト（`<user>.github.io` リポジトリ）に置く場合は `VITE_BASE` を指定せず `/` のままでかまいません。

## データファイルの編集方法

枠組みの定義・数値・文言はすべて `src/data/` にあり、ロジックや UI にはハードコードしていません。ファイルを書き換えて `npm run build` し直すだけで表示に反映されます。

| ファイル | 内容 |
| --- | --- |
| `src/data/types.ts` | 関与類型 D の定義文・例、段数の順序 |
| `src/data/questions.ts` | 類型診断の質問（現在地版・目標版） |
| `src/data/benefits.ts` | 便益 B の定義・キャッチコピー・例・関連項目 |
| `src/data/barriers.ts` | 障壁 W の定義・下げるスライダー・`distinctNature` |
| `src/data/relevance.ts` | 類型×便益の関連度、類型×障壁の基礎障壁（0〜3） |
| `src/data/pairs.ts` | 便益⇔障壁の対応（表と裏） |
| `src/data/weights.ts` | 係数（k、段数差、動機、希少性、トグル、便益の基礎点の尺度） |
| `src/data/bands.ts` | 表示用の 3 段階（低・中・高）の閾値と記号（★/▲） |
| `src/data/insights.ts` | 考察ルール（条件関数・優先度・本文） |
| `src/data/layers.ts` | 層のラベルと色 |
| `src/data/ja.ts` | UI 文言、スライダー各段階の説明、動機の表示名 |
| `src/config/attribution.ts` | 出典表記（匿名化の唯一の編集点） |

### よくある編集

- **マトリクスの数値を変える**: `relevance.ts` の `row(D0, D1, D2, D3, D4, D5)` を書き換えます。値は 0〜3 です。
- **考察メッセージを書き直す**: `insights.ts` の `title` / `body` を編集します。条件は `when: (input, scores) => boolean` で、`scores.barriers.W3` などを参照できます。`priority` が小さいほど先に表示され、最大 `MAX_INSIGHTS` 件です。
- **スライダーの段階説明を変える**: `ja.ts` の `sliders.<key>.levels` を編集します。
- **出典表記を変える**: `attribution.ts` の `ATTRIBUTION_TEXT` を編集します。
- **英語化する**: `ja.ts` と同じ構造の `en.ts` を追加し、各所の `import { ja }` を切り替える設計です（今回のスコープ外）。

### スコアの計算と表示（概要）

画面・レポートには数値も棒グラフも出さず、「低・中・高」の 3 段階を記号（便益は ★★☆、障壁は ▲▲△）と文字で表示します。論文の枠組みは定性的な関係を述べたもので、数値的な度合いには根拠がないためです。内部では以下の相対スコア（0〜100）を計算し、`src/data/bands.ts` の閾値（既定: 34 未満が低、67 未満が中、それ以外が高）で段階に丸めています。既定ではマトリクスの関連度 1・2・3 がそのまま低・中・高に対応し、動機・希少性・トグルで一段動き得ます。考察ルールの条件も段階で書いています。

- 障壁: `100 × base/3 × (1 − k × (r − 1)/4) × (1 + 0.1 × gap)` にトグル係数を乗じ、0〜100 にクリップ
- 便益: `100 × 0.75 × rel/3 × 動機係数 × 希少性係数 × 公的資金係数 × 宇宙固有価値係数` を 0〜100 にクリップ（0.75 は `BENEFIT_BASE_SCALE`。詳細は DECISIONS.md）

ロジックは `src/logic/score.ts` の純粋関数で、`tests/score.test.ts` で検証しています。

## 匿名化チェック

`scripts/anon-words.txt` に禁止語（個人名・所属組織名・論文タイトル・学会名など）を 1 行 1 語で記入すると、`npm run check:anon`（および `npm run build` の前処理）が `src/ docs/ public/ README.md index.html .github/` を走査し、該当があれば失敗します。リストが空のときは判定を行いません。このファイル自身は走査対象外です。

## URL 共有

シミュレーターの入力は `#simulate?s=<base64url(JSON)>` としてハッシュに保持されます。短縮キーは `c`（現在地）`t`（目標）`k`（資本余力）`p`（時間許容度）`f`（技術親和性）`s`（宇宙固有知）`v`（納得度）`m`（動機）`u`（公的支援）`o`（宇宙固有価値）です。復号に失敗した場合は初期値で開きます。診断の回答はハッシュに含めません。

## ディレクトリ構成

```
docs/            仕様書・判断記録
public/          静的ファイル
scripts/         禁止語チェック
src/config/      出典表記
src/data/        ドメインデータ・文言・係数
src/logic/       スコアリング・診断・考察・URL 状態・レポート（純粋関数）
src/components/  UI 部品
src/pages/       5 画面
tests/           Vitest
```
