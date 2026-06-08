import { eq } from "drizzle-orm";

import { db } from "@/db";
import {
  aiAnalysis,
  appointment,
  invoice,
  medicalRecord,
  medication,
  pet,
  user,
  vaccination,
  weightEntry,
} from "@/db/schema";
import { auth } from "@/lib/auth";
import { getOrCreateDefaultClinic, setUserClinic } from "@/lib/queries";

function daysFromNow(days: number): Date {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

function dateStr(days: number): string {
  return daysFromNow(days).toISOString().slice(0, 10);
}

async function ensureUser(input: {
  email: string;
  password: string;
  name: string;
  role: "owner" | "vet";
}): Promise<string> {
  const existing = await db
    .select()
    .from(user)
    .where(eq(user.email, input.email))
    .limit(1);
  if (existing[0]) return existing[0].id;

  await auth.api.signUpEmail({
    body: {
      email: input.email,
      password: input.password,
      name: input.name,
      role: input.role,
    },
  });

  const created = await db
    .select()
    .from(user)
    .where(eq(user.email, input.email))
    .limit(1);
  if (!created[0]) throw new Error(`Failed to create ${input.email}`);
  return created[0].id;
}

async function main() {
  console.log("Seeding PawPulse demo data...");

  const clinic = await getOrCreateDefaultClinic();

  const vetId = await ensureUser({
    email: "vet@pawpulse.app",
    password: "password123",
    name: "Dr. Sara Khan",
    role: "vet",
  });
  await setUserClinic(vetId, clinic.id);

  const ownerId = await ensureUser({
    email: "owner@pawpulse.app",
    password: "password123",
    name: "Omar Ali",
    role: "owner",
  });

  const ownerPets = await db
    .select()
    .from(pet)
    .where(eq(pet.ownerId, ownerId))
    .limit(1);
  if (ownerPets.length > 0) {
    console.log("Demo pets already exist - skipping app data.");
    console.log("Done.");
    return;
  }

  const [bella] = await db
    .insert(pet)
    .values({
      ownerId,
      clinicId: clinic.id,
      name: "Bella",
      species: "dog",
      breed: "Labrador Retriever",
      sex: "female",
      birthDate: dateStr(-365 * 3 - 40),
      weightKg: "28.50",
      allergies: "Chicken",
      notes: "Friendly, high energy. Occasional ear issues.",
    })
    .returning();

  const [milo] = await db
    .insert(pet)
    .values({
      ownerId,
      clinicId: clinic.id,
      name: "Milo",
      species: "cat",
      breed: "Domestic Shorthair",
      sex: "male",
      birthDate: dateStr(-365 * 2 - 90),
      weightKg: "4.80",
      notes: "Indoor cat.",
    })
    .returning();

  await db.insert(weightEntry).values([
    { petId: bella.id, weightKg: "26.00", recordedAt: dateStr(-180) },
    { petId: bella.id, weightKg: "27.40", recordedAt: dateStr(-90) },
    { petId: bella.id, weightKg: "28.50", recordedAt: dateStr(-5) },
  ]);

  await db.insert(vaccination).values([
    {
      petId: bella.id,
      name: "Rabies",
      administeredDate: dateStr(-300),
      dueDate: dateStr(65),
      status: "completed",
    },
    {
      petId: bella.id,
      name: "DHPP Booster",
      dueDate: dateStr(-10),
      status: "due",
    },
    {
      petId: milo.id,
      name: "FVRCP",
      administeredDate: dateStr(-120),
      dueDate: dateStr(245),
      status: "completed",
    },
  ]);

  await db.insert(medication).values([
    {
      petId: bella.id,
      name: "Apoquel",
      dosage: "16mg",
      frequency: "Once daily",
      startDate: dateStr(-14),
      reminderTime: "08:00",
    },
  ]);

  await db.insert(medicalRecord).values([
    {
      petId: bella.id,
      clinicId: clinic.id,
      vetId,
      visitDate: dateStr(-14),
      type: "illness",
      diagnosis: "Mild otitis externa (left ear)",
      notes: "Prescribed ear cleaner and Apoquel. Recheck in 2 weeks.",
    },
    {
      petId: milo.id,
      clinicId: clinic.id,
      vetId,
      visitDate: dateStr(-120),
      type: "checkup",
      diagnosis: "Healthy",
      notes: "Annual wellness exam. Dental tartar noted.",
    },
  ]);

  await db.insert(appointment).values([
    {
      petId: bella.id,
      clinicId: clinic.id,
      vetId,
      scheduledAt: daysFromNow(3),
      reason: "Ear recheck",
      status: "scheduled",
    },
    {
      petId: milo.id,
      clinicId: clinic.id,
      vetId,
      scheduledAt: daysFromNow(10),
      reason: "Dental cleaning",
      status: "scheduled",
    },
  ]);

  await db.insert(aiAnalysis).values([
    {
      petId: bella.id,
      kind: "photo",
      riskScore: 58,
      urgency: "soon",
      summary:
        "Redness and mild swelling visible in the left ear canal, consistent with irritation.",
      findings: [
        {
          label: "Ear redness",
          severity: "moderate",
          detail: "Inner ear flap appears inflamed.",
        },
        {
          label: "Discharge",
          severity: "low",
          detail: "Small amount of brown discharge visible.",
        },
      ],
      recommendations: [
        "Continue prescribed ear cleaner",
        "Book a vet recheck within a week",
      ],
    },
  ]);

  await db.insert(invoice).values([
    {
      clinicId: clinic.id,
      petId: bella.id,
      items: [
        { label: "Consultation", amount: 60 },
        { label: "Ear cytology", amount: 40 },
        { label: "Apoquel (30 tabs)", amount: 20 },
      ],
      amount: "120.00",
      status: "unpaid",
    },
    {
      clinicId: clinic.id,
      petId: milo.id,
      items: [{ label: "Wellness exam", amount: 80 }],
      amount: "80.00",
      status: "paid",
    },
  ]);

  console.log("Seed complete.");
  console.log("  Owner login:  owner@pawpulse.app / password123");
  console.log("  Vet login:    vet@pawpulse.app / password123");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
