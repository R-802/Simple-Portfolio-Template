/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // or 'media' or false for no dark mode support
  content: [
    './src/**/*.{js,ts,jsx,tsx}', // Include all files in src directory
    './pages/**/*.{js,ts,jsx,tsx}', // If using a pages directory
    './components/**/*.{js,ts,jsx,tsx}', // If using a components directory
  ],
  theme: {
    extend: {},
  },
  plugins: [require('@tailwindcss/typography'),],
}
