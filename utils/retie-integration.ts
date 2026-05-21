/**
 * RETIE Integration Layer for Solar System Sizing
 * 
 * This module integrates RETIE compliance checks into the existing
 * solar calculation pipeline (sizing.ts, solar-calculations.ts, and installation-calculations.ts)
 */

import {
    calculateRetieBreaker,
    calculateRetieGrounding,
    calculateRetieStringFuse,
    calculateRetieWireGauge,
    RETIE_ENVIRONMENTAL_CONDITIONS,
    RetieSystemType
} from './retie-compliance';
import { BatteryCompatibilityResult, CompatibilityResult } from './solar-calculations';

// Re-export RetieSystemType for convenience
export { RetieSystemType };

/**
 * Enhanced inverter compatibility result with RETIE compliance
 */
export interface RetieInverterCompatibility extends CompatibilityResult {
  retieCompliance: {
    acBreaker: { breakerSize: number; standard: string };
    acWireGauge: { wireGauge: string; mm2: number; maxCurrent: number; voltageDropPercent: number };
    acDisconnect: { rating: number; maxLoadCurrent: number };
    gridInterconnectRequired: boolean;
    warnings: string[];
    recommendations: string[];
  };
}

/**
 * Enhanced battery compatibility result with RETIE compliance
 */
export interface RetieBatteryCompatibility extends BatteryCompatibilityResult {
  retieCompliance: {
    dcBatteryDisconnect: { rating: number; voltageRating: number };
    dcBatteryWireGauge: { wireGauge: string; mm2: number };
    groundingRequired: boolean;
    temperatureDerate: number;
    daysOfAutonomyAfterDerating: number;
    warnings: string[];
  };
}

/**
 * RETIE-compliant sizing result
 */
export interface RetieSizingResult {
  // Original sizing data
  peakSunHours: number;
  dailyDemandKwh: number;
  
  // RETIE Environmental factors
  tropicalDerating: number;     // 0.92 for Colombian soiling
  temperatureDerating: number;  // Component-specific
  effectivePeakSunHours: number;
  adjustedDailyDemand: number;
  
  // RETIE-compliant sizing options
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
}

/**
 * RETIE Installation Calculation Result
 */
export interface RetieInstallationResult {
  systemType: RetieSystemType;
  numberOfDisconnects: number;
  groundingSystemCost: number;
  grounding: {
    conductorSize: string;
    rodQuantity: number;
    rodCost: number;
    conduitAndAccessories: number;
  };
  protectionDevices: {
    dcBreakers: number;
    dcFuses: number;
    acBreaker: number;
    surgeProtectors: number;
    arcFaultDetector: boolean;
  };
  documentation: {
    permitsAndInspections: number;
    singleLineDrawing: number;
    warrantyCertificate: number;
    total: number;
  };
  laborCostAdjustment: number; // % adjustment for RETIE compliance work
  totalRetieComplianceCost: number;
}

/**
 * Apply RETIE environmental derating to sizing calculations
 */
export function applyRetieEnvironmentalDerating(
  originalPeakSunHours: number,
  componentType: 'panels' | 'inverter' | 'battery' | 'wiring' = 'panels',
): number {
  const baseDerating = RETIE_ENVIRONMENTAL_CONDITIONS.tropicalRegion.soilingFactor; // 0.92
  const componentDerating = RETIE_ENVIRONMENTAL_CONDITIONS.componentDerating[componentType] || 0.95;
  
  return originalPeakSunHours * baseDerating * componentDerating;
}

/**
 * Add RETIE compliance to inverter compatibility results
 */
