"use client";

import type { JSONContent } from "@tiptap/react";
import {
  useCallback,
  useDeferredValue,
  useEffect,
  useId,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import styles from "@/components/nexus-broadcast/nexus-broadcast.module.css";
import {
  broadcastDocumentIsEmpty,
  broadcastEditorContent,
  broadcastWordCount,
  normalizeBroadcastDocument,
  summarizeBroadcastDocument,
} from "@/components/nexus-broadcast/nexus-broadcast-content";
import { NexusBroadcastDialog } from "@/components/nexus-broadcast/nexus-broadcast-dialog";
import {
  type BroadcastEditorHandle,
  NexusBroadcastEditor,
} from "@/components/nexus-broadcast/nexus-broadcast-editor";
import { NexusBroadcastEmailPreview } from "@/components/nexus-broadcast/nexus-broadcast-email";
import { NexusBroadcastIcon } from "@/components/nexus-broadcast/nexus-broadcast-icons";
import {
  BROADCAST_SUBJECT_MAX_LENGTH,
  type BroadcastCheckId,
  type BroadcastDraft,
  type BroadcastLocalImage,
  broadcastContentOverview,
  broadcastDraftIsDirty,
  createEmptyBroadcastDraft,
  evaluateBroadcastReadiness,
  revokeBroadcastImages,
} from "@/components/nexus-broadcast/nexus-broadcast-model";
import {
  NexusBroadcastChecklistPanel,
  NexusBroadcastRecipientsPanel,
} from "@/components/nexus-broadcast/nexus-broadcast-panels";
import { nexusValidEmail } from "@/components/nexus-members/nexus-members-model";
import { NexusWorkspaceConfirmDialog } from "@/components/nexus-workspace-ui/nexus-workspace-confirm-dialog";
import {
  NexusWorkspaceButton,
  NexusWorkspaceField,
  NexusWorkspaceLoadError,
  NexusWorkspaceNotice,
} from "@/components/nexus-workspace-ui/nexus-workspace-elements";
import { NexusWorkspaceState } from "@/components/nexus-workspace-ui/nexus-workspace-state";
import { useNexusWorkspaceUnsavedChanges } from "@/components/nexus-workspace-ui/nexus-workspace-unsaved-changes";
import {
  type BroadcastDetail,
  type BroadcastRecipients,
  createBroadcast,
  getBroadcast,
  retryBroadcast,
  type SavedBroadcast,
  sendBroadcast,
  testBroadcast,
  updateBroadcast,
  uploadBroadcastImage,
} from "@/lib/api-broadcasts";
import { ApiRequestError, apiErrorMessage } from "@/lib/api-client";

type DraftAction =
  | { type: "content"; value: JSONContent }
  | { image: BroadcastLocalImage; type: "image" }
  | { type: "reset" }
  | { type: "load"; value: BroadcastDraft }
  | { type: "images"; value: BroadcastDraft["images"] }
  | { type: "subject"; value: string };

function draftReducer(
  draft: BroadcastDraft,
  action: DraftAction,
): BroadcastDraft {
  switch (action.type) {
    case "load":
      return action.value;
    case "images":
      return { ...draft, images: action.value };
    case "content":
      return { ...draft, content: action.value };
    case "image":
      return {
        ...draft,
        images: { ...draft.images, [action.image.id]: action.image },
      };
    case "reset":
      return createEmptyBroadcastDraft();
    case "subject":
      return { ...draft, subject: action.value };
  }
}

function draftFromSaved(row: SavedBroadcast): BroadcastDraft {
  return {
    subject: row.subject,
    content: broadcastEditorContent(row.document),
    recipientMode: "ACTIVE_MEMBERS_WITH_EMAIL",
    images: Object.fromEntries(
      row.images.map((image) => [
        image.imageId,
        {
          id: image.imageId,
          name: image.name,
          objectUrl: image.url,
          size: 0,
          width: image.width,
          height: image.height,
        },
      ]),
    ),
  };
}

function fingerprint(draft: BroadcastDraft) {
  return JSON.stringify({
    subject: draft.subject.trim(),
    document: normalizeBroadcastDocument(draft.content),
  });
}

function deliveryLabel(delivery: BroadcastDetail["deliveries"][number]) {
  if (delivery.status === "pending") return "Dalam antrean";
  if (delivery.status === "sending") return "Sedang dikirim";
  if (delivery.status === "accepted")
    return delivery.deliveryMode === "capture"
      ? "Tersimpan di penampung pemeriksaan"
      : "Diterima layanan email; periksa kotak masuk";
  if (delivery.status === "unknown")
    return "Hasil belum pasti; periksa kotak masuk atau catatan penyedia email sebelum mengirim lagi";
  if (delivery.failureCode === "sender_configuration_changed")
    return "Pengaturan pengirim berubah; kembalikan pengaturan semula atau buat draf baru";
  if (
    [
      "rate_limit_exceeded",
      "daily_quota_exceeded",
      "monthly_quota_exceeded",
    ].includes(delivery.failureCode ?? "")
  )
    return "Ditolak karena batas pengiriman; coba lagi setelah batas tersedia";
  return "Pengiriman ditolak; periksa alamat penerima dan pengaturan pengirim";
}

function scrollBehavior(): ScrollBehavior {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? "auto"
    : "smooth";
}

function revealHeading(id: string) {
  const heading = document.getElementById(id);
  heading?.scrollIntoView({ behavior: scrollBehavior(), block: "start" });
  heading?.focus({ preventScroll: true });
}

/**
 * Pemilik satu draf broadcast. Judul, dokumen editor, dan gambar lokal disimpan
 * di sini; pemeriksaan, tampilan email, status perubahan, dan peninjauan
 * pengiriman seluruhnya diturunkan dari draf yang sama.
 */
export function NexusBroadcastStudio({
  recipients,
  initialPublicId,
  canCompose,
  onSaved,
}: {
  recipients: BroadcastRecipients;
  initialPublicId?: string;
  canCompose: boolean;
  onSaved: () => void;
}) {
  const technicalId = useId();
  const ids = {
    checklist: `${technicalId}-checklist`,
    composer: `${technicalId}-composer`,
    contentError: `${technicalId}-content-error`,
    contentHint: `${technicalId}-content-hint`,
    contentLabel: `${technicalId}-content-label`,
    delivery: `${technicalId}-delivery`,
    preview: `${technicalId}-preview`,
    recipients: `${technicalId}-recipients`,
    reviewButton: `${technicalId}-review`,
    subject: `${technicalId}-subject`,
    subjectError: `${technicalId}-subject-error`,
    subjectHint: `${technicalId}-subject-hint`,
  };

  const [draft, dispatch] = useReducer(
    draftReducer,
    undefined,
    createEmptyBroadcastDraft,
  );
  const [editorKey, setEditorKey] = useState(0);
  const [showErrors, setShowErrors] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [saved, setSaved] = useState<SavedBroadcast | null>(null);
  const [baseline, setBaseline] = useState("");
  const [detail, setDetail] = useState<BroadcastDetail | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(initialPublicId));
  const [hasOpened, setHasOpened] = useState(!initialPublicId);
  const loadSequence = useRef(0);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isTest, setIsTest] = useState(false);
  const [testEmails, setTestEmails] = useState(["", ""]);
  const [reviewedRecipients, setReviewedRecipients] = useState(recipients);
  const [isRetryOpen, setIsRetryOpen] = useState(false);
  const [deliveryLimit, setDeliveryLimit] = useState(50);
  const testRequest = useRef<{ signature: string; id: string } | null>(null);
  const editorRef = useRef<BroadcastEditorHandle>(null);
  const imagesRef = useRef(draft.images);

  const messageDocument = useMemo(
    () => normalizeBroadcastDocument(draft.content),
    [draft.content],
  );
  const previewDocument = useDeferredValue(messageDocument);
  const previewSubject = useDeferredValue(draft.subject);
  const readiness = useMemo(
    () =>
      evaluateBroadcastReadiness({
        document: messageDocument,
        images: draft.images,
        recipients,
        subject: draft.subject,
      }),
    [messageDocument, draft.images, draft.subject, recipients],
  );
  const wordCount = useMemo(
    () => broadcastWordCount(messageDocument),
    [messageDocument],
  );
  const imageCount = useMemo(
    () => summarizeBroadcastDocument(messageDocument).images.length,
    [messageDocument],
  );
  const isDirty = saved
    ? fingerprint(draft) !== baseline
    : broadcastDraftIsDirty(draft, messageDocument);
  const isReadOnly =
    !canCompose || (saved !== null && saved.status !== "draft");
  const subjectLength = draft.subject.trim().length;
  const subjectError =
    subjectLength > BROADCAST_SUBJECT_MAX_LENGTH
      ? `Judul email maksimal ${BROADCAST_SUBJECT_MAX_LENGTH} karakter.`
      : showErrors && subjectLength === 0
        ? "Judul email wajib diisi."
        : undefined;
  const contentError =
    showErrors && broadcastDocumentIsEmpty(messageDocument)
      ? "Isi pesan belum ditulis."
      : undefined;
  const recipientCount = recipients.addresses.length;
  const recipientsLabel =
    recipientCount > 0
      ? `anggota aktif CoE BHT (${recipientCount} penerima)`
      : "anggota aktif CoE BHT (belum ada penerima)";

  useNexusWorkspaceUnsavedChanges({
    confirmLabel: "Tinggalkan halaman",
    description:
      "Perubahan sejak penyimpanan terakhir belum tersimpan. Simpan draf sebelum meninggalkan halaman, atau lanjutkan untuk membuang perubahan tersebut.",
    isDirty,
    title: "Tinggalkan draf broadcast?",
  });

  useEffect(() => {
    const currentUrls = new Set(
      Object.values(draft.images).map((image) => image.objectUrl),
    );
    for (const image of Object.values(imagesRef.current)) {
      if (
        image.objectUrl.startsWith("blob:") &&
        !currentUrls.has(image.objectUrl)
      )
        URL.revokeObjectURL(image.objectUrl);
    }
    imagesRef.current = draft.images;
  }, [draft.images]);
  useEffect(() => () => revokeBroadcastImages(imagesRef.current), []);

  const loadDraft = useCallback(() => {
    if (!initialPublicId) return;
    const sequence = ++loadSequence.current;
    void getBroadcast(initialPublicId)
      .then((row) => {
        if (sequence !== loadSequence.current) return;
        const loaded = draftFromSaved(row);
        dispatch({ type: "load", value: loaded });
        setSaved(row);
        setDetail(row);
        setBaseline(fingerprint(loaded));
        setError("");
        setIsLoading(false);
        setHasOpened(true);
      })
      .catch((error) => {
        if (sequence === loadSequence.current) {
          setError(apiErrorMessage(error, "Draf belum dapat dimuat."));
          setIsLoading(false);
        }
      });
  }, [initialPublicId]);
  useEffect(() => {
    loadDraft();
    return () => {
      loadSequence.current++;
    };
  }, [loadDraft]);

  useEffect(() => {
    if (!announcement) return;
    const timeoutId = window.setTimeout(() => setAnnouncement(""), 4500);
    return () => window.clearTimeout(timeoutId);
  }, [announcement]);

  const handleContentChange = useCallback((value: JSONContent) => {
    dispatch({ type: "content", value });
  }, []);
  const handleImageAdd = useCallback((image: BroadcastLocalImage) => {
    dispatch({ image, type: "image" });
  }, []);

  function resolveCheck(checkId: BroadcastCheckId) {
    switch (checkId) {
      case "subject":
        document.getElementById(ids.subject)?.focus();
        return;
      case "content":
        editorRef.current?.focus();
        return;
      case "links":
        editorRef.current?.reviewLinks();
        return;
      case "images":
        editorRef.current?.reviewImages();
        return;
      case "recipients":
        revealHeading(ids.recipients);
    }
  }

  function requestReview(test = false) {
    const checks = readiness.checks.filter(
      (check) => !test || check.id !== "recipients",
    );
    if (checks.every((check) => check.status === "complete")) {
      setIsTest(test);
      setReviewedRecipients(recipients);
      setError("");
      setIsReviewOpen(true);
      return;
    }
    setShowErrors(true);
    const remaining = checks.filter(
      (check) => check.status !== "complete",
    ).length;
    setAnnouncement(
      `Broadcast belum siap ditinjau. ${remaining} syarat perlu dilengkapi.`,
    );
    const firstIncomplete = checks.find((check) => check.status !== "complete");
    if (firstIncomplete) resolveCheck(firstIncomplete.id);
  }

  function resetDraft() {
    revokeBroadcastImages(draft.images);
    dispatch({ type: "reset" });
    setSaved(null);
    setDetail(null);
    setBaseline("");
    setError("");
    setNotice("");
    testRequest.current = null;
    setEditorKey((key) => key + 1);
    setShowErrors(false);
    setIsResetOpen(false);
    setAnnouncement(
      "Draf baru dibuka. Draf yang sudah tersimpan tetap ada pada riwayat.",
    );
    window.requestAnimationFrame(() =>
      document.getElementById(ids.subject)?.focus(),
    );
  }

  function closeReview() {
    setIsReviewOpen(false);
    /* Tombol pemicu baru dapat difokus setelah dialog modal benar-benar tertutup. */
    window.requestAnimationFrame(() =>
      document.getElementById(ids.reviewButton)?.focus(),
    );
  }

  const deliveryUnavailable = !recipients.delivery.configured;

  async function saveDraft(): Promise<SavedBroadcast> {
    if (saved && !isDirty) return saved;
    const incomplete = readiness.checks.find(
      (check) =>
        (check.id === "links" || check.id === "images") &&
        check.status !== "complete",
    );
    if (incomplete) {
      resolveCheck(incomplete.id);
      throw new Error(incomplete.label);
    }
    const images = { ...draft.images };
    const used = summarizeBroadcastDocument(messageDocument).images;
    for (const imageId of new Set(used.map((image) => image.imageId))) {
      const image = images[imageId];
      if (!image)
        throw new Error("Pilih ulang gambar pesan yang belum tersedia.");
      if (image.file && image.objectUrl.startsWith("blob:")) {
        const uploaded = await uploadBroadcastImage(image.file);
        images[imageId] = { ...image, objectUrl: uploaded.url };
      }
    }
    dispatch({ type: "images", value: images });
    const body = {
      subject: draft.subject.trim(),
      document: messageDocument,
      images: [...new Set(used.map((image) => image.imageId))].map(
        (imageId) => ({
          imageId,
          url: images[imageId].objectUrl,
          name: images[imageId].name,
          width: images[imageId].width,
          height: images[imageId].height,
        }),
      ),
    };
    const row = saved
      ? await updateBroadcast(saved.publicId, {
          ...body,
          expectedVersion: saved.version,
        })
      : await createBroadcast(body);
    setSaved(row);
    setBaseline(fingerprint(draft));
    setNotice(
      "Draf tersimpan. Anda dapat membukanya kembali dari riwayat broadcast.",
    );
    onSaved();
    return row;
  }

  function explainFailure(error: unknown) {
    setError(
      error instanceof ApiRequestError
        ? apiErrorMessage(
            error,
            "Tindakan belum berhasil. Draf tetap tersedia.",
          )
        : error instanceof Error
          ? error.message
          : "Tindakan belum berhasil. Draf tetap tersedia.",
    );
  }

  async function save() {
    if (isBusy || isReadOnly) return;
    setIsBusy(true);
    setError("");
    try {
      await saveDraft();
    } catch (error) {
      explainFailure(error);
    } finally {
      setIsBusy(false);
    }
  }

  async function deliver() {
    if (isBusy || isReadOnly) return;
    const emails = testEmails
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean);
    if (
      isTest &&
      (emails.length === 0 || emails.some((email) => !nexusValidEmail(email)))
    ) {
      setError("Isi minimal satu alamat email percobaan yang sah.");
      return;
    }
    setIsBusy(true);
    setError("");
    try {
      const row = await saveDraft();
      if (isTest) {
        const signature = JSON.stringify({
          publicId: row.publicId,
          version: row.version,
          emails,
        });
        if (testRequest.current?.signature !== signature)
          testRequest.current = { signature, id: crypto.randomUUID() };
        await testBroadcast(
          row.publicId,
          row.version,
          testRequest.current.id,
          emails,
        );
        setDetail(await getBroadcast(row.publicId));
        testRequest.current = null;
        setNotice(
          "Email percobaan masuk antrean. Perbarui hasil untuk melihat konfirmasi pengiriman.",
        );
      } else {
        const result = await sendBroadcast(
          row.publicId,
          row.version,
          reviewedRecipients.recipientHash,
        );
        setSaved(result);
        setDetail(result);
        setNotice(
          "Broadcast masuk antrean. Perbarui hasil untuk melihat konfirmasi setiap penerima.",
        );
      }
      closeReview();
      onSaved();
    } catch (error) {
      explainFailure(error);
    } finally {
      setIsBusy(false);
    }
  }

  async function refreshResults() {
    if (!saved || isBusy) return;
    setIsBusy(true);
    setError("");
    try {
      const row = await getBroadcast(saved.publicId);
      setDetail(row);
      if (row.version !== saved.version)
        setError(
          "Draf sudah berubah. Perubahan Anda tetap ada; muat ulang draf sebelum menyimpan kembali.",
        );
      else setSaved(row);
      onSaved();
    } catch (error) {
      explainFailure(error);
    } finally {
      setIsBusy(false);
    }
  }

  async function retry() {
    if (!saved || isBusy) return;
    setIsBusy(true);
    setError("");
    try {
      const row = await retryBroadcast(saved.publicId, saved.version);
      setSaved(row);
      setDetail(row);
      setIsRetryOpen(false);
      onSaved();
    } catch (error) {
      explainFailure(error);
    } finally {
      setIsBusy(false);
    }
  }
  const subjectDescription = [
    ids.subjectHint,
    subjectError ? ids.subjectError : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      {isLoading ? (
        <NexusWorkspaceState
          eyebrow="Memuat"
          title="Membuka broadcast tersimpan"
          description="Isi pesan, gambar, dan riwayat pengiriman sedang dimuat."
        />
      ) : !hasOpened ? (
        <NexusWorkspaceLoadError
          title="Broadcast belum dapat dibuka"
          description={error}
          onRetry={() => {
            setIsLoading(true);
            loadDraft();
          }}
        />
      ) : (
        <>
          {error ? (
            <NexusWorkspaceNotice tone="danger">{error}</NexusWorkspaceNotice>
          ) : notice ? (
            <NexusWorkspaceNotice tone="success">{notice}</NexusWorkspaceNotice>
          ) : null}
          <div className={styles.studio}>
            <section aria-labelledby={ids.composer} className={styles.composer}>
              <header className={styles.composerHeader}>
                <span aria-hidden="true" className={styles.composerIcon}>
                  <NexusBroadcastIcon name="pencil" />
                </span>
                <div className={styles.composerHeading}>
                  <h3 id={ids.composer}>
                    {saved ? "Broadcast tersimpan" : "Buat broadcast"}
                  </h3>
                  <p>
                    Tulis pesan untuk anggota CoE BHT, lalu tinjau sebelum
                    dikirim.
                  </p>
                </div>
                <div className={styles.composerActions}>
                  {!isReadOnly ? (
                    <NexusWorkspaceButton
                      disabled={isBusy || (!isDirty && Boolean(saved))}
                      onClick={() => void save()}
                      type="button"
                    >
                      {isBusy ? "Memproses…" : "Simpan draf"}
                    </NexusWorkspaceButton>
                  ) : null}
                  {!isReadOnly ? (
                    <NexusWorkspaceButton
                      disabled={isBusy}
                      onClick={() => requestReview(true)}
                      type="button"
                    >
                      Kirim percobaan
                    </NexusWorkspaceButton>
                  ) : null}
                  <NexusWorkspaceButton
                    onClick={() => revealHeading(ids.preview)}
                    type="button"
                  >
                    <NexusBroadcastIcon name="eye" />
                    Tampilan email
                  </NexusWorkspaceButton>
                  {!isReadOnly ? (
                    <NexusWorkspaceButton
                      id={ids.reviewButton}
                      onClick={() => requestReview()}
                      disabled={isBusy}
                      tone="primary"
                      type="button"
                    >
                      <NexusBroadcastIcon name="send" />
                      Tinjau pengiriman
                    </NexusWorkspaceButton>
                  ) : null}
                </div>
              </header>

              {/* Baris amplop email: pengirim, penerima, dan judul, seperti menulis email. */}
              <div className={styles.envelope}>
                <div className={styles.envelopeRow}>
                  <span className={styles.envelopeLabel}>Dari</span>
                  <span className={styles.envelopeValue}>
                    <span aria-hidden="true" className={styles.envelopeAvatar}>
                      BN
                    </span>
                    <span className={styles.envelopeText}>
                      <strong>BHT Nexus</strong>
                      <small>{recipients.delivery.sender}</small>
                    </span>
                  </span>
                </div>
                <div className={styles.envelopeRow}>
                  <span className={styles.envelopeLabel}>Kepada</span>
                  <span className={styles.envelopeValue}>
                    <span aria-hidden="true" className={styles.envelopeIcon}>
                      <NexusBroadcastIcon name="people" />
                    </span>
                    <span className={styles.envelopeText}>
                      <strong>Semua anggota aktif yang memiliki email</strong>
                    </span>
                    <span
                      className={styles.envelopeBadge}
                      data-empty={recipientCount === 0 || undefined}
                    >
                      {recipientCount} penerima
                    </span>
                  </span>
                </div>
                <div
                  className={styles.envelopeRow}
                  data-invalid={subjectError ? "" : undefined}
                >
                  <label className={styles.envelopeLabel} htmlFor={ids.subject}>
                    Judul
                    <i aria-hidden="true">*</i>
                  </label>
                  <span className={styles.subjectField}>
                    <input
                      aria-describedby={subjectDescription}
                      aria-invalid={Boolean(subjectError)}
                      aria-required="true"
                      autoComplete="off"
                      className={styles.subjectInput}
                      id={ids.subject}
                      name="broadcast-subject"
                      onChange={(event) =>
                        dispatch({ type: "subject", value: event.target.value })
                      }
                      placeholder="Contoh: Pengumuman Call for Proposal Penelitian 2026"
                      type="text"
                      value={draft.subject}
                      disabled={isBusy || isReadOnly}
                    />
                    <small
                      className={styles.subjectCounter}
                      data-over={
                        subjectLength > BROADCAST_SUBJECT_MAX_LENGTH ||
                        undefined
                      }
                      id={ids.subjectHint}
                    >
                      <span className={styles.visuallyHidden}>
                        Judul tampil sebagai subjek email.{" "}
                      </span>
                      {subjectLength}/{BROADCAST_SUBJECT_MAX_LENGTH}
                    </small>
                  </span>
                </div>
                {subjectError ? (
                  <p className={styles.fieldError} id={ids.subjectError}>
                    {subjectError}
                  </p>
                ) : null}
              </div>

              <div className={styles.bodyLabelRow}>
                <span className={styles.bodyLabel} id={ids.contentLabel}>
                  Isi pesan
                  <i aria-hidden="true">*</i>
                </span>
                <small className={styles.bodyHint} id={ids.contentHint}>
                  Pilih teks, lalu pakai perkakas untuk judul, tebal, miring,
                  daftar, dan tautan. Klik gambar untuk mengatur posisi dan
                  ukurannya.
                </small>
              </div>
              <NexusBroadcastEditor
                describedBy={
                  contentError
                    ? `${ids.contentHint} ${ids.contentError}`
                    : ids.contentHint
                }
                hasError={Boolean(contentError)}
                initialContent={draft.content}
                disabled={isBusy || isReadOnly}
                images={draft.images}
                key={editorKey}
                labelId={ids.contentLabel}
                onContentChange={handleContentChange}
                onImageAdd={handleImageAdd}
                ref={editorRef}
                subject={draft.subject}
              />
              {contentError ? (
                <p className={styles.fieldError} id={ids.contentError}>
                  {contentError}
                </p>
              ) : null}

              <footer className={styles.composerFooter}>
                <p>
                  <strong>
                    {wordCount.toLocaleString("id-ID")} kata
                    {imageCount > 0 ? ` · ${imageCount} gambar` : ""}
                  </strong>
                  <span>
                    {isDirty
                      ? "Ada perubahan yang belum tersimpan. Klik Simpan draf untuk menyimpannya."
                      : saved
                        ? `Versi ${saved.version} sudah tersimpan.`
                        : "Mulai dengan menulis judul email dan isi pesan."}
                  </span>
                </p>
                <NexusWorkspaceButton
                  disabled={isBusy || !canCompose || (!isDirty && !saved)}
                  onClick={() => setIsResetOpen(true)}
                  type="button"
                >
                  <NexusBroadcastIcon name="eraser" />
                  Draf baru
                </NexusWorkspaceButton>
              </footer>
            </section>

            <div className={styles.rail}>
              <NexusBroadcastRecipientsPanel
                headingId={ids.recipients}
                recipients={recipients}
              />
              <NexusBroadcastChecklistPanel
                headingId={ids.checklist}
                onResolve={resolveCheck}
                readiness={readiness}
              />
            </div>
          </div>

          <NexusBroadcastEmailPreview
            document={previewDocument}
            headingId={ids.preview}
            images={draft.images}
            recipientsLabel={recipientsLabel}
            subject={previewSubject}
          />

          {detail && detail.deliveries.length > 0 ? (
            <section
              className={styles.deliveryPanel}
              aria-labelledby={`${technicalId}-results`}
            >
              <div className={styles.refreshRow}>
                <h3 id={`${technicalId}-results`}>
                  Hasil pengiriman dan percobaan
                </h3>
                <NexusWorkspaceButton
                  disabled={isBusy}
                  onClick={() => void refreshResults()}
                  type="button"
                >
                  Perbarui hasil
                </NexusWorkspaceButton>
              </div>
              <p>
                Antrean diproses otomatis. Pesan yang diterima layanan email
                masih perlu diperiksa di kotak masuk penerima. Hasil yang belum
                pasti tidak dikirim ulang otomatis.
              </p>
              <ul className={styles.deliveryList}>
                {detail.deliveries.slice(0, deliveryLimit).map((delivery) => (
                  <li key={delivery.publicId}>
                    <strong>{delivery.email}</strong>
                    <span>{deliveryLabel(delivery)}</span>
                    <small>
                      {delivery.kind === "test" ? "Percobaan" : "Broadcast"} ·{" "}
                      {delivery.subject} · versi {delivery.messageVersion} ·{" "}
                      {new Date(delivery.requestedAt).toLocaleString("id-ID")}
                    </small>
                  </li>
                ))}
              </ul>
              {detail.deliveries.length > deliveryLimit ? (
                <NexusWorkspaceButton
                  onClick={() => setDeliveryLimit((limit) => limit + 50)}
                  type="button"
                >
                  Tampilkan 50 penerima berikutnya
                </NexusWorkspaceButton>
              ) : null}
              {canCompose && detail.summary.failedCount > 0 ? (
                <NexusWorkspaceButton
                  disabled={isBusy}
                  onClick={() => setIsRetryOpen(true)}
                  type="button"
                >
                  Coba lagi untuk {detail.summary.failedCount} penerima gagal
                </NexusWorkspaceButton>
              ) : null}
            </section>
          ) : saved ? (
            <NexusWorkspaceButton
              disabled={isBusy}
              onClick={() => void refreshResults()}
              type="button"
            >
              Perbarui hasil pengiriman
            </NexusWorkspaceButton>
          ) : null}
        </>
      )}

      <p aria-live="polite" className={styles.visuallyHidden}>
        {announcement}
      </p>

      {isReviewOpen ? (
        <NexusBroadcastDialog
          closeLabel="Tutup peninjauan pengiriman"
          description={
            isTest
              ? "Pesan percobaan hanya dikirim ke alamat yang Anda isi di bawah."
              : "Periksa kembali ringkasan broadcast sebelum dikirim kepada anggota."
          }
          footer={
            <>
              <NexusWorkspaceButton
                disabled={isBusy}
                onClick={closeReview}
                type="button"
              >
                Kembali menyunting
              </NexusWorkspaceButton>
              <NexusWorkspaceButton
                aria-describedby={
                  deliveryUnavailable ? ids.delivery : undefined
                }
                disabled={deliveryUnavailable || isBusy}
                onClick={() => void deliver()}
                tone="primary"
                type="button"
              >
                <NexusBroadcastIcon name="send" />
                {isBusy
                  ? "Memproses…"
                  : isTest
                    ? "Kirim percobaan"
                    : "Kirim broadcast"}
              </NexusWorkspaceButton>
            </>
          }
          icon="send"
          onClose={() => {
            if (!isBusy) closeReview();
          }}
          title={
            isTest ? "Tinjau email percobaan" : "Tinjau pengiriman broadcast"
          }
        >
          <dl className={styles.reviewSummary}>
            <div>
              <dt>Judul email</dt>
              <dd>{draft.subject.trim()}</dd>
            </div>
            <div>
              <dt>Penerima</dt>
              <dd>
                {isTest
                  ? "Hanya alamat percobaan di bawah"
                  : `${reviewedRecipients.addresses.length} alamat email · anggota aktif CoE BHT yang memiliki email`}
              </dd>
            </div>
            <div>
              <dt>Pengirim</dt>
              <dd>{reviewedRecipients.delivery.sender}</dd>
            </div>
            <div>
              <dt>Isi pesan</dt>
              <dd>
                {broadcastContentOverview(messageDocument)} ·{" "}
                {wordCount.toLocaleString("id-ID")} kata
              </dd>
            </div>
          </dl>
          {isTest ? (
            <div className={styles.testFields}>
              {(
                [
                  { id: "primary", index: 0 },
                  { id: "secondary", index: 1 },
                ] as const
              ).map(({ id, index }) => (
                <NexusWorkspaceField
                  key={id}
                  label={`Email percobaan ${index + 1}${index === 1 ? " (opsional)" : ""}`}
                  value={testEmails[index]}
                  onChange={(event) =>
                    setTestEmails((values) =>
                      values.map((value, current) =>
                        current === index ? event.target.value : value,
                      ),
                    )
                  }
                  type="email"
                  maxLength={254}
                  disabled={isBusy}
                />
              ))}
            </div>
          ) : null}
          {error ? (
            <NexusWorkspaceNotice tone="danger">{error}</NexusWorkspaceNotice>
          ) : null}
          {deliveryUnavailable ? (
            <p className={styles.reviewNotice} id={ids.delivery}>
              <NexusBroadcastIcon name="alert" />
              <span>
                Pengirim email belum dikonfigurasi. Simpan draf, lalu minta
                pengelola menyiapkan pengirim email.
              </span>
            </p>
          ) : reviewedRecipients.delivery.mode === "capture" ? (
            <p className={styles.reviewNotice}>
              Email ini akan masuk ke penampung pemeriksaan dan belum dikirim ke
              kotak email sungguhan.
            </p>
          ) : null}
        </NexusBroadcastDialog>
      ) : null}

      {isResetOpen ? (
        <NexusWorkspaceConfirmDialog
          cancelLabel="Lanjutkan menyunting"
          confirmLabel="Mulai draf baru"
          description="Perubahan yang belum disimpan akan dibuang. Draf yang sudah tersimpan tetap ada pada riwayat broadcast."
          onCancel={() => setIsResetOpen(false)}
          onConfirm={resetDraft}
          title="Mulai draf baru?"
          tone="warning"
        />
      ) : null}
      {isRetryOpen ? (
        <NexusWorkspaceConfirmDialog
          cancelLabel="Kembali"
          confirmLabel="Coba penerima gagal"
          description="Hanya penerima yang ditolak layanan email yang masuk antrean lagi. Pesan yang sudah diterima dan hasil yang belum pasti tidak dikirim ulang."
          onCancel={() => {
            if (!isBusy) setIsRetryOpen(false);
          }}
          onConfirm={() => void retry()}
          title="Coba kembali pengiriman yang gagal?"
          tone="warning"
        />
      ) : null}
    </>
  );
}
