"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";

import { createPetAction } from "@/app/app/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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

export function AddPetDialog() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await createPetAction(fd);
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          Add pet
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a pet</DialogTitle>
          <DialogDescription>
            Create a digital passport for your companion.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="grid gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="species">Species</Label>
              <Select name="species" defaultValue="dog">
                <SelectTrigger id="species" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dog">Dog</SelectItem>
                  <SelectItem value="cat">Cat</SelectItem>
                  <SelectItem value="bird">Bird</SelectItem>
                  <SelectItem value="rabbit">Rabbit</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="breed">Breed</Label>
              <Input id="breed" name="breed" placeholder="e.g. Labrador" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sex">Sex</Label>
              <Select name="sex">
                <SelectTrigger id="sex" className="w-full">
                  <SelectValue placeholder="Unspecified" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="birthDate">Birth date</Label>
              <DatePicker
                id="birthDate"
                name="birthDate"
                placeholder="Select date"
                disableFuture
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="weightKg">Weight (kg)</Label>
              <Input
                id="weightKg"
                name="weightKg"
                type="number"
                step="0.1"
                min="0"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="allergies">Allergies</Label>
            <Input id="allergies" name="allergies" placeholder="Optional" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" placeholder="Optional" />
          </div>
          <Button type="submit" disabled={pending}>
            {pending ? "Saving..." : "Save pet"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
