"use client";

import { type FormEvent, useState } from "react";
import type { NexusRoleRecord } from "@/components/nexus-access-policy/nexus-access-policy";
import type { NexusRoleDraftInput } from "@/components/nexus-access-policy/nexus-access-policy-session";
import styles from "@/components/nexus-access-policy/nexus-role-management.module.css";
import { NexusWorkspaceConfirmDialog } from "@/components/nexus-workspace-ui/nexus-workspace-confirm-dialog";
import { NexusWorkspaceDrawer } from "@/components/nexus-workspace-ui/nexus-workspace-drawer";
import {
  NexusWorkspaceButton,
  NexusWorkspaceNotice,
} from "@/components/nexus-workspace-ui/nexus-workspace-elements";
import { NexusWorkspaceFormField } from "@/components/nexus-workspace-ui/nexus-workspace-form-field";
import { useNexusWorkspaceUnsavedChanges } from "@/components/nexus-workspace-ui/nexus-workspace-unsaved-changes";

type NexusRoleFormDrawerProps = {
  duplicateSource?: NexusRoleRecord;
  onClose: () => void;
  onSubmit: (input: NexusRoleDraftInput) => void;
  roles: readonly NexusRoleRecord[];
};

type RoleDraft = {
  copyFromRoleId: string;
  description: string;
  label: string;
};

const BLANK_SOURCE = "blank";

export function NexusRoleFormDrawer({
  duplicateSource,
  onClose,
  onSubmit,
  roles,
}: NexusRoleFormDrawerProps) {
  const startingDraft: RoleDraft = duplicateSource
    ? {
        copyFromRoleId: duplicateSource.id,
        description: duplicateSource.description,
        label: `${duplicateSource.label} (salinan)`,
      }
    : { copyFromRoleId: BLANK_SOURCE, description: "", label: "" };
  const [draft, setDraft] = useState(startingDraft);
  const [error, setError] = useState("");
  const [discardConfirmationOpen, setDiscardConfirmationOpen] = useState(false);
  const draftIsDirty = (Object.keys(startingDraft) as (keyof RoleDraft)[]).some(
    (field) => draft[field] !== startingDraft[field],
  );
  const sourceRole = roles.find((role) => role.id === draft.copyFromRoleId);

  useNexusWorkspaceUnsavedChanges({
    confirmLabel: "Buang dan keluar",
    description: duplicateSource
      ? "Isian duplikasi peran belum disimpan dan akan hilang jika Anda meninggalkan halaman ini."
      : "Isian peran baru belum disimpan dan akan hilang jika Anda meninggalkan halaman ini.",
    isDirty: draftIsDirty,
    title: duplicateSource
      ? "Buang isian duplikasi peran?"
      : "Buang isian peran baru?",
  });

  function requestClose() {
    if (draftIsDirty) {
      setDiscardConfirmationOpen(true);
      return;
    }
    onClose();
  }

  function submitRole(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      onSubmit({
        ...(sourceRole ? { copyFromRoleId: sourceRole.id } : {}),
        description: draft.description,
        label: draft.label,
      });
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Peran tidak dapat disimpan.",
      );
    }
  }

  return (
    <>
      <NexusWorkspaceDrawer
        closeLabel={
          duplicateSource ? "Tutup duplikasi peran" : "Tutup tambah peran"
        }
        description={
          duplicateSource
            ? "Salinan memakai hak akses bawaan peran sumber. Pengguna, akses khusus, dan riwayat tidak ikut disalin."
            : "Peran baru menampung hak akses bawaan yang dapat disetel setelah peran dibuat."
        }
        eyebrow="Peran & Hak Akses"
        onClose={requestClose}
        title={duplicateSource ? "Duplikasi peran" : "Tambah peran"}
      >
        <form className={styles.roleForm} noValidate onSubmit={submitRole}>
          {duplicateSource ? (
            <NexusWorkspaceNotice>
              Salinan dari peran {duplicateSource.label}. Beri nama yang berbeda
              supaya kedua peran mudah dibedakan.
            </NexusWorkspaceNotice>
          ) : null}

          <NexusWorkspaceFormField
            error={error}
            hint="Nama peran tampil pada daftar akun dan pilihan undangan."
            id="role-form-label"
            label="Nama peran"
            name="label"
            onChange={(event) => {
              const label = event.currentTarget.value;
              setDraft((current) => ({ ...current, label }));
              setError("");
            }}
            placeholder="Contoh: Operator Data"
            required
            type="text"
            value={draft.label}
            wide
          />

          <NexusWorkspaceFormField
            hint="Jelaskan tanggung jawab peran ini dalam satu kalimat."
            id="role-form-description"
            label="Deskripsi"
            name="description"
            onChange={(event) => {
              const description = event.currentTarget.value;
              setDraft((current) => ({ ...current, description }));
            }}
            placeholder="Contoh: Mengelola kandidat data dan melengkapi metadata."
            type="textarea"
            value={draft.description}
            wide
          />

          {duplicateSource ? null : (
            <NexusWorkspaceFormField
              hint="Hak akses bawaan tetap dapat disetel setelah peran dibuat."
              id="role-form-source"
              label="Mulai dari"
              name="copyFromRoleId"
              onChange={(event) => {
                const copyFromRoleId = event.currentTarget.value;
                setDraft((current) => ({ ...current, copyFromRoleId }));
              }}
              options={[
                { label: "Peran kosong", value: BLANK_SOURCE },
                ...roles.map((role) => ({
                  label: `Salin hak akses dari ${role.label}`,
                  value: role.id,
                })),
              ]}
              type="select"
              value={draft.copyFromRoleId}
              wide
            />
          )}

          <footer className={styles.drawerFooter}>
            <NexusWorkspaceButton onClick={requestClose} type="button">
              Batal
            </NexusWorkspaceButton>
            <NexusWorkspaceButton tone="primary" type="submit">
              {duplicateSource ? "Duplikasi peran" : "Tambah peran"}
            </NexusWorkspaceButton>
          </footer>
        </form>
      </NexusWorkspaceDrawer>

      {discardConfirmationOpen ? (
        <NexusWorkspaceConfirmDialog
          cancelLabel="Lanjutkan mengisi"
          confirmLabel="Buang isian"
          description="Isian peran yang belum disimpan akan dihapus."
          onCancel={() => setDiscardConfirmationOpen(false)}
          onConfirm={() => {
            setDiscardConfirmationOpen(false);
            onClose();
          }}
          title="Buang isian peran?"
          tone="warning"
        />
      ) : null}
    </>
  );
}
