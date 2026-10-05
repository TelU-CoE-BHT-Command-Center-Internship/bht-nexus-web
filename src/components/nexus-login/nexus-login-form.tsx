"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useRef, useState } from "react";
import whatsappIcon from "@/assets/whatsapp-svgrepo-com.svg";
import styles from "@/components/nexus-login/nexus-login.module.css";
import type { NexusLoginContent } from "@/components/nexus-login/nexus-login-content";
import {
  requestPasswordResetOtp,
  resetPasswordWithOtp,
  signInWithEmail,
  signInWithEmailOtp,
  verifyTotpSignIn,
} from "@/lib/api-auth";
import { ApiRequestError, apiErrorKind } from "@/lib/api-client";

type NexusLoginFormProps = {
  content: Pick<
    NexusLoginContent,
    | "emailLabel"
    | "emailPlaceholder"
    | "destinationHref"
    | "firstSignInHint"
    | "forgotPasswordLabel"
    | "helpHref"
    | "helpLabel"
    | "invalidCredentialsError"
    | "otpDescription"
    | "otpInvalidError"
    | "otpLabel"
    | "otpPasswordNote"
    | "otpResendLabel"
    | "otpResentNotice"
    | "otpSubmitLabel"
    | "otpTitle"
    | "passwordHideLabel"
    | "passwordLabel"
    | "passwordMismatchError"
    | "passwordPlaceholder"
    | "passwordShowLabel"
    | "passwordTooShortError"
    | "rateLimitedError"
    | "resetBackLabel"
    | "resetCodeSentNotice"
    | "resetConfirmPasswordLabel"
    | "resetDescription"
    | "resetNewPasswordLabel"
    | "resetNewPasswordPlaceholder"
    | "resetRequestDescription"
    | "resetRequestSubmitLabel"
    | "resetRequestTitle"
    | "resetSendingLabel"
    | "resetSubmitLabel"
    | "resetTitle"
    | "signInLabel"
    | "signingInLabel"
    | "stepBackLabel"
    | "suspendedError"
    | "tooManyAttemptsError"
    | "totpDescription"
    | "totpLabel"
    | "totpTitle"
    | "unavailableError"
    | "unexpectedError"
    | "verifyingLabel"
  >;
  returnPath?: string;
};

/**
 * Langkah formulir masuk. `reset-request` dan `reset` adalah alur lupa kata
 * sandi: kode dikirim ke email, lalu kode dan kata sandi baru disimpan server.
 */
type LoginStep = "credentials" | "otp" | "totp" | "reset-request" | "reset";

const MIN_PASSWORD_LENGTH = 8;

function EyeIcon({ concealed }: { concealed: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M2.8 12s3.4-5.2 9.2-5.2S21.2 12 21.2 12 17.8 17.2 12 17.2 2.8 12 2.8 12Z" />
      <circle cx="12" cy="12" r="2.6" />
      {!concealed && <path d="m4 4 16 16" />}
    </svg>
  );
}

function LockIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8.5 10V7.5a3.5 3.5 0 0 1 7 0V10" />
    </svg>
  );
}

const ERROR_ID = "nexus-login-error";
const FIRST_SIGN_IN_HINT_ID = "nexus-login-first-sign-in";

