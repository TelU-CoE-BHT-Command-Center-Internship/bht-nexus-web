"use client";

import { type FormEvent, useState } from "react";
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
  const [roleId, setRoleId] = useState(account.roleId ?? "");
  const [error, setError] = useState("");
  const selectedRole = roles.find((role) => role.id === roleId);

  function submitAccess(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!roleId) {
      setError("Pilih role untuk akun ini.");
      return;
    }
    onSave(roleId);
  }

  return (
    <NexusWorkspaceDrawer
      closeLabel="Tutup perubahan akses"
      description="Tetapkan satu role tingkat tinggi. Permission dan data scope tetap dihitung serta ditegakkan oleh server."
      eyebrow="Role & Akses"
      onClose={onClose}
      title={`Ubah akses · ${account.displayName}`}
    >
      <form className={styles.accessForm} noValidate onSubmit={submitAccess}>
        <NexusWorkspaceNotice>
          Mengubah role tidak mengubah identitas anggota dan tidak dapat
          mengubah email akun.
        </NexusWorkspaceNotice>

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
