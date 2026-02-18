---
title: Use Development Builds for Custom Native Code
impact: HIGH
impactDescription: required for custom native code, Expo Go cannot load it
tags: native, dev-client, development
---

## Use Development Builds for Custom Native Code

When you need custom native code (config plugins, custom modules),
use development builds (`expo run:ios` / `expo run:android`).
Expo Go cannot load custom native code.

**Incorrect: expecting Expo Go to load custom native code**

```tsx
import { MyCustomNativeModule } from './native-modules'
// This will crash in Expo Go!
```

**Correct: use development build**

```bash
# Create development build
expo run:ios
# or
expo run:android
```

**Correct: check for development build at runtime**

```tsx
import Constants from 'expo-constants'

function isExpoGo(): boolean {
  return Constants.appOwnership === 'expo'
}

function MyComponent() {
  if (isExpoGo()) {
    return <Text>Custom features not available in Expo Go</Text>
  }

  return <CustomNativeComponent />
}
```

Reference: [Expo Development Builds](https://docs.expo.dev/develop/development-builds/introduction/)