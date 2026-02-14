import { defineConfig } from "convex/config";

export default defineConfig({
  // External packages that Convex doesn't bundle by default
  nodeExternal: [
    "svix",
    "dotenv",
  ],
});