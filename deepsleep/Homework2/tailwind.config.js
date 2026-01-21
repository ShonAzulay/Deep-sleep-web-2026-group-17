/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Heebo', 'Assistant', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
