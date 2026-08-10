"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  getHeroSlides,
  type HeroSlide,
} from "@/components/landing-hero/hero-content";
import styles from "@/components/landing-hero/landing-hero.module.css";
import type { Locale } from "@/i18n/locales";

type LandingHeroProps = {
  locale: Locale;
};

const carouselLabels = {
  id: {
    controls: "Pilih sorotan CoE BHT",
    select: "Tampilkan sorotan",
    status: "Sorotan aktif",
  },
  en: {
    controls: "Choose a CoE BHT highlight",
    select: "Show highlight",
    status: "Active highlight",
  },
} satisfies Record<
  Locale,
  { controls: string; select: string; status: string }
>;

type HexagonControlProps = {
  active: boolean;
  index: number;
  locale: Locale;
  onSelect: (index: number) => void;
  slide: HeroSlide;
};

function HexagonControl({
  active,
  index,
  locale,
  onSelect,
  slide,
}: HexagonControlProps) {
  const labels = carouselLabels[locale];

  return (
    <button
      className={styles.hexagon}
      type="button"
      data-active={active}
      data-position={index}
      aria-pressed={active}
      aria-label={`${labels.select}: ${slide.title}`}
      onClick={() => onSelect(index)}
    >
      <span className={styles.hexagonFrame}>
        <span className={styles.hexagonRing} aria-hidden="true" />
        <span className={styles.hexagonMedia}>
          <Image
            className={styles.thumbnail}
            src={slide.image}
            alt=""
            fill
            placeholder="blur"
            sizes="(max-width: 480px) 128px, (max-width: 960px) 160px, 208px"
          />
          <span className={styles.thumbnailVeil} aria-hidden="true" />
          {!active && (
            <span className={styles.plus} aria-hidden="true">
              +
            </span>
          )}
        </span>
      </span>
    </button>
  );
}

export function LandingHero({ locale }: LandingHeroProps) {
  const slides = getHeroSlides(locale);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeSlide = slides[activeIndex] ?? slides[0];
  const titleId = `landing-hero-title-${locale}`;
  const labels = carouselLabels[locale];

  return (
    <section className={styles.hero} aria-labelledby={titleId}>
      <div className={styles.backgrounds} aria-hidden="true">
        {slides.map((slide, index) => (
          <Image
            className={styles.backgroundImage}
            src={slide.image}
            alt=""
            fill
            placeholder="blur"
            preload={index === 0}
            sizes="100vw"
            style={{ objectPosition: slide.imagePosition }}
            data-active={index === activeIndex}
            key={slide.id}
          />
        ))}
      </div>

      <div className={styles.imageVeil} aria-hidden="true" />

      <div className={styles.inner}>
        <div className={styles.copy} key={activeSlide.id}>
          <h1 id={titleId}>{activeSlide.title}</h1>
          <p className={styles.lead}>{activeSlide.lead}</p>

          <Link
            className={styles.action}
            href={activeSlide.action.href}
            prefetch={false}
          >
            <span>{activeSlide.action.label}</span>
            <span aria-hidden="true">»</span>
          </Link>
        </div>

        <fieldset className={styles.hexagonControls}>
          <legend className={styles.controlLegend}>{labels.controls}</legend>
          {slides.map((slide, index) => (
            <HexagonControl
              active={index === activeIndex}
              index={index}
              key={slide.id}
              locale={locale}
              onSelect={setActiveIndex}
              slide={slide}
            />
          ))}
        </fieldset>
      </div>

      <p className={styles.slideStatus} aria-live="polite">
        {labels.status}: {activeSlide.title}
      </p>

      <p className={styles.photoCredits}>
        Open Library Telkom University: Meilinaayuningtyas, CC BY-SA 4.0.
        Bandung Techno Park: Meilinaekaa, CC BY-SA 4.0. Sources: Wikimedia
        Commons.
      </p>
    </section>
  );
}
