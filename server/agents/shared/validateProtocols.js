const fs = require("fs");
const path = require("path");

const baseDir = path.join(__dirname, "protocols");

function validateProtocol(obj, filePath) {
  const errors = [];

  if (!obj.protocolId) errors.push("Missing protocolId");
  if (!obj.species) errors.push("Missing species");
  if (!obj.condition) errors.push("Missing condition");
  if (!obj.phases || typeof obj.phases !== "object") {
    errors.push("Missing or invalid phases");
  } else {
    for (const [phaseKey, phase] of Object.entries(obj.phases)) {
      if (!phase.label) errors.push(`Phase ${phaseKey}: missing label`);
      if (!Array.isArray(phase.exercises)) {
        errors.push(`Phase ${phaseKey}: exercises must be an array`);
      } else {
        phase.exercises.forEach((ex, idx) => {
          if (!ex.id) errors.push(`Phase ${phaseKey}, exercise[${idx}]: missing id`);
        });
      }
    }
  }

  if (errors.length) {
    console.error(`❌ ${filePath}`);
    errors.forEach(e => console.error("   - " + e));
    return false;
  } else {
    console.log(`✅ ${filePath}`);
    return true;
  }
}

function run() {
  const speciesFolders = fs.readdirSync(baseDir);
  let allGood = true;

  for (const species of speciesFolders) {
    const speciesDir = path.join(baseDir, species);
    const files = fs.readdirSync(speciesDir).filter(f => f.endsWith(".json"));

    for (const file of files) {
      const fullPath = path.join(speciesDir, file);
      const raw = fs.readFileSync(fullPath, "utf8");
      let data;
      try {
        data = JSON.parse(raw);
      } catch (e) {
        console.error(`❌ ${fullPath}`);
        console.error("   - Invalid JSON:", e.message);
        allGood = false;
        continue;
      }
      const ok = validateProtocol(data, fullPath);
      if (!ok) allGood = false;
    }
  }

  if (!allGood) {
    process.exitCode = 1;
  } else {
    console.log("🎯 All protocol files valid.");
  }
}

run();