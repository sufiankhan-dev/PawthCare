"use server";

import { revalidatePath } from "next/cache";

import {
  addMedication,
  addVaccination,
  createAppointment,
  createPet,
  getOrCreateDefaultClinic,
  getPetForOwner,
} from "@/lib/queries";
import { requireOwner } from "@/lib/session";

function str(v: FormDataEntryValue | null): string | null {
  const s = (v ?? "").toString().trim();
  return s.length ? s : null;
}

export async function createPetAction(formData: FormData) {
  const user = await requireOwner();
  const clinic = await getOrCreateDefaultClinic();

  const name = str(formData.get("name"));
  if (!name) throw new Error("Pet name is required");

  await createPet({
    ownerId: user.id,
    clinicId: clinic.id,
    name,
    species: str(formData.get("species")) ?? "dog",
    breed: str(formData.get("breed")),
    sex: str(formData.get("sex")),
    birthDate: str(formData.get("birthDate")),
    weightKg: str(formData.get("weightKg")),
    allergies: str(formData.get("allergies")),
    notes: str(formData.get("notes")),
    photoUrl: null,
  });

  revalidatePath("/app/pets");
  revalidatePath("/app");
}

async function assertOwnsPet(petId: string) {
  const user = await requireOwner();
  const pet = await getPetForOwner(petId, user.id);
  if (!pet) throw new Error("Pet not found");
  return { user, pet };
}

export async function addVaccinationAction(formData: FormData) {
  const petId = str(formData.get("petId"));
  if (!petId) throw new Error("Missing pet");
  await assertOwnsPet(petId);

  const administered = str(formData.get("administeredDate"));
  await addVaccination({
    petId,
    name: str(formData.get("name")) ?? "Vaccination",
    dueDate: str(formData.get("dueDate")),
    administeredDate: administered,
    status: administered ? "completed" : "due",
  });
  revalidatePath(`/app/pets/${petId}`);
}

export async function addMedicationAction(formData: FormData) {
  const petId = str(formData.get("petId"));
  if (!petId) throw new Error("Missing pet");
  await assertOwnsPet(petId);

  await addMedication({
    petId,
    name: str(formData.get("name")) ?? "Medication",
    dosage: str(formData.get("dosage")),
    frequency: str(formData.get("frequency")),
    startDate: str(formData.get("startDate")),
    endDate: str(formData.get("endDate")),
    reminderTime: str(formData.get("reminderTime")),
  });
  revalidatePath(`/app/pets/${petId}`);
}

export async function bookAppointmentAction(formData: FormData) {
  const petId = str(formData.get("petId"));
  if (!petId) throw new Error("Missing pet");
  const { pet } = await assertOwnsPet(petId);

  const when = str(formData.get("scheduledAt"));
  if (!when) throw new Error("Pick a date and time");

  await createAppointment({
    petId,
    clinicId: pet.clinicId,
    scheduledAt: new Date(when),
    reason: str(formData.get("reason")),
  });
  revalidatePath("/app/appointments");
  revalidatePath("/app");
}
