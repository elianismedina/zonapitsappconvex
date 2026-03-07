import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const User = {
  email: v.string(),
  clerkId: v.string(),
  imageUrl: v.optional(v.string()),
  first_name: v.optional(v.string()),
  last_name: v.optional(v.string()),
  username: v.union(v.string(), v.null()),
  bio: v.optional(v.string()),
  location: v.optional(v.string()),
  websiteUrl: v.optional(v.string()),
  followersCount: v.number(),
  pushToken: v.optional(v.string()),
};

export const Kit = {
  userId: v.id("users"),
  name: v.string(),
  address: v.string(),
  latitude: v.number(),
  longitude: v.number(),
  type: v.optional(
    v.union(v.literal("off-grid"), v.literal("on-grid"), v.literal("hybrid")),
  ),
  capacity: v.optional(v.number()),
  status: v.string(), // e.g., "draft", "pending", "completed"
  billStorageId: v.optional(v.id("_storage")),
  monthlyConsumptionKwh: v.optional(v.number()),
  energyRate: v.optional(v.number()),
  totalAmount: v.optional(v.number()),
  currency: v.optional(v.string()),
  billingPeriod: v.optional(v.string()),
  provider: v.optional(v.string()),
  generationPercentage: v.optional(v.number()),
  roofType: v.optional(
    v.union(
      v.literal("thermoacoustic"),
      v.literal("standing_seam"),
      v.literal("clay_tile"),
      v.literal("asphalt_mantle"),
      v.literal("eternit_tile"),
      v.literal("wood"),
      v.literal("zinc"),
    ),
  ),
};

export const SolarModule = {
  brand: v.string(),
  model: v.string(),
  price: v.number(),
  imageUrl: v.optional(v.string()),
  pmax: v.number(),
  vmp: v.number(),
  imp: v.number(),
  voc: v.number(),
  isc: v.number(),
  efficiency: v.number(),
  weight: v.number(),
  dimensions: v.string(),
};

export const Inverter = {
  brand: v.string(),
  model: v.string(),
  type: v.string(), // e.g. "string", "micro", "hybrid"
  power: v.number(), // Watts
  efficiency: v.optional(v.number()),
  price: v.number(),
  imageUrl: v.optional(v.string()),
  // Technical details
  nominalPower: v.optional(v.number()), // Watts
  maxPvPower: v.optional(v.number()), // Watts
  peakPower: v.optional(v.number()), // Watts
  nominalOutputVoltage: v.optional(v.string()), // e.g., "220 / 230 / 240 VAC"
  waveForm: v.optional(v.string()), // e.g., "Onda senoidal pura"
  frequency: v.optional(v.number()), // Hz
  acInputVoltage: v.optional(v.string()), // e.g., "110 / 120 VDC"
  batteryVoltage: v.optional(v.number()), // VDC
  mpptChargeCurrent: v.optional(v.number()), // A
  maxPvVoltage: v.optional(v.number()), // VDC
};

export const Battery = {
  brand: v.string(),
  model: v.string(),
  capacity: v.number(), // kWh
  voltage: v.optional(v.number()),
  type: v.string(), // e.g. "LiFePO4", "Lead-acid"
  price: v.number(),
  imageUrl: v.optional(v.string()),
  // Technical details
  nominalCapacityAh: v.optional(v.number()),
  nominalEnergyWh: v.optional(v.number()),
  lifeCycles: v.optional(v.string()),
  recommendedChargeVoltage: v.optional(v.number()),
  chargeCurrent: v.optional(v.string()),
  endOfDischargeVoltage: v.optional(v.number()),
  dischargeCurrent: v.optional(v.string()),
  cutOffVoltage: v.optional(v.string()),
  operatingTemperature: v.optional(v.string()),
  storageTemperature: v.optional(v.string()),
  parallelModules: v.optional(v.string()),
  communication: v.optional(v.string()),
};

export const Structure = {
  name: v.string(),
  type: v.string(), // e.g. "roof", "ground", "carport"
  material: v.optional(v.string()),
  pricePerUnit: v.number(),
  imageUrl: v.optional(v.string()),
};

export const Cable = {
  name: v.string(),
  type: v.string(), // e.g. "DC 4mm", "AC 3x2.5"
  pricePerMeter: v.number(),
  imageUrl: v.optional(v.string()),
};

export const Protection = {
  name: v.string(),
  type: v.string(), // e.g. "DC Breaker", "AC Surge Protector"
  rating: v.string(),
  price: v.number(),
  imageUrl: v.optional(v.string()),
};

export default defineSchema({
  users: defineTable(User)
    .index("byClerkId", ["clerkId"])
    .searchIndex("searchUsers", {
      searchField: "username",
    }),
  kits: defineTable(Kit).index("byUserId", ["userId"]),
  solar_modules: defineTable(SolarModule),
  inverters: defineTable(Inverter),
  batteries: defineTable(Battery),
  structures: defineTable(Structure),
  cables: defineTable(Cable),
  protections: defineTable(Protection),
  kit_components: defineTable({
    kitId: v.id("kits"),
    type: v.union(
      v.literal("solar_module"),
      v.literal("inverter"),
      v.literal("battery"),
      v.literal("structure"),
      v.literal("cable"),
      v.literal("protection"),
    ),
    solarModuleId: v.optional(v.id("solar_modules")),
    inverterId: v.optional(v.id("inverters")),
    batteryId: v.optional(v.id("batteries")),
    structureId: v.optional(v.id("structures")),
    cableId: v.optional(v.id("cables")),
    protectionId: v.optional(v.id("protections")),
    quantity: v.number(),
  }).index("byKitId", ["kitId"]),
});
