"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "@/components/nexus-document-workspace/nexus-document-nav.module.css";
import type { Locale } from "@/i18n/locales";

const copy = {
  id: {
    label: "Bagian ruang kerja dokumen",
    items: [
      { href: "/nexus/dokumen", label: "Pustaka" },
      { href: "/nexus/tanya-dokumen", label: "Tanya jawab" },
      { href: "/nexus/ekstraksi", label: "Ekstraksi" },
    ],
  },
  en: {
    label: "Document workspace sections",
    items: [
      { href: "/en/nexus/documents", label: "Library" },
      { href: "/en/nexus/ask-documents", label: "Q&A" },
      { href: "/en/nexus/extraction", label: "Extraction" },
    ],
  },
} satisfies Record<
  Locale,
  {
    label: string;
    items: Array<{ href: string; label: string }>;
  }
>;

export function NexusDocumentNav({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const content = copy[locale];

  return (
    <nav aria-label={content.label} className={styles.nav}>
      {content.items.map((item) => (
        <Link
          aria-current={pathname === item.href ? "page" : undefined}
          className={styles.link}
          data-active={pathname === item.href}
          href={item.href}
          key={item.href}
          prefetch={false}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
