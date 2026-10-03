/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        provenance: {
          50: '#f0f5ff',
          100: '#e0ecff',
          200: '#c2d9ff',
          300: '#94beff',
          400: '#5e99ff',
          500: '#3873fb',
          600: '#1f53f0',
          700: '#183edb',
          800: '#1933b1',
          900: '#1a308b',
          950: '#111d55',
        },
        slate: {
          850: '#172033',
          950: '#0b0f19',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace']
      }
    },
  },
  plugins: [],
}
