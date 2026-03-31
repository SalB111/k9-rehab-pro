const fs = require("fs");
const path = require("path");

// Paths
const SNAPSHOT_DIR = path.join(__dirname, "beau-snapshots");
const CURRENT = path.join(SNAPSHOT_DIR, "beau-protocols-snapshot.json");
const OLD = path.join(SNAPSHOT_DIR, "beau-protocols-snapshot-old.json");

// Loaders
function loadJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

// Diff logic
function indexById(protocols) {
  const map = {};
  for (const p of protocols) map[p.protocolId] = p;
  return map;
}

function diffProtocols(oldSet, newSet) {
  const oldMap = indexById(oldSet.protocols || []);
  const newMap = indexById(newSet.protocols || []);

  const added = [];
  const removed = [];
  const changed = [];

  for (const id of Object.keys(oldMap)) {
    if (!newMap[id]) removed.push(id);
    else if (JSON.stringify(oldMap[id]) !== JSON.stringify(newMap[id])) changed.push(id);
  }

  for (const id of Object.keys(newMap)) {
    if (!oldMap[id]) added.push(id);
  }

  return { added, removed, changed };
}

// Main
function main() {
  console.log("🔄 Running BEAU sync...");
  require("./syncBEAUBrain.js"); // generates new snapshot

  // Ensure snapshot folder exists
  if (!fs.existsSync(SNAPSHOT_DIR)) fs.mkdirSync(SNAPSHOT_DIR, { recursive: true });

  // If no old snapshot exists, create one
  if (!fs.existsSync(OLD)) {
    console.log("📁 No old snapshot found — creating baseline...");
    fs.copyFileSync(CURRENT, OLD);
  }

  // Load snapshots
  const oldSet = loadJson(OLD);
  const newSet = loadJson(CURRENT);

  // Diff
  const { added, removed, changed } = diffProtocols(oldSet, newSet);

  console.log("\n📊 BEAU Protocol Diff Report");
  console.log("----------------------------");

  console.log("➕ Added:", added.length ? added.join(", ") : "(none)");
  console.log("➖ Removed:", removed.length ? removed.join(", ") : "(none)");
  console.log("✏ Changed:", changed.length ? changed.join(", ") : "(none)");

  // Update old snapshot for next run
  fs.copyFileSync(CURRENT, OLD);
  console.log("\n📁 Old snapshot updated for next diff.");
  console.log("🎯 Done.");
}

main();