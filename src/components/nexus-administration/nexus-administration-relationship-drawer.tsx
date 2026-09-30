"use client";

import { type FormEvent, useMemo, useState } from "react";
import styles from "@/components/nexus-administration/nexus-administration.module.css";
import type {
  NexusAccountMemberRelationship,
  NexusAdministrationMemberOption,
} from "@/components/nexus-administration/nexus-administration-content";
import type { NexusResolvedAdministrationRelationship } from "@/components/nexus-administration/nexus-administration-relationship";
import { NexusWorkspaceConfirmDialog } from "@/components/nexus-workspace-ui/nexus-workspace-confirm-dialog";
import { NexusWorkspaceDrawer } from "@/components/nexus-workspace-ui/nexus-workspace-drawer";
import {
  NexusWorkspaceButton,
  NexusWorkspaceNotice,
} from "@/components/nexus-workspace-ui/nexus-workspace-elements";
import { NexusWorkspaceFormField } from "@/components/nexus-workspace-ui/nexus-workspace-form-field";
import { useNexusWorkspaceUnsavedChanges } from "@/components/nexus-workspace-ui/nexus-workspace-unsaved-changes";

type RelationshipChoice = "" | "linked" | "non-member";

type NexusAdministrationRelationshipDrawerProps = {
  availableMembers: readonly NexusAdministrationMemberOption[];
  /** Direktori Anggota terbaca, sehingga akun dapat ditautkan ke anggota. */
  membersReadable?: boolean;
  onClose: () => void;
  onSave: (
    relationship: NexusAccountMemberRelationship,
  ) => Promise<void> | void;
  personName: string;
  relationship: NexusResolvedAdministrationRelationship;
};

