/**
 * NativeWind v4 shim
 * Re-exports all exports from nativewind properly
 */
const {
  verifyInstallation,
  createElement,
  useUnstableNativeVariables,
  unstable_styled,
  vars,
  cssInterop,
  remapProps,
  StyleSheet,
  rem,
  useColorScheme,
} = require("react-native-css-interop");

const { verifyInstallation: verifyInstallationDoctor } = require("./node_modules/nativewind/dist/doctor");
const { useColorScheme: useColorSchemeStylesheet } = require("./node_modules/nativewind/dist/stylesheet");

module.exports = {
  verifyInstallation,
  createElement,
  useUnstableNativeVariables,
  unstable_styled,
  vars,
  cssInterop,
  remapProps,
  StyleSheet,
  rem,
  useColorScheme: useColorSchemeStylesheet,
};
