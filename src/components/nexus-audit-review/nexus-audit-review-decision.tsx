import { useState } from "react";
import type { AuditDecisionKind } from "@/components/nexus-audit-review/nexus-audit-review-content";
import { AuditReviewSectionHeading } from "@/components/nexus-audit-review/nexus-audit-review-detail";
import drawerStyles from "@/components/nexus-audit-review/nexus-audit-review-drawer.module.css";
import {
  type AuditReviewDrawerProps,
  auditCurrentValue,
  auditDecisionConsequence,
  type ReviewSectionIndexes,
} from "@/components/nexus-audit-review/nexus-audit-review-drawer-model";
import {
  NexusWorkspaceButton,
  NexusWorkspaceNotice,
} from "@/components/nexus-workspace-ui/nexus-workspace-elements";

type AuditReviewDecisionSectionProps = AuditReviewDrawerProps & {
  decisionIndex: ReviewSectionIndexes["decision"];
};

export function AuditReviewDecisionSection({
  decisionIndex,
  onClose,
  onDecide,
  onResubmit,
  record,
  state,
}: AuditReviewDecisionSectionProps) {
  const exactIdentifier = record.match?.verdict === "same_identifier";
  const [decisionChoice, setDecisionChoice] =
    useState<AuditDecisionKind | null>(exactIdentifier ? "merged" : null);
  const [note, setNote] = useState("");
  const [selectedFieldIds, setSelectedFieldIds] = useState<string[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [evidenceNote, setEvidenceNote] = useState("");
  const [draft, setDraft] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      record.fields.map((item) => [
        item.id,
        auditCurrentValue(record, state, item.id),
      ]),
    ),
  );
  const correctionFields = record.fields.filter((item) =>
    state.fixRequest?.fieldIds.includes(item.id),
  );
  const correctionChanged = correctionFields.some(
    (item) =>
      draft[item.id]?.trim() !== auditCurrentValue(record, state, item.id),
  );
  const correctionComplete = correctionFields.every(
    (item) => draft[item.id]?.trim().length > 0,
  );
  const consequence = auditDecisionConsequence(decisionChoice, record);
  const correctionSelectionReady =
    decisionChoice !== "changes_requested" || selectedFieldIds.length > 0;
  const decisionReady = Boolean(
    decisionChoice && note.trim().length > 0 && correctionSelectionReady,
  );

  const selectDecision = (choice: AuditDecisionKind) => {
    setDecisionChoice(choice);
    setShowConfirmation(false);
  };

  const toggleField = (fieldId: string) => {
    setSelectedFieldIds((current) =>
      current.includes(fieldId)
        ? current.filter((item) => item !== fieldId)
        : [...current, fieldId],
    );
    setShowConfirmation(false);
  };

  const confirmDecision = () => {
    if (!decisionChoice || !decisionReady) return;
    onDecide(
      decisionChoice,
      note.trim(),
      decisionChoice === "changes_requested" ? selectedFieldIds : [],
    );
  };

  if (state.status === "needs_fix" && state.fixRequest) {
    return (
      <section
        aria-labelledby="audit-correction-title"
        className={drawerStyles.reviewDecisionSection}
      >
        <AuditReviewSectionHeading
          id="audit-correction-title"
          index={decisionIndex}
          meta={`${correctionFields.length} bidang wajib diperbaiki`}
          title="Lengkapi perbaikan kandidat"
        />
        <NexusWorkspaceNotice tone="danger">
          {state.fixRequest.reason}
        </NexusWorkspaceNotice>
        <div className={drawerStyles.reviewCorrectionFields}>
          {correctionFields.map((item) => (
            <label className={drawerStyles.reviewTextField} key={item.id}>
              <span>{item.label}</span>
              <input
                id={`correction-${record.id}-${item.id}`}
                onChange={(event) => {
                  const nextValue = event.currentTarget.value;
                  setDraft((current) => ({
                    ...current,
                    [item.id]: nextValue,
                  }));
                }}
                value={draft[item.id] ?? ""}
              />
            </label>
          ))}
        </div>
        <label className={drawerStyles.reviewTextField}>
          <span>
            Catatan bukti perbaikan <b>WAJIB</b>
          </span>
          <textarea
            maxLength={600}
            onChange={(event) => setEvidenceNote(event.currentTarget.value)}
            placeholder="Jelaskan dokumen atau sumber yang menjadi dasar perubahan"
            rows={4}
            value={evidenceNote}
          />
        </label>
        <div className={drawerStyles.reviewDecisionActions}>
          <NexusWorkspaceButton onClick={onClose} type="button">
            Simpan untuk nanti
          </NexusWorkspaceButton>
          <NexusWorkspaceButton
            className={drawerStyles.reviewPrimaryAction}
            disabled={
              !correctionChanged ||
              !correctionComplete ||
              evidenceNote.trim().length === 0
            }
            onClick={() => onResubmit(draft, evidenceNote.trim())}
            tone="primary"
            type="button"
          >
            Kirim ulang untuk ditinjau
          </NexusWorkspaceButton>
        </div>
      </section>
    );
  }

  if (state.status === "completed" && state.decision) {
    return (
      <section
        aria-labelledby="audit-final-decision-title"
        className={drawerStyles.reviewDecisionSection}
      >
        <AuditReviewSectionHeading
          id="audit-final-decision-title"
          index={decisionIndex}
          meta="Keputusan final tercatat"
          title="Hasil tinjauan"
        />
        <div
          className={drawerStyles.reviewFinalState}
          data-tone={state.decision.kind === "rejected" ? "danger" : "success"}
        >
          <strong>{state.decision.label}</strong>
          <p>{state.decision.note}</p>
        </div>
        <dl className={drawerStyles.reviewFinalMeta}>
          <div>
            <dt>Reviewer</dt>
            <dd>{state.decision.actor}</dd>
          </div>
          <div>
            <dt>Waktu keputusan</dt>
            <dd>{state.decision.timeLabel}</dd>
          </div>
          <div>
            <dt>Versi kandidat</dt>
            <dd>V{state.version}</dd>
          </div>
        </dl>
        <div className={drawerStyles.reviewDecisionActions}>
          <NexusWorkspaceButton onClick={onClose} type="button">
            Tutup hasil tinjauan
          </NexusWorkspaceButton>
        </div>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="audit-decision-title"
      className={drawerStyles.reviewDecisionSection}
    >
      <AuditReviewSectionHeading
        id="audit-decision-title"
        index={decisionIndex}
        meta="Data resmi aman sampai keputusan dikonfirmasi"
        title="Tetapkan keputusan"
      />

      <fieldset className={drawerStyles.reviewDecisionChoices}>
        <legend>Pilih hasil tinjauan</legend>
        {record.match ? (
          <label data-selected={decisionChoice === "merged" || undefined}>
            <input
              checked={decisionChoice === "merged"}
              name={`decision-${record.id}`}
              onChange={() => selectDecision("merged")}
              type="radio"
            />
            <span className={drawerStyles.reviewRadio} />
            <span>
              <strong>Hubungkan ke {record.match.id}</strong>
              <small>
                Pilih jika bukti menunjukkan karya atau entitas yang sama.
              </small>
            </span>
          </label>
        ) : null}
        <label
          data-disabled={exactIdentifier || undefined}
          data-selected={decisionChoice === "approved_new" || undefined}
        >
          <input
            checked={decisionChoice === "approved_new"}
            disabled={exactIdentifier}
            name={`decision-${record.id}`}
            onChange={() => selectDecision("approved_new")}
            type="radio"
          />
          <span className={drawerStyles.reviewRadio} />
          <span>
            <strong>Terima sebagai data baru</strong>
            <small>
              {exactIdentifier
                ? "Tidak tersedia karena pengenal identik ditemukan."
                : "Tetapkan kandidat sebagai rekam resmi baru."}
            </small>
          </span>
        </label>
        <label
          data-selected={decisionChoice === "changes_requested" || undefined}
        >
          <input
            checked={decisionChoice === "changes_requested"}
            name={`decision-${record.id}`}
            onChange={() => selectDecision("changes_requested")}
            type="radio"
          />
          <span className={drawerStyles.reviewRadio} />
          <span>
            <strong>Minta perbaikan</strong>
            <small>Kembalikan kandidat; data resmi tetap tidak berubah.</small>
          </span>
        </label>
        <label data-selected={decisionChoice === "rejected" || undefined}>
          <input
            checked={decisionChoice === "rejected"}
            name={`decision-${record.id}`}
            onChange={() => selectDecision("rejected")}
            type="radio"
          />
          <span className={drawerStyles.reviewRadio} />
          <span>
            <strong>Tolak kandidat</strong>
            <small>Tutup kandidat tanpa menerapkan nilainya.</small>
          </span>
        </label>
      </fieldset>

      <div className={drawerStyles.reviewDecisionImpact}>
        <span>Akibat keputusan</span>
        <strong>{consequence.title}</strong>
        <p>{consequence.body}</p>
      </div>

      {decisionChoice === "changes_requested" ? (
        <fieldset className={drawerStyles.reviewFieldChoices}>
          <legend>
            Bidang yang perlu diperbaiki <b>WAJIB</b>
          </legend>
          <p>
            Pilih bidang yang harus dilengkapi sebelum kandidat dikirim ulang.
          </p>
          <div>
            {record.fields.map((item) => (
              <label key={item.id}>
                <input
                  checked={selectedFieldIds.includes(item.id)}
                  onChange={() => toggleField(item.id)}
                  type="checkbox"
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}

      <label className={drawerStyles.reviewTextField}>
        <span>
          Alasan keputusan <b>WAJIB</b>
        </span>
        <textarea
          maxLength={600}
          onChange={(event) => {
            setNote(event.currentTarget.value);
            setShowConfirmation(false);
          }}
          placeholder="Catat bukti yang diperiksa, perbedaan penting, dan alasan keputusan."
          rows={4}
          value={note}
        />
        <small>{note.length} / 600 karakter</small>
      </label>

      {showConfirmation && decisionChoice ? (
        <output className={drawerStyles.reviewConfirmation}>
          <div>
            <span>Konfirmasi keputusan</span>
            <strong>{consequence.title}</strong>
            <p>
              Keputusan, alasan, identitas reviewer, waktu, sumber, dan versi
              kandidat akan dicatat pada riwayat tinjauan.
            </p>
          </div>
          <div>
            <NexusWorkspaceButton
              onClick={() => setShowConfirmation(false)}
              type="button"
            >
              Kembali periksa
            </NexusWorkspaceButton>
            <NexusWorkspaceButton
              className={drawerStyles.reviewPrimaryAction}
              onClick={confirmDecision}
              tone="primary"
              type="button"
            >
              Konfirmasi dan simpan
            </NexusWorkspaceButton>
          </div>
        </output>
      ) : (
        <div className={drawerStyles.reviewDecisionFooter}>
          <p>
            Pilihan belum mengubah data resmi sebelum keputusan dikonfirmasi.
          </p>
          <NexusWorkspaceButton
            className={drawerStyles.reviewPrimaryAction}
            disabled={!decisionReady}
            onClick={() => setShowConfirmation(true)}
            tone="primary"
            type="button"
          >
            Periksa sebelum simpan
          </NexusWorkspaceButton>
        </div>
      )}
    </section>
  );
}
