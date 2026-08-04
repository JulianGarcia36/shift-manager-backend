/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0F172A',
          light: '#F8FAFC',
          gray: '#64748B',
        },
        state: {
          green: '#10B981',
          blue: '#3B82F6',
          purple: '#8B5CF6',
          red: '#EF4444',
          orange: '#F59E0B',
          gray: '#94A3B8',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    }
  }
}
