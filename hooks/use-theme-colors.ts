/**
 * useThemeColors Hook
 *
 * Provides easy access to theme colors and color scheme detection.
 * This hook simplifies color selection based on the current theme.
 *
 * Usage:
 *   const colors = useThemeColors();
 *   const { background, text, primary } = colors;
 */

import { useColorScheme } from 'nativewind';

export type ColorKey =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'error'
  | 'success'
  | 'warning'
  | 'info'
  | 'typography'
  | 'outline'
  | 'background'
  | 'indicator';

export type ColorShade =
  | '0'
  | '50'
  | '100'
  | '200'
  | '300'
  | '400'
  | '500'
  | '600'
  | '700'
  | '800'
  | '900'
  | '950';

interface ThemeColors {
  // Primary colors
  primary: string;
  primaryLight: string;
  primaryDark: string;

  // Secondary colors
  secondary: string;
  secondaryLight: string;
  secondaryDark: string;

  // Semantic colors
  error: string;
  success: string;
  warning: string;
  info: string;

  // Text and backgrounds
  text: string;
  textMuted: string;
  background: string;
  backgroundSecondary: string;

  // Utilities
  border: string;
  isDark: boolean;

  // Get custom color by key and shade
  getColor: (key: ColorKey, shade?: ColorShade) => string;

  // Get CSS variable reference
  getVar: (key: ColorKey, shade?: ColorShade) => string;
}

/**
 * Get the color value in CSS rgb() format
 */
function getRgbColor(varName: string): string {
  return `rgb(var(${varName}))`;
}

/**
 * Get the CSS variable reference
 */
function getVarReference(key: ColorKey, shade: ColorShade = '500'): string {
  if (shade === '500' || shade === 'DEFAULT') {
    return `--color-${key}`;
  }
  return `--color-${key}-${shade}`;
}

export function useThemeColors(): ThemeColors {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return {
    // Primary colors
    primary: getRgbColor(getVarReference('primary')),
    primaryLight: getRgbColor(getVarReference('primary', '100')),
    primaryDark: getRgbColor(getVarReference('primary', '900')),

    // Secondary colors
    secondary: getRgbColor(getVarReference('secondary', '500')),
    secondaryLight: getRgbColor(getVarReference('secondary', '100')),
    secondaryDark: getRgbColor(getVarReference('secondary', '900')),

    // Semantic colors
    error: getRgbColor(getVarReference('error', '500')),
    success: getRgbColor(getVarReference('success', '500')),
    warning: getRgbColor(getVarReference('warning', '500')),
    info: getRgbColor(getVarReference('info', '500')),

    // Text and backgrounds
    text: isDark
      ? getRgbColor(getVarReference('typography', '50'))
      : getRgbColor(getVarReference('typography', '900')),
    textMuted: isDark
      ? getRgbColor(getVarReference('typography', '400'))
      : getRgbColor(getVarReference('typography', '500')),
    background: isDark
      ? getRgbColor(getVarReference('background', '50'))
      : getRgbColor(getVarReference('background', '900')),
    backgroundSecondary: isDark
      ? getRgbColor(getVarReference('background', '100'))
      : getRgbColor(getVarReference('background', '800')),

    // Utilities
    border: getRgbColor(getVarReference('outline', '300')),
    isDark,

    // Get custom color
    getColor: (key: ColorKey, shade: ColorShade = '500'): string => {
      return getRgbColor(getVarReference(key, shade));
    },

    // Get variable reference for direct use in className
    getVar: (key: ColorKey, shade: ColorShade = '500'): string => {
      return `var(${getVarReference(key, shade)})`;
    },
  };
}

/**
 * Helper function to select value based on theme
 *
 * Usage:
 *   const bg = selectThemeValue('light-bg', 'dark-bg');
 */
export function selectThemeValue<T>(
  lightValue: T,
  darkValue: T
): T {
  const { colorScheme } = useColorScheme();
  return colorScheme === 'dark' ? darkValue : lightValue;
}

/**
 * Get a complete color scale for a specific semantic color
 *
 * Usage:
 *   const errorScale = useColorScale('error');
 */
export function useColorScale(key: ColorKey): Record<ColorShade, string> {
  const shades: ColorShade[] = [
    '0',
    '50',
    '100',
    '200',
    '300',
    '400',
    '500',
    '600',
    '700',
    '800',
    '900',
    '950',
  ];

  return shades.reduce(
    (acc, shade) => ({
      ...acc,
      [shade]: getRgbColor(getVarReference(key, shade)),
    }),
    {} as Record<ColorShade, string>
  );
}
