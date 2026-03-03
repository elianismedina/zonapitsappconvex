/** @type {import('tailwindcss').Config} */
module.exports = {
  // Overriding content as it's now handled by @source in global.css
  content: [],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
};
