import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getKits = query({
  args: { userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    
    if (args.userId) {
      return await ctx.db
        .query("kits")
        .withIndex("byUserId", (q) => q.eq("userId", args.userId!))
        .collect();
    }

    if (identity) {
      const user = await ctx.db
        .query("users")
        .withIndex("byClerkId", (q) => q.eq("clerkId", identity.subject))
        .unique();

      if (user) {
        return await ctx.db
          .query("kits")
          .withIndex("byUserId", (q) => q.eq("userId", user._id))
          .collect();
      }
    }

    return [];
  },
});

export const getKitById = query({
  args: { id: v.id("kits") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const createKit = mutation({
  args: {
    name: v.string(),
    address: v.string(),
    latitude: v.number(),
    longitude: v.number(),
    capacity: v.optional(v.number()),
    status: v.string(),
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

    const kitId = await ctx.db.insert("kits", {
      userId: user._id,
      ...args,
    });

    return kitId;
  },
});

export const updateKit = mutation({
  args: {
    id: v.id("kits"),
    name: v.optional(v.string()),
    address: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    capacity: v.optional(v.number()),
    status: v.optional(v.string()),
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

    const kit = await ctx.db.get(args.id);
    if (!kit) {
      throw new Error("Kit not found");
    }

    if (kit.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const deleteKit = mutation({
  args: { id: v.id("kits") },
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

    const kit = await ctx.db.get(args.id);
    if (!kit) {
      throw new Error("Kit not found");
    }

        if (kit.userId !== user._id) {

            throw new Error("Unauthorized");

        }

    

        await ctx.db.delete(args.id);

      },

    });

    

    export const generateUploadUrl = mutation(async (ctx) => {

      return await ctx.storage.generateUploadUrl();

    });

    

    export const addBillToKit = mutation({

      args: {

        storageId: v.id("_storage"),

        kitId: v.id("kits"),

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

    

        const kit = await ctx.db.get(args.kitId);

        if (!kit) {

          throw new Error("Kit not found");

        }

    

        if (kit.userId !== user._id) {

          throw new Error("Unauthorized");

        }

    

        await ctx.db.patch(args.kitId, {

          billStorageId: args.storageId,

        });

      },

    });

    
