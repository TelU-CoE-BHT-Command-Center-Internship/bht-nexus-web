import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import footerLogo from "@/assets/coe-bht-logo-white.png";
import instagramIcon from "@/assets/instagram-1-svgrepo-com.svg";
import mailIcon from "@/assets/mail-svgrepo-com.svg";
import whatsappIcon from "@/assets/whatsapp-svgrepo-com.svg";
import styles from "@/components/site-footer/site-footer.module.css";
import {
  type FooterSocialIcon,
  getSiteFooterContent,
} from "@/components/site-footer/site-footer-content";
import { COE_BHT_LINKS } from "@/content/coe-bht";
import type { Locale } from "@/i18n/locales";

type SiteFooterProps = {
  locale: Locale;
};

const socialIcons: Record<FooterSocialIcon, StaticImageData> = {
  email: mailIcon,
  instagram: instagramIcon,
  whatsapp: whatsappIcon,
};

function DoubleChevronIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 32 34">
      <path d="m6 19 10-10 10 10" />
      <path d="m6 27 10-10 10 10" />
    </svg>
  );
}

export function SiteFooter({ locale }: SiteFooterProps) {
  const content = getSiteFooterContent(locale);
  const homeHref = locale === "id" ? "/" : "/en";
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer} id="contact">
      <div className={styles.main}>
        <div className={styles.brandColumn}>
          <Link
            aria-label={content.brandHomeLabel}
            className={styles.brandLink}
            href={homeHref}
            prefetch={false}
          >
            <Image alt="" src={footerLogo} />
          </Link>
          <a className={styles.contactButton} href={COE_BHT_LINKS.email}>
            {content.contactLabel}
          </a>
        </div>

        {content.locations.map((location) => (
          <section className={styles.locationColumn} key={location.title}>
            <h2>{location.title}</h2>
            <address>
              <a
                aria-label={location.ariaLabel}
                className={styles.locationLink}
                href={location.href}
                rel="noreferrer"
                target="_blank"
              >
                {location.lines.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </a>
            </address>
          </section>
        ))}

        <nav className={styles.quickLinks} aria-label={content.quickLinksLabel}>
          <h2>{content.quickLinksLabel}</h2>
          <ul>
            {content.quickLinks.map((link) => (
              <li key={link.href}>
                <a
                  className={styles.quickLink}
                  href={link.href}
                  rel="noreferrer"
                  target="_blank"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.institutionColumn}>
          <a
            aria-label={content.rissAriaLabel}
            className={styles.rissLink}
            href={COE_BHT_LINKS.riss}
            rel="noreferrer"
            target="_blank"
          >
            <span>
              <small>{content.rissLabel}</small>
              <strong>{content.rissTitle}</strong>
            </span>
            <DoubleChevronIcon />
          </a>

          <nav className={styles.socialLinks} aria-label={content.socialLabel}>
            <ul>
              {content.socialLinks.map((link) => (
                <li key={link.href}>
                  <a
                    aria-label={link.label}
                    className={styles.socialLink}
                    href={link.href}
                    rel={
                      link.href.startsWith("https://")
                        ? "noreferrer"
                        : undefined
                    }
                    target={
                      link.href.startsWith("https://") ? "_blank" : undefined
                    }
                  >
                    <Image
                      alt=""
                      aria-hidden="true"
                      src={socialIcons[link.icon]}
                    />
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <a
            className={styles.updatesLink}
            href={COE_BHT_LINKS.instagram}
            rel="noreferrer"
            target="_blank"
          >
            {content.updatesLabel}
          </a>
        </div>
      </div>

      <div className={styles.legalBar}>
        <div>
          <p>
            © {currentYear} {content.copyrightLabel}
          </p>
          <a
            className={styles.legalLink}
            href={COE_BHT_LINKS.privacy}
            rel="noreferrer"
            target="_blank"
          >
            {content.privacyLabel}
          </a>
        </div>
      </div>
    </footer>
  );
}
