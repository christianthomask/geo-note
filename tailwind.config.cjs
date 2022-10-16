/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      transitionTimingFunction: {
        'springy': 'cubic-bezier(0.225, 1.650, 0.460, 0.925)'
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
