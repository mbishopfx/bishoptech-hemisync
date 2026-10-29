/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './lib/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--color-background)',
        foreground: 'var(--color-foreground)',
        primary: 'var(--color-primary)',
        'on-primary': 'var(--color-on-primary)',
        secondary: 'var(--color-secondary)',
        accent: 'var(--color-accent)',
        muted: 'var(--color-muted)',
        border: 'var(--color-border)',
        destructive: 'var(--color-destructive)',
        ring: 'var(--color-ring)',
        stone: {
          850: '#1f1a17',
          900: '#181412',
          950: '#0f0c0a',
        },
        gold: {
          400: '#d4af37',
          500: '#c5a028',
          600: '#b59019',
        }
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        sans: ['var(--font-sans)', 'sans-serif'],
      },
      boxShadow: {
        premium: 'var(--shadow-premium)',
        'premium-hover': 'var(--shadow-premium-hover)',
      }
    }
  },
  plugins: [
    // Tailwind 3.4 introduced `size-*` as a shorthand for `width` + `height`.
    // This project is pinned to 3.3, where the class does not exist, so every
    // `size-N` in the codebase was an unknown token that emitted no CSS — SVGs
    // and icon buttons kept their intrinsic size and stretched their flex
    // containers instead of rendering at the intended square. Emit the same
    // utilities here so the existing markup resolves without a major upgrade.
    function ({ addUtilities, theme, matchUtilities }) {
      const spacing = theme('spacing');
      const square = {};
      Object.entries(spacing).forEach(([key, value]) => {
        square[`.size-${key}`] = { width: value, height: value };
      });
      addUtilities(square);

      matchUtilities(
        { size: (value) => ({ width: value, height: value }) },
        { values: spacing }
      );
    }
  ]
};
