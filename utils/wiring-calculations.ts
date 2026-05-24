/**
 * Wiring calculation utility for solar systems
 * Automatically calculates required cable lengths based on system configuration
 */

export interface WiringCalculationInput {
  panelCount: number;
  panelVoc: number;
  panelIsc: number;
  inverterPower: number;
  inverterVoltage?: number; // AC voltage output (default 240V)
  batteryVoltage?: number; // For off-grid/hybrid systems
  systemType: 'on-grid' | 'off-grid' | 'hybrid';
  dcArrayToInverterDistance?: number; // meters, default 15m
  inverterToLoadDistance?: number; // meters, default 20m
  batteryToDCDistance?: number; // meters, default 5m
}

export interface WiringCalculationResult {
  dcArrayWiring: {
    wiringType: string; // "DC 6mm" etc
    metersNeeded: number;
    quantity: number; // Red + Black cables
    notes: string;
  };
  acMainWiring: {
    wiringType: string;
    metersNeeded: number;
    quantity: number;
    notes: string;
  };
  batteryWiring?: {
    wiringType: string;
    metersNeeded: number;
    quantity: number;
    notes: string;
  };
  totalDCMeters: number;
  totalACMeters: number;
  totalBatteryMeters: number;
  summary: string;
}

// RETIE wire sizing chart (conservative for Colombian climate)
const WIRE_SIZING_CHART = {
  // Isc (A) -> Wire gauge (AWG) for DC circuits
  dc: {
    20: '10 AWG (6mm²)',      // up to 20A
    40: '8 AWG (8.37mm²)',    // 20-40A
    60: '6 AWG (13.3mm²)',    // 40-60A
    100: '4 AWG (21.15mm²)',  // 60-100A
    150: '2 AWG (33.62mm²)',  // 100-150A
    200: '1 AWG (42.41mm²)',  // 150-200A
    300: '1/0 AWG (53.48mm²)',// 200-300A
    400: '2/0 AWG (67.43mm²)',// 300-400A
    500: '3/0 AWG (85.01mm²)',// 400-500A
    600: '4/0 AWG (107.2mm²)',// 500+A
  },
  // Output current (A) -> Wire gauge for AC circuits
  ac: {
    20: '12 AWG (3.31mm²)',
    30: '10 AWG (5.26mm²)',
    50: '8 AWG (8.37mm²)',
    65: '6 AWG (13.3mm²)',
    100: '4 AWG (21.15mm²)',
    140: '2 AWG (33.62mm²)',
    165: '1 AWG (42.41mm²)',
  },
};

/**
 * Determine wire gauge based on current and circuit type
 */
function getWireGauge(currentAmps: number, circuitType: 'dc' | 'ac' = 'dc'): string {
  const chart = circuitType === 'dc' ? WIRE_SIZING_CHART.dc : WIRE_SIZING_CHART.ac;
  const sortedAmps = Object.keys(chart)
    .map(Number)
    .sort((a, b) => a - b);
  
  for (const amp of sortedAmps) {
    if (currentAmps <= amp) {
      return (chart as any)[amp];
    }
  }
  
  // If exceeds max, return largest
  const largest = sortedAmps[sortedAmps.length - 1];
  return (chart as any)[largest];
}

/**
 * Calculate optimal string configuration
 */
function calculateStringConfiguration(
  panelCount: number,
  panelVoc: number,
  panelIsc: number,
  maxVoltage: number = 600, // Typical residential DC limit
): { strings: number; panelsPerString: number; totalCurrent: number } {
  // Safety factor for cold weather conditions (RETIE standard)
  const voltageSafetyFactor = 1.15;
  
  for (let strings = 1; strings <= panelCount; strings++) {
    const panelsPerString = Math.ceil(panelCount / strings);
    const stringVoltage = panelsPerString * panelVoc * voltageSafetyFactor;
    
    if (stringVoltage <= maxVoltage) {
      return {
        strings,
        panelsPerString,
        totalCurrent: strings * panelIsc,
      };
    }
  }
  
  // Fallback if voltage too high
  return {
    strings: panelCount,
    panelsPerString: 1,
    totalCurrent: panelCount * panelIsc,
  };
}

/**
 * Calculate AC output current from inverter power
 */
function calculateACCurrent(powerWatts: number, acVoltage: number = 240): number {
  // P = V × I → I = P / V
  // Using 1.25× safety factor per RETIE
  return (powerWatts / acVoltage) * 1.25;
}

