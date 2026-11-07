/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb', // Crisp Royal Blue
        secondary: '#334155',
        accent: '#0d9488', // Teal 600
        background: '#fafaf9',
        card: '#ffffff',
        text: {
          main: '#18181b',
          muted: '#71717a'
        },
        dark: {
          900: '#09090b',
          800: '#121215',
          700: '#18181b'
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
