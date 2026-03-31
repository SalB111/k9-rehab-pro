const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname);
const PROTOCOLS_DIR = path.join(ROOT, "protocols");
const EXERCISES_DIR = path.join(ROOT, "exercises");

function ensureDir(p) {
  if (!fs.existsSync(p)) {
    fs.mkdirSync(p, { recursive: true });
    console.log("📁 Created:", p);
  }
}

function writeIfMissing(filePath, content) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content.trim() + "\n", "utf8");
    console.log("📝 Created:", filePath);
  }
}

// --- Canonical JSON payloads (same as we used before) ---

const canineProtocols = {
  "TPLO-8WK.json": `{
    "protocolId": "TPLO-8WK",
    "species": "canine",
    "condition": "post-tplo",
    "phases": {
      "week1-2": {
        "label": "Acute",
        "exercises": [
          { "id": "PROM-FLEX-EXT", "homeSafe": true },
          { "id": "EARLY-MOBILITY", "homeSafe": true }
        ]
      },
      "week3-6": {
        "label": "Sub-acute",
        "exercises": [
          { "id": "LEASH-WALK", "homeSafe": true },
          { "id": "SIT-TO-STAND", "homeSafe": true },
          { "id": "WEIGHT-SHIFTING", "homeSafe": true },
          { "id": "BALANCE-PROP", "homeSafe": true }
        ]
      },
      "week7-12": {
        "label": "Strength & Proprioception",
        "exercises": [
          { "id": "CAVALETTI", "homeSafe": true },
          { "id": "STAIRS-RAMP", "homeSafe": true },
          { "id": "HYDRO-LIGHT", "homeSafe": true }
        ]
      }
    }
  }`,
  "CCL-CONSERVATIVE-12WK.json": `{
    "protocolId": "CCL-CONSERVATIVE-12WK",
    "species": "canine",
    "condition": "ccl-conservative",
    "phases": {
      "week1-2": {
        "label": "Acute",
        "exercises": [
          { "id": "PROM-FLEX-EXT", "homeSafe": true },
          { "id": "EARLY-MOBILITY", "homeSafe": true }
        ]
      },
      "week3-6": {
        "label": "Sub-acute",
        "exercises": [
          { "id": "LEASH-WALK", "homeSafe": true },
          { "id": "WEIGHT-SHIFTING", "homeSafe": true }
        ]
      },
      "week7-12": {
        "label": "Strength & Proprioception",
        "exercises": [
          { "id": "SIT-TO-STAND", "homeSafe": true },
          { "id": "BALANCE-PROP", "homeSafe": true },
          { "id": "CAVALETTI", "homeSafe": true }
        ]
      }
    }
  }`,
  "IVDD-CONSERVATIVE-12WK.json": `{
    "protocolId": "IVDD-CONSERVATIVE-12WK",
    "species": "canine",
    "condition": "ivdd-conservative",
    "phases": {
      "week1-2": {
        "label": "Acute",
        "exercises": [
          { "id": "PROM-FLEX-EXT", "homeSafe": true },
          { "id": "EARLY-MOBILITY", "homeSafe": true }
        ]
      },
      "week3-6": {
        "label": "Sub-acute",
        "exercises": [
          { "id": "LEASH-WALK", "homeSafe": true },
          { "id": "WEIGHT-SHIFTING", "homeSafe": true }
        ]
      },
      "week7-12": {
        "label": "Strength & Proprioception",
        "exercises": [
          { "id": "BALANCE-PROP", "homeSafe": true },
          { "id": "SIT-TO-STAND", "homeSafe": true }
        ]
      }
    }
  }`,
  "OA-CANINE-12WK.json": `{
    "protocolId": "OA-CANINE-12WK",
    "species": "canine",
    "condition": "osteoarthritis",
    "phases": {
      "week1-2": {
        "label": "Mobility & Pain Modulation",
        "exercises": [
          { "id": "PROM-FLEX-EXT", "homeSafe": true },
          { "id": "EARLY-MOBILITY", "homeSafe": true }
        ]
      },
      "week3-6": {
        "label": "Low-Impact Strengthening",
        "exercises": [
          { "id": "LEASH-WALK", "homeSafe": true },
          { "id": "WEIGHT-SHIFTING", "homeSafe": true },
          { "id": "BALANCE-PROP", "homeSafe": true }
        ]
      },
      "week7-12": {
        "label": "Strength, Endurance & Joint Support",
        "exercises": [
          { "id": "SIT-TO-STAND", "homeSafe": true },
          { "id": "CAVALETTI", "homeSafe": true },
          { "id": "HYDRO-LIGHT", "homeSafe": true }
        ]
      }
    }
  }`,
  "GERIATRIC-MOBILITY-12WK.json": `{
    "protocolId": "GERIATRIC-MOBILITY-12WK",
    "species": "canine",
    "condition": "geriatric-mobility",
    "phases": {
      "week1-2": {
        "label": "Gentle Mobility & Comfort",
        "exercises": [
          { "id": "EARLY-MOBILITY", "homeSafe": true },
          { "id": "PROM-FLEX-EXT", "homeSafe": true }
        ]
      },
      "week3-6": {
        "label": "Low-Impact Strength & Stability",
        "exercises": [
          { "id": "LEASH-WALK", "homeSafe": true },
          { "id": "WEIGHT-SHIFTING", "homeSafe": true }
        ]
      },
      "week7-12": {
        "label": "Balance, Endurance & Joint Support",
        "exercises": [
          { "id": "BALANCE-PROP", "homeSafe": true },
          { "id": "SIT-TO-STAND", "homeSafe": true },
          { "id": "HYDRO-LIGHT", "homeSafe": true }
        ]
      }
    }
  }`,
  "POST-FRACTURE-12WK.json": `{
    "protocolId": "POST-FRACTURE-12WK",
    "species": "canine",
    "condition": "post-fracture",
    "phases": {
      "week1-2": {
        "label": "Protection & Gentle Mobility",
        "exercises": [
          { "id": "PROM-FLEX-EXT", "homeSafe": true },
          { "id": "EARLY-MOBILITY", "homeSafe": true }
        ]
      },
      "week3-6": {
        "label": "Controlled Strengthening",
        "exercises": [
          { "id": "LEASH-WALK", "homeSafe": true },
          { "id": "WEIGHT-SHIFTING", "homeSafe": true }
        ]
      },
      "week7-12": {
        "label": "Strength, Proprioception & Return to Function",
        "exercises": [
          { "id": "BALANCE-PROP", "homeSafe": true },
          { "id": "SIT-TO-STAND", "homeSafe": true },
          { "id": "CAVALETTI", "homeSafe": true }
        ]
      }
    }
  }`,
  "POST-AMPUTATION-12WK.json": `{
    "protocolId": "POST-AMPUTATION-12WK",
    "species": "canine",
    "condition": "post-amputation",
    "phases": {
      "week1-2": {
        "label": "Balance & Early Mobility",
        "exercises": [
          { "id": "EARLY-MOBILITY", "homeSafe": true },
          { "id": "WEIGHT-SHIFTING", "homeSafe": true }
        ]
      },
      "week3-6": {
        "label": "Strength & Stability",
        "exercises": [
          { "id": "LEASH-WALK", "homeSafe": true },
          { "id": "BALANCE-PROP", "homeSafe": true }
        ]
      },
      "week7-12": {
        "label": "Advanced Balance & Functional Strength",
        "exercises": [
          { "id": "SIT-TO-STAND", "homeSafe": true },
          { "id": "CAVALETTI", "homeSafe": true },
          { "id": "HYDRO-LIGHT", "homeSafe": true }
        ]
      }
    }
  }`,
  "RETURN-TO-SPORT-12WK.json": `{
    "protocolId": "RETURN-TO-SPORT-12WK",
    "species": "canine",
    "condition": "return-to-sport",
    "phases": {
      "week1-2": {
        "label": "Foundation Strength & Mobility",
        "exercises": [
          { "id": "LEASH-WALK", "homeSafe": true },
          { "id": "SIT-TO-STAND", "homeSafe": true }
        ]
      },
      "week3-6": {
        "label": "Strength, Balance & Coordination",
        "exercises": [
          { "id": "BALANCE-PROP", "homeSafe": true },
          { "id": "WEIGHT-SHIFTING", "homeSafe": true },
          { "id": "CAVALETTI", "homeSafe": true }
        ]
      },
      "week7-12": {
        "label": "Advanced Strength & Sport Readiness",
        "exercises": [
          { "id": "STAIRS-RAMP", "homeSafe": true },
          { "id": "HYDRO-LIGHT", "homeSafe": true },
          { "id": "CAVALETTI", "homeSafe": true }
        ]
      }
    }
  }`
};

