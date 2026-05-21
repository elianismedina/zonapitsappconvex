# Color Theme Quick Reference

Fast lookup guide for using colors and themes in your Expo app.

## 🚀 Quick Start

### Using Tailwind Classes (Best)
```tsx
<Text className="text-primary">Primary text</Text>
<View className="bg-background-100">Background</View>
<View className="border border-outline-300">Bordered</View>
```

### Using Color Hook
```tsx
import { useThemeColors } from '@/hooks/use-theme-colors';

const colors = useThemeColors();
<View style={{ backgroundColor: colors.background }} />
```

### Using Tailwind with Opacity
```tsx
<View className="bg-primary/20">20% opacity</View>
<View className="bg-error/50">50% opacity</View>
```

---

## 📋 Color System

### Semantic Colors (Always Available)
| Color | Use Case |
|-------|----------|
| `primary` | Main CTAs, highlights, key UI |
| `secondary` | Text, neutral elements |
| `error` | Destructive actions, errors |
| `success` | Confirmations, success states |
| `warning` | Warnings, cautions |
| `info` | Informational content |

### Utility Colors
| Color | Use Case |
|-------|----------|
| `typography` | Text colors (auto-inverted) |
| `background` | Container backgrounds |
| `outline` | Borders, dividers |
| `indicator` | Focus rings, status |

---

## 🎨 Color Shades

Every color has 12 shades from light (0) to dark (950):

```
-0   (white)
-50  
-100 ← Light variant
-200
-300
-400
-500 ← Medium (default)
-600
-700
-800 ← Dark variant
-900
-950 ← Near black
```

**Usage:**
```tsx
<Text className="text-primary-100">Light</Text>
<Text className="text-primary-500">Medium</Text>
<Text className="text-primary-900">Dark</Text>
```

---

## 💡 Common Patterns

### Themed Text
```tsx
/* Auto-inverts in dark mode */
<Text className="text-typography-700">Smart text</Text>

/* Explicit control */
<Text className="text-gray-700 dark:text-gray-300">Controlled</Text>
```

### Themed Button
```tsx
<View className="bg-primary px-4 py-2 rounded-lg">
  <Text className="text-white font-semibold">Click me</Text>
</View>
```

### Themed Card
```tsx
<View className="bg-background-50 dark:bg-background-900 
                 border border-outline-300 dark:border-outline-700
                 rounded-lg p-4">
  <Text className="text-typography-900 dark:text-typography-50">
    Title
  </Text>
</View>
```

### Success Message
```tsx
<View className="bg-success-100 dark:bg-success-900
                 border border-success-300 dark:border-success-700
                 rounded-lg p-4">
  <Text className="text-success-900 dark:text-success-100">
    Success! ✓
  </Text>
</View>
```

### Error Message
```tsx
<View className="bg-error-100 dark:bg-error-900
                 border border-error-300 dark:border-error-700
                 rounded-lg p-4">
  <Text className="text-error-900 dark:text-error-100">
    Error occurred ✕
  </Text>
</View>
```

### Muted/Secondary Text
```tsx
/* Primary text */
<Text className="text-typography-900 dark:text-typography-50">
  Primary
</Text>

/* Secondary text */
<Text className="text-typography-600 dark:text-typography-400">
  Secondary
</Text>

/* Muted text */
<Text className="text-typography-500 dark:text-typography-500">
  Muted
</Text>
```

---

## 🔄 Theme Detection

### Current Theme
```tsx
import { useColorScheme } from '@/hooks/use-color-scheme';

const { colorScheme } = useColorScheme();
// Returns: 'light' | 'dark' | undefined
```

### Select by Theme
```tsx
import { selectThemeValue } from '@/hooks/use-theme-colors';

const bg = selectThemeValue('light-bg-color', 'dark-bg-color');
```

---

## 🎯 Tailwind Class Reference

### Text Colors
```tsx
text-primary          /* Primary color */
text-primary-500      /* Specific shade */
text-secondary-300    /* Secondary light */
text-error-600        /* Error medium */
text-success-400      /* Success light */
text-typography-700   /* Smart text (auto-inverted) */
```

### Background Colors
```tsx
bg-primary            /* Primary bg */
bg-background-0       /* White */
bg-background-50      /* Very light */
bg-background-900     /* Very dark */
bg-background-950     /* Darkest */
```

