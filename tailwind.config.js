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
          blue: 'var(--color-accent)', // White in dark, Obsidian black in light
          'blue-dark': 'var(--color-accent-dark)', // Grey-silver/Charcoal
          'blue-light': 'var(--color-text-secondary)',
          black: 'var(--color-bg)',
          white: 'var(--color-surface)', // Frosted translucent background
          gray: {
            50: 'var(--color-bg)', // Dynamic page background
            100: 'var(--color-border)', // Fine wireframe boundary
            200: 'var(--color-border-hover)', // Subtle hover boundary
            300: 'var(--color-text-muted)', // Muted slate gray
            400: 'var(--color-text-secondary)', // Body gray text
            500: 'var(--color-text-secondary-light)', // Secondary light grey text
            600: 'var(--color-text-muted)',
            700: 'var(--color-text-secondary)',
            800: 'var(--color-text-secondary-light)',
            900: 'var(--color-text)', // High-contrast pure white/pure black text
          },
          accent: {
            purple: 'var(--color-accent-purple)', // Slate-metal / Silver
            pink: 'var(--color-accent-pink)',
            coral: '#FF4B4B', // Retain scarlet red for delete actions
            orange: 'var(--color-text-secondary)',
            yellow: 'var(--color-text)',
            green: 'var(--color-text)',
            teal: 'var(--color-text-muted)',
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
        '2xl': '0.75rem', // slightly sharper for luxury feel
        '3xl': '1rem',
        '4xl': '1.25rem',
      },
      boxShadow: {
        'soft': '0 4px 30px rgba(0, 0, 0, 0.8)',
        'soft-lg': '0 10px 40px rgba(0, 0, 0, 0.9)',
        'soft-xl': '0 20px 60px rgba(0, 0, 0, 0.95)',
        'glow-blue': '0 0 30px rgba(255, 255, 255, 0.05)',
        'glow-blue-lg': '0 0 50px rgba(255, 255, 255, 0.08)',
        'glow-purple': '0 0 35px rgba(255, 255, 255, 0.05)',
        'glow-pink': '0 0 35px rgba(255, 255, 255, 0.05)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.9)',
        'glass-glow': 'inset 0 0 1px rgba(255, 255, 255, 0.1), 0 8px 32px 0 rgba(0, 0, 0, 0.9)',
      },
      animation: {
        'fade-in': 'fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in-up': 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'spin-slow': 'spin 18s linear infinite', // slower spin for art elegance
        'bounce-soft': 'bounceSoft 4s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
        'float': 'float 10s ease-in-out infinite',
        'float-slow': 'floatSlow 16s ease-in-out infinite',
        'float-slower': 'floatSlower 20s ease-in-out infinite',
        'wiggle': 'wiggle 0.5s ease-in-out',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.98)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-10px) rotate(1deg)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(30px, -20px) scale(1.05)' },
        },
        floatSlower: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(-30px, 15px) scale(0.95)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-1.5deg)' },
          '50%': { transform: 'rotate(1.5deg)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.9', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.01)' },
        },
      },
      transitionTimingFunction: {
        'dropbox': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'bounce': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
    },
  },
  plugins: [],
}
