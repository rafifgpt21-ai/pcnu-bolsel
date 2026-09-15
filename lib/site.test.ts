import { describe, expect, it } from "vitest";
import { absoluteUrl, SITE_URL } from "./site";

describe("site URL", () => {
  it("menggunakan domain apex produksi sebagai canonical", () => {
    expect(SITE_URL).toBe("https://pcnubolsel.id");
  });

  it("membuat URL internal absolut tanpa mengubah URL eksternal", () => {
    expect(absoluteUrl("/post/berita-nu")).toBe(
      "https://pcnubolsel.id/post/berita-nu",
    );
    expect(absoluteUrl("sitemap.xml")).toBe(
      "https://pcnubolsel.id/sitemap.xml",
    );
    expect(absoluteUrl("https://cdn.example.com/image.jpg")).toBe(
      "https://cdn.example.com/image.jpg",
    );
  });
});
