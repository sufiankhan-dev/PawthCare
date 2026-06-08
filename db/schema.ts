import { relations, sql } from "drizzle-orm";
import {
  boolean,
  date,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// better-auth tables (names/fields must match better-auth's expected schema)
// ---------------------------------------------------------------------------

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified")
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
  // additionalFields
  role: text("role").default("owner"),
  clinicId: text("clinic_id"),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").$defaultFn(() => new Date()),
  updatedAt: timestamp("updated_at").$defaultFn(() => new Date()),
});

// ---------------------------------------------------------------------------
// Application tables
// ---------------------------------------------------------------------------

export const clinic = pgTable("clinic", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  address: text("address"),
  phone: text("phone"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Directory of partner vets shown to owners (separate from auth users).
export const vetListing = pgTable("vet_listing", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  clinicName: text("clinic_name"),
  specialty: text("specialty"),
  bio: text("bio"),
  address: text("address"),
  city: text("city"),
  phone: text("phone"),
  email: text("email"),
  rating: numeric("rating", { precision: 2, scale: 1 }),
  reviewCount: integer("review_count").notNull().default(0),
  yearsExperience: integer("years_experience"),
  hours: text("hours"),
  emergency: boolean("emergency").notNull().default(false),
  acceptingNew: boolean("accepting_new").notNull().default(true),
  imageUrl: text("image_url"),
  lat: numeric("lat", { precision: 9, scale: 6 }),
  lng: numeric("lng", { precision: 9, scale: 6 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const pet = pgTable("pet", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerId: text("owner_id").notNull(),
  clinicId: uuid("clinic_id").references(() => clinic.id, {
    onDelete: "set null",
  }),
  name: text("name").notNull(),
  species: text("species").notNull().default("dog"),
  breed: text("breed"),
  sex: text("sex"),
  birthDate: date("birth_date"),
  weightKg: numeric("weight_kg", { precision: 6, scale: 2 }),
  photoUrl: text("photo_url"),
  allergies: text("allergies"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const weightEntry = pgTable("weight_entry", {
  id: uuid("id").primaryKey().defaultRandom(),
  petId: uuid("pet_id")
    .notNull()
    .references(() => pet.id, { onDelete: "cascade" }),
  weightKg: numeric("weight_kg", { precision: 6, scale: 2 }).notNull(),
  recordedAt: date("recorded_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const vaccination = pgTable("vaccination", {
  id: uuid("id").primaryKey().defaultRandom(),
  petId: uuid("pet_id")
    .notNull()
    .references(() => pet.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  dueDate: date("due_date"),
  administeredDate: date("administered_date"),
  status: text("status").notNull().default("due"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const medication = pgTable("medication", {
  id: uuid("id").primaryKey().defaultRandom(),
  petId: uuid("pet_id")
    .notNull()
    .references(() => pet.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  dosage: text("dosage"),
  frequency: text("frequency"),
  startDate: date("start_date"),
  endDate: date("end_date"),
  reminderTime: text("reminder_time"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const medicalRecord = pgTable("medical_record", {
  id: uuid("id").primaryKey().defaultRandom(),
  petId: uuid("pet_id")
    .notNull()
    .references(() => pet.id, { onDelete: "cascade" }),
  clinicId: uuid("clinic_id").references(() => clinic.id, {
    onDelete: "set null",
  }),
  vetId: text("vet_id"),
  visitDate: date("visit_date").notNull().defaultNow(),
  type: text("type").notNull().default("checkup"),
  diagnosis: text("diagnosis"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const appointment = pgTable("appointment", {
  id: uuid("id").primaryKey().defaultRandom(),
  petId: uuid("pet_id")
    .notNull()
    .references(() => pet.id, { onDelete: "cascade" }),
  clinicId: uuid("clinic_id").references(() => clinic.id, {
    onDelete: "set null",
  }),
  vetId: text("vet_id"),
  scheduledAt: timestamp("scheduled_at").notNull(),
  reason: text("reason"),
  status: text("status").notNull().default("scheduled"),
  // Optional AI screening the owner chose to share with the vet for this visit.
  sharedAnalysisId: uuid("shared_analysis_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const invoice = pgTable("invoice", {
  id: uuid("id").primaryKey().defaultRandom(),
  clinicId: uuid("clinic_id").references(() => clinic.id, {
    onDelete: "set null",
  }),
  petId: uuid("pet_id").references(() => pet.id, { onDelete: "set null" }),
  appointmentId: uuid("appointment_id").references(() => appointment.id, {
    onDelete: "set null",
  }),
  items: jsonb("items").notNull().default(sql`'[]'::jsonb`),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull().default("0"),
  status: text("status").notNull().default("unpaid"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const aiAnalysis = pgTable("ai_analysis", {
  id: uuid("id").primaryKey().defaultRandom(),
  petId: uuid("pet_id")
    .notNull()
    .references(() => pet.id, { onDelete: "cascade" }),
  kind: text("kind").notNull().default("photo"),
  thumbUrl: text("thumb_url"),
  riskScore: integer("risk_score").notNull().default(0),
  urgency: text("urgency").notNull().default("routine"),
  findings: jsonb("findings").notNull().default(sql`'[]'::jsonb`),
  summary: text("summary"),
  recommendations: jsonb("recommendations").notNull().default(sql`'[]'::jsonb`),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const aiChatMessage = pgTable("ai_chat_message", {
  id: uuid("id").primaryKey().defaultRandom(),
  petId: uuid("pet_id")
    .notNull()
    .references(() => pet.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const petRelations = relations(pet, ({ one, many }) => ({
  clinic: one(clinic, { fields: [pet.clinicId], references: [clinic.id] }),
  vaccinations: many(vaccination),
  medications: many(medication),
  records: many(medicalRecord),
  appointments: many(appointment),
  analyses: many(aiAnalysis),
}));
