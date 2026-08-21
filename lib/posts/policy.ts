import type { PostStatusValue } from "./types";

export type EditorialRole = "ADMIN" | "SUPER_ADMIN";
export type EditorialAction = "EDIT" | "AUTOSAVE" | "SAVE" | "SUBMIT" | "RETURN" | "PUBLISH" | "SCHEDULE" | "UNPUBLISH" | "DELETE" | "RESTORE";

export function canPerformPostAction(role: EditorialRole, status: PostStatusValue, action: EditorialAction) {
  if (role === "SUPER_ADMIN") return true;
  if (["RETURN", "PUBLISH", "SCHEDULE", "UNPUBLISH", "DELETE"].includes(action)) return false;
  if (["IN_REVIEW", "SCHEDULED", "ARCHIVED"].includes(status)) return false;
  return true;
}

export function versionsMatch(expected: number | undefined, current: number) {
  return expected === current;
}

export function shouldBackfillLegacyVersion(expected: number) {
  return expected === 1;
}

export function revisionIdsToPrune(
  revisions: Array<{ id: string }>,
  pinnedIds: Array<string | null | undefined>,
  limit = 20,
) {
  const keep = new Set(revisions.slice(0, limit).map((revision) => revision.id));
  pinnedIds.filter((id): id is string => Boolean(id)).forEach((id) => keep.add(id));
  return revisions.filter((revision) => !keep.has(revision.id)).map((revision) => revision.id);
}
