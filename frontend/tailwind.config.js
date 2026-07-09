/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#f0f4ff',
          100: '#e0e9ff',
          200: '#c7d7fe',
          300: '#a5bafc',
          400: '#8196f8',
          500: '#6272f1',
          600: '#4d55e5',
          700: '#3f44ca',
          800: '#343aa3',
          900: '#2f3481',
          950: '#1c1f4b',
        },
        dark: {
          50:  '#f6f7f9',
          100: '#eceef2',
          200: '#d5d9e3',
          300: '#b1baca',
          400: '#8795aa',
          500: '#677890',
          600: '#536077',
          700: '#444e61',
          800: '#3b4252',
          900: '#1e2333',
          950: '#13172a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}
