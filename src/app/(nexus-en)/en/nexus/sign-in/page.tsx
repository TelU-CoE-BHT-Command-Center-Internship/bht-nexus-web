import type { Metadata } from "next";
import {
  NexusSignInPage,
  type NexusSignInSearchParams,
} from "@/components/nexus-login/nexus-login-page";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to the internal BHT Nexus digital workspace.",
  robots: {
    follow: false,
    index: false,
  },
};

export default function EnglishNexusLoginPage({
  searchParams,
}: {
  searchParams: NexusSignInSearchParams;
}) {
  return <NexusSignInPage locale="en" searchParams={searchParams} />;
}
