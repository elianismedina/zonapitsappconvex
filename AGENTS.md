# Opencode Instructions for This Project

## Project Overview
This is an Expo React Native app with Clerk authentication, using file-based routing with expo-router. The app includes sign-in, sign-up, and home pages with user management.

## Coding Rules and Standards
- **Language**: TypeScript is mandatory for all new code.
- **Linting**: Run `expo lint` after any code changes to ensure code quality.
- **Authentication**: Use Clerk for all authentication-related functionality.
- **Routing**: Use expo-router for navigation; do not use React Navigation directly.
- **UI Components**: Always use Native Base components from the components/ui folder for consistent styling and UI elements.
- **Styling**: Use Native Base's theming system for styling. Avoid direct React Native inline styles or StyleSheet objects unl.
- **Components**: Prefer functional components with hooks.
- **Error Handling**: Implement try-catch for async operations and provide user-friendly error messages.
- **Type Safety**: Ensure all props and state are properly typed.
- **Imports**: Use absolute imports with @/ alias for internal modules.
- **Commits**: Only commit when explicitly requested by the user.
- **Testing**: No automated tests are set up; manual testing is required.

## Project Structure
- `app/`: Contains route files (e.g., (auth)/sign-in.tsx, (home)/index.tsx).
- `components/`: Reusable components.
- `constants/`: Theme and other constants.
- `assets/`: Images and other assets.

## Dependencies
- Expo SDK 54
- React Native
- Clerk for auth
- expo-router for routing

## Common Issues
- Keep awake errors are non-critical and can be ignored.
- Ensure all routes are properly typed; disable typed routes if issues arise.

## Workflow
1. Make changes to code.
2. Run `expo lint` to check for errors.
3. Test on device/emulator.
4. Commit only when asked.