/**
 * Main calculation function
 */
export function calculateWiringRequirements(
  input: WiringCalculationInput,
): WiringCalculationResult {
  const {
    panelCount,
    panelVoc,
    panelIsc,
    inverterPower,
    inverterVoltage = 240,
    batteryVoltage = 48,
    systemType,
    dcArrayToInverterDistance = 15,
    inverterToLoadDistance = 20,
    batteryToDCDistance = 5,
  } = input;

  // Calculate DC array configuration
  const dcConfig = calculateStringConfiguration(
    panelCount,
    panelVoc,
    panelIsc,
  );

  const dcArrayCurrent = dcConfig.totalCurrent * 1.25; // RETIE 125% rule
  const dcWireGauge = getWireGauge(dcArrayCurrent, 'dc');

  // DC wiring: Array to inverter (need both positive and negative cables)
  // Add safety margin for routing and connections (20% extra)
  const dcTotalLength = dcArrayToInverterDistance * 1.2;
  const dcMetersPerColor = dcTotalLength;
  const dcTotalMeters = dcTotalLength * 2; // Red + Black

  // AC wiring
  const acCurrent = calculateACCurrent(inverterPower, inverterVoltage);
  const acWireGauge = getWireGauge(acCurrent, 'ac');
  const acTotalLength = inverterToLoadDistance * 1.2; // Safety margin
  const acMetersPerColor = acTotalLength;
  const acTotalMeters = acTotalLength * 2; // Phase + Neutral (or 3-phase)

  // Battery wiring (for off-grid and hybrid systems)
  let batteryMeters = 0;
  let batteryWireGauge = '';
  
  if (systemType !== 'on-grid' && batteryVoltage) {
    const batteryChargeCurrent = calculateACCurrent(inverterPower, batteryVoltage);
    batteryWireGauge = getWireGauge(batteryChargeCurrent, 'dc');
    const batteryTotalLength = batteryToDCDistance * 1.2;
    batteryMeters = batteryTotalLength * 2; // Positive + Negative
  }

  const totalDCMeters = dcTotalMeters + (batteryMeters / 2);
  const totalACMeters = acTotalMeters;
  const totalBatteryMeters = batteryMeters;

  // Determine wire types based on gauge
  const dcWiringType = dcWireGauge.includes('6mm') || dcWireGauge.includes('10 AWG')
    ? 'DC 6mm'
    : 'DC Solar Cable';
  
  const acWiringType = 'AC 2x1.5mm'; // Standard residential

  const summary = `Sistema ${systemType.toUpperCase()} | ${panelCount} paneles en ${dcConfig.strings} string(s) | ` +
    `${Math.round(totalDCMeters)}m DC + ${Math.round(totalACMeters)}m AC`;

  return {
    dcArrayWiring: {
      wiringType: dcWiringType,
      metersNeeded: Math.ceil(dcTotalMeters),
      quantity: 2, // Red + Black
      notes: `${dcWireGauge} - ${dcConfig.strings} string(s) de ${dcConfig.panelsPerString} paneles`,
    },
    acMainWiring: {
      wiringType: acWiringType,
      metersNeeded: Math.ceil(acTotalMeters),
      quantity: 2, // Phase + Neutral
      notes: `Para salida ${inverterPower}W @ ${inverterVoltage}V AC`,
    },
    ...(systemType !== 'on-grid' && {
      batteryWiring: {
        wiringType: batteryWireGauge || 'DC Solar Cable',
        metersNeeded: Math.ceil(batteryMeters),
        quantity: 2, // Positive + Negative
        notes: `Batería ${batteryVoltage}V - Carga/Descarga`,
      },
    }),
    totalDCMeters: Math.ceil(totalDCMeters),
    totalACMeters: Math.ceil(totalACMeters),
    totalBatteryMeters: Math.ceil(totalBatteryMeters),
    summary,
  };
}

/**
 * Simplified calculation for on-grid systems (most common)
 */
export function calculateOnGridWiring(
  panelCount: number,
  panelVoc: number,
  panelIsc: number,
  inverterPower: number,
  dcDistance: number = 15,
  acDistance: number = 20,
): WiringCalculationResult {
  return calculateWiringRequirements({
    panelCount,
    panelVoc,
    panelIsc,
    inverterPower,
    inverterVoltage: 240,
    systemType: 'on-grid',
    dcArrayToInverterDistance: dcDistance,
    inverterToLoadDistance: acDistance,
  });
}
