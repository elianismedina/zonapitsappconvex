import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getModules = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("solar_modules").collect();
  },
});

export const getModuleById = query({
  args: { id: v.id("solar_modules") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const createModule = mutation({
  args: {
    brand: v.string(),
    model: v.string(),
    price: v.number(),
    imageUrl: v.optional(v.string()),
    pmax: v.number(),
    vmp: v.number(),
    imp: v.number(),
    voc: v.number(),
    isc: v.number(),
    efficiency: v.number(),
    weight: v.number(),
    dimensions: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    return await ctx.db.insert("solar_modules", args);
  },
});

export const updateModule = mutation({
  args: {
    id: v.id("solar_modules"),
    brand: v.optional(v.string()),
    model: v.optional(v.string()),
    price: v.optional(v.number()),
    imageUrl: v.optional(v.string()),
    pmax: v.optional(v.number()),
    vmp: v.optional(v.number()),
    imp: v.optional(v.number()),
    voc: v.optional(v.number()),
    isc: v.optional(v.number()),
    efficiency: v.optional(v.number()),
    weight: v.optional(v.number()),
    dimensions: v.optional(v.string()),
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

export const deleteModule = mutation({
  args: { id: v.id("solar_modules") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    await ctx.db.delete(args.id);
  },
});

export const bulkCreateModules = mutation({
  args: {
    modules: v.array(
      v.object({
        brand: v.string(),
        model: v.string(),
        price: v.number(),
        imageUrl: v.optional(v.string()),
        pmax: v.number(),
        vmp: v.number(),
        imp: v.number(),
        voc: v.number(),
        isc: v.number(),
        efficiency: v.number(),
        weight: v.number(),
        dimensions: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    // You might want to add an admin check here later
    // const identity = await ctx.auth.getUserIdentity();
    // if (!isAdmin(identity)) throw new Error("Unauthorized");

    for (const mod of args.modules) {
      await ctx.db.insert("solar_modules", mod);
    }
    return args.modules.length;
  },
});
