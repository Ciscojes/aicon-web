import "server-only";

import { redirect } from "next/navigation";

import { canManageUsers } from "@/modules/users/domain/role";
import { getCurrentProfile } from "@/modules/users/infrastructure/get-current-profile";

export async function requireAdministrator() {
  const profile = await getCurrentProfile();
  if (!profile || !canManageUsers(profile.role)) redirect("/panel");
  return profile;
}
