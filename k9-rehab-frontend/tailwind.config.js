import tailwindcssAnimate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // shadcn/ui CSS variable colors (required)
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // K9 Medical Palette (from constants/colors.js)
        k9: {
          navy:         "#0A2540",
          "navy-mid":   "#0F3460",
          "navy-light": "#164E80",
          teal:         "#0EA5E9",
          "teal-dark":  "#0284C7",
          "teal-light": "#E0F2FE",
          green:        "#059669",
          "green-bg":   "#ECFDF5",
          amber:        "#D97706",
          "amber-bg":   "#FFFBEB",
          red:          "#DC2626",
          "red-bg":     "#FEF2F2",
          bg:           "#F8FAFC",
          surface:      "#FFFFFF",
          border:       "#E2E8F0",
          "border-light": "#F1F5F9",
          text:         "#0F172A",
          "text-mid":   "#475569",
          "text-light": "#94A3B8",
          neon:         "#39FF7E",
        },
      },
      fontFamily: {
        sans:  ["Inter", "-apple-system", "Segoe UI", "sans-serif"],
        brand: ["Exo 2", "Inter", "sans-serif"],
        logo:  ["Orbitron", "Exo 2", "Rajdhani", "sans-serif"],
        mono:  ["source-code-pro", "Menlo", "Monaco", "monospace"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "ekg-scroll": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "neon-pulse": {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "ekg-scroll": "ekg-scroll 3s linear infinite",
        "neon-pulse": "neon-pulse 2.8s ease-in-out infinite",
      },
    },
  },
  plugins: [
    tailwindcssAnimate,
  ],
};
