import { describe, expect, it } from "vitest";

import { authorizeInternalAccess } from "./authorize-internal-access";

const administrator = {
  active: true,
  authUserId: "auth-user-id",
  email: "admin@example.com",
  id: "profile-id",
  name: "Administración",
  role: "administrator" as const,
};

describe("authorizeInternalAccess", () => {
  it("permite el acceso a un perfil interno activo", () => {
    expect(authorizeInternalAccess(administrator)).toEqual({
      allowed: true,
      profile: administrator,
    });
  });

  it("rechaza una cuenta sin perfil interno", () => {
    expect(authorizeInternalAccess(null)).toEqual({
      allowed: false,
      reason: "missing-profile",
    });
  });

  it("rechaza un perfil desactivado", () => {
    expect(
      authorizeInternalAccess({ ...administrator, active: false }),
    ).toEqual({ allowed: false, reason: "inactive" });
  });
});
