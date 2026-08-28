"use client";

import { type FormEvent, useMemo, useState } from "react";
import type { NexusAccountInvitationInput } from "@/components/nexus-accounts/nexus-account-directory";
import styles from "@/components/nexus-administration/nexus-administration.module.css";
import type {
  NexusAdministrationMemberOption,
  NexusAdministrationRole,
} from "@/components/nexus-administration/nexus-administration-content";
import { NexusAdministrationIcon } from "@/components/nexus-administration/nexus-administration-icons";
import { NexusWorkspaceConfirmDialog } from "@/components/nexus-workspace-ui/nexus-workspace-confirm-dialog";
import { NexusWorkspaceDrawer } from "@/components/nexus-workspace-ui/nexus-workspace-drawer";
import {
  NexusWorkspaceButton,
  NexusWorkspaceNotice,
} from "@/components/nexus-workspace-ui/nexus-workspace-elements";
import { NexusWorkspaceFormField } from "@/components/nexus-workspace-ui/nexus-workspace-form-field";

type NexusAdministrationInviteDrawerProps = {
  accountEmails: readonly string[];
  availableMembers: readonly NexusAdministrationMemberOption[];
  initialMemberId?: string;
  onClose: () => void;
  onInvite: (input: NexusAccountInvitationInput) => string;
  onViewAccount: (accountId: string) => void;
  roles: readonly NexusAdministrationRole[];
};

type InviteDraft = {
  displayName: string;
  email: string;
  memberChoice: "" | "no" | "yes";
  memberId: string;
  roleId: string;
};

type InviteErrors = Partial<Record<keyof InviteDraft | "submit", string>>;

type CreatedInvitationSummary = {
  member?: NexusAdministrationMemberOption;
  role: NexusAdministrationRole;
};

const initialDraft: InviteDraft = {
  displayName: "",
  email: "",
  memberChoice: "",
  memberId: "",
  roleId: "",
};

const workflowLabels = ["Identitas", "Hubungan Anggota", "Role", "Tinjau"];

function normalizedEmail(value: string) {
  return value.trim().toLocaleLowerCase("id-ID");
}

