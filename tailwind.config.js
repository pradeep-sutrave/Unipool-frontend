/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0D0D0D",
        surface: "#1C1C1C",
        border: "#2A2A2A",
        purple: "#6C63CC",
        primary: "#F5F5F5",
        muted: "#888888",
      },
      fontFamily: {
        sans: ["DM Sans", "sans-serif"],
        display: ["Syne", "sans-serif"],
      },
    },
  },
  plugins: [],
}