import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--color-primary)",
          light: "var(--color-primary-light)",
          dark: "var(--color-primary-dark)",
        },
        secondary: {
          DEFAULT: "var(--color-secondary)",
          light: "var(--color-secondary-light)",
          dark: "var(--color-secondary-dark)",
        },
        background: {
          light: "var(--color-bg-light)",
          dark: "var(--color-bg-dark)",
          "card-light": "var(--color-bg-card-light)",
          "card-dark": "var(--color-bg-card-dark)",
        },
        text: {
          light: "var(--color-text-light)",
          dark: "var(--color-text-dark)",
          "muted-light": "var(--color-text-muted-light)",
          "muted-dark": "var(--color-text-muted-dark)",
        },
        border: {
          light: "var(--color-border-light)",
          dark: "var(--color-border-dark)",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        gold: "0 0 40px rgba(245, 158, 11, 0.28), 0 4px 16px rgba(245, 158, 11, 0.18)",
        "gold-lg": "0 12px 48px rgba(245, 158, 11, 0.38)",
        card: "0 2px 16px rgba(0,0,0,0.5), 0 1px 4px rgba(0,0,0,0.4)",
        hover: "0 32px 80px rgba(0,0,0,0.75), 0 12px 28px rgba(0,0,0,0.5)",
        panel: "0 0 60px rgba(0,0,0,0.6), -8px 0 40px rgba(0,0,0,0.3)",
      },
    },
  },
  plugins: [],
};
export default config;
