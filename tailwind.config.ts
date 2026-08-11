import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          900: "#1a2332",
          700: "#2f3d52",
          500: "#5b6b81",
          300: "#a9b4c2",
          100: "#eef1f5",
        },
        brand: {
          DEFAULT: "#1f4b6b",
          dark: "#123249",
          light: "#e7eef3",
        },
        err: {
          DEFAULT: "#c9372c",
          bg: "#fdecea",
          border: "#f2b8b5",
        },
        warn: {
          DEFAULT: "#9a6b00",
          bg: "#fff6e0",
          border: "#f2d580",
        },
        typo: {
          DEFAULT: "#1c5fa8",
          bg: "#e8f1fb",
          border: "#a9cdec",
        },
      },
      fontFamily: {
        sans: [
          '"Hiragino Sans"',
          '"Noto Sans JP"',
          '"Yu Gothic"',
          "sans-serif",
        ],
        mono: ['"JetBrains Mono"', '"Menlo"', "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
