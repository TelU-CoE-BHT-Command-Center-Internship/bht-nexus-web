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

function parseTarget(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return { empty: true as const };
  const numeric = Number(trimmed.replace(",", "."));
  if (!Number.isInteger(numeric) || numeric < 0) {
    return { empty: false as const, error: "Isi bilangan bulat 0 atau lebih." };
  }
  return { empty: false as const, value: numeric };
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
    parsed: parseTarget(value),
  }));
  const changes = parsed.flatMap((item) =>
    "value" in item.parsed && item.parsed.value !== undefined
      ? [{ indicatorId: item.indicatorId, value: item.parsed.value }]
      : [],
  );
  const effectiveChanges = changes.filter((change) => {
    const current = nexusCurrentTargetVersion(
      targetVersions,
      periodId,
      change.indicatorId,
    );
    return !(current?.value === change.value && current.literal === null);
  });
  const rowErrors = new Map(
    parsed.flatMap((item) =>
      "error" in item.parsed && item.parsed.error
        ? [[item.indicatorId, item.parsed.error] as const]
        : [],
    ),
  );
  const targetsDirty =
    Object.values(drafts).some((value) => value.trim() !== "") ||
    reason.trim() !== "";
  const periodDirty = mode === "period" && periodReason.trim() !== "";
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
            noValidate
            onSubmit={submitPeriod}
          >
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
            <footer className={styles.formFooter}>
              <NexusWorkspaceButton
                onClick={() => {
                  setMode("targets");
                  setSubmitted(false);
                }}
                type="button"
              >
                Kembali ke target
              </NexusWorkspaceButton>
              <NexusWorkspaceButton tone="primary" type="submit">
                Tambah periode
              </NexusWorkspaceButton>
            </footer>
          </form>
        ) : (
          <form
            className={styles.targetForm}
            noValidate
            onSubmit={submitTargets}
          >
            {focusIndicatorId ? null : (
              <div className={styles.targetToolbar}>
                <p>
                  Isi hanya target yang berubah. Kolom yang dibiarkan kosong
                  tetap memakai target yang berlaku.
                </p>
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

            {groups.map((group) => (
              <fieldset className={styles.targetGroup} key={group.category}>
                <legend>{group.category}</legend>
                {group.evaluations.map((evaluation) => {
                  const id = evaluation.indicator.id;
                  const current = nexusCurrentTargetVersion(
                    targetVersions,
                    periodId,
                    id,
                  );
                  const inputId = `monitoring-target-${id}`;
                  const error = rowErrors.get(id);
                  return (
                    <div className={styles.targetRow} key={id}>
                      <label htmlFor={inputId}>
                        <strong>{id}</strong>
                        <span>{evaluation.indicator.label}</span>
                      </label>
                      <span className={styles.targetCurrent}>
                        <small>Berlaku</small>
                        {current
                          ? `${nexusTargetDisplay(current)} · v${current.version}`
                          : "Belum ditetapkan"}
                      </span>
                      <span className={styles.targetInput}>
                        <input
                          aria-describedby={
                            error ? `${inputId}-error` : undefined
                          }
                          aria-invalid={Boolean(error)}
                          aria-label={`Target baru ${id} ${evaluation.indicator.label}`}
                          id={inputId}
                          inputMode="numeric"
                          min="0"
                          onChange={(event) => {
                            const value = event.currentTarget.value;
                            setDrafts((draftsNow) => ({
                              ...draftsNow,
                              [id]: value,
                            }));
                          }}
                          placeholder="Target baru"
                          type="number"
                          value={drafts[id] ?? ""}
                        />
                        {error ? (
                          <small id={`${inputId}-error`}>{error}</small>
                        ) : null}
                      </span>
                    </div>
                  );
                })}
              </fieldset>
            ))}

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

            <footer className={styles.formFooter}>
              <NexusWorkspaceButton onClick={requestClose} type="button">
                Batal
              </NexusWorkspaceButton>
              <NexusWorkspaceButton tone="primary" type="submit">
                Simpan target
              </NexusWorkspaceButton>
            </footer>

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
