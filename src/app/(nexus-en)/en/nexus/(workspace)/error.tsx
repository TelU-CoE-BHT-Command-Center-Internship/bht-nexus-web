"use client";

import { NexusWorkspaceError } from "@/components/nexus-workspace-ui/nexus-workspace-error";

export default function WorkspaceErrorBoundary({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <NexusWorkspaceError
      description="The workspace cannot be loaded right now. Official data remains unchanged. Try loading this section again."
      errorReference={error.digest}
      referenceLabel="Error reference"
      retry={retry}
      retryLabel="Try again"
      title="We could not load the workspace"
    />
  );
}
