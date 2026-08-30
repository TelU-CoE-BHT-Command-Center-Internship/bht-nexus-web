"use client";

import { useCallback, useMemo } from "react";
import { useNexusAccessPolicySessionIfAvailable } from "@/components/nexus-access-policy/nexus-access-policy-session";
import { useNexusAccountSessionIfAvailable } from "@/components/nexus-account-session/nexus-account-session";
import { useNexusMemberSessionIfAvailable } from "@/components/nexus-member-session/nexus-member-session";
import {
  type MemberProfileDraft,
  memberRecordFromDraft,
} from "@/components/nexus-members/nexus-members-model";
import {
  mergeNexusProfileIntoMemberDraft,
  type NexusProfileDraft,
  nexusAccountPersonalProfileFromDraft,
  resolveNexusProfile,
} from "@/components/nexus-profile/nexus-profile-model";

const noMembers: never[] = [];

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
  const accessPolicySession = useNexusAccessPolicySessionIfAvailable();

  const accounts = accountSession?.accounts;
  const currentAccount = accountSession?.currentAccount;
  const members = memberSession?.records ?? noMembers;
  const roles = accessPolicySession?.roles;
  const saveMember = memberSession?.saveMember;
  const updatePersonalProfile = accountSession?.updatePersonalProfile;

  const profile = useMemo(
    () =>
      accounts && currentAccount && roles
        ? resolveNexusProfile({
            account: currentAccount,
            accounts,
            members,
            roles,
          })
        : undefined,
    [accounts, currentAccount, members, roles],
  );

  const saveProfileDraft = useCallback(
    (draft: NexusProfileDraft) => {
      if (!profile) return;
      if (profile.relationship.kind === "LINKED") {
        const { member } = profile.relationship;
        saveMember?.(
          memberRecordFromDraft(
            mergeNexusProfileIntoMemberDraft(member, draft),
            member,
          ),
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

  const saveMemberDraft = useCallback(
    (draft: MemberProfileDraft) => {
      if (profile?.relationship.kind !== "LINKED") return;
      saveMember?.(memberRecordFromDraft(draft, profile.relationship.member));
    },
    [profile, saveMember],
  );

  return { members, profile, saveMemberDraft, saveProfileDraft };
}
