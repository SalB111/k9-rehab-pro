const fs = require("fs");
const path = require("path");

const baseDir = path.join(__dirname, "protocols");

const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const RESET = "\x1b[0m";

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
    console.log(`${RED}❌ ${filePath}${RESET}`);
    errors.forEach(e => console.log(`   ${YELLOW}- ${e}${RESET}`));
    return false;
  } else {
    console.log(`${GREEN}✅ ${filePath}${RESET}`);
    return true;
  }
}

function run() {
  if (!fs.existsSync(baseDir)) {
    console.log(`${YELLOW}⚠ protocols directory not found at ${baseDir}${RESET}`);
    process.exitCode = 1;
    return;
  }

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
        console.log(`${RED}❌ ${fullPath}${RESET}`);
        console.log(`   ${YELLOW}- Invalid JSON: ${e.message}${RESET}`);
        allGood = false;
        continue;
      }
      const ok = validateProtocol(data, fullPath);
      if (!ok) allGood = false;
    }
  }

  if (!allGood) {
    console.log(`${RED}❗ Validation failed.${RESET}`);
    process.exitCode = 1;
  } else {
    console.log(`${GREEN}🎯 All protocol files valid.${RESET}`);
  }
}

run();