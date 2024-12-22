// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export const content = [
  "./src/**/*.{js,jsx,ts,tsx}", // Adjust paths if necessary
];
export const theme = {
  extend: {
    fontFamily: {
      pacifico: ["Pacifico", "cursive"],
      poppins: ["Poppins", "sans-serif"],
    },
  },
};
export const plugins = [];
