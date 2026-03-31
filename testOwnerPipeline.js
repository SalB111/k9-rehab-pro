const runOwnerPipeline = require("./server/agents/owner/pipeline");

// toggle which scenario you want to run:
const SCENARIO = "feline"; // "canine" or "feline"

function getOwnerData() {
  if (SCENARIO === "canine") {
    return {
      species: "canine",
      dogName: "Rex",
      condition: "post-tplo",
      weeksPostSurgery: 3,
      vetCleared: true
    };
  }

  // default: feline



  return {
    species: "feline",
    catName: "Mochi",
    condition: "post-orthopedic",
    weeksPostSurgery: 3,
    vetCleared: true
  };
}

async function test() {
  const ownerData = getOwnerData();
  const result = await runOwnerPipeline(ownerData);
  console.log(JSON.stringify(result, null, 2));
}

test().catch(err => {
  console.error(err);
  process.exit(1);
});