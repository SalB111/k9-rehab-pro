const fs = require("fs");
const path = require("path");

function loadProtocols() {
  const baseDir = path.join(__dirname, "protocols");
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
