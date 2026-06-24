import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        sand: "#efe1d3",
        cream: "#f8f1e8",
        cocoa: "#5e4636",
        terracotta: "#c97958",
        leaf: "#7d8f6d",
        blush: "#efcbb7",
        ink: "#2e2520"
      },
      fontFamily: {
        display: ["var(--font-display)"],
        sans: ["var(--font-sans)"]
      },
      boxShadow: {
        soft: "0 24px 60px rgba(94, 70, 54, 0.12)"
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
          "radial-gradient(circle at top left, rgba(201,121,88,0.18), transparent 26%), radial-gradient(circle at bottom right, rgba(125,143,109,0.12), transparent 24%), linear-gradient(135deg, rgba(255,255,255,0.82), rgba(248,241,232,0.92))"
      }
    }
  },
  plugins: []
};

export default config;