export function addRetieComplianceToInverter(
  compatibilityResult: CompatibilityResult,
  systemType: RetieSystemType,
  dcCableLength: number = 10, // meters
  acCableLength: number = 20, // meters
): RetieInverterCompatibility {
  const acCurrent = (compatibilityResult.constraints.power.value / 240) * 1000; // Assuming 240V AC
  
  const acBreaker = calculateRetieBreaker(acCurrent, 'ac');
  const acWireGauge = calculateRetieWireGauge(acCurrent, 240, acCableLength, 'ac');
  
  const warnings: string[] = [];
  const recommendations: string[] = [];
  
  // Check for issues
  if (!compatibilityResult.isCompatible) {
    warnings.push('Inverter not compatible with panel configuration. RETIE compliance cannot be assured.');
  }
  
  if (acWireGauge.voltageDropPercent > 3) {
    warnings.push(`AC voltage drop (${acWireGauge.voltageDropPercent.toFixed(2)}%) exceeds RETIE 3% limit`);
    recommendations.push(`Upgrade AC wire to larger gauge or reduce cable run length`);
  }
  
  if (systemType === RetieSystemType.ON_GRID) {
    recommendations.push('Grid interconnect disconnect required (RETIE 42.1.2)');
    recommendations.push('Request utility company approval before installation');
  }
  
  return {
    ...compatibilityResult,
    retieCompliance: {
      acBreaker,
      acWireGauge,
      acDisconnect: {
        rating: acBreaker.breakerSize,
        maxLoadCurrent: acCurrent,
      },
      gridInterconnectRequired: systemType === RetieSystemType.ON_GRID,
      warnings,
      recommendations,
    },
  };
}

/**
 * Add RETIE compliance to battery compatibility results
 */
export function addRetieComplianceToBattery(
  compatibilityResult: BatteryCompatibilityResult,
  arrayCurrentIsc: number,
  dcCableLength: number = 5, // meters
): RetieBatteryCompatibility {
  const temperatureDerate = RETIE_ENVIRONMENTAL_CONDITIONS.componentDerating.battery;
  const warnings: string[] = [];
  
  const dcBatteryWireGauge = calculateRetieWireGauge(
    compatibilityResult.optimalConfig?.daysOfAutonomy || 100,
    compatibilityResult.constraints.voltage.batteryVoltage,
    dcCableLength,
    'dc'
  );
  
  if (!compatibilityResult.isCompatible) {
    warnings.push('Battery not compatible with inverter. RETIE compliance cannot be assured.');
  }
  
  if (temperatureDerate < 0.9) {
    warnings.push('High temperature derating for batteries (40°C ambient). Consider additional cooling or oversizing.');
  }
  
  const adjustedDaysOfAutonomy = (compatibilityResult.optimalConfig?.daysOfAutonomy || 1) * temperatureDerate;
  
  return {
    ...compatibilityResult,
    retieCompliance: {
      dcBatteryDisconnect: {
        rating: Math.ceil((compatibilityResult.constraints.dischargeCurrent.requiredByInverter * 1.25)),
        voltageRating: compatibilityResult.constraints.voltage.batteryVoltage,
      },
      dcBatteryWireGauge,
      groundingRequired: true,
      temperatureDerate,
      daysOfAutonomyAfterDerating: adjustedDaysOfAutonomy,
      warnings,
    },
  };
}

/**
 * Create RETIE-compliant sizing result from standard sizing
 */
