/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Uses Tailwind's built-in `pink` scale (not overridden here) so the
        // brand color is an actual pink, not fuchsia. Usage convention for
        // WCAG AA contrast (see README "Accessibility" note):
        //   - solid fills / body text on white  -> pink-700+ (>=6:1)
        //   - focus rings / borders             -> pink-600 (>=4.5:1, >=3:1 non-text)
        //   - light chip/badge backgrounds       -> pink-50/100/200 (paired with pink-700+ text)
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