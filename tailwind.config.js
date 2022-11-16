const production = !process.env.ROLLUP_WATCH;
module.exports = {
  content: [
    './src/**/*.svelte'
  ],
  theme: {},
  plugins: [],
}