import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Warm charcoal, antique gold and soft parchment sampled from the Controluce backlit portrait.
        bg: '#F5EFE5',
        'bg-soft': '#E9DED0',
        ink: '#211A15',
        'ink-soft': '#706155',
        wine: '#604633',
        'wine-dark': '#34251D',
        ochre: '#C9A879',
        sage: '#8C8173',
        line: '#D9C9B7',
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
