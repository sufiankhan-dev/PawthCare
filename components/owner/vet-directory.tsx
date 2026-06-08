"use client";

import { useMemo, useState } from "react";
import {
  BadgeCheck,
  Clock,
  Mail,
  MapPin,
  Phone,
  Search,
  Star,
  Stethoscope,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { VetListing } from "@/lib/types";

export function VetDirectory({ vets }: { vets: VetListing[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return vets;
    return vets.filter((v) =>
      [v.name, v.clinicName, v.specialty, v.city, v.address]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(q)),
    );
  }, [vets, query]);

  return (
    <div>
      <div className="relative mb-5 max-w-md">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, clinic, specialty, or city..."
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            No vets match &ldquo;{query}&rdquo;.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((v) => (
            <VetCard key={v.id} vet={v} />
          ))}
        </div>
      )}
    </div>
  );
}

function VetCard({ vet }: { vet: VetListing }) {
  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-col gap-4 py-1">
        <div className="flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Stethoscope className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate font-semibold">{vet.name}</p>
              {vet.rating && (
                <span className="flex items-center gap-0.5 text-xs font-medium text-amber-600">
                  <Star className="size-3.5 fill-amber-500 text-amber-500" />
                  {vet.rating}
                  <span className="text-muted-foreground">({vet.reviewCount})</span>
                </span>
              )}
            </div>
            <p className="truncate text-sm text-muted-foreground">
              {vet.clinicName}
            </p>
          </div>
        </div>

        {vet.specialty && (
          <p className="text-sm">
            <span className="font-medium">{vet.specialty}</span>
            {vet.yearsExperience ? (
              <span className="text-muted-foreground">
                {" "}
                · {vet.yearsExperience} yrs experience
              </span>
            ) : null}
          </p>
        )}

        {vet.bio && <p className="text-sm text-muted-foreground">{vet.bio}</p>}

        <div className="flex flex-wrap gap-2">
          {vet.emergency && (
            <Badge className="bg-destructive/10 text-destructive">
              24/7 Emergency
            </Badge>
          )}
          <Badge variant={vet.acceptingNew ? "secondary" : "outline"}>
            {vet.acceptingNew ? (
              <>
                <BadgeCheck className="size-3.5" /> Accepting new patients
              </>
            ) : (
              "Waitlist only"
            )}
          </Badge>
        </div>

        <div className="space-y-1.5 text-sm text-muted-foreground">
          {vet.address && (
            <p className="flex items-center gap-2">
              <MapPin className="size-4 shrink-0 text-primary" />
              {vet.address}
              {vet.city ? `, ${vet.city}` : ""}
            </p>
          )}
          {vet.hours && (
            <p className="flex items-center gap-2">
              <Clock className="size-4 shrink-0 text-primary" />
              {vet.hours}
            </p>
          )}
          {vet.phone && (
            <p className="flex items-center gap-2">
              <Phone className="size-4 shrink-0 text-primary" />
              {vet.phone}
            </p>
          )}
        </div>

        <div className="mt-auto flex gap-2 pt-2">
          {vet.phone && (
            <Button asChild size="sm" className="flex-1">
              <a href={`tel:${vet.phone}`}>
                <Phone className="size-4" />
                Call
              </a>
            </Button>
          )}
          {vet.email && (
            <Button asChild size="sm" variant="outline" className="flex-1">
              <a href={`mailto:${vet.email}`}>
                <Mail className="size-4" />
                Email
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
