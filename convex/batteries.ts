import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getBatteries = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("batteries").collect();
  },
});

export const getBatteryById = query({
  args: { id: v.id("batteries") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const createBattery = mutation({
  args: {
    brand: v.string(),
    model: v.string(),
    capacity: v.number(),
    voltage: v.optional(v.number()),
    type: v.string(),
    price: v.number(),
    imageUrl: v.optional(v.string()),
    dimensions: v.optional(v.string()),
    weight: v.optional(v.string()),
    protectionIP: v.optional(v.string()),
    warranty: v.optional(v.string()),
    nominalCapacityAh: v.optional(v.number()),
    nominalEnergyWh: v.optional(v.number()),
    lifeCycles: v.optional(v.string()),
    recommendedChargeVoltage: v.optional(v.number()),
    chargeCurrent: v.optional(v.string()),
    endOfDischargeVoltage: v.optional(v.number()),
    dischargeCurrent: v.optional(v.string()),
    cutOffVoltage: v.optional(v.string()),
    operatingTemperature: v.optional(v.string()),
    storageTemperature: v.optional(v.string()),
    parallelModules: v.optional(v.string()),
    communication: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    return await ctx.db.insert("batteries", args);
  },
});

export const updateBattery = mutation({
  args: {
    id: v.id("batteries"),
    brand: v.optional(v.string()),
    model: v.optional(v.string()),
    capacity: v.optional(v.number()),
    voltage: v.optional(v.number()),
    type: v.optional(v.string()),
    price: v.optional(v.number()),
    imageUrl: v.optional(v.string()),
    dimensions: v.optional(v.string()),
    weight: v.optional(v.string()),
    protectionIP: v.optional(v.string()),
    warranty: v.optional(v.string()),
    nominalCapacityAh: v.optional(v.number()),
    nominalEnergyWh: v.optional(v.number()),
    lifeCycles: v.optional(v.string()),
    recommendedChargeVoltage: v.optional(v.number()),
    chargeCurrent: v.optional(v.string()),
    endOfDischargeVoltage: v.optional(v.number()),
    dischargeCurrent: v.optional(v.string()),
    cutOffVoltage: v.optional(v.string()),
    operatingTemperature: v.optional(v.string()),
    storageTemperature: v.optional(v.string()),
    parallelModules: v.optional(v.string()),
    communication: v.optional(v.string()),
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

export const deleteBattery = mutation({
  args: { id: v.id("batteries") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    await ctx.db.delete(args.id);
  },
});

export const bulkCreateBatteries = mutation({
  args: {
    batteries: v.array(
      v.object({
        brand: v.string(),
        model: v.string(),
        capacity: v.number(),
        voltage: v.optional(v.number()),
        type: v.string(),
        price: v.number(),
        imageUrl: v.optional(v.string()),
        dimensions: v.optional(v.string()),
        weight: v.optional(v.string()),
        protectionIP: v.optional(v.string()),
        warranty: v.optional(v.string()),
        nominalCapacityAh: v.optional(v.number()),
        nominalEnergyWh: v.optional(v.number()),
        lifeCycles: v.optional(v.string()),
        recommendedChargeVoltage: v.optional(v.number()),
        chargeCurrent: v.optional(v.string()),
        endOfDischargeVoltage: v.optional(v.number()),
        dischargeCurrent: v.optional(v.string()),
        cutOffVoltage: v.optional(v.string()),
        operatingTemperature: v.optional(v.string()),
        storageTemperature: v.optional(v.string()),
        parallelModules: v.optional(v.string()),
        communication: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    let createdCount = 0;
    for (const item of args.batteries) {
      const existing = await ctx.db
        .query("batteries")
        .filter((q) =>
          q.and(
            q.eq(q.field("brand"), item.brand),
            q.eq(q.field("model"), item.model),
          ),
        )
        .first();

      if (!existing) {
        await ctx.db.insert("batteries", item);
        createdCount++;
      }
    }
    return createdCount;
  },
});
