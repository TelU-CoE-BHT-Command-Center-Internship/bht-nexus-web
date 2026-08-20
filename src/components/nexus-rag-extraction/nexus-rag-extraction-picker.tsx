"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { NexusDocumentNav } from "@/components/nexus-document-workspace/nexus-document-nav";
import type { ExtractionDocumentOption } from "@/components/nexus-rag-extraction/nexus-rag-extraction-content";
import styles from "@/components/nexus-rag-extraction/nexus-rag-extraction-picker.module.css";
import {
  NexusWorkspaceButton,
  NexusWorkspaceCard,
  NexusWorkspaceLinkButton,
} from "@/components/nexus-workspace-ui/nexus-workspace-elements";
import { NexusWorkspacePage } from "@/components/nexus-workspace-ui/nexus-workspace-page";
import {
  type NexusSelectConfig,
  NexusWorkspaceSelect,
} from "@/components/nexus-workspace-ui/nexus-workspace-select";
import type { Locale } from "@/i18n/locales";

type NexusRagExtractionPickerProps = {
  description: string;
  documents: ExtractionDocumentOption[];
  locale: Locale;
  title: string;
};

export function NexusRagExtractionPicker({
  description,
  documents,
  locale,
  title,
}: NexusRagExtractionPickerProps) {
  const router = useRouter();
  const isId = locale === "id";
  const libraryHref = isId ? "/nexus/dokumen" : "/en/nexus/documents";
  const extractionHref = isId ? "/nexus/ekstraksi" : "/en/nexus/extraction";
  const [selectedId, setSelectedId] = useState(documents[0]?.id ?? "");
  const [isOpen, setIsOpen] = useState(false);

  const config = useMemo<NexusSelectConfig | null>(() => {
    const [first, ...rest] = documents;
    if (!first) return null;
    return {
      defaultValue: first.id,
      id: "extraction-document",
      label: isId ? "Pilih dokumen" : "Choose a document",
      options: [
        { label: `${first.label} · ${first.meta}`, value: first.id },
        ...rest.map((document) => ({
          label: `${document.label} · ${document.meta}`,
          value: document.id,
        })),
      ],
    };
  }, [documents, isId]);

  return (
    <NexusWorkspacePage
      description={description}
      descriptionId="extraction-description"
      title={title}
      titleId="extraction-title"
    >
      <NexusDocumentNav locale={locale} />
      <div className={styles.empty}>
        <div className={styles.panel}>
          <NexusWorkspaceCard
            description={
              config
                ? isId
                  ? "Ekstraksi berjalan pada satu dokumen. Pilih dokumen berstatus selesai, atau buka lewat tombol Ekstrak di Pustaka dokumen."
                  : "Extraction runs on a single document. Choose a processed document, or open it from the Extract action in the document library."
                : isId
                  ? "Belum ada dokumen berstatus selesai yang dapat diekstrak. Unggah atau proses dokumen lebih dulu di Pustaka dokumen."
                  : "No processed document is ready for extraction yet. Upload or process a document in the library first."
            }
            title={
              config
                ? isId
                  ? "Pilih dokumen untuk diekstrak"
                  : "Choose a document to extract"
                : isId
                  ? "Belum ada dokumen siap diekstrak"
                  : "No document ready for extraction"
            }
          >
            {config ? (
              <div className={styles.picker}>
                <NexusWorkspaceSelect
                  config={config}
                  isOpen={isOpen}
                  name="extraction-document"
                  onOpenChange={setIsOpen}
                  onValueChange={setSelectedId}
                  value={selectedId}
                />
                <NexusWorkspaceButton
                  onClick={() =>
                    router.push(
                      `${extractionHref}?document=${encodeURIComponent(selectedId)}`,
                    )
                  }
                  tone="primary"
                  type="button"
                >
                  {isId ? "Mulai ekstraksi" : "Start extraction"}
                </NexusWorkspaceButton>
              </div>
            ) : (
              <NexusWorkspaceLinkButton href={libraryHref}>
                {isId ? "Buka Pustaka dokumen" : "Open document library"}
              </NexusWorkspaceLinkButton>
            )}
          </NexusWorkspaceCard>
          <p className={styles.hint}>
            {config
              ? isId
                ? `${documents.length} dokumen siap diekstrak. Ekstraksi tidak mengubah data resmi; hasilnya selalu melewati Tinjauan.`
                : `${documents.length} documents are ready for extraction. Extraction never changes official data; results always pass through Review.`
              : isId
                ? "Dokumen menjadi siap setelah pemrosesan teksnya selesai."
                : "A document becomes ready once its text processing succeeds."}
          </p>
        </div>
      </div>
    </NexusWorkspacePage>
  );
}
