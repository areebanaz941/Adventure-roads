/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'map-blue': '#4B8BF4',
        'adventure-blue': '#436485',
        'brown': {
          500: '#8B4513'
        },
        'road': {
          'sealed': '#808080',      // Grey for Sealed Road
          'gravel': '#F59E0B',      // Amber for Gravel/Dirt Road
          'track': '#8B4513',       // Brown for Track/Trail
          'sand': '#FDE047',        // Yellow for Sand
          'undefined': '#D9F99D'    // Light lime for Not Yet Defined
        },
        'poi': {
          'accommodation': '#F97316', // Orange for Accommodation/Pub
          'fuel': '#000000',         // Black for Fuel
          'danger': '#EF4444',       // Red for Danger/Hazard
          'camping': '#3B82F6'       // Blue for Camping
        }
      },
      fontFamily: {
        sans: ['Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}