---
title: Prefer Static Params Over Dynamic
impact: HIGH
impactDescription: better performance, type safety, compile-time checking
tags: routing, typescript, navigation
---

## Prefer Static Params Over Dynamic

When possible, use static route parameters instead of dynamic lookups.
Static params are typed and enable better optimization.

**Incorrect: dynamic string concatenation**

```tsx
const profileId = 'user-123'
router.push(`/profile/${profileId}`)
// No type checking, runtime errors possible
```

**Correct: typed route navigation**

```tsx
import { router } from 'expo-router'

router.push({
  pathname: '/profile/[id]',
  params: { id: 'user-123' }
})
```

**With typed helper:**

```tsx
const navigation = {
  goToProfile: (id: string) => {
    router.push({
      pathname: '/profile/[id]',
      params: { id }
    })
  }
}

navigation.goToProfile('user-123')
```

Reference: [Expo Router - Navigation](https://docs.expo.dev/router/reference/navigation/)