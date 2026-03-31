const fs = require("fs");
const path = require("path");
const defaultSchema = require("./dogStateSchema");

const STATE_DIR = path.join(__dirname, "dog-states");
if (!fs.existsSync(STATE_DIR)) fs.mkdirSync(STATE_DIR, { recursive: true });

function statePath(dogId) {
  return path.join(STATE_DIR, `${dogId}.json`);
}

function getDogState(dogId) {
  const p = statePath(dogId);
  if (!fs.existsSync(p)) {
    const newState = {
      ...defaultSchema,
      dogId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    fs.writeFileSync(p, JSON.stringify(newState, null, 2));
    return newState;
  }
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function saveDogState(dogId, state) {
  const p = statePath(dogId);
  state.updatedAt = new Date().toISOString();
  fs.writeFileSync(p, JSON.stringify(state, null, 2));
  return state;
}

function updateDogState(dogId, partial) {
  const current = getDogState(dogId);
  const updated = { ...current, ...partial, updatedAt: new Date().toISOString() };
  saveDogState(dogId, updated);
  return updated;
}

module.exports = {
  getDogState,
  saveDogState,
  updateDogState
};