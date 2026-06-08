"use server";

import { revalidatePath } from "next/cache";

import {
  addMedicalRecord,
  createAppointment,
  getClinicStaffEmails,
  getPetById,
  getUserById,
} from "@/lib/queries";
import {
  appointmentBookedOwnerEmail,
  appointmentClinicEmail,
  clinicUpdateEmail,
  sendEmail,
} from "@/lib/email";
import { formatDateTime } from "@/lib/format";
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

  const type = str(formData.get("type")) ?? "checkup";
  const diagnosis = str(formData.get("diagnosis"));

  await addMedicalRecord({
    petId,
    clinicId: user.clinicId,
    vetId: user.id,
    visitDate: str(formData.get("visitDate")) ?? new Date().toISOString().slice(0, 10),
    type,
    diagnosis,
    notes: str(formData.get("notes")),
  });

  // Notify the pet owner and the clinic team about the new record.
  const owner = await getUserById(pet.ownerId);
  if (owner?.email) {
    await sendEmail({
      to: owner.email,
      ...clinicUpdateEmail({
        title: `New health record added for ${pet.name}`,
        message: `Your clinic added a new ${type} record${diagnosis ? ` (${diagnosis})` : ""} to ${pet.name}'s passport. Open PawthCare to view the details.`,
      }),
    });
  }
  const clinicEmails = user.clinicId
    ? await getClinicStaffEmails(user.clinicId)
    : [];
  if (clinicEmails.length > 0) {
    await sendEmail({
      to: clinicEmails,
      ...clinicUpdateEmail({
        title: `Record added: ${pet.name}`,
        message: `A new ${type} record was added for ${pet.name}${diagnosis ? ` — ${diagnosis}` : ""}.`,
      }),
    });
  }

  revalidatePath(`/clinic/patients/${petId}`);
  revalidatePath("/clinic");
}

export async function scheduleAppointmentAction(formData: FormData) {
  const user = await requireClinic();
  const petId = str(formData.get("petId"));
  if (!petId) throw new Error("Missing pet");
  const when = str(formData.get("scheduledAt"));
  if (!when) throw new Error("Pick a date and time");

  const pet = await getPetById(petId);
  const reason = str(formData.get("reason"));
  const scheduledAt = new Date(when);

  await createAppointment({
    petId,
    clinicId: user.clinicId,
    scheduledAt,
    reason,
  });

  // Notify the pet owner and the clinic team (best-effort).
  const when_ = formatDateTime(scheduledAt);
  if (pet) {
    const owner = await getUserById(pet.ownerId);
    if (owner?.email) {
      await sendEmail({
        to: owner.email,
        ...appointmentBookedOwnerEmail({
          ownerName: owner.name,
          petName: pet.name,
          when: when_,
          reason: reason ?? undefined,
        }),
      });
    }
    const clinicEmails = user.clinicId
      ? await getClinicStaffEmails(user.clinicId)
      : [];
    if (clinicEmails.length > 0) {
      await sendEmail({
        to: clinicEmails,
        ...appointmentClinicEmail({
          petName: pet.name,
          when: when_,
          reason: reason ?? undefined,
        }),
      });
    }
  }

  revalidatePath("/clinic/appointments");
  revalidatePath("/clinic");
}
