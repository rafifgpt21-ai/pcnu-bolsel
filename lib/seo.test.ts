import { describe, expect, it } from "vitest";
import { serializeJsonLd } from "./seo";

describe("serializeJsonLd", () => {
  it("menghindari penutupan tag script dari data dinamis", () => {
    const serialized = serializeJsonLd({ title: "</script><script>alert(1)</script>" });

    expect(serialized).not.toContain("<");
    expect(serialized).toContain("\\u003c/script>");
  });
});
