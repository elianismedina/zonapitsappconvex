import { AnimatedSplashScreen } from "@/components/AnimatedSplashScreen";
import { LoadingAnimation } from "@/components/LoadingAnimation";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import "@/global.css";
import { ClerkLoaded, ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import * as Sentry from "@sentry/react-native";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { isRunningInExpoGo } from "expo";
import { useFonts } from "expo-font";
import {
  Slot,
  useNavigationContainerRef,
  useRootNavigationState,
  useRouter,
  useSegments,
} from "expo-router";
import * as SecureStore from "expo-secure-store";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

// --- TEMP SAFETY POLYFILL FOR WEB-ONLY LIBS ---
if (typeof window === "undefined") {
  // @ts-ignore
  globalThis.window = globalThis.window || {};
}

// @ts-ignore
if (typeof window.addEventListener !== "function") {
  // @ts-ignore
  window.addEventListener = () => {};
  // @ts-ignore
  window.removeEventListener = () => {};
}

const navigationIntegration = Sentry.reactNavigationIntegration({
  enableTimeToInitialDisplay: !isRunningInExpoGo(),
});
// Sentry configuration
Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,
  attachScreenshot: true,
  debug: false,

  // Enable Logs
  enableLogs: true,
  tracesSampleRate: 1.0,
  _experiments: {
    profilesSampleRate: 1.0,
    replaysSessionSampleRate: 1.0,
    replaysOnErrorSampleRate: 1.0,
  },

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [
    Sentry.mobileReplayIntegration(),
    Sentry.feedbackIntegration(),
    navigationIntegration,
  ],

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
    } catch {
      return;
    }
  },
};
// Convex configuration
const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
  unsavedChangesWarning: false,
});
// Initial layout
const InitialLayout = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();
  const navigationRef = useNavigationContainerRef();

  // Register navigation container with Sentry
  useEffect(() => {
    if (navigationRef) {
      navigationIntegration.registerNavigationContainer(navigationRef);
    }
  }, [navigationRef]);
  // Handle navigation
  useEffect(() => {
    if (!isLoaded || !rootNavigationState?.key) return;

    const inTabsGroup = segments[0] === "(auth)";

    if (isSignedIn && !inTabsGroup) {
      router.replace("/(auth)/(tabs)/home");
    } else if (!isSignedIn && inTabsGroup) {
      router.replace("/(public)");
    }
  }, [isSignedIn, isLoaded, router, segments, rootNavigationState]);

  if (!isLoaded) {
    return <LoadingAnimation />;
  }

  return <Slot />;
};

// Root layout
const RootLayoutNav = () => {
  // Load fonts
  const [fontsLoaded, fontError] = useFonts({
    ...Ionicons.font,
    "Sora-Thin": require("../assets/fonts/sora/Sora-Thin.ttf"),
    "Sora-ExtraLight": require("../assets/fonts/sora/Sora-ExtraLight.ttf"),
    "Sora-Light": require("../assets/fonts/sora/Sora-Light.ttf"),
    "Sora-Regular": require("../assets/fonts/sora/Sora-Regular.ttf"),
    "Sora-Medium": require("../assets/fonts/sora/Sora-Medium.ttf"),
    "Sora-SemiBold": require("../assets/fonts/sora/Sora-SemiBold.ttf"),
    "Sora-Bold": require("../assets/fonts/sora/Sora-Bold.ttf"),
    "Sora-ExtraBold": require("../assets/fonts/sora/Sora-ExtraBold.ttf"),
  });
  // Splash screen state
  const [isSplashFinished, setIsSplashFinished] = useState(false);
  // Color mode state
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [colorMode, setColorMode] = useState<"light" | "dark">("light");

  // Handle font loading
  useEffect(() => {
    if (fontError) {
      console.error("Font loading error:", fontError);
    }
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Handle splash screen ready
  const onSplashReady = useCallback(() => {
    SplashScreen.hideAsync();
  }, []);

  // Handle splash screen finish
  const onSplashFinish = useCallback(() => {
    setIsSplashFinished(true);
  }, []);

  // Handle font loading error
  if (!fontsLoaded && !fontError) {
    return <LoadingAnimation />;
  }
  // Render root layout
  return (
    <SafeAreaProvider>
      <KeyboardProvider>
        <GluestackUIProvider mode={colorMode}>
          <StatusBar style="auto" />
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
                  onReady={onSplashReady}
                  onAnimationFinish={onSplashFinish}
                />
              )}
            </ClerkLoaded>
          </ClerkProvider>
        </GluestackUIProvider>
      </KeyboardProvider>
    </SafeAreaProvider>
  );
};

export default Sentry.wrap(RootLayoutNav);
