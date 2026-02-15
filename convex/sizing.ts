import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { Doc } from "./_generated/dataModel";

type SizingResult = {
  peakSunHours: number;
  dailyDemandKwh: number;
  version: number; // For debugging
  sizingOptions: {
    moduleId: string;
    brand: string;
    model: string;
    pmax: number;
    price: number;
    panelsNeeded: number;
    totalCapacityKw: number;
    totalPrice: number;
  }[];
};

export const calculateSizing = action({
  args: {
    kitId: v.id("kits"),
  },
  handler: async (ctx, args): Promise<SizingResult> => {
    const kit: Doc<"kits"> | null = await ctx.runQuery(api.kits.getKitById, { id: args.kitId });
    if (!kit) throw new Error("Kit no encontrado.");
    
    if (!kit.monthlyConsumptionKwh || !kit.latitude || !kit.longitude) {
      throw new Error("El kit no tiene datos de consumo o ubicación para el cálculo.");
    }

    const allModules: Doc<"solar_modules">[] = await ctx.runQuery(api.modules.getModules, {});
    if (allModules.length === 0) throw new Error("No hay módulos solares en la base de datos.");

    const apiKey = process.env.PVWATTS_API_KEY;
    if (!apiKey) throw new Error("PVWATTS_API_KEY no configurada.");

    const params = new URLSearchParams({
      api_key: apiKey,
      lat: kit.latitude.toString(),
      lon: kit.longitude.toString(),
      system_capacity: "4",
      module_type: "0",
      losses: "14",
      array_type: "1",
      tilt: kit.latitude.toString(),
      azimuth: "180",
      format: "json",
    });
    
    const pvwattsResponse = await fetch(`https://developer.nrel.gov/api/pvwatts/v8.json?${params.toString()}`);
    if (!pvwattsResponse.ok) throw new Error(`Error API PVWatts: ${await pvwattsResponse.text()}`);
    
    const pvwattsData = await pvwattsResponse.json();
    const monthlyIrradiance = pvwattsData.outputs.solrad_monthly as number[];
    const peakSunHours = monthlyIrradiance.reduce((a, b) => a + b, 0) / monthlyIrradiance.length;

    const dailyDemandKwh = (kit.monthlyConsumptionKwh / 30) * 1.25;
    const performanceRatio = 0.85;

    const sizingOptions = allModules.map((module) => {
      const panelDailyProduction = (module.pmax / 1000) * peakSunHours * performanceRatio;
      const panelsNeeded = Math.ceil(dailyDemandKwh / panelDailyProduction);
      
      return {
        moduleId: module._id,
        brand: module.brand,
        model: module.model,
        pmax: module.pmax,
        price: module.price,
        panelsNeeded,
        totalCapacityKw: parseFloat(((panelsNeeded * module.pmax) / 1000).toFixed(2)),
        totalPrice: parseFloat((panelsNeeded * module.price).toFixed(2)),
      };
    });

    return {
      peakSunHours: parseFloat(peakSunHours.toFixed(2)),
      dailyDemandKwh: parseFloat(dailyDemandKwh.toFixed(2)),
      version: 2, // New version field
      sizingOptions,
    };
  },
});
