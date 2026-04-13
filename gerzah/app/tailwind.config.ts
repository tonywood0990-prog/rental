import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#C8102E',
          50:  '#FFF0F2',
          100: '#FFD6DC',
          200: '#FFADB9',
          300: '#FF8497',
          400: '#F15070',
          500: '#C8102E',
          600: '#A30D25',
          700: '#7E0A1C',
          800: '#590714',
          900: '#34040B',
        },
        secondary: {
          DEFAULT: '#1A1A2E',
          50:  '#E8E8F0',
          100: '#C5C5DB',
          200: '#9595BB',
          300: '#65659B',
          400: '#3F3F80',
          500: '#1A1A2E',
          600: '#141426',
          700: '#0F0F1E',
          800: '#0A0A16',
          900: '#05050E',
        },
        accent: {
          DEFAULT: '#F5A623',
          50:  '#FFFBF0',
          100: '#FEF0CC',
          200: '#FDD88A',
          300: '#FCC048',
          400: '#F5A623',
          500: '#D4870A',
          600: '#A86808',
          700: '#7C4A05',
          800: '#503003',
          900: '#241501',
        },
        background: '#F8F6F1',
        surface: '#FFFFFF',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Noto Sans Mongolian', 'sans-serif'],
        mongolian: ['Noto Sans Mongolian', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
        input: '8px',
      },
      boxShadow: {
        card: '0 4px 24px rgba(0,0,0,0.08)',
        'card-hover': '0 8px 32px rgba(0,0,0,0.12)',
        warm: '0 2px 16px rgba(200,16,46,0.08)',
      },
    },
  },
  plugins: [],
}

export default config
