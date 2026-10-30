const color = name => `oklch(var(--${name}) / <alpha-value>)`

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: color('background'), foreground: color('foreground'),
        primary: { DEFAULT: color('primary'), foreground: color('primary-foreground') },
        accent: { DEFAULT: color('accent'), foreground: color('foreground') },
        muted: { DEFAULT: color('muted'), foreground: color('muted-foreground') },
        card: { DEFAULT: color('card'), foreground: color('foreground') },
        success: color('success'), warning: color('warning'),
        destructive: color('destructive'), info: color('info'),
        border: color('border'), ring: color('primary'),
        // Keep existing screens on the shared Lovable palette.
        creme: color('background'), navy: color('primary'),
        ardosia: color('muted-foreground'), borda: color('border'),
      },
      borderRadius: { lg: 'var(--radius)', xl: 'calc(var(--radius) + 4px)' },
      fontFamily: {
        sans: ['Figtree', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
}
