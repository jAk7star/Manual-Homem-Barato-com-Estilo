/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0e0f12',
        surface: '#14151a',
        border: '#22242b',
        copper: {
          500: '#C85A32',
          600: '#B8522B',
        },
        amber: {
          500: '#D97706',
        },
        sand: {
          base: '#F7F5F0',
          surface: '#FFFFFF',
          border: '#DCD5CA',
          text: '#1B1B18',
          accent: '#B84A28',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        display: ['"Space Grotesk"', '"Plus Jakarta Sans"', 'sans-serif'],
        editorial: ['Manrope', '"Plus Jakarta Sans"', 'sans-serif'],
      },
      boxShadow: {
        'anti-vibe': '0 8px 30px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [],
}
