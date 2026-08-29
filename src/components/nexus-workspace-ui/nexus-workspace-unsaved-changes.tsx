"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
} from "react";
import { NexusWorkspaceConfirmDialog } from "@/components/nexus-workspace-ui/nexus-workspace-confirm-dialog";

type UnsavedChangesCopy = {
  confirmLabel: string;
  description: string;
  title: string;
};

type UnsavedChangesRegistration = UnsavedChangesCopy & {
  id: string;
};

type PendingNavigation = UnsavedChangesCopy & {
  href: string;
  onProceed?: () => void;
};

type NexusWorkspaceUnsavedChangesContextValue = {
  navigate: (href: string, onProceed?: () => void) => void;
  register: (registration: UnsavedChangesRegistration) => void;
  unregister: (id: string) => void;
};

const NexusWorkspaceUnsavedChangesContext =
  createContext<NexusWorkspaceUnsavedChangesContextValue | null>(null);

export function NexusWorkspaceUnsavedChangesProvider({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const [registrations, setRegistrations] = useState<
    UnsavedChangesRegistration[]
  >([]);
  const [pendingNavigation, setPendingNavigation] =
    useState<PendingNavigation | null>(null);
  const activeRegistration = registrations.at(-1);

  const register = useCallback((registration: UnsavedChangesRegistration) => {
    setRegistrations((current) => [
      ...current.filter((item) => item.id !== registration.id),
      registration,
    ]);
  }, []);

  const unregister = useCallback((id: string) => {
    setRegistrations((current) =>
      current.filter((registration) => registration.id !== id),
    );
  }, []);

  const navigate = useCallback(
    (href: string, onProceed?: () => void) => {
      const registration = registrations.at(-1);
      if (registration) {
        setPendingNavigation({
          confirmLabel: registration.confirmLabel,
          description: registration.description,
          href,
          onProceed,
          title: registration.title,
        });
        return;
      }

      onProceed?.();
      router.push(href);
    },
    [registrations, router],
  );

  useEffect(() => {
    if (!activeRegistration) return;

    const protectBrowserExit = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", protectBrowserExit);
    return () => window.removeEventListener("beforeunload", protectBrowserExit);
  }, [activeRegistration]);

  const value = useMemo(
    () => ({ navigate, register, unregister }),
    [navigate, register, unregister],
  );

  return (
    <NexusWorkspaceUnsavedChangesContext.Provider value={value}>
      {children}
      {pendingNavigation ? (
        <NexusWorkspaceConfirmDialog
          cancelLabel="Lanjutkan menyunting"
          confirmLabel={pendingNavigation.confirmLabel}
          description={pendingNavigation.description}
          onCancel={() => setPendingNavigation(null)}
          onConfirm={() => {
            const target = pendingNavigation;
            setPendingNavigation(null);
            target.onProceed?.();
            router.push(target.href);
          }}
          title={pendingNavigation.title}
          tone="warning"
        />
      ) : null}
    </NexusWorkspaceUnsavedChangesContext.Provider>
  );
}

function useNexusWorkspaceUnsavedChangesContext() {
  const context = useContext(NexusWorkspaceUnsavedChangesContext);
  if (!context) {
    throw new Error(
      "NexusWorkspaceUnsavedChangesProvider belum tersedia pada layout ruang kerja.",
    );
  }
  return context;
}

export function useNexusWorkspaceNavigation() {
  return useNexusWorkspaceUnsavedChangesContext().navigate;
}

export function useNexusWorkspaceUnsavedChanges({
  confirmLabel,
  description,
  isDirty,
  title,
}: UnsavedChangesCopy & { isDirty: boolean }) {
  const id = useId();
  const { register, unregister } = useNexusWorkspaceUnsavedChangesContext();

  useEffect(() => {
    if (!isDirty) {
      unregister(id);
      return;
    }

    register({ confirmLabel, description, id, title });
    return () => unregister(id);
  }, [confirmLabel, description, id, isDirty, register, title, unregister]);
}
