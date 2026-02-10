import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { Doc } from "./_generated/dataModel";

type SizingResult = {
  peakSunHours: number;
  dailyDemandKwh: number;
  sizingOptions: {
    module: {
      brand: string;
      model: string;
      pmax: number;
    };
    panelsNeeded: number;
    totalCapacityKw: number;
  }[];
};

// --- Main Action to Calculate System Sizing ---
export const calculateSizing = action({
  args: {
    kitId: v.id("kits"),
  },
  handler: async (ctx, args): Promise<SizingResult> => {
    // 1. Get Kit and Panel data from the database
    const kit: Doc<"kits"> | null = await ctx.runQuery(api.kits.getKitById, { id: args.kitId });
    if (!kit) {
      throw new Error("Kit no encontrado.");
    }
    if (!kit.monthlyConsumptionKwh || !kit.latitude || !kit.longitude) {
      throw new Error(
        "El kit no tiene datos de consumo o ubicación para el cálculo."
      );
    }

    const allModules: Doc<"solar_modules">[] = await ctx.runQuery(api.modules.getModules, {});
    if (allModules.length === 0) {
      throw new Error("No hay módulos solares en la base de datos para calcular.");
    }

    // 2. Get Peak Sun Hours (PSH) from PVWatts API
    const apiKey = process.env.PVWATTS_API_KEY;
    if (!apiKey) {
      throw new Error("La API Key de PVWatts (PVWATTS_API_KEY) no está configurada en las variables de entorno de Convex.");
    }

    // Construct PVWatts API URL
    const params = new URLSearchParams({
      api_key: apiKey,
      lat: kit.latitude.toString(),
      lon: kit.longitude.toString(),
      system_capacity: "4", // Dummy value, not used for solar radiation data
      module_type: "0", // Standard module
      losses: "14", // Standard losses
      array_type: "1", // Fixed open rack
      tilt: kit.latitude.toString(), // Tilt equals latitude is a good rule of thumb
      azimuth: "180", // South-facing
      format: "json",
    });
    const pvwattsUrl = `https://developer.nrel.gov/api/pvwatts/v8.json?${params.toString()}`;
    
    const pvwattsResponse = await fetch(pvwattsUrl);
    if (!pvwattsResponse.ok) {
      const errorText = await pvwattsResponse.text();
      throw new Error(`Error de la API de PVWatts: ${errorText}`);
    }
    const pvwattsData = await pvwattsResponse.json();

    // Calculate average PSH from monthly data
    const monthlyIrradiance = pvwattsData.outputs.solrad_monthly as number[];
    const avgDailyIrradiance = monthlyIrradiance.reduce((a, b) => a + b, 0) / monthlyIrradiance.length;
    const peakSunHours: number = avgDailyIrradiance; // kWh/m2/day is equivalent to PSH

    // 3. Calculate Energy Demand
    const dailyConsumptionKwh: number = kit.monthlyConsumptionKwh / 30;
    const dailyDemandWithMargin: number = dailyConsumptionKwh * 1.25; // 25% safety margin

    // 4. Calculate Panels Needed for each Module Type
    const performanceRatio = 0.85; // System efficiency factor
    const sizingResults = allModules.map((module: Doc<"solar_modules">) => {
      // Energy production per panel per day (in kWh)
      const panelDailyProduction = (module.pmax / 1000) * peakSunHours * performanceRatio;
      
      const panelsNeeded = Math.ceil(dailyDemandWithMargin / panelDailyProduction);
      const totalPrice = panelsNeeded * module.price; // Calculate total price

      return {
        module: {
            brand: module.brand,
            model: module.model,
            pmax: module.pmax,
            price: module.price, // Include price per panel
        },
        panelsNeeded: panelsNeeded,
        totalCapacityKw: parseFloat(((panelsNeeded * module.pmax) / 1000).toFixed(2)),
        totalPrice: parseFloat(totalPrice.toFixed(2)), // Include total price
      };
    });

    return {
        peakSunHours: parseFloat(peakSunHours.toFixed(2)),
        dailyDemandKwh: parseFloat(dailyDemandWithMargin.toFixed(2)),
        sizingOptions: sizingResults,
    };
  },
});
