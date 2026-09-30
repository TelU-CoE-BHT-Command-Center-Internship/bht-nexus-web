import type { Metadata } from "next";
import { NexusLogin } from "@/components/nexus-login/nexus-login";
import { safeWorkspaceReturnPath } from "@/lib/nexus-request-path";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to the internal BHT Nexus digital workspace.",
  robots: {
    follow: false,
    index: false,
  },
};

export default async function EnglishNexusLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const requested = (await searchParams).next;
  const returnPath = safeWorkspaceReturnPath(
    Array.isArray(requested) ? requested[0] : requested,
  );

  return <NexusLogin locale="en" returnPath={returnPath} />;
}
