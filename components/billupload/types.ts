export type RoofType =
  | "thermoacoustic"
  | "standing_seam"
  | "clay_tile"
  | "asphalt_mantle"
  | "eternit_tile"
  | "wood"
  | "zinc";

export interface RoofTypeOption {
  value: RoofType;
  label: string;
  icon: string;
}

export interface BillAnalysisResult {
  provider?: string;
  billingPeriod?: string;
  monthlyConsumptionKwh?: number;
  totalAmount?: number;
  currency?: string;
  energyRate?: number;
}

export interface SelectedFile {
  uri: string;
  mimeType?: string;
  name?: string;
}

export const ROOF_TYPES: RoofTypeOption[] = [
  { value: "thermoacoustic", label: "Termoacústica", icon: "🏠" },
  { value: "standing_seam", label: "Pie de amigo", icon: "🔧" },
  { value: "clay_tile", label: "Teja de barro", icon: "🧱" },
  { value: "asphalt_mantle", label: "Manto asfáltico", icon: "🛣️" },
  { value: "eternit_tile", label: "Teja eternit", icon: "🔲" },
  { value: "wood", label: "Madera", icon: "🪵" },
  { value: "zinc", label: "Zinc", icon: "⚙️" },
];
