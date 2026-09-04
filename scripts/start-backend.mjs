import { spawn } from "node:child_process";
import path from "node:path";

const backendPath =
  process.env.NEXUS_SERVER_PATH ??
  path.resolve(import.meta.dirname, "..", "..", "nexus-server-run");

console.log(`Starting nexus-server from ${backendPath}`);

const child = spawn("npm", ["run", "start:dev"], {
  cwd: backendPath,
  shell: true,
  stdio: "inherit",
});

child.on("exit", (code) => process.exit(code ?? 0));
