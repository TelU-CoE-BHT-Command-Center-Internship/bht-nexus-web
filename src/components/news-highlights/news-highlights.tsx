import Image from "next/image";
import styles from "@/components/news-highlights/news-highlights.module.css";
import { getNewsHighlightsContent } from "@/components/news-highlights/news-highlights-content";
import type { Locale } from "@/components/site-header/site-navigation";

type NewsHighlightsProps = {
  locale: Locale;
};

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M4 12h15M14 6l6 6-6 6" />
    </svg>
  );
}

export function NewsHighlights({ locale }: NewsHighlightsProps) {
  const content = getNewsHighlightsContent(locale);
  const titleId = `news-highlights-title-${locale}`;

  return (
    <section
      aria-labelledby={titleId}
      className={styles.section}
      id="news-highlights"
    >
      <div className={styles.inner}>
        <article className={styles.featured}>
          <a
            aria-label={content.featured.title}
            className={styles.featuredImageLink}
            href={content.featured.href}
          >
            <Image
              alt={content.featured.alt}
              className={styles.image}
              fill
              priority={false}
              sizes="(max-width: 64rem) calc(100vw - 2rem), 37rem"
              src={content.featured.image}
            />
          </a>

          <div className={styles.featuredContent}>
            <div className={styles.featuredMeta}>
              <time dateTime={content.featured.date.iso}>
                <span className={styles.dateDay}>
                  {content.featured.date.day}
                </span>
                <span className={styles.dateMonthYear}>
                  {content.featured.date.monthYear}
                </span>
              </time>
              <span>{content.featured.category}</span>
            </div>

            <h3>
              <a href={content.featured.href}>
                {content.featured.title}
                <ArrowIcon />
              </a>
            </h3>

            <p>{content.featured.description}</p>
          </div>
        </article>

        <header className={styles.header}>
          <h2 id={titleId}>{content.title}</h2>
          <a className={styles.allNewsLink} href={content.allNewsHref}>
            <span>{content.allNewsLabel}</span>
            <ArrowIcon />
          </a>
        </header>

        <ul className={styles.list}>
          {content.items.map((item) => (
            <li key={item.title}>
              <article>
                <a className={styles.newsLink} href={item.href}>
                  <h3>{item.title}</h3>
                  <span className={styles.thumbnail}>
                    <Image
                      alt={item.alt}
                      className={styles.image}
                      fill
                      sizes="(max-width: 42rem) 5.5rem, 6.5rem"
                      src={item.image}
                    />
                  </span>
                </a>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
