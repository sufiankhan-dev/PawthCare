"use client";

import { useState } from "react";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

export function toDateValue(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function formatLabel(date: Date) {
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function DatePicker({
  name,
  id,
  placeholder = "Pick a date",
  defaultDate,
  disablePast = false,
  disableFuture = false,
}: {
  name: string;
  id?: string;
  placeholder?: string;
  defaultDate?: Date;
  disablePast?: boolean;
  disableFuture?: boolean;
}) {
  const [date, setDate] = useState<Date | undefined>(defaultDate);
  const [open, setOpen] = useState(false);

  const disabled = disablePast
    ? { before: new Date() }
    : disableFuture
      ? { after: new Date() }
      : undefined;

  return (
    <>
      <input type="hidden" name={name} value={date ? toDateValue(date) : ""} />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            className={cn(
              "justify-start font-normal",
              !date && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="size-4" />
            {date ? formatLabel(date) : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(d) => {
              setDate(d);
              setOpen(false);
            }}
            disabled={disabled}
            autoFocus
          />
        </PopoverContent>
      </Popover>
    </>
  );
}
