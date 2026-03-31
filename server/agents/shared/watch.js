const chokidar = require("chokidar");
const { execSync } = require("child_process");
const { crossValidate } = require("./crossValidate");
const { validateDocumentOfTruth } = require("./validateDocumentOfTruth");

// Run a shell command safely (ignore failures for optional steps)
function run(cmd) {
  try {
    execSync(cmd, { stdio: "ignore" });
  } catch {
    // Intentionally ignore errors here; validation will still run
  }
}

// Print unified status from both validators
function printStatus(crossResult, docResult) {
  const ok = crossResult.status === "ok" && docResult.status === "ok";

  if (ok) {
    console.log("✅ BEAU OK");
  } else {
    console.log("❌ BEAU ERRORS");
    console.log(
      JSON.stringify(
        {
          crossValidation: crossResult.errors,
          documentOfTruth: docResult.errors
        },
        null,
        2
      )
    );
  }
}

// Full pipeline: version → sync → validate → doc-of-truth
function runPipeline() {
  // Optional build steps (no-op if scripts/files not present)
  run("node server/agents/shared/autoVersionProtocols.js");
  run("node server/agents/shared/syncBEAUBrain.js");

  // Core validation
  const crossResult = crossValidate();
  const docResult = validateDocumentOfTruth();

  printStatus(crossResult, docResult);
}

console.log("👀 BEAU Watch Mode Active…");

// Watch protocols + exercises for any change
const watcher = chokidar.watch(
  [
    "server/agents/shared/protocols",
    "server/agents/shared/exercises",
    "server/agents/shared/approvedProtocols.json",
    "server/agents/shared/constraints.json",
    "server/agents/shared/redFlags.json"
  ],
  {
    ignoreInitial: false,
    persistent: true
  }
);

// On any change, rerun the full pipeline
watcher.on("all", (event, pathChanged) => {
  console.log(`🔄 Change detected (${event}): ${pathChanged}`);
  runPipeline();
});