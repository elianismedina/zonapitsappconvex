import { internalMutation } from "./_generated/server";

export const inverter = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Check if it already exists to avoid duplicates
    const existing = await ctx.db
      .query("inverters")
      .filter((q) => q.eq(q.field("model"), "PV39-12048 TLV"))
      .first();

    if (!existing) {
      await ctx.db.insert("inverters", {
        brand: "MUST",
        model: "PV39-12048 TLV",
        type: "Off-Grid",
        power: 12000,
        efficiency: 0.95,
        price: 5663000,
        imageUrl:
          "https://res.cloudinary.com/dxa54qfxx/image/upload/v1772986332/Inverter12kwImage_krwcqa.png",
        nominalPower: 12000,
        maxPvPower: 10000,
        peakPower: 36000,
        nominalOutputVoltage: "240 Vac",
        waveForm: "Senoidal pura",
        frequency: 60,
        acInputVoltage: "220–240 Vac",
        batteryVoltage: 48,
        mpptChargeCurrent: 200,
        maxPvVoltage: 250,
      });
      return "Inverter added";
    }
    return "Inverter already exists";
  },
});
