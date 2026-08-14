"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import styles from "@/components/nexus-login/nexus-login.module.css";
import type { NexusLoginContent } from "@/components/nexus-login/nexus-login-content";

type NexusLoginFormProps = {
  content: Pick<
    NexusLoginContent,
    | "emailLabel"
    | "emailPlaceholder"
    | "destinationHref"
    | "passwordHideLabel"
    | "passwordLabel"
    | "passwordPlaceholder"
    | "passwordShowLabel"
    | "signInLabel"
    | "signingInLabel"
  >;
};

function EyeIcon({ concealed }: { concealed: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M2.8 12s3.4-5.2 9.2-5.2S21.2 12 21.2 12 17.8 17.2 12 17.2 2.8 12 2.8 12Z" />
      <circle cx="12" cy="12" r="2.6" />
      {!concealed && <path d="m4 4 16 16" />}
    </svg>
  );
}

export function NexusLoginForm({ content }: NexusLoginFormProps) {
  const router = useRouter();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    router.push(content.destinationHref);
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.field}>
        <label htmlFor="nexus-email">{content.emailLabel}</label>
        <input
          autoComplete="username"
          id="nexus-email"
          inputMode="email"
          name="email"
          placeholder={content.emailPlaceholder}
          required
          spellCheck={false}
          type="email"
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
            placeholder={content.passwordPlaceholder}
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
      </div>

      <button
        className={styles.submitButton}
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? content.signingInLabel : content.signInLabel}
      </button>
    </form>
  );
}
