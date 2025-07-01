/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,js,jsx,ts,tsx}",  // Add JSX, TSX to the file types
    "./public/index.html",  // Include the HTML if necessary
    "./node_modules/flowbite/**/*.js",
  ],
  theme: {
    extend: {
      zIndex: {
        '-10': '-10',
      }
    }
  },
  plugins: [
    require('flowbite')
  ],
}