"use client";

import { type FormEvent, useState } from "react";
import { nexusApiRequest } from "@/components/nexus-api/nexus-api-client";
import {
  type NexusApiError,
  nexusApiErrorFromUnknown,
} from "@/components/nexus-api/nexus-api-error";
import {
  NEXUS_PASSWORD_MAX_LENGTH,
  NEXUS_PASSWORD_MIN_LENGTH,
  nexusAuthErrorMessage,
} from "@/components/nexus-login/nexus-auth-errors";
import { NexusProfileModal } from "@/components/nexus-profile/nexus-profile-modal";
import styles from "@/components/nexus-profile/nexus-profile-modal.module.css";
import type { NexusSession } from "@/components/nexus-session/nexus-session-model";
import {
  NexusWorkspaceButton,
  NexusWorkspaceNotice,
} from "@/components/nexus-workspace-ui/nexus-workspace-elements";
import { NexusWorkspaceFormField } from "@/components/nexus-workspace-ui/nexus-workspace-form-field";
import { useNexusWorkspaceUnsavedChanges } from "@/components/nexus-workspace-ui/nexus-workspace-unsaved-changes";

type FieldErrors<Field extends string> = Partial<Record<Field, string>>;

const unsavedCopy = {
  confirmLabel: "Buang perubahan",
  description:
    "Perubahan pada formulir ini belum disimpan dan akan hilang jika Anda berpindah halaman.",
  title: "Buang perubahan profil?",
};

/** Kalimat kegagalan simpan yang dapat dibaca pemilik akun. */
function saveErrorMessage(error: NexusApiError) {
  if (error.status === 409) {
    return "Salah satu pengenal sudah dipakai anggota lain. Periksa kembali isiannya.";
  }
  if (error.status === 400 || error.status === 422) {
    return "Periksa kembali isian Anda lalu simpan lagi.";
  }
  return nexusAuthErrorMessage(error, "id");
}

function focusField(name?: string) {
  if (!name) return;
  document.querySelector<HTMLElement>(`[name="${name}"]`)?.focus();
}

function ModalActions({
  isSaving,
  onClose,
  submitLabel = "Simpan perubahan",
}: {
  isSaving: boolean;
  onClose: () => void;
  submitLabel?: string;
}) {
  return (
    <footer className={styles.actions}>
      <NexusWorkspaceButton disabled={isSaving} onClick={onClose} type="button">
        Batal
      </NexusWorkspaceButton>
      <NexusWorkspaceButton
        aria-busy={isSaving || undefined}
        disabled={isSaving}
        tone="primary"
        type="submit"
      >
        {isSaving ? "Menyimpan…" : submitLabel}
      </NexusWorkspaceButton>
    </footer>
  );
}

type PersonalDraft = { bio: string; name: string; phone: string };

/**
 * Informasi pribadi milik akun: nama, nomor HP, dan ringkasan profil. Nilai
 * foto akun yang tersimpan dikirim ulang apa adanya supaya penyimpanan ini
 * tidak mengosongkannya.
 */