export function createRetieSizingResult(
  originalSizingOption: any,
  panelVoc: number,
  panelIsc: number,
  totalPanels: number,
): RetieSizingResult['retieCompliantOptions'][0] {
  // Apply Colombian environmental derating
  const tropicalDerating = RETIE_ENVIRONMENTAL_CONDITIONS.tropicalRegion.soilingFactor;
  const panelDerating = RETIE_ENVIRONMENTAL_CONDITIONS.componentDerating.panels;
  const effectiveDerating = tropicalDerating * panelDerating;
  
  // Recalculate panels needed with derating
  const adjustedPanelsNeeded = Math.ceil(originalSizingOption.panelsNeeded / effectiveDerating);
  
  // Determine string configuration (prefer longer strings to reduce current)
  let optimalStrings = 1;
  let panelsPerString = adjustedPanelsNeeded;
  
  // Try to optimize for RETIE limits (max 600V DC typical for residential)
  const maxVoltage = 600;
  const stringVoltageNeeded = panelsPerString * panelVoc * 1.15; // 15% cold derating
  
  if (stringVoltageNeeded > maxVoltage) {
    optimalStrings = Math.ceil((stringVoltageNeeded) / maxVoltage);
    panelsPerString = Math.ceil(adjustedPanelsNeeded / optimalStrings);
  }
  
  // Calculate protections
  const arrayIsc = optimalStrings * panelIsc;
  const dcBreaker = calculateRetieBreaker(arrayIsc, 'dc');
  const stringFuses = Array(optimalStrings).fill(null).map(() =>
    calculateRetieStringFuse(panelIsc)
  );
  
  const dcWireGauge = calculateRetieWireGauge(
    arrayIsc,
    panelsPerString * panelVoc * 1.15,
    10, // meters
    'dc'
  );
  
  const warnings: string[] = [];
  if (dcWireGauge.voltageDropPercent > 3) {
    warnings.push(`DC voltage drop exceeds RETIE 3% limit`);
  }
  
  return {
    moduleId: originalSizingOption.moduleId,
    brand: originalSizingOption.brand,
    model: originalSizingOption.model,
    pmax: originalSizingOption.pmax,
    price: originalSizingOption.price,
    panelsNeeded: adjustedPanelsNeeded,
    strings: optimalStrings,
    panelsPerString,
    dcBreaker,
    stringFuses,
    dcWireGauge,
    totalCapacityKw: parseFloat(((adjustedPanelsNeeded * originalSizingOption.pmax) / 1000).toFixed(2)),
    totalPrice: parseFloat((adjustedPanelsNeeded * originalSizingOption.price).toFixed(2)),
    retieCompliant: warnings.length === 0,
    warnings,
  };
}

/**
 * Calculate RETIE installation costs for grounding, disconnects, and documentation
 */
export function calculateRetieInstallationCosts(
  systemType: RetieSystemType,
  arrayCurrentIsc: number,
  laborCostPerHour: number = 20000, // Colombian pesos
): RetieInstallationResult {
  const grounding = calculateRetieGrounding(arrayCurrentIsc);
  
  // Costs in Colombian pesos (COP)
  const costEstimates = {
    groundingRod: 150000,           // per rod
    groundingConductor: 50000,      // for full run
    dcBreaker: 80000,
    acBreaker: 120000,
    stringFuse: 15000,
    acDisconnect: 150000,
    dcDisconnect: 120000,
    surgeProtector: 180000,
    arcFaultDetector: 400000,
    permitAndInspection: 800000,    // RETIE inspection required
    singleLineDrawing: 300000,      // Professional drawing
    warrantyCertificate: 200000,
    laborMultiplier: 1.25,          // 25% additional labor for RETIE compliance
  };
  
  // Number of protection devices
  const dcBreakersNeeded = 1;
  const dcFusesNeeded = 2; // Minimum 2 strings
  const acBreakerNeeded = 1;
  const surgeProtectorsNeeded = 2; // DC and AC
  const arcFaultDetectorNeeded = arrayCurrentIsc > 100;
  
  // Number of disconnects
  const dcDisconnects = 2; // Array + Battery (if hybrid)
  const acDisconnects = systemType === RetieSystemType.ON_GRID ? 2 : 1; // Main + Grid
  
  return {
    systemType,
    numberOfDisconnects: dcDisconnects + acDisconnects,
    groundingSystemCost:
      grounding.groundRodQuantity * costEstimates.groundingRod +
      costEstimates.groundingConductor,
    grounding: {
      conductorSize: grounding.groundingConductorSize,
      rodQuantity: grounding.groundRodQuantity,
      rodCost: grounding.groundRodQuantity * costEstimates.groundingRod,
      conduitAndAccessories: costEstimates.groundingConductor,
    },
    protectionDevices: {
      dcBreakers: dcBreakersNeeded * costEstimates.dcBreaker,
      dcFuses: dcFusesNeeded * costEstimates.stringFuse,
      acBreaker: acBreakerNeeded * costEstimates.acBreaker,
      surgeProtectors: surgeProtectorsNeeded * costEstimates.surgeProtector,
      arcFaultDetector: arcFaultDetectorNeeded ? costEstimates.arcFaultDetector : 0,
    } as any,
    documentation: {
      permitsAndInspections: costEstimates.permitAndInspection,
      singleLineDrawing: costEstimates.singleLineDrawing,
      warrantyCertificate: costEstimates.warrantyCertificate,
      total:
        costEstimates.permitAndInspection +
        costEstimates.singleLineDrawing +
        costEstimates.warrantyCertificate,
    },
    laborCostAdjustment: costEstimates.laborMultiplier,
    totalRetieComplianceCost:
      costEstimates.permitAndInspection +
      costEstimates.singleLineDrawing +
      costEstimates.warrantyCertificate +
      (dcBreakersNeeded * costEstimates.dcBreaker +
        dcFusesNeeded * costEstimates.stringFuse +
        acBreakerNeeded * costEstimates.acBreaker +
        surgeProtectorsNeeded * costEstimates.surgeProtector +
        (arcFaultDetectorNeeded ? costEstimates.arcFaultDetector : 0)) +
      costEstimates.groundingRod * grounding.groundRodQuantity +
      costEstimates.groundingConductor,
  };
}

