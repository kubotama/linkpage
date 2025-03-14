# linkpage

## 概要

linkpage は、手元にあると便利なツールを集めたウェブアプリケーションです。

- ブックマーク
- タイマー

ブックマーク機能は、ユーザーはブックマークを登録できるようになります。

タイマー機能は、設定した時間ごとにアラームが鳴ります。

## インストール方法

```bash
# リポジトリのクローン
git clone https://github.com/kubotama/linkpage.git

# プロジェクトディレクトリに移動
cd linkpage

# 依存パッケージのインストール
npm install
```

## 使用方法

### 開発サーバーの起動

```bash
npm run dev
```

このコマンドを実行すると、開発サーバーが起動し、通常は http://localhost:3000 でアプリケーションにアクセスできます。

### ビルド

```bash
npm run build
```

### 本番環境での実行

```bash
npm run start
```

## データ構造

linkpage はリンクデータを JSON 形式で管理します。基本的な構造は以下の通りです：

```json
{
  [
    {
      "title": "リンクタイトル",
      "url": "https://example.com",
    }
  ]
}
```

## ブックマーク機能

ブックマークを登録するときの参考にするために、入力した URL のページの title タグを取得できます。取得したタイトルを編集してブックマークを登録できます。

ブックマークを登録するときのURLを整形する機能があります。

- #や?の後ろを削除します。

|整形前|整形後|
|-----|-----|
|https://mail.google.com/mail/u/0/#inbox|https://mail.google.com/mail/u/0/|

- URLから/の階層を一段、削除します。

|整形前|整形後|
|-----|-----|
|https://mail.google.com/mail/u/0/#inbox|https://mail.google.com/mail/u/0/|
|https://mail.google.com/mail/u/0/|https://mail.google.com/mail/u/|
|https://mail.google.com/mail/u/0|https://mail.google.com/mail/u/|
|https://xtech.nikkei.com/atcl/nxt/column/18/00148/030500376/?n_cid=nbpnxt_mled_itmh|https://xtech.nikkei.com/atcl/nxt/column/18/00148/030500376/
|https://xtech.nikkei.com|https://xtech.nikkei.com|
|https://xtech.nikkei.com/|https://xtech.nikkei.com/|

## カスタマイズ

独自のリンク集を作成するには、`bookmark.json`ファイルを編集してください。

## 技術スタック

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)

## ライセンス

このプロジェクトは[MIT ライセンス](LICENSE)の下で公開されています。
