/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        // ── Shadcn/ui CSS-var tokens (kept for component compatibility) ────
        border:      'hsl(var(--border))',
        input:       'hsl(var(--input))',
        ring:        'hsl(var(--ring))',
        background:  'hsl(var(--background))',
        foreground:  'hsl(var(--foreground))',
        primary: {
          DEFAULT:    'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT:    'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT:    'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT:    'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT:    'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT:    'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT:    'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // ── PronosBox Brand Palette ──────────────────────────────────────
        brand: {
          // Backgrounds (dark-navy scale)
          navy:          '#0B0F1A', // Body
          'navy-2':      '#151B2C', // Sections / glass base
          'navy-3':      '#1E293B', // Cards
          slate:         '#334155', // Borders
          // Accents
          green:         '#22C55E', // Primary action / success / money
          'green-dark':  '#16A34A',
          'green-dim':   'rgba(34,197,94,0.15)',
          gold:          '#F59E0B', // Pro / Premium
          'gold-dark':   '#D97706',
          'gold-dim':    'rgba(245,158,11,0.15)',
          red:           '#EF4444', // Live / danger
          // Text scale
          'text-1':      '#F8FAFC', // Primary
          'text-2':      '#94A3B8', // Secondary
          'text-3':      '#64748B', // Muted
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      backdropBlur: {
        xs: '4px',
      },
      keyframes: {
        'caret-blink': {
          '0%,70%,100%': { opacity: '1' },
          '20%,50%':     { opacity: '0' },
        },
        'accordion-down': {
          from: { height: '0' },
          to:   { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to:   { height: '0' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up':   'accordion-up 0.2s ease-out',
        'caret-blink':    'caret-blink 1.25s ease-out infinite',
        'fade-in':        'fade-in 0.3s ease-out',
        'slide-up':       'slide-up 0.35s ease-out',
      },
    },
  },
};