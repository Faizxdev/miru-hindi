import type { Config } from 'tailwindcss'

export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          base:     '#08080A',
          surface:  '#111116',
          elevated: '#171720',
          overlay:  '#20202C',
        },
        accent: {
          DEFAULT: '#FF2A42',
          hover:   '#E01A32',
          muted:   '#7A121E',
          glow:    'rgba(255, 42, 66, 0.25)',
        },
        gold: {
          DEFAULT: '#F5A623',
          muted:   '#A56A15',
        },
        content: {
          primary:   '#F4F4F8',
          secondary: '#9898A6',
          tertiary:  '#5C5C6B',
        },
        border: {
          subtle: '#1C1C26',
          medium: '#2B2B3A',
          active: '#FF2A42',
        },
      },
      fontFamily: {
        sans:    ['"DM Sans"', 'sans-serif'],
        display: ['"Playfair Display"', 'serif'],
        serif:   ['"Playfair Display"', 'serif'],
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '14px',
      },
      transitionTimingFunction: {
        soft: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
} satisfies Config


