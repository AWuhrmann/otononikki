/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {},
    fontFamily: {
      'sans': ['ui-sans-serif', 'system-ui',],
      'serif': ['ui-serif', 'Georgia'],
      'mono': ['SFMono-Regular'],
      'courier': ['Courier'],
      'display': ['Oswald'],
      'body': ['"Open Sans"'],
    },
  },
  plugins: [require('@tailwindcss/typography')],
}

