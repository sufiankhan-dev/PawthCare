import type { InferSelectModel } from "drizzle-orm";
import * as s from "@/db/schema";

export type AiFinding = {
  label: string;
  severity: "low" | "moderate" | "high";
  detail: string;
};

export type InvoiceItem = { label: string; amount: number };

export type Clinic = InferSelectModel<typeof s.clinic>;
export type VetListing = InferSelectModel<typeof s.vetListing>;
export type Pet = InferSelectModel<typeof s.pet>;
export type WeightEntry = InferSelectModel<typeof s.weightEntry>;
export type Vaccination = InferSelectModel<typeof s.vaccination>;
export type Medication = InferSelectModel<typeof s.medication>;
export type MedicalRecord = InferSelectModel<typeof s.medicalRecord>;
export type AiChatMessage = InferSelectModel<typeof s.aiChatMessage>;

export type Appointment = InferSelectModel<typeof s.appointment> & {
  petName?: string;
  vetName?: string;
};

export type Invoice = Omit<InferSelectModel<typeof s.invoice>, "items"> & {
  items: InvoiceItem[];
  petName?: string;
};

export type AiAnalysis = Omit<
  InferSelectModel<typeof s.aiAnalysis>,
  "findings" | "recommendations"
> & {
  findings: AiFinding[];
  recommendations: string[];
};

export type OwnerStats = {
  pets: number;
  dueVaccinations: number;
  upcomingAppointments: number;
  analyses: number;
};

export type ClinicStats = {
  patients: number;
  upcomingAppointments: number;
  earlyDetections: number;
  unpaidTotal: number;
};