export function NexusProfilePersonalForm({
  onClose,
  onSaved,
  session,
}: {
  onClose: () => void;
  onSaved: () => void;
  session: NexusSession;
}) {
  const initial: PersonalDraft = {
    bio: session.account.bio,
    name: session.account.name,
    phone: session.account.phone,
  };
  const [draft, setDraft] = useState(initial);
  const [errors, setErrors] = useState<FieldErrors<keyof PersonalDraft>>({});
  const [saveError, setSaveError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const isDirty = JSON.stringify(draft) !== JSON.stringify(initial);

  useNexusWorkspaceUnsavedChanges({ ...unsavedCopy, isDirty });

  function update(field: keyof PersonalDraft, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setSaveError("");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSaving) return;
    const name = draft.name.trim();
    const phone = draft.phone.trim();
    const bio = draft.bio.trim();
    const nextErrors: FieldErrors<keyof PersonalDraft> = {};
    if (!name) nextErrors.name = "Nama lengkap wajib diisi.";
    else if (name.length > 255) nextErrors.name = "Nama maksimal 255 karakter.";
    if (phone.length > 50) nextErrors.phone = "Nomor HP maksimal 50 karakter.";
    else if (phone && !/^[+\d][\d\s-]{5,}$/.test(phone)) {
      nextErrors.phone = "Gunakan angka, spasi, tanda hubung, atau awalan +.";
    }
    if (bio.length > 1000)
      nextErrors.bio = "Ringkasan maksimal 1.000 karakter.";
    setErrors(nextErrors);
    const firstInvalid = (["name", "phone", "bio"] as const).find(
      (field) => nextErrors[field],
    );
    if (firstInvalid) {
      focusField(firstInvalid);
      return;
    }

    setIsSaving(true);
    try {
      await nexusApiRequest("/profile/me", {
        body: {
          bio: bio || null,
          image: session.account.image ?? null,
          name,
          phone: phone || null,
        },
        method: "PATCH",
      });
      onSaved();
    } catch (error) {
      setSaveError(saveErrorMessage(nexusApiErrorFromUnknown(error)));
      setIsSaving(false);
    }
  }

  return (
    <NexusProfileModal
      closeLabel="Tutup formulir informasi pribadi"
      description="Informasi ini melekat pada akun BHT Nexus Anda."
      onClose={isSaving ? () => undefined : onClose}
      title="Ubah informasi pribadi"
    >
      <form className={styles.form} noValidate onSubmit={submit}>
        <div className={styles.body}>
          {saveError ? (
            <NexusWorkspaceNotice tone="danger">
              {saveError}
            </NexusWorkspaceNotice>
          ) : null}
          <section className={styles.section}>
            <div className={styles.grid}>
              <NexusWorkspaceFormField
                error={errors.name}
                id="profile-name"
                label="Nama lengkap"
                name="name"
                onChange={(event) => update("name", event.currentTarget.value)}
                required
                type="text"
                value={draft.name}
                wide
              />
              <NexusWorkspaceFormField
                error={errors.phone}
                hint="Dipakai rekan CoE untuk menghubungi Anda."
                id="profile-phone"
                label="Nomor HP"
                name="phone"
                onChange={(event) => update("phone", event.currentTarget.value)}
                placeholder="08xxxxxxxxxx"
                type="text"
                value={draft.phone}
                wide
              />
              <NexusWorkspaceFormField
                error={errors.bio}
                id="profile-bio"
                label="Ringkasan profil"
                name="bio"
                onChange={(event) => update("bio", event.currentTarget.value)}
                type="textarea"
                value={draft.bio}
                wide
              />
            </div>
          </section>
        </div>
        <ModalActions isSaving={isSaving} onClose={onClose} />
      </form>
    </NexusProfileModal>
  );
}

type AcademicDraft = {
  googleScholarId: string;
  scopusId: string;
  sintaId: string;
};

