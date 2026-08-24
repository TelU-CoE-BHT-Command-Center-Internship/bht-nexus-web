"use client";

import Image, { type ImageProps } from "next/image";
import {
  type ChangeEvent,
  type DragEvent,
  type PointerEvent as ReactPointerEvent,
  useRef,
  useState,
} from "react";
import {
  DEFAULT_MEMBER_AVATAR_POSITION,
  type NexusMemberAvatarPosition,
} from "@/components/nexus-members/nexus-member-avatar";
import styles from "@/components/nexus-members/nexus-members.module.css";
import { NexusWorkspaceButton } from "@/components/nexus-workspace-ui/nexus-workspace-elements";
import { personInitials } from "@/components/nexus-workspace-ui/nexus-workspace-format";

const ACCEPTED_PROFILE_PHOTO_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;
const MAX_PROFILE_PHOTO_BYTES = 2 * 1024 * 1024;

type NexusMemberProfilePhotoProps = {
  memberName: string;
  onChange: (value: {
    avatarSrc?: ImageProps["src"];
    position: NexusMemberAvatarPosition;
  }) => void;
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

function MoveIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path d="M12 3v18m0-18-3 3m3-3 3 3m-3 15-3-3m3 3 3-3M3 12h18M3 12l3-3m-3 3 3 3m15-3-3-3m3 3-3 3" />
    </svg>
  );
}

function boundedPosition(value: number) {
  return Math.min(100, Math.max(0, Math.round(value)));
}

