import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { parseDocument } from "yaml";

const githubDirectory = path.resolve(".github");
const issueTemplateDirectory = path.join(githubDirectory, "ISSUE_TEMPLATE");
const allowedFormTypes = new Set([
  "checkboxes",
  "dropdown",
  "input",
  "markdown",
  "textarea",
]);

async function collectYamlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectYamlFiles(entryPath)));
    } else if (entry.isFile() && /\.ya?ml$/u.test(entry.name)) {
      files.push(entryPath);
    }
  }

  return files;
}

function validateIssueForm(data) {
  const errors = [];

  for (const requiredKey of ["name", "description", "body"]) {
    if (!(requiredKey in data)) {
      errors.push(`kunci wajib "${requiredKey}" tidak ditemukan`);
    }
  }

  if (!Array.isArray(data.body)) {
    errors.push('kunci "body" harus berupa daftar');
    return errors;
  }

  const usedIds = new Set();

  for (const [index, item] of data.body.entries()) {
    const itemNumber = index + 1;

    if (!allowedFormTypes.has(item?.type)) {
      errors.push(`komponen ${itemNumber} memakai tipe yang tidak dikenal`);
      continue;
    }

    if (item.type === "markdown") {
      continue;
    }

    if (!item.id) {
      errors.push(`komponen ${itemNumber} tidak memiliki id`);
    } else if (usedIds.has(item.id)) {
      errors.push(`id "${item.id}" digunakan lebih dari sekali`);
    } else {
      usedIds.add(item.id);
    }

    if (!item.attributes?.label) {
      errors.push(`komponen ${itemNumber} tidak memiliki label`);
    }
  }

  return errors;
}

const yamlFiles = await collectYamlFiles(githubDirectory);
const validationErrors = [];

for (const filePath of yamlFiles) {
  const source = await readFile(filePath, "utf8");
  const document = parseDocument(source, {
    prettyErrors: true,
    uniqueKeys: true,
  });
  const relativePath = path.relative(process.cwd(), filePath);

  for (const error of document.errors) {
    validationErrors.push(`${relativePath}: ${error.message}`);
  }

  if (document.errors.length > 0) {
    continue;
  }

  const data = document.toJS();
  const isIssueForm =
    path.dirname(filePath) === issueTemplateDirectory &&
    path.basename(filePath) !== "config.yml";

  if (isIssueForm) {
    for (const error of validateIssueForm(data)) {
      validationErrors.push(`${relativePath}: ${error}`);
    }
  }
}

if (validationErrors.length > 0) {
  console.error("Konfigurasi GitHub tidak valid:");

  for (const error of validationErrors) {
    console.error(`- ${error}`);
  }

  process.exitCode = 1;
} else {
  console.log(
    `${yamlFiles.length} berkas YAML dan struktur issue form berhasil diperiksa.`,
  );
}
