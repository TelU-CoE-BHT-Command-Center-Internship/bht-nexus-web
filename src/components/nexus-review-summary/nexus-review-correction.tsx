"use client";

import { type FormEvent, useMemo, useState } from "react";
import styles from "@/components/nexus-review-summary/nexus-review-correction.module.css";
import type {
  ReviewCandidateRow,
  ReviewRecord,
  ReviewRecordFieldKey,
  ReviewRevisionChange,
} from "@/components/nexus-review-summary/nexus-review-table-content";
import {
  reviewRecordFieldLabels,
  reviewRecordFieldOrder,
} from "@/components/nexus-review-summary/nexus-review-table-content";
import { NexusWorkspaceDrawer } from "@/components/nexus-workspace-ui/nexus-workspace-drawer";

type NexusReviewCorrectionProps = {
  candidate: ReviewCandidateRow;
  onClose: () => void;
  onResubmit: (
    candidateId: string,
    record: ReviewRecord,
    note: string,
    changes: readonly ReviewRevisionChange[],
  ) => void;
};

type CorrectionField = {
  help: string;
  inputMode?: "numeric" | "url";
  key: ReviewRecordFieldKey;
  maxLength: number;
  multiline?: boolean;
  placeholder: string;
  required?: boolean;
};

const correctionFields: readonly CorrectionField[] = [
  {
    help: "Gunakan judul karya sebagaimana tercantum pada sumber utama.",
    key: "title",
    maxLength: 320,
    multiline: true,
    placeholder: "Masukkan judul publikasi",
    required: true,
  },
  {
    help: "Pisahkan setiap nama dengan tanda titik koma (;).",
    key: "authors",
    maxLength: 500,
    multiline: true,
    placeholder: "Nama penulis pertama; penulis kedua",
    required: true,
  },
  {
    help: "Tuliskan nama jurnal, prosiding, atau penerbit karya.",
    key: "journal",
    maxLength: 240,
    placeholder: "Nama jurnal atau wadah terbit",
    required: true,
  },
  {
    help: "Gunakan empat angka, misalnya 2026.",
    inputMode: "numeric",
    key: "year",
    maxLength: 4,
    placeholder: "2026",
    required: true,
  },
  {
    help: "Kosongkan bila jenis karya memang tidak memiliki DOI dan jelaskan pada dasar perbaikan.",
    key: "doi",
    maxLength: 180,
    placeholder: "10.xxxx/xxxxx",
  },
  {
    help: "Cantumkan seluruh afiliasi yang didukung oleh sumber.",
    key: "affiliation",
    maxLength: 320,
    multiline: true,
    placeholder: "Telkom University; institusi kolaborator",
  },
  {
    help: "Pisahkan kata kunci dengan tanda titik koma (;).",
    key: "keywords",
    maxLength: 500,
    multiline: true,
    placeholder: "kata kunci pertama; kata kunci kedua",
  },
  {
    help: "Isi hanya jika abstrak tersedia pada sumber yang dapat diperiksa.",
    key: "abstract",
    maxLength: 1800,
    multiline: true,
    placeholder: "Ringkasan publikasi",
  },
];

function normalizeRecord(record: ReviewRecord): ReviewRecord {
  return Object.fromEntries(
    reviewRecordFieldOrder.map((key) => [key, record[key].trim()]),
  ) as ReviewRecord;
}

function CorrectionIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path d="m4 16.5-.7 4.2 4.2-.7L19 8.5 15.5 5 4 16.5Z" />
      <path d="m13.8 6.7 3.5 3.5M4 21h16" />
    </svg>
  );
}

