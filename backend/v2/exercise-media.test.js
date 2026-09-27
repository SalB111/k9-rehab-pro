/**
 * Exercise media for B.E.A.U. at Home — tests
 *
 * WHAT THIS EXISTS FOR
 *
 * Sal, 2026-09-26: "WHAT I WANT TO ADD TO THIS WHICH IT SHOULD HAVE IS THE
 * STORYBOOK ... ON HOW TO PERFORM THE PRESCRIBED EXERCISES IN BEAU AT HOME.
 * K9 REHAB PRO HAS THEM IN THE EXERCISE LIBRARY".
 *
 * The owner app showed an exercise NAME and a rep count. The pencil drawings
 * had been in the clinician app the whole time.
 *
 * THE TWO THINGS THAT MUST NOT SLIP
 *
 *   1. NO SUBSTITUTE PICTURES. 16 of Haley's 25 prescribed exercises have
 *      drawings; 9 have none. An exercise with no drawing must answer "none",
 *      never another exercise's frames, never a breed portrait. A wrong
 *      demonstration of a prescribed clinical movement is worse than no
 *      picture, because the owner copies it.
 *
 *   2. AN OWNER TOKEN IS NOT A LIBRARY CARD. The code must be in that
 *      patient's own handed-off program. A patient-scoped token that can
 *      enumerate all 260 exercises is not patient-scoped.
 *
 * Plus: the frame list comes from the DISK, not the manifest. The run that
 * died tonight on "no credits remaining" is exactly how a manifest comes to
 * name a frame whose file was never written.
 *
 *   node v2/exercise-media.test.js
 */

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const media = require('./exercise-media');

let passed = 0;
const failures = [];
function test(name, fn) {
  return Promise.resolve().then(fn)
    .then(() => { passed += 1; console.log(`  ok    ${name}`); })
    .catch((err) => {
      failures.push(name);
      console.log(`  FAIL  ${name}\n          ${err.message.split('\n')[0]}`);
    });
}

/** An exercise known to have drawings, and one known to have none. */
const ILLUSTRATED = 'PROM_STIFLE';
const BARE = 'WATER_WALKING';

