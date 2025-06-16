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
    coverage: {
      // カバレッジレポートの設定
      provider: "v8", // 'v8' (デフォルト) または 'istanbul'
      reporter: ["text", "json", "html"], // レポート形式
      exclude: [
        // カバレッジ対象外のファイル
        "node_modules/",
        "./.next/",
        "./coverage/",
        "./public/",
        "./styles/",
        "**/*.test.{ts,tsx}",
        // "./src/app/**/*.text.tsx", // Next.js App Routerのルートファイルなど、テスト不要なもの
        // "./src/pages/**/*.tsx", // Next.js Pages Routerのページファイルなど
        "**/types/*.ts",
        "./src/lib/**/*.ts",
        "./src/app/layout.tsx",
        "./eslint.config.mjs",
        "./vitest.setup.ts",
        "./vitest.config.ts",
        "./tailwind.config.ts",
        "./next.config.ts",
        "./next-env.d.ts",
        "./postcss.config.js",
        "./postcss.config.mjs",
      ],
      // include: [ // カバレッジ対象
      //   './src/**/*.{ts,tsx}',
      // ]
    },
    include: ["./src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["./src/app/test-utils/*.tsx"],
  },
});
