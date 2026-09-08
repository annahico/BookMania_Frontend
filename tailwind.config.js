/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
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
        //   Light mode (on white/cream):
        //     - solid fills / body text -> pink-700+ (>=6:1)
        //     - focus rings / borders   -> pink-600 (>=4.5:1, >=3:1 non-text)
        //     - light chip backgrounds  -> pink-50/100/200 (paired with pink-700+ text)
        //   Dark mode (on slate-900/800): contrast inverts, so text needs to
        //   get LIGHTER, not stay at the same shade —
        //     - body text / links       -> dark:text-pink-400 (still >=4.5:1 on slate-900)
        //     - chip backgrounds        -> dark:bg-pink-900 dark:text-pink-200
        //     - solid button fills      -> dark:bg-pink-600 (white text stays >=4.5:1)
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