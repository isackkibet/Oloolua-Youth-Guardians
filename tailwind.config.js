/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/frontend/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f2f6f2',
          100: '#e3ebe2',
          200: '#c7d7c5',
          300: '#a5b89a',
          400: '#7d9a76',
          500: '#557a55',
          600: '#3d6144',
          700: '#285b3c',
          800: '#1f4731',
          900: '#173d2b',
          950: '#0f2a1d',
        },
        sage: '#a5b89a',
        ivory: '#f7f6f0',
        charcoal: '#252b27',
        gold: {
          300: '#d9c49a',
          400: '#c3a66b',
          500: '#ad8f55',
          600: '#8d7242',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'Cambria', 'serif'],
        heading: ['var(--font-heading)', 'var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      maxWidth: {
        '8xl': '90rem',
      },
      letterSpacing: {
        widest: '0.22em',
      },
    },
  },
  plugins: [],
};
