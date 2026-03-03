const { withNativeWind } = require("nativewind/metro");
const { getSentryExpoConfig } = require("@sentry/react-native/metro");
const path = require("path");
const config = getSentryExpoConfig(__dirname);

config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  "tailwindcss/resolveConfig": path.resolve(
    __dirname,
    "./tailwind-resolve-config-shim.js",
  ),
  nativewind: path.resolve(__dirname, "./nativewind-shim.js"),
};

module.exports = withNativeWind(config, { input: "./global.css" });
