"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import { nexusApiRequest } from "@/components/nexus-api/nexus-api-client";
import { nexusApiErrorFromUnknown } from "@/components/nexus-api/nexus-api-error";
import { nexusAuthErrorMessage } from "@/components/nexus-login/nexus-auth-errors";
import styles from "@/components/nexus-login/nexus-login.module.css";
import type { NexusLoginContent } from "@/components/nexus-login/nexus-login-content";
import type { Locale } from "@/i18n/locales";

type NexusLoginFormProps = {
  content: NexusLoginContent;
  locale: Locale;
  notice?: string;
  returnPath?: string;
};

type Step = "credentials" | "verify";

/** Jeda kirim ulang kode mengikuti batas layanan (tiga kode per menit). */
const RESEND_COOLDOWN_SECONDS = 60;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const fieldMessages = {
  en: {
    codeFormat: "Enter the 6-digit code.",
    emailFormat: "Enter a valid email address.",
    emailRequired: "Enter your email.",
    passwordRequired: "Enter your password.",
  },
  id: {
    codeFormat: "Masukkan 6 digit kode.",
    emailFormat: "Gunakan alamat email yang valid.",
    emailRequired: "Email wajib diisi.",
    passwordRequired: "Kata sandi wajib diisi.",
  },
} satisfies Record<Locale, Record<string, string>>;

function EyeIcon({ concealed }: { concealed: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M2.8 12s3.4-5.2 9.2-5.2S21.2 12 21.2 12 17.8 17.2 12 17.2 2.8 12 2.8 12Z" />
      <circle cx="12" cy="12" r="2.6" />
      {!concealed && <path d="m4 4 16 16" />}
    </svg>
  );
}

/**
 * Setelah sesi dibuat, ruang kerja dibuka dengan muat penuh sehingga layout
 * membaca sesi baru dari layanan, bukan dari keadaan halaman masuk.
 */
function enterWorkspace(locale: Locale, returnPath?: string) {
  window.location.assign(
    returnPath ?? (locale === "id" ? "/nexus" : "/en/nexus/coming-soon"),
  );
}

