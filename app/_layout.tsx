// --- TEMP SAFETY POLYFILL FOR WEB-ONLY LIBS ---
if (typeof globalThis.window === "undefined") {
  // @ts-ignore
  globalThis.window = {};
}

// @ts-ignore
if (typeof window.addEventListener !== "function") {
  // @ts-ignore
  window.addEventListener = () => {};
  // @ts-ignore
  window.removeEventListener = () => {};
}

import {
  ClerkLoaded,
  ClerkProvider,
  useAuth,
  useUser,
} from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
  unsavedChangesWarning: false,
});

const InitialLayout = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const segments = useSegments();
  const router = useRouter();


  useEffect(() => {
    if (!isLoaded) return;

    const inTabsGroup = segments[0] === "(auth)";

    if (isSignedIn && !inTabsGroup) {
      router.replace("/feed");
    } else if (!isSignedIn && inTabsGroup) {
      router.replace("/");
    }
   }, [isSignedIn, isLoaded, router, segments]);

  return <Slot />;
};

const RootLayoutNav = () => {
  return (
    <ClerkProvider
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}
      tokenCache={tokenCache}
    >
      <ClerkLoaded>
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          <InitialLayout />
        </ConvexProviderWithClerk>
      </ClerkLoaded>
    </ClerkProvider>
  );
};

export default RootLayoutNav;
