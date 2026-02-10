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
import { Slot, useRouter, useSegments, useRootNavigationState } from "expo-router";
import * as SecureStore from "expo-secure-store";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'https://894b24504a7f28eca0337b206f56b0ed@o4510687339610112.ingest.us.sentry.io/4510863412690944',

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Enable Logs
  enableLogs: true,

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration(), Sentry.feedbackIntegration()],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

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
  const rootNavigationState = useRootNavigationState();

  useEffect(() => {
    if (!isLoaded || !rootNavigationState?.key) return;

    const inTabsGroup = segments[0] === "(auth)";

    if (isSignedIn && !inTabsGroup) {
      router.replace("/(auth)/(tabs)/feed");
    } else if (!isSignedIn && inTabsGroup) {
      router.replace("/(public)");
    }
  }, [isSignedIn, isLoaded, router, segments, rootNavigationState]);

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

  const [colorMode, setColorMode] = useState<"light" | "dark">("light");

  if (!fontsLoaded) {
    return null;
  }
  return (
    <GluestackUIProvider mode={colorMode}>
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

export default Sentry.wrap(RootLayoutNav);