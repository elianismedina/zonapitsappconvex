module.exports = function (api) {
  api.cache(true);

  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],

    plugins: [
      [
        "module-resolver",
        {
          root: ["./"],

          alias: {
            "@": "./",
            "tailwind.config": "./tailwind.config.js",
            "tailwindcss/resolveConfig": "./tailwind-resolve-config-shim.js",
          },
        },
      ],
      "react-native-reanimated/plugin",
    ],
  };
};
