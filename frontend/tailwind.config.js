/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base: '#0a0d12',
        panel: '#11151c',
        panel2: '#161b24',
        line: '#212733',
        muted: '#8a93a6',
        accent: '#3b82f6',
        cyan: '#22d3ee',
        good: '#34d399',
        warn: '#f5a623',
        danger: '#ef5350',
        violet: '#a78bfa',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        panel: '0 1px 0 0 rgba(255,255,255,0.02) inset, 0 8px 24px -12px rgba(0,0,0,0.6)',
      },
      borderRadius: {
        xl2: '14px',
      },
    },
  },
  plugins: [],
}
