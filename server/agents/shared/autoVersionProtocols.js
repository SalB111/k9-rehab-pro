const fs = require("fs");
const path = require("path");
const { hashProtocol, bumpVersion } = require("./versioning");

// Paths
const PROTOCOLS_DIR = path.join(__dirname, "protocols");
const SNAPSHOT_DIR = path.join(__dirname, "beau-snapshots");
const SNAPSHOT_PATH = path.join(SNAPSHOT_DIR, "beau-protocols-snapshot.json");

// Helpers
function loadJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function saveJson(p, data) {
  fs.writeFileSync(p, JSON.stringify(data, null, 2), "utf8");
}

function loadCurrentProtocols() {
  const speciesFolders = fs.readdirSync(PROTOCOLS_DIR);
  const protocols = [];

  for (const species of speciesFolders) {
    const speciesDir = path.join(PROTOCOLS_DIR, species);
    const files = fs.readdirSync(speciesDir).filter(f => f.endsWith(".json"));

    for (const file of files) {
      const fullPath = path.join(speciesDir, file);
      const data = loadJson(fullPath);
      protocols.push({ data, path: fullPath });
    }
  }

  return protocols;
}

function indexById(protocolsArray) {
  const map = {};
  for (const p of protocolsArray) {
    map[p.protocolId] = p;
  }
  return map;
}

function determineChangeType(oldProto, newProto) {
  if (!oldProto) return "major"; // brand new protocol

  const oldClean = { ...oldProto };
  const newClean = { ...newProto };

  delete oldClean.version;
  delete oldClean.hash;
  delete newClean.version;
  delete newClean.hash;

  const oldStr = JSON.stringify(oldClean);
  const newStr = JSON.stringify(newClean);

  if (oldStr === newStr) return null; // no change

  // You can refine this later:
  // for now, treat any change as "minor"
  return "minor";
}

function main() {
  console.log("🧠 Auto-versioning protocols...");

  if (!fs.existsSync(PROTOCOLS_DIR)) {
    console.error("❌ Protocols directory not found:", PROTOCOLS_DIR);
    process.exit(1);
  }

  if (!fs.existsSync(SNAPSHOT_DIR)) {
    fs.mkdirSync(SNAPSHOT_DIR, { recursive: true });
  }

  const currentProtocols = loadCurrentProtocols();
  const currentData = currentProtocols.map(p => p.data);

  let previousSnapshot = { protocols: [] };
  if (fs.existsSync(SNAPSHOT_PATH)) {
    previousSnapshot = loadJson(SNAPSHOT_PATH);
  }

  const prevIndex = indexById(previousSnapshot.protocols || []);

  const updatedProtocols = [];

  for (const { data, path: filePath } of currentProtocols) {
    const oldProto = prevIndex[data.protocolId];
    const changeType = determineChangeType(oldProto, data);

    // If no previous version, initialize
    if (!oldProto) {
      data.version = data.version || "1.0.0";
    } else if (changeType) {
      data.version = bumpVersion(oldProto.version || "1.0.0", changeType);
    } else {
      // No change: keep old version if exists
      data.version = oldProto.version || data.version || "1.0.0";
    }

    // Always recompute hash from current content
    data.hash = hashProtocol(data);

    // Write back to protocol file
    saveJson(filePath, data);
    updatedProtocols.push(data);

    console.log(`✅ ${data.protocolId} -> v${data.version}`);
  }

  // Write new snapshot
  const snapshot = {
    generatedAt: new Date().toISOString(),
    protocols: updatedProtocols
  };

  saveJson(SNAPSHOT_PATH, snapshot);
  console.log("\n📁 Snapshot updated at:", SNAPSHOT_PATH);
  console.log("🎯 Auto-versioning complete.");
}

main();