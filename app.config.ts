import { ConfigContext, ExpoConfig } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "zonapitsexpoclerk",
  slug: "zonapitsexpoclerk",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/ic_launcher_foreground/ic_launcher_foreground_mdpi.png",
  scheme: "zonapitsexpoclerk",
  userInterfaceStyle: "automatic",
  jsEngine: "hermes",
  ios: {
    supportsTablet: true,
    icon: "./assets/images/ios_app_icon/iOS App Icon_1024pt@1x.png",
    config: {
      googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/ic_launcher_foreground/ic_launcher_foreground_mdpi.png",
      backgroundImage: "./assets/images/ic_launcher_background/ic_launcher_background_mdpi.png",
    },
    predictiveBackGestureEnabled: false,
    package: "com.elianismedina05.zonapitsexpoclerk",
    config: {
      googleMaps: {
        apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
      },
    },
  },
  web: {
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    [
      "expo-build-properties",
      {
        buildReactNativeFromSource: false,
        useHermesV1: false,
      },
    ],
    "expo-audio",
    [
      "expo-font",
      {
        fonts: [
          "./assets/fonts/sora/Sora-Thin.ttf",
          "./assets/fonts/sora/Sora-ExtraLight.ttf",
          "./assets/fonts/sora/Sora-Light.ttf",
          "./assets/fonts/sora/Sora-Regular.ttf",
          "./assets/fonts/sora/Sora-Medium.ttf",
          "./assets/fonts/sora/Sora-SemiBold.ttf",
          "./assets/fonts/sora/Sora-Bold.ttf",
          "./assets/fonts/sora/Sora-ExtraBold.ttf",
        ],
      },
    ],
    "expo-image",
    "expo-router",
    "expo-secure-store",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#ffffff",
        dark: {
          backgroundColor: "#000000",
        },
      },
    ],
    "expo-web-browser",
    "expo-asset",
    [
      "@sentry/react-native/expo",
      {
        url: "https://sentry.io/",
        project: "efisolar-kit",
        organization: "eficiencia-solar-del-caribe",
      },
    ],
    [
      "expo-location",
      {
        locationWhenInUsePermission:
          "Permitir que Efisolar Kit acceda a tu ubicación para facilitar la selección del lugar de instalación.",
      },
    ],
  ],
  experiments: {
    typedRoutes: false,
    reactCompiler: false,
  },
  extra: {
    router: {},
    eas: {
      projectId: "09f47f99-3276-4c41-910b-bf98371e83d4",
    },
  },
  runtimeVersion: {
    policy: "appVersion",
  },
  updates: {
    url: "https://u.expo.dev/09f47f99-3276-4c41-910b-bf98371e83d4",
    enableBsdiffPatchSupport: true,
  },
});
