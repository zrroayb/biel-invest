import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1.25rem",
        md: "2rem",
        lg: "2.5rem",
      },
      screens: {
        "2xl": "1440px",
      },
    },
    extend: {
      colors: {
        ivory: {
          DEFAULT: "#FAF7F2",
          50: "#FDFCF9",
          100: "#FAF7F2",
          200: "#F3EEE4",
          300: "#E8E2D8",
        },
        ink: {
          DEFAULT: "#1C1C1C",
          soft: "#2A2A2A",
          muted: "#6B6762",
        },
        olive: {
          DEFAULT: "#1F8FC7",
          dark: "#16709F",
          light: "#54ABDA",
        },
        sand: {
          DEFAULT: "#D9CBB4",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-fraunces)", "Georgia", "serif"],
      },
      fontSize: {
        "display-xl": ["clamp(3rem, 7vw, 6rem)", { lineHeight: "1.02", letterSpacing: "-0.03em" }],
        "display-lg": ["clamp(2.25rem, 5vw, 4rem)", { lineHeight: "1.05", letterSpacing: "-0.025em" }],
        "display-md": ["clamp(1.75rem, 3.5vw, 2.75rem)", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
      },
      borderRadius: {
        xs: "2px",
        sm: "4px",
        DEFAULT: "6px",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(28, 28, 28, 0.04), 0 8px 24px rgba(28, 28, 28, 0.06)",
        lift: "0 2px 4px rgba(28, 28, 28, 0.06), 0 20px 40px rgba(28, 28, 28, 0.08)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
