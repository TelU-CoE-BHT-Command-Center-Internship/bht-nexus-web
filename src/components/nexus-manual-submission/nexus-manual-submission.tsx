"use client";

import Link from "next/link";
import {
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
  useMemo,
  useState,
} from "react";
import type { AuditReviewRecord } from "@/components/nexus-audit-review/nexus-audit-review-content";
import styles from "@/components/nexus-manual-submission/nexus-manual-submission.module.css";
import {
  createEmptyManualSubmissionValues,
  createManualSubmissionReviewRecord,
  type ManualFieldDefinition,
  type ManualRecordComparisonCandidate,
  type ManualSubmissionDomain,
  type ManualSubmissionValues,
  manualKmSuggestion,
  manualSubmissionDefinitions,
  manualSubtype,
  validateManualSubmissionFields,
} from "@/components/nexus-manual-submission/nexus-manual-submission-model";
import { manualSubmissionRoutes } from "@/components/nexus-manual-submission/nexus-manual-submission-routes";
import { NexusManualSubmissionSuccess } from "@/components/nexus-manual-submission/nexus-manual-submission-success";
import { useNexusReviewSession } from "@/components/nexus-review-session/nexus-review-session";
import {
  NexusWorkspaceBackLink,
  NexusWorkspaceButton,
  NexusWorkspaceNotice,
} from "@/components/nexus-workspace-ui/nexus-workspace-elements";
import { NexusWorkspaceFormField } from "@/components/nexus-workspace-ui/nexus-workspace-form-field";

type NexusManualSubmissionPageProps = {
  comparisonCandidates?: readonly ManualRecordComparisonCandidate[];
  domain: ManualSubmissionDomain;
};

const involvementFieldKeys = new Set([
  "authors",
  "authorRole",
  "beneficiaries",
  "creators",
  "externalCollaborators",
  "mentors",
  "participantCount",
  "participantRef",
  "primaryParty",
]);

function SuggestionIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path d="M9 18h6M10 21h4" />
      <path d="M8.2 14.7a7 7 0 1 1 7.6 0c-.7.5-.8 1.1-.8 1.3H9c0-.2-.1-.8-.8-1.3Z" />
    </svg>
  );
}

function ReviewIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path d="M7 4.5h7l3 3V19H7z" />
      <path d="M14 4.5V8h3M10 12h4M10 15h4" />
      <circle cx="7.5" cy="16.5" r="3.5" />
      <path d="m6.2 16.5.9.9 1.8-2" />
    </svg>
  );
}

function LinkEvidenceIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path d="M9.5 14.5 14.5 9" />
      <path d="M7.2 17.3 5.7 18.8a3.4 3.4 0 0 1-4.8-4.8l4-4a3.4 3.4 0 0 1 4.8 0" />
      <path d="m16.8 6.7 1.5-1.5A3.4 3.4 0 0 1 23.1 10l-4 4a3.4 3.4 0 0 1-4.8 0" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 20 20">
      <path d="m3 9.3 13-5-4.8 12.8-2.1-5.7zM9.1 11.4 16 4.3" />
    </svg>
  );
}

