/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f4f9ff',
          100: '#e9f3ff',
          200: '#d4e7ff',
          300: '#b0d4ff',
          400: '#7eb7ff',
          500: '#4c94ff',
          600: '#2c74f6',
          700: '#1c5ce0',
          800: '#1c4db6',
          900: '#1e448f',
          950: '#172b56',
        },
        secondary: {
          50: '#f5f7fa',
          100: '#ebeef3',
          200: '#d2d9e5',
          300: '#abb9cd',
          400: '#7d91b0',
          500: '#5d7396',
          600: '#475b7b',
          700: '#3a4964',
          800: '#334057',
          900: '#2e384a',
          950: '#1c222e',
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
