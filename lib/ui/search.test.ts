import { describe, expect, it } from "vitest";
import { resetExploreSearch } from "./search";

describe("resetExploreSearch", () => {
  it("clears both search and category", () => {
    expect(resetExploreSearch("search=NU&category=Berita")).toBe("/explore");
  });
  it("keeps unrelated parameters and their repeated values", () => {
    expect(resetExploreSearch("search=NU&category=Berita&source=home&tag=a&tag=b")).toBe("/explore?source=home&tag=a&tag=b");
  });
  it("handles an empty query", () => expect(resetExploreSearch("")).toBe("/explore"));
});
