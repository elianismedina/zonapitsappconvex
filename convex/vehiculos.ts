import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getVehiculos = query({
  args: { userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    
    // If we have a specific userId request, return those vehicles
    if (args.userId) {
      return await ctx.db
        .query("vehiculos")
        .withIndex("byUserId", (q) => q.eq("userId", args.userId!))
        .collect();
    }

    // Otherwise, if authenticated, return the current user's vehicles
    if (identity) {
      const user = await ctx.db
        .query("users")
        .withIndex("byClerkId", (q) => q.eq("clerkId", identity.subject))
        .unique();

      if (user) {
        return await ctx.db
          .query("vehiculos")
          .withIndex("byUserId", (q) => q.eq("userId", user._id))
          .collect();
      }
    }

    return [];
  },
});

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

export const createVehiculo = mutation({
  args: {
    marca: v.string(),
    linea: v.string(),
    modelo: v.string(),
    year: v.number(),
    color: v.string(),
    combustible: v.string(),
    cilindrada: v.number(),
    transmision: v.string(),
    storageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("byClerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const vehiculoId = await ctx.db.insert("vehiculos", {
      userId: user._id,
      ...args,
    });

    return vehiculoId;
  },
});

export const updateVehiculo = mutation({
  args: {
    id: v.id("vehiculos"),
    marca: v.optional(v.string()),
    linea: v.optional(v.string()),
    modelo: v.optional(v.string()),
    year: v.optional(v.number()),
    color: v.optional(v.string()),
    combustible: v.optional(v.string()),
    cilindrada: v.optional(v.number()),
    transmision: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("byClerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const vehiculo = await ctx.db.get(args.id);
    if (!vehiculo) {
        throw new Error("Vehiculo not found");
    }

    if (vehiculo.userId !== user._id) {
        throw new Error("Unauthorized");
    }

    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const deleteVehiculo = mutation({
  args: { id: v.id("vehiculos") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("byClerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const vehiculo = await ctx.db.get(args.id);
    if (!vehiculo) {
        throw new Error("Vehiculo not found");
    }

    if (vehiculo.userId !== user._id) {
        throw new Error("Unauthorized");
    }

    await ctx.db.delete(args.id);
  },
});
