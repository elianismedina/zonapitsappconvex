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
  panelsInSeries: number,
  strings: number,
  inverters: InverterData[],
): CompatibilityResult[] {
  const totalPanels = panelsInSeries * strings;
  const totalPvPower = totalPanels * panel.pmax;
  const maxStringVoltage = panelsInSeries * panel.voc;
  const arrayCurrent = strings * panel.isc;

  return inverters.map((inverter) => {
    // 1. PV power vs inverter max PV power
    const isPowerCompatible = totalPvPower <= (inverter.maxPvPower || 0);

    // 2. String voltage vs inverter max PV voltage
    const isVoltageCompatible =
      maxStringVoltage <= (inverter.maxPvVoltage || 0);

    // 3. Array current vs inverter MPPT current
    const isCurrentCompatible =
      arrayCurrent <= (inverter.mpptChargeCurrent || 0);

    return {
      inverterId: inverter._id,
      brand: inverter.brand,
      model: inverter.model,
      isCompatible:
        isPowerCompatible && isVoltageCompatible && isCurrentCompatible,
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