### Border Colors
```tsx
border-outline-300    /* Light border */
border-outline-500    /* Medium border */
border-primary        /* Colored border */
border-error          /* Error border */
```

### Opacity
```tsx
bg-primary/20         /* 20% opacity */
bg-primary/50         /* 50% opacity */
text-white/75         /* 75% opacity */
```

### Dark Mode Override
```tsx
/* Light: bg-white, Dark: bg-gray-900 */
bg-white dark:bg-gray-900

/* Explicitly control both modes */
text-black dark:text-white
```

---

## 🛠️ Working with Hooks

### useThemeColors
```tsx
const colors = useThemeColors();

colors.primary              // Primary color
colors.primaryLight         // -100 shade
colors.primaryDark          // -900 shade
colors.error               // Error red
colors.success             // Success green
colors.text                // Smart text color
colors.background          // Smart background
colors.isDark              // Boolean: is dark mode?

// Get specific shade
colors.getColor('primary', '200')    // Primary-200
colors.getColor('error', '600')      // Error-600

// Get for Tailwind className
colors.getVar('primary', '500')      // var(--color-primary-500)
```

### useColorScale
```tsx
const errorScale = useColorScale('error');

errorScale['100']   // Error light
errorScale['500']   // Error medium
errorScale['900']   // Error dark
```

---

## 📱 Platform-Specific

### iOS - Switch Theme
Settings → Display & Brightness → Light/Dark/Auto

### Android - Switch Theme
Settings → Display → Dark theme toggle

### Web - DevTools
DevTools → More tools → Rendering → Emulate CSS media feature

---

## ✅ Do's and Don'ts

### ✅ DO
- Use Tailwind classes: `className="text-primary"`
- Use semantic colors: `error`, `success`, `warning`
- Use `dark:` prefix for explicit control
- Test in both light and dark modes
- Use `text-typography-*` for text
- Use `bg-background-*` for backgrounds

### ❌ DON'T
- Hardcode colors: `backgroundColor="#FFFFFF"`
- Use old Colors.ts file (it's deprecated)
- Ignore dark mode support
- Use `primary-red` instead of `primary`
- Mix Tailwind and inline styles
- Forget to test theme switching

---

## 🎓 Full Example Component

```tsx
import { View, Text } from 'react-native';
import { useThemeColors } from '@/hooks/use-theme-colors';

export function HelloWorld() {
  const { background, text, primary } = useThemeColors();

  return (
    <View className="flex-1 justify-center items-center"
          style={{ backgroundColor: background }}>
      
      {/* Tailwind approach */}
      <Text className="text-3xl font-bold text-primary mb-4">
        Hello Theme! 👋
      </Text>

      {/* Hook approach */}
      <Text style={{ color: text }}>
        Using theme hooks
      </Text>

      {/* Mixed approach */}
      <View className="mt-6 bg-primary-100 dark:bg-primary-900
                       border border-primary rounded-lg px-4 py-2">
        <Text className="text-primary-900 dark:text-primary-100">
          All methods work! 🎨
        </Text>
      </View>
    </View>
  );
}
```

---

## 🔗 Files to Know

- **Colors defined**: `components/ui/gluestack-ui-provider/config.ts` (native)
- **Web colors**: `global.css`
- **Tailwind setup**: `tailwind.config.js`
- **Color hook**: `hooks/use-theme-colors.ts` (NEW)
- **Theme guide**: `THEME_GUIDE.md` (full docs)
- **Examples**: `components/ThemeExamples.tsx` (copy patterns)

---

## 🚨 Troubleshooting

### Colors not changing in dark mode?
1. Rebuild the app: `expo start --clean`
2. Toggle system theme to force refresh
3. Check `useColorScheme()` returns correct mode

### Dark mode not detected?
1. Ensure `GluestackUIProvider` has `mode="system"`
2. Check device system theme settings
3. On web, check DevTools for prefers-color-scheme

### Colors look wrong?
1. Verify shade number (0-950 scale)
2. Use `text-typography-*` for automatic contrast
3. Test with opacity: `opacity-50` or `text-white/50`

---

**TL;DR:** Use `className="text-primary bg-background-50 dark:bg-background-900"` and you're done! 🎨
