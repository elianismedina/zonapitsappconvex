import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getInverters = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("inverters").collect();
  },
});

export const getInverterById = query({
  args: { id: v.id("inverters") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const createInverter = mutation({
  args: {
    brand: v.string(),
    model: v.string(),
    type: v.string(),
    power: v.number(),
    efficiency: v.optional(v.number()),
    price: v.number(),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    return await ctx.db.insert("inverters", args);
  },
});

export const updateInverter = mutation({
  args: {
    id: v.id("inverters"),
    brand: v.optional(v.string()),
    model: v.optional(v.string()),
    type: v.optional(v.string()),
    power: v.optional(v.number()),
    efficiency: v.optional(v.number()),
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

export const deleteInverter = mutation({
  args: { id: v.id("inverters") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    await ctx.db.delete(args.id);
  },
});

export const bulkCreateInverters = mutation({
  args: {
    inverters: v.array(
      v.object({
        brand: v.string(),
        model: v.string(),
        type: v.string(),
        power: v.number(),
        efficiency: v.optional(v.number()),
        price: v.number(),
        imageUrl: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    for (const item of args.inverters) {
      await ctx.db.insert("inverters", item);
    }
    return args.inverters.length;
  },
});
