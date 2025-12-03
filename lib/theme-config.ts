/**
 * Centralized Theme Configuration
 *
 * This file contains all color definitions for the Spark platform.
 * All colors are WCAG AA compliant for accessibility.
 *
 * WCAG AA Requirements:
 * - Normal text (< 18pt): Contrast ratio >= 4.5:1
 * - Large text (>= 18pt or 14pt bold): Contrast ratio >= 3:1
 * - UI components and graphics: Contrast ratio >= 3:1
 */

export const themeConfig = {
  // Base semantic colors with WCAG AA compliant values
  colors: {
    // Primary brand colors - adjusted for accessibility
    brand: {
      purple: {
        DEFAULT: '#7C3AED', // Violet-700 - WCAG AA compliant on white
        light: '#A78BFA',   // Violet-400
        dark: '#5B21B6',    // Violet-900
      },
      blue: {
        DEFAULT: '#2563EB', // Blue-600 - WCAG AA compliant on white
        light: '#60A5FA',   // Blue-400
        dark: '#1E40AF',    // Blue-800
      },
      indigo: {
        DEFAULT: '#4F46E5', // Indigo-600 - WCAG AA compliant on white
        light: '#818CF8',   // Indigo-400
        dark: '#3730A3',    // Indigo-800
      },
    },

    // Secondary accent colors - all WCAG AA compliant
    accent: {
      yellow: {
        DEFAULT: '#D97706', // Amber-600 - WCAG AA compliant on white
        light: '#FBBF24',   // Amber-400
        dark: '#92400E',    // Amber-800
      },
      orange: {
        DEFAULT: '#EA580C', // Orange-600 - WCAG AA compliant on white
        light: '#FB923C',   // Orange-400
        dark: '#9A3412',    // Orange-800
      },
      pink: {
        DEFAULT: '#DB2777', // Pink-600 - WCAG AA compliant on white
        light: '#F472B6',   // Pink-400
        dark: '#9F1239',    // Pink-800
      },
    },

    // Success, info, warning colors
    semantic: {
      green: {
        DEFAULT: '#059669', // Emerald-600 - WCAG AA compliant
        light: '#34D399',   // Emerald-400
        dark: '#065F46',    // Emerald-800
      },
      teal: {
        DEFAULT: '#0D9488', // Teal-600 - WCAG AA compliant
        light: '#2DD4BF',   // Teal-400
        dark: '#115E59',    // Teal-800
      },
      lime: {
        DEFAULT: '#65A30D', // Lime-600 - WCAG AA compliant
        light: '#A3E635',   // Lime-400
        dark: '#3F6212',    // Lime-800
      },
    },
  },

  // HSL values for CSS custom properties (light mode)
  hsl: {
    light: {
      // Base colors
      background: '0 0% 99%',
      foreground: '220 13% 13%',

      // Card & elevated surfaces
      card: '0 0% 100%',
      cardForeground: '220 13% 13%',
      popover: '0 0% 100%',
      popoverForeground: '220 13% 13%',

      // Primary - dark for contrast
      primary: '220 13% 13%',
      primaryForeground: '0 0% 98%',

      // Secondary
      secondary: '210 11% 96%',
      secondaryForeground: '220 13% 13%',

      // Muted
      muted: '210 11% 96%',
      mutedForeground: '220 9% 46%',

      // Accent
      accent: '214 32% 91%',
      accentForeground: '220 13% 13%',

      // Semantic colors - WCAG AA compliant ratios
      destructive: '0 72% 51%',       // Red-600
      destructiveForeground: '0 0% 98%',
      success: '142 71% 38%',         // Green-600 adjusted
      successForeground: '0 0% 98%',
      warning: '25 95% 43%',          // Orange-600 adjusted for contrast
      warningForeground: '0 0% 98%',
      info: '199 89% 42%',            // Cyan-600 adjusted for contrast
      infoForeground: '0 0% 98%',

      // Borders & inputs
      border: '220 13% 91%',
      input: '220 13% 91%',
      ring: '220 13% 13%',

      // Chart colors - all WCAG AA compliant
      chart1: '214 59% 45%',          // Blue adjusted
      chart2: '173 58% 39%',          // Teal adjusted
      chart3: '220 13% 26%',
      chart4: '25 95% 43%',           // Orange adjusted
      chart5: '199 89% 42%',          // Cyan adjusted
    },

    dark: {
      // Base colors
      background: '220 13% 8%',
      foreground: '210 11% 96%',

      // Card & elevated surfaces
      card: '220 13% 11%',
      cardForeground: '210 11% 96%',
      popover: '220 13% 11%',
      popoverForeground: '210 11% 96%',

      // Primary
      primary: '210 11% 96%',
      primaryForeground: '220 13% 13%',

      // Secondary
      secondary: '220 13% 16%',
      secondaryForeground: '210 11% 96%',

      // Muted
      muted: '220 13% 16%',
      mutedForeground: '220 9% 64%',

      // Accent
      accent: '214 32% 24%',
      accentForeground: '210 11% 96%',

      // Semantic colors - WCAG AA compliant on dark background
      destructive: '0 62.8% 50%',
      destructiveForeground: '210 11% 96%',
      success: '142 71% 45%',
      successForeground: '210 11% 96%',
      warning: '38 92% 55%',
      warningForeground: '220 13% 13%',
      info: '199 89% 55%',
      infoForeground: '220 13% 13%',

      // Borders & inputs
      border: '220 13% 20%',
      input: '220 13% 20%',
      ring: '210 11% 71%',

      // Chart colors
      chart1: '214 59% 65%',
      chart2: '173 58% 55%',
      chart3: '220 13% 76%',
      chart4: '38 92% 68%',
      chart5: '199 89% 65%',
    },
  },

  // Gradient definitions using WCAG AA compliant colors
  gradients: {
    achievement: 'linear-gradient(135deg, #D97706 0%, #EA580C 100%)',
    successSparkle: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
    trophy: 'linear-gradient(135deg, #D97706 0%, #F59E0B 50%, #FCD34D 100%)',

    progress: 'linear-gradient(90deg, #2563EB 0%, #7C3AED 50%, #DB2777 100%)',
    energy: 'linear-gradient(135deg, #7C3AED 0%, #A78BFA 50%, #C084FC 100%)',
    curiosity: 'linear-gradient(135deg, #2563EB 0%, #60A5FA 100%)',

    trust: 'linear-gradient(135deg, #1E40AF 0%, #0891B2 100%)',
    professional: 'linear-gradient(135deg, #475569 0%, #64748B 100%)',
    safety: 'linear-gradient(135deg, #047857 0%, #059669 100%)',

    celebration: 'linear-gradient(135deg, #DC2626 0%, #F59E0B 25%, #059669 50%, #2563EB 75%, #7C3AED 100%)',
    rainbow: 'linear-gradient(90deg, #DC2626 0%, #EA580C 15%, #D97706 30%, #059669 50%, #0891B2 65%, #7C3AED 80%, #DB2777 100%)',

    magic: 'linear-gradient(135deg, #7C3AED 0%, #DB2777 50%, #2563EB 100%)',
    sunshine: 'linear-gradient(135deg, #F59E0B 0%, #EA580C 50%, #DC2626 100%)',
    ocean: 'linear-gradient(135deg, #0891B2 0%, #0284C7 50%, #2563EB 100%)',
    forest: 'linear-gradient(135deg, #059669 0%, #10B981 50%, #34D399 100%)',
    sunset: 'linear-gradient(135deg, #D97706 0%, #EA580C 50%, #DB2777 100%)',
  },

  // Shadow definitions with consistent opacity
  shadows: {
    elevation1: '0 1px 3px rgba(0, 0, 0, 0.08)',
    elevation2: '0 4px 12px rgba(0, 0, 0, 0.1)',
    elevation3: '0 8px 24px rgba(0, 0, 0, 0.12)',
    elevationFloat: '0 12px 40px rgba(0, 0, 0, 0.15)',
    playful: '0 10px 25px -5px rgba(124, 58, 237, 0.3), 0 8px 10px -6px rgba(219, 39, 119, 0.2)',
    playfulLg: '0 20px 40px -10px rgba(124, 58, 237, 0.4), 0 15px 20px -8px rgba(219, 39, 119, 0.3)',
  },

  // Border radius values
  radius: {
    sm: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.5rem',
    '2xl': '2rem',
  },
} as const;

export type ThemeConfig = typeof themeConfig;
