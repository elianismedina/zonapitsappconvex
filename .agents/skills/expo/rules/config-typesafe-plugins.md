---
title: Use Typed Config Plugins
impact: MEDIUM
impactDescription: type safety, autocomplete, runtime error prevention
tags: config, plugins, typescript
---

## Use Typed Config Plugins

Use typed config plugins from `@expo/config-plugins` to avoid runtime errors
and get TypeScript autocomplete.

**Incorrect: string-based plugin config**

```tsx
// app.config.ts
export default {
  name: 'MyApp',
  plugins: [
    'expo-secure-store',
    ['expo-location', { locationWhenInUsePermission: 'Allow location' }]
  ]
}
```

**Correct: typed plugins**

```tsx
// app.config.ts
import { ConfigPlugin, withAndroidPermissions } from '@expo/config-plugins'

const withLocationPermissions: ConfigPlugin<{ permission: string }> = (config, props) => {
  return withAndroidPermissions(config, (config) => {
    config.modResults.permissions = [
      ...(config.modResults.permissions || []),
      props.permission
    ]
    return config
  })
}

export default {
  name: 'MyApp',
  plugins: [
    withLocationPermissions({ permission: 'ACCESS_FINE_LOCATION' })
  ]
}
```

Reference: [Expo Config Plugins](https://docs.expo.dev/guides/config-plugins/)