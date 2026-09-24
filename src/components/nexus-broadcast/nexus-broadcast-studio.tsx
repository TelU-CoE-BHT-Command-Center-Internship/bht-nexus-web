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
  type BroadcastRecipientSummary,
  broadcastContentOverview,
  broadcastDraftIsDirty,
  createEmptyBroadcastDraft,
  evaluateBroadcastReadiness,
  nexusBroadcastDelivery,
  revokeBroadcastImages,
} from "@/components/nexus-broadcast/nexus-broadcast-model";
import {
  NexusBroadcastChecklistPanel,
  NexusBroadcastRecipientsPanel,
} from "@/components/nexus-broadcast/nexus-broadcast-panels";
import { NexusWorkspaceConfirmDialog } from "@/components/nexus-workspace-ui/nexus-workspace-confirm-dialog";
import { NexusWorkspaceButton } from "@/components/nexus-workspace-ui/nexus-workspace-elements";
import { useNexusWorkspaceUnsavedChanges } from "@/components/nexus-workspace-ui/nexus-workspace-unsaved-changes";

type DraftAction =
  | { type: "content"; value: JSONContent }
  | { image: BroadcastLocalImage; type: "image" }
  | { type: "reset" }
  | { type: "subject"; value: string };

function draftReducer(
  draft: BroadcastDraft,
  action: DraftAction,
): BroadcastDraft {
  switch (action.type) {
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
}: {
  recipients: BroadcastRecipientSummary;
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
  const isDirty = broadcastDraftIsDirty(draft, messageDocument);
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
      "Judul, isi pesan, dan gambar yang sedang Anda susun akan hilang jika Anda meninggalkan halaman ini.",
    isDirty,
    title: "Tinggalkan draf broadcast?",
  });

  /* Alamat sementara gambar dilepas ketika halaman ditinggalkan. */
  useEffect(() => {
    imagesRef.current = draft.images;
  }, [draft.images]);
  useEffect(() => () => revokeBroadcastImages(imagesRef.current), []);

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

  function requestReview() {
    if (readiness.isReady) {
      setIsReviewOpen(true);
      return;
    }
    setShowErrors(true);
    const remaining = readiness.checks.length - readiness.completeCount;
    setAnnouncement(
      `Broadcast belum siap ditinjau. ${remaining} syarat perlu dilengkapi.`,
    );
    const firstIncomplete = readiness.checks.find(
      (check) => check.status !== "complete",
    );
    if (firstIncomplete) resolveCheck(firstIncomplete.id);
  }

  function resetDraft() {
    revokeBroadcastImages(draft.images);
    dispatch({ type: "reset" });
    setEditorKey((key) => key + 1);
    setShowErrors(false);
    setIsResetOpen(false);
    setAnnouncement("Draf broadcast dikosongkan.");
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

  const deliveryUnavailable = nexusBroadcastDelivery.status === "UNAVAILABLE";
  const subjectDescription = [
    ids.subjectHint,
    subjectError ? ids.subjectError : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <div className={styles.studio}>
        <section aria-labelledby={ids.composer} className={styles.composer}>
          <header className={styles.composerHeader}>
            <span aria-hidden="true" className={styles.composerIcon}>
              <NexusBroadcastIcon name="pencil" />
            </span>
            <div className={styles.composerHeading}>
              <h3 id={ids.composer}>Buat broadcast</h3>
              <p>
                Tulis pesan untuk anggota CoE BHT, lalu tinjau sebelum dikirim.
              </p>
            </div>
            <div className={styles.composerActions}>
              <NexusWorkspaceButton
                onClick={() => revealHeading(ids.preview)}
                type="button"
              >
                <NexusBroadcastIcon name="eye" />
                Tampilan email
              </NexusWorkspaceButton>
              <NexusWorkspaceButton
                id={ids.reviewButton}
                onClick={requestReview}
                tone="primary"
                type="button"
              >
                <NexusBroadcastIcon name="send" />
                Tinjau pengiriman
              </NexusWorkspaceButton>
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
                  <small>Alamat pengirim resmi BHT Nexus</small>
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
                />
                <small
                  className={styles.subjectCounter}
                  data-over={
                    subjectLength > BROADCAST_SUBJECT_MAX_LENGTH || undefined
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
                  ? "Draf ini hanya ada di halaman ini dan hilang bila halaman ditutup."
                  : "Mulai dengan menulis judul email dan isi pesan."}
              </span>
            </p>
            <NexusWorkspaceButton
              disabled={!isDirty}
              onClick={() => setIsResetOpen(true)}
              type="button"
            >
              <NexusBroadcastIcon name="eraser" />
              Kosongkan draf
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

      <p aria-live="polite" className={styles.visuallyHidden}>
        {announcement}
      </p>

      {isReviewOpen ? (
        <NexusBroadcastDialog
          closeLabel="Tutup peninjauan pengiriman"
          description="Periksa kembali ringkasan broadcast sebelum dikirim kepada anggota."
          footer={
            <>
              <NexusWorkspaceButton onClick={closeReview} type="button">
                Kembali menyunting
              </NexusWorkspaceButton>
              <NexusWorkspaceButton
                aria-describedby={
                  deliveryUnavailable ? ids.delivery : undefined
                }
                disabled={deliveryUnavailable}
                tone="primary"
                type="button"
              >
                <NexusBroadcastIcon name="send" />
                Kirim broadcast
              </NexusWorkspaceButton>
            </>
          }
          icon="send"
          onClose={closeReview}
          title="Tinjau pengiriman broadcast"
        >
          <dl className={styles.reviewSummary}>
            <div>
              <dt>Judul email</dt>
              <dd>{draft.subject.trim()}</dd>
            </div>
            <div>
              <dt>Penerima</dt>
              <dd>
                {recipientCount} alamat email · anggota aktif CoE BHT yang
                memiliki email
              </dd>
            </div>
            <div>
              <dt>Pengirim</dt>
              <dd>BHT Nexus</dd>
            </div>
            <div>
              <dt>Isi pesan</dt>
              <dd>
                {broadcastContentOverview(messageDocument)} ·{" "}
                {wordCount.toLocaleString("id-ID")} kata
              </dd>
            </div>
          </dl>
          {deliveryUnavailable ? (
            <p className={styles.reviewNotice} id={ids.delivery}>
              <NexusBroadcastIcon name="alert" />
              <span>
                Pengiriman email dari BHT Nexus belum tersedia, sehingga
                broadcast ini belum dapat dikirim. Draf tetap ada di halaman ini
                selama halaman tidak ditutup.
              </span>
            </p>
          ) : null}
        </NexusBroadcastDialog>
      ) : null}

      {isResetOpen ? (
        <NexusWorkspaceConfirmDialog
          cancelLabel="Lanjutkan menyunting"
          confirmLabel="Kosongkan draf"
          description="Judul, isi pesan, tautan, dan gambar yang sudah Anda tulis akan dihapus dari halaman ini."
          onCancel={() => setIsResetOpen(false)}
          onConfirm={resetDraft}
          title="Kosongkan draf broadcast?"
          tone="warning"
        />
      ) : null}
    </>
  );
}
