This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

- [ ] コンポーネントの構成を整理する
      bmgrid がブックマークのリスト全体のコンポーネント
      bmrow が個別のブックマークのコンポーネント、最後にクリックした日時などを追加する予定

## Copilot の生成結果

### 現在のワークスペースに追加します

以下は、Next.js の App Router を使用して URL のタイトルを取得する API の例です。現在のワークスペースに追加するためのコードを示します。

まず、必要なパッケージをインストールします。

> npm install next@latest react@latest react-dom@latest axios cheerio

次に、以下のファイルとディレクトリを作成します。

```app/layout.tsx
import './globals.css';

export const metadata = {
  title: 'Link Page',
  description: 'Get the title of a URL',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

app/page.tsx

```
import { useState } from 'react';
import axios from 'axios';

export default function Home() {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');

  const fetchTitle = async () => {
    try {
      const response = await axios.get(`/api/get-title?url=${encodeURIComponent(url)}`);
      setTitle(response.data.title);
    } catch (error) {
      console.error('Error fetching title:', error);
      setTitle('Error fetching title');
    }
  };

  return (
    <div>
      <h1>URL Title Fetcher</h1>
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Enter URL"
      />
      <button onClick={fetchTitle}>Get Title</button>
      {title && <p>Title: {title}</p>}
    </div>
  );
}
```

app/api/get-title/route.ts

```
import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const title = $('title').text() || 'No title found';
    return NextResponse.json({ title });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

これで、Next.js アプリケーションを実行する準備が整いました。以下のコマンドを使用して開発サーバーを起動します。

> npm run dev

ブラウザで http://localhost:3000 にアクセスすると、URL のタイトルを取得するインターフェースが表示されます。

### jest でのテストも作成してください

以下は、Jest を使用して API エンドポイントのテストを作成する方法です。まず、必要なパッケージをインストールします。

> npm install jest @testing-library/react @testing-library/jest-dom axios-mock-adapter

次に、テストファイルを作成します。

**tests**/page.test.tsx

```
import { render, screen, fireEvent } from '@testing-library/react';
import Home from '../app/page';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

const mock = new MockAdapter(axios);

describe('Home', () => {
  it('fetches and displays the title of a URL', async () => {
    mock.onGet('/api/get-title?url=https%3A%2F%2Fexample.com').reply(200, {
      title: 'Example Domain',
    });

    render(<Home />);

    const input = screen.getByPlaceholderText('Enter URL');
    const button = screen.getByText('Get Title');

    fireEvent.change(input, { target: { value: 'https://example.com' } });
    fireEvent.click(button);

    const title = await screen.findByText('Title: Example Domain');
    expect(title).toBeInTheDocument();
  });

  it('displays an error message when the URL is invalid', async () => {
    mock.onGet('/api/get-title?url=invalid-url').reply(500, {
      error: 'Request failed with status code 500',
    });

    render(<Home />);

    const input = screen.getByPlaceholderText('Enter URL');
    const button = screen.getByText('Get Title');

    fireEvent.change(input, { target: { value: 'invalid-url' } });
    fireEvent.click(button);

    const error = await screen.findByText('Error fetching title');
    expect(error).toBeInTheDocument();
  });
});
```

**tests**/api.test.ts

```
import { createMocks } from 'node-mocks-http';
import { GET } from '../app/api/get-title/route';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

const mock = new MockAdapter(axios);

describe('/api/get-title', () => {
  it('returns the title of a valid URL', async () => {
    mock.onGet('https://example.com').reply(200, '<html><head><title>Example Domain</title></head><body></body></html>');

    const { req, res } = createMocks({
      method: 'GET',
      url: '/api/get-title?url=https://example.com',
    });

    await GET(req as Request);

    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData()).toEqual({ title: 'Example Domain' });
  });

  it('returns an error for an invalid URL', async () => {
    mock.onGet('invalid-url').networkError();

    const { req, res } = createMocks({
      method: 'GET',
      url: '/api/get-title?url=invalid-url',
    });

    await GET(req as Request);

    expect(res._getStatusCode()).toBe(500);
    expect(res._getJSONData()).toEqual({ error: 'Network Error' });
  });
});
```

これで、Jest を使用して API エンドポイントとページコンポーネントのテストを実行する準備が整いました。以下のコマンドを使用してテストを実行します。

> npm test

これにより、テストが実行され、API エンドポイントとページコンポーネントの動作が確認されます。
