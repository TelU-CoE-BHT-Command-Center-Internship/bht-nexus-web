const announcementSessionStorageKey =
  "bht-nexus.dismissed-dashboard-announcements.v1";
const announcementSessionEvent = "bht-nexus:announcement-session-change";
const emptyAnnouncementSnapshot = "[]";

function parseDismissedAnnouncementIds(snapshot: string) {
  try {
    const value: unknown = JSON.parse(snapshot);

    return Array.isArray(value)
      ? value.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

export function getDismissedAnnouncementSnapshot() {
  if (typeof window === "undefined") {
    return emptyAnnouncementSnapshot;
  }

  try {
    return (
      window.sessionStorage.getItem(announcementSessionStorageKey) ??
      emptyAnnouncementSnapshot
    );
  } catch {
    return emptyAnnouncementSnapshot;
  }
}

export function getServerDismissedAnnouncementSnapshot() {
  return emptyAnnouncementSnapshot;
}

export function readDismissedAnnouncementIds(snapshot: string) {
  return parseDismissedAnnouncementIds(snapshot);
}

export function subscribeToDismissedAnnouncements(onStoreChange: () => void) {
  function handleStorageChange(event: StorageEvent) {
    if (event.key === announcementSessionStorageKey) {
      onStoreChange();
    }
  }

  window.addEventListener(announcementSessionEvent, onStoreChange);
  window.addEventListener("storage", handleStorageChange);

  return () => {
    window.removeEventListener(announcementSessionEvent, onStoreChange);
    window.removeEventListener("storage", handleStorageChange);
  };
}

function publishAnnouncementSessionChange() {
  window.dispatchEvent(new Event(announcementSessionEvent));
}

export function dismissAnnouncementForSession(announcementId: string) {
  try {
    const dismissedIds = parseDismissedAnnouncementIds(
      getDismissedAnnouncementSnapshot(),
    );

    if (dismissedIds.includes(announcementId)) {
      return;
    }

    window.sessionStorage.setItem(
      announcementSessionStorageKey,
      JSON.stringify([...dismissedIds, announcementId]),
    );
    publishAnnouncementSessionChange();
  } catch {
    // The announcement remains visible when storage is unavailable.
  }
}

export function resetDismissedAnnouncementsForSession() {
  try {
    window.sessionStorage.removeItem(announcementSessionStorageKey);
    publishAnnouncementSessionChange();
  } catch {
    // Signing out must continue even when storage is unavailable.
  }
}
