import Link from "next/link";
import { Fragment } from "react";
import styles from "@/components/nexus-workspace-ui/nexus-workspace-breadcrumb.module.css";

export type NexusWorkspaceBreadcrumbTrail = {
  href: string;
  label: string;
};

type NexusWorkspaceBreadcrumbProps = {
  current: string;
  onNavigate?: (href: string) => void;
  trail: readonly NexusWorkspaceBreadcrumbTrail[];
};

function ChevronRightIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 16 16">
      <path d="m6 3.5 4.5 4.5L6 12.5" />
    </svg>
  );
}

/**
 * Jejak lokasi untuk halaman turunan ruang kerja. Halaman yang menyimpan
 * perubahan belum tersimpan dapat memakai `onNavigate` untuk meminta
 * konfirmasi lebih dahulu tanpa membuat pola tautan kedua.
 */
export function NexusWorkspaceBreadcrumb({
  current,
  onNavigate,
  trail,
}: NexusWorkspaceBreadcrumbProps) {
  return (
    <nav aria-label="Jejak halaman" className={styles.breadcrumb}>
      {trail.map((step) => (
        <Fragment key={step.href}>
          <Link
            href={step.href}
            onClick={
              onNavigate
                ? (event) => {
                    event.preventDefault();
                    onNavigate(step.href);
                  }
                : undefined
            }
            prefetch={false}
          >
            {step.label}
          </Link>
          <span aria-hidden="true" className={styles.separator}>
            <ChevronRightIcon />
          </span>
        </Fragment>
      ))}
      <span aria-current="page" className={styles.current}>
        {current}
      </span>
    </nav>
  );
}
