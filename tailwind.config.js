/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        paper: {
          50: '#FBF7F0',
          100: '#F5F0E6',
          200: '#EDE4D3',
          300: '#E0D3B8',
          400: '#C9B89A',
          500: '#A89070',
          600: '#8B7355',
        },
        ink: {
          50: '#F5EFE6',
          100: '#7A6350',
          200: '#5A4432',
          300: '#3D2914',
          400: '#2B1D0E',
          500: '#1A1208',
        },
        wax: {
          400: '#D45A4A',
          500: '#B5493B',
          600: '#923B30',
        },
        sage: {
          400: '#7A9A7A',
          500: '#5A7A5A',
          600: '#465F46',
        },
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        hand: ['"Ma Shan Zheng"', '"Caveat"', 'cursive'],
      },
      boxShadow: {
        'paper': '0 1px 2px rgba(61, 41, 20, 0.08), 0 8px 24px rgba(61, 41, 20, 0.12), 0 20px 60px rgba(61, 41, 20, 0.10)',
        'paper-hover': '0 2px 4px rgba(61, 41, 20, 0.10), 0 14px 36px rgba(61, 41, 20, 0.16), 0 32px 80px rgba(61, 41, 20, 0.14)',
        'card': '0 1px 3px rgba(61, 41, 20, 0.06), 0 4px 12px rgba(61, 41, 20, 0.06)',
      },
      backgroundImage: {
        'paper-noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.35'/%3E%3C/svg%3E\")",
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'shake': 'shake 0.4s ease-in-out',
        'stamp': 'stamp 0.35s cubic-bezier(.2,.9,.3,1.3)',
        'fade-in': 'fadeIn 0.6s ease-out',
        'fade-in-up': 'fadeInUp 0.7s cubic-bezier(.2,.8,.2,1)',
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        shake: {
          '0%,100%': { transform: 'translateX(0) rotate(0)' },
          '25%': { transform: 'translateX(-4px) rotate(-0.5deg)' },
          '75%': { transform: 'translateX(4px) rotate(0.5deg)' },
        },
        stamp: {
          '0%': { transform: 'scale(2.2) rotate(-18deg)', opacity: '0' },
          '60%': { transform: 'scale(0.92) rotate(-4deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(-6deg)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
