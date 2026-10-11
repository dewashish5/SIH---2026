/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#000000',
          900: '#111827',
          800: '#1F2937',
          700: '#374151',
          400: '#9CA3AF',
          200: '#E5E7EB',
          100: '#F3F4F6',
          50: '#F9FAFB'
        },
        risk: {
          critical: '#DC2626',   // ▲▲ Critical Shortage (Red)
          shortage: '#F97316',   // ▲ Shortage (Orange)
          balanced: '#E2E8F0',   // = Balanced (Grey)
          oversupply: '#60A5FA', // ▼ Oversupply (Light Blue)
          saturation: '#1E40AF'  // ▼▼ Saturation (Dark Navy)
        },
        badge: {
          demo: '#FACC15',
          official: '#2563EB',
        }
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        sans: ['Inter', 'Noto Sans Devanagari', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        'ink': '2px 2px 0px 0px #000000',
        'ink-lg': '4px 4px 0px 0px #000000',
        'ink-sm': '1px 1px 0px 0px #000000'
      }
    },
  },
  plugins: [],
}
