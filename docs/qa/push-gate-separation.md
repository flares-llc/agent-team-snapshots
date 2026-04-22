# Push Gate Separation Playbook

このドキュメントは、push 時間の増大を抑えつつ、main への品質保証を強化する運用を定義します。

## 目的

- ローカル push の待ち時間を最小化する
- main へのマージ前に deterministic な検証を必須化する
- ブランチ保護で運用逸脱を防ぐ

## 分離方針

- ローカル: quick gate（pre-push）
- GitHub Actions: deterministic gate（必須）
- ブランチ保護: `Quality Gates / deterministic` を Required status checks に設定

## ローカル運用（軽量）

- pre-push フックが `scripts/qa/verify-gates.sh quick` を実行
- 変更ファイルが docs 系のみの場合は quick gate を即時通過
- docs 以外の変更では unit test のみ実行

## CI 運用（厳格）

- workflow: `.github/workflows/quality-gates.yml`
- 実行コマンド: `npm run guard:verify:deterministic`
- deterministic gate の内容
  - unit test を 2 回実行（再現性確認）
  - `npm pack --dry-run`（配布整合性確認）

## 実践最適化

- 変更範囲実行
  - quick は変更ファイルから docs-only を判定して最短終了
- キャッシュ
  - Actions で `actions/setup-node` の `cache: npm` を有効化
- 実行順最適化
  - 速いチェック（unit test）を先に実行し、失敗を早期検出
  - 重いチェック（pack dry-run / deterministic replay）は strict gate のみ

## ブランチ保護チェックリスト

GitHub の branch protection rules で以下を設定する。

1. Require a pull request before merging を有効化
2. Require status checks to pass before merging を有効化
3. Required status checks に `Quality Gates / deterministic` を追加
4. Require branches to be up to date before merging を有効化

## ローカル検証コマンド

- quick: `npm run guard:verify:quick`
- full: `npm run guard:verify:full`
- deterministic（通常は CI で実行）: `CI=true npm run guard:verify:deterministic`
