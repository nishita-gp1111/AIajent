# KUROKO AI MVP

店舗向けAIマーケティング運用サービス「KUROKO AI」の管理画面MVPです。

## 現在使える機能

- デモログイン
- 店舗登録・編集
- 対策キーワード最大20個、NG表現、自動化モード管理
- 店舗情報に合わせたGBP、note、LINE、口コミ、FAQ、店舗改善の提案生成
- 提案の編集、承認、却下、投稿済み変更
- 投稿履歴検索
- 星評価別の口コミ返信テンプレート編集
- 安全な星4から5口コミのテンプレート自動返信
- 低評価・クレーム口コミの承認フロー
- 外部連携状況の確認

## 重要: 利用モード

環境変数を設定しない場合はデモモードです。

- データはブラウザの `localStorage` に保存されます。
- AI提案はローカルのモック生成です。
- Googleへの実投稿・実返信は行いません。

実店舗で本番運用するには、Supabase、OpenAI API、Google Business Profile APIの設定が必要です。

## ローカル起動

```bash
npm install
npm run dev
```

ブラウザで `http://127.0.0.1:3000` を開きます。ログイン画面の初期メールアドレスでそのままログインできます。

## 環境変数

`.env.example` を `.env.local` に複製し、必要な値を設定します。

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=
```

## Supabase

1. Supabaseでプロジェクトを作成します。
2. SQL Editorで `database/schema.sql` を実行します。
3. `.env.local` にURLとキーを設定します。
4. Supabase Authでメール認証を有効にします。

`database/schema.sql` には主要テーブルとRLSポリシーが含まれます。本番投入前には、組織作成・初期owner登録をサーバー処理またはDB関数にまとめてください。

## 本番化で残っている作業

- デモ認証からSupabase Authへの切り替え
- localStorageからSupabase DBへの切り替え
- モック提案生成からOpenAI APIへの切り替え
- Google OAuthとGBPロケーション紐付け
- Google口コミ同期・実返信
- GBP投稿・画像保存・実投稿
- Vercel環境変数と定期実行設定

## 検証

```bash
npm run typecheck
npm run build
```
