import { unstable_getResponseFromNextConfig } from "next/experimental/testing/server";
import { describe, expect, it } from "vitest";

import nextConfig from "../../next.config";
import robots from "../app/robots";

describe("launch security configuration", () => {
  it("adds defensive headers to every route", async () => {
    const response = await unstable_getResponseFromNextConfig({
      nextConfig,
      url: "https://aicon.invalid/catalogo",
    });

    expect(response.headers.get("content-security-policy")).toContain(
      "frame-ancestors 'none'",
    );
    expect(response.headers.get("permissions-policy")).toContain("camera=()");
    expect(response.headers.get("referrer-policy")).toBe(
      "strict-origin-when-cross-origin",
    );
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    expect(response.headers.get("x-frame-options")).toBe("DENY");
  });

  it("keeps private and tokenized routes out of crawler instructions", () => {
    const rules = robots().rules;
    const rule = Array.isArray(rules) ? rules[0] : rules;

    expect(rule.disallow).toEqual([
      "/panel/",
      "/iniciar-sesion",
      "/gestionar-cita/",
    ]);
  });
});
