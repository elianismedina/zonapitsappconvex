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
    category: v.union(
      v.literal("Protección para Corriente Directa"),
      v.literal("Proteccion para Corriente Alterna"),
    ),
    subcategory: v.union(
      v.literal("Fusibles"),
      v.literal("Interruptores Termomagnéticos"),
      v.literal("Cajas combinadoras"),
      v.literal("Supresores de picos"),
      v.literal("Puesta a tierra"),
      v.literal("Interruptores automáticos"),
      v.literal("Interruptores de falla por arco"),
    ),
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
    category: v.optional(
      v.union(
        v.literal("Protección para Corriente Directa"),
        v.literal("Proteccion para Corriente Alterna"),
      ),
    ),
    subcategory: v.optional(
      v.union(
        v.literal("Fusibles"),
        v.literal("Interruptores Termomagnéticos"),
        v.literal("Cajas combinadoras"),
        v.literal("Supresores de picos"),
        v.literal("Puesta a tierra"),
        v.literal("Interruptores automáticos"),
        v.literal("Interruptores de falla por arco"),
      ),
    ),
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
        category: v.union(
          v.literal("Protección para Corriente Directa"),
          v.literal("Proteccion para Corriente Alterna"),
        ),
        subcategory: v.union(
          v.literal("Fusibles"),
          v.literal("Interruptores Termomagnéticos"),
          v.literal("Cajas combinadoras"),
          v.literal("Supresores de picos"),
          v.literal("Puesta a tierra"),
          v.literal("Interruptores automáticos"),
          v.literal("Interruptores de falla por arco"),
        ),
        rating: v.string(),
        price: v.number(),
        imageUrl: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    let createdCount = 0;
    for (const item of args.protections) {
      const existing = await ctx.db
        .query("protections")
        .filter((q) => q.eq(q.field("name"), item.name))
        .first();

      if (!existing) {
        await ctx.db.insert("protections", item);
        createdCount++;
      }
    }
    return createdCount;
  },
});
