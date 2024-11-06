import daisyui from "daisyui";

export default {
  content: [
    './src/**/*.{ts,tsx}',
  ],
  daisyui: {
    themes: [
      'dracula',
      'light',
    ],
  },
  plugins: [
    daisyui,
  ],
};
