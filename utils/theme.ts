// Amber CRT Theme Configuration

export const Colors = {
  // Primary Amber palette
  amber: {
    primary: '#FFB000',
    secondary: '#FF6600',
    dim: '#CC8800',
    bg: '#1A1200',
  },
  // CRT effects
  crt: {
    scanline: 'rgba(255, 176, 0, 0.03)',
    glow: 'rgba(255, 176, 0, 0.3)',
    vignette: 'rgba(0, 0, 0, 0.4)',
  },
  // Status colors
  status: {
    success: '#00FF00',
    warning: '#FFB000',
    error: '#FF0000',
    info: '#00BFFF',
  },
  // Neutral
  black: '#000000',
  white: '#FFFFFF',
  gray: {
    100: '#1A1A1A',
    200: '#333333',
    300: '#4D4D4D',
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
  },
  family: {
    mono: 'Courier New', // Fallback, will use custom font
    terminal: 'VT323',   // Asset font
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
