> **Note**  
> このリポジトリは **[kubotama/bookmark-page](https://github.com/kubotama/bookmark-page)** に移行しました。  
> 現在、このリポジトリはアーカイブされており、読み取り専用です。最新の開発やメンテナンスは移行先の新しいリポジトリで行われています。

# linkpage

linkpage は、Web サイトのブックマークを管理するウェブアプリケーションです。Next.js+typescript+vitest+tailwindcss で開発しています。クライアントサーバー構成です。サーバーは next.js で RESTful 形式の API として提供されています。クライアントは、API から取得したデータを web ブラウザ上に表示します。

サーバーはローカル環境で実行することを前提にしています。サーバーレス環境へのデプロイする場合には、外部メッセージングサービスなどの利用を検討する必要があります。

## 機能

それぞれのボタンをクリックすると、以下の機能を実行します。

### 「ブックマーク」のテーブル

クリックしたブックマークが選択されます。ブックマークが選択されると、以下のボタンや、URL とタイトルのテキストボックスが表示されます。

### ブックマークの並び替え

ブックマーク一覧の各行をドラッグ＆ドロップすることで、表示順を直感的に並び替えることができます。

> **Note**
> 現時点では、並び替えた順序は保存されません。ページを再読み込みすると、元の順序に戻ります。

### 「更新」ボタン

ブックマークが選択されているときに「更新」ボタンが表示されます。「更新」ボタンをクリックすると、選択されているブックマークの URL とタイトルが更新されます。

### 「削除」ボタン

ブックマークが選択されているときに「削除」ボタンが表示されます。「削除」ボタンをクリックすると、選択されているブックマークが削除されます。ブックマークの選択が解除されて、URL とタイトルのテキストボックスがクリアされます。

### 「パラメータ」ボタン

「URL」テキストボックスに入力されている URL のクエリパラメータを削除します。

### 「←」ボタン

「URL」テキストボックスに入力されている URL の階層を一つ下げます。

### 「閉じる」ボタン

エラーメッセージが表示されているときに「閉じる」ボタンが表示されます。「閉じる」ボタンをクリックすると、エラーメッセージを消去します。

### 「追加」ボタン

ブックマークが選択されているときに、キーワードを入力するテキストボックスと「追加」ボタンが表示されます。テキストボックスにキーワードを入力して、「追加」ボタンをクリックすると、キーワードがブックマークに設定されます。設定されたキーワードは、テキストボックスの下に表示されます。

### キーボード・ショートカット

- Enter キー: ブックマークが選択されている場合には選択されているブックマークの URL を開きます。ブックマークが選択されていない場合には、なにも実行されません。

- Escape キー: ブックマークが選択されている場合にはブックマークの選択を解除します。ブックマークが選択されていない場合には、なにも実行されません。

- 上カーソルキー: ブックマークが選択されていない場合には、一番下に表示されているブックマークを選択します。ブックマークが選択されている場合には、選択されているブックマークの一つ上のブックマークを選択します。一番上のブックマークを選択している場合には、一番下のブックマークを選択します。

- 下カーソルキー: ブックマークが選択されていない場合には、一番上に表示されているブックマークを選択します。ブックマークが選択されている場合には、選択されているブックマークの一つ下のブックマークを選択します。一番下のブックマークを選択している場合には、一番上のブックマークを選択します。

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

## 設定 (Configuration)

### 環境変数 (Environment Variables)

本アプリケーションの動作には、環境変数の設定が必要です。

| 変数名                | 説明                                                                                                                                                    | 必須 | 設定例                                  |
| :-------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------ | :--- | :-------------------------------------- |
| `ALLOWED_CORS_ORIGIN` | **[重要]** CORS (Cross-Origin Resource Sharing) を許可するオリジンを指定します。ここに指定されていないオリジンからの API リクエストはブロックされます。 | ✅   | `"chrome-extension://abcdefghijklmnop"` |

---

#### `ALLOWED_CORS_ORIGIN` の詳細

この変数は、アプリケーションのセキュリティにおける重要な設定です。ブックマークを登録する拡張機能の ID を指定してください。

**設定方法**

- **単一のオリジンを許可する場合:**

  ```bash
  ALLOWED_CORS_ORIGIN="chrome-extension://abcdefghijklmnop"
  ```

- **複数のオリジンを許可する場合:**

  現在の実装では、単一のオリジンのみ許可できます。複数のオリジンを許可する必要がある場合は、サーバー側の実装を修正する必要があります。

## API の仕様

### ブックマーク関連 API

#### GET: 全ブックマークの取得 /bookmarks

登録されている全てのブックマークを取得します。

##### リクエストボディ: なし

##### レスポンス (200 OK): 登録されている全てのブックマークを示す JSON 配列

```json
{
  "status": 200,
  "headers": { "Content-Type": "application/json" },
  "json": [
    {
      "id": 1,
      "url": "https://example.com",
      "title": "Example Title 1"
    },
    {
      "id": 2,
      "url": "https://example.org",
      "title": "Example Title 2"
    }
  ]
}
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
  "status": 201,
  "headers": { "Content-Type": "application/json" },
  "Location": "http://localhost:3000/api/bookmarks/3",
  "json": {
    "id": 3,
    "url": "https://example.com",
    "title": "Example"
  }
}
```

##### レスポンス (409 Conflict): ブックマークが既に存在する場合

```json
{
  "status": 409,
  "headers": { "Content-Type": "application/json" },
  "json": {
    "message": "指定されたブックマークは既に登録されています。"
  }
}
```

#### PUT: ブックマークの更新 /bookmarks/[id]

指定された ID のブックマークを更新します。

##### リクエストボディ: 更新するブックマークを示す JSON オブジェクト

```json
{
  "url": "https://example.com",
  "title": "Updated Example"
}
```

##### レスポンス (204 No Content): ブックマークの更新成功

```json
{
  "status": 204
}
```

##### レスポンス (404 Not Found): ブックマークが見つからない場合

```json
{
  "status": 404,
  "headers": { "Content-Type": "application/json" },
  "json": {
    "message": "指定されたブックマークがありません。"
  }
}
```

#### DELETE: ブックマークの削除 /bookmarks/[id]

指定された ID のブックマークを削除します。

##### リクエストボディ: なし

##### レスポンス (204 No Content): ブックマークの削除成功

```json
{
  "status": 204
}
```

##### レスポンス (404 Not Found): ブックマークが見つからない場合

```json
{
  "status": 404,
  "headers": { "Content-Type": "application/json" },
  "json": {
    "message": "指定されたブックマークがありません。"
  }
}
```

### キーワード関連 API

#### GET: 全キーワードの取得 /keyword

登録されている全てのキーワードを取得します。

##### リクエストボディ: なし

##### レスポンス (200 OK): 登録されている全てのキーワードを示す JSON 配列

```json
{
  "status": 200,
  "headers": { "Content-Type": "application/json" },
  "json": [
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
}
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
  "status": 201,
  "headers": { "Content-Type": "application/json" },
  "json": {
    "keyword_id": 10,
    "keyword_name": "プログラミング"
  }
}
```

##### レスポンス (409 Conflict): キーワードが既に存在する場合

```json
{
  "status": 409,
  "headers": { "Content-Type": "application/json" },
  "json": {
    "message": "指定されたキーワードは既に登録されています。"
  }
}
```

#### DELETE: キーワードの削除 /keyword/[keyword_id]

指定された keyword_id のキーワードを削除します。キーワードとブックマークの関連付けが可能になったら、削除されたキーワードが割り当てられている全てのブックマークから関連付けが解除されます。

##### リクエストボディ: なし

##### レスポンス

| 結果                                             | ステータスコード | レスポンスのボディのサンプル                                        |
| ------------------------------------------------ | ---------------- | ------------------------------------------------------------------- |
| キーワードの削除成功                             | 204 No Content   | -                                                                   |
| 指定された keyword_id のキーワードが見つからない | 404 Not Found    | `{ "message": "指定された keyword_id のキーワードがありません。" }` |

#### POST /bookmarks/[bookmark_id]/keywords

指定したブックマーク(bookmark_id)にキーワードを設定する。指定されたキーワードがキーワードとして登録されていない場合には、登録する。

##### リクエストボディ: 作成するキーワードを示す JSON オブジェクト

| プロパティ名 | プロパティの値のサンプル |
| ------------ | ------------------------ |
| keyword_name | プログラミング           |

##### レスポンス

| 結果                                             | ステータスコード | レスポンスのボディのサンプル                                                                                                            |
| ------------------------------------------------ | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| ブックマークにキーワードを設定                   | 201 Created      | { "message": "キーワードをブックマークに追加しました。", "keyword_id": 10, "keyword_name": "プログラミング", "bookmark_keyword_id": 1 } |
| 指定されたブックマークがない                     | 404 Not Found    | { "message": "指定されたブックマークがありません。" }                                                                                   |
| キーワードが既にこのブックマークに登録されている | 409 Conflict     | { "message": "指定されたキーワードは既にこのブックマークに登録されています。" }                                                         |
| `keyword_name` が未指定、または空                | 400 Bad Request  | { "message": "キーワードを指定してください。" }                                                                                         |
| `bookmark_id` が不正な値                         | 400 Bad Request  | { "message": "ID は正の整数である必要があります。" }                                                                                    |

#### DELETE /bookmarks/[bookmark_id]/keywords/[keyword_id]

指定したブックマーク(bookmark_id)のキーワードを解除する。

##### リクエストボディ: なし

##### レスポンス

| 結果                                                       | ステータスコード | レスポンスのボディのサンプル                                                          |
| ---------------------------------------------------------- | ---------------- | ------------------------------------------------------------------------------------- |
| キーワードの解除成功                                       | 204 No Content   | -                                                                                     |
| 指定されたブックマークとキーワードの関連付けが見つからない | 404 Not Found    | `{ "message": "指定されたブックマークに指定されたキーワードが設定されていません。" }` |
| `keyword_id` が未指定、または空                            | 400 Bad Request  | `{ "message": "キーワードを指定してください。" }`                                     |
| `keyword_id` が不正な値                                    | 400 Bad Request  | `{ "message": "ID は正の整数である必要があります。" }`                                |
| `bookmark_id` が未指定、または空                           | 400 Bad Request  | `{ "message": "ブックマークを指定してください。" }`                                   |
| `bookmark_id` が不正な値                                   | 400 Bad Request  | `{ "message": "ID は正の整数である必要があります。" }`                                |

#### エラーハンドリングの共通仕様:

- 400 Bad Request: リクエストの形式が不正、必須パラメータが不足しているなど。
- 404 Not Found: 指定されたリソースが見つからない。
- 409 Conflict: リソースの競合 (例: 既に存在するキーワードを作成しようとした場合)。
- 500 Internal Server Error: サーバー内部で予期せぬエラーが発生した場合。

## データ構造

linkpage はリンクデータを SQLite のデータベースで管理します。基本的な構造は以下の通りです：

```SQL
  CREATE TABLE IF NOT EXISTS bookmarks (
    bookmark_id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS keywords (
    keyword_id INTEGER PRIMARY KEY AUTOINCREMENT,
    keyword_name TEXT NOT NULL UNIQUE
  );
  CREATE TABLE IF NOT EXISTS bookmark_keywords (
    bookmark_keyword_id INTEGER PRIMARY KEY AUTOINCREMENT,
    bookmark_id INTEGER,
    keyword_id INTEGER,
    FOREIGN KEY (bookmark_id) REFERENCES bookmarks(bookmark_id) ON DELETE CASCADE,
    FOREIGN KEY (keyword_id) REFERENCES keywords(keyword_id) ON DELETE CASCADE,
    UNIQUE (bookmark_id, keyword_id)
  );

  CREATE INDEX IF NOT EXISTS idx_bookmark_keywords_keyword_id ON bookmark_keywords(keyword_id);
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
| https://mail.google.com/mail/u/0/#inbox                                             | https://mail.google.com/mail/u/#inbox                        |
| https://mail.google.com/mail/u/0/                                                   | https://mail.google.com/mail/u/                              |
| https://mail.google.com/mail/u/0                                                    | https://mail.google.com/mail/u/                              |
| https://xtech.nikkei.com/atcl/nxt/column/18/00148/030500376/?n_cid=nbpnxt_mled_itmh | https://xtech.nikkei.com/atcl/nxt/column/18/00148/030500376/ |
| https://xtech.nikkei.com                                                            | https://xtech.nikkei.com                                     |
| https://xtech.nikkei.com/                                                           | https://xtech.nikkei.com/                                    |

- 入力された URL を開きます。(「開く」ボタン)

整形した URL を開いて、[ブックマークを登録する拡張機能](https://github.com/kubotama/bookmark-extension)でブックマークを登録します。

## 技術スタック

| ツール名                                      | バージョン |
| --------------------------------------------- | ---------- |
| [Node.js](https://nodejs.org/)                | 22.15.1    |
| [Next.js](https://nextjs.org/)                | 15.5.7     |
| [React](https://reactjs.org/)                 | 19.1.1     |
| [TypeScript](https://www.typescriptlang.org/) | 5.9.2      |
| [Tailwind CSS](https://tailwindcss.com/)      | 4.1.17     |
| [SQLite](https://www.sqlite.org/index.html)   | 3.37.2     |
| [vitest](https://vitest.dev)                  | 4.0.16     |

## 変更履歴

### ✨ feat: 2026/01/09 ブックマークのドラッグ＆ドロップ並び替え機能 (UIのみ)

#### 変更内容

- **ブックマークの並び替えUIの実装**:
  - `@dnd-kit` ライブラリを導入し、ブックマーク一覧の行をドラッグ＆ドロップで並び替えられるようにしました。
  - `BookmarkManager` および `BookmarkTable` コンポーネントを更新し、インタラクティブな操作を実現しました。
  - ※現段階では並び順の永続化（保存）は行われません。リロードすると初期状態に戻ります。

### ⬆️ 2025/12/31: Tailwind CSS v4 と Vitest v4 への移行

#### 変更内容

- **Tailwind CSS v4 へのアップグレード**:
  - `tailwindcss` を `v4.1.17` に更新しました。
  - `postcss.config.js` を削除し、`postcss.config.mjs` を作成して `@tailwindcss/postcss` を使用するように構成を更新しました。
  - `src/app/globals.css` のインポートを `@import "tailwindcss";` に変更しました。
- **Vitest v4 へのアップグレード**:
  - `vitest` および `@vitest/coverage-v8` を v4 系に更新しました。
- **その他の依存関係の更新**:
  - Next.js, React, TypeScript などを最新バージョンに更新しました。

### ✨ feat: 2025/10/03 独自キーハンドラフックを導入し `react-hotkeys-hook` を削除

#### 変更内容

- `useKeyHandler` カスタムフックを新規作成
- `useKeyHandler` のための単体テストを追加
- `useBookmarkManager` で `useHotkeys` の代わりに `useKeyHandler` を使用するようにリファクタリング
- `package.json` と `package-lock.json` から `react-hotkeys-hook` を削除

### ✨ feat: 2025/09/30 キーワード選択時に紐付くブックマークを絞り込み表示

#### 変更内容

- **キーワードによるブックマーク絞り込み表示**:
  - キーワードテーブルのキーワードをクリックすると、そのキーワードが設定されているブックマークのリストが「すべてのブックマーク」テーブルの上に表示されます。
- **ロジックの追加**:
  - `useBookmarksLogic`フックに、選択されたキーワード ID に基づいてブックマークをフィルタリングするロジック (`linkedBookmarkWithSelectedKeywords`) を追加しました。
- **コンポーネントの汎用化**:
  - 新機能の実装に伴い、`BookmarkTable`コンポーネントをリファクタリングし、テーブルのヘッダーテキスト(`tableName`)と`aria-label`を props 経由で設定できるように変更しました。これにより、コンポーネントの再利用性が向上しました。
- **定数の見直し**:
  - `TABLE_NAME_BOOKMARKS`をより具体的な`TABLE_NAME_ALL_BOOKMARK`に置き換え、新しく`TABLE_NAME_LINKED_BOOKMARKS`を追加するなど、定数名をより明確にしました。
- **テストの追加**:
  - TDD（テスト駆動開発）のアプローチに基づき、本機能に関するテストケースを追加しました。

### ✨ feat: 2025/09/25 ブックマーク選択時の表示状態を管理するロジックをカスタムフックとして抽出

#### 変更内容

`BookmarkManager`コンポーネントに混在していた、ブックマーク選択時の表示状態を管理するロジックを、新しく作成した`useBookmarksLogic`カスタムフックに抽出しました。

このリファクタリングにより、`BookmarkManager`コンポーネントは UI のレンダリングに責務が集中し、ロジックは分離されて見通しが良くなりました。また、ロジックの再利用性が向上し、単体テストが容易になっています。

### ✨ feat: 2025/09/23 キーワード入力欄の状態に応じて、「キーワード追加」ボタンの表示/非表示を動的に切り替え

#### 変更内容

- キーワードが未入力の場合は、追加ボタンを非表示にします。
- 入力されたキーワードが既存のキーワードと重複する場合も、追加ボタンを非表示にします。
- 上記以外の、新しいキーワードが入力された場合にのみ、追加ボタンを表示します。

### ✨ feat: 2025/09/22 ブックマークの選択時にキーワードの選択を維持

#### 変更内容

- キーワードでブックマークを絞り込んだ後、別のブックマークを選択しても絞り込み状態が維持されるようになりました。
- ブックマークとキーワードが同時に選択された場合に、両方のスタイルが適用されるようにロジックとスタイル定義を修正しました。

### ✨ feat: 2025/09/21 キーワード紐付け機能

#### ✨ 新機能

- **キーワード紐付け機能**:
  - 「すべてのキーワード」テーブルの各行に「設定」ボタンを追加しました。
  - このボタンをクリックすると、選択中のブックマークにそのキーワードが紐付けられます。
  - `useBookmarkManager`フックに`linkKeywordClick`ハンドラを新しく実装しました。

#### ⚙️ リファクタリング・改善

- **キーワード解除処理の改善**:
  - `unlinkKeywordClick`ハンドラが、これまでの`keyword_id`（数値）の代わりに`Keyword`オブジェクト全体を受け取るように変更しました。これにより、将来的にキーワード名などの追加情報を活用しやすくなります。
- **Next.js App Router の型変更への対応**:
  - Next.js の App Router におけるルートハンドラの`params`オブジェクトの構造変更（`Promise<{ [key]: string }>` → `Promise<{ params: Promise<{ [key]: string }> }>`）に対応しました。
  - `POST /api/bookmarks/[bookmark_id]/keywords` ルートハンドラと関連するテストコードを修正し、新しい型定義に追従しました。

### ✨ feat: 2025/09/20 キーワード設定ボタンの追加

- **UI の改善**:
  - ブックマークが選択されている時、「すべてのキーワード」テーブルの各行に「設定」ボタンが表示されるようにしました。
  - ブックマークが選択されていない場合は、ボタンは表示されません。
- **定数の追加**:
  - 「設定」ボタンのラベルとして `LINK_BUTTON_ROLE_NAME` を `constants.ts` に追加しました。
- **テスト**:
  - 上記の表示ロジックに関するテストケースを追加し、期待通りに動作することを確認しました。

### ✨ feat: 2025/09/19 利用可能なキーワードのフィルタリング機能とデータロード改善

- **新機能**
  - 「すべてのキーワード」一覧で、選択中のブックマークに未設定のキーワードのみが表示されるようになりました。
- **修正した項目**
  - ブックマークとキーワードのデータロード処理を改善しました。

### ✨ 2025/09/18: キーワード一覧表示機能

- **キーワード取得機能の実装 (`useBookmarks`フック)**

  - `/api/keywords`エンドポイントから全キーワードを取得し、`keywords` state で管理する`getKeywords`関数を`useBookmarks`フックに追加しました。
  - `getKeywords`に関する単体テストを実装し、正常系・異常系の両方をカバーしました。

- **初期ロード処理の改善 (`useBookmarkManager`フック)**

  - アプリケーションの初期表示時に、ブックマーク一覧と合わせてキーワード一覧も取得するように`useBookmarkManager`フックを修正しました。
  - これにより、起動時に必要なデータがすべて揃い、表示の安定性が向上します。

- **UI の改善 (`BookmarkManager`コンポーネント)**
  - ブックマーク詳細エリアの下部に、取得した全キーワードを表示するテーブル (`KeywordTable`) を追加しました。

### ⬆️ 2025/09/17: Props 変更と依存関係の更新

### 変更内容

- `KeywordTable`コンポーネントの props を変更しました。
  - `headerText: string` を必須の prop として追加しました。
  - `unlinkKeywordClick` prop を削除しました。
  - 代わりに、`rowActionButton: { label: string, onClick: (id) => void }` を新しい prop として追加しました。
- 上記の変更に伴い、`BookmarkManager`コンポーネントと関連するテストコードを更新しました。

#### 破壊的変更 (BREAKING CHANGE) ⚠️

このプルリクエストには破壊的変更が含まれます。

- `unlinkKeywordClick` prop は削除されました。代わりに`rowActionButton` prop を使用してください。
- `headerText` prop が必須になりました。テーブルのヘッダーに表示するテキストを指定する必要があります。

#### 主な更新

Next.js や ESLint など、複数の依存関係を最新バージョンに更新しました。

- `next`: `15.5.2` → `15.5.3`
- `eslint`: `9.23.0` → `9.35.0`
- `eslint-config-next`: `15.5.2` → `15.5.3`
- `jsdom`: `26.1.0` → `27.0.0`
- `postcss`: `8.5.3` → `8.5.6`
- `typescript`: `5.8.2` → `5.9.2`
- `vitest`: `3.2.3` → `3.2.4`

その他、関連する型定義ファイルやパッケージも更新しています。

### 2025/09/13

#### ✨ 新機能

- **キーワード解除機能の実装 (フロントエンド)**

  - ブックマークに紐づくキーワードを解除するための `unlinkKeyword` 関数を `useBookmarks` フックに追加しました。
  - `KeywordTable` コンポーネントに「解除」ボタンを設置し、クリックすることでキーワードの関連付けを解除できるようにしました。

- **キーワード解除 API の実装 (バックエンド)**
  - `DELETE /api/bookmarks/[bookmark_id]/keywords/[keyword_id]` エンドポイントを実装し、ブックマークとキーワードの関連付けを削除する機能を提供します。

#### 🎨 UI/UX の改善

- **キーワードテーブルの表示位置変更**
  - ブックマーク詳細フォーム内で、既存のキーワード一覧（`KeywordTable`）をキーワード追加フォームの上部に移動しました。これにより、ユーザーは既存のキーワードを確認してから新しいキーワードを追加するという、より自然な操作が可能になります。
- **キーワードテーブルの表示改善**
  - キーワードリストが空の場合、テーブル自体をレンダリングしないように変更し、UI をすっきりとさせました。
  - テーブルヘッダーを常に表示し、テキストを「キーワード一覧」に変更することで、テーブルの目的をより明確にしました。

#### ⚙️ リファクタリング・テスト改善

- **API エラーハンドリングの強化**

  - ID の未指定や不正な値（数値以外、負数など）に対するバリデーションを強化し、より具体的で分かりやすいエラーメッセージを返すようにしました。
  - `InvalidIdError` を拡張し、どの ID でエラーが発生したかを特定しやすくしました。

- **テストの拡充と改善**
  - キーワード解除機能に関するフロントエンド (`useBookmark.unlink.test.tsx`) とバックエンド (`delete.test.ts`) の両方で、テストカバレッジを大幅に向上させました。
  - `it.each` を活用してデータ駆動テストを導入し、正常系・異常系の様々なシナリオを網羅的に検証できるようにリファクタリングしました。
  - テストデータにマジックナンバーを使わず、`bookmarkTestUtils` からインポートした定数を使用することで、テストの可読性と保守性を高めました。

#### 📄 ドキュメント

- `README.md` にキーワード解除 API (`DELETE /bookmarks/[bookmark_id]/keywords/[keyword_id]`) の仕様と変更履歴を追記しました。

### 2025/09/07

- useBookmarkManager から状態管理を分離

### 2025/09/04

- キーワード選択時のブックマークハイライト機能を追加
- キーワード選択のトグル機能を追加
- Escape キーによる選択解除機能を追加

### 2025/09/02

- 依存パッケージのメジャーバージョンアップ: `better-sqlite3` (v12), `@types/node` (v24), `@vitejs/plugin-react` (v5) など
- パッケージの削除 (sqlite, sqlite3)

### 2025/09/01

- fix: 不正な JSON ボディに対するエラーメッセージを統一
- feat: キーワード追加 API のリクエストボディ検証を強化し、より具体的なエラーメッセージを返すよう変更

## ライセンス

このプロジェクトは[MIT ライセンス](LICENSE)の下で公開されています。
