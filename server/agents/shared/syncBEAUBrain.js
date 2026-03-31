const path = require("path");
const fs = require("fs");

const protocols = require("./indexProtocols");
const exercises = require("./indexExercises");

const OUT_DIR = path.join(__dirname, "beau-snapshots");

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function main() {
  ensureDir(OUT_DIR);

  const snapshot = {
    generatedAt: new Date().toISOString(),
    protocolCount: protocols.protocols.length,
    species: {
      canine: protocols.protocols.filter(p => p.species === "canine").length,
      feline: protocols.protocols.filter(p => p.species === "feline").length
    },
    exercises: Object.keys(exercises),
  };

  fs.writeFileSync(
    path.join(OUT_DIR, "beau-protocols-snapshot.json"),
    JSON.stringify(protocols, null, 2),
    "utf8"
  );

  fs.writeFileSync(
    path.join(OUT_DIR, "beau-exercises-snapshot.json"),
    JSON.stringify(exercises, null, 2),
    "utf8"
  );

  fs.writeFileSync(
    path.join(OUT_DIR, "beau-summary.json"),
    JSON.stringify(snapshot, null, 2),
    "utf8"
  );

  console.log("✅ BEAU Brain sync snapshot written to:", OUT_DIR);
  console.log("   Protocols:", snapshot.protocolCount);
  console.log("   Canine:", snapshot.species.canine, "Feline:", snapshot.species.feline);
}

main();