/** Pengenal akademik pada rekam anggota yang tertaut ke akun ini. */
export function NexusProfileAcademicForm({
  onClose,
  onSaved,
  session,
}: {
  onClose: () => void;
  onSaved: () => void;
  session: NexusSession;
}) {
  const academic = session.member?.academic;
  const initial: AcademicDraft = {
    googleScholarId: academic?.googleScholar ?? "",
    scopusId: academic?.scopusAuthorId ?? "",
    sintaId: academic?.sintaId ?? "",
  };
  const [draft, setDraft] = useState(initial);
  const [errors, setErrors] = useState<FieldErrors<keyof AcademicDraft>>({});
  const [saveError, setSaveError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const isDirty = JSON.stringify(draft) !== JSON.stringify(initial);

  useNexusWorkspaceUnsavedChanges({ ...unsavedCopy, isDirty });

  function update(field: keyof AcademicDraft, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setSaveError("");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSaving) return;
    const values = {
      googleScholarId: draft.googleScholarId.trim(),
      scopusId: draft.scopusId.trim(),
      sintaId: draft.sintaId.trim(),
    };
    const nextErrors: FieldErrors<keyof AcademicDraft> = {};
    if (values.sintaId && !/^\d+$/.test(values.sintaId)) {
      nextErrors.sintaId = "SINTA ID hanya berisi angka.";
    }
    if (values.scopusId && !/^\d+$/.test(values.scopusId)) {
      nextErrors.scopusId = "Scopus Author ID hanya berisi angka.";
    }
    if (
      values.googleScholarId &&
      !/^[\w-]{4,100}$/.test(values.googleScholarId)
    ) {
      nextErrors.googleScholarId =
        "Isi ID profil Google Scholar, misalnya bagian user=… pada alamat profil.";
    }
    setErrors(nextErrors);
    const firstInvalid = (
      ["sintaId", "scopusId", "googleScholarId"] as const
    ).find((field) => nextErrors[field]);
    if (firstInvalid) {
      focusField(firstInvalid);
      return;
    }

    setIsSaving(true);
    try {
      await nexusApiRequest("/profile/me/academic-identifiers", {
        body: {
          googleScholarId: values.googleScholarId || null,
          scopusId: values.scopusId || null,
          sintaId: values.sintaId || null,
        },
        method: "PATCH",
      });
      onSaved();
    } catch (error) {
      setSaveError(saveErrorMessage(nexusApiErrorFromUnknown(error)));
      setIsSaving(false);
    }
  }

  return (
    <NexusProfileModal
      closeLabel="Tutup formulir identitas akademik"
      description="Pengenal ini membantu membedakan karya Anda dari peneliti bernama mirip."
      onClose={isSaving ? () => undefined : onClose}
      title="Ubah identitas akademik"
    >
      <form className={styles.form} noValidate onSubmit={submit}>
        <div className={styles.body}>
          {saveError ? (
            <NexusWorkspaceNotice tone="danger">
              {saveError}
            </NexusWorkspaceNotice>
          ) : null}
          <section className={styles.section}>
            <div className={styles.grid}>
              <NexusWorkspaceFormField
                error={errors.sintaId}
                id="profile-sinta"
                label="SINTA ID"
                name="sintaId"
                onChange={(event) =>
                  update("sintaId", event.currentTarget.value)
                }
                type="text"
                value={draft.sintaId}
                wide
              />
              <NexusWorkspaceFormField
                error={errors.scopusId}
                id="profile-scopus"
                label="Scopus Author ID"
                name="scopusId"
                onChange={(event) =>
                  update("scopusId", event.currentTarget.value)
                }
                type="text"
                value={draft.scopusId}
                wide
              />
              <NexusWorkspaceFormField
                error={errors.googleScholarId}
                hint="Contoh: 50-QZvoAAAAJ dari alamat scholar.google.com/citations?user=…"
                id="profile-scholar"
                label="Google Scholar ID"
                name="googleScholarId"
                onChange={(event) =>
                  update("googleScholarId", event.currentTarget.value)
                }
                type="text"
                value={draft.googleScholarId}
                wide
              />
            </div>
          </section>
        </div>
        <ModalActions isSaving={isSaving} onClose={onClose} />
      </form>
    </NexusProfileModal>
  );
}

type PasswordField = "confirmPassword" | "currentPassword" | "newPassword";

function PasswordInput({
  autoComplete,
  error,
  hint,
  id,
  label,
  name,
}: {
  autoComplete: "current-password" | "new-password";
  error?: string;
  hint?: string;
  id: string;
  label: string;
  name: PasswordField;
}) {
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null]
    .filter(Boolean)
    .join(" ");
  return (
    <label className={styles.passwordField} htmlFor={id}>
      <span>{label}</span>
      <input
        aria-describedby={describedBy || undefined}
        aria-invalid={Boolean(error) || undefined}
        autoComplete={autoComplete}
        id={id}
        maxLength={NEXUS_PASSWORD_MAX_LENGTH}
        name={name}
        required
        type="password"
      />
      {hint ? <small id={`${id}-hint`}>{hint}</small> : null}
      {error ? (
        <small className={styles.fieldError} id={`${id}-error`}>
          {error}
        </small>
      ) : null}
    </label>
  );
}

