import { petAge, speciesEmoji } from "@/lib/format";
import type { Pet } from "@/lib/types";

/** Avatar + name + key facts shown at the top of pet/patient pages. */
export function PetHeader({
  pet,
  meta,
  action,
}: {
  pet: Pet;
  meta?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-4">
        <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-card text-3xl shadow-soft ring-1 ring-foreground/[0.05]">
          {speciesEmoji(pet.species)}
        </span>
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-semibold tracking-tight sm:text-[1.75rem]">
            {pet.name}
          </h1>
          <p className="truncate text-sm text-muted-foreground">
            {pet.breed || pet.species} · {petAge(pet.birthDate)}
            {pet.weightKg ? ` · ${pet.weightKg} kg` : ""}
          </p>
          {meta}
        </div>
      </div>
      {action && <div className="flex flex-wrap gap-2">{action}</div>}
    </div>
  );
}