const felineProtocols = {
  "FELINE-POST-ORTHO-8WK.json": `{
    "protocolId": "FELINE-POST-ORTHO-8WK",
    "species": "feline",
    "condition": "post-orthopedic",
    "phases": {
      "week1-2": {
        "label": "Acute",
        "exercises": [
          { "id": "FELINE-PROM", "homeSafe": true }
        ]
      },
      "week3-6": {
        "label": "Sub-acute",
        "exercises": [
          { "id": "FELINE-PAW-REACH", "homeSafe": true }
        ]
      }
    }
  }`
};

const exercisesCanine = `{
  "PROM-FLEX-EXT": {
    "name": "PROM Flexion/Extension",
    "defaultFrequency": "2–3x/day",
    "defaultDuration": "5 minutes"
  },
  "EARLY-MOBILITY": {
    "name": "Assisted Early Mobility",
    "defaultFrequency": "2–3x/day",
    "defaultDuration": "3–5 minutes"
  },
  "LEASH-WALK": {
    "name": "Controlled Leash Walk",
    "defaultFrequency": "2x/day",
    "defaultDuration": "5–10 minutes"
  },
  "SIT-TO-STAND": {
    "name": "Sit-to-Stand",
    "defaultFrequency": "1–2x/day",
    "defaultDuration": "5–10 reps"
  },
  "WEIGHT-SHIFTING": {
    "name": "Weight Shifting",
    "defaultFrequency": "1–2x/day",
    "defaultDuration": "1–2 minutes"
  },
  "BALANCE-PROP": {
    "name": "Balance & Proprioception",
    "defaultFrequency": "1x/day",
    "defaultDuration": "3–5 minutes"
  },
  "CAVALETTI": {
    "name": "Cavaletti Poles",
    "defaultFrequency": "1x/day",
    "defaultDuration": "5–10 passes"
  },
  "STAIRS-RAMP": {
    "name": "Controlled Stairs or Ramp Work",
    "defaultFrequency": "1x/day",
    "defaultDuration": "3–5 minutes"
  },
  "HYDRO-LIGHT": {
    "name": "Light Hydrotherapy (Owner-Safe)",
    "defaultFrequency": "1–2x/day",
    "defaultDuration": "5–10 minutes"
  }
}`;

