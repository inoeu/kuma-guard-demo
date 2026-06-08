# KumaGuard — クマ早期警戒・対応支援システム（デモ）

AIカメラ・ドローン調査・地図ダッシュボードで、自治体向けに「クマ出没の早期検知 → 職員による人間承認 → 住民通知・現場出動 → 記録」までを一画面で支援する運用デモです。

🔗 **公開デモ: https://inoeu.github.io/kuma-guard-demo/**

主な画面（ハッシュルーティング）:
- `#/dashboard` 今日の判断（警戒レベル・承認待ち・対応判断パネル）
- `#/alerts` アラート確認
- `#/monitor` 監視マップ（地図／航空写真切替）
- `#/field` 現場連携（AI画像判定・通知先・巡回班）
- `#/proposal` 導入提案（費用対効果・月次レポート出力）

## 開発

```bash
npm install
npm run dev                                   # 開発サーバ
npm run build                                 # 本番ビルド（dist/ 出力）
npm run preview -- --host 127.0.0.1 --port 4174
```

## デプロイ

`main` ブランチへの push で GitHub Actions が自動でビルドし、`gh-pages` ブランチへ公開します。

```bash
npm run deploy     # 変更をコミット＆push（= 自動デプロイを起動）
```

## 技術構成

React 19 + Vite。検知映像・証拠サムネ・地図はすべて自己完結のインラインSVGで描画（外部画像なし）。

> ※ 本デモはサンプルデータで動作します。実機材・実通知との接続は含みません。
