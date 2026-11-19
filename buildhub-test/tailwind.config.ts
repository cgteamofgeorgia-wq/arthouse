import type { Config } from 'tailwindcss';

/**
 * Tailwind-ის კონფიგურაცია.
 * ინტერფეისის სტილი ძირითადად src/app/globals.css-შია, ამიტომ Tailwind
 * გამოიყენება დამხმარე კლასებისთვის (grid, flex, responsive).
 */
const config: Config = {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        accent: '#f0a02a',
      },
    },
  },
  plugins: [],
};

export default config;
