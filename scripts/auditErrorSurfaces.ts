import { readdirSync, readFileSync, statSync } from "fs";
import { join, relative } from "path";

const SRC = join(__dirname, "..", "src");
const ALLOW_WARN = new Set(["src/components/ObservabilityBootstrap.tsx"]);
const ALLOW_CATCH_NULL: string[] = [];

const forbidden = [
  { name: "console.error", pattern: /console\.error\s*\(/ },
  { name: "console.warn", pattern: /console\.warn\s*\(/ },
  { name: "alert(", pattern: /\balert\s*\(/ },
  { name: ".catch(() => null)", pattern: /\.catch\(\s*\(\)\s*=>\s*null\s*\)/ },
];

function walk(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      walk(full, acc);
      continue;
    }
    if (/\.(ts|tsx|js|jsx)$/.test(entry)) acc.push(full);
  }
  return acc;
}

const files = walk(SRC);
const hits: string[] = [];

for (const file of files) {
  const rel = relative(join(__dirname, ".."), file).replace(/\\/g, "/");
  const text = readFileSync(file, "utf8");
  for (const rule of forbidden) {
    if (!rule.pattern.test(text)) continue;
    if (rule.name === "console.warn" && ALLOW_WARN.has(rel)) continue;
    if (rule.name === ".catch(() => null)" && ALLOW_CATCH_NULL.includes(rel)) continue;
    hits.push(`${rel}: ${rule.name}`);
  }
}

if (hits.length > 0) {
  console.error("auditErrorSurfaces failed:\n" + hits.map((h) => `  - ${h}`).join("\n"));
  process.exit(1);
}

console.log(`auditErrorSurfaces passed (${files.length} files)`);
