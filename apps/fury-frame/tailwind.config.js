/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        furyblue: {
          50: '#041726',
          100: '#041726',
          200: '#041726',
          300: '#041726',
          400: '#041726',
          500: '#041726',
          600: '#041726',
          700: '#041726',
          800: '#041726',
          900: '#0F2538',
        },
        accent: '#00ffff',
      },
    },
  },
  safelist: [
    { pattern: /(text|border|ring|outline|from|to|via)-\[#00ffff\]/ },
    { pattern: /(hover|focus|active):((text|border|ring|outline)-\[#00ffff\])/ },
  ],
  plugins: [],
}