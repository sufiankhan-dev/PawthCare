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
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

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
              <Select name="type" defaultValue="checkup">
                <SelectTrigger id="type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="checkup">Checkup</SelectItem>
                  <SelectItem value="vaccination">Vaccination</SelectItem>
                  <SelectItem value="illness">Illness</SelectItem>
                  <SelectItem value="surgery">Surgery</SelectItem>
                  <SelectItem value="follow-up">Follow-up</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="visitDate">Date</Label>
              <DatePicker
                id="visitDate"
                name="visitDate"
                placeholder="Select date"
                disableFuture
              />
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
