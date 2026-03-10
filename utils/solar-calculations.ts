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
  return batteries.map((battery) => {
    // 1. Voltage compatibility (Crucial: Nominal must match)
    const invReqV = Number(inverter.batteryVoltage || 48);
    const batV = Number(battery.voltage || 48);

    // Group actual voltages into nominal classes (e.g. 51.2V and 48V both fall into 48V class)
    const getNominalClass = (v: number) => {
      if (v >= 40 && v <= 65) return 48; // 48V systems (e.g. 48V, 51.2V LFP)
      if (v >= 20 && v <= 32) return 24; // 24V systems (e.g. 24V, 25.6V LFP)
      if (v >= 10 && v <= 16) return 12; // 12V systems (e.g. 12V, 12.8V LFP)
      return v;
    };

    const isVoltageCompatible =
      getNominalClass(batV) === getNominalClass(invReqV);

    // Helper to parse max current from strings like "100A", "50-100"
    const parseCurrentLimit = (currentStr?: string) => {
      if (!currentStr) return 0;
      const cleanStr = currentStr.replace(/,/g, ".");
      const matches = cleanStr.match(/\d+(\.\d+)?/g);
      if (matches && matches.length > 0) {
        return Math.max(...matches.map(Number));
      }
      return 0;
    };

    // 2. Charge current comparison
    // Inverter might provide mpptChargeCurrent or we assume max general charge.
    const invChargeCurrent = inverter.mpptChargeCurrent || 0;
    const batMaxCharge = parseCurrentLimit(battery.chargeCurrent);

    // 3. Discharge current comparison
    // Inverter max continuous draw = nominalPower / batteryVoltage
    const requiredDischargeCurrent =
      invReqV > 0 ? (inverter.nominalPower || 0) / invReqV : 0;
    const batMaxDischarge = parseCurrentLimit(battery.dischargeCurrent);

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

    // 4. Calculate recommended quantity based on 3 factors:
    // a) Autonomy (Energy needs)
    // b) Charge Current (Can the bank take the inverter's charge current?)
    // c) Discharge Current (Can the bank handle the inverter's power draw?)

    let autonomyQuantity = 0;
    if (dailyConsumptionKwh > 0 && battery.capacity > 0) {
      const dodLimit = isLithium ? 0.8 : 0.5;
      const requiredUsableEnergy = dailyConsumptionKwh * daysOfAutonomy;
      const requiredNominalCapacity = requiredUsableEnergy / dodLimit;
      autonomyQuantity = Math.ceil(requiredNominalCapacity / battery.capacity);
    }

    // Safety factor for charge current as suggested by designers (1.25x)
    const chargeQuantity =
      batMaxCharge > 0
        ? Math.ceil((invChargeCurrent * 1.25) / batMaxCharge)
        : 1;
    const dischargeQuantity =
      batMaxDischarge > 0
        ? Math.ceil(requiredDischargeCurrent / batMaxDischarge)
        : 1;

    // Final suggested quantity is the highest of all needs
    const optimalQuantity = Math.max(
      autonomyQuantity,
      chargeQuantity,
      dischargeQuantity,
      1,
    );
    const totalCapacityProvided = optimalQuantity * battery.capacity;

    // A configuration is compatible if voltage matches and the recommended quantity handles the currents
    const isChargeCompatible =
      batMaxCharge === 0 || invChargeCurrent <= batMaxCharge * optimalQuantity;
    const isDischargeCompatible =
      batMaxDischarge === 0 ||
      requiredDischargeCurrent <= batMaxDischarge * optimalQuantity;

    return {
      batteryId: battery._id,
      brand: battery.brand,
      model: battery.model,
      isCompatible:
        isVoltageCompatible && isChargeCompatible && isDischargeCompatible,
      optimalConfig: {
        quantity: optimalQuantity,
        totalCapacityKwh: totalCapacityProvided,
        daysOfAutonomy: daysOfAutonomy,
      },
      constraints: {
        voltage: {
          inverterVoltage: invReqV,
          batteryVoltage: batV,
          isCompatible: isVoltageCompatible,
        },
        chargeCurrent: {
          inverterChargeCurrent: invChargeCurrent,
          batteryMaxCharge: batMaxCharge * optimalQuantity,
          isCompatible: isChargeCompatible,
        },
        dischargeCurrent: {
          requiredByInverter: requiredDischargeCurrent,
          batteryMaxDischarge: batMaxDischarge * optimalQuantity,
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
