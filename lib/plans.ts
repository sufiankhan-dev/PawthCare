export type PlanId = "companion" | "guardian" | "clinic";

export const PLAN_META: Record<
  PlanId,
  {
    name: string;
    price: string;
    priceAmount: number;
    cadence: string;
    tagline: string;
    screeningsPerMonth: number; // Infinity = unlimited
    features: string[];
  }
> = {
  companion: {
    name: "Companion",
    price: "$0",
    priceAmount: 0,
    cadence: "forever",
    tagline: "For one curious pet parent.",
    screeningsPerMonth: 3,
    features: [
      "1 pet profile",
      "Digital pet passport",
      "3 AI photo screenings / month",
      "Vaccination & med reminders",
    ],
  },
  guardian: {
    name: "Guardian",
    price: "$9",
    priceAmount: 9,
    cadence: "/ month",
    tagline: "For households that want peace of mind.",
    screeningsPerMonth: Infinity,
    features: [
      "Unlimited pets",
      "Unlimited AI photo screening",
      "AI health assistant with full history",
      "Priority reminders & weight trends",
      "Shareable records for any vet",
    ],
  },
  clinic: {
    name: "Clinic",
    price: "$49",
    priceAmount: 49,
    cadence: "/ month",
    tagline: "For veterinary teams and practices.",
    screeningsPerMonth: Infinity,
    features: [
      "Patient EMR & scheduling",
      "AI-flagged cases for your team",
      "Invoicing & billing overview",
      "Multiple staff seats",
      "Owner collaboration tools",
    ],
  },
};

export function planScreeningLimit(plan: string): number {
  return PLAN_META[(plan as PlanId)]?.screeningsPerMonth ?? 3;
}

/** Current usage period as YYYY-MM (resets monthly). */
export function currentPeriod(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}
