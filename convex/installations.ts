import { v } from "convex/values";
import { query } from "./_generated/server";

export const getInstallationById = query({
  args: { id: v.id("installations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
