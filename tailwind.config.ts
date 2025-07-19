import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      width: {
        "bookmark-list": "800px",
        "bookmark-details": "500px",
      },
      minWidth: {
        "bookmark-details": "500px",
        "keyword-input": "450px",
      },
    },
  },
  plugins: [],
} satisfies Config;
