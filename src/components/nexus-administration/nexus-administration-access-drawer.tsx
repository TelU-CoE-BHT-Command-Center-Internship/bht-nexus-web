"use client";

import { type FormEvent, useState } from "react";
import { resolveNexusAccountRole } from "@/components/nexus-accounts/nexus-account-directory";
import styles from "@/components/nexus-administration/nexus-administration.module.css";
import type {
  NexusAdministrationAccount,
  NexusAdministrationRole,
} from "@/components/nexus-administration/nexus-administration-content";
import { NexusWorkspaceDrawer } from "@/components/nexus-workspace-ui/nexus-workspace-drawer";
import {
  NexusWorkspaceButton,
  NexusWorkspaceNotice,
} from "@/components/nexus-workspace-ui/nexus-workspace-elements";
import { NexusWorkspaceFormField } from "@/components/nexus-workspace-ui/nexus-workspace-form-field";

type NexusAdministrationAccessDrawerProps = {
  account: NexusAdministrationAccount;
  onClose: () => void;
  onSave: (roleId: string) => void;
  roles: readonly NexusAdministrationRole[];
};

export function NexusAdministrationAccessDrawer({
  account,
  onClose,
  onSave,
  roles,
}: NexusAdministrationAccessDrawerProps) {
  const initialRole = resolveNexusAccountRole(account.roleId, roles);
  const [roleId, setRoleId] = useState(
    initialRole.kind === "KNOWN" ? initialRole.role.id : "",
  );
  const [error, setError] = useState("");
  const selectedRole = roles.find((role) => role.id === roleId);

  function submitAccess(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedRole) {
      setError("Pilih role yang masih berlaku untuk akun ini.");
      return;
    }
    try {
      onSave(selectedRole.id);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Role akun tidak dapat disimpan.",
      );
    }
  }

  return (
    <NexusWorkspaceDrawer
      closeLabel="Tutup perubahan akses"
      description="Tetapkan satu peran utama sesuai kebutuhan kerja pengguna."
      eyebrow="Role & Akses"
      onClose={onClose}
      title={`Ubah akses · ${account.displayName}`}
    >
      <form className={styles.accessForm} noValidate onSubmit={submitAccess}>
        {initialRole.kind === "UNKNOWN" ? (
          <NexusWorkspaceNotice tone="danger">
            Role yang tersimpan tidak lagi dikenali. Pilih role yang masih
            berlaku sebelum menyimpan perubahan.
          </NexusWorkspaceNotice>
        ) : (
          <NexusWorkspaceNotice>
            Mengubah role tidak mengubah identitas anggota dan tidak dapat
            mengubah email akun.
          </NexusWorkspaceNotice>
        )}

        <NexusWorkspaceFormField
          error={error}
          id="administration-edit-role"
          label="Role"
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
            <span>Ringkasan role</span>
            <h3>{selectedRole.label}</h3>
            <p>{selectedRole.description}</p>
            <ul>
              {selectedRole.accessSummary.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ) : null}

        <footer className={styles.drawerFooter}>
          <NexusWorkspaceButton onClick={onClose} type="button">
            Batal
          </NexusWorkspaceButton>
          <NexusWorkspaceButton tone="primary" type="submit">
            Simpan perubahan
          </NexusWorkspaceButton>
        </footer>
      </form>
    </NexusWorkspaceDrawer>
  );
}
