/**
 * Color Palette
 * Centralized color definitions for the entire application
 * 
 * 5-Color Palette:
 * 1. #C26002 - Logo/Primary (warm orange-brown)
 * 2. #EFEBD8 - Base/Background (warm beige)
 * 3. #908846 - Green/Secondary (olive green)
 * 4. #D4AF6D - Accent (golden tan)
 * 5. #F1E3A4 - Base2 (light cream)
 */

export const colors = {
  // Brand Colors
  primary: {
    main: '#C26002',      // Logo color - warm orange-brown
    light: '#D97A2A',     // Lighter shade
    dark: '#9A4D01',      // Darker shade
  },
  secondary: {
    main: '#908846',      // Green - olive green
    light: '#A8A066',     // Lighter shade
    dark: '#6F6B35',      // Darker shade
  },
  
  // Background Colors
  background: {
    default: '#EFEBD8',   // Base - warm beige background
    base2: '#F1E3A4',     // Base2 - light cream (alternative name)
    white: '#FFFFFF',     // Pure white option
  },
  
  // Accent Color
  accent: {
    main: '#D4AF6D',      // Golden tan accent
    light: '#E8C99A',     // Lighter shade
    dark: '#B8964A',      // Darker shade
  },
  
  // Text Colors (designed to work with warm backgrounds)
  text: {
    primary: '#3D2817',   // Main text color (dark brown for contrast)
    secondary: '#6B5B4A', // Secondary text (medium brown)
    disabled: '#A0A0A0',  // Disabled text (neutral gray)
  },
  
  // Status Colors (optional - for alerts, success, errors)
  status: {
    success: '#908846',   // Using your green for success
    error: '#C26002',     // Using primary for errors (or adjust)
    warning: '#D97A2A',   // Lighter orange for warnings
    info: '#6B5B4A',      // Using secondary text for info
  },
} as const;

// Export individual colors for easy access
export const BACKGROUND_COLOR = colors.background.default;
export const BASE2_COLOR = colors.background.base2;
export const PRIMARY_COLOR = colors.primary.main;
export const SECONDARY_COLOR = colors.secondary.main;
export const ACCENT_COLOR = colors.accent.main;
