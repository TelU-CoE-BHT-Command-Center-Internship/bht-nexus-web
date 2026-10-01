"use client";

import { useCallback, useEffect, useState } from "react";
import styles from "@/components/nexus-import/nexus-import.module.css";
import {
  NexusWorkspaceButton,
  NexusWorkspaceCard,
  NexusWorkspaceEmptyState,
  NexusWorkspaceLinkButton,
  NexusWorkspaceNotice,
} from "@/components/nexus-workspace-ui/nexus-workspace-elements";
import { NexusWorkspacePage } from "@/components/nexus-workspace-ui/nexus-workspace-page";
import { apiErrorMessage } from "@/lib/api-client";
import {
  downloadImportCsv,
  type ImportRow,
  type ImportRowAction,
  type ImportUpload,
  importErrorsPath,
  importTemplatePath,
  listImportRows,
  submitImport,
  uploadImport,
} from "@/lib/api-imports";

const actionLabels: Record<ImportRowAction, string> = {
  duplicate: "Duplikat",
  new: "Baru",
  skip: "Gagal",
  update: "Berubah",
};

const actionFilters: { label: string; value: ImportRowAction | "all" }[] = [
  { label: "Semua baris", value: "all" },
  { label: "Baru", value: "new" },
  { label: "Berubah", value: "update" },
  { label: "Duplikat", value: "duplicate" },
  { label: "Gagal", value: "skip" },
];

type Notice = { message: string; tone: "danger" | "info" | "success" };

function rowNote(row: ImportRow) {
  const issue = row.issues[0];
  return issue ? `${issue.column}: ${issue.reason}` : "-";
}

