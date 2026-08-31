"use client";

import { NexusWorkspaceError } from "@/components/nexus-workspace-ui/nexus-workspace-error";

export default function NexusRoleErrorBoundary({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <NexusWorkspaceError
      description="Daftar peran dan hak akses tidak dapat dimuat saat ini. Coba muat kembali halaman ini."
      errorReference={error.digest}
      referenceLabel="Referensi kendala"
      retry={retry}
      retryLabel="Coba lagi"
      title="Peran & Hak Akses tidak dapat dimuat"
    />
  );
}
