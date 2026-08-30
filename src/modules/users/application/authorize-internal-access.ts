import type { InternalProfile } from "../domain/role";

export type InternalAccessResult =
  | { allowed: true; profile: InternalProfile }
  | { allowed: false; reason: "inactive" | "missing-profile" };

export function authorizeInternalAccess(
  profile: InternalProfile | null,
): InternalAccessResult {
  if (!profile) {
    return { allowed: false, reason: "missing-profile" };
  }

  if (!profile.active) {
    return { allowed: false, reason: "inactive" };
  }

  return { allowed: true, profile };
}