function ManualField({
  error,
  field,
  onChange,
  value,
}: {
  error?: string;
  field: ManualFieldDefinition;
  onChange: (
    event: ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => void;
  value: string;
}) {
  const controlId = `manual-${field.key}`;
  return (
    <NexusWorkspaceFormField
      error={error}
      hint={field.hint}
      id={controlId}
      label={field.label}
      min={field.min}
      name={field.key}
      onChange={onChange}
      options={field.choices}
      placeholder={field.placeholder}
      required={field.required}
      type={field.type}
      value={value}
      wide={field.wide}
    />
  );
}

function FormSection({
  children,
  number,
  title,
}: {
  children: ReactNode;
  number: number;
  title: string;
}) {
  return (
    <section className={styles.formSection}>
      <h3>
        {number}. {title}
      </h3>
      {children}
    </section>
  );
}

function ChecklistItem({
  completed,
  current,
  label,
  total,
}: {
  completed: number;
  current: boolean;
  label: string;
  total: number;
}) {
  return (
    <li>
      <span aria-hidden="true" data-complete={current || undefined}>
        {current ? "✓" : ""}
      </span>
      <p>{label}</p>
      <b>
        {completed}/{total}
      </b>
    </li>
  );
}

export function NexusManualSubmissionPage({
  comparisonCandidates = [],
  domain,
}: NexusManualSubmissionPageProps) {
  const definition = manualSubmissionDefinitions[domain];
  const route = manualSubmissionRoutes[domain];
  const reviewSession = useNexusReviewSession();
  const [values, setValues] = useState<ManualSubmissionValues>(() =>
    createEmptyManualSubmissionValues(),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submittedRecord, setSubmittedRecord] =
    useState<AuditReviewRecord | null>(null);
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null);
  const subtype = manualSubtype(domain, values.recordType);
  const displaySubtype = subtype ?? definition.subtypes[0];
  const kmSuggestion = useMemo(
    () => manualKmSuggestion(domain, values),
    [domain, values],
  );
  const informationFields = displaySubtype.fields.filter(
    (field) => !involvementFieldKeys.has(field.key),
  );
  const involvementFields = displaySubtype.fields.filter((field) =>
    involvementFieldKeys.has(field.key),
  );
  const firstPublicationInformationField =
    domain === "publication"
      ? informationFields.find(
          (field) => field.key === "venue" || field.key === "publisher",
        )
      : undefined;
  const remainingInformationFields = informationFields
    .filter((field) => field !== firstPublicationInformationField)
    .sort((left, right) => {
      if (domain !== "publication") return 0;
      if (left.key === "identifier") return -1;
      if (right.key === "identifier") return 1;
      return 0;
    });
  const identityKeys = ["title", "recordType", "year"];
  const identityCompleted = identityKeys.filter((key) =>
    values[key]?.trim(),
  ).length;
  const requiredInformationFields = informationFields.filter(
    (field) => field.required,
  );
  const requiredInvolvementFields = involvementFields.filter(
    (field) => field.required,
  );
  const informationCompleted = requiredInformationFields.filter((field) =>
    values[field.key]?.trim(),
  ).length;
  const involvementCompleted = requiredInvolvementFields.filter((field) =>
    values[field.key]?.trim(),
  ).length;
  const informationTotal =
    identityKeys.length + requiredInformationFields.length;
  const completedInformationTotal = identityCompleted + informationCompleted;
  const evidenceCompleted = values.evidenceUrl.trim() ? 1 : 0;
  const evaluationCompleted = values.recordType ? 1 : 0;
  const completedCount =
    completedInformationTotal +
    involvementCompleted +
    evidenceCompleted +
    evaluationCompleted;
  const totalCount =
    informationTotal + requiredInvolvementFields.length + 1 + 1;
  const formFieldOrder = [
    "title",
    "recordType",
    ...(firstPublicationInformationField
      ? [firstPublicationInformationField.key]
      : []),
    "year",
    ...remainingInformationFields.map((field) => field.key),
    ...involvementFields.map((field) => field.key),
    "evidenceUrl",
    "note",
  ];
  const completionPercentage = Math.round(
    (completedCount / Math.max(totalCount, 1)) * 100,
  );

  function resetJourney() {
    setValues(createEmptyManualSubmissionValues());
    setErrors({});
    setSubmittedRecord(null);
    setDraftSavedAt(null);
  }

  function changeValue(
    event: ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) {
    const { name, value } = event.currentTarget;
    setValues((current) => ({ ...current, [name]: value }));
    setDraftSavedAt(null);
    setErrors((current) => {
      if (!current[name]) return current;
      const next = { ...current };
      delete next[name];
      return next;
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateManualSubmissionFields(domain, values, "all");
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      const firstErrorKey =
        formFieldOrder.find((key) => nextErrors[key]) ??
        Object.keys(nextErrors)[0];
      requestAnimationFrame(() => {
        document.getElementById(`manual-${firstErrorKey}`)?.focus();
      });
      return;
    }

    const idPrefix =
      domain === "publication"
        ? "MAN-PUB"
        : domain === "intellectual-property"
          ? "MAN-KI"
          : domain === "contract"
            ? "MAN-KON"
            : domain === "academic"
              ? "MAN-AKD"
              : "MAN-KEG";
    const recordId = reviewSession.createSessionRecordId(idPrefix);
    const record = createManualSubmissionReviewRecord({
      actor: reviewSession.actor,
      comparisonCandidates,
      domain,
      id: recordId,
      values,
    });
    reviewSession.submitRecord(record);
    setSubmittedRecord(record);
    document.getElementById("main-content")?.focus({ preventScroll: true });
    document.scrollingElement?.scrollTo({ behavior: "smooth", top: 0 });
  }

  if (submittedRecord) {
    return (
      <NexusManualSubmissionSuccess
        kmSuggestion={kmSuggestion}
        noun={definition.noun}
        officialHref={route.officialHref}
        officialLabel={route.officialLabel}
        onReset={resetJourney}
        record={submittedRecord}
        subtypeLabel={subtype?.label ?? submittedRecord.typeLabel}
        titleLabel={definition.titleFieldLabel}
      />
    );
  }

  return (
    <section
      aria-labelledby="manual-submission-page-title"
      className={styles.page}
    >
      <header className={styles.pageHeader}>
        <NexusWorkspaceBackLink
          href={route.officialHref}
          label={`Kembali ke ${route.officialLabel}`}
        />
        <h2 id="manual-submission-page-title">{definition.title}</h2>
        <p>
          <span className={styles.introLine}>
            Ajukan {definition.noun} yang belum tercatat. Data akan masuk ke
            Tinjauan terlebih dahulu.
          </span>
          <span className={styles.introLine}>
            Data baru akan menjadi Data Resmi setelah diverifikasi oleh
            reviewer.
          </span>
        </p>
      </header>

      <form className={styles.form} noValidate onSubmit={handleSubmit}>
        <div className={styles.contentGrid}>
          <div className={styles.sectionStack}>
            <FormSection number={1} title={`Informasi ${route.officialLabel}`}>
              <div className={styles.fieldGrid}>
                <ManualField
                  error={errors.title}
                  field={{
                    key: "title",
                    label: definition.titleFieldLabel,
                    placeholder: definition.titlePlaceholder,
                    required: true,
                    type: "text",
                  }}
                  onChange={changeValue}
                  value={values.title}
                />
                <ManualField
                  error={errors.recordType}
                  field={{
                    choices: definition.subtypes.map((item) => ({
                      label: item.label,
                      value: item.id,
                    })),
                    key: "recordType",
                    label: `Jenis ${definition.noun}`,
                    required: true,
                    type: "select",
                  }}
                  onChange={changeValue}
                  value={values.recordType}
                />
                {firstPublicationInformationField ? (
                  <ManualField
                    error={errors[firstPublicationInformationField.key]}
                    field={{
                      ...firstPublicationInformationField,
                      wide: false,
                    }}
                    onChange={changeValue}
                    value={values[firstPublicationInformationField.key] ?? ""}
                  />
                ) : null}
                <ManualField
                  error={errors.year}
                  field={{
                    key: "year",
                    label:
                      domain === "publication"
                        ? "Tahun terbit"
                        : "Tahun / periode evaluasi",
                    min: "2000",
                    placeholder: "Pilih atau masukkan tahun",
                    required: true,
                    type: "number",
                  }}
                  onChange={changeValue}
                  value={values.year}
                />
                {remainingInformationFields.map((field) => (
                  <ManualField
                    error={errors[field.key]}
                    field={field}
                    key={field.key}
                    onChange={changeValue}
                    value={values[field.key] ?? ""}
                  />
                ))}
              </div>
            </FormSection>

            <FormSection
              number={2}
              title={
                domain === "publication"
                  ? "Penulis & Keterlibatan BHT"
                  : "Pelaku & Keterlibatan BHT"
              }
            >
              {involvementFields.length > 0 ? (
                <div className={styles.fieldGrid}>
                  {involvementFields.map((field) => (
                    <ManualField
                      error={errors[field.key]}
                      field={field}
                      key={field.key}
                      onChange={changeValue}
                      value={values[field.key] ?? ""}
                    />
                  ))}
                </div>
              ) : (
                <p className={styles.sectionPlaceholder}>
                  Pilih jenis rekam untuk menampilkan pelaku, mitra, atau pihak
                  terkait yang perlu dicatat.
                </p>
              )}
            </FormSection>

            <FormSection number={3} title="Sumber & Bukti">
              <div className={styles.fieldGrid}>
                <ManualField
                  error={errors.evidenceUrl}
                  field={{
                    key: "evidenceUrl",
                    label: "URL sumber / bukti utama",
                    placeholder:
                      "https://drive.google.com/... atau https://doi.org/...",
                    required: true,
                    type: "text",
                  }}
                  onChange={changeValue}
                  value={values.evidenceUrl}
                />
                <div className={styles.evidenceGuide}>
                  <span>Akses bukti</span>
                  <div>
                    <span className={styles.evidenceGuideIcon}>
                      <LinkEvidenceIcon />
                    </span>
                    <p>
                      <strong>Tautan dapat dibuka reviewer</strong>
                      <small>Drive, DOI, repositori, atau laman resmi</small>
                    </p>
                  </div>
                </div>
                <ManualField
                  error={errors.note}
                  field={{
                    key: "note",
                    label: "Catatan pendukung (opsional)",
                    placeholder:
                      "Informasi tambahan yang membantu proses verifikasi",
                    required: false,
                    type: "textarea",
                    wide: true,
                  }}
                  onChange={changeValue}
                  value={values.note}
                />
              </div>
            </FormSection>

            <FormSection number={4} title="Keterkaitan Evaluasi">
              <div
                aria-live="polite"
                className={styles.suggestion}
                data-available={Boolean(kmSuggestion)}
              >
                <span className={styles.suggestionIcon}>
                  <SuggestionIcon />
                </span>
                <div>
                  {kmSuggestion ? (
                    <>
                      <span>
                        Saran indikator: {kmSuggestion.indicator.id} —{" "}
                        {kmSuggestion.indicator.label}
                      </span>
                      <b>Akan diverifikasi pada Tinjauan</b>
                      <p>{kmSuggestion.reason}</p>
                    </>
                  ) : (
                    <>
                      <span>Belum ada saran indikator KM</span>
                      <b>Tetap dapat dikirim ke Tinjauan</b>
                      <p>
                        Metadata saat ini belum cukup untuk saran yang aman.
                        Reviewer dapat menentukan keterkaitan setelah memeriksa
                        bukti.
                      </p>
                    </>
                  )}
                </div>
              </div>
            </FormSection>
          </div>

          <aside className={styles.summaryRail}>
            <section className={styles.summaryCard}>
              <h3>Ringkasan Pengajuan</h3>
              <div className={styles.draftStatus}>
                <span>Draft</span>
                <p>{draftSavedAt ?? "Belum dikirim ke Tinjauan"}</p>
              </div>
              <div className={styles.progressHeader}>
                <span>Kelengkapan data</span>
                <strong>{completionPercentage}%</strong>
              </div>
              <div
                aria-label={`Kelengkapan data ${completionPercentage}%`}
                aria-valuemax={100}
                aria-valuemin={0}
                aria-valuenow={completionPercentage}
                className={styles.progressTrack}
                role="progressbar"
              >
                <span style={{ width: `${completionPercentage}%` }} />
              </div>
              <div className={styles.summaryDivider} />
              <h4>Checklist kelengkapan</h4>
              <ul className={styles.checklist}>
                <ChecklistItem
                  completed={completedInformationTotal}
                  current={completedInformationTotal === informationTotal}
                  label={`Informasi ${definition.noun}`}
                  total={informationTotal}
                />
                <ChecklistItem
                  completed={involvementCompleted}
                  current={
                    requiredInvolvementFields.length > 0 &&
                    involvementCompleted === requiredInvolvementFields.length
                  }
                  label={
                    domain === "publication"
                      ? "Penulis & keterlibatan BHT"
                      : "Pelaku & keterlibatan BHT"
                  }
                  total={requiredInvolvementFields.length}
                />
                <ChecklistItem
                  completed={evidenceCompleted}
                  current={evidenceCompleted === 1}
                  label="Sumber & bukti"
                  total={1}
                />
                <ChecklistItem
                  completed={evaluationCompleted}
                  current={evaluationCompleted === 1}
                  label="Keterkaitan evaluasi"
                  total={1}
                />
              </ul>
            </section>

            <section className={styles.reviewInfoCard}>
              <span className={styles.reviewInfoIcon}>
                <ReviewIcon />
              </span>
              <div>
                <h3>Masuk ke Tinjauan setelah dikirim</h3>
                <p>
                  Setelah Anda klik <strong>Kirim ke Tinjauan</strong>, data
                  diteruskan ke reviewer untuk diverifikasi dan berstatus
                  <b> Menunggu Tinjauan</b>.
                </p>
              </div>
            </section>
          </aside>
        </div>

        <footer className={styles.actionBar}>
          <div className={styles.actionNotice}>
            <NexusWorkspaceNotice>
              Jika metadata belum lengkap, pengajuan tetap dapat dikirim selama
              bidang wajib dan bukti utama tersedia. Keterkaitan KM dapat
              ditentukan setelah verifikasi.
            </NexusWorkspaceNotice>
          </div>
          <div className={styles.actionButtons}>
            <Link
              className={styles.cancelButton}
              href={route.officialHref}
              prefetch={false}
            >
              Batal
            </Link>
            <NexusWorkspaceButton
              onClick={() =>
                setDraftSavedAt(
                  `Tersimpan untuk sesi ini · ${new Intl.DateTimeFormat(
                    "id-ID",
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    },
                  ).format(new Date())}`,
                )
              }
              type="button"
            >
              Simpan draft
            </NexusWorkspaceButton>
            <NexusWorkspaceButton tone="primary" type="submit">
              <span className={styles.sendIcon}>
                <SendIcon />
              </span>
              Kirim ke Tinjauan
            </NexusWorkspaceButton>
          </div>
        </footer>
      </form>
    </section>
  );
}
