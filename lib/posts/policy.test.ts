import { describe, expect, it } from "vitest";
import { canPerformPostAction, revisionIdsToPrune, shouldBackfillLegacyVersion, versionsMatch } from "./policy";

describe("editorial policy", () => {
  it("menerapkan matriks role dan status", () => {
    expect(canPerformPostAction("ADMIN", "DRAFT", "SUBMIT")).toBe(true);
    expect(canPerformPostAction("ADMIN", "IN_REVIEW", "EDIT")).toBe(false);
    expect(canPerformPostAction("ADMIN", "DRAFT", "PUBLISH")).toBe(false);
    expect(canPerformPostAction("SUPER_ADMIN", "IN_REVIEW", "RETURN")).toBe(true);
    expect(canPerformPostAction("SUPER_ADMIN", "ARCHIVED", "RESTORE")).toBe(true);
  });
  it("menolak version conflict", () => {
    expect(versionsMatch(4, 4)).toBe(true);
    expect(versionsMatch(3, 4)).toBe(false);
    expect(versionsMatch(undefined, 1)).toBe(false);
  });
  it("menerima post lama tanpa field version hanya sebagai versi pertama", () => {
    expect(shouldBackfillLegacyVersion(1)).toBe(true);
    expect(shouldBackfillLegacyVersion(2)).toBe(false);
  });
  it("mempertahankan 20 revisi terbaru dan snapshot yang dipin", () => {
    const revisions = Array.from({ length: 24 }, (_, index) => ({ id: `r${index}` }));
    expect(revisionIdsToPrune(revisions, ["r23", "r22"])).toEqual(["r20", "r21"]);
  });
});
