import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getProtections = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("protections").collect();
  },
});

export const getProtectionById = query({
  args: { id: v.id("protections") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const createProtection = mutation({
  args: {
    name: v.string(),
    type: v.string(),
    rating: v.string(),
    price: v.number(),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    return await ctx.db.insert("protections", args);
  },
});

export const updateProtection = mutation({
  args: {
    id: v.id("protections"),
    name: v.optional(v.string()),
    type: v.optional(v.string()),
    rating: v.optional(v.string()),
    price: v.optional(v.number()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const deleteProtection = mutation({
  args: { id: v.id("protections") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    await ctx.db.delete(args.id);
  },
});

export const bulkCreateProtections = mutation({
  args: {
    protections: v.array(
      v.object({
        name: v.string(),
        type: v.string(),
        rating: v.string(),
        price: v.number(),
        imageUrl: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    for (const item of args.protections) {
      await ctx.db.insert("protections", item);
    }
    return args.protections.length;
  },
});
