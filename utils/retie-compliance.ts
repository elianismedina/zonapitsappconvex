/**
 * RETIE Compliance Calculator for Colombian Solar Installations
 * 
 * RETIE (Reglamento Técnico de Instalaciones Eléctricas) incorporates IEC 60364
 * and IEC 62446 standards adapted for Colombian conditions.
 * 
 * Key Resources:
 * - RETIE Artículos 42-44: Solar PV Systems
 * - Artículo 16: Protecciones contra sobrecorriente
 * - Artículo 18: Protecciones contra contacto eléctrico
 * - Artículo 27: Puesta a tierra (grounding)
 */

export enum RetieSystemType {
  ON_GRID = 'on_grid',           // Conexión a red (no requiere batería)
  OFF_GRID = 'off_grid',         // Sistema aislado (requiere batería)
  HYBRID = 'hybrid',             // Sistema híbrido (red + batería)
}

export enum ConnectionVoltage {
  LBT = 'lbt',   // Baja Tensión Trifásica (208-240V)
  LBM = 'lbm',   // Baja Tensión Monofásica (120-240V)
  MT = 'mt',     // Media Tensión (1-30kV) - Industrial
}

/**
 * RETIE Wire Gauge Table (IEC 60228 - Colombian adoption)
 * AWG to mm² conversion with current limits at 40°C ambient
 */
export const RETIE_WIRE_GAUGES = {
  // DC Wiring (PV Arrays) - Conservative limits for DC
  dc: {
    '10 AWG': { mm2: 5.26, maxCurrent: 50, voltage: 'DC' },
    '8 AWG': { mm2: 8.37, maxCurrent: 75, voltage: 'DC' },
    '6 AWG': { mm2: 13.3, maxCurrent: 110, voltage: 'DC' },
    '4 AWG': { mm2: 21.15, maxCurrent: 155, voltage: 'DC' },
    '2 AWG': { mm2: 33.62, maxCurrent: 215, voltage: 'DC' },
    '1 AWG': { mm2: 42.41, maxCurrent: 245, voltage: 'DC' },
    '1/0 AWG': { mm2: 53.48, maxCurrent: 290, voltage: 'DC' },
    '2/0 AWG': { mm2: 67.43, maxCurrent: 340, voltage: 'DC' },
    '3/0 AWG': { mm2: 85.01, maxCurrent: 390, voltage: 'DC' },
    '4/0 AWG': { mm2: 107.2, maxCurrent: 455, voltage: 'DC' },
  },
  // AC Wiring (Inverter to Panel/Load) - Higher limits for AC
  ac: {
    '12 AWG': { mm2: 3.31, maxCurrent: 20, voltage: 'AC' },
    '10 AWG': { mm2: 5.26, maxCurrent: 30, voltage: 'AC' },
    '8 AWG': { mm2: 8.37, maxCurrent: 50, voltage: 'AC' },
    '6 AWG': { mm2: 13.3, maxCurrent: 65, voltage: 'AC' },
    '4 AWG': { mm2: 21.15, maxCurrent: 100, voltage: 'AC' },
    '2 AWG': { mm2: 33.62, maxCurrent: 140, voltage: 'AC' },
    '1 AWG': { mm2: 42.41, maxCurrent: 165, voltage: 'AC' },
  },
};

/**
 * RETIE Protection Device Requirements (Artículo 16)
 * Breaker and fuse sizing rules
 */
export const RETIE_PROTECTION_RULES = {
  // RETIE Artículo 16.2: Sobrecorriente protection
  breaker: {
    dcArrayRating: 1.25,     // Breaker = 125% of max system current (Isc × # strings)
    acInverterRating: 1.25,  // Breaker = 125% of max inverter output current
    minRating: 1.0,          // But breaker must be ≤ 100% of conductor ampacity
    standardRatings: [15, 20, 25, 30, 40, 50, 60, 70, 80, 90, 100, 125, 150, 200],
  },
  // RETIE Artículo 16.3: DC fuses on each string
  dcStringFuse: {
    rating: 1.56,            // String fuse = 156% of string Isc (or use 150% for common practice)
    type: 'gG',              // General Purpose fuse (Colombian standard)
    minVoltageRating: 600,   // Minimum 600V for DC systems
  },
  // RETIE Artículo 44: AC disconnect and overcurrent protection
  acDisconnect: {
    rating: 1.25,            // 125% of inverter continuous output current
    maxLoadCurrent: 1.0,     // But ≤100% of conductor ampacity
  },
};

/**
 * RETIE Grounding Requirements (Artículo 27 & 42.3.4)
 * Earthing system for solar installations
 */
