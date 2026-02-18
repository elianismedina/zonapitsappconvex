---
title: Clear Cache When Needed
impact: MEDIUM
impactDescription: fixes weird issues, stale bundle caches
tags: dev, cache, debugging
---

## Clear Cache When Needed

When experiencing strange build or runtime issues, clear the cache.
This fixes stale bundle caches, Metro issues, and prebuild artifacts.

**Clear Metro cache:**

```bash
npx expo start --clear
```

**Clear all caches:**

```bash
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

**When to clear cache:**

- Strange build errors that don't make sense
- Changes to config not taking effect
- Metro bundler hanging or serving old code
- After changing native dependencies

Reference: [Expo Troubleshooting](https://docs.expo.dev/more/troubleshooting/)