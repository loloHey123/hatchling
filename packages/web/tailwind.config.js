/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
      },
      colors: {
        'pixel-bg': '#fefcd0',
        'pixel-bg-dark': '#e8e4b0',
        'pixel-border': '#333',
        'pixel-common': '#a8a878',
        'pixel-uncommon': '#78c850',
        'pixel-rare': '#6890f0',
        'pixel-legendary': '#f8d030',
        'pixel-mythic': '#f85888',
      },
    },
  },
  plugins: [],
};
