---
title: Use Config Plugins for Native Config
impact: HIGH
impactDescription: cross-platform, maintainable, version-controlled
tags: native, config, plugins
---

## Use Config Plugins for Native Config

Use config plugins for native configuration instead of editing
native files directly. Config plugins are cross-platform and version-controlled.

**Incorrect: editing AndroidManifest.xml directly**

```xml
<!-- android/app/src/main/AndroidManifest.xml - DON'T MODIFY -->
<uses-permission android:name="android.permission.CAMERA" />
```

**Incorrect: editing Info.plist directly**

```xml
<!-- ios/YourApp/Info.plist - DON'T MODIFY -->
<key>NSCameraUsageDescription</key>
<string>Allow camera</string>
```

**Correct: config plugin**

```tsx
// plugins/withPermissions.ts
import { ConfigPlugin, withAndroidManifest, withInfoPlist } from '@expo/config-plugins'

const withPermissions: ConfigPlugin = (config) => {
  // Android
  config = withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest
    manifest['uses-permission'] = [
      ...(manifest['uses-permission'] || []),
      { $: { 'android:name': 'android.permission.CAMERA' } }
    ]
    return config
  })

  // iOS
  config = withInfoPlist(config, (config) => {
    config.modResults.NSCameraUsageDescription = 'Allow camera access'
    return config
  })

  return config
}

export default withPermissions
```

```tsx
// app.config.ts
import withPermissions from './plugins/withPermissions'

export default {
  name: 'MyApp',
  plugins: [withPermissions]
}
```

Reference: [Expo Config Plugins](https://docs.expo.dev/guides/config-plugins/)