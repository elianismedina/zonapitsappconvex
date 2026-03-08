export interface PanelData {
  pmax: number;
  vmp: number;
  imp: number;
  voc: number;
  isc: number;
}

export interface InverterData {
  _id?: string;
  brand: string;
  model: string;
  nominalPower: number;
  maxPvPower: number;
  mpptChargeCurrent: number;
  maxPvVoltage: number;
  [key: string]: any;
}

export interface CompatibilityResult {
  inverterId?: string;
  brand: string;
  model: string;
  isCompatible: boolean;
  constraints: {
    power: {
      value: number;
      max: number;
      isCompatible: boolean;
    };
    voltage: {
      value: number;
      max: number;
      isCompatible: boolean;
    };
    current: {
      value: number;
      max: number;
      isCompatible: boolean;
    };
  };
  optimalConfig?: {
    strings: number;
    panelsInSeries: number;
  };
}

/**
 * Checks the compatibility of a list of inverters with a specific solar panel configuration.
 *
 * @param panel - Technical specs of the solar panel
 * @param panelsInSeries - Number of panels connected in series per string
 * @param strings - Number of parallel strings
 * @param inverters - List of inverters to check
 * @returns A list of inverters with their compatibility status and detailed constraint checks
 */
export function checkInverterCompatibility(
  panel: PanelData,
  totalPanels: number,
  inverters: InverterData[],
): CompatibilityResult[] {
  const totalPvPower = totalPanels * panel.pmax;

  return inverters.map((inverter) => {
    // 1. PV power vs inverter max PV power
    const isPowerCompatible = totalPvPower <= (inverter.maxPvPower || 0);

    // 2. Determine best string configuration based on inverter limits
    // We try to minimize strings (P) to simplify wiring, which maximizes panels in series (Ns)
    let optimalStrings = 1;
    let optimalPanelsInSeries = totalPanels;
    let foundCompatibleConfig = false;

    // A rule of thumb: voltage can increase by up to 15% in very cold conditions
    const voltageSafetyFactor = 1.15;

    for (let p = 1; p <= totalPanels; p++) {
      const ns = Math.ceil(totalPanels / p);
      const stringVoltage = ns * panel.voc * voltageSafetyFactor;
      const arrayCurrent = p * panel.isc;

      // Check if this configuration satisfies the inverter's limits
      if (
        stringVoltage <= (inverter.maxPvVoltage || 10000) &&
        arrayCurrent <= (inverter.mpptChargeCurrent || 10000)
      ) {
        optimalStrings = p;
        optimalPanelsInSeries = ns;
        foundCompatibleConfig = true;
        break;
      }
    }

    // If no perfect configuration is found, try to configure based on max string voltage
    // just so we can generate numbers closest to reality and show where the limit is.
    if (!foundCompatibleConfig) {
      const maxNsAllowed = Math.floor(
        (inverter.maxPvVoltage || 1000) / (panel.voc * voltageSafetyFactor),
      );
      if (maxNsAllowed > 0 && maxNsAllowed < totalPanels) {
        optimalStrings = Math.ceil(totalPanels / maxNsAllowed);
        optimalPanelsInSeries = Math.ceil(totalPanels / optimalStrings);
      } else {
        optimalStrings = totalPanels;
        optimalPanelsInSeries = 1;
      }
    }

    const maxStringVoltage =
      optimalPanelsInSeries * panel.voc * voltageSafetyFactor;
    const arrayCurrent = optimalStrings * panel.isc;

    const isVoltageCompatible =
      maxStringVoltage <= (inverter.maxPvVoltage || 0);
    const isCurrentCompatible =
      arrayCurrent <= (inverter.mpptChargeCurrent || 0);

    return {
      inverterId: inverter._id,
      brand: inverter.brand,
      model: inverter.model,
      isCompatible:
        isPowerCompatible && isVoltageCompatible && isCurrentCompatible,
      optimalConfig: {
        strings: optimalStrings,
        panelsInSeries: optimalPanelsInSeries,
      },
      constraints: {
        power: {
          value: totalPvPower,
          max: inverter.maxPvPower || 0,
          isCompatible: isPowerCompatible,
        },
        voltage: {
          value: maxStringVoltage,
          max: inverter.maxPvVoltage || 0,
          isCompatible: isVoltageCompatible,
        },
        current: {
          value: arrayCurrent,
          max: inverter.mpptChargeCurrent || 0,
          isCompatible: isCurrentCompatible,
        },
      },
    };
  });
}

export interface BatteryData {
  _id?: string;
  brand: string;
  model: string;
  capacity: number;
  voltage?: number;
  type: string;
  chargeCurrent?: string;
  dischargeCurrent?: string;
  communication?: string;
  [key: string]: any;
}

export interface BatteryCompatibilityResult {
  batteryId?: string;
  brand: string;
  model: string;
  isCompatible: boolean;
  constraints: {
    voltage: {
      inverterVoltage: number;
      batteryVoltage: number;
      isCompatible: boolean;
    };
    chargeCurrent: {
      inverterChargeCurrent: number;
      batteryMaxCharge: number;
      isCompatible: boolean;
    };
    dischargeCurrent: {
      requiredByInverter: number;
      batteryMaxDischarge: number;
      isCompatible: boolean;
    };
    chemistry: {
      isCompatible: boolean;
      message: string;
    };
  };
  optimalConfig?: {
    quantity: number;
    totalCapacityKwh: number;
    daysOfAutonomy: number;
  };
}

