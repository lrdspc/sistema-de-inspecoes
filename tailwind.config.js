/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        blue: {
          50: '#f0f7ff',
          100: '#e0eefe',
          200: '#bae0fd',
          300: '#7dcbfc',
          400: '#39b0f8',
          500: '#0e96eb',
          600: '#0051a2',
          700: '#0051a2',
          800: '#004487',
          900: '#00376e',
          950: '#00264d',
        },
      }
    },
  },
  plugins: [],
};