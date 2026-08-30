import { describe, expect, it } from "vitest";

import {
  canManageCatalog,
  canManageUsers,
  isInternalRole,
} from "./role";

describe("roles internos", () => {
  it("reconoce únicamente los roles aprobados", () => {
    expect(isInternalRole("administrator")).toBe(true);
    expect(isInternalRole("advisor")).toBe(true);
    expect(isInternalRole("editor")).toBe(true);
    expect(isInternalRole("owner")).toBe(false);
  });

  it("reserva la gestión de usuarios al administrador", () => {
    expect(canManageUsers("administrator")).toBe(true);
    expect(canManageUsers("advisor")).toBe(false);
    expect(canManageUsers("editor")).toBe(false);
  });

  it("permite administrar catálogo a administradores y editores", () => {
    expect(canManageCatalog("administrator")).toBe(true);
    expect(canManageCatalog("editor")).toBe(true);
    expect(canManageCatalog("advisor")).toBe(false);
  });
});
