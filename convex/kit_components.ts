import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const addComponent = mutation({
  args: {
    kitId: v.id("kits"),
    type: v.union(
      v.literal("solar_module"),
      v.literal("inverter"),
      v.literal("battery"),
      v.literal("structure"),
      v.literal("cable"),
      v.literal("protection")
    ),
    solarModuleId: v.optional(v.id("solar_modules")),
    inverterId: v.optional(v.id("inverters")),
    batteryId: v.optional(v.id("batteries")),
    structureId: v.optional(v.id("structures")),
    cableId: v.optional(v.id("cables")),
    protectionId: v.optional(v.id("protections")),
    quantity: v.number(),
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

    // Validate that the correct ID is provided for the selected type
    if (args.type === "solar_module" && !args.solarModuleId) throw new Error("solarModuleId is required");
    if (args.type === "inverter" && !args.inverterId) throw new Error("inverterId is required");
    if (args.type === "battery" && !args.batteryId) throw new Error("batteryId is required");
    if (args.type === "structure" && !args.structureId) throw new Error("structureId is required");
    if (args.type === "cable" && !args.cableId) throw new Error("cableId is required");
    if (args.type === "protection" && !args.protectionId) throw new Error("protectionId is required");

    // Check if component already exists in kit (optional, depends on logic. usually we merge or add new row. let's add new row or update quantity if same component?)
    // For simplicity, we'll allow multiple entries or let the client handle it. 
    // But typically you'd check if this exact component is already added and just update quantity.
    // Let's implement "upsert" logic: find existing component of same type and ID, update quantity if found.
    
    let existing = null;
    const components = await ctx.db
      .query("kit_components")
      .withIndex("byKitId", (q) => q.eq("kitId", args.kitId))
      .filter((q) => q.eq(q.field("type"), args.type))
      .collect();

    // Manual filtering for the specific ID field
    if (args.type === "solar_module") existing = components.find(c => c.solarModuleId === args.solarModuleId);
    if (args.type === "inverter") existing = components.find(c => c.inverterId === args.inverterId);
    if (args.type === "battery") existing = components.find(c => c.batteryId === args.batteryId);
    if (args.type === "structure") existing = components.find(c => c.structureId === args.structureId);
    if (args.type === "cable") existing = components.find(c => c.cableId === args.cableId);
    if (args.type === "protection") existing = components.find(c => c.protectionId === args.protectionId);

    if (existing) {
        // Update quantity
        await ctx.db.patch(existing._id, { quantity: existing.quantity + args.quantity });
        return existing._id;
    } else {
        // Insert new
        return await ctx.db.insert("kit_components", {
            kitId: args.kitId,
            type: args.type,
            quantity: args.quantity,
            solarModuleId: args.solarModuleId,
            inverterId: args.inverterId,
            batteryId: args.batteryId,
            structureId: args.structureId,
            cableId: args.cableId,
            protectionId: args.protectionId,
        });
    }
  },
});

export const removeComponent = mutation({
  args: {
    id: v.id("kit_components"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    
    // We should ideally check kit ownership here too, but for speed let's assume if you have the ID you can delete, 
    // OR fetch the component -> get kit -> check user.
    const component = await ctx.db.get(args.id);
    if (!component) return; // Already deleted or doesn't exist

    const kit = await ctx.db.get(component.kitId);
    if (kit) {
        const user = await ctx.db
            .query("users")
            .withIndex("byClerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();
        if (user && kit.userId === user._id) {
             await ctx.db.delete(args.id);
        } else {
            throw new Error("Unauthorized");
        }
    }
  },
});

export const updateQuantity = mutation({
    args: {
        id: v.id("kit_components"),
        quantity: v.number(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const component = await ctx.db.get(args.id);
        if (!component) throw new Error("Component not found");

        const kit = await ctx.db.get(component.kitId);
        if (!kit) throw new Error("Kit not found");

        const user = await ctx.db.query("users").withIndex("byClerkId", q => q.eq("clerkId", identity.subject)).unique();
        if (!user || kit.userId !== user._id) throw new Error("Unauthorized");

        if (args.quantity <= 0) {
            await ctx.db.delete(args.id);
        } else {
            await ctx.db.patch(args.id, { quantity: args.quantity });
        }
    }
});

export const getKitComponents = query({
  args: { kitId: v.id("kits") },
  handler: async (ctx, args) => {
    const components = await ctx.db
      .query("kit_components")
      .withIndex("byKitId", (q) => q.eq("kitId", args.kitId))
      .collect();

    // Populate details
    const populatedComponents = await Promise.all(
      components.map(async (comp) => {
        let details = null;
        if (comp.type === "solar_module" && comp.solarModuleId) details = await ctx.db.get(comp.solarModuleId);
        if (comp.type === "inverter" && comp.inverterId) details = await ctx.db.get(comp.inverterId);
        if (comp.type === "battery" && comp.batteryId) details = await ctx.db.get(comp.batteryId);
        if (comp.type === "structure" && comp.structureId) details = await ctx.db.get(comp.structureId);
        if (comp.type === "cable" && comp.cableId) details = await ctx.db.get(comp.cableId);
        if (comp.type === "protection" && comp.protectionId) details = await ctx.db.get(comp.protectionId);

        return {
          ...comp,
          details,
        };
      })
    );

    return populatedComponents;
  },
});