export function NexusLoginForm({
  content,
  locale,
  notice,
  returnPath,
}: NexusLoginFormProps) {
  const text = fieldMessages[locale];
  const [step, setStep] = useState<Step>("credentials");
  const [email, setEmail] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<"email" | "otp" | "password", string>>
  >({});
  const [status, setStatus] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const otpInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timeoutId = window.setTimeout(
      () => setCooldown((value) => value - 1),
      1000,
    );
    return () => window.clearTimeout(timeoutId);
  }, [cooldown]);

  useEffect(() => {
    if (step === "verify") otpInputRef.current?.focus();
  }, [step]);

  async function sendVerificationCode(address: string) {
    setIsSending(true);
    setFormError("");
    try {
      await nexusApiRequest("/auth/email-otp/send-verification-otp", {
        body: { email: address, type: "email-verification" },
        method: "POST",
      });
      setCooldown(RESEND_COOLDOWN_SECONDS);
      return true;
    } catch (error) {
      setFormError(
        nexusAuthErrorMessage(nexusApiErrorFromUnknown(error), locale),
      );
      return false;
    } finally {
      setIsSending(false);
    }
  }

  async function submitCredentials(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;
    const form = new FormData(event.currentTarget);
    const nextEmail = String(form.get("email") ?? "")
      .trim()
      .toLocaleLowerCase("id-ID");
    const password = String(form.get("password") ?? "");

    const errors: typeof fieldErrors = {};
    if (!nextEmail) errors.email = text.emailRequired;
    else if (!EMAIL_PATTERN.test(nextEmail)) errors.email = text.emailFormat;
    if (!password) errors.password = text.passwordRequired;
    setFieldErrors(errors);
    setFormError("");
    setStatus("");
    if (errors.email || errors.password) {
      document
        .querySelector<HTMLElement>(
          errors.email ? "#nexus-email" : "#nexus-password",
        )
        ?.focus();
      return;
    }

    setIsSubmitting(true);
    try {
      await nexusApiRequest("/auth/sign-in/email", {
        body: { email: nextEmail, password },
        method: "POST",
      });
      enterWorkspace(locale, returnPath);
    } catch (error) {
      const apiError = nexusApiErrorFromUnknown(error);
      setIsSubmitting(false);
      if (apiError.code === "EMAIL_NOT_VERIFIED") {
        setEmail(nextEmail);
        setStep("verify");
        await sendVerificationCode(nextEmail);
        return;
      }
      setFormError(nexusAuthErrorMessage(apiError, locale));
      if (apiError.code === "INVALID_EMAIL_OR_PASSWORD") {
        passwordInputRef.current?.select();
        passwordInputRef.current?.focus();
      }
    }
  }

  async function submitVerification(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;
    const otp = String(
      new FormData(event.currentTarget).get("otp") ?? "",
    ).trim();
    if (!/^\d{6}$/.test(otp)) {
      setFieldErrors({ otp: text.codeFormat });
      otpInputRef.current?.focus();
      return;
    }
    setFieldErrors({});
    setFormError("");
    setStatus("");
    setIsSubmitting(true);
    try {
      await nexusApiRequest("/auth/email-otp/verify-email", {
        body: { email, otp },
        method: "POST",
      });
      enterWorkspace(locale, returnPath);
    } catch (error) {
      setIsSubmitting(false);
      setFormError(
        nexusAuthErrorMessage(nexusApiErrorFromUnknown(error), locale),
      );
      otpInputRef.current?.select();
      otpInputRef.current?.focus();
    }
  }

  async function resendCode() {
    if (cooldown > 0 || isSending) return;
    setStatus("");
    if (await sendVerificationCode(email)) setStatus(content.codeSentNotice);
  }

  function useAnotherEmail() {
    setStep("credentials");
    setFieldErrors({});
    setFormError("");
    setStatus("");
    setCooldown(0);
  }

  const noticeBlock = notice ? (
    <output aria-live="polite" className={styles.notice} data-tone="info">
      {notice}
    </output>
  ) : null;
  const errorBlock = formError ? (
    <p
      className={styles.notice}
      data-tone="danger"
      id="nexus-auth-error"
      role="alert"
    >
      {formError}
    </p>
  ) : null;

  if (step === "verify") {
    return (
      <form className={styles.form} noValidate onSubmit={submitVerification}>
        <div className={styles.stepIntro}>
          <h2>{content.verifyTitle}</h2>
          <p>{content.verifyDescription.replace("{email}", email)}</p>
        </div>
        {errorBlock}
        {status ? (
          <output
            aria-live="polite"
            className={styles.notice}
            data-tone="success"
          >
            {status}
          </output>
        ) : null}
        <div className={styles.field}>
          <label htmlFor="nexus-otp">{content.otpLabel}</label>
          <input
            aria-describedby={
              fieldErrors.otp ? "nexus-otp-error" : "nexus-otp-hint"
            }
            aria-invalid={Boolean(fieldErrors.otp) || undefined}
            autoComplete="one-time-code"
            className={styles.otpInput}
            id="nexus-otp"
            inputMode="numeric"
            maxLength={6}
            name="otp"
            pattern="[0-9]{6}"
            ref={otpInputRef}
            required
            spellCheck={false}
            type="text"
          />
          {fieldErrors.otp ? (
            <small className={styles.fieldError} id="nexus-otp-error">
              {fieldErrors.otp}
            </small>
          ) : (
            <small className={styles.fieldHint} id="nexus-otp-hint">
              {content.otpHint}
            </small>
          )}
        </div>
        <button
          aria-busy={isSubmitting || undefined}
          className={styles.submitButton}
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? content.verifyingLabel : content.verifyLabel}
        </button>
        <div className={styles.stepActions}>
          <button
            className={styles.textButton}
            disabled={cooldown > 0 || isSending}
            onClick={resendCode}
            type="button"
          >
            {isSending
              ? content.resendingLabel
              : cooldown > 0
                ? content.resendCooldownLabel.replace(
                    "{seconds}",
                    String(cooldown),
                  )
                : content.resendLabel}
          </button>
          <button
            className={styles.textButton}
            onClick={useAnotherEmail}
            type="button"
          >
            {content.changeEmailLabel}
          </button>
        </div>
      </form>
    );
  }

  return (
    <form className={styles.form} noValidate onSubmit={submitCredentials}>
      {noticeBlock}
      {errorBlock}
      <div className={styles.field}>
        <label htmlFor="nexus-email">{content.emailLabel}</label>
        <input
          aria-describedby={
            fieldErrors.email
              ? "nexus-email-error"
              : formError
                ? "nexus-auth-error"
                : undefined
          }
          aria-invalid={Boolean(fieldErrors.email) || undefined}
          autoComplete="username"
          defaultValue={email}
          id="nexus-email"
          inputMode="email"
          name="email"
          placeholder={content.emailPlaceholder}
          required
          spellCheck={false}
          type="email"
        />
        {fieldErrors.email ? (
          <small className={styles.fieldError} id="nexus-email-error">
            {fieldErrors.email}
          </small>
        ) : null}
      </div>

      <div className={styles.field}>
        <label htmlFor="nexus-password">{content.passwordLabel}</label>
        <div className={styles.passwordField}>
          <input
            aria-describedby={
              fieldErrors.password
                ? "nexus-password-error"
                : formError
                  ? "nexus-auth-error"
                  : undefined
            }
            aria-invalid={Boolean(fieldErrors.password) || undefined}
            autoComplete="current-password"
            id="nexus-password"
            name="password"
            placeholder={content.passwordPlaceholder}
            ref={passwordInputRef}
            required
            type={passwordVisible ? "text" : "password"}
          />
          <button
            aria-label={
              passwordVisible
                ? content.passwordHideLabel
                : content.passwordShowLabel
            }
            aria-pressed={passwordVisible}
            className={styles.passwordToggle}
            onClick={() => setPasswordVisible((visible) => !visible)}
            type="button"
          >
            <EyeIcon concealed={passwordVisible} />
          </button>
        </div>
        {fieldErrors.password ? (
          <small className={styles.fieldError} id="nexus-password-error">
            {fieldErrors.password}
          </small>
        ) : null}
      </div>

      <button
        aria-busy={isSubmitting || undefined}
        className={styles.submitButton}
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? content.signingInLabel : content.signInLabel}
      </button>
    </form>
  );
}
