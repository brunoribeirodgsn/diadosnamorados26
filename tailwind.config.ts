import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/hooks/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#100b12",
        wine: "#641832",
        rose: "#f45b8a",
        blush: "#ffd1dc",
        gold: "#f3c677",
        lilac: "#b989f5",
        emerald: "#34d399"
      },
      boxShadow: {
        glow: "0 22px 80px rgba(244, 91, 138, 0.32)",
        "glow-sm": "0 8px 32px rgba(244, 91, 138, 0.22)",
        "glow-gold": "0 16px 60px rgba(243, 198, 119, 0.24)",
        glass: "0 18px 60px rgba(0, 0, 0, 0.36)",
        "glass-lg": "0 28px 80px rgba(0, 0, 0, 0.48)",
        "inner-glow": "inset 0 1px 0 rgba(255,255,255,0.12)"
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Playfair Display", "Georgia", "serif"]
      },
      backgroundImage: {
        "romantic-gradient": "linear-gradient(135deg, #f45b8a, #f3c677)",
        "dark-gradient": "linear-gradient(135deg, #0e0910 0%, #1c0d1a 55%, #130814 100%)"
      },
      animation: {
        "fade-up": "fade-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "heartbeat": "heartbeat 1.8s ease-in-out infinite",
        "float": "float 4s ease-in-out infinite",
        "float-slow": "float-slow 6s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2.2s ease-in-out infinite",
        "shimmer": "shimmer 3s linear infinite"
      }
    }
  },
  plugins: []
};

export default config;
