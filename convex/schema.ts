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

export const Vehiculo = {
  userId: v.id("users"),
  marca: v.string(),
  linea: v.string(),
  modelo: v.string(),
  year: v.number(),
  color: v.string(),
  combustible: v.string(),
  cilindrada: v.number(),
  transmision: v.string(),
  storageId: v.optional(v.id("_storage")),
};

export const Kit = {
  userId: v.id("users"),
  name: v.string(),
  address: v.string(),
  latitude: v.number(),
  longitude: v.number(),
  capacity: v.optional(v.number()),
  status: v.string(), // e.g., "draft", "pending", "completed"
  billStorageId: v.optional(v.id("_storage")),
};

export default defineSchema({
  users: defineTable(User)
    .index("byClerkId", ["clerkId"])
    .searchIndex("searchUsers", {
      searchField: "username",
    }),
  vehiculos: defineTable(Vehiculo).index("byUserId", ["userId"]),
  kits: defineTable(Kit).index("byUserId", ["userId"]),
});