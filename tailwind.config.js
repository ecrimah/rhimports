/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./{app,components,libs,pages,hooks}/**/*.{html,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // RNH Imports — navy blue palette derived from logo (#1B2A6B)
        primary: {
          DEFAULT: '#1B2A6B',   // logo navy — main CTA, buttons, links
          soft:    '#EEF0FB',   // very light navy tint — hover backgrounds, badges
          light:   '#2D3F8A',   // slightly lighter navy — hover states
          dark:    '#0F1A47',   // deep navy — gradients, overlays
        },
        accent: {
          DEFAULT: '#1B2A6B',   // same navy — keeps palette strictly 2-colour
          muted:   '#8B93C4',   // desaturated navy — secondary text, dividers
        },
        surface: {
          DEFAULT: '#FFFFFF',
          subtle:  '#F8F9FF',   // off-white with a hint of navy — card backgrounds
        },
      },
      fontFamily: {
        sans:        ['Outfit', 'sans-serif'],
        serif:       ['"Playfair Display"', 'serif'],
        handwriting: ['Pacifico', 'cursive'],
      },
    },
  },
  plugins: [],
}
