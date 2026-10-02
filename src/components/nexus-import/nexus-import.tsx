"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "@/components/nexus-import/nexus-import.module.css";
import {
  importActionCopy,
  importHouseLabels,
  importHouseOptions,
  importIssueColumn,
  importIssuesByPriority,
  importIssueTone,
  importRowRecordType,
  importRowSearchText,
  importRowSource,
  importRowTitle,
  importRowYear,
  importSheetStatusCopy,
} from "@/components/nexus-import/nexus-import-model";
import { NexusTablePagination } from "@/components/nexus-workspace-ui/nexus-table-pagination";
import {
  NexusWorkspaceSearch,
  NexusWorkspaceTabs,
  NexusWorkspaceToolbar,
} from "@/components/nexus-workspace-ui/nexus-workspace-controls";
import {
  NexusWorkspaceButton,
  NexusWorkspaceCard,
  NexusWorkspaceEmptyState,
  NexusWorkspaceLinkButton,
  NexusWorkspaceLoadError,
  NexusWorkspaceNotice,
  NexusWorkspaceResultMeta,
} from "@/components/nexus-workspace-ui/nexus-workspace-elements";
import { NexusWorkspaceFormField } from "@/components/nexus-workspace-ui/nexus-workspace-form-field";
import { NexusWorkspaceIconPaths } from "@/components/nexus-workspace-ui/nexus-workspace-icons";
import {
  NexusWorkspaceMetrics,
  NexusWorkspacePage,
} from "@/components/nexus-workspace-ui/nexus-workspace-page";
import {
  NexusWorkspaceCatalog,
  NexusWorkspaceMobileAction,
  NexusWorkspaceMobileCard,
  NexusWorkspaceMobileSubtitle,
  type NexusWorkspaceRecordColumn,
  NexusWorkspaceRecordTable,
  NexusWorkspaceTableAction,
  NexusWorkspaceTableBadge,
  NexusWorkspaceTablePrimary,
  NexusWorkspaceTableSignal,
  NexusWorkspaceTableText,
} from "@/components/nexus-workspace-ui/nexus-workspace-records";
import {
  type NexusSelectConfig,
  NexusWorkspaceSelect,
} from "@/components/nexus-workspace-ui/nexus-workspace-select";
import { NexusWorkspaceTableSection } from "@/components/nexus-workspace-ui/nexus-workspace-table";
import { apiErrorMessage } from "@/lib/api-client";
import {
  downloadImportFile,
  type ImportBatch,
  type ImportEntity,
  type ImportRow,
  importErrorsPath,
  importTemplatePath,
  listAllImportRows,
  submitImport,
  uploadImport,
} from "@/lib/api-imports";

const NexusImportRowDetail = dynamic(() =>
  import("@/components/nexus-import/nexus-import-row-detail").then(
    (module) => module.NexusImportRowDetail,
  ),
);

type Notice = { message: string; tone: "danger" | "info" | "success" };
type TabId = "rows" | "sheets";
type FilterId = "action" | "house" | "sheet";
type FilterValues = Record<FilterId, string>;

const defaultFilters: FilterValues = {
  action: "all",
  house: "all",
  sheet: "all",
};

const templateFileNames: Record<ImportEntity, string> = {
  publication: "templat-impor-publikasi.xlsx",
  "intellectual-property": "templat-impor-kekayaan-intelektual.xlsx",
  contract: "templat-impor-kontrak-proposal.xlsx",
  academic: "templat-impor-akademik.xlsx",
  activity: "templat-impor-kegiatan.xlsx",
};

const rowColumns: readonly NexusWorkspaceRecordColumn[] = [
  { id: "primary", label: "Data", primary: true },
  { id: "house", label: "Rumah data" },
  { id: "source", label: "Asal" },
  { id: "year", label: "Tahun" },
  { id: "action", label: "Hasil" },
  { id: "note", label: "Catatan utama" },
  { id: "detail", label: "Aksi" },
];

const sheetColumns: readonly NexusWorkspaceRecordColumn[] = [
  { id: "primary", label: "Lembar", primary: true },
  { id: "status", label: "Status" },
  { id: "house", label: "Rumah data" },
  { id: "rows", label: "Baris data" },
  { id: "valid", label: "Sah" },
  { id: "failed", label: "Perlu diperbaiki" },
  { id: "note", label: "Keterangan" },
];

