import type { NexusDashboardLiveContent } from "@/components/nexus-dashboard-overview/nexus-dashboard-overview-content";
import type {
  DashboardAnnouncement,
  DashboardMetric,
  DashboardRecentActivity,
} from "@/components/nexus-dashboard-overview/nexus-dashboard-overview-types";
import { getServerData } from "@/lib/api-server";

/**
 * Satu-satunya penerjemah ringkasan dashboard server ke bentuk halamannya.
 * Server hanya membuka ringkasan bagi akun yang berhak; untuk akun lain bagian
 * ini kosong dan halaman menampilkan keadaan kosongnya.
 */

type OverviewResponse = {
  metrics: {
    activeResearchers: number;
    totalIpr: number;
    totalPublications: number;
  };
  recentActivities: Array<{
    date: string;
    publicId: string;
    title: string;
    type: string;
  }>;
};

type LocalizedText = { en?: string | null; id: string };

type AnnouncementsResponse = {
  data: Array<{
    actionLabel?: LocalizedText | null;
    deadlineAt?: string | null;
    href?: string | null;
    isPinned: boolean;
    publicId: string;
    summary: LocalizedText;
    title: LocalizedText;
  }>;
};

const count = new Intl.NumberFormat("id-ID");

const typeLabels: Record<string, string> = {
  book_chapter: "Buku / Book Chapter",
  collaboration: "Kolaborasi",
  community_service: "Pengabdian masyarakat",
  conference_paper: "Makalah Konferensi",
  internship: "Magang",
  journal_article: "Artikel Jurnal",
  other: "Lainnya",
  patent: "Paten",
  research: "Riset",
};

const publicationTypes = new Set([
  "book_chapter",
  "conference_paper",
  "journal_article",
  "patent",
]);

function formatDate(value: string) {
  const date = new Date(`${value.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
    year: "numeric",
  }).format(date);
}

function metrics(data: OverviewResponse["metrics"]): DashboardMetric[] {
  return [
    {
      detail: "Karya dengan status data resmi",
      icon: "publications",
      id: "publications",
      label: "Publikasi Resmi",
      tone: "blue",
      value: count.format(data.totalPublications),
    },
    {
      detail: "Hak cipta, paten, dan perlindungan lain",
      icon: "datasets",
      id: "intellectual-property",
      label: "Kekayaan Intelektual",
      tone: "gold",
      value: count.format(data.totalIpr),
    },
    {
      detail: "Anggota dengan status aktif",
      icon: "researchers",
      id: "active-researchers",
      label: "Peneliti Aktif",
      tone: "violet",
      value: count.format(data.activeResearchers),
    },
  ];
}

function recentActivities(
  items: OverviewResponse["recentActivities"],
): DashboardRecentActivity[] {
  return items.map((item) => {
    const isPublication = publicationTypes.has(item.type);
    return {
      action: isPublication
        ? "Publikasi resmi tercatat"
        : "Kegiatan resmi tercatat",
      detail: typeLabels[item.type] ?? "Rekam resmi",
      icon: isPublication ? "document" : "project",
      id: item.publicId,
      occurredAt: item.date,
      subject: item.title,
      timeLabel: formatDate(item.date),
      tone: isPublication ? "blue" : "teal",
    };
  });
}

/** Tautan pengumuman hanya dipakai bila menuju halaman web atau ruang kerja. */
function usableHref(href: string | null | undefined) {
  if (!href) return undefined;
  return /^https?:\/\//.test(href) || href.startsWith("/nexus")
    ? href
    : undefined;
}

function announcements(
  items: AnnouncementsResponse["data"],
): DashboardAnnouncement[] {
  return items.map((item) => {
    const href = usableHref(item.href);
    const deadline = item.deadlineAt ?? undefined;
    return {
      actionLabel: href ? item.actionLabel?.id : undefined,
      deadlineAt: deadline,
      deadlineLabel: deadline
        ? new Intl.DateTimeFormat("id-ID", {
            day: "numeric",
            month: "long",
            timeZone: "Asia/Jakarta",
            year: "numeric",
          }).format(new Date(deadline))
        : undefined,
      href,
      id: item.publicId,
      summary: item.summary.id,
      title: item.title.id,
    };
  });
}

export async function loadNexusDashboardLiveContent(
  divisionPublicId?: string,
): Promise<NexusDashboardLiveContent> {
  const [overview, announcementList] = await Promise.all([
    getServerData<OverviewResponse>(
      `/dashboard/overview${divisionPublicId ? `?divisionPublicId=${encodeURIComponent(divisionPublicId)}` : ""}`,
    ),
    getServerData<AnnouncementsResponse>("/dashboard/announcements"),
  ]);

  return {
    announcements: announcements(announcementList?.data ?? []),
    metrics: overview ? metrics(overview.metrics) : [],
    recentActivities: overview
      ? recentActivities(overview.recentActivities)
      : [],
  };
}
