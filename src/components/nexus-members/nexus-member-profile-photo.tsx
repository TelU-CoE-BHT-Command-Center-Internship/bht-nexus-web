"use client";

import dynamic from "next/dynamic";
import Image, { type ImageProps } from "next/image";
import { type ChangeEvent, type DragEvent, useId, useState } from "react";
import {
  DEFAULT_MEMBER_AVATAR_POSITION,
  type NexusMemberAvatarPosition,
} from "@/components/nexus-members/nexus-member-avatar";
import styles from "@/components/nexus-members/nexus-member-profile-photo.module.css";
import { NexusWorkspaceButton } from "@/components/nexus-workspace-ui/nexus-workspace-elements";
import { personInitials } from "@/components/nexus-workspace-ui/nexus-workspace-format";

const NexusMemberPhotoEditor = dynamic(
  () =>
    import("@/components/nexus-members/nexus-member-photo-editor").then(
      (module) => module.NexusMemberPhotoEditor,
    ),
  { ssr: false },
);

const ACCEPTED_PROFILE_PHOTO_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;
const MAX_PROFILE_PHOTO_BYTES = 2 * 1024 * 1024;

/**
 * Satu kendali foto profil untuk seluruh formulir orang di ruang kerja.
 * Direktori Anggota dan halaman Profil Saya memakai kendali dan editor yang
 * sama; hanya sebutan orangnya yang menyesuaikan permukaannya.
 */
type NexusMemberProfilePhotoProps = {
  onChange: (value: {
    avatarSrc?: ImageProps["src"];
    originalSrc?: ImageProps["src"];
    position: NexusMemberAvatarPosition;
  }) => void;
  originalValue?: ImageProps["src"];
  /** Sebutan orang pada nama aksesibel, misalnya "anggota" atau "pengguna". */
  personLabel?: string;
  personName: string;
  position: NexusMemberAvatarPosition;
  value?: ImageProps["src"];
};

function UploadIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5" />
      <path d="M5 15.5V18a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2.5" />
    </svg>
  );
}

function AdjustIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path d="M4 7h10M18 7h2M4 17h3M11 17h9M14 4v6M8 14v6" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path d="M4 7h16M9 7V4.5h6V7M7 7l.75 13h8.5L17 7M10 11v5M14 11v5" />
    </svg>
  );
}

function imageSourceValue(value: ImageProps["src"]) {
  if (typeof value === "string") return value;
  if ("src" in value) return value.src;
  return value.default.src;
}

export function NexusMemberProfilePhoto({
  onChange,
  originalValue,
  personLabel = "pengguna",
  personName,
  position,
  value,
}: NexusMemberProfilePhotoProps) {
  const [editorImage, setEditorImage] = useState("");
  const [error, setError] = useState("");
  const [isFileDragging, setIsFileDragging] = useState(false);
  const technicalId = useId();
  const helpId = `${technicalId}-photo-help`;
  const errorId = `${technicalId}-photo-error`;
  const personDisplayName = personName.trim() || personLabel;

  function closeEditor() {
    setEditorImage("");
  }

  function openCurrentPhoto() {
    if (!value) return;
    setError("");
    setEditorImage(imageSourceValue(originalValue ?? value));
  }

  function openPhotoFile(file?: File) {
    if (!file) return;
    if (
      !ACCEPTED_PROFILE_PHOTO_TYPES.includes(
        file.type as (typeof ACCEPTED_PROFILE_PHOTO_TYPES)[number],
      )
    ) {
      setError("Gunakan foto berformat JPG, PNG, atau WebP.");
      return;
    }
    if (file.size > MAX_PROFILE_PHOTO_BYTES) {
      setError("Ukuran foto maksimal 2 MB.");
      return;
    }

    const reader = new FileReader();
    reader.addEventListener(
      "load",
      () => {
        if (typeof reader.result !== "string") {
          setError("Foto tidak dapat dibaca. Silakan pilih file lain.");
          return;
        }
        setError("");
        setEditorImage(reader.result);
      },
      { once: true },
    );
    reader.addEventListener(
      "error",
      () => setError("Foto tidak dapat dibaca. Silakan pilih file lain."),
      { once: true },
    );
    reader.readAsDataURL(file);
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    openPhotoFile(event.currentTarget.files?.[0]);
    event.currentTarget.value = "";
  }

  function handleDrop(event: DragEvent<HTMLFieldSetElement>) {
    event.preventDefault();
    setIsFileDragging(false);
    openPhotoFile(event.dataTransfer.files[0]);
  }

  return (
    <>
      <fieldset
        className={styles.field}
        data-dragging={isFileDragging || undefined}
        data-wide="true"
        onDragEnter={(event) => {
          event.preventDefault();
          setIsFileDragging(true);
        }}
        onDragLeave={(event) => {
          if (
            !event.currentTarget.contains(event.relatedTarget as Node | null)
          ) {
            setIsFileDragging(false);
          }
        }}
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
      >
        <legend className={styles.visuallyHidden}>Foto profil</legend>
        <div className={styles.preview}>
          {value ? (
            <Image
              alt={`Foto ${personDisplayName} yang dipilih`}
              fill
              sizes="72px"
              src={value}
              style={{ objectPosition: `${position.x}% ${position.y}%` }}
              unoptimized={
                typeof value === "string" &&
                (value.startsWith("data:") || value.startsWith("blob:"))
              }
            />
          ) : (
            <span aria-label={`Inisial ${personDisplayName}`} role="img">
              {personInitials(personDisplayName)}
            </span>
          )}
        </div>

        <div className={styles.copy}>
          <strong>Foto profil</strong>
          <p id={helpId}>
            Tarik foto ke area ini atau pilih file JPG, PNG, atau WebP maksimal
            2 MB. Posisi foto dapat diatur sebelum diterapkan.
          </p>
          {error ? (
            <p className={styles.error} id={errorId} role="alert">
              {error}
            </p>
          ) : null}
        </div>

        <div className={styles.actions}>
          {value ? (
            <NexusWorkspaceButton onClick={openCurrentPhoto} type="button">
              <AdjustIcon />
              Atur foto
            </NexusWorkspaceButton>
          ) : null}
          <label className={styles.uploadButton}>
            <input
              accept={ACCEPTED_PROFILE_PHOTO_TYPES.join(",")}
              aria-describedby={`${helpId}${error ? ` ${errorId}` : ""}`}
              className={styles.input}
              onChange={handleInputChange}
              type="file"
            />
            <UploadIcon />
            <span>{value ? "Ganti foto" : "Pilih foto"}</span>
          </label>
          {value ? (
            <NexusWorkspaceButton
              onClick={() => {
                setError("");
                onChange({
                  avatarSrc: undefined,
                  originalSrc: undefined,
                  position: { ...DEFAULT_MEMBER_AVATAR_POSITION },
                });
              }}
              tone="danger"
              type="button"
            >
              <DeleteIcon />
              Hapus
            </NexusWorkspaceButton>
          ) : null}
        </div>
      </fieldset>

      {editorImage ? (
        <NexusMemberPhotoEditor
          imageSrc={editorImage}
          key={editorImage}
          onApply={(croppedImage) => {
            onChange({
              avatarSrc: croppedImage,
              originalSrc: editorImage,
              position: { x: 50, y: 50 },
            });
            closeEditor();
          }}
          onCancel={closeEditor}
          personName={personDisplayName}
        />
      ) : null}
    </>
  );
}
