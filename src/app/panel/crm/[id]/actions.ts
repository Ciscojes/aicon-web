"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireCrmAccess } from "../authorization";
import {
  addOpportunityNote,
  assignOpportunityAdvisor,
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

export async function updateOpportunityAdvisor(id: string, formData: FormData) {
  const profile = await requireCrmAccess();
  if (profile.role !== "administrator") {
    redirect(destination(id, "error", "Solamente un administrador puede cambiar el asesor."));
  }
  if (!idSchema.safeParse(id).success) redirect("/panel/crm");

  const value = formData.get("advisorId");
  const advisorId = value === "" ? null : z.uuid().safeParse(value);
  if (advisorId !== null && !advisorId.success) {
    redirect(destination(id, "error", "Selecciona un asesor válido."));
  }

  if (!(await assignOpportunityAdvisor(id, advisorId === null ? null : advisorId.data))) {
    redirect(destination(id, "error", "No fue posible cambiar el asesor."));
  }

  revalidatePath("/panel/crm");
  revalidatePath(`/panel/crm/${id}`);
  redirect(destination(id, "notice", advisorId === null ? "Asignación retirada." : "Asesor asignado."));
}
