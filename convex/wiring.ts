import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getWiring = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("wiring").collect();
  },
});

export const getWiringById = query({
  args: { id: v.id("wiring") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const createWiring = mutation({
  args: {
    name: v.string(),
    brand: v.optional(v.string()),
    type: v.string(),
    pricePerMeter: v.number(),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    return await ctx.db.insert("wiring", args);
  },
});

export const updateWiring = mutation({
  args: {
    id: v.id("wiring"),
    name: v.optional(v.string()),
    brand: v.optional(v.string()),
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

export const deleteWiring = mutation({
  args: { id: v.id("wiring") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    await ctx.db.delete(args.id);
  },
});

export const bulkCreateWiring = mutation({
  args: {
    wiring: v.array(
      v.object({
        name: v.string(),
        brand: v.optional(v.string()),
        type: v.string(),
        pricePerMeter: v.number(),
        imageUrl: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    let createdCount = 0;
    for (const item of args.wiring) {
      const existing = await ctx.db
        .query("wiring")
        .filter((q) => q.eq(q.field("name"), item.name))
        .first();

      if (!existing) {
        await ctx.db.insert("wiring", item);
        createdCount++;
      }
    }
    return createdCount;
  },
});
