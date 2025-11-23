/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        main: 'var(--bg-main)',
        'text-main': 'var(--text-main)',
        accent: 'var(--accent)',
        'accent-hover': 'var(--accent-hover)',
        'panel-bg': 'var(--panel-bg)',
        'input-bg': 'var(--input-bg)',
        'input-text': 'var(--input-text)',
        'border-color': 'var(--border-color)',
        'button-bg': 'var(--button-bg)',
        'button-hover-bg': 'var(--button-hover-bg)',
      }
    },
  },
  plugins: [],
}
