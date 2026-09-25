"use client";

import Link from "next/link";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { nexusApiRequest } from "@/components/nexus-api/nexus-api-client";
import { nexusApiErrorFromUnknown } from "@/components/nexus-api/nexus-api-error";
import {
  NEXUS_PASSWORD_MAX_LENGTH,
  NEXUS_PASSWORD_MIN_LENGTH,
  nexusAuthErrorMessage,
} from "@/components/nexus-login/nexus-auth-errors";
import styles from "@/components/nexus-login/nexus-login.module.css";
import type { NexusPasswordRecoveryContent } from "@/components/nexus-login/nexus-password-recovery-content";
import type { Locale } from "@/i18n/locales";

type Step = "done" | "request" | "reset";
type FieldName = "confirmPassword" | "email" | "otp" | "password";

const RESEND_COOLDOWN_SECONDS = 60;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Meminta kode lalu membuat kata sandi dengan kode tersebut. Permintaan kode
 * selalu dijawab dengan kalimat yang sama agar halaman tidak membocorkan
 * apakah sebuah email terdaftar.
 */
export function NexusPasswordRecoveryForm({
  content,
  locale,
}: {
  content: NexusPasswordRecoveryContent;
  locale: Locale;
}) {
  const [step, setStep] = useState<Step>("request");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [formError, setFormError] = useState("");
  const [status, setStatus] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<FieldName, string>>
  >({});
  const otpInputRef = useRef<HTMLInputElement>(null);
  const successHeadingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timeoutId = window.setTimeout(
      () => setCooldown((value) => value - 1),
      1000,
    );
    return () => window.clearTimeout(timeoutId);
  }, [cooldown]);

  useEffect(() => {
    if (step === "reset") otpInputRef.current?.focus();
    if (step === "done") successHeadingRef.current?.focus();
  }, [step]);

  async function requestCode(address: string) {
    await nexusApiRequest("/auth/email-otp/request-password-reset", {
      body: { email: address },
      method: "POST",
    });
    setCooldown(RESEND_COOLDOWN_SECONDS);
  }

  async function submitRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;
    const nextEmail = String(
      new FormData(event.currentTarget).get("email") ?? "",
    )
      .trim()
      .toLocaleLowerCase("id-ID");
    const emailError = !nextEmail
      ? content.validation.emailRequired
      : EMAIL_PATTERN.test(nextEmail)
        ? undefined
        : content.validation.emailFormat;
    setFieldErrors(emailError ? { email: emailError } : {});
    setFormError("");
    if (emailError) {
      document.querySelector<HTMLElement>("#nexus-recovery-email")?.focus();
      return;
    }

    setIsSubmitting(true);
    try {
      await requestCode(nextEmail);
      setEmail(nextEmail);
      setStatus("");
      setStep("reset");
    } catch (error) {
      setFormError(
        nexusAuthErrorMessage(nexusApiErrorFromUnknown(error), locale),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function resendCode() {
    if (cooldown > 0 || isSending) return;
    setIsSending(true);
    setFormError("");
    setStatus("");
    try {
      await requestCode(email);
      setStatus(content.resentNotice);
    } catch (error) {
      setFormError(
        nexusAuthErrorMessage(nexusApiErrorFromUnknown(error), locale),
      );
    } finally {
      setIsSending(false);
    }
  }

  async function submitReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;
    const form = new FormData(event.currentTarget);
    const otp = String(form.get("otp") ?? "").trim();
    const confirmPassword = String(form.get("confirmPassword") ?? "");

    const errors: Partial<Record<FieldName, string>> = {};
    if (!/^\d{6}$/.test(otp)) errors.otp = content.validation.codeFormat;
    if (!password) errors.password = content.validation.passwordRequired;
    else if (password.length < NEXUS_PASSWORD_MIN_LENGTH) {
      errors.password = content.passwordLengthRule;
    }
    if (!errors.password && confirmPassword !== password) {
      errors.confirmPassword = content.passwordMismatch;
    }
    setFieldErrors(errors);
    setFormError("");
    setStatus("");
    const firstInvalid = (["otp", "password", "confirmPassword"] as const).find(
      (field) => errors[field],
    );
    if (firstInvalid) {
      document.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus();
      return;
    }

    setIsSubmitting(true);
    try {
      await nexusApiRequest("/auth/email-otp/reset-password", {
        body: { email, otp, password },
        method: "POST",
      });
      setPassword("");
      setStep("done");
    } catch (error) {
      setFormError(
        nexusAuthErrorMessage(nexusApiErrorFromUnknown(error), locale),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function useAnotherEmail() {
    setStep("request");
    setPassword("");
    setFieldErrors({});
    setFormError("");
    setStatus("");
    setCooldown(0);
  }

  const errorBlock = formError ? (
    <p className={styles.notice} data-tone="danger" role="alert">
      {formError}
    </p>
  ) : null;

  if (step === "done") {
    return (
      <div className={styles.form}>
        <div className={styles.stepIntro}>
          <h2 ref={successHeadingRef} tabIndex={-1}>
            {content.successTitle}
          </h2>
          <p>{content.successDescription}</p>
        </div>
        <Link
          className={styles.submitButton}
          data-link
          href={content.signInHref}
        >
          {content.signInLabel}
        </Link>
      </div>
    );
  }

  if (step === "request") {
    return (
      <form className={styles.form} noValidate onSubmit={submitRequest}>
        {errorBlock}
        <div className={styles.field}>
          <label htmlFor="nexus-recovery-email">{content.emailLabel}</label>
          <input
            aria-describedby={
              fieldErrors.email ? "nexus-recovery-email-error" : undefined
            }
            aria-invalid={Boolean(fieldErrors.email) || undefined}
            autoComplete="username"
            defaultValue={email}
            id="nexus-recovery-email"
            inputMode="email"
            name="email"
            placeholder={content.emailPlaceholder}
            required
            spellCheck={false}
            type="email"
          />
          {fieldErrors.email ? (
            <small
              className={styles.fieldError}
              id="nexus-recovery-email-error"
            >
              {fieldErrors.email}
            </small>
          ) : null}
        </div>
        <button
          aria-busy={isSubmitting || undefined}
          className={styles.submitButton}
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? content.requestingLabel : content.requestLabel}
        </button>
      </form>
    );
  }

  const lengthMet = password.length >= NEXUS_PASSWORD_MIN_LENGTH;

  return (
    <form className={styles.form} noValidate onSubmit={submitReset}>
      <div className={styles.stepIntro}>
        <h2>{content.codeSentTitle}</h2>
        <p>{content.codeSentDescription.replace("{email}", email)}</p>
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
        <label htmlFor="nexus-recovery-account">{content.emailLabel}</label>
        <input
          autoComplete="username"
          id="nexus-recovery-account"
          readOnly
          type="email"
          value={email}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="nexus-recovery-otp">{content.codeLabel}</label>
        <input
          aria-describedby={
            fieldErrors.otp
              ? "nexus-recovery-otp-error"
              : "nexus-recovery-otp-hint"
          }
          aria-invalid={Boolean(fieldErrors.otp) || undefined}
          autoComplete="one-time-code"
          className={styles.otpInput}
          id="nexus-recovery-otp"
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
          <small className={styles.fieldError} id="nexus-recovery-otp-error">
            {fieldErrors.otp}
          </small>
        ) : (
          <small className={styles.fieldHint} id="nexus-recovery-otp-hint">
            {content.codeHint}
          </small>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="nexus-recovery-password">
          {content.newPasswordLabel}
        </label>
        <div className={styles.passwordField}>
          <input
            aria-describedby={
              fieldErrors.password
                ? "nexus-recovery-password-error"
                : "nexus-recovery-password-rules"
            }
            aria-invalid={Boolean(fieldErrors.password) || undefined}
            autoComplete="new-password"
            id="nexus-recovery-password"
            maxLength={NEXUS_PASSWORD_MAX_LENGTH}
            name="password"
            onChange={(event) => setPassword(event.currentTarget.value)}
            required
            type={passwordVisible ? "text" : "password"}
            value={password}
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
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <path d="M2.8 12s3.4-5.2 9.2-5.2S21.2 12 21.2 12 17.8 17.2 12 17.2 2.8 12 2.8 12Z" />
              <circle cx="12" cy="12" r="2.6" />
              {!passwordVisible && <path d="m4 4 16 16" />}
            </svg>
          </button>
        </div>
        {fieldErrors.password ? (
          <small
            className={styles.fieldError}
            id="nexus-recovery-password-error"
          >
            {fieldErrors.password}
          </small>
        ) : (
          <ul
            className={styles.passwordRequirements}
            id="nexus-recovery-password-rules"
          >
            <li data-met={lengthMet}>{content.passwordLengthRule}</li>
          </ul>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="nexus-recovery-confirm">
          {content.confirmPasswordLabel}
        </label>
        <input
          aria-describedby={
            fieldErrors.confirmPassword
              ? "nexus-recovery-confirm-error"
              : undefined
          }
          aria-invalid={Boolean(fieldErrors.confirmPassword) || undefined}
          autoComplete="new-password"
          id="nexus-recovery-confirm"
          maxLength={NEXUS_PASSWORD_MAX_LENGTH}
          name="confirmPassword"
          required
          type={passwordVisible ? "text" : "password"}
        />
        {fieldErrors.confirmPassword ? (
          <small
            className={styles.fieldError}
            id="nexus-recovery-confirm-error"
          >
            {fieldErrors.confirmPassword}
          </small>
        ) : null}
      </div>

      <button
        aria-busy={isSubmitting || undefined}
        className={styles.submitButton}
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? content.submittingLabel : content.submitLabel}
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
          {content.useAnotherEmailLabel}
        </button>
      </div>
    </form>
  );
}
