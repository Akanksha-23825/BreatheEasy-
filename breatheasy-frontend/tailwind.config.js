/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#00685f',
          hover: '#005049',
          container: '#008378',
        },
        secondary: {
          DEFAULT: '#0051d5',
          container: '#316bf3',
        },
      },
    },
  },
  plugins: [],
}
