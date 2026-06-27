import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        sand: "#E9DDCF",
        cream: "#F6EFE6",
        cocoa: "#5C3A21",
        terracotta: "#8A5A3C",
        leaf: "#4A2F1D",
        blush: "#D7C2B0",
        ink: "#2E1D12"
      },
      fontFamily: {
        display: ["var(--font-display)"],
        sans: ["var(--font-sans)"]
      },
      boxShadow: {
        soft: "0 24px 60px rgba(92, 58, 33, 0.16)"
      },
      keyframes: {
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" }
        }
      },
      animation: {
        marquee: "marquee 28s linear infinite"
      },
      backgroundImage: {
        "print-grid":
          "radial-gradient(circle at top left, rgba(92,58,33,0.10), transparent 26%), radial-gradient(circle at bottom right, rgba(74,47,29,0.08), transparent 24%), linear-gradient(135deg, rgba(255,255,255,0.90), rgba(246,239,230,0.95))"
      }
    }
  },
  plugins: []
};

export default config;

