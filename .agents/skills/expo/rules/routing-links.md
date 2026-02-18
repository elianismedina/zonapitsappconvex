---
title: Use expo-router Link Components
impact: MEDIUM
impactDescription: better accessibility, navigation consistency, deep linking support
tags: routing, accessibility, navigation
---

## Use expo-router Link Components

Use `Link` from `expo-router` instead of `Pressable` with `router.push`.
Link components handle accessibility, deep linking, and navigation state properly.

**Incorrect: Pressable with router.push**

```tsx
import { Pressable } from 'react-native'
import { router } from 'expo-router'

function NavigationItem({ href, children }) {
  return (
    <Pressable onPress={() => router.push(href)}>
      <Text>{children}</Text>
    </Pressable>
  )
}
```

**Correct: expo-router Link**

```tsx
import { Link } from 'expo-router'

function NavigationItem({ href, children }) {
  return (
    <Link href={href}>
      <Text>{children}</Text>
    </Link>
  )
}
```

**With styling using asChild:**

```tsx
<Link href="/profile" asChild>
  <Pressable style={styles.button}>
    <Text style={styles.text}>Go to Profile</Text>
  </Pressable>
</Link>
```

Reference: [Expo Router - Link](https://docs.expo.dev/router/link/)