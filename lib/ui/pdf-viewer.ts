export function pdfPageWidth(containerWidth: number, scale: number) {
  return Math.round(Math.min(800, Math.max(0, containerWidth)) * Math.min(3, Math.max(0.5, scale)));
}

export function findPdfMatches(pages: string[], query: string) {
  const needle = query.trim().toLocaleLowerCase();
  const matches: { pageIndex: number; matchIndex: number }[] = [];
  if (!needle) return matches;
  pages.forEach((text, pageIndex) => {
    const haystack = text.toLocaleLowerCase();
    let offset = 0;
    while (offset < haystack.length) {
      const matchIndex = haystack.indexOf(needle, offset);
      if (matchIndex < 0) break;
      matches.push({ pageIndex, matchIndex });
      offset = matchIndex + needle.length;
    }
  });
  return matches;
}

function escapeHtml(text: string) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

// react-pdf expects HTML, not React elements, from customTextRenderer.
export function highlightPdfText(text: string, query: string) {
  const matches = findPdfMatches([text], query);
  let offset = 0;
  let html = "";
  for (const { matchIndex } of matches) {
    html += escapeHtml(text.slice(offset, matchIndex));
    offset = matchIndex + query.trim().length;
    html += `<mark class="pdf-highlight-mark">${escapeHtml(text.slice(matchIndex, offset))}</mark>`;
  }
  return html + escapeHtml(text.slice(offset));
}
