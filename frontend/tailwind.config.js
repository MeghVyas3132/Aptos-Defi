/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-body': '#050505',
        'bg-panel': '#0E0E10',
        'border-color': '#1F2937',
        'aptos-blue': '#0A98F7',
        'text-primary': '#E5E7EB',
        'text-secondary': '#9CA3AF',
        'success': '#10B981',
        'danger': '#EF4444',
        'warning': '#F59E0B',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
