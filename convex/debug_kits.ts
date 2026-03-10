import { query } from "./_generated/server";

export const getKitAnalysis = query({
  args: {},
  handler: async (ctx) => {
    const kits = await ctx.db.query("kits").collect();
    const result = [];

    for (const kit of kits) {
      const components = await ctx.db
        .query("kit_components")
        .withIndex("byKitId", (q) => q.eq("kitId", kit._id))
        .collect();

      const inverterComp = components.find((c) => c.type === "inverter");
      let inverter = null;
      if (inverterComp?.inverterId) {
        inverter = await ctx.db.get(inverterComp.inverterId);
      }

      result.push({
        kitName: kit.name,
        inverter: inverter
          ? {
              model: inverter.model,
              batteryVoltage: inverter.batteryVoltage,
            }
          : "No inverter",
        componentsTypes: components.map((c) => c.type),
      });
    }

    return result;
  },
});
