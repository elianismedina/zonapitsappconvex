# Expo Color Themes Implementation Guide

Your project has a fully functional dual-theme system (light/dark mode) with automatic detection and manual override capabilities. This guide explains how to use it.

## 🎨 Theme System Architecture

The theme system is built on three layers:

### Layer 1: Color Token Definition
- **Native (React Native)**: [`components/ui/gluestack-ui-provider/config.ts`](components/ui/gluestack-ui-provider/config.ts)
  - Defines color tokens for light and dark modes using NativeWind `vars()`
  - RGB format: `"240 209 23"` (no commas, no #hex)
  
- **Web**: [`global.css`](global.css)
  - CSS custom properties in `:root` (light) and `@media (prefers-color-scheme: dark)` (dark)
  - Mirrors the same tokens for consistency across platforms

### Layer 2: Tailwind Configuration
- [`tailwind.config.js`](tailwind.config.js)
  - Extends Tailwind colors with CSS variable references
  - Example: `primary: { DEFAULT: "rgb(var(--color-primary) / <alpha-value>)" }`
  - Enables Tailwind classes like `bg-primary`, `text-secondary-500`, `border-error`

### Layer 3: Theme Provider
- **GluestackUIProvider** ([`components/ui/gluestack-ui-provider/index.tsx`](components/ui/gluestack-ui-provider/index.tsx))
  - Applies color tokens to the entire app
  - Supports `mode="light" | "dark" | "system"`
  - Currently set to `mode="system"` in [`app/_layout.tsx`](app/_layout.tsx)

- **React Navigation ThemeProvider**
  - Provides navigation styling (DarkTheme/DefaultTheme)
  - Works in sync with system preference

## 🎯 Color Palette

### Primary Colors (Yellow/Gold)
Used for main CTAs, highlights, and primary UI elements
```
Light: #F0D117 (240 209 23)
Dark:  Automatically inverted for legibility
```

### Secondary Colors (Black/Neutral)
Used for text, backgrounds, and neutral elements
```
Light: #000000 (black)
Dark:  #FFFFFF (white) - inverted for readability
```

### Semantic Colors
- **Error**: Red tones - for destructive actions and errors
- **Success**: Green tones - for confirmations and success states
- **Warning**: Orange tones - for warnings and alerts
- **Info**: Blue tones - for informational content

### Utility Colors
- **Typography**: Grayscale for text
- **Outline**: Border colors
- **Background**: Container backgrounds
- **Indicator**: Focus rings and status indicators

## 📱 How to Use Colors in Your Components

### 1. Using Tailwind Classes (Recommended)

```tsx
// Text colors
<Text className="text-primary">Primary text</Text>
<Text className="text-secondary-500">Secondary text</Text>
<Text className="text-error-600">Error message</Text>

// Background colors
<View className="bg-background-100">Container</View>
<View className="bg-primary-50">Light yellow background</View>

// With opacity
<View className="bg-primary/20">20% opacity yellow</View>
<View className="text-typography-700/50">50% opacity text</View>

// Border colors
<View className="border border-outline-300">Bordered container</View>

// Responsive and conditional
<Text className="text-secondary-700 dark:text-secondary-200">
  Smart text color
</Text>
```

### 2. Using CSS Variables in styles

```tsx
import { useColorScheme } from '@/hooks/use-color-scheme';

export function MyComponent() {
  const { colorScheme } = useColorScheme();
  
  return (
    <View style={{ 
      backgroundColor: `rgb(var(--color-background-${colorScheme === 'dark' ? '800' : '100'}))`
    }}>
      Content
    </View>
  );
}
```

### 3. Using Gluestack UI Components (Best Practice)

Gluestack components automatically respond to theme changes:

```tsx
import { Button, Text, Box } from '@gluestack-ui/core';

export function MyComponent() {
  return (
    <Box className="bg-background-0">
      <Text color="$primary">Themed text</Text>
      <Button action="positive">
        <Text>Themed button</Text>
      </Button>
    </Box>
  );
}
```

## 🌓 How Theme Detection Works

### Automatic (System Default)
The app automatically detects and responds to the device's system theme preference:

1. **iOS**: Settings → Display & Brightness
2. **Android**: Settings → Display → Dark theme
3. **Web**: System `prefers-color-scheme` media query

The `useColorScheme()` hook from NativeWind detects this automatically.

### Manual Override (Optional Enhancement)
To add manual theme toggle capability, see [Theme Toggle Implementation](#-theme-toggle-implementation-optional) below.

## 🛠️ How to Customize Colors

### Step 1: Update Native Config
Edit [`components/ui/gluestack-ui-provider/config.ts`](components/ui/gluestack-ui-provider/config.ts):

```ts
export const config = {
  light: vars({
    "--color-primary": "240 209 23",  // Change this
    "--color-primary-50": "254 250 232",
    // ... etc
  }),
  dark: vars({
    "--color-primary": "243 218 69",  // And this
    // ... etc
  }),
};
```

### Step 2: Update Web CSS
Edit [`global.css`](global.css) in two places:

```css
@layer base {
  :root {
    --color-primary: 240 209 23;  /* Light mode */
  }
  
  @media (prefers-color-scheme: dark) {
    :root {
      --color-primary: 243 218 69;  /* Dark mode */
    }
  }
}
```

### Step 3: Update Tailwind (if needed)
The Tailwind config in [`tailwind.config.js`](tailwind.config.js) already references the CSS variables, so no changes needed there.

### Color Format Requirements
- **Always use RGB format**: `"240 209 23"` (space-separated, no commas, no #)
- **No alpha channel in definition**: Alpha is applied via Tailwind's `/` syntax: `bg-primary/20`

## 📋 Color Naming Convention

```
--color-{semantic}-{shade}
--color-primary-500        // Medium primary
--color-primary-100        // Light primary
--color-primary-900        // Dark primary
--color-success-600        // Medium success
--color-background-950     // Darkest background
```

All colors follow a 0-950 scale:
- `0`: White/lightest
- `50-400`: Light shades
- `500`: Medium/default
- `600-900`: Dark shades
- `950`: Darkest

## 🔗 Integration Points

### 1. Root Layout (`app/_layout.tsx`)
Providers are already wired up:
```tsx
<GluestackUIProvider mode="system">
  <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
    {/* Your app */}
  </ThemeProvider>
</GluestackUIProvider>
```

### 2. Component Styling
Use Tailwind classes with automatic theme support:
```tsx
<Text className="text-typography-700">Light mode text</Text>
// Automatically switches to text-typography-300 in dark mode
```

### 3. Conditional Styles
Use the `dark:` prefix in Tailwind for explicit dark-mode styles:
```tsx
<View className="bg-background-0 dark:bg-background-900">
  Content (white in light, black in dark)
</View>
```

## 🧪 Testing Themes

### On iOS
1. Go to Settings → Developer Settings (or Simulator menu)
2. Look for "Appearance" settings
3. Toggle between Light and Dark

### On Android
1. Go to Settings → Display → Advanced
2. Toggle "Dark theme"

### On Web
1. Open DevTools
2. Click the three dots → More tools → Rendering
3. Find "Emulate CSS media feature prefers-color-scheme"
4. Toggle between "prefers-color-scheme: light" and "prefers-color-scheme: dark"

## 📝 Best Practices

1. **Use semantic names**: Prefer `error`, `success`, `warning` over hardcoded colors
2. **Leverage Tailwind**: Use classes like `text-primary-600` instead of inline styles
3. **Test both modes**: Always verify your UI in both light and dark modes
4. **Use Gluestack components**: They automatically respect the theme
5. **Avoid hardcoded colors**: Use CSS variables and Tailwind classes
6. **Typography**: Use `text-typography-*` for text colors (automatically inverted in dark mode)
7. **Background**: Use `bg-background-*` for container backgrounds

## 🔧 Theme Toggle Implementation (Optional)

If you want to add manual theme override capability:

### Step 1: Create a Theme Context
Create `contexts/ThemeContext.tsx`:

```tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme as useNativeWindColorScheme } from 'nativewind';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  actualScheme: 'light' | 'dark' | undefined;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('system');
  const { colorScheme } = useNativeWindColorScheme();

  const actualScheme = 
    mode === 'system' ? colorScheme : mode;

  return (
    <ThemeContext.Provider value={{ mode, setMode, actualScheme: actualScheme as 'light' | 'dark' | undefined }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
```

### Step 2: Wrap Your App
Update `app/_layout.tsx`:

```tsx
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';

// ... in your component:
<ThemeProvider>
  <GluestackUIProvider mode={mode}>
    {/* Rest of your app */}
  </GluestackUIProvider>
</ThemeProvider>
```

### Step 3: Use in Components
```tsx
import { useTheme } from '@/contexts/ThemeContext';

export function ThemeToggle() {
  const { mode, setMode, actualScheme } = useTheme();

  return (
    <View className="gap-2">
      <Text>Current: {actualScheme}</Text>
      <Button onPress={() => setMode('light')}>
        Light
      </Button>
      <Button onPress={() => setMode('dark')}>
        Dark
      </Button>
      <Button onPress={() => setMode('system')}>
        System
      </Button>
    </View>
  );
}
```

## 📚 Related Files

- [`components/ui/gluestack-ui-provider/`](components/ui/gluestack-ui-provider/) - Theme provider implementation
- [`global.css`](global.css) - Web color tokens and theming
- [`tailwind.config.js`](tailwind.config.js) - Tailwind color configuration
- [`hooks/use-color-scheme.ts`](hooks/use-color-scheme.ts) - Color scheme detection hook
- [`app/_layout.tsx`](app/_layout.tsx) - Root layout with theme providers
- [`constants/Colors.ts`](constants/Colors.ts) - Legacy (deprecated) color constants

## ✅ Verification Checklist

- [x] Light mode colors defined in config.ts
- [x] Dark mode colors defined in config.ts
- [x] Light mode CSS variables in global.css
- [x] Dark mode CSS variables in global.css (with @media)
- [x] Tailwind config extends colors with CSS variables
- [x] GluestackUIProvider configured with mode="system"
- [x] ThemeProvider from React Navigation integrated
- [x] useColorScheme hook available from NativeWind

Your theme system is production-ready! 🚀
