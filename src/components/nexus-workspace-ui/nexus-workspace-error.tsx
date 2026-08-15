"use client";

import {
  NexusWorkspaceButton,
  NexusWorkspaceCard,
} from "@/components/nexus-workspace-ui/nexus-workspace-elements";
import styles from "@/components/nexus-workspace-ui/nexus-workspace-error.module.css";
import { NexusWorkspacePage } from "@/components/nexus-workspace-ui/nexus-workspace-page";

type NexusWorkspaceErrorProps = {
  description: string;
  errorReference?: string;
  referenceLabel: string;
  retry: () => void;
  retryLabel: string;
  title: string;
};

export function NexusWorkspaceError({
  description,
  errorReference,
  referenceLabel,
  retry,
  retryLabel,
  title,
}: NexusWorkspaceErrorProps) {
  return (
    <NexusWorkspacePage
      description={description}
      descriptionId="nexus-workspace-error-description"
      title={title}
      titleId="nexus-workspace-error-title"
    >
      <div className={styles.container}>
        <NexusWorkspaceCard>
          <div aria-live="assertive" className={styles.content} role="alert">
            <span aria-hidden="true" className={styles.icon}>
              !
            </span>
            <div>
              <h3>{title}</h3>
              <p>{description}</p>
              {errorReference ? (
                <small>
                  {referenceLabel}: <code>{errorReference}</code>
                </small>
              ) : null}
            </div>
          </div>
          <div className={styles.actions}>
            <NexusWorkspaceButton onClick={retry} tone="primary" type="button">
              {retryLabel}
            </NexusWorkspaceButton>
          </div>
        </NexusWorkspaceCard>
      </div>
    </NexusWorkspacePage>
  );
}
