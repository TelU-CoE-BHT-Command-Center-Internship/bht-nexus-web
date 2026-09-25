import Image from "next/image";
import Link from "next/link";
import whatsappIcon from "@/assets/whatsapp-svgrepo-com.svg";
import { NexusAuthScreen } from "@/components/nexus-login/nexus-auth-screen";
import styles from "@/components/nexus-login/nexus-login.module.css";
import { getNexusLoginContent } from "@/components/nexus-login/nexus-login-content";
import { NexusLoginForm } from "@/components/nexus-login/nexus-login-form";
import type { NexusSignInReason } from "@/components/nexus-session/nexus-session-routes";
import type { Locale } from "@/i18n/locales";

type NexusLoginProps = {
  locale: Locale;
  reason?: NexusSignInReason;
  /** Alamat ruang kerja yang sudah diperiksa aman untuk dituju setelah masuk. */
  returnPath?: string;
};

function LockIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8.5 10V7.5a3.5 3.5 0 0 1 7 0V10" />
    </svg>
  );
}

function KeyIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <circle cx="8" cy="15" r="4" />
      <path d="m10.8 12.2 8.2-8.2M16 7l2 2M13.5 9.5l2 2" />
    </svg>
  );
}

export function NexusLogin({ locale, reason, returnPath }: NexusLoginProps) {
  const content = getNexusLoginContent(locale);
  const notice =
    reason === "keluar"
      ? content.signedOutNotice
      : reason === "sesi-berakhir"
        ? content.sessionExpiredNotice
        : undefined;

  return (
    <NexusAuthScreen
      description={content.formDescription}
      footnote={content.invitationNote}
      locale={locale}
      supportLinks={
        <>
          <Link href={content.forgotPasswordHref} prefetch={false}>
            <LockIcon />
            <span>{content.forgotPasswordLabel}</span>
          </Link>
          <Link href={content.activationHref} prefetch={false}>
            <KeyIcon />
            <span>{content.activationLabel}</span>
          </Link>
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
        </>
      }
      switchLocaleHref={content.switchLocaleHref}
      title={content.formTitle}
    >
      <NexusLoginForm
        content={content}
        locale={locale}
        notice={notice}
        returnPath={returnPath}
      />
    </NexusAuthScreen>
  );
}
