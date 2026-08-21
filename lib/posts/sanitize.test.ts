import { describe, expect, it } from "vitest";
import { sanitizeRichText } from "./sanitize";

describe("rich text sanitizer", () => {
  it("membuang script dan event handler serta mengamankan link", () => {
    const output = sanitizeRichText('<p onclick="alert(1)">Aman<script>alert(1)</script><a href="javascript:alert(1)">tautan</a></p>');
    expect(output).not.toContain("script");
    expect(output).not.toContain("onclick");
    expect(output).not.toContain("javascript:");
    expect(output).toContain('rel="noopener noreferrer"');
  });
});
