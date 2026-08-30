import { createClient } from "@/infrastructure/supabase/server";

import { isInternalRole, type InternalProfile } from "../domain/role";

type ProfileRow = {
  active: boolean;
  auth_user_id: string;
  email: string;
  id: string;
  name: string;
  role: string;
};

export async function getCurrentProfile(): Promise<InternalProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("user_profiles")
    .select("id, auth_user_id, name, email, role, active")
    .eq("auth_user_id", user.id)
    .maybeSingle<ProfileRow>();

  if (error) {
    console.error(
      JSON.stringify({
        level: "error",
        event: "profile_lookup_failed",
        code: error.code,
      }),
    );
    return null;
  }

  if (!data || !isInternalRole(data.role)) return null;

  return {
    active: data.active,
    authUserId: data.auth_user_id,
    email: data.email,
    id: data.id,
    name: data.name,
    role: data.role,
  };
}
