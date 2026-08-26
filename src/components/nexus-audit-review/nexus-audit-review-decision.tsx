import { useState } from "react";
import type {
  AuditDecisionKind,
  AuditKpiResolution,
  AuditMemberPersonBinding,
  AuditOfficialMatch,
  AuditPersonMapping,
  AuditReviewField,
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
  type ManualSubmissionValues,
  manualSubmissionDefinitions,
  manualSubtype,
  validateManualSubmissionFields,
} from "@/components/nexus-manual-submission/nexus-manual-submission-model";
import { knownMemberName } from "@/components/nexus-members/nexus-member-identity";
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
import {
  memberPersonField,
  reviewPeople,
} from "@/components/nexus-review-session/nexus-member-person-binding";
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

const newOfficialPersonValue = "__new_person__";

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
  const personField = memberPersonField(record.fields);
  const personOptions = personField
    ? reviewPeople(
        personField.id,
        auditCurrentValue(record, state, personField.id),
      )
    : [];
  const [selectedMemberPersonId, setSelectedMemberPersonId] = useState(() =>
    record.memberPersonBinding &&
    personOptions.some(
      (person) =>
        person.id === record.memberPersonBinding?.personId &&
        person.name === record.memberPersonBinding.personName,
    )
      ? record.memberPersonBinding.personId
      : "",
  );
  const [selectedTargetPersonId, setSelectedTargetPersonId] = useState("");
  const [personMappingSelections, setPersonMappingSelections] = useState<
    Record<string, string>
  >({});
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
  const allRequestedCorrectionFields = record.fields.filter((item) =>
    state.fixRequest?.fieldIds.includes(item.id),
  );
  const originalSubtype = record.manualSubmission
    ? manualSubtype(
        record.manualSubmission.domain,
        record.manualSubmission.recordType,
      )
    : undefined;
  const selectedSubtype = record.manualSubmission
    ? manualSubtype(
        record.manualSubmission.domain,
        draft.record_type ?? record.manualSubmission.recordType,
      )
    : undefined;
  const subtypeChanged = Boolean(
    selectedSubtype && selectedSubtype.id !== originalSubtype?.id,
  );
  const selectedSubtypeFields = new Map(
    (selectedSubtype?.fields ?? []).map((field) => [field.key, field]),
  );
  const selectedTitleLabel = record.manualSubmission
    ? (selectedSubtype?.titleFieldLabel ??
      manualSubmissionDefinitions[record.manualSubmission.domain]
        .titleFieldLabel)
    : undefined;
  const selectedTitleVisible = Boolean(
    selectedSubtype &&
      (selectedSubtype.titleRequired !== false ||
        selectedSubtype.titleOptional),
  );
  const requestedCorrectionFields = allRequestedCorrectionFields.filter(
    (item) => {
      if (!subtypeChanged) return true;
      if (item.id === "title") {
        return selectedTitleVisible && item.label === selectedTitleLabel;
      }

      const originalField = originalSubtype?.fields.find(
        (field) => field.key === item.id,
      );
      if (!originalField) return true;
      const nextField = selectedSubtypeFields.get(item.id);
      return Boolean(
        nextField &&
          nextField.label === item.label &&
          nextField.type === item.input?.type,
      );
    },
  );
  const dynamicSubtypeFields: AuditReviewField[] = [];
  if (
    record.manualSubmission &&
    state.fixRequest?.fieldIds.includes("record_type") &&
    selectedSubtype &&
    subtypeChanged
  ) {
    const definition =
      manualSubmissionDefinitions[record.manualSubmission.domain];
    const currentFields = new Map(record.fields.map((item) => [item.id, item]));
    const existingTitle = currentFields.get("title");
    if (
      selectedTitleVisible &&
      (!existingTitle || existingTitle.label !== selectedTitleLabel)
    ) {
      dynamicSubtypeFields.push({
        id: "title",
        input: {
          required:
            selectedSubtype.titleRequired !== false &&
            !selectedSubtype.titleOptional,
          type: "text",
        },
        label: selectedTitleLabel ?? definition.titleFieldLabel,
        rawValue: "",
        value: "",
      });
    }
    for (const field of selectedSubtype.fields) {
      const existing = currentFields.get(field.key);
      const compatible =
        existing?.label === field.label && existing.input?.type === field.type;
      if (compatible) continue;
      dynamicSubtypeFields.push({
        id: field.key,
        input: {
          choices: field.choices ? [...field.choices] : undefined,
          min: field.min,
          required: field.required,
          type: field.type,
        },
        label: field.label,
        rawValue: "",
        value: "",
      });
    }
  }
  const correctionFields = [
    ...requestedCorrectionFields,
    ...dynamicSubtypeFields.filter(
      (dynamic) =>
        !requestedCorrectionFields.some((item) => item.id === dynamic.id),
    ),
  ];
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
  for (const item of correctionFields) {
    if (!item.input || isCompletionCorrection) continue;
    const value = draft[item.id]?.trim() ?? "";
    if (!value) continue;
    if (
      item.input.type === "select" &&
      !item.input.choices?.some((choice) => choice.value === value)
    ) {
      correctionErrors[item.id] = `${item.label} tidak dikenal.`;
    } else if (item.input.type === "number") {
      const number = Number(value);
      if (!Number.isFinite(number)) {
        correctionErrors[item.id] = `${item.label} harus berupa angka.`;
      } else if (
        item.input.min !== undefined &&
        number < Number(item.input.min)
      ) {
        correctionErrors[item.id] = `${item.label} minimal ${item.input.min}.`;
      }
    } else if (
      item.input.type === "date" &&
      !/^\d{4}-\d{2}-\d{2}$/.test(value)
    ) {
      correctionErrors[item.id] =
        `Gunakan tanggal yang valid untuk ${item.label.toLocaleLowerCase("id-ID")}.`;
    } else if (item.input.type === "url") {
      try {
        if (new URL(value).protocol !== "https:") {
          correctionErrors[item.id] =
            "Gunakan tautan lengkap yang diawali https://.";
        }
      } catch {
        correctionErrors[item.id] =
          "Gunakan tautan lengkap yang diawali https://.";
      }
    }
  }
  let manualCorrectionIsValid = true;
  if (record.manualSubmission && !isCompletionCorrection) {
    const manualValues = {
      ...record.manualSubmission.values,
      ...draft,
      note: draft.submitter_note ?? record.manualSubmission.values.note ?? "",
      recordType: draft.record_type ?? record.manualSubmission.recordType,
    } as ManualSubmissionValues;
    const manualErrors = validateManualSubmissionFields(
      record.manualSubmission.domain,
      manualValues,
      "all",
    );
    manualCorrectionIsValid = Object.keys(manualErrors).length === 0;
    for (const item of correctionFields) {
      if (manualErrors[item.id]) {
        correctionErrors[item.id] = manualErrors[item.id];
      }
    }
    if (
      correctionFields.some((item) => item.id === "startDate") &&
      manualErrors.endDate
    ) {
      correctionErrors.startDate =
        "Tanggal mulai tidak boleh lebih akhir dari tanggal selesai kontrak.";
    }
    const hiddenError = Object.keys(manualErrors).find(
      (fieldId) => !correctionFields.some((item) => item.id === fieldId),
    );
    if (
      hiddenError &&
      correctionFields.some((item) => item.id === "record_type")
    ) {
      correctionErrors.record_type =
        "Jenis baru memerlukan metadata yang belum lengkap. Pilih kembali jenisnya lalu lengkapi semua bidang yang ditampilkan.";
    }
  }
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
  const correctionComplete =
    manualCorrectionIsValid &&
    correctionFields.every((item) => {
      if (isCompletionCorrection && isMetadataCompletionFieldKey(item.id)) {
        const resolution = normalizedCorrectionResolutions[item.id];
        if (!resolution || correctionErrors[item.id]) return false;
        return resolution.status === "provided"
          ? resolution.value.length > 0
          : resolution.reason.length >= 8;
      }

      return (
        (item.input?.required === false || draft[item.id]?.trim().length > 0) &&
        !correctionErrors[item.id]
      );
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
  const memberPersonBindingRequired = Boolean(
    approvalChoice && record.memberId && personField,
  );
  const selectedMemberPerson = personOptions.find(
    (person) => person.id === selectedMemberPersonId,
  );
  const resolvedMemberPersonBinding: AuditMemberPersonBinding | undefined =
    memberPersonBindingRequired &&
    record.memberId &&
    personField &&
    selectedMemberPerson
      ? {
          fieldId: personField.id,
          memberId: record.memberId,
          memberName:
            record.memberPersonBinding?.memberName ??
            knownMemberName(record.memberId) ??
            record.primaryPerson,
          personId: selectedMemberPerson.id,
          personName: selectedMemberPerson.name,
          sourcePersonId: record.memberPersonBinding?.sourcePersonId,
        }
      : undefined;
  const targetPeople = (selectedMatch?.people ?? []).filter(
    (person) => person.fieldId === personField?.id,
  );
  const compatibleMemberTargets = targetPeople.filter(
    (person) => !person.memberId || person.memberId === record.memberId,
  );
  const existingBoundTarget = compatibleMemberTargets.find(
    (person) => person.memberId === record.memberId,
  );
  const selectedTargetPerson = compatibleMemberTargets.find(
    (person) => person.id === selectedTargetPersonId,
  );
  const effectiveTargetPersonId =
    selectedTargetPerson?.id ?? existingBoundTarget?.id;
  const updatePersonMappingRequired = Boolean(
    decisionChoice === "approved_update" && personField && selectedMatch,
  );
  const personMappingChoices = Object.fromEntries(
    personOptions.map((person) => {
      const automaticallyBoundTarget =
        person.id === selectedMemberPersonId
          ? existingBoundTarget?.id
          : undefined;
      return [
        person.id,
        personMappingSelections[person.id] ?? automaticallyBoundTarget ?? "",
      ];
    }),
  );
  const selectedOfficialPersonIds = Object.values(personMappingChoices).filter(
    (value) => value && value !== newOfficialPersonValue,
  );
  const personMappingsUnique =
    new Set(selectedOfficialPersonIds).size ===
    selectedOfficialPersonIds.length;
  const personMappingsReady =
    !updatePersonMappingRequired ||
    (personOptions.length > 0 &&
      personOptions.every((person) =>
        Boolean(personMappingChoices[person.id]),
      ) &&
      personMappingsUnique);
  const resolvedPersonMappings: AuditPersonMapping[] =
    updatePersonMappingRequired && personField
      ? personOptions.map((person) => {
          const targetPersonId = personMappingChoices[person.id];
          return {
            candidatePersonId: person.id,
            fieldId: personField.id,
            resolution:
              targetPersonId === newOfficialPersonValue ? "new" : "existing",
            targetPersonId:
              targetPersonId === newOfficialPersonValue
                ? undefined
                : targetPersonId,
          };
        })
      : [];
  const memberPersonBindingReady =
    !memberPersonBindingRequired || Boolean(resolvedMemberPersonBinding);
  const targetPersonBindingReady =
    decisionChoice !== "merged" ||
    !memberPersonBindingRequired ||
    Boolean(effectiveTargetPersonId);
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
      memberPersonBindingReady &&
      targetPersonBindingReady &&
      personMappingsReady &&
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
      approvalChoice ? resolvedMemberPersonBinding : undefined,
      decisionChoice === "merged" ? effectiveTargetPersonId : undefined,
      decisionChoice === "approved_update" ? resolvedPersonMappings : undefined,
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
          meta={`${correctionFields.length} bidang perbaikan`}
          title="Lengkapi perbaikan kandidat"
        />
        <NexusWorkspaceNotice tone="danger">
          {state.fixRequest.reason}
        </NexusWorkspaceNotice>
        <div className={drawerStyles.reviewCorrectionFields}>
          {correctionFields.map((item) => {
            const fieldId = `correction-${record.id}-${item.id}`;
            const metadataConfig = isMetadataCompletionFieldKey(item.id)
              ? metadataCompletionFieldConfigs[item.id]
              : undefined;
            const inputConfig = item.input;
            const error = correctionErrors[item.id];
            const updateDraft = (value: string) =>
              setDraft((current) => {
                if (item.id !== "record_type" || !record.manualSubmission) {
                  return { ...current, [item.id]: value };
                }
                const definition =
                  manualSubmissionDefinitions[record.manualSubmission.domain];
                const previous = manualSubtype(
                  record.manualSubmission.domain,
                  current.record_type ?? record.manualSubmission.recordType,
                );
                const nextSubtype = manualSubtype(
                  record.manualSubmission.domain,
                  value,
                );
                const next: Record<string, string> = {
                  ...current,
                  record_type: value,
                };
                const nextFields = new Map(
                  (nextSubtype?.fields ?? []).map((field) => [
                    field.key,
                    field,
                  ]),
                );
                for (const previousField of previous?.fields ?? []) {
                  const nextField = nextFields.get(previousField.key);
                  if (
                    !nextField ||
                    nextField.label !== previousField.label ||
                    nextField.type !== previousField.type
                  ) {
                    next[previousField.key] = "";
                  }
                }
                const previousTitleLabel =
                  previous?.titleFieldLabel ?? definition.titleFieldLabel;
                const nextTitleLabel =
                  nextSubtype?.titleFieldLabel ?? definition.titleFieldLabel;
                const nextTitleVisible = Boolean(
                  nextSubtype &&
                    (nextSubtype.titleRequired !== false ||
                      nextSubtype.titleOptional),
                );
                if (
                  !nextTitleVisible ||
                  previousTitleLabel !== nextTitleLabel
                ) {
                  next.title = "";
                }
                return next;
              });

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
                    metadataConfig?.type === "choice" ? (
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
                        <option value="">{metadataConfig.placeholder}</option>
                        {metadataConfig.choices?.map((choice) => (
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
                        inputMode={metadataConfig?.inputMode}
                        maxLength={metadataConfig?.maxLength}
                        onChange={(event) =>
                          updateResolution({ value: event.currentTarget.value })
                        }
                        type={metadataConfig?.type === "url" ? "url" : "text"}
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
                {inputConfig?.type === "select" ? (
                  <select
                    aria-describedby={error ? `${fieldId}-error` : undefined}
                    aria-invalid={error ? true : undefined}
                    id={fieldId}
                    onChange={(event) => updateDraft(event.currentTarget.value)}
                    value={draft[item.id] ?? ""}
                  >
                    <option value="">
                      Pilih {item.label.toLocaleLowerCase("id-ID")}
                    </option>
                    {inputConfig.choices?.map((choice) => (
                      <option key={choice.value} value={choice.value}>
                        {choice.label}
                      </option>
                    ))}
                  </select>
                ) : inputConfig?.type === "textarea" ? (
                  <textarea
                    aria-describedby={error ? `${fieldId}-error` : undefined}
                    aria-invalid={error ? true : undefined}
                    id={fieldId}
                    onChange={(event) => updateDraft(event.currentTarget.value)}
                    rows={3}
                    value={draft[item.id] ?? ""}
                  />
                ) : (
                  <input
                    aria-describedby={error ? `${fieldId}-error` : undefined}
                    aria-invalid={error ? true : undefined}
                    id={fieldId}
                    min={inputConfig?.min}
                    onChange={(event) => updateDraft(event.currentTarget.value)}
                    type={
                      inputConfig?.type === "date" ||
                      inputConfig?.type === "number" ||
                      inputConfig?.type === "url"
                        ? inputConfig.type
                        : "text"
                    }
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

      {memberPersonBindingRequired ? (
        <div className={drawerStyles.reviewTextField}>
          <span>Orang yang mewakili anggota · wajib</span>
          <select
            aria-label="Orang pada kandidat yang mewakili anggota"
            onChange={(event) => {
              setSelectedMemberPersonId(event.currentTarget.value);
              setSelectedTargetPersonId("");
              setShowConfirmation(false);
            }}
            value={selectedMemberPersonId}
          >
            <option value="">Pilih orang pada kandidat</option>
            {personOptions.map((person) => (
              <option key={person.id} value={person.id}>
                {person.name}
              </option>
            ))}
          </select>
          <small>
            Pilihan ini menautkan ID anggota ke orang yang tepat. Sistem tidak
            menebak hubungan hanya dari kemiripan nama atau urutan penulis.
          </small>
        </div>
      ) : null}

      {updatePersonMappingRequired && personField ? (
        <div className={drawerStyles.reviewTextField}>
          <span>Pemetaan orang ke rekam resmi · wajib</span>
          <small>
            Tentukan apakah setiap orang pada kandidat adalah orang yang sudah
            ada atau orang baru. Pemetaan ini menjaga ID dan hubungan anggota
            pada coauthor lain ketika rekam diperbarui.
          </small>
          {personOptions.map((candidatePerson) => {
            const isMemberPerson =
              candidatePerson.id === selectedMemberPersonId;
            const availableTargets = targetPeople.filter(
              (targetPerson) =>
                !isMemberPerson ||
                !targetPerson.memberId ||
                targetPerson.memberId === record.memberId,
            );
            return (
              <label key={candidatePerson.id}>
                <span>{candidatePerson.name}</span>
                <select
                  aria-label={`Pemetaan ${candidatePerson.name} ke rekam resmi`}
                  onChange={(event) => {
                    setPersonMappingSelections((current) => ({
                      ...current,
                      [candidatePerson.id]: event.currentTarget.value,
                    }));
                    setShowConfirmation(false);
                  }}
                  value={personMappingChoices[candidatePerson.id] ?? ""}
                >
                  <option value="">Pilih identitas tujuan</option>
                  <option value={newOfficialPersonValue}>
                    Orang baru / tidak sama
                  </option>
                  {availableTargets.map((targetPerson) => (
                    <option key={targetPerson.id} value={targetPerson.id}>
                      {targetPerson.name}
                      {targetPerson.memberId ? " · terhubung anggota" : ""}
                    </option>
                  ))}
                </select>
              </label>
            );
          })}
          {!personMappingsUnique ? (
            <small role="alert">
              Satu orang resmi tidak boleh dipetakan ke lebih dari satu orang
              pada kandidat.
            </small>
          ) : null}
        </div>
      ) : null}

      {decisionChoice === "merged" && memberPersonBindingRequired ? (
        compatibleMemberTargets.length > 0 ? (
          <div className={drawerStyles.reviewTextField}>
            <span>Orang tujuan pada rekam resmi · wajib</span>
            <select
              aria-label="Orang tujuan pada rekam resmi"
              disabled={Boolean(existingBoundTarget)}
              onChange={(event) => {
                setSelectedTargetPersonId(event.currentTarget.value);
                setShowConfirmation(false);
              }}
              value={effectiveTargetPersonId ?? ""}
            >
              <option value="">Pilih orang pada rekam resmi</option>
              {compatibleMemberTargets.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.name}
                  {person.memberId === record.memberId
                    ? " · sudah terhubung"
                    : ""}
                </option>
              ))}
            </select>
            <small>
              Hubungan anggota akan diterapkan ke ID orang yang dipilih pada
              rekam tujuan, bukan melalui pencocokan teks nama.
            </small>
          </div>
        ) : (
          <NexusWorkspaceNotice tone="danger">
            Rekam resmi ini belum menyediakan daftar orang terstruktur yang
            dapat dipilih. Kandidat tidak dapat dihubungkan dengan aman; pilih
            data baru atau perbarui kontrak rekam tujuan terlebih dahulu.
          </NexusWorkspaceNotice>
        )
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
