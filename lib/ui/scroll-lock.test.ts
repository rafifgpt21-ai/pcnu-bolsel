import { afterEach, describe, expect, it, vi } from "vitest";
import { isPageScrollLocked, lockPageScroll } from "./scroll-lock";

const releases: (() => void)[] = [];
afterEach(() => { releases.splice(0).reverse().forEach((release) => release()); vi.unstubAllGlobals(); });

function setup() {
  const attributes = new Map<string, string>();
  const style = { position: "relative", top: "", left: "", width: "", paddingRight: "8px" };
  const scrollTo = vi.fn();
  vi.stubGlobal("document", { body: { style }, documentElement: {
    clientWidth: 1009,
    getAttribute: (name: string) => attributes.get(name) ?? null,
    setAttribute: (name: string, value: string) => attributes.set(name, value),
    removeAttribute: (name: string) => attributes.delete(name),
  } });
  vi.stubGlobal("getComputedStyle", () => ({ paddingRight: "8px" }));
  vi.stubGlobal("window", { innerWidth: 1024, scrollX: 0, scrollY: 540, scrollTo, dispatchEvent: vi.fn() });
  return { attributes, style, scrollTo };
}

describe("overlay scroll lock", () => {
  it("restores the original styles and scroll position", () => {
    const { style, scrollTo, attributes } = setup();
    const release = lockPageScroll(); releases.push(release);
    expect(style.position).toBe("fixed");
    expect(style.top).toBe("-540px");
    expect(style.paddingRight).toBe("calc(8px + 15px)");
    expect(attributes.get("data-scroll-locked")).toBe("true");
    release();
    expect(style.position).toBe("relative");
    expect(style.paddingRight).toBe("8px");
    expect(attributes.has("data-scroll-locked")).toBe(false);
    expect(scrollTo).toHaveBeenCalledWith({ left: 0, top: 540, behavior: "instant" });
  });
  it("keeps the page locked until all overlays close", () => {
    const { style } = setup();
    const first = lockPageScroll(), second = lockPageScroll(); releases.push(first, second);
    first(); first();
    expect(isPageScrollLocked()).toBe(true);
    expect(style.position).toBe("fixed");
    second();
    expect(isPageScrollLocked()).toBe(false);
    expect(style.position).toBe("relative");
  });
});
