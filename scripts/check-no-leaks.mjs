import { execFileSync } from "node:child_process";

const blockedPathPatterns = [/^wiki\//, /^\.claude\//, /(^|\/)\.env(\.|$)/];
const allowedEnvFile = /(^|\/)\.env\.example$/;

const secretPatterns = [
  { label: "private key block", pattern: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
  {
    label: "database connection string with embedded password",
    pattern: /(postgres(ql)?|mysql|mongodb(\+srv)?):\/\/[^:/\s]+:[^@/\s]+@/,
  },
  { label: "AWS access key", pattern: /AKIA[0-9A-Z]{16}/ },
  { label: "GitHub token", pattern: /gh[pousr]_[A-Za-z0-9]{20,}/ },
  {
    label: "generic bearer-style secret",
    pattern:
      /(api|secret|access)[-_]?key["']?\s*[:=]\s*["'][A-Za-z0-9_-]{16,}["']/i,
  },
];

function stagedFiles() {
  return execFileSync(
    "git",
    ["diff", "--cached", "--name-only", "--diff-filter=ACM"],
    {
      encoding: "utf8",
    },
  )
    .split("\n")
    .filter(Boolean);
}

function stagedDiff() {
  return execFileSync("git", ["diff", "--cached", "-U0"], { encoding: "utf8" });
}

const problems = [];

for (const file of stagedFiles()) {
  if (allowedEnvFile.test(file)) continue;
  if (blockedPathPatterns.some((pattern) => pattern.test(file))) {
    problems.push(`blocked path staged: ${file}`);
  }
}

const addedLines = stagedDiff()
  .split("\n")
  .filter((line) => line.startsWith("+") && !line.startsWith("+++"));

for (const line of addedLines) {
  for (const { label, pattern } of secretPatterns) {
    if (pattern.test(line)) {
      problems.push(`possible ${label} in staged change`);
    }
  }
}

if (problems.length > 0) {
  console.error("check-no-leaks: commit blocked\n");
  for (const problem of [...new Set(problems)]) {
    console.error(`  - ${problem}`);
  }
  console.error(
    "\nRemove the file/content from staging, or confirm it's a false positive before overriding.",
  );
  process.exit(1);
}