(async () => {
  console.log('\nexercise-media\n');

  // ── the drawings that exist ─────────────────────────────────────────────

  await test('an illustrated exercise returns its frames', async () => {
    const d = media.storyboardFor(ILLUSTRATED);
    assert.ok(d, 'no answer at all');
    assert.strictEqual(d.has_illustration, true);
    assert.ok(d.frames.length >= 4, `${ILLUSTRATED} came back with ${d.frames.length} frames`);
  });

  await test('THE DISK IS THE AUTHORITY — every frame URL is a file that exists', async () => {
    // A manifest can name a frame whose PNG was never written; tonight's
    // failed render would have produced exactly that. An <img> pointed at a
    // frame that is not there is a broken picture on a clinical instruction.
    const d = media.storyboardFor(ILLUSTRATED);
    for (const f of d.frames) {
      const onDisk = path.join(media.FRAME_ROOT, ILLUSTRATED, `frame-${f.number}.png`);
      assert.ok(fs.existsSync(onDisk), `frame ${f.number} is offered and does not exist`);
      assert.strictEqual(f.url, `/assets/storyboard/${ILLUSTRATED}/frame-${f.number}.png`);
    }
  });

  await test('THE DISK BEATS THE MANIFEST when they disagree', async () => {
    // Mutation testing caught this one as a hole. The test above only proves
    // that offered frames exist, and against the real assets the manifest and
    // the disk agree everywhere — so reading the manifest instead passed it.
    // This builds the disagreement on purpose: a manifest naming three frames
    // with only one file written, which is exactly what tonight's render
    // would have left when it died on "no credits remaining".
    const os = require('os');
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'k9-frames-'));
    const dir = path.join(root, 'FAKE_EXERCISE');
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify({
      frames: { 1: 'aaa', 2: 'bbb', 3: 'ccc' }, species: 'CANINE', breed: 'Labrador Retriever',
    }));
    fs.writeFileSync(path.join(dir, 'frame-1.png'), Buffer.from([0x89, 0x50, 0x4e, 0x47]));

    const d = media.storyboardFor('FAKE_EXERCISE', { root });
    fs.rmSync(root, { recursive: true, force: true });

    assert.strictEqual(
      d.frames.length, 1,
      `the manifest named 3 frames and only 1 file exists; ${d.frames.length} were offered. `
      + 'An offered frame with no file is a broken picture on a clinical instruction.'
    );
    assert.strictEqual(d.frames[0].number, 1);
  });

  await test('each frame carries the words, not just the picture', async () => {
    // The drawing shows a position; the text is the instruction an owner
    // acts on. One without the other is half the exercise.
    const d = media.storyboardFor(ILLUSTRATED);
    const withText = d.frames.filter((f) => f.title || f.handler_action);
    assert.ok(
      withText.length === d.frames.length,
      `${d.frames.length - withText.length} frame(s) are a picture with no instruction`
    );
  });

  await test('the model breed is named, so nobody wonders why it is not their dog', async () => {
    const d = media.storyboardFor(ILLUSTRATED);
    assert.ok(d.model_breed, 'the drawings do not say which breed is modelled');
  });

  // ── the drawings that do not exist ──────────────────────────────────────

  await test('NO SUBSTITUTES — an exercise with no drawing says so and shows nothing', async () => {
    const d = media.storyboardFor(BARE);
    assert.ok(d, 'no answer at all');
    assert.strictEqual(d.has_illustration, false);
    assert.deepStrictEqual(
      d.frames, [],
      'frames were offered for an exercise that has none — a wrong demonstration '
      + 'of a prescribed movement is worse than no picture'
    );
  });

  await test('there is no video, and none is implied', async () => {
    // VIDEO_LIBRARY has 2 entries and neither carries a file or a URL.
    for (const code of [ILLUSTRATED, BARE]) {
      assert.deepStrictEqual(
        media.storyboardFor(code).video, [],
        `${code} offers video. There is no footage in this repo; a player over `
        + 'nothing is a promise the library cannot keep.'
      );
    }
  });

  // ── nothing user-supplied reaches the disk ──────────────────────────────

  await test('a path traversal is refused, not resolved', async () => {
    for (const bad of ['../../../etc/passwd', '..\\..\\.env', 'PROM_STIFLE/../../..', '', null]) {
      assert.strictEqual(media.safeCode(bad), null, `safeCode accepted ${JSON.stringify(bad)}`);
      assert.strictEqual(media.storyboardFor(bad), null, `storyboardFor accepted ${JSON.stringify(bad)}`);
    }
  });

  await test('an unknown but well-formed code is empty, not an error', async () => {
    const d = media.storyboardFor('NOT_A_REAL_EXERCISE');
    assert.ok(d, 'a well-formed unknown code threw instead of answering');
    assert.strictEqual(d.has_illustration, false);
  });

  // ── the library record must reach the generator ─────────────────────────

  await test('THE MISTAKE THAT MISREPORTED THE LIBRARY — the record reaches the generator', async () => {
    // getOrGenerateStoryboard(code) with ONE argument returns null for
    // everything not hand-authored, which is 256 of the 260. Calling it that
    // way is how I told Sal only four exercises had storyboards. This asserts
    // the record is resolved and passed.
    assert.ok(media.libraryRecord(ILLUSTRATED), `${ILLUSTRATED} is not in the library`);

    const storyboards = require('../storyboard-references');
    assert.strictEqual(
      storyboards.getOrGenerateStoryboard('WOBBLE_BOARD'), null,
      'the one-argument call no longer returns null — re-check this claim'
    );

    // Asserted through storyboardFor, not by calling the generator directly.
    // The first version tested the generator and left storyboardFor free to
    // drop the record — mutation testing walked straight through it. Without
    // the record there IS no script, so every frame comes back as a picture
    // with no instruction.
    const d = media.storyboardFor('WOBBLE_BOARD');
    assert.ok(d.frames.length, 'WOBBLE_BOARD has no frames on disk — pick another code');
    assert.ok(
      d.frames.every((f) => f.title && f.handler_action),
      'frames came back with no words, which means the library record is not '
      + 'reaching the storyboard generator — the mistake that made me report '
      + 'four storyboards when there are 260'
    );
  });

  // ── the owner route is scoped to this patient's own program ─────────────

  await test('AN OWNER TOKEN IS NOT A LIBRARY CARD — the route checks the program', async () => {
    const router = fs.readFileSync(path.join(__dirname, 'routes', 'beau-router.js'), 'utf8');
    const from = router.indexOf("router.get('/exercises/:code/storyboard'");
    assert.ok(from !== -1, 'the storyboard route is gone');
    const handler = router.slice(from, router.indexOf('router.', from + 10));

    assert.ok(
      /payload\.exercises\s*\|\|\s*\[\]\)\.find\(\(e\)\s*=>\s*e\.exercise_code === code\)/.test(handler),
      'the route does not check that the code is in this patient\'s program, so an '
      + 'owner token can enumerate the whole exercise library'
    );
    assert.ok(
      /404/.test(handler),
      'a code outside the program is not refused'
    );
    assert.ok(
      /guard/.test(router.slice(from, from + 200)),
      'the route is unguarded'
    );
  });

  await test('the frames are served, and a missing one is a 404 not an HTML page', async () => {
    // CODE ONLY. The first version grepped the whole file and matched the
    // COMMENT above the option, which says "fallthrough:false" in prose — so
    // flipping the real option to true kept the test green. Asserting against
    // a comment is asserting against nothing.
    const server = fs.readFileSync(path.join(__dirname, '..', 'server.js'), 'utf8')
      .split(/\r?\n/)
      .filter((l) => !l.trim().startsWith('//'))
      .join('\n');
    assert.ok(
      /"\/assets\/storyboard"/.test(server),
      'the backend does not serve the frames, so the owner app has nothing to point at'
    );
    assert.ok(
      /fallthrough:\s*false/.test(server),
      'a missing frame falls through to the SPA and returns index.html with a 200, '
      + 'which an <img> renders as a broken picture instead of an honest absence'
    );
  });

  // ── the owner app ───────────────────────────────────────────────────────

  await test('the owner app asks for the storyboard and renders it', async () => {
    const appPath = path.join('C:', 'Users', 'User', 'beauaihome', 'src', 'pages', 'hep', 'BeauHomeApp.jsx');
    if (!fs.existsSync(appPath)) {
      console.log('        (B.E.A.U. at Home not present at the expected path — skipped)');
      return;
    }
    const jsx = fs.readFileSync(appPath, 'utf8');
    assert.ok(
      /<HowToPerform\s+code=\{exercise\.exercise_code\}/.test(jsx),
      'the exercise screen does not render the storyboard'
    );
    assert.ok(
      /getExerciseStoryboard\(code\)/.test(jsx),
      'the component does not fetch the storyboard'
    );
    assert.ok(
      /There is no illustration for this exercise yet/.test(jsx),
      'the app has no honest answer for an exercise with no drawing, so it will '
      + 'either render nothing or reach for a substitute picture'
    );
  });

  console.log('');
  if (failures.length) {
    console.error(`FAILED ${failures.length} of ${passed + failures.length}\n`);
    process.exit(1);
  }
  console.log(`exercise-media: ${passed} passed\n`);
})();