export function NexusAdministrationRelationshipDrawer({
  availableMembers,
  membersReadable = true,
  onClose,
  onSave,
  personName,
  relationship,
}: NexusAdministrationRelationshipDrawerProps) {
  const initialDraft = useMemo(
    () => ({
      choice:
        relationship.kind === "LINKED"
          ? ("linked" as const)
          : relationship.kind === "NON_MEMBER"
            ? ("non-member" as const)
            : ("" as const),
      memberId: relationship.kind === "LINKED" ? relationship.member.id : "",
    }),
    [relationship],
  );
  const [choice, setChoice] = useState<RelationshipChoice>(initialDraft.choice);
  const [memberId, setMemberId] = useState(initialDraft.memberId);
  const [error, setError] = useState("");
  const [discardConfirmationOpen, setDiscardConfirmationOpen] = useState(false);
  const [pendingRelationship, setPendingRelationship] =
    useState<NexusAccountMemberRelationship | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const draftIsDirty =
    choice !== initialDraft.choice || memberId !== initialDraft.memberId;
  const selectedMember = availableMembers.find(
    (member) => member.id === memberId,
  );

  useNexusWorkspaceUnsavedChanges({
    confirmLabel: "Buang dan keluar",
    description:
      "Pilihan hubungan akun yang belum disimpan akan hilang jika Anda meninggalkan halaman ini.",
    isDirty: draftIsDirty,
    title: "Buang perubahan hubungan?",
  });

  function requestClose() {
    if (draftIsDirty) {
      setDiscardConfirmationOpen(true);
      return;
    }
    onClose();
  }

  function submitRelationship(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!choice) {
      setError("Pilih hubungan akun yang benar.");
      return;
    }
    if (choice === "linked" && !selectedMember) {
      setError("Pilih anggota yang ingin ditautkan.");
      return;
    }
    setError("");
    setPendingRelationship(
      choice === "linked" && selectedMember
        ? { kind: "LINKED", memberId: selectedMember.id }
        : { kind: "NON_MEMBER" },
    );
  }

  return (
    <>
      <NexusWorkspaceDrawer
        closeLabel="Tutup perubahan hubungan anggota"
        description="Tentukan apakah akun ditautkan ke satu profil anggota atau memang digunakan sebagai akun non-anggota."
        eyebrow="Hubungan Anggota"
        onClose={requestClose}
        title={`Kelola hubungan · ${personName}`}
      >
        <form
          className={styles.accessForm}
          noValidate
          onSubmit={submitRelationship}
        >
          {relationship.kind === "CONFLICT" ? (
            <NexusWorkspaceNotice tone="danger">
              {relationship.conflictingAccountId
                ? `Hubungan bertentangan dengan akun ${relationship.conflictingAccountId}. Pilih hubungan yang benar untuk menyelesaikannya.`
                : "Catatan hubungan akun belum konsisten. Pilih hubungan yang benar untuk menyelesaikannya."}
            </NexusWorkspaceNotice>
          ) : (
            <NexusWorkspaceNotice>
              Perubahan ini tidak mengubah identitas akun, email untuk masuk,
              atau profil anggota.
            </NexusWorkspaceNotice>
          )}

          <NexusWorkspaceNotice>
            Informasi pribadi milik akun tetap tersimpan tanpa disalin atau
            dihapus. Saat akun terhubung, bidang yang beririsan mengikuti profil
            anggota; data akun dipakai kembali bila hubungan non-anggota
            ditetapkan.
          </NexusWorkspaceNotice>

          <fieldset className={styles.relationshipChoices}>
            <legend>Hubungan akun</legend>
            <label
              data-disabled={!membersReadable || undefined}
              data-selected={choice === "linked" || undefined}
            >
              <input
                checked={choice === "linked"}
                disabled={!membersReadable}
                name="relationshipChoice"
                onChange={() => {
                  setChoice("linked");
                  setError("");
                }}
                type="radio"
                value="linked"
              />
              <span>
                <strong>Hubungkan ke anggota</strong>
                <small>
                  Pilih satu profil anggota yang belum memiliki akun.
                </small>
              </span>
            </label>
            <label data-selected={choice === "non-member" || undefined}>
              <input
                checked={choice === "non-member"}
                name="relationshipChoice"
                onChange={() => {
                  setChoice("non-member");
                  setMemberId("");
                  setError("");
                }}
                type="radio"
                value="non-member"
              />
              <span>
                <strong>Tetapkan sebagai akun non-anggota</strong>
                <small>
                  Gunakan hanya ketika pemilik akun memang bukan anggota CoE
                  BHT.
                </small>
              </span>
            </label>
          </fieldset>

          {membersReadable ? null : (
            <NexusWorkspaceNotice>
              Akun Anda belum berwenang membaca direktori Anggota, sehingga akun
              ini belum dapat ditautkan ke anggota dari sini.
            </NexusWorkspaceNotice>
          )}

          {choice === "linked" && membersReadable ? (
            <NexusWorkspaceFormField
              error={error}
              hint="Satu profil anggota hanya dapat mempunyai satu hubungan akun."
              id="administration-relationship-member"
              label="Anggota"
              name="memberId"
              onChange={(event) => {
                setMemberId(event.currentTarget.value);
                setError("");
              }}
              options={availableMembers.map((member) => ({
                label: `${member.name} — ${member.id}`,
                value: member.id,
              }))}
              required
              type="select"
              value={memberId}
              wide
            />
          ) : error ? (
            <NexusWorkspaceNotice tone="danger">{error}</NexusWorkspaceNotice>
          ) : null}

          <footer className={styles.drawerFooter}>
            <NexusWorkspaceButton
              disabled={isSaving}
              onClick={requestClose}
              type="button"
            >
              Batal
            </NexusWorkspaceButton>
            <NexusWorkspaceButton
              disabled={isSaving}
              tone="primary"
              type="submit"
            >
              {isSaving ? "Menyimpan…" : "Tinjau perubahan"}
            </NexusWorkspaceButton>
          </footer>
        </form>
      </NexusWorkspaceDrawer>

      {pendingRelationship ? (
        <NexusWorkspaceConfirmDialog
          cancelLabel="Kembali"
          confirmLabel="Simpan hubungan"
          description={
            pendingRelationship.kind === "LINKED" && selectedMember
              ? `${personName} akan ditautkan ke ${selectedMember.name}.`
              : `${personName} akan ditetapkan sebagai akun non-anggota.`
          }
          onCancel={() => setPendingRelationship(null)}
          onConfirm={() => {
            const relationshipToSave = pendingRelationship;
            setPendingRelationship(null);
            setIsSaving(true);
            Promise.resolve()
              .then(() => onSave(relationshipToSave))
              .catch((caughtError: unknown) => {
                setError(
                  caughtError instanceof Error
                    ? caughtError.message
                    : "Hubungan akun tidak dapat disimpan.",
                );
                setIsSaving(false);
              });
          }}
          title="Simpan perubahan hubungan?"
          tone="warning"
        />
      ) : null}

      {discardConfirmationOpen ? (
        <NexusWorkspaceConfirmDialog
          cancelLabel="Lanjutkan mengisi"
          confirmLabel="Buang perubahan"
          description="Pilihan hubungan akun yang belum disimpan akan hilang."
          onCancel={() => setDiscardConfirmationOpen(false)}
          onConfirm={onClose}
          title="Buang perubahan hubungan?"
        />
      ) : null}
    </>
  );
}
