"use client";

import { type FormEvent, useEffect, useState } from "react";
import styles from "@/components/nexus-monitoring/nexus-monitoring.module.css";
import { nexusEvaluations } from "@/components/nexus-monitoring/nexus-monitoring-evaluation";
import { nexusQuarterLabels } from "@/components/nexus-monitoring/nexus-monitoring-quarter";
import type { MonitoringRecordView } from "@/components/nexus-monitoring/nexus-monitoring-view";
import {
  type OfficialRecordCorrectionChange,
  type OfficialRecordCorrectionValues,
  type OfficialRecordQuarter,
  officialRecordCorrectionLabels,
} from "@/components/nexus-official-records/nexus-official-record-corrections";
import {
  NexusWorkspaceButton,
  NexusWorkspaceNotice,
} from "@/components/nexus-workspace-ui/nexus-workspace-elements";
import { NexusWorkspaceFormField } from "@/components/nexus-workspace-ui/nexus-workspace-form-field";
import { useNexusWorkspaceUnsavedChanges } from "@/components/nexus-workspace-ui/nexus-workspace-unsaved-changes";
import {
  kmIndicator,
  type NexusKmIndicatorId,
} from "@/content/nexus-km-indicators";

const publicationTypes = [
  "Artikel Jurnal",
  "Makalah Konferensi",
  "Buku / Book Chapter",
  "Belum diklasifikasikan",
] as const;

const protections = [
  "Paten",
  "Hak Cipta",
  "Desain Industri",
  "Merek",
  "Belum diklasifikasikan",
] as const;

type CorrectionDraft = {
  businessDate: string;
  kmIds: readonly NexusKmIndicatorId[];
  protection: string;
  publicationType: string;
  quartile: string;
  reason: string;
  registrationNumber: string;
  reportedQuarter: string;
  year: string;
};

function initialDraft(record: MonitoringRecordView): CorrectionDraft {
  const { correction } = record;
  return {
    businessDate: correction.businessDateIso,
    kmIds: correction.kmIds,
    protection: correction.protection ?? "",
    publicationType: correction.publicationType ?? "",
    quartile: correction.quartile ?? "",
    reason: "",
    registrationNumber: correction.registrationNumber ?? "",
    reportedQuarter: correction.reportedQuarter
      ? String(correction.reportedQuarter)
      : "",
    year: correction.year === null ? "" : String(correction.year),
  };
}

function quarterText(value: string) {
  return value
    ? nexusQuarterLabels[Number(value) as OfficialRecordQuarter]
    : "Belum dipetakan";
}

function sameIds(
  first: readonly NexusKmIndicatorId[],
  second: readonly NexusKmIndicatorId[],
) {
  return (
    first.length === second.length && first.every((id) => second.includes(id))
  );
}

/**
 * Koreksi langsung atas bidang yang menentukan apakah dan kapan sebuah rekam
 * dihitung. Nilai baru ditulis ke rekam resmi yang sama sehingga rumah Data
 * Resmi dan seluruh angka Monitoring ikut berubah, dan setiap koreksi tercatat
 * beserta alasan, pelaku, dan waktunya.
 */
