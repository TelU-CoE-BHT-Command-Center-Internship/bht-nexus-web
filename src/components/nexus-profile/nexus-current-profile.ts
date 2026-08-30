"use client";

import { useCallback, useMemo } from "react";
import { useNexusAccessPolicySessionIfAvailable } from "@/components/nexus-access-policy/nexus-access-policy-session";
import { useNexusAccountSessionIfAvailable } from "@/components/nexus-account-session/nexus-account-session";
import { useNexusMemberSessionIfAvailable } from "@/components/nexus-member-session/nexus-member-session";
import {
  applyNexusPersonalProfileToMember,
  applyNexusSelfMemberPatch,
  type NexusProfileDraft,
  type NexusSelfMemberPatch,
  nexusAccountPersonalProfileFromDraft,
  resolveNexusProfile,
} from "@/components/nexus-profile/nexus-profile-model";

const noMembers: never[] = [];
const noAccounts: never[] = [];

/**
 * Profil akun yang sedang diwakili ruang kerja beserta cara menyimpannya.
 *
 * Penyimpanan selalu mendarat pada sumber kanonis: rekam anggota bila akun
 * terhubung ke anggota, dan informasi pribadi akun bila tidak. Halaman Profil
 * Saya, identitas pada header, dan proyeksi Administrasi membaca hasil yang
 * sama karena ketiganya memakai penyelesai profil yang sama.
 *
 * Ruang kerja yang belum membawa direktori akun dan anggota menerima profil
 * kosong supaya permukaan bersama tetap dapat dirender apa adanya.
 */
export function useNexusCurrentProfile() {
  const accountSession = useNexusAccountSessionIfAvailable();
  const memberSession = useNexusMemberSessionIfAvailable();

  const members = memberSession?.records ?? noMembers;
  const saveMember = memberSession?.saveMember;
  const updatePersonalProfile = accountSession?.updatePersonalProfile;
  const profile = accountSession?.currentProfile;

  const saveProfileDraft = useCallback(
    (draft: NexusProfileDraft) => {
      if (!profile) return;
      if (profile.relationship.kind === "LINKED") {
        saveMember?.(
          applyNexusPersonalProfileToMember(profile.relationship.member, draft),
        );
        return;
      }
      updatePersonalProfile?.(
        profile.account.id,
        nexusAccountPersonalProfileFromDraft(draft),
      );
    },
    [profile, saveMember, updatePersonalProfile],
  );

  /**
   * Penyuntingan mandiri hanya menerima patch bidang yang dimiliki pemilik
   * akun. Penugasan CoE, unit utama, status keanggotaan, dan tanggal bergabung
   * tidak dapat dikirim lewat jalur ini sehingga tidak mungkin ikut tertulis
   * ketika pengguna menyunting kartu lain pada Profil Saya.
   */
  const saveSelfMemberPatch = useCallback(
    (patch: NexusSelfMemberPatch) => {
      if (profile?.relationship.kind !== "LINKED") return;
      saveMember?.(
        applyNexusSelfMemberPatch(profile.relationship.member, patch),
      );
    },
    [profile, saveMember],
  );

  return { members, profile, saveProfileDraft, saveSelfMemberPatch };
}

/**
 * Proyeksi nama, avatar, dan kelengkapan untuk seluruh direktori akun.
 * Administrasi dan permukaan akses memakai peta ini agar alias akun tidak
 * berubah menjadi sumber profil manusia kedua.
 */
export function useNexusProfileDirectory() {
  const accountSession = useNexusAccountSessionIfAvailable();
  const memberSession = useNexusMemberSessionIfAvailable();
  const accessPolicySession = useNexusAccessPolicySessionIfAvailable();
  const accounts = accountSession?.accounts ?? noAccounts;
  const members = memberSession?.records ?? noMembers;
  const roles = accessPolicySession?.roles ?? noAccounts;

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
