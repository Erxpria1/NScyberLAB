// Amber CRT Theme Configuration

export const Colors = {
  // Primary Amber palette (improved for better readability)
  amber: {
    primary: '#FFB800',   // Brighter amber for primary text
    secondary: '#FF8800', // Warmer orange for accents
    dim: '#DD9900',       // More visible dim color
    bg: '#1A1500',        // Richer amber-tinted background
    glow: '#FFD700',      // Pure gold glow effect
  },
  // CRT effects
  crt: {
    scanline: 'rgba(255, 176, 0, 0.04)', // Slightly more visible
    glow: 'rgba(255, 176, 0, 0.3)',
    vignette: 'rgba(0, 0, 0, 0.4)',
  },
  // Engineering/Math colors (for formulas and diagrams)
  engineering: {
    shear: '#FFB000',     // Shear force - Amber
    moment: '#00BFFF',    // Bending moment - Cyan
    reaction: '#00FF00',  // Reaction force - Green
    stress: '#FF6600',    // Stress - Orange
    deflection: '#FF00FF',// Deflection - Magenta
    load: '#FFFF00',      // Applied load - Yellow
  },
  // Status colors (improved contrast)
  status: {
    success: '#00FF88',   // Brighter green
    warning: '#FFAA00',   // Clearer warning
    error: '#FF4444',     // Softer but visible red
    info: '#00CCFF',      // Clearer info blue
  },
  // Neutral
  black: '#000000',
  white: '#FFFFFF',
  gray: {
    50: '#0D0D0D',
    100: '#1A1A1A',
    150: '#262626',
    200: '#333333',
    300: '#4D4D4D',
    400: '#666666',
    500: '#808080',
  },
} as const;

export const Typography = {
  sizes: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 18,
    xl: 24,
    xxl: 32,
    // New specialized sizes
    label: 11,      // Form labels
    equation: 14,   // Math equations
    caption: 9,     // Small captions
  },
  family: {
    mono: 'Courier New', // Fallback, will use custom font
    terminal: 'VT323',   // Asset font
    math: 'Latin Modern Math', // KaTeX fallback
  },
  weight: {
    normal: '400' as const,
    medium: '500' as const,
    bold: '700' as const,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.8,
  },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const Animations = {
  cursor: {
    duration: 500,
  },
  scanline: {
    duration: 8000,
  },
  boot: {
    duration: 4000,
  },
  typing: {
    charDelay: 30,
  },
  controlTower: {
    expand: 300,
    buttonPress: 100,
  },
} as const;

export const ControlTowerStyles = {
  container: {
    backgroundColor: Colors.gray[100],
    borderTopColor: Colors.amber.dim,
  },
  button: {
    backgroundColor: Colors.black,
    borderColor: Colors.amber.primary,
    borderWidth: 1,
  },
  buttonActive: {
    backgroundColor: Colors.amber.dim,
  },
} as const;
