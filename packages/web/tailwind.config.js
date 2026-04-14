/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
      },
      colors: {
        theme: {
          bg: 'var(--color-bg)',
          surface: 'var(--color-surface)',
          border: 'var(--color-border)',
          text: 'var(--color-text)',
          'text-muted': 'var(--color-text-muted)',
          accent: 'var(--color-accent)',
          'accent-secondary': 'var(--color-accent-secondary)',
          success: 'var(--color-success)',
          warning: 'var(--color-warning)',
          danger: 'var(--color-danger)',
        },
        rarity: {
          common: 'var(--color-rarity-common)',
          uncommon: 'var(--color-rarity-uncommon)',
          rare: 'var(--color-rarity-rare)',
          legendary: 'var(--color-rarity-legendary)',
          mythic: 'var(--color-rarity-mythic)',
        },
      },
      fontSize: {
        'pixel-xs': ['7px', { lineHeight: '1.4' }],
        'pixel-sm': ['9px', { lineHeight: '1.4' }],
        'pixel-base': ['11px', { lineHeight: '1.5' }],
        'pixel-lg': ['14px', { lineHeight: '1.4' }],
        'pixel-xl': ['18px', { lineHeight: '1.3' }],
        'pixel-2xl': ['24px', { lineHeight: '1.2' }],
      },
    },
  },
  plugins: [],
};
