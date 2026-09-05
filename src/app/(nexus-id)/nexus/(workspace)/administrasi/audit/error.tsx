"use client";

import { NexusWorkspaceError } from "@/components/nexus-workspace-ui/nexus-workspace-error";

export default function NexusAuditDenialsErrorBoundary({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <NexusWorkspaceError
      description="Data penolakan akses tidak dapat dimuat saat ini. Coba muat kembali halaman ini."
      errorReference={error.digest}
      referenceLabel="Referensi kendala"
      retry={retry}
      retryLabel="Coba lagi"
      title="Penolakan Akses tidak dapat dimuat"
    />
  );
}
