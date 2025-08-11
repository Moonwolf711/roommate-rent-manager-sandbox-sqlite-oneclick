import type { Config } from 'tailwindcss'
const config: Config = {
  darkMode: ['class'],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: { brand: { DEFAULT: '#4f46e5' } },
      boxShadow: { card: '0 1px 2px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.05)' }
    }
  },
  plugins: []
}
export default config
