import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { internalMutation, mutation, query } from "./_generated/server";

export const getUserByClerkId = query({
  args: {
    clerkId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!args.clerkId) {
      return null;
    }

    const clerkId = args.clerkId;

    const user = await ctx.db
      .query("users")
      .withIndex("byClerkId", (q) => q.eq("clerkId", clerkId))
      .unique();

    if (!user?.imageUrl || user.imageUrl.startsWith("http")) {
      return user;
    }

    const url = await ctx.storage.getUrl(user.imageUrl as Id<"_storage">);

    return {
      ...user,
      imageUrl: url,
    };
  },
});

export const getUserById = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user?.imageUrl || user.imageUrl.startsWith("http")) {
      return user;
    }

    const url = await ctx.storage.getUrl(user.imageUrl as Id<"_storage">);

    return {
      ...user,
      imageUrl: url,
    };
  },
});

export const createUser = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    first_name: v.optional(v.string()),
    last_name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    username: v.optional(v.string()),
    followersCount: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("byClerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!existing) {
      const insertData: any = {
        clerkId: args.clerkId,
        email: args.email,
        followersCount: 0,
      };
      if (args.first_name !== undefined) insertData.first_name = args.first_name;
      if (args.last_name !== undefined) insertData.last_name = args.last_name;
      if (args.imageUrl !== undefined) insertData.imageUrl = args.imageUrl;
      if (args.username !== undefined) insertData.username = args.username;
      const userId = await ctx.db.insert("users", insertData);
      return userId;
    }
    return existing._id;
  },
});
