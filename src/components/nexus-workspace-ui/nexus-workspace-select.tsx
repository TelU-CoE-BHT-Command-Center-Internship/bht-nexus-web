"use client";

import {
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import styles from "@/components/nexus-workspace-ui/nexus-workspace-select.module.css";

export type NexusSelectOption = {
  description?: string;
  label: string;
  tone?: "completed" | "needs-fix" | "neutral" | "waiting";
  value: string;
};

export type NexusSelectConfig = {
  defaultValue: string;
  id: string;
  label: string;
  options: readonly [NexusSelectOption, ...NexusSelectOption[]];
};

type NexusWorkspaceSelectProps = {
  config: NexusSelectConfig;
  isOpen: boolean;
  /** Ikon opsional di depan nilai, untuk kendali yang perlu penanda jenisnya. */
  leadingIcon?: ReactNode;
  name: string;
  onOpenChange: (isOpen: boolean) => void;
  onValueChange: (value: string) => void;
  placement?: "bottom" | "top" | "top-on-narrow";
  value: string;
};

type TypeaheadState = {
  query: string;
  timestamp: number;
};

const TYPEAHEAD_RESET_MS = 600;

function ChevronIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 16 16">
      <path d="m4 6 4 4 4-4" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 16 16">
      <path d="m3.5 8.25 2.75 2.75 6.25-6.25" />
    </svg>
  );
}

function findTypeaheadOption(
  options: readonly NexusSelectOption[],
  query: string,
  startIndex: number,
) {
  for (let offset = 0; offset < options.length; offset += 1) {
    const index = (startIndex + offset) % options.length;
    const option = options[index];
    if (option?.label.toLocaleLowerCase("id-ID").startsWith(query)) {
      return index;
    }
  }
  return null;
}

