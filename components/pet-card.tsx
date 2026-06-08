import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import { petAge, speciesEmoji } from "@/lib/format";
import type { Pet } from "@/lib/types";

export function PetCard({ pet, href }: { pet: Pet; href: string }) {
  return (
    <Link href={href} className="group block">
      <Card className="transition-shadow group-hover:shadow-md">
        <CardContent className="flex items-center gap-4 py-1">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-muted text-2xl">
            {speciesEmoji(pet.species)}
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium">{pet.name}</p>
            <p className="truncate text-sm text-muted-foreground">
              {pet.breed || pet.species} · {petAge(pet.birthDate)}
            </p>
            {pet.weightKg && (
              <p className="text-xs text-muted-foreground">{pet.weightKg} kg</p>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
