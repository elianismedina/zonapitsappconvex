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
  - `(tabs)/` - Tab navigation (feed, create, garage, profile, search)
  - `_layout.tsx` - Layout with authentication check
- `app/oauth-native-callback.tsx` - OAuth callback for native authentication

### Convex Backend

Located in `convex/` directory:

- `schema.ts` - Database schema defining tables: users, kits, solar_modules, inverters, batteries, structures, cables, protections, kit_components
- `auth.config.ts` - Clerk integration configuration
- `users.ts` - User CRUD operations
- `kits.ts` - Kit (solar installation) management
- `modules.ts` - Solar module operations
- `inverters.ts` - Inverter operations
- `batteries.ts` - Battery operations
- `structures.ts` - Mounting structure operations
- `cables.ts` - Cable operations
- `protections.ts` - Protection device operations
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
- **kits**: userId, location (lat/long), capacity, status, bill data
- **solar_modules**: Solar panel specifications (brand, pmax, efficiency, etc.)
- **inverters**: Inverter specifications (type, power, efficiency)
- **batteries**: Battery specifications (capacity, voltage, type)
- **structures**: Mounting structures (roof, ground, carport)
- **cables**: Electrical cables (DC/AC types)
- **protections**: Protection devices (breakers, surge protectors)
- **kit_components**: Junction table linking kits to components with quantities

## Notes

- Keep awake errors are non-critical and can be ignored
- Typed routes are disabled (`typedRoutes: false` in `app.config.ts`)
- New Arch (Fabric/TurboModules) is enabled
- Sentry wraps the entire app (`app/_layout.tsx`) with mobile replay and feedback integration
- Custom splash screen implemented in `components/AnimatedSplashScreen.tsx`
- AI bill processing via Google AI in `convex/actions.ts` for extracting energy data from uploaded bills
