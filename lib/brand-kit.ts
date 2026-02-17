/**
 * The Pickleball Passport - Official Brand Kit
 *
 * This file contains the official brand colors, typography, and design tokens
 * for The Pickleball Passport brand. These values should be used consistently
 * across the website and mobile application.
 *
 * Brand Kit designed by: inahsempire.social
 * Last updated: 2026-02-05
 */

// =============================================================================
// COLOR PALETTE
// =============================================================================

export const brandColors = {
  // Primary Colors
  gold: {
    DEFAULT: '#B08D55',
    50: '#F7F3EC',
    100: '#EFE7D9',
    200: '#DFCFB3',
    300: '#CFB78D',
    400: '#BFA267',
    500: '#B08D55',
    600: '#8D7144',
    700: '#6A5533',
    800: '#463822',
    900: '#231C11',
  },

  navy: {
    DEFAULT: '#1D2D44',
    50: '#E8EBF0',
    100: '#D1D7E1',
    200: '#A3AFC3',
    300: '#7587A5',
    400: '#495F87',
    500: '#1D2D44',
    600: '#172436',
    700: '#111B29',
    800: '#0B121B',
    900: '#06090E',
  },

  rust: {
    DEFAULT: '#9C5238',
    50: '#F5EBE8',
    100: '#EBD7D1',
    200: '#D7AFA3',
    300: '#C38775',
    400: '#AF6047',
    500: '#9C5238',
    600: '#7D422D',
    700: '#5E3122',
    800: '#3E2116',
    900: '#1F100B',
  },

  cream: {
    DEFAULT: '#F2EAD3',
    50: '#FDFCF8',
    100: '#FBF9F1',
    200: '#F7F3E3',
    300: '#F2EAD3',
    400: '#E8DDB8',
    500: '#DED09D',
    600: '#D4C382',
    700: '#C4AD5C',
    800: '#A08940',
    900: '#6B5C2B',
  },
} as const;

// Semantic color assignments
export const semanticColors = {
  // Brand identity
  primary: brandColors.gold.DEFAULT,
  secondary: brandColors.navy.DEFAULT,
  accent: brandColors.rust.DEFAULT,
  background: brandColors.cream.DEFAULT,

  // UI States
  success: '#2D5A3D', // Palm green (retained from previous)
  warning: brandColors.rust.DEFAULT,
  error: '#DC3545',
  info: brandColors.navy[400],

  // Text colors
  text: {
    primary: brandColors.navy.DEFAULT,
    secondary: brandColors.navy[400],
    muted: brandColors.navy[300],
    inverse: brandColors.cream.DEFAULT,
    accent: brandColors.gold.DEFAULT,
  },

  // Surface colors
  surface: {
    primary: '#FFFFFF',
    secondary: brandColors.cream[50],
    elevated: '#FFFFFF',
    overlay: 'rgba(29, 45, 68, 0.5)', // Navy with opacity
  },

  // Border colors
  border: {
    default: brandColors.cream[400],
    subtle: brandColors.cream[200],
    strong: brandColors.navy[200],
    accent: brandColors.gold.DEFAULT,
  },
} as const;

// =============================================================================
// TYPOGRAPHY
// =============================================================================

export const typography = {
  // Font families
  fonts: {
    heading: '"Proxima Nova", "Nunito Sans", "Inter", system-ui, sans-serif',
    body: '"Montserrat", "Open Sans", system-ui, sans-serif',
    mono: '"JetBrains Mono", "Fira Code", monospace',
  },

  // Font weights
  weights: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },

  // Type scale (in rem)
  sizes: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
    '6xl': '3.75rem', // 60px
    '7xl': '4.5rem',  // 72px
  },

  // Line heights
  lineHeights: {
    tight: 1.1,
    snug: 1.25,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },

  // Letter spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
} as const;

// Typography presets for common use cases
export const typographyPresets = {
  // Headings - Proxima Nova (or fallback)
  h1: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes['5xl'],
    fontWeight: typography.weights.bold,
    lineHeight: typography.lineHeights.tight,
    letterSpacing: typography.letterSpacing.tight,
    color: semanticColors.text.primary,
  },
  h2: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes['4xl'],
    fontWeight: typography.weights.bold,
    lineHeight: typography.lineHeights.tight,
    letterSpacing: typography.letterSpacing.tight,
    color: semanticColors.text.primary,
  },
  h3: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.semibold,
    lineHeight: typography.lineHeights.snug,
    color: semanticColors.text.primary,
  },
  h4: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.semibold,
    lineHeight: typography.lineHeights.snug,
    color: semanticColors.text.primary,
  },
  h5: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold,
    lineHeight: typography.lineHeights.normal,
    color: semanticColors.text.primary,
  },
  h6: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    lineHeight: typography.lineHeights.normal,
    color: semanticColors.text.primary,
  },

  // Subheadings
  subheading: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.medium,
    lineHeight: typography.lineHeights.normal,
    color: semanticColors.text.secondary,
  },

  // Body text - Montserrat
  body: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.regular,
    lineHeight: typography.lineHeights.relaxed,
    color: semanticColors.text.primary,
  },
  bodyLarge: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.regular,
    lineHeight: typography.lineHeights.relaxed,
    color: semanticColors.text.primary,
  },
  bodySmall: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.regular,
    lineHeight: typography.lineHeights.normal,
    color: semanticColors.text.secondary,
  },

  // UI Elements
  button: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    lineHeight: typography.lineHeights.normal,
    letterSpacing: typography.letterSpacing.wide,
    textTransform: 'uppercase' as const,
  },
  label: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    lineHeight: typography.lineHeights.normal,
  },
  caption: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.regular,
    lineHeight: typography.lineHeights.normal,
    color: semanticColors.text.muted,
  },
} as const;

