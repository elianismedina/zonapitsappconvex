const { ConvexHttpClient } = require("convex/browser");
require("dotenv").config({ path: ".env.local" });

const client = new ConvexHttpClient(process.env.EXPO_PUBLIC_CONVEX_URL);

const defaults = [
  { name: "Cable 4 mm²", brand: "Genérica", type: "4mm2", color: "black", pricePerMeter: 3000 },
  { name: "Cable 6 mm²", brand: "Genérica", type: "6mm2", color: "red", pricePerMeter: 4500 },
  { name: "Cable 10 mm²", brand: "Genérica", type: "10mm2", color: "blue", pricePerMeter: 7000 },
  { name: "Cable 16 mm²", brand: "Genérica", type: "16mm2", color: "green", pricePerMeter: 11000 },
];

async function run() {
  try {
    const createdCount = await client.mutation("wiring:bulkCreateWiring", { wiring: defaults });
    console.log("Seeded wiring gauge entries:", createdCount);

    const rows = await client.query("wiring:getWiring", {});
    console.log("Current wiring rows:", rows);
  } catch (err) {
    console.error("Failed to seed wiring gauge entries:", err);
    process.exit(1);
  }
}

run();
