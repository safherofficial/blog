import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#FAF6EF',
        'bg-soft': '#F1E9DC',
        ink: '#211C18',
        'ink-soft': '#6E6255',
        wine: '#5E1B26',
        'wine-dark': '#3F1219',
        ochre: '#A9812F',
        sage: '#7C8A6E',
        line: '#E4D9C7',
      },
      fontFamily: {
        display: ['var(--font-fraunces)', 'Georgia', 'serif'],
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        body: ['var(--font-inter)', 'sans-serif'],
        mono: ['var(--font-space-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
}
export default config
