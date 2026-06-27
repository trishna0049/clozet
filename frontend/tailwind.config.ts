import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        sand: "#F5EFE6",
        cream: "#FDFAF7",
        cocoa: "#800020",
        terracotta: "#A0263A",
        leaf: "#5C0015",
        blush: "#F5B8C4",
        ink: "#3B000E"
      },
      fontFamily: {
        display: ["var(--font-display)"],
        sans: ["var(--font-sans)"]
      },
      boxShadow: {
        soft: "0 24px 60px rgba(128, 0, 32, 0.12)"
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
          "radial-gradient(circle at top left, rgba(128,0,32,0.10), transparent 26%), radial-gradient(circle at bottom right, rgba(92,0,21,0.08), transparent 24%), linear-gradient(135deg, rgba(255,255,255,0.90), rgba(253,250,247,0.95))"
      }
    }
  },
  plugins: []
};

export default config;

