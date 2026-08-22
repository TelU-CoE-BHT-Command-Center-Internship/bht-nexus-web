import { useState } from "react";
import type {
  AuditDecisionKind,
  AuditKpiResolution,
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
  areMetadataCompletionResolutionsEqual,
  createEmptyMetadataCompletionResolution,
  isMetadataCompletionFieldKey,
  type MetadataCompletionResolutions,
  metadataCompletionFieldConfigs,
  metadataCompletionResolutionChoices,
  metadataCompletionResolutionLabels,
  metadataCompletionResolutionSetErrors,
  metadataCompletionValueError,
  normalizeMetadataCompletionResolution,
} from "@/components/nexus-metadata-completion/nexus-metadata-completion-model";
import { auditMatchingIsCurrent } from "@/components/nexus-review-session/nexus-review-session";
import {
  NexusWorkspaceButton,
  NexusWorkspaceNotice,
} from "@/components/nexus-workspace-ui/nexus-workspace-elements";
import { formatAuditTimestamp } from "@/components/nexus-workspace-ui/nexus-workspace-format";
import {
  kmIndicator,
  type NexusKmIndicatorId,
  nexusKmIndicators,
} from "@/content/nexus-km-indicators";

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
  const exactIdentifier = state.matches.some(
    (match) => match.verdict === "same_identifier",
  );
  const matchingIsStale = !auditMatchingIsCurrent(state);
  const [decisionChoice, setDecisionChoice] =
    useState<AuditDecisionKind | null>(null);
  const [note, setNote] = useState("");
  const [selectedFieldIds, setSelectedFieldIds] = useState<string[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [evidenceNote, setEvidenceNote] = useState("");
  const [kpiResolutionStatus, setKpiResolutionStatus] = useState<
    AuditKpiResolution["status"] | ""
  >("");
  const [selectedKpiIds, setSelectedKpiIds] = useState<NexusKmIndicatorId[]>(
    [],
  );
  const [draft, setDraft] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      record.fields.map((item) => [
        item.id,
        auditCurrentValue(record, state, item.id),
      ]),
    ),
  );
  const [resolutionDraft, setResolutionDraft] =
    useState<MetadataCompletionResolutions>(() => ({
      ...record.completionResolutions,
      ...state.correction?.resolutions,
    }));
  const correctionFields = record.fields.filter((item) =>
    state.fixRequest?.fieldIds.includes(item.id),
  );
  const isCompletionCorrection = record.candidateKind === "metadata_completion";
  const normalizedCorrectionResolutions = Object.fromEntries(
    correctionFields.flatMap((item) =>
      isMetadataCompletionFieldKey(item.id)
        ? [
            [
              item.id,
              normalizeMetadataCompletionResolution(
                item.id,
                resolutionDraft[item.id],
              ),
            ],
          ]
        : [],
    ),
  ) as MetadataCompletionResolutions;
  const effectiveCorrectionResolutions: MetadataCompletionResolutions = {
    ...record.completionResolutions,
    ...state.correction?.resolutions,
    ...normalizedCorrectionResolutions,
  };
  const correctionChanged = correctionFields.some((item) => {
    if (isCompletionCorrection && isMetadataCompletionFieldKey(item.id)) {
      const previousResolution = normalizeMetadataCompletionResolution(
        item.id,
        state.correction?.resolutions?.[item.id] ??
          record.completionResolutions?.[item.id],
      );
      const nextResolution = normalizeMetadataCompletionResolution(
        item.id,
        resolutionDraft[item.id],
      );
      return !areMetadataCompletionResolutionsEqual(
        previousResolution,
        nextResolution,
      );
    }

    return draft[item.id]?.trim() !== auditCurrentValue(record, state, item.id);
  });
  const correctionErrors = Object.fromEntries(
    correctionFields.flatMap((item) => {
      if (!isMetadataCompletionFieldKey(item.id)) {
        return [];
      }

      const resolution = isCompletionCorrection
        ? normalizedCorrectionResolutions[item.id]
        : undefined;
      const value = resolution?.value ?? draft[item.id]?.trim() ?? "";
      if (resolution && resolution.status !== "provided") return [];
      if (value.length === 0) return [];

      const error = metadataCompletionValueError(item.id, value);
      return error ? [[item.id, error] as const] : [];
    }),
  ) as Record<string, string>;
  if (isCompletionCorrection) {
    const relationalErrors = metadataCompletionResolutionSetErrors(
      effectiveCorrectionResolutions,
    );
    const correctsContractEnd = correctionFields.some(
      (item) => item.id === "contractEnd",
    );
    const correctsContractStart = correctionFields.some(
      (item) => item.id === "contractStart",
    );

    if (relationalErrors.contractEnd && correctsContractEnd) {
      correctionErrors.contractEnd = relationalErrors.contractEnd;
    } else if (relationalErrors.contractEnd && correctsContractStart) {
      correctionErrors.contractStart =
        "Tanggal mulai tidak boleh lebih akhir dari tanggal selesai kontrak.";
    }
  }
  const correctionComplete = correctionFields.every((item) => {
    if (isCompletionCorrection && isMetadataCompletionFieldKey(item.id)) {
      const resolution = normalizedCorrectionResolutions[item.id];
      if (!resolution || correctionErrors[item.id]) return false;
      return resolution.status === "provided"
        ? resolution.value.length > 0
        : resolution.reason.length >= 8;
    }

    return draft[item.id]?.trim().length > 0 && !correctionErrors[item.id];
  });
  const consequence = auditDecisionConsequence(decisionChoice, selectedMatch);
  const correctionSelectionReady =
    decisionChoice !== "changes_requested" || selectedFieldIds.length > 0;
  const targetSelectionReady =
    !decisionChoice ||
    !["approved_completion", "approved_update", "merged"].includes(
      decisionChoice,
    ) ||
    Boolean(selectedMatch);
  const selectedActionAllowed =
    decisionChoice === "changes_requested"
      ? capabilities.canRequestChanges
      : decisionChoice === "rejected"
        ? capabilities.canReject
        : capabilities.canApprove;
  const resolvesKpi = record.candidateKind !== "metadata_completion";
  const approvalChoice = Boolean(
    decisionChoice &&
      ["approved_new", "approved_update", "merged"].includes(decisionChoice),
  );
  const kpiResolutionReady =
    !resolvesKpi ||
    !approvalChoice ||
    kpiResolutionStatus === "removed" ||
    kpiResolutionStatus === "undetermined" ||
    (kpiResolutionStatus === "confirmed" && record.kpiLinks.length > 0) ||
    (kpiResolutionStatus === "changed" && selectedKpiIds.length > 0);
  const kpiResolution: AuditKpiResolution | undefined = resolvesKpi
    ? {
        indicatorIds:
          kpiResolutionStatus === "confirmed"
            ? record.kpiLinks.map((link) => link.indicator.id)
            : kpiResolutionStatus === "changed"
              ? selectedKpiIds
              : [],
        status: kpiResolutionStatus || "undetermined",
      }
    : undefined;
  const decisionReady = Boolean(
    decisionChoice &&
      selectedActionAllowed &&
      note.trim().length > 0 &&
      correctionSelectionReady &&
      targetSelectionReady &&
      kpiResolutionReady &&
      !(
        matchingIsStale &&
        ["approved_new", "approved_update", "merged"].includes(decisionChoice)
      ),
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
      [
        "approved_completion",
        "approved_update",
        "changes_requested",
        "merged",
      ].includes(decisionChoice)
        ? selectedMatch?.id
        : undefined,
      approvalChoice ? kpiResolution : undefined,
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

            if (
              isCompletionCorrection &&
              isMetadataCompletionFieldKey(item.id)
            ) {
              const key = item.id;
              const resolution =
                resolutionDraft[key] ??
                createEmptyMetadataCompletionResolution();
              const updateResolution = (update: Partial<typeof resolution>) =>
                setResolutionDraft((current) => ({
                  ...current,
                  [key]: { ...resolution, ...update },
                }));

              return (
                <div className={drawerStyles.reviewTextField} key={item.id}>
                  <span>{item.label}</span>
                  <select
                    aria-label={`Penyelesaian ${item.label}`}
                    onChange={(event) =>
                      updateResolution({
                        reason: "",
                        status: event.currentTarget
                          .value as typeof resolution.status,
                        value: "",
                      })
                    }
                    value={resolution.status}
                  >
                    {metadataCompletionResolutionChoices(key).map((option) => (
                      <option key={option.status} value={option.status}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {resolution.status === "provided" ? (
                    config?.type === "choice" ? (
                      <select
                        aria-describedby={
                          error ? `${fieldId}-error` : undefined
                        }
                        aria-invalid={error ? true : undefined}
                        id={fieldId}
                        onChange={(event) =>
                          updateResolution({ value: event.currentTarget.value })
                        }
                        value={resolution.value}
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
                        aria-describedby={
                          error ? `${fieldId}-error` : undefined
                        }
                        aria-invalid={error ? true : undefined}
                        id={fieldId}
                        inputMode={config?.inputMode}
                        maxLength={config?.maxLength}
                        onChange={(event) =>
                          updateResolution({ value: event.currentTarget.value })
                        }
                        type={config?.type === "url" ? "url" : "text"}
                        value={resolution.value}
                      />
                    )
                  ) : (
                    <textarea
                      aria-describedby={error ? `${fieldId}-error` : undefined}
                      aria-invalid={error ? true : undefined}
                      id={fieldId}
                      maxLength={320}
                      onChange={(event) =>
                        updateResolution({ reason: event.currentTarget.value })
                      }
                      placeholder={`Alasan ${metadataCompletionResolutionLabels[resolution.status].toLocaleLowerCase("id-ID")}`}
                      rows={3}
                      value={resolution.reason}
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
                </div>
              );
            }

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
            onClick={() => {
              if (isCompletionCorrection) {
                const values = Object.fromEntries(
                  correctionFields.map((item) => {
                    if (!isMetadataCompletionFieldKey(item.id)) {
                      return [item.id, draft[item.id] ?? ""];
                    }
                    const resolution = normalizedCorrectionResolutions[item.id];
                    if (!resolution) return [item.id, ""];
                    return [
                      item.id,
                      resolution.status === "provided"
                        ? resolution.value
                        : `${metadataCompletionResolutionLabels[resolution.status]} · ${resolution.reason}`,
                    ];
                  }),
                );
                onResubmit(
                  values,
                  evidenceNote.trim(),
                  effectiveCorrectionResolutions,
                );
                return;
              }
              onResubmit(draft, evidenceNote.trim());
            }}
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
        {record.candidateKind === "metadata_completion" &&
        state.decision.kind === "approved_completion" ? (
          <NexusWorkspaceNotice>
            Pelengkapan yang disetujui sudah tercermin pada Data Resmi dan
            tercatat bersama jejak tinjauannya.
          </NexusWorkspaceNotice>
        ) : state.decision.kind !== "rejected" ? (
          <NexusWorkspaceNotice>
            Keputusan sudah diterapkan pada Data Resmi bersama sumber, reviewer,
            waktu, dan jejak auditnya.
          </NexusWorkspaceNotice>
        ) : null}
        <dl className={drawerStyles.reviewFinalMeta}>
          <div>
            <dt>Reviewer</dt>
            <dd>{state.decision.actor}</dd>
          </div>
          <div>
            <dt>Waktu keputusan</dt>
            <dd>{formatAuditTimestamp(state.decision.occurredAt)}</dd>
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

  if (!capabilities.canReview) {
    return (
      <section
        aria-labelledby="audit-review-access-title"
        className={drawerStyles.reviewDecisionSection}
      >
        <AuditReviewSectionHeading
          id="audit-review-access-title"
          index={decisionIndex}
          meta="Menunggu pemeriksa lain"
          title="Kandidat tidak dapat Anda putuskan"
        />
        <NexusWorkspaceNotice>
          {capabilities.reviewBlockReason === "unknown_submitter"
            ? "Identitas pengirim belum tersedia, sehingga keputusan ditutup untuk mencegah persetujuan yang tidak sah. Lengkapi identitas pengirim sebelum meninjau kandidat."
            : capabilities.reviewBlockReason === "self_submitted"
              ? "Pengirim versi terbaru tidak dapat menyetujui kandidatnya sendiri. Kandidat tetap berada di antrean sampai diperiksa pengguna lain yang berwenang."
              : "Akun ini belum mempunyai kewenangan untuk menetapkan keputusan. Kandidat tetap berada di antrean sampai diperiksa pengguna yang berwenang."}
        </NexusWorkspaceNotice>
        <div className={drawerStyles.reviewDecisionActions}>
          <NexusWorkspaceButton onClick={onClose} type="button">
            Tutup rincian
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

      {matchingIsStale ? (
        <NexusWorkspaceNotice tone="danger">
          Pencocokan versi sebelumnya sudah kedaluwarsa setelah kandidat
          diperbaiki. Perbarui hasil pencocokan sebelum menerima, memperbarui,
          atau menghubungkan data.
        </NexusWorkspaceNotice>
      ) : null}

      {resolvesKpi ? (
        <div className={drawerStyles.reviewTextField}>
          <span>Keputusan keterkaitan indikator KM · wajib saat menerima</span>
          <select
            aria-label="Keputusan keterkaitan indikator KM"
            onChange={(event) => {
              const status = event.currentTarget.value as
                | AuditKpiResolution["status"]
                | "";
              setKpiResolutionStatus(status);
              setSelectedKpiIds(
                status === "changed"
                  ? record.kpiLinks.map((link) => link.indicator.id)
                  : [],
              );
              setShowConfirmation(false);
            }}
            value={kpiResolutionStatus}
          >
            <option value="">Pilih hasil verifikasi indikator</option>
            {record.kpiLinks.length > 0 ? (
              <option value="confirmed">
                Konfirmasi saran{" "}
                {record.kpiLinks.map((link) => link.indicator.id).join(", ")}
              </option>
            ) : null}
            <option value="changed">Ubah / tentukan indikator lain</option>
            <option value="removed">Tidak terkait indikator KM</option>
            <option value="undetermined">Belum dapat ditentukan</option>
          </select>
          {kpiResolutionStatus === "changed" ? (
            <div className={drawerStyles.reviewKpiSelection}>
              <select
                aria-label="Tambahkan indikator KM hasil verifikasi"
                onChange={(event) => {
                  const indicatorId = event.currentTarget
                    .value as NexusKmIndicatorId;
                  if (indicatorId && !selectedKpiIds.includes(indicatorId)) {
                    setSelectedKpiIds((current) => [...current, indicatorId]);
                  }
                  setShowConfirmation(false);
                }}
                value=""
              >
                <option value="">Tambahkan indikator KM</option>
                {nexusKmIndicators
                  .filter((indicator) => !selectedKpiIds.includes(indicator.id))
                  .map((indicator) => (
                    <option key={indicator.id} value={indicator.id}>
                      {indicator.id} · {indicator.label}
                    </option>
                  ))}
              </select>
              {selectedKpiIds.length > 0 ? (
                <ul aria-label="Indikator KM hasil verifikasi">
                  {selectedKpiIds.map((indicatorId) => {
                    const indicator = kmIndicator(indicatorId);

                    return (
                      <li key={indicatorId}>
                        <span>
                          <strong>{indicator.id}</strong>
                          {indicator.label}
                        </span>
                        <button
                          aria-label={`Hapus ${indicator.id} dari hasil verifikasi`}
                          onClick={() => {
                            setSelectedKpiIds((current) =>
                              current.filter((item) => item !== indicatorId),
                            );
                            setShowConfirmation(false);
                          }}
                          type="button"
                        >
                          Hapus
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <small>
                  Tambahkan sedikitnya satu indikator, atau pilih “Tidak
                  terkait” maupun “Belum dapat ditentukan”.
                </small>
              )}
            </div>
          ) : null}
          <small>
            Saran sistem tidak pernah menjadi keputusan otomatis. Reviewer harus
            mengonfirmasi, mengubah, menghapus, atau menandainya belum dapat
            ditentukan. Satu kandidat boleh terkait dengan lebih dari satu
            indikator KM.
          </small>
        </div>
      ) : null}

      <fieldset className={drawerStyles.reviewDecisionChoices}>
        <legend>Pilih hasil tinjauan</legend>
        {record.candidateKind === "new_record" && selectedMatch ? (
          <label
            data-disabled={
              matchingIsStale || !capabilities.canApprove || undefined
            }
            data-selected={decisionChoice === "merged" || undefined}
          >
            <input
              checked={decisionChoice === "merged"}
              disabled={matchingIsStale || !capabilities.canApprove}
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
            data-disabled={
              exactIdentifier ||
              matchingIsStale ||
              !capabilities.canApprove ||
              undefined
            }
            data-selected={decisionChoice === "approved_new" || undefined}
          >
            <input
              checked={decisionChoice === "approved_new"}
              disabled={
                exactIdentifier || matchingIsStale || !capabilities.canApprove
              }
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
                  : matchingIsStale
                    ? "Tunggu pencocokan versi terbaru selesai."
                    : "Tetapkan kandidat sebagai rekam resmi baru."}
              </small>
            </span>
          </label>
        ) : null}
        {record.candidateKind === "record_update" ? (
          <label
            data-disabled={
              !selectedMatch ||
              matchingIsStale ||
              !capabilities.canApprove ||
              undefined
            }
            data-selected={decisionChoice === "approved_update" || undefined}
          >
            <input
              checked={decisionChoice === "approved_update"}
              disabled={
                !selectedMatch || matchingIsStale || !capabilities.canApprove
              }
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
            data-disabled={
              !selectedMatch || !capabilities.canApprove || undefined
            }
            data-selected={
              decisionChoice === "approved_completion" || undefined
            }
          >
            <input
              checked={decisionChoice === "approved_completion"}
              disabled={!selectedMatch || !capabilities.canApprove}
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
          data-disabled={!capabilities.canRequestChanges || undefined}
          data-selected={decisionChoice === "changes_requested" || undefined}
        >
          <input
            checked={decisionChoice === "changes_requested"}
            disabled={!capabilities.canRequestChanges}
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
        <label
          data-disabled={!capabilities.canReject || undefined}
          data-selected={decisionChoice === "rejected" || undefined}
        >
          <input
            checked={decisionChoice === "rejected"}
            disabled={!capabilities.canReject}
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
