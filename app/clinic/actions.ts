"use server";

import { revalidatePath } from "next/cache";

import {
  addMedicalRecord,
  createAppointment,
  getPetById,
} from "@/lib/queries";
import { requireClinic } from "@/lib/session";

function str(v: FormDataEntryValue | null): string | null {
  const s = (v ?? "").toString().trim();
  return s.length ? s : null;
}

export async function addMedicalRecordAction(formData: FormData) {
  const user = await requireClinic();
  const petId = str(formData.get("petId"));
  if (!petId) throw new Error("Missing pet");
  const pet = await getPetById(petId);
  if (!pet) throw new Error("Pet not found");

  await addMedicalRecord({
    petId,
    clinicId: user.clinicId,
    vetId: user.id,
    visitDate: str(formData.get("visitDate")) ?? new Date().toISOString().slice(0, 10),
    type: str(formData.get("type")) ?? "checkup",
    diagnosis: str(formData.get("diagnosis")),
    notes: str(formData.get("notes")),
  });
  revalidatePath(`/clinic/patients/${petId}`);
  revalidatePath("/clinic");
}

export async function scheduleAppointmentAction(formData: FormData) {
  const user = await requireClinic();
  const petId = str(formData.get("petId"));
  if (!petId) throw new Error("Missing pet");
  const when = str(formData.get("scheduledAt"));
  if (!when) throw new Error("Pick a date and time");

  await createAppointment({
    petId,
    clinicId: user.clinicId,
    scheduledAt: new Date(when),
    reason: str(formData.get("reason")),
  });
  revalidatePath("/clinic/appointments");
  revalidatePath("/clinic");
}
