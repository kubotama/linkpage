// vitest.config.ts
/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react"; // Reactコンポーネントを扱う場合

export default defineConfig({
  plugins: [
    react(), // ReactのJSXをトランスパイル
  ],
  test: {
    environment: "jsdom", // DOM環境が必要なテストに必須
    globals: true, // `describe`, `it`, `expect`などをグローバルに利用可能にする
    setupFiles: "./vitest.setup.ts", // テスト実行前に読み込むファイル
    css: {
      // Tailwind CSS のようなCSSフレームワークを使用している場合、
      // CSSをインポートした際にエラーが出ないようにする設定
      // `postcss`や`tailwindcss`の設定によっては不要な場合もありますが、
      // エラーが出る場合は検討してください。
      // preprocessor: 'postcss', // 必要に応じて
      // modules: {
      //   classNameStrategy: 'non-scoped', // Next.jsのCSS Modulesの挙動に合わせる
      // },
    },
    // coverage: { // カバレッジレポートの設定
    //   provider: 'v8', // 'v8' (デフォルト) または 'istanbul'
    //   reporter: ['text', 'json', 'html'], // レポート形式
    //   exclude: [ // カバレッジ対象外のファイル
    //     'node_modules/',
    //     './.next/',
    //     './coverage/',
    //     './public/',
    //     './styles/',
    //     './src/app/**/*.ts', // Next.js App Routerのルートファイルなど、テスト不要なもの
    //     './src/pages/**/*.tsx', // Next.js Pages Routerのページファイルなど
    //     './src/types/**/*.ts',
    //     './src/lib/**/*.ts',
    //   ],
    //   include: [ // カバレッジ対象
    //     './src/**/*.{ts,tsx}',
    //   ]
    // },
    // testMatch: ['<rootDir>/src/**/*.test.{ts,tsx}'], // テストファイルのパターン
  },
});
