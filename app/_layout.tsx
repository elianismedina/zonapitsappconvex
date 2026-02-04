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

import { AnimatedSplashScreen } from "@/components/AnimatedSplashScreen";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import "@/global.css";
import { ClerkLoaded, ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useFonts } from "expo-font";
import { Slot, useRouter, useSegments } from "expo-router";
import * as SecureStore from "expo-secure-store";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const tokenCache = {
  async getToken(key: string) {
    try {
      const item = await SecureStore.getItemAsync(key);
      if (item) {
        console.log(`${key} was used 🔐 \n`);
      } else {
        console.log("No values stored under key: " + key);
      }
      return item;
    } catch (error) {
      console.error("SecureStore get item error: ", error);
      await SecureStore.deleteItemAsync(key);
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};

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

  if (!isLoaded) {
    return null;
  }

  return <Slot />;
};

const RootLayoutNav = () => {
  const [fontsLoaded, fontError] = useFonts({
    ...Ionicons.font,
  });
  const [isSplashFinished, setIsSplashFinished] = useState(false);

  useEffect(() => {
    if (fontError) throw fontError;
  }, [fontError]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GluestackUIProvider>
      <ClerkProvider
        publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}
        tokenCache={tokenCache}
      >
        <ClerkLoaded>
          <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
            <InitialLayout />
          </ConvexProviderWithClerk>
          {!isSplashFinished && (
            <AnimatedSplashScreen
              onReady={() => SplashScreen.hideAsync()}
              onAnimationFinish={() => setIsSplashFinished(true)}
            />
          )}
        </ClerkLoaded>
      </ClerkProvider>
    </GluestackUIProvider>
  );
};

export default RootLayoutNav;
