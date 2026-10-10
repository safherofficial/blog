import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // One cohesive palette derived from the warm backlight and shadow in the Controluce portrait.
        bg: '#F5EFE5',
        'bg-soft': '#E9DED0',
        ink: '#211A15',
        'ink-soft': '#6A5C50',
        wine: '#604633',
        'wine-dark': '#34251D',
        ochre: '#8A683F',
        'gold-soft': '#D5B27F',
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
