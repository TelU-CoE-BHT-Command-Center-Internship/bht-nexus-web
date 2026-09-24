"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import styles from "@/components/nexus-broadcast/nexus-broadcast.module.css";
import { NexusBroadcastIcon } from "@/components/nexus-broadcast/nexus-broadcast-icons";
import type {
  BroadcastCheckId,
  BroadcastCheckStatus,
  BroadcastReadiness,
  BroadcastRecipientMember,
  BroadcastRecipientSummary,
} from "@/components/nexus-broadcast/nexus-broadcast-model";
import { useNexusWorkspaceNavigation } from "@/components/nexus-workspace-ui/nexus-workspace-unsaved-changes";

const MEMBER_LIST_LIMIT = 6;

type BroadcastPanelProps = {
  action?: ReactNode;
  children: ReactNode;
  description?: string;
  headingId: string;
  step: number;
  title: string;
};

function BroadcastPanel({
  action,
  children,
  description,
  headingId,
  step,
  title,
}: BroadcastPanelProps) {
  return (
    <section aria-labelledby={headingId} className={styles.panel}>
      <header className={styles.panelHeader}>
        <span aria-hidden="true" className={styles.panelStep}>
          {step}
        </span>
        <div className={styles.panelHeading}>
          <h3 id={headingId} tabIndex={-1}>
            {title}
          </h3>
          {description ? <p>{description}</p> : null}
        </div>
        {action}
      </header>
      <div className={styles.panelBody}>{children}</div>
    </section>
  );
}

function memberHref(memberId: string) {
  return `/nexus/anggota?member=${encodeURIComponent(memberId)}`;
}

function MemberLinks({
  members,
}: {
  members: readonly BroadcastRecipientMember[];
}) {
  const navigate = useNexusWorkspaceNavigation();
  const shown = members.slice(0, MEMBER_LIST_LIMIT);
  const remaining = members.length - shown.length;

  return (
    <ul className={styles.memberList}>
      {shown.map((member) => (
        <li key={member.memberId}>
          <span className={styles.memberName}>{member.name}</span>
          <Link
            aria-label={`Lengkapi email ${member.name}`}
            className={styles.memberAction}
            href={memberHref(member.memberId)}
            onNavigate={(event) => {
              event.preventDefault();
              navigate(memberHref(member.memberId));
            }}
            prefetch={false}
          >
            Lengkapi
          </Link>
        </li>
      ))}
      {remaining > 0 ? (
        <li className={styles.memberMore}>
          <span>{remaining} anggota lainnya</span>
          <Link
            className={styles.memberAction}
            href="/nexus/anggota"
            onNavigate={(event) => {
              event.preventDefault();
              navigate("/nexus/anggota");
            }}
            prefetch={false}
          >
            Buka Anggota
          </Link>
        </li>
      ) : null}
    </ul>
  );
}

function CoverageRing({ value }: { value: number }) {
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  return (
    <svg aria-hidden="true" className={styles.coverageRing} viewBox="0 0 64 64">
      <circle cx="32" cy="32" r={radius} />
      <circle
        cx="32"
        cy="32"
        r={radius}
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - value / 100)}
      />
    </svg>
  );
}

