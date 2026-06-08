"use client";

import { useState, useTransition } from "react";
import { FilePlus2 } from "lucide-react";

import { addMedicalRecordAction } from "@/app/clinic/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const fieldClass =
  "flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function AddVisitDialog({ petId }: { petId: string }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await addMedicalRecordAction(fd);
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <FilePlus2 className="size-4" />
          Add visit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record a visit</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="grid gap-4">
          <input type="hidden" name="petId" value={petId} />
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="type">Type</Label>
              <select id="type" name="type" className={fieldClass} defaultValue="checkup">
                <option value="checkup">Checkup</option>
                <option value="vaccination">Vaccination</option>
                <option value="illness">Illness</option>
                <option value="surgery">Surgery</option>
                <option value="follow-up">Follow-up</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="visitDate">Date</Label>
              <Input id="visitDate" name="visitDate" type="date" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="diagnosis">Diagnosis</Label>
            <Input id="diagnosis" name="diagnosis" placeholder="e.g. Otitis externa" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="notes">Clinical notes</Label>
            <Textarea id="notes" name="notes" />
          </div>
          <Button type="submit" disabled={pending}>
            {pending ? "Saving..." : "Save visit"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
