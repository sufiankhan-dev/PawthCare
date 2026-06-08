"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";

import { addMedicationAction, addVaccinationAction } from "@/app/app/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function useActionDialog(action: (fd: FormData) => Promise<void>) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await action(fd);
      setOpen(false);
    });
  }
  return { open, setOpen, pending, onSubmit };
}

export function AddVaccinationDialog({ petId }: { petId: string }) {
  const { open, setOpen, pending, onSubmit } =
    useActionDialog(addVaccinationAction);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus className="size-4" />
          Add vaccination
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add vaccination</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="grid gap-4">
          <input type="hidden" name="petId" value={petId} />
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="vname">Vaccine</Label>
            <Input id="vname" name="name" required placeholder="e.g. Rabies" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="administeredDate">Administered</Label>
              <DatePicker
                id="administeredDate"
                name="administeredDate"
                placeholder="Select date"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dueDate">Next due</Label>
              <DatePicker id="dueDate" name="dueDate" placeholder="Select date" />
            </div>
          </div>
          <Button type="submit" disabled={pending}>
            {pending ? "Saving..." : "Save"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AddMedicationDialog({ petId }: { petId: string }) {
  const { open, setOpen, pending, onSubmit } =
    useActionDialog(addMedicationAction);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus className="size-4" />
          Add medication
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add medication</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="grid gap-4">
          <input type="hidden" name="petId" value={petId} />
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="mname">Medication</Label>
            <Input id="mname" name="name" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dosage">Dosage</Label>
              <Input id="dosage" name="dosage" placeholder="e.g. 50mg" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="frequency">Frequency</Label>
              <Input id="frequency" name="frequency" placeholder="e.g. 2x daily" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="startDate">Start</Label>
              <DatePicker
                id="startDate"
                name="startDate"
                placeholder="Select date"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="reminderTime">Reminder</Label>
              <Input id="reminderTime" name="reminderTime" type="time" />
            </div>
          </div>
          <Button type="submit" disabled={pending}>
            {pending ? "Saving..." : "Save"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
