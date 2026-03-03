const nativewind = require("./node_modules/nativewind/dist/commonjs/index.js");
const { styled } = nativewind;

/**
 * Compatibility shim for cssInterop in NativeWind v5 preview.
 * Since v5 has removed this side-effect based function, we provide
 * a version that at least prevents crashing.
 *
 * IMPORTANT: In NativeWind v5, components should ideally be wrapped
 * using 'styled(Component, mapping)' instead of using 'cssInterop'.
 */
function cssInterop(Component, mapping) {
  if (!Component) return;

  // Attach the mapping for potential use by custom transforms or debugging
  Component.$$cssInterop = mapping;

  // We can't easily patch the component to be "styled" in-place because
  // v5's 'styled' returns a HOC.
  // However, we can try to warn the developer or provide a minimal implementation.
  // console.warn(`cssInterop called for ${Component.displayName || Component.name}. In NativeWind v5, use 'styled' instead.`);
}

module.exports = {
  ...nativewind,
  cssInterop,
};
