"use client";

import Image from "next/image";
import Link from "next/link";
import { type KeyboardEvent, useId, useState } from "react";
import styles from "@/components/research-focus/research-focus.module.css";
import type { ResearchFocusContent } from "@/components/research-focus/research-focus-content";

type ResearchExplorerProps = {
  content: ResearchFocusContent;
};

type TabKeyboardEvent = KeyboardEvent<HTMLButtonElement>;

function getNextTabIndex(
  event: TabKeyboardEvent,
  currentIndex: number,
  tabCount: number,
) {
  if (event.key === "Home") {
    return 0;
  }

  if (event.key === "End") {
    return tabCount - 1;
  }

  if (event.key === "ArrowRight" || event.key === "ArrowDown") {
    return (currentIndex + 1) % tabCount;
  }

  if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
    return (currentIndex - 1 + tabCount) % tabCount;
  }

  return null;
}

function selectAdjacentTab(
  event: TabKeyboardEvent,
  currentIndex: number,
  tabCount: number,
  onSelect: (index: number) => void,
) {
  const nextIndex = getNextTabIndex(event, currentIndex, tabCount);

  if (nextIndex === null) {
    return;
  }

  event.preventDefault();
  onSelect(nextIndex);

  const tabs =
    event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>(
      '[role="tab"]',
    );
  tabs?.[nextIndex]?.focus();
}

function DirectionIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 80 32" fill="none">
      <path d="M1 16h73M60 2l14 14-14 14" />
    </svg>
  );
}

export function ResearchExplorer({ content }: ResearchExplorerProps) {
  const idPrefix = useId();
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const [activeTopicIndex, setActiveTopicIndex] = useState(0);
  const activeCategory = content.categories[activeCategoryIndex];
  const activeTopic = activeCategory.topics[activeTopicIndex];

  const selectCategory = (index: number) => {
    setActiveCategoryIndex(index);
    setActiveTopicIndex(0);
  };

  return (
    <div className={styles.explorer}>
      <div
        className={styles.categoryTabs}
        role="tablist"
        aria-label={content.categoryNavigationLabel}
      >
        {content.categories.map((category, index) => {
          const isActive = index === activeCategoryIndex;

          return (
            <button
              className={styles.categoryTab}
              id={`${idPrefix}-category-${category.id}`}
              key={category.id}
              type="button"
              role="tab"
              aria-controls={`${idPrefix}-category-panel`}
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              onClick={() => selectCategory(index)}
              onKeyDown={(event) =>
                selectAdjacentTab(
                  event,
                  index,
                  content.categories.length,
                  selectCategory,
                )
              }
            >
              {category.label}
            </button>
          );
        })}
      </div>

      <div
        className={styles.categoryPanel}
        id={`${idPrefix}-category-panel`}
        role="tabpanel"
        aria-labelledby={`${idPrefix}-category-${activeCategory.id}`}
      >
        <div className={styles.visualColumn}>
          <div
            className={styles.visual}
            id={`${idPrefix}-topic-panel`}
            role="tabpanel"
            aria-labelledby={`${idPrefix}-topic-${activeTopic.id}`}
            key={`${activeCategory.id}-${activeTopic.id}`}
          >
            <Image
              className={styles.image}
              src={activeTopic.image}
              alt={activeTopic.imageAlt}
              fill
              sizes="(max-width: 767px) calc(100vw - 32px), (max-width: 1100px) 54vw, 704px"
            />
          </div>

          <div className={styles.description}>
            <p>{activeTopic.description}</p>
            <Link
              className={styles.topicLink}
              href={activeTopic.href}
              prefetch={false}
              aria-label={`${content.exploreLabel}: ${activeTopic.title}`}
            >
              <DirectionIcon />
            </Link>
          </div>
        </div>

        <div
          className={styles.topicTabs}
          role="tablist"
          aria-label={`${content.topicNavigationLabel}: ${activeCategory.label}`}
          aria-orientation="vertical"
        >
          {activeCategory.topics.map((topic, index) => {
            const isActive = index === activeTopicIndex;

            return (
              <button
                className={styles.topicTab}
                id={`${idPrefix}-topic-${topic.id}`}
                key={topic.id}
                type="button"
                role="tab"
                aria-controls={`${idPrefix}-topic-panel`}
                aria-selected={isActive}
                tabIndex={isActive ? 0 : -1}
                onClick={() => setActiveTopicIndex(index)}
                onKeyDown={(event) =>
                  selectAdjacentTab(
                    event,
                    index,
                    activeCategory.topics.length,
                    setActiveTopicIndex,
                  )
                }
              >
                {topic.title}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
