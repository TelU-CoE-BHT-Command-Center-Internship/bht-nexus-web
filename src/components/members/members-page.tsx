import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import ditaPortrait from "@/assets/members/dita-puspitasari.webp";
import fathurPortrait from "@/assets/members/fathur-rahman.webp";
import hestyPortrait from "@/assets/members/hesty-susanti.png";
import lailyPortrait from "@/assets/members/laily-ade-oktaviana.webp";
import miftadiPortrait from "@/assets/members/miftadi-sudjai.webp";
import ammarPortrait from "@/assets/members/muhammad-ammar-asyraf.webp";
import salsabilaPortrait from "@/assets/members/salsabila-aurellia.webp";
import suksmandhiraPortrait from "@/assets/members/suksmandhira-harimurti.webp";
import {
  getMembersContent,
  type MemberPortrait,
  type MemberValueIcon,
} from "@/components/members/members-content";
import styles from "@/components/members/members-page.module.css";
import { COE_BHT_LINKS } from "@/content/coe-bht";
import type { Locale } from "@/i18n/locales";

type MembersPageProps = {
  locale: Locale;
};

const memberPortraits: Record<MemberPortrait, StaticImageData> = {
  ammar: ammarPortrait,
  dita: ditaPortrait,
  fathur: fathurPortrait,
  laily: lailyPortrait,
  miftadi: miftadiPortrait,
  salsabila: salsabilaPortrait,
  suksmandhira: suksmandhiraPortrait,
};

function HomeIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <path d="m4 10 8-6 8 6v9a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1v-9Z" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none">
      <path d="m6 3 5 5-5 5" />
    </svg>
  );
}

function ValueIcon({ icon }: { icon: MemberValueIcon }) {
  if (icon === "team") {
    return (
      <svg aria-hidden="true" viewBox="0 0 32 32" fill="none">
        <circle cx="11" cy="10" r="4" />
        <circle cx="22" cy="10" r="4" />
        <path d="M3.5 26v-3.5A6.5 6.5 0 0 1 10 16h2a6.5 6.5 0 0 1 6.5 6.5V26M17 18.2a6 6 0 0 1 4-2.2h2a6 6 0 0 1 6 6v4" />
      </svg>
    );
  }

  if (icon === "commitment") {
    return (
      <svg aria-hidden="true" viewBox="0 0 32 32" fill="none">
        <path d="M12 4h8M13 4v8L5.5 25a2 2 0 0 0 1.7 3h17.6a2 2 0 0 0 1.7-3L19 12V4" />
        <path d="M10 22h12M13 18l2 1.5 4-4" />
      </svg>
    );
  }

  if (icon === "collaboration") {
    return (
      <svg aria-hidden="true" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="12" />
        <path d="M4 16h24M16 4c3.5 3.3 5.3 7.3 5.3 12S19.5 24.7 16 28c-3.5-3.3-5.3-7.3-5.3-12S12.5 7.3 16 4Z" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 32 32" fill="none">
      <path d="M16 27S5 21.3 5 12.5A6.5 6.5 0 0 1 16 7.8a6.5 6.5 0 0 1 11 4.7C27 21.3 16 27 16 27Z" />
      <path d="M9 16h4l2-4 3.2 8 2-4H24" />
    </svg>
  );
}

function AcademicIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <path d="m3 8 9-4 9 4-9 4-9-4Z" />
      <path d="M6 10.5V16c3.5 2.7 8.5 2.7 12 0v-5.5M21 8v7" />
    </svg>
  );
}

function ExpertiseIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2.5 14 5l3-.2.8 2.9 2.7 1.4-1.1 2.8 1.1 2.8-2.7 1.4-.8 2.9-3-.2-2 2.5-2-2.5-3 .2-.8-2.9-2.7-1.4 1.1-2.8-1.1-2.8 2.7-1.4L7 4.8l3 .2 2-2.5Z" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <path d="M4 12h15M14 7l5 5-5 5" />
    </svg>
  );
}

function CollaborationIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 44 44" fill="none">
      <circle cx="17" cy="15" r="5" />
      <circle cx="30" cy="17" r="4" />
      <path d="M6 34v-4a9 9 0 0 1 9-9h4a9 9 0 0 1 9 9v4M27 23h3a8 8 0 0 1 8 8v3" />
    </svg>
  );
}

