/**
 * Job status set defined by REQ-FUNC-013-1. Shared by RAG indexing/extraction
 * jobs and scraper collection jobs, so both features report the same states.
 */
export type AutomationJobStatus =
  | "failed"
  | "failed_permanently"
  | "queued"
  | "retrying"
  | "running"
  | "succeeded";
