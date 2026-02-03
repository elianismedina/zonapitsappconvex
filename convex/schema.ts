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
  kits: defineTable(Kit).index("byUserId", ["userId"]),
});