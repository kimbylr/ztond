import type { Config } from 'tailwindcss';

export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      primary: {
        DEFAULT: '#69a6ce',
        100: '#d2e4f0',
      },
      white: '#fff',
      black: '#000',
      highlight: '#D85A75',
      gray: {
        50: '#fbfbfb',
        100: '#f8f8f8',
        200: '#e3e3e3',
        300: '#ccc',
        500: '#999',
        600: '#666',
        700: '#555',
        900: '#333',
      },
    },
    fontSize: {
      sm: '0.75rem',
      base: '1rem',
      lg: '1.25rem',
      xl: '1.5rem',
    },
  },
  plugins: [],
} satisfies Config;
