import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#000000',
          surface: '#0a0a0a',
        },
        neon: {
          green: '#00ff00',
          'green-dark': '#00cc00',
          orange: '#ff6b00',
          'orange-dark': '#ff5500',
        },
      },
    },
  },
  plugins: [],
}
export default config

