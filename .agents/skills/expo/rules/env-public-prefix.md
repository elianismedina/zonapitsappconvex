---
title: Prefix Public Env Vars with EXPO_PUBLIC_
impact: CRITICAL
impactDescription: required for Expo, variables must be prefixed to be accessible in app
tags: env, expo-public
---

## Prefix Public Env Vars with EXPO_PUBLIC_

All environment variables that need to be available in the app JavaScript
must be prefixed with `EXPO_PUBLIC_`. Without the prefix, they're only
available in Metro bundler and config.

**Incorrect: no prefix**

```tsx
// .env
API_KEY=sk-1234567890
// This is NOT available in the app
```

```tsx
// App.tsx
const apiKey = process.env.API_KEY // undefined!
```

**Correct: EXPO_PUBLIC_ prefix**

```tsx
// .env
EXPO_PUBLIC_API_KEY=sk-1234567890
// Now available in the app
```

```tsx
// App.tsx
const apiKey = process.env.EXPO_PUBLIC_API_KEY // 'sk-1234567890'
```

**Best practice: use expo-constants**

```tsx
import Constants from 'expo-constants'

const apiKey = Constants.expoConfig?.extra?.apiKey as string
```

Reference: [Expo Environment Variables](https://docs.expo.dev/guides/environment-variables/)