/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gray: {
          950: '#0a0b0f',
          900: '#111217',
          800: '#1a1b23',
          700: '#2a2c35',
          600: '#3e404c',
          500: '#555865',
          400: '#7b7f91',
          300: '#a1a4b3',
          200: '#c7c9d3',
          100: '#edeef2',
        },
      },
      animation: {
        'slide-up': 'slide-up 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      },
      keyframes: {
        'slide-up': {
          '0%': {
            transform: 'translateY(100%)',
            opacity: '0',
          },
          '100%': {
            transform: 'translateY(0)',
            opacity: '1',
          },
        },
      },
      screens: {
        'xs': '375px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
    },
  },
  plugins: [],
};