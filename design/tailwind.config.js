/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Палитра приложения: тёмный фон, серые поверхности, акцент.
        bg: '#0d1117',
        surface: '#161b22',
        'surface-2': '#1f2630',
        border: '#30363d',
        text: '#e6edf3',
        muted: '#7d8590',
        accent: '#2f81f7',
      },
    },
  },
  plugins: [],
}
