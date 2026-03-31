const crypto = require("crypto");

function hashProtocol(protocol) {
  const clean = { ...protocol };
  delete clean.hash;
  delete clean.version;

  const json = JSON.stringify(clean);
  return crypto.createHash("sha256").update(json).digest("hex");
}

function bumpVersion(oldVersion, changeType) {
  let [major, minor, patch] = oldVersion.split(".").map(Number);

  switch (changeType) {
    case "major":
      major += 1;
      minor = 0;
      patch = 0;
      break;
    case "minor":
      minor += 1;
      patch = 0;
      break;
    default:
      patch += 1;
  }

  return `${major}.${minor}.${patch}`;
}

module.exports = {
  hashProtocol,
  bumpVersion
};