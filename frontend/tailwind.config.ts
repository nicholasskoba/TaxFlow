import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          25: "#f8fbff",
          50: "#eff6ff",
          100: "#dbeafe",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          950: "#172554"
        },
        mint: {
          50: "#ecfdf5",
          100: "#d1fae5",
          600: "#059669",
          700: "#047857"
        }
      },
      boxShadow: {
        soft: "0 18px 50px -32px rgba(15, 23, 42, 0.35)",
        card: "0 16px 40px -28px rgba(15, 23, 42, 0.28)"
      }
    }
  },
  plugins: []
};

export default config;
