---
name: Validate Convex Integration
description: Validates Convex integration and best practices in the project, checking schema, authentication setup, and type generation.
---

# Validate Convex Integration

This skill validates the integration of Convex in the project, ensuring best practices and correct configuration are followed.

## Instructions

1.  **Check Convex Configuration Files**
    - Ensure `convex.json` or `convex.config.ts` exists in the root.
    - Check for `convex/schema.ts` defining the database schema.
    - Verify `convex/_generated` folder exists (indicating types are generated).

2.  **Verify Authentication Setup (Clerk + Convex)**
    - Check `app/_layout.tsx` or `app/index.tsx` for `ClerkProvider` and `ConvexProviderWithClerk`.
    - Ensure the `useAuth` hook from `@clerk/clerk-expo` is passed to `ConvexProviderWithClerk`.

3.  **Validate Schema Definition**
    - Read `convex/schema.ts`.
    - Ensure `defineSchema` and `defineTable` are imported from `convex/server`.
    - Verify tables have valid validators (e.g., `v.string()`, `v.number()`).

4.  **Check Backend Functions**
    - Scan `convex/` directory for `.ts` files (excluding `_generated` and `schema.ts`).
    - Ensure functions use `query`, `mutation`, or `action` wrappers.
    - Verify usage of `args` validator where appropriate.

5.  **Validate Frontend Usage**
    - Search for usages of `useQuery` and `useMutation` in `app/` and `components/`.
    - Ensure they import from `convex/react` (or a custom hook wrapper if one exists).
    - Check that query arguments match the expected schema types.

6.  **Run Validation Command (Optional)**
    - If `npx convex dev` is not running, suggest running it to regenerate types and validate schema against the live backend.
    - Propose running `npx tsc --noEmit` to catch type errors related to Convex schema mismatches.

## Usage

Use this skill whenever you need to:
- Debug issues related to data fetching or mutations.
- Verify that a new feature's database schema is correctly defined.
- Ensure authentication state is correctly propagated to Convex.
