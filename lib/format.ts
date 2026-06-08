export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function petAge(birthDate: string | null | undefined): string {
  if (!birthDate) return "Unknown age";
  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) return "Unknown age";
  const now = new Date();
  let months =
    (now.getFullYear() - birth.getFullYear()) * 12 +
    (now.getMonth() - birth.getMonth());
  if (now.getDate() < birth.getDate()) months -= 1;
  if (months < 0) months = 0;
  const years = Math.floor(months / 12);
  const remMonths = months % 12;
  if (years === 0) return `${remMonths} mo`;
  if (remMonths === 0) return `${years} yr`;
  return `${years} yr ${remMonths} mo`;
}

export function riskTone(score: number): {
  label: string;
  badge: "success" | "warning" | "destructive";
  bar: string;
} {
  if (score >= 67)
    return { label: "High", badge: "destructive", bar: "bg-destructive" };
  if (score >= 34)
    return { label: "Moderate", badge: "warning", bar: "bg-amber-500" };
  return { label: "Low", badge: "success", bar: "bg-emerald-500" };
}

export const URGENCY_META: Record<
  string,
  { label: string; badge: "success" | "warning" | "destructive" | "secondary" }
> = {
  routine: { label: "Routine", badge: "success" },
  monitor: { label: "Monitor", badge: "secondary" },
  soon: { label: "See vet soon", badge: "warning" },
  urgent: { label: "Urgent", badge: "destructive" },
};

export function speciesEmoji(species: string): string {
  const s = species.toLowerCase();
  if (s.includes("cat")) return "🐱";
  if (s.includes("dog")) return "🐶";
  if (s.includes("bird")) return "🐦";
  if (s.includes("rabbit")) return "🐰";
  return "🐾";
}
