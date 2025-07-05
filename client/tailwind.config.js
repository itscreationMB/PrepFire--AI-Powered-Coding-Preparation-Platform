module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
      "./public/index.html"
    ],
    theme: {
      extend: {
        fontFamily: {
          'inter': ['Inter', 'sans-serif'],
          'mono': ['JetBrains Mono', 'Monaco', 'Consolas', 'monospace'],
        },
        colors: {
          'neon-cyan': '#00ffff',
          'neon-purple': '#8b5cf6',
          'neon-pink': '#ec4899',
          'dark-bg': '#0f0f23',
          'dark-surface': '#1a1a2e',
          'glass': {
            'bg': 'rgba(255, 255, 255, 0.1)',
            'border': 'rgba(255, 255, 255, 0.2)',
            'hover': 'rgba(255, 255, 255, 0.15)',
          }
        },
        backdropBlur: {
          'xs': '2px',
          'sm': '4px',
          'md': '8px',
          'lg': '16px',
          'xl': '24px',
          '2xl': '40px',
          '3xl': '64px',
        },
        animation: {
          'float': 'float 3s ease-in-out infinite',
          'pulse-ring': 'pulse-ring 2s infinite',
          'particle-float': 'particle-float 4s linear infinite',
          'shimmer': 'shimmer 2s infinite',
          'grid-move': 'grid-move 20s linear infinite',
          'morph': 'morph 8s ease-in-out infinite',
          'aurora': 'aurora 15s ease infinite',
          'glow': 'glow 2s ease-in-out infinite alternate',
        },
        keyframes: {
          float: {
            '0%, 100%': { transform: 'translateY(0px)' },
            '50%': { transform: 'translateY(-20px)' },
          },
          'pulse-ring': {
            '0%': { transform: 'scale(0.33)', opacity: '1' },
            '80%, 100%': { transform: 'scale(2.5)', opacity: '0' },
          },
          'particle-float': {
            '0%': { transform: 'translateY(100vh) rotate(0deg)', opacity: '0' },
            '10%': { opacity: '1' },
            '90%': { opacity: '1' },
            '100%': { transform: 'translateY(-100px) rotate(360deg)', opacity: '0' },
          },
          shimmer: {
            '0%': { backgroundPosition: '-200% 0' },
            '100%': { backgroundPosition: '200% 0' },
          },
          'grid-move': {
            '0%': { backgroundPosition: '0 0' },
            '100%': { backgroundPosition: '50px 50px' },
          },
          morph: {
            '0%': { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' },
            '50%': { borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%' },
            '100%': { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' },
          },
          aurora: {
            '0%': { backgroundPosition: '0% 50%' },
            '50%': { backgroundPosition: '100% 50%' },
            '100%': { backgroundPosition: '0% 50%' },
          },
          glow: {
            '0%': { boxShadow: '0 0 20px rgba(0, 255, 255, 0.5)' },
            '100%': { boxShadow: '0 0 30px rgba(0, 255, 255, 0.8), 0 0 40px rgba(139, 92, 246, 0.3)' },
          },
        },
        perspective: {
          '500': '500px',
          '1000': '1000px',
          '1500': '1500px',
          '2000': '2000px',
        },
        transformStyle: {
          '3d': 'preserve-3d',
        },
        backfaceVisibility: {
          'hidden': 'hidden',
          'visible': 'visible',
        },
        boxShadow: {
          'glow-sm': '0 0 10px rgba(0, 255, 255, 0.3)',
          'glow': '0 0 20px rgba(0, 255, 255, 0.5)',
          'glow-lg': '0 0 30px rgba(0, 255, 255, 0.7)',
          'glow-purple': '0 0 20px rgba(139, 92, 246, 0.5)',
          'glow-pink': '0 0 20px rgba(236, 72, 153, 0.5)',
          'glass': '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          'glass-lg': '0 35px 60px -12px rgba(0, 0, 0, 0.6)',
        },
        textShadow: {
          'glow': '0 0 10px rgba(0, 255, 255, 0.8)',
          'glow-sm': '0 0 5px rgba(0, 255, 255, 0.6)',
          'glow-lg': '0 0 20px rgba(0, 255, 255, 1)',
        },
      },
    },
    plugins: [
      function({ addUtilities }) {
        const newUtilities = {
          '.text-shadow-glow': {
            textShadow: '0 0 10px rgba(0, 255, 255, 0.8)',
          },
          '.text-shadow-glow-sm': {
            textShadow: '0 0 5px rgba(0, 255, 255, 0.6)',
          },
          '.text-shadow-glow-lg': {
            textShadow: '0 0 20px rgba(0, 255, 255, 1)',
          },
          '.perspective-1000': {
            perspective: '1000px',
          },
          '.transform-style-3d': {
            transformStyle: 'preserve-3d',
          },
          '.backface-hidden': {
            backfaceVisibility: 'hidden',
          },
          '.rotate-y-180': {
            transform: 'rotateY(180deg)',
          },
        }
        addUtilities(newUtilities)
      }
    ],
  }