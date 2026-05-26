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
      bg: '#0b1225',
      border: '#14203b',
      text: '#94a3b8',
      textActive: '#eff6ff',
      hover: '#111d37',
      active: '#111b34',
      accent: '#8b5cf6',
      card: '#111a32'
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
      success: { bg: '#ecfdf5', text: '#0f766e', border: '#a7f3d0' },
      warning: { bg: '#fef3c7', text: '#b45309', border: '#fde68a' },
      error: { bg: '#fee2e2', text: '#b91c1c', border: '#fecaca' },
      info: { bg: '#eef2ff', text: '#4338ca', border: '#c7d2fe' }
    }
  },
  spacing: [0, 4, 8, 12, 16, 20, 24, 32, 40, 48],
  radius: { none: 0, sm: 6, md: 10, lg: 14, xl: 18, pill: 999 },
  border: { subtle: '#e4e4e7', strong: '#d4d4d8', focus: '#704fe8' },
  elevation: { 0: 0, 1: 1, 2: 2, 3: 4, 4: 8 },
  layout: {
    sidebarWidth: 240,
    contentPadding: 24,
    gridGap: 18
  },
  shadow: {
    card: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
    modal: '0 20px 50px rgba(0,0,0,0.15)'
  },
  typography: {
    families: {
      sans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      mono: 'ui-monospace, SFMono-Regular, Menlo, monospace'
    },
    sizes: { xs: 11, sm: 13, md: 15, lg: 17, xl: 20, '2xl': 24, '3xl': 28 },
    weights: { regular: '400' as const, medium: '500' as const, semibold: '600' as const, bold: '700' as const }
  }
} as const

export type OdysseyTokens = typeof tokens
