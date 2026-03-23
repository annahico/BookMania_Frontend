/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fuchsia: {
          50: "#fff5f9",
          100: "#ffe8f2",
          200: "#ffd1e6",
          300: "#ffb3d4",
          400: "#ff8ab8",
          500: "#f48fb1",
          600: "#f06292",
          700: "#ec407a",
          800: "#e91e63",
          900: "#c2185b",
        },
        cream: {
          50: "#fdfbf7",
          100: "#faf6ef",
          200: "#f5ede0",
        }
      }
    },
  },
  plugins: [],
}