---
title: Use Named Exports for Screens
impact: CRITICAL
impactDescription: required for Expo Router routing, TypeScript inference, static analysis
tags: routing, expo-router, typescript
---

## Use Named Exports for Screens

Expo Router requires screens to use named exports (`export default function ScreenName()`).
Named exports enable proper static analysis for routing, TypeScript inference,
and file-based navigation.

**Incorrect: default export expression**

```tsx
// app/home.tsx
const HomeScreen = () => <View><Text>Home</Text></View>
export default HomeScreen
```

**Correct: named default export**

```tsx
// app/home.tsx
export default function HomeScreen() {
  return (
    <View>
      <Text>Home</Text>
    </View>
  )
}
```

**With typed params:**

```tsx
// app/profile/[id].tsx
import { useLocalSearchParams } from 'expo-router'

export default function ProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  return <View><Text>Profile: {id}</Text></View>
}
```

Reference: [Expo Router - File-based routing](https://docs.expo.dev/router/reference/routing/)