"use client";

import Cropper, { type Area, type Point } from "react-easy-crop";
import "react-easy-crop/react-easy-crop.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { cropMemberAvatar } from "@/components/nexus-members/nexus-member-photo-crop";
import styles from "@/components/nexus-members/nexus-member-profile-photo.module.css";
import { NexusWorkspaceButton } from "@/components/nexus-workspace-ui/nexus-workspace-elements";

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.1;

type NexusMemberPhotoEditorProps = {
  imageSrc: string;
  memberName: string;
  onApply: (croppedImage: string) => void;
  onCancel: () => void;
};

function CloseIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

function MinusIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path d="M5 12h14" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function RotateIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path d="M4.5 9A8 8 0 1 1 4 14" />
      <path d="M4.5 4.5V9H9" />
    </svg>
  );
}

function ResetIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path d="M5 7v4h4" />
      <path d="M6.3 16.7A8 8 0 1 0 5.2 8.5L5 11" />
    </svg>
  );
}

function boundedZoom(value: number) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));
}

export function NexusMemberPhotoEditor({
  imageSrc,
  memberName,
  onApply,
  onCancel,
}: NexusMemberPhotoEditorProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area>();
  const [error, setError] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(MIN_ZOOM);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
    };
  }, []);

  const handleCropComplete = useCallback(
    (_croppedArea: Area, nextCroppedAreaPixels: Area) => {
      setCroppedAreaPixels(nextCroppedAreaPixels);
    },
    [],
  );

  function closeEditor() {
    if (!isApplying) onCancel();
  }

  function resetEditor() {
    setCrop({ x: 0, y: 0 });
    setRotation(0);
    setZoom(MIN_ZOOM);
    setError("");
  }

  async function applyPhoto() {
    if (!croppedAreaPixels || isApplying) return;
    setError("");
    setIsApplying(true);

    try {
      const croppedImage = await cropMemberAvatar({
        crop: croppedAreaPixels,
        imageSrc,
        rotation,
      });
      onApply(croppedImage);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Foto tidak dapat diterapkan. Silakan coba lagi.",
      );
      setIsApplying(false);
    }
  }

  return (
    <dialog
      aria-describedby="member-photo-editor-description"
      aria-labelledby="member-photo-editor-title"
      className={styles.editorDialog}
      onCancel={(event) => {
        event.preventDefault();
        closeEditor();
      }}
      ref={dialogRef}
    >
      <div className={styles.editorShell}>
        <header className={styles.editorHeader}>
          <div>
            <p>FOTO PROFIL ANGGOTA</p>
            <h2 id="member-photo-editor-title">Atur foto profil</h2>
            <span id="member-photo-editor-description">
              Geser dan perbesar foto hingga wajah terlihat jelas di dalam
              bingkai.
            </span>
          </div>
          <button
            aria-label="Tutup editor foto"
            className={styles.editorCloseButton}
            disabled={isApplying}
            onClick={closeEditor}
            type="button"
          >
            <CloseIcon />
          </button>
        </header>

        <div className={styles.cropStage}>
          <Cropper
            aspect={1}
            classes={{
              containerClassName: styles.cropperContainer,
              cropAreaClassName: styles.cropperArea,
              mediaClassName: styles.cropperMedia,
            }}
            crop={crop}
            cropShape="round"
            cropperProps={{
              "aria-label": `Atur posisi foto ${memberName.trim() || "anggota"}`,
            }}
            disableAutomaticStylesInjection
            image={imageSrc}
            keyboardStep={3}
            maxZoom={MAX_ZOOM}
            mediaProps={{ alt: "" }}
            minZoom={MIN_ZOOM}
            objectFit="contain"
            onCropChange={setCrop}
            onCropComplete={handleCropComplete}
            onZoomChange={setZoom}
            rotation={rotation}
            showGrid={false}
            zoom={zoom}
            zoomSpeed={0.2}
          />
          <p className={styles.cropStageHint}>
            Seret foto untuk mengatur posisi
          </p>
        </div>

        <section aria-label="Pengaturan foto" className={styles.editorControls}>
          <div className={styles.zoomControl}>
            <span>Perbesar foto</span>
            <div>
              <button
                aria-label="Perkecil foto"
                disabled={isApplying || zoom <= MIN_ZOOM}
                onClick={() =>
                  setZoom((current) => boundedZoom(current - ZOOM_STEP))
                }
                type="button"
              >
                <MinusIcon />
              </button>
              <input
                aria-label="Tingkat pembesaran foto"
                disabled={isApplying}
                max={MAX_ZOOM}
                min={MIN_ZOOM}
                onChange={(event) => setZoom(Number(event.currentTarget.value))}
                step="0.05"
                type="range"
                value={zoom}
              />
              <button
                aria-label="Perbesar foto"
                disabled={isApplying || zoom >= MAX_ZOOM}
                onClick={() =>
                  setZoom((current) => boundedZoom(current + ZOOM_STEP))
                }
                type="button"
              >
                <PlusIcon />
              </button>
              <output aria-live="polite">{Math.round(zoom * 100)}%</output>
            </div>
          </div>

          <div className={styles.editorToolButtons}>
            <button
              disabled={isApplying}
              onClick={() => setRotation((current) => (current + 90) % 360)}
              type="button"
            >
              <RotateIcon />
              Putar 90°
            </button>
            <button disabled={isApplying} onClick={resetEditor} type="button">
              <ResetIcon />
              Atur ulang
            </button>
          </div>
        </section>

        {error ? (
          <p className={styles.editorError} role="alert">
            {error}
          </p>
        ) : null}

        <footer className={styles.editorFooter}>
          <p>Hasil foto akan digunakan pada direktori dan profil anggota.</p>
          <div>
            <NexusWorkspaceButton
              disabled={isApplying}
              onClick={closeEditor}
              type="button"
            >
              Batal
            </NexusWorkspaceButton>
            <NexusWorkspaceButton
              disabled={!croppedAreaPixels || isApplying}
              onClick={applyPhoto}
              tone="primary"
              type="button"
            >
              {isApplying ? "Menyiapkan foto..." : "Terapkan foto"}
            </NexusWorkspaceButton>
          </div>
        </footer>
      </div>
    </dialog>
  );
}