const actionFilterConfig: NexusSelectConfig = {
  defaultValue: "all",
  id: "action",
  label: "Filter hasil pemeriksaan",
  options: [
    { label: "Semua hasil", value: "all" },
    { label: "Siap dikirim", tone: "completed", value: "new" },
    { label: "Perlu diperbaiki", tone: "needs-fix", value: "skip" },
    { label: "Dilewati, sudah ada", tone: "neutral", value: "duplicate" },
    { label: "Usulan perubahan", tone: "waiting", value: "update" },
  ],
};

const houseFilterConfig: NexusSelectConfig = {
  defaultValue: "all",
  id: "house",
  label: "Filter rumah data",
  options: [{ label: "Semua rumah data", value: "all" }, ...importHouseOptions],
};

const templateConfig: NexusSelectConfig = {
  defaultValue: "publication",
  id: "template",
  label: "Templat CSV rumah data",
  options: [
    { label: "Templat Publikasi", value: "publication" },
    { label: "Templat Kekayaan Intelektual", value: "intellectual-property" },
    { label: "Templat Kontrak & Proposal", value: "contract" },
    { label: "Templat Akademik", value: "academic" },
    { label: "Templat Kegiatan & Pengabdian", value: "activity" },
  ],
};

const pageSizeConfig: NexusSelectConfig = {
  defaultValue: "10",
  id: "import-page-size",
  label: "Jumlah baris per halaman",
  options: [
    { label: "10 per halaman", value: "10" },
    { label: "25 per halaman", value: "25" },
    { label: "50 per halaman", value: "50" },
  ],
};

function MetricIcon({ name }: { name: "alert" | "check" | "clock" }) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <NexusWorkspaceIconPaths name={name} />
    </svg>
  );
}

