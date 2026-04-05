/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#FDC800",
        accent: "#D9A600",
        secondary: "#432DD7",
        success: "#16A34A",
        warning: "#D97706",
        danger: "#DC2626",
        surface: "#FBFBF9",
        foreground: "#1C293C",
      },
      boxShadow: {
        neo: "4px 4px 0px 0px rgba(0,0,0,1)",
        "neo-sm": "2px 2px 0px 0px rgba(0,0,0,1)",
        "neo-lg": "8px 8px 0px 0px rgba(0,0,0,1)",
      },
      borderRadius: {
        neo: "8px",
      },
      borderWidth: {
        neo: "2px",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
