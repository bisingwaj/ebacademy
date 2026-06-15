/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    // Angles nets façon IBM Carbon (on garde `full` pour les cercles/pastilles).
    borderRadius: {
      none: '0',
      sm: '0',
      DEFAULT: '0',
      md: '0',
      lg: '0',
      xl: '0',
      '2xl': '0',
      '3xl': '0',
      full: '9999px',
    },
    extend: {
      colors: {
        // Échelle de gris IBM Carbon
        gray: {
          10: '#f4f4f4',
          20: '#e0e0e0',
          30: '#c6c6c6',
          40: '#a8a8a8',
          50: '#8d8d8d',
          60: '#6f6f6f',
          70: '#525252',
          80: '#393939',
          90: '#262626',
          100: '#161616',
        },
        // Marine de marque Étoile Bleue (couleur primaire/interactive)
        navy: {
          DEFAULT: '#0d1b3e',
          600: '#1c2c54',
          700: '#142b54',
          800: '#0e1733',
          900: '#0a1430',
          950: '#070f24',
        },
        eb: {
          // Bleu royal de marque « Étoile Bleue » (couleur interactive + logo)
          blue: '#3461c9',
          'blue-strong': '#2a4fa6',
          red: '#e63946',
          'red-strong': '#c5303b',
          // Remappage neutre Carbon (les anciens noms restent valides)
          cream: '#f4f4f4', // surface secondaire (gray-10)
          'cream-2': '#e0e0e0', // gray-20
          line: '#e0e0e0', // bordure subtile
          'line-strong': '#8d8d8d', // bordure forte (champs)
          ink: '#161616', // texte primaire (gray-100)
          muted: '#525252', // texte secondaire (gray-70)
          ok: '#198038', // Carbon green 60 — lisible (AA) en texte sur fond clair
          warn: '#8a6d00', // ambre foncé lisible (AA)
          'warn-bg': '#fcf4d6',
        },
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        // Plus de serif : on reste sur Plex Sans pour un rendu IBM cohérent.
        serif: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(22,22,22,0.06)',
        'card-lg': '0 10px 30px -8px rgba(22,22,22,0.28)',
        focusring: 'inset 0 0 0 2px #3461c9',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-ring': {
          '0%': { boxShadow: '0 0 0 0 rgba(230,57,70,0.45)' },
          '70%': { boxShadow: '0 0 0 22px rgba(230,57,70,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(230,57,70,0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s cubic-bezier(0.22,1,0.36,1) both',
        'pulse-ring': 'pulse-ring 1.8s cubic-bezier(0.66,0,0,1) infinite',
      },
    },
  },
  plugins: [],
}
