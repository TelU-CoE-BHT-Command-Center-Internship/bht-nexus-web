import Link from "next/link";
import { redirect } from "next/navigation";
import { NexusAuthScreen } from "@/components/nexus-login/nexus-auth-screen";
import {
  getNexusPasswordRecoveryContent,
  type NexusPasswordRecoveryMode,
} from "@/components/nexus-login/nexus-password-recovery-content";
import { NexusPasswordRecoveryForm } from "@/components/nexus-login/nexus-password-recovery-form";
import { resolveNexusSession } from "@/components/nexus-session/nexus-session-server";
import type { Locale } from "@/i18n/locales";

/**
 * Aktivasi akun undangan dan pemulihan kata sandi. Akun yang sedang masuk
 * mengganti kata sandinya dari Profil Saya, sehingga halaman ini hanya untuk
 * pengunjung yang belum bersesi.
 */
export async function NexusPasswordRecovery({
  locale,
  mode,
}: {
  locale: Locale;
  mode: NexusPasswordRecoveryMode;
}) {
  const resolution = await resolveNexusSession();
  if (resolution.kind === "AUTHENTICATED") {
    redirect(locale === "id" ? "/nexus" : "/en/nexus/coming-soon");
  }

  const content = getNexusPasswordRecoveryContent(mode, locale);

  return (
    <NexusAuthScreen
      description={content.description}
      footnote={content.footnote}
      locale={locale}
      supportLinks={
        <>
          <Link href={content.signInHref} prefetch={false}>
            {content.signInLabel}
          </Link>
          <Link href={content.alternateHref} prefetch={false}>
            {content.alternateLabel}
          </Link>
        </>
      }
      switchLocaleHref={content.switchLocaleHref}
      title={content.title}
    >
      <NexusPasswordRecoveryForm content={content} locale={locale} />
    </NexusAuthScreen>
  );
}
