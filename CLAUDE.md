# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Tech Stack

- **Framework**: React Native with Expo SDK 54
- **Language**: TypeScript (strict mode enabled)
- **Authentication**: Clerk (@clerk/clerk-expo) - frontend auth with Convex integration via webhook
- **Backend/Database**: Convex (queries, mutations, actions, and schema)
- **Routing**: Expo Router (file-based routing with route groups)
- **UI Components**: Gluestack UI v2 (@gluestack-ui/core)
- **Styling**: NativeWind v4 (Tailwind CSS for React Native) + Gluestack theming
- **Monitoring**: Sentry (@sentry/react-native) for error tracking and performance monitoring
- **Icons**: lucide-react-native, @expo/vector-icons

## Common Commands

```bash
# Start development server
npx expo start

# Run on iOS/Android simulators
npx expo start --ios
npx expo start --android

# Run on web
npx expo start --web

# Run development builds
expo run:ios
expo run:android

# Linting
expo lint

# Database seeding
npm run seed

# Convex development (syncs functions to backend)
npx convex dev
```

## Project Architecture

### App Structure (Expo Router)

- `app/_layout.tsx` - Root layout with ClerkProvider, ConvexProvider, Sentry, and auth navigation logic
- `app/(public)/` - Public routes (not authenticated)
  - `index.tsx` - Landing/sign-in page
  - `_layout.tsx` - Layout for public routes
- `app/(auth)/` - Authenticated routes (protected)
  - `(tabs)/` - Tab navigation (home, location, billupload, mykits, settings)
  - `_layout.tsx` - Layout with authentication check
  - Component selection flows:
    - `panel-selection/[kitId].tsx` - Solar panel selection for a kit
    - `panel-details/[panelId].tsx` - Solar panel detail view
    - `inverter-selection/[kitId].tsx` - Inverter selection for a kit
    - `inverter-details/[inverterId].tsx` - Inverter detail view
    - `battery-selection/[kitId].tsx` - Battery selection for a kit
    - `battery-details/[batteryId].tsx` - Battery detail view
    - `structure-selection/[kitId].tsx` - Mounting structure selection for a kit
    - `wiring-selection/[kitId].tsx` - Electrical wiring selection for a kit
    - `protection-selection/[kitId].tsx` - Protection device selection for a kit
    - `protection-details/[protectionId].tsx` - Protection device detail view
    - `installation-selection/[kitId].tsx` - Installation service selection for a kit
- `app/oauth-native-callback.tsx` - OAuth callback for native authentication

### Convex Backend

Located in `convex/` directory:

- `schema.ts` - Database schema defining tables: users, kits, solar_modules, inverters, batteries, structures, wiring, protections, installations, kit_components
- `auth.config.ts` - Clerk integration configuration
- `users.ts` - User CRUD operations
- `kits.ts` - Kit (solar installation) management
- `modules.ts` - Solar module operations
- `inverters.ts` - Inverter operations
- `batteries.ts` - Battery operations
- `structures.ts` - Mounting structure operations
- `wiring.ts` - Wiring operations
- `protections.ts` - Protection device operations
- `installations.ts` - Installation service operations and cost calculations
- `kit_components.ts` - Kit-component relationships
- `sizing.ts` - Solar system sizing calculations
- `actions.ts` - Server actions for AI bill processing
- `http.ts` - HTTP endpoint for Clerk webhooks
- `_generated/` - Auto-generated types from Convex schema (run `npx convex dev` to regenerate)

### UI Components

Use components from `components/ui/` (Gluestack UI) for consistent styling. Available components include: Button, Input, Text, Heading, Card, Modal, Alert, Avatar, Checkbox, Select, Menu, Toast, and more.

### Authentication Flow

1. Frontend uses Clerk for sign-in/sign-up
2. Clerk sends webhook to Convex (`convex/http.ts`) on user events
3. Convex creates/updates user in database via `clerkId` mapping
4. Auth state checks in `app/_layout.tsx` redirect between `(public)` and `(auth)` routes
5. ConvexProviderWithClerk bridges Clerk auth to Convex queries/mutations

### Styling Guidelines

- Use NativeWind classes (`className="..."`) for utility styling
- Use Gluestack UI components for consistent theming (dark/light mode support)
- CSS variables defined in `global.css` for color tokens (primary, secondary, tertiary, error, success, warning, info, typography, outline, background, indicator)
- Custom shadows: `hard-1` through `hard-5`, `soft-1` through `soft-4`

### Path Aliases

- `@/` points to project root (configured in `babel.config.js` and `tsconfig.json`)

## Environment Variables

Required in `.env.local`:

- `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk publishable key
- `EXPO_PUBLIC_CONVEX_URL` - Convex deployment URL
- `EXPO_PUBLIC_SENTRY_DSN` - Sentry DSN for error tracking
- `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` - Google Maps API key (iOS/Android)

## Data Models

Key Convex tables:

- **users**: clerkId, email, username, profile info
- **kits**: userId, location (lat/long), capacity, status, bill data, roof type, labor cost
- **solar_modules**: Solar panel specifications (brand, pmax, efficiency, etc.)
- **inverters**: Inverter specifications (type, power, efficiency)
- **batteries**: Battery specifications (capacity, voltage, type)
- **structures**: Mounting structures (roof, ground, carport)
- **wiring**: Electrical wiring (DC/AC types)
- **protections**: Protection devices with categories (DC/AC) and subcategories (fuses, breakers, surge protectors, grounding, arc fault breakers)
- **installations**: Installation service details (num installers, hours, rates, panel costs, total cost)
- **kit_components**: Junction table linking kits to components with quantities (includes installation as component type)

## Notes

- Keep awake errors are non-critical and can be ignored
- Typed routes are disabled (`typedRoutes: false` in `app.config.ts`)
- New Arch (Fabric/TurboModules) is enabled
- Sentry wraps the entire app (`app/_layout.tsx`) with mobile replay and feedback integration
- Custom splash screen implemented in `components/AnimatedSplashScreen.tsx`
- AI bill processing via Google AI in `convex/actions.ts` for extracting energy data from uploaded bills

<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read
`convex/_generated/ai/guidelines.md` first** for important guidelines on
how to correctly use Convex APIs and patterns. The file contains rules that
override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running
`npx convex ai-files install`.

<!-- convex-ai-end -->
