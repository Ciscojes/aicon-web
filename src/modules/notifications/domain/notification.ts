export const notificationChannelLabels = {
  email: "Correo",
  whatsapp: "WhatsApp",
} as const;

export const notificationStatusLabels = {
  cancelled: "Retirada",
  failed: "Falló",
  processing: "Procesando",
  queued: "Programada",
  sent: "Enviada",
} as const;

export const notificationTemplateLabels = {
  appointment_cancelled: "Cancelación",
  appointment_confirmation: "Confirmación",
  appointment_reminder_24h: "Recordatorio 24 h",
  appointment_reminder_2h: "Recordatorio 2 h",
  appointment_rescheduled: "Reprogramación",
} as const;

export type NotificationStatus = keyof typeof notificationStatusLabels;

export type AppointmentNotification = {
  attemptCount: number;
  channel: keyof typeof notificationChannelLabels;
  id: string;
  lastError: string | null;
  recipientKind: "advisor" | "contact";
  scheduledFor: string;
  sentAt: string | null;
  status: NotificationStatus;
  template: keyof typeof notificationTemplateLabels;
};

export function canRetryNotification(status: NotificationStatus): boolean {
  return status === "failed";
}
