import Image from "next/image";
import type { ReactNode } from "react";
import { DEFAULT_MEMBER_AVATAR_POSITION } from "@/components/nexus-members/nexus-member-avatar";
import styles from "@/components/nexus-members/nexus-members.module.css";
import type {
  NexusMemberAccountStatus,
  NexusMemberRecord,
  NexusMemberStatus,
} from "@/components/nexus-members/nexus-members-content";
import { personInitials } from "@/components/nexus-workspace-ui/nexus-workspace-format";

export type MemberIconName =
  | "arrow"
  | "calendar"
  | "chevron"
  | "download"
  | "edit"
  | "email"
  | "filter"
  | "link"
  | "location"
  | "lock"
  | "plus"
  | "phone";

export const accountStatusLabels: Record<NexusMemberAccountStatus, string> = {
  ACTIVE: "Aktif",
  INVITED: "Undangan dikirim",
  SUSPENDED: "Ditangguhkan",
};

export function MemberIcon({ name }: { name: MemberIconName }) {
  const paths = {
    arrow: <path d="M19 12H5m5-5-5 5 5 5" />,
    calendar: (
      <>
        <rect height="15" rx="2" width="16" x="4" y="5" />
        <path d="M8 3v4m8-4v4M4 10h16" />
      </>
    ),
    chevron: <path d="m9 6 6 6-6 6" />,
    download: (
      <>
        <path d="M12 3v11m0 0 4-4m-4 4-4-4" />
        <path d="M5 15v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3" />
      </>
    ),
    edit: (
      <>
        <circle cx="9.5" cy="8" r="3.6" />
        <path d="M3.5 20a6 6 0 0 1 9.1-5.1" />
        <path d="m20.4 12.6-5.5 5.5-2.7.8.8-2.7 5.5-5.5a1.3 1.3 0 0 1 1.9 1.9Z" />
      </>
    ),
    email: (
      <>
        <rect height="14" rx="2" width="18" x="3" y="5" />
        <path d="m4 7 8 6 8-6" />
      </>
    ),
    filter: <path d="M4 5h16l-6.2 7v5.2L10.2 19v-7L4 5Z" />,
    link: (
      <>
        <path d="m10.5 13.5 3-3" />
        <path d="M8.2 15.8 6.8 17.2a3.5 3.5 0 0 1-5-5l3-3a3.5 3.5 0 0 1 5 0" />
        <path d="m15.8 8.2 1.4-1.4a3.5 3.5 0 0 1 5 5l-3 3a3.5 3.5 0 0 1-5 0" />
      </>
    ),
    location: (
      <>
        <path d="M12 21s6-5.2 6-11a6 6 0 1 0-12 0c0 5.8 6 11 6 11Z" />
        <circle cx="12" cy="10" r="2" />
      </>
    ),
    lock: (
      <>
        <rect height="11" rx="2" width="14" x="5" y="10" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    phone: (
      <path d="M7.2 3.5 10 8 7.8 10c1.3 2.7 3.5 4.9 6.2 6.2l2-2.2 4.5 2.8-.8 3c-.2.8-1 1.3-1.8 1.2C10.3 20.2 3.8 13.7 3 6.1c-.1-.8.4-1.6 1.2-1.8l3-.8Z" />
    ),
  } satisfies Record<MemberIconName, ReactNode>;

  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      {paths[name]}
    </svg>
  );
}

export function displayMemberValue(value?: string) {
  return value?.trim() || "Belum tercatat";
}

export function displayMemberDate(value?: string) {
  if (!value) return "Belum tercatat";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

export function memberStatusTone(status: NexusMemberStatus) {
  if (status === "active") return "positive";
  if (status === "on_leave") return "warning";
  return "neutral";
}

export function MemberDetailCard({
  items,
  title,
  wide = false,
}: {
  items: { label: string; value?: ReactNode }[];
  title: string;
  wide?: boolean;
}) {
  return (
    <section className={styles.detailCard} data-wide={wide || undefined}>
      <h3>{title}</h3>
      <dl>
        {items.map((item) => (
          <div key={item.label}>
            <dt>{item.label}</dt>
            <dd>{item.value || "Belum tercatat"}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function MemberGuidanceCard({
  action,
  description,
  icon,
  title,
}: {
  action?: ReactNode;
  description: string;
  icon: MemberIconName;
  title: string;
}) {
  return (
    <aside className={styles.guidanceCard}>
      <span aria-hidden="true" className={styles.guidanceIcon}>
        <MemberIcon name={icon} />
      </span>
      <div className={styles.guidanceCopy}>
        <strong>{title}</strong>
        <p>{description}</p>
      </div>
      {action ? <div className={styles.guidanceAction}>{action}</div> : null}
    </aside>
  );
}

export function MemberAvatar({ member }: { member: NexusMemberRecord }) {
  const avatarPosition =
    member.avatarPosition ?? DEFAULT_MEMBER_AVATAR_POSITION;

  return (
    <span className={styles.avatarWrap}>
      {member.avatarSrc ? (
        <Image
          alt={`Foto ${member.name}`}
          fill
          sizes="(max-width: 768px) 72px, 104px"
          src={member.avatarSrc}
          style={{
            objectPosition: `${avatarPosition.x}% ${avatarPosition.y}%`,
          }}
        />
      ) : (
        <span
          aria-label={`Inisial ${member.name}`}
          className={styles.avatarFallback}
          role="img"
        >
          {personInitials(member.name)}
        </span>
      )}
      <span
        aria-hidden="true"
        className={styles.presence}
        data-tone={memberStatusTone(member.membership.status)}
      />
    </span>
  );
}