export function NexusReviewCorrection({
  candidate,
  onClose,
  onResubmit,
}: NexusReviewCorrectionProps) {
  const requestedFieldKeys = candidate.requestedCorrectionFields?.length
    ? candidate.requestedCorrectionFields
    : reviewRecordFieldOrder;
  const requestedFields = correctionFields.filter((field) =>
    requestedFieldKeys.includes(field.key),
  );
  const referenceFields = correctionFields.filter(
    (field) => !requestedFieldKeys.includes(field.key),
  );
  const [draftRecord, setDraftRecord] = useState<ReviewRecord>({
    ...candidate.record,
  });
  const [sourceNote, setSourceNote] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const normalizedDraft = useMemo(
    () => normalizeRecord(draftRecord),
    [draftRecord],
  );
  const changes = useMemo(
    () =>
      requestedFieldKeys.flatMap<ReviewRevisionChange>((key) => {
        const previousValue = candidate.record[key].trim();
        const currentValue = normalizedDraft[key];

        return previousValue === currentValue
          ? []
          : [
              {
                currentValue,
                key,
                label: reviewRecordFieldLabels[key],
                previousValue,
              },
            ];
      }),
    [candidate.record, normalizedDraft, requestedFieldKeys],
  );
  const canPrepareSubmission =
    changes.length > 0 && sourceNote.trim().length >= 8;

  const changeField = (key: ReviewRecordFieldKey, value: string) => {
    setDraftRecord((currentRecord) => ({
      ...currentRecord,
      [key]: value,
    }));
    setShowConfirmation(false);
  };

  const prepareSubmission = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canPrepareSubmission) return;
    setShowConfirmation(true);
  };

  const confirmSubmission = () => {
    if (!canPrepareSubmission) return;
    onResubmit(candidate.id, normalizedDraft, sourceNote.trim(), changes);
  };

  return (
    <NexusWorkspaceDrawer
      closeLabel="Tutup perbaikan kandidat"
      description="Perbaiki metadata sesuai catatan pemeriksa, lalu kirimkan versi baru untuk ditinjau kembali."
      eyebrow={`${candidate.id} · ${candidate.version}`}
      onClose={onClose}
      steps={[
        {
          active: true,
          complete: true,
          label: "Permintaan",
          number: 1,
        },
        {
          active: true,
          complete: showConfirmation,
          label: "Perbaikan",
          number: 2,
        },
        {
          active: showConfirmation,
          label: "Kirim ulang",
          number: 3,
        },
      ]}
      title="Perbaiki kandidat"
    >
      <section className={styles.requestCard}>
        <span className={styles.requestIcon}>
          <CorrectionIcon />
        </span>
        <div>
          <span>Permintaan pemeriksa</span>
          <h3>Metadata perlu diperbaiki sebelum keputusan dapat diberikan</h3>
          <p>
            {candidate.reviewerNote.trim() ||
              candidate.previousIssue ||
              "Periksa kembali metadata kandidat berdasarkan sumber yang dapat ditelusuri."}
          </p>
          <small>
            Pemilik data: {candidate.owner.name} · Sumber awal:{" "}
            {candidate.provenance.map((source) => source.label).join(" + ")}
          </small>
          <ul className={styles.requestedFieldList}>
            {requestedFieldKeys.map((fieldKey) => (
              <li key={fieldKey}>{reviewRecordFieldLabels[fieldKey]}</li>
            ))}
          </ul>
        </div>
      </section>

      {candidate.latestRevision ? (
        <aside className={styles.previousRevision}>
          <strong>Versi sebelumnya pernah dikirim ulang</strong>
          <p>
            Periksa permintaan terbaru di atas. Riwayat perubahan sebelumnya
            tetap tersedia pada bagian riwayat kandidat.
          </p>
        </aside>
      ) : null}

      <form className={styles.form} onSubmit={prepareSubmission}>
        <section aria-labelledby="correction-fields-title">
          <div className={styles.sectionHeading}>
            <div>
              <span>01</span>
              <h3 id="correction-fields-title">Perbaiki metadata</h3>
            </div>
            <p>Nilai resmi belum berubah</p>
          </div>

          <p className={styles.sectionIntro}>
            Hanya bidang yang diminta pemeriksa yang dapat diubah. Nilai di
            kolom kiri adalah versi kandidat yang dikembalikan.
          </p>

          <div className={styles.fieldList}>
            {requestedFields.map((field) => {
              const fieldId = `${candidate.id}-${field.key}-correction`;
              const helpId = `${fieldId}-help`;

              return (
                <div className={styles.fieldCard} key={field.key}>
                  <div className={styles.currentValue}>
                    <span>{reviewRecordFieldLabels[field.key]} saat ini</span>
                    <p>{candidate.record[field.key] || "Belum tersedia"}</p>
                  </div>
                  <label htmlFor={fieldId}>
                    <span>
                      {reviewRecordFieldLabels[field.key]}
                      {field.required ? <em> wajib</em> : null}
                    </span>
                    {field.multiline ? (
                      <textarea
                        aria-describedby={helpId}
                        id={fieldId}
                        maxLength={field.maxLength}
                        onChange={(event) =>
                          changeField(field.key, event.currentTarget.value)
                        }
                        placeholder={field.placeholder}
                        required={field.required}
                        rows={field.key === "abstract" ? 5 : 2}
                        value={draftRecord[field.key]}
                      />
                    ) : (
                      <input
                        aria-describedby={helpId}
                        id={fieldId}
                        inputMode={field.inputMode}
                        maxLength={field.maxLength}
                        onChange={(event) =>
                          changeField(field.key, event.currentTarget.value)
                        }
                        pattern={field.key === "year" ? "[0-9]{4}" : undefined}
                        placeholder={field.placeholder}
                        required={field.required}
                        type="text"
                        value={draftRecord[field.key]}
                      />
                    )}
                    <small id={helpId}>{field.help}</small>
                  </label>
                </div>
              );
            })}
          </div>

          {referenceFields.length > 0 ? (
            <details className={styles.referenceFields}>
              <summary>
                Lihat {referenceFields.length} bidang lain (hanya baca)
              </summary>
              <p>
                Bidang berikut tidak termasuk permintaan ini dan tidak berubah
                pada versi yang dikirim ulang.
              </p>
              <dl>
                {referenceFields.map((field) => (
                  <div key={field.key}>
                    <dt>{reviewRecordFieldLabels[field.key]}</dt>
                    <dd>{candidate.record[field.key] || "Belum tersedia"}</dd>
                  </div>
                ))}
              </dl>
            </details>
          ) : null}
        </section>

        <section aria-labelledby="correction-source-title">
          <div className={styles.sectionHeading}>
            <div>
              <span>02</span>
              <h3 id="correction-source-title">Jelaskan dasar perbaikan</h3>
            </div>
            <p>Wajib untuk pemeriksa berikutnya</p>
          </div>

          <label className={styles.sourceField}>
            <span>Sumber atau dasar perubahan</span>
            <textarea
              maxLength={600}
              minLength={8}
              onChange={(event) => {
                setSourceNote(event.currentTarget.value);
                setShowConfirmation(false);
              }}
              placeholder="Contoh: DOI dan afiliasi diperiksa pada halaman penerbit. Tautan atau nama dokumen: …"
              required
              rows={4}
              value={sourceNote}
            />
            <small>
              Cantumkan tautan, nama dokumen, atau penjelasan sumber yang dapat
              diperiksa · {sourceNote.length} / 600 karakter
            </small>
          </label>
        </section>

        <section aria-labelledby="correction-summary-title">
          <div className={styles.sectionHeading}>
            <div>
              <span>03</span>
              <h3 id="correction-summary-title">Ringkasan perubahan</h3>
            </div>
            <p>{changes.length} bidang berubah</p>
          </div>

          {changes.length > 0 ? (
            <ul className={styles.changeList}>
              {changes.map((change) => (
                <li key={change.key}>
                  <strong>{change.label}</strong>
                  <div>
                    <span>
                      Sebelum
                      <b>{change.previousValue || "Belum tersedia"}</b>
                    </span>
                    <span>
                      Setelah
                      <b>{change.currentValue || "Dikosongkan"}</b>
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className={styles.noChanges}>
              <strong>Belum ada nilai yang berubah</strong>
              <p>
                Perbaiki sedikitnya satu bidang agar versi baru dapat dikirim
                kembali ke pemeriksa.
              </p>
            </div>
          )}
        </section>

        {showConfirmation ? (
          <div aria-live="polite" className={styles.confirmation}>
            <div>
              <strong>
                Kirim {changes.length} perubahan untuk ditinjau lagi?
              </strong>
              <p>
                Kandidat akan menjadi versi berikutnya dan kembali ke status
                Menunggu Tinjauan. Data resmi belum berubah.
              </p>
            </div>
            <div>
              <button
                className={styles.secondaryButton}
                onClick={() => setShowConfirmation(false)}
                type="button"
              >
                Kembali periksa
              </button>
              <button
                className={styles.primaryButton}
                onClick={confirmSubmission}
                type="button"
              >
                Ya, kirim ulang
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.submitRow}>
            <p>
              Setelah dikirim, pemeriksa dapat melihat nilai sebelum dan sesudah
              tanpa mengandalkan ingatan.
            </p>
            <button
              className={styles.primaryButton}
              disabled={!canPrepareSubmission}
              type="submit"
            >
              Periksa sebelum kirim
            </button>
          </div>
        )}
      </form>
    </NexusWorkspaceDrawer>
  );
}
