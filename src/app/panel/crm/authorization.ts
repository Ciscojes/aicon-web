import "server-only";

import { redirect } from "next/navigation";

import { canAccessCrm } from "@/modules/users/domain/role";
import { getCurrentProfile } from "@/modules/users/infrastructure/get-current-profile";

export async function requireCrmAccess() {
  const profile = await getCurrentProfile();
  if (!profile || !canAccessCrm(profile.role)) redirect("/panel");
  return profile;
}
