const fs = require("fs");
const path = require("path");

function loadJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function indexById(protocols) {
  const map = {};
  for (const p of protocols) {
    map[p.protocolId] = p;
  }
  return map;
}

function diffProtocols(oldSet, newSet) {
  const oldMap = indexById(oldSet.protocols || []);
  const newMap = indexById(newSet.protocols || []);

  const added = [];
  const removed = [];
  const changed = [];

  for (const id of Object.keys(oldMap)) {
    if (!newMap[id]) {
      removed.push(id);
    } else {
      const oldStr = JSON.stringify(oldMap[id]);
      const newStr = JSON.stringify(newMap[id]);
      if (oldStr !== newStr) changed.push(id);
    }
  }

  for (const id of Object.keys(newMap)) {
    if (!oldMap[id]) added.push(id);
  }

  return { added, removed, changed };
}

function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error("Usage: node diffProtocols.js <old.json> <new.json>");
    process.exit(1);
  }

  const oldPath = path.resolve(args[0]);
  const newPath = path.resolve(args[1]);

  const oldSet = loadJson(oldPath);
  const newSet = loadJson(newPath);

  const { added, removed, changed } = diffProtocols(oldSet, newSet);

  console.log("📊 Protocol diff:");
  console.log("  Added:", added.length ? added.join(", ") : "(none)");
  console.log("  Removed:", removed.length ? removed.join(", ") : "(none)");
  console.log("  Changed:", changed.length ? changed.join(", ") : "(none)");
}

main();