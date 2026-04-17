// Extract user-facing English strings from all frontend source files.
const fs = require("fs");
const path = require("path");

const SRC = path.join(__dirname, "..", "src");
const OUT = path.join(__dirname, "..", "extracted-strings.json");

function walk(dir, files = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, files);
    else if (/\.(jsx?|tsx?)$/.test(ent.name)) files.push(p);
  }
  return files;
}

const STOP = new Set([
  "Select…", "Select...", "Loading…", "Loading...", "…", "...", "-", "—", "+", "=",
]);

const isCode = (s) =>
  /^[a-z_][a-z0-9_]*$/.test(s) ||
  /^[A-Z][A-Z0-9_]+$/.test(s) ||
  /^\d+(\.\d+)?$/.test(s) ||
  /^#[0-9a-fA-F]{3,8}$/.test(s) ||
  /^[a-z]+:[^\s]+$/.test(s) ||           // CSS/URL
  /^\/[^\s]*$/.test(s) ||                 // paths
  /^https?:\/\//.test(s) ||
  /^[^A-Za-z]*$/.test(s);                 // no letters

const looksLikeDataKey = (s) =>
  /::/.test(s) ||                          // "client::Species"
  /^(global|client|assessment|treatment|protocol|metrics|goals|home|diagnostics|conditioning|equipment|library|nutrition)::/.test(s);

const perFile = {};
const all = new Set();

for (const f of walk(SRC)) {
  const rel = path.relative(SRC, f).split(path.sep).join("/");
  const src = fs.readFileSync(f, "utf8");
  const found = new Set();

  // label="...", placeholder="...", title="...", hint="...", aria-label="...", alt="..."
  for (const re of [
    /\blabel=\{?"([^"]{1,200})"\}?/g,
    /\bplaceholder=\{?"([^"]{1,200})"\}?/g,
    /\btitle=\{?"([A-Z][^"]{1,200})"\}?/g,
    /\bhint=\{?"([^"]{1,200})"\}?/g,
    /\baria-label=\{?"([^"]{1,200})"\}?/g,
    /\balt=\{?"([^"]{1,200})"\}?/g,
  ]) {
    let m;
    while ((m = re.exec(src)) !== null) {
      const s = m[1].trim();
      if (s && /[A-Za-z]/.test(s) && !isCode(s) && !looksLikeDataKey(s) && !STOP.has(s)) found.add(s);
    }
  }

  // JSX text nodes — stuff between > and < that is actual letters
  const jsxText = /> *([A-Z][A-Za-z0-9 ,.\-:!?&—'"/#()]{2,160}?) *</g;
  let m;
  while ((m = jsxText.exec(src)) !== null) {
    let s = m[1].trim();
    if (!s || !/[A-Za-z]/.test(s)) continue;
    if (isCode(s) || looksLikeDataKey(s) || STOP.has(s)) continue;
    if (/^(true|false|null|undefined)$/i.test(s)) continue;
    found.add(s);
  }

  // Array literals that look like option lists
  const arrRe = /\[\s*("[^"]{1,150}"\s*,\s*)+"[^"]{1,150}"\s*\]/g;
  while ((m = arrRe.exec(src)) !== null) {
    const parts = m[0].match(/"([^"]+)"/g) || [];
    for (const p of parts) {
      const s = p.slice(1, -1).trim();
      if (!s || !/[A-Za-z]/.test(s)) continue;
      if (isCode(s) || looksLikeDataKey(s) || STOP.has(s)) continue;
      if (s.length > 120) continue;
      // Skip obvious breed/enum lists by heuristic — leave these to be marked
      found.add(s);
    }
  }

  if (found.size > 0) {
    perFile[rel] = [...found].sort();
    for (const s of found) all.add(s);
  }
}

fs.writeFileSync(OUT, JSON.stringify({
  totalUnique: all.size,
  perFile,
  allSorted: [...all].sort(),
}, null, 2));

console.log("Files with strings:", Object.keys(perFile).length);
console.log("Total unique strings:", all.size);
console.log("Top 10 files by count:");
for (const [f, arr] of Object.entries(perFile).sort((a, b) => b[1].length - a[1].length).slice(0, 10)) {
  console.log(" ", f, arr.length);
}
