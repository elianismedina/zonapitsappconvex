# Graph Report - zonapitsexpoclerk  (2026-04-30)

## Corpus Check
- 156 files · ~134,855 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 256 nodes · 125 edges · 7 communities detected
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 9 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 20|Community 20]]

## God Nodes (most connected - your core abstractions)
1. `MainActivity` - 5 edges
2. `useThemeColor()` - 5 edges
3. `useColorScheme()` - 4 edges
4. `MainApplication` - 3 edges
5. `ParallaxScrollView()` - 3 edges
6. `handleUpdateQuantity()` - 2 edges
7. `runCheck()` - 2 edges
8. `runCheck()` - 2 edges
9. `handleConfirmSelection()` - 2 edges
10. `proceedWithSelection()` - 2 edges

## Surprising Connections (you probably didn't know these)
- `ThemedText()` --calls--> `useThemeColor()`  [INFERRED]
  components\themed-text.tsx → hooks\use-theme-color.ts
- `ThemedView()` --calls--> `useThemeColor()`  [INFERRED]
  components\themed-view.tsx → hooks\use-theme-color.ts
- `handleUpdateQuantity()` --calls--> `updateQuantity()`  [INFERRED]
  app\(auth)\(tabs)\mykits.tsx → app\(auth)\structure-selection\[kitId].tsx
- `runCheck()` --calls--> `checkBatteryBankCompatibility()`  [INFERRED]
  app\(auth)\battery-selection\[kitId].tsx → utils\solar-calculations.ts
- `runCheck()` --calls--> `checkInverterCompatibility()`  [INFERRED]
  app\(auth)\inverter-selection\[kitId].tsx → utils\solar-calculations.ts

## Communities

### Community 1 - "Community 1"
Cohesion: 0.17
Nodes (2): updateQuantity(), handleUpdateQuantity()

### Community 2 - "Community 2"
Cohesion: 0.18
Nodes (6): ParallaxScrollView(), ThemedText(), ThemedView(), GluestackUIProvider(), useColorScheme(), useThemeColor()

### Community 3 - "Community 3"
Cohesion: 0.22
Nodes (6): runCheck(), handleConfirmSelection(), proceedWithSelection(), runCheck(), checkBatteryBankCompatibility(), checkInverterCompatibility()

### Community 4 - "Community 4"
Cohesion: 0.33
Nodes (1): MainActivity

### Community 6 - "Community 6"
Cohesion: 0.4
Nodes (2): handleGetStarted(), setOnboardingSeen()

### Community 7 - "Community 7"
Cohesion: 0.5
Nodes (1): MainApplication

### Community 20 - "Community 20"
Cohesion: 1.0
Nodes (2): run(), seedTable()

## Knowledge Gaps
- **Thin community `Community 1`** (12 nodes): `[kitId].tsx`, `mykits.tsx`, `handleConfirmSelection()`, `updateQuantity()`, `handleDelete()`, `handleEdit()`, `handleRemoveAllOfType()`, `handleRemoveComponent()`, `handleRemoveInstallation()`, `handleSaveEdit()`, `handleSizing()`, `handleUpdateQuantity()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 4`** (6 nodes): `MainActivity.kt`, `MainActivity`, `.createReactActivityDelegate()`, `.getMainComponentName()`, `.invokeDefaultOnBackPressed()`, `.onCreate()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 6`** (6 nodes): `handleGetStarted()`, `handleScroll()`, `hasSeenOnboarding()`, `resetOnboarding()`, `setOnboardingSeen()`, `Onboarding.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 7`** (4 nodes): `MainApplication.kt`, `MainApplication`, `.onConfigurationChanged()`, `.onCreate()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 20`** (3 nodes): `seed-db.js`, `run()`, `seedTable()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Are the 4 inferred relationships involving `useThemeColor()` (e.g. with `ParallaxScrollView()` and `ThemedText()`) actually correct?**
  _`useThemeColor()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `useColorScheme()` (e.g. with `ParallaxScrollView()` and `GluestackUIProvider()`) actually correct?**
  _`useColorScheme()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `ParallaxScrollView()` (e.g. with `useThemeColor()` and `useColorScheme()`) actually correct?**
  _`ParallaxScrollView()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.14 - nodes in this community are weakly interconnected._