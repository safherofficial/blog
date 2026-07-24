import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#F1EAE0',
        'bg-soft': '#E7DDCC',
        ink: '#2B2420',
        'ink-soft': '#6B5F52',
        wine: '#7A2E3A',
        'wine-dark': '#5C222B',
        ochre: '#B8874A',
        sage: '#7C8A6E',
        line: '#D9CDB8',
      },
      fontFamily: {
        display: ['var(--font-fraunces)', 'Georgia', 'serif'],
        body: ['var(--font-inter)', 'sans-serif'],
        mono: ['var(--font-space-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
}
export default config
