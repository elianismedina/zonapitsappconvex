import { query } from "./_generated/server";

export const getVoltageInfo = query({
  args: {},
  handler: async (ctx) => {
    const inverters = await ctx.db.query("inverters").collect();
    const batteries = await ctx.db.query("batteries").collect();

    return {
      inverters: inverters.map((i) => ({
        brand: i.brand,
        model: i.model,
        batteryVoltage: i.batteryVoltage,
      })),
      batteries: batteries.map((b) => ({
        brand: b.brand,
        model: b.model,
        voltage: b.voltage,
      })),
    };
  },
});
