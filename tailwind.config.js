/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        terracotta: {
          50: '#fef3ee',
          100: '#fde3d3',
          200: '#fbc3a5',
          300: '#f89b6d',
          400: '#f46933',
          500: '#f14b14',
          600: '#e2330a',
          700: '#bb240b',
          800: '#951f11',
          900: '#781e12',
        },
        cream: {
          50: '#fefef9',
          100: '#fffdf0',
          200: '#fffae0',
          300: '#fff5c4',
          400: '#ffec9a',
          500: '#ffe070',
        },
        warm: {
          50: '#fafaf5',
          100: '#f5f0e8',
          200: '#ede3d4',
          300: '#dfd0bc',
          400: '#cbb89d',
          500: '#b59e80',
          600: '#9a8065',
          700: '#7e6550',
          800: '#5c4839',
          900: '#3a2d24',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        container: '1280px',
      },
    },
  },
  plugins: [],
}

