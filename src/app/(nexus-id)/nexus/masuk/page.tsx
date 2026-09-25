import type { Metadata } from "next";
import {
  NexusSignInPage,
  type NexusSignInSearchParams,
} from "@/components/nexus-login/nexus-login-page";

export const metadata: Metadata = {
  title: "Masuk",
  description: "Masuk ke ruang kerja digital internal BHT Nexus.",
  robots: {
    follow: false,
    index: false,
  },
};

export default function IndonesianNexusLoginPage({
  searchParams,
}: {
  searchParams: NexusSignInSearchParams;
}) {
  return <NexusSignInPage locale="id" searchParams={searchParams} />;
}
