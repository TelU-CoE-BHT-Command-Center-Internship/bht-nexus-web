"use client";

import { type FormEvent, useState } from "react";
import {
  nexusRoleAccessSummary,
  resolveNexusRole,
} from "@/components/nexus-access-policy/nexus-access-policy";
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
  const [error, setError] = useState("");
  const selectedRole = roles.find((role) => role.id === roleId);
  const roleWillChange = Boolean(
    selectedRole &&
      (initialRole.kind !== "KNOWN" || selectedRole.id !== initialRole.role.id),
  );

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
    <NexusWorkspaceDrawer
      closeLabel="Tutup perubahan akses"
      description="Tetapkan satu peran utama sesuai kebutuhan kerja pengguna."
      eyebrow="Peran & Hak Akses"
      onClose={onClose}
      title={`Ubah akses · ${account.displayName}`}
    >
      <form className={styles.accessForm} noValidate onSubmit={submitAccess}>
        {initialRole.kind === "UNKNOWN" ? (
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
              : " dan tetap dihitung terhadap peran ini."}
          </NexusWorkspaceNotice>
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