export function NexusImport({ canUpload }: { canUpload: boolean }) {
  const [file, setFile] = useState<File | null>(null);
  const [fileKey, setFileKey] = useState(0);
  const [batch, setBatch] = useState<ImportUpload | null>(null);
  const [filter, setFilter] = useState<ImportRowAction | "all">("all");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [busy, setBusy] = useState<"submit" | "upload" | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  const publicId = batch?.publicId;

  const loadRows = useCallback(
    async (id: string, action: ImportRowAction | "all", nextPage: number) => {
      try {
        const result = await listImportRows(
          id,
          action === "all" ? undefined : action,
          nextPage,
        );
        setRows(result.data);
        setTotalPages(Math.max(1, result.meta.totalPages ?? 1));
      } catch (error) {
        setNotice({
          message: apiErrorMessage(error, "Baris impor belum dapat dimuat."),
          tone: "danger",
        });
      }
    },
    [],
  );

  useEffect(() => {
    if (publicId) void loadRows(publicId, filter, page);
  }, [filter, loadRows, page, publicId]);

  async function upload() {
    if (!file) return;
    setBusy("upload");
    setNotice(null);
    try {
      const result = await uploadImport(file);
      setBatch(result);
      setFilter("all");
      setPage(1);
      setFile(null);
      setFileKey((key) => key + 1);
      setNotice({
        message: "Berkas diperiksa. Belum ada data resmi yang berubah.",
        tone: "info",
      });
    } catch (error) {
      setNotice({
        message: apiErrorMessage(error, "Berkas belum dapat diperiksa."),
        tone: "danger",
      });
    } finally {
      setBusy(null);
    }
  }

  async function submit() {
    if (!batch) return;
    setBusy("submit");
    setNotice(null);
    try {
      const result = await submitImport(batch.publicId);
      setBatch({ ...batch, status: "promoted" });
      setNotice({
        message: `${result.submitted.new} baris baru dan ${result.submitted.changed} baris perubahan dikirim ke Tinjauan.`,
        tone: "success",
      });
    } catch (error) {
      setNotice({
        message: apiErrorMessage(error, "Impor belum dapat dikirim."),
        tone: "danger",
      });
    } finally {
      setBusy(null);
    }
  }

  async function download(path: string, filename: string) {
    try {
      await downloadImportCsv(path, filename);
    } catch (error) {
      setNotice({
        message: apiErrorMessage(error, "Berkas belum dapat diunduh."),
        tone: "danger",
      });
    }
  }

  const summary = batch?.summary;
  const sendable = (summary?.new ?? 0) + (summary?.changed ?? 0);

  return (
    <NexusWorkspacePage
      actions={
        <NexusWorkspaceButton
          onClick={() =>
            download(importTemplatePath(), "templat-impor-publikasi.csv")
          }
          type="button"
        >
          Unduh templat
        </NexusWorkspaceButton>
      }
      description="Unggah CSV atau XLSX publikasi untuk diperiksa sebelum dikirim ke Tinjauan. Unggahan tidak mengubah data resmi."
      descriptionId="import-description"
      title="Impor Spreadsheet"
      titleId="import-title"
    >
      {notice ? (
        <NexusWorkspaceNotice tone={notice.tone}>
          {notice.message}
        </NexusWorkspaceNotice>
      ) : null}

      <NexusWorkspaceCard
        description="Kolom wajib: title dan year. Kolom lain: doi, venue, authors, work_type. Batas 5 MB dan 2000 baris."
        title="Unggah berkas"
      >
        {canUpload ? (
          <div className={styles.uploadRow}>
            <input
              accept=".csv,.xlsx"
              aria-label="Pilih berkas CSV atau XLSX"
              key={fileKey}
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              type="file"
            />
            <NexusWorkspaceButton
              disabled={!file || busy !== null}
              onClick={upload}
              tone="primary"
              type="button"
            >
              {busy === "upload" ? "Memeriksa..." : "Periksa berkas"}
            </NexusWorkspaceButton>
          </div>
        ) : (
          <NexusWorkspaceNotice>
            Akun ini dapat melihat impor tetapi tidak dapat mengunggah.
          </NexusWorkspaceNotice>
        )}
      </NexusWorkspaceCard>

      {batch && summary ? (
        <>
          <NexusWorkspaceCard
            actions={
              summary.failed > 0 ? (
                <NexusWorkspaceButton
                  onClick={() =>
                    download(
                      importErrorsPath(batch.publicId),
                      "laporan-kesalahan-impor.csv",
                    )
                  }
                  type="button"
                >
                  Unduh laporan kesalahan
                </NexusWorkspaceButton>
              ) : undefined
            }
            description={batch.fileName}
            title="Hasil pemeriksaan"
          >
            <dl className={styles.summary}>
              {[
                ["Baris sah", summary.valid],
                ["Gagal", summary.failed],
                ["Baru", summary.new],
                ["Berubah", summary.changed],
                ["Duplikat", summary.duplicate],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
            <div className={styles.submitRow}>
              {batch.status === "previewed" ? (
                <NexusWorkspaceButton
                  disabled={!canUpload || sendable === 0 || busy !== null}
                  onClick={submit}
                  tone="primary"
                  type="button"
                >
                  {busy === "submit" ? "Mengirim..." : "Kirim ke Tinjauan"}
                </NexusWorkspaceButton>
              ) : (
                <NexusWorkspaceLinkButton href="/nexus/tinjauan">
                  Buka Tinjauan
                </NexusWorkspaceLinkButton>
              )}
              {batch.status === "previewed" && sendable === 0 ? (
                <p>Tidak ada baris baru atau perubahan untuk dikirim.</p>
              ) : null}
            </div>
          </NexusWorkspaceCard>

          <NexusWorkspaceCard
            actions={
              <select
                aria-label="Saring baris"
                onChange={(event) => {
                  setFilter(event.target.value as ImportRowAction | "all");
                  setPage(1);
                }}
                value={filter}
              >
                {actionFilters.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            }
            title="Baris"
          >
            {rows.length === 0 ? (
              <NexusWorkspaceEmptyState
                description="Tidak ada baris untuk saringan ini."
                title="Tidak ada baris"
              />
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Baris</th>
                      <th>Tindakan</th>
                      <th>Judul</th>
                      <th>Tahun</th>
                      <th>DOI</th>
                      <th>Catatan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr data-action={row.action} key={row.rowNumber}>
                        <td>{row.rowNumber}</td>
                        <td>{actionLabels[row.action]}</td>
                        <td>{String(row.values.title ?? "-")}</td>
                        <td>{String(row.values.year ?? "-")}</td>
                        <td>{String(row.values.doi ?? "-")}</td>
                        <td>{rowNote(row)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className={styles.pager}>
              <NexusWorkspaceButton
                disabled={page <= 1}
                onClick={() => setPage((current) => current - 1)}
                type="button"
              >
                Sebelumnya
              </NexusWorkspaceButton>
              <span>
                Halaman {page} dari {totalPages}
              </span>
              <NexusWorkspaceButton
                disabled={page >= totalPages}
                onClick={() => setPage((current) => current + 1)}
                type="button"
              >
                Berikutnya
              </NexusWorkspaceButton>
            </div>
          </NexusWorkspaceCard>
        </>
      ) : null}
    </NexusWorkspacePage>
  );
}
