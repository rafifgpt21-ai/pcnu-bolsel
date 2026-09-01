import { describe, expect, it } from "vitest";
import { findPdfMatches, highlightPdfText, pdfPageWidth } from "./pdf-viewer";

describe("PDF viewer", () => {
  it("fits mobile content and zooms beyond it without clamping to the viewport", () => {
    expect(pdfPageWidth(288, 1)).toBe(288);
    expect(pdfPageWidth(288, 2)).toBe(576);
    expect(pdfPageWidth(1200, 1.2)).toBe(960);
    expect(pdfPageWidth(0, 1)).toBe(0);
  });
  it("preserves the existing zoom limits", () => {
    expect(pdfPageWidth(300, 0.1)).toBe(150);
    expect(pdfPageWidth(300, 10)).toBe(900);
  });
  it("finds literal, case insensitive matches across pages", () => {
    expect(findPdfMatches(["NU nu", "NU (a.*)"], " nu ")).toEqual([{ pageIndex: 0, matchIndex: 0 }, { pageIndex: 0, matchIndex: 3 }, { pageIndex: 1, matchIndex: 0 }]);
    expect(findPdfMatches(["NU (a.*)"], "(a.*)")).toEqual([{ pageIndex: 0, matchIndex: 3 }]);
    expect(findPdfMatches(["NU"], " ")).toEqual([]);
  });
  it("escapes PDF text before rendering highlights as HTML", () => {
    expect(highlightPdfText('<script>NU</script> & nu', 'nu')).toBe('&lt;script&gt;<mark class="pdf-highlight-mark">NU</mark>&lt;/script&gt; &amp; <mark class="pdf-highlight-mark">nu</mark>');
    expect(highlightPdfText('<img src="x">', '')).toBe('&lt;img src=&quot;x&quot;&gt;');
  });
});
