const { ConvexHttpClient } = require("convex/browser");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: ".env.local" });

const client = new ConvexHttpClient(process.env.EXPO_PUBLIC_CONVEX_URL);

// Mock the compatibility function logic locally to debug
function getNominalClass(v) {
  if (v >= 40) return 48;
  if (v >= 20) return 24;
  if (v >= 10) return 12;
  return v;
}

async function debugCompatibility() {
  try {
    const inverters = await client.query("inverters:getInverters");
    const batteries = await client.query("batteries:getBatteries");

    console.log("--- INVERTERS ---");
    inverters.forEach((inv) => {
      console.log(
        `${inv.brand} ${inv.model}: batteryVoltage=${inv.batteryVoltage}`,
      );
    });

    console.log("\n--- BATTERIES ---");
    batteries.forEach((bat) => {
      console.log(`${bat.brand} ${bat.model}: voltage=${bat.voltage}`);
    });

    console.log("\n--- COMPARISON ANALYSIS ---");
    inverters.forEach((inv) => {
      const invReq = inv.batteryVoltage || 48;
      const invClass = getNominalClass(invReq);

      console.log(`\nInverter ${inv.model} (class ${invClass}V):`);
      batteries.forEach((bat) => {
        const batVolts = bat.voltage || 48;
        const batClass = getNominalClass(batVolts);
        const compat = invClass === batClass;

        console.log(
          `  vs Battery ${bat.model} (${batVolts}V -> class ${batClass}V) => ${compat ? "COMPATIBLE" : "INCOMPATIBLE"}`,
        );
      });
    });
  } catch (err) {
    console.error("Error:", err);
  }
}

debugCompatibility();
