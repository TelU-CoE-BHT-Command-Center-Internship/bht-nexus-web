import Image from "next/image";
import styles from "@/components/latest-events/latest-events.module.css";
import { getLatestEventsContent } from "@/components/latest-events/latest-events-content";
import type { Locale } from "@/i18n/locales";

type LatestEventsProps = {
  locale: Locale;
};

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M4 12h15M14 6l6 6-6 6" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3.25 2" />
    </svg>
  );
}

function ExpandIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M8.5 4H4v4.5M15.5 4H20v4.5M20 15.5V20h-4.5M8.5 20H4v-4.5" />
    </svg>
  );
}

export function LatestEvents({ locale }: LatestEventsProps) {
  const content = getLatestEventsContent(locale);
  const titleId = `latest-events-title-${locale}`;

  return (
    <section
      aria-labelledby={titleId}
      className={styles.section}
      id="latest-events"
    >
      <div className={styles.inner}>
        <header className={styles.header}>
          <h2 id={titleId}>{content.title}</h2>
          <a className={styles.allEventsLink} href={content.allEventsHref}>
            <span>{content.allEventsLabel}</span>
            <ArrowIcon />
          </a>
        </header>

        <ul className={styles.list}>
          {content.events.map((event) => (
            <li className={styles.item} key={event.title}>
              <article className={styles.card}>
                <a
                  aria-label={`${content.openImageLabel}: ${event.title}`}
                  className={styles.imageLink}
                  href={event.image.src}
                  rel="noreferrer"
                  target="_blank"
                >
                  <Image
                    alt={event.alt}
                    className={`${styles.image} ${
                      event.preserveImage
                        ? styles.imageContain
                        : styles.imageCover
                    }`}
                    fill
                    sizes="(max-width: 34rem) calc(100vw - 2rem), (max-width: 48rem) 17rem, 23rem"
                    src={event.image}
                  />
                  <span className={styles.imageAction}>
                    <ExpandIcon />
                    <span>{content.openImageLabel}</span>
                  </span>
                </a>

                <div className={styles.content}>
                  <time className={styles.date} dateTime={event.date.iso}>
                    <span className={styles.day}>{event.date.day}</span>
                    <span className={styles.monthYear}>
                      {event.date.monthYear}
                    </span>
                  </time>

                  <h3>
                    <a href={event.href}>{event.title}</a>
                  </h3>

                  <p className={styles.time}>
                    <ClockIcon />
                    <time dateTime={event.schedule.iso}>
                      {event.schedule.label}
                    </time>
                  </p>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
