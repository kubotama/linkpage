# linkpage

## 機能

linkpage は、Web サイトのブックマークをウェブアプリケーションです。next.js で開発しています。それぞれのボタンをクリックすると、以下の機能を実行します。

### 「ブックマーク」のテーブル

クリックしたブックマークが選択されます。ブックマークが選択されると、以下のボタンや、URL とタイトルのテキストボックスが表示されます。

### 「開く」ボタン

「URL」テキストボックスに入力されている URL をブラウザで開きます。

### 「更新」ボタン

ブックマークが選択されているときに「更新」ボタンが表示されます。「更新」ボタンをクリックすると、選択されているブックマークの URL とタイトルが更新されます。

### 「選択解除」ボタン

ブックマークが選択されているときに「選択解除」ボタンが表示されます。「選択解除」ボタンをクリックすると、ブックマークの選択が解除されて、URL とタイトルのテキストボックスがクリアされます。

### 「削除」ボタン

ブックマークが選択されているときに「削除」ボタンが表示されます。「削除」ボタンをクリックすると、選択されているブックマークが削除されます。ブックマークの選択が解除されて、URL とタイトルのテキストボックスがクリアされます。

### 「クリア」ボタン

「URL」テキストボックスに入力されている URL と、「タイトル」テキストボックスに入力されているタイトルをクリアします。

### 「パラメータ」ボタン

「URL」テキストボックスに入力されている URL のクエリパラメータを削除します。

### 「←」ボタン

「URL」テキストボックスに入力されている URL の階層を一つ下げます。

### 「閉じる」ボタン

エラーメッセージが表示されているときに「閉じる」ボタンが表示されます。「閉じる」ボタンをクリックすると、エラーメッセージを消去します。

### 「再表示」ボタン

「再表示」ボタンをクリックすると、ブックマークのデータを API から読み込んで、再表示されます。

### キーボード・ショートカット

- Enter キー: ブックマークが選択されている場合には「開く」ボタンと同じ動作をします。選択されていない場合には、なにも実行されません。

- Escape キー: ブックマークが選択されている場合には「選択解除」ボタンと同じ動作をします。選択されていない場合には、なにも実行されません。

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

## API の仕様

### ブックマーク関連 API

#### GET: 全ブックマークの取得 /bookmarks

登録されている全てのブックマークを取得します。

##### リクエストボディ: なし

##### レスポンス (200 OK): 登録されている全てのブックマークを示す JSON 配列

```json
[
  {
    "id": 1,
    "url": "https://example.com"
  },
  {
    "id": 2,
    "url": "https://example.org"
  }
]
```

#### POST: 新しいブックマークの作成 /bookmarks

新しいブックマークを明示的に作成します。

##### リクエストボディ: 作成するブックマークを示す JSON オブジェクト

```json
{
  "url": "https://example.com",
  "title": "Example"
}
```

##### レスポンス (201 Created): 作成したブックマークを示す JSON オブジェクト

```json
{
  "id": 3,
  "url": "https://example.com",
  "title": "Example"
}
```

##### レスポンス (409 Conflict): ブックマークが既に存在する場合

```json
{
  "message": "指定されたブックマークは既に登録されています。"
}
```

#### PUT: ブックマークの更新 /bookmarks/[bookmark_id]

指定された ID のブックマークを更新します。

##### リクエストボディ: 更新するブックマークを示す JSON オブジェクト

```json
{
  "url": "https://example.com",
  "title": "Updated Example"
}
```

##### レスポンス (204 No Content): ブックマークの更新成功

##### レスポンス (404 Not Found): ブックマークが見つからない場合

```json
{
  "message": "指定された id のブックマークがありません。"
}
```

#### DELETE: ブックマークの削除 /bookmarks/[bookmark_id]

指定された ID のブックマークを削除します。

##### リクエストボディ: なし

##### レスポンス (204 No Content): ブックマークの削除成功

##### レスポンス (404 Not Found): ブックマークが見つからない場合

```json
{
  "message": "指定された id のブックマークがありません。"
}
```

### キーワード関連 API

#### GET: 全キーワードの取得 /keyword

登録されている全てのキーワードを取得します。

##### リクエストボディ: なし

##### レスポンス (200 OK): 登録されている全てのキーワードを示す JSON 配列

```json
[
  {
    "keyword_id": 1,
    "keyword_name": "Web"
  },
  {
    "keyword_id": 2,
    "keyword_name": "開発"
  },
  {
    "keyword_id": 3,
    "keyword_name": "デザイン"
  }
]
```

#### POST: 新しいキーワードの作成 /keyword

新しいキーワードを明示的に作成します。

##### リクエストボディ: 作成するキーワードを示す JSON オブジェクト

```json
{
  "keyword_name": "プログラミング"
}
```

##### レスポンス (201 Created): 作成したキーワードを示す JSON オブジェクト

```json
{
  "keyword_id": 10,
  "keyword_name": "プログラミング"
}
```

##### レスポンス (409 Conflict): キーワードが既に存在する場合

```json
{
  "message": "指定されたキーワードは既に登録されています。"
}
```

#### DELETE: キーワードの削除 /keyword/[keyword_id]

指定された ID のキーワードを削除します。キーワードとブックマークの関連付けが可能になったら、削除されたキーワードが割り当てられている全てのブックマークから関連付けが解除されます。

##### リクエストボディ: なし

##### レスポンス (204 No Content): キーワードの削除成功

##### レスポンス (404 Not Found): キーワードが見つからない場合

```json
{
  "message": "指定された id のキーワードがありません。"
}
```

#### エラーハンドリングの共通仕様:

- 400 Bad Request: リクエストの形式が不正、必須パラメータが不足しているなど。
- 404 Not Found: 指定されたリソースが見つからない。
- 409 Conflict: リソースの競合 (例: 既に存在するキーワードを作成しようとした場合)。
- 500 Internal Server Error: サーバー内部で予期せぬエラーが発生した場合。

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

登録したブックマークの URL を整形する機能があります。

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

整形した URL を開いて、[ブックマークを登録する拡張機能](https://github.com/kubotama/bookmark-extension)でブックマークを登録します。

## 技術スタック

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [SQLite](https://www.sqlite.org/index.html)
- [vitest](https://vitest.dev)
- [MaterialUI](https://mui.com)

## ライセンス

このプロジェクトは[MIT ライセンス](LICENSE)の下で公開されています。
