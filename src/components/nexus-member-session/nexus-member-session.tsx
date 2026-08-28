"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { NexusMemberRecord } from "@/components/nexus-members/nexus-members-content";

type NexusMemberSessionValue = {
  records: NexusMemberRecord[];
  saveMember: (member: NexusMemberRecord) => void;
};

const NexusMemberSessionContext = createContext<NexusMemberSessionValue | null>(
  null,
);

function withoutAccount(member: NexusMemberRecord): NexusMemberRecord {
  const profile = { ...member };
  delete profile.account;
  return profile;
}

export function NexusMemberSessionProvider({
  children,
  initialRecords,
}: {
  children: ReactNode;
  initialRecords: NexusMemberRecord[];
}) {
  const [records, setRecords] = useState(() =>
    initialRecords.map(withoutAccount),
  );

  const saveMember = useCallback((member: NexusMemberRecord) => {
    const profile = withoutAccount(member);
    setRecords((current) => {
      const memberExists = current.some(
        (candidate) => candidate.id === profile.id,
      );
      return memberExists
        ? current.map((candidate) =>
            candidate.id === profile.id ? profile : candidate,
          )
        : [profile, ...current];
    });
  }, []);

  const value = useMemo(() => ({ records, saveMember }), [records, saveMember]);

  return (
    <NexusMemberSessionContext.Provider value={value}>
      {children}
    </NexusMemberSessionContext.Provider>
  );
}

export function useNexusMemberSession() {
  const session = useContext(NexusMemberSessionContext);
  if (!session) {
    throw new Error(
      "useNexusMemberSession must be used inside NexusMemberSessionProvider",
    );
  }
  return session;
}
