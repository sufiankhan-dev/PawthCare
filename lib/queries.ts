import { and, asc, count, desc, eq, gte, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  aiAnalysis,
  aiChatMessage,
  appointment,
  clinic,
  invoice,
  medicalRecord,
  medication,
  pet,
  user,
  vaccination,
  vetListing,
  weightEntry,
} from "@/db/schema";
import type {
  AiAnalysis,
  AiChatMessage,
  Appointment,
  Clinic,
  Invoice,
  MedicalRecord,
  Medication,
  Pet,
  Vaccination,
  VetListing,
  WeightEntry,
} from "@/lib/types";

// ---------- Pets ----------

export async function getPetsByOwner(ownerId: string): Promise<Pet[]> {
  return db
    .select()
    .from(pet)
    .where(eq(pet.ownerId, ownerId))
    .orderBy(desc(pet.createdAt));
}

export async function getPetForOwner(
  petId: string,
  ownerId: string,
): Promise<Pet | null> {
  const rows = await db
    .select()
    .from(pet)
    .where(and(eq(pet.id, petId), eq(pet.ownerId, ownerId)))
    .limit(1);
  return rows[0] ?? null;
}

export async function getPetById(petId: string): Promise<Pet | null> {
  const rows = await db.select().from(pet).where(eq(pet.id, petId)).limit(1);
  return rows[0] ?? null;
}

export async function getPatientsByClinic(clinicId: string): Promise<Pet[]> {
  return db
    .select()
    .from(pet)
    .where(eq(pet.clinicId, clinicId))
    .orderBy(asc(pet.name));
}

export async function createPet(input: {
  ownerId: string;
  clinicId: string | null;
  name: string;
  species: string;
  breed: string | null;
  sex: string | null;
  birthDate: string | null;
  weightKg: string | null;
  allergies: string | null;
  notes: string | null;
  photoUrl: string | null;
}): Promise<Pet> {
  const rows = await db.insert(pet).values(input).returning();
  return rows[0];
}

// ---------- Vaccinations ----------

export async function getVaccinations(petId: string): Promise<Vaccination[]> {
  return db
    .select()
    .from(vaccination)
    .where(eq(vaccination.petId, petId))
    .orderBy(desc(vaccination.dueDate));
}

export async function addVaccination(input: {
  petId: string;
  name: string;
  dueDate: string | null;
  administeredDate: string | null;
  status: string;
}): Promise<void> {
  await db.insert(vaccination).values(input);
}

// ---------- Medications ----------

export async function getMedications(petId: string): Promise<Medication[]> {
  return db
    .select()
    .from(medication)
    .where(eq(medication.petId, petId))
    .orderBy(desc(medication.createdAt));
}

export async function addMedication(input: {
  petId: string;
  name: string;
  dosage: string | null;
  frequency: string | null;
  startDate: string | null;
  endDate: string | null;
  reminderTime: string | null;
}): Promise<void> {
  await db.insert(medication).values(input);
}

// ---------- Medical records ----------

export async function getMedicalRecords(
  petId: string,
): Promise<MedicalRecord[]> {
  return db
    .select()
    .from(medicalRecord)
    .where(eq(medicalRecord.petId, petId))
    .orderBy(desc(medicalRecord.visitDate));
}

export async function addMedicalRecord(input: {
  petId: string;
  clinicId: string | null;
  vetId: string | null;
  visitDate: string;
  type: string;
  diagnosis: string | null;
  notes: string | null;
}): Promise<void> {
  await db.insert(medicalRecord).values(input);
}

// ---------- Weights ----------

export async function getWeightEntries(petId: string): Promise<WeightEntry[]> {
  return db
    .select()
    .from(weightEntry)
    .where(eq(weightEntry.petId, petId))
    .orderBy(asc(weightEntry.recordedAt));
}