export const RETIE_GROUNDING = {
  // Resistance to earth (máximo permitido)
  maxGroundResistance: 25,   // 25 ohms (for solar systems in Colombia)
  
  // Ground rod dimensions (RETIE 27.2)
  groundRod: {
    material: 'copper',      // Cobre desnudo mínimo
    diameter: 13.8,          // 13.8mm (≈0.5")
    length: 2.4,             // 2.4 metros (8 feet) minimum
    quantity: 2,             // Mínimo 2 varillas (RETIE specific)
    spacing: 3,              // 3 metros de separación
  },
  
  // Grounding conductor sizing (based on PV array current)
  conductorSizing: {
    // If PV Isc ≤ 100A: use #6 AWG
    // If PV Isc 100-200A: use #4 AWG
    // If PV Isc > 200A: use #2 AWG or larger
    rule: 'Use ground conductor same size as or one size smaller than DC array conductors (minimum #6 AWG)',
  },
  
  // Equipment grounding continuity (RETIE 27.5)
  systemBonding: {
    description: 'All metal frames, conduits, inverter chassis must be bonded to ground bus',
    bonding_conductor_type: 'Green or bare copper',
    testing: 'Continuity <0.1 ohm between all bonded points',
  },
};

/**
 * RETIE Disconnection Requirements (Artículo 42.2.5)
 * Manual disconnects for maintenance and safety
 */
export const RETIE_DISCONNECTS = {
  // DC side disconnects
  dcArray: {
    type: 'DC Array Disconnect',
    location: 'Between PV array and charge controller/inverter input',
    rating: '125% of PV array short-circuit current',
    amperage: '600V DC minimum',
    mainFunction: 'Isolate array for maintenance and emergency',
  },
  
  dcBattery: {
    type: 'DC Battery Disconnect',
    required: true,
    location: 'Between battery bank and inverter/charger',
    rating: '125% of maximum charge/discharge current',
    amperage: '48V (or system voltage)',
    mainFunction: 'Emergency disconnect + maintenance isolation',
  },
  
  // AC side disconnects
  acInverter: {
    type: 'AC Disconnect (Main)',
    location: 'Inverter output to AC panel',
    rating: '125% of inverter continuous output current',
    amperage: '208/240V AC',
    mainFunction: 'Isolate inverter from loads and grid',
  },
  
  acGridInterconnect: {
    type: 'Grid Interconnect Disconnect',
    required: 'For grid-tied systems (RETIE 42.1.2)',
    location: 'Between inverter and utility meter',
    rating: '125% of inverter output current',
    function: 'Required by CFE for system isolation and anti-islanding',
  },
};

/**
 * RETIE Voltage Drop Limits (Artículo 41.2)
 * Adapted for tropical climate (higher ambient temps)
 */
export const RETIE_VOLTAGE_DROP = {
  // RETIE limits are stricter than NEC for solar
  dcArrayToInverter: 0.03,   // 3% maximum (IEC 62446)
  acInverterToMain: 0.03,    // 3% maximum
  acMainToUtility: 0.05,     // 5% total for on-grid systems
  dcSystemTotal: 0.05,       // 5% total DC side (combination rule)
  acSystemTotal: 0.08,       // 8% total AC side (combination rule)
  
  // Colombian climate factor: Add 10% derating for heat
  temperatureDerating: 0.90, // 10% reduction in current capacity at 40°C
};

/**
 * RETIE Safety Devices (Artículo 42.3)
 */
export const RETIE_SAFETY_DEVICES = {
  // Type 2 SPD on DC side (for transient overvoltages)
  dcSurgeProtector: {
    type: 'AC SPD (Type 2)',
    voltage: 600,
    location: 'Array disconnect to controller input',
    required: true,
  },
  
  // Type 2 SPD on AC side
  acSurgeProtector: {
    type: 'AC SPD (Type 2)',
    voltage: 'Same as system voltage',
    location: 'Inverter AC output',
    required: true,
  },
  
  // DC Arc Fault Detection (RETIE 42.3.3 - newer requirement)
  dcArcFault: {
    type: 'DC AFCI (if system > 100V)',
    required: 'For string monitoring',
    benefit: 'Detects series arc faults before they cause fires',
  },
};

/**
 * RETIE Labeling & Documentation (Artículo 42.4)
 */
