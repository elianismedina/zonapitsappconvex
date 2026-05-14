module.exports = function (api) {
  api.cache(true);

  return {
    presets: ["babel-preset-expo"],

    plugins: [
      ["nativewind/babel", { input: "./global.css" }],
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
      "react-native-worklets/plugin",
    ],
  };
};
