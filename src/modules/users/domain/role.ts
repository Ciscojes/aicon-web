export const internalRoles = ["administrator", "advisor", "editor"] as const;

export type InternalRole = (typeof internalRoles)[number];

export type InternalProfile = {
  active: boolean;
  authUserId: string;
  email: string;
  id: string;
  name: string;
  role: InternalRole;
};

export function isInternalRole(value: unknown): value is InternalRole {
  return internalRoles.includes(value as InternalRole);
}

export function canManageCatalog(role: InternalRole): boolean {
  return role === "administrator" || role === "editor";
}

export function canManageUsers(role: InternalRole): boolean {
  return role === "administrator";
}

export function canAccessCrm(role: InternalRole): boolean {
  return role === "administrator" || role === "advisor";
}
