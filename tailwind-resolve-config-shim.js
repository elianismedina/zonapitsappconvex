// Shim for tailwindcss/resolveConfig which is missing in Tailwind v4
// This helps gluestack-ui components that still rely on this Tailwind v3 internal

module.exports = function resolveConfig(config) {
  // If the config has a theme, we try to use it, otherwise provide defaults
  const theme = (config && config.theme) || {};

  return {
    theme: {
      screens: theme.screens || {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },
      ...theme,
    },
  };
};

module.exports.default = module.exports;
