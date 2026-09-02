import type { Config } from 'tailwindcss';

/**
 * TSC brand system — colors locked to the official logo.
 * Blue dominates structure; gold is a scarce, high-impact accent.
 */
const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    './data/**/*.{ts,tsx}',
    './hooks/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#1457A2', // Primary Brand Blue
          dark: '#0E4380',    // Primary Brand Blue — Dark
          50: '#EEF4FB',
          100: '#DCE9F7',
        },
        gold: {
          DEFAULT: '#F6A61D', // Accent Gold — logo dot
          deep: '#D98C0A',    // Accent Gold — Deep (hover)
          50: '#FEF5E4',
          100: '#FCE9C4',
        },
        ink: '#0C0C0C',       // headlines / body
        cream: '#FAF9F6',     // page background
        muted: '#6B7280',     // meta text
        hairline: '#E7E5DF',  // borders / dividers
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(12,12,12,0.04), 0 10px 28px -14px rgba(12,12,12,0.14)',
        lift: '0 2px 6px rgba(12,12,12,0.06), 0 20px 44px -18px rgba(12,12,12,0.24)',
      },
      keyframes: {
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        'pulse-dot': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.35', transform: 'scale(0.75)' },
        },
        'play-pulse': {
          '0%': { transform: 'scale(1)', opacity: '0.55' },
          '100%': { transform: 'scale(2)', opacity: '0' },
        },
        'wave-bar': {
          '0%, 100%': { transform: 'scaleY(0.3)' },
          '50%': { transform: 'scaleY(1)' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        marquee: 'marquee 40s linear infinite',
        'marquee-fast': 'marquee 26s linear infinite',
        'pulse-dot': 'pulse-dot 1.6s ease-in-out infinite',
        'play-pulse': 'play-pulse 1.8s cubic-bezier(0.22,1,0.36,1) infinite',
        'wave-bar': 'wave-bar 1s ease-in-out infinite',
        'fade-up': 'fade-up 0.5s cubic-bezier(0.22,1,0.36,1) both',
      },
    },
  },
  plugins: [],
};

export default config;
