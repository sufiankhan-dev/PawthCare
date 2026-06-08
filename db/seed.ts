import { eq, sql } from "drizzle-orm";

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
  vetListing,
  weightEntry,
} from "@/db/schema";
import { auth } from "@/lib/auth";
import { getOrCreateDefaultClinic, setUserClinic } from "@/lib/queries";

async function ensureVetListings() {
  // Create the table if it doesn't exist yet (keeps seed self-contained).
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS vet_listing (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text NOT NULL,
      clinic_name text,
      specialty text,
      bio text,
      address text,
      city text,
      phone text,
      email text,
      rating numeric(2,1),
      review_count integer NOT NULL DEFAULT 0,
      years_experience integer,
      hours text,
      emergency boolean NOT NULL DEFAULT false,
      accepting_new boolean NOT NULL DEFAULT true,
      image_url text,
      lat numeric(9,6),
      lng numeric(9,6),
      created_at timestamp NOT NULL DEFAULT now()
    )
  `);

  const existing = await db.select({ id: vetListing.id }).from(vetListing).limit(1);
  if (existing.length > 0) {
    console.log("Vet listings already exist - skipping.");
    return;
  }

  await db.insert(vetListing).values([
    {
      name: "Dr. Sara Khan",
      clinicName: "PawthCare Animal Hospital",
      specialty: "General practice & internal medicine",
      bio: "Board-certified vet with a focus on preventive care and chronic disease management for dogs and cats.",
      address: "12 Jinnah Avenue, Blue Area",
      city: "Islamabad",
      phone: "+92 51 111 2233",
      email: "sara.khan@pawthcare.app",
      rating: "4.9",
      reviewCount: 214,
      yearsExperience: 12,
      hours: "Mon-Sat 9:00-19:00",
      emergency: true,
      acceptingNew: true,
      lat: "33.726100",
      lng: "73.060000",
    },
    {
      name: "Dr. Bilal Ahmed",
      clinicName: "City Pet Clinic",
      specialty: "Dermatology & allergies",
      bio: "Specializes in skin conditions, allergies, and ear infections — common causes of itching and discomfort.",
      address: "44 College Road, F-7 Markaz",
      city: "Islamabad",
      phone: "+92 51 222 3344",
      email: "bilal@citypetclinic.pk",
      rating: "4.7",
      reviewCount: 156,
      yearsExperience: 9,
      hours: "Mon-Fri 10:00-18:00",
      emergency: false,
      acceptingNew: true,
      lat: "33.720500",
      lng: "73.055200",
    },
    {
      name: "Dr. Ayesha Malik",
      clinicName: "Companion Care Veterinary",
      specialty: "Surgery & orthopedics",
      bio: "Soft-tissue and orthopedic surgeon. Handles fractures, spays/neuters, and complex procedures.",
      address: "8 Margalla Road, F-6",
      city: "Islamabad",
      phone: "+92 51 333 4455",
      email: "ayesha@companioncare.pk",
      rating: "4.8",
      reviewCount: 98,
      yearsExperience: 15,
      hours: "Tue-Sun 9:00-17:00",
      emergency: true,
      acceptingNew: false,
      lat: "33.730900",
      lng: "73.048800",
    },
    {
      name: "Dr. Hamza Sheikh",
      clinicName: "24/7 Animal Emergency",
      specialty: "Emergency & critical care",
      bio: "Round-the-clock emergency vet for accidents, poisoning, and acute illness.",
      address: "100 IJP Road, I-9",
      city: "Islamabad",
      phone: "+92 51 444 5566",
      email: "er@animalemergency.pk",
      rating: "4.6",
      reviewCount: 321,
      yearsExperience: 11,
      hours: "Open 24 hours",
      emergency: true,
      acceptingNew: true,
      lat: "33.660400",
      lng: "73.045100",
    },
    {
      name: "Dr. Nimra Riaz",
      clinicName: "Whiskers & Tails Clinic",
      specialty: "Feline medicine",
      bio: "Cat-only practice offering low-stress visits, dentistry, and senior cat care.",
      address: "23 Service Road, E-11",
      city: "Islamabad",
      phone: "+92 51 555 6677",
      email: "nimra@whiskerstails.pk",
      rating: "4.9",
      reviewCount: 142,
      yearsExperience: 8,
      hours: "Mon-Sat 11:00-19:00",
      emergency: false,
      acceptingNew: true,
      lat: "33.701200",
      lng: "72.971900",
    },
    {
      name: "Dr. Usman Tariq",
      clinicName: "Greenleaf Vet & Wellness",
      specialty: "Nutrition & preventive care",
      bio: "Wellness-focused vet helping with weight management, nutrition plans, and vaccinations.",
      address: "5 Park Road, Chak Shahzad",
      city: "Islamabad",
      phone: "+92 51 666 7788",
      email: "usman@greenleafvet.pk",
      rating: "4.5",
      reviewCount: 73,
      yearsExperience: 6,
      hours: "Mon-Fri 9:00-17:00",
      emergency: false,
      acceptingNew: true,
      lat: "33.652800",
      lng: "73.150500",
    },
  ]);

  console.log("Inserted vet directory listings.");
}

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

async function ensureAppointmentColumns() {
  // Idempotent: add the shared-screening column if an older DB predates it.
  await db.execute(sql`
    ALTER TABLE appointment
    ADD COLUMN IF NOT EXISTS shared_analysis_id uuid
  `);
}

async function ensureUserBillingColumns() {
  // Idempotent: subscription / usage columns on the better-auth user table.
  await db.execute(sql`
    ALTER TABLE "user"
    ADD COLUMN IF NOT EXISTS plan text NOT NULL DEFAULT 'companion'
  `);
  await db.execute(sql`
    ALTER TABLE "user"
    ADD COLUMN IF NOT EXISTS screenings_used integer NOT NULL DEFAULT 0
  `);
  await db.execute(sql`
    ALTER TABLE "user"
    ADD COLUMN IF NOT EXISTS screenings_period text
  `);
}

async function main() {
  console.log("Seeding PawthCare demo data...");

  await ensureVetListings();
  await ensureAppointmentColumns();
  await ensureUserBillingColumns();

  const clinic = await getOrCreateDefaultClinic();

  const vetId = await ensureUser({
    email: "vet@pawthcare.app",
    password: "password123",
    name: "Dr. Sara Khan",
    role: "vet",
  });
  await setUserClinic(vetId, clinic.id);

  const ownerId = await ensureUser({
    email: "owner@pawthcare.app",
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
  console.log("  Owner login:  owner@pawthcare.app / password123");
  console.log("  Vet login:    vet@pawthcare.app / password123");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
