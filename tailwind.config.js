/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        // Editorial serif for headings; clean sans for body/data.
        serif: ['Newsreader', 'Georgia', 'Cambria', 'Times New Roman', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        // Near-neutral warm-paper base + ink. One accent (ink-blue) used sparingly.
        paper: '#faf9f7',
        ink: {
          DEFAULT: '#1c1b19',
          soft: '#46433f',
          // Darkened for AA contrast on paper (~5:1) — used for meta / small print.
          faint: '#6e6a62',
        },
        line: '#e6e3dd',
        accent: {
          DEFAULT: '#1f3a5f', // deep, quiet blue — primary action
          soft: '#3a5a82',
        },
        // Semantic state colors — quiet, used only for state.
        critical: '#a3341f', // muted brick red — Critical Safety grouping
        approve: '#2f6b46', // muted forest green — Approved state
        decline: '#7a746c', // neutral warm grey — Declined state
      },
      boxShadow: {
        // A single soft lift for the sticky bars only. No shadow-soup.
        rail: '0 1px 2px rgba(28,27,25,0.04)',
        bar: '0 -1px 12px rgba(28,27,25,0.06)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pop: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '60%': { transform: 'scale(1.04)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.4s cubic-bezier(0.22,1,0.36,1) both',
        pop: 'pop 0.28s cubic-bezier(0.22,1,0.36,1) both',
      },
    },
  },
  plugins: [],
}