export function NexusImport({
  canUpload,
  initialHouse,
}: {
  canUpload: boolean;
  initialHouse?: ImportEntity;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [fileKey, setFileKey] = useState(0);
  const [targetEntity, setTargetEntity] = useState<ImportEntity | "auto">(
    initialHouse ?? "auto",
  );
  const [reportYear, setReportYear] = useState("");
  const [templateEntity, setTemplateEntity] = useState<ImportEntity>(
    initialHouse ?? "publication",
  );
  const [busy, setBusy] = useState<"submit" | "upload" | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [batch, setBatch] = useState<ImportBatch | null>(null);
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [rowsState, setRowsState] = useState<"error" | "loading" | "ready">(
    "loading",
  );
  const [rowsError, setRowsError] = useState("");
  const [activeTab, setActiveTab] = useState<TabId>("rows");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<FilterValues>(defaultFilters);
  const [openFilterId, setOpenFilterId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSizeValue, setPageSizeValue] = useState("10");
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const rowRequest = useRef(0);

  const publicId = batch?.publicId;

  const loadRows = useCallback(async (id: string) => {
    const request = ++rowRequest.current;
    setRowsState("loading");
    setRowsError("");
    try {
      const result = await listAllImportRows(id);
      if (request !== rowRequest.current) return;
      setRows(result);
      setRowsState("ready");
    } catch (error) {
      if (request !== rowRequest.current) return;
      setRowsError(
        apiErrorMessage(error, "Baris pratinjau belum dapat dimuat."),
      );
      setRowsState("error");
    }
  }, []);

  useEffect(() => {
    if (publicId) void loadRows(publicId);
    return () => {
      rowRequest.current++;
    };
  }, [loadRows, publicId]);

  async function upload() {
    if (!file || busy) return;
    const year = reportYear.trim() ? Number(reportYear) : undefined;
    if (
      year !== undefined &&
      (!Number.isInteger(year) || year < 1900 || year > 2100)
    ) {
      setNotice({
        message:
          "Isi tahun laporan antara 1900 dan 2100, atau kosongkan jika tahun sudah tertulis di berkas.",
        tone: "danger",
      });
      return;
    }
    setBusy("upload");
    setNotice(null);
    try {
      const result = await uploadImport(file, {
        reportYear: year,
        targetEntity,
      });
      setRows([]);
      setFilters(defaultFilters);
      setSearch("");
      setPage(1);
      setActiveTab("rows");
      setBatch(result);
      setFile(null);
      setFileKey((current) => current + 1);
      setNotice({
        message:
          "Berkas selesai diperiksa. Data resmi belum berubah sampai baris dikirim dan disetujui di Tinjauan.",
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
    if (!batch || busy) return;
    setBusy("submit");
    setNotice(null);
    try {
      const result = await submitImport(batch.publicId);
      setBatch({ ...batch, status: "promoted" });
      setNotice({
        message: `${result.submitted.new} baris baru${
          result.submitted.changed
            ? ` dan ${result.submitted.changed} usulan perubahan`
            : ""
        } masuk ke antrean Tinjauan.`,
        tone: "success",
      });
    } catch (error) {
      setNotice({
        message: apiErrorMessage(error, "Hasil impor belum dapat dikirim."),
        tone: "danger",
      });
    } finally {
      setBusy(null);
    }
  }

  async function download(path: string, filename: string) {
    try {
      await downloadImportFile(path, filename);
    } catch (error) {
      setNotice({
        message: apiErrorMessage(error, "Berkas belum dapat diunduh."),
        tone: "danger",
      });
    }
  }

  const sheets = batch?.sheets ?? [];
  const sheetFilterConfig = useMemo<NexusSelectConfig>(
    () => ({
      defaultValue: "all",
      id: "sheet",
      label: "Filter lembar",
      options: [
        { label: "Semua lembar", value: "all" },
        ...Array.from(
          new Set(rows.map((row) => row.sheetName ?? "Berkas")),
        ).map((name) => ({ label: `Lembar ${name}`, value: name })),
      ],
    }),
    [rows],
  );

  const filtered = useMemo(() => {
    const needle = search.trim().toLocaleLowerCase("id-ID");
    return rows.filter(
      (row) =>
        (filters.action === "all" || row.action === filters.action) &&
        (filters.house === "all" || row.targetEntity === filters.house) &&
        (filters.sheet === "all" ||
          (row.sheetName ?? "Berkas") === filters.sheet) &&
        (!needle || importRowSearchText(row).includes(needle)),
    );
  }, [filters, rows, search]);

  const pageSize = Number(pageSizeValue);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const visible = filtered.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );
  const hasActiveFilters =
    search.length > 0 ||
    (Object.keys(defaultFilters) as FilterId[]).some(
      (id) => filters[id] !== defaultFilters[id],
    );
  const resetFilters = () => {
    setFilters(defaultFilters);
    setSearch("");
    setPage(1);
  };
  const selected = rows.find((row) => row.rowNumber === selectedRow);
  const summary = batch?.summary;
  const sendable = (summary?.new ?? 0) + (summary?.changed ?? 0);
  const dataSheets = sheets.filter((sheet) => sheet.status === "data").length;

  const rowTableRows = visible.map((row) => {
    const open = () => setSelectedRow(row.rowNumber);
    const action = importActionCopy[row.action];
    const [mainIssue, ...otherIssues] = importIssuesByPriority(row.issues);
    const title = importRowTitle(row);
    const recordType = importRowRecordType(row);
    const source = importRowSource(row);
    const year = importRowYear(row);
    const house = row.targetEntity
      ? importHouseLabels[row.targetEntity]
      : "Belum diketahui";
    const actionBadge = (
      <NexusWorkspaceTableBadge key="action" tone={action.tone}>
        {action.label}
      </NexusWorkspaceTableBadge>
    );
    const detailLabel = `Lihat rincian ${source}: ${title}`;

    return {
      cells: {
        action: actionBadge,
        detail: (
          <NexusWorkspaceTableAction label={detailLabel} onClick={open}>
            Rincian
          </NexusWorkspaceTableAction>
        ),
        house: <NexusWorkspaceTableText>{house}</NexusWorkspaceTableText>,
        note: mainIssue ? (
          <NexusWorkspaceTableSignal
            primary={mainIssue.reason}
            secondary={
              otherIssues.length > 0
                ? `+${otherIssues.length} catatan lain`
                : importIssueColumn(mainIssue)
            }
            subdued
            tone={importIssueTone(mainIssue)}
          />
        ) : (
          <NexusWorkspaceTableText>Tidak ada catatan</NexusWorkspaceTableText>
        ),
        primary: (
          <NexusWorkspaceTablePrimary
            onClick={open}
            subtitle={recordType}
            title={title}
          />
        ),
        source: <NexusWorkspaceTableText>{source}</NexusWorkspaceTableText>,
        year: <NexusWorkspaceTableText>{year}</NexusWorkspaceTableText>,
      },
      id: String(row.rowNumber),
      mobile: (
        <NexusWorkspaceMobileCard
          action={
            <NexusWorkspaceMobileAction label={detailLabel} onClick={open}>
              Lihat rincian
            </NexusWorkspaceMobileAction>
          }
          eyebrow={
            <>
              {actionBadge}
              <NexusWorkspaceTableBadge key="house" tone="info">
                {house}
              </NexusWorkspaceTableBadge>
            </>
          }
          meta={
            <dl>
              <div>
                <dt>Asal</dt>
                <dd>{source}</dd>
              </div>
              <div>
                <dt>Tahun</dt>
                <dd>{year}</dd>
              </div>
              <div>
                <dt>Catatan</dt>
                <dd>{mainIssue?.reason ?? "Tidak ada catatan"}</dd>
              </div>
            </dl>
          }
          title={title}
        >
          {recordType ? (
            <NexusWorkspaceMobileSubtitle>
              {recordType}
            </NexusWorkspaceMobileSubtitle>
          ) : null}
        </NexusWorkspaceMobileCard>
      ),
    };
  });

  const sheetTableRows = sheets.map((sheet) => {
    const status = importSheetStatusCopy[sheet.status];
    const houses = sheet.houses.length
      ? sheet.houses.map((house) => importHouseLabels[house]).join(", ")
      : "—";
    const note = sheet.notes.length ? sheet.notes.join(" ") : "—";
    const statusBadge = (
      <NexusWorkspaceTableBadge key="status" tone={status.tone}>
        {status.label}
      </NexusWorkspaceTableBadge>
    );

    return {
      cells: {
        failed: (
          <NexusWorkspaceTableText>{sheet.failed}</NexusWorkspaceTableText>
        ),
        house: <NexusWorkspaceTableText>{houses}</NexusWorkspaceTableText>,
        note: <NexusWorkspaceTableText>{note}</NexusWorkspaceTableText>,
        primary: (
          <NexusWorkspaceTablePrimary
            subtitle={
              sheet.headerRow
                ? `Judul kolom pada baris ${sheet.headerRow}`
                : undefined
            }
            title={sheet.name}
          />
        ),
        rows: <NexusWorkspaceTableText>{sheet.total}</NexusWorkspaceTableText>,
        status: statusBadge,
        valid: <NexusWorkspaceTableText>{sheet.valid}</NexusWorkspaceTableText>,
      },
      id: sheet.name,
      mobile: (
        <NexusWorkspaceMobileCard
          action={null}
          eyebrow={statusBadge}
          meta={
            <dl>
              <div>
                <dt>Rumah data</dt>
                <dd>{houses}</dd>
              </div>
              <div>
                <dt>Baris</dt>
                <dd>
                  {sheet.total} · {sheet.valid} sah · {sheet.failed} perlu
                  diperbaiki
                </dd>
              </div>
            </dl>
          }
          title={sheet.name}
        >
          {sheet.notes.length ? (
            <NexusWorkspaceMobileSubtitle>{note}</NexusWorkspaceMobileSubtitle>
          ) : null}
        </NexusWorkspaceMobileCard>
      ),
    };
  });

  const templateRow = (
    <div className={styles.templateRow}>
      <NexusWorkspaceSelect
        config={templateConfig}
        isOpen={openFilterId === templateConfig.id}
        name="import-template"
        onOpenChange={(isOpen) =>
          setOpenFilterId(isOpen ? templateConfig.id : null)
        }
        onValueChange={(value) => setTemplateEntity(value as ImportEntity)}
        value={templateEntity}
      />
      <NexusWorkspaceButton
        onClick={() =>
          download(
            importTemplatePath(templateEntity),
            templateFileNames[templateEntity],
          )
        }
        type="button"
      >
        Unduh templat Excel
      </NexusWorkspaceButton>
    </div>
  );

  return (
    <NexusWorkspacePage
      description="Periksa workbook KM atau CSV lima rumah data. Baris yang sah dikirim ke Tinjauan dan baru menjadi data resmi setelah disetujui pemeriksa."
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
        description="CSV atau XLSX, maksimal 5 MB dan 2.000 baris data. Semua lembar workbook KM diperiksa dan dipetakan ke rumah datanya."
        title="Unggah berkas"
      >
        {canUpload ? (
          <>
            <div className={styles.uploadGrid}>
              <div className={styles.fileField}>
                <span className={styles.fileLabel}>Berkas</span>
                <div className={styles.filePicker}>
                  <label className={styles.fileButton}>
                    Pilih berkas
                    <input
                      accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                      className={styles.fileInput}
                      disabled={busy !== null}
                      key={fileKey}
                      onChange={(event) =>
                        setFile(event.currentTarget.files?.[0] ?? null)
                      }
                      type="file"
                    />
                  </label>
                  <span className={styles.fileName} title={file?.name}>
                    {file ? file.name : "Belum ada berkas dipilih"}
                  </span>
                </div>
              </div>
              <NexusWorkspaceFormField
                disabled={busy !== null}
                hint="Pilih pengenalan otomatis untuk workbook berisi beberapa rumah data."
                id="import-house"
                label="Tujuan rumah data"
                name="targetEntity"
                onChange={(event) =>
                  setTargetEntity(
                    event.currentTarget.value as ImportEntity | "auto",
                  )
                }
                options={[
                  { label: "Kenali dari isi berkas", value: "auto" },
                  ...importHouseOptions,
                ]}
                type="select"
                value={targetEntity}
              />
              <NexusWorkspaceFormField
                disabled={busy !== null}
                hint="Opsional. Dipakai hanya untuk baris tanpa tanggal atau tahun."
                id="import-report-year"
                label="Tahun laporan"
                min="1900"
                name="reportYear"
                onChange={(event) => setReportYear(event.currentTarget.value)}
                placeholder="Contoh: 2026"
                type="number"
                value={reportYear}
              />
            </div>
            <div className={styles.uploadFooter}>
              {templateRow}
              <NexusWorkspaceButton
                disabled={!file || busy !== null}
                onClick={upload}
                tone="primary"
                type="button"
              >
                {busy === "upload" ? "Memeriksa berkas..." : "Periksa berkas"}
              </NexusWorkspaceButton>
            </div>
          </>
        ) : (
          <>
            <NexusWorkspaceNotice>
              Akun ini dapat melihat Impor Spreadsheet, tetapi unggahan berkas
              hanya untuk akun yang memiliki izin impor.
            </NexusWorkspaceNotice>
            <div className={styles.uploadFooter}>{templateRow}</div>
          </>
        )}
      </NexusWorkspaceCard>

      {batch && summary ? (
        <>
          <NexusWorkspaceMetrics
            metrics={[
              {
                icon: <MetricIcon name="check" />,
                id: "new",
                label: "Siap Dikirim",
                tone: "completed",
                unit: "baris",
                value: summary.new + summary.changed,
              },
              {
                icon: <MetricIcon name="alert" />,
                id: "failed",
                label: "Perlu Diperbaiki",
                tone: "needs-fix",
                unit: "baris",
                value: summary.failed,
              },
              {
                icon: <MetricIcon name="clock" />,
                id: "duplicate",
                label: "Dilewati, Sudah Ada",
                tone: "waiting",
                unit: "baris",
                value: summary.duplicate,
              },
            ]}
          />

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
            <div className={styles.submitRow}>
              <p>
                {batch.status === "promoted"
                  ? "Baris yang siap sudah masuk antrean Tinjauan. Pemeriksa lain yang berwenang memutuskan setiap baris."
                  : sendable > 0
                    ? `${sendable} baris siap dikirim ke Tinjauan. Baris yang perlu diperbaiki dan baris yang sudah ada tidak ikut dikirim.`
                    : "Belum ada baris yang siap dikirim. Perbaiki berkas sesuai catatan, lalu periksa ulang."}
              </p>
              {batch.status === "previewed" ? (
                <NexusWorkspaceButton
                  disabled={!canUpload || sendable === 0 || busy !== null}
                  onClick={submit}
                  tone="primary"
                  type="button"
                >
                  {busy === "submit"
                    ? "Mengirim..."
                    : `Kirim ${sendable} baris ke Tinjauan`}
                </NexusWorkspaceButton>
              ) : (
                <NexusWorkspaceLinkButton href="/nexus/tinjauan">
                  Buka Tinjauan
                </NexusWorkspaceLinkButton>
              )}
            </div>
          </NexusWorkspaceCard>

          <NexusWorkspaceCatalog labelledBy="import-result-title">
            <h2 className={styles.visuallyHidden} id="import-result-title">
              Rincian hasil impor
            </h2>
            <NexusWorkspaceTabs
              activeId={activeTab}
              label="Rincian hasil impor"
              onActiveChange={(id) => setActiveTab(id as TabId)}
              panelId="import-result-panel"
              tabs={[
                {
                  count: rows.length || summary.total,
                  id: "rows",
                  label: "Baris",
                },
                ...(sheets.length
                  ? [{ count: sheets.length, id: "sheets", label: "Lembar" }]
                  : []),
              ]}
            />

            <div className={styles.panel} id="import-result-panel">
              {activeTab === "sheets" && sheets.length ? (
                <NexusWorkspaceTableSection
                  guidance="Setiap lembar dicatat, termasuk lembar acuan evaluasi dan lembar yang tidak diimpor beserta alasannya."
                  summary={`${dataSheets} dari ${sheets.length} lembar berisi data`}
                  title="Lembar pada berkas"
                  titleId="import-sheets-title"
                >
                  <NexusWorkspaceRecordTable
                    caption="Status pembacaan setiap lembar pada berkas impor"
                    columns={sheetColumns}
                    empty={
                      <NexusWorkspaceEmptyState
                        description="Berkas tidak memuat lembar yang dapat dicatat."
                        title="Tidak ada lembar"
                      />
                    }
                    pagination={null}
                    rows={sheetTableRows}
                  />
                </NexusWorkspaceTableSection>
              ) : (
                <>
                  <NexusWorkspaceToolbar>
                    <NexusWorkspaceSearch
                      label="Cari baris impor"
                      name="import-row-search"
                      onValueChange={(value) => {
                        setSearch(value);
                        setPage(1);
                      }}
                      placeholder="Cari judul, nama, lembar, atau catatan"
                      value={search}
                    />
                    {[
                      actionFilterConfig,
                      houseFilterConfig,
                      sheetFilterConfig,
                    ].map((config) => (
                      <NexusWorkspaceSelect
                        config={config}
                        isOpen={openFilterId === config.id}
                        key={config.id}
                        name={`import-${config.id}`}
                        onOpenChange={(isOpen) =>
                          setOpenFilterId(isOpen ? config.id : null)
                        }
                        onValueChange={(value) => {
                          setFilters((current) => ({
                            ...current,
                            [config.id as FilterId]: value,
                          }));
                          setPage(1);
                        }}
                        placement="top-on-narrow"
                        value={filters[config.id as FilterId]}
                      />
                    ))}
                  </NexusWorkspaceToolbar>

                  {rowsState === "error" ? null : (
                    <NexusWorkspaceResultMeta
                      onResetFilters={
                        hasActiveFilters ? resetFilters : undefined
                      }
                      resultLabel={`${filtered.length} baris ditemukan`}
                    />
                  )}

                  <NexusWorkspaceTableSection
                    guidance="Buka rincian untuk melihat isian yang akan dikirim, catatan pemeriksaan, dan nilai asli pada lembar."
                    summary={
                      rowsState === "error"
                        ? undefined
                        : `${filtered.length} dari ${rows.length} baris sesuai filter`
                    }
                    title="Baris pada berkas"
                    titleId="import-rows-title"
                  >
                    <NexusWorkspaceRecordTable
                      caption="Hasil pemeriksaan setiap baris berkas impor"
                      columns={rowColumns}
                      empty={
                        <NexusWorkspaceEmptyState
                          description={
                            rows.length > 0
                              ? "Ubah kata kunci atau filter untuk melihat baris lain."
                              : "Berkas tidak memuat baris data yang dapat dibaca."
                          }
                          onResetFilters={
                            hasActiveFilters ? resetFilters : undefined
                          }
                          title={
                            rows.length > 0
                              ? "Tidak ada baris yang cocok"
                              : "Belum ada baris data"
                          }
                          tone={rows.length > 0 ? "search" : "empty"}
                        />
                      }
                      error={
                        rowsState === "error" ? (
                          <NexusWorkspaceLoadError
                            description={rowsError}
                            onRetry={() => {
                              if (publicId) void loadRows(publicId);
                            }}
                            title="Baris pratinjau belum dapat dimuat"
                          />
                        ) : undefined
                      }
                      isLoading={rowsState === "loading"}
                      pagination={
                        <NexusTablePagination
                          currentPage={safePage}
                          itemCount={filtered.length}
                          navigationLabel="Navigasi halaman baris impor"
                          nextPageLabel="Halaman berikutnya"
                          onPageChange={setPage}
                          onPageSizeChange={(value) => {
                            setPageSizeValue(value);
                            setPage(1);
                          }}
                          pageLabel="Halaman"
                          pageSizeConfig={pageSizeConfig}
                          pageSizeValue={pageSizeValue}
                          previousPageLabel="Halaman sebelumnya"
                          rangePrefix="Menampilkan"
                          totalUnit="baris"
                        />
                      }
                      rows={rowTableRows}
                    />
                  </NexusWorkspaceTableSection>
                </>
              )}
            </div>
          </NexusWorkspaceCatalog>
        </>
      ) : null}

      {selected ? (
        <NexusImportRowDetail
          onClose={() => setSelectedRow(null)}
          row={selected}
        />
      ) : null}
    </NexusWorkspacePage>
  );
}