/**
 * Checks the compatibility of a list of batteries with a specific inverter configuration.
 *
 * @param inverter - Technical specs of the chosen inverter
 * @param batteries - List of batteries to check
 * @param dailyConsumptionKwh - Required daily energy consumption in kWh
 * @param daysOfAutonomy - Number of days the battery bank should sustain the load without solar (default: 1)
 * @returns A list of batteries with their compatibility status and detailed constraint checks
 */
export function checkBatteryBankCompatibility(
  inverter: InverterData,
  batteries: BatteryData[],
  dailyConsumptionKwh: number = 0,
  daysOfAutonomy: number = 1,
): BatteryCompatibilityResult[] {
  // If the inverter doesn't specify a battery voltage, default to 48V for standard residential,
  // or it might mean it's a grid-tie without battery support.
  const inverterReqVoltage = inverter.batteryVoltage || 48;

  return batteries.map((battery) => {
    // 1. Voltage compatibility (Crucial: Nominal must match)
    const batteryVoltage = battery.voltage || 48; // Default assumption if missing
    const isVoltageCompatible = batteryVoltage === inverterReqVoltage;

    // Helper to parse max current from strings like "100A", "50-100"
    const parseCurrentLimit = (currentStr?: string) => {
      if (!currentStr) return 0;
      const matches = currentStr.match(/\d+(\.\d+)?/g);
      if (matches && matches.length > 0) {
        return Math.max(...matches.map(Number));
      }
      return 0;
    };

    // 2. Charge current comparison
    // Inverter might provide mpptChargeCurrent or we assume max general charge.
    const invChargeCurrent = inverter.mpptChargeCurrent || 0;
    const batMaxCharge = parseCurrentLimit(battery.chargeCurrent);

    // If we have both values, check strict compatibility. Otherwise, assume pass or warn.
    const isChargeCompatible =
      invChargeCurrent === 0 || batMaxCharge === 0
        ? true
        : invChargeCurrent <= batMaxCharge;

    // 3. Discharge current comparison
    // Inverter max continuous draw = nominalPower / batteryVoltage
    const requiredDischargeCurrent =
      inverterReqVoltage > 0
        ? (inverter.nominalPower || 0) / inverterReqVoltage
        : 0;
    const batMaxDischarge = parseCurrentLimit(battery.dischargeCurrent);

    const isDischargeCompatible =
      batMaxDischarge === 0
        ? true
        : requiredDischargeCurrent <= batMaxDischarge;

    // 4. Chemistry / Communication check
    // Very basic check, mainly verifying if the chemistry is generally supported
    const isLithium =
      battery.type.toLowerCase().includes("li") ||
      battery.type.toLowerCase().includes("ion") ||
      battery.type.toLowerCase().includes("po4");
    // Just an informational constraint, we don't strictly fail on it right now
    const chemMessage = isLithium
      ? "Compatible (Requiere verificar pines BMS)"
      : "Compatible (Plomo-ácido, verificar perfiles de tensión)";

    // 5. Calculate recommended quantity for autonomy
    let optimalQuantity = 0;
    let totalCapacityProvided = 0;

    if (dailyConsumptionKwh > 0 && battery.capacity > 0) {
      // Depth of Discharge (DoD) safety limit: Lithium ~80-90%, Lead-acid ~50%
      const dodLimit = isLithium ? 0.8 : 0.5;

      // Total usable energy needed in kWh
      const requiredUsableEnergy = dailyConsumptionKwh * daysOfAutonomy;

      // Required raw nominal capacity
      const requiredNominalCapacity = requiredUsableEnergy / dodLimit;

      // Battery nominal capacity in kWh
      optimalQuantity = Math.ceil(requiredNominalCapacity / battery.capacity);
      totalCapacityProvided = optimalQuantity * battery.capacity;
    }

    return {
      batteryId: battery._id,
      brand: battery.brand,
      model: battery.model,
      isCompatible:
        isVoltageCompatible && isChargeCompatible && isDischargeCompatible,
      optimalConfig:
        optimalQuantity > 0
          ? {
              quantity: optimalQuantity,
              totalCapacityKwh: totalCapacityProvided,
              daysOfAutonomy: daysOfAutonomy,
            }
          : undefined,
      constraints: {
        voltage: {
          inverterVoltage: inverterReqVoltage,
          batteryVoltage: batteryVoltage,
          isCompatible: isVoltageCompatible,
        },
        chargeCurrent: {
          inverterChargeCurrent: invChargeCurrent,
          batteryMaxCharge: batMaxCharge,
          isCompatible: isChargeCompatible,
        },
        dischargeCurrent: {
          requiredByInverter: requiredDischargeCurrent,
          batteryMaxDischarge: batMaxDischarge,
          isCompatible: isDischargeCompatible,
        },
        chemistry: {
          isCompatible: true,
          message: chemMessage,
        },
      },
    };
  });
}
