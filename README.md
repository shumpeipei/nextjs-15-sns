# Next.js SNS

Next.js App Routerで構成したSNSのサンプルです。Clerkで認証し、Prisma + PostgreSQLでユーザー/投稿/いいね/フォローを永続化しています。

## 主な機能
- タイムライン（自分 + フォロー中の投稿を表示）
- 投稿作成（140文字制限、Zodでバリデーション）
- いいね（楽観的UI）
- フォロー/フォロー解除（楽観的UI）
- プロフィールページ（投稿/フォロー数表示）

## 技術スタック
- Next.js 14.2（App Router）
- React 18 / TypeScript
- Tailwind CSS
- Clerk（認証）
- Prisma / PostgreSQL

## ドメイン設計（主要エンティティ）
- `User` ユーザー本体（Clerk連携）。投稿、いいね、返信、フォロー関係の起点。
- `Post` 投稿。`User`が作成し、`Like`や`Reply`を持つ。
- `Like` ユーザーが投稿に付けるいいね。`User`と`Post`の中間テーブル。
- `Reply` 投稿への返信。`User`と`Post`に紐づく。
- `Follow` フォロー関係。`User`同士の中間テーブル（フォロー/フォロワー）。

## 主要ディレクトリ
- `app/` ルーティング・ページ・レイアウト
- `components/` UIコンポーネント
- `lib/` サーバーアクション、Prismaクライアント、データ取得
- `prisma/` スキーマ定義

## セットアップ

### 1) 依存関係のインストール
```bash
npm install
```

### 2) 環境変数を設定
`.env.local`に必要な値を設定してください。

```bash
# Database
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DB_NAME"

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."
WEBHOOK_SECRET="whsec_..."
```

### 3) Prismaの初期化
```bash
npx prisma migrate dev
```

### 4) 開発サーバー起動
```bash
npm run dev
```
ブラウザで `http://localhost:3000` を開いてください。

### 5) ngrokで外部公開（任意）
別ターミナルで以下を実行すると、外部URLでアクセスできます。
```bash
ngrok http 3000
```
起動時に表示されるURLを利用してください。

## Webhook
ClerkのWebhook送信先は次のエンドポイントです。
- `POST /api/callback/clerk`

`user.created` と `user.updated` を受信して、Prismaの`User`を作成/更新します。

## スクリプト
- `npm run dev` 開発サーバー起動
- `npm run build` ビルド
- `npm run start` 本番起動
- `npm run lint` Lint実行

## 補足
- プロフィールページ: `app/profile/[username]/page.tsx`
- タイムライン表示: `lib/postDataFetcher.ts`
- 投稿/いいね/フォローのサーバーアクション: `lib/action.ts`
