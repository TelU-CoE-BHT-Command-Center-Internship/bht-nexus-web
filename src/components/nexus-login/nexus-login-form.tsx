"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useRef, useState } from "react";
import styles from "@/components/nexus-login/nexus-login.module.css";
import type { NexusLoginContent } from "@/components/nexus-login/nexus-login-content";
import {
  signInWithEmail,
  signInWithEmailOtp,
  verifyTotpSignIn,
} from "@/lib/api-auth";
import { apiErrorKind } from "@/lib/api-client";

type NexusLoginFormProps = {
  content: Pick<
    NexusLoginContent,
    | "emailLabel"
    | "emailPlaceholder"
    | "destinationHref"
    | "invalidCredentialsError"
    | "otpDescription"
    | "otpInvalidError"
    | "otpLabel"
    | "otpResendLabel"
    | "otpResentNotice"
    | "otpSubmitLabel"
    | "otpTitle"
    | "passwordHideLabel"
    | "passwordLabel"
    | "passwordPlaceholder"
    | "passwordShowLabel"
    | "rateLimitedError"
    | "signInLabel"
    | "signingInLabel"
    | "stepBackLabel"
    | "suspendedError"
    | "totpDescription"
    | "totpLabel"
    | "totpTitle"
    | "unavailableError"
    | "unexpectedError"
    | "verifyingLabel"
  >;
  returnPath?: string;
};

type LoginStep = "credentials" | "otp" | "totp";

function EyeIcon({ concealed }: { concealed: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M2.8 12s3.4-5.2 9.2-5.2S21.2 12 21.2 12 17.8 17.2 12 17.2 2.8 12 2.8 12Z" />
      <circle cx="12" cy="12" r="2.6" />
      {!concealed && <path d="m4 4 16 16" />}
    </svg>
  );
}

const ERROR_ID = "nexus-login-error";

export function NexusLoginForm({ content, returnPath }: NexusLoginFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<LoginStep>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const codeInputRef = useRef<HTMLInputElement>(null);
  const destination = returnPath ?? content.destinationHref;

  useEffect(() => {
    if (step !== "credentials") codeInputRef.current?.focus();
  }, [step]);

  function describeError(error: unknown, invalidMessage: string) {
    const kind = apiErrorKind(error);
    if (kind === "unauthenticated" || kind === "validation") {
      return invalidMessage;
    }
    if (kind === "forbidden") return content.suspendedError;
    if (kind === "rate-limited") return content.rateLimitedError;
    if (kind === "unavailable") return content.unavailableError;
    return content.unexpectedError;
  }

  function finish() {
    router.replace(destination);
  }

  async function submitCredentials() {
    const outcome = await signInWithEmail({ email, password });
    if (outcome.kind === "otp-required") {
      setIsSubmitting(false);
      setCode("");
      setStep("otp");
      return;
    }
    if (outcome.kind === "totp-required") {
      setIsSubmitting(false);
      setCode("");
      setStep("totp");
      return;
    }
    finish();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setNotice(null);
    setIsSubmitting(true);

    try {
      if (step === "credentials") {
        await submitCredentials();
        return;
      }
      if (step === "otp") {
        await signInWithEmailOtp({ email, otp: code.trim(), password });
      } else {
        await verifyTotpSignIn(code.trim());
      }
      finish();
    } catch (error) {
      setIsSubmitting(false);
      setErrorMessage(
        describeError(
          error,
          step === "credentials"
            ? content.invalidCredentialsError
            : content.otpInvalidError,
        ),
      );
    }
  }

  async function resendCode() {
    setErrorMessage(null);
    setNotice(null);
    setIsSubmitting(true);
    try {
      await signInWithEmail({ email, password });
      setNotice(content.otpResentNotice);
    } catch (error) {
      setErrorMessage(describeError(error, content.otpInvalidError));
    } finally {
      setIsSubmitting(false);
    }
  }

  function returnToCredentials() {
    setStep("credentials");
    setCode("");
    setErrorMessage(null);
    setNotice(null);
  }

  const errorProps =
    errorMessage === null
      ? {}
      : { "aria-describedby": ERROR_ID, "aria-invalid": true as const };

  return (
    <form className={styles.form} method="post" onSubmit={handleSubmit}>
      {step === "credentials" ? (
        <>
          <div className={styles.field}>
            <label htmlFor="nexus-email">{content.emailLabel}</label>
            <input
              autoComplete="username"
              id="nexus-email"
              inputMode="email"
              name="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder={content.emailPlaceholder}
              required
              spellCheck={false}
              type="email"
              value={email}
              {...errorProps}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="nexus-password">{content.passwordLabel}</label>
            <div className={styles.passwordField}>
              <input
                autoComplete="current-password"
                id="nexus-password"
                minLength={8}
                name="password"
                onChange={(event) => setPassword(event.target.value)}
                placeholder={content.passwordPlaceholder}
                required
                type={passwordVisible ? "text" : "password"}
                value={password}
                {...errorProps}
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
          </div>
        </>
      ) : (
        <>
          <div className={styles.stepIntro}>
            <h2>{step === "otp" ? content.otpTitle : content.totpTitle}</h2>
            <p>
              {step === "otp" ? (
                <>
                  {content.otpDescription} <strong>{email}</strong>.
                </>
              ) : (
                content.totpDescription
              )}
            </p>
          </div>
          <input
            autoComplete="username"
            hidden
            name="username"
            readOnly
            type="email"
            value={email}
          />
          <div className={styles.field}>
            <label htmlFor="nexus-code">
              {step === "otp" ? content.otpLabel : content.totpLabel}
            </label>
            <input
              autoComplete="one-time-code"
              id="nexus-code"
              inputMode="numeric"
              maxLength={6}
              minLength={6}
              name="code"
              onChange={(event) =>
                setCode(event.target.value.replace(/\D/g, ""))
              }
              pattern="[0-9]{6}"
              ref={codeInputRef}
              required
              spellCheck={false}
              value={code}
              {...errorProps}
            />
          </div>
        </>
      )}

      {errorMessage !== null && (
        <p className={styles.formError} id={ERROR_ID} role="alert">
          {errorMessage}
        </p>
      )}
      {notice !== null && (
        <p aria-live="polite" className={styles.formNotice}>
          {notice}
        </p>
      )}

      <button
        className={styles.submitButton}
        disabled={isSubmitting}
        type="submit"
      >
        {step === "credentials"
          ? isSubmitting
            ? content.signingInLabel
            : content.signInLabel
          : isSubmitting
            ? content.verifyingLabel
            : content.otpSubmitLabel}
      </button>

      {step !== "credentials" ? (
        <div className={styles.stepActions}>
          {step === "otp" ? (
            <button disabled={isSubmitting} onClick={resendCode} type="button">
              {content.otpResendLabel}
            </button>
          ) : null}
          <button
            disabled={isSubmitting}
            onClick={returnToCredentials}
            type="button"
          >
            {content.stepBackLabel}
          </button>
        </div>
      ) : null}
    </form>
  );
}
