/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        obsidian: {
          50: '#faf9f7',
          100: '#f0ede8',
          200: '#e2ddd4',
          300: '#cec7ba',
          400: '#b5ab9a',
          500: '#9d9180',
          600: '#837868',
          700: '#6b6255',
          800: '#5a5248',
          900: '#4d4640',
          950: '#0a0a0f',
        },
        gold: {
          50: '#fbf7f0',
          100: '#f5ecd8',
          200: '#ead6b0',
          300: '#dcbc82',
          400: '#d4a860',
          500: '#c9a86c',
          600: '#b08d4f',
          700: '#8f7040',
          800: '#765c38',
          900: '#614c30',
        },
        ink: {
          50: '#f6f6f8',
          100: '#ececf0',
          200: '#d5d5de',
          300: '#b1b1c2',
          400: '#8787a0',
          500: '#686885',
          600: '#555570',
          700: '#47475d',
          800: '#3e3e50',
          900: '#373746',
          950: '#06060a',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', '"Noto Serif SC"', 'system-ui', 'sans-serif'],
        serif: ['"Noto Serif SC"', '"Space Grotesk"', 'Georgia', 'serif'],
        sans: ['"Space Grotesk"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      fontSize: {
        'display-2xl': ['5rem', { lineHeight: '1.05', letterSpacing: '-0.03em' }],
        'display-xl': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-lg': ['2.5rem', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        'display-md': ['1.75rem', { lineHeight: '1.25', letterSpacing: '-0.01em' }],
        'display-sm': ['1.25rem', { lineHeight: '1.35', letterSpacing: '-0.01em' }],
      },
      borderRadius: {
        '4xl': '1.5rem',
        '5xl': '2rem',
      },
      boxShadow: {
        'elevated': '0 1px 2px rgba(0,0,0,0.02), 0 4px 8px rgba(0,0,0,0.03), 0 8px 16px rgba(0,0,0,0.03), 0 16px 32px rgba(0,0,0,0.02)',
        'elevated-lg': '0 2px 4px rgba(0,0,0,0.02), 0 8px 16px rgba(0,0,0,0.03), 0 16px 32px rgba(0,0,0,0.04), 0 32px 64px rgba(0,0,0,0.03)',
        'elevated-dark': '0 1px 2px rgba(0,0,0,0.2), 0 4px 8px rgba(0,0,0,0.2), 0 8px 16px rgba(0,0,0,0.15), 0 16px 32px rgba(0,0,0,0.1)',
        'glow-gold': '0 0 40px rgba(201,168,108,0.15)',
        'glow-gold-lg': '0 0 80px rgba(201,168,108,0.2)',
        'inner-light': 'inset 0 1px 1px rgba(255,255,255,0.06)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'fade-in-up': 'fadeInUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'fade-in-down': 'fadeInDown 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'scale-in': 'scaleIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'slide-in-right': 'slideInRight 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'float': 'float 8s ease-in-out infinite',
        'float-slow': 'floatSlow 16s ease-in-out infinite',
        'pulse-subtle': 'pulseSubtle 4s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
        'spin-slow': 'spin 20s linear infinite',
        'breathe': 'breathe 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-12px) rotate(0.5deg)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(20px, -16px) scale(1.03)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.8' },
          '50%': { transform: 'scale(1.02)', opacity: '1' },
        },
      },
      transitionTimingFunction: {
        'expo-out': 'cubic-bezier(0.22, 1, 0.36, 1)',
        'expo-in-out': 'cubic-bezier(0.87, 0, 0.13, 1)',
      },
    },
  },
  plugins: [],
}
