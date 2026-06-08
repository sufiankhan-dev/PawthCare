"use client";

import { useState, useTransition } from "react";
import { CalendarPlus, CalendarIcon } from "lucide-react";

import { scheduleAppointmentAction } from "@/app/clinic/actions";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { Pet } from "@/lib/types";

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function formatDateLabel(date: Date) {
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function toLocalDateString(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function ScheduleAppointmentDialog({ patients }: { patients: Pet[] }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const [petId, setPetId] = useState<string>(patients[0]?.id ?? "");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState<string>("09:00");
  const [calendarOpen, setCalendarOpen] = useState(false);

  const scheduledAt = date ? `${toLocalDateString(date)}T${time}` : "";
  const canSubmit = Boolean(petId && scheduledAt);

  function resetForm() {
    setPetId(patients[0]?.id ?? "");
    setDate(undefined);
    setTime("09:00");
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await scheduleAppointmentAction(fd);
      setOpen(false);
      resetForm();
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button disabled={patients.length === 0}>
          <CalendarPlus className="size-4" />
          Schedule
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule appointment</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="grid gap-4">
          <input type="hidden" name="petId" value={petId} />
          <input type="hidden" name="scheduledAt" value={scheduledAt} />

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="patient-select">Patient</Label>
            <Select value={petId} onValueChange={setPetId}>
              <SelectTrigger id="patient-select" className="w-full">
                <SelectValue placeholder="Select a patient…" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Date</Label>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "justify-start font-normal",
                      !date && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="size-4" />
                    {date ? formatDateLabel(date) : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => {
                      setDate(d);
                      setCalendarOpen(false);
                    }}
                    disabled={{ before: new Date() }}
                    autoFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="reason">Reason</Label>
            <Input id="reason" name="reason" placeholder="e.g. Follow-up" />
          </div>
          <Button type="submit" disabled={pending || !canSubmit}>
            {pending ? "Scheduling..." : "Schedule"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
