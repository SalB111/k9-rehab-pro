const fs = require("fs");
const path = require("path");

// Core paths
const ROOT = __dirname;
const SNAPSHOT_DIR = path.join(ROOT, "beau-snapshots");
const PROTOCOL_SNAPSHOT = path.join(SNAPSHOT_DIR, "beau-protocols-snapshot.json");
const CHANGELOG_PATH = path.join(SNAPSHOT_DIR, "beau-changelog.json");
const EXERCISES_DIR = path.join(ROOT, "exercises");
const VIDEO_LIBRARY_PATH = path.join(ROOT, "videoLibrary.json");
const APPROVED_PROTOCOLS_PATH = path.join(ROOT, "approvedProtocols.json");
const CONSTRAINTS_PATH = path.join(ROOT, "constraints.json");
const RED_FLAGS_PATH = path.join(ROOT, "redFlags.json");

// Lazy loaders
function safeLoadJson(p, fallback) {
  try {
    if (!fs.existsSync(p)) return fallback;
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return fallback;
  }
}

function loadProtocolSnapshot() {
  return safeLoadJson(PROTOCOL_SNAPSHOT, { generatedAt: null, protocols: [] });
}

function loadChangelog() {
  return safeLoadJson(CHANGELOG_PATH, []);
}

function loadExercises() {
  const result = {};
  if (!fs.existsSync(EXERCISES_DIR)) return result;

  const files = fs.readdirSync(EXERCISES_DIR).filter(f => f.endsWith(".json"));
  for (const file of files) {
    const speciesKey = path.basename(file, ".json");
    const fullPath = path.join(EXERCISES_DIR, file);
    result[speciesKey] = safeLoadJson(fullPath, {});
  }
  return result;
}

function loadVideoLibrary() {
  return safeLoadJson(VIDEO_LIBRARY_PATH, {});
}

function loadApprovedProtocols() {
  return safeLoadJson(APPROVED_PROTOCOLS_PATH, []);
}

function loadConstraints() {
  return safeLoadJson(CONSTRAINTS_PATH, {
    species: [],
    conditions: [],
    maxExercisesPerPhase: 10,
    minExercisesPerPhase: 1
  });
}

function loadRedFlags() {
  return safeLoadJson(RED_FLAGS_PATH, {
    hardStops: [],
    softFlags: []
  });
}

// Index helpers
function indexProtocolsById(protocols) {
  const map = {};
  for (const p of protocols) {
    map[p.protocolId] = p;
  }
  return map;
}

function indexChangelogByProtocol(changelog) {
  const map = {};
  for (const entry of changelog) {
    if (!map[entry.protocolId]) map[entry.protocolId] = [];
    map[entry.protocolId].push(entry);
  }
  return map;
}

// Unified loader
function loadBEAUBrain() {
  const snapshot = loadProtocolSnapshot();
  const protocols = snapshot.protocols || [];
  const changelog = loadChangelog();
  const exercises = loadExercises();
  const videoLibrary = loadVideoLibrary();
  const approvedProtocols = loadApprovedProtocols();
  const constraints = loadConstraints();
  const redFlags = loadRedFlags();

  const protocolIndex = indexProtocolsById(protocols);
  const changelogIndex = indexChangelogByProtocol(changelog);

  return {
    // Raw data
    snapshotGeneratedAt: snapshot.generatedAt,
    protocols,
    exercises,
    videoLibrary,
    approvedProtocols,
    changelog,

    // Accessors
    getProtocol(id) {
      return protocolIndex[id] || null;
    },

    getExercise(species, exerciseId) {
      const speciesSet = exercises[species];
      if (!speciesSet) return null;
      return speciesSet[exerciseId] || null;
    },

    getProtocolHistory(id) {
      return changelogIndex[id] || [];
    },

    getProtocolVersion(id) {
      const p = protocolIndex[id];
      return p ? p.version || null : null;
    },

    getProtocolHash(id) {
      const p = protocolIndex[id];
      return p ? p.hash || null : null;
    },

    isProtocolApproved(id) {
      return approvedProtocols.includes(id);
    },

    listProtocols() {
      return protocols.map(p => ({
        id: p.protocolId,
        species: p.species,
        condition: p.condition,
        version: p.version,
        hash: p.hash
      }));
    },

    listExercisesBySpecies(species) {
      return exercises[species] || {};
    },

    listVideos() {
      return videoLibrary;
    },

    // Evidence-based truth sources
    getConstraints() {
      return constraints;
    },

    listRedFlags() {
      return redFlags;
    }
  };
}

module.exports = loadBEAUBrain;