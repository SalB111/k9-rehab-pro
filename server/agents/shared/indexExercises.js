const fs = require("fs");
const path = require("path");

function loadExercises() {
  const baseDir = path.join(__dirname, "exercises");
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
