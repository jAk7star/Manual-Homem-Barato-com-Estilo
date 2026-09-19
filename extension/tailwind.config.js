/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#121316',
        surface: '#1A1C22',
        border: '#282B34',
        copper: {
          500: '#C85A32',
          600: '#B8522B',
        },
        amber: {
          500: '#D97706',
        },
        slate: {
          900: '#121316',
          800: '#1A1C22',
          700: '#282B34',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'sans-serif'],
      },
      boxShadow: {
        'anti-vibe': '0 8px 30px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [],
}