// ---------- Appointments ----------

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function attachVetNames(rows: Appointment[]): Promise<Appointment[]> {
  const ids = [
    ...new Set(rows.map((r) => r.vetId).filter((v): v is string => !!v && UUID_RE.test(v))),
  ];
  if (ids.length === 0) return rows;

  const listings = await db
    .select({ id: vetListing.id, name: vetListing.name })
    .from(vetListing)
    .where(inArray(vetListing.id, ids));
  const nameById = new Map(listings.map((l) => [l.id, l.name]));

  return rows.map((r) => ({
    ...r,
    vetName: r.vetId ? nameById.get(r.vetId) : undefined,
  }));
}

export async function getAppointmentsByOwner(
  ownerId: string,
): Promise<Appointment[]> {
  const rows = await db
    .select({
      id: appointment.id,
      petId: appointment.petId,
      clinicId: appointment.clinicId,
      vetId: appointment.vetId,
      scheduledAt: appointment.scheduledAt,
      reason: appointment.reason,
      status: appointment.status,
      createdAt: appointment.createdAt,
      petName: pet.name,
    })
    .from(appointment)
    .innerJoin(pet, eq(pet.id, appointment.petId))
    .where(eq(pet.ownerId, ownerId))
    .orderBy(asc(appointment.scheduledAt));
  return attachVetNames(rows);
}

export async function getAppointmentsByClinic(
  clinicId: string,
): Promise<Appointment[]> {
  return db
    .select({
      id: appointment.id,
      petId: appointment.petId,
      clinicId: appointment.clinicId,
      vetId: appointment.vetId,
      scheduledAt: appointment.scheduledAt,
      reason: appointment.reason,
      status: appointment.status,
      createdAt: appointment.createdAt,
      petName: pet.name,
    })
    .from(appointment)
    .innerJoin(pet, eq(pet.id, appointment.petId))
    .where(eq(appointment.clinicId, clinicId))
    .orderBy(asc(appointment.scheduledAt));
}

export async function createAppointment(input: {
  petId: string;
  clinicId: string | null;
  vetId?: string | null;
  scheduledAt: Date;
  reason: string | null;
}): Promise<void> {
  await db.insert(appointment).values({ ...input, status: "scheduled" });
}

// ---------- Invoices ----------

export async function getInvoicesByClinic(
  clinicId: string,
): Promise<Invoice[]> {
  const rows = await db
    .select({
      id: invoice.id,
      clinicId: invoice.clinicId,
      petId: invoice.petId,
      appointmentId: invoice.appointmentId,
      items: invoice.items,
      amount: invoice.amount,
      status: invoice.status,
      createdAt: invoice.createdAt,
      petName: pet.name,
    })
    .from(invoice)
    .leftJoin(pet, eq(pet.id, invoice.petId))
    .where(eq(invoice.clinicId, clinicId))
    .orderBy(desc(invoice.createdAt));
  return rows as unknown as Invoice[];
}

// ---------- Clinics ----------

export async function getClinicById(clinicId: string): Promise<Clinic | null> {
  const rows = await db
    .select()
    .from(clinic)
    .where(eq(clinic.id, clinicId))
    .limit(1);
  return rows[0] ?? null;
}

export async function getFirstClinic(): Promise<Clinic | null> {
  const rows = await db
    .select()
    .from(clinic)
    .orderBy(asc(clinic.createdAt))
    .limit(1);
  return rows[0] ?? null;
}

export async function getOrCreateDefaultClinic(): Promise<Clinic> {
  const existing = await getFirstClinic();
  if (existing) return existing;
  const rows = await db
    .insert(clinic)
    .values({
      name: "PawthCare Demo Clinic",
      address: "12 Wellness Ave, Riyadh",
      phone: "+966 11 000 0000",
    })
    .returning();
  return rows[0];
}

export async function setUserClinic(
  userId: string,
  clinicId: string,
): Promise<void> {
  await db.update(user).set({ clinicId }).where(eq(user.id, userId));
}

// ---------- Vet directory ----------

export async function getVetListings(): Promise<VetListing[]> {
  return db
    .select()
    .from(vetListing)
    .orderBy(desc(vetListing.rating), desc(vetListing.reviewCount));
}

// ---------- AI ----------

