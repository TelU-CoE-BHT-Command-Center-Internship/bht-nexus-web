"use client";

import { type FormEvent, useState } from "react";
import {
  accountStatusLabels,
  MemberAvatar,
} from "@/components/nexus-members/nexus-member-ui";
import styles from "@/components/nexus-members/nexus-members.module.css";
import type {
  NexusMemberAccount,
  NexusMemberRecord,
  NexusMemberUnlinkedAccount,
} from "@/components/nexus-members/nexus-members-content";
import { statusLabels } from "@/components/nexus-members/nexus-members-model";
import { NexusWorkspaceDrawer } from "@/components/nexus-workspace-ui/nexus-workspace-drawer";
import { NexusWorkspaceButton } from "@/components/nexus-workspace-ui/nexus-workspace-elements";
import { NexusWorkspaceFormField } from "@/components/nexus-workspace-ui/nexus-workspace-form-field";

type AccessOutcome =
  | { account: NexusMemberUnlinkedAccount; kind: "existing_unlinked" }
  | { kind: "linked_elsewhere"; member: NexusMemberRecord }
  | { email: string; kind: "new_account" };

type AccessDrawerProps = {
  member: NexusMemberRecord;
  onClose: () => void;
  onConnect: (account: NexusMemberAccount, announcement: string) => void;
  records: readonly NexusMemberRecord[];
  unlinkedAccounts: readonly NexusMemberUnlinkedAccount[];
};

function normalizedEmail(value: string) {
  return value.trim().toLocaleLowerCase("id-ID");
}

export function NexusMemberAccessDrawer({
  member,
  onClose,
  onConnect,
  records,
  unlinkedAccounts,
}: AccessDrawerProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [outcome, setOutcome] = useState<AccessOutcome | null>(null);

  function inspectAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = normalizedEmail(email);
    if (!normalized || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      setError(
        normalized
          ? "Gunakan alamat email yang valid."
          : "Email untuk masuk wajib diisi.",
      );
      return;
    }

    const linkedMember = records.find(
      (record) => normalizedEmail(record.account?.email ?? "") === normalized,
    );
    if (linkedMember) {
      setOutcome({ kind: "linked_elsewhere", member: linkedMember });
      return;
    }

    const unlinkedAccount = unlinkedAccounts.find(
      (account) => normalizedEmail(account.email) === normalized,
    );
    if (unlinkedAccount) {
      setOutcome({ account: unlinkedAccount, kind: "existing_unlinked" });
      return;
    }

    setOutcome({ email: normalized, kind: "new_account" });
  }

  function resetEmail() {
    setEmail("");
    setError("");
    setOutcome(null);
  }

  return (
    <NexusWorkspaceDrawer
      closeLabel="Tutup pemberian akses"
      description="Periksa akun terlebih dahulu, lalu hubungkan akun yang tepat ke profil anggota ini."
      eyebrow="Akses BHT Nexus"
      onClose={onClose}
      title={`Beri akses · ${member.identity.preferredName}`}
    >
      <form className={styles.drawerForm} noValidate onSubmit={inspectAccount}>
        <section className={styles.drawerSection}>
          <div>
            <span>01</span>
            <h3>Profil yang dipilih</h3>
            <p>Akun akan dihubungkan setelah pilihan ini dikonfirmasi.</p>
          </div>
          <div className={styles.linkedMemberCard}>
            <MemberAvatar member={member} />
            <span>
              <strong>{member.name}</strong>
              <small>{member.coeAssignment}</small>
              <small>
                Status anggota: {statusLabels[member.membership.status]}
              </small>
            </span>
          </div>
        </section>

        <section className={styles.drawerSection}>
          <div>
            <span>02</span>
            <h3>Periksa akun</h3>
            <p>
              Email dipakai untuk menemukan atau mengundang akun, bukan untuk
              menebak siapa pemilik profil anggota.
            </p>
          </div>
          <div className={styles.formGrid}>
            <NexusWorkspaceFormField
              error={error}
              hint="Gunakan alamat yang akan dipakai untuk masuk ke BHT Nexus."
              id="member-access-email"
              label="Email untuk masuk"
              name="email"
              onChange={(event) => {
                setEmail(event.currentTarget.value);
                setError("");
                setOutcome(null);
              }}
              placeholder="nama@telkomuniversity.ac.id"
              required
              type="email"
              value={email}
              wide
            />

            {outcome?.kind === "existing_unlinked" ? (
              <div className={styles.accountBoundary} data-tone="positive">
                <strong>Akun sudah ada dan belum terhubung</strong>
                <p>
                  {outcome.account.name} · {outcome.account.email}
                </p>
                <p>
                  Status {accountStatusLabels[outcome.account.status]}; role{" "}
                  {outcome.account.roleLabels.join(", ") || "belum ditetapkan"}.
                </p>
              </div>
            ) : null}

            {outcome?.kind === "linked_elsewhere" ? (
              <div className={styles.accountBoundary} data-tone="danger">
                <strong>Akun sudah terhubung ke anggota lain</strong>
                <p>
                  Email ini tercatat pada profil {outcome.member.name} —
                  hubungan tersebut harus diperiksa sebelum akun dapat
                  dipindahkan.
                </p>
              </div>
            ) : null}

            {outcome?.kind === "new_account" ? (
              <div className={styles.accountBoundary} data-tone="info">
                <strong>Akun belum ada</strong>
                <p>
                  Undangan baru akan dikirim ke {outcome.email} dan hasilnya
                  langsung ditautkan ke profil {member.identity.preferredName}.
                </p>
              </div>
            ) : null}
          </div>
        </section>

        <footer className={styles.drawerActions}>
          <NexusWorkspaceButton
            onClick={outcome ? resetEmail : onClose}
            type="button"
          >
            {outcome ? "Gunakan email lain" : "Batal"}
          </NexusWorkspaceButton>
          {!outcome ? (
            <NexusWorkspaceButton tone="primary" type="submit">
              Periksa akun
            </NexusWorkspaceButton>
          ) : null}
          {outcome?.kind === "existing_unlinked" ? (
            <NexusWorkspaceButton
              onClick={() =>
                onConnect(
                  {
                    email: outcome.account.email,
                    roleLabels: outcome.account.roleLabels,
                    status: outcome.account.status,
                  },
                  "Akun yang sudah ada berhasil dihubungkan ke profil anggota.",
                )
              }
              tone="primary"
              type="button"
            >
              Hubungkan akun
            </NexusWorkspaceButton>
          ) : null}
          {outcome?.kind === "new_account" ? (
            <NexusWorkspaceButton
              onClick={() =>
                onConnect(
                  {
                    email: outcome.email,
                    roleLabels: [],
                    status: "invited",
                  },
                  "Undangan akses BHT Nexus berhasil dikirim.",
                )
              }
              tone="primary"
              type="button"
            >
              Kirim undangan
            </NexusWorkspaceButton>
          ) : null}
        </footer>
      </form>
    </NexusWorkspaceDrawer>
  );
}
