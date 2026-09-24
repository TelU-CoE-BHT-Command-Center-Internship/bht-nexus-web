"use client";

import { type FormEvent, useMemo, useState } from "react";
import styles from "@/components/nexus-monitoring/nexus-monitoring.module.css";
import {
  nexusCategoryEvaluations,
  nexusMonitoredCategories,
} from "@/components/nexus-monitoring/nexus-monitoring-evaluation";
import { useNexusMonitoringSession } from "@/components/nexus-monitoring/nexus-monitoring-session";
import {
  type NexusIndicatorTargetVersion,
  nexusCurrentTargetVersion,
  nexusTargetDisplay,
  nexusTargetHistory,
} from "@/components/nexus-monitoring/nexus-monitoring-targets";
import { NexusWorkspaceConfirmDialog } from "@/components/nexus-workspace-ui/nexus-workspace-confirm-dialog";
import { NexusWorkspaceDrawer } from "@/components/nexus-workspace-ui/nexus-workspace-drawer";
import {
  NexusWorkspaceButton,
  NexusWorkspaceNotice,
} from "@/components/nexus-workspace-ui/nexus-workspace-elements";
import { NexusWorkspaceFormField } from "@/components/nexus-workspace-ui/nexus-workspace-form-field";
import { formatAuditTimestamp } from "@/components/nexus-workspace-ui/nexus-workspace-format";
import { useNexusWorkspaceUnsavedChanges } from "@/components/nexus-workspace-ui/nexus-workspace-unsaved-changes";
import type { NexusKmIndicatorId } from "@/content/nexus-km-indicators";

type TargetDrawerMode = "period" | "targets";

const NO_COPY = "none";

function parseTarget(value: string, composite: boolean) {
  const trimmed = value.trim();
  if (!trimmed) return { empty: true as const };
  if (composite) {
    const match = /^(\d+)\s*\/\s*(\d+)M$/i.exec(trimmed);
    const count = match ? Number(match[1]) : Number.NaN;
    const value = match ? Number(match[2]) : Number.NaN;
    if (
      !Number.isSafeInteger(count) ||
      !Number.isSafeInteger(value) ||
      value <= 0
    ) {
      return {
        empty: false as const,
        error: "Gunakan format jumlah/nilai, misalnya 9/1M.",
      };
    }
    return {
      empty: false as const,
      literal: `${count}/${value}M`,
      value: null,
    };
  }
  const numeric = Number(trimmed.replace(",", "."));
  if (!Number.isSafeInteger(numeric) || numeric < 0) {
    return { empty: false as const, error: "Isi bilangan bulat 0 atau lebih." };
  }
  return { empty: false as const, literal: null, value: numeric };
}

function versionOrigin(version: NexusIndicatorTargetVersion) {
  if (version.origin === "workbook") return version.reason;
  if (version.origin === "copied") return "Disalin dari periode sebelumnya";
  return "Diubah pada Monitoring KM";
}

/**
 * Pengelolaan target satu periode dan pendaftaran periode baru. Setiap
 * perubahan menambah versi target; versi sebelumnya tetap tampil pada riwayat
 * sehingga angka lama tidak pernah hilang tanpa jejak.
 */