const exercisesFeline = `{
  "FELINE-PROM": {
    "name": "Low-Stress Passive ROM",
    "defaultFrequency": "1–2x/day",
    "defaultDuration": "2–3 minutes"
  },
  "FELINE-PAW-REACH": {
    "name": "Controlled Reaching",
    "defaultFrequency": "1–2x/day",
    "defaultDuration": "3–5 reps"
  }
}`;

const indexProtocolsJs = `
const fs = require("fs");
const path = require("path");

function loadProtocols() {
  const baseDir = path.join(__dirname, "protocols");
  if (!fs.existsSync(baseDir)) return { protocols: [] };

  const speciesFolders = fs.readdirSync(baseDir);
  const allProtocols = [];

  for (const species of speciesFolders) {
    const speciesDir = path.join(baseDir, species);
    const files = fs.readdirSync(speciesDir).filter(f => f.endsWith(".json"));

    for (const file of files) {
      const fullPath = path.join(speciesDir, file);
      const data = JSON.parse(fs.readFileSync(fullPath, "utf8"));
      allProtocols.push(data);
    }
  }

  return { protocols: allProtocols };
}

module.exports = loadProtocols();
`.trim();

const indexExercisesJs = `
const fs = require("fs");
const path = require("path");

function loadExercises() {
  const baseDir = path.join(__dirname, "exercises");
  if (!fs.existsSync(baseDir)) return {};

  const files = fs.readdirSync(baseDir).filter(f => f.endsWith(".json"));
  const bySpecies = {};

  for (const file of files) {
    const speciesKey = path.basename(file, ".json");
    const fullPath = path.join(baseDir, file);
    const data = JSON.parse(fs.readFileSync(fullPath, "utf8"));
    bySpecies[speciesKey] = data;
  }

  return bySpecies;
}

module.exports = loadExercises();
`.trim();

function main() {
  console.log("🔧 Auto-repair starting...");

  ensureDir(PROTOCOLS_DIR);
  ensureDir(path.join(PROTOCOLS_DIR, "canine"));
  ensureDir(path.join(PROTOCOLS_DIR, "feline"));
  ensureDir(EXERCISES_DIR);

  // Protocols
  for (const [file, content] of Object.entries(canineProtocols)) {
    writeIfMissing(path.join(PROTOCOLS_DIR, "canine", file), content);
  }
  for (const [file, content] of Object.entries(felineProtocols)) {
    writeIfMissing(path.join(PROTOCOLS_DIR, "feline", file), content);
  }

  // Exercises
  writeIfMissing(path.join(EXERCISES_DIR, "canine.json"), exercisesCanine);
  writeIfMissing(path.join(EXERCISES_DIR, "feline.json"), exercisesFeline);

  // Index loaders
  writeIfMissing(path.join(ROOT, "indexProtocols.js"), indexProtocolsJs);
  writeIfMissing(path.join(ROOT, "indexExercises.js"), indexExercisesJs);

  console.log("✅ Auto-repair complete.");
}

main();