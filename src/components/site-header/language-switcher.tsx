"use client";

import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import indonesiaFlag from "@/assets/Flag_of_Indonesia.svg";
import unitedKingdomFlag from "@/assets/Flag_of_the_United_Kingdom_(3-5).svg";
import styles from "@/components/site-header/site-header.module.css";
import type { Locale } from "@/components/site-header/site-navigation";

type LanguageSwitcherProps = {
  className: string;
  label: string;
  locale: Locale;
  onNavigate?: () => void;
};

type LanguageOption = {
  flag: StaticImageData;
  label: string;
  locale: Locale;
};

const languageOptions: LanguageOption[] = [
  {
    flag: indonesiaFlag,
    label: "Bahasa Indonesia",
    locale: "id",
  },
  {
    flag: unitedKingdomFlag,
    label: "English",
    locale: "en",
  },
];

const localizedRoutes: Record<string, Record<Locale, string>> = {
  "/": { en: "/en", id: "/" },
  "/anggota": { en: "/en/members", id: "/anggota" },
  "/en": { en: "/en", id: "/" },
  "/en/members": { en: "/en/members", id: "/anggota" },
};

function getLocalizedHref(pathname: string, targetLocale: Locale) {
  const route = localizedRoutes[pathname];

  if (route) {
    return route[targetLocale];
  }

  return targetLocale === "id" ? "/" : "/en";
}

export function LanguageSwitcher({
  className,
  label,
  locale,
  onNavigate,
}: LanguageSwitcherProps) {
  const pathname = usePathname();

  return (
    <nav className={className} aria-label={label}>
      {languageOptions.map((option) => {
        const isActive = locale === option.locale;

        return (
          <Link
            aria-current={isActive ? "page" : undefined}
            aria-label={option.label}
            data-active={isActive}
            href={getLocalizedHref(pathname, option.locale)}
            key={option.locale}
            prefetch={false}
            title={option.label}
            onClick={onNavigate}
          >
            <span className={styles.languageFlag}>
              <Image src={option.flag} alt="" sizes="1.5rem" unoptimized />
            </span>
            <span className={styles.visuallyHidden}>{option.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
