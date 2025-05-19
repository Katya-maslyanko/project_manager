import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: "class", 
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        while: "#FFFFFF",
        gray: {
          100: '#E6E6EB',
          200: '#E5E7EB',
          300: '#A5A5A5',
          500: '#848484',
          800: '#333333',
        },
        blue: {
          200: '#00A3E9',
          400: '#0078D7',
          500: '#1E324F',
        },
        "dark-bg": "#1e2229",
        "dark-border": "#343a46",
        "dark-text": "#e5e7eb",
        "dark-hover": "#2c323b",
        "dark-accent": "#3b82f6",
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
export default config