/**
 * Generate a complete RETIE compliance checklist for the installation team
 */
export function generateRetieInstallationChecklist(systemType: RetieSystemType): string[] {
  const checklist = [
    '✓ RETIE Permit & Inspection (RETIE Artículo 42)',
    '✓ DC Array Disconnect installed (RETIE 42.2.5)',
    '✓ AC Main Disconnect installed (RETIE 42.2.5)',
    '✓ DC String Fuses (1.56× Isc per string) (RETIE 16.3)',
    '✓ DC Array Breaker (1.25× Isc total) (RETIE 16.2)',
    '✓ AC Output Breaker (1.25× Iout) (RETIE 16.2)',
    '✓ DC Surge Protector Type 2 (RETIE 42.3)',
    '✓ AC Surge Protector Type 2 (RETIE 42.3)',
    '✓ Grounding System installed & tested < 25Ω (RETIE 27)',
    '✓ Bonding of all metal frames to ground (RETIE 27.5)',
    '✓ DC Cable voltage drop ≤ 3% verified (RETIE 41.2)',
    '✓ AC Cable voltage drop ≤ 3% verified (RETIE 41.2)',
    '✓ Insulation resistance test > 1MΩ (RETIE)',
    '✓ All components labeled per RETIE 42.4',
    '✓ Single-line diagram documented',
    '✓ Equipment specifications recorded',
  ];
  
  if (systemType === RetieSystemType.OFF_GRID || systemType === RetieSystemType.HYBRID) {
    checklist.push(
      '✓ DC Battery Disconnect installed (RETIE 42.2.5)',
      '✓ Battery grounding verified (RETIE 27)',
      '✓ Battery charge current protection (RETIE 16)',
    );
  }
  
  if (systemType === RetieSystemType.ON_GRID) {
    checklist.push(
      '✓ Grid Interconnect Disconnect (RETIE 42.1.2)',
      '✓ Anti-islanding protection verified',
      '✓ Utility company approval obtained',
      '✓ Interconnection agreement signed',
    );
  }
  
  if (systemType === RetieSystemType.HYBRID) {
    checklist.push(
      '✓ Grid selector switch installed',
      '✓ Battery charge controller protection',
    );
  }
  
  return checklist;
}