export function NexusWorkspaceSelect({
  config,
  isOpen,
  leadingIcon,
  name,
  onOpenChange,
  onValueChange,
  placement = "bottom",
  value,
}: NexusWorkspaceSelectProps) {
  const idPrefix = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);
  const typeaheadRef = useRef<TypeaheadState>({ query: "", timestamp: 0 });
  const selectedIndex = Math.max(
    config.options.findIndex((option) => option.value === value),
    0,
  );
  const [highlightedIndex, setHighlightedIndex] = useState(selectedIndex);
  const selectedOption = config.options[selectedIndex];
  const labelId = `${idPrefix}-label`;
  const valueId = `${idPrefix}-value`;
  const listboxId = `${idPrefix}-listbox`;

  useEffect(() => {
    if (!isOpen) return;

    const focusFrame = window.requestAnimationFrame(() => {
      listboxRef.current?.focus({ preventScroll: true });
    });
    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !rootRef.current?.contains(event.target)
      ) {
        onOpenChange(false);
      }
    };

    document.addEventListener("pointerdown", closeOnOutsidePointer, true);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("pointerdown", closeOnOutsidePointer, true);
    };
  }, [isOpen, onOpenChange]);

  useEffect(() => {
    if (!isOpen) return;
    document
      .getElementById(`${idPrefix}-option-${highlightedIndex}`)
      ?.scrollIntoView({ block: "nearest" });
  }, [highlightedIndex, idPrefix, isOpen]);

  useLayoutEffect(() => {
    if (!isOpen) return;

    const root = rootRef.current;
    const menu = listboxRef.current;
    if (!root || !menu) return;

    const viewportGutter = 16;
    const prefersRightEdge = menu.offsetLeft < 0;
    const keepMenuInsideViewport = () => {
      const rootRect = root.getBoundingClientRect();
      const menuWidth = menu.offsetWidth;
      const preferredLeft = prefersRightEdge ? rootRect.width - menuWidth : 0;
      const viewportLeft = rootRect.left + preferredLeft;
      const maximumLeft = Math.max(
        viewportGutter,
        window.innerWidth - viewportGutter - menuWidth,
      );
      const clampedViewportLeft = Math.min(
        Math.max(viewportLeft, viewportGutter),
        maximumLeft,
      );

      menu.style.left = `${clampedViewportLeft - rootRect.left}px`;
      menu.style.right = "auto";
    };

    keepMenuInsideViewport();
    window.addEventListener("resize", keepMenuInsideViewport);
    return () => {
      window.removeEventListener("resize", keepMenuInsideViewport);
    };
  }, [isOpen]);

  const openMenu = () => {
    setHighlightedIndex(selectedIndex);
    onOpenChange(true);
  };

  const closeMenu = (restoreTriggerFocus = false) => {
    onOpenChange(false);
    if (restoreTriggerFocus) triggerRef.current?.focus();
  };

  const selectOption = (index: number) => {
    const option = config.options[index];
    if (!option) return;
    onValueChange(option.value);
    closeMenu(true);
  };

  const moveHighlight = (direction: 1 | -1) => {
    setHighlightedIndex(
      (currentIndex) =>
        (currentIndex + direction + config.options.length) %
        config.options.length,
    );
  };

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
      event.preventDefault();
      openMenu();
    }
  };

  const handleListboxKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      moveHighlight(event.key === "ArrowDown" ? 1 : -1);
      return;
    }
    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      setHighlightedIndex(event.key === "Home" ? 0 : config.options.length - 1);
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectOption(highlightedIndex);
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      closeMenu(true);
      return;
    }
    if (event.key === "Tab") {
      onOpenChange(false);
      return;
    }
    if (
      event.key.length !== 1 ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey
    ) {
      return;
    }

    const timestamp = Date.now();
    const normalizedKey = event.key.toLocaleLowerCase("id-ID");
    const query =
      timestamp - typeaheadRef.current.timestamp < TYPEAHEAD_RESET_MS
        ? `${typeaheadRef.current.query}${normalizedKey}`
        : normalizedKey;
    const nextIndex = findTypeaheadOption(
      config.options,
      query,
      highlightedIndex + 1,
    );
    typeaheadRef.current = { query, timestamp };
    if (nextIndex !== null) {
      event.preventDefault();
      setHighlightedIndex(nextIndex);
    }
  };

  return (
    <div
      className={styles.selectField}
      data-filter={config.id}
      data-open={isOpen}
      data-placement={placement}
      ref={rootRef}
    >
      <span className={styles.visuallyHidden} id={labelId}>
        {config.label}
      </span>
      <button
        aria-controls={listboxId}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-labelledby={`${labelId} ${valueId}`}
        className={styles.selectTrigger}
        onClick={() => (isOpen ? closeMenu() : openMenu())}
        onKeyDown={handleTriggerKeyDown}
        ref={triggerRef}
        type="button"
      >
        <span className={styles.selectTriggerCopy}>
          {leadingIcon ? (
            <span aria-hidden="true" className={styles.selectLeading}>
              {leadingIcon}
            </span>
          ) : null}
          <span className={styles.selectText} id={valueId}>
            <span className={styles.selectValue}>{selectedOption.label}</span>
            {selectedOption.description ? (
              <span className={styles.selectDescription}>
                {selectedOption.description}
              </span>
            ) : null}
          </span>
        </span>
        <span aria-hidden="true" className={styles.selectChevron}>
          <ChevronIcon />
        </span>
      </button>
      <input name={name} type="hidden" value={value} />

      {isOpen ? (
        <div
          aria-activedescendant={`${idPrefix}-option-${highlightedIndex}`}
          aria-labelledby={labelId}
          className={styles.selectMenu}
          id={listboxId}
          onKeyDown={handleListboxKeyDown}
          ref={listboxRef}
          role="listbox"
          tabIndex={-1}
        >
          {config.options.map((option, index) => {
            const isHighlighted = index === highlightedIndex;
            const isSelected = option.value === value;
            return (
              <button
                aria-selected={isSelected}
                className={styles.selectOption}
                data-highlighted={isHighlighted}
                data-selected={isSelected}
                id={`${idPrefix}-option-${index}`}
                key={option.value}
                onClick={() => selectOption(index)}
                role="option"
                tabIndex={-1}
                type="button"
              >
                <span className={styles.optionCopy}>
                  {option.tone ? (
                    <span
                      aria-hidden="true"
                      className={styles.optionTone}
                      data-tone={option.tone}
                    />
                  ) : null}
                  <span className={styles.optionText}>
                    <span className={styles.optionLabel}>{option.label}</span>
                    {option.description ? (
                      <span className={styles.optionDescription}>
                        {option.description}
                      </span>
                    ) : null}
                  </span>
                </span>
                <span aria-hidden="true" className={styles.optionCheck}>
                  {isSelected ? <CheckIcon /> : null}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
