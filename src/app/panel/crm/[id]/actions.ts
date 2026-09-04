"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireCrmAccess } from "../authorization";
import { toCostaRicaDateTimeLocal } from "@/modules/crm/domain/follow-up";
import {
  addOpportunityNote,
  assignOpportunityAdvisor,
  changeOpportunityStage,
  setOpportunityNextAction,
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
const localDateTimeSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
const followUpDescriptionSchema = z.string().trim().min(1).max(500);

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

export async function updateOpportunityFollowUp(id: string, formData: FormData) {
  await requireCrmAccess();
  if (!idSchema.safeParse(id).success) redirect("/panel/crm");

  if (formData.get("intent") === "clear") {
    if (!(await setOpportunityNextAction(id, null, null))) {
      redirect(destination(id, "error", "No fue posible retirar la próxima acción."));
    }
    revalidatePath("/panel");
    revalidatePath("/panel/crm");
    revalidatePath(`/panel/crm/${id}`);
    redirect(destination(id, "notice", "Próxima acción marcada como atendida."));
  }

  const dateTime = localDateTimeSchema.safeParse(formData.get("nextActionAt"));
  const description = followUpDescriptionSchema.safeParse(formData.get("description"));
  if (!dateTime.success || !description.success) {
    redirect(destination(id, "error", "Indica una fecha futura y una descripción de hasta 500 caracteres."));
  }

  const parsedDate = new Date(`${dateTime.data}:00-06:00`);
  if (Number.isNaN(parsedDate.getTime())
    || toCostaRicaDateTimeLocal(parsedDate.toISOString()) !== dateTime.data
    || parsedDate.getTime() <= Date.now()) {
    redirect(destination(id, "error", "La próxima acción debe programarse para una fecha futura."));
  }

  if (!(await setOpportunityNextAction(id, parsedDate.toISOString(), description.data))) {
    redirect(destination(id, "error", "No fue posible guardar la próxima acción."));
  }

  revalidatePath("/panel");
  revalidatePath("/panel/crm");
  revalidatePath(`/panel/crm/${id}`);
  redirect(destination(id, "notice", "Próxima acción actualizada."));
}
