"use client";

import { type FormEvent, useState } from "react";
import {
  nexusRoleAccessSummary,
  nexusRoleHasUsableBaseline,
  resolveNexusRole,
} from "@/components/nexus-access-policy/nexus-access-policy";
import styles from "@/components/nexus-administration/nexus-administration.module.css";
import type {
  NexusAdministrationAccount,
  NexusAdministrationRole,
} from "@/components/nexus-administration/nexus-administration-content";
import { NexusWorkspaceConfirmDialog } from "@/components/nexus-workspace-ui/nexus-workspace-confirm-dialog";
import { NexusWorkspaceDrawer } from "@/components/nexus-workspace-ui/nexus-workspace-drawer";
import {
  NexusWorkspaceButton,
  NexusWorkspaceNotice,
} from "@/components/nexus-workspace-ui/nexus-workspace-elements";
import { NexusWorkspaceFormField } from "@/components/nexus-workspace-ui/nexus-workspace-form-field";
import { useNexusWorkspaceUnsavedChanges } from "@/components/nexus-workspace-ui/nexus-workspace-unsaved-changes";

type NexusAdministrationAccessDrawerProps = {
  account: NexusAdministrationAccount;
  allRoles: readonly NexusAdministrationRole[];
  onClose: () => void;
  onSave: (roleId: string) => void;
  roles: readonly NexusAdministrationRole[];
  specialAccessCount: number;
};

export function NexusAdministrationAccessDrawer({
  account,
  allRoles,
  onClose,
  onSave,
  roles,
  specialAccessCount,
}: NexusAdministrationAccessDrawerProps) {
  const initialRole = resolveNexusRole(account.roleId, allRoles);
  const roleIsAssignable =
    initialRole.kind === "KNOWN" &&
    roles.some((role) => role.id === initialRole.role.id);
  const [roleId, setRoleId] = useState(
    roleIsAssignable && initialRole.kind === "KNOWN" ? initialRole.role.id : "",
  );
  const [isDiscardConfirmationOpen, setIsDiscardConfirmationOpen] =
    useState(false);
  const [error, setError] = useState("");
  const selectedRole = roles.find((role) => role.id === roleId);
  const roleWillChange = Boolean(
    selectedRole &&
      (initialRole.kind !== "KNOWN" || selectedRole.id !== initialRole.role.id),
  );
  const initialRoleId =
    roleIsAssignable && initialRole.kind === "KNOWN" ? initialRole.role.id : "";
  const isDirty = roleId !== initialRoleId;

  useNexusWorkspaceUnsavedChanges({
    confirmLabel: "Buang dan keluar",
    description:
      "Peran yang baru dipilih belum disimpan dan akan hilang jika Anda meninggalkan halaman ini.",
    isDirty,
    title: "Buang perubahan peran akun?",
  });

  function requestClose() {
    if (isDirty) {
      setIsDiscardConfirmationOpen(true);
      return;
    }
    onClose();
  }

  function submitAccess(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedRole) {
      setError("Pilih peran yang masih berlaku untuk akun ini.");
      return;
    }
    try {
      onSave(selectedRole.id);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Peran akun tidak dapat disimpan.",
      );
    }
  }

  return (
    <>
      <NexusWorkspaceDrawer
        closeLabel="Tutup perubahan akses"
        description="Tetapkan satu peran utama sesuai kebutuhan kerja pengguna."
        eyebrow="Peran & Hak Akses"
        onClose={requestClose}
        title={`Ubah akses · ${account.displayName}`}
      >
        <form className={styles.accessForm} noValidate onSubmit={submitAccess}>
          {initialRole.kind === "UNASSIGNED" ? (
            <NexusWorkspaceNotice tone="danger">
              Akun ini belum memiliki peran. Pilih peran aktif sebelum menyimpan
              perubahan akses.
            </NexusWorkspaceNotice>
          ) : initialRole.kind === "UNKNOWN" ? (
            <NexusWorkspaceNotice tone="danger">
              Peran yang tersimpan tidak lagi dikenali. Pilih peran yang masih
              berlaku sebelum menyimpan perubahan.
            </NexusWorkspaceNotice>
          ) : initialRole.kind === "KNOWN" && !roleIsAssignable ? (
            <NexusWorkspaceNotice tone="danger">
              Peran {initialRole.role.label} sudah dinonaktifkan dan tidak dapat
              dipakai lagi. Pilih peran aktif untuk akun ini.
            </NexusWorkspaceNotice>
          ) : (
            <NexusWorkspaceNotice>
              Mengubah peran tidak mengubah identitas anggota dan tidak dapat
              mengubah email akun.
            </NexusWorkspaceNotice>
          )}

          <NexusWorkspaceFormField
            error={error}
            id="administration-edit-role"
            label="Peran"
            name="roleId"
            onChange={(event) => {
              setRoleId(event.currentTarget.value);
              setError("");
            }}
            options={roles.map((role) => ({
              label: role.label,
              value: role.id,
            }))}
            required
            type="select"
            value={roleId}
            wide
          />

          {selectedRole ? (
            <section className={styles.rolePreview}>
              <span>Cakupan peran</span>
              <h3>{selectedRole.label}</h3>
              <p>{selectedRole.description}</p>
              <ul>
                {nexusRoleAccessSummary(selectedRole).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          ) : null}

          {specialAccessCount > 0 ? (
            <NexusWorkspaceNotice tone={roleWillChange ? "danger" : "info"}>
              Akun ini memiliki {specialAccessCount} penyesuaian akses khusus.
              Penyesuaian tetap tersimpan
              {roleWillChange
                ? " dan dihitung ulang terhadap peran yang baru."
                : nexusRoleHasUsableBaseline(initialRole)
                  ? " dan tetap dihitung terhadap peran ini."
                  : " dan akan dihitung kembali setelah peran aktif dipilih."}
            </NexusWorkspaceNotice>
          ) : null}

          <footer className={styles.drawerFooter}>
            <NexusWorkspaceButton onClick={requestClose} type="button">
              Batal
            </NexusWorkspaceButton>
            <NexusWorkspaceButton tone="primary" type="submit">
              Simpan perubahan
            </NexusWorkspaceButton>
          </footer>
        </form>
      </NexusWorkspaceDrawer>

      {isDiscardConfirmationOpen ? (
        <NexusWorkspaceConfirmDialog
          cancelLabel="Lanjutkan menyunting"
          confirmLabel="Buang perubahan"
          description="Peran yang baru dipilih belum disimpan dan akan dikembalikan ke pilihan semula."
          onCancel={() => setIsDiscardConfirmationOpen(false)}
          onConfirm={() => {
            setIsDiscardConfirmationOpen(false);
            onClose();
          }}
          title="Buang perubahan peran akun?"
          tone="warning"
        />
      ) : null}
    </>
  );
}
