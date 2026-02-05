import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getCables = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("cables").collect();
  },
});

export const getCableById = query({
  args: { id: v.id("cables") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const createCable = mutation({
  args: {
    name: v.string(),
    type: v.string(),
    pricePerMeter: v.number(),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    return await ctx.db.insert("cables", args);
  },
});

export const updateCable = mutation({
  args: {
    id: v.id("cables"),
    name: v.optional(v.string()),
    type: v.optional(v.string()),
    pricePerMeter: v.optional(v.number()),
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

export const deleteCable = mutation({
  args: { id: v.id("cables") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    await ctx.db.delete(args.id);
  },
});

export const bulkCreateCables = mutation({
  args: {
    cables: v.array(
      v.object({
        name: v.string(),
        type: v.string(),
        pricePerMeter: v.number(),
        imageUrl: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    for (const item of args.cables) {
      await ctx.db.insert("cables", item);
    }
    return args.cables.length;
  },
});
