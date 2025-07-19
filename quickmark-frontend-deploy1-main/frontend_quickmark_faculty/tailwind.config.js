/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Scan all React component files for Tailwind classes
  ],
  theme: {
    extend: {
      // Extend the default Tailwind theme here
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Set Inter as the default sans-serif font
      },
      colors: {
        // Define custom colors based on your design screenshots
        'primary': {
          DEFAULT: '#3b82f6', // A nice blue for buttons and highlights
          'light': '#60a5fa',
          'dark': '#2563eb',
        },
        'secondary': '#f4f4f5', // Light gray background
        'text-primary': '#18181b', // Dark text color
        'text-secondary': '#71717a', // Lighter text for subheadings
        'danger': {
          DEFAULT: '#ef4444', // Red for stop buttons and low attendance
          'light': '#f87171',
        },
        'success': {
            DEFAULT: '#22c55e', // Green for success states
        },
        'border-color': '#e4e4e7',
      },
    },
  },
  plugins: [],
}
