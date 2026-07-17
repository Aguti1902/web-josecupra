/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        depro: {
          blue: '#0A36F7',
          'blue-dark': '#0828C4',
          'blue-light': '#EEF1FF',
          red: '#FB2C39',
          'red-light': '#FEE8EA',
          yellow: '#F6CC12',
          'yellow-light': '#FEFAE7',
          green: '#3BC21D',
          'green-light': '#EAF9E6',
          white: '#FBFBFB',
          dark: '#333333',
          gray: '#6B7280',
          'gray-light': '#F5F5F5',
          border: '#E5E7EB',
        },
        holded: {
          dark: '#0a0e17',
          'dark-2': '#0f172a',
          card: '#141b2d',
          topbar: '#1864db',
          blue: '#2563eb',
          'blue-light': '#3b82f6',
          muted: '#94a3b8',
          'muted-dark': '#64748b',
          green: '#22c55e',
          border: '#1e293b',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-in-left': 'slideInLeft 0.5s ease-out',
        'bounce-slow': 'bounce 2s infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      boxShadow: {
        'depro': '0 4px 24px rgba(10, 54, 247, 0.12)',
        'depro-lg': '0 8px 40px rgba(10, 54, 247, 0.18)',
        'card': '0 2px 16px rgba(51, 51, 51, 0.08)',
        'card-hover': '0 8px 32px rgba(51, 51, 51, 0.12)',
      },
    },
  },
  plugins: [],
}
