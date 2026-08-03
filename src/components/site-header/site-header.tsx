import { getImageProps } from "next/image";
import Link from "next/link";
import blackLogo from "@/assets/coe-bht-logo-black.png";
import whiteLogo from "@/assets/coe-bht-logo-white.png";
import { DesktopPrimaryNavigation } from "@/components/site-header/desktop-primary-navigation";
import { LanguageSwitcher } from "@/components/site-header/language-switcher";
import { MobileNavigation } from "@/components/site-header/mobile-navigation";
import styles from "@/components/site-header/site-header.module.css";
import {
  getSiteNavigation,
  isPageSectionHref,
  type Locale,
  type NavigationItem,
} from "@/components/site-header/site-navigation";
import { StickyHeader } from "@/components/site-header/sticky-header";

type SiteHeaderProps = {
  locale: Locale;
};

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <path d="M5 12h13M14 7l5 5-5 5" />
    </svg>
  );
}

function BrandLogo() {
  const commonProperties = {
    alt: "",
    sizes: "(max-width: 480px) 188px, (max-width: 1120px) 204px, 264px",
  };
  const {
    props: { srcSet: desktopSourceSet },
  } = getImageProps({
    ...commonProperties,
    src: blackLogo,
  });
  const { props: mobileProperties } = getImageProps({
    ...commonProperties,
    fetchPriority: "high",
    src: whiteLogo,
  });

  return (
    <picture>
      <source media="(min-width: 70.0625rem)" srcSet={desktopSourceSet} />
      <img {...mobileProperties} alt="" aria-hidden="true" />
    </picture>
  );
}

function NavigationLink({ item }: { item: NavigationItem }) {
  if (item.external) {
    return (
      <a href={item.href} target="_blank" rel="noreferrer">
        {item.label}
      </a>
    );
  }

  if (isPageSectionHref(item.href)) {
    return <a href={item.href}>{item.label}</a>;
  }

  return (
    <Link href={item.href} prefetch={false}>
      {item.label}
    </Link>
  );
}

export function SiteHeader({ locale }: SiteHeaderProps) {
  const content = getSiteNavigation(locale);
  const homeHref = locale === "id" ? "/" : "/en";

  return (
    <StickyHeader>
      <div className={styles.headerInner}>
        <Link
          className={styles.brand}
          href={homeHref}
          aria-label={content.brandHomeLabel}
        >
          <BrandLogo />
        </Link>

        <div className={styles.desktopNavigation}>
          <div className={styles.utilityRow}>
            <nav aria-label={content.utilityNavigationLabel}>
              {content.utilityLinks.map((item) => (
                <NavigationLink key={item.href} item={item} />
              ))}
            </nav>

            <LanguageSwitcher
              className={styles.languageSwitcher}
              label={content.languageLabel}
              locale={locale}
            />
          </div>

          <div className={styles.primaryRow}>
            <DesktopPrimaryNavigation
              items={content.primaryLinks}
              label={content.mainNavigationLabel}
            />

            <Link
              className={styles.primaryAction}
              href={content.action.href}
              prefetch={false}
            >
              {content.action.label}
              <ArrowIcon />
            </Link>
          </div>
        </div>

        <MobileNavigation content={content} locale={locale} />
      </div>
    </StickyHeader>
  );
}
