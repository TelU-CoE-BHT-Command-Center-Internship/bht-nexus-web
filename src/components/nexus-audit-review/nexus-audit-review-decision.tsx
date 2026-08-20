import { useState } from "react";
import type {
  AuditDecisionKind,
  AuditOfficialMatch,
} from "@/components/nexus-audit-review/nexus-audit-review-content";
import { AuditReviewSectionHeading } from "@/components/nexus-audit-review/nexus-audit-review-detail";
import drawerStyles from "@/components/nexus-audit-review/nexus-audit-review-drawer.module.css";
import {
  type AuditReviewDrawerProps,
  auditCurrentValue,
  auditDecisionConsequence,
  type ReviewSectionIndexes,
} from "@/components/nexus-audit-review/nexus-audit-review-drawer-model";
import {
  isMetadataCompletionFieldKey,
  metadataCompletionFieldConfigs,
  metadataCompletionValueError,
} from "@/components/nexus-metadata-completion/nexus-metadata-completion-model";
import {
  NexusWorkspaceButton,
  NexusWorkspaceNotice,
} from "@/components/nexus-workspace-ui/nexus-workspace-elements";

type AuditReviewDecisionSectionProps = AuditReviewDrawerProps & {
  decisionIndex: ReviewSectionIndexes["decision"];
  selectedMatch?: AuditOfficialMatch;
};

