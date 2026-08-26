#!/usr/bin/env node
/**
 * Firestore seed script for DineConnect.
 *
 * Reads the local fixture data from frontend/src/data/restaurants.ts,
 * evaluates the array literal with Node's `vm` module (no compile step),
 * and writes the restaurants to Firestore. Idempotent — re-running
 * overwrites the same docs.
 *
 * Setup (one time):
 *   1. npm install firebase-admin   (in this dir, or in backend/)
 *   2. In Firebase Console → Project Settings → Service Accounts →
 *      "Generate new private key". Save the JSON next to this file as
 *      `service-account.json` (gitignored).
 *   3. node scripts/seed-firestore.js
 *
 * Optional flags:
 *   --dry-run    Print what would be written, don't touch Firestore.
 *   --out=path   Write a JSON file of the parsed fixtures and exit.
 */

import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SERVICE_ACCOUNT_PATH = join(__dirname, 'service-account.json');
const RESTAURANTS_TS = join(ROOT, 'frontend', 'src', 'data', 'restaurants.ts');

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const OUT_ARG = args.find((a) => a.startsWith('--out='));
const OUT_PATH = OUT_ARG ? OUT_ARG.slice('--out='.length) : null;

function log(...a) { console.log('[seed]', ...a); }
function warn(...a) { console.warn('[seed][warn]', ...a); }
function fatal(msg) { console.error('[seed][fatal]', msg); process.exit(1); }

/** Extract and evaluate the `export const restaurants = [ ... ]` array. */
function loadRestaurants() {
  if (!existsSync(RESTAURANTS_TS)) {
    fatal(`Restaurants data file not found: ${RESTAURANTS_TS}`);
  }
  const src = readFileSync(RESTAURANTS_TS, 'utf8');

  // Locate the start of the array literal after the `=`.
  // The first `export const restaurants` occurrence is the TYPE definition
  // (e.g. `export const cuisines: Cuisine[] = [...]` is a different const).
  // Find the `export const restaurants` line that has a real array, not a type.
  const marker = 'export const restaurants';
  let searchFrom = 0;
  let arrStart = -1;
  while (true) {
    const idx = src.indexOf(marker, searchFrom);
    if (idx < 0) fatal('Could not find `export const restaurants` in data file');
    const eq = src.indexOf('=', idx);
    if (eq < 0) { searchFrom = idx + marker.length; continue; }
    const found = src.indexOf('[', eq);
    const lineEnd = src.indexOf('\n', eq);
    if (found < 0 || (lineEnd > 0 && found > lineEnd)) {
      searchFrom = idx + marker.length;
      continue;
    }
    arrStart = found;
    break;
  }

  // Walk to the matching `]`, tracking brackets and strings.
  let depth = 1;
  let i = arrStart + 1;
  let inStr = false;
  let strCh = '';
  let escaped = false;
  for (; i < src.length; i++) {
    const c = src[i];
    if (inStr) {
      if (escaped) { escaped = false; continue; }
      if (c === '\\') { escaped = true; continue; }
      if (c === strCh) inStr = false;
      continue;
    }
    if (c === "'" || c === '"' || c === '`') { inStr = true; strCh = c; continue; }
    if (c === '[') depth++;
    else if (c === ']') { depth--; if (depth === 0) break; }
  }
  if (depth !== 0) fatal('Unbalanced brackets in restaurants array');

  const body = src.slice(arrStart, i + 1);

  // Evaluate the array literal in an isolated context. We provide stand-ins
  // for the few helpers the data file uses: `MenuItem` (TS type erased),
  // and `gradient(from, to)` which is a string-returning helper defined in
  // the same .ts file but outside the array.
  const ctx = {
    MenuItem: class MenuItem {},
    // Mirror the helper from the .ts file: returns a CSS linear-gradient string.
    gradient: (from, to) => `linear-gradient(135deg, ${from} 0%, ${to} 100%)`,
    exports: {},
    module: { exports: {} },
  };
  vm.createContext(ctx);

  // Wrap the literal in `module.exports = <body>;` so we can pull it out.
  const code = `module.exports = ${body};`;
  try {
    vm.runInContext(code, ctx, { filename: 'restaurants-fixture.vm' });
  } catch (err) {
    fatal(`Failed to evaluate restaurants array: ${err.message}`);
  }

  return ctx.module.exports;
}

function stripUndefined(obj) {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined) continue;
    out[k] = v;
  }
  return out;
}

async function main() {
  log(`loading restaurants from ${RESTAURANTS_TS}`);
  const entries = loadRestaurants();
  if (!Array.isArray(entries)) fatal('Parsed value is not an array');
  log(`found ${entries.length} restaurants`);

  if (OUT_PATH) {
    writeFileSync(OUT_PATH, JSON.stringify(entries, null, 2));
    log(`wrote JSON to ${OUT_PATH}`);
    return;
  }

  if (DRY_RUN) {
    log('--dry-run: showing first entry:');
    console.log(JSON.stringify(entries[0], null, 2));
    return;
  }

  if (!existsSync(SERVICE_ACCOUNT_PATH)) {
    fatal(
      `Missing ${SERVICE_ACCOUNT_PATH}.\n` +
      `Generate a service account key from Firebase Console →\n` +
      `Project Settings → Service Accounts → "Generate new private key",\n` +
      `then save the JSON file as scripts/service-account.json.`
    );
  }

  let admin;
  try {
    admin = await import('firebase-admin');
  } catch {
    fatal(
      'firebase-admin is not installed.\n' +
      'Run: npm install firebase-admin'
    );
  }

  const sa = JSON.parse(readFileSync(SERVICE_ACCOUNT_PATH, 'utf8'));
  if (!admin.default.apps.length) {
    admin.default.initializeApp({ credential: admin.default.credential.cert(sa) });
  }
  const db = admin.default.firestore();

  log('writing restaurants to firestore...');
  const batch = db.batch();
  let written = 0;
  for (const r of entries) {
    if (!r.id) {
      warn(`entry missing id, skipping: ${JSON.stringify(r).slice(0, 80)}`);
      continue;
    }
    const ref = db.collection('restaurants').doc(r.id);
    batch.set(ref, stripUndefined(r), { merge: true });
    written += 1;
  }
  await batch.commit();
  log(`✓ wrote ${written} restaurants to firestore`);

  process.exit(0);
}

main().catch((err) => {
  console.error('[seed][fatal]', err);
  process.exit(1);
});
