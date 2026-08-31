import type { DashboardViewer } from "@/components/nexus-dashboard-shell/nexus-dashboard-shell-content";
import type { ApiSessionUser } from "@/lib/api-auth";

function readStringField(
  user: ApiSessionUser,
  field: string,
): string | undefined {
  const value = user[field];
  return typeof value === "string" && value.trim() !== "" ? value : undefined;
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return `${first}${last}`.toUpperCase() || "?";
}

export function viewerNameFromSession(
  user: ApiSessionUser | undefined,
): string {
  if (user === undefined) {
    return "Pengguna";
  }
  return (
    readStringField(user, "name") ??
    readStringField(user, "email") ??
    "Pengguna"
  );
}

export function deriveDashboardViewer(
  user: ApiSessionUser,
  fallback: DashboardViewer,
): DashboardViewer {
  const name = viewerNameFromSession(user);

  return {
    avatarSrc: readStringField(user, "image"),
    email: readStringField(user, "email") ?? fallback.email,
    fullName: name,
    id: fallback.id,
    initials: initialsFromName(name),
    name,
    roleLabel: undefined,
  };
}
