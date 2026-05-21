// Shared useColorScheme hook — re-exports from nativewind as the single source
// of truth for color scheme detection. This keeps behavior consistent with
// GluestackUIProvider (which also uses nativewind internally) and NativeWind
// Tailwind classes across the entire app.
//
// Usage:
//   const { colorScheme } = useColorScheme();  // 'light' | 'dark' | undefined
export { useColorScheme } from "nativewind";
