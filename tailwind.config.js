/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'primary': '#E94560',
        'secondary': '#533483',
        'dark': '#1A1A2E',
        'darkblue': '#0F3460',
        'lightblue': '#16213E',
        'ikigai-love': '#3b82f6',    // blue-500
        'ikigai-talent': '#14b8a6',  // teal-500
        'ikigai-need': '#a855f7',    // purple-500
        'ikigai-payment': '#6366f1', // indigo-500
        'coral': {
          100: '#FFE5E5',
          200: '#FFCCCC',
          300: '#FFB3B3',
          400: '#FF9999',
          500: '#FF8080',
          600: '#FF6666',
          700: '#FF4D4D',
          800: '#FF3333',
          900: '#FF1A1A'
        },
        tuikigai: {
          cream: '#f7f5ed',     // Crema
          teal: '#10bec5',      // Turquesa
          blue: '#18709c',      // Azul medio
          navy: '#152660'       // Azul marino
        }
      },
      animation: {
        'spin-slow': 'spin 8s linear infinite',
        'pulse-slow': 'pulse 5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-subtle': 'pulseSubtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'bounce-slow': 'bounce 3s infinite',
        'fade-in': 'fadeIn 1.5s ease-out',
        'slide-up': 'slideUp 1s ease-out',
        'scale-in': 'scaleIn 0.6s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
        '3d-rotate': 'rotate3d 10s linear infinite',
        'shimmer': 'shimmer 3s infinite linear',
        'gradient-shift': 'gradientShift 8s ease infinite',
      },
      keyframes: {
        float: {
          '0%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
          '100%': { transform: 'translateY(0)' }
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(59, 130, 246, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.8)' }
        },
        rotate3d: {
          '0%': { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(360deg)' }
        },
        pulseSubtle: {
          '0%': { boxShadow: '0 0 0 0 rgba(255, 255, 255, 0.1)' },
          '70%': { boxShadow: '0 0 10px 10px rgba(255, 255, 255, 0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(255, 255, 255, 0)' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        },
        gradientShift: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' }
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 0deg at 50% 50%, var(--tw-gradient-stops))',
        'grain': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
        'gradient-premium': 'linear-gradient(135deg, #3b82f6 0%, #a855f7 50%, #14b8a6 100%)',
        'gradient-card': 'linear-gradient(to right, rgba(59, 130, 246, 0.05), rgba(168, 85, 247, 0.05))',
        'dots': "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.05' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='1'/%3E%3C/g%3E%3C/svg%3E\")",
        'grid': "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.05' fill-rule='evenodd'%3E%3Cpath d='M0 0h40v1H0V0zm0 40h40v1H0v-1zm1 0V0h1v40H1zm39 0V0h1v40h-1z'/%3E%3C/g%3E%3C/svg%3E\")"
      },
      boxShadow: {
        'premium': '0 10px 25px -5px rgba(59, 130, 246, 0.1), 0 8px 10px -6px rgba(59, 130, 246, 0.1)',
        'premium-hover': '0 20px 25px -5px rgba(59, 130, 246, 0.2), 0 10px 10px -5px rgba(59, 130, 246, 0.1)',
        'card': '0 4px 6px -1px rgba(59, 130, 246, 0.1), 0 2px 4px -1px rgba(59, 130, 246, 0.06)',
        'inner-glow': 'inset 0 2px 10px 0 rgba(59, 130, 246, 0.2)',
        'blue-glow': '0 0 15px rgba(59, 130, 246, 0.3)',
        'purple-glow': '0 0 15px rgba(168, 85, 247, 0.3)', 
        'teal-glow': '0 0 15px rgba(20, 184, 166, 0.3)'
      },
      fontFamily: {
        'sans': ['Inter', 'ui-sans-serif', 'system-ui'],
        'heading': ['Montserrat', 'ui-sans-serif', 'system-ui'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '2rem',
        '3xl': '3rem',
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
        'width': 'width',
        'transform': 'transform',
      },
      scale: {
        '102': '1.02',
      },
      backdropFilter: {
        'none': 'none',
        'blur': 'blur(8px)',
      },
      transitionTimingFunction: {
        'bounce': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'cubic': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}