export function NexusLoginForm({ content, returnPath }: NexusLoginFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<LoginStep>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const codeInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const destination = returnPath ?? content.destinationHref;
  const isCodeStep = step === "otp" || step === "totp" || step === "reset";

  useEffect(() => {
    if (step === "otp" || step === "totp" || step === "reset") {
      codeInputRef.current?.focus();
    } else if (step === "reset-request") {
      emailInputRef.current?.focus();
    }
  }, [step]);

  function describeError(error: unknown, invalidMessage: string) {
    if (
      error instanceof ApiRequestError &&
      error.code === "TOO_MANY_ATTEMPTS"
    ) {
      return content.tooManyAttemptsError;
    }
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

  function goTo(next: LoginStep) {
    setIsSubmitting(false);
    setCode("");
    setStep(next);
  }

  async function signInWith(secret: string) {
    const outcome = await signInWithEmail({ email, password: secret });
    if (outcome.kind === "otp-required") {
      goTo("otp");
      return;
    }
    if (outcome.kind === "totp-required") {
      goTo("totp");
      return;
    }
    finish();
  }

  async function submitPasswordReset() {
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setIsSubmitting(false);
      setErrorMessage(content.passwordTooShortError);
      return;
    }
    if (newPassword !== confirmPassword) {
      setIsSubmitting(false);
      setErrorMessage(content.passwordMismatchError);
      return;
    }
    await resetPasswordWithOtp({
      email,
      otp: code.trim(),
      password: newPassword,
    });
    setPassword(newPassword);
    await signInWith(newPassword);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setNotice(null);
    setIsSubmitting(true);

    try {
      if (step === "credentials") {
        await signInWith(password);
        return;
      }
      if (step === "reset-request") {
        await requestPasswordResetOtp(email);
        setNewPassword("");
        setConfirmPassword("");
        goTo("reset");
        return;
      }
      if (step === "reset") {
        await submitPasswordReset();
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
            : step === "reset-request"
              ? content.unexpectedError
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
      if (step === "reset") {
        await requestPasswordResetOtp(email);
        setNotice(content.resetCodeSentNotice);
      } else {
        await signInWithEmail({ email, password });
        setNotice(content.otpResentNotice);
      }
    } catch (error) {
      setErrorMessage(describeError(error, content.otpInvalidError));
    } finally {
      setIsSubmitting(false);
    }
  }

  function returnToCredentials() {
    setStep("credentials");
    setCode("");
    setNewPassword("");
    setConfirmPassword("");
    setErrorMessage(null);
    setNotice(null);
  }

  function startPasswordReset() {
    setStep("reset-request");
    setCode("");
    setPassword("");
    setErrorMessage(null);
    setNotice(null);
  }

  const errorProps =
    errorMessage === null
      ? {}
      : { "aria-describedby": ERROR_ID, "aria-invalid": true as const };

  const stepTitle =
    step === "otp"
      ? content.otpTitle
      : step === "totp"
        ? content.totpTitle
        : step === "reset-request"
          ? content.resetRequestTitle
          : content.resetTitle;

  const submitLabel =
    step === "credentials"
      ? isSubmitting
        ? content.signingInLabel
        : content.signInLabel
      : step === "reset-request"
        ? isSubmitting
          ? content.resetSendingLabel
          : content.resetRequestSubmitLabel
        : isSubmitting
          ? content.verifyingLabel
          : step === "reset"
            ? content.resetSubmitLabel
            : content.otpSubmitLabel;

  return (
    <>
      <form className={styles.form} method="post" onSubmit={handleSubmit}>
        {step !== "credentials" ? (
          <div className={styles.stepIntro}>
            <h2>{stepTitle}</h2>
            <p>
              {step === "otp" ? (
                <>
                  {content.otpDescription} <strong>{email}</strong>.{" "}
                  {content.otpPasswordNote}
                </>
              ) : step === "totp" ? (
                content.totpDescription
              ) : step === "reset-request" ? (
                content.resetRequestDescription
              ) : (
                <>
                  {content.resetDescription} <strong>{email}</strong>.
                </>
              )}
            </p>
          </div>
        ) : null}

        {step === "credentials" || step === "reset-request" ? (
          <div className={styles.field}>
            <label htmlFor="nexus-email">{content.emailLabel}</label>
            <input
              autoComplete="username"
              id="nexus-email"
              inputMode="email"
              name="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder={content.emailPlaceholder}
              ref={emailInputRef}
              required
              spellCheck={false}
              type="email"
              value={email}
              {...errorProps}
            />
          </div>
        ) : (
          <input
            autoComplete="username"
            hidden
            name="username"
            readOnly
            type="email"
            value={email}
          />
        )}

        {step === "credentials" ? (
          <div className={styles.field}>
            <label htmlFor="nexus-password">{content.passwordLabel}</label>
            <div className={styles.passwordField}>
              <input
                aria-describedby={
                  errorMessage === null
                    ? FIRST_SIGN_IN_HINT_ID
                    : `${ERROR_ID} ${FIRST_SIGN_IN_HINT_ID}`
                }
                aria-invalid={errorMessage === null ? undefined : true}
                autoComplete="current-password"
                id="nexus-password"
                minLength={MIN_PASSWORD_LENGTH}
                name="password"
                onChange={(event) => setPassword(event.target.value)}
                placeholder={content.passwordPlaceholder}
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
                <EyeIcon concealed={passwordVisible} />
              </button>
            </div>
            <p className={styles.fieldHint} id={FIRST_SIGN_IN_HINT_ID}>
              {content.firstSignInHint}
            </p>
          </div>
        ) : null}

        {isCodeStep ? (
          <div className={styles.field}>
            <label htmlFor="nexus-code">
              {step === "totp" ? content.totpLabel : content.otpLabel}
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
        ) : null}

        {step === "reset" ? (
          <>
            <div className={styles.field}>
              <label htmlFor="nexus-new-password">
                {content.resetNewPasswordLabel}
              </label>
              <div className={styles.passwordField}>
                <input
                  autoComplete="new-password"
                  id="nexus-new-password"
                  minLength={MIN_PASSWORD_LENGTH}
                  name="new-password"
                  onChange={(event) => setNewPassword(event.target.value)}
                  placeholder={content.resetNewPasswordPlaceholder}
                  required
                  type={passwordVisible ? "text" : "password"}
                  value={newPassword}
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
            <div className={styles.field}>
              <label htmlFor="nexus-confirm-password">
                {content.resetConfirmPasswordLabel}
              </label>
              <input
                autoComplete="new-password"
                id="nexus-confirm-password"
                minLength={MIN_PASSWORD_LENGTH}
                name="confirm-password"
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                type={passwordVisible ? "text" : "password"}
                value={confirmPassword}
                {...errorProps}
              />
            </div>
          </>
        ) : null}

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
          {submitLabel}
        </button>

        {step !== "credentials" ? (
          <div className={styles.stepActions}>
            {step === "otp" || step === "reset" ? (
              <button
                disabled={isSubmitting}
                onClick={resendCode}
                type="button"
              >
                {content.otpResendLabel}
              </button>
            ) : null}
            <button
              disabled={isSubmitting}
              onClick={returnToCredentials}
              type="button"
            >
              {step === "reset-request" || step === "reset"
                ? content.resetBackLabel
                : content.stepBackLabel}
            </button>
          </div>
        ) : null}
      </form>

      <div className={styles.supportLinks}>
        {step === "credentials" ? (
          <button onClick={startPasswordReset} type="button">
            <LockIcon />
            <span>{content.forgotPasswordLabel}</span>
          </button>
        ) : null}
        <a href={content.helpHref} rel="noreferrer" target="_blank">
          <Image
            alt=""
            aria-hidden="true"
            className={styles.whatsappIcon}
            src={whatsappIcon}
            unoptimized
          />
          <span>{content.helpLabel}</span>
        </a>
      </div>
    </>
  );
}
