# linkpage

## 機能

linkpage は、Web サイトのブックマークをウェブアプリケーションです。next.js で開発しています。ブックマーク機能は、テキストボックスに入力した URL とタイトルから、ブックマークを登録できます。

### 「タイトル」ボタン

「URL」テキストボックスに入力されている URL のページのタイトルを取得して、「タイトル」テキストボックスに入力します。

### 「追加」ボタン

「URL」テキストボックスに入力されている URL と、「タイトル」テキストボックスに入力されているタイトルをブックマークに追加します。

### 「クリア」ボタン

「URL」テキストボックスに入力されている URL と、「タイトル」テキストボックスに入力されているタイトルをクリアします。

### 「パラメータ」ボタン

「URL」テキストボックスに入力されている URL のクエリパラメータを削除します。

### 「←」ボタン

「URL」テキストボックスに入力されている URL の階層を一つ下げます。

### 「開く」ボタン

「URL」テキストボックスに入力されている URL をブラウザで開きます。

### 「閉じる」ボタン

エラーメッセージが表示されているときに「閉じる」ボタンが表示されます。「閉じる」ボタンをクリックすると、エラーメッセージを消去します。

### 「選択解除」ボタン

ブックマークが選択されているときに「選択解除」ボタンが表示されます。「選択解除」ボタンをクリックすると、ブックマークの選択が解除されて、URL とタイトルのテキストボックスがクリアされます。

### 「削除」ボタン

ブックマークが選択されているときに「削除」ボタンが表示されます。「削除」ボタンをクリックすると、選択されているブックマークが削除されます。ブックマークの選択が解除されて、URL とタイトルのテキストボックスがクリアされます。

### 「タイトル更新」ボタン

ブックマークが選択されているときに「タイトル更新」ボタンが表示されます。「タイトル更新」ボタンをクリックすると、選択されているブックマークのタイトルが更新されます。

## インストール方法

### リポジトリのクローン

```bash
git clone https://github.com/kubotama/linkpage.git
```

### プロジェクトディレクトリに移動

```bash
cd linkpage
```

### 依存パッケージのインストール

```bash
npm install
```

### テストプログラムの実行

```bash
npm run test
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

linkpage はリンクデータを SQLite のデータベースで管理します。基本的な構造は以下の通りです：

```SQL
    CREATE TABLE IF NOT EXISTS bookmarks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      url TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL
    )
```

## ブックマーク機能

ブックマークを登録するときの参考にするために、入力した URL のページの title タグを取得できます。取得したタイトルを編集してブックマークを登録できます。

ブックマークを登録するときの URL を整形する機能があります。

- #や?の後ろを削除します。(「パラメータ」ボタン)

| 整形前                                  | 整形後                            |
| --------------------------------------- | --------------------------------- |
| https://mail.google.com/mail/u/0/#inbox | https://mail.google.com/mail/u/0/ |

- URL から/の階層を一段、削除します。(「←」ボタン)

| 整形前                                                                              | 整形後                                                       |
| ----------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| https://mail.google.com/mail/u/0/#inbox                                             | https://mail.google.com/mail/u/0/                            |
| https://mail.google.com/mail/u/0/                                                   | https://mail.google.com/mail/u/                              |
| https://mail.google.com/mail/u/0                                                    | https://mail.google.com/mail/u/                              |
| https://xtech.nikkei.com/atcl/nxt/column/18/00148/030500376/?n_cid=nbpnxt_mled_itmh | https://xtech.nikkei.com/atcl/nxt/column/18/00148/030500376/ |
| https://xtech.nikkei.com                                                            | https://xtech.nikkei.com                                     |
| https://xtech.nikkei.com/                                                           | https://xtech.nikkei.com/                                    |

- 入力された URL を開きます。(「開く」ボタン)

## 関連アプリケーション

[ブックマークを登録する拡張機能](https://github.com/kubotama/bookmark-extension)を使うと、アクティブなタブをブックマークに登録できます。

## 技術スタック

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)

## ライセンス

このプロジェクトは[MIT ライセンス](LICENSE)の下で公開されています。
