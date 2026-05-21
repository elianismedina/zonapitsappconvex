/**
 * Example Component Demonstrating Theme Usage
 *
 * This component shows various ways to implement theming in your Expo app.
 * Copy and adapt patterns as needed for your own components.
 */

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useColorScale, useThemeColors } from '@/hooks/use-theme-colors';
import { Text, View } from 'react-native';

/**
 * Example 1: Using useThemeColors hook for dynamic colors
 */
export function ThemeColorsExample() {
  const colors = useThemeColors();

  return (
    <View style={{ backgroundColor: colors.background }}>
      <Text style={{ color: colors.text }}>
        Current theme colors
      </Text>
      <Text style={{ color: colors.textMuted }}>
        Muted text color
      </Text>
      <Text style={{ color: colors.primary }}>
        Primary color
      </Text>
      <Text style={{ color: colors.error }}>
        Error color
      </Text>
    </View>
  );
}

/**
 * Example 2: Using Tailwind classes (Recommended)
 */
export function TailwindThemeExample() {
  return (
    <View className="bg-background-50 dark:bg-background-900 p-4 rounded-lg">
      <Text className="text-typography-900 dark:text-typography-50 font-semibold">
        Heading with theme-aware colors
      </Text>
      <Text className="text-typography-600 dark:text-typography-400 mt-2">
        Subtitle with proper contrast in both modes
      </Text>
      <View className="mt-4 bg-primary-100 dark:bg-primary-800 p-3 rounded">
        <Text className="text-primary-900 dark:text-primary-100">
          Color scale example
        </Text>
      </View>
    </View>
  );
}

/**
 * Example 3: Using color scales for consistent theming
 */
export function ColorScaleExample() {
  const errorScale = useColorScale('error');
  const successScale = useColorScale('success');

  return (
    <View className="gap-2">
      {/* Error scale */}
      <View
        style={{
          backgroundColor: errorScale['100'],
          borderLeftColor: errorScale['500'],
        }}
        className="border-l-4 p-3 rounded"
      >
        <Text style={{ color: errorScale['900'] }}>
          Error message with themed colors
        </Text>
      </View>

      {/* Success scale */}
      <View
        style={{
          backgroundColor: successScale['100'],
          borderLeftColor: successScale['500'],
        }}
        className="border-l-4 p-3 rounded"
      >
        <Text style={{ color: successScale['900'] }}>
          Success message with themed colors
        </Text>
      </View>
    </View>
  );
}

/**
 * Example 4: Responsive to theme changes
 */
export function AdaptiveThemeExample() {
  const { colorScheme } = useColorScheme();
  const colors = useThemeColors();

  return (
    <View
      style={{
        backgroundColor: colors.background,
        padding: 16,
        borderRadius: 8,
        borderColor: colors.border,
        borderWidth: 1,
      }}
    >
      <Text style={{ color: colors.text, marginBottom: 8 }}>
        Current theme: {colorScheme || 'system'}
      </Text>
      <View
        style={{
          backgroundColor: colors.primaryLight,
          padding: 12,
          borderRadius: 4,
        }}
      >
        <Text style={{ color: colors.text }}>
          This container adapts to theme changes instantly
        </Text>
      </View>
    </View>
  );
}

/**
 * Example 5: Card component with theme awareness
 */
interface CardProps {
  title: string;
  subtitle?: string;
  variant?: 'default' | 'primary' | 'error' | 'success';
  children?: React.ReactNode;
}

export function ThemedCard({
  title,
  subtitle,
  variant = 'default',
  children,
}: CardProps) {
  const colors = useThemeColors();

  const variantStyles = {
    default: {
      bg: colors.background,
      border: colors.border,
      text: colors.text,
    },
    primary: {
      bg: colors.primaryLight,
      border: colors.primary,
      text: colors.text,
    },
    error: {
      bg: colors.getColor('error', '100'),
      border: colors.error,
      text: colors.text,
    },
    success: {
      bg: colors.getColor('success', '100'),
      border: colors.success,
      text: colors.text,
    },
  };

  const style = variantStyles[variant];

  return (
    <View
      style={{
        backgroundColor: style.bg,
        borderColor: style.border,
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
        marginVertical: 8,
      }}
    >
      <Text style={{ color: style.text, fontSize: 16, fontWeight: '600' }}>
        {title}
      </Text>
      {subtitle && (
        <Text
          style={{
            color: colors.textMuted,
            fontSize: 14,
            marginTop: 4,
          }}
        >
          {subtitle}
        </Text>
      )}
      {children && <View style={{ marginTop: 12 }}>{children}</View>}
    </View>
  );
}

/**
 * Example 6: Complete themed component with all patterns
 */
export function CompleteThemedComponent() {
  const { colorScheme } = useColorScheme();
  const colors = useThemeColors();

  return (
    <View style={{ backgroundColor: colors.background, flex: 1, padding: 16 }}>
      {/* Header */}
      <Text
        className="text-2xl font-bold text-typography-900 dark:text-typography-50 mb-4"
      >
        Complete Theme Example
      </Text>

      {/* Using hook for dynamic colors */}
      <ThemedCard
        title="Using useThemeColors Hook"
        subtitle="Programmatic color selection"
      >
        <View style={{ gap: 8 }}>
          <Text style={{ color: colors.primary }}>Primary color</Text>
          <Text style={{ color: colors.success }}>Success color</Text>
          <Text style={{ color: colors.warning }}>Warning color</Text>
          <Text style={{ color: colors.error }}>Error color</Text>
        </View>
      </ThemedCard>

      {/* Using Tailwind classes */}
      <ThemedCard
        title="Using Tailwind Classes"
        subtitle="Recommended approach"
        variant="primary"
      >
        <View className="gap-2">
          <Text className="text-primary-900 dark:text-primary-100 font-medium">
            Primary themed text
          </Text>
          <Text className="text-secondary-600 dark:text-secondary-300">
            Secondary themed text
          </Text>
        </View>
      </ThemedCard>

      {/* Using color scales */}
      <ThemedCard
        title="Color Scales"
        subtitle="Use entire color palette"
        variant="success"
      >
        <View className="gap-1">
          <Text className="bg-success-100 text-success-900 px-2 py-1 rounded">
            Light success background
          </Text>
          <Text className="bg-success-500 text-success-0 px-2 py-1 rounded">
            Dark success background
          </Text>
        </View>
      </ThemedCard>

      {/* Theme info */}
      <View
        className="mt-6 p-4 rounded-lg border border-outline-300 dark:border-outline-700"
        style={{
          backgroundColor: colors.backgroundSecondary,
        }}
      >
        <Text
          style={{ color: colors.text }}
          className="text-sm font-medium mb-2"
        >
          Current Theme Information
        </Text>
        <Text style={{ color: colors.textMuted }} className="text-xs">
          Mode: {colorScheme || 'system'}
        </Text>
        <Text style={{ color: colors.textMuted }} className="text-xs mt-1">
          Theme automatically switches based on device settings
        </Text>
      </View>
    </View>
  );
}
