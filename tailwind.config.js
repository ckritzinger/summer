/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      keyframes: {
        pop: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.12)' },
          '100%': { transform: 'scale(1)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-6px)' },
          '40%': { transform: 'translateX(6px)' },
          '60%': { transform: 'translateX(-4px)' },
          '80%': { transform: 'translateX(4px)' },
        },
        floatUp: {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(-40px)', opacity: '0' },
        },
        streakPulse: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.15)' },
        },
        trophyPulse: {
          '0%, 100%': { transform: 'scale(1) rotate(-4deg)' },
          '50%': { transform: 'scale(1.18) rotate(4deg)' },
        },
      },
      animation: {
        pop: 'pop 0.25s ease-out',
        shake: 'shake 0.35s ease-in-out',
        floatUp: 'floatUp 0.7s ease-out forwards',
        streakPulse: 'streakPulse 0.5s ease-in-out',
        trophyPulse: 'trophyPulse 1.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
