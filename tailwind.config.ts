import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Swapcard Primary Colors
        primary: {
          DEFAULT: "#00B894",
          50: "#E6FAF5",
          100: "#B3F0E1",
          200: "#80E6CE",
          300: "#4DDBBA",
          400: "#26D4AB",
          500: "#00B894",
          600: "#009A7B",
          700: "#007C63",
          800: "#005E4A",
          900: "#004032",
        },
        // Accent Colors
        orange: {
          DEFAULT: "#F39C12",
          50: "#FEF5E6",
          100: "#FCE4B8",
          200: "#FAD38A",
          300: "#F7C15C",
          400: "#F5AF2E",
          500: "#F39C12",
          600: "#C9800E",
          700: "#9F640B",
          800: "#754807",
          900: "#4B2D05",
        },
        purple: {
          DEFAULT: "#9B59B6",
          50: "#F5EDF8",
          100: "#E3CCE9",
          200: "#D1ABDA",
          300: "#BF8ACB",
          400: "#AD69BC",
          500: "#9B59B6",
          600: "#804A97",
          700: "#653B78",
          800: "#4A2B59",
          900: "#2F1C3A",
        },
        // Status Colors
        error: {
          DEFAULT: "#E74C3C",
          50: "#FDEDEC",
          100: "#FADBD8",
          200: "#F5B7B1",
          300: "#F1948A",
          400: "#EC7063",
          500: "#E74C3C",
          600: "#CB4335",
          700: "#B03A2E",
          800: "#943126",
          900: "#78281F",
        },
        warning: {
          DEFAULT: "#F1C40F",
          50: "#FEF9E6",
          100: "#FCF0B8",
          200: "#FAE78A",
          300: "#F8DE5C",
          400: "#F5D42E",
          500: "#F1C40F",
          600: "#C9A30C",
          700: "#9F810A",
          800: "#756007",
          900: "#4B3D05",
        },
        success: {
          DEFAULT: "#27AE60",
          50: "#E9F7EF",
          100: "#C3E8D2",
          200: "#9DD9B5",
          300: "#77CA98",
          400: "#51BB7B",
          500: "#27AE60",
          600: "#20914F",
          700: "#19743F",
          800: "#12572F",
          900: "#0B3A1F",
        },
        // Gray Scale
        gray: {
          50: "#F8FAF9",
          100: "#F2F4F3",
          200: "#E8ECEA",
          300: "#D1D5D3",
          400: "#A1A9A5",
          500: "#6B7671",
          600: "#4A524E",
          700: "#2C3E50",
          800: "#1A252F",
          900: "#0D1217",
        },
        // Background
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)",
        "card-hover": "0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)",
        modal: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "slide-in-right": "slideInRight 0.3s ease-out",
        "slide-in-bottom": "slideInBottom 0.3s ease-out",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(100%)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        slideInBottom: {
          "0%": { opacity: "0", transform: "translateY(100%)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
      },
      // Mobile-first spacing scale
      spacing: {
        "safe-top": "env(safe-area-inset-top)",
        "safe-bottom": "env(safe-area-inset-bottom)",
        "safe-left": "env(safe-area-inset-left)",
        "safe-right": "env(safe-area-inset-right)",
      },
      // Touch-friendly minimum sizes
      minHeight: {
        "touch": "44px",
        "touch-lg": "48px",
      },
      minWidth: {
        "touch": "44px",
        "touch-lg": "48px",
      },
    },
    // Custom screens for better mobile breakpoints
    screens: {
      'xs': '375px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
  },
  plugins: [],
};
export default config;
