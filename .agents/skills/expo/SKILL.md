---
name: expo-skills
description:
  Expo-specific best practices for building React Native apps with Expo SDK 54+.
  Use when working with Expo Router, Expo modules, config plugins, build configurations,
  or any Expo-specific APIs. Covers routing, config plugins, environment management,
  native modules, and Expo development workflows.
license: MIT
metadata:
  author: zonapits
  version: '1.0.0'
---

# Expo Skills

Expo-specific best practices for building React Native apps with Expo SDK. Contains
rules across multiple categories covering Expo Router, config plugins, build
configuration, native modules, and Expo development workflows.

## When to Apply

Reference these guidelines when:

- Building apps with Expo Router (file-based routing)
- Working with Expo config plugins (app.config.ts)
- Configuring native modules with Expo
- Setting up development builds and updates
- Managing environment variables with Expo
- Using Expo modules and APIs

## Rule Categories by Priority

| Priority | Category        | Impact   | Prefix        |
| -------- | --------------- | -------- | ------------- |
| 1        | Routing         | CRITICAL | `routing-`    |
| 2        | Config Plugins  | HIGH     | `config-`     |
| 3        | Environment     | HIGH     | `env-`        |
| 4        | Native Modules  | HIGH     | `native-`     |
| 5        | Updates         | MEDIUM   | `updates-`    |
| 6        | Development     | MEDIUM   | `dev-`        |
| 7        | Assets          | LOW      | `assets-`     |

## Quick Reference

### 1. Routing (CRITICAL)

- `routing-named-screens` - Use named exports for screens
- `routing-static-params` - Prefer static params over dynamic
- `routing-links` - Use expo-router Link components
- `navigation-native` - Use native navigators

### 2. Config Plugins (HIGH)

- `config-typesafe-plugins` - Use typed config plugins
- `config-plugin-autolinking` - Let Expo handle autolinking
- `config-local-plugin` - Use local plugins for app-specific config

### 3. Environment (HIGH)

- `env-dotenv-locally` - Use .env.local for local secrets
- `env-public-prefix` - Prefix public env vars with EXPO_PUBLIC_
- `env-no-process-env` - Use expo-constants for env vars

### 4. Native Modules (HIGH)

- `native-expo-modules` - Prefer Expo modules over native code
- `native-dev-client` - Use development builds for custom native code
- `native-config-plugins` - Use config plugins for native config

### 5. Updates (MEDIUM)

- `updates-manifest` - Understand update manifests
- `updates-rollback-strategy` - Plan rollback strategies
- `updates-emergency-fixes` - Use emergency updates wisely

### 6. Development (MEDIUM)

- `dev-cache-clear` - Clear cache when needed
- `dev-prebuild-cleanup` - Clean prebuild folder
- `dev-debugging` - Use Expo debugging tools

### 7. Assets (LOW)

- `assets-remote-bundles` - Use remote bundles for large assets
- `assets-optimization` - Optimize images and fonts

## How to Use

Read individual rule files for detailed explanations and code examples:

```
rules/routing-named-screens.md
rules/config-typesafe-plugins.md
```

Each rule file contains:

- Brief explanation of why it matters
- Incorrect code example with explanation
- Correct code example with explanation
- Additional context and references

## Full Compiled Document

For the complete guide with all rules expanded: `AGENTS.md`