export function MonitoringRecordCorrection({
  onCancel,
  onDirtyChange,
  onSubmit,
  record,
}: {
  onCancel: () => void;
  onDirtyChange: (dirty: boolean) => void;
  onSubmit: (input: {
    changes: readonly OfficialRecordCorrectionChange[];
    reason: string;
    values: OfficialRecordCorrectionValues;
  }) => void;
  record: MonitoringRecordView;
}) {
  const { correction } = record;
  const supportsYear =
    correction.family === "publications" ||
    correction.family === "intellectual-property" ||
    correction.family === "academic";
  const [start] = useState(() => initialDraft(record));
  const [draft, setDraft] = useState(start);
  const [submitted, setSubmitted] = useState(false);

  const kmOptions = [
    ...nexusEvaluations
      .filter((evaluation) => evaluation.sourceFamily === correction.family)
      .map((evaluation) => evaluation.indicator),
    ...correction.kmIds
      .filter(
        (id) =>
          !nexusEvaluations.some(
            (evaluation) =>
              evaluation.indicator.id === id &&
              evaluation.sourceFamily === correction.family,
          ),
      )
      .map(kmIndicator),
  ];

  const values: OfficialRecordCorrectionValues = {};
  const changes: OfficialRecordCorrectionChange[] = [];
  function track<K extends keyof OfficialRecordCorrectionValues>(
    field: K,
    before: string,
    after: string,
    value: OfficialRecordCorrectionValues[K],
  ) {
    if (before === after) return;
    values[field] = value;
    changes.push({
      after: after || "Dikosongkan",
      before: before || "Belum tercatat",
      field,
      label: officialRecordCorrectionLabels[field],
    });
  }

  if (correction.businessDateField) {
    track(
      "businessDate",
      start.businessDate,
      draft.businessDate,
      draft.businessDate,
    );
  }
  if (supportsYear) {
    track(
      "year",
      start.year,
      draft.year.trim(),
      draft.year.trim() ? Number(draft.year) : null,
    );
  }
  track(
    "reportedQuarter",
    quarterText(start.reportedQuarter),
    quarterText(draft.reportedQuarter),
    draft.reportedQuarter
      ? (Number(draft.reportedQuarter) as OfficialRecordQuarter)
      : null,
  );
  if (correction.family === "publications") {
    track(
      "publicationType",
      start.publicationType,
      draft.publicationType,
      draft.publicationType as OfficialRecordCorrectionValues["publicationType"],
    );
    const quartile =
      draft.publicationType === "Artikel Jurnal" ? draft.quartile : "";
    track(
      "quartile",
      start.quartile,
      quartile,
      (quartile || null) as OfficialRecordCorrectionValues["quartile"],
    );
  }
  if (correction.family === "intellectual-property") {
    track(
      "protection",
      start.protection,
      draft.protection,
      draft.protection as OfficialRecordCorrectionValues["protection"],
    );
    track(
      "registrationNumber",
      start.registrationNumber,
      draft.registrationNumber.trim(),
      draft.registrationNumber.trim(),
    );
  }
  if (!sameIds(start.kmIds, draft.kmIds)) {
    values.kmIds = [...draft.kmIds];
    changes.push({
      after: draft.kmIds.join(", ") || "Tidak terkait indikator",
      before: start.kmIds.join(", ") || "Tidak terkait indikator",
      field: "kmIds",
      label: officialRecordCorrectionLabels.kmIds,
    });
  }

  const yearNumber = Number(draft.year);
  const yearError =
    supportsYear &&
    draft.year.trim() &&
    (!Number.isInteger(yearNumber) || yearNumber < 2000 || yearNumber > 2100)
      ? "Isi tahun dengan empat angka."
      : "";
  const dateYearConflict =
    supportsYear &&
    draft.businessDate &&
    draft.year.trim() &&
    Number(draft.businessDate.slice(0, 4)) !== yearNumber
      ? "Tahun pada tanggal berbeda dengan tahun rekam. Samakan keduanya."
      : "";
  const reasonError = draft.reason.trim()
    ? ""
    : "Tuliskan alasan koreksi supaya tercatat pada riwayat.";
  const isDirty = changes.length > 0 || draft.reason.trim() !== "";

  useEffect(() => {
    onDirtyChange(isDirty);
  }, [isDirty, onDirtyChange]);

  useNexusWorkspaceUnsavedChanges({
    confirmLabel: "Buang dan keluar",
    description:
      "Koreksi rekam yang belum disimpan akan hilang jika Anda meninggalkan halaman ini.",
    isDirty,
    title: "Buang koreksi rekam?",
  });

  function update<K extends keyof CorrectionDraft>(
    field: K,
    value: CorrectionDraft[K],
  ) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    if (changes.length === 0 || yearError || dateYearConflict || reasonError) {
      return;
    }
    onSubmit({ changes, reason: draft.reason.trim(), values });
  }

  return (
    <form className={styles.targetForm} noValidate onSubmit={submit}>
      <NexusWorkspaceNotice>
        Koreksi langsung mengubah rekam resmi ini pada {record.houseLabel} dan
        menghitung ulang seluruh indikator yang tertaut. Riwayatnya tetap
        tercatat.
      </NexusWorkspaceNotice>

      {correction.businessDateField ? (
        <NexusWorkspaceFormField
          error={submitted ? dateYearConflict || undefined : undefined}
          hint={
            correction.businessDateNote ??
            "Tanggal ini menentukan triwulan rekam."
          }
          id="monitoring-correction-date"
          label={correction.businessDateField}
          name="businessDate"
          onChange={(event) =>
            update("businessDate", event.currentTarget.value)
          }
          type="date"
          value={draft.businessDate}
          wide
        />
      ) : null}

      {supportsYear ? (
        <NexusWorkspaceFormField
          error={submitted ? yearError || undefined : undefined}
          hint="Tahun menentukan apakah rekam termasuk periode evaluasi."
          id="monitoring-correction-year"
          label="Tahun"
          min="2000"
          name="year"
          onChange={(event) => update("year", event.currentTarget.value)}
          type="number"
          value={draft.year}
        />
      ) : null}

      <NexusWorkspaceFormField
        hint={
          correction.businessDateField
            ? "Dipakai hanya bila tanggal belum tercatat."
            : "Triwulan realisasi menurut laporan."
        }
        id="monitoring-correction-quarter"
        label="Triwulan dilaporkan"
        name="reportedQuarter"
        onChange={(event) =>
          update("reportedQuarter", event.currentTarget.value)
        }
        options={[
          { label: "Belum dipetakan", value: "" },
          ...([1, 2, 3, 4] as const).map((quarter) => ({
            label: nexusQuarterLabels[quarter],
            value: String(quarter),
          })),
        ]}
        type="select"
        value={draft.reportedQuarter}
      />

      {correction.family === "publications" ? (
        <>
          <NexusWorkspaceFormField
            id="monitoring-correction-type"
            label="Bentuk karya"
            name="publicationType"
            onChange={(event) =>
              update("publicationType", event.currentTarget.value)
            }
            options={publicationTypes.map((type) => ({
              label: type,
              value: type,
            }))}
            type="select"
            value={draft.publicationType}
          />
          {draft.publicationType === "Artikel Jurnal" ? (
            <NexusWorkspaceFormField
              hint="Kuartil jurnal menurut SCImago/Scopus. Kosongkan bila belum diperiksa."
              id="monitoring-correction-quartile"
              label="Kuartil jurnal"
              name="quartile"
              onChange={(event) =>
                update("quartile", event.currentTarget.value)
              }
              options={[
                { label: "Belum tercatat", value: "" },
                ...["Q1", "Q2", "Q3", "Q4"].map((quartile) => ({
                  label: quartile,
                  value: quartile,
                })),
              ]}
              type="select"
              value={draft.quartile}
            />
          ) : null}
        </>
      ) : null}

      {correction.family === "intellectual-property" ? (
        <>
          <NexusWorkspaceFormField
            id="monitoring-correction-protection"
            label="Bentuk perlindungan"
            name="protection"
            onChange={(event) =>
              update("protection", event.currentTarget.value)
            }
            options={protections.map((protection) => ({
              label: protection,
              value: protection,
            }))}
            type="select"
            value={draft.protection}
          />
          <NexusWorkspaceFormField
            hint="HKI dihitung setelah memperoleh nomor pencatatan."
            id="monitoring-correction-registration"
            label="Nomor pencatatan"
            name="registrationNumber"
            onChange={(event) =>
              update("registrationNumber", event.currentTarget.value)
            }
            type="text"
            value={draft.registrationNumber}
          />
        </>
      ) : null}

      <fieldset className={styles.correctionCheckboxes}>
        <legend>Kaitan indikator KM</legend>
        {kmOptions.map((indicator) => (
          <label className={styles.correctionCheckbox} key={indicator.id}>
            <input
              checked={draft.kmIds.includes(indicator.id)}
              onChange={(event) => {
                const checked = event.currentTarget.checked;
                update(
                  "kmIds",
                  checked
                    ? [...draft.kmIds, indicator.id]
                    : draft.kmIds.filter((id) => id !== indicator.id),
                );
              }}
              type="checkbox"
            />
            <span>
              <strong>{indicator.id}</strong> {indicator.label}
            </span>
          </label>
        ))}
      </fieldset>

      <NexusWorkspaceFormField
        error={submitted ? reasonError || undefined : undefined}
        hint="Contoh: tanggal terbit diperiksa ulang pada laman penerbit."
        id="monitoring-correction-reason"
        label="Alasan koreksi"
        name="reason"
        onChange={(event) => update("reason", event.currentTarget.value)}
        required
        type="textarea"
        value={draft.reason}
        wide
      />

      {submitted && changes.length === 0 ? (
        <NexusWorkspaceNotice>
          Belum ada bidang yang berbeda dari nilai rekam saat ini.
        </NexusWorkspaceNotice>
      ) : null}

      <footer className={styles.formFooter}>
        <NexusWorkspaceButton onClick={onCancel} type="button">
          Batal
        </NexusWorkspaceButton>
        <NexusWorkspaceButton tone="primary" type="submit">
          Simpan koreksi
        </NexusWorkspaceButton>
      </footer>
    </form>
  );
}
