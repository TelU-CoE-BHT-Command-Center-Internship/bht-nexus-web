"use client";

import { useMemo } from "react";
import { useNexusAccessPolicySessionIfAvailable } from "@/components/nexus-access-policy/nexus-access-policy-session";
import { useNexusAccountSessionIfAvailable } from "@/components/nexus-account-session/nexus-account-session";
import { useNexusMemberSessionIfAvailable } from "@/components/nexus-member-session/nexus-member-session";
import { resolveNexusProfile } from "@/components/nexus-profile/nexus-profile-model";

const noMembers: never[] = [];
const noAccounts: never[] = [];

/**
 * Proyeksi nama, avatar, dan kelengkapan untuk seluruh direktori akun.
 * Administrasi dan permukaan akses memakai peta ini agar alias akun tidak
 * berubah menjadi sumber profil manusia kedua.
 *
 * Direktori akun layanan hanya membawa identitas milik akun, sehingga profil
 * anggota contoh tidak pernah dipakai untuk melengkapinya. Data contoh hanya
 * dipadukan pada direktori rancangan yang memang memakai data contoh.
 */
export function useNexusProfileDirectory() {
  const accountSession = useNexusAccountSessionIfAvailable();
  const memberSession = useNexusMemberSessionIfAvailable();
  const accessPolicySession = useNexusAccessPolicySessionIfAvailable();
  const isPreview = accountSession?.source === "preview";
  const accounts = accountSession?.accounts ?? noAccounts;
  const roles =
    (isPreview ? accessPolicySession?.roles : undefined) ??
    accountSession?.roles ??
    noAccounts;
  const members = isPreview ? (memberSession?.records ?? noMembers) : noMembers;

  return useMemo(
    () =>
      new Map(
        accounts.map((account) => [
          account.id,
          resolveNexusProfile({ account, accounts, members, roles }),
        ]),
      ),
    [accounts, members, roles],
  );
}
