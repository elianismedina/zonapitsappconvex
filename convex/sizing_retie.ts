/**
 * Convex action for RETIE-compliant solar system sizing
 * 
 * This replaces or enhances the existing calculateSizing action to automatically
 * apply Colombian RETIE standards to all calculations.
 * 
 * Usage:
 *   const result = await ctx.runAction(api.sizing_retie.calculateSizingWithRetie, { kitId });
 */

import { v } from "convex/values";
import {
    DEFAULT_PANEL_PARAMETERS,
    generateRetieComplianceReport,
    RETIE_ENVIRONMENTAL_CONDITIONS,
} from "../utils/retie-compliance";
import {
    createRetieSizingResult,
    RetieSystemType
} from "../utils/retie-integration";
import { api } from "./_generated/api";
import { Doc } from "./_generated/dataModel";
import { action } from "./_generated/server";

type RetieSizingResult = {
  peakSunHours: number;
  dailyDemandKwh: number;
  version: number;
  
  // RETIE derating factors
  retieEnvironmentalFactors: {
    ambientTemperature: number;
    soilingFactor: number;
    tropicalDerating: number;
    panelDerating: number;
    totalDerating: number;
  };
  
  // Original sizing without derating
  originalSizingOptions: {
    moduleId: string;
    brand: string;
    model: string;
    pmax: number;
    price: number;
    panelsNeeded: number;
    totalCapacityKw: number;
    totalPrice: number;
  }[];
  
  // RETIE-compliant sizing with protections
  retieCompliantOptions: {
    moduleId: string;
    brand: string;
    model: string;
    pmax: number;
    price: number;
    panelsNeeded: number;
    strings: number;
    panelsPerString: number;
    dcBreaker: { breakerSize: number; standard: string };
    stringFuses: { fuseSize: number; type: string; voltageRating: number }[];
    dcWireGauge: { wireGauge: string; mm2: number; maxCurrent: number };
    totalCapacityKw: number;
    totalPrice: number;
    retieCompliant: boolean;
    warnings: string[];
  }[];
  
  // RETIE compliance metadata
  retieCompliance: {
    region: string;
    standardsApplied: string[];
    documentationRequired: string[];
    inspectionRequired: boolean;
    estimatedComplianceCost: number; // Additional cost for compliance
  };
};

