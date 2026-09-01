import { describe, expect, it } from "vitest";

import {
  canAccessCrm,
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

  it("reserva los datos del CRM para administradores y asesores", () => {
    expect(canAccessCrm("administrator")).toBe(true);
    expect(canAccessCrm("advisor")).toBe(true);
    expect(canAccessCrm("editor")).toBe(false);
  });
});
