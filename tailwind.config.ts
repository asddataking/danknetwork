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
        // DankPass brand colors for /rewards section
        brand: {
          bg: 'rgb(0 0 0)',           // Pure black
          primary: 'rgb(0 255 136)',   // Electric green
          ink: 'rgb(255 255 255)',     // White text
          subtle: 'rgb(156 163 175)',  // Gray-400
          card: 'rgb(17 17 17)',       // Dark gray cards
          success: 'rgb(0 255 136)',   // Electric green
          warn: 'rgb(255 200 97)',
          error: 'rgb(255 93 93)'
        },
        'dp-dark': '#000000',
        'dp-blue': {
          100: '#1a1a1a',
          300: '#00ff88',
          500: '#00ff88',
          600: '#00cc6a',
          800: '#009955'
        },
        'dp-mint': '#00ff88',
        'dp-lime': '#00ff88',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        heading: ['var(--font-space-grotesk)', 'Space Grotesk', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        xs: ['0.875rem', { lineHeight: '1.5' }],
        sm: ['1rem', { lineHeight: '1.6' }],
        base: ['1.125rem', { lineHeight: '1.75' }],
        lg: ['1.25rem', { lineHeight: '1.75' }],
        xl: ['1.5rem', { lineHeight: '1.75' }],
        '2xl': ['1.875rem', { lineHeight: '1.6' }],
        '3xl': ['2.25rem', { lineHeight: '1.5' }],
        '4xl': ['3rem', { lineHeight: '1.4' }],
        '5xl': ['3.75rem', { lineHeight: '1.3' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        'safe-top': 'env(safe-area-inset-top, 0px)',
        'safe-bottom': 'env(safe-area-inset-bottom, 0px)',
        'safe-left': 'env(safe-area-inset-left, 0px)',
        'safe-right': 'env(safe-area-inset-right, 0px)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        soft: '0 8px 30px rgba(14,23,38,0.08)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}
export default config

