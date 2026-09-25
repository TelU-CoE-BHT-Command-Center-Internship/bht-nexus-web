"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  nexusApiRequest,
  onNexusSessionExpired,
} from "@/components/nexus-api/nexus-api-client";
import { NexusApiError } from "@/components/nexus-api/nexus-api-error";
import {
  type NexusServerProfile,
  type NexusSession,
  nexusSessionFromProfile,
} from "@/components/nexus-session/nexus-session-model";
import {
  type NexusSignInReason,
  nexusSignInPathForReturn,
} from "@/components/nexus-session/nexus-session-routes";
import { approveNexusWorkspaceExit } from "@/components/nexus-workspace-ui/nexus-workspace-unsaved-changes";

/** Jeda minimum antarpemeriksaan ulang sesi ketika tab kembali aktif. */
const SESSION_RECHECK_INTERVAL_MS = 60_000;

type NexusSessionContextValue = {
  /** Memuat ulang identitas dan izin efektif dari layanan. */
  refresh: () => Promise<void>;
  session: NexusSession;
  /** Mencabut sesi pada layanan; gagal dilaporkan, tidak pernah dianggap berhasil. */
  signOut: () => Promise<void>;
};

const NexusSessionContext = createContext<NexusSessionContextValue | null>(
  null,
);

function accessSignature(session: NexusSession) {
  return JSON.stringify([
    session.account.id,
    session.account.status,
    session.roles.map((role) => role.id),
    session.permissions,
    session.member?.id ?? null,
    session.member?.cluster?.id ?? null,
  ]);
}

/**
 * Meninggalkan ruang kerja dengan muat penuh agar seluruh keadaan halaman
 * yang dipegang sesi sebelumnya ikut dibuang.
 */
function leaveWorkspace(reason: NexusSignInReason, returnPath?: string) {
  approveNexusWorkspaceExit();
  window.location.replace(nexusSignInPathForReturn(returnPath, reason));
}

function currentWorkspacePath() {
  return `${window.location.pathname}${window.location.search}`;
}

export function NexusSessionProvider({
  children,
  initialSession,
}: {
  children: ReactNode;
  initialSession: NexusSession;
}) {
  const router = useRouter();
  const [session, setSession] = useState(initialSession);
  const lastCheckedAt = useRef(0);
  const signature = useRef(accessSignature(initialSession));

  useEffect(() => {
    setSession(initialSession);
    signature.current = accessSignature(initialSession);
    lastCheckedAt.current = Date.now();
  }, [initialSession]);

  const refresh = useCallback(async () => {
    try {
      const profile = await nexusApiRequest<NexusServerProfile>("/profile/me");
      const next = nexusSessionFromProfile(profile);
      lastCheckedAt.current = Date.now();
      setSession(next);
      const nextSignature = accessSignature(next);
      if (nextSignature !== signature.current) {
        signature.current = nextSignature;
        router.refresh();
      }
    } catch (error) {
      if (error instanceof NexusApiError && error.status === 401) {
        leaveWorkspace("sesi-berakhir", currentWorkspacePath());
        return;
      }
      throw error;
    }
  }, [router]);

  const signOut = useCallback(async () => {
    try {
      await nexusApiRequest("/auth/sign-out", { method: "POST" });
    } catch (error) {
      if (!(error instanceof NexusApiError && error.status === 401)) {
        throw error;
      }
    }
    leaveWorkspace("keluar");
  }, []);

  useEffect(
    () =>
      onNexusSessionExpired(() =>
        leaveWorkspace("sesi-berakhir", currentWorkspacePath()),
      ),
    [],
  );

  useEffect(() => {
    function recheck() {
      if (document.visibilityState !== "visible") return;
      if (Date.now() - lastCheckedAt.current < SESSION_RECHECK_INTERVAL_MS) {
        return;
      }
      lastCheckedAt.current = Date.now();
      refresh().catch(() => undefined);
    }

    document.addEventListener("visibilitychange", recheck);
    window.addEventListener("focus", recheck);
    return () => {
      document.removeEventListener("visibilitychange", recheck);
      window.removeEventListener("focus", recheck);
    };
  }, [refresh]);

  const value = useMemo(
    () => ({ refresh, session, signOut }),
    [refresh, session, signOut],
  );

  return (
    <NexusSessionContext.Provider value={value}>
      {children}
    </NexusSessionContext.Provider>
  );
}

export function useNexusSession() {
  const context = useContext(NexusSessionContext);
  if (!context) {
    throw new Error("useNexusSession must be used inside NexusSessionProvider");
  }
  return context;
}

/** Untuk permukaan bersama yang juga dirender di luar ruang kerja bersesi. */
export function useNexusSessionIfAvailable() {
  return useContext(NexusSessionContext);
}
