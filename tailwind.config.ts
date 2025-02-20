import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./mdx-components.tsx",
  ],
  safelist: ["text-sm", "text-md", "text-lg"],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        "theme-1": "var(--theme-color-1)",
        "theme-2": "var(--theme-color-2)",
        "theme-3": "var(--theme-color-3)",
        "theme-4": "var(--theme-color-4)",
        "theme-5": "var(--theme-color-5)",
        "theme-6": "var(--theme-color-6)",
        "theme-7": "var(--theme-color-7)",
      },
      fontSize: {
        // text-caption
        caption: [
          "12px",
          {
            lineHeight: "16px",
            fontWeight: "400",
          },
        ],

        // text-caption-bold
        "caption-bold": [
          "12px",
          {
            lineHeight: "16px",
            fontWeight: "500",
          },
        ],

        // text-body
        body: [
          "24px",
          {
            lineHeight: "32px",
            fontWeight: "200",
          },
        ],

        // text-body-bold
        "body-bold": [
          "14px",
          {
            lineHeight: "20px",
            fontWeight: "500",
          },
        ],

        // text-heading-3
        "heading-3": [
          "24px",
          {
            lineHeight: "64px",
            fontWeight: "600",
          },
        ],

        // text-heading-2
        "heading-2": [
          "40px",
          {
            lineHeight: "72px",
            fontWeight: "600",
          },
        ],

        // text-heading-1
        "heading-1": [
          "60px",
          {
            lineHeight: "84px",
            fontWeight: "500",
          },
        ],

        // (optional) monospace-body
        "monospace-body": [
          "14px",
          {
            lineHeight: "20px",
            fontWeight: "400",
          },
        ],
      },
    },
  },
  plugins: [],
} satisfies Config;
