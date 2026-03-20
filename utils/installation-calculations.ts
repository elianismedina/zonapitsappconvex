/**
 * Installation-related calculations for solar kits.
 */

export enum InstallationDifficulty {
  INDUSTRIAL = "industrial",
  RESIDENTIAL_FLAT = "residential_flat",
  RESIDENTIAL_SLOPED = "residential_sloped",
  MOUNTAIN = "mountain",
  CUSTOM = "custom",
}

export enum SystemType {
  ON_GRID = "on_grid",
  OFF_GRID = "off_grid",
  HYBRID = "hybrid",
}

export interface LaborCostParams {
  /** Número de instaladores */
  numInstallers: number;
  /** Horas estimadas por cada instalador */
  hoursPerInstaller: number;
  /** Tarifa por hora de un instalador (COP) */
  hourlyRate: number;
  /** Número de paneles a instalar */
  numPanels: number;
  /** Costo de instalación base por panel (COP) */
  installationCostPerPanel: number;
  /** Costos extra (desplazamiento, permisos, seguridad, herramientas especiales, etc.) (COP) */
  extraCosts: number;
}

export interface InstallationFactors {
  difficulty: InstallationDifficulty;
  systemType: SystemType;
  numPanels: number;
  isSpecializedLabor?: boolean;
}

/**
 * Calculates the total labor cost based on the provided formula:
 * Total = (numInstallers * hoursPerInstaller * hourlyRate) + (numPanels * installationCostPerPanel) + extraCosts
 * 
 * @param params LaborCostParams
 * @returns Total labor cost in COP
 */
export function calculateLaborCost(params: LaborCostParams): number {
  const {
    numInstallers,
    hoursPerInstaller,
    hourlyRate,
    numPanels,
    installationCostPerPanel,
    extraCosts,
  } = params;

  const totalInstallerCost = numInstallers * hoursPerInstaller * hourlyRate;
  const totalPanelInstallationCost = numPanels * installationCostPerPanel;

  return Math.round(totalInstallerCost + totalPanelInstallationCost + extraCosts);
}

/**
 * Estimates LaborCostParams based on installation factors.
 * 
 * @param factors InstallationFactors
 * @returns Suggested LaborCostParams
 */
export function estimateLaborParams(factors: InstallationFactors): LaborCostParams {
  const { difficulty, systemType, numPanels, isSpecializedLabor = false } = factors;

  // 1. Determine hourly rate (Range 15.000 - 50.000 COP)
  let hourlyRate = 20000; // Base rate
  if (isSpecializedLabor) {
    hourlyRate = 45000;
  } else if (difficulty === InstallationDifficulty.INDUSTRIAL) {
    hourlyRate = 25000;
  } else if (difficulty === InstallationDifficulty.RESIDENTIAL_SLOPED || difficulty === InstallationDifficulty.MOUNTAIN) {
    hourlyRate = 35000;
  }

  // 2. Determine base hours per panel
  let baseHoursPerPanel = 2; // Industrial/Flat
  if (difficulty === InstallationDifficulty.RESIDENTIAL_SLOPED) baseHoursPerPanel = 3;
  if (difficulty === InstallationDifficulty.MOUNTAIN) baseHoursPerPanel = 5;

  // 3. Determine additional hours for system type (Inverter/Battery setup)
  let systemTypeAdditionalHours = 8; // On-grid setup
  if (systemType === SystemType.OFF_GRID || systemType === SystemType.HYBRID) {
    systemTypeAdditionalHours = 16; // Batteries and complex inverters take longer
  }

  // 4. Calculate total estimated man-hours
  const totalManHours = (numPanels * baseHoursPerPanel) + systemTypeAdditionalHours;
  
  // 5. Suggest number of installers based on workload
  const numInstallers = Math.max(2, Math.ceil(totalManHours / 40)); // Minimum 2 people, aim for 40h workweek
  const hoursPerInstaller = totalManHours / numInstallers;

  // 6. Installation cost per panel (I)
  let installationCostPerPanel = 50000; // Base per user example
  if (difficulty === InstallationDifficulty.RESIDENTIAL_SLOPED) installationCostPerPanel = 65000;
  if (difficulty === InstallationDifficulty.MOUNTAIN) installationCostPerPanel = 100000;

  // 7. Extra costs (E)
  let extraCosts = 500000; // Base displacement/safety
  if (difficulty === InstallationDifficulty.INDUSTRIAL) extraCosts = 2000000;
  if (difficulty === InstallationDifficulty.MOUNTAIN) extraCosts = 3500000;

  return {
    numInstallers,
    hoursPerInstaller,
    hourlyRate,
    numPanels,
    installationCostPerPanel,
    extraCosts,
  };
}
