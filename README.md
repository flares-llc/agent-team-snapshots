# agent-team-snapshots

このリポジトリは、エージェント運用向けのスナップショットです。

- Agent 定義（Coordinator / Detector / Solver / Writer / Deployer）
- 品質ゲート・運用ルール
- デプロイ/公開切り替え用スクリプトのテンプレート
- QA 補助スクリプト

## ディレクトリ構成

- `.github/`
  - `agents/`: エージェント定義
  - `instructions/`: 品質ゲートなどの指示
  - `skills/`: 設計・テスト作成向けスキル
- `docs/skills/`
  - スキル利用ガイド
- `scripts/`
  - `commands/`: 手動運用コマンド（deploy / toggle-public）
  - `qa/`: 品質検証・補助スクリプト

## 主なコマンド

実行エントリポイント:

- `./scripts/commands/deploy.sh [frontend|backend|all]`
- `./scripts/commands/toggle-public.sh [public|private]`

後方互換ラッパー:

- `./scripts/deploy.sh`
- `./scripts/toggle-public.sh`

## 注意

このスナップショット内のデプロイ/公開切り替えスクリプトはテンプレートです。
`<project-id>` や `<region>` などのプレースホルダーを、実環境の値に置き換えて利用してください。

## 参照

- 運用ガイド: `docs/skills/deployment-and-access.md`
- スクリプト概要: `scripts/README.md`
- 共通ルール: `AGENTS.md`