export function AuditReviewDecisionSection({
  capabilities,
  decisionIndex,
  onClose,
  onDecide,
  onResubmit,
  record,
  selectedMatch,
  state,
}: AuditReviewDecisionSectionProps) {
  const exactIdentifier = record.matches.some(
    (match) => match.verdict === "same_identifier",
  );
  const [decisionChoice, setDecisionChoice] =
    useState<AuditDecisionKind | null>(null);
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
  const correctionErrors = Object.fromEntries(
    correctionFields.flatMap((item) => {
      const value = draft[item.id]?.trim() ?? "";
      if (!isMetadataCompletionFieldKey(item.id) || value.length === 0) {
        return [];
      }

      const error = metadataCompletionValueError(item.id, value);
      return error ? [[item.id, error] as const] : [];
    }),
  ) as Record<string, string>;
  const correctionComplete = correctionFields.every(
    (item) => draft[item.id]?.trim().length > 0 && !correctionErrors[item.id],
  );
  const consequence = auditDecisionConsequence(decisionChoice, selectedMatch);
  const correctionSelectionReady =
    decisionChoice !== "changes_requested" || selectedFieldIds.length > 0;
  const targetSelectionReady =
    !decisionChoice ||
    !["approved_completion", "approved_update", "merged"].includes(
      decisionChoice,
    ) ||
    Boolean(selectedMatch);
  const decisionReady = Boolean(
    decisionChoice &&
      note.trim().length > 0 &&
      correctionSelectionReady &&
      targetSelectionReady,
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
      ["approved_completion", "approved_update", "merged"].includes(
        decisionChoice,
      )
        ? selectedMatch?.id
        : undefined,
    );
  };

  if (state.status === "needs_fix" && state.fixRequest) {
    if (!capabilities.canSubmitCorrection) {
      return (
        <section
          aria-labelledby="audit-correction-title"
          className={drawerStyles.reviewDecisionSection}
        >
          <AuditReviewSectionHeading
            id="audit-correction-title"
            index={decisionIndex}
            meta="Menunggu pihak berwenang"
            title="Perbaikan telah diminta"
          />
          <NexusWorkspaceNotice tone="danger">
            {state.fixRequest.reason}
          </NexusWorkspaceNotice>
          <div className={drawerStyles.reviewCorrectionRequest}>
            <dl>
              <div>
                <dt>Status</dt>
                <dd>Menunggu perbaikan</dd>
              </div>
              <div>
                <dt>Penerima</dt>
                <dd>
                  {state.fixRequest.assigneeLabel ??
                    "Akan ditentukan berdasarkan hak akses sistem"}
                </dd>
              </div>
            </dl>
            <div>
              <strong>Bidang yang diminta</strong>
              <ul>
                {correctionFields.map((item) => (
                  <li key={item.id}>{item.label}</li>
                ))}
              </ul>
            </div>
            <p>
              Pemeriksa dapat melihat status dan riwayat permintaan, tetapi
              tidak mengubah kandidat atas nama pihak lain.
            </p>
          </div>
          <div className={drawerStyles.reviewDecisionActions}>
            <NexusWorkspaceButton onClick={onClose} type="button">
              Tutup status perbaikan
            </NexusWorkspaceButton>
          </div>
        </section>
      );
    }

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
          {correctionFields.map((item) => {
            const fieldId = `correction-${record.id}-${item.id}`;
            const config = isMetadataCompletionFieldKey(item.id)
              ? metadataCompletionFieldConfigs[item.id]
              : undefined;
            const error = correctionErrors[item.id];
            const updateDraft = (value: string) =>
              setDraft((current) => ({ ...current, [item.id]: value }));

            return (
              <label
                className={drawerStyles.reviewTextField}
                htmlFor={fieldId}
                key={item.id}
              >
                <span>{item.label}</span>
                {config?.type === "choice" ? (
                  <select
                    aria-describedby={error ? `${fieldId}-error` : undefined}
                    aria-invalid={error ? true : undefined}
                    id={fieldId}
                    onChange={(event) => updateDraft(event.currentTarget.value)}
                    value={draft[item.id] ?? ""}
                  >
                    <option value="">{config.placeholder}</option>
                    {config.choices?.map((choice) => (
                      <option key={choice} value={choice}>
                        {choice}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    aria-describedby={error ? `${fieldId}-error` : undefined}
                    aria-invalid={error ? true : undefined}
                    id={fieldId}
                    inputMode={config?.inputMode}
                    maxLength={config?.maxLength}
                    onChange={(event) => updateDraft(event.currentTarget.value)}
                    type={config?.type === "url" ? "url" : "text"}
                    value={draft[item.id] ?? ""}
                  />
                )}
                {error ? (
                  <small
                    className={drawerStyles.reviewFieldError}
                    id={`${fieldId}-error`}
                    role="alert"
                  >
                    {error}
                  </small>
                ) : null}
              </label>
            );
          })}
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
            Tutup tanpa mengirim
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
          {state.decision.targetRecordId ? (
            <div>
              <dt>Rekam tujuan</dt>
              <dd>{state.decision.targetRecordId}</dd>
            </div>
          ) : null}
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
        {record.candidateKind === "new_record" && selectedMatch ? (
          <label data-selected={decisionChoice === "merged" || undefined}>
            <input
              checked={decisionChoice === "merged"}
              name={`decision-${record.id}`}
              onChange={() => selectDecision("merged")}
              type="radio"
            />
            <span className={drawerStyles.reviewRadio} />
            <span>
              <strong>Hubungkan ke {selectedMatch.id}</strong>
              <small>
                Pilih jika bukti menunjukkan karya atau entitas yang sama.
              </small>
            </span>
          </label>
        ) : null}
        {record.candidateKind === "new_record" ? (
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
        ) : null}
        {record.candidateKind === "record_update" ? (
          <label
            data-disabled={!selectedMatch || undefined}
            data-selected={decisionChoice === "approved_update" || undefined}
          >
            <input
              checked={decisionChoice === "approved_update"}
              disabled={!selectedMatch}
              name={`decision-${record.id}`}
              onChange={() => selectDecision("approved_update")}
              type="radio"
            />
            <span className={drawerStyles.reviewRadio} />
            <span>
              <strong>
                Terapkan pembaruan ke {selectedMatch?.id ?? "rekam terpilih"}
              </strong>
              <small>
                Perbarui rekam tujuan dengan menyimpan nilai sebelumnya dan
                jejak sumber.
              </small>
            </span>
          </label>
        ) : null}
        {record.candidateKind === "metadata_completion" ? (
          <label
            data-disabled={!selectedMatch || undefined}
            data-selected={
              decisionChoice === "approved_completion" || undefined
            }
          >
            <input
              checked={decisionChoice === "approved_completion"}
              disabled={!selectedMatch}
              name={`decision-${record.id}`}
              onChange={() => selectDecision("approved_completion")}
              type="radio"
            />
            <span className={drawerStyles.reviewRadio} />
            <span>
              <strong>Setujui pelengkapan metadata</strong>
              <small>
                Terapkan nilai atau pengecualian pada rekam resmi tujuan.
              </small>
            </span>
          </label>
        ) : null}
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
            <strong>
              {record.candidateKind === "metadata_completion"
                ? "Tolak usulan"
                : "Tolak kandidat"}
            </strong>
            <small>Tutup pengajuan tanpa menerapkan nilainya.</small>
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
