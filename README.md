# agent-team-snapshots

このリポジトリは、エージェント運用資産（agents / prompts / skills / scripts）のスナップショットをバージョン単位で管理します。

## 最新バージョン

- 最新: `v0.0.2`
- 対象ディレクトリ: [v0.0.2](v0.0.2)

## v0.0.2 のセットアップ（リポジトリ内完結）

`v0.0.2` を作業ルートにして実行します。

```bash
cd v0.0.2
npm install
npm run hooks:install
npm run guard:sync:compose
npm run guard:verify
```

必要に応じてフル検証を実行します。

```bash
npm run guard:verify:full
npm run guard:verify:deterministic
```

詳細は以下を参照してください。

- 再現ブートストラップ設計: [v0.0.2/docs/qa/github-mcp-reproducible-bootstrap.md](v0.0.2/docs/qa/github-mcp-reproducible-bootstrap.md)
- 再現マニフェスト: [v0.0.2/docs/qa/repro-manifest.json](v0.0.2/docs/qa/repro-manifest.json)
- Scripts 構成: [v0.0.2/scripts/README.md](v0.0.2/scripts/README.md)
- Skills ガイド: [v0.0.2/docs/skills/README.md](v0.0.2/docs/skills/README.md)

## 旧バージョン

- [v0.0.1](v0.0.1): 旧スナップショット（比較・参照用）