export function NexusBroadcastRecipientsPanel({
  headingId,
  recipients,
}: {
  headingId: string;
  recipients: BroadcastRecipientSummary;
}) {
  const recipientCount = recipients.addresses.length;
  const missing = recipients.missingEmailMembers.length;
  const sharedAddresses =
    recipients.eligibleMembers.length - recipients.addresses.length;
  const coverage =
    recipients.activeMembers > 0
      ? Math.round(
          (recipients.eligibleMembers.length / recipients.activeMembers) * 100,
        )
      : 0;

  return (
    <BroadcastPanel
      description="Semua anggota aktif yang memiliki email."
      headingId={headingId}
      step={1}
      title="Penerima"
    >
      <div className={styles.recipientSummary}>
        <div className={styles.coverage}>
          <CoverageRing value={coverage} />
          <span aria-hidden="true">{coverage}%</span>
        </div>
        <div className={styles.recipientTotal}>
          <strong>{recipientCount.toLocaleString("id-ID")}</strong>
          <span>
            penerima
            <small>
              dari {recipients.activeMembers.toLocaleString("id-ID")} anggota
              aktif · {coverage}% memiliki email
            </small>
          </span>
        </div>
      </div>

      <dl className={styles.recipientRows}>
        <div data-tone="complete">
          <dt>
            <NexusBroadcastIcon name="tick" />
            Memiliki email
          </dt>
          <dd>{recipients.eligibleMembers.length}</dd>
        </div>
        <div data-tone={missing > 0 ? "problem" : "complete"}>
          <dt>
            <NexusBroadcastIcon name="exclamation" />
            Belum memiliki email
          </dt>
          <dd>{missing}</dd>
        </div>
        <div data-tone="neutral">
          <dt>
            <NexusBroadcastIcon name="minus" />
            Cuti atau nonaktif
          </dt>
          <dd>{recipients.excludedMembers.length}</dd>
        </div>
      </dl>

      {sharedAddresses > 0 ? (
        <p className={styles.panelNote}>
          {sharedAddresses} anggota memakai alamat email yang sama dengan
          anggota lain, sehingga alamat tersebut menerima satu email.
        </p>
      ) : null}

      {missing > 0 ? (
        <details className={styles.memberDisclosure}>
          <summary>
            <span>Lengkapi email {missing} anggota</span>
            <NexusBroadcastIcon name="chevronDown" />
          </summary>
          <p>
            Anggota berikut ikut menerima broadcast setelah emailnya tercatat.
          </p>
          <MemberLinks members={recipients.missingEmailMembers} />
        </details>
      ) : null}

      {recipients.members === 0 ? (
        <p className={styles.panelNote}>
          Belum ada anggota yang tercatat. Tambahkan anggota di halaman Anggota
          lebih dahulu.
        </p>
      ) : null}

      <p className={styles.panelFootnote}>
        Dikirim ke email institusi anggota; bila belum tercatat, ke email
        alternatif. Anggota cuti atau nonaktif tidak menerima broadcast.
      </p>
    </BroadcastPanel>
  );
}

const checkIcons: Record<
  BroadcastCheckStatus,
  "dots" | "exclamation" | "tick"
> = {
  complete: "tick",
  pending: "dots",
  problem: "exclamation",
};

const checkStatusLabels: Record<BroadcastCheckStatus, string> = {
  complete: "Terpenuhi",
  pending: "Belum dilengkapi",
  problem: "Perlu diperbaiki",
};

const checkActions: Partial<Record<BroadcastCheckId, string>> = {
  content: "Tulis isi pesan",
  images: "Periksa gambar",
  links: "Periksa tautan",
  recipients: "Lihat penerima",
  subject: "Isi judul",
};

export function NexusBroadcastChecklistPanel({
  headingId,
  onResolve,
  readiness,
}: {
  headingId: string;
  onResolve: (checkId: BroadcastCheckId) => void;
  readiness: BroadcastReadiness;
}) {
  const total = readiness.checks.length;

  return (
    <BroadcastPanel
      description="Hal yang perlu dipenuhi sebelum broadcast ditinjau."
      headingId={headingId}
      step={2}
      title="Checklist & Validasi"
    >
      <div
        className={styles.checkSummary}
        data-ready={readiness.isReady || undefined}
      >
        <p aria-live="polite">
          <strong>
            {readiness.completeCount}/{total}
          </strong>
          <span>
            {readiness.isReady
              ? "Semua syarat terpenuhi. Broadcast siap ditinjau."
              : `${total - readiness.completeCount} syarat lagi sebelum broadcast dapat ditinjau.`}
          </span>
        </p>
        <div aria-hidden="true" className={styles.checkProgress}>
          <span
            style={{ width: `${(readiness.completeCount / total) * 100}%` }}
          />
        </div>
      </div>
      <ul className={styles.checkList}>
        {readiness.checks.map((check) => (
          <li data-status={check.status} key={check.id}>
            <span aria-hidden="true" className={styles.checkIcon}>
              <NexusBroadcastIcon name={checkIcons[check.status]} />
            </span>
            <span className={styles.checkCopy}>
              <strong>
                <span className={styles.visuallyHidden}>
                  {checkStatusLabels[check.status]}:{" "}
                </span>
                {check.label}
              </strong>
              <small>{check.detail}</small>
            </span>
            {check.status !== "complete" && checkActions[check.id] ? (
              <button
                className={styles.checkAction}
                onClick={() => onResolve(check.id)}
                type="button"
              >
                {checkActions[check.id]}
              </button>
            ) : null}
          </li>
        ))}
      </ul>
    </BroadcastPanel>
  );
}
