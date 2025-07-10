/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./{src,pages,components,app}/**/*.{ts,tsx,js,jsx,html}",
    "../seller-ui/src/**/*.{js, ts, tsx, jsx",
    "!./{src,pages,components,app}/**/*.{stories,spec}.{ts,tsx,js,jsx,html}",
    //     ...createGlobPatternsForDependencies(__dirname)
  ],
  theme: {
    extend: {
      fontFamily: {
        Inter: ["var(--font-inter)"],
      },
    },
  },
  plugins: [],
};
