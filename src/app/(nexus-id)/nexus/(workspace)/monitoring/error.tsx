"use client";

import { NexusWorkspaceError } from "@/components/nexus-workspace-ui/nexus-workspace-error";

export default function NexusMonitoringErrorBoundary({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <NexusWorkspaceError
      description="Pemantauan KM tidak dapat dimuat saat ini. Data resmi tidak berubah. Coba muat kembali bagian ini."
      errorReference={error.digest}
      referenceLabel="Referensi kendala"
      retry={retry}
      retryLabel="Coba lagi"
      title="Terjadi kendala saat memuat pemantauan KM"
    />
  );
}