export const RETIE_DOCUMENTATION = {
  arrayLabeling: {
    requirement: 'All strings must be labeled: "String 1", "String 2", etc.',
    location: 'At junction box and disconnect',
    content: 'String name, nominal voltage, maximum current (Isc)',
  },
  
  systemLabeling: {
    requirement: 'Main disconnect requires warning label',
    content: 'Voltage type (DC/AC), nominal voltage, max current, date installed',
  },
  
  recordsRequired: {
    items: [
      'Single-line electrical diagram',
      'Equipment specifications (panels, inverter, batteries, breakers, etc.)',
      'Grounding system design and resistance measurements',
      'String configuration diagram',
      'Installation permit (Licencia de Instalación)',
      'Inspection certificate (RETIE requires)',
      'Performance warranty documentation',
    ],
  },
};

/**
 * RETIE Environmental Conditions (Colombian specifics)
 * Artículo 42.1.1 - Climate derating factors
 */
// Default panel electrical parameters (typical crystalline Si panel)
export const DEFAULT_PANEL_PARAMETERS = {
  voc: 37.3,  // Volts open circuit
  isc: 11.8,  // Amps short circuit
};

export const RETIE_ENVIRONMENTAL_CONDITIONS = {
  tropicalRegion: {
    ambientTemperature: 40,      // °C - Colombian highlands
    altitude: 2600,              // meters (Bogotá reference)
    relativeHumidity: 80,        // % - High humidity = corrosion risk
    soilingFactor: 0.92,         // 8% derating for tropical dust
    uvExposure: 'Requires UV-resistant conduit and covers',
  },
  
  // Component derating for Colombian climate
  componentDerating: {
    panels: 0.94,                // -6% for temperature above 25°C
    inverter: 0.95,              // -5% deration at 40°C
    battery: 0.88,               // -12% for 40°C ambient (lithium)
    wiring: 0.90,                // 10% reduction in ampacity at 40°C
  },
};

/**
 * Calculate RETIE-compliant breaker size
 */
export function calculateRetieBreaker(
  systemCurrent: number,
  type: 'dc' | 'ac' = 'dc',
): { breakerSize: number; standard: string } {
  // RETIE Artículo 16.2: Breaker = 125% of max system current
  const derated = systemCurrent * RETIE_PROTECTION_RULES.breaker.dcArrayRating;
  const standardRatings = RETIE_PROTECTION_RULES.breaker.standardRatings;
  
  // Round up to next standard breaker size
  const breakerSize = standardRatings.find(rating => rating >= derated) || standardRatings[standardRatings.length - 1];
  
  return {
    breakerSize,
    standard: `RETIE Artículo 16.2 - 125% rule applied`,
  };
}

/**
 * Calculate RETIE-compliant string fuse size
 */
export function calculateRetieStringFuse(
  stringShortCircuitCurrent: number,
): { fuseSize: number; type: string; voltageRating: number } {
  // RETIE Artículo 16.3: String fuse = 156% of string Isc (or 150% practical)
  const fuseRating = stringShortCircuitCurrent * RETIE_PROTECTION_RULES.dcStringFuse.rating;
  
  // Common fuse sizes: 2A, 3A, 4A, 5A, 6A, 8A, 10A, 12A, 15A, 20A, 25A, 30A, 40A, 50A, 60A
  const standardFuses = [2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 25, 30, 40, 50, 60];
  const fuseSize = standardFuses.find(f => f >= fuseRating) || 60;
  
  return {
    fuseSize,
    type: RETIE_PROTECTION_RULES.dcStringFuse.type,
    voltageRating: RETIE_PROTECTION_RULES.dcStringFuse.minVoltageRating,
  };
}

/**
 * Calculate RETIE-compliant wire gauge for DC conductors
 */
export function calculateRetieWireGauge(
  current: number,
  voltage: number,
  length: number,
  type: 'dc' | 'ac' = 'dc',
): { wireGauge: string; mm2: number; maxCurrent: number; voltageDropPercent: number } {
  const wireTable = type === 'dc' ? RETIE_WIRE_GAUGES.dc : RETIE_WIRE_GAUGES.ac;
  const maxVoltDrop = type === 'dc' ? RETIE_VOLTAGE_DROP.dcArrayToInverter : RETIE_VOLTAGE_DROP.acInverterToMain;
  
  // Find wire gauge that supports the current (with temperature derating)
  const deeratedCurrent = current * RETIE_VOLTAGE_DROP.temperatureDerating;
  
  let selectedWire: [string, typeof wireTable[keyof typeof wireTable]] | null = null;
  for (const [gauge, specs] of Object.entries(wireTable)) {
    if (specs.maxCurrent >= deeratedCurrent) {
      selectedWire = [gauge, specs];
      break;
    }
  }
  
  if (!selectedWire) {
    // If no single wire works, pick the largest
    const entries = Object.entries(wireTable);
    selectedWire = entries[entries.length - 1];
  }
  
  // Calculate actual voltage drop
  const resistivity = type === 'dc' ? 0.0000172 : 0.0000172; // Copper at 20°C
  const resistance = (resistivity * length * 2) / (selectedWire[1].mm2 / 1000000);
  const voltageDrop = resistance * current;
  const voltageDropPercent = (voltageDrop / voltage) * 100;
  
  return {
    wireGauge: selectedWire[0],
    mm2: selectedWire[1].mm2,
    maxCurrent: selectedWire[1].maxCurrent,
    voltageDropPercent,
  };
}