export function NexusMonitoringTargetDrawer({
  focusIndicatorId,
  onClose,
  onPeriodAdded,
  onSaved,
  periodId,
  suggestedYear,
}: {
  /** Diisi ketika drawer dibuka dari rincian satu indikator. */
  focusIndicatorId?: NexusKmIndicatorId;
  onClose: () => void;
  onPeriodAdded: (periodId: string) => void;
  onSaved: (message: string) => void;
  periodId: string;
  /** Tahun yang disarankan untuk periode baru, misalnya dari alamat halaman. */
  suggestedYear?: number;
}) {
  const { addPeriod, periods, saveTargets, targetVersions } =
    useNexusMonitoringSession();
  const [mode, setMode] = useState<TargetDrawerMode>(
    suggestedYear ? "period" : "targets",
  );
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [reason, setReason] = useState("");
  const [query, setQuery] = useState("");
  const [showChangedOnly, setShowChangedOnly] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  const latestPeriod = [...periods].sort((a, b) => b.year - a.year)[0];
  const [newYear, setNewYear] = useState(
    suggestedYear
      ? String(suggestedYear)
      : latestPeriod
        ? String(latestPeriod.year + 1)
        : "",
  );
  const [copyFrom, setCopyFrom] = useState(latestPeriod?.id ?? NO_COPY);
  const [periodReason, setPeriodReason] = useState("");
  const [periodBaseline, setPeriodBaseline] = useState({
    year: newYear,
    copyFrom,
  });

  const groups = useMemo(
    () =>
      nexusMonitoredCategories
        .map((category) => ({
          category,
          evaluations: nexusCategoryEvaluations(category).filter(
            (evaluation) =>
              !focusIndicatorId || evaluation.indicator.id === focusIndicatorId,
          ),
        }))
        .filter((group) => group.evaluations.length > 0),
    [focusIndicatorId],
  );

  const parsed = Object.entries(drafts).map(([indicatorId, value]) => ({
    indicatorId: indicatorId as NexusKmIndicatorId,
    parsed: parseTarget(value, indicatorId === "KM-23"),
  }));
  const changes = parsed.flatMap((item) =>
    "value" in item.parsed && item.parsed.value !== undefined
      ? [
          {
            indicatorId: item.indicatorId,
            literal: item.parsed.literal,
            value: item.parsed.value,
          },
        ]
      : [],
  );
  const effectiveChanges = changes.filter((change) => {
    const current = nexusCurrentTargetVersion(
      targetVersions,
      periodId,
      change.indicatorId,
    );
    return !(
      current?.value === change.value && current.literal === change.literal
    );
  });
  const rowErrors = new Map(
    parsed.flatMap((item) =>
      "error" in item.parsed && item.parsed.error
        ? [[item.indicatorId, item.parsed.error] as const]
        : [],
    ),
  );
  const changedIds = new Set(
    effectiveChanges.map((change) => change.indicatorId),
  );
  const search = query.trim().toLocaleLowerCase("id-ID");
  const visibleGroups = groups
    .map((group) => ({
      ...group,
      evaluations: group.evaluations.filter((evaluation) => {
        const id = evaluation.indicator.id;
        return (
          (!showChangedOnly || changedIds.has(id)) &&
          (!search ||
            `${id} ${evaluation.indicator.label}`
              .toLocaleLowerCase("id-ID")
              .includes(search))
        );
      }),
    }))
    .filter((group) => group.evaluations.length > 0);
  const indicatorCount = groups.reduce(
    (count, group) => count + group.evaluations.length,
    0,
  );
  const targetsDirty =
    Object.values(drafts).some((value) => value.trim() !== "") ||
    reason.trim() !== "";
  const periodDirty =
    periodReason.trim() !== "" ||
    newYear !== periodBaseline.year ||
    copyFrom !== periodBaseline.copyFrom;
  const isDirty = targetsDirty || periodDirty;

  const yearNumber = Number(newYear);
  const maxYear = new Date().getFullYear() + 2;
  const yearError = !Number.isInteger(yearNumber)
    ? "Isi tahun evaluasi dengan empat angka."
    : yearNumber < 2000 || yearNumber > maxYear
      ? `Tahun evaluasi harus antara 2000 dan ${maxYear}.`
      : periods.some((item) => item.id === String(yearNumber))
        ? `Periode ${yearNumber} sudah terdaftar.`
        : "";

  useNexusWorkspaceUnsavedChanges({
    confirmLabel: "Buang dan keluar",
    description:
      "Perubahan target yang belum disimpan akan hilang jika Anda meninggalkan halaman ini.",
    isDirty,
    title: "Buang perubahan target?",
  });

  const history = nexusTargetHistory(
    targetVersions,
    periodId,
    focusIndicatorId,
  );

  function requestClose() {
    if (isDirty) {
      setDiscardOpen(true);
      return;
    }
    onClose();
  }

  function submitTargets(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    if (rowErrors.size > 0 || effectiveChanges.length === 0) return;
    if (!reason.trim()) return;
    setConfirmOpen(true);
  }

  function submitPeriod(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    if (yearError || !periodReason.trim()) return;
    const period = addPeriod({
      copyFromPeriodId: copyFrom === NO_COPY ? undefined : copyFrom,
      reason: periodReason.trim(),
      year: yearNumber,
    });
    setMode("targets");
    setNewYear(String(period.year + 1));
    setCopyFrom(period.id);
    setPeriodBaseline({ year: String(period.year + 1), copyFrom: period.id });
    setPeriodReason("");
    setSubmitted(false);
    onPeriodAdded(period.id);
  }

  return (
    <>
      <NexusWorkspaceDrawer
        closeLabel="Tutup pengelolaan target"
        description={
          mode === "period"
            ? "Periode baru mendapat target sendiri. Target periode yang sudah ada tidak berubah."
            : `Target berlaku untuk periode ${periodId}. Setiap perubahan disimpan sebagai versi baru dan versi sebelumnya tetap tercatat.`
        }
        eyebrow="Monitoring KM"
        footer={
          <div className={styles.targetActionBar}>
            <span aria-live="polite">
              {mode === "period"
                ? `Periode baru ${newYear || "—"}`
                : `${effectiveChanges.length} dari ${indicatorCount} target berubah`}
            </span>
            <div>
              <NexusWorkspaceButton onClick={requestClose} type="button">
                Batal
              </NexusWorkspaceButton>
              <NexusWorkspaceButton
                disabled={mode === "targets" && effectiveChanges.length === 0}
                form={
                  mode === "period"
                    ? "monitoring-period-form"
                    : "monitoring-target-form"
                }
                tone="primary"
                type="submit"
              >
                {mode === "period" ? "Tambah periode" : "Simpan target"}
              </NexusWorkspaceButton>
            </div>
          </div>
        }
        onClose={requestClose}
        title={
          mode === "period"
            ? "Tambah periode evaluasi"
            : focusIndicatorId
              ? `Ubah target ${focusIndicatorId}`
              : `Kelola target ${periodId}`
        }
      >
        {mode === "period" ? (
          <form
            className={styles.targetForm}
            id="monitoring-period-form"
            noValidate
            onSubmit={submitPeriod}
          >
            <div className={styles.targetContext}>
              <strong>Siapkan tahun evaluasi berikutnya</strong>
              <span>
                Target awal dapat disalin lalu disesuaikan tanpa mengubah
                periode sebelumnya.
              </span>
            </div>
            <NexusWorkspaceFormField
              error={submitted ? yearError : undefined}
              hint="Satu periode mewakili satu tahun evaluasi, Januari–Desember."
              id="monitoring-period-year"
              label="Tahun evaluasi"
              min="2000"
              name="year"
              onChange={(event) => setNewYear(event.currentTarget.value)}
              required
              type="number"
              value={newYear}
              wide
            />
            <NexusWorkspaceFormField
              hint="Target salinan dapat langsung disesuaikan setelah periode dibuat."
              id="monitoring-period-copy"
              label="Target awal"
              name="copyFrom"
              onChange={(event) => setCopyFrom(event.currentTarget.value)}
              options={[
                ...[...periods]
                  .sort((a, b) => b.year - a.year)
                  .map((item) => ({
                    label: `Salin target periode ${item.id}`,
                    value: item.id,
                  })),
                { label: "Mulai tanpa target", value: NO_COPY },
              ]}
              type="select"
              value={copyFrom}
              wide
            />
            <NexusWorkspaceFormField
              error={
                submitted && !periodReason.trim()
                  ? "Tuliskan dasar penambahan periode."
                  : undefined
              }
              hint="Contoh: target KM 2027 ditetapkan pada rapat pengurus Januari."
              id="monitoring-period-reason"
              label="Dasar penetapan"
              name="periodReason"
              onChange={(event) => setPeriodReason(event.currentTarget.value)}
              required
              type="textarea"
              value={periodReason}
              wide
            />
            {!suggestedYear ? (
              <NexusWorkspaceButton
                onClick={() => {
                  setMode("targets");
                  setSubmitted(false);
                }}
                type="button"
              >
                Kembali ke target {periodId}
              </NexusWorkspaceButton>
            ) : null}
          </form>
        ) : (
          <form
            className={styles.targetForm}
            id="monitoring-target-form"
            noValidate
            onSubmit={submitTargets}
          >
            <div className={styles.targetContext}>
              <strong>Periode {periodId}</strong>
              <span>
                {indicatorCount} indikator · target berlaku sampai akhir tahun
                evaluasi
              </span>
            </div>
            <p className={styles.targetHelp}>
              Isi hanya target yang berubah. Kolom kosong tetap memakai target
              yang berlaku.
            </p>
            {focusIndicatorId ? null : (
              <div className={styles.targetToolbar}>
                <label className={styles.targetSearch}>
                  <span>Cari indikator</span>
                  <input
                    onChange={(event) => setQuery(event.currentTarget.value)}
                    placeholder="Cari KM atau nama indikator"
                    type="search"
                    value={query}
                  />
                </label>
                <button
                  aria-pressed={showChangedOnly}
                  className={styles.targetChangedToggle}
                  onClick={() => setShowChangedOnly((value) => !value)}
                  type="button"
                >
                  Hanya yang berubah ({effectiveChanges.length})
                </button>
                <NexusWorkspaceButton
                  onClick={() => {
                    setMode("period");
                    setSubmitted(false);
                  }}
                  type="button"
                >
                  Tambah periode
                </NexusWorkspaceButton>
              </div>
            )}

            <details className={styles.targetHistory}>
              <summary>
                Riwayat target periode {periodId} ({history.length})
              </summary>
              {history.length === 0 ? (
                <p>Belum ada target yang ditetapkan untuk periode ini.</p>
              ) : (
                <ol>
                  {history.map((version) => {
                    const previous = targetVersions.find(
                      (item) =>
                        item.periodId === version.periodId &&
                        item.indicatorId === version.indicatorId &&
                        item.version === version.version - 1,
                    );
                    return (
                      <li key={version.id}>
                        <strong>
                          {version.indicatorId} · v{version.version}
                          {previous
                            ? ` · ${nexusTargetDisplay(previous)} → ${nexusTargetDisplay(version)}`
                            : ` · ${nexusTargetDisplay(version)}`}
                        </strong>
                        <span>
                          {version.actorName}
                          {version.recordedAt
                            ? ` · ${formatAuditTimestamp(version.recordedAt)}`
                            : ""}
                          {` · ${versionOrigin(version)}`}
                        </span>
                        {version.origin === "workbook" ? null : (
                          <p>{version.reason}</p>
                        )}
                      </li>
                    );
                  })}
                </ol>
              )}
            </details>

            {visibleGroups.length === 0 ? (
              <NexusWorkspaceNotice>
                Tidak ada indikator yang cocok. Ubah pencarian atau tampilkan
                semua target.
              </NexusWorkspaceNotice>
            ) : null}

            {visibleGroups.length > 0 ? (
              <div aria-hidden="true" className={styles.targetColumnHead}>
                <span>Indikator</span>
                <span>Target berlaku</span>
                <span>Target baru</span>
              </div>
            ) : null}

            {visibleGroups.map((group) => (
              <fieldset className={styles.targetGroup} key={group.category}>
                <legend>
                  {group.category} · {group.evaluations.length} indikator
                </legend>
                {group.evaluations.map((evaluation) => {
                  const id = evaluation.indicator.id;
                  const current = nexusCurrentTargetVersion(
                    targetVersions,
                    periodId,
                    id,
                  );
                  const inputId = `monitoring-target-${id}`;
                  const composite = id === "KM-23";
                  const error = rowErrors.get(id);
                  return (
                    <div
                      className={styles.targetRow}
                      data-changed={changedIds.has(id) || undefined}
                      key={id}
                    >
                      <label htmlFor={inputId}>
                        <strong>{id}</strong>
                        <span>{evaluation.indicator.label}</span>
                      </label>
                      <span className={styles.targetCurrent}>
                        <small>Berlaku</small>
                        <strong>
                          {current
                            ? nexusTargetDisplay(current)
                            : "Belum ditetapkan"}
                        </strong>
                        {current ? (
                          <small>Versi {current.version}</small>
                        ) : null}
                      </span>
                      <span className={styles.targetInput}>
                        <input
                          aria-describedby={
                            error ? `${inputId}-error` : undefined
                          }
                          aria-invalid={Boolean(error)}
                          aria-label={`Target baru ${id} ${evaluation.indicator.label}`}
                          id={inputId}
                          inputMode={composite ? "text" : "numeric"}
                          min={composite ? undefined : "0"}
                          onChange={(event) => {
                            const value = event.currentTarget.value;
                            setDrafts((draftsNow) => ({
                              ...draftsNow,
                              [id]: value,
                            }));
                          }}
                          placeholder={
                            composite ? "Contoh 9/1M" : "Target baru"
                          }
                          type={composite ? "text" : "number"}
                          value={drafts[id] ?? ""}
                        />
                        {composite ? (
                          <small className={styles.targetCompositeHint}>
                            Target gabungan jumlah / nilai dalam Miliar.
                          </small>
                        ) : null}
                        {changedIds.has(id) ? (
                          <em>Perubahan siap disimpan</em>
                        ) : null}
                        {error ? (
                          <small id={`${inputId}-error`}>{error}</small>
                        ) : null}
                      </span>
                    </div>
                  );
                })}
              </fieldset>
            ))}

            {effectiveChanges.length > 0 ? (
              <section aria-live="polite" className={styles.targetReview}>
                <strong>
                  {effectiveChanges.length} perubahan siap disimpan
                </strong>
                <ul>
                  {effectiveChanges.map((change) => {
                    const current = nexusCurrentTargetVersion(
                      targetVersions,
                      periodId,
                      change.indicatorId,
                    );
                    return (
                      <li key={change.indicatorId}>
                        <span>{change.indicatorId}</span>
                        <span>
                          {current
                            ? nexusTargetDisplay(current)
                            : "Belum ditetapkan"}{" "}
                          → {change.literal ?? change.value}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ) : null}

            <NexusWorkspaceFormField
              error={
                submitted && effectiveChanges.length > 0 && !reason.trim()
                  ? "Tuliskan alasan perubahan target."
                  : undefined
              }
              hint="Alasan tercatat pada riwayat bersama nama Anda dan waktu perubahan."
              id="monitoring-target-reason"
              label="Alasan perubahan"
              name="reason"
              onChange={(event) => setReason(event.currentTarget.value)}
              required
              type="textarea"
              value={reason}
              wide
            />

            {submitted &&
            effectiveChanges.length === 0 &&
            rowErrors.size === 0 ? (
              <NexusWorkspaceNotice>
                Belum ada target yang berbeda dari target yang berlaku.
              </NexusWorkspaceNotice>
            ) : null}
          </form>
        )}
      </NexusWorkspaceDrawer>

      {confirmOpen ? (
        <NexusWorkspaceConfirmDialog
          cancelLabel="Periksa lagi"
          confirmLabel="Simpan target"
          description={`${effectiveChanges.length} target periode ${periodId} akan memakai nilai baru. Versi sebelumnya tetap tercatat pada riwayat.`}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={() => {
            const saved = saveTargets({
              changes: effectiveChanges,
              periodId,
              reason: reason.trim(),
            });
            setConfirmOpen(false);
            onSaved(
              `${saved} target periode ${periodId} diperbarui. Angka capaian sudah dihitung ulang.`,
            );
          }}
          title={`Simpan ${effectiveChanges.length} target baru?`}
          tone="primary"
        />
      ) : null}

      {discardOpen ? (
        <NexusWorkspaceConfirmDialog
          cancelLabel="Lanjutkan mengisi"
          confirmLabel="Buang perubahan"
          description="Isian target dan alasan yang belum disimpan akan dihapus."
          onCancel={() => setDiscardOpen(false)}
          onConfirm={() => {
            setDiscardOpen(false);
            onClose();
          }}
          title="Buang perubahan target?"
          tone="warning"
        />
      ) : null}
    </>
  );
}
