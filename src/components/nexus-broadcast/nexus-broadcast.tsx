"use client";

import { useMemo } from "react";
import styles from "@/components/nexus-broadcast/nexus-broadcast.module.css";
import { NexusBroadcastIcon } from "@/components/nexus-broadcast/nexus-broadcast-icons";
import { summarizeBroadcastRecipients } from "@/components/nexus-broadcast/nexus-broadcast-model";
import { NexusBroadcastStudio } from "@/components/nexus-broadcast/nexus-broadcast-studio";
import type { NexusBroadcastCapabilities } from "@/components/nexus-dashboard-shell/nexus-workspace-access";
import { useNexusMemberSession } from "@/components/nexus-member-session/nexus-member-session";
import { NexusWorkspaceMetrics } from "@/components/nexus-workspace-ui/nexus-workspace-page";
import { NexusWorkspaceState } from "@/components/nexus-workspace-ui/nexus-workspace-state";

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

function BroadcastHistory() {
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
          <p>Broadcast yang dikirim dari BHT Nexus tercatat di sini.</p>
        </div>
      </header>
      <div className={styles.historyEmpty}>
        <span aria-hidden="true" className={styles.historyEmptyIcon}>
          <NexusBroadcastIcon name="mail" />
        </span>
        <strong>Belum ada riwayat broadcast</strong>
        <p>
          Belum ada broadcast yang dikirim dari BHT Nexus. Setiap pengiriman
          akan tercatat di sini beserta judul, jumlah penerima, pengirim, waktu
          kirim, dan hasilnya.
        </p>
      </div>
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
}: {
  capabilities: NexusBroadcastCapabilities;
}) {
  const { records } = useNexusMemberSession();
  const recipients = useMemo(
    () => summarizeBroadcastRecipients(records),
    [records],
  );
  const missingEmail = recipients.missingEmailMembers.length;

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
              tone: recipients.addresses.length > 0 ? "completed" : "waiting",
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

        {capabilities.canCompose ? (
          <NexusBroadcastStudio recipients={recipients} />
        ) : (
          <NexusWorkspaceState
            description="Akun Anda dapat melihat ringkasan penerima dan riwayat broadcast. Menyusun dan meninjau pengiriman broadcast hanya tersedia bagi pengurus yang memegang izin mengelola Broadcast / Newsletter."
            eyebrow="Akses terbatas"
            title="Penyusunan broadcast tidak tersedia untuk akun Anda"
          />
        )}

        <BroadcastHistory />
      </div>
    </div>
  );
}