export async function getAnalyses(petId: string): Promise<AiAnalysis[]> {
  const rows = await db
    .select()
    .from(aiAnalysis)
    .where(eq(aiAnalysis.petId, petId))
    .orderBy(desc(aiAnalysis.createdAt));
  return rows as unknown as AiAnalysis[];
}

export async function saveAnalysis(input: {
  petId: string;
  thumbUrl: string | null;
  riskScore: number;
  urgency: string;
  findings: unknown;
  summary: string;
  recommendations: unknown;
}): Promise<void> {
  await db.insert(aiAnalysis).values({
    petId: input.petId,
    kind: "photo",
    thumbUrl: input.thumbUrl,
    riskScore: input.riskScore,
    urgency: input.urgency,
    findings: input.findings,
    summary: input.summary,
    recommendations: input.recommendations,
  });
}

export async function getEarlyDetections(clinicId: string) {
  const rows = await db
    .select({
      id: aiAnalysis.id,
      petId: aiAnalysis.petId,
      petName: pet.name,
      summary: aiAnalysis.summary,
      riskScore: aiAnalysis.riskScore,
      urgency: aiAnalysis.urgency,
      createdAt: aiAnalysis.createdAt,
    })
    .from(aiAnalysis)
    .innerJoin(pet, eq(pet.id, aiAnalysis.petId))
    .where(
      and(
        eq(pet.clinicId, clinicId),
        inArray(aiAnalysis.urgency, ["soon", "urgent"]),
      ),
    )
    .orderBy(desc(aiAnalysis.createdAt))
    .limit(8);
  return rows;
}

export async function getChatMessages(petId: string): Promise<AiChatMessage[]> {
  return db
    .select()
    .from(aiChatMessage)
    .where(eq(aiChatMessage.petId, petId))
    .orderBy(asc(aiChatMessage.createdAt));
}

export async function saveChatMessage(input: {
  petId: string;
  role: string;
  content: string;
}): Promise<void> {
  await db.insert(aiChatMessage).values(input);
}

// ---------- Dashboard stats ----------

export async function getOwnerStats(ownerId: string) {
  const [pets] = await db
    .select({ c: count() })
    .from(pet)
    .where(eq(pet.ownerId, ownerId));
  const [due] = await db
    .select({ c: count() })
    .from(vaccination)
    .innerJoin(pet, eq(pet.id, vaccination.petId))
    .where(and(eq(pet.ownerId, ownerId), eq(vaccination.status, "due")));
  const [appts] = await db
    .select({ c: count() })
    .from(appointment)
    .innerJoin(pet, eq(pet.id, appointment.petId))
    .where(and(eq(pet.ownerId, ownerId), gte(appointment.scheduledAt, new Date())));
  const [analyses] = await db
    .select({ c: count() })
    .from(aiAnalysis)
    .innerJoin(pet, eq(pet.id, aiAnalysis.petId))
    .where(eq(pet.ownerId, ownerId));
  return {
    pets: pets.c,
    dueVaccinations: due.c,
    upcomingAppointments: appts.c,
    analyses: analyses.c,
  };
}

export async function getClinicStats(clinicId: string) {
  const [patients] = await db
    .select({ c: count() })
    .from(pet)
    .where(eq(pet.clinicId, clinicId));
  const [appts] = await db
    .select({ c: count() })
    .from(appointment)
    .where(
      and(
        eq(appointment.clinicId, clinicId),
        gte(appointment.scheduledAt, new Date()),
      ),
    );
  const [early] = await db
    .select({ c: count() })
    .from(aiAnalysis)
    .innerJoin(pet, eq(pet.id, aiAnalysis.petId))
    .where(
      and(
        eq(pet.clinicId, clinicId),
        inArray(aiAnalysis.urgency, ["soon", "urgent"]),
      ),
    );
  const [unpaid] = await db
    .select({ total: sql<string>`COALESCE(SUM(${invoice.amount}), 0)` })
    .from(invoice)
    .where(and(eq(invoice.clinicId, clinicId), eq(invoice.status, "unpaid")));
  return {
    patients: patients.c,
    upcomingAppointments: appts.c,
    earlyDetections: early.c,
    unpaidTotal: Number(unpaid.total ?? 0),
  };
}
