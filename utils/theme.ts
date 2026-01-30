// Amber CRT Theme Configuration

// Dark Mode Optimized Colors (OLED-friendly, prevents halation)
const DARK_MODE = {
  primaryText: '#E1E1E1',    // Standard IDE Light Text
  secondaryText: '#909090',  // Muted Label
  tertiaryText: '#626262',   // Metadata Gray
  disabledText: '#4B4B4B',   // Disabled
  background: '#1E1F22',     // IntelliJ New UI Background
  elevated: '#2B2D30',       // IntelliJ Tool Window Background
  border: '#393B40',         // IDE Border Color
  selection: '#2E436E',      // Active Selection Blue
};

export const Colors = {
  // IDE-inspired colors
  ide: {
    bg: '#1E1F22',
    toolWindow: '#2B2D30',
    border: '#393B40',
    header: '#2B2D30',
    selection: '#2E436E',
    accent: '#3574F0', // IntelliJ Blue
    mint: '#B7D9C4',   // JEDI Mint
    yellow: '#FEC233', // JEDI Yellow
    pink: '#FFB8E0',   // JEDI Pink
  },
  // Premium iOS-inspired colors
  system: {
    blue: '#0A84FF',
    green: '#30D158',
    indigo: '#5E5CE6',
    orange: '#FF9F0A',
    pink: '#FF375F',
    purple: '#BF5AF2',
    red: '#FF453A',
    teal: '#64D2FF',
    yellow: '#FFD60A',
    gray: '#8E8E93',
  },
  // Primary Amber palette (improved for better readability)
  amber: {
    primary: '#FFB800',   // Brighter amber for primary text
    secondary: '#FF8800', // Warmer orange for accents
    dim: '#DD9900',       // More visible dim color
    bg: '#1A1500',        // Richer amber-tinted background
    glow: '#FFD700',      // Pure gold glow effect
  },
  // Retro Arcade / Pixel Art palette
  retro: {
    bg: '#1a1c2c',        // Game Boy dark
    primary: '#ff0044',    // Arcade red
    secondary: '#00cc00',  // Game Boy green
    accent: '#ffcc00',     // Coin gold
    text: '#f4f4f4',       // Pixel white
    dark: '#0d0e15',       // Deep black
    purple: '#7b2cff',     // Retro purple
    cyan: '#00d9ff',       // Arcade cyan
    pink: '#ff6b9d',       // Bubblegum pink
    orange: '#ff8800',     // Sunset orange
    blue: '#2e5aff',       // Arcade blue
    gray: '#5c6273',       // Pixel gray
    lightGray: '#8b9bb4',  // Pixel light gray
    // Bar colors
    barLoad: '#ff6b35',    // Load capacity bar
    barXP: '#00e436',      // XP progress bar
    barBattery: '#ffd60a', // Battery bar
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
  // Dark Mode optimized
  darkMode: DARK_MODE,
  // Neutral
  black: '#000000',
  white: '#FFFFFF',
  gray: {
    50: '#000000',
    100: '#1C1C1E',
    150: '#2C2C2E',
    200: '#3A3A3C',
    300: '#48484A',
    400: '#636366',
    500: '#8E8E93',
    600: '#AEAEB2',
    700: '#C7C7CC',
    800: '#D1D1D6',
    900: '#E5E5EA',
    950: '#F2F2F7',
  } as const,
} as const;

export const Typography = {
  sizes: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 18,
    xl: 24,
    xxl: 32,
    // UI Standard sizes (2025-2026)
    uiLabel: 12,       // UI labels (was 10-12)
    uiBody: 14,        // UI body text
    uiNav: 15,         // Navigation text
    metadata: 12,      // Metadata/caption (was 11)
    documentTitle: 16, // Document titles (was 14)
    // Specialized sizes
    label: 11,         // Form labels
    equation: 14,      // Math equations
    caption: 9,        // Small captions
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
    // Improved readability (2025-2026)
    readable: 1.6,     // Better for body text
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

export const Effects = {
  glass: {
    backgroundColor: 'rgba(28, 28, 30, 0.7)',
  },
  shadow: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    glow: {
      shadowColor: Colors.amber.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 10,
    },
  },
  shadows: {
    soft: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    hard: {
      shadowColor: '#000000',
      shadowOffset: { width: 4, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 0, // Elevation doesn't support hard offset shadows well on Android without separate views
    },
  },
} as const;

export const Shapes = {
  borderRadius: {
    xs: 2,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 20,
    full: 9999,
  },
  borderWidth: {
    thin: 1,
    brutal: 2,
  },
} as const;
