const { ConvexHttpClient } = require("convex/browser");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: ".env.local" });

const client = new ConvexHttpClient(process.env.EXPO_PUBLIC_CONVEX_URL);

async function seedTable(fileName, mutationName, argName) {
  const dataPath = path.join(__dirname, `../seeds/${fileName}.json`);
  if (!fs.existsSync(dataPath)) {
    console.log(`Skipping ${fileName}: file not found at ${dataPath}`);
    return;
  }

  const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
  if (data.length === 0) {
    console.log(`Skipping ${fileName}: no data in file`);
    return;
  }

  console.log(`Seeding ${data.length} items into ${fileName}...`);
  
  try {
    const count = await client.mutation(mutationName, { [argName]: data });
    console.log(`Successfully added ${count} items to ${fileName}!`);
  } catch (err) {
    console.error(`Error seeding ${fileName}:`, err);
  }
}

async function run() {
  await seedTable("solar_modules", "modules:bulkCreateModules", "modules");
  await seedTable("inverters", "inverters:bulkCreateInverters", "inverters");
  await seedTable("batteries", "batteries:bulkCreateBatteries", "batteries");
  await seedTable("structures", "structures:bulkCreateStructures", "structures");
  await seedTable("cables", "cables:bulkCreateCables", "cables");
  await seedTable("protections", "protections:bulkCreateProtections", "protections");
}

run();