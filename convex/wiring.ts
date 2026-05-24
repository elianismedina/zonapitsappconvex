import { v } from "convex/values";
import { api } from "./_generated/api";
import { action, mutation, query } from "./_generated/server";

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
    color: v.optional(v.string()),
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
    color: v.optional(v.string()),
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
        color: v.optional(v.string()),
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


/**
 * Calculate required wiring based on kit components and system configuration
 * This action queries the kit details, solar module, inverter, and battery specs,
 * then calculates the optimal wiring requirements
 */
export const calculateWiringRequirements = action({
  args: {
    kitId: v.id("kits"),
  },
  handler: async (ctx, args) => {
    // Fetch kit details
    const kit = await ctx.runQuery(api.kits.getKitById, { id: args.kitId });
    if (!kit) throw new Error("Kit not found");

    // Fetch kit components
    const components = (await ctx.runQuery(api.kit_components.getKitComponents, {
      kitId: args.kitId,
    })) as any[];

    // Find solar module
    const solarModuleComp = components.find((c: any) => c.type === "solar_module");
    if (!solarModuleComp || !solarModuleComp.details) {
      throw new Error("No solar module selected for this kit");
    }

    const panelCount = solarModuleComp.quantity;
    const panelSpecs = solarModuleComp.details as any;

    // Find inverter
    const inverterComp = components.find((c: any) => c.type === "inverter");
    if (!inverterComp || !inverterComp.details) {
      throw new Error("No inverter selected for this kit");
    }

    const inverterSpecs = inverterComp.details as any;
    const inverterPower = inverterSpecs.power || inverterSpecs.nominalPower || 5000;

    // Find battery (for off-grid/hybrid systems)
    const batteryComp = components.find((c: any) => c.type === "battery");
    const batteryVoltage = (batteryComp?.details as any)?.voltage || 48;

    // Determine system type
    const systemType = kit.type || "on-grid";

    // Import and use wiring calculation utility
    // (This would normally be imported, but for Convex we'll inline the basic calculation)
    const calculation = calculateBasicWiring(
      panelCount,
      panelSpecs.voc || 37.3,
      panelSpecs.isc || 11.8,
      inverterPower,
      systemType as "on-grid" | "off-grid" | "hybrid",
      batteryVoltage,
    );

    return calculation;
  },
});

/**
 * Helper function to calculate wiring (inline for Convex)
 */
function calculateBasicWiring(
  panelCount: number,
  panelVoc: number,
  panelIsc: number,
  inverterPower: number,
  systemType: "on-grid" | "off-grid" | "hybrid",
  batteryVoltage: number,
) {
  // Standard residential distances (meters)
  const dcDistance = 15; // Array to inverter
  const acDistance = 20; // Inverter to load/meter

  // Estimate string configuration (prefer longer strings)
  let strings = 1;
  let panelsPerString = panelCount;
  const maxVoltage = 600; // Typical residential DC limit

  for (let s = 1; s <= panelCount; s++) {
    const pps = Math.ceil(panelCount / s);
    const stringVoltage = pps * panelVoc * 1.15; // 15% cold weather factor

    if (stringVoltage <= maxVoltage) {
      strings = s;
      panelsPerString = pps;
      break;
    }
  }

  // DC wiring meters (both positive and negative cables)
  const dcSafetyMargin = 1.2; // 20% extra for routing
  const dcMetersPerRun = dcDistance * dcSafetyMargin;
  const dcTotalMeters = Math.ceil(dcMetersPerRun * 2); // Red + Black

  // AC wiring meters (phase + neutral)
  const acSafetyMargin = 1.2;
  const acMetersPerRun = acDistance * acSafetyMargin;
  const acTotalMeters = Math.ceil(acMetersPerRun * 2); // Phase + Neutral

  // Battery wiring (for off-grid/hybrid)
  let batteryMeters = 0;
  if (systemType !== "on-grid") {
    const batteryDistance = 5; // Standard battery room distance
    const batteryMetersPerRun = batteryDistance * dcSafetyMargin;
    batteryMeters = Math.ceil(batteryMetersPerRun * 2); // Pos + Neg
  }

  // Cable capacity table (mm² -> ampacity) from provided reference
  const gaugeTable = [
    { mm2: 4, capacity: 45 },
    { mm2: 6, capacity: 58 },
    { mm2: 10, capacity: 83 },
    { mm2: 16, capacity: 117 },
  ];

  // Currents
  const perStringIsc = panelIsc; // approx Isc per panel
  const totalDcCurrent = Math.ceil(strings * perStringIsc * 1.25); // include RETIE safety factor

  // Select smallest gauge that supports the required DC current
  const selectedDcGauge =
    gaugeTable.find((g) => g.capacity >= totalDcCurrent) ||
    gaugeTable[gaugeTable.length - 1];

  // AC side: estimate current using balanced three-phase assumption
  const phases = 3;
  const lineVoltage = 400; // default line-to-line voltage for 3-phase systems
  const acSafetyFactor = 1.25; // safety factor for sizing
  // Per-phase current for balanced 3-phase: I = P / (sqrt(3) * V_line)
  const perPhaseCurrent = Math.ceil((inverterPower / (Math.sqrt(3) * lineVoltage)) * acSafetyFactor);
  const totalAcCurrent = perPhaseCurrent;
  const selectedAcGauge =
    gaugeTable.find((g) => g.capacity >= totalAcCurrent) ||
    gaugeTable[gaugeTable.length - 1];

  const summary = `Sistema ${systemType} | ${panelCount} paneles en ${strings} string(s)`;

  return {
    panelCount,
    strings,
    panelsPerString,
    systemType,
    dcTotalMeters,
    acTotalMeters,
    batteryMeters,
    totalMeters: dcTotalMeters + acTotalMeters + batteryMeters,
    wiringPlan: {
      dc: {
        type: `DC ${selectedDcGauge.mm2}mm2`,
        meters: dcTotalMeters,
        ampacity: selectedDcGauge.capacity,
        mm2: selectedDcGauge.mm2,
        description: `Cableado DC (${dcTotalMeters}m total: rojo + negro) - Recomendado: ${selectedDcGauge.mm2} mm² (${selectedDcGauge.capacity} A)`,
      },
      ac: {
        type: `AC ${selectedAcGauge.mm2}mm2`,
        meters: acTotalMeters,
        ampacity: selectedAcGauge.capacity,
        mm2: selectedAcGauge.mm2,
        description: `Cableado AC (${acTotalMeters}m total: fase + neutro) - Recomendado: ${selectedAcGauge.mm2} mm² (${selectedAcGauge.capacity} A)`,
      },
      battery:
        systemType !== "on-grid"
          ? {
              type: `DC Battery ${selectedDcGauge.mm2}mm2`,
              meters: batteryMeters,
              ampacity: selectedDcGauge.capacity,
              mm2: selectedDcGauge.mm2,
              description: `Cableado de batería (${batteryMeters}m total: pos + neg) - Recomendado: ${selectedDcGauge.mm2} mm² (${selectedDcGauge.capacity} A)`,
            }
          : null,
    },
    summary,
  };
}
