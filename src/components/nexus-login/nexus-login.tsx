import Image from "next/image";
import Link from "next/link";
import blackLogo from "@/assets/coe-bht-logo-black.png";
import indonesiaFlag from "@/assets/Flag_of_Indonesia.svg";
import unitedKingdomFlag from "@/assets/Flag_of_the_United_Kingdom_(3-5).svg";
import telkomUniversityLogo from "@/assets/telkom-university-logo.webp";
import whatsappIcon from "@/assets/whatsapp-svgrepo-com.svg";
import styles from "@/components/nexus-login/nexus-login.module.css";
import { getNexusLoginContent } from "@/components/nexus-login/nexus-login-content";
import { NexusLoginForm } from "@/components/nexus-login/nexus-login-form";
import type { Locale } from "@/components/site-header/site-navigation";

type NexusLoginProps = {
  locale: Locale;
};

function ArrowBackIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M19 12H5M10 7l-5 5 5 5" />
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

export function NexusLogin({ locale }: NexusLoginProps) {
  const content = getNexusLoginContent(locale);
  const isIndonesian = locale === "id";
  const activeFlag = isIndonesian ? indonesiaFlag : unitedKingdomFlag;
  const alternativeFlag = isIndonesian ? unitedKingdomFlag : indonesiaFlag;
  const activeLanguage = isIndonesian ? "ID" : "EN";
  const alternativeLanguage = isIndonesian ? "EN" : "ID";

  return (
    <main className={styles.page} id="main-content" tabIndex={-1}>
      <section
        aria-labelledby={`nexus-login-title-${locale}`}
        className={styles.loginPanel}
      >
        <div className={styles.loginInner}>
          <div className={styles.utilityBar}>
            <Link
              aria-label={content.backLabel}
              className={styles.backLink}
              href={content.backHref}
              prefetch={false}
            >
              <ArrowBackIcon />
              <span className={styles.backLabelLong}>{content.backLabel}</span>
              <span className={styles.backLabelShort}>
                {content.backShortLabel}
              </span>
            </Link>

            <nav
              aria-label={content.languageLabel}
              className={styles.languageSwitcher}
            >
              <span aria-current="page" className={styles.activeLanguage}>
                <Image alt="" src={activeFlag} unoptimized />
                <span>{activeLanguage}</span>
              </span>
              <span aria-hidden="true" className={styles.languageSeparator} />
              <Link href={content.switchLocaleHref} prefetch={false}>
                <Image alt="" src={alternativeFlag} unoptimized />
                <span>{alternativeLanguage}</span>
              </Link>
            </nav>
          </div>

          <Link
            aria-label={content.backLabel}
            className={styles.logoLink}
            href={content.backHref}
            prefetch={false}
          >
            <Image
              alt="CoE Biomedical & Healthcare Technology"
              className={styles.logo}
              sizes="(max-width: 30rem) 15rem, 17rem"
              src={blackLogo}
            />
          </Link>

          <div className={styles.formHeading}>
            <h1 id={`nexus-login-title-${locale}`}>{content.formTitle}</h1>
            <p>{content.formDescription}</p>
          </div>

          <NexusLoginForm content={content} />

          <div className={styles.supportLinks}>
            <a href={content.forgotPasswordHref}>
              <LockIcon />
              <span>{content.forgotPasswordLabel}</span>
            </a>
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

          <p className={styles.invitationNote}>{content.invitationNote}</p>
        </div>
      </section>

      <section aria-label={content.platformName} className={styles.storyPanel}>
        <div className={styles.storyInner}>
          <div className={styles.brandComposition}>
            <p className={styles.nexusWordmark}>{content.platformName}</p>
            <p className={styles.storyTagline}>{content.storyTagline}</p>
          </div>

          <Image
            alt="Telkom University"
            className={styles.telkomUniversityLogo}
            sizes="9rem"
            src={telkomUniversityLogo}
          />
        </div>
      </section>
    </main>
  );
}
