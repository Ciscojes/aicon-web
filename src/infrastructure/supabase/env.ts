import { z } from "zod";

const supabaseEnvironmentSchema = z.object({
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
});

export type SupabaseEnvironment = z.infer<typeof supabaseEnvironmentSchema>;

export function getSupabaseEnvironment(): SupabaseEnvironment {
  const result = supabaseEnvironmentSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  });

  if (!result.success) {
    throw new Error(
      "Falta configurar NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    );
  }

  return result.data;
}
