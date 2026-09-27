/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./features/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        seen: {
          bg: "#000000",
          surface: "#121212",
          elevated: "#1a1a1a",
          warm: "#1f1b14",
          gold: "#e8b84a",
          link: "#60a5fa",
        },
      },
    },
  },
  plugins: [],
};
