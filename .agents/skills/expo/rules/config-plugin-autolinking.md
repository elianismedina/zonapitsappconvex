---
title: Let Expo Handle Autolinking
impact: HIGH
impactDescription: avoids manual native code, cross-platform compatibility
tags: config, autolinking, native
---

## Let Expo Handle Autolinking

Never manually add native code when Expo can handle it via autolinking.
Autolinking automatically links native modules from dependencies.

**Incorrect: manual Android Gradle changes**

```gradle
// android/app/build.gradle - DON'T DO THIS
dependencies {
  implementation project(':expo-location')
  implementation 'com.google.android.gms:play-services-location:21.0.1'
}
```

**Correct: install and let Expo handle it**

```bash
npx expo install expo-location
# Autolinking handles native linking automatically
```

**With config plugin if needed:**

```tsx
// app.config.ts
export default {
  name: 'MyApp',
  plugins: [
    ['expo-location', {
      locationWhenInUsePermission: 'Allow location access',
      locationAlwaysPermission: 'Allow location access even when closed'
    }]
  ]
}
```

Reference: [Expo Autolinking](https://docs.expo.dev/guides/linking/)