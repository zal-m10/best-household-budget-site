// main.ts — the hand-in program for the Wijaya household budget site.
// It runs on Node 22 with only the standard library. It copies this
// repository's app/ and screenshots/ into the output directory the grader
// (or MAKEFUN_OUTPUT_DIR outside it) names, then writes dossier.json with
// the vendored make.fun library, which is the summary the judge reads.
// The vendor file stays exactly as the kit shipped it.
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

const repoRoot = fileURLToPath(new URL(".", import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, "app"), join(outputDir, "app"), { recursive: true });

const shotsDir = join(outputDir, "screenshots");
mkdirSync(shotsDir, { recursive: true });
const repoShots = join(repoRoot, "screenshots");
if (existsSync(repoShots)) cpSync(repoShots, shotsDir, { recursive: true });

// The gate's own limits: at most 4 screenshots of 256 KiB, app/ at most
// 993 entries and 16 MiB, and the dossier text capped at 160 KiB.
writeFileSync(
  join(outputDir, "dossier.json"),
  buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 16777216,
  }),
);
