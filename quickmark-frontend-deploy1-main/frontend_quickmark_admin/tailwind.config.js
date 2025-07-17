/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#3B82F6', // Blue-500
        'primary-dark': '#2563EB', // Blue-600
        'text-primary': '#1F2937', // Gray-800
        'text-secondary': '#6B7280', // Gray-500
        'border-color': '#D1D5DB', // Gray-300
      },
       fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
