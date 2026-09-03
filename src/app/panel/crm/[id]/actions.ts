"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireCrmAccess } from "../authorization";
import {
  addOpportunityNote,
  changeOpportunityStage,
} from "@/modules/crm/infrastructure/opportunity-repository";

const idSchema = z.uuid();
const noteSchema = z.string().trim().min(1).max(5000);
const stageSchema = z.enum([
  "new",
  "contacted",
  "visit_scheduled",
  "quote",
  "negotiation",
  "sold",
  "discarded",
]);

function destination(id: string, kind: "error" | "notice", message: string) {
  const query = new URLSearchParams({ [kind]: message });
  return `/panel/crm/${id}?${query.toString()}`;
}

export async function createOpportunityNote(id: string, formData: FormData) {
  await requireCrmAccess();
  if (!idSchema.safeParse(id).success) redirect("/panel/crm");

  const content = formData.get("content");
  const validation = noteSchema.safeParse(content);
  if (!validation.success) {
    redirect(destination(id, "error", "Escribe una nota de entre 1 y 5000 caracteres."));
  }

  if (!(await addOpportunityNote(id, validation.data))) {
    redirect(destination(id, "error", "No fue posible guardar la nota."));
  }

  revalidatePath("/panel/crm");
  revalidatePath(`/panel/crm/${id}`);
  redirect(destination(id, "notice", "Nota agregada al historial."));
}

export async function updateOpportunityStage(id: string, formData: FormData) {
  await requireCrmAccess();
  if (!idSchema.safeParse(id).success) redirect("/panel/crm");

  const validation = stageSchema.safeParse(formData.get("stage"));
  if (!validation.success) {
    redirect(destination(id, "error", "Selecciona una etapa válida."));
  }

  if (!(await changeOpportunityStage(id, validation.data))) {
    redirect(destination(id, "error", "No fue posible cambiar la etapa."));
  }

  revalidatePath("/panel/crm");
  revalidatePath(`/panel/crm/${id}`);
  redirect(destination(id, "notice", "Etapa actualizada."));
}
