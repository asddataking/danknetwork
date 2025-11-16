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
          bg: '#050709',
          surface: '#0a0f14',
        },
        accent: {
          turquoise: '#0fb9c9',
          sky: '#87ceeb',
        },
      },
    },
  },
  plugins: [],
}
export default config

