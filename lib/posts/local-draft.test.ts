import { describe, expect, it } from "vitest";
import { editorContentFingerprint, shouldOfferLocalRecovery, shouldSaveEditorDraft, type StoredLocalDraft } from "./local-draft";
import type { PostEditorInput } from "./types";

const server: PostEditorInput = {
  id: "post-1", expectedVersion: 4, title: "Judul", slug: "judul", excerpt: "", category: "Berita", tags: [],
  thumbnail: "", authorName: "Redaksi", sourceTitle: "", sourceUrl: "", seoTitle: "Lama", seoDescription: "Lama",
  publishedAt: "2026-08-21T08:00:00.000Z", blocks: [{ id: "b1", type: "text", content: "<p>Isi</p>" }], newUploads: [],
};

describe("local draft recovery", () => {
  it("mengabaikan perbedaan version, receipt, dan SEO non-editable", () => {
    const same = { ...server, expectedVersion: 9, seoTitle: "", seoDescription: "", newUploads: [{ key: "x", url: "https://x.ufs.sh/f/x", type: "image" as const, size: 1 }] };
    expect(editorContentFingerprint(same)).toBe(editorContentFingerprint(server));
    const local: StoredLocalDraft = { savedAt: "2026-08-21T09:00:00.000Z", data: same };
    expect(shouldOfferLocalRecovery(local, "2026-08-21T08:30:00.000Z", server)).toBe(false);
  });
  it("menawarkan recovery hanya untuk isi yang benar-benar berbeda dan lebih baru", () => {
    const changed: StoredLocalDraft = { savedAt: "2026-08-21T09:00:00.000Z", data: { ...server, title: "Judul lokal" } };
    expect(shouldOfferLocalRecovery(changed, "2026-08-21T08:30:00.000Z", server)).toBe(true);
    expect(shouldOfferLocalRecovery(changed, "2026-08-21T10:00:00.000Z", server)).toBe(false);
  });
  it("tidak menjalankan autosave sebelum interaksi pengguna", () => {
    expect(shouldSaveEditorDraft(false, "berbeda", "server")).toBe(false);
    expect(shouldSaveEditorDraft(true, "server", "server")).toBe(false);
    expect(shouldSaveEditorDraft(true, "berbeda", "server")).toBe(true);
  });
});
