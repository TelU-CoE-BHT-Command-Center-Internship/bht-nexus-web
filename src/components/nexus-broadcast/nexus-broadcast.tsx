"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "@/components/nexus-broadcast/nexus-broadcast.module.css";
import { NexusBroadcastIcon } from "@/components/nexus-broadcast/nexus-broadcast-icons";
import { NexusBroadcastStudio } from "@/components/nexus-broadcast/nexus-broadcast-studio";
import type { NexusBroadcastCapabilities } from "@/components/nexus-dashboard-shell/nexus-workspace-access";
import {
  NexusWorkspaceButton,
  NexusWorkspaceEmptyState,
  NexusWorkspaceLoadError,
  NexusWorkspaceNotice,
} from "@/components/nexus-workspace-ui/nexus-workspace-elements";
import { NexusWorkspaceMetrics } from "@/components/nexus-workspace-ui/nexus-workspace-page";
import { NexusWorkspaceState } from "@/components/nexus-workspace-ui/nexus-workspace-state";
import { useNexusWorkspaceNavigation } from "@/components/nexus-workspace-ui/nexus-workspace-unsaved-changes";
import {
  type BroadcastHistory as BroadcastHistoryEntry,
  type BroadcastRecipients,
  getBroadcastRecipients,
  listBroadcasts,
} from "@/lib/api-broadcasts";
import { apiErrorMessage } from "@/lib/api-client";

function BroadcastHeroIllustration() {
  return (
    <svg
      aria-hidden="true"
      className={styles.heroIllustration}
      fill="none"
      viewBox="0 0 280 150"
    >
      <path
        d="M22 118c34-4 58-22 82-48 17-18 38-30 64-32"
        stroke="#9db8e0"
        strokeDasharray="3 7"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <circle cx="22" cy="118" fill="#f3bd25" r="4.5" />
      <rect
        fill="#fff"
        height="74"
        rx="10"
        stroke="#bcd0ec"
        strokeWidth="2"
        width="112"
        x="96"
        y="58"
      />
      <path
        d="m100 64 52 38 52-38"
        stroke="#9db8e0"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path
        d="M108 122h28M108 112h18"
        stroke="#d4e1f2"
        strokeLinecap="round"
        strokeWidth="3"
      />
      <path
        d="m174 36 84-24-35 78-14-31Z"
        fill="#fff"
        stroke="#08285c"
        strokeLinejoin="round"
        strokeWidth="2.4"
      />
      <path
        d="m209 59 49-47M209 59l-3 22 17-12"
        stroke="#08285c"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.4"
      />
      <circle cx="236" cy="104" fill="#dbe7f8" r="6" />
      <circle cx="252" cy="126" fill="#eaf1fb" r="3.5" />
    </svg>
  );
}

function BroadcastHistory({ entries }: { entries: BroadcastHistoryEntry[] }) {
  const navigate = useNexusWorkspaceNavigation();
  return (
    <section
      aria-labelledby="broadcast-history-title"
      className={styles.history}
    >
      <header className={styles.historyHeader}>
        <span aria-hidden="true" className={styles.historyIcon}>
          <NexusBroadcastIcon name="clock" />
        </span>
        <div>
          <h3 id="broadcast-history-title">Riwayat broadcast</h3>
          <p>Draf tersimpan dan hasil pengiriman dari BHT Nexus.</p>
        </div>
      </header>
      {entries.length === 0 ? (
        <NexusWorkspaceEmptyState
          title="Belum ada draf atau pengiriman"
          description="Simpan draf pertama untuk melanjutkan penyusunan setelah halaman ditutup."
        />
      ) : (
        <ul className={styles.historyList}>
          {entries.map((entry) => (
            <li key={entry.publicId}>
              <div>
                <strong>{entry.subject || "Draf tanpa judul"}</strong>
                <span>
                  {entry.createdByName} ·{" "}
                  {new Date(entry.updatedAt).toLocaleString("id-ID")}
                </span>
                <small>
                  {entry.status === "draft"
                    ? "Draf tersimpan"
                    : entry.summary.pendingCount > 0
                      ? `${entry.summary.pendingCount} penerima masih diproses`
                      : `${entry.summary.acceptedCount} diterima ${entry.deliveryMode === "capture" ? "penampung pemeriksaan" : "layanan email"} · ${entry.summary.failedCount} gagal · ${entry.summary.unconfirmedCount} belum pasti`}
                </small>
              </div>
              <NexusWorkspaceButton
                onClick={() =>
                  navigate(`/nexus/broadcast?broadcast=${entry.publicId}`)
                }
                type="button"
              >
                {entry.status === "draft" ? "Buka draf" : "Lihat hasil"}
              </NexusWorkspaceButton>
            </li>
          ))}
        </ul>
      )}
      {entries.length === 50 ? (
        <p className={styles.historyLimit}>
          Menampilkan 50 draf dan pengiriman terbaru.
        </p>
      ) : null}
    </section>
  );
}

