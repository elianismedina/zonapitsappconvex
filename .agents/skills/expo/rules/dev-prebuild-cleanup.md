---
title: Clean Prebuild Folder
impact: MEDIUM
impactDescription: avoids merge conflicts, keeps native folders clean
tags: dev, prebuild, native
---

## Clean Prebuild Folder

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

**Note:** Never commit android/ or ios/ when using prebuild.
They should always be regenerated from config.

Reference: [Expo Prebuild](https://docs.expo.dev/workflow/prebuild/)