/**
 * Mengganti kata sandi akun yang sedang masuk. Layanan memeriksa kata sandi
 * saat ini, lalu mengakhiri sesi pada perangkat lain.
 */
export function NexusProfilePasswordForm({
  email,
  onClose,
  onSaved,
}: {
  email: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [errors, setErrors] = useState<FieldErrors<PasswordField>>({});
  const [saveError, setSaveError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useNexusWorkspaceUnsavedChanges({ ...unsavedCopy, isDirty });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSaving) return;
    const form = new FormData(event.currentTarget);
    const currentPassword = String(form.get("currentPassword") ?? "");
    const newPassword = String(form.get("newPassword") ?? "");
    const confirmPassword = String(form.get("confirmPassword") ?? "");
    const nextErrors: FieldErrors<PasswordField> = {};
    if (!currentPassword) {
      nextErrors.currentPassword = "Kata sandi saat ini wajib diisi.";
    }
    if (newPassword.length < NEXUS_PASSWORD_MIN_LENGTH) {
      nextErrors.newPassword = "Gunakan minimal 8 karakter.";
    } else if (newPassword === currentPassword) {
      nextErrors.newPassword = "Gunakan kata sandi yang berbeda dari saat ini.";
    }
    if (!nextErrors.newPassword && confirmPassword !== newPassword) {
      nextErrors.confirmPassword = "Kedua kata sandi baru belum sama.";
    }
    setErrors(nextErrors);
    setSaveError("");
    const firstInvalid = (
      ["currentPassword", "newPassword", "confirmPassword"] as const
    ).find((field) => nextErrors[field]);
    if (firstInvalid) {
      focusField(firstInvalid);
      return;
    }

    setIsSaving(true);
    try {
      await nexusApiRequest("/auth/change-password", {
        body: { currentPassword, newPassword, revokeOtherSessions: true },
        method: "POST",
      });
      setIsDirty(false);
      onSaved();
    } catch (error) {
      const apiError = nexusApiErrorFromUnknown(error);
      if (apiError.code === "INVALID_PASSWORD") {
        setErrors({ currentPassword: "Kata sandi saat ini tidak sesuai." });
        focusField("currentPassword");
      } else {
        setSaveError(nexusAuthErrorMessage(apiError, "id"));
      }
      setIsSaving(false);
    }
  }

  return (
    <NexusProfileModal
      closeLabel="Tutup formulir kata sandi"
      description="Setelah kata sandi diganti, sesi pada perangkat lain diakhiri."
      onClose={isSaving ? () => undefined : onClose}
      title="Ubah kata sandi"
    >
      <form
        className={styles.form}
        noValidate
        onChange={() => setIsDirty(true)}
        onSubmit={submit}
      >
        <div className={styles.body}>
          {saveError ? (
            <NexusWorkspaceNotice tone="danger">
              {saveError}
            </NexusWorkspaceNotice>
          ) : null}
          <section className={styles.section}>
            <input
              autoComplete="username"
              className={styles.hiddenUsername}
              readOnly
              tabIndex={-1}
              type="email"
              value={email}
            />
            <div className={styles.grid}>
              <PasswordInput
                autoComplete="current-password"
                error={errors.currentPassword}
                id="profile-current-password"
                label="Kata sandi saat ini"
                name="currentPassword"
              />
              <PasswordInput
                autoComplete="new-password"
                error={errors.newPassword}
                hint="Minimal 8 karakter."
                id="profile-new-password"
                label="Kata sandi baru"
                name="newPassword"
              />
              <PasswordInput
                autoComplete="new-password"
                error={errors.confirmPassword}
                id="profile-confirm-password"
                label="Ulangi kata sandi baru"
                name="confirmPassword"
              />
            </div>
          </section>
        </div>
        <ModalActions
          isSaving={isSaving}
          onClose={onClose}
          submitLabel="Ganti kata sandi"
        />
      </form>
    </NexusProfileModal>
  );
}
