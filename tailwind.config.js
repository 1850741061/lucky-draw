/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dropbox: {
          blue: '#00F0FF', // Neon Cyan
          'blue-dark': '#0052FF', // Electric Blue
          'blue-light': '#80F5FF',
          black: '#030307',
          white: 'rgba(15, 18, 36, 0.45)', // Custom dark translucent glass base
          gray: {
            50: '#070814', // Deep space dark background
            100: 'rgba(255, 255, 255, 0.08)', // Fine glowing boundary
            200: 'rgba(255, 255, 255, 0.15)', // Hover glass boundary
            300: '#64748B', // Cool grey
            400: '#94A3B8', // Medium text grey
            500: '#CBD5E1', // Light text slate
            600: '#E2E8F0',
            700: '#F1F5F9',
            800: '#F8FAFC',
            900: '#FFFFFF', // Pure white primary text
          },
          accent: {
            purple: '#BD00FF', // Cyber Purple
            pink: '#FF007A', // Cyber Pink
            coral: '#FF0055', // Cyber Rose Red
            orange: '#FF9E00', // Neon Orange
            yellow: '#FFEE00', // Neon Yellow
            green: '#00FF85', // Neon Emerald
            teal: '#00FFD2', // Neon Teal
          }
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        'display-xl': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.03em' }],
        'display-lg': ['3.5rem', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        'display-md': ['2.5rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'display-sm': ['1.75rem', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'soft': '0 4px 30px rgba(0, 0, 0, 0.4)',
        'soft-lg': '0 10px 40px rgba(0, 0, 0, 0.6)',
        'soft-xl': '0 20px 60px rgba(0, 0, 0, 0.8)',
        'glow-blue': '0 0 30px rgba(0, 240, 255, 0.25)',
        'glow-blue-lg': '0 0 50px rgba(0, 240, 255, 0.4)',
        'glow-purple': '0 0 35px rgba(189, 0, 255, 0.25)',
        'glow-pink': '0 0 35px rgba(255, 0, 122, 0.25)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glass-glow': 'inset 0 0 12px rgba(255, 255, 255, 0.05), 0 8px 32px 0 rgba(0, 0, 0, 0.5)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'fade-in-up': 'fadeInUp 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'scale-in': 'scaleIn 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'spin-slow': 'spin 12s linear infinite',
        'bounce-soft': 'bounceSoft 3s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'float': 'float 8s ease-in-out infinite',
        'float-slow': 'floatSlow 12s ease-in-out infinite',
        'float-slower': 'floatSlower 16s ease-in-out infinite',
        'wiggle': 'wiggle 0.5s ease-in-out',
        'pulse-glow': 'pulseGlow 2.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(3deg)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(60px, -40px) scale(1.15)' },
        },
        floatSlower: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(-60px, 30px) scale(0.9)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.8', transform: 'scale(1)', filter: 'brightness(1)' },
          '50%': { opacity: '1', transform: 'scale(1.02)', filter: 'brightness(1.1)' },
        },
      },
      transitionTimingFunction: {
        'dropbox': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
    },
  },
  plugins: [],
}
