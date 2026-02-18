---
title: Prefer Expo Modules Over Native Code
impact: HIGH
impactDescription: simpler, cross-platform, maintained by Expo
tags: native, modules, expo
---

## Prefer Expo Modules Over Native Code

Always check if an Expo module exists before writing custom native code.
Expo modules are maintained, tested, and work across platforms.

**Incorrect: custom native Android code**

```kotlin
// Custom Android code for location - DON'T DO THIS
// LocationManager.kt
class LocationManager(private val context: Context) {
  fun getCurrentLocation(): Location {
    // Lots of native code...
  }
}
```

**Correct: use expo-location**

```tsx
import * as Location from 'expo-location'

async function getCurrentLocation() {
  const { status } = await Location.requestForegroundPermissionsAsync()
  if (status !== 'granted') {
    throw new Error('Location permission not granted')
  }
  const location = await Location.getCurrentPositionAsync({})
  return location
}
```

**Common Expo modules:**

| Feature | Use this module |
|---------|-----------------|
| Location | `expo-location` |
| Camera | `expo-camera` |
| Haptics | `expo-haptics` |
| File System | `expo-file-system` |
| Secure Store | `expo-secure-store` |
| Notifications | `expo-notifications` |
| Sensors | `expo-sensors` |
| Bluetooth | `expo-bluetooth` |
| AV (audio/video) | `expo-av` |

Reference: [Expo Modules](https://docs.expo.dev/modules/)