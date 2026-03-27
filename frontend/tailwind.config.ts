/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./contexts/**/*.{js,ts,jsx,tsx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        crimson: {
          DEFAULT: '#E63946',
          50: '#FEF2F3',
          100: '#FEE5E7',
          200: '#FCD0D5',
          300: '#F9ABB3',
          400: '#F47785',
          500: '#E63946',
          600: '#CB2C38',
          700: '#A9212D',
          800: '#8C1D27',
          900: '#741D24',
        },
      },
    },
  },
  plugins: [],
}