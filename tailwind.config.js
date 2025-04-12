/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f5ff',
          100: '#e0ebff',
          200: '#c7d9fe',
          300: '#a3bffd',
          400: '#799cfb',
          500: '#5678f9',
          600: '#375eef',
          700: '#2c4ad5',
          800: '#273cac',
          900: '#243687',
          950: '#0f1b4d',
        },
        secondary: {
          50: '#f4f6fa',
          100: '#e8ecf5',
          200: '#d1d9e9',
          300: '#aebdd8',
          400: '#7d91b0',
          500: '#5d7396',
          600: '#475b7b',
          700: '#3a4964',
          800: '#1e2534',
          900: '#141923',
          950: '#0c0f16',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