/**
 * Calculate RETIE-compliant grounding system
 */
export function calculateRetieGrounding(
  arrayCurrentIsc: number,
): {
  groundingConductorSize: string;
  groundingConductorMm2: number;
  groundRodQuantity: number;
  maxGroundResistance: number;
  testingRequired: boolean;
} {
  let groundingConductor = '6 AWG';
  let groundingMm2 = 13.3;
  
  // RETIE sizing based on PV array current
  if (arrayCurrentIsc > 100 && arrayCurrentIsc <= 200) {
    groundingConductor = '4 AWG';
    groundingMm2 = 21.15;
  } else if (arrayCurrentIsc > 200) {
    groundingConductor = '2 AWG';
    groundingMm2 = 33.62;
  }
  
  return {
    groundingConductorSize: groundingConductor,
    groundingConductorMm2: groundingMm2,
    groundRodQuantity: RETIE_GROUNDING.groundRod.quantity,
    maxGroundResistance: RETIE_GROUNDING.maxGroundResistance,
    testingRequired: true,
  };
}

/**
 * Generate RETIE compliance report for a solar system
 */
export function generateRetieComplianceReport(systemConfig: {
  systemType: RetieSystemType;
  arrayCurrentIsc: number;
  arrayVoltageVoc: number;
  inverterOutputCurrent: number;
  inverterVoltage: number;
  dcCableLength: number;
  acCableLength: number;
  systemVoltage: number;
}): {
  compliant: boolean;
  issues: string[];
  recommendations: {
    dcBreaker: ReturnType<typeof calculateRetieBreaker>;
    dcWireGauge: ReturnType<typeof calculateRetieWireGauge>;
    stringFuse: ReturnType<typeof calculateRetieStringFuse>;
    grounding: ReturnType<typeof calculateRetieGrounding>;
    requiredDisconnects: string[];
    requiredLabels: string[];
    testingRequired: string[];
  };
} {
  const issues: string[] = [];
  const recommendations = {
    dcBreaker: calculateRetieBreaker(systemConfig.arrayCurrentIsc, 'dc'),
    dcWireGauge: calculateRetieWireGauge(
      systemConfig.arrayCurrentIsc,
      systemConfig.arrayVoltageVoc,
      systemConfig.dcCableLength,
      'dc'
    ),
    stringFuse: calculateRetieStringFuse(systemConfig.arrayCurrentIsc / 2), // Assuming 2 strings
    grounding: calculateRetieGrounding(systemConfig.arrayCurrentIsc),
    requiredDisconnects: [
      RETIE_DISCONNECTS.dcArray.type,
      ...(systemConfig.systemType === RetieSystemType.OFF_GRID ? [RETIE_DISCONNECTS.dcBattery.type] : []),
      RETIE_DISCONNECTS.acInverter.type,
      ...(systemConfig.systemType === RetieSystemType.ON_GRID ? [RETIE_DISCONNECTS.acGridInterconnect.type] : []),
    ],
    requiredLabels: Object.keys(RETIE_DOCUMENTATION.arrayLabeling),
    testingRequired: [
      'Grounding resistance measurement (< 25Ω)',
      'Continuity testing of all bonding conductors',
      'Voltage drop verification on DC and AC circuits',
      'Breaker/fuse functionality test',
      'Insulation resistance test (DC conductors > 1MΩ)',
    ],
  };
  
  // Check voltage drop compliance (voltageDropPercent is already in % format)
  const maxAllowedDropPercent = RETIE_VOLTAGE_DROP.dcArrayToInverter * 100;
  if (recommendations.dcWireGauge.voltageDropPercent > maxAllowedDropPercent) {
    issues.push(`DC voltage drop (${recommendations.dcWireGauge.voltageDropPercent.toFixed(2)}%) exceeds RETIE limit (${maxAllowedDropPercent}%)`);
  }
  
  const compliant = issues.length === 0;
  
  return {
    compliant,
    issues,
    recommendations,
  };
}