/**
 * Halaman Broadcast / Newsletter. Penerima dihitung dari satu sumber anggota
 * kanonis yang sama dengan halaman Anggota, sehingga email yang dilengkapi di
 * sana langsung mengubah jumlah penerima di sini.
 */
export function NexusBroadcast({
  capabilities,
  initialPublicId,
}: {
  capabilities: NexusBroadcastCapabilities;
  initialPublicId?: string;
}) {
  const [data, setData] = useState<{
    recipients: BroadcastRecipients;
    history: BroadcastHistoryEntry[];
  } | null>(null);
  const [error, setError] = useState("");
  const loadSequence = useRef(0);
  const refresh = useCallback(() => {
    const sequence = ++loadSequence.current;
    void Promise.all([getBroadcastRecipients(), listBroadcasts()])
      .then(([recipients, history]) => {
        if (sequence === loadSequence.current) {
          setData({ recipients, history });
          setError("");
        }
      })
      .catch((error) => {
        if (sequence === loadSequence.current)
          setError(
            apiErrorMessage(error, "Data broadcast belum dapat dimuat."),
          );
      });
  }, []);
  useEffect(() => {
    refresh();
    return () => {
      loadSequence.current++;
    };
  }, [refresh]);
  const recipients = data?.recipients;
  const missingEmail = recipients?.missingEmailMembers.length ?? 0;

  return (
    <div className={styles.page}>
      <section aria-labelledby="broadcast-title" className={styles.hero}>
        <div className={styles.heroCopy}>
          <h2 id="broadcast-title">Broadcast / Newsletter</h2>
          <p>
            Susun pengumuman untuk anggota CoE BHT, periksa penerimanya, dan
            lihat tampilannya sebagai email sebelum dikirim.
          </p>
        </div>
        <BroadcastHeroIllustration />
      </section>

      <div className={styles.content}>
        {error && !recipients ? (
          <NexusWorkspaceLoadError
            title="Broadcast belum dapat dimuat"
            description={error}
            onRetry={refresh}
          />
        ) : !recipients ? (
          <NexusWorkspaceState
            eyebrow="Memuat"
            title="Mengambil data broadcast"
            description="Daftar penerima dan draf tersimpan sedang dimuat."
          />
        ) : (
          <>
            {error ? (
              <NexusWorkspaceNotice tone="danger">
                Data belum dapat diperbarui. {error} Isian Anda tetap tersedia.
              </NexusWorkspaceNotice>
            ) : null}
            <div className={styles.refreshRow}>
              <p>
                {recipients.delivery.mode === "capture"
                  ? "Email masuk ke penampung pemeriksaan dan belum dikirim ke kotak email penerima."
                  : recipients.delivery.configured
                    ? `Pengirim: ${recipients.delivery.sender}`
                    : "Pengirim email belum siap. Draf tetap dapat disimpan."}
              </p>
              <NexusWorkspaceButton onClick={refresh} type="button">
                Perbarui daftar
              </NexusWorkspaceButton>
            </div>
            <NexusWorkspaceMetrics
              metrics={[
                {
                  icon: <NexusBroadcastIcon name="people" />,
                  id: "active-members",
                  label: "Anggota aktif",
                  tone: "completed",
                  unit: `dari ${recipients.members} anggota tercatat`,
                  value: recipients.activeMembers,
                },
                {
                  icon: <NexusBroadcastIcon name="mail" />,
                  id: "email-recipients",
                  label: "Dapat menerima email",
                  tone:
                    recipients.addresses.length > 0 ? "completed" : "waiting",
                  unit: "alamat email",
                  value: recipients.addresses.length,
                },
                {
                  icon: <NexusBroadcastIcon name="alert" />,
                  id: "missing-email",
                  label: "Belum memiliki email",
                  tone: missingEmail > 0 ? "needs-fix" : "completed",
                  unit: "anggota aktif",
                  value: missingEmail,
                },
              ]}
            />

            {capabilities.canCompose || initialPublicId ? (
              <NexusBroadcastStudio
                key={initialPublicId ?? "new"}
                initialPublicId={initialPublicId}
                canCompose={capabilities.canCompose}
                onSaved={refresh}
                recipients={recipients}
              />
            ) : (
              <NexusWorkspaceState
                description="Akun Anda dapat melihat ringkasan penerima dan riwayat broadcast. Penyusunan dan pengiriman hanya tersedia bagi akun yang diberi akses mengirim broadcast."
                eyebrow="Akses terbatas"
                title="Penyusunan broadcast tidak tersedia untuk akun Anda"
              />
            )}

            <BroadcastHistory entries={data?.history ?? []} />
          </>
        )}
      </div>
    </div>
  );
}