export function NexusAdministrationInviteDrawer({
  accountEmails,
  availableMembers,
  initialMemberId,
  onClose,
  onInvite,
  onViewAccount,
  roles,
}: NexusAdministrationInviteDrawerProps) {
  const initialMember = availableMembers.find(
    (member) => member.id === initialMemberId,
  );
  const startingDraft = useMemo(
    () =>
      initialMember
        ? {
            ...initialDraft,
            displayName: initialMember.name,
            memberChoice: "yes" as const,
            memberId: initialMember.id,
          }
        : initialDraft,
    [initialMember],
  );
  const [draft, setDraft] = useState(startingDraft);
  const [errors, setErrors] = useState<InviteErrors>({});
  const [step, setStep] = useState(1);
  const [createdAccountId, setCreatedAccountId] = useState("");
  const [discardConfirmationOpen, setDiscardConfirmationOpen] = useState(false);
  const [createdSummary, setCreatedSummary] =
    useState<CreatedInvitationSummary | null>(null);
  const selectedMember = availableMembers.find(
    (member) => member.id === draft.memberId,
  );
  const selectedRole = roles.find((role) => role.id === draft.roleId);
  const normalizedAccountEmails = useMemo(
    () => accountEmails.map(normalizedEmail),
    [accountEmails],
  );
  const workflow = workflowLabels.map((label, index) => ({
    active: !createdAccountId && step === index + 1,
    complete: Boolean(createdAccountId) || step > index + 1,
    label,
    number: index + 1,
  }));
  const draftIsDirty = Object.entries(draft).some(
    ([field, value]) =>
      value !== startingDraft[field as keyof typeof startingDraft],
  );

  function requestClose() {
    if (!createdAccountId && draftIsDirty) {
      setDiscardConfirmationOpen(true);
      return;
    }
    onClose();
  }

  function updateDraft<Field extends keyof InviteDraft>(
    field: Field,
    value: InviteDraft[Field],
  ) {
    setDraft((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({
      ...current,
      [field]: undefined,
      submit: undefined,
    }));
  }

  function validateStep(currentStep: number) {
    const nextErrors: InviteErrors = {};

    if (currentStep === 1) {
      const email = normalizedEmail(draft.email);
      if (!email) {
        nextErrors.email = "Email untuk masuk wajib diisi.";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        nextErrors.email = "Gunakan alamat email yang valid.";
      } else if (normalizedAccountEmails.includes(email)) {
        nextErrors.email = "Email ini sudah digunakan oleh akun lain.";
      }
    }

    if (currentStep === 2) {
      if (!draft.memberChoice) {
        nextErrors.memberChoice =
          "Pilih apakah akun ini perlu dihubungkan ke anggota.";
      } else if (draft.memberChoice === "yes" && !draft.memberId) {
        nextErrors.memberId = "Pilih anggota yang ingin ditautkan.";
      }
    }

    if (currentStep === 3 && !draft.roleId) {
      nextErrors.roleId = "Pilih role untuk akun ini.";
    }

    setErrors(nextErrors);
    const firstField = Object.keys(nextErrors)[0];
    if (firstField) {
      requestAnimationFrame(() =>
        document.querySelector<HTMLElement>(`[name="${firstField}"]`)?.focus(),
      );
    }
    return Object.keys(nextErrors).length === 0;
  }

  function advance() {
    if (!validateStep(step)) return;
    setStep((current) => Math.min(current + 1, 4));
  }

  function submitInvitation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step < 4) {
      advance();
      return;
    }

    if (!selectedRole) {
      setErrors({ submit: "Role tidak lagi tersedia. Pilih role kembali." });
      setStep(3);
      return;
    }

    let accountId = "";
    try {
      accountId = onInvite({
        displayName: draft.displayName.trim(),
        email: normalizedEmail(draft.email),
        relationship:
          draft.memberChoice === "yes" && selectedMember
            ? { kind: "LINKED", memberId: selectedMember.id }
            : { kind: "NON_MEMBER" },
        roleId: selectedRole.id,
      });
    } catch (caughtError) {
      setErrors({
        submit:
          caughtError instanceof Error
            ? caughtError.message
            : "Undangan tidak dapat dibuat.",
      });
      return;
    }
    setCreatedSummary({
      member: draft.memberChoice === "yes" ? selectedMember : undefined,
      role: selectedRole,
    });
    setCreatedAccountId(accountId);
  }

  return (
    <>
      <NexusWorkspaceDrawer
        closeLabel="Tutup pembuatan undangan akun"
        description={
          createdAccountId
            ? "Akun menunggu aktivasi dan rinciannya siap ditinjau."
            : "Isi identitas akun, tentukan hubungan anggota, lalu pilih peran."
        }
        eyebrow="Akun & Akses"
        onClose={requestClose}
        steps={workflow}
        title={createdAccountId ? "Undangan dibuat" : "Buat undangan akun"}
      >
        {createdAccountId ? (
          <section aria-live="polite" className={styles.inviteSuccess}>
            <span aria-hidden="true">
              <NexusAdministrationIcon name="email" />
            </span>
            <h3>Akun menunggu aktivasi</h3>
            <p>
              Undangan untuk <strong>{normalizedEmail(draft.email)}</strong>{" "}
              telah dibuat. Status akun sekarang{" "}
              <strong>Menunggu aktivasi</strong>.
            </p>
            <div className={styles.successSummary}>
              <span>
                <small>Hubungan anggota</small>
                <strong>
                  {createdSummary?.member
                    ? `${createdSummary.member.name} · ${createdSummary.member.id}`
                    : "Tidak dihubungkan ke anggota"}
                </strong>
              </span>
              <span>
                <small>Role</small>
                <strong>{createdSummary?.role.label}</strong>
              </span>
            </div>
            <NexusWorkspaceNotice tone="success">
              Pengguna perlu mengaktifkan akun melalui tautan undangan sebelum
              masa berlakunya berakhir.
            </NexusWorkspaceNotice>
            <footer className={styles.drawerFooter}>
              <NexusWorkspaceButton onClick={requestClose} type="button">
                Tutup
              </NexusWorkspaceButton>
              <NexusWorkspaceButton
                onClick={() => onViewAccount(createdAccountId)}
                tone="primary"
                type="button"
              >
                Lihat akun
              </NexusWorkspaceButton>
            </footer>
          </section>
        ) : (
          <form
            className={styles.inviteForm}
            noValidate
            onSubmit={submitInvitation}
          >
            {step === 1 ? (
              <section className={styles.formStep}>
                <header>
                  <span>01</span>
                  <div>
                    <h3>Identitas akun</h3>
                    <p>
                      Email wajib dan menjadi identitas masuk. Admin tidak perlu
                      membuat kata sandi untuk pengguna.
                    </p>
                  </div>
                </header>
                <div className={styles.formGrid}>
                  <NexusWorkspaceFormField
                    error={errors.email}
                    hint="Alamat ini digunakan untuk undangan aktivasi."
                    id="administration-invite-email"
                    label="Email"
                    name="email"
                    onChange={(event) =>
                      updateDraft("email", event.currentTarget.value)
                    }
                    placeholder="nama@example.org"
                    required
                    type="email"
                    value={draft.email}
                    wide
                  />
                  <NexusWorkspaceFormField
                    hint="Opsional; pengguna dapat melengkapinya saat aktivasi."
                    id="administration-invite-display-name"
                    label="Nama tampilan"
                    name="displayName"
                    onChange={(event) =>
                      updateDraft("displayName", event.currentTarget.value)
                    }
                    placeholder="Nama pengguna"
                    type="text"
                    value={draft.displayName}
                    wide
                  />
                </div>
              </section>
            ) : null}

            {step === 2 ? (
              <section className={styles.formStep}>
                <header>
                  <span>02</span>
                  <div>
                    <h3>Hubungan Anggota</h3>
                    <p>
                      Pilihan ini harus eksplisit. Sistem tidak menyimpulkan
                      hubungan dari kesamaan nama atau email.
                    </p>
                  </div>
                </header>
                <fieldset className={styles.relationshipChoices}>
                  <legend>Apakah akun ini milik anggota CoE BHT?</legend>
                  <label
                    data-selected={draft.memberChoice === "yes" || undefined}
                  >
                    <input
                      checked={draft.memberChoice === "yes"}
                      name="memberChoice"
                      onChange={() => updateDraft("memberChoice", "yes")}
                      type="radio"
                      value="yes"
                    />
                    <span>
                      <strong>Ya, hubungkan ke anggota</strong>
                      <small>
                        Pilih satu profil anggota yang belum memiliki akun.
                      </small>
                    </span>
                  </label>
                  <label
                    data-selected={draft.memberChoice === "no" || undefined}
                  >
                    <input
                      checked={draft.memberChoice === "no"}
                      name="memberChoice"
                      onChange={() => {
                        updateDraft("memberChoice", "no");
                        updateDraft("memberId", "");
                      }}
                      type="radio"
                      value="no"
                    />
                    <span>
                      <strong>Tidak, ini akun non-anggota</strong>
                      <small>
                        Valid untuk operator, reviewer, admin, atau intern.
                      </small>
                    </span>
                  </label>
                  {errors.memberChoice ? (
                    <small className={styles.fieldError}>
                      {errors.memberChoice}
                    </small>
                  ) : null}
                </fieldset>

                {draft.memberChoice === "yes" ? (
                  <NexusWorkspaceFormField
                    error={errors.memberId}
                    hint="Hanya profil tanpa akun yang tersedia pada pilihan ini."
                    id="administration-invite-member"
                    label="Anggota"
                    name="memberId"
                    onChange={(event) =>
                      updateDraft("memberId", event.currentTarget.value)
                    }
                    options={availableMembers.map((member) => ({
                      label: `${member.name} — ${member.id}`,
                      value: member.id,
                    }))}
                    required
                    type="select"
                    value={draft.memberId}
                    wide
                  />
                ) : null}
              </section>
            ) : null}

            {step === 3 ? (
              <section className={styles.formStep}>
                <header>
                  <span>03</span>
                  <div>
                    <h3>Role</h3>
                    <p>
                      Pilih satu peran utama sesuai kebutuhan kerja pengguna.
                    </p>
                  </div>
                </header>
                <NexusWorkspaceFormField
                  error={errors.roleId}
                  id="administration-invite-role"
                  label="Role"
                  name="roleId"
                  onChange={(event) =>
                    updateDraft("roleId", event.currentTarget.value)
                  }
                  options={roles.map((role) => ({
                    label: role.label,
                    value: role.id,
                  }))}
                  required
                  type="select"
                  value={draft.roleId}
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
              </section>
            ) : null}

            {step === 4 ? (
              <section className={styles.formStep}>
                <header>
                  <span>04</span>
                  <div>
                    <h3>Tinjau undangan</h3>
                    <p>
                      Pastikan identitas, hubungan anggota, dan role sudah tepat
                      sebelum undangan dibuat.
                    </p>
                  </div>
                </header>
                <dl className={styles.reviewList}>
                  <div>
                    <dt>Email</dt>
                    <dd>{normalizedEmail(draft.email)}</dd>
                  </div>
                  <div>
                    <dt>Nama tampilan</dt>
                    <dd>
                      {draft.displayName.trim() ||
                        "Belum diisi — dilengkapi saat aktivasi"}
                    </dd>
                  </div>
                  <div>
                    <dt>Hubungan anggota</dt>
                    <dd>
                      {selectedMember
                        ? `${selectedMember.id} · ${selectedMember.name}`
                        : "Tidak dihubungkan ke anggota"}
                    </dd>
                  </div>
                  <div>
                    <dt>Role</dt>
                    <dd>{selectedRole?.label ?? "Belum dipilih"}</dd>
                  </div>
                </dl>
                <NexusWorkspaceNotice>
                  Undangan tidak meminta admin membuat kata sandi. Pengguna akan
                  menyiapkannya melalui alur aktivasi undangan.
                </NexusWorkspaceNotice>
                {errors.submit ? (
                  <NexusWorkspaceNotice tone="danger">
                    {errors.submit}
                  </NexusWorkspaceNotice>
                ) : null}
              </section>
            ) : null}

            <footer className={styles.drawerFooter}>
              <NexusWorkspaceButton
                onClick={() =>
                  step === 1 ? requestClose() : setStep(step - 1)
                }
                type="button"
              >
                {step === 1 ? "Batal" : "Kembali"}
              </NexusWorkspaceButton>
              <NexusWorkspaceButton tone="primary" type="submit">
                {step === 4 ? "Buat undangan" : "Lanjutkan"}
              </NexusWorkspaceButton>
            </footer>
          </form>
        )}
      </NexusWorkspaceDrawer>

      {discardConfirmationOpen ? (
        <NexusWorkspaceConfirmDialog
          cancelLabel="Lanjutkan mengisi"
          confirmLabel="Buang draft"
          description="Identitas, hubungan anggota, dan peran yang sudah diisi akan hilang."
          onCancel={() => setDiscardConfirmationOpen(false)}
          onConfirm={() => {
            setDiscardConfirmationOpen(false);
            onClose();
          }}
          title="Buang draft undangan?"
        />
      ) : null}
    </>
  );
}
