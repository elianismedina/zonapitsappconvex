import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getStructures = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("structures").collect();
  },
});

export const getStructureById = query({
  args: { id: v.id("structures") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const createStructure = mutation({
  args: {
    name: v.string(),
    type: v.string(),
    material: v.optional(v.string()),
    pricePerUnit: v.number(),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    return await ctx.db.insert("structures", args);
  },
});

export const updateStructure = mutation({
  args: {
    id: v.id("structures"),
    name: v.optional(v.string()),
    type: v.optional(v.string()),
    material: v.optional(v.string()),
    pricePerUnit: v.optional(v.number()),
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

export const deleteStructure = mutation({
  args: { id: v.id("structures") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    await ctx.db.delete(args.id);
  },
});

export const bulkCreateStructures = mutation({
  args: {
    structures: v.array(
      v.object({
        name: v.string(),
        type: v.string(),
        material: v.optional(v.string()),
        pricePerUnit: v.number(),
        imageUrl: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    for (const item of args.structures) {
      await ctx.db.insert("structures", item);
    }
    return args.structures.length;
  },
});
