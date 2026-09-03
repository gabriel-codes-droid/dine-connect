/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ── Pure orange brand ──────────────────────────────────────────
        primary: {
          DEFAULT: '#D96815',   // toned orange — main brand accent
          light:   '#FDBA74',   // orange-300  — light accent / active tints
          dark:    '#BF5B12',   // toned orange — hover / pressed
          50:      '#FFF7ED',   // orange-50   — subtle bg tint (light mode)
          100:     '#FFEDD5',   // orange-100
          200:     '#FED7AA',   // orange-200
          300:     '#FDBA74',   // orange-300
          400:     '#FB923C',   // orange-400
          500:     '#F97316',   // orange-500
          600:     '#EA580C',   // orange-600
          700:     '#C2410C',   // orange-700
          800:     '#9A3412',   // orange-800
          900:     '#7C2D12',   // orange-900
          950:     '#431407',   // orange-950
        },

        // ── Light mode surface tokens ─────────────────────────────────
        'bg-light': '#FFFFFF',
        ivory:      '#FFFFFF',
        'text-main': '#111827',   // gray-900
        'text-muted': '#6B7280',  // gray-500
        border:     '#E5E7EB',    // gray-200

        // ── Dark mode — pure near-black, no warm mud ──────────────────
        dark: {
          bg:      '#050505',   // near-black background
          surface: '#0A0A0A',   // cards/panels
          card:    '#111111',   // elevated surfaces
          border:  '#1F1F1F',   // subtle dark borders
          text:    '#FFFFFF',   // pure white text
          muted:   '#A3A3A3',   // gray-400 muted
        },

        // ── Semantic colours (kept minimal) ───────────────────────────
        success: {
          DEFAULT:  '#16A34A',  // green-600
          light:    '#F0FDF4',  // green-50
          dark:     '#166534',  // green-800
        },
        danger: {
          DEFAULT:  '#DC2626',  // red-600
          light:    '#FEF2F2',  // red-50
          dark:     '#991B1B',  // red-800
        },
        warning: {
          DEFAULT:  '#D97706',  // amber-600
          light:    '#FFFBEB',  // amber-50
          dark:     '#92400E',  // amber-800
        },
      },

      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },

      boxShadow: {
        soft:     '0 1px 2px 0 rgb(0 0 0 / 0.04)',
        card:     '0 4px 12px -8px rgb(0 0 0 / 0.25)',
        elevated: '0 16px 36px -18px rgb(0 0 0 / 0.40)',
        glass:    '0 8px 24px 0 rgba(0, 0, 0, 0.08)',
      },

      animation: {
        'fade-in':  'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
      },

      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%':   { opacity: '0', transform: 'translateX(-8px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },

      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #EA580C 0%, #F97316 100%)',
        'gradient-glass':   'linear-gradient(135deg, rgba(234,88,12,0.08) 0%, rgba(234,88,12,0.03) 100%)',
      },
    },
  },
  plugins: [],
}
