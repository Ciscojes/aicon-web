"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/infrastructure/supabase/server";

const loginSchema = z.object({
  email: z.email("Ingresa un correo válido.").trim(),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
});

export type LoginState = {
  errors?: { email?: string[]; password?: string[] };
  message?: string;
};

export async function login(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const validation = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validation.success) {
    return { errors: validation.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(validation.data);

  if (error || !data.user) {
    return { message: "El correo o la contraseña no son correctos." };
  }

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("active")
    .eq("auth_user_id", data.user.id)
    .maybeSingle<{ active: boolean }>();

  if (!profile?.active) {
    await supabase.auth.signOut();
    return { message: "Tu cuenta aún no tiene acceso al panel." };
  }

  const requestedPath = formData.get("nextPath");
  const nextPath =
    typeof requestedPath === "string" && requestedPath.startsWith("/panel")
      ? requestedPath
      : "/panel";

  redirect(nextPath);
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/iniciar-sesion");
}
