import { spawn } from "node:child_process";
import { appendFile } from "node:fs/promises";

/**
 * Pemeriksaan kerentanan dependency terhadap basis data penasihat keamanan npm.
 *
 * `npm audit` memberi satu kode keluar untuk dua keadaan yang sangat berbeda:
 * ada kerentanan pada tingkat yang diperiksa, dan layanan penasihat keamanan
 * npm tidak dapat dihubungi. Keduanya dibedakan di sini karena hanya keadaan
 * pertama yang menerangkan kode di repository ini. Ketika layanannya sedang
 * bermasalah, hasil pemeriksaan menjadi bergantung pada waktu menjalankan,
 * bukan pada isi `package-lock.json`.
 *
 * Kerentanan pada tingkat `high` atau `critical` tetap menggagalkan
 * pemeriksaan seperti sebelumnya. Layanan yang tidak dapat dihubungi setelah
 * beberapa percobaan dinyatakan apa adanya sebagai peringatan yang menonjol,
 * termasuk pada ringkasan run, sehingga tidak pernah lolos diam-diam.
 */

const LEVELS = ["info", "low", "moderate", "high", "critical"];
const THRESHOLD = "high";
const ATTEMPTS = 3;
const BACKOFF_MS = [0, 15_000, 45_000];

function runAudit() {
  return new Promise((resolve) => {
    const child = spawn("npm", ["audit", "--json"], {
      shell: process.platform === "win32",
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", (error) => {
      resolve({ code: null, stderr: error.message, stdout: "" });
    });
    child.on("close", (code) => resolve({ code, stderr, stdout }));
  });
}

/**
 * Jumlah kerentanan pada tingkat ambang ke atas. `null` berarti laporan tidak
 * dapat dibaca, yang diperlakukan sebagai layanan tidak terjangkau dan bukan
 * sebagai hasil pemeriksaan yang bersih.
 */
function countAtOrAboveThreshold(stdout) {
  let report;
  try {
    report = JSON.parse(stdout);
  } catch {
    return null;
  }

  if (report.error) return null;

  const counts = report.metadata?.vulnerabilities;
  if (!counts) return null;

  const from = LEVELS.indexOf(THRESHOLD);
  return LEVELS.slice(from).reduce(
    (total, level) => total + (counts[level] ?? 0),
    0,
  );
}

async function announce(message) {
  process.stdout.write(`${message}\n`);
  const summary = process.env.GITHUB_STEP_SUMMARY;
  if (summary) await appendFile(summary, `${message}\n`);
}

const failures = [];

for (let attempt = 1; attempt <= ATTEMPTS; attempt += 1) {
  const wait = BACKOFF_MS[attempt - 1] ?? 0;
  if (wait > 0) {
    process.stdout.write(
      `Percobaan ${attempt} dari ${ATTEMPTS} setelah menunggu ${wait / 1000} detik.\n`,
    );
    await new Promise((resolve) => setTimeout(resolve, wait));
  }

  const { stderr, stdout } = await runAudit();
  const found = countAtOrAboveThreshold(stdout);

  if (found === null) {
    const reason = (stderr || "laporan audit tidak dapat dibaca")
      .trim()
      .split("\n")
      .filter(Boolean)
      .at(-1);
    failures.push(`percobaan ${attempt}: ${reason}`);
    continue;
  }

  if (found > 0) {
    process.stdout.write(
      `Ditemukan ${found} kerentanan tingkat ${THRESHOLD} atau lebih tinggi.\n` +
        "Jalankan `npm audit` untuk melihat rinciannya.\n",
    );
    process.exit(1);
  }

  process.stdout.write(
    `Tidak ada kerentanan tingkat ${THRESHOLD} atau lebih tinggi.\n`,
  );
  process.exit(0);
}

await announce(
  "> [!WARNING]\n" +
    `> Layanan penasihat keamanan npm tidak dapat dihubungi setelah ${ATTEMPTS} percobaan, ` +
    "sehingga kerentanan dependency belum diperiksa pada run ini.\n" +
    ">\n" +
    `${failures.map((line) => `> - ${line}`).join("\n")}\n` +
    ">\n" +
    "> Isi `package-lock.json` tidak berubah karenanya. Jalankan ulang run ini " +
    "setelah layanan npm pulih, atau jalankan `npm audit --audit-level=high` " +
    "secara lokal untuk memeriksanya sekarang.",
);
