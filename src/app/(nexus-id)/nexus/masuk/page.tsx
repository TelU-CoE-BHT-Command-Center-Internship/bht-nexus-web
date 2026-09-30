import type { Metadata } from "next";
import { NexusLogin } from "@/components/nexus-login/nexus-login";
import { safeWorkspaceReturnPath } from "@/lib/nexus-request-path";

export const metadata: Metadata = {
  title: "Masuk",
  description: "Masuk ke ruang kerja digital internal BHT Nexus.",
  robots: {
    follow: false,
    index: false,
  },
};

export default async function IndonesianNexusLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const requested = (await searchParams).next;
  const returnPath = safeWorkspaceReturnPath(
    Array.isArray(requested) ? requested[0] : requested,
  );

  return <NexusLogin locale="id" returnPath={returnPath} />;
}
