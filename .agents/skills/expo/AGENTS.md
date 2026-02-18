# Expo Skills

**Version 1.0.0**
Engineering
February 2026

> **Note:**
> This document is mainly for agents and LLMs to follow when maintaining,
> generating, or refactoring Expo applications. Humans
> may also find it useful, but guidance here is optimized for automation
> and consistency by AI-assisted workflows.

---

## Abstract

Comprehensive guide for Expo applications, designed for AI agents and LLMs.
Contains best practices across 7 categories, prioritized by impact from critical
(routing) to incremental (assets). Each rule includes detailed explanations,
real-world examples comparing incorrect vs. correct implementations, and specific
impact metrics to guide automated refactoring and code generation.

---

## Table of Contents

1. [Expo Router](#1-expo-router) — **CRITICAL**
   - 1.1 [Use Named Exports for Screens](#11-use-named-exports-for-screens)
   - 1.2 [Prefer Static Params Over Dynamic](#12-prefer-static-params-over-dynamic)
   - 1.3 [Use expo-router Link Components](#13-use-expo-router-link-components)
2. [Config Plugins](#2-config-plugins) — **HIGH**
   - 2.1 [Use Typed Config Plugins](#21-use-typed-config-plugins)
   - 2.2 [Let Expo Handle Autolinking](#22-let-expo-handle-autolinking)
   - 2.3 [Use Local Plugins for App-Specific Config](#23-use-local-plugins-for-app-specific-config)
3. [Environment Variables](#3-environment-variables) — **HIGH**
   - 3.1 [Use .env.local for Local Secrets](#31-use-envlocal-for-local-secrets)
   - 3.2 [Prefix Public Env Vars with EXPO_PUBLIC_](#32-prefix-public-env-vars-with-expo_public_)
   - 3.3 [Use expo-constants for Env Vars](#33-use-expo-constants-for-env-vars)
4. [Native Modules](#4-native-modules) — **HIGH**
   - 4.1 [Prefer Expo Modules Over Native Code](#41-prefer-expo-modules-over-native-code)
   - 4.2 [Use Development Builds for Custom Native Code](#42-use-development-builds-for-custom-native-code)
   - 4.3 [Use Config Plugins for Native Config](#43-use-config-plugins-for-native-config)
5. [EAS Updates](#5-eas-updates) — **MEDIUM**
   - 5.1 [Understand Update Manifests](#51-understand-update-manifests)
   - 5.2 [Plan Rollback Strategies](#52-plan-rollback-strategies)
   - 5.3 [Use Emergency Updates Wisely](#53-use-emergency-updates-wisely)
6. [Development](#6-development) — **MEDIUM**
   - 6.1 [Clear Cache When Needed](#61-clear-cache-when-needed)
   - 6.2 [Clean Prebuild Folder](#62-clean-prebuild-folder)
   - 6.3 [Use Expo Debugging Tools](#63-use-expo-debugging-tools)
7. [Assets](#7-assets) — **LOW**
   - 7.1 [Use Remote Bundles for Large Assets](#71-use-remote-bundles-for-large-assets)
   - 7.2 [Optimize Images and Fonts](#72-optimize-images-and-fonts)

---

## 1. Expo Router

**Impact: CRITICAL**

Expo Router patterns for file-based routing, navigation, and linking.

### 1.1 Use Named Exports for Screens

**Impact: CRITICAL (required for Expo Router)**

Expo Router requires screens to use named exports (`export default function ScreenName()`).
Named exports enable proper static analysis for routing, TypeScript inference,
and file-based navigation.

**Incorrect: default export expression**

```tsx
// app/home.tsx
const HomeScreen = () => <View><Text>Home</Text></View>
export default HomeScreen
```

**Incorrect: default export of component definition**

```tsx
// app/home.tsx
export default function() {
  return <View><Text>Home</Text></View>
}
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

**Correct: with typed params**

```tsx
// app/profile/[id].tsx
import { useLocalSearchParams } from 'expo-router'

type Params = { id: string }

export default function ProfileScreen() {
  const { id } = useLocalSearchParams<Params>()
  // id is properly typed
  return <View><Text>Profile: {id}</Text></View>
}
```

Named exports enable:
- TypeScript route parameter inference
- Static route generation
- Proper navigation autocomplete
- File-based route discovery

### 1.2 Prefer Static Params Over Dynamic

**Impact: HIGH (better performance, type safety)**

When possible, use static route parameters instead of dynamic lookups.
Static params are typed and enable better optimization.

**Incorrect: dynamic string concatenation**

```tsx
const profileId = 'user-123'
router.push(`/profile/${profileId}`)
// No type checking, runtime errors possible
```

**Incorrect: object-based navigation without typing**

```tsx
router.push({ pathname: '/profile', params: { id: '123' } })
// Params not typed
```

**Correct: static route with typed push**

```tsx
import { router } from 'expo-router'
import type { RouterOutputs } from '@/convex/_generated/api'

type ProfileParams = {
  screen: 'profile',
  params: { id: string }
}

router.push({
  pathname: '/profile/[id]',
  params: { id: 'user-123' }
} satisfies ProfileParams)
```

**Correct: use typed navigation helpers**

```tsx
// Create typed navigation helper
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

### 1.3 Use expo-router Link Components

**Impact: MEDIUM (better accessibility, navigation consistency)**

Use `Link` from `expo-router` instead of `Pressable` with `router.push`.
Link components handle accessibility, deep linking, and navigation state properly.

**Incorrect: Pressable with router.push**

```tsx
import { Pressable } from 'react-native'
import { router } from 'expo-router'

function NavigationItem({ href, children }: { href: string; children: React.ReactNode }) {
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
import { Text } from 'react-native'

function NavigationItem({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href}>
      <Text>{children}</Text>
    </Link>
  )
}
```

**With styling:**

```tsx
<Link href="/profile" asChild>
  <Pressable style={styles.button}>
    <Text style={styles.text}>Go to Profile</Text>
  </Pressable>
</Link>
```

---

## 2. Config Plugins

**Impact: HIGH**

Patterns for configuring Expo apps with config plugins.

### 2.1 Use Typed Config Plugins

**Impact: MEDIUM (type safety, autocomplete)**

Use typed config plugins from `expo-config-plugins` to avoid runtime errors
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
import { ConfigPlugin, withAppBuildGradle } from '@expo/config-plugins'
import { withAndroidPermissions } from 'expo-config-plugins'

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

### 2.2 Let Expo Handle Autolinking

**Impact: HIGH (avoids manual native code)**

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

### 2.3 Use Local Plugins for App-Specific Config

**Impact: MEDIUM (keeps config organized, reusable)**

For app-specific native configuration, create local config plugins
instead of modifying native files directly.

**Incorrect: modifying Info.plist directly**

```xml
<!-- ios/YourApp/Info.plist - DON'T MODIFY DIRECTLY -->
<key>NSCameraUsageDescription</key>
<string>Allow camera access</string>
```

**Correct: local config plugin**

```tsx
// plugins/withCameraPermission.ts
import { ConfigPlugin, withInfoPlist } from '@expo/config-plugins'

const withCameraPermission: ConfigPlugin<{ message: string }> = (config, { message }) => {
  return withInfoPlist(config, (config) => {
    config.modResults.NSCameraUsageDescription = message
    return config
  })
}

export default withCameraPermission
```

```tsx
// app.config.ts
import withCameraPermission from './plugins/withCameraPermission'

export default {
  name: 'MyApp',
  plugins: [
    withCameraPermission({ message: 'Allow camera access for taking photos' })
  ]
}
```

---

## 3. Environment Variables

**Impact: HIGH**

Patterns for managing environment variables in Expo apps.

### 3.1 Use .env.local for Local Secrets

**Impact: HIGH (security, prevents secret leaks)**

Store local development secrets in `.env.local` (gitignored), not in `.env`.
`.env` should only contain non-sensitive defaults.

**Incorrect: secrets in .env (committed)**

```
# .env - DON'T COMMIT SECRETS
EXPO_PUBLIC_API_KEY=sk-1234567890abcdef
EXPO_PUBLIC_SECRET=super-secret-value
```

**Correct: defaults in .env, secrets in .env.local**

```
# .env - committed defaults
EXPO_PUBLIC_API_URL=https://api.example.com
EXPO_PUBLIC_ENVIRONMENT=development

# .env.local - gitignored, local secrets
EXPO_PUBLIC_API_KEY=sk-local-dev-key
```

**Correct: .env.example for documentation**

```
# .env.example - committed, shows what's needed
EXPO_PUBLIC_API_URL=https://api.example.com
EXPO_PUBLIC_API_KEY=your-api-key-here
```

### 3.2 Prefix Public Env Vars with EXPO_PUBLIC_

**Impact: CRITICAL (required for Expo)**

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

### 3.3 Use expo-constants for Env Vars

**Impact: MEDIUM (type safety, consistency)**

Use `expo-constants` to access environment variables instead of `process.env`.
This provides better TypeScript support and works consistently across platforms.

**Incorrect: process.env**

```tsx
const apiUrl = process.env.EXPO_PUBLIC_API_URL
// No type safety, could be undefined
```

**Correct: expo-constants with typing**

```tsx
import Constants from 'expo-constants'

interface EnvConfig {
  apiUrl: string
  apiKey: string
  environment: 'development' | 'staging' | 'production'
}

const env = Constants.expoConfig?.extra as EnvConfig

const apiUrl = env.apiUrl
const apiKey = env.apiKey
```

**With helper function:**

```tsx
import Constants from 'expo-constants'

function getEnv<K extends keyof EnvConfig>(key: K): EnvConfig[K] {
  const env = Constants.expoConfig?.extra as EnvConfig
  if (!env[key]) {
    throw new Error(`Missing environment variable: ${String(key)}`)
  }
  return env[key]
}

// Usage with autocomplete
const apiUrl = getEnv('apiUrl')
const apiKey = getEnv('apiKey')
```

---

## 4. Native Modules

**Impact: HIGH**

Patterns for working with native code in Expo apps.

### 4.1 Prefer Expo Modules Over Native Code

**Impact: HIGH (simpler, cross-platform, maintained)**

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

**Common Expo modules to use instead of custom native code:**

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

### 4.2 Use Development Builds for Custom Native Code

**Impact: HIGH (required for custom native code)**

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

### 4.3 Use Config Plugins for Native Config

**Impact: HIGH (cross-platform, maintainable)**

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

---

## 5. EAS Updates

**Impact: MEDIUM**

Patterns for managing over-the-air updates with EAS Update.

### 5.1 Understand Update Manifests

**Impact: MEDIUM (debugging, troubleshooting)**

EAS Update publishes JavaScript bundles that are loaded by your native build.
Understand what's included and excluded from updates.

**What CAN be updated:**
- JavaScript code
- Assets imported via `require` or `import`
- Expo modules that support updates

**What CANNOT be updated:**
- Native code changes
- New native modules (requires new build)
- Config plugin changes (requires new build)
- Major SDK version changes

**Correct: understand update flow**

```bash
# Publish an update
eas update --branch production --message "Fix navigation bug"

# Update metadata only (faster)
eas update --branch production --message "Update text"
```

**Check compatible native runtime:**

```tsx
import Constants from 'expo-constants'

// Check if update is available
const { runtimeVersion } = Constants.expoConfig!

console.log('Runtime version:', runtimeVersion)
```

### 5.2 Plan Rollback Strategies

**Impact: HIGH (production reliability)**

Always have a rollback strategy before pushing updates to production.
Test updates on a staging branch first.

**Correct: staging workflow**

```bash
# 1. Test on development
eas update --branch development --message "Test feature"

# 2. Promote to preview
eas update --branch preview --message "Preview feature"

# 3. Monitor for issues

# 4. Promote to production when ready
eas update --branch production --message "Release feature"
```

**Emergency rollback:**

```bash
# Rollback to previous update
eas update --branch production --message "Rollback"

# Or disable OTA updates entirely
eas update:configure --branch production --enable=false
```

### 5.3 Use Emergency Updates Wisely

**Impact: MEDIUM (avoid update churn)**

Emergency updates should be rare. Overuse can cause user fatigue
and battery drain from excessive downloads.

**Best practices:**

1. Test thoroughly before pushing to production
2. Batch changes into logical updates
3. Schedule updates during low-traffic periods
4. Monitor update success rates

**Correct: release schedule**

```bash
# Regular releases: weekly or bi-weekly
eas update --branch production --message "Weekly release"

# Emergency: critical bugs only
eas update --branch production --message "Emergency fix: crash on login"
```

---

## 6. Development

**Impact: MEDIUM**

Development workflow patterns for Expo apps.

### 6.1 Clear Cache When Needed

**Impact: MEDIUM (fixes weird issues)**

When experiencing strange build or runtime issues, clear the cache.
This fixes stale bundle caches, Metro issues, and prebuild artifacts.

**Clear all caches:**

```bash
# Clear Metro cache
npx expo start --clear

# Clear Expo cache
rm -rf .expo

# Clear prebuild
rm -rf android ios

# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**One-liner:**

```bash
npx expo start --clear && rm -rf .expo android ios
```

### 6.2 Clean Prebuild Folder

**Impact: MEDIUM (avoid merge conflicts)**

When working with prebuild, the `android/` and `ios/` folders are generated.
Clean them before running prebuild to avoid conflicts.

**Clean prebuild:**

```bash
# Remove generated folders
rm -rf android ios

# Regenerate with latest config
npx expo prebuild --clean
```

**When to clean prebuild:**

- After changing app.config.ts
- After adding/removing dependencies
- When experiencing build errors
- After changing config plugins

### 6.3 Use Expo Debugging Tools

**Impact: MEDIUM (faster debugging)**

Use Expo's built-in debugging tools instead of manual logging.

**Flipper with Expo Dev Tools:**

```tsx
// Enable flipper for React Native
// app.config.ts
export default {
  name: 'MyApp',
  plugins: [
    'expo-dev-client'
  ]
}
```

**Reactotron integration:**

```tsx
import { Reactotron } from 'reactotron-react-native'

if (__DEV__) {
  Reactotron.configure()
    .useReactNative()
    .connect()
}

// Use for debugging
Reactotron.log('Debug info', data)
```

**Expo DevTools in browser:**

- Open at http://localhost:8081 when using `expo start`
- View logs, component hierarchy, network requests

---

## 7. Assets

**Impact: LOW**

Asset management patterns for Expo apps.

### 7.1 Use Remote Bundles for Large Assets

**Impact: LOW (faster initial load)**

For large assets (videos, high-res images), use remote URLs instead of
bundling. This reduces app size and speeds up initial load.

**Incorrect: bundling large assets**

```tsx
// assets/large-video.mp4 - 50MB
import largeVideo from './assets/large-video.mp4'

<Video source={largeVideo} />
// Adds 50MB to app bundle
```

**Correct: remote URL**

```tsx
<Video
  source={{ uri: 'https://cdn.example.com/videos/large-video.mp4' }}
  resizeMode="contain"
/>
// App stays small, loads on demand
```

**Use expo-updates for remote asset caching:**

```tsx
import { Asset } from 'expo-asset'

async function loadRemoteAsset(uri: string) {
  const asset = await Asset.fromURI(uri).downloadAsync()
  return asset.localUri
}
```

### 7.2 Optimize Images and Fonts

**Impact: LOW (smaller bundle, faster load)**

Optimize images and fonts before adding to the app bundle.

**Image optimization:**

```tsx
// Use appropriate formats
// - JPEG for photos
// - PNG for graphics with transparency
// - WebP for best compression (iOS 14+, Android 4.0+)

// Use 2x/3x for retina displays
// image@2x.png, image@3x.png
```

**Font optimization:**

```tsx
// app.config.ts - use WOFF2 for fonts when possible
export default {
  name: 'MyApp',
  plugins: [
    [
      'expo-font',
      {
        fonts: [
          './assets/fonts/Geist-Regular.woff2', // Smaller than OTF/TTF
          './assets/fonts/Geist-Bold.woff2',
        ]
      }
    ]
  ]
}
```

---

## References

1. [Expo Router Documentation](https://docs.expo.dev/router/)
2. [Expo Config Plugins](https://docs.expo.dev/guides/config-plugins/)
3. [Expo Environment Variables](https://docs.expo.dev/guides/environment-variables/)
4. [Expo Modules](https://docs.expo.dev/modules/)
5. [EAS Updates](https://docs.expo.dev/eas-update/introduction/)
6. [Expo Development Builds](https://docs.expo.dev/develop/development-builds/introduction/)