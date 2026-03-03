module.exports = function (api) {
  api.cache(true);

  return {
    presets: [["babel-preset-expo"]],

    plugins: [
      [
        "module-resolver",
        {
          root: ["./"],

          alias: {
            "@": "./",
            "tailwind.config": "./tailwind.config.js",
            "tailwindcss/resolveConfig": "./tailwind-resolve-config-shim.js",
            nativewind: "./nativewind-shim.js",
          },
        },
      ],
      "react-native-worklets/plugin",
    ],
  };
};