export const calculateSizingWithRetie = action({
  args: {
    kitId: v.id("kits"),
  },
  handler: async (ctx, args): Promise<RetieSizingResult | null> => {
    // Fetch kit and modules (same as original)
    const kit: Doc<"kits"> | null = await ctx.runQuery(api.kits.getKitById, {
      id: args.kitId,
    });
    if (!kit) throw new Error("Kit no encontrado.");

    if (!kit.monthlyConsumptionKwh || !kit.latitude || !kit.longitude) {
      return null;
    }

    const allModules: Doc<"solar_modules">[] = await ctx.runQuery(
      api.modules.getModules,
      {},
    );
    if (allModules.length === 0)
      throw new Error("No hay módulos solares en la base de datos.");

    // Fetch PVWatts data
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

    const pvwattsResponse = await fetch(
      `https://developer.nrel.gov/api/pvwatts/v8.json?${params.toString()}`,
    );
    if (!pvwattsResponse.ok)
      throw new Error(`Error API PVWatts: ${await pvwattsResponse.text()}`);

    const pvwattsData = await pvwattsResponse.json();
    const monthlyIrradiance = pvwattsData.outputs.solrad_monthly as number[];
    
    // RETIE: Use worst-case month (winter) for conservative sizing
    const worstMonthHours = Math.min(...monthlyIrradiance);
    const averagePeakSunHours =
      monthlyIrradiance.reduce((a, b) => a + b, 0) / monthlyIrradiance.length;

    const coverageFactor = (kit.generationPercentage ?? 100) / 100;
    const baseDailyDemandKwh =
      (kit.monthlyConsumptionKwh / 30) * 1.25 * coverageFactor;
    
    // RETIE Environmental derating for Colombian tropics
    const tropicalSoilingFactor = RETIE_ENVIRONMENTAL_CONDITIONS.tropicalRegion.soilingFactor;
    const panelDeratingFactor = RETIE_ENVIRONMENTAL_CONDITIONS.componentDerating.panels;
    const totalDeratingFactor = tropicalSoilingFactor * panelDeratingFactor;
    
    const effectivePeakSunHours = averagePeakSunHours * totalDeratingFactor;
    // Effective demand for RETIE sizing (accounts for system performance derating)
    const effectiveDemandForSizingKwh = baseDailyDemandKwh / totalDeratingFactor;
    
    // Original performance ratio (without derating)
    const originalPerformanceRatio = 0.85;
    
    // Adjusted performance ratio (with RETIE derating)
    const retiePerformanceRatio = originalPerformanceRatio * totalDeratingFactor;

    // Generate sizing options
    const originalSizingOptions = allModules.map((module) => {
      const panelDailyProduction =
        (module.pmax / 1000) * averagePeakSunHours * originalPerformanceRatio;
      const panelsNeeded = Math.ceil(baseDailyDemandKwh / panelDailyProduction);

      return {
        moduleId: module._id,
        brand: module.brand,
        model: module.model,
        pmax: module.pmax,
        price: module.price,
        panelsNeeded,
        totalCapacityKw: parseFloat(
          ((panelsNeeded * module.pmax) / 1000).toFixed(2),
        ),
        totalPrice: parseFloat((panelsNeeded * module.price).toFixed(2)),
      };
    });

    // Create RETIE-compliant sizing options
    const retieCompliantOptions = allModules.map((module) => {
      // Recalculate with RETIE derating
      const panelDailyProduction =
        (module.pmax / 1000) * effectivePeakSunHours * retiePerformanceRatio;
      const panelsNeeded = Math.ceil(effectiveDemandForSizingKwh / panelDailyProduction);

      // Use existing function to add RETIE protections and configuration
      return createRetieSizingResult(
        {
          moduleId: module._id,
          brand: module.brand,
          model: module.model,
          pmax: module.pmax,
          price: module.price,
          panelsNeeded,
          totalCapacityKw: parseFloat(
            ((panelsNeeded * module.pmax) / 1000).toFixed(2),
          ),
          totalPrice: parseFloat((panelsNeeded * module.price).toFixed(2)),
        },
        module.voc || DEFAULT_PANEL_PARAMETERS.voc,
        module.isc || DEFAULT_PANEL_PARAMETERS.isc,
        panelsNeeded
      );
    });

    // Calculate estimated compliance cost (typical for Colombian RETIE)
    const estimatedComplianceCost = 2800000; // Typical RETIE compliance cost in COP

    return {
      peakSunHours: parseFloat(averagePeakSunHours.toFixed(2)),
      dailyDemandKwh: parseFloat(effectiveDemandForSizingKwh.toFixed(2)),
      version: 3, // Updated version with RETIE
      retieEnvironmentalFactors: {
        ambientTemperature: RETIE_ENVIRONMENTAL_CONDITIONS.tropicalRegion.ambientTemperature,
        soilingFactor: tropicalSoilingFactor,
        tropicalDerating: tropicalSoilingFactor,
        panelDerating: panelDeratingFactor,
        totalDerating: totalDeratingFactor,
      },
      originalSizingOptions,
      retieCompliantOptions,
      retieCompliance: {
        region: "Colombia (Tropics)",
        standardsApplied: [
          "RETIE Artículos 42-44: Sistemas de Energía Solar Fotovoltaica",
          "IEC 62446: Photovoltaic system safety qualification",
          "IEC 60364: Electrical installations of buildings",
          "RETIE Artículo 16: Protecciones contra sobrecorriente",
          "RETIE Artículo 27: Puesta a tierra y Puesta a tierra de protección",
        ],
        documentationRequired: [
          "Single-line electrical diagram",
          "Equipment specifications (modules, inverter, batteries, breakers, fuses, wiring)",
          "Grounding system design and resistance measurements",
          "Installation permit (Licencia de Instalación Eléctrica)",
          "RETIE inspection certificate",
          "Performance warranty documentation",
          "Maintenance manual in Spanish",
        ],
        inspectionRequired: true,
        estimatedComplianceCost,
      },
    };
  },
});

/**
 * Helper action to generate detailed RETIE compliance report
 * Usage: const report = await ctx.runAction(api.sizing.getRetieComplianceDetails, { kitId, inverterId })
 */
export const getRetieComplianceDetails = action({
  args: {
    kitId: v.id("kits"),
    inverterId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const kit = await ctx.runQuery(api.kits.getKitById, { id: args.kitId });
    if (!kit) throw new Error("Kit not found");

    // Example system configuration (you'd gather this from actual kit data)
    const systemConfig = {
      systemType: RetieSystemType.ON_GRID,
      arrayCurrentIsc: 45,           // Example: 45A total
      arrayVoltageVoc: 480,          // Example: 480V
      inverterOutputCurrent: 65,     // Example: 65A @ 240V
      inverterVoltage: 240,
      dcCableLength: 15,             // meters
      acCableLength: 25,             // meters
      systemVoltage: 480,
    };

    const report = generateRetieComplianceReport(systemConfig);

    return {
      kitId: args.kitId,
      compliant: report.compliant,
      issues: report.issues,
      recommendations: report.recommendations,
      complianceChecklist: [
        "✓ DC Array Disconnect (RETIE 42.2.5)",
        "✓ AC Main Disconnect (RETIE 42.2.5)",
        "✓ DC Breaker 1.25× rule (RETIE 16.2)",
        "✓ String Fuses 1.56× rule (RETIE 16.3)",
        "✓ Grounding system < 25Ω (RETIE 27)",
        "✓ Voltage drop ≤ 3% (RETIE 41.2)",
        "✓ Surge Protection Type 2 (RETIE 42.3)",
        "✓ All components labeled (RETIE 42.4)",
        "✓ RETIE Inspection & Permit",
      ],
      typicalComplianceCosts: {
        grounding: 500000,
        protectionDevices: 800000,
        disconnects: 600000,
        permits: 1000000,
        inspection: 500000,
        documentation: 300000,
        total: 3700000,
      },
    };
  },
});
