import sanitizeHtml from "sanitize-html";

export function sanitizeRichText(value: string) {
  return sanitizeHtml(value, {
    allowedTags: ["p", "br", "strong", "em", "s", "h2", "h3", "ul", "ol", "li", "blockquote"],
    allowedAttributes: { p: ["style"], h2: ["style"], h3: ["style"] },
    allowedStyles: { "*": { "text-align": [/^left$/, /^right$/, /^center$/, /^justify$/] } },
  });
}