export function MembersPage({ locale }: MembersPageProps) {
  const content = getMembersContent(locale);
  const homeHref = locale === "id" ? "/" : "/en";
  const leadershipTitleId = `members-leadership-${locale}`;
  const managementTitleId = `members-management-${locale}`;

  return (
    <main id="main-content" tabIndex={-1}>
      <section
        className={styles.hero}
        aria-labelledby={`members-title-${locale}`}
      >
        <div className={styles.heroInner}>
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <ol>
              <li>
                <Link href={homeHref} prefetch={false}>
                  <HomeIcon />
                  <span>{content.breadcrumb.home}</span>
                </Link>
              </li>
              <li aria-hidden="true" className={styles.breadcrumbSeparator}>
                <ChevronIcon />
              </li>
              <li>
                <span>{content.breadcrumb.about}</span>
              </li>
              <li aria-hidden="true" className={styles.breadcrumbSeparator}>
                <ChevronIcon />
              </li>
              <li>
                <span aria-current="page">{content.breadcrumb.current}</span>
              </li>
            </ol>
          </nav>

          <div className={styles.heroCopy}>
            <h1 id={`members-title-${locale}`}>{content.heroTitle}</h1>
            <p>{content.heroDescription}</p>
          </div>

          <ul className={styles.values}>
            {content.values.map((value) => (
              <li key={value.title}>
                <span className={styles.valueIcon}>
                  <ValueIcon icon={value.icon} />
                </span>
                <span>
                  <strong>{value.title}</strong>
                  <small>{value.description}</small>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        className={styles.membersSection}
        aria-labelledby={leadershipTitleId}
      >
        <div className={styles.membersInner}>
          <header className={styles.sectionHeading}>
            <p>{content.leadershipEyebrow}</p>
            <h2 id={leadershipTitleId}>{content.leadershipTitle}</h2>
          </header>

          <article className={styles.chairCard}>
            <div className={styles.chairPortrait}>
              <Image
                alt=""
                fill
                placeholder="blur"
                sizes="(max-width: 768px) 15rem, 16rem"
                src={hestyPortrait}
              />
            </div>
            <div className={styles.chairContent}>
              <h3>{content.chair.name}</h3>
              <span aria-hidden="true" className={styles.chairDivider} />
              <dl className={styles.chairDetails}>
                <div>
                  <dt>
                    <AcademicIcon />
                    <span className={styles.visuallyHidden}>Discipline</span>
                  </dt>
                  <dd>{content.chair.discipline}</dd>
                </div>
                <div>
                  <dt>
                    <ExpertiseIcon />
                    <span className={styles.visuallyHidden}>Expertise</span>
                  </dt>
                  <dd>{content.chair.expertise}</dd>
                </div>
              </dl>
              <p>{content.chair.description}</p>
            </div>
          </article>

          <section
            className={styles.management}
            aria-labelledby={managementTitleId}
          >
            <header className={styles.managementHeading}>
              <h2 id={managementTitleId}>{content.managementEyebrow}</h2>
            </header>

            <ol className={styles.managementGrid}>
              {content.managementMembers.map((member, index) => (
                <li className={styles.memberCard} key={member.name}>
                  <span className={styles.memberNumber}>{index + 1}</span>
                  <div className={styles.memberPortrait}>
                    <Image
                      alt=""
                      fill
                      placeholder="blur"
                      sizes="(max-width: 540px) 7.5rem, (max-width: 1120px) 8.5rem, 9rem"
                      src={memberPortraits[member.portrait]}
                    />
                  </div>
                  <div className={styles.memberContent}>
                    <h3>{member.name}</h3>
                    <h4>{member.field}</h4>
                    <p>{member.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <aside className={styles.collaboration}>
            <span className={styles.collaborationIcon}>
              <CollaborationIcon />
            </span>
            <div>
              <h2>{content.collaboration.title}</h2>
              <p>{content.collaboration.description}</p>
            </div>
            <a
              className={styles.collaborationAction}
              href={COE_BHT_LINKS.email}
            >
              {content.collaboration.action}
              <ArrowIcon />
            </a>
          </aside>
        </div>
      </section>
    </main>
  );
}
