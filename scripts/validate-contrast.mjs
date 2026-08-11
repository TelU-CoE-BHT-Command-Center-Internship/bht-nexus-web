import { readFile } from "node:fs/promises";
import path from "node:path";

const globalsPath = path.resolve("src", "app", "globals.css");

/**
 * Token pairs that render text on a surface. Each pair must clear the WCAG 2.2
 * AA threshold for normal text. Add a row here whenever a new colour token is
 * used as text on a new background.
 */
const textPairs = [
  ["--color-ink-900", "--color-paper"],
  ["--color-ink-700", "--color-paper"],
  ["--color-ink-500", "--color-paper"],
  ["--color-ink-400", "--color-paper"],
  ["--color-ink-300", "--color-paper"],
  ["--color-ink-300", "--color-surface-muted"],
  ["--color-ink-400", "--color-surface-sunken"],
  ["--color-ink-500", "--color-surface-raised"],
  ["--color-ink-700", "--color-surface-raised"],
  ["--color-link", "--color-paper"],
  ["--color-note-ink", "--color-note-surface"],
  ["--color-note-warning-ink", "--color-note-warning-surface"],
  ["--color-status-queued-ink", "--color-status-queued-surface"],
  ["--color-status-running-ink", "--color-status-running-surface"],
  ["--color-status-retrying-ink", "--color-status-retrying-surface"],
  ["--color-status-succeeded-ink", "--color-status-succeeded-surface"],
  ["--color-status-failed-ink", "--color-status-failed-surface"],
  ["--color-status-stopped-ink", "--color-status-stopped-surface"],
  ["--color-paper", "--color-brand-navy"],
];

const minimumTextRatio = 4.5;

function relativeLuminance(hex) {
  const channels = hex
    .replace("#", "")
    .match(/../gu)
    .map((pair) => Number.parseInt(pair, 16) / 255)
    .map((value) =>
      value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
    );

  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrastRatio(foreground, background) {
  const first = relativeLuminance(foreground);
  const second = relativeLuminance(background);
  const lighter = Math.max(first, second);
  const darker = Math.min(first, second);

  return (lighter + 0.05) / (darker + 0.05);
}

const globals = await readFile(globalsPath, "utf8");
const tokens = new Map();

for (const [, name, value] of globals.matchAll(
  /(--color-[a-z0-9-]+):\s*(#[0-9a-f]{6})\s*;/gu,
)) {
  tokens.set(name, value);
}

const failures = [];

for (const [foreground, background] of textPairs) {
  const foregroundValue = tokens.get(foreground);
  const backgroundValue = tokens.get(background);

  if (!foregroundValue || !backgroundValue) {
    failures.push(`${foreground} atau ${background} tidak ada di globals.css`);
    continue;
  }

  const ratio = contrastRatio(foregroundValue, backgroundValue);

  if (ratio < minimumTextRatio) {
    failures.push(
      `${foreground} di atas ${background} hanya ${ratio.toFixed(2)}:1, minimum ${minimumTextRatio}:1`,
    );
  }
}

if (failures.length > 0) {
  console.error("Kontras token warna belum memenuhi WCAG 2.2 AA:");

  for (const failure of failures) {
    console.error(`- ${failure}`);
  }

  process.exitCode = 1;
} else {
  console.log(`${textPairs.length} pasangan warna teks memenuhi WCAG 2.2 AA.`);
}
