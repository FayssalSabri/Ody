/** Odyssey merchant dashboard design tokens */
export const tokens = {
  colors: {
    brand: {
      50: '#f5f3ff',
      100: '#ede9fe',
      200: '#ddd6fe',
      300: '#c4b5fd',
      400: '#a78bfa',
      500: '#8b5cf6',
      600: '#7c3aed',
      700: '#6d28d9',
      800: '#5b21b6',
      900: '#4c1d95'
    },
    sidebar: {
      bg: '#050b14', // Deeper, more premium dark
      border: '#101a2e',
      text: '#94a3b8',
      textActive: '#ffffff',
      hover: '#0e172a',
      active: '#16233d',
      accent: '#8b5cf6',
      card: '#0a1120'
    },
    canvas: '#f8fafc',
    surface: '#ffffff',
    neutral: {
      0: '#ffffff',
      50: '#f8fafc',
      100: '#e2e8f0',
      200: '#cbd5e1',
      300: '#94a3b8',
      400: '#64748b',
      500: '#475569',
      600: '#334155',
      700: '#27303f',
      800: '#1e293b',
      900: '#0f172a'
    },
    semantic: {
      success: { bg: '#f0fdf4', text: '#166534', border: '#bbf7d0' },
      warning: { bg: '#fffbeb', text: '#b45309', border: '#fde68a' },
      error: { bg: '#fef2f2', text: '#b91c1c', border: '#fecaca' },
      info: { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' }
    }
  },
  spacing: [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64],
  radius: { none: 0, sm: 6, md: 10, lg: 14, xl: 18, pill: 999 },
  border: { subtle: '#e2e8f0', strong: '#cbd5e1', focus: '#8b5cf6' },
  elevation: { 0: 0, 1: 1, 2: 2, 3: 4, 4: 8 },
  layout: {
    sidebarWidth: 260,
    contentPadding: 32,
    gridGap: 24
  },
  shadow: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    card: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
    md: '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.08)',
    modal: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    focus: '0 0 0 3px rgba(139, 92, 246, 0.3)'
  },
  typography: {
    families: {
      sans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
    },
    sizes: { xs: 12, sm: 14, md: 16, lg: 18, xl: 20, '2xl': 24, '3xl': 30 },
    weights: { regular: '400' as const, medium: '500' as const, semibold: '600' as const, bold: '700' as const }
  },
  animation: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    normal: '250ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '350ms cubic-bezier(0.4, 0, 0.2, 1)'
  }
} as const

export type OdysseyTokens = typeof tokens