export function NexusMemberProfilePhoto({
  memberName,
  onChange,
  position,
  value,
}: NexusMemberProfilePhotoProps) {
  const dragOriginRef = useRef<{
    pointerId: number;
    position: NexusMemberAvatarPosition;
    x: number;
    y: number;
  } | null>(null);
  const [error, setError] = useState("");
  const [isFileDragging, setIsFileDragging] = useState(false);
  const [isPositioning, setIsPositioning] = useState(false);

  function readPhoto(file?: File) {
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
    reader.addEventListener("load", () => {
      if (typeof reader.result !== "string") {
        setError("Foto tidak dapat dibaca. Silakan pilih file lain.");
        return;
      }
      setError("");
      onChange({
        avatarSrc: reader.result,
        position: { ...DEFAULT_MEMBER_AVATAR_POSITION },
      });
    });
    reader.addEventListener("error", () => {
      setError("Foto tidak dapat dibaca. Silakan pilih file lain.");
    });
    reader.readAsDataURL(file);
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    readPhoto(event.currentTarget.files?.[0]);
    event.currentTarget.value = "";
  }

  function handleDrop(event: DragEvent<HTMLFieldSetElement>) {
    event.preventDefault();
    setIsFileDragging(false);
    readPhoto(event.dataTransfer.files[0]);
  }

  function updatePosition(nextPosition: NexusMemberAvatarPosition) {
    if (!value) return;
    onChange({
      avatarSrc: value,
      position: {
        x: boundedPosition(nextPosition.x),
        y: boundedPosition(nextPosition.y),
      },
    });
  }

  function startPositioning(event: ReactPointerEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragOriginRef.current = {
      pointerId: event.pointerId,
      position,
      x: event.clientX,
      y: event.clientY,
    };
    setIsPositioning(true);
  }

  function movePosition(event: ReactPointerEvent<HTMLButtonElement>) {
    const origin = dragOriginRef.current;
    if (!origin || origin.pointerId !== event.pointerId) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    updatePosition({
      x: origin.position.x - ((event.clientX - origin.x) / bounds.width) * 100,
      y: origin.position.y - ((event.clientY - origin.y) / bounds.height) * 100,
    });
  }

  function stopPositioning(event: ReactPointerEvent<HTMLButtonElement>) {
    if (dragOriginRef.current?.pointerId !== event.pointerId) return;
    dragOriginRef.current = null;
    setIsPositioning(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  return (
    <fieldset
      className={styles.profilePhotoField}
      data-dragging={isFileDragging || undefined}
      data-wide="true"
      onDragEnter={(event) => {
        event.preventDefault();
        setIsFileDragging(true);
      }}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsFileDragging(false);
        }
      }}
      onDragOver={(event) => event.preventDefault()}
      onDrop={handleDrop}
    >
      <legend className={styles.visuallyHidden}>Foto profil</legend>
      <div className={styles.profilePhotoPreview}>
        {value ? (
          <Image
            alt={`Pratinjau foto ${memberName.trim() || "anggota"}`}
            fill
            sizes="72px"
            src={value}
            style={{ objectPosition: `${position.x}% ${position.y}%` }}
            unoptimized={typeof value === "string" && value.startsWith("data:")}
          />
        ) : (
          <span
            aria-label={`Inisial ${memberName.trim() || "anggota"}`}
            role="img"
          >
            {personInitials(memberName.trim() || "Anggota")}
          </span>
        )}
      </div>

      <div className={styles.profilePhotoCopy}>
        <strong>Foto profil</strong>
        <p id="member-photo-help">
          Tarik foto ke area ini atau pilih file. JPG, PNG, atau WebP, maksimal
          2 MB.
        </p>
        {error ? (
          <p
            className={styles.profilePhotoError}
            id="member-photo-error"
            role="alert"
          >
            {error}
          </p>
        ) : null}
      </div>

      <div className={styles.profilePhotoActions}>
        <label className={styles.profilePhotoUploadButton}>
          <input
            accept={ACCEPTED_PROFILE_PHOTO_TYPES.join(",")}
            aria-describedby={`member-photo-help${error ? " member-photo-error" : ""}`}
            className={styles.profilePhotoInput}
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
                position: { ...DEFAULT_MEMBER_AVATAR_POSITION },
              });
            }}
            type="button"
          >
            Hapus
          </NexusWorkspaceButton>
        ) : null}
      </div>

      {value ? (
        <details className={styles.profilePhotoPosition}>
          <summary>
            <span>Atur posisi foto</span>
            <small>Seret foto di dalam bingkai</small>
          </summary>
          <div className={styles.profilePhotoPositionBody}>
            <button
              aria-describedby="member-photo-position-help"
              aria-label="Atur posisi foto"
              className={styles.profilePhotoCropViewport}
              data-positioning={isPositioning || undefined}
              onKeyDown={(event) => {
                const step = event.shiftKey ? 8 : 2;
                const nextPosition = { ...position };
                if (event.key === "ArrowLeft") nextPosition.x += step;
                else if (event.key === "ArrowRight") nextPosition.x -= step;
                else if (event.key === "ArrowUp") nextPosition.y += step;
                else if (event.key === "ArrowDown") nextPosition.y -= step;
                else return;
                event.preventDefault();
                updatePosition(nextPosition);
              }}
              onPointerCancel={stopPositioning}
              onPointerDown={startPositioning}
              onPointerMove={movePosition}
              onPointerUp={stopPositioning}
              type="button"
            >
              <Image
                alt=""
                fill
                sizes="192px"
                src={value}
                style={{ objectPosition: `${position.x}% ${position.y}%` }}
                unoptimized={
                  typeof value === "string" && value.startsWith("data:")
                }
              />
              <span aria-hidden="true" className={styles.profilePhotoCropHint}>
                <MoveIcon />
                Seret foto
              </span>
            </button>
            <div className={styles.profilePhotoCropHelp}>
              <strong>Posisikan wajah di tengah</strong>
              <p id="member-photo-position-help">
                Seret foto dengan mouse atau sentuhan. Gunakan tombol panah saat
                bingkai terfokus untuk penyesuaian kecil.
              </p>
              <NexusWorkspaceButton
                onClick={() =>
                  onChange({
                    avatarSrc: value,
                    position: { ...DEFAULT_MEMBER_AVATAR_POSITION },
                  })
                }
                type="button"
              >
                Pusatkan kembali
              </NexusWorkspaceButton>
            </div>
          </div>
        </details>
      ) : null}
    </fieldset>
  );
}
