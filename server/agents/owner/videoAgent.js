const videoLibrary = require("../shared/videoLibrary.json");

async function videoAgent({ condition, phaseKey, species, approvedExercises }) {
  const libraryKey = species === "feline" ? "FELINE" : "TPLO";
  const videosForKey = videoLibrary[libraryKey] || {};

  const videos = approvedExercises
    .map(ex => {
      const url = videosForKey[ex.id];
      return url ? { id: ex.id, url } : null;
    })
    .filter(Boolean);

  return {
    species,
    phase: phaseKey,
    videos
  };
}

module.exports = videoAgent;