// =============================================================================
// SPACING & LAYOUT
// =============================================================================

export const spacing = {
  px: '1px',
  0: '0',
  0.5: '0.125rem',
  1: '0.25rem',
  1.5: '0.375rem',
  2: '0.5rem',
  2.5: '0.625rem',
  3: '0.75rem',
  3.5: '0.875rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  7: '1.75rem',
  8: '2rem',
  9: '2.25rem',
  10: '2.5rem',
  11: '2.75rem',
  12: '3rem',
  14: '3.5rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  28: '7rem',
  32: '8rem',
  36: '9rem',
  40: '10rem',
  44: '11rem',
  48: '12rem',
  52: '13rem',
  56: '14rem',
  60: '15rem',
  64: '16rem',
  72: '18rem',
  80: '20rem',
  96: '24rem',
} as const;

export const borderRadius = {
  none: '0',
  sm: '0.25rem',
  DEFAULT: '0.5rem',
  md: '0.625rem',
  lg: '0.75rem',
  xl: '1rem',
  '2xl': '1.5rem',
  '3xl': '2rem',
  full: '9999px',
} as const;

// =============================================================================
// SHADOWS & EFFECTS
// =============================================================================

export const shadows = {
  sm: '0 1px 2px 0 rgba(29, 45, 68, 0.05)',
  DEFAULT: '0 1px 3px 0 rgba(29, 45, 68, 0.1), 0 1px 2px -1px rgba(29, 45, 68, 0.1)',
  md: '0 4px 6px -1px rgba(29, 45, 68, 0.1), 0 2px 4px -2px rgba(29, 45, 68, 0.1)',
  lg: '0 10px 15px -3px rgba(29, 45, 68, 0.1), 0 4px 6px -4px rgba(29, 45, 68, 0.1)',
  xl: '0 20px 25px -5px rgba(29, 45, 68, 0.1), 0 8px 10px -6px rgba(29, 45, 68, 0.1)',
  '2xl': '0 25px 50px -12px rgba(29, 45, 68, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(29, 45, 68, 0.05)',
  none: 'none',

  // Brand-specific shadows
  gold: '0 4px 14px 0 rgba(176, 141, 85, 0.25)',
  goldGlow: '0 0 20px rgba(176, 141, 85, 0.4)',
  card: '0 4px 6px -1px rgba(29, 45, 68, 0.1), 0 2px 4px -1px rgba(29, 45, 68, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
  cardHover: '0 20px 25px -5px rgba(29, 45, 68, 0.15), 0 10px 10px -5px rgba(29, 45, 68, 0.08)',
} as const;

// =============================================================================
// GRADIENTS
// =============================================================================

export const gradients = {
  // Primary brand gradients
  goldShimmer: 'linear-gradient(135deg, #B08D55 0%, #D4AF37 50%, #B08D55 100%)',
  navyDepth: 'linear-gradient(180deg, #1D2D44 0%, #0B121B 100%)',
  rustWarm: 'linear-gradient(135deg, #9C5238 0%, #C38775 100%)',
  creamSoft: 'linear-gradient(180deg, #FDFCF8 0%, #F2EAD3 100%)',

  // Combination gradients
  sunset: 'linear-gradient(135deg, #B08D55 0%, #9C5238 50%, #F2EAD3 100%)',
  ocean: 'linear-gradient(180deg, #1D2D44 0%, #495F87 50%, #7587A5 100%)',

  // Background gradients
  heroBackground: 'linear-gradient(135deg, #F2EAD3 0%, #FDFCF8 50%, #F2EAD3 100%)',
  sectionAlternate: 'linear-gradient(180deg, #FFFFFF 0%, #FDFCF8 100%)',

  // Overlay gradients
  navyOverlay: 'linear-gradient(180deg, rgba(29, 45, 68, 0.9) 0%, rgba(29, 45, 68, 0.7) 100%)',
  goldOverlay: 'linear-gradient(180deg, rgba(176, 141, 85, 0.1) 0%, rgba(176, 141, 85, 0) 100%)',
} as const;

// =============================================================================
// ANIMATIONS
// =============================================================================

export const animations = {
  // Durations
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
    slower: '700ms',
  },

  // Easing functions
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },

  // Named transitions
  transitions: {
    all: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    colors: 'color 150ms ease, background-color 150ms ease, border-color 150ms ease',
    transform: 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    opacity: 'opacity 300ms ease',
    shadow: 'box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

// =============================================================================
// BREAKPOINTS
// =============================================================================

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// =============================================================================
// Z-INDEX
// =============================================================================

export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
} as const;

// =============================================================================
// BRAND ASSETS
// =============================================================================

export const brandAssets = {
  logo: {
    primary: '/logo.png',
    white: '/logo-white.png',
    icon: '/logo-icon.png',
  },
  favicon: '/favicon.ico',
  ogImage: '/og-image.png',
} as const;

// =============================================================================
// EXPORT DEFAULT THEME
// =============================================================================

export const brandKit = {
  colors: brandColors,
  semantic: semanticColors,
  typography,
  typographyPresets,
  spacing,
  borderRadius,
  shadows,
  gradients,
  animations,
  breakpoints,
  zIndex,
  assets: brandAssets,
} as const;

export default brandKit;
