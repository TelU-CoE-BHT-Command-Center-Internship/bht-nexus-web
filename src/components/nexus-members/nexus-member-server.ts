"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { NexusAccountStatus } from "@/components/nexus-accounts/nexus-account-directory";
import { nexusServerRoleLabel } from "@/components/nexus-dashboard-shell/nexus-workspace-access";
import type {
  NexusMemberAccountAccess,
  NexusMemberViewRecord,
} from "@/components/nexus-members/nexus-members-content";
import { formatAuditTimestamp } from "@/components/nexus-workspace-ui/nexus-workspace-format";
import { apiErrorKind, apiErrorMessage } from "@/lib/api-client";
import {
  getMember,
  listAllMembers,
  type MemberDetail,
  type MemberSummary,
} from "@/lib/api-members";
import { useLoadEffect } from "@/lib/use-load-effect";

/**
 * Satu-satunya penerjemah data anggota server ke bentuk yang dipakai halaman
 * Anggota. ID anggota selalu `public_id` server.
 */

function optional(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function googleScholarUrl(id: string | null | undefined): string | undefined {
  const value = optional(id);
  return value
    ? `https://scholar.google.com/citations?user=${encodeURIComponent(value)}`
    : undefined;
}

function accountStatus(value: string): NexusAccountStatus | undefined {
  const status = value.toUpperCase();
  return status === "ACTIVE" || status === "INVITED" || status === "SUSPENDED"
    ? status
    : undefined;
}

function summaryAccess(
  access: MemberSummary["accountAccess"],
): NexusMemberAccountAccess {
  if (access?.kind === "LINKED" && access.userPublicId) {
    return {
      account: { email: access.email ?? "", id: access.userPublicId },
      kind: "LINKED",
    };
  }
  if (access?.kind === "CONFLICT") {
    return {
      accountIds: access.userPublicId ? [access.userPublicId] : [],
      kind: "CONFLICT",
    };
  }
  return { kind: "NONE" };
}

function detailAccess(
  access: MemberDetail["accountAccess"],
): NexusMemberAccountAccess {
  if (access.kind === "LINKED" && access.account) {
    const roleLabels = access.account.roles.map(nexusServerRoleLabel);
    return {
      account: {
        email: access.account.email,
        id: access.account.publicId,
        roleLabel: roleLabels.length > 0 ? roleLabels.join(", ") : undefined,
        status: accountStatus(access.account.status),
      },
      kind: "LINKED",
    };
  }
  if (access.kind === "CONFLICT") {
    return {
      accountIds: access.account ? [access.account.publicId] : [],
      kind: "CONFLICT",
    };
  }
  return { kind: "NONE" };
}

export function nexusMemberFromSummary(
  summary: MemberSummary,
): NexusMemberViewRecord {
  return {
    academic: {
      googleScholar: googleScholarUrl(summary.googleScholarId),
      orcid: optional(summary.orcid),
      researcherId: optional(summary.researcherId),
      scopusAuthorId: optional(summary.scopusId),
      sintaId: optional(summary.sintaId),
    },
    accountAccess: summaryAccess(summary.accountAccess),
    affiliation: {
      institution: "",
      office: optional(summary.office),
      primaryUnit: summary.primaryUnit ?? "",
    },
    avatarSrc: optional(summary.avatarSrc),
    biography: "",
    coeAssignment: summary.coeAssignment?.trim() ?? "",
    contact: {},
    expertise: {
      primary: optional(summary.primaryExpertise),
      secondary: summary.secondaryExpertise ?? [],
    },
    id: summary.publicId,
    identity: {
      preferredName: optional(summary.preferredName) ?? summary.name,
    },
    membership: {
      joinedAt: optional(summary.joinedAt),
      publicProfile: summary.isPublic,
      status: summary.status,
    },
    name: summary.name,
  };
}

export function nexusMemberFromDetail(
  detail: MemberDetail,
): NexusMemberViewRecord {
  return {
    academic: {
      googleScholar: googleScholarUrl(detail.academic.googleScholarId),
      orcid: optional(detail.academic.orcid),
      researcherId: optional(detail.academic.researcherId),
      scopusAuthorId: optional(detail.academic.scopusId),
      sintaId: optional(detail.academic.sintaId),
    },
    accountAccess: detailAccess(detail.accountAccess),
    affiliation: {
      institution: detail.affiliation.institution,
      office: optional(detail.affiliation.office),
      primaryUnit: detail.affiliation.primaryUnit,
    },
    avatarOriginalSrc: optional(detail.avatarOriginalSrc),
    avatarPosition: detail.avatarPosition ?? undefined,
    avatarSrc: optional(detail.avatarSrc),
    biography: detail.biography?.trim() ?? "",
    coeAssignment: detail.coeAssignment?.trim() ?? "",
    contact: {
      alternateEmail: optional(detail.contact.alternateEmail),
      institutionalEmail: optional(detail.contact.institutionalEmail),
      phone: optional(detail.contact.phone),
    },
    expertise: {
      primary: optional(detail.expertise.primary),
      secondary: detail.expertise.secondary,
    },
    id: detail.publicId,
    identity: {
      preferredName: optional(detail.preferredName) ?? detail.name,
    },
    membership: {
      joinedAt: optional(detail.membership.joinedAt),
      publicProfile: detail.membership.isPublic,
      status: detail.membership.status,
    },
    name: detail.name,
    updatedAt: formatAuditTimestamp(detail.updatedAt),
  };
}

export type NexusLoadState = "error" | "loading" | "ready";

/** Direktori anggota dari server, dimuat sekali per kunjungan halaman. */
export function useNexusMemberDirectory() {
  const [records, setRecords] = useState<NexusMemberViewRecord[]>([]);
  const [state, setState] = useState<NexusLoadState>("loading");
  const [errorMessage, setErrorMessage] = useState<string>();
  const latestRequest = useRef(0);

  const load = useCallback(() => {
    const request = ++latestRequest.current;
    setState("loading");
    listAllMembers()
      .then((members) => {
        if (request !== latestRequest.current) return;
        setRecords(members.map(nexusMemberFromSummary));
        setState("ready");
      })
      .catch((error: unknown) => {
        if (request !== latestRequest.current) return;
        setErrorMessage(
          apiErrorMessage(error, "Direktori anggota belum dapat dimuat."),
        );
        setState("error");
      });
  }, []);

  useLoadEffect(load);

  return { errorMessage, records, retry: load, state };
}

type DetailState = {
  errorMessage?: string;
  notFound?: boolean;
  record?: NexusMemberViewRecord;
  state: NexusLoadState | "idle";
};

/** Rincian satu anggota; hasil disimpan selama halaman terbuka. */
export function useNexusMemberDetail(publicId: string | undefined) {
  const cache = useRef(new Map<string, NexusMemberViewRecord>());
  const latestRequest = useRef(0);
  const [detail, setDetail] = useState<DetailState>({ state: "idle" });

  const load = useCallback((memberId: string | undefined) => {
    const request = ++latestRequest.current;
    if (!memberId) {
      setDetail({ state: "idle" });
      return;
    }
    const cached = cache.current.get(memberId);
    if (cached) {
      setDetail({ record: cached, state: "ready" });
      return;
    }
    setDetail({ state: "loading" });
    getMember(memberId)
      .then((member) => {
        if (request !== latestRequest.current) return;
        const record = nexusMemberFromDetail(member);
        cache.current.set(memberId, record);
        setDetail({ record, state: "ready" });
      })
      .catch((error: unknown) => {
        if (request !== latestRequest.current) return;
        setDetail({
          errorMessage: apiErrorMessage(
            error,
            "Rincian anggota belum dapat dimuat.",
          ),
          notFound: apiErrorKind(error) === "not-found",
          state: "error",
        });
      });
  }, []);

  useEffect(() => {
    load(publicId);
    return () => {
      latestRequest.current += 1;
    };
  }, [load, publicId]);

  const retry = useCallback(() => load(publicId), [load, publicId]);

  return { ...detail, retry };
}
