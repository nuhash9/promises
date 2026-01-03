/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    fontFamily: {
      "serif": ["Lora", "serif"],
      "sans": ["Inter", "sans-serif"]
    },
    extend: {},
  },
  plugins: [],
}
