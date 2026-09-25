import { redirect } from "next/navigation";
import { nexusWorkspaceHomeHref } from "@/components/nexus-dashboard-shell/nexus-dashboard-shell-content";
import { nexusWorkspaceAccessFromPermissions } from "@/components/nexus-dashboard-shell/nexus-workspace-access";
import { NexusLogin } from "@/components/nexus-login/nexus-login";
import {
  NEXUS_RETURN_PARAM,
  NEXUS_SIGN_IN_REASON_PARAM,
  type NexusSignInReason,
  nexusSafeReturnPath,
} from "@/components/nexus-session/nexus-session-routes";
import { resolveNexusSession } from "@/components/nexus-session/nexus-session-server";
import type { Locale } from "@/i18n/locales";

export type NexusSignInSearchParams = Promise<
  Record<string, string | string[] | undefined>
>;

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function signInReason(
  value: string | undefined,
): NexusSignInReason | undefined {
  return value === "keluar" || value === "sesi-berakhir" ? value : undefined;
}

/**
 * Halaman masuk bersama untuk kedua bahasa. Akun yang sudah bersesi tidak
 * diminta masuk ulang dan langsung diarahkan ke tujuan yang aman.
 */
export async function NexusSignInPage({
  locale,
  searchParams,
}: {
  locale: Locale;
  searchParams: NexusSignInSearchParams;
}) {
  const params = await searchParams;
  const returnPath =
    nexusSafeReturnPath(firstParam(params[NEXUS_RETURN_PARAM])) ?? undefined;
  const resolution = await resolveNexusSession();

  if (resolution.kind === "AUTHENTICATED") {
    redirect(
      returnPath ??
        nexusWorkspaceHomeHref(
          nexusWorkspaceAccessFromPermissions(resolution.session.permissions),
          locale,
        ),
    );
  }

  return (
    <NexusLogin
      locale={locale}
      reason={signInReason(firstParam(params[NEXUS_SIGN_IN_REASON_PARAM]))}
      returnPath={returnPath}
    />
  );
}
