---
title: Use Remote Bundles for Large Assets
impact: LOW
impactDescription: faster initial load, smaller app bundle
tags: assets, performance, bundle-size
---

## Use Remote Bundles for Large Assets

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

**Guidelines:**

- Bundle: icons, small images (<100KB), essential fonts
- Remote: videos, high-res photos, downloadable content

Reference: [Expo Updates](https://docs.expo.dev/eas-update/introduction/)