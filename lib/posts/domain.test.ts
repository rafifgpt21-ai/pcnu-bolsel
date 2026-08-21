import { describe, expect, it } from "vitest";
import { deriveExcerpt, generatePostSlug, getYouTubeEmbedUrl, isHttpUrl, isPostLive, isScheduleDue, normalizeTags, readingTimeMinutes, resolvePublicationDate } from "./domain";
import type { PostBlock } from "./types";

const textBlock = (content: string): PostBlock => ({ id: "1", type: "text", content });

describe("post domain", () => {
  it("membuat slug stabil dan menormalkan tag", () => {
    expect(generatePostSlug("  Kegiatan NU: Maulid 2026! ")).toBe("kegiatan-nu-maulid-2026");
    expect(normalizeTags([" NU ", "nu", " Bola   Selatan ", ""])).toEqual(["NU", "Bola Selatan"]);
  });
  it("menurunkan ringkasan dan waktu baca dari HTML", () => {
    expect(deriveExcerpt([textBlock("<p>Halo <strong>warga</strong> NU</p>")])).toBe("Halo warga NU");
    expect(readingTimeMinutes([textBlock(`<p>${"kata ".repeat(226)}</p>`)])).toBe(2);
  });
  it("hanya menerima URL HTTP(S) dan YouTube yang valid", () => {
    expect(isHttpUrl("https://nu.or.id/berita")).toBe(true);
    expect(isHttpUrl("javascript:alert(1)")).toBe(false);
    expect(getYouTubeEmbedUrl("https://youtu.be/abcdefghijk")).toBe("https://www.youtube.com/embed/abcdefghijk");
    expect(getYouTubeEmbedUrl("https://example.com/video")).toBeNull();
  });
  it("menentukan jadwal berdasarkan waktu absolut", () => {
    const now = new Date("2026-08-21T10:00:00.000Z");
    expect(isScheduleDue("2026-08-21T09:59:59.000Z", now)).toBe(true);
    expect(isScheduleDue("2026-08-21T10:01:00.000Z", now)).toBe(false);
  });
  it("menggunakan waktu sekarang ketika tanggal publikasi dikosongkan", () => {
    const now = new Date("2026-08-21T10:00:00.000Z");
    const oldDate = new Date("2025-01-01T00:00:00.000Z");
    expect(resolvePublicationDate("", oldDate, undefined, true, now)).toBe(now);
    expect(resolvePublicationDate("2026-08-20T08:00:00.000Z", oldDate, undefined, true, now).toISOString()).toBe("2026-08-20T08:00:00.000Z");
  });
  it("menyamakan status live post baru, lama, dan terjadwal", () => {
    const now = new Date("2026-08-21T10:00:00.000Z");
    expect(isPostLive({ status: "PUBLISHED" }, now)).toBe(true);
    expect(isPostLive({ status: "DRAFT", publishedRevisionId: "revision-live" }, now)).toBe(true);
    expect(isPostLive({ status: "SCHEDULED", scheduledRevisionId: "revision-scheduled", scheduledAt: "2026-08-21T09:59:59.000Z" }, now)).toBe(true);
    expect(isPostLive({ status: "SCHEDULED", scheduledRevisionId: "revision-scheduled", scheduledAt: "2026-08-21T10:01:00.000Z" }, now)).toBe(false);
    expect(isPostLive({ status: "DRAFT" }, now)).toBe(false);
  });
});
