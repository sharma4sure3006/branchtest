/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e3f2fd',
          500: '#1976d2',
          600: '#1565c0',
          700: '#0d47a1',
        },
        secondary: {
          50: '#e8f5e8',
          500: '#4caf50',
          600: '#388e3c',
        },
        error: {
          50: '#ffebee',
          500: '#d32f2f',
          600: '#c62828',
        },
        warning: {
          50: '#fff3e0',
          500: '#ff9800',
          600: '#f57c00',
        },
        info: {
          50: '#e1f5fe',
          500: '#2196f3',
          600: '#1976d2',
        },
        success: {
          50: '#e8f5e8',
          500: '#4caf50',
          600: '#388e3c',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      }
    },
  },
  plugins: [],
}